/* v77 · Deneme rankı: yalnız deneme netlerinden hesaplanır; XP ve seviyeden tamamen bağımsızdır.
   Son 3 geçerli denemenin ortalaması (3'ten az varsa olanların). TYT 120, AYT (alan dersleri) ve YDT 80 üzerinden.
   Eşikler TYT içindir; AYT/YDT için 80/120 oranında ölçeklenir. Kayıtlardan türetilir, ayrıca saklanmaz. */

export const RANK_LEAGUES=["Bronz","Gümüş","Altın","Platin","Elmas","Usta","Büyük Usta","Efsane"] as const;
export const RANK_THRESHOLDS=[0,20,40,60,80,100,110,115] as const;
/** Bronz'dan Elmas'a kadar ligler üç kademeli: I → II → III (III en üst). */
export const TIERED_LEAGUES=5;
export const RANK_WINDOW=3;

export type RankExam="TYT"|"AYT"|"YDT";
export interface RankPosition{league:number;tier:0|1|2|3;name:string;nextName:string|null;toNext:number;progress:number;}
export interface RankResult extends RankPosition{exam:RankExam;label:string;max:number;net:number;samples:number;}
export interface RankHistoryItem extends RankPosition{exam:RankExam;date:string;title:string;net:number;change:"first"|"league-up"|"up"|"same"|"down";}
export interface ExamRanks{track:string;tyt:RankResult|null;ayt:RankResult|null;ydt:RankResult|null;history:RankHistoryItem[];}

type Loose=Record<string,unknown>;
type ExamLike={id?:unknown;type?:unknown;date?:unknown;name?:unknown;totalNet?:unknown;netOnly?:unknown;subjectResults?:unknown};

/* Alanına göre AYT'de sayılan dersler (deneme satır adlarıyla). */
export const AYT_TRACK_SUBJECTS:Record<string,readonly string[]>={
  SAY:["Matematik","Fizik","Kimya","Biyoloji"],
  EA:["Matematik","Edebiyat","Tarih-1","Coğrafya-1"],
  SOZ:["Edebiyat","Tarih-1","Coğrafya-1","Tarih-2","Coğrafya-2","Felsefe Grubu","Din Kültürü"]
};
const TRACK_LABEL:Record<string,string>={SAY:"Sayısal",EA:"Eşit Ağırlık",SOZ:"Sözel"};

function finite(value:unknown):number{const n=Number(value);return Number.isFinite(n)?n:0;}
function round(value:number):number{return Math.round(value*100)/100;}
function rows(exam:ExamLike):Loose[]{return Array.isArray(exam.subjectResults)?exam.subjectResults.filter((x):x is Loose=>!!x&&typeof x==="object"):[];}
function canonical(name:unknown):string{return String(name??"").trim().replace(/ \(AYT\)$/u,"");}

/** Verilen net için lig, kademe ve sonraki lige kalan. */
export function rankFor(net:number,max=120):RankPosition{
  const scale=max/120,value=Math.max(0,net);
  let league=0;
  RANK_THRESHOLDS.forEach((min,index)=>{if(value>=min*scale-1e-9)league=index;});
  const low=RANK_THRESHOLDS[league]!*scale,next=league+1<RANK_THRESHOLDS.length?RANK_THRESHOLDS[league+1]!*scale:max;
  let tier:0|1|2|3=0;
  if(league<TIERED_LEAGUES){const third=(next-low)/3;tier=Math.min(3,Math.floor((value-low)/third+1e-9)+1) as 1|2|3;}
  const name=RANK_LEAGUES[league]+(tier?" "+["I","II","III"][tier-1]:"");
  const nextName=league+1<RANK_LEAGUES.length?RANK_LEAGUES[league+1]!:null;
  return {league,tier,name,nextName,toNext:nextName?round(Math.max(0,next-value)):0,progress:next>low?Math.min(1,Math.max(0,(value-low)/(next-low))):1};
}

