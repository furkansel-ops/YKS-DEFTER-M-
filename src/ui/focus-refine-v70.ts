import "./focus-refine-v70.css";

/* Odak v70: var olan ekran korunur, yalnız düzen ve görünüm iyileşir. Gerçek eski düğümler
 * TAŞINIR (kopyalanmaz); sayaç, kronometre, kayıt ve program mantığı yerinde kalır.
 * 1 ders/konu/soru sayacın üstünde · 2 süre tek sıra + Özel · 3 çalışma evresi uygulamanın mavisi (CSS)
 * 4 bildirimden kontrol Odak ayarlarında · 5 bugünkü toplam başlığın altında · 6 araçlar açık liste
 * 7 Minimal başlığın yanında · 8 çalışırken süre ayarları gizli, soru sayacı görünür */

type FocusWindow=Window&{v29SessionList?:(days:number)=>unknown;openFold?:(name:string)=>void};
type ToolKey="sessions"|"manual"|"breath"|"exam"|"history"|"settings"|"other";

const QUESTION_KEY="yks_v70_focus_questions";
const TOOLS:{key:ToolKey;icon:string;title:string;sub:string;fold?:string}[]=[
  {key:"sessions",icon:"▤",title:"Bugünün oturumları",sub:"Oturumlar ve gün sonu özeti"},
  {key:"manual",icon:"＋",title:"Elle süre ekle",sub:"Sayaçsız çalıştıysan süreyi yaz"},
  {key:"breath",icon:"◌",title:"Nefes egzersizi",sub:"1 · 2 · 5 dakika"},
  {key:"exam",icon:"✎",title:"Sınav provası",sub:"TYT 165 · AYT 180 · YDT 80 dk"},
  {key:"history",icon:"▥",title:"Geçmiş ve analiz",sub:"Zaman çizelgesi, aylık özet, derse göre",fold:"odak2"},
  {key:"settings",icon:"⚙",title:"Odak ayarları",sub:"Ses, molalar, bildirimden kontrol",fold:"odakayar"},
  {key:"other",icon:"…",title:"Diğer odak araçları",sub:"Odak ekranındaki diğer bölümler"}
];

// Yarıda kalan sayaç da dakika yazar ama oturum saymaz; o yüzden oturum sayısı yalnız varsa eklenir.
export function focusTodayText(minutes:number,sessions:number):string{
  const total=Math.max(0,Math.round(Number(minutes)||0)),hours=Math.floor(total/60),rest=total%60;
  const count=Math.max(0,Math.floor(Number(sessions)||0));
  if(!total&&!count)return "Bugün henüz odaklanmadın";
  const time=hours?(rest?hours+" sa "+rest+" dk":hours+" sa"):total+" dk";
  return "Bugün "+time+(count?" · "+count+" oturum":"");
}

function make<K extends keyof HTMLElementTagNameMap>(tag:K,className:string,text?:string):HTMLElementTagNameMap[K]{
  const element=document.createElement(tag);element.className=className;if(text)element.textContent=text;return element;
}
function readQuestions():number{
  try{return Math.max(0,Math.min(999,Number(localStorage.getItem(QUESTION_KEY))||0));}catch{return 0;}
}
function writeQuestions(count:number):void{
  try{if(count)localStorage.setItem(QUESTION_KEY,String(count));else localStorage.removeItem(QUESTION_KEY);}catch{}
}
// Eski ayrıntı kutusundaki her düğüm hangi araç satırına gider: kimlik, sınıf, sonra başlık metni.
function toolFor(node:HTMLElement,current:ToolKey|null):ToolKey{
  if(node.matches("#v29Dashboard,.stats,#pauseStat,#sessionList,#v29DaySummary"))return "sessions";
  if(node.matches(".focus-manual-entry"))return "manual";
  if(node.matches("#fh_odak2,#fb_odak2,.focus-month-card"))return "history";
  if(node.matches("#fh_odakayar,#fb_odakayar"))return "settings";
  if(node.tagName==="H2"){
    const text=node.textContent||"";
    if(/Bugünün oturumları|Gün sonu/.test(text))return "sessions";
    if(/Nefes/.test(text))return "breath";
    if(/Sınav/.test(text))return "exam";
    if(/Aylık|Derse göre/.test(text))return "history";
    return "other";
  }
  return current||"other";
}

