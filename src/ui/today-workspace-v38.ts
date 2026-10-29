/* Today v38: presentation-only mirror of existing focus + program renderers.
   The legacy controls continue to own timers, task completion and persistence. */
type W38=Window&{go?:(page:string)=>unknown;v25StartTask?:()=>unknown;v25DoneNext?:()=>unknown};

/* Koç öneki ve ders rengi app.js'deki tek kaynaktan gelir (globalThis.YKSTaskText). */
type YksTaskText={stripCoachPrefix(value:string):string;subjectTone(value:string):string};
const taskText=():YksTaskText|undefined=>(globalThis as {YKSTaskText?:YksTaskText}).YKSTaskText;
const stripCoach=(value:string):string=>taskText()?.stripCoachPrefix(value)??value;
export function installTodayWorkspaceV38():{installed:boolean}{
  const root=document.getElementById("todayFreshWorkCenter");
  const plan=document.getElementById("todayPlan");
  const next=document.getElementById("todayNext");
  const stop=document.getElementById("swCard");
  const pomo=document.getElementById("focusCard");
  const swTime=document.getElementById("swTime");
  const pomoTime=document.getElementById("pomoTime");
  const subject=document.getElementById("pomoSubjPick");
  const taskList=document.getElementById("todayFreshTaskList");
  if(!root||!plan||!next||!stop||!pomo||!swTime||!pomoTime||!taskList)return{installed:false};
  if(root.dataset.workReady==="true")return{installed:true};
  const el=(id:string)=>document.getElementById(id);
  const text=(node:Element|null|undefined)=>String(node?.textContent||"").trim();
  const set=(id:string,value:string)=>{const node=el(id);if(node&&node.textContent!==value)node.textContent=value};
  const navigate=(page:string)=>{const fn=(window as W38).go;if(typeof fn==="function")fn(page)};
  const focusOpen=el("todayFreshFocusOpen");
  const nextStart=el("todayFreshNextStart") as HTMLButtonElement|null;
  const nextDone=el("todayFreshNextDone") as HTMLButtonElement|null;
  const all=el("todayFreshAllTasks");
  focusOpen?.addEventListener("click",()=>navigate("pomo"));
  all?.addEventListener("click",()=>navigate("program"));

  const nextAction=(kind:"start"|"done")=>{
    const re=kind==="start"?"v25StartTask":"v25DoneNext";
    const action=Array.from(next.querySelectorAll<HTMLButtonElement>("button"))
      .find(node=>(node.getAttribute("onclick")||"").includes(re));
    if(action){action.click();return}
    const api=(window as W38)[kind==="start"?"v25StartTask":"v25DoneNext"];
    if(typeof api==="function")api();
  };
  nextStart?.addEventListener("click",()=>{
    if(nextStart.dataset.action==="program")navigate("program");
    else nextAction("start");
  });
  nextDone?.addEventListener("click",()=>nextAction("done"));

  const refreshFocus=()=>{
    const swState=stop.getAttribute("data-run")||"idle";
    const pomoState=pomo.getAttribute("data-run")||"idle";
    const swActive=swState==="running"||swState==="paused";
    const pomActive=pomoState==="running"||pomoState==="paused";
    // Gerçek kronometre molası duraklatılmış çalışma değildir. Ayrı
    // mola sayacını YALNIZ ekranda oku; çalışma dakikalarını değiştirme.
    const breakPanel=document.getElementById("swBreakPanel");
    const onBreak=breakPanel?.dataset.active==="true";
    const useStop=onBreak||swState==="running"||(!pomActive&&swActive);
    const active=onBreak||swActive||pomActive;
    const state=useStop?swState:pomoState;
    const running=!onBreak&&active&&state==="running";
    const label=onBreak?"Mola devam ediyor":active?(running?"Odak sürüyor":"Odak duraklatıldı"):"Odak hazır";
    const activeSubject=text(subject?.querySelector(".chip.on"));
    set("todayFreshFocusState",label);
    const dot=el("todayFreshFocusDot");
    dot?.classList.toggle("is-running",running);
    dot?.classList.toggle("is-paused",active&&!running);
    const phase=text(el("pomoMode"));
    set("todayFreshFocusTitle",onBreak?"Mola zamanı":active?(useStop?"Kronometre":"Pomodoro"):"Odak zamanı");
    set("todayFreshFocusHint",onBreak?"Çalışma süren korunuyor · mola ayrı sayılıyor"
      :active?(activeSubject||phase||"Çalışma")+" · "+(running?"çalışıyorsun":"duraklatıldı")
      :"Odak ekranından bir çalışma başlatabilirsin.");
    set("todayFreshFocusTime",onBreak?(text(document.getElementById("swBreakCountdown"))||"Mola")
      :active?(text(useStop?swTime:pomoTime)||"00:00"):"--:--");
  };

  const refreshNext=()=>{
    const title=text(next.querySelector(".next-title"));
    const meta=text(next.querySelector(".next-meta"));
    const action=Array.from(next.querySelectorAll<HTMLButtonElement>("button"))
      .find(node=>(node.getAttribute("onclick")||"").includes("v25StartTask"));
    const done=Array.from(next.querySelectorAll<HTMLButtonElement>("button"))
      .some(node=>(node.getAttribute("onclick")||"").includes("v25DoneNext"));
    const hasTask=Boolean(action||done);
    const missing=!hasTask&&(title.toLocaleLowerCase("tr-TR").includes("program yok")||!title);
    set("todayFreshNextTitle",title||"Bugün için program yok");
    set("todayFreshNextMeta",meta||(missing?"Program sekmesinden çalışma ekleyebilirsin.":""));
    if(nextStart){
      nextStart.disabled=!hasTask&&!missing;
      nextStart.dataset.action=missing?"program":"start";
      nextStart.textContent=missing?"Programı aç":"Başla";
    }
    if(nextDone)nextDone.disabled=!done;
  };

  let lastTaskSignature="";
  // A legacy program render may replace rows without changing their text.
  // Keep references too, so buttons never point to a detached former row.
  let lastTaskRows:HTMLElement[]=[];
  const refreshTasks=()=>{
    const rows=Array.from(plan.querySelectorAll<HTMLElement>(".plancell"));
    const done=rows.filter(node=>node.classList.contains("pd")).length;
    set("todayFreshTaskCount",rows.length?done+" / "+rows.length+" tamamlandı":"Bugün için henüz görev yok");
    set("todayFreshWorkBadge",rows.length
      ?(done===rows.length?"Tüm görevler tamam":(rows.length-done)+" görev kaldı")
      :"Program ekleyebilirsin");
    const signature=rows.map(node=>[
      text(node.querySelector(".pl")),text(node.querySelector(".pt")),
      node.classList.contains("pd")?"1":"0"
    ].join("::")).join("|");
    const sameSource=rows.length===lastTaskRows.length&&
      rows.every((row,index)=>row===lastTaskRows[index]);
    if(signature===lastTaskSignature&&sameSource&&taskList.dataset.rendered==="true")return;
    lastTaskSignature=signature;
    lastTaskRows=rows;
    taskList.dataset.rendered="true";
    const children:HTMLElement[]=[];
    if(!rows.length){
      const empty=document.createElement("p");empty.className="today-fresh-task-empty";
      empty.textContent="Bugüne çalışma eklenmemiş. Programdan başlayabilirsin.";
      children.push(empty);
    }
    // İlk dört kayıtta tamamlanan görevler kalanları gizlemesin.
    // Kaynak program dizisi ve tamamlanma işleyicisi yerinde kalır.
    const ordered=rows.map((row,index)=>({row,index,done:row.classList.contains("pd")}))
      .sort((a,b)=>Number(a.done)-Number(b.done)||a.index-b.index);
    ordered.slice(0,4).forEach(({row})=>{
      const done=row.classList.contains("pd");
      const task=document.createElement("div");task.className="today-fresh-task"+(done?" is-done":"");
      const button=document.createElement("button");button.type="button";button.className="today-fresh-task-check";
      button.textContent=done?"✓":"○";
      button.setAttribute("aria-pressed",String(done));
      const subjectText=text(row.querySelector(".pl"));
      const raw=text(row.querySelector(".pt"))||subjectText||"Görev";
      // v66: "Koç ·" öneki rozet olur; başlık dersten, alt satır konudan oluşur.
      const title=stripCoach(raw),coach=title!==raw,cut=title.indexOf(" · ");
      task.dataset.tone=taskText()?.subjectTone(subjectText+" "+title)??"other";
      button.setAttribute("aria-label",raw+(done?" tamamlandı, geri al":" tamamla"));
      button.addEventListener("click",()=>{
        if((row.getAttribute("onclick")||"").includes("toggleCellDone"))row.click();
      });
      const copy=document.createElement("div");copy.className="today-fresh-task-copy";
      const b=document.createElement("strong");b.className="today-fresh-task-title";b.textContent=cut>0?title.slice(0,cut):title;
      const small=document.createElement("small");small.className="today-fresh-task-sub";
      small.textContent=cut>0?title.slice(cut+3):subjectText&&subjectText!=="—"?subjectText:(done?"Tamamlandı":"Program görevi");
      copy.append(b,small);task.append(button,copy);
      if(coach){const tag=document.createElement("span");tag.className="today-fresh-task-coach";tag.textContent="Koç";task.append(tag);}
      children.push(task);
    });
    if(rows.length>4){
      const rest=document.createElement("p");rest.className="today-fresh-task-empty";
      rest.textContent="+"+(rows.length-4)+" görev daha · Tümünü gör ile programı aç.";
      children.push(rest);
    }
    taskList.replaceChildren(...children);
  };
  const sync=()=>{refreshFocus();refreshNext();refreshTasks();};
  sync();
  if(typeof MutationObserver!=="undefined"){
    let focusDirty=false,nextDirty=false,tasksDirty=false,queued=false;
    // Focus text ticks are frequent. Never scan program rows on a timer-only tick.
    const observer=new MutationObserver((changes:MutationRecord[])=>{
      if(!changes||!changes.length){sync();return;} // compatible with older adapters
      for(const change of changes){
        const target=change.target;
        if(target===plan||plan.contains(target))tasksDirty=true;
        else if(target===next||next.contains(target))nextDirty=true;
        else focusDirty=true;
      }
      if(queued)return;
      queued=true;
      const flush=()=>{
        queued=false;
        try{
          if(focusDirty)refreshFocus();
          if(nextDirty)refreshNext();
          if(tasksDirty)refreshTasks();
        }catch(error){console.error("Çalışma merkezi yenilenemedi",error);}
        finally{focusDirty=false;nextDirty=false;tasksDirty=false;}
      };
      if(typeof requestAnimationFrame==="function")requestAnimationFrame(flush);
      else setTimeout(flush,16);
    });
    // Some completion paths toggle only .pd on an existing row. Track class
    // changes as well as DOM replacement; ignore unrelated attributes.
    observer.observe(plan,{subtree:true,childList:true,characterData:true,
      attributes:true,attributeFilter:["class"]});
    observer.observe(next,{subtree:true,childList:true,characterData:true});
    // Mola paneli sonradan oluşturulabilir. İçindeki geri sayım değişince
    // yalnız focusDirty tetiklenir, program/görevler tekrar taranmaz.
    observer.observe(stop,{attributes:true,attributeFilter:["data-run","data-active"],
      childList:true,characterData:true,subtree:true});
    observer.observe(pomo,{attributes:true,attributeFilter:["data-run"]});
    observer.observe(swTime,{subtree:true,childList:true,characterData:true});
    observer.observe(pomoTime,{subtree:true,childList:true,characterData:true});
    if(subject)observer.observe(subject,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:["class"]});
  }
  // When returning from a hidden screen, refresh all mirrors only once.
  document.addEventListener("yks:navigation-after",()=>{
    if(document.getElementById("home")?.classList.contains("active"))sync();
  });
  document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="visible")sync()});
  root.dataset.workReady="true";
  return{installed:true};
}
