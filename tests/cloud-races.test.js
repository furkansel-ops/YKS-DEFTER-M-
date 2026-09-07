const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");
const {pathToFileURL}=require("node:url");
const core=require("../modules/core-utils.js");
const dataUrl=file=>pathToFileURL(path.resolve(__dirname,"../src/data",file)).href;
const html=fs.readFileSync(path.resolve(__dirname,"../index.html"),"utf8");
const algorithm=html.slice(html.indexOf("const CLOUD_FORMAT=4"),html.indexOf("function authErrorText(e)"));
const clone=value=>JSON.parse(JSON.stringify(value));
const defaults=()=>({v:21,denemeler:[],wrongLog:[],solved:{},focus:{sw:{run:false,start:0,acc:0,cr:0},swLaps:[]},yt:{key:""}});
const storage=()=>{const rows=new Map();return {getItem:key=>rows.get(key)||null,setItem:(key,value)=>rows.set(key,String(value)),removeItem:key=>rows.delete(key)};};

async function harness(){
  const [{stateHash},{buildCloudPayload}]=await Promise.all([import(dataUrl("codec.ts")),import(dataUrl("cloud-state.ts"))]);
  const rows=new Map(),timers=[],baselines=new Map(),hooks={},applied=[];
  const metaPath="users/account/sync/meta",chunkPath="users/account/chunks/";
  const snap=ref=>({exists:()=>rows.has(ref),data:()=>clone(rows.get(ref)||{}),ref,id:ref.split("/").at(-1)});
  const window={S:defaults(),__YKS_STATE_EPOCH:1,dispatchEvent(){},YKSCore:core};
  const cloud=()=>buildCloudPayload(JSON.stringify(window.S),"localStorage").json;
  const context=vm.createContext({
    window,document:{documentElement:{dataset:{}},hidden:false},navigator:{onLine:true},
    localStorage:storage(),sessionStorage:storage(),crypto:{randomUUID:()=>"test-device"},
    console:{error(){},warn(){}},CustomEvent:class {},Blob,performance,
    box:null,txt:null,meta:null,retry:null,db:{},auth:{currentUser:{uid:"account"}},
    DATA_SCHEMA:21,APP_VERSION:"test",DEF:defaults(),STORAGE_KEY:"state",PERF_STATE:{},
    S:window.S,lastPersistedJSON:"",infraHash:stateHash,safeJSONParse:JSON.parse,
    infraError(){},conflictBackupAdd(){},normalize:clone,migrateState:clone,
    renderAfterExternalState(){},renderSw(){},persistStateHashMaybe(){},
    perfInvalidateState(){window.__YKS_STATE_EPOCH++;},
    setInterval(){},setTimeout(fn,delay){timers.push({fn,delay});return timers.length;},clearTimeout(){},
    doc:(_db,...parts)=>parts.join("/"),collection:(_db,...parts)=>parts.join("/"),
    getDoc:async ref=>snap(ref),
    getDocs:async ref=>{
      const docs=[...rows.keys()].filter(key=>key.startsWith(ref+"/")).map(key=>({ref:key,id:key.split("/").at(-1),data:()=>clone(rows.get(key)||{})}));
      if(hooks.getDocs)await hooks.getDocs();return {docs};
    },
    runTransaction:async(_db,callback)=>{
      if(hooks.beforeTransaction)await hooks.beforeTransaction();
      const operations=[];
      const result=await callback({get:async ref=>snap(ref),set:(ref,data,options)=>operations.push(()=>rows.set(ref,options?.merge?{...rows.get(ref),...clone(data)}:clone(data))),delete:ref=>operations.push(()=>rows.delete(ref))});
      operations.forEach(run=>run());return result;
    },
    writeBatch:()=>({delete(){},async commit(){}}),serverTimestamp:()=>0,
    signOut:async()=>{},
  });
  const run=source=>vm.runInContext(source,context);
  window.__YKS_DATA__={
    cloudPayload:async()=>{if(hooks.cloudPayload)await hooks.cloudPayload();return {ok:true,json:cloud()};},
    readCloudBaseline:async uid=>{if(hooks.readBaseline)await hooks.readBaseline();const json=baselines.get(uid);return json?{ok:true,json,hash:stateHash(json)}:{ok:false};},
    writeCloudBaseline:async(uid,json)=>{if(hooks.writeBaseline)await hooks.writeBaseline();baselines.set(uid,json);return {ok:true,hash:stateHash(json)};},
    clearCloudBaseline:async uid=>baselines.delete(uid),
    applyCloudJSON:async(json,guard)=>{
      if(hooks.beforeApply)await hooks.beforeApply();
      if(guard&&!guard())return {ok:false,status:"stale"};
      applied.push(json);window.S=JSON.parse(json);context.S=window.S;window.__YKS_STATE_EPOCH++;
      return {ok:true,status:"applied",json};
    }
  };
  run(algorithm);run('user={uid:"account"};setAccount("account");');
  const setBase=()=>{const json=cloud();baselines.set("account",json);context.baselineFixture=json;run('setBaseRev(1);setBaseHash(infraHash(baselineFixture));memoryBaseJSON=baselineFixture;setDirty(false);');};
  const setRemote=(state,revision=2)=>{const json=buildCloudPayload(JSON.stringify(state),"localStorage").json;rows.set(metaPath,{format:4,revision,count:1,hash:stateHash(json)});rows.set(chunkPath+String(revision).padStart(10,"0")+"_0000",{format:4,revision,index:0,data:json});return {rev:revision,json,obj:JSON.parse(json)};};
  const edit=change=>{change(window.S);window.__YKS_STATE_EPOCH++;run("window.yksCloudSchedule()");};
  return {context,run,window,rows,timers,baselines,hooks,applied,cloud,setBase,setRemote,edit,metaPath,chunkPath};
}

