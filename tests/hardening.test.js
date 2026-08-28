const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const {pathToFileURL}=require("node:url");
const root=path.resolve(__dirname,"..");
const url=file=>pathToFileURL(path.join(root,file)).href;

test("konu servisi boş ders ve ayraç içeren konu adında kararlı kalır",async()=>{
  const topics=await import(url("src/domain/topic-service.ts")),state={topics:{}};
  assert.deepEqual(topics.subjectProgress(state,"TYT",{name:"Boş",topics:[]}),{pct:0,full:0,total:0});
  const key=topics.topicKey("TYT","Matematik","Fonksiyon | Grafik");
  state.topics[key]={st:3,conf:3,ts:"2026-08-01",rev:[]};
  const queue=topics.reviewQueue(state,"2026-08-26",[3]);
  assert.equal(queue.length,1);assert.equal(queue[0].topic,"Fonksiyon | Grafik");
});

test("yedek oluşturma structuredClone desteğine bağlı değildir",async()=>{
  const {createBackupPackage}=await import(url("src/data/backup-service.ts")),previous=global.structuredClone;
  try{
    global.structuredClone=undefined;
    const result=createBackupPackage(JSON.stringify({v:21,name:"Test",yt:{key:"gizli"},focus:{sw:{run:true,start:5}}}),"4.1.0");
    assert.equal(result.ok,true);const payload=JSON.parse(result.text);assert.equal(payload.data.yt.key,"");assert.equal(payload.data.focus.sw.run,false);
  }finally{if(previous===undefined)delete global.structuredClone;else global.structuredClone=previous;}
});

test("PWA runtime service worker hazır olduğunda durum yenilemesini dinler",async()=>{
  const {installPwaRuntime}=await import(url("src/pwa/pwa-runtime.ts")),workerListeners={};
  const serviceWorker={controller:null,ready:Promise.resolve({active:null}),addEventListener:(name,callback)=>{workerListeners[name]=callback;}};
  const fakeWindow={navigator:{serviceWorker,userAgent:"Test"},matchMedia:()=>({matches:false}),addEventListener:()=>{}};
  const fakeDocument={readyState:"complete",getElementById:()=>null,addEventListener:()=>{}};
  const api=installPwaRuntime("4.1.0-r20",fakeWindow,fakeDocument);await Promise.resolve();
  assert.equal(typeof workerListeners.controllerchange,"function");assert.equal(api.installState(),"manual");
});

test("ertelenmiş ekran çizimleri hata günlüğü korumasından geçer",()=>{
  const runtime=fs.readFileSync(path.join(root,"src/ui/screen-runtime.ts"),"utf8");
  assert.match(runtime,/#safeDeferred/);assert.match(runtime,/screen-deferred:/);assert.match(runtime,/requestAnimationFrame\(safe\)/);assert.match(runtime,/setTimeout\(safe,/);
});

test("kalıcı CI ana dalı denetler, tek Pages deploy kullanır ve eski tek-seferlik workflowlar kaldırılmıştır",()=>{
  const ci=fs.readFileSync(path.join(root,".github/workflows/ci.yml"),"utf8"),deploy=fs.readFileSync(path.join(root,".github/workflows/deploy-pages.yml"),"utf8"),verify=fs.readFileSync(path.join(root,"scripts/verify-dist.mjs"),"utf8");
  assert.match(ci,/branches:\s*\n\s*- main/);assert.match(ci,/npm run release:check/);
  assert.doesNotMatch(deploy,/Eski GitHub Pages dağıtımı|workflow_runs|gh api/);assert.match(deploy,/path: \.\/dist/);assert.match(deploy,/actions\/deploy-pages@v5/);
  for(const file of ["fix-personal-cleanup-test.yml","personal-cleanup-stage2.yml","personal-cleanup-stage2b.yml","personal-cleanup-stage2c.yml","personal-cleanup-stage2d.yml","release-v4.1.0.yml"])assert.equal(fs.existsSync(path.join(root,".github/workflows",file)),false,file);
  assert.match(verify,/APP_BUILD=\"4\.1\.0-r20\"/);assert.match(verify,/yks-core-v4\.1\.0-r35/);assert.match(verify,/motivation-quotes-v1\.js/);assert.match(verify,/motivation-quotes-v2\.css/);assert.match(verify,/ui-polish-home-v2\.css/);assert.match(verify,/version\.json kararlı sürümle eşleşmiyor/);
});