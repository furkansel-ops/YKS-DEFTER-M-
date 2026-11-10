import "./focus-v107.css";

/* Odak v107: sayaç en üstte, ders seçimi tek satır, bugünün oturumları ekranda, araçlar kutu.
 * v70'in kurduğu düğümlerin üstüne eklenir; sayaç, kronometre, kayıt ve program mantığına dokunmaz,
 * veri yazmaz. Okuduğu: bugünkü oturumlar (v29SessionList) ve günlük hedef (S.focus.goalMin).
 * Bir düğüm yalnız değeri değişince yazılır: #pomo'yu izleyen gözlemciler aynı yazıyla tetiklenmesin. */

type Loose=Record<string,any>;
type FocusWindow=Window&{
  v29SessionList?:(days:number)=>unknown;
  YKSLegacyState?:{readState?:()=>Loose};
  v105SubjectIcon?:(name:string)=>string;
  YKSTaskText?:{subjectTone?:(value:string)=>string};
};
export type FocusRow={time:string;subject:string;topic:string;minutes:number};

export function focusDuration(minutes:number):string{
  const total=Math.max(0,Math.round(Number(minutes)||0)),hours=Math.floor(total/60),rest=total%60;
  return hours?(rest?hours+" sa "+rest+" dk":hours+" sa"):total+" dk";
}
// Ders seçimi satırı: seçici "Genel Çalışma" ve "Konu seç" yazıyorsa seçim yok demektir.
export function focusWhatText(subject:string,topic:string,goal:number):{title:string;sub:string}{
  const name=String(subject||"").trim(),part=String(topic||"").trim(),target=Math.max(0,Math.floor(Number(goal)||0));
  const chosen=!!name&&name!=="Genel Çalışma",hasTopic=chosen&&!!part&&part!=="Konu seç";
  const hint=chosen?(hasTopic?"":"Konu seçilmedi"):"Ders ve konu seçmek için dokun";
  return {title:chosen?(hasTopic?name+" · "+part:name):"Genel çalışma",sub:[hint,target?target+" soru hedefi":""].filter(Boolean).join(" · ")||"Değiştirmek için dokun"};
}
export function focusTodaySummary(minutes:number,goal:number,count:number):string{
  const done=Math.max(0,Math.round(Number(minutes)||0)),target=Math.max(0,Math.round(Number(goal)||0)),sessions=Math.max(0,Math.floor(Number(count)||0));
  if(target)return focusDuration(done)+" / "+focusDuration(target)+" hedef";
  if(!done&&!sessions)return "Henüz oturum yok";
  return focusDuration(done)+(sessions?" · "+sessions+" oturum":"");
}
// En yeni oturum üstte; süresi olmayan ya da bozuk kayıt gösterilmez.
export function focusRecentSessions(list:unknown,limit=3):FocusRow[]{
  if(!Array.isArray(list))return [];
  return list.filter(item=>item&&Number(item.m)>0).slice().sort((a,b)=>(Number(b.t)||0)-(Number(a.t)||0)).slice(0,limit).map(item=>{
    const at=Number(item.t)||0,date=at?new Date(at):null;
    return {
      time:date?String(date.getHours()).padStart(2,"0")+":"+String(date.getMinutes()).padStart(2,"0"):"",
      subject:String(item.subj||"Genel çalışma"),topic:String(item.topic||""),minutes:Math.round(Number(item.m))
    };
  });
}

function make<K extends keyof HTMLElementTagNameMap>(tag:K,className:string,text?:string):HTMLElementTagNameMap[K]{
  const element=document.createElement(tag);if(className)element.className=className;if(text)element.textContent=text;return element;
}
function setText(node:Element|null|undefined,text:string):void{if(node&&node.textContent!==text)node.textContent=text;}

