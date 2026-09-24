import "./notes-v5.css";

type NoteState=Record<string,unknown>;
type NoteWindow=Window&{
  YKSLegacyState?:{readState?:()=>NoteState|null|undefined};
};

function byId<T extends HTMLElement=HTMLElement>(id:string):T|null{
  const node=document.getElementById(id);
  return node instanceof HTMLElement?node as T:null;
}

function readState():NoteState{
  try{return (window as NoteWindow).YKSLegacyState?.readState?.()??{};}catch{return {};}
}

function todayKey():string{
  const now=new Date();
  const y=now.getFullYear(),m=String(now.getMonth()+1).padStart(2,"0"),d=String(now.getDate()).padStart(2,"0");
  return y+"-"+m+"-"+d;
}

function noteText(value:unknown):string{
  if(typeof value==="string")return value.trim();
  if(!value||typeof value!=="object")return "";
  const row=value as Record<string,unknown>;
  for(const key of ["note","text","value","body"]){
    const v=row[key];
    if(typeof v==="string"&&v.trim())return v.trim();
  }
  return "";
}

function dateLabel(key:string):string{
  const match=key.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if(!match)return key;
  const date=new Date(Number(match[1]),Number(match[2])-1,Number(match[3]));
  if(Number.isNaN(date.getTime()))return key;
  return new Intl.DateTimeFormat("tr-TR",{day:"numeric",month:"short",weekday:"short"}).format(date);
}

function journalEntries():Array<{key:string;text:string}>{
  const raw=readState().journal;
  if(!raw||typeof raw!=="object"||Array.isArray(raw))return [];
  return Object.entries(raw as Record<string,unknown>)
    .map(([key,value])=>({key,text:noteText(value)}))
    .filter(item=>item.text)
    .sort((a,b)=>b.key.localeCompare(a.key,"tr"))
    .slice(0,7);
}

function syncPreview(card:HTMLElement):void{
  const input=byId<HTMLTextAreaElement>("journalInput");
  const stateToday=journalEntries().find(item=>item.key===todayKey())?.text||"";
  const value=input?.value.trim()||stateToday;
  const copy=card.querySelector<HTMLElement>("[data-v5-note-preview]");
  const status=card.querySelector<HTMLElement>("[data-v5-note-status]");
  if(copy)copy.textContent=value||"Bugünden aklında kalan tek cümleyi yaz.";
  if(status)status.textContent=value?"Bugünün notu hazır":"Henüz not yazmadın";
}

function renderHistory(root:HTMLElement):void{
  const list=root.querySelector<HTMLElement>("[data-v5-note-history-list]");
  if(!list)return;
  const entries=journalEntries().filter(item=>item.key!==todayKey()).slice(0,5);
  list.innerHTML="";
  if(!entries.length){
    const empty=document.createElement("p");
    empty.className="v5-notes-empty";
    empty.textContent="Eski notların burada görünecek.";
    list.appendChild(empty);
    return;
  }
  for(const item of entries){
    const article=document.createElement("article");
    article.className="v5-note-history-item";
    const date=document.createElement("span");
    date.textContent=dateLabel(item.key);
    const text=document.createElement("p");
    text.textContent=item.text;
    article.append(date,text);
    list.appendChild(article);
  }
}

