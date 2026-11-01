import "./exam-hub-v73.css";
import {analyzeExams,type ExamAnalysisType,type ExamAnalysisWindow} from "../domain/exam-analysis-service.ts";
import {analyzeLearningCycle} from "../domain/learning-cycle-analysis-service";

/* v73 · Deneme ekranı: Özet · Analiz · Hatalar · Geçmiş sekmeleri, adım adım deneme ekleme,
   tek Hata Defteri listesi, iki deneme karşılaştırma ve ayarlar sayfası.
   Veri yapısı değişmez: denemeler S.denemeler'de, yanlışlar S.wrongLog'da, çözüldü/tekrar bilgisi
   Hata Defteri'nin (S.errorJournal, S.manualReviews) kendi kayıtlarında kalır. Eski fonksiyonlar çağrılır. */

type Loose=Record<string,any>;
export type Tab="ozet"|"analiz"|"hata"|"gecmis";
type LegacyFn=(...args:any[])=>any;
type LegacyWindow=Window&Record<string,any>&{
  YKSLegacyState?:{readState?:()=>Loose;save?:()=>unknown;subjects?:()=>string[]};
  YKSErrorJournal?:{add?:(data:Loose,opts?:Loose)=>Loose|null;openReviews?:()=>Loose[];render?:()=>void};
};
export type ErrorRow={key:string;kind:"wrong"|"journal";id:string|number;subject:string;topic:string;n:number;date:string;sort:number;exam:string;reason:string;note:string;photos:number;resolved:boolean;journalId:string};

const L=window as unknown as LegacyWindow;
const TABS:Tab[]=["ozet","analiz","hata","gecmis"];
const TAB_LABEL:Record<Tab,string>={ozet:"Özet",analiz:"Analiz",hata:"Hatalar",gecmis:"Geçmiş"};
const TAB_KEY="yks_exam_tab_v73";
const KIND_LABEL:Record<string,string>={bilmiyordum:"Bilgi eksiği",dikkat:"Dikkat",sure:"Süre"};
const AYT_FIELD:Record<string,string[]>={
  SAY:["Matematik","Fizik","Kimya","Biyoloji"],
  EA:["Matematik","Edebiyat","Tarih-1","Coğrafya-1"],
  SOZ:["Edebiyat","Tarih-1","Coğrafya-1","Tarih-2","Coğrafya-2","Felsefe Grubu","Din Kültürü"]
};
const FIELD_NAME:Record<string,string>={SAY:"Sayısal",EA:"Eşit Ağırlık",SOZ:"Sözel"};
/* Yanlış kaydı alt dersle (Fizik), deneme satırı grupla (Fen Bilimleri) tutulur. */
const GROUP:Record<string,string[]>={"Fen Bilimleri":["Fizik","Kimya","Biyoloji"],"Sosyal Bilimler":["Tarih","Coğrafya","Felsefe","Din Kültürü"],"Matematik":["Geometri"],"Tarih-1":["Tarih"],"Coğrafya-1":["Coğrafya"],"Tarih-2":["Tarih"],"Coğrafya-2":["Coğrafya"],"Felsefe Grubu":["Felsefe"]};
function canonical(value:unknown):string{const name=String(value??"").trim().replace(/ \(AYT\)$/u,"");return name==="Temel Matematik"?"Matematik":name;}
const SHORT:Record<string,string>={"Sosyal Bilimler":"Sosyal","Temel Matematik":"Mat","Fen Bilimleri":"Fen","Felsefe Grubu":"Felsefe","Din Kültürü":"Din"};

let installed=false,queued=false,showAllAyt=false,errFilter="all",errSubject="",errLimit=40,errFormOpen=false;
const picked:number[]=[];
let compareA=0,compareB=0;