test("giriş indirmesi sürerken eklenen yerel kayıt uzak kayıtla birlikte korunur",async()=>{
  const h=await harness();h.setBase();const remote=defaults();remote.denemeler.push({id:1,name:"PC"});h.setRemote(remote);
  h.hooks.getDocs=()=>{delete h.hooks.getDocs;h.edit(state=>state.denemeler.push({id:2,name:"Telefon son düzenleme"}));};
  await h.run("downloadOrSeed()");
  assert.deepEqual(h.window.S.denemeler.map(row=>row.id).sort(),[1,2]);assert.equal(h.run("dirty"),true);
});

test("realtime temiz dalında ağ beklerken gelen düzenleme birleştirmeye yönlendirilir",async()=>{
  const h=await harness();h.setBase();const remote=defaults();remote.denemeler.push({id:1,name:"PC"});h.setRemote(remote);
  h.hooks.getDocs=()=>{delete h.hooks.getDocs;h.edit(state=>state.denemeler.push({id:2,name:"Son yerel kayıt"}));};
  await h.run('(async()=>{const remote=await readRemote(null,"account");return applyRemote(remote,"realtime","account",syncGeneration);})()');
  assert.deepEqual(h.window.S.denemeler.map(row=>row.id).sort(),[1,2]);
});

test("üç yönlü taban okunurken gelen düzenleme eski çağrı görüntüsüne yenilmez",async()=>{
  const h=await harness();h.setBase();h.run('memoryBaseJSON="";');const remote=defaults();remote.denemeler.push({id:1,name:"Uzak"});h.context.remoteFixture=h.setRemote(remote);h.context.oldLocal=JSON.parse(h.cloud());
  h.hooks.readBaseline=()=>{delete h.hooks.readBaseline;h.edit(state=>state.denemeler.push({id:2,name:"Taban beklerken"}));};
  await h.run('applyMerged(remoteFixture,oldLocal,"account",syncGeneration)');
  assert.deepEqual(h.window.S.denemeler.map(row=>row.id).sort(),[1,2]);
});

test("kuyrukta bekleyen eski bulut uygulaması yeni düzenlemeyi değiştirmeden yeniden denenir",async()=>{
  const h=await harness();h.setBase();h.context.remoteFixture=h.setRemote({...defaults(),denemeler:[{id:1,name:"Uzak"}]});
  h.hooks.beforeApply=()=>h.edit(state=>state.denemeler.push({id:2,name:"Kuyruk sırasında"}));
  assert.equal(await h.run('applyRemote(remoteFixture,"realtime","account",syncGeneration)'),false);
  assert.equal(h.applied.length,0);assert.deepEqual(h.window.S.denemeler.map(row=>row.id),[2]);assert.equal(h.run("pendingRemote&&dirty"),true);
});

