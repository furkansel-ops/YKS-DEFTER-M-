import{collection,doc,getDoc,getDocs,onSnapshot,query,serverTimestamp,where,writeBatch}from"https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";

// YKS Defterim · Koçunla görüşme (v69). Koçun uygun saatleri coachAvailability/{koçUid};
// her randevu coachAppointments/{koçUid_YYYYMMDD_SSDD} ve aynı kimlikte bir saat kilidi
// coachSlots'ta tutulur. Kilit ve randevu birlikte yazılıp silinir; kural aynı saate ikinci
// kaydı reddeder, böylece iki öğrenci aynı saati alamaz.
const VERSION="1.3.0";
const state={user:null,db:null,coachUid:"",coachName:"Koçun",availability:null,busy:new Set(),appts:[],day:"",pick:"",topic:"",view:"auto",week:0,returnFocus:null,stops:[],observer:null,timer:0,sending:false,error:""};
const text=(value,max=160)=>String(value??"").trim().slice(0,max);
const esc=value=>String(value??"").replace(/[&<>"']/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[char]));
const toast=message=>{try{window.toast?.(message)}catch{console.info(message)}};
const pad=n=>String(n).padStart(2,"0");
const iso=date=>date.getFullYear()+"-"+pad(date.getMonth()+1)+"-"+pad(date.getDate());
const apptId=(coachUid,date,time)=>coachUid+"_"+date.replace(/-/g,"")+"_"+time.replace(":","");
const minutes=time=>{const [h,m]=String(time||"0:0").split(":").map(Number);return h*60+m};
const clock=total=>pad(Math.floor(total/60))+":"+pad(total%60);
const startOf=(date,time)=>new Date(date+"T"+time+":00");
const isPast=(date,time)=>startOf(date,time).getTime()<Date.now();
function dateLabel(date,opts={weekday:"long",day:"numeric",month:"long"}){try{return new Intl.DateTimeFormat("tr-TR",opts).format(new Date(date+"T12:00:00"))}catch{return date}}
function relativeDay(date){const today=iso(new Date()),tomorrow=iso(new Date(Date.now()+864e5));return date===today?"Bugün":date===tomorrow?"Yarın":dateLabel(date,{weekday:"long",day:"numeric",month:"long"})}
function slotsFor(date){
  const day=state.availability?.days?.[String(new Date(date+"T12:00:00").getDay())],duration=Number(state.availability?.duration)||30,out=[];
  if(!day?.on||!day.start||!day.end)return out;
  for(let total=minutes(day.start);total+duration<=minutes(day.end);total+=duration)out.push(clock(total));
  return out;
}
const mine=(date,time)=>state.appts.find(item=>item.date===date&&item.time===time);
const freeSlots=date=>slotsFor(date).filter(time=>!isPast(date,time)&&!state.busy.has(date+" "+time));
function upcoming(){
  return state.appts.filter(item=>item.coachUid===state.coachUid&&startOf(item.date,item.time).getTime()+(Number(item.duration)||30)*60000>Date.now())
    .sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time));
}

