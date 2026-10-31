import{collection,doc,getDoc,getDocs,onSnapshot,query,serverTimestamp,where,writeBatch}from"https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";

// YKS Defterim · Koçunla görüşme (v69). Koçun uygun saatleri coachAvailability/{koçUid};
// her randevu coachAppointments/{koçUid_YYYYMMDD_SSDD} ve aynı kimlikte bir saat kilidi
// coachSlots'ta tutulur. Kilit ve randevu birlikte yazılıp silinir; kural aynı saate ikinci
// kaydı reddeder, böylece iki öğrenci aynı saati alamaz.
const VERSION="1.2.0";
const state={user:null,db:null,coachUid:"",coachName:"Koçun",availability:null,busy:new Set(),appts:[],day:"",pick:"",topic:"",view:"home",returnFocus:null,stops:[],observer:null,timer:0,sending:false,error:""};
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
  .sap-wiz-head{position:relative;display:flex;align-items:center;justify-content:center;min-height:44px}
  .sap-wiz-head b{font-size:15px}.sap-wiz-head span{position:absolute;right:0;color:var(--d-muted,#5f6b80);font-size:13px;font-weight:700}
  .sap-back{position:absolute;left:0;width:44px;height:44px;border:0;border-radius:12px;background:var(--d-soft,#eef3fb);color:var(--d-ink,#121a2b);font:inherit;font-size:22px;cursor:pointer}
  .sap-progress{height:6px;margin:8px 0 14px;border-radius:9px;background:var(--d-line,#e3e9f2);overflow:hidden}.sap-progress i{display:block;height:100%;border-radius:9px;background:var(--d-accent,#2f6bea)}
  .sap-q{margin:0 0 2px;font-size:17px}
  .sap-days{display:grid;gap:8px;margin-top:12px}
  .sap-daycard{display:flex;align-items:center;justify-content:space-between;gap:10px;width:100%;min-height:58px;padding:11px 14px;border:1px solid var(--d-line,#e3e9f2);border-radius:14px;background:var(--d-surface,#fff);color:var(--d-ink,#121a2b);font:inherit;text-align:left;cursor:pointer;box-sizing:border-box}
  .sap-daycard b{display:block;font-size:14px}.sap-daycard small{display:block;color:var(--d-muted,#5f6b80);font-size:12.5px}
  .sap-daycard.on{border-color:var(--d-accent,#2f6bea);box-shadow:0 0 0 2px var(--d-chip,#e9f0fe)}
  .sap-daycard.off{opacity:.55;cursor:default;background:var(--d-soft,#eef3fb)}
  .sap-daycard .sap-pill:not(.ok){background:var(--d-line,#e3e9f2);color:var(--d-muted,#5f6b80)}
  .sap-times{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin-top:12px}
  .sap-times .sap-slot{min-height:48px}
  .sap-summary{display:flex;gap:12px;align-items:center;margin-top:10px;padding:12px 14px;border:1px solid var(--d-line,#e3e9f2);border-radius:14px;background:var(--d-surface,#fff)}
  .sap-summary b{display:block;font-size:14.5px}.sap-summary small{display:block;color:var(--d-muted,#5f6b80);font-size:12.5px}
  .sap-avatar{width:42px;height:42px;flex:none;display:grid;place-items:center;border-radius:50%;background:var(--d-chip,#e9f0fe);color:var(--d-chip-ink,#2453b8);font-weight:850;font-size:13px}
  .sap-topic{display:grid;gap:6px;margin-top:12px;font-size:13px;font-weight:700;color:var(--d-muted,#5f6b80)}
  .sap-topic textarea{min-height:76px;padding:10px 12px;border:1px solid var(--d-line,#e3e9f2);border-radius:12px;background:var(--d-surface,#fff);color:var(--d-ink,#121a2b);font:inherit;font-size:14px;resize:vertical;box-sizing:border-box}
  .sap-btn:disabled{opacity:.5;cursor:not-allowed}
  .sap-back:focus-visible,.sap-daycard:focus-visible{outline:2px solid var(--d-accent,#2f6bea);outline-offset:2px}
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
// Şablon B · adım adım: Randevularım → 1 gün → 2 saat → 3 özet. Her adımda tek karar.
const days14=()=>[...Array(14)].map((_,i)=>iso(new Date(Date.now()+i*864e5)));
function dayTitle(date){
  const today=iso(new Date()),tomorrow=iso(new Date(Date.now()+864e5)),long=dateLabel(date,{weekday:"long",day:"numeric",month:"long"});
  return date===today?"Bugün · "+long:date===tomorrow?"Yarın · "+long:long;
}
function wizardHead(step){
  return'<div class="sap-wiz-head"><button type="button" class="sap-back" data-sap-back aria-label="Geri">‹</button><b>Randevu al</b><span>'+step+'/3</span></div><div class="sap-progress" aria-hidden="true"><i style="width:'+Math.round(step/3*100)+'%"></i></div>';
}
function homeHtml(){
  if(!state.coachUid)return'<h4>Koçunla görüşme</h4><p class="sap-muted">Randevu almak için önce bir koç bağlamalısın. Koç kodunu Ayarlar › Koç Kodum\'da bulabilirsin.</p>';
  if(state.error)return'<h4>Koçunla görüşme</h4><p class="sap-muted">'+esc(state.error)+'</p>';
  const action=state.availability?'<button type="button" class="sap-btn primary sap-wide" data-sap-go="day">Randevu al</button>':'<p class="sap-muted">Koçun henüz görüşme saatlerini açmadı. Açtığında buradan randevu alabilirsin.</p>';
  return'<h4>'+esc(state.coachName)+' ile görüşme</h4><p class="sap-muted">'+esc(String(Number(state.availability?.duration)||30))+' dakikalık görüşmeler</p>'+action+'<h5 class="sap-sub">Randevularım</h5>'+listHtml();
}
function dayHtml(){
  let html=wizardHead(1)+'<h4 class="sap-q">Hangi gün?</h4><p class="sap-muted">'+esc(state.coachName)+' · önümüzdeki 14 gün</p><div class="sap-days">';
  for(const date of days14()){
    const slots=slotsFor(date),free=freeSlots(date).length,day=state.availability?.days?.[String(new Date(date+"T12:00:00").getDay())];
    if(!slots.length){html+='<div class="sap-daycard off"><div><b>'+esc(dayTitle(date))+'</b><small>Kapalı</small></div></div>';continue}
    const range=esc(slots[0])+' – '+esc(day?.end||"");
    if(!free){html+='<div class="sap-daycard off"><div><b>'+esc(dayTitle(date))+'</b><small>'+range+'</small></div><span class="sap-pill">Dolu</span></div>';continue}
    html+='<button type="button" class="sap-daycard'+(date===state.day?" on":"")+'" data-sap-day="'+date+'" aria-label="'+esc(dayTitle(date))+', '+free+' boş saat"><div><b>'+esc(dayTitle(date))+'</b><small>'+range+'</small></div><span class="sap-pill ok">'+free+' boş saat</span></button>';
  }
  return html+'</div>';
}
function timeHtml(){
  const date=state.day,times=[...new Set([...slotsFor(date),...state.appts.filter(item=>item.date===date).map(item=>item.time)])].sort();
  let html=wizardHead(2)+'<h4 class="sap-q">Hangi saat?</h4><p class="sap-muted">'+esc(dateLabel(date))+'</p><div class="sap-times" role="group" aria-label="Saatler">';
  html+=times.map(time=>{
    if(mine(date,time))return'<button type="button" class="sap-slot mine" disabled aria-label="'+time+', senin randevun">'+time+'</button>';
    const taken=state.busy.has(date+" "+time),past=isPast(date,time);
    return'<button type="button" class="sap-slot'+(state.pick===time?" pick":"")+'" data-sap-slot="'+time+'"'+(taken||past?" disabled":"")+' aria-pressed="'+(state.pick===time)+'" aria-label="'+time+(taken?", dolu":past?", geçti":", boş")+'">'+time+'</button>';
  }).join("");
  return html+'</div><p class="sap-muted" style="margin-top:8px">Üstü çizili saatler dolu ya da geçmiş.</p><button type="button" class="sap-btn primary sap-wide" data-sap-go="summary"'+(state.pick?"":" disabled")+'>Devam</button>';
}
function initials(name){return text(name,60).split(/\s+/).filter(Boolean).slice(0,2).map(part=>part[0]).join("").toLocaleUpperCase("tr-TR")||"K"}
function summaryHtml(){
  const duration=Number(state.availability?.duration)||30;
  return wizardHead(3)+'<h4 class="sap-q">Özet</h4><div class="sap-summary"><span class="sap-avatar" aria-hidden="true">'+esc(initials(state.coachName))+'</span><div><b>'+esc(state.coachName)+'</b><small>'+esc(dateLabel(state.day))+' · '+esc(state.pick)+' · '+duration+' dk</small></div></div>'
    +'<label class="sap-topic"><span>Ne konuşmak istersin? (isteğe bağlı)</span><textarea maxlength="120" rows="3" data-sap-topic placeholder="Örn. Deneme sonrası konuşalım">'+esc(state.topic)+'</textarea></label>'
    +'<button type="button" class="sap-btn primary sap-wide" data-sap-request>Randevu iste</button><p class="sap-muted" style="text-align:center">'+esc(state.coachName)+' onaylayınca Bugün ekranında "Sıradaki görüşme" olarak görünür.</p>';
}
function listHtml(){
  const list=upcoming();
  if(!list.length)return'<p class="sap-muted">Yaklaşan randevun yok.</p>';
  return'<div class="sap-list">'+list.map(item=>{
    const confirmed=item.status==="confirmed";
    return'<div class="sap-item"><div class="sap-item-top"><div><b>'+esc(relativeDay(item.date))+' · '+esc(item.time)+'</b><small>'+esc(item.topic||"Konu yazılmadı")+' · '+esc(String(item.duration||30))+' dk</small>'+(item.note?'<small>'+esc(item.note)+'</small>':'')+'</div><span class="sap-pill '+(confirmed?"ok":"wait")+'">'+(confirmed?"Kesin":"Onay bekliyor")+'</span></div>'
      +'<div class="sap-item-actions">'+(confirmed&&item.link?'<a class="sap-btn primary" href="'+esc(item.link)+'" target="_blank" rel="noopener noreferrer" style="display:inline-flex;align-items:center;text-decoration:none">Görüşmeye katıl</a>':confirmed?'<small>Koçun görüşme linkini eklediğinde burada çıkar.</small>':'')+'<button type="button" class="sap-btn danger" data-sap-cancel="'+esc(item.id)+'">İptal et</button></div></div>';
  }).join("")+'</div>';
}
function viewHtml(view){
  if(view!=="home"&&(!state.coachUid||!state.availability||state.error))view="home";
  if(view==="time"&&!state.day)view="day";
  if(view==="summary"&&!state.pick)view=state.day?"time":"day";
  return view==="day"?dayHtml():view==="time"?timeHtml():view==="summary"?summaryHtml():homeHtml();
}
function render(){
  const box=section();
  if(box){box.hidden=!state.user;if(state.user){box.innerHTML=homeHtml();bind(box,true)}}
  const sheet=document.getElementById("studentAppointmentsSheet"),body=sheet?.querySelector("[data-sap-body]");
  if(sheet&&!sheet.hidden&&body){body.innerHTML=viewHtml(state.view);bind(body,false)}
  renderMoreEntry();
}
function go(view){state.view=view;render();const body=document.querySelector("#studentAppointmentsSheet [data-sap-body]");body?.querySelector("[data-sap-back],[data-sap-go],button")?.focus?.()}
function bind(box,inSettings){
  box.querySelectorAll("[data-sap-go]").forEach(button=>button.onclick=()=>{const view=button.dataset.sapGo;if(inSettings){openSheet(view);return}go(view)});
  const back=box.querySelector("[data-sap-back]");if(back)back.onclick=()=>go(state.view==="summary"?"time":state.view==="time"?"day":"home");
  box.querySelectorAll("[data-sap-day]").forEach(button=>button.onclick=()=>{if(state.day!==button.dataset.sapDay)state.pick="";state.day=button.dataset.sapDay;go("time")});
  box.querySelectorAll("[data-sap-slot]").forEach(button=>button.onclick=()=>{state.pick=state.pick===button.dataset.sapSlot?"":button.dataset.sapSlot;render();box.querySelector('[data-sap-go="summary"]')?.focus()});
  const topic=box.querySelector("[data-sap-topic]");if(topic)topic.oninput=()=>{state.topic=text(topic.value,120)};
  const ask=box.querySelector("[data-sap-request]");if(ask)ask.onclick=()=>void requestAppointment(state.topic,ask);
  box.querySelectorAll("[data-sap-cancel]").forEach(button=>button.onclick=()=>void cancelAppointment(button.dataset.sapCancel,button));
}

async function requestAppointment(topic,button){
  if(state.sending||!state.user||!state.db||!state.coachUid||!state.pick)return;
  const date=state.day,time=state.pick;
  if(isPast(date,time)||state.busy.has(date+" "+time)){toast("Bu saat artık uygun değil, başka bir saat seç.");state.pick="";state.view="time";render();return}
  state.sending=true;if(button)button.disabled=true;
  const id=apptId(state.coachUid,date,time),batch=writeBatch(state.db),now=serverTimestamp();
  batch.set(doc(state.db,"coachSlots",id),{coachUid:state.coachUid,date,time});
  batch.set(doc(state.db,"coachAppointments",id),{coachUid:state.coachUid,studentUid:state.user.uid,date,time,duration:Number(state.availability?.duration)||30,status:"requested",createdBy:"student",topic,link:"",note:"",createdAt:now,updatedAt:now});
  try{await batch.commit();state.pick="";state.topic="";state.view="home";toast("Randevu isteğin koçuna gitti ✓")}
  catch(error){console.error("Randevu isteği",error);const taken=String(error?.code||"").includes("permission-denied");if(taken){state.pick="";state.view="time"}toast(taken?"Bu saat az önce doldu, başka bir saat seç.":"Randevu isteği gönderilemedi.")}
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
      card.addEventListener("click",event=>{if(event.target.closest?.(".sap-join"))return;openSheet("home")});
      card.addEventListener("keydown",event=>{if((event.key==="Enter"||event.key===" ")&&!event.target.closest?.(".sap-join")){event.preventDefault();openSheet("home")}});
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
    entry.addEventListener("click",()=>openSheet("day"));
  }
  place(entry);
  const free=nearestFree();
  const hint=free?(free.date===iso(new Date())?"Bugün ":free.date===iso(new Date(Date.now()+864e5))?"Yarın ":dateLabel(free.date,{day:"numeric",month:"long"})+" günü ")+free.count+" boş saat var":"Önümüzdeki iki haftada boş saat yok";
  entry.innerHTML='<i aria-hidden="true">◷</i><span><b>Koçunla görüşme ayarla</b><small>'+esc(hint)+'</small></span><em>Randevu al ›</em>';
}
// Merkez: koçu olan öğrenciye "Koçla görüşme" aracı (Merkez her açılışta yeniden çizildiğinde tekrar eklenir).
function renderMoreEntry(){
  const grid=document.querySelector("#v43MoreTools .v43-more-tool-grid");
  let button=document.getElementById("studentApptMore");
  if(!grid||!state.user||!state.coachUid){button?.remove();return}
  if(!button){
    button=document.createElement("button");button.type="button";button.id="studentApptMore";button.className="v43-more-tool";
    button.innerHTML='<span class="v43-more-tool-icon" aria-hidden="true">◷</span><span><b>Koçla görüşme</b><small>Randevu al, randevularını gör</small></span><i aria-hidden="true">›</i>';
    button.addEventListener("click",()=>openSheet("home"));
  }
  if(button.parentElement!==grid)grid.prepend(button);
}
// Alttan açılan randevu ekranı (bilgisayarda ortada kart).
function openSheet(view="home"){
  styles();
  let sheet=document.getElementById("studentAppointmentsSheet");
  if(!sheet){
    sheet=document.createElement("div");sheet.id="studentAppointmentsSheet";sheet.className="sap-sheet";sheet.hidden=true;
    sheet.innerHTML='<div class="sap-sheet-panel sap" role="dialog" aria-modal="true" aria-label="Koçunla görüşme"><div class="sap-sheet-bar"><span class="sap-grab" aria-hidden="true"></span><button type="button" class="sap-close" data-sap-close aria-label="Kapat">✕</button></div><div data-sap-body></div></div>';
    sheet.addEventListener("click",event=>{if(event.target===sheet||event.target.closest?.("[data-sap-close]"))closeSheet()});
    sheet.addEventListener("keydown",event=>{if(event.key==="Escape"){event.preventDefault();closeSheet()}});
    document.body.append(sheet);
  }
  state.returnFocus=document.activeElement;
  state.view=view;
  sheet.hidden=false;document.documentElement.classList.add("sap-sheet-open");
  render();
  sheet.querySelector("[data-sap-close]")?.focus();
}
function closeSheet(){
  const sheet=document.getElementById("studentAppointmentsSheet");if(!sheet||sheet.hidden)return;
  sheet.hidden=true;document.documentElement.classList.remove("sap-sheet-open");state.view="home";
  try{state.returnFocus?.focus?.()}catch{}
}

function stop(){for(const off of state.stops)try{off()}catch{}state.stops=[]}
async function connect(){
  stop();Object.assign(state,{coachUid:"",availability:null,busy:new Set(),appts:[],day:"",pick:"",topic:"",view:"home",error:""});
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
    state.observer=new MutationObserver(()=>{const card=document.getElementById("studentCoachCodeSettings");if(card&&!document.getElementById("studentAppointments"))render();if(state.coachUid&&document.querySelector("#v43MoreTools .v43-more-tool-grid")&&!document.getElementById("studentApptMore"))renderMoreEntry()});
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
