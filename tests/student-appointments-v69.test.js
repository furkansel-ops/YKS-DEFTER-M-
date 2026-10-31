const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");

const root=path.resolve(__dirname,"..");
const read=file=>fs.readFileSync(path.join(root,file),"utf8");
const source=read("public/student-appointments.js");

// Modül DOM olmadan çalıştırılır; iç fonksiyonlara test için ulaşılır.
function load(){
  const writes=[],auth={};
  const batch=()=>{const ops=[];writes.push(ops);return{set:(ref,data)=>ops.push({op:"set",path:ref.path,data}),delete:ref=>ops.push({op:"delete",path:ref.path}),commit:async()=>{}}};
  const context={
    window:{YKSAccountAuth:auth,addEventListener(){},dispatchEvent(){}},
    document:{documentElement:{dataset:{},classList:{add(){},remove(){}}},getElementById:()=>null,querySelector:()=>null,head:{append(){}},createElement:()=>({}),body:null},
    collection:(_db,name)=>({name}),doc:(_db,...parts)=>({path:parts.join("/")}),query:(...x)=>x,where:(...x)=>x,
    getDoc:async()=>({exists:()=>false}),getDocs:async()=>({docs:[]}),onSnapshot:()=>()=>{},
    serverTimestamp:()=>"NOW",writeBatch:batch,confirm:()=>true,setInterval:()=>1,clearInterval(){},setTimeout(){},
    MutationObserver:class{observe(){}disconnect(){}},CustomEvent:class{},console,Intl,Date,Set,Map,Number,String,Math,Array,Object,JSON,Promise
  };
  context.window.toast=()=>{};
  vm.createContext(context);
  vm.runInContext(source.replace(/^import[^\n]+\n/gm,"")+"\n;globalThis.__t={state,slotsFor,freeSlots,upcoming,apptId,requestAppointment,cancelAppointment,iso,nearestFree,mainHtml,settingsHtml,weekDays};",context);
  return{t:context.__t,writes,auth,context};
}
const tomorrow=()=>{const d=new Date(Date.now()+864e5);return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0")};
const allDays=(start,end)=>Object.fromEntries(["0","1","2","3","4","5","6"].map(k=>[k,{on:true,start,end}]));

test("v69 randevu modülü hesap yükleyicisinde koç bağlantısından sonra, girişten önce yüklenir ve isteğe bağlıdır",()=>{
  const loader=read("src/ui/student-account-loader.ts");
  const link=loader.indexOf("student-coach-link.js?v=1.3.1"),appts=loader.indexOf("student-appointments.js?v=1.3.1"),authAt=loader.indexOf("auth-session-runtime.js");
  assert.ok(link>0&&appts>link&&authAt>appts,"sıra: koç bağlantısı → randevular → oturum");
  assert.match(loader,/await loadModuleScript\(STUDENT_APPOINTMENTS_ID,"\.\/student-appointments\.js\?v=1\.3\.1"\);\n/,"başarısızlık yükleyiciyi durdurmaz");
  assert.match(loader,/STUDENT_APPOINTMENTS_ID="studentAppointmentsScript"/,"betik kimliği ekrandaki bölümle çakışmaz");
});

test("v69 boş saatler koçun uygun saatlerinden çıkar; dolu ve geçmiş saatler kapanır",()=>{
  const {t}=load(),day=tomorrow();
  t.state.availability={duration:30,days:allDays("18:00","20:00")};
  assert.deepEqual([...t.slotsFor(day)],["18:00","18:30","19:00","19:30"]);
  t.state.busy=new Set([day+" 18:30"]);
  assert.deepEqual([...t.freeSlots(day)],["18:00","19:00","19:30"]);
  t.state.availability={duration:45,days:{...allDays("18:00","20:00"),[String(new Date(day+"T12:00:00").getDay())]:{on:false,start:"18:00",end:"20:00"}}};
  assert.deepEqual([...t.slotsFor(day)],[],"kapalı gün");
  assert.equal(t.apptId("koc1","2026-11-05","20:00"),"koc1_20261105_2000");
});

test("v69 öğrenci isteği: saat kilidi + istek tek toplu yazmada, link boş, onay bekler",async()=>{
  const {t,writes}=load(),day=tomorrow();
  Object.assign(t.state,{user:{uid:"stu"},db:{},coachUid:"koc1",availability:{duration:30,days:allDays("18:00","20:00")},day,pick:"19:00"});
  await t.requestAppointment("Deneme sonrası konuşalım",null);
  const id="koc1_"+day.replace(/-/g,"")+"_1900",ops=writes.at(-1);
  assert.deepEqual(ops.map(op=>op.op+" "+op.path),["set coachSlots/"+id,"set coachAppointments/"+id]);
  assert.deepEqual(JSON.parse(JSON.stringify(ops[0].data)),{coachUid:"koc1",date:day,time:"19:00"});
  const appt=ops[1].data;
  assert.equal(appt.status,"requested");assert.equal(appt.createdBy,"student");assert.equal(appt.link,"");
  assert.equal(appt.studentUid,"stu");assert.equal(appt.topic,"Deneme sonrası konuşalım");
});

test("v69 dolu saate istek gönderilmez; iptal randevuyu kilidiyle birlikte siler",async()=>{
  const {t,writes}=load(),day=tomorrow();
  Object.assign(t.state,{user:{uid:"stu"},db:{},coachUid:"koc1",availability:{duration:30,days:allDays("18:00","20:00")},day,pick:"18:00",busy:new Set([day+" 18:00"])});
  await t.requestAppointment("",null);
  assert.equal(writes.length,0);
  const id="koc1_"+day.replace(/-/g,"")+"_1800";
  t.state.appts=[{id,coachUid:"koc1",studentUid:"stu",date:day,time:"18:00",status:"confirmed"}];
  await t.cancelAppointment(id,null);
  assert.deepEqual(writes.at(-1).map(op=>op.op+" "+op.path),["delete coachAppointments/"+id,"delete coachSlots/"+id]);
});

test("v69 yaklaşan randevular: geçmiş olanlar ve başka koçunkiler listelenmez, sıralıdır",()=>{
  const {t}=load(),day=tomorrow();
  t.state.coachUid="koc1";
  t.state.appts=[
    {id:"b",coachUid:"koc1",date:day,time:"19:00",duration:30},
    {id:"a",coachUid:"koc1",date:day,time:"18:00",duration:30},
    {id:"old",coachUid:"koc1",date:"2020-01-01",time:"18:00",duration:30},
    {id:"x",coachUid:"other",date:day,time:"17:00",duration:30}
  ];
  assert.deepEqual(t.upcoming().map(item=>item.id),["a","b"]);
});

test("v69 görüşme linki yalnız kesin randevuda ve yeni sekmede güvenli açılır; Bugün kartı var",()=>{
  assert.match(source,/confirmed&&item\.link\?'<a class="sap-btn primary" href="'\+esc\(item\.link\)\+'" target="_blank" rel="noopener noreferrer"/);
  assert.match(source,/confirmed&&next\.link\?'<a class="sap-join" href="'\+esc\(next\.link\)\+'" target="_blank" rel="noopener noreferrer">Görüşmeye katıl<\/a>'/);
  assert.match(source,/id="studentNextAppointment"|card\.id="studentNextAppointment"/);
});

test("v69 öğrenci hesap silmesi randevuları saat kilidiyle siler; kural yokken silme durmaz",()=>{
  const profile=read("src/ui/profile-page-v62.ts");
  const at=profile.indexOf('byStudent("coachAppointments")'),links=profile.indexOf('progress("Koç bağlantıları kapatılıyor…")');
  assert.ok(at>0&&at<links,"randevular bağlantılar kapanmadan silinir");
  assert.match(profile,/batch\.delete\(item\.ref\);batch\.delete\(fs\.doc\(db,"coachSlots",item\.id\)\)/);
  assert.match(profile,/includes\("permission-denied"\)\)throw error;/);
});

test("v69.3 randevu yoksa ekran doğrudan bu haftanın 7 gününü ve ilk boş günün saatlerini açar",()=>{
  const {t}=load(),day=tomorrow(),today=t.iso(new Date());
  Object.assign(t.state,{coachUid:"koc1",coachName:"Furkan Hoca",availability:{duration:30,days:allDays("18:00","19:00")},busy:new Set([today+" 18:00",today+" 18:30"])});
  const html=t.mainHtml();
  assert.match(html,/<h4>Bu hafta randevu al<\/h4>/);
  assert.equal((html.match(/class="sap-wday/g)||[]).length,7);
  assert.equal(t.state.day,day,"bugün dolu, ilk boş gün yarın seçilir");
  assert.match(html,/data-sap-day="[^"]+" disabled[^>]*>.*?<small>dolu<\/small>/,"dolu gün seçilemez");
  assert.match(html,/data-sap-slot="18:00"/);
  assert.match(html,/data-sap-request disabled>Önce saat seç</);
  t.state.pick="18:30";
  assert.match(t.mainHtml(),/data-sap-request>18:30 için randevu iste</);
  t.state.week=1;
  const next=t.mainHtml();
  assert.match(next,/<h4>Gelecek hafta randevu al<\/h4>/);
  assert.equal(t.weekDays()[0],t.iso(new Date(Date.now()+7*864e5)));
  assert.equal(t.state.pick,"","hafta değişince seçili saat sıfırlanır");
});

test("v69.3 randevu varsa ekran onun bilgisini gösterir; Başka randevu al aynı haftalık seçime geçer",()=>{
  const {t}=load(),day=tomorrow();
  Object.assign(t.state,{coachUid:"koc1",coachName:"Furkan Hoca",availability:{duration:30,days:allDays("18:00","20:00")},
    appts:[{id:"koc1_x",coachUid:"koc1",date:day,time:"18:30",duration:30,status:"confirmed",topic:"Deneme analizi",link:"https://meet.google.com/abc",note:""}]});
  const html=t.mainHtml();
  assert.match(html,/<h4>Sıradaki görüşmen<\/h4>/);
  assert.match(html,/<p class="sap-big">18:30<small> · 30 dk<\/small><\/p>/);
  assert.match(html,/<b>Furkan Hoca<\/b><small>Deneme analizi<\/small>/);
  assert.match(html,/href="https:\/\/meet\.google\.com\/abc" target="_blank" rel="noopener noreferrer">Görüşmeye katıl</);
  assert.match(html,/data-sap-cancel="koc1_x">Randevuyu iptal et</);
  assert.match(html,/data-sap-book>\+ Başka randevu al</);
  t.state.appts[0].status="requested";
  assert.match(t.mainHtml(),/Koçunun onayı bekleniyor/);
  assert.doesNotMatch(t.mainHtml(),/Görüşmeye katıl/,"onaysız randevuda link yok");
  t.state.view="book";
  assert.match(t.mainHtml(),/data-sap-home>‹ Randevuma dön</);
  assert.match(t.mainHtml(),/Bu hafta randevu al/);
});

test("v69.3 koç yoksa koç bağlantısına, saat yoksa bilgiye yönlendirir; Ayarlar'da kısa özet",()=>{
  const {t}=load();
  assert.match(t.mainHtml(),/data-sap-settings>Koç bağlantısına git</);
  assert.match(t.settingsHtml(),/Koçunu bağlayınca/);
  assert.doesNotMatch(t.settingsHtml(),/data-sap-open/);
  Object.assign(t.state,{coachUid:"koc1",coachName:"Furkan Hoca",availability:null});
  assert.match(t.mainHtml(),/henüz görüşme saatlerini açmadı/);
  assert.match(t.settingsHtml(),/data-sap-open>Koçla görüşme</);
});

test("v69.1 Bugün girişi en yakın boş günü söyler; koç yoksa yol gösterir",()=>{
  const {t}=load(),day=tomorrow();
  Object.assign(t.state,{coachUid:"koc1",availability:{duration:60,days:allDays("18:00","20:00")}});
  t.state.busy=new Set([t.iso(new Date())+" 18:00",t.iso(new Date())+" 19:00"]);
  const near=t.nearestFree();
  assert.equal(near.date,day);assert.equal(near.count,2);
});

test("v69.1 randevuya üç yerden ulaşılır: Bugün kartı, Merkez aracı ve Ayarlar; ekran alttan açılır",()=>{
  assert.match(source,/entry\.id="studentApptEntry"/);
  assert.match(source,/<b>Koçunla görüşme ayarla<\/b>/);
  assert.match(source,/button\.id="studentApptMore"/);
  assert.match(source,/<b>Koçla görüşme<\/b>/);
  assert.match(source,/role="dialog" aria-modal="true" aria-label="Koçla görüşme"/);
  assert.match(source,/event\.key==="Escape"\)\{event\.preventDefault\(\);closeSheet\(\)\}/);
  assert.match(source,/if\(event\.target\.closest\?\.\("\.sap-join"\)\)return;openSheet\(\)/);
  assert.match(source,/entry\.addEventListener\("click",\(\)=>openSheet\(\)\)/);
  assert.match(source,/if\(!grid\|\|!state\.user\)\{button\?\.remove\(\);return\}/,"Merkez düğmesi koçu olmayan öğrencide de var");
});

test("v69.4 Bugün kartı yeni düzende görünür alanda: Çalışma Merkezi'nin ardında, mavi kartın altında",()=>{
  assert.match(source,/const work=document\.querySelector\("#todayFreshStart>#todayFreshWorkCenter"\);/);
  assert.match(source,/if\(work\)\{if\(card\.previousElementSibling!==work\)work\.insertAdjacentElement\("afterend",card\);return\}/);
  assert.match(source,/:root #mainWrap #home #todayFreshStart>:is\(#studentNextAppointment,#studentApptEntry\)\{order:3;margin:0\}/,"order:20 kuralını geçer");
  // Gizleyen kural: #home altında yalnız #todayFreshStart görünür; kart onun doğrudan çocuğu olmalı.
  const css=fs.readdirSync(path.join(root,"src/ui")).filter(f=>f.endsWith(".css")).map(f=>read("src/ui/"+f)).join("\n")+read("app.css");
  assert.match(css,/#home\s*>\s*:not\(#todayFreshStart\)/);
});
