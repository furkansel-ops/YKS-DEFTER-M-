// Firestore emülatör kural testleri. CI: .github/workflows/ci.yml "rules" işi. Yerelde Java 21 gerekir.
import {readFileSync} from "node:fs";
import test,{after,before,beforeEach} from "node:test";
import {initializeTestEnvironment,assertSucceeds,assertFails} from "@firebase/rules-unit-testing";
import firebase from "firebase/compat/app";
import "firebase/compat/firestore";

const rules=readFileSync(process.env.RULES_FILE||new URL("../firestore.rules",import.meta.url),"utf8");
const TS=()=>firebase.firestore.FieldValue.serverTimestamp();
let env;
const STU="stu1",COACH="coach1",OTHER="other1";
const verified=uid=>env.authenticatedContext(uid,{email:`${uid}@x.com`,email_verified:true}).firestore();
const unverified=uid=>env.authenticatedContext(uid,{email:`${uid}@x.com`,email_verified:false}).firestore();
const hash="a".repeat(64);

before(async()=>{env=await initializeTestEnvironment({projectId:"demo-yks-rules",firestore:{rules,host:"127.0.0.1",port:8080}});});
after(async()=>{await env?.cleanup();});
beforeEach(async()=>{
  await env.clearFirestore();
  await env.withSecurityRulesDisabled(async ctx=>{
    const db=ctx.firestore(),now=firebase.firestore.Timestamp.now();
    await db.doc(`accountProfiles/${STU}`).set({uid:STU,role:"student",displayName:"Öğrenci",coachTitle:"",specialization:"",createdAt:now,updatedAt:now});
    await db.doc(`accountProfiles/${COACH}`).set({uid:COACH,role:"coach",displayName:"Koç",coachTitle:"",specialization:"",createdAt:now,updatedAt:now});
    await db.doc(`coachingActions/a1`).set({studentUid:STU,coachUid:COACH,type:"coach_note",payload:{},status:"pending",createdAt:now,updatedAt:now});
    await db.doc(`coachingMessages/m1`).set({studentUid:STU,coachUid:COACH,senderUid:COACH,senderRole:"coach",text:"selam",createdAt:now});
    await db.doc(`coachingLinks/l1`).set({studentUid:STU,coachUid:COACH,active:true,accessCode:"ABC",createdAt:now,updatedAt:now});
    await db.doc(`coachingShares/${STU}`).set({studentUid:STU,version:1});
    await db.doc(`studentCoachAccess/${STU}`).set({studentUid:STU,code:"CODE1",active:true,createdAt:now,updatedAt:now});
    await db.doc(`studentCoachCodes/CODE1`).set({code:"CODE1",studentUid:STU,active:true,createdAt:now,updatedAt:now});
    await db.doc(`users/${STU}/sync/meta`).set({format:4,revision:5,count:2,hash,clientId:"device-12345",appVersion:"4.4.0",schemaVersion:21,updatedAt:now});
    await db.doc(`users/${STU}/chunks/0000000005_0000`).set({data:"x",revision:5,index:0,format:4});
    await db.doc(`users/${STU}/chunks/0000000005_0001`).set({data:"y",revision:5,index:1,format:4});
  });
});

test("profil: sahibi silebilir, başkası ve doğrulanmamış silemez",async()=>{
  await assertFails(verified(OTHER).doc(`accountProfiles/${STU}`).delete());
  await assertFails(unverified(STU).doc(`accountProfiles/${STU}`).delete());
  await assertFails(verified(COACH).doc(`accountProfiles/${STU}`).delete());
  await assertSucceeds(verified(STU).doc(`accountProfiles/${STU}`).delete());
});

test("koç görevleri: öğrenci silebilir, başkası silemez",async()=>{
  await assertFails(verified(OTHER).doc("coachingActions/a1").delete());
  await assertFails(unverified(STU).doc("coachingActions/a1").delete());
  await assertSucceeds(verified(STU).doc("coachingActions/a1").delete());
});

test("mesajlar: öğrenci silebilir, başkası silemez, kimse güncelleyemez",async()=>{
  await assertFails(verified(STU).doc("coachingMessages/m1").update({text:"x"}));
  await assertFails(verified(COACH).doc("coachingMessages/m1").update({text:"x"}));
  await assertFails(verified(OTHER).doc("coachingMessages/m1").delete());
  await assertSucceeds(verified(STU).doc("coachingMessages/m1").delete());
});

