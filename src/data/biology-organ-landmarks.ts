import type {OrganId} from "./biology-atlas.ts";
export type Point3=readonly[number,number,number];
export interface OrganLandmark {position:Point3;kind:"surface"|"inside"|"zoom"|"neighbor"}
const surface=(position:Point3):OrganLandmark=>({position,kind:"surface"});
const inside=(position:Point3):OrganLandmark=>({position,kind:"inside"});
const zoom=(position:Point3):OrganLandmark=>({position,kind:"zoom"});
const neighbor=(position:Point3):OrganLandmark=>({position,kind:"neighbor"});
// Normalized 3.8-unit model space, BEFORE the viewer's rotation. The source
// project's surface landmarks are reused where applicable. Hidden structures
// deliberately carry a different kind: a skin marker is an entry point, not a
// claim that a valve, cell or internal nucleus exists in the source GLB.
export const ORGAN_LANDMARKS:Readonly<Record<OrganId,Readonly<Record<string,OrganLandmark>>>>={
  heart:{"right-atrium":inside([-.9,.35,.55]),"right-ventricle":inside([-.65,-.68,.66]),"left-atrium":inside([.82,.65,.5]),"left-ventricle":inside([.7,-.75,.65]),tricuspid:inside([-.6,-.05,.85]),mitral:inside([.5,.0,.85]),aorta:surface([-.35,1.65,.55]),"pulmonary-artery":surface([.35,.95,.9])},
  brain:{cerebrum:surface([-.7,.65,.8]),thalamus:inside([.02,.08,.85]),hypothalamus:inside([-.08,-.32,.85]),midbrain:inside([.28,-.60,.78]),pons:inside([.4,-1.0,.6]),medulla:inside([.45,-1.4,.5]),cerebellum:surface([.72,-.9,.55])},
  lungs:{trachea:surface([0,1.6,.2]),bronchus:inside([-.03,.3,.35]),bronchiole:inside([.9,.1,.7]),alveolus:zoom([1.1,-.8,.7]),diaphragm:neighbor([0,-1.7,.35])},
  liver:{hepatocyte:zoom([-.75,.35,.75]),"portal-vein":inside([.1,-.3,.82]),"hepatic-artery":inside([.38,-.12,.85]),gallbladder:neighbor([.2,-.8,.55]),"bile-duct":inside([.25,-1.1,.6])},
  kidneys:{cortex:inside([-.9,.55,.7]),medulla:inside([.85,.2,.7]),pelvis:inside([.48,-.1,.65]),ureter:surface([.4,-1.1,.5]),glomerulus:zoom([-1.05,.1,.7])},
  eyeball:{cornea:surface([-.94,.05,1.47]),iris:surface([-1.22,-.53,1.15]),lens:inside([-.65,-.03,1.25]),retina:inside([.5,.55,1.1]),"blind-spot":inside([1.05,-.18,.8]),"optic-nerve":surface([1.61,-.18,.54])},
  intestine:{"small-intestine":surface([-.45,.1,.82]),"large-intestine":surface([.75,-.55,.72]),villus:zoom([.1,.55,.8]),"blood-capillary":zoom([-.1,-.5,.8]),"lymph-capillary":zoom([.3,-.8,.8])},
  pancreas:{acini:zoom([.8,.3,.45]),duct:inside([-.61,.39,.5]),"alpha-cells":zoom([.2,-.05,.5]),"beta-cells":zoom([.75,-.1,.5]),duodenum:neighbor([-1.6,-.35,.55])},
  ear:{"ear-canal":surface([-.72,-.08,.64]),eardrum:inside([-.18,-.04,.72]),ossicles:inside([.20,.12,.75]),"eustachian-tube":inside([.38,-.85,.68]),vestibule:inside([.62,.06,.76]),"semicircular-canals":inside([.72,.70,.72]),cochlea:inside([1.02,-.16,.75]),"auditory-nerve":inside([1.48,-.05,.66])},
  skin:{epidermis:surface([-.05,.88,1.4]),dermis:inside([.29,.05,1.4]),subcutaneous:inside([-.39,-1.15,1.4]),hair:surface([.89,-.44,1.4]),"sweat-gland":inside([-.55,-.5,1.4]),receptor:inside([.6,-.85,1.4])}
};
