const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");
const {pathToFileURL}=require("node:url");
const {stripTypeScriptTypes}=require("node:module");
const root=path.resolve(__dirname,"..");
const load=file=>import(pathToFileURL(path.join(root,file)).href);
const read=file=>fs.readFileSync(path.join(root,file),"utf8");
const data=()=>load("src/data/biology-atlas.ts");
const service=()=>load("src/domain/biology-atlas-service.ts");

test("Atlas 24 benzersiz konu, 5 grup ve izinli 9 organla tutarlı bağlantılar içerir",async()=>{
  const {ATLAS_TOPICS:topics,ATLAS_GROUPS:groups,ATLAS_ORGANS:organs}=await data();
  assert.equal(topics.length,24);assert.equal(organs.length,9);assert.equal(groups.length,5);
  assert.equal(new Set(topics.map(t=>t.id)).size,24);
  assert.equal(new Set(topics.map(t=>t.scene)).size,24);
  assert.equal(new Set(organs.map(t=>t.id)).size,9);
  assert.equal(topics.filter(t=>t.group==="İnsan sistemleri").length,10);
  for(const group of groups)assert.ok(topics.some(t=>t.group===group));
  for(const topic of topics){
    assert.match(topic.id,/^[a-z-]+$/);assert.ok(groups.includes(topic.group));
    assert.ok(topic.steps.length>=4&&topic.steps.length<=5);
    assert.ok(topic.steps.every(step=>step.length===2&&step[0].length>=3&&step[1].length>30),topic.id);
    assert.ok(topic.quiz.answer>=0&&topic.quiz.answer<topic.steps.length);
    assert.ok(topic.quiz.why.length>15&&topic.trap.length>30);
    for(const [from,to] of topic.links){assert.ok(Number.isInteger(from)&&Number.isInteger(to));assert.ok(from>=0&&to>=0&&from<topic.steps.length&&to<topic.steps.length&&from!==to);}
    assert.ok(topic.models.every(id=>organs.some(o=>o.id===id)));
  }
  const manifest=JSON.parse(read("scripts/anatomy-assets.json"));
  for(const organ of organs){
    assert.ok(topics.find(t=>t.id===organ.topic).models.includes(organ.id));
    const entry=manifest.files.find(f=>f.target===`models/${organ.id}.glb`);
    assert.equal(organ.megabytes,(entry.bytes/1e6).toFixed(1).replace(".",","));
  }
});

test("Atlas Türkçe/ASCII arama ve grup filtresini birlikte uygular",async()=>{
  const {filterAtlas,atlasText}=await service();
  assert.equal(atlasText("İŞIK BÖBREĞİ"),"isik bobregi");
  assert.deepEqual(filterAtlas("BOWMAN ADH").map(t=>t.id),["bosaltim"]);
  assert.ok(filterAtlas("FOTOSENTEZ","Enerji dönüşümleri").some(t=>t.id==="fotosentez"));
  assert.equal(filterAtlas("FOTOSENTEZ","Genden proteine").length,0);
  assert.equal(filterAtlas("xyzyok").length,0);
});

test("Atlas yanıtları ve adım sınırları bozuk girdilere karşı güvenlidir",async()=>{
  const {answerAtlas,atlasStep,getAtlasTopic,getAtlasOrgan}=await service();
  const t=getAtlasTopic("sinir");
  for(const value of [-1,4,NaN,Infinity,1.5]){assert.equal(answerAtlas(t,value),null);assert.equal(atlasStep(t,value),0);}
  assert.equal(answerAtlas(t,3).correct,true);assert.equal(answerAtlas(t,0).correct,false);
  assert.equal(atlasStep(t,2),2);
  for(const id of ["__proto__","constructor","missing"]){assert.equal(getAtlasTopic(id),undefined);assert.equal(getAtlasOrgan(id),undefined);}
});

