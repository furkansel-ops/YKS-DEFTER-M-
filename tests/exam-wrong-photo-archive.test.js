const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
const read=file=>fs.readFileSync(path.join(root,file),"utf8");

test("deneme analizi yanlış kaydına not ve çoklu fotoğraf bağlar",()=>{
  const app=read("app.js"),html=read("index.html");
  assert.match(html,/id="anaNote"/);
  assert.match(html,/Neyi kaçırdın\? Doğru yaklaşım neydi\?/);
  assert.match(app,/note:note,questionImgs:\[\]/);
  assert.match(app,/inp\.multiple=true/);
  assert.match(app,/Array\.from\(inp\.files\|\|\[\]\)\.slice\(0,remaining\)/);
  assert.match(app,/ana-photo-btn/);
});

test("deneme yanlışlarının fotoğrafları mevcut yanlış soru arşivinde gösterilir",()=>{
  const app=read("app.js"),html=read("index.html"),css=read("app.css");
  assert.match(html,/id="examWrongArchiveGrid"/);
  assert.match(html,/Fotoğraflı yanlış arşivi/);
  assert.match(app,/function renderExamWrongArchive/);
  assert.match(app,/function examWrongArchiveRows/);
  assert.match(app,/wrongPhotoOpen\('\+w\.id\+'[,]?'/);
  assert.match(css,/\.exam-wrong-archive-grid/);
  assert.match(css,/\.exam-wrong-card/);
  assert.match(css,/body > \.qaviewer\{/);
  assert.match(css,/transform:none!important;z-index:20000!important/);
  assert.match(app,/ov\.style\.transform="none"/);
  assert.match(app,/ov\.style\.zIndex="20000"/);
});

test("deneme fotoğraf görüntüleyicisi serbest qbank kaydını yanlışlıkla silmez",()=>{
  const app=read("app.js");
  assert.match(app,/function ensureWrongPhotoViewer/);
  assert.match(app,/showModal/);
  assert.match(app,/function renderWrongPhotoViewer/);
  assert.match(app,/wrongPhotoRemove\(state\.id,state\.index\)/);
  assert.match(app,/wrongPhotoViewerStep/);
  assert.match(css,/\.wrong-photo-viewer::backdrop/);
});

test("Hata Defteri deneme analiz notunu tekrar kaydında korur",()=>{
  const mod=read("modules/error-journal.js");
  assert.match(mod,/const analysisNote=norm\(wrong\.note\)/);
  assert.match(mod,/note:analysisNote/);
});
