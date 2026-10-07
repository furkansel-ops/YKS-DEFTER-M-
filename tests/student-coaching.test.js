const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
const read=file=>fs.readFileSync(path.join(root,file),"utf8");
const exists=file=>fs.existsSync(path.join(root,file));

test("öğrenci uygulaması yalnız öğrenci hesabı olarak açılır ve koç paneline yönlendirme içermez",()=>{
  const loader=read("src/ui/student-account-loader.ts"),runtime=read("public/student-coaching-runtime.js");
  assert.match(loader,/sessionStorage\.setItem\(PENDING_ROLE,"student"\)/);
  assert.match(loader,/publicRegistration="student-only"/);
  assert.doesNotMatch(loader,/YKS-DEFTER-M-Ko-Paneli|window\.location\.(?:replace|assign)|coachDashboard/);
  assert.match(runtime,/role:"student"/);
  assert.doesNotMatch(runtime,/roleModal|Koçluk Paneli|coachDashboard/);
});

test("öğrenci hesap köprüleri auth başlamadan önce güvenli sırada yüklenir",()=>{
  const loader=read("src/ui/student-account-loader.ts");
  const bridgeAt=loader.indexOf("student-coaching-runtime.js?v=1.2.19");
  const linkAt=loader.indexOf("student-coach-link.js?v=1.3.1");
  const programAt=loader.indexOf("student-program-share-v2.js?v=3.6.2");
  const authAt=loader.indexOf("auth-session-runtime.js?v=1.6.0");
  assert.ok(bridgeAt>=0&&linkAt>bridgeAt&&programAt>linkAt&&authAt>programAt);
});

