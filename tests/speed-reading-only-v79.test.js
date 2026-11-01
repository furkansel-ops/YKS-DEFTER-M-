"use strict";
const test=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path");
const root=path.resolve(__dirname,"..");
const read=p=>fs.readFileSync(path.join(root,p),"utf8");

test("v79 Merkez: Öğrenme Laboratuvarı yerine Hızlı Okuma; sayfada yalnız Hızlı Okuma görünür",()=>{
  const nav=read("src/ui/navigation-v43.ts"),css=read("src/ui/navigation-v43.css");
  assert.match(nav,/\{action:"lab",label:"Hızlı Okuma",description:"Okuma hızını ve anlamanı ölç, düzenli çalış",icon:"»"\}/);
  assert.match(nav,/\{k:"lab",label:"Hızlı Okuma",sub:"Okuma çalışması",icon:"»"\}/);
  assert.doesNotMatch(nav,/Öğrenme Laboratuvarı"/);
  assert.match(nav,/item\.k==="lab"\?\{\.\.\.item,label:"Hızlı Okuma"/,"eski hızlı erişim kısayolu da yeniden adlanır");
  assert.match(nav,/document\.documentElement\.dataset\.labRetired="true"/);
  assert.match(nav,/if\(detail\?\.to==="lab"\)openSpeedReading\(\);/);
  assert.match(nav,/setTab\("speed"\)/);
  assert.match(css,/#mrp_lab\[data-v79-speed\] #v320LearningLab>:not\(\.v320-toolbox\)/);
  assert.match(css,/\.v320-toolbox>\[id\^="v320Panel"\]:not\(#v320PanelSpeed\)\{display:none!important\}/);
  assert.match(css,/:root\[data-lab-retired\] \[data-v42-topic-action="lab"\]\{display:none!important\}/);
  // Laboratuvar kodu ve kayıtları silinmez; yalnız gizlenir.
  const html=read("index.html");
  for(const id of ["v320LearningLab","v320PanelPeriodic","v320PanelTimeline","v320PanelSpeed","speedReadingLearn"])assert.match(html,new RegExp(`id="${id}"`),id);
});

test("v79 laboratuvara giden bağlantılar kalktı: öğrenme döngüsü, arama, kişiselleştirme",()=>{
  const cycle=read("src/ui/learning-cycle-v43.ts"),search=read("modules/global-search-v42.js"),personal=read("src/ui/personalization-v43.ts");
  assert.doesNotMatch(cycle,/action\("Laboratuvar"|openLab|v4OpenLabTopic/);
  assert.match(search,/function labRetired\(\)\{return document\.documentElement\.dataset\.labRetired==="true";\}/);
  assert.match(search,/group:retired\?"Konu":"Laboratuvar"/,"müfredat konuları aramada kalır");
  assert.match(search,/if\(retired\)return out;\s*\(Array\.isArray\(lab\.elements\)/,"element ve kronoloji sonuçları aranmaz");
  assert.match(search,/window\.openTopicDetail\?\.\(result\.exam,result\.subject,result\.topic\)/,"eski konu sonucu Konular'daki konu sayfasını açar");
  assert.doesNotMatch(search,/Öğrenme Laboratuvarı içeriği/);
  assert.doesNotMatch(personal,/Laboratuvar kısayollarını/);
  assert.match(read("modules/stability.js"),/global-search-v42\.js\?v=4\.2\.0-r2/);
  assert.match(read("sw.js"),/\.\/modules\/global-search-v42\.js\?v=4\.2\.0-r2/);
  assert.match(read("index.html"),/modules\/stability\.js\?v=4\.1\.0-r30/);
});
