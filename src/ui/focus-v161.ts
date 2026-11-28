import "./focus-v161.css";
import {focusDuration} from "./focus-v107";

/* Odak v161 (1+2 karışık): üstte günün hedefi kartı (derslere göre renkli çubuk, kalan süre ve tur),
 * ders seçimi sayaç kartının içinde etiket, süreler Başlat'ın üstünde, araçlar liste (Deneme modu satırı yok).
 * Minimal mod: ders adı büyük ve renkli, 4 turluk çubuk, Bugün / Hedef / Soru, ↺ Duraklat ⏭; "Hızlı ara" yok.
 * v107'nin kurduğu düğümlerin üstüne eklenir; sayaç ve kayıt mantığına dokunmaz, veri yazmaz.
 * Okuduğu: bugünkü oturumlar (v29SessionList), S.focus.goalMin, S.workMin ve eski düğümlerin yazıları. */

type Loose=Record<string,any>;
type FocusWindow=Window&{
  v29SessionList?:(days:number)=>unknown;
  YKSLegacyState?:{readState?:()=>Loose};
  YKSTaskText?:{subjectTone?:(value:string)=>string};
  resetPomo?:()=>void;swReset?:()=>void;skipPhase?:()=>void;v29RenderMinimal?:()=>void;
};
export type GoalBar={subject:string;minutes:number;width:number};
export type GoalView={total:string;goal:string;pct:number|null;bars:GoalBar[];legend:GoalBar[];count:number;left:[string,string]|null};

// Çubuk derslere göre bölünür; oturuma yazılmamış dakikalar (yarıda kalan sayaç) adsız bir parça olur.
export function focusGoalView(minutes:number,goal:number,list:unknown,workMin:number):GoalView{
  const done=Math.max(0,Math.round(Number(minutes)||0)),target=Math.max(0,Math.round(Number(goal)||0)),work=Math.max(1,Math.round(Number(workMin)||0)||25);
  const rows=Array.isArray(list)?list.filter(item=>item&&Number(item.m)>0):[];
  const by=new Map<string,number>();
  for(const item of rows){const name=String(item.subj||"").trim()||"Genel çalışma";by.set(name,(by.get(name)||0)+Number(item.m));}
  const scale=Math.max(target,done,1),width=(m:number)=>Math.min(100,Math.round(m/scale*1000)/10);
  const subjects=[...by].map(([subject,m])=>({subject,minutes:Math.round(m),width:width(m)})).sort((a,b)=>b.minutes-a.minutes);
  const rest=done-subjects.reduce((sum,row)=>sum+row.minutes,0);
  const bars=rest>0?[...subjects,{subject:"",minutes:rest,width:width(rest)}]:subjects;
  const left:[string,string]|null=!target?null:done>=target?["Günlük hedef tamam",""]:[focusDuration(target-done)," kaldı · "+work+" dk'lık "+Math.ceil((target-done)/work)+" tur"];
  return {total:focusDuration(done),goal:target?"/ "+focusDuration(target):"",pct:target?Math.round(done/target*100):null,bars,legend:subjects.slice(0,3),count:rows.length,left};
}
// Minimal turu: kaç tur bitti (ana ekrandaki noktalar), içindeki tur yüzdesi kadar dolar.
export function minimalTours(total:number,done:number,progress:number):number[]{
  const n=Math.max(1,Math.min(8,Math.floor(Number(total)||0)||4)),d=Math.max(0,Math.floor(Number(done)||0))%n,p=Math.max(0,Math.min(100,Math.round(Number(progress)||0)));
  return Array.from({length:n},(_,i)=>i<d?100:i===d?p:0);
}

function make<K extends keyof HTMLElementTagNameMap>(tag:K,className:string,text?:string):HTMLElementTagNameMap[K]{
  const element=document.createElement(tag);if(className)element.className=className;if(text)element.textContent=text;return element;
}
function setText(node:Element|null|undefined,text:string):void{if(node&&node.textContent!==text)node.textContent=text;}
function setData(node:HTMLElement,key:string,value:string):void{if(value){if(node.dataset[key]!==value)node.dataset[key]=value;}else if(key in node.dataset)delete node.dataset[key];}
const byId=<T extends HTMLElement=HTMLElement>(id:string)=>document.getElementById(id) as T|null;

