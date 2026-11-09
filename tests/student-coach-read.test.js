const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");

const root=path.resolve(__dirname,"..");
const read=file=>fs.readFileSync(path.join(root,file),"utf8");
const source=read("public/student-coach-link.js");
const at=ms=>({toMillis:()=>ms,toDate:()=>new Date(ms)});
const T=minute=>Date.UTC(2026,9,31,10,minute);

// Modül küçük bir sahte DOM ile çalıştırılır; sohbet kutusu ve IntersectionObserver elle sürülür.
function load(){
  const listeners={},writes=[],observers=[];
  const thread={innerHTML:"",scrollTop:0,scrollHeight:0},title={textContent:""},chat={isConnected:true,getClientRects:()=>[]};
  const card={querySelector:sel=>({"[data-coach-thread]":thread,"[data-coach-chat-title]":title,"[data-coach-chat]":chat})[sel]||null};
  const document={visibilityState:"visible",documentElement:{dataset:{}},getElementById:id=>id==="studentCoachCodeSettings"?card:null,addEventListener(){},head:{append(){}},createElement:()=>({}),body:null};
  const context={
    window:{YKSAccountAuth:{},addEventListener(){},dispatchEvent(){}},document,
    collection:(_db,name)=>({name}),doc:(_db,...parts)=>({path:parts.join("/")}),query:(...x)=>x,where:(...x)=>x,
    onSnapshot:(q,cb)=>{listeners[q[0].name]=cb;return()=>{delete listeners[q[0].name]}},
    setDoc:async(ref,data,options)=>{writes.push({path:ref.path,data,options})},serverTimestamp:()=>"NOW",
    getDoc:async()=>({exists:()=>false}),getDocs:async()=>({docs:[]}),addDoc:async()=>({}),updateDoc:async()=>{},runTransaction:async()=>{},
    IntersectionObserver:class{constructor(cb){this.cb=cb;observers.push(this)}observe(node){this.node=node}disconnect(){this.off=true}},
    requestAnimationFrame:fn=>fn(),MutationObserver:class{observe(){}disconnect(){}},CustomEvent:class{},
    setTimeout(){},clearTimeout(){},confirm:()=>true,alert(){},console:{...console,warn(){},error(){}},
    Intl,Date,Set,Map,Number,String,Math,Array,Object,JSON,Promise,crypto:globalThis.crypto
  };
  vm.createContext(context);
  vm.runInContext(source.replace(/^import[^\n]+\n/gm,"")+"\n;globalThis.__t={state,startMessages,stopMessages,markStudentRead};",context);
  const t=context.__t;
  Object.assign(t.state,{user:{uid:"stu"},db:{}});
  const messages=list=>listeners.coachingMessages({docs:list.map(([id,role,minute])=>({id,data:()=>({studentUid:"stu",coachUid:"koc1",senderRole:role,text:id,createdAt:minute==null?null:at(T(minute))})}))});
  const reads=data=>listeners.coachingReads({docs:[{data:()=>({studentUid:"stu",coachUid:"koc1",...data})}]});
  const see=visible=>{const o=observers.at(-1);o.cb([{isIntersecting:visible}])};
  return{t,thread,writes,messages,reads,see,listeners,document,chat};
}

