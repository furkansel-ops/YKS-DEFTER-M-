const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const {pathToFileURL}=require("node:url");

const root=path.resolve(__dirname,"..");
const url=file=>pathToFileURL(path.join(root,file)).href;
const read=file=>fs.readFileSync(path.join(root,file),"utf8");

test("global arama Türkçe metni normalize eder ve tam başlığı öne alır",async()=>{
  const {normalizeSearchText,rankSearchResults}=await import(url("src/ui/global-search-core.ts"));
  assert.equal(normalizeSearchText("  İŞ-GÜÇ  "),"is-guc");
  assert.equal(normalizeSearchText("Işık"),"isik");
  const rows=[
    {group:"Konu",title:"İntegral",detail:"AYT Matematik",screen:"topics"},
    {group:"Konu",title:"Türev ve İntegral",detail:"AYT Matematik",screen:"topics"},
    {group:"Not",title:"İntegral notu",detail:"Günlük",screen:"home"}
  ];
  const result=rankSearchResults("integral",rows);
  assert.equal(result[0].title,"İntegral");
});

test("global arama çoklu kelimede bütün tokenları ister ve tekrar sonuçları temizler",async()=>{
  const {rankSearchResults}=await import(url("src/ui/global-search-core.ts"));
  const row={group:"Konu",title:"Basit Harmonik Hareket",detail:"AYT Fizik",screen:"topics"};
  const result=rankSearchResults("harmonik fizik",[row,{...row},{group:"Konu",title:"Harmonik",detail:"AYT Matematik",screen:"topics"}]);
  assert.equal(result.length,1);assert.equal(result[0].title,"Basit Harmonik Hareket");
});

test("hızlı geçişler manuel Program kuralını korur ve temel ekranları kapsar",async()=>{
  const {GLOBAL_SEARCH_SHORTCUTS}=await import(url("src/ui/global-search-core.ts"));
  const titles=GLOBAL_SEARCH_SHORTCUTS.map(x=>x.title);
  for(const title of ["Bugün","Program","Konular","Denemeler","İlerleme","Odak","Öğrenme Laboratuvarı"])assert.ok(titles.includes(title),title);
  const program=GLOBAL_SEARCH_SHORTCUTS.find(x=>x.title==="Program");
  assert.match(program.detail,/Manuel/);
  assert.equal(GLOBAL_SEARCH_SHORTCUTS.some(x=>/otomatik program/i.test(x.detail)),false);
});

test("komut paleti klavye, yönlendirme, konu odağı ve erişilebilirlik sözleşmesini taşır",()=>{
  const runtime=read("src/ui/global-search.ts"),css=read("src/ui/global-search.css"),main=read("src/main.ts");
  assert.match(runtime,/event\.ctrlKey\|\|event\.metaKey/);
  assert.match(runtime,/ArrowDown/);assert.match(runtime,/ArrowUp/);assert.match(runtime,/Enter/);assert.match(runtime,/Escape/);
  assert.match(runtime,/window\.openGlobalSearch=open/);assert.match(runtime,/window\.__YKS_GLOBAL_SEARCH__=api/);
  assert.match(runtime,/window\.__YKS_UI__/);assert.match(runtime,/focusTopic/);assert.match(runtime,/topicSearch/);
  assert.match(runtime,/aria-modal/);assert.match(runtime,/role=\\"listbox\\"/);
  assert.match(css,/@media \(max-width:759px\)/);assert.match(css,/pointer:coarse/);assert.match(css,/prefers-reduced-motion:reduce/);
  assert.match(main,/installGlobalSearch/);assert.match(main,/v42GlobalSearchVersion/);
});
