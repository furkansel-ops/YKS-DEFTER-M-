const test=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path"),{spawnSync}=require("node:child_process");
const {pathToFileURL}=require("node:url");

const root=path.resolve(__dirname,"..");
const read=p=>fs.readFileSync(path.join(root,p),"utf8");

test("v123 hesap: ilk uyarı 50. dakikada, sonra her 30 dakikada",()=>{
  const result=spawnSync(process.execPath,["--experimental-strip-types","--input-type=module","-e",[
    'import assert from "node:assert/strict";',
    `import {breakDue} from "${pathToFileURL(path.join(root,"src/domain/break-reminder.ts")).href}";`,
    'const m=n=>n*60000;',
    'assert.equal(breakDue(m(49),0),false);assert.equal(breakDue(m(50),0),true);',
    'assert.equal(breakDue(m(60),1),false,"ilk uyarıdan sonra hemen yinelenmez");assert.equal(breakDue(m(80),1),true);',
    'assert.equal(breakDue(m(109),2),false);assert.equal(breakDue(m(110),2),true);',
    'console.log("OK break");'
  ].join("\n")],{cwd:root,encoding:"utf8",timeout:20000});
  assert.equal(result.status,0,result.stdout+"\n"+result.stderr);
  assert.match(result.stdout,/OK break/);
});

test("v123 bağlantı: kabukta kurulur, mola paneli ve odak bildirimi kullanılır",()=>{
  const ui=read("src/ui/break-reminder-v123.ts");
  assert.match(read("src/ui/refined-shell.ts"),/try\{installBreakReminderV123\(\);\}catch/);
  assert.match(ui,/L\.swMarkBreak\?\.\(\)/);
  assert.match(ui,/if\(!s\?\.run\)\{since=0;warned=0;hide\(\);return;\}/,"duraklatınca sayaç sıfırlanır");
  assert.match(ui,/YKSNotificationDelivery\?\.show\?\.\("Mola zamanı",[^)]+"pomo"\)/,"bildirim odak ayarına uyar");
  assert.match(read("app.js"),/function swMarkBreak\(\)\{/);
});
