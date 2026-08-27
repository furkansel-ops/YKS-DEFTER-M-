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

test("24 konu rehberi mekanizma, örnek, üç karşılaştırma ve hatırlama özeti içerir",async()=>{
  const {ATLAS_TOPICS}=await data(),{ATLAS_GUIDES}=await load("src/data/biology-atlas-guides.ts");
  assert.deepEqual(Object.keys(ATLAS_GUIDES).sort(),ATLAS_TOPICS.map(t=>t.id).sort());
  for(const t of ATLAS_TOPICS){
    const g=ATLAS_GUIDES[t.id];assert.ok(g.goal.length>30&&g.mechanism.length>150&&g.example.length>100&&g.takeaway.length>30,t.id);
    assert.equal(g.compare.length,3);assert.ok(g.compare.every(([a,b])=>a.length>3&&b.length>20),t.id);
  }
});

test("9 organın 52 yapısı benzersiz, konumlu ve ayrıntılıdır; beyin sınıflaması açık ayrılır",async()=>{
  const {ATLAS_ORGANS}=await data(),{organGuide}=await load("src/data/biology-organs.ts");let total=0;
  for(const organ of ATLAS_ORGANS){
    const guide=organGuide(organ.id);assert.ok(guide.orientation.length>50);total+=guide.structures.length;
    assert.equal(new Set(guide.structures.map(p=>p.id)).size,guide.structures.length);
    assert.equal(new Set(guide.structures.map(p=>p.side+p.row)).size,guide.structures.length);
    for(const p of guide.structures){assert.match(p.id,/^[a-z-]+$/);assert.ok(p.point[0]>=190&&p.point[0]<=535&&p.point[1]>=80&&p.point[1]<=450,p.id);assert.ok(p.detail.length>70&&p.exam.length>30,p.id);}
  }
  assert.equal(total,52);assert.match(organGuide("brain").connection,/Arka beyin: pons \+ beyincik \+ omurilik soğanı/);
  assert.match(organGuide("heart").orientation,/kişinin sağı görselin solunda/);
  for(const id of ["__proto__","constructor","missing"])assert.equal(organGuide(id),undefined);
});

test("Organ şemaları bütün yapılara erişilebilir etiket verir; kapalı görünüm iç etiketleri gizler",async()=>{
  const {ATLAS_ORGANS}=await data(),{organGuide}=await load("src/data/biology-organs.ts"),{organDiagram}=await load("src/ui/biology-organ-diagrams.ts");
  for(const {id} of ATLAS_ORGANS){
    const parts=organGuide(id).structures,svg=organDiagram(id,parts[0].id,true),closed=organDiagram(id,"",false);
    assert.equal((svg.match(/data-atlas-structure=/g)||[]).length,parts.length);
    assert.equal((svg.match(/aria-pressed="true"/g)||[]).length,1);assert.doesNotMatch(svg,/undefined|NaN|aria-hidden="true"/);
    assert.match(svg,/gerçek kesiti değildir/);assert.ok(!svg.includes("http://")||svg.includes('xmlns="http://www.w3.org/2000/svg"'));
    const hidden=(closed.match(/aria-hidden="true"/g)||[]).length;
    assert.equal(hidden,["heart","brain"].includes(id)?parts.filter(p=>p.internal).length:0,id);
    assert.match(organDiagram(id,"",true,false),/hide-labels/);
  }
  assert.match(organDiagram("heart","left-ventricle",true,true,true),/is-opening/);
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
    closest(){return this;}focus(){document.activeElement=this;}querySelector(){return null;}getAttribute(k){return this.attrs[k]??null;}
  }
  class Input extends Element {}class Select extends Element {}class Svg extends Element {}
  const ids=["atlasIndex","atlasCount","atlasGroupLabel","atlasMode-topic","atlasMode-model","atlasContent","atlasModelStatus","atlasModelStage","atlasModelRetry","atlasModelCanvas","atlasSearch","atlasGroup","atlasStructureInfo","atlasModelOpen","atlasModelLabels","atlas3DViewLabel","atlasModelWide"];
  const nodes=new Map(ids.map(id=>{const e=id==="atlasSearch"?new Input():id==="atlasGroup"?new Select():new Element();e.id=id;return [id,e];}));
  const panel=new Element();panel.querySelector=s=>nodes.get(s.slice(1));panel.querySelectorAll=()=>[];panel.contains=()=>true;panel.getClientRects=()=>[{}];
  const document={activeElement:null,addEventListener(){}};const window={addEventListener(){}};
  const source=stripTypeScriptTypes(read("src/ui/biology-atlas.ts").replace(/^import[^\n]*\n/gm,"")).replace("export function createBiologyAtlas","function createBiologyAtlas").replace('import("./biology-atlas-model.ts")','importModel()');
  const diagrams=await load("src/ui/biology-atlas-diagrams.ts");
  const context={...await data(),...await service(),...await load("src/data/biology-organs.ts"),...await load("src/data/biology-organ-landmarks.ts"),...await load("src/ui/biology-atlas-lessons.ts"),...await load("src/ui/biology-organ-diagrams.ts"),esc:diagrams.atlasEscape,window,document,Element,HTMLInputElement:Input,HTMLSelectElement:Select,SVGElement:Svg,AbortController,clearTimeout,setTimeout,importModel:async()=>({loadAtlasModel:loadModel||(()=>Promise.reject(new Error("WebGL yok")))})};
  vm.runInNewContext(source+"\nthis.api=createBiologyAtlas();",context);
  const fire=(type,target)=>panel.listeners[type][0]({target});
  const click=(action,id)=>{const target=new Element();target.dataset={atlasAction:action,id};fire("click",target);};
  const choose=value=>{const target=new Element();target.dataset={atlasStep:String(value)};fire("click",target);};
  const structure=id=>{const target=new Element();target.dataset={atlasStructure:id};fire("click",target);};
  const keyStructure=(id,key)=>{let prevented=false;const target=new Svg();target.setAttribute("data-atlas-structure",id);panel.listeners.keydown[0]({target,key,preventDefault(){prevented=true;}});return prevented;};
  context.api.mount(panel);
  return {api:context.api,panel,nodes,document,click,choose,structure,keyStructure,fire};
}

