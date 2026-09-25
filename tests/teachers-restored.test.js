const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");
const {stripTypeScriptTypes}=require("node:module");
const source=fs.readFileSync(path.resolve(__dirname,"../src/ui/teachers-v2-media.ts"),"utf8");
const runtime=stripTypeScriptTypes(source.replace(/^import[^\n]*\n/gm,"").replace(/export\s*\{\};?/g,""));
const plain=value=>JSON.parse(JSON.stringify(value));

function harness(overrides={}){
  const watched={},messages=[],writes=[],stored=new Map();
  const window={watchedMap:()=>watched,save:()=>true,toast:message=>messages.push(message),...overrides.window};
  const context=vm.createContext({window,URL,AbortSignal,console,
    document:{readyState:"loading",addEventListener:()=>{},baseURI:"https://fixture.test/study/"},
    navigator:{onLine:true},fetch:overrides.fetch||(()=>{throw new Error("Unexpected network request");}),
    localStorage:{getItem:key=>stored.get(key)||null,setItem:(key,value)=>{stored.set(key,value);writes.push(key);}}
  });
  const api=vm.runInContext(runtime+`\n({parseResourceLink,visiblePlaylists,toggleWatched,addPlanText,planVideoText,planPlaylistText,loadArchiveIndex,
    mediaFor,setFeed:value=>{feed=value;},setQuery:value=>{playlistQuery=value;},setLimit:value=>{playlistLimit=value;},pageSize:PLAYLIST_PAGE_SIZE})`,context);
  return {api,window,watched,messages,writes,stored};
}

test("pasted YouTube watch, short, embed and mobile links retain playable video identity",()=>{
  const {api}=harness(),id="dQw4w9WgXcQ";
  for(const url of [
    `https://www.youtube.com/watch?v=${id}&t=60`,
    `https://youtu.be/${id}?si=share`,
    `https://m.youtube.com/watch?v=${id}`,
    `https://music.youtube.com/watch?v=${id}`,
    `https://www.youtube.com/shorts/${id}`,
    `https://www.youtube.com/embed/${id}`,
    `https://youtube.com/live/${id}`
  ])assert.deepEqual(plain(api.parseResourceLink(url,"  Problemler  ")),{kind:"video",id,title:"Problemler",url:`https://youtu.be/${id}`},url);
});

test("a shared playlist link keeps the whole series when it also includes a video",()=>{
  const {api}=harness(),id="PLabcdef1234567890";
  const result=api.parseResourceLink(`https://www.youtube.com/watch?v=dQw4w9WgXcQ&list=${id}&index=3`,"");
  assert.deepEqual(plain(result),{kind:"playlist",id,title:"YouTube oynatma listesi",url:`https://www.youtube.com/playlist?list=${id}`});
  assert.equal(api.parseResourceLink(`https://www.youtube.com/playlist?list=${id}`,"Kamp").title,"Kamp");
});

test("resource links reject lookalike domains, unsupported protocols and malformed IDs",()=>{
  const {api}=harness();
  for(const url of ["", "not a URL", "javascript:alert(1)", "file:///watch?v=dQw4w9WgXcQ",
    "ftp://youtube.com/watch?v=dQw4w9WgXcQ", "https://youtube.com.evil.test/watch?v=dQw4w9WgXcQ",
    "https://youtube.com@evil.test/watch?v=dQw4w9WgXcQ", "https://notyoutube.com/watch?v=dQw4w9WgXcQ",
    "https://evil.test/?list=PLabcdef1234567890", "https://youtube.com/watch?v=short",
    "https://youtu.be/tooLongVideoIdentifier", "https://youtube.com/playlist?list=bad%20id",
    "https://youtube.com/playlist?list=", "https://youtube.com/results?search_query=tyt"
  ])assert.equal(api.parseResourceLink(url,"Example"),null,url);
});

