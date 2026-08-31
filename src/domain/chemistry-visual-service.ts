import {CHEMISTRY_STRUCTURES,type ChemistryStructure,type ChemistryStructureId} from "../data/chemistry-molecules.ts";

export interface ChemistryBondLine {x1:number;y1:number;x2:number;y2:number;ionic:boolean;}
export interface ChemistryElectronPair {x1:number;y1:number;x2:number;y2:number;}
export interface ChemistryVisualPlan {structure:ChemistryStructure;bondLines:readonly ChemistryBondLine[];lonePairs:Readonly<Record<string,readonly ChemistryElectronPair[]>>;}
const byId=new Map(CHEMISTRY_STRUCTURES.map(item=>[item.id,item] as const));
export const getChemistryStructure=(id:string)=>byId.get(id as ChemistryStructureId);

function bondLines(structure:ChemistryStructure):ChemistryBondLine[] {
  const atoms=new Map(structure.atoms.map(atom=>[atom.id,atom] as const)),lines:ChemistryBondLine[]=[];
  for(const bond of structure.bonds){
    const a=atoms.get(bond.from),b=atoms.get(bond.to);if(!a||!b)continue;
    if(bond.order===0){lines.push({x1:a.x,y1:a.y,x2:b.x,y2:b.y,ionic:true});continue;}
    const dx=b.x-a.x,dy=b.y-a.y,length=Math.hypot(dx,dy)||1,px=-dy/length,py=dx/length;
    const offsets=bond.order===1?[0]:bond.order===2?[-1.8,1.8]:[-3,0,3];
    for(const offset of offsets)lines.push({x1:a.x+px*offset,y1:a.y+py*offset,x2:b.x+px*offset,y2:b.y+py*offset,ionic:false});
  }
  return lines;
}
function lonePairs(structure:ChemistryStructure):Readonly<Record<string,readonly ChemistryElectronPair[]>> {
  const result:Record<string,ChemistryElectronPair[]>={};
  for(const atom of structure.atoms){
    const pairs:ChemistryElectronPair[]=[];
    for(let index=0;index<atom.lonePairs;index++){
      const angle=(-Math.PI/2)+(Math.PI*2*index/Math.max(1,atom.lonePairs)),cx=atom.x+Math.cos(angle)*10,cy=atom.y+Math.sin(angle)*10,tx=-Math.sin(angle),ty=Math.cos(angle);
      pairs.push({x1:cx+tx*1.5,y1:cy+ty*1.5,x2:cx-tx*1.5,y2:cy-ty*1.5});
    }
    result[atom.id]=pairs;
  }
  return result;
}
export function buildChemistryVisual(id:string):ChemistryVisualPlan|null {
  const structure=getChemistryStructure(id);if(!structure)return null;
  return {structure,bondLines:bondLines(structure),lonePairs:lonePairs(structure)};
}
export function validateChemistryStructures():readonly string[] {
  const errors:string[]=[],ids=new Set<string>();
  for(const structure of CHEMISTRY_STRUCTURES){
    if(ids.has(structure.id))errors.push(`${structure.id}: duplicate`);ids.add(structure.id);
    const atomIds=new Set<string>();for(const atom of structure.atoms){if(atomIds.has(atom.id))errors.push(`${structure.id}:${atom.id}: duplicate atom`);atomIds.add(atom.id);if(!Number.isFinite(atom.x)||!Number.isFinite(atom.y)||atom.x<0||atom.x>100||atom.y<0||atom.y>100)errors.push(`${structure.id}:${atom.id}: invalid point`);if(!Number.isInteger(atom.lonePairs)||atom.lonePairs<0||atom.lonePairs>4)errors.push(`${structure.id}:${atom.id}: invalid lone pairs`);}
    for(const bond of structure.bonds){if(!atomIds.has(bond.from)||!atomIds.has(bond.to)||bond.from===bond.to)errors.push(`${structure.id}: invalid bond`);if(bond.order<0||bond.order>3)errors.push(`${structure.id}: invalid order`);if(bond.order===0&&structure.kind!=="ionic")errors.push(`${structure.id}: ionic bond marker on molecule`);}
  }
  return errors;
}
