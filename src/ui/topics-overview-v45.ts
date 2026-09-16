type TopicSortMode="curriculum"|"remaining"|"progress"|"name";

const SUBJECT_LIST_ID="subjectList";
const POLISHED_ATTR="data-v45-topics";

function textWithoutNested(node:Element|null):string{
  if(!node)return "Ders";
  const clone=node.cloneNode(true) as HTMLElement;
  clone.querySelectorAll("small,.subj-sub").forEach(child=>child.remove());
  return (clone.textContent||"Ders").trim();
}

function parseProgress(card:HTMLElement):{done:number;total:number;pct:number}{
  const text=card.querySelector<HTMLElement>(".subj-head .pct")?.textContent||"";
  const ratio=text.match(/(\d+)\s*\/\s*(\d+)/);
  const percent=text.match(/%(\d+)/);
  return {
    done:ratio?Number(ratio[1]):0,
    total:ratio?Number(ratio[2]):0,
    pct:percent?Number(percent[1]):0
  };
}

function stateCounts(card:HTMLElement):{working:number;done:number}{
  const rows=[...card.querySelectorAll<HTMLElement>(".topics>.topic")];
  let working=0,done=0;
  rows.forEach(row=>{
    if(row.querySelector(".topic-state.s3"))done++;
    else if(row.querySelector(".topic-state.s1,.topic-state.s2"))working++;
  });
  return {working,done};
}

function topicNames(card:HTMLElement):string[]{
  return [...card.querySelectorAll<HTMLElement>(".topics>.topic .topic-name-btn")]
    .map(button=>(button.childNodes[0]?.textContent||button.textContent||"").trim())
    .filter(Boolean);
}

function syncExpanded(card:HTMLElement):void{
  const topics=card.querySelector<HTMLElement>(":scope>.topics");
  const open=!!topics?.classList.contains("open");
  card.classList.toggle("is-expanded",open);
  const button=card.querySelector<HTMLButtonElement>(".v45-subject-open");
  if(button){
    button.setAttribute("aria-expanded",String(open));
    const label=button.querySelector<HTMLElement>("span");
    if(label)label.textContent=open?"Konuları kapat":"Konuları aç";
  }
}

function toggleCard(card:HTMLElement,force?:boolean):void{
  const list=card.closest<HTMLElement>(`#${SUBJECT_LIST_ID}`);
  const topics=card.querySelector<HTMLElement>(":scope>.topics");
  if(!topics)return;
  const next=typeof force==="boolean"?force:!topics.classList.contains("open");
  if(next&&list){
    list.querySelectorAll<HTMLElement>(".subj.is-expanded").forEach(other=>{
      if(other===card)return;
      other.querySelector<HTMLElement>(":scope>.topics")?.classList.remove("open");
      syncExpanded(other);
    });
  }
  topics.classList.toggle("open",next);
  syncExpanded(card);
  if(next)card.scrollIntoView({block:"start",behavior:"smooth"});
}

function makeSummary(card:HTMLElement):HTMLElement{
  const progress=parseProgress(card);
  const states=stateCounts(card);
  const names=topicNames(card);
  const summary=document.createElement("div");
  summary.className="v45-subject-summary";

  const stats=document.createElement("div");
  stats.className="v45-subject-stats";
  const remaining=Math.max(0,progress.total-progress.done);
  stats.innerHTML=`<span><b>${remaining}</b><small>Kalan konu</small></span><span><b>${states.working}</b><small>Çalışılıyor</small></span><span><b>${progress.pct}%</b><small>İlerleme</small></span>`;

  const preview=document.createElement("div");
  preview.className="v45-topic-preview";
  const heading=document.createElement("div");
  heading.className="v45-topic-preview-head";
  heading.innerHTML=`<span>${names.length?"Konu önizleme":"Konu bulunamadı"}</span><small>${progress.total||names.length} konu</small>`;
  preview.appendChild(heading);

  const previewRows=document.createElement("div");
  previewRows.className="v45-topic-preview-list";
  names.slice(0,3).forEach((name,index)=>{
    const button=document.createElement("button");
    button.type="button";
    button.className="v45-topic-preview-row";
    button.innerHTML=`<span>${index+1}</span><b></b><i>›</i>`;
    const title=button.querySelector<HTMLElement>("b");
    if(title)title.textContent=name;
    button.addEventListener("click",event=>{
      event.stopPropagation();
      const source=[...card.querySelectorAll<HTMLButtonElement>(".topics>.topic .topic-name-btn")]
        .find(item=>(item.childNodes[0]?.textContent||item.textContent||"").trim()===name);
      source?.click();
    });
    previewRows.appendChild(button);
  });
  preview.appendChild(previewRows);

  const open=document.createElement("button");
  open.type="button";
  open.className="v45-subject-open";
  open.setAttribute("aria-expanded","false");
  open.innerHTML=`<span>Konuları aç</span><b>${names.length||progress.total} konu</b>`;
  open.addEventListener("click",event=>{
    event.stopPropagation();
    toggleCard(card);
  });

  summary.append(stats,preview,open);
  return summary;
}