export function installFocusV107():boolean{
  const root=document.getElementById("pomo");if(!root)return false;
  if(root.dataset.v107==="ready")return true;
  const win=window as FocusWindow,done=new Set<string>();
  const tone=(name:string):string=>{try{return win.YKSTaskText?.subjectTone?.(name)||"other";}catch{return "other";}};

  // Ayarlar ve oturum listesi araç kutularında görünmez; dişli ve "Tüm oturumlar" bağlantısı onları açar.
  function openTool(key:string):void{
    const row=document.querySelector<HTMLDetailsElement>('#v70FocusTools [data-tool="'+key+'"]');if(!row)return;
    row.open=true;
    row.scrollIntoView({block:"start",behavior:matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth"});
    row.querySelector<HTMLElement>("summary")?.focus({preventScroll:true});
  }
  function head():boolean{
    if(document.getElementById("v107Settings"))return true;
    const row=root!.querySelector<HTMLElement>("#v70FocusHead .v70-head-row"),minimal=row?.querySelector<HTMLButtonElement>(".v70-minimal");
    if(!row||!minimal)return false;
    const gear=make("button","v107-gear");gear.type="button";gear.id="v107Settings";
    gear.setAttribute("aria-label","Odak ayarları");gear.title="Odak ayarları";
    gear.addEventListener("click",()=>openTool("settings"));
    minimal.insertAdjacentElement("beforebegin",gear);
    if(minimal.textContent?.trim()==="Minimal mod")minimal.textContent="Minimal";
    root!.classList.add("v107-has-gear");
    return true;
  }
  let syncWhat=():void=>{};
  function what():boolean{
    if(document.getElementById("v107What"))return true;
    const setup=root!.querySelector<HTMLElement>(".v29-session-setup.v60-compact");
    const subject=setup?.querySelector<HTMLElement>(".v60-subject .v60-choice-value"),topic=setup?.querySelector<HTMLElement>(".v60-topic .v60-choice-value");
    if(!setup||!subject||!topic)return false;
    const goal=document.getElementById("v29GoalQ") as HTMLInputElement|null;
    const button=make("button","v107-what");button.type="button";button.id="v107What";button.setAttribute("aria-expanded","false");
    const tile=make("i","v107-tile"),title=make("b",""),sub=make("small",""),copy=make("span","v107-what-copy"),chevron=make("i","v107-chev");
    tile.setAttribute("aria-hidden","true");chevron.setAttribute("aria-hidden","true");
    copy.append(title,sub);button.append(tile,copy,chevron);setup.prepend(button);
    syncWhat=():void=>{
      const name=subject.textContent||"",text=focusWhatText(name,topic.textContent||"",Number(goal?.value)||0);
      setText(title,text.title);setText(sub,text.sub);
      let icon="kitap";try{icon=win.v105SubjectIcon?.(name)||"kitap";}catch{}
      const color=tone(name);
      if(tile.dataset.v105Ic!==icon)tile.dataset.v105Ic=icon;
      if(tile.dataset.tone!==color)tile.dataset.tone=color;
    };
    button.addEventListener("click",()=>{const open=setup.classList.toggle("v107-open");button.setAttribute("aria-expanded",String(open));});
    for(const node of [subject,topic])new MutationObserver(()=>syncWhat()).observe(node,{childList:true,characterData:true,subtree:true});
    goal?.addEventListener("input",()=>syncWhat());
    syncWhat();root!.classList.add("v107-has-what");
    return true;
  }
  let lastToday="";
  function paintToday():void{
    const card=document.getElementById("v107Today");if(!card)return;
    const minutes=Number(document.getElementById("pomoTodayMin")?.textContent)||0;
    let goal=0,list:unknown=[];
    try{goal=Number(win.YKSLegacyState?.readState?.()?.focus?.goalMin)||0;list=win.v29SessionList?.(1);}catch{}
    const rows=focusRecentSessions(list),count=Array.isArray(list)?list.length:0;
    const key=JSON.stringify([minutes,goal,count,rows]);if(key===lastToday)return;lastToday=key;
    setText(card.querySelector(".v107-today-sum"),focusTodaySummary(minutes,goal,count));
    const bar=card.querySelector<HTMLElement>(".v107-bar"),fill=bar?.firstElementChild as HTMLElement|null;
    if(bar)bar.hidden=!goal;
    if(fill)fill.style.width=(goal?Math.min(100,Math.round(minutes/goal*100)):0)+"%";
    const more=card.querySelector<HTMLElement>(".v107-more");if(more)more.hidden=!count;
    const box=card.querySelector<HTMLElement>(".v107-sessions");if(!box)return;
    box.replaceChildren(...rows.map(row=>{
      const line=make("div","v107-session"),label=make("span","v107-session-name"),dot=make("i","");
      dot.dataset.tone=tone(row.subject);dot.setAttribute("aria-hidden","true");
      label.append(dot,make("b","",row.subject));if(row.topic)label.append(" · "+row.topic);
      line.append(make("small","",row.time),label,make("em","",row.minutes+" dk"));
      return line;
    }));
    if(!rows.length)box.append(make("p","v107-empty","İlk oturumun bittiğinde burada görünür."));
  }
  function today():boolean{
    if(document.getElementById("v107Today"))return true;
    const side=root!.querySelector<HTMLElement>(".desktop-focus-side.v70-setup-side");if(!side)return false;
    const card=make("section","card v107-today");card.id="v107Today";card.setAttribute("aria-label","Bugünkü odak");
    const headRow=make("div","v107-today-head");headRow.append(make("b","","Bugün"),make("small","v107-today-sum"));
    const bar=make("span","v107-bar");bar.append(make("i",""));bar.hidden=true;
    const more=make("button","v107-more","Tüm oturumlar ve gün özeti");more.type="button";more.hidden=true;
    more.addEventListener("click",()=>openTool("sessions"));
    card.append(headRow,bar,make("div","v107-sessions"),more);side.append(card);
    root!.classList.add("v107-has-today");paintToday();
    return true;
  }
  function tools():boolean{
    const list=document.getElementById("v70FocusTools");if(!list)return false;
    list.dataset.v107="grid";return true;
  }

  const steps:[string,()=>boolean][]=[["head",head],["what",what],["today",today],["tools",tools]];
  const run=():boolean=>{for(const [name,step] of steps)if(!done.has(name)&&step())done.add(name);return done.size===steps.length;};
  if(!run()){
    // v70 parçaları farklı anlarda kurulur; eksik adım gelene kadar #pomo izlenir (en çok 15 sn).
    const retry=new MutationObserver(()=>{if(run())retry.disconnect();});
    retry.observe(root,{childList:true,subtree:true});
    window.setTimeout(()=>retry.disconnect(),15000);
  }
  const refresh=():void=>{syncWhat();paintToday();};
  const todayMin=document.getElementById("pomoTodayMin");
  if(todayMin)new MutationObserver(paintToday).observe(todayMin,{childList:true,characterData:true,subtree:true});
  window.addEventListener("yks:data-changed",refresh);
  // Giriş hareketi yalnız ekrana girişte oynar.
  let enterTimer=0;
  document.addEventListener("yks:navigation-after",event=>{
    const detail=(event as CustomEvent<{to?:string;screen?:string}>).detail;
    if((detail?.to??detail?.screen)!=="pomo")return;
    refresh();root.dataset.v107Enter="";
    window.clearTimeout(enterTimer);enterTimer=window.setTimeout(()=>{delete root.dataset.v107Enter;},1300);
  });
  root.dataset.v107="ready";
  return true;
}