function createOverlay(home:HTMLElement,body:HTMLElement):HTMLElement{
  const existing=document.querySelector<HTMLElement>("[data-v5-notes-overlay]");
  if(existing)return existing;

  const overlay=document.createElement("div");
  overlay.className="v5-notes-overlay";
  overlay.dataset.v5NotesOverlay="true";
  overlay.hidden=true;

  const backdrop=document.createElement("button");
  backdrop.type="button";
  backdrop.className="v5-notes-backdrop";
  backdrop.setAttribute("aria-label","Notları kapat");

  const sheet=document.createElement("section");
  sheet.className="v5-notes-sheet";
  sheet.setAttribute("role","dialog");
  sheet.setAttribute("aria-modal","true");
  sheet.setAttribute("aria-label","Günün notu");

  const header=document.createElement("header");
  header.innerHTML=
    '<div><span>GÜNÜN NOTU</span><h2>Bugünü tek cümleyle kapat</h2><p>Kısa yaz. Yarın geri baktığında neyin önemli olduğunu hatırla.</p></div>'+
    '<button type="button" data-v5-notes-close aria-label="Kapat">×</button>';

  const editor=document.createElement("div");
  editor.className="v5-notes-editor";
  body.classList.add("v5-notes-legacy-body");
  body.hidden=false;
  body.style.display="block";
  editor.appendChild(body);

  const history=document.createElement("section");
  history.className="v5-notes-history";
  history.innerHTML=
    '<div class="v5-notes-history-head"><div><span>GEÇMİŞ</span><b>Son notların</b></div><small>Son 5 kayıt</small></div>'+
    '<div data-v5-note-history-list></div>';

  sheet.append(header,editor,history);
  overlay.append(backdrop,sheet);
  document.body.appendChild(overlay);

  const close=()=>{
    overlay.hidden=true;
    document.documentElement.classList.remove("v5-notes-open");
    renderHistory(overlay);
    const card=home.querySelector<HTMLElement>("[data-v5-notes-card]");
    if(card)syncPreview(card);
  };
  backdrop.addEventListener("click",close);
  header.querySelector("[data-v5-notes-close]")?.addEventListener("click",close);
  overlay.addEventListener("keydown",event=>{if(event.key==="Escape")close();});
  return overlay;
}

function createCard(home:HTMLElement,overlay:HTMLElement):HTMLElement|null{
  const existing=home.querySelector<HTMLElement>("[data-v5-notes-card]");
  if(existing)return existing;
  const primary=home.querySelector<HTMLElement>(".v5-home-primary");
  if(!primary)return null;

  const card=document.createElement("section");
  card.className="v5-notes-card";
  card.dataset.v5NotesCard="true";
  card.innerHTML=
    '<div class="v5-notes-icon">✎</div>'+
    '<div class="v5-notes-copy"><span data-v5-note-status>Henüz not yazmadın</span><b>Günün Notu</b><p data-v5-note-preview>Bugünden aklında kalan tek cümleyi yaz.</p></div>'+
    '<button type="button" data-v5-notes-open>Yaz</button>';

  const open=()=>{
    overlay.hidden=false;
    document.documentElement.classList.add("v5-notes-open");
    renderHistory(overlay);
    const input=byId<HTMLTextAreaElement>("journalInput");
    window.setTimeout(()=>input?.focus(),80);
  };
  card.querySelector("[data-v5-notes-open]")?.addEventListener("click",open);
  window.addEventListener("yks:open-notes",open);

  const quick=primary.querySelector<HTMLElement>("[data-v5-quick-actions]");
  if(quick)quick.insertAdjacentElement("beforebegin",card);
  else primary.appendChild(card);

  const input=byId<HTMLTextAreaElement>("journalInput");
  input?.addEventListener("input",()=>syncPreview(card));
  syncPreview(card);
  return card;
}

export function installNotesV5():{installed:boolean;validate:()=>string[]}{
  const home=byId("home");
  const head=byId("fh_gunluk");
  const body=byId("fb_gunluk");
  const input=byId<HTMLTextAreaElement>("journalInput");
  if(!home||!head||!body||!input)return {installed:false,validate:()=>["daily note legacy controls missing"]};

  home.dataset.v5Notes="ready";
  head.hidden=true;
  head.setAttribute("aria-hidden","true");

  const overlay=createOverlay(home,body);
  createCard(home,overlay);
  renderHistory(overlay);

  return {
    installed:true,
    validate:()=>{
      const errors:string[]=[];
      if(home.dataset.v5Notes!=="ready")errors.push("notes marker missing");
      if(!home.querySelector("[data-v5-notes-card]"))errors.push("notes card missing");
      if(!document.querySelector("[data-v5-notes-overlay]"))errors.push("notes overlay missing");
      if(!document.getElementById("journalInput"))errors.push("legacy journal input missing");
      if(!document.querySelector('[onclick="saveJournal()"]'))errors.push("legacy saveJournal action missing");
      if(!document.querySelector('[onclick="shareCard()"]'))errors.push("legacy shareCard action missing");
      return errors;
    }
  };
}
