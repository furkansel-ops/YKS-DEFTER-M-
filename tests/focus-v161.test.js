const test=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const {stripTypeScriptTypes}=require("node:module");
const root=path.resolve(__dirname,".."),read=p=>fs.readFileSync(path.join(root,p),"utf8");
const source=read("src/ui/focus-v161.ts"),css=read("src/ui/focus-v161.css");

// Saf yardımcılar DOM olmadan çalışır; focusDuration v107'den gelir.
function load(){
  const strip=code=>stripTypeScriptTypes(code,{mode:"strip"}).replace(/^import[^\n]*\n/gm,"").replace(/^export /gm,"");
  const v107=strip(read("src/ui/focus-v107.ts")),pick=name=>{const m=source.match(new RegExp("export function "+name+"\\([\\s\\S]*?\\n\\}"));assert.ok(m,name);return m[0];};
  const context=vm.createContext({});
  vm.runInContext(v107+"\n"+strip(pick("focusGoalView")+"\n"+pick("minimalTours"))+";globalThis.t={focusGoalView,minimalTours};",context);
  return context.t;
}

test("v161 hedef kartı: derslere göre çubuk, kalan süre ve tur; hedef yoksa yüzde ve kalan yok",()=>{
  const {focusGoalView}=load();
  const list=[{m:50,subj:"Matematik"},{m:25,subj:"Türkçe"},{m:10,subj:"Matematik"},{m:0,subj:"Boş"},null];
  const v=focusGoalView(85,180,list,25);
  assert.equal(v.total,"1 sa 25 dk");assert.equal(v.goal,"/ 3 sa");assert.equal(v.pct,47);assert.equal(v.count,3);
  assert.deepEqual(Array.from(v.bars,b=>[b.subject,b.minutes,b.width]),[["Matematik",60,33.3],["Türkçe",25,13.9]]);
  assert.deepEqual([...v.left],["1 sa 35 dk"," kaldı · 25 dk'lık 4 tur"]);
  assert.deepEqual([...focusGoalView(200,180,[],25).left],["Günlük hedef tamam",""]);
  const none=focusGoalView(30,0,[{m:20,subj:""}],25);
  assert.equal(none.pct,null);assert.equal(none.goal,"");assert.equal(none.left,null);
  assert.deepEqual(Array.from(none.bars,b=>[b.subject,b.minutes,b.width]),[["Genel çalışma",20,66.7],["",10,33.3]],"oturuma yazılmamış dakika adsız parça");
  assert.equal(focusGoalView(0,0,null,0).bars.length,0);
});

test("v161 Minimal turları: biten turlar dolu, içindeki tur yüzdesi kadar",()=>{
  const {minimalTours}=load();
  assert.deepEqual([...minimalTours(4,0,25)],[25,0,0,0]);
  assert.deepEqual([...minimalTours(4,2,50)],[100,100,50,0]);
  assert.deepEqual([...minimalTours(4,4,10)],[10,0,0,0],"uzun moladan sonra baştan");
  assert.equal(minimalTours(0,0,0).length,4);assert.equal(minimalTours(20,0,0).length,8);
});

test("v161 kurulum: v107'den sonra; sayaç ve kayıt mantığını değiştirmez",()=>{
  const host=read("src/ui/focus-smart-picker-v58.ts");
  assert.match(host,/import \{installFocusV161\} from "\.\/focus-v161";/);
  assert.match(host,/installFocusV107\(\);\n  installFocusV161\(\);/);
  assert.doesNotMatch(source,/\.innerHTML\s*=|insertAdjacentHTML|localStorage/);
  assert.doesNotMatch(source,/S\.pomoMin\s*=|S\.sessions\s*=|save\(|togglePomo|setFocusMode/,"sayaç ve kayıt mantığına dokunulmaz");
  assert.match(source,/chip\.addEventListener\("click",\(\)=>what\.click\(\)\)/,"ders etiketi v107'nin açıcısını kullanır");
  assert.match(source,/if\(quick\.nextElementSibling!==controls\)controls\.before\(quick\)/,"süreler Başlat'ın üstünde");
  assert.match(source,/call\(isStopwatch\(\)\?"swReset":"resetPomo"\)/);
  assert.match(source,/const key=JSON\.stringify\(view\);if\(key===last\)return;last=key;/,"aynı içerik yeniden çizilmez");
});

test("v161 görünüm: eski Bugün kartı ve Hızlı ara gizli, Deneme modu satırı yok; ham renk yok",()=>{
  assert.match(css,/#pomo\.v161 #v107Today,/);
  assert.match(css,/\.v70-tool:is\(\[data-tool="settings"\],\[data-tool="sessions"\],\[data-tool="exam"\]\):not\(\[open\]\)\{display:none\}/);
  assert.match(css,/\.v29-minimal-overlay\[data-v161\] \.v29-minimal-secondary,/);
  assert.match(css,/@media\(min-width:1280px\)\{\s*:root\[data-visual-system\] #mainWrap #pomo>\.v161-goal\{grid-column:1;grid-row:4/);
  assert.deepEqual(css.replace(/url\("data:[^"]*"\)/g,"").match(/#[0-9a-f]{3,8}\b/gi)||[],[],"ham renk yok");
  assert.doesNotMatch(css,/rgba?\(|hsl\(|animation:/);
});
