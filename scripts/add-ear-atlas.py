from pathlib import Path


def replace_once(path: str, old: str, new: str) -> None:
    p = Path(path)
    text = p.read_text(encoding="utf-8")
    count = text.count(old)
    if count != 1:
        raise SystemExit(f"{path}: beklenen parça {count} kez bulundu")
    p.write_text(text.replace(old, new), encoding="utf-8")


replace_once(
    "src/data/biology-atlas.ts",
    'export type OrganId = "heart" | "brain" | "lungs" | "liver" | "kidneys" | "eyeball" | "intestine" | "pancreas" | "skin";',
    'export type OrganId = "heart" | "brain" | "lungs" | "liver" | "kidneys" | "eyeball" | "ear" | "intestine" | "pancreas" | "skin";',
)
replace_once(
    "src/data/biology-atlas.ts",
    '  {id:"eyeball",name:"Göz",topic:"duyu",detail:"Kornea ve mercek ışığı kırar; retinadaki fotoreseptörler ışığı sinirsel sinyale dönüştürür.",megabytes:"2,2"},',
    '  {id:"eyeball",name:"Göz",topic:"duyu",detail:"Kornea ve mercek ışığı kırar; retinadaki fotoreseptörler ışığı sinirsel sinyale dönüştürür.",megabytes:"2,2"},\n  {id:"ear",name:"Kulak",topic:"duyu",detail:"Dış kulaktan gelen titreşim kulak zarı ve kemikçiklerle iç kulağa aktarılır; koklea işitme, vestibüler yapılar dengeyle ilişkilidir.",megabytes:"0,0"},',
)
replace_once(
    "src/data/biology-atlas.ts",
    'models:["eyeball","skin"]',
    'models:["eyeball","ear","skin"]',
)

ear_guide = '''  ear:{orientation:"Yandan kesit görünümü. Sol taraf dış kulak, sağ taraf iç kulaktır. İşitme ve denge yapıları aynı kulakta olsa da görevleri ayrıdır.",overview:"Sesin dış kulaktan kokleaya uzanan yolunu izle; ardından denge yapılarının işitme yolundan nasıl ayrıldığını gör.",connection:"Kulak kepçesi/dış kulak yolu → kulak zarı → çekiç–örs–üzengi → oval pencere → koklea → işitme siniri · Denge: vestibül + yarım daire kanalları",structures:[
    part("ear-canal","Dış kulak yolu",258,270,"left",0,false,"Ses dalgalarını kulak zarına iletir.","Kulak kepçesinin topladığı ses dalgaları dış kulak yolundan kulak zarına ulaşır. Yolun sonunda mekanik titreşim başlar.","Dış kulak yolu sesi sinir impulsuna çevirmez; yalnız kulak zarına taşır."),
    part("eardrum","Kulak zarı",332,270,"left",1,true,"Sesle titreşen ince zar.","Dış kulak ile orta kulağın sınırındadır. Titreşimi çekiç kemiğine aktararak kemikçik zincirini harekete geçirir.","Kulak zarı iç kulakta değil, dış ve orta kulak sınırındadır."),
    part("ossicles","Çekiç · örs · üzengi",377,245,"right",0,true,"Titreşimi oval pencereye ileten kemikçikler.","Çekiç kulak zarına, üzengi oval pencereye komşudur. Kemikçik sistemi titreşimin iç kulak sıvılarına aktarılmasına yardım eder.","İnsan vücudunun en küçük kemikleri orta kulaktadır; sıralama çekiç → örs → üzengidir."),
    part("eustachian-tube","Östaki borusu",389,350,"left",3,true,"Orta kulak basıncını dengelemeye yardım eder.","Orta kulağı yutağa bağlar. Kulak zarının iki tarafındaki basıncın dengelenmesine katkı sağlar.","Östaki borusu ses reseptörü değildir ve kokleanın parçası değildir."),
    part("vestibule","Vestibül · tulumcuk/kesecik",419,260,"left",2,true,"Doğrusal ivme ve yerçekimiyle ilişkili denge bölgesi.","Utrikulus ve sakkulus içindeki reseptörler başın konumu, doğrusal ivme ve yerçekimiyle ilişkili değişimleri algılar.","Yarım daire kanalları özellikle açısal hareketle; utrikulus ve sakkulus doğrusal ivmeyle ilişkilidir."),
    part("semicircular-canals","Yarım daire kanalları",430,173,"right",1,true,"Başın açısal hareketlerini algılar.","Birbirine yaklaşık dik üç kanal farklı düzlemlerdeki dönme hareketlerine duyarlıdır. Reseptörler kanalların genişlemiş bölgeleriyle ilişkilidir.","İşitmenin temel reseptörleri yarım daire kanallarında değil, kokleadadır."),
    part("cochlea","Koklea",470,302,"right",2,true,"İşitme reseptörlerinin bulunduğu salyangoz biçimli yapı.","Oval pencereden gelen titreşim iç kulak sıvılarında dalga oluşturur. Korti organındaki tüylü hücreler mekanik uyarıyı sinirsel sinyale dönüştürür.","Koklea işitmeyle; vestibüler yapılar dengeyle ilişkilidir."),
    part("auditory-nerve","İşitme siniri",520,278,"right",3,true,"Kokleadan oluşan sinirsel bilgiyi beyne taşır.","Tüylü hücrelerde başlayan uyarı işitme siniri lifleriyle merkezi sinir sistemine iletilir; algının yorumlanması beyinde gerçekleşir.","Sesin algılanması yalnız kulakta tamamlanmaz; sinirsel bilgi beyinde yorumlanır.")
  ]},
'''
replace_once("src/data/biology-organs.ts", '  skin:{orientation:', ear_guide + '  skin:{orientation:')

