const test=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const {stripTypeScriptTypes}=require("node:module");
const root=path.resolve(__dirname,".."),read=p=>fs.readFileSync(path.join(root,p),"utf8");
const wheelSrc=read("src/ui/time-wheel-v157.ts"),places=read("src/ui/time-wheel-places-v157.ts"),sheet=read("src/ui/program-etut-sheet.ts"),app=read("app.js");

function helpers(){
  const code=stripTypeScriptTypes(wheelSrc,{mode:"strip"}).replace(/^import[^\n]*\n/gm,"").replace(/^export /gm,"");
  const context={};vm.createContext(context);
  vm.runInContext(code+"\n;globalThis.__t={wheelValue,wheelParse,wheelSpan,wheelClock};",context);
  return context.__t;
}

test("v157 tekerlek değeri: saat 0–23, dakika 5'er; taşan konum uca sabitlenir",()=>{
  const h=helpers();
  assert.equal(h.wheelValue(0,0),0);
  assert.equal(h.wheelValue(18*40,6*40),18*60+30);
  assert.equal(h.wheelValue(18*40+15,6*40-15),18*60+30,"yarım satırdan az kayma en yakın satıra oturur");
  assert.equal(h.wheelValue(99999,99999),23*60+55);
  assert.equal(h.wheelValue(-50,-50),0);
  assert.equal(h.wheelClock(9*60+5),"09:05");
  assert.equal(h.wheelSpan(90),"1 sa 30 dk");assert.equal(h.wheelSpan(45),"45 dk");assert.equal(h.wheelSpan(120),"2 sa");
});

test("v157 kayıtlı saat tekerleğe 5 dakikaya yuvarlanarak gelir; bozuk değerde varsayılan",()=>{
  const h=helpers();
  assert.equal(h.wheelParse("21:00",0),21*60);
  assert.equal(h.wheelParse("21:03",0),21*60+5);
  assert.equal(h.wheelParse("23:59",0),23*60+55,"60'a yuvarlanıp ertesi saate taşmaz");
  assert.equal(h.wheelParse("",1260),1260);assert.equal(h.wheelParse("9:00",1260),1260);
});

test("v157 Etüt: başlangıç/bitiş tek tekerlekle; değerler gizli saat alanlarında, başlangıç kayınca süre korunur",()=>{
  assert.match(sheet,/import \{createTimeWheel,createWheelTabs\} from "\.\/time-wheel-v157";/);
  assert.match(sheet,/const tabs=createWheelTabs\(\[\["start","Başlangıç"\],\["end","Bitiş"\]\] as const/);
  assert.match(sheet,/length=start>=0&&end>start\?end-start:DEFAULT_LENGTH;startInput\.value=etutClock\(minutes\);endInput\.value=etutClock\(Math\.min\(MAX_END,minutes\+length\)\)/);
  assert.match(sheet,/ok:value=>which==="start"\?value<=MAX_END-30:value>=toTime\(startInput\.value\)\+30&&value<=MAX_END/,"bitiş başlangıçtan en az 30 dk sonra");
  assert.match(sheet,/startBox\.append\(tabs\.element,wheel\.element,chipLabel,startChips,lengthChips\);/);
  assert.doesNotMatch(sheet,/rbEtutStart|rbEtutEnd|rb-etut-time-field/,"eski saat kutuları ekranda yok");
  assert.match(sheet,/longLate\.disabled=shift\.later===null;\n    paintPicker\(true\);/,"her güncellemede tekerlek yerine oturur");
});

test("v157 Odak ve Ayarlar: eski alanlar gizlenir, kayıt eski işlevlerden geçer",()=>{
  assert.match(read("src/ui/refined-shell.ts"),/try\{installTimeWheelsV157\(\);\}catch/);
  // Şu saate kadar: süre yalnız sayaç boştayken ayarlanır, ancak o zaman başlatılır.
  assert.match(app,/function startFocusUntil\(\)\{ if\(applyFocusUntilTime\(\)\)togglePomo\(\); \}/);
  assert.match(app,/if\(!setPhaseMin\(minutes\)\)return false;/);
  assert.match(places,/go\.addEventListener\("click",\(\)=>\{paint\(\);call\("startFocusUntil"\);\}\);/);
  assert.match(places,/ok:at=>at>=first\(\),fix:\(\)=>first\(\)/,"geçmiş saat seçilemez");
  // Süre ekle: tekerlek değeri addManualFocus'un okuduğu alanlara yazılır; bitiş şimdiyi geçemez.
  assert.match(places,/hours\.value=String\(Math\.floor\(total\/60\)\);minutes\.value=String\(total%60\);start\.value=wheelClock\(s\.start\);/);
  assert.match(places,/value>=s\.start\+5&&value<=last\(\)/);
  assert.match(places,/duration\.dataset\.twHide="";duration\.after\(box\);/);
  // Akşam hatırlatması: tekerlek durunca ayarlardaki mevcut Kaydet çalışır.
  assert.match(places,/const commit=\(\)=>\{save\.click\(\);chips\.paint\(\);\};/);
  assert.match(places,/done:commit/);
  assert.match(places,/evening\("ymsNotifTime",".yms-time-row","\[data-yms-notif-time\]"\),\(\)=>evening\("notifTime",".row2","button"\)/,"yeni ve eski ayarlar kartı");
  assert.match(places,/row\.dataset\.twHide="";/);
});

test("v157 tekerlek stilinde ham renk yok; seçili satır ve üstü çizili satır ayrı görünür",()=>{
  const css=read("src/ui/time-wheel-v157.css");
  assert.match(wheelSrc,/import "\.\/time-wheel-v157\.css";/);
  assert.doesNotMatch(css,/#[0-9a-fA-F]{3,8}\b|rgba?\(/,"yalnız tema belirteçleri");
  assert.match(css,/\.tw-item\.tw-off\{[^}]*line-through/);
  assert.match(css,/scroll-snap-type:y mandatory/);
  assert.match(css,/\[data-tw-hide\]\{display:none!important\}/,"eski alanlar sayfa kurallarına rağmen gizli");
});
