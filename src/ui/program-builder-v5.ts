import type {SubjectDefinition} from "../domain/contracts";
import "./program-builder-v5.css";

type Goal="TYT"|"TYT+AYT"|"AYT";
type DraftTask={subject:string;topic:string;text:string};
type Prefs={
  goal:Goal;
  subjects:Set<string>;
  topics:Map<string,Set<string>>;
  daily:number;
  mathDaily:boolean;
  noTripleScience:boolean;
  lightWeekend:boolean;
  reviews:boolean;
  replace:boolean;
};
type HostWindow=Window&{
  addRow?:(block:"s")=>unknown;
  renderPlan?:()=>unknown;
  renderTodayPlan?:()=>unknown;
  toast?:(message:string)=>unknown;
  save?:()=>unknown;
};

const SCIENCE=["fizik","kimya","biyoloji"];
const DAY_NAMES=["Pazartesi","Salı","Çarşamba","Perşembe","Cuma","Cumartesi","Pazar"];

function esc(value:unknown):string{
  return String(value??"").replace(/[&<>"']/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]||char));
}
function norm(value:unknown):string{return String(value??"").trim().toLocaleLowerCase("tr-TR");}
function subjectKey(subject:SubjectDefinition):string{return subject.exam+"|"+subject.name;}
function isMath(name:string):boolean{return norm(name).includes("matematik");}
function isScience(name:string):boolean{return SCIENCE.some(item=>norm(name).includes(item));}
function tone(name:string):string{
  const value=norm(name);
  if(value.includes("matematik"))return"math";
  if(value.includes("fizik"))return"physics";
  if(value.includes("kimya"))return"chemistry";
  if(value.includes("biyoloji"))return"biology";
  if(value.includes("türk"))return"turkish";
  return"other";
}
function allows(subject:SubjectDefinition,goal:Goal):boolean{
  const exam=String(subject.exam||"").toUpperCase();
  return goal==="TYT"?exam==="TYT":goal==="AYT"?exam==="AYT":exam==="TYT"||exam==="AYT";
}
function catalog():SubjectDefinition[]{
  try{return window.YKSLegacyState?.subjects?.()??[];}catch{return [];}
}
function defaultSubjects(subjects:SubjectDefinition[],goal:Goal):Set<string>{
  const chosen=new Set<string>(),wanted=["matematik","fizik","kimya","biyoloji"];
  for(const subject of subjects){
    if(allows(subject,goal)&&wanted.some(item=>norm(subject.name).includes(item)))chosen.add(subjectKey(subject));
  }
  if(!chosen.size)subjects.filter(subject=>allows(subject,goal)).slice(0,4).forEach(subject=>chosen.add(subjectKey(subject)));
  return chosen;
}
function defaultTopics(subjects:SubjectDefinition[],chosen:Set<string>):Map<string,Set<string>>{
  const result=new Map<string,Set<string>>();
  for(const subject of subjects)if(chosen.has(subjectKey(subject)))result.set(subjectKey(subject),new Set(subject.topics.slice(0,2)));
  return result;
}
function buildDraft(subjects:SubjectDefinition[],prefs:Prefs):DraftTask[][]{
  const picked=subjects.filter(subject=>prefs.subjects.has(subjectKey(subject))&&allows(subject,prefs.goal));
  const days:Array<DraftTask[]>=Array.from({length:7},()=>[]);
  if(!picked.length)return days;
  const maths=picked.find(subject=>isMath(subject.name))??null;
  const others=picked.filter(subject=>subject!==maths);
  const topicIndex=new Map<string,number>();
  let subjectIndex=0;

  const add=(day:number,subject:SubjectDefinition)=>{
    const id=subjectKey(subject);
    const chosen=[...(prefs.topics.get(id)??new Set<string>())];
    const topics=chosen.length?chosen:subject.topics.slice(0,3);
    const index=topicIndex.get(id)??0;
    topicIndex.set(id,index+1);
    const topic=topics.length?topics[index%topics.length]??"":"";
    days[day]!.push({subject:subject.name,topic,text:topic?subject.name+" · "+topic:subject.name});
  };

  for(let day=0;day<7;day++){
    const target=Math.max(1,prefs.lightWeekend&&day>=5?prefs.daily-1:prefs.daily);
    if(prefs.mathDaily&&maths)add(day,maths);
    let guard=0;
    while(days[day]!.length<target&&guard<100){
      guard++;
      const pool=others.length?others:picked;
      const subject=pool[subjectIndex%pool.length];
      subjectIndex++;
      if(!subject)break;
      if(prefs.noTripleScience&&isScience(subject.name)&&days[day]!.filter(task=>isScience(task.subject)).length>=2)continue;
      if(days[day]!.some(task=>task.subject===subject.name)&&pool.length>1)continue;
      add(day,subject);
    }
    if(prefs.reviews&&(day===1||day===3||day===6))days[day]!.push({subject:"Tekrar",topic:"Kısa tekrar",text:"Tekrar · Kısa tekrar"});
  }
  return days;
}

function studyCells(day:number):HTMLElement[]{
  return Array.from(document.querySelectorAll<HTMLElement>('#gridS [data-blk="s"][data-d="'+day+'"] .gtx'));
}
function writeCell(cell:HTMLElement,text:string):void{
  cell.textContent=text;
  cell.dispatchEvent(new Event("input",{bubbles:true}));
}
function nextEmpty(day:number):HTMLElement|null{
  return studyCells(day).find(cell=>!String(cell.textContent||"").trim())??null;
}
function ensureEmpty(day:number):HTMLElement|null{
  let cell=nextEmpty(day),guard=0;
  while(!cell&&guard<20){
    guard++;
    const before=studyCells(day).length;
    (window as HostWindow).addRow?.("s");
    if(studyCells(day).length<=before)break;
    cell=nextEmpty(day);
  }
  return cell;
}
function clearStudy():void{
  document.querySelectorAll<HTMLElement>('#gridS [data-blk="s"] .gtx').forEach(cell=>{
    if(String(cell.textContent||"").trim())writeCell(cell,"");
  });
}
function applyDraft(draft:DraftTask[][],prefs:Prefs):{added:number;skipped:number}{
  if(prefs.replace)clearStudy();
  let added=0,skipped=0;
  for(let day=0;day<7;day++){
    for(const task of draft[day]??[]){
      const cell=ensureEmpty(day);
      if(!cell){skipped++;continue;}
      writeCell(cell,task.text);
      added++;
    }
  }
  (window as HostWindow).save?.();
  (window as HostWindow).renderPlan?.();
  (window as HostWindow).renderTodayPlan?.();
  try{window.dispatchEvent(new CustomEvent("yks:program-builder-applied",{detail:{added,skipped}}));}catch{}
  return {added,skipped};
}
function focusManual():void{
  const editor=document.querySelector<HTMLElement>("[data-v5-program-editor]");
  if(editor)editor.hidden=false;
  const target=document.querySelector<HTMLElement>("#gridS .gtx");
  if(target){target.scrollIntoView({behavior:"smooth",block:"center"});window.setTimeout(()=>target.focus(),160);}
}
function createHost():HTMLElement{
  const old=document.getElementById("programBuilderV5");
  if(old instanceof HTMLElement)return old;
  const host=document.createElement("div");
  host.id="programBuilderV5";
  host.className="v5-builder";
  host.hidden=true;
  document.body.appendChild(host);
  return host;
}

export function openProgramBuilderV5():void{
  const subjects=catalog(),host=createHost();
  let step=0,draft:DraftTask[][]=[];
  const prefs:Prefs={
    goal:"TYT+AYT",
    subjects:defaultSubjects(subjects,"TYT+AYT"),
    topics:new Map<string,Set<string>>(),
    daily:3,
    mathDaily:true,
    noTripleScience:true,
    lightWeekend:true,
    reviews:true,
    replace:false
  };
  prefs.topics=defaultTopics(subjects,prefs.subjects);

  const close=()=>{host.hidden=true;host.innerHTML="";document.documentElement.classList.remove("v5-builder-open");};

  const render=()=>{
    host.hidden=false;
    document.documentElement.classList.add("v5-builder-open");
    const available=subjects.filter(subject=>allows(subject,prefs.goal));
    const selected=available.filter(subject=>prefs.subjects.has(subjectKey(subject)));
    const progress=Math.round(step/4*100);
    let body="";

    if(step===0){
      body='<div class="v5-builder-intro"><span>PROGRAM OLUŞTUR</span><h2>Nasıl oluşturmak istersin?</h2><p>İstersen kendin doldur, istersen önce dengeli bir taslak oluştur.</p></div>'+
        '<div class="v5-builder-mode-grid">'+
          '<button type="button" class="v5-builder-mode" data-manual><i>✎</i><span><b>Kendim Oluştur</b><small>Mevcut program düzenleyicisini aç.</small></span><em>›</em></button>'+
          '<button type="button" class="v5-builder-mode is-smart" data-smart><i>✦</i><span><b>Akıllı Oluştur</b><small>Derslerini dağıt, kaydetmeden önce gör.</small></span><em>›</em></button>'+
        '</div>';
    }else if(step===1){
      body='<div class="v5-builder-intro"><span>1 · HEDEF</span><h2>Hedefini seç</h2><p>Programın ders havuzunu belirle.</p></div><div class="v5-builder-goals">';
      for(const item of ["TYT","TYT+AYT","AYT"] as Goal[]){
        body+='<button type="button" data-goal="'+item+'" class="'+(prefs.goal===item?"is-selected":"")+'"><b>'+item+'</b><span>'+(item==="TYT"?"Temel hazırlık":item==="AYT"?"Alan ağırlıklı":"Dengeli hazırlık")+'</span></button>';
      }
      body+="</div>";
    }else if(step===2){
      body='<div class="v5-builder-intro"><span>2 · DERS VE KONU</span><h2>Bu hafta ne çalışacaksın?</h2><p>Dersleri ve çalışmak istediğin konuları seç.</p></div><div class="v5-builder-subjects">';
      for(const subject of available){
        const id=subjectKey(subject),on=prefs.subjects.has(id),picked=prefs.topics.get(id)??new Set<string>();
        body+='<article class="v5-builder-subject '+(on?"is-selected":"")+'" data-tone="'+tone(subject.name)+'">'+
          '<button type="button" class="v5-builder-subject-head" data-subject="'+esc(id)+'"><i>'+esc(subject.name.slice(0,1))+'</i><span><b>'+esc(subject.name)+'</b><small>'+esc(subject.exam)+' · '+subject.topics.length+' konu</small></span><em>'+(on?"✓":"+")+'</em></button>';
        if(on){
          body+='<div class="v5-builder-topics">';
          for(const topic of subject.topics.slice(0,8))body+='<button type="button" data-topic-subject="'+esc(id)+'" data-topic="'+esc(topic)+'" class="'+(picked.has(topic)?"is-selected":"")+'">'+esc(topic)+'</button>';
          body+="</div>";
        }
        body+="</article>";
      }
      body+="</div>";
    }else if(step===3){
      body='<div class="v5-builder-intro"><span>3 · YOĞUNLUK</span><h2>Haftanın ritmini ayarla</h2><p>'+selected.length+' ders seçili. Günlük yükü ve kuralları belirle.</p></div><div class="v5-builder-load">';
      for(const value of [2,3,4,5])body+='<button type="button" data-daily="'+value+'" class="'+(prefs.daily===value?"is-selected":"")+'"><b>'+value+'</b><span>görev / gün</span></button>';
      body+='</div><div class="v5-builder-prefs">';
      const rows=[
        ["mathDaily","Matematik her gün olsun","Matematik seçiliyse her güne bir blok koyar."],
        ["noTripleScience","Fen üçlüsü aynı güne yığılmasın","Bir günde en fazla iki fen dersi bırakır."],
        ["lightWeekend","Hafta sonu daha hafif olsun","Cumartesi ve pazar yükünü bir azaltır."],
        ["reviews","Kısa tekrarlar ekle","Salı, perşembe ve pazara tekrar ekler."],
        ["replace","Mevcut ders programını değiştir","Kapalıysa yalnız boş hücreleri kullanır."]
      ];
      for(const [id,title,copy] of rows){
        body+='<label><span><b>'+title+'</b><small>'+copy+'</small></span><input type="checkbox" data-pref="'+id+'" '+((prefs as unknown as Record<string,boolean>)[id]?"checked":"")+'></label>';
      }
      body+="</div>";
    }else{
      body='<div class="v5-builder-intro"><span>4 · ÖNİZLEME</span><h2>Programın hazır</h2><p>“Bu programı kullan” demeden mevcut programına hiçbir şey yazılmaz.</p></div><div class="v5-builder-preview">';
      draft.forEach((tasks,day)=>{
        body+='<article><header><b>'+(DAY_NAMES[day]??"")+'</b><span>'+tasks.length+' görev</span></header><div>';
        if(!tasks.length)body+="<em>Boş gün</em>";
        for(const task of tasks)body+='<div class="v5-builder-task" data-tone="'+tone(task.subject)+'"><i></i><span><b>'+esc(task.subject)+'</b><small>'+esc(task.topic||"Genel çalışma")+'</small></span></div>';
        body+="</div></article>";
      });
      body+="</div>";
    }

    host.innerHTML='<div class="v5-builder-backdrop" data-close></div>'+
      '<section class="v5-builder-sheet" role="dialog" aria-modal="true" aria-label="Program oluştur">'+
        '<header><div><b>Program Oluştur</b><span>'+(step===0?"Başlangıç":step+"/4")+'</span></div><button type="button" data-close aria-label="Kapat">×</button></header>'+
        '<div class="v5-builder-progress"><i style="width:'+progress+'%"></i></div>'+
        '<main>'+body+'</main>'+
        (step>0?'<footer><button type="button" class="btn ghost" data-back>Geri</button><button type="button" class="btn green" data-next>'+(step===4?"Bu programı kullan":"Devam et")+'</button></footer>':"")+
      '</section>';

    host.querySelectorAll("[data-close]").forEach(node=>node.addEventListener("click",close));
    host.querySelector("[data-manual]")?.addEventListener("click",()=>{close();focusManual();});
    host.querySelector("[data-smart]")?.addEventListener("click",()=>{step=1;render();});
    host.querySelectorAll<HTMLElement>("[data-goal]").forEach(button=>button.addEventListener("click",()=>{
      prefs.goal=button.dataset.goal as Goal;
      prefs.subjects=defaultSubjects(subjects,prefs.goal);
      prefs.topics=defaultTopics(subjects,prefs.subjects);
      render();
    }));
    host.querySelectorAll<HTMLElement>("[data-subject]").forEach(button=>button.addEventListener("click",()=>{
      const id=button.dataset.subject||"";
      if(prefs.subjects.has(id)){prefs.subjects.delete(id);prefs.topics.delete(id);}
      else{
        prefs.subjects.add(id);
        const subject=subjects.find(item=>subjectKey(item)===id);
        if(subject)prefs.topics.set(id,new Set(subject.topics.slice(0,2)));
      }
      render();
    }));
    host.querySelectorAll<HTMLElement>("[data-topic]").forEach(button=>button.addEventListener("click",()=>{
      const id=button.dataset.topicSubject||"",topic=button.dataset.topic||"";
      const set=prefs.topics.get(id)??new Set<string>();
      if(set.has(topic))set.delete(topic);else set.add(topic);
      prefs.topics.set(id,set);
      render();
    }));
    host.querySelectorAll<HTMLElement>("[data-daily]").forEach(button=>button.addEventListener("click",()=>{
      prefs.daily=Math.max(2,Math.min(5,Number(button.dataset.daily)||3));
      render();
    }));
    host.querySelectorAll<HTMLInputElement>("[data-pref]").forEach(input=>input.addEventListener("change",()=>{
      (prefs as unknown as Record<string,unknown>)[input.dataset.pref||""]=input.checked;
    }));
    host.querySelector("[data-back]")?.addEventListener("click",()=>{step=Math.max(0,step-1);render();});
    host.querySelector("[data-next]")?.addEventListener("click",()=>{
      if(step===2&&!prefs.subjects.size){(window as HostWindow).toast?.("En az bir ders seç");return;}
      if(step<4){
        if(step===3)draft=buildDraft(subjects,prefs);
        step++;
        render();
        return;
      }
      const result=applyDraft(draft,prefs);
      close();
      (window as HostWindow).toast?.(result.added?result.added+" görev Programım'a eklendi ✓":"Program eklenemedi");
    });
  };
  render();
}

export function installProgramBuilderV5():{installed:boolean;validate:()=>string[]}{
  const program=document.getElementById("program");
  if(!(program instanceof HTMLElement))return {installed:false,validate:()=>["program screen missing"]};
  if(!program.querySelector("[data-v5-builder-trigger]")){
    const header=program.querySelector<HTMLElement>(".v5-program-header-actions");
    const button=document.createElement("button");
    button.type="button";
    button.className="btn green";
    button.dataset.v5BuilderTrigger="true";
    button.textContent="Program Oluştur";
    button.addEventListener("click",openProgramBuilderV5);
    header?.appendChild(button);
  }
  window.addEventListener("yks:open-program-builder",openProgramBuilderV5);
  return {installed:true,validate:()=>program.querySelector("[data-v5-builder-trigger]")?[]:["program builder trigger missing"]};
}
