import * as THREE from "three";
import type {OrganId} from "../data/biology-atlas.ts";
import {ORGAN_LANDMARKS} from "../data/biology-organ-landmarks.ts";
import {createOrganInterior} from "./biology-organ-interiors.ts";

export function createOrganAssembly(source:THREE.Object3D,id:OrganId) {
  const root=new THREE.Group();root.name="atlas-organ-assembly";root.add(source);
  const interior=createOrganInterior(id);root.add(interior.root);interior.root.visible=false;
  const halves=[new THREE.Group(),new THREE.Group()];const planes=[new THREE.Plane(new THREE.Vector3(0,0,1),0),new THREE.Plane(new THREE.Vector3(0,0,-1),0)];
  halves.forEach((half,index)=>{
    half.name=index?"source-back-half":"source-front-half";const copy=source.clone(true),materials=new Map<THREE.Material,THREE.Material>();
    copy.traverse(object=>{if(object instanceof THREE.Mesh){const convert=(original:THREE.Material)=>{let mat=materials.get(original);if(!mat){mat=original.clone();mat.clippingPlanes=[planes[index]!];mat.side=THREE.DoubleSide;materials.set(original,mat);}return mat;};object.material=Array.isArray(object.material)?object.material.map(convert):convert(object.material);}});
    half.add(copy);half.visible=false;root.add(half);
  });
  let amount=0;
  const basePlanes=[new THREE.Plane(new THREE.Vector3(0,0,1),0),new THREE.Plane(new THREE.Vector3(0,0,-1),0)];
  function update(value:number){
    amount=THREE.MathUtils.clamp(value,0,1);source.visible=amount<.001;interior.root.visible=amount>.02;
    interior.root.scale.setScalar(.86+.14*amount);
    // Reduce the separated reference shells so neither one covers the teaching
    // interior. Full-size front/back shells otherwise overlap most of the brain.
    halves.forEach((half,i)=>{const side=i?1:-1;half.visible=amount>=.001;half.scale.setScalar(1-.48*amount);half.position.set(side*3.05*amount,0,-.45*amount);half.rotation.y=side*.22*amount;});
    root.updateWorldMatrix(true,true);halves.forEach((half,i)=>planes[i]!.copy(basePlanes[i]!).applyMatrix4(half.matrixWorld));
  }
  // One bounded vertex pass on load. Never raycast the source's large mesh on
  // every frame. Points are fitted to the front-facing authored model region.
  root.updateWorldMatrix(true,true);
  const landmarks=ORGAN_LANDMARKS[id],anchors=new Map<string,{point:THREE.Vector3;normal:THREE.Vector3}>();
  const targets=Object.entries(landmarks).filter(([,p])=>p.kind!=="neighbor").map(([key,p])=>({key,target:new THREE.Vector3(...p.position),best:Infinity,point:new THREE.Vector3(...p.position),normal:new THREE.Vector3(0,0,1)}));
  const toRoot=new THREE.Matrix4().copy(root.matrixWorld).invert(),matrix=new THREE.Matrix4(),normalMatrix=new THREE.Matrix3(),v=new THREE.Vector3(),normal=new THREE.Vector3();
  source.traverse(object=>{
    if(!(object instanceof THREE.Mesh))return;const position=object.geometry.getAttribute("position"),normals=object.geometry.getAttribute("normal");if(!position)return;
    matrix.multiplyMatrices(toRoot,object.matrixWorld);normalMatrix.getNormalMatrix(matrix);
    const stride=Math.max(1,Math.floor(position.count/60000));
    for(let i=0;i<position.count;i+=stride){
      v.fromBufferAttribute(position,i).applyMatrix4(matrix);if(v.z<-.15)continue;
      for(const target of targets){const distance=v.distanceToSquared(target.target);if(distance>=target.best)continue;target.best=distance;target.point.copy(v);if(normals){normal.fromBufferAttribute(normals,i).applyMatrix3(normalMatrix).normalize();if(normal.z<0)normal.negate();target.normal.copy(normal);} }
    }
  });
  targets.forEach(t=>anchors.set(t.key,{point:t.point.clone().addScaledVector(t.normal,.025),normal:t.normal.clone()}));
  for(const [key,p] of Object.entries(landmarks))if(!anchors.has(key))anchors.set(key,{point:new THREE.Vector3(...p.position),normal:new THREE.Vector3(0,0,1)});
  update(0);
  return {root,source,interior,halves,planes,anchors,update,get amount(){return amount;}};
}