function examNet(exam:ExamLike,kind:RankExam,track:string):number|null{
  const list=rows(exam),answered=list.some(r=>finite(r.d)+finite(r.y)+finite(r.b)>0);
  if(kind==="AYT"){
    const subjects=AYT_TRACK_SUBJECTS[track];if(!subjects)return null;
    const mine=list.filter(r=>subjects.includes(canonical(r.name)));
    const known=mine.some(r=>finite(r.d)+finite(r.y)+finite(r.b)>0||finite(r.net)!==0);
    return known?mine.reduce((sum,r)=>sum+finite(r.net),0):null;
  }
  const total=finite(exam.totalNet);
  return answered||total>0||exam.netOnly?total:null;
}
/** Yalnız tamamlanmış ve geçerli denemeler; aynı deneme (tür, tarih, ad, net) bir kez sayılır. */
export function validExams(state:Loose,kind:RankExam,track:string):{date:string;title:string;net:number}[]{
  const seen=new Set<string>(),out:{date:string;title:string;net:number;id:number}[]=[];
  for(const raw of Array.isArray(state.denemeler)?state.denemeler:[]){
    if(!raw||typeof raw!=="object")continue;const exam=raw as ExamLike;
    if(exam.type!==kind||typeof exam.date!=="string"||!/^\d{4}-\d{2}-\d{2}$/.test(exam.date))continue;
    const net=examNet(exam,kind,track);if(net==null)continue;
    const key=[kind,exam.date,String(exam.name??"").trim().toLocaleLowerCase("tr-TR"),round(finite(exam.totalNet))].join("|");
    if(seen.has(key))continue;seen.add(key);
    out.push({date:exam.date,title:String(exam.name||kind+" denemesi"),net:round(net),id:finite(exam.id)});
  }
  return out.sort((a,b)=>a.date.localeCompare(b.date)||a.id-b.id).map(({date,title,net})=>({date,title,net}));
}
function average(list:{net:number}[]):number{return round(list.reduce((s,x)=>s+x.net,0)/list.length);}
function result(kind:RankExam,label:string,max:number,list:{net:number}[]):RankResult|null{
  if(!list.length)return null;
  const recent=list.slice(-RANK_WINDOW),net=average(recent);
  return {exam:kind,label,max,net,samples:recent.length,...rankFor(net,max)};
}
function history(kind:RankExam,max:number,list:{date:string;title:string;net:number}[]):RankHistoryItem[]{
  const out:RankHistoryItem[]=[];
  list.forEach((item,index)=>{
    const net=average(list.slice(Math.max(0,index-RANK_WINDOW+1),index+1)),pos=rankFor(net,max),prev=out.at(-1);
    const change:RankHistoryItem["change"]=!prev?"first":pos.league>prev.league?"league-up":
      pos.league===prev.league&&pos.tier>prev.tier?"up":pos.league===prev.league&&pos.tier===prev.tier?"same":"down";
    out.push({exam:kind,date:item.date,title:item.title,net,change,...pos});
  });
  return out;
}

export function computeExamRanks(state:Loose|null|undefined):ExamRanks{
  const s=state??{},track=["SAY","EA","SOZ","DIL"].includes(String(s.puanTuru))?String(s.puanTuru):"SAY";
  const tytList=validExams(s,"TYT",track);
  const aytList=track==="DIL"?[]:validExams(s,"AYT",track);
  const ydtList=validExams(s,"YDT",track);
  return {
    track,
    tyt:result("TYT","TYT",120,tytList),
    ayt:track==="DIL"?null:result("AYT","AYT "+(TRACK_LABEL[track]||""),80,aytList),
    ydt:result("YDT","YDT",80,ydtList),
    history:history("TYT",120,tytList).reverse()
  };
}

/** Koç ve kısa gösterimler için özet. */
export function rankSummary(rank:RankResult|null):{label:string;name:string;net:number;league:number;tier:number}|null{
  return rank?{label:rank.label,name:rank.name,net:rank.net,league:rank.league,tier:rank.tier}:null;
}
