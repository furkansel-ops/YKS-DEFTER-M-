const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");
const {stripTypeScriptTypes}=require("node:module");

const root=path.resolve(__dirname,"..");
const read=file=>fs.readFileSync(path.join(root,file),"utf8");
const SOURCE=stripTypeScriptTypes(read("src/ui/account-sign-out.ts").replace(/^import[^\n]+\n/gm,"")).replace(/^export /gm,"");

function storage(entries=[]){
  const map=new Map(entries);
  return{map,getItem:k=>map.has(k)?map.get(k):null,setItem:(k,v)=>map.set(k,String(v)),removeItem:k=>map.delete(k),clear:()=>map.clear()};
}

/* Ana hesapla girilmiş, verisi cihazda duran bir tarayıcı. */
function harness({dirty="0",online=true,answers=[],uploadWorks=true}={}){
  const local=storage([["yks",'{"name":"Ana hesap"}'],["yks_entry_choice_v1","account"],["yks_last_sync_at","1"],["yks_cloud_dirty",dirty]]);
  const calls={signOut:0,dexie:[],reload:0,confirms:[],toasts:[]};
  const ctx={
    console:{warn(){},error(){}},setTimeout,Date,Promise,
    localStorage:local,sessionStorage:storage([["yks_launch_seen_v1","1"]]),
    navigator:{onLine:online},
    location:{reload:()=>calls.reload++},
    document:{addEventListener(){}},
    addEventListener(){},
    confirm:text=>{calls.confirms.push(text);return answers.length?answers.shift():true;},
    toast:text=>calls.toasts.push(text),
    save:()=>true,
    yksCloudForceDirty:()=>{if(uploadWorks)local.setItem("yks_cloud_dirty","0");},
    Dexie:{delete:async name=>calls.dexie.push(name)},
    YKS_DATABASE_NAME:"yks-defterim-v4",
    YKS_STORAGE_KEYS:{cloudDirty:"yks_cloud_dirty"},
    firebaseAuth:async()=>({auth:{},m:{signOut:async()=>{calls.signOut++;}}})
  };
  ctx.window=ctx;
  vm.runInNewContext(SOURCE+"\nwindow.signOutAndClear=signOutAndClear;",ctx);
  return{ctx,local,calls};
}

test("çıkış: oturum kapanır, eski hesabın verisi silinir, sayfa giriş ekranıyla yenilenir",async()=>{
  const {ctx,local,calls}=harness();
  await ctx.signOutAndClear();
  assert.equal(calls.signOut,1);
  assert.equal(local.map.size,0,"ana hesabın kaydı ve 'account/guest' seçimi cihazda kalmamalı");
  assert.equal(ctx.sessionStorage.map.size,0,"açılış ekranı 'bu oturumda görüldü' diye atlanmamalı");
  assert.deepEqual(calls.dexie,["yks-defterim-v4"]);
  assert.equal(calls.reload,1);
  assert.equal(ctx.save(),false,"kapanışta save() eski veriyi geri yazmamalı");
});

test("çıkış: vazgeçilirse hiçbir şey değişmez",async()=>{
  const {ctx,local,calls}=harness({answers:[false]});
  await ctx.signOutAndClear();
  assert.equal(calls.signOut,0);assert.equal(calls.reload,0);
  assert.equal(local.getItem("yks"),'{"name":"Ana hesap"}');
});

test("çıkış: gönderilmemiş değişiklik önce buluta gönderilir, sonra silinir",async()=>{
  const {ctx,local,calls}=harness({dirty:"1"});
  await ctx.signOutAndClear();
  assert.equal(calls.confirms.length,1,"gönderim başarılıysa ek uyarı yok");
  assert.equal(calls.signOut,1);assert.equal(local.map.size,0);
});

test("çıkış: çevrimdışı ve gönderilmemiş değişiklik varsa uyarır; vazgeçince veri kalır",async()=>{
  const {ctx,local,calls}=harness({dirty:"1",online:false,answers:[true,false]});
  await ctx.signOutAndClear();
  assert.equal(calls.confirms.length,2);
  assert.match(calls.confirms[1],/gönderilemedi.*kaybolur/s);
  assert.equal(calls.signOut,0);assert.equal(calls.reload,0);
  assert.equal(local.getItem("yks"),'{"name":"Ana hesap"}');
  assert.equal(local.getItem("yks_cloud_dirty"),"1");
});

test("çıkış: tüm 'Çıkış yap' düğmeleri aynı yoldan geçer; profil eski 'veriler kalır' çıkışını kullanmaz",()=>{
  const signOut=read("src/ui/account-sign-out.ts"),page=read("src/ui/profile-page-v62.ts");
  assert.match(signOut,/closest\?\.\("#cloudLogoutBtn"\)/);
  assert.match(signOut,/event\.stopImmediatePropagation\(\)/);
  assert.match(page,/installAccountSignOut\(\);/);
  assert.match(page,/action==="signout"\)\{close\(\);void signOutAndClear\(\);\}/);
  assert.doesNotMatch(page,/Çıkış yapılsın mı\? Bu cihazdaki çalışmaların kalır/);
  assert.doesNotMatch(page,/setItem\(ENTRY_KEY,"guest"\);\}catch\{\}\n      close\(\);\n      toast\("Çıkış yapıldı"\)/);
  // Seçim silinince karşılama (Giriş yap / Hesap oluştur) ekranı açılır.
  const welcome=read("src/ui/auth-welcome-v60.ts");
  assert.match(welcome,/\}else\{\n    open\("welcome"\);/);
});