test("yükleme sonrası taban saklanırken yapılan düzenleme kirli kalır ve tekrar yüklenir",async()=>{
  const h=await harness();h.setBase();h.setRemote(defaults(),1);h.edit(state=>state.denemeler.push({id:1,name:"Gönderilen"}));
  h.hooks.writeBaseline=()=>{delete h.hooks.writeBaseline;h.edit(state=>state.denemeler.push({id:2,name:"Gönderim sırasında"}));};
  await h.run("upload()");
  assert.equal(h.run("dirty"),true);assert.ok(h.timers.some(timer=>timer.delay===500));
  assert.deepEqual(JSON.parse(h.baselines.get("account")).denemeler.map(row=>row.id),[1]);
  assert.deepEqual(h.window.S.denemeler.map(row=>row.id),[1,2]);
});

test("uzak kayıt uygulandıktan sonra taban yazılırken gelen düzenleme eşitlenmiş sayılmaz",async()=>{
  const h=await harness();h.setBase();h.context.remoteFixture=h.setRemote({...defaults(),denemeler:[{id:1,name:"Uzak"}]});
  h.hooks.writeBaseline=()=>{delete h.hooks.writeBaseline;h.edit(state=>state.denemeler.push({id:2,name:"Yeni yerel"}));};
  await h.run('applyRemote(remoteFixture,"realtime","account",syncGeneration)');
  assert.equal(h.run("dirty"),true);assert.deepEqual(JSON.parse(h.baselines.get("account")).denemeler.map(row=>row.id),[1]);
  assert.deepEqual(h.window.S.denemeler.map(row=>row.id),[1,2]);
});

test("uzak ve birleştirilmiş kayıtlar cihazın YouTube anahtarını ve çalışan sayacını korur",async()=>{
  for(const merge of [false,true]){
    const h=await harness();h.window.S.yt.key="yalnız-cihaz";h.window.S.focus.sw={run:true,start:100,acc:77,cr:3};h.window.S.focus.swLaps=[{id:9}];h.setBase();
    h.context.remoteFixture=h.setRemote({...defaults(),denemeler:[{id:1,name:"Uzak"}]});
    await h.run(merge?'applyMerged(remoteFixture,{},"account",syncGeneration)':'applyRemote(remoteFixture,"realtime","account",syncGeneration)');
    assert.equal(h.window.S.yt.key,"yalnız-cihaz");assert.equal(h.window.S.focus.sw.run,true);assert.equal(h.window.S.focus.sw.acc,77);assert.deepEqual(h.window.S.focus.swLaps,[{id:9}]);
    assert.equal(JSON.parse(h.cloud()).yt.key,"");
  }
});

test("silme tamamlanırken yeniden oluşturulan meta eski temizlikle mezar taşına dönmez",async()=>{
  const h=await harness();h.rows.set(h.metaPath,{format:4,revision:5,deleted:true,cleanupPending:true});
  h.hooks.getDocs=()=>{delete h.hooks.getDocs;h.setRemote({...defaults(),denemeler:[{id:9,name:"Yeniden açılmış"}]},6);};
  assert.equal(await h.run('cleanupDeletedCloud("account",5)'),false);
  assert.equal(h.rows.get(h.metaPath).revision,6);assert.equal(h.rows.get(h.metaPath).deleted,undefined);assert.equal(h.rows.size,2);
});

test("eski silme listesi işlem başlamadan yeniden açılan hesabın parçalarını silmez",async()=>{
  const h=await harness();h.rows.set(h.metaPath,{format:4,revision:5,deleted:true,cleanupPending:true});h.rows.set(h.chunkPath+"0000000004_0000",{format:4,revision:4,index:0,data:"old"});
  h.hooks.beforeTransaction=()=>{delete h.hooks.beforeTransaction;h.setRemote({...defaults(),denemeler:[{id:9,name:"Yeni"}]},6);};
  assert.equal(await h.run('cleanupDeletedCloud("account",5)'),false);
  assert.equal(h.rows.size,3);assert.equal(h.rows.get(h.metaPath).revision,6);
});