replace_once(
    "src/data/biology-organ-landmarks.ts",
    '  skin:{epidermis:surface([-.05,.88,1.4]),dermis:inside([.29,.05,1.4]),subcutaneous:inside([-.39,-1.15,1.4]),hair:surface([.89,-.44,1.4]),"sweat-gland":inside([-.55,-.5,1.4]),receptor:inside([.6,-.85,1.4])}',
    '  ear:{"ear-canal":surface([-.72,-.08,.64]),eardrum:inside([-.18,-.04,.72]),ossicles:inside([.20,.12,.75]),"eustachian-tube":inside([.38,-.85,.68]),vestibule:inside([.62,.06,.76]),"semicircular-canals":inside([.72,.70,.72]),cochlea:inside([1.02,-.16,.75]),"auditory-nerve":inside([1.48,-.05,.66])},\n  skin:{epidermis:surface([-.05,.88,1.4]),dermis:inside([.29,.05,1.4]),subcutaneous:inside([-.39,-1.15,1.4]),hair:surface([.89,-.44,1.4]),"sweat-gland":inside([-.55,-.5,1.4]),receptor:inside([.6,-.85,1.4])}',
)

ear_case = '''    case "ear": {
      tube(part("ear-canal",[-.72,-.08,.38]),[[-1.55,-.12,.02],[-1.08,-.08,.04],[-.58,-.05,.06],[-.28,-.03,.06]],.16,cream);
      const drum=mesh(part("eardrum",[-.18,-.03,.42]),new THREE.CylinderGeometry(.34,.34,.07,40),pink,[-.18,-.03,.06]);drum.rotation.z=Math.PI/2;
      const bones=part("ossicles",[.20,.13,.45]);ellipsoid(bones,[.02,.14,.08],[.15,.24,.12],gold);ellipsoid(bones,[.23,.18,.08],[.14,.17,.12],gold);ellipsoid(bones,[.43,.10,.08],[.10,.22,.10],gold);tube(bones,[[.06,.11,.08],[.22,.18,.08],[.41,.11,.08]],.035,gold);
      tube(part("eustachian-tube",[.40,-.84,.37]),[[.28,-.20,.04],[.42,-.61,.02],[.62,-1.28,-.04]],.09,cream);
      ellipsoid(part("vestibule",[.62,.06,.43]),[.60,.04,.05],[.26,.30,.22],teal);
      const canals=part("semicircular-canals",[.72,.72,.42]);const c1=ring(canals,[.68,.60,.02],.45,.055,teal),c2=ring(canals,[.70,.60,.02],.40,.05,teal),c3=ring(canals,[.72,.56,.02],.36,.05,teal);c1.rotation.x=Math.PI/2;c2.rotation.y=Math.PI/2;c3.rotation.set(Math.PI/2,Math.PI/3,0);
      const cochlea=part("cochlea",[1.02,-.18,.45]),spiral:Point3[]=[];for(let n=0;n<=90;n++){const t=n/90,a=t*Math.PI*5.4,r=.52*(1-.72*t);spiral.push([1.02,-.18+Math.cos(a)*r,.02+Math.sin(a)*r]);}tube(cochlea,spiral,.07,pink);ellipsoid(cochlea,[1.02,-.18,.02],[.16,.16,.13],pink);
      tube(part("auditory-nerve",[1.48,-.05,.39]),[[1.14,-.10,.02],[1.42,-.04,.01],[1.78,.02,-.02]],.09,gold);break;
    }
'''
replace_once("src/ui/biology-organ-interiors.ts", '    case "skin": {', ear_case + '    case "skin": {')