test("Atlas tekrar bağlanınca DOM/dinleyici çoğaltmaz ve arama odağını korur",async()=>{
  const h=await uiHarness();h.api.mount(h.panel);h.api.mount(h.panel);
  assert.equal(h.panel.writes,1);assert.equal(h.nodes.get("atlasContent").writes,1);
  assert.equal(Object.values(h.panel.listeners).flat().length,5);
  const search=h.nodes.get("atlasSearch");search.value="NEFRON";search.focus();h.fire("input",search);
  assert.equal(h.nodes.get("atlasCount").textContent,"1 görsel konu");assert.equal(h.document.activeElement,search);
  h.api.mount(h.panel);assert.equal(h.nodes.get("atlasContent").writes,2);
});

test("Görsel soru yanlış/doğru geri bildirimi verir, tekrar açılır ve konu değişince sıfırlanır",async()=>{
  const h=await uiHarness(),content=h.nodes.get("atlasContent");
  h.click("topic","sinir");
  h.click("practice");assert.ok(!content.innerHTML.includes('class="atlas-pin-label"'));h.choose(0);
  assert.match(content.innerHTML,/Birlikte düzeltelim/);assert.match(content.innerHTML,/Doğru nokta: 4/);
  h.click("retry-quiz");h.choose(3);assert.match(content.innerHTML,/Doğru ✓/);
  h.click("topic","dna");assert.match(content.innerHTML,/DNA, RNA/);assert.ok(!content.innerHTML.includes("Doğru ✓"));
  for(let i=0;i<8;i++)h.click("next");assert.match(content.innerHTML,/4 \/ 4 · Yapı ve işlev/);
  for(let i=0;i<8;i++)h.click("previous");assert.match(content.innerHTML,/1 \/ 4 · Yapı ve işlev/);
});

test("Konu atlası önce beş alan açar; grup ve arama odağı sade gezinmeyi korur",async()=>{
  const h=await uiHarness(),content=h.nodes.get("atlasContent"),index=h.nodes.get("atlasIndex");
  assert.match(content.innerHTML,/Neyi keşfetmek istersin/);assert.equal((index.innerHTML.match(/data-atlas-action="group"/g)||[]).length,5);
  assert.doesNotMatch(index.innerHTML,/data-atlas-action="topic"/);
  h.click("group","Genden proteine");assert.equal((index.innerHTML.match(/data-atlas-action="topic"/g)||[]).length,3);
  assert.equal(h.nodes.get("atlasGroup").value,"Genden proteine");
  h.click("topic","protein");assert.match(content.innerHTML,/Genetik şifre ve protein sentezi/);
  h.click("overview");assert.match(content.innerHTML,/Neyi keşfetmek istersin/);
  const search=h.nodes.get("atlasSearch");search.value="NEFRON";search.focus();h.fire("input",search);
  assert.match(content.innerHTML,/Nefron ve homeostasi/);assert.equal(h.document.activeElement,search);
});

