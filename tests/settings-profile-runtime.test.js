const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");
const root=path.resolve(__dirname,"..");
const read=file=>fs.readFileSync(path.join(root,file),"utf8");
const source=read("public/settings-profile-runtime.js");
const categoryIds=["profile","account","appearance","study","notifications","coach","data","application"];

function harness(){
  const ids=new Map(),listeners=new Map(),scrolled=[];
  const document={documentElement:{dataset:{}},activeElement:null,getElementById:id=>ids.get(id)||null,querySelector:()=>null,querySelectorAll:()=>[],head:{append(){}},createElement:()=>new Node()};
  class Node{
    dataset={};hidden=false;textContent="";value="";children=[];selectors=new Map();collections=new Map();events=new Map();attributes={};classes=new Set();writes=0;
    classList={contains:name=>this.classes.has(name),toggle:(name,on)=>{if(on)this.classes.add(name);else this.classes.delete(name)}};
    set innerHTML(value){this.html=value;this.writes++}get innerHTML(){return this.html||""}
    querySelector(selector){if(selector.startsWith("[data-yms-category=")){const id=selector.match(/"([^"]+)"/)[1];return this.collections.get("[data-yms-category]")?.find(node=>node.dataset.ymsCategory===id&&!node.hidden)||null}return this.selectors.get(selector)||null}
    querySelectorAll(selector){return this.collections.get(selector)||(this.querySelector(selector)?[this.querySelector(selector)]:[])}
    addEventListener(name,fn){this.events.set(name,fn)}
    emit(name,event={}){return this.events.get(name)?.({target:this,currentTarget:this,...event})}
    focus(){document.activeElement=this}
    scrollIntoView(){scrolled.push("detail")}
    setAttribute(name,value){this.attributes[name]=value}
    contains(node){return this.children.includes(node)}
    append(node){this.children.push(node)}
    replaceChildren(...nodes){this.children=nodes}
  }
  const window={S:{name:"Deniz Öğrenci",target:150,theme:"auto"},scrollY:320,scrollTo:options=>scrolled.push(options.top),addEventListener:(name,fn)=>listeners.set(name,fn)};
  const context=vm.createContext({window,document,setInterval:()=>1,clearInterval(){},queueMicrotask,console,CustomEvent:class{constructor(type,options){this.type=type;this.detail=options?.detail}}});
  vm.runInContext(source,context);
  const rootNode=new Node();ids.set("yksModernSettings",rootNode);
  for(const selector of ["[data-yms-overview]","[data-yms-detail]","#ymsDetailTitle","#ymsDetailDescription","#ymsSearch",".yms-category-list","[data-yms-no-results]","#ymsNotifTime","#ymsQuestionTarget","[data-yms-notif-status]","[data-yms-notif-permission]","[data-yms-coach-empty]","[data-yms-account-empty]","[data-yms-theme-slot]","[data-yms-personal-slot]","[data-yms-coach-slot]","[data-yms-account-slot]"])rootNode.selectors.set(selector,new Node());
  rootNode.collections.set("[data-yms-section]",categoryIds.map(id=>{const node=new Node();node.dataset.ymsSection=id;node.hidden=true;return node}));
  rootNode.collections.set("[data-yms-category]",categoryIds.map(id=>{const node=new Node();node.dataset.ymsCategory=id;return node}));
  return {context,window,document,ids,listeners,root:rootNode,Node,scrolled,run:code=>vm.runInContext(code,context)};
}

test("ayar araması Türkçe ve aksansız yazımları bulur, sözcükleri birlikte eşleştirir",()=>{
  const h=harness();
  assert.deepEqual(Array.from(h.run('matchingCategories("GÖRÜNÜM")')),["appearance"]);
  assert.deepEqual(Array.from(h.run('matchingCategories("gorunum")')),["appearance"]);
  assert.deepEqual(Array.from(h.run('matchingCategories("gunluk hedef")')),["study"]);
  assert.deepEqual(Array.from(h.run('matchingCategories("kod")')),["coach"]);
  assert.deepEqual(Array.from(h.run('matchingCategories("yedek")')),["data"]);
  assert.deepEqual(Array.from(h.run('matchingCategories("olmayan ayar")')),[]);
});

test("ayar kategorisi tek ayrıntı açar, geri dönüş arama ve odak konumunu korur",()=>{
  const h=harness();h.run('view.query="bildirim";filterCategories(document.getElementById(ROOT_ID))');
  assert.equal(h.window.__YKS_SETTINGS__.open("notifications"),true);
  assert.equal(h.root.dataset.category,"notifications");
  assert.equal(h.root.querySelector("[data-yms-overview]").hidden,true);
  assert.deepEqual(h.root.querySelectorAll("[data-yms-section]").filter(node=>!node.hidden).map(node=>node.dataset.ymsSection),["notifications"]);
  assert.equal(h.document.activeElement,h.root.querySelector("#ymsDetailTitle"));
  h.window.__YKS_SETTINGS__.back();
  assert.equal(h.root.querySelector("[data-yms-detail]").hidden,true);
  assert.equal(h.root.querySelector("[data-yms-overview]").hidden,false);
  assert.equal(h.document.activeElement.dataset.ymsCategory,"notifications");
  assert.equal(h.run("view.query"),"bildirim");
  assert.equal(h.scrolled.at(-1),320);
});

test("geçersiz kategori geçerli ekranı değiştirmez ve arama boş durumunu gösterir",()=>{
  const h=harness();h.run('showCategory("study",false)');
  assert.equal(h.window.__YKS_SETTINGS__.open("missing"),false);
  assert.equal(h.root.dataset.category,"study");
  h.run('view.query="bulunmayan sözcük";filterCategories(document.getElementById(ROOT_ID))');
  assert.equal(h.root.querySelector("[data-yms-no-results]").hidden,false);
  assert.equal(h.root.querySelector(".yms-category-list").hidden,true);
  h.run('view.query="";filterCategories(document.getElementById(ROOT_ID))');
  assert.ok(h.root.querySelectorAll("[data-yms-category]").every(node=>!node.hidden));
  assert.equal(h.root.querySelector("[data-yms-no-results]").hidden,true);
});

test("arka plan güncellemesi kaydedilmemiş saat ve hedef girişlerini korur",()=>{
  const h=harness(),time=h.root.querySelector("#ymsNotifTime"),target=h.root.querySelector("#ymsQuestionTarget");
  time.value="18:45";target.value="300";target.dataset.dirty="true";
  h.run('view.timeDirty=true;showCategory("notifications",false);refresh(document.getElementById(ROOT_ID))');
  assert.equal(time.value,"18:45");assert.equal(target.value,"300");
  assert.equal(h.root.dataset.category,"notifications");assert.equal(h.root.writes,0);
  h.run('view.timeDirty=false');target.dataset.dirty="false";
  h.run('refresh(document.getElementById(ROOT_ID))');
  assert.equal(time.value,"21:00");assert.equal(target.value,"150");
  time.value="19:30";h.document.activeElement=time;
  h.run('refresh(document.getElementById(ROOT_ID))');assert.equal(time.value,"19:30");
});

test("hesap güncellemesi mevcut düğmeleri ve kullanıcı odağını değiştirmeden metni yeniler",()=>{
  const h=harness(),name=new h.Node(),initials=new h.Node();name.dataset.ymsValue="name";initials.dataset.ymsValue="initials";
  h.root.collections.set("[data-yms-value]",[name,initials]);
  const target=h.root.querySelector("#ymsQuestionTarget");target.focus();
  h.run('refresh(document.getElementById(ROOT_ID))');assert.equal(name.textContent,"Deniz Öğrenci");
  h.window.S.name="İpek Yılmaz";h.run('refresh(document.getElementById(ROOT_ID))');
  assert.equal(name.textContent,"İpek Yılmaz");assert.equal(initials.textContent,"İY");
  assert.equal(h.document.activeElement,target);assert.equal(h.root.writes,0);
});

test("tema, hesap ve koç panelleri klonlanmadan taşınır; mevcut dinleyiciler korunur",()=>{
  const h=harness(),theme=new h.Node(),themeGrid=new h.Node();theme.hidden=true;theme.dataset.ymsHidden="true";themeGrid.closest=()=>theme;h.ids.set("themeGrid",themeGrid);
  const coach=new h.Node(),cloud=new h.Node(),account=new h.Node();let clicks=0;coach.addEventListener("click",()=>clicks++);
  h.ids.set("studentCoachCodeSettings",coach);h.ids.set("cloudSyncBox",cloud);h.ids.set("yksAccountSettingsCard",account);
  h.run('adoptPanels(document.getElementById(ROOT_ID));adoptPanels(document.getElementById(ROOT_ID))');
  assert.deepEqual(h.root.querySelector("[data-yms-theme-slot]").children,[theme]);assert.equal(theme.hidden,false);
  assert.deepEqual(h.root.querySelector("[data-yms-coach-slot]").children,[coach]);coach.emit("click");assert.equal(clicks,1);
  assert.deepEqual(h.root.querySelector("[data-yms-account-slot]").children,[cloud,account]);
  assert.equal(h.root.querySelector("[data-yms-coach-empty]").hidden,true);
  assert.equal(h.root.querySelector("[data-yms-account-empty]").hidden,true);
});

test("bildirim durum yenilemesi erişilebilir anahtarları gerçek eski durumla eşitler",()=>{
  const h=harness(),legacy=new h.Node(),button=new h.Node();h.ids.set("notifPomo",legacy);button.dataset.ymsNotifSource="notifPomo";
  h.root.collections.set("[data-yms-notif]",[button]);legacy.classes.add("on");
  h.run('refresh(document.getElementById(ROOT_ID))');assert.equal(button.attributes["aria-checked"],"true");assert.ok(button.classes.has("is-on"));
  legacy.classes.delete("on");h.run('refresh(document.getElementById(ROOT_ID))');assert.equal(button.attributes["aria-checked"],"false");
});

test("ayar bağlantıları mevcut program, yedek, sistem ve bildirim işlemlerine ulaşır",()=>{
  const h=harness(),calls=[];
  const selectors=["[data-yms-program]","[data-yms-data]","[data-yms-system]","[data-yms-about]","[data-yms-notif-test]"];
  selectors.forEach(selector=>h.root.selectors.set(selector,new h.Node()));
  h.window.go=screen=>calls.push(screen);h.window.v30Action=action=>calls.push(action);h.window.testNotif=()=>calls.push("notification");
  h.run('bind(document.getElementById(ROOT_ID))');selectors.forEach(selector=>h.root.querySelector(selector).emit("click"));
  assert.deepEqual(calls,["program","data","system","about","notification"]);
});

test("günlük soru hedefi kayıt hatasında eski değeri korur ve başarılı kayıtta günceller",()=>{
  const h=harness(),target=h.root.querySelector("#ymsQuestionTarget"),button=new h.Node(),status=new h.Node();
  h.root.selectors.set("[data-yms-target-save]",button);h.root.selectors.set("[data-yms-target-status]",status);target.checkValidity=()=>true;target.reportValidity=()=>{};target.value="225";target.dataset.dirty="true";
  h.window.save=()=>false;h.run('bind(document.getElementById(ROOT_ID))');button.emit("click");
  assert.equal(h.window.S.target,150);assert.equal(target.value,"225");assert.match(status.textContent,/kaydedilemedi/);
  h.window.save=()=>true;button.emit("click");assert.equal(h.window.S.target,225);assert.equal(target.dataset.dirty,"false");assert.match(status.textContent,/kaydedildi/);
});

test("profil, tema ve bildirim işlevleri sadeleştirilmiş ayarlarda korunur",()=>{
  for(const label of ["Kişisel bilgiler","YKS hedeflerim","TYT hedef net","AYT hedef net","Hedef üniversite","Hedef bölüm","Alan / puan türü","OBP","Haftalık çalışma"])assert.ok(source.includes(label),label);
  for(const key of ["name","puanTuru","targetNetTYT","targetNetAYT","targetUniversity","targetDepartment"])assert.match(source,new RegExp(`s\\.${key}=`));
  assert.match(source,/s\.targetNet=s\.targetNetTYT/);
  assert.match(source,/data-yms-theme-slot/);assert.match(source,/themeCard\.hidden=false/);
  assert.doesNotMatch(source,/hideCardFor\("themeGrid"/);
  assert.match(source,/getElementById\("themeBtn"\)\?\.remove\(\)/);
  for(const method of ["toggleNotif","askNotif","saveEveningAt","testNotif","notifDiag"])assert.match(source,new RegExp(`window\\.${method}`));
  assert.match(source,/host\.replaceChildren\(panel\)/);
  assert.match(source,/19 Haziran 2027/);assert.match(source,/20 Haziran 2027/);
  assert.doesNotMatch(source,/\[600,1500,3500,7000\]/);
});

test("ayarlar seçili temanın tokenlarını ve güncel hesap yükleyicisini kullanır",()=>{
  const css=read("src/ui/personalization-v43.css"),loader=read("src/ui/student-account-loader.ts");
  assert.match(source,/var\(--rb-surface,var\(--card,#fff\)\)/);
  assert.match(source,/var\(--rb-ink,var\(--label,#10203f\)\)/);
  assert.match(css,/var\(--rb-accent,var\(--accent\)\)/);
  assert.match(loader,/settings-profile-runtime\.js\?v=3\.0\.0/);
  assert.match(loader,/const settingsReady=loadModuleScript/);
});
