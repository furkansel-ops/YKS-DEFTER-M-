import "./refined-program.css";

type ProgramBlock="r"|"s";
type ProgramView="day"|"week";
export type RefinedProgramTask={id:string;block:ProgramBlock;row:number;day:number;text:string;label:string;done:boolean};
export interface RefinedProgramBridge{
  readState():unknown;
  visibleWeek():string;
  shiftWeek(offset:number):unknown;
  thisWeek():unknown;
  setProgTab(tab:string):unknown;
  toggleCellDone(week:string,id:string):unknown;
  addToDay(text:string,day:number,weekOffset:number):unknown;
  openPlanCellMenu(week:string,block:ProgramBlock,row:number,day:number):unknown;
}
type LegacyFunction=(...args:any[])=>any;
type ProgramWindow=Window&Record<string,unknown>;
type ProgramApi={installed:boolean;refresh():void;destroy():void};
const SHORT_DAYS=["Pzt","Sal","Çar","Per","Cum","Cts","Paz"];
const FULL_DAYS=["Pazartesi","Salı","Çarşamba","Perşembe","Cuma","Cumartesi","Pazar"];
const object=(value:unknown):Record<string,unknown>=>value&&typeof value==="object"?value as Record<string,unknown>:{};
const dateKey=(date:Date)=>`${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`;
function parseDate(key:string):Date|null{
  if(!/^\d{4}-\d{2}-\d{2}$/.test(key))return null;
  const date=new Date(`${key}T12:00:00`);
  return Number.isFinite(date.getTime())&&dateKey(date)===key?date:null;
}
function monday(date:Date):Date{const result=new Date(date);result.setDate(result.getDate()-(result.getDay()+6)%7);return result;}
function offsetDate(key:string,offset:number):string{const date=parseDate(key);if(!date)return "";date.setDate(date.getDate()+offset);return dateKey(date);}

/** Read the existing cells and completion keys without normalizing or mutating state. */
export function refinedProgramTasks(state:unknown,week:string,day:number):RefinedProgramTask[]{
  if(!Number.isInteger(day)||day<0||day>6||!parseDate(week))return [];
  const source=object(state),data=object(object(source.weeks)[week]),labels=object(source.rowLabels),done=object(data.dn);
  const tasks:RefinedProgramTask[]=[];
  for(const block of ["r","s"] as const){
    const rows=data[block];if(!Array.isArray(rows))continue;
    rows.forEach((row,index)=>{
      const value=Array.isArray(row)?row[day]:null;
      if(typeof value!=="string"||!value.trim())return;
      const id=`${block}-${index}-${day}`,rowLabels=labels[block];
      const label=Array.isArray(rowLabels)&&typeof rowLabels[index]==="string"?rowLabels[index].trim():"";
      tasks.push({id,block,row:index,day,text:value.trim(),label:label||(block==="r"?"Rutin":"Çalışma"),done:Boolean(done[id])});
    });
  }
  return tasks;
}

/** Calendar-day arithmetic avoids DST changing the destination week. */
export function refinedProgramWeekOffset(week:string,now:Date):number|null{
  const target=parseDate(week),current=monday(now);if(!target||(target.getDay()+6)%7!==0)return null;
  const days=(Date.UTC(target.getFullYear(),target.getMonth(),target.getDate())-Date.UTC(current.getFullYear(),current.getMonth(),current.getDate()))/86400000;
  return days/7;
}