ear_svg = '''  ear:`<g class="organ-anatomy" stroke-linejoin="round">
    <path d="M205 118C151 151 150 355 220 401C266 430 302 390 282 345C263 307 216 312 225 266C233 225 292 242 300 190C311 123 253 88 205 118Z" fill="#e4ad9f" stroke="#a76c78" stroke-width="5"/>
    <path d="M236 154C196 183 193 305 237 344C261 365 276 337 259 316C235 287 236 251 269 238C300 225 286 171 266 156" fill="none" stroke="#bd7d83" stroke-width="14"/>
    <path data-region="ear-canal" d="M272 270H333" stroke="#efd5b6" stroke-width="22"/><path d="M272 270H333" stroke="#b8987f" stroke-width="3"/>
    <ellipse data-region="eardrum" cx="337" cy="270" rx="8" ry="42" fill="#e5a89f" stroke="#9e6674" stroke-width="4"/>
    <g data-region="ossicles" fill="#d6b471" stroke="#9c7b49" stroke-width="3"><ellipse cx="358" cy="252" rx="10" ry="17"/><ellipse cx="378" cy="246" rx="10" ry="13"/><ellipse cx="397" cy="258" rx="8" ry="16"/><path d="M365 254L372 248M385 249L391 255"/></g>
    <path data-region="eustachian-tube" d="M381 287Q397 345 428 394" fill="none" stroke="#e4c79d" stroke-width="15"/>
    <ellipse data-region="vestibule" cx="423" cy="265" rx="23" ry="30" fill="#8ebcaf" stroke="#5c8e82" stroke-width="4"/>
    <g data-region="semicircular-canals" fill="none" stroke="#79aa9f" stroke-width="11"><ellipse cx="431" cy="191" rx="38" ry="58"/><ellipse cx="459" cy="204" rx="48" ry="31" transform="rotate(35 459 204)"/><ellipse cx="410" cy="207" rx="27" ry="49" transform="rotate(-32 410 207)"/></g>
    <path data-region="cochlea" d="M455 286C520 267 543 338 496 366C456 390 431 348 454 322C475 300 503 318 494 340C487 355 467 350 468 337" fill="none" stroke="#d48c8d" stroke-width="13"/>
    <path data-region="auditory-nerve" d="M500 302Q540 285 571 294M500 327Q543 327 574 344" fill="none" stroke="#d3b16e" stroke-width="8"/>
  </g>`,
'''
replace_once("src/ui/biology-organ-diagrams.ts", '  skin:`<g class="organ-anatomy"', ear_svg + '  skin:`<g class="organ-anatomy"')
replace_once(
    "src/ui/biology-organ-diagrams.ts",
    '  const canOpen=id==="heart"||id==="brain";',
    '  const canOpen=id==="heart"||id==="brain"||id==="ear";',
)