export function installFocusV161():void{
  const root=byId("pomo");if(!root||root.dataset.v161)return;root.dataset.v161="wait";
  const win=window as FocusWindow;
  const state=():Loose=>{try{return win.YKSLegacyState?.readState?.()??{};}catch{return {};}};
  const tone=(name:string):string=>{try{const t=win.YKSTaskText?.subjectTone?.(name)||"";return t==="other"?"":t;}catch{return "";}};
  function openTool(key:string):void{
    const row=document.querySelector<HTMLDetailsElement>('#v70FocusTools [data-tool="'+key+'"]');if(!row)return;
    row.open=true;
    row.scrollIntoView({block:"start",behavior:matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth"});
    row.querySelector<HTMLElement>("summary")?.focus({preventScroll:true});
  }

  /* ---- Günün hedefi kartı ---- */
  let paintGoal=():void=>{};
  function goalCard():boolean{
    const head=byId("v70FocusHead");if(!head)return false;
    const card=make("section","card v161-goal");card.id="v161Goal";card.setAttribute("aria-label","Bugünkü odak ve hedef");
    const top=make("div","v161-goal-top"),sum=make("div","v161-goal-sum"),total=make("b",""),goal=make("small",""),pct=make("span","v161-goal-pct");
    sum.append(make("small","v161-eyebrow","Bugün"),total," ",goal);top.append(sum,pct);
    const bar=make("div","v161-stack"),legend=make("div","v161-legend"),left=make("div","v161-left");
    bar.setAttribute("aria-hidden","true");
    const sessions=make("button","v161-link");sessions.type="button";sessions.addEventListener("click",()=>openTool("sessions"));
    const setGoal=make("button","v161-link","Günlük hedef koy ›");setGoal.type="button";setGoal.addEventListener("click",()=>openTool("settings"));
    card.append(top,bar,legend,left);head.after(card);
    let last="";
    paintGoal=():void=>{
      const minutes=Number(byId("pomoTodayMin")?.textContent)||0,s=state();
      let list:unknown=[];try{list=win.v29SessionList?.(1);}catch{}
      const view=focusGoalView(minutes,Number(s.focus?.goalMin)||0,list,Number(s.workMin)||25);
      const key=JSON.stringify(view);if(key===last)return;last=key;
      setText(total,view.total);setText(goal,view.goal);
      pct.hidden=view.pct===null;setText(pct,"%"+(view.pct??0));
      bar.replaceChildren(...view.bars.map(row=>{const part=make("i","");part.style.width=row.width+"%";setData(part,"tone",row.subject?tone(row.subject)||"other":"");if(!row.subject)part.className="v161-rest";return part;}));
      bar.hidden=!view.bars.length&&!view.goal;
      legend.replaceChildren(...view.legend.map(row=>{const item=make("span","");const dot=make("i","");setData(dot,"tone",tone(row.subject)||"other");item.append(dot,row.subject+" "+focusDuration(row.minutes));return item;}));
      setText(sessions,view.count+" oturum ›");if(view.count)legend.append(sessions);
      legend.hidden=!legend.childElementCount;
      if(view.left)left.replaceChildren(make("b","",view.left[0]),view.left[1]);
      else left.replaceChildren(make("span","","Günlük hedef koymadın"),setGoal);
    };
    paintGoal();
    return true;
  }

  /* ---- Ders etiketi sayaç kartında; seçim paneli etiketin altında açılır ---- */
  function subjectChip():boolean{
    const what=byId<HTMLButtonElement>("v107What"),setup=what?.closest<HTMLElement>(".v29-session-setup"),pomoCard=byId("focusCard"),swCard=byId("swCard");
    if(!what||!setup||!pomoCard||!swCard)return false;
    const chip=make("button","v161-subj");chip.type="button";chip.id="v161Subj";chip.setAttribute("aria-label","Ders ve konu seç");
    const dot=make("i","v161-dot"),label=make("span",""),chev=make("i","v161-chev");dot.setAttribute("aria-hidden","true");chev.setAttribute("aria-hidden","true");
    chip.append(dot,label,chev);chip.addEventListener("click",()=>what.click());
    const sync=():void=>{
      setText(label,what.querySelector("b")?.textContent||"Genel çalışma");
      const open=what.getAttribute("aria-expanded")||"false";if(chip.getAttribute("aria-expanded")!==open)chip.setAttribute("aria-expanded",open);
      const color=tone((label.textContent||"").split(" · ")[0]!);
      for(const node of [chip,pomoCard,swCard])setData(node,"v161Tone",color);
    };
    const place=():void=>{
      const card=byId("focusStop")?.style.display==="none"?pomoCard:swCard,head=card.querySelector<HTMLElement>(".fchead");if(!head)return;
      if(chip.parentElement!==head)head.prepend(chip);
      if(setup.previousElementSibling!==head)head.after(setup);
    };
    new MutationObserver(sync).observe(what,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:["aria-expanded","data-tone"]});
    const stop=byId("focusStop");if(stop)new MutationObserver(place).observe(stop,{attributes:true,attributeFilter:["style"]});
    sync();place();
    return true;
  }

  /* ---- Süreler Başlat'ın üstünde ---- */
  function presets():boolean{
    const quick=byId("quickWrap"),controls=byId("focusCard")?.querySelector(".fcctl");if(!quick||!controls)return false;
    if(quick.nextElementSibling!==controls)controls.before(quick);return true;
  }
  /* ---- Araçlar tek kartta liste ---- */
  function tools():boolean{
    const list=byId("v70FocusTools");if(!list||list.dataset.v107!=="grid")return false;
    list.dataset.v107="list";return true;
  }

  const steps:[string,()=>boolean][]=[["goal",goalCard],["chip",subjectChip],["presets",presets],["tools",tools]],done=new Set<string>();
  const run=():boolean=>{for(const [name,step] of steps)if(!done.has(name)&&step())done.add(name);return done.size===steps.length;};
  const finish=():void=>{root.classList.add("v161");root.dataset.v161="ready";};
  if(run())finish();
  else{
    // v70/v107 parçaları farklı anlarda kurulur; eksik adım gelene kadar #pomo izlenir (en çok 15 sn).
    const retry=new MutationObserver(()=>{if(run()){retry.disconnect();finish();}});
    retry.observe(root,{childList:true,subtree:true});
    window.setTimeout(()=>retry.disconnect(),15000);
  }
  const todayMin=byId("pomoTodayMin");
  if(todayMin)new MutationObserver(()=>paintGoal()).observe(todayMin,{childList:true,characterData:true,subtree:true});
  window.addEventListener("yks:data-changed",()=>paintGoal());
  document.addEventListener("yks:navigation-after",event=>{
    const detail=(event as CustomEvent<{to?:string;screen?:string}>).detail;
    if((detail?.to??detail?.screen)==="pomo")paintGoal();
  });
  installMinimal(win,state,tone);
}

/* ---- Minimal mod ---- */
function installMinimal(win:FocusWindow,state:()=>Loose,tone:(name:string)=>string):void{
  const overlay=byId("v29MinimalOverlay"),clock=byId("v29MinimalClock"),actions=overlay?.querySelector<HTMLElement>(".v29-minimal-actions"),primary=byId("v29MinimalToggle");
  const ring=byId("v29MinimalRing"),stats=overlay?.querySelectorAll<HTMLElement>(".v29-minimal-stats>div");
  if(!overlay||!clock||!actions||!primary||!ring||!stats||stats.length<3||overlay.dataset.v161)return;
  overlay.dataset.v161="ready";
  const ends=make("p","v161-min-ends"),tours=make("div","v161-tours");tours.setAttribute("aria-hidden","true");
  ring.querySelector(".v29-minimal-ring-inner")?.append(ends);ring.after(tours);
  const goalOut=make("strong",""),qOut=make("strong","");
  setText(stats[1]!.querySelector("span"),"Hedef");stats[1]!.append(goalOut);
  setText(stats[2]!.querySelector("span"),"Soru");stats[2]!.append(qOut);
  const isStopwatch=():boolean=>overlay.dataset.phase==="stopwatch";
  const call=(name:"resetPomo"|"swReset"|"skipPhase"):void=>{try{win[name]?.();win.v29RenderMinimal?.();}catch(error){console.error("v161 minimal",error);}};
  const reset=make("button","v161-min-side","↺"),skip=make("button","v161-min-side","⏭");
  reset.type="button";skip.type="button";reset.setAttribute("aria-label","Sıfırla");skip.setAttribute("aria-label","Turu bitir");
  reset.addEventListener("click",()=>call(isStopwatch()?"swReset":"resetPomo"));skip.addEventListener("click",()=>call("skipPhase"));
  primary.before(reset);primary.after(skip);
  let last="";
  const paint=():void=>{
    const subject=(byId("v29MinimalSubject")?.textContent||"").split(" · ")[0]!.trim();
    setData(overlay,"v161Tone",tone(subject));
    // 1 saati geçen süre "1:23:45" olur; saat hanesi gelince yazı küçülür, ekrandan taşmaz.
    setData(overlay,"v161Long",(clock.textContent||"").split(":").length>2?"1":"");
    const stopwatch=isStopwatch(),running=overlay.dataset.running==="1";
    const endText=(byId("pomoEnds")?.textContent||"").replace(/^Başlatırsan\s*/,"").trim();
    setText(ends,!stopwatch&&overlay.dataset.phase==="work"&&running&&endText?endText:(byId("v29MinimalState")?.textContent||""));
    skip.hidden=stopwatch;
    const goal=Number(state().focus?.goalMin)||0,minutes=Number(byId("pomoTodayMin")?.textContent)||0;
    setText(goalOut,goal?"%"+Math.round(minutes/goal*100):"—");
    setText(qOut,document.querySelector("#v70Questions .v70-q-out")?.textContent||"0");
    const dots=byId("pomoDots"),progress=Number((byId("v29MinimalPercent")?.textContent||"").replace(/\D/g,""))||0;
    const fill=stopwatch?[]:minimalTours(dots?.children.length||4,dots?.querySelectorAll("i.on").length||0,overlay.dataset.phase==="work"?progress:0);
    const key=fill.join(",");if(key!==last){last=key;tours.replaceChildren(...fill.map(p=>{const i=make("i","");i.style.setProperty("--p",p+"%");return i;}));}
    tours.hidden=stopwatch;
  };
  new MutationObserver(paint).observe(clock,{childList:true,characterData:true,subtree:true});
  new MutationObserver(paint).observe(overlay,{attributes:true,attributeFilter:["data-running","data-phase","class"]});
  paint();
}
