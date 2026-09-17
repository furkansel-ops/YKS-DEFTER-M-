const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
const read=file=>fs.readFileSync(path.join(root,file),"utf8");
const exists=file=>fs.existsSync(path.join(root,file));

test("YKS Defterim içinde gömülü koç dashboardu bulunmaz",()=>{
  assert.equal(exists("public/coach-dashboard-v2.js"),false);
  const loader=read("src/ui/coach-account-loader.ts");
  assert.doesNotMatch(loader,/coach-dashboard-v2\.js|COACH_DASHBOARD_V2_SCRIPT_ID|yksCoachDashboard/);
});

test("koç kayıt ve davet sayfaları öğrenci uygulamasından kaldırılmıştır",()=>{
  for(const file of["public/coach-register.html","public/coach-register.js","public/coach-invites.html"])assert.equal(exists(file),false,file);
});

test("koç hesabı ayrı YKS Koç Paneli adresine yönlendirilir",()=>{
  const loader=read("src/ui/coach-account-loader.ts");
  assert.match(loader,/https:\/\/furkansel-ops\.github\.io\/YKS-DEFTER-M-Ko-Paneli\//);
  assert.match(loader,/window\.location\.replace\(COACH_PANEL_URL\)/);
  assert.match(loader,/coachDashboard="external-only"/);
});

test("öğrenci uygulaması yalnız paylaşım ve bağlantı köprülerini yükler",()=>{
  const loader=read("src/ui/coach-account-loader.ts");
  const bridgeAt=loader.indexOf("student-coaching-runtime.js?v=1.1.0");
  const linkAt=loader.indexOf("student-coach-link.js?v=1.0.0");
  const programAt=loader.indexOf("coach-program-share-v2.js?v=2.0.0");
  const authAt=loader.indexOf("auth-session-runtime.js?v=1.6.0");
  assert.ok(bridgeAt>=0&&linkAt>bridgeAt&&programAt>linkAt&&authAt>programAt);
  assert.doesNotMatch(loader,/coach-account-runtime|coach-student-directory|coach-student-link-hotfix/);
});

test("Programım v2 paylaşım sözleşmesi aynen korunur",()=>{
  const runtime=read("public/coach-program-share-v2.js");
  for(const token of["PROGRAM_VERSION=2","rowLabels","weeks","done","dn","mv","coachingShares"])assert.ok(runtime.includes(token),token);
});
