export type MascotAction="idle"|"wave"|"look"|"stretch"|"hop"|"dance"|"greet"|"celebrate"|"quiet"|"paused";
export type MascotMode="idle"|"greet"|"celebrate"|"quiet"|"paused";
export const GREETING_SECONDS=2.8;
export const CELEBRATION_SECONDS=3.6;
const IDLE_ACTIONS:readonly MascotAction[]=["wave","look","stretch","hop","dance"];
const clamp=(v:number)=>Math.max(0,Math.min(1,v));
const envelope=(t:number,duration:number)=>Math.sin(Math.PI*clamp(t/duration))**2;

/** Alternate short activities and rests; a fresh dock moves without a click. */
export function idleActivity(seconds:number,personality=0):{action:MascotAction;time:number}{
  const cycle=Math.floor(Math.max(0,seconds)/5.6),time=seconds-cycle*5.6;
  return {action:time<3.2?IDLE_ACTIONS[(cycle+personality)%IDLE_ACTIONS.length]!:"idle",time};
}

/** Model-space poses keep the entire performance inside the dock's camera. */
export function mascotPose(action:MascotAction,time:number){
  const still=action==="quiet"||action==="paused",breath=still?0:Math.sin(time*2.1);
  const pose={y:0,yaw:-.12,roll:0,scaleX:1,scaleY:1,headX:0,headY:0,headZ:0,leftZ:0,rightZ:0,blink:1};
  if(still)return pose;
  pose.y=.025*(1+breath);pose.scaleX=1-breath*.012;pose.scaleY=1+breath*.017;
  const blinkTime=time%4.1;
  if(blinkTime>1.55&&blinkTime<1.79)pose.blink=Math.max(.07,Math.abs(blinkTime-1.67)/.12);
  const e=envelope(time,action==="celebrate"?CELEBRATION_SECONDS:action==="greet"?GREETING_SECONDS:3.2);
  if(action==="wave"||action==="greet"){
    pose.leftZ=-e*(1.35+.3*Math.sin(time*14));pose.headZ=e*.13;pose.headY=e*.16;
  }else if(action==="look"){
    pose.headY=Math.sin(time*2.5)*.46*e;pose.yaw+=Math.sin(time*2.5)*.18*e;pose.headX=-.1*e;
  }else if(action==="stretch"){
    pose.leftZ=-1.8*e;pose.rightZ=1.8*e;pose.scaleY+=.1*e;pose.scaleX-=.06*e;pose.headX=-.18*e;
  }else if(action==="hop"){
    pose.y+=Math.max(0,Math.sin(time*7))*.32*e;pose.leftZ=-.7*e;pose.rightZ=.7*e;pose.roll=Math.sin(time*7)*.07*e;
  }else if(action==="dance"){
    pose.roll=Math.sin(time*7)*.16*e;pose.yaw+=Math.sin(time*5)*.24*e;pose.leftZ=-(.7+.35*Math.sin(time*7))*e;pose.rightZ=(.7-.35*Math.sin(time*7))*e;
  }else if(action==="celebrate"){
    pose.y+=Math.abs(Math.sin(time*6.4))*.46*e;pose.leftZ=-(1.75+.27*Math.sin(time*17))*e;pose.rightZ=(1.75-.27*Math.sin(time*17))*e;
    const spin=clamp((time-1.1)/1.35);pose.yaw+=Math.PI*2*(spin*spin*(3-2*spin));
    pose.roll=Math.sin(time*8)*.1*e;pose.headZ=.12*Math.sin(time*8)*e;
    pose.scaleX-=.05*e;pose.scaleY+=.06*e;
  }
  return pose;
}
