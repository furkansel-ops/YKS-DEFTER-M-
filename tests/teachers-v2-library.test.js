const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");

const library=()=>fs.readFileSync(path.join(root,"src/ui/teachers-v2-library.ts"),"utf8");
const css=()=>fs.readFileSync(path.join(root,"src/ui/teachers-v2-library.css"),"utf8");
const main=()=>fs.readFileSync(path.join(root,"src/main.ts"),"utf8");

test("Hocalar v2 kaydedilen videolar mevcut studyPrefs ve save zincirinden taşınır",()=>{
  const source=library();
  assert.match(source,/const LIB_PREF_KEY="teachersV2LibraryV1"/);
  assert.match(source,/const prefs:Record<string,unknown>=isRecord\(previousPrefs\)\?\{\.\.\.previousPrefs\}:\{autoPlan:false\}/);
  assert.match(source,/prefs\[LIB_PREF_KEY\]=/);
  assert.match(source,/adapter\.save\(\)===false/);
  assert.doesNotMatch(source,/localStorage\.setItem\(["']yks["']/);
  assert.doesNotMatch(source,/DATA_SCHEMA_VERSION\s*[+=]/);
});

test("Hocalar v2 son izlenenleri yeni kayıt üretmeden mevcut watched zaman damgalarından çıkarır",()=>{
  const source=library();
  assert.match(source,/const map=watchedMap\(\)/);
  assert.match(source,/sort\(\(a,b\)=>Number\(b\.record\?\.at\|\|0\)-Number\(a\.record\?\.at\|\|0\)\)/);
  assert.match(source,/slice\(0,8\)/);
  assert.match(source,/Son izlediğin/);
  assert.match(source,/↻ Son izlenenler/);
  assert.doesNotMatch(source,/watchedMap\(\)\[[^\]]+\]\s*=/);
});

test("Hocalar v2 video kütüphanesi kaydetme ve tekrar açma yüzeylerini paketler",()=>{
  const source=library();
  assert.match(source,/Kütüphanem/);
  assert.match(source,/★ Kaydettiklerim/);
  assert.match(source,/button\.dataset\.libraryAction="toggle"/);
  assert.match(source,/★ Kaydedildi/);
  assert.match(source,/youtube-nocookie\.com\/embed/);
  assert.match(source,/if\(button\.textContent!==label\)button\.textContent=label/);
});

test("Hocalar v2 kişisel kütüphanesi medya sonrasında lazy ve fail-open yüklenir",()=>{
  const source=main();
  const style=css();
  assert.match(source,/import\("\.\/ui\/teachers-v2-media"\)/);
  assert.match(source,/return import\("\.\/ui\/teachers-v2-library"\)\.catch/);
  assert.match(source,/dataset\.teachersV2Library="deferred"/);
  assert.match(style,/@media\(pointer:coarse\)/);
  assert.match(style,/@media\(prefers-reduced-motion:reduce\)/);
  assert.match(style,/teachers-v2-video-save/);
});

function runtimeLibrary({state={studyPrefs:{autoPlan:false}},save=()=>true}={}){
  const vm=require("node:vm"),{stripTypeScriptTypes}=require("node:module"),messages=[];
  const adapter={readState:()=>state};if(save!==null)adapter.save=save;
  const window={YKSLegacyState:adapter,toast:message=>messages.push(message)};
  const document={readyState:"loading",addEventListener:()=>{},querySelectorAll:()=>[],getElementById:()=>null};
  const source=stripTypeScriptTypes(library().replace(/^import[^\n]*\n/gm,"").replace(/export\s*\{\};?/g,""));
  const api=vm.runInNewContext(source+"\n({bookmarkFor,buildIndex,handleClick,toggleFavorite,saveLibrary,readLibrary})",{window,document,console,HTMLElement:class HTMLElement{}});
  return {api,state,window,messages};
}

function mediaCard(id,title="Arşivden gelen video",teacher="Kimya Hocası"){
  return {dataset:{videoId:id,videoTitle:title,videoChannel:"Kimya Kanalı",videoThumb:`https://i.ytimg.com/vi/${id}/hqdefault.jpg`},
    closest:selector=>selector==="#teachersV2Overlay"?{querySelector:()=>({textContent:teacher})}:null};
}

test("a late archive video saves from its clicked card even when the preview feed has no entry",()=>{
  let saves=0;const h=runtimeLibrary({save:()=>{saves++;return true;}}),id="dQw4w9WgXcQ",card=mediaCard(id);
  const action={dataset:{libraryAction:"toggle",videoId:id},closest:selector=>selector===".teachers-v2-video-card"?card:null};
  let prevented=0,stopped=0;
  h.api.handleClick({target:{closest:()=>action},preventDefault:()=>prevented++,stopPropagation:()=>stopped++});
  const saved=h.state.studyPrefs.teachersV2LibraryV1.favorites[id];
  assert.equal(saved.title,"Arşivden gelen video");assert.equal(saved.teacher,"Kimya Hocası");
  assert.equal(saved.channel,"Kimya Kanalı");assert.equal(saved.thumbnail,card.dataset.videoThumb);
  assert.equal(saved.url,`https://www.youtube.com/watch?v=${id}`);assert.equal(saves,1);
  assert.equal(prevented,1);assert.equal(stopped,1);assert.ok(h.messages[0].includes("kaydedildi"));
});

test("bookmark metadata comes from the clicked playlist card while indexed lookups still work",()=>{
  const h=runtimeLibrary(),id="dQw4w9WgXcQ";
  h.api.buildIndex({teachers:{Preview:{name:"Önizleme hocası",videos:[{id,title:"Eski önizleme",channel:"Önizleme kanalı"}]}}});
  assert.equal(h.api.bookmarkFor(id).title,"Eski önizleme");
  const selected=h.api.bookmarkFor(id,mediaCard(id,"Seçilen playlist videosu","Seçilen hoca"));
  assert.equal(selected.title,"Seçilen playlist videosu");assert.equal(selected.teacher,"Seçilen hoca");
  assert.equal(h.api.bookmarkFor(id,mediaCard("anotherVideo")).title,"Eski önizleme");
  assert.equal(h.api.bookmarkFor("missing",null),null);
});

test("failed library saves restore the exact previous study preferences and favorite record",()=>{
  const id="dQw4w9WgXcQ",bookmark={id,title:"Var olan video",teacher:"Hoca",channel:"Kanal",thumbnail:"",url:`https://youtu.be/${id}`,savedAt:123};
  for(const save of [()=>false,()=>{throw new Error("Disk full");}]){
    const original={autoPlan:false,otherPreference:{enabled:true},teachersV2LibraryV1:{favorites:{[id]:bookmark},updatedAt:123}};
    const state={studyPrefs:original},h=runtimeLibrary({state,save});
    h.api.toggleFavorite(id);
    assert.equal(state.studyPrefs,original);assert.equal(state.studyPrefs.teachersV2LibraryV1.favorites[id],bookmark);
    h.api.toggleFavorite("newVideo123",mediaCard("newVideo123"));
    assert.equal(state.studyPrefs,original);assert.equal(state.studyPrefs.teachersV2LibraryV1.favorites.newVideo123,undefined);
    assert.ok(h.messages.every(message=>message==="Video kaydı saklanamadı"));
  }
});

test("missing save hooks do not claim success or create preferences; failed saves preserve absent preferences",()=>{
  for(const save of [null,()=>false]){
    const state={},h=runtimeLibrary({state,save});
    assert.equal(h.api.saveLibrary({favorites:{},updatedAt:123}),false);
    assert.equal(Object.hasOwn(state,"studyPrefs"),false);
    h.api.toggleFavorite("dQw4w9WgXcQ",mediaCard("dQw4w9WgXcQ"));
    assert.equal(Object.hasOwn(state,"studyPrefs"),false);assert.equal(h.messages[0],"Video kaydı saklanamadı");
  }
});
