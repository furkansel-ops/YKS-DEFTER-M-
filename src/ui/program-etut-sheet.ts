/* Etüt oluştur/düzenle penceresi: üstte sabit özet + günün şeridi, başlangıç ve bitiş saati, boş etüt süresi, mola ve uzun mola,
   sürükle-bırak sıra (klavyede ok tuşları), süre +/−, "bugün katma" ve ara mola. Boş etüde ders seçilmez.
   Kaydetmeyi çağıran yapar (Program'daki mevcut updateTask/reorder + programSetEtut). */
import "./program-etut.css";
import {ETUT_BLOCKS,ETUT_GAPS,ETUT_LONGS,ETUT_LONG_FROM,ETUT_MIDS,ETUT_MID_MIN,etutClock,etutLongLabel,etutLongShift,etutSchedule,etutSegments,etutSpan,taskMinutes,type EtutItem,type EtutPlan,type EtutSchedule} from "./program-etut";

export type EtutSheetTask={id:string;subject:string;title:string;tone:string;text:string;done:boolean};
export type EtutSheetResult={order:string[];minutes:Map<string,number>;plan:EtutPlan|null};
export type EtutTimelineActions={toggle(id:string):void;open(id:string):void};
/** Ders bağlanmamış (boş) etüdün kartında yazan tek şey. */
export const ETUT_FREE_TITLE="Ders";
type RowView={item:HTMLLIElement;time:HTMLElement;inc:HTMLButtonElement;step:HTMLElement;input:HTMLInputElement;quick:HTMLElement;midBox:HTMLElement;midToggle:HTMLButtonElement;midButtons:{node:HTMLButtonElement;minutes:number}[]};
type Row={task:EtutSheetTask;minutes:number;mid:number;on:boolean;view?:RowView};

