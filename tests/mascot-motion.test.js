const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const {stripTypeScriptTypes}=require("node:module");
const source=fs.readFileSync(path.resolve(__dirname,"../src/ui/mascot-motion.ts"),"utf8");
const runtime=stripTypeScriptTypes(source,{mode:"strip"}).replace(/^export /gm,"");
const motion=vm.runInNewContext(runtime+"\n({idleActivity,mascotPose,GREETING_SECONDS,CELEBRATION_SECONDS})");
const characters=["book","owl","cat","fox","panda","robot","turtle","rabbit","penguin","dragon"];

test("an untouched dock alternates five distinct activities and rests for every character personality",()=>{
  for(const character of characters){
    const actions=new Set();
    for(let t=0;t<32;t+=.1)actions.add(motion.idleActivity(t,character).action);
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

test("all ten characters keep their own choreography and later idle rounds vary without losing rest periods",()=>{
  const signatures=new Set();
  for(const character of characters){
    const first=Array.from({length:5},(_,i)=>motion.idleActivity(i*5.6+.2,character).action);
    const next=Array.from({length:5},(_,i)=>motion.idleActivity((i+5)*5.6+.2,character).action);
    assert.notDeepEqual(next,first,`${character} varies its next idle round`);
    for(let i=0;i<10;i++)assert.equal(motion.idleActivity(i*5.6+4.2,character).action,"idle");
    for(let i=1;i<30;i++)assert.notEqual(motion.idleActivity(i*5.6+.2,character).action,motion.idleActivity((i-1)*5.6+.2,character).action,`${character} does not repeat at a round boundary`);
    signatures.add(JSON.stringify(first));
  }
  assert.equal(signatures.size,10,"each mascot has an individual activity sequence");
  for(const action of ["wave","look","stretch","hop","dance","greet","celebrate"]){
    const performances=new Set(characters.map(id=>JSON.stringify([.55,1.25,2.15].map(t=>motion.mascotPose(action,t,id)))));
    assert.equal(performances.size,10,`${action} does not reuse one performance for all characters`);
  }
});

test("every character stays within camera and rig limits throughout each performance",()=>{
  for(const character of characters)for(const action of ["idle","wave","look","stretch","hop","dance","greet","celebrate"]){
    let previous;
    for(let t=0;t<=5.6;t+=1/120){
      const p=motion.mascotPose(action,t,character);
      for(const [key,value] of Object.entries(p))assert.ok(Number.isFinite(value),`${character} ${action} ${key}`);
      assert.ok(p.y>=0&&p.y<.55,`${character} ${action} camera height`);
      assert.ok(p.scaleX>.8&&p.scaleX<1.2&&p.scaleY>.8&&p.scaleY<1.2,`${character} ${action} proportions`);
      assert.ok(p.blink>=.05&&p.blink<=1,`${character} ${action} eye scale`);
      assert.ok(Math.abs(p.pupilX)<.05&&Math.abs(p.pupilY)<.04,`${character} pupils stay within the eyes`);
      assert.ok(Math.abs(p.leftFootX)<.65&&Math.abs(p.rightFootX)<.65,`${character} feet stay within the rig`);
      if(previous){
        assert.ok(Math.abs(p.y-previous.y)<.02,`${character} ${action} no position snap`);
        assert.ok(Math.abs(p.yaw-previous.yaw)<.09,`${character} ${action} continuous turn`);
      }
      previous=p;
    }
  }
});

test("celebrations visibly anticipate the jump, stretch in flight and settle after landing",()=>{
  for(const character of characters){
    const crouch=motion.mascotPose("celebrate",.2,character);
    const flight=motion.mascotPose("celebrate",.93,character);
    const landing=motion.mascotPose("celebrate",1.69,character);
    const end=motion.mascotPose("celebrate",motion.CELEBRATION_SECONDS,character);
    assert.ok(crouch.scaleY<.96&&crouch.scaleX>1.04,`${character} crouches before takeoff`);
    assert.ok(flight.y>.25&&flight.scaleY>1.04,`${character} lifts and stretches`);
    assert.ok(landing.y<.05&&landing.scaleY<.96,`${character} absorbs the landing`);
    assert.ok(Math.abs(end.leftZ)<.001&&Math.abs(end.rightZ)<.001,`${character} lowers both arms`);
    assert.ok(Math.abs(Math.sin(end.yaw)-Math.sin(-.12))<.001,`${character} returns to the front`);
  }
  assert.ok(motion.mascotPose("celebrate",.93,"rabbit").y>motion.mascotPose("celebrate",.93,"turtle").y+.15);
  assert.ok(motion.mascotPose("celebrate",1.5,"cat").yaw<-Math.PI,"cat turns the other way");
  assert.equal(motion.mascotPose("celebrate",1.5,"turtle").yaw,-.12,"turtle celebrates with a gentler grounded orientation");
});

test("quiet and paused modes freeze every secondary channel for all characters",()=>{
  for(const character of characters)for(const action of ["quiet","paused"]){
    const reference=JSON.stringify(motion.mascotPose(action,0,character));
    for(const t of [1,2,10,120,999])assert.equal(JSON.stringify(motion.mascotPose(action,t,character)),reference);
    const pose=motion.mascotPose(action,9,character);
    for(const key of ["bodyX","pupilX","pupilY","leftFootX","rightFootX","accessoryZ"])assert.equal(pose[key],0);
  }
});

test("missing or invalid personality and clock inputs never leak invalid transforms",()=>{
  for(const personality of ["unknown",NaN,Infinity,-1,19])for(const time of [NaN,Infinity,-3,Number.MAX_VALUE]){
    for(const action of ["idle","look","hop","celebrate"]){
      Object.values(motion.mascotPose(action,time,personality)).forEach(value=>assert.ok(Number.isFinite(value)));
    }
    const idle=motion.idleActivity(time,personality);
    assert.ok(["idle","wave","look","stretch","hop","dance"].includes(idle.action));
    assert.ok(Number.isFinite(idle.time)&&idle.time>=0&&idle.time<5.6);
  }
  assert.equal(JSON.stringify(motion.mascotPose("look",1,"unknown")),JSON.stringify(motion.mascotPose("look",1,"book")));
});