test("öğrenci koç paylaşımı yalnız güvenli coachingShares görünümünü günceller",()=>{
  const runtime=read("public/student-coaching-runtime.js");
  assert.match(runtime,/coachingShares/);
  assert.match(runtime,/const payload=sharePayload\(s,rt\.user\)/);
  assert.match(runtime,/const ref=doc\(rt\.db,"coachingShares",rt\.user\.uid\)/);
  assert.match(runtime,/await setDoc\(ref,payload,\{merge:true\}\)/);
  assert.doesNotMatch(runtime,/collection\(rt\.db,"users"/);
  assert.doesNotMatch(runtime,/program:\{weeks\}/);
});

test("koç paylaşımı yazma sürerken gelen son öğrenci değişikliğini tekrar yayınlar",()=>{
  const runtime=read("public/student-coaching-runtime.js");
  assert.match(runtime,/sharing:false,pending:false/);
  assert.match(runtime,/if\(rt\.sharing\)\{/);
  assert.match(runtime,/rt\.pending=true/);
  assert.match(runtime,/if\(manual&&rt\.inFlight\)await rt\.inFlight/);
  assert.match(runtime,/rt\.sharing=false;\s*rt\.inFlight=null;\s*if\(rt\.pending\)\{rt\.pending=false;scheduleShare\(120\)\}/);
  assert.match(runtime,/rt\.shareTimer=null;clearInterval\(rt\.shareInterval\);rt\.shareInterval=null;rt\.sharing=false;rt\.pending=false;rt\.inFlight=null/);
});

test("Programım paylaşımı öğrenci köprüsünde tam yapıyı korur",()=>{
  const runtime=read("public/student-program-share-v2.js");
  for(const token of["PROGRAM_VERSION=3","MAX_PROGRAM_WEEKS=80","rowLabels","rows","weeks","done","dn","mv","coachingShares"])assert.ok(runtime.includes(token),token);
  assert.match(runtime,/version:PROGRAM_VERSION,rows,rowLabels:labels,weeks/);
  assert.match(runtime,/yks:data-changed/);
  assert.match(runtime,/onSnapshot\(ref/);
  assert.match(runtime,/YKSStudentProgramShareV2/);
  assert.doesNotMatch(runtime,/users.*sync/);
});

test("koçtan öğrenciye işlemler yalnız kontrollü action tipleriyle uygulanır",()=>{
  const runtime=read("public/student-coaching-runtime.js");
  for(const type of["program_task","topic_deadline","coach_note","post_exam_task"])assert.ok(runtime.includes(type),type);
  assert.match(runtime,/coachingActions/);
  assert.match(runtime,/status:"applied"/);
  assert.match(runtime,/status:"rejected"/);
});

test("öğrenci ayarlarında yalnız Koç Kodum bağlantı kartı bulunur",()=>{
  const runtime=read("public/student-coach-link.js");
  assert.match(runtime,/studentCoachCodeSettings/);
  assert.match(runtime,/Koç Kodum/);
  assert.match(runtime,/CODE_LENGTH=12/);
  assert.match(runtime,/crypto\.getRandomValues/);
  assert.match(runtime,/studentCoachAccess/);
  assert.match(runtime,/studentCoachCodes/);
  assert.match(runtime,/Bağlantıyı kes/);
  assert.doesNotMatch(runtime,/addStudentByCode|enhanceCoachDashboard|Öğrencilerim|Öğrenci ekle|yksCoachDashboard/);
});

test("Firestore koç bağlantısı sözleşmesini korurken ham öğrenci sync verisini kapalı tutar",()=>{
  const rules=read("firestore.rules");
  assert.match(rules,/function validStudentCoachCode/);
  assert.ok(rules.includes("accessCode.matches('^[A-Z2-9]{12}$')"));
  assert.match(rules,/match \/studentCoachAccess\/\{studentUid\}/);
  assert.match(rules,/match \/studentCoachCodes\/\{accessCode\}/);
  assert.match(rules,/match \/studentCoachCodes\/\{accessCode\}[\s\S]*allow list: if false/);
  assert.match(rules,/activeCoachingLink\(studentUid, request\.auth\.uid\)/);
  assert.match(rules,/match \/users\/\{userId\}\/sync\/meta[\s\S]*allow read: if ownsUserSpace\(userId\)/);
});

test("koç paneli uygulama dosyaları öğrenci paketinde bulunmaz",()=>{
  for(const file of[
    "public/coach-dashboard-v2.js","public/coach-register.html","public/coach-register.js","public/coach-invites.html",
    "public/coach-student-link-hotfix.js","public/coach-student-directory-v2.js","public/coach-account-runtime.js",
    "public/coach-program-share-v2.js","src/ui/coach-account-loader.ts"
  ])assert.equal(exists(file),false,file);
  for(const file of["public/student-coaching-runtime.js","public/student-coach-link.js","public/student-program-share-v2.js","src/ui/student-account-loader.ts"])assert.equal(exists(file),true,file);
});

test("koç hesabı normal öğrenci bulut snapshot zincirini başlatmaz",()=>{
  const vite=read("vite.config.mts");
  assert.match(vite,/account&&account\.role/);
  assert.match(vite,/user=null;status\("Koç hesabı"/);
  assert.match(vite,/await waitAccountRuntime\(\)/);
});


test("Programım v3 koç aynası için değişiklikleri canlı ve tekrarsız yayınlar",()=>{
  const runtime=read("public/student-program-share-v2.js");
  for(const token of["PROGRAM_VERSION=3","syncedAt:Date.now()","payloadHash","lastHash","studentProgramSync=\"v3\""])assert.ok(runtime.includes(token),token);
  assert.match(runtime,/if\(!manual&&hash&&hash===rt\.lastHash\)return true/);
  assert.match(runtime,/rt\.lastHash=hash/);
});


test("Programım paylaşımı yerel değişiklikleri event olmasa da izler",()=>{
  const runtime=read("public/student-program-share-v2.js");
  for(const token of["watchLocalProgram","setInterval(watchLocalProgram,1500)","localProgramHash","version:\"3.6.2\""])assert.ok(runtime.includes(token),token);
  assert.match(runtime,/remoteHash!==currentHash/);
});


test("Ana koç paylaşımı Programım verisini doğrudan taşır",()=>{
  const runtime=read("public/student-coaching-runtime.js");
  for(const token of["buildProgramShare","program:buildProgramShare(s)","version:3","rowLabels","weeks"])assert.ok(runtime.includes(token),token);
  assert.match(runtime,/programWeekHasData/);
  assert.match(runtime,/cleanProgramMatrix/);
});


test("Koç eşitleme runtime web ve native açılışta garanti edilir ve save sinyali üretir",()=>{
  const shell=read("src/ui/play-store-shell.ts");
  const loader=read("src/ui/student-account-loader.ts");
  const runtime=read("public/student-coaching-runtime.js");
  const app=read("app.js");
  assert.match(shell,/import\("\.\/student-account-loader"\)/);
  assert.match(shell,/installStudentAccountLoader\(\)/);
  assert.match(shell,/const native=isNativeApp\(\)/);
  assert.match(loader,/student-coaching-runtime\.js\?v=1\.2\.19/);
  assert.match(runtime,/version:\"1\.2\.19\"/);
  assert.match(app,/CustomEvent\(\"yks:data-changed\"/);
  assert.match(app,/source:\"save\"/);
});


test("Program paylaşımı coachingShares yoksa tam güvenli belge oluşturur",()=>{
  const runtime=read("public/student-program-share-v2.js");
  assert.match(runtime,/bootstrapSharePayload/);
  assert.match(runtime,/writeProgramShare/);
  assert.match(runtime,/setDoc\(ref,\{program,updatedAt:serverTimestamp\(\)\},\{merge:true\}\)/);
  assert.match(runtime,/setDoc\(ref,bootstrapSharePayload\(program\)\)/);
  assert.match(runtime,/profile:\{name,track:"",targetNetTYT:0,targetNetAYT:0,targetUniversity:"",targetDepartment:""\}/);
});


test("koç paylaşımı eski coachingShares belgesini güvenli tam yazımla onarır ve periyodik yeniler",()=>{
  const runtime=read("public/student-coaching-runtime.js");
  assert.match(runtime,/await setDoc\(ref,payload,\{merge:true\}\)/);
  assert.match(runtime,/await setDoc\(ref,payload\)/);
  assert.match(runtime,/scheduleShare\(5000\)/);
  assert.match(runtime,/setInterval\(\(\)=>scheduleShare\(120\),60000\)/);
  assert.match(runtime,/clearInterval\(rt\.shareInterval\)/);
});


test("öğrenci koça bilgileri manuel paylaşabilir ve program paylaşımı zorlanabilir",()=>{
  const link=read("public/student-coach-link.js");
  const program=read("public/student-program-share-v2.js");
  assert.match(link,/Koça bilgileri paylaş/);
  assert.match(link,/data-coach-share-now/);
  assert.match(link,/YKSAccountAuth\?\.publishShare/);
  assert.match(link,/publishShare\(\{manual:true\}\)/);
  assert.match(link,/YKSStudentProgramShareV2\?\.publish/);
  assert.match(link,/publish\(true\)/);
  assert.match(link,/Paylaşım başarısız ·/);
  assert.match(link,/studentCoachProgramShare/);
  assert.match(program,/async function publishProgram\(force=false\)/);
  assert.match(program,/if\(!manual&&hash&&hash===rt\.lastHash\)return true/);
  assert.match(program,/version:"3\.6\.2"/);
});


test("manuel koç paylaşımı devam eden otomatik yazımı bekler ve gerçek Firebase hatasını döndürür",()=>{
  const runtime=read("public/student-coaching-runtime.js");
  const program=read("public/student-program-share-v2.js");
  assert.match(runtime,/rt\.inFlight/);
  assert.match(runtime,/options\?\.manual===true/);
  assert.match(runtime,/if\(manual&&rt\.inFlight\)await rt\.inFlight/);
  assert.match(runtime,/dataset\.coachShareError/);
  assert.match(program,/if\(manual&&rt\.inFlight\)await rt\.inFlight/);
  assert.match(program,/dataset\.studentProgramShareError/);
  assert.match(program,/version:"3\.6\.2"/);
});


test("Program paylaşımı Firestore için iç içe array üretmez",()=>{
  const main=read("public/student-coaching-runtime.js");
  const program=read("public/student-program-share-v2.js");
  assert.match(main,/out\[String\(r\)\]=Array\.from\(\{length:7\}/);
  assert.match(program,/out\[String\(r\)\]=Array\.from\(\{length:7\}/);
  assert.doesNotMatch(main,/return Array\.from\(\{length:rowCount\}/);
  assert.doesNotMatch(program,/return Array\.from\(\{length:rowCount\}/);
});


test("koç program görevleri video bağlantısı ve ayrıntılar için 600 karaktere kadar korunur",()=>{
  const runtime=read("public/student-coaching-runtime.js");
  assert.match(runtime,/text\(p\.text,600\)/);
  assert.match(runtime,/version:"1\.2\.19"/);
});


test("koç görev dinleyicisi state beklemeden başlar ve işlemleri sıraya alır",()=>{
  const runtime=read("public/student-coaching-runtime.js");
  const start=runtime.indexOf("function startStudent");
  const listener=runtime.indexOf("onSnapshot(q",start);
  const wait=runtime.indexOf("waitForState(4000",start);
  assert.ok(start>=0&&listener>start&&wait>listener);
  assert.match(runtime,/actionQueue:Promise\.resolve\(\)/);
  assert.match(runtime,/queueAction\(change,session\)/);
  assert.match(runtime,/visibilitychange/);
  assert.match(runtime,/addEventListener\("online",wake\)/);
});


test("koç görevi uygulandıktan sonra program paylaşımı zorla gönderilir",()=>{
  const runtime=read("public/student-coaching-runtime.js");
  const program=read("public/student-program-share-v2.js");
  assert.match(runtime,/window\.S\|\|window\.YKSLegacyState/);
  assert.match(program,/window\.S\|\|window\.YKSLegacyState/);
  assert.match(runtime,/YKSStudentProgramShareV2\?\.publish\?\.\(true\)/);
  const apply=runtime.indexOf("const result=applyAction(a)");
  const publish=runtime.indexOf("YKSStudentProgramShareV2?.publish?.(true)",apply);
  const applied=runtime.indexOf('status:"applied"',apply);
  assert.ok(apply>=0&&publish>apply&&applied>publish);
});


test("koç günlük program sırası kontrollü action ile uygulanır ve anında paylaşılır",()=>{
  const runtime=read("public/student-coaching-runtime.js");
  assert.match(runtime,/operation==="order"/);
  assert.match(runtime,/programSetDayOrder/);
  assert.match(runtime,/YKSStudentProgramShareV2\?\.publish\?\.\(true\)/);
});


test("program_task move işlemi görevi başka güne taşır ve paylaşımı tetikler",()=>{
  const runtime=read("public/student-coaching-runtime.js"),app=read("app.js");
  assert.match(runtime,/p\.operation==="move"/);
  assert.match(runtime,/programMoveTaskToDate/);
  assert.match(app,/function programMoveTaskToDate/);
  assert.match(app,/targetOrder\.push\(targetCid\)/);
  assert.match(runtime,/YKSStudentProgramShareV2\?\.publish\?\.\(true\)/);
});


test("program_task edit işlemi doğrudan hücre güncelleme köprüsünü kullanır",()=>{
  const runtime=read("public/student-coaching-runtime.js"),app=read("app.js");
  assert.match(runtime,/p\.operation==="edit"/);
  assert.match(runtime,/programUpdateTask/);
  assert.match(runtime,/programEditTask/);
  assert.match(app,/function programUpdateTask/);
  assert.match(app,/function programEditTask/);
});

test("koçtan yeni program görevi güvenli gün ekleme yolunu tercih eder",()=>{
  const runtime=read("public/student-coaching-runtime.js"),app=read("app.js");
  assert.match(runtime,/typeof window\.addToDays==="function"/);
  assert.match(runtime,/window\.addToDays\(prefix\+v,\[di\.day\],di\.weekOffset\)/);
  assert.match(runtime,/window\.addToDay/);
  assert.match(app,/function addToDays/);
});


test("gün sonu değerlendirmesi koç paylaşımına güvenli şekilde eklenir",()=>{
  const runtime=read("public/student-coaching-runtime.js"),html=read("index.html"),css=read("app.css"),app=read("app.js");
  assert.match(runtime,/dayReviews=Object\.entries\(s\.dayReview/);
  assert.match(runtime,/dayReview:\{entries:dayReviews\}/);
  assert.match(runtime,/slice\(-14\)/);
  assert.match(runtime,/note:text\(value\?\.note,3000\)/);
  assert.match(html,/id="todayCloseSaved"/);
  assert.match(html,/id="todayReflectionInput" maxlength="3000" rows="6"/);
  assert.match(html,/Kaydet ve koçuma gönder/);
  assert.match(app,/trim\(\)\.slice\(0,3000\)/);
  assert.match(html,/koç bağlantın açıksa raporun koçuna da görünür/);
  assert.match(css,/today-close-saved/);
});


test("gün sonu ruh hali Kaydet basılmadan koça gönderilmez",()=>{
  const app=read("app.js");
  const moodStart=app.indexOf("function setTodayMood");
  const saveStart=app.indexOf("function saveTodayReflection",moodStart);
  const moodBlock=app.slice(moodStart,saveStart);
  const saveEnd=app.indexOf("function v25RenderClose",saveStart);
  const saveBlock=app.slice(saveStart,saveEnd);
  assert.match(moodBlock,/todayMoodDraft=\{date:todayKey\(\),mood\}/);
  assert.doesNotMatch(moodBlock,/\bsave\(\)/);
  assert.match(saveBlock,/const old=S\.dayReview\[k\]\|\|\{\},mood=todayMoodDraft\.date===k\?todayMoodDraft\.mood/);
  assert.match(saveBlock,/S\.dayReview\[k\]=\{mood,note,at:Date\.now\(\)\}/);
  assert.match(saveBlock,/\bsave\(\)/);
  assert.match(app,/Kaydet'e basınca koçunla paylaşılacak/);
});


test("ruh hali seçimi yazılmış gün sonu cümlesini silmez",()=>{
  const app=read("app.js");
  assert.match(app,/if\(document\.activeElement!==inp&&!draftMood\)inp\.value=r\.note\|\|""/);
  assert.match(app,/todayMoodDraft=\{date:"",mood:""\};[\s\S]*save\(\);[\s\S]*v25RenderClose\(\)/);
});


test("koç program görevini öğrencinin programından güvenli şekilde silebilir",()=>{
  const runtime=read("public/student-coaching-runtime.js"),app=read("app.js");
  assert.match(runtime,/p\.operation==="delete"/);
  assert.match(runtime,/window\.programDeleteTask\(sourceWeek,taskId\)/);
  assert.match(app,/function programDeleteTask/);
  assert.match(app,/delete w\.dn\[id\]/);
  assert.match(app,/w\.mv\[orderKey\]=w\.mv\[orderKey\]\.filter\(taskId=>taskId!==id\)/);
});