test("aynı silme revizyonunun parçaları sınırlandırılmış işlemlerle tamamen temizlenir",async()=>{
  const h=await harness();h.rows.set(h.metaPath,{format:4,revision:5,deleted:true,cleanupPending:true});
  for(let i=0;i<451;i++)h.rows.set(h.chunkPath+"0000000004_"+String(i).padStart(4,"0"),{format:4,revision:4,index:i,data:"old"});
  assert.equal(await h.run('cleanupDeletedCloud("account",5)'),true);
  assert.equal(h.rows.size,1);assert.equal(h.rows.get(h.metaPath).revision,5);assert.equal(h.rows.get(h.metaPath).cleanupPending,false);
});

test("başka cihazın tamamladığı aynı silme revizyonu tekrar yazılmadan başarılı döner",async()=>{
  for(const completesDuringTransaction of [false,true]){
    const h=await harness();
    const completed={format:4,revision:5,deleted:true,cleanupPending:false,count:0,hash:"",updatedAt:777};
    h.rows.set(h.metaPath,{...completed,cleanupPending:completesDuringTransaction});
    if(completesDuringTransaction)h.hooks.beforeTransaction=()=>{
      delete h.hooks.beforeTransaction;h.rows.set(h.metaPath,clone(completed));
    };
    let writes=0;
    const transact=h.context.runTransaction;
    h.context.runTransaction=(_db,callback)=>transact(_db,tx=>callback({
      ...tx,set(...args){writes++;return tx.set(...args);}
    }));
    assert.equal(await h.run('cleanupDeletedCloud("account",5)'),true);
    assert.equal(writes,0);assert.deepEqual(h.rows.get(h.metaPath),completed);assert.equal(h.rows.size,1);
  }
});

test("gerçek ana kayıt koordinatörü gecikmiş bulut yazısından sonra yeni yerel aynayı geri alır",async()=>{
  const [{decodeState},{PrimaryStateCoordinator}]=await Promise.all([import(dataUrl("codec.ts")),import(dataUrl("primary-store.ts"))]);
  let epoch=1,localJSON='{"v":21,"name":"İlk"}',runtimeApplies=0;
  const mirror={read:()=>decodeState(localJSON),readMirrorMetadata:()=>({hash:"",updatedAt:0}),writeMirrorMetadata:()=>({ok:true})};
  const target={state:undefined,async readState(){return this.state;},async commit(state){this.state=clone(state);if(state.source==="firebase"){await Promise.resolve();localJSON='{"v":21,"name":"Yazma sürerken yerel"}';epoch++;}}};
  const runtime={applyJSON(json){runtimeApplies++;localJSON=json;return {ok:true,json};}};
  const result=await new PrimaryStateCoordinator(mirror,target,runtime,()=>100).replaceFromExternal('{"v":21,"name":"Eski bulut"}',50,"firebase",()=>epoch===1);
  assert.equal(result.status,"stale");assert.equal(runtimeApplies,0);assert.equal(target.state.json,localJSON);assert.equal(JSON.parse(localJSON).name,"Yazma sürerken yerel");
});

test("gerçek ana kayıt koordinatörü kuyruğa girmeden eskimiş buluta hiçbir yazı yapmaz",async()=>{
  const [{decodeState},{PrimaryStateCoordinator}]=await Promise.all([import(dataUrl("codec.ts")),import(dataUrl("primary-store.ts"))]);
  let writes=0,applies=0;
  const mirror={read:()=>decodeState('{"v":21}'),readMirrorMetadata:()=>({hash:"",updatedAt:0}),writeMirrorMetadata:()=>({ok:true})};
  const target={async readState(){},async commit(){writes++;}};
  const result=await new PrimaryStateCoordinator(mirror,target,{applyJSON(json){applies++;return {ok:true,json};}}).replaceFromExternal('{"v":21}',1,"firebase",()=>false);
  assert.equal(result.status,"stale");assert.equal(writes,0);assert.equal(applies,0);
});

test("ana köprü daha yeni/bozuk kaydı reddettiğinde eski çalışma ekranı buluta gönderilmez",async()=>{
  const h=await harness();h.setBase();h.setRemote(defaults(),1);h.edit(state=>state.denemeler.push({id:2,name:"Eski çalışma ekranı"}));
  h.window.__YKS_DATA__.cloudPayload=async()=>({ok:false,message:"Yerel kayıt daha yeni veri şemasında"});
  await h.run("upload()");
  assert.equal(h.rows.get(h.metaPath).revision,1);assert.equal(h.run("dirty"),true);
  assert.equal(h.context.document.documentElement.dataset.webCloudState,"error");
});

