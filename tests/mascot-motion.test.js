const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const {stripTypeScriptTypes}=require("node:module");
const source=fs.readFileSync(path.resolve(__dirname,"../src/ui/mascot-motion.ts"),"utf8");
const runtime=stripTypeScriptTypes(source,{mode:"strip"}).replace(/^export /gm,"");
const motion=vm.runInNewContext(runtime+"\n({idleActivity,mascotPose,GREETING_SECONDS,CELEBRATION_SECONDS})");

test("an untouched dock alternates five distinct activities and rests for every character personality",()=>{
  for(let character=0;character<10;character++){
    const actions=new Set();
    for(let t=0;t<32;t+=.1)actions.add(motion.idleActivity(t,character%5).action);
    for(const action of ["idle","wave","look","stretch","hop","dance"])assert.ok(actions.has(action),`${character} ${action}`);
  }
});

test("every moving pose stays finite, has visible movement and remains inside the small camera",()=>{
  for(const action of ["wave","look","stretch","hop","dance","greet","celebrate"]){
    const samples=[];
    for(let t=0;t<3.6;t+=.02){
      const p=motion.mascotPose(action,t);samples.push(JSON.stringify(p));
      Object.values(p).forEach(v=>assert.ok(Number.isFinite(v),`${action} has finite transforms`));
      assert.ok(p.y>=0&&p.y<.55,`${action} fits above the floor`);
      assert.ok(p.blink>=.05&&p.blink<=1.001,`${action} eyelids never invert`);
      assert.ok(p.scaleX>.8&&p.scaleY<1.2,`${action} keeps character proportions`);
    }
    assert.ok(new Set(samples).size>100,`${action} changes without a click`);
  }
});

test("quiet and paused poses stay still with open eyes regardless of elapsed time",()=>{
  for(const action of ["quiet","paused"]){
    const rest=JSON.stringify(motion.mascotPose(action,0));
    for(const t of [1,3,9,60,3600])assert.equal(JSON.stringify(motion.mascotPose(action,t)),rest);
    assert.equal(motion.mascotPose(action,60).blink,1);
  }
});

test("a full celebration raises both arms, jumps, turns once and returns to its resting orientation",()=>{
  const poses=Array.from({length:180},(_,i)=>motion.mascotPose("celebrate",i/50));
  assert.ok(poses.some(p=>p.y>.35&&p.leftZ<-1.5&&p.rightZ>1.5));
  assert.ok(poses.some(p=>p.yaw>Math.PI));
  const end=motion.mascotPose("celebrate",motion.CELEBRATION_SECONDS);
  assert.ok(Math.abs(end.leftZ)<.001&&Math.abs(end.rightZ)<.001);
  assert.ok(Math.abs(Math.sin(end.yaw)-Math.sin(-.12))<.001);
});
