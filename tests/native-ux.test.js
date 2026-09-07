const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");
const {stripTypeScriptTypes}=require("node:module");
const {pathToFileURL}=require("node:url");

const root=path.resolve(__dirname,"..");
const screens=["home","program","topics","deneme","progress","pomo","pp","more"];
const runtimeUrl=pathToFileURL(path.join(root,"src/pwa/pwa-runtime.ts")).href;

function pwaFixture(host={}){
  const nodes=Object.fromEntries(["v4PwaCard","v4PwaBadge","v4PwaCopy","v4InstallBtn","v4OfflineState"].map(id=>[id,{dataset:{},textContent:"",hidden:false,disabled:false}]));
  const events=new Map();
  const windowRef={navigator:{userAgent:"Windows Chrome"},matchMedia:()=>({matches:false}),addEventListener:(name,fn)=>events.set(name,fn),...host};
  const documentRef={readyState:"complete",getElementById:id=>nodes[id]||null};
  return {windowRef,documentRef,nodes,events};
}

for(const platform of ["android","desktop"]){
  test(`${platform} uygulaması service worker beklemeden kurulu ve çevrimdışı hazır görünür`,async()=>{
    const {installPwaRuntime}=await import(runtimeUrl);
    const fixture=pwaFixture(platform==="android"?{Capacitor:{isNativePlatform:()=>true}}:{__YKS_DESKTOP__:{installed:true}});
    Object.defineProperty(fixture.windowRef.navigator,"serviceWorker",{get(){throw new Error("Native app must not probe browser service workers");}});
    const api=installPwaRuntime("4.4.0-r3",fixture.windowRef,fixture.documentRef);
    await api.refresh();
    assert.equal(api.installState(),"installed");
    assert.equal(await api.promptInstall(),true);
    assert.equal(fixture.nodes.v4PwaBadge.textContent,"Kurulu");
    assert.equal(fixture.nodes.v4PwaCard.dataset.platform,platform);
    assert.equal(fixture.nodes.v4PwaCard.dataset.offlineReady,"true");
    assert.equal(fixture.nodes.v4InstallBtn.hidden,true);
    assert.match(fixture.nodes.v4OfflineState.textContent,/hazır.*Eşitleme internet gerektirir/);
    assert.doesNotMatch(fixture.nodes.v4PwaCopy.textContent,/Tarayıcı|yükle simgesi|hazırlanıyor/);
    assert.equal(fixture.events.has("beforeinstallprompt"),false);
  });
}

test("normal web tarayıcısı PWA kurulum ve çevrimdışı durumunu korur",async()=>{
  const {installPwaRuntime}=await import(runtimeUrl);
  const fixture=pwaFixture({Capacitor:{isNativePlatform:()=>false},__YKS_DESKTOP__:{installed:false}});
  const api=installPwaRuntime("4.4.0-r3",fixture.windowRef,fixture.documentRef);
  await api.refresh();
  assert.equal(api.installState(),"manual");
  assert.equal(fixture.nodes.v4PwaCard.dataset.offlineReady,"false");
  assert.match(fixture.nodes.v4PwaCopy.textContent,/Tarayıcının/);
  assert.equal(fixture.nodes.v4InstallBtn.hidden,false);
  let prompted=false;
  fixture.events.get("beforeinstallprompt")({preventDefault(){},prompt:async()=>{prompted=true;},userChoice:Promise.resolve({outcome:"accepted"})});
  assert.equal(api.installState(),"installable");
  assert.equal(await api.promptInstall(),true);
  assert.equal(prompted,true);
});

class FakeTab{
  constructor(screen){this.dataset={s:screen};this.hidden=false;this.disabled=false;this.visible=true;this.tabIndex=-1;}
  closest(){return this;}
  getClientRects(){return this.visible?[{}]:[];}
  focus(){this.focused=true;}
}

function railFixture(){
  const source=fs.readFileSync(path.join(root,"src/ui/navigation.ts"),"utf8").replace(/^import .*;\r?\n/gm,"");
  const executable=stripTypeScriptTypes(source,{mode:"strip"}).replace(/^export /gm,"");
  const context={Element:FakeTab,isScreenId:value=>screens.includes(value)};
  vm.runInNewContext(`${executable}\nglobalThis.bind=bindPrimaryNavigationKeyboard;`,context);
  const tabs=screens.map(screen=>new FakeTab(screen)),events=new Map(),opened=[];
  const rail={addEventListener:(name,fn)=>events.set(name,fn),contains:tab=>tabs.includes(tab),querySelectorAll:()=>tabs};
  context.bind(rail,screen=>{opened.push(screen);for(const tab of tabs)tab.tabIndex=tab.dataset.s===screen?0:-1;});
  const press=(index,key,flags={})=>{
    const event={target:tabs[index],key,defaultPrevented:false,preventDefault(){this.defaultPrevented=true;},...flags};
    events.get("keydown")(event);
    return event;
  };
  return {tabs,opened,press};
}