function styles(){
  if(document.getElementById("studentAppointmentsStyles"))return;
  const style=document.createElement("style");style.id="studentAppointmentsStyles";style.textContent=`
  .sap,.sap-next{box-sizing:border-box}
  .sap{margin-top:14px;padding:16px;border:1px solid var(--d-line,#e3e9f2);border-radius:16px;background:var(--d-surface,#fff);color:var(--d-ink,#121a2b)}
  .sap h4{margin:0 0 4px;font-size:16px}.sap-muted{margin:0;color:var(--d-muted,#5f6b80);font-size:12.5px;line-height:1.5}
  .sap-slot{min-height:44px;border:1px solid var(--d-line,#e3e9f2);border-radius:11px;background:var(--d-surface,#fff);color:var(--d-ink,#121a2b);font:inherit;font-size:13.5px;font-weight:800;cursor:pointer}
  .sap-slot:disabled{background:var(--d-soft,#eef3fb);border-color:transparent;color:var(--d-muted,#5f6b80);text-decoration:line-through;cursor:default}
  .sap-slot.mine{background:var(--d-chip,#e9f0fe);color:var(--d-chip-ink,#2453b8);text-decoration:none}
  .sap-slot.pick{background:var(--d-accent,#2f6bea);border-color:var(--d-accent,#2f6bea);color:var(--d-on-accent,#fff)}
  .sap-btn{min-height:44px;padding:0 14px;border:1px solid var(--d-line,#e3e9f2);border-radius:11px;background:var(--d-surface,#fff);color:var(--d-ink,#121a2b);font:inherit;font-size:13.5px;font-weight:800;cursor:pointer}
  .sap-btn.primary{background:var(--d-accent,#2f6bea);border-color:var(--d-accent,#2f6bea);color:var(--d-on-accent,#fff)}
  .sap-btn.danger{color:#c4323b}.sap-btn:disabled{opacity:.6;cursor:wait}
  .sap-list{display:grid;gap:8px;margin-top:8px}
  .sap-item{display:grid;gap:6px;padding:12px;border:1px solid var(--d-line,#e3e9f2);border-radius:12px;background:var(--d-soft,#eef3fb)}
  .sap-item-top{display:flex;justify-content:space-between;align-items:flex-start;gap:10px}
  .sap-item b{font-size:14px}.sap-item small{display:block;color:var(--d-muted,#5f6b80);font-size:12.5px}
  .sap-pill{font-size:11.5px;font-weight:800;padding:3px 9px;border-radius:999px;white-space:nowrap}
  .sap-pill.ok{background:color-mix(in srgb,var(--d-ok,#13906b) 15%,var(--d-surface,#fff));color:var(--d-ok,#13906b)}
  .sap-pill.wait{background:color-mix(in srgb,#d9800f 16%,var(--d-surface,#fff));color:#9a5806}
  .sap-item-actions{display:flex;gap:6px;flex-wrap:wrap}
  .sap-sub{margin:16px 0 0;font-size:14px}
  .sap-next{display:grid;gap:8px;width:100%;margin:12px 0;padding:16px 18px;border:0;border-radius:var(--d-r,18px);background:var(--d-hero,linear-gradient(140deg,#2f6bea,#1d4cc4));color:var(--d-hero-ink,#fff);text-align:left;font:inherit;cursor:pointer}
  .sap-next small{font-size:11px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;opacity:.88}
  .sap-next b{font-size:17px;line-height:1.3}.sap-next span{font-size:13px;opacity:.9}
  .sap-next .sap-join{justify-self:start;min-height:42px;padding:0 14px;border-radius:11px;background:var(--d-hero-btn,#fff);color:var(--d-hero-btn-ink,#1d4cc4);font-weight:800;font-size:13.5px;display:inline-flex;align-items:center;text-decoration:none;opacity:1}
  .sap-entry{display:flex;align-items:center;gap:12px;width:100%;margin:12px 0;padding:14px 16px;border:1px dashed color-mix(in srgb,var(--d-accent,#2f6bea) 50%,var(--d-line,#e3e9f2));border-radius:var(--d-r,18px);background:color-mix(in srgb,var(--d-accent,#2f6bea) 6%,var(--d-surface,#fff));color:var(--d-ink,#121a2b);font:inherit;text-align:left;cursor:pointer;box-sizing:border-box}
  .sap-entry i{width:40px;height:40px;flex:none;display:grid;place-items:center;border-radius:12px;background:var(--d-chip,#e9f0fe);color:var(--d-chip-ink,#2453b8);font-style:normal;font-size:18px}
  .sap-entry span{min-width:0}.sap-entry b{display:block;font-size:14.5px}.sap-entry small{display:block;color:var(--d-muted,#5f6b80);font-size:12.5px}
  .sap-entry em{margin-left:auto;font-style:normal;font-weight:800;font-size:13px;color:var(--d-accent,#2f6bea);white-space:nowrap}
  .sap-sheet{position:fixed;inset:0;z-index:9000;display:flex;align-items:flex-end;justify-content:center;background:rgba(8,14,28,.45)}
  .sap-sheet[hidden]{display:none}
  .sap-sheet-panel{width:min(560px,100%);max-height:88vh;overflow:auto;margin:0;border-radius:20px 20px 0 0;padding:10px 16px calc(18px + env(safe-area-inset-bottom));box-sizing:border-box}
  .sap-sheet-bar{position:sticky;top:-10px;display:flex;justify-content:center;align-items:center;min-height:36px;margin:-10px -16px 4px;padding:6px 16px;background:var(--d-surface,#fff);z-index:1}
  .sap-grab{width:44px;height:5px;border-radius:9px;background:var(--d-line,#e3e9f2)}
  .sap-close{position:absolute;right:10px;top:4px;width:40px;height:40px;border:0;border-radius:12px;background:var(--d-soft,#eef3fb);color:var(--d-ink,#121a2b);font:inherit;font-size:16px;cursor:pointer}
  html.sap-sheet-open{overflow:hidden}
  @media(min-width:760px){.sap-sheet{align-items:center}.sap-sheet-panel{border-radius:20px}.sap-grab{display:none}}
  .sap-wide{display:flex;width:100%;margin-top:12px;align-items:center;justify-content:center}
  .sap-week-head{display:flex;justify-content:space-between;align-items:flex-start;gap:10px}
  .sap-weekbtn,.sap-linkbtn{min-height:44px;padding:0 4px;border:0;background:none;color:var(--d-accent,#2f6bea);font:inherit;font-size:13.5px;font-weight:800;cursor:pointer;white-space:nowrap}
  .sap-linkbtn{display:block;margin-top:10px}.sap-linkbtn.sap-top{margin:0 0 2px}
  .sap-week{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:5px;margin-top:12px}
  .sap-wday{display:grid;justify-items:center;align-content:center;gap:1px;min-height:64px;padding:6px 0;border:1px solid var(--d-line,#e3e9f2);border-radius:12px;background:var(--d-surface,#fff);color:var(--d-ink,#121a2b);font:inherit;cursor:pointer;min-width:0}
  .sap-wday b{font-size:17px;line-height:1.2}.sap-wday small{font-size:11px;font-weight:700;color:var(--d-muted,#5f6b80);white-space:nowrap}
  .sap-wday.on{background:var(--d-accent,#2f6bea);border-color:var(--d-accent,#2f6bea);color:var(--d-on-accent,#fff)}.sap-wday.on small{color:inherit;opacity:.9}
  .sap-wday:disabled{background:var(--d-soft,#eef3fb);border-color:transparent;opacity:.6;cursor:default}
  .sap-label{margin:14px 0 0;font-size:13.5px;font-weight:800}
  .sap-ticket{display:grid;gap:4px;margin-top:10px;padding:14px;border:1px solid var(--d-line,#e3e9f2);border-radius:16px;background:var(--d-soft,#eef3fb)}
  .sap-ticket .sap-pill{justify-self:start}.sap-ticket .sap-summary{background:var(--d-surface,#fff)}
  .sap-when{margin:6px 0 0;font-size:14px;font-weight:700;color:var(--d-muted,#5f6b80)}
  .sap-big{margin:0;font-size:30px;font-weight:850;letter-spacing:-.02em;line-height:1.15}.sap-big small{font-size:15px;font-weight:700;color:var(--d-muted,#5f6b80);letter-spacing:0}
  .sap-gap{margin-top:10px}.sap-center{margin-top:8px;text-align:center}
  a.sap-btn{display:inline-flex;align-items:center;justify-content:center;text-decoration:none;box-sizing:border-box}
  .sap-times{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin-top:12px}
  .sap-times .sap-slot{min-height:48px}
  .sap-summary{display:flex;gap:12px;align-items:center;margin-top:10px;padding:12px 14px;border:1px solid var(--d-line,#e3e9f2);border-radius:14px;background:var(--d-surface,#fff)}
  .sap-summary b{display:block;font-size:14.5px}.sap-summary small{display:block;color:var(--d-muted,#5f6b80);font-size:12.5px}
  .sap-avatar{width:42px;height:42px;flex:none;display:grid;place-items:center;border-radius:50%;background:var(--d-chip,#e9f0fe);color:var(--d-chip-ink,#2453b8);font-weight:850;font-size:13px}
  .sap-topic{display:grid;gap:6px;margin-top:12px;font-size:13px;font-weight:700;color:var(--d-muted,#5f6b80)}
  .sap-topic textarea{min-height:76px;padding:10px 12px;border:1px solid var(--d-line,#e3e9f2);border-radius:12px;background:var(--d-surface,#fff);color:var(--d-ink,#121a2b);font:inherit;font-size:14px;resize:vertical;box-sizing:border-box}
  .sap-btn:disabled{opacity:.5;cursor:not-allowed}
  :root[data-theme="night"] .sap-btn.danger{color:#ff8f8f}:root[data-theme="night"] .sap-pill.wait{background:color-mix(in srgb,#f3b860 16%,var(--d-surface,#121a2c));color:#f3b860}
  .sap :focus-visible,.sap-next:focus-visible,.sap-next .sap-join:focus-visible,.sap-entry:focus-visible,.sap-close:focus-visible{outline:2px solid var(--d-accent,#2f6bea);outline-offset:2px}`;
  document.head.append(style);
}

