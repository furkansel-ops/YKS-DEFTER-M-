import {LESSONS, PASSAGES, EXERCISES} from "./content.mjs";
import {createStore, STORAGE_KEY, SPEEDS, wordCount, splitGroups, createClock, pacePosition, gradeAnswers, createSession, performanceFeedback, comparePrevious, summarize, nextPassage, recommendedPace, dailyTraining, weeklyTrend} from "./model.mjs";
const escape = value => String(value ?? "").replace(/[&<>"']/g, char => ({"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"}[char]));
const seconds = ms => `${(ms / 1000).toFixed(1).replace(".", ",")} sn`;
const timerLabel = ms => {const value = Math.floor(ms / 1000); return `${Math.floor(value / 60)}:${String(value % 60).padStart(2, "0")}`;};
const signed = number => `${number > 0 ? "+" : ""}${number}`;
const button = (action, label, attributes = "") => `<button type="button" data-sr-action="${action}" ${attributes}>${label}</button>`;
const choices = (question, selected, name) => `<fieldset class="sr-choices"><legend>${escape(question.prompt || question.question)}</legend>${question.options.map((option, index) => `<label><input type="radio" name="${name}" value="${index}" ${selected === index ? "checked" : ""}><span>${escape(option)}</span></label>`).join("")}</fieldset>`;

export function createReadingRuntime() {
  let storage; try {storage = window.localStorage;} catch {storage = {getItem() {throw new Error("Storage unavailable");}, setItem() {throw new Error("Storage unavailable");}};}
  const store = createStore(storage);
  let root = null, section = "learn", lesson = null, lessonStep = -1, lessonAnswer = null, lessonChecked = false, lessonLayout = "groups", peeks = 0, focusVisible = false;
  let focusTimer = null, tickTimer = null, session = null, exerciseMode = "groups", speed = 200, range = 7, notice = "", previousState = null;
  const state = () => store.read();
  function visible() {return root?.isConnected && !document.hidden && !root.closest("[hidden]") && root.getClientRects().length > 0;}
  function stopTick() {clearInterval(tickTimer); tickTimer = null;}
  function clearFocus() {clearTimeout(focusTimer); focusTimer = null; focusVisible = false;}
  function abandon() {stopTick(); clearFocus(); session?.clock.pause(); session?.questionClock.pause(); session = null;}
  function showNotice(message) {notice = message; const el = root?.querySelector(".sr-notice"); if (el) {el.textContent = message; el.hidden = !message;}}
  function render() {
    if (!root) return;
    const saved = state(); root.classList.add("sr-app");
    root.innerHTML = `<header class="sr-header"><div><span class="sr-eyebrow">ÖĞRENME LABORATUVARI</span><h3>Hızlı Okuma</h3><p>Önce anlam, sonra ritim.</p></div><span class="sr-completion">${Object.keys(saved.lessons).length}<small>/4 ders</small></span></header><div class="sr-navigation" role="tablist" aria-label="Hızlı okuma bölümleri">${[["learn", "Öğren"], ["exercise", "Egzersiz"], ["test", "Test"], ["progress", "Gelişim"]].map(([key, label]) => `<button type="button" role="tab" id="sr-tab-${key}" aria-controls="sr-content" aria-selected="${section === key}" tabindex="${section === key ? "0" : "-1"}" data-sr-section="${key}">${label}</button>`).join("")}</div><p class="sr-storage-warning" role="status" ${store.persistent ? "hidden" : ""}>Tarayıcı kaydetmeye izin vermedi. İlerlemen bu oturumda duruyor; sayfayı kapatmadan önce depolama iznini kontrol et.</p><p class="sr-notice" role="status" ${notice ? "" : "hidden"}>${escape(notice)}</p><div id="sr-content" class="sr-content" role="tabpanel" aria-labelledby="sr-tab-${section}" tabindex="0">${section === "learn" ? renderDailyPlan(saved) + renderLearn(saved) : section === "progress" ? renderProgress(saved) : renderTraining(saved)}</div>`;
  }
  function renderDailyPlan(saved) {
    const plan = dailyTraining(saved), recommendation = recommendedPace(saved), percent = Math.round(plan.completed / plan.total * 100);
    return `<section class="sr-daily"><div class="sr-daily-head"><div><span class="sr-eyebrow">BUGÜNÜN ANTRENMANI</span><h4>${plan.completed === plan.total ? "Bugünkü üç adım tamam." : "8–12 dakikalık kısa plan"}</h4><p>${escape(recommendation.reason)}</p></div><div class="sr-daily-score"><strong>${plan.completed}/${plan.total}</strong><span>tamamlandı</span></div></div><div class="sr-daily-progress" aria-label="Günlük antrenman ilerlemesi"><i style="width:${percent}%"></i></div><div class="sr-daily-steps">${plan.steps.map(step => `<button type="button" data-sr-action="daily-${step.id}" data-done="${step.done}"><span class="sr-step-state">${step.done ? "✓" : "○"}</span><span><b>${escape(step.label)}</b><small>${escape(step.detail)}</small></span><em>${step.done ? "Tekrarla" : "Başla"}</em></button>`).join("")}</div><div class="sr-pace-card"><span>Önerilen gösterim temposu</span><strong>${recommendation.wpm} <small>kelime/dk</small></strong><em>${escape(recommendation.label)}</em></div></section>`;
  }
  function renderLearn(saved) {
    return `<div class="sr-intro"><h4>Anlayarak okumanın dört temeli</h4><p>Her ders yaklaşık 2–3 dakikalık bir uygulama içerir. Kısa denemeyi yap, anlamanı kontrol et, ardından kendi metninle pekiştir.</p></div><div class="sr-lesson-grid">${LESSONS.map(row => `<button type="button" class="sr-lesson-card" data-sr-lesson="${row.id}" aria-pressed="${lesson?.id === row.id}"><span class="sr-lesson-number">${row.number}</span><span><b>${escape(row.title)}</b><small>${escape(row.subtitle)}</small><em>${Object.hasOwn(saved.lessons, row.id) ? "Tamamlandı ✓" : row.minutes}</em></span></button>`).join("")}</div>${lesson ? renderLesson(saved) : `<div class="sr-empty"><b>Bir ders seçerek başla.</b><p>Egzersiz ve testler de hazır. Hedef hızını, anlama düzeyine göre kendin belirleyebilirsin.</p></div>`}`;
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
  function choosePassage(kind) {return nextPassage(PASSAGES, state().sessions, kind);}
  function renderTraining(saved) {
    if (session?.phase === "result") return renderResult(saved);
    if (session?.phase === "reading") return renderReading();
    if (session?.phase === "questions") return renderQuestions();
    if (section === "test") {
      const passage = choosePassage("test"), seen = saved.sessions.some(row => row.kind === "test" && row.passageId === passage.id);
      return `<div class="sr-intro"><h4>Hızını, anlamayla birlikte ölç.</h4><p>Metin açıldığında süre başlar. “Bitirdim” dediğinde metin kapanır ve dört anlama sorusu gelir. Okuma ve soru süreleri ayrı ölçülür.</p></div><div class="sr-test-cover"><span class="sr-eyebrow">${escape(passage.topic)}</span><h4>${escape(passage.title)}</h4><p>${wordCount(passage.text)} kelime · 4 soru</p>${seen ? '<p class="sr-caption">Bu metni daha önce okudun. Tanıdıklık sonucu etkileyebilir; karşılaştırmayı bir çalışma kaydı olarak değerlendir.</p>' : ""}${button("start-test", "Metni aç ve başlat", 'class="sr-primary"')}<small>İyi sonuç yalnız yüksek hız değildir. Anlama düşükse daha yavaş bir ritme dön.</small></div>`;
    }
    return `<div class="sr-intro"><h4>Kendine uygun bir ritim bul.</h4><p>Gösterim hızını seç, kısa bir tur yap ve anlama sorusuyla kontrol et. Paragraf modunda süreyi kendi okuma hızın belirler.</p></div><div class="sr-exercise-grid">${EXERCISES.map(row => `<button type="button" data-sr-mode="${row.id}" aria-pressed="${exerciseMode === row.id}"><b>${row.title}</b><small>${row.description}</small></button>`).join("")}</div><div class="sr-training-controls"><label for="sr-speed">Gösterim hızı<select id="sr-speed" ${exerciseMode === "paragraph" ? "disabled" : ""}>${SPEEDS.map(value => `<option value="${value}" ${value === speed ? "selected" : ""}>${value} kelime / dk</option>`).join("")}</select></label>${button("start-exercise", "Egzersizi başlat", 'class="sr-primary"')}</div><p class="sr-caption">${exerciseMode === "paragraph" ? "Bu modda hız sınırı yok; bitirdiğinde süre ve kelime/dakika hesaplanır." : "İlk denemede 150–200 ile başlayabilirsin. Gösterim temposu, okuduğunu anladığın anlamına gelmez."}</p>`;
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
    return `<div class="sr-section-heading"><div><span class="sr-eyebrow">${current.questionIndex + 1} / ${questions.length} · ${escape(q.type)}</span><h4>Okuduğunu ne kadar anladın?</h4></div><output class="sr-clock" aria-label="Soru süresi">${timerLabel(current.questionClock.elapsed())}</output></div><p class="sr-caption">Metin kapandı. Yanıtını seç; sonraki soruya geçtiğinde yanıtın kaydedilir.</p><form class="sr-test-question">${choices(q, current.answers[current.questionIndex], "sr-test-answer")}<div class="sr-actions">${button("next-question", current.questionIndex === questions.length - 1 ? "Sonucumu gör" : "Sonraki soru", `class="sr-primary" ${Number.isInteger(current.answers[current.questionIndex]) ? "" : "disabled"}`)}${button("pause", "Duraklat")}${button("cancel", "Çalışmayı bırak")}</div></form>`;
  }
  function metric(label, value) {return `<div class="sr-metric"><span>${label}</span><strong>${value ?? "—"}</strong></div>`;}
  function renderResult(saved) {
    const result = session.result, feedback = performanceFeedback(result), comparison = result.kind === "test" ? comparePrevious(previousState || saved, result) : null, questions = questionsFor(session);
    return `<div class="sr-result-heading" data-sr-result="${feedback.kind}"><span class="sr-eyebrow">${result.kind === "test" ? "TEST TAMAMLANDI" : "EGZERSİZ TAMAMLANDI"}</span><h4>${feedback.title}</h4><p>${feedback.message}</p></div><div class="sr-metric-grid">${metric("Kelime / dk", result.wpm)}${metric("Anlama", `%${result.comprehension}`)}${metric("Okuma süresi", seconds(result.readingMs))}${metric("Doğru / yanlış", `${result.correct} / ${result.total - result.correct}`)}${metric("Soru başına", seconds(result.questionMs / result.total))}${metric("Kelime", result.words)}</div>${comparison ? `<p class="sr-comparison">Önceki teste göre <b>${signed(comparison.wpm)} kelime/dk</b> · anlama <b>${signed(comparison.comprehension)} puan</b>. Metinler farklı olduğunda sonuçlar da değişebilir.</p>` : `<p class="sr-caption">${result.kind === "test" ? "Karşılaştırma için en az iki geçerli test gerekir." : "Gösterim hızı bir tempo ayarıdır; tek anlama sorusu kapsamlı bir testin yerini tutmaz."}</p>`}<details class="sr-answer-review"><summary>Yanıtlarımı incele</summary>${questions.map((q, index) => `<div><b>${index + 1}. ${escape(q.prompt)}</b><p>Senin yanıtın: ${escape(q.options[session.answers[index]])}</p><p>Beklenen: ${escape(q.options[q.answer])}</p><small>${escape(q.explanation)}</small></div>`).join("")}</details><div class="sr-actions">${button("new-session", result.kind === "test" ? "Yeni test" : "Yeni egzersiz", 'class="sr-primary"')}${button("open-progress", "Gelişimimi gör")}</div>`;
  }
  function renderProgress(saved) {
    const data = summarize(saved, range), last = [...data.sessions].reverse().slice(0, 12), recommendation = recommendedPace(saved), trend = weeklyTrend(saved);
    const trendValues = trend.map(row => row.wpm || 0), maxTrend = Math.max(1, ...trendValues);
    const chart = `<div class="sr-trend" aria-label="Son 7 gün test hızı grafiği">${trend.map(row => `<div class="sr-trend-day" title="${escape(row.date)}"><div class="sr-trend-bar"><i style="height:${row.wpm ? Math.max(12, Math.round(row.wpm / maxTrend * 100)) : 4}%"></i></div><b>${escape(row.label)}</b><small>${row.wpm ? row.wpm : "—"}</small></div>`).join("")}</div>`;
    return `<div class="sr-section-heading"><div><h4>Ritminin zaman içindeki izi</h4><p>Hız kadar anlama da izlenir. Tempo önerisi son üç geçerli teste göre kendini ayarlar.</p></div><div class="sr-range" role="group" aria-label="Gelişim dönemi">${button("range-7", "7 gün", `aria-pressed="${range === 7}"`)}${button("range-30", "30 gün", `aria-pressed="${range === 30}"`)}</div></div><div class="sr-progress-hero"><div><span>Önerilen tempo</span><strong>${recommendation.wpm} kelime/dk</strong><p>${escape(recommendation.reason)}</p></div><div><span>100 kelime okuma</span><strong>${data.average100WordMs === null ? "—" : seconds(data.average100WordMs)}</strong><p>40 sn hedefini yalnız anlamayı koruyarak takip et.</p></div></div><h5>Son 7 gün</h5>${chart}<div class="sr-metric-grid">${metric("Ort. kelime / dk", data.averageWpm)}${metric("Ort. anlama", data.averageComprehension === null ? "—" : `%${data.averageComprehension}`)}${metric("Ort. paragraf süresi", data.averageReadingMs === null ? "—" : seconds(data.averageReadingMs))}${metric("100 kelime süresi", data.average100WordMs === null ? "—" : seconds(data.average100WordMs))}${metric("Ort. soru süresi", data.averageQuestionMs === null ? "—" : seconds(data.averageQuestionMs))}${metric("Günlük seri", `${data.streak} gün`)}${metric("Tamamlanan ders", `${data.completedLessons} / 4`)}${metric(`Son ${range} gün egzersiz`, data.exerciseCount)}${metric(`Son ${range} gün test`, data.tests.length)}</div><div class="sr-records"><div><span>Kişisel hız rekoru</span><strong>${data.record ? `${data.record.wpm} kelime/dk` : "Henüz yok"}</strong><p>${data.record ? `%${data.record.comprehension} anlama ile` : "En az %75 anlama içeren bir test tamamla."}</p></div><div><span>En iyi hız + anlama dengesi</span><strong>${data.bestBalance ? `${data.bestBalance.wpm} kelime/dk · %${data.bestBalance.comprehension}` : "Henüz yok"}</strong><p>En az %75 anlama; hız × anlama oranının karesi. Kayıtların içindeki karşılaştırmadır.</p></div></div><p class="sr-caption">Rekor ve en iyi denge saklanan son 1000 çalışmadan seçilir. 100 kelime süresi farklı uzunluktaki metinleri karşılaştırabilmek için normalize edilir.</p><h5>Son çalışmalar</h5>${last.length ? `<ol class="sr-history">${last.map(row => `<li><div><b>${row.kind === "test" ? "Okuma testi" : EXERCISES.find(item => item.id === row.mode)?.title || "Egzersiz"}</b><small>${new Date(row.at).toLocaleDateString("tr-TR", {day: "numeric", month: "short"})} · ${escape(PASSAGES.find(item => item.id === row.passageId)?.title || "Okuma")}</small></div><div><b>${row.wpm} kelime/dk</b><small>%${row.comprehension} anlama${row.readingMs < 5000 ? " · çok kısa ölçüm" : ""}</small></div></li>`).join("")}</ol>` : '<div class="sr-empty"><b>İlk çalışma burada görünecek.</b><p>Bir egzersiz veya test tamamladığında gelişimini takip edebilirsin.</p></div>'}</div>`;
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
    session.result = createSession({kind: session.kind, mode: session.mode, passageId: session.passage.id, words: wordCount(session.passage.text), readingMs: session.readingMs, questionMs: session.questionClock.elapsed(), correct: grade.correct, total: grade.total, targetWpm: session.targetWpm});
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
    if (input.id === "sr-speed" && SPEEDS.includes(Number(input.value))) speed = Number(input.value);
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