test("PC navigasyon rayı sekiz ekranı oklar, Home ve End ile açar ve odağı taşır",()=>{
  const fixture=railFixture();
  for(let i=0;i<screens.length;i++){
    assert.equal(fixture.press(i,"ArrowDown").defaultPrevented,true);
    assert.equal(fixture.opened.at(-1),screens[(i+1)%screens.length]);
  }
  fixture.press(0,"ArrowUp");assert.equal(fixture.opened.at(-1),"more");
  fixture.press(4,"Home");assert.equal(fixture.opened.at(-1),"home");
  fixture.press(1,"End");assert.equal(fixture.opened.at(-1),"more");
  assert.equal(fixture.tabs[7].focused,true);
  assert.equal(fixture.tabs.filter(tab=>tab.tabIndex===0).length,1);
  assert.equal(fixture.tabs[7].tabIndex,0);
});

test("navigasyon rayı gizli veya pasif sekmeleri atlar; değiştirilmiş tuşları tüketmez",()=>{
  const fixture=railFixture();
  fixture.tabs[1].hidden=true;
  fixture.tabs[2].disabled=true;
  fixture.tabs[3].visible=false;
  fixture.press(0,"ArrowRight");assert.equal(fixture.opened.at(-1),"progress");
  fixture.press(4,"ArrowLeft");assert.equal(fixture.opened.at(-1),"home");
  const before=fixture.opened.length;
  for(const flags of [{defaultPrevented:true},{isComposing:true},{ctrlKey:true},{metaKey:true},{altKey:true},{shiftKey:true}])fixture.press(0,"ArrowDown",flags);
  fixture.press(0,"a");
  assert.equal(fixture.opened.length,before);
});

function legacyKeyFixture(){
  const source=fs.readFileSync(path.join(root,"app.js"),"utf8");
  const start=source.indexOf("function initKeys(){"),end=source.indexOf("\n/* ==================================================================",start);
  const screenOrder=source.match(/const SCREEN_ORDER=\[[^;]+;/)[0];
  let listener;
  const opened=[],shifted=[];
  const context={document:{addEventListener:(_name,fn)=>{listener=fn;}},go:screen=>opened.push(screen),shiftScreen:direction=>shifted.push(direction),anyOverlayOpen:()=>false,closeTopOverlay:()=>false,currentScreen:()=>"home",undoSlot:null};
  vm.runInNewContext(`${screenOrder}\n${source.slice(start,end)}\ninitKeys();`,context);
  const press=(key,options={})=>listener({key,target:{tagName:"BODY",closest:()=>null},preventDefault(){this.defaultPrevented=true;},...options});
  return {press,opened,shifted};
}

test("genel 1–8 kısayolları İlerleme ve P&P dahil tüm ekranlara ulaşır",()=>{
  const fixture=legacyKeyFixture();
  for(let i=1;i<=8;i++)fixture.press(String(i));
  assert.deepEqual(fixture.opened,screens);
});

test("genel kısayollar yazı alanlarını, etkileşimli kontrolleri ve işlenmiş olayları bozmaz",()=>{
  const fixture=legacyKeyFixture();
  for(const tagName of ["INPUT","TEXTAREA","SELECT"])fixture.press("ArrowRight",{target:{tagName}});
  fixture.press("ArrowRight",{target:{tagName:"DIV",isContentEditable:true}});
  fixture.press("ArrowRight",{target:{tagName:"BUTTON",closest:()=>({})}});
  fixture.press("ArrowRight",{target:{tagName:"CANVAS",closest:()=>({})}});
  for(const flags of [{defaultPrevented:true},{isComposing:true},{ctrlKey:true},{altKey:true},{metaKey:true},{shiftKey:true}])fixture.press("1",flags);
  assert.equal(fixture.opened.length,0);
  assert.equal(fixture.shifted.length,0);
  fixture.press("ArrowRight");
  assert.deepEqual(fixture.shifted,[1]);
});