function section(){
  const card=document.getElementById("studentCoachCodeSettings");if(!card)return null;
  let box=document.getElementById("studentAppointments");
  if(!box){box=document.createElement("section");box.id="studentAppointments";box.className="sap";box.setAttribute("aria-label","Koçunla görüşme")}
  const chat=card.querySelector("[data-coach-chat]");
  if(box.parentElement!==card)chat?card.insertBefore(box,chat):card.append(box);
  return box;
}
// Koçla görüşme · tek ekran: yaklaşan randevu varsa onun bilgisi, yoksa doğrudan bu haftanın günleri ve saatleri.
function dayTitle(date){
  const today=iso(new Date()),tomorrow=iso(new Date(Date.now()+864e5)),long=dateLabel(date,{weekday:"long",day:"numeric",month:"long"});
  return date===today?"Bugün · "+long:date===tomorrow?"Yarın · "+long:long;
}
function initials(name){return text(name,60).split(/\s+/).filter(Boolean).slice(0,2).map(part=>part[0]).join("").toLocaleUpperCase("tr-TR")||"K"}
// Bu hafta: bugünden itibaren 7 gün; gelecek hafta: sonraki 7 gün (öğrenci en fazla 14 gün ileriyi görür).
const weekDays=()=>[...Array(7)].map((_,i)=>iso(new Date(Date.now()+(state.week*7+i)*864e5)));
function openCoachSettings(){
  if(typeof window.v30Action==="function")window.v30Action("settings");else window.v30OpenMore?.("ayar","studentCoachCodeSettings");
  window.dispatchEvent(new CustomEvent("yks:open-settings",{detail:{category:"coach"}}));
}
function mainHtml(){
  if(!state.coachUid)return'<h4>Koçla görüşme</h4><p class="sap-muted">Randevu almak için önce koçunu bağlamalısın. Koçunun verdiği kodu Ayarlar › Koç bağlantısı\'na girersin.</p><button type="button" class="sap-btn primary sap-wide" data-sap-settings>Koç bağlantısına git</button>';
  if(state.error)return'<h4>Koçla görüşme</h4><p class="sap-muted">'+esc(state.error)+'</p>';
  const list=upcoming();
  if(list.length&&state.view!=="book")return infoHtml(list);
  if(!state.availability)return'<h4>'+esc(state.coachName)+' ile görüşme</h4><p class="sap-muted">Koçun henüz görüşme saatlerini açmadı. Açtığında buradan randevu alabilirsin.</p>';
  return bookHtml(list);
}
function infoHtml(list){
  const next=list[0],confirmed=next.status==="confirmed",duration=Number(next.duration)||30;
  let html='<h4>Sıradaki görüşmen</h4><div class="sap-ticket"><span class="sap-pill '+(confirmed?"ok":"wait")+'">'+(confirmed?"Kesin":"Koçunun onayı bekleniyor")+'</span>'
    +'<p class="sap-when">'+esc(dayTitle(next.date))+'</p><p class="sap-big">'+esc(next.time)+'<small> · '+duration+' dk</small></p>'
    +'<div class="sap-summary"><span class="sap-avatar" aria-hidden="true">'+esc(initials(state.coachName))+'</span><div><b>'+esc(state.coachName)+'</b><small>'+esc(next.topic||"Konu yazılmadı")+'</small></div></div>'
    +(next.note?'<p class="sap-muted sap-gap">Koçunun notu: '+esc(next.note)+'</p>':'')
    +(confirmed&&next.link?'<a class="sap-btn primary sap-wide" href="'+esc(next.link)+'" target="_blank" rel="noopener noreferrer">Görüşmeye katıl</a>'
      :'<p class="sap-muted sap-gap">'+(confirmed?'Koçun görüşme linkini eklediğinde burada "Görüşmeye katıl" düğmesi çıkar.':'Koçun onaylayınca burada "Kesin" yazar.')+'</p>')
    +'<button type="button" class="sap-btn danger sap-wide" data-sap-cancel="'+esc(next.id)+'">Randevuyu iptal et</button></div>';
  if(list.length>1)html+='<h5 class="sap-sub">Diğer randevuların</h5>'+listHtml(list.slice(1));
  if(state.availability)html+='<button type="button" class="sap-linkbtn" data-sap-book>+ Başka randevu al</button>';
  return html;
}
function bookHtml(list){
  const days=weekDays(),duration=Number(state.availability?.duration)||30;
  // Seçili gün bu haftada değilse ya da dolduysa haftanın ilk boş gününe geçilir.
  if(!days.includes(state.day)||!freeSlots(state.day).length){const first=days.find(date=>freeSlots(date).length)||"";if(state.day!==first){state.day=first;state.pick=""}}
  let html=(state.view==="book"&&list.length?'<button type="button" class="sap-linkbtn sap-top" data-sap-home>‹ Randevuma dön</button>':'')
    +'<div class="sap-week-head"><div><h4>'+(state.week?"Gelecek hafta":"Bu hafta")+' randevu al</h4><p class="sap-muted">'+esc(state.coachName)+' · '+duration+' dakikalık görüşme</p></div>'
    +'<button type="button" class="sap-weekbtn" data-sap-week="'+(state.week?0:1)+'">'+(state.week?"‹ Bu hafta":"Gelecek hafta ›")+'</button></div>';
  html+='<div class="sap-week" role="group" aria-label="Günler">'+days.map(date=>{
    const free=freeSlots(date).length,closed=!slotsFor(date).length;
    const top=date===iso(new Date())?"Bugün":date===iso(new Date(Date.now()+864e5))?"Yarın":dateLabel(date,{weekday:"short"});
    const foot=closed?"kapalı":free?free+" boş":"dolu";
    return'<button type="button" class="sap-wday'+(date===state.day?" on":"")+'" data-sap-day="'+date+'"'+(free?"":" disabled")+' aria-pressed="'+(date===state.day)+'" aria-label="'+esc(dateLabel(date))+', '+foot+'"><small>'+esc(top)+'</small><b>'+Number(date.slice(8))+'</b><small>'+foot+'</small></button>';
  }).join("")+'</div>';
  if(!state.day)return html+'<p class="sap-muted sap-gap">'+(state.week?"Gelecek hafta da boş saat yok. Koçuna mesaj atabilirsin.":"Bu hafta boş saat kalmadı. Gelecek haftaya bak.")+'</p>';
  return html+'<p class="sap-label">'+esc(dateLabel(state.day))+'</p>'+timesHtml()
    +'<label class="sap-topic"><span>Ne konuşmak istersin? (isteğe bağlı)</span><textarea maxlength="120" rows="2" data-sap-topic placeholder="Örn. Deneme sonrası konuşalım">'+esc(state.topic)+'</textarea></label>'
    +'<button type="button" class="sap-btn primary sap-wide" data-sap-request'+(state.pick?"":" disabled")+'>'+(state.pick?esc(state.pick)+" için randevu iste":"Önce saat seç")+'</button>'
    +'<p class="sap-muted sap-center">'+esc(state.coachName)+' onaylayınca Bugün ekranında görünür.</p>';
}
function timesHtml(){
  const date=state.day,times=[...new Set([...slotsFor(date),...state.appts.filter(item=>item.date===date).map(item=>item.time)])].sort();
  return'<div class="sap-times" role="group" aria-label="Saatler">'+times.map(time=>{
    if(mine(date,time))return'<button type="button" class="sap-slot mine" disabled aria-label="'+time+', senin randevun">'+time+'</button>';
    const taken=state.busy.has(date+" "+time),past=isPast(date,time);
    return'<button type="button" class="sap-slot'+(state.pick===time?" pick":"")+'" data-sap-slot="'+time+'"'+(taken||past?" disabled":"")+' aria-pressed="'+(state.pick===time)+'" aria-label="'+time+(taken?", dolu":past?", geçti":", boş")+'">'+time+'</button>';
  }).join("")+'</div>';
}
function listHtml(list){
  return'<div class="sap-list">'+list.map(item=>{
    const confirmed=item.status==="confirmed";
    return'<div class="sap-item"><div class="sap-item-top"><div><b>'+esc(relativeDay(item.date))+' · '+esc(item.time)+'</b><small>'+esc(item.topic||"Konu yazılmadı")+' · '+esc(String(item.duration||30))+' dk</small>'+(item.note?'<small>'+esc(item.note)+'</small>':'')+'</div><span class="sap-pill '+(confirmed?"ok":"wait")+'">'+(confirmed?"Kesin":"Onay bekliyor")+'</span></div>'
      +'<div class="sap-item-actions">'+(confirmed&&item.link?'<a class="sap-btn primary" href="'+esc(item.link)+'" target="_blank" rel="noopener noreferrer">Görüşmeye katıl</a>':'')+'<button type="button" class="sap-btn danger" data-sap-cancel="'+esc(item.id)+'">İptal et</button></div></div>';
  }).join("")+'</div>';
}
// Ayarlar › Koç bağlantısı içinde kısa özet; ekranın kendisi alttan açılır.
function settingsHtml(){
  const next=state.coachUid?upcoming()[0]:null;
  const line=next?"Sıradaki: "+relativeDay(next.date)+" "+next.time+" · "+(next.status==="confirmed"?"kesin":"onay bekliyor")
    :!state.coachUid?"Koçunu bağlayınca buradan randevu alırsın.":state.availability?"Koçunun boş saatlerinden randevu al.":"Koçun görüşme saatlerini açınca buradan randevu alırsın.";
  return'<h4>Koçla görüşme</h4><p class="sap-muted">'+esc(line)+'</p>'+(state.coachUid?'<button type="button" class="sap-btn primary sap-wide" data-sap-open>'+(next?"Randevumu gör":"Koçla görüşme")+'</button>':'');
}
// Ekran yeniden çizilince odak aynı öğede (yazı alanında imleç yerinde) kalır.
function focusKey(el){
  if(!el?.closest?.("[data-sap-body]"))return"";
  for(const attr of ["data-sap-topic","data-sap-request","data-sap-week","data-sap-book","data-sap-home"])if(el.hasAttribute(attr))return"["+attr+"]";
  if(el.dataset.sapDay)return'[data-sap-day="'+el.dataset.sapDay+'"]';
  if(el.dataset.sapSlot)return'[data-sap-slot="'+el.dataset.sapSlot+'"]';
  return"";
}
function render(){
  const box=section();
  if(box){box.hidden=!state.user;if(state.user){box.innerHTML=settingsHtml();bind(box)}}
  const sheet=document.getElementById("studentAppointmentsSheet"),body=sheet?.querySelector("[data-sap-body]");
  if(sheet&&!sheet.hidden&&body){
    const active=document.activeElement,key=focusKey(active),caret=active?.selectionStart;
    body.innerHTML=mainHtml();bind(body);
    if(key){const again=body.querySelector(key);if(again){again.focus?.();if(typeof caret==="number")again.setSelectionRange?.(caret,caret)}else body.querySelector("button:not(:disabled),a[href]")?.focus?.()}
  }
  renderMoreEntry();
}
function bind(box){
  const on=(selector,handler)=>box.querySelectorAll(selector).forEach(el=>el.onclick=()=>handler(el));
  on("[data-sap-open]",()=>openSheet());
  on("[data-sap-settings]",()=>{closeSheet();openCoachSettings()});
  on("[data-sap-book]",()=>{state.view="book";render()});
  on("[data-sap-home]",()=>{state.view="auto";state.pick="";render()});
  on("[data-sap-week]",el=>{state.week=Number(el.dataset.sapWeek)||0;state.pick="";render()});
  on("[data-sap-day]",el=>{if(state.day!==el.dataset.sapDay)state.pick="";state.day=el.dataset.sapDay;render()});
  on("[data-sap-slot]",el=>{state.pick=state.pick===el.dataset.sapSlot?"":el.dataset.sapSlot;render()});
  const topic=box.querySelector("[data-sap-topic]");if(topic)topic.oninput=()=>{state.topic=text(topic.value,120)};
  on("[data-sap-request]",el=>void requestAppointment(state.topic,el));
  on("[data-sap-cancel]",el=>void cancelAppointment(el.dataset.sapCancel,el));
}

