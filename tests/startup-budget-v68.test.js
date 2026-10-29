const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");

const root=path.resolve(__dirname,"..");
const read=file=>fs.readFileSync(path.join(root,file),"utf8");

test("v68 açılışta gerekmeyen modüller ana pakete girmez: bilim kartları ve hocalar v2 tembel yüklenir",()=>{
  const main=read("src/main.ts");
  assert.doesNotMatch(main,/^import[^\n]*\.\/ui\/science-cards"/m);
  assert.doesNotMatch(main,/^import[^\n]*\.\/ui\/teachers-v2"/m);
  assert.match(main,/void import\("\.\/ui\/science-cards"\)\s*\.then\(\(\{installScienceCards\}\)=>\{installOptional<unknown>\("science-cards",\(\)=>installScienceCards\(\),null\);\}\)/);
  assert.match(main,/if\(lt\)document\.documentElement\.dataset\.teacherVideosRuntime="legacy-core";\nelse void import\("\.\/ui\/teachers-v2"\)/);
  const offline=read("vite.config.mts");
  for(const module of ["src/ui/science-cards.ts","src/ui/teachers-v2.ts","src/ui/shell-countdown-v67.ts"])
    assert.ok(offline.includes('"'+module+'"'),module+" çevrimdışı açılış listesinde olmalı");
});

test("v68 Bugün açılış stilleri index.html dışında ama head içinde, app.css'ten önce bağlanır",()=>{
  const html=read("index.html"),css=read("src/ui/today-fresh-start-v35.css");
  const link='<link rel="stylesheet" id="todayFreshStartStyles" href="./src/ui/today-fresh-start-v35.css">';
  assert.equal(html.split(link).length-1,1);
  assert.ok(html.indexOf(link)<html.indexOf('href="./app.css"'));
  assert.ok(html.indexOf(link)<html.indexOf("</head>"));
  assert.doesNotMatch(html,/<style id="todayFreshStartStyles">/);
  assert.match(css,/#home>:not\(#todayFreshStart\)\{display:none!important\}|#home\s*>\s*:not\(#todayFreshStart\)\s*\{\s*display:none!important\s*\}/);
  // Kaynak bütçesinde yeni özellikler için pay kalmalı (bütçe 180000).
  assert.ok(Buffer.byteLength(html,"utf8")<=165000,"index.html yeniden şişmemeli: "+Buffer.byteLength(html,"utf8"));
});
