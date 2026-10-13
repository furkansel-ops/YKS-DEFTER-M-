const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");

const root=path.resolve(__dirname,"..");
const read=p=>fs.readFileSync(path.join(root,p),"utf8");
const src=read("public/student-program-share-v2.js").replace(/^import[^\n]+\n/,"");

function harness({exists=true,firstFailure=true,publish=true,getFailure=false,publishFailure=false}={}){
  const calls=[],studentState={weeks:{}};
  const auth=publish?{publishShare:async opts=>{
    calls.push({kind:"full-real-payload",manual:opts?.manual===true});
    if(publishFailure)throw Error("complete share not available");
    return true;
  }}:{};
  const w={S:studentState,YKSAccountAuth:auth,dispatchEvent:()=>{},addEventListener:()=>{},removeEventListener:()=>{}};
  const ctx=vm.createContext({
    window:w,document:{documentElement:{dataset:{}}},
    doc:(_db,...parts)=>({parts}),
    setDoc:async(ref,payload,options)=>{
      calls.push({kind:"write",payload,options});
      if(firstFailure&&calls.filter(x=>x.kind==="write").length===1)throw Error("partial write failed");
      return;
    },
    getDoc:async()=>{
      calls.push({kind:"read"});
      if(getFailure)throw Error("network read failed");
      return{exists:()=>exists};
    },
    onSnapshot:()=>()=>{},serverTimestamp:()=>({__timestamp:"now"}),
    setTimeout:()=>0,clearTimeout:()=>{},setInterval:()=>0,clearInterval:()=>{},
    console:{...console,warn:()=>{},error:()=>{}}
  });
  vm.runInContext(src+"\nwindow.__writeProgramShare=writeProgramShare;window.__publishProgram=publishProgram;window.__shareRuntime=rt;",ctx,{filename:"student-program-share-v2.js"});
  w.__shareRuntime.db={};w.__shareRuntime.user={uid:"student-123",displayName:"Elif"};
  return{calls,write:()=>w.__writeProgramShare({version:3,weeks:[{week:"2026-10-12",data:{dn:{"s-0-0":true}}}]}),publish:()=>w.__publishProgram(),ctx,w};
}

test("an existing share never gets reset with empty exams or wrong-log data after a failed patch",async()=>{
  const h=harness({exists:true});
  await h.write();
  assert.deepEqual(h.calls.map(x=>x.kind),["write","read","full-real-payload","write"]);
  const writes=h.calls.filter(x=>x.kind==="write");
  assert.equal(writes.length,2);
  assert.ok(writes.every(x=>x.options?.merge===true));
  assert.ok(writes.every(x=>!Object.hasOwn(x.payload,"exams")));
  assert.ok(writes.every(x=>!Object.hasOwn(x.payload,"errorJournal")));
  assert.equal(h.calls[2].manual,true);
});

test("new share bootstraps from real student snapshot, not empty placeholder, when auth bridge is available",async()=>{
  const h=harness({exists:false});
  await h.write();
  assert.deepEqual(h.calls.map(x=>x.kind),["write","read","full-real-payload","write"]);
  assert.equal(h.calls.filter(x=>x.kind==="write"&&!x.options).length,0);
});

test("legacy bootstrap is allowed only after confirmed missing document and no full-share bridge",async()=>{
  const h=harness({exists:false,publish:false});
  await h.write();
  assert.deepEqual(h.calls.map(x=>x.kind),["write","read","write"]);
  const full=h.calls.at(-1);
  assert.ok(!full.options);
  assert.equal(full.payload.studentUid,"student-123");
  assert.equal(full.payload.version,1);
  assert.ok(Array.isArray(full.payload.exams));
  assert.equal(full.payload.program.version,3);
});

test("network and permission errors cannot trigger a destructive full document overwrite",async()=>{
  const offline=harness({getFailure:true});
  await assert.rejects(offline.write(),/network read failed/);
  assert.deepEqual(offline.calls.map(x=>x.kind),["write","read"]);
  const denied=harness({exists:true,publishFailure:true});
  await assert.rejects(denied.write(),/complete share not available/);
  assert.deepEqual(denied.calls.map(x=>x.kind),["write","read","full-real-payload"]);
});

test("update stays compatible with strict coachingShares rules and cache busts the loaded module",()=>{
  const loader=read("src/ui/student-account-loader.ts"),rules=read("firestore.rules"),source=read("public/student-program-share-v2.js");
  assert.match(source,/getDoc\(ref\)/);
  assert.match(source,/if\(snap\.exists\(\)\)/);
  assert.match(source,/auth\?\.publishShare/);
  assert.match(source,/await setDoc\(ref,bootstrapSharePayload\(program\)\)/);
  assert.match(rules,/match \/coachingShares\/\{studentUid\}/);
  assert.match(rules,/request\.resource\.data\.exams is list/);
  assert.match(rules,/request\.auth\.uid == studentUid/);
  assert.match(loader,/student-program-share-v2\.js\?v=3\.6\.3-safe/);
});
