const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const {pathToFileURL} = require("node:url");
const path = require("node:path");
const base = path.resolve(__dirname, "../modules/speed-reading");
const model = import(pathToFileURL(path.join(base, "model.mjs")));
const content = import(pathToFileURL(path.join(base, "content.mjs")));
const storage = (initial = {}) => {const values = new Map(Object.entries(initial)); return {getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value), values};};
const at = (day, hour = 12) => new Date(2026, 9, day, hour).getTime();
const session = (m, overrides = {}) => m.createSession({kind: "test", mode: "paragraph", passageId: "library", words: 200, readingMs: 60000, questionMs: 20000, correct: 4, total: 4, ...overrides}, overrides.at || at(3), overrides.id || "test-1");

test("speed reading counts Turkish words, punctuation and compound words consistently", async () => {
  const m = await model;
  assert.equal(m.wordCount("İç ses, öğrenci ve YKS'nin anlam-kontrol çalışması: 2026."), 8);
  assert.equal(m.wordCount("  — … ! "), 0);
  assert.equal(m.wordsPerMinute(120, 30000), 240);
  assert.equal(m.wordsPerMinute(0, 10), 0);
  assert.equal(m.wordsPerMinute(10, 0), 0);
  assert.equal(m.wordsPerMinute(10, Number.MIN_VALUE), 0);
});
test("pace duration uses actual words including the shorter final group", async () => {
  const m = await model, groups = m.splitGroups("bir iki üç dört beş altı yedi", 3);
  assert.deepEqual(groups, ["bir iki üç", "dört beş altı", "yedi"]);
  assert.deepEqual(m.pacePosition(groups, 599, 300), {index: 0, finished: false});
  assert.deepEqual(m.pacePosition(groups, 600, 300), {index: 1, finished: false});
  assert.deepEqual(m.pacePosition(groups, 1399, 300), {index: 2, finished: false});
  assert.equal(m.pacePosition(groups, 1400, 300).finished, true);
});
test("monotonic reading clock excludes hidden time and avoids duplicate starts", async () => {
  const m = await model; let now = 0; const clock = m.createClock(() => now);
  clock.start(); now = 500; clock.start(); now = 1200; clock.pause();
  assert.equal(clock.elapsed(), 1200); assert.equal(clock.running, false);
  now = 10000; assert.equal(clock.elapsed(), 1200);
  clock.start(); now = 10800; clock.pause(); clock.pause();
  assert.equal(clock.elapsed(), 2000);
});
test("grading treats unanswered and malformed answers as wrong", async () => {
  const m = await model, questions = [{answer: 1}, {answer: 0}, {answer: 2}, {answer: 3}];
  assert.deepEqual(m.gradeAnswers(questions, [1, 0, "2", undefined]), {correct: 2, wrong: 2, total: 4, comprehension: 50});
});
test("legacy lessons migrate safely without invented activity dates", async () => {
  const m = await model;
  assert.deepEqual(m.normalizeState(null, {done: ["groups", "groups", "fake", "voice"]}).lessons, {groups: 0, voice: 0});
  for (const bad of [null, [], "groups", {done: "groups"}, {done: null}, 2]) assert.doesNotThrow(() => m.normalizeState(bad, bad));
  assert.equal(m.dailyStreak(m.normalizeState(null, {done: ["groups"]}), at(3)), 0);
});
test("malformed storage sessions cannot contribute fake, infinite or incomplete metrics", async () => {
  const m = await model, good = session(m), invalid = [null, {...good, id: ""}, {...good, readingMs: Number.MIN_VALUE}, {...good, readingMs: Infinity}, {...good, total: 2}, {...good, correct: 5}, {...good, questionMs: -1}, {...good, kind: "unknown"}];
  assert.deepEqual(m.normalizeState({sessions: invalid}).sessions, []);
  const normalized = m.normalizeState({sessions: [{...good, wpm: Infinity, comprehension: 900}]}).sessions[0];
  assert.equal(normalized.wpm, 200); assert.equal(normalized.comprehension, 100);
});
test("independent session IDs persist separately and repeated IDs do not duplicate records", async () => {
  const m = await model, first = session(m), second = session(m, {id: "test-2"});
  const result = m.normalizeState({sessions: [first, second, first]});
  assert.equal(result.sessions.length, 2); assert.deepEqual(result.sessions.map(row => row.id), ["test-1", "test-2"]);
});
test("bounded history keeps the latest thousand sessions", async () => {
  const m = await model, sessions = Array.from({length: 1003}, (_, index) => session(m, {id: String(index), at: at(3) + index}));
  const saved = m.normalizeState({sessions}); assert.equal(saved.sessions.length, 1000);
  assert.equal(saved.sessions[0].id, "3"); assert.equal(saved.sessions[999].id, "1002");
});
test("passage rotation continues after history reaches its retention limit", async () => {
  const m = await model, {PASSAGES} = await content;
  const rows = Array.from({length: 1000}, (_, index) => session(m, {id: String(index), passageId: index === 999 ? "garden" : "library"}));
  assert.equal(m.nextPassage(PASSAGES, m.normalizeState({sessions: rows}).sessions, "test").id, "map");
  assert.equal(m.nextPassage(PASSAGES, rows, "exercise").id, "library");
});
test("lesson and session writes survive reload and preserve old migration data", async () => {
  const m = await model, disk = storage({[m.LEGACY_KEY]: JSON.stringify({done: ["groups"]})}), first = m.createStore(disk);
  first.completeLesson("voice", at(2)); first.completeLesson("voice", at(3)); first.addSession(session(m));
  const restored = m.createStore(disk).read();
  assert.deepEqual(restored.lessons, {groups: 0, voice: at(2)}); assert.equal(restored.sessions.length, 1);
  assert.equal(disk.getItem(m.LEGACY_KEY), JSON.stringify({done: ["groups"]}));
});
test("broken JSON and storage denial leave the feature usable without throwing", async () => {
  const m = await model, corrupt = m.createStore(storage({[m.STORAGE_KEY]: "{", [m.LEGACY_KEY]: "null"}));
  assert.deepEqual(corrupt.read().lessons, {});
  const denied = m.createStore({getItem() {throw Error("blocked");}, setItem() {throw Error("quota");}});
  denied.completeLesson("focus", at(3)); denied.addSession(session(m));
  assert.equal(denied.persistent, false); assert.equal(denied.read().lessons.focus, at(3)); assert.equal(denied.read().sessions.length, 1);
});
test("two tabs merge independent completed lessons and sessions before saving", async () => {
  const m = await model, disk = storage(), a = m.createStore(disk), b = m.createStore(disk);
  a.completeLesson("groups", at(1)); b.completeLesson("voice", at(2));
  a.addSession(session(m)); b.addSession(session(m, {id: "second"}));
  assert.equal(Object.keys(a.read().lessons).length, 2); assert.equal(a.read().sessions.length, 2);
});
test("repeating a lesson extends the daily streak without changing first completion", async () => {
  const m = await model, disk = storage(), store = m.createStore(disk);
  store.completeLesson("groups", at(1)); store.completeLesson("groups", at(2)); store.completeLesson("groups", at(2, 16)); store.completeLesson("groups", at(3));
  const saved = m.createStore(disk).read();
  assert.equal(saved.lessons.groups, at(1)); assert.equal(saved.lessonActivity.length, 3); assert.equal(m.dailyStreak(saved, at(3)), 3);
  const old = m.normalizeState({lessons: {voice: at(2)}}); assert.equal(m.dailyStreak(old, at(3)), 1);
});
test("clearing saved reading data is respected instead of resurrecting in-memory history", async () => {
  const m = await model, disk = storage(), store = m.createStore(disk);
  store.completeLesson("groups", at(1)); store.addSession(session(m));
  disk.values.delete(m.STORAGE_KEY);
  assert.deepEqual(store.read().lessons, {}); assert.deepEqual(store.read().sessions, []);
  store.completeLesson("focus", at(3)); assert.deepEqual(store.read().lessons, {focus: at(3)});
});
test("high speed with low comprehension is not marked successful", async () => {
  const m = await model, poor = session(m, {words: 400, correct: 2, total: 5});
  assert.equal(poor.wpm, 400); assert.equal(poor.comprehension, 40);
  assert.equal(m.performanceFeedback(poor).kind, "review");
  assert.equal(m.summarize(m.normalizeState({sessions: [poor]}), 7, at(3)).record, null);
});
test("very short measurements are saved but excluded from averages and records", async () => {
  const m = await model, short = session(m, {readingMs: 2000});
  const summary = m.summarize(m.normalizeState({sessions: [short]}), 7, at(3));
  assert.equal(summary.sessions.length, 1); assert.equal(summary.tests.length, 0); assert.equal(summary.averageWpm, null); assert.equal(summary.record, null);
  assert.equal(m.performanceFeedback(short).kind, "brief");
});
test("7 and 30 day windows use inclusive local calendar days and exclude future records", async () => {
  const m = await model;
  const sessions = [session(m, {id: "today", at: at(3)}), session(m, {id: "seven", at: new Date(2026, 8, 27, 0).getTime()}), session(m, {id: "eight", at: new Date(2026, 8, 26, 23).getTime()}), session(m, {id: "future", at: at(4)})];
  const saved = m.normalizeState({sessions});
  assert.equal(m.summarize(saved, 7, at(3)).tests.length, 2);
  assert.equal(m.summarize(saved, 30, at(3)).tests.length, 3);
});
test("progress averages include low comprehension and weight question duration by question count", async () => {
  const m = await model, a = session(m, {id: "a", readingMs: 60000, questionMs: 20000, total: 4, correct: 4}), b = session(m, {id: "b", readingMs: 30000, questionMs: 10000, total: 5, correct: 2});
  const summary = m.summarize(m.normalizeState({sessions: [a, b]}), 7, at(3));
  assert.equal(summary.averageWpm, 300); assert.equal(summary.averageComprehension, 70); assert.equal(summary.averageReadingMs, 45000); assert.equal(summary.averageQuestionMs, Math.round(30000 / 9));
});
test("best balance rewards comprehension and personal speed record requires 75 percent", async () => {
  const m = await model, fast = session(m, {id: "fast", words: 400, correct: 3}), steady = session(m, {id: "steady", words: 300}), poor = session(m, {id: "poor", words: 600, correct: 1});
  const summary = m.summarize(m.normalizeState({sessions: [fast, steady, poor]}), 7, at(3));
  assert.equal(summary.record.id, "fast"); assert.equal(summary.bestBalance.id, "steady");
});
test("daily streak counts lesson activity and survives a day with no completed session yet", async () => {
  const m = await model, saved = m.normalizeState({lessons: {groups: at(1)}, sessions: [session(m, {at: at(2)})]});
  assert.equal(m.dailyStreak(saved, at(3)), 2); assert.equal(m.dailyStreak(saved, at(4)), 0);
  saved.sessions.push(session(m, {id: "today", at: at(3)})); assert.equal(m.dailyStreak(saved, at(3)), 3);
});
test("exercises count separately and do not change test averages", async () => {
  const m = await model, exercise = session(m, {kind: "exercise", mode: "groups", total: 1, correct: 1, words: 400});
  const summary = m.summarize(m.normalizeState({sessions: [exercise]}), 7, at(3));
  assert.equal(summary.exerciseCount, 1); assert.equal(summary.averageWpm, null); assert.equal(summary.record, null);
});
test("comparison uses the previous valid test instead of exercise or current result", async () => {
  const m = await model, a = session(m, {id: "previous", at: at(1)}), exercise = session(m, {id: "exercise", at: at(2), kind: "exercise", mode: "groups", total: 1, correct: 1}), b = session(m, {id: "new", at: at(3), words: 250, correct: 3});
  const comparison = m.comparePrevious(m.normalizeState({sessions: [a, exercise, b]}), b);
  assert.equal(comparison.previous.id, "previous"); assert.equal(comparison.wpm, 50); assert.equal(comparison.comprehension, -25);
});
test("all learning units contain interactive checks and suitable semantic groups", async () => {
  const m = await model, {LESSONS} = await content;
  assert.deepEqual(LESSONS.map(row => row.id), m.LESSON_IDS);
  for (const lesson of LESSONS) {assert.ok(lesson.explanation.length > 100); assert.ok(lesson.instructions.length > 60); assert.ok(lesson.reflection.length > 80); assert.ok(lesson.options[lesson.answer]);}
  for (const group of LESSONS[0].groups) assert.ok(m.wordCount(group) >= 2 && m.wordCount(group) <= 4, group);
  assert.match(LESSONS.find(row => row.id === "voice").explanation, /tamamen susturmak değildir/);
});
test("every test text has five varied YKS-style questions, distinct options and sufficient text", async () => {
  const m = await model, {PASSAGES} = await content;
  assert.equal(new Set(PASSAGES.map(row => row.id)).size, PASSAGES.length);
  assert.ok(PASSAGES.length >= 10);
  for (const passage of PASSAGES) {
    assert.ok(m.wordCount(passage.text) >= 100, passage.id); assert.equal(passage.questions.length, 5, passage.id);
    assert.ok(new Set(passage.questions.map(question => question.type)).size >= 4, passage.id);
    for (const question of passage.questions) {
      assert.equal(new Set(question.options).size, 4); assert.ok(question.options[question.answer]); assert.ok(question.explanation.length >= 40); assert.ok(question.type);
      assert.ok(question.options.filter(option => option.length >= 25).length >= 3, `${passage.id}: ${question.prompt}`);
    }
    assert.equal(m.gradeAnswers(passage.questions, passage.questions.map(row => row.answer)).comprehension, 100);
  }
});


