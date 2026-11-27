import "./exam-steps-v162.css";

/* v162 · Deneme sonucu dersler sırayla: her adımda tek ders, doğru ve yanlış; sonda özet.
   Eski tablo (#dybRows, d{i}/y{i}/b{i}) kaydın kaynağı olarak kalır: TYT'de dersler grup satırına toplanıp yazılır,
   boş = grup sorusu − doğru − yanlış. Kayıt biçimi değişmez; Kaydet yine eski addDeneme'yi çağırır. */
type Loose=Record<string,any>;
type LegacyWindow=Window&Record<string,any>;
export type Lesson={name:string;cap:number;group:string};
type Step=Lesson&{row:number};
type Vals=Record<string,{d:string;y:string}>;
const L=window as unknown as LegacyWindow;

// Ders başı soru sayısı yalnız ipucu (yayınevine göre değişir); sınır grup toplamında denetlenir.
export const TYT_LESSONS:Lesson[]=[
  {name:"Türkçe",cap:40,group:"Türkçe"},
  {name:"Tarih",cap:5,group:"Sosyal Bilimler"},{name:"Coğrafya",cap:5,group:"Sosyal Bilimler"},{name:"Felsefe",cap:5,group:"Sosyal Bilimler"},{name:"Din Kültürü",cap:5,group:"Sosyal Bilimler"},
  {name:"Matematik",cap:30,group:"Temel Matematik"},{name:"Geometri",cap:10,group:"Temel Matematik"},
  {name:"Fizik",cap:7,group:"Fen Bilimleri"},{name:"Kimya",cap:7,group:"Fen Bilimleri"},{name:"Biyoloji",cap:6,group:"Fen Bilimleri"}
];
const SHORT:Record<string,string>={"Din Kültürü":"Din","Felsefe Grubu":"Felsefe"};

let installed=false,index=0,type="";
let vals:Vals={};

const esc=(v:unknown)=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]!));
const r2=(n:number)=>Math.round(n*100)/100;
const int=(v:string)=>{const n=parseInt(v,10);return Number.isFinite(n)&&n>0?n:0;};
export const net=(d:number,y:number)=>r2(d-y/4);
function byId<T extends HTMLElement=HTMLElement>(id:string):T|null{return document.getElementById(id) as T|null;}
function card():HTMLElement|null{return byId("v315ExamFormCard");}
function formType():string{return byId("dSegAYT")?.classList.contains("on")?"AYT":byId("dSegYDT")?.classList.contains("on")?"YDT":byId("dSegBRANS")?.classList.contains("on")?"BRANS":"TYT";}
function netMode():boolean{const q=byId("netQuick");return !!q&&q.style.display!=="none";}
function rows():HTMLElement[]{return Array.from(byId("dybRows")?.querySelectorAll<HTMLElement>(".dyb-grid:not(.dyb-head)")??[]);}
function rowName(row:HTMLElement):string{return (row.querySelector(".snm")?.childNodes[0]?.textContent||"").trim();}
function rowCap(row:HTMLElement):number{return int(row.querySelector("input")?.getAttribute("max")||"");}

/* Eski tablonun satırlarından adım listesi: TYT'de 10 ders grup satırına bağlanır, AYT'de alan satırları tek tek. */
export function buildSteps(type:string,table:{name:string;cap:number;hidden?:boolean}[]):Step[]{
  if(type==="TYT"){const at=(g:string)=>table.findIndex(r=>r.name===g||(g==="Temel Matematik"&&r.name==="Matematik"));return TYT_LESSONS.map(l=>({...l,row:at(l.group)})).filter(s=>s.row>=0);}
  if(type==="AYT")return table.map((r,row)=>({name:r.name,cap:r.cap,group:r.name,row,hidden:r.hidden})).filter(s=>!s.hidden).map(({hidden:_h,...s})=>s);
  return [];
}
function steps():Step[]{
  const all=!!card()?.classList.contains("eh-all-subjects");
  return buildSteps(formType(),rows().map(r=>({name:rowName(r),cap:rowCap(r),hidden:!all&&r.classList.contains("eh-off-field")})));
}
/* Bir grubun ders değerlerinden eski satıra yazılacak D/Y/B; hiç ders dolmadıysa boş kalır. */
export function groupInputs(lessons:Lesson[],values:Vals,groupCap:number):{d:string;y:string;b:string}{
  const filled=lessons.filter(l=>values[l.name]&&(values[l.name]!.d!==""||values[l.name]!.y!==""));
  if(!filled.length)return {d:"",y:"",b:""};
  const d=filled.reduce((s,l)=>s+int(values[l.name]!.d),0),y=filled.reduce((s,l)=>s+int(values[l.name]!.y),0);
  return {d:String(d),y:String(y),b:String(Math.max(0,groupCap-d-y))};
}
function legacy(row:number,k:"d"|"y"|"b"):HTMLInputElement|null{return byId<HTMLInputElement>(k+row);}
function writeGroup(list:Step[],group:string):void{
  const lessons=list.filter(s=>s.group===group),row=lessons[0]?.row;if(row==null)return;
  const r=rows()[row],out=groupInputs(lessons,vals,r?rowCap(r):0);
  for(const k of ["d","y","b"] as const){const i=legacy(row,k);if(i)i.value=out[k];}
  try{(L.livePreview as (()=>void)|undefined)?.();}catch{}
}
function groupOver(list:Step[],group:string):number{
  const lessons=list.filter(s=>s.group===group),row=lessons[0]?.row;if(row==null)return 0;
  const r=rows()[row],cap=r?rowCap(r):0,sum=lessons.reduce((s,l)=>s+int(vals[l.name]?.d||"")+int(vals[l.name]?.y||""),0);
  return cap&&sum>cap?cap:0;
}
function total():number{return r2(rows().reduce((s,_r,i)=>s+net(int(legacy(i,"d")?.value||""),int(legacy(i,"y")?.value||"")),0));}
function filled(name:string):boolean{const v=vals[name];return !!v&&(v.d!==""||v.y!=="");}

