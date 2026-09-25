import notebook from "./mascot-images/notebook";
import owl from "./mascot-images/owl";
import cat from "./mascot-images/cat";
import fox from "./mascot-images/fox";
import panda from "./mascot-images/panda";
import rabbit from "./mascot-images/rabbit";
import turtle from "./mascot-images/turtle";
import penguin from "./mascot-images/penguin";
import robot from "./mascot-images/robot";
import dragon from "./mascot-images/dragon";

export const MASCOT_IDS=["notebook","owl","cat","fox","panda","rabbit","turtle","penguin","robot","dragon"] as const;
export type MascotId=typeof MASCOT_IDS[number];

export type MascotDefinition={
  id:MascotId;
  name:string;
  role:string;
  image:string;
};

export const MASCOTS:readonly MascotDefinition[]=[
  {id:"notebook",name:"Defter",role:"YKS Defterim'in ana maskotu",image:notebook},
  {id:"owl",name:"Baykuş",role:"Bilgi ve odak",image:owl},
  {id:"cat",name:"Kedi",role:"Günlük görevler",image:cat},
  {id:"fox",name:"Tilki",role:"Hedef ve strateji",image:fox},
  {id:"panda",name:"Panda",role:"Mola ve motivasyon",image:panda},
  {id:"rabbit",name:"Tavşan",role:"Seri ve tempo",image:rabbit},
  {id:"turtle",name:"Kaplumbağa",role:"İstikrar",image:turtle},
  {id:"penguin",name:"Penguen",role:"Program ve düzen",image:penguin},
  {id:"robot",name:"Robot",role:"Analiz ve akıllı öneriler",image:robot},
  {id:"dragon",name:"Ejderha",role:"Başarı ve seviye atlama",image:dragon}
];

export function mascotById(id:string):MascotDefinition{
  return MASCOTS.find(item=>item.id===id)??MASCOTS[0]!;
}