async function requestAppointment(topic,button){
  if(state.sending||!state.user||!state.db||!state.coachUid||!state.pick)return;
  const date=state.day,time=state.pick;
  if(isPast(date,time)||state.busy.has(date+" "+time)){toast("Bu saat artık uygun değil, başka bir saat seç.");state.pick="";render();return}
  state.sending=true;if(button)button.disabled=true;
  const id=apptId(state.coachUid,date,time),batch=writeBatch(state.db),now=serverTimestamp();
  batch.set(doc(state.db,"coachSlots",id),{coachUid:state.coachUid,date,time});
  batch.set(doc(state.db,"coachAppointments",id),{coachUid:state.coachUid,studentUid:state.user.uid,date,time,duration:Number(state.availability?.duration)||30,status:"requested",createdBy:"student",topic,link:"",note:"",createdAt:now,updatedAt:now});
  try{await batch.commit();state.pick="";state.topic="";state.view="auto";toast("Randevu isteğin koçuna gitti ✓")}
  catch(error){console.error("Randevu isteği",error);const taken=String(error?.code||"").includes("permission-denied");if(taken)state.pick="";toast(taken?"Bu saat az önce doldu, başka bir saat seç.":"Randevu isteği gönderilemedi.")}
  finally{state.sending=false;if(button)button.disabled=false;render()}
}
async function cancelAppointment(id,button){
  const item=state.appts.find(entry=>entry.id===id);if(!item||!state.db)return;
  if(!confirm(relativeDay(item.date)+" "+item.time+" randevunu iptal etmek istiyor musun?"))return;
  if(button)button.disabled=true;
  const batch=writeBatch(state.db);batch.delete(doc(state.db,"coachAppointments",id));batch.delete(doc(state.db,"coachSlots",id));
  try{await batch.commit();toast("Randevu iptal edildi")}catch(error){console.error("Randevu iptali",error);toast("Randevu iptal edilemedi.");if(button)button.disabled=false}
}

