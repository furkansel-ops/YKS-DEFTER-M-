export type MascotAction="idle"|"wave"|"look"|"stretch"|"hop"|"dance"|"greet"|"celebrate"|"quiet"|"paused";
export type MascotMode="idle"|"greet"|"celebrate"|"quiet"|"paused";
export type MascotPersonality=string|number;
export const GREETING_SECONDS=2.8;
export const CELEBRATION_SECONDS=3.6;
const ACTIVITY_SECONDS=3.2,IDLE_CYCLE_SECONDS=5.6;
const CHARACTER_IDS=["book","owl","cat","fox","panda","robot","turtle","rabbit","penguin","dragon"] as const;
const IDLE_SEQUENCES:readonly (readonly MascotAction[])[]=[
  ["look","wave","stretch","hop","dance"],
  ["look","stretch","wave","dance","hop"],
  ["stretch","look","hop","wave","dance"],
  ["wave","look","dance","hop","stretch"],
  ["stretch","wave","dance","look","hop"],
  ["wave","dance","look","stretch","hop"],
  ["look","stretch","hop","dance","wave"],
  ["hop","look","wave","dance","stretch"],
  ["dance","wave","hop","stretch","look"],
  ["hop","stretch","dance","wave","look"],
];
// Small, deliberate differences give each rig its own weight and energy.
const PROFILES=[
  {tempo:1,bounce:1,swing:1,gaze:1,tilt:.12,secondary:1,turn:1},
  {tempo:.86,bounce:.9,swing:.88,gaze:1.28,tilt:.19,secondary:.85,turn:1},
  {tempo:.92,bounce:1.04,swing:.86,gaze:1.06,tilt:.16,secondary:1.2,turn:-1},
  {tempo:1.13,bounce:1.06,swing:1.1,gaze:1.14,tilt:.18,secondary:1.3,turn:-1},
  {tempo:.75,bounce:.85,swing:.84,gaze:.82,tilt:.15,secondary:.65,turn:1},
  {tempo:1.1,bounce:.83,swing:.9,gaze:.85,tilt:.07,secondary:.6,turn:1},
  {tempo:.62,bounce:.65,swing:.68,gaze:.88,tilt:.1,secondary:.5,turn:0},
  {tempo:1.25,bounce:1.16,swing:1.02,gaze:1.05,tilt:.13,secondary:1.45,turn:1},
  {tempo:.98,bounce:.92,swing:1.12,gaze:.86,tilt:.16,secondary:.95,turn:1},
  {tempo:.9,bounce:1.1,swing:1.13,gaze:1.04,tilt:.14,secondary:1.4,turn:1},
] as const;
const clamp=(v:number)=>Math.max(0,Math.min(1,v));
const safeTime=(v:number)=>Number.isFinite(v)?Math.min(Number.MAX_SAFE_INTEGER,Math.max(0,v)):0;
const smooth=(v:number)=>{const t=clamp(v);return t*t*(3-2*t);};
const envelope=(t:number,duration:number)=>Math.sin(Math.PI*clamp(t/duration))**2;
const pulse=(t:number,start:number,end:number)=>t<=start||t>=end?0:envelope(t-start,end-start);
function personalityIndex(value:MascotPersonality){
  if(typeof value==="string")return Math.max(0,CHARACTER_IDS.indexOf(value as typeof CHARACTER_IDS[number]));
  return Number.isFinite(value)?((Math.trunc(value)%10)+10)%10:0;
}

/** Every character performs all five activities, with a different order and a rest between them. */
export function idleActivity(seconds:number,personality:MascotPersonality=0):{action:MascotAction;time:number}{
  const elapsed=safeTime(seconds),cycle=Math.floor(elapsed/IDLE_CYCLE_SECONDS),time=elapsed%IDLE_CYCLE_SECONDS;
  // Reverse and offset alternate rounds, including their boundary, so no activity repeats twice in a row.
  const step=cycle%5,index=Math.floor(cycle/5)%2===0?step:(6-step)%5;
  return {action:time<ACTIVITY_SECONDS?IDLE_SEQUENCES[personalityIndex(personality)]![index]!:"idle",time};
}