Path("src/ui/biology-ear-source.ts").write_text(
    '''import * as THREE from "three";

const makeMaterial=(color:number)=>new THREE.MeshStandardMaterial({color,roughness:.7,metalness:0,side:THREE.DoubleSide});
const makeTube=(points:readonly (readonly [number,number,number])[],radius:number,color:number)=>new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(point=>new THREE.Vector3(...point))),48,radius,12,false),makeMaterial(color));

/** Lightweight authored reference surface for the atlas. The detailed YKS
 * structures are provided by biology-organ-interiors.ts after the shell opens. */
export function createEarSourceModel():THREE.Group {
  const root=new THREE.Group();root.name="procedural-ear-reference";
  const shape=new THREE.Shape();
  shape.moveTo(-1.22,-1.38);
  shape.bezierCurveTo(-1.78,-.95,-1.75,.55,-1.08,1.38);
  shape.bezierCurveTo(-.55,1.94,.27,1.63,.55,.86);
  shape.bezierCurveTo(.73,.35,.37,-.18,.06,.28);
  shape.bezierCurveTo(-.20,.69,-.63,.78,-.82,.38);
  shape.bezierCurveTo(-1.04,-.08,-.76,-.51,-.42,-.63);
  shape.bezierCurveTo(-.04,-.78,.02,-1.18,-.43,-1.45);
  shape.bezierCurveTo(-.73,-1.62,-1.03,-1.58,-1.22,-1.38);
  const pinna=new THREE.Mesh(new THREE.ExtrudeGeometry(shape,{depth:.50,bevelEnabled:true,bevelThickness:.07,bevelSize:.055,bevelSegments:3,steps:1,curveSegments:32}),makeMaterial(0xd99a91));pinna.position.z=-.25;root.add(pinna);
  root.add(makeTube([[-1.20,-1.08,.30],[-1.49,-.48,.33],[-1.43,.54,.33],[-.95,1.24,.33],[-.29,1.35,.32],[.20,.84,.31],[.04,.34,.32],[-.43,.57,.33],[-.78,.12,.33],[-.56,-.34,.32]],.075,0xefb4a8));
  root.add(makeTube([[-.62,-.19,.10],[-.28,-.11,.10],[.08,-.06,.08],[.47,-.04,.06]],.16,0xe7c5a5));
  const opening=new THREE.Mesh(new THREE.TorusGeometry(.19,.035,10,36),makeMaterial(0x9e6d68));opening.position.set(-.62,-.19,.34);opening.rotation.y=Math.PI/2;root.add(opening);
  return root;
}
''',
    encoding="utf-8",
)

replace_once(
    "src/ui/biology-atlas-model.ts",
    'import {createModelLabels} from "./biology-model-labels.ts";',
    'import {createModelLabels} from "./biology-model-labels.ts";\nimport {createEarSourceModel} from "./biology-ear-source.ts";',
)
replace_once(
    "src/ui/biology-atlas-model.ts",
    '    progress(0);\n    const response = await fetch(atlasAsset(`models/${organ.id}.glb`), {signal});',
    '    progress(0);\n    if(organ.id==="ear"){model=createEarSourceModel();progress(85);}\n    else {\n      const response = await fetch(atlasAsset(`models/${organ.id}.glb`), {signal});',
)
replace_once(
    "src/ui/biology-atlas-model.ts",
    '    model=gltf.scene;\n    const box=new THREE.Box3().setFromObject(model),size=box.getSize(new THREE.Vector3()),center=box.getCenter(new THREE.Vector3());',
    '      model=gltf.scene;\n    }\n    const box=new THREE.Box3().setFromObject(model),size=box.getSize(new THREE.Vector3()),center=box.getCenter(new THREE.Vector3());',
)

replace_once(
    "src/ui/biology-atlas.ts",
    '${ATLAS_TOPICS.length} ayrıntılı konu · 9 organ · ${ATLAS_ORGANS.reduce',
    '${ATLAS_TOPICS.length} ayrıntılı konu · ${ATLAS_ORGANS.length} organ · ${ATLAS_ORGANS.reduce',
)
replace_once(
    "src/ui/biology-atlas.ts",
    'WebGL yoksa “Şema yedeği · 2B” kullanılabilir. İlk açılış yaklaşık ${organ.megabytes} MB.',
    'WebGL yoksa “Şema yedeği · 2B” kullanılabilir. ${organ.id==="ear"?"Kulak modeli cihazda oluşturulur; ek model indirmez.":`İlk açılış yaklaşık ${organ.megabytes} MB.`}',
)

replace_once("tests/biology-atlas-3d.test.js", '}assert.equal(count,52);', '}assert.equal(count,60);')
replace_once("sw.js", 'const CACHE="yks-core-v4.1.0-r31";', 'const CACHE="yks-core-v4.1.0-r32";')
replace_once("scripts/verify-dist.mjs", 'yks-core-v4.1.0-r31', 'yks-core-v4.1.0-r32')

print("Kulak atlası kaynak değişiklikleri hazırlandı.")