export function createRefinedProgramController(bridge:RefinedProgramBridge,now=()=>new Date()){
  let day=(now().getDay()+6)%7,view:ProgramView="day";
  const snapshot=()=>{
    const week=bridge.visibleWeek(),state=bridge.readState(),tasks=refinedProgramTasks(state,week,day);
    return {week,day,view,tasks,date:offsetDate(week,day),days:SHORT_DAYS.map((label,index)=>{
      const items=refinedProgramTasks(state,week,index);
      return {label,date:offsetDate(week,index),count:items.length,done:items.filter(task=>task.done).length};
    })};
  };
  return {
    snapshot,
    setView(next:ProgramView){view=next;bridge.setProgTab("week");},
    selectDay(next:number){if(!Number.isInteger(next)||next<0||next>6)return false;day=next;return true;},
    moveWeek(offset:number){if(offset!==-1&&offset!==1)return false;bridge.shiftWeek(offset);return true;},
    today(){day=(now().getDay()+6)%7;bridge.thisWeek();},
    add(text:string){
      const value=text.trim(),weekOffset=refinedProgramWeekOffset(bridge.visibleWeek(),now());
      if(!value||weekOffset===null)return false;
      return bridge.addToDay(value,day,weekOffset)===true;
    },
    toggleTask(id:string){const current=snapshot();if(!current.tasks.some(task=>task.id===id))return false;bridge.toggleCellDone(current.week,id);return true;},
    openTask(id:string){const current=snapshot(),task=current.tasks.find(item=>item.id===id);if(!task)return false;bridge.openPlanCellMenu(current.week,task.block,task.row,task.day);return true;}
  };
}

