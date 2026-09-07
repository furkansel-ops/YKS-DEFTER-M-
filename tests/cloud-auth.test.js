const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");

const html=fs.readFileSync(path.resolve(__dirname,"../index.html"),"utf8");
const source=html.match(/<script type="application\/json" id="legacyFirebaseSyncModule"[^>]*>([\s\S]*?)<\/script>/)[1].replace(/^import .*;\r?\n/gm,"");
const deferred=()=>{let resolve,reject;const promise=new Promise((yes,no)=>{resolve=yes;reject=no;});return {promise,resolve,reject};};
const storage=initial=>{const rows=new Map(Object.entries(initial||{}));return {rows,getItem:key=>rows.get(key)||null,setItem:(key,value)=>rows.set(key,String(value)),removeItem:key=>rows.delete(key)};};
const makeElement=id=>({id,value:"",textContent:"",hidden:false,disabled:false,dataset:{},listeners:{},valid:true,reportValidity(){return this.valid;},addEventListener(type,callback){this.listeners[type]=callback;},querySelectorAll(){return [];}});
const verifiedUser=(uid="account",providers=["google.com"])=>({uid,email:"owner@example.test",emailVerified:true,providerData:providers.map(providerId=>({providerId})),async getIdToken(){return "test-only-token";}});

async function harness(options={}){
  const ids=["cloudSyncBox","cloudSyncText","cloudSyncMeta","cloudLoginBtn","cloudLogoutBtn","cloudRetryBtn","cloudDeleteBtn","cloudAuthForm","cloudEmail","cloudPassword","cloudLinkForm","cloudLinkPassword","cloudVerification","cloudSignupBtn","cloudResetBtn","cloudSendVerificationBtn","cloudCheckVerificationBtn","cloudAuthNotice"];
  const elements=Object.fromEntries(ids.map(id=>[id,makeElement(id)]));
  elements.cloudSyncBox.dataset.embeddedApp=String(!!options.embedded);
  elements.cloudSyncBox.querySelectorAll=()=>Object.values(elements).filter(el=>/Btn$/.test(el.id));
  elements.cloudEmail.value="owner@example.test";
  elements.cloudPassword.value="login-test-password";
  elements.cloudLinkPassword.value="link-test-password";
  elements.cloudAuthNotice.hidden=true;
  const calls={popup:0,redirect:0,redirectResult:0,email:[],signup:[],reset:[],verification:[],link:[],signOut:0,reads:0,writes:0,downloads:0,listeners:0};
  const hooks={},timers=[],auth={currentUser:null};let authListener;
  const localStorage=storage(options.storage),sessionStorage=storage();
  const window={S:{v:21,localRecord:"never-uploaded-test-data"},dispatchEvent(){},addEventListener(){},__YKS_STATE_EPOCH:1};
  const context=vm.createContext({
    window,document:{documentElement:{dataset:{}},hidden:false,getElementById:id=>elements[id]||null},navigator:{onLine:options.online!==false},
    localStorage,sessionStorage,crypto:{randomUUID:()=>"test-device"},console:{error(){},warn(){}},CustomEvent:class {},Blob,performance,
    DATA_SCHEMA:21,APP_VERSION:"test",DEF:{v:21},STORAGE_KEY:"state",PERF_STATE:{},S:window.S,lastPersistedJSON:"",
    infraHash:value=>"test-hash-"+value,safeJSONParse:JSON.parse,infraError(){},conflictBackupAdd(){},normalize:value=>value,migrateState:value=>value,
    setInterval(){},setTimeout(fn,delay){timers.push({fn,delay});return timers.length;},clearTimeout(){},confirm:()=>true,location:{reload(){calls.reload=(calls.reload||0)+1;}},
    initializeApp:()=>({}),getAuth:()=>auth,getFirestore:()=>({}),GoogleAuthProvider:class {},indexedDBLocalPersistence:{},
    setPersistence:()=>options.persistence||Promise.resolve(),
    signInWithPopup:async()=>{calls.popup++;if(hooks.popup)return hooks.popup();},
    signInWithRedirect:async()=>{calls.redirect++;},getRedirectResult:async()=>{calls.redirectResult++;return null;},
    onAuthStateChanged:(_auth,callback)=>{authListener=callback;},
    signOut:async()=>{calls.signOut++;if(hooks.signOut)return hooks.signOut();auth.currentUser=null;},
    signInWithEmailAndPassword:async(_auth,email,password)=>{calls.email.push({email,password});if(hooks.email)return hooks.email();return {user:verifiedUser("account",["password"])};},
    createUserWithEmailAndPassword:async(_auth,email,password)=>{calls.signup.push({email,password});const user={...verifiedUser("new-account",["password"]),emailVerified:false};auth.currentUser=user;return {user};},
    sendPasswordResetEmail:async(_auth,email)=>{calls.reset.push(email);},sendEmailVerification:async user=>{calls.verification.push(user.uid);},
    reload:async()=>{},EmailAuthProvider:{credential:(email,password)=>({email,password})},
    linkWithCredential:async(user,credential)=>{calls.link.push({uid:user.uid,credential});if(hooks.link)return hooks.link();user.providerData.push({providerId:"password"});return {user};},
    doc:(_db,...parts)=>parts.join("/"),collection:(_db,...parts)=>parts.join("/"),getDoc:async()=>{calls.reads++;return {exists:()=>false};},
    getDocs:async()=>{calls.reads++;return {docs:[]};},runTransaction:async()=>{calls.writes++;},writeBatch:()=>({}),serverTimestamp:()=>0,
    onSnapshot:()=>{calls.listeners++;return ()=>{};},
  });
  const run=code=>vm.runInContext(code,context);
  run(source);
  const settle=async()=>{for(let i=0;i<30;i++)await Promise.resolve();};
  const event=async(id,type="click")=>{await elements[id].listeners[type]?.({preventDefault(){}});await settle();};
  const transition=async user=>{auth.currentUser=user;await authListener(user);await settle();};
  const stubDownloads=()=>{context.downloadSpy=()=>{calls.downloads++;};run("downloadOrSeed=async()=>{downloadSpy();};");};
  await settle();
  return {run,context,elements,auth,calls,hooks,timers,localStorage,sessionStorage,event,settle,transition,stubDownloads,authCallback:user=>authListener(user)};
}

