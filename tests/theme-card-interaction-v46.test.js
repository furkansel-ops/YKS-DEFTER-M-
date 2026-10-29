const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");
const root=path.resolve(__dirname,"..");
const read=p=>fs.readFileSync(path.join(root,p),"utf8");

function harness(hasThemeApi=true){
  const callbacks={},chosen=[];
  const input={name:"yksTheme",value:"vivid",disabled:false,
    focusCount:0,focus(){this.focusCount++},
    closest:selector=>selector==="#appearancePreferences"?{}:null,
    matches:selector=>selector==='input[name="yksTheme"]'};
  const card={querySelector:()=>input,closest:selector=>selector==="#appearancePreferences"?{}:null};
  const swatch={closest:selector=>selector===".yks-theme-choice"?card:null};
  input.closest=selector=>selector===".yks-theme-choice"?card:
    selector==="#appearancePreferences"?{}:null;
  const panel={addEventListener:(name,fn)=>{(callbacks[name]??=[]).push(fn)}};
  const stored={theme:"refined-blue"};
  let saveCount=0,applyCount=0;
  const win={YKSLegacyState:{readState:()=>stored,save:()=>{saveCount++;return true}},
    applyTheme:()=>{applyCount++}};
  if(hasThemeApi)win.setTheme=id=>{chosen.push(id);return true};
  const source=read("public/settings-profile-runtime.js");
  const start=source.indexOf("  // Tema alanı modern Ayarlar'a taşındığında");
  const end=source.indexOf('  root.addEventListener("change",()=>{refresh(root)});',start);
  assert.ok(start>=0&&end>start,"touch handler lives in deferred settings runtime");
  const ctx=vm.createContext({root:panel,window:win,console});
  vm.runInContext(source.slice(start,end),ctx);
  return {callbacks,chosen,input,swatch,stored,
    get saveCount(){return saveCount},get applyCount(){return applyCount},
    fire:(type,target)=>{let prevented=0;for(const callback of callbacks[type]||[])
      callback({target,preventDefault(){prevented++}});return prevented}};
}
test("dokunmada kartın tamamı temayı seçer, ayarlar paneli taşısa da çalışır",()=>{
  const h=harness();
  assert.equal(h.callbacks.click.length,1);
  assert.equal(h.fire("click",h.swatch),1);
  assert.deepEqual(h.chosen,["vivid"]);
  assert.equal(h.input.focusCount,1);
  h.input.value="night";h.fire("click",h.input);
  assert.equal(h.chosen.at(-1),"night");
});
test("klavye ile radio change aynı tema seçimini uygular",()=>{
  const h=harness();
  h.input.value="night";h.fire("change",h.input);
  assert.deepEqual(h.chosen,["night"]);
  h.input.value="bad";h.fire("change",h.input);
  assert.equal(h.chosen.length,1);
  h.input.value="forest";h.fire("change",h.input);
  assert.equal(h.chosen.length,1,"kaldırılan eski tema seçilemez");
  h.input.value="refined-blue";h.input.disabled=true;
  h.fire("click",h.swatch);
  assert.equal(h.chosen.length,1);
});
test("eski setTheme yoksa yalnız tema tercihi kayıt sistemiyle korunur",()=>{
  const h=harness(false);
  h.fire("click",h.swatch);
  assert.equal(h.stored.theme,"vivid");
  assert.equal(h.saveCount,1);
  assert.equal(h.applyCount,1);
});
test("tema görünümü ayrı runtime'dadır; ana paket büyümez ve çalışma verisi değişmez",()=>{
  const source=read("public/settings-profile-runtime.js");
  const css=read("src/ui/theme-choices-v45.css");
  const main=read("src/main.ts");
  assert.doesNotMatch(main,/theme-card-interaction-v46/);
  assert.match(source,/applyThemeChoice/);
  assert.match(css,/v46: palette differentiation/);
  assert.match(css,/--yks-theme-hero/);
  assert.match(css,/\.navbar,\.tabbar/);
  assert.match(css,/#home #todayFreshStart/);
  assert.match(css,/#appearancePreferences \.yks-theme-choice\.is-selected::after/);
  assert.equal(fs.existsSync(path.join(root,"src/ui/theme-card-interaction-v46.ts")),false);
});
