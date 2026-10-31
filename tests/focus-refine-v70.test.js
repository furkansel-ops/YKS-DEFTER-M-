const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");
const root=path.resolve(__dirname,"..");
const read=p=>fs.readFileSync(path.join(root,p),"utf8");
const source=read("src/ui/focus-refine-v70.ts");
const css=read("src/ui/focus-refine-v70.css");
const host=read("src/ui/focus-smart-picker-v58.ts");

// focusTodayText tek başına VM'de çalıştırılır (tip açıklamaları ayıklanır).
function todayText(){
  const start=source.indexOf("export function focusTodayText("),end=source.indexOf("\n}\n",start)+3;
  const code=source.slice(start,end).replace("export function","function").replace("(minutes:number,sessions:number):string","(minutes,sessions)");
  const context=vm.createContext({});
  vm.runInContext(code+";globalThis.fn=focusTodayText;",context);
  return context.fn;
}

test("v70 Odak iyileştirmesi v59'dan hemen sonra kurulur; eski düğümler taşınır, kopyalanmaz",()=>{
  assert.match(host,/import \{installFocusRefineV70\} from "\.\/focus-refine-v70";/);
  assert.match(host,/installFocusCompactV59\(setup,section\);\n  installFocusRefineV70\(\);/);
  assert.doesNotMatch(source,/cloneNode|\.innerHTML\s*=|insertAdjacentHTML/);
  assert.doesNotMatch(source,/S\.pomoMin|S\.sessions|save\(|setPhaseMin|togglePomo|skipPhase/,"sayaç ve kayıt mantığına dokunulmaz");
  for(const id of ["pomoTodayMin","quickWrap","quickMins","refinedFocusDetails","focusNotificationControls","fb_odakayar","focusCard","noteBox","v29ActualQ","v29GoalQ"])
    assert.ok(source.includes('"'+id+'"'),id);
  assert.match(source,/if\(root\.dataset\.v70==="ready"\)return true;/);
});

test("v70 bugünkü toplam: saat/dakika, oturum yalnız varsa; hiç çalışılmadıysa ayrı cümle",()=>{
  const fn=todayText();
  assert.equal(fn(0,0),"Bugün henüz odaklanmadın");
  assert.equal(fn(10,0),"Bugün 10 dk","yarıda kalan sayaç oturum saymaz");
  assert.equal(fn(45,2),"Bugün 45 dk · 2 oturum");
  assert.equal(fn(60,1),"Bugün 1 sa · 1 oturum");
  assert.equal(fn(80,3),"Bugün 1 sa 20 dk · 3 oturum");
  assert.equal(fn(-5,"x"),"Bugün henüz odaklanmadın");
});

test("v70 başlık: Minimal düğmesi başlıkla aynı satırda; #pomo ızgarasına tek kutu girer",()=>{
  assert.match(source,/row\.append\(title,minimal\)/);
  assert.match(source,/box\.append\(row,today\)/);
  assert.match(source,/title\.insertAdjacentElement\("beforebegin",box\)/);
  assert.doesNotMatch(source,/box\.insertAdjacentElement\("afterend"/,"bugün satırı #pomo'ya ayrı çocuk olarak eklenmez");
  assert.match(css,/#pomo \.v70-head-row\{display:flex/);
});

test("v70 1: 'Ne çalışıyorsun?' kartı tek sütunlu düzende sayacın üstünde; geniş ekran aynen kalır",()=>{
  assert.match(source,/side\.classList\.add\("v70-setup-side"\)/);
  assert.match(source,/label\.textContent="Ne çalışıyorsun\?"/);
  assert.match(css,/@media\(max-width:979px\)\{[^}]*\.desktop-focus-side\.v70-setup-side\{order:-2\}/);
});

test("v70 2: süre tek sıra + Özel; ayrıntılar yalnız Özel açıkken, hazır süre Özel'i kapatır",()=>{
  assert.match(source,/make\("button","qbtn v70-custom-btn","Özel"\)/);
  assert.match(source,/custom\.setAttribute\("aria-controls",customBox\.id\)/);
  assert.match(source,/custom\.classList\.toggle\("on",!mins\.querySelector\("\.qbtn\.on"\)\)/,"özel süre seçiliyken Özel işaretli");
  assert.match(source,/closest\("\.qbtn"\)\)setOpen\(false\)/);
  assert.match(css,/#quickWrap\.v70-quick:not\(\.v70-custom-open\)>:is\(\.quickhead,\.focus-custom-time,#focusCustomStatus\)\{display:none!important\}/);
  assert.match(css,/#quickWrap\.v70-quick #quickMins\{display:flex!important/);
});

test("v70 3: çalışma evresi uygulamanın mavisi; gece temasında Başlat yazısı koyu",()=>{
  assert.match(css,/#focusCard\[data-phase="work"\]\{--phase:var\(--rb-accent,var\(--accent\)\)\}/);
  assert.match(css,/\.playbtn\{background:var\(--rb-accent,var\(--accent\)\);color:var\(--rb-on-accent,#fff\)\}/);
  assert.match(css,/\.rprog\{stroke:var\(--rb-accent,var\(--accent\)\)\}/);
  assert.doesNotMatch(css,/data-phase="break"/,"mola rengi değişmez");
});

test("v70 4 · 6: bildirim kontrolü Odak ayarlarında; kapalı kutu açık araç listesi, hiçbir bölüm kaybolmaz",()=>{
  assert.match(source,/settings\.prepend\(panel\)/);
  for(const title of ["Bugünün oturumları","Elle süre ekle","Nefes egzersizi","Sınav provası","Geçmiş ve analiz","Odak ayarları","Diğer odak araçları"])assert.ok(source.includes('title:"'+title+'"'),title);
  assert.match(source,/if\(tool\.fold\)row\.addEventListener\("toggle",\(\)=>\{if\(row\.open\)win\.openFold\?\.\(tool\.fold!\);\}\)/);
  assert.match(source,/details\.open=true;details\.dataset\.v70="list";/);
  assert.match(source,/body\("other"\)\.append\(node\)/,"sonradan eklenen bölüm Diğer'e gider");
  assert.match(css,/#refinedFocusDetails\[data-v70="list"\]>summary\{display:none\}/);
  assert.match(css,/\.v70-tool-body>\.foldhead\{display:none!important\}/);
});

test("v70 8: çalışırken süre ayarları gizli; soru sayacı yeni oturumda sıfırlanır, kapanışta boşsa yazılır",()=>{
  assert.match(css,/#focusCard\[data-run="running"\] #quickWrap\{display:none!important\}/);
  assert.match(css,/#focusCard\[data-phase="work"\]:is\(\[data-run="running"\],\[data-run="paused"\]\) \.v70-questions\{display:flex\}/);
  assert.match(source,/if\(last==="idle"&&now==="running"\)count=0;/);
  assert.match(source,/note\.style\.display!=="none"&&count>0&&!actual\.value/);
  assert.match(source,/actual\.dispatchEvent\(new Event\("input",\{bubbles:true\}\)\)/);
  assert.match(source,/minus\.setAttribute\("aria-label","Bir soru azalt"\)/);
  assert.match(source,/try\{return Math\.max\(0,Math\.min\(999,Number\(localStorage\.getItem\(QUESTION_KEY\)\)\|\|0\)\);\}catch\{return 0;\}/);
});

test("v70 stilleri yalnız tema değişkenleri kullanır",()=>{
  // Değer içindeki renk kodu (":#…", ",#…", "(#…") yasak; tek istisna açık mavinin üstündeki yazı yedeği.
  const values=css.replace(/var\(--rb-on-accent,#fff\)/g,"");
  assert.deepEqual(values.match(/[:,(\s]#[0-9a-fA-F]{3,8}\b/g)||[],[]);
  assert.doesNotMatch(css,/rgba?\(|hsl\(/);
});
