const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");
const root=path.resolve(__dirname,"..");
const source=fs.readFileSync(path.join(root,"scripts/patch-teachers-v2-known-custom.mjs"),"utf8");
const archive=fs.readFileSync(path.join(root,"scripts/build-teachers-v2-archives.mjs"),"utf8");
const ui=fs.readFileSync(path.join(root,"src/ui/teachers-v2-media.ts"),"utf8");
const norm=value=>String(value||"").toLocaleLowerCase("tr-TR").normalize("NFKD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9ığüşöç]+/gi," ").trim();
function extraction(from,to){
  const a=source.indexOf(from),b=source.indexOf(to,a);
  assert.ok(a>=0&&b>a,from+" source section");
  return source.slice(a,b);
}
const logic=vm.runInNewContext(
  extraction("function rendererObject(","async function fetchChannelPlaylists(")+"\n"+
  extraction("function seededPlaylists(","async function runPool(")+"\n"+
  "({rendererObject,parsePlaylists,seededPlaylists,mergePlaylists})",
  {norm,MAX_PLAYLISTS:20,CURATED_PLAYLISTS:{
    "Özcan Aykın":[
      {id:"PLhhV4F6NB0-uEPdZncMf_qb0tSKyBM-Lf",title:"2027 TYT Fizik Kampı"},
      {id:"PLhhV4F6NB0-tU__PwCFhnaK-Gg_I3JG_4",title:"2027 AYT Fizik Kampı"}
    ],
    "Kadir Gümüş":[{id:"PL5kIOunpmSBOJBHFmxRmCCG1BFofMPx2n",title:"Kadir Gümüş TYT"}]
  },encodeURIComponent}
);

test("verified channel parser reads playlistRenderer titles and ignores global suggestions",()=>{
  const valid={playlistId:"PLPhysics2027TYT012",title:{runs:[{text:"2027 TYT Fizik Kampı"}]}};
  const unrelated="PLSomeoneElses001";
  const html='{"playlistId":"'+unrelated+'","title":{"runs":[{"text":"TYT Başka Hoca"}]}}'+
    '"playlistRenderer":'+JSON.stringify(valid);
  const rows=JSON.parse(JSON.stringify(logic.parsePlaylists(html,{
    name:"Özcan Aykın",channelId:"UC_IRxSYYyDa4Li9lxAM4xbQ",subjects:["Fizik"]
  })));
  assert.equal(rows.length,1);
  assert.equal(rows[0].id,valid.playlistId);
  assert.equal(rows[0].title,"2027 TYT Fizik Kampı");
  assert.equal(rows[0].source,"verified-channel");
  assert.equal(rows[0].channelId,"UC_IRxSYYyDa4Li9lxAM4xbQ");
  assert.ok(!rows.some(row=>row.id===unrelated));
});

test("curated TYT and AYT playlists remain available when the channel page returns only one",()=>{
  const teacher={name:"Özcan Aykın",channelId:"UC_IRxSYYyDa4Li9lxAM4xbQ"};
  const seeds=logic.seededPlaylists(teacher.name,teacher);
  const onlyOne=[{id:seeds[0].id,title:"Güncel TYT",channelId:teacher.channelId,source:"verified-channel"}];
  const output=JSON.parse(JSON.stringify(logic.mergePlaylists([],onlyOne,teacher,seeds)));
  assert.equal(output.length,2);
  assert.deepEqual(output.map(row=>row.id),[
    "PLhhV4F6NB0-uEPdZncMf_qb0tSKyBM-Lf",
    "PLhhV4F6NB0-tU__PwCFhnaK-Gg_I3JG_4"
  ]);
});

test("foreign and ownership-unknown old playlists never contaminate a teacher",()=>{
  const teacher={name:"Özcan Aykın",channelId:"UC_IRxSYYyDa4Li9lxAM4xbQ"};
  const bad=[
    {id:"PLUnknownOld000001",title:"Biosem TYT Biyoloji"},
    {id:"PLDifferentChannel00",title:"Dr Biyoloji",channelId:"UCOtherChannel",source:"verified-channel"}
  ];
  const safe=JSON.parse(JSON.stringify(logic.mergePlaylists(bad,[],teacher,logic.seededPlaylists(teacher.name,teacher))));
  assert.equal(safe.length,2);
  assert.ok(safe.every(row=>row.source==="curated"));
  const shared={name:"Kadir Gümüş",searchOnly:true,channelId:"UCShared"};
  const mixed=JSON.parse(JSON.stringify(logic.mergePlaylists(bad,[{id:"PLMixedShared00001",title:"Başka hoca",channelId:"UCShared"}],shared,logic.seededPlaylists(shared.name,shared))));
  assert.equal(mixed.length,1);
  assert.equal(mixed[0].source,"curated");
});

test("archive and UI keep pinned lists, reject mismatched sources and retain exact teacher identity",()=>{
  assert.match(archive,/CURATED_PLAYLISTS\[teacher\.name\]/);
  assert.match(archive,/playlists=\[\.\.\.pinned,\.\.\.playlists\.filter/);
  assert.match(archive,/if\(teacher\.searchOnly\)\{/);
  assert.match(ui,/function verifiedPlaylistsFor/);
  assert.match(ui,/row\.source==="verified-channel"&&!manifest\.searchOnly/);
  assert.match(ui,/row\.channelId===manifest\.channelId/);
  assert.match(ui,/keyFor\(meta\.name\)!==keyFor\(name\)/);
});