test("Atlas SVG'leri her konu için erişilebilir düğümler üretir ve soru etiketlerini gizler",async()=>{
  const {ATLAS_TOPICS}=await data();const {atlasDiagram,atlasPoints}=await load("src/ui/biology-atlas-diagrams.ts");
  for(const topic of ATLAS_TOPICS){
    const svg=atlasDiagram(topic),quiz=atlasDiagram(topic,0,true);
    assert.equal(atlasPoints(topic).length,topic.steps.length,topic.id);
    assert.equal((svg.match(/data-atlas-step=/g)||[]).length,topic.steps.length);
    assert.equal((quiz.match(/aria-label="Nokta /g)||[]).length,topic.steps.length);
    assert.ok(!quiz.includes('class="atlas-pin-label"'));
    assert.ok(svg.includes('role="group"')&&svg.includes('tabindex="0"'));
    assert.ok(!svg.includes("undefined")&&!svg.includes("NaN"),topic.id);
    for(const [x,y] of atlasPoints(topic))assert.ok(x>=28&&x<=572&&y>=28&&y<=365);
    assert.match(atlasDiagram(topic,0,true,topic.quiz.answer),/class="atlas-pin answer"/);
  }
});

test("Atlas SVG metinleri kaçırılır ve varlık yolları uygulama alt klasöründe kalır",async()=>{
  const {ATLAS_TOPICS}=await data();const {atlasDiagram,atlasEscape}=await load("src/ui/biology-atlas-diagrams.ts");const {atlasAsset}=await service();
  assert.equal(atlasEscape('<b a="x">&\''),"&lt;b a=&quot;x&quot;&gt;&amp;&#39;");
  const svg=atlasDiagram({...ATLAS_TOPICS[0],title:'<img onerror="x">',steps:ATLAS_TOPICS[0].steps.map((s,i)=>i?s:['<script>x</script>',s[1]])});
  assert.ok(!svg.includes("<img")&&!svg.includes("<script>"));
  assert.equal(atlasAsset("models/heart.glb"),"./anatomy/models/heart.glb");
  for(const value of ["../heart.glb","models/../../x","https://other/x.glb","models/heart.glb?x","images/a.svg"] )assert.throws(()=>atlasAsset(value));
});

test("Dolaşım şeması oksijen zenginliğini renk anahtarı ve yönlü oklarla ayırır",async()=>{
  const {getAtlasTopic}=await service(),{atlasDiagram}=await load("src/ui/biology-atlas-diagrams.ts");
  const svg=atlasDiagram(getAtlasTopic("dolasim"));
  assert.match(svg,/O₂ fakir/);assert.match(svg,/O₂ zengin/);
  assert.equal((svg.match(/stroke="var\(--atlas-blue\)" stroke-width="3"/g)||[]).length,3);
  assert.equal((svg.match(/stroke="var\(--atlas-coral\)" stroke-width="3"/g)||[]).length,2);
  assert.equal((svg.match(/marker-end=/g)||[]).length,5);
});

test("Yeni model veya sekme eski yükleme isteğini ve gecikmiş sonucunu geçersiz kılar",async()=>{
  const {AtlasRequestGate}=await service();const gate=new AtlasRequestGate();
  const first=gate.start();assert.equal(first.current(),true);
  const second=gate.start();assert.equal(first.signal.aborted,true);assert.equal(first.current(),false);assert.equal(second.current(),true);
  gate.cancel();assert.equal(second.signal.aborted,true);assert.equal(second.current(),false);
  const third=gate.start();assert.equal(third.current(),true);gate.cancel();gate.cancel();assert.equal(third.current(),false);
});

test("3B temizliği paylaşılan geometri, malzeme, doku ve bitmap kaynaklarını bir kez bırakır",async()=>{
  const THREE=await import("three");const {disposeAtlasObject}=await load("src/ui/biology-atlas-model.ts");
  let geometries=0,materials=0,textures=0,images=0;
  const bitmap={close(){images++;}},texture=new THREE.Texture(bitmap),normal=new THREE.Texture(bitmap);
  const material=new THREE.MeshStandardMaterial({map:texture,normalMap:normal}),geometry=new THREE.BoxGeometry();
  geometry.addEventListener("dispose",()=>geometries++);material.addEventListener("dispose",()=>materials++);
  texture.addEventListener("dispose",()=>textures++);normal.addEventListener("dispose",()=>textures++);
  const group=new THREE.Group();group.add(new THREE.Mesh(geometry,material),new THREE.Mesh(geometry,[material]));
  disposeAtlasObject(group);assert.deepEqual({geometries,materials,textures,images},{geometries:1,materials:1,textures:2,images:1});
});

test("Anatomi dosyaları değişmez commit ve SHA-256 ile sabitlenir; model dosyaları çekirdek kuruluma girmez",()=>{
  const manifest=JSON.parse(read("scripts/anatomy-assets.json"));
  assert.match(manifest.commit,/^[a-f0-9]{40}$/);assert.equal(manifest.files.length,27);
  assert.equal(new Set(manifest.files.map(f=>f.target)).size,27);
  for(const file of manifest.files){assert.match(file.sha256,/^[a-f0-9]{64}$/);assert.ok(file.bytes>0&&file.bytes<12*1024*1024);assert.match(file.target,/^(models|images|thumbs)\/[a-z]+\.(glb|webp)$/);}
  assert.match(read("scripts/prepare-anatomy-assets.mjs"),/valid\(bytes, entry\)/);
  const sw=read("sw.js"),core=sw.match(/const CORE=\[.*?\];/)[0];assert.ok(!core.includes("anatomy"));
  assert.match(read("src/ui/biology-atlas-bridge.ts"),/import\("\.\/biology-atlas\.ts"\)/);
  assert.match(read("src/ui/biology-atlas.ts"),/import\("\.\/biology-atlas-model\.ts"\)/);
  assert.doesNotMatch(read("src/ui/biology-atlas.ts"),/localStorage|indexedDB|YKSLegacyState|\.save\(|persistScience/);
});

function makeGlb(json){const chunk=Buffer.from(JSON.stringify(json).padEnd(Math.ceil(JSON.stringify(json).length/4)*4," "));const bytes=Buffer.alloc(20+chunk.length);bytes.write("glTF");bytes.writeUInt32LE(2,4);bytes.writeUInt32LE(bytes.length,8);bytes.writeUInt32LE(chunk.length,12);bytes.writeUInt32LE(0x4e4f534a,16);chunk.copy(bytes,20);return bytes;}
test("GLB doğrulaması bozuk başlıkları, dış kaynakları ve desteklenmeyen uzantıları reddeder",async()=>{
  const {inspectAnatomyGlb}=await load("scripts/verify-anatomy-assets.mjs");const base={asset:{version:"2.0"},meshes:[{}],scenes:[{}]};
  assert.equal(inspectAnatomyGlb(makeGlb(base)).asset.version,"2.0");
  assert.throws(()=>inspectAnatomyGlb(Buffer.from("not-a-model")));
  assert.throws(()=>inspectAnatomyGlb(makeGlb({...base,images:[{uri:"https://remote/image.webp"}]})),/harici/);
  assert.throws(()=>inspectAnatomyGlb(makeGlb({...base,extensionsRequired:["unknown_decoder"]})),/Desteklenmeyen/);
  assert.throws(()=>inspectAnatomyGlb(makeGlb({...base,scenes:[]})),/sahnesi/);
});

async function uiHarness(loadModel){
  class Element {dataset={};attrs={};hidden=false;writes=0;html="";listeners={};value="";id="";
    set innerHTML(value){this.html=value;this.writes++;}get innerHTML(){return this.html;}
    addEventListener(type,fn){(this.listeners[type]??=[]).push(fn);}setAttribute(k,v){this.attrs[k]=v;}hasAttribute(k){return k in this.attrs;}
    closest(){return this;}focus(){document.activeElement=this;}querySelector(){return null;}
  }
  class Input extends Element {}class Select extends Element {}class Svg extends Element {}
  const ids=["atlasIndex","atlasCount","atlasGroupLabel","atlasMode-topic","atlasMode-model","atlasContent","atlasModelStatus","atlasModelStage","atlasModelRetry","atlasModelCanvas","atlasSearch","atlasGroup"];
  const nodes=new Map(ids.map(id=>{const e=id==="atlasSearch"?new Input():id==="atlasGroup"?new Select():new Element();e.id=id;return [id,e];}));
  const panel=new Element();panel.querySelector=s=>nodes.get(s.slice(1));panel.querySelectorAll=()=>[];panel.contains=()=>true;panel.getClientRects=()=>[{}];
  const document={activeElement:null,addEventListener(){}};const window={addEventListener(){}};
  const source=stripTypeScriptTypes(read("src/ui/biology-atlas.ts").replace(/^import[^\n]*\n/gm,"")).replace("export function createBiologyAtlas","function createBiologyAtlas").replace('import("./biology-atlas-model.ts")','importModel()');
  const diagrams=await load("src/ui/biology-atlas-diagrams.ts");
  const context={...await data(),...await service(),atlasDiagram:diagrams.atlasDiagram,esc:diagrams.atlasEscape,window,document,Element,HTMLInputElement:Input,HTMLSelectElement:Select,SVGElement:Svg,AbortController,clearTimeout,setTimeout,importModel:async()=>({loadAtlasModel:loadModel||(()=>Promise.reject(new Error("WebGL yok")))})};
  vm.runInNewContext(source+"\nthis.api=createBiologyAtlas();",context);
  const fire=(type,target)=>panel.listeners[type][0]({target});
  const click=(action,id)=>{const target=new Element();target.dataset={atlasAction:action,id};fire("click",target);};
  const choose=value=>{const target=new Element();target.dataset={atlasStep:String(value)};fire("click",target);};
  context.api.mount(panel);
  return {api:context.api,panel,nodes,document,click,choose,fire};
}

test("Atlas tekrar bağlanınca DOM/dinleyici çoğaltmaz ve arama odağını korur",async()=>{
  const h=await uiHarness();h.api.mount(h.panel);h.api.mount(h.panel);
  assert.equal(h.panel.writes,1);assert.equal(h.nodes.get("atlasContent").writes,1);
  assert.equal(Object.values(h.panel.listeners).flat().length,5);
  const search=h.nodes.get("atlasSearch");search.value="NEFRON";search.focus();h.fire("input",search);
  assert.equal(h.nodes.get("atlasCount").textContent,"1 görsel konu");assert.equal(h.document.activeElement,search);
  h.api.mount(h.panel);assert.equal(h.nodes.get("atlasContent").writes,1);
});

test("Görsel soru yanlış/doğru geri bildirimi verir, tekrar açılır ve konu değişince sıfırlanır",async()=>{
  const h=await uiHarness(),content=h.nodes.get("atlasContent");
  h.click("practice");assert.ok(!content.innerHTML.includes('class="atlas-pin-label"'));h.choose(0);
  assert.match(content.innerHTML,/Birlikte düzeltelim/);assert.match(content.innerHTML,/Doğru nokta: 4/);
  h.click("retry-quiz");h.choose(3);assert.match(content.innerHTML,/Doğru ✓/);
  h.click("topic","dna");assert.match(content.innerHTML,/DNA, RNA/);assert.ok(!content.innerHTML.includes("Doğru ✓"));
  for(let i=0;i<8;i++)h.click("next");assert.match(content.innerHTML,/4 \/ 4 · Yapı ve işlev/);
  for(let i=0;i<8;i++)h.click("previous");assert.match(content.innerHTML,/1 \/ 4 · Yapı ve işlev/);
});

test("WebGL/yükleme hatasında organ resmi ve tekrar düğmesi kalır",async()=>{
  const h=await uiHarness();h.click("organ","heart");await new Promise(resolve=>setImmediate(resolve));
  assert.equal(h.nodes.get("atlasModelStage").dataset.state,"error");assert.equal(h.nodes.get("atlasModelRetry").hidden,false);
  assert.match(h.nodes.get("atlasContent").innerHTML,/images\/heart\.webp/);
  h.click("topic","dolasim");assert.match(h.nodes.get("atlasContent").innerHTML,/Küçük ve büyük dolaşım/);
});

test("Geç gelen 3B sonuç yeni konuya veya organa yazamaz ve kaynaklarını bırakır",async()=>{
  const pending=[];let disposed=0;
  const h=await uiHarness((container,id,signal)=>new Promise(resolve=>pending.push({id,signal,resolve})));
  h.click("organ","heart");await new Promise(resolve=>setImmediate(resolve));
  h.click("organ","brain");await new Promise(resolve=>setImmediate(resolve));
  assert.equal(pending[0].signal.aborted,true);
  pending[0].resolve({dispose(){disposed++;}});await new Promise(resolve=>setImmediate(resolve));
  assert.equal(disposed,1);assert.equal(h.nodes.get("atlasModelStage").dataset.state,"loading");
  h.api.suspend();assert.equal(pending[1].signal.aborted,true);assert.equal(h.nodes.get("atlasModelStage").dataset.state,"idle");
  pending[1].resolve({dispose(){disposed++;}});await new Promise(resolve=>setImmediate(resolve));assert.equal(disposed,2);
  h.click("topic","sinir");assert.match(h.nodes.get("atlasContent").innerHTML,/Sinir sistemi/);
});

test("Atlas yükleme köprüsü hata durumunda gözlemcinin sonsuz tekrarına girmez",async()=>{
  let imports=0,retry,mounts=0;const panel={isConnected:true,writes:0,set innerHTML(v){this.writes++;},querySelector(){return {addEventListener(type,fn){retry=fn;}};}};
  const source=stripTypeScriptTypes(read("src/ui/biology-atlas-bridge.ts")).replace("export function installBiologyAtlas","function installBiologyAtlas").replace('import("./biology-atlas.ts")','importAtlas()');
  const context={window:{},importAtlas:()=>{imports++;return imports===1?Promise.reject(new Error("offline")):Promise.resolve({createBiologyAtlas:()=>({mount(){mounts++;return true;},suspend(){}})});}};
  vm.runInNewContext(source+"\nthis.api=installBiologyAtlas();",context);
  context.api.mount(panel);await new Promise(resolve=>setImmediate(resolve));
  context.api.mount(panel);context.api.mount(panel);assert.equal(imports,1);assert.equal(panel.writes,2);
  retry();await new Promise(resolve=>setImmediate(resolve));assert.equal(imports,2);assert.equal(mounts,1);
});

test("Dört laboratuvar sekmesi birbirini gizler; atlastan çıkış 3B yaşam döngüsünü durdurur",()=>{
  const names=["Periodic","Timeline","Science","Atlas"],nodes=new Map();let mounts=0,suspends=0;
  for(const name of names){nodes.set("v320Panel"+name,{hidden:true});nodes.set("v320Tab"+name,{classList:{toggle(){}}});}
  const window={addEventListener(){},YKSBiologyAtlas:{mount(p){assert.equal(p,nodes.get("v320PanelAtlas"));mounts++;},suspend(){suspends++;}},YKSScienceCards:{mount(){return true;}}};
  const document={readyState:"loading",addEventListener(){},getElementById:id=>nodes.get(id)||null};
  vm.runInNewContext(read("modules/learning-lab-v3.js"),{window,document,setTimeout(){},requestAnimationFrame(){}});
  window.YKSLearningLabV3.setTab("atlas");assert.equal(mounts,1);
  for(const name of names)assert.equal(nodes.get("v320Panel"+name).hidden,name!=="Atlas");
  window.YKSLearningLabV3.setTab("science");assert.equal(suspends,1);assert.equal(nodes.get("v320PanelAtlas").hidden,true);assert.equal(nodes.get("v320PanelScience").hidden,false);
});

test("Model önbelleği indirilmiş GLB'yi arka planda yeniden indirmez; çevrimdışı hata kontrollüdür",async()=>{
  const handlers={},map=new Map();let fetches=0;const waits=[];
  const context={self:{location:{origin:"https://example.test"},addEventListener(type,fn){handlers[type]=fn;}},URL,Response,AbortController,setTimeout,clearTimeout,caches:{open:async()=>({match:async request=>map.get(request.url)||null,put:async(request,response)=>map.set(request.url,response)})},fetch:async()=>{fetches++;return new Response("glTF");}};
  vm.runInNewContext(read("sw.js"),context);
  const request={method:"GET",url:"https://example.test/YKS-DEFTER-M-/anatomy/models/heart.glb",mode:"cors"};
  let result;const event={request,waitUntil(p){waits.push(p);},respondWith(p){result=p;}};
  handlers.fetch(event);assert.equal((await result).status,200);await Promise.all(waits);
  handlers.fetch(event);assert.equal((await result).status,200);assert.equal(fetches,1);
  context.fetch=async()=>{throw new Error("offline");};handlers.fetch({...event,request:{...request,url:request.url.replace("heart","brain")}});assert.equal((await result).status,503);
});
