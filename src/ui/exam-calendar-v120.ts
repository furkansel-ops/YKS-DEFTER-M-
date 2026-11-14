import "./exam-calendar-v120.css";
import {PLAN_TYPES,makePlan,planRows,type ExamPlan} from "../domain/exam-calendar.ts";

/* v120 · Deneme takvimi kartı: Deneme › Özet'te planlanan denemeler ve kalan gün.
   exam-hub-v73 kartı window.YKSExamCalendar.html() ile ister. Günü gelen planda "Sonucu gir" deneme formunu açar ve planı kaldırır. */
type Loose=Record<string,any>;
type LegacyWindow=Window&Record<string,any>&{YKSLegacyState?:{readState?:()=>Loose;save?:()=>unknown}};
const L=window as unknown as LegacyWindow;
const TYPE_LABEL:Record<string,string>={TYT:"TYT",AYT:"AYT",YDT:"YDT",BRANS:"Branş"};
let installed=false,formOpen=false;

const esc=(v:unknown)=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]!));
function state():Loose{try{return L.YKSLegacyState?.readState?.()??{};}catch{return {};}}
function plans():ExamPlan[]{const s=state();if(!Array.isArray(s.examPlans))s.examPlans=[];return s.examPlans;}
function today():string{const d=new Date();return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");}
function toast(text:string):void{try{(L.toast as ((t:string)=>void)|undefined)?.(text);}catch{}}
function dayLabel(date:string):string{return new Date(Number(date.slice(0,4)),Number(date.slice(5,7))-1,Number(date.slice(8,10))).toLocaleDateString("tr-TR",{day:"numeric",month:"short",weekday:"short"});}
/* Deneme ekranını yeniden çizdirir (exam-hub bu eski çizimi dinler); commit önce kaydeder. */
function redraw():void{try{(L.renderV315Dashboard as (()=>void)|undefined)?.();}catch{}}
function commit():void{try{L.YKSLegacyState?.save?.();}catch(error){console.error("v120 kaydet",error);}redraw();}

export function examCalendarHtml(now=today()):string{
  const rows=planRows(plans(),now),next=rows.find(r=>r.daysLeft>=0);
  const head=next?(next.daysLeft===0?"bugün deneme var":`sıradaki ${next.daysLeft} gün sonra`):"planlı deneme yok";
  let html=`<div class="card ec-card"><div class="eh-card-head"><b>Deneme takvimi</b><small>${head}</small></div>`;
  html+=rows.map(r=>{
    const due=r.daysLeft<=0,when=r.daysLeft>0?`<b>${r.daysLeft}</b><small>gün</small>`:r.daysLeft===0?`<b>Bugün</b>`:`<b>Geçti</b>`;
    return `<div class="eh-hist ec-row${due?" is-due":""}"><span class="ec-when">${when}</span><span class="eh-hist-main"><b>${esc(r.name)}</b><small>${esc(TYPE_LABEL[r.type]||r.type)} · ${esc(dayLabel(r.date))}</small></span><span class="ec-act">${due?`<button type="button" class="btn green small" data-plan-act="result" data-id="${r.id}">Sonucu gir</button>`:""}<button type="button" class="eh-del" data-plan-act="delete" data-id="${r.id}" aria-label="${esc(r.name)} planını sil"><i class="eh-ic" data-ic="bin" aria-hidden="true"></i></button></span></div>`;
  }).join("");
  if(formOpen)html+=`<div class="eh-form ec-form"><div class="row2"><div><label for="ecDate">Tarih</label><input type="date" id="ecDate" min="${now}" value="${now}"></div><div><label for="ecType">Tür</label><select id="ecType">${PLAN_TYPES.map(t=>`<option value="${t}">${TYPE_LABEL[t]}</option>`).join("")}</select></div></div>
    <label for="ecName">Deneme adı</label><input type="text" id="ecName" maxlength="80" placeholder="Örn. Özdebir TYT-5" autocomplete="off">
    <button type="button" class="btn green" data-plan-act="save">Takvime ekle</button></div>`;
  return html+`<div class="eh-add-row"><button type="button" class="btn ghost" data-plan-act="form" aria-expanded="${formOpen}">${formOpen?"Vazgeç":"+ Deneme planla"}</button></div></div>`;
}

function onClick(event:Event):void{
  const act=(event.target as HTMLElement).closest<HTMLElement>("[data-plan-act]");if(!act)return;
  const a=act.dataset.planAct,id=Number(act.dataset.id),list=plans(),value=(elementId:string)=>(document.getElementById(elementId) as HTMLInputElement|HTMLSelectElement|null)?.value;
  if(a==="form"){formOpen=!formOpen;redraw();if(formOpen)document.getElementById("ecName")?.focus();return;}
  if(a==="save"){
    const plan=makePlan({date:value("ecDate"),name:value("ecName"),type:value("ecType")},today(),Date.now());
    if(!plan){toast("Bugün ya da ileri bir tarih seç");return;}
    list.push(plan);formOpen=false;commit();toast("Deneme takvime eklendi");return;
  }
  const index=list.findIndex(p=>Number(p?.id)===id);if(index<0)return;
  if(a==="delete"){const [gone]=list.splice(index,1);commit();toast(`"${gone!.name}" planı silindi`);}
  else if(a==="result"){list.splice(index,1);commit();try{(L.openV315ExamForm as (()=>void)|undefined)?.();}catch{}}
}

export function installExamCalendarV120():void{
  if(installed)return;installed=true;
  L.YKSExamCalendar={html:examCalendarHtml};
  document.addEventListener("click",onClick);
}