function esc(value:unknown):string{return String(value??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]!));}
function num(value:unknown):number{const n=Number(value);return Number.isFinite(n)?n:0;}
function r2(value:number):number{return Math.round(value*100)/100;}
function fmt(value:number|null|undefined):string{return value==null||!Number.isFinite(value)?"—":String(r2(value));}
function signed(value:number|null|undefined,suffix=""):string{if(value==null||!Number.isFinite(value))return "—";const v=r2(value);return (v>0?"+":"")+v+suffix;}
function tone(value:number|null|undefined,invert=false):string{if(value==null||!value)return "";return (value>0)!==invert?"up":"down";}
function byId<T extends HTMLElement=HTMLElement>(id:string):T|null{return document.getElementById(id) as T|null;}
function state():Loose{try{return L.YKSLegacyState?.readState?.()??{};}catch{return {};}}
function list<T=Loose>(value:unknown):T[]{return Array.isArray(value)?value.filter(Boolean) as T[]:[];}
function call(name:string,...args:unknown[]):unknown{const fn=L[name];if(typeof fn!=="function")return undefined;try{return (fn as LegacyFn)(...args);}catch(error){console.error("v73 "+name,error);return undefined;}}
function save():void{try{L.YKSLegacyState?.save?.();}catch(error){console.error("v73 kaydet",error);}}
function toast(text:string):void{call("toast",text);}
function today():string{const d=new Date();return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");}
function dayLabel(key:string):string{if(!/^\d{4}-\d{2}-\d{2}$/.test(key))return "";const [y,m,d]=key.split("-").map(Number);try{return new Date(y!,m!-1,d!).toLocaleDateString("tr-TR",{day:"numeric",month:"short"});}catch{return key;}}
function typeLabel(type:string):string{return type==="BRANS"?"Branş":type;}
function shortName(name:string):string{return SHORT[name]||name;}
function selectedType():ExamAnalysisType{const v=document.querySelector<HTMLButtonElement>("#deneme .v315-type-seg button.on")?.id.replace("v315t","");return v==="AYT"||v==="YDT"||v==="BRANS"?v:"TYT";}
function selectedWindow():ExamAnalysisWindow{const id=document.querySelector<HTMLButtonElement>("#deneme .v315-window-seg button.on")?.id;return id==="v315w5"?5:id==="v315wAll"?0:10;}
function exams(type?:string):Loose[]{return list(state().denemeler).filter(d=>!type||d.type===type).slice().sort((a,b)=>String(a.date||"").localeCompare(String(b.date||""))||num(a.id)-num(b.id));}
function results(exam:Loose|undefined):Loose[]{return list(exam?.subjectResults);}
function wrongTotal(exam:Loose|undefined):number{return results(exam).reduce((sum,row)=>sum+Math.max(0,num(row.y)),0);}
function markedWrong(exam:Loose|undefined):number{if(!exam)return 0;return list(state().wrongLog).filter(w=>num(w.deneme)===num(exam.id)).reduce((sum,w)=>sum+Math.max(1,num(w.n)),0);}
function readTab():Tab{try{const v=localStorage.getItem(TAB_KEY) as Tab|null;return v&&TABS.includes(v)?v:"ozet";}catch{return "ozet";}}
function writeTab(tab:Tab):void{try{localStorage.setItem(TAB_KEY,tab);}catch{}}

/* ---------- iskelet ---------- */
function screen():HTMLElement|null{return byId("deneme");}
function setTab(tab:Tab,focus=false):void{
  const root=screen();if(!root)return;root.dataset.examTab=tab;writeTab(tab);
  for(const button of Array.from(document.querySelectorAll<HTMLButtonElement>("#examHubTabs button"))){
    const on=button.dataset.tab===tab;button.setAttribute("aria-selected",String(on));button.tabIndex=on?0:-1;if(on&&focus)button.focus();
  }
  render();
}
function ensureSkeleton():boolean{
  const root=screen(),dash=byId("v315Dashboard"),filter=dash?.querySelector<HTMLElement>(".v315-filterbar");if(!root||!dash||!filter)return false;
  if(!byId("examHubTabs")){
    const tabs=document.createElement("div");tabs.id="examHubTabs";tabs.className="eh-tabs";tabs.setAttribute("role","tablist");tabs.setAttribute("aria-label","Deneme bölümleri");
    tabs.innerHTML=TABS.map(tab=>`<button type="button" role="tab" id="examHubTab-${tab}" data-tab="${tab}" aria-controls="examHub-${tab}">${TAB_LABEL[tab]}</button>`).join("");
    tabs.addEventListener("click",event=>{const b=(event.target as HTMLElement).closest<HTMLButtonElement>("button[data-tab]");if(b)setTab(b.dataset.tab as Tab);});
    tabs.addEventListener("keydown",event=>{
      const i=TABS.indexOf((root.dataset.examTab as Tab)||"ozet");let next=-1;
      if(event.key==="ArrowRight")next=(i+1)%TABS.length;else if(event.key==="ArrowLeft")next=(i+TABS.length-1)%TABS.length;else if(event.key==="Home")next=0;else if(event.key==="End")next=TABS.length-1;
      if(next>=0){event.preventDefault();setTab(TABS[next]!,true);}
    });
    filter.after(tabs);
  }
  if(!byId("examHubSettingsBtn")){
    const head=dash.querySelector<HTMLElement>(".v315-dash-head"),add=byId("v315AddExamBtn");
    const gear=document.createElement("button");gear.type="button";gear.id="examHubSettingsBtn";gear.className="eh-gear";gear.setAttribute("aria-label","Deneme ayarları");gear.title="Deneme ayarları";
    gear.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z"/></svg>';
    gear.addEventListener("click",openSettings);
    if(add)add.before(gear);else head?.append(gear);
  }
  let anchor:Element|null=byId("reflBox")||byId("v315ExamFormCard")||dash;
  for(const tab of TABS){
    let pane=byId(`examHub-${tab}`);
    if(!pane){pane=document.createElement("section");pane.id=`examHub-${tab}`;pane.className="eh-pane";pane.dataset.examHub="";pane.setAttribute("role","tabpanel");pane.setAttribute("aria-labelledby",`examHubTab-${tab}`);}
    if(anchor&&pane.previousElementSibling!==anchor)anchor.after(pane);
    anchor=pane;
  }
  const analysis=byId("refinedExamAnalysis");
  const summary=analysis?.querySelector("summary .rb-study-disclosure-copy");
  if(summary&&!summary.hasAttribute("data-v73")){summary.setAttribute("data-v73","");summary.innerHTML="<strong>Daha fazla analiz</strong><small>Puan, verim, seri analizi ve dayanıklılık</small>";}
  const cycle=byId("refinedExamCycle")?.querySelector("summary .rb-study-disclosure-copy");
  if(cycle&&!cycle.hasAttribute("data-v73")){cycle.setAttribute("data-v73","");cycle.innerHTML="<strong>Konu konu öğrenme döngüsü</strong><small>Her konunun hata, tekrar ve kontrol durumu</small>";}
  markDuplicates();
  if(!root.dataset.examTab)root.dataset.examTab=readTab();
  for(const button of Array.from(document.querySelectorAll<HTMLButtonElement>("#examHubTabs button"))){const on=button.dataset.tab===root.dataset.examTab;button.setAttribute("aria-selected",String(on));button.tabIndex=on?0:-1;}
  return true;
}
/* Yeni sekmelerde karşılığı olan eski kartlar "Daha fazla analiz" içinde gizlenir; silinmez. */
function markDuplicates():void{
  const body=byId("refinedExamAnalysisContent")||byId("refinedExamAnalysis");if(!body)return;
  byId("refinedExamDetailGrid")?.classList.add("eh-dup");byId("v4ExamInsights")?.classList.add("eh-dup");byId("v27Latest")?.classList.add("eh-dup");
  for(const h of Array.from(body.querySelectorAll<HTMLElement>(":scope > h2"))){
    if(h.textContent?.trim()==="Son deneme detayı"){h.classList.add("eh-dup");const next=h.nextElementSibling as HTMLElement|null;if(next&&!next.id)next.classList.add("eh-dup");}
  }
  // Trend sekmesinde Özet ve Analiz'in aynısı olan grafik, doğru/yanlış/boş, özet ve ders trendi gizlenir.
  const trend=byId("anp_trend");if(!trend)return;
  const chart=trend.querySelector<HTMLElement>(":scope > .card:first-child");if(chart?.querySelector("canvas"))chart.classList.add("eh-dup");
  for(const h of Array.from(trend.querySelectorAll<HTMLElement>(":scope > h2"))){
    if(!DUP_TITLES.has(h.textContent?.trim()||""))continue;h.classList.add("eh-dup");(h.nextElementSibling as HTMLElement|null)?.classList.add("eh-dup");
  }
}
const DUP_TITLES=new Set(["Doğru / yanlış / boş","Son denemelerin özeti","Ders trendleri","Gelişmiş net trendi"]);

/* ---------- ayarlar ---------- */
function ensureSettings():HTMLElement{
  let sheet=byId("examHubSettings");
  if(!sheet){
    sheet=document.createElement("div");sheet.id="examHubSettings";sheet.className="eh-sheet";sheet.hidden=true;sheet.setAttribute("role","dialog");sheet.setAttribute("aria-modal","true");sheet.setAttribute("aria-labelledby","examHubSettingsTitle");
    sheet.innerHTML='<div class="eh-sheet-box"><div class="eh-sheet-head"><h3 id="examHubSettingsTitle">Deneme ayarları</h3><button type="button" class="eh-x" data-close aria-label="Kapat">×</button></div><div class="eh-sheet-body" id="examHubSettingsBody"><div class="card eh-targets"><label>Hedef netler</label><div class="row2"><div><label for="ehTargetTYT">TYT hedefi</label><input type="number" id="ehTargetTYT" min="0" max="120" step="0.25" inputmode="decimal" placeholder="Örn. 90"></div><div><label for="ehTargetAYT">AYT hedefi</label><input type="number" id="ehTargetAYT" min="0" max="80" step="0.25" inputmode="decimal" placeholder="Örn. 55"></div></div><p class="hint">Net grafiğinde kesikli çizgi olarak görünür.</p></div></div></div>';
    sheet.addEventListener("click",event=>{if(event.target===sheet||(event.target as HTMLElement).closest("[data-close]"))closeSettings();});
    sheet.addEventListener("keydown",event=>{if(event.key==="Escape")closeSettings();});
    document.body.append(sheet);
    const tyt=byId<HTMLInputElement>("ehTargetTYT"),ayt=byId<HTMLInputElement>("ehTargetAYT");
    tyt?.addEventListener("change",()=>{const s=state(),v=Math.max(0,Math.min(120,num(tyt.value)));s.targetNetTYT=v;s.targetNet=v;save();call("renderV315Dashboard");});
    ayt?.addEventListener("change",()=>{const s=state(),v=Math.max(0,Math.min(80,num(ayt.value)));s.targetNetAYT=v;save();call("renderV315Dashboard");});
  }
  // Eski ayar parçaları buraya taşınır; kimlikleri ve işleyicileri aynı kalır.
  const body=byId("examHubSettingsBody")!;
  const gun=byId("denemeGun")?.closest<HTMLElement>(".card");
  if(gun&&gun.parentElement!==body){const h=gun.previousElementSibling;if(h?.tagName==="H2")h.remove();gun.classList.add("eh-moved");body.append(gun);}
  for(const key of ["kalib","kat"]){
    const head=byId(`fh_${key}`),fold=byId(`fb_${key}`);
    if(head&&fold&&head.parentElement!==body){body.append(head,fold);}
  }
  return sheet;
}
function openSettings():void{
  const sheet=ensureSettings(),s=state();
  const tyt=byId<HTMLInputElement>("ehTargetTYT"),ayt=byId<HTMLInputElement>("ehTargetAYT");
  if(tyt)tyt.value=num(s.targetNetTYT??s.targetNet)?String(num(s.targetNetTYT??s.targetNet)):"";
  if(ayt)ayt.value=num(s.targetNetAYT)?String(num(s.targetNetAYT)):"";
  call("renderDenemeGun");
  sheet.hidden=false;document.documentElement.classList.add("eh-sheet-open");
  sheet.querySelector<HTMLElement>("[data-close]")?.focus();
}
function closeSettings():void{const sheet=byId("examHubSettings");if(!sheet||sheet.hidden)return;sheet.hidden=true;document.documentElement.classList.remove("eh-sheet-open");byId("examHubSettingsBtn")?.focus();}

/* ---------- net grafiği ---------- */
function targetFor(type:string):number{const s=state();return type==="TYT"?num(s.targetNetTYT??s.targetNet):type==="AYT"?num(s.targetNetAYT):0;}
function trendSvg(rows:Loose[]):string{
  if(!rows.length)return '<div class="v315-chart-empty">Bu türde deneme eklediğinde net grafiğin burada oluşacak.</div>';
  const show=rows.slice(-10),values=show.map(d=>num(d.totalNet)),type=String(show[0]?.type||"TYT"),target=targetFor(type);
  const box=byId("v315Trend"),W=Math.max(280,Math.min(760,Math.round(box?.clientWidth||330))),H=190,Lp=34,Rp=14,Tp=24,Bp=30;
  let lo=Math.min(...values),hi=Math.max(...values);if(target>0){lo=Math.min(lo,target);hi=Math.max(hi,target);}
  if(hi-lo<8){const m=(hi+lo)/2;lo=m-4;hi=m+4;}lo=Math.floor(lo-2);hi=Math.ceil(hi+2);
  const x=(i:number)=>Lp+(show.length===1?(W-Lp-Rp)/2:i*(W-Lp-Rp)/(show.length-1)),y=(v:number)=>Tp+(hi-v)*(H-Tp-Bp)/(hi-lo||1);
  let svg=`<svg class="v315-trend-svg eh-trend" viewBox="0 0 ${W} ${H}" width="100%" role="img" aria-label="${esc(typeLabel(type))} net grafiği, son ${show.length} deneme">`;
  for(let i=0;i<3;i++){const v=Math.round(hi-i*(hi-lo)/2),yy=y(v);svg+=`<line class="eh-grid" x1="${Lp}" y1="${yy}" x2="${W-Rp}" y2="${yy}"/><text class="eh-axis" x="${Lp-6}" y="${yy+4}" text-anchor="end">${v}</text>`;}
  if(target>0){const ty=y(target);svg+=`<line class="eh-target" x1="${Lp}" y1="${ty}" x2="${W-Rp}" y2="${ty}"/><text class="eh-target-label" x="${Lp+4}" y="${ty-6}">Hedef ${fmt(target)}</text>`;}
  if(show.length>1)svg+=`<polyline class="eh-line" points="${show.map((d,i)=>`${x(i)},${y(num(d.totalNet))}`).join(" ")}"/>`;
  const step=Math.ceil(show.length/(W<360?5:8));
  show.forEach((d,i)=>{const px=x(i),py=y(num(d.totalNet));svg+=`<circle class="eh-dot" cx="${px}" cy="${py}" r="4.5"><title>${esc((d.name||"Deneme")+" · "+fmt(num(d.totalNet))+" net")}</title></circle><text class="eh-val" x="${px}" y="${py-9}" text-anchor="middle">${fmt(num(d.totalNet))}</text>`;
    if(i%step===0||i===show.length-1)svg+=`<text class="eh-axis" x="${px}" y="${H-9}" text-anchor="middle">${esc(dayLabel(String(d.date||"")))}</text>`;});
  return svg+"</svg>";
}

/* ---------- Özet ---------- */
function renderOzet(pane:HTMLElement):void{
  const type=selectedType(),all=exams(type),last=all.at(-1),prev=all.at(-2);
  let html="";
  if(last){
    const delta=prev?num(last.totalNet)-num(prev.totalNet):null,wrong=wrongTotal(last),open=Math.max(0,wrong-markedWrong(last));
    const meta=[dayLabel(String(last.date||"")),num(last.dur)?num(last.dur)+" dk":"",last.pub?String(last.pub):""].filter(Boolean).join(" · ");
    html+=`<div class="card eh-latest"><div class="eh-latest-top"><div><small class="eh-eyebrow">Son ${esc(typeLabel(type))} denemesi</small><b>${esc(last.name||"Deneme")}</b><small>${esc(meta)}</small></div><div class="eh-big">${fmt(num(last.totalNet))}<em class="${tone(delta)}">${delta==null?"ilk deneme":signed(delta," net")}</em></div></div>`;
    const rows=results(last).filter(r=>num(r.d)+num(r.y)+num(r.b)>0||num(r.net)!==0);
    if(rows.length)html+=`<div class="eh-nets">${rows.slice(0,8).map(r=>`<span>${esc(shortName(String(r.name||"")))}<b>${fmt(num(r.net))}</b></span>`).join("")}</div>`;
    html+=`<div class="eh-btns"><button type="button" class="btn ghost" data-act="detail" data-id="${esc(last.id)}">Ayrıntı</button>${wrong?`<button type="button" class="btn ${open?"green":"ghost"}" data-act="wrongs" data-id="${esc(last.id)}">${open?`Yanlışları işle · ${open}`:"Yanlışlar işlendi ✓"}</button>`:""}</div></div>`;
  }
  const loop=loopStats();
  html+=`<button type="button" class="card eh-loop" data-act="tab" data-tab="hata"><span class="eh-card-head"><b>Öğrenme döngüsü</b><small>yanlış → eksik → tekrar → kontrol</small></span>
    <span class="eh-loop-steps"><span>Kayıt<b>${loop.records}</b></span><span>Eksik konu<b>${loop.topics}</b></span><span class="${loop.reviews?"is-due":""}">Tekrar<b>${loop.reviews}</b></span><span>Kontrol<b>${loop.check}</b></span></span>
    <span class="eh-hint">${esc(loop.hint)}</span></button>`;
  pane.innerHTML=html;
}
function loopStats():{records:number;topics:number;reviews:number;check:number;hint:string}{
  const s=state(),rows=errorRows(),open=rows.filter(r=>!r.resolved);
  const records=open.reduce((sum,r)=>sum+r.n,0),topics=new Set(open.map(r=>(r.subject+"|"+r.topic).toLocaleLowerCase("tr-TR"))).size;
  let reviews:Loose[]=[];try{reviews=L.YKSErrorJournal?.openReviews?.()??[];}catch{}
  const cycle=analyzeLearningCycle(s as never),lastExam=Math.max(0,...list(s.denemeler).map(d=>Date.parse(String(d.date||""))||0));
  const check=cycle.topics.filter(t=>t.status==="resolved"&&t.lastResolvedAt>lastExam).length;
  const returned=cycle.topics.find(t=>t.status==="returned");
  const hint=returned?`${returned.topic} çözüldükten sonra yine yanlış çıktı; tekrar listene al.`:
    reviews[0]?`${String(reviews[0].topic||"Bir konu")} tekrarı seni bekliyor.`:
    check?`${check} konu çözüldü; sonraki denemede yanlış çıkmazsa kapanır.`:
    records?"Yanlışlarını çözdükçe Hatalar'dan \"çözüldü\" diye işaretle.":"Denemeden sonra yanlışlarını konulara işlediğinde döngü burada başlar.";
  return {records,topics,reviews:reviews.length,check,hint};
}

/* ---------- Analiz ---------- */
function renderAnaliz(pane:HTMLElement):void{
  const type=selectedType(),win=selectedWindow(),a=analyzeExams(state() as never,type,win);
  if(!a.count){pane.innerHTML=`<div class="card eh-empty">Analiz için önce bir ${esc(typeLabel(type))} denemesi ekle.</div>`;return;}
  const s=state(),range=exams(type).slice(win>0?-win:0),inList=new Set(range.map(d=>String(d.id)));
  const counts=new Map<string,Map<string,number>>();
  for(const w of list(s.wrongLog)){if(!inList.has(String(w.deneme??"")))continue;const subject=canonical(w.subject),topic=String(w.topic||"Konu");const m=counts.get(subject)??new Map<string,number>();m.set(topic,(m.get(topic)??0)+Math.max(1,num(w.n)));counts.set(subject,m);}
  const topFor=(name:string)=>{let best:{topic:string;n:number}|undefined;for(const subject of [name,...(GROUP[name]??[])])for(const [topic,n] of counts.get(subject)??[])if(!best||n>best.n)best={topic,n};return best;};
  const dyb=new Map<string,{d:number;y:number;b:number}>();
  for(const exam of range)for(const r of results(exam)){const name=canonical(r.name);const cur=dyb.get(name)??{d:0,y:0,b:0};cur.d+=num(r.d);cur.y+=num(r.y);cur.b+=num(r.b);dyb.set(name,cur);}
  const subjectHtml=a.subjects.map(sub=>{
    const avgCap=sub.successPercent!=null&&sub.successPercent>0?sub.averageNet/sub.successPercent*100:0,c=dyb.get(sub.name),q=c?c.d+c.y+c.b:0,top=topFor(sub.name);
    const bar=q?`<span class="eh-dyb" aria-label="Doğru %${Math.round(c!.d/q*100)}, yanlış %${Math.round(c!.y/q*100)}, boş %${Math.round(c!.b/q*100)}"><i class="c" style="width:${c!.d/q*100}%"></i><i class="w" style="width:${c!.y/q*100}%"></i><i class="e" style="width:${c!.b/q*100}%"></i></span>`:"";
    const d=sub.latestDelta;
    return `<div class="eh-subj"><div class="eh-subj-row"><b>${esc(sub.name)}</b><small>${fmt(sub.averageNet)}${avgCap?" / "+Math.round(avgCap):""}${d!=null&&d!==0?` <span class="${tone(d)}">${d>0?"▲":"▼"} ${fmt(Math.abs(d))}</span>`:""}</small></div>${bar}${top?`<small class="eh-subj-top">En çok yanlış: <b>${esc(top.topic)}</b> (${top.n})</small>`:""}</div>`;
  }).join("");
  const st=a.strongest,att=a.needsAttention;
  let html=`<div class="card eh-subjects"><div class="eh-card-head"><b>Dersler</b><small>${a.window?`son ${a.count} deneme`:`${a.count} deneme`} ortalaması</small></div>${subjectHtml||'<p class="hint">Ders bazlı sonuç girdikçe burada görünür.</p>'}<div class="eh-legend"><span><i class="c"></i>Doğru</span><span><i class="w"></i>Yanlış</span><span><i class="e"></i>Boş</span></div></div>`;
  if(st||att)html+=`<div class="eh-sw">${st?`<div class="eh-good"><small>En güçlü</small><b>${esc(st.name)}</b><small>%${st.successPercent??0} başarı</small></div>`:""}${att?`<div class="eh-bad"><small>Odaklan</small><b>${esc(att.name)}</b><small>%${att.successPercent??0} başarı${att.periodDelta!=null&&att.periodDelta<0?` · ${fmt(att.periodDelta)} net`:""}</small></div>`:""}</div>`;
  if(a.insights.length)html+=`<div class="card eh-insights"><div class="eh-card-head"><b>Kısa değerlendirme</b></div><ul>${a.insights.map(line=>`<li>${esc(line)}</li>`).join("")}</ul></div>`;
  html+=compareCard(type,"analiz");
  pane.innerHTML=html;
}
function compareOptions(rows:Loose[],selected:number):string{return rows.slice().reverse().map(d=>`<option value="${esc(d.id)}"${num(d.id)===selected?" selected":""}>${esc((d.name||"Deneme")+" · "+dayLabel(String(d.date||"")))}</option>`).join("");}
function compareCard(type:string,where:"analiz"|"gecmis"):string{
  const rows=exams(type);if(rows.length<2)return where==="analiz"?`<div class="card eh-compare"><div class="eh-card-head"><b>İki deneme karşılaştır</b></div><p class="hint">Aynı türde en az iki deneme gerekli.</p></div>`:"";
  if(!rows.some(d=>num(d.id)===compareA))compareA=num(rows.at(-2)?.id);
  if(!rows.some(d=>num(d.id)===compareB))compareB=num(rows.at(-1)?.id);
  const a=rows.find(d=>num(d.id)===compareA),b=rows.find(d=>num(d.id)===compareB);
  let html=`<div class="card eh-compare"><div class="eh-card-head"><b>İki deneme karşılaştır</b></div>`;
  if(where==="analiz")html+=`<div class="eh-cmp-pick"><select data-cmp="a" aria-label="Önceki deneme">${compareOptions(rows,compareA)}</select><span aria-hidden="true">→</span><select data-cmp="b" aria-label="Karşılaştırılan deneme">${compareOptions(rows,compareB)}</select></div>`;
  else html+=`<div class="eh-cmp-names"><span>${esc(a?.name||"")}</span><i>→</i><span>${esc(b?.name||"")}</span></div>`;
  return html+compareRows(a,b)+"</div>";
}
function compareRows(a:Loose|undefined,b:Loose|undefined):string{
  if(!a||!b)return "";
  const sum=(e:Loose,k:string)=>results(e).reduce((s,r)=>s+num(r[k]),0),known=(e:Loose)=>results(e).some(r=>num(r.d)+num(r.y)+num(r.b)>0);
  const line=(label:string,va:number,vb:number,invert=false,suffix="")=>{const d=vb-va;return `<div class="eh-cmp-row"><span>${esc(label)}</span><small>${fmt(va)} → ${fmt(vb)}</small><b class="${tone(d,invert)}">${signed(d,suffix)}</b></div>`;};
  let html=line("Toplam net",num(a.totalNet),num(b.totalNet));
  if(known(a)&&known(b))html+=line("Yanlış",sum(a,"y"),sum(b,"y"),true)+line("Boş",sum(a,"b"),sum(b,"b"),true);
  if(num(a.dur)&&num(b.dur))html+=line("Süre",num(a.dur),num(b.dur),true," dk");
  const names=[...new Set([...results(a),...results(b)].map(r=>String(r.name||"")))].filter(Boolean);
  const ra=new Map(results(a).map(r=>[String(r.name),r])),rb=new Map(results(b).map(r=>[String(r.name),r]));
  html+=names.filter(n=>num(ra.get(n)?.net)||num(rb.get(n)?.net)).map(n=>line(n,num(ra.get(n)?.net),num(rb.get(n)?.net))).join("");
  return `<div class="eh-cmp-list">${html}</div>`;
}

/* ---------- Hatalar ---------- */
export function errorRows():ErrorRow[]{
  const s=state(),journal=list(s.errorJournal),denemeler=list(s.denemeler),examName=new Map(denemeler.map(d=>[String(d.id),String(d.name||"Deneme")]));
  const mirrors=new Map<string,Loose>();for(const j of journal){const ref=String(j.sourceRef||"");if(ref.startsWith("wrong:"))mirrors.set(ref.slice(6),j);}
  const wrongIds=new Set<string>(),rows:ErrorRow[]=[];
  for(const w of list(s.wrongLog)){
    const id=String(w.id);wrongIds.add(id);const m=mirrors.get(id),photos=Array.isArray(w.questionImgs)?w.questionImgs.length:(w.questionImg?1:0);
    rows.push({key:"w"+id,kind:"wrong",id:w.id,subject:String(w.subject||""),topic:String(w.topic||""),n:Math.max(1,num(w.n)),date:String(w.date||""),sort:Date.parse(String(w.date||""))||num(w.id),exam:examName.get(String(w.deneme??""))||"",reason:KIND_LABEL[String(w.kind||"")]||"",note:String(w.note||""),photos,resolved:!!m?.resolved,journalId:m?String(m.id):""});
  }
  for(const j of journal){
    const ref=String(j.sourceRef||"");if(ref.startsWith("wrong:")&&wrongIds.has(ref.slice(6)))continue;
    const created=num(j.createdAt),date=created?new Date(created).toISOString().slice(0,10):"";
    rows.push({key:"j"+String(j.id),kind:"journal",id:String(j.id),subject:String(j.subject||""),topic:String(j.topic||""),n:Math.max(1,num(j.count)),date,sort:created,exam:examName.get(String(j.denemeId??""))||"",reason:String(j.type||""),note:String(j.note||""),photos:0,resolved:!!j.resolved,journalId:String(j.id)});
  }
  return rows.sort((a,b)=>b.sort-a.sort);
}
/* Müfredat: {exam,name,topics}; AYT dersleri adında "(AYT)" taşır. */
function curriculum():Map<string,string[]>{
  const map=new Map<string,string[]>();
  try{for(const item of list(L.YKSLegacyState?.subjects?.())){const name=String(item?.name||"").trim();if(name&&!map.has(name))map.set(name,list<string>(item?.topics).map(String));}}catch{}
  if(!map.size)for(const name of ["Türkçe","Matematik","Geometri","Fizik","Kimya","Biyoloji","Tarih","Coğrafya","Felsefe","Din Kültürü","Edebiyat"])map.set(name,[]);
  return map;
}
function subjects():string[]{return [...curriculum().keys()];}
function fillTopics(subject:string):void{const box=byId("ehErrTopics");if(box)box.innerHTML=(curriculum().get(subject)??[]).map(t=>`<option value="${esc(t)}"></option>`).join("");}
function renderHata(pane:HTMLElement):void{
  const rows=errorRows(),open=rows.filter(r=>!r.resolved);
  let reviews=0;try{reviews=L.YKSErrorJournal?.openReviews?.().length??0;}catch{}
  const shown=rows.filter(r=>(errFilter==="all"||(errFilter==="open"&&!r.resolved)||(errFilter==="done"&&r.resolved)||(errFilter==="photo"&&r.photos>0))&&(!errSubject||r.subject===errSubject));
  const subjectsUsed=[...new Set(rows.map(r=>r.subject).filter(Boolean))].sort((a,b)=>a.localeCompare(b,"tr"));
  const chip=(key:string,label:string)=>`<button type="button" class="eh-chip" data-filter="${key}" aria-pressed="${errFilter===key}">${label}</button>`;
  let html=`<div class="eh-stats3"><span>Açık yanlış<b>${open.reduce((s,r)=>s+r.n,0)}</b></span><span>Eksik konu<b>${new Set(open.map(r=>(r.subject+"|"+r.topic).toLocaleLowerCase("tr-TR"))).size}</b></span><span class="${reviews?"is-due":""}">Tekrar bekleyen<b>${reviews}</b></span></div>`;
  html+=`<div class="eh-filters">${chip("all","Tümü")}${chip("open","Tekrar gerekli")}${chip("done","Çözüldü")}${chip("photo","📷 Fotoğraflı")}<select class="eh-subject-filter" aria-label="Derse göre süz"><option value="">Tüm dersler</option>${subjectsUsed.map(s=>`<option${s===errSubject?" selected":""}>${esc(s)}</option>`).join("")}</select></div>`;
  html+=`<div class="eh-add-row"><button type="button" class="btn green" data-act="err-form" aria-expanded="${errFormOpen}">${errFormOpen?"Formu kapat":"+ Hata ekle"}</button></div>`;
  if(errFormOpen)html+=errorForm();
  html+=`<div class="card eh-errors"><div class="eh-card-head"><b>Hata Defteri</b><small>${shown.length} kayıt</small></div>`;
  html+=shown.length?shown.slice(0,errLimit).map(r=>{
    const meta=[r.n>1||r.kind==="wrong"?`${r.n} yanlış`:"",r.exam,r.reason,r.date?dayLabel(r.date):""].filter(Boolean).join(" · ");
    const thumb=r.kind==="wrong"?`<button type="button" class="eh-ph${r.photos?" has":""}" data-act="${r.photos?"photo-open":"photo-add"}" data-id="${esc(r.id)}" aria-label="${r.photos?"Soru fotoğraflarını aç":"Soru fotoğrafı ekle"}">📷<small>${r.photos}/${r.n}</small></button>`:`<span class="eh-ph none" aria-hidden="true">✎</span>`;
    return `<div class="eh-err${r.resolved?" is-done":""}">${thumb}<div class="eh-err-main"><b>${esc(r.subject)} · ${esc(r.topic)}</b><small>${esc(meta)}</small>${r.note?`<small class="eh-note">${esc(r.note)}</small>`:""}</div><div class="eh-err-act"><button type="button" class="eh-state ${r.resolved?"done":"open"}" data-act="toggle" data-key="${esc(r.key)}" aria-pressed="${r.resolved}">${r.resolved?"Çözüldü ✓":"Tekrar gerekli"}</button><button type="button" class="eh-del" data-act="delete" data-key="${esc(r.key)}" aria-label="${esc(r.subject+" "+r.topic)} kaydını sil">Sil</button></div></div>`;
  }).join("")+(shown.length>errLimit?`<button type="button" class="btn ghost eh-more" data-act="more-errors">${shown.length-errLimit} kayıt daha göster</button>`:""):`<p class="hint">${rows.length?"Bu süzgeçte kayıt yok.":"Henüz hata kaydın yok. Denemeden sonra yanlışlarını işle ya da buradan ekle."}</p>`;
  pane.innerHTML=html+"</div>";
}
function errorForm():string{
  const recent=list(state().denemeler).slice().sort((a,b)=>String(b.date||"").localeCompare(String(a.date||""))).slice(0,12);
  return `<div class="card eh-form" id="ehErrForm"><div class="row2"><div><label for="ehErrSubject">Ders</label><select id="ehErrSubject"><option value="">Ders seç…</option>${subjects().map(s=>`<option>${esc(s)}</option>`).join("")}</select></div><div><label for="ehErrCount">Adet</label><input type="number" id="ehErrCount" min="1" max="200" value="1" inputmode="numeric"></div></div>
    <label for="ehErrTopic">Konu</label><input type="text" id="ehErrTopic" maxlength="140" list="ehErrTopics" placeholder="Örn. Problemler" autocomplete="off"><datalist id="ehErrTopics"></datalist>
    <label>Sebep</label><div class="eh-reasons" role="radiogroup" aria-label="Sebep">${[["","Belirtme"],["bilmiyordum","Bilgi eksiği"],["dikkat","Dikkat"],["sure","Süre"]].map(([v,l],i)=>`<label class="eh-reason"><input type="radio" name="ehErrKind" value="${v}"${i===0?" checked":""}><span>${l}</span></label>`).join("")}</div>
    <label for="ehErrExam">Deneme</label><select id="ehErrExam"><option value="">Denemeye bağlama</option>${recent.map(d=>`<option value="${esc(d.id)}">${esc((d.name||"Deneme")+" · "+dayLabel(String(d.date||"")))}</option>`).join("")}</select>
    <label for="ehErrNote">Kısa not</label><input type="text" id="ehErrNote" maxlength="400" placeholder="Örn. Soru kökünü yanlış okudum">
    <label class="eh-check"><input type="checkbox" id="ehErrReview" checked> Tekrar listeme ekle</label>
    <button type="button" class="btn green" data-act="err-save">Kaydet</button></div>`;
}
function saveError():void{
  const subject=(byId<HTMLSelectElement>("ehErrSubject")?.value||"").trim(),topic=(byId<HTMLInputElement>("ehErrTopic")?.value||"").trim().slice(0,140);
  if(!subject||!topic){toast("Ders ve konu gerekli");return;}
  const n=Math.max(1,Math.min(200,Math.floor(num(byId<HTMLInputElement>("ehErrCount")?.value)||1))),kind=(document.querySelector<HTMLInputElement>('input[name="ehErrKind"]:checked')?.value||"");
  const note=(byId<HTMLInputElement>("ehErrNote")?.value||"").trim().slice(0,400),review=!!byId<HTMLInputElement>("ehErrReview")?.checked,examId=num(byId<HTMLSelectElement>("ehErrExam")?.value);
  const s=state();if(!Array.isArray(s.wrongLog))s.wrongLog=[];
  const exam=examId?list(s.denemeler).find(d=>num(d.id)===examId):undefined;
  const wrong:Loose={id:Date.now(),date:exam?String(exam.date||today()):today(),subject,topic,n,note,questionImgs:[]};if(kind)wrong.kind=kind;if(exam)wrong.deneme=exam.id;
  s.wrongLog.push(wrong);call("linkWrongToTopic",subject,topic,n);
  try{L.YKSErrorJournal?.add?.({subject,topic,type:KIND_LABEL[kind]||"Bilgi eksiği",count:n,review,source:exam?"Deneme · "+String(exam.name||""):"Hata Defteri",sourceRef:"wrong:"+wrong.id,denemeId:exam?exam.id:null,note},{render:false});}catch(error){console.error("v73 hata defteri",error);}
  save();errFormOpen=false;refreshLegacyErrors();toast("Hata kaydedildi · istersen fotoğrafını ekle");render();
}
function refreshLegacyErrors():void{for(const name of ["renderWrongTopics","renderExamWrongArchive","renderWrongKinds"])call(name);try{L.YKSErrorJournal?.render?.();}catch{}}
function toggleError(key:string):void{
  const row=errorRows().find(r=>r.key===key);if(!row)return;
  if(row.journalId){call("errorJournalToggle",row.journalId);render();return;}
  // Yanlış kaydının Hata Defteri karşılığı yoksa önce oluşturulur; çözüldü bilgisi orada tutulur.
  const s=state(),wrong=list(s.wrongLog).find(w=>String(w.id)===String(row.id));if(!wrong)return;
  const item=L.YKSErrorJournal?.add?.({subject:row.subject,topic:row.topic,type:KIND_LABEL[String(wrong.kind||"")]||"Bilgi eksiği",count:row.n,review:false,source:row.exam?"Deneme · "+row.exam:"Hata Defteri",sourceRef:"wrong:"+row.id,denemeId:wrong.deneme??null,note:row.note},{render:false});
  if(item?.id)call("errorJournalToggle",item.id);render();
}
function deleteError(key:string):void{
  const row=errorRows().find(r=>r.key===key);if(!row)return;
  if(!confirm(`${row.subject} · ${row.topic} kaydı silinsin mi?${row.photos?" Soru fotoğrafları da silinir.":""}`))return;
  const s=state(),wrongLog=list(s.wrongLog),journal=list(s.errorJournal),reviews=list(s.manualReviews);
  const wrong=row.kind==="wrong"?wrongLog.find(w=>String(w.id)===String(row.id)):undefined,mirror=row.journalId?journal.find(j=>String(j.id)===row.journalId):undefined;
  const removedReviews=mirror?reviews.filter(r=>r.journalId===mirror.id||r.id==="rev_"+mirror.id):[];
  if(wrong)s.wrongLog=wrongLog.filter(w=>w!==wrong);
  if(mirror)s.errorJournal=journal.filter(j=>j!==mirror);
  if(removedReviews.length)s.manualReviews=reviews.filter(r=>!removedReviews.includes(r));
  save();refreshLegacyErrors();render();
  call("pushUndo","Hata kaydı silindi",()=>{const t=state();if(wrong)(t.wrongLog||(t.wrongLog=[])).push(wrong);if(mirror)(t.errorJournal||(t.errorJournal=[])).unshift(mirror);if(removedReviews.length)(t.manualReviews||(t.manualReviews=[])).push(...removedReviews);save();refreshLegacyErrors();render();});
}

/* ---------- Geçmiş ---------- */
function renderGecmis(pane:HTMLElement):void{
  const type=selectedType(),rows=exams(type);
  for(let i=picked.length-1;i>=0;i--)if(!rows.some(d=>num(d.id)===picked[i]))picked.splice(i,1);
  let html="";
  if(picked.length===2){const [x,y]=picked.map(id=>rows.find(d=>num(d.id)===id)!).sort((p,q)=>String(p.date||"").localeCompare(String(q.date||""))||num(p.id)-num(q.id));compareA=num(x?.id);compareB=num(y?.id);html+=compareCard(type,"gecmis").replace('<div class="eh-card-head"><b>İki deneme karşılaştır</b></div>','<div class="eh-card-head"><b>Karşılaştırma</b><button type="button" class="eh-linkbtn" data-act="clear-pick">Temizle</button></div>');}
  html+=`<div class="card eh-history"><div class="eh-card-head"><b>${esc(typeLabel(type))} denemeleri</b><small>${rows.length} kayıt · karşılaştırmak için iki tane işaretle</small></div>`;
  html+=rows.length?rows.slice().reverse().map((d,i,arr)=>{
    const prev=arr[i+1],delta=prev?num(d.totalNet)-num(prev.totalNet):null,on=picked.includes(num(d.id));
    const meta=[typeLabel(String(d.type||"")),dayLabel(String(d.date||"")),num(d.dur)?num(d.dur)+" dk":"",d.pub?String(d.pub):""].filter(Boolean).join(" · ");
    return `<div class="eh-hist${on?" is-picked":""}"><label class="eh-pick"><input type="checkbox" data-pick="${esc(d.id)}"${on?" checked":""}${!on&&picked.length>=2?" disabled":""}><span class="sr-only">${esc(d.name||"Deneme")} karşılaştırmaya ekle</span></label><button type="button" class="eh-hist-main" data-act="detail" data-id="${esc(d.id)}"><b>${esc(d.name||"Deneme")}</b><small>${esc(meta)}</small></button><div class="eh-hist-net">${fmt(num(d.totalNet))}<em class="${tone(delta)}">${delta==null?"ilk":signed(delta)}</em></div></div>`;
  }).join(""):`<p class="hint">Bu türde henüz deneme yok.</p>`;
  html+="</div>";
  if(picked.length===1)html+=`<p class="eh-pick-hint">Bir deneme daha işaretle, farkları görelim.</p>`;
  pane.innerHTML=html;
}

/* ---------- deneme ekleme adımları ---------- */
function formType():string{return byId("dSegAYT")?.classList.contains("on")?"AYT":byId("dSegYDT")?.classList.contains("on")?"YDT":byId("dSegBRANS")?.classList.contains("on")?"BRANS":"TYT";}
function setStep(step:1|2):void{
  const card=byId("v315ExamFormCard");if(!card)return;card.dataset.step=String(step);
  for(const b of Array.from(card.querySelectorAll<HTMLElement>(".eh-steps [data-step]"))){const k=Number(b.dataset.step);b.classList.toggle("on",k===step);b.classList.toggle("done",k<step);if(k===step)b.setAttribute("aria-current","step");else b.removeAttribute("aria-current");}
  const sum=byId("ehStepSummary");if(sum){const name=(byId<HTMLInputElement>("denemeName")?.value||"").trim(),date=byId<HTMLInputElement>("denemeDate")?.value||today();sum.innerHTML=`<span><b>${esc(typeLabel(formType()))}${name?" · "+esc(name):""}</b><small>${esc(dayLabel(date))}</small></span><button type="button" class="eh-linkbtn" data-step-go="1">Düzenle</button>`;}
  if(step===2)setTimeout(()=>byId<HTMLInputElement>(formType()==="BRANS"?"brSubject":"d0")?.focus({preventScroll:true}),30);
}
function ensureFormSteps():void{
  const card=byId("v315ExamFormCard");if(!card||card.dataset.ehSteps)return;card.dataset.ehSteps="1";
  const seg=card.querySelector<HTMLElement>(":scope > .seg"),name=byId("denemeName"),nameLabel=name?.previousElementSibling as HTMLElement|null,date=byId("denemeDate"),dur=byId("denemeDur");
  const dateRow=date?.closest<HTMLElement>(".row2"),durCell=dur?.parentElement as HTMLElement|null,pub=byId("denemePub"),pubLabel=pub?.previousElementSibling as HTMLElement|null,pubList=byId("pubList"),diffRow=byId("denemeDiff")?.closest<HTMLElement>(".row2");
  const brans=byId("bransWrap"),gridLabel=byId("subjGrid")?.previousElementSibling as HTMLElement|null,grid=byId("subjGrid"),quick=byId("netQuick"),tools=card.querySelector<HTMLElement>(".rowtools"),saveBtn=card.querySelector<HTMLElement>(":scope > .btn.green");
  const steps=document.createElement("div");steps.className="eh-steps";steps.setAttribute("aria-label","Deneme ekleme adımları");
  steps.innerHTML='<button type="button" data-step="1">1 · Bilgiler</button><button type="button" data-step="2">2 · Sonuçlar</button><span data-step="3">3 · Yanlışlar</span>';
  card.prepend(steps);
  const extra=document.createElement("details");extra.className="eh-extra eh-s1";extra.innerHTML="<summary>Ek bilgiler <small>süre, yayınevi, zorluk, not</small></summary>";
  const extraBody=document.createElement("div");extraBody.className="eh-extra-body";extra.append(extraBody);
  if(durCell){const row=document.createElement("div");row.className="row2";row.append(durCell);extraBody.append(row);}
  for(const n of [pubLabel,pub,pubList,diffRow])if(n)extraBody.append(n);
  for(const n of [seg,nameLabel,name,dateRow])n?.classList.add("eh-s1");
  if(dateRow){dateRow.classList.remove("row2");dateRow.classList.add("eh-date-row");dateRow.after(extra);}
  const next=document.createElement("button");next.type="button";next.className="btn green eh-s1 eh-next";next.textContent="Devam · sonuçları gir";next.addEventListener("click",()=>setStep(2));
  extra.after(next);
  const summary=document.createElement("div");summary.id="ehStepSummary";summary.className="eh-step-summary eh-s2";next.after(summary);
  for(const n of [brans,gridLabel,grid,quick,tools,saveBtn])n?.classList.add("eh-s2");
  if(saveBtn)saveBtn.textContent="Kaydet";
  card.addEventListener("click",event=>{const t=event.target as HTMLElement,go=t.closest<HTMLElement>("[data-step-go],.eh-steps button[data-step]");if(!go)return;const step=Number(go.dataset.stepGo||go.dataset.step);if(step===1||step===2)setStep(step);});
  setStep(1);
}
function decorateRows():void{
  const rows=byId("dybRows"),card=byId("v315ExamFormCard");if(!rows||!card)return;
  const head=byId("dybHead");if(head&&!head.querySelector(".eh-rownet")){const c=document.createElement("div");c.className="eh-rownet";c.textContent="Net";head.append(c);}
  const type=formType(),track=String(state().puanTuru||"SAY"),field=type==="AYT"?AYT_FIELD[track]:undefined;
  Array.from(rows.querySelectorAll<HTMLElement>(".dyb-grid:not(.dyb-head)")).forEach(row=>{
    if(!row.querySelector(".eh-rownet")){const c=document.createElement("div");c.className="eh-rownet";c.textContent="0";row.append(c);}
    const name=(row.querySelector(".snm")?.childNodes[0]?.textContent||"").trim(),filled=Array.from(row.querySelectorAll<HTMLInputElement>("input")).some(i=>i.value!=="");
    row.classList.toggle("eh-off-field",!!field&&!field.includes(name)&&!filled);
  });
  let toggle=byId<HTMLButtonElement>("ehFieldToggle");
  if(field){
    const hidden=rows.querySelectorAll(".eh-off-field").length;
    if(!toggle){toggle=document.createElement("button");toggle.type="button";toggle.id="ehFieldToggle";toggle.className="eh-field-toggle eh-s2";toggle.addEventListener("click",()=>{showAllAyt=!showAllAyt;decorateRows();});rows.after(toggle);}
    toggle.hidden=!hidden&&!showAllAyt;
    toggle.innerHTML=showAllAyt?`Yalnız ${esc(FIELD_NAME[track]||"alan")} derslerini göster`:`${esc(FIELD_NAME[track]||"Alan")} dersleri gösteriliyor · <u>Tüm dersler (${hidden} daha)</u>`;
    card.classList.toggle("eh-all-subjects",showAllAyt);
  }else if(toggle){toggle.hidden=true;card.classList.remove("eh-all-subjects");}
  updateRowNets();
}
function updateRowNets():void{
  const rows=byId("dybRows");if(!rows)return;
  for(const row of Array.from(rows.querySelectorAll<HTMLElement>(".dyb-grid:not(.dyb-head)"))){
    const inputs=Array.from(row.querySelectorAll<HTMLInputElement>("input")),cell=row.querySelector<HTMLElement>(".eh-rownet");if(!cell||inputs.length<2)continue;
    const d=num(inputs[0]!.value),y=num(inputs[1]!.value),value=r2(d-y/4),empty=inputs.every(i=>i.value==="");
    cell.textContent=empty?"–":fmt(value);cell.classList.toggle("is-empty",empty);
  }
}

/* ---------- çizim ---------- */
function render():void{
  if(!ensureSkeleton())return;
  const tab=(screen()?.dataset.examTab as Tab)||"ozet",pane=byId(`examHub-${tab}`);
  for(const t of TABS){const p=byId(`examHub-${t}`);if(p)p.hidden=t!==tab;}
  if(!pane)return;
  try{if(tab==="ozet")renderOzet(pane);else if(tab==="analiz")renderAnaliz(pane);else if(tab==="hata")renderHata(pane);else renderGecmis(pane);}
  catch(error){console.error("v73 deneme ekranı",error);pane.innerHTML='<div class="card eh-empty">Bu bölüm şu an çizilemedi. Sayfayı yenilemeyi dene.</div>';}
}
function schedule():void{if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;render();});}

