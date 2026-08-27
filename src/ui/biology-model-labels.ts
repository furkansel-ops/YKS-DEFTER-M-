import * as THREE from "three";
import type {OrganId} from "../data/biology-atlas.ts";
import {organGuide} from "../data/biology-organs.ts";
import {ORGAN_LANDMARKS} from "../data/biology-organ-landmarks.ts";
import type {createOrganAssembly} from "./biology-organ-assembly.ts";

export interface ProjectedLabel {id:string;x:number;y:number;side:"left"|"right";visible:boolean}
/** Close anatomical anchors (e.g. pons/cerebellum) get separate hit targets.
 * A short leader retains the exact projected surface location. */
export function layoutModelPoints(points:readonly ProjectedLabel[],width:number,height:number) {
  const visible=points.filter(p=>p.visible).map(p=>({...p})),gap=width<610?44:34;
  for(let pass=0;pass<36;pass++){
    for(let i=0;i<visible.length;i++)for(let j=i+1;j<visible.length;j++){
      const a=visible[i]!,b=visible[j]!;let dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy);
      if(d>=gap)continue;if(d<.01){dx=Math.cos(j*2.4);dy=Math.sin(j*2.4);d=1;}
      const shift=(gap-d)/2+.05;a.x-=dx/d*shift;a.y-=dy/d*shift;b.x+=dx/d*shift;b.y+=dy/d*shift;
    }
    for(const p of visible){p.x=Math.max(22,Math.min(width-22,p.x));p.y=Math.max(30,Math.min(height-26,p.y));}
  }
  return new Map(visible.map(p=>[p.id,{x:p.x,y:p.y}]));
}
/** Resolve callout rows in screen space while the dots stay on their exact
 * projected 3D anchors. Pure function for small-screen/collision regression. */
export function layoutModelLabels(points:readonly ProjectedLabel[],height:number):Map<string,number> {
  const result=new Map<string,number>(),top=35,bottom=Math.max(top,height-35);
  for(const side of ["left","right"]){const rows=points.filter(p=>p.visible&&p.side===side).sort((a,b)=>a.y-b.y);const gap=Math.min(49,(bottom-top)/Math.max(rows.length-1,1));let previous=top-gap;
    const ys=rows.map(p=>{const y=Math.max(previous+gap,Math.min(bottom,Math.max(top,p.y)));previous=y;return y;});
    for(let i=ys.length-1;i>=0;i--){ys[i]=Math.min(ys[i]!,i===ys.length-1?bottom:ys[i+1]!-gap);result.set(rows[i]!.id,ys[i]!);}
  }return result;
}
export function createModelLabels(container:HTMLElement,id:OrganId,assembly:ReturnType<typeof createOrganAssembly>,onSelect:(id:string)=>void) {
  const layer=document.createElement("div");layer.className="atlas-model-annotations";layer.setAttribute("role","group");layer.setAttribute("aria-label","3B organ üzerindeki YKS yapıları");
  const svg=document.createElementNS("http://www.w3.org/2000/svg","svg");svg.classList.add("atlas-model-leaders");svg.setAttribute("aria-hidden","true");layer.appendChild(svg);
  const entries=organGuide(id)!.structures.map((part,index)=>{
    const button=document.createElement("button");button.type="button";button.className="atlas-model-point";button.dataset.modelPoint=part.id;
    button.setAttribute("aria-label",part.label);button.setAttribute("aria-pressed","false");button.title=part.label;
    const dot=document.createElement("span");dot.className="atlas-model-dot";dot.textContent=String(index+1);button.appendChild(dot);
    const name=document.createElement("span");name.className="atlas-model-point-name";name.textContent=part.label.replace(" · büyütme","");
    const kind=ORGAN_LANDMARKS[id][part.id]!.kind;if(kind!=="surface"){const hint=document.createElement("small");hint.textContent=kind==="zoom"?"Büyütülmüş iç yapı":kind==="neighbor"?"İlişkili yapı":"İç yapıyı aç";name.appendChild(hint);}
    button.appendChild(name);button.addEventListener("click",event=>{event.stopPropagation();onSelect(part.id);});layer.appendChild(button);
    const line=document.createElementNS("http://www.w3.org/2000/svg","path");svg.appendChild(line);return {part,button,name,line};
  });container.appendChild(layer);
  const world=new THREE.Vector3(),normal=new THREE.Vector3(),direction=new THREE.Vector3(),projected=new THREE.Vector3(),normalMatrix=new THREE.Matrix3();let selected="",enabled=true;
  return {
    select(value:string){selected=value;for(const e of entries){const active=e.part.id===value;e.button.classList.toggle("is-selected",active);e.button.setAttribute("aria-pressed",String(active));e.line.classList.toggle("is-selected",active);}},
    show(value:boolean){enabled=value;layer.hidden=!value;},
    update(camera:THREE.PerspectiveCamera,width:number,height:number){
      if(!enabled||!width||!height)return;layer.style.visibility=assembly.amount>.001&&assembly.amount<.98?"hidden":"visible";layer.dataset.compact=String(width<610);normalMatrix.getNormalMatrix(assembly.root.matrixWorld);
      const points:ProjectedLabel[]=entries.map(e=>{
        if(assembly.amount>.60){assembly.interior.parts.get(e.part.id)!.anchor.getWorldPosition(world);normal.set(0,0,1).applyMatrix3(normalMatrix).normalize();}
        else {const anchor=assembly.anchors.get(e.part.id)!;world.copy(anchor.point).applyMatrix4(assembly.root.matrixWorld);normal.copy(anchor.normal).applyMatrix3(normalMatrix).normalize();}
        direction.copy(camera.position).sub(world).normalize();projected.copy(world).project(camera);
        return {id:e.part.id,side:e.part.side,x:(projected.x*.5+.5)*width,y:(-.5*projected.y+.5)*height,visible:projected.z>-1&&projected.z<1&&Math.abs(projected.x)<1.04&&Math.abs(projected.y)<1.04&&normal.dot(direction)>-.1};
      });
      const rows=layoutModelLabels(points,height),targets=layoutModelPoints(points,width,height),labelWidth=width<750?125:148;
      entries.forEach((entry,index)=>{
        const p=points[index]!;entry.button.hidden=!p.visible;if(!p.visible){entry.line.style.display="none";return;}
        const target=targets.get(p.id)!,moved=Math.hypot(target.x-p.x,target.y-p.y)>3;entry.line.style.display=width>=610||moved?"":"none";
        entry.button.style.left=`${target.x.toFixed(1)}px`;entry.button.style.top=`${target.y.toFixed(1)}px`;
        const left=p.side==="left",labelX=left?12:width-labelWidth-12,labelY=rows.get(p.id)!;
        if(width>=610){entry.name.style.left=`${labelX-target.x+22}px`;entry.name.style.top=`${labelY-target.y+2}px`;entry.name.style.width=`${labelWidth}px`;entry.line.setAttribute("d",`M${p.x} ${p.y}L${target.x} ${target.y}L${left?labelX+labelWidth:labelX} ${labelY}`);}
        else {entry.name.style.left=`${Math.max(4,Math.min(width-144,target.x-70))-target.x+22}px`;entry.name.style.top=target.y>height-90?"-48px":"44px";entry.name.style.width="140px";entry.line.setAttribute("d",`M${p.x} ${p.y}L${target.x} ${target.y}`);}
        entry.name.hidden=width<610&&entry.part.id!==selected;
      });
    },
    dispose(){layer.remove();}
  };
}
