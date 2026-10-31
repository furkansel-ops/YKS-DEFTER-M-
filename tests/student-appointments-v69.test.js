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
  vm.runInContext(source.replace(/^import[^\n]+\n/gm,"")+"\n;globalThis.__t={state,slotsFor,freeSlots,upcoming,apptId,requestAppointment,cancelAppointment,iso,nearestFree,homeHtml,dayHtml,timeHtml,summaryHtml,viewHtml};",context);
  return{t:context.__t,writes,auth,context};
}
const tomorrow=()=>{const d=new Date(Date.now()+864e5);return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0")};
const allDays=(start,end)=>Object.fromEntries(["0","1","2","3","4","5","6"].map(k=>[k,{on:true,start,end}]));

test("v69 randevu modülü hesap yükleyicisinde koç bağlantısından sonra, girişten önce yüklenir ve isteğe bağlıdır",()=>{
  const loader=read("src/ui/student-account-loader.ts");
  const link=loader.indexOf("student-coach-link.js?v=1.3.1"),appts=loader.indexOf("student-appointments.js?v=1.2.0"),authAt=loader.indexOf("auth-session-runtime.js");
  assert.ok(link>0&&appts>link&&authAt>appts,"sıra: koç bağlantısı → randevular → oturum");
  assert.match(loader,/await loadModuleScript\(STUDENT_APPOINTMENTS_ID,"\.\/student-appointments\.js\?v=1\.2\.0"\);\n/,"başarısızlık yükleyiciyi durdurmaz");
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

test("v69.2 adım 1: 14 gün listelenir; boş saatli gün seçilebilir, kapalı ve dolu gün seçilemez",()=>{
  const {t}=load(),day=tomorrow(),closedKey=String(new Date(day+"T12:00:00").getDay());
  Object.assign(t.state,{coachUid:"koc1",coachName:"Furkan Hoca",availability:{duration:30,days:allDays("18:00","19:00")}});
  let html=t.dayHtml();
  assert.match(html,/<b>Randevu al<\/b><span>1\/3<\/span>/);
  assert.equal((html.match(/class="sap-daycard/g)||[]).length,14);
  assert.ok(html.includes('data-sap-day="'+day+'"'),"yarın seçilebilir");
  assert.match(html,/2 boş saat<\/span>/);
  t.state.busy=new Set([day+" 18:00",day+" 18:30"]);
  html=t.dayHtml();
  assert.ok(!html.includes('data-sap-day="'+day+'"'),"dolu gün seçilemez");
  assert.match(html,/>Dolu</);
  t.state.availability={duration:30,days:{...allDays("18:00","19:00"),[closedKey]:{on:false,start:"18:00",end:"19:00"}}};
  assert.match(t.dayHtml(),/<small>Kapalı<\/small>/);
});

test("v69.2 adım 2-3: saat seçilmeden Devam kapalı; özet koç, gün, saat ve süreyi gösterir",()=>{
  const {t}=load(),day=tomorrow();
  Object.assign(t.state,{coachUid:"koc1",coachName:"Furkan Hoca",availability:{duration:45,days:allDays("18:00","20:00")},day,pick:""});
  assert.match(t.timeHtml(),/data-sap-go="summary" disabled>Devam</);
  assert.equal(t.viewHtml("summary").includes("<b>Randevu al</b><span>2/3</span>"),true,"saat yokken özete geçilmez");
  t.state.pick="18:45";
  assert.match(t.timeHtml(),/data-sap-go="summary">Devam</);
  const summary=t.summaryHtml();
  assert.match(summary,/<span>3\/3<\/span>/);
  assert.match(summary,/<b>Furkan Hoca<\/b><small>[^<]+ · 18:45 · 45 dk<\/small>/);
  assert.match(summary,/data-sap-request>Randevu iste</);
});

test("v69.2 Randevularım: Randevu al düğmesi, koç saat açmadıysa bilgi; koç yoksa yönlendirme",()=>{
  const {t}=load();
  Object.assign(t.state,{coachUid:"koc1",coachName:"Furkan Hoca",availability:{duration:30,days:allDays("18:00","20:00")}});
  assert.match(t.homeHtml(),/data-sap-go="day">Randevu al</);
  assert.match(t.homeHtml(),/<h5 class="sap-sub">Randevularım<\/h5>/);
  t.state.availability=null;
  assert.match(t.homeHtml(),/henüz görüşme saatlerini açmadı/);
  assert.equal(t.viewHtml("day"),t.homeHtml(),"saat yokken adımlar açılmaz");
});

test("v69.1 Bugün girişi en yakın boş günü söyler; koç yoksa yol gösterir",()=>{
  const {t}=load(),day=tomorrow();
  Object.assign(t.state,{coachUid:"koc1",availability:{duration:60,days:allDays("18:00","20:00")}});
  t.state.busy=new Set([t.iso(new Date())+" 18:00",t.iso(new Date())+" 19:00"]);
  const near=t.nearestFree();
  assert.equal(near.date,day);assert.equal(near.count,2);
  t.state.coachUid="";
  assert.match(t.homeHtml(),/önce bir koç bağlamalısın/);
});

test("v69.1 randevuya üç yerden ulaşılır: Bugün kartı, Merkez aracı ve Ayarlar; ekran alttan açılır",()=>{
  assert.match(source,/entry\.id="studentApptEntry"/);
  assert.match(source,/<b>Koçunla görüşme ayarla<\/b>/);
  assert.match(source,/button\.id="studentApptMore"/);
  assert.match(source,/<b>Koçla görüşme<\/b>/);
  assert.match(source,/role="dialog" aria-modal="true" aria-label="Koçunla görüşme"/);
  assert.match(source,/event\.key==="Escape"\)\{event\.preventDefault\(\);closeSheet\(\)\}/);
  assert.match(source,/if\(event\.target\.closest\?\.\("\.sap-join"\)\)return;openSheet\("home"\)/);
  assert.match(source,/entry\.addEventListener\("click",\(\)=>openSheet\("day"\)\)/);
});