test("kalıcı taban saklanamadığında değişmemiş yükleme kısa yolu sahte eşitlendi göstermez",async()=>{
  const h=await harness();h.setBase();h.setRemote(defaults(),1);h.edit(state=>state.denemeler.push({id:2,name:"Gönderilen"}));
  h.window.__YKS_DATA__.writeCloudBaseline=async()=>({ok:false,message:"disk full"});
  await h.run("upload()");assert.equal(h.run("dirty"),false);
  assert.equal(h.context.document.documentElement.dataset.webCloudState,"error");
  await h.run("upload()");
  assert.equal(h.run("memoryBaseDurable"),false);assert.equal(h.context.document.documentElement.dataset.webCloudState,"error");
  h.window.__YKS_DATA__.writeCloudBaseline=async(uid,json)=>{h.baselines.set(uid,json);return {ok:true,hash:h.context.infraHash(json)};};
  await h.run("upload()");
  assert.equal(h.run("memoryBaseDurable"),true);assert.equal(h.context.document.documentElement.dataset.webCloudState,"synced");
});

test("ana köprü hata fırlattığında eski ekran görüntüsüne sessiz geri dönüş yapılmaz",async()=>{
  const h=await harness();h.setBase();h.setRemote(defaults(),1);h.edit(state=>state.denemeler.push({id:2,name:"Gönderilmemeli"}));
  h.window.__YKS_DATA__.cloudPayload=async()=>{throw new Error("Geçerli ana kayıt okunamadı");};
  await h.run("upload()");
  assert.equal(h.rows.get(h.metaPath).revision,1);assert.equal(h.run("dirty"),true);
  assert.equal(h.context.document.documentElement.dataset.webCloudState,"error");
});

test("ana köprü hiç yoksa eski çalışma zamanı güvenli cihaz alanlarını ayıklamayı sürdürür",async()=>{
  const h=await harness();h.window.S.yt.key="yalnız-cihaz";h.window.S.focus.sw.run=true;
  delete h.window.__YKS_DATA__;
  const payload=JSON.parse(await h.run("cloudJSON()"));
  assert.equal(payload.yt.key,"");assert.equal(payload.focus.sw.run,false);assert.deepEqual(payload.focus.swLaps,[]);
});

test("değişmemiş yüklemenin taban yeniden denemesi sırasında gelen düzenleme eşitlendi sayılmaz",async()=>{
  const h=await harness();h.setBase();h.setRemote(defaults(),1);
  h.hooks.writeBaseline=()=>{delete h.hooks.writeBaseline;h.edit(state=>state.denemeler.push({id:2,name:"Taban kurtarılırken"}));};
  await h.run("upload()");
  assert.equal(h.run("dirty"),true);assert.equal(h.run("uploading"),false);
  assert.equal(h.context.document.documentElement.dataset.webCloudState,"syncing");assert.ok(h.timers.some(timer=>timer.delay===500));
  assert.equal(h.rows.get(h.metaPath).revision,1);assert.deepEqual(h.window.S.denemeler.map(row=>row.id),[2]);
});

test("taban yeniden denemesi sürerken ikinci yükleme paralel bulut yazısı başlatmaz",async()=>{
  const h=await harness();h.setBase();h.setRemote(defaults(),1);
  h.hooks.writeBaseline=async()=>{
    delete h.hooks.writeBaseline;h.edit(state=>state.denemeler.push({id:2,name:"Son yerel"}));
    await h.run("upload()");assert.equal(h.rows.get(h.metaPath).revision,1);
  };
  await h.run("upload()");
  assert.equal(h.run("dirty"),true);assert.equal(h.run("uploading"),false);assert.ok(h.timers.some(timer=>timer.delay===500));
});

test("taban yeniden denemesi sırasında hesap kapanırsa eski işlem yeşil duruma geçmez",async()=>{
  const h=await harness();h.setBase();h.setRemote(defaults(),1);
  h.run('status("Çıkış yapılıyor","signedout");');
  h.hooks.writeBaseline=()=>{delete h.hooks.writeBaseline;h.run("user=null;syncGeneration++;");};
  await h.run("upload()");
  assert.equal(h.run("uploading"),false);assert.equal(h.context.document.documentElement.dataset.webCloudState,"signedout");
  assert.equal(h.rows.get(h.metaPath).revision,1);
});