function onPaneClick(event:Event):void{
  const t=event.target as HTMLElement,act=t.closest<HTMLElement>("[data-act]"),filter=t.closest<HTMLElement>("[data-filter]");
  if(filter){errFilter=filter.dataset.filter||"all";errLimit=40;render();return;}
  if(!act)return;const a=act.dataset.act,id=num(act.dataset.id);
  if(a==="detail")call("openExamDetail",id);
  else if(a==="wrongs")call("openAnalysis",id,true);
  else if(a==="tab")setTab((act.dataset.tab as Tab)||"ozet");
  else if(a==="err-form"){errFormOpen=!errFormOpen;render();if(errFormOpen)byId("ehErrSubject")?.focus();}
  else if(a==="err-save")saveError();
  else if(a==="toggle")toggleError(act.dataset.key||"");
  else if(a==="delete")deleteError(act.dataset.key||"");
  else if(a==="photo-open")call("wrongPhotoOpen",id,0);
  else if(a==="photo-add")call("wrongPhotoPick",id);
  else if(a==="more-errors"){errLimit+=40;render();}
  else if(a==="clear-pick"){picked.length=0;render();}
}
function onPaneChange(event:Event):void{
  const t=event.target as HTMLElement;
  if(t instanceof HTMLSelectElement&&t.dataset.cmp){if(t.dataset.cmp==="a")compareA=num(t.value);else compareB=num(t.value);render();return;}
  if(t instanceof HTMLSelectElement&&t.classList.contains("eh-subject-filter")){errSubject=t.value;errLimit=40;render();return;}
  if(t instanceof HTMLSelectElement&&t.id==="ehErrSubject"){fillTopics(t.value);return;}
  if(t instanceof HTMLInputElement&&t.dataset.pick){const id=num(t.dataset.pick),i=picked.indexOf(id);if(t.checked&&i<0&&picked.length<2)picked.push(id);else if(!t.checked&&i>=0)picked.splice(i,1);render();}
}