function element<K extends keyof HTMLElementTagNameMap>(tag:K,className="",text=""):HTMLElementTagNameMap[K]{
  const node=document.createElement(tag);node.className=className;if(text)node.textContent=text;return node;
}
function button(text:string,className=""):HTMLButtonElement{const node=element("button",className,text);node.type="button";return node;}
function icon(name:"check"|"plus"|"share"|"arrow"):HTMLElement{
  const paths={check:'<path d="m5 12 4 4L19 6"/>',plus:'<path d="M12 5v14M5 12h14"/>',share:'<path d="M12 16V3m-4 4 4-4 4 4M7 10H5v11h14V10h-2"/>',arrow:'<path d="m9 5 7 7-7 7"/>'};
  const node=element("span","rb-program-icon");node.setAttribute("aria-hidden","true");node.innerHTML=`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${paths[name]}</svg>`;return node;
}
function renderedWeek(screen:HTMLElement):string{
  // Classic curWeek is lexical; its rendered completion action exposes the exact visible week.
  const action=screen.querySelector("#gridS .tick[onclick],#gridR .tick[onclick]")?.getAttribute("onclick")||"";
  return action.match(/toggleCellDone\(['"](\d{4}-\d{2}-\d{2})['"]/)?.[1]||dateKey(monday(new Date()));
}
let installed:ProgramApi|undefined;

export function installRefinedProgram():ProgramApi{
  if(installed)return installed;
  const program=document.getElementById("program"),legacy=window as unknown as ProgramWindow;
  const call=(name:string,...args:unknown[])=>{const fn=legacy[name];return typeof fn==="function"?(fn as LegacyFunction).apply(window,args):undefined;};
  if(!program||!["renderPlan","shiftWeek","thisWeek","setProgTab","toggleCellDone","addToDay","openPlanCellMenu"].every(name=>typeof legacy[name]==="function"))return {installed:false,refresh(){},destroy(){}};
  const screen=program;
  const legacyPanel=element("div","rb-program-legacy");legacyPanel.id="refinedProgramLegacy";
  while(screen.firstChild)legacyPanel.append(screen.firstChild);
  const root=element("div","rb-program");root.id="refinedProgram";screen.append(root,legacyPanel);
  const controller=createRefinedProgramController({
    readState:()=>window.YKSLegacyState?.readState?.(),visibleWeek:()=>renderedWeek(screen),
    shiftWeek:offset=>call("shiftWeek",offset),thisWeek:()=>call("thisWeek"),setProgTab:tab=>call("setProgTab",tab),
    toggleCellDone:(week,id)=>call("toggleCellDone",week,id),addToDay:(text,day,offset)=>call("addToDay",text,day,offset),
    openPlanCellMenu:(week,block,row,day)=>call("openPlanCellMenu",week,block,row,day)
  });
  const heading=element("header","rb-program-heading");heading.append(element("h1","","Programım"),element("p","","Kendi planın, kendi ritmin"));
  const tabs=element("div","rb-program-tabs");tabs.setAttribute("role","group");tabs.setAttribute("aria-label","Program görünümü");
  const daily=button("Günlük"),weekly=button("Haftalık");tabs.append(daily,weekly);
  const weekNav=element("div","rb-program-weeknav"),previous=button("‹"),next=button("›"),weekLabel=element("span"),today=button("Bugün","rb-program-today");
  previous.setAttribute("aria-label","Önceki hafta");next.setAttribute("aria-label","Sonraki hafta");weekNav.append(previous,weekLabel,today,next);
  const strip=element("div","rb-program-weekstrip");strip.setAttribute("role","group");strip.setAttribute("aria-label","Program günü");
  const dayButtons=SHORT_DAYS.map((label,index)=>{
    const node=button(""),name=element("span","",label),number=element("b"),marker=element("i");marker.setAttribute("aria-hidden","true");
    node.append(name,number,marker);node.addEventListener("click",()=>{controller.selectDay(index);if(controller.snapshot().view==="week")controller.setView("day");refresh();});strip.append(node);return {node,number,marker};
  });
  const dailyPanel=element("section","rb-program-day");dailyPanel.id="refinedProgramDay";dailyPanel.setAttribute("aria-label","Günlük çalışmalar");
  const summary=element("div","rb-program-summary"),dayLabel=element("h2"),completion=element("div","rb-program-completion"),count=element("span"),progress=element("progress");progress.max=100;progress.setAttribute("aria-label","Günlük görev tamamlama");completion.append(count,progress);summary.append(dayLabel,completion);
  const list=element("div","rb-program-tasks");dailyPanel.append(summary,list);
  const actions=element("div","rb-program-actions"),add=button("","rb-program-add"),share=button("","rb-program-share"),shareStatus=element("p","rb-program-share-status");
  add.append(icon("plus"),document.createTextNode("Çalışma ekle"));add.setAttribute("aria-controls","refinedProgramAdd");add.setAttribute("aria-expanded","false");
  share.append(icon("share"),document.createTextNode("Koçla paylaş"));share.dataset.coachShareNow="";shareStatus.dataset.coachShareStatus="";shareStatus.setAttribute("role","status");
  const form=element("form","rb-program-add-form");form.id="refinedProgramAdd";form.hidden=true;
  const formLabel=element("label","","Ne çalışacaksın?"),input=element("textarea"),hint=element("p","rb-program-form-hint"),formActions=element("div","rb-program-form-actions"),save=button("Programa ekle"),cancel=button("Vazgeç");
  input.id="refinedProgramTaskText";input.rows=2;input.maxLength=600;input.required=true;input.placeholder="Örn. Matematik · Problemler · 30 soru";formLabel.htmlFor=input.id;hint.setAttribute("role","status");save.type="submit";formActions.append(save,cancel);form.append(formLabel,input,hint,formActions);
  const tools=button("Haftalık tablo ve tüm araçlar","rb-program-tools");tools.append(icon("arrow"));
  actions.append(add,form,share,shareStatus,tools);root.append(heading,tabs,weekNav,strip,dailyPanel,actions);
  let destroyed=false,queued=false;
  const schedule=()=>{if(queued||destroyed)return;queued=true;queueMicrotask(()=>{queued=false;if(!destroyed)refresh();});};
  const originalShare=()=>legacyPanel.querySelector<HTMLButtonElement>("#studentCoachProgramShare [data-coach-share-now]");
  function refresh():void{
    const state=controller.snapshot(),isDaily=state.view==="day",selected=parseDate(state.date),start=parseDate(state.week),end=parseDate(offsetDate(state.week,6));
    screen.dataset.refinedProgram=state.view;daily.setAttribute("aria-pressed",String(isDaily));weekly.setAttribute("aria-pressed",String(!isDaily));
    daily.setAttribute("aria-controls",dailyPanel.id);weekly.setAttribute("aria-controls",legacyPanel.id);dailyPanel.hidden=!isDaily;legacyPanel.hidden=isDaily;tools.hidden=!isDaily;
    weekLabel.textContent=start&&end?`${start.toLocaleDateString("tr-TR",{day:"numeric",month:"short"})} – ${end.toLocaleDateString("tr-TR",{day:"numeric",month:"short",year:"numeric"})}`:"";
    const todayKey=dateKey(new Date());
    state.days.forEach((day,index)=>{
      const item=dayButtons[index];if(!item)return;item.number.textContent=day.date.slice(-2);item.node.setAttribute("aria-pressed",String(index===state.day));item.node.setAttribute("aria-label",`${FULL_DAYS[index]}, ${day.date}, ${day.done}/${day.count} tamamlandı`);
      item.node.toggleAttribute("data-today",day.date===todayKey);item.marker.toggleAttribute("data-filled",day.count>0);item.marker.toggleAttribute("data-complete",day.count>0&&day.done===day.count);
    });
    dayLabel.textContent=selected?selected.toLocaleDateString("tr-TR",{weekday:"long",day:"numeric",month:"long"}):"Benim programım";
    const done=state.tasks.filter(task=>task.done).length;count.textContent=`${done}/${state.tasks.length} tamamlandı`;progress.value=state.tasks.length?done/state.tasks.length*100:0;
    input.setAttribute("aria-label",`${dayLabel.textContent} için çalışma`);
    const focused=document.activeElement instanceof HTMLElement?document.activeElement.dataset.rbProgramFocus:undefined;
    list.replaceChildren();
    if(!state.tasks.length){const empty=element("div","rb-program-empty");empty.append(element("strong","","Seçtiğin gün henüz boş"),element("p","","Bir çalışma ekleyerek planını oluştur. Tamamladığın görevleri buradan işaretleyebilirsin."));list.append(empty);}
    for(const task of state.tasks){
      const card=element("article","rb-program-task");card.toggleAttribute("data-done",task.done);
      const check=button("","rb-program-check"),details=button("","rb-program-task-details"),copy=element("span","rb-program-task-copy");
      check.setAttribute("aria-pressed",String(task.done));check.setAttribute("aria-label",`${task.text}: ${task.done?"tamamlanmadı olarak işaretle":"tamamla"}`);check.dataset.rbProgramFocus=`check:${task.id}`;if(task.done)check.append(icon("check"));
      const resource=object(call("cellLink",task.text)),displayText=typeof resource.ad==="string"&&resource.ad?resource.ad:task.text;
      const parts=displayText.split(/\s+·\s+/),title=parts.length>1?parts.shift()!:displayText;
      copy.append(element("strong","",title),element("small","",parts.length>1||title!==displayText?parts.join(" · "):task.label));details.append(copy,icon("arrow"));details.setAttribute("aria-label",`${task.text}: çalışma seçenekleri`);details.dataset.rbProgramFocus=`details:${task.id}`;
      check.addEventListener("click",()=>{controller.toggleTask(task.id);refresh();});details.addEventListener("click",()=>controller.openTask(task.id));card.append(check,details);list.append(card);
      if(resource.url&&typeof legacy.cellOpenLink==="function"){
        card.dataset.resource="true";
        const open=button(resource.listId?"Listeyi izle":resource.videoId?"Videoyu izle":"Bağlantıyı aç","rb-program-resource");
        open.dataset.rbProgramFocus=`resource:${task.id}`;open.setAttribute("aria-label",`${open.textContent}: ${displayText}`);
        open.addEventListener("click",()=>call("cellOpenLink",task.text));card.append(open);
        if(open.dataset.rbProgramFocus===focused)open.focus({preventScroll:true});
      }
      if(check.dataset.rbProgramFocus===focused)check.focus({preventScroll:true});if(details.dataset.rbProgramFocus===focused)details.focus({preventScroll:true});
    }
    const realShare=originalShare();share.hidden=!realShare;shareStatus.hidden=!realShare;
    if(realShare){share.disabled=realShare.disabled;const status=legacyPanel.querySelector("#studentCoachProgramShare [data-coach-share-status]")?.textContent;if(status)shareStatus.textContent=status;}
  }
  const showView=(view:ProgramView)=>{controller.setView(view);refresh();};
  daily.addEventListener("click",()=>showView("day"));weekly.addEventListener("click",()=>showView("week"));tools.addEventListener("click",()=>showView("week"));
  previous.addEventListener("click",()=>{controller.moveWeek(-1);refresh();});next.addEventListener("click",()=>{controller.moveWeek(1);refresh();});today.addEventListener("click",()=>{controller.today();refresh();});
  add.addEventListener("click",()=>{form.hidden=!form.hidden;add.setAttribute("aria-expanded",String(!form.hidden));hint.textContent="";if(!form.hidden)input.focus();});
  cancel.addEventListener("click",()=>{form.hidden=true;add.setAttribute("aria-expanded","false");add.focus();});
  form.addEventListener("submit",event=>{
    event.preventDefault();if(!input.value.trim()){hint.textContent="Eklemek istediğin çalışmayı yaz.";input.focus();return;}
    if(!controller.add(input.value)){hint.textContent="Çalışma eklenemedi. Haftalık tabloda boş bir ders satırı olup olmadığını kontrol et.";return;}
    input.value="";form.hidden=true;add.setAttribute("aria-expanded","false");refresh();add.focus();
  });
  share.addEventListener("click",()=>originalShare()?.click());
  const wrappers=new Map<string,{original:LegacyFunction;wrapped:LegacyFunction}>();
  const wrap=(name:string,before?:()=>void)=>{
    const original=legacy[name];if(typeof original!=="function")return;
    const wrapped=function(this:unknown,...args:unknown[]){before?.();const result=original.apply(this,args);schedule();return result;};
    wrappers.set(name,{original:original as LegacyFunction,wrapped});legacy[name]=wrapped;
  };
  wrap("renderPlan");wrap("planEditSelected",()=>showView("week"));
  const onNavigation=(event:Event)=>{const detail=(event as CustomEvent<{to?:string;screen?:string}>).detail;if((detail?.to??detail?.screen)==="program")schedule();};
  const events=["yks:data-changed","yks:data-primary-ready","yks:auth-state","yks:student-coach-link-ready"];
  for(const name of events)window.addEventListener(name,schedule);window.addEventListener("yks:navigation-after",onNavigation);document.addEventListener("yks:navigation-after",onNavigation);
  legacyPanel.addEventListener("input",schedule);
  // Only the retained Program tools are observed, only for asynchronous share-control insertion/removal.
  const observer=new MutationObserver(records=>{
    if(records.some(record=>[...record.addedNodes,...record.removedNodes].some(node=>node instanceof Element&&(node.id==="studentCoachProgramShare"||node.querySelector("#studentCoachProgramShare")))))schedule();
  });
  observer.observe(legacyPanel,{childList:true,subtree:true});
  call("renderPlan");refresh();
  installed={installed:true,refresh,destroy(){
    destroyed=true;observer.disconnect();for(const name of events)window.removeEventListener(name,schedule);window.removeEventListener("yks:navigation-after",onNavigation);document.removeEventListener("yks:navigation-after",onNavigation);legacyPanel.removeEventListener("input",schedule);
    for(const [name,{original,wrapped}] of wrappers)if(legacy[name]===wrapped)legacy[name]=original;
    root.remove();while(legacyPanel.firstChild)screen.insertBefore(legacyPanel.firstChild,legacyPanel);legacyPanel.remove();delete screen.dataset.refinedProgram;installed=undefined;
  }};
  return installed;
}