function addDetailHead(card:HTMLElement):void{
  const topics=card.querySelector<HTMLElement>(":scope>.topics");
  if(!topics||topics.querySelector(":scope>.v45-subject-detail-head"))return;
  const subject=textWithoutNested(card.querySelector(".subj-head .nm"));
  const head=document.createElement("div");
  head.className="v45-subject-detail-head";
  const copy=document.createElement("div");
  copy.innerHTML="<small>Ders detayları</small><b></b><span>Durum, güven, risk ve tekrar bilgilerini buradan yönetebilirsin.</span>";
  const title=copy.querySelector<HTMLElement>("b");
  if(title)title.textContent=subject;
  const close=document.createElement("button");
  close.type="button";
  close.className="v45-subject-detail-close";
  close.textContent="Kapat";
  close.addEventListener("click",event=>{
    event.stopPropagation();
    toggleCard(card,false);
  });
  head.append(copy,close);
  topics.prepend(head);
}

function polishCard(card:HTMLElement,index:number):void{
  card.dataset.v45CurriculumOrder=String(index);
  if(!card.hasAttribute(POLISHED_ATTR)){
    card.setAttribute(POLISHED_ATTR,"ready");
    const topics=card.querySelector<HTMLElement>(":scope>.topics");
    if(topics){
      const summary=makeSummary(card);
      card.insertBefore(summary,topics);
      addDetailHead(card);
    }
  }
  syncExpanded(card);
}

function sortCards(list:HTMLElement,mode:TopicSortMode):void{
  const cards=[...list.querySelectorAll<HTMLElement>(":scope>.subj")];
  const sorted=[...cards].sort((a,b)=>{
    if(mode==="curriculum")return Number(a.dataset.v45CurriculumOrder||0)-Number(b.dataset.v45CurriculumOrder||0);
    const ap=parseProgress(a),bp=parseProgress(b);
    if(mode==="remaining")return (bp.total-bp.done)-(ap.total-ap.done)||ap.pct-bp.pct;
    if(mode==="progress")return bp.pct-ap.pct;
    const an=textWithoutNested(a.querySelector(".subj-head .nm"));
    const bn=textWithoutNested(b.querySelector(".subj-head .nm"));
    return an.localeCompare(bn,"tr");
  });
  sorted.forEach(card=>list.appendChild(card));
}

function installSortControl(onChange:(mode:TopicSortMode)=>void):void{
  const tools=document.querySelector<HTMLElement>("#topics .v26-topic-tools");
  if(!tools||tools.querySelector(".v45-topic-sort"))return;
  const wrap=document.createElement("div");
  wrap.className="v45-topic-sort";
  const label=document.createElement("label");
  label.htmlFor="v45TopicSort";
  label.textContent="Dersleri sırala";
  const select=document.createElement("select");
  select.id="v45TopicSort";
  select.innerHTML='<option value="curriculum">Müfredat sırası</option><option value="remaining">En çok kalan</option><option value="progress">İlerlemesi yüksek</option><option value="name">A–Z</option>';
  select.addEventListener("change",()=>onChange(select.value as TopicSortMode));
  wrap.append(label,select);
  const info=tools.querySelector("#searchInfo");
  tools.insertBefore(wrap,info||null);
}

export function installTopicsOverviewV45():{installed:boolean;destroy:()=>void}{
  const list=document.getElementById(SUBJECT_LIST_ID);
  if(!(list instanceof HTMLElement))return {installed:false,destroy:()=>{}};
  let sortMode:TopicSortMode="curriculum";
  let queued=false;
  let mutating=false;

  const polish=()=>{
    if(mutating)return;
    mutating=true;
    const cards=[...list.querySelectorAll<HTMLElement>(":scope>.subj")];
    cards.forEach((card,index)=>polishCard(card,index));
    sortCards(list,sortMode);
    document.documentElement.dataset.topicsOverview="ready";
    mutating=false;
  };
  const schedule=()=>{
    if(queued)return;
    queued=true;
    requestAnimationFrame(()=>{queued=false;polish();});
  };

  installSortControl(mode=>{sortMode=mode;polish();});
  polish();

  const observer=new MutationObserver(records=>{
    if(mutating)return;
    if(records.some(record=>record.type==="childList"))schedule();
  });
  observer.observe(list,{childList:true,subtree:true});

  list.addEventListener("click",event=>{
    const card=(event.target as Element|null)?.closest<HTMLElement>(".subj");
    if(card)requestAnimationFrame(()=>syncExpanded(card));
  });

  window.addEventListener("yks:data-changed",schedule);
  return {installed:true,destroy:()=>observer.disconnect()};
}
