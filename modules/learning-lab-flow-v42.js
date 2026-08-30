/* YKS Defterim · v4.2 Aşama 6 · Öğrenme Laboratuvarı 2.0 kullanım akışı
   Favorilere hızlı erişim, kaldığın yere dönüş ve Atlas → konu rehberi köprüsü.
   3B içerik yalnız kullanıcı Atlas/organı açtığında yüklenir. Program verisine dokunmaz. */
(function(root,factory){
  const api=factory();
  if(typeof module!=="undefined"&&module.exports)module.exports=api;
  root.YKSLearningLabFlowV42=api;
  if(root&&root.document)api.install(root);
})(typeof globalThis!=="undefined"?globalThis:this,function(){
  "use strict";
  const VERSION="2.0.0",STATE_KEY="flowV42",MAX_RECENT=12,QUICK_LIMIT=8;
  const ORGAN_TOPIC={
    heart:{name:"Kalp",topic:"Dolaşım-Bağışıklık"},
    brain:{name:"Beyin",topic:"Sinir Sistemi"},
    lungs:{name:"Akciğer",topic:"Solunum"},
    liver:{name:"Karaciğer",topic:"Sindirim"},
    kidneys:{name:"Böbrek",topic:"Boşaltım"},
    eyeball:{name:"Göz",topic:"Duyu Organları"},
    intestine:{name:"Bağırsak",topic:"Sindirim"},
    pancreas:{name:"Pankreas",topic:"Endokrin Sistem"},
    skin:{name:"Deri",topic:"Duyu Organları"}
  };
  const text=value=>String(value==null?"":value).trim();
  const num=(value,fallback=0)=>Number.isFinite(Number(value))?Number(value):fallback;
  const allowedType=value=>["topic","organ","science","element","timeline"].includes(value)?value:"";
  function cleanItem(raw){
    if(!raw||typeof raw!=="object"||Array.isArray(raw))return null;
    const type=allowedType(text(raw.type)),key=text(raw.key).slice(0,180),label=text(raw.label).slice(0,160),meta=text(raw.meta).slice(0,180),at=Math.max(0,Math.trunc(num(raw.at)));
    if(!type||!key||!label)return null;
    return {type,key,label,meta,at,exam:text(raw.exam).slice(0,8),subject:text(raw.subject).slice(0,100),topic:text(raw.topic).slice(0,140),organ:text(raw.organ).slice(0,40),structure:text(raw.structure).slice(0,80),card:text(raw.card).slice(0,120),value:text(raw.value).slice(0,120)};
  }
  function normalizeFlow(value){
    const raw=value&&typeof value==="object"&&!Array.isArray(value)?value:{},seen=new Set(),recent=[];
    for(const item of (Array.isArray(raw.recent)?raw.recent:[])){
      const clean=cleanItem(item);if(!clean)continue;const id=clean.type+"|"+clean.key;if(seen.has(id))continue;seen.add(id);recent.push(clean);if(recent.length>=MAX_RECENT)break;
    }
    return {version:1,recent};
  }
  function mergeRecent(value,item){
    const flow=normalizeFlow(value),clean=cleanItem(item);if(!clean)return flow;
    const id=clean.type+"|"+clean.key;return {version:1,recent:[clean,...flow.recent.filter(row=>row.type+"|"+row.key!==id)].slice(0,MAX_RECENT)};
  }
  function parseTopicFavorite(value){
    const parts=text(value).split("|");if(parts.length<3)return null;const exam=parts.shift(),subject=parts.shift(),topic=parts.join("|");if(!exam||!subject||!topic)return null;return {exam,subject,topic,key:[exam,subject,topic].join("|")};
  }
  function organCourseTopic(id){const row=ORGAN_TOPIC[text(id)];return row?{id:text(id),name:row.name,exam:"AYT",subject:"Biyoloji (AYT)",topic:row.topic}:null;}
  function snapshotSchedule(state){return JSON.stringify({weeks:state&&state.weeks||{},rows:state&&state.rows||{},rowLabels:state&&state.rowLabels||{}});}
  function prettyCardId(id){
    const known={"bio-heart":"Kalp ve dolaşım","bio-nephron":"Böbrek ve nefron","bio-breathing":"Akciğer ve soluk alma","bio-liver":"Karaciğer ve safra","bio-neuron":"Nöron ve impuls","bio-cell":"Hücre ve organeller","bio-membrane":"Zardan madde geçişi","bio-immunity":"Bağışıklık"};
    if(known[id])return known[id];
    return text(id).replace(/^(bio|phy)-/,"").split("-").filter(Boolean).map(word=>word.charAt(0).toLocaleUpperCase("tr-TR")+word.slice(1)).join(" ")||"Bilim kartı";
  }
  function selfTest(){
    const state={weeks:{w:{manual:true}},rows:{r:2,s:4},rowLabels:{r:["09:00"],s:[]}},before=snapshotSchedule(state);
    let flow=mergeRecent({}, {type:"topic",key:"AYT|Biyoloji (AYT)|Sinir Sistemi",label:"Sinir Sistemi",exam:"AYT",subject:"Biyoloji (AYT)",topic:"Sinir Sistemi",at:2});
    flow=mergeRecent(flow,{type:"topic",key:"AYT|Biyoloji (AYT)|Sinir Sistemi",label:"Sinir Sistemi",at:3});
    const organ=organCourseTopic("heart"),favorite=parseTopicFavorite("TYT|Matematik|Problemler"),after=snapshotSchedule(state);
    return {ok:flow.recent.length===1&&flow.recent[0].at===3&&organ?.topic==="Dolaşım-Bağışıklık"&&favorite?.topic==="Problemler"&&before===after,programUntouched:before===after};
  }

  function install(root){
    if(root.__YKS_LEARNING_LAB_FLOW_V42__)return true;
    const doc=root.document;if(!doc)return false;
    let pending=false,hookAttempts=0,atlasObserver=null;
    const safe=value=>typeof root.esc==="function"?root.esc(text(value)):text(value).replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
    function appState(){try{return root.S&&typeof root.S==="object"?root.S:{};}catch{return {};}}
    function labState(){const state=appState();if(!state.lab||typeof state.lab!=="object"||Array.isArray(state.lab))state.lab={};return state.lab;}
    function flow(){return normalizeFlow(labState()[STATE_KEY]);}
    function persistFlow(next){
      const lab=labState();lab[STATE_KEY]=normalizeFlow(next);
      try{if(typeof root.save==="function")root.save();return true;}catch(error){try{root.infraError?.("learning-lab-flow-v42-save",error);}catch{}return false;}
    }
    function record(item){const next=mergeRecent(flow(),Object.assign({at:Date.now()},item));persistFlow(next);scheduleRender();return true;}
    function currentExam(){for(const exam of ["TYT","AYT","YDT"])if(doc.getElementById("v320Exam"+exam)?.classList.contains("on"))return exam;return "TYT";}
    function curriculum(){try{return root.YKSLearningLab?.curriculum?.()||{};}catch{return {};}}
    function topicItem(exam,subjectIndex,topicIndex){const subjects=curriculum()[exam]||[],subject=subjects[Number(subjectIndex)],topic=subject?.topics?.[Number(topicIndex)];return subject&&topic?{exam,subject:subject.name,topic,subjectIndex:Number(subjectIndex),topicIndex:Number(topicIndex),key:[exam,subject.name,topic].join("|")}:null;}
    function resolveTopic(exam,subject,topic){
      try{return (root.YKSLearningLab?.topicCatalog?.(exam)||[]).find(row=>text(row.subject)===text(subject)&&text(row.topic)===text(topic))||null;}catch{return null;}
    }
    function openLabShell(){try{root.go?.("more");}catch{}try{root.setMoreTab?.("lab");}catch{}return true;}
    function openTopic(exam,subject,topic){
      openLabShell();const go=()=>{try{root.v320SetExam?.(exam);const row=resolveTopic(exam,subject,topic);if(!row)return false;root.v4OpenLabTopic?.(row.subjectIndex,row.topicIndex);doc.getElementById("v320TopicSelection")?.scrollIntoView?.({behavior:"smooth",block:"start"});return true;}catch{return false;}};
      if(go())return true;root.setTimeout(go,180);return true;
    }
    function openOrgan(id,structure){
      openLabShell();try{root.v320SetTab?.("atlas");}catch{}
      let tries=0;const run=()=>{
        tries++;const mode=doc.getElementById("atlasMode-model");if(!mode){if(tries<40)root.setTimeout(run,80);return;}
        if(mode.getAttribute("aria-pressed")!=="true")mode.click();
        const organ=doc.querySelector('[data-atlas-action="organ"][data-id="'+CSS.escape(id)+'"]');if(!organ){if(tries<40)root.setTimeout(run,80);return;}
        organ.click();
        if(structure){let inner=0;const pick=()=>{inner++;const button=doc.querySelector('[data-atlas-structure="'+CSS.escape(structure)+'"]');if(button)button.click();else if(inner<24)root.setTimeout(pick,80);};root.setTimeout(pick,30);}
      };root.setTimeout(run,30);return true;
    }
    function openScience(id,subject){
      openLabShell();try{root.v320SetTab?.("science");}catch{}
      const scienceSubject=subject==="Fizik"||String(id).startsWith("phy-")?"Fizik":"Biyoloji";let tries=0;
      const run=()=>{tries++;try{root.v4SetScienceSubject?.(scienceSubject);root.YKSScienceCards?.setSubject?.(scienceSubject);}catch{}const card=doc.querySelector('[data-card="'+CSS.escape(id)+'"]');if(card){card.scrollIntoView?.({behavior:"smooth",block:"center"});card.querySelector("button")?.focus?.({preventScroll:true});}else if(tries<20)root.setTimeout(run,80);};root.setTimeout(run,30);return true;
    }
    function openElement(value){openLabShell();try{root.v320SetTab?.("periodic");root.v320SelectElement?.(Number(value));}catch{}root.setTimeout(()=>doc.getElementById("v320ElementDetail")?.scrollIntoView?.({behavior:"smooth",block:"center"}),70);return true;}
    function openTimeline(value){openLabShell();try{root.v320SetTab?.("timeline");}catch{}root.setTimeout(()=>{const rows=[...doc.querySelectorAll("#v320Timeline .v320-event")],target=rows.find(row=>(row.textContent||"").includes(text(value)));target?.scrollIntoView?.({behavior:"smooth",block:"center"});},80);return true;}
    function openItem(item){if(!item)return false;if(item.type==="topic")return openTopic(item.exam,item.subject,item.topic);if(item.type==="organ")return openOrgan(item.organ||item.key,item.structure);if(item.type==="science")return openScience(item.card||item.key,item.subject);if(item.type==="element")return openElement(item.value||item.key);if(item.type==="timeline")return openTimeline(item.value||item.label);return false;}
    function favorites(){
      const lab=labState(),out=[];
      for(const raw of (Array.isArray(lab.topicFav)?lab.topicFav:[])){const row=parseTopicFavorite(raw);if(row)out.push({type:"topic",key:row.key,label:row.topic,meta:row.exam+" · "+row.subject,exam:row.exam,subject:row.subject,topic:row.topic});}
      const science=lab.scienceCards&&typeof lab.scienceCards==="object"&&!Array.isArray(lab.scienceCards)?lab.scienceCards:{};
      for(const [id,value] of Object.entries(science))if(value&&typeof value==="object"&&value.favorite)out.push({type:"science",key:id,card:id,label:prettyCardId(id),meta:(id.startsWith("phy-")?"Fizik":"Biyoloji")+" · bilim kartı",subject:id.startsWith("phy-")?"Fizik":"Biyoloji"});
      const elements=root.YKSLearningLab?.elements||[];for(const n of (Array.isArray(lab.elementFav)?lab.elementFav:[])){const row=elements.find?.(x=>Number(x.n)===Number(n));out.push({type:"element",key:String(n),value:String(n),label:row?.name||("Element "+n),meta:"Periyodik tablo · favori"});}
      const timeline=root.YKSLearningLab?.timeline||[];for(const id of (Array.isArray(lab.timelineFav)?lab.timelineFav:[])){const row=timeline.find?.(x=>String(x.id)===String(id));if(row)out.push({type:"timeline",key:String(id),value:row.title,label:row.title,meta:row.year+" · "+row.era});}
      return out.slice(0,QUICK_LIMIT);
    }
    function ensurePanel(){
      const lab=doc.getElementById("v320LearningLab");if(!lab)return null;let box=doc.getElementById("v42LabFlow");if(box)return box;
      box=doc.createElement("section");box.id="v42LabFlow";box.className="v42-lab-flow";box.setAttribute("aria-label","Laboratuvar hızlı erişim");
      const head=lab.querySelector(".v320-head");if(head)head.insertAdjacentElement("afterend",box);else lab.prepend(box);return box;
    }
    function icon(type){return type==="topic"?"◎":type==="organ"?"◉":type==="science"?"◆":type==="element"?"◌":"↗";}
    function card(item,kind,index){return '<button type="button" class="v42-lab-chip" data-flow-kind="'+safe(kind)+'" data-flow-index="'+index+'"><span aria-hidden="true">'+icon(item.type)+'</span><span><b>'+safe(item.label)+'</b><small>'+safe(item.meta||item.type)+'</small></span><i>›</i></button>';}
    function render(){
      const box=ensurePanel();if(!box)return false;const recent=flow().recent.slice(0,4),fav=favorites();
      box.__flowRecent=recent;box.__flowFavorites=fav;
      box.innerHTML='<div class="v42-lab-flow-head"><div><span>HIZLI DÖNÜŞ</span><b>Kaldığın yer ve favorilerin</b></div><small>3B içerik yalnız açtığında yüklenir</small></div>'+
        '<div class="v42-lab-flow-grid"><section><h3>Kaldığın yer</h3><div class="v42-lab-flow-list">'+(recent.length?recent.map((item,index)=>card(item,"recent",index)).join(""):'<p class="v42-lab-empty">Bir konu, organ veya bilim kartı açtığında burada görünür.</p>')+'</div></section><section><h3>Favoriler</h3><div class="v42-lab-flow-list">'+(fav.length?fav.map((item,index)=>card(item,"favorite",index)).join(""):'<p class="v42-lab-empty">★ ile işaretlediğin konu ve kartlara buradan dönebilirsin.</p>')+'</div></section></div>';
      box.onclick=event=>{const button=event.target instanceof root.Element?event.target.closest("[data-flow-kind]"):null;if(!button||!box.contains(button))return;const list=button.dataset.flowKind==="favorite"?box.__flowFavorites:box.__flowRecent,item=list?.[Number(button.dataset.flowIndex)];if(item){openItem(item);record(item);}};
      return true;
    }
    function injectStyle(){
      if(doc.getElementById("v42LabFlowStyle"))return;const style=doc.createElement("style");style.id="v42LabFlowStyle";style.textContent=`
#mrp_lab .v42-lab-flow{margin:0 0 14px;padding:15px;border:1px solid color-mix(in srgb,var(--accent) 14%,var(--glass-line));border-radius:18px;background:linear-gradient(145deg,color-mix(in srgb,var(--glass) 97%,transparent),color-mix(in srgb,var(--fill) 91%,transparent))}
#mrp_lab .v42-lab-flow-head{display:flex;justify-content:space-between;align-items:end;gap:12px;margin-bottom:11px}.v42-lab-flow-head span,.v42-lab-flow-head b{display:block}.v42-lab-flow-head span{font-size:9px;font-weight:850;letter-spacing:.07em;color:var(--accent)}.v42-lab-flow-head b{margin-top:2px;font-size:16px}.v42-lab-flow-head small{font-size:9.5px;color:var(--label-3)}
#mrp_lab .v42-lab-flow-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:11px}.v42-lab-flow-grid section{min-width:0}.v42-lab-flow-grid h3{margin:0 0 7px;font-size:10px;text-transform:uppercase;letter-spacing:.04em;color:var(--label-3)}.v42-lab-flow-list{display:grid;gap:6px}.v42-lab-chip{width:100%;min-height:48px;display:grid;grid-template-columns:26px minmax(0,1fr) 14px;gap:7px;align-items:center;padding:8px 9px;border:1px solid var(--glass-line);border-radius:12px;background:color-mix(in srgb,var(--glass) 76%,var(--fill));color:var(--label-1);text-align:left;cursor:pointer}.v42-lab-chip>span:first-child{display:grid;place-items:center;width:26px;height:26px;border-radius:8px;background:var(--accent-soft);color:var(--accent);font-weight:850}.v42-lab-chip b,.v42-lab-chip small{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.v42-lab-chip b{font-size:11px}.v42-lab-chip small{margin-top:2px;font-size:9px;color:var(--label-3)}.v42-lab-chip i{font-style:normal;color:var(--label-3)}.v42-lab-empty{margin:0;padding:11px;border:1px dashed var(--glass-line);border-radius:12px;color:var(--label-3);font-size:10px;line-height:1.4}
#v320PanelAtlas .v42-atlas-course-link{margin-left:6px;border:1px solid color-mix(in srgb,var(--accent) 30%,var(--glass-line));border-radius:10px;background:var(--accent-soft);color:var(--accent);padding:7px 9px;font-size:10px;font-weight:820;cursor:pointer}#v320PanelAtlas #atlasStructureInfo .v42-atlas-course-link{display:block;width:100%;margin:10px 0 0;min-height:38px}
.v42-lab-chip:focus-visible,#v320PanelAtlas .v42-atlas-course-link:focus-visible{outline:3px solid color-mix(in srgb,var(--accent) 36%,transparent);outline-offset:2px}
@media(hover:hover) and (pointer:fine){.v42-lab-chip{transition:transform .15s ease,border-color .15s ease}.v42-lab-chip:hover{transform:translateY(-1px);border-color:color-mix(in srgb,var(--accent) 22%,var(--glass-line))}}
@media(max-width:720px){#mrp_lab .v42-lab-flow-grid{grid-template-columns:1fr}.v42-lab-flow-head{align-items:flex-start!important;flex-direction:column}.v42-lab-chip{min-height:50px}}
@media(pointer:coarse){.v42-lab-chip{min-height:52px}#v320PanelAtlas .v42-atlas-course-link{min-height:44px}}
@media(prefers-reduced-motion:reduce){.v42-lab-chip{transition:none!important;scroll-behavior:auto!important}}`;
      doc.head.appendChild(style);
    }
    function decorateAtlas(){
      const panel=doc.getElementById("v320PanelAtlas");if(!panel)return;const name=text(panel.querySelector(".atlas-lesson-head h3")?.textContent),organId=Object.keys(ORGAN_TOPIC).find(id=>ORGAN_TOPIC[id].name===name);if(!organId)return;
      const header=panel.querySelector(".atlas-lesson-head");if(header&&!header.querySelector(".v42-atlas-course-link")){const button=doc.createElement("button");button.type="button";button.className="v42-atlas-course-link";button.textContent="AYT konu rehberi ↗";button.dataset.organ=organId;button.addEventListener("click",()=>openCourseTopicByOrgan(organId));header.appendChild(button);}
      const info=doc.getElementById("atlasStructureInfo");if(info&&!info.querySelector(".v42-atlas-course-link")){const button=doc.createElement("button");button.type="button";button.className="v42-atlas-course-link";button.textContent="Bu yapının konu rehberini aç ↗";button.addEventListener("click",()=>openCourseTopicByOrgan(organId));info.appendChild(button);}
    }
    function openCourseTopicByOrgan(id){const target=organCourseTopic(id);if(!target)return false;record({type:"topic",key:[target.exam,target.subject,target.topic].join("|"),label:target.topic,meta:"Atlas · "+target.name,exam:target.exam,subject:target.subject,topic:target.topic});return openTopic(target.exam,target.subject,target.topic);}
    function scheduleRender(){if(pending)return;pending=true;const run=()=>{pending=false;render();decorateAtlas();};if(typeof root.requestAnimationFrame==="function")root.requestAnimationFrame(run);else root.setTimeout(run,0);}
    function hook(name,after){const original=root[name];if(typeof original!=="function"||original.__labFlowV42Wrapped)return false;const wrapped=function(){const args=[...arguments],before=currentExam(),result=original.apply(this,arguments);try{after(args,before,result);}catch{}return result;};wrapped.__labFlowV42Wrapped=true;root[name]=wrapped;return true;}
    function installHooks(){
      hook("v4OpenLabTopic",([subjectIndex,topicIndex],exam,result)=>{if(result===false)return;const row=topicItem(exam,subjectIndex,topicIndex);if(row)record({type:"topic",key:row.key,label:row.topic,meta:row.exam+" · "+row.subject,exam:row.exam,subject:row.subject,topic:row.topic});});
      hook("v320SelectTopic",([topicIndex],exam,result)=>{if(result===false)return;const subjectName=text(doc.getElementById("v320SubjectTitle")?.textContent),subjects=curriculum()[exam]||[],subjectIndex=subjects.findIndex(row=>text(row.name)===subjectName),row=topicItem(exam,subjectIndex,topicIndex);if(row)record({type:"topic",key:row.key,label:row.topic,meta:row.exam+" · "+row.subject,exam:row.exam,subject:row.subject,topic:row.topic});});
      hook("v320SelectElement",([value],exam,result)=>{const n=Number(value),row=(root.YKSLearningLab?.elements||[]).find?.(item=>Number(item.n)===n);if(row)record({type:"element",key:String(n),value:String(n),label:row.name,meta:"Periyodik tablo · "+row.symbol});});
      if(hookAttempts++<30)root.setTimeout(installHooks,120);
    }
    function bindClicks(){
      doc.addEventListener("click",event=>{
        const target=event.target instanceof root.Element?event.target:null;if(!target)return;
        const science=target.closest("[data-card]");if(science&&doc.getElementById("v320PanelScience")?.contains(science)){const id=text(science.getAttribute("data-card")),label=text(science.querySelector("h3")?.textContent)||prettyCardId(id),meta=text(science.querySelector(".science-card-meta span")?.textContent),subject=id.startsWith("phy-")?"Fizik":"Biyoloji";record({type:"science",key:id,card:id,label,meta:meta||subject+" · bilim kartı",subject});return;}
        const organ=target.closest('[data-atlas-action="organ"]');if(organ){const id=text(organ.getAttribute("data-id")),row=ORGAN_TOPIC[id];if(row)record({type:"organ",key:id,organ:id,label:row.name,meta:"Biyoloji Atlası · 3B organ"});root.setTimeout(decorateAtlas,0);return;}
        const structure=target.closest("[data-atlas-structure]");if(structure){const name=text(doc.querySelector("#v320PanelAtlas .atlas-lesson-head h3")?.textContent),id=Object.keys(ORGAN_TOPIC).find(key=>ORGAN_TOPIC[key].name===name);if(id)record({type:"organ",key:id,organ:id,structure:text(structure.getAttribute("data-atlas-structure")),label:name,meta:"Biyoloji Atlası · "+text(structure.textContent)});root.setTimeout(decorateAtlas,0);}
      },true);
    }
    function observeAtlas(){const panel=doc.getElementById("v320PanelAtlas");if(!panel||atlasObserver)return;atlasObserver=new MutationObserver(()=>{if(typeof root.requestAnimationFrame==="function")root.requestAnimationFrame(decorateAtlas);else root.setTimeout(decorateAtlas,0);});atlasObserver.observe(panel,{childList:true,subtree:true});decorateAtlas();}
    root.__YKS_LEARNING_LAB_FLOW_V42__=true;injectStyle();bindClicks();installHooks();observeAtlas();
    root.addEventListener("yks:navigation-after",event=>{if(!event.detail||event.detail.screen==="more")scheduleRender();});root.addEventListener("yks:data-primary-ready",scheduleRender);root.addEventListener("storage",event=>{if(!event.key||event.key==="yks")scheduleRender();});
    root.setTimeout(()=>{observeAtlas();installHooks();scheduleRender();},120);root.setTimeout(()=>{observeAtlas();installHooks();scheduleRender();},650);
    root.YKSLearningLabFlowV42=Object.assign(root.YKSLearningLabFlowV42||{},{render,openItem,openCourseTopicByOrgan,record,getFlow:flow,selfTest});
    return true;
  }
  return {version:VERSION,stateKey:STATE_KEY,organTopics:ORGAN_TOPIC,normalizeFlow,mergeRecent,parseTopicFavorite,organCourseTopic,prettyCardId,snapshotSchedule,selfTest,install};
});