import {LESSONS, PASSAGES, EXERCISES} from "./content.mjs?v=2.4.0";
import {createStore, accountStorage, STORAGE_KEY, SPEEDS, wordCount, splitGroups, createClock, pacePosition, gradeAnswers, createSession, performanceFeedback, comparePrevious, summarize, nextPassage, recommendedPace, recommendedDifficulty, adaptivePassage, questionSkillBreakdown, dailyTraining, weeklyTrend, weeklyProgress, periodDelta} from "./model.mjs?v=2.4.0";
const escape = value => String(value ?? "").replace(/[&<>"']/g, char => ({"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"}[char]));
const seconds = ms => `${(ms / 1000).toFixed(1).replace(".", ",")} sn`;
const timerLabel = ms => {const value = Math.floor(ms / 1000); return `${Math.floor(value / 60)}:${String(value % 60).padStart(2, "0")}`;};
const signed = number => `${number > 0 ? "+" : ""}${number}`;
const difficultyLabel = value => ({medium: "Orta", hard: "Zor", expert: "Çok zor"}[value] || "Standart");
const button = (action, label, attributes = "") => `<button type="button" data-sr-action="${action}" ${attributes}>${label}</button>`;
const STEP_HINT = {warmup: "2–3 dk", paragraph: "kendi hızında", test: "5 soru"};
const delta = (value, unit = "", lowerIsBetter = false) => value === null || value === 0 ? "" : `<em class="${(value > 0) !== lowerIsBetter ? "is-up" : "is-down"}">${value > 0 ? "▲" : "▼"} ${String(Math.abs(value)).replace(".", ",")}${unit}</em>`;
const choices = (question, selected, name) => `<fieldset class="sr-choices"><legend>${escape(question.prompt || question.question)}</legend>${question.options.map((option, index) => `<label><input type="radio" name="${name}" value="${index}" ${selected === index ? "checked" : ""}><span>${escape(option)}</span></label>`).join("")}</fieldset>`;

export function createReadingRuntime() {
  let local; try {local = window.localStorage;} catch {local = {getItem() {throw new Error("Storage unavailable");}, setItem() {throw new Error("Storage unavailable");}};}
  // v2.4: kayıtlar hesap verisinde (S.speedReading); cihazdaki eski kayıtlar bir kez hesaba taşınır.
  const storage = window.YKSLegacyState?.readState ? accountStorage(local, window.YKSLegacyState) : local;
  const store = createStore(storage);
  try {if (storage.pending?.()) store.sync();} catch {}
  let root = null, section = "learn", lesson = null, lessonStep = -1, lessonAnswer = null, lessonChecked = false, lessonLayout = "groups", peeks = 0, focusVisible = false;
  let focusTimer = null, tickTimer = null, session = null, exerciseMode = "groups", speed = recommendedPace(store.read()).wpm, range = 7, notice = "", previousState = null;
  const state = () => store.read();
  function visible() {return root?.isConnected && !document.hidden && !root.closest("[hidden]") && root.getClientRects().length > 0;}
  function stopTick() {clearInterval(tickTimer); tickTimer = null;}
  function clearFocus() {clearTimeout(focusTimer); focusTimer = null; focusVisible = false;}
  function abandon() {stopTick(); clearFocus(); session?.clock.pause(); session?.questionClock.pause(); session = null;}
  function showNotice(message) {notice = message; const el = root?.querySelector(".sr-notice"); if (el) {el.textContent = message; el.hidden = !message;}}
  function render() {
    if (!root) return;
    const saved = state(); root.classList.add("sr-app");
    root.innerHTML = `${renderStrip(saved)}${syncNote()}<div class="sr-navigation" role="tablist" aria-label="Hızlı okuma bölümleri">${[["learn", "Bugün"], ["exercise", "Egzersiz"], ["test", "Test"], ["progress", "Gelişim"]].map(([key, label]) => `<button type="button" role="tab" id="sr-tab-${key}" aria-controls="sr-content" aria-selected="${section === key}" tabindex="${section === key ? "0" : "-1"}" data-sr-section="${key}">${label}</button>`).join("")}</div><p class="sr-storage-warning" role="status" ${store.persistent ? "hidden" : ""}>Tarayıcı kaydetmeye izin vermedi. İlerlemen bu oturumda duruyor; sayfayı kapatmadan önce depolama iznini kontrol et.</p><p class="sr-notice" role="status" ${notice ? "" : "hidden"}>${escape(notice)}</p><div id="sr-content" class="sr-content" role="tabpanel" aria-labelledby="sr-tab-${section}" tabindex="0">${section === "learn" ? renderToday(saved) : section === "progress" ? renderProgress(saved) : renderTraining(saved)}</div>`;
  }
  /* v2.4 üst şerit: bugünkü plan, önerilen tempo ve haftalık hedef tek bakışta. */
  function renderStrip(saved) {
    const plan = dailyTraining(saved), pace = recommendedPace(saved), week = weeklyProgress(saved);
    return `<div class="sr-strip" aria-label="Hızlı okuma durumu"><span class="is-today"><b>${plan.completed}/${plan.total}</b>bugün</span><span><b>${pace.wpm}</b>kelime/dk</span><span${week.done ? ' class="is-done"' : ""}><b>${week.days}/${week.goal}</b>bu hafta</span></div>`;
  }
  function syncNote() {
    if (!storage.account) return "";
    const state = String(document.getElementById("cloudSyncBox")?.dataset.state || "signedout");
    return state === "signedout" ? '<p class="sr-sync is-local">Kayıtların bu cihazda · hesap açarsan eşitlenir</p>' : '<p class="sr-sync">✓ Kayıtların hesabınla eşitleniyor</p>';
  }
  /* "Bugün": sıradaki adım tek düğme, üç adım küçük gösterge, dört ders kısa liste. */
  function renderToday(saved) {
    if (lesson) return renderLesson(saved);
    const plan = dailyTraining(saved), next = plan.steps.find(step => !step.done), done = Object.keys(saved.lessons).length;
    const hero = next
      ? `<section class="sr-next"><span class="sr-eyebrow">SIRADAKİ ADIM · ${plan.completed + 1}/${plan.total}</span><h4>${escape(next.label)}</h4><p>${escape(next.detail)}</p>${button(`daily-${next.id}`, "Başla", 'class="sr-primary"')}</section>`
      : `<section class="sr-next is-done"><span class="sr-eyebrow">BUGÜNÜN ANTRENMANI</span><h4>Bugünkü üç adım tamam ✓</h4><p>İstersen bir adımı tekrarla ya da gelişimine bak.</p>${button("open-progress", "Gelişimimi gör", 'class="sr-primary"')}</section>`;
    const steps = `<div class="sr-daily-steps">${plan.steps.map(step => `<button type="button" data-sr-action="daily-${step.id}" data-done="${step.done}"${next?.id === step.id ? ' data-next="true"' : ""}><b>${step.done ? "✓ " : ""}${escape(step.label)}</b><small>${step.done ? "tamam · tekrarla" : next?.id === step.id ? "sırada" : STEP_HINT[step.id]}</small></button>`).join("")}</div>`;
    const lessons = LESSONS.map(row => {
      const complete = Object.hasOwn(saved.lessons, row.id);
      return `<button type="button" class="sr-lesson-row" data-sr-lesson="${row.id}"><span class="sr-lesson-number" data-done="${complete}">${complete ? "✓" : row.number}</span><span><b>${escape(row.title)}</b><small>${escape(row.subtitle)}</small></span><em>${complete ? "tamam" : row.minutes}</em></button>`;
    }).join("");
    return `${hero}${steps}<h5 class="sr-list-title">Dersler · ${done}/4</h5><div class="sr-lesson-list">${lessons}</div>`;
  }
  function renderLesson(saved) {
    const row = lesson, length = row.rounds?.length || row.groups.length, completePractice = lessonStep >= length;
    let demo = "";
    if (row.id === "focus") {
      const current = row.rounds[Math.min(Math.max(0, lessonStep - 1), length - 1)];
      demo = `<div class="sr-focus-field" aria-label="Odak çalışması">${focusVisible ? current.map((word, i) => `<span class="${i === 1 ? "sr-focus-center" : ""}">${escape(word)}</span>`).join("") : '<span aria-hidden="true">·</span><span class="sr-focus-center">+</span><span aria-hidden="true">·</span>'}</div><p class="sr-caption">${Math.max(0, Math.min(lessonStep, length))} / ${length} gösterim · Ortadaki kelimeye bak.</p>${button("lesson-focus", completePractice ? "Üç turu yeniden göster" : "Kelimeleri göster", focusVisible ? "disabled" : "")}`;
    } else if (row.id === "returns") {
      demo = `<div class="sr-practice-text">${lessonStep < 0 ? "Hazır olduğunda ilk satırı aç." : completePractice ? "Şimdi metne bakmadan ana fikri hatırla." : escape(row.groups[lessonStep])}</div><p class="sr-caption">Geri bakış: ${peeks} · Gerekli bir kontrol hata değildir.</p><div class="sr-actions">${button("lesson-next", lessonStep < 0 ? "İlk satırı aç" : completePractice ? "Yeniden oku" : "Sonraki satır")}${lessonStep > 0 && !completePractice ? button("lesson-peek", "Önceki satıra bak") : ""}</div><p class="sr-peek" role="status" hidden></p>`;
    } else {
      const parts = lessonLayout === "words" ? row.groups.join(" ").split(/\s+/) : row.groups;
      demo = `${row.id === "groups" ? `<div class="sr-actions" role="group" aria-label="Metin görünümü">${button("layout-words", "Tek kelimeler", `aria-pressed="${lessonLayout === "words"}"`)}${button("layout-groups", "Anlam grupları", `aria-pressed="${lessonLayout === "groups"}"`)}</div>` : ""}<div class="sr-word-demo" aria-label="Örnek okuma">${completePractice ? '<p>Şimdi metne bakmadan ana fikri hatırla.</p>' : parts.map((part, index) => `<span class="${lessonStep === index && lessonLayout === "groups" ? "is-current" : ""}">${escape(part)}</span>`).join("")}</div>${button("lesson-next", lessonStep < 0 ? "Grupları takip et" : completePractice ? "Yeniden oku" : "Sonraki grup")}`;
    }
    return `<article class="sr-lesson-detail"><div class="sr-section-heading"><div><span class="sr-eyebrow">DERS ${row.number} · ${row.minutes}</span><h4>${escape(row.title)}</h4></div>${button("close-lesson", "Kapat", `aria-label="${escape(row.title)} dersini kapat"`)}</div><p>${escape(row.explanation)}</p><h5>Birlikte deneyelim</h5><p>${escape(row.instructions)}</p><div class="sr-practice">${demo}</div>${completePractice && !focusVisible ? `<form class="sr-lesson-question">${choices(row, lessonAnswer, "sr-lesson-answer")}${button("lesson-check", "Yanıtı kontrol et", lessonAnswer === null ? "disabled" : "")}</form>` : ""}${lessonChecked ? `<div class="sr-feedback" role="status"><b>${lessonAnswer === row.answer ? "Ana fikri yakaladın." : "Bir kez daha, rahat bir ritimle."}</b><p>${lessonAnswer === row.answer ? "Şimdi kısa pekiştirmeyi yapabilirsin." : `Beklenen yanıt: ${escape(row.options[row.answer])}. Anlama netleşmeden hızını artırmana gerek yok.`}</p></div><div class="sr-reflection"><h5>Bir dakika kendin uygula</h5><p>${escape(row.reflection)}</p></div>${button("complete-lesson", Object.hasOwn(saved.lessons, row.id) ? "Dersi yeniden tamamladım" : "Dersi tamamladım", 'class="sr-primary"')}` : ""}</article>`;
  }
  function choosePassage(kind) {const saved = state(); return kind === "test" ? adaptivePassage(PASSAGES, saved) : nextPassage(PASSAGES, saved.sessions, kind);}
  function questionTypes(passage) {return [...new Set(passage.questions.map(row => row.type))];}
  function resultSkillReport(questions, answers) {
    const wrong = questions.filter((question, index) => answers[index] !== question.answer);
    if (!wrong.length) return '<div class="sr-skill-report is-strong"><b>Soru türü analizi</b><p>Bu turda bütün soru türlerini doğru yaptın. Bir sonraki testte hızını artırırken aynı doğruluğu korumaya çalış.</p></div>';
    const counts = new Map(); wrong.forEach(question => counts.set(question.type, (counts.get(question.type) || 0) + 1));
    const weak = [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([type]) => type);
    return `<div class="sr-skill-report"><b>Tekrar edilmesi iyi olacak tür</b><p>${weak.map(escape).join(" · ")}</p><small>Yanlış yaptığın sorularda önce seçenek elemek yerine metindeki gerekçeyi bulmaya çalış.</small></div>`;
  }
  function renderTraining(saved) {
    if (session?.phase === "result") return renderResult(saved);
    if (session?.phase === "reading") return renderReading();
    if (session?.phase === "questions") return renderQuestions();
    if (section === "test") {
      const passage = choosePassage("test"), seen = saved.sessions.some(row => row.kind === "test" && row.passageId === passage.id), difficulty = recommendedDifficulty(saved);
      const types = questionTypes(passage), last = [...saved.sessions].reverse().find(row => row.kind === "test" && row.readingMs >= 5000);
      return `<div class="sr-test-cover"><span class="sr-eyebrow">ADAPTİF SEVİYE · ${escape(difficulty.label.toLocaleUpperCase("tr-TR"))}</span><h4>${escape(passage.title)}</h4><p>${escape(passage.topic)} · ${wordCount(passage.text)} kelime · ${passage.questions.length} YKS tipi anlama sorusu</p><div class="sr-test-skills" aria-label="Bu testte ölçülen soru türleri">${types.map(type => `<span>${escape(type)}</span>`).join("")}</div>${last ? `<p class="sr-last-test">Son test: <b>${last.wpm} kelime/dk</b> · %${last.comprehension} anlama</p>` : ""}${seen ? '<p class="sr-caption">Bu metni daha önce okudun. Tanıdıklık sonucu etkileyebilir; karşılaştırmayı bir çalışma kaydı olarak değerlendir.</p>' : ""}${button("start-test", "Metni aç ve başla", 'class="sr-primary"')}<small>${escape(difficulty.reason)} Metin açılınca süre başlar; “Bitirdim” deyince metin kapanır ve sorular gelir.</small></div>`;
    }
    const paragraph = exerciseMode === "paragraph", recommended = recommendedPace(saved).wpm, index = SPEEDS.indexOf(speed);
    return `<h5 class="sr-list-title">Egzersiz seç</h5><div class="sr-exercise-grid">${EXERCISES.map(row => `<button type="button" data-sr-mode="${row.id}" aria-pressed="${exerciseMode === row.id}"><b>${row.title}</b><small>${row.description}</small></button>`).join("")}</div><div class="sr-training-controls"><h5 class="sr-list-title" id="sr-speed-label">Gösterim hızı</h5><div class="sr-tempo" role="group" aria-labelledby="sr-speed-label">${button("speed-down", "−", `aria-label="Hızı azalt" ${paragraph || index <= 0 ? "disabled" : ""}`)}<output id="sr-speed" aria-live="polite">${paragraph ? "Kendi hızın" : speed}<small>${paragraph ? "bu modda süreyi sen belirlersin" : `kelime/dk · önerilen ${recommended}`}</small></output>${button("speed-up", "+", `aria-label="Hızı artır" ${paragraph || index >= SPEEDS.length - 1 ? "disabled" : ""}`)}</div>${button("start-exercise", "Egzersizi başlat", 'class="sr-primary"')}</div><p class="sr-caption">${paragraph ? "Bitirdiğinde süre ve kelime/dakika hesaplanır." : "Gösterim temposu, okuduğunu anladığın anlamına gelmez; tur sonunda anlama sorusuyla kontrol et."}</p>`;
  }
  function renderReading() {
    const current = session, paused = !current.clock.running;
    return `<div class="sr-progress"><div class="sr-section-heading"><div><span class="sr-eyebrow">${current.kind === "test" ? "OKUMA TESTİ" : escape(EXERCISES.find(row => row.id === current.mode)?.title || "EGZERSİZ")}</span><h4>${escape(current.passage.title)}</h4></div><output class="sr-clock" aria-label="Geçen süre">${timerLabel(current.clock.elapsed())}</output></div>${current.targetWpm ? `<p class="sr-caption">Gösterim: ${current.targetWpm} kelime/dk · ${wordCount(current.passage.text)} kelime</p>` : ""}<div class="sr-reading-stage ${current.mode === "paragraph" || current.kind === "test" ? "is-paragraph" : ""}">${paused ? `<div class="sr-paused"><b>Okuma duraklatıldı</b><p>Süre işlemiyor. Hazır olduğunda kaldığın yerden devam et.</p>${button("resume", "Devam et", 'class="sr-primary"')}</div>` : `<div class="sr-reading-text">${readingMarkup()}</div>`}</div><div class="sr-actions">${paused ? "" : button("pause", "Duraklat")}${current.mode === "paragraph" || current.kind === "test" ? button("finish-reading", "Bitirdim", `class="sr-primary" ${paused ? "disabled" : ""}`) : ""}${button("cancel", "Çalışmayı bırak")}</div><p class="sr-caption">Başka sekmeye veya uygulama bölümüne geçersen süre durur. Yarım bırakılan çalışma sonuçlara eklenmez.</p>`;
  }
  function readingMarkup() {
    if (session.kind === "test" || session.mode === "paragraph") return `<p class="sr-passage">${escape(session.passage.text)}</p>`;
    const index = Math.max(0, session.position), group = session.groups[index] || "";
    if (session.mode === "lines") return `<div class="sr-lines">${session.groups.map((line, i) => `<p class="${i === index ? "is-current" : ""}">${escape(line)}</p>`).join("")}</div>`;
    if (session.mode === "focus") {const words = group.split(/\s+/), center = Math.floor(words.length / 2); return `<div class="sr-focus-field">${words.map((word, i) => `<span class="${i === center ? "sr-focus-center" : ""}">${escape(word)}</span>`).join("")}</div><p class="sr-caption">Merkeze bak, yanındaki kelimeleri fark et.</p>`;}
    return `<p class="sr-paced-group">${escape(group)}</p>${session.mode === "returns" ? '<p class="sr-caption">Önceki grup kapandı. Ana fikri takip et.</p>' : ""}<progress value="${index + 1}" max="${session.groups.length}" aria-label="Metinde ilerleme"></progress>`;
  }
  function questionsFor(current) {return current.kind === "test" ? current.passage.questions : [current.passage.questions.find(row => row.type === "Ana düşünce") || current.passage.questions[2]];}
  function renderQuestions() {
    const current = session, questions = questionsFor(current), q = questions[current.questionIndex];
    if (!current.questionClock.running) return `<div class="sr-paused"><h4>Soru süresi duraklatıldı</h4><p>Hazır olduğunda ${current.questionIndex + 1}. sorudan devam et.</p>${button("resume", "Devam et", 'class="sr-primary"')}${button("cancel", "Çalışmayı bırak")}</div>`;
    return `<div class="sr-section-heading"><div><span class="sr-eyebrow">${current.questionIndex + 1} / ${questions.length} · ${escape(q.type)}</span><h4>Metindeki ilişkiyi yakala</h4></div><output class="sr-clock" aria-label="Soru süresi">${timerLabel(current.questionClock.elapsed())}</output></div><p class="sr-caption">Metin kapandı. Seçenekler yakın olabilir; “hangisi kulağa doğru geliyor?” yerine metnin gerçekten neyi desteklediğini düşün.</p><form class="sr-test-question">${choices(q, current.answers[current.questionIndex], "sr-test-answer")}<div class="sr-actions">${button("next-question", current.questionIndex === questions.length - 1 ? "Sonucumu gör" : "Sonraki soru", `class="sr-primary" ${Number.isInteger(current.answers[current.questionIndex]) ? "" : "disabled"}`)}${button("pause", "Duraklat")}${button("cancel", "Çalışmayı bırak")}</div></form>`;
  }
  function metric(label, value) {return `<div class="sr-metric"><span>${label}</span><strong>${value ?? "—"}</strong></div>`;}
  function renderResult(saved) {
    const result = session.result, feedback = performanceFeedback(result), comparison = result.kind === "test" ? comparePrevious(previousState || saved, result) : null, questions = questionsFor(session);
    return `<div class="sr-result-heading" data-sr-result="${feedback.kind}"><span class="sr-eyebrow">${result.kind === "test" ? "TEST TAMAMLANDI" : "EGZERSİZ TAMAMLANDI"}</span><h4>${feedback.title}</h4><p>${feedback.message}</p></div><div class="sr-metric-grid">${metric("Kelime / dk", result.wpm)}${metric("Anlama", `%${result.comprehension}`)}${metric("Okuma süresi", seconds(result.readingMs))}${metric("Doğru / yanlış", `${result.correct} / ${result.total - result.correct}`)}${metric("Soru başına", seconds(result.questionMs / result.total))}${metric(result.kind === "test" ? "Zorluk" : "Kelime", result.kind === "test" ? difficultyLabel(result.difficulty) : result.words)}</div>${result.kind === "test" ? resultSkillReport(questions, session.answers) : ""}${comparison ? `<p class="sr-comparison">Önceki teste göre <b>${signed(comparison.wpm)} kelime/dk</b> · anlama <b>${signed(comparison.comprehension)} puan</b>. Metinler farklı olduğunda sonuçlar da değişebilir.</p>` : `<p class="sr-caption">${result.kind === "test" ? "Karşılaştırma için en az iki geçerli test gerekir." : "Gösterim hızı bir tempo ayarıdır; tek anlama sorusu kapsamlı bir testin yerini tutmaz."}</p>`}<details class="sr-answer-review"><summary>Yanıtlarımı incele</summary>${questions.map((q, index) => `<div data-correct="${session.answers[index] === q.answer}"><b>${index + 1}. ${escape(q.prompt)}</b><p>Senin yanıtın: ${escape(q.options[session.answers[index]])}</p><p>Beklenen: ${escape(q.options[q.answer])}</p><small>${escape(q.explanation)}</small></div>`).join("")}</details><div class="sr-actions">${button("new-session", result.kind === "test" ? "Yeni test" : "Yeni egzersiz", 'class="sr-primary"')}${button("open-progress", "Gelişimimi gör")}</div>`;
  }
  function trendChart(trend) {
    const slot = 300 / trend.length, max = Math.max(1, ...trend.map(row => row.wpm || 0));
    const bars = trend.map((row, i) => {const h = row.wpm ? Math.max(6, Math.round(row.wpm / max * 70)) : 2; return `<rect x="${(i * slot + slot * .2).toFixed(1)}" y="${85 - h}" width="${(slot * .6).toFixed(1)}" height="${h}" rx="3" class="${row.wpm ? "is-on" : ""}"><title>${escape(row.date)}: ${row.wpm ? `${row.wpm} kelime/dk · %${row.comprehension} anlama` : "test yok"}</title></rect>`;}).join("");
    const points = trend.map((row, i) => row.comprehension === null ? null : [(i * slot + slot / 2).toFixed(1), (85 - row.comprehension * .7).toFixed(1)]).filter(Boolean);
    const line = points.length > 1 ? `<polyline class="sr-chart-line" points="${points.map(point => point.join(",")).join(" ")}"/>` : "";
    const dots = points.map(([x, y]) => `<circle class="sr-chart-dot" cx="${x}" cy="${y}" r="2.6"/>`).join("");
    const labels = trend.length <= 7 ? trend.map((row, i) => `<text x="${(i * slot + slot / 2).toFixed(1)}" y="98" text-anchor="middle">${escape(row.label)}</text>`).join("") : "";
    return `<div class="sr-chart"><div class="sr-chart-legend"><span class="is-speed">hız</span><span class="is-comp">anlama</span></div><svg viewBox="0 0 300 100" role="img" aria-label="Günlük test hızı ve anlama grafiği">${bars}${line}${dots}${labels}</svg></div>`;
  }
  /* v2.4 Gelişim: haftalık hedef, 3 ana ölçüm ve fark, tek grafik, rekorlar, son çalışmalar; ayrıntılar katlanır. */
  function renderProgress(saved) {
    const data = summarize(saved, range), week = weeklyProgress(saved), change = periodDelta(saved, range), recommendation = recommendedPace(saved), difficulty = recommendedDifficulty(saved), skills = questionSkillBreakdown(saved, 30);
    const goal = `<section class="sr-goal"><div class="sr-goal-head"><div><b>Bu hafta ${week.days}/${week.goal} antrenman günü</b><small>Egzersiz, test ya da ders yaptığın her gün sayılır.</small></div><div class="sr-goal-edit" role="group" aria-label="Haftalık hedef">${button("goal-down", "−", `aria-label="Hedefi azalt" ${week.goal <= 2 ? "disabled" : ""}`)}<span>${week.goal} gün</span>${button("goal-up", "+", `aria-label="Hedefi artır" ${week.goal >= 7 ? "disabled" : ""}`)}</div></div><div class="sr-goal-bar" role="progressbar" aria-label="Haftalık hedef" aria-valuemin="0" aria-valuemax="${week.goal}" aria-valuenow="${Math.min(week.days, week.goal)}"><i style="width:${Math.min(100, Math.round(week.days / week.goal * 100))}%"></i></div></section>`;
    if (!saved.sessions.length) return `${goal}<div class="sr-empty"><b>İlk testi çöz, gelişimin burada görünsün.</b><p>Hız ve anlama birlikte ölçülür; birkaç testten sonra eğilimin ortaya çıkar.</p>${button("first-test", "Teste başla", 'class="sr-primary"')}</div>`;
    const kpi = (value, label, extra) => `<div class="sr-kpi"><strong>${value ?? "—"}</strong><span>${label}</span>${extra}</div>`;
    const recent = [...saved.sessions].reverse().slice(0, 12), row = item => `<li><div><b>${item.kind === "test" ? "Anlama testi" : EXERCISES.find(x => x.id === item.mode)?.title || "Egzersiz"}</b><small>${new Date(item.at).toLocaleDateString("tr-TR", {day: "numeric", month: "short"})} · ${escape(PASSAGES.find(x => x.id === item.passageId)?.title || "Okuma")}</small></div><div><b>${item.wpm} kelime/dk</b><small>%${item.comprehension} anlama${item.readingMs < 5000 ? " · çok kısa ölçüm" : ""}</small></div></li>`;
    const skillPanel = `<section class="sr-skill-progress"><div class="sr-skill-progress-head"><div><span class="sr-eyebrow">SORU TÜRÜ PERFORMANSI</span><h5>Son 30 gün</h5></div></div>${skills.length ? skills.map(item => `<div class="sr-skill-row"><div><b>${escape(item.type)}</b><small>${item.correct}/${item.total} doğru</small></div><div class="sr-skill-meter"><i style="width:${item.accuracy}%"></i></div><strong>%${item.accuracy}</strong></div>`).join("") : '<p class="sr-caption">Test çözdükçe soru türlerine göre doğruluğun burada birikir.</p>'}</section>`;
    return `${goal}<div class="sr-section-heading"><h4>Son ${range} gün</h4><div class="sr-range" role="group" aria-label="Gelişim dönemi">${button("range-7", "7 gün", `aria-pressed="${range === 7}"`)}${button("range-30", "30 gün", `aria-pressed="${range === 30}"`)}</div></div>
      <div class="sr-kpis">${kpi(data.averageWpm, "kelime/dk", delta(change.wpm))}${kpi(data.averageComprehension === null ? null : `%${data.averageComprehension}`, "anlama", delta(change.comprehension))}${kpi(data.average100WordMs === null ? null : seconds(data.average100WordMs), "100 kelime okuma", delta(change.per100 === null ? null : Math.round(change.per100 / 100) / 10, " sn", true))}</div>
      ${trendChart(weeklyTrend(saved, Date.now(), range))}
      <ol class="sr-history sr-records-list"><li><div><b>Hız rekoru</b><small>en az %75 anlamayla</small></div><div><b>${data.record ? `${data.record.wpm} kelime/dk` : "Henüz yok"}</b><small>${data.record ? `%${data.record.comprehension} anlama` : "%75 üstü bir test çöz"}</small></div></li><li><div><b>En iyi denge</b><small>hız × anlama</small></div><div><b>${data.bestBalance ? `${data.bestBalance.wpm} kelime/dk` : "Henüz yok"}</b><small>${data.bestBalance ? `%${data.bestBalance.comprehension} anlama` : "—"}</small></div></li></ol>
      <h5>Son çalışmalar</h5><ol class="sr-history">${recent.slice(0, 5).map(row).join("")}</ol>${recent.length > 5 ? `<details class="sr-more"><summary>Daha fazla çalışma</summary><ol class="sr-history">${recent.slice(5).map(row).join("")}</ol></details>` : ""}
      <details class="sr-more"><summary>Tüm ölçümler</summary><div class="sr-progress-hero"><div><span>Önerilen tempo</span><strong>${recommendation.wpm} kelime/dk</strong><p>${escape(recommendation.reason)}</p></div><div><span>Test seviyesi</span><strong>${escape(difficulty.label)}</strong><p>${escape(difficulty.reason)}</p></div></div>${skillPanel}<div class="sr-metric-grid">${metric("Ort. paragraf süresi", data.averageReadingMs === null ? "—" : seconds(data.averageReadingMs))}${metric("Ort. soru süresi", data.averageQuestionMs === null ? "—" : seconds(data.averageQuestionMs))}${metric("Günlük seri", `${data.streak} gün`)}${metric("Tamamlanan ders", `${data.completedLessons} / 4`)}${metric(`Son ${range} gün egzersiz`, data.exerciseCount)}${metric(`Son ${range} gün test`, data.tests.length)}</div><p class="sr-caption">Rekor ve en iyi denge saklanan kayıtlardan seçilir. 100 kelime süresi farklı uzunluktaki metinleri karşılaştırabilmek için normalize edilir.</p></details>`;
  }

  function begin(kind) {
    abandon(); notice = "";
    const passage = choosePassage(kind), mode = kind === "test" ? "paragraph" : exerciseMode;
    session = {kind, mode, passage, phase: "reading", clock: createClock(), questionClock: createClock(), position: -1, targetWpm: mode === "paragraph" ? 0 : speed, groups: splitGroups(passage.text, mode === "lines" ? 9 : 3), answers: [], questionIndex: 0, readingMs: 0};
    session.clock.start(); render(); startTick();
  }
  function startTick() {stopTick(); tickTimer = setInterval(tick, 100); tick();}
  function tick() {
    if (!session || session.phase === "result") return stopTick();
    if (!visible()) return suspend();
    const clock = session.phase === "reading" ? session.clock : session.questionClock;
    const output = root?.querySelector(".sr-clock"), label = timerLabel(clock.elapsed());
    if (output && output.textContent !== label) output.textContent = label;
    if (session.phase === "reading" && session.targetWpm && clock.running) {
      const position = pacePosition(session.groups, clock.elapsed(), session.targetWpm);
      if (position.finished) return finishReading();
      if (position.index !== session.position) {
        session.position = position.index;
        const text = root?.querySelector(".sr-reading-text"); if (text) text.innerHTML = readingMarkup();
        const line = text?.querySelector(".sr-lines .is-current"), lines = text?.querySelector(".sr-lines");
        if (line && lines) lines.scrollTop = Math.max(0, line.offsetTop - lines.offsetTop - lines.clientHeight / 3);
      }
    }
  }
  function finishReading() {
    if (session?.phase !== "reading" || !session.clock.running) return;
    session.clock.pause(); session.readingMs = Math.max(1, session.clock.elapsed()); session.phase = "questions"; session.questionClock.start(); render(); startTick();
    root.querySelector("legend")?.scrollIntoView({block: "nearest", behavior: "auto"});
  }
  function finishQuestions() {
    if (session?.phase !== "questions") return;
    const questions = questionsFor(session);
    if (!Number.isInteger(session.answers[session.questionIndex])) return showNotice("Devam etmek için bir yanıt seç.");
    if (session.questionIndex < questions.length - 1) {session.questionIndex++; render(); root.querySelector("input")?.focus({preventScroll: true}); return;}
    session.questionClock.pause(); stopTick(); const grade = gradeAnswers(questions, session.answers);
    session.result = createSession({kind: session.kind, mode: session.mode, passageId: session.passage.id, words: wordCount(session.passage.text), readingMs: session.readingMs, questionMs: session.questionClock.elapsed(), correct: grade.correct, total: grade.total, targetWpm: session.targetWpm, difficulty: session.passage.difficulty, skillResults: questions.map((question, index) => ({type: question.type, correct: session.answers[index] === question.answer}))});
    previousState = state(); store.addSession(session.result); session.phase = "result"; render();
  }
  function suspend() {
    const wasFocusVisible = focusVisible, wasRunning = session?.clock.running || session?.questionClock.running;
    clearFocus();
    if (session && ["reading", "questions"].includes(session.phase)) {session.clock.pause(); session.questionClock.pause(); stopTick();}
    if (wasFocusVisible || wasRunning) render();
  }
  function resume() {if (!session || !visible()) return; if (session.phase === "reading") session.clock.start(); if (session.phase === "questions") session.questionClock.start(); render(); startTick();}
  function changeSection(next) {
    if (!["learn", "exercise", "test", "progress"].includes(next) || next === section) return;
    if (session && ["reading", "questions"].includes(session.phase)) showNotice("Yarım kalan çalışma kaydedilmedi. Yeni bölüme geçildi."); else notice = "";
    abandon(); section = next; render();
  }
  function click(event) {
    const target = event.target.closest("button"); if (!target || !root.contains(target)) return;
    if (target.dataset.srSection) {changeSection(target.dataset.srSection); root.querySelector('[aria-selected="true"]')?.focus({preventScroll: true}); return;}
    if (target.dataset.srLesson) {lesson = LESSONS.find(row => row.id === target.dataset.srLesson); lessonStep = -1; lessonAnswer = null; lessonChecked = false; peeks = 0; clearFocus(); render(); root.querySelector(".sr-lesson-detail")?.scrollIntoView({block: "nearest", behavior: "auto"}); return;}
    if (target.dataset.srMode) {exerciseMode = target.dataset.srMode; render(); root.querySelector(`[data-sr-mode="${exerciseMode}"]`)?.focus({preventScroll: true}); return;}
    const action = target.dataset.srAction;
    if (action === "daily-warmup") {section = "exercise"; exerciseMode = "groups"; speed = recommendedPace(state()).wpm; return begin("exercise");}
    if (action === "daily-paragraph") {section = "exercise"; exerciseMode = "paragraph"; return begin("exercise");}
    if (action === "daily-test") {section = "test"; return begin("test");}
    if (action === "start-test" || action === "start-exercise") return begin(action === "start-test" ? "test" : "exercise");
    if (action === "pause") return suspend(); if (action === "resume") return resume();
    if (action === "finish-reading") return finishReading(); if (action === "next-question") return finishQuestions();
    if (action === "cancel" || action === "new-session") {abandon(); notice = action === "cancel" ? "Çalışma bırakıldı; sonuçlara eklenmedi." : ""; render(); return;}
    if (action === "open-progress") return changeSection("progress");
    if (action === "range-7" || action === "range-30") {range = action === "range-7" ? 7 : 30; render(); return;}
    if (action === "speed-down" || action === "speed-up") {
      const index = SPEEDS.indexOf(speed), base = index < 0 ? SPEEDS.findIndex(value => value >= speed) : index;
      speed = SPEEDS[Math.max(0, Math.min(SPEEDS.length - 1, (base < 0 ? SPEEDS.length - 1 : base) + (action === "speed-up" ? 1 : -1)))];
      render(); root.querySelector(`[data-sr-action="${action}"]:not(:disabled)`)?.focus({preventScroll: true}); return;
    }
    if (action === "goal-down" || action === "goal-up") {
      store.setWeeklyGoal(weeklyProgress(state()).goal + (action === "goal-up" ? 1 : -1)); render();
      root.querySelector(`[data-sr-action="${action}"]:not(:disabled)`)?.focus({preventScroll: true}); return;
    }
    if (action === "first-test") return changeSection("test");
    if (!lesson) return;
    if (action === "close-lesson") {clearFocus(); lesson = null; render(); return;}
    if (action === "layout-words" || action === "layout-groups") {lessonLayout = action === "layout-words" ? "words" : "groups"; render(); return;}
    if (action === "lesson-next") {
      lessonLayout = "groups"; lessonStep = lessonStep >= lesson.groups.length ? 0 : lessonStep + 1; lessonAnswer = null; lessonChecked = false; render();
      root.querySelector(lessonStep >= lesson.groups.length ? 'input[name="sr-lesson-answer"]' : '[data-sr-action="lesson-next"]')?.focus({preventScroll: true}); return;
    }
    if (action === "lesson-peek") {peeks++; const el = root.querySelector(".sr-peek"); if (el) {el.hidden = false; el.textContent = lesson.groups[lessonStep - 1];} const caption = root.querySelector(".sr-practice .sr-caption"); if (caption) caption.textContent = `Geri bakış: ${peeks} · Gerekli bir kontrol hata değildir.`; return;}
    if (action === "lesson-focus") {
      clearFocus(); lessonStep = lessonStep >= lesson.rounds.length ? 1 : Math.max(0, lessonStep) + 1; lessonAnswer = null; lessonChecked = false; focusVisible = true; render();
      focusTimer = setTimeout(() => {focusVisible = false; render();}, 1400); return;
    }
    if (action === "lesson-check" && lessonAnswer !== null) {lessonChecked = true; render(); return;}
    if (action === "complete-lesson" && lessonChecked) {store.completeLesson(lesson.id); notice = `“${lesson.title}” dersi kaydedildi.`; clearFocus(); lesson = null; render();}
  }
  function change(event) {
    const input = event.target;
    if (input.name === "sr-lesson-answer") {
      const hadFeedback = lessonChecked; lessonAnswer = Number(input.value); lessonChecked = false;
      if (hadFeedback) {render(); root.querySelector(`input[name="sr-lesson-answer"][value="${lessonAnswer}"]`)?.focus({preventScroll: true});}
      const check = root.querySelector('[data-sr-action="lesson-check"]'); if (check) check.disabled = false;
    }
    if (input.name === "sr-test-answer" && session?.phase === "questions") {session.answers[session.questionIndex] = Number(input.value); const next = root.querySelector('[data-sr-action="next-question"]'); if (next) next.disabled = false;}
  }
  function keydown(event) {
    const tab = event.target.closest("[data-sr-section]"); if (!tab || !["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault(); event.stopPropagation(); const sections = ["learn", "exercise", "test", "progress"], index = sections.indexOf(section);
    const next = event.key === "Home" ? 0 : event.key === "End" ? 3 : (index + (event.key === "ArrowRight" ? 1 : 3)) % 4;
    changeSection(sections[next]); root.querySelector('[aria-selected="true"]')?.focus({preventScroll: true});
  }
  function mount(element) {
    if (!element) return;
    if (root !== element) {
      root?.removeEventListener("click", click); root?.removeEventListener("change", change); root?.removeEventListener("keydown", keydown);
      root = element; root.addEventListener("click", click); root.addEventListener("change", change); root.addEventListener("keydown", keydown); root.addEventListener("submit", event => event.preventDefault()); render();
    }
  }
  document.addEventListener("visibilitychange", () => {if (document.hidden) suspend();});
  window.addEventListener("pagehide", suspend);
  window.addEventListener("yks:navigation-after", () => {if (!visible()) suspend();});
  window.addEventListener("storage", event => {if (event.key === STORAGE_KEY && (!session || session.phase === "result")) render();});
  return {mount, suspend};
}
