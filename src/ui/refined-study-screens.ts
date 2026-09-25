import "./refined-study-screens.css";

type LegacyCall=(...args:any[])=>any;
type Disclosure={details:HTMLDetailsElement;body:HTMLDivElement;summary:HTMLElement};
type StudyApi={installed:boolean;refresh():void;reveal(target:HTMLElement):void};
let api:StudyApi|undefined;

function node<K extends keyof HTMLElementTagNameMap>(tag:K,cls="",text=""):HTMLElementTagNameMap[K]{
  const result=document.createElement(tag);result.className=cls;if(text)result.textContent=text;return result;
}

/** Native details retains keyboard semantics and the original live forms. */
export function createStudyDisclosure(id:string,title:string,description:string,contentId=id+"Content"):Disclosure{
  const details=node("details","rb-study-disclosure"),summary=node("summary"),copy=node("span","rb-study-disclosure-copy"),body=node("div","rb-study-disclosure-body");
  details.id=id;body.id=contentId;summary.setAttribute("aria-controls",contentId);summary.setAttribute("aria-expanded","false");
  copy.append(node("strong","",title),node("small","",description));summary.append(copy);details.append(summary,body);
  details.addEventListener("toggle",()=>summary.setAttribute("aria-expanded",String(details.open)));
  details.addEventListener("keydown",event=>{
    if(event.key!=="Escape"||!details.open)return;
    event.preventDefault();event.stopPropagation();details.open=false;summary.focus();
  });
  return {details,body,summary};
}

export function revealStudyTarget(target:HTMLElement):void{
  let parent:HTMLElement|null=target;
  while(parent){if(parent instanceof HTMLDetailsElement&&parent.classList.contains("rb-study-disclosure"))parent.open=true;parent=parent.parentElement;}
}

function moveLive(parent:HTMLElement,child:HTMLElement|null,before:Element|null=null):void{
  if(!child||child===parent||child.contains(parent)||child.parentElement===parent)return;
  const active=document.activeElement instanceof HTMLElement&&child.contains(document.activeElement)?document.activeElement:null;
  const selection=active instanceof HTMLInputElement||active instanceof HTMLTextAreaElement?[active.selectionStart,active.selectionEnd,active.selectionDirection] as const:null;
  parent.insertBefore(child,before);
  if(active){revealStudyTarget(active);active.focus({preventScroll:true});if(selection&&selection[0]!==null)try{(active as HTMLInputElement).setSelectionRange(selection[0],selection[1],selection[2]||undefined);}catch{}}
}

function containingChild(screen:HTMLElement,target:HTMLElement|null):HTMLElement|null{
  if(!target||!screen.contains(target))return null;
  let child=target;while(child.parentElement&&child.parentElement!==screen)child=child.parentElement;return child;
}

