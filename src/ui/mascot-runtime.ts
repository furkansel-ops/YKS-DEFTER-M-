import * as THREE from "three";
import {MASCOTS,MASCOT_IDS,mascotById,type MascotId} from "./mascot-assets";
import "./mascot-runtime.css";

const SELECTED_KEY="yks:mascot:selected:v1";
const ENABLED_KEY="yks:mascot:enabled:v1";
const STAGE_ID="yksMascotStage";
const SETTINGS_ID="yksMascotSettings";

type SceneController={
  setMascot:(id:MascotId)=>void;
  react:()=>void;
  celebrate:()=>void;
  destroy:()=>void;
};

let controller:SceneController|null=null;
let selectedId:MascotId=readSelected();
let enabled=readEnabled();

function readSelected():MascotId{
  try{
    const value=localStorage.getItem(SELECTED_KEY)||"notebook";
    return MASCOT_IDS.includes(value as MascotId)?value as MascotId:"notebook";
  }catch{return "notebook";}
}
function readEnabled():boolean{
  try{return localStorage.getItem(ENABLED_KEY)!=="0";}catch{return true;}
}
function persistSelection(id:MascotId):void{
  selectedId=id;
  try{localStorage.setItem(SELECTED_KEY,id);}catch{}
  window.dispatchEvent(new CustomEvent("yks:mascot-changed",{detail:{id}}));
}
function persistEnabled(next:boolean):void{
  enabled=next;
  try{localStorage.setItem(ENABLED_KEY,next?"1":"0");}catch{}
  syncEnabled();
}
function reduceMotion():boolean{return window.matchMedia("(prefers-reduced-motion: reduce)").matches;}

