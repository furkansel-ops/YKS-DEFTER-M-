const test=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path"),{spawnSync}=require("node:child_process");
const {pathToFileURL}=require("node:url");

const root=path.resolve(__dirname,"..");
const read=p=>fs.readFileSync(path.join(root,p),"utf8");
const url=p=>pathToFileURL(path.join(root,p)).href;
function run(lines,marker){
  const result=spawnSync(process.execPath,["--experimental-strip-types","--input-type=module","-e",lines.join("\n")],{cwd:root,encoding:"utf8",timeout:20000});
  assert.equal(result.status,0,result.stdout+"\n"+result.stderr);
  assert.match(result.stdout,new RegExp(marker));
}

test("v113 plan: fotoğraflı çözülmemiş yanlışlar ve konu tekrarları gün gün birikir; bozuk veri çökmez",()=>{
  run([
    'import assert from "node:assert/strict";',
    `import {reminderPlan,reminderText,reminderTime,wrongDueDates} from "${url("src/domain/review-reminder.ts")}";`,
    'const img="data:image/jpeg;base64,QQ==";',
    'const s={wrongLog:[',
    '  {id:1,questionImgs:[img]},',                                   // sırası yok: bugün
    '  {id:2,questionImgs:[img],rep:{due:"2026-11-10",ok:0,miss:1}},', // gecikmiş: bugüne çekilir
    '  {id:3,questionImgs:[img],rep:{due:"2026-11-15",ok:1,miss:0}},', // 3 gün sonra
    '  {id:4,questionImgs:[]},',                                       // fotoğrafsız: sayılmaz
    '  {id:5,questionImgs:[img]},',                                    // Hata Defteri\'nde çözüldü
    '  {id:6,questionImg:img,resolved:true},null,"x"],',
    ' errorJournal:[{sourceRef:"wrong:5",resolved:true}],',
    ' topics:{"TYT|Fizik|Kuvvet":{st:3,ts:"2026-11-10",rev:[]},"TYT|Fizik|Optik":{st:2,ts:"2026-11-01",rev:[]},"TYT|Kimya|Mol":{st:3,ts:"2026-11-01",rev:[0,1,2]}}};',
    'assert.deepEqual(wrongDueDates(s,"2026-11-12"),["2026-11-12","2026-11-12","2026-11-15"]);',
    'const plan=reminderPlan(s,"2026-11-12",7,[3,7,21]);',
    'assert.equal(plan.length,7);assert.equal(plan[0].date,"2026-11-12");assert.equal(plan[6].date,"2026-11-18");',
    'assert.deepEqual(plan.map(d=>d.wrongs),[2,2,2,3,3,3,3]);',
    'assert.deepEqual(plan.map(d=>d.topics),[0,1,1,1,1,2,2],"Kuvvet: 3. gün 13 Kasım, 7. gün 17 Kasım");',
    'assert.deepEqual(reminderPlan(undefined,"2026-11-12",3).map(d=>d.wrongs+d.topics),[0,0,0]);',
    'assert.equal(reminderPlan({},"2026-12-30",4)[3].date,"2027-01-02","yıl geçişi");',
    'assert.equal(reminderText(4,2),"4 yanlış sorunun tekrar günü geldi · 2 konunun tekrar zamanı geldi");',
    'assert.equal(reminderText(0,1),"1 konunun tekrar zamanı geldi");',
    'assert.equal(reminderTime("07:30"),"07:30");for(const bad of ["24:00","7:30","",null,"19:60"])assert.equal(reminderTime(bad),"19:00");',
    'console.log("OK plan");'
  ],"OK plan");
});

test("v113 bağlantı: Android'de cihaz bildirimi planlanır, web açılış bildirimi yanlışları sayar, ayarda saat var",()=>{
  const ui=read("src/ui/review-reminder-v113.ts"),shell=read("src/ui/refined-shell.ts"),app=read("app.js"),html=read("index.html"),pkg=JSON.parse(read("package.json"));
  assert.equal(pkg.dependencies["@capacitor/local-notifications"],"8.3.1");
  assert.match(read("android/capacitor.settings.gradle"),/capacitor-local-notifications/);
  assert.match(shell,/try\{installReviewReminderV113\(\);\}catch/);
  assert.match(ui,/if\(!native\(\)\)return Promise\.resolve\(\);/,"web'de planlama yok");
  assert.match(ui,/LocalNotifications\.cancel\(\{notifications:ids\}\)/,"eski planlar önce silinir");
  assert.match(ui,/permission!=="granted"\|\|c\.review===false\)return;/,"izin yoksa ya da kapalıysa planlanmaz");
  assert.match(ui,/x\.when\.getTime\(\)>now/,"geçmiş saat planlanmaz");
  assert.match(ui,/visibilityState==="hidden"/,"uygulamadan çıkınca güncel veriyle yeniden planlanır");
  assert.match(ui,/L\.askNotif=async/);
  assert.doesNotMatch(read("android/app/src/main/AndroidManifest.xml"),/SCHEDULE_EXACT_ALARM|USE_EXACT_ALARM/,"tam saat alarmı izni istenmez");
  assert.match(app,/let w=0;try\{ w=Number\(window\.YKSReviewReminder\?\.dueWrongsToday\?\.\(\)\)\|\|0; \}catch\(e\)\{\}\s*if\(!n&&!od&&!w\)return false;/);
  assert.match(html,/id="notifReview" onclick="toggleNotif\('review'\)"/);
  assert.match(ui,/input\.id="notifReviewTime"/);assert.match(ui,/if\(native\(\)\)mountTimeRow\(\);/,"saat satırı web'de gösterilmez");assert.match(ui,/toggle\.after\(label,row\)/,"saat satırı Tekrar zamanı düğmesinin altında");
});
