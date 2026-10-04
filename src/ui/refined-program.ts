import "./refined-program.css";

type ProgramBlock="r"|"s";
type ProgramView="day"|"week";
export type RefinedProgramTask={id:string;block:ProgramBlock;row:number;day:number;text:string;label:string;done:boolean};
export type ProgramAddResult={ok:boolean;reason?:"invalid"|"full"|"save";days?:number[]};
export interface RefinedProgramBridge{
  readState():unknown;
  visibleWeek():string;
  shiftWeek(offset:number):unknown;
  thisWeek():unknown;
  setProgTab(tab:string):unknown;
  toggleCellDone(week:string,id:string):unknown;
  addToDay(text:string,day:number,weekOffset:number):unknown;
  addToDays?(text:string,days:number[],weekOffset:number):ProgramAddResult;
  setDayOrder?(week:string,day:number,ids:string[]):unknown;
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
  const source=object(state),data=object(object(source.weeks)[week]),labels=object(source.rowLabels),done=object(data.dn),move=object(data.mv);
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
  const rawOrder=move[`order-${day}`];
  if(Array.isArray(rawOrder)){
    const rank=new Map<string,number>();rawOrder.forEach((id,index)=>{if(typeof id==="string"&&!rank.has(id))rank.set(id,index);});
    tasks.sort((a,b)=>(rank.get(a.id)??Number.MAX_SAFE_INTEGER)-(rank.get(b.id)??Number.MAX_SAFE_INTEGER));
  }
  return tasks;
}

/** Calendar-day arithmetic avoids DST changing the destination week. */
export function refinedProgramWeekOffset(week:string,now:Date):number|null{
  const target=parseDate(week),current=monday(now);if(!target||(target.getDay()+6)%7!==0)return null;
  const days=(Date.UTC(target.getFullYear(),target.getMonth(),target.getDate())-Date.UTC(current.getFullYear(),current.getMonth(),current.getDate()))/86400000;
  return days/7;
}

export function refinedProgramQuickText(subject:string,topic:string,questions:string,minutes:string):string|null{
  const name=subject.trim(),parts=[name,topic.trim()].filter(Boolean);
  if(!name||name.length>120||topic.trim().length>200)return null;
  for(const [value,max,unit] of [[questions,1000,"soru"],[minutes,1440,"dk"]] as const){
    if(!value.trim())continue;
    if(!/^\d+$/.test(value)||Number(value)<1||Number(value)>max)return null;
    parts.push(`${Number(value)} ${unit}`);
  }
  return parts.join(" · ");
}

/** Optional study resource URL. Stored with the task text so old data readers keep working. */
export function refinedProgramResourceUrl(value:string):string|null{
  const raw=value.trim();
  if(!raw)return "";
  if(raw.length>500||/\s/.test(raw))return null;
  try{
    const parsed=new URL(raw);
    if(!["http:","https:"].includes(parsed.protocol)||!parsed.hostname)return null;
    return raw;
  }catch{return null;}
}

export function refinedProgramSubjectLabel(text:string,label="Çalışma"):string{
  const fallback=label.trim()||"Çalışma";
  const clean=text.replace(/\s+—\s+https?:\/\/\S+\s*$/i,"").trim();
  const first=(clean.split(/\s+·\s+/)[0]||"").trim();
  if(!first)return fallback;
  const exam=first.match(/^(TYT|AYT|YDT)\s+(.+)$/i);
  if(exam)return `${(exam[1]||"").toUpperCase()} ${(exam[2]||"").trim()}`.trim().slice(0,42);
  return first.length<=42?first:fallback;
}
function refinedProgramSubjectTone(label:string):number{
  let hash=0;for(const char of label)hash=(hash*31+char.charCodeAt(0))>>>0;
  return hash%6;
}

