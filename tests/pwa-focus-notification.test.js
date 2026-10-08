const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");

const root=path.resolve(__dirname,"..");
const read=file=>fs.readFileSync(path.join(root,file),"utf8");

test("PWA odak bildiriminin tek sahibi kalıcı bildirim köprüsüdür",()=>{
  const app=read("app.js"),bridge=read("modules/focus-notifications.js"),worker=read("modules/focus-notification-worker.js");
  assert.doesNotMatch(app,/focusPwaNotification|FOCUS_PWA_NOTIFICATION_TAG|yks-focus-running|YKSFocusNotification=/);
  assert.match(bridge,/type:"YKS_FOCUS_REQUEST"/);
  assert.match(bridge,/window\.YKSFocusNotifications=/);
  assert.match(bridge,/notifCfg\(\)\.pomo!==false/);
  assert.doesNotMatch(bridge,/notifCfg\(\)\.on/);
  assert.match(worker,/const TAG = "yks-focus-timer"/);
  assert.match(worker,/registration\.showNotification\(title/);
  assert.match(worker,/registration\.getNotifications\(\{ tag: TAG \}\)/);
  assert.match(worker,/requireInteraction: true, silent: true, renotify: false/);
  assert.match(worker,/"focus-resume" : "focus-pause"/);
});

test("Odak bildirimi açık sayfayı yeniden yüklemeden Odak ekranına yönlendirir",()=>{
  const worker=read("modules/focus-notification-worker.js"),bridge=read("modules/focus-notifications.js");
  assert.match(worker,/function handleClick\(event\)/);
  assert.match(worker,/data\?\.type !== "yks-focus"/);
  assert.match(worker,/client\.postMessage\(\{ type: "YKS_FOCUS_OPEN" \}\)/);
  assert.match(worker,/await client\.focus\(\)/);
  assert.doesNotMatch(worker,/\.navigate\(/);
  assert.match(bridge,/event\.data\?\.type==="YKS_FOCUS_OPEN"/);
  assert.match(bridge,/window\.go\?\.\("pomo"\)/);
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
