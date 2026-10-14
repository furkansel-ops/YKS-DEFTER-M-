/* Bugün v47: read-only, evidence-backed gap closure tracker.
   Builds DOM only after the parent Insights disclosure opens. */
import "./today-gap-tracker-v47.css";

type GapState="open"|"working"|"recheck"|"verified";
type GapRow={
  key:string;exam:string;subj:string;topic:string;wrong:number;reasons:string[];
  state:GapState;stage:number;confidence:number;reviews:number;
  reviewDate:string;wrongDate:string;
};
type GapTrackingSnapshot={
  date:string;tracker?:{total:number;open:number;working:number;verified:number;rows:GapRow[]};
};
type GapTrackingWindow=Window&{
  yksTodayInsightsSnapshot?:()=>GapTrackingSnapshot;
  yksTodayInsightsOpenTopic?:(exam:string,subj:string,topic:string)=>boolean;
  go?:(screen:string)=>void;
};

const statusNames:Record<GapState,string>={
  open:"Açık",working:"Üzerinde çalışılıyor",
  recheck:"Yeniden kontrol",verified:"Pekiştirildi"
};

export function installTodayGapTrackerV47():{installed:boolean}{
  const parent=document.getElementById("todayFreshInsights") as HTMLDetailsElement|null;
  const area=parent?.querySelector(".today-fresh-insights-body");
  const grid=area?.querySelector(".today-fresh-insights-grid");
  if(!parent||!area||!grid)return{installed:false};
  if(document.getElementById("todayFreshGapTracker"))return{installed:true};

  const make=(tag:string,className:string,value?:string)=>{
    const el=document.createElement(tag);
    el.className=className;
    if(value!==undefined)el.textContent=value;
    return el;
  };
  const holder=make("details","today-gap-tracker") as HTMLDetailsElement;
  holder.id="todayFreshGapTracker";
  holder.setAttribute("aria-label","Eksik kapatma takibi");
  const head=make("summary","today-gap-head");
  const heading=make("span","today-gap-heading");
  heading.append(make("strong","","Eksik kapatma takibi"),
    make("small","","Yanlışlar ve tamamlanan tekrarlardan"));
  const headline=make("span","today-gap-head-count","Hazırlanıyor…");
  headline.id="todayFreshGapTrackerSummary";
  head.append(heading,headline);
  const body=make("div","today-gap-body");
  const counters=make("div","today-gap-stats");
  counters.id="todayFreshGapTrackerStats";
  const list=make("div","today-gap-list");
  list.id="todayFreshGapTrackerList";
  const foot=make("p","today-gap-note",
    "Pekiştirildi: 3/3 tekrar, en az 4/5 güven ve son yanlıştan sonra kayıtlı tekrar. Bu sonuç garanti değil, çalışma kayıtlarından türetilen durumdur.");
  body.append(counters,list,foot);
  holder.append(head,body);
  grid.insertAdjacentElement("afterend",holder);

  const set=(node:Element,value:string)=>{
    if(node.textContent!==value)node.textContent=value;
  };
  const labels=(values:Array<[string,number]>)=>values.map(([name,num])=>{
    const item=make("div","today-gap-stat");
    item.append(make("strong","",String(num)),make("span","",name));
    return item;
  });
  const openTopic=(row:GapRow)=>{
    const api=(window as GapTrackingWindow).yksTodayInsightsOpenTopic;
    if(typeof api==="function"){api(row.exam,row.subj,row.topic);return;}
    (window as GapTrackingWindow).go?.("topics");
  };
  const rowCard=(row:GapRow)=>{
    const state=(row.state in statusNames?row.state:"open") as GapState;
    const card=make("article","today-gap-row");
    card.dataset.status=state;
    const main=make("div","today-gap-main");
    const title=make("strong","today-gap-title",row.topic);
    const subtitle=make("small","today-gap-subject",row.exam+" · "+row.subj);
    const why=make("small","today-gap-reason",(row.reasons||[]).join(" · ")||"Konu takibi kaydı");
    main.append(title,subtitle,why);
    const evidence=make("span","today-gap-evidence",
      "Aşama "+Math.max(0,Math.min(3,Number(row.stage)||0))+"/3"+
      " · Tekrar "+Math.max(0,Math.min(3,Number(row.reviews)||0))+"/3"+
      " · Güven "+Math.max(0,Math.min(5,Number(row.confidence)||0))+"/5");
    const stateLine=make("div","today-gap-state");
    stateLine.append(make("span","today-gap-pill",statusNames[state]),evidence);
    if(state==="recheck")stateLine.append(make("small","today-gap-explain","Son yanlış sonrası yeniden değerlendirme gerekli"));
    const btn=make("button","today-gap-open","Konuya git") as HTMLButtonElement;
    btn.type="button";
    btn.setAttribute("aria-label",row.subj+" "+row.topic+" konusunu aç");
    btn.addEventListener("click",()=>openTopic(row));
    card.append(main,stateLine,btn);
    return card;
  };
  let signature="",rowsSignature="";
  const sync=()=>{
    if(!parent.open)return;
    const reader=(window as GapTrackingWindow).yksTodayInsightsSnapshot;
    if(typeof reader!=="function"){set(headline,"Veri hazırlanıyor");return;}
    let snapshot:GapTrackingSnapshot;
    try{snapshot=reader();}
    catch(error){console.error("Eksik kapatma takibi alınamadı",error);set(headline,"Veri alınamadı");return;}
    const result=snapshot?.tracker;
    if(!result||!Array.isArray(result.rows)){set(headline,"Veri hazırlanıyor");return;}
    const headerSignature=JSON.stringify([result.total,result.open,result.working,result.verified]);
    if(signature!==headerSignature){
      signature=headerSignature;
      set(headline,result.total?result.total+" eksik · "+result.verified+" pekişti":"Kayıt bulunamadı");
    }
    if(!holder.open)return;
    counters.replaceChildren(...labels([
      ["Açık / yeniden kontrol",result.open],
      ["Çalışılıyor",result.working],
      ["Pekiştirildi",result.verified]
    ]));
    const next=JSON.stringify([snapshot.date,result.rows]);
    if(next===rowsSignature)return;
    rowsSignature=next;
    if(!result.total){
      list.replaceChildren(make("p","today-gap-empty",
        "Takip edilecek kayıtlı eksik yok. Konu durumları ve yanlışlar eklendikçe burada görünür."));
      return;
    }
    const items=result.rows.map(rowCard);
    if(result.total>result.rows.length)
      items.push(make("p","today-gap-more","+"+(result.total-result.rows.length)+" kayıt daha · Tüm konuları Konular ekranından inceleyebilirsin."));
    list.replaceChildren(...items);
  };
  holder.addEventListener("toggle",sync);
  parent.addEventListener("toggle",sync);
  window.addEventListener("yks:data-changed",sync);
  document.addEventListener("yks:navigation-after",sync);
  document.addEventListener("visibilitychange",()=>{
    if(document.visibilityState==="visible")sync();
  });
  if(parent.open)sync();
  return{installed:true};
}
