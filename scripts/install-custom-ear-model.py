from pathlib import Path
import math, json, struct, re
import numpy as np
import trimesh

ROOT = Path(__file__).resolve().parents[1]

# ------------------------------
# Text migration helpers
# ------------------------------
def replace_once(rel, old, new):
    p = ROOT / rel
    text = p.read_text(encoding='utf-8')
    count = text.count(old)
    if count != 1:
        raise SystemExit(f'{rel}: beklenen parça {count} kez bulundu')
    p.write_text(text.replace(old, new), encoding='utf-8')


def replace_between(rel, start, end, replacement):
    p = ROOT / rel
    text = p.read_text(encoding='utf-8')
    a = text.find(start)
    b = text.find(end, a + len(start))
    if a < 0 or b < 0:
        raise SystemExit(f'{rel}: değiştirme sınırı bulunamadı')
    p.write_text(text[:a] + replacement + text[b:], encoding='utf-8')

# ------------------------------
# Geometry helpers: same reference model package, now authored as GLB asset
# ------------------------------
def T(x=0, y=0, z=0):
    m = np.eye(4); m[:3, 3] = [x, y, z]; return m

def S(x=1, y=1, z=1):
    m = np.eye(4); m[0,0]=x; m[1,1]=y; m[2,2]=z; return m

def RX(a):
    c,s=math.cos(a),math.sin(a); m=np.eye(4);m[1,1]=c;m[1,2]=-s;m[2,1]=s;m[2,2]=c;return m

def RY(a):
    c,s=math.cos(a),math.sin(a); m=np.eye(4);m[0,0]=c;m[0,2]=s;m[2,0]=-s;m[2,2]=c;return m

def RZ(a):
    c,s=math.cos(a),math.sin(a); m=np.eye(4);m[0,0]=c;m[0,1]=-s;m[1,0]=s;m[1,1]=c;return m

def add(scene, mesh, name, color):
    mesh = mesh.copy(); mesh.visual.face_colors = np.array([*color,255], dtype=np.uint8)
    scene.add_geometry(mesh, node_name=name, geom_name=name)

def sphere(name, center, scale, color, subdivisions=3):
    m=trimesh.creation.icosphere(subdivisions=subdivisions,radius=1.0);m.apply_transform(S(*scale));m.apply_transform(T(*center));return name,m,color

def cylinder_between(name,a,b,radius,color,sections=32):
    a=np.array(a,float);b=np.array(b,float);vec=b-a;length=float(np.linalg.norm(vec));m=trimesh.creation.cylinder(radius=radius,height=length,sections=sections)
    z=np.array([0,0,1.0]);v=vec/length;axis=np.cross(z,v);dot=np.dot(z,v)
    if np.linalg.norm(axis)<1e-8:R=np.eye(4) if dot>=0 else RX(math.pi)
    else:
        axis=axis/np.linalg.norm(axis);angle=math.acos(np.clip(dot,-1,1));K=np.array([[0,-axis[2],axis[1]],[axis[2],0,-axis[0]],[-axis[1],axis[0],0]])
        RR=np.eye(3)+math.sin(angle)*K+(1-math.cos(angle))*(K@K);R=np.eye(4);R[:3,:3]=RR
    m.apply_transform(R);m.apply_transform(T(*((a+b)/2)));return name,m,color

def tube(name,points,radius,color,sections=18):
    meshes=[]
    for i in range(len(points)-1):meshes.append(cylinder_between(name,points[i],points[i+1],radius,color,sections)[1])
    for p in points:meshes.append(sphere(name,p,(radius*1.12,)*3,color,2)[1])
    return name,trimesh.util.concatenate(meshes),color

def torus(major=1.0,minor=.1,major_sections=96,minor_sections=18):
    u=np.linspace(0,2*np.pi,major_sections,endpoint=False);v=np.linspace(0,2*np.pi,minor_sections,endpoint=False);verts=[]
    for a in u:
        ca,sa=np.cos(a),np.sin(a)
        for b in v:
            cb,sb=np.cos(b),np.sin(b);verts.append([(major+minor*cb)*ca,(major+minor*cb)*sa,minor*sb])
    faces=[]
    for i in range(major_sections):
        ni=(i+1)%major_sections
        for j in range(minor_sections):
            nj=(j+1)%minor_sections;a=i*minor_sections+j;b=ni*minor_sections+j;c=ni*minor_sections+nj;d=i*minor_sections+nj;faces.extend([[a,b,c],[a,c,d]])
    return trimesh.Trimesh(np.array(verts),np.array(faces),process=False)