test("Ayrıntılı anlatım istek üzerine açılır; sınamada mekanizma ve cevap ipuçları görünmez",async()=>{
  const h=await uiHarness(),content=h.nodes.get("atlasContent");h.click("topic","dolasim");
  assert.doesNotMatch(content.innerHTML,/Mekanizmayı bağla/);
  h.click("lesson-view","details");assert.match(content.innerHTML,/Mekanizmayı bağla/);assert.match(content.innerHTML,/Yan yana düşün/);assert.match(content.innerHTML,/Sol karıncık büyük dolaşıma/);
  h.click("practice");assert.doesNotMatch(content.innerHTML,/Mekanizmayı bağla|Yan yana düşün|atlas-related/);assert.doesNotMatch(content.innerHTML,/class="atlas-pin-label"/);
  h.click("lesson-view","steps");h.click("topic-labels");assert.match(content.innerHTML,/atlas-hide-labels/);
  h.click("wide");assert.match(content.innerHTML,/atlas-wide/);
});

test("Kalbin YKS yapısı AYNI 3B sahnede açılır; seçim, kapatma ve büyütme yeniden yüklemez",async()=>{
  let downloads=0,disposed=0,options;const opened=[],selected=[],labels=[];
  const h=await uiHarness(async(c,id,s,p,o)=>{options=o;downloads++;return {open:v=>opened.push(v),select:v=>selected.push(v),labels:v=>labels.push(v),dispose(){disposed++;}};});
  h.click("organ","heart");await new Promise(resolve=>setImmediate(resolve));
  const content=h.nodes.get("atlasContent"),writes=content.writes,info=h.nodes.get("atlasStructureInfo");
  options.onSelect("left-ventricle");assert.equal(opened.at(-1),true);assert.equal(selected.at(-1),"left-ventricle");assert.match(info.innerHTML,/Kalın kas duvarı yüksek basınç/);
  h.structure("right-atrium");assert.match(info.innerHTML,/Üst ve alt ana toplardamarlar/);
  h.click("cutaway");assert.equal(opened.at(-1),false);
  h.structure("aorta");assert.equal(opened.at(-1),false);assert.match(info.innerHTML,/Koroner atardamarlar/);
  h.click("organ-labels");assert.equal(labels.at(-1),false);h.click("wide");assert.equal(h.panel.dataset.atlasWide,"true");
  assert.equal(content.writes,writes);assert.equal(downloads,1);assert.equal(disposed,0);assert.doesNotMatch(content.innerHTML,/atlas-organ-svg/);
  h.api.suspend();assert.equal(disposed,1);
});

test("Beyin seçimi doğru açıklamayı açar; organ değişiminde eski seçimi taşımaz",async()=>{
  const h=await uiHarness(),content=h.nodes.get("atlasStructureInfo");h.click("organ-detail","brain");
  h.structure("cerebellum");assert.match(content.innerHTML,/hareketlerin zamanlamasını ve koordinasyonunu/);
  h.structure("hypothalamus");assert.equal(h.nodes.get("atlasModelOpen").attrs["aria-pressed"],"true");assert.match(content.innerHTML,/ADH ve oksitosin hipotalamusta üretilir/);
  h.click("organ-detail","kidneys");assert.match(h.nodes.get("atlasContent").innerHTML,/3B noktaya dokun/);assert.doesNotMatch(h.nodes.get("atlasContent").innerHTML,/ADH ve oksitosin/);
  h.structure("glomerulus");assert.match(content.innerHTML,/Sağlıklı süzüntü glikoz içerebilir/);
  const before=content.innerHTML;h.structure("__proto__");assert.equal(content.innerHTML,before);
});