function box():HTMLElement|null{
  const c=card();if(!c)return null;let b=byId("esBox");
  if(!b){b=document.createElement("div");b.id="esBox";b.className="es-box eh-s2";byId("subjGrid")?.previousElementSibling?.before(b);b.addEventListener("click",onClick);b.addEventListener("input",onInput);b.addEventListener("keydown",onKey);}
  return b;
}
function render(focus=false):void{
  const c=card(),b=box();if(!c||!b)return;
  const list=steps();
  // Tür değişince eski kod tabloyu baştan kurar; ders değerleri de sıfırlanır.
  if(formType()!==type){type=formType();index=0;vals={};}
  const on=list.length>1&&!netMode();
  c.classList.toggle("es-on",on);c.classList.toggle("es-sum",on&&index>=list.length);
  b.hidden=!on;if(!on)return;
  index=Math.max(0,Math.min(index,list.length));
  const chips=`<div class="es-chips">${list.map((s,i)=>`<button type="button" data-go="${i}" class="${i===index?"on":filled(s.name)?"f":""}"${i===index?' aria-current="step"':""}>${esc(SHORT[s.name]||s.name)}</button>`).join("")}<button type="button" data-go="${list.length}" class="${index>=list.length?"on":""}">Özet</button></div>`;
  const bar=`<div class="es-bar"><i style="width:${Math.round(Math.min(index+1,list.length)/list.length*100)}%"></i></div>`;
  if(index>=list.length){b.innerHTML=`<div class="es-prog"><b>ÖZET</b></div>${bar}${chips}${summary(list)}<button type="button" class="btn ghost es-back" data-go="${list.length-1}">‹ Geri</button>`;return;}
  const s=list[index]!,v=vals[s.name]??{d:"",y:""},d=int(v.d),y=int(v.y),next=list[index+1];
  const sub=type==="TYT"&&s.group!==s.name?`${type} · ${s.group}`:type;
  b.innerHTML=`<div class="es-prog"><b>${index+1} / ${list.length}</b></div>${bar}${chips}
  <div class="es-lesson"><small>${esc(sub)} · ${type==="TYT"&&s.group==="Temel Matematik"?"~":""}${s.cap} soru</small><h3 id="esTitle">${esc(s.name)}</h3></div>
  <div class="es-pair" role="group" aria-labelledby="esTitle"><label class="es-in is-d"><span>Doğru</span><input id="esD" type="number" inputmode="numeric" min="0" max="${s.cap}" value="${esc(v.d)}"></label><label class="es-in is-y"><span>Yanlış</span><input id="esY" type="number" inputmode="numeric" min="0" max="${s.cap}" value="${esc(v.y)}"></label></div>
  <div class="es-live"><span>Boş<b id="esB">${Math.max(0,s.cap-d-y)}</b></span><span>Net<b id="esN">${net(d,y)}</b></span><span>Toplam net<b id="esT">${total()}</b></span></div>
  <p class="es-warn" id="esW" role="alert">${warn(list,s)}</p>
  <div class="es-nav"><button type="button" class="btn ghost" data-go="${index-1}"${index?"":" disabled"}>‹ Geri</button><button type="button" class="btn es-next" data-go="${index+1}">${next?"Sonraki · "+esc(SHORT[next.name]||next.name)+" ›":"Özete geç ›"}</button></div>
  <p class="es-hint">Bu dersi çözmediysen boş bırak.</p>`;
  // Hemen odaklanır: ders geçişinde hızlı yazılan ilk rakam kaybolmasın.
  if(focus)byId<HTMLInputElement>("esD")?.focus({preventScroll:true});
}
function warn(list:Step[],s:Step):string{const cap=groupOver(list,s.group);return cap?`${s.group===s.name?"Doğru + yanlış":s.group+" toplamı"} ${cap} soruyu geçmesin`:"";}
function summary(list:Step[]):string{
  const groups=[...new Set(list.map(s=>s.group))];let html="";
  for(const g of groups){
    const row=list.find(s=>s.group===g)!.row,d=int(legacy(row,"d")?.value||""),y=int(legacy(row,"y")?.value||""),empty=!legacy(row,"d")?.value&&!legacy(row,"y")?.value;
    const lessons=list.filter(s=>s.group===g);
    html+=`<div class="es-sr es-g">${lessons.length>1?`<span>${esc(g)}</span>`:`<button type="button" class="eh-linkbtn" data-go="${list.indexOf(lessons[0]!)}">${esc(g)}</button>`}<span>${d} D</span><span>${y} Y</span><b>${empty?"–":net(d,y)}</b></div>`;
    if(lessons.length>1)for(const s of lessons){const v=vals[s.name],sd=int(v?.d||""),sy=int(v?.y||"");html+=`<div class="es-sr"><button type="button" class="eh-linkbtn" data-go="${list.indexOf(s)}">${esc(s.name)}</button><small>${sd} D</small><small>${sy} Y</small><b>${filled(s.name)?net(sd,sy):"–"}</b></div>`;}
  }
  return `<div class="es-big"><small>Toplam net</small><b>${total()}</b></div><div class="es-sum-list">${html}</div><p class="es-hint">Düzeltmek için ders adına dokun.</p>`;
}
function go(i:number):void{index=i;render(true);if(index>=steps().length)setTimeout(()=>card()?.querySelector<HTMLElement>(":scope > .btn.green.eh-s2")?.focus({preventScroll:true}),40);}
function onClick(event:Event):void{
  const t=(event.target as HTMLElement).closest<HTMLElement>("[data-go]");if(!t||(t as HTMLButtonElement).disabled)return;
  go(Number(t.dataset.go));
}
function onInput(event:Event):void{
  const t=event.target as HTMLInputElement;if(t.id!=="esD"&&t.id!=="esY")return;
  const list=steps(),s=list[index];if(!s)return;
  const v=vals[s.name]??(vals[s.name]={d:"",y:""});v[t.id==="esD"?"d":"y"]=t.value;
  writeGroup(list,s.group);
  const d=int(v.d),y=int(v.y),set=(id:string,text:string)=>{const e=byId(id);if(e)e.textContent=text;};
  set("esB",String(Math.max(0,s.cap-d-y)));set("esN",String(net(d,y)));set("esT",String(total()));set("esW",warn(list,s));
  byId("esBox")?.querySelector(`[data-go="${index}"]`)?.classList.toggle("f",filled(s.name));
}
function onKey(event:KeyboardEvent):void{
  if(event.key!=="Enter")return;const t=event.target as HTMLElement;
  if(t.id==="esD"){event.preventDefault();byId("esY")?.focus();}else if(t.id==="esY"){event.preventDefault();go(index+1);}
}
function wrap(name:string,after:()=>void):void{
  const original=L[name];if(typeof original!=="function"||(original as {__v162?:boolean}).__v162)return;
  const fn=function(this:unknown,...args:unknown[]){const result=(original as (...a:unknown[])=>unknown).apply(this,args);try{after();}catch(error){console.error("v162 "+name,error);}return result;};
  (fn as {__v162?:boolean}).__v162=true;L[name]=fn;
}
function reset():void{type="";render();}

export function installExamStepsV162():boolean{
  if(installed)return true;const c=card();if(!c||!byId("dybRows"))return false;installed=true;
  box();
  wrap("renderDybRows",()=>render());
  wrap("toggleNetMode",()=>render());
  // Form açılınca eski tablo değerlerini korur; adımlar da korunur, ilk dersten başlanır.
  wrap("openV315ExamForm",()=>{index=0;render();});
  // Kayıt başarılıysa eski kod tabloyu boşaltır; adımlar da baştan başlar.
  wrap("addDeneme",()=>{if(rows().every((_r,i)=>!legacy(i,"d")?.value&&!legacy(i,"y")?.value&&!legacy(i,"b")?.value))reset();});
  new MutationObserver(()=>{if(c.dataset.step==="2")render(true);}).observe(c,{attributes:true,attributeFilter:["data-step"]});
  (L as Loose).YKSExamSteps={render};
  render();
  return true;
}
