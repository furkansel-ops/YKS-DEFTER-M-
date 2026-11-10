/* Etüt oluştur/düzenle penceresi: üstte sabit özet + günün şeridi, başlangıç kısayolları, mola seçimi,
   sürükle-bırak sıra (klavyede ok tuşları), süre +/−, "bugün katma" ve isteğe bağlı ara mola.
   Kaydetmeyi çağıran yapar (Program'daki mevcut updateTask/reorder + programSetEtut). */
import "./program-etut.css";
import {ETUT_GAPS,ETUT_MIDS,ETUT_MID_MIN,etutClock,etutSchedule,etutSegments,etutSpan,taskMinutes,type EtutPlan} from "./program-etut";

export type EtutSheetTask={id:string;subject:string;title:string;tone:string;text:string;done:boolean};
export type EtutSheetResult={order:string[];minutes:Map<string,number>;plan:EtutPlan|null};
type RowView={item:HTMLLIElement;time:HTMLElement;inc:HTMLButtonElement;step:HTMLElement;input:HTMLInputElement;quick:HTMLElement;midBox:HTMLElement;midToggle:HTMLButtonElement;midButtons:{node:HTMLButtonElement;minutes:number}[]};
type Row={task:EtutSheetTask;minutes:number;mid:number;on:boolean;view?:RowView};

