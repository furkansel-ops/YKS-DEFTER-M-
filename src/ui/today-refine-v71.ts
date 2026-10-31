import "./today-refine-v71.css";

/* Bugün v71: var olan ekran korunur, yalnız düzen ve görünüm iyileşir. Eski düğümler TAŞINIR
 * (kopyalanmaz); program, odak, soru ve gün sonu kayıtları kendi sahiplerinde kalır.
 * 2 mavi kartta 1/3 ve çubuk · 3 kutular dokunulabilir, Soru'da hızlı giriş · 4 "Odak hazır" kartı yerine
 * Odak kutusunda canlı süre · 5 listede "Sırada" · 6 Günlük ilerleme özeti gizli (CSS)
 * 7 alttaki kutular tek tip liste · 8 yeşil düğmeler mavi (CSS) · 9 akşam 20:00'den sonra Gün sonu başa */

type TodayWindow=Window&{go?:(page:string)=>unknown};
export type PlanProgress={done:number;total:number};

const ROWS:[id:string,icon:string,title:string][]=[
  ["todayFreshSubjects","◔","Ders dağılımı"],
  ["todayFreshInsights","↻",""],
  ["todayFreshActivity","▥","Haftalık ritim"],
  ["todayFreshReview","☾","Gün sonu"]
];

// "1 / 3 tamamlandı" → {done:1,total:3}; görev yoksa null.
export function planProgress(text:string):PlanProgress|null{
  const match=/(\d+)\s*\/\s*(\d+)/.exec(String(text||""));
  if(!match)return null;
  const total=Number(match[2]);
  return total>0?{done:Math.min(Number(match[1]),total),total}:null;
}
export function planTileText(progress:PlanProgress|null):{value:string;sub:string}{
  if(!progress)return {value:"—",sub:"plan yok"};
  const left=progress.total-progress.done;
  return {value:progress.done+"/"+progress.total,sub:left?left+" görev kaldı":"hepsi tamam"};
}
export function isEvening(date:Date):boolean{return date.getHours()>=20;}

function make<K extends keyof HTMLElementTagNameMap>(tag:K,className:string,text?:string):HTMLElementTagNameMap[K]{
  const element=document.createElement(tag);element.className=className;if(text)element.textContent=text;return element;
}
const read=(node:Element|null|undefined):string=>String(node?.textContent||"").trim();
function set(id:string,value:string):void{
  const node=document.getElementById(id);if(node&&node.textContent!==value)node.textContent=value;
}

