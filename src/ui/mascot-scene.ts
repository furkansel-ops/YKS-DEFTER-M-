import * as THREE from "three";
import {createMascotModel} from "./mascot-models";
import {CELEBRATION_SECONDS,GREETING_SECONDS,idleActivity,mascotPose} from "./mascot-motion";
import type {MascotAction,MascotMode} from "./mascot-motion";

export interface MascotScene{
  character(id:string):void;
  mode(value:MascotMode,restart?:boolean):void;
  previews(ids:readonly string[]):Map<string,string>;
  dispose():void;
}
const CAMERA_HALF_HEIGHT=1.9;
export function createMascotCamera(){
  const camera=new THREE.OrthographicCamera(-CAMERA_HALF_HEIGHT,CAMERA_HALF_HEIGHT,CAMERA_HALF_HEIGHT,-CAMERA_HALF_HEIGHT,.1,30);
  camera.position.set(0,1.7,7);camera.lookAt(0,1.4,0);return camera;
}

/** One small context, capped at 30fps. No frame loop when hidden or quiet. */
export function createMascotScene(host:HTMLElement,id:string,onFailure:()=>void):MascotScene{
  const canvas=document.createElement("canvas");canvas.className="rb-mascot-canvas";canvas.setAttribute("aria-hidden","true");
  const context=canvas.getContext("webgl2",{alpha:true,antialias:true,powerPreference:"low-power"});
  if(!context)throw new Error("Mascot WebGL unavailable");
  const renderer=new THREE.WebGLRenderer({canvas,context,alpha:true,antialias:true,powerPreference:"low-power"});
  renderer.setPixelRatio(Math.min(devicePixelRatio||1,2));renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.08;
  renderer.setClearColor(0x000000,0);
  const scene=new THREE.Scene(),camera=createMascotCamera();
  scene.add(new THREE.HemisphereLight(0xffffff,0xc9bddb,2.5));
  const key=new THREE.DirectionalLight(0xfff5e8,3.4);key.position.set(-3,5,5);scene.add(key);
  const rim=new THREE.DirectionalLight(0xd1eaff,2.2);rim.position.set(3,2,-2);scene.add(rim);
  let model=createMascotModel(id),currentId=id,disposed=false,mode:MascotMode="quiet",modeTime=0,idleTime=0,last=0,raf=0,frames=0;
  let baseScale=model.root.scale.clone(),baseY=model.root.position.y;
  let accessories=accessoryRest();
  let displayed=mascotPose("quiet",0,id),reaction:MascotAction|null=null,reactionTime=0,reactions=0;
  const button=host.closest<HTMLButtonElement>("button");
  function accessoryRest(){const list:{node:THREE.Object3D;rotation:THREE.Euler}[]=[];model.root.traverse(node=>{if(/^(tail|left-ear|right-ear|left-wing|right-wing|antenna)$/.test(node.name))list.push({node,rotation:node.rotation.clone()});});return list;}
  scene.add(model.root);
  const confetti=new THREE.Group(),confettiGeometry=new THREE.PlaneGeometry(.075,.12);
  const confettiMaterials=[0xffc95c,0x6acbaa,0x8da7ff,0xff8c9a].map(color=>new THREE.MeshBasicMaterial({color,side:THREE.DoubleSide}));
  for(let i=0;i<18;i++){const bit=new THREE.Mesh(confettiGeometry,confettiMaterials[i%4]!);confetti.add(bit);}
  confetti.visible=false;scene.add(confetti);
  function resize(){const width=host.clientWidth||112,height=host.clientHeight||112;renderer.setSize(width,height,false);const aspect=width/height;camera.left=-CAMERA_HALF_HEIGHT*aspect;camera.right=CAMERA_HALF_HEIGHT*aspect;camera.updateProjectionMatrix();}
  function pose(action:MascotAction,time:number,dt=0){
    const target=mascotPose(action,time,currentId),blend=dt?1-Math.exp(-dt*18):1;
    for(const key of Object.keys(target) as (keyof typeof target)[]){
      const delta=target[key]-displayed[key];
      displayed[key]+=blend*(key==="yaw"?Math.atan2(Math.sin(delta),Math.cos(delta)):delta);
    }
    const p=displayed;model.root.position.y=baseY+p.y;model.root.rotation.set(p.bodyX,p.yaw,p.roll);model.root.scale.set(baseScale.x*p.scaleX,baseScale.y*p.scaleY,baseScale.z);
    model.head.rotation.copy(model.rest.head);model.head.rotation.x+=p.headX;model.head.rotation.y+=p.headY;model.head.rotation.z+=p.headZ;
    model.leftArm.rotation.copy(model.rest.leftArm);model.leftArm.rotation.z+=p.leftZ;
    model.rightArm.rotation.copy(model.rest.rightArm);model.rightArm.rotation.z+=p.rightZ;
    model.leftFoot.rotation.copy(model.rest.leftFoot);model.leftFoot.rotation.x+=p.leftFootX;
    model.rightFoot.rotation.copy(model.rest.rightFoot);model.rightFoot.rotation.x+=p.rightFootX;
    model.eyes.forEach(eye=>eye.scale.y=p.blink);
    model.pupils.forEach((pupil,i)=>{pupil.position.copy(model.rest.pupils[i]!);pupil.position.x+=p.pupilX;pupil.position.y+=p.pupilY;});
    accessories.forEach(({node,rotation},i)=>{node.rotation.copy(rotation);const side=node.name.startsWith("left")?-1:1;node.rotation.z+=p.accessoryZ*side;if(node.name==="tail")node.rotation.y+=p.accessoryZ*2;if(node.name.endsWith("wing"))node.rotation.y+=p.accessoryZ*side*2;});
    button?.style.setProperty("--mascot-lift",String(Math.min(1,p.y/.5)));
    confetti.visible=action==="celebrate";
    if(confetti.visible)confetti.children.forEach((bit,i)=>{const t=Math.max(0,time-.46-i*.012),angle=i*2.4;bit.visible=t>0;bit.position.set(Math.sin(angle)*(.25+t*.36),1.75+t*(1.4+(i%3)*.1)-t*t*.65,Math.cos(angle)*.35+.65);bit.rotation.set(t*3+i,t*2,t*4+i);bit.scale.setScalar(Math.min(1,t*8)*Math.max(0,Math.min(1,(CELEBRATION_SECONDS-time)*2)));});
    host.dataset.action=action;canvas.dataset.pose=[p.y,p.yaw,p.leftZ,p.headY,p.blink].map(n=>n.toFixed(3)).join(",");
  }
  function draw(){renderer.render(scene,camera);canvas.dataset.frame=String(++frames);}
  function frame(now:number){
    if(disposed||mode==="quiet"||mode==="paused")return;
    raf=requestAnimationFrame(frame);if(now-last<1000/30)return;
    const dt=Math.min((now-last)/1000,.08);last=now;modeTime+=dt;idleTime+=dt;
    if(reaction){reactionTime+=dt;if(reactionTime>=3.2)reaction=null;}
    if(mode==="celebrate"&&modeTime>=CELEBRATION_SECONDS||mode==="greet"&&modeTime>=GREETING_SECONDS){mode="idle";modeTime=0;}
    const activity=reaction?{action:reaction,time:reactionTime}:mode==="idle"?idleActivity(idleTime,currentId):{action:mode,time:modeTime};
    pose(activity.action,activity.time,dt);draw();
  }
  function setMode(value:MascotMode,restart=false){
    if(disposed||value===mode&&!restart)return;mode=value;modeTime=0;reaction=null;cancelAnimationFrame(raf);raf=0;
    if(value==="paused"){host.dataset.action="paused";return;}
    if(value==="quiet")pose("quiet",0);else pose(value==="idle"?"idle":value,0,1/30);draw();
    if(value!=="quiet"){last=performance.now();raf=requestAnimationFrame(frame);}
  }
  function character(value:string){
    if(disposed||value===currentId)return;scene.remove(model.root);model.dispose();model=createMascotModel(value);scene.add(model.root);baseScale=model.root.scale.clone();baseY=model.root.position.y;accessories=accessoryRest();currentId=value;idleTime=0;reaction=null;displayed=mascotPose("quiet",0,value);
    pose(mode==="paused"?"quiet":mode,modeTime);draw();
  }
  function previews(ids:readonly string[]){
    const result=new Map<string,string>();if(disposed)return result;
    scene.remove(model.root);confetti.visible=false;renderer.setSize(192,192,false);camera.left=-CAMERA_HALF_HEIGHT;camera.right=CAMERA_HALF_HEIGHT;camera.updateProjectionMatrix();
    try{for(const value of ids){const preview=createMascotModel(value);preview.root.rotation.y=-.12;scene.add(preview.root);try{renderer.render(scene,camera);result.set(value,canvas.toDataURL("image/png"));}finally{scene.remove(preview.root);preview.dispose();}}}
    finally{scene.add(model.root);resize();pose(mode==="idle"?"idle":mode,modeTime);draw();}
    return result;
  }
  function contextLost(event:Event){event.preventDefault();if(!disposed){dispose();onFailure();}}
  // Taps perform a silent gesture; a captured drag must never become a tap.
  let pointer:{x:number;y:number}|null=null,moved=false;
  function pointerDown(event:PointerEvent){pointer={x:event.clientX,y:event.clientY};moved=false;}
  function pointerMove(event:PointerEvent){if(pointer&&Math.hypot(event.clientX-pointer.x,event.clientY-pointer.y)>=8)moved=true;}
  function pointerCancel(){moved=true;pointer=null;}
  function react(event:MouseEvent){
    if(disposed||mode==="quiet"||mode==="paused"||mode==="celebrate"||(event.detail>0&&moved))return;
    setMode("idle");reaction=(["wave","hop","dance"] as const)[reactions%3]!;reactionTime=0;
    host.dataset.reactions=String(++reactions);host.dataset.action=reaction;
  }
  button?.addEventListener("pointerdown",pointerDown);button?.addEventListener("pointermove",pointerMove);button?.addEventListener("pointercancel",pointerCancel);button?.addEventListener("click",react);
  canvas.addEventListener("webglcontextlost",contextLost);
  const observer=new ResizeObserver(()=>{if(!disposed){resize();draw();}});observer.observe(host);
  function dispose(){if(disposed)return;disposed=true;cancelAnimationFrame(raf);observer.disconnect();canvas.removeEventListener("webglcontextlost",contextLost);button?.removeEventListener("pointerdown",pointerDown);button?.removeEventListener("pointermove",pointerMove);button?.removeEventListener("pointercancel",pointerCancel);button?.removeEventListener("click",react);button?.style.removeProperty("--mascot-lift");model.dispose();confettiGeometry.dispose();confettiMaterials.forEach(m=>m.dispose());renderer.dispose();renderer.forceContextLoss();canvas.remove();}
  host.append(canvas);host.dataset.renderer="webgl";resize();pose("quiet",0);draw();
  return {character,mode:setMode,previews,dispose};
}
