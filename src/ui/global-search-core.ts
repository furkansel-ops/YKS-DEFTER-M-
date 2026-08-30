export interface GlobalSearchItem{
  group:string;
  title:string;
  detail:string;
  screen:string;
  panel?:string;
  source?:"shortcut"|"legacy";
}

export function normalizeSearchText(value:unknown):string{
  return String(value??"")
    .trim()
    .toLocaleLowerCase("tr-TR")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g,"")
    .replace(/ı/g,"i");
}

export const GLOBAL_SEARCH_SHORTCUTS:readonly GlobalSearchItem[]=[
  {group:"Hızlı geçiş",title:"Bugün",detail:"Ana çalışma ekranı",screen:"home",source:"shortcut"},
  {group:"Hızlı geçiş",title:"Program",detail:"Manuel haftalık program",screen:"program",source:"shortcut"},
  {group:"Hızlı geçiş",title:"Konular",detail:"Konu durumları ve tekrarlar",screen:"topics",source:"shortcut"},
  {group:"Hızlı geçiş",title:"Denemeler",detail:"Deneme analizi ve Hata Defteri",screen:"deneme",source:"shortcut"},
  {group:"Hızlı geçiş",title:"İlerleme",detail:"Net, çalışma ve konu gelişimi",screen:"progress",source:"shortcut"},
  {group:"Hızlı geçiş",title:"Odak",detail:"Pomodoro ve kronometre",screen:"pomo",source:"shortcut"},
  {group:"Hızlı geçiş",title:"Öğrenme Laboratuvarı",detail:"Bilim Kartları, Atlas, Periyodik Tablo ve Kronoloji",screen:"more",panel:"lab",source:"shortcut"},
  {group:"Hızlı geçiş",title:"Kaynaklar",detail:"Kaynak ve genel arama araçları",screen:"more",panel:"kay",source:"shortcut"},
  {group:"Hızlı geçiş",title:"Ayarlar",detail:"Hedefler, tema ve uygulama ayarları",screen:"more",panel:"ayar",source:"shortcut"}
];

function scoreItem(query:string,item:GlobalSearchItem):number{
  const q=normalizeSearchText(query),tokens=q.split(/\s+/).filter(Boolean);
  if(!tokens.length)return item.source==="shortcut"?1:0;
  const title=normalizeSearchText(item.title),group=normalizeSearchText(item.group),detail=normalizeSearchText(item.detail);
  const haystack=`${title} ${group} ${detail}`;
  if(!tokens.every(token=>haystack.includes(token)))return -1;
  let score=0;
  if(title===q)score+=180;
  else if(title.startsWith(q))score+=120;
  else if(title.includes(q))score+=80;
  if(group===q)score+=45;else if(group.includes(q))score+=24;
  if(detail.includes(q))score+=20;
  for(const token of tokens){
    if(title.startsWith(token))score+=22;
    else if(title.includes(token))score+=14;
    if(group.includes(token))score+=6;
    if(detail.includes(token))score+=4;
  }
  if(item.source==="shortcut")score+=3;
  return score;
}

export function rankSearchResults(query:string,items:readonly GlobalSearchItem[],limit=30):GlobalSearchItem[]{
  const seen=new Set<string>();
  return items
    .map(item=>({item,score:scoreItem(query,item)}))
    .filter(row=>row.score>=0)
    .sort((a,b)=>b.score-a.score||a.item.title.localeCompare(b.item.title,"tr-TR"))
    .filter(({item})=>{
      const key=[item.group,item.title,item.detail,item.screen,item.panel||""].map(normalizeSearchText).join("|");
      if(seen.has(key))return false;
      seen.add(key);return true;
    })
    .slice(0,Math.max(1,limit))
    .map(row=>row.item);
}

export function shortcutResults(query:string,limit=9):GlobalSearchItem[]{
  return rankSearchResults(query,GLOBAL_SEARCH_SHORTCUTS,limit);
}