test("playlist paging exposes every series in order, including titles previously ranked away",()=>{
  const {api}=harness();
  const playlists=Array.from({length:29},(_,i)=>({id:`list${i}`,title:i===28?"MOTİVASYON ve çalışma düzeni":`Seri ${i}`,url:`https://youtube.com/playlist?list=PLabcdefgh${i}`}));
  const media={name:"Hoca",videos:[],playlists};
  let view=api.visiblePlaylists(media);
  assert.equal(view.total,29);assert.equal(view.matches,29);assert.equal(view.items.length,api.pageSize);
  assert.deepEqual(plain(view.items.map(item=>item.id)),playlists.slice(0,api.pageSize).map(item=>item.id));
  api.setLimit(api.pageSize*3);view=api.visiblePlaylists(media);
  assert.deepEqual(plain(view.items.map(item=>item.id)),playlists.map(item=>item.id));
  api.setLimit(api.pageSize);api.setQuery("motivasyon");view=api.visiblePlaylists(media);
  assert.equal(view.total,29);assert.equal(view.matches,1);assert.equal(view.items[0].id,"list28");
  api.setQuery("eşleşmeyen kaynak");assert.equal(api.visiblePlaylists(media).items.length,0);
});

test("failed watched-state saves roll back both marking and unmarking without another persistence path",()=>{
  const h=harness({window:{save:()=>false}}),video={id:"dQw4w9WgXcQ",title:"TYT Matematik"},media={name:"Hoca",subject:"Matematik",videos:[video],playlists:[]};
  h.api.toggleWatched(video,media);assert.deepEqual(h.watched,{});
  const previous={at:123,title:"Original title",hoca:"Hoca"};h.watched[video.id]=previous;
  h.api.toggleWatched(video,media);assert.equal(h.watched[video.id],previous);
  h.window.save=()=>{throw new Error("storage failed");};h.api.toggleWatched(video,media);assert.equal(h.watched[video.id],previous);
  assert.deepEqual(h.writes,[]);assert.equal(h.messages.length,3);assert.ok(h.messages.every(message=>message.includes("saklanamadı")));
});

test("successful watched changes use the shared save hook and retain teacher metadata",()=>{
  let calls=0;const h=harness({window:{save:()=>{calls++;return true;}}});
  const video={id:"dQw4w9WgXcQ",title:"Hücre",channel:"Biyoloji Kanalı"},media={name:"Biyoloji Hocası",subject:"Biyoloji",videos:[video],playlists:[]};
  h.api.toggleWatched(video,media);
  assert.equal(h.watched[video.id].title,"Hücre");assert.equal(h.watched[video.id].hoca,"Biyoloji Hocası");assert.equal(h.watched[video.id].subj,"Biyoloji");
  h.api.toggleWatched(video,media);assert.deepEqual(h.watched,{});assert.equal(calls,2);assert.deepEqual(h.writes,[]);
});

test("program actions hand the original resource link to the shared day picker and avoid duplicates",()=>{
  const planned=[],h=harness({window:{planFindCell:()=>null,openDayPick:(text,after)=>{planned.push({text,after});return true;}}});
  const video=h.api.parseResourceLink("https://youtu.be/dQw4w9WgXcQ","TYT Problemler");
  assert.equal(h.api.addPlanText(h.api.planVideoText(video),"Video"),true);
  assert.ok(planned[0].text.includes("https://youtu.be/dQw4w9WgXcQ"));assert.equal(typeof planned[0].after,"function");
  const playlist=h.api.parseResourceLink("https://youtube.com/playlist?list=PLabcdef1234567890","AYT kampı");
  h.api.addPlanText(h.api.planPlaylistText(playlist),"Oynatma listesi");assert.ok(planned[1].text.includes(playlist.url));
  h.window.planFindCell=()=>({wk:"2026-09-21",d:1,i:0,blk:"s"});
  assert.equal(h.api.addPlanText(h.api.planVideoText(video),"Video"),false);assert.equal(planned.length,2);
});

test("opening a teacher playlist index does not download video pages",async()=>{
  const requested=[],meta={name:"Hoca",pages:["teachers-v2/hoca/p1.json"],playlists:[{id:"PLabcdef1234567890",title:"Seri",url:"https://youtube.com/playlist?list=PLabcdef1234567890"}],videoCount:80};
  const h=harness({fetch:async url=>{requested.push(url);return {ok:true,json:async()=>meta};}});
  h.api.setFeed({version:2,teachers:{Hoca:{name:"Hoca",videos:[],playlists:[],archiveIndex:"teachers-v2/hoca/index.json"}}});
  await h.api.loadArchiveIndex("Hoca");
  assert.deepEqual(requested,["https://fixture.test/study/teachers-v2/hoca/index.json"]);
  assert.equal(h.api.mediaFor("Hoca").playlists.length,1);assert.equal(h.api.mediaFor("Hoca").videos.length,0);
});
