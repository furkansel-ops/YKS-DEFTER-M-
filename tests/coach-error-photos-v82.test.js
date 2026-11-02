"use strict";
const test=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.resolve(__dirname,"..");
const read=p=>fs.readFileSync(path.join(root,p),"utf8");
const runtime=read("public/student-coaching-runtime.js");
const block=runtime.slice(runtime.indexOf("const PHOTO_META="),runtime.indexOf("function photoThumb"));
function sandbox(){
  return vm.runInNewContext(`const DAY=86400000;const text=(v,n=160)=>String(v??"").trim().slice(0,n);const list=v=>Array.isArray(v)?v:[];const finite=(v,f=0)=>Number.isFinite(Number(v))?Number(v):f;
    const dateKey=d=>d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");${block};({photoCandidates,photoCoachNotes,PHOTO_MAX})`);
}
const day=offset=>{const d=new Date();d.setHours(12,0,0,0);d.setDate(d.getDate()+offset);return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0")};
const img=tag=>"data:image/jpeg;base64,"+tag.repeat(40);

test("v82 koça yalnız çözülmemiş, son 90 günlük yanlışların fotoğrafları gider; bilgi alanları ve imza",()=>{
  const {photoCandidates}=sandbox();
  const s={denemeler:[{id:11,name:"Özdebir TYT-4"}],errorJournal:[{sourceRef:"wrong:3",resolved:true}],wrongLog:[
    {id:1,date:day(-2),subject:"Fizik",topic:"Kuvvet",deneme:11,q:12,kind:"bilmiyordum",note:"Bileşen unuttum",questionImgs:[img("A"),img("B")]},
    {id:2,date:day(-120),subject:"Kimya",topic:"Mol",questionImgs:[img("C")]},
    {id:3,date:day(-1),subject:"Biyoloji",topic:"Hücre",questionImgs:[img("D")]},
    {id:4,date:day(-3),subject:"Tarih",topic:"Osmanlı",resolved:true,questionImgs:[img("E")]},
    {id:5,date:day(-4),subject:"Matematik",topic:"Problemler",questionImgs:["not-an-image"]}
  ]};
  const rows=JSON.parse(JSON.stringify(photoCandidates(s)));
  assert.deepEqual(rows.map(r=>r.photoKey),["1-1","1-0"],"çözülen, eski ve bozuk fotoğraflar gitmez");
  const {image,imageSig,sig,...meta}=rows[1];
  assert.deepEqual(meta,{photoKey:"1-0",wrongId:"1",subject:"Fizik",topic:"Kuvvet",date:day(-2),exam:"11",examName:"Özdebir TYT-4",question:"12",kind:"bilmiyordum",note:"Bileşen unuttum"});
  assert.equal(image,img("A"));assert.match(sig,/^[0-9a-z]+\.[0-9a-z]+$/);assert.equal(sig.split(".")[1],imageSig);
  s.wrongLog[0].note="Yeni not";const changed=JSON.parse(JSON.stringify(photoCandidates(s)))[1];
  assert.notEqual(changed.sig,sig,"not değişince bilgi imzası değişir");assert.equal(changed.imageSig,imageSig,"fotoğraf aynıysa yeniden yüklenmez");
});

test("v82 paylaşım en fazla 150 fotoğraf; koç notu yanlış kaydına göre en yenisi",()=>{
  const {photoCandidates,photoCoachNotes,PHOTO_MAX}=sandbox();
  const many={wrongLog:Array.from({length:80},(_,i)=>({id:100+i,date:day(-1),subject:"Fizik",topic:"T",questionImgs:[img("x"+i),img("y"+i)]}))};
  assert.equal(photoCandidates(many).length,PHOTO_MAX);assert.equal(PHOTO_MAX,150);
  const at=ms=>({toMillis:()=>ms});
  const notes=JSON.parse(JSON.stringify(photoCoachNotes([
    {wrongId:"1",coachComment:"İlk",coachStatus:"review",coachAt:at(10)},{wrongId:"1",coachComment:"Son",coachStatus:"solved",coachAt:at(20)},
    {wrongId:"2",coachComment:"",coachStatus:""},{wrongId:"3",coachComment:"Bak",coachStatus:"hack",coachAt:at(5)}])));
  assert.deepEqual(notes,{"1":{comment:"Son",status:"solved",at:20},"3":{comment:"Bak",status:"",at:5}});
});

test("v82 eşitleme: bağlantı/izin yoksa paylaşılanlar silinir; koç alanlarına dokunulmaz; kural hatasında beklenir",()=>{
  assert.match(runtime,/const wanted=coachUid&&s\.coachPhotoShare!==false\?photoCandidates\(s\):\[\]/);
  assert.match(runtime,/for\(const \[id,row\] of existing\)\{\s*if\(keep\.has\(id\)\|\|row\?\.studentUid!==uid\)continue;\s*await deleteDoc\(doc\(rt\.db,PHOTO_IMAGE,id\)\)/);
  assert.match(runtime,/setDoc\(doc\(rt\.db,PHOTO_META,id\),\{\.\.\.meta,studentUid:uid,coachUid,thumb,updatedAt:serverTimestamp\(\)\},\{merge:true\}\)/);
  assert.doesNotMatch(runtime.slice(runtime.indexOf("async function syncErrorPhotos"),runtime.indexOf("function schedulePhotoSync")),/coachComment|coachStatus/,"öğrenci koç alanlarını yazmaz");
  assert.match(runtime,/rt\.photoBlockedUntil=Date\.now\(\)\+600000/);
  assert.match(runtime,/document\.documentElement\.dataset\.coachShare="ready";\s*delete document\.documentElement\.dataset\.coachShareError;\s*schedulePhotoSync\(\);/);
  assert.match(runtime,/watchErrorPhotos\(session\);/);assert.match(runtime,/version:"1\.2\.(2[7-9]|[3-9]\d)"/);
});

test("v82 öğrenci Hata Defteri: soru no, not ya da çözüm, koçun notu ve paylaşım anahtarı",()=>{
  const hub=read("src/ui/exam-hub-v73.ts"),css=read("src/ui/exam-hub-v73.css");
  assert.match(hub,/<label for="ehErrQ">Soru no \(isteğe bağlı\)<\/label>/);assert.match(hub,/<label for="ehErrNote">Not ya da çözüm<\/label><textarea id="ehErrNote"/);
  assert.match(hub,/if\(question>=1&&question<=200\)wrong\.q=question;/);
  assert.match(hub,/KOÇUN NOTU\$\{r\.coach\.status==="review"\?" · TEKRAR GEREKLİ"/);
  assert.match(hub,/data-act="photo-share"/);assert.match(hub,/s\.coachPhotoShare=\(act as HTMLInputElement\)\.checked;save\(\);/);
  assert.match(hub,/"yks:coach-photo-notes"\]\)window\.addEventListener\(event,schedule\)/);
  assert.match(css,/#deneme \.eh-coach-note\{/);
});

test("v82 kurallar: iki koleksiyon; okuma yalnız öğrenci ve koç; koç yalnız yorum ve durum yazar; boyut sınırları",()=>{
  const rules=read("firestore.rules"),meta=rules.slice(rules.indexOf("match /coachingErrorPhotos/{photoId}"),rules.indexOf("match /coachingErrorPhotoImages/{photoId}")),images=rules.slice(rules.indexOf("match /coachingErrorPhotoImages/{photoId}"),rules.indexOf("match /coachingActions/{actionId}"));
  assert.match(meta,/allow get, list: if verifiedUser\(\)\s*&& \(request\.auth\.uid == resource\.data\.studentUid\s*\|\| request\.auth\.uid == resource\.data\.coachUid\);/);
  assert.match(meta,/photoId == request\.resource\.data\.studentUid \+ '_' \+ request\.resource\.data\.photoKey/);
  assert.match(meta,/activeCoachingLink\(request\.resource\.data\.studentUid, request\.resource\.data\.coachUid\)/);
  assert.match(meta,/!request\.resource\.data\.diff\(resource\.data\)\.affectedKeys\(\)\.hasAny\(photoCoachKeys\(\)\)/,"öğrenci koç alanını değiştiremez");
  assert.match(meta,/request\.resource\.data\.diff\(resource\.data\)\.affectedKeys\(\)\.hasOnly\(photoCoachKeys\(\)\)/,"koç yalnız yorum/durum");
  assert.match(meta,/coachStatus in \['', 'review', 'solved'\]/);assert.match(meta,/thumb\.size\(\) <= 60000/);
  assert.match(images,/image\.size\(\) <= 900000/);assert.match(images,/profileRole\(request\.auth\.uid, 'student'\)/);
  assert.match(read("src/ui/profile-page-v62.ts"),/for\(const name of \["coachingErrorPhotos","coachingErrorPhotoImages"\]\)/,"hesap silinince fotoğraflar da silinir");
});
