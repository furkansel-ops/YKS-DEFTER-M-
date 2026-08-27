const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function lab() {
  const nodes = new Map();
  for (const id of ['v320Timeline', 'v327TimelineResultMeta', 'v320TimelineFavOnly',
    'v320ElementGrid', 'v320ElementDetail', 'v327ElementResultMeta', 'v320ElementFavOnly', 'v320LabSummary']) {
    nodes.set(id, { innerHTML: '', textContent: '', checked: false, classList: { toggle() {} } });
  }
  let saves = 0;
  const context = {
    window: {}, S: { lab: { paragraphLog: [], elementFav: [], timelineFav: [], topicFav: [] } },
    document: { readyState: 'loading', addEventListener() {}, getElementById: id => nodes.get(id) || null },
    save() { saves++; }
  };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../modules/learning-lab.js'), 'utf8'), context);
  // v3 owns tab navigation; the removed paragraph panel must not be needed for a refresh.
  return { win: context.window, state: context.S.lab, node: id => nodes.get(id), saves: () => saves };
}

test('Kronoloji favorisi eski sekme durumundan bağımsız olarak yıldızı ve özeti anında yeniler', () => {
  const app = lab(), id = app.win.YKSLearningLab.timeline[0].id;
  app.win.v320RenderTimeline();
  app.win.v320ToggleTimeline(id);
  assert.equal(app.state.timelineFav.includes(id), true);
  assert.match(app.node('v320Timeline').innerHTML, /aria-pressed="true"/);
  assert.match(app.node('v320LabSummary').innerHTML, /<b>1<\/b> tarih favorisi/);
  assert.equal(app.saves(), 1);

  app.node('v320TimelineFavOnly').checked = true;
  app.win.v320RenderTimeline();
  assert.equal((app.node('v320Timeline').innerHTML.match(/<article /g) || []).length, 1);
  app.win.v320ToggleTimeline(id);
  assert.equal(app.state.timelineFav.length, 0);
  assert.match(app.node('v320Timeline').innerHTML, /Bu filtrede olay bulunamadı/);
  assert.match(app.node('v327TimelineResultMeta').textContent, /^0 olay/);
  assert.equal(app.saves(), 2);
});

test('Periyodik tablo favorisi eski sekme durumundan bağımsız olarak kartı ve filtreyi yeniler', () => {
  const app = lab();
  app.win.v320RenderElements();
  app.win.v320ToggleElement(26);
  assert.match(app.node('v320ElementDetail').innerHTML, /aria-pressed="true"/);
  assert.match(app.node('v320ElementGrid').innerHTML, /fav active/);
  assert.match(app.node('v320LabSummary').innerHTML, /<b>1<\/b> element favorisi/);
  app.node('v320ElementFavOnly').checked = true;
  app.win.v320RenderElements();
  app.win.v320ToggleElement(26);
  assert.equal(app.state.elementFav.length, 0);
  assert.match(app.node('v320ElementDetail').innerHTML, /aria-pressed="false"/);
  assert.match(app.node('v320ElementGrid').innerHTML, /Bu filtrelere uyan element yok/);
  assert.equal(app.saves(), 2);
});
