const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");

const root=path.resolve(__dirname,"..");
const read=file=>fs.readFileSync(path.join(root,file),"utf8");

test("Android odak canlı bildirimi foreground service ve Live Update şartlarını tanımlar",()=>{
  const manifest=read("android/app/src/main/AndroidManifest.xml");
  assert.match(manifest,/android\.permission\.FOREGROUND_SERVICE/);
  assert.match(manifest,/android\.permission\.FOREGROUND_SERVICE_SPECIAL_USE/);
  assert.match(manifest,/android\.permission\.POST_NOTIFICATIONS/);
  assert.match(manifest,/android\.permission\.POST_PROMOTED_NOTIFICATIONS/);
  assert.match(manifest,/\.FocusTimerService/);
  assert.match(manifest,/android:foregroundServiceType="specialUse"/);
  assert.match(manifest,/PROPERTY_SPECIAL_USE_FGS_SUBTYPE/);
});

test("Canlı odak bildirimi sayaç, kapsül isteği ve bildirim aksiyonlarını içerir",()=>{
  const service=read("android/app/src/main/java/com/furkansel/yksdefterim/FocusTimerService.java");
  for(const token of ["setUsesChronometer(true)","setChronometerCountDown(true)","setRequestPromotedOngoing(state.running)","FOREGROUND_SERVICE_IMMEDIATE","FLAG_NO_CLEAR","ACTION_PAUSE","ACTION_RESUME","ACTION_STOP","ACTION_DISMISS","Duraklat","Devam et","Bitir"])assert.ok(service.includes(token),token);
  assert.match(service,/CATEGORY_STOPWATCH/);
  assert.match(service,/checkSelfPermission\(this, Manifest\.permission\.POST_NOTIFICATIONS\)/);
  assert.match(service,/catch \(SecurityException ignored\)/);
  assert.match(service,/Bugün /);
});

test("Capacitor köprüsü native durumunu mevcut Pomodoro ve kronometre akışına bağlar",()=>{
  const plugin=read("android/app/src/main/java/com/furkansel/yksdefterim/FocusTimerPlugin.java");
  const activity=read("android/app/src/main/java/com/furkansel/yksdefterim/MainActivity.java");
  const app=read("app.js");
  assert.match(plugin,/@CapacitorPlugin\([\s\S]*name = "FocusTimer"/);
  assert.match(activity,/registerPlugin\(FocusTimerPlugin\.class\)/);
  assert.match(app,/cap\.nativePromise\("FocusTimer","sync"/);
  assert.match(app,/cap\.addListener\("FocusTimer"/);
  assert.match(app,/focusAction/);
  assert.match(app,/visibilitychange/);
  assert.match(app,/YKSFocusNativeBridge/);
  assert.match(app,/nativeFocusBridgeApply/);
});