def ring(name,center,major_radius,minor_radius,scale_xyz,rotation,color):
    m=torus(major_radius,minor_radius);m.apply_transform(S(*scale_xyz));rx,ry,rz=rotation;m.apply_transform(RX(rx)@RY(ry)@RZ(rz));m.apply_transform(T(*center));return name,m,color

scene=trimesh.Scene()
skin=(219,148,128);skin_light=(236,172,149);bone=(210,182,145);bone_dark=(171,137,100);canal=(153,71,57);soft=(191,91,75);gold=(222,168,73);nerve=(229,171,44);inner=(196,161,126);membrane=(190,118,106)
parts=[]
parts += [sphere('outer_ear_main',(-1.35,.05,0),(.70,1.38,.28),skin,4),sphere('ear_lobule',(-1.30,-1.05,.03),(.50,.52,.31),skin_light),sphere('concha_bowl',(-1.00,-.05,.20),(.40,.58,.18),soft),sphere('tragus',(-.75,-.10,.23),(.20,.30,.22),skin_light)]
helix=[(-1.35+.58*np.cos(t),.10+1.20*np.sin(t),.30) for t in np.linspace(-2.3,2.2,30)];parts.append(tube('helix_rim',helix,.10,skin_light))
anti=[(-1.27+.34*np.cos(t),.10+.82*np.sin(t),.33) for t in np.linspace(-1.9,1.55,22)];parts.append(tube('antihelix_ridge',anti,.075,skin_light))
parts += [sphere('temporal_bone_mass',(.25,.25,-.05),(1.55,1.32,.46),bone),sphere('mastoid_bone_mass',(1.10,.15,-.12),(.85,1.05,.48),bone_dark),sphere('temporal_bone_upper',(.10,1.12,.06),(1.10,.28,.45),bone),sphere('temporal_bone_floor',(0,-.90,.03),(1.00,.27,.42),bone)]
rng=np.random.default_rng(7)
for i in range(34):
    x=rng.uniform(-.10,1.55);y=rng.uniform(-.65,.95)
    if ((x-.35)/.75)**2+((y+.02)/.48)**2<1:continue
    z=rng.uniform(.32,.48);r=rng.uniform(.035,.075);parts.append(sphere(f'bone_cell_{i:02d}',(x,y,z),(r,r*.75,r*.45),bone_dark,2))
canal_pts=[(-.90,-.16,.18),(-.58,-.14,.20),(-.28,-.11,.18),(.03,-.10,.15)];parts.append(tube('external_auditory_canal',canal_pts,.20,canal));parts.append(tube('ear_canal_lumen',canal_pts,.115,(112,50,44)))
drum=trimesh.creation.cylinder(radius=.22,height=.055,sections=48);drum.apply_transform(RY(math.pi/2.25)@RX(-.12));drum.apply_transform(T(.18,-.08,.16));parts.append(('tympanic_membrane',drum,membrane))
parts.append(sphere('middle_ear_cavity',(.42,-.02,.15),(.35,.42,.22),(116,58,52)))
parts += [sphere('malleus_head',(.37,.12,.26),(.10,.12,.10),gold),tube('malleus_handle',[(.36,.08,.24),(.30,-.06,.20),(.24,-.10,.18)],.038,gold),sphere('incus_body',(.55,.15,.27),(.11,.09,.09),gold),tube('incus_process',[(.54,.12,.25),(.61,.02,.20),(.66,-.03,.18)],.034,gold),sphere('stapes',(.73,-.01,.18),(.07,.10,.055),gold)]
parts.append(tube('eustachian_tube',[(.42,-.28,.10),(.57,-.58,.07),(.78,-.95,.03),(1.00,-1.30,-.02)],.13,soft));parts.append(sphere('vestibule',(.92,.15,.18),(.22,.26,.18),inner))
parts += [ring('semicircular_canal_superior',(.97,.63,.22),.32,.045,(1,1.2,1),(0,0,0),inner),ring('semicircular_canal_posterior',(1.15,.58,.22),.31,.045,(1,1.15,1),(math.pi/2,0,0),inner),ring('semicircular_canal_lateral',(1.03,.43,.32),.29,.045,(1,1.05,1),(0,math.pi/2.4,0),inner)]
spiral=[]
for t in np.linspace(0,1,90):
    ang=t*2.6*2*math.pi;r=.42*(1-.72*t)+.05;spiral.append((1.20+r*math.cos(ang),-.18+r*math.sin(ang),.20+.03*math.sin(ang*.5)))
