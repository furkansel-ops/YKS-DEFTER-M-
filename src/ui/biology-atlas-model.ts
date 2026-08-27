import * as THREE from "three";
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls.js";
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader.js";
import {MeshoptDecoder} from "three/examples/jsm/libs/meshopt_decoder.module.js";
import {atlasAsset, getAtlasOrgan} from "../domain/biology-atlas-service.ts";
import {createOrganAssembly} from "./biology-organ-assembly.ts";
import {createModelLabels} from "./biology-model-labels.ts";

export interface AtlasModelControls {zoom(direction: number): void; reset(): void; rotate(enabled: boolean): void; wireframe(enabled: boolean): void; open(enabled:boolean):void; select(id:string):void; labels(enabled:boolean):void; dispose(): void;}
export function disposeAtlasObject(root: THREE.Object3D) {
  const geometries = new Set<THREE.BufferGeometry>(), materials = new Set<THREE.Material>(), textures = new Set<THREE.Texture>();
  root.traverse(object => {
    if (!(object instanceof THREE.Mesh)) return;
    geometries.add(object.geometry);
    for (const material of Array.isArray(object.material)?object.material:[object.material]) {
      materials.add(material);
      Object.values(material).forEach(value => {if (value instanceof THREE.Texture) textures.add(value);});
    }
  });
  // GLTFLoader may use ImageBitmapLoader; GPU disposal alone does not close
  // the decoded image. A bitmap shared by multiple textures is closed once.
  const images = new Set<{close(): void}>();
  textures.forEach(value => {
    const bitmap=value.image;
    if(bitmap && typeof bitmap === "object" && "close" in bitmap && typeof bitmap.close === "function")images.add(bitmap as {close(): void});
    value.dispose();
  });
  images.forEach(value => value.close());materials.forEach(value => value.dispose());geometries.forEach(value => value.dispose());
}

