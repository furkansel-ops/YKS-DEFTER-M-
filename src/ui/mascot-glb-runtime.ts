import * as THREE from "three";
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader.js";
import "./mascot-glb-runtime.css";

const DOCK_ID="yksNotebookMascotDock";
const MODEL_PATH="./mascots/notebook/notebook-exact-v3r2.glb";
const FALLBACK_PATH="./mascots/notebook.webp";
const CLIPS=["idle","tap","celebrate","sad","wave"] as const;
type ClipName=typeof CLIPS[number];

function asset(path:string):string{return new URL(path,document.baseURI).href;}
function reducedMotion():boolean{return window.matchMedia("(prefers-reduced-motion: reduce)").matches;}

type RuntimeController={
  play:(name:ClipName)=>void;
  setVisible:(visible:boolean)=>void;
  dispose:()=>void;
};

async function createController(host:HTMLElement,canvas:HTMLCanvasElement,fallback:HTMLImageElement):Promise<RuntimeController>{
  let renderer:THREE.WebGLRenderer;
  try{
    renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:"low-power"});
  }catch(error){
    host.dataset.renderer="fallback";fallback.hidden=false;canvas.hidden=true;
    throw error;
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.5));
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.setClearColor(0x000000,0);

  const scene=new THREE.Scene();
  const camera=new THREE.PerspectiveCamera(30,1,.1,40);
  camera.position.set(.18,.16,6.25);
  scene.add(new THREE.HemisphereLight(0xffffff,0x6d7b99,2.7));
  const key=new THREE.DirectionalLight(0xffffff,2.8);key.position.set(3,5,6);scene.add(key);
  const fill=new THREE.DirectionalLight(0x99bbff,1.1);fill.position.set(-3,1,4);scene.add(fill);

  const shadow=new THREE.Mesh(
    new THREE.CircleGeometry(1,32),
    new THREE.MeshBasicMaterial({color:0x1a2a4a,transparent:true,opacity:.10,depthWrite:false})
  );
  shadow.rotation.x=-Math.PI/2;shadow.position.y=-1.63;shadow.scale.set(1.15,.55,1);scene.add(shadow);

  const response=await fetch(asset(MODEL_PATH),{cache:"no-cache"});
  if(!response.ok)throw new Error(`Defter maskotu indirilemedi: ${response.status}`);
  const length=Number(response.headers.get("content-length"))||0;
  if(length>2*1024*1024)throw new Error("Defter maskotu beklenen boyuttan büyük.");
  const bytes=await response.arrayBuffer();
  if(bytes.byteLength>2*1024*1024)throw new Error("Defter maskotu beklenen boyuttan büyük.");
  const gltf=await new GLTFLoader().parseAsync(bytes,"");
  const model=gltf.scene;
  const presentation=new THREE.Group();
  scene.add(presentation);
  presentation.add(model);
  const box=new THREE.Box3().setFromObject(model),size=box.getSize(new THREE.Vector3()),center=box.getCenter(new THREE.Vector3());
  const longest=Math.max(size.x,size.y,size.z);
  if(!Number.isFinite(longest)||longest<=0)throw new Error("Defter maskotu boyutları okunamadı.");
  const scale=3.15/longest;
  model.scale.setScalar(scale);
  model.position.copy(center.multiplyScalar(-scale));
  model.rotation.set(.01,-.08,-.005);

  const clips=new Map<ClipName,THREE.AnimationClip>();
  for(const name of CLIPS){
    const clip=THREE.AnimationClip.findByName(gltf.animations,name);
    if(clip)clips.set(name,clip);
  }
  if(!clips.has("idle"))throw new Error("Defter maskotunda idle animasyonu bulunamadı.");
  const mixer=new THREE.AnimationMixer(model);
  let active:THREE.AnimationAction|null=null,disposed=false,raf=0,last=performance.now(),visible=true;
  let pointerX=0,pointerY=0,targetX=0,targetY=0;

  const play=(name:ClipName)=>{
    if(disposed||reducedMotion())return;
    const clip=clips.get(name);if(!clip)return;
    const next=mixer.clipAction(clip);
    next.reset().enabled=true;
    if(name==="idle"){
      next.setLoop(THREE.LoopRepeat,Infinity);next.clampWhenFinished=false;
      active?.fadeOut(.12);next.fadeIn(.12).play();active=next;return;
    }
    next.setLoop(THREE.LoopOnce,1);next.clampWhenFinished=true;
    active?.fadeOut(.08);next.fadeIn(.08).play();active=next;
    const finished=(event:any)=>{
      if(event.action!==next)return;
      mixer.removeEventListener("finished",finished);
      play("idle");
    };
    mixer.addEventListener("finished",finished);
  };
  if(!reducedMotion())play("wave");

  const button=canvas.closest<HTMLElement>(".yks-glb-mascot-button");
  const onPointerMove=(event:PointerEvent)=>{
    if(!button)return;
    const rect=button.getBoundingClientRect();
    targetX=Math.max(-1,Math.min(1,((event.clientX-rect.left)/Math.max(1,rect.width)-.5)*2));
    targetY=Math.max(-1,Math.min(1,((event.clientY-rect.top)/Math.max(1,rect.height)-.5)*2));
  };
  const onPointerLeave=()=>{targetX=0;targetY=0;};
  button?.addEventListener("pointermove",onPointerMove);
  button?.addEventListener("pointerleave",onPointerLeave);

  const resize=()=>{
    if(disposed)return;
    const rect=canvas.getBoundingClientRect(),w=Math.max(1,Math.round(rect.width)),h=Math.max(1,Math.round(rect.height));
    renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();
  };
  const ro=new ResizeObserver(resize);ro.observe(canvas);resize();

  const draw=(now:number)=>{
    raf=0;if(disposed||!visible||document.hidden)return;
    const delta=Math.min(Math.max((now-last)/1000,0),.05);last=now;
    mixer.update(delta);
    if(!reducedMotion()){
      pointerX=THREE.MathUtils.lerp(pointerX,targetX,1-Math.exp(-delta*7));
      pointerY=THREE.MathUtils.lerp(pointerY,targetY,1-Math.exp(-delta*7));
      presentation.rotation.y=pointerX*.28;
      presentation.rotation.x=-pointerY*.12;
      presentation.rotation.z=-pointerX*.025;
      presentation.position.y=Math.sin(now*.0032)*.035;
    }else{presentation.rotation.set(0,0,0);presentation.position.y=0;}
    renderer.render(scene,camera);raf=requestAnimationFrame(draw);
  };
  const start=()=>{if(!disposed&&visible&&!document.hidden&&!raf){last=performance.now();raf=requestAnimationFrame(draw);}};
  const stop=()=>{if(raf){cancelAnimationFrame(raf);raf=0;}};
  const syncVisible=()=>{visible=!host.hidden;visible?start():stop();};
  const visibility=()=>{document.hidden?stop():start();};
  document.addEventListener("visibilitychange",visibility);
  const contextLost=(event:Event)=>{event.preventDefault();host.dataset.renderer="fallback";fallback.hidden=false;canvas.hidden=true;stop();};
  canvas.addEventListener("webglcontextlost",contextLost);
  host.dataset.renderer="three";fallback.hidden=true;canvas.hidden=false;syncVisible();

  return {
    play,
    setVisible(next){visible=next;visible?start():stop();},
    dispose(){
      if(disposed)return;disposed=true;stop();ro.disconnect();document.removeEventListener("visibilitychange",visibility);
      canvas.removeEventListener("webglcontextlost",contextLost);
      button?.removeEventListener("pointermove",onPointerMove);button?.removeEventListener("pointerleave",onPointerLeave);
      mixer.stopAllAction();
      model.traverse(object=>{
        if(!(object instanceof THREE.Mesh))return;
        object.geometry.dispose();
        for(const material of Array.isArray(object.material)?object.material:[object.material])material.dispose();
      });
      shadow.geometry.dispose();(shadow.material as THREE.Material).dispose();renderer.dispose();
    }
  };
}