const STEP=15,MAX=600,QUICK=[30,45,60,90,120],START_CHIPS=[9*60,10*60,14*60];
const make=<K extends keyof HTMLElementTagNameMap>(tag:K,className="",text="")=>{const node=document.createElement(tag);node.className=className;if(text)node.textContent=text;return node;};
const btn=(text:string,className="")=>{const node=make("button",className,text);node.type="button";return node;};
const toTime=(value:string)=>{const m=/^(\d{2}):(\d{2})$/.exec(value);return m?Number(m[1])*60+Number(m[2]):-1;};
const svg=(path:string)=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${path}</svg>`;
const ICON={
  check:'<path d="m5 12 4 4L19 6"/>',
  grip:'<circle cx="9" cy="6" r="1.2"/><circle cx="15" cy="6" r="1.2"/><circle cx="9" cy="12" r="1.2"/><circle cx="15" cy="12" r="1.2"/><circle cx="9" cy="18" r="1.2"/><circle cx="15" cy="18" r="1.2"/>',
  cup:'<path d="M4 8h13v5a6 6 0 0 1-6 6h-1a6 6 0 0 1-6-6z"/><path d="M17 10h1.5a2.5 2.5 0 0 1 0 5H17"/>'
};

/** Etüt sekmesinin zaman çizelgesi: Günlük Plan'ın v103 kart/saat görünümüyle aynı sınıflar; yalnız etüde giren görevler. */
export function renderEtutTimeline(list:HTMLElement,tasks:readonly EtutSheetTask[],schedule:ReturnType<typeof etutSchedule>,actions:{toggle(id:string):void;open(id:string):void}){
  list.replaceChildren();
  const timed=tasks.filter(task=>schedule.slots.has(task.id)),loose=tasks.filter(task=>!schedule.slots.has(task.id));
  const next=timed.find(task=>!task.done)?.id;
  timed.forEach(task=>{
    const slot=schedule.slots.get(task.id)!,wrap=make("div","rb-v103-slot");wrap.dataset.v4Tone=task.tone;
    wrap.append(make("time","rb-v103-time",etutClock(slot.start)));
    const card=make("article","rb-program-task");card.dataset.v4Tone=task.tone;card.toggleAttribute("data-done",task.done);
    const check=btn("","rb-program-check"),details=btn("","rb-program-task-details"),copy=make("span","rb-program-task-copy");
    check.setAttribute("aria-pressed",String(task.done));check.setAttribute("aria-label",`${task.title}: ${task.done?"tamamlanmadı olarak işaretle":"tamamla"}`);
    if(task.done)check.innerHTML='<span class="rb-program-icon" aria-hidden="true">'+svg(ICON.check)+"</span>";
    const line=[slot.label,etutSpan(slot.end-slot.start-slot.mid),slot.mid?`${etutClock(slot.midAt)} ara mola ${slot.mid} dk`:""].filter(Boolean).join(" · ");
    if(task.subject)copy.append(make("span","rb-v103-subject",task.subject));
    copy.append(make("strong","",task.title),make("small","",line));details.append(copy,make("span","rb-program-task-open","›"));
    details.setAttribute("aria-label",`${task.title} çalışma detayını aç`);
    check.addEventListener("click",()=>actions.toggle(task.id));details.addEventListener("click",()=>actions.open(task.id));
    card.append(check,details);
    if(task.id===next){card.toggleAttribute("data-v103-next",true);card.append(make("span","rb-v103-next","Sırada"));}
    wrap.append(card);list.append(wrap);
    const rest=schedule.breaks.get(task.id);
    if(rest)list.append(make("div","rb-v103-free rb-etut-break",`${etutClock(slot.end)}–${etutClock(slot.end+rest)} · ${rest} dk mola`));
  });
  if(loose.length)list.append(make("p","rb-etut-loose",`Etüde girmeyen: ${loose.map(task=>task.title).join(", ")}`));
}

export function createEtutSheet(onSave:(result:EtutSheetResult)=>boolean){
  const root=make("div","rb-etut");root.hidden=true;root.setAttribute("role","dialog");root.setAttribute("aria-modal","true");root.setAttribute("aria-labelledby","rbEtutTitle");
  const card=make("form","rb-etut-card"),grab=make("span","rb-etut-grab"),head=make("div","rb-etut-head"),headCopy=make("div"),dateLabel=make("small"),title=make("h2","","Etüt oluştur"),close=btn("×","rb-etut-close");
  title.id="rbEtutTitle";close.setAttribute("aria-label","Etüt penceresini kapat");headCopy.append(dateLabel,title);head.append(headCopy,close);
  // Üstte sabit özet: başlangıç → bitiş, ders/mola/toplam, günün şeridi.
  const sum=make("section","rb-etut-sum"),big=make("div","rb-etut-big"),bigStart=make("b"),bigEnd=make("b"),meta=make("div","rb-etut-meta"),bar=make("div","rb-etut-daybar"),ticks=make("div","rb-etut-ticks"),warn=make("p","rb-etut-warn","Plan gece yarısını geçiyor; başlangıcı öne al ya da süreleri kısalt.");
  sum.setAttribute("aria-live","polite");bar.setAttribute("aria-hidden","true");big.append(bigStart,make("span","","→"),bigEnd);sum.append(big,meta,bar,ticks,warn);
  const startBox=make("section","rb-etut-box"),startLabel=make("label","rb-etut-label","Başlangıç"),startRow=make("div","rb-etut-start"),startField=make("span","rb-etut-time-field"),startInput=make("input"),startChips=make("div","rb-etut-chips");
  startInput.type="time";startInput.step="300";startInput.id="rbEtutStart";startInput.required=true;startLabel.htmlFor=startInput.id;startField.append(startInput);
  const nowChip=btn("Şimdi");nowChip.addEventListener("click",()=>{const date=now(),total=Math.ceil((date.getHours()*60+date.getMinutes())/5)*5%1440;startInput.value=etutClock(total);update();});
  const timeChips=START_CHIPS.map(minutes=>{const node=btn(etutClock(minutes));node.addEventListener("click",()=>{startInput.value=etutClock(minutes);update();});return {node,minutes};});
  startChips.append(nowChip,...timeChips.map(chip=>chip.node));startRow.append(startField,startChips);startBox.append(startLabel,startRow);
  const gapBox=make("section","rb-etut-box"),gapRow=make("div","rb-etut-seg");gapRow.setAttribute("role","group");gapRow.setAttribute("aria-label","Etütler arası mola");
  const gapButtons=ETUT_GAPS.map(minutes=>{const node=btn(minutes+" dk");node.addEventListener("click",()=>{gap=minutes;update();});gapRow.append(node);return {node,minutes};});
  gapBox.append(make("span","rb-etut-label","Etütler arası mola"),gapRow);
  const listBox=make("section","rb-etut-box"),listHead=make("span","rb-etut-label","Sıra ve süre"),list=make("ol","rb-etut-list");
  listHead.append(make("em","","tut, sürükle"));listBox.append(listHead,list);
  const foot=make("div","rb-etut-foot"),remove=btn("Kaldır","rb-etut-remove"),submit=make("button","rb-etut-submit","Kaydet");submit.type="submit";
  foot.append(remove,submit);card.append(grab,head,sum,startBox,gapBox,listBox,foot);root.append(card);

  let rows:Row[]=[],gap:number=15,now=()=>new Date(),lastEnd="";
  const plan=():EtutPlan|null=>{
    const start=toTime(startInput.value);if(start<0)return null;
    const mid:Record<string,number>={};rows.forEach(row=>{if(row.on&&row.mid&&row.minutes>=ETUT_MID_MIN)mid[row.task.id]=row.mid;});
    return {start,gap,mid,skip:rows.filter(row=>!row.on).map(row=>row.task.id)};
  };
  function paintSummary(schedule:ReturnType<typeof etutSchedule>|null){
    const ready=Boolean(schedule?.slots.size);
    bigStart.textContent=startInput.value||"--:--";bigEnd.textContent=ready?etutClock(schedule!.end):"--:--";
    meta.replaceChildren(...(ready?[`${etutSpan(schedule!.study)} ders`,`${schedule!.breaks.size+[...schedule!.slots.values()].filter(slot=>slot.mid).length} mola`,`${etutSpan(schedule!.end-schedule!.start)} toplam`]:["Süre verdiğin dersler sırayla dizilir"]).map(text=>make("span","",text)));
    const tone=new Map(rows.map(row=>[row.task.id,row.task.tone]));
    bar.replaceChildren(...(ready?etutSegments(schedule!):[]).map((part,index)=>{const piece=make("i",part.kind==="task"?"rb-etut-seg-task":"rb-etut-seg-rest");piece.style.flex=String(part.minutes);piece.style.setProperty("--i",String(index));if(part.kind==="task")piece.dataset.v4Tone=tone.get(part.id)||"other";return piece;}));
    ticks.replaceChildren(...(ready?[schedule!.start,Math.round((schedule!.start+schedule!.end)/2),schedule!.end]:[]).map(value=>make("span","",etutClock(value))));
    warn.hidden=!ready||schedule!.end<=1440;
    const end=bigEnd.textContent;if(end!==lastEnd){lastEnd=end;bigEnd.classList.remove("rb-etut-bump");void bigEnd.offsetWidth;bigEnd.classList.add("rb-etut-bump");}
    submit.disabled=!ready;
  }
  function paintRow(row:Row,schedule:ReturnType<typeof etutSchedule>|null){
    const view=row.view;if(!view)return;
    const slot=schedule?.slots.get(row.task.id),long=row.on&&row.minutes>=ETUT_MID_MIN;
    view.item.toggleAttribute("data-off",!row.on);view.item.toggleAttribute("data-loose",row.on&&!row.minutes);
    view.inc.setAttribute("aria-pressed",String(row.on));view.inc.innerHTML=row.on?svg(ICON.check):"";
    view.time.textContent=!row.on?"Bugün etüde katılmadı":slot?slot.label:"Süresiz · süre ver, etüde girsin";
    view.step.hidden=!row.on||!row.minutes;view.quick.hidden=!row.on||Boolean(row.minutes);
    if(document.activeElement!==view.input)view.input.value=row.minutes?String(row.minutes):"";
    view.midBox.hidden=!long;
    view.midToggle.lastChild!.textContent=row.mid?`Ortasında ${row.mid} dk mola`:"Ara mola yok";
    view.midButtons.forEach(item=>item.node.setAttribute("aria-pressed",String(item.minutes===row.mid)));
  }
  function update(){
    const current=plan(),schedule=current?etutSchedule(rows.map(row=>({id:row.task.id,minutes:row.minutes})),current):null;
    paintSummary(schedule);rows.forEach(row=>paintRow(row,schedule));
    gapButtons.forEach(item=>item.node.setAttribute("aria-pressed",String(item.minutes===gap)));
    const start=toTime(startInput.value);timeChips.forEach(chip=>chip.node.setAttribute("aria-pressed",String(chip.minutes===start)));
  }
  const syncOrder=()=>{const byItem=new Map(rows.map(row=>[row.view!.item,row]));rows=[...list.children].map(node=>byItem.get(node as HTMLLIElement)!).filter(Boolean);};
  const flash=(item:HTMLElement)=>{item.removeAttribute("data-moved");void item.offsetWidth;item.toggleAttribute("data-moved",true);};
  function buildRow(row:Row,index:number):HTMLLIElement{
    const item=make("li","rb-etut-row");item.dataset.v4Tone=row.task.tone;item.style.setProperty("--i",String(index));item.toggleAttribute("data-done",row.task.done);
    const grip=btn("","rb-etut-grip");grip.innerHTML=svg(ICON.grip);grip.setAttribute("aria-label",`${row.task.title}: sırayı değiştir (yukarı/aşağı ok)`);
    const inc=btn("","rb-etut-inc");inc.setAttribute("aria-label",`${row.task.title} bugünkü etüde dahil`);
    const name=make("div","rb-etut-name"),time=make("em");if(row.task.subject)name.append(make("small","",row.task.subject));name.append(make("b","",row.task.title),time);
    const step=make("div","rb-etut-step"),minus=btn("−"),plus=btn("+"),input=make("input"),unit=make("small","","dk");
    input.type="number";input.min="0";input.max=String(MAX);input.step="5";input.inputMode="numeric";input.setAttribute("aria-label",`${row.task.title} süresi (dakika)`);
    minus.setAttribute("aria-label",`${row.task.title} süresini ${STEP} dk azalt`);plus.setAttribute("aria-label",`${row.task.title} süresini ${STEP} dk artır`);
    const value=make("label","rb-etut-step-value");value.append(input,unit);step.append(minus,value,plus);
    const quick=make("div","rb-etut-quick");quick.setAttribute("role","group");quick.setAttribute("aria-label",`${row.task.title} için süre seç`);
    const setMinutes=(minutes:number)=>{row.minutes=Math.max(0,Math.min(MAX,minutes));update();};
    QUICK.forEach(minutes=>{const chip=btn(String(minutes));chip.setAttribute("aria-label",`${minutes} dakika`);chip.addEventListener("click",()=>{setMinutes(minutes);input.focus({preventScroll:true});});quick.append(chip);});
    minus.addEventListener("click",()=>setMinutes(row.minutes-STEP));plus.addEventListener("click",()=>setMinutes(row.minutes+STEP));
    input.addEventListener("input",()=>{const n=Number(input.value);row.minutes=Number.isInteger(n)&&n>0&&n<=MAX?n:0;update();});
    input.addEventListener("blur",()=>update());
    const midBox=make("div","rb-etut-midbox"),midToggle=btn("","rb-etut-midtoggle"),midSeg=make("div","rb-etut-seg rb-etut-seg-sm");
    midToggle.innerHTML=svg(ICON.cup);midToggle.append(document.createTextNode(""));midToggle.setAttribute("aria-expanded","false");
    midToggle.addEventListener("click",()=>{const open=!midBox.hasAttribute("data-open");midBox.toggleAttribute("data-open",open);midToggle.setAttribute("aria-expanded",String(open));});
    const midButtons=ETUT_MIDS.map(minutes=>{const node=btn(minutes?minutes+" dk":"Yok");node.addEventListener("click",()=>{row.mid=minutes;update();});midSeg.append(node);return {node,minutes};});
    midBox.toggleAttribute("data-open",Boolean(row.mid));midToggle.setAttribute("aria-expanded",String(Boolean(row.mid)));midBox.append(midToggle,midSeg);
    inc.addEventListener("click",()=>{row.on=!row.on;update();});
    // Sürükle-bırak: tutamaktan tutulur, satır parmağın altındaki yere taşınır; bırakınca sıra listeden okunur.
    // shortcut: liste uzun olup pencere kaydırma gerektirirse kenarda otomatik kaydırma yok; gerekirse eklenir.
    grip.addEventListener("pointerdown",event=>{
      event.preventDefault();try{grip.setPointerCapture(event.pointerId);}catch{/* yakalama yoksa da olaylar tutamağa gelir */}item.toggleAttribute("data-lift",true);
      const move=(next:PointerEvent)=>{
        const target=([...list.children] as HTMLElement[]).filter(node=>node!==item).find(node=>{const box=node.getBoundingClientRect();return next.clientY<box.top+box.height/2;})||null;
        if(target!==item.nextElementSibling&&!(target===null&&item===list.lastElementChild))list.insertBefore(item,target);
      };
      const end=()=>{grip.removeEventListener("pointermove",move);grip.removeEventListener("pointerup",end);grip.removeEventListener("pointercancel",end);item.removeAttribute("data-lift");syncOrder();flash(item);update();};
      grip.addEventListener("pointermove",move);grip.addEventListener("pointerup",end);grip.addEventListener("pointercancel",end);
    });
    grip.addEventListener("keydown",event=>{
      if(event.key!=="ArrowUp"&&event.key!=="ArrowDown")return;event.preventDefault();
      const sibling=event.key==="ArrowUp"?item.previousElementSibling:item.nextElementSibling?.nextElementSibling??null;
      if(event.key==="ArrowUp"&&!sibling)return;if(event.key==="ArrowDown"&&!item.nextElementSibling)return;
      list.insertBefore(item,sibling);syncOrder();flash(item);update();grip.focus({preventScroll:true});
    });
    item.append(grip,inc,name,step,quick,midBox);
    row.view={item,time,inc,step,input,quick,midBox,midToggle,midButtons};
    return item;
  }
  const hide=()=>{root.hidden=true;};
  close.addEventListener("click",hide);
  root.addEventListener("click",event=>{if(event.target===root)hide();});
  root.addEventListener("keydown",event=>{if(event.key==="Escape")hide();});
  startInput.addEventListener("input",update);
  const finish=(value:EtutPlan|null)=>{
    if(onSave({order:rows.map(row=>row.task.id),minutes:new Map(rows.map(row=>[row.task.id,row.minutes])),plan:value}))hide();
  };
  card.addEventListener("submit",event=>{event.preventDefault();const value=plan();if(value&&!submit.disabled)finish(value);});
  remove.addEventListener("click",()=>finish(null));

  return {
    element:root,
    open(options:{date:string;tasks:EtutSheetTask[];plan:EtutPlan|null;now:()=>Date}){
      now=options.now;lastEnd="";
      const skipped=new Set(options.plan?.skip||[]);
      rows=options.tasks.map(task=>({task,minutes:taskMinutes(task.text),mid:options.plan?.mid[task.id]||0,on:!skipped.has(task.id)}));
      gap=options.plan&&(ETUT_GAPS as readonly number[]).includes(options.plan.gap)?options.plan.gap:15;
      startInput.value=etutClock(options.plan?.start??9*60);
      dateLabel.textContent=options.date;title.textContent=options.plan?"Etütleri düzenle":"Etüt oluştur";
      remove.hidden=!options.plan;submit.textContent=options.plan?"Kaydet":"Etütleri oluştur";
      list.replaceChildren(...rows.map(buildRow));update();root.hidden=false;card.scrollTop=0;
      requestAnimationFrame(()=>startInput.focus({preventScroll:true}));
    },
    close:hide
  };
}
