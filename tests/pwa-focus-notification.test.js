const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");

const root=path.resolve(__dirname,"..");
const read=file=>fs.readFileSync(path.join(root,file),"utf8");

test("PWA odak bildirimi service worker üzerinden tek etiketle gösterilir ve kapatılır",()=>{
  const app=read("app.js");
  assert.match(app,/FOCUS_PWA_NOTIFICATION_TAG="yks-focus-running"/);
  assert.match(app,/reg\.showNotification\(title,options\)/);
  assert.match(app,/reg\.getNotifications\(\{tag:FOCUS_PWA_NOTIFICATION_TAG\}\)/);
  assert.match(app,/requireInteraction:true/);
  assert.match(app,/Notification\.permission==="granted"\)return true/);
  assert.doesNotMatch(app,/return !!cfg\.on/);
  assert.match(app,/renotify:true/);
  assert.match(app,/void focusPwaNotificationShow\("pomo"\)/);
  assert.match(app,/void focusPwaNotificationShow\("sw"\)/);
  assert.match(app,/void focusPwaNotificationClose\(\)/);
});

test("Odak bildirimi tıklanınca PWA açılır ve Odak ekranı istenir",()=>{
  const sw=read("sw.js"),app=read("app.js");
  assert.match(sw,/notificationclick/);
  assert.match(sw,/data\.kind==="focus"/);
  assert.match(sw,/postMessage\(\{type:"OPEN_FOCUS"\}\)/);
  assert.match(app,/event\.data\.type==="OPEN_FOCUS"/);
  assert.match(app,/go\("pomo"\)/);
});

test("Android kapsül ve native FocusTimer kodu paketten tamamen kaldırılmıştır",()=>{
  const manifest=read("android/app/src/main/AndroidManifest.xml");
  const activity=read("android/app/src/main/java/com/furkansel/yksdefterim/MainActivity.java");
  assert.doesNotMatch(manifest,/POST_PROMOTED_NOTIFICATIONS|FOREGROUND_SERVICE_SPECIAL_USE|FocusTimerService/);
  assert.doesNotMatch(activity,/FocusTimerPlugin|registerPlugin/);
  assert.equal(fs.existsSync(path.join(root,"android/app/src/main/java/com/furkansel/yksdefterim/FocusTimerService.java")),false);
  assert.equal(fs.existsSync(path.join(root,"android/app/src/main/java/com/furkansel/yksdefterim/FocusTimerPlugin.java")),false);
  const app=read("app.js");
  assert.doesNotMatch(app,/installAndroidFocusNativeRuntime|nativePromise\("FocusTimer"|YKSFocusNativeBridge/);
});