// Bugün ekranı: yaklaşan randevu varsa "Sıradaki görüşme", yoksa (koç saat açtıysa) "Koçunla görüşme ayarla".
function nearestFree(){
  for(let i=0;i<14;i++){const date=iso(new Date(Date.now()+i*864e5)),count=freeSlots(date).length;if(count)return{date,count}}
  return null;
}
function renderToday(){
  const home=document.getElementById("home");if(!home)return;
  const next=state.user?upcoming()[0]:null;
  const anchor=home.querySelector(".rb-home-coach")||home.querySelector(".rb-today-tasks");
  const place=card=>{if(anchor&&card.nextElementSibling!==anchor)anchor.parentElement.insertBefore(card,anchor);else if(!anchor&&card.parentElement!==home)home.append(card)};
  let card=document.getElementById("studentNextAppointment"),entry=document.getElementById("studentApptEntry");
  if(next){
    entry?.remove();
    if(!card){
      card=document.createElement("div");card.id="studentNextAppointment";card.className="sap-next";card.setAttribute("role","button");card.tabIndex=0;
      card.addEventListener("click",event=>{if(event.target.closest?.(".sap-join"))return;openSheet()});
      card.addEventListener("keydown",event=>{if((event.key==="Enter"||event.key===" ")&&!event.target.closest?.(".sap-join")){event.preventDefault();openSheet()}});
    }
    place(card);
    const confirmed=next.status==="confirmed";
    card.innerHTML='<small>Sıradaki görüşme · '+(confirmed?"kesin":"koçun onayı bekleniyor")+'</small><b>'+esc(relativeDay(next.date))+' '+esc(next.time)+' · '+esc(state.coachName)+' ile '+esc(next.topic||"görüşme")+'</b>'
      +(confirmed&&next.link?'<a class="sap-join" href="'+esc(next.link)+'" target="_blank" rel="noopener noreferrer">Görüşmeye katıl</a>':'<span>'+(confirmed?"Link eklenince buradan katılabilirsin.":"Onaylanınca burada görünür.")+'</span>');
    return;
  }
  card?.remove();
  if(!state.user||!state.coachUid||!state.availability){entry?.remove();return}
  if(!entry){
    entry=document.createElement("button");entry.type="button";entry.id="studentApptEntry";entry.className="sap-entry";
    entry.addEventListener("click",()=>openSheet());
  }
  place(entry);
  const free=nearestFree();
  const hint=free?(free.date===iso(new Date())?"Bugün ":free.date===iso(new Date(Date.now()+864e5))?"Yarın ":dateLabel(free.date,{day:"numeric",month:"long"})+" günü ")+free.count+" boş saat var":"Önümüzdeki iki haftada boş saat yok";
  entry.innerHTML='<i aria-hidden="true">◷</i><span><b>Koçunla görüşme ayarla</b><small>'+esc(hint)+'</small></span><em>Randevu al ›</em>';
}
// Merkez: her öğrenciye "Koçla görüşme" aracı (koçu yoksa ekran koç bağlantısına yönlendirir) (Merkez her açılışta yeniden çizildiğinde tekrar eklenir).
function renderMoreEntry(){
  const grid=document.querySelector("#v43MoreTools .v43-more-tool-grid");
  let button=document.getElementById("studentApptMore");
  if(!grid||!state.user){button?.remove();return}
  if(!button){
    button=document.createElement("button");button.type="button";button.id="studentApptMore";button.className="v43-more-tool";
    button.innerHTML='<span class="v43-more-tool-icon" aria-hidden="true">◷</span><span><b>Koçla görüşme</b><small>Randevu al, randevularını gör</small></span><i aria-hidden="true">›</i>';
    button.addEventListener("click",()=>openSheet());
  }
  if(button.parentElement!==grid)grid.prepend(button);
}
// Alttan açılan randevu ekranı (bilgisayarda ortada kart).
function openSheet(){
  styles();
  let sheet=document.getElementById("studentAppointmentsSheet");
  if(!sheet){
    sheet=document.createElement("div");sheet.id="studentAppointmentsSheet";sheet.className="sap-sheet";sheet.hidden=true;
    sheet.innerHTML='<div class="sap-sheet-panel sap" role="dialog" aria-modal="true" aria-label="Koçla görüşme"><div class="sap-sheet-bar"><span class="sap-grab" aria-hidden="true"></span><button type="button" class="sap-close" data-sap-close aria-label="Kapat">✕</button></div><div data-sap-body></div></div>';
    sheet.addEventListener("click",event=>{if(event.target===sheet||event.target.closest?.("[data-sap-close]"))closeSheet()});
    sheet.addEventListener("keydown",event=>{if(event.key==="Escape"){event.preventDefault();closeSheet()}});
    document.body.append(sheet);
  }
  state.returnFocus=document.activeElement;
  state.view="auto";state.week=0;
  sheet.hidden=false;document.documentElement.classList.add("sap-sheet-open");
  render();
  sheet.querySelector("[data-sap-close]")?.focus();
}
function closeSheet(){
  const sheet=document.getElementById("studentAppointmentsSheet");if(!sheet||sheet.hidden)return;
  sheet.hidden=true;document.documentElement.classList.remove("sap-sheet-open");state.view="auto";
  try{state.returnFocus?.focus?.()}catch{}
}

