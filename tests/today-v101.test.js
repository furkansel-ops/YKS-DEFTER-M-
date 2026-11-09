const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");
const root=path.resolve(__dirname,"..");
const read=p=>fs.readFileSync(path.join(root,p),"utf8");
const source=read("src/ui/today-v101.ts"),css=read("src/ui/today-v101.css"),host=read("src/ui/today-top-v33.ts");
const v71=read("src/ui/today-refine-v71.ts");

function helpers(){
  const pick=(text,name)=>{
    const start=text.indexOf("export function "+name+"(");let depth=0,i=text.indexOf("{",text.indexOf(")",start));
    for(;i<text.length;i++){if(text[i]==="{")depth++;else if(text[i]==="}"&&--depth===0)break;}
    return text.slice(start,i+1);
  };
  // Tip açıklamaları silinir: "(a:T,b:U):R{" → "(a,b){"
  const strip=code=>code.replace(/export function/g,"function")
    .replace(/\((\w+):[^,)]+(?:,(\w+):[^)]+)?\):[^{]+\{/,(m,a,b)=>"("+a+(b?","+b:"")+"){");
  const code=[pick(v71,"planProgress"),pick(source,"isDayEnd"),pick(source,"doneFoldText"),pick(source,"goalPercent"),pick(source,"coachRowText")].map(strip).join("\n");
  const context=vm.createContext({Number,String,Math});
  vm.runInContext(code+";globalThis.h={isDayEnd,doneFoldText,goalPercent,coachRowText};",context);
  return context.h;
}

test("v101 ayrı isteğe bağlı parça; hata açılışı durdurmaz, kayıt mantığına dokunmaz",()=>{
  assert.match(host,/void import\("\.\/today-v101"\)/);
  assert.match(host,/dataset\.todayV101=installTodayV101\(\)\.installed\?"ready":"deferred"/);
  assert.match(host,/console\.error\("Yeni Bugün yüklenemedi",error\)/);
  assert.doesNotMatch(source,/cloneNode|\.innerHTML\s*=|insertAdjacentHTML|localStorage|save\(/);
  assert.match(source,/if\(fresh\.dataset\.v101==="ready"\)return \{installed:true\};/);
});

test("v101 yardımcıları: gün sonu 18:00, katlama metni, hedef yüzdesi, koç satırı",()=>{
  const h=helpers();
  assert.equal(h.isDayEnd(new Date(2026,10,9,17,59)),false);
  assert.equal(h.isDayEnd(new Date(2026,10,9,18,0)),true);
  assert.equal(h.doneFoldText(2,false),"2 görev tamamlandı · Göster","tik simgesi CSS'te çizilir");
  assert.equal(h.doneFoldText(1,true),"1 görev tamamlandı · Gizle");
  assert.equal(h.goalPercent("86 / 120"),72);
  assert.equal(h.goalPercent("70 / 180 dk"),39);
  assert.equal(h.goalPercent("200 / 120"),100,"hedef aşılınca çubuk taşmaz");
  assert.equal(h.goalPercent("60"),null,"hedef yoksa çubuk yok");
  assert.equal(h.coachRowText({count:1,text:""}),"Koçundan yeni mesaj");
  assert.equal(h.coachRowText({count:3,text:""}),"Koçundan 3 yeni mesaj");
});

test("v101 gözlemcisi yalnız başkalarının düğümlerini izler (v70 donma tuzağı)",()=>{
  assert.match(source,/function set\(node:Element\|null,value:string\):void\{if\(node&&node\.textContent!==value\)/);
  assert.match(source,/watch\.observe\(list,/);
  assert.doesNotMatch(source,/watch\.observe\((fold|fresh|tasks|document)/);
});

test("v101: dağılım/ritim/tekrar Bugün'den kalkar, gün sonu akşam, koç satırı olaydan, misafir uyarısı Merkez'de",()=>{
  assert.match(css,/:is\(#todayFreshSubjects,#todayFreshInsights,#todayFreshActivity,\.v71-plan\)\{display:none\}/);
  assert.match(css,/#todayFreshStart:not\(\.v101-eve\)>#v71Rows\{display:none\}/);
  assert.match(source,/addEventListener\("yks:coach-unread"/);
  const link=read("public/student-coach-link.js");
  assert.match(link,/new CustomEvent\("yks:coach-unread",\{detail:\{count:fresh\.length/);
  assert.match(link,/markStudentRead\(\);announceUnread\(\);/);
  assert.match(read("src/ui/auth-welcome-v60.ts"),/const host=document\.getElementById\("more"\);/);
  assert.match(read("app.js"),/hi=hr>=5&&hr<12\?"Günaydın":hr>=12&&hr<18\?"İyi günler":"İyi akşamlar"/);
});

test("v101 hareketleri yalnız hareket tercihi açıkken; transform/opacity ile",()=>{
  const at=css.indexOf("@media(prefers-reduced-motion:no-preference)");
  assert.ok(at>0,"hareket bloğu var");
  const motion=css.slice(at),before=css.slice(0,at);
  for(const name of ["v101-rise","v101-pop","v101-fill","v101-sheen","v101-float","v101-glow"])assert.match(motion,new RegExp("animation:"+name));
  assert.doesNotMatch(before,/animation:/,"hareket bloğu dışında animasyon yok");
  const frames=before.match(/@keyframes[^\n]+/g)||[];
  assert.ok(frames.length>=6);
  for(const line of frames)assert.doesNotMatch(line,/[{;](width|height|top|left|margin):/,line);
});

test("v101 bilgisayarda randevu kartı sağ sütunda kendi satırında; görevlerin/sayıların üstüne binmez",()=>{
  const wide=css.slice(css.indexOf("@media(min-width:1024px)"));
  assert.match(wide,/>:is\(#studentNextAppointment,#studentApptEntry\)\{grid-area:auto;grid-column:2;grid-row:4;align-self:start\}/);
  assert.match(wide,/\.today-fresh-stats\{grid-column:2;grid-row:5\}/);
  assert.match(wide,/\.today-fresh-tasks\{grid-column:1;grid-row:5 \/ span 4\}/);
});
