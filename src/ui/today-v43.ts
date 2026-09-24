import "./today-v43.css";

type AppWindow=Window&{
  go?:(screen:string)=>unknown;
  openGun?:()=>unknown;
  openGlobalSearch?:()=>unknown;
  saveJournal?:()=>unknown;
  shareCard?:()=>unknown;
};

function byId<T extends HTMLElement=HTMLElement>(id:string):T|null{
  const node=document.getElementById(id);
  return node instanceof HTMLElement?node as T:null;
}
function txt(id:string,fallback="—"):string{
  const value=(byId(id)?.textContent||"").trim();
  return value||fallback;
}
function dateText():string{
  return new Intl.DateTimeFormat("tr-TR",{weekday:"long",day:"numeric",month:"long"}).format(new Date());
}
function subjectTone(value:string):string{
  const text=value.toLocaleLowerCase("tr-TR");
  if(text.includes("matematik")||text.includes("geometri")||text.includes("problem"))return "math";
  if(text.includes("fizik"))return "physics";
  if(text.includes("kimya"))return "chemistry";
  if(text.includes("biyoloji"))return "biology";
  if(text.includes("türk")||text.includes("paragraf")||text.includes("edebiyat"))return "turkish";
  if(text.includes("deneme"))return "exam";
  return "other";
}
function subjectIcon(tone:string):string{
  if(tone==="math")return "∑";
  if(tone==="physics")return "⚛";
  if(tone==="chemistry")return "⚗";
  if(tone==="biology")return "⌁";
  if(tone==="turkish")return "▤";
  if(tone==="exam")return "≡";
  return "•";
}
function taskParts(value:string):{detail:string;time:string}{
  const raw=value.trim();
  const match=raw.match(/(?:^|\s)(\d{1,2}:\d{2}\s*(?:[-–]\s*\d{1,2}:\d{2})?)(?:\s|$)/);
  if(!match)return {detail:raw,time:""};
  return {detail:raw.replace(match[0]," ").replace(/\s{2,}/g," ").trim(),time:(match[1]||"").replace(/-/g,"–")};
}
function makeBridge(home:HTMLElement):HTMLElement{
  const existing=home.querySelector<HTMLElement>(":scope > .v7-home-legacy");
  if(existing)return existing;
  const bridge=document.createElement("div");
  bridge.className="v7-home-legacy";
  bridge.hidden=true;
  bridge.setAttribute("aria-hidden","true");
  while(home.firstChild)bridge.appendChild(home.firstChild);
  home.appendChild(bridge);
  return bridge;
}
function metric(label:string,id:string,subId:string):HTMLElement{
  const item=document.createElement("article");
  item.className="v7-metric";
  item.dataset.valueId=id;
  item.dataset.subId=subId;
  item.innerHTML="<span></span><b>—</b><small>—</small>";
  const span=item.querySelector("span");
  if(span)span.textContent=label;
  return item;
}
function createHeader():HTMLElement{
  const header=document.createElement("header");
  header.className="v7-home-header";
  header.innerHTML='<div class="v7-brand-row"><div class="v7-brand" aria-label="YKS Defterim"><i class="v7-brand-mark" aria-hidden="true">Y</i><span><b>YKS <em>Defterim</em></b><small>Daha planlı, daha güçlü, daha sen.</small></span></div><div class="v7-header-tools"><button type="button" data-v7-search aria-label="Uygulamada ara">⌕</button><button type="button" data-v7-profile aria-label="Daha fazla">●</button></div></div><div class="v7-day-row"><div class="v7-greeting"><span>ANA SAYFA</span><h1>Bugün</h1><p data-v7-date-label></p></div><button type="button" class="v7-date" data-open-program><span aria-hidden="true">▣</span><b>Bugünün Planı</b><em>⌄</em></button></div>';
  const date=header.querySelector<HTMLElement>("[data-v7-date-label]");
  if(date)date.textContent=dateText();
  return header;
}
function createGoal():HTMLElement{
  const card=document.createElement("section");
  card.className="v7-card v7-goal";
  card.innerHTML='<div class="v7-hero-panel"><div class="v7-hero-copy"><span>BUGÜN</span><h2>Günlük hedef</h2><h3 id="v7HeroTitle">Bugün de hedeflerine<br>bir adım daha yaklaş!</h3><p id="v7HeroCopy">Disiplin, hayallerini gerçeğe dönüştürür.</p><button type="button" class="v7-details" data-day-details>Günün detayları</button></div><div class="v7-hero-progress" id="v7TodayRing" style="--v7-progress:0deg"><div><b id="v7TodayPct">%0</b><span>Bugünkü<br>ilerleme</span></div></div><div class="v7-hero-art" aria-hidden="true"><i></i><i></i><i></i></div></div><div class="v7-metrics"><article class="v7-metric target"><i>◎</i><span><small>Günlük Hedef</small><b id="v7TargetCount">0 görev</b><em>Planlanan çalışma</em></span></article><article class="v7-metric done"><i>✓</i><span><small>Tamamlanan</small><b id="v7DoneCount">0 görev</b><em id="v7DoneSub">%0 tamamlandı</em></span></article><article class="v7-metric focus"><i>◷</i><span><small>Çalışma Süresi</small><b id="v7FocusMinutes">0 dk</b><em>Bugünkü odak</em></span></article></div><div class="v7-next-strip"><span class="v7-next-label">SIRADAKİ</span><div><b id="v7NextTitle">Program hazırlanıyor</b><small id="v7NextDetail">Bugünkü plan yükleniyor</small></div><em id="v7Remaining">—</em><button type="button" data-open-program aria-label="Bugünün planını aç">›</button></div>';
  card.querySelector<HTMLButtonElement>("[data-day-details]")?.addEventListener("click",()=>{
    (window as AppWindow).openGun?.();
  });
  return card;
}
function createProgram():HTMLElement{
  const card=document.createElement("section");
  card.className="v7-card v7-program";
  card.dataset.v7Program="true";
  card.innerHTML='<header class="v7-card-head"><div><span>BUGÜNKÜ PROGRAM</span><h2>Bugünkü Planım</h2><p>Bugün ne yapıyorum?</p></div><button type="button" data-open-program><b id="v7ProgramCount">0 görev</b><em>›</em></button></header><div class="v7-plan-list"></div>';
  card.querySelector<HTMLButtonElement>("[data-open-program]")?.addEventListener("click",()=>{
    (window as AppWindow).go?.("program");
  });
  return card;
}
function createQuick():HTMLElement{
  const card=document.createElement("section");
  card.className="v7-card v7-quick";
  card.innerHTML='<header><span>HIZLI İŞLEMLER</span><h2>Devam et</h2></header><div class="v7-bottom-grid"><button type="button" class="v7-focus-card" data-route="pomo"><i>◉</i><span><b>Odak Oturumu</b><small>25 dk odaklan, 5 dk mola</small><em>▶ Pomodoroyu Başlat</em></span></button><button type="button" class="v7-note-card" data-route="notes"><i>✎</i><span><b>Günün Notu</b><small id="v7NotePreview">Bugünün kısa notunu ekle.</small><em>Notlarım ›</em></span></button></div><div class="v7-quick-grid"><button type="button" data-route="program"><i>▦</i><span><b>Programım</b><small>Planı düzenle</small></span><em>›</em></button><button type="button" data-route="progress"><i>⌁</i><span><b>İstatistik</b><small>Gelişimini incele</small></span><em>›</em></button></div>';
  return card;
}
function createCountdown():HTMLElement{
  const card=document.createElement("section");
  card.className="v7-card v7-countdown";
  card.innerHTML='<header><span>YKS SAYACI</span><small id="v7ExamDate">—</small></header><div class="v7-count-main"><b id="v7Countdown">—</b><em>gün</em></div><div class="v7-count-line"><i></i></div><div class="v7-streaks"><article><span>Plan serisi</span><b id="v7PlanStreak">0</b><small>gün</small></article><article><span>Hedef serisi</span><b id="v7TargetStreak">0</b><small>gün</small></article></div>';
  return card;
}
function createNotes():HTMLElement{
  const overlay=document.createElement("div");
  overlay.className="v7-note-overlay";
  overlay.hidden=true;
  overlay.innerHTML='<section class="v7-note-sheet" role="dialog" aria-modal="true" aria-labelledby="v7NoteTitle"><header><div><span>GÜNÜN NOTU</span><h2 id="v7NoteTitle">Bugün nasıl geçti?</h2></div><button type="button" data-note-close aria-label="Kapat">×</button></header><textarea id="v7NoteInput" maxlength="1000" placeholder="Bugün nasıl geçti? Tek cümle yeter."></textarea><button type="button" class="v7-note-save" data-note-save>Notu kaydet</button><button type="button" class="v7-note-share" data-note-share>Günün kartını indir</button></section>';
  return overlay;
}
function createView(home:HTMLElement):HTMLElement{
  const shell=document.createElement("div");
  shell.className="v7-home-view";
  shell.dataset.v7HomeView="true";
  const header=createHeader();
  const layout=document.createElement("div");
  layout.className="v7-layout";
  const main=document.createElement("main");
  main.className="v7-primary";
  main.append(createGoal(),createProgram());
  const side=document.createElement("aside");
  side.className="v7-side";
  side.append(createQuick(),createCountdown());
  layout.append(main,side);
  shell.append(header,layout);
  home.append(shell,createNotes());
  return shell;
}
function openNotes(home:HTMLElement):void{
  const overlay=home.querySelector<HTMLElement>(".v7-note-overlay");
  const input=home.querySelector<HTMLTextAreaElement>("#v7NoteInput");
  const legacy=byId<HTMLTextAreaElement>("journalInput");
  if(input)input.value=legacy?.value||"";
  if(overlay){
    overlay.hidden=false;
    document.documentElement.classList.add("v7-note-open");
    window.setTimeout(()=>input?.focus(),20);
  }
}
function closeNotes(home:HTMLElement):void{
  const overlay=home.querySelector<HTMLElement>(".v7-note-overlay");
  if(overlay)overlay.hidden=true;
  document.documentElement.classList.remove("v7-note-open");
}
function bindActions(home:HTMLElement):void{
  home.querySelectorAll<HTMLButtonElement>("[data-open-program]").forEach(button=>button.addEventListener("click",()=>{
    (window as AppWindow).go?.("program");
  }));
  home.querySelector<HTMLButtonElement>("[data-v7-search]")?.addEventListener("click",()=>{
    (window as AppWindow).openGlobalSearch?.();
  });
  home.querySelector<HTMLButtonElement>("[data-v7-profile]")?.addEventListener("click",()=>{
    (window as AppWindow).go?.("more");
  });
  home.querySelector(".v7-quick")?.addEventListener("click",event=>{
    const button=(event.target as Element|null)?.closest<HTMLButtonElement>("button[data-route]");
    if(!button)return;
    const route=button.dataset.route;
    if(route==="notes"){openNotes(home);return;}
    if(route)(window as AppWindow).go?.(route);
  });
  home.querySelector("[data-note-close]")?.addEventListener("click",()=>closeNotes(home));
  home.querySelector(".v7-note-overlay")?.addEventListener("click",event=>{
    if(event.target===event.currentTarget)closeNotes(home);
  });
  home.querySelector("[data-note-save]")?.addEventListener("click",()=>{
    const input=home.querySelector<HTMLTextAreaElement>("#v7NoteInput");
    const legacy=byId<HTMLTextAreaElement>("journalInput");
    if(input&&legacy)legacy.value=input.value;
    (window as AppWindow).saveJournal?.();
    syncNotePreview(home);
    closeNotes(home);
  });
  home.querySelector("[data-note-share]")?.addEventListener("click",()=>{
    (window as AppWindow).shareCard?.();
  });
  window.addEventListener("keydown",event=>{if(event.key==="Escape")closeNotes(home);});
}
function syncHeader(home:HTMLElement):void{
  const date=home.querySelector<HTMLElement>("[data-v7-date-label]");
  if(date)date.textContent=dateText();
}
function syncNotePreview(home:HTMLElement):void{
  const preview=home.querySelector<HTMLElement>("#v7NotePreview");
  const note=(byId<HTMLTextAreaElement>("journalInput")?.value||"").trim();
  if(preview)preview.textContent=note?note.slice(0,84)+(note.length>84?"…":""):"Bugünün kısa notunu ekle.";
}
function syncCountdown(home:HTMLElement):void{
  const set=(selector:string,value:string)=>{const node=home.querySelector<HTMLElement>(selector);if(node)node.textContent=value;};
  set("#v7Countdown",txt("countdown","—"));
  set("#v7ExamDate",txt("examDateLabel","—"));
  set("#v7PlanStreak",txt("streakPlan","0"));
  set("#v7TargetStreak",txt("streakTarget","0"));
  const legacyLine=byId("timeline");
  const line=home.querySelector<HTMLElement>(".v7-count-line i");
  if(line&&legacyLine)line.style.width=legacyLine.style.width||"0%";
}
function syncPlan(home:HTMLElement):void{
  const legacy=byId("todayPlan");
  const list=home.querySelector<HTMLElement>(".v7-plan-list");
  if(!legacy||!list)return;

  const rows=Array.from(legacy.querySelectorAll<HTMLElement>(".plancell"));
  const doneCount=rows.filter(row=>row.classList.contains("pd")).length;
  const currentIndex=rows.findIndex(row=>!row.classList.contains("pd"));
  const pct=rows.length?Math.round(doneCount/rows.length*100):0;
  const set=(selector:string,value:string)=>{const node=home.querySelector<HTMLElement>(selector);if(node)node.textContent=value;};
  set("#v7TargetCount",rows.length+" görev");
  set("#v7DoneCount",doneCount+" görev");
  set("#v7DoneSub","%"+pct+" tamamlandı");
  set("#v7ProgramCount",rows.length+" görev");
  set("#v7TodayPct","%"+pct);
  set("#v7FocusMinutes",txt("todayHubMin","0 dk"));
  const ring=home.querySelector<HTMLElement>("#v7TodayRing");
  if(ring)ring.style.setProperty("--v7-progress",(pct*3.6)+"deg");

  const remaining=Math.max(0,rows.length-doneCount);
  const heroTitle=home.querySelector<HTMLElement>("#v7HeroTitle");
  const heroCopy=home.querySelector<HTMLElement>("#v7HeroCopy");
  if(heroTitle)heroTitle.innerHTML=pct>=100?"Bugünün planı<br>tamamlandı!":pct>=60?"Harika gidiyorsun,<br>ritmi koru!":"Bugün de hedeflerine<br>bir adım daha yaklaş!";
  if(heroCopy)heroCopy.textContent=pct>=100?"Bugünü tamamladın. Yarın için küçük bir hazırlık yeter.":pct>=60?"Planın büyük kısmı bitti. Kalanları sırayla tamamla.":"Disiplin, hayallerini gerçeğe dönüştürür.";
  set("#v7Remaining",remaining?remaining+" görev kaldı":"Plan tamam");
  const currentRow=currentIndex>=0?rows[currentIndex]:null;
  if(currentRow){
    const nextLabel=(currentRow.querySelector(".pl")?.textContent||currentRow.querySelector("b")?.textContent||"Sıradaki çalışma").trim();
    const nextRaw=(currentRow.querySelector(".pt")?.textContent||currentRow.querySelector("small")?.textContent||"").trim();
    const nextParts=taskParts(nextRaw);
    set("#v7NextTitle",nextLabel);
    set("#v7NextDetail",[nextParts.detail,nextParts.time].filter(Boolean).join(" · ")||"Sıradaki çalışma");
  }else{
    set("#v7NextTitle",rows.length?"Bugünün planı tamamlandı 🎉":"Bugün için görev yok");
    set("#v7NextDetail",rows.length?"Eline sağlık. İstersen yarına göz atabilirsin.":"Programım ekranından bugüne görev ekleyebilirsin.");
  }

  list.replaceChildren();
  if(!rows.length){
    const empty=document.createElement("div");
    empty.className="v7-plan-empty";
    empty.innerHTML='<i>▦</i><b>Bugün için görev görünmüyor.</b><span>Programım ekranından bugüne görev ekleyebilirsin.</span><button type="button">Programı aç</button>';
    empty.querySelector("button")?.addEventListener("click",()=>{(window as AppWindow).go?.("program");});
    list.appendChild(empty);
    return;
  }

  rows.forEach((row,index)=>{
    const label=(row.querySelector(".pl")?.textContent||row.querySelector("b")?.textContent||"Görev").trim();
    const rawTask=(row.querySelector(".pt")?.textContent||row.querySelector("small")?.textContent||"").trim();
    const parts=taskParts(rawTask);
    const done=row.classList.contains("pd");
    const current=!done&&index===currentIndex;
    const tone=subjectTone(label+" "+parts.detail);
    const item=document.createElement("article");
    item.className="v7-plan-item";
    item.classList.toggle("done",done);
    item.classList.toggle("current",current);
    if(current)item.setAttribute("aria-current","step");
    item.dataset.tone=tone;
    item.innerHTML='<button type="button" class="v7-plan-status" aria-label="Görevin tamamlanma durumunu değiştir"><span>✓</span></button><div class="v7-plan-main"><i class="v7-subject-icon" aria-hidden="true"></i><div class="v7-plan-copy"><b></b><span></span><small></small></div></div><div class="v7-plan-tools"></div>';
    const icon=item.querySelector<HTMLElement>(".v7-subject-icon");
    const b=item.querySelector<HTMLElement>(".v7-plan-copy b");
    const detail=item.querySelector<HTMLElement>(".v7-plan-copy span");
    const time=item.querySelector<HTMLElement>(".v7-plan-copy small");
    if(icon)icon.textContent=subjectIcon(tone);
    if(b)b.textContent=label;
    if(detail)detail.textContent=parts.detail||"Plan görevi";
    if(time)time.textContent=parts.time||"Bugünkü plan";

    item.querySelector<HTMLButtonElement>(".v7-plan-status")?.addEventListener("click",event=>{
      event.stopPropagation();
      rows[index]?.click();
    });

    const tools=item.querySelector<HTMLElement>(".v7-plan-tools");
    const video=row.querySelector<HTMLButtonElement>(".cvid");
    const tomorrow=row.querySelector<HTMLButtonElement>(".plan-tomorrow");
    if(done){
      const badge=document.createElement("span");badge.className="v7-plan-done";badge.textContent="✓ Tamamlandı";tools?.appendChild(badge);
    }else if(current){
      const btn=document.createElement("button");btn.type="button";btn.className="v7-plan-continue";btn.textContent="▶ Şimdi Devam Et";
      btn.addEventListener("click",event=>{event.stopPropagation();if(video)video.click();else (window as AppWindow).go?.("pomo");});
      tools?.appendChild(btn);
    }else{
      if(video){
        const btn=document.createElement("button");btn.type="button";btn.className="v7-tool-icon";btn.textContent="▶";btn.title="Videoyu aç";
        btn.addEventListener("click",event=>{event.stopPropagation();video.click();});tools?.appendChild(btn);
      }
      const arrow=document.createElement("span");arrow.className="v7-plan-arrow";arrow.textContent="›";tools?.appendChild(arrow);
    }
    if(tomorrow){
      const btn=document.createElement("button");btn.type="button";btn.className="v7-tomorrow";btn.textContent="Yarın";btn.title="Yarına taşı";
      btn.addEventListener("click",event=>{event.stopPropagation();tomorrow.click();});tools?.appendChild(btn);
    }
    item.addEventListener("click",event=>{
      if((event.target as Element).closest("button"))return;
      rows[index]?.click();
    });
    list.appendChild(item);
  });
}
function syncAll(home:HTMLElement):void{
  syncHeader(home);
  syncCountdown(home);
  syncPlan(home);
  syncNotePreview(home);
}
function observeLegacy(home:HTMLElement,bridge:HTMLElement):void{
  let queued=false;
  const schedule=()=>{
    if(queued)return;
    queued=true;
    window.requestAnimationFrame(()=>{queued=false;syncAll(home);});
  };
  new MutationObserver(schedule).observe(bridge,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:["style","class"]});
  window.addEventListener("yks:data-changed",schedule);
  window.addEventListener("yks:navigation-after",schedule);
  window.addEventListener("focus",schedule);
  schedule();
}
export function installTodayV43():{installed:boolean;validate:()=>string[]}{
  const home=byId("home");
  if(!home)return {installed:false,validate:()=>["home screen missing"]};
  if(home.dataset.v7Home==="ready")return {installed:true,validate:()=>[]};

  home.classList.remove("v43-today","v6-home");
  home.classList.add("v7-home");
  home.dataset.v43Today="ready";
  home.dataset.v7Home="ready";

  const bridge=makeBridge(home);
  createView(home);
  bindActions(home);
  observeLegacy(home,bridge);

  return {installed:true,validate:()=>{
    const errors:string[]=[];
    if(home.dataset.v7Home!=="ready")errors.push("v7 marker missing");
    if(!home.querySelector(":scope > .v7-home-legacy[hidden]"))errors.push("legacy bridge not hidden");
    if(!home.querySelector(":scope > [data-v7-home-view]"))errors.push("v7 view missing");
    if(!home.querySelector(".v7-program"))errors.push("v7 program missing");
    if(!home.querySelector(".v7-quick"))errors.push("v7 quick actions missing");
    return errors;
  }};
}
