/* Bugün v42 / evidence-only review and gap cards.
   Uses existing scheduler, topic records, coach-safe persistence actions. */
type DueV42={key:string;exam:string;subj:string;topic:string;gi:number;gap:number;late:number};
type GapV42={key:string;exam:string;subj:string;topic:string;wrong:number;last:string;stage:number;confidence:number;reasons:string[]};
type SnapshotV42={date:string;dueCount:number;overdueCount:number;due:DueV42[];gapCount:number;gaps:GapV42[]};
type InsightWindowV42=Window&{
  yksTodayInsightsSnapshot?:()=>SnapshotV42;
  yksTodayInsightsCompleteReview?:(key:string,gi:number)=>boolean;
  yksTodayInsightsOpenTopic?:(exam:string,subj:string,topic:string)=>boolean;
  go?:(page:string)=>unknown;
};

export function installTodayInsightsV42():{installed:boolean}{
  const root=document.getElementById("todayFreshInsights");
  const dueList=document.getElementById("todayFreshDueList");
  const gapsList=document.getElementById("todayFreshGapsList");
  const dueCount=document.getElementById("todayFreshDueCount");
  const gapCount=document.getElementById("todayFreshGapCount");
  const all=document.getElementById("todayFreshInsightsAll") as HTMLButtonElement|null;
  if(!root||!dueList||!gapsList||!dueCount||!gapCount||!all)return{installed:false};
  if(root.dataset.insightsReady==="true")return{installed:true};

  const text=(node:Element,value:string)=>{
    if(node.textContent!==value)node.textContent=value;
  };
  const make=(tag:string,className:string,content?:string)=>{
    const node=document.createElement(tag);node.className=className;
    if(content!==undefined)node.textContent=content;
    return node;
  };
  const navigate=()=>{
    const go=(window as InsightWindowV42).go;
    if(typeof go==="function")go("topics");
  };
  all.addEventListener("click",navigate);
  let lastDue="",lastGaps="";
  const sync=()=>{
    const read=(window as InsightWindowV42).yksTodayInsightsSnapshot;
    if(typeof read!=="function"){
      text(dueCount,"Hazırlanıyor");
      return;
    }
    let snapshot:SnapshotV42;
    try{snapshot=read();}catch(error){
      console.error("Bugün tekrar ve eksik analizi alınamadı",error);
      text(dueCount,"Veri alınamadı");
      return;
    }
    if(!snapshot||!Array.isArray(snapshot.due)||!Array.isArray(snapshot.gaps))return;
    text(dueCount,snapshot.dueCount
      ?snapshot.dueCount+" konu"+(snapshot.overdueCount?" · "+snapshot.overdueCount+" gecikmiş":"")
      :"Bekleyen tekrar yok");
    text(gapCount,snapshot.gapCount?snapshot.gapCount+" kayıtlı eksik":"Eksik kaydı yok");
    const signatureDue=JSON.stringify([snapshot.date,snapshot.due]);
    if(signatureDue!==lastDue||dueList.dataset.rendered!=="true"){
      lastDue=signatureDue;dueList.dataset.rendered="true";
      const items=snapshot.due.map(item=>{
        const row=make("div","today-fresh-insight-row");
        const copy=make("div","today-fresh-insight-copy");
        const title=make("strong","today-fresh-insight-title",item.topic);
        const subject=make("small","today-fresh-insight-sub",item.exam+" · "+item.subj);
        const reason=make("small","today-fresh-insight-reason",
          item.gap+". gün tekrarı"+(item.late>0?" · "+item.late+" gün gecikmiş":" · bugün"));
        copy.append(title,subject,reason);
        const actions=make("div","today-fresh-insight-actions");
        const done=make("button","today-fresh-insight-done","Yaptım") as HTMLButtonElement;
        done.type="button";
        done.setAttribute("aria-label",item.subj+" "+item.topic+" tekrarını tamamla");
        done.addEventListener("click",()=>{
          const api=(window as InsightWindowV42).yksTodayInsightsCompleteReview;
          if(typeof api==="function"&&api(item.key,item.gi))sync();
        });
        actions.append(done);
        row.append(copy,actions);
        return row;
      });
      if(!items.length)items.push(make("p","today-fresh-insight-empty",
        "Bugün veya gecikmiş durumda bekleyen tekrar bulunmuyor."));
      if(snapshot.dueCount>snapshot.due.length)
        items.push(make("p","today-fresh-insight-more",
          "+"+(snapshot.dueCount-snapshot.due.length)+" konu daha · Konular'da"));
      dueList.replaceChildren(...items);
    }

    const signatureGaps=JSON.stringify([snapshot.date,snapshot.gaps]);
    if(signatureGaps!==lastGaps||gapsList.dataset.rendered!=="true"){
      lastGaps=signatureGaps;gapsList.dataset.rendered="true";
      const items=snapshot.gaps.map(item=>{
        const row=make("div","today-fresh-insight-row");
        const copy=make("div","today-fresh-insight-copy");
        const title=make("strong","today-fresh-insight-title",item.topic);
        const subject=make("small","today-fresh-insight-sub",item.exam+" · "+item.subj);
        const reason=make("small","today-fresh-insight-reason",item.reasons.join(" · "));
        copy.append(title,subject,reason);
        const actions=make("div","today-fresh-insight-actions");
        const detail=make("button","today-fresh-insight-detail","Detay") as HTMLButtonElement;
        detail.type="button";
        detail.setAttribute("aria-label",item.subj+" "+item.topic+" konu detayını aç");
        detail.addEventListener("click",()=>{
          const api=(window as InsightWindowV42).yksTodayInsightsOpenTopic;
          if(typeof api==="function")api(item.exam,item.subj,item.topic);
          else navigate();
        });
        actions.append(detail);
        row.append(copy,actions);
        return row;
      });
      if(!items.length)items.push(make("p","today-fresh-insight-empty",
        "Konu takibi veya yanlış kayıtlarından belirlenmiş eksik yok."));
      if(snapshot.gapCount>snapshot.gaps.length)
        items.push(make("p","today-fresh-insight-more",
          "+"+(snapshot.gapCount-snapshot.gaps.length)+" kayıt daha · Konular'da"));
      gapsList.replaceChildren(...items);
    }
  };
  window.addEventListener("yks:data-changed",sync);
  window.addEventListener("load",sync);
  document.addEventListener("visibilitychange",()=>{
    if(document.visibilityState==="visible")sync();
  });
  document.addEventListener("yks:navigation-after",sync);
  sync();
  root.dataset.insightsReady="true";
  return{installed:true};
}