export function installFocusRefineV70():boolean{
  const root=document.getElementById("pomo");if(!root)return false;
  if(root.dataset.v70==="ready")return true;
  const win=window as FocusWindow;
  const done=new Set<string>();

  // 5 · 7: başlık satırında Minimal düğmesi, altında bugünkü toplam.
  function head():boolean{
    if(document.getElementById("v70FocusHead"))return true;
    const title=root!.querySelector<HTMLElement>(".rb-secondary-title");
    const minimal=root!.querySelector<HTMLButtonElement>(".v60-head>button");
    if(!title||!minimal)return false;
    // Başlık yerine tek kutu girer: masaüstünde #pomo ızgarasının satır sayısı değişmez.
    const box=make("div","v70-head"),row=make("div","v70-head-row");box.id="v70FocusHead";
    title.insertAdjacentElement("beforebegin",box);
    minimal.classList.add("v70-minimal");
    row.append(title,minimal);
    const today=make("p","v70-today");today.id="v70FocusToday";
    box.append(row,today);
    return true;
  }
  // 1: "Ne çalışıyorsun?" kartı tek sütunlu düzende sayacın üstüne çıkar (CSS order).
  function setupFirst():boolean{
    const setup=root!.querySelector<HTMLElement>(".v29-session-setup.v60-compact");
    const side=setup?.closest<HTMLElement>(".desktop-focus-side");
    if(!setup||!side)return false;
    side.classList.add("v70-setup-side");
    const label=setup.querySelector<HTMLElement>(".v60-title");
    if(label)label.textContent="Ne çalışıyorsun?";
    return true;
  }
  // 2: hazır süreler ve Özel tek sırada; −5/+5, özel dakika ve "şu saate kadar" Özel'in altında.
  function duration():boolean{
    if(document.getElementById("v70QuickRow"))return true;
    const wrap=document.getElementById("quickWrap"),mins=document.getElementById("quickMins");
    const customBox=wrap?.querySelector<HTMLElement>(".focus-custom-time");
    if(!wrap||!mins||!customBox)return false;
    const row=make("div","v70-quickrow");row.id="v70QuickRow";
    mins.insertAdjacentElement("beforebegin",row);row.append(mins);
    if(!customBox.id)customBox.id="v70CustomTime";
    const custom=make("button","qbtn v70-custom-btn","Özel");custom.type="button";custom.id="v70CustomBtn";
    custom.setAttribute("aria-expanded","false");custom.setAttribute("aria-controls",customBox.id);
    row.append(custom);
    const sync=():void=>{custom.classList.toggle("on",!mins.querySelector(".qbtn.on"));};
    const setOpen=(open:boolean):void=>{
      wrap.classList.toggle("v70-custom-open",open);custom.setAttribute("aria-expanded",open?"true":"false");
    };
    custom.addEventListener("click",()=>{
      const open=!wrap.classList.contains("v70-custom-open");setOpen(open);
      if(open)document.getElementById("customFocusMin")?.focus({preventScroll:true});
    });
    // Hazır süreye dokunmak Özel ayrıntılarını kapatır.
    mins.addEventListener("click",event=>{if(event.target instanceof Element&&event.target.closest(".qbtn"))setOpen(false);});
    new MutationObserver(sync).observe(mins,{childList:true,subtree:true,attributes:true,attributeFilter:["class"]});
    wrap.classList.add("v70-quick");sync();
    return true;
  }
  // 6: kapalı "Oturumlarım, egzersizler ve odak ayarları" kutusu açık araç listesine döner.
  function tools():boolean{
    const details=document.getElementById("refinedFocusDetails") as HTMLDetailsElement|null;
    if(!details)return false;
    if(details.dataset.v70==="list")return true;
    const list=make("div","v70-tools");list.id="v70FocusTools";
    const bodies=new Map<ToolKey,HTMLElement>();
    const body=(key:ToolKey):HTMLElement=>{
      const found=bodies.get(key);if(found)return found;
      const tool=TOOLS.find(item=>item.key===key)!;
      const row=make("details","v70-tool");row.dataset.tool=key;
      const summary=document.createElement("summary");
      const icon=make("span","v70-ic",tool.icon);icon.setAttribute("aria-hidden","true");
      const copy=make("span","v70-tool-copy");copy.append(make("b","",tool.title),make("small","",tool.sub));
      const chevron=make("span","v70-chev","›");chevron.setAttribute("aria-hidden","true");
      summary.append(icon,copy,chevron);
      const inner=make("div","v70-tool-body");
      row.append(summary,inner);
      // İç katlanır bölüm (geçmiş, ayarlar) satır açılınca kendiliğinden açılır; tek dokunuş yeter.
      if(tool.fold)row.addEventListener("toggle",()=>{if(row.open)win.openFold?.(tool.fold!);});
      bodies.set(key,inner);return inner;
    };
    let current:ToolKey|null=null;
    for(const node of Array.from(details.children)){
      if(!(node instanceof HTMLElement)||node.tagName==="SUMMARY")continue;
      current=toolFor(node,current);body(current).append(node);
    }
    for(const tool of TOOLS){const inner=bodies.get(tool.key);if(inner)list.append(inner.parentElement!);}
    details.append(list);details.open=true;details.dataset.v70="list";
    // Sonradan bu kutuya eklenen bölümler kaybolmaz, "Diğer" satırına gider.
    new MutationObserver(records=>{
      for(const record of records)for(const node of Array.from(record.addedNodes)){
        if(node instanceof HTMLElement&&node!==list&&node.tagName!=="SUMMARY"){body("other").append(node);if(!list.contains(body("other")))list.append(body("other").parentElement!);}
      }
    }).observe(details,{childList:true});
    return true;
  }
  // 4: bildirimden kontrol düğmesi ve durumu Odak ayarlarına taşınır; ana ekranda hata görünmez.
  function notifications():boolean{
    const panel=document.getElementById("focusNotificationControls"),settings=document.getElementById("fb_odakayar");
    if(!panel||!settings)return false;
    if(panel.parentElement!==settings)settings.prepend(panel);
    panel.classList.add("v70-notify");
    return true;
  }
  // 8: çalışırken soru sayacı; oturum kapanırken "Çözülen soru" alanına yazılır.
  function questions():boolean{
    if(document.getElementById("v70Questions"))return true;
    const card=document.getElementById("focusCard"),controls=card?.querySelector<HTMLElement>(".fcctl");
    if(!card||!controls)return false;
    const box=make("div","v70-questions");box.id="v70Questions";
    const goal=make("small","v70-q-goal");
    const copy=make("div","v70-q-copy");copy.append(make("b","","Çözdüğün soru"),goal);
    const minus=make("button","v70-q-btn","−"),plus=make("button","v70-q-btn","＋"),out=make("output","v70-q-out","0");
    minus.type="button";plus.type="button";
    minus.setAttribute("aria-label","Bir soru azalt");plus.setAttribute("aria-label","Bir soru ekle");
    out.setAttribute("aria-live","polite");
    const buttons=make("div","v70-q-ctrls");buttons.append(minus,out,plus);
    box.append(copy,buttons);controls.insertAdjacentElement("afterend",box);
    let last=card.getAttribute("data-run")||"idle";
    let count=last==="idle"?0:readQuestions();
    const goalInput=document.getElementById("v29GoalQ") as HTMLInputElement|null;
    const paint=():void=>{
      out.textContent=String(count);
      const target=Math.max(0,Number(goalInput?.value)||0);
      goal.textContent=target?"Hedef "+target:"Hedef koymadın";
      writeQuestions(count);
    };
    minus.addEventListener("click",()=>{count=Math.max(0,count-1);paint();});
    plus.addEventListener("click",()=>{count=Math.min(999,count+1);paint();});
    new MutationObserver(()=>{
      const now=card.getAttribute("data-run")||"idle";
      if(last==="idle"&&now==="running")count=0;
      last=now;paint();
    }).observe(card,{attributes:true,attributeFilter:["data-run"]});
    const note=document.getElementById("noteBox"),actual=document.getElementById("v29ActualQ") as HTMLInputElement|null;
    if(note&&actual)new MutationObserver(()=>{
      if(note.style.display!=="none"&&count>0&&!actual.value){
        actual.value=String(count);actual.dispatchEvent(new Event("input",{bubbles:true}));
      }
    }).observe(note,{attributes:true,attributeFilter:["style"]});
    goalInput?.addEventListener("input",paint);
    paint();return true;
  }
  function today():void{
    const line=document.getElementById("v70FocusToday");
    const minutes=Number(document.getElementById("pomoTodayMin")?.textContent)||0;
    let sessions=0;
    try{const list=win.v29SessionList?.(1);sessions=Array.isArray(list)?list.length:0;}catch{}
    if(line)line.textContent=focusTodayText(minutes,sessions);
    const sub=document.querySelector<HTMLElement>('#v70FocusTools [data-tool="sessions"] .v70-tool-copy small');
    if(sub)sub.textContent=sessions?sessions+" oturum · gün sonu özeti":"Henüz oturum yok · gün sonu özeti";
  }

  const steps:[string,()=>boolean][]=[["head",head],["setup",setupFirst],["duration",duration],["tools",tools],["notifications",notifications],["questions",questions]];
  const run=():boolean=>{
    for(const [name,step] of steps)if(!done.has(name)&&step())done.add(name);
    today();
    return done.size===steps.length;
  };
  if(!run()){
    // Eski parçalar farklı anlarda kurulur; eksik adım gelene kadar #pomo izlenir (en çok 15 sn).
    const retry=new MutationObserver(()=>{if(run())retry.disconnect();});
    retry.observe(root,{childList:true,subtree:true});
    window.setTimeout(()=>retry.disconnect(),15000);
  }
  const todayMin=document.getElementById("pomoTodayMin");
  if(todayMin)new MutationObserver(today).observe(todayMin,{childList:true,characterData:true,subtree:true});
  window.addEventListener("yks:data-changed",today);
  root.dataset.v70="ready";
  return true;
}
