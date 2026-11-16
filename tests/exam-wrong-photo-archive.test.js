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
  assert.match(app,/inp\.multiple=!qaIsIPadLike\(\)/);
  assert.match(app,/inp\.accept="image\/\*"/);
  assert.match(app,/URL\.createObjectURL\(file\)/);
  assert.match(app,/createImageBitmap/);
  assert.match(app,/qaCanvasJpeg/);
  assert.match(html,/id="qaFile" accept="image\/jpeg,image\/png,image\/webp"/);
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
  const app=read("app.js"),css=read("app.css");
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


test("iPad deneme fotoğrafı HEIC yerine uygulama içi kameradan JPEG yakalar",()=>{
  const app=read("app.js"),css=read("app.css");
  assert.match(app,/function qaIsIPadLike/);
  assert.match(app,/Macintosh.*maxTouchPoints/);
  assert.match(app,/navigator\.mediaDevices\.getUserMedia/);
  assert.match(app,/facingMode:\{ideal:"environment"\}/);
  assert.match(app,/cv\.toDataURL\("image\/jpeg",QA_QUALITY\)/);
  assert.match(app,/function wrongPhotoStore/);
  // v134: her cihazda önce kamera; kamera açılmazsa galeriye kendiliğinden düşmez, telefonun kamerası önerilir.
  const pick=app.match(/function wrongPhotoPick\(id\)\{[\s\S]*?\n\}/)[0];
  assert.match(pick,/void openWrongPhotoCamera\(id\);\n\}$/);assert.doesNotMatch(pick,/wrongPhotoPickFile|qaIsIPadLike/);
  const open=app.match(/async function openWrongPhotoCamera\(id\)\{[\s\S]*?\n\}/)[0];
  assert.doesNotMatch(open,/wrongPhotoPickFile/,"hata olunca galeri açılmaz");
  assert.match(open,/wrongPhotoCameraNative=true;/);
  assert.match(app,/if\(wrongPhotoCameraNative\)\{const id=wrongPhotoCameraId;closeWrongPhotoCamera\(\);wrongPhotoPickFile\(id,true\);return;\}/);
  assert.match(app,/if\(camera\)\{inp\.setAttribute\("capture","environment"\);inp\.multiple=false;\}/);
  assert.match(app,/id="wrongPhotoCameraFallback">Galeriden seç</,"galeri ikinci seçenek olarak durur");
  assert.match(app,/inp\.accept="image\/\*"/);
  assert.match(css,/\.wrong-photo-camera::backdrop/);
  assert.match(css,/\.wrong-photo-camera-stage video/);
});