export async function loadAtlasModel(container: HTMLElement, id: string, signal: AbortSignal, progress: (percent: number) => void,options:{onSelect?:(id:string)=>void}={}): Promise<AtlasModelControls> {
  const organ = getAtlasOrgan(id); if (!organ) throw new Error("Organ bulunamadı.");
  signal.throwIfAborted();
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("webgl2", {alpha: true, antialias: false});
  if (!context) throw new Error("Bu cihazda 3B çizim desteği açılamadı. Organ resmini ve ilgili şemayı kullanabilirsin.");
  let renderer: THREE.WebGLRenderer;
  try {renderer = new THREE.WebGLRenderer({canvas, context, alpha: true, antialias: false});}
  catch {throw new Error("3B görüntüleyici başlatılamadı. Resimli görünüm kullanılabilir.");}
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;
  renderer.localClippingEnabled=true;
  canvas.setAttribute("aria-label", organ.name + " etiketli 3B modeli; sürükleyerek döndür, artı ve eksi ile yakınlaştır; açılan iç parçalara dokunarak seç");
  canvas.tabIndex = 0;
  container.appendChild(canvas);
  const scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(38, 1, 0.1, 60);
  camera.position.set(0, 0.25, 7.5);
  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true; controls.dampingFactor = 0.09; controls.enablePan = false;
  controls.minDistance = 3.5; controls.maxDistance = 30; controls.autoRotateSpeed = 0.75;
  scene.add(new THREE.HemisphereLight(0xffffff, 0x596278, 2.5));
  for (const [x,y,z,intensity] of [[4,5,6,3],[-4,1,3,1.5],[1,3,-4,1.8]]) {
    const light = new THREE.DirectionalLight(0xffffff, intensity); light.position.set(x!,y!,z!); scene.add(light);
  }
  let model: THREE.Object3D | null = null, disposed = false, frame = 0, visible = true, previous = 0;
  let assembly:ReturnType<typeof createOrganAssembly>|null=null,labels:ReturnType<typeof createModelLabels>|null=null;
  let targetOpen=false,openProgress=0,selected="",labelsEnabled=true;
  const reducedMotion=window.matchMedia("(prefers-reduced-motion: reduce)");
  const fitDistance=(open:boolean)=>Math.max(7.5,(open?8.4:4.2)/(2*Math.tan(THREE.MathUtils.degToRad(19))*Math.max(camera.aspect,.35)))*1.04;
  function invalidate() {if (!disposed && !frame && visible && !document.hidden) frame = requestAnimationFrame(draw);}
  function draw(now: number) {
    frame = 0; if (disposed || !visible || document.hidden) return;
    const delta=Math.min(Math.max((now-previous)/1000,0),0.05),moved=controls.update(delta);previous=now;
    const target=targetOpen?1:0;
    openProgress=reducedMotion.matches?target:THREE.MathUtils.lerp(openProgress,target,1-Math.exp(-delta*9));
    if(Math.abs(openProgress-target)<.002)openProgress=target;
    assembly?.update(openProgress);
    renderer.render(scene,camera);
    labels?.update(camera,container.clientWidth,container.clientHeight);
    if (moved || controls.autoRotate || openProgress!==target) invalidate();
  }
  function resize() {
    if (disposed) return;
    const width = container.clientWidth, height = container.clientHeight;
    if (!width || !height) return;
    camera.aspect = width/height; camera.updateProjectionMatrix(); renderer.setSize(width,height,false);
    if(assembly){const fit=Math.min(30,fitDistance(targetOpen));if(camera.position.length()<fit)camera.position.setLength(fit);}
    invalidate();
  }
  const resizeObserver = new ResizeObserver(resize); resizeObserver.observe(container);
  const intersection = new IntersectionObserver(entries => {visible = entries[0]?.isIntersecting ?? false; if (visible) invalidate();}); intersection.observe(container);
  const onVisibility = () => {if (document.hidden) {cancelAnimationFrame(frame);frame=0;} else invalidate();};
  const onKey = (event: KeyboardEvent) => {
    if (["+","=","-","ArrowLeft","ArrowRight","Home"].includes(event.key)) event.preventDefault();
    if (event.key === "+" || event.key === "=") api.zoom(-1);
    if (event.key === "-") api.zoom(1);
    if (event.key === "Home") api.reset();
    if (model && (event.key === "ArrowLeft" || event.key === "ArrowRight")) {model.rotation.y += event.key === "ArrowLeft" ? -.12 : .12; invalidate();}
  };
  const api: AtlasModelControls = {
    zoom(direction) {const distance=camera.position.length();camera.position.multiplyScalar(THREE.MathUtils.clamp(distance*(direction<0?.83:1.2),3.5,30)/distance);invalidate();},
    reset() {camera.position.set(0,.25,Math.min(30,fitDistance(targetOpen)));controls.target.set(0,0,0);if(model)model.rotation.set(0,-.2,0);invalidate();},
    // Rotation starts only after an explicit user action, never on load.
    rotate(enabled) {controls.autoRotate=enabled;invalidate();},
    wireframe(enabled) {model?.traverse(object=>{if(object instanceof THREE.Mesh) for(const material of Array.isArray(object.material)?object.material:[object.material]) if(material instanceof THREE.MeshStandardMaterial) material.wireframe=enabled;});invalidate();},
    open(enabled){if(targetOpen===enabled)return;targetOpen=enabled;controls.autoRotate=false;const distance=camera.position.length(),fit=Math.min(30,fitDistance(enabled));camera.position.multiplyScalar(fit/distance);invalidate();},
    select(value){if(value&&assembly&&!assembly.interior.parts.has(value))return;selected=value;assembly?.interior.select(value);labels?.select(value);controls.autoRotate=false;invalidate();},
    labels(enabled){labelsEnabled=enabled;labels?.show(enabled);invalidate();},
    dispose() {
      if(disposed)return;disposed=true;cancelAnimationFrame(frame);resizeObserver.disconnect();intersection.disconnect();
      document.removeEventListener("visibilitychange",onVisibility);canvas.removeEventListener("keydown",onKey);canvas.removeEventListener("webglcontextlost",onContextLost);
      canvas.removeEventListener("pointerdown",onPointerDown);canvas.removeEventListener("pointerup",onPointerUp);canvas.removeEventListener("pointercancel",onPointerCancel);labels?.dispose();labels=null;
      signal.removeEventListener("abort",api.dispose);controls.removeEventListener("change",invalidate);controls.dispose();
      if(model)disposeAtlasObject(model);scene.clear();renderer.dispose();renderer.forceContextLoss();canvas.remove();
    }
  };
  const raycaster=new THREE.Raycaster(),pointer=new THREE.Vector2();let down:{x:number;y:number;id:number}|null=null;
  const onPointerDown=(event:PointerEvent)=>{if(event.isPrimary)down={x:event.clientX,y:event.clientY,id:event.pointerId};};
  const onPointerCancel=()=>{down=null;};
  const onPointerUp=(event:PointerEvent)=>{
    const start=down;down=null;if(!start||start.id!==event.pointerId||Math.hypot(event.clientX-start.x,event.clientY-start.y)>6||!assembly||openProgress<.85)return;
    const rect=canvas.getBoundingClientRect();if(!rect.width||!rect.height)return;pointer.set((event.clientX-rect.left)/rect.width*2-1,-(event.clientY-rect.top)/rect.height*2+1);raycaster.setFromCamera(pointer,camera);
    const hit=raycaster.intersectObjects(Array.from(assembly.interior.parts.values()).map(part=>part.root),true).find(hit=>typeof hit.object.userData.structureId==="string");
    if(hit)options.onSelect?.(hit.object.userData.structureId as string);
  };
  const onContextLost = (event: Event) => {event.preventDefault(); api.dispose();container.dispatchEvent(new CustomEvent("atlas:model-error",{bubbles:true,detail:"3B çizim bağlantısı kesildi. Modeli yeniden açabilir veya şemayla devam edebilirsin."}));};
  controls.addEventListener("change",invalidate);document.addEventListener("visibilitychange",onVisibility);canvas.addEventListener("keydown",onKey);canvas.addEventListener("webglcontextlost",onContextLost);signal.addEventListener("abort",api.dispose,{once:true});
  canvas.addEventListener("pointerdown",onPointerDown);canvas.addEventListener("pointerup",onPointerUp);canvas.addEventListener("pointercancel",onPointerCancel);
  resize();
  try {
    progress(0);
    const response = await fetch(atlasAsset(`models/${organ.id}.glb`), {signal});
    if(!response.ok)throw new Error("Model indirilemedi. Bağlantını kontrol edip yeniden deneyebilirsin.");
    const length=Number(response.headers.get("content-length"))||0;
    const reader=response.body?.getReader();let bytes: ArrayBuffer;
    if(reader){
      const chunks: Uint8Array[]=[];let size=0;
      try {while(true){signal.throwIfAborted();const chunk=await reader.read();if(chunk.done)break;size+=chunk.value.byteLength;if(size>12*1024*1024)throw new Error("Model dosyası beklenen boyuttan büyük.");chunks.push(chunk.value);progress(length?Math.min(95,Math.round(size/length*95)):0);}}
      catch(error){await reader.cancel().catch(()=>{});throw error;}
      const buffer=new Uint8Array(size);let offset=0;for(const chunk of chunks){buffer.set(chunk,offset);offset+=chunk.byteLength;}bytes=buffer.buffer;
    }else bytes=await response.arrayBuffer();
    signal.throwIfAborted();
    if(bytes.byteLength>12*1024*1024)throw new Error("Model dosyası beklenen boyuttan büyük.");
    const gltf=await new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).parseAsync(bytes,"");
    if(signal.aborted||disposed){disposeAtlasObject(gltf.scene);signal.throwIfAborted();throw new Error("Görüntüleyici kapatıldı.");}
    model=gltf.scene;
    const box=new THREE.Box3().setFromObject(model),size=box.getSize(new THREE.Vector3()),center=box.getCenter(new THREE.Vector3());
    const longest=Math.max(size.x,size.y,size.z);
    if(!Number.isFinite(longest)||longest<=0)throw new Error("Modelin boyutları okunamadı.");
    model.scale.setScalar(3.8/longest);model.position.copy(center.multiplyScalar(-3.8/longest));
    assembly=createOrganAssembly(model,organ.id);model=assembly.root;model.rotation.y=-.2;scene.add(model);
    labels=createModelLabels(container,organ.id,assembly,value=>{if(!disposed)options.onSelect?.(value);});labels.show(labelsEnabled);labels.select(selected);assembly.interior.select(selected);api.reset();
    progress(100);invalidate();return api;
  }catch(error){api.dispose();throw error;}
}