function stop(){for(const off of state.stops)try{off()}catch{}state.stops=[]}
async function connect(){
  stop();Object.assign(state,{coachUid:"",availability:null,busy:new Set(),appts:[],day:"",pick:"",topic:"",view:"auto",week:0,error:""});
  if(!state.user||!state.db)return;
  try{
    const links=(await getDocs(query(collection(state.db,"coachingLinks"),where("studentUid","==",state.user.uid)))).docs.map(item=>item.data()).filter(item=>item.active===true);
    state.coachUid=links[0]?.coachUid||"";
    if(!state.coachUid){render();renderToday();return}
    try{const profile=await getDoc(doc(state.db,"accountProfiles",state.coachUid));state.coachName=text(profile.exists()?profile.data()?.displayName:"",60)||"Koçun"}catch{}
    const hours=await getDoc(doc(state.db,"coachAvailability",state.coachUid));state.availability=hours.exists()?hours.data():null;
    state.stops.push(onSnapshot(query(collection(state.db,"coachSlots"),where("coachUid","==",state.coachUid)),snap=>{state.busy=new Set(snap.docs.map(item=>item.data().date+" "+item.data().time));render()},error=>console.error("Dolu saatler",error)));
    state.stops.push(onSnapshot(query(collection(state.db,"coachAppointments"),where("studentUid","==",state.user.uid)),snap=>{state.appts=snap.docs.map(item=>({id:item.id,...item.data()}));render();renderToday()},error=>console.error("Randevular",error)));
  }catch(error){
    console.error("Randevu sistemi",error);
    state.error=String(error?.code||"").includes("permission-denied")?"Randevu sistemi birazdan açılacak.":"Randevular şu an yüklenemedi.";
  }
  render();renderToday();
}
function ensure(){
  styles();section();render();
  if(!state.observer&&document.body){
    state.observer=new MutationObserver(()=>{const card=document.getElementById("studentCoachCodeSettings");if(card&&!document.getElementById("studentAppointments"))render();if(state.user&&document.querySelector("#v43MoreTools .v43-more-tool-grid")&&!document.getElementById("studentApptMore"))renderMoreEntry()});
    state.observer.observe(document.body,{childList:true,subtree:true});
  }
}
function cleanup(){stop();state.observer?.disconnect?.();state.observer=null;clearInterval(state.timer);state.timer=0;closeSheet();for(const id of ["studentAppointments","studentNextAppointment","studentApptEntry","studentApptMore","studentAppointmentsSheet"])document.getElementById(id)?.remove();Object.assign(state,{user:null,db:null,coachUid:"",appts:[],busy:new Set(),availability:null})}
function install(){
  const auth=window.YKSAccountAuth;if(!auth||auth.__studentAppointments)return false;auth.__studentAppointments=true;
  const previousIn=auth.onSignedIn?.bind(auth),previousOut=auth.onSignedOut?.bind(auth);
  auth.onSignedIn=async ctx=>{
    const result=previousIn?await previousIn(ctx):null;
    if(result?.role==="student"){
      state.user=ctx.user;state.db=ctx.db;ensure();void connect();
      clearInterval(state.timer);state.timer=setInterval(()=>{render();renderToday()},60000);
    }
    return result;
  };
  auth.onSignedOut=()=>{cleanup();return previousOut?.()};
  // Koç bağlanınca ya da bağlantı kesilince randevular yeniden kurulur.
  window.addEventListener("yks:data-changed",()=>{if(state.user){ensure();renderToday()}});
  window.addEventListener("yks:student-coach-link-ready",()=>{if(state.user)void connect()});
  document.documentElement.dataset.studentAppointments="ready";
  window.YKSStudentAppointments={version:VERSION,refresh:()=>connect()};
  return true;
}
install();