/** Model-space animation: anticipation, airborne stretch and a soft landing are separate beats. */
export function mascotPose(action:MascotAction,time:number,personality:MascotPersonality=0){
  const pose={y:0,yaw:-.12,roll:0,scaleX:1,scaleY:1,bodyX:0,headX:0,headY:0,headZ:0,leftZ:0,rightZ:0,blink:1,pupilX:0,pupilY:0,leftFootX:0,rightFootX:0,accessoryZ:0};
  if(action==="quiet"||action==="paused")return pose;
  const t=safeTime(time),index=personalityIndex(personality),profile=PROFILES[index]!;
  const beat=t*profile.tempo,breath=Math.sin(t*Math.PI*2/IDLE_CYCLE_SECONDS),rest=t%IDLE_CYCLE_SECONDS;
  pose.y=.016*(1+breath);pose.scaleX=1-breath*.009;pose.scaleY=1+breath*.014;
  pose.headZ=Math.sin(beat*1.2)*.018;pose.bodyX=Math.sin(beat*1.3)*.012;
  pose.accessoryZ=Math.sin(beat*2.4-.45)*.045*profile.secondary;
  const blinkAt=1.05+(index%4)*.31;
  pose.blink=1-.94*Math.max(pulse(rest,blinkAt,blinkAt+.18),index%3===0?pulse(rest,blinkAt+.32,blinkAt+.48):0);
  const duration=action==="celebrate"?CELEBRATION_SECONDS:action==="greet"?GREETING_SECONDS:ACTIVITY_SECONDS;
  const e=envelope(t,duration),sway=Math.sin(beat*6.2),headTilt=profile.tilt*e;
  function jump(start:number,airtime:number,height:number){
    const anticipation=pulse(t,start-.24,start),landing=pulse(t,start+airtime,start+airtime+.3);
    const phase=clamp((t-start)/airtime),air=Math.sin(Math.PI*phase);
    pose.y+=height*air;pose.scaleX+=.055*anticipation+.055*landing-.035*air;
    pose.scaleY+=-.075*anticipation-.085*landing+.065*air;
    pose.bodyX+=.09*anticipation-.045*air+.055*landing;
    pose.headX+=.085*anticipation-.06*air+.075*landing;
    pose.leftFootX+=.3*air;pose.rightFootX+=.3*air;
    pose.accessoryZ+=Math.sin(phase*Math.PI*2)*.09*profile.secondary;
    return air;
  }
  if(action==="wave"||action==="greet"){
    // The hand leads, then the head follows; the free arm balances the body.
    const hand=Math.sin(beat*12)*(.22+index%3*.025);
    pose.leftZ=-e*(1.28+hand)*profile.swing;pose.rightZ=.17*e;
    pose.headZ+=headTilt;pose.headY=.14*e;pose.roll=-.045*e;
    pose.pupilX=.025*e;pose.pupilY=.01*e;
    if(action==="greet"){
      pose.headX+=Math.sin(t*4.6)*.11*e;
      jump(.6,.88,.12*profile.bounce);
    }
    if(index===5){pose.headY+=Math.sin(beat*5)*.08*e;pose.rightZ+=.3*e;}
    if(index===9)pose.rightZ+=(1.05+.14*Math.sin(beat*10))*e;
  }else if(action==="look"){
    // Hold each glance long enough to read as curiosity rather than constant shaking.
    const glance=smooth(t/.65)-2*smooth((t-1.05)/.7)+smooth((t-2.35)/.65);
    pose.headY=glance*.38*profile.gaze;pose.yaw+=glance*.11;
    pose.headX=-.065*e+Math.sin(beat*3)*.035*e;pose.headZ+=headTilt*.5;
    pose.pupilX=glance*.042;pose.pupilY=.016*e;pose.bodyX-=.03*e;
    if(index===0){pose.headX+=.16*e;pose.pupilY=-.032*e;pose.leftZ=-.25*e;}
    if(index===1)pose.headZ+=Math.sin(beat*3.4)*.16*e;
    if(index===2||index===3)pose.accessoryZ+=Math.sin(beat*5)*.14*e;
    if(index===7){pose.headX+=Math.sin(beat*9)*.026*e;pose.accessoryZ+=Math.sin(beat*8)*.1*e;}
  }else if(action==="stretch"){
    pose.leftZ=-1.65*e;pose.rightZ=1.65*e;pose.scaleY+=.09*e;pose.scaleX-=.045*e;
    pose.headX=-.14*e;pose.bodyX=-.055*e;pose.headZ+=Math.sin(beat*2.3)*headTilt;
    pose.pupilY=.024*e;pose.accessoryZ+=.07*e;
    if(index===2){pose.leftZ*=.62;pose.rightZ*=.62;pose.bodyX+=.18*e;pose.headX+=.2*e;}
    if(index===4||index===6){pose.roll=Math.sin(beat*2.5)*.08*e;pose.blink=Math.min(pose.blink,1-.45*e);}
  }else if(action==="hop"){
    jump(.38,.88,.25*profile.bounce);jump(1.88,.7,.18*profile.bounce);
    pose.leftZ=-.65*e;pose.rightZ=.65*e;pose.roll=Math.sin(beat*4)*.045*e;
    if(index===7){pose.leftFootX+=Math.sin(beat*6)*.18*e;pose.rightFootX-=Math.sin(beat*6)*.18*e;}
    if(index===9){pose.leftZ-=.5*e;pose.rightZ+=.5*e;pose.accessoryZ+=Math.sin(beat*12)*.14*e;}
  }else if(action==="dance"){
    pose.roll=sway*.12*e;pose.yaw+=Math.sin(beat*3.1)*.22*e;
    pose.leftZ=-(.6+.32*sway)*e*profile.swing;pose.rightZ=(.6-.32*sway)*e*profile.swing;
    pose.headZ-=sway*.09*e;pose.headY=Math.sin(beat*3.1+.4)*.12*e;
    pose.leftFootX=Math.sin(beat*6.2)*.26*e;pose.rightFootX=-pose.leftFootX;
    pose.y+=Math.abs(sway)*.035*e;pose.pupilX=Math.sin(beat*3.1)*.025*e;
    if(index===5){pose.leftZ-=.35*e;pose.rightZ+=.35*e;pose.headY=Math.sin(beat*6.2)*.17*e;}
    if(index===8){pose.roll*=1.4;pose.leftFootX*=1.35;pose.rightFootX*=1.35;}
  }else if(action==="celebrate"){
    const airborne=jump(.32,1.22,.38*profile.bounce);
    jump(2,.72,.16*profile.bounce);
    const raised=pulse(t,.16,3.42),flap=Math.sin(beat*14)*.16;
    pose.leftZ=-(1.72+flap)*raised-.5*airborne;pose.rightZ=(1.72-flap)*raised+.5*airborne;
    pose.yaw+=Math.PI*2*profile.turn*smooth((t-.4)/1.1);
    pose.roll=Math.sin(beat*7)*.07*e;pose.headZ+=Math.sin(beat*6)*.09*e;
    pose.headX-=.035*raised;pose.pupilY=.026*raised;
    pose.leftFootX+=Math.sin(beat*5)*.14*airborne;pose.rightFootX-=Math.sin(beat*5)*.14*airborne;
    if(index===0||index===1||index===9)pose.accessoryZ+=Math.sin(beat*14)*.17*raised;
    if(index===2||index===3)pose.headZ+=.09*raised;
    if(index===4){pose.roll+=Math.sin(beat*4)*.07*raised;pose.headX+=.075*raised;}
    if(index===5){pose.leftFootX+=.15*airborne;pose.rightFootX-=.15*airborne;}
    if(index===6){pose.headY=Math.sin(beat*4)*.18*raised;pose.leftZ*=.8;pose.rightZ*=.8;}
    if(index===8)pose.roll+=Math.sin(beat*7)*.07*e;
  }
  return pose;
}