test("Yüklenirken içini aç isteği indirmeyi iptal etmez; hazır olunca aynı modele uygulanır",async()=>{
  let resolveModel,disposed=0,signal;const opened=[],selected=[],h=await uiHarness((container,id,s)=>{signal=s;return new Promise(resolve=>{resolveModel=resolve;});});
  h.click("organ","heart");await new Promise(resolve=>setImmediate(resolve));const writes=h.nodes.get("atlasContent").writes;
  h.click("cutaway");h.structure("mitral");assert.equal(signal.aborted,false);
  resolveModel({open:v=>opened.push(v),select:v=>selected.push(v),dispose(){disposed++;}});await new Promise(resolve=>setImmediate(resolve));
  assert.equal(disposed,0);assert.equal(opened.at(-1),true);assert.equal(selected.at(-1),"mitral");assert.equal(h.nodes.get("atlasContent").writes,writes);
  h.click("organ-view","anatomy");assert.equal(disposed,1);assert.match(h.nodes.get("atlasContent").innerHTML,/atlas-organ-svg/);
});

test("Organın SVG etiketleri Enter ve boşlukla seçilebilir; diğer tuşlar seçim değiştirmez",async()=>{
  const h=await uiHarness(),content=h.nodes.get("atlasContent");h.click("organ","heart");h.click("organ-view","anatomy");
  assert.equal(h.keyStructure("left-ventricle","Enter"),true);assert.match(content.innerHTML,/Kalın kas duvarı/);
  assert.equal(h.keyStructure("right-atrium"," "),true);assert.match(content.innerHTML,/Üst ve alt ana toplardamarlar/);
  const before=content.innerHTML;assert.equal(h.keyStructure("mitral","ArrowRight"),false);assert.equal(content.innerHTML,before);
});

test("Görseli büyüt yan dizini kapatıp alan açar; görünümden çıkış dizini geri getirir",async()=>{
  const h=await uiHarness();h.click("organ-detail","heart");h.click("wide");assert.equal(h.panel.dataset.atlasWide,"true");
  h.structure("mitral");assert.equal(h.panel.dataset.atlasWide,"true");h.click("wide");assert.equal(h.panel.dataset.atlasWide,"false");
  h.click("wide");h.click("mode","topic");assert.equal(h.panel.dataset.atlasWide,"false");
  h.click("topic","dna");h.click("wide");assert.equal(h.panel.dataset.atlasWide,"true");h.click("group","Genden proteine");assert.equal(h.panel.dataset.atlasWide,"false");
});

test("Dokuz organın 52 yapısı 3B seçime bağlanır; seçim başına model indirilmez",async()=>{
  let downloads=0,disposed=0;const h=await uiHarness(async()=>{downloads++;return {dispose(){disposed++;}};});
  const {ATLAS_ORGANS}=await data(),{organGuide}=await load("src/data/biology-organs.ts");
  for(const {id} of ATLAS_ORGANS){h.click("organ-detail",id);await new Promise(resolve=>setImmediate(resolve));const writes=h.nodes.get("atlasContent").writes;for(const part of organGuide(id).structures){h.structure(part.id);assert.ok(h.nodes.get("atlasStructureInfo").innerHTML.includes(part.summary),part.id);}assert.equal(h.nodes.get("atlasContent").writes,writes);}
  assert.equal(downloads,9);h.click("organ-view","model");assert.equal(downloads,9);h.click("organ-view","anatomy");assert.equal(disposed,9);
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
  let imports=0,retry,reload,mounts=0,reloads=0;const panel={isConnected:true,writes:0,set innerHTML(v){this.writes++;},querySelector(selector){return {addEventListener(type,fn){if(selector==="[data-atlas-retry]")retry=fn;else reload=fn;}};}};
  const source=stripTypeScriptTypes(read("src/ui/biology-atlas-bridge.ts")).replace("export function installBiologyAtlas","function installBiologyAtlas").replace('import("./biology-atlas.ts")','importAtlas()');
  const context={window:{location:{reload(){reloads++;}}},importAtlas:()=>{imports++;return imports===1?Promise.reject(new Error("offline")):Promise.resolve({createBiologyAtlas:()=>({mount(){mounts++;return true;},suspend(){}})});}};
  vm.runInNewContext(source+"\nthis.api=installBiologyAtlas();",context);
  context.api.mount(panel);await new Promise(resolve=>setImmediate(resolve));
  context.api.mount(panel);context.api.mount(panel);assert.equal(imports,1);assert.equal(panel.writes,2);
  assert.equal(reloads,0);reload();assert.equal(reloads,1);
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