test("Android/Windows girişinde Google popup ve yönlendirme hiçbir zaman açılmaz",async()=>{
  const h=await harness({embedded:true});await h.event("cloudLoginBtn");
  assert.equal(h.calls.popup,0);assert.equal(h.calls.redirect,0);assert.equal(h.calls.redirectResult,0);
  assert.equal(h.elements.cloudSyncBox.dataset.state,"signedout");
});

test("e-posta giriş şifresi yalnız kimlik sağlayıcısına gider ve işlem sonunda temizlenir",async()=>{
  const h=await harness({embedded:true});await h.event("cloudAuthForm","submit");
  assert.deepEqual(h.calls.email,[{email:"owner@example.test",password:"login-test-password"}]);
  assert.equal(h.elements.cloudPassword.value,"");assert.equal(h.elements.cloudLinkPassword.value,"");
  const stored=JSON.stringify([...h.localStorage.rows,...h.sessionStorage.rows,h.context.window.S]);
  assert.doesNotMatch(stored,/login-test-password|link-test-password/);
});

test("başarısız ve çevrimdışı girişte şifre alanları temizlenir, yerel kayıt korunur",async()=>{
  for(const online of [true,false]){
    const h=await harness({online});h.hooks.email=()=>{throw {code:"auth/invalid-credential"};};
    await h.event("cloudAuthForm","submit");
    assert.equal(h.elements.cloudPassword.value,"");assert.equal(h.elements.cloudLinkPassword.value,"");
    assert.equal(h.calls.email.length,online?1:0);assert.equal(h.context.window.S.localRecord,"never-uploaded-test-data");
    assert.notEqual(h.elements.cloudSyncBox.dataset.state,"synced");
  }
});

test("bağlı cihazda yeni hesap açma engellenir; mevcut veri başka UID'ye taşınmaz",async()=>{
  const h=await harness({storage:{yks_cloud_account:"original-account"}});await h.event("cloudSignupBtn");
  assert.equal(h.calls.signup.length,0);assert.equal(h.calls.writes,0);assert.equal(h.localStorage.getItem("yks_cloud_account"),"original-account");
});

test("kayıt depolama hazırlığını beklerken hesap bağlanırsa ikinci kontrolde durur",async()=>{
  const pending=deferred();const h=await harness({persistence:pending.promise});
  await h.event("cloudSignupBtn");assert.equal(h.run("authBusy"),true);
  h.run('setAccount("arrived-account");');pending.resolve();await h.settle();
  assert.equal(h.calls.signup.length,0);assert.equal(h.elements.cloudPassword.value,"");
});

