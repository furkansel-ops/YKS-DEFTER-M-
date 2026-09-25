export const MASCOT_IDS=["notebook","owl","cat","fox","panda","rabbit","turtle","penguin","robot","dragon"] as const;
export type MascotId=typeof MASCOT_IDS[number];

export type MascotDefinition={
  id:MascotId;
  name:string;
  role:string;
  image:string;
};

const image=(id:MascotId)=>`./mascots/${id}.webp`;

export const MASCOTS:readonly MascotDefinition[]=[
  {id:"notebook",name:"Defter",role:"YKS Defterim'in ana maskotu",image:image("notebook")},
  {id:"owl",name:"Baykuş",role:"Bilgi ve odak",image:image("owl")},
  {id:"cat",name:"Kedi",role:"Günlük görevler",image:image("cat")},
  {id:"fox",name:"Tilki",role:"Hedef ve strateji",image:image("fox")},
  {id:"panda",name:"Panda",role:"Mola ve motivasyon",image:image("panda")},
  {id:"rabbit",name:"Tavşan",role:"Seri ve tempo",image:image("rabbit")},
  {id:"turtle",name:"Kaplumbağa",role:"İstikrar",image:image("turtle")},
  {id:"penguin",name:"Penguen",role:"Program ve düzen",image:image("penguin")},
  {id:"robot",name:"Robot",role:"Analiz ve akıllı öneriler",image:image("robot")},
  {id:"dragon",name:"Ejderha",role:"Başarı ve seviye atlama",image:image("dragon")}
];

export function mascotById(id:string):MascotDefinition{
  return MASCOTS.find(item=>item.id===id)??MASCOTS[0]!;
}