test("adaptive pace protects comprehension before increasing speed", async () => {
  const m=await model;
  const low=m.normalizeState({sessions:[session(m,{id:"low",correct:2,total:4,words:300})]});
  assert.ok(m.recommendedPace(low).wpm<300);
  const strong=m.normalizeState({sessions:[session(m,{id:"a",correct:4,total:4,words:250,at:at(1)}),session(m,{id:"b",correct:4,total:4,words:250,at:at(2)})]});
  assert.ok(m.recommendedPace(strong,at(3)).wpm>=250);
  assert.equal(m.recommendedPace(m.normalizeState(null)).wpm,200);
});
test("daily training tracks warmup paragraph and test independently", async () => {
  const m=await model, rows=[
    session(m,{id:"warm",kind:"exercise",mode:"groups",total:1,correct:1,at:at(3,9)}),
    session(m,{id:"para",kind:"exercise",mode:"paragraph",total:1,correct:1,at:at(3,10)}),
    session(m,{id:"test",at:at(3,11)})
  ];
  const plan=m.dailyTraining(m.normalizeState({sessions:rows}),at(3,12));
  assert.equal(plan.completed,3);assert.deepEqual(plan.steps.map(step=>step.done),[true,true,true]);
});
test("normalized 100-word time and seven-day trend compare different passage lengths fairly", async () => {
  const m=await model, a=session(m,{id:"a",words:200,readingMs:80000,at:at(1)}),b=session(m,{id:"b",words:100,readingMs:40000,at:at(3)});
  assert.equal(m.normalizedReadingMs(a),40000);
  const saved=m.normalizeState({sessions:[a,b]}),summary=m.summarize(saved,7,at(3));
  assert.equal(summary.average100WordMs,40000);
  const trend=m.weeklyTrend(saved,at(3));assert.equal(trend.length,7);assert.equal(trend.at(-1).wpm,b.wpm);
});
test("expanded passage pool reduces quick repetition while preserving question quality", async () => {
  const {PASSAGES}=await content;assert.ok(PASSAGES.length>=8);
  for(const passage of PASSAGES){assert.ok(passage.questions.length>=3);assert.ok(passage.text.length>400);}
});
test("speed reading v2.3 exposes adaptive difficulty, skill history and versioned lazy assets", async () => {
  const runtime=fs.readFileSync(path.join(base,"runtime.mjs"),"utf8"),css=fs.readFileSync(path.join(base,"speed-reading.css"),"utf8");
  const loader=fs.readFileSync(path.resolve(__dirname,"../modules/speed-reading-learn-v1.js"),"utf8");
  assert.match(runtime,/BUGÜNÜN ANTRENMANI/);assert.match(runtime,/daily-warmup/);assert.match(runtime,/weeklyTrend/);assert.match(runtime,/100 kelime okuma/);
  assert.match(runtime,/YKS tipi anlama sorusu/);assert.match(runtime,/resultSkillReport/);assert.match(runtime,/sr-test-skills/);assert.match(runtime,/recommendedDifficulty/);assert.match(runtime,/questionSkillBreakdown/);
  assert.match(css,/sr-daily-steps/);assert.match(css,/sr-trend/);assert.match(css,/sr-skill-report/);assert.match(css,/sr-difficulty-card/);assert.match(css,/sr-skill-progress/);assert.match(loader,/speed-reading\.css\?v=2\.3\.0/);assert.match(loader,/runtime\.mjs\?v=2\.3\.0/);
});


