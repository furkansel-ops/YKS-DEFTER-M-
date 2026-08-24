/* ---- legacy-block-1 ---- */
/* ================= MÜFREDAT ================= */
const CURRICULUM={
 TYT:[
 {name:"Türkçe",topics:["Sözcükte Anlam","Cümlede Anlam","Paragraf","Ses Bilgisi","Yazım Kuralları","Noktalama","Sözcükte Yapı","Sözcük Türleri","Fiiller","Fiilimsi","Ek Fiil","Cümlenin Ögeleri","Cümle Türleri","Anlatım Bozukluğu"]},
  {name:"Matematik",topics:["Temel Kavramlar","Sayı Basamakları","Sayılar","Bölme-Bölünebilme","EBOB-EKOK","Rasyonel Sayılar","Ondalıklı Sayılar","Basit Eşitsizlik","Mutlak Değer","Üslü Sayılar","Köklü Sayılar","Çarpanlara Ayırma","Oran-Orantı","Denklem Çözme","Problemler","Kümeler","Mantık","Fonksiyonlar","Polinomlar","İkinci Dereceden Denklemler","Permütasyon-Kombinasyon","Olasılık","Veri ve İstatistik"]},
  {name:"Geometri",topics:["Temel Kavramlar","Üçgenler","Çokgenler","Dörtgenler","Çember-Daire","Analitik Geometri","Katı Cisimler"]},
  {name:"Fizik",topics:["Fizik Bilimine Giriş","Madde ve Özellikleri","Hareket ve Kuvvet","İş-Güç-Enerji","Isı-Sıcaklık-Genleşme","Basınç","Kaldırma Kuvveti","Elektrostatik","Elektrik ve Manyetizma","Optik","Dalgalar"]},
  {name:"Kimya",topics:["Kimya Bilimi","Atom ve Yapısı","Periyodik Sistem","Kimyasal Türler Arası Etkileşim","Maddenin Halleri","Kimyanın Temel Kanunları","Mol Kavramı","Kimyasal Hesaplamalar","Karışımlar","Asit-Baz-Tuz","Kimya Her Yerde"]},
  {name:"Biyoloji",topics:["Canlıların Ortak Özellikleri","Canlıların Temel Bileşenleri","Hücre","Madde Geçişleri","Canlıların Sınıflandırılması","Hücre Bölünmeleri","Üreme","Kalıtım","Ekosistem Ekolojisi","Çevre Sorunları"]},
  {name:"Tarih",topics:["Tarih ve Zaman","İlk ve Orta Çağlarda Türk Dünyası","İlk Uygarlıklar","İslam Medeniyetinin Doğuşu","Türk-İslam Devletleri","Osmanlı Kuruluş","Osmanlı Yükselme","Osmanlı Değişim Çağı","Avrupa ve Osmanlı","XX. Yüzyıl Başlarında Osmanlı","Milli Mücadele","Atatürkçülük ve Türk İnkılabı"]},
  {name:"Coğrafya",topics:["Doğa ve İnsan","Harita Bilgisi","Dünyanın Şekli ve Hareketleri","Atmosfer ve İklim","İç Kuvvetler","Dış Kuvvetler","Su-Toprak-Bitkiler","Nüfus","Göç","Yerleşme","Türkiye'nin Yer Şekilleri","Ekonomik Faaliyetler","Bölgeler","Doğal Afetler"]},
  {name:"Felsefe",topics:["Felsefeye Giriş","Bilgi Felsefesi","Varlık Felsefesi","Ahlak Felsefesi","Sanat Felsefesi","Din Felsefesi","Siyaset Felsefesi"]},
  {name:"Din Kültürü",topics:["Bilgi ve İnanç","İslam ve İbadet","Ahlak ve Değerler","Allah-İnsan İlişkisi","Hz. Muhammed","Vahiy ve Akıl","Din-Kültür-Medeniyet","Güncel Dinî Meseleler","Dinler Tarihi"]}],
 AYT:[
  {name:"Matematik (AYT)",topics:["Fonksiyonlar","Polinomlar","İkinci Dereceden Denklemler","Karmaşık Sayılar","Logaritma","Diziler","Limit","Türev","İntegral","Trigonometri"]},
  {name:"Geometri (AYT)",topics:["Dörtgenler","Çember-Daire","Analitik-Doğru","Analitik-Çember","Katı Cisimler","Dönüşümler"]},
  {name:"Fizik (AYT)",topics:["Vektörler","Kuvvet-Denge","Tork","Basit Makineler","Newton Yasaları","İş-Güç-Enerji","İtme-Momentum","Elektrik-Manyetizma","Çembersel Hareket","Basit Harmonik Hareket","Dalga Mekaniği","Modern Fizik"]},
  {name:"Kimya (AYT)",topics:["Modern Atom Teorisi","Gazlar","Sıvı Çözeltiler","Kimyasal Tepkimelerde Enerji","Kimyasal Tepkimelerde Hız","Kimyasal Denge","Asit-Baz Dengesi","Çözünürlük Dengesi","Elektrokimya","Organik Kimya"]},
  {name:"Biyoloji (AYT)",topics:["Sinir Sistemi","Endokrin Sistem","Duyu Organları","Destek-Hareket","Sindirim","Dolaşım-Bağışıklık","Solunum","Boşaltım","Üreme","Genetik","Ekosistem","Komünite","Popülasyon","Bitki Biyolojisi"]},
  {name:"Edebiyat",topics:["Şiir Bilgisi","Söz Sanatları","Halk Edebiyatı","Divan Edebiyatı","Tanzimat","Servet-i Fünun","Milli Edebiyat","Cumhuriyet Dönemi","Roman-Hikaye","Tiyatro"]},
  {name:"Tarih (AYT)",topics:["Osmanlı Duraklama","Osmanlı Gerileme","Osmanlı Dağılma","İnkılap Tarihi","Kurtuluş Savaşı","Atatürk İlkeleri","Çağdaş Türk-Dünya Tarihi"]},
  {name:"Coğrafya (AYT)",topics:["Ekosistem","Nüfus Politikaları","Şehirleşme","Ekonomik Faaliyetler","Türkiye Ekonomisi","Bölgeler","Ulaşım","Jeopolitik Konum","Ülkeler ve Bölgeler","Çevre ve Toplum","Küresel Ortam"]},
  {name:"Tarih-2",topics:["İlk Çağ Uygarlıkları","Türklerin İlk Dönemleri","İslam Tarihi","Türk-İslam Devletleri","Osmanlı Siyasi Tarihi","Osmanlı Kültür ve Medeniyeti","XX. Yüzyıl Türk ve Dünya Tarihi","Milli Mücadele","Atatürkçülük","Soğuk Savaş Sonrası"]},
  {name:"Coğrafya-2",topics:["Doğal Sistemler","Beşerî Sistemler","Ekonomik Faaliyetler","Türkiye Coğrafyası","Küresel Ticaret","Bölgeler ve Ülkeler","Çevre ve Toplum"]},
  {name:"Felsefe Grubu",topics:["Felsefeye Giriş","Bilgi Felsefesi","Varlık Felsefesi","Ahlak Felsefesi","Din Felsefesi","Siyaset Felsefesi","Sanat Felsefesi","Psikoloji","Sosyoloji","Mantık"]},
  {name:"Din Kültürü (AYT)",topics:["Kur'an ve Yorumu","İslam ve Bilim","İslam Düşüncesinde Yorumlar","Din-Kültür-Medeniyet","Yaşayan Dinler"]}],
 YDT:[
  {name:"Yabancı Dil",topics:["Kelime Bilgisi","Dil Bilgisi","Cloze Test","Cümle Tamamlama","Çeviri","Paragraf","Anlamca Yakın Cümle","Diyalog Tamamlama","Duruma Uygun İfade","Anlatım Bütünlüğü"]}]
};
const ALL_SUBJECTS=[];
["TYT","AYT","YDT"].forEach(t=>CURRICULUM[t].forEach(s=>ALL_SUBJECTS.push({exam:t,name:s.name,topics:s.topics})));
const SUBJ_NAMES=[...new Set(ALL_SUBJECTS.map(s=>s.name))];

const DAYS=["Pzt","Sal","Çar","Per","Cum","Cmt","Paz"];
const DAYS_FULL=["Pazartesi","Salı","Çarşamba","Perşembe","Cuma","Cumartesi","Pazar"];
const MONTHS=["Ocak","Şubat","Mart","Nisan","Mayıs","Haziran","Temmuz","Ağustos","Eylül","Ekim","Kasım","Aralık"];
const DEF_R=2, DEF_S=4, MAX_ROWS=20;
const ST_LABEL=["Başlanmadı","İşledim","Soru çözdüm","Pekiştirdim"];
const REVIEW_GAPS=[3,7,21];
const DENEME_SUBJECTS={
  TYT:[["Türkçe",40],["Sosyal Bilimler",20],["Temel Matematik",40],["Fen Bilimleri",20]],
  AYT:[["Matematik",40],["Fizik",14],["Kimya",13],["Biyoloji",13],["Edebiyat",24],["Tarih-1",10],["Coğrafya-1",6],["Tarih-2",11],["Coğrafya-2",11],["Felsefe Grubu",12],["Din Kültürü",6]],
  YDT:[["Yabancı Dil",80]]
};

/* ================= SÜRÜM / KARARLI YAPI ================= */
const APP_VERSION="3.2.5";
const APP_CHANNEL="Kararlı";
const APP_BUILD="2026-08-24";
const DATA_SCHEMA=21;

/* ================= PERFORMANS KATMANI · v1.8 =================
   Ana hedef: ilk ekranı hızlı göstermek, aynı karede tekrarlanan ağır
   renderları birleştirmek ve gizli ekranları boşta kaldığında hazırlamak. */
const PERF_STATE={
  bootStart:(typeof performance!=="undefined"&&performance.now)?performance.now():Date.now(),
  bootSyncMs:0, idleJobs:0, lastSaveMs:0, lastCloudBuildMs:0
};
try{window.__YKS_PERF=PERF_STATE;}catch(e){}

const perfIdleJobs=new Map(),perfRafJobs=new Map(),perfMemoCache=new Map();
let perfMemoStateRef=null,perfStateEpoch=0;

function perfInvalidateState(){
  perfStateEpoch++;
  perfMemoCache.clear();
  perfMemoStateRef=S;
  try{window.__YKS_STATE_EPOCH=perfStateEpoch;}catch(e){}
}
function perfMemo(key,fn){
  if(perfMemoStateRef!==S){perfMemoCache.clear();perfMemoStateRef=S;}
  const k=perfStateEpoch+"|"+key;
  if(perfMemoCache.has(k))return perfMemoCache.get(k);
  const v=fn(); perfMemoCache.set(k,v); return v;
}
function perfIdle(key,fn,timeout=1200){
  if(perfIdleJobs.has(key))return;
  const run=()=>{
    perfIdleJobs.delete(key);
    PERF_STATE.idleJobs=perfIdleJobs.size;
    try{fn();}catch(e){if(typeof infraError==="function")infraError("idle:"+key,e);}
  };
  let id;
  if(typeof requestIdleCallback==="function")id=requestIdleCallback(run,{timeout:timeout});
  else id=setTimeout(run,32);
  perfIdleJobs.set(key,id); PERF_STATE.idleJobs=perfIdleJobs.size;
}
function perfRAF(key,fn){
  if(perfRafJobs.has(key))return;
  const id=requestAnimationFrame(()=>{
    perfRafJobs.delete(key);
    try{fn();}catch(e){if(typeof infraError==="function")infraError("raf:"+key,e);}
  });
  perfRafJobs.set(key,id);
}
function perfAfterPaint(key,fn){
  perfRAF("paint:"+key,()=>setTimeout(()=>{try{fn();}catch(e){if(typeof infraError==="function")infraError("paint:"+key,e);}},0));
}
function perfVisible(id){
  const e=typeof el==="function"?el(id):document.getElementById(id);
  return !!(e&&e.classList&&e.classList.contains("active"));
}
let perfInfraTimer=null;
function scheduleInfraHealth(force){
  if(!force){
    const more=document.getElementById("more"),panel=document.getElementById("mrp_veri");
    if(!more||!more.classList.contains("active")||!panel||panel.style.display==="none")return;
  }
  clearTimeout(perfInfraTimer);
  perfInfraTimer=setTimeout(()=>{if(typeof renderInfraHealth==="function")safeRender("infra",()=>renderInfraHealth());},350);
}
let perfHashAt=0;
function persistStateHashMaybe(json,force){
  const now=Date.now();
  if(!force&&now-perfHashAt<30000)return;
  perfHashAt=now;
  try{
    localStorage.setItem("yks_state_hash",infraHash(json));
    localStorage.setItem("yks_schema",String(DATA_SCHEMA));
  }catch(e){}
}

/* ================= ALTYAPI / VERİ BÜTÜNLÜĞÜ =================
   Ana kayıt JSON olarak kalır; böylece eski sürümler/yedekler okunabilir.
   Ancak bozuk JSON, yarım kayıt veya yanlışlıkla eski sürüme dönme halinde
   sessiz veri kaybı olmaması için son-sağlam kopya ve şema koruması vardır. */
const STORAGE_KEY="yks";
const LAST_GOOD_KEY="yks_last_good";
const LAST_GOOD_AT_KEY="yks_last_good_at";
const ERROR_LOG_KEY="yks_error_log";
const CONFLICT_BACKUP_KEY="yks_conflict_backups";
const MAX_REASONABLE_STATE_BYTES=20*1024*1024;

function safeJSONParse(txt){
  if(typeof txt!=="string"||!txt.trim())return null;
  try{const x=JSON.parse(txt);return x&&typeof x==="object"&&!Array.isArray(x)?x:null;}catch(e){return null;}
}
function infraHash(txt){
  txt=String(txt||""); let h=2166136261;
  for(let i=0;i<txt.length;i++){h^=txt.charCodeAt(i);h=Math.imul(h,16777619);}
  return (h>>>0).toString(16).padStart(8,"0");
}
function migrateState(raw){
  const o=raw&&typeof raw==="object"&&!Array.isArray(raw)?JSON.parse(JSON.stringify(raw)):{};
  const v=Number(o.v||1);
  if(Number.isFinite(v)&&v>DATA_SCHEMA){
    try{window.__YKS_FUTURE_SCHEMA=v;}catch(e){}
  }
  /* v21 Öğrenme Laboratuvarı kayıtlarını veri sözleşmesine ekler.
     Tarihsel dönüşümler normalize() içinde kayıpsız sürdürülür. */
  if(!Number.isFinite(v)||v<21)o.v=21;
  return o;
}
function compactRecoveryJSON(txt){
  const o=safeJSONParse(txt); if(!o)return null;
  try{
    if(Array.isArray(o.qbank))o.qbank=[]; /* base64 fotoğraflar kotayı şişirmesin */
    if(o.yt&&typeof o.yt==="object")o.yt.key="";
    return JSON.stringify(o);
  }catch(e){return null;}
}
function newestAutoBackupCandidate(){
  try{
    const a=JSON.parse(localStorage.getItem("yks_yedek")||"[]");
    if(!Array.isArray(a))return null;
    const list=a.filter(x=>x&&typeof x.veri==="string"&&(!x.hash||x.hash===infraHash(x.veri))).sort((x,y)=>(+y.at||0)-(+x.at||0));
    return list.length?safeJSONParse(list[0].veri):null;
  }catch(e){return null;}
}
function rememberRecoverySource(src,msg){
  try{window.__YKS_RECOVERY_SOURCE=src;window.__YKS_RECOVERY_MESSAGE=msg||"";}catch(e){}
}
function infraError(scope,err){
  const item={at:Date.now(),version:APP_VERSION,scope:String(scope||"uygulama").slice(0,80),
    msg:String(err&&err.message||err||"Bilinmeyen hata").slice(0,300)};
  try{
    const a=JSON.parse(localStorage.getItem(ERROR_LOG_KEY)||"[]");
    const list=Array.isArray(a)?a:[]; list.push(item);
    localStorage.setItem(ERROR_LOG_KEY,JSON.stringify(list.slice(-30)));
  }catch(e){}
  try{console.error("[YKS]",item.scope,err);}catch(e){}
  return item;
}
function infraErrors(){try{const a=JSON.parse(localStorage.getItem(ERROR_LOG_KEY)||"[]");return Array.isArray(a)?a:[];}catch(e){return [];} }
function clearInfraErrors(){try{localStorage.removeItem(ERROR_LOG_KEY);}catch(e){} if(typeof renderInfraHealth==="function")renderInfraHealth(); try{toast("Hata günlüğü temizlendi");}catch(e){} }

function conflictBackups(){
  try{const a=JSON.parse(localStorage.getItem(CONFLICT_BACKUP_KEY)||"[]");return Array.isArray(a)?a:[];}catch(e){return [];}
}
function conflictBackupAdd(json,remoteRev){
  try{
    let o=safeJSONParse(json); if(!o)return false;
    let stripped=false;
    if(json.length>2*1024*1024&&Array.isArray(o.qbank)){o.qbank=[];stripped=true;}
    if(o.yt&&typeof o.yt==="object")o.yt.key="";
    const item={at:Date.now(),remoteRev:Number(remoteRev||0),version:APP_VERSION,stripped:stripped,data:JSON.stringify(o)};
    const a=conflictBackups(); a.push(item);
    while(a.length>3)a.shift();
    localStorage.setItem(CONFLICT_BACKUP_KEY,JSON.stringify(a));
    return true;
  }catch(e){infraError("conflict-backup",e);return false;}
}
function restoreConflictBackup(idx){
  const a=conflictBackups(); const i=Number.isFinite(+idx)?(+idx):(a.length-1); const b=a[i];
  if(!b){try{toast("Çakışma yedeği bulunamadı");}catch(e){}return false;}
  if(!confirm("Bu cihazdaki çakışma yedeği geri yüklensin mi? Mevcut durum önce güvenlik yedeğine alınacak."))return false;
  try{
    if(typeof autoBackupRun==="function")autoBackupRun(true);
    const raw=safeJSONParse(b.data); if(!raw)throw new Error("Yedek bozuk");
    S=normalize(Object.assign({},JSON.parse(JSON.stringify(DEF)),migrateState(raw)));
    if(!save())throw new Error("Kayıt başarısız");
    if(typeof renderAll==="function")renderAll();
    if(window.yksCloudForceDirty)window.yksCloudForceDirty();
    toast("Çakışma yedeği geri yüklendi ✓"); return true;
  }catch(e){infraError("conflict-restore",e);try{toast("Çakışma yedeği geri yüklenemedi");}catch(x){}return false;}
}


/* ================= DURUM ================= */
const DEF={
  v:21,name:"",examDate:"2027-06-19",target:150,targetNet:0,obp:0,
  solved:{},solvedTopic:{},topics:{},denemeler:[],wrongLog:[],pomoMin:{},pomoSubj:{},pauses:{},
  journal:{},dayReview:{},books:[],workMin:25,breakMin:5,
  weeks:{},rows:{r:DEF_R,s:DEF_S},rowLabels:{r:[],s:[]},
  theme:"auto",sound:true,focusSound:"none",lastBackup:null,badges:[],badgeAt:{},swHistory:{},
  fontScale:1,simulMin:165,
  qbank:[],sessions:{},restSnooze:"",pauseReasons:{},
  wizardDone:false,simple:false,demo:false,demoBackup:null,workdays:6,
  calib:[],rev:0,revAt:0,device:"Cihaz",teachers:[],favTeachers:[],
  role:"ogrenci",coachNotes:[],watched:{},lastExport:0,briefDay:"",
  sozKapali:false,sozOfs:0,sozGun:"",
  puanTuru:"SAY",hedefSira:0,morning:{day:"",done:[],hidden:false},
  contracts:[],denemeGun:6,log:[],targets:[],templates:[],
  topicRes:{},camp:null,
  smartPlan:{},/* legacy v3.1.1: yalnız eski veriyi kayıpsız taşımak için */examTasks:[],studyPrefs:{autoPlan:false},
  learning:{cards:[],formulaFav:[],reviewLog:[]},
  lab:{paragraphLog:[],elementFav:[],timelineFav:[]},
  notif:{on:false,pomo:true,review:true,evening:true,eveningAt:"21:00",lastEvening:"",lastReview:""},
  yt:{key:"",src:"auto",err:""},chCache:{},
  focus:{goalMin:0,longBreak:15,cycles:4,autoNext:false,keepAwake:true,
         mode:"pomo",sw:{run:false,start:0,acc:0,cr:0},swLaps:[]},
  coef:{tytBase:100,tytK:3.33,ayBase:100,ayTyt:1.40,ayAyt:1.80,obpK:0.60}
};
var S=load();
let lastPersistedJSON="";
try{
  const __raw=localStorage.getItem(STORAGE_KEY)||"";
  if(safeJSONParse(__raw))lastPersistedJSON=__raw;
}catch(e){}
perfMemoStateRef=S;

function load(){
  let raw=null,primaryText="";
  try{primaryText=localStorage.getItem(STORAGE_KEY)||"";}catch(e){}
  if(primaryText){
    raw=safeJSONParse(primaryText);
    if(raw)rememberRecoverySource("primary","");
  }
  if(!raw){
    let lg=null; try{lg=safeJSONParse(localStorage.getItem(LAST_GOOD_KEY)||"");}catch(e){}
    if(lg){raw=lg;rememberRecoverySource("last-good","Ana kayıt okunamadı; son sağlam yerel kopya açıldı.");}
  }
  if(!raw){
    const ab=newestAutoBackupCandidate();
    if(ab){raw=ab;rememberRecoverySource("auto-backup","Ana kayıt okunamadı; en yeni otomatik yedek açıldı.");}
  }
  if(!raw){raw=JSON.parse(JSON.stringify(DEF));rememberRecoverySource(primaryText?"default-after-corruption":"new",primaryText?"Kayıt kurtarılamadı; boş güvenli durum açıldı.":"");}
  try{
    const migrated=migrateState(raw);
    return normalize(Object.assign({},JSON.parse(JSON.stringify(DEF)),migrated));
  }catch(e){
    infraError("load",e); rememberRecoverySource("default","Veri hazırlanırken hata oluştu; güvenli boş durum açıldı.");
    return normalize(JSON.parse(JSON.stringify(DEF)));
  }
}
/* Date.now() gibi büyük sayılar |0 ile 32 bite sığmaz ve bozulur;
   zaman damgaları ve kimlikler için bu yardımcı kullanılır. */
function bigInt(v){
  const n=Math.floor(Number(v));
  return isFinite(n)&&n>0?n:0;
}
function normalize(o){
  if(!o.weeks)o.weeks={};
  if(!o.rowLabels)o.rowLabels={r:[],s:[]};
  if(!Array.isArray(o.rowLabels.r))o.rowLabels.r=[];
  if(!Array.isArray(o.rowLabels.s))o.rowLabels.s=[];
  if(!o.solved)o.solved={}; if(!o.pomoMin)o.pomoMin={}; if(!o.pomoSubj)o.pomoSubj={};
  if(!o.solvedTopic||typeof o.solvedTopic!=="object")o.solvedTopic={};
  Object.keys(o.solvedTopic).forEach(d=>{ if(!o.solvedTopic[d]||typeof o.solvedTopic[d]!=="object")delete o.solvedTopic[d]; });
  if(typeof o.fontScale!=="number"||!(o.fontScale>=0.8&&o.fontScale<=1.5))o.fontScale=1;
  const sm=o.simulMin|0;
  o.simulMin=(sm>=1&&sm<=600)?sm:165;
  if(!Array.isArray(o.qbank))o.qbank=[];
  o.qbank=o.qbank.filter(q=>q&&typeof q==="object"&&typeof q.img==="string"&&q.img.length>16);
  o.qbank.forEach(q=>{
    q.id=bigInt(q.id)||Date.now();
    q.subject=typeof q.subject==="string"?q.subject:"";
    q.topic=typeof q.topic==="string"?q.topic:"";
    q.note=typeof q.note==="string"?q.note.slice(0,300):"";
    q.date=/^\d{4}-\d{2}-\d{2}$/.test(q.date)?q.date:todayKey();
    q.done=!!q.done;
  });
  if(!o.sessions||typeof o.sessions!=="object"||Array.isArray(o.sessions))o.sessions={};
  Object.keys(o.sessions).forEach(k=>{
    if(!validDateKey(k)||!Array.isArray(o.sessions[k])){delete o.sessions[k];return;}
    o.sessions[k]=o.sessions[k].filter(x=>x&&typeof x==="object").slice(-40).map(x=>({
      t:bigInt(x.t),m:Math.max(0,Math.min(1440,Math.floor(Number(x.m)||0))),
      subj:typeof x.subj==="string"?x.subj.slice(0,80):"",
      topic:typeof x.topic==="string"?x.topic.slice(0,100):"",
      task:typeof x.task==="string"?x.task.slice(0,160):"",type:x.type==="break"?"break":"work",done:!!x.done,
      note:typeof x.note==="string"?x.note.slice(0,140):"",
      goal:typeof x.goal==="string"?x.goal.slice(0,140):"",
      goalQ:Math.max(0,Math.min(1000,Math.floor(Number(x.goalQ)||0))),actualQ:Math.max(0,Math.min(1000,Math.floor(Number(x.actualQ)||0))),
      quality:Math.max(0,Math.min(5,Math.floor(Number(x.quality)||0))),interruptions:Math.max(0,Math.min(99,Math.floor(Number(x.interruptions)||0))),
      reasons:(x.reasons&&typeof x.reasons==="object"&&!Array.isArray(x.reasons))?{
        phone:Math.max(0,Math.min(99,Math.floor(Number(x.reasons.phone)||0))),attention:Math.max(0,Math.min(99,Math.floor(Number(x.reasons.attention)||0))),
        need:Math.max(0,Math.min(99,Math.floor(Number(x.reasons.need)||0))),other:Math.max(0,Math.min(99,Math.floor(Number(x.reasons.other)||0))),break:Math.max(0,Math.min(99,Math.floor(Number(x.reasons.break)||0)))}:{},
      focusScore:Math.max(0,Math.min(100,Math.floor(Number(x.focusScore)||0))),source:x.source==="sw"?"sw":x.source==="pomo"?"pomo":"",
      plannedMin:Math.max(0,Math.min(360,Math.floor(Number(x.plannedMin)||0))),end:bigInt(x.end),qCredited:!!x.qCredited
    }));
  });
  if(typeof o.restSnooze!=="string"||!/^\d{4}-\d{2}-\d{2}$/.test(o.restSnooze))o.restSnooze="";
  o.wizardDone=!!o.wizardDone; o.simple=!!o.simple; o.demo=!!o.demo;
  if(typeof o.demoBackup!=="string")o.demoBackup=null;
  o.workdays=(o.workdays|0)>=1&&(o.workdays|0)<=7?(o.workdays|0):6;
  o.device=(typeof o.device==="string"&&o.device.trim())?o.device.trim().slice(0,24):"Cihaz";
  o.role=(o.role==="koc")?"koc":"ogrenci";
  o.lastExport=bigInt(o.lastExport);
  o.briefDay=(typeof o.briefDay==="string"&&/^\d{4}-\d{2}-\d{2}$/.test(o.briefDay))?o.briefDay:"";
  o.sozKapali=!!o.sozKapali;
  o.sozOfs=Math.max(0,Math.min(999,o.sozOfs|0));
  o.sozGun=(typeof o.sozGun==="string"&&/^\d{4}-\d{2}-\d{2}$/.test(o.sozGun))?o.sozGun:"";
  o.puanTuru=["SAY","EA","SOZ","DIL"].indexOf(o.puanTuru)>=0?o.puanTuru:"SAY";
  if(!Array.isArray(o.log))o.log=[];
  o.log=o.log.filter(x=>x&&typeof x==="object"&&typeof x.text==="string")
    .map(x=>({id:bigInt(x.id)||Date.now(),at:bigInt(x.at)||Date.now(),
      dev:typeof x.dev==="string"?x.dev.slice(0,24):"Cihaz",
      kind:["sil","ekle","duzen","geri"].indexOf(x.kind)>=0?x.kind:"duzen",
      text:x.text.slice(0,120),
      data:typeof x.data==="string"?x.data.slice(0,20000):""})).slice(-120);
  if(o.camp&&typeof o.camp==="object"&&!Array.isArray(o.camp)){
    const ok=typeof o.camp.id==="string"&&o.camp.id&&
      /^\d{4}-\d{2}-\d{2}$/.test(o.camp.bas)&&(o.camp.hafta|0)>0;
    let hoca={};
    if(o.camp.hoca&&typeof o.camp.hoca==="object"&&!Array.isArray(o.camp.hoca))
      Object.keys(o.camp.hoca).slice(0,20).forEach(k=>{
        if(typeof o.camp.hoca[k]==="string"&&o.camp.hoca[k].trim())
          hoca[k.slice(0,40)]=o.camp.hoca[k].slice(0,40);
      });
    o.camp=ok?{id:o.camp.id.slice(0,20),bas:o.camp.bas,
      hafta:Math.max(1,Math.min(52,o.camp.hafta|0)),at:bigInt(o.camp.at),hoca:hoca}:null;
  } else o.camp=null;
  delete o.sync; delete o.rev; delete o.revAt; delete o.coachEmail;   /* bulut eşitlemesi kaldırıldı */
  if(!o.topicRes||typeof o.topicRes!=="object"||Array.isArray(o.topicRes))o.topicRes={};
  Object.keys(o.topicRes).forEach(k=>{
    if(!Array.isArray(o.topicRes[k])||!k.split("|")[2]){ delete o.topicRes[k]; return; }
    o.topicRes[k]=o.topicRes[k].filter(r=>r&&typeof r==="object"&&typeof r.ad==="string"&&r.ad.trim())
      .map(r=>({id:bigInt(r.id)||Date.now(),
        tur:["video","kitap","not","link"].indexOf(r.tur)>=0?r.tur:"not",
        ad:r.ad.slice(0,80),
        deger:typeof r.deger==="string"?r.deger.slice(0,300):"",
        hoca:(typeof r.hoca==="string"&&r.hoca.trim())?r.hoca.slice(0,40):undefined})).slice(-12);
  if(!o.topicRes[k].length)delete o.topicRes[k];
  });
  delete o.ai;                          /* asistan kaldırıldı */
  if(!Array.isArray(o.templates))o.templates=[];
  o.templates=o.templates.filter(t=>t&&typeof t==="object"&&typeof t.ad==="string"&&t.ad.trim())
    .map(t=>({id:bigInt(t.id)||Date.now(),ad:t.ad.slice(0,40),
      r:Array.isArray(t.r)?t.r.slice(0,20).map(row=>Array.isArray(row)?row.slice(0,7).map(c=>typeof c==="string"?c.slice(0,200):""):new Array(7).fill("")):[],
      s:Array.isArray(t.s)?t.s.slice(0,20).map(row=>Array.isArray(row)?row.slice(0,7).map(c=>typeof c==="string"?c.slice(0,200):""):new Array(7).fill("")):[],
      labels:(t.labels&&typeof t.labels==="object")?t.labels:{r:[],s:[]},
      rows:(t.rows&&typeof t.rows==="object")?t.rows:{r:2,s:4}})).slice(-12);
  if(!Array.isArray(o.targets))o.targets=[];
  o.targets=o.targets.filter(t=>t&&typeof t==="object"&&typeof t.ad==="string"&&t.ad.trim()&&(t.sira|0)>0)
    .map(t=>({id:bigInt(t.id)||Date.now(),ad:t.ad.slice(0,80),
      uni:typeof t.uni==="string"?t.uni.slice(0,60):"",
      sira:Math.max(1,Math.min(1000000,t.sira|0))})).slice(-15);
  o.hedefSira=(o.hedefSira|0)>0&&(o.hedefSira|0)<=1000000?(o.hedefSira|0):0;
  if(!o.smartPlan||typeof o.smartPlan!=="object"||Array.isArray(o.smartPlan))o.smartPlan={}; /* legacy: yalnız kayıpsız uyumluluk */
  if(!Array.isArray(o.examTasks))o.examTasks=[];
  o.examTasks=o.examTasks.filter(x=>x&&typeof x==="object"&&typeof x.label==="string"&&x.label.trim()).slice(-100).map((x,i)=>({
    id:bigInt(x.id)||Date.now()+i,examId:bigInt(x.examId),at:bigInt(x.at)||Date.now(),
    kind:["analysis","review","questions","weak"].includes(x.kind)?x.kind:"analysis",
    label:x.label.slice(0,160),subj:typeof x.subj==="string"?x.subj.slice(0,60):"",topic:typeof x.topic==="string"?x.topic.slice(0,100):"",done:!!x.done
  }));
  if(!o.studyPrefs||typeof o.studyPrefs!=="object"||Array.isArray(o.studyPrefs))o.studyPrefs={}; /* legacy: artık davranış üretmez */
  if(!o.morning||typeof o.morning!=="object"||Array.isArray(o.morning))o.morning={};
  if(typeof o.morning.day!=="string"||!/^\d{4}-\d{2}-\d{2}$/.test(o.morning.day))o.morning.day="";
  if(!Array.isArray(o.morning.done))o.morning.done=[];
  o.morning.done=o.morning.done.filter(x=>typeof x==="string").slice(0,10);
  o.morning.hidden=!!o.morning.hidden;
  if(!Array.isArray(o.contracts))o.contracts=[];
  o.contracts=o.contracts.filter(c=>c&&typeof c==="object"&&/^\d{4}-\d{2}-\d{2}$/.test(c.wk))
    .map(c=>({wk:c.wk,saat:Math.max(0,Math.min(120,+c.saat||0)),
      soru:Math.max(0,Math.min(20000,c.soru|0)),deneme:Math.max(0,Math.min(20,c.deneme|0)),
      not:typeof c.not==="string"?c.not.slice(0,140):"",at:bigInt(c.at)})).slice(-60);
  const _dg=(o.denemeGun===undefined||o.denemeGun===null)?6:(o.denemeGun|0);
  o.denemeGun=(_dg>=0&&_dg<=7)?_dg:6;
  if(!o.watched||typeof o.watched!=="object"||Array.isArray(o.watched))o.watched={};
  Object.keys(o.watched).forEach(k=>{
    const x=o.watched[k];
    if(!x||typeof x!=="object"||!k){ delete o.watched[k]; return; }
    x.at=bigInt(x.at); x.title=typeof x.title==="string"?x.title.slice(0,120):"";
    x.subj=typeof x.subj==="string"?x.subj:""; x.topic=typeof x.topic==="string"?x.topic:"";
    x.ch=typeof x.ch==="string"?x.ch.slice(0,60):"";
    x.hoca=typeof x.hoca==="string"?x.hoca.slice(0,60):"";
  });
  if(!o.notif||typeof o.notif!=="object"||Array.isArray(o.notif))o.notif={};
  o.notif.on=!!o.notif.on;
  o.notif.pomo=o.notif.pomo!==false;
  o.notif.review=o.notif.review!==false;
  o.notif.evening=o.notif.evening!==false;
  const _et=/^(\d{2}):(\d{2})$/.exec(o.notif.eveningAt||"");
  if(!_et||+_et[1]>23||+_et[2]>59)o.notif.eveningAt="21:00";
  if(typeof o.notif.lastEvening!=="string")o.notif.lastEvening="";
  if(typeof o.notif.lastReview!=="string")o.notif.lastReview="";
  if(!Array.isArray(o.coachNotes))o.coachNotes=[];
  o.coachNotes=o.coachNotes.filter(n=>n&&typeof n==="object"&&typeof n.text==="string"&&n.text.trim())
    .map(n=>({id:bigInt(n.id)||Date.now(),at:bigInt(n.at)||Date.now(),
      from:(typeof n.from==="string"&&n.from.trim())?n.from.slice(0,24):"Koç",
      text:n.text.slice(0,400),read:!!n.read,
      kind:["genel","plan","deneme","konu"].indexOf(n.kind)>=0?n.kind:"genel"})).slice(-200);
  delete o.pdfs;                         /* PDF bölümü kaldırıldı */
  if(!o.chCache||typeof o.chCache!=="object"||Array.isArray(o.chCache))o.chCache={};
  Object.keys(o.chCache).forEach(k=>{
    const c=o.chCache[k];
    if(!c||typeof c!=="object"){ delete o.chCache[k]; return; }
    c.at=bigInt(c.at);
    if(typeof c.id!=="string")delete c.id;
    if(!c.id&&!c.miss)delete o.chCache[k];
  });
  if(!o.yt||typeof o.yt!=="object"||Array.isArray(o.yt))o.yt={};
  o.yt.key=(typeof o.yt.key==="string")?o.yt.key.trim().slice(0,60):"";
  o.yt.src=["auto","key","gas","link"].indexOf(o.yt.src)>=0?o.yt.src:"auto";
  o.yt.err=(typeof o.yt.err==="string")?o.yt.err.slice(0,140):"";
  if(!Array.isArray(o.teachers))o.teachers=[];
  o.teachers=o.teachers.filter(t=>t&&typeof t==="object"&&typeof t.a==="string"&&t.a.trim())
    .map(t=>({id:bigInt(t.id)||Date.now(),a:t.a.trim().slice(0,40),
      d:Array.isArray(t.d)?t.d.filter(x=>typeof x==="string").slice(0,5):[],
      l:["baslangic","orta","ileri","hepsi"].indexOf(t.l)>=0?t.l:"hepsi",
      n:typeof t.n==="string"?t.n.slice(0,160):""})).slice(-60);
  if(!Array.isArray(o.favTeachers))o.favTeachers=[];
  o.favTeachers=o.favTeachers.filter(x=>typeof x==="string"&&x.trim()).slice(-60);
  if(!Array.isArray(o.calib))o.calib=[];
  o.calib=o.calib.filter(c=>c&&typeof c==="object"&&isFinite(+c.net)&&isFinite(+c.score)&&+c.score>0)
    .map(c=>({id:bigInt(c.id)||Date.now(),type:c.type==="alan"?"alan":"tyt",
      net:Math.max(0,+c.net||0),score:Math.max(0,+c.score||0),
      ayt:(c.ayt==null||!isFinite(+c.ayt))?null:Math.max(0,+c.ayt),
      date:/^\d{4}-\d{2}-\d{2}$/.test(c.date)?c.date:todayKey()})).slice(-30);
  if(!o.pauseReasons||typeof o.pauseReasons!=="object"||Array.isArray(o.pauseReasons))o.pauseReasons={};
  Object.keys(o.pauseReasons).forEach(k=>{
    const r=o.pauseReasons[k];
    if(!/^\d{4}-\d{2}-\d{2}$/.test(k)||!r||typeof r!=="object"){delete o.pauseReasons[k];return;}
    r.mola=Math.max(0,r.mola|0); r.dikkat=Math.max(0,r.dikkat|0);
    r.phone=Math.max(0,r.phone|0);r.attention=Math.max(0,r.attention|0);
    r.need=Math.max(0,r.need|0);r.other=Math.max(0,r.other|0);r.break=Math.max(0,r.break|0);
  });
  if(!o.focus||typeof o.focus!=="object"||Array.isArray(o.focus))o.focus={};
  o.focus.goalMin=Math.max(0,Math.min(1440,o.focus.goalMin|0));
  o.focus.longBreak=(o.focus.longBreak|0)>=1&&(o.focus.longBreak|0)<=90?(o.focus.longBreak|0):15;
  o.focus.cycles=(o.focus.cycles|0)>=2&&(o.focus.cycles|0)<=12?(o.focus.cycles|0):4;
  o.focus.autoNext=!!o.focus.autoNext;
  o.focus.keepAwake=o.focus.keepAwake!==false;
  o.focus.mode=(o.focus.mode==="sw")?"sw":"pomo";
  o.focus.sessionGoal=typeof o.focus.sessionGoal==="string"?o.focus.sessionGoal.slice(0,140):"";
  o.focus.sessionGoalQ=Math.max(0,Math.min(1000,o.focus.sessionGoalQ|0));
  if(!o.focus.sw||typeof o.focus.sw!=="object"||Array.isArray(o.focus.sw))o.focus.sw={};
  o.focus.sw.run=!!o.focus.sw.run;
  o.focus.sw.start=bigInt(o.focus.sw.start);
  o.focus.sw.acc=Math.min(360000000,bigInt(o.focus.sw.acc));
  o.focus.sw.cr=bigInt(o.focus.sw.cr);
  if(o.focus.sw.run&&(!o.focus.sw.start||o.focus.sw.start>Date.now()+60000)){o.focus.sw.run=false;o.focus.sw.start=0;}
  if(!Array.isArray(o.focus.swLaps))o.focus.swLaps=[];
  o.focus.swLaps=o.focus.swLaps.map(v=>{
    if(v&&typeof v==="object")return {t:bigInt(v.t),subj:typeof v.subj==="string"?v.subj:""};
    return {t:bigInt(v),subj:""};
  }).filter(v=>v.t>0).slice(-50);
  if(!o.pauses)o.pauses={}; if(!o.journal)o.journal={};
  if(!o.dayReview||typeof o.dayReview!=="object"||Array.isArray(o.dayReview))o.dayReview={};
  Object.keys(o.dayReview).forEach(k=>{
    const r=o.dayReview[k];
    if(!/^\d{4}-\d{2}-\d{2}$/.test(k)||!r||typeof r!=="object"){delete o.dayReview[k];return;}
    r.mood=["good","mid","hard"].includes(r.mood)?r.mood:"";
    r.note=typeof r.note==="string"?r.note.slice(0,220):"";
    r.at=bigInt(r.at);
    if(!r.mood&&!r.note)delete o.dayReview[k];
  });
  const dayReviewDays=Object.keys(o.dayReview).sort(); while(dayReviewDays.length>180)delete o.dayReview[dayReviewDays.shift()];
  if(!Array.isArray(o.denemeler))o.denemeler=[];
  o.denemeler=o.denemeler.filter(d=>d&&typeof d==="object"&&Array.isArray(d.subjectResults));
  o.denemeler.forEach(d=>{
    if(["TYT","AYT","YDT","BRANS"].indexOf(d.type)<0)d.type="TYT";
    d.pub=typeof d.pub==="string"?d.pub.slice(0,100):"";
    d.name=typeof d.name==="string"?d.name.slice(0,140):"Deneme";
    d.date=(typeof d.date==="string"&&/^\d{4}-\d{2}-\d{2}$/.test(d.date))?d.date:todayKey();
    d.difficulty=["kolay","normal","zor"].includes(d.difficulty)?d.difficulty:"normal";
    d.note=typeof d.note==="string"?d.note.slice(0,240):"";
    d.netOnly=!!d.netOnly;
    d.totalNet=+d.totalNet||0; d.dur=Math.max(0,d.dur|0);
    d.subjectResults.forEach(sr=>{ sr.d=+sr.d||0; sr.y=+sr.y||0; sr.b=+sr.b||0; sr.net=+sr.net||0; sr.cap=+sr.cap||0; });
  });
  if(!Array.isArray(o.wrongLog))o.wrongLog=[];
  o.wrongLog.forEach(x=>{
    if(!x||typeof x!=="object")return;
    if(["bilmiyordum","dikkat","sure"].indexOf(x.kind)<0)delete x.kind;
  });
  if(!Array.isArray(o.books))o.books=[];
  if(!Array.isArray(o.badges))o.badges=[];
  if(!o.badgeAt||typeof o.badgeAt!=="object"||Array.isArray(o.badgeAt))o.badgeAt={};
  Object.keys(o.badgeAt).forEach(k=>{ const n=bigInt(o.badgeAt[k]); if(n)o.badgeAt[k]=n; else delete o.badgeAt[k]; });
  if(!o.swHistory||typeof o.swHistory!=="object"||Array.isArray(o.swHistory))o.swHistory={};
  Object.keys(o.swHistory).forEach(k=>{
    if(!/^\d{4}-\d{2}-\d{2}$/.test(k)||!Array.isArray(o.swHistory[k])){ delete o.swHistory[k]; return; }
    o.swHistory[k]=o.swHistory[k].filter(x=>x&&typeof x==="object").slice(-40).map((x,i)=>{
      const at=bigInt(x.at),end=bigInt(x.end),ms=Math.max(0,Math.floor(Number(x.ms)||0));
      return {id:bigInt(x.id)||end||at||Date.now()+i,at:at,end:end,ms:ms,subj:typeof x.subj==="string"?x.subj.slice(0,60):"",topic:typeof x.topic==="string"?x.topic.slice(0,100):""};
    }).filter(x=>x.ms>0);
    if(!o.swHistory[k].length)delete o.swHistory[k];
  });
  const swDays=Object.keys(o.swHistory).sort();
  while(swDays.length>60){ delete o.swHistory[swDays.shift()]; }
  if(!o.learning||typeof o.learning!=="object"||Array.isArray(o.learning))o.learning={};
  if(!Array.isArray(o.learning.cards))o.learning.cards=[];
  o.learning.cards=o.learning.cards.filter(x=>x&&typeof x==="object"&&typeof x.q==="string"&&typeof x.a==="string"&&x.q.trim()&&x.a.trim()).slice(-500).map((x,i)=>({
    id:bigInt(x.id)||Date.now()+i,
    subject:typeof x.subject==="string"?x.subject.slice(0,60):"Genel",
    q:x.q.trim().slice(0,500),a:x.a.trim().slice(0,1200),
    due:validDateKey(x.due)?x.due:todayKey(),
    interval:Math.max(0,Math.min(3650,Math.floor(Number(x.interval)||0))),
    ease:Math.max(1.3,Math.min(3.2,Number(x.ease)||2.5)),
    reps:Math.max(0,Math.min(9999,Math.floor(Number(x.reps)||0))),
    lapses:Math.max(0,Math.min(9999,Math.floor(Number(x.lapses)||0))),
    createdAt:bigInt(x.createdAt)||Date.now(),updatedAt:bigInt(x.updatedAt)||Date.now()
  }));
  if(!Array.isArray(o.learning.formulaFav))o.learning.formulaFav=[];
  o.learning.formulaFav=[...new Set(o.learning.formulaFav.filter(x=>typeof x==="string").map(x=>x.slice(0,80)))].slice(0,200);
  if(!Array.isArray(o.learning.reviewLog))o.learning.reviewLog=[];
  o.learning.reviewLog=o.learning.reviewLog.filter(x=>x&&typeof x==="object").slice(-2000).map((x,i)=>({
    id:bigInt(x.id)||Date.now()+i,cardId:bigInt(x.cardId),at:bigInt(x.at)||Date.now(),
    grade:Math.max(0,Math.min(3,Math.floor(Number(x.grade)||0))),
    subject:typeof x.subject==="string"?x.subject.slice(0,60):"Genel"
  }));
  if(!o.lab||typeof o.lab!=="object"||Array.isArray(o.lab))o.lab={};
  if(!Array.isArray(o.lab.paragraphLog))o.lab.paragraphLog=[];
  o.lab.paragraphLog=o.lab.paragraphLog.filter(x=>x&&typeof x==="object").slice(-500).map((x,i)=>({
    id:bigInt(x.id)||Date.now()+i,at:bigInt(x.at)||Date.now(),
    words:Math.max(1,Math.min(20000,Math.floor(Number(x.words)||0))),
    seconds:Math.max(1,Math.min(86400,Math.floor(Number(x.seconds)||0))),
    wpm:Math.max(1,Math.min(3000,Math.floor(Number(x.wpm)||0))),
    score:Math.max(1,Math.min(5,Math.floor(Number(x.score)||0))),
    title:typeof x.title==="string"?x.title.slice(0,100):"Paragraf çalışması"
  }));
  if(!Array.isArray(o.lab.elementFav))o.lab.elementFav=[];
  o.lab.elementFav=[...new Set(o.lab.elementFav.map(Number).filter(x=>Number.isInteger(x)&&x>=1&&x<=118))];
  if(!Array.isArray(o.lab.timelineFav))o.lab.timelineFav=[];
  o.lab.timelineFav=[...new Set(o.lab.timelineFav.filter(x=>typeof x==="string").map(x=>x.slice(0,80)))].slice(0,200);
  if(!o.coef)o.coef=Object.assign({},DEF.coef); else o.coef=Object.assign({},DEF.coef,o.coef);
  if(o.theme==="light")o.theme="paper";
  if(o.theme==="dark")o.theme="night";
  if(["auto","paper","night","forest","ocean","lavender","sunset","graphite"].indexOf(o.theme)<0)o.theme="auto";
  if(["none","white","brown"].indexOf(o.focusSound)<0)o.focusSound="none";
  /* v1 -> v2: konular boolean idi, artık {st,conf,ts,rev} */
  if((o.v|0)<2){
    const nt={};
    Object.keys(o.topics||{}).forEach(k=>{
      const val=o.topics[k];
      if(val===true) nt[k]={st:3,conf:3,ts:null,rev:[]};
      else if(val&&typeof val==="object") nt[k]=val;
    });
    o.topics=nt;
  }
  o.v=DATA_SCHEMA;
  if(!o.topics)o.topics={};
  Object.keys(o.topics).forEach(k=>{
    const t=o.topics[k];
    if(!t||typeof t!=="object"){delete o.topics[k];return;}
    t.st=Math.max(0,Math.min(3,t.st|0));
    t.conf=Math.max(0,Math.min(5,t.conf|0));
    if(!Array.isArray(t.rev))t.rev=[];
    if(!t.revDone||typeof t.revDone!=="object"||Array.isArray(t.revDone))t.revDone={};
    Object.keys(t.revDone).forEach(i=>{if(!/^[0-2]$/.test(String(i))||typeof t.revDone[i]!=="string"||!/^\d{4}-\d{2}-\d{2}$/.test(t.revDone[i]))delete t.revDone[i];});
    if(typeof t.dl!=="string"||!/^\d{4}-\d{2}-\d{2}$/.test(t.dl))delete t.dl;
    if(typeof t.res!=="string"||!t.res)delete t.res; else t.res=t.res.slice(0,200);
  });
  if(!o.rows)o.rows={r:DEF_R,s:DEF_S};
  o.rows.r=Math.max(1,Math.min(MAX_ROWS,o.rows.r|0||DEF_R));
  o.rows.s=Math.max(1,Math.min(MAX_ROWS,o.rows.s|0||DEF_S));
  while(o.rowLabels.r.length<o.rows.r)o.rowLabels.r.push("");
  while(o.rowLabels.s.length<o.rows.s)o.rowLabels.s.push("");
  return o;
}
/* Depo hiç kullanılabilir mi? Bazı tarayıcılar dosyadan (file://)
   açılan sayfalara yerel depoyu kapatıyor. Bu durumda uygulama
   çalışıyor görünür ama HİÇBİR ŞEY KAYDEDİLMEZ — kullanıcı bunu
   fark etmeden veri kaybeder. Bir kez açıkça uyar. */
let depoYok=false;
function depoCalisiyor(){
  try{
    const k="__yks_deneme__";
    localStorage.setItem(k,"1");
    localStorage.removeItem(k);
    return true;
  }catch(e){ return false; }
}
function depoUyar(){
  if(depoYok)return;
  depoYok=true;
  const b=el("depoUyari");
  if(b){
    b.style.display="block";
    b.textContent="Bu tarayıcı kayıt yapmana izin vermiyor — yazdıkların "+
      "sayfayı kapatınca kaybolur. Uygulamayı dosyaya çift tıklayarak açtıysan, "+
      "BASLAT.bat ile aç. Kılavuzda anlatıldı.";
  }
  try{ toast("Kayıt yapılamıyor — kılavuzdaki BASLAT yöntemini kullan"); }catch(e){}
}
let lastSaveFailedAt=0;
function save(){
  if(window.__YKS_FUTURE_SCHEMA&&window.__YKS_FUTURE_SCHEMA>DATA_SCHEMA){
    try{toast("Bu veri daha yeni bir uygulama sürümüne ait — önce uygulamayı güncelle");}catch(e){}
    return false;
  }
  try{
    S.v=DATA_SCHEMA;
    perfInvalidateState();
    const __saveT=(typeof performance!=="undefined"&&performance.now)?performance.now():Date.now();
    const json=JSON.stringify(S);
    if(!json||json.length>MAX_REASONABLE_STATE_BYTES)throw new Error("Veri boyutu güvenli sınırı aştı");
    if(json===lastPersistedJSON){
      PERF_STATE.lastSaveMs=((typeof performance!=="undefined"&&performance.now)?performance.now():Date.now())-__saveT;
      scheduleInfraHealth(false);
      return true;
    }
    /* Her 10 dakikada bir, mevcut kaydın bir önceki halini fotoğrafsız
       'son sağlam' kopya olarak sakla. Bu işlem başarısız olsa bile ana kayıt devam eder. */
    try{
      const now=Date.now(),last=Number(localStorage.getItem(LAST_GOOD_AT_KEY)||0)||0;
      if(now-last>10*60*1000){
        const prev=localStorage.getItem(STORAGE_KEY); const compact=compactRecoveryJSON(prev||"");
        if(compact){localStorage.setItem(LAST_GOOD_KEY,compact);localStorage.setItem(LAST_GOOD_AT_KEY,String(now));}
      }
    }catch(e){infraError("last-good",e);}
    localStorage.setItem(STORAGE_KEY,json);
    lastPersistedJSON=json;
    persistStateHashMaybe(json,false);
    if(window.yksCloudSchedule)window.yksCloudSchedule();
    scheduleInfraHealth(false);
    PERF_STATE.lastSaveMs=((typeof performance!=="undefined"&&performance.now)?performance.now():Date.now())-__saveT;
    return true;
  }
  catch(e){
    lastSaveFailedAt=Date.now(); infraError("save",e);
    if(!depoCalisiyor())depoUyar();
    else try{toast(String(e&&e.message||"").includes("boyutu")?"Veri çok büyüdü — JSON yedeği alıp fotoğraf arşivini azalt":"Kaydedilemedi: depolama alanını kontrol et");}catch(x){}
    return false;
  }
}

/* ================= YARDIMCILAR ================= */
function keyOf(d){ return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0"); }
function todayKey(){ return keyOf(new Date()); }
function validDateKey(k){
  if(typeof k!=="string"||!/^(\d{4})-(\d{2})-(\d{2})$/.test(k))return false;
  const m=k.match(/^(\d{4})-(\d{2})-(\d{2})$/),y=+m[1],mo=+m[2],d=+m[3];
  if(y<2000||y>2100||mo<1||mo>12||d<1||d>31)return false;
  const dt=new Date(y,mo-1,d);
  return dt.getFullYear()===y&&dt.getMonth()===mo-1&&dt.getDate()===d;
}
function parseKey(k){ return new Date(k+"T00:00:00"); }
function addDaysKey(k,n){ const d=parseKey(k); d.setDate(d.getDate()+n); return keyOf(d); }
function dowOf(d){ return (d.getDay()+6)%7; }
function mondayOf(d){ const x=new Date(d); x.setHours(0,0,0,0); x.setDate(x.getDate()-dowOf(x)); return x; }
function net(d,y){ return Math.round((d-y/4)*100)/100; }
function r2(n){ return Math.round(n*100)/100; }
function daysUntil(iso){ const e=parseKey(iso),t=new Date(); t.setHours(0,0,0,0); return Math.ceil((e-t)/86400000); }
function esc(s){ return String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])); }
function fmtHM(min){ const h=Math.floor(min/60),m=min%60; return h?(h+" sa "+m+" dk"):(m+" dk"); }
function sumVals(o){ return Object.keys(o).reduce((a,k)=>a+(+o[k]||0),0); }
function el(id){ return document.getElementById(id); }
function hueOf(str){ let h=0; for(let i=0;i<str.length;i++)h=(h*31+str.charCodeAt(i))%360; return h; }

/* ================= KONU DURUMU ================= */
function tkey(exam,subj,topic){ return exam+"|"+subj+"|"+topic; }
function tget(key){ const t=S.topics[key]; return t?t:{st:0,conf:0,ts:null,rev:[]}; }
function tsetStatus(key,st){
  const t=Object.assign({st:0,conf:0,ts:null,rev:[]},S.topics[key]);
  t.st=st;
  if(st===3&&!t.ts)t.ts=todayKey();
  if(st<3){ t.ts=null; t.rev=[]; t.revDone={}; }
  if(st===0&&!t.conf&&!t.dl) delete S.topics[key]; else S.topics[key]=t;
  save();
}
function tsetConf(key,c){
  const t=Object.assign({st:0,conf:0,ts:null,rev:[]},S.topics[key]);
  t.conf=(t.conf===c?0:c);
  if(t.st===0&&!t.conf&&!t.dl) delete S.topics[key]; else S.topics[key]=t;
  save();
}
function subjStat(exam,s){
  let sum=0,full=0;
  s.topics.forEach(tp=>{ const t=tget(tkey(exam,s.name,tp)); sum+=t.st; if(t.st===3)full++; });
  return {pct:Math.round(sum/(3*s.topics.length)*100),full:full,total:s.topics.length};
}
function overallPct(){
  return perfMemo("overallPct",()=>{
    let sum=0,tot=0;
    ALL_SUBJECTS.forEach(s=>s.topics.forEach(tp=>{ tot+=3; sum+=tget(tkey(s.exam,s.name,tp)).st; }));
    return tot?Math.round(sum/tot*100):0;
  });
}
/* Aralıklı tekrar kuyruğu */
function reviewQueue(){
  return perfMemo("reviewQueue:"+todayKey(),()=>{
    const t0=todayKey(),out=[];
    Object.keys(S.topics).forEach(k=>{
      const t=S.topics[k];
      if(t.st!==3||!t.ts)return;
      REVIEW_GAPS.forEach((gap,gi)=>{
        if(t.rev.indexOf(gi)>=0)return;
        const due=addDaysKey(t.ts,gap);
        if(due<=t0){ const p=k.split("|"); out.push({key:k,gi:gi,gap:gap,due:due,exam:p[0],subj:p[1],topic:p[2],late:diffKeys(due,t0)}); }
      });
    });
    return out.sort((a,b)=>b.late-a.late);
  });
}
function diffKeys(a,b){ return Math.round((parseKey(b)-parseKey(a))/86400000); }
function markReview(key,gi){
  const t=S.topics[key]; if(!t)return;
  if(t.rev.indexOf(gi)<0)t.rev.push(gi);
  if(!t.revDone||typeof t.revDone!=="object")t.revDone={};
  if(!t.revDone[gi])t.revDone[gi]=todayKey();
  save();
}

/* ================= TEMA ================= */
const ICONS={
  auto:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 3a9 9 0 010 18z" fill="currentColor" stroke="none"/></svg>',
  paper:'<svg viewBox="0 0 24 24"><path d="M5 4.5A2.5 2.5 0 017.5 2H19v17H7.5A2.5 2.5 0 005 21.5z"/><path d="M5 4.5v17M9 7h6M9 11h6M9 15h4"/></svg>',
  night:'<svg viewBox="0 0 24 24"><path d="M20 14.5A8.2 8.2 0 019.5 4a8.5 8.5 0 1010.5 10.5z"/></svg>',
  forest:'<svg viewBox="0 0 24 24"><path d="M19.5 4.5C12 4.7 6.7 8.2 5.2 14.3c-.7 2.9 1.4 5.2 4.2 4.5 5.7-1.4 8.8-6.5 10.1-14.3z"/><path d="M6.5 18c2.8-3.1 5.7-5.6 9.1-7.7"/></svg>',
  ocean:'<svg viewBox="0 0 24 24"><path d="M3 15c2.2-2.3 4.4-2.3 6.6 0s4.4 2.3 6.6 0 4.4-2.3 4.8-1.8"/><path d="M4 10c2-2 4-2 6 0s4 2 6 0 4-2 4-2"/></svg>',
  lavender:'<svg viewBox="0 0 24 24"><path d="M12 21V8"/><path d="M12 11c-3-1-5-3-5-6 3 0 5 2 5 5"/><path d="M12 14c3-1 5-3 5-6-3 0-5 2-5 5"/><path d="M12 18c-2.5-.7-4-2.2-4-4.5 2.4 0 4 1.4 4 3.8"/></svg>',
  sunset:'<svg viewBox="0 0 24 24"><path d="M4 17h16"/><path d="M7 17a5 5 0 0110 0"/><path d="M12 3v3M4.2 7.2l2.1 2.1M19.8 7.2l-2.1 2.1"/></svg>',
  graphite:'<svg viewBox="0 0 24 24"><path d="M7 3h10l4 7-9 11L3 10z"/><path d="M7 3l5 18M17 3l-5 18M3 10h18"/></svg>'
};
const THEME_NAMES={auto:"Sistem",paper:"Defter",night:"Gece",forest:"Orman",ocean:"Okyanus",lavender:"Lavanta",sunset:"Günbatımı",graphite:"Grafit"};
const THEME_HINTS={
  paper:"Sıcak krem zemin ve sakin toprak tonlarıyla gerçek bir çalışma defteri hissi verir.",
  night:"Koyu kömür zemin ve yumuşak mor vurgularla akşam çalışmalarında göz yorgunluğunu azaltır.",
  forest:"Sage ve orman yeşili tonlarıyla uzun çalışma oturumlarında daha sakin bir görünüm sunar.",
  ocean:"Ferah mavi ve turkuaz tonlarıyla aydınlık, temiz bir çalışma alanı oluşturur.",
  lavender:"Yumuşak lavanta ve mor tonlarıyla sakin ama renkli bir görünüm sunar.",
  sunset:"Krem, şeftali ve sıcak turuncu tonlarıyla daha enerjik bir çalışma havası verir.",
  graphite:"Nötr koyu yüzeyler ve mavi vurgularla dikkat dağıtmayan ikinci bir gece seçeneğidir."
};
const mq=(typeof window.matchMedia==="function")
  ? window.matchMedia("(prefers-color-scheme: dark)")
  : {matches:false,addEventListener:function(){},addListener:function(){}};
function isDarkNow(){ return S.theme==="night"||S.theme==="graphite"||(S.theme==="auto"&&mq.matches); }
function applyTheme(){
  document.documentElement.setAttribute("data-theme",S.theme);
  document.documentElement.style.colorScheme=isDarkNow()?"dark":"light";
  const metaColors={paper:"#F5EFE4",night:"#0D0F13",forest:"#E9F0E8",ocean:"#EAF3F9",lavender:"#F2EEF9",sunset:"#FAEFE8",graphite:"#121418"};
  const mt=el("metaTheme");
  if(mt)mt.setAttribute("content",S.theme==="auto"?(mq.matches?"#08090D":"#EFF2F8"):(metaColors[S.theme]||"#EFF2F8"));
  const btn=el("themeBtn");
  if(btn){ btn.innerHTML=ICONS[S.theme]||ICONS.auto; btn.title="Tema: "+(THEME_NAMES[S.theme]||"Sistem"); }
  [["auto","thAuto"],["paper","thPaper"],["night","thNight"],["forest","thForest"],["ocean","thOcean"],["lavender","thLavender"],["sunset","thSunset"],["graphite","thGraphite"]].forEach(p=>{
    const e=el(p[1]);
    if(e){ const on=S.theme===p[0]; e.classList.toggle("on",on); e.setAttribute("aria-pressed",on?"true":"false"); }
  });
  const hint=el("themeHint");
  if(hint)hint.textContent=S.theme==="auto"
    ?"Cihazının görünüm ayarını izler; şu an "+(mq.matches?"gece":"gündüz")+" görünümünde."
    :(THEME_HINTS[S.theme]||"");
  setTimeout(()=>{if(el("deneme")&&el("deneme").classList.contains("active")){drawChart();drawSubjChart();}},60);
}
function setTheme(t){
  if(!THEME_NAMES[t])t="auto";
  S.theme=t; save(); applyTheme();
  toast("Tema: "+THEME_NAMES[S.theme]);
}
function cycleTheme(){
  const o=["auto","paper","night","forest","ocean","lavender","sunset","graphite"];
  setTheme(o[(o.indexOf(S.theme)+1)%o.length]);
}
if(mq.addEventListener)mq.addEventListener("change",()=>{ if(S.theme==="auto")applyTheme(); });
else if(mq.addListener)mq.addListener(()=>{ if(S.theme==="auto")applyTheme(); });

/* ================= SES ================= */
let audioCtx=null,noiseSrc=null,noiseGain=null;
function ensureAudio(){
  if(!audioCtx){ const C=window.AudioContext||window.webkitAudioContext; if(!C)return null; audioCtx=new C(); }
  if(audioCtx.state==="suspended")audioCtx.resume();
  return audioCtx;
}
function beep(times){
  if(!S.sound)return;
  const ctx=ensureAudio(); if(!ctx)return;
  const n=times||2;
  for(let i=0;i<n;i++){
    const o=ctx.createOscillator(),g=ctx.createGain(),t=ctx.currentTime+i*0.28;
    o.type="sine"; o.frequency.setValueAtTime(660,t);
    g.gain.setValueAtTime(0.0001,t);
    g.gain.exponentialRampToValueAtTime(0.22,t+0.03);
    g.gain.exponentialRampToValueAtTime(0.0001,t+0.24);
    o.connect(g); g.connect(ctx.destination); o.start(t); o.stop(t+0.26);
  }
}
function makeNoiseBuffer(ctx,type){
  const len=ctx.sampleRate*3,buf=ctx.createBuffer(1,len,ctx.sampleRate),d=buf.getChannelData(0);
  let last=0;
  for(let i=0;i<len;i++){
    const w=Math.random()*2-1;
    if(type==="brown"){ last=(last+0.02*w)/1.02; d[i]=last*3.2; }
    else d[i]=w*0.28;
  }
  return buf;
}
function startNoise(type){
  stopNoise();
  if(type==="none")return;
  const ctx=ensureAudio(); if(!ctx)return;
  noiseSrc=ctx.createBufferSource();
  noiseSrc.buffer=makeNoiseBuffer(ctx,type);
  noiseSrc.loop=true;
  noiseGain=ctx.createGain(); noiseGain.gain.value=0.16;
  if(type==="brown"){
    const lp=ctx.createBiquadFilter(); lp.type="lowpass"; lp.frequency.value=900;
    noiseSrc.connect(lp); lp.connect(noiseGain);
  } else noiseSrc.connect(noiseGain);
  noiseGain.connect(ctx.destination);
  noiseSrc.start();
}
function stopNoise(){
  if(noiseSrc){ try{noiseSrc.stop();}catch(e){} try{noiseSrc.disconnect();}catch(e){} noiseSrc=null; }
  if(noiseGain){ try{noiseGain.disconnect();}catch(e){} noiseGain=null; }
}
function setFocusSound(v){
  S.focusSound=v; save();
  ["none","white","brown"].forEach(t=>{ const e=el("fs_"+t); if(e)e.classList.toggle("on",v===t); });
  if(pomoState==="running"&&pomoIsWork)startNoise(v); else stopNoise();
}
/* ================= NAVİGASYON ================= */
function activeMoreTab(){
  for(const x of ["kay","tak","roz","veri","ayar"]){const b=el("mr_"+x);if(b&&b.classList.contains("on"))return x;}
  return "kay";
}
function activeAnaTab(){
  for(const x of ["trend","ders","kar","puan","verim"]){const b=el("an_"+x);if(b&&b.classList.contains("on"))return x;}
  return "trend";
}
function go(id){
  document.querySelectorAll(".screen").forEach(s=>s.classList.remove("active"));
  const t=el(id); if(t)t.classList.add("active");
  document.querySelectorAll(".tab").forEach(b=>{
    const on=b.dataset.s===id;
    b.classList.toggle("active",on); b.setAttribute("aria-selected",on?"true":"false");
    b.tabIndex=on?0:-1;
  });
  el("mainWrap").classList.toggle("wide",id==="program");
  if(typeof updateNav==="function")updateNav(id);
  window.scrollTo(0,0);
  if(id==="home")renderHome();
  if(id==="program"){renderPlan();renderCalendar();renderDayDetail();renderProcrast();}
  if(id==="topics"){renderSubjects();renderReviewQueue();}
  if(id==="deneme"){renderDenemeHistory();renderBlankWrong();if(typeof renderExam2==="function")renderExam2();setAnaTab(activeAnaTab());perfIdle("deneme-secondary",()=>{renderCompareOpts();renderWrongTopics();},700);}
  if(id==="pomo"){renderPomo();renderTimeDist();}
  if(id==="deneme"&&typeof renderRank==="function"){renderRank();renderDenemeGun();
    if(typeof renderTargets==="function"){renderTargets();renderNetGain();}}
  if(id==="more")setMoreTab(activeMoreTab());
}
let toastT;
function toast(m){
  const e=el("toast"); if(!e)return;
  /* Bir yazma hatasının hemen ardından gelen yanıltıcı başarı mesajını gösterme. */
  if(Date.now()-lastSaveFailedAt<2500 && /(?:✓|kaydedildi|eklendi|güncellendi)/i.test(String(m)))return;
  e.textContent=m; e.classList.add("show");
  clearTimeout(toastT); toastT=setTimeout(()=>e.classList.remove("show"),2000);
}

/* ================= SERİ / ROZET ================= */
function dayDone(k){
  const w=getWeek(keyOf(mondayOf(parseKey(k))),false);
  return !!(w&&w.done[dowOf(parseKey(k))]);
}
function planStreak(){
  let n=0,k=todayKey();
  if(!dayDone(k))k=addDaysKey(k,-1);
  while(dayDone(k)){ n++; k=addDaysKey(k,-1); if(n>2000)break; }
  return n;
}
function targetStreak(){
  if(S.target<=0)return 0;
  let n=0,k=todayKey();
  if((S.solved[k]||0)<S.target)k=addDaysKey(k,-1);
  while((S.solved[k]||0)>=S.target){ n++; k=addDaysKey(k,-1); if(n>2000)break; }
  return n;
}
function totalSolved(){ return perfMemo("totalSolved",()=>sumVals(S.solved)); }
function totalMinutes(){ return perfMemo("totalMinutes",()=>sumVals(S.pomoMin)); }
function fullTopicCount(){ return perfMemo("fullTopicCount",()=>Object.keys(S.topics).filter(k=>S.topics[k].st===3).length); }

function completedReviewCount(){ return Object.keys(S.topics||{}).reduce((a,k)=>a+((S.topics[k]&&Array.isArray(S.topics[k].rev))?S.topics[k].rev.length:0),0); }
function maxSubjectPct(){ let m=0; ALL_SUBJECTS.forEach(x=>{try{m=Math.max(m,subjStat(x.exam,x).pct||0);}catch(e){}}); return m; }
function badgeProg(cur,target,label){cur=Math.max(0,Number(cur)||0);target=Math.max(1,Number(target)||1);return{cur:cur,target:target,pct:Math.min(100,Math.round(cur/target*100)),label:label||Math.min(cur,target)+" / "+target};}
const BADGES=[
  {id:"q100",  ic:"✓", n:"İlk 100 soru",      d:"Toplam 100 soru çöz",         f:()=>totalSolved()>=100,   p:()=>badgeProg(totalSolved(),100)},
  {id:"q1000", ic:"↗", n:"1000 soru",         d:"Toplam 1000 soru çöz",        f:()=>totalSolved()>=1000,  p:()=>badgeProg(totalSolved(),1000)},
  {id:"q5000", ic:"◆", n:"5000 soru",         d:"Toplam 5000 soru çöz",        f:()=>totalSolved()>=5000,  p:()=>badgeProg(totalSolved(),5000)},
  {id:"h10",   ic:"◷", n:"10 saat odak",      d:"Toplam 10 saat çalış",        f:()=>totalMinutes()>=600,  p:()=>badgeProg(totalMinutes(),600,fmtHM(Math.min(totalMinutes(),600))+" / 10 sa")},
  {id:"h100",  ic:"◉", n:"100 saat odak",     d:"Toplam 100 saat çalış",       f:()=>totalMinutes()>=6000, p:()=>badgeProg(totalMinutes(),6000,fmtHM(Math.min(totalMinutes(),6000))+" / 100 sa")},
  {id:"d5",    ic:"▣", n:"5 deneme",          d:"5 deneme kaydet",             f:()=>S.denemeler.length>=5,  p:()=>badgeProg(S.denemeler.length,5)},
  {id:"d25",   ic:"▦", n:"25 deneme",         d:"25 deneme kaydet",            f:()=>S.denemeler.length>=25, p:()=>badgeProg(S.denemeler.length,25)},
  {id:"s7",    ic:"◇", n:"7 gün seri",        d:"7 gün üst üste günü tamamla", f:()=>planStreak()>=7,        p:()=>badgeProg(planStreak(),7)},
  {id:"s30",   ic:"✦", n:"30 gün seri",       d:"30 gün üst üste günü tamamla",f:()=>planStreak()>=30,       p:()=>badgeProg(planStreak(),30)},
  {id:"t50",   ic:"≡", n:"50 konu bitti",     d:"50 konuyu pekiştir",          f:()=>fullTopicCount()>=50,   p:()=>badgeProg(fullTopicCount(),50)},
  {id:"subj1", ic:"◎", n:"İlk ders tamam",    d:"Bir dersin tüm konularını pekiştir", f:()=>maxSubjectPct()>=100,p:()=>badgeProg(maxSubjectPct(),100,Math.min(100,maxSubjectPct())+"%")},
  {id:"rev20", ic:"↻", n:"Tekrarcı",          d:"20 tekrar tamamla",           f:()=>completedReviewCount()>=20,p:()=>badgeProg(completedReviewCount(),20)}
];
function checkBadges(silent){
  /* Ödül sistemi arayüzden kaldırıldı; eski yedeklerdeki kayıtlar korunur. */
  return [];
}

/* ================= SINAV FAZI ================= */
function phaseOf(d){
  if(d>240)return{t:"Temel öğrenme dönemi",s:"Konu öğrenmeye ağırlık ver, acele etme."};
  if(d>120)return{t:"Konu bitirme + soru",s:"Konuları kapat, her konu sonrası bol soru çöz."};
  if(d>45) return{t:"Tekrar + deneme",s:"Haftada en az bir deneme, eksiklere geri dön."};
  if(d>15) return{t:"Deneme + eksik kapatma",s:"Deneme sıklığını artır, yanlış konularına odaklan."};
  if(d>=0) return{t:"Tekrar ve dinlenme",s:"Yeni konuya başlama. Tekrar yap, uykunu düzelt."};
  return{t:"Sınav geçti","s":"Yeni hedef için tarihi güncelleyebilirsin."};
}

/* ================= BUGÜN NE ÇALIŞAYIM ================= */
function weakestSubject(){
  /* denemelerden ders bazlı en düşük başarı oranı; yoksa en düşük konu ilerlemesi */
  const agg={};
  S.denemeler.forEach(dn=>dn.subjectResults.forEach(sr=>{
    const tbl=DENEME_SUBJECTS[dn.type];
    const cap=(+sr.cap)||(tbl?(tbl.find(x=>x[0]===sr.name)||[null,1])[1]:1);
    if(!agg[sr.name])agg[sr.name]={net:0,cap:0,n:0};
    agg[sr.name].net+=sr.net; agg[sr.name].cap+=cap; agg[sr.name].n++;
  }));
  const keys=Object.keys(agg);
  if(keys.length){
    keys.sort((a,b)=>(agg[a].net/agg[a].cap)-(agg[b].net/agg[b].cap));
    return{name:keys[0],rate:Math.round(agg[keys[0]].net/agg[keys[0]].cap*100),src:"deneme"};
  }
  let best=null;
  ALL_SUBJECTS.forEach(s=>{ const st=subjStat(s.exam,s); if(!best||st.pct<best.rate)best={name:s.name,rate:st.pct,src:"konu"}; });
  return best;
}
function stalestTopic(){
  /* en uzun süredir dokunulmamış, tamamlanmamış konu */
  let cand=null;
  ALL_SUBJECTS.forEach(s=>s.topics.forEach(tp=>{
    const k=tkey(s.exam,s.name,tp),t=tget(k);
    if(t.st>=3)return;
    const w=(typeof topicWeight==="function")?topicWeight(k):1;
    /* düşük kademe + yüksek sınav ağırlığı önce gelir */
    const score=t.st-(w-1)*0.6;
    if(!cand||score<cand.score)cand={key:k,exam:s.exam,subj:s.name,topic:tp,score:score,st:t.st,w:w};
  }));
  return cand;
}
function topWrongTopics(n){
  const agg={};
  S.wrongLog.forEach(w=>{ const k=w.subject+" · "+w.topic; agg[k]=(agg[k]||0)+(+w.n||1); });
  return Object.keys(agg).map(k=>({k:k,n:agg[k]})).sort((a,b)=>b.n-a.n).slice(0,n||5);
}
function renderSuggest(){
  const wrap=el("suggestBox"); if(!wrap)return;
  const out=[];
  const od=(typeof overdueTopics==="function")?overdueTopics():[];
  if(od.length) out.push({i:"!",t:"Hedef tarihi geçti",d:od[0].subj+" · "+od[0].topic+" · "+Math.abs(od[0].left)+" gün gecikti"+(od.length>1?" (+"+(od.length-1)+")":""),go:"topics"});
  const rq=reviewQueue();
  if(rq.length) out.push({i:"↻",t:"Tekrar zamanı geldi",d:rq[0].subj+" · "+rq[0].topic+(rq.length>1?" (+"+(rq.length-1)+" konu daha)":""),go:"topics",plan:rq[0].subj+" · "+rq[0].topic+" tekrar"});
  const tw=topWrongTopics(1);
  if(tw.length) out.push({i:"✗",t:"En çok hata yaptığın konu",d:tw[0].k+" · "+tw[0].n+" yanlış",go:"deneme",plan:tw[0].k+" soru çöz"});
  const ws=weakestSubject();
  if(ws) out.push({i:"↓",t:"En zayıf dersin",d:ws.name+" · "+(ws.src==="deneme"?"deneme başarı %"+ws.rate:"konu ilerleme %"+ws.rate),go:"topics"});
  const st=stalestTopic();
  const br=(typeof branchSuggestion==="function")?branchSuggestion():null;
  if(br) out.push({i:"◆",t:"Branş denemesi zamanı",d:br.name+" · konuların %"+br.pct+"'i tamam, ölçme vakti",go:"deneme",plan:br.name+" branş denemesi"});
  if(st) out.push({i:"•",t:"Sıradaki konu",
    d:st.subj+" · "+st.topic+" ("+ST_LABEL[st.st]+(st.w>=3?" · çok soru gelen konu":st.w===2?" · sık soru gelen konu":"")+")",go:"topics",
    plan:st.subj+" · "+st.topic});
  if(!out.length){ wrap.innerHTML='<div class="empty">Veri biriktikçe burada öneri çıkacak.</div>'; return; }
  wrap.innerHTML=out.slice(0,4).map(o=>{
    const plan=o.plan?`<button class="btn ghost tiny sugadd" onclick="event.stopPropagation();addToToday('${String(o.plan).replace(/'/g,"\\'")}')">Plana ekle</button>`:"";
    return `<div class="sug" onclick="go('${o.go}')"><span class="si">${o.i}</span>
      <div style="flex:1;min-width:0"><div class="st">${esc(o.t)}</div><div class="sd">${esc(o.d)}</div></div>${plan}</div>`;
  }).join("");
}

/* ================= HAFTALIK ÖZET ================= */
function weekAgg(monKey){
  let min=0,q=0,done=0,nets=[],pauses=0;
  for(let i=0;i<7;i++){
    const k=addDaysKey(monKey,i);
    min+=S.pomoMin[k]||0; q+=S.solved[k]||0; pauses+=S.pauses[k]||0;
    if(dayDone(k))done++;
    S.denemeler.filter(x=>x.date===k).forEach(x=>nets.push(x.totalNet));
  }
  return {min:min,q:q,done:done,pauses:pauses,net:nets.length?r2(nets.reduce((a,b)=>a+b,0)/nets.length):null,denemeCount:nets.length};
}
function delta(a,b){
  if(b===0&&a===0)return {txt:"—",cls:"flat"};
  if(b===0)return {txt:"yeni",cls:"up"};
  const p=Math.round((a-b)/b*100);
  return {txt:(p>0?"+":"")+p+"%",cls:p>0?"up":p<0?"down":"flat"};
}
function renderWeekSummary(){
  const wrap=el("weekSummary"); if(!wrap)return;
  const thisMon=keyOf(mondayOf(new Date())),lastMon=addDaysKey(thisMon,-7);
  const a=weekAgg(thisMon),b=weekAgg(lastMon);
  const rows=[
    ["Çalışma",fmtHM(a.min),delta(a.min,b.min)],
    ["Soru",a.q+"",delta(a.q,b.q)],
    ["Tamamlanan gün",a.done+"/7",delta(a.done,b.done)],
    ["Deneme ort. net",a.net==null?"—":a.net+"",a.net==null||b.net==null?{txt:"—",cls:"flat"}:delta(a.net,b.net)]
  ];
  wrap.innerHTML=rows.map(r=>
    `<div class="dayrow"><span class="k">${r[0]}</span><span class="v">${esc(r[1])} <em class="dl ${r[2].cls}">${r[2].txt}</em></span></div>`).join("");
  /* geçmiş halinle yarış */
  const oldMon=addDaysKey(thisMon,-56),o=weekAgg(oldMon);
  const pw=el("pastSelf");
  if(pw){
    if(o.min===0&&o.q===0){ pw.textContent="8 hafta sonra burada geçmiş halinle karşılaştırma çıkacak."; }
    else{
      const dm=a.min-o.min;
      pw.textContent="8 hafta önceki sen bu hafta "+fmtHM(o.min)+" çalışmıştı; sen "+fmtHM(a.min)+"tesin ("+(dm>=0?"+":"")+fmtHM(Math.abs(dm))+")."
    }
  }
}

/* ================= HEDEF NET PROJEKSİYONU ================= */
function recentAvgNet(type,n){
  const list=S.denemeler.filter(d=>type?d.type===type:d.type!=="BRANS").sort((a,b)=>b.id-a.id).slice(0,n||3);
  if(!list.length)return null;
  return r2(list.reduce((a,d)=>a+d.totalNet,0)/list.length);
}
function renderProjection(){
  const w=el("projBox"); if(!w)return;
  const cur=recentAvgNet(null,3),d=daysUntil(S.examDate);
  if(!S.targetNet||!cur){ w.innerHTML='<div class="empty">Ayarlardan hedef netini gir ve deneme ekle; buraya ilerleme projeksiyonu çıkacak.</div>'; return; }
  const gap=r2(S.targetNet-cur),weeks=Math.max(1,Math.round(d/7));
  const perWeek=r2(gap/weeks);
  w.innerHTML=
    `<div class="dayrow"><span class="k">Son 3 deneme ortalaman</span><span class="v">${cur} net</span></div>`+
    `<div class="dayrow"><span class="k">Hedef net</span><span class="v">${S.targetNet}</span></div>`+
    `<div class="dayrow"><span class="k">Fark</span><span class="v" style="color:${gap>0?"var(--ochre-ink)":"var(--green)"}">${gap>0?"+"+gap:gap}</span></div>`+
    (gap>0?`<div class="dayrow"><span class="k">Haftalık gerekli artış</span><span class="v">${perWeek} net</span></div>`
          :`<div class="dayrow"><span class="k">Durum</span><span class="v" style="color:var(--green)">Hedefin üzerindesin</span></div>`);
}

/* ================= ANA SAYFA ================= */
const QUOTES=['"Hayal gücü bilgiden daha önemlidir." — Albert Einstein','"Deha yüzde bir ilham, yüzde doksan dokuz terdir." — Thomas Edison','"İmkânsız görünür; ta ki yapılana kadar." — Nelson Mandela','"Beni öldürmeyen şey beni güçlendirir." — Friedrich Nietzsche','"Zamanınız sınırlı; başkasının hayatını yaşayarak harcamayın." — Steve Jobs','"Hayatta hiçbir şey korkulacak değildir; yalnızca anlaşılmalıdır." — Marie Curie'];

function renderHomeGoals(){
  const k=todayKey(),q=Math.max(0,S.solved[k]||0),qGoal=Math.max(0,S.target||0);
  const min=Math.max(0,S.pomoMin[k]||0),minGoal=Math.max(0,(S.focus&&S.focus.goalMin)||0);
  const qv=el("homeGoalQ"),qb=el("homeGoalQBar"),qs=el("homeGoalQSub");
  if(qv)qv.textContent=qGoal?(q+" / "+qGoal):String(q);
  if(qb)qb.style.width=(qGoal?Math.min(100,Math.round(q/qGoal*100)):(q?100:0))+"%";
  if(qs)qs.textContent=qGoal?(q>=qGoal?"Hedef tamam ✓":Math.max(0,qGoal-q)+" soru kaldı"):"Hedef belirlenmemiş";
  const qCard=el("goalQCard"); if(qCard)qCard.classList.toggle("warn",!!qGoal&&q<qGoal);
  const mv=el("homeGoalMin"),mb=el("homeGoalMinBar"),ms=el("homeGoalMinSub");
  if(mv)mv.textContent=minGoal?(min+" / "+minGoal+" dk"):(min+" dk");
  if(mb)mb.style.width=(minGoal?Math.min(100,Math.round(min/minGoal*100)):(min?100:0))+"%";
  if(ms)ms.textContent=minGoal?(min>=minGoal?"Odak hedefi tamam ✓":Math.max(0,minGoal-min)+" dk kaldı"):"Odak hedefi kapalı";
  const mCard=el("goalMinCard"); if(mCard)mCard.classList.toggle("warn",!!minGoal&&min<minGoal);
  const nv=el("homeGoalNet"),ns=el("homeGoalNetSub"),cur=recentAvgNet(null,3);
  if(nv){ if(S.targetNet&&cur!=null)nv.textContent=cur+" → "+S.targetNet; else if(S.targetNet)nv.textContent="→ "+S.targetNet; else if(cur!=null)nv.textContent=String(cur); else nv.textContent="—"; }
  if(ns){
    if(S.targetNet&&cur!=null){ const gap=r2(S.targetNet-cur); ns.textContent=gap>0?gap+" net fark":gap<0?Math.abs(gap)+" net hedefin üstü":"Hedefe ulaştın ✓"; }
    else if(S.targetNet)ns.textContent="İlk denemeni bekliyor"; else ns.textContent="Hedef net belirlenmemiş";
  }
  const rq=reviewQueue(),rv=el("homeGoalRev"),rs=el("homeGoalRevSub");
  if(rv)rv.textContent=String(rq.length);
  if(rs)rs.textContent=rq.length?(rq.filter(x=>x.late>0).length?rq.filter(x=>x.late>0).length+" gecikmiş tekrar":"Bugün tekrar var"):"Bekleyen yok";
}
function smartAgg(start,days){ let min=0,q=0; for(let i=0;i<days;i++){ const k=addDaysKey(start,i); min+=S.pomoMin[k]||0; q+=S.solved[k]||0; } return {min:min,q:q}; }
function smartInsights(){
  return perfMemo("smartInsights:"+todayKey(),()=>{
  const out=[],today=new Date(),elapsed=dowOf(today)+1,mon=keyOf(mondayOf(today)),prev=addDaysKey(mon,-7),a=smartAgg(mon,elapsed),b=smartAgg(prev,elapsed);
  if(b.min>=30){ const pct=Math.round((a.min-b.min)/Math.max(1,b.min)*100); if(pct<=-15)out.push({c:"warn",i:"↘",t:"Çalışma süren geride",d:"Geçen haftanın aynı dönemine göre %"+Math.abs(pct)+" daha az odak süresi kaydettin."}); else if(pct>=15)out.push({c:"good",i:"↗",t:"Çalışma süren yükseldi",d:"Geçen haftanın aynı dönemine göre %"+pct+" daha fazla odak süresi kaydettin."}); }
  if(b.q>=50){ const pct=Math.round((a.q-b.q)/Math.max(1,b.q)*100); if(pct<=-20)out.push({c:"warn",i:"Q",t:"Soru ritmin düştü",d:"Geçen haftanın aynı dönemine göre %"+Math.abs(pct)+" daha az soru kaydı var."}); else if(pct>=20)out.push({c:"good",i:"Q",t:"Soru ritmin güçlendi",d:"Geçen haftanın aynı dönemine göre %"+pct+" daha fazla soru çözdün."}); }
  const ds=S.denemeler.filter(d=>d.type!=="BRANS").slice().sort((x,y)=>((x.date||"").localeCompare(y.date||""))||((x.id||0)-(y.id||0)));
  if(ds.length>=4){ const last=ds.slice(-2),prev2=ds.slice(-4,-2),la=r2(last.reduce((z,d)=>z+(+d.totalNet||0),0)/2),pa=r2(prev2.reduce((z,d)=>z+(+d.totalNet||0),0)/2),dif=r2(la-pa); if(dif>=1)out.push({c:"good",i:"N",t:"Deneme ortalaman yükseliyor",d:"Son 2 genel denemen, önceki 2 denemeden ortalama "+dif+" net daha yüksek."}); else if(dif<=-1)out.push({c:"bad",i:"N",t:"Deneme ortalaman düştü",d:"Son 2 genel denemen, önceki 2 denemeden ortalama "+Math.abs(dif)+" net daha düşük. Ders bazlı karşılaştırmaya bak."}); }
  const rq=reviewQueue(); if(rq.length){ const late=rq.filter(x=>x.late>0); out.push({c:late.length?"warn":"",i:"↻",t:late.length?"Tekrar kuyruğunda gecikme var":"Bugün tekrar günü",d:late.length?(late.length+" konu gecikmiş. En eski: "+rq[0].subj+" · "+rq[0].topic):(rq.length+" konu 3–7–21 tekrar planında bugün sırada.")}); }
  const hasSubjData=S.denemeler.some(d=>Array.isArray(d.subjectResults)&&d.subjectResults.length>0);
  if(hasSubjData||overallPct()>0){ const ws=weakestSubject(); if(ws&&isFinite(ws.rate))out.push({c:"",i:"◎",t:"Öncelikli ders: "+ws.name,d:(ws.src==="deneme"?"Deneme başarı oranı %":"Konu ilerlemesi %")+ws.rate+". Bugünkü planda kısa bir blok ayırmak mantıklı."}); }
  const tw=topWrongTopics(1); if(tw.length&&tw[0].n>=3)out.push({c:"bad",i:"!",t:"Yanlışlar bir konuda birikiyor",d:tw[0].k+" · toplam "+tw[0].n+" yanlış kaydı."});
  if(!out.length){ if(totalMinutes()||totalSolved()||S.denemeler.length)out.push({c:"good",i:"✓",t:"Belirgin bir alarm yok",d:"Şimdilik çalışma ritminde güçlü bir sapma görünmüyor. Veri biriktikçe yorumlar daha anlamlı olacak."}); else out.push({c:"",i:"·",t:"Analiz için veri gerekiyor",d:"Soru, çalışma süresi ve deneme kaydı girdikçe burada otomatik yorumlar oluşacak."}); }
  return out.slice(0,4);
  });
}
function renderSmartInsights(){ const w=el("smartInsightBox"); if(!w)return; const list=smartInsights(); w.innerHTML=list.map(x=>`<div class="smart-insight ${x.c||""}"><span class="ii">${esc(x.i)}</span><div><div class="it">${esc(x.t)}</div><div class="id">${esc(x.d)}</div></div></div>`).join("")+'<div class="smart-foot"><button class="btn ghost tiny" onclick="go(\'deneme\');setAnaTab(\'verim\')">Detaylı analize git</button></div>'; }
function reviewScheduleHTML(t){ if(!t||t.st!==3||!t.ts)return ""; const now=todayKey(); return '<span class="review-schedule">'+REVIEW_GAPS.map((gap,gi)=>{ const done=(t.rev||[]).indexOf(gi)>=0,due=addDaysKey(t.ts,gap),isDue=!done&&due<=now; return '<span class="review-step '+(done?'done':isDue?'due':'')+'">'+gap+'. gün'+(done?' ✓':'')+'</span>'; }).join('')+'</span>'; }

function renderHome(){
  el("greeting").textContent=S.name?"Merhaba, "+S.name:"Merhaba";
  const d=daysUntil(S.examDate),ph=phaseOf(d);
  el("countdown").textContent=d>=0?d:0;
  el("phaseTitle").textContent=ph.t;
  el("phaseSub").textContent=ph.s;
  const dt=parseKey(S.examDate);
  el("examDateLabel").textContent=dt.toLocaleDateString("tr-TR",{day:"numeric",month:"long",year:"numeric"});
  const win=365,elp=Math.max(0,Math.min(win,win-Math.max(0,d)));
  el("timeline").style.width=Math.round(elp/win*100)+"%";

  const k=todayKey(),solved=S.solved[k]||0;
  el("stQ").textContent=solved;
  el("stMin").textContent=S.pomoMin[k]||0;
  el("stPomo").textContent=Math.floor((S.pomoMin[k]||0)/Math.max(1,S.workMin));

  const p=overallPct();
  el("homeRing").setAttribute("stroke-dashoffset",188*(1-p/100));
  el("homeRingTxt").textContent="%"+p;
  el("quote").textContent=QUOTES[parseInt(k.replace(/-/g,""),10)%QUOTES.length];

  el("streakPlan").textContent=planStreak();
  el("streakTarget").textContent=targetStreak();

  el("solvedInput").value=solved||"";
  const rem=Math.max(0,S.target-solved);
  el("targetLabel").textContent=rem>0?"Hedefe "+rem+" soru kaldı.":"Bugünkü hedefini tamamladın 🎉";

  el("journalInput").value=S.journal[k]||"";

  /* yedek hatırlatması */
  const bb=el("backupBanner");
  const stale=!S.lastBackup||diffKeys(S.lastBackup,k)>30;
  const hasData=totalSolved()>0||S.denemeler.length>0||totalMinutes()>0;
  bb.style.display=(stale&&hasData)?"block":"none";

  renderHomeGoals(); renderSuggest(); renderSmartInsights(); renderTodayPlan(); renderWeekSummary(); renderProjection();
  if(typeof renderRest==="function")renderRest();
  if(typeof renderEffective==="function")renderEffective();
  if(typeof renderCoachBoard==="function"){renderCoachBoard();renderCoachNotes();}
  if(typeof renderMorning==="function"){renderMorning();renderDenemeReminder();renderContract();}
}
function renderHomeBadges(){
  return false;
}
function saveSolved(){
  if(typeof coachBlock==="function"&&coachBlock("soru kaydı"))return;
  S.solved[todayKey()]=Math.max(0,parseInt(el("solvedInput").value,10)||0);
  save(); renderHome(); toast("Kaydedildi");
}
function saveJournal(){
  if(typeof coachBlock==="function"&&coachBlock("günlük kaydı"))return;
  const k=todayKey(),v=el("journalInput").value.trim();
  if(v)S.journal[k]=v; else delete S.journal[k];
  save(); toast("Günlük kaydedildi");
}

/* ==================================================================
   PLAN HÜCRESİNDEN VİDEOYA
   Kamp "Ders · Konu" biçiminde yazıyor. Bu biçimdeki hücreler için
   doğrudan video düğmesi çıkar; hoca bağlıysa onun kanalında arar.
   ================================================================== */
/* Hücrede bir video/oynatma listesi bağlantısı var mı? */
function cellLink(txt){
  const t=String(txt||"");
  const m=t.match(/https?:\/\/[^\s]+/);
  if(!m)return null;
  const url=m[0].replace(/[.,;)]+$/,"");
  const vid=url.match(/youtu\.be\/([\w-]{6,})/);
  const pl=url.match(/[?&]list=([\w-]{6,})/);
  const ad=t.replace(url,"").replace(/^[▶☰]\s*/,"").replace(/[\s—–-]+$/,"").trim();
  return {url:url,videoId:vid?vid[1]:"",listId:pl?pl[1]:"",ad:ad};
}
function cellOpenLink(txt){
  const l=cellLink(txt);
  if(!l)return false;
  if(l.videoId&&typeof openSingleVideo==="function")
    return openSingleVideo(l.videoId,l.ad||"Video");
  openExternalUrl(l.url);
  return true;
}
function cellTopic(txt){
  const t=String(txt||"").trim();
  const i=t.indexOf(" · ");
  if(i<1)return null;
  const subj=t.slice(0,i).trim(),topic=t.slice(i+3).trim();
  if(!subj||!topic)return null;
  const key=(typeof topicKeyOf==="function")?topicKeyOf(subj,topic):"";
  if(!key)return null;
  let hoca="";
  const rl=(typeof resList==="function")?resList(key):[];
  const vid=rl.find(r=>r.tur==="video"&&r.hoca);
  if(vid)hoca=vid.hoca;
  else if(S.camp&&S.camp.hoca&&S.camp.hoca[subj])hoca=S.camp.hoca[subj];
  return {subj:subj,topic:topic,key:key,hoca:hoca,kaynak:rl.length};
}
function cellVideo(txt){
  if(cellLink(txt))return cellOpenLink(txt);
  const c=cellTopic(txt);
  if(!c){ toast("Bu satır bir konuya bağlı değil"); return false; }
  if(typeof openVideos!=="function")return false;
  if(c.hoca)return openVideos((c.topic+" konu anlatımı").trim(),c.hoca+" · "+c.topic,
    {teacher:c.hoca,subject:c.subj,topic:c.topic});
  return openVideos(c.subj+" "+c.topic+" konu anlatımı YKS",c.subj+" · "+c.topic,
    {subject:c.subj,topic:c.topic});
}
function cellVidBtn(txt){
  const esc3=v=>String(v).replace(/'/g,"\\'");
  const l=cellLink(txt);
  if(l){
    return '<button class="cvid on" title="Videoyu aç" '+
      'onpointerdown="event.stopPropagation()" '+
      'onclick="event.stopPropagation();cellOpenLink(\''+esc3(txt)+'\')">▶</button>';
  }
  const c=cellTopic(txt);
  if(!c)return "";
  const esc2=v=>String(v).replace(/'/g,"\\'");
  return '<button class="cvid'+(c.hoca?" on":"")+'" title="'+
    (c.hoca?esc(c.hoca)+" videosu":"Konu videosu")+
    '" onclick="event.stopPropagation();cellVideo(\''+esc2(txt)+'\')">▶</button>';
}

function renderTodayPlan(){
  const now=new Date(),dw=dowOf(now),wk=keyOf(mondayOf(now)),w=getWeek(wk,false);
  el("todayPlanTitle").textContent="Bugünün programı · "+DAYS_FULL[dw];
  const wrap=el("todayPlan");
  if(!w){ wrap.innerHTML='<div class="empty">Bu hafta için plan yok.<br>Program sekmesinden doldurabilirsin.</div>'; return; }
  let html="",filled=0,done=0;
  ["r","s"].forEach(blk=>{
    w[blk].forEach((row,i)=>{
      const txt=row[dw];
      if(!txt||!txt.trim())return;
      filled++;
      const cid=blk+"-"+i+"-"+dw,isDone=!!w.dn[cid];
      if(isDone)done++;
      const lbl=blk==="r"?(S.rowLabels.r[i]||"Rutin"):(S.rowLabels.s[i]||"—");
      html+=`<div class="plancell ${isDone?"pd":""}" onclick="toggleCellDone('${wk}','${cid}')">
        <span class="pl">${esc(lbl)}</span><span class="pt">${esc(txt)}</span>${cellVidBtn(txt)}<button class="plan-tomorrow" title="Yarına taşı" onclick="event.stopPropagation();movePlanCellTomorrow('${wk}','${blk}',${i},${dw})">→ Yarına</button></div>`;
    });
  });
  if(!filled){ wrap.innerHTML='<div class="empty">Bugün için hücre doldurulmamış.</div>'; return; }
  const pct=Math.round(done/filled*100);
  html=`<div class="fid"><div class="bar"><i style="width:${pct}%"></i></div>
      <span>Plan sadakati: ${done}/${filled} · %${pct}</span></div>`+html;
  html+=`<div style="margin-top:14px;"><button class="btn ${w.done[dw]?"ghost":"green"} small" style="width:100%;" onclick="toggleTodayDone()">${w.done[dw]?"Günü tamamladım ✓":"Günü tamamladım"}</button></div>`;
  wrap.innerHTML=html;
}
function toggleTodayDone(){
  const now=new Date(),dw=dowOf(now),wk=keyOf(mondayOf(now)),w=getWeek(wk,true);
  w.done[dw]=!w.done[dw];
  save();
  renderTodayPlan(); renderHome();
  if(el("program").classList.contains("active"))renderPlan();
}
/* ================= HAFTA VERİSİ ================= */
function blankWeek(){
  return {r:Array.from({length:S.rows.r},()=>new Array(7).fill("")),
          s:Array.from({length:S.rows.s},()=>new Array(7).fill("")),
          done:new Array(7).fill(false),dn:{},mv:{}};
}
function normWeek(w){
  if(!Array.isArray(w.r))w.r=[];
  if(!Array.isArray(w.s))w.s=[];
  if(!Array.isArray(w.done))w.done=new Array(7).fill(false);
  if(!w.dn||typeof w.dn!=="object")w.dn={};
  if(!w.mv||typeof w.mv!=="object"||Array.isArray(w.mv))w.mv={};
  while(w.r.length<S.rows.r)w.r.push(new Array(7).fill(""));
  while(w.s.length<S.rows.s)w.s.push(new Array(7).fill(""));
  w.r.forEach(r=>{while(r.length<7)r.push("");});
  w.s.forEach(r=>{while(r.length<7)r.push("");});
  while(w.done.length<7)w.done.push(false);
  return w;
}
function getWeek(k,create){
  let w=S.weeks[k];
  if(!w){ if(!create)return null; w=blankWeek(); S.weeks[k]=w; }
  return normWeek(w);
}
function weekHasData(w){
  if(!w)return false;
  return w.done.some(Boolean)||w.r.some(r=>r.some(c=>c&&c.trim()))||w.s.some(r=>r.some(c=>c&&c.trim()));
}
function toggleCellDone(wk,cid){
  const w=getWeek(wk,true);
  if(w.dn[cid])delete w.dn[cid]; else w.dn[cid]=1;
  save();
  if(el("program").classList.contains("active"))renderPlan();
  if(el("home").classList.contains("active"))renderTodayPlan();
}

/* ================= PLAN IZGARASI ================= */
let curWeek=mondayOf(new Date()),calDate=new Date(),selDate=todayKey();
function setProgTab(t){
  el("pSegWeek").classList.toggle("on",t==="week");
  el("pSegCal").classList.toggle("on",t==="cal");
  el("progWeek").style.display=t==="week"?"block":"none";
  el("progCal").style.display=t==="cal"?"block":"none";
  if(t==="cal"){renderCalendar();renderDayDetail();renderProcrast();} else renderPlan();
}
function shiftWeek(n){
  curWeek=new Date(curWeek.getFullYear(),curWeek.getMonth(),curWeek.getDate()+n*7);
  renderPlan();
}
function thisWeek(){ curWeek=mondayOf(new Date()); renderPlan(); }
function weekRangeLabel(ws){
  const we=new Date(ws); we.setDate(ws.getDate()+6);
  return ws.getDate()+" "+MONTHS[ws.getMonth()]+" – "+we.getDate()+" "+MONTHS[we.getMonth()]+" "+we.getFullYear();
}
function subjColorStyle(txt){
  if(!txt)return "";
  const hit=SUBJ_NAMES.find(n=>txt.toLocaleLowerCase("tr").indexOf(n.toLocaleLowerCase("tr").split(" ")[0])>=0);
  if(!hit)return "";
  return `border-left:5px solid hsl(${hueOf(hit)} 55% 45%);`;
}
function programDayStats(w,d){
  let filled=0,done=0;
  ["r","s"].forEach(blk=>w[blk].forEach((row,i)=>{
    const c=row[d];if(c&&String(c).trim()){filled++;if(w.dn[blk+"-"+i+"-"+d])done++;}
  }));
  return {filled:filled,done:done,pct:filled?Math.round(done/filled*100):0};
}
function programWeekStats(w){
  let filled=0,done=0;const days=[];
  for(let d=0;d<7;d++){const x=programDayStats(w,d);days.push(x);filled+=x.filled;done+=x.done;}
  return {filled:filled,done:done,pct:filled?Math.round(done/filled*100):0,days:days};
}
function programIsCurrentWeek(wk){return wk===keyOf(mondayOf(new Date()));}
function programHeadHtml(d,w,wk){
  const x=programDayStats(w,d),today=programIsCurrentWeek(wk)&&d===dowOf(new Date());
  return `<div class="gcell ghead ${today?"today-col":""}"><span>${DAYS_FULL[d]}</span><small id="progDayCount${d}">${x.filled?x.done+"/"+x.filled:"—"}</small></div>`;
}
function renderProgramSummary(wk,w){
  const box=el("programWeekOverview");if(!box)return;
  const st=programWeekStats(w),current=programIsCurrentWeek(wk),today=current?dowOf(new Date()):-1;
  const chips=st.days.map((x,d)=>`<div class="program-day-chip ${d===today?"today":""} ${x.filled&&x.done===x.filled?"all-done":""}"><span>${DAYS[d]}</span><b>${x.filled?x.done+"/"+x.filled:"—"}</b><i><em style="width:${x.pct}%"></em></i></div>`).join("");
  let msg=st.filled?`${st.done}/${st.filled} görev tamamlandı · %${st.pct}`:"Bu hafta henüz görev yok";
  if(st.filled&&st.done===st.filled)msg="Haftanın tüm görevleri tamamlandı ✓";
  box.innerHTML=`<div class="program-week-top"><div><span>Haftalık ilerleme</span><b>${msg}</b></div><strong>${st.pct}%</strong></div><div class="program-week-bar"><i style="width:${st.pct}%"></i></div><div class="program-day-chips">${chips}</div>`;
}
function cellHtml(blk,i,d,w,wk){
  const txt=w[blk][i][d]||"",cid=blk+"-"+i+"-"+d,done=!!w.dn[cid],moved=w.mv&&w.mv[cid],today=programIsCurrentWeek(wk)&&d===dowOf(new Date());
  const moveMark=moved?`<span class="moved-mark" title="Önceki günden taşındı">→</span>`:"";
  return `<div class="gcell gc ${done?"cdone":""} ${today?"today-col":""} ${moved?"moved-in":""}" data-plan-cell="1" data-blk="${blk}" data-i="${i}" data-d="${d}" style="${subjColorStyle(txt)}">`+
    `<span class="tick" onclick="event.stopPropagation();toggleCellDone('${wk}','${cid}')" title="Yaptım olarak işaretle">${done?"✓":""}</span>`+
    moveMark+`<span class="gtx" contenteditable="true" data-blk="${blk}" data-i="${i}" data-d="${d}">${esc(txt)}</span>`+
    cellVidBtn(txt)+`</div>`;
}
function doneHtml(d,w,wk){
  const today=programIsCurrentWeek(wk)&&d===dowOf(new Date()),x=programDayStats(w,d);
  return `<div class="gcell gdone ${w.done[d]?"on":""} ${today?"today-col":""}" onclick="toggleWeekDone(${d})"><span class="box"></span><span>Günü tamamladım${x.filled?`<small>${x.done}/${x.filled}</small>`:""}</span></div>`;
}
function renderPlan(){
  const wk=keyOf(curWeek),w=getWeek(wk,false)||normWeek(blankWeek());
  el("wkLabel").textContent=weekRangeLabel(curWeek);
  el("wkSub").textContent=wk===keyOf(mondayOf(new Date()))?"bu hafta":"";

  let hR=`<div class="gcell gempty"></div>`+
    [0,1,2,3,4].map(d=>programHeadHtml(d,w,wk)).join("")+
    `<div class="gspacer"></div>`+
    [5,6].map(d=>programHeadHtml(d,w,wk)).join("");
  hR+=`<div class="gcell gtag" style="grid-row:span ${S.rows.r};">RUTİNLER</div>`;
  for(let i=0;i<S.rows.r;i++){
    hR+=[0,1,2,3,4].map(d=>cellHtml("r",i,d,w,wk)).join("")+`<div class="gspacer"></div>`+
        [5,6].map(d=>cellHtml("r",i,d,w,wk)).join("");
  }
  el("gridR").innerHTML=hR;

  let hS=`<div class="gbar">DERS PROGRAMIM</div>`;
  for(let i=0;i<S.rows.s;i++){
    hS+=`<div class="gcell glabel" contenteditable="true" data-lbl="s" data-i="${i}">${esc(S.rowLabels.s[i]||"")}</div>`+
        [0,1,2,3,4].map(d=>cellHtml("s",i,d,w,wk)).join("")+`<div class="gspacer"></div>`+
        [5,6].map(d=>cellHtml("s",i,d,w,wk)).join("");
  }
  hS+=`<div class="gcell gempty"></div>`+
      [0,1,2,3,4].map(d=>doneHtml(d,w,wk)).join("")+`<div class="gspacer"></div>`+
      [5,6].map(d=>doneHtml(d,w,wk)).join("");
  el("gridS").innerHTML=hS;

  document.querySelectorAll("#gridR [data-blk],#gridS [data-blk]").forEach(e=>{
    e.addEventListener("input",()=>{
      const wkNow=keyOf(curWeek),ww=getWeek(wkNow,true);
      const bi=e.dataset.blk,ii=+e.dataset.i,dd=+e.dataset.d,cid=bi+"-"+ii+"-"+dd;
      ww[bi][ii][dd]=e.textContent;
      if(!String(e.textContent||"").trim()&&ww.mv)delete ww.mv[cid];
      saveSoon(180);perfRAF("program-summary",()=>{const wkLive=keyOf(curWeek),wLive=getWeek(wkLive,false);if(wLive)renderProgramSummary(wkLive,wLive);});
    });
    e.addEventListener("blur",()=>flushSaveSoon());
  });
  document.querySelectorAll("#gridS [data-lbl]").forEach(e=>{
    e.addEventListener("input",()=>{
      S.rowLabels[e.dataset.lbl][+e.dataset.i]=e.textContent;
      saveSoon(220);
    });
    e.addEventListener("blur",()=>flushSaveSoon());
  });

  renderProgramSummary(wk,w);

  /* haftalık sadakat */
  let filled=0,done=0;
  ["r","s"].forEach(blk=>w[blk].forEach((row,i)=>row.forEach((c,d)=>{
    if(c&&c.trim()){ filled++; if(w.dn[blk+"-"+i+"-"+d])done++; }
  })));
  el("weekFid").innerHTML=filled
    ?`<div class="bar"><i style="width:${Math.round(done/filled*100)}%"></i></div><span>Bu hafta plan sadakati: ${done}/${filled} · %${Math.round(done/filled*100)}</span>`
    :`<span>Hücreleri doldurdukça sadakat oranın burada görünecek.</span>`;
  bindPlanLongPress();
  if(typeof renderProgramAssist==="function")renderProgramAssist();
}
function toggleWeekDone(d){
  const wk=keyOf(curWeek),w=getWeek(wk,true);
  w.done[d]=!w.done[d];
  save(); renderPlan(); renderTodayPlan();
}
function addRow(blk){
  if(S.rows[blk]>=MAX_ROWS){ toast("Daha fazla satır eklenemez"); return; }
  S.rows[blk]++; S.rowLabels[blk].push("");
  Object.keys(S.weeks).forEach(k=>{ const w=S.weeks[k]; if(w&&Array.isArray(w[blk]))w[blk].push(new Array(7).fill("")); });
  save(); renderPlan();
}
function delRow(blk){
  if(S.rows[blk]<=1){ toast("En az bir satır kalmalı"); return; }
  const idx=S.rows[blk]-1;
  const used=Object.keys(S.weeks).some(k=>{ const w=S.weeks[k]; return w&&w[blk]&&w[blk][idx]&&w[blk][idx].some(c=>c&&c.trim()); });
  if(used&&!confirm("Son satırda yazılı içerik var, tüm haftalardan silinecek. Devam edilsin mi?"))return;
  if(used){
    const rowsBk=clone(S.rows),labelBk=clone(S.rowLabels),weekBk=clone(S.weeks);
    pushUndo("Satır silindi",()=>{ S.rows=rowsBk; S.rowLabels=labelBk; S.weeks=weekBk; });
  }
  S.rows[blk]--; S.rowLabels[blk].splice(idx,1);
  Object.keys(S.weeks).forEach(k=>{
    const w=S.weeks[k]; if(!w)return;
    if(w[blk])w[blk].splice(idx,1);
    if(w.dn)Object.keys(w.dn).forEach(c=>{ if(c.indexOf(blk+"-"+idx+"-")===0)delete w.dn[c]; });
    if(w.mv)Object.keys(w.mv).forEach(c=>{ if(c.indexOf(blk+"-"+idx+"-")===0)delete w.mv[c]; });
  });
  save(); renderPlan(); renderTodayPlan();
}
function copyPrevWeek(){
  const prev=new Date(curWeek); prev.setDate(prev.getDate()-7);
  const src=getWeek(keyOf(prev),false);
  if(!weekHasData(src)){ toast("Geçen hafta boş"); return; }
  const w=getWeek(keyOf(curWeek),true);
  w.r=src.r.map(r=>r.slice()); w.s=src.s.map(r=>r.slice());
  w.done=new Array(7).fill(false); w.dn={}; w.mv={};
  save(); renderPlan(); renderTodayPlan(); toast("Geçen hafta kopyalandı ✓");
}
function copyThisWeekToNext(){
  const srcKey=keyOf(curWeek),src=getWeek(srcKey,false);
  if(!weekHasData(src)){toast("Bu hafta boş");return false;}
  const nd=new Date(curWeek);nd.setDate(nd.getDate()+7);const dstKey=keyOf(nd),existing=getWeek(dstKey,false);
  if(existing&&weekHasData(existing)&&!confirm("Gelecek haftada kayıt var. Bu haftanın planı onun üzerine kopyalansın mı?"))return false;
  const bk=planWeekBackup([dstKey]),dst=getWeek(dstKey,true);
  dst.r=src.r.map(r=>r.slice());dst.s=src.s.map(r=>r.slice());dst.done=new Array(7).fill(false);dst.dn={};dst.mv={};
  pushUndo("Hafta gelecek haftaya kopyalandı",()=>restorePlanWeekBackup(bk));save();
  toast("Bu hafta gelecek haftaya kopyalandı ✓");return true;
}
function clearWeek(){
  if(!confirm("Bu haftanın tüm hücreleri silinsin mi?"))return;
  const wkKey=keyOf(curWeek),prevWeek=clone(S.weeks[wkKey]);
  S.weeks[wkKey]=blankWeek();
  if(prevWeek&&typeof logAdd==="function")
    logAdd("sil","Hafta temizlendi: "+wkKey,{t:"week",k:wkKey,v:prevWeek});
  pushUndo("Hafta temizlendi",()=>{ if(prevWeek)S.weeks[wkKey]=prevWeek; else delete S.weeks[wkKey]; });
  save(); renderPlan(); renderTodayPlan(); toast("Hafta temizlendi");
}
function printPlan(){ window.print(); }

/* ================= ERTELEME ANALİZİ ================= */
function procrastStats(){
  const byDay=DAYS.map(()=>({f:0,d:0})),bySlot={};
  Object.keys(S.weeks).forEach(wk=>{
    const w=normWeek(S.weeks[wk]);
    ["r","s"].forEach(blk=>w[blk].forEach((row,i)=>row.forEach((c,d)=>{
      if(!c||!c.trim())return;
      const ok=!!w.dn[blk+"-"+i+"-"+d];
      byDay[d].f++; if(ok)byDay[d].d++;
      const lbl=(blk==="r"?(S.rowLabels.r[i]||"Rutin "+(i+1)):(S.rowLabels.s[i]||"Satır "+(i+1)));
      if(!bySlot[lbl])bySlot[lbl]={f:0,d:0};
      bySlot[lbl].f++; if(ok)bySlot[lbl].d++;
    })));
  });
  return {byDay:byDay,bySlot:bySlot};
}
function renderProcrast(){
  const w=el("procBox"); if(!w)return;
  const st=procrastStats();
  const total=st.byDay.reduce((a,x)=>a+x.f,0);
  if(!total){ w.innerHTML='<div class="empty">Plan hücrelerini doldurup ✓ ile işaretledikçe erteleme analizi burada oluşur.</div>'; return; }
  let html='<p class="eyebrow" style="margin-bottom:6px;">Güne göre tamamlama</p><div class="hbars">';
  st.byDay.forEach((x,i)=>{
    const p=x.f?Math.round(x.d/x.f*100):0;
    html+=`<div class="hb"><span class="hl">${DAYS[i]}</span><div class="ht"><i style="width:${p}%"></i></div><span class="hv">${x.f?"%"+p:"—"}</span></div>`;
  });
  html+="</div>";
  const slots=Object.keys(st.bySlot).filter(k=>st.bySlot[k].f>=2)
    .sort((a,b)=>(st.bySlot[a].d/st.bySlot[a].f)-(st.bySlot[b].d/st.bySlot[b].f));
  if(slots.length){
    html+='<p class="eyebrow" style="margin:16px 0 6px;">En çok kaçırdığın saat/satır</p><div class="hbars">';
    slots.slice(0,5).forEach(k=>{
      const x=st.bySlot[k],p=Math.round(x.d/x.f*100);
      html+=`<div class="hb"><span class="hl" style="min-width:78px">${esc(k)}</span><div class="ht"><i style="width:${p}%"></i></div><span class="hv">%${p}</span></div>`;
    });
    html+="</div>";
  }
  w.innerHTML=html;
}

/* ================= TAKVİM ================= */
function dayActivity(k){
  const d=parseKey(k),dw=dowOf(d),w=getWeek(keyOf(mondayOf(d)),false);
  let filled=0,cellDone=0,done=false;
  if(w){
    ["r","s"].forEach(blk=>w[blk].forEach((row,i)=>{
      if(row[dw]&&row[dw].trim()){ filled++; if(w.dn[blk+"-"+i+"-"+dw])cellDone++; }
    }));
    done=!!w.done[dw];
  }
  return {min:S.pomoMin[k]||0,q:S.solved[k]||0,dn:S.denemeler.filter(x=>x.date===k).length,
          filled:filled,cellDone:cellDone,done:done,jr:!!S.journal[k]};
}
function level(a){
  let s=0;
  if(a.min>0)s+=Math.min(3,Math.ceil(a.min/45));
  if(a.q>0)s+=Math.min(2,Math.ceil(a.q/60));
  if(a.dn)s+=2;
  if(a.done)s+=2;
  if(a.cellDone)s+=1;
  return Math.min(4,s);
}
function shiftMonth(n){ calDate=new Date(calDate.getFullYear(),calDate.getMonth()+n,1); renderCalendar(); }
function renderCalendar(){
  const y=calDate.getFullYear(),m=calDate.getMonth();
  el("calMonth").textContent=MONTHS[m]+" "+y;
  el("calHead").innerHTML=DAYS.map(d=>`<div class="calhead">${d}</div>`).join("");
  const off=(new Date(y,m,1).getDay()+6)%7,last=new Date(y,m+1,0).getDate(),tk=todayKey();
  let html="";
  for(let i=0;i<off;i++)html+='<div class="calcell out"></div>';
  for(let d=1;d<=last;d++){
    const k=y+"-"+String(m+1).padStart(2,"0")+"-"+String(d).padStart(2,"0");
    const a=dayActivity(k),lv=level(a);
    const cls=[lv?"l"+lv:"",k===tk?"today":"",k===selDate?"sel":""].filter(Boolean).join(" ");
    html+=`<div class="calcell ${cls}" onclick="pickDate('${k}')">${d}${a.dn?'<span class="cdot"></span>':""}</div>`;
  }
  el("calGrid").innerHTML=html;
}
function pickDate(k){
  selDate=k; renderCalendar(); renderDayDetail();
  el("dayTitle").scrollIntoView({behavior:"smooth",block:"start"});
}
function renderDayDetail(){
  const k=selDate,d=parseKey(k),dw=dowOf(d),a=dayActivity(k),w=getWeek(keyOf(mondayOf(d)),false);
  el("dayTitle").textContent=d.toLocaleDateString("tr-TR",{day:"numeric",month:"long"})+" · "+DAYS_FULL[dw];
  let html="";
  html+=`<div class="dayrow"><span class="k">Çalışma süresi</span><span class="v">${fmtHM(a.min)}</span></div>`;
  html+=`<div class="dayrow"><span class="k">Çözülen soru</span><span class="v">${a.q}</span></div>`;
  if(a.filled)html+=`<div class="dayrow"><span class="k">Plan sadakati</span><span class="v">${a.cellDone}/${a.filled} · %${Math.round(a.cellDone/a.filled*100)}</span></div>`;
  html+=`<div class="dayrow"><span class="k">Günü tamamladım</span><span class="v" style="color:${a.done?"var(--green)":"var(--ink3)"}">${a.done?"Evet":"Hayır"}</span></div>`;
  S.denemeler.filter(x=>x.date===k).forEach(x=>{
    html+=`<div class="dayrow"><span class="k">${esc(x.name)}${x.dur?" · "+x.dur+" dk":""}</span><span class="v" style="color:var(--green)">${x.totalNet} net</span></div>`;
  });
  const subj=S.pomoSubj[k];
  if(subj&&Object.keys(subj).length){
    html+='<p class="eyebrow" style="margin:16px 0 4px;">Derse göre süre</p>';
    Object.keys(subj).sort((a2,b2)=>subj[b2]-subj[a2]).forEach(sn=>{
      html+=`<div class="dayrow"><span class="k">${esc(sn)}</span><span class="v">${fmtHM(subj[sn])}</span></div>`;
    });
  }
  if(w){
    let rows="";
    ["r","s"].forEach(blk=>w[blk].forEach((r,i)=>{
      if(r[dw]&&r[dw].trim()){
        const cid=blk+"-"+i+"-"+dw,lbl=blk==="r"?(S.rowLabels.r[i]||"Rutin"):(S.rowLabels.s[i]||"—");
        rows+=`<div class="plancell ${w.dn[cid]?"pd":""}"><span class="pl">${esc(lbl)}</span><span>${esc(r[dw])}</span></div>`;
      }
    }));
    if(rows)html+='<p class="eyebrow" style="margin:16px 0 4px;">O günün planı</p>'+rows;
  }
  if(S.journal[k])html+='<p class="eyebrow" style="margin:16px 0 4px;">Günlük</p><p class="jr">'+esc(S.journal[k])+"</p>";
  el("dayDetail").innerHTML=html;
}
/* ================= KONULAR · v2.6.0 KONULAR 2.0 ================= */
const V26_VERSION="2.6.0";
let examTab="TYT",v26TopicFilter="all",v26TopicOpen=null,v26RenderCtx=null;
function v26Arg(v){return String(v||"").replace(/\\/g,"\\\\").replace(/'/g,"\\'");}
function v26ResolveKey(subj,topic){
  let k=(typeof topicKeyOf==="function")?topicKeyOf(subj,topic):null;if(k)return k;
  const tl=String(topic||"").trim().toLocaleLowerCase("tr");
  const sb=ALL_SUBJECTS.find(x=>x.topics.some(t=>t.toLocaleLowerCase("tr")===tl)&&(x.name===subj||(typeof v2SubjectMatch==="function"&&v2SubjectMatch(x.name,subj))));
  if(!sb)return null;const tp=sb.topics.find(t=>t.toLocaleLowerCase("tr")===tl);return tp?tkey(sb.exam,sb.name,tp):null;
}
function v26BuildContext(){
  const wrong={},studyDay={};
  (S.wrongLog||[]).forEach(w=>{const key=v26ResolveKey(w.subject,w.topic);if(!key)return;const x=wrong[key]||(wrong[key]={total:0,last:"",entries:0,rows:[],examMarked:0});const n=Math.max(1,+w.n||1);x.total+=n;x.entries++;if((w.date||"")>x.last)x.last=w.date||"";if(w.deneme)x.examMarked+=n;x.rows.push(w)});
  Object.values(wrong).forEach(x=>x.rows.sort((a,b)=>(b.date||"").localeCompare(a.date||"")||(+b.id||0)-(+a.id||0)));
  const slot=(key,date)=>{if(!studyDay[key])studyDay[key]={};return studyDay[key][date]||(studyDay[key][date]={session:0,sw:0});};
  Object.keys(S.sessions||{}).forEach(date=>(S.sessions[date]||[]).forEach(x=>{if(!x||!x.topic)return;const key=v26ResolveKey(x.subj,x.topic);if(!key)return;slot(key,date).session+=Math.max(0,+x.m||0)}));
  Object.keys(S.swHistory||{}).forEach(date=>(S.swHistory[date]||[]).forEach(x=>{if(!x||!x.topic)return;const key=v26ResolveKey(x.subj,x.topic);if(!key)return;slot(key,date).sw+=Math.max(0,(+x.ms||0)/60000)}));
  const study={};Object.keys(studyDay).forEach(key=>{const days=Object.keys(studyDay[key]).map(date=>({date:date,min:Math.round(Math.max(studyDay[key][date].session,studyDay[key][date].sw))})).filter(x=>x.min>0).sort((a,b)=>b.date.localeCompare(a.date));study[key]={total:days.reduce((a,x)=>a+x.min,0),last:days[0]?.date||"",days:days};});
  const due={};reviewQueue().forEach(r=>{if(!due[r.key]||r.late>due[r.key].late)due[r.key]=r;});
  const priorityList=(typeof v2RiskList==="function")?v2RiskList(500):[],priority={};priorityList.forEach(x=>priority[x.key]=x);
  return {wrong,study,due,priority,priorityList};
}
function v26RiskInfo(x){const score=x?Math.max(0,+x.score||0):0;if(score>=55)return {label:"Yüksek",cls:"risk-high",score};if(score>=30)return {label:"Orta",cls:"risk-mid",score};return {label:"Düşük",cls:"risk-low",score};}
function v26Ago(k){if(!k)return "—";const d=Math.max(0,diffKeys(k,todayKey()));return d===0?"bugün":d===1?"dün":d+" gün önce";}
function v26ExamTopicRows(exam){const out=[];(CURRICULUM[exam]||[]).forEach(s=>s.topics.forEach(topic=>{const key=tkey(exam,s.name,topic);out.push({exam,subj:s.name,topic,key,t:tget(key)})}));return out;}
function v26MatchesFilter(row,ctx){if(v26TopicFilter==="work")return row.t.st===1||row.t.st===2;if(v26TopicFilter==="review")return !!ctx.due[row.key];if(v26TopicFilter==="risk")return (ctx.priority[row.key]?.score||0)>=30;if(v26TopicFilter==="done")return row.t.st===3;return true;}
function setTopicFilter(f){v26TopicFilter=["all","work","review","risk","done"].includes(f)?f:"all";renderSubjects();}
function setExamTab(t){
  examTab=["TYT","AYT","YDT"].indexOf(t)>=0?t:"TYT";
  el("segTYT").classList.toggle("on",examTab==="TYT");el("segAYT").classList.toggle("on",examTab==="AYT");const yd=el("segYDT");if(yd)yd.classList.toggle("on",examTab==="YDT");renderSubjects();
}
function v26RenderOverview(ctx){
  const rows=v26ExamTopicRows(examTab),total=rows.length,done=rows.filter(x=>x.t.st===3).length,work=rows.filter(x=>x.t.st===1||x.t.st===2).length,review=rows.filter(x=>ctx.due[x.key]).length,risk=rows.filter(x=>(ctx.priority[x.key]?.score||0)>=30).length,sum=rows.reduce((a,x)=>a+x.t.st,0),pct=total?Math.round(sum/(total*3)*100):0;
  const w=el("v26TopicOverview");if(w)w.innerHTML='<div class="v26-topic-grid"><div class="v26-topic-kpi"><small>'+examTab+' ilerleme</small><b>%'+pct+'</b></div><div class="v26-topic-kpi"><small>Tamamlanan</small><b>'+done+' / '+total+'</b></div><div class="v26-topic-kpi"><small>Çalışılıyor</small><b>'+work+'</b></div><div class="v26-topic-kpi"><small>Bekleyen tekrar / risk</small><b>'+review+' / '+risk+'</b></div></div><div class="v26-topic-summary">Filtreler yalnız görünümü değiştirir; konu durumuna veya Programım tablosuna otomatik müdahale edilmez.</div>';
  const defs=[["tfAll","Tümü",total],["tfWork","Çalışılıyor",work],["tfReview","Tekrar bekleyen",review],["tfRisk","Riskli",risk],["tfDone","Tamamlanan",done]];defs.forEach(([id,n,c],i)=>{const b=el(id);if(b){b.innerHTML=n+' <b>'+c+'</b>';b.classList.toggle("on",["all","work","review","risk","done"][i]===v26TopicFilter)}});
}
function v26RenderAttention(ctx){
  const w=el("v26TopicAttention");if(!w)return;const list=ctx.priorityList.filter(x=>x.exam===examTab&&x.score>=30).slice(0,3);
  if(!list.length){w.innerHTML='<p class="eyebrow" style="margin:0 0 4px">Şu an dikkat isteyenler</p><div class="empty">'+examTab+' için belirgin riskli konu yok. Yanlış ve tekrar verisi geldikçe burası güçlenir.</div>';return;}
  w.innerHTML='<p class="eyebrow" style="margin:0 0 4px">Şu an dikkat isteyen 3 konu</p>'+list.map((x,i)=>{const r=v26RiskInfo(x);return '<div class="v26-att-row" onclick="openTopicDetail(\''+v26Arg(x.exam)+'\',\''+v26Arg(x.subj)+'\',\''+v26Arg(x.topic)+'\')"><span class="v26-att-rank">'+(i+1)+'</span><div><div class="v26-att-title">'+esc(x.subj+' · '+x.topic)+'</div><div class="v26-att-why">'+esc(x.reasons.join(' · '))+' · '+x.score+' puan</div></div><span class="risk-badge '+r.cls+'">'+r.label+'</span></div>'}).join('');
}
function renderSubjects(){
  const wrap=el("subjectList");if(!wrap)return;wrap.innerHTML="";const q=(typeof topicQuery==="string")?topicQuery:"",ctx=v26BuildContext();v26RenderCtx=ctx;v26RenderOverview(ctx);v26RenderAttention(ctx);let shown=0;
  ["TYT","AYT","YDT"].forEach(exam=>{if(!q&&exam!==examTab)return;(CURRICULUM[exam]||[]).forEach((s,si)=>{
    const subjHit=q&&s.name.toLocaleLowerCase("tr").indexOf(q)>=0;let topics=s.topics.filter(tp=>{const hit=!q||subjHit||tp.toLocaleLowerCase("tr").indexOf(q)>=0;if(!hit)return false;return v26MatchesFilter({exam,subj:s.name,topic:tp,key:tkey(exam,s.name,tp),t:tget(tkey(exam,s.name,tp))},ctx)});if(!topics.length)return;shown+=topics.length;
    const st=subjStat(exam,s),id=exam+si,att=ctx.priorityList.filter(x=>x.exam===exam&&x.subj===s.name&&x.score>=30).slice(0,3),div=document.createElement("div");div.className="card subj";div.innerHTML='<div class="subj-head" onclick="toggleSubj(\''+id+'\')"><span class="nm">'+esc(s.name)+(q?' <small style="font-weight:400;color:var(--label-3)">'+exam+'</small>':'')+(att.length?'<small class="subj-sub">Dikkat: '+att.map(x=>esc(x.topic)).join(' · ')+'</small>':'')+'</span><span class="pct">'+st.full+'/'+st.total+' bitti · %'+st.pct+'</span></div><div class="bar"><i style="width:'+st.pct+'%"></i></div><div class="topics'+(q||v26TopicFilter!=="all"?' open':'')+'" id="tp'+id+'">'+topics.map(tp=>topicRow(exam,s.name,tp,ctx)).join('')+'</div>';wrap.appendChild(div);
  })});
  const info=el("searchInfo"),filterName={all:"",work:" · çalışılıyor",review:" · tekrar bekleyen",risk:" · riskli",done:" · tamamlanan"}[v26TopicFilter]||"";if(info)info.textContent=q?(shown?shown+" konu bulundu"+filterName:"Eşleşen konu yok"+filterName):(v26TopicFilter!=="all"?(shown+" konu gösteriliyor"+filterName):"");if(!shown)wrap.innerHTML='<div class="card"><div class="empty">Bu filtrede gösterilecek konu yok.</div></div>';
}
function topicRow(exam,subj,topic,ctx){
  ctx=ctx||v26RenderCtx||v26BuildContext();const key=tkey(exam,subj,topic),t=tget(key),k=v26Arg(key),study=ctx.study[key]||{total:0,last:"",days:[]},wrong=ctx.wrong[key]||{total:0,last:"",entries:0,rows:[],examMarked:0},due=ctx.due[key],risk=v26RiskInfo(ctx.priority[key]);let pills="",stars="";
  for(let i=1;i<=3;i++)pills+='<button class="pill '+(t.st>=i?'on ':'')+'p'+i+'" onclick="cycleTopic(\''+k+'\','+i+')" title="'+esc(ST_LABEL[i])+'">'+i+'</button>';for(let i=1;i<=5;i++)stars+='<span class="star '+(t.conf>=i?'on':'')+'" onclick="setConf(\''+k+'\','+i+')">★</span>';
  const rev=(t.rev||[]).length,wgt=(typeof topicWeight==="function")?topicWeight(key):1,wl=(typeof weightLabel==="function")?weightLabel(wgt):"",rn=(typeof resCount==="function")?resCount(key):0,subArg=v26Arg(subj),tpArg=v26Arg(topic),exArg=v26Arg(exam),resBadge='<button class="tres" title="Kaynaklar" onclick="event.stopPropagation();openRes(\''+subArg+'\',\''+tpArg+'\')">'+(rn?'🔗'+rn:'＋')+'</button>';
  let dlTxt="";if(t.dl){const left=diffKeys(todayKey(),t.dl),late=(left<0&&t.st!==3);dlTxt=' · <span style="color:'+(late?'var(--danger)':'var(--time)')+'">hedef '+parseKey(t.dl).toLocaleDateString('tr-TR',{day:'numeric',month:'short'})+(late?' (geçti)':'')+'</span>'}
  const repeatTxt=t.st===3?(rev+'/3 tekrar'+(due?(due.late>0?' · '+due.late+' gün gecikmiş':' · bugün tekrar'):' · sırada yok')):'3–7–21 tamamlanınca başlar',studyTxt=study.total?(fmtHM(study.total)+' · son '+v26Ago(study.last)):'konu etiketli çalışma yok',wrongTxt=wrong.total?(wrong.total+' yanlış · son '+v26Ago(wrong.last)):'yanlış kaydı yok';
  return '<div class="topic '+(t.st===3?'full':'')+'"><div class="tinfo"><div class="topic-title-row"><button class="topic-name-btn tn" onclick="openTopicDetail(\''+exArg+'\',\''+subArg+'\',\''+tpArg+'\')">'+esc(topic)+(wl?' <span class="twt w'+wgt+'">'+wl+'</span>':'')+'</button>'+resBadge+'</div><span class="tmeta"><span class="topic-state s'+t.st+'">'+esc(ST_LABEL[t.st])+'</span><span class="topic-risk-inline risk-badge '+risk.cls+'">'+risk.label+(risk.score?' · '+risk.score:'')+'</span>'+dlTxt+'</span><span class="tmeta v26-meta">'+esc(studyTxt)+' · '+esc(wrongTxt)+'<br>'+esc(repeatTxt)+'</span></div><div class="tctl"><div class="pills">'+pills+'</div><div class="stars" title="Güven">'+stars+'</div><button class="topic-open" onclick="openTopicDetail(\''+exArg+'\',\''+subArg+'\',\''+tpArg+'\')" aria-label="Konu ayrıntısı">›</button></div></div>';
}
function cycleTopic(key,lvl){const cur=tget(key).st;tsetStatus(key,cur===lvl?lvl-1:lvl);renderSubjects();renderReviewQueue();if(v26TopicOpen&&v26TopicOpen.key===key)renderTopicDetail();checkBadges(false)}
function setConf(key,c){tsetConf(key,c);renderSubjects();if(v26TopicOpen&&v26TopicOpen.key===key)renderTopicDetail()}
function toggleSubj(i){const e=el("tp"+i);if(e)e.classList.toggle("open")}
function renderReviewQueue(){
  const w=el("reviewBox");if(!w)return;const q=reviewQueue();el("revCount").textContent=q.length;if(!q.length){w.innerHTML='<div class="empty">Şu an tekrar bekleyen konu yok.<br>Bir konuyu 3. kademeye (pekiştirdim) aldığında 3., 7. ve 21. günlerde burada belirir.</div>';return}
  w.innerHTML=q.slice(0,30).map(r=>'<div class="revrow"><div><div class="rt">'+esc(r.subj)+' · '+esc(r.topic)+'</div><div class="rm">'+r.gap+'. gün tekrarı · '+parseKey(r.due).toLocaleDateString('tr-TR',{day:'numeric',month:'short'})+(r.late>0?' · '+r.late+' gün gecikmiş':' · bugün')+'</div></div><div class="rev-actions"><button class="btn ghost tiny" onclick="openTopicDetail(\''+v26Arg(r.exam)+'\',\''+v26Arg(r.subj)+'\',\''+v26Arg(r.topic)+'\')">Detay</button><button class="btn green tiny" onclick="doReview(\''+v26Arg(r.key)+'\','+r.gi+')">Yaptım</button></div></div>').join('')
}
function doReview(key,gi){const gap=REVIEW_GAPS[gi]||"";markReview(key,gi);renderReviewQueue();renderSubjects();renderHomeGoals();renderSmartInsights();if(v26TopicOpen&&v26TopicOpen.key===key)renderTopicDetail();checkBadges(false);toast((gap?gap+". gün ":"")+"tekrarı tamamlandı ✓")}
function v26StartTopic(exam,subj,topic){
  if(typeof sw==="function"&&sw().run){toast("Kronometre zaten çalışıyor — önce mevcut oturumu durdur");return false}let use=subj;if(typeof SUBJ_NAMES!=="undefined"&&!SUBJ_NAMES.includes(use)){const hit=SUBJ_NAMES.find(n=>typeof v2SubjectMatch==="function"&&v2SubjectMatch(n,subj));if(hit)use=hit}if(typeof setPomoSubject==="function")setPomoSubject(use);try{pomoTopic=topic}catch(e){}if(typeof renderPomoTopicPicker==="function")renderPomoTopicPicker();if(typeof setFocusMode==="function")setFocusMode("sw");closeTopicDetail();go("pomo");if(typeof swStart==="function")swStart();toast("Kronometre başladı · "+subj+" · "+topic);return true
}
function v26OpenWrong(subj,topic){closeTopicDetail();go("deneme");if(typeof setAnaTab==="function")setAnaTab("verim");setTimeout(()=>{try{renderWrongTopics();const sel=el("wtSubject");if(sel){sel.value=subj;if(typeof fillWrongTopicList==="function")fillWrongTopicList()}const inp=el("wtTopic");if(inp)inp.value=topic;const c=sel&&sel.closest(".card");if(c)c.scrollIntoView({behavior:"smooth",block:"center"})}catch(e){}},80)}
function v26CompleteDue(key){const r=reviewQueue().find(x=>x.key===key);if(!r){toast("Bu konu için şu an bekleyen tekrar yok");return false}doReview(key,r.gi);return true}
function openTopicDetail(exam,subj,topic){const key=tkey(exam,subj,topic);v26TopicOpen={exam,subj,topic,key};renderTopicDetail();const m=el("v26TopicModal");if(m){m.classList.add("open");m.setAttribute("aria-hidden","false")}return true}
function closeTopicDetail(){const m=el("v26TopicModal");if(m){m.classList.remove("open");m.setAttribute("aria-hidden","true")}v26TopicOpen=null}
function renderTopicDetail(){
  if(!v26TopicOpen)return;const {exam,subj,topic,key}=v26TopicOpen,w=el("v26TopicDetail");if(!w)return;const ctx=v26BuildContext(),t=tget(key),study=ctx.study[key]||{total:0,last:"",days:[]},wrong=ctx.wrong[key]||{total:0,last:"",entries:0,rows:[],examMarked:0},pr=ctx.priority[key],risk=v26RiskInfo(pr),due=ctx.due[key],rev=(t.rev||[]).length;
  let rep='<div class="v26-mini-empty">Konu pekiştirildiğinde 3., 7. ve 21. gün tekrarları burada görünür.</div>';if(t.st===3&&t.ts){rep='<div class="v26-review-steps">'+REVIEW_GAPS.map((gap,gi)=>{const done=(t.rev||[]).includes(gi),date=addDaysKey(t.ts,gap),delta=diffKeys(date,todayKey()),isDue=!done&&delta>=0,cls=done?'done':(isDue?(delta>0?'late':'due'):''),status=done?'Tamamlandı':(isDue?(delta>0?delta+' gün gecikti':'Bugün'):'Planlı');return '<div class="v26-review-step '+cls+'"><b>'+gap+'. gün</b>'+parseKey(date).toLocaleDateString('tr-TR',{day:'numeric',month:'short'})+' · '+status+'</div>'}).join('')+'</div>'}
  const studyRows=study.days.length?study.days.slice(0,8).map(x=>'<div class="dayrow"><span class="k">'+parseKey(x.date).toLocaleDateString('tr-TR',{day:'numeric',month:'short',year:'numeric'})+'</span><span class="v">'+fmtHM(x.min)+'</span></div>').join(''):'<div class="v26-mini-empty">Bu konu seçilerek kaydedilmiş çalışma oturumu yok.</div>';
  const kindName={bilmiyordum:'Bilgi eksiği',dikkat:'Dikkatsizlik',sure:'Süre'};const wrongRows=wrong.rows.length?wrong.rows.slice(0,8).map(x=>'<div class="dayrow"><span class="k">'+parseKey(x.date||todayKey()).toLocaleDateString('tr-TR',{day:'numeric',month:'short'})+(x.kind?' · '+esc(kindName[x.kind]||x.kind):'')+(x.deneme?' · deneme':'')+'</span><span class="v">'+Math.max(1,+x.n||1)+' yanlış</span></div>').join(''):'<div class="v26-mini-empty">Bu konu için yanlış kaydı yok.</div>';
  const why=pr&&pr.reasons.length?pr.reasons.join(' · '):'Belirgin risk nedeni yok';
  w.innerHTML='<div class="v26-sheet-head"><div><small>'+esc(exam+' · '+subj)+'</small><h3 id="v26TopicTitle">'+esc(topic)+'</h3></div><button class="v26-close" onclick="closeTopicDetail()" aria-label="Kapat">×</button></div><div class="v26-detail-grid"><div class="v26-detail-metric"><small>Durum</small><b>'+esc(ST_LABEL[t.st])+'</b></div><div class="v26-detail-metric"><small>Güven</small><b>'+(t.conf?t.conf+'/5':'—')+'</b></div><div class="v26-detail-metric"><small>Konu çalışması</small><b>'+(study.total?fmtHM(study.total):'—')+'</b></div><div class="v26-detail-metric"><small>Yanlış</small><b>'+wrong.total+'</b></div></div><div class="dayrow"><span class="k">Risk</span><span class="v"><span class="risk-badge '+risk.cls+'">'+risk.label+(risk.score?' · '+risk.score+' puan':'')+'</span></span></div><div class="dayrow"><span class="k">Risk nedeni</span><span class="v">'+esc(why)+'</span></div><div class="dayrow"><span class="k">Son çalışma</span><span class="v">'+(study.last?esc(v26Ago(study.last)):'—')+'</span></div><div class="dayrow"><span class="k">Denemede işaretli yanlış</span><span class="v">'+wrong.examMarked+'</span></div><div class="v26-detail-actions"><button class="btn green small" onclick="v26StartTopic(\''+v26Arg(exam)+'\',\''+v26Arg(subj)+'\',\''+v26Arg(topic)+'\')">Kronometreyi başlat</button><button class="btn ghost small" onclick="v26OpenWrong(\''+v26Arg(subj)+'\',\''+v26Arg(topic)+'\')">Yanlışları aç</button>'+(due?'<button class="btn ghost small" onclick="v26CompleteDue(\''+v26Arg(key)+'\')">Tekrarı tamamla</button>':'')+'</div><div class="v26-detail-section"><p class="eyebrow">3–7–21 tekrar · '+rev+'/3</p>'+rep+'</div><div class="v26-detail-section"><p class="eyebrow">Çalışma geçmişi</p>'+studyRows+'</div><div class="v26-detail-section"><p class="eyebrow">Yanlış geçmişi</p>'+wrongRows+'</div><p class="v26-detail-note">Konuya doğrudan “şu kadar net kaybettirdi” diye kesin değer atamıyorum. Deneme etkisi, ders performansı ve denemede konuya işaretlediğin yanlışlar üzerinden risk puanına dahil edilir.</p>';
}
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&v26TopicOpen)closeTopicDetail()});

/* ================= DENEME ================= */
let denemeType="TYT";
function setDenemeType(t){
  denemeType=["TYT","AYT","YDT","BRANS"].indexOf(t)>=0?t:"TYT";
  el("dSegTYT").classList.toggle("on",t==="TYT");
  el("dSegAYT").classList.toggle("on",t==="AYT");
  const ys=el("dSegYDT"); if(ys)ys.classList.toggle("on",t==="YDT");
  const bs=el("dSegBRANS"); if(bs)bs.classList.toggle("on",t==="BRANS");
  const bw=el("bransWrap"); if(bw)bw.style.display=(t==="BRANS")?"block":"none";
  const dh=el("dybHead"); if(dh)dh.style.display=(t==="BRANS")?"none":"grid";
  renderDybRows();
  if(typeof renderPublishers==="function")renderPublishers();
  renderBlankWrong(); drawSubjChart();
  if(typeof renderExam2==="function")renderExam2();
}
function renderDybRows(){
  const wrap=el("dybRows"); wrap.innerHTML="";
  if(denemeType==="BRANS"){
    const sel=el("brSubject");
    if(sel&&!sel.options.length)sel.innerHTML=SUBJ_NAMES.map(n=>`<option value="${esc(n)}">${esc(n)}</option>`).join("");
    wrap.innerHTML=`<div class="dyb-grid dyb-head"><div>Ders</div><div>D</div><div>Y</div><div>B</div></div>
      <div class="dyb-grid"><div class="snm" id="brName">—</div>
        <input type="number" min="0" id="d0" oninput="livePreview()">
        <input type="number" min="0" id="y0" oninput="livePreview()">
        <input type="number" min="0" id="b0" oninput="livePreview()"></div>`;
    const nm=el("brName"); if(nm&&sel)nm.textContent=sel.value||SUBJ_NAMES[0];
    livePreview(); return;
  }
  DENEME_SUBJECTS[denemeType].forEach((s,i)=>{
    const row=document.createElement("div"); row.className="dyb-grid";
    row.innerHTML=`<div class="snm">${esc(s[0])}<br><small>${s[1]} soru</small></div>
      <input type="number" min="0" max="${s[1]}" id="d${i}" oninput="livePreview()">
      <input type="number" min="0" max="${s[1]}" id="y${i}" oninput="livePreview()">
      <input type="number" min="0" max="${s[1]}" id="b${i}" oninput="livePreview()">`;
    wrap.appendChild(row);
  });
  livePreview();
}
function livePreview(){
  let t=0;
  if(denemeType==="BRANS"){
    t=net(+((el("d0")||{}).value)||0,+((el("y0")||{}).value)||0);
  } else {
    DENEME_SUBJECTS[denemeType].forEach((s,i)=>{
      t+=net(+el("d"+i).value||0,+el("y"+i).value||0);
    });
  }
  el("livePreview").textContent="Toplam net: "+r2(t);
}
function brSubjChanged(){
  const sel=el("brSubject"),nm=el("brName");
  if(nm&&sel)nm.textContent=sel.value;
}
function addDeneme(){
  if(typeof coachBlock==="function"&&coachBlock("deneme kaydı"))return;
  const _logAfter=()=>{ if(typeof logAdd==="function"&&S.denemeler.length){
    const d=S.denemeler[S.denemeler.length-1];
    logAdd("ekle","Deneme eklendi: "+d.name,null); } };
  const subjects=[]; let total=0,has=false;
  const pub=(el("denemePub").value||"").trim();
  const difficulty=(el("denemeDiff")&&el("denemeDiff").value)||"normal";
  const note=((el("denemeNote")&&el("denemeNote").value)||"").trim().slice(0,240);
  if(denemeType==="BRANS"){
    const nm=el("brSubject").value||SUBJ_NAMES[0];
    const cap=Math.max(1,parseInt(el("brTotal").value,10)||0);
    const d=+el("d0").value||0,y=+el("y0").value||0,b=+el("b0").value||0;
    if(!cap){ toast("Soru sayısını gir"); return; }
    if(!(d||y||b)){ toast("Önce netlerini gir"); return; }
    if(![d,y,b].every(Number.isInteger)||d<0||y<0||b<0||d+y+b>cap){
      toast("Doğru, yanlış ve boş tam sayı olmalı; toplam "+cap+" soruyu geçemez"); return;
    }
    const n=net(d,y);
    const name=el("denemeName").value.trim()||(nm+" branş");
    const date=el("denemeDate").value||todayKey();
    const dur=Math.max(0,parseInt(el("denemeDur").value,10)||0);
    const id=Date.now();
    S.denemeler.push({id:id,type:"BRANS",name:name,date:date,dur:dur,pub:pub,difficulty:difficulty,note:note,totalNet:r2(n),
      subjectResults:[{name:nm,d:d,y:y,b:b,net:n,cap:cap}]});
    const tk2=null;
    save(); _logAfter();
    el("denemeName").value=""; el("denemeDur").value="";
    if(el("denemeNote"))el("denemeNote").value=""; if(el("denemeDiff"))el("denemeDiff").value="normal";
    el("d0").value=""; el("y0").value=""; el("b0").value="";
    livePreview(); renderDenemeHistory(); drawChart(); drawSubjChart();
    renderCompareOpts(); renderScore(); renderBlankWrong();
    if(typeof renderPublishers==="function")renderPublishers();
    if(typeof renderMarginal==="function"){renderMarginal();renderEfficiency();renderReverse();}
    if(typeof openAnalysis==="function"&&openAnalysis(id)){} else if(typeof showRefl==="function")showRefl(id);
    if(typeof renderExam2==="function")renderExam2();
    checkBadges(false); toast("Branş denemesi kaydedildi ✓");
    return;
  }
  DENEME_SUBJECTS[denemeType].forEach((s,i)=>{
    const d=+el("d"+i).value||0,y=+el("y"+i).value||0,b=+el("b"+i).value||0;
    if(d||y||b)has=true;
    const n=net(d,y); total+=n;
    subjects.push({name:s[0],d:d,y:y,b:b,net:n,cap:s[1]});
  });
  if(!has){ toast("Önce netlerini gir"); return; }
  const gecersiz=subjects.find(x=>![x.d,x.y,x.b].every(Number.isInteger)||x.d<0||x.y<0||x.b<0||x.d+x.y+x.b>x.cap);
  if(gecersiz){ toast(gecersiz.name+": doğru + yanlış + boş en fazla "+gecersiz.cap+" olabilir"); return; }
  const name=el("denemeName").value.trim()||(denemeType+" Deneme");
  const dur=Math.max(0,parseInt(el("denemeDur").value,10)||0);
  const date=el("denemeDate").value||todayKey();
  const newId=Date.now();
  S.denemeler.push({id:newId,type:denemeType,name:name,date:date,dur:dur,pub:pub,difficulty:difficulty,note:note,totalNet:r2(total),subjectResults:subjects});
  _logAfter();
  save();
  el("denemeName").value=""; el("denemeDur").value="";
  if(el("denemeNote"))el("denemeNote").value=""; if(el("denemeDiff"))el("denemeDiff").value="normal";
  DENEME_SUBJECTS[denemeType].forEach((s,i)=>{ el("d"+i).value=""; el("y"+i).value=""; el("b"+i).value=""; });
  livePreview(); renderDenemeHistory(); drawChart(); drawSubjChart();
  renderCompareOpts(); renderScore(); renderBlankWrong();
  if(typeof renderPublishers==="function")renderPublishers();
  if(typeof renderMarginal==="function"){renderMarginal();renderEfficiency();renderReverse();}
  if(typeof openAnalysis==="function"&&openAnalysis(newId)){}
  else if(typeof showRefl==="function")showRefl(newId);
  if(typeof renderExam2==="function")renderExam2();
  checkBadges(false); toast("Deneme kaydedildi ✓");
}
function delDeneme(id){
  if(!confirm("Bu deneme silinsin mi?"))return;
  const bk=clone(S.denemeler.find(x=>x.id===id));
  S.denemeler=S.denemeler.filter(x=>x.id!==id);
  if(bk&&typeof logAdd==="function")logAdd("sil","Deneme silindi: "+bk.name,{t:"deneme",v:bk});
  save();
  if(bk)pushUndo("Deneme silindi: "+bk.name,()=>{ S.denemeler.push(bk); });
  renderDenemeHistory(); drawChart(); drawSubjChart(); renderCompareOpts(); renderScore(); renderBlankWrong();
  if(typeof renderPublishers==="function"){renderPublishers();renderMarginal();renderEfficiency();renderReverse();renderReflList();}
  if(typeof renderExam2==="function")renderExam2();
}
function renderDenemeHistory(){
  const wrap=el("denemeHistory");
  if(!wrap)return;
  if(!S.denemeler.length){ wrap.innerHTML='<div class="empty">Henüz deneme eklemedin.</div>'; return; }
  wrap.innerHTML=S.denemeler.slice().sort((a,b)=>String(b.date||"").localeCompare(String(a.date||""))||(b.id||0)-(a.id||0)).map(dn=>{
    const dt=parseKey(dn.date||todayKey()).toLocaleDateString("tr-TR",{day:"numeric",month:"short"});
    const dif=v27Difficulty(dn.difficulty),prev=v27PrevSame(dn),delta=prev?r2((+dn.totalNet||0)-(+prev.totalNet||0)):null;
    return `<div class="deneme-item" style="cursor:pointer" onclick="openExamDetail(${dn.id})">
      <div style="flex:1;min-width:0"><div class="dnm">${esc(dn.name)}</div>
        <div class="meta">${dn.type==="BRANS"?"Branş":dn.type} · ${dt}${dn.dur?" · "+dn.dur+" dk":""}${dn.pub?" · "+esc(dn.pub):""}</div>
        <div class="v27-badges"><span class="v27-badge ${dif.c}">${dif.t}</span>${dn.note?'<span class="v27-badge">not var</span>':""}${dn.refl&&(dn.refl.hard||dn.refl.change)?'<span class="v27-badge">değerlendirme</span>':""}</div>
      </div>
      <div style="text-align:right;flex:none"><div class="net">${r2(+dn.totalNet||0)}</div>${delta===null?'':`<div class="meta v27-delta ${delta>0?'up':delta<0?'down':''}">${delta>0?'+':''}${delta} net</div>`}
        <div class="v27-actions"><button class="btn ghost tiny" onclick="event.stopPropagation();openExamDetail(${dn.id})">Detay</button><button class="btn ghost tiny" onclick="event.stopPropagation();v27CopyExam(${dn.id})">Kopyala</button><button class="del" onclick="event.stopPropagation();delDeneme(${dn.id})">Sil</button></div></div></div>`;
  }).join("");
}

function setAnaTab(t){
  if(t==="verim"&&typeof renderHeat==="function")setTimeout(renderHeat,0);
  if(t==="verim"&&typeof renderCompare==="function")setTimeout(()=>{renderCompare();renderWeak();},0);
  if(t==="verim"&&typeof renderWrongDist==="function")setTimeout(()=>{renderWrongDist();renderRepeat();},0);
  ["trend","ders","kar","puan","verim"].forEach(x=>{
    const b=el("an_"+x),p=el("anp_"+x);
    if(b)b.classList.toggle("on",x===t);
    if(p)p.style.display=x===t?"block":"none";
  });
  if(t==="trend")perfRAF("chart-trend",drawChart);
  if(t==="ders")perfRAF("chart-subject",drawSubjChart);
  if(t==="kar")renderCompare();
  if(t==="puan")renderScore();
  if(t==="verim"&&typeof renderMarginal==="function"){renderMarginal();renderEfficiency();renderReverse();renderPublishers();}
}

/* Canvas ölçekleme — tek yerden.
   CSS boyutunu açıkça yazar, öz boyutu (backing store) piksel yoğunluğuna
   göre ayarlar. Böylece art arda çizimlerde öğe büyümez. */
function fitCanvas(cv){
  if(!cv)return null;
  const box=cv.parentElement||cv;
  let w=box.clientWidth||cv.clientWidth||0;
  let h=box.clientHeight||cv.clientHeight||0;
  if(!w||!h)return null;
  w=Math.max(80,Math.min(2000,Math.round(w)));
  h=Math.max(60,Math.min(1200,Math.round(h)));
  cv.style.width=w+"px"; cv.style.height=h+"px";
  const dpr=Math.max(1,Math.min(3,window.devicePixelRatio||1));
  const bw=Math.round(w*dpr),bh=Math.round(h*dpr);
  if(cv.width!==bw)cv.width=bw;
  if(cv.height!==bh)cv.height=bh;
  const ctx=cv.getContext?cv.getContext("2d"):null;
  if(!ctx)return null;
  ctx.setTransform(dpr,0,0,dpr,0,0);
  ctx.clearRect(0,0,w,h);
  return {ctx:ctx,w:w,h:h};
}

/* --- toplam net grafiği --- */
function drawChart(){
  const cv=el("chart"); if(!cv)return;
  const fit=fitCanvas(cv); if(!fit)return;
  const ctx=fit.ctx,w=fit.w,h=fit.h;
  const cs=getComputedStyle(document.documentElement);
  const green=cs.getPropertyValue("--green").trim()||"#1F6E4A",
        ochre=cs.getPropertyValue("--ochre").trim()||"#B4771B",
        accent=cs.getPropertyValue("--accent").trim()||"#0A6CFF",
        line=cs.getPropertyValue("--line").trim()||"#E4DFD2",
        txt=cs.getPropertyValue("--ink2").trim()||"#6F695E";
  const all=S.denemeler.filter(d=>d.type!=="BRANS").slice().sort((a,b)=>a.date.localeCompare(b.date)||a.id-b.id);
  if(!all.length){ ctx.fillStyle=txt; ctx.font="13px Inter,sans-serif"; ctx.textAlign="center"; ctx.fillText("Grafik için deneme ekle",w/2,h/2); return; }
  const series={TYT:all.filter(d=>d.type==="TYT"),AYT:all.filter(d=>d.type==="AYT"),YDT:all.filter(d=>d.type==="YDT")};
  const pad={l:34,r:12,t:14,b:26};
  const vals=all.map(d=>d.totalNet).concat(S.targetNet?[S.targetNet]:[]);
  const mx=Math.max.apply(null,vals.concat([10])),mn=Math.min.apply(null,vals.concat([0])),rg=(mx-mn)||1;
  const py=v=>pad.t+(1-(v-mn)/rg)*(h-pad.t-pad.b);
  ctx.strokeStyle=line; ctx.lineWidth=1; ctx.fillStyle=txt; ctx.font="10px Inter,sans-serif"; ctx.textAlign="right";
  for(let g=0;g<=3;g++){
    const val=mn+rg*g/3,y=py(val);
    ctx.beginPath(); ctx.moveTo(pad.l,y); ctx.lineTo(w-pad.r,y); ctx.stroke();
    ctx.fillText(Math.round(val),pad.l-4,y+3);
  }
  if(S.targetNet){
    const y=py(S.targetNet);
    ctx.save(); ctx.setLineDash([4,4]); ctx.strokeStyle=ochre; ctx.lineWidth=1.5;
    ctx.beginPath(); ctx.moveTo(pad.l,y); ctx.lineTo(w-pad.r,y); ctx.stroke(); ctx.restore();
  }
  const seriesColors=[green,ochre,accent];
  ["TYT","AYT","YDT"].forEach((tp,ti)=>{
    const data=series[tp]; if(!data.length)return;
    const px=i=>pad.l+(data.length===1?(w-pad.l-pad.r)/2:i*(w-pad.l-pad.r)/(data.length-1));
    ctx.strokeStyle=seriesColors[ti]; ctx.lineWidth=2.5; ctx.beginPath();
    data.forEach((d,i)=>{ const x=px(i),y=py(d.totalNet); i?ctx.lineTo(x,y):ctx.moveTo(x,y); });
    ctx.stroke();
    ctx.fillStyle=seriesColors[ti];
    data.forEach((d,i)=>{ ctx.beginPath(); ctx.arc(px(i),py(d.totalNet),3.5,0,7); ctx.fill(); });
  });
  ctx.fillStyle=txt; ctx.textAlign="left"; ctx.font="10px Inter,sans-serif";
  ctx.fillText("● TYT",pad.l,h-8);
  ctx.fillStyle=ochre; ctx.fillText("● AYT",pad.l+48,h-8);
  ctx.fillStyle=accent; ctx.fillText("● YDT",pad.l+96,h-8);
}
/* --- ders bazlı grafik --- */
let subjSel=null;
function renderSubjPicker(){
  const w=el("subjPick"); if(!w)return;
  const lab=el("subjType");
  if(lab)lab.textContent=(denemeType==="BRANS"?"Branş denemesi çözdüğün dersler":denemeType+" dersleri")+" — değiştirmek için yukarıdaki sekmeleri kullan";
  const names=(denemeType==="BRANS")
    ? [...new Set(S.denemeler.filter(d=>d.type==="BRANS").map(d=>d.subjectResults[0].name))]
    : DENEME_SUBJECTS[denemeType].map(x=>x[0]);
  if(!names.length){ w.innerHTML='<span class="hint">Branş denemesi ekleyince dersler burada listelenir.</span>'; subjSel=null; return; }
  if(!subjSel||names.indexOf(subjSel)<0)subjSel=names[0];
  w.innerHTML=names.map(n=>`<button class="chip ${n===subjSel?"on":""}" onclick="pickSubj('${n.replace(/'/g,"\\'")}')">${esc(n)}</button>`).join("");
}
function pickSubj(n){ subjSel=n; renderSubjPicker(); drawSubjChart(); }
function drawSubjChart(){
  renderSubjPicker();
  const info=el("subjInfo");
  const rows=S.denemeler.filter(d=>d.type===denemeType).sort((a,b)=>a.date.localeCompare(b.date)||a.id-b.id)
    .map(d=>({date:d.date,sr:d.subjectResults.find(x=>x.name===subjSel)})).filter(x=>x.sr);
  if(info){
    if(!rows.length)info.textContent=denemeType+" denemesi ekleyince "+(subjSel||"")+" gelişimi burada çıkar.";
    else{
      const cap0=(denemeType==="BRANS")?(rows[rows.length-1].sr.cap||40)
        :(DENEME_SUBJECTS[denemeType].find(x=>x[0]===subjSel)||[null,40])[1];
      const l=rows[rows.length-1].sr;
      const first=rows[0].sr, df=r2(l.net-first.net);
      info.textContent=subjSel+" · son deneme "+l.net+"/"+cap0+" net (%"+Math.round(l.net/cap0*100)+")"
        +(rows.length>1?" · ilk denemeye göre "+(df>0?"+":"")+df:"");
    }
  }
  const cv=el("subjChart"); if(!cv)return;
  const fit=fitCanvas(cv); if(!fit)return;
  const ctx=fit.ctx,w=fit.w,h=fit.h;
  const cs=getComputedStyle(document.documentElement);
  const green=cs.getPropertyValue("--green").trim()||"#1F6E4A",
        line=cs.getPropertyValue("--line").trim()||"#E4DFD2",
        txt=cs.getPropertyValue("--ink2").trim()||"#6F695E";
  const data=S.denemeler.filter(d=>d.type===denemeType).sort((a,b)=>a.date.localeCompare(b.date)||a.id-b.id)
    .map(d=>({date:d.date,sr:d.subjectResults.find(x=>x.name===subjSel)})).filter(x=>x.sr);
  if(!data.length){ ctx.fillStyle=txt; ctx.font="13px Inter,sans-serif"; ctx.textAlign="center"; ctx.fillText(denemeType+" denemesi ekle",w/2,h/2); return; }
  const cap=(denemeType==="BRANS")?(data[data.length-1].sr.cap||40)
    :(DENEME_SUBJECTS[denemeType].find(x=>x[0]===subjSel)||[null,40])[1];
  const pad={l:30,r:12,t:14,b:22};
  const py=v=>pad.t+(1-v/cap)*(h-pad.t-pad.b);
  ctx.strokeStyle=line; ctx.lineWidth=1; ctx.fillStyle=txt; ctx.font="10px Inter,sans-serif"; ctx.textAlign="right";
  for(let g=0;g<=3;g++){
    const val=cap*g/3,y=py(val);
    ctx.beginPath(); ctx.moveTo(pad.l,y); ctx.lineTo(w-pad.r,y); ctx.stroke();
    ctx.fillText(Math.round(val),pad.l-4,y+3);
  }
  const px=i=>pad.l+(data.length===1?(w-pad.l-pad.r)/2:i*(w-pad.l-pad.r)/(data.length-1));
  ctx.strokeStyle=green; ctx.lineWidth=2.5; ctx.beginPath();
  data.forEach((d,i)=>{ const x=px(i),y=py(d.sr.net); i?ctx.lineTo(x,y):ctx.moveTo(x,y); });
  ctx.stroke();
  ctx.fillStyle=green;
  data.forEach((d,i)=>{ ctx.beginPath(); ctx.arc(px(i),py(d.sr.net),3.5,0,7); ctx.fill(); });
}
/* --- boş / yanlış analizi --- */
function renderBlankWrong(){
  const w=el("bwBox"); if(!w)return;
  const list=S.denemeler.filter(d=>d.type===denemeType);
  if(!list.length){ w.innerHTML='<div class="empty">'+(denemeType==="BRANS"?"Branş":denemeType)+' denemesi ekleyince doğru/yanlış/boş dağılımı burada çıkar.</div>'; return; }
  const agg={};
  list.forEach(dn=>dn.subjectResults.forEach(sr=>{
    if(!agg[sr.name])agg[sr.name]={d:0,y:0,b:0};
    agg[sr.name].d+=sr.d; agg[sr.name].y+=sr.y; agg[sr.name].b+=sr.b;
  }));
  let html='<div class="hbars">';
  Object.keys(agg).forEach(n=>{
    const a=agg[n],t=a.d+a.y+a.b||1;
    html+=`<div class="hb"><span class="hl" style="min-width:86px">${esc(n)}</span>
      <div class="ht stack">
        <i class="sd" style="width:${a.d/t*100}%"></i>
        <i class="sy" style="width:${a.y/t*100}%"></i>
        <i class="sb" style="width:${a.b/t*100}%"></i>
      </div><span class="hv">%${Math.round(a.b/t*100)} boş</span></div>`;
  });
  html+='</div><p class="hint">Yeşil doğru · kırmızı yanlış · gri boş. Boş oranı yüksekse sorun genelde zaman ya da cesaret; yanlış oranı yüksekse bilgi eksiği.</p>';
  w.innerHTML=html;
}
/* --- karşılaştırma --- */
function renderCompareOpts(){
  const a=el("anaCmpA"),b=el("anaCmpB"); if(!a||!b)return;
  const list=S.denemeler.slice().sort((x,y)=>y.date.localeCompare(x.date)||y.id-x.id);
  const opts=list.map(d=>`<option value="${d.id}">${esc(d.name)} · ${parseKey(d.date).toLocaleDateString("tr-TR",{day:"numeric",month:"short"})}</option>`).join("");
  const pa=a.value,pb=b.value;
  a.innerHTML=opts; b.innerHTML=opts;
  if(list.length>1){
    a.value=pa||list[1].id; b.value=pb||list[0].id;
    /* aynı denemeyi ya da geçersiz değeri gösteriyorlarsa mantıklı bir çifte düş */
    if(!a.value||!b.value||a.value===b.value){ a.value=list[1].id; b.value=list[0].id; }
  }
  renderAnaCompare();
}
function renderAnaCompare(){
  const w=el("anaCmpBox"); if(!w)return;
  const A=S.denemeler.find(d=>d.id==el("anaCmpA").value),B=S.denemeler.find(d=>d.id==el("anaCmpB").value);
  if(!A||!B||A.id===B.id){ w.innerHTML='<div class="empty">Karşılaştırmak için iki farklı deneme seç.</div>'; return; }
  if(A.type!==B.type){ w.innerHTML='<div class="empty">Farklı türde denemeler karşılaştırılamaz.</div>'; return; }
  if(A.type==="BRANS"&&A.subjectResults[0].name!==B.subjectResults[0].name){
    w.innerHTML='<div class="empty">Farklı derslerin branş denemeleri karşılaştırılamaz.</div>'; return; }
  let html='<table><tr><th style="text-align:left">Ders</th><th>'+esc(A.name.slice(0,10))+'</th><th>'+esc(B.name.slice(0,10))+'</th><th>Fark</th></tr>';
  B.subjectResults.forEach(sb=>{
    const sa=A.subjectResults.find(x=>x.name===sb.name)||{net:0};
    const df=r2(sb.net-sa.net);
    html+=`<tr><td style="text-align:left">${esc(sb.name)}</td><td>${sa.net}</td><td>${sb.net}</td>
      <td style="color:${df>0?"var(--green)":df<0?"var(--red)":"var(--ink3)"}">${df>0?"+"+df:df}</td></tr>`;
  });
  const dt=r2(B.totalNet-A.totalNet);
  html+=`<tr style="font-weight:700"><td style="text-align:left">Toplam</td><td>${A.totalNet}</td><td>${B.totalNet}</td>
    <td style="color:${dt>0?"var(--green)":dt<0?"var(--red)":"var(--ink3)"}">${dt>0?"+"+dt:dt}</td></tr>`;
  if(A.dur&&B.dur)html+=`<tr><td style="text-align:left">Süre (dk)</td><td>${A.dur}</td><td>${B.dur}</td>
    <td style="color:${B.dur<A.dur?"var(--green)":"var(--ink3)"}">${B.dur-A.dur>0?"+":""}${B.dur-A.dur}</td></tr>`;
  html+="</table>";
  w.innerHTML=html;
}
/* --- puan tahmini --- */
function recentFieldNet(type,n,puanTuru){
  const list=S.denemeler.filter(d=>d.type===type).slice().sort((a,b)=>b.date.localeCompare(a.date)||b.id-a.id).slice(0,n);
  if(!list.length)return null;
  const alanlar={
    SAY:["Matematik","Fizik","Kimya","Biyoloji"],
    EA:["Matematik","Edebiyat","Tarih-1","Coğrafya-1"],
    SOZ:["Edebiyat","Tarih-1","Coğrafya-1","Tarih-2","Coğrafya-2","Felsefe Grubu","Din Kültürü"]
  };
  const izin=alanlar[puanTuru]||alanlar.SAY;
  const vals=list.map(d=>(d.subjectResults||[]).filter(x=>izin.indexOf(x.name)>=0).reduce((a,x)=>a+(+x.net||0),0));
  return r2(vals.reduce((a,x)=>a+x,0)/vals.length);
}
function estScores(){
  const tyt=recentAvgNet("TYT",3),ayt=recentFieldNet("AYT",3,S.puanTuru),ydt=recentAvgNet("YDT",3),c=S.coef;
  const obp=Math.max(0,Math.min(100,+S.obp||0))*c.obpK;
  const out={tytNet:tyt,aytNet:ayt,ydtNet:ydt,obp:r2(obp)};
  if(tyt!=null)out.tyt=r2(c.tytBase+tyt*c.tytK+obp);
  const alanNet=S.puanTuru==="DIL"?ydt:ayt;
  if(tyt!=null&&alanNet!=null)out.alan=r2(c.ayBase+tyt*c.ayTyt+alanNet*c.ayAyt+obp);
  return out;
}
function renderScore(){
  setTimeout(()=>{ if(typeof renderRank==="function")renderRank(); },0);
  const w=el("scoreBox"); if(!w)return;
  const e=estScores();
  if(e.tytNet==null){ w.innerHTML='<div class="empty">TYT denemesi ekleyince kaba puan tahmini burada çıkar.</div>'; return; }
  let html=`<div class="dayrow"><span class="k">TYT ort. net (son 3)</span><span class="v">${e.tytNet}</span></div>`;
  if(e.aytNet!=null)html+=`<div class="dayrow"><span class="k">AYT ort. net (son 3)</span><span class="v">${e.aytNet}</span></div>`;
  if(e.ydtNet!=null)html+=`<div class="dayrow"><span class="k">YDT ort. net (son 3)</span><span class="v">${e.ydtNet}</span></div>`;
  html+=`<div class="dayrow"><span class="k">OBP katkısı</span><span class="v">${e.obp}</span></div>`;
  html+=`<div class="dayrow"><span class="k">TYT puanı (tahmini)</span><span class="v" style="color:var(--green)">${e.tyt}</span></div>`;
  if(e.alan!=null)html+=`<div class="dayrow"><span class="k">Alan puanı (tahmini)</span><span class="v" style="color:var(--green)">${e.alan}</span></div>`;
  html+='<p class="hint">Bu <b>kaba bir tahmindir</b>. ÖSYM gerçek puanı, o yılki tüm adayların ortalama ve standart sapmasına göre hesaplar — bu bilgi sınavdan önce kimsede yoktur. Elindeki gerçek bir sonuçla karşılaştırıp aşağıdaki katsayıları kendine göre ayarlarsan tahmin isabetlenir.</p>';
  w.innerHTML=html;
  ["tytBase","tytK","ayBase","ayTyt","ayAyt","obpK"].forEach(k=>{ const i=el("cf_"+k); if(i)i.value=S.coef[k]; });
}
function saveCoef(){
  ["tytBase","tytK","ayBase","ayTyt","ayAyt","obpK"].forEach(k=>{
    const v=parseFloat(el("cf_"+k).value);
    if(!isNaN(v))S.coef[k]=v;
  });
  save(); renderScore(); toast("Katsayılar kaydedildi");
}
/* --- yanlış konu defteri --- */
function fillWrongTopicList(){
  const sv=el("wtSubject").value,dl=el("wtTopics");
  const s=ALL_SUBJECTS.find(x=>x.name===sv);
  dl.innerHTML=s?s.topics.map(t=>`<option value="${esc(t)}">`).join(""):"";
}
function addWrong(){
  const subject=el("wtSubject").value.trim(),topic=el("wtTopic").value.trim();
  const n=Math.max(1,parseInt(el("wtCount").value,10)||1);
  if(!subject||!topic){ toast("Ders ve konu gir"); return; }
  S.wrongLog.push({kind:(typeof wrongKind!=="undefined"&&wrongKind)||undefined,id:Date.now(),date:todayKey(),subject:subject,topic:topic,n:n});
  save(); el("wtTopic").value=""; el("wtCount").value="";
  const lk=(typeof linkWrongToTopic==="function")?linkWrongToTopic(subject,topic,n):null;
  renderWrongTopics(); renderSuggest();
  if(typeof renderTopicSolved==="function")renderTopicSolved();
  if(lk){
    renderSubjects(); renderReviewQueue();
    toast(lk.changed.indexOf("tekrar")>=0?"Eklendi — konu tekrar kuyruğuna alındı":"Eklendi — konunun güven puanı düşürüldü");
  } else toast("Yanlış konu eklendi ✓");
}
function delWrong(id){
  const bk=clone(S.wrongLog.find(x=>x.id===id));
  S.wrongLog=S.wrongLog.filter(x=>x.id!==id);
  if(bk&&typeof logAdd==="function")logAdd("sil","Yanlış kaydı silindi: "+(bk.topic||""),{t:"wrong",v:bk});
  save();
  if(bk)pushUndo("Yanlış kaydı silindi",()=>{ S.wrongLog.push(bk); });
  renderWrongTopics();
}
function renderWrongTopics(){
  if(typeof renderWrongKinds==="function")setTimeout(renderWrongKinds,0);
  const sel=el("wtSubject");
  if(sel&&!sel.options.length){
    sel.innerHTML='<option value="">Ders seç…</option>'+SUBJ_NAMES.map(n=>`<option value="${esc(n)}">${esc(n)}</option>`).join("");
  }
  const w=el("wtBox"); if(!w)return;
  if(!S.wrongLog.length){ w.innerHTML='<div class="empty">Deneme sonrası yanlışlarını konu konu eklersen, en çok hata yaptığın konular burada birikir.</div>'; return; }
  const top=topWrongTopics(20);
  const max=top[0]?top[0].n:1;
  let html='<div class="hbars">';
  top.forEach(t=>{
    html+=`<div class="hb"><span class="hl" style="min-width:120px">${esc(t.k)}</span>
      <div class="ht"><i class="warn" style="width:${Math.round(t.n/max*100)}%"></i></div><span class="hv">${t.n}</span></div>`;
  });
  html+='</div><p class="eyebrow" style="margin:16px 0 6px;">Son kayıtlar</p>';
  html+=S.wrongLog.slice(-12).reverse().map(x=>
    `<div class="dayrow"><span class="k">${esc(x.subject)} · ${esc(x.topic)}</span>
      <span class="v">${x.n} <button class="del" onclick="delWrong(${x.id})">sil</button></span></div>`).join("");
  w.innerHTML=html;
}
/* ================= POMODORO (zaman damgalı) =================
   Sayaç setInterval'a değil gerçek saate bakar; sekme arka plana
   alınıp geri gelse de kalan süre ve biriken dakika doğru kalır. */
let pomoState="idle",pomoIsWork=true,pomoTimer=null,pomoSubject="";
let pomoEndAt=0,pomoLeft=25*60,pomoTotal=25*60;
let pomoStartedAt=0,pomoCredited=0,pomoTask="",wakeLock=null;

function fmtT(s){ s=Math.max(0,s|0); const m=Math.floor(s/60),ss=s%60;
  return String(m).padStart(2,"0")+":"+String(ss).padStart(2,"0"); }

function todaySessions(){ const k=todayKey(); if(!S.sessions[k])S.sessions[k]=[]; return S.sessions[k]; }
function workCyclesToday(){ return todaySessions().filter(x=>x.type==="work"&&x.done).length; }
function isLongBreakNext(){
  const c=S.focus.cycles||4;
  return workCyclesToday()>0&&workCyclesToday()%c===0;
}
function pomoPhaseMin(isWork){
  if(isWork)return Math.max(1,S.workMin);
  return isLongBreakNext()?Math.max(1,S.focus.longBreak||15):Math.max(1,S.breakMin);
}
function applyPomoSettings(){
  S.workMin=Math.max(1,parseInt(el("workMin").value,10)||25);
  S.breakMin=Math.max(1,parseInt(el("breakMin").value,10)||5);
  const lb=el("longBreak"); if(lb)S.focus.longBreak=Math.max(1,Math.min(90,parseInt(lb.value,10)||15));
  const cy=el("cycleCount"); if(cy)S.focus.cycles=Math.max(2,Math.min(12,parseInt(cy.value,10)||4));
  const gm=el("focusGoal"); if(gm)S.focus.goalMin=Math.max(0,Math.min(1440,parseInt(gm.value,10)||0));
  save();
  if(pomoState==="idle")resetPomo(); else renderPomo();
}
function toggleAutoNext(){ S.focus.autoNext=!S.focus.autoNext; save(); renderPomo(); }
function toggleKeepAwake(){
  S.focus.keepAwake=!S.focus.keepAwake; save();
  if(!S.focus.keepAwake)releaseWake(); else if(pomoState==="running")requestWake();
  renderPomo();
}
function requestWake(){
  try{
    if(!S.focus.keepAwake||!navigator.wakeLock||wakeLock)return;
    navigator.wakeLock.request("screen").then(l=>{ wakeLock=l; l.addEventListener&&l.addEventListener("release",()=>{wakeLock=null;}); }).catch(()=>{});
  }catch(e){}
}
function releaseWake(){ try{ if(wakeLock&&wakeLock.release)wakeLock.release(); }catch(e){} wakeLock=null; }

/* --- görev bağlama: bugünün planındaki hücreler --- */
function todayTaskOptions(){
  const now=new Date(),dw=dowOf(now),w=getWeek(keyOf(mondayOf(now)),false);
  const out=[];
  if(!w)return out;
  ["r","s"].forEach(blk=>(w[blk]||[]).forEach((row,i)=>{
    const txt=row[dw];
    if(!txt||!txt.trim())return;
    const cid=blk+"-"+i+"-"+dw;
    out.push({cid:cid,txt:txt.trim(),done:!!w.dn[cid]});
  }));
  return out;
}
function renderPomoTasks(){
  const sel=el("pomoTask"); if(!sel)return;
  const list=todayTaskOptions();
  const cur=pomoTask;
  sel.innerHTML='<option value="">Görev bağlama (isteğe bağlı)</option>'+
    list.map(o=>`<option value="${esc(o.cid)}"${o.cid===cur?" selected":""}>${o.done?"✓ ":""}${esc(o.txt)}</option>`).join("");
  if(!list.length)sel.innerHTML='<option value="">Bugün için plan hücresi yok</option>';
}
function setPomoTask(v){ pomoTask=v||""; }

function renderPomoSubjects(){
  const w=el("pomoSubjPick"); if(!w)return;
  if(!pomoSubject)pomoSubject=SUBJ_NAMES[0];
  w.innerHTML=SUBJ_NAMES.map(n=>`<button class="chip ${n===pomoSubject?"on":""}" onclick="setPomoSubject('${n.replace(/'/g,"\\'")}')">${esc(n)}</button>`).join("");
}
function setPomoSubject(n){ pomoSubject=n; renderPomoSubjects(); }

const ICON_PLAY='<path d="M8 5.5v13l11-6.5z"/>';
const ICON_PAUSE='<path d="M9 5v14M15 5v14" stroke-width="2.6" stroke-linecap="round"/>';
/* Sayaç çalışırken her saniye tüm odak ekranını tekrar kurmak yerine
   yalnız saat/halkayı güncelle. Tam panel durum değişiminde veya dakika
   kredisi değiştiğinde render edilir. */
function renderPomoClock(){
  if(pomoState==="running")pomoLeft=Math.max(0,Math.round((pomoEndAt-Date.now())/1000));
  const tm=el("pomoTime"); if(tm)tm.textContent=fmtT(pomoLeft);
  const kalan=pomoTotal?Math.max(0,Math.min(1,pomoLeft/pomoTotal)):0;
  const gecen=1-kalan;
  const ring=el("pomoRing"); if(ring)ring.setAttribute("stroke-dashoffset",(578*(1-gecen)).toFixed(1));
  const dot=el("pomoDot");
  if(dot){
    const ang=(-90+360*gecen)*Math.PI/180;
    dot.setAttribute("cx",(114+92*Math.cos(ang)).toFixed(2));
    dot.setAttribute("cy",(114+92*Math.sin(ang)).toFixed(2));
  }
}
function renderPomo(){
  renderPomoSubjects(); renderPomoTasks();
  renderPomoClock();

  const card=el("focusCard");
  if(card){
    card.setAttribute("data-phase",pomoIsWork?"work":"break");
    card.setAttribute("data-run",pomoState);
  }
  const lbl=pomoIsWork?"Çalışma":(isLongBreakNext()?"Uzun mola":"Mola");
  el("pomoMode").textContent=lbl+(pomoState==="paused"?" · duraklatıldı":"");

  const ends=el("pomoEnds");
  if(ends){
    if(pomoState==="running"){
      const e=new Date(pomoEndAt);
      ends.textContent=String(e.getHours()).padStart(2,"0")+":"+String(e.getMinutes()).padStart(2,"0")+"'de biter";
    } else ends.textContent=pomoState==="paused"?"duraklatıldı":"";
  }

  const btnLbl=pomoState==="running"?"Duraklat":(pomoState==="paused"?"Devam et":"Başlat");
  const bl=el("pomoBtnLabel");
  if(bl)bl.textContent=btnLbl; else el("pomoStartBtn").textContent=btnLbl;
  const bi=el("pomoBtnIcon");
  if(bi)bi.innerHTML=pomoState==="running"?ICON_PAUSE:ICON_PLAY;

  const dots=el("pomoDots");
  if(dots){
    const n=S.focus.cycles||4,done=workCyclesToday()%n;
    let h="";
    for(let i=0;i<n;i++)h+='<i class="'+((i<done||(done===0&&workCyclesToday()>0&&pomoState==="idle"&&!pomoIsWork))?"on":"")+'"></i>';
    dots.innerHTML=h;
  }
  const k=todayKey();
  el("pomoTodayMin").textContent=S.pomoMin[k]||0;
  el("pomoPause").textContent=S.pauses[k]||0;
  const pta=el("pomoTotalAll"); if(pta)pta.textContent=Math.floor(totalMinutes()/60);
  const cyc=el("pomoCycle");
  if(cyc){
    const c=workCyclesToday(),n=S.focus.cycles||4,mins=S.pomoMin[todayKey()]||0;
    cyc.textContent=c
      ?("Bugün "+c+" tur · "+fmtHM(mins)+" · uzun molaya "+(n-(c%n))+" tur")
      :("İlk turun · her "+n+" turda uzun mola");
  }
  const gw=el("goalWrap");
  if(gw){
    const goal=S.focus.goalMin|0;
    if(!goal){ gw.style.display="none"; }
    else{
      gw.style.display="block";
      const done=S.pomoMin[k]||0,p=Math.min(100,Math.round(done/goal*100));
      el("goalBar").style.width=p+"%";
      el("goalTxt").textContent=done+" / "+goal+" dk · %"+p+(done>=goal?" · hedef tamam 🎉":"");
    }
  }
  ["none","white","brown"].forEach(t=>{ const e=el("fs_"+t); if(e)e.classList.toggle("on",S.focusSound===t); });
  const sw=el("soundToggle"); if(sw)sw.classList.toggle("on",!!S.sound);
  const an=el("autoNextToggle"); if(an)an.classList.toggle("on",!!S.focus.autoNext);
  const ka=el("keepAwakeToggle"); if(ka)ka.classList.toggle("on",!!S.focus.keepAwake);
  const wm=el("workMin"); if(wm&&document.activeElement!==wm)wm.value=S.workMin;
  const bm=el("breakMin"); if(bm&&document.activeElement!==bm)bm.value=S.breakMin;
  const lb=el("longBreak"); if(lb&&document.activeElement!==lb)lb.value=S.focus.longBreak;
  const cy=el("cycleCount"); if(cy&&document.activeElement!==cy)cy.value=S.focus.cycles;
  const fg=el("focusGoal"); if(fg&&document.activeElement!==fg)fg.value=S.focus.goalMin||"";
  if(typeof renderQuick==="function")renderQuick();
  renderSessions();
}
function renderSessions(){
  const w=el("sessionList"); if(!w)return;
  const list=todaySessions().filter(x=>x.type==="work");
  if(!list.length){ w.innerHTML='<div class="empty">Bugün henüz oturum yok.</div>'; return; }
  w.innerHTML=list.slice().reverse().map(x=>{
    const t=new Date(x.t),hh=String(t.getHours()).padStart(2,"0")+":"+String(t.getMinutes()).padStart(2,"0");
    return `<div class="dayrow"><span class="k">${hh} · ${esc(x.subj||"—")}${x.task?" · plan":""}${x.note?"<br><small>"+esc(x.note)+"</small>":""}</span>
      <span class="v" style="color:${x.done?"var(--success)":"var(--label-3)"}">${x.m} dk${x.done?"":" · yarıda"}</span></div>`;
  }).join("");
}

/* --- dakika hesabı: gerçek geçen süreye göre --- */
function creditMinutes(){
  if(typeof isCoach==="function"&&isCoach())return;
  if(!pomoIsWork||!pomoStartedAt)return;
  /* Cihaz uyursa gerçek geçen süre turdan çok daha uzun olabiliyor.
     Bir turda en fazla o turun uzunluğu kadar dakika yazılır. */
  const tavan=Math.max(1,Math.round(pomoTotal/60));
  let elapsed=Math.floor((Date.now()-pomoStartedAt)/60000);
  if(elapsed>tavan)elapsed=tavan;
  const add=elapsed-pomoCredited;
  if(add<=0)return;
  pomoCredited=elapsed;
  const k=todayKey();
  S.pomoMin[k]=(S.pomoMin[k]||0)+add;
  if(!S.pomoSubj[k])S.pomoSubj[k]={};
  S.pomoSubj[k][pomoSubject]=(S.pomoSubj[k][pomoSubject]||0)+add;
  save();
}
function recordSession(done){
  const mins=pomoCredited;
  if(!pomoIsWork||mins<1)return;
  todaySessions().push({t:pomoStartedAt,m:mins,subj:pomoSubject,task:pomoTask,type:"work",done:!!done});
  if(S.sessions[todayKey()].length>40)S.sessions[todayKey()]=S.sessions[todayKey()].slice(-40);
  save();
}
function pomoTick(){
  if(pomoState!=="running")return;
  const beforeCredit=pomoCredited;
  creditMinutes();
  pomoLeft=Math.max(0,Math.round((pomoEndAt-Date.now())/1000));
  if(pomoLeft<=0){ finishPhase(); return; }
  if(pomoCredited!==beforeCredit)renderPomo();
  else renderPomoClock();
}
function finishPhase(){
  clearInterval(pomoTimer); pomoTimer=null;
  creditMinutes();
  const wasWork=pomoIsWork;
  if(wasWork){
    recordSession(true);
    if(pomoTask){
      const wk=keyOf(mondayOf(new Date())),w=getWeek(wk,true);
      if(!w.dn[pomoTask]){ w.dn[pomoTask]=1; save(); }
    }
  }
  stopNoise(); releaseWake();
  beep(wasWork?3:2);
  try{ if(navigator.vibrate)navigator.vibrate(wasWork?[220,90,220]:250); }catch(e){}
  toast(wasWork?(isLongBreakNext()?"Uzun mola zamanı ☕":"Mola zamanı ☕"):"Tekrar çalışma zamanı 💪");
  if(typeof notify==="function"&&typeof notifCfg==="function"&&notifCfg().pomo){
    const bugunSure=fmtHM(S.pomoMin[todayKey()]||0);
    notify(wasWork?"Çalışma bitti":"Mola bitti",
      wasWork?((isLongBreakNext()?"Uzun mola zamanı":"Mola zamanı")+" · bugün "+bugunSure)
             :"Yeni tura başlayabilirsin · bugün "+bugunSure,"pomo");
  }
  pomoIsWork=!wasWork;
  pomoTotal=pomoPhaseMin(pomoIsWork)*60;
  pomoLeft=pomoTotal; pomoState="idle"; pomoStartedAt=0; pomoCredited=0;
  renderPomo(); renderTimeDist(); checkBadges(false);
  if(wasWork&&typeof showSessionNote==="function")showSessionNote();
  if(el("home").classList.contains("active"))renderTodayPlan();
  if(S.focus.autoNext)setTimeout(()=>{ if(pomoState==="idle")startPomo(); },1200);
}
function startPomo(){
  if(typeof coachBlock==="function"&&coachBlock("pomodoro"))return;
  pomoState="running";
  pomoEndAt=Date.now()+pomoLeft*1000;
  if(pomoIsWork){
    if(!pomoStartedAt){ pomoStartedAt=Date.now(); pomoCredited=0; }
    else { pomoStartedAt=Date.now()-pomoCredited*60000; }
    startNoise(S.focusSound); requestWake();
  } else stopNoise();
  ensureAudio();
  clearInterval(pomoTimer);
  pomoTimer=setInterval(pomoTick,1000);
  renderPomo();
}
function pausePomo(){
  clearInterval(pomoTimer); pomoTimer=null;
  creditMinutes();
  pomoLeft=Math.max(0,Math.round((pomoEndAt-Date.now())/1000));
  pomoState="paused"; stopNoise(); releaseWake();
  const k=todayKey(); S.pauses[k]=(S.pauses[k]||0)+1; save();
  if(typeof showPauseReason==="function")showPauseReason();
  renderPomo();
}
function togglePomo(){ if(pomoState==="running")pausePomo(); else startPomo(); }
function resetPomo(){
  clearInterval(pomoTimer); pomoTimer=null;
  creditMinutes(); recordSession(false);
  stopNoise(); releaseWake();
  pomoState="idle"; pomoIsWork=true;
  pomoStartedAt=0; pomoCredited=0;
  pomoTotal=pomoPhaseMin(true)*60; pomoLeft=pomoTotal;
  renderPomo();
}
function skipPhase(){
  if(pomoState==="idle"&&!pomoIsWork){ pomoIsWork=true; pomoTotal=pomoPhaseMin(true)*60; pomoLeft=pomoTotal; renderPomo(); return; }
  pomoLeft=0; pomoEndAt=Date.now(); finishPhase();
}
function toggleSound(){ S.sound=!S.sound; save(); renderPomo(); if(S.sound)beep(1); }

/* ================= ZAMAN DAĞILIMI ================= */
function renderTimeDist(){
  const w=el("timeDist"); if(!w)return;
  const range=parseInt((el("tdRange")||{value:"7"}).value,10)||7;
  const agg={}; let total=0;
  for(let i=0;i<range;i++){
    const k=addDaysKey(todayKey(),-i),m=S.pomoSubj[k];
    if(!m)continue;
    Object.keys(m).forEach(sn=>{ agg[sn]=(agg[sn]||0)+m[sn]; total+=m[sn]; });
  }
  if(!total){ w.innerHTML='<div class="empty">Pomodoro çalıştırırken ders seçersen, süreni hangi derse ayırdığın burada birikir.</div>'; return; }
  const keys=Object.keys(agg).sort((a,b)=>agg[b]-agg[a]);
  let html='<div class="hbars">';
  keys.forEach(n=>{
    const p=Math.round(agg[n]/total*100);
    html+=`<div class="hb"><span class="hl" style="min-width:96px">${esc(n)}</span>
      <div class="ht"><i style="width:${p}%;background:hsl(${hueOf(n)} 55% 45%)"></i></div>
      <span class="hv">${fmtHM(agg[n])}</span></div>`;
  });
  html+=`</div><p class="hint">Son ${range} günde toplam ${fmtHM(total)}.</p>`;
  w.innerHTML=html;
}

/* ================= KAYNAKLAR ================= */
function addBook(){
  const n=el("bkName").value.trim(),sj=el("bkSubject").value,tot=Math.max(1,parseInt(el("bkTotal").value,10)||0);
  if(!n||!tot){ toast("Kaynak adı ve toplam test/soru sayısı gir"); return; }
  S.books.push({id:Date.now(),name:n,subject:sj,total:tot,done:0,log:[],topic:""});
  save(); el("bkName").value=""; el("bkTotal").value="";
  renderBooks(); toast("Kaynak eklendi ✓");
}
/* hangi konuda çalışıldığı kaynak satırından seçilir; ilerleme o konuya da işlenir */
function setBookTopic(id,v){
  const b=S.books.find(x=>x.id===id); if(!b)return;
  b.topic=v||""; save();
}
function bookTopicOptions(b){
  const s=(typeof findSubj==="function")?findSubj(b.subject):null;
  if(!s)return "";
  return '<option value="">Konu seçilmedi</option>'+
    s.topics.map(t=>`<option value="${esc(t)}"${b.topic===t?" selected":""}>${esc(t)}</option>`).join("");
}
function bookAdd(id,n){
  const b=S.books.find(x=>x.id===id); if(!b)return;
  b.done=Math.max(0,Math.min(b.total,b.done+n));
  b.log.push({d:todayKey(),n:n});
  if(b.log.length>400)b.log=b.log.slice(-400);
  let linked=false;
  if(n>0&&b.topic&&typeof topicKeyOf==="function"){
    const key=topicKeyOf(b.subject,b.topic);
    if(key){ if(tget(key).st<2)tsetStatus(key,2); linked=true; }
  }
  save(); renderBooks();
  if(typeof renderSubjects==="function"&&linked)renderSubjects();
  if(b.done>=b.total)toast("🎉 "+b.name+" bitti!");
  else if(linked)toast(b.topic+" konusu işaretlendi");
}
function delBook(id){
  if(!confirm("Bu kaynak silinsin mi?"))return;
  const bk=clone(S.books.find(x=>x.id===id));
  S.books=S.books.filter(x=>x.id!==id);
  if(bk&&typeof logAdd==="function")logAdd("sil","Kaynak silindi: "+bk.name,{t:"book",v:bk});
  save();
  if(bk)pushUndo("Kaynak silindi: "+bk.name,()=>{ S.books.push(bk); });
  renderBooks();
}
function bookProjection(b){
  const cut=addDaysKey(todayKey(),-14);
  const recent=b.log.filter(l=>l.d>=cut);
  const sum=recent.reduce((a,l)=>a+l.n,0);
  if(!sum)return null;
  const rate=sum/14;
  const left=b.total-b.done;
  if(left<=0)return {done:true};
  const days=Math.ceil(left/rate);
  return {days:days,date:addDaysKey(todayKey(),days),rate:r2(rate)};
}
function renderBooks(){
  const sel=el("bkSubject");
  if(sel&&!sel.options.length)sel.innerHTML=SUBJ_NAMES.map(n=>`<option value="${esc(n)}">${esc(n)}</option>`).join("");
  const w=el("bookList"); if(!w)return;
  if(!S.books.length){ w.innerHTML='<div class="empty">Henüz kaynak eklemedin. Kitap/deneme setlerini ekleyip ilerlemeni takip edebilirsin.</div>'; return; }
  w.innerHTML=S.books.map(b=>{
    const p=Math.round(b.done/b.total*100),pr=bookProjection(b);
    let note="Son 14 günde ilerleme yok — hızını girmeye başla.";
    if(pr&&pr.done)note="Tamamlandı 🎉";
    else if(pr)note="Günde ~"+pr.rate+" hızla "+parseKey(pr.date).toLocaleDateString("tr-TR",{day:"numeric",month:"long"})+" civarında biter ("+pr.days+" gün).";
    return `<div class="bookrow">
      <div class="bh"><span class="bn">${esc(b.name)}</span><span class="bs">${esc(b.subject)}</span></div>
      <div class="bar"><i style="width:${p}%"></i></div>
      <div class="bmeta">${b.done}/${b.total} · %${p}</div>
      <div class="bnote">${esc(note)}</div>
      <div style="margin-top:8px;"><select onchange="setBookTopic(${b.id},this.value)" style="font-size:13px;padding:7px 10px;">${bookTopicOptions(b)}</select></div>
      <div class="brow">
        <button class="btn ghost tiny" onclick="bookAdd(${b.id},1)">+1</button>
        <button class="btn ghost tiny" onclick="bookAdd(${b.id},5)">+5</button>
        <button class="btn ghost tiny" onclick="bookAdd(${b.id},10)">+10</button>
        <button class="btn ghost tiny" onclick="bookAdd(${b.id},-1)">−1</button>
        <button class="del" onclick="delBook(${b.id})">Sil</button>
      </div></div>`;
  }).join("");
}

/* ================= ROZETLER ================= */
function renderBadges(){
  return false;
}

/* ================= VERİ SAYFASI ================= */
function renderData(){
  const w=el("dataBox"); if(!w)return;
  const days=new Set([].concat(Object.keys(S.solved),Object.keys(S.pomoMin),Object.keys(S.journal)));
  const list=[...days].sort().reverse().slice(0,60);
  let html=`<div class="dayrow"><span class="k">Toplam soru</span><span class="v">${totalSolved()}</span></div>
    <div class="dayrow"><span class="k">Toplam çalışma</span><span class="v">${fmtHM(totalMinutes())}</span></div>
    <div class="dayrow"><span class="k">Deneme sayısı</span><span class="v">${S.denemeler.length}</span></div>
    <div class="dayrow"><span class="k">Pekiştirilen konu</span><span class="v">${fullTopicCount()}</span></div>
    <div class="dayrow"><span class="k">Konu etiketli soru</span><span class="v">${typeof totalTopicSolved==="function"?totalTopicSolved():0}</span></div>`;
  if(!list.length){ w.innerHTML=html+'<div class="empty">Gün kaydı yok.</div>'; return; }
  html+='<p class="eyebrow" style="margin:16px 0 6px;">Son 60 gün (düzeltebilirsin)</p>';
  html+='<table class="dt"><tr><th style="text-align:left">Tarih</th><th>Soru</th><th>Dakika</th><th></th></tr>';
  list.forEach(k=>{
    html+=`<tr><td style="text-align:left">${parseKey(k).toLocaleDateString("tr-TR",{day:"numeric",month:"short",year:"2-digit"})}</td>
      <td><input class="mini" type="number" min="0" value="${S.solved[k]||0}" onchange="editDay('${k}','solved',this.value)"></td>
      <td><input class="mini" type="number" min="0" value="${S.pomoMin[k]||0}" onchange="editDay('${k}','pomoMin',this.value)"></td>
      <td><button class="del" onclick="delDay('${k}')">sil</button></td></tr>`;
  });
  html+="</table>";
  w.innerHTML=html;
}
function editDay(k,field,v){
  const n=Math.max(0,parseInt(v,10)||0);
  if(n)S[field][k]=n; else delete S[field][k];
  save(); renderHome();
}
function delDay(k){
  if(!confirm(k+" gününe ait soru, süre ve günlük kaydı silinsin mi?"))return;
  const bk={s:S.solved[k],m:S.pomoMin[k],sj:clone(S.pomoSubj[k]),p:S.pauses[k],j:S.journal[k],se:clone(S.sessions[k])};
  delete S.solved[k]; delete S.pomoMin[k]; delete S.pomoSubj[k]; delete S.pauses[k]; delete S.journal[k];
  if(typeof logAdd==="function")logAdd("sil","Gün silindi: "+k,{t:"day",k:k,v:{s:bk.s,m:bk.m,j:bk.j}});
  save();
  pushUndo("Gün silindi",()=>{
    if(bk.s!==undefined)S.solved[k]=bk.s;
    if(bk.m!==undefined)S.pomoMin[k]=bk.m;
    if(bk.sj)S.pomoSubj[k]=bk.sj;
    if(bk.p!==undefined)S.pauses[k]=bk.p;
    if(bk.j!==undefined)S.journal[k]=bk.j;
    if(bk.se)S.sessions[k]=bk.se;
  });
  renderData(); renderHome();
}

/* ================= AYARLAR / YEDEK ================= */
function setMoreTab(t){
  ["lab","kay","tak","roz","veri","ayar"].forEach(x=>{
    const b=el("mr_"+x),p=el("mrp_"+x);
    if(b)b.classList.toggle("on",x===t);
    if(p)p.style.display=x===t?"block":"none";
  });
  if(t==="lab"&&typeof v320RenderLearningLab==="function")v320RenderLearningLab();
  if(t==="kay")renderBooks();
  if(t==="roz")renderBadges();
  if(t==="veri"){renderData();
    if(typeof renderConsistency==="function"){renderConsistency();renderReport();}
    if(typeof renderLog==="function")renderLog();
    scheduleInfraHealth(true);}
  if(t==="roz"&&typeof renderMilestones==="function"){renderMilestones();renderLastYear();}
  if(t==="roz"&&typeof renderKarne==="function"){renderKarne();renderRamp();renderHours();}
  if(t==="roz"&&typeof renderStart==="function")renderStart();
  if(t==="kay"&&typeof renderWatchStats==="function")renderWatchStats();
  if(t==="veri"&&typeof renderAutoBackup==="function")renderAutoBackup();
  if(t==="tak"&&typeof renderTactics==="function"){renderTactics();renderGuess();}
  if(t==="veri"&&typeof renderRetro==="function")renderRetro();
  if(t==="kay"&&typeof renderHocalar==="function")renderHocalar();
}
function renderSettings(){
  el("nameInput").value=S.name;
  el("examDateInput").value=S.examDate;
  el("targetInput").value=S.target;
  el("targetNetInput").value=S.targetNet||"";
  el("obpInput").value=S.obp||"";
  const wdi=el("workdaysInput"); if(wdi)wdi.value=S.workdays||6;
  el("workMin").value=S.workMin;
  el("breakMin").value=S.breakMin;
  const sm=el("simMin"); if(sm&&!sm.value)sm.value=S.simulMin||165;
  const lb=el("lastBackup");
  if(lb)lb.textContent=S.lastBackup?("Son JSON yedeği: "+parseKey(S.lastBackup).toLocaleDateString("tr-TR",{day:"numeric",month:"long",year:"numeric"})):"Henüz JSON yedeği almadın.";
  const av=el("appVersionLabel");
  if(av)av.textContent=APP_VERSION+" · "+APP_CHANNEL;
}
function saveSettings(){
  S.name=el("nameInput").value.trim();
  S.examDate=el("examDateInput").value||S.examDate;
  S.target=Math.max(0,parseInt(el("targetInput").value,10)||0);
  S.targetNet=Math.max(0,parseFloat(el("targetNetInput").value)||0);
  S.obp=Math.max(0,Math.min(100,parseFloat(el("obpInput").value)||0));
  const wdi=el("workdaysInput");
  if(wdi)S.workdays=Math.max(1,Math.min(7,parseInt(wdi.value,10)||6));
  save();
  if(typeof renderEffective==="function")renderEffective(); renderHome(); renderScore(); toast("Ayarlar kaydedildi"); go("home");
}
function backupPayload(){
  const data=clone(S);
  if(data.yt)data.yt.key=""; /* kişisel anahtar yedeğe girmez */
  return {
    app:"YKS Defterim",
    format:2,
    appVersion:APP_VERSION,
    schemaVersion:DATA_SCHEMA,
    exportedAt:new Date().toISOString(),
    data:data
  };
}
function backupFileStamp(){
  const d=new Date();
  return todayKey()+"-"+String(d.getHours()).padStart(2,"0")+String(d.getMinutes()).padStart(2,"0");
}
function exportData(){
  const payload=backupPayload();
  const b=new Blob([JSON.stringify(payload,null,2)],{type:"application/json"});
  const a=document.createElement("a");
  a.href=URL.createObjectURL(b);
  a.download="yks-defterim-yedek-"+backupFileStamp()+".json";
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  setTimeout(()=>URL.revokeObjectURL(a.href),1000);
  S.lastBackup=todayKey(); S.lastExport=Date.now(); save();
  renderSettings(); renderHome();
  if(typeof renderAutoBackup==="function")renderAutoBackup();
  toast("JSON yedeği hazırlandı ✓");
}
function parseBackupPayload(raw){
  const parsed=typeof raw==="string"?JSON.parse(raw):raw;
  if(!parsed||typeof parsed!=="object"||Array.isArray(parsed))throw new Error("bad");
  /* Yeni format {data:{...}}; eski yedekler doğrudan uygulama verisiydi. */
  const data=(parsed.format>=2&&parsed.data&&typeof parsed.data==="object"&&!Array.isArray(parsed.data))?parsed.data:parsed;
  if(!data||typeof data!=="object"||Array.isArray(data))throw new Error("data");
  if(data.v!==undefined&&(!Number.isFinite(+data.v)||+data.v<1))throw new Error("version");
  if(data.v!==undefined&&+data.v>DATA_SCHEMA)throw new Error("future-version");
  return data;
}
function importData(inp){
  const f=inp.files[0]; if(!f)return;
  if(f.size>25*1024*1024){ toast("Yedek dosyası çok büyük (en fazla 25 MB)"); inp.value=""; return; }
  if(!confirm("Bu yedek mevcut verilerin üzerine yazılacak. Devam edilsin mi?")){ inp.value=""; return; }
  const r=new FileReader();
  r.onload=e=>{
    try{
      /* Geri yüklemeden hemen önce mevcut halin sessiz güvenlik kopyasını al. */
      if(typeof autoBackupRun==="function")autoBackupRun(true);
      const data=parseBackupPayload(e.target.result);
      S=normalize(Object.assign({},JSON.parse(JSON.stringify(DEF)),migrateState(data)));
      if(!save())throw new Error("save");
      applyTheme(); renderAll(); toast("Yedek geri yüklendi ✓"); go("home");
    }catch(x){ console.error(x); toast("Dosya okunamadı veya geçerli bir YKS yedeği değil"); }
  };
  r.readAsText(f); inp.value="";
}
function resetAll(){
  if(!confirm("Tüm verilerin kalıcı olarak silinecek. Emin misin?"))return;
  if(!confirm("Son onay: geri alınamaz. Devam edilsin mi?"))return;
  if(typeof autoBackupRun==="function")autoBackupRun(true);
  const keep=S.theme;
  localStorage.removeItem("yks");
  S=normalize(JSON.parse(JSON.stringify(DEF)));
  S.theme=keep; save(); applyTheme(); renderAll(); toast("Sıfırlandı"); go("home");
}

/* ================= ALTYAPI SAĞLIK / KURTARMA ================= */
function infraStorageBytes(){
  let n=0; try{for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i),v=localStorage.getItem(k)||"";n+=(k.length+v.length)*2;}}catch(e){}
  return n;
}
function infraRecoveryLabel(){
  const src=window.__YKS_RECOVERY_SOURCE||"primary";
  if(src==="primary"||src==="new")return "Ana kayıt sağlam";
  return "Kurtarma kullanıldı: "+src;
}
function runInfrastructureSelfTest(){
  const checks=[];
  const add=(name,ok,detail)=>checks.push({name:name,ok:!!ok,detail:detail||""});
  try{add("JSON koruması",safeJSONParse('{"a":1}').a===1&&safeJSONParse('{bozuk')===null);}catch(e){add("JSON koruması",false,e.message);}
  try{const m=migrateState({v:1,name:"x"});add("Veri göçü",m.v===DATA_SCHEMA,"şema "+m.v);}catch(e){add("Veri göçü",false,e.message);}
  try{add("Hash",infraHash("abc")===infraHash("abc")&&infraHash("abc")!==infraHash("abd"));}catch(e){add("Hash",false,e.message);}
  try{const c=JSON.parse(JSON.stringify(DEF));c.name="test";const n=normalize(c);add("Normalize",n.v===DATA_SCHEMA&&n.name==="test");}catch(e){add("Normalize",false,e.message);}
  try{add("Kronometre güvenliği",typeof swPause==="function"&&typeof swElapsedAt==="function"&&typeof swHistoryFlat==="function");}catch(e){add("Kronometre güvenliği",false,e.message);}
  try{add("Yedek sistemi",typeof autoBackupRun==="function"&&typeof parseBackupPayload==="function");}catch(e){add("Yedek sistemi",false,e.message);}
  try{add("Güncelleme katmanı",typeof registerSW==="function"&&typeof checkRemoteVersion==="function");}catch(e){add("Güncelleme katmanı",false,e.message);}
  try{add("Performans katmanı",typeof perfIdle==="function"&&typeof perfRAF==="function"&&typeof renderStartup==="function"&&typeof renderAfterExternalState==="function");}catch(e){add("Performans katmanı",false,e.message);}
  try{add("Söz havuzu",Array.isArray(SOZLER)&&SOZLER.length>=50&&new Set(SOZLER.map(x=>x.q)).size===SOZLER.length&&!SOZLER.some(x=>!x.a||x.a==="YKS Defterim"));}catch(e){add("Söz havuzu",false,e.message);}
  return {ok:checks.every(x=>x.ok),checks:checks};
}
function renderInfraHealth(){
  const w=el("infraBox"); if(!w)return;
  const test=runInfrastructureSelfTest(),errs=infraErrors(),conf=conflictBackups();
  const kb=Math.round(infraStorageBytes()/1024),online=navigator.onLine!==false;
  const swOk=("serviceWorker" in navigator)&&!!navigator.serviceWorker.controller;
  const rows=[
    ["Sürüm","v"+APP_VERSION+" · şema "+DATA_SCHEMA],
    ["Firebase kural sözleşmesi","v3 · UID + alan/boyut doğrulama"],
    ["Yerel kayıt",infraRecoveryLabel()],
    ["Depolama",kb+" KB"],
    ["İnternet",online?"Bağlı":"Çevrimdışı"],
    ["PWA önbellek",swOk?"Etkin":"Henüz etkin değil"],
    ["Başlangıç performansı",Math.round(PERF_STATE.bootSyncMs||0)+" ms · kademeli yükleme"],
    ["Bulut hazırlama",PERF_STATE.lastCloudBuildMs?PERF_STATE.lastCloudBuildMs.toFixed(1)+" ms":"Henüz senkron yapılmadı"],
    ["Otomatik test",test.ok?"Tüm kontroller geçti":"Kontrol gerekiyor"],
    ["Yakalanan hata",String(errs.length)],
    ["Çakışma yedeği",String(conf.length)]
  ];
  let h=rows.map(r=>'<div class="dayrow"><span class="k">'+esc(r[0])+'</span><span class="v">'+esc(r[1])+'</span></div>').join("");
  h+='<div class="rowtools" style="margin:12px 0 0"><button class="btn ghost tiny" onclick="renderInfraHealth();toast(\'Sistem kontrol edildi ✓\')">Tekrar kontrol et</button>';
  if(errs.length)h+='<button class="btn ghost tiny" onclick="clearInfraErrors()">Hata kaydını temizle</button>';
  if(conf.length)h+='<button class="btn ghost tiny" onclick="restoreConflictBackup('+(conf.length-1)+')">Son çakışma yedeğini aç</button>';
  h+='</div>';
  if(window.__YKS_RECOVERY_MESSAGE)h+='<p class="hint" style="color:var(--time)">'+esc(window.__YKS_RECOVERY_MESSAGE)+'</p>';
  if(!test.ok)h+='<p class="hint" style="color:var(--danger)">'+test.checks.filter(x=>!x.ok).map(x=>esc(x.name)).join(", ")+' kontrolü başarısız.</p>';
  w.innerHTML=h;
}
function safeRender(name,fn){
  try{return fn();}catch(e){infraError("render:"+name,e);return null;}
}
function showFatalBanner(err){
  try{
    let b=document.getElementById("infraFatal"); if(!b){b=document.createElement("div");b.id="infraFatal";b.style.cssText="position:fixed;left:86px;right:12px;top:64px;z-index:9999;padding:12px 14px;border-radius:14px;background:#7f1d1d;color:white;font:600 14px system-ui;box-shadow:0 8px 30px #0005";document.body.appendChild(b);}
    b.textContent="Uygulamanın bir bölümü açılamadı. Verilerin korunuyor. Sayfayı yenile; sorun sürerse Sistem sağlığı bölümüne bak.";
  }catch(e){}
}
if(typeof window!=="undefined"&&!window.__YKS_INFRA_HOOKED){
  window.__YKS_INFRA_HOOKED=true;
  window.addEventListener("error",e=>infraError("window",e.error||e.message));
  window.addEventListener("unhandledrejection",e=>infraError("promise",e.reason));
}

/* ================= BAŞLATMA ================= */
function renderStartupDeferred(){
  perfIdle("boot-program",()=>{safeRender("plan",()=>renderPlan());safeRender("calendar",()=>renderCalendar());safeRender("day-detail",()=>renderDayDetail());safeRender("procrast",()=>renderProcrast());},900);
  perfIdle("boot-topics",()=>{safeRender("subjects",()=>renderSubjects());safeRender("reviews",()=>renderReviewQueue());},1050);
  perfIdle("boot-deneme",()=>{safeRender("deneme-form",()=>renderDybRows());safeRender("deneme-history",()=>renderDenemeHistory());safeRender("compare",()=>renderCompareOpts());safeRender("score",()=>renderScore());safeRender("wrong-topics",()=>renderWrongTopics());safeRender("blank-wrong",()=>renderBlankWrong());},1250);
  perfIdle("boot-more",()=>{safeRender("books",()=>renderBooks());safeRender("badges",()=>renderBadges());safeRender("settings",()=>renderSettings());},1450);
}
function renderStartup(){
  safeRender("home",()=>renderHome());
  safeRender("pomo-init",()=>resetPomo());
  renderStartupDeferred();
}
function renderActiveScreenNoScroll(){
  const id=(typeof currentScreen==="function")?currentScreen():"home";
  if(id==="home")return renderHome();
  if(id==="program"){renderPlan();renderCalendar();renderDayDetail();renderProcrast();return;}
  if(id==="topics"){renderSubjects();renderReviewQueue();return;}
  if(id==="deneme"){renderDenemeHistory();renderBlankWrong();if(typeof renderExam2==="function")renderExam2();setAnaTab(activeAnaTab());return;}
  if(id==="progress"&&typeof renderProgress==="function"){renderProgress();return;}
  if(id==="pomo"){renderPomo();renderTimeDist();return;}
  if(id==="more"){setMoreTab(activeMoreTab());return;}
}
function renderAfterExternalState(){
  safeRender("active-state",()=>renderActiveScreenNoScroll());
  perfIdle("external-full-refresh",()=>renderAll(),1400);
}
function renderAll(){
  safeRender("home",()=>renderHome());
  safeRender("plan",()=>renderPlan()); safeRender("calendar",()=>renderCalendar()); safeRender("day-detail",()=>renderDayDetail()); safeRender("procrast",()=>renderProcrast());
  safeRender("subjects",()=>renderSubjects()); safeRender("reviews",()=>renderReviewQueue());
  safeRender("deneme-form",()=>renderDybRows()); safeRender("deneme-history",()=>renderDenemeHistory()); if(typeof renderExam2==="function")safeRender("deneme2",()=>renderExam2()); safeRender("compare",()=>renderCompareOpts()); safeRender("score",()=>renderScore()); safeRender("wrong-topics",()=>renderWrongTopics()); safeRender("blank-wrong",()=>renderBlankWrong());
  safeRender("pomo",()=>{renderPomo();if(typeof renderSw==="function")renderSw();}); safeRender("time-dist",()=>renderTimeDist());
  safeRender("books",()=>renderBooks()); safeRender("badges",()=>renderBadges()); safeRender("data",()=>renderData()); safeRender("settings",()=>renderSettings());
  if(typeof renderExtras==="function")safeRender("extras",()=>renderExtras());
  if(typeof renderRest==="function")safeRender("rest",()=>renderRest());
  if(typeof renderRound13==="function")safeRender("round13",()=>renderRound13());
  if(typeof renderRound14==="function")safeRender("round14",()=>renderRound14());
  if(typeof renderRound15==="function")safeRender("round15",()=>renderRound15());
  if(typeof renderRound16==="function")safeRender("round16",()=>renderRound16());
  if(typeof renderCamps==="function")safeRender("camps",()=>renderCamps());
  if(typeof renderRound18==="function")safeRender("round18",()=>renderRound18());
  if(typeof renderRound19==="function")safeRender("round19",()=>renderRound19());
  if(typeof applyRole==="function")safeRender("role",()=>applyRole());
  if(typeof renderNotifSettings==="function")safeRender("notifications",()=>renderNotifSettings());
  safeRender("infra",()=>renderInfraHealth());
  setTimeout(()=>{safeRender("chart",()=>drawChart());safeRender("subject-chart",()=>drawSubjChart());},50);
}
function boot(){
  applyTheme();
  const dd=el("denemeDate"); if(dd&&!dd.value)dd.value=todayKey();
  checkBadges(true);
  renderStartup();
  window.addEventListener("resize",()=>{
    if(el("deneme").classList.contains("active"))perfRAF("resize-charts",()=>{drawChart();drawSubjChart();});
  },{passive:true});
  window.addEventListener("beforeunload",()=>{ try{save();persistStateHashMaybe(lastPersistedJSON,true);}catch(e){} });
}
/* boot çağrısı app6 sonunda yapılır — yeni modülün sabitleri önce tanımlanmalı */
/* ==================================================================
   EK KATMAN — sistemleri birbirine bağlayan özellikler
   ================================================================== */

/* ---------- ders / konu yardımcıları ---------- */
function findSubj(name){
  for(let i=0;i<ALL_SUBJECTS.length;i++) if(ALL_SUBJECTS[i].name===name) return ALL_SUBJECTS[i];
  return null;
}
function topicKeyOf(subjName,topic){
  const s=findSubj(subjName); if(!s)return null;
  const hit=s.topics.find(t=>t.toLocaleLowerCase("tr")===String(topic).trim().toLocaleLowerCase("tr"));
  return hit?tkey(s.exam,s.name,hit):null;
}
function fillSubjSelect(id,ph){
  const sel=el(id); if(!sel||sel.options.length)return;
  sel.innerHTML='<option value="">'+(ph||"Ders seç…")+'</option>'+
    SUBJ_NAMES.map(n=>`<option value="${esc(n)}">${esc(n)}</option>`).join("");
}
function fillTopicDatalist(selId,dlId){
  const sel=el(selId),dl=el(dlId); if(!sel||!dl)return;
  const s=findSubj(sel.value);
  dl.innerHTML=s?s.topics.map(t=>`<option value="${esc(t)}">`).join(""):"";
}

/* ==================================================================
   1) KONU BAZLI SORU SAYISI
   ================================================================== */
function addTopicSolved(){
  if(typeof coachBlock==="function"&&coachBlock("soru kaydı"))return;
  const subj=(el("tsSubject").value||"").trim(),topic=(el("tsTopic").value||"").trim();
  const n=Math.max(1,parseInt(el("tsCount").value,10)||0);
  if(!subj||!topic){ toast("Ders ve konu gir"); return; }
  const k=todayKey(),real=topicKeyOf(subj,topic),key=real||("?|"+subj+"|"+topic);
  if(!S.solvedTopic[k])S.solvedTopic[k]={};
  S.solvedTopic[k][key]=(S.solvedTopic[k][key]||0)+n;
  S.solved[k]=(S.solved[k]||0)+n;
  if(real&&tget(real).st<2)tsetStatus(real,2);
  save();
  el("tsTopic").value=""; el("tsCount").value="";
  renderHome(); renderTopicSolved();
  if(el("topics").classList.contains("active"))renderSubjects();
  toast(n+" soru eklendi ✓");
}
function topicSolvedAgg(days){
  const agg={},t0=todayKey();
  for(let i=0;i<(days||90);i++){
    const m=S.solvedTopic[addDaysKey(t0,-i)];
    if(!m)continue;
    Object.keys(m).forEach(k=>{ agg[k]=(agg[k]||0)+(+m[k]||0); });
  }
  return agg;
}
function wrongAggByKey(){
  const agg={};
  S.wrongLog.forEach(w=>{
    const k=topicKeyOf(w.subject,w.topic)||("?|"+w.subject+"|"+w.topic);
    agg[k]=(agg[k]||0)+(+w.n||1);
  });
  return agg;
}
function totalTopicSolved(){ return sumVals(topicSolvedAgg(3650)); }
function renderTopicSolved(){
  const w=el("tsBox"); if(!w)return;
  fillSubjSelect("tsSubject");
  const agg=topicSolvedAgg(90),wr=wrongAggByKey();
  const keys=Object.keys(agg).sort((a,b)=>agg[b]-agg[a]);
  if(!keys.length){
    w.innerHTML='<div class="empty">Soru sayını konu konu girersen, hangi konuda ne kadar soru çözüp ne kadar hata yaptığın burada birleşir.</div>';
    return;
  }
  const max=agg[keys[0]]||1;
  let html='<div class="hbars">';
  keys.slice(0,15).forEach(k=>{
    const p=k.split("|"),nm=p[1]+" · "+p[2],q=agg[k],e=wr[k]||0;
    const rate=q?Math.round(e/q*100):0;
    const cls=rate>=30?"warn":"";
    html+=`<div class="hb"><span class="hl" style="min-width:126px">${esc(nm)}</span>
      <div class="ht"><i class="${cls}" style="width:${Math.round(q/max*100)}%"></i></div>
      <span class="hv">${q} soru${e?" · %"+rate+" hata":""}</span></div>`;
  });
  html+='</div><p class="hint">Kırmızı çubuk: yanlış oranı %30 üzerinde. Çok soru çözüp hâlâ hata yapıyorsan sorun soru sayısında değil, konunun kendisinde.</p>';
  w.innerHTML=html;
}

/* ==================================================================
   2) KONU BİTİŞ HEDEFİ
   ================================================================== */
function addTopicDeadline(){
  const subj=(el("dlSubject").value||"").trim(),topic=(el("dlTopic").value||"").trim(),d=el("dlDate").value;
  if(!subj||!topic||!d){ toast("Ders, konu ve tarih gir"); return; }
  const key=topicKeyOf(subj,topic);
  if(!key){ toast("Bu konu müfredatta bulunamadı"); return; }
  const t=Object.assign({st:0,conf:0,ts:null,rev:[]},S.topics[key]);
  t.dl=d; S.topics[key]=t; save();
  el("dlTopic").value=""; el("dlDate").value="";
  renderDeadlines(); renderSubjects(); renderHome();
  toast("Hedef tarih eklendi ✓");
}
function clearDeadline(key){
  const t=S.topics[key]; if(!t)return;
  const old=clone(t);
  delete t.dl;
  if(typeof logAdd==="function")logAdd("sil","Konu hedef tarihi silindi",{t:"topic",k:key,v:old});
  pushUndo("Hedef tarih silindi",()=>{ S.topics[key]=old; });
  if(t.st===0&&!t.conf)delete S.topics[key];
  save(); renderDeadlines(); renderSubjects(); renderHome();
}
function deadlineList(){
  const t0=todayKey(),out=[];
  Object.keys(S.topics).forEach(k=>{
    const t=S.topics[k]; if(!t||!t.dl)return;
    const p=k.split("|");
    out.push({key:k,subj:p[1],topic:p[2],dl:t.dl,st:t.st,
      left:diffKeys(t0,t.dl),done:t.st===3});
  });
  return out.sort((a,b)=>a.dl.localeCompare(b.dl));
}
function overdueTopics(){ return deadlineList().filter(x=>!x.done&&x.left<0); }
function renderDeadlines(){
  const w=el("dlBox"); if(!w)return;
  fillSubjSelect("dlSubject");
  const list=deadlineList();
  if(!list.length){ w.innerHTML='<div class="empty">Bir konuya bitiş tarihi verirsen, geciktiğinde ana ekranda uyarı çıkar.</div>'; return; }
  w.innerHTML=list.map(x=>{
    const st=x.done?"bitti":(x.left<0?Math.abs(x.left)+" gün gecikti":(x.left===0?"bugün":x.left+" gün kaldı"));
    const col=x.done?"var(--green)":(x.left<0?"var(--red)":(x.left<=3?"var(--ochre-ink)":"var(--ink2)"));
    return `<div class="dayrow"><span class="k">${esc(x.subj)} · ${esc(x.topic)}<br>
      <small style="color:var(--ink3)">${parseKey(x.dl).toLocaleDateString("tr-TR",{day:"numeric",month:"long"})}</small></span>
      <span class="v" style="color:${col}">${st}
      <button class="del" onclick="clearDeadline('${x.key.replace(/'/g,"\\'")}')">sil</button></span></div>`;
  }).join("");
}

/* ==================================================================
   3) KONU ARAMA
   ================================================================== */
let topicQuery="";
function setTopicQuery(v){
  topicQuery=(v||"").trim().toLocaleLowerCase("tr");
  renderSubjects();
}
function clearTopicQuery(){
  topicQuery=""; const i=el("topicSearch"); if(i)i.value="";
  renderSubjects();
}

/* ==================================================================
   4) YANLIŞ DEFTERİ → KONU BAĞLANTISI
   ================================================================== */
function linkWrongToTopic(subject,topic,n){
  const key=(typeof v26ResolveKey==="function"?v26ResolveKey(subject,topic):topicKeyOf(subject,topic));
  if(!key)return null;
  const t=S.topics[key];
  if(!t)return null;
  let changed=[];
  if(t.conf>0){ t.conf=Math.max(1,t.conf-1); changed.push("güven"); }
  if(t.st===3){ t.rev=[]; t.revDone={}; t.ts=todayKey(); changed.push("tekrar"); }
  save();
  return changed.length?{key:key,changed:changed}:null;
}

/* ==================================================================
   5) DERS EŞLEME + MARJİNAL FAYDA
   ================================================================== */
const SUBJ_GROUP={
  "Türkçe":["Türkçe"],
  "Sosyal Bilimler":["Tarih","Coğrafya","Felsefe","Din Kültürü"],
  "Temel Matematik":["Matematik","Geometri"],
  "Fen Bilimleri":["Fizik","Kimya","Biyoloji"],
  "Matematik":["Matematik (AYT)","Geometri (AYT)"],
  "Fizik":["Fizik (AYT)"],
  "Kimya":["Kimya (AYT)"],
  "Biyoloji":["Biyoloji (AYT)"],
  "Edebiyat":["Edebiyat"],
  "Tarih-1":["Tarih (AYT)"],
  "Coğrafya-1":["Coğrafya (AYT)"]
  ,"Tarih-2":["Tarih-2"],"Coğrafya-2":["Coğrafya-2"],
  "Felsefe Grubu":["Felsefe Grubu"],"Din Kültürü":["Din Kültürü (AYT)"],
  "Yabancı Dil":["Yabancı Dil"]
};
function subjWeights(){
  const w={};
  ["TYT","AYT","YDT"].forEach(tp=>DENEME_SUBJECTS[tp].forEach(pair=>{
    const g=SUBJ_GROUP[pair[0]]||[pair[0]];
    g.forEach(n=>{ w[n]=(w[n]||0)+pair[1]/g.length; });
  }));
  return w;
}
function subjectRates(){
  const acc={};
  S.denemeler.forEach(dn=>{
    if(!Array.isArray(dn.subjectResults))return;
    dn.subjectResults.forEach(sr=>{
      const cap=+sr.cap||0; if(!cap)return;
      const rate=Math.max(0,Math.min(1,sr.net/cap));
      const g=(dn.type==="BRANS")?[sr.name]:(SUBJ_GROUP[sr.name]||[sr.name]);
      g.forEach(n=>{
        if(!acc[n])acc[n]={sum:0,n:0};
        acc[n].sum+=rate; acc[n].n++;
      });
    });
  });
  const out={};
  Object.keys(acc).forEach(n=>{ out[n]={rate:acc[n].sum/acc[n].n,n:acc[n].n}; });
  return out;
}
function hoursBySubject(days){
  const agg={},t0=todayKey();
  for(let i=0;i<(days||60);i++){
    const m=S.pomoSubj[addDaysKey(t0,-i)];
    if(!m)continue;
    Object.keys(m).forEach(n=>{ agg[n]=(agg[n]||0)+(+m[n]||0); });
  }
  return agg;
}
function marginalGain(){
  const rates=subjectRates(),mins=hoursBySubject(60),w=subjWeights(),out=[];
  ALL_SUBJECTS.forEach(s=>{
    const weight=w[s.name]||0; if(!weight)return;
    let rate,src;
    if(rates[s.name]){ rate=rates[s.name].rate; src="deneme"; }
    else { rate=subjStat(s.exam,s).pct/100; src="konu"; }
    const hrs=(mins[s.name]||0)/60;
    const score=(1-rate)*weight/(hrs+2);
    out.push({name:s.name,exam:s.exam,rate:rate,hrs:r2(hrs),weight:r2(weight),score:score,src:src});
  });
  return out.sort((a,b)=>b.score-a.score);
}
function renderMarginal(){
  const w=el("mgBox"); if(!w)return;
  const list=marginalGain();
  if(!list.length){ w.innerHTML='<div class="empty">Deneme ve pomodoro verisi biriktikçe burada "bir saatini nereye koymalısın" cevabı çıkar.</div>'; return; }
  const max=list[0].score||1;
  let html='<div class="hbars">';
  list.slice(0,8).forEach(x=>{
    html+=`<div class="hb"><span class="hl" style="min-width:118px">${esc(x.name)}</span>
      <div class="ht"><i style="width:${Math.max(4,Math.round(x.score/max*100))}%"></i></div>
      <span class="hv">%${Math.round(x.rate*100)} · ${x.hrs} sa</span></div>`;
  });
  html+="</div>";
  const t=list[0];
  html+=`<p class="hint"><b>${esc(t.name)}</b> şu an en yüksek getirili yer: sınavdaki ağırlığı yüksek, başarı oranın %${Math.round(t.rate*100)} ve son 60 günde buna sadece ${t.hrs} saat ayırmışsın.
    Sıralama, dersin sınav ağırlığını ve eksik payını ayırdığın süreye böler — yani "en sevmediğin ders" değil, <b>en az emek karşılığı en çok net</b> getirecek ders üste çıkar.</p>`;
  w.innerHTML=html;
}

/* ==================================================================
   6) VERİMLİLİK SKORU
   ================================================================== */
function efficiency(type){
  const list=S.denemeler.filter(d=>d.type===(type||"TYT"))
    .sort((a,b)=>a.date.localeCompare(b.date)||a.id-b.id);
  if(list.length<2)return null;
  const half=Math.max(1,Math.floor(list.length/3));
  const first=list.slice(0,half),last=list.slice(-half);
  const avg=a=>a.reduce((x,d)=>x+d.totalNet,0)/a.length;
  const delta=r2(avg(last)-avg(first));
  const from=list[0].date,to=list[list.length-1].date;
  let min=0,k=from;
  while(k<=to){ min+=S.pomoMin[k]||0; k=addDaysKey(k,1); if(min>1e9)break; }
  const hrs=r2(min/60);
  return {delta:delta,hrs:hrs,perHour:hrs?r2(delta/hrs):null,from:from,to:to,n:list.length};
}
function renderEfficiency(){
  const w=el("effBox"); if(!w)return;
  const e=efficiency("TYT");
  if(!e){ w.innerHTML='<div class="empty">En az iki TYT denemesi girince, harcadığın saat başına kaç net kazandığın burada çıkar.</div>'; return; }
  let html=`<div class="dayrow"><span class="k">Net değişimi</span><span class="v" style="color:${e.delta>0?"var(--green)":e.delta<0?"var(--red)":"var(--ink3)"}">${e.delta>0?"+":""}${e.delta}</span></div>
    <div class="dayrow"><span class="k">Bu sürede çalışma</span><span class="v">${e.hrs} saat</span></div>`;
  if(e.perHour!=null){
    html+=`<div class="dayrow"><span class="k">Saat başına net</span><span class="v" style="color:${e.perHour>0?"var(--green)":"var(--ink3)"}">${e.perHour>0?"+":""}${e.perHour}</span></div>`;
    html+='<p class="hint">'+(e.perHour>0
      ? "Çalıştığın her saat ortalama "+e.perHour+" net getiriyor. Bu oran zamanla düşer — normaldir, kolay netler önce gelir."
      : "Bu dönemde saatler nete dönüşmemiş. Genelde sebebi ya çok pasif çalışma (izlemek/okumak) ya da yanlış konuya yüklenmek olur; yukarıdaki dağılıma bak.")+"</p>";
  }
  html+=`<p class="hint">${parseKey(e.from).toLocaleDateString("tr-TR",{day:"numeric",month:"long"})} – ${parseKey(e.to).toLocaleDateString("tr-TR",{day:"numeric",month:"long"})} arası, ${e.n} TYT denemesi.</p>`;
  w.innerHTML=html;
}

/* ==================================================================
   7) TERS HEDEF HESABI
   ================================================================== */
function currentSubjNets(type){
  const list=S.denemeler.filter(d=>d.type===type).sort((a,b)=>b.id-a.id).slice(0,3);
  if(!list.length)return null;
  const agg={};
  list.forEach(dn=>dn.subjectResults.forEach(sr=>{
    if(!agg[sr.name])agg[sr.name]={sum:0,n:0,cap:sr.cap};
    agg[sr.name].sum+=sr.net; agg[sr.name].n++;
  }));
  const out=[];
  DENEME_SUBJECTS[type].forEach(p=>{
    const a=agg[p[0]];
    out.push({name:p[0],cap:p[1],cur:a?r2(a.sum/a.n):0});
  });
  return out;
}
function reverseTarget(score,kind){
  const c=S.coef,obp=Math.max(0,Math.min(100,+S.obp||0))*c.obpK;
  const tytNet=recentAvgNet("TYT",3),aytNet=recentAvgNet("AYT",3);
  if(kind==="tyt"){
    const need=r2((score-c.tytBase-obp)/c.tytK);
    return {kind:"tyt",need:need,cur:tytNet,rows:currentSubjNets("TYT")};
  }
  if(tytNet==null)return {err:"Alan puanı için önce TYT denemesi gir."};
  const need=r2((score-c.ayBase-tytNet*c.ayTyt-obp)/c.ayAyt);
  return {kind:"ayt",need:need,cur:aytNet,tytNet:tytNet,rows:currentSubjNets("AYT")};
}
function distributeNet(rows,need){
  if(!rows)return null;
  const cur=rows.reduce((a,r)=>a+r.cur,0);
  const gap=need-cur;
  const room=rows.reduce((a,r)=>a+Math.max(0,r.cap-r.cur),0);
  return rows.map(r=>{
    const share=(gap>0&&room>0)?(Math.max(0,r.cap-r.cur)/room)*gap:0;
    return {name:r.name,cap:r.cap,cur:r2(r.cur),hedef:r2(Math.min(r.cap,r.cur+share)),fark:r2(share)};
  });
}
function renderReverse(){
  const w=el("rtBox"); if(!w)return;
  const score=parseFloat(el("rtScore").value);
  const kind=el("rtKind").value;
  if(isNaN(score)||score<=0){ w.innerHTML='<div class="empty">Hedeflediğin puanı yaz — bunun için ders ders kaç net gerektiğini hesaplayayım.</div>'; return; }
  const r=reverseTarget(score,kind);
  if(r.err){ w.innerHTML='<div class="empty">'+esc(r.err)+'</div>'; return; }
  const cur=r.cur;
  let html=`<div class="dayrow"><span class="k">Hedef puan</span><span class="v">${score}</span></div>
    <div class="dayrow"><span class="k">Gereken toplam net</span><span class="v" style="color:var(--ochre-ink)">${r.need}</span></div>`;
  if(cur!=null)html+=`<div class="dayrow"><span class="k">Şu anki ortalaman</span><span class="v">${cur}</span></div>
    <div class="dayrow"><span class="k">Kapatman gereken</span><span class="v" style="color:${r.need-cur>0?"var(--red)":"var(--green)"}">${r2(r.need-cur)>0?"+"+r2(r.need-cur):r2(r.need-cur)}</span></div>`;
  const dist=distributeNet(r.rows,r.need);
  if(dist){
    html+='<p class="eyebrow" style="margin:16px 0 6px;">Ders ders dağılım</p>';
    html+='<table><tr><th style="text-align:left">Ders</th><th>Şu an</th><th>Hedef</th><th>Fark</th></tr>';
    dist.forEach(d=>{
      html+=`<tr><td style="text-align:left">${esc(d.name)}</td><td>${d.cur}</td><td>${d.hedef}</td>
        <td style="color:${d.fark>0?"var(--ochre-ink)":"var(--ink3)"}">${d.fark>0?"+"+d.fark:"—"}</td></tr>`;
    });
    html+="</table>";
    html+='<p class="hint">Eksik net, her dersin <b>kalan boşluğuna</b> göre dağıtıldı — zaten dolu olan dersten ek net beklenmiyor. Katsayılar Puan sekmesinden değiştirilebilir, dolayısıyla bu da kaba bir tahmindir.</p>';
  } else {
    html+='<p class="hint">Bu türde deneme girince ders ders dağılım da çıkacak.</p>';
  }
  w.innerHTML=html;
}

/* ==================================================================
   8) YAYINEVİ KALİBRASYONU
   ================================================================== */
function publisherStats(type){
  const agg={};
  S.denemeler.filter(d=>d.type===type&&d.pub&&d.pub.trim()).forEach(d=>{
    const p=d.pub.trim();
    if(!agg[p])agg[p]={sum:0,n:0,min:Infinity,max:-Infinity};
    agg[p].sum+=d.totalNet; agg[p].n++;
    agg[p].min=Math.min(agg[p].min,d.totalNet);
    agg[p].max=Math.max(agg[p].max,d.totalNet);
  });
  return Object.keys(agg).map(p=>({pub:p,avg:r2(agg[p].sum/agg[p].n),n:agg[p].n,min:agg[p].min,max:agg[p].max}))
    .sort((a,b)=>b.avg-a.avg);
}
function renderPublishers(){
  const w=el("pubBox"); if(!w)return;
  const list=publisherStats(denemeType==="BRANS"?"TYT":denemeType);
  if(!list.length){ w.innerHTML='<div class="empty">Deneme kaydederken yayınevini de yazarsan, hangi yayının seni daha çok zorladığı burada görünür.</div>'; return; }
  let html='<table><tr><th style="text-align:left">Yayın</th><th>Deneme</th><th>Ort. net</th><th>En düşük–yüksek</th></tr>';
  list.forEach(x=>{
    html+=`<tr><td style="text-align:left">${esc(x.pub)}</td><td>${x.n}</td>
      <td style="font-weight:700">${x.avg}</td><td>${x.min}–${x.max}</td></tr>`;
  });
  html+="</table>";
  if(list.length>1){
    const d=r2(list[0].avg-list[list.length-1].avg);
    html+=`<p class="hint"><b>${esc(list[0].pub)}</b> ile <b>${esc(list[list.length-1].pub)}</b> arasında ${d} netlik fark var. Bu fark senin gelişimin değil, denemelerin zorluk farkı olabilir — ilerlemeyi ölçerken aynı yayının denemelerini kendi içinde karşılaştır.</p>`;
  }
  w.innerHTML=html;
}

/* ==================================================================
   9) DENEME SONRASI RİTÜEL
   ================================================================== */
let lastDenemeId=null;
function showRefl(id){
  lastDenemeId=id;
  const b=el("reflBox"); if(!b)return;
  b.style.display="block";
  el("rfHard").value=""; el("rfTime").value="yetti"; el("rfChange").value="";
}
function saveRefl(){
  const d=S.denemeler.find(x=>x.id===lastDenemeId);
  if(!d){ toast("Deneme bulunamadı"); return; }
  d.refl={hard:(el("rfHard").value||"").trim(),time:el("rfTime").value,change:(el("rfChange").value||"").trim()};
  save(); el("reflBox").style.display="none";
  renderReflList(); renderDenemeHistory(); toast("Not kaydedildi ✓");
}
function skipRefl(){ const b=el("reflBox"); if(b)b.style.display="none"; }
function renderReflList(){
  const w=el("reflList"); if(!w)return;
  const list=S.denemeler.filter(d=>d.refl&&(d.refl.hard||d.refl.change))
    .sort((a,b)=>b.date.localeCompare(a.date)||b.id-a.id).slice(0,10);
  if(!list.length){ w.innerHTML='<div class="empty">Deneme kaydettikten sonra üç kısa soru sorulur. Cevapların burada birikir; birkaç ay sonra tekrar eden kalıbı görürsün.</div>'; return; }
  const timeAgg={};
  S.denemeler.forEach(d=>{ if(d.refl&&d.refl.time)timeAgg[d.refl.time]=(timeAgg[d.refl.time]||0)+1; });
  let html="";
  const yet=timeAgg["yetmedi"]||0,tot=(timeAgg["yetti"]||0)+yet+(timeAgg["zor"]||0);
  if(tot>=3)html+=`<p class="hint" style="margin-top:0">Son denemelerin ${tot} tanesinde süre sorusu cevaplanmış; ${yet} tanesinde süre yetmemiş.${yet/tot>=0.5?" Süre yönetimi tekrar eden bir sorun gibi görünüyor — deneme çözerken bölüm bölüm süre tut.":""}</p>`;
  html+=list.map(d=>{
    const dt=parseKey(d.date).toLocaleDateString("tr-TR",{day:"numeric",month:"short"});
    return `<div class="revrow"><div>
      <div class="rt">${esc(d.name)} · ${dt}</div>
      <div class="rm">${d.refl.hard?"Zorlandığı: "+esc(d.refl.hard)+" · ":""}Süre: ${esc(d.refl.time)}${d.refl.change?"<br>Değiştireceği: "+esc(d.refl.change):""}</div>
    </div></div>`;
  }).join("");
  w.innerHTML=html;
}

/* ==================================================================
   10) SINAV SİMÜLASYONU
   ================================================================== */
let simTimer=null,simLeft=0,simTotal=0,simWarned={},simSec=-1;
function startSim(min){
  const m=Math.max(1,parseInt(min,10)||0);
  if(!m)return;
  S.simulMin=m; save();
  simTotal=m*60; simLeft=simTotal; simWarned={}; simSec=-1;
  el("simOverlay").style.display="flex";
  ensureAudio();
  renderSim();
  clearInterval(simTimer);
  simTimer=setInterval(()=>{
    simLeft--;
    if(simLeft<=0){
      clearInterval(simTimer); simTimer=null;
      beep(4); try{ if(navigator.vibrate)navigator.vibrate([300,120,300]); }catch(e){}
      el("simTime").textContent="00:00";
      el("simHint").textContent="Süre bitti. Kalemleri bırak.";
      return;
    }
    const passed=simTotal-simLeft;
    if(!simWarned.half&&passed>=simTotal/2){ simWarned.half=1; beep(1); }
    if(!simWarned.last15&&simLeft<=900){ simWarned.last15=1; beep(2); }
    if(!simWarned.last5&&simLeft<=300){ simWarned.last5=1; beep(3); }
    renderSim();
  },1000);
}
function renderSim(){
  const h=Math.floor(simLeft/3600),m=Math.floor((simLeft%3600)/60),s=simLeft%60;
  el("simTime").textContent=(h?String(h)+":":"")+String(m).padStart(2,"0")+":"+String(s).padStart(2,"0");
  const pct=simTotal?Math.round((simTotal-simLeft)/simTotal*100):0;
  el("simBar").style.width=pct+"%";
  let hint="Kalan süreyi bölümlere böl, tıkandığın soruda durma.";
  const sec=(typeof simCurrentSection==="function")?simCurrentSection(simTotal-simLeft):null;
  if(sec){
    const m=Math.floor(sec.leftInSection/60),ss=sec.leftInSection%60;
    if(sec.over)hint="Planladığın bölüm süreleri doldu — kalan zamanı boşlara ayır.";
    else hint=(sec.i+1)+"/"+sec.total+" · "+sec.name+" için "+
      (m?m+" dk ":"")+String(ss).padStart(2,"0")+" sn kaldı";
    if(!simWarned["s"+sec.i]&&sec.leftInSection<=0){ simWarned["s"+sec.i]=1; beep(2); }
    if(simSec!==sec.i){ if(simSec>=0){ beep(2); toast(sec.name+" bölümüne geç"); } simSec=sec.i; }
  }
  if(simLeft<=300)hint="Son 5 dakika — optiği kontrol et.";
  else if(simLeft<=900&&!sec)hint="Son 15 dakika — boş bıraktıklarına dön.";
  el("simHint").textContent=hint;
}
function stopSim(){
  clearInterval(simTimer); simTimer=null;
  el("simOverlay").style.display="none";
}
function finishSim(){
  stopSim(); go("deneme");
  toast("Netlerini şimdi gir");
}
function simCustom(){
  const v=parseInt(el("simMin").value,10);
  if(!v||v<1){ toast("Süre gir"); return; }
  startSim(v);
}

/* ==================================================================
   11) CSV DIŞA AKTARIM
   ================================================================== */
function csvCell(v){
  const s=String(v==null?"":v);
  return /[",;\n]/.test(s)?'"'+s.replace(/"/g,'""')+'"':s;
}
function downloadText(name,text,mime){
  const b=new Blob(["\ufeff"+text],{type:(mime||"text/csv")+";charset=utf-8"});
  const a=document.createElement("a");
  a.href=URL.createObjectURL(b); a.download=name;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  setTimeout(()=>URL.revokeObjectURL(a.href),1000);
}
function buildDayCSV(){
  const days=new Set([].concat(Object.keys(S.solved),Object.keys(S.pomoMin),Object.keys(S.journal)));
  const rows=[["tarih","soru","dakika","gun_tamamlandi","bolunme","gunluk"]];
  [...days].sort().forEach(k=>{
    rows.push([k,S.solved[k]||0,S.pomoMin[k]||0,dayDone(k)?"evet":"hayir",S.pauses[k]||0,S.journal[k]||""]);
  });
  return rows.map(r=>r.map(csvCell).join(";")).join("\n");
}
function buildDenemeCSV(){
  const rows=[["tarih","tur","deneme","yayin","sure_dk","ders","dogru","yanlis","bos","net","toplam_net"]];
  S.denemeler.slice().sort((a,b)=>a.date.localeCompare(b.date)).forEach(d=>{
    (d.subjectResults||[]).forEach(sr=>{
      rows.push([d.date,d.type,d.name,d.pub||"",d.dur||"",sr.name,sr.d,sr.y,sr.b,sr.net,d.totalNet]);
    });
  });
  return rows.map(r=>r.map(csvCell).join(";")).join("\n");
}
function buildTopicCSV(){
  const rows=[["sinav","ders","konu","kademe","guven","tamamlanma_tarihi","tekrar_sayisi","hedef_tarih","cozulen_soru","yanlis"]];
  const q=topicSolvedAgg(3650),wr=wrongAggByKey();
  ALL_SUBJECTS.forEach(s=>s.topics.forEach(tp=>{
    const k=tkey(s.exam,s.name,tp),t=S.topics[k];
    if(!t&&!q[k]&&!wr[k])return;
    const tt=t||{st:0,conf:0,ts:"",rev:[]};
    rows.push([s.exam,s.name,tp,ST_LABEL[tt.st],tt.conf,tt.ts||"",(tt.rev||[]).length,tt.dl||"",q[k]||0,wr[k]||0]);
  }));
  return rows.map(r=>r.map(csvCell).join(";")).join("\n");
}
function exportCSV(kind){
  let txt,name;
  if(kind==="gun"){ txt=buildDayCSV(); name="yks-gunluk-"+todayKey()+".csv"; }
  else if(kind==="deneme"){ txt=buildDenemeCSV(); name="yks-denemeler-"+todayKey()+".csv"; }
  else { txt=buildTopicCSV(); name="yks-konular-"+todayKey()+".csv"; }
  downloadText(name,txt);
  toast("CSV indirildi");
}

/* ==================================================================
   12) YAZI BOYUTU
   ================================================================== */
const FONT_STEPS=[0.9,1,1.15,1.3];
function applyFontScale(){
  const v=S.fontScale||1;
  const wrap=el("mainWrap");
  if(wrap)wrap.style.zoom=v===1?"":String(v);
  FONT_STEPS.forEach((f,i)=>{ const b=el("fz"+i); if(b)b.classList.toggle("on",Math.abs(f-v)<0.001); });
  const h=el("fzHint");
  if(h)h.textContent=v===1?"Normal boyut.":(v<1?"Daha küçük — ekrana daha çok içerik sığar.":"Daha büyük — uzun oturumlarda göz daha az yorulur.");
}
function setFontScale(v){ S.fontScale=v; save(); applyFontScale(); }

/* ==================================================================
   13) ARAYÜZ: AÇILIR BÖLÜMLER VE ÜST ÇUBUK
   ================================================================== */
const NAV_TITLES={home:"Bugün",program:"Program",topics:"Konular",deneme:"Denemeler",pomo:"Odak",more:"Daha"};
function updateNav(id){
  const t=el("navTitle");
  if(t)t.textContent=NAV_TITLES[id]||"YKS";
}
function toggleFold(name){
  const h=el("fh_"+name),b=el("fb_"+name);
  if(!h||!b)return;
  const open=!b.classList.contains("open");
  b.classList.toggle("open",open);
  h.classList.toggle("open",open);
  h.setAttribute("aria-expanded",open?"true":"false");
}
function openFold(name){
  const h=el("fh_"+name),b=el("fb_"+name);
  if(!h||!b)return;
  b.classList.add("open"); h.classList.add("open");
  h.setAttribute("aria-expanded","true");
}

function initA11y(){
  document.querySelectorAll(".foldhead").forEach(h=>{
    const body=h.id&&el("fb_"+h.id.replace(/^fh_/,""));
    h.setAttribute("aria-expanded",body&&body.classList.contains("open")?"true":"false");
    if(body){ if(!body.id)body.id="fold_"+Math.random().toString(36).slice(2); h.setAttribute("aria-controls",body.id); }
  });
  document.querySelectorAll("label:not([for])").forEach((lab,i)=>{
    let c=lab.nextElementSibling;
    if(!c||!/^(INPUT|SELECT|TEXTAREA)$/.test(c.tagName))c=lab.parentElement&&lab.parentElement.querySelector("input,select,textarea");
    if(!c)return;
    if(!c.id)c.id="field_auto_"+i;
    lab.htmlFor=c.id;
  });
  const overlays=document.querySelectorAll(".simov,.qaviewer,.wizov,.brov,.vidov,.playov,.gunov,.optikov,.anaov");
  overlays.forEach(o=>{ o.setAttribute("role","dialog"); o.setAttribute("aria-modal","true"); o.tabIndex=-1; });
  document.querySelectorAll(".tg").forEach(t=>{
    t.setAttribute("role","switch"); t.tabIndex=0;
    t.setAttribute("aria-checked",t.classList.contains("on")?"true":"false");
    t.addEventListener("keydown",e=>{ if(e.key===" "||e.key==="Enter"){ e.preventDefault(); t.click(); } });
    new MutationObserver(()=>t.setAttribute("aria-checked",t.classList.contains("on")?"true":"false"))
      .observe(t,{attributes:true,attributeFilter:["class"]});
  });
}

/* ==================================================================
   BAŞLATMA (tüm dosyalar yüklendikten sonra)
   ================================================================== */
function renderExtras(){
  renderTopicSolved(); renderDeadlines();
  renderMarginal(); renderEfficiency(); renderReverse();
  renderPublishers(); renderReflList();
  applyFontScale();
}
function boot2(){
  boot();
  applyFontScale();
  perfIdle("boot-extras",()=>renderExtras(),700);
  updateNav("home");
}
/* boot çağrısı app7 sonunda yapılır */
/* ==================================================================
   BULUT EŞİTLEMESİ KALDIRILDI
   Uygulama tamamen bu cihazda çalışır. Yedekleme için Daha › Veri
   bölümündeki JSON dışa/içe aktarma kullanılır.
   ================================================================== */
function boot3(){ boot2(); }
/* boot çağrısı app8 sonunda yapılır */
/* ==================================================================
   YANLIŞ SORU ARŞİVİ + DİNLENME KORUMASI
   ================================================================== */

/* ---------- depolama ölçümü ---------- */
function storageBytes(){
  try{
    return new Blob([localStorage.getItem("yks")||"",localStorage.getItem("yks_yedek")||""]).size;
  }catch(e){ return 0; }
}
function fmtKB(b){
  if(b<1024)return b+" B";
  if(b<1048576)return Math.round(b/1024)+" KB";
  return (b/1048576).toFixed(1)+" MB";
}
const QA_WARN=3500000, QA_BLOCK=4500000, QA_MAXPX=900, QA_QUALITY=0.55;

/* ---------- fotoğraf küçültme ---------- */
function compressImage(file){
  return new Promise((resolve,reject)=>{
    if(!file){ reject(new Error("Dosya yok")); return; }
    if(file.size&&file.size>12000000){ reject(new Error("Fotoğraf çok büyük (12 MB üstü)")); return; }
    const fr=new FileReader();
    fr.onerror=()=>reject(new Error("Fotoğraf okunamadı"));
    fr.onload=()=>{
      const raw=String(fr.result||"");
      if(raw.indexOf("data:image")!==0){ reject(new Error("Bu bir resim dosyası değil")); return; }
      let done=false;
      const finish=v=>{ if(!done){ done=true; resolve(v); } };
      /* tarayıcı canvas veremezse ham veriyle devam et */
      let img;
      try{ img=new Image(); }catch(e){ finish(raw); return; }
      img.onerror=()=>finish(raw);
      img.onload=()=>{
        try{
          const cv=document.createElement("canvas");
          const ctx=cv.getContext?cv.getContext("2d"):null;
          if(!ctx||!img.width||!img.height){ finish(raw); return; }
          const sc=Math.min(1,QA_MAXPX/Math.max(img.width,img.height));
          cv.width=Math.max(1,Math.round(img.width*sc));
          cv.height=Math.max(1,Math.round(img.height*sc));
          ctx.drawImage(img,0,0,cv.width,cv.height);
          const out=cv.toDataURL("image/jpeg",QA_QUALITY);
          finish(out&&out.length>32?out:raw);
        }catch(e){ finish(raw); }
      };
      setTimeout(()=>finish(raw),4000);   /* yükleme takılırsa bekletme */
      img.src=raw;
    };
    fr.readAsDataURL(file);
  });
}

/* ---------- ekleme ---------- */
let qaPending=null;
function qaPickFile(inp){
  const f=inp.files&&inp.files[0];
  inp.value="";
  if(!f)return;
  if(storageBytes()>QA_BLOCK){ toast("Depolama dolu — önce eski soruları sil"); return; }
  toast("Fotoğraf işleniyor…");
  compressImage(f).then(dataUrl=>{
    qaPending=dataUrl;
    const p=el("qaPreview");
    if(p){ p.innerHTML='<img src="'+dataUrl+'" alt="önizleme">'; p.style.display="block"; }
    const b=el("qaSaveBtn"); if(b)b.disabled=false;
    toast("Fotoğraf hazır · bilgileri doldur");
  }).catch(e=>toast(String(e.message||e)));
}
function qaClearPending(){
  qaPending=null;
  const p=el("qaPreview"); if(p){ p.innerHTML=""; p.style.display="none"; }
  const b=el("qaSaveBtn"); if(b)b.disabled=true;
}
function qaAdd(){
  if(!qaPending){ toast("Önce sorunun fotoğrafını ekle"); return; }
  const subject=(el("qaSubject").value||"").trim();
  const topic=(el("qaTopic").value||"").trim();
  const note=(el("qaNote").value||"").trim().slice(0,300);
  if(!subject){ toast("Ders seç"); return; }
  const est=storageBytes()+qaPending.length;
  if(est>QA_BLOCK){ toast("Depolama sınırına gelindi — eski soruları sil"); return; }
  S.qbank.push({id:Date.now(),date:todayKey(),subject:subject,topic:topic,note:note,img:qaPending,done:false});
  /* yanlış defteriyle bağlantı: konu verildiyse hata sayısına da işlensin */
  if(topic){
    S.wrongLog.push({id:Date.now()+1,date:todayKey(),subject:subject,topic:topic,n:1});
    if(typeof linkWrongToTopic==="function")linkWrongToTopic(subject,topic,1);
  }
  save();
  qaClearPending();
  el("qaTopic").value=""; el("qaNote").value="";
  renderQbank(); renderWrongTopics();
  if(typeof renderTopicSolved==="function")renderTopicSolved();
  if(storageBytes()>QA_WARN)toast("Kaydedildi · depolama doluyor ("+fmtKB(storageBytes())+")");
  else toast("Soru arşive eklendi ✓");
}
function qaDelete(id){
  if(!confirm("Bu soru arşivden silinsin mi?"))return;
  const bk=clone(S.qbank.find(q=>q.id===id));
  S.qbank=S.qbank.filter(q=>q.id!==id);
  save();
  if(bk)pushUndo("Soru silindi",()=>{ S.qbank.push(bk); });
  qaCloseViewer(); renderQbank();
}
function qaToggleDone(id){
  const q=S.qbank.find(x=>x.id===id); if(!q)return;
  q.done=!q.done; save(); renderQbank();
  if(qaViewList.length)qaShowViewer(qaViewIdx);
  toast(q.done?"Çözüldü olarak işaretlendi":"Tekrar açık olarak işaretlendi");
}
function qaFilterList(){
  const sub=(el("qaFilter")&&el("qaFilter").value)||"";
  const only=(el("qaOnly")&&el("qaOnly").value)||"acik";
  return S.qbank.slice().reverse().filter(q=>{
    if(sub&&q.subject!==sub)return false;
    if(only==="acik"&&q.done)return false;
    if(only==="cozdum"&&!q.done)return false;
    return true;
  });
}
function renderQbank(){
  const sel=el("qaSubject");
  if(sel&&!sel.options.length)
    sel.innerHTML='<option value="">Ders seç…</option>'+SUBJ_NAMES.map(n=>`<option value="${esc(n)}">${esc(n)}</option>`).join("");
  const f=el("qaFilter");
  if(f&&f.options.length<=1)
    f.innerHTML='<option value="">Tüm dersler</option>'+SUBJ_NAMES.map(n=>`<option value="${esc(n)}">${esc(n)}</option>`).join("");

  const st=el("qaStats");
  if(st){
    const open=S.qbank.filter(q=>!q.done).length;
    st.textContent=S.qbank.length
      ? S.qbank.length+" soru · "+open+" tanesi açık · depolama "+fmtKB(storageBytes())
      : "Arşiv boş.";
    st.style.color=storageBytes()>QA_WARN?"var(--danger)":"var(--label-3)";
  }
  const g=el("qaGrid"); if(!g)return;
  const list=qaFilterList();
  if(!list.length){
    g.innerHTML='<div class="empty">Yanlış yaptığın soruların fotoğrafını buraya ekle. Sınavdan bir ay önce hepsine tek yerden bakmak, baştan konu tekrarı yapmaktan çok daha hızlıdır.</div>';
    return;
  }
  g.innerHTML=list.map((q,i)=>
    `<button class="qacard ${q.done?"qdone":""}" onclick="qaOpen(${q.id})">
       <img src="${q.img}" alt="${esc(q.subject)}" loading="lazy">
       <span class="qmeta">${esc(q.subject)}${q.topic?" · "+esc(q.topic):""}</span>
       ${q.done?'<span class="qtick">✓</span>':""}
     </button>`).join("");
}

/* ---------- görüntüleyici ---------- */
let qaViewList=[],qaViewIdx=0;
function qaOpen(id){
  qaViewList=qaFilterList();
  qaViewIdx=Math.max(0,qaViewList.findIndex(q=>q.id===id));
  qaShowViewer(qaViewIdx);
}
function qaReviewMode(){
  const list=S.qbank.filter(q=>!q.done);
  if(!list.length){ toast("Açık soru kalmamış 🎉"); return; }
  for(let i=list.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); const t=list[i]; list[i]=list[j]; list[j]=t; }
  qaViewList=list; qaViewIdx=0; qaShowViewer(0);
  toast(list.length+" açık soru · karışık sırayla");
}
function qaShowViewer(i){
  if(!qaViewList.length)return;
  qaViewIdx=Math.max(0,Math.min(qaViewList.length-1,i));
  const q=qaViewList[qaViewIdx];
  const ov=el("qaViewer"); if(!ov)return;
  ov.style.display="flex";
  el("qaImg").src=q.img;
  el("qaInfo").textContent=q.subject+(q.topic?" · "+q.topic:"")+" · "+
    parseKey(q.date).toLocaleDateString("tr-TR",{day:"numeric",month:"long"});
  el("qaNoteView").textContent=q.note||"";
  el("qaCount").textContent=(qaViewIdx+1)+" / "+qaViewList.length;
  el("qaDoneBtn").textContent=q.done?"Tekrar aç":"Çözdüm";
  el("qaDoneBtn").className=q.done?"btn ghost small":"btn green small";
}
function qaNext(n){
  if(!qaViewList.length)return;
  qaShowViewer((qaViewIdx+n+qaViewList.length)%qaViewList.length);
}
function qaCloseViewer(){ const ov=el("qaViewer"); if(ov)ov.style.display="none"; }
function qaViewerDone(){ if(qaViewList[qaViewIdx])qaToggleDone(qaViewList[qaViewIdx].id); }
function qaViewerDelete(){ if(qaViewList[qaViewIdx])qaDelete(qaViewList[qaViewIdx].id); }

/* ==================================================================
   DİNLENME KORUMASI
   ================================================================== */
function hadActivity(k){
  return (S.solved[k]||0)>0 || (S.pomoMin[k]||0)>0 || dayDone(k);
}
function studyStreakDays(){
  let n=0,k=todayKey();
  if(!hadActivity(k))k=addDaysKey(k,-1);
  while(hadActivity(k)){ n++; k=addDaysKey(k,-1); if(n>400)break; }
  return n;
}
function lastRestDay(){
  let k=addDaysKey(todayKey(),-1);
  for(let i=0;i<400;i++){
    if(!hadActivity(k))return k;
    k=addDaysKey(k,-1);
  }
  return null;
}
function weekMinutes(){
  const mon=keyOf(mondayOf(new Date()));
  let m=0;
  for(let i=0;i<7;i++)m+=S.pomoMin[addDaysKey(mon,i)]||0;
  return m;
}
function restAdvice(){
  const days=studyStreakDays(),wm=weekMinutes();
  if(days>=12)return {lvl:2,days:days,
    txt:days+" gündür hiç ara vermemişsin. Bu tempoyu sınava kadar sürdürmek çoğu insanda mümkün olmuyor; bir günlük tam mola, ertesi hafta daha verimli çalışmanı sağlar."};
  if(wm>=2700)return {lvl:2,days:days,
    txt:"Bu hafta "+fmtHM(wm)+" çalışmışsın. Bu noktadan sonra saat eklemek genelde net getirmiyor — uyku ve dinlenme daha çok getiriyor."};
  if(days>=8)return {lvl:1,days:days,
    txt:days+" gündür aralıksız çalışıyorsun. Yakında bir gün tamamen boş bırakmayı planla."};
  return null;
}
function renderRest(){
  const box=el("restBanner"); if(!box)return;
  const a=restAdvice();
  const snoozed=S.restSnooze===todayKey();
  if(!a||snoozed){ box.style.display="none"; return; }
  box.style.display="block";
  box.className="restcard lvl"+a.lvl;
  const lr=lastRestDay();
  box.innerHTML='<div class="rt">'+(a.lvl===2?"Mola vakti":"Dinlenmeyi planla")+'</div>'+
    '<p class="rp">'+esc(a.txt)+'</p>'+
    (lr?'<p class="rs">Son tam dinlenme günün: '+parseKey(lr).toLocaleDateString("tr-TR",{day:"numeric",month:"long"})+'</p>':"")+
    '<button class="btn ghost tiny" onclick="restSnooze()">Bugünlük gizle</button>';
}
function restSnooze(){ S.restSnooze=todayKey(); save(); renderRest(); }

/* ==================================================================
   BAŞLATMA
   ================================================================== */
function boot4(){
  boot3();
  perfIdle("boot-qbank",()=>renderQbank(),900); renderRest();
  /* sekme geri gelince sayaç gerçek saate göre düzeltilsin */
  document.addEventListener("visibilitychange",()=>{
    if(!document.hidden){
      if(typeof pomoState!=="undefined"&&pomoState==="running")pomoTick();
      renderRest();
    }
  });
}
/* boot çağrısı app9 sonunda yapılır */
/* ==================================================================
   HIZLI SÜRE AYARI + KRONOMETRE
   ================================================================== */

/* ---------- odak ekranı kipi ---------- */
function setFocusMode(m,noSave){
  S.focus.mode=(m==="sw")?"sw":"pomo";
  if(!noSave)save();
  const sp=el("segPomo"),ss=el("segStop");
  if(sp)sp.classList.toggle("on",S.focus.mode==="pomo");
  if(ss)ss.classList.toggle("on",S.focus.mode==="sw");
  const a=el("focusPomo"),b=el("focusStop");
  if(a)a.style.display=S.focus.mode==="pomo"?"block":"none";
  if(b)b.style.display=S.focus.mode==="sw"?"block":"none";
  if(S.focus.mode==="sw")renderSw(); else renderPomo();
}

/* ---------- hızlı süre ayarı ---------- */
const QUICK_MINS=[15,25,45,60];
function quickPhaseName(){ return pomoIsWork?"çalışma":"mola"; }
function currentPhaseMin(){ return pomoIsWork?S.workMin:(isLongBreakNext()?S.focus.longBreak:S.breakMin); }
function setPhaseMin(n){
  n=Math.max(1,Math.min(180,n|0));
  if(pomoState!=="idle"){ toast("Süreyi değiştirmek için önce sıfırla"); return; }
  if(pomoIsWork)S.workMin=n;
  else if(isLongBreakNext())S.focus.longBreak=n;
  else S.breakMin=n;
  save();
  pomoTotal=pomoPhaseMin(pomoIsWork)*60; pomoLeft=pomoTotal;
  renderPomo();
  toast(n+" dakika · "+quickPhaseName());
}
function adjustPhaseMin(d){ setPhaseMin(currentPhaseMin()+d); }
function renderQuick(){
  const w=el("quickMins"); if(!w)return;
  const cur=currentPhaseMin();
  w.innerHTML=QUICK_MINS.map(n=>
    `<button class="qbtn ${n===cur?"on":""}" onclick="setPhaseMin(${n})">${n}</button>`).join("");
  const lab=el("quickLabel");
  if(lab)lab.textContent=(pomoIsWork?"Çalışma":"Mola")+" süresi · "+cur+" dk";
  const box=el("quickWrap");
  if(box)box.style.opacity=pomoState==="idle"?"1":".45";
}

/* ==================================================================
   KRONOMETRE
   ================================================================== */
let swTimer=null;
function sw(){
  if(!S.focus.sw||typeof S.focus.sw!=="object")S.focus.sw={run:false,start:0,acc:0,cr:0};
  return S.focus.sw;
}
function swElapsedAt(s,now){
  s=s||sw(); now=Number(now||Date.now());
  const acc=Math.max(0,Number(s.acc)||0);
  if(!s.run)return acc;
  const start=Number(s.start)||0;
  /* Bozuk/eski bir başlangıç damgası kronometreyi zıplatmasın. */
  if(!start||start>now+1000)return acc;
  return Math.max(0,acc+(now-start));
}
function swElapsed(){ return swElapsedAt(sw(),Date.now()); }
function fmtSw(ms){
  const t=Math.floor(ms/1000),h=Math.floor(t/3600),m=Math.floor((t%3600)/60),s=t%60;
  return (h?h+":"+String(m).padStart(2,"0"):String(m).padStart(2,"0"))+":"+String(s).padStart(2,"0");
}
/* salise: gerçek kronometre görünümü için */
function fmtSwCs(ms){
  return String(Math.floor((ms%1000)/10)).padStart(2,"0");
}
function swCreditElapsed(ms){
  if(typeof isCoach==="function"&&isCoach())return false;
  const s=sw(),mins=Math.floor(Math.max(0,Number(ms)||0)/60000),add=mins-(s.cr|0);
  if(add<=0)return false;
  s.cr=mins;
  const k=todayKey();
  S.pomoMin[k]=(S.pomoMin[k]||0)+add;
  if(!S.pomoSubj[k])S.pomoSubj[k]={};
  S.pomoSubj[k][pomoSubject||SUBJ_NAMES[0]]=(S.pomoSubj[k][pomoSubject||SUBJ_NAMES[0]]||0)+add;
  return true;
}
function swCredit(){
  const changed=swCreditElapsed(swElapsed());
  if(changed)save();
  return changed;
}
function swHistoryAdd(ms,subj,start,end){
  ms=Math.max(0,Math.floor(Number(ms)||0)); if(ms<1000)return false;
  end=Number(end)||Date.now(); start=Number(start)||Math.max(0,end-ms);
  if(!S.swHistory||typeof S.swHistory!=="object"||Array.isArray(S.swHistory))S.swHistory={};
  const k=keyOf(new Date(end)); if(!Array.isArray(S.swHistory[k]))S.swHistory[k]=[];
  S.swHistory[k].push({id:end+S.swHistory[k].length,at:start,end:end,ms:ms,subj:String(subj||"Ders").slice(0,60)});
  if(S.swHistory[k].length>40)S.swHistory[k]=S.swHistory[k].slice(-40);
  const days=Object.keys(S.swHistory).sort(); while(days.length>60)delete S.swHistory[days.shift()];
  return true;
}
function swHistoryFlat(limit){
  const out=[]; Object.keys(S.swHistory||{}).sort().reverse().forEach(k=>{
    (S.swHistory[k]||[]).slice().reverse().forEach(x=>out.push(Object.assign({day:k},x)));
  });
  return out.slice(0,limit||30);
}
function clearSwHistory(){
  const n=swHistoryFlat(9999).length; if(!n){toast("Kronometre geçmişi zaten boş");return;}
  if(!confirm(n+" kronometre kaydı silinsin mi? Çalışma dakikaların silinmez."))return;
  S.swHistory={}; save(); renderSwHistory(); toast("Kronometre geçmişi temizlendi");
}
function delSwHistory(day,id){
  if(!S.swHistory||!Array.isArray(S.swHistory[day]))return;
  S.swHistory[day]=S.swHistory[day].filter(x=>String(x.id)!==String(id));
  if(!S.swHistory[day].length)delete S.swHistory[day]; save(); renderSwHistory();
}
function renderSwHistory(){
  const w=el("swHistory"); if(!w)return;
  const rows=swHistoryFlat(24);
  if(!rows.length){w.innerHTML='<div class="empty">Henüz kronometre oturumu yok. Duraklattığın her çalışma parçası burada kalıcı olarak görünür.</div>';return;}
  const today=todayKey(),todayRows=(S.swHistory&&S.swHistory[today])||[];
  const todayMs=todayRows.reduce((a,x)=>a+(Number(x.ms)||0),0);
  const totalMs=Object.keys(S.swHistory||{}).reduce((a,k)=>a+(S.swHistory[k]||[]).reduce((b,x)=>b+(Number(x.ms)||0),0),0);
  let html='<div class="sw-history-summary"><div class="mini"><b>'+fmtSw(todayMs)+'</b><span>bugün kronometre</span></div><div class="mini"><b>'+fmtHM(Math.floor(totalMs/60000))+'</b><span>geçmiş toplamı</span></div></div>';
  let lastDay=""; rows.forEach(x=>{
    if(x.day!==lastDay){lastDay=x.day;const d=parseKey(x.day);html+='<div class="sw-history-day">'+(x.day===today?'Bugün':d.toLocaleDateString("tr-TR",{day:"numeric",month:"long"}))+'</div>';}
    const at=x.at?new Date(x.at):null,when=at&&!isNaN(at)?at.toLocaleTimeString("tr-TR",{hour:"2-digit",minute:"2-digit"}):"";
    html+=`<div class="sw-history-row"><div class="main"><div class="subj">${esc(x.subj||"Ders")}</div><div class="when">${when}</div></div><div class="dur">${fmtSw(x.ms||0)}</div><button class="del" onclick="delSwHistory('${x.day}',${Number(x.id)||0})">Sil</button></div>`;
  });
  w.innerHTML=html;
}
function swTick(){
  const s=sw();
  /* Duraklatılmış kronometrenin eski interval'i kalmış olsa bile burada kes. */
  if(!s.run){ clearInterval(swTimer); swTimer=null; return; }
  swCredit(); renderSwLive();
}
function swStart(){
  if(typeof coachBlock==="function"&&coachBlock("kronometre"))return;
  const s=sw();
  if(s.run)return;
  s.run=true; s.start=Date.now(); save();
  ensureAudio(); requestWake();
  clearInterval(swTimer); swTimer=setInterval(swTick,100);
  renderSw();
}
function swPause(){
  const s=sw();
  if(!s.run)return;
  /* Önce interval'i kapat, sonra TEK bir zaman damgasıyla son süreyi dondur.
     Böylece duraklatma anında tick/save yarışı oluşmaz. */
  clearInterval(swTimer); swTimer=null;
  const now=Date.now(),runStart=Number(s.start)||now,elapsed=swElapsedAt(s,now);
  s.acc=elapsed; s.run=false; s.start=0;
  swCreditElapsed(elapsed);
  swHistoryAdd(Math.max(0,now-runStart),pomoSubject||SUBJ_NAMES[0],runStart,now);
  save();
  releaseWake();
  renderSw(); renderSwHistory();
}
function swToggle(){ if(sw().run)swPause(); else swStart(); }
function swRecord(){
  const mins=Math.floor(swElapsed()/60000);
  if(mins<1)return;
  todaySessions().push({t:Date.now()-swElapsed(),m:mins,subj:pomoSubject,task:"",type:"work",done:true});
  const k=todayKey();
  if(S.sessions[k].length>40)S.sessions[k]=S.sessions[k].slice(-40);
}
function swReset(){
  const s=sw();
  if(s.run){
    const now=Date.now(),runStart=Number(s.start)||now,elapsed=swElapsedAt(s,now);
    s.acc=elapsed; s.run=false; s.start=0;
    swCreditElapsed(elapsed);
    swHistoryAdd(Math.max(0,now-runStart),pomoSubject||SUBJ_NAMES[0],runStart,now);
  }else swCredit();
  swRecord();
  s.run=false; s.start=0; s.acc=0; s.cr=0;
  S.focus.swLaps=[];
  clearInterval(swTimer); swTimer=null; releaseWake();
  save(); renderSw(); renderSwHistory(); renderSessions(); renderTimeDist();
  checkBadges(false);
}
function swLap(){
  const s=sw();
  if(!s.run&&!s.acc){ toast("Önce kronometreyi başlat"); return; }
  if(!Array.isArray(S.focus.swLaps))S.focus.swLaps=[];
  S.focus.swLaps.push({t:swElapsed(),subj:pomoSubject||""});
  if(S.focus.swLaps.length>50)S.focus.swLaps=S.focus.swLaps.slice(-50);
  save(); renderSw();
  beep(1);
}
function renderSwLive(){
  const card=el("swCard"),s=sw(),ms=swElapsed();
  if(card)card.setAttribute("data-run",s.run?"running":(ms?"paused":"idle"));
  const t=el("swTime"); if(t)t.textContent=fmtSw(ms);
  const cs=el("swCs"); if(cs)cs.textContent="."+fmtSwCs(ms);
  const info=el("swInfo");
  if(info){
    const mins=Math.floor(ms/60000);
    info.textContent=mins?(mins+" dakika çalışma süresine yazıldı · "+(pomoSubject||"—")):"Süre biriktikçe çalışma süresine ve derse yazılır";
  }
}
function renderSw(){
  renderSwLive();
  const s=sw(),ms=swElapsed();
  const lbl=el("swBtnLabel");
  if(lbl)lbl.textContent=s.run?"Duraklat":(ms?"Devam et":"Başlat");
  const ic=el("swBtnIcon");
  if(ic)ic.innerHTML=s.run?ICON_PAUSE:ICON_PLAY;

  const lw=el("swLaps");
  if(lw){
    const laps=Array.isArray(S.focus.swLaps)?S.focus.swLaps:[];
    if(!laps.length){ lw.innerHTML='<div class="empty">Tur kaydı yok. Konu değiştirdiğinde "Tur" ile ara zaman alabilirsin.</div>'; }
    else{
      let prev=0;
      const rows=laps.map((L,i)=>{
        const v=(typeof L==="object"&&L)?L.t:L, sj=(typeof L==="object"&&L)?(L.subj||""):"";
        const split=v-prev; prev=v;
        return `<div class="dayrow"><span class="k">${i+1}. tur${sj?" · "+esc(sj):""}</span>
          <span class="v">${fmtSw(split)} <em class="dl flat">${fmtSw(v)}</em></span></div>`; });
      lw.innerHTML=rows.reverse().join("");
    }
  }
  renderSwHistory();
}
function swBoot(){
  const s=sw();
  if(s.run){ clearInterval(swTimer); swTimer=setInterval(swTick,100); requestWake(); }
  renderSw();
}

/* ==================================================================
   BAŞLATMA
   ================================================================== */
function boot5(){
  boot4();
  setFocusMode(S.focus.mode||"pomo",true);
  swBoot();
  document.addEventListener("visibilitychange",()=>{
    if(!document.hidden&&sw().run)swTick();
  });
}
/* boot çağrısı app11 sonunda yapılır */
/* ==================================================================
   GERİ AL
   ================================================================== */
let undoSlot=null,undoTimer=null;
function pushUndo(label,restore){
  undoSlot={label:label,restore:restore,at:Date.now()};
  const bar=el("undoBar");
  if(bar){
    bar.innerHTML='<span>'+esc(label)+'</span><button class="btn ghost tiny" onclick="undoLast()">Geri al</button>';
    bar.classList.add("show");
  }
  clearTimeout(undoTimer);
  undoTimer=setTimeout(hideUndo,7000);
}
function hideUndo(){
  const bar=el("undoBar"); if(bar)bar.classList.remove("show");
  undoSlot=null;
}
function undoLast(){
  if(!undoSlot){ hideUndo(); return; }
  try{ undoSlot.restore(); }catch(e){}
  save(); hideUndo(); renderAll(); toast("Geri alındı ✓");
}
function clone(x){ return JSON.parse(JSON.stringify(x===undefined?null:x)); }

/* ==================================================================
   KURULUM SİHİRBAZI
   ================================================================== */
const WIZ_STEPS=4;
let wizStep=1;
function wizardNeeded(){
  return !S.wizardDone && !S.name && !S.denemeler.length &&
         Object.keys(S.topics).length===0 && Object.keys(S.weeks).length===0;
}
function openWizard(){
  wizStep=1;
  const ov=el("wizOverlay"); if(!ov)return;
  ov.style.display="flex";
  el("wizName").value=S.name||"";
  el("wizDate").value=S.examDate||"2027-06-19";
  el("wizTarget").value=S.target||150;
  el("wizNet").value=S.targetNet||"";
  el("wizDays").value=S.workdays||6;
  renderWizard();
}
function renderWizard(){
  for(let i=1;i<=WIZ_STEPS;i++){
    const p=el("wiz"+i); if(p)p.style.display=(i===wizStep)?"block":"none";
  }
  const dots=el("wizDots");
  if(dots){
    let h="";
    for(let i=1;i<=WIZ_STEPS;i++)h+='<i class="'+(i<=wizStep?"on":"")+'"></i>';
    dots.innerHTML=h;
  }
  const nx=el("wizNext");
  if(nx)nx.textContent=wizStep===WIZ_STEPS?"Başlayalım":"Devam";
  const bk=el("wizBack");
  if(bk)bk.style.visibility=wizStep>1?"visible":"hidden";
}
function wizNext(){
  if(wizStep<WIZ_STEPS){ wizStep++; renderWizard(); return; }
  S.name=(el("wizName").value||"").trim();
  S.examDate=el("wizDate").value||S.examDate;
  S.target=Math.max(0,parseInt(el("wizTarget").value,10)||0);
  S.targetNet=Math.max(0,parseFloat(el("wizNet").value)||0);
  S.workdays=Math.max(1,Math.min(7,parseInt(el("wizDays").value,10)||6));
  S.wizardDone=true; save();
  closeWizard(); renderAll(); go("home");
  toast("Hazırsın 👋");
}
function wizBack(){ if(wizStep>1){ wizStep--; renderWizard(); } }
function closeWizard(){ const ov=el("wizOverlay"); if(ov)ov.style.display="none"; }
function skipWizard(){ S.wizardDone=true; save(); closeWizard(); }

/* ==================================================================
   BASİT GÖRÜNÜM
   ================================================================== */
function toggleSimple(){
  S.simple=!S.simple; save(); applySimple();
  toast(S.simple?"Basit görünüm açık":"Tüm özellikler açık");
}
function applySimple(){
  document.body.classList.toggle("simple",!!S.simple);
  const tg=el("simpleToggle"); if(tg)tg.classList.toggle("on",!!S.simple);
  const h=el("simpleHint");
  if(h)h.textContent=S.simple
    ?"İleri düzey analizler gizli. İhtiyacın oldukça açabilirsin."
    :"Bütün paneller görünür.";
}

/* ==================================================================
   ÖRNEK VERİ
   ================================================================== */
function loadDemo(){
  if(S.demo){ toast("Örnek veri zaten açık"); return; }
  S.demoBackup=JSON.stringify(S);
  const T=todayKey();
  for(let i=0;i<28;i++){
    const k=addDaysKey(T,-i);
    if(i%7===6)continue;
    S.solved[k]=60+((i*13)%90);
    S.pomoMin[k]=70+((i*17)%120);
    S.pomoSubj[k]={Matematik:40,Türkçe:20,Fizik:15};
  }
  const mon=keyOf(mondayOf(new Date()));
  for(let w=0;w<3;w++){
    const wk=addDaysKey(mon,-7*w),week=getWeek(wk,true);
    week.s[0]=["Matematik türev","Türkçe paragraf","Fizik optik","Matematik integral","Deneme çöz","Tekrar","Dinlenme"];
    if(week.s[1])week.s[1]=["Kimya","Biyoloji","Geometri","Edebiyat","Tarih","Soru bankası",""];
    week.r[0]=["Sabah tekrar","Sabah tekrar","Sabah tekrar","Sabah tekrar","Sabah tekrar","",""];
    week.done=[true,true,w===0?false:true,true,true,false,false];
    week.dn={"s-0-0":1,"s-0-1":1,"s-0-3":1,"r-0-0":1};
  }
  S.rowLabels.s[0]="09:00-11:00"; S.rowLabels.s[1]="14:00-16:00";
  [["3D TYT-1",-24,68],["3D TYT-2",-17,74],["Palme TYT-1",-10,79],["3D TYT-3",-3,84]].forEach((d,i)=>{
    S.denemeler.push({id:900000+i,type:"TYT",name:d[0],date:addDaysKey(T,d[1]),dur:150-i*4,
      pub:d[0].split(" ")[0],totalNet:d[2],
      subjectResults:[
        {name:"Türkçe",d:30+i,y:6-i,b:4,net:r2(30+i-(6-i)/4),cap:40},
        {name:"Sosyal Bilimler",d:12+i,y:4,b:4,net:r2(12+i-1),cap:20},
        {name:"Temel Matematik",d:20+i*2,y:8-i,b:12-i,net:r2(20+i*2-(8-i)/4),cap:40},
        {name:"Fen Bilimleri",d:9+i,y:5,b:6,net:r2(9+i-1.25),cap:20}]});
  });
  ["Problemler","Fonksiyonlar","Türev"].forEach((t,i)=>{
    const k=tkey(i===2?"AYT":"TYT",i===2?"Matematik (AYT)":"Matematik",t);
    S.topics[k]={st:3-i%2,conf:4-i,ts:addDaysKey(T,-10),rev:[]};
  });
  ["Paragraf","Ses Bilgisi"].forEach(t=>{ S.topics[tkey("TYT","Türkçe",t)]={st:3,conf:5,ts:addDaysKey(T,-40),rev:[0,1]}; });
  S.wrongLog.push({id:910001,date:addDaysKey(T,-3),subject:"Matematik",topic:"Problemler",n:7});
  S.wrongLog.push({id:910002,date:addDaysKey(T,-3),subject:"Fizik",topic:"Optik",n:4});
  S.books.push({id:920001,name:"Palme TYT Matematik",subject:"Matematik",total:40,done:17,
    log:[{d:addDaysKey(T,-5),n:5},{d:addDaysKey(T,-2),n:6}],topic:"Problemler"});
  S.demo=true; save(); renderAll(); go("home");
  toast("Örnek veri yüklendi · sonra tek dokunuşla temizlenir");
}
function clearDemo(){
  if(!S.demo){ toast("Örnek veri açık değil"); return; }
  if(!confirm("Örnek veri silinsin ve önceki durumuna dönülsün mü?"))return;
  try{
    const back=JSON.parse(S.demoBackup||"{}");
    S=normalize(Object.assign({},JSON.parse(JSON.stringify(DEF)),back));
  }catch(e){
    S=normalize(JSON.parse(JSON.stringify(DEF)));
  }
  S.demo=false; S.demoBackup=null; save(); renderAll(); go("home");
  toast("Örnek veri temizlendi");
}

/* ==================================================================
   VERİ TUTARLILIK KONTROLÜ
   ================================================================== */
function consistencyIssues(){
  const out=[],T=todayKey();
  /* net kapasiteyi aşan deneme */
  S.denemeler.forEach(dn=>{
    (dn.subjectResults||[]).forEach(sr=>{
      const tot=(sr.d|0)+(sr.y|0)+(sr.b|0);
      if(sr.cap&&tot>sr.cap)
        out.push({t:"Soru sayısı fazla",d:esc(dn.name)+" · "+esc(sr.name)+": "+tot+" soru girilmiş ama ders "+sr.cap+" soruluk."});
      if(sr.cap&&sr.net>sr.cap)
        out.push({t:"Net kapasiteyi aşıyor",d:esc(dn.name)+" · "+esc(sr.name)+": "+sr.net+" net."});
    });
  });
  /* oturum toplamı günlük süreyi aşıyorsa */
  Object.keys(S.sessions||{}).forEach(k=>{
    const sum=(S.sessions[k]||[]).reduce((a,x)=>a+(x.m|0),0);
    const day=S.pomoMin[k]||0;
    if(sum>day+5)
      out.push({t:"Oturum süresi tutmuyor",d:parseKey(k).toLocaleDateString("tr-TR",{day:"numeric",month:"long"})+": oturumlar "+sum+" dk, günlük kayıt "+day+" dk."});
  });
  /* günde aşırı soru */
  Object.keys(S.solved).forEach(k=>{
    if((S.solved[k]|0)>700)
      out.push({t:"Soru sayısı çok yüksek",d:parseKey(k).toLocaleDateString("tr-TR",{day:"numeric",month:"long"})+": "+S.solved[k]+" soru. Yanlış girilmiş olabilir."});
  });
  /* uzun süre çalışma var ama hiç soru yok */
  let mismatch=0;
  for(let i=0;i<21;i++){
    const k=addDaysKey(T,-i);
    if((S.pomoMin[k]||0)>=120&&(S.solved[k]||0)===0)mismatch++;
  }
  if(mismatch>=3)
    out.push({t:"Süre var, soru yok",d:"Son 3 haftada "+mismatch+" gün 2 saatten fazla çalışma kaydı var ama hiç soru girilmemiş. Analizler eksik çıkar."});
  /* pekiştirdiğin ama çok yanlış yaptığın konular */
  const wr={};
  S.wrongLog.forEach(w=>{ const key=topicKeyOf(w.subject,w.topic); if(key)wr[key]=(wr[key]||0)+(w.n|0||1); });
  Object.keys(wr).forEach(k=>{
    const t=S.topics[k];
    if(t&&t.st===3&&wr[k]>=8){
      const p=k.split("|");
      out.push({t:"Bitti ama hata sürüyor",d:p[1]+" · "+p[2]+": pekiştirdim olarak işaretli ama "+wr[k]+" yanlış kaydı var."});
    }
  });
  return out.slice(0,20);
}
function renderConsistency(){
  const w=el("consBox"); if(!w)return;
  const list=consistencyIssues();
  if(!list.length){ w.innerHTML='<div class="empty">Verilerinde çelişki görünmüyor.</div>'; return; }
  w.innerHTML=list.map(x=>
    `<div class="dayrow"><span class="k"><b style="color:var(--label)">${esc(x.t)}</b><br><small>${x.d}</small></span></div>`).join("")+
    '<p class="hint">Bunlar hata değil, dikkat çekilen noktalar. Veri sayfasından düzeltebilirsin.</p>';
}

/* ==================================================================
   GERÇEK ÇALIŞMA GÜNÜ
   ================================================================== */
function effectiveDays(){
  const d=daysUntil(S.examDate);
  if(d<0)return 0;
  const wd=Math.max(1,Math.min(7,S.workdays||6));
  return Math.round(d*wd/7);
}
function renderEffective(){
  const e=el("effDays"); if(!e)return;
  const d=daysUntil(S.examDate);
  if(d<0){ e.textContent=""; return; }
  const eff=effectiveDays();
  const wd=Math.max(1,Math.min(7,S.workdays||6));
  e.textContent=wd>=7?"":("haftada "+wd+" gün çalışırsan ≈ "+eff+" çalışma günü");
}

/* ==================================================================
   AY RAPORU
   ================================================================== */
function monthReport(y,m){
  const first=new Date(y,m,1),last=new Date(y,m+1,0);
  let min=0,q=0,done=0,notes=[],nets=[],topicsDone=0;
  for(let d=1;d<=last.getDate();d++){
    const k=y+"-"+String(m+1).padStart(2,"0")+"-"+String(d).padStart(2,"0");
    min+=S.pomoMin[k]||0; q+=S.solved[k]||0;
    if(dayDone(k))done++;
    if(S.journal[k])notes.push({d:k,t:S.journal[k]});
    S.denemeler.filter(x=>x.date===k&&x.type!=="BRANS").forEach(x=>nets.push(x.totalNet));
  }
  Object.keys(S.topics).forEach(k=>{
    const t=S.topics[k];
    if(t.st===3&&t.ts&&t.ts.indexOf(y+"-"+String(m+1).padStart(2,"0"))===0)topicsDone++;
  });
  const avg=nets.length?r2(nets.reduce((a,b)=>a+b,0)/nets.length):null;
  const trend=nets.length>1?r2(nets[nets.length-1]-nets[0]):null;
  return {y:y,m:m,min:min,q:q,done:done,days:last.getDate(),notes:notes,
          denemeCount:nets.length,avg:avg,trend:trend,topicsDone:topicsDone};
}
let repDate=new Date();
function shiftReport(n){
  repDate=new Date(repDate.getFullYear(),repDate.getMonth()+n,1);
  renderReport();
}
function renderReport(){
  const w=el("monthReportBox"); if(!w)return;
  const r=monthReport(repDate.getFullYear(),repDate.getMonth());
  const lbl=el("repMonth");
  if(lbl)lbl.textContent=MONTHS[r.m]+" "+r.y;
  if(!r.min&&!r.q&&!r.denemeCount){ w.innerHTML='<div class="empty">Bu ayda kayıt yok.</div>'; return; }
  let html=`<div class="dayrow"><span class="k">Toplam çalışma</span><span class="v">${fmtHM(r.min)}</span></div>
    <div class="dayrow"><span class="k">Çözülen soru</span><span class="v">${r.q}</span></div>
    <div class="dayrow"><span class="k">Günlük ortalama</span><span class="v">${fmtHM(Math.round(r.min/r.days))} · ${Math.round(r.q/r.days)} soru</span></div>
    <div class="dayrow"><span class="k">Tamamlanan gün</span><span class="v">${r.done}/${r.days}</span></div>
    <div class="dayrow"><span class="k">Pekiştirilen konu</span><span class="v">${r.topicsDone}</span></div>`;
  if(r.denemeCount){
    html+=`<div class="dayrow"><span class="k">Deneme</span><span class="v">${r.denemeCount} · ort. ${r.avg} net</span></div>`;
    if(r.trend!==null)html+=`<div class="dayrow"><span class="k">Ay içi değişim</span>
      <span class="v" style="color:${r.trend>0?"var(--success)":r.trend<0?"var(--danger)":"var(--label-3)"}">${r.trend>0?"+":""}${r.trend} net</span></div>`;
  }
  if(r.notes.length){
    html+='<p class="eyebrow" style="margin:16px 0 6px;">Günlük notların</p>';
    html+=r.notes.slice(-12).map(n=>
      `<div class="dayrow"><span class="k">${parseKey(n.d).toLocaleDateString("tr-TR",{day:"numeric",month:"short"})}</span>
       <span class="v" style="font-weight:400;text-align:left;max-width:70%">${esc(n.t)}</span></div>`).join("");
  }
  w.innerHTML=html;
}

/* ==================================================================
   PAYLAŞILABİLİR GÜNLÜK KART
   ================================================================== */
function shareText(){
  const k=todayKey(),d=daysUntil(S.examDate);
  return "YKS Defterim · "+parseKey(k).toLocaleDateString("tr-TR",{day:"numeric",month:"long"})+"\n"+
    (S.pomoMin[k]||0)+" dakika çalışma · "+(S.solved[k]||0)+" soru\n"+
    "Plan serisi "+planStreak()+" gün · Sınava "+(d>=0?d:0)+" gün";
}
function shareCard(){
  const txt=shareText();
  let cv=null,ctx=null;
  try{ cv=document.createElement("canvas"); ctx=cv.getContext?cv.getContext("2d"):null; }catch(e){ ctx=null; }
  if(!ctx){
    if(navigator.share){ navigator.share({text:txt}).catch(()=>{}); toast("Paylaşım açıldı"); return; }
    downloadText("yks-"+todayKey()+".txt",txt,"text/plain");
    toast("Özet metin olarak indirildi");
    return;
  }
  const W=1080,H=1080;
  cv.width=W; cv.height=H;
  const dark=isDarkNow();
  const g=ctx.createLinearGradient(0,0,W,H);
  g.addColorStop(0,dark?"#0B0D14":"#EEF2FB");
  g.addColorStop(1,dark?"#161A28":"#DCE6FA");
  ctx.fillStyle=g; ctx.fillRect(0,0,W,H);
  ctx.fillStyle=dark?"#F3F4F8":"#0A0C14";
  ctx.textAlign="left";
  ctx.font="600 40px -apple-system,system-ui,sans-serif";
  ctx.fillText(parseKey(todayKey()).toLocaleDateString("tr-TR",{day:"numeric",month:"long",year:"numeric"}),90,160);
  ctx.font="700 150px -apple-system,system-ui,sans-serif";
  ctx.fillText((S.pomoMin[todayKey()]||0)+" dk",90,330);
  ctx.font="700 110px -apple-system,system-ui,sans-serif";
  ctx.fillText((S.solved[todayKey()]||0)+" soru",90,470);
  ctx.font="500 44px -apple-system,system-ui,sans-serif";
  ctx.fillStyle=dark?"#A7B0C8":"#4A5570";
  ctx.fillText("Plan serisi "+planStreak()+" gün",90,600);
  ctx.fillText("Sınava "+Math.max(0,daysUntil(S.examDate))+" gün",90,670);
  ctx.font="600 36px -apple-system,system-ui,sans-serif";
  ctx.fillText("YKS Defterim",90,H-90);
  let url="";
  try{ url=cv.toDataURL("image/png"); }catch(e){ url=""; }
  if(!url){ downloadText("yks-"+todayKey()+".txt",txt,"text/plain"); toast("Özet indirildi"); return; }
  const a=document.createElement("a");
  a.href=url; a.download="yks-"+todayKey()+".png";
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  toast("Kart indirildi");
}
/* ==================================================================
   KONU AĞIRLIKLARI
   Geçmiş yılların soru dağılımına dayalı kaba ağırlıklar.
   Listede olmayan konu 1 sayılır; 3 = çok soru gelen konu.
   ================================================================== */
const TOPIC_WEIGHT={
  "TYT|Türkçe|Paragraf":3,"TYT|Türkçe|Sözcükte Anlam":2,"TYT|Türkçe|Cümlede Anlam":2,
  "TYT|Türkçe|Yazım Kuralları":2,"TYT|Türkçe|Noktalama":2,"TYT|Türkçe|Anlatım Bozukluğu":2,
  "TYT|Matematik|Problemler":3,"TYT|Matematik|Sayılar":2,"TYT|Matematik|Rasyonel Sayılar":2,
  "TYT|Matematik|Üslü-Köklü Sayılar":2,"TYT|Matematik|Çarpanlara Ayırma":2,
  "TYT|Matematik|Fonksiyonlar":2,"TYT|Matematik|Olasılık":2,"TYT|Matematik|Permütasyon-Kombinasyon":2,
  "TYT|Geometri|Üçgenler":3,"TYT|Geometri|Dörtgenler":2,"TYT|Geometri|Çember-Daire":2,
  "TYT|Geometri|Analitik Geometri":2,"TYT|Geometri|Katı Cisimler":2,
  "TYT|Fizik|Hareket-Kuvvet":2,"TYT|Fizik|Elektrik":2,"TYT|Fizik|Optik":2,"TYT|Fizik|Madde ve Özellikleri":2,
  "TYT|Kimya|Karışımlar":2,"TYT|Kimya|Periyodik Sistem":2,"TYT|Kimya|Atom ve Yapısı":2,
  "TYT|Biyoloji|Hücre":2,"TYT|Biyoloji|Kalıtım":2,"TYT|Biyoloji|Ekoloji":2,
  "AYT|Matematik (AYT)|Türev":3,"AYT|Matematik (AYT)|İntegral":3,"AYT|Matematik (AYT)|Fonksiyonlar":2,
  "AYT|Matematik (AYT)|Limit":2,"AYT|Matematik (AYT)|Trigonometri":2,"AYT|Matematik (AYT)|Polinomlar":2,
  "AYT|Matematik (AYT)|Logaritma":2,"AYT|Matematik (AYT)|Diziler":2,
  "AYT|Geometri (AYT)|Analitik-Doğru":2,"AYT|Geometri (AYT)|Katı Cisimler":2,
  "AYT|Fizik (AYT)|Elektrik-Manyetizma":3,"AYT|Fizik (AYT)|Newton Yasaları":2,"AYT|Fizik (AYT)|Modern Fizik":2,
  "AYT|Kimya (AYT)|Organik Kimya":3,"AYT|Kimya (AYT)|Kimyasal Denge":2,"AYT|Kimya (AYT)|Asit-Baz Dengesi":2,
  "AYT|Biyoloji (AYT)|Genetik":3,"AYT|Biyoloji (AYT)|Sinir Sistemi":2,"AYT|Biyoloji (AYT)|Bitki Biyolojisi":2,
  "AYT|Edebiyat|Divan Edebiyatı":2,"AYT|Edebiyat|Cumhuriyet Dönemi":2,"AYT|Edebiyat|Şiir Bilgisi":2
};
function topicWeight(key){ return TOPIC_WEIGHT[key]||1; }
function weightLabel(w){ return w>=3?"çok soru":(w===2?"sık soru":""); }

/* ==================================================================
   KONU KAYNAĞI (link / not / sayfa)
   ================================================================== */
function addTopicRes(){
  const subj=(el("trSubject").value||"").trim(),topic=(el("trTopic").value||"").trim();
  const val=(el("trValue").value||"").trim().slice(0,200);
  if(!subj||!topic){ toast("Ders ve konu seç"); return; }
  const key=topicKeyOf(subj,topic);
  if(!key){ toast("Bu konu müfredatta bulunamadı"); return; }
  const t=Object.assign({st:0,conf:0,ts:null,rev:[]},S.topics[key]);
  if(val)t.res=val; else delete t.res;
  S.topics[key]=t; save();
  el("trTopic").value=""; el("trValue").value="";
  renderTopicRes(); renderSubjects();
  toast(val?"Kaynak eklendi ✓":"Kaynak silindi");
}
function clearTopicRes(key){
  const t=S.topics[key]; if(!t)return;
  const old=clone(t);
  delete t.res;
  if(t.st===0&&!t.conf&&!t.dl)delete S.topics[key];
  save(); pushUndo("Kaynak silindi",()=>{ S.topics[key]=old; });
  renderTopicRes(); renderSubjects();
}
function topicResList(){
  const out=[];
  Object.keys(S.topics).forEach(k=>{
    const t=S.topics[k];
    if(t&&t.res){ const p=k.split("|"); out.push({key:k,subj:p[1],topic:p[2],res:t.res}); }
  });
  return out.sort((a,b)=>a.subj.localeCompare(b.subj,"tr"));
}
function renderTopicRes(){
  const w=el("trBox"); if(!w)return;
  fillSubjSelect("trSubject");
  const list=topicResList();
  if(!list.length){ w.innerHTML='<div class="empty">Bir konuya video bağlantısı, sayfa numarası ya da kendi notunu ekleyebilirsin. Tekrar zamanı geldiğinde nereye bakacağın hazır olur.</div>'; return; }
  w.innerHTML=list.map(x=>{
    const isLink=/^https?:\/\//.test(x.res);
    const val=isLink?'<a href="'+esc(x.res)+'" target="_blank" rel="noopener">'+esc(x.res.slice(0,44))+'</a>':esc(x.res);
    return `<div class="dayrow"><span class="k">${esc(x.subj)} · ${esc(x.topic)}<br><small>${val}</small></span>
      <span class="v"><button class="del" onclick="clearTopicRes('${x.key.replace(/'/g,"\\'")}')">sil</button></span></div>`;
  }).join("");
}

/* ==================================================================
   ODAK: OTURUM NOTU · KESİNTİ SEBEBİ · TUR KONUSU
   ================================================================== */
function showSessionNote(){
  const b=el("noteBox"); if(!b)return;
  b.style.display="block";
  const i=el("noteInput"); if(i)i.value="";
}
function saveSessionNote(){
  const v=(el("noteInput").value||"").trim().slice(0,140);
  const list=todaySessions();
  if(v&&list.length){ list[list.length-1].note=v; save(); renderSessions(); }
  hideSessionNote();
  if(v)toast("Not eklendi ✓");
}
function hideSessionNote(){ const b=el("noteBox"); if(b)b.style.display="none"; }

function showPauseReason(){
  const b=el("pauseBox"); if(b)b.style.display="block";
}
function setPauseReason(kind){
  const k=todayKey();
  if(!S.pauseReasons[k])S.pauseReasons[k]={mola:0,dikkat:0};
  if(kind==="dikkat")S.pauseReasons[k].dikkat++; else S.pauseReasons[k].mola++;
  save(); hidePauseReason(); renderPauseStats();
}
function hidePauseReason(){ const b=el("pauseBox"); if(b)b.style.display="none"; }
function renderPauseStats(){
  const e=el("pauseStat"); if(!e)return;
  const r=S.pauseReasons[todayKey()];
  if(!r||(!r.mola&&!r.dikkat)){ e.textContent=""; return; }
  e.textContent=(r.dikkat?r.dikkat+" kez dikkatin dağıldı":"")+
    (r.dikkat&&r.mola?" · ":"")+(r.mola?r.mola+" kez mola verdin":"");
}


/* ==================================================================
   KLAVYE GEÇİŞLERİ
   Dokunmatik yatay kaydırma artık ekran değiştirmez. Tablet/PC'de
   kaydırma yalnız içerik kaydırma amacıyla kullanılır.
   ================================================================== */
const SCREEN_ORDER=["home","program","topics","deneme","pomo","more"];
function currentScreen(){
  const a=document.querySelector(".screen.active");
  return a?a.id:"home";
}
function shiftScreen(n){
  const i=SCREEN_ORDER.indexOf(currentScreen());
  if(i<0)return;
  const j=Math.max(0,Math.min(SCREEN_ORDER.length-1,i+n));
  if(j!==i)go(SCREEN_ORDER[j]);
}
function anyOverlayOpen(){
  if(document.body.classList.contains("teacher-open"))return true;
  return ["dayPick","playOverlay","vidOverlay","anaOverlay","examDetailOverlay","resOverlay","simOverlay","qaViewer","wizOverlay","brOverlay"].some(id=>{
    const e=el(id); return e&&e.style.display&&e.style.display!=="none";
  });
}
function closeTopOverlay(){
  if(document.body.classList.contains("teacher-open")){ closeTeacher(); return true; }
  if(el("dayPick")&&el("dayPick").style.display==="flex"){ closeDayPick(); return true; }
  if(el("resOverlay")&&el("resOverlay").style.display==="flex"){ closeRes(); return true; }
  if(el("playOverlay")&&el("playOverlay").style.display==="flex"){ closePlayer(); return true; }
  if(el("vidOverlay")&&el("vidOverlay").style.display==="flex"){ closeVideos(); return true; }
  if(el("brOverlay")&&el("brOverlay").style.display==="flex"){ stopBreath(); return true; }
  if(el("wizOverlay")&&el("wizOverlay").style.display!=="none"){ skipWizard(); return true; }
  if(el("qaViewer")&&el("qaViewer").style.display!=="none"){ qaCloseViewer(); return true; }
  if(el("simOverlay")&&el("simOverlay").style.display!=="none"){ stopSim(); return true; }
  return false;
}
/* Yatay swipe ile ekran değiştirme v3.2.5 itibarıyla kaldırıldı. */
function initKeys(){
  document.addEventListener("keydown",e=>{
    const tag=(e.target&&e.target.tagName||"").toLowerCase();
    if(tag==="input"||tag==="textarea"||tag==="select"||(e.target&&e.target.isContentEditable)){
      if(e.key==="Escape")e.target.blur();
      return;
    }
    if(e.key==="Escape"){ if(closeTopOverlay())e.preventDefault(); return; }
    if(e.metaKey||e.ctrlKey||e.altKey)return;
    if(e.key>="1"&&e.key<="6"){ go(SCREEN_ORDER[+e.key-1]); e.preventDefault(); return; }
    if(e.key==="ArrowRight"){ shiftScreen(1); e.preventDefault(); return; }
    if(e.key==="ArrowLeft"){ shiftScreen(-1); e.preventDefault(); return; }
    if(e.key===" "&&currentScreen()==="pomo"){
      if(S.focus.mode==="sw")swToggle(); else togglePomo();
      e.preventDefault(); return;
    }
    if((e.key==="z"||e.key==="Z")&&undoSlot){ undoLast(); e.preventDefault(); }
  });
}

/* ==================================================================
   BAŞLATMA
   ================================================================== */
function renderNewPanels(){
  renderTopicRes(); renderConsistency(); renderReport();
  renderEffective(); renderPauseStats(); applySimple();
}
function boot6(){
  boot5();
  applySimple();
  perfIdle("boot-new-panels",()=>renderNewPanels(),950);
  initKeys(); initA11y();
  if(wizardNeeded())setTimeout(openWizard,400);
}
/* boot çağrısı app12 sonunda yapılır */

/* ==================================================================
   2) KATSAYI KALİBRASYONU — gerçek sonuçla
   ================================================================== */
function addCalib(){
  const type=el("cbType").value;
  const net=parseFloat(el("cbNet").value);
  const score=parseFloat(el("cbScore").value);
  const ayt=parseFloat(el("cbAyt").value);
  if(!isFinite(net)||!isFinite(score)||net<0||score<=0){ toast("Net ve puanı gir"); return; }
  if(type==="alan"&&!isFinite(ayt)){ toast("Alan puanı için AYT netini de gir"); return; }
  S.calib.push({id:Date.now(),type:type,net:r2(net),score:r2(score),
    ayt:type==="alan"?r2(ayt):null,date:todayKey()});
  save(); el("cbNet").value=""; el("cbScore").value=""; el("cbAyt").value="";
  renderCalib(); toast("Sonuç eklendi ✓");
}
function delCalib(id){
  const bk=clone(S.calib.find(x=>x.id===id));
  S.calib=S.calib.filter(x=>x.id!==id);
  if(bk&&typeof logAdd==="function")logAdd("sil","Gerçek sonuç silindi",{t:"calib",v:bk});
  save();
  if(bk)pushUndo("Sonuç silindi",()=>{ S.calib.push(bk); });
  renderCalib();
}
/* iki bilinmeyenli en küçük kareler: score = base + k*net */
function fitLine(points){
  const n=points.length;
  if(!n)return null;
  if(n===1)return {k:null,base:null,single:points[0]};
  let sx=0,sy=0,sxx=0,sxy=0;
  points.forEach(p=>{ sx+=p.x; sy+=p.y; sxx+=p.x*p.x; sxy+=p.x*p.y; });
  const den=n*sxx-sx*sx;
  if(Math.abs(den)<1e-9)return {k:null,base:null,single:points[0]};
  const k=(n*sxy-sx*sy)/den;
  const base=(sy-k*sx)/n;
  return {k:r2(k),base:r2(base),n:n};
}
function calibSuggest(){
  const obp=Math.max(0,Math.min(100,+S.obp||0))*S.coef.obpK;
  const tyt=S.calib.filter(c=>c.type==="tyt");
  const out={};
  if(tyt.length===1){
    const c=tyt[0];
    out.tytK=r2((c.score-S.coef.tytBase-obp)/(c.net||1));
    out.tytBase=S.coef.tytBase;
    out.tytN=1;
  } else if(tyt.length>1){
    const f=fitLine(tyt.map(c=>({x:c.net,y:c.score-obp})));
    if(f&&f.k!==null){ out.tytK=f.k; out.tytBase=f.base; out.tytN=f.n; }
  }
  const alan=S.calib.filter(c=>c.type==="alan"&&c.ayt!=null);
  if(alan.length===1){
    const c=alan[0];
    out.ayAyt=r2((c.score-S.coef.ayBase-c.net*S.coef.ayTyt-obp)/(c.ayt||1));
    out.ayBase=S.coef.ayBase; out.alanN=1;
  } else if(alan.length>1){
    /* TYT katkısı sabit kabul edilip AYT eğimi ve taban çözülür */
    const f=fitLine(alan.map(c=>({x:c.ayt,y:c.score-obp-c.net*S.coef.ayTyt})));
    if(f&&f.k!==null){ out.ayAyt=f.k; out.ayBase=f.base; out.alanN=f.n; }
  }
  return out;
}
function applyCalib(){
  const s=calibSuggest();
  let n=0;
  ["tytBase","tytK","ayBase","ayAyt"].forEach(k=>{
    if(s[k]!==undefined&&isFinite(s[k])){ S.coef[k]=s[k]; n++; }
  });
  if(!n){ toast("Uygulanacak katsayı yok"); return; }
  save(); renderScore(); renderCalib();
  toast(n+" katsayı gerçek sonuca göre ayarlandı ✓");
}
function calibError(){
  const obp=Math.max(0,Math.min(100,+S.obp||0))*S.coef.obpK;
  const rows=[];
  S.calib.forEach(c=>{
    let est=null;
    if(c.type==="tyt")est=r2(S.coef.tytBase+c.net*S.coef.tytK+obp);
    else if(c.ayt!=null)est=r2(S.coef.ayBase+c.net*S.coef.ayTyt+c.ayt*S.coef.ayAyt+obp);
    if(est!=null)rows.push({c:c,est:est,diff:r2(est-c.score)});
  });
  return rows;
}
function renderCalib(){
  const w=el("cbBox"); if(!w)return;
  if(!S.calib.length){
    w.innerHTML='<div class="empty">Elinde gerçek bir ÖSYM sonucu varsa (geçen yılki sınavın gibi) netini ve puanını gir. Tahmin formülünü kendi sonucuna göre ayarlarım; bir sonuç bile ciddi fark yaratır.</div>';
    return;
  }
  const rows=calibError();
  let html=rows.map(r=>
    `<div class="dayrow"><span class="k">${r.c.type==="tyt"?"TYT":"Alan"} · ${r.c.net} net${r.c.ayt!=null?" + "+r.c.ayt:""}<br>
      <small>gerçek ${r.c.score} · tahmin ${r.est}</small></span>
     <span class="v" style="color:${Math.abs(r.diff)<5?"var(--success)":Math.abs(r.diff)<20?"var(--time)":"var(--danger)"}">
       ${r.diff>0?"+":""}${r.diff}
       <button class="del" onclick="delCalib(${r.c.id})">sil</button></span></div>`).join("");
  const s=calibSuggest();
  const parts=[];
  if(s.tytK!==undefined)parts.push("TYT: taban "+r2(s.tytBase)+" · çarpan "+s.tytK+(s.tytN===1?" (tek sonuç, yalnız çarpan)":" ("+s.tytN+" sonuca göre)"));
  if(s.ayAyt!==undefined)parts.push("Alan: taban "+r2(s.ayBase)+" · AYT çarpanı "+s.ayAyt+(s.alanN===1?" (tek sonuç)":" ("+s.alanN+" sonuca göre)"));
  if(parts.length){
    html+='<p class="hint" style="margin-top:14px;"><b>Önerilen katsayılar</b><br>'+parts.map(esc).join("<br>")+'</p>';
    html+='<button class="btn green small" style="width:100%;margin-top:10px;" onclick="applyCalib()">Katsayıları bunlara ayarla</button>';
  } else {
    html+='<p class="hint">İkinci bir sonuç girersen taban puanı da çözebilirim.</p>';
  }
  w.innerHTML=html;
}

/* ==================================================================
   3) MÜFREDAT BİTİŞ PROJEKSİYONU
   ================================================================== */
function curriculumState(){
  let total=0,have=0;
  ALL_SUBJECTS.forEach(s=>s.topics.forEach(tp=>{
    total+=3; have+=tget(tkey(s.exam,s.name,tp)).st;
  }));
  return {total:total,have:have,left:total-have,pct:total?Math.round(have/total*100):0};
}
/* son N günde kaç kademe ilerlendi — tarih damgası yalnız 3. kademede
   tutulduğu için oradan sayılır, gerisi için soru/çalışma temposuna bakılır */
function curriculumRate(days){
  const t0=todayKey(),cut=addDaysKey(t0,-(days||45));
  let steps=0;
  Object.keys(S.topics).forEach(k=>{
    const t=S.topics[k];
    if(t.st===3&&t.ts&&t.ts>=cut)steps+=3;
  });
  /* konu bazlı çözülen soru da ilerleme sayılır (kaba katkı) */
  const q=topicSolvedAgg(days||45);
  const touched=Object.keys(q).length;
  steps+=Math.min(touched,40);
  return steps/(days||45);
}
function curriculumProjection(){
  const st=curriculumState();
  const rate=curriculumRate(45);
  const d=daysUntil(S.examDate);
  if(st.left<=0)return {done:true,pct:100};
  if(rate<=0.01)return {rate:0,left:st.left,pct:st.pct,days:null};
  const need=Math.ceil(st.left/rate);
  const date=addDaysKey(todayKey(),need);
  const fits=need<=d;
  const required=d>0?r2(st.left/d):null;
  return {rate:r2(rate),left:st.left,pct:st.pct,days:need,date:date,fits:fits,
          examDays:d,required:required};
}
function renderCurriculum(){
  const w=el("curBox"); if(!w)return;
  const p=curriculumProjection();
  if(p.done){ w.innerHTML='<div class="empty">Bütün konular pekiştirilmiş 🎉</div>'; return; }
  let html=`<div class="dayrow"><span class="k">Müfredat ilerlemesi</span><span class="v">%${p.pct}</span></div>
    <div class="bar" style="margin:10px 0 14px;"><i style="width:${p.pct}%"></i></div>`;
  if(!p.days){
    html+='<div class="empty">Son 45 günde ölçülebilir konu ilerlemesi yok. Konuları işaretlemeye başlayınca buraya "bu hızla ne zaman biter" tahmini çıkar.</div>';
    w.innerHTML=html; return;
  }
  html+=`<div class="dayrow"><span class="k">Şu anki hız</span><span class="v">günde ${p.rate} kademe</span></div>
    <div class="dayrow"><span class="k">Bu hızla biter</span><span class="v" style="color:${p.fits?"var(--success)":"var(--danger)"}">
      ${parseKey(p.date).toLocaleDateString("tr-TR",{day:"numeric",month:"long",year:"numeric"})} · ${p.days} gün</span></div>
    <div class="dayrow"><span class="k">Sınava kalan</span><span class="v">${p.examDays} gün</span></div>`;
  if(p.fits){
    html+='<p class="hint">Bu tempoyla müfredatı sınavdan '+(p.examDays-p.days)+' gün önce bitirirsin. Kalan süre tekrar ve denemeye kalır.</p>';
  } else {
    html+=`<div class="dayrow"><span class="k">Gereken hız</span><span class="v" style="color:var(--ochre-ink)">günde ${p.required} kademe</span></div>`;
    html+='<p class="hint">Bu hızla müfredat sınava yetişmiyor. Ya tempoyu artırman ya da düşük ağırlıklı konuları gözden çıkarman gerekir — ikincisi çoğu zaman daha gerçekçi.</p>';
  }
  w.innerHTML=html;
}

/* ==================================================================
   4) ÖNERİDEN PLANA EKLE
   ================================================================== */
function addToDay(text,gunIdx,haftaOfs){
  const now=new Date();
  const dw=(gunIdx===undefined||gunIdx===null)?dowOf(now):Math.max(0,Math.min(6,gunIdx|0));
  const wk=addDaysKey(keyOf(mondayOf(now)),(haftaOfs|0)*7);
  const w=getWeek(wk,true);
  const gunAd=["Pazartesi","Salı","Çarşamba","Perşembe","Cuma","Cumartesi","Pazar"];
  for(let i=0;i<S.rows.s;i++){
    if(!w.s[i])w.s[i]=new Array(7).fill("");
    if(!w.s[i][dw]||!w.s[i][dw].trim()){
      w.s[i][dw]=text;
      save(); renderTodayPlan(); renderSuggest();
      if(el("program").classList.contains("active"))renderPlan();
      toast(gunAd[dw]+((haftaOfs|0)?" (gelecek hafta)":"")+" planına eklendi ✓");
      return true;
    }
  }
  toast(gunAd[dw]+" satırları dolu — Program'dan satır ekleyebilirsin");
  return false;
}

/* ---------- gün seçici ----------
   Plana eklerken hangi güne konacağını sorar. */
let daySelText="",daySelAfter=null,daySelWeek=0;
function openDayPick(text,after){
  daySelText=String(text||""); daySelAfter=after||null; daySelWeek=0;
  const ov=el("dayPick"); if(!ov)return false;
  ov.style.display="flex";
  el("dayPickText").textContent=daySelText;
  renderDayPick();
  return true;
}
function closeDayPick(){ const ov=el("dayPick"); if(ov)ov.style.display="none"; }
const DAY_WEEK_MIN=-4,DAY_WEEK_MAX=26;   /* geçmiş 4, ileri 26 hafta */
function setDayPickWeek(n){
  daySelWeek=Math.max(DAY_WEEK_MIN,Math.min(DAY_WEEK_MAX,n|0));
  renderDayPick();
}
function shiftDayPickWeek(n){ setDayPickWeek(daySelWeek+(n|0)); }
function dayPickWeekLabel(){
  const wk=addDaysKey(keyOf(mondayOf(new Date())),daySelWeek*7);
  const bas=parseKey(wk),son=new Date(bas.getTime()+6*86400000);
  const ay=["Oca","Şub","Mar","Nis","May","Haz","Tem","Ağu","Eyl","Eki","Kas","Ara"];
  const aralik=bas.getDate()+" "+ay[bas.getMonth()]+" – "+son.getDate()+" "+ay[son.getMonth()];
  const ad=daySelWeek===0?"Bu hafta":daySelWeek===1?"Gelecek hafta":
    daySelWeek===-1?"Geçen hafta":(daySelWeek>0?daySelWeek+" hafta sonra":Math.abs(daySelWeek)+" hafta önce");
  return {ad:ad,aralik:aralik,wk:wk};
}
function renderDayPick(){
  const w=el("dayPickGrid"); if(!w)return;
  const gunAd=["Pzt","Sal","Çar","Per","Cum","Cmt","Paz"];
  const wk=addDaysKey(keyOf(mondayOf(new Date())),daySelWeek*7);
  const week=getWeek(wk,false);
  const bugun=daySelWeek===0?dowOf(new Date()):-1;
  w.innerHTML=gunAd.map((ad,d)=>{
    let dolu=0,bos=0;
    for(let i=0;i<S.rows.s;i++){
      const v=week&&week.s[i]?week.s[i][d]:"";
      if(v&&v.trim())dolu++; else bos++;
    }
    return '<button class="daybtn'+(d===bugun?" today":"")+(bos?"":" full")+'" '+
      'onclick="pickDay('+d+')"'+(bos?"":" disabled")+'>'+
      '<span class="dn">'+ad+(d===bugun?" ·":"")+'</span>'+
      '<span class="dc">'+dolu+' dolu</span></button>';
  }).join("");
  const bilgi=dayPickWeekLabel();
  const ad=el("dayPickWeekName"); if(ad)ad.textContent=bilgi.ad;
  const ar=el("dayPickWeekRange"); if(ar)ar.textContent=bilgi.aralik;
  const geri=el("dayPickPrev"); if(geri)geri.disabled=daySelWeek<=DAY_WEEK_MIN;
  const ileri=el("dayPickNext"); if(ileri)ileri.disabled=daySelWeek>=DAY_WEEK_MAX;
  const bug=el("dayPickToday");
  if(bug)bug.style.display=daySelWeek===0?"none":"inline-flex";
}
function pickDay(d){
  const okAdd=addToDay(daySelText,d,daySelWeek);
  closeDayPick();
  if(okAdd&&typeof daySelAfter==="function")daySelAfter();
  return okAdd;
}
function addToToday(text){
  const now=new Date(),dw=dowOf(now),wk=keyOf(mondayOf(now)),w=getWeek(wk,true);
  for(let i=0;i<S.rows.s;i++){
    if(!w.s[i])w.s[i]=new Array(7).fill("");
    if(!w.s[i][dw]||!w.s[i][dw].trim()){
      w.s[i][dw]=text;
      save(); renderTodayPlan(); renderSuggest();
      if(el("program").classList.contains("active"))renderPlan();
      toast("Bugünün planına eklendi ✓");
      return true;
    }
  }
  toast("Bugünün satırları dolu — Program'dan satır ekleyebilirsin");
  return false;
}

/* ==================================================================
   5) BRANŞ DENEMESİ ÖNERİSİ
   ================================================================== */
function branchSuggestion(){
  const cut=addDaysKey(todayKey(),-21);
  const recent={};
  S.denemeler.filter(d=>d.type==="BRANS"&&d.date>=cut).forEach(d=>{
    recent[d.subjectResults[0].name]=1;
  });
  let best=null;
  ALL_SUBJECTS.forEach(s=>{
    const st=subjStat(s.exam,s);
    if(st.pct<80||recent[s.name])return;
    if(!best||st.pct>best.pct)best={name:s.name,pct:st.pct};
  });
  return best;
}

/* ==================================================================
   6) GENEL ARAMA
   ================================================================== */
function globalSearch(q){
  const s=(q||"").trim().toLocaleLowerCase("tr");
  if(s.length<2)return [];
  const hit=v=>String(v||"").toLocaleLowerCase("tr").indexOf(s)>=0;
  const out=[];
  ALL_SUBJECTS.forEach(sb=>sb.topics.forEach(tp=>{
    if(hit(tp)||hit(sb.name)){
      const t=tget(tkey(sb.exam,sb.name,tp));
      out.push({g:"Konu",t:sb.name+" · "+tp,d:ST_LABEL[t.st],go:"topics",q:tp});
    }
  }));
  S.denemeler.forEach(d=>{
    if(hit(d.name)||hit(d.pub))
      out.push({g:"Deneme",t:d.name,d:(d.pub?d.pub+" · ":"")+d.totalNet+" net · "+d.date,go:"deneme"});
    if(d.refl&&(hit(d.refl.hard)||hit(d.refl.change)))
      out.push({g:"Deneme notu",t:d.name,d:(d.refl.hard||"")+" "+(d.refl.change||""),go:"deneme"});
  });
  Object.keys(S.journal).forEach(k=>{
    if(hit(S.journal[k]))out.push({g:"Günlük",t:parseKey(k).toLocaleDateString("tr-TR",{day:"numeric",month:"long"}),d:S.journal[k],go:"home"});
  });
  Object.keys(S.sessions||{}).forEach(k=>{
    (S.sessions[k]||[]).forEach(x=>{
      if(hit(x.note))out.push({g:"Oturum notu",t:parseKey(k).toLocaleDateString("tr-TR",{day:"numeric",month:"short"})+" · "+(x.subj||""),d:x.note,go:"pomo"});
    });
  });
  S.qbank.forEach(x=>{
    if(hit(x.note)||hit(x.topic)||hit(x.subject))
      out.push({g:"Arşiv sorusu",t:x.subject+(x.topic?" · "+x.topic:""),d:x.note||"",go:"deneme"});
  });
  S.books.forEach(b=>{ if(hit(b.name))out.push({g:"Kaynak",t:b.name,d:b.done+"/"+b.total,go:"more"}); });
  if(typeof allTeachers==="function")allTeachers().forEach(t=>{
    if(hit(t.a)||hit(t.n))out.push({g:"Hoca",t:t.a,d:t.d.join(", "),go:"more"});
  });
  if(typeof TACTICS!=="undefined")TACTICS.forEach(t=>{
    if(hit(t.title)||hit(t.body))out.push({g:"Taktik",t:t.title,d:t.body.slice(0,60),go:"more"});
  });
  S.wrongLog.forEach(x=>{ if(hit(x.topic))out.push({g:"Yanlış",t:x.subject+" · "+x.topic,d:x.n+" yanlış · "+x.date,go:"deneme"}); });
  Object.keys(S.weeks).forEach(wk=>{
    const w=S.weeks[wk];
    ["r","s"].forEach(blk=>(w[blk]||[]).forEach(row=>row.forEach((c,d)=>{
      if(c&&hit(c))out.push({g:"Plan",t:c,d:parseKey(addDaysKey(wk,d)).toLocaleDateString("tr-TR",{day:"numeric",month:"long"}),go:"program"});
    })));
  });
  return out.slice(0,40);
}
function runSearch(){
  const q=(el("gsInput").value||"").trim();
  const w=el("gsBox"); if(!w)return;
  if(q.length<2){ w.innerHTML='<div class="empty">En az iki harf yaz. Konular, denemeler, plan hücreleri, günlük ve oturum notların, arşiv ve kaynaklar aranır.</div>'; return; }
  const res=globalSearch(q);
  if(!res.length){ w.innerHTML='<div class="empty">"'+esc(q)+'" için sonuç yok.</div>'; return; }
  w.innerHTML='<p class="hint" style="margin:0 0 8px;">'+res.length+' sonuç</p>'+
    res.map(r=>`<div class="dayrow" style="cursor:pointer" onclick="go('${r.go}')">
      <span class="k"><b style="color:var(--label)">${esc(r.t)}</b><br><small>${esc(r.g)} · ${esc(String(r.d).slice(0,70))}</small></span></div>`).join("");
}

/* ==================================================================
   7) BÖLÜMLÜ SINAV SİMÜLASYONU
   ================================================================== */
const SIM_PLANS={
  165:[["Türkçe",40],["Sosyal Bilimler",25],["Temel Matematik",60],["Fen Bilimleri",40]],
  180:[["Matematik",75],["Fen Bilimleri",45],["Edebiyat-Sosyal",60]],
  80:[["Yabancı Dil",80]]
};
function simSections(){
  const plan=SIM_PLANS[S.simulMin];
  if(plan)return plan.map(p=>({name:p[0],min:p[1]}));
  return null;
}
function simCurrentSection(elapsedSec){
  const secs=simSections();
  if(!secs)return null;
  let acc=0;
  for(let i=0;i<secs.length;i++){
    acc+=secs[i].min*60;
    if(elapsedSec<acc)return {i:i,name:secs[i].name,leftInSection:acc-elapsedSec,total:secs.length};
  }
  return {i:secs.length-1,name:secs[secs.length-1].name,leftInSection:0,total:secs.length,over:true};
}

/* ==================================================================
   8) NEFES EGZERSİZİ (4-4-4-4)
   ================================================================== */
let brTimer=null,brLeft=0,brPhase=0;
const BR_PHASES=[["Nefes al",4],["Tut",4],["Ver",4],["Tut",4]];
function startBreath(sec){
  brLeft=Math.max(30,Math.min(600,sec|0||120));
  brPhase=0;
  const ov=el("brOverlay"); if(!ov)return;
  ov.style.display="flex";
  renderBreath();
  clearInterval(brTimer);
  brTimer=setInterval(()=>{
    brLeft--;
    if(brLeft<=0){ stopBreath(); toast("Hazırsın 🌿"); return; }
    brPhase=(brPhase+1)%(BR_PHASES[0][1]*4/1);
    renderBreath();
  },1000);
}
function renderBreath(){
  const cycle=16,pos=(brLeft%cycle);
  const idx=Math.floor((cycle-1-pos)/4)%4;
  const ph=BR_PHASES[idx];
  const inSec=4-((cycle-1-pos)%4);
  const lbl=el("brPhase"); if(lbl)lbl.textContent=ph[0];
  const cnt=el("brCount"); if(cnt)cnt.textContent=inSec;
  const tm=el("brTime"); if(tm)tm.textContent=fmtT(brLeft);
  const circle=el("brCircle");
  if(circle){
    const grow=(idx===0)?1:(idx===2?0:(idx===1?1:0));
    circle.style.transform="scale("+(grow?1:0.62)+")";
    circle.setAttribute("data-ph",String(idx));
  }
}
function stopBreath(){
  clearInterval(brTimer); brTimer=null;
  const ov=el("brOverlay"); if(ov)ov.style.display="none";
}

/* ==================================================================
   BAŞLATMA
   ================================================================== */
function renderRound9(){
  renderCalib(); renderCurriculum();
}
function boot7(){
  boot6();
  perfIdle("boot-round9",()=>renderRound9(),1000);
}
/* boot çağrısı app13 sonunda yapılır */
/* ==================================================================
   TAKTİKLER
   Hem tam liste hem de senin verine göre öne çıkanlar.
   ================================================================== */

const TAC_CATS=[
  ["hepsi","Hepsi"],["sure","Süre"],["secim","Soru seçimi"],["tahmin","Tahmin"],
  ["analiz","Analiz"],["yontem","Yöntem"],["odak","Odak"],["sinav","Sınav günü"]
];

const TACTICS=[
  {id:"t-3tur",cat:"sure",title:"Üç turlu okuma",
   body:"Kitapçığı baştan sona tek seferde çözmeye çalışma. Birinci turda yalnız bakar bakmaz çözebildiklerini yap. İkinci turda biraz düşünmek gerekenlere dön. Üçüncü turda kalanlarla uğraş. Böylece kolay soruları zor sorulara harcadığın zaman yüzünden kaçırmazsın — deneme netlerinde en sık görülen kayıp budur.",
   when:c=>c.timeShort>=1?"Denemelerinde süre yetmediğini işaretledin":null,pri:9},

  {id:"t-40sn",cat:"sure",title:"Kırk saniye kuralı",
   body:"Bir soruda kırk saniye geçtiyse ve hâlâ nereden tutacağını bilmiyorsan işaretle ve geç. Zorlandığın soruda geçirdiğin her ekstra dakika, ileride üç kolay soruyu görememene mal olur. Geçmek yenilgi değil, bilinçli bir takas.",
   when:c=>c.timeShort>=1||c.blankRate>0.2?"Süre baskısı verinde görünüyor":null,pri:8},

  {id:"t-bolum",cat:"sure",title:"Bölüm bölüm süre tut",
   body:"TYT'de Türkçe 40, Sosyal 25, Matematik 60, Fen 40 dakika iyi bir başlangıç dağılımıdır. Kendi denemende hangi bölümde taştığını görmeden düzeltemezsin. Odak sekmesindeki sınav simülasyonu bunu bölüm bölüm sayar.",
   when:c=>c.timeShort>=2?"Süre sorunu tekrar ediyor":null,pri:7},

  {id:"t-siralama",cat:"secim",title:"Kendi sıranı kur",
   body:"Kitapçıktaki sıra senin için doğru sıra değil. Güçlü olduğun bölümle başlamak hem net garantiler hem de sınav kaygısını erken düşürür. Ama en sevdiğin bölümde fazla oyalanma riskine karşı ona da süre sınırı koy.",
   when:c=>c.plateau?"Netin son denemelerde sabitlendi":null,pri:5},

  {id:"t-tuzak",cat:"secim",title:"Uzun soru her zaman zor değil",
   body:"Paragraf ve problem sorularında uzunluk çoğu zaman zorluk göstergesi değildir; kısa ama iki adım düşünmeyi gerektiren sorular daha çok zaman yer. Soruyu okumadan uzunluğuna bakıp atlama alışkanlığı, çözebileceğin soruları kaybettirir.",
   when:()=>null,pri:2},

  {id:"t-secenek",cat:"secim",title:"Şıkları da soru say",
   body:"Özellikle matematik ve fende şıklara bakmak çözüm yolunu kısaltır: verilen değerleri şıklardan geri yerleştirmek, uzun işlemi tamamen atlatabilir. Şıkları çözümün sonunda değil başında oku.",
   when:()=>null,pri:2},

  {id:"t-bes",cat:"tahmin",title:"Beş şıkta rastgele işaretlemek nötrdür",
   body:"YKS'de dört yanlış bir doğruyu götürür ve sorular beş şıklıdır. Hiçbir şık eleyemeden işaretlediğinde beklenen kazancın tam olarak sıfırdır — ne kâr ne zarar. Ama bir tek şık bile elediğinde beklenen değer artıya geçer. Yani \"emin değilsem boş bırakırım\" kuralı, aslında elediğin her şıkla birlikte yanlış hale gelir.",
   when:c=>c.blankRate>0.15?"Denemelerinde boş oranın yüksek":null,pri:10},

  {id:"t-eleme",cat:"tahmin",title:"Elemeyi yazılı yap",
   body:"Şıkları kafanda elemek yanıltıcıdır; iki şık arasında kaldığını sanırken aslında üçünü elemişsindir. Elediğin şıkkın üstünü kitapçıkta çiz. Hem hangi noktada olduğunu görürsün hem ikinci turda soruya döndüğünde işi baştan yapmazsın.",
   when:c=>c.blankRate>0.15?"Boş bıraktığın soruların çoğu kurtarılabilir":null,pri:8},

  {id:"t-bosbirak",cat:"tahmin",title:"Boş bırakmanın gerçek maliyeti",
   body:"Boş bıraktığın her soru kesin sıfırdır. Bir şık elediğin bir soruyu işaretlemenin beklenen değeri ise artı 0,06 net. Küçük görünür ama denemede 30 soruda bunu yapıyorsan yaklaşık iki net eder — sıralamada binlerce kişilik fark demektir.",
   when:c=>c.blankRate>0.2?"Son denemelerinde çok boş var":null,pri:9},

  {id:"t-yanlisdefter",cat:"analiz",title:"Yanlışı değil sebebini not et",
   body:"\"Bu soruyu yanlış yaptım\" bilgisi işe yaramaz. Sebebini üç kutudan birine koy: bilmiyordum, biliyordum ama dikkatsizlik, zaman yetmedi. Üçünün çaresi bambaşkadır. Bilmediklerin konu tekrarı ister, dikkatsizlikler yavaşlamayı, zaman sorunları strateji değişikliği.",
   when:c=>c.wrongHeavy?("En çok "+c.wrongHeavy+" konusunda hata yapıyorsun"):null,pri:8},

  {id:"t-denemeanaliz",cat:"analiz",title:"Deneme çözmek değil, analiz etmek",
   body:"Bir denemenin faydası çözerken değil, sonrasında ortaya çıkar. Kabaca kural: çözmek 135 dakikaysa analiz en az 60 dakikadır. Analiz etmeden çözülen ikinci deneme, birinciden bir şey öğretmez; yalnız aynı hatayı tekrar ettirir.",
   when:c=>c.denemeSık?"Sık deneme çözüyorsun":null,pri:6},

  {id:"t-tekrardeneme",cat:"analiz",title:"Yanlışlarını iki hafta sonra tekrar çöz",
   body:"Yanlış yaptığın soruyu o gün anlamak yeterli değil; iki hafta sonra aynı soruyu çözemiyorsan öğrenmemişsin demektir. Arşivdeki soruları \"sınav öncesi tekrar\" moduyla karışık sırayla çözmek, konuyu baştan tekrar etmekten çok daha hızlı sonuç verir.",
   when:c=>c.qbankOpen>=5?(c.qbankOpen+" açık arşiv sorun var"):null,pri:7},

  {id:"t-aktif",cat:"yontem",title:"Okumak çalışmak değildir",
   body:"Konu anlatımını okumak ya da video izlemek tanıdıklık hissi verir ama hatırlama gücü kazandırmaz. Sayfayı kapatıp gördüğünü boş kâğıda yazabiliyorsan öğrenmişsindir. Bu his yanıltıcıdır ve çoğu \"çok çalışıp az net alma\" durumunun sebebidir.",
   when:c=>c.busyLowProgress?"Çok çalışıyorsun ama konu ilerlemen düşük":null,pri:9},

  {id:"t-plato",cat:"yontem",title:"Net sabitlendiyse yöntem değişmeli",
   body:"Üç dört denemedir aynı bandın etrafındaysan, daha fazla soru çözmek genelde işe yaramaz; aynı yöntemin daha fazlası aynı sonucu verir. Değişmesi gereken şey ne çözdüğün: son üç denemenin yanlışlarını konu konu topla ve bir haftayı yalnız o üç dört konuya ayır.",
   when:c=>c.plateau?"Son denemelerinde net neredeyse aynı":null,pri:10},

  {id:"t-zayif",cat:"yontem",title:"Zayıf dersi tamamen bırakma",
   body:"En sevmediğin dersi gözden çıkarmak kısa vadede rahatlatır, sıralamada pahalıya patlar. Ama hepsini kurtarmaya çalışmak da yanlış. Doğrusu: o dersin en çok soru gelen üç konusunu hedefle, gerisini bilinçli olarak bırak. Konular ekranındaki ağırlık etiketleri bunun için var.",
   when:()=>null,pri:4},

  {id:"t-pomodoro",cat:"odak",title:"Bölünme sayısı süreden önemli",
   body:"Dört saat çalışıp on kez telefona bakmak, iki buçuk saat kesintisiz çalışmaktan daha az iş görür. Her bölünmeden sonra derin odaklanmaya dönmek dakikalar alır. Odak sekmesindeki bölünme sayacına süreye baktığın kadar bak.",
   when:c=>c.dikkat>=3?("Son günlerde "+c.dikkat+" kez dikkatin dağılmış"):null,pri:8},

  {id:"t-planuyum",cat:"odak",title:"Plan tutmuyorsa plan yanlıştır",
   body:"Yazdığın planın sürekli yarısını yapıyorsan sorun disiplinde değil, planın gerçekçiliğinde. Bir haftalık gerçek verine bak ve planı ona göre küçült. Tamamlanan küçük plan, yarısı yapılmış büyük plandan hem daha çok iş çıkarır hem morali korur.",
   when:c=>c.fidelity!=null&&c.fidelity<0.6?("Plan sadakatin %"+Math.round(c.fidelity*100)):null,pri:9},

  {id:"t-optik",cat:"sinav",title:"Optiği bölüm bölüm doldur",
   body:"Optiği sona bırakmak her yıl birilerinin sınavını bitiriyor. Her bölümü bitirdiğinde o bölümün kodlamasını yap. Son beş dakikada yapılacak tek şey kaydırma kontrolü olmalı: soru numarasıyla işaretlediğin satır aynı mı.",
   when:c=>c.daysLeft<=21&&c.daysLeft>=0?"Sınava az kaldı":null,pri:9},

  {id:"t-sonbes",cat:"sinav",title:"Son beş dakika kuralı",
   body:"Son beş dakikada yeni soru çözmeye başlama. O süreyi boş kalanları işaretlemeye ve kodlama kontrolüne ayır. Panikle çözülen son soru, çoğu zaman yanlış kodlanan üç soruya mal olur.",
   when:c=>c.daysLeft<=21&&c.daysLeft>=0?"Sınav yaklaştı":null,pri:8},

  {id:"t-haftason",cat:"sinav",title:"Son hafta yeni konu yok",
   body:"Sınavdan önceki hafta yeni konu öğrenmek nadiren net kazandırır, çoğu zaman özgüven kaybettirir. O hafta yalnız bildiklerini pekiştir, formül tekrarları yap ve uyku düzenini sınav saatine göre kaydır. En büyük kazanç uykudan gelir.",
   when:c=>c.daysLeft<=10&&c.daysLeft>=0?"Sınava 10 günden az kaldı":null,pri:10},

  {id:"t-sabah",cat:"sinav",title:"Sınav sabahı",
   body:"Sabah yeni bir şey çözmeye çalışma; hafif bir formül taraması yeter. Belgeni, kalemini, saatini bir gece önce hazırla. Salona erken git ve sınav başlamadan iki dakika nefes egzersizi yap — kaygı, bildiğin soruyu görememenin bir numaralı sebebidir.",
   when:c=>c.daysLeft<=3&&c.daysLeft>=0?"Sınav günü çok yakın":null,pri:10},

  {id:"t-denemesik",cat:"analiz",title:"Deneme sıklığı",
   body:"Konu bitirme döneminde haftada bir genel deneme yeter; branş denemeleri daha çok iş görür. Son iki ayda haftada iki üç genel denemeye çıkmak, hem süre dayanıklılığı hem sınav ritmi kazandırır. Ama analiz edemeyeceğin sayıda deneme çözmek boşa emektir.",
   when:c=>c.lowDeneme?"Son 30 günde az deneme çözmüşsün":null,pri:7}
];

/* ---------- veri bağlamı ---------- */
function tacticContext(){
  const c={};
  const recent=S.denemeler.filter(d=>d.type!=="BRANS").sort((a,b)=>b.date.localeCompare(a.date)).slice(0,5);
  let blank=0,tot=0;
  recent.forEach(d=>(d.subjectResults||[]).forEach(sr=>{
    blank+=sr.b|0; tot+=(sr.d|0)+(sr.y|0)+(sr.b|0);
  }));
  c.blankRate=tot?blank/tot:0;
  c.blankCount=blank;
  c.timeShort=recent.filter(d=>d.refl&&d.refl.time==="yetmedi").length;
  const last3=recent.slice(0,3).map(d=>d.totalNet);
  c.plateau=last3.length>=3&&(Math.max.apply(null,last3)-Math.min.apply(null,last3))<2;
  c.daysLeft=daysUntil(S.examDate);
  const tw=topWrongTopics(1);
  c.wrongHeavy=(tw.length&&tw[0].n>=6)?tw[0].k:null;
  c.qbankOpen=S.qbank.filter(q=>!q.done).length;
  /* son 7 günde dikkat dağınıklığı */
  let dk=0;
  for(let i=0;i<7;i++){ const r=S.pauseReasons[addDaysKey(todayKey(),-i)]; if(r)dk+=r.dikkat|0; }
  c.dikkat=dk;
  /* son 3 haftanın plan sadakati */
  let filled=0,done=0;
  for(let w=0;w<3;w++){
    const wk=addDaysKey(keyOf(mondayOf(new Date())),-7*w),week=S.weeks[wk];
    if(!week)continue;
    const nw=normWeek(week);
    ["r","s"].forEach(blk=>(nw[blk]||[]).forEach((row,i)=>row.forEach((v,d)=>{
      if(v&&v.trim()){ filled++; if(nw.dn[blk+"-"+i+"-"+d])done++; }
    })));
  }
  c.fidelity=filled>=6?done/filled:null;
  /* çok çalışma az ilerleme */
  let min30=0;
  for(let i=0;i<30;i++)min30+=S.pomoMin[addDaysKey(todayKey(),-i)]||0;
  const rate=(typeof curriculumRate==="function")?curriculumRate(30):0;
  c.busyLowProgress=min30>=1800&&rate<0.35;
  const cut=addDaysKey(todayKey(),-30);
  const cnt=S.denemeler.filter(d=>d.date>=cut&&d.type!=="BRANS").length;
  c.lowDeneme=c.daysLeft<=150&&c.daysLeft>=0&&cnt<2;
  c.denemeSık=cnt>=6;
  return c;
}
function activeTactics(){
  const c=tacticContext(),out=[];
  TACTICS.forEach(t=>{
    let why=null;
    try{ why=t.when(c); }catch(e){ why=null; }
    if(why)out.push({t:t,why:why});
  });
  out.sort((a,b)=>b.t.pri-a.t.pri);
  return out.slice(0,5);
}

/* ---------- arayüz ---------- */
let tacCat="hepsi",tacOpen={};
function setTacCat(k){ tacCat=k; renderTactics(); }
function toggleTactic(id){ tacOpen[id]=!tacOpen[id]; renderTactics(); }
function tacticCard(t,why){
  const open=!!tacOpen[t.id];
  const catName=(TAC_CATS.find(c=>c[0]===t.cat)||[null,""])[1];
  return `<div class="taccard ${open?"open":""}" onclick="toggleTactic('${t.id}')">
    <div class="tach">
      <div style="flex:1;min-width:0">
        <div class="tact">${esc(t.title)}</div>
        <div class="tacm">${esc(catName)}${why?' · <span class="tacwhy">'+esc(why)+'</span>':""}</div>
      </div>
      <span class="tacarrow"><svg viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></svg></span>
    </div>
    <div class="tacb">${esc(t.body)}</div>
  </div>`;
}
function renderTactics(){
  const hot=el("tacHot");
  if(hot){
    const act=activeTactics();
    hot.innerHTML=act.length
      ? act.map(a=>tacticCard(a.t,a.why)).join("")
      : '<div class="empty">Verilerinde belirgin bir sorun görünmüyor. Aşağıdaki listeden dilediğini okuyabilirsin.</div>';
  }
  const chips=el("tacCats");
  if(chips)chips.innerHTML=TAC_CATS.map(c=>
    `<button class="chip ${c[0]===tacCat?"on":""}" onclick="setTacCat('${c[0]}')">${esc(c[1])}</button>`).join("");
  const list=el("tacList");
  if(list){
    const items=TACTICS.filter(t=>tacCat==="hepsi"||t.cat===tacCat);
    list.innerHTML=items.map(t=>tacticCard(t,null)).join("");
  }
}

/* ==================================================================
   TAHMİN HESAPLAYICISI
   ================================================================== */
let guessElim=1;
/* 5 şık, 4 yanlış 1 doğruyu götürür */
function guessValue(elim){
  const left=Math.max(1,5-Math.max(0,Math.min(4,elim)));
  const p=1/left;
  return r2(p*1-(1-p)*0.25);
}
function setGuessElim(n){ guessElim=Math.max(0,Math.min(4,n|0)); renderGuess(); }
function renderGuess(){
  const w=el("guessBox"); if(!w)return;
  const chips=el("guessChips");
  if(chips)chips.innerHTML=[0,1,2,3,4].map(n=>
    `<button class="chip ${n===guessElim?"on":""}" onclick="setGuessElim(${n})">${n} şık</button>`).join("");
  const n=Math.max(0,parseInt((el("guessCount")||{value:"20"}).value,10)||0);
  const ev=guessValue(guessElim);
  const total=r2(ev*n);
  const left=5-guessElim;
  let verdict,col;
  if(guessElim===0){ verdict="Tam olarak nötr. İşaretlemek de boş bırakmak da uzun vadede aynı."; col="var(--label-2)"; }
  else if(guessElim>=3){ verdict="Kesinlikle işaretle. Beklenen kazanç yüksek."; col="var(--success)"; }
  else { verdict="İşaretle. Boş bırakmak burada net kaybıdır."; col="var(--success)"; }
  let html=`<div class="dayrow"><span class="k">Kalan şık</span><span class="v">${left}</span></div>
    <div class="dayrow"><span class="k">Doğru olma ihtimali</span><span class="v">%${Math.round(100/left)}</span></div>
    <div class="dayrow"><span class="k">Soru başına beklenen net</span>
      <span class="v" style="color:${ev>0?"var(--success)":"var(--label-2)"}">${ev>0?"+":""}${ev}</span></div>
    <div class="dayrow"><span class="k">${n} soruda toplam</span>
      <span class="v" style="color:${total>0?"var(--success)":"var(--label-2)"}">${total>0?"+":""}${total} net</span></div>
    <p class="hint" style="color:${col}">${esc(verdict)}</p>`;
  /* kişisel istatistik */
  const c=tacticContext();
  if(c.blankCount>0){
    const gain=r2(c.blankCount*guessValue(1));
    html+=`<p class="hint"><b>Senin verinle:</b> son denemelerinde toplam ${c.blankCount} soru boş bırakmışsın (boş oranı %${Math.round(c.blankRate*100)}).
      Bunların yalnızca birer şıkkını eleyip işaretleseydin beklenen kazanç ≈ ${gain} net olurdu.</p>`;
  } else {
    html+='<p class="hint">Deneme girdikçe burada kendi boş bırakma alışkanlığının sana neye mal olduğu da çıkacak.</p>';
  }
  html+='<p class="hint">Hesap YKS kuralına göre: 5 şık, 4 yanlış 1 doğruyu götürür. Hiç eleme yapmadan işaretlemek matematiksel olarak <b>nötrdür</b> — zarar değil. Bir şık bile elediğinde artıya geçer.</p>';
  w.innerHTML=html;
}

/* ==================================================================
   BAŞLATMA
   ================================================================== */
function boot8(){
  boot7();
  perfIdle("boot-tactics",()=>{renderTactics();renderGuess();},1100);
}
/* boot çağrısı app14 sonunda yapılır */
/* ==================================================================
   HOCALAR — YKS YouTube rehberi
   Bağlantılar sabit kanal adresi değil, YouTube araması açar:
   kanal adresi değişse de bağlantı ölmez, sonuç her zaman günceldir.
   ================================================================== */

const LEVELS={baslangic:"Başlangıç",orta:"Orta",ileri:"İleri",hepsi:"Her seviye"};
const LVL_ORDER=["hepsi","baslangic","orta","ileri"];

/* d: dersler · l: seviye · n: not · t: içerik türleri */
const TEACHERS=[
  /* --- Matematik --- */
  {a:"Şenol Hoca",d:["Matematik"],l:"baslangic",n:"Sıfırdan başlayanlar için tane tane anlatım; temel kurmak isteyenlerin ilk durağı.",t:["konu","soru"]},
  {a:"MatMan",d:["Matematik"],l:"baslangic",n:"Akıcı ve sade anlatım, konuyu ilk kez öğrenirken rahat takip edilir.",t:["konu"]},
  {a:"Matematik Kafası",d:["Matematik"],l:"baslangic",n:"Adım adım çözüm videoları, TYT matematiği sıfırdan işler.",t:["konu","soru"]},
  {a:"İlyas Güneş",d:["Matematik"],l:"orta",n:"Dinamik ve eğlenceli; temeli olan ama hız kazanmak isteyenler için.",t:["konu","soru"]},
  {a:"Matematiğin Güler Yüzü",d:["Matematik"],l:"hepsi",n:"Her seviyeye hitap eden geniş arşiv, konu ve soru dengeli.",t:["konu","soru"]},
  {a:"Rehber Matematik",d:["Matematik"],l:"orta",n:"Detaylı soru çözümleri ve sınav stratejisi videoları.",t:["soru","deneme"]},
  {a:"3 Dakikada Matematik",d:["Matematik"],l:"orta",n:"Kısa ve öz videolar; hızlı tekrar ve sınav öncesi için ideal.",t:["konu"]},
  {a:"Eyüp B.",d:["Matematik"],l:"ileri",n:"Kapsamlı konu anlatımı ve püf noktalar; sıfırdan başlayana ağır gelebilir.",t:["konu","soru"]},
  {a:"Mert Hoca",d:["Matematik","Geometri"],l:"ileri",n:"AYT matematiğinde ileri seviye soru çözümü ve strateji.",t:["soru","deneme"]},
  {a:"SML Hoca",d:["Matematik"],l:"ileri",n:"Farklı ve zor soru tarzları; üst düzey hedefler için.",t:["soru"]},
  {a:"Tunç Kurt",d:["Matematik"],l:"ileri",n:"Zorlayıcı sorular, derece hedefleyenlere yönelik.",t:["soru"]},
  {a:"Yektug Mat",d:["Matematik"],l:"ileri",n:"Özgün soru çözümleri, alışılmadık yaklaşımlar.",t:["soru"]},
  {a:"Barış Çelenk",d:["Matematik"],l:"ileri",n:"Özgün sorular; üst düzey hedefler için sağlam bir kaynak.",t:["soru"]},

  /* --- Geometri --- */
  {a:"Kenan Kara",d:["Geometri"],l:"baslangic",n:"Geometriye sıfırdan başlayanlar için yaygın olarak önerilir.",t:["konu","soru"]},

  /* --- Türkçe / Edebiyat --- */
  {a:"Rüştü Hoca",d:["Türkçe","Edebiyat"],l:"orta",n:"Paragraf teknikleri ve nokta atışı edebiyat bilgisi; ÖSYM tarzına yakın.",t:["konu","soru","deneme"]},
  {a:"Harun Ardıç",d:["Türkçe","Edebiyat"],l:"hepsi",n:"Konular çalışma sırasına göre oynatma listelerinde; baştan sona takip edilebilir.",t:["konu","soru"]},
  {a:"Kampüs (Tonguç)",d:["Türkçe","Edebiyat","Felsefe","Din Kültürü"],l:"baslangic",n:"Grafiklerle desteklenen anlaşılır anlatım; temel seviye için uygun.",t:["konu"]},

  /* --- Fizik --- */
  {a:"Özcan Aykın",d:["Fizik"],l:"baslangic",n:"Sıfırdan fizik için sık önerilen isim; temel kurmaya elverişli.",t:["konu","soru"]},
  {a:"VIP Fizik",d:["Fizik"],l:"baslangic",n:"Tane tane anlatım, acele etmeyen tempo.",t:["konu"]},
  {a:"Fizik Adam",d:["Fizik"],l:"baslangic",n:"Görsel ve deney destekli anlatım; konuyu somutlaştırır.",t:["konu"]},
  {a:"Umut Öncül",d:["Fizik"],l:"orta",n:"Kavramsal derinlik; \"neden böyle\" sorusunu önemseyenler için.",t:["konu","soru"]},
  {a:"Ertan Sinan Şahin",d:["Fizik"],l:"ileri",n:"Derinlemesine işleyiş ve ÖSYM tarzı soru çözümleri.",t:["konu","soru","deneme"]},

  /* --- Kimya --- */
  {a:"Kimya Adası",d:["Kimya"],l:"baslangic",n:"Kimyanın tamamını kapsayan anlaşılır seri; temel atmak için ideal.",t:["konu"]},
  {a:"Meschemy Kimya",d:["Kimya"],l:"baslangic",n:"Temel ve orta seviye arası köprü kuran anlatım.",t:["konu","soru"]},
  {a:"Görkem Şahin",d:["Kimya"],l:"hepsi",n:"Dinamik ve eğlenceli; kimyadan soğumuş öğrencilerde işe yarıyor.",t:["konu","soru"]},
  {a:"Paraksilen Kimya",d:["Kimya"],l:"orta",n:"Soru odaklı, taktik ağırlıklı içerik.",t:["soru"]},
  {a:"Levent Özdede",d:["Kimya"],l:"orta",n:"Net ve anlaşılır anlatım, gereksiz uzatmadan.",t:["konu","soru"]},
  {a:"Semih Balmuk",d:["Kimya"],l:"orta",n:"Konu ve soru dengesi kurulmuş içerik.",t:["konu","soru"]},

  /* --- Biyoloji --- */
  {a:"FUNDAmentals Biyoloji",d:["Biyoloji"],l:"baslangic",n:"Müfredata birebir uyumlu, temel atmak için sık önerilir.",t:["konu"]},
  {a:"Biosem",d:["Biyoloji"],l:"baslangic",n:"Dinamik ve kısa soru çözümleri.",t:["soru"]},
  {a:"Betül Biyoloji",d:["Biyoloji"],l:"baslangic",n:"Tane tane anlatım, acemi öğrenciye uygun tempo.",t:["konu"]},
  {a:"Seda Hoca",d:["Biyoloji"],l:"baslangic",n:"Temel dersler için sade anlatım.",t:["konu"]},
  {a:"Selin Hoca",d:["Biyoloji"],l:"orta",n:"Sade ve duru anlatım; başlangıçtan ortaya geçiş için.",t:["konu"]},
  {a:"Cici Biyoloji",d:["Biyoloji"],l:"orta",n:"Tekrar ve konu özetleri; sınav öncesi hızlı geçiş.",t:["konu"]},
  {a:"Biyoloji Hocası",d:["Biyoloji"],l:"orta",n:"Şema ve görsellerle zenginleştirilmiş konu anlatımı.",t:["konu","soru"]},
  {a:"Senin Biyolojin",d:["Biyoloji"],l:"ileri",n:"Kaliteli soru çözümleri; orta-ileri seviye.",t:["soru","deneme"]},
  {a:"Dr. Biyoloji",d:["Biyoloji"],l:"ileri",n:"Detaylı anlatım ve tıptan örnekler; sıfırdan başlayana ağır gelebilir.",t:["konu","soru"]},

  /* --- Tarih --- */
  {a:"OK Tarih",d:["Tarih"],l:"hepsi",n:"Osman Kılık hocanın kanalı; uzun ama akıcı, kapsamlı anlatım.",t:["konu","soru"]},
  {a:"Benim Hocam",d:["Kimya","Coğrafya","Tarih"],l:"orta",n:"Farklı derslerde hoca barındıran platform: kimyada Görkem Şahin, coğrafyada Bayram Hoca. Sohbet tadında anlatım.",t:["konu","soru"]},
  {a:"Tarih Meraklısı",d:["Tarih"],l:"orta",n:"Konuyu hikâyeleştirerek anlatan içerik.",t:["konu"]},

  /* --- Coğrafya --- */
  {a:"Yavuz Tuna Coğrafya",d:["Coğrafya"],l:"hepsi",n:"Detaylı konu anlatımı ve soru çözüm listeleri.",t:["konu","soru"]},
  {a:"KR Akademi",d:["Coğrafya"],l:"orta",n:"Konu anlatımı ve tekrar videoları.",t:["konu"]},

  /* --- Felsefe --- */
  {a:"Felsefe Hocası",d:["Felsefe"],l:"hepsi",n:"TYT ve AYT felsefeyi kapsamlı işleyen kanal.",t:["konu","soru"]},

  /* --- Genel --- */
  {a:"Hocalara Geldik",d:["Türkçe","Matematik","Geometri","Fizik","Kimya","Biyoloji","Tarih","Coğrafya","Felsefe","Din Kültürü","Edebiyat"],
   l:"hepsi",n:"Bütün derslerde konu anlatımı ve soru çözümü olan köklü platform; ders değiştirmeden aynı yerde kalmak isteyenler için.",t:["konu","soru","deneme"]},
  {a:"Ferhat Yıldız",d:["İngilizce"],l:"hepsi",n:"Seviye seviye oynatma listeleri; YDT ve dil için.",t:["konu"]},
  {a:"Bıyıklı Matematik",d:["Matematik","Türkçe"],l:"baslangic",n:"Temel seviye için yaygın olarak önerilir; dil bilgisi ve paragrafta da içerik üretir.",t:["konu","soru"]},
  {a:"Moz Akademi",d:["Matematik"],l:"ileri",n:"Konu anlatımından çok soru çözümü; konuyu soru üzerinden işler, temeli olanlar için.",t:["soru"]},
  {a:"Nurtaç Hoca",d:["Geometri"],l:"orta",n:"Geometri konu anlatımı ve soru çözümü.",t:["konu","soru"]},
  {a:"Merkeze Teğet Geometri",d:["Geometri"],l:"ileri",n:"Geometride ileri seviye soru çözümleri.",t:["soru"]},
  {a:"Deniz Hoca",d:["Edebiyat"],l:"orta",n:"Edebiyat konu anlatımı; Rüştü Hoca ile birlikte sık önerilen isim.",t:["konu","soru"]},
  {a:"Altuğ Güneş",d:["Fizik"],l:"orta",n:"Fizikte anlaşılır anlatım; Özcan Aykın'a alternatif olarak önerilir.",t:["konu","soru"]},
  {a:"Fizikfinito",d:["Fizik"],l:"orta",n:"Soru çözümü ağırlıklı fizik kanalı.",t:["soru"]},
  {a:"Fizik Evim",d:["Fizik"],l:"baslangic",n:"Temel fizik konularını sade anlatan kanal.",t:["konu"]},
  {a:"Coğrafyanın Kodları",d:["Coğrafya"],l:"baslangic",n:"Kodlama tekniğiyle ezber yükünü azaltır; kavram kalabalığında işe yarar.",t:["konu"]},
  {a:"Tonguç Akademi",d:["Türkçe","Matematik","Fizik","Kimya","Biyoloji","Tarih","Coğrafya","Edebiyat"],l:"baslangic",n:"Geniş arşiv, temel seviye; her derste konu anlatımı ve yaprak test çözümü.",t:["konu","soru"]},
  {a:"Türkçenin Matematiği",d:["Türkçe"],l:"orta",n:"Paragrafta teknik odaklı anlatım. Öğrenciler arasında tekniklerinin ezbere kaydığı yönünde eleştiri de var; bir videosunu izleyip kendin karar ver.",t:["konu","soru"]},
  {a:"Kimya Sarmal",d:["Kimya"],l:"orta",n:"Konu ve soru dengesi kurulmuş kimya içeriği.",t:["konu","soru"]},
];

const TEACH_SUBJECTS=(function(){
  const set={};
  TEACHERS.forEach(t=>t.d.forEach(x=>{set[x]=1;}));
  return Object.keys(set).sort((a,b)=>a.localeCompare(b,"tr"));
})();

/* ---------- kullanıcının kendi eklediği hocalar ---------- */
function allTeachers(){
  const own=(S.teachers||[]).map(t=>({a:t.a,d:t.d||[],l:t.l||"hepsi",n:t.n||"",t:["konu","soru"],own:true,id:t.id}));
  return TEACHERS.concat(own);
}
function addTeacher(){
  const a=(el("thName").value||"").trim().slice(0,40);
  const d=el("thSubject").value;
  const l=el("thLevel").value;
  const n=(el("thNote").value||"").trim().slice(0,160);
  if(!a){ toast("Hoca ya da kanal adı gir"); return; }
  if(!d){ toast("Ders seç"); return; }
  S.teachers.push({id:Date.now(),a:a,d:[d],l:l,n:n});
  save(); el("thName").value=""; el("thNote").value="";
  renderTeachers(); toast("Eklendi ✓");
}
function delTeacher(id){
  const bk=clone((S.teachers||[]).find(t=>t.id===id));
  S.teachers=(S.teachers||[]).filter(t=>t.id!==id); save();
  if(bk)pushUndo("Hoca silindi: "+bk.a,()=>{ S.teachers.push(bk); });
  renderTeachers();
}
function toggleFavTeacher(name){
  const i=S.favTeachers.indexOf(name);
  if(i>=0)S.favTeachers.splice(i,1); else S.favTeachers.push(name);
  save(); renderTeachers();
  toast(i>=0?"Favorilerden çıkarıldı":"Favorilere eklendi ★");
}

/* ---------- YouTube bağlantıları ---------- */
function ytSearch(q){
  return "https://www.youtube.com/results?search_query="+encodeURIComponent(q);
}
function openExternalUrl(url){
  const u=String(url||""); if(!/^https?:\/\//i.test(u))return false;
  const local=(location.hostname==="localhost"||location.hostname==="127.0.0.1");
  if(local){
    fetch("/__open_brave?url="+encodeURIComponent(u),{cache:"no-store"}).then(r=>{
      if(!r.ok)throw new Error("Brave açılamadı");
    }).catch(()=>{ try{ window.open(u,"_blank","noopener"); }catch(e){ location.href=u; } });
  }else{
    try{ window.open(u,"_blank","noopener"); }catch(e){ location.href=u; }
  }
  return true;
}
function openYt(q){
  const url=ytSearch(q);
  openExternalUrl(url);
  toast("YouTube araması Brave'de açıldı");
  return url;
}
function teacherQuery(name,kind,subject){
  const s=subject?(" "+subject):"";
  if(kind==="tyt")return name+" TYT"+s+" konu anlatımı";
  if(kind==="ayt")return name+" AYT"+s+" konu anlatımı";
  if(kind==="soru")return name+s+" soru çözümü";
  if(kind==="deneme")return name+s+" deneme çözümü branş denemesi";
  if(kind==="kanal")return name+" YKS";
  return name+s;
}
/* uygulama içi video listesini açar; kaynak yoksa YouTube'a düşer */
function ytTeacher(name,kind,subject){
  const q=teacherQuery(name,kind,subject);
  if(typeof openVideos!=="function")return openYt(q);
  /* kanalla sınırlanınca hoca adını sorguda tekrar etmeye gerek yok */
  const inChannel={tyt:"TYT "+(subject||"")+" konu anlatımı",
                   ayt:"AYT "+(subject||"")+" konu anlatımı",
                   soru:(subject||"")+" soru çözümü",
                   deneme:(subject||"")+" deneme branş",
                   kanal:""}[kind];
  return openVideos(inChannel!==undefined?(inChannel||subject||"").trim():q,name,
    {teacher:name,subject:subject||"",kind:(kind==="kanal"?"":kind)});
}

/* ---------- filtre ve liste ---------- */
let thSubj="",thLvl="",thOpen="";
function setThSubj(v){ thSubj=(thSubj===v)?"":v; renderTeachers(); }
function setThLvl(v){ thLvl=(thLvl===v)?"":v; renderTeachers(); }
function toggleTeacher(name){
  thOpen=(thOpen===name)?"":name;
  document.body.classList.toggle("teacher-open",!!thOpen);
  renderTeachers();
}
function closeTeacher(){
  thOpen="";
  document.body.classList.remove("teacher-open");
  renderTeachers();
}
function filteredTeachers(){
  const q=(el("thSearch")&&el("thSearch").value||"").trim().toLocaleLowerCase("tr");
  let list=allTeachers().filter(t=>{
    if(thSubj&&t.d.indexOf(thSubj)<0)return false;
    if(thLvl&&t.l!==thLvl&&t.l!=="hepsi")return false;
    if(q&&t.a.toLocaleLowerCase("tr").indexOf(q)<0&&
        (t.n||"").toLocaleLowerCase("tr").indexOf(q)<0)return false;
    return true;
  });
  const fav=S.favTeachers||[];
  list.sort((a,b)=>{
    const fa=fav.indexOf(a.a)>=0?0:1,fb=fav.indexOf(b.a)>=0?0:1;
    if(fa!==fb)return fa-fb;
    const la=LVL_ORDER.indexOf(a.l),lb=LVL_ORDER.indexOf(b.l);
    if(la!==lb)return la-lb;
    return a.a.localeCompare(b.a,"tr");
  });
  return list;
}
/* süzülen ders varsa kartta önce o görünsün — yoksa çok dersli
   kayıtlarda eşleşen ders listede hiç görünmüyor */
function shownSubjects(t){
  const d=t.d.slice();
  if(thSubj){
    const i=d.indexOf(thSubj);
    if(i>0){ d.splice(i,1); d.unshift(thSubj); }
  }
  return d.slice(0,3);
}
function teacherCard(t){
  const open=thOpen===t.a;
  const fav=(S.favTeachers||[]).indexOf(t.a)>=0;
  const subj=thSubj||t.d[0]||"";
  const esc2=v=>String(v).replace(/'/g,"\\'");
  let body="";
  if(open){
    body='<div class="thb">'+
      '<div class="rowtools" style="margin:0 0 10px;">'+
        '<button class="btn ghost tiny" onclick="event.stopPropagation();ytTeacher(\''+esc2(t.a)+'\',\'tyt\',\''+esc2(subj)+'\')">TYT konu</button>'+
        '<button class="btn ghost tiny" onclick="event.stopPropagation();ytTeacher(\''+esc2(t.a)+'\',\'ayt\',\''+esc2(subj)+'\')">AYT konu</button>'+
        '<button class="btn ghost tiny" onclick="event.stopPropagation();ytTeacher(\''+esc2(t.a)+'\',\'soru\',\''+esc2(subj)+'\')">Soru çözümü</button>'+
        '<button class="btn ghost tiny" onclick="event.stopPropagation();ytTeacher(\''+esc2(t.a)+'\',\'deneme\',\''+esc2(subj)+'\')">Deneme / branş</button>'+
        '<button class="btn ghost tiny" onclick="event.stopPropagation();ytTeacher(\''+esc2(t.a)+'\',\'kanal\',\'\')">Kanalı bul</button>'+
      '</div>'+
      '<p class="hint" style="margin:0;">Dersleri: '+esc(t.d.join(", "))+'</p>'+
      (t.own?'<button class="del" onclick="event.stopPropagation();delTeacher('+t.id+')">Bu kaydı sil</button>':"")+
      '</div>';
  }
  return '<div class="thcard '+(open?"open":"")+'"'+(open?'':' onclick="toggleTeacher(\''+esc2(t.a)+'\')"')+'>'+
    (open?'<div class="thmodalbar"><span>Hoca ayrıntısı</span><button class="btn ghost tiny thclose" onclick="event.stopPropagation();closeTeacher()">Kapat</button></div>':"")+
    '<div class="thh">'+
      '<div style="flex:1;min-width:0">'+
        '<div class="tht">'+esc(t.a)+(t.own?' <span class="thown">senin</span>':"")+'</div>'+
        '<div class="thm"><span class="thlvl l-'+t.l+'">'+LEVELS[t.l]+'</span> · '+esc(shownSubjects(t).join(", "))+
          (t.d.length>3?" +"+(t.d.length-3):"")+'</div>'+
        (t.n?'<div class="thn">'+esc(t.n)+'</div>':"")+
      '</div>'+
      '<button class="thfav '+(fav?"on":"")+'" onclick="event.stopPropagation();toggleFavTeacher(\''+esc2(t.a)+'\')" aria-label="Favori">★</button>'+
    '</div>'+body+'</div>';
}
function renderTeachers(){
  const sc=el("thSubjChips");
  if(sc)sc.innerHTML='<button class="chip '+(thSubj?"":"on")+'" onclick="setThSubj(\'\')">Tüm dersler</button>'+
    TEACH_SUBJECTS.map(s=>'<button class="chip '+(thSubj===s?"on":"")+'" onclick="setThSubj(\''+s.replace(/'/g,"\\'")+'\')">'+esc(s)+'</button>').join("");
  const lc=el("thLvlChips");
  if(lc)lc.innerHTML='<button class="chip '+(thLvl?"":"on")+'" onclick="setThLvl(\'\')">Tüm seviyeler</button>'+
    ["baslangic","orta","ileri"].map(k=>'<button class="chip '+(thLvl===k?"on":"")+'" onclick="setThLvl(\''+k+'\')">'+LEVELS[k]+'</button>').join("");
  const sel=el("thSubject");
  if(sel&&!sel.options.length)
    sel.innerHTML='<option value="">Ders seç…</option>'+SUBJ_NAMES.map(n=>'<option value="'+esc(n)+'">'+esc(n)+'</option>').join("");
  const w=el("thList"); if(!w)return;
  const list=filteredTeachers();
  const info=el("thInfo");
  if(info)info.textContent=list.length+" kayıt"+(thSubj?" · "+thSubj:"")+(thLvl?" · "+LEVELS[thLvl]:"");
  if(!list.length){ w.innerHTML='<div class="empty">Bu filtreyle kayıt yok. Filtreyi gevşet ya da kendi hocanı ekle.</div>'; return; }
  w.innerHTML=list.map(teacherCard).join("");
}

/* ---------- konuya göre video arama ---------- */
function renderTopicVideo(){
  const sel=el("tvSubject");
  if(sel&&!sel.options.length)
    sel.innerHTML='<option value="">Ders seç…</option>'+SUBJ_NAMES.map(n=>'<option value="'+esc(n)+'">'+esc(n)+'</option>').join("");
}
function searchTopicVideo(kind){
  const subj=(el("tvSubject").value||"").trim();
  const topic=(el("tvTopic").value||"").trim();
  if(!subj){ toast("Ders seç"); return ""; }
  const base=subj+(topic?" "+topic:"");
  const go2=(q,t)=>(typeof openVideos==="function")
    ?openVideos(q,t,{subject:subj,topic:topic}):openYt(q);
  if(kind==="konu")return go2(base+" konu anlatımı YKS",base);
  if(kind==="soru")return go2(base+" soru çözümü YKS",base);
  if(kind==="ozet")return go2(base+" hızlı tekrar özet YKS",base);
  return go2(base+" YKS",base);
}
/* zayıf konudan doğrudan video araması */
function videoForWeakTopic(){
  const rq=(typeof reviewQueue==="function")?reviewQueue():[];
  if(rq.length)return {subj:rq[0].subj,topic:rq[0].topic,why:"tekrar zamanı gelen konu"};
  const tw=(typeof topWrongTopics==="function")?topWrongTopics(1):[];
  if(tw.length){
    const p=tw[0].k.split(" · ");
    return {subj:p[0],topic:p[1]||"",why:"en çok hata yaptığın konu"};
  }
  const st=(typeof stalestTopic==="function")?stalestTopic():null;
  if(st)return {subj:st.subj,topic:st.topic,why:"sıradaki konun"};
  return null;
}
function renderVideoSuggest(){
  const w=el("tvSuggest"); if(!w)return;
  const s=videoForWeakTopic();
  if(!s){ w.innerHTML='<div class="empty">Konu ve deneme verin biriktikçe burada "şu konuyu izle" önerisi çıkar.</div>'; return; }
  const esc2=v=>String(v).replace(/'/g,"\\'");
  w.innerHTML='<div class="dayrow"><span class="k"><b style="color:var(--label)">'+esc(s.subj)+' · '+esc(s.topic)+'</b><br><small>'+esc(s.why)+'</small></span></div>'+
    '<div class="rowtools" style="margin:12px 0 0;">'+
      '<button class="btn ghost tiny" onclick="openYt(\''+esc2(s.subj+" "+s.topic+" konu anlatımı YKS")+'\')">Konu anlatımı</button>'+
      '<button class="btn ghost tiny" onclick="openYt(\''+esc2(s.subj+" "+s.topic+" soru çözümü YKS")+'\')">Soru çözümü</button>'+
    '</div>';
}

/* ==================================================================
   BAŞLATMA
   ================================================================== */
function renderHocalar(){ renderTeachers(); renderTopicVideo(); renderVideoSuggest(); }
function boot9(){
  boot8();
  perfIdle("boot-hocalar",()=>renderHocalar(),1150);
}
/* boot çağrısı app15 sonunda yapılır */
/* ==================================================================
   UYGULAMA İÇİ VİDEO LİSTESİ
   YouTube arama sayfası iframe'e alınamaz; video listesi ancak
   YouTube Data API ile gelir. Uygulama paketinde paylaşılan anahtar yoktur;
   kullanıcı isterse yalnız kendi cihazında kişisel anahtarını saklar.
   ================================================================== */

/* Güvenlik: dağıtılan pakette YouTube API anahtarı tutulmaz. */
const YT_BUILTIN_KEY="";
function ytKey(){
  const c=ytCfg();
  return (c.key&&c.key.trim())?c.key.trim():YT_BUILTIN_KEY;
}
function ytUsingBuiltin(){
  const c=ytCfg();
  return !(c.key&&c.key.trim())&&!!YT_BUILTIN_KEY;
}
function ytCfg(){
  if(!S.yt||typeof S.yt!=="object")S.yt={};
  if(typeof S.yt.key!=="string")S.yt.key="";
  if(["auto","key","gas","link"].indexOf(S.yt.src)<0)S.yt.src="auto";
  if(typeof S.yt.err!=="string")S.yt.err="";
  return S.yt;
}
function ytSource(){
  const c=ytCfg();
  if(c.src==="link")return "link";
  if(ytKey())return "key";
  return "link";
}
function saveYtKey(){
  const c=ytCfg();
  c.key=(el("ytKey").value||"").trim().slice(0,60);
  const sel=el("ytSrc"); if(sel)c.src=sel.value;
  c.err=""; save(); renderYtSettings();
  toast(c.key?"Anahtar bu cihazda kaydedildi":"Anahtar temizlendi · YouTube bağlantısı kullanılacak");
}
function renderYtSettings(){
  const c=ytCfg();
  const k=el("ytKey");
  if(k&&document.activeElement!==k){
    k.value=c.key;
    k.placeholder="AIza... (yalnız bu cihazda)";
  }
  const sel=el("ytSrc"); if(sel)sel.value=c.src;
  const st=el("ytStatus"); if(!st)return;
  const src=ytSource();
  if(src==="key"){
    st.textContent="Kendi API anahtarın kullanılıyor · video listesi hazır.";
    st.style.color="var(--success)";
  }
  else if(src==="gas"){ st.textContent="Apps Script üzerinden çalışacak · tabloda YouTube servisini açman gerekir."; st.style.color="var(--success)"; }
  else { st.textContent="Kaynak kapalı · düğmeler YouTube'u açar."; st.style.color="var(--label-3)"; }
  if(c.err){ st.textContent="Hata: "+c.err; st.style.color="var(--danger)"; }
}

/* ---------- JSONP taşıyıcı ----------
   file:// üzerinden açılan sayfalarda tarayıcı fetch isteklerini CORS
   gerekçesiyle hiç göndermiyor. <script> etiketiyle yapılan istek bu
   kurala tabi değil; Google API'leri callback parametresini destekliyor. */
function jsonpFetch(url,timeoutMs){
  return new Promise((resolve,reject)=>{
    const cb="__ytcb_"+Date.now().toString(36)+Math.floor(Math.random()*1e6).toString(36);
    const sc=document.createElement("script");
    let done=false;
    const cleanup=()=>{
      try{ delete window[cb]; }catch(e){ window[cb]=undefined; }
      if(sc.parentNode)sc.parentNode.removeChild(sc);
    };
    window[cb]=data=>{ if(done)return; done=true; cleanup(); resolve(data); };
    sc.onerror=()=>{ if(done)return; done=true; cleanup(); reject(new Error("JSONP isteği yüklenemedi")); };
    sc.src=url+(url.indexOf("?")>=0?"&":"?")+"callback="+cb;
    sc.async=true;
    (document.head||document.documentElement).appendChild(sc);
    setTimeout(()=>{ if(done)return; done=true; cleanup(); reject(new Error("JSONP zaman aşımı (10 sn)")); },timeoutMs||10000);
  });
}
function isFileProtocol(){
  try{ return location.protocol==="file:"; }catch(e){ return false; }
}

/* ---------- arama ---------- */
function ytApiError(msg){
  const e=new Error(msg);
  e.api=true;          /* taşıma hatası değil, sunucudan gelen anlamlı hata */
  return e;
}
let ytLastPage="";
function ytParseSearch(j,how){
  if(j&&j.error){
    const m=(j.error.message||"API hatası");
    const rs=(j.error.errors&&j.error.errors[0]&&j.error.errors[0].reason)||"";
    ytCfg().raw=how+" · "+(rs?rs+" · ":"")+m;
    if(/quota/i.test(m)||/quotaExceeded/i.test(rs))
      throw ytApiError("Günlük YouTube kotası doldu — yarın yenilenir ya da kendi anahtarını girebilirsin");
    if(/accessNotConfigured/i.test(rs)||/has not been used in project/i.test(m))
      throw ytApiError("Google Cloud'da YouTube Data API v3 etkinleştirilmemiş");
    if(/API key not valid|expired|badRequest/i.test(m+rs))
      throw ytApiError("Anahtar geçersiz görünüyor — Ayarlar'dan kontrol et");
    throw ytApiError(m.slice(0,120));
  }
  const items=(j&&j.items)||[];
  ytLastPage=(j&&j.nextPageToken)||"";
  ytCfg().raw=how+" · "+items.length+" sonuç";
  return items.map(it=>({
    /* arama sonucu video, oynatma listesi ya da kanal olabilir */
    id:(it.id&&(it.id.videoId||it.id.playlistId||it.id.channelId))||"",
    kind:(it.id&&it.id.kind)||"",
    title:(it.snippet&&it.snippet.title)||"",
    ch:(it.snippet&&it.snippet.channelTitle)||"",
    thumb:(it.snippet&&it.snippet.thumbnails&&(it.snippet.thumbnails.medium||it.snippet.thumbnails.default)||{}).url||"",
    date:(it.snippet&&it.snippet.publishedAt)||""
  })).filter(v=>v.id);
}
function ytUrl(params){
  const base="https://www.googleapis.com/youtube/v3/search?part=snippet&key="+encodeURIComponent(ytKey());
  let u=base;
  Object.keys(params).forEach(k=>{
    if(params[k]===undefined||params[k]===null||params[k]==="")return;
    u+="&"+k+"="+encodeURIComponent(params[k]);
  });
  return u;
}
/* ---------- kanal çözümleme ----------
   Aramayı kanalla sınırlamazsak "Hoca TYT" sorgusu o hocanın
   TYT videolarını değil, alakalı gördüğü her şeyi getiriyor. */
function chCache(){
  if(!S.chCache||typeof S.chCache!=="object")S.chCache={};
  return S.chCache;
}
function resolveChannel(name){
  if(!name)return Promise.resolve("");
  const c=chCache(),hit=c[name];
  if(hit&&hit.id&&(Date.now()-(hit.at||0))<30*86400000)return Promise.resolve(hit.id);
  if(hit&&hit.miss&&(Date.now()-(hit.at||0))<3*86400000)return Promise.resolve("");
  return ytRaw(ytUrl({type:"channel",maxResults:1,q:name,regionCode:"TR",relevanceLanguage:"tr"}))
    .then(j=>{
      const it=(j&&j.items&&j.items[0])||null;
      const id=(it&&it.id&&(it.id.channelId||it.id))||"";
      c[name]=id?{id:id,title:(it.snippet&&it.snippet.title)||name,at:Date.now()}:{miss:1,at:Date.now()};
      save();
      return id;
    }).catch(()=>"");
}
/* ham istek: iki taşıyıcıyı da dener, ayrıştırmayı yapmaz */
function ytRaw(url){
  const viaJsonp=()=>jsonpFetch(url);
  const viaFetch=()=>{
    let st=0;
    return fetch(url).then(r=>{ st=r.status; return r.text(); }).then(txt=>{
      let j;
      try{ j=JSON.parse(txt); }
      catch(e){ throw new Error("Yanıt JSON değil (HTTP "+st+"): "+String(txt).slice(0,100)); }
      return j;
    });
  };
  if(isFileProtocol())return viaJsonp().catch(e1=>viaFetch().catch(()=>{ throw e1; }));
  return viaFetch().catch(e1=>viaJsonp().catch(()=>{ throw e1; }));
}
function ytFetch(q,extra){
  const src=ytSource();
  extra=extra||{};
  if(src==="key"){
    const url=ytUrl(Object.assign({
      type:"video",maxResults:50,regionCode:"TR",relevanceLanguage:"tr",
      videoEmbeddable:"true",videoSyndicated:"true",order:extra.channelId?"date":"relevance",
      q:q,pageToken:extra.pageToken||undefined},extra.channelId?{channelId:extra.channelId}:{}));
    const viaJsonp=()=>jsonpFetch(url).then(j=>ytParseSearch(j,"JSONP"));
    const viaFetch=()=>{
      let st=0;
      return fetch(url).then(r=>{ st=r.status; return r.text(); }).then(txt=>{
        let j;
        try{ j=JSON.parse(txt); }
        catch(e){ throw new Error("Yanıt JSON değil (HTTP "+st+"): "+String(txt).slice(0,100)); }
        return ytParseSearch(j,"HTTP "+st);
      });
    };
    /* file:// altında fetch çoğu tarayıcıda hiç gönderilmiyor: önce JSONP dene */
    /* yedek taşıyıcı sunucudan anlamlı bir hata getirdiyse onu göster;
       yalnızca taşıma başarısızsa ilk hataya dön */
    const pick=(e1,e2)=>{ throw (e2&&e2.api)?e2:(e1||e2); };
    if(isFileProtocol())return viaJsonp().catch(e1=>viaFetch().catch(e2=>pick(e1,e2)));
    return viaFetch().catch(e1=>viaJsonp().catch(e2=>pick(e1,e2)));
  }
  if(src==="gas"){
    return Promise.reject(new Error("Video araması için API anahtarı gerekiyor"));
  }
  return Promise.reject(new Error("kaynak yok"));
}

/* ---------- tanı ---------- */
function ytTest(){
  const box=el("ytDiag"); if(!box)return Promise.resolve(false);
  const c=ytCfg();
  const src=ytSource();
  box.textContent="Deneniyor… (kaynak: "+src+")";
  box.style.color="var(--label-2)";
  if(src==="link"){
    box.textContent="Kaynak kapalı. Yukarıdan 'Otomatik' ya da 'Kendi API anahtarım' seç.";
    return Promise.resolve(false);
  }
  c.raw="";
  const t0=Date.now();
  return ytFetch("türev konu anlatımı").then(items=>{
    const ms=Date.now()-t0;
    c.err=""; save();
    box.style.color="var(--success)";
    box.textContent="Çalışıyor ✓ · "+items.length+" sonuç · "+ms+" ms · "+location.protocol+" · kaynak: "+src+
      " (kendi anahtarın)"+
      (c.raw?" · "+c.raw:"");
    return true;
  }).catch(e=>{
    const msg=String(e&&e.message||e);
    c.err=msg.slice(0,140); save();
    box.style.color="var(--danger)";
    box.textContent="Başarısız · kaynak: "+src+" · "+location.protocol+"\n"+msg+(c.raw?"\nSunucu: "+c.raw:"");
    return false;
  });
}
function ytCopyDiag(){
  const box=el("ytDiag");
  const txt=(box?box.textContent:"")+"\nAnahtar: "+(ytKey()?"kendi cihazında":"yok")+
    "\nAdres: "+location.protocol+"\nTarayıcı: "+navigator.userAgent;
  try{
    if(navigator.clipboard&&navigator.clipboard.writeText){
      navigator.clipboard.writeText(txt); toast("Tanı bilgisi kopyalandı");
    } else { downloadText("yks-tani.txt",txt,"text/plain"); toast("Tanı dosyası indirildi"); }
  }catch(e){ downloadText("yks-tani.txt",txt,"text/plain"); }
}

/* ---------- liste ekranı ---------- */
let vidQuery="",vidTitle="",vidItems=[],vidAll=[],vidBusy=false,vidKind="",vidChannel="",vidNote="";
let vidCtx={teacher:"",subject:"",topic:"",channelId:""};
try{ window.vidCtx=vidCtx; }catch(e){}
let vidPage="",vidMoreBusy=false;

/* kanal içindeyken tür değişince sorgu da değişmeli:
   yoksa TYT sonuçları arasında AYT aranmış olur */
function kindQuery(kind,subject){
  const sj=(subject||"").trim();
  if(kind==="tyt")return ("TYT "+sj+" konu anlatımı").replace(/\s+/g," ").trim();
  if(kind==="ayt")return ("AYT "+sj+" konu anlatımı").replace(/\s+/g," ").trim();
  if(kind==="soru")return (sj+" soru çözümü").trim();
  if(kind==="deneme")return (sj+" deneme branş").trim();
  return sj;
}

const KIND_WORDS={
  tyt:["tyt"],ayt:["ayt"],
  soru:["soru","çözüm","cozum","test"],
  deneme:["deneme","branş","brans","kamp"]
};
function kindMatch(v,kind){
  const words=KIND_WORDS[kind];
  if(!words)return true;
  const t=String(v.title||"").toLocaleLowerCase("tr");
  return words.some(w=>t.indexOf(w)>=0);
}
function applyVidFilter(){
  vidNote="";
  if(!vidKind){ vidItems=vidAll.slice(); return; }
  const f=vidAll.filter(v=>kindMatch(v,vidKind));
  if(f.length){ vidItems=f; }
  else {
    vidItems=vidAll.slice();
    vidNote="Başlığında \""+vidKind.toLocaleUpperCase("tr")+"\" geçen video bulunamadı — kanalın tüm sonuçları gösteriliyor.";
  }
}
function reloadVideos(){
  if(!vidChannel){ applyVidFilter(); renderVidList(); renderVidChips(); return Promise.resolve(); }
  const q=kindQuery(vidKind,vidCtx.subject)||vidCtx.subject||vidTitle;
  vidQuery=q;
  el("vidSub").textContent=(vidCtx.teacher?vidCtx.teacher+" kanalı · ":"")+(q||"tüm videolar");
  el("vidList").innerHTML='<div class="empty">Videolar getiriliyor…</div>';
  renderVidChips();
  vidBusy=true;
  return ytFetch(q,{channelId:vidChannel}).then(items=>{
    vidPage=ytLastPage;
    vidAll=items||[];
    applyVidFilter(); renderVidList(); renderVidChips();
  }).catch(e=>{
    el("vidList").innerHTML='<div class="empty">Liste alınamadı: '+esc(String(e.message||e))+'</div>';
  }).then(()=>{ vidBusy=false; });
}
/* arama sonuçlarında sonraki sayfa */
function loadMoreVideos(){
  if(!vidPage||vidMoreBusy)return Promise.resolve(0);
  vidMoreBusy=true;
  const btn=el("vidMore"); if(btn)btn.textContent="Yükleniyor…";
  return ytFetch(vidQuery,{channelId:vidChannel,pageToken:vidPage}).then(items=>{
    vidPage=ytLastPage;
    const seen={};
    vidAll.forEach(v=>{seen[v.id]=1;});
    (items||[]).forEach(v=>{ if(!seen[v.id]){ seen[v.id]=1; vidAll.push(v); } });
    applyVidFilter(); renderVidList();
    return (items||[]).length;
  }).catch(()=>{ toast("Daha fazlası getirilemedi"); return 0; })
   .then(n=>{ vidMoreBusy=false; return n; });
}
function setVidKind(k){
  const next=(vidKind===k)?"":k;
  vidKind=next;
  /* oynatma listesi kipindeysek listeleri yeniden ara */
  if(typeof vidMode!=="undefined"&&vidMode==="list"&&!vidBusy){
    curList=null;
    return loadPlaylists();
  }
  /* kanal kısıtlıysa yeni türe göre baştan ara */
  if(vidChannel&&!vidBusy){
    const q=kindQuery(next,vidCtx.subject)||vidCtx.subject||vidTitle;
    vidQuery=q;
    el("vidSub").textContent=(vidCtx.teacher?vidCtx.teacher+" kanalı · ":"")+(q||"tüm videolar");
    el("vidList").innerHTML='<div class="empty">Videolar getiriliyor…</div>';
    renderVidChips();
    vidBusy=true;
    return ytFetch(q,{channelId:vidChannel}).then(items=>{
      vidAll=items||[];
      applyVidFilter(); renderVidList(); renderVidChips();
    }).catch(e=>{
      el("vidList").innerHTML='<div class="empty">Liste alınamadı: '+esc(String(e.message||e))+'</div>';
    }).then(()=>{ vidBusy=false; });
  }
  applyVidFilter(); renderVidList(); renderVidChips();
  return Promise.resolve();
}

/* teacher: kanalla sınırlama için hoca adı · kind: tyt/ayt/soru/deneme */
function openVideos(q,title,opts){
  opts=opts||{};
  vidQuery=q; vidTitle=title||q; vidItems=[]; vidAll=[]; vidChannel="";
  vidKind=opts.kind&&KIND_WORDS[opts.kind]?opts.kind:"";
  vidCtx={teacher:opts.teacher||"",subject:opts.subject||"",topic:opts.topic||"",channelId:""};
  if(typeof vidMode!=="undefined"){ vidMode="video"; curList=null; }
  if(typeof renderVidModes==="function")renderVidModes();
  const ov=el("vidOverlay"); if(!ov)return Promise.resolve(false);
  ov.style.display="flex";
  el("vidTitle").textContent=vidTitle;
  el("vidSub").textContent=q;
  renderVidChips();
  const src=ytSource();
  if(src==="link"){
    el("vidList").innerHTML='<div class="empty">Video listesini uygulama içinde göstermek için bir kaynak gerekiyor.<br><br>'+
      'Daha › Ayarlar › <b>Uygulama içi video</b> bölümünden açabilirsin.<br><br>'+
      'Şimdilik aramayı YouTube\'da açabilirsin.</div>';
    return Promise.resolve(false);
  }
  el("vidList").innerHTML='<div class="empty">Videolar getiriliyor…</div>';
  vidBusy=true;
  const step=opts.teacher?resolveChannel(opts.teacher):Promise.resolve("");
  return step.then(chId=>{
    vidChannel=chId||""; vidCtx.channelId=vidChannel;
    if(chId)el("vidSub").textContent=(opts.teacher||"")+" kanalı · "+q;
    return ytFetch(q,{channelId:chId});
  }).then(items=>{
    vidPage=ytLastPage;
    vidAll=items||[];
    applyVidFilter();
    renderVidList(); renderVidChips();
    ytCfg().err=""; save();
    return true;
  }).catch(e=>{
    const msg=String(e.message||e).slice(0,140);
    ytCfg().err=msg; save();
    el("vidList").innerHTML='<div class="empty">Liste alınamadı: '+esc(msg)+
      '<br><br>Aramayı YouTube\'da açabilirsin.</div>';
    return false;
  }).then(v=>{ vidBusy=false; return v; });
}
function renderVidChips(){
  const w=el("vidChips"); if(!w)return;
  const kinds=[["","Hepsi"],["tyt","TYT"],["ayt","AYT"],["soru","Soru"],["deneme","Deneme"]];
  const back=(typeof curList!=="undefined"&&curList)
    ? '<button class="chip" onclick="backToPlaylists()">‹ Listelere dön</button>' : "";
  const bulk=(typeof curList!=="undefined"&&curList)
    ? '<button class="chip" onclick="addListVideos(5)">İlk 5\'i plana ekle</button>' : "";
  w.innerHTML=back+kinds.map(k=>'<button class="chip '+(vidKind===k[0]?"on":"")+'" onclick="setVidKind(\''+k[0]+'\')">'+k[1]+'</button>').join("")+bulk+
    (vidChannel?'<span class="vidch">kanal kısıtlı</span>':'<span class="vidch off">kanal bulunamadı</span>');
}
/* test ve hata ayıklama için: liste içeriğini dışarıdan doldur */
function setVidItems(list){ vidAll=(list||[]).slice(); vidItems=vidAll.slice(); vidNote="";
  try{ window.vidItems=vidItems; }catch(e){} }
function setVidLists(list){ vidListsAll=(list||[]).slice(); vidLists=vidListsAll.slice(); vidNote=""; }
function renderVidList(){
  const w=el("vidList"); if(!w)return;
  if(!vidItems.length){ w.innerHTML='<div class="empty">Sonuç bulunamadı. Aramayı YouTube\'da deneyebilirsin.</div>'; return; }
  const head=(vidNote?'<p class="hint vidnote">'+esc(vidNote)+'</p>':"")+
    '<p class="hint" style="margin:0 0 8px;">'+vidItems.length+' video'+
    (vidKind?' · '+vidKind.toLocaleUpperCase("tr")+' süzgeci':'')+'</p>';
  const more=(vidPage&&(typeof curList==="undefined"||!curList))
    ? '<button class="btn ghost small vidmore" id="vidMore" onclick="loadMoreVideos()">Daha fazla video yükle</button>' : "";
  w.innerHTML=head+vidItems.map((v,i)=>{
    const d=v.date?new Date(v.date):null;
    const ds=d&&!isNaN(d)?d.toLocaleDateString("tr-TR",{day:"numeric",month:"long",year:"numeric"}):"";
    const inPlan=vidInPlan(v);
    const seen=(typeof isWatched==="function")&&isWatched(v);
    return '<div class="vidcard'+(seen?" seen":"")+'" onclick="cardClick(event,'+i+')">'+
      (v.thumb?'<img src="'+esc(v.thumb)+'" alt="" loading="lazy">':'<span class="vidph">▶</span>')+
      '<span class="vidmeta"><span class="vt">'+esc(v.title)+'</span>'+
      '<span class="vc">'+esc(v.ch)+(ds?" · "+ds:"")+'</span></span>'+
      '<span class="vidacts">'+
        '<button class="vidwatch'+(seen?" on":"")+'" type="button" '+
          'onpointerdown="event.stopPropagation()" ontouchstart="event.stopPropagation()" '+
          'onclick="event.stopPropagation();toggleWatched('+i+')" '+
          'aria-label="'+(seen?"İzledim işaretini kaldır":"İzledim olarak işaretle")+'" '+
          'title="'+(seen?"İzledim işaretini kaldır":"İzledim olarak işaretle")+'">✓</button>'+
        '<button class="vidadd'+(inPlan?" on":"")+'" type="button" '+
          'onpointerdown="event.stopPropagation()" ontouchstart="event.stopPropagation()" '+
          'onclick="event.stopPropagation();toggleVidPlan('+i+')" '+
          'aria-label="'+(inPlan?"Plandan çıkar":"Plana ekle")+'" '+
          'title="'+(inPlan?"Plandan çıkar":"Plana ekle")+'">'+(inPlan?"−":"+")+'</button>'+
      '</span>'+
      '</div>';
  }).join("")+more;
}
function closeVideos(){
  const ov=el("vidOverlay"); if(ov)ov.style.display="none";
}
function openVidOnYt(){ if(vidQuery)openYt(vidQuery); }

/* ---------- videoyu haftalık plana ekleme ---------- */
function vidPlanText(v){
  const t=String(v.title||"").replace(/\s+/g," ").trim();
  const ad=t.length>46?t.slice(0,46)+"…":t;
  const id=String(v.id||"").trim();
  /* bağlantıyı da yaz: plandaki satırdan doğrudan videoya gidilebilsin */
  return "▶ "+ad+(id?" — https://youtu.be/"+id:"");
}
/* Plana eklenen metni yalnız bu haftada değil, kayıtlı bütün
   haftalarda arar. Gelecek haftaya eklenen de yeşil görünsün. */
function planFindCell(txt){
  if(!txt)return null;
  const bugun=keyOf(mondayOf(new Date()));
  const anahtarlar=Object.keys(S.weeks||{}).sort();
  /* önce bu hafta, sonra diğerleri: en yakın sonuç kazanır */
  const sira=anahtarlar.indexOf(bugun)>=0
    ? [bugun].concat(anahtarlar.filter(k=>k!==bugun))
    : anahtarlar;
  for(const wk of sira){
    const w=S.weeks[wk];
    if(!w)continue;
    const nw=normWeek(w);
    for(const blk of ["r","s"]){
      const bloklar=nw[blk]||[];
      for(let i=0;i<bloklar.length;i++){
        for(let d=0;d<7;d++){
          if(bloklar[i][d]===txt)return {wk:wk,blk:blk,i:i,d:d};
        }
      }
    }
  }
  return null;
}
function vidPlanCell(v){ return planFindCell(vidPlanText(v)); }
function vidInPlan(v){ return !!vidPlanCell(v); }
function toggleVidPlan(i){
  const v=vidItems[i]; if(!v)return false;
  const cell=vidPlanCell(v);
  if(cell){
    const w=getWeek(cell.wk,true);
    w[cell.blk][cell.i][cell.d]="";
    save(); renderTodayPlan();
    if(el("program").classList.contains("active"))renderPlan();
    renderVidList();
    toast("Plandan çıkarıldı");
    return false;
  }
  return openDayPick(vidPlanText(v),()=>renderVidList());
}

/* ---------- oynatıcı ---------- */
let playIdx=-1,directPlaylist=null;

function playlistIdFromUrl(raw){
  const s=String(raw||"").trim();
  if(!s)return "";
  let id="";
  try{
    const u=new URL(s,/^https?:/i.test(s)?undefined:"https://www.youtube.com/");
    id=u.searchParams.get("list")||"";
  }catch(e){
    const m=/(?:[?&]list=|^)([A-Za-z0-9_-]{10,100})/.exec(s); id=m?m[1]:"";
  }
  return /^[A-Za-z0-9_-]{10,100}$/.test(id)?id:"";
}
function directPlaylistData(){
  const raw=(el("directPlaylistUrl")&&el("directPlaylistUrl").value)||"";
  const id=playlistIdFromUrl(raw);
  if(!id){ toast("Geçerli bir YouTube oynatma listesi bağlantısı yapıştır"); return null; }
  const typed=((el("directPlaylistName")&&el("directPlaylistName").value)||"").trim();
  return {id:id,name:(typed||"YouTube oynatma listesi").slice(0,80),
    url:"https://www.youtube.com/playlist?list="+encodeURIComponent(id)};
}
function openDirectPlaylist(){
  const p=directPlaylistData(); if(!p)return false;
  directPlaylist=p; playIdx=-2;
  const ov=el("playOverlay"); if(!ov)return false;
  ov.style.display="flex";
  el("playTitle").textContent=p.name;
  el("playCh").textContent="YouTube oynatma listesi";
  el("playCount").textContent="anahtarsız";
  let emb="https://www.youtube-nocookie.com/embed?listType=playlist&list="+encodeURIComponent(p.id)+"&playsinline=1&autoplay=1";
  if(!isFileProtocol())emb+="&origin="+encodeURIComponent(location.origin);
  el("playFrame").src=emb;
  el("playHint").textContent="Videolar arasında YouTube oynatıcısının liste düğmeleriyle geçebilirsin.";
  return true;
}
function directPlaylistPlanText(p){
  return "☰ "+p.name+" — "+p.url;
}
function planDirectPlaylist(){
  const p=directPlaylistData(); if(!p)return false;
  return openDayPick(directPlaylistPlanText(p));
}
/* Dokunmatik cihazlarda düğmedeki küçülme animasyonu parmağın altından
   kaçırabiliyor ve tıklama kartın kendisine düşüyordu. Artık kart,
   düğme bölgesinden gelen her olayı yok sayıyor. */
function cardClick(ev,i){
  const t=ev&&ev.target;
  if(t&&t.closest&&t.closest(".vidacts"))return false;
  playVideo(i);
  return true;
}
function listCardClick(ev,i){
  const t=ev&&ev.target;
  if(t&&t.closest&&t.closest(".vidacts"))return false;
  openPlaylist(i);
  return true;
}
/* Plandaki bağlantıdan tek bir videoyu açar (listeye ihtiyaç duymadan). */
function openSingleVideo(id,ad){
  const vid=String(id||"").trim();
  if(!vid)return false;
  const ov=el("playOverlay"); if(!ov)return false;
  ov.style.display="flex";
  el("playTitle").textContent=ad||"Video";
  el("playCh").textContent="";
  let emb="https://www.youtube-nocookie.com/embed/"+encodeURIComponent(vid)+
    "?rel=0&modestbranding=1&playsinline=1&autoplay=1";
  if(!isFileProtocol())emb+="&origin="+encodeURIComponent(location.origin);
  el("playFrame").src=emb;
  const hint=el("playHint");
  if(hint)hint.textContent="Oynatılmıyorsa videonun sahibi gömmeyi kapatmış olabilir — YouTube'da aç.";
  el("playCount").textContent="plandan";
  playIdx=-1;
  return true;
}
function playVideo(i){
  const v=vidItems[i]; if(!v)return;
  playIdx=i;
  const ov=el("playOverlay"); if(!ov)return;
  ov.style.display="flex";
  el("playTitle").textContent=v.title;
  el("playCh").textContent=v.ch;
  let emb="https://www.youtube-nocookie.com/embed/"+encodeURIComponent(v.id)+
    "?rel=0&modestbranding=1&playsinline=1&autoplay=1";
  if(!isFileProtocol())emb+="&origin="+encodeURIComponent(location.origin);
  el("playFrame").src=emb;
  const hint=el("playHint");
  if(hint)hint.textContent="Oynatılmıyorsa videonun sahibi gömmeyi kapatmış olabilir — YouTube'da aç.";
  el("playCount").textContent=(i+1)+" / "+vidItems.length;
}
function playNext(n){
  if(playIdx===-2){ toast("Liste içinde oynatıcının önceki/sonraki düğmelerini kullan"); return; }
  if(playIdx<0){ toast("Bu video plandan açıldı — liste yok"); return; }
  if(!vidItems.length)return;
  playVideo((playIdx+n+vidItems.length)%vidItems.length);
}
function closePlayer(){
  const ov=el("playOverlay"); if(ov)ov.style.display="none";
  const f=el("playFrame"); if(f)f.src="";   /* sesi kes */
}
function openPlayerOnYt(){
  if(playIdx===-2&&directPlaylist){
    openExternalUrl(directPlaylist.url);
    return directPlaylist.url;
  }
  const v=vidItems[playIdx];
  if(!v)return;
  const url="https://www.youtube.com/watch?v="+encodeURIComponent(v.id);
  openExternalUrl(url);
  return url;
}

/* ==================================================================
   BAŞLATMA
   ================================================================== */
function boot10(){
  boot9();
  ytCfg(); perfIdle("boot-yt-settings",()=>renderYtSettings(),1200);
}
/* boot çağrısı app17 sonunda yapılır */
/* ==================================================================
   OYNATMA LİSTELERİ
   Hocaların konu serileri genelde oynatma listesi halinde duruyor
   (çoğu zaman yayınevinin kanalında). Kanal kısıtlı arama ile
   bulunur, içindeki videolar sırasıyla listelenir.
   ================================================================== */
let vidMode="video";          /* "video" | "list" */
let vidLists=[],vidListsAll=[],curList=null;

function setVidMode(m){
  const next=(m==="list")?"list":"video";
  if(next===vidMode&&!curList)return Promise.resolve();
  vidMode=next; curList=null;
  renderVidModes();
  if(vidMode==="list")return loadPlaylists();
  return reloadVideos();
}
function renderVidModes(){
  const w=el("vidModes"); if(!w)return;
  w.innerHTML='<button class="segb '+(vidMode==="video"?"on":"")+'" onclick="setVidMode(\'video\')">Videolar</button>'+
              '<button class="segb '+(vidMode==="list"?"on":"")+'" onclick="setVidMode(\'list\')">Oynatma listeleri</button>';
}

/* ---------- veri ---------- */
function ytOnePlaylistSearch(q,channelId){
  const src=ytSource();
  if(src==="key"){
    return ytRaw(ytUrl({type:"playlist",maxResults:30,regionCode:"TR",relevanceLanguage:"tr",
      q:q,channelId:channelId||undefined})).then(j=>ytParseSearch(j,"liste araması"));
  }
  if(src==="gas"){
    return Promise.reject(new Error("Video araması için API anahtarı gerekiyor"));
  }
  return Promise.reject(new Error("kaynak yok"));
}
/* Hocanın serisi çoğu zaman kendi kanalında değil, yayınevinin
   kanalında duruyor (Eyüp Hoca'nın listelerinin 3D kanalında olması gibi).
   Bu yüzden kanal içi arama az sonuç verirse hoca adıyla genel arama da yapılır. */
function ytFetchPlaylists(q,channelId,teacher){
  const inChannel=channelId?ytOnePlaylistSearch(q,channelId):Promise.resolve([]);
  return inChannel.catch(()=>[]).then(a=>{
    if(a.length>=6||!teacher)return a.length?a:ytOnePlaylistSearch((teacher?teacher+" ":"")+q,"");
    return ytOnePlaylistSearch((teacher?teacher+" ":"")+q,"").catch(()=>[]).then(b=>{
      const seen={},out=[];
      a.concat(b).forEach(x=>{ if(x&&x.id&&!seen[x.id]){ seen[x.id]=1; out.push(x); } });
      if(!out.length)throw new Error("Oynatma listesi bulunamadı");
      return out;
    });
  });
}
const LIST_MAX_PAGES=12;      /* 12 × 50 = 600 video üst sınırı */
function mapListPage(j){
  return (j.items||[]).map(it=>{
    const sn=it.snippet||{},th=sn.thumbnails||{};
    return {id:(sn.resourceId&&sn.resourceId.videoId)||"",title:sn.title||"",
      ch:sn.videoOwnerChannelTitle||sn.channelTitle||"",
      thumb:((th.medium||th.default||{}).url)||"",date:sn.publishedAt||"",
      pos:(sn.position|0)+1};
  }).filter(v=>v.id&&v.title!=="Deleted video"&&v.title!=="Private video");
}
/* YouTube bir istekte en fazla 50 öğe veriyor; uzun serilerin
   gerisi sayfa jetonuyla geliyor. Hepsi çekilir. */
function ytFetchListItems(playlistId,onProgress){
  const src=ytSource();
  const acc=[];
  function pageKey(token){
    const url="https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50"+
      "&playlistId="+encodeURIComponent(playlistId)+
      (token?"&pageToken="+encodeURIComponent(token):"")+
      "&key="+encodeURIComponent(ytKey());
    return ytRaw(url).then(j=>{
      if(j&&j.error)return ytParseSearch(j,"liste içeriği");   /* hatayı çözümler ve fırlatır */
      acc.push.apply(acc,mapListPage(j));
      if(onProgress)onProgress(acc.length);
      return (j&&j.nextPageToken)||"";
    });
  }
  function pageGas(token){
    return Promise.reject(new Error("Video araması için API anahtarı gerekiyor"));
  }
  const step=(src==="key")?pageKey:(src==="gas"?pageGas:null);
  if(!step)return Promise.reject(new Error("kaynak yok"));
  function loop(token,n){
    if(n>=LIST_MAX_PAGES)return Promise.resolve(acc);
    return step(token).then(next=>next?loop(next,n+1):acc);
  }
  return loop("",0);
}

/* ---------- listeleri getir ---------- */
function loadPlaylists(){
  const q=kindQuery(vidKind,vidCtx.subject)||vidCtx.subject||vidTitle;
  el("vidSub").textContent=(vidCtx.teacher?vidCtx.teacher+" · ":"")+"oynatma listeleri"+(q?" · "+q:"");
  el("vidList").innerHTML='<div class="empty">Oynatma listeleri getiriliyor…</div>';
  vidBusy=true;
  return ytFetchPlaylists(q,vidCtx.channelId,vidCtx.teacher).then(items=>{
    vidListsAll=items||[];
    applyListFilter();
    renderPlaylists();
  }).catch(e=>{
    el("vidList").innerHTML='<div class="empty">Listeler alınamadı: '+esc(String(e.message||e))+
      '<br><br>Videolar sekmesine geçebilirsin.</div>';
  }).then(()=>{ vidBusy=false; });
}
function applyListFilter(){
  vidNote="";
  if(!vidKind){ vidLists=vidListsAll.slice(); return; }
  const f=vidListsAll.filter(v=>kindMatch(v,vidKind));
  if(f.length)vidLists=f;
  else{
    vidLists=vidListsAll.slice();
    vidNote="Başlığında \""+vidKind.toLocaleUpperCase("tr")+"\" geçen liste bulunamadı — hepsi gösteriliyor.";
  }
}
function renderPlaylists(){
  const w=el("vidList"); if(!w)return;
  renderVidChips();
  if(!vidLists.length){ w.innerHTML='<div class="empty">Bu aramada oynatma listesi bulunamadı. Videolar sekmesini deneyebilirsin.</div>'; return; }
  const head=(vidNote?'<p class="hint vidnote">'+esc(vidNote)+'</p>':"")+
    '<p class="hint" style="margin:0 0 8px;">'+vidLists.length+' oynatma listesi'+
    (vidKind?' · '+vidKind.toLocaleUpperCase("tr")+' süzgeci':'')+'</p>';
  w.innerHTML=head+vidLists.map((v,i)=>{
    const inPlan=listInPlan(v);
    return '<div class="vidcard" onclick="listCardClick(event,'+i+')">'+
      (v.thumb?'<img src="'+esc(v.thumb)+'" alt="" loading="lazy">':'<span class="vidph">☰</span>')+
      '<span class="vidmeta"><span class="vt">'+esc(v.title)+'</span>'+
      '<span class="vc">'+esc(v.ch||"kanal bilinmiyor")+' · oynatma listesi</span></span>'+
      '<span class="vidacts one">'+
        '<button class="vidadd'+(inPlan?" on":"")+'" type="button" '+
          'onpointerdown="event.stopPropagation()" ontouchstart="event.stopPropagation()" '+
          'onclick="event.stopPropagation();toggleListPlan('+i+')" '+
          'aria-label="'+(inPlan?"Plandan çıkar":"Plana ekle")+'" '+
          'title="'+(inPlan?"Plandan çıkar":"Plana ekle")+'">'+(inPlan?"−":"+")+'</button>'+
      '</span>'+
      '</div>';
  }).join("");
}

/* ---------- liste içeriği ---------- */
function openPlaylist(i){
  const p=vidLists[i]; if(!p)return Promise.resolve();
  curList=p;
  el("vidSub").textContent=p.title;
  el("vidList").innerHTML='<div class="empty">Liste açılıyor…</div>';
  vidBusy=true;
  const prog=n=>{ const w=el("vidList");
    if(w&&vidBusy)w.innerHTML='<div class="empty">Liste açılıyor… '+n+' video</div>'; };
  return ytFetchListItems(p.id,prog).then(items=>{
    vidAll=items||[]; vidItems=vidAll.slice(); vidNote=""; vidPage="";
    if(vidAll.length>=LIST_MAX_PAGES*50)
      vidNote="Liste çok uzun — ilk "+vidAll.length+" video gösteriliyor.";
    renderVidList(); renderVidChips();
  }).catch(e=>{
    el("vidList").innerHTML='<div class="empty">Liste açılamadı: '+esc(String(e.message||e))+'</div>';
  }).then(()=>{ vidBusy=false; });
}
function backToPlaylists(){
  curList=null;
  renderPlaylists();
  el("vidSub").textContent=(vidCtx.teacher?vidCtx.teacher+" · ":"")+"oynatma listeleri";
  renderVidChips();
}

/* ---------- plana ekleme ---------- */
function listPlanText(p){
  const t=String(p.title||"").replace(/\s+/g," ").trim();
  const ad=t.length>44?t.slice(0,44)+"…":t;
  const id=String(p.id||"").trim();
  return "☰ "+ad+(id?" — https://youtube.com/playlist?list="+id:"");
}
function listPlanCell(p){ return planFindCell(listPlanText(p)); }
function listInPlan(p){ return !!listPlanCell(p); }
function toggleListPlan(i){
  const p=vidLists[i]; if(!p)return false;
  const cell=listPlanCell(p);
  if(cell){
    const w=getWeek(cell.wk,true);
    w[cell.blk][cell.i][cell.d]="";
    save(); renderTodayPlan();
    if(el("program").classList.contains("active"))renderPlan();
    renderPlaylists();
    toast("Plandan çıkarıldı");
    return false;
  }
  return openDayPick(listPlanText(p),()=>renderPlaylists());
}
/* listenin ilk N videosunu tek tek plana ekle */
function addListVideos(n){
  if(!curList||!vidItems.length){ toast("Önce bir oynatma listesi aç"); return 0; }
  let added=0;
  for(let i=0;i<vidItems.length&&added<(n||5);i++){
    if(vidInPlan(vidItems[i]))continue;
    if(!addToToday(vidPlanText(vidItems[i])))break;
    added++;
  }
  renderVidList();
  if(added)toast(added+" video plana eklendi ✓");
  return added;
}
/* ==================================================================
   ÇEVRİMDIŞI ÇALIŞMA
   ================================================================== */
/* ---------- çevrimdışı çalışma ----------
   Yalnız bir adresten (https) açıldığında geçerli; dosyadan
   açıldığında sessizce atlanır. */
let appUpdateReg=null,appUpdateReloading=false,appUpdateCheckTimer=null,appUpdateRemoteVersion="";
function updateBox(){
  let b=el("appUpdateBox"); if(b)return b;
  b=document.createElement("div");b.id="appUpdateBox";
  b.innerHTML='<span class="uicon">↻</span><span class="utxt"><b>Yeni sürüm hazır</b><small id="appUpdateDetail">Güncelleme birkaç saniye sürer.</small></span><button class="btn small" onclick="applyAppUpdate()">Güncelle</button>';
  document.body.appendChild(b);return b;
}
function versionNums(v){
  const m=String(v||"").trim().match(/^(\d+)(?:\.(\d+))?(?:\.(\d+))?/);
  return m?[Number(m[1])||0,Number(m[2])||0,Number(m[3])||0]:[0,0,0];
}
function compareAppVersions(a,b){
  const A=versionNums(a),B=versionNums(b);
  for(let i=0;i<3;i++){if(A[i]!==B[i])return A[i]>B[i]?1:-1;}
  return 0;
}
function remoteVersionIsNewer(v){return !!v&&compareAppVersions(v,APP_VERSION)>0;}
function showAppUpdate(reg,ver){
  if(ver&&!remoteVersionIsNewer(ver)){hideAppUpdate();return false;}
  appUpdateReg=reg||appUpdateReg;if(ver)appUpdateRemoteVersion=ver;
  const b=updateBox(),d=el("appUpdateDetail");
  if(d)d.textContent=appUpdateRemoteVersion?("v"+appUpdateRemoteVersion+" hazır · mevcut v"+APP_VERSION):"Güncelleme birkaç saniye sürer.";
  if(b)b.classList.add("show");return true;
}
function hideAppUpdate(){const b=el("appUpdateBox");if(b)b.classList.remove("show");}
async function checkRemoteVersion(){
  if(location.protocol!=="https:"&&location.hostname!=="localhost"&&location.hostname!=="127.0.0.1")return false;
  try{
    const r=await fetch("version.json?t="+Date.now(),{cache:"no-store"});if(!r.ok)return false;
    const j=await r.json(),v=String(j&&j.version||"");
    if(remoteVersionIsNewer(v)){showAppUpdate(appUpdateReg,v);return true;}
    appUpdateRemoteVersion="";hideAppUpdate();return false;
  }catch(e){return false;}
}
async function applyAppUpdate(){
  const reg=appUpdateReg,b=updateBox(),btn=b&&b.querySelector("button");if(btn){btn.disabled=true;btn.textContent="Güncelleniyor…";}
  try{
    /* Bekleyen worker yalnız sunucuda GERÇEKTEN daha yeni sürüm varsa etkinleşsin.
       Böylece eski/stale bir worker tekrar tekrar güncelleme uyarısı üretemez. */
    const newer=remoteVersionIsNewer(appUpdateRemoteVersion);
    if(newer&&reg&&reg.waiting){reg.waiting.postMessage({type:"SKIP_WAITING"});return;}
    if("caches" in window){const keys=await caches.keys();await Promise.all(keys.filter(k=>k.startsWith("yks-")).map(k=>caches.delete(k)));}
    if(reg)await reg.update().catch(()=>{});
  }catch(e){infraError("app-update",e);}finally{
    const u=new URL(location.href);u.searchParams.set("appv",appUpdateRemoteVersion||APP_VERSION);location.replace(u.toString());
  }
}
function registerSW(){
  try{
    if(!("serviceWorker" in navigator))return;
    if(location.protocol!=="https:"&&location.hostname!=="localhost"&&location.hostname!=="127.0.0.1")return;
    navigator.serviceWorker.addEventListener("controllerchange",()=>{if(appUpdateReloading)return;appUpdateReloading=true;location.reload();});
    navigator.serviceWorker.register("sw.js",{updateViaCache:"none"}).then(reg=>{
      appUpdateReg=reg;
      /* reg.waiting tek başına güncelleme kanıtı değildir. Eski worker bekliyor olabilir.
         Uyarının tek kaynağı version.json'daki daha yüksek sürümdür. */
      reg.addEventListener("updatefound",()=>{const nw=reg.installing;if(!nw)return;nw.addEventListener("statechange",()=>{if(nw.state==="installed"&&navigator.serviceWorker.controller)checkRemoteVersion();});});
      setTimeout(()=>{reg.update().catch(()=>{});checkRemoteVersion();},1600);
      clearInterval(appUpdateCheckTimer);appUpdateCheckTimer=setInterval(()=>{if(!document.hidden){reg.update().catch(()=>{});checkRemoteVersion();}},15*60*1000);
      document.addEventListener("visibilitychange",()=>{if(!document.hidden){reg.update().catch(()=>{});checkRemoteVersion();}});
    }).catch(e=>infraError("service-worker-register",e));
  }catch(e){infraError("service-worker",e);}
}
function bootDepo(){
  if(!depoCalisiyor())depoUyar();
}
function boot11(){
  bootDepo();
  boot10();
  registerSW();
}
/* boot çağrısı app18 sonunda yapılır */
/* ==================================================================
   ROL: ÖĞRENCİ / KOÇ
   Güvenlik katmanı değil — ortak veride koçun kendi kullanımının
   öğrencinin istatistiklerini bozmasını engelleyen bir koruma ve
   koça uygun bir görünüm.
   ================================================================== */
function isCoach(){ return S.role==="koc"; }
function setRole(r){
  S.role=(r==="koc")?"koc":"ogrenci";
  save(); applyRole(); renderAll();
  toast(isCoach()?"Koç kipi açık":"Öğrenci kipi açık");
}
function applyRole(){
  document.body.classList.toggle("koc",isCoach());
  ["ogrenci","koc"].forEach(k=>{ const b=el("role_"+k); if(b)b.classList.toggle("on",(S.role||"ogrenci")===k); });
  const h=el("roleHint");
  if(h)h.textContent=isCoach()
    ? "Koç kipinde soru/süre kaydı yapılmaz, böylece öğrencinin verisi bozulmaz. Not bırakabilir, plan ve analizleri görebilirsin."
    : "Normal kullanım. Bütün ekranlar ve kayıtlar açık.";
  const nb=el("noteBoxWrap"); if(nb)nb.style.display="block";
}
/* koç kipinde öğrenci verisine yazmayı engelle */
function coachBlock(what){
  if(!isCoach())return false;
  toast("Koç kipinde "+(what||"bu kayıt")+" yapılmaz");
  return true;
}

/* ==================================================================
   KOÇ NOTLARI
   ================================================================== */
function coachNotes(){ if(!Array.isArray(S.coachNotes))S.coachNotes=[]; return S.coachNotes; }
function addCoachNote(){
  const t=(el("cnInput").value||"").trim().slice(0,400);
  if(!t){ toast("Bir şeyler yaz"); return false; }
  coachNotes().push({id:Date.now(),at:Date.now(),from:S.device||"Koç",
    text:t,read:false,kind:el("cnKind")?el("cnKind").value:"genel"});
  if(coachNotes().length>200)S.coachNotes=coachNotes().slice(-200);
  save(); el("cnInput").value="";
  renderCoachNotes(); renderCoachBoard();
  toast("Not bırakıldı ✓");
  return true;
}
function markNoteRead(id){
  const n=coachNotes().find(x=>x.id===id); if(!n)return;
  n.read=true; save(); renderCoachNotes();
}
function delCoachNote(id){
  const bk=clone(coachNotes().find(x=>x.id===id));
  S.coachNotes=coachNotes().filter(x=>x.id!==id);
  if(bk&&typeof logAdd==="function")logAdd("sil","Koç notu silindi",{t:"note",v:bk});
  save();
  if(bk)pushUndo("Not silindi",()=>{ coachNotes().push(bk); });
  renderCoachNotes();
}
function unreadNotes(){ return coachNotes().filter(n=>!n.read).length; }
function renderCoachNotes(){
  const w=el("cnList"); if(!w)return;
  const list=coachNotes().slice().reverse().slice(0,30);
  /* koç değilsen ve hiç not yoksa bölümü hiç gösterme */
  const wrap=el("cnWrap");
  if(wrap)wrap.style.display=(isCoach()||list.length)?"block":"none";
  const cnt=el("cnCount");
  if(cnt){
    const u=unreadNotes();
    cnt.textContent=u?u:"";
    cnt.style.display=u?"inline-flex":"none";
  }
  if(!list.length){
    w.innerHTML='<div class="empty">'+(isCoach()
      ? "Henüz not bırakmadın. Aşağıdan yazdıkların öğrencinin ana ekranında görünür."
      : "Koçundan not yok.")+'</div>';
    return;
  }
  w.innerHTML=list.map(n=>{
    const d=new Date(n.at);
    const when=d.toLocaleDateString("tr-TR",{day:"numeric",month:"long"})+" "+
      String(d.getHours()).padStart(2,"0")+":"+String(d.getMinutes()).padStart(2,"0");
    return '<div class="cnote'+(n.read?"":" unread")+'">'+
      '<div class="cnhead"><span class="cnfrom">'+esc(n.from||"Koç")+'</span>'+
      '<span class="cnwhen">'+when+'</span></div>'+
      '<div class="cntext">'+esc(n.text)+'</div>'+
      '<div class="cnacts">'+
        (!n.read&&!isCoach()?'<button class="btn ghost tiny" onclick="markNoteRead('+n.id+')">Okudum</button>':"")+
        (isCoach()?'<button class="btn ghost tiny" onclick="delCoachNote('+n.id+')">Sil</button>':"")+
      '</div></div>';
  }).join("");
}

/* ==================================================================
   KOÇ PANOSU — öğrencinin haftasını tek ekranda
   ================================================================== */
function coachWeek(){
  const mon=keyOf(mondayOf(new Date()));
  let min=0,q=0,done=0,filled=0,ticked=0;
  for(let i=0;i<7;i++){
    const k=addDaysKey(mon,i);
    min+=S.pomoMin[k]||0; q+=S.solved[k]||0;
    if(dayDone(k))done++;
  }
  const w=S.weeks[mon];
  if(w){
    const nw=normWeek(w);
    ["r","s"].forEach(blk=>(nw[blk]||[]).forEach((row,i)=>row.forEach((v,d)=>{
      if(v&&v.trim()){ filled++; if(nw.dn[blk+"-"+i+"-"+d])ticked++; }
    })));
  }
  /* önceki hafta karşılaştırması */
  const pmon=addDaysKey(mon,-7);
  let pmin=0,pq=0;
  for(let i=0;i<7;i++){ const k=addDaysKey(pmon,i); pmin+=S.pomoMin[k]||0; pq+=S.solved[k]||0; }
  const recent=S.denemeler.filter(d=>d.type!=="BRANS").sort((a,b)=>b.date.localeCompare(a.date)).slice(0,3);
  return {min:min,q:q,done:done,filled:filled,ticked:ticked,
    fidelity:filled?Math.round(ticked/filled*100):null,
    dMin:min-pmin,dQ:q-pq,denemeler:recent,
    streak:planStreak(),rest:(typeof restAdvice==="function")?restAdvice():null,
    review:(typeof reviewQueue==="function")?reviewQueue().length:0,
    overdue:(typeof overdueTopics==="function")?overdueTopics().length:0};
}
function renderCoachBoard(){
  const w=el("coachBoard"); if(!w)return;
  if(!isCoach()){ w.style.display="none"; return; }
  w.style.display="block";
  const c=coachWeek();
  const arrow=v=>v>0?'<span style="color:var(--success)">+'+v+'</span>':
                v<0?'<span style="color:var(--danger)">'+v+'</span>':'<span style="color:var(--label-3)">±0</span>';
  let html='<h2>Bu hafta</h2><div class="card">'+
    '<div class="dayrow"><span class="k">Çalışma</span><span class="v">'+fmtHM(c.min)+' · '+arrow(c.dMin)+' dk</span></div>'+
    '<div class="dayrow"><span class="k">Soru</span><span class="v">'+c.q+' · '+arrow(c.dQ)+'</span></div>'+
    '<div class="dayrow"><span class="k">Tamamlanan gün</span><span class="v">'+c.done+'/7</span></div>'+
    '<div class="dayrow"><span class="k">Plan sadakati</span><span class="v">'+
      (c.fidelity===null?"—":"%"+c.fidelity+" ("+c.ticked+"/"+c.filled+")")+'</span></div>'+
    '<div class="dayrow"><span class="k">Plan serisi</span><span class="v">'+c.streak+' gün</span></div>'+
    '</div>';
  const flags=[];
  if(c.fidelity!==null&&c.fidelity<60)flags.push("Plan sadakati düşük — plan gerçekçi olmayabilir.");
  if(c.dMin<-120)flags.push("Geçen haftaya göre çalışma süresi belirgin düştü.");
  if(c.review>0)flags.push(c.review+" konu tekrar zamanını geçirdi.");
  if(c.overdue>0)flags.push(c.overdue+" konu hedef tarihini aştı.");
  if(c.rest&&c.rest.lvl===2)flags.push("Aralıksız çalışma uyarısı var — dinlenme önerilmeli.");
  if(!c.denemeler.length)flags.push("Kayıtlı deneme yok.");
  html+='<h2>Dikkat</h2><div class="card">'+
    (flags.length?flags.map(f=>'<div class="dayrow"><span class="k">'+esc(f)+'</span></div>').join("")
                 :'<div class="empty">Belirgin bir sorun görünmüyor.</div>')+'</div>';
  if(c.denemeler.length){
    html+='<h2>Son denemeler</h2><div class="card">'+c.denemeler.map(d=>
      '<div class="dayrow"><span class="k">'+esc(d.name)+'<br><small>'+
      parseKey(d.date).toLocaleDateString("tr-TR",{day:"numeric",month:"long"})+'</small></span>'+
      '<span class="v">'+d.totalNet+' net</span></div>').join("")+'</div>';
  }
  w.innerHTML=html;
}

/* ==================================================================
   BAŞLATMA
   ================================================================== */
function renderRole(){ applyRole(); renderCoachBoard(); renderCoachNotes(); }
function boot12(){
  boot11();
  renderRole();
}
/* boot çağrısı app19 sonunda yapılır */
/* ==================================================================
   İZLENEN VİDEOLAR
   İzledim işareti kalıcıdır ve bir konuya bağlıysa o konunun
   kademesini "işledim" seviyesine çıkarır.
   ================================================================== */
function watchedMap(){ if(!S.watched||typeof S.watched!=="object")S.watched={}; return S.watched; }
function isWatched(v){ return !!(v&&v.id&&watchedMap()[v.id]); }
function watchedCount(){ return Object.keys(watchedMap()).length; }

function toggleWatched(i){
  const v=vidItems[i]; if(!v||!v.id)return false;
  const m=watchedMap();
  if(m[v.id]){
    delete m[v.id]; save(); renderVidList();
    toast("İzledim işareti kaldırıldı");
    return false;
  }
  const subj=(vidCtx&&vidCtx.subject)||"";
  const topic=(vidCtx&&vidCtx.topic)||"";
  const hoca=(vidCtx&&vidCtx.teacher)||"";
  m[v.id]={at:Date.now(),title:String(v.title||"").slice(0,120),subj:subj,topic:topic,
    ch:String(v.ch||"").slice(0,60),hoca:String(hoca).slice(0,60)};
  save();
  /* konu belliyse kademeyi ilerlet */
  let msg="İzledim ✓";
  if(subj&&topic){
    const key=topicKeyOf(subj,topic);
    if(key){
      const t=tget(key);
      if(t.st<1){
        tsetStatus(key,1);
        msg="İzledim ✓ · "+topic+" konusu \"işledim\" oldu";
      } else {
        msg="İzledim ✓ · "+topic;
      }
    }
  }
  renderVidList();
  if(el("topics")&&el("topics").classList.contains("active"))renderSubjects();
  toast(msg);
  return true;
}
function renderWatchedList(){
  const w=el("watchList"); if(!w)return;
  const m=watchedMap();
  const list=Object.keys(m).map(k=>Object.assign({id:k},m[k]))
    .sort((a,b)=>(b.at|0)-(a.at|0)).slice(0,40);
  const cnt=el("watchCount");
  if(cnt)cnt.textContent=Object.keys(m).length||"";
  if(!list.length){
    w.innerHTML='<div class="empty">Henüz izledim işareti koymadın. Video listesinde her kartın üstündeki ✓ ile işaretleyebilirsin; konu belliyse o konu kendiliğinden "işledim" olur.</div>';
    return;
  }
  w.innerHTML=list.map(x=>{
    const d=new Date(x.at||0);
    const when=isNaN(d)?"":d.toLocaleDateString("tr-TR",{day:"numeric",month:"long"});
    return '<div class="dayrow"><span class="k">'+esc(x.title||"video")+
      (x.subj?'<br><small>'+esc(x.subj)+(x.topic?" · "+esc(x.topic):"")+' · '+when+'</small>':"")+'</span>'+
      '<span class="v"><button class="del" onclick="unwatch(\''+x.id+'\')">kaldır</button></span></div>';
  }).join("");
}
function unwatch(id){
  const m=watchedMap();
  const bk=clone(m[id]);
  delete m[id]; save();
  if(bk)pushUndo("İzledim işareti kaldırıldı",()=>{ watchedMap()[id]=bk; });
  renderWatchedList();
  if(el("vidOverlay")&&el("vidOverlay").style.display==="flex")renderVidList();
}



/* ==================================================================
   BİLDİRİMLER
   Tarayıcı bildirimi; uygulama açıkken ya da arka planda sekme
   olarak dururken çalışır. Uygulama tamamen kapalıyken bildirim
   göndermek bir sunucu gerektirir — o yüzden koç özeti e-posta ile
   Apps Script üzerinden gönderilir.
   ================================================================== */
function validTime(v){
  const m=/^(\d{2}):(\d{2})$/.exec(String(v||""));
  if(!m)return false;
  const h=+m[1],mi=+m[2];
  return h>=0&&h<=23&&mi>=0&&mi<=59;
}
function notifCfg(){
  if(!S.notif||typeof S.notif!=="object")S.notif={};
  const c=S.notif;
  c.on=!!c.on;
  c.pomo=c.pomo!==false;
  c.review=c.review!==false;
  c.evening=c.evening!==false;
  if(!validTime(c.eveningAt))c.eveningAt="21:00";
  if(typeof c.lastEvening!=="string")c.lastEvening="";
  if(typeof c.lastReview!=="string")c.lastReview="";
  return c;
}
function notifSupported(){
  try{ return typeof Notification!=="undefined"; }catch(e){ return false; }
}
function notifState(){
  if(!notifSupported())return "yok";
  try{ return Notification.permission; }catch(e){ return "yok"; }
}
function askNotif(){
  if(!notifSupported()){ toast("Bu tarayıcı bildirim desteklemiyor"); return Promise.resolve("yok"); }
  if(notifState()==="denied"){
    toast("İzin daha önce reddedilmiş — tarayıcı ayarlarından açman gerekiyor");
    notifDiag();
    return Promise.resolve("denied");
  }
  return Promise.resolve(Notification.requestPermission()).then(p=>{
    const c=notifCfg();
    c.on=(p==="granted");
    save(); renderNotifSettings(); notifDiag();
    if(p==="granted")notify("YKS Defterim","Bildirimler açıldı. Böyle görünecek.","acildi");
    toast(p==="granted"?"Bildirimler açıldı ✓":"Bildirim izni verilmedi");
    return p;
  }).catch(()=>{ toast("İzin istenemedi"); return "yok"; });
}
function notify(title,body,tag){
  const c=notifCfg();
  if(!c.on)return false;
  if(notifState()!=="granted")return false;
  const opts={body:body||"",tag:tag||"yks",icon:"icon-192.png",badge:"icon-192.png",lang:"tr"};
  /* Doğrudan Notification dene. serviceWorker.ready bazı durumlarda hiç
     çözülmüyor; ona bağlanırsan bildirim sessizce hiç çıkmıyor. */
  let ok1=false;
  try{ new Notification(title,opts); ok1=true; }catch(e){ ok1=false; }
  if(ok1)return true;
  /* Bazı tarayıcılar (özellikle mobil) yalnız service worker üzerinden
     bildirime izin veriyor; orada da zaman aşımı koy. */
  try{
    if(navigator.serviceWorker&&navigator.serviceWorker.ready){
      let bitti=false;
      const zaman=setTimeout(()=>{ bitti=true; },4000);
      navigator.serviceWorker.ready.then(reg=>{
        clearTimeout(zaman);
        if(bitti||!reg||!reg.showNotification)return;
        try{ reg.showNotification(title,opts); }catch(e){}
      }).catch(()=>{ clearTimeout(zaman); });
      return true;
    }
  }catch(e){}
  return false;
}
function toggleNotif(kind){
  const c=notifCfg();
  c[kind]=!c[kind]; save(); renderNotifSettings();
  scheduleEvening();
}
function saveEveningAt(){
  const c=notifCfg();
  const v=(el("notifTime").value||"").trim();
  if(!validTime(v)){ toast("Saat 00:00 ile 23:59 arasında olmalı"); return false; }
  c.eveningAt=v;
  save(); renderNotifSettings(); scheduleEvening();
  toast("Hatırlatma saati kaydedildi");
  return true;
}
function renderNotifSettings(){
  const c=notifCfg();
  const st=el("notifStatus"); if(!st)return;
  const p=notifState();
  if(p==="yok"){ st.textContent="Bu tarayıcı bildirim desteklemiyor."; st.style.color="var(--label-3)"; }
  else if(p!=="granted"){ st.textContent="İzin verilmedi. Bildirimleri açmak için izin ver."; st.style.color="var(--label-3)"; }
  else if(!c.on){ st.textContent="İzin var ama bildirimler kapalı."; st.style.color="var(--label-3)"; }
  else {
    let ek="";
    try{
      const standalone=(window.matchMedia&&window.matchMedia("(display-mode: standalone)").matches)||navigator.standalone;
      const ios=/iPad|iPhone|iPod/.test(navigator.userAgent||"");
      if(ios&&!standalone)ek=" iPhone'da bildirim için uygulamayı ana ekrana eklemen gerekir.";
    }catch(e){}
    st.textContent="Bildirimler açık."+ek;
    st.style.color=ek?"var(--time)":"var(--success)";
  }
  [["notifPomo","pomo"],["notifReview","review"],["notifEvening","evening"]].forEach(x=>{
    const e=el(x[0]); if(e)e.classList.toggle("on",!!c[x[1]]);
  });
  const t=el("notifTime"); if(t&&document.activeElement!==t)t.value=c.eveningAt;
  if(typeof notifDiag==="function"&&el("notifDiag"))notifDiag();
}
/* neden çalışmıyor sorusuna cevap */
function notifDiag(){
  const c=notifCfg(),box=el("notifDiag");
  const satir=[];
  satir.push("Destek: "+(notifSupported()?"var":"yok"));
  satir.push("İzin: "+notifState());
  satir.push("Uygulama ayarı: "+(c.on?"açık":"kapalı"));
  satir.push("Adres: "+location.protocol);
  satir.push("Çevrimdışı katman: "+(("serviceWorker" in navigator)
    ?((navigator.serviceWorker&&navigator.serviceWorker.controller)?"etkin":"kayıtlı değil")
    :"desteklenmiyor"));
  let anaEkran="hayır";
  try{
    if((window.matchMedia&&window.matchMedia("(display-mode: standalone)").matches)||
       window.navigator.standalone)anaEkran="evet";
  }catch(e){}
  satir.push("Ana ekrandan açıldı: "+anaEkran);
  satir.push("Pomodoro: "+(c.pomo?"açık":"kapalı")+" · Tekrar: "+(c.review?"açık":"kapalı")+
    " · Akşam: "+(c.evening?"açık":"kapalı")+" ("+c.eveningAt+")");
  if(location.protocol==="file:")
    satir.push("UYARI: file:// üzerinden bildirimler çoğu tarayıcıda çalışmaz — uygulamayı adresinden aç.");
  if(notifState()==="denied")
    satir.push("UYARI: izin reddedilmiş. Tarayıcı → site ayarları → Bildirimler'den açman gerekiyor.");
  if(notifState()==="granted"&&!c.on)
    satir.push("UYARI: izin var ama uygulama ayarı kapalı — 'Bildirimlere izin ver'e tekrar bas.");
  if(anaEkran==="hayır")
    satir.push("NOT: iPhone'da bildirimler yalnız uygulama ana ekrana eklenmişse çalışır.");
  const metin=satir.join("\n");
  if(box)box.textContent=metin;
  return metin;
}
function testNotif(){
  if(!notifSupported()){ notifDiag(); toast("Bu tarayıcı bildirim desteklemiyor"); return false; }
  const p=notifState();
  if(p==="denied"){ notifDiag(); toast("İzin reddedilmiş — tarayıcı ayarlarından açman gerekiyor"); return false; }
  if(p!=="granted"){ notifDiag(); toast("Önce 'Bildirimlere izin ver' düğmesine bas"); return false; }
  const c=notifCfg();
  if(!c.on){ c.on=true; save(); renderNotifSettings(); }
  notifDiag();
  const okN=notify("YKS Defterim","Bildirimler çalışıyor. Böyle görünecek.","test");
  toast(okN?"Bildirim gönderildi · gelmezse aşağıdaki tanıya bak":"Bildirim gönderilemedi");
  return okN;
}

/* --- akşam hatırlatması --- */
let eveningTimer=null;
function eveningDelay(){
  const c=notifCfg();
  const p=c.eveningAt.split(":");
  const now=new Date();
  const at=new Date(now.getFullYear(),now.getMonth(),now.getDate(),+p[0]||21,+p[1]||0,0,0);
  return at.getTime()-now.getTime();
}
function eveningText(){
  const k=todayKey();
  const done=dayDone(k);
  const q=S.solved[k]||0,m=S.pomoMin[k]||0;
  if(done)return "Bugünü tamamladın · "+fmtHM(m)+" · "+q+" soru. Yarının planına bakabilirsin.";
  return "Bugünü işaretlemedin. "+(m||q?fmtHM(m)+" · "+q+" soru kaydı var.":"Bugün için kayıt yok.");
}
function fireEvening(){
  const c=notifCfg();
  if(!c.on||!c.evening)return false;
  if(c.lastEvening===todayKey())return false;
  c.lastEvening=todayKey(); save();
  return notify("Günü kapat",eveningText(),"aksam");
}
function scheduleEvening(){
  clearTimeout(eveningTimer); eveningTimer=null;
  const c=notifCfg();
  if(!c.on||!c.evening)return;
  let d=eveningDelay();
  if(d<0){
    /* saat geçmişse ve bugün gönderilmediyse hemen gönder */
    if(c.lastEvening!==todayKey())fireEvening();
    return;
  }
  if(d>6*3600000)d=6*3600000;      /* uzun beklemeleri parçala */
  eveningTimer=setTimeout(()=>{ if(eveningDelay()<=0)fireEvening(); scheduleEvening(); },d+500);
}
/* --- tekrar hatırlatması --- */
function fireReview(){
  const c=notifCfg();
  if(!c.on||!c.review)return false;
  if(c.lastReview===todayKey())return false;
  const n=(typeof reviewQueue==="function")?reviewQueue().length:0;
  const od=(typeof overdueTopics==="function")?overdueTopics().length:0;
  if(!n&&!od)return false;
  c.lastReview=todayKey(); save();
  const parts=[];
  if(n)parts.push(n+" konunun tekrar zamanı geldi");
  if(od)parts.push(od+" konu hedef tarihini aştı");
  return notify("Tekrar zamanı",parts.join(" · "),"tekrar");
}

/* ---------- koç e-postası ---------- */

/* ==================================================================
   BAŞLATMA
   ================================================================== */
function bootNotif(){
  const c=notifCfg();
  if(c.on&&notifState()!=="granted")c.on=false;
  perfIdle("boot-notif-ui",()=>{renderNotifSettings();notifDiag();renderWatchedList();},1200);
  scheduleEvening();
  setTimeout(fireReview,3000);
}
function boot13(){
  boot12();
  bootNotif();
}
/* boot çağrısı app20 sonunda yapılır */
/* ==================================================================
   SIRALAMA TAHMİNİ
   Aynı puan yıldan yıla çok farklı sıralamalara denk geliyor
   (400 puan 2021'de ~9.700, 2023'te ~53.800). Bu yüzden tek sayı
   değil, zor–kolay sınav aralığı gösterilir.
   ================================================================== */

/* [puan, sıralama] — 2021 (zor) ve 2023 (kolay) uçları, sayısal.
   Aradaki yıllar bu iki eğrinin arasında kalıyor. */
const RANK_SAY_HARD=[[560,1],[540,200],[520,700],[500,1600],[480,3200],
  [460,5200],[440,7200],[420,8600],[400,9700],[380,14000],[360,22000],
  [340,35000],[320,55000],[300,85000],[280,130000],[260,190000],
  [240,270000],[220,360000],[200,470000],[180,600000]];
const RANK_SAY_EASY=[[560,20],[540,600],[520,2200],[500,5500],[480,11000],
  [460,19000],[440,29000],[420,41000],[400,54000],[380,72000],[360,95000],
  [340,125000],[320,160000],[300,205000],[280,255000],[260,315000],
  [240,385000],[220,465000],[200,555000],[180,660000]];
const RANK_EA_HARD=[[560,1],[540,150],[520,500],[500,1200],[480,2400],
  [460,4000],[440,6000],[420,8500],[400,11500],[380,16000],[360,23000],
  [340,33000],[320,48000],[300,70000],[280,100000],[260,140000],
  [240,195000],[220,260000],[200,340000],[180,440000]];
const RANK_EA_EASY=[[560,15],[540,450],[520,1600],[500,3800],[480,7500],
  [460,13000],[440,20000],[420,29000],[400,40000],[380,54000],[360,72000],
  [340,95000],[320,124000],[300,160000],[280,205000],[260,260000],
  [240,325000],[220,400000],[200,485000],[180,580000]];

/* tabloları dışarıdan da okunabilir yap */
try{
  window.RANK_SAY_HARD=RANK_SAY_HARD; window.RANK_SAY_EASY=RANK_SAY_EASY;
  window.RANK_EA_HARD=RANK_EA_HARD;   window.RANK_EA_EASY=RANK_EA_EASY;
}catch(e){}

function rankTables(){
  if(S.puanTuru==="EA")return {hard:RANK_EA_HARD,easy:RANK_EA_EASY,ad:"Eşit Ağırlık"};
  if(S.puanTuru==="SAY")return {hard:RANK_SAY_HARD,easy:RANK_SAY_EASY,ad:"Sayısal"};
  return null;
}
/* tabloda doğrusal ara değer */
function lookupRank(table,score){
  if(!isFinite(score))return null;
  if(score>=table[0][0])return table[0][1];
  const last=table[table.length-1];
  if(score<=last[0])return last[1];
  for(let i=0;i<table.length-1;i++){
    const a=table[i],b=table[i+1];
    if(score<=a[0]&&score>=b[0]){
      const t=(a[0]-score)/(a[0]-b[0]);
      return Math.round(a[1]+(b[1]-a[1])*t);
    }
  }
  return null;
}
function rankEstimate(score){
  if(!isFinite(score)||score<=0)return null;
  const t=rankTables();
  if(!t)return null;
  const hi=lookupRank(t.hard,score);      /* zor sınav → iyi sıralama */
  const lo=lookupRank(t.easy,score);      /* kolay sınav → geride sıralama */
  if(hi===null||lo===null)return null;
  return {best:Math.min(hi,lo),worst:Math.max(hi,lo),mid:Math.round((hi+lo)/2),ad:t.ad};
}
function fmtRank(n){
  if(n===null||n===undefined)return "—";
  if(n<1000)return String(n);
  return n.toLocaleString("tr-TR");
}
/* hedef sıralama için gereken puan (orta senaryo) */
function scoreForRank(target){
  const t=rankTables();
  if(!t)return null;
  let best=null,bestDiff=Infinity;
  for(let s=180;s<=560;s+=0.5){
    const r=rankEstimate(s);
    if(!r)continue;
    const d=Math.abs(r.mid-target);
    if(d<bestDiff){ bestDiff=d; best=s; }
  }
  return best;
}
function renderRank(){
  const w=el("rankBox"); if(!w)return;
  ["SAY","EA","SOZ","DIL"].forEach(k=>{ const b=el("pt_"+k); if(b)b.classList.toggle("on",(S.puanTuru||"SAY")===k); });
  const ti=el("hedefSira"); if(ti&&document.activeElement!==ti)ti.value=S.hedefSira||"";

  if(!rankTables()){
    w.innerHTML='<div class="empty">'+(S.puanTuru==="DIL"?"Dil":"Sözel")+
      ' denemelerini kaydedebilirsin; güvenilir bir sıralama tablosu olmadığı için burada uydurma tahmin gösterilmez.</div>';
    return;
  }

  /* alan puanı varsa onu, yoksa TYT puanını kullan */
  const e=(typeof estScores==="function")?estScores():null;
  const est=e?((e.alan!=null&&isFinite(e.alan))?e.alan:e.tyt):null;
  const tur=(e&&e.alan!=null)?"alan":"TYT";
  if(est===null||!isFinite(est)||est<=0){
    w.innerHTML='<div class="empty">Sıralama tahmini için önce deneme gir. Puan tahmini hesaplandığında burada karşılığı çıkar.</div>';
    return;
  }
  const r=rankEstimate(est);
  if(!r){ w.innerHTML='<div class="empty">Bu puan için tahmin üretilemedi.</div>'; return; }
  let html='<div class="dayrow"><span class="k">Tahmini puan</span><span class="v">'+r2(est)+
      ' <small style="color:var(--label-3)">('+tur+')</small></span></div>'+
    '<div class="dayrow"><span class="k">Sıralama aralığı</span><span class="v">'+
      fmtRank(r.best)+' – '+fmtRank(r.worst)+'</span></div>'+
    '<div class="dayrow"><span class="k">Orta senaryo</span><span class="v">'+fmtRank(r.mid)+'</span></div>';
  const hedef=S.hedefSira|0;
  if(hedef>0){
    const gerekli=scoreForRank(hedef);
    const fark=gerekli!==null?r2(gerekli-est):null;
    const ulasti=r.mid<=hedef;
    html+='<div class="dayrow"><span class="k">Hedefin</span><span class="v">'+fmtRank(hedef)+'</span></div>';
    if(ulasti){
      html+='<p class="hint" style="color:var(--success)">Şu anki tempoyla orta senaryoda hedefin içindesin. Zor bir sınavda daha da öne geçersin.</p>';
    } else if(fark!==null){
      html+='<div class="dayrow"><span class="k">Gereken puan</span><span class="v" style="color:var(--ochre-ink)">'+
        r2(gerekli)+' · +'+fark+'</span></div>';
      html+='<p class="hint">Hedefe ulaşmak için puanını yaklaşık '+fark+' artırman gerekiyor. Ters hedef hesaplayıcısı bunun net karşılığını verir.</p>';
    }
  }
  html+='<p class="hint"><b>Aralık neden geniş?</b> Aynı puan sınavın zorluğuna göre çok farklı sıralamalara denk geliyor — geçmişte 400 puan bir yıl 9.700, başka bir yıl 53.800 yapmış. Alt uç zor, üst uç kolay sınav varsayımı. Kesin değil, yön göstergesi.</p>';
  w.innerHTML=html;
}
function setPuanTuru(v){
  S.puanTuru=["SAY","EA","SOZ","DIL"].indexOf(v)>=0?v:"SAY";
  save(); renderScore(); renderRank();
  if(typeof renderTargets==="function"){renderTargets();renderNetGain();}
  toast(({SAY:"Sayısal",EA:"Eşit Ağırlık",SOZ:"Sözel",DIL:"Dil"})[S.puanTuru]);
}
function saveRankSettings(){
  const ti=el("hedefSira");
  if(ti){
    const v=parseInt(ti.value,10);
    S.hedefSira=(isFinite(v)&&v>0&&v<=1000000)?v:0;
  }
  save(); renderRank();
  toast("Kaydedildi");
}

/* ==================================================================
   SABAH KONTROL LİSTESİ
   Uygulamayı açtığında karar vermek zorunda kalmadan başlaman için:
   bugünün üç işi, tamamlanınca kapanır.
   ================================================================== */
function morningKey(){ return todayKey(); }
function morningState(){
  if(!S.morning||typeof S.morning!=="object")S.morning={};
  const m=S.morning;
  if(m.day!==morningKey()){
    /* önceki bir güne aitse gerçek bir gün değişimi olmuştur:
       sıfırlamayı kalıcı yap. İlk açılışta (day boş) yazma yapma. */
    const gercekDegisim=!!m.day;
    m.day=morningKey(); m.done=[]; m.hidden=false;
    if(gercekDegisim){ try{ localStorage.setItem("yks",JSON.stringify(S)); }catch(e){} }
  }
  if(!Array.isArray(m.done))m.done=[];
  return m;
}
/* üç iş: veriden türetilir, hep aynı sırada */
function morningTasks(){
  const out=[];
  const rq=(typeof reviewQueue==="function")?reviewQueue():[];
  if(rq.length)out.push({id:"tekrar",t:"Tekrar: "+rq[0].subj+" · "+rq[0].topic,
    d:rq.length>1?"+"+(rq.length-1)+" konu daha":"Aralıklı tekrar sırası",go:"topics"});
  const st=(typeof stalestTopic==="function")?stalestTopic():null;
  if(st)out.push({id:"konu",t:"Konu: "+st.subj+" · "+st.topic,d:ST_LABEL[st.st]||"",go:"topics",
    plan:st.subj+" · "+st.topic});
  const tw=(typeof topWrongTopics==="function")?topWrongTopics(1):[];
  if(tw.length)out.push({id:"yanlis",t:"Soru: "+tw[0].k,d:tw[0].n+" yanlış kaydın var",go:"deneme",
    plan:tw[0].k+" soru çöz"});
  const cut=addDaysKey(todayKey(),-7);
  const son=S.denemeler.filter(d=>d.date>=cut&&d.type!=="BRANS").length;
  if(!son)out.push({id:"deneme",t:"Bu hafta deneme çöz",d:"Son 7 günde kayıtlı deneme yok",go:"deneme"});
  if(out.length<3&&S.target)out.push({id:"hedef",t:"Günlük soru hedefi: "+S.target,
    d:"Bugün "+(S.solved[todayKey()]||0)+" soru",go:"home"});
  return out.slice(0,3);
}
function morningDone(id){
  const m=morningState();
  if(m.done.indexOf(id)<0)m.done.push(id);
  save(); renderMorning();
  const kalan=morningTasks().filter(t=>m.done.indexOf(t.id)<0).length;
  if(!kalan)toast("Sabah listesi tamam · iyi çalışmalar");
}
function hideMorning(){ morningState().hidden=true; save(); renderMorning(); }
function renderMorning(){
  const w=el("morningBox"); if(!w)return;
  if(typeof isCoach==="function"&&isCoach()){ w.style.display="none"; return; }
  const m=morningState();
  const tasks=morningTasks();
  const kalan=tasks.filter(t=>m.done.indexOf(t.id)<0);
  if(m.hidden||!tasks.length||!kalan.length){ w.style.display="none"; return; }
  w.style.display="block";
  const esc2=v=>String(v).replace(/'/g,"\\'");
  w.innerHTML='<div class="mrnhead"><span class="mrnt">Bugüne başla</span>'+
    '<button class="btn ghost tiny" onclick="hideMorning()">Gizle</button></div>'+
    kalan.map(t=>
      '<div class="mrnrow" onclick="go(\''+t.go+'\')">'+
      '<button class="mrnchk" onclick="event.stopPropagation();morningDone(\''+esc2(t.id)+'\')" aria-label="Tamam">✓</button>'+
      '<span class="mrnmeta"><span class="m1">'+esc(t.t)+'</span>'+
      (t.d?'<span class="m2">'+esc(t.d)+'</span>':"")+'</span>'+
      (t.plan?'<button class="btn ghost tiny" onclick="event.stopPropagation();addToToday(\''+esc2(t.plan)+'\')">Plana</button>':"")+
      '</div>').join("")+
    '<p class="hint" style="margin:10px 0 0;">'+(tasks.length-kalan.length)+'/'+tasks.length+' tamam</p>';
}

/* ==================================================================
   HAFTALIK SÖZLEŞME
   Pazar hedefi yaz, hafta sonunda tuttuğunu gör.
   ================================================================== */
function contracts(){ if(!Array.isArray(S.contracts))S.contracts=[]; return S.contracts; }
function weekKeyNow(){ return keyOf(mondayOf(new Date())); }
function contractFor(wk){ return contracts().find(c=>c.wk===wk)||null; }
function weekTotals(wk){
  let min=0,q=0,gun=0;
  for(let i=0;i<7;i++){
    const k=addDaysKey(wk,i);
    min+=S.pomoMin[k]||0; q+=S.solved[k]||0;
    if(dayDone(k))gun++;
  }
  const cut=addDaysKey(wk,7);
  const dnm=S.denemeler.filter(d=>d.date>=wk&&d.date<cut&&d.type!=="BRANS").length;
  return {min:min,q:q,gun:gun,deneme:dnm};
}
function saveContract(){
  const wk=weekKeyNow();
  const saat=Math.max(0,Math.min(120,parseFloat(el("ctSaat").value)||0));
  const soru=Math.max(0,Math.min(20000,parseInt(el("ctSoru").value,10)||0));
  const dnm=Math.max(0,Math.min(20,parseInt(el("ctDeneme").value,10)||0));
  const not=(el("ctNot").value||"").trim().slice(0,140);
  if(!saat&&!soru&&!dnm){ toast("En az bir hedef gir"); return false; }
  const eski=contractFor(wk);
  if(eski){
    eski.saat=saat; eski.soru=soru; eski.deneme=dnm; eski.not=not;
  } else {
    contracts().push({wk:wk,saat:saat,soru:soru,deneme:dnm,not:not,at:Date.now()});
    if(contracts().length>60)S.contracts=contracts().slice(-60);
  }
  save(); renderContract();
  toast("Bu haftanın sözü kaydedildi");
  return true;
}
function contractResult(wk){
  const c=contractFor(wk); if(!c)return null;
  const t=weekTotals(wk);
  const saatHedef=Math.round((c.saat||0)*60);
  const items=[];
  if(saatHedef)items.push({ad:"Çalışma",hedef:fmtHM(saatHedef),olan:fmtHM(t.min),
    oran:saatHedef?t.min/saatHedef:1,tut:t.min>=saatHedef});
  if(c.soru)items.push({ad:"Soru",hedef:String(c.soru),olan:String(t.q),
    oran:t.q/c.soru,tut:t.q>=c.soru});
  if(c.deneme)items.push({ad:"Deneme",hedef:String(c.deneme),olan:String(t.deneme),
    oran:t.deneme/c.deneme,tut:t.deneme>=c.deneme});
  const tutan=items.filter(x=>x.tut).length;
  return {c:c,t:t,items:items,tutan:tutan,hepsi:items.length,
    yuzde:items.length?Math.round(items.reduce((a,x)=>a+Math.min(1,x.oran),0)/items.length*100):0};
}
function contractStreak(){
  let n=0,wk=addDaysKey(weekKeyNow(),-7);
  for(let i=0;i<60;i++){
    const r=contractResult(wk);
    if(!r||!r.items.length)break;
    if(r.tutan<r.hepsi)break;
    n++; wk=addDaysKey(wk,-7);
  }
  return n;
}
function daysLeftInWeek(){
  const dw=dowOf(new Date());
  return 6-dw;
}
function renderContract(){
  const w=el("ctBox"); if(!w)return;
  const wk=weekKeyNow();
  const c=contractFor(wk);
  const form=el("ctForm");
  if(c){
    if(form)form.style.display="none";
    if(el("ctSaat"))el("ctSaat").value=c.saat||"";
    if(el("ctSoru"))el("ctSoru").value=c.soru||"";
    if(el("ctDeneme"))el("ctDeneme").value=c.deneme||"";
    if(el("ctNot"))el("ctNot").value=c.not||"";
  } else {
    if(form)form.style.display="block";
  }
  if(!c){
    w.innerHTML='<div class="empty">Bu hafta için söz vermedin. Yukarıdan hedeflerini yaz; hafta boyunca ne kadarını tuttuğunu burada görürsün.</div>';
    return;
  }
  const r=contractResult(wk);
  const kalan=daysLeftInWeek();
  let html=r.items.map(x=>{
    const p=Math.min(100,Math.round(x.oran*100));
    return '<div class="ctrow"><div class="ctline"><span class="k">'+esc(x.ad)+'</span>'+
      '<span class="v" style="color:'+(x.tut?"var(--success)":p>=70?"var(--time)":"var(--label-2)")+'">'+
      esc(x.olan)+' / '+esc(x.hedef)+'</span></div>'+
      '<div class="bar"><i style="width:'+p+'%;background:'+(x.tut?"var(--success)":"var(--accent)")+'"></i></div></div>';
  }).join("");
  html+='<div class="dayrow"><span class="k">Genel</span><span class="v">%'+r.yuzde+
    ' · '+r.tutan+'/'+r.hepsi+' hedef</span></div>';
  if(c.not)html+='<p class="hint" style="font-style:italic;">"'+esc(c.not)+'"</p>';
  if(kalan>0)html+='<p class="hint">Haftanın bitmesine '+kalan+' gün var.</p>';
  else html+='<p class="hint"><b>'+(r.tutan===r.hepsi?"Sözünü tuttun.":"Bu hafta sözünü tutamadın.")+
    '</b> Pazar günü yeni hafta için hedef yazabilirsin.</p>';
  const seri=contractStreak();
  if(seri)html+='<div class="dayrow"><span class="k">Söz serisi</span><span class="v">'+seri+' hafta</span></div>';
  html+='<button class="btn ghost tiny" style="width:100%;margin-top:10px;" onclick="editContract()">Hedefleri değiştir</button>';
  /* geçmiş haftalar */
  const gecmis=contracts().filter(x=>x.wk<wk).sort((a,b)=>b.wk.localeCompare(a.wk)).slice(0,6);
  if(gecmis.length){
    html+='<p class="eyebrow" style="margin:16px 0 6px;">Geçmiş haftalar</p>';
    html+=gecmis.map(g=>{
      const gr=contractResult(g.wk);
      const tam=gr&&gr.tutan===gr.hepsi;
      return '<div class="dayrow"><span class="k">'+parseKey(g.wk).toLocaleDateString("tr-TR",{day:"numeric",month:"long"})+' haftası</span>'+
        '<span class="v" style="color:'+(tam?"var(--success)":"var(--label-2)")+'">%'+(gr?gr.yuzde:0)+'</span></div>';
    }).join("");
  }
  w.innerHTML=html;
}
function editContract(){
  const form=el("ctForm"); if(form)form.style.display="block";
}

/* ==================================================================
   DENEME GÜNÜ
   ================================================================== */
function denemeGunu(){ return (S.denemeGun===undefined||S.denemeGun===null)?0:S.denemeGun; }
function setDenemeGun(){
  const v=parseInt(el("denemeGun").value,10);
  S.denemeGun=(v>=0&&v<=7)?v:6;
  save(); renderDenemeGun(); renderDenemeReminder();
  toast(S.denemeGun===7?"Deneme günü kapatıldı":"Deneme günü kaydedildi");
}
function nextDenemeDate(){
  const g=denemeGunu();
  if(g>6||g<0)return null;
  const mon=keyOf(mondayOf(new Date()));
  return addDaysKey(mon,g);
}
function denemeDoneThisWeek(){
  const mon=keyOf(mondayOf(new Date())),cut=addDaysKey(mon,7);
  return S.denemeler.filter(d=>d.date>=mon&&d.date<cut&&d.type!=="BRANS").length;
}
function renderDenemeGun(){
  const sel=el("denemeGun"); if(sel)sel.value=String(denemeGunu());
  const w=el("dgBox"); if(!w)return;
  const g=denemeGunu();
  if(g>6){ w.innerHTML='<div class="empty">Deneme günü belirlenmedi.</div>'; return; }
  const tarih=nextDenemeDate();
  const bugun=todayKey();
  const sayi=denemeDoneThisWeek();
  const gunAd=["Pazartesi","Salı","Çarşamba","Perşembe","Cuma","Cumartesi","Pazar"][g];
  let html='<div class="dayrow"><span class="k">Deneme günün</span><span class="v">'+gunAd+'</span></div>'+
    '<div class="dayrow"><span class="k">Bu hafta çözülen</span><span class="v">'+sayi+'</span></div>';
  if(sayi>0){
    html+='<p class="hint" style="color:var(--success)">Bu haftanın denemesi tamam.</p>';
  } else if(tarih===bugun){
    html+='<p class="hint" style="color:var(--time)"><b>Bugün deneme günü.</b></p>'+
      '<div class="rowtools" style="margin:10px 0 0;">'+
      '<button class="btn green small" onclick="startSim(S.simulMin)">Simülasyonu başlat</button>'+
      '<button class="btn ghost small" onclick="go(\'deneme\')">Sonucu gir</button></div>';
  } else if(tarih<bugun){
    html+='<p class="hint" style="color:var(--danger)">Deneme günün geçti ve bu hafta deneme kaydı yok.</p>'+
      '<button class="btn ghost small" style="width:100%;margin-top:10px;" onclick="startSim(S.simulMin)">Şimdi çöz</button>';
  } else {
    const kalan=Math.round((parseKey(tarih)-parseKey(bugun))/86400000);
    html+='<p class="hint">Deneme gününe '+kalan+' gün var.</p>';
  }
  w.innerHTML=html;
}
/* ana ekranda hatırlatma */
function renderDenemeReminder(){
  const w=el("dgBanner"); if(!w)return;
  if(typeof isCoach==="function"&&isCoach()){ w.style.display="none"; return; }
  const g=denemeGunu();
  if(g>6||denemeDoneThisWeek()>0){ w.style.display="none"; return; }
  const tarih=nextDenemeDate(),bugun=todayKey();
  if(tarih!==bugun&&tarih>=bugun){ w.style.display="none"; return; }
  w.style.display="block";
  w.className="restcard"+(tarih<bugun?" lvl2":"");
  w.innerHTML='<div class="rt">'+(tarih===bugun?"Bugün deneme günü":"Deneme günün geçti")+'</div>'+
    '<p class="rp">'+(tarih===bugun
      ? "Haftanın denemesini bugün çöz. Simülasyon bölüm bölüm süre tutar."
      : "Bu hafta henüz deneme çözmedin. Geç kalmak, ölçmeden ilerlemek demek.")+'</p>'+
    '<div class="rowtools" style="margin:0;">'+
    '<button class="btn ghost tiny" onclick="startSim(S.simulMin)">Simülasyonu başlat</button>'+
    '<button class="btn ghost tiny" onclick="go(\'deneme\')">Sonucu gir</button></div>';
}

/* ==================================================================
   BAŞLATMA
   ================================================================== */
function renderRound13(){
  morningState();      /* gün değiştiyse listeyi burada sıfırla */
  renderRank(); renderMorning(); renderContract();
  renderDenemeGun(); renderDenemeReminder();
}
function boot14(){
  boot13();
  perfIdle("boot-round13",()=>renderRound13(),850);
}
/* boot çağrısı app21 sonunda yapılır */
/* ==================================================================
   DEĞİŞİKLİK GÜNLÜĞÜ
   Ortak kullanımda karşı taraftan gelen bir silmeyi geri almanın
   tek yolu. Her yazma işlemi cihaz adıyla kaydedilir.
   ================================================================== */
const LOG_MAX=120;
function changeLog(){ if(!Array.isArray(S.log))S.log=[]; return S.log; }
function logAdd(kind,text,undoData){
  const l=changeLog();
  l.push({id:Date.now()+Math.floor(Math.random()*1000),at:Date.now(),
    dev:(S.device||"Cihaz").slice(0,24),kind:kind,text:String(text||"").slice(0,120),
    data:undoData?JSON.stringify(undoData).slice(0,20000):""});
  if(l.length>LOG_MAX)S.log=l.slice(-LOG_MAX);
}
function logRestore(id){
  const rec=changeLog().find(x=>x.id===id);
  if(!rec||!rec.data){ toast("Bu kayıt geri alınamıyor"); return false; }
  let d;
  try{ d=JSON.parse(rec.data); }catch(e){ toast("Kayıt okunamadı"); return false; }
  if(!confirm(rec.text+" geri alınsın mı?"))return false;
  let done=false;
  if(d.t==="deneme"&&d.v){ S.denemeler.push(d.v); done=true; }
  else if(d.t==="book"&&d.v){ S.books.push(d.v); done=true; }
  else if(d.t==="wrong"&&d.v){ S.wrongLog.push(d.v); done=true; }
  else if(d.t==="topic"&&d.k&&d.v){ S.topics[d.k]=d.v; done=true; }
  else if(d.t==="day"&&d.k&&d.v){
    const k=d.k,v=d.v;
    if(v.s!==undefined)S.solved[k]=v.s;
    if(v.m!==undefined)S.pomoMin[k]=v.m;
    if(v.j!==undefined)S.journal[k]=v.j;
    done=true;
  }
  else if(d.t==="week"&&d.k&&d.v){ S.weeks[d.k]=d.v; done=true; }
  else if(d.t==="camp"&&d.v){
    Object.keys(d.v).forEach(k=>{ if(d.v[k])S.weeks[k]=d.v[k]; else delete S.weeks[k]; });
    if(d.rows)S.rows=d.rows;
    if(d.labels)S.rowLabels=d.labels;
    S.camp=null; done=true;
  }
  else if(d.t==="calib"&&d.v){ S.calib.push(d.v); done=true; }
  else if(d.t==="note"&&d.v){ if(!Array.isArray(S.coachNotes))S.coachNotes=[]; S.coachNotes.push(d.v); done=true; }
  if(!done){ toast("Bu tür geri alınamıyor"); return false; }
  logAdd("geri","Geri alındı: "+rec.text,null);
  save(); renderAll();
  toast("Geri alındı ✓");
  return true;
}
function clearLog(){
  if(!confirm("Değişiklik günlüğü temizlensin mi? Geri alma kayıtları da gider."))return;
  S.log=[]; save(); renderLog(); toast("Günlük temizlendi");
}
let logFilter="";
function setLogFilter(v){ logFilter=(logFilter===v)?"":v; renderLog(); }
function renderLog(){
  const w=el("logBox"); if(!w)return;
  const list=changeLog().slice().reverse()
    .filter(x=>!logFilter||x.kind===logFilter).slice(0,60);
  const chips=el("logChips");
  if(chips){
    const kinds=[["","Hepsi"],["sil","Silme"],["ekle","Ekleme"],["duzen","Düzenleme"],["geri","Geri alma"]];
    chips.innerHTML=kinds.map(k=>'<button class="chip '+(logFilter===k[0]?"on":"")+
      '" onclick="setLogFilter(\''+k[0]+'\')">'+k[1]+'</button>').join("");
  }
  if(!list.length){
    w.innerHTML='<div class="empty">Henüz kayıt yok. Silme ve ekleme işlemleri buraya yazılır; silinenleri buradan geri alabilirsin.</div>';
    return;
  }
  w.innerHTML=list.map(x=>{
    const d=new Date(x.at);
    const when=d.toLocaleDateString("tr-TR",{day:"numeric",month:"short"})+" "+
      String(d.getHours()).padStart(2,"0")+":"+String(d.getMinutes()).padStart(2,"0");
    const renk=x.kind==="sil"?"var(--danger)":x.kind==="geri"?"var(--accent)":"var(--label-3)";
    return '<div class="dayrow"><span class="k"><b style="color:var(--label)">'+esc(x.text)+'</b><br>'+
      '<small style="color:'+renk+'">'+esc(x.dev)+' · '+when+'</small></span>'+
      '<span class="v">'+(x.data?'<button class="btn ghost tiny" onclick="logRestore('+x.id+')">Geri al</button>':"")+'</span></div>';
  }).join("");
}

/* ==================================================================
   HEDEF BÖLÜMLER
   ================================================================== */
function targets(){ if(!Array.isArray(S.targets))S.targets=[]; return S.targets; }
function addTarget(){
  const ad=(el("tgName").value||"").trim().slice(0,80);
  const sira=parseInt(el("tgRank").value,10);
  const uni=(el("tgUni").value||"").trim().slice(0,60);
  if(!ad){ toast("Bölüm adı gir"); return false; }
  if(!isFinite(sira)||sira<1){ toast("Geçerli bir sıralama gir"); return false; }
  targets().push({id:Date.now(),ad:ad,uni:uni,sira:sira});
  if(targets().length>15)S.targets=targets().slice(-15);
  save(); el("tgName").value=""; el("tgRank").value=""; el("tgUni").value="";
  renderTargets(); toast("Hedef eklendi ✓");
  return true;
}
function delTarget(id){
  const bk=clone(targets().find(t=>t.id===id));
  S.targets=targets().filter(t=>t.id!==id); save();
  if(bk)pushUndo("Hedef silindi: "+bk.ad,()=>{ targets().push(bk); });
  renderTargets();
}
function renderTargets(){
  const w=el("tgBox"); if(!w)return;
  const list=targets().slice().sort((a,b)=>a.sira-b.sira);
  if(!list.length){
    w.innerHTML='<div class="empty">Hedeflediğin bölümleri ekle. Geçen yılki taban sıralamalarını yaz; tahmini sıralaman her birine ne kadar yakın, burada görürsün.</div>';
    return;
  }
  const e=(typeof estScores==="function")?estScores():null;
  const puan=e?((e.alan!=null&&isFinite(e.alan))?e.alan:e.tyt):null;
  const r=(puan&&typeof rankEstimate==="function")?rankEstimate(puan):null;
  w.innerHTML=list.map(t=>{
    let durum='<span style="color:var(--label-3)">deneme gir</span>';
    if(r){
      if(r.best<=t.sira&&r.worst<=t.sira)durum='<span style="color:var(--success)">yetiyor</span>';
      else if(r.best<=t.sira)durum='<span style="color:var(--time)">sınırda</span>';
      else{
        const fark=r.mid-t.sira;
        durum='<span style="color:var(--danger)">'+fmtRank(fark)+' sıra uzak</span>';
      }
    }
    return '<div class="dayrow"><span class="k">'+esc(t.ad)+
      (t.uni?'<br><small>'+esc(t.uni)+'</small>':"")+'</span>'+
      '<span class="v">'+fmtRank(t.sira)+'<br><small>'+durum+'</small>'+
      ' <button class="del" onclick="delTarget('+t.id+')">sil</button></span></div>';
  }).join("")+
  (r?'<p class="hint">Tahmini sıralaman: '+fmtRank(r.best)+' – '+fmtRank(r.worst)+'. Taban sıralamalar her yıl değişir, bunu yön göstergesi olarak kullan.</p>':"");
}

/* ==================================================================
   DERS BAZLI SIRALAMA KATKISI
   "Şu dersten 5 net daha yapsam kaç bin sıra kazanırım?"
   ================================================================== */
const AYT_KATSAYI={"Matematik (AYT)":3,"Fizik (AYT)":2.85,"Kimya (AYT)":3.07,"Biyoloji (AYT)":3.07,
  "Edebiyat":3,"Tarih-1":2.8,"Coğrafya-1":3.33};
const TYT_KATSAYI={"Türkçe":1.32,"Temel Matematik":1.32,"Sosyal Bilimler":1.36,"Fen Bilimleri":1.36};
function netGain(){
  const e=(typeof estScores==="function")?estScores():null;
  if(!e||e.tytNet==null)return null;
  const puan=(e.alan!=null&&isFinite(e.alan))?e.alan:e.tyt;
  const base=(typeof rankEstimate==="function")?rankEstimate(puan):null;
  if(!base)return null;
  const rows=[];
  const ekle=(ad,kat)=>{
    const yeni=rankEstimate(puan+kat*5);
    if(!yeni)return;
    rows.push({ad:ad,kat:kat,puan:r2(kat*5),kazanc:base.mid-yeni.mid});
  };
  Object.keys(TYT_KATSAYI).forEach(k=>ekle(k+" (TYT)",TYT_KATSAYI[k]));
  if(e.aytNet!=null){
    const say=S.puanTuru!=="EA";
    const dersler=say?["Matematik (AYT)","Fizik (AYT)","Kimya (AYT)","Biyoloji (AYT)"]
                     :["Matematik (AYT)","Edebiyat","Tarih-1","Coğrafya-1"];
    dersler.forEach(k=>ekle(k,AYT_KATSAYI[k]));
  }
  rows.sort((a,b)=>b.kazanc-a.kazanc);
  return {base:base,rows:rows};
}
function renderNetGain(){
  const w=el("ngBox"); if(!w)return;
  const g=netGain();
  if(!g){ w.innerHTML='<div class="empty">Deneme girince "hangi dersten 5 net daha kaç sıra kazandırır" hesabı burada çıkar.</div>'; return; }
  let html='<p class="hint" style="margin:0 0 10px;">Her dersten <b>5 net daha</b> yapsan, orta senaryoda kaç sıra kazanırsın:</p>';
  html+=g.rows.map(r=>
    '<div class="dayrow"><span class="k">'+esc(r.ad)+'<br><small>+'+r.puan+' puan</small></span>'+
    '<span class="v" style="color:'+(r.kazanc>0?"var(--success)":"var(--label-3)")+'">'+
    (r.kazanc>0?"−"+fmtRank(r.kazanc)+" sıra":"—")+'</span></div>').join("");
  html+='<p class="hint">AYT dersleri TYT\'den daha yüksek katsayılıdır; üst sıralarda fark oradan açılır. Ama zaten iyi olduğun derste 5 net daha yapmak, hiç bilmediğin derste 5 net yapmaktan kolaydır — bunu da hesaba kat.</p>';
  w.innerHTML=html;
}

/* ==================================================================
   KİLOMETRE TAŞLARI
   ================================================================== */
const MILESTONES=[
  {id:"s100",ad:"İlk 100 soru",tur:"soru",v:100},
  {id:"s1000",ad:"1.000 soru",tur:"soru",v:1000},
  {id:"s5000",ad:"5.000 soru",tur:"soru",v:5000},
  {id:"s10000",ad:"10.000 soru",tur:"soru",v:10000},
  {id:"s25000",ad:"25.000 soru",tur:"soru",v:25000},
  {id:"h10",ad:"10 saat",tur:"saat",v:10},
  {id:"h100",ad:"100 saat",tur:"saat",v:100},
  {id:"h500",ad:"500 saat",tur:"saat",v:500},
  {id:"h1000",ad:"1.000 saat",tur:"saat",v:1000},
  {id:"d5",ad:"5 deneme",tur:"deneme",v:5},
  {id:"d25",ad:"25 deneme",tur:"deneme",v:25},
  {id:"d50",ad:"50 deneme",tur:"deneme",v:50},
  {id:"k25",ad:"Müfredatın %25'i",tur:"mufredat",v:25},
  {id:"k50",ad:"Müfredatın yarısı",tur:"mufredat",v:50},
  {id:"k100",ad:"Müfredat tamam",tur:"mufredat",v:100}
];
try{ window.MILESTONES=MILESTONES; }catch(e){}
function milestoneValues(){
  let soru=0,dk=0;
  Object.keys(S.solved).forEach(k=>{ soru+=S.solved[k]|0; });
  Object.keys(S.pomoMin).forEach(k=>{ dk+=S.pomoMin[k]|0; });
  const cs=(typeof curriculumState==="function")?curriculumState():{pct:0};
  return {soru:soru,saat:Math.floor(dk/60),
    deneme:S.denemeler.filter(d=>d.type!=="BRANS").length,mufredat:cs.pct};
}
function renderMilestones(){
  const w=el("msBox"); if(!w)return;
  const v=milestoneValues();
  const list=MILESTONES.map(m=>({m:m,olan:v[m.tur]||0,tam:(v[m.tur]||0)>=m.v}));
  const tamam=list.filter(x=>x.tam);
  const siradaki=list.filter(x=>!x.tam).sort((a,b)=>(a.m.v-a.olan)-(b.m.v-b.olan))[0];
  let html='<div class="dayrow"><span class="k">Ulaşılan</span><span class="v">'+
    tamam.length+' / '+MILESTONES.length+'</span></div>';
  if(siradaki){
    const p=Math.min(100,Math.round(siradaki.olan/siradaki.m.v*100));
    const birim=siradaki.m.tur==="saat"?" saat":siradaki.m.tur==="soru"?" soru":
                siradaki.m.tur==="deneme"?" deneme":"%";
    html+='<p class="eyebrow" style="margin:14px 0 6px;">Sıradaki</p>'+
      '<div class="ctline"><span class="k">'+esc(siradaki.m.ad)+'</span>'+
      '<span class="v">'+siradaki.olan+' / '+siradaki.m.v+(siradaki.m.tur==="mufredat"?"%":"")+'</span></div>'+
      '<div class="bar"><i style="width:'+p+'%"></i></div>';
  }
  html+='<div class="msgrid">'+list.map(x=>
    '<div class="mschip'+(x.tam?" on":"")+'">'+esc(x.m.ad)+'</div>').join("")+'</div>';
  w.innerHTML=html;
}

/* ==================================================================
   GEÇEN SENEKİ SEN
   ================================================================== */
function lastYearCompare(){
  const bugun=new Date();
  const gecen=new Date(bugun.getFullYear()-1,bugun.getMonth(),bugun.getDate());
  const gk=keyOf(gecen);
  let buSoru=0,buDk=0,gecenSoru=0,gecenDk=0;
  for(let i=0;i<30;i++){
    const a=addDaysKey(todayKey(),-i),b=addDaysKey(gk,-i);
    buSoru+=S.solved[a]|0; buDk+=S.pomoMin[a]|0;
    gecenSoru+=S.solved[b]|0; gecenDk+=S.pomoMin[b]|0;
  }
  if(!gecenSoru&&!gecenDk)return null;
  return {buSoru:buSoru,buDk:buDk,gecenSoru:gecenSoru,gecenDk:gecenDk};
}
function renderLastYear(){
  const w=el("lyBox"); if(!w)return;
  const c=lastYearCompare();
  if(!c){ w.innerHTML='<div class="empty">Geçen yılın aynı dönemine ait kayıt yok. Bir yıl veri biriktiğinde burada kendinle karşılaştırma çıkar.</div>'; return; }
  const fark=(a,b)=>{ const f=a-b; return (f>0?"+":"")+f; };
  w.innerHTML='<p class="hint" style="margin:0 0 10px;">Son 30 gün · geçen yılın aynı dönemi</p>'+
    '<div class="dayrow"><span class="k">Çalışma</span><span class="v">'+fmtHM(c.buDk)+
      ' <small style="color:'+(c.buDk>=c.gecenDk?"var(--success)":"var(--danger)")+'">('+
      fark(c.buDk,c.gecenDk)+' dk)</small></span></div>'+
    '<div class="dayrow"><span class="k">Soru</span><span class="v">'+c.buSoru+
      ' <small style="color:'+(c.buSoru>=c.gecenSoru?"var(--success)":"var(--danger)")+'">('+
      fark(c.buSoru,c.gecenSoru)+')</small></span></div>';
}

/* ==================================================================
   BAŞLATMA
   ================================================================== */
function renderRound14(){
  renderLog(); renderTargets(); renderNetGain();
  renderMilestones(); renderLastYear();
}
function boot15(){
  boot14();
  perfIdle("boot-round14",()=>renderRound14(),1150);
}
/* boot çağrısı app22 sonunda yapılır */
/* ==================================================================
   GÜN EKRANI — tablet için tam ekran görev listesi
   ================================================================== */
let gunIdx=0;
function gunTasks(){
  const now=new Date(),dw=dowOf(now),wk=keyOf(mondayOf(now)),w=getWeek(wk,false);
  const out=[];
  if(!w)return out;
  const nw=normWeek(w);
  ["r","s"].forEach(blk=>(nw[blk]||[]).forEach((row,i)=>{
    const t=row[dw];
    if(!t||!t.trim())return;
    const cid=blk+"-"+i+"-"+dw;
    out.push({cid:cid,txt:t.trim(),done:!!nw.dn[cid],
      etiket:(blk==="s"&&S.rowLabels.s[i])?S.rowLabels.s[i]:(blk==="r"?"Rutin":"")});
  }));
  return out;
}
function openGun(){
  if(typeof coachBlock==="function"&&isCoach()){ toast("Koç kipinde gün ekranı yok"); return false; }
  const ov=el("gunOverlay"); if(!ov)return false;
  const list=gunTasks();
  if(!list.length){ toast("Bugünün planı boş — önce Program'a yaz"); return false; }
  gunIdx=Math.max(0,list.findIndex(x=>!x.done));
  if(gunIdx<0)gunIdx=0;
  ov.style.display="flex";
  renderGun();
  return true;
}
function closeGun(){ const ov=el("gunOverlay"); if(ov)ov.style.display="none"; }
function gunToggle(){
  const list=gunTasks(),t=list[gunIdx];
  if(!t)return false;
  const wk=keyOf(mondayOf(new Date())),w=getWeek(wk,true);
  if(w.dn[t.cid])delete w.dn[t.cid]; else w.dn[t.cid]=1;
  save(); renderGun(); renderTodayPlan();
  if(el("program").classList.contains("active"))renderPlan();
  return !!w.dn[t.cid];
}
function gunNext(n){
  const list=gunTasks();
  if(!list.length)return;
  gunIdx=Math.max(0,Math.min(list.length-1,gunIdx+n));
  renderGun();
}
function gunDoneNext(){
  const list=gunTasks(),t=list[gunIdx];
  if(!t)return;
  const wk=keyOf(mondayOf(new Date())),w=getWeek(wk,true);
  w.dn[t.cid]=1;
  save(); renderTodayPlan();
  if(el("program").classList.contains("active"))renderPlan();
  const yeni=gunTasks();
  const sonraki=yeni.findIndex((x,i)=>i>gunIdx&&!x.done);
  if(sonraki>=0)gunIdx=sonraki;
  else{
    const kalan=yeni.findIndex(x=>!x.done);
    if(kalan>=0)gunIdx=kalan;
  }
  renderGun();
  if(!yeni.some(x=>!x.done))toast("Bugünün planı tamam 🎉");
}
function renderGun(){
  const list=gunTasks();
  const w=el("gunBody"); if(!w)return;
  if(!list.length){ closeGun(); return; }
  gunIdx=Math.max(0,Math.min(list.length-1,gunIdx));
  const t=list[gunIdx];
  const biten=list.filter(x=>x.done).length;
  const p=Math.round(biten/list.length*100);
  el("gunProg").style.width=p+"%";
  el("gunCount").textContent=biten+" / "+list.length+" tamam";
  w.innerHTML=
    (t.etiket?'<div class="gunlbl">'+esc(t.etiket)+'</div>':"")+
    '<div class="guntxt'+(t.done?" done":"")+'">'+esc(t.txt)+'</div>'+
    ((cellLink(t.txt)||cellTopic(t.txt))?'<button class="btn ghost small" onclick="cellVideo(\''+
      String(t.txt).replace(/'/g,"\\'")+'\')">▶ '+(cellLink(t.txt)?"Videoyu aç":"Konu videosu")+'</button>':"")+
    '<button class="gunbtn'+(t.done?" on":"")+'" onclick="gunToggle()">'+
      (t.done?"✓ Yapıldı":"Yaptım olarak işaretle")+'</button>';
  const dots=el("gunDots");
  if(dots)dots.innerHTML=list.map((x,i)=>
    '<i class="'+(x.done?"done ":"")+(i===gunIdx?"cur":"")+'" onclick="gunIdx='+i+';renderGun()"></i>').join("");
  el("gunPrev").disabled=gunIdx<=0;
  el("gunNext").disabled=gunIdx>=list.length-1;
}

/* ==================================================================
   TOPLU NET GİRİŞİ
   Doğru/yanlış yerine doğrudan net yazarak hızlı kayıt.
   ================================================================== */
let netMode=false;
function toggleNetMode(){
  netMode=!netMode;
  const b=el("netModeBtn");
  if(b)b.textContent=netMode?"Doğru/yanlış gir":"Doğrudan net gir";
  const box=el("netQuick"),grid=el("subjGrid");
  if(box)box.style.display=netMode?"block":"none";
  if(grid)grid.style.display=netMode?"none":"";
  if(netMode)renderNetQuick();
}
function netSubjects(){
  /* DENEME_SUBJECTS girdileri ["Ad", soruSayısı] biçiminde */
  const raw=DENEME_SUBJECTS[denemeType]||DENEME_SUBJECTS.TYT||[];
  return raw.map(x=>Array.isArray(x)?{name:x[0],cap:x[1]|0}:{name:x.name,cap:x.cap|0});
}
function renderNetQuick(){
  const w=el("netQuick"); if(!w)return;
  const subs=netSubjects();
  w.innerHTML='<p class="hint" style="margin:0 0 10px;">Her dersin netini doğrudan yaz. Yanlış sayısı bilinmediği için boş/yanlış analizi bu kayıtta çalışmaz.</p>'+
    subs.map((s,i)=>
      '<div class="row2" style="margin-bottom:6px;"><div style="flex:1"><label>'+esc(s.name)+' (max '+s.cap+')</label>'+
      '<input type="number" id="nq'+i+'" step="0.25" min="0" max="'+s.cap+'" placeholder="0" oninput="netQuickPreview()"></div></div>').join("")+
    '<p class="hint" id="nqTotal" style="margin:8px 0 0;"></p>';
  netQuickPreview();
}
function netQuickValues(){
  const subs=netSubjects();
  return subs.map((s,i)=>{
    const e=el("nq"+i);
    let v=e?parseFloat(e.value):0;
    if(!isFinite(v)||v<0)v=0;
    if(v>s.cap)v=s.cap;
    return {name:s.name,cap:s.cap,net:r2(v)};
  });
}
function netQuickPreview(){
  const vals=netQuickValues();
  const t=r2(vals.reduce((a,x)=>a+x.net,0));
  const e=el("nqTotal");
  if(e)e.textContent="Toplam net: "+t;
  return t;
}
function addDenemeByNet(){
  if(typeof coachBlock==="function"&&coachBlock("deneme kaydı"))return false;
  const vals=netQuickValues();
  const total=r2(vals.reduce((a,x)=>a+x.net,0));
  if(total<=0){ toast("Önce netlerini gir"); return false; }
  const name=(el("denemeName").value||"").trim()||(denemeType+" denemesi");
  const date=el("denemeDate").value||todayKey();
  const dur=Math.max(0,parseInt(el("denemeDur").value,10)||0);
  const pub=(el("denemePub")&&el("denemePub").value||"").trim();
  const difficulty=(el("denemeDiff")&&el("denemeDiff").value)||"normal";
  const note=((el("denemeNote")&&el("denemeNote").value)||"").trim().slice(0,240);
  const id=Date.now();
  S.denemeler.push({id:id,type:denemeType,name:name,date:date,dur:dur,pub:pub,difficulty:difficulty,note:note,
    totalNet:total,netOnly:true,
    subjectResults:vals.map(v=>({name:v.name,d:0,y:0,b:0,net:v.net,cap:v.cap}))});
  if(typeof logAdd==="function")logAdd("ekle","Deneme eklendi (net): "+name,null);
  save();
  vals.forEach((v,i)=>{ const e=el("nq"+i); if(e)e.value=""; });
  el("denemeName").value=""; el("denemeDur").value="";
  if(el("denemeNote"))el("denemeNote").value=""; if(el("denemeDiff"))el("denemeDiff").value="normal";
  netQuickPreview();
  renderDenemeHistory(); drawChart(); drawSubjChart();
  renderCompareOpts(); renderScore(); renderBlankWrong();
  if(typeof renderRank==="function")renderRank();
  if(typeof renderTargets==="function"){renderTargets();renderNetGain();}
  if(typeof renderExam2==="function")renderExam2();
  if(typeof showRefl==="function")showRefl(id);
  checkBadges(false);
  toast("Deneme kaydedildi ✓ ("+total+" net)");
  return true;
}
/* son denemeyi kopyala */
function copyLastDeneme(){
  const list=S.denemeler.filter(d=>d.type===denemeType);
  if(!list.length){ toast("Bu türde kayıtlı deneme yok"); return false; }
  const son=list[list.length-1];
  if(el("denemePub"))el("denemePub").value=son.pub||"";
  if(el("denemeDur"))el("denemeDur").value=son.dur||"";
  if(el("denemeDiff"))el("denemeDiff").value=son.difficulty||"normal";
  if(el("denemeNote"))el("denemeNote").value=son.note||"";
  el("denemeName").value=(son.name||"").replace(/\d+$/,m=>String((+m||0)+1));
  el("denemeDate").value=todayKey();
  toast("Son denemenin bilgileri dolduruldu");
  return true;
}

/* ==================================================================
   OPTİK — cevapları işaretle, netleri hesapla
   ================================================================== */
let optikSubj=0,optikAns={};
function optikSubjects(){ return netSubjects(); }
function openOptik(){
  const ov=el("optikOverlay"); if(!ov)return false;
  optikSubj=0; optikAns={};
  ov.style.display="flex";
  renderOptik();
  return true;
}
function closeOptik(){ const ov=el("optikOverlay"); if(ov)ov.style.display="none"; }
function optikKey(s,q){ return s+"-"+q; }
function setOptikSubj(i){ optikSubj=Math.max(0,i|0); renderOptik(); }
function setOptik(q,val){
  const k=optikKey(optikSubj,q);
  if(optikAns[k]===val)delete optikAns[k]; else optikAns[k]=val;
  renderOptik();
}
function optikCounts(si){
  const subs=optikSubjects(),s=subs[si];
  let d=0,y=0,b=0;
  for(let q=1;q<=s.cap;q++){
    const v=optikAns[optikKey(si,q)];
    if(v==="d")d++; else if(v==="y")y++; else b++;
  }
  return {d:d,y:y,b:b,net:r2(d-y/4)};
}
function renderOptik(){
  const subs=optikSubjects();
  const s=subs[optikSubj]; if(!s)return;
  const tabs=el("optikTabs");
  if(tabs)tabs.innerHTML=subs.map((x,i)=>{
    const c=optikCounts(i);
    return '<button class="chip '+(i===optikSubj?"on":"")+'" onclick="setOptikSubj('+i+')">'+
      esc(x.name)+' <b>'+c.net+'</b></button>';
  }).join("");
  const g=el("optikGrid");
  if(g){
    let h="";
    for(let q=1;q<=s.cap;q++){
      const v=optikAns[optikKey(optikSubj,q)];
      h+='<div class="opq"><span class="opn">'+q+'</span>'+
        '<button class="opb d'+(v==="d"?" on":"")+'" onclick="setOptik('+q+',\'d\')">D</button>'+
        '<button class="opb y'+(v==="y"?" on":"")+'" onclick="setOptik('+q+',\'y\')">Y</button></div>';
    }
    g.innerHTML=h;
  }
  const c=optikCounts(optikSubj);
  const inf=el("optikInfo");
  if(inf)inf.textContent=s.name+" · "+c.d+" doğru · "+c.y+" yanlış · "+c.b+" boş · "+c.net+" net";
  let tot=0;
  subs.forEach((x,i)=>{ tot+=optikCounts(i).net; });
  const t=el("optikTotal");
  if(t)t.textContent="Toplam "+r2(tot)+" net";
}
function optikSave(){
  if(typeof coachBlock==="function"&&coachBlock("deneme kaydı"))return false;
  const subs=optikSubjects();
  const results=subs.map((s,i)=>{
    const c=optikCounts(i);
    return {name:s.name,d:c.d,y:c.y,b:c.b,net:c.net,cap:s.cap};
  });
  const total=r2(results.reduce((a,x)=>a+x.net,0));
  if(!results.some(x=>x.d||x.y)){ toast("Hiç işaretleme yapmadın"); return false; }
  const name=(el("optikName").value||"").trim()||(denemeType+" denemesi");
  const id=Date.now();
  S.denemeler.push({id:id,type:denemeType,name:name,date:(el("denemeDate")&&el("denemeDate").value)||todayKey(),
    dur:Math.max(0,parseInt(el("optikDur").value,10)||0),
    pub:(el("denemePub")&&el("denemePub").value||"").trim(),difficulty:(el("denemeDiff")&&el("denemeDiff").value)||"normal",
    note:((el("denemeNote")&&el("denemeNote").value)||"").trim().slice(0,240),totalNet:total,subjectResults:results});
  if(typeof logAdd==="function")logAdd("ekle","Deneme eklendi (optik): "+name,null);
  save(); closeOptik();
  go("deneme");
  renderDenemeHistory(); drawChart(); drawSubjChart();
  renderCompareOpts(); renderScore(); renderBlankWrong();
  if(typeof renderRank==="function")renderRank();
  checkBadges(false);
  if(typeof openAnalysis==="function"&&openAnalysis(id)){} else if(typeof showRefl==="function")showRefl(id);
  if(typeof renderExam2==="function")renderExam2();
  toast("Optikten kaydedildi ✓ "+total+" net");
  return true;
}

/* ==================================================================
   PLAN ŞABLONLARI
   ================================================================== */
function templates(){ if(!Array.isArray(S.templates))S.templates=[]; return S.templates; }
function saveTemplate(){
  const ad=(el("tplName").value||"").trim().slice(0,40);
  if(!ad){ toast("Şablona bir ad ver"); return false; }
  const wk=keyOf(curWeek),w=S.weeks[wk];
  if(!w){ toast("Bu hafta boş"); return false; }
  const nw=normWeek(w);
  const dolu=["r","s"].some(blk=>(nw[blk]||[]).some(row=>row.some(c=>c&&c.trim())));
  if(!dolu){ toast("Bu hafta boş — önce plan yaz"); return false; }
  templates().push({id:Date.now(),ad:ad,
    r:clone(nw.r),s:clone(nw.s),labels:clone(S.rowLabels),rows:clone(S.rows)});
  if(templates().length>12)S.templates=templates().slice(-12);
  save(); el("tplName").value="";
  renderTemplates(); toast("Şablon kaydedildi ✓");
  return true;
}
function applyTemplate(id){
  const t=templates().find(x=>x.id===id); if(!t)return false;
  const wk=keyOf(curWeek);
  if(!confirm(t.ad+" şablonu bu haftaya uygulansın mı? Mevcut içerik değişecek."))return false;
  const eski=clone(S.weeks[wk]);
  const w=getWeek(wk,true);
  ["r","s"].forEach(blk=>{
    (t[blk]||[]).forEach((row,i)=>{
      if(i>=S.rows[blk])return;
      if(!w[blk][i])w[blk][i]=new Array(7).fill("");
      row.forEach((v,d)=>{ w[blk][i][d]=v||""; });
    });
  });
  if(t.labels&&t.labels.s)t.labels.s.forEach((v,i)=>{ if(i<S.rows.s)S.rowLabels.s[i]=v||""; });
  if(typeof logAdd==="function")logAdd("duzen","Şablon uygulandı: "+t.ad,{t:"week",k:wk,v:eski});
  save(); renderPlan(); renderTodayPlan();
  toast("Şablon uygulandı ✓");
  return true;
}
function delTemplate(id){
  const bk=clone(templates().find(x=>x.id===id));
  S.templates=templates().filter(x=>x.id!==id); save();
  if(bk)pushUndo("Şablon silindi: "+bk.ad,()=>{ templates().push(bk); });
  renderTemplates();
}
function renderTemplates(){
  const w=el("tplBox"); if(!w)return;
  const list=templates();
  if(!list.length){
    w.innerHTML='<div class="empty">Beğendiğin bir haftayı şablon olarak kaydet, sonraki haftalara tek dokunuşla uygula.</div>';
    return;
  }
  w.innerHTML=list.slice().reverse().map(t=>{
    let dolu=0;
    ["r","s"].forEach(blk=>(t[blk]||[]).forEach(row=>row.forEach(c=>{ if(c&&c.trim())dolu++; })));
    return '<div class="dayrow"><span class="k">'+esc(t.ad)+'<br><small>'+dolu+' dolu hücre</small></span>'+
      '<span class="v"><button class="btn ghost tiny" onclick="applyTemplate('+t.id+')">Uygula</button> '+
      '<button class="del" onclick="delTemplate('+t.id+')">sil</button></span></div>';
  }).join("");
}

/* ==================================================================
   YANLIŞ TÜRÜ
   ================================================================== */
let wrongKind="";
function setWrongKind(k){
  wrongKind=["bilmiyordum","dikkat","sure"].indexOf(k)>=0?k:"";
  ["","bilmiyordum","dikkat","sure"].forEach(x=>{
    const b=el("wk_"+x); if(b)b.classList.toggle("on",x===wrongKind);
  });
}
const WRONG_KINDS=[["bilmiyordum","Bilmiyordum"],["dikkat","Dikkatsizlik"],["sure","Süre yetmedi"]];
function wrongKindStats(days){
  const cut=addDaysKey(todayKey(),-(days||60));
  const out={bilmiyordum:0,dikkat:0,sure:0,yok:0};
  S.wrongLog.forEach(w=>{
    if(w.date<cut)return;
    const n=w.n|0||1;
    if(w.kind&&out[w.kind]!==undefined)out[w.kind]+=n; else out.yok+=n;
  });
  return out;
}
function renderWrongKinds(){
  const w=el("wkBox"); if(!w)return;
  const st=wrongKindStats(60);
  const top=st.bilmiyordum+st.dikkat+st.sure;
  if(!top&&!st.yok){ w.innerHTML='<div class="empty">Yanlış kaydı ekledikçe sebep dağılımı burada çıkar.</div>'; return; }
  if(!top){
    w.innerHTML='<div class="empty">Kayıtlarında sebep işaretlenmemiş. Yanlış eklerken sebebini seçersen, çarenin ne olduğu netleşir: bilgi eksiği konu tekrarı ister, dikkatsizlik yavaşlamayı, süre sorunu strateji değişikliğini.</div>';
    return;
  }
  const oneri={bilmiyordum:"Bilgi eksiği ağır basıyor — konu tekrarı ve temel soru çözümü gerek.",
    dikkat:"Dikkatsizlik ağır basıyor — hız değil, okuma ve kontrol alışkanlığı üzerinde çalış.",
    sure:"Süre sorunu ağır basıyor — soru seçimi ve atlama stratejisi gerek."};
  let enCok="bilmiyordum";
  if(st.dikkat>st[enCok])enCok="dikkat";
  if(st.sure>st[enCok])enCok="sure";
  w.innerHTML=WRONG_KINDS.map(k=>{
    const v=st[k[0]],p=top?Math.round(v/top*100):0;
    return '<div class="ctrow"><div class="ctline"><span class="k">'+k[1]+'</span>'+
      '<span class="v">'+v+' · %'+p+'</span></div>'+
      '<div class="bar"><i style="width:'+p+'%"></i></div></div>';
  }).join("")+
  (st.yok?'<p class="hint">'+st.yok+' kayıtta sebep belirtilmemiş.</p>':"")+
  '<p class="hint"><b>'+esc(oneri[enCok])+'</b></p>';
}

/* ==================================================================
   BAŞLATMA
   ================================================================== */
function renderRound15(){
  renderTemplates(); renderWrongKinds(); renderSegs();
}
function boot16(){
  boot15();
  perfIdle("boot-round15",()=>renderRound15(),1200);
}
/* boot çağrısı app24 sonunda yapılır */

/* ==================================================================
   SEGMENT SEÇİCİLER
   Açılır liste yerine iki düğme: mobilde çok daha rahat.
   ================================================================== */
function segPick(wrapId,prefix,val){
  const w=el(wrapId); if(!w)return;
  [...w.querySelectorAll("button")].forEach(b=>{
    b.classList.toggle("on",b.id===prefix+val);
  });
}
function setRtKind(v){
  const h=el("rtKind"); if(h)h.value=(v==="ayt")?"ayt":"tyt";
  segPick("rtKindSeg","rt_",h?h.value:"tyt");
  if(typeof renderReverse==="function")renderReverse();
}
function setCbType(v){
  const h=el("cbType"); if(h)h.value=(v==="alan")?"alan":"tyt";
  segPick("cbTypeSeg","cb_",h?h.value:"tyt");
  if(typeof renderCalib==="function")renderCalib();
}
function renderSegs(){
  const rt=el("rtKind"); if(rt)segPick("rtKindSeg","rt_",rt.value||"tyt");
  const cb=el("cbType"); if(cb)segPick("cbTypeSeg","cb_",cb.value||"tyt");
}
/* ==================================================================
   AY SONU RETROSPEKTİFİ
   ================================================================== */
let retroDate=new Date();
function shiftRetro(n){
  retroDate=new Date(retroDate.getFullYear(),retroDate.getMonth()+n,1);
  renderRetro();
}
function retroData(y,m){
  const first=new Date(y,m,1),last=new Date(y,m+1,0),gun=last.getDate();
  const pad=n=>String(n).padStart(2,"0");
  const key=d=>y+"-"+pad(m+1)+"-"+pad(d);
  let dk=0,soru=0,tam=0,aktif=0;
  const notlar=[],gunluk=[];
  for(let d=1;d<=gun;d++){
    const k=key(d);
    const m1=S.pomoMin[k]||0,q=S.solved[k]||0;
    dk+=m1; soru+=q;
    if(m1||q)aktif++;
    if(dayDone(k))tam++;
    if(S.journal[k])notlar.push({d:k,t:S.journal[k]});
    gunluk.push({d:d,dk:m1,q:q});
  }
  const ay=y+"-"+pad(m+1);
  const dnm=S.denemeler.filter(x=>String(x.date).indexOf(ay)===0&&x.type!=="BRANS")
    .sort((a,b)=>String(a.date).localeCompare(String(b.date)));
  const netler=dnm.map(x=>x.totalNet);
  /* o ay pekiştirilen konular */
  const konular=[];
  Object.keys(S.topics).forEach(k=>{
    const t=S.topics[k];
    if(t.st===3&&t.ts&&String(t.ts).indexOf(ay)===0){
      const p=k.split("|"); konular.push(p[1]+" · "+p[2]);
    }
  });
  /* o ayki yanlış sebepleri */
  const seb={bilmiyordum:0,dikkat:0,sure:0};
  S.wrongLog.forEach(w=>{
    if(String(w.date).indexOf(ay)!==0)return;
    if(seb[w.kind]!==undefined)seb[w.kind]+=(w.n|0||1);
  });
  /* önceki ay */
  const pm=new Date(y,m-1,1);
  const pAy=pm.getFullYear()+"-"+pad(pm.getMonth()+1);
  let pdk=0,psoru=0;
  Object.keys(S.pomoMin).forEach(k=>{ if(k.indexOf(pAy)===0)pdk+=S.pomoMin[k]|0; });
  Object.keys(S.solved).forEach(k=>{ if(k.indexOf(pAy)===0)psoru+=S.solved[k]|0; });
  return {y:y,m:m,gun:gun,dk:dk,soru:soru,tam:tam,aktif:aktif,notlar:notlar,gunluk:gunluk,
    dnm:dnm,netler:netler,konular:konular,seb:seb,pdk:pdk,psoru:psoru,
    ilk:netler.length?netler[0]:null,son:netler.length?netler[netler.length-1]:null};
}
function retroYorum(r){
  const y=[];
  if(!r.dk&&!r.soru)return ["Bu ayda kayıt yok."];
  if(r.aktif>=r.gun*0.8)y.push("Ayın "+r.aktif+" gününde kayıt var — düzen iyi.");
  else if(r.aktif>=r.gun*0.5)y.push("Ayın "+r.aktif+" gününde çalışmışsın. Boş günleri azaltmak en hızlı kazanç.");
  else y.push("Ayın yalnız "+r.aktif+" gününde kayıt var. Süreyi artırmadan önce düzeni kurmak gerekiyor.");
  if(r.pdk){
    const f=r.dk-r.pdk;
    if(f>60)y.push("Geçen aya göre "+fmtHM(Math.abs(f))+" daha fazla çalışmışsın.");
    else if(f<-60)y.push("Geçen aya göre "+fmtHM(Math.abs(f))+" daha az çalışmışsın.");
    else y.push("Çalışma süren geçen ayla hemen hemen aynı.");
  }
  if(r.netler.length>=2){
    const f=r2(r.son-r.ilk);
    if(f>3)y.push("Netin ay içinde "+f+" arttı.");
    else if(f<-3)y.push("Netin ay içinde "+Math.abs(f)+" düştü — sebebini yanlış defterinden aramak lazım.");
    else y.push("Netin ay boyunca sabit kaldı. Aynı yöntemin daha fazlası aynı sonucu veriyor demektir.");
  } else if(r.netler.length===1)y.push("Ayda tek deneme var; eğilim görmek için en az üç gerekir.");
  else y.push("Bu ay hiç deneme çözülmemiş — ölçmeden ilerlemek riskli.");
  if(r.konular.length)y.push(r.konular.length+" konu pekiştirildi.");
  const st=r.seb,top=st.bilmiyordum+st.dikkat+st.sure;
  if(top>=5){
    let en="bilmiyordum";
    if(st.dikkat>st[en])en="dikkat";
    if(st.sure>st[en])en="sure";
    y.push({bilmiyordum:"Yanlışların çoğu bilgi eksiğinden — konu tekrarı gerek.",
      dikkat:"Yanlışların çoğu dikkatsizlikten — yavaşlamak gerek.",
      sure:"Yanlışların çoğu süre yetmemesinden — strateji değişikliği gerek."}[en]);
  }
  return y;
}
function renderRetro(){
  const w=el("retroBox"); if(!w)return;
  const r=retroData(retroDate.getFullYear(),retroDate.getMonth());
  const lbl=el("retroMonth");
  if(lbl)lbl.textContent=MONTHS[r.m]+" "+r.y;
  if(!r.dk&&!r.soru&&!r.dnm.length){
    w.innerHTML='<div class="empty">Bu ayda kayıt yok.</div>';
    return;
  }
  const fark=(a,b)=>{ const f=a-b; return (f>0?"+":"")+f; };
  let h='<div class="dayrow"><span class="k">Çalışma</span><span class="v">'+fmtHM(r.dk)+
    (r.pdk?' <small style="color:'+(r.dk>=r.pdk?"var(--success)":"var(--danger)")+'">('+
      fark(Math.round(r.dk/60),Math.round(r.pdk/60))+' sa)</small>':"")+'</span></div>'+
    '<div class="dayrow"><span class="k">Soru</span><span class="v">'+r.soru+
    (r.psoru?' <small style="color:'+(r.soru>=r.psoru?"var(--success)":"var(--danger)")+'">('+
      fark(r.soru,r.psoru)+')</small>':"")+'</span></div>'+
    '<div class="dayrow"><span class="k">Aktif gün</span><span class="v">'+r.aktif+'/'+r.gun+'</span></div>'+
    '<div class="dayrow"><span class="k">Tamamlanan gün</span><span class="v">'+r.tam+'/'+r.gun+'</span></div>'+
    '<div class="dayrow"><span class="k">Deneme</span><span class="v">'+r.dnm.length+
    (r.netler.length?' · '+r.ilk+' → '+r.son+' net':"")+'</span></div>'+
    '<div class="dayrow"><span class="k">Pekiştirilen konu</span><span class="v">'+r.konular.length+'</span></div>';
  /* gün gün küçük çubuklar */
  const enb=Math.max(1,...r.gunluk.map(g=>g.dk));
  h+='<p class="eyebrow" style="margin:16px 0 6px;">Gün gün</p><div class="retrobars">'+
    r.gunluk.map(g=>'<i style="height:'+Math.max(2,Math.round(g.dk/enb*40))+'px" title="'+
      g.d+": "+g.dk+' dk"></i>').join("")+'</div>';
  h+='<p class="eyebrow" style="margin:16px 0 6px;">Ayın özeti</p>'+
    retroYorum(r).map(x=>'<div class="dayrow"><span class="k">'+esc(x)+'</span></div>').join("");
  if(r.konular.length){
    h+='<p class="eyebrow" style="margin:16px 0 6px;">Bitirilen konular</p>'+
      '<div class="chips">'+r.konular.slice(0,20).map(k=>'<span class="chip">'+esc(k)+'</span>').join("")+'</div>';
  }
  if(r.notlar.length){
    h+='<p class="eyebrow" style="margin:16px 0 6px;">Günlük notların</p>'+
      r.notlar.slice(-15).map(n=>'<div class="dayrow"><span class="k">'+
      parseKey(n.d).toLocaleDateString("tr-TR",{day:"numeric",month:"short"})+
      '</span><span class="v" style="font-weight:400;text-align:left;max-width:72%">'+esc(n.t)+'</span></div>').join("");
  }
  w.innerHTML=h;
}

/* ==================================================================
   DENEME ISI HARİTASI
   ================================================================== */
function heatData(){
  const list=S.denemeler.filter(d=>d.type!=="BRANS")
    .sort((a,b)=>String(a.date).localeCompare(String(b.date))).slice(-12);
  if(!list.length)return null;
  const dersler=[];
  list.forEach(d=>(d.subjectResults||[]).forEach(s=>{
    if(dersler.indexOf(s.name)<0)dersler.push(s.name);
  }));
  const satir=dersler.map(ad=>{
    const hucre=list.map(d=>{
      const s=(d.subjectResults||[]).find(x=>x.name===ad);
      if(!s)return null;
      const cap=s.cap||1;
      return {oran:Math.max(0,Math.min(1,(s.net||0)/cap)),net:s.net,cap:cap,ad:d.name,tarih:d.date};
    });
    const dolu=hucre.filter(x=>x);
    const ort=dolu.length?dolu.reduce((a,x)=>a+x.oran,0)/dolu.length:0;
    return {ad:ad,hucre:hucre,ort:ort};
  });
  satir.sort((a,b)=>a.ort-b.ort);
  return {list:list,satir:satir};
}
function heatColor(o){
  if(o===null)return "var(--fill)";
  if(o>=.8)return "color-mix(in srgb,var(--success) 78%,transparent)";
  if(o>=.65)return "color-mix(in srgb,var(--success) 48%,transparent)";
  if(o>=.5)return "color-mix(in srgb,var(--time) 45%,transparent)";
  if(o>=.35)return "color-mix(in srgb,var(--time) 70%,transparent)";
  return "color-mix(in srgb,var(--danger) 62%,transparent)";
}
function renderHeat(){
  const w=el("heatBox"); if(!w)return;
  const d=heatData();
  if(!d){ w.innerHTML='<div class="empty">En az bir deneme girince ders × deneme haritası burada çıkar. Hangi dersin hep düşük kaldığını tek bakışta görürsün.</div>'; return; }
  let h='<div class="heatwrap"><table class="heat"><thead><tr><th></th>'+
    d.list.map((x,i)=>'<th title="'+esc(x.name)+'">'+(i+1)+'</th>').join("")+'</tr></thead><tbody>';
  d.satir.forEach(r=>{
    h+='<tr><th>'+esc(r.ad)+'</th>'+r.hucre.map(c=>
      '<td style="background:'+heatColor(c?c.oran:null)+'" title="'+
      (c?esc(c.ad)+": "+c.net+"/"+c.cap:"kayıt yok")+'">'+(c?Math.round(c.oran*100):"")+'</td>').join("")+'</tr>';
  });
  h+='</tbody></table></div>';
  h+='<p class="hint">Hücreler o dersteki net oranı (%). Satırlar en zayıf dersten başlar. Sütun numaraları denemelerin sırasıdır — üstüne gelince adı çıkar.</p>';
  const zayif=d.satir[0];
  if(zayif)h+='<p class="hint"><b>En zayıf: '+esc(zayif.ad)+'</b> · ortalama %'+
    Math.round(zayif.ort*100)+'. Aynı süreyi buraya harcamak, iyi olduğun derse harcamaktan daha çok net getirir.</p>';
  w.innerHTML=h;
}

/* ==================================================================
   DENEME SONRASI ZORUNLU ANALİZ
   ================================================================== */
let anaId=null;
function needAnalysis(d){
  if(!d)return false;
  const yanlis=(d.subjectResults||[]).reduce((a,s)=>a+(s.y|0),0);
  return yanlis>=3;
}
function openAnalysis(id,force){
  const d=S.denemeler.find(x=>x.id===id);
  if(!d||(!force&&!needAnalysis(d)))return false;
  anaId=id;
  const ov=el("anaOverlay"); if(!ov)return false;
  ov.style.display="flex";
  el("anaTitle").textContent=d.name;
  const yanlis=(d.subjectResults||[]).reduce((a,s)=>a+(s.y|0),0);
  el("anaSub").textContent=yanlis?yanlis+" yanlış · en az birini konusuyla işaretle":"Yanlış sayısı kayıtlı değil · bildiğin yanlışları konu ve sebebiyle ekleyebilirsin";
  const anaRows=(d.subjectResults||[]),anaKnown=anaRows.some(s=>(s.y|0)>0);
  el("anaSubject").innerHTML='<option value="">Ders seç…</option>'+(
    (anaKnown?anaRows.filter(s=>(s.y|0)>0):force?anaRows:[])
      .map(s=>'<option value="'+esc(s.name)+'">'+esc(s.name)+(anaKnown?' ('+s.y+' yanlış)':'')+'</option>').join(""));
  el("anaTopic").value=""; el("anaCount").value=""; if(el("anaKind"))el("anaKind").value="";
  renderAnaList();
  return true;
}
function anaAdd(){
  const d=S.denemeler.find(x=>x.id===anaId); if(!d)return false;
  const subj=(el("anaSubject").value||"").trim();
  const topic=(el("anaTopic").value||"").trim();
  const n=Math.max(1,parseInt(el("anaCount").value,10)||1);
  const kind=(el("anaKind")&&el("anaKind").value)||"";
  if(!subj||!topic){ toast("Ders ve konu seç"); return false; }
  S.wrongLog.push({id:Date.now(),date:d.date,subject:subj,topic:topic,n:n,
    kind:kind||undefined,deneme:d.id});
  if(typeof linkWrongToTopic==="function")linkWrongToTopic(subj,topic,n);
  save();
  el("anaTopic").value=""; el("anaCount").value=""; if(el("anaKind"))el("anaKind").value="";
  renderAnaList(); renderWrongTopics();
  if(typeof renderWrongKinds==="function")renderWrongKinds();
  toast("Eklendi ✓");
  return true;
}
function anaDelWrong(id){
  const bk=clone(S.wrongLog.find(x=>x.id===id));
  if(!bk)return false;
  S.wrongLog=S.wrongLog.filter(x=>x.id!==id); save();
  if(bk&&typeof pushUndo==="function")pushUndo("Yanlış kaydı silindi",()=>{S.wrongLog.push(bk);save();});
  renderAnaList(); if(typeof renderWrongTopics==="function")renderWrongTopics(); if(typeof renderSubjects==="function")renderSubjects();
  return true;
}
function anaMarked(){
  return S.wrongLog.filter(w=>w.deneme===anaId).reduce((a,w)=>a+(w.n|0||1),0);
}
function renderAnaList(){
  const w=el("anaList"); if(!w)return;
  const list=S.wrongLog.filter(x=>x.deneme===anaId);
  const d=S.denemeler.find(x=>x.id===anaId);
  const toplam=d?(d.subjectResults||[]).reduce((a,s)=>a+(s.y|0),0):0;
  const isaret=anaMarked();
  const p=toplam?Math.min(100,Math.round(isaret/toplam*100)):0;
  let h='<div class="ctline"><span class="k">İşaretlenen</span><span class="v">'+isaret+' / '+toplam+'</span></div>'+
    '<div class="bar" style="margin-bottom:12px;"><i style="width:'+p+'%"></i></div>';
  h+=list.length?list.map(x=>
    '<div class="dayrow"><span class="k">'+esc(x.subject)+' · '+esc(x.topic)+
    (x.kind?'<br><small>'+({bilmiyordum:"Bilmiyordum",dikkat:"Dikkatsizlik",sure:"Süre yetmedi"}[x.kind]||"")+'</small>':"")+
    '</span><span class="v">'+x.n+' <button class="del" onclick="anaDelWrong('+x.id+')">sil</button></span></div>').join("")
    :'<div class="empty">Henüz işaretlemedin.</div>';
  w.innerHTML=h;
  const btn=el("anaClose");
  if(btn){
    const yeter=isaret>0;
    btn.disabled=!yeter;
    btn.textContent=yeter?"Bitir":"En az bir yanlış işaretle";
  }
}
function closeAnalysis(force){
  if(!force&&anaMarked()<1){ toast("En az bir yanlışı konusuyla işaretle"); return false; }
  const ov=el("anaOverlay"); if(ov)ov.style.display="none";
  const id=anaId;
  anaId=null;
  /* analiz bitince deneme sonrası ritüeli göster */
  if(id&&typeof showRefl==="function")showRefl(id);
  return true;
}
function skipAnalysis(){
  if(!confirm("Analizi atlamak istediğine emin misin? Yanlışlarını işaretlemeden neyi tekrar edeceğini bilemezsin."))return false;
  return closeAnalysis(true);
}

/* ==================================================================
   v2.7.0 — DENEME 2.0
   Tek denemeden ders çıkarma merkezi. Uzun vadeli analiz motorunu tekrar
   etmez; aynı tür denemeleri ve bu denemeye bağlı yanlış kayıtlarını kullanır.
   ================================================================== */
let v27ExamWindow=5,v27DetailId=null;
function setV27Window(n){v27ExamWindow=n===10?10:5;const a=el("v27w5"),b=el("v27w10");if(a)a.classList.toggle("on",v27ExamWindow===5);if(b)b.classList.toggle("on",v27ExamWindow===10);renderExam2();}
function v27Difficulty(x){x=["kolay","normal","zor"].includes(x)?x:"normal";return {v:x,t:x==="kolay"?"Kolay":x==="zor"?"Zor":"Normal",c:x==="kolay"?"easy":x==="zor"?"hard":"normal"};}
function v27ExamList(type){return S.denemeler.filter(d=>!type||d.type===type).slice().sort((a,b)=>String(a.date||"").localeCompare(String(b.date||""))||((a.id||0)-(b.id||0)));}
function v27PrevSame(d){const a=v27ExamList(d&&d.type);let prev=null;for(const x of a){if(x.id===d.id)return prev;prev=x;}return null;}
function v27Totals(d){const rows=(d&&d.subjectResults)||[];let dd=0,y=0,b=0,cap=0;rows.forEach(r=>{dd+=+r.d||0;y+=+r.y||0;b+=+r.b||0;cap+=+r.cap||0;});const known=dd+y+b>0&&!d.netOnly;const q=known?dd+y+b:cap;return {d:dd,y:y,b:b,q:q,cap:cap,known:known,success:known&&q?Math.round(dd/q*100):null,sec:d&&d.dur&&q?Math.round(d.dur*60/q):null};}
function v27ExamWrong(d){return S.wrongLog.filter(w=>d&&w.deneme===d.id);}
function v27FmtDate(k){try{return parseKey(k).toLocaleDateString("tr-TR",{day:"numeric",month:"short",year:"numeric"});}catch(e){return k||"—";}}
function v27TypeStats(type,n){const all=v27ExamList(type),win=Math.max(1,n||5),list=all.slice(-win),prevList=all.slice(-win*2,-win);const avg=list.length?r2(list.reduce((a,d)=>a+(+d.totalNet||0),0)/list.length):0,prevAvg=prevList.length?r2(prevList.reduce((a,d)=>a+(+d.totalNet||0),0)/prevList.length):null,avgDelta=prevAvg===null?null:r2(avg-prevAvg);const last=all[all.length-1]||null,prev=last?v27PrevSame(last):null;const cut=addDaysKey(todayKey(),-29),m30=all.filter(d=>String(d.date||"")>=cut);let gap=0;if(m30.length>1){for(let i=1;i<m30.length;i++)gap+=Math.max(0,diffKeys(m30[i-1].date,m30[i].date));gap=r2(gap/(m30.length-1));}const best=all.length?all.reduce((a,b)=>(+b.totalNet||0)>(+a.totalNet||0)?b:a):null;return {all:all,list:list,prevList:prevList,avg:avg,prevAvg:prevAvg,avgDelta:avgDelta,last:last,prev:prev,m30:m30,gap:gap,best:best};}
function v27SubjectRows(d,prev){if(!d)return[];return (d.subjectResults||[]).map(r=>{const p=prev&&(prev.subjectResults||[]).find(x=>x.name===r.name);const delta=p?r2((+r.net||0)-(+p.net||0)):null;const rate=r.cap?Math.round((+r.net||0)/(+r.cap||1)*100):null;return {name:r.name,net:r2(+r.net||0),delta:delta,y:+r.y||0,b:+r.b||0,rate:rate};});}
function v27Takeaways(d){if(!d)return[];const out=[],prev=v27PrevSame(d),tot=v27Totals(d),wr=v27ExamWrong(d);if(prev){const dif=r2((+d.totalNet||0)-(+prev.totalNet||0));out.push((dif>0?"Netin yükseldi: ":dif<0?"Netin düştü: ":"Netin değişmedi: ")+(dif>0?"+":"")+dif+" · önceki aynı tür denemeye göre.");}else out.push("Bu türde ilk kayıt; sonraki denemeyle kıyas için başlangıç noktası oldu.");
  const rows=v27SubjectRows(d,prev);const falls=rows.filter(x=>x.delta!==null).sort((a,b)=>a.delta-b.delta);if(falls.length&&falls[0].delta<0)out.push(falls[0].name+" önceki denemeye göre "+Math.abs(falls[0].delta)+" net geriledi.");else{const weak=rows.slice().sort((a,b)=>(a.rate??999)-(b.rate??999))[0];if(weak)out.push(weak.name+" bu denemede dersler içinde en düşük net oranına sahip (%"+(weak.rate??0)+").");}
  if(wr.length){const kinds={bilmiyordum:0,dikkat:0,sure:0},labels={bilmiyordum:"bilgi eksiği",dikkat:"dikkatsizlik",sure:"süre"};wr.forEach(w=>{if(w.kind&&kinds[w.kind]!==undefined)kinds[w.kind]+=w.n|0||1;});let k=Object.keys(kinds).sort((a,b)=>kinds[b]-kinds[a])[0];if(kinds[k]>0)out.push("İşaretlenen yanlışlarda en baskın sebep: "+labels[k]+" ("+kinds[k]+").");else out.push(wr.reduce((a,w)=>a+(w.n|0||1),0)+" yanlış konuya bağlandı; sebep seçtikçe çözüm yönü daha netleşir.");}
  else if(tot.known&&tot.y)out.push(tot.y+" yanlış var; konu ve sebep işaretlersen Konular risk puanı da güncellenir.");else if(tot.known&&tot.b)out.push(tot.b+" boş var; ders dağılımından hangi bölümde biriktiğini kontrol et.");else if(d.dur)out.push("Deneme "+d.dur+" dakikada tamamlandı; süre kaydı sonraki aynı tür denemelerle karşılaştırılacak.");
  return out.slice(0,3);
}
function v27BlankSignal(d){if(!d)return"";const all=v27ExamList(d.type),idx=all.findIndex(x=>x.id===d.id),upto=idx>=0?all.slice(0,idx+1):all,known=upto.map(x=>({d:x,t:v27Totals(x)})).filter(x=>x.t.known),cur=v27Totals(d);if(!cur.known)return"Boş trendi için doğru/yanlış/boş kaydı gerekli.";const worst=(d.subjectResults||[]).slice().sort((a,b)=>(+b.b||0)-(+a.b||0))[0];let text="En çok boş: "+(worst?worst.name+" "+(+worst.b||0):"—")+".";if(known.length>=6){const a=known.slice(-3),b=known.slice(-6,-3),aa=r2(a.reduce((z,x)=>z+x.t.b,0)/3),bb=r2(b.reduce((z,x)=>z+x.t.b,0)/3),df=r2(aa-bb);text+=" Son 3 denemede ortalama "+aa+" boş; önceki 3'e göre "+(df>0?"+":"")+df+".";}else if(known.length>=2){const pr=known[known.length-2].t.b,df=cur.b-pr;text+=" Önceki aynı tür denemeye göre "+(df>0?"+":"")+df+" boş.";}return text;}
function v27TimeSignal(d){if(!d||!d.dur)return"Süre kaydı yok.";const p=v27PrevSame(d),tot=v27Totals(d);if(p&&p.dur){const md=d.dur-p.dur,nd=r2((+d.totalNet||0)-(+p.totalNet||0));return (md<0?Math.abs(md)+" dk daha hızlı":md>0?md+" dk daha yavaş":"Süre aynı")+"; net "+(nd>0?"+":"")+nd+".";}return d.dur+" dk"+(tot.sec?" · yaklaşık "+tot.sec+" sn/soru":"")+"; sonraki denemede süre değişimi kıyaslanacak.";}
function v27RecordHTML(type){const a=v27ExamList(type);if(!a.length)return'<div class="empty">Kayıt yok.</div>';const best=a.reduce((x,y)=>(+y.totalNet||0)>(+x.totalNet||0)?y:x);const known=a.map(d=>({d:d,t:v27Totals(d)})).filter(x=>x.t.known);const wrong=known.length?known.reduce((x,y)=>y.t.y<x.t.y?y:x):null;const blank=known.length?known.reduce((x,y)=>y.t.b<x.t.b?y:x):null;const timed=a.filter(d=>d.dur>0);const fast=timed.length?timed.reduce((x,y)=>y.dur<x.dur?y:x):null;return `<div class="v27-center"><div class="v27-stat"><span class="k">Net rekoru</span><span class="v">${r2(best.totalNet)}</span><span class="s">${esc(best.name)}</span></div><div class="v27-stat"><span class="k">En az yanlış</span><span class="v">${wrong?wrong.t.y:"—"}</span><span class="s">${wrong?esc(wrong.d.name):"D/Y/B kaydı yok"}</span></div><div class="v27-stat"><span class="k">En az boş</span><span class="v">${blank?blank.t.b:"—"}</span><span class="s">${blank?esc(blank.d.name):"D/Y/B kaydı yok"}</span></div><div class="v27-stat"><span class="k">En kısa süre</span><span class="v">${fast?fast.dur+" dk":"—"}</span><span class="s">${fast?esc(fast.name):"Süre kaydı yok"}</span></div></div>`;}
function renderExam2(){const ov=el("v27Overview"),latest=el("v27Latest");if(!ov||!latest)return;const st=v27TypeStats(denemeType,v27ExamWindow);if(!st.all.length){ov.innerHTML='<div class="empty">'+(denemeType==="BRANS"?"Branş":denemeType)+' denemesi ekledikçe son 5/10 karşılaştırması, rekorlar ve deneme sıklığı burada çıkar.</div>';latest.innerHTML='<div class="empty">Son denemenin ders karnesi ve çıkarılacak 3 şey burada görünecek.</div>';return;}const last=st.last,pr=st.prev,delta=pr?r2(last.totalNet-pr.totalNet):null,tot=v27Totals(last),dif=v27Difficulty(last.difficulty);ov.innerHTML=`<div class="v27-center"><div class="v27-stat"><span class="k">Son net</span><span class="v">${r2(last.totalNet)}</span><span class="s">${delta===null?'ilk kayıt':(delta>0?'+':'')+delta+' öncekiye göre'}</span></div><div class="v27-stat"><span class="k">Son ${st.list.length} ort.</span><span class="v">${st.avg}</span><span class="s">${st.avgDelta===null?'karşılaştırma için veri az':(st.avgDelta>0?'+':'')+st.avgDelta+' / önceki '+st.prevList.length}</span></div><div class="v27-stat"><span class="k">Son 30 gün</span><span class="v">${st.m30.length}</span><span class="s">${st.gap?st.gap+' gün ort. ara':'sıklık için veri az'}</span></div><div class="v27-stat"><span class="k">Rekor</span><span class="v">${st.best?r2(st.best.totalNet):'—'}</span><span class="s">${st.best?esc(st.best.name):''}</span></div></div>${v27RecordHTML(denemeType)}`;
  const rows=v27SubjectRows(last,pr),takes=v27Takeaways(last),pubPeers=last.pub?st.all.filter(d=>d.id!==last.id&&d.pub===last.pub):[],pubAvg=pubPeers.length?r2(pubPeers.reduce((a,d)=>a+d.totalNet,0)/pubPeers.length):null,sameDiff=st.all.filter(d=>d.id!==last.id&&(d.difficulty||"normal")===(last.difficulty||"normal")),sameAvg=sameDiff.length?r2(sameDiff.reduce((a,d)=>a+d.totalNet,0)/sameDiff.length):null;
  latest.innerHTML=`<div class="v27-detail-head"><div><p class="eyebrow" style="margin:0 0 4px">Son ${denemeType==="BRANS"?'branş':denemeType} denemesi</p><div class="dnm" style="font-size:18px;font-weight:680">${esc(last.name)}</div><div class="meta">${v27FmtDate(last.date)}${last.dur?' · '+last.dur+' dk':''}${last.pub?' · '+esc(last.pub):''}</div><div class="v27-badges"><span class="v27-badge ${dif.c}">${dif.t}</span>${tot.success!==null?'<span class="v27-badge">%'+tot.success+' doğru</span>':''}${tot.sec?'<span class="v27-badge">~'+tot.sec+' sn/soru</span>':''}</div></div><div class="v27-detail-net">${r2(last.totalNet)}</div></div>`+
  (rows.length?'<div style="margin-top:12px">'+rows.map(x=>`<div class="v27-subj"><b>${esc(x.name)}</b><span>${x.net} net</span><span class="v27-delta ${x.delta>0?'up':x.delta<0?'down':''}">${x.delta===null?'—':(x.delta>0?'+':'')+x.delta}</span><span class="hide-sm">${x.y} Y</span><span class="hide-sm">${x.b} B</span></div>`).join('')+'</div>':'')+
  '<p class="eyebrow" style="margin:14px 0 3px">Bu denemeden çıkarılacak 3 şey</p>'+takes.map((t,i)=>`<div class="v27-take"><i>${i+1}</i><span>${esc(t)}</span></div>`).join('')+
  '<p class="eyebrow" style="margin:14px 0 3px">Boş & süre sinyali</p><p class="hint" style="margin:4px 0">'+esc(v27BlankSignal(last))+'</p><p class="hint" style="margin:4px 0 10px">'+esc(v27TimeSignal(last))+'</p>'+
  (sameAvg!==null?`<p class="hint">Aynı zorluk etiketindeki ${sameDiff.length} önceki ${denemeType==="BRANS"?'branş':denemeType} denemesinin ortalaması ${sameAvg} net.</p>`:'')+(pubAvg!==null?`<p class="hint">${esc(last.pub)} için ${pubPeers.length} önceki kaydın ortalaması ${pubAvg} net. Yayınevi farkını gelişim sanmamak için bu kıyas daha sağlıklıdır.</p>`:'')+
  `<div class="v27-actions"><button class="btn ghost tiny" onclick="openExamDetail(${last.id})">Detayı aç</button><button class="btn ghost tiny" onclick="openAnalysis(${last.id},true)">Yanlışları işle</button></div>`;
}
function openExamDetail(id){const d=S.denemeler.find(x=>x.id===id);if(!d)return false;v27DetailId=id;const ov=el("examDetailOverlay");if(!ov)return false;ov.style.display="flex";v27CancelEdit();renderExamDetail();return true;}
function closeExamDetail(){const ov=el("examDetailOverlay");if(ov)ov.style.display="none";v27DetailId=null;}
function renderExamDetail(){const d=S.denemeler.find(x=>x.id===v27DetailId);if(!d)return;const pr=v27PrevSame(d),tot=v27Totals(d),dif=v27Difficulty(d),delta=pr?r2(d.totalNet-pr.totalNet):null,wr=v27ExamWrong(d),takes=v27Takeaways(d);el("v27DetailTitle").textContent=d.name;el("v27DetailNet").textContent=r2(d.totalNet);el("v27DetailSub").textContent=(d.type==="BRANS"?"Branş":d.type)+" · "+v27FmtDate(d.date)+(d.pub?" · "+d.pub:"");let h='<div class="v27-badges"><span class="v27-badge '+dif.c+'">'+dif.t+'</span>'+(delta!==null?'<span class="v27-badge">'+(delta>0?'+':'')+delta+' net / önceki</span>':'')+(tot.success!==null?'<span class="v27-badge">%'+tot.success+' doğru</span>':'')+(tot.sec?'<span class="v27-badge">~'+tot.sec+' sn/soru</span>':'')+'</div>';if(d.note)h+='<div class="v27-note"><b>Not:</b> '+esc(d.note)+'</div>';const rows=v27SubjectRows(d,pr);if(rows.length){h+='<p class="eyebrow" style="margin:15px 0 2px">Ders karnesi</p>'+rows.map(x=>'<div class="v27-subj"><b>'+esc(x.name)+'</b><span>'+x.net+' net</span><span class="v27-delta '+(x.delta>0?'up':x.delta<0?'down':'')+'">'+(x.delta===null?'—':(x.delta>0?'+':'')+x.delta)+'</span><span class="hide-sm">'+x.y+' Y</span><span class="hide-sm">'+x.b+' B</span></div>').join('');}h+='<p class="eyebrow" style="margin:15px 0 2px">Doğru / yanlış / boş</p><div class="v27-center"><div class="v27-stat"><span class="k">Doğru</span><span class="v">'+(tot.known?tot.d:'—')+'</span></div><div class="v27-stat"><span class="k">Yanlış</span><span class="v">'+(tot.known?tot.y:'—')+'</span></div><div class="v27-stat"><span class="k">Boş</span><span class="v">'+(tot.known?tot.b:'—')+'</span></div><div class="v27-stat"><span class="k">Süre</span><span class="v">'+(d.dur?d.dur+' dk':'—')+'</span></div></div><div class="v27-note"><b>Boş:</b> '+esc(v27BlankSignal(d))+'<br><b>Süre:</b> '+esc(v27TimeSignal(d))+'</div>';h+='<p class="eyebrow" style="margin:15px 0 2px">Bu denemeden çıkarılacak 3 şey</p>'+takes.map((t,i)=>'<div class="v27-take"><i>'+(i+1)+'</i><span>'+esc(t)+'</span></div>').join('');if(wr.length){const marked=wr.reduce((a,w)=>a+(w.n|0||1),0);h+='<p class="hint">'+marked+' yanlış konuya bağlandı. Bu kayıtlar Konular 2.0 risk ve yanlış geçmişinde kullanılıyor.</p>';}if(d.refl&&(d.refl.hard||d.refl.change||d.refl.time)){h+='<div class="v27-note"><b>Deneme sonrası:</b> '+(d.refl.hard?'Zorlandığın: '+esc(d.refl.hard)+'. ':'')+(d.refl.time?'Süre: '+esc(d.refl.time)+'. ':'')+(d.refl.change?'Bir dahakine: '+esc(d.refl.change):'')+'</div>';}el("v27DetailBody").innerHTML=h;}
function v27AnalyzeCurrent(){const id=v27DetailId;if(!id)return false;closeExamDetail();return openAnalysis(id,true);}
function v27DeleteCurrent(){const id=v27DetailId;if(!id)return false;closeExamDetail();delDeneme(id);return true;}
function v27CopyExam(id){v27DetailId=id;return v27CopyToForm();}
function v27CopyToForm(){const d=S.denemeler.find(x=>x.id===v27DetailId);if(!d)return false;setDenemeType(d.type);el("denemeName").value=(d.name||"Deneme")+" kopya";el("denemeDate").value=todayKey();el("denemeDur").value=d.dur||"";el("denemePub").value=d.pub||"";if(el("denemeDiff"))el("denemeDiff").value=d.difficulty||"normal";if(el("denemeNote"))el("denemeNote").value=d.note||"";if(d.type==="BRANS"){const r=d.subjectResults&&d.subjectResults[0];if(r){if(el("brSubject")){el("brSubject").value=r.name;brSubjChanged();}if(el("brTotal"))el("brTotal").value=r.cap||30;if(el("d0"))el("d0").value=r.d||0;if(el("y0"))el("y0").value=r.y||0;if(el("b0"))el("b0").value=r.b||0;}}else if(d.netOnly){if(!netMode)toggleNetMode();renderNetQuick();(d.subjectResults||[]).forEach((r,i)=>{const e=el("nq"+i);if(e)e.value=r.net||0;});netQuickPreview();}else{if(netMode)toggleNetMode();(d.subjectResults||[]).forEach((r,i)=>{if(el("d"+i))el("d"+i).value=r.d||0;if(el("y"+i))el("y"+i).value=r.y||0;if(el("b"+i))el("b"+i).value=r.b||0;});livePreview();}closeExamDetail();go("deneme");if(typeof openV315ExamForm==="function")openV315ExamForm(true);else window.scrollTo(0,0);toast("Deneme forma kopyalandı — kaydetmeden önce düzenleyebilirsin");return true;}
function v27StartEdit(){const d=S.denemeler.find(x=>x.id===v27DetailId);if(!d)return false;el("v27DetailView").style.display="none";el("v27EditView").style.display="block";el("v27EditSub").textContent=(d.type==="BRANS"?"Branş":d.type)+" · sonuçları da düzeltebilirsin";el("v27EditName").value=d.name||"";el("v27EditDate").value=d.date||todayKey();el("v27EditDur").value=d.dur||"";el("v27EditPub").value=d.pub||"";el("v27EditDiff").value=d.difficulty||"normal";el("v27EditNote").value=d.note||"";const w=el("v27EditSubjects");if(d.netOnly){w.innerHTML='<p class="hint">Bu kayıt doğrudan net ile girildi.</p>'+(d.subjectResults||[]).map((r,i)=>'<div class="row2" style="margin-bottom:6px"><div style="flex:1"><label>'+esc(r.name)+' net</label><input type="number" step="0.25" min="0" max="'+(r.cap||999)+'" id="v27en'+i+'" value="'+r.net+'"></div></div>').join('');}else{w.innerHTML='<div class="v27-edit-grid"><div class="nm">Ders</div><small>D</small><small>Y</small><small>B</small></div>'+(d.subjectResults||[]).map((r,i)=>'<div class="v27-edit-grid"><div class="nm">'+esc(r.name)+'</div><input type="number" min="0" id="v27ed'+i+'" value="'+(r.d||0)+'"><input type="number" min="0" id="v27ey'+i+'" value="'+(r.y||0)+'"><input type="number" min="0" id="v27eb'+i+'" value="'+(r.b||0)+'"></div>').join('');}return true;}
function v27CancelEdit(){const a=el("v27DetailView"),b=el("v27EditView");if(a)a.style.display="block";if(b)b.style.display="none";}
function v27SaveEdit(){const d=S.denemeler.find(x=>x.id===v27DetailId);if(!d)return false;const name=(el("v27EditName").value||"").trim();if(!name){toast("Deneme adı boş olamaz");return false;}d.name=name.slice(0,140);d.date=el("v27EditDate").value||todayKey();d.dur=Math.max(0,parseInt(el("v27EditDur").value,10)||0);d.pub=(el("v27EditPub").value||"").trim().slice(0,100);d.difficulty=el("v27EditDiff").value||"normal";d.note=(el("v27EditNote").value||"").trim().slice(0,240);if(d.netOnly){let total=0;(d.subjectResults||[]).forEach((r,i)=>{let v=parseFloat((el("v27en"+i)||{}).value)||0;v=Math.max(0,Math.min(r.cap||999,v));r.net=r2(v);total+=r.net;});d.totalNet=r2(total);}else{let total=0;for(let i=0;i<(d.subjectResults||[]).length;i++){const r=d.subjectResults[i],dd=parseInt((el("v27ed"+i)||{}).value,10)||0,y=parseInt((el("v27ey"+i)||{}).value,10)||0,b=parseInt((el("v27eb"+i)||{}).value,10)||0;if(dd<0||y<0||b<0||dd+y+b>(r.cap||999)){toast(r.name+": D+Y+B soru sayısını aşamaz");return false;}r.d=dd;r.y=y;r.b=b;r.net=net(dd,y);total+=r.net;}d.totalNet=r2(total);}save();if(typeof logAdd==="function")logAdd("duzen","Deneme düzeltildi: "+d.name,null);renderDenemeHistory();renderExam2();drawChart();drawSubjChart();renderCompareOpts();renderScore();renderBlankWrong();if(typeof renderPublishers==="function")renderPublishers();v27CancelEdit();renderExamDetail();toast("Deneme güncellendi ✓");return true;}
function runV27SelfTest(){const out=[];try{const a={id:1,type:"TYT",date:"2026-01-01",totalNet:50,dur:100,difficulty:"zor",subjectResults:[{name:"Matematik",d:20,y:4,b:16,net:19,cap:40}]};const t=v27Totals(a);out.push(t.known&&t.d===20&&t.y===4&&t.b===16&&t.sec===150);out.push(v27Difficulty("zor").t==="Zor");out.push(Array.isArray(v27SubjectRows(a,null))&&v27SubjectRows(a,null).length===1);}catch(e){out.push(false);}return out.every(Boolean)?"YKS_V27_SELFTEST_OK":"YKS_V27_SELFTEST_FAIL";}

/* ==================================================================
   KONUYA KAYNAK BAĞLAMA
   ================================================================== */
function topicRes(){ if(!S.topicRes||typeof S.topicRes!=="object")S.topicRes={}; return S.topicRes; }
function resList(key){ const m=topicRes(); return Array.isArray(m[key])?m[key]:[]; }
function addRes(key,tur,ad,deger){
  const m=topicRes();
  if(!Array.isArray(m[key]))m[key]=[];
  m[key].push({id:Date.now(),tur:tur,ad:String(ad||"").slice(0,80),deger:String(deger||"").slice(0,300)});
  if(m[key].length>12)m[key]=m[key].slice(-12);
  save();
}
function delRes(key,id){
  const m=topicRes();
  if(!Array.isArray(m[key]))return;
  const bk=clone(m[key].find(x=>x.id===id));
  m[key]=m[key].filter(x=>x.id!==id);
  if(!m[key].length)delete m[key];
  save();
  if(bk)pushUndo("Kaynak silindi: "+bk.ad,()=>{ addResRaw(key,bk); });
  renderResPanel();
}
function addResRaw(key,obj){
  const m=topicRes();
  if(!Array.isArray(m[key]))m[key]=[];
  m[key].push(obj); save();
}
let resKey="";
function openRes(subj,topic){
  const key=topicKeyOf(subj,topic);
  if(!key){ toast("Bu konu bulunamadı"); return false; }
  resKey=key;
  const ov=el("resOverlay"); if(!ov)return false;
  ov.style.display="flex";
  el("resTitle").textContent=subj+" · "+topic;
  el("resAd").value=""; el("resDeger").value="";
  renderResPanel();
  return true;
}
function closeRes(){ const ov=el("resOverlay"); if(ov)ov.style.display="none"; }
function saveRes(){
  const tur=(el("resTur")&&el("resTur").value)||"not";
  const ad=(el("resAd").value||"").trim();
  const deger=(el("resDeger").value||"").trim();
  if(!ad){ toast("Bir ad yaz"); return false; }
  if(tur==="video"&&deger&&!/^https?:\/\//.test(deger)){ toast("Video için https:// ile başlayan adres gir"); return false; }
  addRes(resKey,tur,ad,deger);
  el("resAd").value=""; el("resDeger").value="";
  renderResPanel(); renderSubjects();
  toast("Kaynak eklendi ✓");
  return true;
}
function openResItem(key,id){
  const r=resList(key).find(x=>x.id===id); if(!r)return false;
  if(r.tur==="video"&&r.deger){
    if(typeof openVideos==="function"&&!/^https?:\/\//.test(r.deger))return false;
    openExternalUrl(r.deger);
    return true;
  }
  if(r.tur==="video"&&!r.deger&&typeof openVideos==="function"){
    const p=key.split("|");
    /* hoca bağlıysa aramayı o hocanın kanalıyla sınırla */
    if(r.hoca)return openVideos((p[2]+" konu anlatımı").trim(),r.hoca+" · "+p[2],
      {teacher:r.hoca,subject:p[1],topic:p[2]});
    return openVideos(p[1]+" "+p[2]+" konu anlatımı YKS",p[1]+" · "+p[2],{subject:p[1],topic:p[2]});
  }
  toast(r.deger||r.ad);
  return true;
}
function renderResPanel(){
  const w=el("resList"); if(!w)return;
  const list=resList(resKey);
  const ikon={video:"▶",kitap:"📕",not:"✎",link:"🔗"};
  if(!list.length){
    w.innerHTML='<div class="empty">Bu konuya henüz kaynak bağlamadın. Video, kitap sayfası ya da kendi notunu ekle; tekrar zamanı geldiğinde hepsi burada olur.</div>';
    return;
  }
  w.innerHTML=list.map(r=>
    '<div class="dayrow" style="cursor:pointer" onclick="openResItem(\''+resKey.replace(/'/g,"\\'")+'\','+r.id+')">'+
    '<span class="k">'+(ikon[r.tur]||"•")+' '+esc(r.ad)+(r.hoca?' <small style="color:var(--accent)">hoca</small>':"")+
    (r.deger?'<br><small>'+esc(r.deger.slice(0,60))+'</small>':"")+'</span>'+
    '<span class="v"><button class="del" onclick="event.stopPropagation();delRes(\''+
      resKey.replace(/'/g,"\\'")+'\','+r.id+')">sil</button></span></div>').join("");
}
function resCount(key){ return resList(key).length; }

/* ==================================================================
   BAŞLATMA
   ================================================================== */
function renderRound16(){
  renderRetro(); renderHeat();
}
function boot17(){
  boot16();
  perfIdle("boot-round16",()=>renderRound16(),1250);
}
/* boot çağrısı app25 sonunda yapılır */
/* ==================================================================
   KAMP PROGRAMLARI
   Konular uygulamanın kendi müfredatından alınır; plana yazılan
   metin konu takibindeki adla birebir aynı olur.
   ================================================================== */

/* Her kampta derslerin haftalık ağırlığı: haftada kaç oturum ayrılacağı.
   Ağırlık, o dersin sınavdaki soru sayısına göre belirlendi. */
const CAMPS={
  tyt8:{ad:"TYT Hızlı Kamp",hafta:8,tur:"TYT",
    aciklama:"Sekiz haftada TYT müfredatının tamamı. Yoğun tempo — günde 5-6 saat ayırabiliyorsan uygundur.",
    agirlik:{"Türkçe":5,"Matematik":6,"Geometri":2,"Fizik":2,"Kimya":2,"Biyoloji":2,
             "Tarih":1,"Coğrafya":1,"Felsefe":1,"Din Kültürü":1}},
  tyt12:{ad:"TYT Kamp",hafta:12,tur:"TYT",
    aciklama:"On iki haftada TYT. Daha rahat tempo, konu başına daha çok zaman.",
    agirlik:{"Türkçe":4,"Matematik":5,"Geometri":2,"Fizik":2,"Kimya":2,"Biyoloji":2,
             "Tarih":1,"Coğrafya":1,"Felsefe":1,"Din Kültürü":1}},
  ayt8:{ad:"AYT Hızlı Kamp",hafta:8,tur:"AYT",
    aciklama:"Sekiz haftada AYT sayısal müfredatı. TYT'si oturmuş olanlar için.",
    agirlik:{"Matematik (AYT)":6,"Geometri (AYT)":2,"Fizik (AYT)":4,"Kimya (AYT)":4,"Biyoloji (AYT)":4}},
  ayt12:{ad:"AYT Kamp",hafta:12,tur:"AYT",
    aciklama:"On iki haftada AYT sayısal. Konu başına daha çok soru çözme payı bırakır.",
    agirlik:{"Matematik (AYT)":5,"Geometri (AYT)":2,"Fizik (AYT)":3,"Kimya (AYT)":3,"Biyoloji (AYT)":3}},
  ayt8ea:{ad:"AYT Hızlı Kamp · EA",hafta:8,tur:"AYT",
    aciklama:"Sekiz haftada AYT eşit ağırlık müfredatı.",
    agirlik:{"Matematik (AYT)":6,"Geometri (AYT)":2,"Edebiyat":5,"Tarih (AYT)":3,"Coğrafya (AYT)":3}},
  karma12:{ad:"TYT + AYT Karma",hafta:12,tur:"KARMA",
    aciklama:"On iki haftada ikisi birlikte. TYT'de eksiği olan ama AYT'ye de başlaması gereken için.",
    agirlik:{"Türkçe":3,"Matematik":3,"Matematik (AYT)":3,"Fizik":1,"Fizik (AYT)":2,
             "Kimya":1,"Kimya (AYT)":2,"Biyoloji":1,"Biyoloji (AYT)":2,"Geometri":1}}
};

try{ window.CAMPS=CAMPS; }catch(e){}
function campSubjectTopics(ad){
  const s=ALL_SUBJECTS.find(x=>x.name===ad);
  return s?s.topics.slice():[];
}
/* dersin konularını hafta sayısına böl: her hafta o dersten kaç konu */
function spread(konular,hafta,oturum){
  const toplam=hafta*oturum;
  const out=[];
  for(let i=0;i<toplam;i++){
    const idx=Math.floor(i*konular.length/toplam);
    out.push(konular[Math.min(konular.length-1,idx)]);
  }
  return out;
}
/* kampı hafta × gün ızgarasına çevir */
function campPlan(id){
  const c=CAMPS[id];
  if(!c)return null;
  const dersler=Object.keys(c.agirlik);
  /* her ders için hafta hafta konu sırası */
  const sira={};
  dersler.forEach(d=>{
    const k=campSubjectTopics(d);
    sira[d]=k.length?spread(k,c.hafta,c.agirlik[d]):[];
  });
  const haftalar=[];
  const sayac={};
  dersler.forEach(d=>{ sayac[d]=0; });
  for(let h=0;h<c.hafta;h++){
    /* bu haftanın oturumları */
    const oturumlar=[];
    dersler.forEach(d=>{
      for(let i=0;i<c.agirlik[d];i++){
        const konu=sira[d][sayac[d]++];
        if(konu)oturumlar.push(d+" · "+konu);
      }
    });
    /* 6 çalışma günü + 1 dinlenme; son çalışma günü deneme */
    const gunler=[[],[],[],[],[],[],[]];
    let g=0;
    oturumlar.forEach(o=>{
      while(gunler[g%6].length>=Math.ceil(oturumlar.length/6))g++;
      gunler[g%6].push(o);
      g++;
    });
    gunler[5].push("Deneme çöz + analiz");
    gunler[6].push("Dinlenme / hafif tekrar");
    haftalar.push(gunler);
  }
  return {c:c,haftalar:haftalar};
}
function campRowsNeeded(p){
  let en=0;
  p.haftalar.forEach(h=>h.forEach(g=>{ if(g.length>en)en=g.length; }));
  return en;
}

/* ---------- hoca eşlemesi ----------
   Kamptaki her ders için bir hoca seçilebilir. Uygulanınca o dersin
   konularına hocanın videosu kaynak olarak bağlanır; plan hücresine
   dokunduğunda doğrudan o hocanın anlatımına gidersin. */
let campHoca={};
function campTeachersFor(ders){
  const hepsi=(typeof allTeachers==="function")?allTeachers():[];
  /* AYT dersleri hoca listesinde TYT adıyla geçiyor olabilir */
  const sade=ders.replace(/\s*\(AYT\)$/,"");
  return hepsi.filter(t=>(t.d||[]).some(x=>x===ders||x===sade));
}
function setCampHoca(ders,ad){
  if(ad)campHoca[ders]=ad; else delete campHoca[ders];
  renderCamps();
}
function campHocaCount(){ return Object.keys(campHoca).length; }
function clearCampHoca(){ campHoca={}; renderCamps(); }

/* ---------- uygulama ---------- */
let campSel="";
function setCamp(id){
  const yeni=CAMPS[id]?id:"";
  if(yeni!==campSel)campHoca={};
  campSel=yeni;
  renderCamps();
}
function applyCamp(){
  if(!campSel){ toast("Önce bir kamp seç"); return false; }
  const p=campPlan(campSel);
  if(!p)return false;
  const gerek=campRowsNeeded(p);
  const bas=keyOf(curWeek);
  const kacHafta=p.haftalar.length;
  if(!confirm(p.c.ad+" ("+kacHafta+" hafta) bu haftadan itibaren uygulansın mı?\n\n"+
     kacHafta+" haftanın ders programı bloğu değişecek. Rutinlerin ve işaretlerin korunur."))return false;
  /* satır sayısını yeterli hale getir */
  const eskiRows=clone(S.rows),eskiLabels=clone(S.rowLabels);
  while(S.rows.s<Math.min(20,gerek)){
    S.rows.s++; S.rowLabels.s.push("");
    Object.keys(S.weeks).forEach(k=>{
      const w=S.weeks[k]; if(w&&Array.isArray(w.s))w.s.push(new Array(7).fill(""));
    });
  }
  const yedek={};
  const resYedek=clone(S.topicRes||{});   /* kaynaklar eklenmeden önceki hal */
  p.haftalar.forEach((gunler,i)=>{
    const wk=addDaysKey(bas,i*7);
    yedek[wk]=clone(S.weeks[wk])||null;
    const w=getWeek(wk,true);
    for(let r=0;r<S.rows.s;r++){
      if(!w.s[r])w.s[r]=new Array(7).fill("");
      for(let d=0;d<7;d++)w.s[r][d]=gunler[d][r]||"";
    }
  });
  if(typeof logAdd==="function")
    logAdd("duzen","Kamp uygulandı: "+p.c.ad,{t:"camp",bas:bas,v:yedek,rows:eskiRows,labels:eskiLabels});
  /* seçilen hocaları konulara kaynak olarak bağla */
  let baglanan=0;
  if(campHocaCount()){
    const gorulen={};
    p.haftalar.forEach(gunler=>gunler.forEach(g=>g.forEach(o=>{
      const ay=o.split(" · ");
      if(ay.length!==2)return;
      const ders=ay[0],konu=ay[1],hoca=campHoca[ders];
      if(!hoca)return;
      const key=(typeof topicKeyOf==="function")?topicKeyOf(ders,konu):"";
      if(!key||gorulen[key])return;
      gorulen[key]=1;
      /* aynı hoca zaten bağlıysa tekrar ekleme */
      const mevcut=(typeof resList==="function")?resList(key):[];
      if(mevcut.some(r=>r.tur==="video"&&r.hoca===hoca))return;
      if(typeof addRes==="function"){
        addRes(key,"video",hoca,"");
        const l=resList(key);
        if(l.length)l[l.length-1].hoca=hoca;
        baglanan++;
      }
    })));
  }
  S.camp={id:campSel,bas:bas,hafta:kacHafta,at:Date.now(),hoca:clone(campHoca)};
  save();
  pushUndo("Kamp uygulandı: "+p.c.ad,()=>{
    Object.keys(yedek).forEach(k=>{ if(yedek[k])S.weeks[k]=yedek[k]; else delete S.weeks[k]; });
    S.rows=eskiRows; S.rowLabels=eskiLabels; S.camp=null;
    S.topicRes=resYedek;
  });
  renderPlan(); renderTodayPlan(); renderCamps();
  if(typeof renderSubjects==="function")renderSubjects();
  toast(p.c.ad+" uygulandı ✓"+(baglanan?" · "+baglanan+" konuya hoca bağlandı":""));
  return true;
}
function clearCamp(){
  if(!S.camp)return false;
  if(!confirm("Kamp takibi bırakılsın mı? Plana yazılanlar silinmez."))return false;
  S.camp=null; save(); renderCamps();
  toast("Kamp takibi bırakıldı");
  return true;
}
function campProgress(){
  if(!S.camp)return null;
  const c=CAMPS[S.camp.id];
  if(!c)return null;
  const bugun=todayKey();
  const gecen=Math.floor((parseKey(bugun)-parseKey(S.camp.bas))/86400000/7);
  const hafta=Math.max(0,Math.min(S.camp.hafta,gecen+1));
  /* uygulanan haftalardaki ✓ oranı */
  let dolu=0,tik=0;
  for(let i=0;i<S.camp.hafta;i++){
    const wk=addDaysKey(S.camp.bas,i*7);
    const w=S.weeks[wk];
    if(!w)continue;
    const nw=normWeek(w);
    (nw.s||[]).forEach((row,r)=>row.forEach((v,d)=>{
      if(v&&v.trim()){ dolu++; if(nw.dn["s-"+r+"-"+d])tik++; }
    }));
  }
  return {c:c,hafta:hafta,toplam:S.camp.hafta,dolu:dolu,tik:tik,
    oran:dolu?Math.round(tik/dolu*100):0,
    bitti:gecen>=S.camp.hafta};
}
function renderCamps(){
  const w=el("campBox"); if(!w)return;
  /* seçim çipleri */
  const chips=el("campChips");
  if(chips)chips.innerHTML=Object.keys(CAMPS).map(id=>
    '<button class="chip '+(campSel===id?"on":"")+'" onclick="setCamp(\''+id+'\')">'+
    esc(CAMPS[id].ad)+' · '+CAMPS[id].hafta+' hf</button>').join("");
  /* devam eden kamp */
  const pr=campProgress();
  const durum=el("campDurum");
  if(durum){
    if(!pr){ durum.style.display="none"; }
    else{
      durum.style.display="block";
      const hocaList=(S.camp&&S.camp.hoca)?Object.keys(S.camp.hoca):[];
      durum.innerHTML='<div class="ctline"><span class="k">'+esc(pr.c.ad)+'</span>'+
        '<span class="v">'+(pr.bitti?"tamamlandı":pr.hafta+". hafta / "+pr.toplam)+'</span></div>'+
        '<div class="bar"><i style="width:'+Math.round(pr.hafta/pr.toplam*100)+'%"></i></div>'+
        '<p class="hint" style="margin:8px 0 0;">Plan sadakati: %'+pr.oran+' ('+pr.tik+'/'+pr.dolu+' hücre)</p>'+
        (hocaList.length?'<p class="hint" style="margin:4px 0 0;">Hocalar: '+
          hocaList.map(k=>esc(S.camp.hoca[k])).filter((v,i,a)=>a.indexOf(v)===i).join(", ")+'</p>':"")+
        '<button class="btn ghost tiny" style="width:100%;margin-top:8px;" onclick="clearCamp()">Takibi bırak</button>';
    }
  }
  if(!campSel){
    w.innerHTML='<div class="empty">Bir kamp seç; kaç hafta sürdüğünü, hangi derse kaç oturum ayırdığını ve ilk haftanın programını burada görürsün. Uygulamadan önce önizleyebilirsin.</div>';
    return;
  }
  const p=campPlan(campSel);
  const c=p.c;
  const gunAd=["Pzt","Sal","Çar","Per","Cum","Cmt","Paz"];
  let h='<p class="lead" style="font-size:14.5px;margin:0 0 12px;">'+esc(c.aciklama)+'</p>';
  h+='<div class="dayrow"><span class="k">Süre</span><span class="v">'+c.hafta+' hafta</span></div>'+
     '<div class="dayrow"><span class="k">Haftalık oturum</span><span class="v">'+
       Object.keys(c.agirlik).reduce((a,k)=>a+c.agirlik[k],0)+'</span></div>'+
     '<div class="dayrow"><span class="k">Gereken satır</span><span class="v">'+campRowsNeeded(p)+'</span></div>';
  h+='<p class="eyebrow" style="margin:14px 0 6px;">Ders ağırlıkları ve hocalar</p>';
  h+='<p class="hint" style="margin:0 0 10px;">İstersen her derse bir hoca seç. Kamp uygulanınca o dersin konularına hocanın anlatımı kaynak olarak bağlanır — konuya dokunduğunda doğrudan videosuna gidersin.</p>';
  const esc3=v=>String(v).replace(/'/g,"\\'");
  h+=Object.keys(c.agirlik).map(k=>{
    const hocalar=campTeachersFor(k);
    const secili=campHoca[k]||"";
    const sec=hocalar.length
      ? '<select onchange="setCampHoca(\''+esc3(k)+'\',this.value)">'+
        '<option value="">Hoca seçme</option>'+
        hocalar.map(t=>'<option value="'+esc(t.a)+'"'+(secili===t.a?" selected":"")+'>'+esc(t.a)+'</option>').join("")+
        '</select>'
      : '<span style="color:var(--label-3);font-size:12px">hoca yok</span>';
    return '<div class="camprow"><span class="cn">'+esc(k)+' <b>×'+c.agirlik[k]+'</b></span>'+
      '<span class="ch">'+sec+'</span></div>';
  }).join("");
  if(campHocaCount())h+='<button class="btn ghost tiny" style="width:100%;margin-top:8px;" onclick="clearCampHoca()">Hoca seçimlerini temizle</button>';
  h+='<p class="eyebrow" style="margin:14px 0 6px;">1. hafta önizleme</p>';
  h+=p.haftalar[0].map((g,d)=>
    '<div class="dayrow"><span class="k">'+gunAd[d]+'</span><span class="v" style="font-weight:400;text-align:left;max-width:74%">'+
    (g.length?g.map(esc).join("<br>"):"—")+'</span></div>').join("");
  h+='<button class="btn green small" style="width:100%;margin-top:14px;" onclick="applyCamp()">Bu haftadan itibaren uygula</button>';
  h+='<p class="hint">Uygulanınca ders programı bloğu '+c.hafta+' hafta boyunca doldurulur; rutin satırların ve mevcut ✓ işaretlerin korunur. İstersen geri alabilirsin.</p>';
  w.innerHTML=h;
}

/* ==================================================================
   BAŞLATMA
   ================================================================== */
function boot18(){
  boot17();
  perfIdle("boot-camps",()=>renderCamps(),1300);
}
/* boot çağrısı yeni modülün sonunda */
/* ==================================================================
   1) OTOMATİK YEREL YEDEK
   Her gün sessizce bir kopya; son 7 gün saklanır. Elle yedek almayı
   unutsan bile bir gün öncesine dönebilirsin.
   ================================================================== */
const AUTO_BACKUP_KEY="yks_yedek";
const AUTO_BACKUP_GUN=7;

function autoBackups(){
  try{
    const raw=localStorage.getItem(AUTO_BACKUP_KEY);
    if(!raw)return [];
    const a=JSON.parse(raw);
    return Array.isArray(a)?a:[];
  }catch(e){ return []; }
}
function autoBackupWrite(list){
  try{ localStorage.setItem(AUTO_BACKUP_KEY,JSON.stringify(list)); return true; }
  catch(e){
    /* yer dolduysa en eskiyi at, bir daha dene */
    if(list.length>1){
      try{ localStorage.setItem(AUTO_BACKUP_KEY,JSON.stringify(list.slice(1))); return true; }
      catch(e2){}
    }
    return false;
  }
}
function autoBackupRun(zorla){
  const bugun=todayKey();
  const list=autoBackups();
  if(!zorla&&list.some(b=>b.gun===bugun))return false;
  let veri;
  try{
    const kopya=clone(S);
    /* Fotoğraflar aynı tarayıcıda yedi kez çoğalıp kotayı doldurmasın. */
    delete kopya.qbank;
    if(kopya.yt)kopya.yt.key="";
    veri=JSON.stringify(kopya);
  }catch(e){ return false; }
  const yeni=list.filter(b=>b.gun!==bugun);
  yeni.push({gun:bugun,at:Date.now(),boyut:veri.length,version:APP_VERSION,schema:DATA_SCHEMA,hash:infraHash(veri),veri:veri});
  while(yeni.length>AUTO_BACKUP_GUN)yeni.shift();
  const ok=autoBackupWrite(yeni);
  if(ok&&typeof renderAutoBackup==="function")renderAutoBackup();
  return ok;
}
function autoBackupRestore(gun){
  const b=autoBackups().find(x=>x.gun===gun);
  if(!b){ toast("Bu güne ait yedek yok"); return false; }
  const t=parseKey(b.gun).toLocaleDateString("tr-TR",{day:"numeric",month:"long"});
  if(!confirm(t+" tarihli yedeğe dönülsün mü?\n\nŞu anki veriler bu yedekle değişecek. "+
    "Emin değilsen önce JSON yedek al."))return false;
  let o;
  try{
    if(b.hash&&b.hash!==infraHash(b.veri))throw new Error("checksum");
    o=JSON.parse(b.veri);
  }catch(e){ toast("Yedek bütünlük kontrolünü geçemedi"); return false; }
  /* geri dönmeden önce bugünkü hali de sakla */
  autoBackupRun(true);
  o.qbank=clone(S.qbank); /* otomatik yedek fotoğraf arşivini değiştirmez */
  S=normalize(o);
  save(); renderAll();
  toast(t+" yedeğine dönüldü ✓");
  return true;
}
function autoBackupNow(){
  const ok=autoBackupRun(true);
  if(ok){ renderAutoBackup(); toast("Güvenlik yedeği alındı ✓"); }
  else toast("Güvenlik yedeği alınamadı — depolama alanını kontrol et");
  return ok;
}
function autoBackupClear(){
  if(!confirm("Otomatik yedekler silinsin mi?"))return false;
  try{ localStorage.removeItem(AUTO_BACKUP_KEY); }catch(e){}
  renderAutoBackup();
  toast("Otomatik yedekler silindi");
  return true;
}
function lastManualBackup(){ return S.lastExport||0; }
function backupNagDays(){
  const t=lastManualBackup();
  if(!t)return 999;
  return Math.floor((Date.now()-t)/86400000);
}
function renderAutoBackup(){
  const w=el("abBox"); if(!w)return;
  const list=autoBackups().slice().reverse();
  const gun=backupNagDays();
  let h="";
  if(gun>=30){
    h+='<div class="dayrow"><span class="k" style="color:var(--danger)">'+
      (gun>900?"Hiç elle yedek almadın.":gun+" gündür elle yedek almadın.")+
      ' Tarayıcı verilerini temizlersen her şey gider.</span></div>';
  }
  h+='<button class="btn ghost tiny" style="width:100%;margin-bottom:10px;" onclick="autoBackupNow()">Şimdi güvenlik yedeği al</button>';
  if(!list.length){
    h+='<div class="empty">Otomatik yedek henüz alınmadı. Uygulama her açılışta günde bir kez kendiliğinden güvenlik kopyası oluşturur.</div>';
    w.innerHTML=h; return;
  }
  h+=list.map(b=>{
    const d=parseKey(b.gun);
    const ad=d.toLocaleDateString("tr-TR",{day:"numeric",month:"short"});
    const kb=Math.round(b.boyut/1024);
    return '<div class="dayrow"><span class="k">'+ad+'<br><small>'+kb+' KB</small></span>'+
      '<span class="v"><button class="btn ghost tiny" onclick="autoBackupRestore(\''+b.gun+'\')">Bu güne dön</button></span></div>';
  }).join("");
  h+='<p class="hint"><b>'+list.length+' güvenlik kopyası var.</b> Son '+AUTO_BACKUP_GUN+' günün fotoğraflar hariç kopyası bu tarayıcıda saklanır. '+
     'Yedek geri yükleme, tüm verileri sıfırlama ve buluttan veri alma öncesinde de mevcut durum korunur. Tarayıcı verilerini temizlersen bunlar da gider — bağımsız güvence JSON yedeğidir.</p>'+
     '<button class="btn ghost tiny" style="width:100%;margin-top:8px;" onclick="autoBackupClear()">Otomatik yedekleri sil</button>';
  w.innerHTML=h;
}

/* ==================================================================
   2) SABAH BRİFİNGİ
   Günün ilk açılışında tek ekran: bugün ne var, ne tekrar edilecek.
   ================================================================== */
function briefData(){
  const T=todayKey(),dw=dowOf(new Date());
  const wk=keyOf(mondayOf(new Date())),w=S.weeks[wk];
  const gorevler=[];
  if(w){
    const nw=normWeek(w);
    ["r","s"].forEach(blk=>(nw[blk]||[]).forEach((row,i)=>{
      const t=row[dw];
      if(t&&t.trim())gorevler.push({txt:t.trim(),done:!!nw.dn[blk+"-"+i+"-"+dw]});
    }));
  }
  const rq=(typeof reviewQueue==="function")?reviewQueue():[];
  const dun=addDaysKey(T,-1);
  const gun=daysUntil(S.examDate);
  const ct=(typeof contractFor==="function")?contractFor(wk):null;
  /* bu haftanın gidişatı */
  let hDk=0,hSoru=0;
  for(let i=0;i<7;i++){
    const k=addDaysKey(wk,i);
    if(k>T)break;
    hDk+=S.pomoMin[k]|0; hSoru+=S.solved[k]|0;
  }
  return {gorevler:gorevler,tekrar:rq.slice(0,4),dunNot:S.journal[dun]||"",
    sinavaGun:gun,soz:ct,haftaDk:hDk,haftaSoru:hSoru,
    dunDk:S.pomoMin[dun]|0,dunSoru:S.solved[dun]|0};
}
function briefSeen(){ return S.briefDay===todayKey(); }
function openBrief(force){
  if(typeof isCoach==="function"&&isCoach())return false;
  if(!force&&briefSeen())return false;
  const b=briefData();
  if(!force&&!b.gorevler.length&&!b.tekrar.length&&!b.dunNot)return false;
  const ov=el("briefOverlay"); if(!ov)return false;
  ov.style.display="flex";
  renderBrief(b);
  S.briefDay=todayKey(); save();
  return true;
}
function closeBrief(){ const ov=el("briefOverlay"); if(ov)ov.style.display="none"; }
function briefGoPlan(){ closeBrief(); go("program"); }
function briefGoGun(){ closeBrief(); if(typeof openGun==="function")openGun(); }
function renderBrief(b){
  const w=el("briefBody"); if(!w)return;
  b=b||briefData();
  const d=new Date();
  const gunAd=["Pazar","Pazartesi","Salı","Çarşamba","Perşembe","Cuma","Cumartesi"][d.getDay()];
  const tarih=d.toLocaleDateString("tr-TR",{day:"numeric",month:"long"});
  let h='<div class="bfhead"><b>'+gunAd+'</b><span>'+tarih+
    (b.sinavaGun>0?' · sınava '+b.sinavaGun+' gün':"")+'</span></div>';

  if(b.dunDk||b.dunSoru){
    h+='<div class="bfsec"><p class="eyebrow">Dün</p><div class="dayrow"><span class="k">'+
      fmtHM(b.dunDk)+' · '+b.dunSoru+' soru</span></div>';
    if(b.dunNot)h+='<div class="dayrow"><span class="k" style="font-weight:400">'+esc(b.dunNot)+'</span></div>';
    h+='</div>';
  }

  h+='<div class="bfsec"><p class="eyebrow">Bugünün planı</p>';
  if(!b.gorevler.length){
    h+='<div class="empty">Bugün için plan yazmamışsın.</div>';
  }else{
    const kalan=b.gorevler.filter(x=>!x.done);
    h+=b.gorevler.slice(0,7).map(g=>
      '<div class="dayrow"><span class="k'+(g.done?" done":"")+'">'+
      (g.done?"✓ ":"• ")+esc(g.txt.length>54?g.txt.slice(0,54)+"…":g.txt)+'</span></div>').join("");
    if(b.gorevler.length>7)h+='<p class="hint">ve '+(b.gorevler.length-7)+' tane daha</p>';
    if(kalan.length)h+='<p class="hint">'+kalan.length+' iş bekliyor.</p>';
    else h+='<p class="hint" style="color:var(--success)">Bugünün planı tamam.</p>';
  }
  h+='</div>';

  if(b.tekrar.length){
    h+='<div class="bfsec"><p class="eyebrow">Tekrar zamanı</p>'+
      b.tekrar.map(t=>'<div class="dayrow"><span class="k">'+esc(t.subject+" · "+t.topic)+'</span></div>').join("")+
      '</div>';
  }

  if(b.soz){
    const sH=Math.round(b.haftaDk/60);
    h+='<div class="bfsec"><p class="eyebrow">Bu hafta sözün</p>'+
      '<div class="dayrow"><span class="k">Çalışma</span><span class="v">'+sH+' / '+b.soz.saat+' saat</span></div>'+
      '<div class="dayrow"><span class="k">Soru</span><span class="v">'+b.haftaSoru+' / '+b.soz.soru+'</span></div></div>';
  }
  w.innerHTML=h;
}

/* ==================================================================
   3) HAFTALIK KARNE
   ================================================================== */
let karneOfs=0;
function shiftKarne(n){ karneOfs=Math.max(-26,Math.min(0,karneOfs+n)); renderKarne(); }
function karneData(ofs){
  const wk=addDaysKey(keyOf(mondayOf(new Date())),(ofs||0)*7);
  const oncekiWk=addDaysKey(wk,-7);
  function topla(bas){
    let dk=0,soru=0,aktif=0,tam=0;
    for(let i=0;i<7;i++){
      const k=addDaysKey(bas,i);
      const m=S.pomoMin[k]|0,q=S.solved[k]|0;
      dk+=m; soru+=q;
      if(m||q)aktif++;
      if(dayDone(k))tam++;
    }
    return {dk:dk,soru:soru,aktif:aktif,tam:tam};
  }
  const bu=topla(wk),once=topla(oncekiWk);
  /* plan sadakati */
  let dolu=0,tik=0;
  const w=S.weeks[wk];
  if(w){
    const nw=normWeek(w);
    ["r","s"].forEach(blk=>(nw[blk]||[]).forEach((row,i)=>row.forEach((v,d)=>{
      if(v&&v.trim()){ dolu++; if(nw.dn[blk+"-"+i+"-"+d])tik++; }
    })));
  }
  /* o haftanın denemeleri */
  const son=addDaysKey(wk,6);
  const dnm=S.denemeler.filter(x=>x.type!=="BRANS"&&x.date>=wk&&x.date<=son);
  /* ders dağılımı */
  const ders={};
  for(let i=0;i<7;i++){
    const k=addDaysKey(wk,i),sj=S.pomoSubj[k];
    if(sj)Object.keys(sj).forEach(d=>{ ders[d]=(ders[d]||0)+(sj[d]|0); });
  }
  const dersList=Object.keys(ders).map(d=>({ad:d,dk:ders[d]})).sort((a,b)=>b.dk-a.dk);
  /* pekiştirilen konular */
  let konu=0;
  Object.keys(S.topics).forEach(k=>{
    const t=S.topics[k];
    if(t.st===3&&t.ts&&t.ts>=wk&&t.ts<=son)konu++;
  });
  const ct=(typeof contractFor==="function")?contractFor(wk):null;
  return {wk:wk,bu:bu,once:once,dolu:dolu,tik:tik,
    sadakat:dolu?Math.round(tik/dolu*100):null,
    dnm:dnm,ders:dersList,konu:konu,soz:ct};
}
function karneYorum(k){
  const y=[];
  if(!k.bu.dk&&!k.bu.soru)return ["Bu hafta kayıt yok."];
  const fark=k.bu.dk-k.once.dk;
  if(k.once.dk){
    if(fark>60)y.push("Geçen haftaya göre "+fmtHM(Math.abs(fark))+" daha fazla çalıştın.");
    else if(fark<-60)y.push("Geçen haftaya göre "+fmtHM(Math.abs(fark))+" daha az çalıştın.");
    else y.push("Çalışma süren geçen haftayla aynı düzeyde.");
  }
  if(k.bu.aktif>=6)y.push(k.bu.aktif+" gün kayıt var — düzen sağlam.");
  else if(k.bu.aktif>=4)y.push(k.bu.aktif+" gün çalışmışsın. Bir iki gün daha eklemek en kolay kazanç.");
  else y.push("Yalnız "+k.bu.aktif+" gün kayıt var. Süreyi artırmadan önce düzeni kurmak gerekiyor.");
  if(k.sadakat!==null){
    if(k.sadakat>=80)y.push("Planın %"+k.sadakat+"'ini uygulamışsın.");
    else if(k.sadakat>=50)y.push("Planın %"+k.sadakat+"'ini uygulamışsın — plan biraz iddialı olabilir.");
    else y.push("Planın yalnız %"+k.sadakat+"'i yapılmış. Daha az yazıp hepsini yapmak daha iyi.");
  }
  if(k.dnm.length){
    const netler=k.dnm.map(d=>d.totalNet);
    y.push(k.dnm.length+" deneme · en yüksek "+r2(Math.max.apply(null,netler))+" net.");
  } else y.push("Bu hafta deneme yok — ölçmeden ilerlemek riskli.");
  if(k.ders.length>=2){
    const top=k.ders.reduce((a,x)=>a+x.dk,0);
    const p=Math.round(k.ders[0].dk/top*100);
    if(p>=55)y.push("Sürenin %"+p+"'i "+k.ders[0].ad+" dersine gitmiş — dengeye bak.");
  }
  if(k.konu)y.push(k.konu+" konu pekiştirildi.");
  return y;
}
function renderKarne(){
  const w=el("karneBox"); if(!w)return;
  const k=karneData(karneOfs);
  const lbl=el("karneLabel");
  if(lbl){
    const bas=parseKey(k.wk),son=new Date(bas.getTime()+6*86400000);
    const ay=["Oca","Şub","Mar","Nis","May","Haz","Tem","Ağu","Eyl","Eki","Kas","Ara"];
    lbl.textContent=(karneOfs===0?"Bu hafta":karneOfs===-1?"Geçen hafta":Math.abs(karneOfs)+" hafta önce")+
      " · "+bas.getDate()+" "+ay[bas.getMonth()]+"–"+son.getDate()+" "+ay[son.getMonth()];
  }
  const ileri=el("karneNext"); if(ileri)ileri.disabled=karneOfs>=0;
  if(!k.bu.dk&&!k.bu.soru&&!k.dnm.length){
    w.innerHTML='<div class="empty">Bu haftaya ait kayıt yok.</div>';
    return;
  }
  const fark=(a,b)=>{ const f=a-b; return (f>0?"+":"")+f; };
  let h='<div class="dayrow"><span class="k">Çalışma</span><span class="v">'+fmtHM(k.bu.dk)+
    (k.once.dk?' <small style="color:'+(k.bu.dk>=k.once.dk?"var(--success)":"var(--danger)")+'">('+
      fark(Math.round(k.bu.dk/60),Math.round(k.once.dk/60))+' sa)</small>':"")+'</span></div>'+
    '<div class="dayrow"><span class="k">Soru</span><span class="v">'+k.bu.soru+
    (k.once.soru?' <small style="color:'+(k.bu.soru>=k.once.soru?"var(--success)":"var(--danger)")+'">('+
      fark(k.bu.soru,k.once.soru)+')</small>':"")+'</span></div>'+
    '<div class="dayrow"><span class="k">Aktif gün</span><span class="v">'+k.bu.aktif+'/7</span></div>'+
    '<div class="dayrow"><span class="k">Tamamlanan gün</span><span class="v">'+k.bu.tam+'/7</span></div>';
  if(k.sadakat!==null)
    h+='<div class="dayrow"><span class="k">Plan sadakati</span><span class="v">%'+k.sadakat+
      ' <small>('+k.tik+'/'+k.dolu+')</small></span></div>';
  h+='<div class="dayrow"><span class="k">Deneme</span><span class="v">'+k.dnm.length+'</span></div>'+
    '<div class="dayrow"><span class="k">Pekiştirilen konu</span><span class="v">'+k.konu+'</span></div>';

  if(k.ders.length){
    const top=k.ders.reduce((a,x)=>a+x.dk,0);
    h+='<p class="eyebrow" style="margin:16px 0 6px;">Ders dağılımı</p>'+
      k.ders.slice(0,8).map(d=>{
        const p=Math.round(d.dk/top*100);
        return '<div class="ctrow"><div class="ctline"><span class="k">'+esc(d.ad)+'</span>'+
          '<span class="v">'+fmtHM(d.dk)+' · %'+p+'</span></div>'+
          '<div class="bar"><i style="width:'+p+'%"></i></div></div>';
      }).join("");
  }
  h+='<p class="eyebrow" style="margin:16px 0 6px;">Değerlendirme</p>'+
    karneYorum(k).map(x=>'<div class="dayrow"><span class="k">'+esc(x)+'</span></div>').join("");
  w.innerHTML=h;
}

/* ==================================================================
   4) VERİM SAATİ
   Hangi saatlerde daha çok çalışıyorsun?
   ================================================================== */
function hourData(gun){
  const cut=addDaysKey(todayKey(),-(gun||60));
  const saat=new Array(24).fill(0);
  const say=new Array(24).fill(0);
  Object.keys(S.sessions||{}).forEach(k=>{
    if(k<cut)return;
    (S.sessions[k]||[]).forEach(se=>{
      if(!se||se.type!=="work"||!se.t)return;
      const h=new Date(se.t).getHours();
      if(!isFinite(h))return;
      saat[h]+=(se.m|0); say[h]++;
    });
  });
  const top=saat.reduce((a,b)=>a+b,0);
  if(!top)return null;
  /* zaman dilimleri */
  const dilim=[
    {ad:"Sabah",bas:5,son:11},
    {ad:"Öğle",bas:11,son:15},
    {ad:"Akşamüstü",bas:15,son:19},
    {ad:"Akşam",bas:19,son:24},
    {ad:"Gece",bas:0,son:5}
  ].map(d=>{
    let dk=0;
    for(let h=d.bas;h<d.son;h++)dk+=saat[h];
    return {ad:d.ad,dk:dk,pay:top?Math.round(dk/top*100):0};
  }).sort((a,b)=>b.dk-a.dk);
  let enIyi=0;
  for(let h=0;h<24;h++)if(saat[h]>saat[enIyi])enIyi=h;
  return {saat:saat,say:say,top:top,dilim:dilim,enIyi:enIyi,
    oturum:say.reduce((a,b)=>a+b,0)};
}
function renderHours(){
  const w=el("hourBox"); if(!w)return;
  const d=hourData(60);
  if(!d){
    w.innerHTML='<div class="empty">Odak ekranında çalıştıkça hangi saatlerde daha verimli olduğun burada çıkar. En az birkaç oturum gerekiyor.</div>';
    return;
  }
  const en=Math.max.apply(null,d.saat);
  let h='<p class="hint" style="margin:0 0 10px;">Son 60 gün · '+d.oturum+' oturum</p>';
  h+='<div class="hourbars">'+d.saat.map((dk,i)=>
    '<i class="'+(i===d.enIyi?"top":"")+'" style="height:'+Math.max(2,Math.round(dk/en*46))+'px" '+
    'title="'+i+':00 · '+fmtHM(dk)+'"></i>').join("")+'</div>'+
    '<div class="hourlbl"><span>00</span><span>06</span><span>12</span><span>18</span><span>23</span></div>';
  h+='<p class="eyebrow" style="margin:16px 0 6px;">Zaman dilimleri</p>'+
    d.dilim.filter(x=>x.dk>0).map(x=>
      '<div class="ctrow"><div class="ctline"><span class="k">'+x.ad+'</span>'+
      '<span class="v">'+fmtHM(x.dk)+' · %'+x.pay+'</span></div>'+
      '<div class="bar"><i style="width:'+x.pay+'%"></i></div></div>').join("");
  const enD=d.dilim[0];
  h+='<p class="hint"><b>En verimli zamanın: '+esc(enD.ad)+'</b> (en yoğun saat '+d.enIyi+':00). '+
     'Zor konuları buraya koymayı dene. Ama bu senin ne zaman çalıştığını gösterir, '+
     'ne zaman en iyi öğrendiğini değil — ikisi aynı olmayabilir.</p>';
  w.innerHTML=h;
}

/* ==================================================================
   5) DENEME KARŞILAŞTIRMA
   ================================================================== */
let cmpA="",cmpB="";
function cmpList(){
  return S.denemeler.filter(d=>d.type!=="BRANS")
    .sort((a,b)=>String(b.date).localeCompare(String(a.date)));
}
function setCmp(hangi,id){
  if(hangi==="a")cmpA=id; else cmpB=id;
  renderCompare();
}
function cmpFill(){
  const list=cmpList();
  ["cmpA","cmpB"].forEach((sid,i)=>{
    const s=el(sid); if(!s)return;
    const secili=i?cmpB:cmpA;
    s.innerHTML='<option value="">Deneme seç…</option>'+list.map(d=>
      '<option value="'+d.id+'"'+(String(secili)===String(d.id)?" selected":"")+'>'+
      esc(d.name)+' · '+d.totalNet+' net</option>').join("");
  });
}
function renderCompare(){
  const w=el("cmpBox"); if(!w)return;
  cmpFill();
  const list=cmpList();
  if(list.length<2){
    w.innerHTML='<div class="empty">Karşılaştırma için en az iki deneme gerekiyor.</div>';
    return;
  }
  const a=list.find(d=>String(d.id)===String(cmpA));
  const b=list.find(d=>String(d.id)===String(cmpB));
  if(!a||!b){
    w.innerHTML='<div class="empty">İki deneme seç; ders ders farkı görürsün.</div>';
    return;
  }
  if(a.id===b.id){
    w.innerHTML='<div class="empty">Aynı denemeyi iki kez seçtin.</div>';
    return;
  }
  /* eski → yeni sırala */
  const eski=String(a.date)<=String(b.date)?a:b;
  const yeni=eski===a?b:a;
  const dersler=[];
  (eski.subjectResults||[]).forEach(s=>{ if(dersler.indexOf(s.name)<0)dersler.push(s.name); });
  (yeni.subjectResults||[]).forEach(s=>{ if(dersler.indexOf(s.name)<0)dersler.push(s.name); });
  const satir=dersler.map(ad=>{
    const e=(eski.subjectResults||[]).find(x=>x.name===ad);
    const y=(yeni.subjectResults||[]).find(x=>x.name===ad);
    return {ad:ad,e:e?e.net:null,y:y?y.net:null,
      fark:(e&&y)?r2(y.net-e.net):null,
      cap:(y&&y.cap)||(e&&e.cap)||0};
  });
  satir.sort((x,y)=>{
    if(x.fark===null)return 1;
    if(y.fark===null)return -1;
    return x.fark-y.fark;
  });
  const toplamFark=r2(yeni.totalNet-eski.totalNet);
  const gunFark=Math.round((parseKey(yeni.date)-parseKey(eski.date))/86400000);
  let h='<div class="cmphead">'+
    '<span><b>'+esc(eski.name)+'</b><small>'+eski.date+' · '+eski.totalNet+' net</small></span>'+
    '<span class="ar">→</span>'+
    '<span><b>'+esc(yeni.name)+'</b><small>'+yeni.date+' · '+yeni.totalNet+' net</small></span></div>';
  h+='<div class="dayrow"><span class="k">Toplam fark</span><span class="v" style="color:'+
    (toplamFark>0?"var(--success)":toplamFark<0?"var(--danger)":"var(--label-3)")+'">'+
    (toplamFark>0?"+":"")+toplamFark+' net</span></div>';
  if(gunFark>0)h+='<div class="dayrow"><span class="k">Aradaki süre</span><span class="v">'+gunFark+' gün</span></div>';
  h+='<p class="eyebrow" style="margin:16px 0 6px;">Ders ders</p>';
  h+=satir.map(s=>{
    if(s.fark===null)
      return '<div class="dayrow"><span class="k">'+esc(s.ad)+'</span>'+
        '<span class="v" style="color:var(--label-3)">tek denemede var</span></div>';
    const renk=s.fark>0?"var(--success)":s.fark<0?"var(--danger)":"var(--label-3)";
    return '<div class="dayrow"><span class="k">'+esc(s.ad)+'<br><small>'+s.e+' → '+s.y+'</small></span>'+
      '<span class="v" style="color:'+renk+'">'+(s.fark>0?"+":"")+s.fark+'</span></div>';
  }).join("");
  const dusen=satir.filter(s=>s.fark!==null&&s.fark<-1);
  const artan=satir.filter(s=>s.fark!==null&&s.fark>1);
  if(dusen.length)h+='<p class="hint"><b>Düşenler:</b> '+dusen.map(s=>esc(s.ad)).join(", ")+
    '. Bu derslerde ne değişti — konu mu, süre mi, dikkat mi?</p>';
  else if(artan.length)h+='<p class="hint"><b>Artanlar:</b> '+artan.map(s=>esc(s.ad)).join(", ")+
    '. Bu derslerde ne yaptıysan diğerlerinde de dene.</p>';
  w.innerHTML=h;
}

/* ==================================================================
   6) ZAYIF KONU TAKİBİ
   Yanlış defterindeki konuların zaman içindeki seyri.
   ================================================================== */
function weakTopics(){
  const bugun=todayKey();
  const yeni=addDaysKey(bugun,-30);
  const eski=addDaysKey(bugun,-60);
  const map={};
  S.wrongLog.forEach(w=>{
    const anahtar=(w.subject||"")+" · "+(w.topic||"");
    if(!map[anahtar])map[anahtar]={ad:anahtar,subject:w.subject,topic:w.topic,
      yeni:0,eski:0,toplam:0,son:""};
    const n=w.n|0||1;
    map[anahtar].toplam+=n;
    if(w.date>=yeni)map[anahtar].yeni+=n;
    else if(w.date>=eski)map[anahtar].eski+=n;
    if(w.date>map[anahtar].son)map[anahtar].son=w.date;
  });
  const list=Object.keys(map).map(k=>{
    const m=map[k];
    m.fark=m.yeni-m.eski;
    /* konunun güven durumu */
    const key=(typeof topicKeyOf==="function")?topicKeyOf(m.subject,m.topic):null;
    const t=key?S.topics[key]:null;
    m.st=t?t.st:0;
    m.conf=t?(t.conf||0):0;
    m.key=key;
    return m;
  }).filter(m=>m.toplam>0);
  list.sort((a,b)=>(b.yeni-a.yeni)||(b.toplam-a.toplam));
  return list;
}
function renderWeak(){
  const w=el("weakBox"); if(!w)return;
  const list=weakTopics();
  if(!list.length){
    w.innerHTML='<div class="empty">Yanlış defterine kayıt ekledikçe, hangi konuların düzeldiği ve hangilerinin ısrar ettiği burada görünür.</div>';
    return;
  }
  const inatci=list.filter(m=>m.yeni>0&&m.fark>=0).slice(0,6);
  const duzelen=list.filter(m=>m.eski>0&&m.yeni<m.eski).slice(0,6);
  let h="";
  if(inatci.length){
    h+='<p class="eyebrow" style="margin:0 0 6px;">Israr eden konular</p>'+
      inatci.map(m=>{
        const durum=m.st===3?"pekiştirildi":m.st===2?"işledin":m.st===1?"başladın":"hiç işlemedin";
        return '<div class="dayrow"><span class="k">'+esc(m.ad)+
          '<br><small>son 30 gün: '+m.yeni+' yanlış · '+durum+'</small></span>'+
          '<span class="v">'+(m.key?'<button class="btn ghost tiny" onclick="weakGoTopic(\''+
            String(m.subject).replace(/'/g,"\\'")+'\',\''+String(m.topic).replace(/'/g,"\\'")+'\')">videolar</button>':"")+
          '</span></div>';
      }).join("");
    h+='<p class="hint">Bu konular tekrar edilmesine rağmen yanlış üretmeye devam ediyor. '+
       'Aynı kaynaktan tekrar etmek yerine başka bir anlatım denemek işe yarayabilir.</p>';
  }
  if(duzelen.length){
    h+='<p class="eyebrow" style="margin:16px 0 6px;">Düzelenler</p>'+
      duzelen.map(m=>
        '<div class="dayrow"><span class="k">'+esc(m.ad)+'</span>'+
        '<span class="v" style="color:var(--success)">'+m.eski+' → '+m.yeni+'</span></div>').join("");
  }
  if(!inatci.length&&!duzelen.length){
    h+='<div class="empty">Karşılaştırma için en az 30 günlük kayıt gerekiyor. Yanlışlarını girmeye devam et.</div>';
  }
  w.innerHTML=h;
}
function weakGoTopic(subject,topic){
  if(typeof openVideos!=="function")return false;
  return openVideos(subject+" "+topic+" konu anlatımı YKS",subject+" · "+topic,
    {subject:subject,topic:topic});
}

/* ==================================================================
   7) HAFTALIK ISINMA
   Hafta içindeki yük dağılımı: nasıl gidiyor, nasıl olmalı.
   ================================================================== */
function rampData(ofs){
  const wk=addDaysKey(keyOf(mondayOf(new Date())),(ofs||0)*7);
  const gunler=[];
  for(let i=0;i<7;i++){
    const k=addDaysKey(wk,i);
    gunler.push({k:k,dk:S.pomoMin[k]|0,soru:S.solved[k]|0,gecmis:k<=todayKey()});
  }
  const top=gunler.reduce((a,g)=>a+g.dk,0);
  /* önerilen dağılım: pzt hafif, orta yoğun, cmt deneme, paz hafif */
  const oneri=[0.13,0.16,0.17,0.16,0.15,0.15,0.08];
  return {wk:wk,gunler:gunler,top:top,oneri:oneri};
}
function renderRamp(){
  const w=el("rampBox"); if(!w)return;
  const d=rampData(0);
  const gunAd=["Pzt","Sal","Çar","Per","Cum","Cmt","Paz"];
  if(!d.top){
    w.innerHTML='<div class="empty">Bu hafta henüz çalışma kaydı yok. Kayıt girdikçe haftanın yük dağılımı burada çıkar.</div>';
    return;
  }
  const en=Math.max.apply(null,d.gunler.map(g=>g.dk).concat([1]));
  let h='<p class="hint" style="margin:0 0 10px;">Koyu çubuk gerçek, açık çizgi dengeli dağılım.</p>';
  h+='<div class="rampwrap">'+d.gunler.map((g,i)=>{
    const y=Math.max(2,Math.round(g.dk/en*60));
    const o=Math.max(2,Math.round(d.oneri[i]*d.top/en*60));
    return '<div class="rampcol'+(g.gecmis?"":" ilerde")+'">'+
      '<div class="rampbars"><i class="ger" style="height:'+y+'px" title="'+fmtHM(g.dk)+'"></i>'+
      '<i class="one" style="height:'+o+'px"></i></div>'+
      '<span class="rl">'+gunAd[i]+'</span></div>';
  }).join("")+'</div>';
  /* değerlendirme */
  const gecmis=d.gunler.filter(g=>g.gecmis);
  const bos=gecmis.filter(g=>!g.dk&&!g.soru);
  const enYogun=d.gunler.reduce((a,g,i)=>g.dk>d.gunler[a].dk?i:a,0);
  const y=[];
  if(bos.length>=3)y.push(gecmis.length+" günün "+bos.length+"'i boş geçmiş. Az ama her gün, çok ama iki gün'den iyidir.");
  const pay=d.top?d.gunler[enYogun].dk/d.top:0;
  if(pay>=0.4)y.push(gunAd[enYogun]+" günü haftanın %"+Math.round(pay*100)+"'ini tek başına taşımış. Bu tempo sürdürülebilir değil.");
  const hafta=d.gunler.slice(0,5).reduce((a,g)=>a+g.dk,0);
  const sonu=d.gunler.slice(5).reduce((a,g)=>a+g.dk,0);
  if(d.top&&sonu>hafta)y.push("Yükün çoğu hafta sonuna kalmış. Hafta içine yaymak hem kalıcılığı hem dinlenmeyi artırır.");
  if(!y.length)y.push("Dağılım dengeli görünüyor.");
  h+='<p class="eyebrow" style="margin:14px 0 6px;">Değerlendirme</p>'+
    y.map(x=>'<div class="dayrow"><span class="k">'+esc(x)+'</span></div>').join("");
  w.innerHTML=h;
}

/* ==================================================================
   BAŞLATMA
   ================================================================== */
function renderRound18(){
  renderAutoBackup(); renderKarne(); renderHours();
  renderCompare(); renderWeak(); renderRamp();
}
function boot19(){
  boot18();
  perfIdle("boot-auto-backup",()=>autoBackupRun(false),1000);
  perfIdle("boot-round18",()=>renderRound18(),1350);
  setTimeout(()=>{ try{ openBrief(false); }catch(e){} },900);
}
/* boot çağrısı ek modülün sonunda */

/* ==================================================================
   GÜNÜN SÖZÜ
   İsim sahibi kişilere atfedilen kısa sözler. Her uygulama açılışında rastgele seçilir;
   yenile düğmesi mevcut sözden farklı rastgele bir söz gösterir.
   ================================================================== */
const SOZLER=[{"q":"Hayal etmeden hiçbir şey olmaz.","a":"Fatih Terim","c":"Teknik Direktör"},{"q":"Sabredeceğiz ve çok çalışacağız. Yapacak başka bir şey yok.","a":"Fatih Terim","c":"Teknik Direktör"},{"q":"Nerede olduğunuz değil, ne bilgi verdiğiniz önemli.","a":"Şenol Güneş","c":"Teknik Direktör"},{"q":"Bu çocuklara, gençlere güveniyorum.","a":"Şenol Güneş","c":"Teknik Direktör"},{"q":"Bir kez pes edersen, ikinci kez de pes edersin.","a":"Sir Alex Ferguson","c":"Teknik Direktör"},{"q":"Çok çalışmak da bir yetenektir.","a":"Sir Alex Ferguson","c":"Teknik Direktör"},{"q":"Şüphe edenlerden inananlara dönüşmeliyiz.","a":"Jürgen Klopp","c":"Teknik Direktör"},{"q":"Birlikte büyük şeyler başarabileceğimize inanmanızı istiyorum.","a":"Jürgen Klopp","c":"Teknik Direktör"},{"q":"Olumlu olun ve oyunu yaşamaya bakın.","a":"Jürgen Klopp","c":"Teknik Direktör"},{"q":"Yapabileceğine inanmıyorsan zaten hiç şansın yoktur.","a":"Arsène Wenger","c":"Teknik Direktör"},{"q":"Başarı, her gün aynı ciddiyetle çalışmayı gerektirir.","a":"Arsène Wenger","c":"Teknik Direktör"},{"q":"Kariyerimde defalarca başarısız oldum; bu yüzden başarılı oldum.","a":"Michael Jordan","c":"Spor"},{"q":"Bazıları olmasını ister, bazıları olmasını diler, bazıları gerçekleştirir.","a":"Michael Jordan","c":"Spor"},{"q":"En önemli şey, insanlara yaptıkları işte büyük olabileceklerini göstermektir.","a":"Kobe Bryant","c":"Spor"},{"q":"Bir boşluk varsa ve denemiyorsan artık yarışçı değilsindir.","a":"Ayrton Senna","c":"Spor"},{"q":"Zafer, “Zafer benimdir!” diyebilenindir.","a":"Mustafa Kemal Atatürk","c":"Tarih"},{"q":"Güçlükler karşısında yılmamak gerekir.","a":"Mustafa Kemal Atatürk","c":"Tarih"},{"q":"Büyük kararlar vermek yeterli değildir; onları cesaret ve kesinlikle uygulamak gerekir.","a":"Mustafa Kemal Atatürk","c":"Tarih"},{"q":"Taşa toprağa değil, insana değer verin.","a":"Mustafa Kemal Atatürk","c":"Tarih"},{"q":"Sonuçsuz uğraşmak, çalışma sayılmaz.","a":"Mustafa Kemal Atatürk","c":"Tarih"},{"q":"Başarılarda gururu yenmek, felaketlerde ümitsizliğe direnmek gerekir.","a":"Mustafa Kemal Atatürk","c":"Tarih"},{"q":"Çalışmak, gerçekte güç değildir.","a":"Mustafa Kemal Atatürk","c":"Tarih"},{"q":"Bana yaptıklarımdan değil, yapacaklarımdan söz edin.","a":"Mustafa Kemal Atatürk","c":"Tarih"},{"q":"Dünyada her şey için en gerçek yol gösterici bilimdir, tekniktir.","a":"Mustafa Kemal Atatürk","c":"Tarih"},{"q":"Bir insan yaşamında büyük bir başarı kazanabilir; ama çalışmayı sürdürmelidir.","a":"Mustafa Kemal Atatürk","c":"Tarih"},{"q":"İmkânsız görünür; ta ki yapılana kadar.","a":"Nelson Mandela","c":"Tarih"},{"q":"Cesaret, korkunun yokluğu değil; ona karşı kazanılan zaferdir.","a":"Nelson Mandela","c":"Tarih"},{"q":"Gelecek, hayallerinin güzelliğine inananlarındır.","a":"Eleanor Roosevelt","c":"Tarih"},{"q":"Geleceğin en iyi yanı, her gün birer gün gelmesidir.","a":"Abraham Lincoln","c":"Tarih"},{"q":"En zor şey harekete geçme kararıdır; gerisi yalnızca ısrardır.","a":"Amelia Earhart","c":"Tarih"},{"q":"Hayal gücü bilgiden daha önemlidir.","a":"Albert Einstein","c":"Bilim"},{"q":"Hayat bisiklete binmek gibidir; dengede kalmak için ilerlemelisin.","a":"Albert Einstein","c":"Bilim"},{"q":"Hiç hata yapmamış biri, yeni bir şey denememiştir.","a":"Albert Einstein","c":"Bilim"},{"q":"Sorunlarımızı, onları yarattığımız düşünce düzeyiyle çözemeyiz.","a":"Albert Einstein","c":"Bilim"},{"q":"Deha yüzde bir ilham, yüzde doksan dokuz terdir.","a":"Thomas Edison","c":"Bilim"},{"q":"Başarısız olmadım; işe yaramayan birçok yol buldum.","a":"Thomas Edison","c":"Bilim"},{"q":"Fırsat çoğu insan tarafından kaçırılır; çünkü iş kıyafeti giyer ve çalışmaya benzer.","a":"Thomas Edison","c":"Bilim"},{"q":"En büyük zayıflığımız vazgeçmektir.","a":"Thomas Edison","c":"Bilim"},{"q":"Hayatta hiçbir şey korkulacak değildir; yalnızca anlaşılmalıdır.","a":"Marie Curie","c":"Bilim"},{"q":"İnsan yaptığı şeyi fark etmez; yalnızca yapılması gerekeni görür.","a":"Marie Curie","c":"Bilim"},{"q":"İnsanlar hakkında daha az, fikirler hakkında daha çok meraklı olun.","a":"Marie Curie","c":"Bilim"},{"q":"Daha ileriyi gördüysem, devlerin omuzlarında durduğum içindir.","a":"Isaac Newton","c":"Bilim"},{"q":"Ben varsayımlar uydurmam.","a":"Isaac Newton","c":"Bilim"},{"q":"Hayatta kalan, en güçlü değil; değişime en iyi uyum sağlayandır.","a":"Charles Darwin","c":"Bilim"},{"q":"Bilgisizliği, bilgiden daha sık güven doğurur.","a":"Charles Darwin","c":"Bilim"},{"q":"Bilmediğin şeyi biliyormuş gibi kandırmamalısın; en kolayı kendini kandırmaktır.","a":"Richard Feynman","c":"Bilim"},{"q":"Bir şeyi basitçe açıklayamıyorsan onu yeterince iyi anlamamışsındır.","a":"Richard Feynman","c":"Bilim"},{"q":"Bugünün bilim insanı, açıkça düşünmeli ve derinden çalışmalıdır.","a":"Nikola Tesla","c":"Bilim"},{"q":"Bırakın gelecek gerçeği söylesin.","a":"Nikola Tesla","c":"Bilim"},{"q":"Zekâ, değişime uyum sağlayabilme yeteneğidir.","a":"Stephen Hawking","c":"Bilim"},{"q":"Ne kadar zor görünürse görünsün, her zaman yapabileceğin bir şey vardır.","a":"Stephen Hawking","c":"Bilim"},{"q":"Yalnızca ileriyi biraz görebiliriz; ama yapılması gereken çok şey olduğunu görebiliriz.","a":"Alan Turing","c":"Bilim"},{"q":"Bu bir insan için küçük, insanlık için dev bir adımdır.","a":"Neil Armstrong","c":"Bilim"},{"q":"Herkes işini gerekenden biraz daha iyi yaptığında performans yükselir.","a":"Neil Armstrong","c":"Bilim"},{"q":"Başarısızlık, daha akıllıca yeniden başlama fırsatıdır.","a":"Henry Ford","c":"Yenilik"},{"q":"Hata bulma; çözüm bul.","a":"Henry Ford","c":"Yenilik"},{"q":"Yapabileceğini düşünüyorsan da yapamayacağını düşünüyorsan da genellikle haklısın.","a":"Henry Ford","c":"Yenilik"},{"q":"Neyin mümkün olup olmadığını kesin söyleyecek kadar kimsenin bildiğini sanmıyorum.","a":"Henry Ford","c":"Yenilik"},{"q":"Zamanınız sınırlı; başkasının hayatını yaşayarak harcamayın.","a":"Steve Jobs","c":"Yenilik"},{"q":"Yaptığınız işi sevmenin tek yolu, harika bir iş yaptığına inanmaktır.","a":"Steve Jobs","c":"Yenilik"},{"q":"İncelenmemiş bir hayat, yaşanmaya değmez.","a":"Sokrates","c":"Düşünce"},{"q":"Bildiğim tek şey, hiçbir şey bilmediğimdir.","a":"Sokrates","c":"Düşünce"},{"q":"Biz, tekrar tekrar yaptığımız şeyiz.","a":"Aristoteles","c":"Düşünce"},{"q":"Mükemmellik bir eylem değil, alışkanlıktır.","a":"Aristoteles","c":"Düşünce"},{"q":"Kökleri acı olsa da eğitimin meyvesi tatlıdır.","a":"Aristoteles","c":"Düşünce"},{"q":"Şans, hazırlık ile fırsatın buluştuğu yerdir.","a":"Seneca","c":"Düşünce"},{"q":"Zor olduğu için cesaret edemeyiz değil; cesaret etmediğimiz için zordur.","a":"Seneca","c":"Düşünce"},{"q":"Yaşam kısa değil; biz onun çoğunu boşa harcıyoruz.","a":"Seneca","c":"Düşünce"},{"q":"Hayatımız, düşüncelerimizin yaptığı şeydir.","a":"Marcus Aurelius","c":"Düşünce"},{"q":"Yolundaki engel, yolun kendisi olur.","a":"Marcus Aurelius","c":"Düşünce"},{"q":"Yapman gereken doğruysa, başkalarının ne dediği seni durdurmasın.","a":"Marcus Aurelius","c":"Düşünce"},{"q":"Seni rahatsız eden şeyler değil, onlar hakkındaki yargındır.","a":"Epiktetos","c":"Düşünce"},{"q":"Önce kendine ne olmak istediğini sor; sonra yapman gerekeni yap.","a":"Epiktetos","c":"Düşünce"},{"q":"İlerleme istiyorsan, bazı şeylerde acemi görünmeyi kabul et.","a":"Epiktetos","c":"Düşünce"},{"q":"Beni öldürmeyen şey beni güçlendirir.","a":"Friedrich Nietzsche","c":"Düşünce"},{"q":"Bir nedeni olan, neredeyse her nasıla dayanabilir.","a":"Friedrich Nietzsche","c":"Düşünce"},{"q":"Bilmek yetmez; uygulamalıyız. İstemek yetmez; yapmalıyız.","a":"Johann Wolfgang von Goethe","c":"Düşünce"},{"q":"Başlamak için büyük olmak zorunda değilsin; ama büyük olmak için başlamalısın.","a":"Johann Wolfgang von Goethe","c":"Düşünce"},{"q":"Cesaret, baskı altında zarafettir.","a":"Ernest Hemingway","c":"Düşünce"},{"q":"Kışın ortasında, içimde yenilmez bir yaz olduğunu öğrendim.","a":"Albert Camus","c":"Düşünce"},{"q":"Dünün büyük ailelerini gösteriyoruz, Ve ebeveynleri Rabb'in kim olduğu efendileri.","a":"Daniel Defoe","c":"İnsan Sözü"},{"q":"Gerçeği arayanlara inanın; onu bulanlardan şüphe duy.","a":"Andre Gide","c":"İnsan Sözü"},{"q":"Doğa yasalarıyla tutarlı olan hiçbir şey gerçek olamayacak kadar muhteşem değildir.","a":"Michael Faraday","c":"İnsan Sözü"},{"q":"Rüyalarınızı gerçekleştirmenin en iyi yolu uyanmaktır.","a":"Paul Valery","c":"İnsan Sözü"},{"q":"Cesaret korkuya direnmek, korkuya hakim olmaktır - korkunun yokluğu değil.","a":"Mark Twain","c":"İnsan Sözü"},{"q":"Taklit etmekten kaçınmak en iyi intikamdır.","a":"Marcus Aurelius","c":"İnsan Sözü"},{"q":"Bir nesilde saçmalığın doruğu gibi görünen şey, çoğu zaman bir başka nesilde bilgeliğin doruğuna dönüşür.","a":"Adlai Stevenson","c":"İnsan Sözü"},{"q":"İnsan özgür doğar ve her yerde zincire vurulmuştur.","a":"Jean-Jacques Rousseau","c":"İnsan Sözü"},{"q":"Gerçekten katılmaya değer derslere devamı sağlamak için disiplin şarttır.","a":"Adam Smith","c":"İnsan Sözü"},{"q":"Hayatın son yılları, maskelerin düştüğü bir maskeli balo partisinin sonu gibidir.","a":"Arthur Schopenhauer","c":"İnsan Sözü"},{"q":"Önemli olan tek cesaret, sizi bir andan diğerine taşıyacak türdendir.","a":"Mignon McLaughlin","c":"İnsan Sözü"},{"q":"Hiç kimse en yakın arkadaşının başarısızlığından dolayı tamamen mutsuz değildir.","a":"Groucho Marx","c":"İnsan Sözü"},{"q":"Bilim, gelişmiş algıdan, entegre niyetten, yuvarlatılmış ve incelikle ifade edilen sağduyudan başka bir şey değildir.","a":"George Santayana","c":"İnsan Sözü"},{"q":"Evlat, hayatı yaşamak uzun zaman alır.","a":"Steven Wright","c":"İnsan Sözü"},{"q":"Huzur içinde yenen bir ekmek, kaygı içinde verilen bir ziyafetten daha iyidir.","a":"Aesop","c":"İnsan Sözü"},{"q":"Kehanet: Gelecekteki teslimat için kişinin güvenilirliğini satma sanatı ve uygulaması.","a":"Ambrose Bierce","c":"İnsan Sözü"},{"q":"Hayattan korkmayın. Hayatın yaşamaya değer olduğuna inanın ve inancınız bu gerçeğin oluşmasına yardımcı olacaktır.","a":"William James","c":"İnsan Sözü"},{"q":"Uyumak küçük bir sanat değildir: bu amaçla bütün gün uyanık kalmak gerekir.","a":"Friedrich Nietzsche","c":"İnsan Sözü"},{"q":"Hayatı seviyor musun? O halde zamanı israf etmeyin, çünkü hayat ondan yapılmıştır.","a":"Benjamin Franklin","c":"İnsan Sözü"},{"q":"Yaptığı işe tutkuyla bağlı olan hiç kimsenin hayattan korkacak bir şeyi yoktur.","a":"Samuel Goldwyn","c":"İnsan Sözü"},{"q":"Sessizlik anlamsız sözlerden daha iyidir.","a":"Pythagoras","c":"İnsan Sözü"},{"q":"Değişim olmadan ilerleme mümkün değildir ve fikrini değiştiremeyenler hiçbir şeyi değiştiremezler.","a":"George Bernard Shaw","c":"İnsan Sözü"},{"q":"Bana ilerlemenin yolunun ne hızlı ne de kolay olduğu öğretildi.","a":"Marie Curie","c":"İnsan Sözü"},{"q":"Bir adamın dürüstlüğünün en iyi ölçüsü gelir vergisi beyannamesi değildir. Banyo baskülünün sıfır ayarı.","a":"Arthur C. Clarke","c":"İnsan Sözü"},{"q":"Herhangi bir özgürlüğün birdenbire kaybolması nadirdir.","a":"David Hume","c":"İnsan Sözü"},{"q":"Kendi adıma geleceğe dair bilgi sahibi olmanın dezavantaj olacağını düşünüyorum.","a":"Marcus Tullius Cicero","c":"İnsan Sözü"},{"q":"Hindiler çiftleştiğinde aklına kuğu gelir.","a":"Johnny Carson","c":"İnsan Sözü"},{"q":"O halde bu gerçeği bilin, insanın yalnızca Erdem'in aşağıdaki mutluluk olduğunu bilmesi yeterlidir.","a":"Alexander Pope","c":"İnsan Sözü"},{"q":"Bu harika olmalı: Hiç anlamıyorum.","a":"Moliere","c":"İnsan Sözü"},{"q":"Aşk aşka gider, okul çocukları gibi kitaplarından, Ama aşk aşktan, ağır bakışlarla okula doğru.","a":"William Shakespeare","c":"İnsan Sözü"},{"q":"Kimse bir kadını yakışıklı ya da çirkin, aptal ya da zeki olduğu için sevmez. Sevdiğimiz için seviyoruz.","a":"Honore de Balzac","c":"İnsan Sözü"},{"q":"Önlenemeyen kötülüklerden en iyi şekilde faydalanmalıyız.","a":"Alexander Hamilton","c":"İnsan Sözü"},{"q":"Olduğumuz her şey, düşündüklerimizin sonucudur.","a":"Buddha","c":"İnsan Sözü"},{"q":"Hayatta gördüğümüzü sandığımız değişimlerin çoğu, gerçeklerin lehte ve lehte olmasından kaynaklanıyor.","a":"Robert Frost","c":"İnsan Sözü"},{"q":"Kimse ceza görmeden insana iyilik yapmaz.","a":"Auguste Rodin","c":"İnsan Sözü"},{"q":"Keşfedildikten sonra tüm gerçeklerin anlaşılması kolaydır; önemli olan onları keşfetmektir.","a":"Galileo Galilei","c":"İnsan Sözü"},{"q":"Gerçekte son sözü silahsız gerçeğin ve koşulsuz sevginin söyleyeceğine inanıyorum.","a":"Martin Luther King","c":"İnsan Sözü"},{"q":"Seni güzelliğin için seviyorum; çirkin olmama rağmen beni sev.","a":"Miguel de Cervantes","c":"İnsan Sözü"},{"q":"Hayata değil, iyi hayata öncelikle değer verilmelidir.","a":"Socrates","c":"İnsan Sözü"},{"q":"Özgürlük pratikte konuşmalarda olduğu kadar işe yaramıyor.","a":"Will Rogers","c":"İnsan Sözü"},{"q":"Tek bir şeyi yapmaktan kaçınırsanız ideal bir hayat yaşarız: Düşünme.","a":"Ronald Reagan","c":"İnsan Sözü"},{"q":"Kamuoyu her hükümete sınır koyar ve her özgür hükümette gerçek egemendir.","a":"James Madison","c":"İnsan Sözü"},{"q":"Önce en iyi kitapları okuyun, yoksa hepsini okuma şansınız olmayabilir.","a":"Henry David Thoreau","c":"İnsan Sözü"},{"q":"İnsanlığın ilerlemesinin önündeki daimi engel gelenektir.","a":"John Stuart Mill","c":"İnsan Sözü"},{"q":"Dört şey olmasaydı daha iyi olurdum: aşk, merak, çiller ve şüphe.","a":"Dorothy Parker","c":"İnsan Sözü"},{"q":"İlerleme sanatı, değişimin ortasında düzeni korumak ve düzenin ortasında değişimi korumaktır.","a":"Alfred North Whitehead","c":"İnsan Sözü"},{"q":"Sanatın bir propaganda biçimi olmadığını, bir hakikat biçimi olduğunu asla unutmamalıyız.","a":"John F. Kennedy","c":"İnsan Sözü"},{"q":"Üniversite eğitiminin faydalarından biri de küçük çocuğa bunun pek işe yaramadığını göstermektir.","a":"James Thurber","c":"İnsan Sözü"},{"q":"Mühendislik bölümleri: pek sevişmiyoruz ama geleceği inşa ediyoruz.","a":"Robin Williams","c":"İnsan Sözü"},{"q":"Kendimiz gibi düşünüyoruz, çünkü esas olarak başkaları da öyle düşünüyor.","a":"Samuel Butler","c":"İnsan Sözü"},{"q":"Mücadele olmazsa ilerleme olmaz.","a":"Frederick Douglass","c":"İnsan Sözü"},{"q":"Konuşup tüm şüpheleri ortadan kaldırmaktansa susup aptal sanılmak daha iyidir.","a":"Abraham Lincoln","c":"İnsan Sözü"},{"q":"Onu en son gördüğümde Aşıklar Yolu'nda kendi elini tutarak yürüyordu.","a":"Fred Allen","c":"İnsan Sözü"},{"q":"Bazı filozofların bir zamanlar söylemediği kadar saçma veya gülünç hiçbir şey yoktur.","a":"Oliver Goldsmith","c":"İnsan Sözü"},{"q":"Hayatın en büyük trajedisi insanların yok olması değil, sevmeyi bırakmalarıdır.","a":"W. Somerset Maugham","c":"İnsan Sözü"},{"q":"Başaramayacağından korkan kişi kıpırdamadan oturdu. (Başarısızlık korkusuyla hiçbir şey yapmadı.)","a":"Horace","c":"İnsan Sözü"},{"q":"Sanat uzun, hayat kısa; yargılamak zordur, fırsatlar geçicidir.","a":"Johann Wolfgang von Goethe","c":"İnsan Sözü"},{"q":"Beni hedefime ulaştıran sırrı söyleyeyim sana. Gücüm yalnızca azmimde yatıyor.","a":"Louis Pasteur","c":"İnsan Sözü"},{"q":"Her şey başlangıçta daha iyidir.","a":"Blaise Pascal","c":"İnsan Sözü"},{"q":"Kelimeler hastalıklı bir zihnin hekimleridir.","a":"Aeschylus","c":"İnsan Sözü"},{"q":"Bilgelik hiçbir zaman bağnazlık yaratmamıştır ama öğrenmek yapmıştır.","a":"Josh Billings","c":"İnsan Sözü"},{"q":"İnsanoğlunun uyarı almadığı halde öğüt almasını beklemek nasıl mümkün olabilir?","a":"Jonathan Swift","c":"İnsan Sözü"},{"q":"Eylem her zaman mutluluk getirmeyebilir ama eylemsiz mutluluk olmaz.","a":"Benjamin Disraeli","c":"İnsan Sözü"},{"q":"Hayat sanatı, sanatın hayatı taklit ettiğinden çok daha fazla taklit eder.","a":"Oscar Wilde","c":"İnsan Sözü"},{"q":"Kızamık gibi aşk da en tehlikelisidir, geç geldiğinde.","a":"Lord Byron","c":"İnsan Sözü"},{"q":"Bekaretin bir erdem olabileceğini hayal etmek insan aklının batıl inançlarından biridir.","a":"Voltaire","c":"İnsan Sözü"},{"q":"Fikir, hayal gücüyle kurtuluştur.","a":"Frank Lloyd Wright","c":"İnsan Sözü"},{"q":"Ne zaman bir arkadaşım başarılı olsa içimde bir şeyler ölüyor.","a":"Gore Vidal","c":"İnsan Sözü"},{"q":"İnsanlar hayatla dürüst ve cesurca karşılaşırlarsa deneyimleyerek büyürler. Karakter bu şekilde inşa edilir.","a":"Eleanor Roosevelt","c":"İnsan Sözü"},{"q":"Gerçeği bileceksiniz ve gerçek sizi deli edecek.","a":"Aldous Huxley","c":"İnsan Sözü"},{"q":"Herkes bir şeye inanmalı. Sanırım bir içki daha içeceğim.","a":"W. C. Fields","c":"İnsan Sözü"},{"q":"En etkili eğitim, çocuğun güzel şeyler arasında oynamasıdır.","a":"Plato","c":"İnsan Sözü"},{"q":"Yarının farkına varmamızın tek sınırı bugüne dair şüphelerimiz olacaktır.","a":"Franklin D. Roosevelt","c":"İnsan Sözü"},{"q":"Gerçek olmayı öğrenemezsin. Cüce olmayı öğrenmek gibi bir şey bu.","a":"Woody Allen","c":"İnsan Sözü"},{"q":"Eğitim, yaşlılığın en iyi güvencesidir.","a":"Aristotle","c":"İnsan Sözü"},{"q":"Kendini geliştirmek, kendini beğenmişliğin tehlikeli bir biçimidir.","a":"Alan Watts","c":"İnsan Sözü"},{"q":"Bilim organize bilgidir. Bilgelik organize yaşamdır.","a":"Immanuel Kant","c":"İnsan Sözü"},{"q":"Her zaman herkesin en iyisine inanmayı tercih ederim - bu pek çok beladan kurtarır.","a":"Rudyard Kipling","c":"İnsan Sözü"},{"q":"Hıristiyan yaşamı inanç ve hayırseverlikten oluşur.","a":"Martin Luther","c":"İnsan Sözü"},{"q":"TIME dergisinin kapağına çıkmak, gelecekte de muhalefetin varlığının garantisidir.","a":"John Kenneth Galbraith","c":"İnsan Sözü"},{"q":"Gücünü göstermenin iki yolu vardır: Biri aşağı itmek, diğeri yukarı çekmek.","a":"Booker T. Washington","c":"İnsan Sözü"},{"q":"Barış için savaşmak bekaret için sevişmeye benzer.","a":"George Carlin","c":"İnsan Sözü"},{"q":"Bir şeyler var değişimin sancısında Kalbin kaldıramayacağı kadar çok, Mutluluğu anan mutsuzluk.","a":"Euripides","c":"İnsan Sözü"},{"q":"Bir şeyleri yapmak fazla güç gerektirmez ama ne yapacağına karar vermek büyük güç gerektirir.","a":"Elbert Hubbard","c":"İnsan Sözü"},{"q":"Kurnazlık ve aldatma her zaman bir erkeğe güçten daha çok hizmet edecektir.","a":"Niccolo Machiavelli","c":"İnsan Sözü"},{"q":"Sevmek bu dünyayı bahçeye çeviren büyük muskadır.","a":"Robert Louis Stevenson","c":"İnsan Sözü"},{"q":"Sevginin olduğu yerde hayat vardır.","a":"Mahatma Gandhi","c":"İnsan Sözü"},{"q":"10 emirden 8'ine inanıyorum.","a":"Steve Martin","c":"İnsan Sözü"},{"q":"Hiç kimse, bir resmi boyamadan önce kafasında taşımadıkça kendisini sanatçı sayamaz.","a":"Claude Monet","c":"İnsan Sözü"},{"q":"Hayat insanın cesareti oranında daralır ya da genişler.","a":"Anais Nin","c":"İnsan Sözü"},{"q":"Düşünmeden öğrenmek emek kaybıdır; öğrenmeden düşünmek tehlikelidir.","a":"Confucius","c":"İnsan Sözü"},{"q":"O kadar çok seviyorum ki, onunla bütün ölümlere katlanabilirim, onsuz bir hayat yaşayamam.","a":"John Milton","c":"İnsan Sözü"},{"q":"Bana göre eski ustalar sanat değil; onların değeri kutsallıklarındadır.","a":"Thomas Edison","c":"İnsan Sözü"},{"q":"İyilik her zaman iyiliği doğurur.","a":"Sophocles","c":"İnsan Sözü"},{"q":"Hiç kimse arkadaşı olmadan mutlu olamaz, mutsuz oluncaya kadar da arkadaşından emin olamaz.","a":"Thomas Fuller","c":"İnsan Sözü"},{"q":"Aptallar gerçeğe karşı sağırdır; duyarlar ama bilgeliğin başka biri için geçerli olduğunu düşünürler.","a":"Heraclitus","c":"İnsan Sözü"},{"q":"Aşktan korkmak hayattan korkmaktır ve hayattan korkanlar zaten üç parça ölüdür.","a":"Bertrand Russell","c":"İnsan Sözü"},{"q":"Anlayışta yatan yetenek çoğu zaman doğuştan gelir; Akıl ve hayal gücünün eylemi olan deha, nadiren ya da asla.","a":"Samuel Taylor Coleridge","c":"İnsan Sözü"},{"q":"İnsanların düşündüklerini düşünmelerini sağlarsan seni severler; ama gerçekten senden nefret edeceklerini düşünmelerini sağlarsan.","a":"Don Marquis","c":"İnsan Sözü"},{"q":"Yüce dehaya sahip adamlar, en az işi yaptıklarında en aktif olanlardır.","a":"Leonardo da Vinci","c":"İnsan Sözü"},{"q":"Hayatın sunduğu en iyi ödül, kesinlikle yapmaya değer bir işte çok çalışma şansıdır.","a":"Theodore Roosevelt","c":"İnsan Sözü"},{"q":"Gerçek, güçlü ve sağlam akıl, büyük ve küçük şeyleri eşit derecede kucaklayabilen akıldır.","a":"Samuel Johnson","c":"İnsan Sözü"},{"q":"Beceri ve özgüven fethedilmemiş bir ordudur.","a":"George Herbert","c":"İnsan Sözü"},{"q":"Söz, amelin gölgesidir.","a":"Democritus","c":"İnsan Sözü"},{"q":"Eğer cevap aşksa soruyu başka bir şekilde ifade edebilir misin?","a":"Lily Tomlin","c":"İnsan Sözü"},{"q":"Gerçek sanat eseri ilahi mükemmelliğin gölgesinden başka bir şey değildir.","a":"Michelangelo","c":"İnsan Sözü"},{"q":"Anlamak imanın ödülüdür. Bu nedenle inanabileceğinizi anlamaya çalışmayın, anlayabileceğinize inanın.","a":"Augustine of Hippo","c":"İnsan Sözü"},{"q":"İster yapabileceğinizi, ister yapamayacağınızı düşünün, genellikle haklısınız.","a":"Henry Ford","c":"İnsan Sözü"},{"q":"Sorularınızı şimdi yaşayın ve belki de farkında olmadan, uzak bir gün boyunca cevaplarınızı yaşayacaksınız.","a":"Rainer Maria Rilke","c":"İnsan Sözü"},{"q":"İnatlaşmanın nedeni çoğu zaman dar görüşlülüktür: Gördüklerimizin ötesine kolay kolay inanmayız.","a":"François de La Rochefoucauld","c":"İnsan Sözü"},{"q":"İki tür sanat vardır: 1. Dekoratif, nesnel olmayan, duvar kağıdı sanatı; ve 2. Ahlaki amacı olan sanat.","a":"Edward Abbey","c":"İnsan Sözü"},{"q":"Büyümenin en güçlü prensibi insanın tercihinde yatmaktadır.","a":"George Eliot","c":"İnsan Sözü"},{"q":"Yenilgi nedir? Eğitimden başka bir şey yok, daha iyi bir şeye doğru atılan ilk adımdan başka bir şey değil.","a":"Wendell Phillips","c":"İnsan Sözü"},{"q":"Tükürsem tükürüğümü alıp onu büyük sanat diye çerçeveleyecekler.","a":"Pablo Picasso","c":"İnsan Sözü"},{"q":"Tek bir başarı vardır; hayatınızı kendi istediğiniz gibi geçirebilmek.","a":"Christopher Morley","c":"İnsan Sözü"},{"q":"Başarılı bir adam olmaya değil, değerli bir adam olmaya çalışın.","a":"Albert Einstein","c":"İnsan Sözü"},{"q":"Kedi pekâlâ insanın en iyi arkadaşı olabilir ama bunu asla kabul etmekten çekinmez.","a":"Doug Larson","c":"İnsan Sözü"},{"q":"Bir saatini boşa harcamaya cesaret eden adam, hayatın değerini keşfetmemiştir.","a":"Charles Darwin","c":"İnsan Sözü"},{"q":"Hem söz söyleyen, hem de amel yapan olun.","a":"Homer","c":"İnsan Sözü"},{"q":"Zamanı gelmiş bir fikirden daha güçlü bir şey yoktur.","a":"Victor Hugo","c":"İnsan Sözü"},{"q":"Başkalarının ilmiyle bilgili olabiliriz ama başka insanların ilmiyle bilge olamayız.","a":"Michel de Montaigne","c":"İnsan Sözü"},{"q":"Bugün hazırlıklı olmayan, yarın da hazırlıksız olacaktır.","a":"Ovid","c":"İnsan Sözü"},{"q":"Her şeye rağmen hala insanların gerçekten iyi kalpli olduğuna inanıyorum.","a":"Anne Frank","c":"İnsan Sözü"},{"q":"Evlilik sevgisi insanoğlunu yaratır, dost sevgisi onu mükemmelleştirir; ama ahlaksız aşk onu yozlaştırır ve yüceltir.","a":"Francis Bacon","c":"İnsan Sözü"},{"q":"Bu dünyada bizi zengin yapan aldıklarımız değil vazgeçtiklerimizdir.","a":"Henry Ward Beecher","c":"İnsan Sözü"},{"q":"İçki içmek insanları o kadar aptal durumuna düşürüyor ki, insanlar başlangıçta o kadar aptal ki, bu bir ağır suçu daha da artırıyor.","a":"Robert Benchley","c":"İnsan Sözü"},{"q":"Aynı anda düşünüp vuramazsın.","a":"Yogi Berra","c":"İnsan Sözü"},{"q":"Özgürlük daha iyi olma şansından başka bir şey değildir.","a":"Albert Camus","c":"İnsan Sözü"},{"q":"Büyük bir servet, büyük bir köleliktir.","a":"Seneca","c":"İnsan Sözü"},{"q":"Her yöne sessizce yürüyün ve dağcının özgürlüğünü tadın.","a":"John Muir","c":"İnsan Sözü"},{"q":"Uğrunda savaşmak zorunda kalsak bile barışa kavuşacağız.","a":"Dwight D. Eisenhower","c":"İnsan Sözü"},{"q":"En iyi eğitimli insan, içinde bulunduğu hayatı en iyi anlayandır.","a":"Helen Keller","c":"İnsan Sözü"},{"q":"Yapabiliyorlar çünkü yapabileceklerini düşünüyorlar.","a":"Virgil","c":"İnsan Sözü"},{"q":"Okumak zihne ancak bilgi malzemesi sağlar; okuduklarımızı bize ait kılan şey düşünmektir.","a":"John Locke","c":"İnsan Sözü"},{"q":"Bir hayat, iki Sonsuzluk arasında küçük bir zaman parıltısı.","a":"Thomas Carlyle","c":"İnsan Sözü"},{"q":"Bütün umutlarınızı bırakın, buraya girenler!","a":"Dante Alighieri","c":"İnsan Sözü"},{"q":"Klasik sanat, zorunluluğun sanatıydı; modern romantik sanat kaprisin ve değişimin damgasını taşıyor.","a":"Ralph Waldo Emerson","c":"İnsan Sözü"},{"q":"Dürüstlük, bilgelik kitabının ilk bölümüdür.","a":"Thomas Jefferson","c":"İnsan Sözü"},{"q":"Her şeyden önce güzel yemekler vermeyi ihmal etmeyin ve kadınlara ilgi gösterin.","a":"Napoleon Bonaparte","c":"İnsan Sözü"},{"q":"İlhamınızı ve hayal gücünüzü söndürmeyin; Modelinizin kölesi olmayın.","a":"Vincent van Gogh","c":"İnsan Sözü"},{"q":"Okumaya, düşünmeye, konuşmaya ve yazmaya cesaret edelim.","a":"John Adams","c":"İnsan Sözü"},{"q":"Önemli olan insanların ne düşündüğü değil, ne düşündükleridir.","a":"Eugene Ionesco","c":"İnsan Sözü"},{"q":"Fanatik, fikrini değiştiremeyen ve konuyu değiştirmeyen kişidir.","a":"Winston Churchill","c":"İnsan Sözü"},{"q":"Günlerini yaşayanın ömrü uzun olmuştur.","a":"Lao Tzu","c":"İnsan Sözü"},{"q":"Yaratılıştaki herhangi bir şey, alçakgönüllü ve minnettar bir zihne bir İlahi Takdiri göstermek için yeterlidir.","a":"Epictetus","c":"İnsan Sözü"},{"q":"Mutlu bir diyet yapanın başka sorunları olduğunu bilin.","a":"Erma Bombeck","c":"İnsan Sözü"},{"q":"Tüm yaşamın amacı ölümdür.","a":"Sigmund Freud","c":"İnsan Sözü"},{"q":"Eğitimin temel amacı bir şeyler öğrenmek değil, öğrendiklerini unutmaktır.","a":"Gilbert K. Chesterton","c":"İnsan Sözü"},{"q":"Orta yaş, hafifliğin olmadığı gençliktir. Ve çürümeden yaşlılık.","a":"Daniel Defoe","c":"İnsan Sözü"},{"q":"Olmadığınız biri olarak sevilmektense, olduğunuz biri olarak nefret edilmek daha iyidir.","a":"Andre Gide","c":"İnsan Sözü"},{"q":"Aklı başında' olan bir adam, içindeki deliyi kilit altında tutan kişidir.","a":"Paul Valery","c":"İnsan Sözü"},{"q":"Kehanet sanatı özellikle gelecekle ilgili olarak çok zordur.","a":"Mark Twain","c":"İnsan Sözü"},{"q":"Hayatının her eylemini sanki son eyleminmiş gibi gerçekleştir.","a":"Marcus Aurelius","c":"İnsan Sözü"},{"q":"Yalan, Rabbin katında mekruhtur ve sıkıntı anında anında gelen bir yardımdır.","a":"Adlai Stevenson","c":"İnsan Sözü"},{"q":"Doğa bizi asla aldatmaz; kendimizi aldatan daima biziz.","a":"Jean-Jacques Rousseau","c":"İnsan Sözü"},{"q":"Gerçekten katılmaya değer olan derslere katılımı zorlamak için hiçbir disipline gerek yoktur.","a":"Adam Smith","c":"İnsan Sözü"},{"q":"Her millet diğer milletlerle alay eder ve hepsi haklıdır.","a":"Arthur Schopenhauer","c":"İnsan Sözü"},{"q":"Değişimden en çok korkanlar en mutsuz insanlardır.","a":"Mignon McLaughlin","c":"İnsan Sözü"},{"q":"Köpeğin dışında kitap insanın en iyi arkadaşıdır ve köpeğin içi okunamayacak kadar karanlıktır.","a":"Groucho Marx","c":"İnsan Sözü"},{"q":"Bizim saygınlığımız yaptıklarımızda değil, anladıklarımızdadır.","a":"George Santayana","c":"İnsan Sözü"},{"q":"Şu anda hem hafıza kaybı hem de dejavu yaşıyorum. Sanırım bunu daha önce unuttum.","a":"Steven Wright","c":"İnsan Sözü"},{"q":"Güvenli bir mesafeden cesur olmak kolaydır.","a":"Aesop","c":"İnsan Sözü"},{"q":"KEHANET, n. Gelecekteki teslimat için kişinin güvenilirliğini satma sanatı ve uygulaması.","a":"Ambrose Bierce","c":"İnsan Sözü"},{"q":"Hayatın yaşamaya değer olduğuna inanın, inancınız bu gerçeğin oluşmasına yardımcı olacaktır.","a":"William James","c":"İnsan Sözü"},{"q":"Hakikatten ölmeme sanatımız var.","a":"Friedrich Nietzsche","c":"İnsan Sözü"},{"q":"Bugünün yumurtası, yarınki tavuktan iyidir.","a":"Benjamin Franklin","c":"İnsan Sözü"},{"q":"Bu sabah aklıma harika bir fikir geldi ama hoşuma gitmedi.","a":"Samuel Goldwyn","c":"İnsan Sözü"},{"q":"Rüzgar estiğinde onun uğultusuna tapın.","a":"Pythagoras","c":"İnsan Sözü"},{"q":"Hiçbir soru, cevabı belli olan bir soru kadar zor değildir.","a":"George Bernard Shaw","c":"İnsan Sözü"},{"q":"İnsan ne yapıldığını asla fark etmiyor; yalnızca yapılması gerekenleri görebiliriz.","a":"Marie Curie","c":"İnsan Sözü"},{"q":"Politikacılar western ve polisiye öyküler değil, bilim kurgu okumalıdır.","a":"Arthur C. Clarke","c":"İnsan Sözü"},{"q":"Sanat bir elbise yapabilir ama Doğa bir adam üretmelidir.","a":"David Hume","c":"İnsan Sözü"},{"q":"Hayat olduğu sürece umut da vardır.","a":"Marcus Tullius Cicero","c":"İnsan Sözü"},{"q":"Aşk ve şehvet arasındaki fark, şehvetin hiçbir zaman iki yüz dolardan fazlaya mal olmamasıdır.","a":"Johnny Carson","c":"İnsan Sözü"},{"q":"Dryden'ın çok istediği ya da unuttuğu son ve en büyük sanat, lekeleme sanatı.","a":"Alexander Pope","c":"İnsan Sözü"},{"q":"Erdemin olmadığı yerde doğum hiçbir şeydir.","a":"Moliere","c":"İnsan Sözü"},{"q":"Yiğitliğin en iyi kısmı sağduyulu olmaktır; daha iyi olan kısmında hayatımı kurtardım.","a":"William Shakespeare","c":"İnsan Sözü"},{"q":"Erdem belki de ruhun nezaketinden başka bir şey değildir.","a":"Honore de Balzac","c":"İnsan Sözü"},{"q":"Toplumun ilk görevinin adalet olduğunu düşünüyorum.","a":"Alexander Hamilton","c":"İnsan Sözü"},{"q":"Bir insan ancak tüm canlılara merhamet ettiğinde asildir.","a":"Buddha","c":"İnsan Sözü"},{"q":"Hayatta gördüğümüz değişimlerin çoğu, gerçeklerin lehte ve lehte olmasından kaynaklanıyor.","a":"Robert Frost","c":"İnsan Sözü"},{"q":"Hiçbir şey icat etmiyorum. yeniden keşfediyorum.","a":"Auguste Rodin","c":"İnsan Sözü"},{"q":"İspatlı olana inanmayı sapkınlık haline getirmek elbette nefislere zarar verir.","a":"Galileo Galilei","c":"İnsan Sözü"},{"q":"Bir adam uğruna öleceği bir şeyi keşfetmemişse yaşamaya uygun değildir.","a":"Martin Luther King","c":"İnsan Sözü"},{"q":"Dürüstlük en iyi politikadır.","a":"Miguel de Cervantes","c":"İnsan Sözü"},{"q":"Alfabe öğrenenlerin ruhunda unutkanlık yaratacak. Yazılı karakterlere güvenecekler ve kendilerini hatırlamayacaklar.","a":"Socrates","c":"İnsan Sözü"},{"q":"Okuduğunuz hiçbir şeye ve gördüklerinizin yalnızca yarısına inanmayın.","a":"Will Rogers","c":"İnsan Sözü"},{"q":"Hükümetin en iyi görüntüsü, siz ondan uzaklaşırken dikiz aynasındadır.","a":"Ronald Reagan","c":"İnsan Sözü"},{"q":"Zulüm ve Zulüm bu topraklara gelirse, bu yabancı bir düşmanla mücadele kılığında olacaktır.","a":"James Madison","c":"İnsan Sözü"},{"q":"Hayatını yaşa, işini yap, sonra şapkanı al.","a":"Henry David Thoreau","c":"İnsan Sözü"},{"q":"Dil aklın ışığıdır.","a":"John Stuart Mill","c":"İnsan Sözü"},{"q":"Her aşk bir önceki aşktır, daha donuk bir elbiseyle.","a":"Dorothy Parker","c":"İnsan Sözü"},{"q":"Bilimin amacı karmaşık gerçeklerin en basit açıklamalarını aramaktır. Basitliği arayın ve ona güvenmeyin.","a":"Alfred North Whitehead","c":"İnsan Sözü"},{"q":"Asla korkudan müzakere etmeyelim ama müzakere etmekten de asla korkmayalım.","a":"John F. Kennedy","c":"İnsan Sözü"},{"q":"Bazı soruları bilmek, tüm cevapları bilmekten daha iyidir.","a":"James Thurber","c":"İnsan Sözü"},{"q":"Doğru olan, diğer her şeyi yanlış yaparsanız geriye kalandır.","a":"Robin Williams","c":"İnsan Sözü"},{"q":"Hayat, yetersiz öncüllerden yeterli sonuçlara varma sanatıdır.","a":"Samuel Butler","c":"İnsan Sözü"},{"q":"Zalimlerin sınırları, karşı çıktıklarının dayanıklılığıyla belirlenir.","a":"Frederick Douglass","c":"İnsan Sözü"},{"q":"Düşmanınızı yok etmenin en iyi yolu onu dostunuz yapmaktır.","a":"Abraham Lincoln","c":"İnsan Sözü"},{"q":"Abartmaya izin verirseniz aklınızdan ne geçiyor?","a":"Fred Allen","c":"İnsan Sözü"},{"q":"İngiliz yasaları ahlaksızlığı cezalandırır; Çin yasaları daha fazlasını yapıyor, erdemi ödüllendiriyor.","a":"Oliver Goldsmith","c":"İnsan Sözü"},{"q":"Sağduyu ve doğa, hayat yolculuğunun zorlaşmaması için çok şey yapacaktır.","a":"W. Somerset Maugham","c":"İnsan Sözü"},{"q":"Gücünün neye eşit olduğunu ve yeteneğini aşan şeyleri düşün.","a":"Horace","c":"İnsan Sözü"},{"q":"Yapabildiğiniz veya yapabileceğinizi hayal ettiğiniz ne varsa başlayın. Cesaretin içinde deha, güç ve sihir vardır.","a":"Johann Wolfgang von Goethe","c":"İnsan Sözü"},{"q":"Şans yalnızca hazırlıklı zihinlerden yanadır.","a":"Louis Pasteur","c":"İnsan Sözü"},{"q":"Daha fazla zamanım olsaydı sana daha kısa bir mektup yazabilirdim.","a":"Blaise Pascal","c":"İnsan Sözü"},{"q":"En iyi görünmeyi değil, en iyi olmayı diliyorum.","a":"Aeschylus","c":"İnsan Sözü"},{"q":"Metafizik anlamadıklarımızı ispatlama bilimidir.","a":"Josh Billings","c":"İnsan Sözü"},{"q":"Ekmek hayatın asasıdır.","a":"Jonathan Swift","c":"İnsan Sözü"},{"q":"Bilgelerin bilgeliği ve asırların tecrübesi alıntılarla ölümsüzleştirilir.","a":"Benjamin Disraeli","c":"İnsan Sözü"},{"q":"Sanat hiçbir zaman popüler olmaya çalışmamalı. Halk kendini sanatsal kılmaya çalışmalı.","a":"Oscar Wilde","c":"İnsan Sözü"},{"q":"Hayalimin ruhunda bir değişiklik oldu.","a":"Lord Byron","c":"İnsan Sözü"},{"q":"Aşk, Doğanın döşediği, hayal gücünün işlediği bir kanvas desenidir.","a":"Voltaire","c":"İnsan Sözü"},{"q":"Bana hayatın lükslerini ver, ben de ihtiyaçlar olmadan seve seve yaparım.","a":"Frank Lloyd Wright","c":"İnsan Sözü"},{"q":"Narsist, senden daha iyi görünen kişidir.","a":"Gore Vidal","c":"İnsan Sözü"},{"q":"Gelecek, hayallerinin güzelliğine inananlarındır.","a":"Eleanor Roosevelt","c":"İnsan Sözü"},{"q":"Teknolojik ilerleme bize yalnızca geriye gitmenin daha etkili yollarını sağladı.","a":"Aldous Huxley","c":"İnsan Sözü"},{"q":"Uyku, içki dışında hayattaki en güzel deneyimdir.","a":"W. C. Fields","c":"İnsan Sözü"},{"q":"Sağlığa dikkat etmek hayattaki en büyük engeldir.","a":"Plato","c":"İnsan Sözü"},{"q":"İyi bir dövüş kadar sevdiğim hiçbir şey yok.","a":"Franklin D. Roosevelt","c":"İnsan Sözü"},{"q":"Fransız direnişindeki bu adamlar gerçekten cesurdu; sürekli Maurice Chevalier'in şarkı söylemesini dinlemek zorundaydılar.","a":"Woody Allen","c":"İnsan Sözü"},{"q":"Yaşamın nihai değeri, salt hayatta kalmaya değil, farkındalığa ve tefekkür gücüne bağlıdır.","a":"Aristotle","c":"İnsan Sözü"},{"q":"Kendini tanımlamaya çalışmak, kendi dişini ısırmaya çalışmak gibidir.","a":"Alan Watts","c":"İnsan Sözü"},{"q":"Kimse beni kendi yolunda mutlu olmaya zorlayamaz. Paternalizm en büyük despotizmdir.","a":"Immanuel Kant","c":"İnsan Sözü"},{"q":"Başarısızlık için kırk milyon nedenimiz var ama tek bir mazeretimiz yok.","a":"Rudyard Kipling","c":"İnsan Sözü"},{"q":"hurafenin, putperestliğin ve ikiyüzlülüğün bol kazancı vardır, ama gerçek dilenmeye devam eder.","a":"Martin Luther","c":"İnsan Sözü"},{"q":"Politika mümkün olanın sanatı değildir. Felaketle nahoş arasında seçim yapmaktan ibarettir.","a":"John Kenneth Galbraith","c":"İnsan Sözü"},{"q":"Bir adamı onun yanında kalmadan onu bastıramazsınız.","a":"Booker T. Washington","c":"İnsan Sözü"},{"q":"Hediye yok. Sadece yakın gelecek ve yakın geçmiş var.","a":"George Carlin","c":"İnsan Sözü"},{"q":"Akıllılık bilgelik değildir.","a":"Euripides","c":"İnsan Sözü"},{"q":"Bir makine elli sıradan adamın işini yapabilir. Hiçbir makine olağanüstü bir adamın işini yapamaz.","a":"Elbert Hubbard","c":"İnsan Sözü"},{"q":"Korkulmak sevilmekten daha iyidir, basiretli olmak merhametli olmaktan daha iyidir.","a":"Niccolo Machiavelli","c":"İnsan Sözü"},{"q":"Hayattaki işimiz başarılı olmak değil, başarısızlığa moralle devam etmektir.","a":"Robert Louis Stevenson","c":"İnsan Sözü"},{"q":"İyi insan tüm canlıların dostudur.","a":"Mahatma Gandhi","c":"İnsan Sözü"},{"q":"Eşitliğe inanıyorum. Herkes için eşitlik. Ne kadar aptal olsalar da, ben onlardan ne kadar üstün olsam da.","a":"Steve Martin","c":"İnsan Sözü"},{"q":"Tek anormallik sevememek.","a":"Anais Nin","c":"İnsan Sözü"},{"q":"Öğrenip düşünmeyen kaybolmuştur! Düşünen ama öğrenmeyen kişi büyük tehlike altındadır.","a":"Confucius","c":"İnsan Sözü"},{"q":"Ama ah ne ağır değişiklik, şimdi gittin, Artık gittin ve bir daha geri dönmemelisin!","a":"John Milton","c":"İnsan Sözü"},{"q":"Fırsat çoğu insan tarafından kaçırılıyor çünkü tulum giyiliyor ve iş gibi görünüyor.","a":"Thomas Edison","c":"İnsan Sözü"},{"q":"Bilgeliğin olmadığı yerde mutluluk da olmaz.","a":"Sophocles","c":"İnsan Sözü"},{"q":"Eylem bilginin en uygun meyvesidir.","a":"Thomas Fuller","c":"İnsan Sözü"},{"q":"Bilgeliği sevenler aslında pek çok şeyi araştıran kişiler olmalıdır.","a":"Heraclitus","c":"İnsan Sözü"},{"q":"Doğru bakıldığında matematik yalnızca gerçeğe değil, aynı zamanda yüce bir güzelliğe de sahiptir; heykelinki gibi soğuk ve katı bir güzelliğe.","a":"Bertrand Russell","c":"İnsan Sözü"},{"q":"İnsanın usta olması gereken bir sanat vardır: Düşünme sanatı.","a":"Samuel Taylor Coleridge","c":"İnsan Sözü"},{"q":"Sıkıntı zamanımızda, derdimiz olmadığında her zaman rahatlatıcı bir düşünce vardır.","a":"Don Marquis","c":"İnsan Sözü"},{"q":"Tüm bilgilerimizin kökeni algılarımızdadır.","a":"Leonardo da Vinci","c":"İnsan Sözü"},{"q":"Ülkenin onurunun yurt içinde ve yurt dışında yüceltilmesi gerekiyor.","a":"Theodore Roosevelt","c":"İnsan Sözü"},{"q":"İlimsiz dürüstlük zayıf ve faydasız, doğruluksuz ilim ise tehlikeli ve korkunçtur.","a":"Samuel Johnson","c":"İnsan Sözü"},{"q":"En iyi ayna eski bir dosttur.","a":"George Herbert","c":"İnsan Sözü"},{"q":"Eğer hakikat güzellikse neden kütüphanede kimse saçını yaptırmadı?","a":"Lily Tomlin","c":"İnsan Sözü"},{"q":"Önemsiz şeyler mükemmelliği yaratır ve mükemmelliğin kendisi önemsiz değildir.","a":"Michelangelo","c":"İnsan Sözü"},{"q":"Bu duruma nasıl geldiğimi bilmiyorum, buna ölen bir hayat mı diyeceğim yoksa yaşayan bir ölüm mü?","a":"Augustine of Hippo","c":"İnsan Sözü"},{"q":"Paradan başka bir şey kazandırmayan bir iş, kötü bir iştir.","a":"Henry Ford","c":"İnsan Sözü"},{"q":"Umut ne kadar aldatıcı olsa da bizi hayatın sonuna kadar tatlı bir şekilde taşıyor.","a":"François de La Rochefoucauld","c":"İnsan Sözü"},{"q":"Harika sanat asla mükemmel değildir; mükemmel sanat asla mükemmel değildir.","a":"Edward Abbey","c":"İnsan Sözü"},{"q":"Hepimiz dünyanın bizim hakkımızda inandığına inanma eğilimindeyiz.","a":"George Eliot","c":"İnsan Sözü"},{"q":"İhtiyaçlar, onları karşılamak ve fethetmek için gerekli yeteneği yaratır.","a":"Wendell Phillips","c":"İnsan Sözü"},{"q":"Sanat ruhtan gündelik hayatın tozunu alıp götürür.","a":"Pablo Picasso","c":"İnsan Sözü"},{"q":"Kitapların asıl amacı zihni kendi düşünmesini yapma tuzağına düşürmektir.","a":"Christopher Morley","c":"İnsan Sözü"},{"q":"Öğrenmeme engel olan tek şey eğitimim.","a":"Albert Einstein","c":"İnsan Sözü"},{"q":"Bilgelik, konuşmayı tercih ederken, ömür boyu dinlediğiniz için aldığınız ödüldür.","a":"Doug Larson","c":"İnsan Sözü"},{"q":"Ahlakın tamamını oluşturmalıyım ya da oluşturmamalıyım.","a":"Charles Darwin","c":"İnsan Sözü"},{"q":"Bir kere zarar verildi mi bunu bir aptal bile anlar.","a":"Homer","c":"İnsan Sözü"},{"q":"Zamanı gelen fikir, güçlü orduların adımlarından daha büyüktür.","a":"Victor Hugo","c":"İnsan Sözü"},{"q":"Güçlü bir hafızaya genellikle zayıf muhakeme eşlik eder.","a":"Michel de Montaigne","c":"İnsan Sözü"},{"q":"Kanatlı zaman farkına varmadan akıp gidiyor ve bizi aldatıyor; ve yıllardan daha geçici bir şey yoktur.","a":"Ovid","c":"İnsan Sözü"},{"q":"Refah en iyi kötülüğü keşfeder; ama erdemi en iyi şekilde zorluklar keşfeder.","a":"Francis Bacon","c":"İnsan Sözü"},{"q":"Cahil sınıflar tehlikeli sınıflardır.","a":"Henry Ward Beecher","c":"İnsan Sözü"},{"q":"Serbest çalışan, kelime başına, parça başına veya belki de ödeme alan kişidir.","a":"Robert Benchley","c":"İnsan Sözü"},{"q":"Her zaman kazanamazsınız. Senden daha iyi olan adamlar var.","a":"Yogi Berra","c":"İnsan Sözü"},{"q":"İnsanlara para olmadan da mutlu olabileceklerini düşündüren bir tür manevi züppeliktir bu.","a":"Albert Camus","c":"İnsan Sözü"},{"q":"Felaket erdemin fırsatıdır.","a":"Seneca","c":"İnsan Sözü"},{"q":"Hayatım bir buzul gibiydi, yavaş yavaş ilerliyordu.","a":"John Muir","c":"İnsan Sözü"},{"q":"Son seçimde bir askerin çantası bir mahkumun zincirleri kadar ağır değildir.","a":"Dwight D. Eisenhower","c":"İnsan Sözü"},{"q":"Hayat büyük bir maceradır ya da hiçbir şeydir.","a":"Helen Keller","c":"İnsan Sözü"},{"q":"Çünkü yapabileceklerine inananları fethedebilirler.","a":"Virgil","c":"İnsan Sözü"},{"q":"Buradaki hiçbir insanın bilgisi tecrübesinin ötesine geçemez.","a":"John Locke","c":"İnsan Sözü"},{"q":"Büyük bir adam, büyüklüğünü diğer insanlara davranış şekliyle gösterir.","a":"Thomas Carlyle","c":"İnsan Sözü"},{"q":"Özgürlük, iradenin engellenmeden eyleme dönüştürülmesinden başka nedir ki?","a":"Dante Alighieri","c":"İnsan Sözü"},{"q":"Erdemin tek ödülü erdemdir; Bir arkadaşa sahip olmanın tek yolu arkadaş olmaktır.","a":"Ralph Waldo Emerson","c":"İnsan Sözü"},{"q":"En az yöneten hükümet en iyisidir, çünkü halkı kendini disipline eder.","a":"Thomas Jefferson","c":"İnsan Sözü"},{"q":"İnsanlar şikayet etmeyi bıraktığında düşünmeyi de bırakırlar.","a":"Napoleon Bonaparte","c":"İnsan Sözü"},{"q":"Yine de içimde sakin, saf bir ahenk ve müzik var.","a":"Vincent van Gogh","c":"İnsan Sözü"},{"q":"Sözün kötüye kullanılması, safsatanın, hilenin, partinin, hizipçiliğin, toplum bölünmesinin en büyük aracı olmuştur.","a":"John Adams","c":"İnsan Sözü"},{"q":"Zamanımızı ayıracak vaktimiz yok.","a":"Eugene Ionesco","c":"İnsan Sözü"},{"q":"Artık rahatlık ve rahatlığın zamanı değil. Cesaret etme ve dayanma zamanıdır.","a":"Winston Churchill","c":"İnsan Sözü"},{"q":"Büyük nehirler ve denizler, daha küçük yüzlerce nehir üzerinde nasıl hakimiyet kazandı? Onlardan daha aşağıda olmakla.","a":"Lao Tzu","c":"İnsan Sözü"},{"q":"Her sanat ve her fakülte, belli şeyleri asıl nesneleri olarak düşünür.","a":"Epictetus","c":"İnsan Sözü"},{"q":"Vesikalık fotoğrafınız gibi göründüğünüzde eve gitme zamanı geldi.","a":"Erma Bombeck","c":"İnsan Sözü"},{"q":"Hatadan hataya doğru insan tüm gerçeği keşfeder.","a":"Sigmund Freud","c":"İnsan Sözü"},{"q":"Kişi kozmosu anlayabilir ama egoyu asla; benlik herhangi bir yıldızdan daha uzaktadır.","a":"Gilbert K. Chesterton","c":"İnsan Sözü"},{"q":"Uzun süre kıyıyı gözden kaçırmaya razı olmadan yeni kıtalar keşfedilmez.","a":"Andre Gide","c":"İnsan Sözü"},{"q":"Siyaset, insanların kendilerini ilgilendiren meselelere katılmalarını engelleme sanatıdır.","a":"Paul Valery","c":"İnsan Sözü"},{"q":"Bu hayatta ihtiyacın olan tek şey cehalet ve kendine güven, o zaman başarı kesindir.","a":"Mark Twain","c":"İnsan Sözü"},{"q":"Hayatta olup biten her şeye hayret eden adam ne kadar da gülünç ve gerçek dışıdır.","a":"Marcus Aurelius","c":"İnsan Sözü"},{"q":"Amerikan halkına mantıklı konuşalım. Acı çekmeden kazanımın olmayacağını onlara anlatalım.","a":"Adlai Stevenson","c":"İnsan Sözü"},{"q":"İnsan pazarlık yapan bir hayvandır: Bunu başka hiçbir hayvan yapmaz; hiçbir köpek bir diğeriyle kemik alışverişinde bulunmaz.","a":"Adam Smith","c":"İnsan Sözü"},{"q":"Her insan kendi görüş alanının sınırlarını, dünyanın sınırlarını alır.","a":"Arthur Schopenhauer","c":"İnsan Sözü"},{"q":"Çok sık cesur olursan insanlar senden bunu beklemeye başlar.","a":"Mignon McLaughlin","c":"İnsan Sözü"},{"q":"Kime inanacaksın, bana mı yoksa kendi gözlerine mi?","a":"Groucho Marx","c":"İnsan Sözü"},{"q":"Konusuyla değil, kendisiyle ilgilenen sanat kadar zavallı ve melankolik bir şey yoktur.","a":"George Santayana","c":"İnsan Sözü"},{"q":"Maymun\" kelimesini milyon kez yazarsanız kendinizin Shakespeare olduğunu mu düşünmeye başlarsınız?","a":"Steven Wright","c":"İnsan Sözü"},{"q":"Ne kadar küçük olursa olsun hiçbir iyilik boşa gitmez.","a":"Aesop","c":"İnsan Sözü"},{"q":"Cogito cogito ergo cogito sum - \"Düşünüyorum, öyleyse var olduğumu düşünüyorum.","a":"Ambrose Bierce","c":"İnsan Sözü"},{"q":"Bugün ulaşabildiğimiz doğruları bugün yaşamalı ve yarın ona yalan demeye hazır olmalıyız.","a":"William James","c":"İnsan Sözü"},{"q":"Bilgelik bilgiye bile sınır koyar.","a":"Friedrich Nietzsche","c":"İnsan Sözü"},{"q":"Deneyim değerli bir okuldur ama aptallar başka hiçbir okulda öğrenemez. Ve bu konuda kıt.","a":"Benjamin Franklin","c":"İnsan Sözü"},{"q":"Bir bekarın hayatı, bekar bir adamın hayatı değildir.","a":"Samuel Goldwyn","c":"İnsan Sözü"},{"q":"Bir aptalın beyni felsefeyi çılgınlığa, bilimi batıl inançlara ve sanatı bilgiçliğe dönüştürür. Dolayısıyla üniversite eğitimi.","a":"George Bernard Shaw","c":"İnsan Sözü"},{"q":"Mümkün olanın sınırlarını keşfetmenin tek yolu, onların ötesine geçerek imkansıza doğru gitmektir.","a":"Arthur C. Clarke","c":"İnsan Sözü"},{"q":"Gerçek, arkadaşlar arasındaki tartışmadan doğar.","a":"David Hume","c":"İnsan Sözü"},{"q":"Öğrenmeden hayat ölümdür.","a":"Marcus Tullius Cicero","c":"İnsan Sözü"},{"q":"En çok sevdiğim Hollywood geleneğine \"yıldızlara yalakalık\" denir.","a":"Johnny Carson","c":"İnsan Sözü"},{"q":"Gençlikte ve güzellikte bilgelik nadirdir!","a":"Alexander Pope","c":"İnsan Sözü"},{"q":"Yalnızca bir kez ölürüz ve çok uzun bir süre boyunca.","a":"Moliere","c":"İnsan Sözü"},{"q":"Büyük bir adamın hafızasının altı ay ömründen daha uzun süre dayanabileceği umudu var.","a":"William Shakespeare","c":"İnsan Sözü"},{"q":"Ne kadar çok yargılarsan o kadar az seversin.","a":"Honore de Balzac","c":"İnsan Sözü"},{"q":"Ne kadar dürüst olursa olsun hiçbir karakter, ne kadar yanlış olursa olsun, sürekli yinelenen saldırılarla eşleşemez.","a":"Alexander Hamilton","c":"İnsan Sözü"},{"q":"Acı çekmenize neden olan 'olan'a karşı direncinizdir.","a":"Buddha","c":"İnsan Sözü"},{"q":"Atınızı ölmeden satmaya dikkat edin. Yaşam sanatı, kayıpların üstesinden gelmektir.","a":"Robert Frost","c":"İnsan Sözü"},{"q":"Ondan bir şey öğrenemeyecek kadar cahil bir adamla hiç tanışmadım.","a":"Galileo Galilei","c":"İnsan Sözü"},{"q":"Öğrenmeye düşkün olmak, bilgiye yakın olmaktır.","a":"Miguel de Cervantes","c":"İnsan Sözü"},{"q":"Tek iyilik bilgidir, tek kötülük ise cehalettir.","a":"Socrates","c":"İnsan Sözü"},{"q":"Kızların bugün yaptıkları yerlerde güneşten yanacakları günü görmeyi hiç beklemiyordum.","a":"Will Rogers","c":"İnsan Sözü"},{"q":"Kahramanlık hayalleri kurmaya her türlü hakkımız var. Sonuçta biz Amerikalıyız.","a":"Ronald Reagan","c":"İnsan Sözü"},{"q":"Hiçbir şey değişmiyor; biz değişiriz.","a":"Henry David Thoreau","c":"İnsan Sözü"},{"q":"Kendinize mutlu olup olmadığınızı sorun, artık mutlu olmayacaksınız.","a":"John Stuart Mill","c":"İnsan Sözü"},{"q":"Bir kızın en iyi arkadaşı mırıldanmasıdır.","a":"Dorothy Parker","c":"İnsan Sözü"},{"q":"Huzur dönemleri nadiren yaratıcı başarı açısından verimli olur. İnsanlığın harekete geçmesi gerekiyor.","a":"Alfred North Whitehead","c":"İnsan Sözü"},{"q":"Barışçıl devrimi imkansız hale getirirsek, şiddet içeren devrimi kaçınılmaz kılarız.","a":"John F. Kennedy","c":"İnsan Sözü"},{"q":"Çoğu insanı çok fazla kandırabilirsin.","a":"James Thurber","c":"İnsan Sözü"},{"q":"Gerçeklik - ne kavram!","a":"Robin Williams","c":"İnsan Sözü"},{"q":"Hayat, topluluk içinde keman çalmaya ve ilerledikçe enstrümanı öğrenmeye benzer.","a":"Samuel Butler","c":"İnsan Sözü"},{"q":"Sessiz kalıp aptal sayılmak, açıkça konuşup tüm şüpheleri ortadan kaldırmaktan daha iyidir.","a":"Abraham Lincoln","c":"İnsan Sözü"},{"q":"Ed Sullivan, başkası yetenekli olduğu sürece ortalıkta olacak.","a":"Fred Allen","c":"İnsan Sözü"},{"q":"En büyük ihtişamımız hiç düşmemek değil, her düştüğümüzde ayağa kalkabilmektir.","a":"Oliver Goldsmith","c":"İnsan Sözü"},{"q":"Hayal gücü egzersizle gelişir ve yaygın inanışın aksine olgunlarda gençlere göre daha güçlüdür.","a":"W. Somerset Maugham","c":"İnsan Sözü"},{"q":"Zorluklar karşısında sakin kalmayı unutmayın.","a":"Horace","c":"İnsan Sözü"},{"q":"Tüm zekice düşünceler zaten düşünülmüştür; gerekli olan sadece onları yeniden düşünmeye çalışmaktır.","a":"Johann Wolfgang von Goethe","c":"İnsan Sözü"},{"q":"Bilimsel gözlem alanında şans yalnızca hazırlıklı olanlara verilir.","a":"Louis Pasteur","c":"İnsan Sözü"},{"q":"Aşık olduğumuzda, daha önce olduğumuzdan oldukça farklı görünüyoruz.","a":"Blaise Pascal","c":"İnsan Sözü"},{"q":"Öğrenmek yaşlılar için bile her zaman gençlik tazeliğindedir.","a":"Aeschylus","c":"İnsan Sözü"},{"q":"Bugün keyif alabileceğiniz şeyleri yarına ertelemeyin.","a":"Josh Billings","c":"İnsan Sözü"},{"q":"Baykuştan korkmak için mi ormanda doğduğumu sanıyorsunuz?","a":"Jonathan Swift","c":"İnsan Sözü"},{"q":"Gözlemleyen bir zihin için eğlence, çalışmaktır.","a":"Benjamin Disraeli","c":"İnsan Sözü"},{"q":"Saf ve basit gerçek nadiren saftır ve asla basit değildir.","a":"Oscar Wilde","c":"İnsan Sözü"},{"q":"Tamamen rüya olmayan bir rüya gördüm.","a":"Lord Byron","c":"İnsan Sözü"},{"q":"Seni saçmalıklara inandırabilenler, sana vahşet yaptırabilirler.","a":"Voltaire","c":"İnsan Sözü"},{"q":"Gerçek, gerçeklerden daha önemlidir.","a":"Frank Lloyd Wright","c":"İnsan Sözü"},{"q":"Amerika Birleşik Devletleri'nde kitap okuması gereken kişilerin kitap yazdığı her zaman doğru olmuştur.","a":"Gore Vidal","c":"İnsan Sözü"},{"q":"Sanırım bir şekilde gerçekte kim olduğumuzu öğreniyoruz ve sonra bu kararla yaşıyoruz.","a":"Eleanor Roosevelt","c":"İnsan Sözü"},{"q":"Bütünlük, kırık parçalarda bile mevcut.","a":"Aldous Huxley","c":"İnsan Sözü"},{"q":"Her güne bir gülümsemeyle başlayın ve bitirin.","a":"W. C. Fields","c":"İnsan Sözü"},{"q":"Aşkın dokunuşuyla herkes şair olur.","a":"Plato","c":"İnsan Sözü"},{"q":"Bana her zaman sağduyunun en iyi sembolünün bir köprü olduğu düşünülmüştür.","a":"Franklin D. Roosevelt","c":"İnsan Sözü"},{"q":"Birinin ölümünü objektif olarak deneyimlemesi ve hala bir melodi taşıması imkansızdır.","a":"Woody Allen","c":"İnsan Sözü"},{"q":"Dindarlık, hakikati dostlardan üstün tutmamızı gerektirir.","a":"Aristotle","c":"İnsan Sözü"},{"q":"Ama sevgili dostum, gerçeklik yalnızca bir Rorschach mürekkep lekesinden ibaret, biliyorsun.","a":"Alan Watts","c":"İnsan Sözü"},{"q":"Dünya yok olsa da doğru olanı yapın.","a":"Immanuel Kant","c":"İnsan Sözü"},{"q":"Kendiniz dışında sevdiğiniz her şeyi ciddiye alın.","a":"Rudyard Kipling","c":"İnsan Sözü"},{"q":"Batıl inanç, putperestlik ve ikiyüzlülüğün bol kazancı var ama gerçek dileniyor.","a":"Martin Luther","c":"İnsan Sözü"},{"q":"Alçakgönüllülük fazlasıyla abartılan bir erdemdir.","a":"John Kenneth Galbraith","c":"İnsan Sözü"},{"q":"Şiir yazmak kadar tarla sürmek de onurludur.","a":"Booker T. Washington","c":"İnsan Sözü"},{"q":"Frizbetçilik, öldüğünüzde ruhunuzun çatıya çıkıp sıkışıp kaldığı inancıdır.","a":"George Carlin","c":"İnsan Sözü"},{"q":"Şans her zaman ihtiyatlı olanın yanında savaşır.","a":"Euripides","c":"İnsan Sözü"},{"q":"Tehlikeli olmayan bir fikir, fikir olarak adlandırılmaya kesinlikle değmez.","a":"Elbert Hubbard","c":"İnsan Sözü"},{"q":"Yoksulluklarına ve namuslarına dokunulmadığında insanların çoğunluğu hoşnut yaşar.","a":"Niccolo Machiavelli","c":"İnsan Sözü"},{"q":"Arkadaş kendinize verdiğiniz bir hediyedir.","a":"Robert Louis Stevenson","c":"İnsan Sözü"},{"q":"Korkunun faydası vardır ama korkaklığın faydası yoktur.","a":"Mahatma Gandhi","c":"İnsan Sözü"},{"q":"Bir kadını elbisesini görebileceğiniz kadar yüksek bir kaide üzerine yerleştirmeniz gerektiğine inanıyorum.","a":"Steve Martin","c":"İnsan Sözü"},{"q":"Hayaller yaşam için gereklidir.","a":"Anais Nin","c":"İnsan Sözü"},{"q":"Mutlulukta veya bilgelikte sabit olanların sık sık değişmesi gerekir.","a":"Confucius","c":"İnsan Sözü"},{"q":"Huzur ve huzurun asla barınamadığı yerde, umut asla gelmez Bu herkese gelir.","a":"John Milton","c":"İnsan Sözü"},{"q":"Hayattaki başarısızlıkların çoğu, başarıya ne kadar yaklaştıklarını fark edemeyip pes eden insanlardan kaynaklanır.","a":"Thomas Edison","c":"İnsan Sözü"},{"q":"İyilik, iyiliği doğurur.","a":"Sophocles","c":"İnsan Sözü"},{"q":"Yeterince cesaretleri olsaydı çoğu kişi korkak olurdu.","a":"Thomas Fuller","c":"İnsan Sözü"},{"q":"Zaman dama oynayan bir çocuktur: Krallık çocuğun elindedir.","a":"Heraclitus","c":"İnsan Sözü"},{"q":"İnsanlar düşünceden, dünyadaki başka hiçbir şeyden korkmadıkları kadar korkarlar; yıkımdan, hatta ölümden daha çok.","a":"Bertrand Russell","c":"İnsan Sözü"},{"q":"Siyasette korkuyla başlayan şey genellikle çılgınlıkla biter.","a":"Samuel Taylor Coleridge","c":"İnsan Sözü"},{"q":"İnsan ırkının ilerlemesinin önündeki en büyük engel insan ırkıdır.","a":"Don Marquis","c":"İnsan Sözü"},{"q":"Başlangıçta direnmek sonda direnmekten daha kolaydır.","a":"Leonardo da Vinci","c":"İnsan Sözü"},{"q":"Bir insanı ahlaken değil, zihnen eğitmek, topluma bir bela yetiştirmektir.","a":"Theodore Roosevelt","c":"İnsan Sözü"},{"q":"Cesaret, erdemi sürdürmek için çok gerekli olan ve kötülükle ilişkilendirilse bile her zaman saygı duyulan bir niteliktir.","a":"Samuel Johnson","c":"İnsan Sözü"},{"q":"İyi yaşamak en iyi intikamdır.","a":"George Herbert","c":"İnsan Sözü"},{"q":"Ne kadar alaycı olursanız olun, yetişmeniz imkansızdır.","a":"Lily Tomlin","c":"İnsan Sözü"},{"q":"Yararlı bir gerçeği gizleyen kişi, zararlı bir yalanı yayan kişi kadar suçludur.","a":"Augustine of Hippo","c":"İnsan Sözü"},{"q":"Düşünmek var olan en zor iştir ve bu kadar az kişinin bununla meşgul olmasının muhtemel nedeni de budur.","a":"Henry Ford","c":"İnsan Sözü"},{"q":"Yaşam ilişkilerinde çoğu zaman iyi niteliklerimizden çok kusurlarımızla hoşlanırız.","a":"François de La Rochefoucauld","c":"İnsan Sözü"},{"q":"İdam cezasının gerçek, kabul edilmeyen amacı, Devlete karşı korku ve huşu uyandırmaktır.","a":"Edward Abbey","c":"İnsan Sözü"},{"q":"Hiçbir şey önceden göründüğü kadar iyi değildir.","a":"George Eliot","c":"İnsan Sözü"},{"q":"Hıristiyanlık bir savaştır, bir rüya değil.","a":"Wendell Phillips","c":"İnsan Sözü"},{"q":"Sanat bize gerçeği fark ettiren yalandır.","a":"Pablo Picasso","c":"İnsan Sözü"},{"q":"Hayat yabancı bir dildir; bütün erkekler onu yanlış telaffuz ediyor.","a":"Christopher Morley","c":"İnsan Sözü"},{"q":"İşleri mümkün olduğunca basitleştirin, ancak daha basit değil.","a":"Albert Einstein","c":"İnsan Sözü"},{"q":"Kusurlu olmanın tek güzel yanı başkalarına verdiği mutluluktur.","a":"Doug Larson","c":"İnsan Sözü"},{"q":"Mavi gözlü kediler her zaman sağırdır.","a":"Charles Darwin","c":"İnsan Sözü"},{"q":"Alçakgönüllülüğün dilenciye faydası yoktur.","a":"Homer","c":"İnsan Sözü"},{"q":"Büyük tehlikelerin öyle bir güzelliği vardır ki, yabancıların kardeşliğini gün ışığına çıkarırlar.","a":"Victor Hugo","c":"İnsan Sözü"},{"q":"Hikmet inancı insanın vebasıdır.","a":"Michel de Montaigne","c":"İnsan Sözü"},{"q":"Cesaret her şeyin üstesinden gelir.","a":"Ovid","c":"İnsan Sözü"},{"q":"Erdem, zengin bir taş gibidir - en iyi sadelik.","a":"Francis Bacon","c":"İnsan Sözü"},{"q":"Her sanatçı fırçasını kendi ruhuna batırır, kendi doğasını resimlerine boyar.","a":"Henry Ward Beecher","c":"İnsan Sözü"},{"q":"Bir erkeği maymuna çevirmenin en kesin yolu ondan alıntı yapmaktır.","a":"Robert Benchley","c":"İnsan Sözü"},{"q":"Nasıl aynı anda düşünüp vurabiliyorsun?","a":"Yogi Berra","c":"İnsan Sözü"},{"q":"Deney yaparak tecrübe kazanamazsınız. Deneyim yaratamazsınız. Buna katlanmak zorundasın.","a":"Albert Camus","c":"İnsan Sözü"},{"q":"Deliliğin etkisinden arınmış büyük bir dahi yoktur.","a":"Seneca","c":"İnsan Sözü"},{"q":"Buzullar gelgitlerle hareket eder. Dağlar da öyle. Yani her şeyi yapın.","a":"John Muir","c":"İnsan Sözü"},{"q":"Sıradan bir erkeğin kadının eşit haklara sahip olmadığına inanması zor.","a":"Dwight D. Eisenhower","c":"İnsan Sözü"},{"q":"İnsan uçma dürtüsü hissettiğinde sürünmeye asla razı olamaz.","a":"Helen Keller","c":"İnsan Sözü"},{"q":"Zaman bir daha geri dönmemek üzere uçup gidiyor.","a":"Virgil","c":"İnsan Sözü"},{"q":"Her zaman erkeklerin eylemlerinin, düşüncelerinin en iyi tercümanı olduğunu düşünmüşümdür.","a":"John Locke","c":"İnsan Sözü"},{"q":"Erkekler arasında doğal bir aristokrasi vardır. Bunun temeli erdem ve yetenektir.","a":"Thomas Carlyle","c":"İnsan Sözü"},{"q":"Cesaretin büyük bir kısmı, o şeyi daha önce yapmış olmanın verdiği cesarettir.","a":"Ralph Waldo Emerson","c":"İnsan Sözü"},{"q":"Geleceğin hayallerini geçmişin tarihinden daha çok seviyorum.","a":"Thomas Jefferson","c":"İnsan Sözü"},{"q":"Fırsat olmadan yeteneğin pek bir önemi yoktur.","a":"Napoleon Bonaparte","c":"İnsan Sözü"},{"q":"Bir resimde rahatlatıcı bir şey söylemek istiyorum.","a":"Vincent van Gogh","c":"İnsan Sözü"},{"q":"Her insanın kendi çıkarının en iyi yargıcı olduğuna inanıyoruz.","a":"John Adams","c":"İnsan Sözü"},{"q":"Çağına aykırı düşünmek kahramanlıktır. Ama buna karşı konuşmak deliliktir.","a":"Eugene Ionesco","c":"İnsan Sözü"},{"q":"Yüce Allah, sonsuz hikmetiyle Fransızları İngilizlerin suretinde yaratmayı uygun görmedi.","a":"Winston Churchill","c":"İnsan Sözü"},{"q":"Zihnini boşaltmak ve karnını doldurmak akıllıcadır","a":"Lao Tzu","c":"İnsan Sözü"},{"q":"İnsan hayatta doğru tavrını koruduğunda, dış etkenlere pek fazla aldırış etmez. Ne alırdın, dostum?","a":"Epictetus","c":"İnsan Sözü"},{"q":"Arka arkaya üç futbol maçı izleyen herkesin beyin ölümü gerçekleştiği ilan edilmelidir.","a":"Erma Bombeck","c":"İnsan Sözü"},{"q":"İnsanlarda iyi olan çok az şey buldum. Tecrübelerime göre çoğu çöp.","a":"Sigmund Freud","c":"İnsan Sözü"},{"q":"Çok daha kötüleşen dünya değil, çok daha iyi olan haber kapsamı.","a":"Gilbert K. Chesterton","c":"İnsan Sözü"},{"q":"Uzun süre kıyıyı gözden kaçırmaya razı olmadan yeni topraklar keşfetmez insan.","a":"Andre Gide","c":"İnsan Sözü"},{"q":"Çağımızın sorunu geleceğin eskisi gibi olmaması.","a":"Paul Valery","c":"İnsan Sözü"},{"q":"Annem benimle çok dertleşti ama sanırım hoşuna gitti.","a":"Mark Twain","c":"İnsan Sözü"},{"q":"İnsanın başına, tabiatında katlanmak olanın dışında hiçbir şey gelmez.","a":"Marcus Aurelius","c":"İnsan Sözü"},{"q":"Cumhuriyetçiler Demokratlar hakkında yalan söylemeyi bırakırsa, biz de onlar hakkında gerçekleri söylemeyi bırakırız.","a":"Adlai Stevenson","c":"İnsan Sözü"},{"q":"İnsan endüstrisi kendi haline bırakılırsa doğal olarak en yararlı ve karlı istihdama giden yolu bulacaktır.","a":"Adam Smith","c":"İnsan Sözü"},{"q":"Diğer insanlar gibi olmak için dörtte üçümüzü kaybediyoruz.","a":"Arthur Schopenhauer","c":"İnsan Sözü"},{"q":"Gücümüz genellikle eğer göstereceksek lanetleneceğimiz zayıflığımızdan oluşur.","a":"Mignon McLaughlin","c":"İnsan Sözü"},{"q":"Beş yaşındaki bir çocuk bunu anlar. Beş yaşındaki bir çocuğu alması için birini gönderin.","a":"Groucho Marx","c":"İnsan Sözü"},{"q":"Fanatizm, amacınızı unuttuğunuzda çabanızı iki katına çıkarmaktır.","a":"George Santayana","c":"İnsan Sözü"},{"q":"Yeterli zamanınız varsa her şey yürüme mesafesindedir.","a":"Steven Wright","c":"İnsan Sözü"},{"q":"Küçük hırsızları asar, büyüklerini kamu görevine atarız.","a":"Aesop","c":"İnsan Sözü"},{"q":"Gelecek, n. İşlerimizin iyiye gittiği, dostlarımızın sadık olduğu ve mutluluğumuzun güvence altına alındığı dönem.","a":"Ambrose Bierce","c":"İnsan Sözü"},{"q":"Hayatın en büyük faydası, onu daha uzun süre dayanacak bir şey için harcamaktır.","a":"William James","c":"İnsan Sözü"},{"q":"Dünyada kibirli insanların hiçbirini çöpe atmaya yetecek kadar sevgi ve iyilik yok.","a":"Friedrich Nietzsche","c":"İnsan Sözü"},{"q":"Yüz yıl yaşayacakmış gibi çalış, yarın ölecekmiş gibi dua et.","a":"Benjamin Franklin","c":"İnsan Sözü"},{"q":"Bunu aklınızdan çıkarın. Kısa sürede unutulmuş bir anı olarak kalacak.","a":"Samuel Goldwyn","c":"İnsan Sözü"},{"q":"Bütün büyük gerçekler küfür olarak başlar.","a":"George Bernard Shaw","c":"İnsan Sözü"},{"q":"Yetenek ödünç alır, ancak deha çalar.","a":"Arthur C. Clarke","c":"İnsan Sözü"},{"q":"Hastanın hayatı olduğu sürece umut da vardır.","a":"Marcus Tullius Cicero","c":"İnsan Sözü"},{"q":"Ölümden sonraki üç gün boyunca saç ve tırnaklar uzamaya devam ediyor ancak telefon görüşmeleri azalıyor.","a":"Johnny Carson","c":"İnsan Sözü"},{"q":"Yine de zamanın öğrettiği kalbim, başkalarının iyiliği için parlamayı ve başkalarının acısıyla erimeyi öğrendi.","a":"Alexander Pope","c":"İnsan Sözü"},{"q":"Babam ve hiç evlenmemiş diğer atalarım gibi olmak isterdim.","a":"Moliere","c":"İnsan Sözü"},{"q":"Sevinçten ağlamak, sevinçten ağlamaktan ne kadar iyidir.","a":"William Shakespeare","c":"İnsan Sözü"},{"q":"Arkadaşlıklar, her arkadaşın diğerine göre biraz üstünlüğü olduğunu düşündüğünde sürer.","a":"Honore de Balzac","c":"İnsan Sözü"},{"q":"Toplumsal değerler ve alışkanlıklar ekonomik faaliyeti belirler, tam tersi değil.","a":"Alexander Hamilton","c":"İnsan Sözü"},{"q":"Ayak, yeri hissettiğinde ayağı hisseder.","a":"Buddha","c":"İnsan Sözü"},{"q":"Endişenin işten daha fazla insanı öldürmesinin nedeni, insanların işten daha fazla endişelenmesidir.","a":"Robert Frost","c":"İnsan Sözü"},{"q":"Ama hareket ediyor!","a":"Galileo Galilei","c":"İnsan Sözü"},{"q":"Bunun çok mutlu bir kaza olduğunu düşünüyorum.","a":"Miguel de Cervantes","c":"İnsan Sözü"},{"q":"İyi bir insana ne hayatta ne de ölümde hiçbir zarar gelmez.","a":"Socrates","c":"İnsan Sözü"},{"q":"İnsanlar yüksek idealleri sever, ancak bunların yaklaşık yüzde 33 oranında makul olması gerekir.","a":"Will Rogers","c":"İnsan Sözü"},{"q":"Bu büyük topraklarımız olmasa biz nerede olurduk?","a":"Ronald Reagan","c":"İnsan Sözü"},{"q":"İşine, sözüne, arkadaşına sadık ol.","a":"Henry David Thoreau","c":"İnsan Sözü"},{"q":"İnançlı bir kişi, yalnızca çıkarları olan doksan dokuz kişilik bir güce eşittir.","a":"John Stuart Mill","c":"İnsan Sözü"},{"q":"Bahçıvanlığı alabilirsin ama onu düşündüremezsin.","a":"Dorothy Parker","c":"İnsan Sözü"},{"q":"Sağduyu, basit bir oyundaki dehadır.","a":"Alfred North Whitehead","c":"İnsan Sözü"},{"q":"Çince yazıldığında 'kriz' kelimesi iki karakterden oluşur. Biri tehlikeyi, diğeri ise fırsatı temsil ediyor.","a":"John F. Kennedy","c":"İnsan Sözü"},{"q":"Herhangi bir üremesi olmayan naif bir yerli Burgundy, ama sanırım onun küstahlığı sizi eğlendirecek.","a":"James Thurber","c":"İnsan Sözü"},{"q":"Bayan Doğru'yu veya en azından Bayan Şu An'ı arıyorum.","a":"Robin Williams","c":"İnsan Sözü"},{"q":"Düşüncenin tamamen yokluğu dışında, düşünce kadar düşünülemez bir şey yoktur.","a":"Samuel Butler","c":"İnsan Sözü"},{"q":"Yarının sorumluluğundan bugün kaçarak kurtulamazsınız.","a":"Abraham Lincoln","c":"İnsan Sözü"},{"q":"Prefrontal lobotomi yerine önümde bedava bir şişe olmasını tercih ederim.","a":"Fred Allen","c":"İnsan Sözü"},{"q":"Boş yere kıskanç olan adamı sevmiyorum.","a":"Oliver Goldsmith","c":"İnsan Sözü"},{"q":"Zenginliğe özgürlükten daha fazla değer veren her toplum, özgürlüğünü de kaybedecek ve sonuçta zenginliğini de kaybedecektir.","a":"W. Somerset Maugham","c":"İnsan Sözü"},{"q":"Önce parayı alın; erdem daha sonra gelir.","a":"Horace","c":"İnsan Sözü"},{"q":"Yetenek sükunet içinde gelişir, karakter ise insan hayatının tüm akışı içinde.","a":"Johann Wolfgang von Goethe","c":"İnsan Sözü"},{"q":"Esprit'in hazırlanmasını tercih etmiyorum.","a":"Louis Pasteur","c":"İnsan Sözü"},{"q":"Çünkü cahillerin aksine, sayı sisteminin seçimi sadece bir gelenek meselesidir.","a":"Blaise Pascal","c":"İnsan Sözü"},{"q":"Yaşlandıkça zaman ona birçok ders verir.","a":"Aeschylus","c":"İnsan Sözü"},{"q":"Asla kahvaltıdan önce çalışmayın; Kahvaltıdan önce çalışmanız gerekiyorsa önce kahvaltınızı yapın.","a":"Josh Billings","c":"İnsan Sözü"},{"q":"Babasının kendisinden önce gelmesi onun adına mutluluktur.","a":"Jonathan Swift","c":"İnsan Sözü"},{"q":"Adalet, eylemdeki hakikattir.","a":"Benjamin Disraeli","c":"İnsan Sözü"},{"q":"İnsan imkansıza inanabilir ama ihtimal dışı olana asla inanamaz.","a":"Oscar Wilde","c":"İnsan Sözü"},{"q":"Erkeğin sevgisi, insanın hayatından bambaşkadır; 'Kadının bütün varlığıdır.","a":"Lord Byron","c":"İnsan Sözü"},{"q":"Konuşan ve konuştuğu kişi anlamadığında bu metafiziktir.","a":"Voltaire","c":"İnsan Sözü"},{"q":"Ne kadar uzun yaşarsam hayat o kadar güzelleşiyor.","a":"Frank Lloyd Wright","c":"İnsan Sözü"},{"q":"Başarılı olmak yeterli değil. Diğerleri başarısız olmalı.","a":"Gore Vidal","c":"İnsan Sözü"},{"q":"Adalet yalnızca bir taraf için olamaz, her iki taraf için de olmalıdır.","a":"Eleanor Roosevelt","c":"İnsan Sözü"},{"q":"Tamamen tutarlı olan tek kişi ölülerdir.","a":"Aldous Huxley","c":"İnsan Sözü"},{"q":"Hayatımda hiçbir kadına vurmadım, kendi anneme bile.","a":"W. C. Fields","c":"İnsan Sözü"},{"q":"Başlangıç ​​işin en önemli kısmıdır.","a":"Plato","c":"İnsan Sözü"},{"q":"Eğer insanlara doğru davranırsanız, onlar da size %90 oranında doğru davranırlar.","a":"Franklin D. Roosevelt","c":"İnsan Sözü"},{"q":"Çok eski kafalıyım. İnsanların güvercinler ve Katolikler gibi ömür boyu evlenmeleri gerektiğine inanıyorum.","a":"Woody Allen","c":"İnsan Sözü"},{"q":"Bir düşünceyi kabul etmeden onu aklında tutabilmek eğitimli bir zihnin işaretidir.","a":"Aristotle","c":"İnsan Sözü"},{"q":"Gerçekten riskli bir kumar olan karşılıklı güvenin alternatifi polis devletinin güvenliğidir.","a":"Alan Watts","c":"İnsan Sözü"},{"q":"İnsanlığın çarpık kerestesinden hiçbir zaman düz bir şey yapılamaz.","a":"Immanuel Kant","c":"İnsan Sözü"},{"q":"Eğer doğanız buysa, kendiniz için belayı ödünç alın, ancak komşularınıza ödünç vermeyin.","a":"Rudyard Kipling","c":"İnsan Sözü"},{"q":"Sebep: Şeytanın fahişesi.","a":"Martin Luther","c":"İnsan Sözü"},{"q":"Her iki Alsop da bunun doğru olduğunu söylüyorsa, öyle olamaz.","a":"John Kenneth Galbraith","c":"İnsan Sözü"},{"q":"Kayınbiraderlerimiz için başka renkten erkekleri istemiyoruz ama kardeş olarak istiyoruz.","a":"Booker T. Washington","c":"İnsan Sözü"},{"q":"Tükürük kansere neden olur, ancak yalnızca uzun bir süre boyunca küçük miktarlarda yutulması halinde.","a":"George Carlin","c":"İnsan Sözü"},{"q":"Sonsuza dek sevmeyecek bir aşık değildir.","a":"Euripides","c":"İnsan Sözü"},{"q":"Okul hayata hazırlık olmamalıdır. Okul hayat olmalı.","a":"Elbert Hubbard","c":"İnsan Sözü"},{"q":"Akıllı bir yönetici, çıkarlarına aykırı olacaksa asla inancını korumamalıdır.","a":"Niccolo Machiavelli","c":"İnsan Sözü"},{"q":"Hayatta başarı kadar büyüyü bozan bir şey var mı?","a":"Robert Louis Stevenson","c":"İnsan Sözü"},{"q":"Muhabirler ve fotoğrafçılar dışında herkes için eşitliğe inanıyorum.","a":"Mahatma Gandhi","c":"İnsan Sözü"},{"q":"Komedi nedir? Komedi, insanları kusturmadan güldürme sanatıdır.","a":"Steve Martin","c":"İnsan Sözü"},{"q":"Biz şeyleri olduğu gibi görmüyoruz, olduğumuz gibi görüyoruz.","a":"Anais Nin","c":"İnsan Sözü"},{"q":"Geleceği tahmin etmek istiyorsanız geçmişi inceleyin.","a":"Confucius","c":"İnsan Sözü"},{"q":"Günlük hayatta karşımızda olanı bilmek en büyük bilgeliktir.","a":"John Milton","c":"İnsan Sözü"},{"q":"Bana tamamen tatmin olmuş bir adam göster, ben de sana başarısızlığı göstereyim.","a":"Thomas Edison","c":"İnsan Sözü"},{"q":"Rezil yaşamaktansa hiç yaşamamak daha iyidir.","a":"Sophocles","c":"İnsan Sözü"},{"q":"Öğrenme en çok matbaacıların kaybettiği kitaplardan elde edildi.","a":"Thomas Fuller","c":"İnsan Sözü"},{"q":"İnsanın karakteri onun kaderidir.","a":"Heraclitus","c":"İnsan Sözü"},{"q":"Bilgi arayışının esas olarak güç sevgisiyle harekete geçirildiğini düşünüyorum.","a":"Bertrand Russell","c":"İnsan Sözü"},{"q":"Alışılmadık derecede sağduyu, dünyanın bilgelik dediği şeydir.","a":"Samuel Taylor Coleridge","c":"İnsan Sözü"},{"q":"Bebek bezini asla akıntının ortasında değiştirmeyin.","a":"Don Marquis","c":"İnsan Sözü"},{"q":"Ben sadece ortalama bir adamım ama George adına, bu konuda ortalama bir adamdan daha çok çalışıyorum.","a":"Theodore Roosevelt","c":"İnsan Sözü"},{"q":"Kolaylıkla yapmayı umduğumuz şeyi önce özenle yapmayı öğrenmeliyiz.","a":"Samuel Johnson","c":"İnsan Sözü"},{"q":"Cesur işi çıplak bir kılıçla tüm dünyada kovalayın.","a":"George Herbert","c":"İnsan Sözü"},{"q":"Bazen vasat bir dünyada başarılı olma konusunda endişeleniyorum.","a":"Lily Tomlin","c":"İnsan Sözü"},{"q":"Dilige et quos vis fac. [Sev ve istediğini yap]","a":"Augustine of Hippo","c":"İnsan Sözü"},{"q":"Öğrenmeyi bırakan kişi ister yirmi ister seksen yaşlıdır.","a":"Henry Ford","c":"İnsan Sözü"},{"q":"Öğüt veririz ama ondan faydalanacak aklı veremeyiz.","a":"François de La Rochefoucauld","c":"İnsan Sözü"},{"q":"Zeki erkek veya kadına hayat sonsuz derecede gizemli görünür. Ama aptalların her soruya bir cevabı vardır.","a":"Edward Abbey","c":"İnsan Sözü"},{"q":"Biz amellerimizi belirlediğimiz kadar amellerimiz de bizi belirler.","a":"George Eliot","c":"İnsan Sözü"},{"q":"Hatip olmak istiyorsan önce büyük amacına ulaş.","a":"Wendell Phillips","c":"İnsan Sözü"},{"q":"Soyut sanat yoktur. Her zaman bir şeyle başlamalısın. Daha sonra gerçekliğin tüm izlerini ortadan kaldırabilirsiniz.","a":"Pablo Picasso","c":"İnsan Sözü"},{"q":"Hiç kimse konuşmanızın çok özel dehasını köpek kadar takdir edemez.","a":"Christopher Morley","c":"İnsan Sözü"},{"q":"Her şey mümkün olduğu kadar basit olmalı, ancak daha basit olmamalıdır.","a":"Albert Einstein","c":"İnsan Sözü"},{"q":"İşe gitmeniz gerektiğinde çalışan bir araba, izin gününüzde devrilmez.","a":"Doug Larson","c":"İnsan Sözü"},{"q":"Bir matematikçi, karanlık bir odada orada olmayan siyah bir kediyi arayan kör bir adamdır.","a":"Charles Darwin","c":"İnsan Sözü"},{"q":"Kendi babasını tanıyan bilge bir çocuktur.","a":"Homer","c":"İnsan Sözü"},{"q":"Alışkanlık, hataların fidanlığıdır.","a":"Victor Hugo","c":"İnsan Sözü"},{"q":"Gürültü ve emirle delilini ortaya koyan, aklının zayıf olduğunu gösterir.","a":"Michel de Montaigne","c":"İnsan Sözü"},{"q":"Şans ve sevgi cesur olanın dostudur.","a":"Ovid","c":"İnsan Sözü"},{"q":"İhtiyatlı bir soru yarım bilgeliktir.","a":"Francis Bacon","c":"İnsan Sözü"},{"q":"Kitaplar mobilya için yapılmaz ama bir evi bu kadar güzel döşeyen başka hiçbir şey yoktur.","a":"Henry Ward Beecher","c":"İnsan Sözü"},{"q":"Su dolu sokaklar; tavsiye lütfen.","a":"Robert Benchley","c":"İnsan Sözü"},{"q":"Kazak siparişi: \"Ben de öyle istiyorum. Bir tane Lacivert, bir tane Lacivert istiyorum.","a":"Yogi Berra","c":"İnsan Sözü"},{"q":"Cazibe, net bir soru sormadan evet cevabını almanın bir yoludur.","a":"Albert Camus","c":"İnsan Sözü"},{"q":"Başkalarının sizin hakkınızda ne düşündüğünden çok sizin kendiniz hakkında ne düşündüğünüz önemlidir.","a":"Seneca","c":"İnsan Sözü"},{"q":"Ben umutsuzca ve sonsuza kadar bir dağcıyım.","a":"John Muir","c":"İnsan Sözü"},{"q":"Bugün sahip olduğumuz hakları doğal haklar olarak değerlendirebiliriz ama bunlar kanla, terle, fedakarlıkla ve ölümle kazanılmıştır.","a":"Dwight D. Eisenhower","c":"İnsan Sözü"},{"q":"Üniversite fikirlerin aranacağı yer değil.","a":"Helen Keller","c":"İnsan Sözü"},{"q":"Sevgi her şeyin üstesinden gelir.","a":"Virgil","c":"İnsan Sözü"},{"q":"Arzu disiplini karakterin arka planıdır.","a":"John Locke","c":"İnsan Sözü"},{"q":"Sessizlik, büyük şeylerin kendilerini şekillendirdiği unsurdur.","a":"Thomas Carlyle","c":"İnsan Sözü"},{"q":"Tüm yaşam bir deneydir. Ne kadar çok deneme yaparsanız o kadar iyi olur.","a":"Ralph Waldo Emerson","c":"İnsan Sözü"},{"q":"Şansa çok inanıyorum. Ne kadar çok çalışırsam o kadar çok şeye sahibim.","a":"Thomas Jefferson","c":"İnsan Sözü"},{"q":"Meslek zamanın tırpanıdır.","a":"Napoleon Bonaparte","c":"İnsan Sözü"},{"q":"Güce asla kontrol olmadan güvenilmemelidir.","a":"John Adams","c":"İnsan Sözü"},{"q":"Okumayan insanlar zalimdir.","a":"Eugene Ionesco","c":"İnsan Sözü"},{"q":"Geleceğin imparatorlukları zihnin imparatorluklarıdır.","a":"Winston Churchill","c":"İnsan Sözü"},{"q":"Bin millik bir yolculuk tek bir adımla başlamalı.","a":"Lao Tzu","c":"İnsan Sözü"},{"q":"Eylem malzemeleri değişkendir, ancak onlardan yaptığımız kullanımın sabit olması gerekir.","a":"Epictetus","c":"İnsan Sözü"},{"q":"Mutfaktaki kötü kokulardan kurtulmak istiyorsanız yemek pişirmeyi bırakın.","a":"Erma Bombeck","c":"İnsan Sözü"},{"q":"Annesinin tartışmasız gözdesi olan bir adam, ömür boyu bir fatih duygusunu korur.","a":"Sigmund Freud","c":"İnsan Sözü"},{"q":"Beni en aşağı türden bir handa cin içerken bulacaksınız, Çünkü ben katı bir Vejetaryenim.","a":"Gilbert K. Chesterton","c":"İnsan Sözü"},{"q":"Aşil uzay ve zamanı düşünürse kaplumbağayı yenemez","a":"Paul Valery","c":"İnsan Sözü"},{"q":"Dürüstlük en iyi politikadır; işin içinde para varsa.","a":"Mark Twain","c":"İnsan Sözü"},{"q":"Biraz et, biraz nefes ve her şeye hükmetme nedeni; işte bu benim.","a":"Marcus Aurelius","c":"İnsan Sözü"},{"q":"Gazete editörleri, buğdayı samandan ayıran ve sonra samanı basan adamlardır.","a":"Adlai Stevenson","c":"İnsan Sözü"},{"q":"İnsan, pazarlık yapan bir hayvandır.","a":"Adam Smith","c":"İnsan Sözü"},{"q":"Vatanseverlik aptalların tutkusudur ve tutkuların en aptalcasıdır.","a":"Arthur Schopenhauer","c":"İnsan Sözü"},{"q":"Çoğumuz talimatları okumaktansa felaket riskini almayı tercih ederiz.","a":"Mignon McLaughlin","c":"İnsan Sözü"},{"q":"Onun onurunu savunuyorum ki bu onun her zamankinden daha fazla yaptığı bir şey.","a":"Groucho Marx","c":"İnsan Sözü"},{"q":"Arkadaşlığın en iyi kuralı, kalbinizi aklınızdan biraz daha yumuşak tutmaktır.","a":"George Santayana","c":"İnsan Sözü"},{"q":"Karasineklerin Venüs sinek kapanından daha çok korktuğu tek şey asılı bitkidir.","a":"Steven Wright","c":"İnsan Sözü"},{"q":"Zor durumdaki bir adamın tavsiyesine asla güvenme.","a":"Aesop","c":"İnsan Sözü"},{"q":"YEM, n. Kancayı daha lezzetli hale getiren bir preparat. En iyi tür güzelliktir.","a":"Ambrose Bierce","c":"İnsan Sözü"},{"q":"İman, teorik olarak şüphenin mümkün olduğu bir şeye inanmak demektir.","a":"William James","c":"İnsan Sözü"},{"q":"Bir kadın eğitim almak istiyorsa bunun nedeni muhtemelen cinsel aparatının arızalı olmasıdır.","a":"Friedrich Nietzsche","c":"İnsan Sözü"},{"q":"Kötülük yapmaktan kork, başka hiçbir şeyden korkmana gerek yok.","a":"Benjamin Franklin","c":"İnsan Sözü"},{"q":"Bu sabah aklıma muhteşem bir fikir geldi ama hoşuma gitmedi.","a":"Samuel Goldwyn","c":"İnsan Sözü"},{"q":"Tarihten hiçbir şey öğrenmediğimizi tarihten öğreniyoruz.","a":"George Bernard Shaw","c":"İnsan Sözü"},{"q":"Bazılarımızın karanlık çağların sonunu görme şansı var.","a":"Arthur C. Clarke","c":"İnsan Sözü"},{"q":"Yaşasın. [Düşünmek yaşamaktır.]","a":"Marcus Tullius Cicero","c":"İnsan Sözü"},{"q":"Nancy Reagan düştü ve saçını kırdı.","a":"Johnny Carson","c":"İnsan Sözü"},{"q":"Bakın yanlış Swift intikamı bekliyor; ve sanat güçlüyü bastırır!","a":"Alexander Pope","c":"İnsan Sözü"},{"q":"Yaptıklarımızdan değil, yapmadıklarımızdan da sorumluyuz.","a":"Moliere","c":"İnsan Sözü"},{"q":"İnsanlar zaman zaman ölür ve solucanlar onları yer, ama aşk için değil.","a":"William Shakespeare","c":"İnsan Sözü"},{"q":"Kadınlar erkeklerin hayatlarını boşa harcıyor ve onları birkaç zarif sözle telafi ettiklerini düşünüyorlar.","a":"Honore de Balzac","c":"İnsan Sözü"},{"q":"Milli borç, eğer aşırı değilse, bizim için milli bir nimet olacaktır.","a":"Alexander Hamilton","c":"İnsan Sözü"},{"q":"Şair zevkle başlar, bilgelikle biter.","a":"Robert Frost","c":"İnsan Sözü"},{"q":"Dürüstlük en iyi politikadır.","a":"Miguel de Cervantes","c":"İnsan Sözü"},{"q":"Bir hakime ait olan dört şey vardır: Nazikçe dinlemek, hikmetle cevap vermek, ayıklıkla düşünmek ve tarafsız karar vermek.","a":"Socrates","c":"İnsan Sözü"},{"q":"Heceleyemediğin hiçbir şey asla işe yaramaz.","a":"Will Rogers","c":"İnsan Sözü"},{"q":"Bir arkadaşınızın jöleli fasulye yeme şekline bakarak karakteri hakkında çok şey anlayabilirsiniz.","a":"Ronald Reagan","c":"İnsan Sözü"},{"q":"Uzun vadede insanlar yalnızca hedefledikleri şeyi vururlar. Bu nedenle yüksek bir şeyi hedeflemeleri daha iyi olurdu.","a":"Henry David Thoreau","c":"İnsan Sözü"},{"q":"Var olan her güzel şey özgünlüğün meyvesidir.","a":"John Stuart Mill","c":"İnsan Sözü"},{"q":"Aşk eldeki cıva gibidir. Parmakları açık bırakın, öyle kalır. Onu yakalayın ve hızla uzaklaşır.","a":"Dorothy Parker","c":"İnsan Sözü"},{"q":"Modern bilim insanlığa gezinme zorunluluğunu dayattı.","a":"Alfred North Whitehead","c":"İnsan Sözü"},{"q":"Her şey değişir ama kendisi değişir.","a":"John F. Kennedy","c":"İnsan Sözü"},{"q":"Aşk, birisiyle yaşadığın şeydir.","a":"James Thurber","c":"İnsan Sözü"},{"q":"Carpe Diem, beyler. Günü yakala. Hayatınızı olağanüstü hale getirin.","a":"Robin Williams","c":"İnsan Sözü"},{"q":"Tüm ilerlemeler, her organizmanın gelirinin ötesinde yaşama yönündeki evrensel, doğuştan gelen arzusuna dayanır.","a":"Samuel Butler","c":"İnsan Sözü"},{"q":"Susmak ve aptal sanılmak, konuşup tüm şüpheleri ortadan kaldırmaktan daha iyidir.","a":"Abraham Lincoln","c":"İnsan Sözü"},{"q":"Amcam Güneyli bir çiftçi. Kendisi Alabama'da bir cenazeci.","a":"Fred Allen","c":"İnsan Sözü"},{"q":"Papaz tartışma konusunda da kendi becerisine sahipti, çünkü yenilmiş olsa bile hâlâ tartışabiliyordu.","a":"Oliver Goldsmith","c":"İnsan Sözü"},{"q":"İnsanoğlu her zaman çarpım tablosunu öğrenmektense canını feda etmeyi daha kolay bulmuştur.","a":"W. Somerset Maugham","c":"İnsan Sözü"},{"q":"İkinci kez okumaya değer bir şey yazmayı umuyorsanız, çoğu zaman kaleminizi silmek için çevirmeniz gerekir.","a":"Horace","c":"İnsan Sözü"},{"q":"Hayatta önemli olan hayatın sonucu değil, hayattır.","a":"Johann Wolfgang von Goethe","c":"İnsan Sözü"},{"q":"Bu mektubun uzunluğu için kusura bakmayın beyler. Kısaltmaya vaktim olmadı.","a":"Blaise Pascal","c":"İnsan Sözü"},{"q":"Sürgünler umutla beslenir.","a":"Aeschylus","c":"İnsan Sözü"},{"q":"Kelimelerin büyük bir gücü var, onları bir araya getiremiyorsun.","a":"Josh Billings","c":"İnsan Sözü"},{"q":"Çiftçi gibi beslendim: Domuz balığı gibi şişmanlayacağım.","a":"Jonathan Swift","c":"İnsan Sözü"},{"q":"Genel bir kural olarak hayattaki en başarılı adam, en iyi bilgiye sahip olan adamdır.","a":"Benjamin Disraeli","c":"İnsan Sözü"},{"q":"Gerçek nadiren saftır ve asla basit değildir.","a":"Oscar Wilde","c":"İnsan Sözü"},{"q":"Onu neden seviyordu? Meraklı aptal - sakin ol - İnsan sevgisi insan iradesinin gelişimi midir?","a":"Lord Byron","c":"İnsan Sözü"},{"q":"Tıp sanatı, doğa hastalığı iyileştirirken hastayı eğlendirmekten ibarettir.","a":"Voltaire","c":"İnsan Sözü"},{"q":"Televizyon gözler için sakız çiğnemektir.","a":"Frank Lloyd Wright","c":"İnsan Sözü"},{"q":"Başarılı olmak yeterli değil. Diğerleri başarısız olmalı.","a":"Gore Vidal","c":"İnsan Sözü"},{"q":"Kişinin kendiyle arkadaş olması çok önemlidir, çünkü o olmadan kişi dünyadaki hiç kimseyle arkadaş olamaz.","a":"Eleanor Roosevelt","c":"İnsan Sözü"},{"q":"Gerçekler görmezden gelindi diye yok olmuyor.","a":"Aldous Huxley","c":"İnsan Sözü"},{"q":"Uykusuzluğun en iyi tedavisi çok uyumaktır.","a":"W. C. Fields","c":"İnsan Sözü"},{"q":"Oğlan: Tüm vahşi hayvanlar arasında yönetilmesi en zor olanı.","a":"Plato","c":"İnsan Sözü"},{"q":"İlerlemenin birçok yolu vardır ama yerinde durmanın yalnızca bir yolu vardır.","a":"Franklin D. Roosevelt","c":"İnsan Sözü"},{"q":"Bir insanın ölümünü objektif olarak deneyimlemesi ve hala bir melodi taşıması imkansızdır.","a":"Woody Allen","c":"İnsan Sözü"},{"q":"Umut uyanıkken görülen bir rüyadır.","a":"Aristotle","c":"İnsan Sözü"},{"q":"En aptal kadın bile zeki bir erkeği idare edebilir; ama bir aptalı yönetmek için çok akıllı bir kadına ihtiyaç vardır.","a":"Rudyard Kipling","c":"İnsan Sözü"},{"q":"Sadık ve iyi bir kul gerçek bir nimettir; ama gerçekten de bu ülkede nadir bulunan bir kuştur.","a":"Martin Luther","c":"İnsan Sözü"},{"q":"Ekonomik tahminlerin tek işlevi astrolojinin saygın görünmesini sağlamaktır.","a":"John Kenneth Galbraith","c":"İnsan Sözü"},{"q":"Hiç kimsenin kendisinden nefret etmemi sağlayarak ruhumu daraltmasına ve aşağılamasına izin vermeyeceğim.","a":"Booker T. Washington","c":"İnsan Sözü"},{"q":"*Gerçekten* aktarmasız uçuşa binmek ister miydiniz?","a":"George Carlin","c":"İnsan Sözü"},{"q":"Düşüncenin gizemlerinde güç buldum.","a":"Euripides","c":"İnsan Sözü"},{"q":"Başarısız kişi, hata yapmış ancak bu deneyiminden para kazanamayan kişidir.","a":"Elbert Hubbard","c":"İnsan Sözü"},{"q":"Erkekler genellikle alçakgönüllülüğün küstahlığı yenebileceğine inanarak kendilerini kandırırlar.","a":"Niccolo Machiavelli","c":"İnsan Sözü"},{"q":"Hayat, iyi kartlara sahip olmak değil, kötü bir eli iyi oynamaktır.","a":"Robert Louis Stevenson","c":"İnsan Sözü"},{"q":"Günahtan nefret et ve günahkarı sev.","a":"Mahatma Gandhi","c":"İnsan Sözü"},{"q":"Önemli olan bildiğin şey değil, bildiğini sandığın şey.","a":"Steve Martin","c":"İnsan Sözü"},{"q":"İnsanlara bir hareket yolu izletilebilir ama onu anlamaları sağlanamayabilir.","a":"Confucius","c":"İnsan Sözü"},{"q":"Loş bir güneş tutulmasında, feci alacakaranlık ulusların yarısının üzerine çöküyor ve değişim korkusuyla hükümdarların kafasını karıştırıyor.","a":"John Milton","c":"İnsan Sözü"},{"q":"Dehanın yüzde biri ilham, yüzde doksan dokuzu ise alın teridir.","a":"Thomas Edison","c":"İnsan Sözü"},{"q":"Bilgelik her türlü zenginlikten daha ağır basar.","a":"Sophocles","c":"İnsan Sözü"},{"q":"Ne kadar çok zeka, o kadar az cesaret.","a":"Thomas Fuller","c":"İnsan Sözü"},{"q":"Aynı nehre iki kez girmek mümkün değildir.","a":"Heraclitus","c":"İnsan Sözü"},{"q":"Korkuyu yenmek bilgeliğin başlangıcıdır.","a":"Bertrand Russell","c":"İnsan Sözü"},{"q":"Hayal gücü aslında zaman ve mekan düzeninden kurtulmuş bir hafıza kipinden başka bir şey değil.","a":"Samuel Taylor Coleridge","c":"İnsan Sözü"},{"q":"her bulutun bir olumlu yanı vardır ama bazen bunu darphaneye ulaştırmak biraz zordur","a":"Don Marquis","c":"İnsan Sözü"},{"q":"Senato'da yoklama yapıldığında Senatörler 'Mevcut' mu yoksa 'Suçsuz' mu cevap vereceklerini bilmiyorlar.","a":"Theodore Roosevelt","c":"İnsan Sözü"},{"q":"Zahmetsizce yazılanlar genellikle zevksiz okunur.","a":"Samuel Johnson","c":"İnsan Sözü"},{"q":"Pazar günleri kutlanır; Çanlar çaldığında 'T meleklerin müziği' diye düşünüyorum.","a":"George Herbert","c":"İnsan Sözü"},{"q":"New Yorklu olmak asla özür dilemek zorunda olmamaktır.","a":"Lily Tomlin","c":"İnsan Sözü"},{"q":"Sevin ve ne yaparsanız yapın.","a":"Augustine of Hippo","c":"İnsan Sözü"},{"q":"İdealist, karşısındakinin kâr etmesine yardım eden kişidir.","a":"Henry Ford","c":"İnsan Sözü"},{"q":"Eğer gösteriş ona eşlik etmeseydi, erdem çok ileri giderdi.","a":"François de La Rochefoucauld","c":"İnsan Sözü"},{"q":"Doğaüstüne olan inanç, hayal gücünün başarısızlığını yansıtır.","a":"Edward Abbey","c":"İnsan Sözü"},{"q":"Hiç kimse aç karnına bilge olamaz.","a":"George Eliot","c":"İnsan Sözü"},{"q":"Aristokrasi her zaman zalimdir.","a":"Wendell Phillips","c":"İnsan Sözü"},{"q":"Sanat bize gerçeği fark ettiren bir yalandır.","a":"Pablo Picasso","c":"İnsan Sözü"},{"q":"Vaaz verme hakkı yalnızca günahkarındır.","a":"Christopher Morley","c":"İnsan Sözü"},{"q":"Hayal gücü bilgiden daha önemlidir.","a":"Albert Einstein","c":"İnsan Sözü"},{"q":"Dünyanın en büyük başarılarından bazıları, bunların imkansız olduğunu bilecek kadar akıllı olmayan insanlar tarafından gerçekleştirildi.","a":"Doug Larson","c":"İnsan Sözü"},{"q":"Doğa elinden gelse sana doğrudan yalan söyleyecektir.","a":"Charles Darwin","c":"İnsan Sözü"},{"q":"Sağduyu eğitimin sonucu değil, ona rağmen olur.","a":"Victor Hugo","c":"İnsan Sözü"},{"q":"Ateşe doğru iyi tarafı takip edeceğim, ama eğer yardım edebilirsem içine girmeyeceğim.","a":"Michel de Montaigne","c":"İnsan Sözü"},{"q":"En iyi savunma her zaman iyi bir saldırı değil midir?","a":"Ovid","c":"İnsan Sözü"},{"q":"Denizden başka bir şey göremedikleri halde karanın olmadığını sanan kötü kaşiflerdir bunlar.","a":"Francis Bacon","c":"İnsan Sözü"},{"q":"Musibetler bize üzülmek için değil ayık olmak için gelir; bizi pişman etmek için değil, bilgece.","a":"Henry Ward Beecher","c":"İnsan Sözü"},{"q":"Yaşayan en yaşlı beyaz adamım, özellikle de sabahın yedisinde.","a":"Robert Benchley","c":"İnsan Sözü"},{"q":"Bence Küçükler Ligi harika. Çocukları evden uzak tutuyor.","a":"Yogi Berra","c":"İnsan Sözü"},{"q":"Bütün büyük işler ve bütün büyük düşünceler gülünç bir başlangıca sahiptir.","a":"Albert Camus","c":"İnsan Sözü"},{"q":"Nullum magnum ingenium sine mixtura dementiae fuit. Deliliğin tentürü olmayan büyük bir dahi yoktur.","a":"Seneca","c":"İnsan Sözü"},{"q":"Gelin ve vaftiz olun ve medeni günahlardan bağışlanmayı alın. Geçen yıl sadece serpildin. Gelin ve suya dalın!","a":"John Muir","c":"İnsan Sözü"},{"q":"Kurucu atalarımız bugün hayatta olsalardı mezarlarında ters dönerlerdi.","a":"Dwight D. Eisenhower","c":"İnsan Sözü"},{"q":"Yüzünüzü güneş ışığına çevirirseniz gölgeyi göremezsiniz.","a":"Helen Keller","c":"İnsan Sözü"},{"q":"Yapabilirler çünkü yapabileceklerini düşünüyorlar.","a":"Virgil","c":"İnsan Sözü"},{"q":"Erkeklerin eylemleri, düşüncelerinin en iyi tercümanlarıdır.","a":"John Locke","c":"İnsan Sözü"},{"q":"Aristokrasi nedir? En iyilerin, en cesurların şirketi.","a":"Thomas Carlyle","c":"İnsan Sözü"},{"q":"Hayattaki en önemli olay, bizi şaşırtan bir zihinle karşılaştığımız gündür.","a":"Ralph Waldo Emerson","c":"İnsan Sözü"},{"q":"Ben şansa çok inanıyorum ve ne kadar çok çalışırsam o kadar çok şansa sahip olduğumu görüyorum.","a":"Thomas Jefferson","c":"İnsan Sözü"},{"q":"Sözünü tutmanın en iyi yolu, sözünü vermemektir.","a":"Napoleon Bonaparte","c":"İnsan Sözü"},{"q":"Açıklama bizi, anlaşılmazlığa açılan tek kapı olan şaşkınlıktan ayırır.","a":"Eugene Ionesco","c":"İnsan Sözü"},{"q":"Kısa kelimeler en iyisidir ve kısa olduğunda eski kelimeler en iyisidir.","a":"Winston Churchill","c":"İnsan Sözü"},{"q":"Büyük ameller, küçük amellerden oluşur.","a":"Lao Tzu","c":"İnsan Sözü"},{"q":"Kendi kendisinin efendisi olmayan hiç kimse özgür değildir.","a":"Epictetus","c":"İnsan Sözü"},{"q":"Oğlunuzu alacak herhangi bir üniversiteye gitmekten gurur duyacaktır.","a":"Erma Bombeck","c":"İnsan Sözü"},{"q":"Zihin bir buzdağıdır; hacminin yalnızca yedide biri su üzerinde yüzer.","a":"Sigmund Freud","c":"İnsan Sözü"},{"q":"Hıristiyan ideali denenmedi ve yetersiz bulunmadı. Zor bulunmuş ve denenmeden bırakılmıştır.","a":"Gilbert K. Chesterton","c":"İnsan Sözü"},{"q":"Bir sanatçı hiçbir zaman eserini gerçekten bitirmez, yalnızca onu bırakır.","a":"Paul Valery","c":"İnsan Sözü"},{"q":"İyi kitaplar okumayan adamın, okuyamayan adama göre hiçbir avantajı yoktur.","a":"Mark Twain","c":"İnsan Sözü"},{"q":"Öfkenin sonuçları, sebeplerinden ne kadar ağırdır.","a":"Marcus Aurelius","c":"İnsan Sözü"},{"q":"İnsan bazen sözcükleri yemek zorunda kalsa da, yalnızca sözcüklerle yaşamaz.","a":"Adlai Stevenson","c":"İnsan Sözü"},{"q":"Üniversiteler öğrencilerin rahatlığı için değil, öğretim üyelerinin rahatlığı için tasarlanmıştır.","a":"Adam Smith","c":"İnsan Sözü"},{"q":"En büyük entelektüel kapasiteler ancak şiddetli ve tutkulu bir iradeyle bağlantılı olarak bulunur.","a":"Arthur Schopenhauer","c":"İnsan Sözü"},{"q":"Hiç kimse kimseyi, herkesin sevilmek istediği şekilde sevmedi.","a":"Mignon McLaughlin","c":"İnsan Sözü"},{"q":"Siyaset belayı arama, bulma, yanlış teşhis koyma ve sonra da yanlış çareleri yanlış uygulama sanatıdır.","a":"Groucho Marx","c":"İnsan Sözü"},{"q":"Bir felsefe sisteminin esas itibarıyla doğru olması büyük bir avantajdır.","a":"George Santayana","c":"İnsan Sözü"},{"q":"Evrim hakkındaki görüşlerim? Darwin'in evlat edinildiğini düşünüyorum.","a":"Steven Wright","c":"İnsan Sözü"},{"q":"Kaderinize razı olun; insan her şeyde birinci olamaz.","a":"Aesop","c":"İnsan Sözü"},{"q":"ÖĞRENME, n. Çalışkanları ayıran türden bir cehalet.","a":"Ambrose Bierce","c":"İnsan Sözü"},{"q":"Pek çok insan sadece önyargılarını yeniden düzenlerken düşündüğünü zanneder.","a":"William James","c":"İnsan Sözü"},{"q":"Aşktan doğan her şey daima iyinin ve kötünün ötesindedir.","a":"Friedrich Nietzsche","c":"İnsan Sözü"},{"q":"Alacaklıların hafızası borçlulardan daha iyidir; alacaklılar ise batıl inançlı bir mezheptir, belirlenmiş gün ve saatlerin büyük gözlemcileridir.","a":"Benjamin Franklin","c":"İnsan Sözü"},{"q":"Sana iki kelimeyle söyleyebilirim: İmkansızım.","a":"Samuel Goldwyn","c":"İnsan Sözü"},{"q":"Aklı dinleyen adam kaybolur: Akıl, ona hakim olacak kadar güçlü olmayan herkesi köleleştirir.","a":"George Bernard Shaw","c":"İnsan Sözü"},{"q":"Zekanın hayatta kalma açısından herhangi bir değeri olduğu henüz kanıtlanmadı.","a":"Arthur C. Clarke","c":"İnsan Sözü"},{"q":"Ekonomi başlı başına büyük bir gelirdir.","a":"Marcus Tullius Cicero","c":"İnsan Sözü"},{"q":"Biraz pis bir söz yeterli olacakken asla büyük bir söz kullanmayın.","a":"Johnny Carson","c":"İnsan Sözü"},{"q":"Ey Tanrılar! yalnızca mekanı ve zamanı yok eder ve iki aşığı mutlu eder.","a":"Alexander Pope","c":"İnsan Sözü"},{"q":"Sadece yaptıklarımız değil, yapmadıklarımız da bizim sorumluluğumuzdur.","a":"Moliere","c":"İnsan Sözü"},{"q":"Bundan sonra, bundan daha iyi bir dünyada, senden daha çok sevgi ve bilgi isteyeceğim.","a":"William Shakespeare","c":"İnsan Sözü"},{"q":"Dünya hakkında duyduğunuz her şeye inanın; hiçbir şey inanılmayacak kadar kötü değildir.","a":"Honore de Balzac","c":"İnsan Sözü"},{"q":"Bir şiir sevinçle başlar, hikmetle biter.","a":"Robert Frost","c":"İnsan Sözü"},{"q":"Herkes kendi işine baksın.","a":"Miguel de Cervantes","c":"İnsan Sözü"},{"q":"Gerçek bilgi, hiçbir şey bilmediğini bilmektir.","a":"Socrates","c":"İnsan Sözü"},{"q":"Maymunların bu kadar komik olduğunu düşünmemizin nedeni onların bize çok benzemeleridir.","a":"Will Rogers","c":"İnsan Sözü"},{"q":"Kürtaj yalnızca kendisi doğmuş kişiler tarafından savunulmaktadır.","a":"Ronald Reagan","c":"İnsan Sözü"},{"q":"Dünya hayal gücümüzün tuvalinden başka bir şey değil.","a":"Henry David Thoreau","c":"İnsan Sözü"},{"q":"Hiçbir topluluğun diğerini uygar olmaya zorlama hakkına sahip olduğunu bilmiyorum.","a":"John Stuart Mill","c":"İnsan Sözü"},{"q":"Bahçıvanlığa liderlik edebilirsiniz ama onun düşünmesini sağlayamazsınız.","a":"Dorothy Parker","c":"İnsan Sözü"},{"q":"Hareketsiz fikirlerle eğitim sadece işe yaramaz değil; her şeyden önce zararlıdır.","a":"Alfred North Whitehead","c":"İnsan Sözü"},{"q":"Zarafetten ve güzellikten korkmayan bir Amerika'yı sabırsızlıkla bekliyorum.","a":"John F. Kennedy","c":"İnsan Sözü"},{"q":"Bütün insanlar ölmeden önce neden, neden kaçtıklarını öğrenmeye çalışmalıdır.","a":"James Thurber","c":"İnsan Sözü"},{"q":"Mickey Mouse, üç yaşındaki bir çocuk için bir buçuk metre uzunluğunda bir RAT'tır!","a":"Robin Williams","c":"İnsan Sözü"},{"q":"Sevip de kaybetmek, hiç kaybetmemekten daha iyidir.","a":"Samuel Butler","c":"İnsan Sözü"},{"q":"Babam bana çalışmayı öğretti; bana onu sevmeyi öğretmedi.","a":"Abraham Lincoln","c":"İnsan Sözü"},{"q":"Bir beyefendi asla bir bayana şapkasıyla vurmaz.","a":"Fred Allen","c":"İnsan Sözü"},{"q":"Sonsuz güneş ışığı onun başına yerleşiyor.","a":"Oliver Goldsmith","c":"İnsan Sözü"},{"q":"Aşk, türün devamını sağlamak için bize oynanan kirli bir oyundur sadece.","a":"W. Somerset Maugham","c":"İnsan Sözü"},{"q":"Nunc est bibendum. (Şimdi içme zamanı.)","a":"Horace","c":"İnsan Sözü"},{"q":"Mutlular mucizelere inanmazlar.","a":"Johann Wolfgang von Goethe","c":"İnsan Sözü"},{"q":"Numaralandırma sisteminin seçimi yalnızca bir gelenek meselesidir.","a":"Blaise Pascal","c":"İnsan Sözü"},{"q":"Yaşlandıkça zaman her şeyi öğretir.","a":"Aeschylus","c":"İnsan Sözü"},{"q":"Zaman para gibidir; ne kadar az şeyimiz varsa, o kadar ileri gideriz.","a":"Josh Billings","c":"İnsan Sözü"},{"q":"Hiç kimse öğüt almaz, ama herkes para alır; bu nedenle para öğütten daha iyidir.","a":"Jonathan Swift","c":"İnsan Sözü"},{"q":"Cahil olduğunun bilincine varmak bilgiye doğru büyük bir adımdır.","a":"Benjamin Disraeli","c":"İnsan Sözü"},{"q":"Bir kadının merakının ne olduğunu bilirsin. Neredeyse bir erkeğinki kadar muhteşem!","a":"Oscar Wilde","c":"İnsan Sözü"},{"q":"Yorucu bir düşünce ve her çalışkan yılla birlikte bilgelik biriktirmek.","a":"Lord Byron","c":"İnsan Sözü"},{"q":"Bütün insanlar eşittir; farkı yaratan doğum değil, yalnızca erdemdir.","a":"Voltaire","c":"İnsan Sözü"},{"q":"Böyle devam ederse, insanın düğme parmağı dışındaki tüm uzuvları körelecek.","a":"Frank Lloyd Wright","c":"İnsan Sözü"},{"q":"Tom Hayden, oportünizme kötü bir isim veren türden bir politikacı.","a":"Gore Vidal","c":"İnsan Sözü"},{"q":"Hiç kimse sizin rızanız olmadan size kendinizi aşağılık hissettiremez.","a":"Eleanor Roosevelt","c":"İnsan Sözü"},{"q":"En küçük gerçek, sonsuzluğun görülebileceği bir penceredir.","a":"Aldous Huxley","c":"İnsan Sözü"},{"q":"Kahvaltımın mantarını kim çaldı?","a":"W. C. Fields","c":"İnsan Sözü"},{"q":"Aşk ağır bir akıl hastalığıdır.","a":"Plato","c":"İnsan Sözü"},{"q":"Bazı nesillere çok şey verilmiştir. Diğerlerinden çok şey bekleniyor. Bu neslin kaderle buluşması var.","a":"Franklin D. Roosevelt","c":"İnsan Sözü"},{"q":"Yedek iç çamaşırımı getirmeme rağmen ahirete inanmıyorum.","a":"Woody Allen","c":"İnsan Sözü"},{"q":"Kötü adamlar korku için itaat ederler, iyiler ise sevgi için.","a":"Aristotle","c":"İnsan Sözü"},{"q":"Kadın yalnızca kadındır ama iyi bir puro sigaradır.","a":"Rudyard Kipling","c":"İnsan Sözü"},{"q":"İnanç sol meme ucunun altındadır.","a":"Martin Luther","c":"İnsan Sözü"},{"q":"Hiçbir şey yapmak istemediğinizde toplantılar vazgeçilmezdir.","a":"John Kenneth Galbraith","c":"İnsan Sözü"},{"q":"Kıza istediğini yap ama beni rahat bırak!","a":"George Carlin","c":"İnsan Sözü"},{"q":"Adil ve salih insanların arkadaşlığı en iyisidir.","a":"Euripides","c":"İnsan Sözü"},{"q":"Verdiğimiz sevgi, sakladığımız tek sevgidir.","a":"Elbert Hubbard","c":"İnsan Sözü"},{"q":"Hırs, insan göğsünde o kadar güçlü bir tutkudur ki, ne kadar yükseğe ulaşırsak ulaşalım asla tatmin olmayız.","a":"Niccolo Machiavelli","c":"İnsan Sözü"},{"q":"Mutlu olma görevi kadar küçümsediğimiz bir görev yoktur.","a":"Robert Louis Stevenson","c":"İnsan Sözü"},{"q":"Yaşamda hızını arttırmaktan daha fazlası var.","a":"Mahatma Gandhi","c":"İnsan Sözü"},{"q":"Şanslı astroloji ruh hali saatim olmasaydı neye inanırdım bilmiyorum.","a":"Steve Martin","c":"İnsan Sözü"},{"q":"İşini mükemmelleştirmek isteyen, önce aletlerini keskinleştirmelidir.","a":"Confucius","c":"İnsan Sözü"},{"q":"Altın işlerle dolu, sevinç ve sevginin zafer kazandığı altın günleri görün.","a":"John Milton","c":"İnsan Sözü"},{"q":"Çok çalışmanın yerini hiçbir şey tutamaz.","a":"Thomas Edison","c":"İnsan Sözü"},{"q":"Hiç kimse kötü haber getireni sevmez.","a":"Sophocles","c":"İnsan Sözü"},{"q":"Nefret de sevgi gibi kördür.","a":"Thomas Fuller","c":"İnsan Sözü"},{"q":"Değişimden başka hiçbir şey kalıcı değildir.","a":"Heraclitus","c":"İnsan Sözü"},{"q":"Sinir krizinin yaklaşmasının belirtilerinden biri de kişinin yaptığı işin son derece önemli olduğuna inanmasıdır.","a":"Bertrand Russell","c":"İnsan Sözü"},{"q":"Başkalarının fikirleri değil, kendi kalbimiz gerçek onurumuzu oluşturur.","a":"Samuel Taylor Coleridge","c":"İnsan Sözü"},{"q":"İyimser, hiçbir zaman fazla deneyimi olmayan kişidir.","a":"Don Marquis","c":"İnsan Sözü"},{"q":"Özgürlüksüz düzen ve düzensiz özgürlük aynı derecede yıkıcıdır.","a":"Theodore Roosevelt","c":"İnsan Sözü"},{"q":"Sözlükler saat gibidir: en kötüsü hiç yoktan iyidir ve en iyinin tam anlamıyla gerçekleşmesi beklenemez.","a":"Samuel Johnson","c":"İnsan Sözü"},{"q":"Suçlu asla affetmez.","a":"George Herbert","c":"İnsan Sözü"},{"q":"Fare yarışının sorunu, kazansanız bile hala bir fare olmanızdır.","a":"Lily Tomlin","c":"İnsan Sözü"},{"q":"Çoğu kişi için tamamen uzak durmak, mükemmel ölçülü olmaktan daha kolaydır.","a":"Augustine of Hippo","c":"İnsan Sözü"},{"q":"Egzersiz saçmalıktır. Sağlıklıysanız buna ihtiyacınız yoktur; hastaysanız almamalısınız.","a":"Henry Ford","c":"İnsan Sözü"},{"q":"Zekamızı nasıl gizleyeceğimizi bilmek büyük zekadır.","a":"François de La Rochefoucauld","c":"İnsan Sözü"},{"q":"Deneme yanılma yoluyla baskı altında en iyi şekilde çalıştığımı buldum. Aslında sadece baskı altında çalışıyorum.","a":"Edward Abbey","c":"İnsan Sözü"},{"q":"Verme lüksünü bilmek için fakir olmak gerekir.","a":"George Eliot","c":"İnsan Sözü"},{"q":"Sonsuz uyanıklık özgürlüğün bedelidir; güç her zaman çoğunluktan azınlığa çalar.","a":"Wendell Phillips","c":"İnsan Sözü"},{"q":"Kendinden nefret ettirmek, kendini sevdirmekten daha zordur.","a":"Pablo Picasso","c":"İnsan Sözü"},{"q":"Evliliğin sorunu, yeterli evlilik olmaması ve çok fazla evlilik olmasıdır.","a":"Christopher Morley","c":"İnsan Sözü"},{"q":"Yalnızca başkaları için yaşanan bir hayat, yaşanmaya değer bir hayattır.","a":"Albert Einstein","c":"İnsan Sözü"},{"q":"Bilgelik, seni ihtiyaç duyduğun durumlara girmekten alıkoyan niteliktir.","a":"Doug Larson","c":"İnsan Sözü"},{"q":"Her hafif varyasyonun, eğer faydalıysa, korunmasını sağlayan bu prensibe Doğal Seçilim adını verdim.","a":"Charles Darwin","c":"İnsan Sözü"},{"q":"Bir adamı ıslah etmeye büyükannesinden başlamalısın.","a":"Victor Hugo","c":"İnsan Sözü"},{"q":"Kendimi ortalama bir adam olarak görüyorum, ancak kendimi ortalama bir adam olarak görüyorum.","a":"Michel de Montaigne","c":"İnsan Sözü"},{"q":"İnsanı insan yapan aklıdır, gücümüz ise ölümsüz ruhumuzdur.","a":"Ovid","c":"İnsan Sözü"},{"q":"Erdem, kıymetli kokular gibidir; tütsülendiğinde ya da ezilince çok hoş kokulu olur.","a":"Francis Bacon","c":"İnsan Sözü"},{"q":"Bir erkeğin öfkelendiğinde sana söylediklerini asla unutma.","a":"Henry Ward Beecher","c":"İnsan Sözü"},{"q":"İngilizceye olan hakimiyetimden yararlanarak hiçbir şey söylemedim.","a":"Robert Benchley","c":"İnsan Sözü"},{"q":"Rekorumu kırdığınız için tebrikler. Her zaman rekorun kırılıncaya kadar ayakta kalacağını düşünmüştüm.","a":"Yogi Berra","c":"İnsan Sözü"},{"q":"İş olmadan tüm hayat çürür.","a":"Albert Camus","c":"İnsan Sözü"},{"q":"Ölüm cesareti olmayan hayat köleliktir.","a":"Seneca","c":"İnsan Sözü"},{"q":"İnsan, yörüngesinden çıkmış, ya da yaratıldığı amaçtan uzaklaşmıştır.","a":"John Muir","c":"İnsan Sözü"},{"q":"Tarihte hiçbir şey bugüne bu kadar benzememişti.","a":"Dwight D. Eisenhower","c":"İnsan Sözü"},{"q":"Kör bir insanın ihtiyacı olan şey öğretmen değil, başka bir benliktir.","a":"Helen Keller","c":"İnsan Sözü"},{"q":"Senin soyundan gelenler meyvelerini toplayacaklar.","a":"Virgil","c":"İnsan Sözü"},{"q":"Beyefendi için eğitim başlar ama okumak, iyi arkadaşlık ve derin düşünmek onu bitirmelidir.","a":"John Locke","c":"İnsan Sözü"},{"q":"Öğretmenliğe devam etmektense yok olmak daha iyiydi.","a":"Thomas Carlyle","c":"İnsan Sözü"},{"q":"Doğanın yapması gereken işler olduğunda, bunu yapacak bir dahi yaratır.","a":"Ralph Waldo Emerson","c":"İnsan Sözü"},{"q":"Aynı fikirde olmadığın kişilere vermediğin sürece özgürlük anlamsızdır.","a":"Thomas Jefferson","c":"İnsan Sözü"},{"q":"İmkansız yalnızca aptalların sözlüğünde bulunan bir kelimedir.","a":"Napoleon Bonaparte","c":"İnsan Sözü"},{"q":"Ölenlerin sayısı yaşayanlardan daha fazla ve sayıları artıyor.","a":"Eugene Ionesco","c":"İnsan Sözü"},{"q":"Kötümser her fırsatta zorluğu görür; Bir iyimser her zorluktaki fırsatı görür.","a":"Winston Churchill","c":"İnsan Sözü"},{"q":"Kelimeleri nadiren kullanmak doğal olmaktır.","a":"Lao Tzu","c":"İnsan Sözü"},{"q":"Her şeyin iki kolu vardır; biri onu taşıyabilecek; yapamayacağı başka bir şey.","a":"Epictetus","c":"İnsan Sözü"},{"q":"Arabanızı asla doğum yaptığınız kimseye ödünç vermeyin.","a":"Erma Bombeck","c":"İnsan Sözü"},{"q":"Kendine karşı tamamen dürüst olmak iyi bir alıştırmadır.","a":"Sigmund Freud","c":"İnsan Sözü"},{"q":"İnsan aklını küçümsemek kötü bir teolojidir.","a":"Gilbert K. Chesterton","c":"İnsan Sözü"},{"q":"Aşk birlikte aptal olmaktır.","a":"Paul Valery","c":"İnsan Sözü"},{"q":"Hayal gücünüz odak dışında olduğunda gözlerinize güvenemezsiniz.","a":"Mark Twain","c":"İnsan Sözü"},{"q":"İnsan sadece işleyerek değil, çoğunlukla ihmal ederek günah işler.","a":"Marcus Aurelius","c":"İnsan Sözü"},{"q":"Bir adamın büyüklüğünü onu kızdıran şeyin büyüklüğünden anlayabilirsiniz.","a":"Adlai Stevenson","c":"İnsan Sözü"},{"q":"Neye bu kadar kaygılandığımı bilseydim bu kadar kaygılı olmazdım.","a":"Mignon McLaughlin","c":"İnsan Sözü"},{"q":"Öfkeliyken konuşun, pişman olacağınız en güzel konuşmayı yapmış olursunuz.","a":"Groucho Marx","c":"İnsan Sözü"},{"q":"Dinler vicdanın büyük masallarıdır.","a":"George Santayana","c":"İnsan Sözü"},{"q":"Bugün bir bilinçaltı reklamcılık yöneticisiyle sadece bir saniyeliğine görüştüm.","a":"Steven Wright","c":"İnsan Sözü"},{"q":"Tavuklarınızı yumurtadan çıkmadan saymayın.","a":"Aesop","c":"İnsan Sözü"},{"q":"CEZALANDIRMA, n. Günah ve ceza arasında zaman açısından orta bir ruh hali.","a":"Ambrose Bierce","c":"İnsan Sözü"},{"q":"Bir seçim yapmak zorunda kaldığınızda ve bunu yapmadığınızda, bu başlı başına bir seçimdir.","a":"William James","c":"İnsan Sözü"},{"q":"Kötü hafızanın avantajı, kişinin ilk kez aynı güzel şeylerden birkaç kez keyif almasıdır.","a":"Friedrich Nietzsche","c":"İnsan Sözü"},{"q":"Büyük bir imparatorluk, tıpkı harika bir pasta gibi, en kolay şekilde kenarlardan küçültülür.","a":"Benjamin Franklin","c":"İnsan Sözü"},{"q":"Kesinlikle imkansız ama olasılıkları var.","a":"Samuel Goldwyn","c":"İnsan Sözü"},{"q":"2000 bin kişinin aynı anda kereviz yediği düşüncesi beni dehşete düşürüyor.","a":"George Bernard Shaw","c":"İnsan Sözü"},{"q":"Hakikatle çarpışmaya dayanamayan bir iman, pek fazla pişmanlığa değmez.","a":"Arthur C. Clarke","c":"İnsan Sözü"},{"q":"Günümüzde ahlak, zenginliğe olan tapınmamız nedeniyle bozulmuş durumda.","a":"Marcus Tullius Cicero","c":"İnsan Sözü"},{"q":"Evli erkekler bekar erkeklerden daha uzun yaşıyor. Ama evli erkekler ölmeye çok daha istekli.","a":"Johnny Carson","c":"İnsan Sözü"},{"q":"Eğlence: Düşünemeyenlerin mutluluğu.","a":"Alexander Pope","c":"İnsan Sözü"},{"q":"Bir aşık evin evcil köpeğiyle iyi geçinmeye çalışır.","a":"Moliere","c":"İnsan Sözü"},{"q":"Güçlü nedenler, güçlü eylemleri doğurur.","a":"William Shakespeare","c":"İnsan Sözü"},{"q":"Kadınlar aşık olmadıklarında deneyimli bir avukatın soğukkanlılığına sahiptirler.","a":"Honore de Balzac","c":"İnsan Sözü"},{"q":"Aktif bir zihne sahip olan herkes ilkelerden ziyade geçici kararlarla yaşar.","a":"Robert Frost","c":"İnsan Sözü"},{"q":"Ama hepsi zamanında.","a":"Miguel de Cervantes","c":"İnsan Sözü"},{"q":"Günümüzün çocukları zalimdir. Anne-babalarına karşı çıkıyorlar, yemeklerini silip süpürüyorlar ve öğretmenlerine zulmediyorlar.","a":"Socrates","c":"İnsan Sözü"},{"q":"İki çubukla ateş yakmanın en iyi yolu, bunlardan birinin kibrit olduğundan emin olmaktır.","a":"Will Rogers","c":"İnsan Sözü"},{"q":"Bu topraklarda büyüyen ve çürüyen bitki örtüsü nitrojen oksitlerin yüzde 93'ünden sorumludur.","a":"Ronald Reagan","c":"İnsan Sözü"},{"q":"Meşgul olmak yetmez; karıncalar da öyle. Soru şu: Neyle meşgulüz?","a":"Henry David Thoreau","c":"İnsan Sözü"},{"q":"Erkekler zengin olmayı değil, diğer erkeklerden daha zengin olmayı arzularlar.","a":"John Stuart Mill","c":"İnsan Sözü"},{"q":"Sanat bir tür katarsistir.","a":"Dorothy Parker","c":"İnsan Sözü"},{"q":"Apaçık olanın analizini yapmak çok sıradışı bir zihin gerektirir.","a":"Alfred North Whitehead","c":"İnsan Sözü"},{"q":"İşler iyi gitmediğinde Başkanları suçlamayı seviyorlar; ve bu Başkanlara ödenen bir şey.","a":"John F. Kennedy","c":"İnsan Sözü"},{"q":"Öfkeyle geriye, korkuyla ileriye değil, farkındalıkla çevremize bakalım.","a":"James Thurber","c":"İnsan Sözü"},{"q":"Hiçbir şey hareket etmediği halde neden buna yoğun saat diyorlar?","a":"Robin Williams","c":"İnsan Sözü"},{"q":"Tavuk, yumurtanın daha fazla yumurta alma fikriydi.","a":"Samuel Butler","c":"İnsan Sözü"},{"q":"Ve sonuçta önemli olan hayatınızdaki yıllar değil. Bu senin yıllarındaki hayat.","a":"Abraham Lincoln","c":"İnsan Sözü"},{"q":"Reklam ajansı: yüzde seksen beş kafa karışıklığı ve yüzde on beş komisyon.","a":"Fred Allen","c":"İnsan Sözü"},{"q":"İnsanları oldukları gibi değil, olmaları gerektiği gibi çizmeyi kendine görev edinmiş, pohpohlayıcı bir ressam.","a":"Oliver Goldsmith","c":"İnsan Sözü"},{"q":"Hayat, kişinin kendisi için yapması için başkalarına para ödeyebileceği bir şeyi kendisi için yapmak için çok kısa.","a":"W. Somerset Maugham","c":"İnsan Sözü"},{"q":"Agamemnon'dan önce cesur adamlar yaşıyordu.","a":"Horace","c":"İnsan Sözü"},{"q":"Pek çok erkek, yaşadıklarını aynı zamanda anladıklarını da sanıyor.","a":"Johann Wolfgang von Goethe","c":"İnsan Sözü"},{"q":"Bu mektubu her zamankinden daha uzun yazdım çünkü kısaltacak zamanım yok.","a":"Blaise Pascal","c":"İnsan Sözü"},{"q":"Bir güce sahip olan ama yeni kazanmış olanın ruh hali her zaman serttir.","a":"Aeschylus","c":"İnsan Sözü"},{"q":"Aşk teleskopla bakar; kıskançlık, mikroskopla.","a":"Josh Billings","c":"İnsan Sözü"},{"q":"Vizyon, görünmeyen şeyleri görme sanatıdır.","a":"Jonathan Swift","c":"İnsan Sözü"},{"q":"Bir insanın hayatında hepimizin yaşadığı o ilk sarsıntı, bizi ilk kez düşünmeye iter.","a":"Benjamin Disraeli","c":"İnsan Sözü"},{"q":"İnsanları ilkelerden daha çok seviyorum ve ilkeleri olmayan insanları da dünyadaki her şeyden daha çok seviyorum.","a":"Oscar Wilde","c":"İnsan Sözü"},{"q":"Yıllar, uzuvdan güç gibi zihinden Ateşi çalar, Ve hayatın büyülü kadehi ama ağzına yakın parıldar.","a":"Lord Byron","c":"İnsan Sözü"},{"q":"Özgürlüğün gerçek karakteri, zorla sağlanan bağımsızlıktır.","a":"Voltaire","c":"İnsan Sözü"},{"q":"Dünyayı tersine çevirdiğinizde, başıboş kalan her şey Los Angeles'a inecek.","a":"Frank Lloyd Wright","c":"İnsan Sözü"},{"q":"Hiçbir yeteneğe sahip olmamak artık yeterli değil.","a":"Gore Vidal","c":"İnsan Sözü"},{"q":"Hiç kimse sizin rızanız olmadan size kendinizi aşağılık hissettiremez.","a":"Eleanor Roosevelt","c":"İnsan Sözü"},{"q":"Yalnızca ademi merkeziyetçiliğe ve kendi kendine yetmeye yönelik büyük ölçekli bir halk hareketi, devletçiliğe yönelik mevcut eğilimi durdurabilir.","a":"Aldous Huxley","c":"İnsan Sözü"},{"q":"Zeki kedi peynir yiyor ve yem nefesiyle fare deliklerinden nefes alıyor.","a":"W. C. Fields","c":"İnsan Sözü"},{"q":"Dürüstlük çoğunlukla sahtekârlıktan daha az kârlıdır.","a":"Plato","c":"İnsan Sözü"},{"q":"Özel girişim, serbest girişim olmaktan çıkıyor.","a":"Franklin D. Roosevelt","c":"İnsan Sözü"},{"q":"Başarım daha yüksek sınıftaki kadınlarla öne çıkmamı sağladı.","a":"Woody Allen","c":"İnsan Sözü"},{"q":"Yapmayı öğrenmemiz gerekeni yaparak öğreniyoruz.","a":"Aristotle","c":"İnsan Sözü"},{"q":"İnsanoğlunun kullandığı en güçlü ilaç elbette ki kelimelerdir.","a":"Rudyard Kipling","c":"İnsan Sözü"},{"q":"Kimin öküzü boynuzluysa fark yaratır.","a":"Martin Luther","c":"İnsan Sözü"},{"q":"[Yalnızca] kozmetik açıdan yanlış olan hataları kabul etmek zor değil.","a":"John Kenneth Galbraith","c":"İnsan Sözü"},{"q":"Altmışlı yıllar sana güzeldi değil mi?","a":"George Carlin","c":"İnsan Sözü"},{"q":"Zaman, gençliğin acısını siler.","a":"Euripides","c":"İnsan Sözü"},{"q":"Pek çok itibarlı erkek sokakta karşılaşsa karakterini bilmez.","a":"Elbert Hubbard","c":"İnsan Sözü"},{"q":"Köleliği tercih eden bir halkı özgürleştirmek ne kadar tehlikelidir.","a":"Niccolo Machiavelli","c":"İnsan Sözü"},{"q":"Kitaplar kendi açılarından yeterince iyidir, ancak yaşamın kansız bir ikamesidirler.","a":"Robert Louis Stevenson","c":"İnsan Sözü"},{"q":"Sermayenin kendisi kötü değildir; kötü olan onun yanlış kullanılmasıdır.","a":"Mahatma Gandhi","c":"İnsan Sözü"},{"q":"Bir milyon dolar nasıl kazanılır: Önce bir milyon dolar kazanın.","a":"Steve Martin","c":"İnsan Sözü"},{"q":"Hayatı bilmiyorsak ölümü nasıl bilebiliriz?","a":"Confucius","c":"İnsan Sözü"},{"q":"Yine de güzelliğin, yaralayıcı da olsa tuhaf bir gücü vardır, Hakaretten sonra geri döner, bir zamanlar sahip olunan Sevgiyi yeniden kazanır.","a":"John Milton","c":"İnsan Sözü"},{"q":"Başarısız olmadım. İşe yaramayan 1000 şey keşfettim.","a":"Thomas Edison","c":"İnsan Sözü"},{"q":"Düşünceler elin gücünden daha güçlüdür.","a":"Sophocles","c":"İnsan Sözü"},{"q":"Sözünüzü tutmaktan daha kötüsünü yapmaktan daha iyidir.","a":"Thomas Fuller","c":"İnsan Sözü"},{"q":"İnsanın karakteri kaderidir.","a":"Heraclitus","c":"İnsan Sözü"},{"q":"Tamamen inanmadığınız sürece neye inandığınızın pek önemi yoktur.","a":"Bertrand Russell","c":"İnsan Sözü"},{"q":"Zekayı güçlendirerek ahlâkı saflaştıran incelik ancak yerinde bir tarzla ifade edilebilir.","a":"Samuel Taylor Coleridge","c":"İnsan Sözü"},{"q":"Dürüstlük güzel şeydir ama kontrol altında tutulmadıkça sahibine faydası yoktur.","a":"Don Marquis","c":"İnsan Sözü"},{"q":"Hiç kimse kanunun üstünde ve hiç kimse kanunun altında değildir.","a":"Theodore Roosevelt","c":"İnsan Sözü"},{"q":"Halka açık eğlencelerin çok iyi bir dostuyum çünkü insanları ahlaksızlıktan uzak tutuyorlar.","a":"Samuel Johnson","c":"İnsan Sözü"},{"q":"Doğru olmaya cesaret edin: hiçbir şeyin yalana ihtiyacı yoktur; yalana sığınan bir kusur böylece iki kat büyür.","a":"George Herbert","c":"İnsan Sözü"},{"q":"Bu kültürde o kadar çok plastik var ki, vinil leopar derisi nesli tükenmekte olan bir sentetik haline geliyor.","a":"Lily Tomlin","c":"İnsan Sözü"},{"q":"Benim liyakatımın yeterliliği, liyakatimin yeterli olmadığını bilmektir.","a":"Augustine of Hippo","c":"İnsan Sözü"},{"q":"Sıkıcı, ağzını açan ve yeteneklerini ağzına koyan adamdır.","a":"Henry Ford","c":"İnsan Sözü"},{"q":"Çok iyi niteliklere sahip olmak yeterli değil, onların yönetimini de elimizde tutmalıyız.","a":"François de La Rochefoucauld","c":"İnsan Sözü"},{"q":"Hem metafizikte hem de sanatta dürüstlük en iyi politikadır. Temiz tut.","a":"Edward Abbey","c":"İnsan Sözü"},{"q":"Aptal, sana her zaman fikirlerini sunan adamdır.","a":"George Eliot","c":"İnsan Sözü"},{"q":"Sonsuz uyanıklık özgürlüğün bedelidir.","a":"Wendell Phillips","c":"İnsan Sözü"},{"q":"Nesneleri gördüğüm gibi değil, düşündüğüm gibi boyuyorum.","a":"Pablo Picasso","c":"İnsan Sözü"},{"q":"İnsan, taşınabilir su tesisatının ustaca bir birleşimidir.","a":"Christopher Morley","c":"İnsan Sözü"},{"q":"Eğer insanlar sırf cezadan korktukları ve ödül almayı umdukları için iyiyseler, o zaman biz gerçekten çok zavallıyız.","a":"Albert Einstein","c":"İnsan Sözü"},{"q":"İmkansızı başarmak, yalnızca patronun bunu normal görevlerinize ekleyeceği anlamına gelir.","a":"Doug Larson","c":"İnsan Sözü"},{"q":"Şimdi Varoluş Mücadelesini biraz daha detaylı ele alacağız.","a":"Charles Darwin","c":"İnsan Sözü"},{"q":"Sokaklarda yapmadıkları ve atları korkutmadıkları sürece Kongre'nin ne yaptığı beni ilgilendirmiyor.","a":"Victor Hugo","c":"İnsan Sözü"},{"q":"Hafızası iyi olmayan biri asla yalan mesleğini üstlenmemelidir.","a":"Michel de Montaigne","c":"İnsan Sözü"},{"q":"Aşk ve öksürük gizlenmez.","a":"Ovid","c":"İnsan Sözü"},{"q":"Ateizm insanın kalbinden çok hayatındadır.","a":"Francis Bacon","c":"İnsan Sözü"},{"q":"Bir insan bulunduğu yerde Hristiyan olamıyorsa, hiçbir yerde Hristiyan olamaz.","a":"Henry Ward Beecher","c":"İnsan Sözü"},{"q":"Aile gelirini paylaştırmanın birkaç yolu var ama hepsi yetersiz.","a":"Robert Benchley","c":"İnsan Sözü"},{"q":"Bir yol ayrımına gelirseniz alın.","a":"Yogi Berra","c":"İnsan Sözü"},{"q":"Cazibenin ne olduğunu bilirsin: net bir soru sormadan evet cevabını almanın bir yolu.","a":"Albert Camus","c":"İnsan Sözü"},{"q":"Hiçbir şey sakin bir zihnin teselli bulamayacağı kadar acı değildir.","a":"Seneca","c":"İnsan Sözü"},{"q":"Yaşayan kayaya yeniden dokunmaktan ve başımı yüksek dağ gökyüzüne daldırmaktan her zaman mutluluk duyuyorum.","a":"John Muir","c":"İnsan Sözü"},{"q":"Ben size işaret verene kadar hayatınızı gereksiz yere tehlikeye atmayın.","a":"Dwight D. Eisenhower","c":"İnsan Sözü"},{"q":"orsan et haec olim meminisse iuvabit. (Ve belki daha sonraki bir tarihte bunları hatırlamak hoş olacaktır.)","a":"Virgil","c":"İnsan Sözü"},{"q":"Yeni görüşlerden her zaman şüphelenilir ve genellikle başka bir neden olmaksızın, yalnızca yaygın olmadıkları için karşı çıkarlar.","a":"John Locke","c":"İnsan Sözü"},{"q":"Zeki adamlar iyidir ama en iyisi değiller.","a":"Thomas Carlyle","c":"İnsan Sözü"},{"q":"Okulda öğretilenler eğitim değil, eğitim aracıdır.","a":"Ralph Waldo Emerson","c":"İnsan Sözü"},{"q":"Özgürlüğün bedeli sonsuz uyanıklıktır.","a":"Thomas Jefferson","c":"İnsan Sözü"},{"q":"Hiç kimseyi aşk uğruna sevmedim, belki Josephine dışında - birazcık.","a":"Napoleon Bonaparte","c":"İnsan Sözü"},{"q":"Her zaman kendin olma hatasını yaptın.","a":"Eugene Ionesco","c":"İnsan Sözü"},{"q":"Hayat çenenizi kapalı tutma fırsatlarıyla doludur.","a":"Winston Churchill","c":"İnsan Sözü"},{"q":"Yeterince yeterli olduğunu bilen, her zaman yeterli olacaktır.","a":"Lao Tzu","c":"İnsan Sözü"},{"q":"Erkeklerin bazı şeyleri kolaylıkla itiraf ettiği, bazılarını ise zorlukla itiraf ettiği şeyler vardır.","a":"Epictetus","c":"İnsan Sözü"},{"q":"İşi isteyecek kadar aptal kimseyi seçmek istemediğim noktaya hızla yaklaşıyorum.","a":"Erma Bombeck","c":"İnsan Sözü"},{"q":"Kendini bilmek saldırganlığın nihai biçimidir.","a":"Sigmund Freud","c":"İnsan Sözü"},{"q":"Hoşgörü, inançsız adamın erdemidir.","a":"Gilbert K. Chesterton","c":"İnsan Sözü"},{"q":"Bir şiir hiçbir zaman bitmez, yalnızca yarım bırakılır.","a":"Paul Valery","c":"İnsan Sözü"},{"q":"Yaş, maddeden ziyade akıl meselesidir. Eğer sakıncası yoksa, önemli değil.","a":"Mark Twain","c":"İnsan Sözü"},{"q":"Ayağa kalkmak mı yoksa hazır olmak mı?","a":"Marcus Aurelius","c":"İnsan Sözü"},{"q":"Dünyanın çılgınları birleşin! Boyunduruklarınızdan başka kaybedecek hiçbir şeyiniz yok.","a":"Adlai Stevenson","c":"İnsan Sözü"},{"q":"Birçok kişi günahta beceriksiz davranarak günahtan kurtulur.","a":"Mignon McLaughlin","c":"İnsan Sözü"},{"q":"Çatı katı olup da kaybetmek, hiç çatı katı yapmamaktan daha iyidir.","a":"Groucho Marx","c":"İnsan Sözü"},{"q":"İffet gibi şüphecilikten de kolay kolay vazgeçilmemeli.","a":"George Santayana","c":"İnsan Sözü"},{"q":"Bir restoranda herhangi bir zamanda kahvaltı yazan bir tabela gördüm. Bu yüzden Rönesans'ta Fransız Tostu sipariş ettim.","a":"Steven Wright","c":"İnsan Sözü"},{"q":"Dileklerimizin gerçekleşmesine çoğu zaman üzülürdük.","a":"Aesop","c":"İnsan Sözü"},{"q":"Sabır: Bir erdem olarak gizlenen küçük bir umutsuzluk biçimi.","a":"Ambrose Bierce","c":"İnsan Sözü"}];
try{ window.SOZLER=SOZLER; }catch(e){}
/* v3.2.5 — 1000 kişi sözü; ek havuz public-domain quote corpusundan seçildi. */
const SOZ_AUTHOR_GUARD=3;
let sozRecentAuthors=[];
function sozAuthorKey(x){return String((x&&x.a)||"").trim().toLocaleLowerCase("tr-TR")}
function sozRand(max){
  if(max<=1)return 0;
  try{if(window.crypto&&crypto.getRandomValues){const a=new Uint32Array(1);crypto.getRandomValues(a);return a[0]%max}}catch(e){}
  return Math.floor(Math.random()*max);
}
function sozRandomIndex(exclude=-1,blockedAuthors=sozRecentAuthors){
  if(!SOZLER.length)return -1;
  if(SOZLER.length===1)return 0;
  const blocked=new Set((blockedAuthors||[]).map(x=>String(x||"").toLocaleLowerCase("tr-TR")).filter(Boolean));
  let pool=[];
  for(let i=0;i<SOZLER.length;i++)if(i!==exclude&&!blocked.has(sozAuthorKey(SOZLER[i])))pool.push(i);
  /* Çok küçük/bozuk bir havuz oluşursa engeli en eskiden başlayarak gevşet. */
  if(!pool.length){
    const hist=Array.from(blockedAuthors||[]);
    while(hist.length&&!pool.length){hist.shift();const b=new Set(hist.map(x=>String(x||"").toLocaleLowerCase("tr-TR")));for(let i=0;i<SOZLER.length;i++)if(i!==exclude&&!b.has(sozAuthorKey(SOZLER[i])))pool.push(i)}
  }
  if(!pool.length)for(let i=0;i<SOZLER.length;i++)if(i!==exclude)pool.push(i);
  return pool.length?pool[sozRand(pool.length)]:0;
}
function sozRememberIndex(i){
  const a=sozAuthorKey(SOZLER[i]);if(!a)return;
  sozRecentAuthors.push(a);
  if(sozRecentAuthors.length>SOZ_AUTHOR_GUARD)sozRecentAuthors.splice(0,sozRecentAuthors.length-SOZ_AUTHOR_GUARD);
}
let sozCurrentIndex=-1;
function sozSetRandom(exclude=sozCurrentIndex){
  const i=sozRandomIndex(exclude,sozRecentAuthors);
  if(i>=0){sozCurrentIndex=i;sozRememberIndex(i)}
  return i;
}
sozSetRandom(-1);
function sozIndex(){
  if(sozCurrentIndex<0||sozCurrentIndex>=SOZLER.length){sozRecentAuthors=[];sozSetRandom(-1)}
  return sozCurrentIndex;
}
function gununSozu(){ const i=sozIndex(); return i>=0?SOZLER[i].q:""; }
function yeniSoz(){
  /* Son 3 yazarı da engelleyerek gerçek rastgele insan sözü seç. */
  sozSetRandom(sozIndex());
  renderSoz();
  return true;
}
function aktifSozIndex(){ return sozIndex(); }
function renderSoz(){
  const w=el("sozBox"); if(!w)return;
  if(S.sozKapali){ w.style.display="none"; return; }
  w.style.display="flex";
  const soz=SOZLER[aktifSozIndex()];
  w.innerHTML='<span class="szwrap"><span class="sz">“'+esc(soz.q)+'”</span>'+
    '<span class="sza">— '+esc(soz.a)+'</span></span>'+
    '<button class="szr" onclick="yeniSoz()" title="Başka bir söz" aria-label="Başka bir söz">↻</button>';
}
function toggleSoz(){
  S.sozKapali=!S.sozKapali; save();
  renderSoz(); renderSozAyar();
  toast(S.sozKapali?"Günün sözü kapatıldı":"Günün sözü açıldı");
  return !S.sozKapali;
}
function renderSozAyar(){
  const t=el("sozToggle");
  if(t)t.classList.toggle("on",!S.sozKapali);
}

/* ==================================================================
   1) YANLIŞLARIN DERS İÇİ DAĞILIMI
   Bir dersi seç, o dersin yanlışları konu konu dökülsün.
   ================================================================== */
let wdSubject="";
try{ window.wdSubject=wdSubject; }catch(e){}
function wdSubjects(){
  const m={};
  S.wrongLog.forEach(w=>{
    const d=(w.subject||"").trim();
    if(!d)return;
    m[d]=(m[d]||0)+(w.n|0||1);
  });
  return Object.keys(m).map(d=>({ad:d,n:m[d]})).sort((a,b)=>b.n-a.n);
}
function setWdSubject(d){
  wdSubject=(wdSubject===d)?"":d;
  try{ window.wdSubject=wdSubject; }catch(e){}
  renderWrongDist();
}
function wrongDist(ders,gun){
  const cut=gun?addDaysKey(todayKey(),-gun):"";
  const m={};
  let top=0;
  S.wrongLog.forEach(w=>{
    if(ders&&(w.subject||"")!==ders)return;
    if(cut&&String(w.date)<cut)return;
    const k=(w.topic||"(konu yazılmamış)").trim()||"(konu yazılmamış)";
    const n=w.n|0||1;
    if(!m[k])m[k]={ad:k,n:0,kez:0,son:"",kind:{}};
    m[k].n+=n; m[k].kez++;
    if(String(w.date)>m[k].son)m[k].son=String(w.date);
    if(w.kind)m[k].kind[w.kind]=(m[k].kind[w.kind]||0)+n;
    top+=n;
  });
  const list=Object.keys(m).map(k=>{
    const x=m[k];
    x.pay=top?Math.round(x.n/top*100):0;
    /* baskın sebep */
    let en="",enN=0;
    Object.keys(x.kind).forEach(s=>{ if(x.kind[s]>enN){ enN=x.kind[s]; en=s; } });
    x.sebep=en;
    return x;
  }).sort((a,b)=>b.n-a.n);
  return {list:list,top:top};
}
function renderWrongDist(){
  const w=el("wdBox"); if(!w)return;
  const dersler=wdSubjects();
  const chips=el("wdChips");
  if(chips){
    chips.innerHTML=dersler.length
      ? dersler.map(d=>'<button class="chip '+(wdSubject===d.ad?"on":"")+
          '" onclick="setWdSubject(\''+String(d.ad).replace(/'/g,"\\'")+'\')">'+
          esc(d.ad)+' <b>'+d.n+'</b></button>').join("")
      : "";
  }
  if(!dersler.length){
    w.innerHTML='<div class="empty">Yanlış defterine kayıt ekledikçe, her dersin yanlışlarının hangi konulardan geldiği burada dökülür.</div>';
    return;
  }
  const d=wrongDist(wdSubject,0);
  if(!d.list.length){
    w.innerHTML='<div class="empty">Bu derste kayıt yok.</div>';
    return;
  }
  const SEBEP={bilmiyordum:"bilgi eksiği",dikkat:"dikkatsizlik",sure:"süre"};
  let h='<p class="hint" style="margin:0 0 10px;">'+
    (wdSubject?esc(wdSubject):"Tüm dersler")+' · toplam '+d.top+' yanlış</p>';
  h+=d.list.slice(0,14).map(x=>
    '<div class="ctrow"><div class="ctline"><span class="k">'+esc(x.ad)+
    (x.sebep?' <small style="color:var(--label-3)">'+SEBEP[x.sebep]+'</small>':"")+'</span>'+
    '<span class="v">'+x.n+' · %'+x.pay+'</span></div>'+
    '<div class="bar"><i style="width:'+x.pay+'%"></i></div></div>').join("");
  if(d.list.length>14)h+='<p class="hint">ve '+(d.list.length-14)+' konu daha</p>';
  /* yorum */
  const en=d.list[0];
  if(en&&en.pay>=30)
    h+='<p class="hint"><b>'+esc(en.ad)+'</b> tek başına yanlışların %'+en.pay+
       '\'ini oluşturuyor. Bu dersi bütün olarak tekrar etmek yerine buradan başlamak daha hızlı sonuç verir.</p>';
  else if(d.list.length>=6)
    h+='<p class="hint">Yanlışlar birçok konuya yayılmış. Tek bir konuyu değil, dersin geneline bakmak gerekiyor.</p>';
  w.innerHTML=h;
}

/* ==================================================================
   2) TEKRAR EDEN HATALAR
   Aynı konuda kaç ayrı gün yanlış yaptın?
   ================================================================== */
function repeatErrors(){
  const m={};
  S.wrongLog.forEach(w=>{
    const ad=((w.subject||"")+" · "+(w.topic||"")).trim();
    if(!w.topic)return;
    if(!m[ad])m[ad]={ad:ad,subject:w.subject,topic:w.topic,
      gunler:{},toplam:0,ilk:"",son:""};
    const x=m[ad];
    x.gunler[String(w.date)]=1;
    x.toplam+=(w.n|0||1);
    if(!x.ilk||String(w.date)<x.ilk)x.ilk=String(w.date);
    if(String(w.date)>x.son)x.son=String(w.date);
  });
  const list=Object.keys(m).map(k=>{
    const x=m[k];
    x.kez=Object.keys(x.gunler).length;
    x.araGun=(x.ilk&&x.son)?Math.round((parseKey(x.son)-parseKey(x.ilk))/86400000):0;
    /* konunun durumu */
    const key=(typeof topicKeyOf==="function")?topicKeyOf(x.subject,x.topic):null;
    const t=key?S.topics[key]:null;
    x.st=t?(t.st|0):0;
    x.key=key;
    return x;
  }).filter(x=>x.kez>=2);
  list.sort((a,b)=>(b.kez-a.kez)||(b.toplam-a.toplam));
  return list;
}
function renderRepeat(){
  const w=el("repBox"); if(!w)return;
  const list=repeatErrors();
  if(!list.length){
    w.innerHTML='<div class="empty">Aynı konudan iki ayrı günde yanlış yaptığında burada listelenir. Tekrar eden hatalar, tek seferlik hatalardan farklıdır — onlar yöntem sorununa işaret eder.</div>';
    return;
  }
  const ST=["hiç işlemedin","başladın","işledin","pekiştirdin"];
  let h=list.slice(0,10).map(x=>{
    const uyari=(x.st===3&&x.kez>=3);
    return '<div class="dayrow"><span class="k">'+esc(x.ad)+
      '<br><small'+(uyari?' style="color:var(--danger)"':'')+'>'+
      x.kez+' ayrı gün · '+x.toplam+' yanlış · '+ST[x.st]+
      (x.araGun>0?' · '+x.araGun+' gün aralıkla':'')+'</small></span>'+
      '<span class="v">'+x.kez+'×'+
      (x.key?' <button class="btn ghost tiny" onclick="repGoTopic(\''+
        String(x.subject).replace(/'/g,"\\'")+'\',\''+String(x.topic).replace(/'/g,"\\'")+'\')">video</button>':"")+
      '</span></div>';
  }).join("");
  const inatci=list.filter(x=>x.st===3&&x.kez>=3);
  if(inatci.length){
    h+='<p class="hint"><b>Dikkat:</b> '+inatci.map(x=>esc(x.topic)).join(", ")+
       ' konularını pekiştirdiğini işaretlemişsin ama hâlâ yanlış geliyor. '+
       'Pekiştirme işareti erken konmuş olabilir; bu konuları yeniden açmayı düşün.</p>';
  } else if(list.length>=3){
    h+='<p class="hint">Bu konular birden çok kez karşına çıktı. Aynı kaynaktan tekrar etmek yerine '+
       'farklı bir anlatım ya da daha bol soru denemek işe yarayabilir.</p>';
  }
  w.innerHTML=h;
}
function repGoTopic(subject,topic){
  if(typeof openVideos!=="function")return false;
  return openVideos(subject+" "+topic+" konu anlatımı YKS",subject+" · "+topic,
    {subject:subject,topic:topic});
}
function reopenTopic(subject,topic){
  const key=(typeof topicKeyOf==="function")?topicKeyOf(subject,topic):null;
  if(!key){ toast("Konu bulunamadı"); return false; }
  if(typeof tsetStatus!=="function")return false;
  tsetStatus(key,2);
  toast(topic+" yeniden \"işledim\" seviyesine alındı");
  renderRepeat();
  if(el("topics")&&el("topics").classList.contains("active"))renderSubjects();
  return true;
}

/* ==================================================================
   3) GÜN BAŞLANGIÇ SAATİ
   İlk kaydın saat kaçta? Zamanla erkene çekiliyor mu?
   ================================================================== */
function startTimes(gun){
  const cut=addDaysKey(todayKey(),-(gun||60));
  const list=[];
  Object.keys(S.sessions||{}).forEach(k=>{
    if(k<cut)return;
    const se=(S.sessions[k]||[]).filter(x=>x&&x.type==="work"&&x.t);
    if(!se.length)return;
    const ilk=Math.min.apply(null,se.map(x=>x.t));
    const d=new Date(ilk);
    const saat=d.getHours()+d.getMinutes()/60;
    if(!isFinite(saat))return;
    list.push({gun:k,saat:saat,ts:ilk});
  });
  if(!list.length)return null;
  list.sort((a,b)=>a.gun.localeCompare(b.gun));
  const ort=a=>a.reduce((x,y)=>x+y.saat,0)/a.length;
  const yari=Math.floor(list.length/2);
  const eski=list.slice(0,yari),yeni=list.slice(yari);
  return {list:list,ortalama:ort(list),
    eskiOrt:eski.length?ort(eski):null,
    yeniOrt:yeni.length?ort(yeni):null,
    enErken:list.reduce((a,b)=>b.saat<a.saat?b:a),
    enGec:list.reduce((a,b)=>b.saat>a.saat?b:a)};
}
function fmtSaat(x){
  const h=Math.floor(x),m=Math.round((x-h)*60);
  return String(h).padStart(2,"0")+":"+String(m===60?0:m).padStart(2,"0");
}
function renderStart(){
  const w=el("stBox"); if(!w)return;
  const d=startTimes(60);
  if(!d||d.list.length<3){
    w.innerHTML='<div class="empty">Odak ekranında birkaç gün çalıştıktan sonra, güne kaçta başladığın ve bunun zamanla değişip değişmediği burada çıkar.</div>';
    return;
  }
  let h='<div class="dayrow"><span class="k">Ortalama başlangıç</span><span class="v">'+
    fmtSaat(d.ortalama)+'</span></div>'+
    '<div class="dayrow"><span class="k">En erken</span><span class="v">'+fmtSaat(d.enErken.saat)+
    ' <small>'+parseKey(d.enErken.gun).toLocaleDateString("tr-TR",{day:"numeric",month:"short"})+'</small></span></div>'+
    '<div class="dayrow"><span class="k">En geç</span><span class="v">'+fmtSaat(d.enGec.saat)+
    ' <small>'+parseKey(d.enGec.gun).toLocaleDateString("tr-TR",{day:"numeric",month:"short"})+'</small></span></div>'+
    '<div class="dayrow"><span class="k">Kayıtlı gün</span><span class="v">'+d.list.length+'</span></div>';
  /* nokta grafiği: 0-24 arası */
  const son=d.list.slice(-30);
  h+='<p class="eyebrow" style="margin:16px 0 6px;">Son '+son.length+' gün</p>';
  h+='<div class="startwrap">'+son.map(x=>{
    const p=Math.max(0,Math.min(100,(x.saat/24)*100));
    return '<div class="strow" title="'+x.gun+' · '+fmtSaat(x.saat)+'">'+
      '<i style="left:'+p+'%"></i></div>';
  }).join("")+'</div>'+
  '<div class="hourlbl"><span>00</span><span>06</span><span>12</span><span>18</span><span>24</span></div>';
  /* eğilim */
  if(d.eskiOrt!==null&&d.yeniOrt!==null&&d.list.length>=6){
    const fark=d.yeniOrt-d.eskiOrt;
    const dk=Math.abs(Math.round(fark*60));
    if(dk>=20){
      h+='<p class="hint"><b>'+(fark<0?"Güne daha erken başlıyorsun.":"Güne daha geç başlıyorsun.")+'</b> '+
        'Son yarıda ortalama '+dk+' dakika '+(fark<0?"erken":"geç")+
        ' (önce '+fmtSaat(d.eskiOrt)+', şimdi '+fmtSaat(d.yeniOrt)+').</p>';
    } else {
      h+='<p class="hint">Başlangıç saatin son dönemde belirgin değişmedi (ortalama '+
        fmtSaat(d.ortalama)+').</p>';
    }
  }
  h+='<p class="hint">Bu, ilk pomodoro/kronometre kaydının saatidir. Erken başlamak tek başına iyi değildir — '+
     'ama başlangıç saatinin her gün savrulması, düzenin oturmadığını gösterir.</p>';
  w.innerHTML=h;
}

/* ==================================================================
   4) VİDEO İZLEME GEÇMİŞİ — HOCA BAZLI
   ================================================================== */
function watchStats(){
  const m=watchedMap();
  const hoca={},ders={};
  let toplam=0,hocaBilinen=0;
  const gunler={};
  Object.keys(m).forEach(id=>{
    const x=m[id]||{};
    toplam++;
    const ad=(x.hoca||x.ch||"").trim();
    if(ad){
      hocaBilinen++;
      if(!hoca[ad])hoca[ad]={ad:ad,n:0,son:0,dersler:{}};
      hoca[ad].n++;
      if((x.at|0)>hoca[ad].son)hoca[ad].son=x.at|0;
      if(x.subj)hoca[ad].dersler[x.subj]=(hoca[ad].dersler[x.subj]||0)+1;
    }
    if(x.subj)ders[x.subj]=(ders[x.subj]||0)+1;
    if(x.at){
      const g=keyOf(new Date(x.at));
      gunler[g]=(gunler[g]||0)+1;
    }
  });
  const hocaList=Object.keys(hoca).map(k=>hoca[k]).sort((a,b)=>b.n-a.n);
  const dersList=Object.keys(ders).map(k=>({ad:k,n:ders[k]})).sort((a,b)=>b.n-a.n);
  /* son 30 gün */
  const cut=addDaysKey(todayKey(),-30);
  let son30=0;
  Object.keys(gunler).forEach(g=>{ if(g>=cut)son30+=gunler[g]; });
  return {toplam:toplam,hoca:hocaList,ders:dersList,son30:son30,
    hocaBilinen:hocaBilinen,gunSayisi:Object.keys(gunler).length};
}
function renderWatchStats(){
  const w=el("wsBox"); if(!w)return;
  const d=watchStats();
  if(!d.toplam){
    w.innerHTML='<div class="empty">Video listesinde ✓ ile işaretlediğin videolar burada toplanır. Hangi hocayı ne kadar izlediğini, hangi derse yoğunlaştığını görürsün.</div>';
    return;
  }
  let h='<div class="dayrow"><span class="k">İzlenen video</span><span class="v">'+d.toplam+'</span></div>'+
    '<div class="dayrow"><span class="k">Son 30 gün</span><span class="v">'+d.son30+'</span></div>';
  if(d.hoca.length){
    h+='<p class="eyebrow" style="margin:16px 0 6px;">Hocalara göre</p>';
    const enCok=d.hoca[0].n;
    h+=d.hoca.slice(0,10).map(x=>{
      const p=Math.round(x.n/enCok*100);
      const ders=Object.keys(x.dersler).slice(0,2).join(", ");
      return '<div class="ctrow"><div class="ctline"><span class="k">'+esc(x.ad)+
        (ders?' <small style="color:var(--label-3)">'+esc(ders)+'</small>':"")+'</span>'+
        '<span class="v">'+x.n+'</span></div>'+
        '<div class="bar"><i style="width:'+p+'%"></i></div></div>';
    }).join("");
  }
  if(d.ders.length){
    h+='<p class="eyebrow" style="margin:16px 0 6px;">Derslere göre</p>'+
      '<div class="chips">'+d.ders.slice(0,12).map(x=>
        '<span class="chip">'+esc(x.ad)+' <b>'+x.n+'</b></span>').join("")+'</div>';
  }
  if(d.toplam-d.hocaBilinen>0)
    h+='<p class="hint">'+(d.toplam-d.hocaBilinen)+' videoda kanal bilgisi yok — bunlar eski kayıtlar olabilir.</p>';
  if(d.hoca.length>=2){
    const ilk=d.hoca[0],pay=Math.round(ilk.n/d.hocaBilinen*100);
    if(pay>=60)
      h+='<p class="hint"><b>'+esc(ilk.ad)+'</b> izlediklerinin %'+pay+'\'ini oluşturuyor. '+
         'Anlatımı sana uyuyorsa iyi; ama takıldığın bir konuda ikinci bir anlatım denemek çoğu zaman işe yarar.</p>';
  }
  w.innerHTML=h;
}

/* ==================================================================
   BAŞLATMA
   ================================================================== */
function renderRound19(){
  renderWrongDist(); renderRepeat(); renderStart(); renderWatchStats();
  renderSoz(); renderSozAyar();
}
function boot20(){
  boot19();
  perfAfterPaint("boot-round19",()=>renderRound19());
}
function runBuiltInSelfTest(){
  const sample="PL1234567890abcdef";
  const parsed=playlistIdFromUrl("https://www.youtube.com/playlist?list="+sample)===sample;
  const ids=[...document.querySelectorAll("[id]")].map(x=>x.id);
  const unique=(new Set(ids)).size===ids.length;
  let backupOk=false;
  try{
    const legacy=parseBackupPayload({v:17,name:"Test"});
    const wrapped=parseBackupPayload({format:2,data:{v:17,name:"Test2"}});
    backupOk=legacy.name==="Test"&&wrapped.name==="Test2"&&typeof autoBackupRun==="function";
  }catch(e){backupOk=false;}
  const syncUi=!!document.getElementById("cloudSyncBox")&&!!document.getElementById("cloudSyncText")&&!!document.getElementById("cloudSyncMeta");
  const versionOk=typeof APP_VERSION==="string"&&APP_VERSION==="3.2.5"&&APP_CHANNEL==="Kararlı"&&DATA_SCHEMA===21;
  const infraTest=runInfrastructureSelfTest();
  const sozPoolOk=Array.isArray(SOZLER)&&SOZLER.length>=50&&(new Set(SOZLER.map(x=>x.q))).size===SOZLER.length&&!SOZLER.some(x=>!x.a||x.a==="YKS Defterim")&&!SOZLER.some(x=>/allah|tanrı|tanri|\bdin\b|dua|ibadet|cennet|cehennem|peygamber|kutsal kitap|kuran|incil|tevrat|mesih/i.test((x.q||"")+" "+(x.a||"")));
  let newFeaturesOk=false;
  const keepS=S;
  try{
    const testS=normalize(JSON.parse(JSON.stringify(DEF))),k=todayKey();
    testS.target=100; testS.targetNet=90; testS.focus.goalMin=60;
    testS.solved[k]=40; testS.pomoMin[k]=30;
    const tk=tkey("TYT","Matematik","Problemler");
    testS.topics[tk]={st:3,conf:3,ts:addDaysKey(k,-3),rev:[]};
    S=testS;
    const rq=reviewQueue();
    renderHomeGoals(); renderSmartInsights();
    newFeaturesOk=REVIEW_GAPS.join(",")==="3,7,21"&&rq.length>0&&rq[0].gap===3&&
      !!document.getElementById("homeGoals")&&!!document.getElementById("smartInsightBox")&&
      document.getElementById("homeGoalQ").textContent.indexOf("40 / 100")>=0&&
      Array.isArray(smartInsights())&&smartInsights().length>0;
  }catch(e){newFeaturesOk=false;}
  finally{S=keepS;try{renderHome();renderReviewQueue();}catch(e){}}
  let features78910=false;
  try{
    const keep=S,testS=normalize(JSON.parse(JSON.stringify(DEF))); S=testS;
    swHistoryAdd(125000,"Matematik",Date.now()-125000,Date.now());
    const hist=swHistoryFlat(5),bp=BADGES[0].p();
    features78910=hist.length===1&&hist[0].subj==="Matematik"&&bp.target===100&&
      typeof applyAppUpdate==="function"&&typeof showAppUpdate==="function"&&!!document.getElementById("themes20260821");
    S=keep;
  }catch(e){features78910=false;}
  const ok=parsed&&unique&&backupOk&&syncUi&&versionOk&&sozPoolOk&&newFeaturesOk&&features78910&&infraTest.ok&&typeof openDirectPlaylist==="function"&&typeof planDirectPlaylist==="function";
  document.documentElement.setAttribute("data-selftest",ok?"ok":"fail");
  const out=document.createElement("pre"); out.id="selfTestResult"; out.hidden=true;
  out.textContent=ok?"YKS_SELFTEST_OK":"YKS_SELFTEST_FAIL"; document.body.appendChild(out);
}
function runYoutubeSelfTest(){
  const finish=(ok,msg)=>{
    document.documentElement.setAttribute("data-youtube-selftest",ok?"ok":"fail");
    const out=document.createElement("pre"); out.id="youtubeSelfTestResult"; out.hidden=true;
    out.textContent=(ok?"YKS_YOUTUBE_SELFTEST_OK":"YKS_YOUTUBE_SELFTEST_FAIL")+" "+String(msg||"");
    document.body.appendChild(out);
  };
  Promise.all([
    ytFetch("türev konu anlatımı",{}),
    ytOnePlaylistSearch("TYT matematik","")
  ]).then(all=>{
    const videos=all[0]||[],lists=all[1]||[];
    finish(videos.length>0&&lists.length>0,"video="+videos.length+",liste="+lists.length);
  }).catch(e=>finish(false,String(e&&e.message||e)));
}

/* ==================================================================
   YKS DEFTERİM v2.0 — AKILLI ÇALIŞMA + İLERLEME + UX KATMANI
   ================================================================== */
const V2_VERSION="2.4.0";
let v2ProgressDays=30,pomoTopic="";
const v2ActionLocks=new Map();
NAV_TITLES.progress="İlerleme";

function v2Num(v,min,max,def){v=Number(v);if(!Number.isFinite(v))v=def||0;return Math.max(min,Math.min(max,v));}
function v2SubjectAliases(name){
  const m={"Matematik":["Matematik","Temel Matematik"],"Temel Matematik":["Matematik","Temel Matematik"],"Türkçe":["Türkçe"],"Fizik":["Fizik"],"Kimya":["Kimya"],"Biyoloji":["Biyoloji"],"Edebiyat":["Edebiyat"],"Tarih-1":["Tarih-1","Tarih"],"Tarih-2":["Tarih-2","Tarih"],"Coğrafya-1":["Coğrafya-1","Coğrafya"],"Coğrafya-2":["Coğrafya-2","Coğrafya"],"Yabancı Dil":["Yabancı Dil"]};
  return m[name]||[name];
}
function v2SubjectMatch(a,b){const aa=v2SubjectAliases(a),bb=v2SubjectAliases(b);return aa.some(x=>bb.includes(x));}
function v2StudyMinutes(subj,days){
  let n=0;for(let i=0;i<days;i++){const k=addDaysKey(todayKey(),-i),m=S.pomoSubj[k]||{};Object.keys(m).forEach(x=>{if(v2SubjectMatch(x,subj))n+=Number(m[x])||0;});}return n;
}
function v2ExamPerf(subj,limit){
  const vals=[];S.denemeler.slice().sort((a,b)=>(b.date||"").localeCompare(a.date||"")||(b.id||0)-(a.id||0)).forEach(d=>{
    const sr=(d.subjectResults||[]).find(x=>v2SubjectMatch(x.name,subj));if(!sr||!(sr.cap>0)||vals.length>=(limit||5))return;
    vals.push({pct:Math.max(0,Math.min(100,((Number(sr.net)||0)/sr.cap)*100)),date:d.date});
  });
  if(!vals.length)return null;return {pct:Math.round(vals.reduce((a,x)=>a+x.pct,0)/vals.length),n:vals.length};
}
function v2WrongAgg(days){
  const cut=addDaysKey(todayKey(),-(days||90)),m={};
  (S.wrongLog||[]).forEach(w=>{if((w.date||"")<cut)return;const key=(w.subject||"")+"|"+(w.topic||"");if(!m[key])m[key]={subject:w.subject||"",topic:w.topic||"",sum:0,occ:0,last:""};m[key].sum+=Math.max(1,Number(w.n)||1);m[key].occ++;if((w.date||"")>m[key].last)m[key].last=w.date||"";});
  return Object.values(m);
}
function v2RiskList(limit){
  return perfMemo("v2risk:"+todayKey()+":"+(limit||20),()=>{
    const wrong=v2WrongAgg(90),wm=new Map(wrong.map(x=>[x.subject+"|"+x.topic,x]));
    const due=new Map();reviewQueue().forEach(x=>{if(!due.has(x.key))due.set(x.key,x);});
    const od=new Map(((typeof overdueTopics==="function")?overdueTopics():[]).map(x=>[x.key||tkey(x.exam,x.subj,x.topic),x]));
    const subjCache=new Map(),studyCache=new Map(),out=[];
    ALL_SUBJECTS.forEach(sb=>sb.topics.forEach(tp=>{
      const key=tkey(sb.exam,sb.name,tp),t=tget(key),w=wm.get(sb.name+"|"+tp),r=due.get(key),o=od.get(key);
      if(!subjCache.has(sb.name))subjCache.set(sb.name,v2ExamPerf(sb.name,5));
      if(!studyCache.has(sb.name))studyCache.set(sb.name,v2StudyMinutes(sb.name,30));
      const ep=subjCache.get(sb.name),sm=studyCache.get(sb.name);let score=0,reasons=[];
      if(r){score+=34+Math.min(12,Math.max(0,r.late)*2);reasons.push(r.late>0?r.late+" gün gecikmiş tekrar":r.gap+". gün tekrarı");}
      if(w){score+=Math.min(30,w.sum*3+w.occ*2);reasons.push("90 günde "+w.sum+" yanlış");}
      if(t.st<3){score+=(3-t.st)*7;reasons.push(ST_LABEL[t.st]);}
      if(t.conf>0&&t.conf<=2){score+=(3-t.conf)*5;reasons.push("güven düşük");}
      if(o){score+=12;reasons.push("hedef tarihi geçti");}
      if(ep&&ep.pct<65){score+=Math.round((65-ep.pct)*0.35);reasons.push("deneme başarısı %"+ep.pct);}
      if(sm<60){score+=5;reasons.push("son 30 günde az çalışma");}
      const wt=(typeof topicWeight==="function")?topicWeight(key):1;if(wt>=2){score+=(wt-1)*3;reasons.push(wt>=3?"yüksek sınav ağırlığı":"sık sorulan konu");}
      if(score>0)out.push({key:key,exam:sb.exam,subj:sb.name,topic:tp,score:Math.round(score),reasons:[...new Set(reasons)].slice(0,3),wrong:w?w.sum:0,review:!!r});
    }));
    return out.sort((a,b)=>b.score-a.score||b.wrong-a.wrong||a.topic.localeCompare(b.topic,"tr")).slice(0,limit||20);
  });
}
/* Öncelik motoru ve Akıllı Günlük v3.1.3 ile kaldırıldı.
   v2RiskList yalnızca mevcut risk/analiz ve deneme sonrası analiz özelliklerinin
   ortak puanlayıcısı olarak korunur; artık ana ekranda plan veya öncelik listesi üretmez. */
function v2FindRiskForSubject(name){return v2RiskList(30).find(x=>v2SubjectMatch(x.subj,name))||null;}
function createExamTasks(examId){
  const d=S.denemeler.find(x=>String(x.id)===String(examId));if(!d)return;if(!Array.isArray(S.examTasks))S.examTasks=[];
  S.examTasks=S.examTasks.filter(x=>String(x.examId)!==String(examId));const now=Date.now(),rows=(d.subjectResults||[]).slice().filter(x=>(Number(x.y)||0)>0).sort((a,b)=>(b.y||0)-(a.y||0)).slice(0,3),tasks=[];
  rows.forEach((sr,i)=>{const p=v2FindRiskForSubject(sr.name),topic=p?p.topic:"";tasks.push({id:now+i,examId:d.id,at:now,kind:"analysis",label:sr.name+" · "+sr.y+" yanlışı tek tek analiz et",subj:sr.name,topic:topic,done:false});if(topic)tasks.push({id:now+20+i,examId:d.id,at:now,kind:"review",label:(p.subj||sr.name)+" · "+topic+" konusunu tekrar et",subj:p.subj||sr.name,topic:topic,done:false});});
  const worst=rows[0];if(worst)tasks.push({id:now+50,examId:d.id,at:now,kind:"questions",label:worst.name+" · 20 telafi sorusu çöz",subj:worst.name,topic:"",done:false});
  if(!tasks.length)tasks.push({id:now+60,examId:d.id,at:now,kind:"analysis",label:d.name+" denemesini kısa notlarla değerlendir",subj:"",topic:"",done:false});
  S.examTasks.push(...tasks.slice(0,7));S.examTasks=S.examTasks.slice(-100);save();renderExamTasks();
}
function toggleExamTask(id){const x=(S.examTasks||[]).find(t=>String(t.id)===String(id));if(!x)return;x.done=!x.done;save();renderExamTasks();}
function renderExamTasks(){
  const w=el("examTasksBox");if(!w)return;const list=(S.examTasks||[]).slice().sort((a,b)=>b.at-a.at),open=list.filter(x=>!x.done).slice(0,8);
  if(!open.length){w.innerHTML='<div class="empty">Deneme eklediğinde yanlış dağılımına göre telafi görevleri burada oluşacak.</div>';return;}
  w.innerHTML=open.map(x=>'<div class="exam-task-row"><button class="task-check" onclick="toggleExamTask('+x.id+')">✓</button><div class="task-main"><div class="task-title">'+esc(x.label)+'</div><div class="task-meta">'+esc(x.kind==="analysis"?'Deneme analizi':x.kind==="review"?'Konu tekrarı':'Telafi çalışması')+'</div></div>'+(x.subj?'<button class="btn ghost tiny" onclick="addToToday(\''+String(x.label).replace(/'/g,"\\'")+'\')">Plana</button>':'')+'</div>').join('');
}
function v2RecurringWrongTopics(){return v2WrongAgg(90).filter(x=>x.sum>=3||x.occ>=2).sort((a,b)=>b.sum-a.sum||b.occ-a.occ).slice(0,12);}
function v2EnsureWeakTask(){
  const top=v2RecurringWrongTopics()[0];if(!top)return;const exists=(S.examTasks||[]).some(x=>!x.done&&x.kind==="weak"&&x.subj===top.subject&&x.topic===top.topic);if(exists)return;
  S.examTasks.push({id:Date.now(),examId:0,at:Date.now(),kind:"weak",label:top.subject+" · "+top.topic+" tekrar eden yanlış: kısa tekrar + 15 soru",subj:top.subject,topic:top.topic,done:false});S.examTasks=S.examTasks.slice(-100);save();
}

function v2RangeAgg(days,offset){let min=0,q=0,active=0;const start=offset||0;for(let i=start;i<start+days;i++){const k=addDaysKey(todayKey(),-i),m=Number(S.pomoMin[k])||0,s=Number(S.solved[k])||0;min+=m;q+=s;if(m>0||s>0||dayDone(k))active++;}return {min,q,active};}
function v2DeltaText(a,b,unit){if(!b&&!a)return "—";if(!b)return "+ yeni";const p=Math.round((a-b)/Math.max(1,b)*100);return (p>0?"+":"")+p+"%"+(unit?" "+unit:"");}
function v2SubjectRange(days){const m={};for(let i=0;i<days;i++){const k=addDaysKey(todayKey(),-i),row=S.pomoSubj[k]||{};Object.keys(row).forEach(s=>m[s]=(m[s]||0)+(Number(row[s])||0));}return Object.keys(m).map(k=>({name:k,min:m[k]})).sort((a,b)=>b.min-a.min);}
function v2ExamSubjectChange(){
  const by={};S.denemeler.slice().sort((a,b)=>(a.date||"").localeCompare(b.date||"")||(a.id||0)-(b.id||0)).forEach(d=>(d.subjectResults||[]).forEach(sr=>{if(!(sr.cap>0))return;(by[sr.name]||(by[sr.name]=[])).push((Number(sr.net)||0)/sr.cap*100);}));
  return Object.keys(by).map(name=>{const a=by[name];if(a.length<4)return null;const last=a.slice(-2).reduce((x,y)=>x+y,0)/2,prev=a.slice(-4,-2).reduce((x,y)=>x+y,0)/2;return {name,diff:Math.round(last-prev),last:Math.round(last)};}).filter(Boolean).sort((a,b)=>Math.abs(b.diff)-Math.abs(a.diff));
}
function v2Forecast(){
  const types=["TYT","AYT","YDT"];let chosen=null;types.forEach(t=>{const a=S.denemeler.filter(d=>d.type===t).sort((x,y)=>(x.date||"").localeCompare(y.date||"")||(x.id||0)-(y.id||0));if(a.length>=3&&(!chosen||a[a.length-1].date>chosen.last))chosen={type:t,list:a,last:a[a.length-1].date};});
  if(!chosen)return null;const arr=chosen.list.slice(-10),x0=parseKey(arr[0].date).getTime()/86400000,x=arr.map(d=>parseKey(d.date).getTime()/86400000-x0),y=arr.map(d=>Number(d.totalNet)||0),n=x.length,xm=x.reduce((a,b)=>a+b,0)/n,ym=y.reduce((a,b)=>a+b,0)/n;let num=0,den=0;for(let i=0;i<n;i++){num+=(x[i]-xm)*(y[i]-ym);den+=(x[i]-xm)*(x[i]-xm);}const slope=den?num/den:0,inter=ym-slope*xm,predX=(new Date().getTime()/86400000-x0)+28;let pred=inter+slope*predX;const cap=Math.max(...arr.map(d=>(d.subjectResults||[]).reduce((a,s)=>a+(Number(s.cap)||0),0)),120);pred=Math.max(0,Math.min(cap,pred));const residual=y.map((v,i)=>v-(inter+slope*x[i])),rmse=Math.sqrt(residual.reduce((a,b)=>a+b*b,0)/n),band=Math.max(2,Math.min(12,rmse*1.35));return {type:chosen.type,pred:r2(pred),low:r2(Math.max(0,pred-band)),high:r2(Math.min(cap,pred+band)),slope:r2(slope*7),n:n};
}
function setProgressRange(n){v2ProgressDays=[7,30,90].includes(+n)?+n:30;renderProgress();}
function renderProgress(){
  const days=v2ProgressDays,a=v2RangeAgg(days,0),b=v2RangeAgg(days,days);[7,30,90].forEach(n=>{const e=el("pr"+n);if(e)e.classList.toggle("on",n===days);});
  if(el("prMin"))el("prMin").textContent=fmtHM(a.min);if(el("prQ"))el("prQ").textContent=String(a.q);if(el("prDays"))el("prDays").textContent=a.active+" / "+days;
  const comp=el("progressCompare");if(comp)comp.innerHTML='<div class="dayrow"><span class="k">Çalışma</span><span class="v '+(a.min>=b.min?'trend-up':'trend-down')+'">'+fmtHM(a.min)+' · '+v2DeltaText(a.min,b.min)+'</span></div><div class="dayrow"><span class="k">Soru</span><span class="v '+(a.q>=b.q?'trend-up':'trend-down')+'">'+a.q+' · '+v2DeltaText(a.q,b.q)+'</span></div><div class="dayrow"><span class="k">Aktif gün</span><span class="v">'+a.active+' / '+days+'</span></div>';
  const ds=S.denemeler.filter(d=>d.type!=="BRANS"&&d.date>=addDaysKey(todayKey(),-days)).sort((x,y)=>(x.date||"").localeCompare(y.date||""));const net=el("progressNet");if(net){if(!ds.length)net.innerHTML='<div class="empty">Bu aralıkta genel deneme yok.</div>';else{const first=ds.slice(0,Math.max(1,Math.ceil(ds.length/2))),last=ds.slice(Math.floor(ds.length/2)),fa=r2(first.reduce((z,d)=>z+d.totalNet,0)/first.length),la=r2(last.reduce((z,d)=>z+d.totalNet,0)/last.length),dif=r2(la-fa),chg=v2ExamSubjectChange();net.innerHTML='<div class="dayrow"><span class="k">'+ds.length+' genel deneme</span><span class="v">'+la+' son dönem ort.</span></div><div class="dayrow"><span class="k">Net eğilimi</span><span class="v '+(dif>0?'trend-up':dif<0?'trend-down':'trend-flat')+'">'+(dif>0?'+':'')+dif+' net</span></div>'+(chg.length?'<div class="dayrow"><span class="k">En belirgin ders değişimi</span><span class="v '+(chg[0].diff>0?'trend-up':chg[0].diff<0?'trend-down':'')+'">'+esc(chg[0].name)+' '+(chg[0].diff>0?'+':'')+chg[0].diff+' puan</span></div>':'');}}
  const subs=v2SubjectRange(days),sw=el("progressSubjects");if(sw){if(!subs.length)sw.innerHTML='<div class="empty">Odak oturumlarında ders seçtikçe burada dağılım oluşur.</div>';else{const max=subs[0].min||1,total=subs.reduce((z,x)=>z+x.min,0);sw.innerHTML=subs.slice(0,10).map(x=>'<div class="progress-bar-row"><div class="progress-bar-line"><b>'+esc(x.name)+'</b><span>'+fmtHM(x.min)+' · %'+Math.round(x.min/Math.max(1,total)*100)+'</span></div><div class="v2bar"><i style="width:'+Math.round(x.min/max*100)+'%"></i></div></div>').join('');}}
  const wr=v2RecurringWrongTopics(),ww=el("progressWrong");if(ww)ww.innerHTML=wr.length?wr.map(x=>'<div class="dayrow"><span class="k"><b>'+esc(x.subject+' · '+x.topic)+'</b><br><small>'+x.occ+' kayıt · son '+esc(x.last)+'</small></span><span class="v">'+x.sum+' yanlış <button class="btn ghost tiny" onclick="addToToday(\''+String(x.subject+' · '+x.topic+' tekrar + 15 soru').replace(/'/g,"\\'")+'\')">Plana</button></span></div>').join(''):'<div class="empty">Tekrarlayan yanlış görünmüyor.</div>';
  const f=v2Forecast(),fw=el("progressForecast");if(fw){if(!f)fw.innerHTML='<div class="empty">Tahmin için aynı türden en az 3 genel deneme gerekli.</div>';else fw.innerHTML='<div class="dayrow"><span class="k">Model</span><span class="v">'+f.type+' · son '+f.n+' deneme</span></div><div class="dayrow"><span class="k">4 hafta sonrası tahmini bant</span><span class="v">'+f.low+' – '+f.high+' net</span></div><div class="dayrow"><span class="k">Merkez tahmin</span><span class="v">'+f.pred+' net</span></div><div class="dayrow"><span class="k">Haftalık eğilim</span><span class="v '+(f.slope>0?'trend-up':f.slope<0?'trend-down':'trend-flat')+'">'+(f.slope>0?'+':'')+f.slope+' net/hafta</span></div><p class="hint">Bu bir sonuç garantisi değildir; yalnız kayıtlı denemelerindeki doğrusal eğilimi ve oynaklığı gösterir.</p>';}
}

function renderPomoTopicPicker(){const sel=el("pomoTopic");if(!sel)return;const sb=ALL_SUBJECTS.find(x=>x.name===pomoSubject);const topics=sb?sb.topics:[];if(pomoTopic&&!topics.includes(pomoTopic))pomoTopic="";sel.innerHTML='<option value="">Konu seç (isteğe bağlı)</option>'+topics.map(t=>'<option value="'+esc(t)+'"'+(t===pomoTopic?' selected':'')+'>'+esc(t)+'</option>').join('');}
function setPomoTopic(v){pomoTopic=String(v||"").slice(0,100);}

function openGlobalSearch(){go("more");setMoreTab("kay");setTimeout(()=>{const i=el("gsInput");if(i){i.focus();i.scrollIntoView({behavior:"smooth",block:"center"});}},60);}
const __v18GlobalSearch=globalSearch;
globalSearch=function(q){
  const base=__v18GlobalSearch(q),s=String(q||"").trim().toLocaleLowerCase("tr"),tokens=s.split(/\s+/).filter(Boolean),out=base.slice();if(tokens.length){const match=v=>{const z=String(v||"").toLocaleLowerCase("tr");return tokens.every(t=>z.includes(t));};
    const pl=v2PlanFor(todayKey());(pl&&pl.items||[]).forEach(x=>{if(match(x.label))out.push({g:"Akıllı plan",t:x.label,d:x.done?"Tamamlandı":"Bugün",go:"home"});});
    (S.examTasks||[]).forEach(x=>{if(match(x.label)||match(x.topic)||match(x.subj))out.push({g:"Deneme görevi",t:x.label,d:x.done?"Tamamlandı":"Bekliyor",go:"home"});});
    Object.keys(S.sessions||{}).forEach(k=>(S.sessions[k]||[]).forEach(x=>{if(match(x.subj)||match(x.topic)||match(x.note))out.push({g:"Çalışma oturumu",t:(x.subj||"Ders")+(x.topic?" · "+x.topic:""),d:k+" · "+x.m+" dk",go:"pomo"});}));
  }
  const seen=new Set();return out.filter(x=>{const k=x.g+"|"+x.t+"|"+x.d;if(seen.has(k))return false;seen.add(k);return true;}).slice(0,60);
};

function v2DiagnosticsRows(){
  const rows=[];const add=(n,ok,d)=>rows.push({n,ok,d});
  try{localStorage.setItem("__yks_diag","1");const ok=localStorage.getItem("__yks_diag")==="1";localStorage.removeItem("__yks_diag");add("Yerel depolama",ok,ok?"Okuma/yazma çalışıyor":"Başarısız");}catch(e){add("Yerel depolama",false,String(e.message||e));}
  add("Veri şeması",S.v===DATA_SCHEMA,"v"+S.v+" / beklenen "+DATA_SCHEMA);add("Ana kayıt",!!safeJSONParse(localStorage.getItem(STORAGE_KEY)||""),infraRecoveryLabel());
  const backs=typeof autoBackups==="function"?autoBackups():[];add("Otomatik yedek",backs.length>0,backs.length?backs.length+" kopya":"Henüz yok");
  const state=el("cloudSyncBox")?.dataset.state||"bilinmiyor",dirty=localStorage.getItem("yks_cloud_dirty")==="1";add("Bulut durumu",state!=="error",state+(dirty?" · bekleyen değişiklik":""));
  add("İnternet",navigator.onLine!==false,navigator.onLine===false?"Çevrimdışı":"Bağlı");add("PWA",!("serviceWorker" in navigator)||!!navigator.serviceWorker.controller,("serviceWorker" in navigator)?(navigator.serviceWorker.controller?"Etkin":"Kontrolcü bekleniyor"):"Desteklenmiyor");
  const st=runInfrastructureSelfTest();add("Dahili test",st.ok,st.ok?"Tüm kontroller geçti":st.checks.filter(x=>!x.ok).map(x=>x.name).join(", "));add("Hata günlüğü",infraErrors().length===0,infraErrors().length+" kayıt");return rows;
}
async function runFullDiagnostics(){
  const w=el("v2DiagBox");if(!w)return;w.style.display="block";w.innerHTML='<div class="empty">Tanılama çalışıyor…</div>';let rows=v2DiagnosticsRows();
  try{const r=await fetch("./version.json?diag="+Date.now(),{cache:"no-store"});const j=await r.json();rows.push({n:"Sunucu sürümü",ok:j.version===APP_VERSION,d:"v"+String(j.version||"?")+" / cihaz v"+APP_VERSION});}catch(e){rows.push({n:"Sunucu sürümü",ok:false,d:"Kontrol edilemedi"});}
  w.innerHTML=rows.map(x=>'<div class="dayrow"><span class="k">'+esc(x.n)+'</span><span class="v '+(x.ok?'diag-ok':'diag-bad')+'">'+(x.ok?'✓ ':'! ')+esc(x.d)+'</span></div>').join('')+'<p class="hint">Kırmızı satır varsa önce o satırı düzelt; veri silme işlemi yapılmaz.</p>';
}

function v2InputGuard(e){const t=e.target;if(!(t instanceof HTMLInputElement)||t.type!=="number")return;let v=Number(t.value);if(!Number.isFinite(v))return;const mn=t.min!==""?Number(t.min):-Infinity,mx=t.max!==""?Number(t.max):Infinity;v=Math.max(mn,Math.min(mx,v));if(t.step==="1"||t.step==="")v=Math.round(v);if(String(v)!==t.value)t.value=String(v);}
document.addEventListener("change",v2InputGuard,true);

function v2LockRun(key,fn,ctx,args,ms){const now=Date.now(),last=v2ActionLocks.get(key)||0;if(now-last<(ms||700)){try{toast("İşlem zaten kaydediliyor");}catch(e){}return;}v2ActionLocks.set(key,now);try{return fn.apply(ctx,args);}finally{setTimeout(()=>{if((v2ActionLocks.get(key)||0)===now)v2ActionLocks.delete(key);},ms||700);}}
function v2WrapGuard(name,ms){try{const fn=window[name];if(typeof fn!=="function"||fn.__v2guard)return;const w=function(){return v2LockRun(name,fn,this,arguments,ms||700)};w.__v2guard=true;window[name]=w;}catch(e){}}
["addWrong","addBook","addTeacher","addTarget","addCalib","addCoachNote","addDenemeByNet","saveSolved","saveJournal","saveSessionNote","saveContract","saveTemplate","addRes"].forEach(n=>v2WrapGuard(n,650));

/* Deneme ekleme: çift tıklama koruması + otomatik telafi görevi */
const __v18AddDeneme=addDeneme;
addDeneme=function(){return v2LockRun("addDeneme",function(){const ids=new Set(S.denemeler.map(x=>String(x.id)));const r=__v18AddDeneme.apply(this,arguments);const added=S.denemeler.find(x=>!ids.has(String(x.id)));if(added){createExamTasks(added.id);setTimeout(()=>toast("Deneme sonrası görevler hazır ✓"),250);}return r;},this,arguments,900);};
const __v18AddWrong=window.addWrong;window.addWrong=function(){const before=(S.wrongLog||[]).length;const r=__v18AddWrong.apply(this,arguments);if((S.wrongLog||[]).length>before){v2EnsureWeakTask();renderExamTasks();}return r;};

/* Konulu çalışma oturumu */
const __v18RenderPomoSubjects=renderPomoSubjects;renderPomoSubjects=function(){__v18RenderPomoSubjects();renderPomoTopicPicker();};
const __v18SetPomoSubject=setPomoSubject;setPomoSubject=function(n){if(n!==pomoSubject)pomoTopic="";__v18SetPomoSubject(n);renderPomoTopicPicker();};
recordSession=function(done){const mins=pomoCredited;if(!pomoIsWork||mins<1)return;todaySessions().push({t:pomoStartedAt,m:mins,subj:pomoSubject,topic:pomoTopic,task:pomoTask,type:"work",done:!!done});if(S.sessions[todayKey()].length>40)S.sessions[todayKey()]=S.sessions[todayKey()].slice(-40);save();};
swRecord=function(){const mins=Math.floor(swElapsed()/60000);if(mins<1)return;todaySessions().push({t:Date.now()-swElapsed(),m:mins,subj:pomoSubject,topic:pomoTopic,task:"",type:"work",done:true});const k=todayKey();if(S.sessions[k].length>40)S.sessions[k]=S.sessions[k].slice(-40);};
const __v18SwHistoryAdd=swHistoryAdd;swHistoryAdd=function(ms,subj,start,end){const ok=__v18SwHistoryAdd(ms,subj,start,end);if(ok){const k=keyOf(new Date(Number(end)||Date.now())),a=S.swHistory[k]||[];if(a.length)a[a.length-1].topic=pomoTopic||"";}return ok;};
renderSessions=function(){const w=el("sessionList");if(!w)return;const list=todaySessions().filter(x=>x.type==="work");if(!list.length){w.innerHTML='<div class="empty">Bugün henüz oturum yok.</div>';return;}w.classList.add("long-list");w.innerHTML=list.slice().reverse().map(x=>{const t=new Date(x.t),hh=String(t.getHours()).padStart(2,"0")+":"+String(t.getMinutes()).padStart(2,"0");return '<div class="dayrow"><span class="k">'+hh+' · '+esc(x.subj||"—")+(x.topic?' · '+esc(x.topic):'')+(x.task?' · plan':'')+(x.note?'<br><small>'+esc(x.note)+'</small>':'')+'</span><span class="v" style="color:'+(x.done?'var(--success)':'var(--label-3)')+'">'+x.m+' dk'+(x.done?'':' · yarıda')+'</span></div>';}).join('');};
renderSwHistory=function(){const w=el("swHistory");if(!w)return;const rows=swHistoryFlat(24);if(!rows.length){w.innerHTML='<div class="empty">Henüz kronometre oturumu yok. Duraklattığın her çalışma parçası burada kalıcı olarak görünür.</div>';return;}const today=todayKey(),todayRows=(S.swHistory&&S.swHistory[today])||[],todayMs=todayRows.reduce((a,x)=>a+(Number(x.ms)||0),0),totalMs=Object.keys(S.swHistory||{}).reduce((a,k)=>a+(S.swHistory[k]||[]).reduce((b,x)=>b+(Number(x.ms)||0),0),0);let html='<div class="sw-history-summary"><div class="mini"><b>'+fmtSw(todayMs)+'</b><span>bugün kronometre</span></div><div class="mini"><b>'+fmtHM(Math.floor(totalMs/60000))+'</b><span>geçmiş toplamı</span></div></div>';let lastDay="";rows.forEach(x=>{if(x.day!==lastDay){lastDay=x.day;const d=parseKey(x.day);html+='<div class="sw-history-day">'+(x.day===today?'Bugün':d.toLocaleDateString("tr-TR",{day:"numeric",month:"long"}))+'</div>';}const at=x.at?new Date(x.at):null,when=at&&!isNaN(at)?at.toLocaleTimeString("tr-TR",{hour:"2-digit",minute:"2-digit"}):"";html+='<div class="sw-history-row"><div class="main"><div class="subj">'+esc(x.subj||"Ders")+(x.topic?' · '+esc(x.topic):'')+'</div><div class="when">'+when+'</div></div><div class="dur">'+fmtSw(x.ms||0)+'</div><button class="del" onclick="delSwHistory(\''+x.day+'\','+(Number(x.id)||0)+')">Sil</button></div>';});w.innerHTML=html;};
clearSwHistory=function(){const n=swHistoryFlat(9999).length;if(!n){toast("Kronometre geçmişi zaten boş");return;}if(!confirm(n+" kronometre kaydı silinsin mi? Çalışma dakikaların silinmez."))return;const bk=clone(S.swHistory);S.swHistory={};save();pushUndo("Kronometre geçmişi temizlendi",()=>{S.swHistory=bk;});renderSwHistory();toast("Kronometre geçmişi temizlendi");};
delSwHistory=function(day,id){if(!S.swHistory||!Array.isArray(S.swHistory[day]))return;const bk=clone(S.swHistory[day].find(x=>String(x.id)===String(id)));S.swHistory[day]=S.swHistory[day].filter(x=>String(x.id)!==String(id));if(!S.swHistory[day].length)delete S.swHistory[day];save();if(bk)pushUndo("Kronometre kaydı silindi",()=>{if(!S.swHistory[day])S.swHistory[day]=[];S.swHistory[day].push(bk);});renderSwHistory();};

/* Ana render ve navigasyon kancaları */
const __v18RenderHome=renderHome;renderHome=function(){const r=__v18RenderHome();try{renderExamTasks();}catch(e){infraError("v2-home",e);}return r;};
const __v18Go=go;go=function(id){const r=__v18Go(id);if(id==="progress")renderProgress();return r;};
const __v18RenderAll=renderAll;renderAll=function(){const r=__v18RenderAll();try{renderExamTasks();if(el("progress")?.classList.contains("active"))renderProgress();}catch(e){infraError("v2-render",e);}return r;};
const __v18Infra=renderInfraHealth;renderInfraHealth=function(){__v18Infra();const w=el("infraBox");if(!w)return;const dirty=localStorage.getItem("yks_cloud_dirty")==="1",last=Number(localStorage.getItem("yks_last_sync_at")||0)||0,backs=typeof autoBackups==="function"?autoBackups():[];w.insertAdjacentHTML("beforeend",'<div class="dayrow"><span class="k">Bekleyen senkron</span><span class="v">'+(dirty?'Var':'0')+'</span></div><div class="dayrow"><span class="k">Son bulut senkronu</span><span class="v">'+(last?esc(syncAgo(last)):'—')+'</span></div><div class="dayrow"><span class="k">Yerel yedek</span><span class="v">'+backs.length+' kopya</span></div><div class="rowtools" style="margin:12px 0 0"><button class="btn green tiny" onclick="runFullDiagnostics()">Tanılama çalıştır</button><button class="btn ghost tiny" onclick="go(\'progress\')">İlerlemeyi aç</button></div>');};

/* v2 self-test */
function runV2SelfTest(){const checks=[];const add=(n,o)=>checks.push([n,!!o]);try{add("version",APP_VERSION==="3.2.5"&&DATA_SCHEMA===21);add("state",Array.isArray(S.examTasks)&&!!S.studyPrefs);add("risk-score",Array.isArray(v2RiskList(5)));add("removed-smart-ui",!el("smartPriorityBox")&&!el("smartDailyPlan")&&typeof window.generateSmartPlan!=="function");add("progress",typeof v2Forecast==="function"&&typeof renderProgress==="function");add("search",typeof openGlobalSearch==="function");add("diagnostics",typeof runFullDiagnostics==="function");add("topic-session",!!el("pomoTopic"));}catch(e){checks.push(["exception",false]);infraError("v2-selftest",e);}const ok=checks.every(x=>x[1]);document.documentElement.setAttribute("data-v2-selftest",ok?"ok":"fail");let o=el("v2SelfTestResult");if(!o){o=document.createElement("pre");o.id="v2SelfTestResult";o.hidden=true;document.body.appendChild(o);}o.textContent=(ok?"YKS_V2_SELFTEST_OK":"YKS_V2_SELFTEST_FAIL")+" "+checks.map(x=>x[0]+":"+(x[1]?"ok":"fail")).join(",");return {ok,checks};}
const __v18SelfTest=runBuiltInSelfTest;runBuiltInSelfTest=function(){__v18SelfTest();const r=runV2SelfTest();if(!r.ok){document.documentElement.setAttribute("data-selftest","fail");const o=el("selfTestResult");if(o)o.textContent="YKS_SELFTEST_FAIL";}};

function finalBoot(){
  const __bootT=(typeof performance!=="undefined"&&performance.now)?performance.now():Date.now();
  try{
    boot20();
    PERF_STATE.bootSyncMs=((typeof performance!=="undefined"&&performance.now)?performance.now():Date.now())-__bootT;
    document.documentElement.setAttribute("data-app-version",APP_VERSION);
    document.documentElement.setAttribute("data-perf-ready","1");
  }
  catch(e){infraError("boot",e);showFatalBanner(e);try{applyTheme();}catch(x){}}
  try{
    const test=new URLSearchParams(location.search).get("selftest");
    if(test==="1")setTimeout(runBuiltInSelfTest,120);
    if(test==="infra")setTimeout(()=>{const r=runInfrastructureSelfTest();document.documentElement.setAttribute("data-infra-selftest",r.ok?"ok":"fail");const o=document.createElement("pre");o.id="infraSelfTestResult";o.hidden=true;o.textContent=r.ok?"YKS_INFRA_SELFTEST_OK":"YKS_INFRA_SELFTEST_FAIL "+r.checks.filter(x=>!x.ok).map(x=>x.name).join(",");document.body.appendChild(o);},120);
    if(test==="youtube")setTimeout(runYoutubeSelfTest,100);
  }catch(e){infraError("selftest-start",e);}
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",finalBoot);
else finalBoot();

/* ==================================================================
   PROGRAM HÜCRESİ İŞLEMLERİ · v2.1
   Uzun bas: Düzenle / Kopyala / Yarına taşı / Sil.
   Dokunmatik ekranda yanlış tetiklenmemesi için hareket toleransı vardır.
   ================================================================== */
let planMenuCtx=null,planPressTimer=null,planPressNode=null,planPressStart=null;
function planRefreshViews(){
  if(el("program")&&el("program").classList.contains("active"))renderPlan();
  if(el("home")&&el("home").classList.contains("active"))renderTodayPlan();
  if(typeof renderCalendar==="function"&&el("progCal")&&el("progCal").style.display!=="none")renderCalendar();
}
function planWeekBackup(keys){
  const out={weeks:{},labels:clone(S.rowLabels)}; (keys||[]).forEach(k=>{out.weeks[k]=clone(S.weeks[k]);}); return out;
}
function restorePlanWeekBackup(b){
  if(b&&b.labels)S.rowLabels=clone(b.labels);
  Object.keys((b&&b.weeks)||{}).forEach(k=>{if(b.weeks[k]===null)delete S.weeks[k];else S.weeks[k]=clone(b.weeks[k]);});
  save(); planRefreshViews();
}
function planCellData(wk,blk,i,d){
  const w=getWeek(wk,false); if(!w||!w[blk]||!w[blk][i])return null;
  const txt=String(w[blk][i][d]||"").trim(); if(!txt)return null;
  return {wk:String(wk),blk:blk,i:+i,d:+d,w:w,txt:txt,cid:blk+"-"+(+i)+"-"+(+d)};
}
function planEnsureSheet(){
  let ov=el("planActionSheet"); if(ov)return ov;
  ov=document.createElement("div");ov.id="planActionSheet";ov.className="plan-action-sheet";
  ov.setAttribute("role","dialog");ov.setAttribute("aria-modal","true");
  ov.addEventListener("click",e=>{if(e.target===ov)closePlanCellMenu();});
  document.body.appendChild(ov); return ov;
}
function planSheetExtraHtml(ctx){return typeof programAssistSheetExtras==="function"?programAssistSheetExtras(ctx):"";}
function openPlanCellMenu(wk,blk,i,d){
  const c=planCellData(wk,blk,i,d); if(!c)return false; planMenuCtx={wk:c.wk,blk:c.blk,i:c.i,d:c.d};
  const lbl=c.blk==="r"?(S.rowLabels.r[c.i]||"Rutin"):(S.rowLabels.s[c.i]||"Ders "+(c.i+1));
  const ov=planEnsureSheet();
  const taskDate=addDaysKey(c.wk,c.d),dateLabel=DAYS_FULL[c.d]+" · "+parseKey(taskDate).toLocaleDateString("tr-TR",{day:"numeric",month:"long"});
  ov.innerHTML='<div class="plan-sheet-card" onclick="event.stopPropagation()"><div class="plan-sheet-grab"></div>'+ 
    '<div class="plan-sheet-date">'+esc(dateLabel)+'</div><div class="plan-sheet-title">'+esc(lbl)+'</div><div class="plan-sheet-sub">'+esc(c.txt)+'</div>'+ 
    '<div class="plan-sheet-actions">'+
      '<button class="primary" onclick="planEditSelected()">✎ Düzenle</button>'+ 
      '<button onclick="planCopySelected()">⧉ Kopyala</button>'+ 
      '<button class="primary" onclick="planTomorrowSelected()">→ Yarına taşı</button>'+ 
      '<button class="danger" onclick="planDeleteSelected()">Sil</button>'+planSheetExtraHtml(c)+
    '</div><button class="plan-sheet-close" onclick="closePlanCellMenu()">Kapat</button></div>';
  ov.classList.add("show");
  try{navigator.vibrate&&navigator.vibrate(18);}catch(e){}
  return true;
}
function closePlanCellMenu(){const ov=el("planActionSheet");if(ov)ov.classList.remove("show");}
function planEditSelected(){
  const c=planMenuCtx;if(!c)return;closePlanCellMenu();
  if(c.wk!==keyOf(curWeek)){try{curWeek=parseKey(c.wk);renderPlan();}catch(e){}}
  requestAnimationFrame(()=>{
    const q='#grid'+(c.blk==="r"?'R':'S')+' .gtx[data-blk="'+c.blk+'"][data-i="'+c.i+'"][data-d="'+c.d+'"]';
    const n=document.querySelector(q);if(!n)return;n.focus();
    try{const r=document.createRange();r.selectNodeContents(n);const s=getSelection();s.removeAllRanges();s.addRange(r);}catch(e){}
  });
}
function planDeleteSelected(){
  const c=planMenuCtx&&planCellData(planMenuCtx.wk,planMenuCtx.blk,planMenuCtx.i,planMenuCtx.d);if(!c)return;
  const bk=planWeekBackup([c.wk]); c.w[c.blk][c.i][c.d]=""; delete c.w.dn[c.cid]; if(c.w.mv)delete c.w.mv[c.cid];
  pushUndo("Plan görevi silindi",()=>restorePlanWeekBackup(bk)); save(); closePlanCellMenu();planRefreshViews();toast("Görev silindi");
}
function planFindEmpty(w,blk,d,skip){
  for(let i=0;i<S.rows[blk];i++){if(i===skip)continue;if(w[blk]&&w[blk][i]&&!String(w[blk][i][d]||"").trim())return i;}return -1;
}
function planCopySelected(){
  const c=planMenuCtx&&planCellData(planMenuCtx.wk,planMenuCtx.blk,planMenuCtx.i,planMenuCtx.d);if(!c)return;
  const ti=planFindEmpty(c.w,c.blk,c.d,c.i);if(ti<0){toast("Bu günün boş satırı yok");return;}
  const bk=planWeekBackup([c.wk]);c.w[c.blk][ti][c.d]=c.txt;delete c.w.dn[c.blk+"-"+ti+"-"+c.d];if(c.w.mv)delete c.w.mv[c.blk+"-"+ti+"-"+c.d];
  if(c.blk==="s"&&!String(S.rowLabels.s[ti]||"").trim())S.rowLabels.s[ti]=S.rowLabels.s[c.i]||"";
  pushUndo("Plan görevi kopyalandı",()=>restorePlanWeekBackup(bk));save();closePlanCellMenu();planRefreshViews();toast("Görev kopyalandı ✓");
}
const planMoveLocks=new Set();
function movePlanCellTomorrow(wk,blk,i,d){
  const lockKey=String(wk)+"|"+blk+"|"+i+"|"+d;
  if(planMoveLocks.has(lockKey)){toast("Bu görev zaten taşınıyor");return false;}
  const c=planCellData(wk,blk,i,d);if(!c){toast("Taşınacak görev bulunamadı");return false;}
  planMoveLocks.add(lockKey);setTimeout(()=>planMoveLocks.delete(lockKey),900);
  const nextKey=addDaysKey(c.wk,c.d+1),nextDate=parseKey(nextKey),targetWk=keyOf(mondayOf(nextDate)),targetD=dowOf(nextDate);
  const bk=planWeekBackup([c.wk,targetWk]),tw=getWeek(targetWk,true);
  let ti=c.i;
  if(!tw[c.blk]||!tw[c.blk][ti]||String(tw[c.blk][ti][targetD]||"").trim())ti=planFindEmpty(tw,c.blk,targetD,-1);
  if(ti<0){restorePlanWeekBackup(bk);toast("Yarının boş satırı yok — önce Program'dan satır aç");return false;}
  const targetCid=c.blk+"-"+ti+"-"+targetD;
  tw[c.blk][ti][targetD]=c.txt;delete tw.dn[targetCid];
  if(!tw.mv||typeof tw.mv!=="object")tw.mv={};tw.mv[targetCid]={from:addDaysKey(c.wk,c.d),at:Date.now()};
  c.w[c.blk][c.i][c.d]="";delete c.w.dn[c.cid];if(c.w.mv)delete c.w.mv[c.cid];
  if(c.blk==="s"&&!String(S.rowLabels.s[ti]||"").trim())S.rowLabels.s[ti]=S.rowLabels.s[c.i]||"";
  pushUndo("Görev yarına taşındı",()=>restorePlanWeekBackup(bk));save();closePlanCellMenu();planRefreshViews();
  toast("Yarına taşındı ✓");return true;
}
function planTomorrowSelected(){const c=planMenuCtx;if(c)movePlanCellTomorrow(c.wk,c.blk,c.i,c.d);}
function bindPlanLongPress(){
  document.querySelectorAll("#gridR .gc,#gridS .gc").forEach(node=>{
    if(node.dataset.longPressBound)return;node.dataset.longPressBound="1";
    const tx=node.querySelector(".gtx");if(!tx)return;
    const cancel=()=>{clearTimeout(planPressTimer);planPressTimer=null;if(planPressNode)planPressNode.classList.remove("plan-pressing");planPressNode=null;planPressStart=null;};
    node.addEventListener("pointerdown",e=>{
      if(e.button!==undefined&&e.button!==0)return;if(e.target.closest(".tick,.cvid,button"))return;
      const txt=String(tx.textContent||"").trim();if(!txt)return;cancel();planPressNode=node;planPressStart={x:e.clientX,y:e.clientY};node.classList.add("plan-pressing");
      planPressTimer=setTimeout(()=>{const wk=keyOf(curWeek);openPlanCellMenu(wk,tx.dataset.blk,+tx.dataset.i,+tx.dataset.d);cancel();},560);
    });
    node.addEventListener("pointermove",e=>{if(!planPressStart)return;if(Math.abs(e.clientX-planPressStart.x)>12||Math.abs(e.clientY-planPressStart.y)>12)cancel();});
    node.addEventListener("pointerup",cancel);node.addEventListener("pointercancel",cancel);node.addEventListener("pointerleave",e=>{if(e.pointerType!=="touch")cancel();});
    node.addEventListener("contextmenu",e=>{if(String(tx.textContent||"").trim()){e.preventDefault();openPlanCellMenu(keyOf(curWeek),tx.dataset.blk,+tx.dataset.i,+tx.dataset.d);}});
  });
}

/* ==================================================================
   YKS DEFTERİM v2.4.0 — DETAYLI ANALİZ KATMANI
   Yeni veri toplamaz; mevcut deneme, yanlış ve çalışma kayıtlarını daha
   ayrıntılı özetler. Bu nedenle DATA_SCHEMA değişmez.
   ================================================================== */
const V22_VERSION="2.4.0";
function v22Avg(a){return a&&a.length?a.reduce((x,y)=>x+(Number(y)||0),0)/a.length:0;}
function v22Std(a){if(!a||a.length<2)return 0;const m=v22Avg(a);return Math.sqrt(a.reduce((s,x)=>s+Math.pow((Number(x)||0)-m,2),0)/a.length);}
function v22Pct(n,d){return d?Math.round(n/d*100):0;}
function v22Signed(n,suf){n=r2(Number(n)||0);return (n>0?"+":"")+n+(suf||"");}
function v22ExamList(type,limit){
  const a=(S.denemeler||[]).filter(d=>d.type===type).slice().sort((x,y)=>(x.date||"").localeCompare(y.date||"")||(x.id||0)-(y.id||0));
  return limit?a.slice(-limit):a;
}
function v22ExamDyb(list){let d=0,y=0,b=0;list.forEach(x=>(x.subjectResults||[]).forEach(s=>{d+=Number(s.d)||0;y+=Number(s.y)||0;b+=Number(s.b)||0;}));return {d,y,b,t:d+y+b};}
function v22Consistency(sd){return sd<=2?"çok dengeli":sd<=4.5?"dengeli":sd<=8?"oynak":"çok oynak";}
function v22RenderExamSummary(){
  const w=el("v22ExamSummary");if(!w)return;
  const list=v22ExamList(denemeType,5);
  if(!list.length){w.innerHTML='<div class="empty">Bu türde deneme biriktikçe son 5 denemenin ortalaması, oynaklığı ve tempo değişimi burada görünür.</div>';return;}
  const nets=list.map(x=>Number(x.totalNet)||0),avg=r2(v22Avg(nets)),last=nets[nets.length-1],first=nets[0],diff=r2(last-first),best=Math.max(...nets),worst=Math.min(...nets),sd=r2(v22Std(nets));
  const dyb=v22ExamDyb(list),durs=list.map(x=>Number(x.dur)||0).filter(x=>x>0),avgDur=durs.length?Math.round(v22Avg(durs)):0;
  let h='<div class="dayrow"><span class="k">Son '+list.length+' deneme ortalaması</span><span class="v">'+avg+' net</span></div>'+
    '<div class="dayrow"><span class="k">İlk → son</span><span class="v '+(diff>0?'trend-up':diff<0?'trend-down':'trend-flat')+'">'+first+' → '+last+' · '+v22Signed(diff,' net')+'</span></div>'+
    '<div class="dayrow"><span class="k">En düşük – en yüksek</span><span class="v">'+worst+' – '+best+'</span></div>'+
    '<div class="dayrow"><span class="k">Net istikrarı</span><span class="v">'+v22Consistency(sd)+' · σ '+sd+'</span></div>';
  if(dyb.t)h+='<div class="dayrow"><span class="k">Son denemelerde dağılım</span><span class="v">%'+v22Pct(dyb.d,dyb.t)+' doğru · %'+v22Pct(dyb.y,dyb.t)+' yanlış · %'+v22Pct(dyb.b,dyb.t)+' boş</span></div>';
  if(avgDur)h+='<div class="dayrow"><span class="k">Ortalama deneme süresi</span><span class="v">'+avgDur+' dk</span></div>';
  const notes=[];
  if(list.length>=3&&diff>=5)notes.push('Net yönün yukarı; son denemede ilkine göre '+Math.abs(diff)+' net öndesin.');
  if(list.length>=3&&diff<=-5)notes.push('Net yönün aşağı; hangi derste kayıp olduğunu aşağıdaki ders trendinden kontrol et.');
  if(sd>=8)notes.push('Denemeler arasında oynaklık yüksek. Tek bir iyi/kötü denemeye değil birkaç denemelik ortalamaya bakmak daha sağlıklı.');
  if(dyb.t&&v22Pct(dyb.b,dyb.t)>=18)notes.push('Boş oranı dikkat çekiyor; süre yönetimi ve emin olamadığın sorulara dönüş stratejisini incele.');
  if(notes.length)h+='<p class="hint"><b>Yorum:</b> '+esc(notes.join(' '))+'</p>';
  w.innerHTML=h;
}
function v22SubjectRows(type){
  const by={};v22ExamList(type,0).forEach(d=>(d.subjectResults||[]).forEach(sr=>{const n=String(sr.name||"").trim();if(!n)return;(by[n]||(by[n]=[])).push({date:d.date,net:Number(sr.net)||0,d:Number(sr.d)||0,y:Number(sr.y)||0,b:Number(sr.b)||0,cap:Number(sr.cap)||0});}));
  return Object.keys(by).map(name=>{
    const a=by[name],recent=a.slice(-3),prev=a.slice(-6,-3),cur=r2(v22Avg(recent.map(x=>x.net))),old=prev.length?r2(v22Avg(prev.map(x=>x.net))):null,diff=old===null?(a.length>1?r2(a[a.length-1].net-a[0].net):0):r2(cur-old);
    const dyb=recent.reduce((z,x)=>({d:z.d+x.d,y:z.y+x.y,b:z.b+x.b}),{d:0,y:0,b:0}),tot=dyb.d+dyb.y+dyb.b;
    return {name,n:a.length,cur,old,diff,wrong:v22Pct(dyb.y,tot),blank:v22Pct(dyb.b,tot)};
  }).sort((a,b)=>a.diff-b.diff||b.n-a.n);
}
function v22RenderSubjectTrend(){
  const w=el("v22SubjectTrend");if(!w)return;const rows=v22SubjectRows(denemeType);
  if(!rows.length){w.innerHTML='<div class="empty">Ders bazlı doğru/yanlış/boş girdikçe ders trendleri burada oluşur.</div>';return;}
  let h='<table><tr><th style="text-align:left">Ders</th><th>Son ort.</th><th>Değişim</th><th>Y / B</th></tr>';
  rows.forEach(x=>{h+='<tr><td style="text-align:left">'+esc(x.name)+'<br><small>'+x.n+' deneme</small></td><td>'+x.cur+'</td><td class="'+(x.diff>0?'trend-up':x.diff<0?'trend-down':'trend-flat')+'">'+v22Signed(x.diff)+'</td><td>%'+x.wrong+' / %'+x.blank+'</td></tr>';});h+='</table>';
  const weak=rows[0],strong=rows.slice().sort((a,b)=>b.diff-a.diff)[0];
  const msg=[];if(strong&&strong.diff>=1)msg.push('En belirgin yükseliş: '+strong.name+' '+v22Signed(strong.diff)+' net.');if(weak&&weak.diff<=-1)msg.push('En belirgin düşüş: '+weak.name+' '+v22Signed(weak.diff)+' net.');
  const blank=rows.slice().sort((a,b)=>b.blank-a.blank)[0];if(blank&&blank.blank>=20)msg.push(blank.name+' son denemelerde %'+blank.blank+' boş; süre/karar verme tarafına bak.');
  if(msg.length)h+='<p class="hint"><b>Okuma:</b> '+esc(msg.join(' '))+'</p>';w.innerHTML=h;
}
function renderV22ExamAnalysis(){v22RenderExamSummary();v22RenderSubjectTrend();}

function v22WrongWindow(days,offset){
  const from=addDaysKey(todayKey(),-((offset||0)+days-1)),to=addDaysKey(todayKey(),-(offset||0)),by={},kind={bilmiyordum:0,dikkat:0,sure:0,diger:0};let total=0,entries=0;
  (S.wrongLog||[]).forEach(x=>{const dt=String(x.date||"");if(dt<from||dt>to)return;const n=Math.max(1,Number(x.n)||1),k=(x.subject||"")+"|"+(x.topic||"");if(!by[k])by[k]={subject:x.subject||"",topic:x.topic||"",sum:0,days:new Set(),last:""};by[k].sum+=n;by[k].days.add(dt);if(dt>by[k].last)by[k].last=dt;total+=n;entries++;const c=x.kind&&Object.prototype.hasOwnProperty.call(kind,x.kind)?x.kind:"diger";kind[c]+=n;});
  return {from,to,total,entries,kind,topics:Object.values(by).map(x=>({subject:x.subject,topic:x.topic,sum:x.sum,occ:x.days.size,last:x.last})).sort((a,b)=>b.sum-a.sum)};
}
function v22RenderWrongHealth(){
  const w=el("v22WrongHealth");if(!w)return;const cur=v22WrongWindow(30,0),prev=v22WrongWindow(30,30);
  if(!cur.total&&!prev.total){w.innerHTML='<div class="empty">Yanlış kayıtların arttıkça son 30 gün ile önceki 30 günü karşılaştıracağım.</div>';return;}
  const change=cur.total-prev.total,causes=[['Bilgi eksiği',cur.kind.bilmiyordum],['Dikkat',cur.kind.dikkat],['Süre',cur.kind.sure],['Belirtilmemiş',cur.kind.diger]].sort((a,b)=>b[1]-a[1]);
  let h='<div class="dayrow"><span class="k">Son 30 gün yanlış kaydı</span><span class="v">'+cur.total+'</span></div><div class="dayrow"><span class="k">Önceki 30 gün</span><span class="v">'+prev.total+'</span></div><div class="dayrow"><span class="k">Kayıt değişimi</span><span class="v '+(change<0?'trend-up':change>0?'trend-down':'trend-flat')+'">'+v22Signed(change)+'</span></div>';
  if(cur.total)h+='<div class="dayrow"><span class="k">Baskın sebep</span><span class="v">'+esc(causes[0][0])+' · %'+v22Pct(causes[0][1],cur.total)+'</span></div>';
  const both={};prev.topics.forEach(x=>both[x.subject+'|'+x.topic]={subject:x.subject,topic:x.topic,prev:x.sum,cur:0});cur.topics.forEach(x=>{const k=x.subject+'|'+x.topic;(both[k]||(both[k]={subject:x.subject,topic:x.topic,prev:0,cur:0})).cur=x.sum;});
  const trends=Object.values(both).filter(x=>x.cur||x.prev).sort((a,b)=>(b.cur-b.prev)-(a.cur-a.prev));
  const rising=trends.find(x=>x.cur-x.prev>=2),falling=trends.slice().sort((a,b)=>(a.cur-a.prev)-(b.cur-b.prev)).find(x=>x.prev-x.cur>=2);
  if(rising)h+='<div class="dayrow"><span class="k">Daha çok biriken konu</span><span class="v trend-down">'+esc(rising.subject+' · '+rising.topic)+' · '+rising.prev+' → '+rising.cur+'</span></div>';
  if(falling)h+='<div class="dayrow"><span class="k">Kaydı azalan konu</span><span class="v trend-up">'+esc(falling.subject+' · '+falling.topic)+' · '+falling.prev+' → '+falling.cur+'</span></div>';
  h+='<p class="hint">Buradaki değişim <b>yanlış oranı</b> değil, kaydettiğin yanlış adedidir. Daha az soru çözdüğün dönemlerde sayı doğal olarak düşebilir.</p>';w.innerHTML=h;
}

function v22RangeDays(days,offset){const rows=[];for(let i=offset||0;i<(offset||0)+days;i++){const k=addDaysKey(todayKey(),-i),m=Number(S.pomoMin[k])||0,q=Number(S.solved[k])||0;rows.push({k,m,q,active:m>0||q>0||dayDone(k)});}return rows;}
function v22LongestActive(rows){let best=0,run=0;rows.slice().reverse().forEach(x=>{if(x.active){run++;best=Math.max(best,run);}else run=0;});return best;}
function v22SubjectRangeOffset(days,offset){const m={};for(let i=offset||0;i<(offset||0)+days;i++){const k=addDaysKey(todayKey(),-i),row=S.pomoSubj[k]||{};Object.keys(row).forEach(s=>m[s]=(m[s]||0)+(Number(row[s])||0));}return m;}
function v22RenderProgressExtras(){
  const days=v2ProgressDays,rows=v22RangeDays(days,0),active=rows.filter(x=>x.active),rw=el("progressRhythm");if(rw){if(!active.length)rw.innerHTML='<div class="empty">Çalışma kaydı geldikçe ritim analizi oluşur.</div>';else{const min=active.reduce((a,x)=>a+x.m,0),q=active.reduce((a,x)=>a+x.q,0),bestM=rows.slice().sort((a,b)=>b.m-a.m)[0],bestQ=rows.slice().sort((a,b)=>b.q-a.q)[0],st=v22LongestActive(rows),stt=typeof startTimes==='function'?startTimes(days):null;let h='<div class="dayrow"><span class="k">Aktif gün başına çalışma</span><span class="v">'+fmtHM(Math.round(min/active.length))+'</span></div><div class="dayrow"><span class="k">Aktif gün başına soru</span><span class="v">'+Math.round(q/active.length)+'</span></div><div class="dayrow"><span class="k">Dönem içi devamlılık</span><span class="v">%'+Math.round(active.length/days*100)+' · en uzun '+st+' gün</span></div>';
  if(bestM&&bestM.m)h+='<div class="dayrow"><span class="k">En uzun çalışma günü</span><span class="v">'+parseKey(bestM.k).toLocaleDateString("tr-TR",{day:"numeric",month:"short"})+' · '+fmtHM(bestM.m)+'</span></div>';if(bestQ&&bestQ.q)h+='<div class="dayrow"><span class="k">En çok soru çözülen gün</span><span class="v">'+parseKey(bestQ.k).toLocaleDateString("tr-TR",{day:"numeric",month:"short"})+' · '+bestQ.q+'</span></div>';if(stt&&isFinite(stt.ortalama)){const hh=Math.floor(stt.ortalama),mm=Math.round((stt.ortalama-hh)*60);h+='<div class="dayrow"><span class="k">İlk oturum ortalaması</span><span class="v">'+String(hh).padStart(2,"0")+':'+String(mm%60).padStart(2,"0")+'</span></div>';}rw.innerHTML=h;}}
  const cw=el("progressSubjectChange");if(cw){const cur=v22SubjectRangeOffset(days,0),prev=v22SubjectRangeOffset(days,days),names=[...new Set(Object.keys(cur).concat(Object.keys(prev)))],arr=names.map(n=>({n,cur:cur[n]||0,prev:prev[n]||0,d:(cur[n]||0)-(prev[n]||0)})).filter(x=>x.cur||x.prev).sort((a,b)=>Math.abs(b.d)-Math.abs(a.d));if(!arr.length)cw.innerHTML='<div class="empty">Odak oturumlarında ders seçtikçe önceki dönemle ders bazlı karşılaştırma oluşur.</div>';else cw.innerHTML=arr.slice(0,10).map(x=>'<div class="dayrow"><span class="k">'+esc(x.n)+'</span><span class="v '+(x.d>0?'trend-up':x.d<0?'trend-down':'trend-flat')+'">'+fmtHM(x.cur)+' · '+(x.d>0?'+':'')+Math.round(x.d)+' dk</span></div>').join('')+'<p class="hint">Değişim, seçili '+days+' günlük dönemi ondan önceki aynı uzunluktaki dönemle karşılaştırır.</p>';}
}
function v22RenderHomeSummary(){
  const w=el("homeDeepAnalysis");if(!w)return;const items=[];const cur=v2RangeAgg(7,0),prev=v2RangeAgg(7,7);
  if(cur.min||prev.min)items.push({k:'7 günlük çalışma',v:fmtHM(cur.min)+' · '+v2DeltaText(cur.min,prev.min),c:cur.min>=prev.min?'trend-up':'trend-down'});
  if(cur.q||prev.q)items.push({k:'7 günlük soru',v:cur.q+' · '+v2DeltaText(cur.q,prev.q),c:cur.q>=prev.q?'trend-up':'trend-down'});
  const latest=(S.denemeler||[]).filter(d=>d.type!=="BRANS").slice().sort((a,b)=>(b.date||"").localeCompare(a.date||"")||(b.id||0)-(a.id||0))[0];if(latest){const ls=v22ExamList(latest.type,5),av=r2(v22Avg(ls.map(x=>x.totalNet)));items.push({k:'Son '+latest.type+' denemesi',v:latest.totalNet+' net · son '+ls.length+' ort. '+av,c:''});}
  const wr=v2RecurringWrongTopics()[0];if(wr)items.push({k:'Takip edilmesi gereken yanlış',v:wr.subject+' · '+wr.topic+' · '+wr.sum+' kayıt',c:'trend-down'});
  w.innerHTML=items.length?items.slice(0,4).map(x=>'<div class="dayrow"><span class="k">'+esc(x.k)+'</span><span class="v '+x.c+'">'+esc(x.v)+'</span></div>').join('')+'<div class="rowtools" style="margin-top:10px"><button class="btn ghost tiny" onclick="go(\'progress\')">İlerlemeyi aç</button><button class="btn ghost tiny" onclick="go(\'deneme\');setAnaTab(\'trend\')">Deneme detayları</button></div>':'<div class="empty">Biraz veri biriktiğinde haftalık çalışma, deneme ve yanlış özetin burada görünecek.</div>';
}

/* Mevcut render zincirlerine dokunmadan detay katmanını bağla. */
const __v22BlankWrong=renderBlankWrong;renderBlankWrong=function(){const r=__v22BlankWrong();try{renderV22ExamAnalysis();}catch(e){infraError("v22-exam",e);}return r;};
const __v22Repeat=renderRepeat;renderRepeat=function(){const r=__v22Repeat();try{v22RenderWrongHealth();}catch(e){infraError("v22-wrong",e);}return r;};
const __v22Progress=renderProgress;renderProgress=function(){const r=__v22Progress();try{v22RenderProgressExtras();}catch(e){infraError("v22-progress",e);}return r;};
const __v22Smart=renderSmartInsights;renderSmartInsights=function(){const r=__v22Smart();try{v22RenderHomeSummary();}catch(e){infraError("v22-home",e);}return r;};
const __v22AnaTab=setAnaTab;setAnaTab=function(t){const r=__v22AnaTab(t);try{if(t==="trend")renderV22ExamAnalysis();if(t==="verim")v22RenderWrongHealth();}catch(e){infraError("v22-tab",e);}return r;};

function runV22SelfTest(){
  const checks=[],add=(n,o)=>checks.push([n,!!o]);const keep=S,keepType=denemeType;
  try{
    const t=normalize(JSON.parse(JSON.stringify(DEF))),T=todayKey();S=t;denemeType="TYT";
    for(let i=0;i<6;i++)S.denemeler.push({id:2200+i,type:"TYT",name:"Test "+i,date:addDaysKey(T,-(30-i*5)),dur:150-i,totalNet:60+i*3,subjectResults:[{name:"Türkçe",d:25+i,y:5,b:10-i,net:r2(25+i-1.25),cap:40},{name:"Temel Matematik",d:15+i*2,y:8-i,b:17-i,net:r2(15+i*2-(8-i)/4),cap:40}]});
    S.wrongLog=[{id:1,date:addDaysKey(T,-5),subject:"Matematik",topic:"Problemler",n:4,kind:"dikkat"},{id:2,date:addDaysKey(T,-12),subject:"Matematik",topic:"Problemler",n:3,kind:"dikkat"},{id:3,date:addDaysKey(T,-36),subject:"Matematik",topic:"Problemler",n:7,kind:"bilmiyordum"}];
    for(let i=0;i<14;i++){const k=addDaysKey(T,-i);S.pomoMin[k]=60+i;S.solved[k]=40+i;S.pomoSubj[k]={Matematik:35+i,Türkçe:25};}
    add("version",APP_VERSION==="3.2.5"&&V22_VERSION==="2.4.0"&&DATA_SCHEMA===21);add("exam-summary",v22ExamList("TYT",5).length===5&&v22SubjectRows("TYT").length===2);add("wrong-window",v22WrongWindow(30,0).total===7&&v22WrongWindow(30,30).total===7);add("rhythm",v22LongestActive(v22RangeDays(7,0))===7);add("html-boxes",!!el("v22ExamSummary")&&!!el("v22SubjectTrend")&&!!el("v22WrongHealth")&&!!el("progressRhythm")&&!!el("progressSubjectChange")&&!!el("homeDeepAnalysis"));
    renderV22ExamAnalysis();v22RenderWrongHealth();v22RenderProgressExtras();v22RenderHomeSummary();add("rendered",el("v22ExamSummary").textContent.includes("deneme ortalaması")&&el("v22WrongHealth").textContent.includes("Son 30 gün")&&el("progressRhythm").textContent.includes("Aktif gün"));
  }catch(e){checks.push(["exception",false]);try{infraError("v22-selftest",e);}catch(x){}}
  finally{S=keep;denemeType=keepType;try{renderAll();}catch(e){}}
  const ok=checks.every(x=>x[1]);document.documentElement.setAttribute("data-v22-selftest",ok?"ok":"fail");let o=el("v22SelfTestResult");if(!o){o=document.createElement("pre");o.id="v22SelfTestResult";o.hidden=true;document.body.appendChild(o);}o.textContent=(ok?"YKS_V22_SELFTEST_OK":"YKS_V22_SELFTEST_FAIL")+" "+checks.map(x=>x[0]+":"+(x[1]?"ok":"fail")).join(",");return {ok,checks};
}
const __v22Builtin=runBuiltInSelfTest;runBuiltInSelfTest=function(){__v22Builtin();const r=runV22SelfTest();if(!r.ok){document.documentElement.setAttribute("data-selftest","fail");const o=el("selfTestResult");if(o)o.textContent="YKS_SELFTEST_FAIL";}};

/* ================= v2.4.0 GELİŞMİŞ ANALİZ ================= */
const V24_VERSION="2.4.0"; let v24ExamWindow=10;
function v24Mean(a){return a.length?a.reduce((s,x)=>s+(Number(x)||0),0)/a.length:0}
function v24Corr(a,b){if(!a||!b||a.length!==b.length||a.length<3)return null;const am=v24Mean(a),bm=v24Mean(b);let n=0,x=0,y=0;for(let i=0;i<a.length;i++){const da=a[i]-am,db=b[i]-bm;n+=da*db;x+=da*da;y+=db*db}return x&&y?n/Math.sqrt(x*y):0}
function v24Series(type,n){const a=v22ExamList(type,0);return n?a.slice(-n):a}
function v24Model(type,n){const a=v24Series(type,n||v24ExamWindow);if(a.length<2)return null;const t0=parseKey(a[0].date).getTime()/86400000,x=a.map(d=>parseKey(d.date).getTime()/86400000-t0),y=a.map(d=>Number(d.totalNet)||0),xm=v24Mean(x),ym=v24Mean(y);let num=0,den=0;for(let i=0;i<x.length;i++){num+=(x[i]-xm)*(y[i]-ym);den+=(x[i]-xm)*(x[i]-xm)}const sl=den?num/den:0;return {n:a.length,list:a,slopeWeek:sl*7}}
function v24Moving(a,n){return a.map((_,i)=>v24Mean(a.slice(Math.max(0,i-n+1),i+1)))}
function setV24ExamWindow(n){v24ExamWindow=[5,10,20].includes(+n)?+n:10;renderV24Exam()}
function v24Canvas(){const cv=el('v24TrendChart');if(!cv)return null;const w=Math.max(280,cv.clientWidth||320),h=Math.max(180,cv.clientHeight||200),d=Math.min(2,window.devicePixelRatio||1);cv.width=Math.round(w*d);cv.height=Math.round(h*d);const c=cv.getContext('2d');c.setTransform(d,0,0,d,0,0);return {cv,c,w,h}}
function v24DrawTrend(){const f=v24Canvas();if(!f)return;const {c,w,h}=f,a=v24Series(denemeType,v24ExamWindow),cs=getComputedStyle(document.documentElement),txt=cs.getPropertyValue('--label-2').trim()||'#777',sep=cs.getPropertyValue('--sep').trim()||'#ddd',acc=cs.getPropertyValue('--accent').trim()||'#0A6CFF',ok=cs.getPropertyValue('--success').trim()||'#12A150';c.clearRect(0,0,w,h);if(!a.length){c.fillStyle=txt;c.textAlign='center';c.fillText('Deneme ekledikçe trend oluşur',w/2,h/2);return}const y=a.map(d=>Number(d.totalNet)||0),ma=v24Moving(y,3),lo=Math.min(...y,...ma),hi=Math.max(...y,...ma),span=Math.max(5,hi-lo),mn=lo-span*.12,mx=hi+span*.12,p={l:36,r:12,t:18,b:24},px=i=>p.l+(a.length===1?(w-p.l-p.r)/2:i*(w-p.l-p.r)/(a.length-1)),py=v=>p.t+(mx-v)/(mx-mn)*(h-p.t-p.b);c.strokeStyle=sep;c.fillStyle=txt;c.font='10px system-ui';c.textAlign='right';for(let g=0;g<4;g++){const v=mn+(mx-mn)*g/3,Y=py(v);c.beginPath();c.moveTo(p.l,Y);c.lineTo(w-p.r,Y);c.stroke();c.fillText(r2(v),p.l-5,Y+3)}c.strokeStyle=acc;c.lineWidth=2.2;c.beginPath();y.forEach((v,i)=>i?c.lineTo(px(i),py(v)):c.moveTo(px(i),py(v)));c.stroke();c.fillStyle=acc;y.forEach((v,i)=>{c.beginPath();c.arc(px(i),py(v),3,0,7);c.fill()});if(a.length>=3){c.strokeStyle=ok;c.setLineDash([5,4]);c.beginPath();ma.forEach((v,i)=>i?c.lineTo(px(i),py(v)):c.moveTo(px(i),py(v)));c.stroke();c.setLineDash([])}}
function v24RenderTrend(){[5,10,20].forEach(n=>el('v24w'+n)?.classList.toggle('on',n===v24ExamWindow));const w=el('v24TrendStats'),a=v24Series(denemeType,v24ExamWindow);v24DrawTrend();if(!w)return;if(!a.length){w.innerHTML='<div class="empty">Bu türde deneme yok.</div>';return}const y=a.map(d=>Number(d.totalNet)||0),m=v24Model(denemeType,v24ExamWindow),sl=m?m.slopeWeek:null;w.innerHTML='<div class="v24-grid"><div class="v24-metric"><small>Ortalama</small><b>'+r2(v24Mean(y))+' net</b></div><div class="v24-metric"><small>Son 3 hareketli ort.</small><b>'+r2(v24Mean(y.slice(-3)))+' net</b></div><div class="v24-metric"><small>En iyi / düşük</small><b>'+Math.max(...y)+' / '+Math.min(...y)+'</b></div><div class="v24-metric"><small>Trend hızı</small><b class="'+(sl>0?'trend-up':sl<0?'trend-down':'trend-flat')+'">'+(sl===null?'—':(sl>0?'+':'')+r2(sl)+' net/hafta')+'</b></div></div><p class="v24-note">Yeşil kesikli çizgi son 3 denemenin hareketli ortalamasıdır.</p>'}
function v24SubjectGrowth(){const by={};v22ExamList(denemeType,0).forEach(d=>(d.subjectResults||[]).forEach(x=>(by[x.name]||(by[x.name]=[])).push({net:+x.net||0,cap:+x.cap||1})));return Object.keys(by).map(name=>{const a=by[name],c=a.slice(-5),p=a.slice(-10,-5),ca=v24Mean(c.map(x=>x.net)),pa=p.length?v24Mean(p.map(x=>x.net)):null,cn=v24Mean(c.map(x=>x.cap)),pn=p.length?v24Mean(p.map(x=>x.cap)):cn;return {name,n:a.length,cur:r2(ca),prev:pa===null?null:r2(pa),diff:r2(pa===null?(a.length>1?a.at(-1).net-a[0].net:0):ca-pa),norm:pa===null?null:Math.round((ca/cn-pa/pn)*100)}}).sort((a,b)=>b.diff-a.diff)}
function v24RenderSubjects(){const w=el('v24SubjectGrowth');if(!w)return;const a=v24SubjectGrowth();if(!a.length){w.innerHTML='<div class="empty">Ders verisi geldikçe son 5 ve önceki 5 karşılaştırılır.</div>';return}w.innerHTML='<table><tr><th style="text-align:left">Ders</th><th>Son 5</th><th>Önceki</th><th>Fark</th><th>Oransal</th></tr>'+a.map(x=>'<tr><td style="text-align:left"><b>'+esc(x.name)+'</b><br><small>'+x.n+' kayıt</small></td><td>'+x.cur+'</td><td>'+(x.prev===null?'—':x.prev)+'</td><td class="'+(x.diff>0?'trend-up':x.diff<0?'trend-down':'trend-flat')+'">'+v22Signed(x.diff)+'</td><td>'+(x.norm===null?'—':(x.norm>0?'+':'')+x.norm+' puan')+'</td></tr>').join('')+'</table><p class="v24-note">Oransal değer, farklı soru sayılı dersleri daha adil karşılaştırmak için ders kapasitesine göre normalize edilir.</p>'}
function v24RenderRisk(){const w=el('v24TopicRisk');if(!w)return;const a=v2RiskList(30).slice(0,10);if(!a.length){w.innerHTML='<div class="empty">Yanlış, tekrar ve konu verisi geldikçe risk puanı oluşur.</div>';return}w.innerHTML=a.map(x=>{const hi=x.score>=55,mid=x.score>=30;return '<div class="risk-row"><div><div class="risk-title">'+esc(x.subj+' · '+x.topic)+'</div><div class="risk-why">'+esc(x.reasons.join(' · '))+' · '+x.score+' puan</div></div><span class="risk-badge '+(hi?'risk-high':mid?'risk-mid':'risk-low')+'">'+(hi?'Yüksek':mid?'Orta':'Düşük')+'</span></div>'}).join('')+'<p class="v24-note">Risk; yanlışlar, gecikmiş tekrarlar, konu durumu, deneme başarısı ve çalışma miktarını birlikte tartar.</p>'}
function v24Causes(days){const c=v22WrongWindow(days,0),p=v22WrongWindow(days,days),defs=[['bilmiyordum','Bilgi eksiği'],['dikkat','Dikkatsizlik'],['sure','Süre'],['diger','Belirtilmemiş']];return defs.map(([k,n])=>({n,cp:c.total?Math.round(c.kind[k]/c.total*100):0,pp:p.total?Math.round(p.kind[k]/p.total*100):0,cur:c.kind[k]}))}
function v24RenderCauses(){const w=el('v24WrongCauses');if(!w)return;const a=v24Causes(60);if(!a.reduce((s,x)=>s+x.cur,0)){w.innerHTML='<div class="empty">Yanlış eklerken sebep seçtikçe dağılım oluşur.</div>';return}w.innerHTML=a.map(x=>'<div class="cause-row"><div class="cause-line"><span>'+x.n+'</span><b>%'+x.cp+' <small class="'+(x.cp<x.pp?'trend-up':x.cp>x.pp?'trend-down':'trend-flat')+'">'+(x.cp-x.pp>0?'+':'')+(x.cp-x.pp)+' puan</small></b></div><div class="cause-bar"><i style="width:'+x.cp+'%"></i></div></div>').join('')+'<p class="v24-note">Değişim son 60 günü önceki 60 günle karşılaştırır.</p>'}
function v24StudyBefore(date,subj){let m=0;for(let i=1;i<=14;i++){const row=S.pomoSubj[addDaysKey(date,-i)]||{};Object.keys(row).forEach(n=>{if(!subj||v2SubjectMatch(n,subj))m+=+row[n]||0})}return m}
function v24CorrLabel(r){const a=Math.abs(r);return a>=.65?'güçlü':a>=.4?'orta':a>=.2?'zayıf':'belirgin değil'}
function v24RenderStudyResult(){const w=el('v24StudyResult');if(!w)return;const a=v22ExamList(denemeType,10);if(a.length<4){w.innerHTML='<div class="empty">En az 4 deneme ve öncesinde ders etiketli çalışma kaydı gerekli.</div>';return}const x=a.map(d=>v24StudyBefore(d.date,'')),y=a.map(d=>+d.totalNet||0),r=v24Corr(x,y);let h='<div class="dayrow"><span class="k">Önceki 14 gün çalışma ↔ net</span><span class="v">'+(r>=0?'+':'')+r.toFixed(2)+' · '+v24CorrLabel(r)+'</span></div>';const by={};a.forEach(d=>(d.subjectResults||[]).forEach(sr=>{if(sr.cap>0)(by[sr.name]||(by[sr.name]=[])).push({x:v24StudyBefore(d.date,sr.name),y:(+sr.net||0)/sr.cap*100})}));const sub=Object.keys(by).map(n=>by[n].length>=4?{n,r:v24Corr(by[n].map(z=>z.x),by[n].map(z=>z.y))}:null).filter(Boolean).sort((u,v)=>Math.abs(v.r)-Math.abs(u.r))[0];if(sub)h+='<div class="dayrow"><span class="k">En belirgin ders ilişkisi</span><span class="v">'+esc(sub.n)+' · '+(sub.r>=0?'+':'')+sub.r.toFixed(2)+'</span></div>';h+='<p class="v24-note">Korelasyon nedensellik değildir; zor dönemlerde daha çok çalışmak gibi başka etkenler sonucu değiştirebilir.</p>';w.innerHTML=h}
function v24QuestionRows(days){const q={},m={};for(let i=0;i<days;i++){const k=addDaysKey(todayKey(),-i);Object.keys(S.solvedTopic[k]||{}).forEach(key=>{const p=key.split('|'),n=p[1]||'';if(n)q[n]=(q[n]||0)+(+S.solvedTopic[k][key]||0)});Object.keys(S.pomoSubj[k]||{}).forEach(n=>m[n]=(m[n]||0)+(+S.pomoSubj[k][n]||0))}return [...new Set([...Object.keys(q),...Object.keys(m)])].map(n=>({n,q:q[n]||0,m:m[n]||0,ph:m[n]?q[n]/m[n]*60:0})).filter(x=>x.q||x.m).sort((a,b)=>b.q-a.q)}
function v24RenderEfficiency(){const w=el('v24QuestionEfficiency');if(!w)return;const a=v24QuestionRows(30);if(!a.length){w.innerHTML='<div class="empty">Konu soruları ve ders etiketli çalışma kaydı geldikçe verimlilik oluşur.</div>';return}w.innerHTML='<table><tr><th style="text-align:left">Ders</th><th>Konu sorusu</th><th>Çalışma</th><th>Soru/saat</th></tr>'+a.slice(0,12).map(x=>'<tr><td style="text-align:left">'+esc(x.n)+'</td><td>'+x.q+'</td><td>'+fmtHM(x.m)+'</td><td>'+(x.q&&x.m?r2(x.ph):'—')+'</td></tr>').join('')+'</table><p class="v24-note">Soru/saat yalnız konu seçilerek kaydedilmiş soruları kullanır; genel günlük soruları rastgele bir derse dağıtmıyorum.</p>'}
function v24RenderTarget(){const w=el('v24TargetGap');if(!w)return;const a=v24Series(denemeType,5);if(!S.targetNet){w.innerHTML='<div class="empty">Ayarlar’dan hedef net gir.</div>';return}if(!a.length){w.innerHTML='<div class="empty">Hedef '+S.targetNet+' net · ilk denemeni bekliyor.</div>';return}const cur=r2(v24Mean(a.map(x=>x.totalNet))),gap=r2(S.targetNet-cur),m=v24Model(denemeType,10);w.innerHTML='<div class="dayrow"><span class="k">Son '+a.length+' ortalama</span><span class="v">'+cur+'</span></div><div class="dayrow"><span class="k">Hedef</span><span class="v">'+S.targetNet+'</span></div><div class="dayrow"><span class="k">Kalan</span><span class="v '+(gap<=0?'trend-up':'')+'">'+(gap>0?gap+' net':gap<0?Math.abs(gap)+' net hedefin üstü':'Hedefe ulaştın')+'</span></div>'+(gap>0&&m&&m.slopeWeek>.2?'<div class="dayrow"><span class="k">Mevcut çizgisel hız</span><span class="v">~'+Math.ceil(gap/m.slopeWeek)+' hafta</span></div><p class="v24-note">Bu, eğilimin matematiksel uzatmasıdır; sonuç garantisi değildir.</p>':'')}
function v24Support(){const e=v22ExamList(denemeType,0).length,a=v2RangeAgg(30,0).active,w=v22WrongWindow(60,0).entries,t=Object.keys(S.pomoSubj||{}).filter(k=>k>=addDaysKey(todayKey(),-29)&&Object.keys(S.pomoSubj[k]||{}).length).length,score=Math.round(Math.min(45,e/10*45)+Math.min(25,a/20*25)+Math.min(15,w/12*15)+Math.min(15,t/15*15));return {score,e,a,w,t,level:score>=75?'Güçlü veri':score>=45?'Orta veri':'Veri az'}}
function v24RenderConfidence(){const w=el('v24Confidence');if(!w)return;const d=v24Support();w.innerHTML='<div class="confidence-wrap"><div class="confidence-score" style="--p:'+d.score+'"><b>%'+d.score+'</b></div><div><p class="eyebrow" style="margin:0">Analiz veri desteği</p><strong>'+d.level+'</strong><div class="v24-note">'+d.e+' deneme · '+d.a+' aktif gün · '+d.w+' yanlış kaydı · '+d.t+' ders etiketli gün</div></div></div><p class="v24-note">Bu istatistiksel güven aralığı değil; yorumların dayandığı veri miktarını gösterir.</p>'}
function v24RenderEndurance(){const w=el('v24Endurance');if(!w)return;const a=v22ExamList(denemeType,12).filter(d=>+d.dur>0);if(a.length<4){w.innerHTML='<div class="empty">Süre bilgisi olan en az 4 deneme gerekli.</div>';return}const dur=a.map(d=>+d.dur),net=a.map(d=>+d.totalNet||0),blank=a.map(d=>{const z=v22ExamDyb([d]);return z.t?z.b/z.t*100:0}),rn=v24Corr(dur,net),rb=v24Corr(dur,blank),rc={yetti:0,zor:0,yetmedi:0};a.forEach(d=>{if(d.refl&&rc[d.refl.time]!==undefined)rc[d.refl.time]++});w.innerHTML='<div class="dayrow"><span class="k">Süre ↔ net</span><span class="v">'+(rn>=0?'+':'')+rn.toFixed(2)+' · '+v24CorrLabel(rn)+'</span></div><div class="dayrow"><span class="k">Süre ↔ boş oranı</span><span class="v">'+(rb>=0?'+':'')+rb.toFixed(2)+' · '+v24CorrLabel(rb)+'</span></div><div class="dayrow"><span class="k">Süre öz değerlendirmesi</span><span class="v">'+rc.yetti+' yetti · '+rc.zor+' zor · '+rc.yetmedi+' yetmedi</span></div><p class="v24-note">Yayınevi zorluğu gibi etkenler bu ilişkiyi değiştirebilir; neden-sonuç olarak yorumlama.</p>'}
function renderV24Exam(){v24RenderTrend();v24RenderSubjects();v24RenderTarget();v24RenderConfidence();v24RenderEndurance()}
function renderV24Verim(){v24RenderRisk();v24RenderCauses();v24RenderStudyResult();v24RenderEfficiency()}
function v24Weekdays(days){const n=['Paz','Pzt','Sal','Çar','Per','Cum','Cmt'],a=Array.from({length:7},()=>({m:0,active:0,total:0}));for(let i=0;i<days;i++){const k=addDaysKey(todayKey(),-i),d=parseKey(k).getDay(),m=+S.pomoMin[k]||0,q=+S.solved[k]||0;a[d].m+=m;a[d].total++;if(m||q||dayDone(k))a[d].active++}return a.map((x,i)=>({name:n[i],avg:x.total?x.m/x.total:0,rate:x.total?x.active/x.total:0}))}
function v24RenderConsistency(){const w=el('v24Consistency');if(!w)return;const d=v2ProgressDays,r=v22RangeDays(d,0),active=r.filter(x=>x.active).length;if(!active){w.innerHTML='<div class="empty">Çalışma kaydı geldikçe istikrar oluşur.</div>';return}const wd=v24Weekdays(d),best=wd.slice().sort((a,b)=>b.avg-a.avg)[0],weak=wd.slice().sort((a,b)=>a.rate-b.rate)[0];w.innerHTML='<div class="dayrow"><span class="k">Devamlılık</span><span class="v">%'+Math.round(active/d*100)+' · '+active+'/'+d+' gün</span></div><div class="dayrow"><span class="k">En uzun seri</span><span class="v">'+v22LongestActive(r)+' gün</span></div><div class="dayrow"><span class="k">En güçlü gün</span><span class="v">'+best.name+' · ort. '+fmtHM(Math.round(best.avg))+'</span></div><div class="dayrow"><span class="k">En çok aksayan gün</span><span class="v">'+weak.name+' · aktiflik %'+Math.round(weak.rate*100)+'</span></div>'}
function v24Weekly(){const c=v2RangeAgg(7,0),p=v2RangeAgg(7,7),sub=v2SubjectRange(7)[0],risk=v2RiskList(1)[0],wr=v22WrongWindow(7,0),ex=(S.denemeler||[]).filter(d=>d.type!=='BRANS'&&d.date>=addDaysKey(todayKey(),-6)),good=[],att=[],next=[];if(c.min>=p.min)good.push('Çalışma: '+fmtHM(c.min)+' · '+v2DeltaText(c.min,p.min));else att.push('Çalışma: '+fmtHM(c.min)+' · '+v2DeltaText(c.min,p.min));if(c.q>=p.q)good.push('Soru: '+c.q+' · '+v2DeltaText(c.q,p.q));else att.push('Soru: '+c.q+' · '+v2DeltaText(c.q,p.q));if(sub)good.push('En çok çalışılan ders: '+sub.name+' · '+fmtHM(sub.min));if(ex.length)good.push(ex.length+' genel deneme · ort. '+r2(v24Mean(ex.map(x=>x.totalNet)))+' net');if(wr.topics[0])att.push('Yanlışlarda öne çıkan: '+wr.topics[0].subject+' · '+wr.topics[0].topic+' · '+wr.topics[0].sum);if(risk)next.push('Öncelik: '+risk.subj+' · '+risk.topic+' ('+risk.reasons.join(', ')+')');else next.push('Yeni hafta için tek bir ana hedef seç.');return {good,att,next}}
function v24RenderWeekly(){const w=el('v24WeeklyReport');if(!w)return;const r=v24Weekly(),b=(t,a)=>'<div class="v24-report"><b>'+t+'</b><div>'+((a.length?a:['Belirgin sinyal yok']).map(x=>'• '+esc(x)).join('<br>'))+'</div></div>';w.innerHTML=b('Gelişen / güçlü',r.good)+b('Dikkat',r.att)+b('Gelecek hafta',r.next)+'<p class="v24-note">Rapor yalnız kayıtlı veriyi bilir; çalışma kalitesi gibi kaydedilmeyen etkenleri ölçmez.</p>'}
function v24Records(){const keys=[...new Set([...Object.keys(S.pomoMin||{}),...Object.keys(S.solved||{})])].filter(k=>/^\d{4}-\d{2}-\d{2}$/.test(k));let bm={k:'',v:0},bq={k:'',v:0},bw={k:'',v:0};keys.forEach(k=>{const m=+S.pomoMin[k]||0,q=+S.solved[k]||0;if(m>bm.v)bm={k,v:m};if(q>bq.v)bq={k,v:q};let t=0;for(let i=0;i<7;i++)t+=+S.pomoMin[addDaysKey(k,-i)]||0;if(t>bw.v)bw={k,v:t}});const exams={};['TYT','AYT','YDT','BRANS'].forEach(t=>{const a=(S.denemeler||[]).filter(d=>d.type===t).sort((x,y)=>(+y.totalNet||0)-(+x.totalNet||0));if(a[0])exams[t]=a[0]});return {bm,bq,bw,exams}}
function v24RenderRecords(){const w=el('v24Records');if(!w)return;const r=v24Records(),fmt=k=>k?parseKey(k).toLocaleDateString('tr-TR',{day:'numeric',month:'short'}):'—',rows=[];if(r.bm.v)rows.push(['En uzun çalışma günü',fmtHM(r.bm.v)+' · '+fmt(r.bm.k)]);if(r.bq.v)rows.push(['En çok soru',r.bq.v+' · '+fmt(r.bq.k)]);if(r.bw.v)rows.push(['En yüksek 7 günlük çalışma',fmtHM(r.bw.v)]);Object.keys(r.exams).forEach(t=>rows.push(['En iyi '+t+' neti',r.exams[t].totalNet+' · '+fmt(r.exams[t].date)]));w.innerHTML=rows.length?rows.map(x=>'<div class="v24-record"><span>'+esc(x[0])+'</span><strong>'+esc(String(x[1]))+'</strong></div>').join(''):'<div class="empty">Rekorlar kayıtlarla oluşur.</div>'}
function renderV24Progress(){v24RenderConsistency();v24RenderWeekly();v24RenderRecords()}
const __v24Exam=renderV22ExamAnalysis;renderV22ExamAnalysis=function(){const r=__v24Exam();try{renderV24Exam()}catch(e){infraError('v24-exam',e)}return r};
const __v24Wrong=v22RenderWrongHealth;v22RenderWrongHealth=function(){const r=__v24Wrong();try{renderV24Verim()}catch(e){infraError('v24-verim',e)}return r};
const __v24Progress=renderProgress;renderProgress=function(){const r=__v24Progress();try{renderV24Progress()}catch(e){infraError('v24-progress',e)}return r};
const __v24Tab=setAnaTab;setAnaTab=function(t){const r=__v24Tab(t);try{if(t==='trend'||t==='ders')renderV24Exam();if(t==='verim')renderV24Verim()}catch(e){infraError('v24-tab',e)}return r};
const __v24Theme=applyTheme;applyTheme=function(){const r=__v24Theme();setTimeout(()=>{try{v24DrawTrend()}catch(e){}},80);return r};
window.addEventListener('resize',()=>{try{if(el('deneme')?.classList.contains('active'))perfRAF('v24chart',v24DrawTrend)}catch(e){}},{passive:true});
function runV24SelfTest(){const checks=[],add=(n,o)=>checks.push([n,!!o]),keep=S,kt=denemeType,kw=v24ExamWindow;try{const t=normalize(JSON.parse(JSON.stringify(DEF))),T=todayKey();S=t;denemeType='TYT';v24ExamWindow=10;t.targetNet=90;for(let i=0;i<10;i++){const d=addDaysKey(T,-(54-i*6));t.denemeler.push({id:2400+i,type:'TYT',name:'V24 '+i,date:d,dur:150+i,totalNet:58+i*2,subjectResults:[{name:'Türkçe',d:25,y:5,b:10,net:23.75+i*.5,cap:40},{name:'Temel Matematik',d:15+i,y:8,b:17-i,net:13+i,cap:40}],refl:{time:i%3?'yetti':'zor'}})}for(let i=0;i<45;i++){const k=addDaysKey(T,-i);t.pomoMin[k]=60+(i%5)*10;t.solved[k]=30+(i%7)*5;t.solvedTopic[k]={'TYT|Matematik|Problemler':15,'TYT|Türkçe|Paragraf':12};t.pomoSubj[k]={Matematik:35,Türkçe:25}}t.wrongLog=[{id:1,date:addDaysKey(T,-4),subject:'Matematik',topic:'Problemler',n:4,kind:'dikkat'},{id:2,date:addDaysKey(T,-10),subject:'Türkçe',topic:'Paragraf',n:2,kind:'sure'}];perfInvalidateState();add('version',APP_VERSION==='3.2.5'&&V24_VERSION==='2.4.0'&&DATA_SCHEMA===21);add('trend',v24Model('TYT',10).slopeWeek>0);add('subject',v24SubjectGrowth().length===2);add('corr',v24Corr([1,2,3,4],[2,4,6,8])>.99);add('eff',v24QuestionRows(30).some(x=>x.q&&x.m));add('support',v24Support().score>40);add('records',v24Records().bm.v>0);add('html',!!el('v24TrendChart')&&!!el('v24TopicRisk')&&!!el('v24WeeklyReport'));renderV24Exam();renderV24Verim();renderV24Progress();add('rendered',el('v24TrendStats').textContent.includes('Ortalama')&&el('v24WrongCauses').textContent.includes('Bilgi eksiği')&&el('v24WeeklyReport').textContent.includes('Gelecek hafta'))}catch(e){checks.push(['exception',false]);try{infraError('v24-selftest',e)}catch(x){}}finally{S=keep;denemeType=kt;v24ExamWindow=kw;perfInvalidateState();try{renderAll()}catch(e){}}const ok=checks.every(x=>x[1]);document.documentElement.setAttribute('data-v24-selftest',ok?'ok':'fail');let o=el('v24SelfTestResult');if(!o){o=document.createElement('pre');o.id='v24SelfTestResult';o.hidden=true;document.body.appendChild(o)}o.textContent=(ok?'YKS_V24_SELFTEST_OK':'YKS_V24_SELFTEST_FAIL')+' '+checks.map(x=>x[0]+':'+(x[1]?'ok':'fail')).join(',');return {ok,checks}}
const __v24Builtin=runBuiltInSelfTest;runBuiltInSelfTest=function(){__v24Builtin();const r=runV24SelfTest();if(!r.ok){document.documentElement.setAttribute('data-selftest','fail');const o=el('selfTestResult');if(o)o.textContent='YKS_SELFTEST_FAIL'}};


/* ==================================================================
   YKS DEFTERİM v2.5.0 — BUGÜN 2.0
   Ana ekranı "şimdi ne yapacağım?" odaklı bir günlük kontrol merkezine
   dönüştürür. Mevcut plan, tekrar ve odak kayıtlarını kullanır.
   ================================================================== */
const V25_VERSION="2.5.0";
let v25LastFocus=null;
function v25PlanToday(){
  const now=new Date(),d=dowOf(now),wk=keyOf(mondayOf(now)),w=getWeek(wk,false),items=[];
  if(w){["r","s"].forEach(blk=>(w[blk]||[]).forEach((row,i)=>{const txt=String((row||[])[d]||"").trim();if(!txt)return;const cid=blk+"-"+i+"-"+d,lbl=blk==="r"?(S.rowLabels.r[i]||"Rutin"):(S.rowLabels.s[i]||"Görev");items.push({wk,blk,i,d,cid,txt,lbl,done:!!w.dn[cid]});}));}
  const done=items.filter(x=>x.done).length;return {wk,d,w,items,filled:items.length,done,pct:items.length?Math.round(done/items.length*100):0,next:items.find(x=>!x.done)||null,dayDone:!!(w&&w.done&&w.done[d])};
}
function v25TaskMeta(item){
  if(!item)return {subj:"",topic:""};
  try{const c=cellTopic(item.txt);if(c)return {subj:c.subj,topic:c.topic};}catch(e){}
  const txt=String(item.txt||""),lbl=String(item.lbl||"");
  let subj=SUBJ_NAMES.find(n=>n===lbl)||SUBJ_NAMES.find(n=>txt===n||txt.startsWith(n+" ")||txt.startsWith(n+" · "))||"";
  if(!subj){const low=(lbl+" "+txt).toLocaleLowerCase("tr-TR");subj=SUBJ_NAMES.find(n=>low.includes(n.toLocaleLowerCase("tr-TR")))||"";}
  let topic="";const sb=ALL_SUBJECTS.find(x=>x.name===subj);if(sb){const low=txt.toLocaleLowerCase("tr-TR");topic=sb.topics.find(t=>low.includes(t.toLocaleLowerCase("tr-TR")))||"";}
  return {subj,topic};
}
function v25UniqueReviews(){const out=[],seen=new Set();for(const r of reviewQueue()){if(seen.has(r.key))continue;seen.add(r.key);out.push(r);}return out;}
function v25FocusEvents(){
  const k=todayKey(),out=[];
  (S.sessions[k]||[]).filter(x=>x&&x.type==="work"&&(+x.m||0)>0).forEach(x=>out.push({at:+x.t||0,end:(+x.t||0)+(+x.m||0)*60000,min:+x.m||0,subj:x.subj||"Ders",topic:x.topic||"",source:"session"}));
  (S.swHistory[k]||[]).filter(x=>x&&(+x.ms||0)>0).forEach(x=>{const at=+x.at||Math.max(0,(+x.end||Date.now())-(+x.ms||0)),min=Math.max(.1,(+x.ms||0)/60000);const dup=out.some(y=>y.subj===(x.subj||"Ders")&&Math.abs((y.at||0)-at)<120000&&Math.abs(y.min-min)<2);if(!dup)out.push({at,end:+x.end||at+(+x.ms||0),min,subj:x.subj||"Ders",topic:x.topic||"",source:"sw"});});
  return out.filter(x=>x.at>0).sort((a,b)=>a.at-b.at);
}
function v25LatestFocus(){const a=v25FocusEvents();return a.length?a[a.length-1]:null;}
function v25StartTask(){
  const p=v25PlanToday(),item=p.next;if(!item){toast(p.filled?"Bugünkü program tamamlandı ✓":"Bugün için program görevi yok");return false;}
  if(sw().run){go("pomo");setFocusMode("sw");toast("Kronometre zaten çalışıyor");return true;}
  const m=v25TaskMeta(item);if(m.subj)setPomoSubject(m.subj);pomoTopic=m.topic||"";pomoTask=item.cid;setFocusMode("sw");go("pomo");swStart();toast("Kronometre başladı · "+(m.subj||item.lbl));return true;
}
function v25ContinueLast(){
  const x=v25LastFocus||v25LatestFocus();if(!x){toast("Devam edilecek çalışma yok");return false;}if(sw().run){go("pomo");setFocusMode("sw");return true;}
  if(x.subj&&SUBJ_NAMES.includes(x.subj))setPomoSubject(x.subj);pomoTopic=x.topic||"";pomoTask="";setFocusMode("sw");go("pomo");swStart();toast("Devam ediyor · "+(x.subj||"Ders"));return true;
}
function v25DoneNext(){const p=v25PlanToday();if(!p.next)return false;toggleCellDone(p.next.wk,p.next.cid);return true;}
function v25TomorrowNext(){const p=v25PlanToday();if(!p.next)return false;return movePlanCellTomorrow(p.next.wk,p.next.blk,p.next.i,p.next.d);}
function v25RenderSummary(){
  const k=todayKey(),q=+S.solved[k]||0,qg=Math.max(0,+S.target||0),m=+S.pomoMin[k]||0,mg=Math.max(0,+S.focus?.goalMin||0),p=v25PlanToday(),rq=v25UniqueReviews();
  el("todayHubQ").textContent=qg?q+" / "+qg:String(q);el("todayHubQSub").textContent=qg?(q>=qg?"hedef tamam":Math.max(0,qg-q)+" kaldı"):"hedef yok";
  el("todayHubMin").textContent=mg?m+" / "+mg+" dk":m+" dk";el("todayHubMinSub").textContent=mg?(m>=mg?"hedef tamam":fmtHM(Math.max(0,mg-m))+" kaldı"):"odak hedefi yok";
  el("todayHubPlan").textContent=p.filled?p.pct+"%":"—";el("todayHubPlanSub").textContent=p.filled?p.done+" / "+p.filled+" görev":"plan yok";
  el("todayHubReview").textContent=String(rq.length);el("todayHubReviewSub").textContent=rq.length?"bekleyen":"temiz";
  const bits=[];if(qg&&q<qg)bits.push("<b>"+(qg-q)+" soru</b>");if(mg&&m<mg)bits.push("<b>"+fmtHM(mg-m)+" odak</b>");if(p.filled&&p.done<p.filled)bits.push("<b>"+(p.filled-p.done)+" görev</b>");if(rq.length)bits.push("<b>"+rq.length+" tekrar</b>");
  el("todayRemaining").innerHTML=bits.length?"Bugünü kapatmak için kalan: "+bits.join(" · "):"<b>Bugünkü kayıtlı hedeflerin tamamlandı.</b>";
  const badge=el("todayDoneBadge");if(p.dayDone){badge.style.display="inline-flex";badge.textContent="Bugün tamamlandı ✓";}else if(p.filled&&p.done===p.filled){badge.style.display="inline-flex";badge.textContent="Program tamam ✓";}else badge.style.display="none";
}
function v25RenderNext(){
  const w=el("todayNext"),p=v25PlanToday();if(!w)return;if(!p.filled){w.className="today-next";w.innerHTML='<div class="next-eyebrow">Sıradaki görev</div><div class="next-title">Bugün için program yok</div><div class="next-meta">Program sekmesinde bugünün satırlarını kendin doldurabilirsin.</div><div class="next-actions"><button class="btn green tiny" onclick="go(\'program\')">Programı aç</button></div>';return;}
  if(!p.next){w.className="today-next done-all";w.innerHTML='<div class="next-eyebrow">Program</div><div class="next-title">Bugünün tüm görevleri tamamlandı ✓</div><div class="next-meta">İstersen günü tamamlandı olarak işaretleyebilirsin.</div>';return;}
  const m=v25TaskMeta(p.next),sub=m.subj||p.next.lbl;w.className="today-next";w.innerHTML='<div class="next-eyebrow">Sıradaki görev</div><div class="next-title">'+esc(p.next.txt)+'</div><div class="next-meta">'+esc(sub)+(m.topic?' · '+esc(m.topic):'')+'</div><div class="next-actions"><button class="btn green tiny" onclick="v25StartTask()">▶ Kronometreyi başlat</button><button class="btn ghost tiny" onclick="v25DoneNext()">Tamamlandı</button><button class="btn ghost tiny" onclick="v25TomorrowNext()">→ Yarına</button></div>';
}
function v25RenderReviews(){const w=el("todayReviews"),wrap=el("todayReviewWrap");if(!w||!wrap)return;const a=v25UniqueReviews();if(!a.length){w.innerHTML='<div class="today-review-empty">Bugün bekleyen 3–7–21 tekrarı yok ✓</div>';return;}w.innerHTML=a.slice(0,3).map(r=>'<div class="today-review-row"><div class="today-review-main"><b>'+esc(r.subj)+' · '+esc(r.topic)+'</b><span>'+r.gap+'. gün tekrarı'+(r.late>0?' · '+r.late+' gün gecikmiş':' · bugün')+'</span></div><button class="btn green tiny" onclick="doReview(\''+String(r.key).replace(/'/g,"\\'")+'\','+r.gi+')">Yaptım</button></div>').join('')+(a.length>3?'<div class="today-review-empty">+'+(a.length-3)+' tekrar daha · Konular bölümünde</div>':'');}
function v25RenderSubjects(){const w=el("todaySubjectDist");if(!w)return;const m=S.pomoSubj[todayKey()]||{},a=Object.keys(m).map(n=>({n,m:+m[n]||0})).filter(x=>x.m>0).sort((x,y)=>y.m-x.m),mx=a[0]?.m||1;if(!a.length){w.innerHTML='<div class="today-review-empty">Ders etiketli çalışma henüz yok.</div>';return;}w.innerHTML=a.slice(0,5).map(x=>'<div class="today-subj-row"><span class="name">'+esc(x.n)+'</span><span class="mins">'+fmtHM(x.m)+'</span><div class="today-subj-bar"><i style="width:'+Math.round(x.m/mx*100)+'%"></i></div></div>').join('');}
function v25RenderLast(){const w=el("todayLastSession"),when=el("todayLastWhen");if(!w||!when)return;const x=v25LatestFocus();v25LastFocus=x;if(!x){when.textContent="—";w.innerHTML='<div class="today-review-empty">Henüz çalışma oturumu yok.</div>';return;}const d=new Date(x.at),hh=d.toLocaleTimeString("tr-TR",{hour:"2-digit",minute:"2-digit"});when.textContent=hh;w.innerHTML='<div class="today-last-title">'+esc(x.subj||"Ders")+(x.topic?' · '+esc(x.topic):'')+'</div><div class="today-last-meta">'+fmtHM(Math.max(1,Math.round(x.min)))+' çalışma</div><div class="today-last-actions"><button class="btn ghost tiny" onclick="v25ContinueLast()">Devam et</button></div>'; }
function v25RenderTimeline(){const w=el("todayTimeline");if(!w)return;const a=v25FocusEvents(),b=[{n:"Sabah",from:0,to:12,m:0,c:0},{n:"Öğlen",from:12,to:18,m:0,c:0},{n:"Akşam",from:18,to:24,m:0,c:0}];a.forEach(x=>{const h=new Date(x.at).getHours(),z=b.find(y=>h>=y.from&&h<y.to)||b[2];z.m+=x.min;z.c++;});w.innerHTML=b.map(x=>'<div class="today-timeblock"><b>'+x.n+'</b><strong>'+fmtHM(Math.round(x.m))+'</strong><small>'+x.c+' odak kaydı</small></div>').join('');}
function setTodayMood(mood){if(!["good","mid","hard"].includes(mood))return false;const k=todayKey();if(!S.dayReview)S.dayReview={};const old=S.dayReview[k]||{};S.dayReview[k]={mood,note:String(old.note||"").slice(0,220),at:Date.now()};save();v25RenderClose();toast("Gün değerlendirmesi kaydedildi");return true;}
function saveTodayReflection(){const k=todayKey(),inp=el("todayReflectionInput"),note=String(inp?.value||"").trim().slice(0,220);if(!S.dayReview)S.dayReview={};const old=S.dayReview[k]||{};if(!note&&!old.mood){delete S.dayReview[k];}else S.dayReview[k]={mood:old.mood||"",note,at:Date.now()};save();v25RenderClose();toast(note?"Günün notu kaydedildi":"Günün notu temizlendi");}
function v25RenderClose(){const box=el("todayClose"),inp=el("todayReflectionInput");if(!box||!inp)return;const h=new Date().getHours(),k=todayKey(),r=(S.dayReview&&S.dayReview[k])||{};box.classList.toggle("soft",h<18&&!v25PlanToday().dayDone);el("todayCloseTitle").textContent=h>=18?"Günü kapat":"Gün sonu değerlendirmesi";el("todayCloseHint").textContent=h>=18?"Bugün nasıldı?":"Akşam istersen doldur";if(document.activeElement!==inp)inp.value=r.note||"";[["good","todayMoodGood"],["mid","todayMoodMid"],["hard","todayMoodHard"]].forEach(([m,id])=>el(id)?.classList.toggle("on",r.mood===m));}
function v25RenderDaypart(){const h=new Date().getHours(),ey=el("todayHubEyebrow"),title=el("todayHubTitle"),kick=document.querySelector("#home .home-kicker");if(h<12){ey.textContent="Sabah planı";title.textContent="Bugüne başla";if(kick)kick.textContent="Önce sıradaki görevi seç; gün geri kalanını sıraya koyar.";}else if(h<18){ey.textContent="Şu ana kadar";title.textContent="Bugünün durumu";if(kick)kick.textContent="Kalan hedefi gör, sıradaki işi bitir, devam et.";}else{ey.textContent="Akşam";title.textContent="Günü kapat";if(kick)kick.textContent="Kalanları tamamla ya da yarına taşı; günü kısa bir notla kapat.";}}
function renderV25Today(){try{v25RenderDaypart();v25RenderSummary();v25RenderNext();v25RenderReviews();v25RenderSubjects();v25RenderLast();v25RenderTimeline();v25RenderClose();}catch(e){infraError("v25-today",e);}}

/* Bugün ekranını değiştiren mevcut işlemlerden sonra merkezi de yenile. */
const __v25RenderHome=renderHome;renderHome=function(){const r=__v25RenderHome();renderV25Today();return r;};
const __v25RenderTodayPlan=renderTodayPlan;renderTodayPlan=function(){const r=__v25RenderTodayPlan();if(el("home")?.classList.contains("active"))renderV25Today();return r;};
const __v25DoReview=doReview;doReview=function(key,gi){const r=__v25DoReview(key,gi);renderV25Today();return r;};
const __v25ToggleCellDone=toggleCellDone;toggleCellDone=function(wk,cid){const r=__v25ToggleCellDone(wk,cid);renderV25Today();return r;};
const __v25MoveTomorrow=movePlanCellTomorrow;movePlanCellTomorrow=function(){const r=__v25MoveTomorrow.apply(this,arguments);renderV25Today();return r;};
const __v25SwPause=swPause;swPause=function(){const r=__v25SwPause.apply(this,arguments);if(el("home")?.classList.contains("active"))renderV25Today();return r;};
const __v25SwReset=swReset;swReset=function(){const r=__v25SwReset.apply(this,arguments);if(el("home")?.classList.contains("active"))renderV25Today();return r;};

function runV25SelfTest(){
  const checks=[],add=(n,o)=>checks.push([n,!!o]),keep=S,keepSub=pomoSubject,keepTopic=typeof pomoTopic!=="undefined"?pomoTopic:"";
  try{
    const t=normalize(JSON.parse(JSON.stringify(DEF))),T=todayKey(),D=dowOf(new Date()),WK=keyOf(mondayOf(new Date()));S=t;t.target=80;t.focus.goalMin=180;t.solved[T]=30;t.pomoMin[T]=65;t.pomoSubj[T]={Matematik:40,Türkçe:25};t.weeks[WK]=blankWeek();t.weeks[WK].s[0][D]="Matematik · Problemler";t.weeks[WK].s[1][D]="Paragraf 25 soru";t.rowLabels.s[1]="Türkçe";t.topics["TYT|Matematik|Problemler"]={st:3,conf:3,ts:addDaysKey(T,-4),rev:[]};t.sessions[T]=[{t:Date.now()-3600000,m:25,subj:"Türkçe",topic:"Paragraf",task:"",type:"work",done:true}];perfInvalidateState();
    add("version",APP_VERSION==="3.2.5"&&V25_VERSION==="2.5.0"&&DATA_SCHEMA===21);const p=v25PlanToday();add("plan",p.filled===2&&p.done===0&&p.next?.txt.includes("Problemler"));add("meta",v25TaskMeta(p.next).subj==="Matematik"&&v25TaskMeta(p.next).topic==="Problemler");add("reviews",v25UniqueReviews().length>=1);add("events",v25FocusEvents().length===1&&v25LatestFocus().subj==="Türkçe");t.dayReview[T]={mood:"good",note:"Verimli bir gündü",at:Date.now()};const dr=normalize(JSON.parse(JSON.stringify(t))).dayReview[T];add("day-review",dr&&dr.mood==="good"&&dr.note.includes("Verimli")&&typeof setTodayMood==="function"&&typeof saveTodayReflection==="function");renderV25Today();add("render",el("todayHubQ").textContent.includes("30")&&el("todayNext").textContent.includes("Problemler")&&el("todayReviews").textContent.includes("Matematik"));
  }catch(e){checks.push(["exception",false]);try{infraError("v25-selftest",e)}catch(x){}}finally{S=keep;pomoSubject=keepSub;try{pomoTopic=keepTopic}catch(e){}perfInvalidateState();try{renderAll()}catch(e){}}
  const ok=checks.every(x=>x[1]);document.documentElement.setAttribute("data-v25-selftest",ok?"ok":"fail");let o=el("v25SelfTestResult");if(!o){o=document.createElement("pre");o.id="v25SelfTestResult";o.hidden=true;document.body.appendChild(o);}o.textContent=(ok?"YKS_V25_SELFTEST_OK":"YKS_V25_SELFTEST_FAIL")+" "+checks.map(x=>x[0]+":"+(x[1]?"ok":"fail")).join(",");return {ok,checks};
}
const __v25Builtin=runBuiltInSelfTest;runBuiltInSelfTest=function(){__v25Builtin();const r=runV25SelfTest();if(!r.ok){document.documentElement.setAttribute("data-selftest","fail");const o=el("selfTestResult");if(o)o.textContent="YKS_SELFTEST_FAIL";}};

function runV26SelfTest(){
  const checks=[],add=(n,o)=>checks.push([n,!!o]),keep=S,kf=v26TopicFilter,ke=examTab,ko=v26TopicOpen;
  try{
    const t=normalize(JSON.parse(JSON.stringify(DEF))),T=todayKey();S=t;examTab="TYT";v26TopicFilter="all";
    const pkey=tkey("TYT","Matematik","Problemler"),fkey=tkey("TYT","Matematik","Fonksiyonlar");
    t.topics[pkey]={st:2,conf:2,ts:null,rev:[]};t.topics[fkey]={st:3,conf:4,ts:addDaysKey(T,-8),rev:[0]};
    t.sessions[T]=[{t:Date.now()-3600000,m:40,subj:"Matematik",topic:"Problemler",type:"work",done:true}];
    t.swHistory[T]=[{id:26001,at:Date.now()-1800000,end:Date.now(),ms:30*60000,subj:"Matematik",topic:"Problemler"}];
    t.wrongLog=[{id:26011,date:addDaysKey(T,-2),subject:"Matematik",topic:"Problemler",n:5,kind:"dikkat",deneme:26099}];
    perfInvalidateState();const c=v26BuildContext(),st=c.study[pkey],wr=c.wrong[pkey],ri=v26RiskInfo(c.priority[pkey]);
    add("version",APP_VERSION==="3.2.5"&&V26_VERSION==="2.6.0"&&DATA_SCHEMA===21);add("study-no-double",st&&st.total===40);add("wrong",wr&&wr.total===5&&wr.examMarked===5);add("review",!!c.due[fkey]);add("risk",ri.score>=30);add("html",!!el("v26TopicOverview")&&!!el("v26TopicAttention")&&!!el("v26TopicModal")&&!!el("tfRisk"));
    renderSubjects();add("overview",el("v26TopicOverview").textContent.includes("TYT ilerleme"));v26TopicFilter="risk";renderSubjects();add("filter",el("subjectList").textContent.includes("Problemler"));openTopicDetail("TYT","Matematik","Problemler");add("detail",el("v26TopicDetail").textContent.includes("40 dk")&&el("v26TopicDetail").textContent.includes("5 yanlış"));closeTopicDetail();
  }catch(e){checks.push(["exception",false]);try{infraError("v26-selftest",e)}catch(x){}}
  finally{S=keep;v26TopicFilter=kf;examTab=ke;v26TopicOpen=ko;perfInvalidateState();try{renderAll()}catch(e){}}
  const ok=checks.every(x=>x[1]);document.documentElement.setAttribute("data-v26-selftest",ok?"ok":"fail");let o=el("v26SelfTestResult");if(!o){o=document.createElement("pre");o.id="v26SelfTestResult";o.hidden=true;document.body.appendChild(o)}o.textContent=(ok?"YKS_V26_SELFTEST_OK":"YKS_V26_SELFTEST_FAIL")+" "+checks.map(x=>x[0]+":"+(x[1]?"ok":"fail")).join(",");return {ok,checks};
}
const __v26Builtin=runBuiltInSelfTest;runBuiltInSelfTest=function(){__v26Builtin();const r=runV26SelfTest();if(!r.ok){document.documentElement.setAttribute("data-selftest","fail");const o=el("selfTestResult");if(o)o.textContent="YKS_SELFTEST_FAIL";}};

/* ---- legacy-block-2 ---- */
const V251_VERSION="2.5.1";
function runV251SelfTest(){
  const checks=[],add=(n,o)=>checks.push([n,!!o]),keep=S,kw=curWeek;
  try{
    const t=normalize(JSON.parse(JSON.stringify(DEF))),T=todayKey(),mon=keyOf(mondayOf(parseKey(T)));S=t;curWeek=parseKey(mon);
    const w=getWeek(mon,true);w.s[0][0]="Matematik Problemler";w.s[1][0]="Türkçe Paragraf";w.dn["s-0-0"]=1;perfInvalidateState();
    add("version",APP_VERSION==="3.2.5"&&V251_VERSION==="2.5.1"&&DATA_SCHEMA===21);
    const st=programWeekStats(w);add("stats",st.filled===2&&st.done===1&&st.days[0].pct===50);
    renderPlan();add("overview",!!el("programWeekOverview")&&el("programWeekOverview").textContent.includes("1/2"));
    const before=clone(S.weeks);const ok=movePlanCellTomorrow(mon,"s",1,0);const next=addDaysKey(mon,1),tw=getWeek(keyOf(mondayOf(parseKey(next))),false);add("move",ok&&tw&&Object.keys(tw.mv||{}).length===1);
    add("move-lock",planMoveLocks instanceof Set);
    S.weeks=before;perfInvalidateState();
    add("copy-next",typeof copyThisWeekToNext==="function");
  }catch(e){checks.push(["exception",false]);try{infraError("v251-selftest",e)}catch(x){}}
  finally{S=keep;curWeek=kw;perfInvalidateState();try{renderAll()}catch(e){}}
  const ok=checks.every(x=>x[1]);document.documentElement.setAttribute("data-v251-selftest",ok?"ok":"fail");let o=el("v251SelfTestResult");if(!o){o=document.createElement("pre");o.id="v251SelfTestResult";o.hidden=true;document.body.appendChild(o)}o.textContent=(ok?"YKS_V251_SELFTEST_OK":"YKS_V251_SELFTEST_FAIL")+" "+checks.map(x=>x[0]+":"+(x[1]?"ok":"fail")).join(",");return {ok,checks};
}
try{const q=new URLSearchParams(location.search).get("selftest");if(q==="v251")setTimeout(runV251SelfTest,180)}catch(e){}
try{const q=new URLSearchParams(location.search).get("selftest");if(q==="v26")setTimeout(runV26SelfTest,180)}catch(e){}

/* ---- legacy-block-3 ---- */
/* ==================================================================
   YKS DEFTERİM v2.8.0 — İLERLEME 2.0
   Analiz "neden?", bu ekran ise "ne kadar yol aldım?" sorusuna odaklanır.
   Ek veri şeması gerektirmez. v2.8'den sonra yapılan tekrarların günü,
   geriye dönük uyumlu revDone alanında tutulur.
   ================================================================== */
const V28_VERSION="2.8.0";
function v28Clamp(v,a,b){v=Number(v)||0;return Math.max(a,Math.min(b,v));}
function v28Bounds(days,offset){days=Math.max(1,days|0);offset=Math.max(0,offset|0);const end=addDaysKey(todayKey(),-offset),start=addDaysKey(end,-days+1);return {start,end};}
function v28In(k,b){return !!k&&k>=b.start&&k<=b.end;}
function v28Range(days,offset){const b=v28Bounds(days,offset),r={min:0,q:0,active:0,days:days,keys:[]};for(let i=0;i<days;i++){const k=addDaysKey(b.end,-i),m=+S.pomoMin[k]||0,q=+S.solved[k]||0;r.min+=m;r.q+=q;if(m||q)r.active++;r.keys.push(k);}return r;}
function v28FmtDelta(cur,prev,fmt){const d=cur-prev,sign=d>0?"+":"";return (fmt?fmt(Math.abs(d)):Math.abs(d))+(d===0?" fark yok":d>0?" daha fazla":" daha az")+(prev?" · "+sign+Math.round(d/Math.max(1,prev)*100)+"%":"");}
function v28TopicSnapshot(days,offset){const b=v28Bounds(days,offset),all=ALL_SUBJECTS.reduce((a,s)=>a+s.topics.length,0);let done=0,points=0,completed=0;ALL_SUBJECTS.forEach(sb=>sb.topics.forEach(tp=>{const t=tget(tkey(sb.exam,sb.name,tp));points+=t.st||0;if(t.st===3)done++;if(t.st===3&&v28In(t.ts,b))completed++;}));return {all,done,points,pct:all?Math.round(points/(all*3)*100):0,completed};}
function v28ExamPeriod(days,offset,type){const b=v28Bounds(days,offset),list=(S.denemeler||[]).filter(d=>d.type!=="BRANS"&&v28In(d.date,b));if(!type&&list.length){const latest=list.slice().sort((a,b)=>(b.date||"").localeCompare(a.date||"")||(b.id||0)-(a.id||0))[0];type=latest.type;}if(type)list.splice(0,list.length,...list.filter(d=>d.type===type));return {type:type||"",list,avg:list.length?r2(list.reduce((a,d)=>a+(+d.totalNet||0),0)/list.length):null};}
function v28LatestGeneral(){return (S.denemeler||[]).filter(d=>d.type!=="BRANS").slice().sort((a,b)=>(b.date||"").localeCompare(a.date||"")||(b.id||0)-(a.id||0))[0]||null;}
function v28ReviewStats(){let due=0,doneDue=0,pending=0,overdue=0,tracked=0,onTime=0,lateDone=0,unknownDone=0,totalDone=0;Object.keys(S.topics||{}).forEach(k=>{const t=S.topics[k];if(!t||t.st!==3||!t.ts)return;REVIEW_GAPS.forEach((gap,gi)=>{const target=addDaysKey(t.ts,gap),isDone=(t.rev||[]).includes(gi);if(isDone){totalDone++;const when=t.revDone&&t.revDone[gi];if(when){tracked++;const delay=diffKeys(target,when);if(delay<=0)onTime++;else lateDone++;}else unknownDone++;}if(target<=todayKey()){due++;if(isDone)doneDue++;else{pending++;if(target<todayKey())overdue++;}}});});return {due,doneDue,pending,overdue,tracked,onTime,lateDone,unknownDone,totalDone,health:due?Math.round(doneDue/due*100):null};}
function v28ProgressScore(days){const cur=v28Range(days,0),prev=v28Range(days,days),tp=v28TopicSnapshot(days,0),rev=v28ReviewStats(),ex=v28ExamPeriod(days,0),pex=v28ExamPeriod(days,days,ex.type),parts=[];let sum=0,max=0;const add=(name,score,weight,why)=>{score=v28Clamp(score,0,100);parts.push({name,score:Math.round(score),weight,why});sum+=score*weight;max+=weight;};add("Düzen",cur.active/days*100,25,cur.active+"/"+days+" aktif gün");let qs;if(S.target>0){const wd=Math.max(1,Math.round(days*Math.max(1,S.workdays||6)/7));qs=cur.q/Math.max(1,S.target*wd)*100;}else if(prev.q||cur.q){qs=50+((cur.q-prev.q)/Math.max(1,prev.q||cur.q))*50;}else qs=0;add("Soru",qs,20,S.target>0?"hedef ritmi":"önceki döneme göre");add("Konu",tp.pct,20,tp.done+"/"+tp.all+" pekişmiş");const rs=rev.due?rev.health:(rev.totalDone?Math.min(100,rev.totalDone/Math.max(1,Object.keys(S.topics||{}).filter(k=>S.topics[k]?.st===3).length*3)*100):0);add("Tekrar",rs,15,rev.due?rev.doneDue+"/"+rev.due+" vadesi gelen":"kayıt birikiyor");let es=0;if(ex.avg!=null&&pex.avg!=null)es=50+(ex.avg-pex.avg)*4;else if(ex.avg!=null)es=50;add("Deneme",es,20,ex.avg==null?"bu dönemde genel deneme yok":ex.type+" ort. "+ex.avg);return {score:max?Math.round(sum/max):0,parts,cur,prev,tp,rev,ex,pex};}
function v28RenderScore(){const w=el("v28Score");if(!w)return;const x=v28ProgressScore(v2ProgressDays),label=x.score>=80?"Güçlü ilerleme":x.score>=60?"İyi yönde":x.score>=40?"Kuruluyor":"Başlangıç / veri birikiyor";w.innerHTML='<div class="v28-score-top"><div class="v28-ring" style="--p:'+x.score+'"><strong>'+x.score+'</strong></div><div class="v28-score-main"><h3>İlerleme Skoru · '+label+'</h3><p>Bu YKS puanı veya başarı tahmini değil; çalışma düzeni, soru ritmi, konu ilerlemesi, tekrarlar ve deneme eğilimini tek takip göstergesinde toplar.</p></div></div><div class="v28-score-parts">'+x.parts.map(p=>'<div class="v28-part" title="'+esc(p.why)+'"><b>'+p.score+'</b><span>'+esc(p.name)+'</span></div>').join('')+'</div>';}
function v28RenderCompare(){const w=el("progressCompare");if(!w)return;const d=v2ProgressDays,a=v28Range(d,0),b=v28Range(d,d),ta=v28TopicSnapshot(d,0),tb=v28TopicSnapshot(d,d),ea=v28ExamPeriod(d,0),eb=v28ExamPeriod(d,d,ea.type),row=(k,v,cls)=>'<div class="dayrow"><span class="k">'+k+'</span><span class="v '+(cls||'')+'">'+v+'</span></div>';let h=row('Çalışma',fmtHM(a.min)+' · '+v28FmtDelta(a.min,b.min,fmtHM),a.min>b.min?'trend-up':a.min<b.min?'trend-down':'trend-flat')+row('Soru',a.q+' · '+v28FmtDelta(a.q,b.q),a.q>b.q?'trend-up':a.q<b.q?'trend-down':'trend-flat')+row('Aktif gün',a.active+' / '+d+' · önceki '+b.active,a.active>b.active?'trend-up':a.active<b.active?'trend-down':'trend-flat')+row('Tamamlanan konu',ta.completed+' · önceki dönemde '+tb.completed,ta.completed>tb.completed?'trend-up':ta.completed<tb.completed?'trend-down':'trend-flat');if(ea.avg!=null)h+=row((ea.type||'Genel')+' deneme ort.',ea.avg+(eb.avg!=null?' · önceki '+eb.avg+' · '+((ea.avg-eb.avg)>0?'+':'')+r2(ea.avg-eb.avg)+' net':' · önceki dönem verisi yok'),eb.avg==null?'':ea.avg>eb.avg?'trend-up':ea.avg<eb.avg?'trend-down':'trend-flat');else h+=row('Deneme','Bu dönemde genel deneme yok','trend-flat');w.innerHTML=h;}
function v28WeekSeries(n){const out=[],thisMon=mondayOf(new Date());for(let z=n-1;z>=0;z--){const m=new Date(thisMon);m.setDate(m.getDate()-z*7);const mk=keyOf(m);let min=0,q=0;for(let i=0;i<7;i++){const k=addDaysKey(mk,i);min+=+S.pomoMin[k]||0;q+=+S.solved[k]||0;}const ex=(S.denemeler||[]).filter(d=>d.type!=="BRANS"&&d.date>=mk&&d.date<=addDaysKey(mk,6));const net=ex.length?r2(ex.reduce((a,d)=>a+(+d.totalNet||0),0)/ex.length):null;out.push({k:mk,min,q,net});}return out;}
function v28Chart(title,arr,key,fmt){const vals=arr.map(x=>x[key]==null?0:+x[key]||0),mx=Math.max(1,...vals),last=arr[arr.length-1],val=last&&last[key]!=null?fmt(last[key]):'—';return '<div class="v28-mini-chart"><div class="v28-mini-title"><b>'+title+'</b><span>'+val+'</span></div><div class="v28-bars">'+arr.map((x,i)=>{const v=x[key],h=v==null?0:Math.max(4,Math.round((+v||0)/mx*88));return '<div class="v28-barcol" title="'+esc(x.k)+' · '+(v==null?'kayıt yok':fmt(v))+'"><i class="v28-bar" style="height:'+h+'%"></i><span class="v28-barlabel">'+(i===arr.length-1?'bu':String(i+1))+'</span></div>';}).join('')+'</div></div>';}
function v28RenderWeekly(){const w=el("v28Weekly");if(!w)return;const a=v28WeekSeries(8);w.innerHTML='<div class="v28-week-grid">'+v28Chart('Çalışma',a,'min',v=>fmtHM(Math.round(v)))+v28Chart('Soru',a,'q',v=>String(Math.round(v)))+v28Chart('Genel net',a,'net',v=>String(r2(v)))+'</div><p class="v24-note">Son 8 hafta gösterilir. Net sütunu, o hafta girilen genel denemelerin ortalamasıdır; deneme olmayan hafta boş kabul edilir.</p>';}
function v28CanonSubject(s){s=String(s||'').trim();if(s==='Temel Matematik')return 'Matematik';return s.replace(/ \(AYT\)$/,'');}
function v28SubjectQuestionMap(days){const b=v28Bounds(days,0),m={};Object.keys(S.solvedTopic||{}).forEach(k=>{if(!v28In(k,b))return;const row=S.solvedTopic[k]||{};Object.keys(row).forEach(tk=>{const p=tk.split('|'),sb=v28CanonSubject(p[1]||'');if(sb)m[sb]=(m[sb]||0)+(+row[tk]||0);});});return m;}
function v28SubjectMinuteMap(days){const b=v28Bounds(days,0),m={};Object.keys(S.pomoSubj||{}).forEach(k=>{if(!v28In(k,b))return;const row=S.pomoSubj[k]||{};Object.keys(row).forEach(sb=>{const c=v28CanonSubject(sb);m[c]=(m[c]||0)+(+row[sb]||0);});});return m;}
function v28SubjectDoneMap(days){const b=v28Bounds(days,0),m={};ALL_SUBJECTS.forEach(sb=>sb.topics.forEach(tp=>{const t=tget(tkey(sb.exam,sb.name,tp));if(t.st===3&&v28In(t.ts,b)){const c=v28CanonSubject(sb.name);m[c]=(m[c]||0)+1;}}));return m;}
function v28SubjectNetMap(days,offset){const b=v28Bounds(days,offset),m={};(S.denemeler||[]).forEach(d=>{if(d.type==='BRANS'||!v28In(d.date,b))return;(d.subjectResults||[]).forEach(sr=>{if(!(sr.cap>0))return;const c=v28CanonSubject(sr.name);(m[c]||(m[c]=[])).push((+sr.net||0)/sr.cap*100);});});const out={};Object.keys(m).forEach(k=>out[k]=m[k].reduce((a,b)=>a+b,0)/m[k].length);return out;}
function v28SubjectRows(days){const mm=v28SubjectMinuteMap(days),qm=v28SubjectQuestionMap(days),dm=v28SubjectDoneMap(days),na=v28SubjectNetMap(days,0),nb=v28SubjectNetMap(days,days),keys=new Set([...Object.keys(mm),...Object.keys(qm),...Object.keys(dm),...Object.keys(na)]);return [...keys].map(name=>({name,min:mm[name]||0,q:qm[name]||0,done:dm[name]||0,net:na[name],prevNet:nb[name],delta:(na[name]!=null&&nb[name]!=null)?Math.round(na[name]-nb[name]):null})).sort((a,b)=>(b.min+b.q/2+b.done*20)-(a.min+a.q/2+a.done*20)).slice(0,14);}
function v28RenderSubjects(){const w=el("v28SubjectProgress");if(!w)return;const rows=v28SubjectRows(v2ProgressDays);if(!rows.length){w.innerHTML='<div class="empty">Ders seçerek çalışma veya konu bazlı soru kaydı yaptıkça ders ilerlemesi oluşur.</div>';return;}w.innerHTML=rows.map(x=>'<div class="v28-subj-row"><div class="v28-subj-head"><b>'+esc(x.name)+'</b><span class="v28-subj-net '+(x.delta>0?'trend-up':x.delta<0?'trend-down':'trend-flat')+'">'+(x.delta==null?'net verisi yetersiz':(x.delta>0?'+':'')+x.delta+' başarı puanı')+'</span></div><div class="v28-subj-meta"><span class="v28-chip">'+fmtHM(x.min)+' çalışma</span><span class="v28-chip">'+x.q+' soru</span><span class="v28-chip">'+x.done+' konu tamamlandı</span>'+(x.net!=null?'<span class="v28-chip">deneme %'+Math.round(x.net)+'</span>':'')+'</div></div>').join('')+'<p class="v24-note">“Başarı puanı”, dersin denemedeki net / soru kapasitesi yüzdesinin önceki aynı dönemle farkıdır. Toplu TYT Fen/Sosyal başlıkları alt derslere uydurulmaz.</p>';}
function v28RenderTopics(){const w=el("v28Topics");if(!w)return;const d=v2ProgressDays,x=v28TopicSnapshot(d,0),p=v28TopicSnapshot(d,d);w.innerHTML='<div class="v28-topic-grid"><div class="v28-metric"><b>'+x.done+' / '+x.all+'</b><span>pekiştirilmiş konu</span></div><div class="v28-metric"><b>%'+x.pct+'</b><span>genel konu ilerlemesi</span></div><div class="v28-metric"><b>'+x.completed+'</b><span>son '+d+' günde tamamlandı</span></div></div><div class="v28-bigbar"><i style="width:'+x.pct+'%"></i></div><div class="dayrow"><span class="k">Dönem hızı</span><span class="v '+(x.completed>p.completed?'trend-up':x.completed<p.completed?'trend-down':'trend-flat')+'">'+x.completed+' konu · önceki '+p.completed+'</span></div><p class="v24-note">Eski tarihteki “çalışılıyor” yüzdesini geriye dönük saklamadığımız için dönem karşılaştırması tamamlanma tarihine göre yapılır; mevcut %'+x.pct+' ise bugünkü durumundur.</p>';}
function v28RenderReviews(){const w=el("v28Reviews");if(!w)return;const r=v28ReviewStats();let h='<div class="v28-topic-grid"><div class="v28-metric"><b>'+(r.health==null?'—':'%'+r.health)+'</b><span>vadesi gelenlerde tamamlanma</span></div><div class="v28-metric"><b>'+r.pending+'</b><span>bekleyen tekrar</span></div><div class="v28-metric"><b>'+r.overdue+'</b><span>gecikmiş tekrar</span></div></div>';if(r.tracked)h+='<div class="dayrow"><span class="k">Zamanı kayıtlı tamamlamalar</span><span class="v">'+r.onTime+'/'+r.tracked+' zamanında · '+r.lateDone+' geç</span></div>';else h+='<div class="dayrow"><span class="k">Zamanında yapma oranı</span><span class="v">v2.8 sonrası oluşacak</span></div>';h+='<div class="dayrow"><span class="k">Toplam tamamlanan 3–7–21 aşaması</span><span class="v">'+r.totalDone+'</span></div><p class="v28-review-note">Eski tamamlanmış tekrarların hangi gün yapıldığı geçmiş veride yok. v2.8.0’dan itibaren “Yaptım” dediğin tarih tutulur; böylece zamanında/geç oranı giderek gerçek veriye dayanır.</p>';w.innerHTML=h;}
function v28GoalBar(label,cur,target,fmt){if(!(target>0))return '<div class="v28-goal"><div class="v28-goal-line"><b>'+label+'</b><span>hedef belirlenmemiş</span></div></div>';const p=Math.min(100,Math.round(cur/target*100));return '<div class="v28-goal"><div class="v28-goal-line"><b>'+label+'</b><span>'+fmt(cur)+' / '+fmt(target)+' · %'+p+'</span></div><div class="v28-bigbar"><i style="width:'+p+'%"></i></div></div>';}
function v28RenderGoals(){const w=el("v28Goals");if(!w)return;const d=v2ProgressDays,a=v28Range(d,0),wd=Math.max(1,Math.round(d*Math.max(1,S.workdays||6)/7)),latest=v28LatestGeneral(),tp=v28TopicSnapshot(d,0);let h=v28GoalBar('Soru hedefi',a.q,(+S.target||0)*wd,v=>String(Math.round(v)))+v28GoalBar('Odak hedefi',a.min,(+(S.focus&&S.focus.goalMin)||0)*wd,v=>fmtHM(Math.round(v)));if(+S.targetNet>0)h+=v28GoalBar((latest?latest.type+' ':'')+'net hedefi',latest?+latest.totalNet||0:0,+S.targetNet,v=>String(r2(v)));h+='<div class="v28-goal"><div class="v28-goal-line"><b>Müfredat ilerlemesi</b><span>%'+tp.pct+' · '+tp.done+'/'+tp.all+' konu pekişmiş</span></div><div class="v28-bigbar"><i style="width:'+tp.pct+'%"></i></div></div><p class="v24-note">Dönem soru/odak hedefi, ayarlardaki haftalık çalışma günü sayısına göre yaklaşık '+wd+' çalışma günü kabul edilerek hesaplanır.</p>';w.innerHTML=h;}
function v28Longest(days){let best=0,cur=0;for(let i=days-1;i>=0;i--){const k=addDaysKey(todayKey(),-i);if((+S.pomoMin[k]||0)||(+S.solved[k]||0)){cur++;best=Math.max(best,cur)}else cur=0;}return best;}
function v28RenderCalendar(){const w=el("v28Calendar");if(!w)return;const d=v2ProgressDays,b=v28Bounds(d,0),vals=[];let max=1,active=0;for(let i=0;i<d;i++){const k=addDaysKey(b.start,i),m=+S.pomoMin[k]||0,q=+S.solved[k]||0,a=m+q*1.2;max=Math.max(max,a);if(a)active++;vals.push({k,m,q,a});}const off=dowOf(parseKey(b.start)),cells=new Array(off).fill('<span></span>');vals.forEach(x=>{const lv=x.a?Math.max(1,Math.min(4,Math.ceil(x.a/max*4))):0;cells.push('<span class="v28-day '+(lv?'l'+lv:'')+(x.k===todayKey()?' today':'')+'" title="'+x.k+' · '+x.m+' dk · '+x.q+' soru">'+parseKey(x.k).getDate()+'</span>')});w.innerHTML='<div class="v28-cal-head"><span>Aktiflik %'+Math.round(active/d*100)+' · '+active+'/'+d+' gün</span><span>En uzun seri '+v28Longest(d)+' gün</span></div><div class="v28-calendar">'+cells.join('')+'</div><p class="v24-note">Renk yoğunluğu o günkü odak süresi ve soru kaydının birlikte oluşturduğu göreli aktiviteyi gösterir.</p>';}
function v28PaceMetric(vals){if(vals.length<4)return {label:'Veri az',pct:0};const a=(vals[0]+vals[1])/2,b=(vals[2]+vals[3])/2,p=a?Math.round((b-a)/Math.max(1,a)*100):(b?100:0);return {label:p>=10?'Hızlanıyor':p<=-10?'Yavaşlıyor':'Sabit',pct:p};}
function v28RenderPace(){const w=el("v28Pace");if(!w)return;const a=v28WeekSeries(4),m=v28PaceMetric(a.map(x=>x.min)),q=v28PaceMetric(a.map(x=>x.q)),nets=a.map(x=>x.net).filter(x=>x!=null),n=v28PaceMetric(nets.length>=4?nets.slice(-4):[]),one=(t,x)=>'<div class="v28-pace"><b>'+t+'</b><strong class="'+(x.pct>0?'trend-up':x.pct<0?'trend-down':'trend-flat')+'">'+x.label+'</strong><span>'+(x.label==='Veri az'?'4 haftalık veri gerekli':(x.pct>0?'+':'')+x.pct+'% · ilk 2 haftaya göre')+'</span></div>';w.innerHTML='<div class="v28-pace-grid">'+one('Çalışma hızı',m)+one('Soru hızı',q)+one('Net hızı',n)+'</div>';}
function v28Lifetime(){const dates=[];Object.keys(S.pomoMin||{}).forEach(k=>/^\d{4}-\d{2}-\d{2}$/.test(k)&&dates.push(k));Object.keys(S.solved||{}).forEach(k=>/^\d{4}-\d{2}-\d{2}$/.test(k)&&dates.push(k));(S.denemeler||[]).forEach(d=>d.date&&dates.push(d.date));Object.values(S.topics||{}).forEach(t=>t&&t.ts&&dates.push(t.ts));const min=Object.values(S.pomoMin||{}).reduce((a,b)=>a+(+b||0),0),q=Object.values(S.solved||{}).reduce((a,b)=>a+(+b||0),0),tp=v28TopicSnapshot(36500,0),rev=v28ReviewStats(),start=dates.length?dates.sort()[0]:'';return {start,min,q,exams:(S.denemeler||[]).length,topics:tp.done,all:tp.all,reviews:rev.totalDone};}
function v28Milestone(value,steps){let done=0,next=null;steps.forEach(s=>{if(value>=s)done=s;else if(next==null)next=s});return {done,next};}
function v28BestTYT(){const a=(S.denemeler||[]).filter(d=>d.type==='TYT').map(d=>+d.totalNet||0);return a.length?Math.max(...a):0;}
function v28RenderMilestones(){const w=el("v28Milestones");if(!w)return;const l=v28Lifetime(),items=[['Soru',l.q,[1000,2500,5000,10000,20000],v=>v+' soru'],['Çalışma',l.min/60,[10,50,100,250,500,1000],v=>v+' saat'],['Konu',l.topics,[10,20,50,100,150,l.all].filter((v,i,a)=>v>0&&a.indexOf(v)===i).sort((a,b)=>a-b),v=>v+' konu'],['TYT net',v28BestTYT(),[50,60,70,80,90,100,110],v=>v+' net']];w.innerHTML=items.map(([name,val,steps,fmt])=>{const m=v28Milestone(val,steps),done=m.done>0,desc=m.next!=null?'Sıradaki: '+fmt(m.next)+' · '+fmt(Math.max(0,m.next-val))+' kaldı':(done?'En yüksek eşik tamamlandı':'Veri bekleniyor');return '<div class="v28-mile '+(done?'done':'')+'"><span class="v28-mile-ic">'+(done?'✓':'○')+'</span><div class="v28-mile-main"><b>'+name+' · '+fmt(Math.round(val*10)/10)+'</b><div>'+desc+(m.done?' · son kilometre taşı '+fmt(m.done):'')+'</div></div></div>';}).join('');}
function v28RenderLifetime(){const w=el("v28Lifetime");if(!w)return;const l=v28Lifetime(),since=l.start?parseKey(l.start).toLocaleDateString('tr-TR',{day:'numeric',month:'long',year:'numeric'}):'Kayıt yok';w.innerHTML='<div class="v28-life-grid"><div class="v28-life"><b>'+fmtHM(l.min)+'</b><span>toplam çalışma</span></div><div class="v28-life"><b>'+l.q+'</b><span>toplam soru</span></div><div class="v28-life"><b>'+l.exams+'</b><span>toplam deneme</span></div><div class="v28-life"><b>'+l.topics+'</b><span>pekiştirilen konu</span></div></div><div class="dayrow" style="margin-top:8px"><span class="k">İlk kayıt</span><span class="v">'+since+'</span></div><div class="dayrow"><span class="k">Tamamlanan tekrar aşaması</span><span class="v">'+l.reviews+'</span></div>';}
function v28MonthWindow(year,month,throughDay){const last=new Date(year,month+1,0).getDate(),d=Math.min(last,throughDay),start=keyOf(new Date(year,month,1)),end=keyOf(new Date(year,month,d));let min=0,q=0,active=0;for(let i=1;i<=d;i++){const k=keyOf(new Date(year,month,i)),m=+S.pomoMin[k]||0,qq=+S.solved[k]||0;min+=m;q+=qq;if(m||qq)active++;}const ex=(S.denemeler||[]).filter(x=>x.type!=='BRANS'&&x.date>=start&&x.date<=end),avg=ex.length?r2(ex.reduce((a,x)=>a+(+x.totalNet||0),0)/ex.length):null;let topics=0;Object.values(S.topics||{}).forEach(t=>{if(t&&t.st===3&&t.ts>=start&&t.ts<=end)topics++;});return {start,end,min,q,active,exams:ex.length,avg,topics,days:d};}
function v28RenderMonth(){const w=el("v28MonthSummary");if(!w)return;const now=new Date(),c=v28MonthWindow(now.getFullYear(),now.getMonth(),now.getDate()),pm=new Date(now.getFullYear(),now.getMonth()-1,1),p=v28MonthWindow(pm.getFullYear(),pm.getMonth(),now.getDate()),rows=[],cmp=(name,a,b,fmt,goodHigh=true)=>{const d=a-b,cls=d===0?'':((d>0)===goodHigh?'trend-up':'trend-down');rows.push('<div class="v28-summary-item"><b>'+name+': </b><span class="'+cls+'">'+fmt(a)+(b||a?' · önceki ayın aynı dönemine göre '+(d>0?'+':d<0?'-':'')+fmt(Math.abs(d)):'')+'</span></div>')};cmp('Çalışma',c.min,p.min,v=>fmtHM(Math.round(v)));cmp('Soru',c.q,p.q,v=>String(Math.round(v)));cmp('Tamamlanan konu',c.topics,p.topics,v=>String(Math.round(v)));if(c.avg!=null)rows.push('<div class="v28-summary-item"><b>Genel deneme: </b>'+c.exams+' adet · ort. '+c.avg+(p.avg!=null?' · önceki '+p.avg+' · '+((c.avg-p.avg)>0?'+':'')+r2(c.avg-p.avg)+' net':'')+'</div>');const sb=v28SubjectMinuteMap(Math.min(31,now.getDate())),best=Object.keys(sb).sort((a,b)=>sb[b]-sb[a])[0];if(best)rows.push('<div class="v28-summary-item"><b>Bu ay en çok çalışılan ders: </b>'+esc(best)+' · '+fmtHM(sb[best])+'</div>');rows.push('<div class="v28-summary-item"><b>Aktif gün: </b>'+c.active+'/'+c.days+' · %'+Math.round(c.active/Math.max(1,c.days)*100)+'</div>');w.innerHTML=rows.join('')+'<p class="v24-note">Karşılaştırma adil olsun diye önceki ayın yalnız bugünkü gün numarasına kadar olan bölümü kullanılır.</p>';}
function renderV28Progress(){v28RenderScore();v28RenderCompare();v28RenderWeekly();v28RenderSubjects();v28RenderTopics();v28RenderReviews();v28RenderGoals();v28RenderCalendar();v28RenderPace();v28RenderMilestones();v28RenderLifetime();v28RenderMonth();}
const __v28Progress=renderProgress;renderProgress=function(){const r=__v28Progress();try{renderV28Progress()}catch(e){infraError('v28-progress',e)}return r;};
const __v28MarkReview=markReview;markReview=function(key,gi){const r=__v28MarkReview(key,gi);try{const t=S.topics[key];if(t){if(!t.revDone||typeof t.revDone!=='object')t.revDone={};if(!t.revDone[gi]){t.revDone[gi]=todayKey();save();}}}catch(e){infraError('v28-review-date',e)}return r;};
function runV28SelfTest(){const checks=[],add=(n,o)=>checks.push([n,!!o]),keep=S,kd=v2ProgressDays;try{const t=normalize(JSON.parse(JSON.stringify(DEF))),T=todayKey();S=t;v2ProgressDays=30;t.target=50;t.focus.goalMin=90;t.targetNet=80;for(let i=0;i<65;i++){const k=addDaysKey(T,-i);t.pomoMin[k]=i<30?80+(i%4)*10:55+(i%3)*10;t.solved[k]=i<30?55+(i%5)*4:35+(i%4)*3;t.pomoSubj[k]={Matematik:45,Türkçe:35};t.solvedTopic[k]={'TYT|Matematik|Problemler':20,'TYT|Türkçe|Paragraf':15};}for(let i=0;i<8;i++){t.denemeler.push({id:2800+i,type:'TYT',name:'P '+i,date:addDaysKey(T,-(56-i*7)),dur:150,totalNet:60+i*3,subjectResults:[{name:'Türkçe',net:25+i*.5,cap:40,d:27,y:8,b:5},{name:'Temel Matematik',net:20+i,cap:40,d:22+i,y:8,b:10-i}]});}const k1=tkey('TYT','Matematik','Problemler'),k2=tkey('TYT','Türkçe','Paragraf');t.topics[k1]={st:3,conf:4,ts:addDaysKey(T,-25),rev:[0,1],revDone:{0:addDaysKey(T,-22),1:addDaysKey(T,-17)}};t.topics[k2]={st:3,conf:4,ts:addDaysKey(T,-10),rev:[0],revDone:{0:addDaysKey(T,-7)}};perfInvalidateState();add('version',APP_VERSION==='3.2.5'&&V28_VERSION==='2.8.0'&&DATA_SCHEMA===21);add('range',v28Range(30,0).min>v28Range(30,30).min);add('score',v28ProgressScore(30).score>0&&v28ProgressScore(30).parts.length===5);add('weeks',v28WeekSeries(8).length===8);add('subjects',v28SubjectRows(30).some(x=>x.name==='Matematik'));add('topics',v28TopicSnapshot(30,0).done===2);add('review-date',v28ReviewStats().tracked>=3&&v28ReviewStats().onTime>=2&&v28ReviewStats().lateDone>=1);add('lifetime',v28Lifetime().q>0&&v28Lifetime().min>0);add('html',!!el('v28Score')&&!!el('v28Weekly')&&!!el('v28Calendar')&&!!el('v28MonthSummary'));renderV28Progress();add('render',el('v28Score').textContent.includes('İlerleme Skoru')&&el('v28Weekly').textContent.includes('Çalışma')&&el('v28Topics').textContent.includes('pekiştirilmiş konu'));}catch(e){checks.push(['exception',false]);try{infraError('v28-selftest',e)}catch(x){}}finally{S=keep;v2ProgressDays=kd;perfInvalidateState();try{renderAll()}catch(e){}}const ok=checks.every(x=>x[1]);document.documentElement.setAttribute('data-v28-selftest',ok?'ok':'fail');let o=el('v28SelfTestResult');if(!o){o=document.createElement('pre');o.id='v28SelfTestResult';o.hidden=true;document.body.appendChild(o)}o.textContent=(ok?'YKS_V28_SELFTEST_OK':'YKS_V28_SELFTEST_FAIL')+' '+checks.map(x=>x[0]+':'+(x[1]?'ok':'fail')).join(',');return {ok,checks};}
const __v28Built=runBuiltInSelfTest;runBuiltInSelfTest=function(){__v28Built();const r=runV28SelfTest();if(!r.ok){document.documentElement.setAttribute('data-selftest','fail');const o=el('selfTestResult');if(o)o.textContent='YKS_SELFTEST_FAIL';}};
try{const q=new URLSearchParams(location.search).get('selftest');if(q==='v28')setTimeout(runV28SelfTest,220)}catch(e){}

/* ---- legacy-block-4 ---- */
/* ==================================================================
   YKS DEFTERİM v2.9.0 — ODAK 2.0
   Süre + çıktı + kesinti + kalite. Mevcut sayaç motorlarını değiştirmez;
   oturum verisini zenginleştirir ve tek merkezde yorumlar.
   ================================================================== */
const V29_VERSION="2.9.0";
let v29PeriodDays=1,v29PomoRuntime={interruptions:0,reasons:{}},v29SwRuntime={interruptions:0,reasons:{}},v29ReviewSession=null,v29PauseSource="pomo";
function v29Goal(){return String(S.focus.sessionGoal||"").slice(0,140)}
function v29GoalQ(){return Math.max(0,Math.min(1000,S.focus.sessionGoalQ|0))}
function v29SetGoal(v){S.focus.sessionGoal=String(v||"").slice(0,140);save();v29RenderSetup()}
function v29SetGoalQ(v){S.focus.sessionGoalQ=Math.max(0,Math.min(1000,parseInt(v,10)||0));save();v29RenderSetup()}
function v29RenderSetup(){const g=el("v29GoalText"),q=el("v29GoalQ");if(g&&document.activeElement!==g)g.value=v29Goal();if(q&&document.activeElement!==q)q.value=v29GoalQ()||"";const line=el("v29SetupLine");if(line){const p=[];if(pomoSubject)p.push(pomoSubject);if(typeof pomoTopic!=="undefined"&&pomoTopic)p.push(pomoTopic);if(v29Goal())p.push(v29Goal());if(v29GoalQ())p.push(v29GoalQ()+" soru");line.textContent=p.length?p.join(" · "):"Ders ve hedef seçersen oturum sonunda verimini daha doğru ölçer."}v29RenderMinimal()}
function v29ResetRuntime(which){const z={interruptions:0,reasons:{}};if(which==="sw")v29SwRuntime=z;else v29PomoRuntime=z}
function v29CurrentRuntime(){return v29PauseSource==="sw"?v29SwRuntime:v29PomoRuntime}
function v29ReasonAdd(kind){const r=v29CurrentRuntime();if(kind!=="break"){r.interruptions++;r.reasons[kind]=(r.reasons[kind]||0)+1}else r.reasons.break=(r.reasons.break||0)+1}
function v29ScoreSession(x){if(!x)return 0;const planned=Math.max(1,x.plannedMin||x.m||1),ratio=Math.min(1,(x.m||0)/planned),dur=Math.round(ratio*45);let out=0;if(x.goalQ>0)out=Math.round(Math.min(1,(x.actualQ||0)/x.goalQ)*25);else out=x.done?20:Math.round(ratio*20);const quality=x.quality?Math.round(x.quality/5*20):10;const pen=Math.min(30,(x.interruptions||0)*8);return Math.max(0,Math.min(100,dur+out+quality-pen+10))}
function v29ScoreClass(n){return n>=80?"good":n>=60?"mid":"bad"}
renderSessions=function(){const w=el("sessionList");if(!w)return;const list=todaySessions().filter(x=>x.type==="work");if(!list.length){w.innerHTML='<div class="empty">Bugün henüz oturum yok.</div>';return}w.innerHTML=list.slice().reverse().map(x=>{const t=new Date(x.t),hh=String(t.getHours()).padStart(2,"0")+":"+String(t.getMinutes()).padStart(2,"0"),sc=x.focusScore?'<span class="v29-focus-score-pill '+v29ScoreClass(x.focusScore)+'">'+x.focusScore+'/100</span>':'';return '<div class="v29-unified-row"><div class="v29-unified-head"><b>'+hh+' · '+esc((x.subj||"—")+(x.topic?' · '+x.topic:''))+' '+sc+'</b><span>'+x.m+' dk'+(x.done?'':' · yarıda')+'</span></div><div class="v29-unified-meta">'+(x.goal?esc(x.goal):'')+(x.actualQ?(x.goal?' · ':'')+x.actualQ+' soru':'')+(x.interruptions?' · '+x.interruptions+' kesinti':'')+(x.note?' · '+esc(x.note):'')+'</div></div>'}).join('')}
function v29AttachSession(x,source,runtime){if(!x)return;x.topic=(typeof pomoTopic!=="undefined"?pomoTopic:"")||x.topic||"";x.goal=v29Goal();x.goalQ=v29GoalQ();x.source=source;x.plannedMin=source==="pomo"?Math.max(1,Math.round(pomoTotal/60)):Math.max(1,x.m||1);x.interruptions=runtime.interruptions|0;x.reasons=Object.assign({},runtime.reasons);x.end=x.end||Date.now();x.focusScore=v29ScoreSession(x)}
function v29LastWorkSession(){const a=todaySessions().filter(x=>x.type==="work");return a[a.length-1]||null}
const __v29RecordSession=recordSession;recordSession=function(done){const before=todaySessions().length,r=__v29RecordSession(done);const list=todaySessions();if(list.length>before){const x=list[list.length-1];v29AttachSession(x,"pomo",v29PomoRuntime);v29ReviewSession=x;save();v29ResetRuntime("pomo")}return r}
const __v29StartPomo=startPomo;startPomo=function(){if(pomoIsWork&&!pomoStartedAt)v29ResetRuntime("pomo");const r=__v29StartPomo();v29RenderAllFocus();return r}
const __v29ResetPomo=resetPomo;resetPomo=function(){const before=todaySessions().length;hidePauseReason();const r=__v29ResetPomo();if(todaySessions().length>before)showSessionNote();v29RenderAllFocus();return r}
const __v29PausePomo=pausePomo;pausePomo=function(){v29PauseSource="pomo";const r=__v29PausePomo();v29RenderAllFocus();return r}
const __v29SetPauseReason=setPauseReason;setPauseReason=function(kind){kind=String(kind||"");const k=todayKey();if(!S.pauseReasons[k])S.pauseReasons[k]={mola:0,dikkat:0,phone:0,attention:0,need:0,other:0,break:0};if(["phone","attention","need","other","break"].includes(kind)){S.pauseReasons[k][kind]=(S.pauseReasons[k][kind]||0)+1;if(kind==="attention")S.pauseReasons[k].dikkat=(S.pauseReasons[k].dikkat||0)+1;if(kind==="break"||kind==="need")S.pauseReasons[k].mola=(S.pauseReasons[k].mola||0)+1;v29ReasonAdd(kind);save();hidePauseReason();renderPauseStats();v29RenderAllFocus();return}return __v29SetPauseReason(kind)}
renderPauseStats=function(){const e=el("pauseStat");if(!e)return;const r=S.pauseReasons[todayKey()]||{};const p=[];if(r.phone)p.push("telefon "+r.phone);if(r.attention)p.push("dikkat "+r.attention);if(r.need)p.push("ihtiyaç "+r.need);if(r.other)p.push("diğer "+r.other);if(r.break)p.push("normal ara "+r.break);if(!p.length){if(r.dikkat)p.push("dikkat "+r.dikkat);if(r.mola)p.push("mola "+r.mola)}e.textContent=p.length?"Bugünkü aralar · "+p.join(" · "):""}
const __v29SwStart=swStart;swStart=function(){if(!sw().run&&!sw().acc)v29ResetRuntime("sw");const r=__v29SwStart();v29RenderAllFocus();return r}
const __v29SwPause=swPause;swPause=function(){v29PauseSource="sw";const was=sw().run,r=__v29SwPause();if(was){showPauseReason();v29RenderAllFocus()}return r}
const __v29SwHistoryAdd=swHistoryAdd;swHistoryAdd=function(ms,subj,start,end){const r=__v29SwHistoryAdd(ms,subj,start,end);try{const k=keyOf(new Date(end||Date.now())),a=S.swHistory[k];if(r&&a&&a.length){a[a.length-1].topic=(typeof pomoTopic!=="undefined"?pomoTopic:"")||""}}catch(e){}return r}
const __v29SwRecord=swRecord;swRecord=function(){const before=todaySessions().length,r=__v29SwRecord();const list=todaySessions();if(list.length>before){const x=list[list.length-1];v29AttachSession(x,"sw",v29SwRuntime);v29ReviewSession=x;save();v29ResetRuntime("sw")}return r}
const __v29SwReset=swReset;swReset=function(){const before=todaySessions().length;hidePauseReason();const r=__v29SwReset();if(todaySessions().length>before){showSessionNote()}v29RenderAllFocus();return r}
function v29SessionReviewTarget(){return v29ReviewSession||v29LastWorkSession()}
showSessionNote=function(){const b=el("noteBox");if(!b)return;const x=v29SessionReviewTarget();b.style.display="block";const i=el("noteInput"),q=el("v29ActualQ"),z=el("v29Quality");if(i)i.value=x?.note||"";if(q)q.value=x?.actualQ||"";if(z)z.value=String(x?.quality||0);v29RenderFinishPreview()}
function v29RenderFinishPreview(){const x=v29SessionReviewTarget(),e=el("v29FinishPreview");if(!e||!x)return;const q=Math.max(0,parseInt((el("v29ActualQ")||{}).value,10)||0),quality=Math.max(0,parseInt((el("v29Quality")||{}).value,10)||0),tmp=Object.assign({},x,{actualQ:q,quality});const sc=v29ScoreSession(tmp);e.innerHTML='Tahmini odak puanı: <b class="v29-score '+v29ScoreClass(sc)+'">'+sc+'/100</b>'+(x.goalQ?' · hedef '+x.goalQ+' soru':'')}
function v29CreditQuestions(x){if(!x||x.qCredited||!(x.actualQ>0))return;const k=todayKey();S.solved[k]=(S.solved[k]||0)+x.actualQ;if(x.topic&&typeof topicKeyOf==="function"){const tk=topicKeyOf(x.subj,x.topic);if(tk){if(!S.solvedTopic[k])S.solvedTopic[k]={};S.solvedTopic[k][tk]=(S.solvedTopic[k][tk]||0)+x.actualQ}}x.qCredited=true}
saveSessionNote=function(){const x=v29SessionReviewTarget();if(!x){hideSessionNote();return}x.note=String((el("noteInput")||{}).value||"").trim().slice(0,140);x.actualQ=Math.max(0,Math.min(1000,parseInt((el("v29ActualQ")||{}).value,10)||0));x.quality=Math.max(0,Math.min(5,parseInt((el("v29Quality")||{}).value,10)||0));x.focusScore=v29ScoreSession(x);v29CreditQuestions(x);save();v29ReviewSession=null;hideSessionNote();perfInvalidateState();renderSessions();if(typeof renderHome==="function")renderHome();if(typeof renderProgress==="function"&&el("progress")?.classList.contains("active"))renderProgress();v29RenderAllFocus();toast("Oturum kaydedildi · odak "+x.focusScore+"/100")}
function v29SkipSessionReview(){const x=v29SessionReviewTarget();if(x){x.focusScore=v29ScoreSession(x);save()}v29ReviewSession=null;hideSessionNote();v29RenderAllFocus()}
try{el("v29ActualQ")?.addEventListener("input",v29RenderFinishPreview);el("v29Quality")?.addEventListener("change",v29RenderFinishPreview)}catch(e){}
function v29SessionList(days){const start=addDaysKey(todayKey(),-(days-1)),out=[];Object.keys(S.sessions||{}).filter(k=>k>=start&&k<=todayKey()).sort().forEach(k=>(S.sessions[k]||[]).forEach((x,i)=>{if(x&&x.type==="work"&&x.m>0)out.push(Object.assign({day:k,_i:i},x))}));return out}
function v29DashboardData(){const list=v29SessionList(1),mins=S.pomoMin[todayKey()]||0,longest=list.reduce((a,x)=>Math.max(a,x.m||0),0),ints=list.reduce((a,x)=>a+(x.interruptions||0),0)+(v29CurrentRuntime().interruptions||0),goal=Math.max(0,S.focus.goalMin||0),remain=Math.max(0,goal-mins);return {list,mins,longest,ints,goal,remain}}
function v29RenderDashboard(){const w=el("v29Dashboard");if(!w)return;const d=v29DashboardData(),avg=d.list.filter(x=>x.focusScore>0),score=avg.length?Math.round(avg.reduce((a,x)=>a+x.focusScore,0)/avg.length):0;const items=[[fmtHM(d.mins),"bugün odak"],[d.list.length,"oturum"],[d.longest?d.longest+" dk":"—","en uzun"],[d.ints,"kesinti"],[d.goal?(d.remain?fmtHM(d.remain):"✓"):"—",d.goal?"hedefe kalan":"günlük hedef"]];w.innerHTML=items.map(x=>'<div class="v29-dash"><b>'+x[0]+'</b><span>'+x[1]+'</span></div>').join('')+(score?'<div class="v29-dash"><b class="v29-score '+v29ScoreClass(score)+'">'+score+'</b><span>ort. odak puanı</span></div>':'')}
function v29SessionLabel(x){return (x.subj||"Ders")+(x.topic?" · "+x.topic:"")}
function v29RenderTimeline(){const w=el("v29Timeline");if(!w)return;const a=v29SessionList(1).sort((x,y)=>(x.t||0)-(y.t||0));if(!a.length){w.innerHTML='<div class="empty">Bugün oturum yaptıkça saat saat akış burada oluşur.</div>';return}w.innerHTML='<div class="v29-timeline">'+a.map(x=>{const st=new Date(x.t||0),en=new Date((x.end||((x.t||0)+(x.m||0)*60000))),hh=st.toLocaleTimeString("tr-TR",{hour:"2-digit",minute:"2-digit"}),eh=en.toLocaleTimeString("tr-TR",{hour:"2-digit",minute:"2-digit"});return '<div class="v29-tl-row"><span class="v29-tl-time">'+hh+'</span><div class="v29-tl-main"><b>'+esc(v29SessionLabel(x))+'</b><span>'+esc(x.goal||"")+(x.actualQ?' · '+x.actualQ+' soru':'')+'</span></div><span class="v29-tl-dur">'+x.m+' dk<br>'+eh+'</span></div>'}).join('')+'</div>'}
function v29RenderUnified(){const w=el("v29UnifiedHistory");if(!w)return;const a=v29SessionList(30).sort((x,y)=>(y.t||0)-(x.t||0)).slice(0,40);if(!a.length){w.innerHTML='<div class="empty">Pomodoro ve kronometre oturumların tek listede burada görünür.</div>';return}w.innerHTML=a.map(x=>{const dt=parseKey(x.day).toLocaleDateString("tr-TR",{day:"numeric",month:"short"}),mode=x.source==="sw"?'Kronometre':x.source==="pomo"?'Pomodoro':'Oturum',sc=x.focusScore?'<span class="v29-focus-score-pill '+v29ScoreClass(x.focusScore)+'">'+x.focusScore+'/100</span>':'';return '<div class="v29-unified-row"><div class="v29-unified-head"><b>'+esc(v29SessionLabel(x))+' '+sc+'</b><span>'+dt+' · '+x.m+' dk</span></div><div class="v29-unified-meta">'+mode+(x.goal?' · '+esc(x.goal):'')+(x.actualQ?' · '+x.actualQ+' soru':'')+(x.interruptions?' · '+x.interruptions+' kesinti':'')+(x.note?' · '+esc(x.note):'')+'</div></div>'}).join('')}
function v29SetPeriod(n){v29PeriodDays=[1,7,30].includes(+n)?+n:1;[1,7,30].forEach(x=>el("v29Pd"+x)?.classList.toggle("on",x===v29PeriodDays));v29RenderSubjectTopic()}
function v29PeriodSessions(){let start=todayKey();if(v29PeriodDays===7)start=keyOf(mondayOf(new Date()));else if(v29PeriodDays===30){const d=new Date();start=keyOf(new Date(d.getFullYear(),d.getMonth(),1))}const out=[];Object.keys(S.sessions||{}).filter(k=>k>=start&&k<=todayKey()).sort().forEach(k=>(S.sessions[k]||[]).forEach((x,i)=>{if(x&&x.type==="work"&&x.m>0)out.push(Object.assign({day:k,_i:i},x))}));return out}
function v29RenderSubjectTopic(){const w=el("v29SubjectTopic");if(!w)return;const a=v29PeriodSessions(),sub={},top={};a.forEach(x=>{sub[x.subj||"Ders"]=(sub[x.subj||"Ders"]||0)+(x.m||0);if(x.topic)top[(x.subj||"Ders")+" · "+x.topic]=(top[(x.subj||"Ders")+" · "+x.topic]||0)+(x.m||0)});const rows=(m)=>Object.keys(m).sort((a,b)=>m[b]-m[a]).slice(0,10).map(k=>'<div class="v29-dist-row"><b>'+esc(k)+'</b><span>'+fmtHM(m[k])+'</span></div>').join('');if(!Object.keys(sub).length){w.innerHTML='<div class="empty">Oturumlarda ders seçtikçe süre dağılımı burada oluşur.</div>';return}w.innerHTML='<div class="v29-dist-group"><div class="v29-dist-title">Dersler</div>'+rows(sub)+'</div>'+(Object.keys(top).length?'<div class="v29-dist-group"><div class="v29-dist-title">Konular</div>'+rows(top)+'</div>':'<p class="hint">Konu seçtikçe konu bazlı süre de görünür.</p>')}
function v29HourStats(){const m={};v29SessionList(90).forEach(x=>{if(!x.t)return;const h=new Date(x.t).getHours(),k=String(h).padStart(2,'0')+':00–'+String((h+1)%24).padStart(2,'0')+':00',z=m[k]||(m[k]={n:0,score:0,min:0});z.n++;z.min+=x.m||0;z.score+=x.focusScore||0});return Object.keys(m).map(k=>({k,...m[k],avg:m[k].n?Math.round(m[k].score/m[k].n):0})).filter(x=>x.n>=2&&x.avg>0).sort((a,b)=>b.avg-a.avg)}
function v29RenderHours(){const w=el("v29ProductiveHours");if(!w)return;const a=v29HourStats();if(!a.length){w.innerHTML='<div class="empty">En verimli saatini bulmak için odak puanı olan en az birkaç oturum gerekli.</div>';return}w.innerHTML='<div class="v29-hour-grid">'+a.slice(0,3).map((x,i)=>'<div class="v29-mini"><b>'+x.k+'</b><span>'+(i===0?'En verimli · ':'')+x.n+' oturum · ort. '+x.avg+'/100</span></div>').join('')+'</div><p class="v29-day-note">Saat karşılaştırması yalnız en az 2 kayıt bulunan saat aralıklarını kullanır.</p>'}
function v29LengthBuckets(){const bs={short:{name:'15–34 dk',n:0,s:0},mid:{name:'35–54 dk',n:0,s:0},long:{name:'55+ dk',n:0,s:0}};v29SessionList(90).forEach(x=>{if(!x.focusScore)return;const b=(x.plannedMin||x.m)<35?bs.short:(x.plannedMin||x.m)<55?bs.mid:bs.long;b.n++;b.s+=x.focusScore});return Object.values(bs).map(x=>({...x,avg:x.n?Math.round(x.s/x.n):0}))}
function v29RenderLength(){const w=el("v29LengthCompare");if(!w)return;const a=v29LengthBuckets(),valid=a.filter(x=>x.n>=2);w.innerHTML='<div class="v29-length-grid">'+a.map(x=>'<div class="v29-mini"><b>'+(x.avg?x.avg+'/100':'—')+'</b><span>'+x.name+' · '+x.n+' oturum</span></div>').join('')+'</div><p class="v29-day-note">'+(valid.length>=2?'En yüksek ortalama, sende daha verimli görünen süre aralığıdır. Sebep-sonuç değildir.':'Karşılaştırma için en az iki farklı süre grubunda 2’şer oturum gerekli.')+'</p>'}
function v29FocusGoalStreak(){const goal=Math.max(0,S.focus.goalMin||0);if(!goal)return 0;let n=0,k=todayKey();if((S.pomoMin[k]||0)<goal)k=addDaysKey(k,-1);while((S.pomoMin[k]||0)>=goal&&n<1000){n++;k=addDaysKey(k,-1)}return n}
function v29UninterruptedStreak(){const a=v29SessionList(30).sort((x,y)=>(y.t||0)-(x.t||0));let n=0;for(const x of a){if((x.interruptions||0)>0)break;n++}return n}
function v29RenderStreaks(){const w=el("v29Streaks");if(!w)return;const good=v29SessionList(30).filter(x=>x.focusScore>=80).length;w.innerHTML='<div class="v29-streak-grid"><div class="v29-mini"><b>'+v29UninterruptedStreak()+'</b><span>son kesintisiz oturum serisi</span></div><div class="v29-mini"><b>'+v29FocusGoalStreak()+'</b><span>günlük odak hedefi serisi</span></div><div class="v29-mini"><b>'+good+'</b><span>son 30 günde 80+ odak puanı</span></div></div>'}
function v29RenderDaySummary(){const w=el("v29DaySummary");if(!w)return;const d=v29DashboardData(),a=d.list,questions=a.reduce((z,x)=>z+(x.actualQ||0),0),scores=a.filter(x=>x.focusScore>0),avg=scores.length?Math.round(scores.reduce((z,x)=>z+x.focusScore,0)/scores.length):0,top={};a.forEach(x=>top[x.subj||'Ders']=(top[x.subj||'Ders']||0)+(x.m||0));const best=Object.keys(top).sort((x,y)=>top[y]-top[x])[0]||'';w.innerHTML='<div class="v29-day-summary"><div class="v29-mini"><b>'+fmtHM(d.mins)+'</b><span>odak</span></div><div class="v29-mini"><b>'+a.length+'</b><span>oturum</span></div><div class="v29-mini"><b>'+questions+'</b><span>oturumlarda soru</span></div><div class="v29-mini"><b class="v29-score '+(avg?v29ScoreClass(avg):'')+'">'+(avg?avg+'/100':'—')+'</b><span>ort. odak</span></div></div><p class="v29-day-note">'+(a.length?(best?'En çok '+esc(best)+' çalıştın · '+fmtHM(top[best])+'. ':'')+(d.ints?d.ints+' kesinti kaydı var.':'Kesinti kaydı yok.'):'İlk oturumunu tamamladığında günün özeti burada oluşur.')+'</p>'}
function v29RenderAllFocus(){v29RenderSetup();v29RenderDashboard();v29RenderTimeline();v29RenderUnified();v29RenderSubjectTopic();v29RenderHours();v29RenderLength();v29RenderStreaks();v29RenderDaySummary();v29RenderMinimal();try{renderPauseStats()}catch(e){}}
const __v29RenderPomo=renderPomo;renderPomo=function(){const r=__v29RenderPomo();try{v29RenderAllFocus()}catch(e){infraError('v29-render-pomo',e)}return r}
const __v29RenderSw=renderSw;renderSw=function(){const r=__v29RenderSw();try{v29RenderAllFocus()}catch(e){infraError('v29-render-sw',e)}return r}
const __v29SetPomoSubject=setPomoSubject;setPomoSubject=function(n){const r=__v29SetPomoSubject(n);v29RenderSetup();return r}
const __v29SetPomoTopic=setPomoTopic;setPomoTopic=function(v){const r=__v29SetPomoTopic(v);v29RenderSetup();return r}
function v29ToggleMinimal(force){const ov=el('v29MinimalOverlay');if(!ov)return;const on=typeof force==='boolean'?force:!ov.classList.contains('show');ov.classList.toggle('show',on);ov.setAttribute('aria-hidden',on?'false':'true');document.body.classList.toggle('v29-minimal-lock',on);v29RenderMinimal()}
function v29RenderMinimal(){const ov=el('v29MinimalOverlay');if(!ov)return;const sub=el('v29MinimalSubject'),goal=el('v29MinimalGoal'),clock=el('v29MinimalClock'),state=el('v29MinimalState'),btn=el('v29MinimalToggle');if(sub)sub.textContent=(pomoSubject||'Ders')+(typeof pomoTopic!=='undefined'&&pomoTopic?' · '+pomoTopic:'');if(goal)goal.textContent=[v29Goal(),v29GoalQ()?v29GoalQ()+' soru':''].filter(Boolean).join(' · ');if(S.focus.mode==='sw'){const ms=swElapsed();if(clock)clock.textContent=fmtSw(ms);if(state)state.textContent=sw().run?'Kronometre çalışıyor':(ms?'Duraklatıldı':'Hazır');if(btn)btn.textContent=sw().run?'Duraklat':(ms?'Devam et':'Başlat')}else{if(clock)clock.textContent=fmtT(pomoLeft);if(state)state.textContent=pomoState==='running'?'Odak devam ediyor':pomoState==='paused'?'Duraklatıldı':'Hazır';if(btn)btn.textContent=pomoState==='running'?'Duraklat':pomoState==='paused'?'Devam et':'Başlat'}}
function v29MinimalToggleTimer(){if(S.focus.mode==='sw')swToggle();else togglePomo();v29RenderMinimal()}
function v29QuickBreak(){if(S.focus.mode==='sw'){if(sw().run)swPause();else toast('Kronometre zaten duraklatılmış')}else{if(pomoState==='running')pausePomo();else toast('Sayaç zaten duraklatılmış')}v29RenderMinimal()}
const __v29PomoClock=renderPomoClock;renderPomoClock=function(){const r=__v29PomoClock();v29RenderMinimal();return r}
const __v29SwLive=renderSwLive;renderSwLive=function(){const r=__v29SwLive();v29RenderMinimal();return r}
function runV29SelfTest(){const checks=[],add=(n,o)=>checks.push([n,!!o]),keep=S,ks=pomoSubject,km=S.focus.mode,kp=typeof pomoTopic!=='undefined'?pomoTopic:'';try{const t=normalize(JSON.parse(JSON.stringify(DEF))),T=todayKey();S=t;t.focus.goalMin=120;t.focus.sessionGoal='30 soru';t.focus.sessionGoalQ=30;t.pomoMin[T]=95;t.sessions[T]=[{t:Date.now()-7200000,end:Date.now()-5400000,m:30,subj:'Matematik',topic:'Problemler',type:'work',done:true,goal:'30 soru',goalQ:30,actualQ:28,quality:4,interruptions:1,reasons:{phone:1},focusScore:82,source:'pomo',plannedMin:30,qCredited:true},{t:Date.now()-3600000,end:Date.now()-900000,m:45,subj:'Türkçe',topic:'Paragraf',type:'work',done:true,goal:'Paragraf',goalQ:40,actualQ:42,quality:5,interruptions:0,reasons:{},focusScore:94,source:'sw',plannedMin:45,qCredited:true}];perfInvalidateState();add('version',APP_VERSION==='3.2.5'&&V29_VERSION==='2.9.0'&&DATA_SCHEMA===21);const d=v29DashboardData();add('dashboard',d.list.length===2&&d.longest===45&&d.remain===25);add('score',v29ScoreSession(t.sessions[T][0])>0&&v29ScoreSession(t.sessions[T][0])<=100);add('period',v29SessionList(7).length===2);add('hours',Array.isArray(v29HourStats()));add('length',v29LengthBuckets().length===3);v29RenderAllFocus();add('html',!!el('v29Dashboard')&&!!el('v29Timeline')&&!!el('v29UnifiedHistory')&&!!el('v29DaySummary'));add('render',el('v29Dashboard').textContent.includes('1 sa 35 dk')&&el('v29UnifiedHistory').textContent.includes('Problemler')&&el('v29DaySummary').textContent.includes('70'));const norm=normalize(JSON.parse(JSON.stringify(t)));add('normalize',norm.sessions[T][0].goalQ===30&&norm.sessions[T][0].focusScore===82&&norm.sessions[T][0].reasons.phone===1)}catch(e){checks.push(['exception',false]);try{infraError('v29-selftest',e)}catch(x){}}finally{S=keep;pomoSubject=ks;S.focus.mode=km;try{pomoTopic=kp}catch(e){}perfInvalidateState();try{renderAll();v29RenderAllFocus()}catch(e){}}const ok=checks.every(x=>x[1]);document.documentElement.setAttribute('data-v29-selftest',ok?'ok':'fail');let o=el('v29SelfTestResult');if(!o){o=document.createElement('pre');o.id='v29SelfTestResult';o.hidden=true;document.body.appendChild(o)}o.textContent=(ok?'YKS_V29_SELFTEST_OK':'YKS_V29_SELFTEST_FAIL')+' '+checks.map(x=>x[0]+':'+(x[1]?'ok':'fail')).join(',');return {ok,checks}}
const __v29Built=runBuiltInSelfTest;runBuiltInSelfTest=function(){__v29Built();const r=runV29SelfTest();if(!r.ok){document.documentElement.setAttribute('data-selftest','fail');const o=el('selfTestResult');if(o)o.textContent='YKS_SELFTEST_FAIL'}};
try{const q=new URLSearchParams(location.search).get('selftest');if(q==='v29')setTimeout(runV29SelfTest,260)}catch(e){}
try{setTimeout(()=>{v29RenderAllFocus();v29RenderSetup()},320)}catch(e){}


/* ==================================================================
   YKS DEFTERİM v3.0.0 — DAHA 2.0
   Daha artık bir özellik yığını değil; kart -> alt sayfa düzeninde merkez.
   Kullanım sıklığı yalnız bu cihazdaki küçük bir localStorage sayacıdır;
   ana veri şemasını ve Firebase senkron sözleşmesini değiştirmez.
   ================================================================== */
const V30_VERSION="3.0.0";
const V30_USAGE_KEY="yks_more_usage_v3";
let v30MoreCurrent="home";
const V30_ACTIONS={
  lab:{label:"Öğrenme Laboratuvarı",sub:"Ders & konu",icon:"⌁",base:95},
  resources:{label:"Kaynaklar",sub:"Kitap & video",icon:"▤",base:90},
  archive:{label:"Soru arşivi",sub:"Yanlış tekrar",icon:"▣",base:80},
  backup:{label:"JSON yedek",sub:"Geri dönüş kopyası",icon:"⇩",base:70},
  system:{label:"Sistem",sub:"Sağlık kontrolü",icon:"✓",base:60},
  reports:{label:"Raporlar",sub:"Ay & geçmiş",icon:"↗",base:50},
  success:{label:"Çalışma özeti",sub:"Karne & geçmiş",icon:"▦",base:40},
  settings:{label:"Ayarlar",sub:"Görünüm & hedef",icon:"⚙",base:30},
  tactics:{label:"Taktikler",sub:"Stratejiler",icon:"◎",base:20},
  data:{label:"Veri",sub:"Senkron & aktarım",icon:"⇅",base:10},
  about:{label:"Hakkında",sub:"Sürüm bilgisi",icon:"i",base:0}
};
function v30Usage(){try{const x=JSON.parse(localStorage.getItem(V30_USAGE_KEY)||"{}");return x&&typeof x==="object"&&!Array.isArray(x)?x:{}}catch(e){return {}}}
function v30Bump(k){if(!V30_ACTIONS[k])return;const x=v30Usage();x[k]=Math.min(9999,(x[k]|0)+1);try{localStorage.setItem(V30_USAGE_KEY,JSON.stringify(x))}catch(e){}v30RenderQuick()}
function v30QuickItems(){const u=v30Usage();return Object.keys(V30_ACTIONS).map(k=>({k,...V30_ACTIONS[k],n:u[k]|0})).sort((a,b)=>(b.n-a.n)||(b.base-a.base)||a.label.localeCompare(b.label,"tr")).slice(0,4)}
function v30RenderQuick(){const w=el("v30QuickGrid");if(!w)return;w.innerHTML=v30QuickItems().map(x=>'<button class="v30-quick" type="button" onclick="v30Action(\''+x.k+'\')"><i>'+x.icon+'</i><b>'+esc(x.label)+'</b><small>'+esc(x.sub)+'</small></button>').join("")}
function v30StorageLabel(){try{const n=typeof infraStorageBytes==="function"?infraStorageBytes():new Blob(Object.values(localStorage)).size;return Math.max(0,Math.round(n/1024))+" KB"}catch(e){return "—"}}
function v30BackupLabel(){if(S.lastBackup){const d=parseKey(S.lastBackup);return d.toLocaleDateString("tr-TR",{day:"numeric",month:"short"})}const a=typeof autoBackups==="function"?autoBackups():[];return a.length?a.length+" yerel kopya":"Henüz yok"}
function v30CloudText(){const a=el("cloudSyncText"),b=el("cloudSyncMeta");return {main:(a&&a.textContent.trim())||"Bulut durumu",sub:(b&&b.textContent.trim())||"Durum bekleniyor"}}
function v30RenderHome(){v30RenderQuick();const w=el("v30MoreStatus"),c=v30CloudText();if(w)w.innerHTML='<div class="v30-status-item"><b>'+esc(c.main)+'</b><span>'+esc(c.sub)+'</span></div><div class="v30-status-item"><b>Son yedek · '+esc(v30BackupLabel())+'</b><span>'+esc(v30StorageLabel())+' yerel veri</span></div><div class="v30-status-item"><b>v'+esc(APP_VERSION)+'</b><span>'+esc(APP_CHANNEL)+' · şema '+DATA_SCHEMA+'</span></div>';v30RenderAbout();v30RenderDataSyncSummary()}
function v30RenderDataSyncSummary(){const w=el("v30DataSyncSummary");if(!w)return;const c=v30CloudText();let dirty=false,last=0;try{dirty=localStorage.getItem("yks_cloud_dirty")==="1";last=Number(localStorage.getItem("yks_last_sync_at")||0)||0}catch(e){}w.innerHTML='<div class="v30-sync-line"><span>Bulut</span><b>'+esc(c.main)+(c.sub?' · '+esc(c.sub):'')+'</b></div><div class="v30-sync-line"><span>Bekleyen değişiklik</span><b>'+(dirty?'Var':'Yok')+'</b></div><div class="v30-sync-line"><span>Son senkron</span><b>'+(last&&typeof syncAgo==="function"?esc(syncAgo(last)):'—')+'</b></div><div class="v30-sync-line"><span>Yerel veri</span><b>'+esc(v30StorageLabel())+'</b></div>'}
function v30RenderAbout(){const a=el("appVersionLabel"),c=el("v30AboutChannel"),sc=el("v30AboutSchema");if(a)a.textContent=APP_VERSION+" · "+APP_CHANNEL;if(c)c.textContent=APP_CHANNEL;if(sc)sc.textContent=String(DATA_SCHEMA)}
const __v30LegacySetMoreTab=setMoreTab;
setMoreTab=function(t){t=String(t||"home");const home=el("v30MoreHome"),about=el("v30AboutPanel"),valid=["lab","kay","tak","roz","veri","ayar"];if(home)home.style.display="none";if(about)about.style.display="none";valid.forEach(x=>{const p=el("mrp_"+x),b=el("mr_"+x);if(p)p.style.display="none";if(b)b.classList.remove("on")});if(t==="home"||(!valid.includes(t)&&t!=="about")){v30MoreCurrent="home";if(home)home.style.display="block";v30RenderHome();return}if(t==="about"){v30MoreCurrent="about";if(about)about.style.display="block";v30RenderAbout();return}v30MoreCurrent=t;__v30LegacySetMoreTab(t);if(t==="veri")v30RenderDataSyncSummary()}
activeMoreTab=function(){return v30MoreCurrent||"home"}
function v30ScrollTo(id){const n=el(id);if(!n)return;setTimeout(()=>n.scrollIntoView({behavior:"smooth",block:"start"}),80)}
function v30OpenMore(t,anchor){go("more");setMoreTab(t);if(anchor)v30ScrollTo(anchor)}
function v30OpenArchive(){go("deneme");const b=el("fb_arsiv"),h=el("fh_arsiv");if(b&&!b.classList.contains("open")){b.classList.add("open");if(h){h.classList.add("open");h.setAttribute("aria-expanded","true")}}v30ScrollTo("fh_arsiv")}
function v30Action(k){if(V30_ACTIONS[k])v30Bump(k);if(k==="lab")return v30OpenMore("lab");if(k==="resources")return v30OpenMore("kay");if(k==="tactics")return v30OpenMore("tak");if(k==="success")return v30OpenMore("roz");if(k==="settings")return v30OpenMore("ayar");if(k==="data")return v30OpenMore("veri","v30DataTop");if(k==="reports")return v30OpenMore("veri","monthReportBox");if(k==="log")return v30OpenMore("veri","logBox");if(k==="system"){v30OpenMore("veri","infraBox");setTimeout(()=>{try{renderInfraHealth()}catch(e){}},30);return}if(k==="archive")return v30OpenArchive();if(k==="about")return v30OpenMore("about");if(k==="backup"){try{return exportData()}catch(e){toast("Yedek hazırlanamadı");return false}}}
openGlobalSearch=function(){go("more");setMoreTab("home");setTimeout(()=>{const i=el("gsInput");if(i){i.focus();i.scrollIntoView({behavior:"smooth",block:"center"})}},60)}
const __v30RenderSettings=renderSettings;renderSettings=function(){const r=__v30RenderSettings();v30RenderAbout();v30RenderHome();return r}
function runV30SelfTest(){const checks=[],add=(n,o)=>checks.push([n,!!o]),cur=v30MoreCurrent;try{add("version",APP_VERSION==="3.2.5"&&V30_VERSION==="3.0.0"&&DATA_SCHEMA===21);add("html",!!el("v30MoreHome")&&!!el("v30QuickGrid")&&!!el("v30MoreStatus")&&!!el("v30AboutPanel")&&!!el("v30DataSyncSummary"));add("actions",Object.keys(V30_ACTIONS).length>=10&&v30QuickItems().length===4);setMoreTab("home");add("home",el("v30MoreHome").style.display!=="none"&&el("mrp_kay").style.display==="none");setMoreTab("kay");add("subpage",el("mrp_kay").style.display!=="none"&&el("v30MoreHome").style.display==="none");setMoreTab("about");v30RenderAbout();add("about",el("v30AboutPanel").style.display!=="none"&&el("appVersionLabel").textContent.includes("3.2.5"));setMoreTab("veri");v30RenderDataSyncSummary();add("data",el("v30DataSyncSummary").textContent.length>5);setMoreTab("home");v30RenderHome();add("render",el("v30MoreStatus").textContent.includes("3.2.5")&&el("v30QuickGrid").children.length===4)}catch(e){checks.push(["exception",false]);try{infraError("v30-selftest",e)}catch(x){}}finally{try{setMoreTab(cur||"home")}catch(e){}}const ok=checks.every(x=>x[1]);document.documentElement.setAttribute("data-v30-selftest",ok?"ok":"fail");let o=el("v30SelfTestResult");if(!o){o=document.createElement("pre");o.id="v30SelfTestResult";o.hidden=true;document.body.appendChild(o)}o.textContent=(ok?"YKS_V30_SELFTEST_OK":"YKS_V30_SELFTEST_FAIL")+" "+checks.map(x=>x[0]+":"+(x[1]?"ok":"fail")).join(",");return {ok,checks}}
const __v30Built=runBuiltInSelfTest;runBuiltInSelfTest=function(){__v30Built();const r=runV30SelfTest();if(!r.ok){document.documentElement.setAttribute("data-selftest","fail");const o=el("selfTestResult");if(o)o.textContent="YKS_SELFTEST_FAIL"}};
try{const q=new URLSearchParams(location.search).get("selftest");if(q==="v30")setTimeout(runV30SelfTest,300)}catch(e){}
try{setTimeout(()=>{if(el("more")&&el("more").classList.contains("active"))setMoreTab("home");else v30RenderHome()},360)}catch(e){}

/* ---- legacy-block-5 ---- */
/* ==================================================================
   YKS DEFTERİM v3.1.3 — ALTYAPI & AKICILIK
   Veri şemasını değiştirmez. Amaç: aktif oturumu korumak, yüksek frekanslı
   yazmaları birleştirmek, ağır indeksleri aynı state epoch'unda tekrar
   hesaplamamak ve mobil yaşam döngüsünde bekleyen kaydı kaçırmamaktır.
   ================================================================== */
const V31_VERSION="3.1.3";
const V31_PERF={debouncedSaves:0,flushes:0,debouncedSearches:0,cacheHits:0,cacheBuilds:0};
try{window.__YKS_V31_PERF=V31_PERF}catch(e){}
try{
  const dm=Number(navigator.deviceMemory||0),hc=Number(navigator.hardwareConcurrency||0);
  if((dm&&dm<=4)||(hc&&hc<=4))document.documentElement.classList.add("perf-lite");
}catch(e){}

/* --- güvenli gecikmeli kayıt: yalnız yüksek frekanslı metin girişlerinde --- */
let v31SaveTimer=null,v31SavePending=false;
function saveSoon(delay){
  perfInvalidateState();
  v31SavePending=true;V31_PERF.debouncedSaves++;
  clearTimeout(v31SaveTimer);
  v31SaveTimer=setTimeout(()=>flushSaveSoon(),Math.max(80,Math.min(800,delay|0||180)));
  return true;
}
function flushSaveSoon(){
  if(!v31SavePending)return true;
  clearTimeout(v31SaveTimer);v31SaveTimer=null;v31SavePending=false;V31_PERF.flushes++;
  return save();
}
document.addEventListener("visibilitychange",()=>{if(document.hidden)flushSaveSoon()});
window.addEventListener("pagehide",()=>{try{flushSaveSoon();persistStateHashMaybe(lastPersistedJSON,true)}catch(e){}});

/* --- küçük debounce yöneticisi --- */
const v31DebounceTimers=new Map();
function v31Debounce(key,fn,delay){
  const old=v31DebounceTimers.get(key);if(old)clearTimeout(old);
  V31_PERF.debouncedSearches++;
  const id=setTimeout(()=>{v31DebounceTimers.delete(key);try{fn()}catch(e){infraError("debounce:"+key,e)}},delay|0||100);
  v31DebounceTimers.set(key,id);return id;
}
function v31TeacherSearch(){v31Debounce("teacher-search",()=>renderTeachers(),110)}

/* Konu ve global arama, her tuşta bütün veri setini yeniden kurmaz. */
setTopicQuery=function(v){
  topicQuery=(v||"").trim().toLocaleLowerCase("tr");
  if(!topicQuery){const t=v31DebounceTimers.get("topic-search");if(t)clearTimeout(t);v31DebounceTimers.delete("topic-search");return renderSubjects()}
  v31Debounce("topic-search",()=>renderSubjects(),90);
};
const __v31RunSearch=runSearch;
runSearch=function(){
  const i=el("gsInput"),q=(i&&i.value||"").trim();
  if(q.length<2){const t=v31DebounceTimers.get("global-search");if(t)clearTimeout(t);v31DebounceTimers.delete("global-search");return __v31RunSearch()}
  v31Debounce("global-search",()=>__v31RunSearch(),110);
};

/* Odak amacı metin alanları da localStorage'a her karakterde 1 MB civarı JSON yazmaz. */
v29SetGoal=function(v){S.focus.sessionGoal=String(v||"").slice(0,140);saveSoon(220);v29RenderSetup()};
v29SetGoalQ=function(v){S.focus.sessionGoalQ=Math.max(0,Math.min(1000,parseInt(v,10)||0));saveSoon(220);v29RenderSetup()};

/* --- aynı state epoch'unda tekrar kullanılan ağır indeksler --- */
function v31Memo(key,fn){
  /* Bazı eski test/migration akışları S referansını doğrudan değiştiriyor.
     Epoch unutulsa bile başka state'in cache'ini asla kullanma. */
  if(perfMemoStateRef!==S){perfMemoCache.clear();perfMemoStateRef=S;perfStateEpoch++;}
  const full=perfStateEpoch+"|v31|"+key;if(perfMemoCache.has(full)){V31_PERF.cacheHits++;return perfMemoCache.get(full)}
  V31_PERF.cacheBuilds++;const v=fn();perfMemoCache.set(full,v);return v;
}
function v31SortedExamsAsc(type){
  return v31Memo("exams-asc:"+(type||"*"),()=>{const a=(S.denemeler||[]).filter(d=>!type||d.type===type).slice();a.sort((x,y)=>String(x.date||"").localeCompare(String(y.date||""))||((x.id||0)-(y.id||0)));return a});
}
function v31SortedExamsDesc(){
  return v31Memo("exams-desc",()=>{const a=(S.denemeler||[]).slice();a.sort((x,y)=>String(y.date||"").localeCompare(String(x.date||""))||((y.id||0)-(x.id||0)));return a});
}
function v31ExamDateCounts(){return v31Memo("exam-date-counts",()=>{const m={};(S.denemeler||[]).forEach(d=>{if(d&&d.date)m[d.date]=(m[d.date]||0)+1});return m})}
function v31ExamWrongMap(){return v31Memo("exam-wrong-map",()=>{const m={};(S.wrongLog||[]).forEach(w=>{if(w&&w.deneme)(m[w.deneme]||(m[w.deneme]=[])).push(w)});return m})}

/* v2 risk motoru: her ders için bütün deneme listesini tekrar tekrar sort etme. */
v2StudyMinutes=function(subj,days){return v31Memo("study:"+subj+":"+days,()=>{let n=0;for(let i=0;i<days;i++){const k=addDaysKey(todayKey(),-i),m=S.pomoSubj[k]||{};Object.keys(m).forEach(x=>{if(v2SubjectMatch(x,subj))n+=Number(m[x])||0})}return n})};
v2ExamPerf=function(subj,limit){return v31Memo("exam-perf:"+subj+":"+(limit||5),()=>{const vals=[];for(const d of v31SortedExamsDesc()){const sr=(d.subjectResults||[]).find(x=>v2SubjectMatch(x.name,subj));if(!sr||!(sr.cap>0))continue;vals.push({pct:Math.max(0,Math.min(100,((Number(sr.net)||0)/sr.cap)*100)),date:d.date});if(vals.length>=(limit||5))break}if(!vals.length)return null;return {pct:Math.round(vals.reduce((a,x)=>a+x.pct,0)/vals.length),n:vals.length}})};
v2WrongAgg=function(days){return v31Memo("wrong-agg:"+(days||90),()=>{const cut=addDaysKey(todayKey(),-(days||90)),m={};(S.wrongLog||[]).forEach(w=>{if((w.date||"")<cut)return;const key=(w.subject||"")+"|"+(w.topic||"");if(!m[key])m[key]={subject:w.subject||"",topic:w.topic||"",sum:0,occ:0,last:""};m[key].sum+=Math.max(1,Number(w.n)||1);m[key].occ++;if((w.date||"")>m[key].last)m[key].last=w.date||""});return Object.values(m)})};

/* Konular 2.0 context'i filtre/arama sırasında state değişmediyse yeniden tarama. */
const __v31V26BuildContext=v26BuildContext;
v26BuildContext=function(){return v31Memo("v26-context:"+todayKey(),()=>__v31V26BuildContext())};

/* Deneme sıralamaları ve önceki-deneme ilişkisi tek indeks üzerinden. */
v27ExamList=function(type){return v31SortedExamsAsc(type)};
function v31PrevExamMap(type){return v31Memo("prev-exam:"+(type||"*"),()=>{const m=new Map(),a=v31SortedExamsAsc(type);let prev=null;a.forEach(d=>{m.set(d.id,prev);prev=d});return m})}
v27PrevSame=function(d){return d?v31PrevExamMap(d.type).get(d.id)||null:null};
v27ExamWrong=function(d){return d?(v31ExamWrongMap()[d.id]||[]):[]};
v22ExamList=function(type,limit){const a=v31SortedExamsAsc(type);return limit?a.slice(-limit):a};

/* Program erteleme ve takvim indeksleri state değişene kadar tekrar hesaplanmaz. */
const __v31ProcrastStats=procrastStats;
procrastStats=function(){return v31Memo("procrast",()=>__v31ProcrastStats())};
const __v31DayActivity=dayActivity;
dayActivity=function(k){
  const d=parseKey(k),dw=dowOf(d),w=getWeek(keyOf(mondayOf(d)),false);let filled=0,cellDone=0,done=false;
  if(w){["r","s"].forEach(blk=>w[blk].forEach((row,i)=>{if(row[dw]&&row[dw].trim()){filled++;if(w.dn[blk+"-"+i+"-"+dw])cellDone++}}));done=!!w.done[dw]}
  return {min:S.pomoMin[k]||0,q:S.solved[k]||0,dn:v31ExamDateCounts()[k]||0,filled,cellDone,done,jr:!!S.journal[k]};
};

/* Ana navigasyon: programın görünmeyen takvim/erteleme kısımlarını ilk boyamada zorunlu çalıştırma. */
const __v31Go=go;
go=function(id){
  if(id!=="program")return __v31Go(id);
  document.querySelectorAll(".screen").forEach(s=>s.classList.remove("active"));const t=el(id);if(t)t.classList.add("active");
  document.querySelectorAll(".tab").forEach(b=>{const on=b.dataset.s===id;b.classList.toggle("active",on);b.setAttribute("aria-selected",on?"true":"false");b.tabIndex=on?0:-1});
  el("mainWrap").classList.toggle("wide",true);if(typeof updateNav==="function")updateNav(id);window.scrollTo(0,0);
  renderPlan();
  const calOpen=el("progCal")&&el("progCal").style.display!=="none";
  if(calOpen){renderCalendar();renderDayDetail();perfAfterPaint("program-procrast",()=>renderProcrast())}
  else perfAfterPaint("program-secondary",()=>{renderCalendar();renderDayDetail();renderProcrast()});
};

/* renderAll: aktif ekranı hemen güncelle, görünmeyen ağır ekranları boş zamana böl.
   Böylece import/undo/senkron sonrası tek karede tüm uygulama yeniden kurulmaz. */
const __v31LegacyRenderAll=renderAll;
function v31HiddenRefresh(key,screen,fn,timeout){
  perfIdle("v31-refresh-"+key,()=>{if(currentScreen()===screen)return;fn()},timeout||1800);
}
renderAll=function(){
  try{renderActiveScreenNoScroll()}catch(e){infraError("renderall-active",e)}
  v31HiddenRefresh("home","home",()=>renderHome(),1600);
  v31HiddenRefresh("program","program",()=>{renderPlan();renderCalendar();renderDayDetail();renderProcrast()},2100);
  v31HiddenRefresh("topics","topics",()=>{renderSubjects();renderReviewQueue()},2300);
  v31HiddenRefresh("deneme","deneme",()=>{renderDybRows();renderDenemeHistory();if(typeof renderExam2==="function")renderExam2();renderCompareOpts();renderScore();renderWrongTopics();renderBlankWrong()},2600);
  v31HiddenRefresh("progress","progress",()=>{if(typeof renderProgress==="function")renderProgress()},2800);
  v31HiddenRefresh("pomo","pomo",()=>{renderPomo();renderTimeDist();if(typeof renderSw==="function")renderSw()},3000);
  perfIdle("v31-refresh-global",()=>{try{renderBooks();renderBadges();renderSettings();if(typeof applyRole==="function")applyRole();if(typeof renderNotifSettings==="function")renderNotifSettings()}catch(e){infraError("renderall-global",e)}},3200);
  scheduleInfraHealth(false);
};

/* Sistem sağlığına canlı performans satırları ekle. */
const __v31Infra=renderInfraHealth;
renderInfraHealth=function(){
  const r=__v31Infra();const w=el("infraBox");if(!w)return r;
  const saveMs=Number(PERF_STATE.lastSaveMs||0),cloudMs=Number(PERF_STATE.lastCloudBuildMs||0);
  w.insertAdjacentHTML("beforeend",'<div class="dayrow"><span class="k">Son yerel kayıt maliyeti</span><span class="v">'+saveMs.toFixed(1)+' ms</span></div><div class="dayrow"><span class="k">Son bulut JSON hazırlama</span><span class="v">'+(cloudMs?cloudMs.toFixed(1)+' ms':'—')+'</span></div><div class="dayrow"><span class="k">Performans cache</span><span class="v">'+V31_PERF.cacheHits+' isabet · '+V31_PERF.cacheBuilds+' üretim</span></div>');
  return r;
};

function runV31SelfTest(){
  const checks=[],add=(n,o)=>checks.push([n,!!o]),keep=S,keepState={pomoState:typeof pomoState!=="undefined"?pomoState:"idle",pomoStartedAt:typeof pomoStartedAt!=="undefined"?pomoStartedAt:0};
  try{
    add("version",APP_VERSION==="3.2.5"&&V31_VERSION==="3.1.3"&&DATA_SCHEMA===21);
    add("save-debounce",typeof saveSoon==="function"&&typeof flushSaveSoon==="function");
    const t=normalize(JSON.parse(JSON.stringify(DEF))),T=todayKey();S=t;
    for(let i=0;i<80;i++)t.denemeler.push({id:31000+i,type:i%4?"TYT":"AYT",name:"T"+i,date:addDaysKey(T,-i),totalNet:50+i%20,subjectResults:[{name:"Temel Matematik",net:20,cap:40}]});
    t.wrongLog=[{id:1,date:T,subject:"Matematik",topic:"Problemler",n:2,deneme:31001}];perfInvalidateState();
    const a=v27ExamList("TYT"),b=v27ExamList("TYT");add("exam-cache",a===b&&a.length>10);
    const p=a[a.length-1],pr=v27PrevSame(p);add("prev-index",!!pr&&pr.id!==p.id);
    add("wrong-index",v27ExamWrong({id:31001}).length===1);
    const before=V31_PERF.cacheHits;v26BuildContext();v26BuildContext();add("context-cache",V31_PERF.cacheHits>before);
    if(typeof pomoState!=="undefined"){pomoState="running";pomoStartedAt=Date.now();renderAll();add("render-preserves-pomo",pomoState==="running")}else add("render-preserves-pomo",true);
    add("pagehide-flush",typeof flushSaveSoon==="function");
  }catch(e){checks.push(["exception",false]);try{infraError("v31-selftest",e)}catch(x){}}
  finally{S=keep;perfInvalidateState();try{if(typeof pomoState!=="undefined"){pomoState=keepState.pomoState;pomoStartedAt=keepState.pomoStartedAt}renderAll()}catch(e){}}
  const ok=checks.every(x=>x[1]);document.documentElement.setAttribute("data-v31-selftest",ok?"ok":"fail");let o=el("v31SelfTestResult");if(!o){o=document.createElement("pre");o.id="v31SelfTestResult";o.hidden=true;document.body.appendChild(o)}o.textContent=(ok?"YKS_V31_SELFTEST_OK":"YKS_V31_SELFTEST_FAIL")+" "+checks.map(x=>x[0]+":"+(x[1]?"ok":"fail")).join(",");return {ok,checks};
}
const __v31Built=runBuiltInSelfTest;
runBuiltInSelfTest=function(){const r=__v31Built();const x=runV31SelfTest();if(!x.ok){document.documentElement.setAttribute("data-selftest","fail");const o=el("selfTestResult");if(o)o.textContent="YKS_SELFTEST_FAIL"}return r};
try{const q=new URLSearchParams(location.search).get("selftest");if(q==="v31")setTimeout(runV31SelfTest,340)}catch(e){}

/* ---- legacy-block-6 ---- */
/* ==================================================================
   YKS Defterim v3.1.4 — Tablet + PC yerleşim altyapısı
   - Sıra numarasına göre DOM taşımaz; gerçek bileşen/ID'leri kullanır.
   - Her ekran ayrı korunur: bir bölüm bozulsa diğerleri kurulmaya devam eder.
   - Tekrar çalıştırılabilir (idempotent) ve sağlık kontrolü yapar.
   - Veri katmanına/Firebase'e dokunmaz.
   ================================================================== */
(function(){
  const LAYOUT_VERSION="3.1.4";
  const D=document;
  const by=id=>D.getElementById(id);
  const mk=(tag,cls)=>{const n=D.createElement(tag);if(cls)n.className=cls;return n;};
  const direct=(p,cls)=>p&&Array.from(p.children).find(x=>x.classList&&x.classList.contains(cls));
  function ensureWrap(parent,cls,before){
    if(!parent)return null;
    let w=direct(parent,cls);
    if(!w){w=mk('div',cls);parent.insertBefore(w,before&&before.parentNode===parent?before:null);}
    return w;
  }
  function move(parent,node){if(parent&&node&&node.parentNode!==parent)parent.appendChild(node);return !!node;}
  function pair(head,body,extra){
    const w=mk('section','desktop-section'+(extra?' '+extra:''));
    if(head)w.appendChild(head);if(body)w.appendChild(body);return w;
  }
  function safeSection(name,fn,health){
    try{const ok=fn()!==false;health[name]=ok;return ok;}
    catch(e){health[name]=false;try{infraError('desktop-layout:'+name,e)}catch(_){try{console.warn('desktop-layout:'+name,e)}catch(__){}}return false;}
  }
  function buildDeneme(){
    const root=by('deneme');
    /* v3.2.5 Deneme Analiz Merkezi kendi tam-genişlik düzenini yönetir. */
    if(root&&by('v315Dashboard')&&by('v315ExamFormCard'))return true;
    const formInput=by('denemeName'),refl=by('reflBox'),latest=by('v27Latest'),overview=by('v27Overview');
    const form=formInput&&formInput.closest('.card'),center=overview&&overview.closest('.card');
    if(!root||!form||!center||!latest)return false;
    let top=ensureWrap(root,'desktop-deneme-top',form);
    let left=direct(top,'desktop-deneme-primary'),right=direct(top,'desktop-deneme-side');
    if(!left){left=mk('div','desktop-deneme-primary');top.appendChild(left)}
    if(!right){right=mk('div','desktop-deneme-side');top.appendChild(right)}
    move(left,form);
    if(refl)move(right,refl);
    let title=center.previousElementSibling;
    if(title&&title.tagName==='H2'&&title.parentNode!==right)move(right,title);
    move(right,center);move(right,latest);
    return true;
  }
  function buildTopics(){
    const root=by('topics'),ovCard=by('v26TopicOverview'),att=by('v26TopicAttention');
    if(!root||!ovCard||!att)return false;
    let title=ovCard.previousElementSibling;
    const w=ensureWrap(root,'desktop-topic-overview',(title&&title.parentNode===root)?title:ovCard);
    if(title&&title.tagName==='H2')move(w,title);
    move(w,ovCard);move(w,att);return true;
  }
  function buildFocus(){
    const root=by('pomo'),setup=root&&root.querySelector('.v29-session-setup'),pomo=by('focusPomo'),stop=by('focusStop');
    if(!root||!setup||!pomo||!stop)return false;
    const w=ensureWrap(root,'desktop-focus-workspace',setup);
    let sides=Array.from(w.children).filter(x=>x.classList&&x.classList.contains('desktop-focus-side'));
    while(sides.length<2){const x=mk('div','desktop-focus-side');w.appendChild(x);sides.push(x)}
    move(sides[0],setup);move(sides[1],pomo);move(sides[1],stop);return true;
  }
  function buildProgram(){
    const root=by('program'),a=by('fh_kamp'),ab=by('fb_kamp'),b=by('fh_sablon'),bb=by('fb_sablon');
    if(!root||!a||!ab||!b||!bb)return false;
    let tools=ensureWrap(root,'desktop-program-tools',a);
    const ensurePair=(head,body,key)=>{
      let w=Array.from(tools.children).find(x=>x.dataset&&x.dataset.desktopPair===key);
      if(!w){w=pair(null,null);w.dataset.desktopPair=key;tools.appendChild(w)}
      move(w,head);move(w,body);
    };
    ensurePair(a,ab,'camp');ensurePair(b,bb,'template');return true;
  }
  function rebuildProgress(){
    const root=by('progress'),score=by('v28Score');if(!root||!score)return false;
    let grid=ensureWrap(root,'desktop-progress-grid',score.nextSibling);
    /* Yeni sürümlerde score sonrasına eklenen doğrudan düğümleri de güvenle içeri al. */
    const fresh=[];let n=score.nextElementSibling;
    while(n){const nx=n.nextElementSibling;if(n!==grid)fresh.push(n);n=nx;}
    if(fresh.length){
      for(let i=0;i<fresh.length;i++){
        const x=fresh[i];
        if(x.tagName==='H2'&&i+1<fresh.length){const y=fresh[++i],sec=pair(x,y,'desktop-progress-section');if(y&&['v28Weekly','v28Calendar','v24WeeklyReport'].includes(y.id))sec.classList.add('wide');grid.appendChild(sec);}
        else{const sec=pair(null,x,'desktop-progress-section');if(x.tagName==='DETAILS')sec.classList.add('wide');grid.appendChild(sec);}
      }
    }
    return !!grid.querySelector('#progressCompare')&&!!grid.querySelector('#v28Weekly');
  }
  function rebuildHome(){
    const root=by('home'),anchor=by('homeGoals');if(!root||!anchor)return false;
    let grid=ensureWrap(root,'desktop-home-grid',anchor.nextSibling);
    const fresh=[];let n=anchor.nextElementSibling;
    while(n){const nx=n.nextElementSibling;if(n!==grid)fresh.push(n);n=nx;}
    if(fresh.length){
      for(let i=0;i<fresh.length;i++){
        const x=fresh[i];
        if(x.tagName==='H2'&&i+1<fresh.length){const y=fresh[++i],sec=pair(x,y);if(y&&['todayPlan','homeDeepAnalysis'].includes(y.id))sec.classList.add('wide');grid.appendChild(sec);}
        else if(x.classList&&x.classList.contains('foldhead')&&i+1<fresh.length&&fresh[i+1].classList&&fresh[i+1].classList.contains('foldbody'))grid.appendChild(pair(x,fresh[++i]));
        else grid.appendChild(pair(null,x));
      }
    }
    return !!grid.querySelector('#suggestBox')&&!!grid.querySelector('#todayPlan');
  }
  function audit(){
    const checks={
      deneme:by('v315Dashboard')?!!by('v315ExamFormCard'):(!!D.querySelector('#deneme > .desktop-deneme-top #denemeName')&&!!D.querySelector('#deneme > .desktop-deneme-top #v27Latest')),
      topics:!!D.querySelector('#topics > .desktop-topic-overview #v26TopicOverview')&&!!D.querySelector('#topics > .desktop-topic-overview #v26TopicAttention'),
      focus:!!D.querySelector('#pomo > .desktop-focus-workspace .v29-session-setup')&&!!D.querySelector('#pomo > .desktop-focus-workspace #focusPomo'),
      program:!!D.querySelector('#program > .desktop-program-tools #fh_kamp')&&!!D.querySelector('#program > .desktop-program-tools #fh_sablon'),
      progress:!!D.querySelector('#progress > .desktop-progress-grid #progressCompare')&&!!D.querySelector('#progress > .desktop-progress-grid #v28Weekly'),
      home:!!D.querySelector('#home > .desktop-home-grid #suggestBox')&&!!D.querySelector('#home > .desktop-home-grid #todayPlan')
    };
    const ok=Object.values(checks).every(Boolean);
    D.documentElement.dataset.desktopLayoutHealth=ok?'ok':'fail';
    D.documentElement.dataset.desktopLayoutVersion=LAYOUT_VERSION;
    return {ok,checks,version:LAYOUT_VERSION};
  }
  function repair(){
    const health={};
    safeSection('deneme',buildDeneme,health);
    safeSection('topics',buildTopics,health);
    safeSection('focus',buildFocus,health);
    safeSection('program',buildProgram,health);
    safeSection('progress',rebuildProgress,health);
    safeSection('home',rebuildHome,health);
    const a=audit();
    D.documentElement.dataset.v314Layout='1';
    try{window.__YKS_DESKTOP_LAYOUT={version:LAYOUT_VERSION,health,checks:a.checks,ok:a.ok};}catch(e){}
    return a;
  }
  window.yksDesktopLayoutRepair=repair;
  window.yksDesktopLayoutAudit=audit;
  function runV314SelfTest(){
    const checks=[],add=(n,o)=>checks.push([n,!!o]);
    try{
      const a=repair();add('version',APP_VERSION==='3.2.5'&&LAYOUT_VERSION==='3.1.4');add('layout-health',a.ok);
      const counts=()=>['desktop-deneme-top','desktop-topic-overview','desktop-focus-workspace','desktop-program-tools','desktop-progress-grid','desktop-home-grid'].map(c=>D.querySelectorAll('.'+c).length).join(',');
      const before=counts();repair();repair();add('idempotent',counts()===before);
      add('deneme-form',by('v315Dashboard')?!!by('v315ExamFormCard'):!!D.querySelector('.desktop-deneme-primary #denemeName'));
      add('deneme-side',by('v315Dashboard')?(!!by('v27Overview')&&!!by('v27Latest')):(!!D.querySelector('.desktop-deneme-side #v27Overview')&&!!D.querySelector('.desktop-deneme-side #v27Latest')));
      add('home',!!D.querySelector('.desktop-home-grid #todayPlan'));
      add('progress',!!D.querySelector('.desktop-progress-grid #v28Weekly'));
    }catch(e){checks.push(['exception',false]);try{infraError('v314-selftest',e)}catch(_){}}
    const ok=checks.every(x=>x[1]);D.documentElement.setAttribute('data-v314-selftest',ok?'ok':'fail');
    let o=by('v314SelfTestResult');if(!o){o=D.createElement('pre');o.id='v314SelfTestResult';o.hidden=true;D.body.appendChild(o)}
    o.textContent=(ok?'YKS_V314_SELFTEST_OK':'YKS_V314_SELFTEST_FAIL')+' '+checks.map(x=>x[0]+':'+(x[1]?'ok':'fail')).join(',');return {ok,checks};
  }
  window.runV314SelfTest=runV314SelfTest;
  /* Genel sistem testine geniş-ekran altyapısını da dahil et. */
  try{
    const previousBuiltIn=runBuiltInSelfTest;
    runBuiltInSelfTest=function(){
      const r=previousBuiltIn();const x=runV314SelfTest();
      if(!x.ok){D.documentElement.setAttribute('data-selftest','fail');const o=by('selfTestResult');if(o)o.textContent='YKS_SELFTEST_FAIL';}
      return r;
    };
  }catch(e){try{infraError('v314-selftest-hook',e)}catch(_){}}
  const start=()=>{const a=repair();if(!a.ok)setTimeout(repair,120);};
  if(D.readyState==='loading')D.addEventListener('DOMContentLoaded',start,{once:true});else start();
  try{const q=new URLSearchParams(location.search).get('selftest');if(q==='v314')setTimeout(runV314SelfTest,380)}catch(e){}
})();

/* ---- legacy-block-7 ---- */
/* ==================================================================
   YKS Defterim v3.2.5 — Deneme Analiz Merkezi
   Salt-okuma analiz katmanı: S.denemeler / S.wrongLog verisini kullanır,
   veri şemasına yeni alan eklemez.
   ================================================================== */
let v315DashType="TYT",v315DashWindow=10;
function v315TypeLabel(t){return t==="BRANS"?"Branş":t;}
function v315AllExams(type){
  if(typeof S==="undefined"||!S||!Array.isArray(S.denemeler))return[];
  return S.denemeler.filter(d=>d&&d.type===type).slice().sort((a,b)=>String(a.date||"").localeCompare(String(b.date||""))||((a.id||0)-(b.id||0)));
}
function v315WindowExams(type,win){const all=v315AllExams(type);return win>0?all.slice(-win):all;}
function v315Subjects(d){return d&&Array.isArray(d.subjectResults)?d.subjectResults:[];}
function v315Fmt(v){return Number.isFinite(+v)?String(r2(+v)):"—";}
function v315KpiHTML(k,v,s,c){return '<div class="v315-kpi '+(c||'')+'"><span class="k">'+esc(k)+'</span><span class="v">'+esc(String(v))+'</span><span class="s">'+esc(s||'')+'</span></div>';}
function setV315DashType(t){
  if(!["TYT","AYT","YDT","BRANS"].includes(t))t="TYT";v315DashType=t;
  ["TYT","AYT","YDT","BRANS"].forEach(x=>{const b=el("v315t"+x);if(b)b.classList.toggle("on",x===t)});
  renderV315Dashboard();
}
function setV315DashWindow(n){
  n=Number(n);v315DashWindow=n===5?5:n===10?10:0;
  [["v315w5",5],["v315w10",10],["v315wAll",0]].forEach(x=>{const b=el(x[0]);if(b)b.classList.toggle("on",x[1]===v315DashWindow)});
  renderV315Dashboard();
}
function openV315ExamForm(focus){
  const c=el("v315ExamFormCard"),root=el("deneme"),b=el("v315AddExamBtn");if(!c)return false;
  c.classList.add("open");if(root)root.classList.add("v315-form-open");
  if(b){b.textContent="Formu Kapat";b.setAttribute("aria-expanded","true")}
  if(focus)setTimeout(()=>{try{c.scrollIntoView({behavior:"smooth",block:"start"});const n=el("denemeName");if(n)n.focus({preventScroll:true})}catch(e){}},40);
  return true;
}
function closeV315ExamForm(scrollDash){
  const c=el("v315ExamFormCard"),root=el("deneme"),b=el("v315AddExamBtn");if(!c)return false;
  c.classList.remove("open");if(root)root.classList.remove("v315-form-open");
  if(b){b.textContent="+ Deneme Ekle";b.setAttribute("aria-expanded","false")}
  if(scrollDash){const d=el("v315Dashboard");if(d)try{d.scrollIntoView({behavior:"smooth",block:"start"})}catch(e){}}
  return true;
}
function toggleV315ExamForm(){const c=el("v315ExamFormCard");return c&&c.classList.contains("open")?closeV315ExamForm(false):openV315ExamForm(true);}
function v315ExamStats(type,win){
  const all=v315AllExams(type),list=win>0?all.slice(-win):all,last=all[all.length-1]||null,prev=all[all.length-2]||null;
  const avg=list.length?r2(list.reduce((a,d)=>a+(+d.totalNet||0),0)/list.length):null;
  const best=list.length?list.reduce((a,b)=>(+b.totalNet||0)>(+a.totalNet||0)?b:a):null;
  const delta=last&&prev?r2((+last.totalNet||0)-(+prev.totalNet||0)):null;
  return {all,list,last,prev,avg,best,delta};
}
function v315TrendSVG(list){
  if(!list.length)return '<div class="v315-chart-empty">Bu türde deneme eklediğinde net grafiğin burada oluşacak.</div>';
  const show=list.slice(-10),vals=show.map(d=>+d.totalNet||0),W=720,H=250,L=46,R=18,T=18,B=44;
  let lo=Math.min(...vals),hi=Math.max(...vals);if(hi-lo<8){const m=(hi+lo)/2;lo=m-4;hi=m+4;}lo=Math.floor(lo-1);hi=Math.ceil(hi+1);
  const x=i=>L+(show.length===1?(W-L-R)/2:i*(W-L-R)/(show.length-1));const y=v=>T+(hi-v)*(H-T-B)/(hi-lo||1);
  const pts=show.map((d,i)=>[x(i),y(+d.totalNet||0),d]);
  let h='<svg class="v315-trend-svg" viewBox="0 0 '+W+' '+H+'" role="img" aria-label="Son denemelerin net grafiği">';
  for(let i=0;i<4;i++){const yy=T+i*(H-T-B)/3,lab=r2(hi-i*(hi-lo)/3);h+='<line x1="'+L+'" y1="'+yy+'" x2="'+(W-R)+'" y2="'+yy+'" style="stroke:var(--sep);stroke-width:1"/><text x="'+(L-8)+'" y="'+(yy+4)+'" text-anchor="end" style="fill:var(--label-3);font-size:11px">'+lab+'</text>';}
  if(pts.length>1){h+='<polyline fill="none" points="'+pts.map(p=>p[0]+','+p[1]).join(' ')+'" style="stroke:var(--accent);stroke-width:3;stroke-linecap:round;stroke-linejoin:round"/>';}
  pts.forEach((p,i)=>{const d=p[2],dt=String(d.date||"").slice(5).replace('-','/');h+='<circle cx="'+p[0]+'" cy="'+p[1]+'" r="5" style="fill:var(--accent);stroke:var(--card);stroke-width:2"><title>'+esc((d.name||'Deneme')+' · '+v315Fmt(d.totalNet)+' net')+'</title></circle><text x="'+p[0]+'" y="'+(H-17)+'" text-anchor="middle" style="fill:var(--label-3);font-size:10px">'+esc(dt)+'</text>';});
  h+='</svg>';return h;
}
function v315WrongRows(list){
  const ids=new Set(list.map(d=>d.id)),m=new Map();
  (Array.isArray(S.wrongLog)?S.wrongLog:[]).forEach(w=>{if(!w||!ids.has(w.deneme))return;const subj=String(w.subject||"Ders"),topic=String(w.topic||"Konu"),key=subj+"\u0000"+topic,n=Math.max(1,parseInt(w.n,10)||1),cur=m.get(key)||{subject:subj,topic:topic,n:0};cur.n+=n;m.set(key,cur);});
  return Array.from(m.values()).sort((a,b)=>b.n-a.n||a.topic.localeCompare(b.topic,'tr')).slice(0,5);
}
function v315RenderWrong(list){
  const w=el("v315WrongTopics");if(!w)return;const rows=v315WrongRows(list);
  if(!rows.length){w.innerHTML='<div class="empty">Deneme analizinde yanlışlarını konuya bağladıkça en çok hata yaptığın 5 konu burada sıralanacak.</div>';return;}
  const mx=rows[0].n||1;w.innerHTML=rows.map((r,i)=>'<div class="v315-topic-row"><div class="v315-topic-main"><b>'+(i+1)+'. '+esc(r.topic)+'</b><small>'+esc(r.subject)+'</small><div class="v315-topic-bar"><i style="width:'+Math.max(8,Math.round(r.n/mx*100))+'%"></i></div></div><div class="v315-topic-count">'+r.n+'</div></div>').join('')+'<p class="hint" style="margin:10px 0 0">Yalnızca denemeye bağladığın yanlışlar sayılır.</p>';
}
function v315SubjectRows(list,all){
  const m=new Map();list.forEach(d=>v315Subjects(d).forEach(r=>{if(!r||!r.name)return;const k=r.name,x=m.get(k)||{name:k,sum:0,n:0,d:0,y:0,b:0,cap:0};x.sum+=+r.net||0;x.n++;x.d+=+r.d||0;x.y+=+r.y||0;x.b+=+r.b||0;x.cap+=+r.cap||0;m.set(k,x)}));
  const last=all[all.length-1],prev=all[all.length-2],lastMap=new Map(v315Subjects(last).map(r=>[r.name,r])),prevMap=new Map(v315Subjects(prev).map(r=>[r.name,r]));
  return Array.from(m.values()).map(x=>{const lr=lastMap.get(x.name),pr=prevMap.get(x.name),delta=lr&&pr?r2((+lr.net||0)-(+pr.net||0)):null,avg=r2(x.sum/x.n),avgCap=x.cap/x.n,pct=avgCap?Math.round(avg/avgCap*100):null;return {...x,avg,delta,pct};}).sort((a,b)=>(b.pct??-999)-(a.pct??-999)||b.avg-a.avg);
}
function v315RenderSubjects(list,all){
  const w=el("v315SubjectPerformance");if(!w)return;const rows=v315SubjectRows(list,all);
  if(!rows.length){w.innerHTML='<div class="empty">Ders bazlı sonuç girdikçe hangi dersin yükseldiği ve düştüğü burada görünecek.</div>';return;}
  const changed=rows.filter(x=>x.delta!==null),rise=changed.length?changed.reduce((a,b)=>b.delta>a.delta?b:a):null,fall=changed.length?changed.reduce((a,b)=>b.delta<a.delta?b:a):null;
  let h='<div class="v315-signal-grid"><div class="v315-signal"><small>En çok yükselen</small><b class="v315-change '+(rise&&rise.delta>0?'good':'')+'">'+(rise&&rise.delta>0?esc(rise.name)+' · +'+rise.delta:'Henüz belirgin artış yok')+'</b></div><div class="v315-signal"><small>En çok düşen</small><b class="v315-change '+(fall&&fall.delta<0?'bad':'')+'">'+(fall&&fall.delta<0?esc(fall.name)+' · '+fall.delta:'Henüz belirgin düşüş yok')+'</b></div></div>';
  h+='<table class="v315-subject-table"><tr><th>Ders</th><th>Ort. net</th><th>Başarı</th><th>Son fark</th></tr>'+rows.map(x=>'<tr><td><b>'+esc(x.name)+'</b></td><td>'+v315Fmt(x.avg)+'</td><td>'+(x.pct===null?'—':'%'+x.pct)+'</td><td class="v315-change '+(x.delta>0?'good':x.delta<0?'bad':'')+'">'+(x.delta===null?'—':(x.delta>0?'+':'')+x.delta)+'</td></tr>').join('')+'</table>';
  w.innerHTML=h;
}
function v315RenderBalance(list){
  const w=el("v315Balance"),meta=el("v315BalanceMeta");if(!w)return;let D=0,Y=0,B=0,known=0,dur=0,durN=0;
  list.forEach(d=>{let kd=0,ky=0,kb=0;v315Subjects(d).forEach(r=>{kd+=+r.d||0;ky+=+r.y||0;kb+=+r.b||0});if(kd+ky+kb>0&&!d.netOnly){D+=kd;Y+=ky;B+=kb;known++}if(+d.dur>0){dur+=+d.dur;durN++}});
  if(meta)meta.textContent=list.length+(list.length===1?' deneme':' deneme');
  if(!list.length){w.innerHTML='<div class="empty">Deneme verisi bekleniyor.</div>';return;}
  const avgNet=r2(list.reduce((a,d)=>a+(+d.totalNet||0),0)/list.length),q=D+Y+B,correct=q?Math.round(D/q*100):null,blank=q?Math.round(B/q*100):null;
  let h=known?'<div class="v315-balance-grid"><div class="v315-balance-stat"><small>Doğru</small><b>'+r2(D/known)+'</b></div><div class="v315-balance-stat"><small>Yanlış</small><b>'+r2(Y/known)+'</b></div><div class="v315-balance-stat"><small>Boş</small><b>'+r2(B/known)+'</b></div></div>':'<div class="empty" style="margin-bottom:8px">Doğru / yanlış / boş için ayrıntılı sonuç girişi gerekli.</div>';
  h+='<div class="v315-balance-line"><span>Ortalama net</span><b>'+v315Fmt(avgNet)+'</b></div><div class="v315-balance-line"><span>Doğru oranı</span><b>'+(correct===null?'—':'%'+correct)+'</b></div><div class="v315-balance-line"><span>Boş oranı</span><b>'+(blank===null?'—':'%'+blank)+'</b></div><div class="v315-balance-line"><span>Ortalama süre</span><b>'+(durN?r2(dur/durN)+' dk':'—')+'</b></div>';
  w.innerHTML=h;
}
function renderV315Dashboard(){
  const root=el("v315Dashboard");if(!root||typeof S==="undefined")return false;const st=v315ExamStats(v315DashType,v315DashWindow),k=el("v315Kpis"),trend=el("v315Trend"),tm=el("v315TrendMeta");
  ["TYT","AYT","YDT","BRANS"].forEach(x=>{const b=el("v315t"+x);if(b)b.classList.toggle("on",x===v315DashType)});[["v315w5",5],["v315w10",10],["v315wAll",0]].forEach(x=>{const b=el(x[0]);if(b)b.classList.toggle("on",x[1]===v315DashWindow)});
  if(k){if(!st.list.length)k.innerHTML=v315KpiHTML('Son net','—','Henüz kayıt yok')+v315KpiHTML('Ortalama','—','Veri bekleniyor')+v315KpiHTML('En iyi','—','Veri bekleniyor')+v315KpiHTML('Net değişimi','—','İki deneme gerekli');else{const ds=st.delta===null?'İki deneme gerekli':(st.delta>0?'Öncekiye göre yükseldi':st.delta<0?'Öncekiye göre düştü':'Öncekiyle aynı'),dc=st.delta>0?'good':st.delta<0?'bad':'';k.innerHTML=v315KpiHTML('Son net',v315Fmt(st.last.totalNet),String(st.last.name||v315TypeLabel(v315DashType)))+v315KpiHTML((v315DashWindow?('Son '+st.list.length):'Tüm')+' ort.',v315Fmt(st.avg),st.list.length+' kayıt')+v315KpiHTML('En iyi',v315Fmt(st.best&&st.best.totalNet),st.best?String(st.best.name||''):'')+v315KpiHTML('Net değişimi',st.delta===null?'—':(st.delta>0?'+':'')+st.delta,ds,dc);}}
  if(trend)trend.innerHTML=v315TrendSVG(st.list);if(tm)tm.textContent=v315TypeLabel(v315DashType)+' · '+(v315DashWindow?('son '+st.list.length):('tüm '+st.list.length));
  v315RenderWrong(st.list);v315RenderSubjects(st.list,st.all);v315RenderBalance(st.list);return true;
}
function runV315SelfTest(){
  const checks=[],add=(n,o)=>checks.push([n,!!o]),keep=S,kt=v315DashType,kw=v315DashWindow;
  try{
    const t=normalize(JSON.parse(JSON.stringify(DEF))),T=todayKey();S=t;
    for(let i=0;i<6;i++)t.denemeler.push({id:31500+i,type:'TYT',name:'D '+i,date:addDaysKey(T,-(35-i*7)),dur:150-i,totalNet:60+i*3,subjectResults:[{name:'Türkçe',d:30+i,y:6-i,b:4,net:r2(28.5+i*1.25),cap:40},{name:'Temel Matematik',d:20+i,y:8,b:12-i,net:r2(18+i),cap:40}]});
    t.wrongLog=[{id:1,date:T,subject:'Matematik',topic:'Problemler',n:4,deneme:31505},{id:2,date:T,subject:'Türkçe',topic:'Paragraf',n:2,deneme:31504}];
    v315DashType='TYT';v315DashWindow=5;const st=v315ExamStats('TYT',5);add('stats',st.list.length===5&&st.last.totalNet===75&&st.delta===3);add('wrong',v315WrongRows(st.list)[0].topic==='Problemler');const sr=v315SubjectRows(st.list,st.all);add('subject',sr.length===2&&sr.some(x=>x.delta!==null));add('svg',v315TrendSVG(st.list).includes('<svg'));add('html',!!el('v315Dashboard')&&!!el('v315ExamFormCard'));renderV315Dashboard();add('render',el('v315Kpis').textContent.includes('75')&&el('v315WrongTopics').textContent.includes('Problemler'));
  }catch(e){checks.push(['exception',false]);try{infraError('v315-selftest',e)}catch(_){}}
  finally{S=keep;v315DashType=kt;v315DashWindow=kw;try{renderV315Dashboard()}catch(e){}}
  const ok=checks.every(x=>x[1]);document.documentElement.setAttribute('data-v315-selftest',ok?'ok':'fail');let o=el('v315SelfTestResult');if(!o){o=document.createElement('pre');o.id='v315SelfTestResult';o.hidden=true;document.body.appendChild(o)}o.textContent=(ok?'YKS_V315_SELFTEST_OK':'YKS_V315_SELFTEST_FAIL')+' '+checks.map(x=>x[0]+':'+(x[1]?'ok':'fail')).join(',');return {ok,checks};
}
window.renderV315Dashboard=renderV315Dashboard;window.runV315SelfTest=runV315SelfTest;
/* Var olan Deneme 2.0 render akışına bağlan; kayıt/silme/düzenleme sonrası dashboard otomatik güncellensin. */
try{const __v315Exam2=renderExam2;renderExam2=function(){const r=__v315Exam2.apply(this,arguments);try{renderV315Dashboard()}catch(e){try{infraError('v315-render',e)}catch(_){}}return r;};}catch(e){}
/* Yanlışlar güncellendiğinde üst 5 konu anında yenilensin. */
try{const __v315Wrong=renderWrongTopics;renderWrongTopics=function(){const r=__v315Wrong.apply(this,arguments);if(typeof currentScreen!=="function"||currentScreen()==="deneme")try{renderV315Dashboard()}catch(e){}return r;};}catch(e){}
/* Genel self-test zincirine v3.2.5'i ekle. */
try{const __v315Built=runBuiltInSelfTest;runBuiltInSelfTest=function(){const r=__v315Built();const x=runV315SelfTest();if(!x.ok){document.documentElement.setAttribute('data-selftest','fail');const o=el('selfTestResult');if(o)o.textContent='YKS_SELFTEST_FAIL'}return r;};}catch(e){}
const v315Start=()=>{try{renderV315Dashboard();closeV315ExamForm(false)}catch(e){try{infraError('v315-start',e)}catch(_){}}};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(v315Start,60),{once:true});else setTimeout(v315Start,60);
try{const q=new URLSearchParams(location.search).get('selftest');if(q==='v315')setTimeout(runV315SelfTest,520)}catch(e){}

/* ---- legacy-block-8 ---- */
/* ==================================================================
   YKS Defterim v3.2.5 — Odak Bahçesi
   Ödül ve seviye verileri mevcut S.sessions kayıtlarından türetilir.
   Bu eski özellik bölümü yeni öğrenme verisi nedeniyle şema 20 içinde çalışır.
   ================================================================== */
const V317_VERSION="3.2.5";
let v317LastPlantCount=null,v317LastRenderSig="";
const V317_LEVELS=[
  {min:0,name:"Tohum",reward:"İlk filizler"},
  {min:80,name:"Fidanlık",reward:"Fidanlık rozeti"},
  {min:220,name:"Koru",reward:"Koru rozeti"},
  {min:500,name:"Orman",reward:"Orman rozeti"},
  {min:1000,name:"Kadim Koru",reward:"Kadim Koru rozeti"},
  {min:1800,name:"YKS Bahçesi",reward:"YKS Bahçesi rozeti"}
];
function v317QualifyingSessions(){
  const out=[];if(typeof S==="undefined"||!S||!S.sessions||typeof S.sessions!=="object")return out;
  Object.keys(S.sessions).filter(day=>validDateKey(day)).sort().forEach(day=>{
    const rows=Array.isArray(S.sessions[day])?S.sessions[day]:[];
    rows.forEach((x,i)=>{
      const m=Math.max(0,Math.min(1440,Math.floor(Number(x&&x.m)||0)));
      if(x&&x.type==="work"&&x.done===true&&m>=10)out.push(Object.assign({day:day,_i:i,m:m},x));
    });
  });
  return out;
}
function v317SessionLeaves(x){
  const m=Math.max(0,Math.min(1440,Math.floor(Number(x&&x.m)||0)));
  if(!x||x.type!=="work"||x.done!==true||m<10)return 0;
  const score=Math.max(0,Math.min(100,Math.floor(Number(x.focusScore)||0))),ints=Math.max(0,Math.min(99,Math.floor(Number(x.interruptions)||0)));
  let p=Math.max(2,Math.floor(m/5)*2);
  if(score>=80)p+=2;if(score>=90)p+=2;if(ints===0)p+=1;
  const g=Math.max(0,Math.min(1000,Math.floor(Number(x.goalQ)||0))),a=Math.max(0,Math.min(1000,Math.floor(Number(x.actualQ)||0)));
  if(g>0&&a>=g)p+=2;
  return Math.max(0,Math.min(600,p));
}
function v317GardenData(){
  const list=v317QualifyingSessions(),leaves=list.reduce((a,x)=>a+v317SessionLeaves(x),0),today=typeof todayKey==="function"?todayKey():"";
  let streak=0,k=validDateKey(today)?today:"";
  const days=new Set(list.map(x=>x.day).filter(validDateKey));
  if(k&&!days.has(k)&&typeof addDaysKey==="function")k=addDaysKey(k,-1);
  while(k&&validDateKey(k)&&days.has(k)&&streak<1000&&typeof addDaysKey==="function"){streak++;k=addDaysKey(k,-1)}
  let level=V317_LEVELS[0],next=null;
  for(let i=0;i<V317_LEVELS.length;i++){if(leaves>=V317_LEVELS[i].min)level=V317_LEVELS[i];else{next=V317_LEVELS[i];break}}
  const li=V317_LEVELS.indexOf(level),base=level.min,ceil=next?next.min:Math.max(base+1,leaves),pct=next?Math.max(0,Math.min(100,Math.round((leaves-base)/(ceil-base)*100))):100;
  return {list,leaves,streak,level,next,pct,levelIndex:li};
}
function v317PlantType(x){
  const m=Math.max(0,Math.min(1440,Math.floor(Number(x&&x.m)||0))),score=Math.max(0,Math.min(100,Math.floor(Number(x&&x.focusScore)||0))),ints=Math.max(0,Math.min(99,Math.floor(Number(x&&x.interruptions)||0)));
  if(score>=90&&ints===0&&m>=25)return "star";
  if(m>=60)return "oak";
  if(m>=40)return "pine";
  if(m>=25)return "sapling";
  return "seed";
}
function v317PlantName(t){return t==="star"?"Yıldız ağacı":t==="oak"?"Meşe":t==="pine"?"Çam":t==="sapling"?"Fidan":"Filiz"}
function v317PlantSVG(t){
  if(t==="seed")return '<svg viewBox="0 0 64 110" aria-hidden="true"><path class="trunk" d="M29 97h6V51h-6z"/><ellipse class="leaf" cx="21" cy="52" rx="14" ry="8" transform="rotate(-28 21 52)"/><ellipse class="leaf" cx="43" cy="41" rx="14" ry="8" transform="rotate(28 43 41)"/><ellipse class="leaf" cx="31" cy="29" rx="11" ry="15"/></svg>';
  if(t==="sapling")return '<svg viewBox="0 0 70 130" aria-hidden="true"><path class="trunk" d="M31 116h8L42 63h-13z"/><circle class="leaf" cx="24" cy="58" r="19"/><circle class="leaf" cx="47" cy="57" r="20"/><circle class="leaf" cx="35" cy="36" r="22"/></svg>';
  if(t==="pine")return '<svg viewBox="0 0 72 140" aria-hidden="true"><path class="trunk" d="M32 125h9l2-31H30z"/><path class="leaf" d="M36 12L13 60h14L9 94h54L45 60h14z"/></svg>';
  if(t==="oak")return '<svg viewBox="0 0 82 145" aria-hidden="true"><path class="trunk" d="M35 132h13l3-48H31z"/><circle class="leaf" cx="25" cy="67" r="24"/><circle class="leaf" cx="57" cy="65" r="25"/><circle class="leaf" cx="41" cy="39" r="29"/><circle class="leaf" cx="42" cy="76" r="26"/></svg>';
  return '<svg viewBox="0 0 84 146" aria-hidden="true"><path class="trunk" d="M36 133h12l4-47H32z"/><circle class="leaf" cx="25" cy="68" r="24"/><circle class="leaf" cx="59" cy="66" r="25"/><circle class="leaf" cx="42" cy="40" r="30"/><circle class="leaf" cx="43" cy="78" r="25"/><path class="spark" d="M68 20l3 8 8 3-8 3-3 8-3-8-8-3 8-3zM13 37l2 5 5 2-5 2-2 5-2-5-5-2 5-2z"/></svg>';
}
function v317DayLabel(day,today){
  if(day===today)return "Bugün";
  if(!validDateKey(day))return "Tarih yok";
  try{const d=parseKey(day);return Number.isFinite(d.getTime())?d.toLocaleDateString("tr-TR",{day:"numeric",month:"short"}):day}catch(e){return day}
}
function v317RenderGarden(){
  const root=el("v317Garden");if(!root)return false;const d=v317GardenData(),plants=el("v317GardenPlants"),empty=el("v317GardenEmpty");
  const lv=el("v317GardenLevel"),leaf=el("v317Leaves"),tree=el("v317Trees"),st=el("v317GardenStreak"),next=el("v317NextReward"),pct=el("v317NextPct"),bar=el("v317LevelBar"),un=el("v317Unlocks");
  if(lv)lv.textContent=d.level.name;if(leaf)leaf.textContent=String(d.leaves);if(tree)tree.textContent=String(d.list.length);if(st)st.textContent=String(d.streak);
  if(next)next.textContent=d.next?("Sonraki: "+d.next.name+" · "+(d.next.min-d.leaves)+" yaprak"):("En yüksek seviye · "+d.level.name);
  if(pct)pct.textContent=d.pct+"%";if(bar)bar.style.width=d.pct+"%";
  const unlockSig=d.levelIndex+"|"+d.leaves;
  if(un&&un.dataset.sig!==unlockSig){un.innerHTML=V317_LEVELS.slice(1).map(x=>'<span class="v317-unlock '+(d.leaves>=x.min?'on':'')+'"><span>'+(d.leaves>=x.min?'✓':'◇')+'</span>'+esc(x.name)+' <span class="lock">'+x.min+'</span></span>').join('');un.dataset.sig=unlockSig;}
  const recent=d.list.slice(-12),animate=v317LastPlantCount!==null&&d.list.length>v317LastPlantCount,today=typeof todayKey==="function"?todayKey():"";
  const renderSig=d.list.length+"|"+recent.map(x=>[x.day,x._i,x.m,x.subj,x.focusScore,x.interruptions].join("~")).join(";");
  if(plants&&(v317LastRenderSig!==renderSig||plants.children.length!==recent.length)){
    plants.innerHTML=recent.map((x,i)=>{const type=v317PlantType(x),date=v317DayLabel(x.day,today),score=(+x.focusScore||0)>0?" · "+Math.max(0,Math.min(100,Math.floor(Number(x.focusScore)||0)))+"/100":"",title=date+" · "+(x.subj||"Ders")+" · "+x.m+" dk"+score+" · "+v317PlantName(type);return '<div class="v317-plant '+type+(animate&&i===recent.length-1?' new':'')+'" title="'+esc(title)+'" aria-label="'+esc(title)+'">'+v317PlantSVG(type)+'</div>'}).join('');
    v317LastRenderSig=renderSig;
  }
  if(empty)empty.style.display=d.list.length?"none":"block";
  v317LastPlantCount=d.list.length;root.dataset.level=String(d.levelIndex);return true;
}
function runV317SelfTest(){
  const checks=[],add=(n,o)=>checks.push([n,!!o]),keep=S,last=v317LastPlantCount,lastSig=v317LastRenderSig;
  try{
    const t=normalize(JSON.parse(JSON.stringify(DEF))),T=todayKey();S=t;
    t.sessions[T]=[
      {t:Date.now()-7200000,m:25,subj:"Matematik",type:"work",done:true,focusScore:92,interruptions:0,goalQ:20,actualQ:22},
      {t:Date.now()-3600000,m:45,subj:"Türkçe",type:"work",done:true,focusScore:80,interruptions:1},
      {t:Date.now()-1800000,m:9,subj:"Fizik",type:"work",done:true,focusScore:99,interruptions:0},
      {t:Date.now()-900000,m:60,subj:"Kimya",type:"work",done:false,focusScore:90,interruptions:0}
    ];
    t.sessions[addDaysKey(T,-1)]=[{t:Date.now()-86400000,m:30,subj:"Biyoloji",type:"work",done:true,focusScore:75,interruptions:0}];
    const d=v317GardenData();add("version",APP_VERSION==="3.2.5"&&V317_VERSION==="3.2.5"&&DATA_SCHEMA===21);add("qualified",d.list.length===3);add("leaves",d.leaves===v317SessionLeaves(t.sessions[T][0])+v317SessionLeaves(t.sessions[T][1])+v317SessionLeaves(t.sessions[addDaysKey(T,-1)][0]));add("streak",d.streak===2);add("plant",v317PlantType(t.sessions[T][0])==="star"&&v317PlantType(t.sessions[T][1])==="pine");add("garden-removed",!el("v317Garden")&&v317RenderGarden()===false);
  }catch(e){checks.push(["exception",false]);try{infraError("v317-selftest",e)}catch(_){}}
  finally{S=keep;v317LastPlantCount=last;v317LastRenderSig=lastSig;try{v317RenderGarden()}catch(e){}}
  const ok=checks.every(x=>x[1]);document.documentElement.setAttribute("data-v317-selftest",ok?"ok":"fail");let o=el("v317SelfTestResult");if(!o){o=document.createElement("pre");o.id="v317SelfTestResult";o.hidden=true;document.body.appendChild(o)}o.textContent=(ok?"YKS_V317_SELFTEST_OK":"YKS_V317_SELFTEST_FAIL")+" "+checks.map(x=>x[0]+":"+(x[1]?"ok":"fail")).join(",");return {ok,checks};
}
/* Mevcut Odak render zincirine yalnız salt-okuma bahçe çizimini ekle. */
try{const __v317Focus=v29RenderAllFocus;v29RenderAllFocus=function(){const r=__v317Focus.apply(this,arguments);try{v317RenderGarden()}catch(e){try{infraError("v317-garden-render",e)}catch(_){}}return r;};}catch(e){}
try{const __v317Built=runBuiltInSelfTest;runBuiltInSelfTest=function(){const r=__v317Built();const x=runV317SelfTest();if(!x.ok){document.documentElement.setAttribute("data-selftest","fail");const o=el("selfTestResult");if(o)o.textContent="YKS_SELFTEST_FAIL"}return r;};}catch(e){}
window.v317RenderGarden=v317RenderGarden;window.runV317SelfTest=runV317SelfTest;
const v317Start=()=>{try{v317RenderGarden()}catch(e){try{infraError("v317-start",e)}catch(_){}}};
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",()=>setTimeout(v317Start,90),{once:true});else setTimeout(v317Start,90);
try{const q=new URLSearchParams(location.search).get("selftest");if(q==="v317")setTimeout(runV317SelfTest,620)}catch(e){}

/* ---- legacy-block-9 ---- */
/* ==================================================================
   YKS Defterim v3.2.5 — sağlamlaştırma regresyonları
   Veri şeması değişmez; yalnız bozuk girdi toleransı ve render/PWA güvenliği.
   ================================================================== */
const V318_VERSION="3.2.5";
function runV318SelfTest(){
  const checks=[],add=(n,o)=>checks.push([n,!!o]),keep=S,last=v317LastPlantCount,lastSig=v317LastRenderSig;
  try{
    add("version",APP_VERSION===V318_VERSION&&DATA_SCHEMA===21);
    add("date-valid",validDateKey("2026-08-24")&&!validDateKey("2026-02-31")&&!validDateKey("x"));
    const raw=JSON.parse(JSON.stringify(DEF)),T=todayKey();
    raw.sessions["2026-02-31"]=[{m:999999,type:"work",done:true}];
    raw.sessions[T]=[{t:Date.now(),m:999999,subj:"X".repeat(200),task:"Y".repeat(300),type:"work",done:true,focusScore:999,interruptions:999,reasons:{phone:999},goalQ:9999,actualQ:9999}];
    const n=normalize(raw);
    add("normalize-invalid-day",!n.sessions["2026-02-31"]);
    add("normalize-clamp",n.sessions[T][0].m===1440&&n.sessions[T][0].focusScore===100&&n.sessions[T][0].interruptions===99&&n.sessions[T][0].reasons.phone===99&&n.sessions[T][0].subj.length===80&&n.sessions[T][0].task.length===160);
    S=n;v317LastPlantCount=null;v317LastRenderSig="";
    add("garden-removed",!el("v317Garden")&&v317RenderGarden()===false);
  }catch(e){checks.push(["exception",false]);try{infraError("v318-selftest",e)}catch(_){}}
  finally{S=keep;v317LastPlantCount=last;v317LastRenderSig=lastSig;try{perfInvalidateState();v317RenderGarden()}catch(e){}}
  const ok=checks.every(x=>x[1]);document.documentElement.setAttribute("data-v318-selftest",ok?"ok":"fail");
  let o=el("v318SelfTestResult");if(!o){o=document.createElement("pre");o.id="v318SelfTestResult";o.hidden=true;document.body.appendChild(o)}
  o.textContent=(ok?"YKS_V318_SELFTEST_OK":"YKS_V318_SELFTEST_FAIL")+" "+checks.map(x=>x[0]+":"+(x[1]?"ok":"fail")).join(",");return {ok,checks};
}
try{const __v318Built=runBuiltInSelfTest;runBuiltInSelfTest=function(){const r=__v318Built();const x=runV318SelfTest();if(!x.ok){document.documentElement.setAttribute("data-selftest","fail");const o=el("selfTestResult");if(o)o.textContent="YKS_SELFTEST_FAIL"}return r;};}catch(e){}
window.runV318SelfTest=runV318SelfTest;
try{const q=new URLSearchParams(location.search).get("selftest");if(q==="v318")setTimeout(runV318SelfTest,720)}catch(e){}

/* ---- legacy-block-10 ---- */
/* ==================================================================
   YKS Defterim v3.2.5 — Büyük Günün Sözü + Başarı & Ödül Merkezi
   Tüm ödüller mevcut kayıtların salt-okuma türevleridir; uygulama şeması 20'dir.
   ================================================================== */
const V319_VERSION="3.2.5";

renderSoz=function(){
  const w=el("sozBox");if(!w)return false;
  if(S.sozKapali){w.style.display="none";return true}
  w.style.display="flex";const soz=SOZLER[aktifSozIndex()];if(!soz)return false;
  w.innerHTML='<span class="szwrap"><span class="szlabel">Günün sözü <span class="szcat">'+esc(soz.c||"Söz")+'</span></span><span class="sz">“'+esc(soz.q)+'”</span><span class="sza">— '+esc(soz.a||"Anonim")+'</span></span><button class="szr" type="button" onclick="yeniSoz()" title="Başka bir söz" aria-label="Başka bir söz">↻</button>';
  return true;
};

function v319XpForLevel(level){level=Math.max(1,Math.min(60,level|0));return 180*(level-1)*(level-1)}
function v319Tier(level){if(level>=30)return "Zirve";if(level>=22)return "Ustalık";if(level>=15)return "İstikrar";if(level>=9)return "Ritim";if(level>=5)return "Gelişim";return "Başlangıç"}
function v319RewardData(){
  const q=Math.max(0,Math.floor(Number(totalSolved())||0)),mins=Math.max(0,Math.floor(Number(totalMinutes())||0)),exams=Math.max(0,(S.denemeler||[]).length),topics=Math.max(0,fullTopicCount()),reviews=Math.max(0,completedReviewCount());
  const sessions=(typeof v317QualifyingSessions==="function"?v317QualifyingSessions():[]),leaves=typeof v317GardenData==="function"?v317GardenData().leaves:0,star=sessions.reduce((a,x)=>a+(typeof v317PlantType==="function"&&v317PlantType(x)==="star"?1:0),0);
  const parts={question:Math.floor(q/5),focus:Math.floor(mins/2),exam:exams*80,topic:topics*45,review:reviews*12,session:sessions.length*10};
  const xp=Object.values(parts).reduce((a,n)=>a+n,0);let level=1;while(level<60&&xp>=v319XpForLevel(level+1))level++;
  const base=v319XpForLevel(level),next=v319XpForLevel(Math.min(60,level+1)),pct=level>=60?100:Math.max(0,Math.min(100,Math.round((xp-base)/Math.max(1,next-base)*100)));
  return {q,mins,exams,topics,reviews,sessions,leaves,star,parts,xp,level,tier:v319Tier(level),base,next,pct};
}
const V319_DECORS=[
  {id:"path",ic:"🪨",name:"Taş yol",desc:"7 gün odak serisi",ok:d=>v317GardenData().streak>=7,html:'<div class="v319-decor-path"></div>'},
  {id:"bird",ic:"🐦",name:"Kuş ziyaretçisi",desc:"25 nitelikli odak oturumu",ok:d=>d.sessions.length>=25,html:'<div class="v319-decor-bird">⌁</div>'},
  {id:"bench",ic:"🪑",name:"Bahçe bankı",desc:"50 nitelikli odak oturumu",ok:d=>d.sessions.length>=50,html:'<div class="v319-decor-bench"></div>'},
  {id:"pond",ic:"💧",name:"Küçük gölet",desc:"500 yaprak",ok:d=>d.leaves>=500,html:'<div class="v319-decor-pond"></div>'},
  {id:"lamp",ic:"🏮",name:"Bahçe feneri",desc:"14 gün odak serisi",ok:d=>v317GardenData().streak>=14,html:'<div class="v319-decor-lamp"></div>'},
  {id:"gazebo",ic:"🏡",name:"Çardak",desc:"100 saat toplam odak",ok:d=>d.mins>=6000,html:'<div class="v319-decor-gazebo"></div>'},
  {id:"stars",ic:"✨",name:"Yıldız taşları",desc:"10 Yıldız Ağacı",ok:d=>d.star>=10,html:'<div class="v319-decor-stars">✦ ✧ ✦</div>'}
];
function v319DecorData(d){d=d||v319RewardData();return V319_DECORS.map(x=>Object.assign({},x,{unlocked:!!x.ok(d)}))}
function v319RenderGardenDecor(){const w=el("v319GardenDecor");if(!w)return false;const d=v319RewardData(),a=v319DecorData(d),sig=a.map(x=>x.id+":"+(x.unlocked?1:0)).join("|");if(w.dataset.sig===sig)return true;w.innerHTML=a.filter(x=>x.unlocked).map(x=>x.html).join("");w.dataset.sig=sig;return true}

function v319DayActivity(k){const m=Math.max(0,Number((S.pomoMin||{})[k])||0),q=Math.max(0,Number((S.solved||{})[k])||0);return {m,q,score:m+q*.45}}
function v319YearCells(){const end=todayKey(),start=addDaysKey(end,-364),out=[];for(let i=0;i<365;i++){const k=addDaysKey(start,i),a=v319DayActivity(k);out.push({k,...a})}return out}
function v319HeatLevel(score){if(score<=0)return 0;if(score<45)return 1;if(score<100)return 2;if(score<190)return 3;return 4}
function v319RenderYearHeat(){
  const w=el("v319YearHeat"),st=el("v319YearStats");if(!w)return false;const a=v319YearCells(),sig=a.map(x=>x.m+":"+x.q).join("|");
  if(w.dataset.sig!==sig){w.innerHTML=a.map(x=>'<span class="v319-heat-cell l'+v319HeatLevel(x.score)+'" title="'+esc(parseKey(x.k).toLocaleDateString("tr-TR",{day:"numeric",month:"short",year:"numeric"})+" · "+x.m+" dk · "+x.q+" soru")+'"></span>').join("");w.dataset.sig=sig}
  if(st){const active=a.filter(x=>x.score>0).length,totalM=a.reduce((z,x)=>z+x.m,0),totalQ=a.reduce((z,x)=>z+x.q,0);st.textContent=active+" aktif gün · "+fmtHM(totalM)+" · "+totalQ+" soru"}return true;
}
function v319RenderDecorations(){const w=el("v319Decorations");if(!w)return false;const d=v319RewardData(),a=v319DecorData(d);w.innerHTML='<div class="v319-decor-grid">'+a.map(x=>'<div class="v319-decor-item '+(x.unlocked?'on':'')+'"><div class="v319-decor-icon">'+x.ic+'</div><div><b>'+esc(x.name)+(x.unlocked?' ✓':'')+'</b><span>'+esc(x.desc)+'</span></div></div>').join('')+'</div>';return true}
function v319RenderRewardCenter(){
  v319RenderYearHeat();return true;
}
function v319RenderHomeReward(){
  return false;
}

(function v319ExtendBadges(){
  /* Ödül ve rozet üretimi sade arayüzde devre dışıdır. */
})();

try{const __v319Home=renderHome;renderHome=function(){const r=__v319Home.apply(this,arguments);try{renderSoz();v319RenderHomeReward()}catch(e){infraError("v319-home",e)}return r}}catch(e){}
try{const __v319Badges=renderBadges;renderBadges=function(){const r=__v319Badges.apply(this,arguments);try{v319RenderRewardCenter()}catch(e){infraError("v319-reward",e)}return r}}catch(e){}
try{const __v319Garden=v317RenderGarden;v317RenderGarden=function(){const r=__v319Garden.apply(this,arguments);try{v319RenderGardenDecor()}catch(e){infraError("v319-garden-decor",e)}return r};window.v317RenderGarden=v317RenderGarden}catch(e){}

function runV319SelfTest(){
  const checks=[],add=(n,o)=>checks.push([n,!!o]),keep=S,idx=sozCurrentIndex;
  try{
    add("version",APP_VERSION==="3.2.5"&&V319_VERSION==="3.2.5"&&DATA_SCHEMA===21);
    add("quotes-1000",SOZLER.length===1000&&new Set(SOZLER.map(x=>x.q)).size===1000&&new Set(SOZLER.map(x=>x.a)).size>=100&&!SOZLER.some(x=>!x.a||/^(anonim|anonymous|unknown|bilinmiyor|atasözü|atasozu|yks defterim)$/i.test(String(x.a).trim())));
    const histKeep=sozRecentAuthors.slice(),idxKeep=sozCurrentIndex;let authorGuardOk=true;sozRecentAuthors=[];sozCurrentIndex=-1;let last=[];for(let i=0;i<1200;i++){sozSetRandom(sozCurrentIndex);const a=sozAuthorKey(SOZLER[sozCurrentIndex]);if(last.includes(a)){authorGuardOk=false;break}last.push(a);if(last.length>3)last.shift()}sozRecentAuthors=histKeep;sozCurrentIndex=idxKeep;add("author-guard-3",authorGuardOk);
    add("quote-hero",!!el("sozBox")&&renderSoz()&&el("sozBox").textContent.includes("Günün sözü"));
    const t=normalize(JSON.parse(JSON.stringify(DEF))),T=todayKey();S=t;t.solved[T]=500;t.pomoMin[T]=120;t.sessions[T]=[{t:Date.now(),m:30,subj:"Matematik",type:"work",done:true,focusScore:95,interruptions:0}];t.denemeler.push({id:1,date:T,name:"Test",type:"TYT",totalNet:50,subjectResults:[]});perfInvalidateState();
    add("rewards-removed",!el("v319HomeReward")&&!el("v319RewardCenter")&&!el("badgeList")&&!el("v317Garden"));add("heat",v319YearCells().length===365&&v319HeatLevel(0)===0&&v319HeatLevel(250)===4);v319RenderRewardCenter();add("render",!!el("v319YearHeat")&&el("v319YearHeat").children.length===365);
  }catch(e){checks.push(["exception",false]);try{infraError("v319-selftest",e)}catch(_){}}finally{S=keep;sozCurrentIndex=idx;try{perfInvalidateState();renderSoz();v319RenderRewardCenter();v319RenderHomeReward();v317RenderGarden()}catch(e){}}
  const ok=checks.every(x=>x[1]);document.documentElement.setAttribute("data-v319-selftest",ok?"ok":"fail");let o=el("v319SelfTestResult");if(!o){o=document.createElement("pre");o.id="v319SelfTestResult";o.hidden=true;document.body.appendChild(o)}o.textContent=(ok?"YKS_V319_SELFTEST_OK":"YKS_V319_SELFTEST_FAIL")+" "+checks.map(x=>x[0]+":"+(x[1]?"ok":"fail")).join(",");return {ok,checks};
}
try{const __v319Built=runBuiltInSelfTest;runBuiltInSelfTest=function(){const r=__v319Built();const x=runV319SelfTest();if(!x.ok){document.documentElement.setAttribute("data-selftest","fail");const o=el("selfTestResult");if(o)o.textContent="YKS_SELFTEST_FAIL"}return r}}catch(e){}
window.runV319SelfTest=runV319SelfTest;window.v319RenderRewardCenter=v319RenderRewardCenter;
const v319Start=()=>{try{sozSetRandom(sozIndex());renderSoz();v319RenderHomeReward();v319RenderRewardCenter();v317RenderGarden()}catch(e){try{infraError("v319-start",e)}catch(_){}}};
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",()=>setTimeout(v319Start,120),{once:true});else setTimeout(v319Start,120);
try{const q=new URLSearchParams(location.search).get("selftest");if(q==="v319")setTimeout(runV319SelfTest,850)}catch(e){}