test("öğrenci kendi görev ve mesajlarını sorgulayabilir",async()=>{
  const db=verified(STU);
  await assertSucceeds(db.collection("coachingActions").where("studentUid","==",STU).get());
  await assertSucceeds(db.collection("coachingMessages").where("studentUid","==",STU).get());
  await assertSucceeds(db.collection("coachingLinks").where("studentUid","==",STU).get());
});

test("bağlantı silinemez ama öğrenci kapatabilir",async()=>{
  await assertFails(verified(STU).doc("coachingLinks/l1").delete());
  await assertSucceeds(verified(STU).doc("coachingLinks/l1").update({active:false,endedAt:TS(),updatedAt:TS()}));
});

test("senkron: tombstone akışı çalışır, meta silinemez",async()=>{
  const db=verified(STU),meta=db.doc(`users/${STU}/sync/meta`);
  await assertFails(meta.delete());
  await assertSucceeds(meta.update({deleted:true,cleanupPending:true,deletedAt:TS(),updatedAt:TS(),count:0,hash:"",revision:6}));
  await assertSucceeds(db.doc(`users/${STU}/chunks/0000000005_0000`).delete());
  await assertSucceeds(db.doc(`users/${STU}/chunks/0000000005_0001`).delete());
  await assertSucceeds(meta.update({cleanupPending:false,updatedAt:TS()}));
  await assertFails(meta.delete());
  await assertFails(verified(OTHER).doc(`users/${STU}/sync/meta`).get());
});

test("uygulamadaki sırayla tam hesap silme başarılı olur",async()=>{
  const db=verified(STU);
  for(const name of ["coachingActions","coachingMessages"]){
    const snap=await db.collection(name).where("studentUid","==",STU).get();
    for(const d of snap.docs)await assertSucceeds(d.ref.delete());
  }
  const links=await db.collection("coachingLinks").where("studentUid","==",STU).get();
  for(const d of links.docs)if(d.data().active===true)await assertSucceeds(d.ref.update({active:false,endedAt:TS(),updatedAt:TS()}));
  await assertSucceeds(db.doc(`accountProfiles/${STU}`).delete());
  const access=await db.doc(`studentCoachAccess/${STU}`).get();
  await assertSucceeds(db.doc(`studentCoachCodes/${access.data().code}`).delete());
  await assertSucceeds(db.doc(`studentCoachAccess/${STU}`).delete());
  await assertSucceeds(db.doc(`coachingShares/${STU}`).delete());
  const meta=db.doc(`users/${STU}/sync/meta`);
  await assertSucceeds(meta.update({deleted:true,cleanupPending:true,deletedAt:TS(),updatedAt:TS(),count:0,hash:"",revision:6}));
  const chunks=await db.collection(`users/${STU}/chunks`).get();
  for(const d of chunks.docs)await assertSucceeds(d.ref.delete());
  await assertSucceeds(meta.update({cleanupPending:false,updatedAt:TS()}));
  // Profil silindikten sonra koçluk paylaşımı yeniden oluşturulamaz.
  await assertFails(db.doc(`coachingShares/${STU}`).set({studentUid:STU,version:1,profile:{},program:{},exams:[],progress:{},paragraphProblem:{},topics:{},errorJournal:[],updatedAt:TS()}));
  await env.withSecurityRulesDisabled(async ctx=>{
    const all=ctx.firestore();
    for(const path of [`accountProfiles/${STU}`,`coachingShares/${STU}`,`studentCoachAccess/${STU}`,"studentCoachCodes/CODE1","coachingActions/a1","coachingMessages/m1"])
      if((await all.doc(path).get()).exists)throw new Error(path+" silinmedi");
    if((await all.collection(`users/${STU}/chunks`).get()).size)throw new Error("chunk kaldı");
    const m=(await all.doc(`users/${STU}/sync/meta`).get()).data();
    if(m.deleted!==true||m.count!==0||m.hash!=="")throw new Error("meta tombstone değil");
    if((await all.doc("coachingLinks/l1").get()).data().active!==false)throw new Error("bağlantı açık");
  });
});