parts.append(tube('cochlea',spiral,.075,inner,14));parts.append(sphere('cochlea_core',(1.20,-.18,.20),(.15,.15,.12),inner))
parts.append(tube('auditory_nerve_main',[(1.47,-.02,.20),(1.72,.03,.20),(2.02,.08,.16)],.085,nerve))
for k,dy in enumerate([-.07,0,.07]):parts.append(tube(f'auditory_nerve_fiber_{k+1}',[(1.52,-.02+dy,.21),(1.82,.03+dy,.20),(2.08,.08+dy,.18)],.027,nerve,12))
for name,mesh,color in parts:add(scene,mesh,name,color)

asset=ROOT/'public/anatomy/models/ear.glb';asset.parent.mkdir(parents=True,exist_ok=True);asset.write_bytes(scene.export(file_type='glb'))
raw=asset.read_bytes()
if len(raw)<1_400_000 or raw[:4]!=b'glTF' or struct.unpack_from('<I',raw,4)[0]!=2 or struct.unpack_from('<I',raw,8)[0]!=len(raw):raise SystemExit('Üretilen kulak GLB doğrulanamadı')
json_len,json_type=struct.unpack_from('<II',raw,12);data=json.loads(raw[20:20+json_len].decode('utf-8').rstrip(' \x00'));names={n.get('name') for n in data.get('nodes',[])}
required={'outer_ear_main','helix_rim','antihelix_ridge','temporal_bone_mass','external_auditory_canal','tympanic_membrane','malleus_head','incus_body','stapes','eustachian_tube','vestibule','semicircular_canal_superior','semicircular_canal_posterior','semicircular_canal_lateral','cochlea','auditory_nerve_main'}
if not required<=names or len(data.get('meshes',[]))<60:raise SystemExit('Kulak GLB anatomik parça sözleşmesi eksik')

# Mount the custom GLB into the existing atlas loader.
replace_once('src/ui/biology-atlas-model.ts','import {createEarSourceModel} from "./biology-ear-source.ts";\n','')
replace_once('src/ui/biology-atlas-model.ts','    if(organ.id==="ear"){model=createEarSourceModel();progress(85);}\n    else {\n      const response = await fetch(atlasAsset(`models/${organ.id}.glb`), {signal});','    const response = await fetch(atlasAsset(`models/${organ.id}.glb`), {signal});')
replace_once('src/ui/biology-atlas-model.ts','      model=gltf.scene;\n    }\n    const box=new THREE.Box3().setFromObject(model),size=box.getSize(new THREE.Vector3()),center=box.getCenter(new THREE.Vector3());','    model=gltf.scene;\n    const box=new THREE.Box3().setFromObject(model),size=box.getSize(new THREE.Vector3()),center=box.getCenter(new THREE.Vector3());')
replace_once('src/data/biology-atlas.ts','{id:"ear",name:"Kulak",topic:"duyu",detail:"Dış kulaktan gelen titreşim kulak zarı ve kemikçiklerle iç kulağa aktarılır; koklea işitme, vestibüler yapılar dengeyle ilişkilidir.",megabytes:"0,0"}', '{id:"ear",name:"Kulak",topic:"duyu",detail:"Dış kulaktan gelen titreşim kulak zarı ve kemikçiklerle iç kulağa aktarılır; koklea işitme, vestibüler yapılar dengeyle ilişkilidir.",megabytes:"1,6"}')
replace_once('src/ui/biology-atlas.ts','${organ.id==="ear"?"Kulak modeli cihazda oluşturulur; ek model indirmez.":`İlk açılış yaklaşık ${organ.megabytes} MB.`}','İlk açılış yaklaşık ${organ.megabytes} MB.')
replace_once('src/ui/biology-atlas.ts','const badge=find("atlas3DViewLabel");if(badge)badge.textContent=organOpen?"3B İÇ YAPI · DÖNDÜREREK İNCELE":"3B DIŞ YÜZEY · YKS ETİKETLERİ";','const badge=find("atlas3DViewLabel");if(badge)badge.textContent=organOpen?"3B İÇ YAPI · DÖNDÜREREK İNCELE":organId==="ear"?"3B ANATOMİK KESİT · YKS ETİKETLERİ":"3B DIŞ YÜZEY · YKS ETİKETLERİ";')

