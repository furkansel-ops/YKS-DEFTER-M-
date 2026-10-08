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
  updateTask?(week:string,id:string,text:string):unknown;
  deleteTask?(week:string,id:string):unknown;
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
      const rowLabel=Array.isArray(rowLabels)&&typeof rowLabels[index]==="string"?rowLabels[index].trim():"";
      const detected=block==="s"?refinedProgramDetectedSubject(value):"";
      tasks.push({id,block,row:index,day,text:value.trim(),label:detected||rowLabel||(block==="r"?"Rutin":"Çalışma"),done:Boolean(done[id])});
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

export type RefinedProgramTaskDetail={display:string;title:string;meta:string;url:string;hasVideo:boolean};

/** Daily detail presentation without changing the legacy task storage format. */
export function refinedProgramTaskDetail(text:string,label="Çalışma"):RefinedProgramTaskDetail{
  const raw=String(text||"").trim(),match=raw.match(/https?:\/\/[^\s]+/);
  const url=match?match[0].replace(/[.,;)]+$/,""):"";
  const display=(url?raw.replace(url,""):raw).replace(/^[▶☰]\s*/,"").replace(/[\s—–-]+$/,"").trim()||label;
  const parts=display.split(/\s+·\s+/).map(part=>part.trim()).filter(Boolean);
  const title=(parts.shift()||label||"Çalışma").slice(0,160);
  const meta=(parts.join(" · ")||(display!==title?display:label)).slice(0,320);
  let hasVideo=false;
  if(url){try{const parsed=new URL(url),host=parsed.hostname.toLowerCase();hasVideo=["youtube.com","www.youtube.com","m.youtube.com","music.youtube.com","youtu.be","www.youtu.be"].includes(host);}catch{}}
  return {display,title,meta,url,hasVideo};
}
function refinedProgramDetectedSubject(text:string):string{
  const clean=text
    .replace(/^Koç\s*·\s*(?:Deneme sonrası\s*·\s*)?/i,"")
    .replace(/\s+—\s+https?:\/\/\S+\s*$/i,"")
    .trim();
  const subjects=[
    ["Matematik",/matematik/i],["Geometri",/geometri/i],["Fizik",/fizik/i],["Kimya",/kimya/i],["Biyoloji",/biyoloji/i],
    ["Türkçe",/türkçe/i],["Edebiyat",/(?:türk dili ve edebiyatı|edebiyat)/i],["Tarih",/tarih/i],["Coğrafya",/coğrafya/i],
    ["Felsefe",/felsefe/i],["Din",/(?:din kültürü|\bdin\b)/i],["İngilizce",/(?:ingilizce|english)/i]
  ] as const;
  const exam=clean.match(/^(TYT|AYT|YDT)\b/i)?.[1]?.toUpperCase()||"";
  const body=exam?clean.replace(/^(TYT|AYT|YDT)\b\s*/i,""):clean;
  for(const [label,pattern] of subjects){
    const match=body.match(pattern);if(match&&match.index!==undefined&&match.index<=8)return exam?`${exam} ${label}`:label;
  }
  return "";
}