const STEP=15,MAX=600,QUICK=[30,45,60,90,120],START_CHIPS=[9*60,10*60,14*60],LENGTHS=[240,360,480,600],DEFAULT_LENGTH=480,MAX_END=1435;
const make=<K extends keyof HTMLElementTagNameMap>(tag:K,className="",text="")=>{const node=document.createElement(tag);node.className=className;if(text)node.textContent=text;return node;};
const btn=(text:string,className="")=>{const node=make("button",className,text);node.type="button";return node;};
const toTime=(value:string)=>{const m=/^(\d{2}):(\d{2})$/.exec(value);return m?Number(m[1])*60+Number(m[2]):-1;};
const svg=(path:string)=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${path}</svg>`;
const ICON={
  check:'<path d="m5 12 4 4L19 6"/>',
  grip:'<circle cx="9" cy="6" r="1.2"/><circle cx="15" cy="6" r="1.2"/><circle cx="9" cy="12" r="1.2"/><circle cx="15" cy="12" r="1.2"/><circle cx="9" cy="18" r="1.2"/><circle cx="15" cy="18" r="1.2"/>',
  cup:'<path d="M4 8h13v5a6 6 0 0 1-6 6h-1a6 6 0 0 1-6-6z"/><path d="M17 10h1.5a2.5 2.5 0 0 1 0 5H17"/>'
};
const clockOf=(item:{start:number;end:number})=>`${etutClock(item.start)}–${etutClock(item.end)}`;

/** Etüt sekmesinin zaman çizelgesi: Günlük Plan'ın v103 kart/saat görünümüyle aynı sınıflar.
    Görevli etütte tik yalnız görevi tamamlar (Odak'a bir şey yazmaz). Boş etütte tik yoktur; kartta yalnız "Ders" ve saati yazar. */
export function renderEtutTimeline(list:HTMLElement,tasks:readonly EtutSheetTask[],schedule:EtutSchedule,actions:EtutTimelineActions){
  const byId=new Map(tasks.map(task=>[task.id,task]));
  const next=schedule.items.find(item=>item.kind==="task"&&byId.has(item.id)&&!byId.get(item.id)!.done)?.id;
  list.replaceChildren();
  for(const item of schedule.items){
    if(item.kind==="gap"){list.append(make("div","rb-v103-free rb-etut-break",`${clockOf(item)} · ${item.end-item.start} dk mola`));continue;}
    if(item.kind==="long"){list.append(make("div","rb-v103-free rb-etut-break rb-etut-meal",`${clockOf(item)} · Yemek ve dinlenme · ${etutLongLabel(item.end-item.start)}`));continue;}
    const slot=schedule.slots.get(item.id)!,task=byId.get(item.id);
    if(item.kind==="task"&&!task)continue;
    const wrap=make("div","rb-v103-slot"),card=make("article","rb-program-task"),copy=make("span","rb-program-task-copy");
    const line=[slot.label,etutSpan(slot.end-slot.start-slot.mid),slot.mid?`${etutClock(slot.midAt)} ara mola ${slot.mid} dk`:""].filter(Boolean).join(" · ");
    wrap.append(make("time","rb-v103-time",etutClock(slot.start)));
    if(!task){
      const details=make("div","rb-program-task-details");
      card.toggleAttribute("data-etut-free",true);
      copy.append(make("strong","",ETUT_FREE_TITLE),make("small","",line));details.append(copy);card.append(details);
      wrap.append(card);list.append(wrap);continue;
    }
    if(task.tone){wrap.dataset.v4Tone=task.tone;card.dataset.v4Tone=task.tone;}
    card.toggleAttribute("data-done",task.done);
    const check=btn("","rb-program-check"),details=btn("","rb-program-task-details");
    check.setAttribute("aria-pressed",String(task.done));check.setAttribute("aria-label",`${task.title}: ${task.done?"bitmedi olarak işaretle":"tamamlandı olarak işaretle"}`);
    if(task.done)check.innerHTML='<span class="rb-program-icon" aria-hidden="true">'+svg(ICON.check)+"</span>";
    if(task.subject)copy.append(make("span","rb-v103-subject",task.subject));
    copy.append(make("strong","",task.title),make("small","",line));
    details.append(copy,make("span","rb-program-task-open","›"));details.setAttribute("aria-label",`${task.title} çalışma detayını aç`);
    details.addEventListener("click",()=>actions.open(item.id));
    check.addEventListener("click",()=>actions.toggle(item.id));
    card.append(check,details);
    if(item.id===next){card.toggleAttribute("data-v103-next",true);card.append(make("span","rb-v103-next","Sırada"));}
    wrap.append(card);list.append(wrap);
  }
  const loose=tasks.filter(task=>!schedule.slots.has(task.id));
  if(loose.length)list.append(make("p","rb-etut-loose",`Etüde girmeyen: ${loose.map(task=>task.title).join(", ")}`));
}

export function createEtutSheet(onSave:(result:EtutSheetResult)=>boolean){
  const root=make("div","rb-etut");root.hidden=true;root.setAttribute("role","dialog");root.setAttribute("aria-modal","true");root.setAttribute("aria-labelledby","rbEtutTitle");
  const card=make("form","rb-etut-card"),grab=make("span","rb-etut-grab"),head=make("div","rb-etut-head"),headCopy=make("div"),dateLabel=make("small"),title=make("h2","","Etüt oluştur"),close=btn("×","rb-etut-close");
  title.id="rbEtutTitle";close.setAttribute("aria-label","Etüt penceresini kapat");headCopy.append(dateLabel,title);head.append(headCopy,close);
  // Üstte sabit özet: başlangıç → bitiş, ders/mola/toplam, günün şeridi.
  const sum=make("section","rb-etut-sum"),big=make("div","rb-etut-big"),bigStart=make("b"),bigEnd=make("b"),meta=make("div","rb-etut-meta"),bar=make("div","rb-etut-daybar"),ticks=make("div","rb-etut-ticks"),warn=make("p","rb-etut-warn");
  sum.setAttribute("aria-live","polite");bar.setAttribute("aria-hidden","true");big.append(bigStart,make("span","","→"),bigEnd);sum.append(big,meta,bar,ticks,warn);
  // Saatler: başlangıç ve bitişi kullanıcı seçer; "Toplam" kısayolu bitişi başlangıca göre ayarlar.
  const startBox=make("section","rb-etut-box"),startLabel=make("label","rb-etut-label","Başlangıç"),startRow=make("div","rb-etut-start"),startField=make("span","rb-etut-time-field"),startInput=make("input"),startChips=make("div","rb-etut-chips");
  startInput.type="time";startInput.step="300";startInput.id="rbEtutStart";startInput.required=true;startLabel.htmlFor=startInput.id;startField.append(startInput);
  const endLabel=make("label","rb-etut-label","Bitiş"),endRow=make("div","rb-etut-start"),endField=make("span","rb-etut-time-field"),endInput=make("input"),lengthChips=make("div","rb-etut-chips");
  endInput.type="time";endInput.step="300";endInput.id="rbEtutEnd";endInput.required=true;endLabel.htmlFor=endInput.id;endField.append(endInput);
  lengthChips.setAttribute("role","group");lengthChips.setAttribute("aria-label","Toplam etüt süresi");
  const nowChip=btn("Şimdi");nowChip.addEventListener("click",()=>{const date=now(),total=Math.ceil((date.getHours()*60+date.getMinutes())/5)*5%1440;startInput.value=etutClock(total);changed();});
  const timeChips=START_CHIPS.map(minutes=>{const node=btn(etutClock(minutes));node.addEventListener("click",()=>{startInput.value=etutClock(minutes);changed();});return {node,minutes};});
  const lengthButtons=LENGTHS.map(minutes=>{const node=btn(etutSpan(minutes));node.addEventListener("click",()=>{const start=toTime(startInput.value);if(start<0)return;endInput.value=etutClock(Math.min(MAX_END,start+minutes));changed();});lengthChips.append(node);return {node,minutes};});
  startChips.append(nowChip,...timeChips.map(chip=>chip.node));startRow.append(startField,startChips);endRow.append(endField,lengthChips);startBox.append(startLabel,startRow,endLabel,endRow);
  const segment=(label:string,values:readonly number[],text:(value:number)=>string,choose:(value:number)=>void)=>{
    const row=make("div","rb-etut-seg");row.setAttribute("role","group");row.setAttribute("aria-label",label);
    return {row,buttons:values.map(value=>{const node=btn(text(value));node.addEventListener("click",()=>choose(value));row.append(node);return {node,value};})};
  };
  const blockBox=make("section","rb-etut-box"),blockLabel=make("span","rb-etut-label","Etüt süresi"),blockSeg=segment("Dersi olmayan etütlerin süresi",ETUT_BLOCKS,value=>value+" dk",value=>{block=value;update();});
  blockLabel.append(make("em","","dersi olmayan etütler için"));blockBox.append(blockLabel,blockSeg.row);
  const gapBox=make("section","rb-etut-box"),gapSeg=segment("Etütler arası mola",ETUT_GAPS,value=>value+" dk",value=>{gap=value;update();});
  gapBox.append(make("span","rb-etut-label","Etütler arası mola"),gapSeg.row);
  // Uzun mola: uygulama ortaya en yakın araya koyar; Erken/Geç bir önceki / sonraki araya kaydırır.
  const longBox=make("section","rb-etut-box"),longLabel=make("span","rb-etut-label","Uzun mola"),longSeg=segment("Uzun mola",ETUT_LONGS,value=>value?etutLongLabel(value):"Yok",value=>{long=value;longTouched=true;update();});
  const longLine=make("div","rb-etut-longline"),longTime=make("b"),longEarly=btn("‹ Erken"),longLate=btn("Geç ›"),longHint=make("span");
  longEarly.setAttribute("aria-label","Uzun molayı bir önceki araya al");longLate.setAttribute("aria-label","Uzun molayı bir sonraki araya al");
  longEarly.addEventListener("click",()=>{if(shift.earlier!==null){longAt=shift.earlier;update();}});
  longLate.addEventListener("click",()=>{if(shift.later!==null){longAt=shift.later;update();}});
  longLabel.append(make("em","","yemek, dinlenme"));longLine.append(longTime,longEarly,longLate,longHint);longBox.append(longLabel,longSeg.row,longLine);
  const listBox=make("section","rb-etut-box"),listHead=make("span","rb-etut-label","Günün sırası"),list=make("ol","rb-etut-list");
  listHead.append(make("em","","ders bağlamak isteğe bağlı"));listBox.append(listHead,list);
  const foot=make("div","rb-etut-foot"),remove=btn("Kaldır","rb-etut-remove"),submit=make("button","rb-etut-submit","Kaydet");submit.type="submit";
  foot.append(remove,submit);card.append(grab,head,sum,startBox,blockBox,gapBox,longBox,listBox,foot);root.append(card);

  let rows:Row[]=[],gap:number=15,block:number=60,long:number=0,longAt:number|null=null,longTouched=false,now=()=>new Date(),lastEnd="";
  let shift:{earlier:number|null;later:number|null}={earlier:null,later:null};
  const taskList=()=>rows.map(row=>({id:row.task.id,minutes:row.minutes}));
  const plan=():EtutPlan|null=>{
    const start=toTime(startInput.value),end=toTime(endInput.value);if(start<0||end<=start)return null;
    const mid:Record<string,number>={};rows.forEach(row=>{if(row.on&&row.mid&&row.minutes>=ETUT_MID_MIN)mid[row.task.id]=row.mid;});
    const value:EtutPlan={start,gap,mid,skip:rows.filter(row=>!row.on).map(row=>row.task.id),end,block};
    if(long){value.long=long;if(longAt!==null)value.longAt=longAt;}
    return value;
  };
  // Kullanıcı uzun molaya dokunmadıysa süreye göre önerilir (ETUT_LONG_FROM ve üstü → 1 saat).
  const suggestLong=()=>{if(longTouched)return;const start=toTime(startInput.value),end=toTime(endInput.value);long=start>=0&&end-start>=ETUT_LONG_FROM?60:0;};
  const changed=()=>{suggestLong();update();};
  function paintSummary(schedule:EtutSchedule|null){
    const ready=Boolean(schedule?.slots.size),start=toTime(startInput.value),end=toTime(endInput.value);
    bigStart.textContent=startInput.value||"--:--";bigEnd.textContent=ready?etutClock(schedule!.end):"--:--";
    const rests=ready?schedule!.breaks.size+[...schedule!.slots.values()].filter(slot=>slot.mid).length:0;
    meta.replaceChildren(...(ready?[`${etutSpan(schedule!.study)} ders`,`${rests} mola`,schedule!.long?`${etutLongLabel(schedule!.long.end-schedule!.long.start)} uzun mola`:"",`${etutSpan(schedule!.end-schedule!.start)} toplam`].filter(Boolean):["Başlangıç ve bitişi seç"]).map(text=>make("span","",text)));
    const tone=new Map(rows.map(row=>[row.task.id,row.task.tone]));
    bar.replaceChildren(...(ready?etutSegments(schedule!):[]).map((part,index)=>{
      const piece=make("i","rb-etut-seg-"+part.kind);
      piece.style.flex=String(part.minutes);piece.style.setProperty("--i",String(index));
      if(part.kind==="task")piece.dataset.v4Tone=tone.get(part.id)||"other";
      return piece;
    }));
    ticks.replaceChildren(...(ready?[schedule!.start,Math.round((schedule!.start+schedule!.end)/2),schedule!.end]:[]).map(value=>make("span","",etutClock(value))));
    const message=start<0||end<0?"Başlangıç ve bitiş saatini seç.":end<=start?"Bitiş saati başlangıçtan sonra olmalı.":!ready?"Bu aralık bir etüt için çok kısa."
      :schedule!.end>1440?"Plan gece yarısını geçiyor; başlangıcı öne al ya da süreleri kısalt."
      :schedule!.end>end?`Dersler bitiş saatini ${etutSpan(schedule!.end-end)} aşıyor; bitişi ileri al ya da bir dersi çıkar.`
      :long&&!schedule!.long?"Uzun mola için yer yok; etüt çok kısa.":"";
    warn.textContent=message;warn.hidden=!message;
    const shown=bigEnd.textContent;if(shown!==lastEnd){lastEnd=shown;bigEnd.classList.remove("rb-etut-bump");void bigEnd.offsetWidth;bigEnd.classList.add("rb-etut-bump");}
    submit.disabled=!ready;
  }
  function paintRow(row:Row,schedule:EtutSchedule|null){
    const view=row.view;if(!view)return;
    const slot=schedule?.slots.get(row.task.id),isLong=row.on&&row.minutes>=ETUT_MID_MIN;
    view.item.toggleAttribute("data-off",!row.on);view.item.toggleAttribute("data-loose",row.on&&!row.minutes);
    view.inc.setAttribute("aria-pressed",String(row.on));view.inc.innerHTML=row.on?svg(ICON.check):"";
    view.time.textContent=!row.on?"Bugün etüde katılmadı":slot?slot.label:"Süresiz · süre ver, etüde girsin";
    view.step.hidden=!row.on||!row.minutes;view.quick.hidden=!row.on||Boolean(row.minutes);
    if(document.activeElement!==view.input)view.input.value=row.minutes?String(row.minutes):"";
    view.midBox.hidden=!isLong;
    view.midToggle.lastChild!.textContent=row.mid?`Ortasında ${row.mid} dk mola`:"Ara mola yok";
    view.midButtons.forEach(item=>item.node.setAttribute("aria-pressed",String(item.minutes===row.mid)));
  }
  // Boş etüt satırı: yalnız "Ders" ve saati; ders seçilmez.
  function freeRow(item:EtutItem):HTMLLIElement{
    const node=make("li","rb-etut-row rb-etut-free"),label=make("div","rb-etut-name");
    node.dataset.extra=item.id;
    label.append(make("b","",ETUT_FREE_TITLE),make("em","",`${clockOf(item)} · ${etutSpan(item.end-item.start)}`));
    node.append(make("span","rb-etut-dot"),label);
    return node;
  }
  function mealRow(item:EtutItem):HTMLLIElement{
    const node=make("li","rb-etut-row rb-etut-meal"),mark=make("span","rb-etut-dot"),label=make("div","rb-etut-name");
    node.dataset.extra="long";mark.innerHTML=svg(ICON.cup);
    label.append(make("b","","Yemek ve dinlenme"),make("em","",`${clockOf(item)} · ${etutLongLabel(item.end-item.start)}`));
    node.append(mark,label);return node;
  }
  // Boş etütler görev satırlarının altına, uzun mola önceki etüdün ardına yerleşir; her güncellemede yeniden kurulur.
  function paintExtras(schedule:EtutSchedule|null){
    const focused=(document.activeElement as HTMLElement|null)?.closest<HTMLElement>("[data-extra]")?.dataset.extra;
    list.querySelectorAll("[data-extra]").forEach(node=>node.remove());
    if(!schedule)return;
    const nodes=new Map<string,HTMLElement>(rows.map(row=>[row.task.id,row.view!.item]));
    for(const item of schedule.items){
      if(item.kind==="free"){const node=freeRow(item);nodes.set(item.id,node);list.append(node);}
      else if(item.kind==="long")nodes.get(item.id)?.after(mealRow(item));
    }
    if(focused)list.querySelector<HTMLElement>(`[data-extra="${focused}"] button`)?.focus({preventScroll:true});
  }
  function update(){
    const current=plan(),schedule=current?etutSchedule(taskList(),current):null,start=toTime(startInput.value),end=toTime(endInput.value);
    shift=schedule?etutLongShift(schedule,gap):{earlier:null,later:null};
    paintSummary(schedule);rows.forEach(row=>paintRow(row,schedule));paintExtras(schedule);
    gapSeg.buttons.forEach(item=>item.node.setAttribute("aria-pressed",String(item.value===gap)));
    blockSeg.buttons.forEach(item=>item.node.setAttribute("aria-pressed",String(item.value===block)));
    longSeg.buttons.forEach(item=>item.node.setAttribute("aria-pressed",String(item.value===long)));
    timeChips.forEach(chip=>chip.node.setAttribute("aria-pressed",String(chip.minutes===start)));
    lengthButtons.forEach(chip=>chip.node.setAttribute("aria-pressed",String(start>=0&&end-start===chip.minutes)));
    const meal=schedule?.long||null;
    longTime.hidden=longEarly.hidden=longLate.hidden=!meal;longTime.textContent=meal?clockOf(meal):"";
    longEarly.disabled=shift.earlier===null;longLate.disabled=shift.later===null;
    longHint.textContent=!long?`${ETUT_LONG_FROM/60} saat ve üstü etütte 1 saatlik mola kendiliğinden önerilir.`:meal?"":"Uzun mola için yer yok.";
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
  startInput.addEventListener("input",changed);endInput.addEventListener("input",changed);
  const finish=(value:EtutPlan|null)=>{
    if(onSave({order:rows.map(row=>row.task.id),minutes:new Map(rows.map(row=>[row.task.id,row.minutes])),plan:value}))hide();
  };
  card.addEventListener("submit",event=>{
    event.preventDefault();const value=plan();if(!value||submit.disabled)return;
    finish(value);
  });
  remove.addEventListener("click",()=>finish(null));

  return {
    element:root,
    open(options:{date:string;tasks:EtutSheetTask[];plan:EtutPlan|null;now:()=>Date}){
      now=options.now;lastEnd="";
      const saved=options.plan,skipped=new Set(saved?.skip||[]);
      rows=options.tasks.map(task=>({task,minutes:taskMinutes(task.text),mid:saved?.mid[task.id]||0,on:!skipped.has(task.id)}));
      gap=saved&&(ETUT_GAPS as readonly number[]).includes(saved.gap)?saved.gap:15;block=saved?.block||60;
      // Bitiş: kayıtlıysa o. Eski (bitişsiz) etütte derslerin bittiği saat; yeni etütte başlangıç + 8 saat (dersler sığmıyorsa onların bitişi).
      const start=saved?.start??9*60,tasksEnd=Math.ceil(etutSchedule(taskList(),{start,gap,mid:saved?.mid||{},skip:saved?.skip||[]}).end/5)*5;
      const end=saved?.end??Math.min(MAX_END,saved&&tasksEnd>start?tasksEnd:Math.max(start+DEFAULT_LENGTH,tasksEnd));
      startInput.value=etutClock(start);endInput.value=etutClock(end);
      // Uzun mola: yeni etütte süreye göre önerilir; kayıtlı etütte kullanıcının seçimi korunur (eski etütte yok).
      long=saved?.long||0;longAt=saved?.longAt??null;longTouched=Boolean(saved);suggestLong();
      dateLabel.textContent=options.date;title.textContent=saved?"Etütleri düzenle":"Etüt oluştur";
      remove.hidden=!saved;submit.textContent=saved?"Kaydet":"Etütleri oluştur";
      list.replaceChildren(...rows.map(buildRow));update();root.hidden=false;card.scrollTop=0;
      requestAnimationFrame(()=>startInput.focus({preventScroll:true}));
    },
    close:hide
  };
}
