const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const {pathToFileURL} = require("node:url");
const core = require("../modules/core-utils.js");
const root = path.resolve(__dirname, "..");
const load = file => import(pathToFileURL(path.join(root, file)).href);
const service = () => load("src/domain/science-card-service.ts");

test("Bilim seti benzersiz kimlikli 16 biyoloji ve 16 fizik kartı içerir", async () => {
  const {SCIENCE_CARDS} = await load("src/data/science-cards.ts");
  assert.equal(SCIENCE_CARDS.length, 32);
  assert.equal(new Set(SCIENCE_CARDS.map(card => card.id)).size, 32);
  for (const subject of ["Biyoloji", "Fizik"]) assert.equal(SCIENCE_CARDS.filter(card => card.subject === subject).length, 16);
  for (const card of SCIENCE_CARDS) {
    assert.match(card.id, /^(bio|phy)-[a-z0-9-]+$/);
    assert.ok(card.exams.length && card.exams.every(exam => ["TYT", "AYT"].includes(exam)));
    for (const field of ["question", "answer", "cue", "mistake", "tip"]) assert.ok(card[field].length > (field === "cue" ? 4 : 12), card.id + ": " + field);
  }
});

test("Bilim araması Türkçe ve ASCII yazımı, ders/sınav/konu filtrelerini birlikte destekler", async () => {
  const {filterScienceCards, SCIENCE_DEFAULT_FILTERS: base, scienceTopics} = await service();
  assert.deepEqual(filterScienceCards({...base, query: "BOBREK"}, {}).map(card => card.id), ["bio-nephron"]);
  assert.deepEqual(filterScienceCards({...base, query: "İNSÜLİN glukagon"}, {}).map(card => card.id), ["bio-hormones"]);
  assert.equal(filterScienceCards({...base, exam: "TYT", topic: "İnsan fizyolojisi"}, {}).length, 0);
  assert.ok(!scienceTopics("Biyoloji", "TYT").includes("İnsan fizyolojisi"));
  assert.ok(filterScienceCards({...base, subject: "Fizik", exam: "AYT"}, {}).every(card => card.exams.includes("AYT")));
  assert.equal(filterScienceCards({...base, query: "olmayan-kavram"}, {}).length, 0);
});

test("Bilim favorisi ve tekrar işareti birbirini değiştirmez; güncelleme giriş verisini bozmaz", async () => {
  const {updateScienceProgress} = await service();
  const original = {};
  const favorite = updateScienceProgress(original, "bio-heart", {kind: "favorite"}, 100);
  const known = updateScienceProgress(favorite, "bio-heart", {kind: "status", status: "known"}, 200);
  assert.deepEqual(original, {});
  assert.equal(favorite["bio-heart"].status, "new");
  assert.deepEqual(known["bio-heart"], {status: "known", statusAt: 200, favorite: true, favoriteAt: 100});
  const removed = updateScienceProgress(known, "bio-heart", {kind: "favorite"}, 100);
  assert.equal(removed["bio-heart"].favorite, false);
  assert.equal(removed["bio-heart"].favoriteAt, 101);
  assert.equal(removed["bio-heart"].status, "known");
  assert.equal(updateScienceProgress(known, "not-a-card", {kind: "favorite"}), null);
  assert.equal(updateScienceProgress(known, "bio-heart", {kind: "status", status: "invalid"}), null);
});

test("Bilim görünüm filtreleri ve kişisel sayaçlar kayıtlı işaretleri doğru sayar", async () => {
  const {filterScienceCards, scienceTotals, SCIENCE_DEFAULT_FILTERS: base} = await service();
  const saved = {
    "bio-heart": {status: "known", statusAt: 1, favorite: true, favoriteAt: 1},
    "bio-cell": {status: "review", statusAt: 1, favorite: false, favoriteAt: 0},
    "phy-motion": {status: "known", statusAt: 1, favorite: true, favoriteAt: 1}
  };
  assert.deepEqual(filterScienceCards({...base, view: "favorites"}, saved).map(card => card.id), ["bio-heart"]);
  assert.deepEqual(filterScienceCards({...base, view: "review"}, saved).map(card => card.id), ["bio-cell"]);
  assert.equal(filterScienceCards({...base, view: "new"}, saved).length, 14);
  assert.deepEqual(scienceTotals("Biyoloji", saved), {total: 16, known: 1, review: 1, favorites: 1});
});