export function refinedProgramSubjectLabel(text:string,label="Çalışma"):string{
  const fallback=label.trim()||"Çalışma",detected=refinedProgramDetectedSubject(text);
  if(detected)return detected;
  const clean=text.replace(/^Koç\s*·\s*(?:Deneme sonrası\s*·\s*)?/i,"").replace(/\s+—\s+https?:\/\/\S+\s*$/i,"").trim();
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
    updateTask(id:string,text:string,week=bridge.visibleWeek()){const value=text.trim(),match=id.match(/^[rs]-\d+-([0-6])$/),dayIndex=match?Number(match[1]):-1,task=match&&parseDate(week)?refinedProgramTasks(bridge.readState(),week,dayIndex).find(item=>item.id===id):undefined;if(!task||!bridge.updateTask||!value||value.length>600)return false;return bridge.updateTask(week,id,value)!==false;},
    deleteTask(id:string,week=bridge.visibleWeek()){const match=id.match(/^[rs]-\d+-([0-6])$/),dayIndex=match?Number(match[1]):-1,task=match&&parseDate(week)?refinedProgramTasks(bridge.readState(),week,dayIndex).find(item=>item.id===id):undefined;if(!task||!bridge.deleteTask)return false;return bridge.deleteTask(week,id)!==false;}
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
  if(!program||!["renderPlan","shiftWeek","thisWeek","setProgTab","toggleCellDone","addToDay","addToDays","programUpdateTask","programDeleteTask"].every(name=>typeof legacy[name]==="function"))return {installed:false,refresh(){},destroy(){}};
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
    updateTask:(week,id,text)=>call("programUpdateTask",week,id,text),
    deleteTask:(week,id)=>call("programDeleteTask",week,id)
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
  const editor=element("div","rb-program-editor");editor.hidden=true;editor.setAttribute("role","dialog");editor.setAttribute("aria-modal","true");editor.setAttribute("aria-labelledby","rbProgramEditorTitle");
  const editorForm=element("form","rb-program-editor-card"),editorHead=element("div","rb-program-editor-head"),editorTitle=element("h2","","Çalışmayı düzenle"),editorClose=button("×","rb-program-editor-close"),editorLabel=element("label","rb-program-editor-label","Çalışma"),editorInput=element("textarea","rb-program-editor-input"),editorHint=element("p","rb-program-editor-hint"),editorActions=element("div","rb-program-editor-actions"),editorDelete=button("Sil","rb-program-editor-delete"),editorCancel=button("Vazgeç"),editorSave=button("Kaydet","rb-program-editor-save");
  editorTitle.id="rbProgramEditorTitle";editorInput.rows=4;editorInput.maxLength=600;editorInput.id="rbProgramEditorInput";editorLabel.htmlFor=editorInput.id;editorClose.setAttribute("aria-label","Düzenlemeyi kapat");editorHint.textContent="En fazla 600 karakter. Değişiklik mevcut çalışmanın üzerine kaydedilir.";editorSave.type="submit";editorDelete.setAttribute("aria-label","Bu çalışmayı sil");editorHead.append(editorTitle,editorClose);editorActions.append(editorDelete,editorCancel,editorSave);editorForm.append(editorHead,editorLabel,editorInput,editorHint,editorActions);editor.append(editorForm);
  const detailDialog=element("div","rb-program-detail");detailDialog.hidden=true;detailDialog.setAttribute("role","dialog");detailDialog.setAttribute("aria-modal","true");detailDialog.setAttribute("aria-labelledby","rbProgramDetailTitle");
  const detailCard=element("div","rb-program-detail-card"),detailHead=element("div","rb-program-detail-head"),detailHeading=element("div","rb-program-detail-heading"),detailEyebrow=element("span","rb-program-detail-eyebrow","Günlük çalışma"),detailTitle=element("h2"),detailClose=button("×","rb-program-detail-close"),detailMeta=element("p","rb-program-detail-meta"),detailResource=element("div","rb-program-detail-resource"),detailActions=element("div","rb-program-detail-actions"),detailVideo=button("▶ YouTube videosuna git","rb-program-detail-video"),detailDone=button("✓ Tamamladım","rb-program-detail-done");
  detailTitle.id="rbProgramDetailTitle";detailClose.setAttribute("aria-label","Çalışma detayını kapat");detailHeading.append(detailEyebrow,detailTitle);detailHead.append(detailHeading,detailClose);detailActions.append(detailVideo,detailDone);detailCard.append(detailHead,detailMeta,detailResource,detailActions);detailDialog.append(detailCard);
  let detailTaskId="",detailWeek="",detailTaskText="";
  const closeDetail=()=>{detailTaskId="";detailWeek="";detailTaskText="";detailDialog.hidden=true;};
  const openDetail=(task:RefinedProgramTask,week=controller.snapshot().week)=>{
    const info=refinedProgramTaskDetail(task.text,task.label),resource=object(call("cellLink",task.text));
    detailTaskId=task.id;detailWeek=week;detailTaskText=task.text;detailTitle.textContent=info.title;detailMeta.textContent=info.meta||task.label;
    const linked=typeof resource.url==="string"&&Boolean(resource.url);detailResource.replaceChildren();
    if(linked){const badge=element("span","rb-program-detail-resource-badge",info.hasVideo?"YouTube bağlantısı":"Kaynak bağlantısı"),copy=element("small","",String(resource.url));copy.title=String(resource.url);detailResource.append(badge,copy);detailVideo.textContent=info.hasVideo?"▶ YouTube videosuna git":"↗ Kaynağı aç";}
    else{detailResource.append(element("span","rb-program-detail-resource-badge","Konu içeriği"),element("small","","Bu çalışmaya kayıtlı video yok; varsa konu videosunu açabilirsin."));detailVideo.textContent="▶ Konu videosunu aç";}
    detailVideo.dataset.hasLink=String(linked);detailDone.textContent=task.done?"↶ Tamamlanmadı olarak işaretle":"✓ Tamamladım";detailDone.toggleAttribute("data-done",task.done);detailDialog.hidden=false;requestAnimationFrame(()=>detailVideo.focus());
  };
  let editingTaskId="",editingWeek="";
  const closeEditor=()=>{editingTaskId="";editingWeek="";editor.hidden=true;editorInput.value="";};
  const openEditor=(task:RefinedProgramTask,week=controller.snapshot().week)=>{editingTaskId=task.id;editingWeek=week;editorInput.value=task.text;editorHint.textContent="En fazla 600 karakter. Değişiklik mevcut çalışmanın üzerine kaydedilir.";editor.hidden=false;requestAnimationFrame(()=>{editorInput.focus();editorInput.setSelectionRange(editorInput.value.length,editorInput.value.length);});};

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
  toolbar.append(tabs,add);actions.append(share,shareStatus);root.append(heading,toolbar,weekNav,strip,form,feedback,dailyPanel,weeklyPanel,actions,detailDialog,editor);
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
      const check=button("","rb-program-check"),details=button("","rb-program-task-details"),copy=element("span","rb-program-task-copy"),openMark=element("span","rb-program-task-open","›");
      check.setAttribute("aria-pressed",String(task.done));check.setAttribute("aria-label",`${task.text}: ${task.done?"tamamlanmadı olarak işaretle":"tamamla"}`);if(task.done)check.append(icon("check"));
      const resource=object(call("cellLink",task.text)),displayText=typeof resource.ad==="string"&&resource.ad?resource.ad:task.text;
      const parts=displayText.split(/\s+·\s+/),title=parts.length>1?parts.shift()!:displayText;
      copy.append(element("strong","",title),element("small","",parts.length>1||title!==displayText?parts.join(" · "):task.label));
      const resourceBadge=element("span","rb-program-task-resource",typeof resource.url==="string"&&resource.url?"▶ Video / kaynak":"Detayı aç");
      details.setAttribute("aria-label",`${displayText} çalışma detayını aç`);details.append(copy,resourceBadge,openMark);
      check.addEventListener("click",()=>{controller.toggleTask(task.id);refresh();});
      details.addEventListener("click",()=>openDetail(task,state.week));
      card.append(check,details);list.append(card);
    }
    const weekFocus=document.activeElement instanceof HTMLElement?document.activeElement.dataset.rbWeekTask:undefined;
    weeklyPanel.replaceChildren();
    const calendarMeta=element("div","rb-program-calendar-meta");
    calendarMeta.append(element("div","", "Haftalık ders planı"),element("p","","Dersler satırlarda, günler sütunlarda. Düzenlemek için yalnız çalışma yazısına dokun."));
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
            const taskButton=element("div","rb-program-calendar-task");taskButton.toggleAttribute("data-done",task.done);taskButton.dataset.rbWeekTask=`${task.day}:${task.id}`;
            const stateMark=element("span","rb-program-calendar-task-state",task.done?"✓":"");
            const textButton=button(detail||subjectName,"rb-program-calendar-task-text");textButton.title=displayText;textButton.setAttribute("aria-label",`${FULL_DAYS[task.day]}, ${subjectName}: ${displayText} düzenle`);
            textButton.addEventListener("click",()=>{controller.selectDay(task.day);openEditor(task,state.week);});
            taskButton.append(stateMark,textButton);cell.append(taskButton);
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
  detailClose.addEventListener("click",closeDetail);detailDialog.addEventListener("click",event=>{if(event.target===detailDialog)closeDetail();});
  detailVideo.addEventListener("click",()=>{
    if(!detailTaskText)return;
    const linked=detailVideo.dataset.hasLink==="true",opened=linked?call("cellOpenLink",detailTaskText):call("cellVideo",detailTaskText);
    if(opened===false)call("toast",linked?"Bağlantı açılamadı.":"Bu çalışma için konu videosu bulunamadı.");
  });
  detailDone.addEventListener("click",()=>{
    if(!detailTaskId||!detailWeek)return;
    const current=controller.snapshot().tasks.find(item=>item.id===detailTaskId),wasDone=Boolean(current?.done);
    if(controller.toggleTask(detailTaskId)){closeDetail();refresh();call("toast",wasDone?"Çalışma tekrar açıldı.":"Çalışma tamamlandı ✓");}
  });
  editorClose.addEventListener("click",closeEditor);editorCancel.addEventListener("click",closeEditor);editor.addEventListener("click",event=>{if(event.target===editor)closeEditor();});
  editorDelete.addEventListener("click",()=>{if(!editingTaskId||!editingWeek)return;if(!confirm("Bu çalışma programdan silinsin mi?"))return;editorDelete.disabled=true;try{if(!controller.deleteTask(editingTaskId,editingWeek)){editorHint.textContent="Çalışma silinemedi. Tekrar dene.";return;}closeEditor();feedback.textContent="Çalışma silindi.";refresh();call("toast","Çalışma silindi");}finally{editorDelete.disabled=false;}});
  editorForm.addEventListener("submit",event=>{event.preventDefault();const value=editorInput.value.trim();if(!editingTaskId||!editingWeek||!value){editorHint.textContent="Çalışma boş bırakılamaz.";editorInput.focus();return;}editorSave.disabled=true;try{if(!controller.updateTask(editingTaskId,value,editingWeek)){editorHint.textContent="Değişiklik kaydedilemedi. Tekrar dene.";return;}closeEditor();feedback.textContent="Çalışma güncellendi.";refresh();}finally{editorSave.disabled=false;}});
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
