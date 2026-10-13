/* Today v41: compact presentation of existing daily study data.
   Data owner stays the legacy app; this module never persists anything. */
type SubjectV41={name:string;min:number};
type SnapshotV41={
  date:string;focusMin:number;solved:number;focusGoal:number;questionGoal:number;
  subjects:SubjectV41[];labeledMin:number;unassignedMin:number;
  basisMin:number;hasMismatch:boolean;
};
type TodaySubjectWindowV41=Window&{yksTodaySubjectSnapshot?:()=>SnapshotV41};

export function installTodaySubjectsV41():{installed:boolean}{
  const root=document.getElementById("todayFreshSubjects");
  const chart=document.getElementById("todayFreshSubjectsBar");
  const rows=document.getElementById("todayFreshSubjectsRows");
  const summary=document.getElementById("todayFreshSubjectsSummary");
  const note=document.getElementById("todayFreshSubjectsNote");
  const metricFocus=document.getElementById("todayFreshStatFocus");
  const metricFocusSub=document.getElementById("todayFreshStatFocusSub");
  const metricQuestions=document.getElementById("todayFreshStatQuestions");
  const metricQuestionsSub=document.getElementById("todayFreshStatQuestionsSub");
  const metricCount=document.getElementById("todayFreshStatSubjectCount");
  const metricCountSub=document.getElementById("todayFreshStatSubjectCountSub");
  if(!root||!chart||!rows||!summary||!note||!metricFocus||!metricFocusSub||
     !metricQuestions||!metricQuestionsSub||!metricCount||!metricCountSub)return{installed:false};
  if(root.dataset.subjectsReady==="true")return{installed:true};

  const minValue=(n:number)=>Math.max(0,Math.round(Number(n)||0));
  const fmt=(n:number)=>{
    const m=minValue(n),h=Math.floor(m/60),rem=m%60;
    return h?(rem?h+" sa "+rem+" dk":h+" sa"):m+" dk";
  };
  const percent=(n:number,g:number)=>g?Math.min(100,Math.round(minValue(n)/g*100)):0;
  const el=(tag:string,className:string,value?:string)=>{
    const node=document.createElement(tag);node.className=className;
    if(value!==undefined)node.textContent=value;
    return node;
  };
  const set=(node:Element,value:string)=>{
    if(node.textContent!==value)node.textContent=value;
  };
  let prior="";
  const sync=()=>{
    const read=(window as TodaySubjectWindowV41).yksTodaySubjectSnapshot;
    if(typeof read!=="function"){
      set(summary,"Çalışma kayıtları hazırlanıyor…");
      return;
    }
    let info:SnapshotV41;
    try{info=read();}catch(error){
      console.error("Günlük ders dağılımı alınamadı",error);
      set(summary,"Çalışma verileri görüntülenemiyor.");
      return;
    }
    if(!info||!Array.isArray(info.subjects))return;
    const subjects=info.subjects.filter(s=>s&&minValue(s.min)>0)
      .sort((a,b)=>minValue(b.min)-minValue(a.min));
    const focus=minValue(info.focusMin),solved=minValue(info.solved);
    const focusGoal=minValue(info.focusGoal),questionGoal=minValue(info.questionGoal);
    const labeled=subjects.reduce((sum,s)=>sum+minValue(s.min),0);
    const other=Math.max(0,focus-labeled);
    const basis=Math.max(focus,labeled);
    set(metricFocus,fmt(focus));
    set(metricQuestions,String(solved));
    set(metricCount,String(subjects.length));
    set(metricFocusSub,focusGoal
      ?"%"+percent(focus,focusGoal)+" odak hedefi"
      :"Odak hedefi yok");
    set(metricQuestionsSub,questionGoal
      ?"%"+percent(solved,questionGoal)+" soru hedefi"
      :"Soru hedefi yok");
    set(metricCountSub,subjects.length
      ?"En çok: "+(subjects[0]?.name||"Ders")
      :"Henüz ders etiketi yok");
    set(summary,subjects.length?subjects.length+" ders · "+fmt(labeled)+" etiketli":
      focus>0?"Ders belirtilmemiş":"Henüz çalışma kaydı yok");
    set(note,labeled>focus
      ?"Ders süreleri toplam odak süresinden fazla. Eski kayıtlar arasında fark olabilir."
      :other>0?"Ders seçilmeden kaydedilen "+fmt(other)+" odak süresi de gösteriliyor."
      :"Veriler kayıtlı odak ve soru bilgilerinden alınır.");

    // Render a proportional stacked bar from the authoritative tagged data.
    // No fabricated time or double counting: unknown focus gets its own slice.
    const signature=JSON.stringify([info.date,subjects.map(s=>[s.name,s.min]),focus,solved,focusGoal,questionGoal]);
    if(signature===prior&&rows.dataset.rendered==="true")return;
    prior=signature;
    rows.dataset.rendered="true";
    if(!basis){
      chart.replaceChildren();
      rows.replaceChildren(el("p","today-fresh-subject-empty",
        "Bugün çalışma kaydı yok. Odak ekranından ders seçerek başlayabilirsin."));
      return;
    }
    const top=subjects.slice(0,4).map(s=>({name:s.name,min:minValue(s.min)}));
    const remaining=subjects.slice(4).reduce((sum,s)=>sum+minValue(s.min),0);
    if(remaining)top.push({name:"Diğer "+(subjects.length-4)+" ders",min:remaining});
    if(other)top.push({name:"Ders belirtilmedi",min:other});
    const segments=top.map((s,i)=>{
      const segment=el("span","today-fresh-subject-segment color-"+(i%6));
      segment.style.width=(s.min/basis*100).toFixed(3)+"%";
      segment.setAttribute("title",s.name+": "+fmt(s.min));
      return segment;
    });
    chart.replaceChildren(...segments);
    chart.setAttribute("aria-label","Odak dağılımı: "+top.map(s=>s.name+" "+fmt(s.min)).join(", "));
    const items=top.map((s,i)=>{
      const item=el("div","today-fresh-subject-row");
      const dot=el("span","today-fresh-subject-dot color-"+(i%6));
      const name=el("span","today-fresh-subject-name",s.name);
      const time=el("strong","today-fresh-subject-time",fmt(s.min));
      const ratio=el("small","today-fresh-subject-ratio","%"+Math.round(s.min/basis*100));
      item.append(dot,name,time,ratio);
      return item;
    });
    rows.replaceChildren(...items);
  };
  window.addEventListener("yks:data-changed",sync);
  window.addEventListener("load",sync);
  document.addEventListener("yks:navigation-after",sync);
  document.addEventListener("visibilitychange",()=>{
    if(document.visibilityState==="visible")sync();
  });
  sync();
  root.dataset.subjectsReady="true";
  return{installed:true};
}