test("adaptive difficulty promotes only after sustained comprehension and avoids recent passages", async () => {
  const m=await model,{PASSAGES}=await content;
  const medium=m.normalizeState({sessions:[session(m,{id:"m",correct:3,total:5,at:at(1)})]});
  assert.equal(m.recommendedDifficulty(medium,at(3)).level,"medium");
  const hard=m.normalizeState({sessions:[
    session(m,{id:"h1",correct:4,total:5,at:at(1),passageId:"library"}),
    session(m,{id:"h2",correct:5,total:5,at:at(2),passageId:"garden"})
  ]});
  assert.equal(m.recommendedDifficulty(hard,at(3)).level,"hard");
  const expert=m.normalizeState({sessions:[
    session(m,{id:"e1",correct:5,total:5,at:at(1),passageId:"map"}),
    session(m,{id:"e2",correct:5,total:5,at:at(2),passageId:"museum"}),
    session(m,{id:"e3",correct:5,total:5,at:at(3,9),passageId:"studyroom"})
  ]});
  assert.equal(m.recommendedDifficulty(expert,at(3,12)).level,"expert");
  const next=m.adaptivePassage(PASSAGES,hard,at(3));
  assert.equal(next.difficulty,"hard");
  assert.ok(!["library","garden"].includes(next.id));
});