export function createRefinedProgramController(bridge:RefinedProgramBridge,now=()=>new Date()){
  let day=(now().getDay()+6)%7,view:ProgramView="week";
  const snapshot=()=>{
    const week=bridge.visibleWeek(),state=bridge.readState(),tasks=refinedProgramTasks(state,week,day);
    return {week,day,view,tasks,date:offsetDate(week,day),days:SHORT_DAYS.map((label,index)=>{
      const items=refinedProgramTasks(state,week,index);
      return {label,date:offsetDate(week,index),count:items.length,done:items.filter(task=>task.done).length};
    })};
  };
  return {
    snapshot,
    tasksForDay(index:number){return refinedProgramTasks(bridge.readState(),bridge.visibleWeek(),index);},
    setView(next:ProgramView){view=next;bridge.setProgTab("week");},
    selectDay(next:number){if(!Number.isInteger(next)||next<0||next>6)return false;day=next;return true;},
    moveWeek(offset:number){if(offset!==-1&&offset!==1)return false;bridge.shiftWeek(offset);return true;},
    today(){day=(now().getDay()+6)%7;bridge.thisWeek();},
    add(text:string){
      const value=text.trim(),weekOffset=refinedProgramWeekOffset(bridge.visibleWeek(),now());
      if(!value||weekOffset===null)return false;
      return bridge.addToDay(value,day,weekOffset)===true;
    },
    addMany(text:string,days:number[],week=bridge.visibleWeek()):ProgramAddResult{
      const value=text.trim(),offset=refinedProgramWeekOffset(week,now());
      if(!value||value.length>600||offset===null||!days.length||Array.from(days).some(index=>!Number.isInteger(index)||index<0||index>6)||!bridge.addToDays)return {ok:false,reason:"invalid"};
      return bridge.addToDays(value,[...new Set(days)].sort((a,b)=>a-b),offset);
    },
    toggleTask(id:string){const current=snapshot();if(!current.tasks.some(task=>task.id===id))return false;return bridge.toggleCellDone(current.week,id)!==false;},
    reorder(ids:string[]){
      const current=snapshot(),expected=current.tasks.map(task=>task.id),unique=[...new Set(ids)];
      if(!bridge.setDayOrder||unique.length!==expected.length||unique.some(id=>!expected.includes(id)))return false;
      return bridge.setDayOrder(current.week,current.day,unique)!==false;
    },
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
  if(!program||!["renderPlan","shiftWeek","thisWeek","setProgTab","toggleCellDone","addToDay","addToDays","programSetDayOrder","openPlanCellMenu"].every(name=>typeof legacy[name]==="function"))return {installed:false,refresh(){},destroy(){}};
  const screen=program;
  const legacyPanel=element("div","rb-program-legacy");legacyPanel.id="refinedProgramLegacy";
  // Keep the classic planner mounted only as an internal compatibility bridge.
  // It remains in source/DOM for existing state, dialogs and coach-share hooks, but is no longer user-accessible.
  legacyPanel.hidden=true;legacyPanel.setAttribute("aria-hidden","true");
  while(screen.firstChild)legacyPanel.append(screen.firstChild);
  const root=element("div","rb-program");root.id="refinedProgram";screen.append(root,legacyPanel);
  const controller=createRefinedProgramController({
    readState:()=>((window as unknown as ProgramWindow).S||window.YKSLegacyState?.readState?.()),visibleWeek:()=>renderedWeek(screen),
    shiftWeek:offset=>call("shiftWeek",offset),thisWeek:()=>call("thisWeek"),setProgTab:tab=>call("setProgTab",tab),
    toggleCellDone:(week,id)=>call("toggleCellDone",week,id),addToDay:(text,day,offset)=>call("addToDay",text,day,offset),
    addToDays:(text,days,offset)=>call("addToDays",text,days,offset) as ProgramAddResult,
    setDayOrder:(week,day,ids)=>call("programSetDayOrder",week,day,ids),
    openPlanCellMenu:(week,block,row,day)=>call("openPlanCellMenu",week,block,row,day)
  });
  const heading=element("header","rb-program-heading"),weekSummary=element("div","rb-program-week-summary");heading.append(element("h1","","Programım"),element("p","","Haftanı takvim görünümünde gör; derslerini gün gün takip et."),weekSummary);
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
  const weeklyPanel=element("section","rb-program-week-grid");weeklyPanel.id="refinedProgramWeek";weeklyPanel.setAttribute("aria-label","Haftalık ders takvimi");
  const summary=element("div","rb-program-summary"),dayLabel=element("h2"),completion=element("div","rb-program-completion"),count=element("span"),progress=element("progress");progress.max=100;progress.setAttribute("aria-label","Günlük görev tamamlama");completion.append(count,progress);summary.append(dayLabel,completion);
  const list=element("div","rb-program-tasks");dailyPanel.append(summary,list);
  const actions=element("div","rb-program-actions"),toolbar=element("div","rb-program-toolbar"),add=button("","rb-program-add"),share=button("","rb-program-share"),shareStatus=element("p","rb-program-share-status");
  add.append(icon("plus"),document.createTextNode("Çalışma ekle"));add.setAttribute("aria-controls","refinedProgramAdd");add.setAttribute("aria-expanded","false");
  share.append(icon("share"),document.createTextNode("Koçla paylaş"));share.dataset.coachShareNow="";shareStatus.dataset.coachShareStatus="";shareStatus.setAttribute("role","status");
  const form=element("form","rb-program-add-form");form.id="refinedProgramAdd";form.hidden=true;
  const formTabs=element("div","rb-program-form-tabs"),quickTab=button("Ders ve konu seç"),customTab=button("Kendim yazayım");formTabs.setAttribute("role","group");formTabs.setAttribute("aria-label","Çalışma ekleme yöntemi");formTabs.append(quickTab,customTab);
  const builder=element("div","rb-program-builder"),fields=element("div","rb-program-fields"),metrics=element("div","rb-program-metrics");
  const subject=element("select"),topic=element("select"),questions=element("input"),minutes=element("input"),resource=element("input");
  const field=(label:string,control:HTMLInputElement|HTMLSelectElement,id:string)=>{const wrap=element("label");control.id=id;wrap.htmlFor=id;wrap.append(element("span","",label),control);return wrap;};
  subject.required=true;questions.type=minutes.type="number";questions.min=minutes.min="1";questions.max="1000";minutes.max="1440";questions.step=minutes.step="1";questions.inputMode=minutes.inputMode="numeric";questions.placeholder="Örn. 30";minutes.placeholder="Örn. 45";
  resource.type="url";resource.inputMode="url";resource.maxLength=500;resource.setAttribute("autocomplete","url");resource.placeholder="https://youtu.be/... veya video bağlantısı";
  questions.dataset.programNumber=minutes.dataset.programNumber="";
  fields.append(field("Ders",subject,"refinedProgramSubject"),field("Konu",topic,"refinedProgramTopic"));metrics.append(field("Soru hedefi · isteğe bağlı",questions,"refinedProgramQuestions"),field("Süre (dk) · isteğe bağlı",minutes,"refinedProgramMinutes"));
  const subjects=window.YKSLegacyState?.subjects?.()??[];
  subject.append(new Option("Ders seç",""));subjects.forEach((item,index)=>subject.append(new Option(`${item.exam} · ${item.name.replace(/\s*\(AYT\)$/," ").trim()}`,String(index))));
  const presets=element("div","rb-program-presets");presets.setAttribute("aria-label","Hızlı çalışma örnekleri");
  for(const [label,name,topicName,amount] of [["Paragraf · 20 soru","Türkçe","Paragraf","20"],["Problemler · 30 soru","Matematik","Problemler","30"]] as const){
    const preset=button(label);preset.addEventListener("click",()=>{const index=subjects.findIndex(item=>item.exam==="TYT"&&item.name===name);if(index<0)return;subject.value=String(index);syncTopics();topic.value=topicName;questions.value=amount;minutes.value="";updatePreview();});presets.append(preset);
  }
  builder.append(presets,fields,metrics);
  const custom=element("div","rb-program-custom"),formLabel=element("label","","Ne çalışacaksın?"),input=element("textarea"),hint=element("p","rb-program-form-hint"),formActions=element("div","rb-program-form-actions"),save=button("Programa ekle"),cancel=button("Vazgeç");
  input.id="refinedProgramTaskText";input.rows=2;input.maxLength=600;input.placeholder="Örn. Deneme analizi · Yanlış soruların tekrarı";formLabel.htmlFor=input.id;hint.setAttribute("role","status");save.type="submit";formActions.append(save,cancel);custom.append(formLabel,input);
  const resourceField=element("div","rb-program-resource-field"),resourceHelp=element("small","","YouTube videosu, oynatma listesi veya başka bir web video bağlantısı ekleyebilirsin.");
  resourceField.append(field("Video URL · isteğe bağlı",resource,"refinedProgramVideoUrl"),resourceHelp);
  const daysField=element("fieldset","rb-program-days"),dayOptions=element("div","rb-program-day-options"),dayShortcuts=element("div","rb-program-day-shortcuts"),preview=element("div","rb-program-preview"),previewText=element("strong"),previewDays=element("span"),feedback=element("p","rb-program-feedback");
  previewDays.id="refinedProgramDestination";subject.setAttribute("aria-describedby",previewDays.id);input.setAttribute("aria-describedby",previewDays.id);resource.setAttribute("aria-describedby",previewDays.id);
  feedback.setAttribute("role","status");feedback.setAttribute("aria-live","polite");
  let quickMode=true,draftWeek=controller.snapshot().week,draftDays=new Set<number>([controller.snapshot().day]),submitting=false;
  const draftButtons=SHORT_DAYS.map((label,index)=>{const node=button(label);node.setAttribute("aria-label",FULL_DAYS[index]!);node.addEventListener("click",()=>{if(draftDays.has(index))draftDays.delete(index);else draftDays.add(index);updatePreview();});dayOptions.append(node);return node;});
  for(const [label,days] of [["Seçili gün",null],["Hafta içi",[0,1,2,3,4]],["Her gün",[0,1,2,3,4,5,6]]] as const){const node=button(label);node.addEventListener("click",()=>{draftDays=new Set(days??[controller.snapshot().day]);updatePreview();});dayShortcuts.append(node);}
  daysField.append(element("legend","","Hangi günlere eklensin?"),dayOptions,dayShortcuts);preview.append(previewText,previewDays);form.append(formTabs,builder,custom,resourceField,daysField,preview,hint,formActions);
  toolbar.append(tabs,add);actions.append(share,shareStatus);root.append(heading,toolbar,weekNav,strip,form,feedback,dailyPanel,weeklyPanel,actions);
  let destroyed=false,queued=false;
  const quickText=()=>{const item=subject.value===""?undefined:subjects[Number(subject.value)];return item?refinedProgramQuickText(`${item.exam} ${item.name.replace(/\s*\(AYT\)$/,"")}`,topic.value,questions.value,minutes.value):null;};
  function syncTopics(){topic.replaceChildren(new Option("Genel çalışma",""));const item=subject.value===""?undefined:subjects[Number(subject.value)];item?.topics.forEach(name=>topic.append(new Option(name,name)));topic.disabled=!item;updatePreview();}
  function updatePreview(){
    const baseText=(quickMode?quickText():input.value.trim())||"";
    const resourceUrl=refinedProgramResourceUrl(resource.value);
    previewText.textContent=baseText?(resourceUrl?baseText+" · video bağlantılı":baseText):"Çalışmanı seç; eklenecek plan burada görünsün.";
    const labels=[...draftDays].sort((a,b)=>a-b).map(index=>`${SHORT_DAYS[index]} ${parseDate(offsetDate(draftWeek,index))?.getDate()??""}`);
    const start=parseDate(draftWeek);previewDays.textContent=`${start?.toLocaleDateString("tr-TR",{day:"numeric",month:"long",year:"numeric"})??""} haftası · ${labels.join(", ")||"En az bir gün seç"}`;
    draftButtons.forEach((node,index)=>node.setAttribute("aria-pressed",String(draftDays.has(index))));save.textContent=draftDays.size>1?`${draftDays.size} güne ekle`:"Programa ekle";
  }
  function setMode(quick:boolean){quickMode=quick;builder.hidden=!quick;custom.hidden=quick;subject.disabled=!quick;questions.disabled=minutes.disabled=!quick;topic.disabled=!quick||subject.value==="";input.disabled=quick;input.required=!quick;quickTab.setAttribute("aria-pressed",String(quick));customTab.setAttribute("aria-pressed",String(!quick));hint.textContent="";updatePreview();}
  quickTab.addEventListener("click",()=>setMode(true));customTab.addEventListener("click",()=>setMode(false));subject.addEventListener("change",syncTopics);for(const field of [topic,questions,minutes,input,resource])field.addEventListener("input",updatePreview);syncTopics();setMode(true);
  const schedule=()=>{if(queued||destroyed)return;queued=true;queueMicrotask(()=>{queued=false;if(!destroyed)refresh();});};
  const originalShare=()=>legacyPanel.querySelector<HTMLButtonElement>("#studentCoachProgramShare [data-coach-share-now]");
  const orderedIds=()=>Array.from(list.querySelectorAll<HTMLElement>(".rb-program-task[data-task-id]")).map(node=>node.dataset.taskId||"").filter(Boolean);
  const commitOrder=(focusId:string)=>{
    const ids=orderedIds();
    if(!controller.reorder(ids)){feedback.textContent="Sıra kaydedilemedi; önceki düzen korundu.";refresh();return;}
    feedback.textContent="Günün çalışma sırası güncellendi.";
    refresh();
    queueMicrotask(()=>list.querySelector<HTMLElement>(`[data-rb-program-focus="drag:${focusId}"]`)?.focus({preventScroll:true}));
  };
  const bindReorder=(card:HTMLElement,handle:HTMLButtonElement,taskId:string)=>{
    handle.addEventListener("contextmenu",event=>event.preventDefault());
    handle.addEventListener("keydown",event=>{
      if(event.key!=="ArrowUp"&&event.key!=="ArrowDown")return;
      event.preventDefault();
      const cards=Array.from(list.querySelectorAll<HTMLElement>(".rb-program-task[data-task-id]")),index=cards.indexOf(card),next=index+(event.key==="ArrowUp"?-1:1);
      if(index<0||next<0||next>=cards.length)return;
      if(next<index)list.insertBefore(card,cards[next]!);else list.insertBefore(cards[next]!,card);
      commitOrder(taskId);
    });
    handle.addEventListener("pointerdown",event=>{
      if(event.button!==0||!event.isPrimary)return;
      event.preventDefault();
      const pointerId=event.pointerId,startX=event.clientX,startY=event.clientY;
      let active=false,timer=window.setTimeout(()=>activate(),140);
      const activate=()=>{
        if(active)return;active=true;card.classList.add("is-dragging");list.classList.add("is-reordering");
        try{handle.setPointerCapture(pointerId);}catch{}
      };
      const move=(moveEvent:PointerEvent)=>{
        if(moveEvent.pointerId!==pointerId)return;
        if(!active&&Math.hypot(moveEvent.clientX-startX,moveEvent.clientY-startY)>6){clearTimeout(timer);activate();}
        if(!active)return;moveEvent.preventDefault();
        const siblings=Array.from(list.querySelectorAll<HTMLElement>(".rb-program-task[data-task-id]:not(.is-dragging)"));
        const before=siblings.find(node=>moveEvent.clientY<node.getBoundingClientRect().top+node.getBoundingClientRect().height/2);
        list.insertBefore(card,before||null);
      };
      const finish=(finishEvent:PointerEvent)=>{
        if(finishEvent.pointerId!==pointerId)return;
        clearTimeout(timer);handle.removeEventListener("pointermove",move);handle.removeEventListener("pointerup",finish);handle.removeEventListener("pointercancel",finish);
        if(!active)return;
        card.classList.remove("is-dragging");list.classList.remove("is-reordering");try{handle.releasePointerCapture(pointerId);}catch{}
        commitOrder(taskId);
      };
      handle.addEventListener("pointermove",move);handle.addEventListener("pointerup",finish);handle.addEventListener("pointercancel",finish);
    });
  };
  function refresh():void{
    const state=controller.snapshot(),isDaily=state.view==="day",selected=parseDate(state.date),start=parseDate(state.week),end=parseDate(offsetDate(state.week,6));
    screen.dataset.refinedProgram=state.view;daily.setAttribute("aria-pressed",String(isDaily));weekly.setAttribute("aria-pressed",String(!isDaily));
    daily.setAttribute("aria-controls",dailyPanel.id);weekly.setAttribute("aria-controls",weeklyPanel.id);dailyPanel.hidden=!isDaily;weeklyPanel.hidden=isDaily;legacyPanel.hidden=true;
    const total=state.days.reduce((sum,item)=>sum+item.count,0),completed=state.days.reduce((sum,item)=>sum+item.done,0);
    weekSummary.textContent=`Haftalık plan · ${total} çalışma · ${completed} tamamlandı`;
    weekLabel.textContent=start&&end?`${start.toLocaleDateString("tr-TR",{day:"numeric",month:"short"})} – ${end.toLocaleDateString("tr-TR",{day:"numeric",month:"short",year:"numeric"})}`:"";
    const todayKey=dateKey(new Date());
    state.days.forEach((day,index)=>{
      const item=dayButtons[index];if(!item)return;item.number.textContent=day.date.slice(-2);item.node.setAttribute("aria-pressed",String(index===state.day));item.node.setAttribute("aria-label",`${FULL_DAYS[index]}, ${day.date}, ${day.done}/${day.count} tamamlandı`);
      item.node.toggleAttribute("data-today",day.date===todayKey);item.marker.toggleAttribute("data-filled",day.count>0);item.marker.toggleAttribute("data-complete",day.count>0&&day.done===day.count);
    });
    dayLabel.textContent=selected?selected.toLocaleDateString("tr-TR",{weekday:"long",day:"numeric",month:"long"}):"Benim programım";
    const done=state.tasks.filter(task=>task.done).length;count.textContent=`${done}/${state.tasks.length} tamamlandı`;progress.value=state.tasks.length?done/state.tasks.length*100:0;
    const focused=document.activeElement instanceof HTMLElement?document.activeElement.dataset.rbProgramFocus:undefined;
    list.replaceChildren();
    if(!state.tasks.length){const empty=element("div","rb-program-empty");empty.append(element("strong","","Bu günün planı henüz boş"),element("p","","Çalışma ekle’ye dokun; dersini ve konunu seç. Aynı çalışmayı birden fazla güne de ekleyebilirsin."));list.append(empty);}
    for(const task of state.tasks){
      const card=element("article","rb-program-task");card.toggleAttribute("data-done",task.done);card.dataset.taskId=task.id;
      const drag=button("⠿","rb-program-drag"),check=button("","rb-program-check"),details=button("","rb-program-task-details"),copy=element("span","rb-program-task-copy");
      drag.setAttribute("aria-label",`${task.text}: sırayı değiştir; sürükle veya ok tuşlarını kullan`);drag.dataset.rbProgramFocus=`drag:${task.id}`;
      check.setAttribute("aria-pressed",String(task.done));check.setAttribute("aria-label",`${task.text}: ${task.done?"tamamlanmadı olarak işaretle":"tamamla"}`);check.dataset.rbProgramFocus=`check:${task.id}`;if(task.done)check.append(icon("check"));
      const resource=object(call("cellLink",task.text)),displayText=typeof resource.ad==="string"&&resource.ad?resource.ad:task.text;
      const parts=displayText.split(/\s+·\s+/),title=parts.length>1?parts.shift()!:displayText;
      copy.append(element("strong","",title),element("small","",parts.length>1||title!==displayText?parts.join(" · "):task.label));details.append(copy,icon("arrow"));details.setAttribute("aria-label",`${task.text}: çalışma seçenekleri`);details.dataset.rbProgramFocus=`details:${task.id}`;
      check.addEventListener("click",()=>{controller.toggleTask(task.id);refresh();});details.addEventListener("click",()=>controller.openTask(task.id));card.append(drag,check,details);list.append(card);bindReorder(card,drag,task.id);
      if(drag.dataset.rbProgramFocus===focused)drag.focus({preventScroll:true});if(check.dataset.rbProgramFocus===focused)check.focus({preventScroll:true});if(details.dataset.rbProgramFocus===focused)details.focus({preventScroll:true});
    }
    const weekFocus=document.activeElement instanceof HTMLElement?document.activeElement.dataset.rbWeekTask:undefined;
    weeklyPanel.replaceChildren();
    const calendarMeta=element("div","rb-program-calendar-meta");
    calendarMeta.append(element("div","", "Haftalık ders planı"),element("p","","Dersler satırlarda, günler sütunlarda. Çalışmaya dokun; video, bağlantı ve düzenleme seçenekleri açılan detay ekranında."));
    const calendar=element("div","rb-program-calendar"),calendarHead=element("div","rb-program-calendar-row rb-program-calendar-head");
    calendarHead.append(element("div","rb-program-calendar-subject-head","Ders"));
    state.days.forEach((day,index)=>{
      const date=parseDate(day.date),head=button("","rb-program-calendar-day");
      head.toggleAttribute("data-today",day.date===todayKey);head.setAttribute("aria-label",`${FULL_DAYS[index]}, ${day.date}: ${day.count} çalışma`);
      head.append(element("span","",SHORT_DAYS[index]!),element("b","",String(date?.getDate()??"")),element("small","",day.count?`${day.done}/${day.count}`:"—"));
      head.addEventListener("click",()=>{controller.selectDay(index);controller.setView("day");refresh();dayButtons[index]?.node.focus({preventScroll:true});});
      calendarHead.append(head);
    });
    calendar.append(calendarHead);
    const groups=new Map<string,{tone:number;days:RefinedProgramTask[][]}>();
    state.days.forEach((_,index)=>{
      for(const task of controller.tasksForDay(index)){
        const label=refinedProgramSubjectLabel(task.text,task.label);
        let group=groups.get(label);
        if(!group){group={tone:refinedProgramSubjectTone(label),days:Array.from({length:7},()=>[])};groups.set(label,group);}
        group.days[index]!.push(task);
      }
    });
    if(!groups.size){
      const empty=element("div","rb-program-week-empty");
      empty.append(element("strong","","Bu hafta henüz çalışma yok"),element("p","","Üstteki “Çalışma ekle” butonundan ders ve gün seçerek haftanı oluştur."));
      weeklyPanel.append(calendarMeta,empty);
    }else{
      for(const [subjectName,group] of groups){
        const row=element("div","rb-program-calendar-row rb-program-subject-row");row.dataset.subjectTone=String(group.tone);
        const subjectCell=element("div","rb-program-subject-cell"),total=group.days.reduce((sum,items)=>sum+items.length,0);
        subjectCell.append(element("i",""),element("div","",subjectName),element("small","",`${total} çalışma`));row.append(subjectCell);
        group.days.forEach((items,dayIndex)=>{
          const cell=element("div","rb-program-calendar-cell");cell.toggleAttribute("data-today",state.days[dayIndex]?.date===todayKey);
          if(!items.length){cell.append(element("span","rb-program-calendar-empty","—"));}
          for(const task of items){
            const resource=object(call("cellLink",task.text)),displayText=typeof resource.ad==="string"&&resource.ad?resource.ad:task.text;
            const parts=displayText.split(/\s+·\s+/),first=(parts.shift()||displayText).trim();
            const detail=(parts.join(" · ").trim()||(first===subjectName?task.label:displayText)).replace(/\s+—\s+https?:\/\/\S+\s*$/i,"").trim();
            const taskButton=button("","rb-program-calendar-task");taskButton.toggleAttribute("data-done",task.done);taskButton.dataset.rbWeekTask=`${task.day}:${task.id}`;
            taskButton.setAttribute("aria-label",`${FULL_DAYS[task.day]}, ${subjectName}: ${displayText}${task.done?", tamamlandı":""}${resource.url?", bağlantı mevcut":""}`);
            taskButton.append(element("span","rb-program-calendar-task-state",task.done?"✓":""),element("span","rb-program-calendar-task-text",detail||subjectName));
            taskButton.addEventListener("click",()=>{controller.selectDay(task.day);controller.openTask(task.id);});
            cell.append(taskButton);if(taskButton.dataset.rbWeekTask===weekFocus)taskButton.focus({preventScroll:true});
          }
          row.append(cell);
        });
        calendar.append(row);
      }
      weeklyPanel.append(calendarMeta,calendar);
    }
    const realShare=originalShare();share.hidden=!realShare;shareStatus.hidden=!realShare;
    if(realShare){share.disabled=realShare.disabled;const status=legacyPanel.querySelector("#studentCoachProgramShare [data-coach-share-status]")?.textContent;if(status)shareStatus.textContent=status;}
  }
  const showView=(view:ProgramView)=>{controller.setView(view);refresh();};
  daily.addEventListener("click",()=>showView("day"));weekly.addEventListener("click",()=>showView("week"));
  previous.addEventListener("click",()=>{controller.moveWeek(-1);refresh();});next.addEventListener("click",()=>{controller.moveWeek(1);refresh();});today.addEventListener("click",()=>{controller.today();refresh();});
  add.addEventListener("click",()=>{form.hidden=!form.hidden;add.setAttribute("aria-expanded",String(!form.hidden));hint.textContent="";feedback.textContent="";if(!form.hidden){const state=controller.snapshot();draftWeek=state.week;draftDays=new Set([state.day]);updatePreview();(quickMode?subject:input).focus();}});
  cancel.addEventListener("click",()=>{form.hidden=true;add.setAttribute("aria-expanded","false");add.focus();});
  form.addEventListener("submit",event=>{
    event.preventDefault();if(submitting)return;
    const baseText=quickMode?quickText():input.value.trim();
    if(!baseText){hint.textContent=quickMode?"Bir ders seç; soru ve süre hedeflerini geçerli sayılarla doldur veya boş bırak.":"Eklemek istediğin çalışmayı yaz.";(quickMode?subject:input).focus();return;}
    const resourceUrl=refinedProgramResourceUrl(resource.value);
    if(resourceUrl===null){hint.textContent="Video URL geçerli bir http:// veya https:// bağlantısı olmalı.";resource.focus();return;}
    const text=resourceUrl?`${baseText} — ${resourceUrl}`:baseText;
    if(text.length>600){hint.textContent="Çalışma metni ve video bağlantısı birlikte çok uzun. Metni veya URL’yi kısalt.";resource.focus();return;}
    if(!draftDays.size){hint.textContent="En az bir gün seç.";draftButtons[0]?.focus();return;}
    submitting=true;save.disabled=true;
    try{
      const result=controller.addMany(text,[...draftDays],draftWeek);
      if(!result.ok){hint.textContent=result.reason==="full"?"Bu gün için çok fazla çalışma var. Daha eski veya gereksiz bir görevi kaldırıp tekrar dene.":result.reason==="save"?"Plan kaydedilemedi. Çalışman burada duruyor; tekrar deneyebilirsin.":"Plan eklenemedi. Dersini ve seçtiğin günleri kontrol et.";return;}
      feedback.textContent=`${draftDays.size} güne çalışma eklendi. ${previewDays.textContent}`;
      input.value="";resource.value="";form.hidden=true;add.setAttribute("aria-expanded","false");refresh();add.focus();
    }finally{submitting=false;save.disabled=false;}
  });
  share.addEventListener("click",()=>originalShare()?.click());
  const wrappers=new Map<string,{original:LegacyFunction;wrapped:LegacyFunction}>();
  const wrap=(name:string,before?:()=>void)=>{
    const original=legacy[name];if(typeof original!=="function")return;
    const wrapped=function(this:unknown,...args:unknown[]){before?.();const result=original.apply(this,args);schedule();return result;};
    wrappers.set(name,{original:original as LegacyFunction,wrapped});legacy[name]=wrapped;
  };
  wrap("renderPlan");wrap("planEditSelected",()=>controller.setView("week"));
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