export function installMascotGlbRuntime():{installed:boolean;model:"notebook"}{
  if(document.getElementById(DOCK_ID))return {installed:true,model:"notebook"};
  const home=document.getElementById("home");if(!home)return {installed:false,model:"notebook"};

  const host=document.createElement("aside");host.id=DOCK_ID;host.className="yks-glb-mascot-dock";host.dataset.renderer="loading";
  host.innerHTML=`<button class="yks-glb-mascot-button" type="button" aria-label="Defter maskotuna dokun"><canvas class="yks-glb-mascot-canvas" aria-hidden="true"></canvas><img class="yks-glb-mascot-fallback" src="${asset(FALLBACK_PATH)}" alt="" hidden></button>`;
  document.body.append(host);

  const canvas=host.querySelector<HTMLCanvasElement>(".yks-glb-mascot-canvas")!;
  const fallback=host.querySelector<HTMLImageElement>(".yks-glb-mascot-fallback")!;
  let controller:RuntimeController|null=null;

  const syncVisibility=()=>{host.hidden=!home.classList.contains("active");controller?.setVisible(!host.hidden);};
  syncVisibility();
  const homeObserver=new MutationObserver(syncVisibility);
  homeObserver.observe(home,{attributes:true,attributeFilter:["class"]});

  void createController(host,canvas,fallback).then(value=>{
    controller=value;controller.setVisible(!host.hidden);document.documentElement.dataset.glbMascotRuntime="ready";
  }).catch(error=>{
    console.error("GLB defter maskotu yüklenemedi",error);
    host.dataset.renderer="fallback";fallback.hidden=false;canvas.hidden=true;
    document.documentElement.dataset.glbMascotRuntime="fallback";
  });

  const mascotButton=host.querySelector<HTMLElement>(".yks-glb-mascot-button");
  mascotButton?.addEventListener("click",()=>{
    mascotButton.classList.remove("is-tapped");
    void mascotButton.offsetWidth;
    mascotButton.classList.add("is-tapped");
    window.setTimeout(()=>mascotButton.classList.remove("is-tapped"),420);
    controller?.play("tap");
  });
  document.addEventListener("click",event=>{
    const toggle=(event.target as HTMLElement|null)?.closest(".rb-task-toggle");if(!toggle)return;
    window.setTimeout(()=>{if(toggle.closest(".plancell")?.classList.contains("pd"))controller?.play("celebrate");},180);
  },true);
  window.addEventListener("yks:mascot-celebrate",()=>controller?.play("celebrate"));
  window.addEventListener("pagehide",()=>{homeObserver.disconnect();controller?.dispose();},{once:true});
  return {installed:true,model:"notebook"};
}
