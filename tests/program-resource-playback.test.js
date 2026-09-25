const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");
const source=fs.readFileSync(path.resolve(__dirname,"../app.js"),"utf8");

function harness(){
  const nodes={},external=[],messages=[];
  for(const id of ["playOverlay","playTitle","playCh","playCount","playFrame","playHint","directPlaylistUrl","directPlaylistName","teachersV2LinkUrl","teachersV2LinkTitle"])
    nodes[id]={style:{display:"none"},textContent:"",src:"",value:""};
  nodes.directPlaylistUrl.value="https://youtube.com/playlist?list=PLdraft1234567890";
  nodes.directPlaylistName.value="Bitmemiş kaynak taslağım";
  nodes.teachersV2LinkUrl.value="https://youtu.be/abcdefghijk";
  nodes.teachersV2LinkTitle.value="Diğer video taslağım";
  const context=vm.createContext({URL,el:id=>nodes[id],isFileProtocol:()=>false,
    location:{origin:"https://fixture.test"},openExternalUrl:url=>external.push(url),toast:message=>messages.push(message)});
  vm.runInContext("let playIdx=-1,directPlaylist=null;const vidItems=[];",context);
  for(const name of ["cellLink","cellOpenLink","playlistIdFromUrl","directPlaylistData","openDirectPlaylist","openPlaylistResource","openSingleVideo","closePlayer","openPlayerOnYt"]){
    const match=source.match(new RegExp(`function ${name}\\([^\\n]*\\)\\{[\\s\\S]*?\\r?\\n}`));
    assert.ok(match,`${name} exists`);vm.runInContext(match[0],context);
  }
  const api=vm.runInContext("({cellLink,cellOpenLink,openDirectPlaylist,openPlaylistResource,closePlayer,openPlayerOnYt})",context);
  return {api,nodes,external,messages};
}

test("program video links open the native player for canonical and shared YouTube URLs",()=>{
  for(const link of ["https://youtu.be/dQw4w9WgXcQ","https://www.youtube.com/watch?v=dQw4w9WgXcQ","https://m.youtube.com/shorts/dQw4w9WgXcQ"]){
    const h=harness();assert.equal(h.api.cellOpenLink(`▶ TYT Problemler — ${link}`),true);
    const frame=new URL(h.nodes.playFrame.src);
    assert.equal(frame.hostname,"www.youtube-nocookie.com");assert.equal(frame.pathname,"/embed/dQw4w9WgXcQ");
    assert.equal(h.nodes.playOverlay.style.display,"flex");assert.equal(h.nodes.playTitle.textContent,"TYT Problemler");assert.deepEqual(h.external,[]);
  }
});

test("program playlist links open the whole series inside the existing player, including mixed video/list shares",()=>{
  const id="PLabcdef1234567890";
  for(const link of [`https://www.youtube.com/playlist?list=${id}`,`https://youtu.be/dQw4w9WgXcQ?list=${id}&index=4`]){
    const h=harness();assert.equal(h.api.cellOpenLink(`☰ AYT Matematik kampı — ${link}`),true);
    const frame=new URL(h.nodes.playFrame.src);
    assert.equal(frame.hostname,"www.youtube-nocookie.com");assert.equal(frame.pathname,"/embed");
    assert.equal(frame.searchParams.get("listType"),"playlist");assert.equal(frame.searchParams.get("list"),id);
    assert.equal(h.nodes.playTitle.textContent,"AYT Matematik kampı");assert.deepEqual(h.external,[]);
    h.api.openPlayerOnYt();assert.deepEqual(h.external,[`https://www.youtube.com/playlist?list=${id}`]);
    h.api.closePlayer();assert.equal(h.nodes.playFrame.src,"");assert.equal(h.nodes.playOverlay.style.display,"none");
  }
});

test("opening a planned series leaves both resource input drafts untouched",()=>{
  const h=harness(),inputs=["directPlaylistUrl","directPlaylistName","teachersV2LinkUrl","teachersV2LinkTitle"];
  const before=inputs.map(id=>h.nodes[id].value);
  h.api.cellOpenLink("☰ Programdaki seri — https://youtube.com/playlist?list=PLabcdef1234567890");
  assert.deepEqual(inputs.map(id=>h.nodes[id].value),before);
  assert.equal(h.api.openDirectPlaylist(),true);
  assert.equal(new URL(h.nodes.playFrame.src).searchParams.get("list"),"PLdraft1234567890");
  assert.equal(h.nodes.playTitle.textContent,"Bitmemiş kaynak taslağım");
  assert.deepEqual(inputs.map(id=>h.nodes[id].value),before);
});

test("ordinary resource links remain external and lookalike domains are never embedded",()=>{
  const h=harness();
  for(const url of ["https://example.test/worksheet.pdf","https://youtube.com.evil.test/watch?v=dQw4w9WgXcQ&list=PLabcdef1234567890"]){
    assert.equal(h.api.cellOpenLink(`Kaynak — ${url}`),true);
    assert.equal(h.external.at(-1),url);assert.equal(h.nodes.playOverlay.style.display,"none");
  }
  assert.equal(h.api.cellOpenLink("Bağlantısız çalışma görevi"),false);
  assert.equal(h.api.openPlaylistResource("invalid id","Geçersiz"),false);assert.equal(h.nodes.playFrame.src,"");
});
