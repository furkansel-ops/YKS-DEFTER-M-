const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");
const {stripTypeScriptTypes}=require("node:module");
const root=path.resolve(__dirname,"..");
const read=p=>fs.readFileSync(path.join(root,p),"utf8");

test("v39 foldable mobile editor is an optional offline-safe adapter",()=>{
  const html=read("index.html"),source=read("src/ui/today-review-v39.ts");
  const top=read("src/ui/today-top-v33.ts"),vite=read("vite.config.mts");
  assert.match(top,/import\("\.\/today-review-v39"\)/);
  assert.match(vite,/"src\/ui\/today-review-v39\.ts"/);
  assert.doesNotMatch(source,/localStorage|setDoc\(|updateDoc\(|save\(|fetch\(|S\.dayReview|innerHTML/);
  for(const id of ["todayFreshReview","todayFreshReflectionInput","todayFreshReflectionSave",
    "todayFreshReviewStatus","todayFreshReflectionCounter","todayReflectionInput","todayCloseSaved",
    "todayMoodGood","todayMoodMid","todayMoodHard"]){
    assert.equal((html.match(new RegExp('id="'+id+'"',"g"))||[]).length,1,id);
  }
  const newShell=html.slice(html.indexOf('id="todayFreshStart"'),html.indexOf('<!-- Bugün v33'));
  assert.ok(newShell.includes('<details id="todayFreshReview"'),"collapsed by default");
  assert.ok(newShell.indexOf('id="todayFreshWorkCenter"')<newShell.indexOf('id="todayFreshReview"'));
  assert.match(html,/#home #todayFreshStart \.today-fresh-review/);
  assert.match(html,/@media\(max-width:600px\)/);
  assert.match(source,/legacySave\.click\(\)/);
  assert.match(source,/sources\[index\]\?\.click\(\)/);
});

test("v39 writes only on save, mirrors mood and preserves typed drafts",()=>{
  class Fake{
    constructor(id="",value=""){
      this.id=id;this.textContent=value;this.value="";this.dataset={};
      this.className="";this.listeners={};this.attributes={};this.children={};this.clicks=0;
    }
    get classList(){return{
      contains:k=>this.className.split(" ").includes(k),
      toggle:(k,force)=>{
        const active=this.className.split(" ").includes(k);
        const add=force===undefined?!active:!!force;
        this.className=this.className.split(" ").filter(x=>x&&x!==k).concat(add?[k]:[]).join(" ");
        return add;
      }
    }}
    addEventListener(name,fn){(this.listeners[name]??=[]).push(fn)}
    setAttribute(name,value){this.attributes[name]=String(value)}
    click(){this.clicks++;this.dispatch("click")}
    dispatch(name){for(const fn of this.listeners[name]||[])fn()}
    querySelector(sel){return this.children[sel]||null}
  }
  const nodes=new Map(),listeners={},records=[],observers=[];
  const el=(id,value="")=>{const n=new Fake(id,value);nodes.set(id,n);return n};
  const rootCard=el("todayFreshReview"),input=el("todayFreshReflectionInput"),
    button=el("todayFreshReflectionSave"),state=el("todayFreshReviewStatus"),
    counter=el("todayFreshReflectionCounter"),oldInput=el("todayReflectionInput");
  oldInput.value="Dünkü raporum";
  const oldStatus=el("todayCloseSaved","Koçunla paylaşıldı");
  oldStatus.dataset.saved="true";
  const sources=[el("todayMoodGood"),el("todayMoodMid"),el("todayMoodHard")];
  sources[0].classList.toggle("on",true);
  for(const [index,mood] of ["good","mid","hard"].entries()){
    const visible=new Fake();
    rootCard.children['[data-review-mood="'+mood+'"]']=visible;
    sources[index].addEventListener("click",()=>{
      sources.forEach((source,i)=>source.classList.toggle("on",index===i));
      oldStatus.textContent="Kaydetmeye hazır";
    });
  }
  const oldSave=new Fake();
  oldSave.addEventListener("click",()=>{
    records.push(oldInput.value);
    oldStatus.textContent="Koçunla paylaşıldı";
    oldStatus.dataset.saved="true";
  });
  const document={
    getElementById:id=>nodes.get(id)||null,
    querySelector:selector=>selector.includes("saveTodayReflection")?oldSave:null,
    activeElement:null,visibilityState:"visible",
    addEventListener:(name,fn)=>(listeners[name]??=[]).push(fn)
  };
  class Observer{
    constructor(fn){this.fn=fn;observers.push(this)}
    observe(){}
  }
  const source=stripTypeScriptTypes(read("src/ui/today-review-v39.ts"))
    .replace("export function installTodayReviewV39","function installTodayReviewV39");
  const context=vm.createContext({
    document,window:{addEventListener(){}},MutationObserver:Observer,console
  });
  vm.runInContext(source+"\nthis.install=installTodayReviewV39;",context);
  assert.equal(context.install().installed,true);
  assert.equal(rootCard.dataset.reviewReady,"true");
  assert.equal(input.value,"Dünkü raporum");
  assert.equal(state.textContent,"Kaydedildi");
  assert.equal(rootCard.children['[data-review-mood="good"]'].attributes["aria-pressed"],"true");
  rootCard.children['[data-review-mood="mid"]'].click();
  assert.equal(records.length,0,"mood never saves");
  assert.equal(state.textContent,"Kaydedilmemiş değişiklik");
  input.value="Bugün matematik çalıştım. Yarın fizik.";
  input.dispatch("input");
  assert.equal(records.length,0,"typing never saves");
  assert.equal(oldInput.value,"Dünkü raporum","legacy draft is untouched until save");
  oldInput.value="Sunucudan güncellendi";
  observers[0].fn();
  assert.equal(input.value,"Bugün matematik çalıştım. Yarın fizik.","typing survives source refresh");
  button.click();
  assert.equal(oldSave.clicks,1);
  assert.deepEqual(records,["Bugün matematik çalıştım. Yarın fizik."]);
  assert.equal(state.textContent,"Kaydedildi");
  assert.equal(counter.textContent,"37 / 3000 karakter");
  assert.equal(context.install().installed,true);
  assert.equal(observers.length,1,"idempotent");
  assert.equal(rootCard.children['[data-review-mood="mid"]'].attributes["aria-pressed"],"true");
});