test("koç: kendi gönderdiği görev ve mesajları silebilir, başkasınınkini silemez",async()=>{
  await assertFails(verified(OTHER).doc("coachingActions/a1").delete());
  await assertFails(verified(OTHER).doc("coachingMessages/m1").delete());
  await assertSucceeds(verified(COACH).doc("coachingActions/a1").delete());
  await assertSucceeds(verified(COACH).doc("coachingMessages/m1").delete());
});

test("koç hesabı silme uygulamadaki sırayla başarılı olur; öğrenci verisi kalır",async()=>{
  const db=verified(COACH);
  for(const name of ["coachingActions","coachingMessages"]){
    const snap=await db.collection(name).where("coachUid","==",COACH).get();
    for(const d of snap.docs)await assertSucceeds(d.ref.delete());
  }
  const links=await db.collection("coachingLinks").where("coachUid","==",COACH).get();
  for(const d of links.docs)if(d.data().active===true)await assertSucceeds(d.ref.update({active:false,endedAt:TS(),updatedAt:TS()}));
  await assertSucceeds(db.doc(`accountProfiles/${COACH}`).delete());
  // Koç profili silinince paylaşım okunamaz, yeni görev gönderilemez.
  await assertFails(db.doc(`coachingShares/${STU}`).get());
  await assertFails(db.collection("coachingActions").add({studentUid:STU,coachUid:COACH,type:"coach_note",payload:{},status:"pending",createdAt:TS(),updatedAt:TS()}));
  await env.withSecurityRulesDisabled(async ctx=>{
    const all=ctx.firestore();
    for(const path of [`accountProfiles/${COACH}`,"coachingActions/a1","coachingMessages/m1"])if((await all.doc(path).get()).exists)throw new Error(path+" silinmedi");
    if((await all.doc("coachingLinks/l1").get()).data().active!==false)throw new Error("bağlantı açık");
    for(const path of [`accountProfiles/${STU}`,`coachingShares/${STU}`,`users/${STU}/sync/meta`])if(!(await all.doc(path).get()).exists)throw new Error(path+" öğrenci verisi silinmemeli");
  });
});

test("koç notları: yalnız sahibi koç okur/yazar/siler; öğrenci, başka kullanıcı ve liste kapalı",async()=>{
  const mine=verified(COACH).doc(`coachNotes/${COACH}`);
  await assertSucceeds(mine.set({text:"Mehmet: Cuma konuş",updatedAt:TS()}));
  await assertSucceeds(mine.get());
  await assertSucceeds(mine.set({text:"",updatedAt:TS()}));
  await assertFails(mine.set({text:"x",updatedAt:TS(),extra:1}));
  await assertFails(mine.set({text:"x".repeat(2001),updatedAt:TS()}));
  await assertFails(mine.set({text:"x",updatedAt:firebase.firestore.Timestamp.fromMillis(0)}));
  await assertFails(verified(OTHER).doc(`coachNotes/${COACH}`).get());
  await assertFails(verified(STU).doc(`coachNotes/${COACH}`).get());
  await assertFails(verified(STU).doc(`coachNotes/${STU}`).set({text:"öğrenci",updatedAt:TS()}));
  await assertFails(unverified(COACH).doc(`coachNotes/${COACH}`).get());
  await assertFails(verified(COACH).collection("coachNotes").get());
  await assertSucceeds(mine.delete());
});

// ---- Randevular ----
const OTHERSTU="stu2";
async function seedAppointments(){
  await env.withSecurityRulesDisabled(async ctx=>{
    const db=ctx.firestore(),now=firebase.firestore.Timestamp.now();
    await db.doc(`coachingLinks/${STU}_${COACH}`).set({studentUid:STU,coachUid:COACH,active:true,accessCode:"ABC",createdAt:now,updatedAt:now});
    await db.doc(`accountProfiles/${OTHERSTU}`).set({uid:OTHERSTU,role:"student",displayName:"Diğer",coachTitle:"",specialization:"",createdAt:now,updatedAt:now});
    await db.doc(`coachingLinks/${OTHERSTU}_${COACH}`).set({studentUid:OTHERSTU,coachUid:COACH,active:true,accessCode:"DEF",createdAt:now,updatedAt:now});
  });
}
const slotId=(date,time)=>`${COACH}_${date.replace(/-/g,"")}_${time.replace(":","")}`;
const appt=(by,student,date,time,extra={})=>({coachUid:COACH,studentUid:student,date,time,duration:30,status:by==="coach"?"confirmed":"requested",createdBy:by,topic:"Deneme analizi",link:"",note:"",createdAt:TS(),updatedAt:TS(),...extra});
function book(db,by,student,date,time,extra){
  const id=slotId(date,time),batch=db.batch();
  batch.set(db.doc(`coachSlots/${id}`),{coachUid:COACH,date,time});
  batch.set(db.doc(`coachAppointments/${id}`),appt(by,student,date,time,extra));
  return batch.commit();
}