test("question-type analytics persist per session and aggregate accuracy", async () => {
  const m=await model;
  const a=m.createSession({kind:"test",mode:"paragraph",passageId:"library",words:180,readingMs:60000,questionMs:20000,correct:4,total:5,difficulty:"hard",skillResults:[
    {type:"Çıkarım",correct:true},{type:"Çıkarım",correct:false},{type:"Ana düşünce",correct:true}
  ]},at(2),"skills-a");
  const b=m.createSession({kind:"test",mode:"paragraph",passageId:"queue",words:180,readingMs:60000,questionMs:20000,correct:4,total:5,difficulty:"hard",skillResults:[
    {type:"Çıkarım",correct:true},{type:"Ana düşünce",correct:false}
  ]},at(3),"skills-b");
  const saved=m.normalizeState({sessions:[a,b]});
  assert.equal(saved.sessions[0].difficulty,"hard");
  assert.equal(saved.sessions[0].skillResults.length,3);
  const rows=m.questionSkillBreakdown(saved,30,at(3,12));
  const inference=rows.find(row=>row.type==="Çıkarım"),main=rows.find(row=>row.type==="Ana düşünce");
  assert.deepEqual({correct:inference.correct,total:inference.total,accuracy:inference.accuracy},{correct:2,total:3,accuracy:67});
  assert.deepEqual({correct:main.correct,total:main.total,accuracy:main.accuracy},{correct:1,total:2,accuracy:50});
});

test("every passage declares a supported adaptive difficulty", async () => {
  const m=await model,{PASSAGES}=await content;
  const counts={medium:0,hard:0,expert:0};
  for(const passage of PASSAGES){assert.ok(m.DIFFICULTIES.includes(passage.difficulty),passage.id);counts[passage.difficulty]++;}
  assert.ok(counts.medium>=3);assert.ok(counts.hard>=3);assert.ok(counts.expert>=3);
});