export function installRefinedStudyScreens():StudyApi{
  if(api)return api;
  const topics=document.getElementById("topics"),exam=document.getElementById("deneme");
  if(!topics||!exam)return {installed:false,refresh(){},reveal:revealStudyTarget};
  const topicScreen=topics,examScreen=exam,legacy=window as unknown as Record<string,unknown>;
  const topicMore=createStudyDisclosure("refinedTopicsMore","İlerleme ve hedefler","Konu özeti, tekrarlar, hedefler ve kaynakların","refinedTopicInsights");
  const journal=createStudyDisclosure("refinedExamJournal","Hata Defteri","Yanlışlarını kaydet, nedenlerini takip et");
  const cycle=createStudyDisclosure("refinedExamCycle","Öğrenme döngüsü","Hatalarından sonraki tekrarları ve gelişimini gör");
  const analysis=createStudyDisclosure("refinedExamAnalysis","Ayrıntılı analiz","Dersler, karşılaştırmalar, puan ve hedefler");
  const history=createStudyDisclosure("refinedExamHistory","Geçmiş ve deneme ayarları","Önceki denemelerin, notların ve deneme günün");
  const disclosures=[topicMore,journal,cycle,analysis,history];
  const title=node("header","rb-study-heading");title.id="refinedTopicsHeading";title.append(node("h1","","Konular"),node("p","","Dersini seç, adım adım ilerle."));
  topicScreen.prepend(title);topicScreen.append(topicMore.details);examScreen.append(journal.details,cycle.details,analysis.details,history.details);
  const detailGrid=node("div","v315-dash-grid rb-study-analysis-grid");detailGrid.id="refinedExamDetailGrid";analysis.body.append(detailGrid);
  const scrollTargets=new WeakSet<HTMLElement>();
  let queued=false,navigationDepth=0,renderDepth=0;
  function protectDeepLinks():void{
    for(const {body} of disclosures)for(const target of body.querySelectorAll<HTMLElement>("[id]")){
      if(scrollTargets.has(target))continue;scrollTargets.add(target);
      const original=target.scrollIntoView;
      target.scrollIntoView=function(options?:boolean|ScrollIntoViewOptions){revealStudyTarget(target);original.call(target,options);};
    }
  }
  function arrangeTopics():void{
    const tools=topicScreen.querySelector<HTMLElement>(".v26-topic-tools"),tabs=document.getElementById("segTYT")?.parentElement||null,subjects=document.getElementById("subjectList"),modal=document.getElementById("v26TopicModal");
    const primary=new Set<HTMLElement>([title,topicMore.details,...[tools,tabs,subjects,modal].filter((item):item is HTMLElement=>!!item)]);
    for(const child of Array.from(topicScreen.children))if(child instanceof HTMLElement&&!primary.has(child))moveLive(topicMore.body,child);
    // Move only if needed; edits and active subject controls stay in place on refresh.
    if(tools&&tools.previousElementSibling!==title)topicScreen.insertBefore(tools,title.nextSibling);
    if(tabs&&tools&&tabs.previousElementSibling!==tools)topicScreen.insertBefore(tabs,tools.nextSibling);
    if(tabs&&topicMore.details.previousElementSibling!==tabs)topicScreen.insertBefore(topicMore.details,tabs.nextSibling);
    if(subjects&&subjects.previousElementSibling!==topicMore.details)topicScreen.insertBefore(subjects,topicMore.details.nextSibling);
  }
  function arrangeExam():void{
    const dashboard=document.getElementById("v315Dashboard"),form=document.getElementById("v315ExamFormCard"),reflection=document.getElementById("reflBox");
    const special=new Set(disclosures.map(item=>item.details));
    const primary=new Set([dashboard,form,reflection].filter(Boolean));
    const journalNodes=new Set(["errorJournal","wtSubject","wtBox","wkBox","fh_arsiv","fb_arsiv"].map(id=>containingChild(examScreen,document.getElementById(id))).filter(Boolean));
    const historyNodes=new Set(["denemeGun","fh_gecmis","fb_gecmis"].map(id=>containingChild(examScreen,document.getElementById(id))).filter(Boolean));
    const children=Array.from(examScreen.children).filter((item):item is HTMLElement=>item instanceof HTMLElement);
    const destination=(child:HTMLElement)=>child.id==="v43LearningCycle"?cycle.body:journalNodes.has(child)?journal.body:historyNodes.has(child)?history.body:analysis.body;
    for(let index=0;index<children.length;index++){
      const child=children[index];if(!child||special.has(child as HTMLDetailsElement)||primary.has(child))continue;
      const next=child.tagName==="H2"?children.slice(index+1).find(item=>item.tagName!=="H2"):undefined;
      moveLive(next?destination(next):destination(child),child);
    }
    const learning=document.getElementById("v43LearningCycle");if(learning&&examScreen.contains(learning))moveLive(cycle.body,learning);
    if(dashboard&&examScreen.firstElementChild!==dashboard)examScreen.insertBefore(dashboard,examScreen.firstChild);
    if(form&&dashboard&&form.previousElementSibling!==dashboard)examScreen.insertBefore(form,dashboard.nextSibling);
    if(reflection&&form&&reflection.previousElementSibling!==form)examScreen.insertBefore(reflection,form.nextSibling);
    const grid=dashboard?.querySelector<HTMLElement>(".v315-dash-grid");
    if(grid)for(const card of Array.from(grid.children))if(card instanceof HTMLElement&&!card.classList.contains("v315-trend-card"))moveLive(detailGrid,card);
    const insights=document.getElementById("v4ExamInsights");if(insights&&dashboard?.contains(insights))moveLive(analysis.body,insights,detailGrid);
    cycle.details.hidden=!cycle.body.children.length;
  }
  function refresh():void{arrangeTopics();arrangeExam();protectDeepLinks();topicScreen.dataset.refinedStudy="ready";examScreen.dataset.refinedStudy="ready";}
  function schedule():void{if(queued)return;queued=true;queueMicrotask(()=>{queued=false;refresh();});}
  function wrap(name:string,before?:(...args:unknown[])=>void):void{
    const original=legacy[name];if(typeof original!=="function")return;
    legacy[name]=function(this:unknown,...args:unknown[]){before?.(...args);const result=original.apply(this,args);schedule();return result;};
  }
  const go=legacy.go;
  if(typeof go==="function")legacy.go=function(this:unknown,...args:unknown[]){navigationDepth++;try{return go.apply(this,args);}finally{navigationDepth--;schedule();}};
  wrap("setAnaTab",()=>{if(!navigationDepth&&!renderDepth)analysis.details.open=true;});
  wrap("openFold",key=>{const target=document.getElementById(`fb_${String(key)}`);if(target)revealStudyTarget(target);});
  wrap("v30OpenArchive",()=>{journal.details.open=true;});
  for(const name of ["renderTopics","renderExam2","renderV315Dashboard"])wrap(name);
  for(const event of ["yks:data-changed","yks:v43-runtime","yks:desktop-layout","yks:data-primary-ready"])window.addEventListener(event,schedule);
  window.addEventListener("yks:screen-render-before",()=>{renderDepth++;});
  const finishRender=()=>{renderDepth=Math.max(0,renderDepth-1);schedule();};
  window.addEventListener("yks:screen-render-after",finishRender);window.addEventListener("yks:screen-render-error",finishRender);
  const onNavigation=(event:Event)=>{const detail=(event as CustomEvent<{to?:string;screen?:string}>).detail;if(["topics","deneme"].includes(detail?.to??detail?.screen??""))schedule();};
  window.addEventListener("yks:navigation-after",onNavigation);document.addEventListener("yks:navigation-after",onNavigation);
  for(const {details} of disclosures)details.addEventListener("toggle",()=>{if(details.open){window.dispatchEvent(new Event("resize"));protectDeepLinks();}});
  refresh();api={installed:true,refresh,reveal:revealStudyTarget};return api;
}