test("randevu: uygun saatleri koç yazar, bağlı öğrenci okur, bağsız kullanıcı okuyamaz",async()=>{
  await seedAppointments();
  const ref=db=>db.doc(`coachAvailability/${COACH}`);
  await assertSucceeds(ref(verified(COACH)).set({days:{"1":{on:true,start:"18:00",end:"21:00"}},duration:30,updatedAt:TS()}));
  await assertFails(ref(verified(COACH)).set({days:{},duration:25,updatedAt:TS()}));
  await assertFails(ref(verified(STU)).set({days:{},duration:30,updatedAt:TS()}));
  await assertSucceeds(ref(verified(STU)).get());
  await assertFails(ref(verified(OTHER)).get());
});

test("randevu: öğrenci istek açar, aynı saate ikinci kayıt yazılamaz (çakışma yok)",async()=>{
  await seedAppointments();
  await assertSucceeds(book(verified(STU),"student",STU,"2026-11-05","20:00"));
  await assertFails(book(verified(OTHERSTU),"student",OTHERSTU,"2026-11-05","20:00"));
  await assertFails(book(verified(COACH),"coach",OTHERSTU,"2026-11-05","20:00"));
  // Öğrenci kesin randevu açamaz, link koyamaz, başkası adına açamaz.
  await assertFails(book(verified(STU),"student",STU,"2026-11-05","21:00",{status:"confirmed"}));
  await assertFails(book(verified(STU),"student",STU,"2026-11-05","21:30",{link:"https://meet.google.com/x"}));
  await assertFails(book(verified(STU),"student",OTHERSTU,"2026-11-05","22:00"));
  // Saat kilidi tek başına ya da yanlış kimlikle yazılamaz.
  await assertFails(verified(STU).doc(`coachSlots/${slotId("2026-11-06","18:00")}`).set({coachUid:COACH,date:"2026-11-06",time:"18:00"}));
  const sdb=verified(STU),bad=sdb.batch();
  bad.set(sdb.doc(`coachSlots/${COACH}_20261106_1900`),{coachUid:COACH,date:"2026-11-06",time:"18:00"});
  bad.set(sdb.doc(`coachAppointments/${COACH}_20261106_1900`),appt("student",STU,"2026-11-06","18:00"));
  await assertFails(bad.commit());
});

test("randevu: bağlı olmayan öğrenci randevu açamaz; doğrulanmamış hesap da açamaz",async()=>{
  await seedAppointments();
  await assertFails(book(verified(OTHER),"student",OTHER,"2026-11-05","18:00"));
  await assertFails(book(unverified(STU),"student",STU,"2026-11-05","18:30"));
});

test("randevu: koç kesin randevu koyar, isteği onaylar, link ekler; öğrenci değiştiremez",async()=>{
  await seedAppointments();
  await assertSucceeds(book(verified(COACH),"coach",STU,"2026-11-07","18:00",{link:"https://meet.google.com/abc"}));
  await assertSucceeds(book(verified(STU),"student",STU,"2026-11-07","19:00"));
  const req=`coachAppointments/${slotId("2026-11-07","19:00")}`;
  await assertFails(verified(STU).doc(req).update({status:"confirmed",updatedAt:TS()}));
  await assertSucceeds(verified(COACH).doc(req).update({status:"confirmed",link:"https://zoom.us/j/1",updatedAt:TS()}));
  await assertFails(verified(COACH).doc(req).update({time:"19:30",updatedAt:TS()}));
  await assertFails(verified(COACH).doc(req).update({link:"javascript:alert(1)",updatedAt:TS()}));
});