test("yeni hesaba doğrulama gönderilir; doğrulanmamış hesap bulut verisi okuyamaz/yazamaz",async()=>{
  const h=await harness();await h.event("cloudSignupBtn");
  assert.equal(h.calls.signup.length,1);assert.deepEqual(h.calls.verification,["new-account"]);
  await h.transition(h.auth.currentUser);h.run("window.yksCloudSchedule();window.yksCloudForceDirty();");await h.run("upload();downloadOrSeed();");
  assert.equal(h.run("user"),null);assert.equal(h.calls.reads,0);assert.equal(h.calls.writes,0);assert.equal(h.calls.listeners,0);
  assert.equal(h.elements.cloudVerification.hidden,false);assert.equal(h.elements.cloudDeleteBtn.hidden,true);
});

test("doğrulanmış Google hesabına şifre ekleme UID ve başarısız bulut durumunu korur",async()=>{
  const h=await harness();h.stubDownloads();await h.transition(verifiedUser());
  h.run('status("Eşitleme hatası","error","Bulut izni bekliyor");');
  await h.event("cloudLinkForm","submit");
  assert.equal(h.calls.link.length,1);assert.equal(h.calls.link[0].uid,"account");assert.equal(h.auth.currentUser.uid,"account");
  assert.equal(h.calls.signup.length,0);assert.equal(h.elements.cloudLinkPassword.value,"");assert.equal(h.elements.cloudLinkForm.hidden,true);
  assert.equal(h.elements.cloudSyncBox.dataset.state,"error");assert.equal(h.elements.cloudSyncText.textContent,"Eşitleme hatası");
  assert.equal(h.elements.cloudAuthNotice.hidden,false);
});

test("doğrulanmamış veya mevcut şifreli hesapta gizli bağlama formu çalıştırılamaz",async()=>{
  for(const user of [{...verifiedUser(),emailVerified:false},verifiedUser("account",["password"])]){
    const h=await harness();h.stubDownloads();await h.transition(user);await h.event("cloudLinkForm","submit");
    assert.equal(h.calls.link.length,0);assert.equal(h.calls.signup.length,0);assert.equal(h.elements.cloudLinkPassword.value,"");
  }
});

test("başka hesaba girişte çıkış başarısız olsa da eşitleme kapalı ve bağlı UID sabittir",async()=>{
  const h=await harness({storage:{yks_cloud_account:"original-account"}});h.stubDownloads();h.hooks.signOut=()=>{throw new Error("network unavailable");};
  await h.transition(verifiedUser("other-account"));h.run("window.yksCloudSchedule();");await h.run("upload()");
  assert.equal(h.run("user"),null);assert.equal(h.calls.downloads,0);assert.equal(h.calls.reads,0);assert.equal(h.calls.writes,0);assert.equal(h.calls.listeners,0);
  assert.equal(h.localStorage.getItem("yks_cloud_account"),"original-account");assert.equal(h.elements.cloudSyncBox.dataset.state,"error");
});

test("hesap geçişi beklerken eski kullanıcıyla yeni eşitleme başlatılamaz",async()=>{
  const h=await harness();h.stubDownloads();await h.transition(verifiedUser());
  const idle=deferred();h.context.idlePromise=idle.promise;h.run("waitForCloudIdle=()=>idlePromise;");
  const changed=h.authCallback(verifiedUser("next-account"));await h.settle();
  assert.equal(h.run("user"),null);h.run("window.yksCloudSchedule();");assert.equal(h.calls.downloads,1);
  idle.resolve();await changed;
});

test("kalıcı oturum hazırlanamazsa doğrulanmış kullanıcı bile bulut eşitlemesini başlatamaz",async()=>{
  const h=await harness({persistence:Promise.reject(new Error("storage blocked"))});h.stubDownloads();await h.transition(verifiedUser());
  assert.equal(h.run("user"),null);assert.equal(h.calls.downloads,0);assert.equal(h.calls.listeners,0);assert.equal(h.elements.cloudSyncBox.dataset.state,"error");
});

test("e-posta işlemi sürerken paralel Google girişi açılmaz",async()=>{
  const pending=deferred();const h=await harness();h.hooks.email=()=>pending.promise;await h.event("cloudAuthForm","submit");await h.event("cloudLoginBtn");
  assert.equal(h.calls.popup,0);pending.resolve();await h.settle();assert.equal(h.run("authBusy"),false);
});

test("çıkış ağ yanıtını beklerken buluta yeni kayıt gönderilemez",async()=>{
  const h=await harness();h.stubDownloads();await h.transition(verifiedUser());
  const pending=deferred();h.hooks.signOut=()=>pending.promise;const signingOut=h.elements.cloudLogoutBtn.listeners.click();await h.settle();
  assert.equal(h.run("user"),null);h.run("window.yksCloudSchedule();");await h.run("upload()");assert.equal(h.calls.writes,0);
  pending.resolve();await signingOut;
});