# The old procedural source is no longer the live ear model.
old_source=ROOT/'src/ui/biology-ear-source.ts'
if not old_source.exists():raise SystemExit('Eski kulak kaynak dosyası bulunamadı')
old_source.unlink()

# Tests now validate the actual mounted GLB asset rather than the retired procedural model.
p=ROOT/'tests/biology-atlas-3d.test.js';t=p.read_text(encoding='utf-8')
a=t.find("test('Kulak referans kesiti")
b=t.find("test('Kalp boşlukları",a)
if a<0 or b<0:raise SystemExit('Kulak 3B test bloğu bulunamadı')
new_test='''test('Kulak referans paketi doğrudan GLB olarak monte edilir ve anatomik düğümleri taşır',async()=>{\n  const {readFile}=require('node:fs/promises'),{inspectAnatomyGlb}=await load('scripts/verify-anatomy-assets.mjs');\n  const bytes=await readFile(path.resolve(__dirname,'..','public/anatomy/models/ear.glb')),data=inspectAnatomyGlb(bytes),names=new Set((data.nodes||[]).map(n=>n.name));\n  assert.ok(bytes.length>1400000&&bytes.length<2200000);assert.ok((data.meshes||[]).length>=60);\n  for(const name of ['outer_ear_main','helix_rim','antihelix_ridge','temporal_bone_mass','external_auditory_canal','tympanic_membrane','malleus_head','incus_body','stapes','eustachian_tube','vestibule','semicircular_canal_superior','semicircular_canal_posterior','semicircular_canal_lateral','cochlea','auditory_nerve_main'])assert.ok(names.has(name),name);\n});\n\n'''
p.write_text(t[:a]+new_test+t[b:],encoding='utf-8')

replace_once('tests/biology-atlas.test.js','if(organ.id==="ear"){assert.equal(entry,undefined);assert.equal(organ.megabytes,"0,0");continue;}','if(organ.id==="ear"){assert.equal(entry,undefined);const ear=fs.statSync(path.join(root,"public/anatomy/models/ear.glb"));assert.equal(organ.megabytes,(ear.size/1e6).toFixed(1).replace(".",","));continue;}')

# Production verification checks that the custom asset survives the Vite/public copy.
replace_once('scripts/verify-dist.mjs','import {verifyAnatomyAssets} from "./verify-anatomy-assets.mjs";','import {verifyAnatomyAssets,inspectAnatomyGlb} from "./verify-anatomy-assets.mjs";')
replace_once('scripts/verify-dist.mjs','await verifyAnatomyAssets(resolve(dist,"anatomy"),JSON.parse(await readFile(resolve(root,"scripts/anatomy-assets.json"),"utf8")));','''await verifyAnatomyAssets(resolve(dist,"anatomy"),JSON.parse(await readFile(resolve(root,"scripts/anatomy-assets.json"),"utf8")));
const earBytes=await readFile(resolve(dist,"anatomy/models/ear.glb")),earData=inspectAnatomyGlb(earBytes),earNames=new Set((earData.nodes||[]).map(node=>node.name));
if(earBytes.length<1400000||earBytes.length>2200000||!earNames.has("outer_ear_main")||!earNames.has("cochlea")||!earNames.has("auditory_nerve_main"))throw new Error("Özel 3B kulak modeli üretim paketinde eksik veya bozuk");''')

# Release note reflects the real asset mounting strategy.
p=ROOT/'RELEASE.md';doc=p.read_text(encoding='utf-8');start='- Kulak atlası kullanıcının sağladığı anatomik kesit referansı esas alınarak yeniden 3B modellenmiştir:'
line=next((ln for ln in doc.splitlines() if ln.startswith(start)),None)
if not line:raise SystemExit('RELEASE kulak satırı bulunamadı')
new_line='- Kulak atlasında kullanıcının gönderdiği anatomik kesit referansından hazırlanan özel yaklaşık 1,6 MB GLB artık doğrudan canlı 3B modeldir. Dış kulak, helix/antihelix, concha, tragus, temporal kemik kesiti, dış kulak yolu, kulak zarı, çekiç–örs–üzengi, Östaki borusu, vestibül, üç yarım daire kanalı, koklea ve işitme siniri aynı döndürülebilir modelde yer alır; eski prosedürel kulak kabuğu kaldırılmıştır.'
p.write_text(doc.replace(line,new_line),encoding='utf-8')

print(f'Özel kulak GLB monte edildi: {len(raw)} bayt, {len(data.get("meshes",[]))} mesh, {len(names)} düğüm')