test("randevu: detayları yalnız iki taraf görür; diğer öğrenci yalnız dolu saati görür",async()=>{
  await seedAppointments();
  await book(verified(STU),"student",STU,"2026-11-05","20:00");
  const id=slotId("2026-11-05","20:00");
  await assertSucceeds(verified(STU).doc(`coachAppointments/${id}`).get());
  await assertSucceeds(verified(COACH).doc(`coachAppointments/${id}`).get());
  await assertFails(verified(OTHERSTU).doc(`coachAppointments/${id}`).get());
  await assertSucceeds(verified(OTHERSTU).collection("coachSlots").where("coachUid","==",COACH).get());
  await assertFails(verified(OTHER).collection("coachSlots").where("coachUid","==",COACH).get());
  await assertSucceeds(verified(COACH).collection("coachAppointments").where("coachUid","==",COACH).get());
  await assertSucceeds(verified(STU).collection("coachAppointments").where("studentUid","==",STU).get());
  await assertFails(verified(OTHERSTU).collection("coachAppointments").where("coachUid","==",COACH).get());
});

test("randevu: iki taraf da iptal eder (kilitle birlikte); başkası iptal edemez; iptal sonrası saat boşalır",async()=>{
  await seedAppointments();
  await book(verified(STU),"student",STU,"2026-11-05","20:00");
  const id=slotId("2026-11-05","20:00");
  const cancel=db=>{const b=db.batch();b.delete(db.doc(`coachAppointments/${id}`));b.delete(db.doc(`coachSlots/${id}`));return b.commit()};
  await assertFails(cancel(verified(OTHERSTU)));
  await assertFails(verified(STU).doc(`coachAppointments/${id}`).delete());
  await assertSucceeds(cancel(verified(STU)));
  await assertSucceeds(book(verified(OTHERSTU),"student",OTHERSTU,"2026-11-05","20:00"));
  await assertSucceeds(cancel(verified(COACH)));
});

// Okundu bilgisi (coachingReads): her taraf yalnız kendi okuma zamanını, sunucu zamanıyla yazar.
const READ=`coachingReads/${COACH}_${STU}`;
test("okundu: koç ve öğrenci yalnız kendi alanını sunucu zamanıyla yazar",async()=>{
  await seedAppointments();
  const coach=verified(COACH),stu=verified(STU);
  await assertFails(coach.doc(READ).set({coachUid:COACH,studentUid:STU,studentReadAt:TS()},{merge:true}),"koç öğrencinin alanını yazamaz");
  await assertFails(coach.doc(READ).set({coachUid:COACH,studentUid:STU,coachReadAt:firebase.firestore.Timestamp.now()},{merge:true}),"istemci zamanı kabul edilmez");
  await assertFails(coach.doc(`coachingReads/${STU}_${COACH}`).set({coachUid:COACH,studentUid:STU,coachReadAt:TS()}),"kimlik koçUid_öğrenciUid olmalı");
  await assertSucceeds(coach.doc(READ).set({coachUid:COACH,studentUid:STU,coachReadAt:TS()},{merge:true}));
  await assertSucceeds(stu.doc(READ).set({coachUid:COACH,studentUid:STU,studentReadAt:TS()},{merge:true}));
  await assertSucceeds(coach.doc(READ).set({coachUid:COACH,studentUid:STU,coachReadAt:TS()},{merge:true}),"koç tekrar günceller");
  await assertFails(stu.doc(READ).update({coachReadAt:TS()}),"öğrenci koçun alanını değiştiremez");
  await assertFails(coach.doc(READ).update({studentReadAt:TS()}),"koç öğrencinin alanını değiştiremez");
  await assertFails(coach.doc(READ).update({coachReadAt:TS(),studentUid:"baska"}));
  await assertFails(verified(OTHER).doc(READ).set({coachUid:COACH,studentUid:STU,coachReadAt:TS()},{merge:true}));
  await assertFails(unverified(COACH).doc(READ).set({coachUid:COACH,studentUid:STU,coachReadAt:TS()},{merge:true}));
});

