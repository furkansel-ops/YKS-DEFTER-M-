const test=require("node:test");
const assert=require("node:assert/strict");
const path=require("node:path");
const {pathToFileURL}=require("node:url");
const root=path.resolve(__dirname,".."),releaseUrl=pathToFileURL(path.join(root,"src/release/release.ts")).href;

function harness(){
  const ids=["home","program","topics","deneme","progress","pomo","pp","more"];let active="home",output=null,applied=0;
  const screens=ids.map(id=>({id,classList:{contains:name=>name==="active"&&id===active}}));
  const document={documentElement:{dataset:{v42ReleaseOverlay:"ready",appVersion:"4.4.0",v4RecoveryErrors:"0",v43Runtime:"ready",v43RuntimeErrors:"0",v43Today:"true",v43TodayErrors:"0",v43Analysis:"true",v43AnalysisErrors:"0",v43LearningCycle:"true",v43LearningCycleErrors:"0",v43LabQuiz:"true",v43LabQuizErrors:"0",v43Navigation:"true",v43NavigationErrors:"0",v43Personalization:"true",v43PersonalizationErrors:"0",v43FocusSessionGuard:"true",v43FocusSessionGuardErrors:"0"}},body:{appendChild:node=>{output=node;}},querySelectorAll:selector=>selector===".screen.active"?screens.filter(x=>x.id===active):selector===".screen"?screens:[],getElementById:id=>id==="v4ReleaseResult"?output:null,createElement:()=>({id:"",hidden:false,textContent:""})};
  const raw=JSON.stringify({v:21,focus:{sw:{run:true,start:1,acc:2,cr:3},swLaps:[]},yt:{key:"yerel",src:"key",err:""}}),cloud=JSON.stringify({v:21,focus:{sw:{run:false,start:0,acc:0,cr:0},swLaps:[]},yt:{key:"",src:"key",err:""}});
  const ui={validate:()=>[],snapshot:()=>({activeScreen:active,activeMorePanel:"home",screenCount:8,tabCount:8}),navigate:id=>{active=id;return true;},openMore:()=>true,version:"4.0.0-alpha.7"};
  const data={schemaVersion:21,validate:()=>[],ready:Promise.resolve({ok:true,degraded:false,primary:"dexie"}),captureLegacyWrite:async()=>({ok:true,status:"written"}),flush:async()=>{},indexedSnapshot:async()=>({database:"yks-defterim-v4",statePresent:true,schema:21,sourceHash:"abcd"}),cloudPayload:async()=>({ok:true,json:cloud,schema:21,source:"dexie"}),applyCloudJSON:async json=>{applied++;return {ok:true,status:"applied",json};}};
  const host={
    __YKS_V4_BOOTSTRAP__:{version:"4.4.0",build:"4.4.0-r2",legacyCore:"4.1.0-r20",channel:"stable",legacyRuntime:true},
    __YKS_SERVICES__:{validate:()=>[]},__YKS_DOMAIN__:{validate:()=>[]},__YKS_SCREEN_RUNTIME__:{validate:()=>[]},__YKS_UI__:ui,__YKS_DATA__:data,
    __YKS_BACKUP__:{version:"2.0.0"},__YKS_PWA__:{build:"4.4.0-r2"},__YKS_V43_RUNTIME__:{ready:Promise.resolve({ok:true})},
    YKSLegacyState:{readJSON:()=>raw},runReleaseSelfTest:()=>({ok:true}),setTimeout,clearTimeout,dispatchEvent:()=>{}
  };
  return {host,document,get active(){return active;},get output(){return output;},get applied(){return applied;}};
}

test("kararlı sürüm denetimi açılış, v4.3 runtime, ekran, Dexie, kurtarma ve bulut yolunu birlikte doğrular",async()=>{
  const previous=global.CustomEvent;global.CustomEvent=class{constructor(type,options){this.type=type;this.detail=options&&options.detail;}};
  try{
    const {createReleaseRuntime}=await import(releaseUrl),h=harness(),api=createReleaseRuntime(h.host,h.document),result=await api.run({exerciseScreens:true,persistRoundTrip:true});
    assert.equal(result.ok,true);assert.equal(result.version,"4.4.0");assert.ok(result.checks.length>=28);assert.equal(result.checks.every(x=>x.ok),true);assert.equal(h.active,"home");assert.equal(h.applied,2);assert.match(h.output.textContent,/YKS_V4_RELEASE_OK/);assert.equal(api.latest(),result);
    for(const name of ["bootstrap","release-overlay","backup-recovery","pwa-build","v43-runtime","v43-today","v43-analysis","v43-learning-cycle","v43-lab-quiz","v43-navigation","v43-personalization","v43-focus-session-guard","dexie-write-through","portable-payload","screen-transitions"])assert.equal(result.checks.find(x=>x.name===name)?.ok,true,name);
  }finally{if(previous===undefined)delete global.CustomEvent;else global.CustomEvent=previous;}
});

test("zorunlu köprü veya v4.3 katman hatası kararlı sürümü başarısız işaretler",async()=>{
  const previous=global.CustomEvent;global.CustomEvent=class{constructor(type,options){this.type=type;this.detail=options&&options.detail;}};
  try{
    const {createReleaseRuntime}=await import(releaseUrl),h=harness();h.host.__YKS_DOMAIN__.validate=()=>["hata"];
    h.document.documentElement.dataset.v43FocusSessionGuardErrors="1";
    const result=await createReleaseRuntime(h.host,h.document).run({exerciseScreens:false,persistRoundTrip:false});assert.equal(result.ok,false);assert.equal(result.checks.find(x=>x.name==="domain-services").ok,false);assert.equal(result.checks.find(x=>x.name==="v43-focus-session-guard").ok,false);assert.match(h.output.textContent,/YKS_V4_RELEASE_FAIL/);
  }finally{if(previous===undefined)delete global.CustomEvent;else global.CustomEvent=previous;}
});