function createScene(canvas:HTMLCanvasElement,stage:HTMLElement):SceneController{
  const fallback=stage.querySelector<HTMLImageElement>(".yks-mascot-fallback")!;
  let renderer:THREE.WebGLRenderer;
  try{
    renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:"low-power"});
    renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.5));
    renderer.outputColorSpace=THREE.SRGBColorSpace;
    renderer.setClearColor(0x000000,0);
    stage.dataset.renderer="three";
  }catch(error){
    stage.dataset.renderer="fallback";
    console.warn("3B maskot görüntüleyici açılamadı; resimli görünüm kullanılıyor.",error);
    return {
      setMascot(id){fallback.src=mascotById(id).image;fallback.alt=mascotById(id).name;},
      react(){if(reduceMotion())return;fallback.animate([{transform:"translateY(0) rotate(0deg)"},{transform:"translateY(-10px) rotate(-3deg)"},{transform:"translateY(0) rotate(0deg)"}],{duration:480,easing:"cubic-bezier(.2,.8,.2,1)"});},
      celebrate(){if(reduceMotion())return;fallback.animate([{transform:"translateY(0) scale(1)"},{transform:"translateY(-15px) scale(1.05)"},{transform:"translateY(0) scale(1)"}],{duration:720,easing:"cubic-bezier(.2,.9,.2,1)"});},
      destroy(){}
    };
  }

  const scene=new THREE.Scene();
  const camera=new THREE.PerspectiveCamera(28,1,.1,40);
  camera.position.set(0,.15,7.4);
  const root=new THREE.Group();
  root.position.y=-.05;
  scene.add(root);

  const geometry=new THREE.PlaneGeometry(4.45,4.45,1,1);
  const material=new THREE.MeshBasicMaterial({transparent:true,depthWrite:false,toneMapped:false,side:THREE.DoubleSide});
  const mascot=new THREE.Mesh(geometry,material);
  mascot.position.z=.08;
  root.add(mascot);

  const shadowMaterial=new THREE.MeshBasicMaterial({color:0x17223f,transparent:true,opacity:.10,depthWrite:false});
  const shadow=new THREE.Mesh(new THREE.CircleGeometry(1,48),shadowMaterial);
  shadow.scale.set(1.28,.20,1);
  shadow.position.set(0,-2.08,-.12);
  root.add(shadow);

  const loader=new THREE.TextureLoader();
  let texture:THREE.Texture|null=null;
  let loadToken=0;
  const load=(id:MascotId)=>{
    const token=++loadToken,def=mascotById(id);
    fallback.src=def.image;fallback.alt=def.name;
    loader.load(def.image,next=>{
      if(token!==loadToken){next.dispose();return;}
      next.colorSpace=THREE.SRGBColorSpace;
      next.anisotropy=Math.min(4,renderer.capabilities.getMaxAnisotropy());
      const old=texture;texture=next;material.map=next;material.needsUpdate=true;old?.dispose();
      stage.dataset.renderer="three";
    },undefined,error=>{
      console.warn("Maskot dokusu yüklenemedi",error);
      stage.dataset.renderer="fallback";
    });
  };

  let width=0,height=0;
  const resize=()=>{
    const rect=canvas.getBoundingClientRect();
    const w=Math.max(1,Math.round(rect.width)),h=Math.max(1,Math.round(rect.height));
    if(w===width&&h===height)return;width=w;height=h;
    renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();
  };
  const ro=new ResizeObserver(resize);ro.observe(canvas);resize();

  let px=0,py=0,jumpStart=0,celebrateStart=0,disposed=false,raf=0,lastRender=0;
  const react=()=>{if(!reduceMotion())jumpStart=performance.now();};
  const celebrate=()=>{if(!reduceMotion())celebrateStart=performance.now();};
  const button=canvas.closest<HTMLElement>(".yks-mascot-viewport");
  const pointerMove=(event:PointerEvent)=>{
    if(!button)return;const rect=button.getBoundingClientRect();
    px=Math.max(-1,Math.min(1,((event.clientX-rect.left)/Math.max(1,rect.width)-.5)*2));
    py=Math.max(-1,Math.min(1,((event.clientY-rect.top)/Math.max(1,rect.height)-.5)*2));
  };
  const pointerLeave=()=>{px=0;py=0;};
  button?.addEventListener("pointermove",pointerMove);
  button?.addEventListener("pointerleave",pointerLeave);

  const render=(time:number)=>{
    if(disposed)return;
    raf=requestAnimationFrame(render);
    if(document.hidden||stage.hidden||time-lastRender<15)return;
    lastRender=time;resize();
    const t=time/1000,still=reduceMotion();
    let lift=still?0:Math.sin(t*1.65)*.055;
    let rz=still?0:Math.sin(t*.85)*.018;
    if(jumpStart){
      const p=(time-jumpStart)/520;
      if(p>=1)jumpStart=0;else{lift+=Math.sin(Math.PI*p)*.48;rz+=Math.sin(Math.PI*2*p)*.055;}
    }
    if(celebrateStart){
      const p=(time-celebrateStart)/900;
      if(p>=1)celebrateStart=0;else{lift+=Math.sin(Math.PI*Math.min(1,p*1.5))*.62;rz+=Math.sin(p*Math.PI*5)*.095;}
    }
    root.position.y=-.05+lift;
    root.rotation.y=THREE.MathUtils.lerp(root.rotation.y,still?0:px*.18,.09);
    root.rotation.x=THREE.MathUtils.lerp(root.rotation.x,still?0:-py*.075,.09);
    root.rotation.z=THREE.MathUtils.lerp(root.rotation.z,rz,.12);
    shadow.material.opacity=.08-Math.min(.04,Math.max(0,lift)*.05);
    shadow.scale.x=1.28-Math.min(.18,Math.max(0,lift)*.22);
    renderer.render(scene,camera);
  };
  raf=requestAnimationFrame(render);

  return {
    setMascot:load,
    react,
    celebrate,
    destroy(){
      disposed=true;cancelAnimationFrame(raf);ro.disconnect();
      button?.removeEventListener("pointermove",pointerMove);button?.removeEventListener("pointerleave",pointerLeave);
      texture?.dispose();geometry.dispose();material.dispose();shadow.geometry.dispose();shadowMaterial.dispose();renderer.dispose();
    }
  };
}

function stageCopy(message?:string):void{
  const def=mascotById(selectedId);
  const name=document.querySelector<HTMLElement>("[data-yks-mascot-name]");
  const role=document.querySelector<HTMLElement>("[data-yks-mascot-message]");
  if(name)name.textContent=def.name;
  if(role)role.textContent=message||def.role+" için yanında. Maskota dokun; çalıştıkça sana tepki versin.";
}

function mountHome():void{
  if(!enabled)return;
  const home=document.getElementById("home");if(!home)return;
  let stage=document.getElementById(STAGE_ID) as HTMLElement|null;
  if(!stage){
    stage=document.createElement("section");stage.id=STAGE_ID;stage.className="yks-mascot-stage";
    stage.setAttribute("aria-label","3B çalışma maskotu");
    stage.innerHTML=`<div class="yks-mascot-copy"><span class="yks-mascot-kicker">ÇALIŞMA ARKADAŞIN</span><h2><span data-yks-mascot-name></span> seninle</h2><p data-yks-mascot-message></p><span class="yks-mascot-hint">Dokununca tepki verir</span></div><button class="yks-mascot-viewport" type="button" aria-label="Maskota dokun"><canvas class="yks-mascot-canvas"></canvas><img class="yks-mascot-fallback" alt=""></button>`;
    const quote=document.getElementById("sozBox"),tasks=home.querySelector(".rb-today-tasks"),head=home.querySelector(".home-head");
    if(quote?.parentElement===home)quote.insertAdjacentElement("afterend",stage);
    else if(tasks?.parentElement===home)tasks.insertAdjacentElement("beforebegin",stage);
    else if(head?.parentElement===home)head.insertAdjacentElement("afterend",stage);
    else home.prepend(stage);
    const canvas=stage.querySelector<HTMLCanvasElement>(".yks-mascot-canvas");
    if(canvas){controller?.destroy();controller=createScene(canvas,stage);controller.setMascot(selectedId);}
    stage.querySelector(".yks-mascot-viewport")?.addEventListener("click",()=>{controller?.react();stageCopy("Buradayım! Hadi sıradaki görevi birlikte bitirelim.");window.setTimeout(()=>stageCopy(),1500);});
  }
  stage.hidden=!enabled;
  stageCopy();
}