function wrap(name:string,after:(result:unknown,args:unknown[])=>void,before?:(args:unknown[])=>unknown):void{
  const original=L[name];if(typeof original!=="function"||(original as {__v73?:boolean}).__v73)return;
  const fn=function(this:unknown,...args:unknown[]){const memo=before?.(args);const result=(original as LegacyFn).apply(this,args);try{after(result,[...args,memo]);}catch(error){console.error("v73 "+name,error);}return result;};
  (fn as {__v73?:boolean}).__v73=true;L[name]=fn;
}

/* Başka ekranlardan (İlerleme) Deneme'nin bir sekmesini açmak için. */
export function openExamTab(tab:Tab):void{call("go","deneme");setTab(tab);}

export function installExamHubV73():boolean{
  if(installed)return true;if(!ensureSkeleton())return false;installed=true;
  ensureSettings();ensureFormSteps();decorateRows();
  L.v315TrendSVG=trendSvg;
  for(const tab of TABS){const pane=byId(`examHub-${tab}`);pane?.addEventListener("click",onPaneClick);pane?.addEventListener("change",onPaneChange);}
  wrap("renderV315Dashboard",()=>schedule());
  wrap("renderWrongTopics",()=>schedule());
  wrap("errorJournalRender",()=>schedule());
  wrap("renderDybRows",()=>decorateRows());
  wrap("livePreview",()=>updateRowNets());
  wrap("copyLastDeneme",()=>decorateRows());
  wrap("openV315ExamForm",()=>setStep(1));
  wrap("closeV315ExamForm",()=>setStep(1));
  // Kayıttan sonra form kapanır; yanlışı olan denemede "yanlışları konulara işle" adımı açılır.
  const afterSave=(_r:unknown,args:unknown[])=>{
    const before=num(args.at(-1)),all=list(state().denemeler);if(all.length<=before)return;
    const added=all.reduce((a,b)=>num(b.id)>num(a.id)?b:a);call("closeV315ExamForm",false);
    const overlay=byId("anaOverlay");if(wrongTotal(added)>0&&overlay&&overlay.style.display!=="flex")call("openAnalysis",added.id,true);
    setTab("ozet");
  };
  wrap("addDeneme",afterSave,()=>list(state().denemeler).length);
  wrap("addDenemeByNet",afterSave,()=>list(state().denemeler).length);
  byId("dybRows")?.addEventListener("input",()=>{updateRowNets();});
  byId("dybRows")?.addEventListener("change",()=>decorateRows());
  for(const event of ["yks:data-changed","yks:data-primary-ready"])window.addEventListener(event,schedule);
  document.addEventListener("yks:navigation-after",event=>{const d=(event as CustomEvent<{screen?:string;to?:string}>).detail;if((d?.screen??d?.to)==="deneme")schedule();});
  call("renderV315Dashboard");render();
  document.documentElement.dataset.examHubV73="ready";
  return true;
}
