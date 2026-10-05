export const STORAGE_KEY = "yks-speed-reading-v2";
export const LEGACY_KEY = "yks-speed-reading-learn-v1";
export const LESSON_IDS = ["groups", "returns", "focus", "voice"];
export const EXERCISE_IDS = ["groups", "lines", "focus", "returns", "paragraph"];
export const SPEEDS = [150, 200, 250, 300, 350, 400, 450];
const MAX_SESSIONS = 1000;
const finite = value => typeof value === "number" && Number.isFinite(value);
const dateValue = value => finite(value) && value >= 0 && value <= 8640000000000000;
export const wordCount = text => (String(text || "").match(/[\p{L}\p{N}]+(?:[’'\-][\p{L}\p{N}]+)*/gu) || []).length;
export const wordsPerMinute = (words, milliseconds) => finite(words) && words > 0 && finite(milliseconds) && milliseconds >= 1 && Number.isFinite(words * 60000 / milliseconds) ? Math.round(words * 60000 / milliseconds) : 0;
export function splitGroups(text, size = 3) {
  const words = String(text || "").trim().split(/\s+/u).filter(Boolean);
  const width = Math.max(1, Math.min(12, Math.round(size) || 3));
  const groups = [];
  for (let i = 0; i < words.length; i += width) groups.push(words.slice(i, i + width).join(" "));
  return groups;
}
export function gradeAnswers(questions, answers) {
  const correct = questions.reduce((total, question, index) => total + (Number.isInteger(answers[index]) && answers[index] === question.answer ? 1 : 0), 0);
  return {correct, wrong: questions.length - correct, total: questions.length, comprehension: questions.length ? Math.round(correct / questions.length * 100) : 0};
}
export function performanceFeedback(result) {
  if (result.readingMs < 5000) return {kind: "brief", title: "Daha dengeli bir ölçüm yapalım", message: "Okuma süresi 5 saniyeden kısa. Sonuç kaydedildi; bu ölçüm ortalamalara ve rekorlara katılmadı. Metni anlayarak yeniden dene."};
  if (result.comprehension < 75) return {kind: "review", title: "Önce anlamayı güçlendirelim", message: "Hız tek başına başarı ölçüsü değil. Bir sonraki egzersizde ritmi düşür; ana fikri ve ayrıntıları yakalamaya odaklan."};
  return {kind: "balanced", title: "Anlama ve ritim birlikte ilerliyor", message: "Bu metinde anlama oranını korudun. Birkaç farklı metinde de benzer sonuç aldıktan sonra istersen küçük bir hız artışı deneyebilirsin."};
}
export function createSession({kind, mode, passageId, words, readingMs, questionMs = 0, correct = 0, total = 0, targetWpm = 0}, now = Date.now(), id = globalThis.crypto?.randomUUID?.() || `${now}-${Math.random().toString(36).slice(2)}`) {
  return {id, kind, mode, passageId, at: now, words, readingMs, questionMs, correct, total, targetWpm, wpm: wordsPerMinute(words, readingMs), comprehension: total ? Math.round(correct / total * 100) : 0};
}
function cleanSession(value) {
  if (!value || typeof value !== "object" || typeof value.id !== "string" || !value.id || value.id.length > 100) return null;
  if (!["test", "exercise"].includes(value.kind) || typeof value.passageId !== "string" || !dateValue(value.at)) return null;
  if (!finite(value.words) || value.words <= 0 || value.words > 100000 || !finite(value.readingMs) || value.readingMs < 1 || value.readingMs > 86400000) return null;
  if (!finite(value.questionMs) || value.questionMs < 0 || value.questionMs > 86400000 || !Number.isInteger(value.total) || value.total < 0 || value.total > 10 || !Number.isInteger(value.correct) || value.correct < 0 || value.correct > value.total) return null;
  if (value.kind === "test" && (value.total < 3 || value.total > 5)) return null;
  if (value.kind === "exercise" && !EXERCISE_IDS.includes(value.mode)) return null;
  return createSession({kind: value.kind, mode: String(value.mode || "reading").slice(0, 30), passageId: value.passageId.slice(0, 100), words: value.words, readingMs: value.readingMs, questionMs: value.questionMs, correct: value.correct, total: value.total, targetWpm: SPEEDS.includes(value.targetWpm) ? value.targetWpm : 0}, value.at, value.id);
}
export function normalizeState(value, legacy = null) {
  const source = value && typeof value === "object" && !Array.isArray(value) ? value : {};
  const lessons = {};
  for (const id of LESSON_IDS) {
    const completed = source.lessons?.[id];
    if (dateValue(completed)) lessons[id] = completed;
    else if (Array.isArray(legacy?.done) && legacy.done.includes(id)) lessons[id] = 0;
  }
  const unique = new Map();
  for (const raw of Array.isArray(source.sessions) ? source.sessions : []) {
    const session = cleanSession(raw);
    if (session) unique.set(session.id, session);
  }
  const activity = new Map();
  for (const at of [...Object.values(lessons), ...(Array.isArray(source.lessonActivity) ? source.lessonActivity : [])]) {
    if (dateValue(at) && at > 0) activity.set(localDayKey(at), at);
  }
  return {version: 2, lessons, lessonActivity: [...activity.values()].sort((a, b) => a - b).slice(-1000), sessions: [...unique.values()].sort((a, b) => a.at - b.at).slice(-MAX_SESSIONS)};
}
function parse(value) {try {return JSON.parse(value);} catch {return null;}}
export function createStore(storage) {
  let memory = normalizeState(null), persistent = true;
  function read() {
    try {
      const latest = normalizeState(parse(storage.getItem(STORAGE_KEY)), parse(storage.getItem(LEGACY_KEY)));
      // Merge unsaved changes if storage was temporarily unavailable.
      memory = persistent ? latest : normalizeState({lessons: {...latest.lessons, ...memory.lessons}, lessonActivity: [...latest.lessonActivity, ...memory.lessonActivity], sessions: [...latest.sessions, ...memory.sessions]});
      return memory;
    } catch {persistent = false; return memory;}
  }
  function write(mutate) {
    const next = mutate(read()); memory = normalizeState(next);
    try {storage.setItem(STORAGE_KEY, JSON.stringify(memory)); persistent = true;} catch {persistent = false;}
    return memory;
  }
  read();
  return {
    read,
    get persistent() {return persistent;},
    completeLesson(id, now = Date.now()) {return write(state => LESSON_IDS.includes(id) ? {...state, lessons: {...state.lessons, [id]: state.lessons[id] || now}, lessonActivity: [...state.lessonActivity, now]} : state);},
    addSession(session) {return write(state => ({...state, sessions: [...state.sessions, session]}));}
  };
}
export function localDayKey(timestamp) {
  const date = new Date(timestamp);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
function previousDay(timestamp) {const date = new Date(timestamp); date.setDate(date.getDate() - 1); return date.getTime();}
export function dailyStreak(state, now = Date.now()) {
  const days = new Set([...state.sessions.map(session => session.at), ...Object.values(state.lessons), ...(state.lessonActivity || [])].filter(at => at > 0 && at <= now).map(localDayKey));
  let cursor = days.has(localDayKey(now)) ? now : previousDay(now), count = 0;
  while (days.has(localDayKey(cursor))) {count++; cursor = previousDay(cursor);}
  return count;
}
export function summarize(state, days = 7, now = Date.now()) {
  const start = new Date(now); start.setHours(0, 0, 0, 0); start.setDate(start.getDate() - (days === 30 ? 29 : 6));
  const sessions = state.sessions.filter(session => session.at >= start.getTime() && session.at <= now);
  const tests = sessions.filter(session => session.kind === "test" && session.readingMs >= 5000);
  const average = values => values.length ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length) : null;
  const questionCount = tests.reduce((sum, session) => sum + session.total, 0);
  const qualified = state.sessions.filter(session => session.kind === "test" && session.readingMs >= 5000 && session.comprehension >= 75 && session.at <= now);
  const record = [...qualified].sort((a, b) => b.wpm - a.wpm)[0] || null;
  const bestBalance = [...qualified].sort((a, b) => b.wpm * (b.comprehension / 100) ** 2 - a.wpm * (a.comprehension / 100) ** 2)[0] || null;
  return {days, tests, sessions, averageWpm: average(tests.map(row => row.wpm)), averageComprehension: average(tests.map(row => row.comprehension)), averageReadingMs: average(tests.map(row => row.readingMs)), average100WordMs: average(tests.map(row => normalizedReadingMs(row)).filter(value => value !== null)), averageQuestionMs: questionCount ? Math.round(tests.reduce((sum, row) => sum + row.questionMs, 0) / questionCount) : null, record, bestBalance, streak: dailyStreak(state, now), completedLessons: Object.keys(state.lessons).length, exerciseCount: sessions.filter(row => row.kind === "exercise").length};
}
export function normalizedReadingMs(session, words = 100) {
  if (!session || !finite(session.words) || session.words <= 0 || !finite(session.readingMs) || session.readingMs < 1 || !finite(words) || words <= 0) return null;
  return Math.round(session.readingMs / session.words * words);
}
export function recommendedPace(state, now = Date.now()) {
  const valid = state.sessions.filter(row => row.kind === "test" && row.readingMs >= 5000 && row.at <= now).slice(-3);
  if (!valid.length) return {wpm: 200, label: "Başlangıç temposu", reason: "İlk ölçümden önce 200 kelime/dk ile rahat bir ritim kur.", comprehension: null, samples: 0};
  const average = values => Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
  const averageWpm = average(valid.map(row => row.wpm)), comprehension = average(valid.map(row => row.comprehension));
  let target = Math.round(averageWpm / 50) * 50;
  if (comprehension >= 85 && valid.length >= 2) target += 50;
  else if (comprehension < 75) target -= 50;
  target = Math.max(150, Math.min(450, target));
  const label = comprehension < 75 ? "Anlama odaklı tempo" : comprehension >= 85 ? "Bir üst ritim" : "Denge temposu";
  const reason = comprehension < 75
    ? `Son ${valid.length} testte anlama %${comprehension}. Önce ritmi biraz düşürüp anlamayı güçlendir.`
    : comprehension >= 85
      ? `Son ${valid.length} testte anlama %${comprehension}. Küçük bir hız artışını kontrollü deneyebilirsin.`
      : `Son ${valid.length} testte anlama %${comprehension}. Şimdilik bu tempoda dengeyi koru.`;
  return {wpm: target, label, reason, comprehension, samples: valid.length};
}
export function dailyTraining(state, now = Date.now()) {
  const key = localDayKey(now), today = state.sessions.filter(row => localDayKey(row.at) === key && row.at <= now);
  const warmup = today.some(row => row.kind === "exercise" && ["groups", "lines", "focus", "returns"].includes(row.mode));
  const paragraph = today.some(row => row.kind === "exercise" && row.mode === "paragraph");
  const test = today.some(row => row.kind === "test" && row.readingMs >= 5000);
  const steps = [
    {id: "warmup", label: "Ritim ısınması", detail: "Kelime gruplarıyla 2–3 dakika", done: warmup},
    {id: "paragraph", label: "Paragraf turu", detail: "Kendi hızında oku + ana fikir", done: paragraph},
    {id: "test", label: "Anlama testi", detail: "4 soruyla hız + anlama ölç", done: test}
  ];
  return {date: key, steps, completed: steps.filter(step => step.done).length, total: steps.length};
}
export function weeklyTrend(state, now = Date.now(), days = 7) {
  const count = Math.max(1, Math.min(30, Math.round(days) || 7)), rows = [];
  const dayStart = new Date(now);dayStart.setHours(0, 0, 0, 0);
  for (let offset = count - 1; offset >= 0; offset--) {
    const date = new Date(dayStart);date.setDate(date.getDate() - offset);
    const key = localDayKey(date.getTime()), sessions = state.sessions.filter(row => localDayKey(row.at) === key && row.at <= now);
    const tests = sessions.filter(row => row.kind === "test" && row.readingMs >= 5000);
    const average = values => values.length ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length) : null;
    rows.push({date: key, label: date.toLocaleDateString("tr-TR", {weekday: "short"}), sessions: sessions.length, tests: tests.length, wpm: average(tests.map(row => row.wpm)), comprehension: average(tests.map(row => row.comprehension))});
  }
  return rows;
}
export function comparePrevious(state, result) {
  const previous = [...state.sessions].reverse().find(row => row.kind === "test" && row.id !== result.id && row.at <= result.at && row.readingMs >= 5000);
  return previous && result.readingMs >= 5000 ? {previous, wpm: result.wpm - previous.wpm, comprehension: result.comprehension - previous.comprehension} : null;
}
export function nextPassage(passages, sessions, kind) {
  const previous = [...sessions].reverse().find(row => row.kind === kind);
  const index = passages.findIndex(row => row.id === previous?.passageId);
  return passages[(index + 1) % passages.length];
}
// A monotonic, pausable clock: background time and lab switches never inflate results.
export function createClock(now = () => performance.now()) {
  let accumulated = 0, started = null;
  return {
    start() {if (started === null) started = now();},
    pause() {if (started !== null) {accumulated += Math.max(0, now() - started); started = null;}},
    elapsed() {return accumulated + (started === null ? 0 : Math.max(0, now() - started));},
    get running() {return started !== null;}
  };
}
export function pacePosition(groups, elapsedMs, wpm) {
  let end = 0;
  for (let index = 0; index < groups.length; index++) {
    end += wordCount(groups[index]) * 60000 / wpm;
    if (elapsedMs < end) return {index, finished: false};
  }
  return {index: Math.max(0, groups.length - 1), finished: true};
}