test("Bozuk bilim işaretleri güvenle okunur ve prototip anahtarları kabul edilmez", async () => {
  const {normalizeScienceProgress} = await service();
  assert.deepEqual(normalizeScienceProgress(null), {});
  assert.deepEqual(normalizeScienceProgress([]), {});
  const input = JSON.parse('{"__proto__":{"polluted":true},"bio-cell":{"status":"oops","statusAt":99,"favorite":"yes","favoriteAt":99},"phy-motion":null}');
  assert.deepEqual(normalizeScienceProgress(input), {"bio-cell": {status: "new", statusAt: 0, favorite: false, favoriteAt: 0}});
  assert.equal({}.polluted, undefined);
  const malformed = {"bio-heart": {status: "known", statusAt: Infinity, favorite: true, favoriteAt: -1}};
  assert.deepEqual(core.mergeStates({lab: {scienceCards: malformed}}, {}, 21).lab.scienceCards, normalizeScienceProgress(malformed));
});

test("Bilim işaretleri bulutta alan bazında birleşir; kaldırılan favori geri dirilmez", () => {
  const remote = {lab: {scienceCards: {"bio-heart": {status: "known", statusAt: 200, favorite: true, favoriteAt: 100}}}};
  const local = {lab: {scienceCards: {
    "bio-heart": {status: "review", statusAt: 150, favorite: false, favoriteAt: 300},
    "phy-motion": {status: "review", statusAt: 400, favorite: false, favoriteAt: 0}
  }}};
  const merged = core.mergeStates(remote, local, 21).lab.scienceCards;
  assert.deepEqual(merged["bio-heart"], {status: "known", statusAt: 200, favorite: false, favoriteAt: 300});
  assert.equal(merged["phy-motion"].status, "review");
  assert.deepEqual(core.mergeStates(local, remote, 21).lab.scienceCards, merged);
  assert.equal(remote.lab.scienceCards["bio-heart"].favorite, true);
});

test("Yeni işaretsiz durumu eski biliyorum kaydından daha güncelse korunur", () => {
  const row = status => ({status, statusAt: status === "new" ? 300 : 200, favorite: false, favoriteAt: 0});
  const merged = core.mergeStates({lab: {scienceCards: {"bio-cell": row("known")}}}, {lab: {scienceCards: {"bio-cell": row("new")}}}, 21);
  assert.equal(merged.lab.scienceCards["bio-cell"].status, "new");
});

test("Başarılı bilim kaydı mevcut save zincirini kullanır ve konu verilerine dokunmaz", async () => {
  const {persistScienceAction} = await service();
  const state = {topics: {example: {st: 2}}, lab: {topicFav: ["eski"], custom: "koru"}};
  let saves = 0;
  assert.equal(persistScienceAction({readState: () => state, save: () => {saves++; return true;}}, "bio-cell", {kind: "status", status: "known"}), true);
  assert.equal(saves, 1);
  assert.equal(state.lab.scienceCards["bio-cell"].status, "known");
  assert.deepEqual(state.topics, {example: {st: 2}});
  assert.deepEqual(state.lab.topicFav, ["eski"]);
  assert.equal(state.lab.custom, "koru");
});

test("Bilim kaydı başarısızsa önceki işaret aynen korunur", async () => {
  const {persistScienceAction} = await service();
  const previous = {"bio-cell": {status: "review", statusAt: 10, favorite: false, favoriteAt: 0}};
  const state = {lab: {scienceCards: previous}};
  assert.equal(persistScienceAction({readState: () => state, save: () => false}, "bio-cell", {kind: "status", status: "known"}), false);
  assert.equal(state.lab.scienceCards, previous);
  const empty = {};
  assert.equal(persistScienceAction({readState: () => empty, save: () => {throw new Error("quota");}}, "bio-cell", {kind: "favorite"}), false);
  assert.deepEqual(empty, {});
});

test("Bilim kartı cevabı gizliyken metni ve değerlendirme kontrollerini açığa çıkarmaz", async () => {
  const {scienceCardMarkup} = await load("src/ui/science-card-markup.ts");
  const {SCIENCE_CARDS} = await load("src/data/science-cards.ts");
  const {EMPTY_SCIENCE_PROGRESS} = await service();
  const card = SCIENCE_CARDS[0], closed = scienceCardMarkup(card, EMPTY_SCIENCE_PROGRESS, true);
  assert.ok(!closed.includes(card.answer));
  assert.match(closed, /aria-expanded="false"/);
  assert.equal((closed.match(/ disabled /g) || []).length, 2);
  const open = scienceCardMarkup(card, EMPTY_SCIENCE_PROGRESS, false);
  assert.ok(open.includes(card.answer));
  assert.match(open, /Sık hata/);
  assert.match(open, /YKS taktiği/);
  const malicious = scienceCardMarkup({...card, title: '<img src=x onerror="bad()">', answer: "<script>bad()</script>"}, EMPTY_SCIENCE_PROGRESS, false);
  assert.ok(!malicious.includes("<img"));
  assert.ok(!malicious.includes("<script>"));
});

