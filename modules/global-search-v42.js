/* YKS Defterim · Global Arama / Hızlı Erişim v4.2
   Salt okunur gezinme katmanı: arama hiçbir Program veya çalışma verisini değiştirmez. */
(function(){
  "use strict";
  if(window.__YKS_GLOBAL_SEARCH_V42__)return;
  window.__YKS_GLOBAL_SEARCH_V42__=true;

  const VERSION="4.2.0-r1";
  const RECENT_KEY="yks_global_search_recent_v42";
  const SCREEN_KEY="yks_global_search_screens_v42";
  const USAGE_KEY="yks_global_search_usage_v42";
  const MAX_RESULTS=48;
  const SCREEN_META={
    home:{label:"Bugün",icon:"⌂"},program:{label:"Program",icon:"▦"},topics:{label:"Konular",icon:"◎"},
    deneme:{label:"Deneme",icon:"↗"},pomo:{label:"Odak",icon:"◷"},progress:{label:"İlerleme",icon:"△"},more:{label:"Daha",icon:"•••"}
  };
  const $=id=>document.getElementById(id);
  const esc=value=>String(value??"").replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
  const norm=value=>String(value??"").trim().toLocaleLowerCase("tr").replace(/\s+/g," ");
  const readJSON=(key,fallback)=>{try{const x=JSON.parse(localStorage.getItem(key)||"null");return x==null?fallback:x;}catch(e){return fallback;}};
  const writeJSON=(key,value)=>{try{localStorage.setItem(key,JSON.stringify(value));return true;}catch(e){return false;}};
  const legacyGlobalSearch=typeof window.globalSearch==="function"?window.globalSearch:null;
  const originalGo=typeof window.go==="function"?window.go:null;
  let activeIndex=-1,currentResults=[],inlineResults=[],lastFocus=null;

  function injectStyle(){
    if($("v42GlobalSearchStyle"))return;
    const style=document.createElement("style");
    style.id="v42GlobalSearchStyle";
    style.textContent=`
      .v42-search-overlay{position:fixed;inset:0;z-index:12000;display:none;align-items:flex-start;justify-content:center;padding:max(68px,9vh) 18px 28px;background:color-mix(in srgb,#05070d 48%,transparent);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px)}
      .v42-search-overlay.open{display:flex}.v42-search-panel{width:min(760px,100%);max-height:min(78vh,780px);display:flex;flex-direction:column;overflow:hidden;border:1px solid color-mix(in srgb,var(--label) 10%,transparent);border-radius:25px;background:color-mix(in srgb,var(--bg) 94%,transparent);box-shadow:0 30px 100px -28px rgba(0,0,0,.48)}
      .v42-search-head{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:10px;align-items:center;padding:14px;border-bottom:1px solid var(--sep)}.v42-search-input-wrap{display:flex;align-items:center;gap:9px;min-height:50px;padding:0 13px;border:1px solid color-mix(in srgb,var(--accent) 22%,var(--sep));border-radius:15px;background:var(--fill)}.v42-search-input-wrap>span{font-size:21px;color:var(--accent)}
      #v42SearchInput{width:100%;min-width:0;margin:0;padding:0;border:0!important;outline:0!important;box-shadow:none!important;background:transparent;font-size:15px;font-weight:680;color:var(--label)}.v42-search-close{min-width:48px;min-height:48px;border:1px solid var(--sep);border-radius:14px;background:var(--fill);color:var(--label-2);font-size:20px;cursor:pointer}
      .v42-search-meta{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:9px 15px;border-bottom:1px solid var(--sep);font-size:10.5px;color:var(--label-3)}.v42-search-meta kbd{padding:3px 6px;border:1px solid var(--sep);border-bottom-width:2px;border-radius:6px;background:var(--fill);font:700 9px/1.2 ui-monospace,SFMono-Regular,monospace;color:var(--label-2)}
      .v42-search-body{overflow:auto;overscroll-behavior:contain;padding:10px 10px 14px;scrollbar-width:thin}.v42-search-section{padding:4px}.v42-search-section+.v42-search-section{margin-top:7px}.v42-search-section-title{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:5px 8px 7px;color:var(--label-3);font-size:9.5px;font-weight:850;letter-spacing:.06em;text-transform:uppercase}
      .v42-search-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:7px}.v42-quick{display:flex;align-items:center;gap:10px;min-height:54px;padding:10px 11px;border:1px solid var(--sep);border-radius:14px;background:var(--glass);color:var(--label);text-align:left;cursor:pointer}.v42-quick>i{display:grid;place-items:center;flex:none;width:32px;height:32px;border-radius:10px;background:var(--accent-soft);color:var(--accent);font-style:normal;font-weight:850}.v42-quick b,.v42-quick small{display:block}.v42-quick b{font-size:12px}.v42-quick small{margin-top:2px;color:var(--label-3);font-size:9.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .v42-result{display:grid;grid-template-columns:36px minmax(0,1fr) auto;gap:10px;align-items:center;width:100%;min-height:61px;padding:9px 10px;border:1px solid transparent;border-radius:14px;background:transparent;color:var(--label);text-align:left;cursor:pointer}.v42-result:hover,.v42-result.active{border-color:color-mix(in srgb,var(--accent) 20%,var(--sep));background:var(--accent-soft)}.v42-result-icon{display:grid;place-items:center;width:34px;height:34px;border-radius:11px;background:var(--fill);color:var(--accent);font-size:12px;font-weight:900}.v42-result-main{min-width:0}.v42-result-main b{display:block;font-size:12.5px;line-height:1.3;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.v42-result-main small{display:block;margin-top:3px;color:var(--label-3);font-size:9.5px;line-height:1.35;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.v42-result-group{align-self:start;margin-top:3px;padding:4px 6px;border-radius:8px;background:var(--fill);color:var(--label-3);font-size:8.5px;font-weight:800;white-space:nowrap}.v42-search-empty{padding:30px 18px;text-align:center;color:var(--label-3);font-size:12px;line-height:1.55}.v42-search-empty b{display:block;margin-bottom:4px;color:var(--label);font-size:14px}
      #gsBox .v42-inline-result{margin-bottom:5px}.v42-inline-count{margin:0 0 8px;color:var(--label-3);font-size:11px}
      .v42-search-close:focus-visible,.v42-quick:focus-visible,.v42-result:focus-visible{outline:3px solid color-mix(in srgb,var(--accent) 36%,transparent);outline-offset:2px}
      @media(max-width:640px){.v42-search-overlay{padding:58px 8px 8px;align-items:flex-start}.v42-search-panel{max-height:calc(100dvh - 66px);border-radius:20px}.v42-search-head{padding:10px}.v42-search-grid{grid-template-columns:1fr}.v42-search-meta{padding-inline:12px}.v42-result{grid-template-columns:34px minmax(0,1fr)}.v42-result-group{display:none}}
      @media(pointer:coarse){.v42-search-close{min-width:50px;min-height:50px}.v42-result{min-height:66px}.v42-quick{min-height:58px}}
      @media(prefers-reduced-motion:reduce){.v42-search-overlay,.v42-search-panel,.v42-result,.v42-quick{scroll-behavior:auto!important;transition:none!important}}
    `;
    document.head.appendChild(style);
  }

  function ensureUI(){
    injectStyle();
    if($("v42GlobalSearch"))return $("v42GlobalSearch");
    const root=document.createElement("div");
    root.id="v42GlobalSearch";root.className="v42-search-overlay";root.setAttribute("aria-hidden","true");
    root.innerHTML='<section class="v42-search-panel" role="dialog" aria-modal="true" aria-labelledby="v42SearchTitle"><div class="v42-search-head"><label class="v42-search-input-wrap" for="v42SearchInput"><span aria-hidden="true">⌕</span><input id="v42SearchInput" type="search" autocomplete="off" spellcheck="false" placeholder="Konu, deneme, hata veya laboratuvar içeriği ara…" aria-controls="v42SearchBody" aria-autocomplete="list"></label><button class="v42-search-close" type="button" aria-label="Aramayı kapat">×</button></div><div class="v42-search-meta"><span id="v42SearchTitle">Global arama · sadece bulur ve yönlendirir</span><span><kbd>↑↓</kbd> seç · <kbd>Enter</kbd> aç · <kbd>Esc</kbd> kapat</span></div><div class="v42-search-body" id="v42SearchBody" role="listbox"></div></section>';
    document.body.appendChild(root);
    $("v42SearchInput")?.addEventListener("input",event=>renderSearch(event.target.value));
    $("v42SearchInput")?.addEventListener("keydown",handleInputKeydown);
    root.querySelector(".v42-search-close")?.addEventListener("click",v42Close);
    root.addEventListener("mousedown",event=>{if(event.target===root)v42Close();});
    root.addEventListener("click",event=>{
      const button=event.target.closest("[data-v42-index]");if(!button)return;
      const index=Number(button.dataset.v42Index);if(Number.isInteger(index))activate(currentResults[index]);
    });
    return root;
  }

  function iconFor(group){
    const g=norm(group);
    if(g.includes("konu"))return "K";if(g.includes("deneme"))return "D";if(g.includes("yanlış")||g.includes("hata"))return "!";
    if(g.includes("laboratuvar"))return "L";if(g.includes("element"))return "E";if(g.includes("kronoloji")||g.includes("tarih"))return "T";
    if(g.includes("plan"))return "P";if(g.includes("not")||g.includes("günlük"))return "N";if(g.includes("kaynak")||g.includes("hoca"))return "R";return "↗";
  }
  function resultKey(r){return [r.kind||"base",r.group||"",r.title||"",r.go||"",r.exam||"",r.subject||"",r.topic||"",r.element||"",r.timeline||""].join("|");}
  function serializeResult(r){return {kind:r.kind||"base",group:r.group||"Sonuç",title:r.title||"",detail:r.detail||"",go:r.go||"",query:r.query||"",exam:r.exam||"",subject:r.subject||"",topic:r.topic||"",subjectIndex:Number.isInteger(r.subjectIndex)?r.subjectIndex:null,topicIndex:Number.isInteger(r.topicIndex)?r.topicIndex:null,element:r.element||null,timeline:r.timeline||""};}

  function labResults(q){
    const lab=window.YKSLearningLab;if(!lab)return [];
    const query=norm(q),tokens=query.split(" ").filter(Boolean),out=[];
    const matches=text=>{const hay=norm(text);return tokens.every(token=>hay.includes(token));};
    if(typeof lab.topicCatalog==="function"){
      ["TYT","AYT","YDT"].forEach(exam=>{
        let list=[];try{list=lab.topicCatalog(exam)||[];}catch(e){list=[];}
        list.filter(item=>matches(item.searchText||[item.exam,item.subject,item.topic].join(" "))).slice(0,8).forEach(item=>{
          let guide=null;try{guide=lab.topicGuide?.(item.exam,item.subject,item.topic)||null;}catch(e){}
          const hint=guide?.important?.[0]||guide?.attention?.[0]||"Konu rehberini laboratuvarda aç";
          out.push({kind:"lab-topic",group:"Laboratuvar",title:item.subject+" · "+item.topic,detail:item.exam+" · "+hint,go:"more",exam:item.exam,subject:item.subject,topic:item.topic,subjectIndex:item.subjectIndex,topicIndex:item.topicIndex});
        });
      });
    }
    (Array.isArray(lab.elements)?lab.elements:[]).filter(item=>matches([item.n,item.symbol,item.name,item.type].join(" "))).slice(0,6).forEach(item=>out.push({kind:"lab-element",group:"Periyodik tablo",title:item.symbol+" · "+item.name,detail:"Atom no "+item.n+" · "+item.type,go:"more",element:item.n}));
    (Array.isArray(lab.timeline)?lab.timeline:[]).filter(item=>matches([item.year,item.title,item.detail,item.era].join(" "))).slice(0,6).forEach(item=>out.push({kind:"lab-timeline",group:"Kronoloji",title:item.year+" · "+item.title,detail:item.era+" · "+item.detail,go:"more",timeline:item.title}));
    return out;
  }

  function baseResults(q){
    if(!legacyGlobalSearch)return [];
    let list=[];try{list=legacyGlobalSearch(q)||[];}catch(e){try{if(typeof infraError==="function")infraError("global-search-v42-base",e);}catch(_){}return [];}
    return list.map(r=>({kind:r.g==="Konu"?"topic":"base",group:r.g||"Sonuç",title:r.t||"",detail:String(r.d||""),go:r.go||"more",query:r.q||""}));
  }

  function rankResult(r,q){
    const query=norm(q),title=norm(r.title),detail=norm(r.detail),group=norm(r.group);let score=0;
    if(title===query)score+=120;else if(title.startsWith(query))score+=95;else if(title.includes(query))score+=72;
    if(detail.includes(query))score+=35;if(group.includes(query))score+=18;
    if(r.kind==="topic"||r.kind==="lab-topic")score+=8;if(r.kind==="lab-element"||r.kind==="lab-timeline")score+=4;
    return score;
  }
  function v42Search(q){
    const query=norm(q);if(query.length<2)return [];
    const seen=new Set(),all=baseResults(query).concat(labResults(query)),out=[];
    all.forEach(r=>{const key=resultKey(r);if(!r.title||seen.has(key))return;seen.add(key);r._score=rankResult(r,query);out.push(r);});
    return out.sort((a,b)=>b._score-a._score||String(a.title).localeCompare(String(b.title),"tr")).slice(0,MAX_RESULTS);
  }

  function recordScreen(id){
    if(!SCREEN_META[id])return;
    const list=readJSON(SCREEN_KEY,[]).filter(x=>x&&x.id!==id);list.unshift({id,at:Date.now()});writeJSON(SCREEN_KEY,list.slice(0,6));
  }
  function recordUse(result){
    if(!result)return;const data=serializeResult(result),key=resultKey(data),recent=readJSON(RECENT_KEY,[]).filter(x=>x&&resultKey(x)!==key);recent.unshift(data);writeJSON(RECENT_KEY,recent.slice(0,8));
    const usage=readJSON(USAGE_KEY,{}),prev=usage[key]||{count:0};usage[key]={count:Math.min(999,(Number(prev.count)||0)+1),last:Date.now(),result:data};
    const entries=Object.entries(usage).sort((a,b)=>(b[1]?.last||0)-(a[1]?.last||0)).slice(0,40);writeJSON(USAGE_KEY,Object.fromEntries(entries));
  }
  function topUsed(){
    const usage=readJSON(USAGE_KEY,{});return Object.values(usage).filter(x=>x?.result&&Number(x.count)>=2).sort((a,b)=>(b.count-a.count)||(b.last-a.last)).slice(0,4).map(x=>Object.assign({},x.result,{useCount:x.count}));
  }

  function quickButton(icon,title,sub,attrs){return '<button class="v42-quick" type="button" '+attrs+'><i aria-hidden="true">'+esc(icon)+'</i><span><b>'+esc(title)+'</b><small>'+esc(sub)+'</small></span></button>';}
  function renderQuick(){
    const body=$("v42SearchBody");if(!body)return;currentResults=[];activeIndex=-1;
    const screens=readJSON(SCREEN_KEY,[]).filter(x=>SCREEN_META[x?.id]).slice(0,4),recent=readJSON(RECENT_KEY,[]).filter(x=>x?.title).slice(0,4),used=topUsed();
    const defaultScreens=screens.length?screens:[{id:"home"},{id:"topics"},{id:"deneme"},{id:"pomo"}];
    let html='<div class="v42-search-section"><div class="v42-search-section-title"><span>Hızlı dönüş</span><span>Son ekranlar</span></div><div class="v42-search-grid">';
    defaultScreens.forEach(x=>{const meta=SCREEN_META[x.id];html+=quickButton(meta.icon,meta.label,"Ekranı aç",'data-v42-screen="'+esc(x.id)+'"');});html+='</div></div>';
    if(recent.length){html+='<div class="v42-search-section"><div class="v42-search-section-title"><span>Son açtıkların</span><span>Arama geçmişi</span></div><div class="v42-search-grid">';recent.forEach((r,i)=>{html+=quickButton(iconFor(r.group),r.title,r.group,'data-v42-recent="'+i+'"');});html+='</div></div>';}
    if(used.length){html+='<div class="v42-search-section"><div class="v42-search-section-title"><span>Sık kullandıkların</span><span>En çok açılanlar</span></div><div class="v42-search-grid">';used.forEach((r,i)=>{html+=quickButton(iconFor(r.group),r.title,(r.group||"Sonuç")+" · "+r.useCount+" kez",'data-v42-used="'+i+'"');});html+='</div></div>';}
    html+='<div class="v42-search-empty"><b>Her şeyi tek yerden bul</b>Konu, deneme, hata kaydı ve Öğrenme Laboratuvarı içeriği arasında ara. Arama yalnız yönlendirir; Programına veya kayıtlarına dokunmaz.</div>';
    body.innerHTML=html;
    body.querySelectorAll("[data-v42-screen]").forEach(btn=>btn.addEventListener("click",()=>{v42Close();window.go?.(btn.dataset.v42Screen);}));
    body.querySelectorAll("[data-v42-recent]").forEach(btn=>btn.addEventListener("click",()=>activate(recent[Number(btn.dataset.v42Recent)])));
    body.querySelectorAll("[data-v42-used]").forEach(btn=>btn.addEventListener("click",()=>activate(used[Number(btn.dataset.v42Used)])));
  }

  function renderSearch(q){
    const body=$("v42SearchBody"),input=$("v42SearchInput");if(!body)return;const query=String(q||"").trim();
    if(query.length<2){renderQuick();if(input)input.removeAttribute("aria-activedescendant");return;}
    currentResults=v42Search(query);activeIndex=currentResults.length?0:-1;
    if(!currentResults.length){body.innerHTML='<div class="v42-search-empty"><b>Sonuç bulunamadı</b>“'+esc(query)+'” için konu, deneme, hata veya laboratuvar içeriği eşleşmedi.</div>';if(input)input.removeAttribute("aria-activedescendant");return;}
    body.innerHTML='<div class="v42-search-section"><div class="v42-search-section-title"><span>'+currentResults.length+' sonuç</span><span>Enter ile aç</span></div>'+currentResults.map((r,i)=>'<button class="v42-result '+(i===0?'active':'')+'" id="v42Result'+i+'" role="option" aria-selected="'+(i===0)+'" type="button" data-v42-index="'+i+'"><span class="v42-result-icon" aria-hidden="true">'+esc(iconFor(r.group))+'</span><span class="v42-result-main"><b>'+esc(r.title)+'</b><small>'+esc(String(r.detail||"").slice(0,140))+'</small></span><span class="v42-result-group">'+esc(r.group)+'</span></button>').join("")+'</div>';
    updateActive();
  }
  function updateActive(){
    const body=$("v42SearchBody"),input=$("v42SearchInput");if(!body)return;const buttons=[...body.querySelectorAll(".v42-result")];
    buttons.forEach((button,i)=>{const on=i===activeIndex;button.classList.toggle("active",on);button.setAttribute("aria-selected",on?"true":"false");});
    if(activeIndex>=0&&buttons[activeIndex]){if(input)input.setAttribute("aria-activedescendant",buttons[activeIndex].id);buttons[activeIndex].scrollIntoView({block:"nearest"});}else if(input)input.removeAttribute("aria-activedescendant");
  }
  function handleInputKeydown(event){
    if(event.key==="ArrowDown"&&currentResults.length){event.preventDefault();activeIndex=(activeIndex+1+currentResults.length)%currentResults.length;updateActive();}
    else if(event.key==="ArrowUp"&&currentResults.length){event.preventDefault();activeIndex=(activeIndex-1+currentResults.length)%currentResults.length;updateActive();}
    else if(event.key==="Enter"&&activeIndex>=0&&currentResults[activeIndex]){event.preventDefault();activate(currentResults[activeIndex]);}
    else if(event.key==="Escape"){event.preventDefault();v42Close();}
  }

  function openMoreLab(after){
    v42Close();
    try{if(typeof window.v30OpenMore==="function")window.v30OpenMore("lab");else{window.go?.("more");window.setMoreTab?.("lab");}}catch(e){window.go?.("more");}
    setTimeout(()=>{try{after?.();}catch(e){try{if(typeof infraError==="function")infraError("global-search-v42-lab-nav",e);}catch(_){}}},120);
  }
  function activate(result){
    if(!result)return false;recordUse(result);
    if(result.kind==="lab-topic"){
      openMoreLab(()=>{window.v320SetExam?.(result.exam||"TYT");setTimeout(()=>window.v4OpenLabTopic?.(Number(result.subjectIndex)||0,Number(result.topicIndex)||0),40);});return true;
    }
    if(result.kind==="lab-element"){
      openMoreLab(()=>{window.v320SetTab?.("periodic");setTimeout(()=>window.v320SelectElement?.(Number(result.element)||1),40);});return true;
    }
    if(result.kind==="lab-timeline"){
      openMoreLab(()=>{window.v320SetTab?.("timeline");setTimeout(()=>{const q=$("v320TimelineSearch");if(q)q.value=result.timeline||"";window.v320FilterTimeline?.(result.timeline||"");},40);});return true;
    }
    v42Close();
    if(result.go)window.go?.(result.go);
    if(result.kind==="topic"&&result.query){setTimeout(()=>{const input=$("topicSearch");if(input)input.value=result.query;try{window.setTopicQuery?.(result.query);}catch(e){}},60);}
    return true;
  }

  function v42Open(initial){
    const root=ensureUI();lastFocus=document.activeElement;root.classList.add("open");root.setAttribute("aria-hidden","false");document.documentElement.classList.add("v42-search-open");
    const input=$("v42SearchInput");if(input){input.value=typeof initial==="string"?initial:"";renderSearch(input.value);requestAnimationFrame(()=>input.focus());}else renderQuick();
    return true;
  }
  function v42Close(){
    const root=$("v42GlobalSearch");if(!root)return false;root.classList.remove("open");root.setAttribute("aria-hidden","true");document.documentElement.classList.remove("v42-search-open");currentResults=[];activeIndex=-1;
    if(lastFocus&&typeof lastFocus.focus==="function"&&document.contains(lastFocus))try{lastFocus.focus();}catch(e){}lastFocus=null;return true;
  }

  function inlineActivate(index){const r=inlineResults[index];if(r)activate(r);}
  function v42RunInline(){
    const input=$("gsInput"),box=$("gsBox");if(!input||!box)return false;const q=(input.value||"").trim();
    if(q.length<2){inlineResults=[];box.innerHTML='<div class="empty">En az iki harf yaz. Konu, deneme, hata, plan, not ve Öğrenme Laboratuvarı içeriği birlikte aranır.</div>';return true;}
    inlineResults=v42Search(q);
    if(!inlineResults.length){box.innerHTML='<div class="empty">“'+esc(q)+'” için sonuç yok.</div>';return true;}
    box.innerHTML='<p class="v42-inline-count">'+inlineResults.length+' sonuç · global arama motoru</p>'+inlineResults.map((r,i)=>'<button class="v42-result v42-inline-result" type="button" onclick="YKSGlobalSearchV42.activateInline('+i+')"><span class="v42-result-icon" aria-hidden="true">'+esc(iconFor(r.group))+'</span><span class="v42-result-main"><b>'+esc(r.title)+'</b><small>'+esc(r.group+' · '+String(r.detail||"").slice(0,110))+'</small></span><span class="v42-result-group">'+esc(r.group)+'</span></button>').join("");return true;
  }

  function keyboard(event){
    const target=event.target,editing=target&&((target.tagName==="INPUT")||(target.tagName==="TEXTAREA")||(target.tagName==="SELECT")||target.isContentEditable);
    if((event.ctrlKey||event.metaKey)&&String(event.key).toLowerCase()==="k"){event.preventDefault();v42Open();return;}
    if(event.key==="/"&&!editing&&!event.ctrlKey&&!event.metaKey&&!event.altKey){event.preventDefault();v42Open();return;}
    if(event.key==="Escape"&&$("v42GlobalSearch")?.classList.contains("open")){event.preventDefault();v42Close();}
  }
  function bindNavigation(){
    if(originalGo&&!window.go.__v42Wrapped){
      const wrapped=function(id){const result=originalGo.apply(this,arguments);recordScreen(id);return result;};wrapped.__v42Wrapped=true;window.go=wrapped;
    }
    document.addEventListener("yks:navigation-after",()=>{const active=document.querySelector(".screen.active");if(active?.id)recordScreen(active.id);});
    const active=document.querySelector(".screen.active");if(active?.id)recordScreen(active.id);
  }
  function start(){ensureUI();bindNavigation();document.addEventListener("keydown",keyboard);window.openGlobalSearch=v42Open;window.runSearch=v42RunInline;}

  window.YKSGlobalSearchV42={version:VERSION,open:v42Open,close:v42Close,search:v42Search,activateInline:inlineActivate,recordScreen};
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start,{once:true});else start();
})();
