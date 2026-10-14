const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");
const {stripTypeScriptTypes}=require("node:module");
const root=path.resolve(__dirname,"..");
const read=p=>fs.readFileSync(path.join(root,p),"utf8");

function harness(){
  const callbacks={},chosen=[];
  class FakeElement{
    closest(){return null;}
  }
  class FakeInput extends FakeElement{
    constructor(){super();this.name="yksTheme";this.value="forest";this.disabled=false;this.focusCount=0;}
    focus(){this.focusCount++;}
    closest(selector){return selector==="#appearancePreferences"?{}:null;}
  }
  const input=new FakeInput(),card=new FakeElement(),swatch=new FakeElement();
  card.querySelector=()=>input;
  swatch.closest=selector=>selector==="#appearancePreferences .yks-theme-choice"?card:null;
  input.closest=selector=>selector==="#appearancePreferences .yks-theme-choice"?card:
    selector==="#appearancePreferences"?{}:null;
  const document={addEventListener:(name,fn)=>{(callbacks[name]??=[]).push(fn)}};
  const window={setTheme:id=>{chosen.push(id);return true}};
  const code=stripTypeScriptTypes(read("src/ui/theme-card-interaction-v46.ts"))
    .replace("export function installThemeCardInteractionV46","function installThemeCardInteractionV46");
  const ctx=vm.createContext({window,document,Element:FakeElement,HTMLInputElement:FakeInput,console});
  vm.runInContext(code+"\nthis.install=installThemeCardInteractionV46;",ctx);
  ctx.install();ctx.install();
  return {callbacks,chosen,input,swatch,
    fire:(type,target)=>{let prevented=0;for(const callback of callbacks[type]||[])callback({target,preventDefault(){prevented++}});return prevented}};
}
test("dokunmada kartın tamamı temayı anında seçer, görünüm alanı taşınsa da çalışır",()=>{
  const h=harness();
  assert.equal(h.callbacks.click.length,1,"delegation registered once");
  assert.equal(h.fire("click",h.swatch),1);
  assert.deepEqual(h.chosen,["forest"]);
  assert.equal(h.input.focusCount,1);
  h.input.value="night";
  h.fire("click",h.input);
  assert.equal(h.chosen.at(-1),"night");
});
test("klavyenin radio change olayı aynı seçim yöntemini kullanır",()=>{
  const h=harness();
  h.input.value="lavender";
  h.fire("change",h.input);
  assert.deepEqual(h.chosen,["lavender"]);
  h.input.value="invalid";
  h.fire("change",h.input);
  assert.equal(h.chosen.length,1);
  h.input.value="paper";h.input.disabled=true;
  h.fire("click",h.swatch);
  assert.equal(h.chosen.length,1);
});
test("temalar görünüm katmanı olarak kalır, mevcut çalışma verisine dokunmaz",()=>{
  const source=read("src/ui/theme-card-interaction-v46.ts");
  const css=read("src/ui/theme-choices-v45.css");
  const main=read("src/main.ts");
  assert.match(main,/installThemeCardInteractionV46/);
  assert.match(main,/theme-card-interaction-v46/);
  assert.doesNotMatch(source,/localStorage|setDoc|firebase|save\(|S\.weeks|S\.denemeler/);
  assert.match(css,/v46: palette differentiation/);
  assert.match(css,/--yks-theme-hero/);
  assert.match(css,/\.navbar,\.tabbar/);
  assert.match(css,/#home #todayFreshStart/);
  assert.match(css,/#appearancePreferences \.yks-theme-choice\.is-selected::after/);
});