test("Bilim katmanı v3 gözlemcisinde kendini sürekli yeniden çizmez ve yeni arayüze devreder", () => {
  let writes = 0, mounts = 0;
  const node = {dataset: {}, set innerHTML(value) {writes++;}};
  const panel = {};
  const window = {addEventListener() {}, YKSLearningLabV2: {deepDives: {Biyoloji: [["x", "Başlık", "Özet", "Hata", "İpucu"]]}}};
  const document = {readyState: "loading", addEventListener() {}, getElementById: id => id === "v4ScienceCards" ? node : id === "v320PanelScience" ? panel : null};
  vm.runInNewContext(fs.readFileSync(path.join(root, "modules/learning-lab-v3.js"), "utf8"), {window, document});
  window.YKSLearningLabV3.renderScience();
  window.YKSLearningLabV3.renderScience();
  assert.equal(writes, 1);
  window.YKSScienceCards = {mount(target) {assert.equal(target, panel); mounts++; return true;}};
  window.YKSLearningLabV3.renderScience();
  assert.equal(mounts, 1);
  assert.equal(writes, 1);
});

test("Bilim ilerlemesi bulut JSON'unda taşınır", async () => {
  const {buildCloudPayload} = await load("src/data/cloud-state.ts");
  const scienceCards = {"bio-heart": {status: "known", statusAt: 100, favorite: true, favoriteAt: 200}};
  const result = buildCloudPayload(JSON.stringify({v: 21, lab: {scienceCards}}), "dexie");
  assert.equal(result.ok, true);
  assert.deepEqual(JSON.parse(result.json).lab.scienceCards, scienceCards);
});

test("Bilim arayüzü tekrar bağlandığında DOM'u ve dinleyicileri çoğaltmaz; arama odağını korur", async () => {
  const {stripTypeScriptTypes} = require("node:module");
  const apiModule = await service();
  const data = await load("src/data/science-cards.ts");
  const markup = await load("src/ui/science-card-markup.ts");
  class FakeElement {}
  class FakeInput extends FakeElement {value = ""; checked = false;}
  class FakeSelect extends FakeElement {value = "";}
  class FakeButton extends FakeElement {}
  const nodes = new Map();
  for (const id of ["v4ScienceSearch", "v4ScienceExam", "v4ScienceView", "v4ScienceTopic", "v4ScienceBiology",
    "v4SciencePhysics", "v4SciencePractice", "v4ScienceStats", "v4ScienceResult", "v4ScienceProgress", "v4ScienceCards"]) {
    const node = id === "v4ScienceSearch" || id === "v4SciencePractice" ? new FakeInput() : new FakeSelect();
    Object.assign(node, {id, dataset: {}, textContent: "", writes: 0, setAttribute() {}});
    Object.defineProperty(node, "innerHTML", {get() {return this.html || "";}, set(value) {this.html = value; this.writes++;}});
    nodes.set(id, node);
  }
  const listeners = [];
  const panel = {dataset: {}, querySelector: selector => nodes.get(selector.slice(1)), addEventListener: (type, fn) => listeners.push([type, fn])};
  const state = {};
  const window = {addEventListener() {}, YKSLegacyState: {readState: () => state, save: () => true}};
  const search = nodes.get("v4ScienceSearch");
  const document = {activeElement: search};
  const source = fs.readFileSync(path.join(root, "src/ui/science-cards.ts"), "utf8").replace(/^import[\s\S]*?;\r?\n/gm, "");
  const javascript = stripTypeScriptTypes(source).replace("export function installScienceCards", "function installScienceCards");
  const context = {...apiModule, ...data, ...markup, window, document, Element: FakeElement, HTMLButtonElement: FakeButton, HTMLInputElement: FakeInput, HTMLSelectElement: FakeSelect};
  vm.runInNewContext(javascript + "\nthis.install = installScienceCards;", context);
  const api = context.install();
  api.mount(panel); api.mount(panel); api.mount(panel);
  assert.equal(nodes.get("v4ScienceCards").writes, 1);
  assert.equal(listeners.length, 3);
  search.value = "BÖBREK";
  listeners.find(([type]) => type === "input")[1]({target: search});
  assert.equal((nodes.get("v4ScienceCards").innerHTML.match(/<article /g) || []).length, 1);
  assert.equal(nodes.get("v4ScienceResult").textContent, "1 / 16 biyoloji kartı");
  assert.equal(document.activeElement, search);
  api.mount(panel);
  assert.equal(nodes.get("v4ScienceCards").writes, 2);
});