function syncChoices():void{
  document.querySelectorAll<HTMLButtonElement>("[data-mascot-id]").forEach(button=>button.setAttribute("aria-pressed",String(button.dataset.mascotId===selectedId)));
  const toggle=document.querySelector<HTMLButtonElement>("[data-mascot-toggle]");
  if(toggle){toggle.setAttribute("aria-pressed",String(enabled));toggle.textContent=enabled?"Ana ekranda açık":"Ana ekranda kapalı";}
}
function mountSettings():void{
  const root=document.getElementById("yksModernSettings");if(!root||document.getElementById(SETTINGS_ID))return;
  const appearance=root.querySelector<HTMLElement>('[data-yms-section="appearance"]');if(!appearance)return;
  const card=document.createElement("section");card.id=SETTINGS_ID;card.className="yks-mascot-settings";
  card.innerHTML=`<div class="yks-mascot-settings-head"><div><h3>3B çalışma maskotu</h3><p>Ana ekranda sana eşlik edecek karakteri seç. Seçim yalnız bu cihazda tutulur; program ve koç senkronuna dokunmaz.</p></div><button class="yks-mascot-toggle" type="button" data-mascot-toggle aria-pressed="true"></button></div><div class="yks-mascot-grid" role="list" aria-label="Maskot seçenekleri">${MASCOTS.map(item=>`<button class="yks-mascot-choice" type="button" data-mascot-id="${item.id}" aria-pressed="false" title="${item.role}"><img src="${item.image}" alt="" loading="lazy"><span>${item.name}</span></button>`).join("")}</div>`;
  card.addEventListener("click",event=>{
    const target=event.target as HTMLElement|null;
    const toggle=target?.closest<HTMLButtonElement>("[data-mascot-toggle]");
    if(toggle){persistEnabled(!enabled);return;}
    const choice=target?.closest<HTMLButtonElement>("[data-mascot-id]"),id=choice?.dataset.mascotId as MascotId|undefined;
    if(!id||!MASCOT_IDS.includes(id))return;
    persistSelection(id);controller?.setMascot(id);syncChoices();stageCopy();
  });
  appearance.append(card);syncChoices();
}

function syncEnabled():void{
  const stage=document.getElementById(STAGE_ID) as HTMLElement|null;
  if(stage)stage.hidden=!enabled;
  if(enabled)mountHome();
  syncChoices();
}
function celebrate(message="Harika! Bir görev daha tamamlandı."):void{
  if(!enabled)return;mountHome();controller?.celebrate();stageCopy(message);window.setTimeout(()=>stageCopy(),1700);
}

export function installMascotRuntime():{installed:boolean;selected:MascotId}{
  if(document.documentElement.dataset.mascotRuntime==="ready")return {installed:true,selected:selectedId};
  document.documentElement.dataset.mascotRuntime="ready";
  mountHome();mountSettings();
  const observe=()=>observer.observe(document.body,{childList:true,subtree:true});
  const observer=new MutationObserver(()=>{observer.disconnect();try{mountHome();mountSettings();}finally{observe();}});
  observe();
  window.addEventListener("yks:mascot-changed",event=>{
    const id=(event as CustomEvent<{id?:MascotId}>).detail?.id;
    if(id&&MASCOT_IDS.includes(id)){selectedId=id;controller?.setMascot(id);stageCopy();syncChoices();}
  });
  window.addEventListener("yks:mascot-celebrate",()=>celebrate());
  document.addEventListener("click",event=>{
    const toggle=(event.target as HTMLElement|null)?.closest<HTMLElement>(".rb-task-toggle");
    if(!toggle)return;
    window.setTimeout(()=>{const row=toggle.closest<HTMLElement>(".plancell");if(row?.classList.contains("pd"))celebrate();},180);
  },true);
  syncEnabled();
  return {installed:true,selected:selectedId};
}