export function installTodayRefineV71():{installed:boolean}{
  const fresh=document.getElementById("todayFreshStart");
  if(!fresh)return {installed:false};
  if(fresh.dataset.v71==="ready")return {installed:true};
  const win=window as TodayWindow;
  const navigate=(page:string):void=>{if(typeof win.go==="function")win.go(page);};
  const done=new Set<string>();

  // 2: "Sıradaki çalışma" kartında 1/3 ve ince ilerleme çubuğu.
  function hero():boolean{
    if(document.getElementById("v71HeroBar"))return true;
    const card=fresh!.querySelector<HTMLElement>(".today-fresh-next");
    const eyebrow=card?.querySelector<HTMLElement>(".today-fresh-card-eyebrow");
    const meta=document.getElementById("todayFreshNextMeta");
    if(!card||!eyebrow||!meta)return false;
    const count=make("span","v71-hero-count");count.id="v71HeroCount";
    eyebrow.append(count);
    const bar=make("div","v71-hero-bar");bar.id="v71HeroBar";bar.hidden=true;
    bar.setAttribute("role","progressbar");bar.setAttribute("aria-label","Bugünkü program ilerlemesi");
    bar.setAttribute("aria-valuemin","0");bar.setAttribute("aria-valuemax","100");
    bar.append(make("i",""));
    meta.insertAdjacentElement("afterend",bar);
    return true;
  }
  // 3 · 4: kutular dokunulabilir; Program "1/3", Odak sayaç açıkken canlı süre, Soru hızlı girişi açar.
  function tiles():boolean{
    const stats=fresh!.querySelector<HTMLElement>(".today-fresh-stats");
    const question=document.getElementById("todayFreshQuestions")?.closest<HTMLElement>(".today-fresh-stat");
    const minutes=document.getElementById("todayFreshMinutes")?.closest<HTMLElement>(".today-fresh-stat");
    const plan=document.getElementById("todayFreshPlan")?.closest<HTMLElement>(".today-fresh-stat");
    if(!stats||!question||!minutes||!plan)return false;
    if(stats.dataset.v71==="ready")return true;
    const planValue=make("strong","v71-plan-value"),planSub=make("small","v71-plan-sub");
    planValue.id="v71PlanValue";planSub.id="v71PlanSub";
    plan.classList.add("v71-plan");plan.append(planValue,planSub);
    const liveValue=make("strong","v71-live-value"),liveSub=make("small","v71-live-sub");
    liveValue.id="v71FocusLive";liveSub.id="v71FocusLiveSub";
    minutes.append(liveValue,liveSub);
    const panel=make("div","v71-solved");panel.id="v71SolvedPanel";panel.hidden=true;
    stats.append(panel);
    const tap=(tile:HTMLElement,run:()=>void):void=>{
      tile.classList.add("v71-tap");tile.setAttribute("role","button");tile.tabIndex=0;
      tile.addEventListener("click",run);
      tile.addEventListener("keydown",event=>{if(event.key==="Enter"||event.key===" "){event.preventDefault();run();}});
    };
    tap(plan,()=>navigate("program"));
    tap(minutes,()=>navigate("pomo"));
    // Eski "Hızlı soru girişi" kartı gizli bir çekmecede kalmıştı; dokununca buraya taşınır (kopyalanmaz).
    tap(question,()=>{
      const quick=document.querySelector<HTMLElement>("#home .quick-entry");
      if(quick&&quick.parentElement!==panel)panel.append(quick);
      panel.hidden=!panel.hidden;question.setAttribute("aria-expanded",panel.hidden?"false":"true");
      if(!panel.hidden)document.getElementById("solvedInput")?.focus({preventScroll:true});
    });
    question.setAttribute("aria-controls",panel.id);question.setAttribute("aria-expanded","false");
    stats.dataset.v71="ready";
    return true;
  }
  // 7: alttaki dört kapalı kutu tek tip satır listesine girer; kutular ve içerikleri aynen kalır.
  function rows():boolean{
    if(document.getElementById("v71Rows"))return true;
    const nodes=ROWS.map(([id])=>document.getElementById(id));
    if(nodes.some(node=>!node))return false;
    const box=make("div","v71-rows");box.id="v71Rows";
    nodes[0]!.insertAdjacentElement("beforebegin",box);
    ROWS.forEach(([,icon,title],index)=>{
      const details=nodes[index]!;
      const summary=details.querySelector<HTMLElement>(":scope>summary");
      if(summary){
        const ic=make("span","v71-ic",icon);ic.setAttribute("aria-hidden","true");
        const chevron=make("span","v71-chev","›");chevron.setAttribute("aria-hidden","true");
        summary.prepend(ic);summary.append(chevron);
        const heading=summary.querySelector<HTMLElement>("h2,.today-fresh-review-title strong");
        if(title&&heading)heading.textContent=title;
      }
      box.append(details);
    });
    return true;
  }
  // 5: mavi karttaki görev listede "Sırada" etiketiyle işaretlenir.
  function nextBadge():void{
    const list=document.getElementById("todayFreshTaskList");if(!list)return;
    const heroTitle=read(document.getElementById("todayFreshNextTitle")).toLocaleLowerCase("tr-TR");
    const open=Array.from(list.querySelectorAll<HTMLElement>(".today-fresh-task:not(.is-done)"));
    const target=open.find(task=>{
      const title=read(task.querySelector(".today-fresh-task-title")).toLocaleLowerCase("tr-TR");
      return Boolean(title)&&heroTitle.includes(title);
    })||open[0]||null;
    for(const task of Array.from(list.querySelectorAll<HTMLElement>(".today-fresh-task"))){
      const badge=task.querySelector(".v71-next");
      if(task===target&&!badge){task.append(make("span","v71-next","Sırada"));task.classList.add("v71-is-next");}
      if(task!==target&&badge){badge.remove();task.classList.remove("v71-is-next");}
    }
  }
  function refresh():void{
    const progress=planProgress(read(document.getElementById("todayFreshTaskCount")));
    const plan=planTileText(progress);
    set("v71PlanValue",plan.value);set("v71PlanSub",plan.sub);
    set("v71HeroCount",progress?progress.done+" / "+progress.total:"");
    const bar=document.getElementById("v71HeroBar");
    if(bar){
      const percent=progress?Math.round(progress.done/progress.total*100):0;
      bar.hidden=!progress;bar.setAttribute("aria-valuenow",String(percent));
      const fill=bar.firstElementChild as HTMLElement|null;if(fill)fill.style.width=percent+"%";
    }
    // Odak durumu Çalışma Merkezi'nin (v38) aynasından okunur; sayaç mantığına dokunulmaz.
    const dot=document.getElementById("todayFreshFocusDot");
    const running=Boolean(dot?.classList.contains("is-running")),paused=Boolean(dot?.classList.contains("is-paused"));
    document.getElementById("todayFreshMinutes")?.closest(".today-fresh-stat")?.classList.toggle("v71-live",running||paused);
    const time=read(document.getElementById("todayFreshFocusTime"));
    const onBreak=/Mola/.test(read(document.getElementById("todayFreshFocusState")));
    set("v71FocusLive",onBreak?"Mola "+time:(running?"▶ ":"❚❚ ")+time);
    set("v71FocusLiveSub",onBreak?"mola sürüyor":read(document.getElementById("todayFreshFocusHint")).split(" · ")[0]||"Odak");
    nextBadge();
  }
  // 9: akşam 20:00'den sonra "Gün sonu" satırı listenin başına çıkar.
  const evening=():void=>{document.getElementById("v71Rows")?.classList.toggle("v71-evening",isEvening(new Date()));};

  const steps:[string,()=>boolean][]=[["hero",hero],["tiles",tiles],["rows",rows]];
  const run=():boolean=>{
    for(const [name,step] of steps)if(!done.has(name)&&step())done.add(name);
    refresh();evening();
    return done.size===steps.length;
  };
  if(!run()){
    // Bugün parçaları ayrı yüklenir; eksik adım gelene kadar kutu izlenir (en çok 15 sn).
    const retry=new MutationObserver(()=>{if(run())retry.disconnect();});
    retry.observe(fresh,{childList:true,subtree:true});
    window.setTimeout(()=>retry.disconnect(),15000);
  }
  let queued=false;
  const schedule=():void=>{
    if(queued)return;queued=true;
    // rAF yerine kısa zamanlayıcı: sekme arka plandayken de bayrak takılı kalmaz.
    window.setTimeout(()=>{queued=false;try{refresh();}catch(error){console.error("Bugün v71 yenilenemedi",error);}},16);
  };
  const watch=new MutationObserver(schedule);
  for(const id of ["todayFreshTaskCount","todayFreshFocusTime","todayFreshFocusState","todayFreshFocusHint","todayFreshNextTitle"]){
    const node=document.getElementById(id);if(node)watch.observe(node,{childList:true,characterData:true,subtree:true});
  }
  const dot=document.getElementById("todayFreshFocusDot");if(dot)watch.observe(dot,{attributes:true,attributeFilter:["class"]});
  const list=document.getElementById("todayFreshTaskList");if(list)watch.observe(list,{childList:true});
  window.setInterval(evening,60000);
  document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="visible"){evening();schedule();}});
  fresh.dataset.v71="ready";
  return {installed:true};
}
