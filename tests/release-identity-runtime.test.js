const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");
const {pathToFileURL}=require("node:url");

const root=path.resolve(__dirname,"..");
const read=file=>fs.readFileSync(path.join(root,file),"utf8");
const release=JSON.parse(read("version.json"));
const app=read("app.js");
const legacyVersion=app.match(/const APP_VERSION="([^"]+)"/)[1];
const legacyBuild=app.match(/const APP_BUILD="([^"]+)"/)[1];

test("release overlay runs after deferred legacy boot when module starts at interactive",async()=>{
  const previousWindow=global.window,previousDocument=global.document;
  const dataset={},label={textContent:""},domReady=[];
  const legacyRender=()=>{label.textContent=`${legacyVersion} · Kararlı`;return "rendered";};
  const host={addEventListener:()=>{},renderSettings:legacyRender,v30RenderAbout:legacyRender};
  const document={readyState:"interactive",documentElement:{dataset},getElementById:id=>id==="appVersionLabel"?label:null,addEventListener:(name,callback)=>{if(name==="DOMContentLoaded")domReady.push(callback);}};
  // app.js registers this before the deferred Vite entry runs.
  domReady.push(()=>{dataset.appVersion=legacyVersion;legacyRender();});
  global.window=host;global.document=document;
  try{
    const {installReleaseOverlay}=await import(pathToFileURL(path.join(root,"src/release/release-overlay.ts")).href);
    installReleaseOverlay();
    domReady.forEach(callback=>callback());
    await Promise.resolve();
    assert.equal(dataset.appVersion,release.version);
    assert.equal(dataset.v4ReleaseBuild,release.build);
    assert.equal(label.textContent,`${release.version} · Kararlı`);
    assert.equal(host.v30RenderAbout(),"rendered");
    await Promise.resolve();
    assert.equal(label.textContent,`${release.version} · Kararlı`);
  }finally{
    if(previousWindow===undefined)delete global.window;else global.window=previousWindow;
    if(previousDocument===undefined)delete global.document;else global.document=previousDocument;
  }
});

function legacyHarness(){
  const ids=new Map(["mrp_lab","v320LearningLab","v321TargetKpis","v322ExportCenter"].map(id=>[id,{id}]));
  const document={
    documentElement:{dataset:{appVersion:release.version,v4ReleaseBuild:release.build},setAttribute:()=>{}},
    querySelector:selector=>selector===".v30-legacy-tabs"?null:{},
    getElementById:id=>ids.get(id)||null,
    createElement:()=>({}),body:{appendChild:element=>ids.set(element.id,element)}
  };
  const validate=()=>[];
  const host={
    __YKS_V4_BOOTSTRAP__:{version:release.version,build:release.build,legacyCore:legacyBuild,channel:"stable",stableRelease:true},
    __YKS_RELEASE__:{version:release.version,run:()=>{}},__YKS_PWA__:{build:release.build},
    YKSStability:{persistRuntime:()=>true,restoreRuntime:()=>true,clearRuntime:()=>true,updateOnlineBanner:()=>{}},YKSSafeRender:()=>{},
    YKSLearningLab:{elements:Array(118),timeline:Array(40),paragraphSummary:()=>{},filterElements:()=>{},filterTimeline:()=>{},curriculum:()=>({TYT:[{}]})},
    YKSTopicGuides:{coverage:()=>({total:240,specific:240})},YKSExportCenter:{buildICS:()=>{}},
    YKSCore:require("../modules/core-utils.js"),v321RenderTargetCenter:()=>true,v320RenderLearningLab:()=>true,
    SOZLER:Array.from({length:1000},()=>({c:"İnsan Sözü",q:"Çalışmaya devam et."})),
    __YKS_SERVICES__:{validate},__YKS_DOMAIN__:{validate},__YKS_SCREEN_RUNTIME__:{validate},__YKS_UI__:{validate},__YKS_DATA__:{schemaVersion:21,validate}
  };
  const context=vm.createContext({window:host,document,APP_VERSION:legacyVersion,APP_BUILD:legacyBuild,DATA_SCHEMA:21,YT_BUILTIN_KEY:"",URLSearchParams,location:{search:""},setTimeout,infraError:()=>{}});
  vm.runInContext(read("modules/release-selftest.js"),context);
  return{host,context,document,run:()=>host.runReleaseSelfTest()};
}

test("classic self-test accepts current release over retained legacy core without removed offline banner",()=>{
  const h=legacyHarness();
  assert.equal(h.document.getElementById("v311OfflineBanner"),null);
  const result=h.run();
  assert.equal(result.ok,true,JSON.stringify(result.checks.filter(([,ok])=>!ok)));
  assert.equal(result.checks.length,19);
});

test("classic self-test still rejects mismatched release, PWA, legacy core and missing stability service",()=>{
  for(const [name,mutate,check] of [
    ["release",h=>{h.host.__YKS_RELEASE__.version="4.0.0";},"v4-release"],
    ["PWA",h=>{h.host.__YKS_PWA__.build="4.4.0-r1";},"v4-bootstrap"],
    ["legacy core",h=>{h.context.APP_BUILD="4.0.0-r1";},"version"],
    ["stability",h=>{delete h.host.YKSStability.restoreRuntime;},"stability"]
  ]){
    const h=legacyHarness();mutate(h);
    const result=h.run();
    assert.equal(result.ok,false,name);
    assert.equal(result.checks.find(([key])=>key===check)?.[1],false,name);
  }
});
