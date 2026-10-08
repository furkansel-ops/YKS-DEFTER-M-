"use strict";
const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const root=path.resolve(__dirname,"..");
const read=p=>fs.readFileSync(path.join(root,p),"utf8");
test("iPad notification permission is requested synchronously during a real user tap",()=>{
 const client=read("public/smart-push-client.js"),ui=read("src/ui/smart-reminders.ts");
 const start=client.indexOf("async function enable(){");
 const end=client.indexOf("async function disable(){",start);
 assert.ok(start>0&&end>start);
 const body=client.slice(start,end),prompt=body.indexOf("Notification.requestPermission()");
 assert.ok(prompt>0,"push permission prompt must exist");
 assert.doesNotMatch(body.slice(0,prompt),/\bawait\s+/,
  "Apple permission cannot be requested after an asynchronous Firebase lookup");
 assert.match(client,/publicVapid=typeof vapid/);
 assert.match(ui,/api\.enable\(\)/);
 assert.match(ui,/api\.disable\(\)/);
 assert.match(ui,/api\.localTest\(\)/);
 assert.match(ui,/Yerel test yalnız cihazın/);
});
test("tablet and phone achievements/tasks/calendar expose responsive, touch-friendly controls",()=>{
 const calendar=read("src/ui/study-insights-panel.css");
 const tasks=read("src/ui/study-tasks-panel.css");
 const badges=read("src/ui/study-gamification.css");
 const notification=read("src/ui/smart-reminders.css");
 const view=read("src/ui/study-insights-panel.ts");
 assert.match(calendar,/min-height:44px/);
 assert.match(calendar,/@media\(max-width:400px\)/);
 assert.match(tasks,/touch-action:manipulation/);
 assert.match(badges,/sg-rest-button/);
 assert.match(notification,/sn-actions\{display:grid;grid-template-columns:1fr/);
 assert.match(view,/key>dateKey\(now\)\?"future":"before-start"/);
});
test("local notification test is never mislabeled as a server-delivered push",()=>{
 const s=read("public/smart-push-client.js");
 assert.match(s,/Bu, sunucu üzerinden gelmeyen yerel bir cihaz bildirimidir/);
 assert.match(s,/gerçek Firebase Push gönderimini doğrulamaz/);
 const source=read("modules/smart-push-worker.js");
 assert.match(source,/worker\.addEventListener\("push"/);
 assert.match(source,/url\.origin!==root\.origin/);
});