test("okundu: yalnız iki taraf görür ve siler; bağlantı kapalıysa yazılamaz",async()=>{
  await seedAppointments();
  await assertSucceeds(verified(STU).doc(READ).set({coachUid:COACH,studentUid:STU,studentReadAt:TS()}));
  await assertSucceeds(verified(COACH).collection("coachingReads").where("coachUid","==",COACH).get());
  await assertSucceeds(verified(STU).collection("coachingReads").where("studentUid","==",STU).get());
  await assertFails(verified(OTHER).collection("coachingReads").where("coachUid","==",COACH).get());
  await assertFails(verified(OTHER).doc(READ).get());
  await env.withSecurityRulesDisabled(async ctx=>{await ctx.firestore().doc(`coachingLinks/${STU}_${COACH}`).update({active:false})});
  await assertFails(verified(COACH).doc(READ).set({coachUid:COACH,studentUid:STU,coachReadAt:TS()},{merge:true}),"bağlantı kapalı");
  await assertFails(verified(OTHER).doc(READ).delete());
  await assertSucceeds(verified(COACH).doc(READ).delete(),"hesap silerken koç silebilir");
});

const PH=`coachingErrorPhotos/${STU}_1-0`,IM=`coachingErrorPhotoImages/${STU}_1-0`;
const photoMeta=extra=>({studentUid:STU,coachUid:COACH,photoKey:"1-0",wrongId:"1",subject:"Fizik",topic:"Kuvvet",date:"2026-10-30",exam:"11",examName:"Özdebir TYT-4",question:"12",kind:"dikkat",note:"Not",thumb:"data:image/jpeg;base64,QUJD",sig:"a.b",updatedAt:TS(),...extra});
test("v82 fotoğraf: öğrenci bağlı koçuyla paylaşır; koç ve öğrenci okur; başkası okuyamaz",async()=>{
  await seedAppointments();
  const stu=verified(STU),coach=verified(COACH);
  await assertSucceeds(stu.doc(IM).set({studentUid:STU,coachUid:COACH,photoKey:"1-0",image:"data:image/jpeg;base64,QklH",updatedAt:TS()}));
  await assertSucceeds(stu.doc(PH).set(photoMeta()));
  await assertFails(stu.doc(`coachingErrorPhotos/${STU}_2-0`).set(photoMeta()),"kimlik öğrenciUid_photoKey olmalı");
  await assertFails(stu.doc(`coachingErrorPhotos/${STU}_3-0`).set(photoMeta({photoKey:"3-0",coachUid:OTHER})),"bağlı olmayan koça paylaşılamaz");
  await assertFails(stu.doc(`coachingErrorPhotos/${STU}_4-0`).set(photoMeta({photoKey:"4-0",coachComment:"sahte"})),"öğrenci koç alanı yazamaz");
  await assertFails(stu.doc(`coachingErrorPhotos/${STU}_5-0`).set(photoMeta({photoKey:"5-0",thumb:"x".repeat(60001)})),"önizleme sınırı");
  await assertSucceeds(coach.collection("coachingErrorPhotos").where("coachUid","==",COACH).get());
  await assertSucceeds(stu.collection("coachingErrorPhotos").where("studentUid","==",STU).get());
  await assertSucceeds(coach.doc(IM).get());
  await assertFails(verified(OTHER).doc(PH).get());await assertFails(verified(OTHER).doc(IM).get());
  await assertFails(verified(OTHER).collection("coachingErrorPhotos").where("coachUid","==",COACH).get());
});
test("v82 fotoğraf: koç yalnız yorum/durum yazar; öğrenci güncellerken koç alanına dokunamaz; silme",async()=>{
  await seedAppointments();
  const stu=verified(STU),coach=verified(COACH);
  await assertSucceeds(stu.doc(PH).set(photoMeta()));
  await assertSucceeds(coach.doc(PH).update({coachComment:"cos37",coachStatus:"review",coachAt:TS()}));
  await assertFails(coach.doc(PH).update({coachComment:"x",coachStatus:"hack",coachAt:TS()}),"geçersiz durum");
  await assertFails(coach.doc(PH).update({note:"değiştir",coachAt:TS()}),"koç öğrenci alanını değiştiremez");
  await assertFails(coach.doc(PH).update({coachComment:"x",coachStatus:"",coachAt:firebase.firestore.Timestamp.now()}),"istemci zamanı yok");
  await assertSucceeds(stu.doc(PH).set({...photoMeta({note:"Yeni not"})},{merge:true}),"öğrenci kendi alanını günceller, koç yorumu kalır");
  const after=(await coach.doc(PH).get()).data();if(after.coachComment!=="cos37"||after.note!=="Yeni not")throw new Error("birleştirme bozuk");
  await assertFails(stu.doc(PH).update({coachStatus:"solved"}),"öğrenci koç durumunu değiştiremez");
  await assertFails(stu.doc(PH).update({note:"x".repeat(601),updatedAt:TS()}),"güncellemede de not sınırı");
  await assertFails(verified(OTHER).doc(PH).delete());
  await assertSucceeds(stu.doc(PH).delete());
  await assertSucceeds(stu.doc(IM).set({studentUid:STU,coachUid:COACH,photoKey:"1-0",image:"data:image/jpeg;base64,QklH",updatedAt:TS()}));
  await assertSucceeds(coach.collection("coachingErrorPhotoImages").where("coachUid","==",COACH).get());
  await assertSucceeds(coach.doc(IM).delete(),"koç hesabını silerken silebilir");
  await env.withSecurityRulesDisabled(async ctx=>{await ctx.firestore().doc(`coachingLinks/${STU}_${COACH}`).update({active:false})});
  await assertFails(stu.doc(IM).set({studentUid:STU,coachUid:COACH,photoKey:"1-0",image:"data:image/jpeg;base64,QklH",updatedAt:TS()}),"bağlantı kapalıyken paylaşılamaz");
});
test("v112 koç kaydı: davetsiz koç açılamaz; açık davetle bir kez açılır; öğrenci davetsiz açılır",async()=>{
  const OPEN="A".repeat(24),OLD="B".repeat(24),NEW1="new1",NEW2="new2",NEW3="new3";
  await env.withSecurityRulesDisabled(async ctx=>{
    const db=ctx.firestore(),T=firebase.firestore.Timestamp,later=T.fromMillis(Date.now()+864e5),past=T.fromMillis(Date.now()-1000);
    await db.doc(`coachRegistrationInvites/${OPEN}`).set({status:"open",expiresAt:later,createdAt:T.now(),updatedAt:T.now()});
    await db.doc(`coachRegistrationInvites/${OLD}`).set({status:"open",expiresAt:past,createdAt:T.now(),updatedAt:T.now()});
  });
  const profile=(uid,extra={})=>({uid,role:"coach",displayName:"Koç",coachTitle:"",specialization:"",createdAt:TS(),updatedAt:TS(),...extra});
  const claim=uid=>({status:"used",usedBy:uid,usedAt:TS(),updatedAt:TS()});
  const register=(uid,code)=>{const db=verified(uid),b=db.batch();b.update(db.doc(`coachRegistrationInvites/${code}`),claim(uid));b.set(db.doc(`accountProfiles/${uid}`),profile(uid,{registrationInvite:code}));return b.commit()};
  await assertFails(verified(NEW1).doc(`accountProfiles/${NEW1}`).set(profile(NEW1)),"davetsiz koç");
  await assertFails(register(NEW1,OLD),"süresi dolmuş davet");
  await assertSucceeds(register(NEW1,OPEN));
  await assertFails(register(NEW2,OPEN),"davet ikinci kez kullanılamaz");
  await assertFails(verified(NEW2).collection("coachRegistrationInvites").get(),"davetler listelenemez");
  await assertFails(verified(NEW2).doc(`coachRegistrationInvites/${"C".repeat(24)}`).set({status:"open"}),"istemci davet oluşturamaz");
  await assertSucceeds(verified(NEW3).doc(`accountProfiles/${NEW3}`).set({...profile(NEW3),role:"student"}),"öğrenci davetsiz");
});
test("v95 kitap sayıları: öğrenci bir kez yazar; koç yazamaz; değiştirilemez, silinemez, listelenemez",async()=>{
  const stu=verified(STU),ok={tests:40,perTest:20,createdAt:TS()};
  await assertFails(verified(COACH).doc("bookCounts/ks1").set(ok),"koç yazamaz");
  await assertFails(stu.doc("bookCounts/abc").set(ok),"kimlik ks+sayı olmalı");
  await assertFails(stu.doc("bookCounts/ks1").set({...ok,tests:2001}),"sınır");
  await assertSucceeds(stu.doc("bookCounts/ks1").set(ok));
  await assertFails(stu.doc("bookCounts/ks1").update({tests:1}),"değiştirilemez");
  await assertFails(stu.doc("bookCounts/ks1").delete(),"silinemez");
  await assertFails(stu.collection("bookCounts").get(),"listelenemez");
  await assertSucceeds(verified(COACH).doc("bookCounts/ks1").get());
});
test("v127 yönetici davetleri: yalnız yönetici üretir, listeler, açık daveti iptal eder",async()=>{
  const ADMIN="admin1",CODE="D".repeat(24),CODE2="E".repeat(24),USED="F".repeat(24);
  const T=firebase.firestore.Timestamp,inDays=d=>T.fromMillis(Date.now()+d*864e5);
  await env.withSecurityRulesDisabled(async ctx=>{
    const db=ctx.firestore();
    await db.doc(`admins/${ADMIN}`).set({note:"proje sahibi"});
    await db.doc(`coachRegistrationInvites/${USED}`).set({status:"used",expiresAt:inDays(3),createdAt:T.now(),updatedAt:T.now(),usedBy:"x"});
  });
  const admin=verified(ADMIN),invite=(uid,extra={})=>({status:"open",expiresAt:inDays(7),createdAt:TS(),updatedAt:TS(),createdBy:uid,...extra});
  await assertSucceeds(admin.doc(`admins/${ADMIN}`).get(),"yönetici kendi kaydını görür");
  await assertFails(verified(COACH).doc(`admins/${ADMIN}`).get(),"başkasının kaydı görülmez");
  await assertFails(verified(COACH).doc(`admins/${COACH}`).set({}),"istemci yönetici olamaz");
  await assertFails(verified(COACH).doc(`coachRegistrationInvites/${CODE}`).set(invite(COACH)),"yönetici olmayan koç üretemez");
  await assertFails(unverified(ADMIN).doc(`coachRegistrationInvites/${CODE}`).set(invite(ADMIN)),"doğrulanmamış e-posta");
  await assertFails(admin.doc(`coachRegistrationInvites/${CODE}`).set(invite(ADMIN,{expiresAt:inDays(91)})),"en çok 90 gün");
  await assertFails(admin.doc(`coachRegistrationInvites/${CODE}`).set(invite(ADMIN,{status:"used"})),"açık olmalı");
  await assertFails(admin.doc(`coachRegistrationInvites/${CODE}`).set(invite(COACH)),"oluşturan kendisi olmalı");
  await assertFails(admin.doc(`coachRegistrationInvites/${CODE}`).set(invite(ADMIN,{usedBy:"x"})),"fazla alan");
  await assertFails(admin.doc(`coachRegistrationInvites/abc`).set(invite(ADMIN)),"kod biçimi");
  await assertSucceeds(admin.doc(`coachRegistrationInvites/${CODE}`).set(invite(ADMIN)));
  await assertSucceeds(admin.doc(`coachRegistrationInvites/${CODE2}`).set(invite(ADMIN,{expiresAt:inDays(90)})));
  await assertSucceeds(admin.collection("coachRegistrationInvites").get(),"yönetici listeler");
  await assertFails(verified(COACH).collection("coachRegistrationInvites").get(),"koç listeleyemez");
  await assertFails(verified(COACH).doc(`coachRegistrationInvites/${CODE}`).delete(),"koç iptal edemez");
  await assertFails(admin.doc(`coachRegistrationInvites/${USED}`).delete(),"kullanılmış davet silinmez");
  await assertSucceeds(admin.doc(`coachRegistrationInvites/${CODE2}`).delete(),"açık davet iptal");
  const NEWC="newc",db=verified(NEWC),b=db.batch();
  b.update(db.doc(`coachRegistrationInvites/${CODE}`),{status:"used",usedBy:NEWC,usedAt:TS(),updatedAt:TS()});
  b.set(db.doc(`accountProfiles/${NEWC}`),{uid:NEWC,role:"coach",displayName:"Yeni",coachTitle:"",specialization:"",registrationInvite:CODE,createdAt:TS(),updatedAt:TS()});
  await assertSucceeds(b.commit(),"panelden üretilen davetle koç kaydı açılır");
});
