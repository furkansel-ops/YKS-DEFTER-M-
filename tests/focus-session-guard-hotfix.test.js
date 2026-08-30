const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
const read=file=>fs.readFileSync(path.join(root,file),"utf8");

test("Sayaç ve Kronometre yeni oturumda ders seçmeden başlamaz",()=>{
  const source=read("src/ui/focus-session-guard-v43.ts"),html=read("index.html");
  assert.match(html,/Oturumu hazırla/);
  assert.match(html,/id="focusCard" data-phase="work" data-run="idle"/);
  assert.match(html,/id="swCard" data-phase="stop" data-run="idle"/);
  assert.match(source,/togglePomo/);
  assert.match(source,/swToggle/);
  assert.match(source,/setPomoSubject/);
  assert.match(source,/pendingMode!==mode\|\|!subjectConfirmed/);
  assert.match(source,/Başlamadan önce dersini seç/);
  assert.match(source,/seçildi ✓ Şimdi Başlat'a bas/);
});

test("duraklatma-devam ve Sayaç mola fazı yeniden ders seçimine zorlanmaz",()=>{
  const source=read("src/ui/focus-session-guard-v43.ts");
  assert.match(source,/data-run/);
  assert.match(source,/!=="idle"/);
  assert.match(source,/mode==="pomo".*data-phase.*!=="work"/s);
  assert.doesNotMatch(source,/\.swStart\s*=/);
  assert.doesNotMatch(source,/\.startPomo\s*=/);
});

test("odak kapısı veri veya Program kayıtlarına doğrudan yazmaz",()=>{
  const source=read("src/ui/focus-session-guard-v43.ts");
  assert.doesNotMatch(source,/localStorage\.(?:setItem|removeItem|clear)/);
  assert.doesNotMatch(source,/indexedDB|Dexie|firebase/i);
  assert.doesNotMatch(source,/\.weeks\[|\.rows\[/);
  assert.doesNotMatch(source,/\bsave\s*\(/);
});

test("odak kapısı çekirdek bootstrap tamamlandıktan sonra fail-open runtime içinde kurulur",()=>{
  const entry=read("src/main.ts"),safe=read("src/ui/v43-safe-runtime.ts");
  const dispatch=entry.indexOf('window.dispatchEvent(new CustomEvent<BootstrapState>("yks:v4-bootstrap"');
  const installRuntime=entry.indexOf("installV43SafeRuntime()");
  assert.ok(dispatch>=0);
  assert.ok(installRuntime>dispatch);
  assert.match(safe,/window\.setTimeout/);
  assert.match(safe,/import\("\.\/focus-session-guard-v43"\)/);
  assert.match(safe,/catch\(error\)\{return publishFeature/);
  assert.match(safe,/v43FocusSessionGuardErrors/);
});

test("tablet dokunma hedefi ve azaltılmış hareket desteği korunur",()=>{
  const style=read("src/ui/focus-session-guard-v43.css");
  assert.match(style,/@media \(pointer:coarse\)/);
  assert.match(style,/min-height:44px/);
  assert.match(style,/@media \(prefers-reduced-motion:reduce\)/);
});