test("öğrenci kendi mesajında ✓ ya da ✓✓ görür; durum yalnız son kendi mesajının altında",()=>{
  const {t,thread,messages,reads}=load();
  t.startMessages("koc1","Elif Hoca");
  messages([["s1","student",0],["c1","coach",2],["s2","student",4]]);
  assert.deepEqual([...thread.innerHTML.matchAll(/<i class="scl-tick[^"]*"[^>]*>([^<]+)<\/i>/g)].map(m=>m[1]),["✓","✓"]);
  assert.equal(thread.innerHTML.match(/<p class="scl-status[^"]*">/g).length,1);
  assert.match(thread.innerHTML,/s2<time>[^<]*<i[^>]*>✓<\/i><\/time><\/div><p class="scl-status">Gönderildi<\/p>$/);
  reads({coachReadAt:at(T(3))});
  assert.deepEqual([...thread.innerHTML.matchAll(/<i class="scl-tick[^"]*"[^>]*>([^<]+)<\/i>/g)].map(m=>m[1]),["✓✓","✓"],"koçun okuduğu ana kadarkiler ✓✓");
  reads({coachReadAt:at(T(5))});
  assert.match(thread.innerHTML,/<p class="scl-status is-read">Okundu · \d{2}:\d{2}<\/p>$/);
  messages([["s1","student",0],["c1","coach",2],["s2","student",4],["s3","student",null]]);
  assert.match(thread.innerHTML,/s3<time><i class="scl-tick" aria-label="Gönderildi">✓<\/i><\/time><\/div><p class="scl-status">Gönderildi<\/p>$/,"sunucu saati gelmemiş mesaj gönderildi sayılır");
});

test("öğrenci sohbet ekrandayken okundu yazılır; ekranda değilken ya da sekme gizliyken yazılmaz",()=>{
  const {t,writes,messages,reads,see,document}=load();
  t.startMessages("koc1","Elif Hoca");
  messages([["c1","coach",1]]);
  assert.equal(writes.length,0,"sohbet ekranda değil");
  document.visibilityState="hidden";see(true);
  assert.equal(writes.length,0,"sekme gizli");
  document.visibilityState="visible";t.markStudentRead();
  assert.equal(writes.length,1);
  assert.deepEqual(JSON.parse(JSON.stringify(writes[0])),{path:"coachingReads/koc1_stu",data:{coachUid:"koc1",studentUid:"stu",studentReadAt:"NOW"},options:{merge:true}});
  messages([["c1","coach",1]]);
  assert.equal(writes.length,1,"aynı mesaj için yazma bekliyorsa tekrar yazılmaz");
  reads({studentReadAt:at(T(1))});
  see(false);messages([["c1","coach",1],["c2","coach",6]]);
  assert.equal(writes.length,1,"ekrandan çıkınca yeni mesaj okunmaz");
  see(true);
  assert.equal(writes.length,2,"tekrar görünce okunur");
});

test("koç bağlantısı kapanınca iki dinleyici de kapanır; hesap silinince okundu kayıtları silinir",()=>{
  const {t,listeners}=load();
  t.startMessages("koc1","Elif Hoca");
  assert.ok(listeners.coachingMessages&&listeners.coachingReads);
  t.stopMessages();
  assert.deepEqual(Object.keys(listeners),[]);
  assert.equal(t.state.messages.length,0);assert.equal(t.state.reads.size,0);
  const profile=read("src/ui/profile-page-v62.ts");
  assert.match(profile,/try\{\s*const reads=await byStudent\("coachingReads"\);\s*for\(const item of reads\.docs\)await fs\.deleteDoc\(item\.ref\);\s*\}catch\(error\)\{if\(!String\(\(error as \{code\?:string\}\)\?\.code\|\|""\)\.includes\("permission-denied"\)\)throw error;\}/);
  assert.match(read("src/ui/student-account-loader.ts"),/"\.\/student-coach-link\.js\?v=1\.5\.0"/);
  assert.match(source,/detail:\{version:"1\.5\.0"\}/);
});

test("Firestore: okundu kaydını her taraf yalnız kendi alanıyla ve sunucu zamanıyla yazar",()=>{
  const rules=read("firestore.rules");
  const block=rules.slice(rules.indexOf("match /coachingReads/{threadId}"),rules.indexOf("allow delete",rules.indexOf("match /coachingReads/{threadId}")));
  assert.ok(block.length>0);
  assert.match(block,/threadId == request\.resource\.data\.coachUid \+ '_' \+ request\.resource\.data\.studentUid/);
  assert.match(block,/hasOnly\(\['studentUid', 'coachUid', 'studentReadAt'\]\)\s*&& request\.resource\.data\.studentReadAt == request\.time/);
  assert.match(block,/affectedKeys\(\)\.hasOnly\(\['coachReadAt'\]\)/);
  assert.match(block,/activeCoachingLink\(resource\.data\.studentUid, resource\.data\.coachUid\)/);
});
