const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");

const root=path.resolve(__dirname,"..");
const read=file=>fs.readFileSync(path.join(root,file),"utf8");
const launch=read("src/ui/launch-screen-v63.ts");
const welcome=read("src/ui/auth-welcome-v60.ts");

test("v63 açılış ekranı ilk kurulumdan sonra her açılışta karşılama modülünden kurulur",()=>{
  assert.match(welcome,/import \{installLaunchScreenV63\} from "\.\/launch-screen-v63"/);
  const tail=welcome.slice(welcome.indexOf("const choice=store(ENTRY_KEY);"));
  assert.match(tail,/if\(choice\)\{[\s\S]*?launch\(\);/);
  assert.match(tail,/else if\(hadCloudAccount\(\)\)\{[\s\S]*?launch\(\);/);
  assert.match(tail,/\}else\{\s*open\("welcome"\);/);
  assert.match(welcome,/try\{installLaunchScreenV63\([\s\S]*?\}\s*catch\(error\)\{console\.error\("Açılış ekranı başlatılamadı"/);
});

test("v63 giriş yapmış kullanıcıya şifre sormaz, tek dokunuşla girer",()=>{
  assert.match(launch,/data-enter>Uygulamaya gir</);
  assert.doesNotMatch(launch,/type="password"|reauthenticate/);
  assert.match(launch,/if\(target\.hasAttribute\("data-enter"\)\)close\(\)/);
});

test("v63 günün sözünü mevcut #sozBox kaynağından okur ve Bugün kartını yalnız kurulunca gizler",()=>{
  assert.match(launch,/getElementById\("sozBox"\)/);
  assert.match(launch,/#sozBox \.szr/);
  assert.match(launch,/dataset\.launchQuote="moved"/);
  assert.match(read("src/ui/launch-screen-v63.css"),/:root\[data-launch-quote="moved"\] #todayFreshQuoteCard\{display:none!important\}/);
  // Söz kaynağı ve Bugün kartı DOM'da kalır; yalnız görünüm taşınır.
  assert.match(read("src/ui/today-top-v33.ts"),/todayFreshQuoteCard/);
});

test("v63 karşılama ekranında giriş tamamlanınca kapanır ve katman sırası doğrudur",()=>{
  assert.match(welcome,/dispatchEvent\(new CustomEvent\("yks:entry-finished"/);
  assert.match(launch,/addEventListener\("yks:entry-finished"/);
  assert.match(read("src/ui/launch-screen-v63.css"),/z-index:100450/);
});

test("v63 oturum başına bir kez gösterilir: yenilemede gelmez, uygulama yeniden açılınca gelir",()=>{
  assert.match(launch,/SESSION_KEY="yks_launch_seen_v1"/);
  assert.match(launch,/if\(sessionStorage\.getItem\(SESSION_KEY\)\)\{[^}]*return \{installed:false\};\}/);
  assert.match(launch,/sessionStorage\.setItem\(SESSION_KEY,"1"\)/);
  // Söz atlanan açılışta da Bugün'de görünmez.
  assert.ok(launch.indexOf('dataset.launchQuote="moved"')<launch.indexOf("sessionStorage.getItem(SESSION_KEY)"));
});

test("v63 orta alan Bugün ve son 7 gün verisini salt okunur gösterir",()=>{
  assert.match(launch,/yksTodayDailyProgressSnapshot\?\.\(\)/);
  assert.match(launch,/todayTaskOptions\?\.\(\)/);
  assert.match(launch,/readState\?\.\(\)\?\.pomoMin/);
  assert.doesNotMatch(launch,/\.save\?\.\(|localStorage\.setItem\("yks_|pomoMin\[[^\]]+\]\s*=/);
  assert.match(read("src/ui/launch-screen-v63.css"),/@media \(min-width:760px\)/);
});

test("v63 bağlantı yoksa daha önce hesapla girilmiş cihazı içeride tutar",()=>{
  assert.match(launch,/result==="timeout"/);
  assert.match(launch,/localStorage\.getItem\(deps\.entryKey\)==="account"/);
});
