/* YKS Defterim · Akıllı Tekrar Merkezi 2.0 · v4.2
   Kullanıcı eylemleri tekrar önerisini yönetir; Program verisine otomatik dokunmaz. */
(function(root,factory){
  const api=factory();
  if(typeof module!=="undefined"&&module.exports)module.exports=api;
  root.YKSRepeatCenterV42=api;
  if(root&&root.document)api.install(root);
})(typeof globalThis!=="undefined"?globalThis:this,function(){
  "use strict";
  const VERSION="2.0.0",STATE_KEY="intelRepeatV42",FALLBACK_KEY="yks_repeat_actions_v42";
  const num=(value,fallback=0)=>Number.isFinite(Number(value))?Number(value):fallback;
  const text=value=>String(value==null?"":value).trim();
  const iso=value=>/^\d{4}-\d{2}-\d{2}$/.test(text(value))?text(value):"";
  function dayNumber(value){const key=iso(value);if(!key)return null;const [y,m,d]=key.split("-").map(Number);return Date.UTC(y,m-1,d)/86400000;}
  function daysBetween(from,to){const a=dayNumber(from),b=dayNumber(to);return a==null||b==null?null:b-a;}
  function addDays(value,amount){const n=dayNumber(value);if(n==null)return "";return new Date((n+Math.trunc(num(amount))) * 86400000).toISOString().slice(0,10);}
  function topicKey(subject,topic){return text(subject).toLocaleLowerCase("tr-TR")+"|"+text(topic).toLocaleLowerCase("tr-TR");}
  function latestGeneralExam(state){
    const rows=Array.isArray(state&&state.denemeler)?state.denemeler.filter(x=>x&&x.type!=="BRANS"&&iso(x.date)):[];
    rows.sort((a,b)=>iso(a.date).localeCompare(iso(b.date))||num(a.id)-num(b.id));
    return rows[rows.length-1]||null;
  }
  function latestExamEvidence(state){
    const exam=latestGeneralExam(state),keys=new Set();
    if(!exam)return {exam:null,keys};
    for(const wrong of (Array.isArray(state&&state.wrongLog)?state.wrongLog:[])){
      if(wrong&&wrong.deneme===exam.id){
        const key=topicKey(wrong.subject,wrong.topic);
        if(key!=="|")keys.add(key);
      }
    }
    return {exam,keys};
  }
  function normalizeActions(value){
    const source=value&&typeof value==="object"&&!Array.isArray(value)?value:{},out={};
    for(const [key,raw] of Object.entries(source)){
      if(!key||!raw||typeof raw!=="object"||Array.isArray(raw))continue;
      const status=raw.status==="done"?"done":raw.status==="deferred"?"deferred":"";
      const at=iso(raw.at),until=iso(raw.until);
      if(!status||!at||!until)continue;
      out[key]={status,at,until,subject:text(raw.subject).slice(0,80),topic:text(raw.topic).slice(0,120)};
    }
    return out;
  }
  function uniqueReasons(values){
    const out=[];
    for(const value of values){const item=text(value);if(item&&!out.includes(item))out.push(item);}
    return out;
  }
  function enrichRecommendation(row,state,today,evidence){
    const subject=text(row&&row.subject),topic=text(row&&row.topic),key=topicKey(subject,topic),wrong=row&&row.wrong&&typeof row.wrong==="object"?row.wrong:{};
    const repeatDays=Math.max(0,num(wrong.repeatDays)),wrongTotal=Math.max(0,num(wrong.total)),wrongLast=iso(wrong.last);
    const studyAge=Number.isFinite(Number(row&&row.studyAge))?Math.max(0,Math.round(Number(row.studyAge))):null;
    const dueLate=Math.max(0,Math.round(num(row&&row.dueLate))),conf=Math.max(0,Math.round(num(row&&row.conf))),st=Math.max(0,Math.round(num(row&&row.st)));
    const latestExamWrong=evidence.keys.has(key),latestExamDate=evidence.exam?iso(evidence.exam.date):"";
    const wrongAge=wrongLast?daysBetween(wrongLast,today):null;
    let score=Math.max(0,num(row&&row.score));
    const reasons=[];
    if(repeatDays>=2){score+=Math.min(25,12+(repeatDays-2)*5);reasons.push(repeatDays+" farklı günde yanlış");}
    else if(wrongTotal>0)reasons.push(wrongTotal+" yanlış kaydı");
    if(latestExamWrong){score+=26;reasons.push("son denemede yanlış");}
    if(wrongAge!=null&&wrongAge>=0&&wrongAge<=3)score+=10;
    else if(wrongAge!=null&&wrongAge<=7)score+=6;
    if(studyAge!=null&&studyAge>=14){score+=Math.min(24,8+Math.floor((studyAge-14)/7)*3);reasons.push(studyAge+" gündür tekrar edilmedi");}
    if(dueLate>0){score+=Math.min(16,6+Math.floor(dueLate/2));reasons.push(dueLate+" gün gecikmiş tekrar");}
    if(conf>0&&conf<=2){score+=8;reasons.push("güven "+conf+"/5");}
    if(st===1){score+=6;reasons.push("konu öğrenme aşamasında");}
    else if(st===2){score+=3;reasons.push("konu pekiştirme aşamasında");}
    for(const reason of (Array.isArray(row&&row.reasons)?row.reasons:[]))reasons.push(reason);
    const finalScore=Math.round(score),severity=finalScore>=90?"must":finalScore>=60?"priority":"soon";
    return Object.assign({},row,{key,subject,topic,score:finalScore,severity,label:severity==="must"?"TEKRAR ETMEN ŞART":severity==="priority"?"ÖNCELİKLİ TEKRAR":"YAKINDA TEKRAR",reasons:uniqueReasons(reasons).slice(0,5),wrongLast,latestExamWrong,latestExamDate,studyAge,dueLate,conf,st});
  }
  function actionBucket(row,action,today){
    if(!action)return "active";
    const newerWrong=!!(row.wrongLast&&action.at&&row.wrongLast>action.at);
    const newerExam=!!(row.latestExamWrong&&row.latestExamDate&&action.at&&row.latestExamDate>action.at);
    if(newerWrong||newerExam)return "active";
    if(action.until>=today)return action.status==="done"?"completed":"deferred";
    return "active";
  }
  function buildRepeatCenter(recommendations,state,today,actions){
    const day=iso(today)||new Date().toISOString().slice(0,10),normalized=normalizeActions(actions),evidence=latestExamEvidence(state||{});
    const all=(Array.isArray(recommendations)?recommendations:[]).map(row=>enrichRecommendation(row,state||{},day,evidence))
      .filter(row=>row.subject&&row.topic)
      .sort((a,b)=>b.score-a.score||num(b.wrong&&b.wrong.repeatDays)-num(a.wrong&&a.wrong.repeatDays)||a.subject.localeCompare(b.subject,"tr"));
    const active=[],deferred=[],completed=[];
    for(const row of all){
      const action=normalized[row.key],bucket=actionBucket(row,action,day),item=Object.assign({},row,{action:action||null});
      if(bucket==="completed")completed.push(item);else if(bucket==="deferred")deferred.push(item);else active.push(item);
    }
    return {version:VERSION,today:day,all,active,deferred,completed,stats:{active:active.length,deferred:deferred.length,completed:completed.length,total:all.length}};
  }
  function snapshotSchedule(state){return JSON.stringify({weeks:state&&state.weeks||{},rows:state&&state.rows||{},rowLabels:state&&state.rowLabels||{}});}
  function selfTest(){
    const today="2026-08-30",state={weeks:{w:1},rows:{r:2},rowLabels:{r:["09:00"]},denemeler:[{id:7,type:"TYT",date:"2026-08-29",totalNet:80}],wrongLog:[
      {subject:"Matematik",topic:"Problemler",n:2,date:"2026-08-29",deneme:7},{subject:"Matematik",topic:"Problemler",n:2,date:"2026-08-20"},{subject:"Matematik",topic:"Problemler",n:1,date:"2026-08-10"}
    ]},rows=[{subject:"Matematik",topic:"Problemler",score:55,reasons:[],studyAge:14,dueLate:2,conf:2,st:2,wrong:{total:5,repeatDays:3,last:"2026-08-29"}}],before=snapshotSchedule(state);
    const first=buildRepeatCenter(rows,state,today,{}),done=buildRepeatCenter(rows,state,today,{"matematik|problemler":{status:"done",at:today,until:addDays(today,7)}}),deferred=buildRepeatCenter(rows,state,today,{"matematik|problemler":{status:"deferred",at:today,until:addDays(today,3)}}),after=snapshotSchedule(state);
    const reasons=first.active[0]&&first.active[0].reasons||[];
    return {ok:first.active.length===1&&reasons.includes("3 farklı günde yanlış")&&reasons.includes("son denemede yanlış")&&reasons.includes("14 gündür tekrar edilmedi")&&done.completed.length===1&&deferred.deferred.length===1&&before===after,programUntouched:before===after};
  }

  function install(root){
    if(root.__YKS_SMART_REPEAT_V42__)return true;
    const doc=root.document;if(!doc)return false;
    let attempts=0,pending=false,lastSnapshot=null;
    const safe=value=>typeof root.esc==="function"?root.esc(text(value)):text(value).replace(/[&<>"]/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[char]));
    const currentDay=()=>typeof root.todayKey==="function"?root.todayKey():new Date().toISOString().slice(0,10);
    function currentState(){
      if(root.S&&typeof root.S==="object")return root.S;
      try{return JSON.parse(root.localStorage&&root.localStorage.getItem("yks")||"{}")||{};}catch{return {};}
    }
    function fallbackActions(){
      try{return normalizeActions(JSON.parse(root.localStorage&&root.localStorage.getItem(FALLBACK_KEY)||"{}"));}catch{return {};}
    }
    function actionsFromState(state){
      const block=state&&state[STATE_KEY];
      if(block&&typeof block==="object"&&!Array.isArray(block)&&block.actions)return normalizeActions(block.actions);
      return fallbackActions();
    }
    function pruneActions(actions,today){
      const rows=Object.entries(normalizeActions(actions)).filter(([,action])=>{
        const age=daysBetween(action.at,today);return age==null||age<=180;
      }).sort((a,b)=>b[1].at.localeCompare(a[1].at)).slice(0,250);
      return Object.fromEntries(rows);
    }
    function persistActions(actions){
      const state=currentState(),day=currentDay(),clean=pruneActions(actions,day);
      if(state&&typeof state==="object"&&root.S===state){
        state[STATE_KEY]={version:1,actions:clean};
        try{
          if(typeof root.save==="function"&&root.save()!==false){
            try{root.localStorage&&root.localStorage.removeItem(FALLBACK_KEY);}catch{}
            return true;
          }
        }catch(error){try{if(typeof root.infraError==="function")root.infraError("repeat-v42-save",error);}catch{}}
      }
      try{root.localStorage&&root.localStorage.setItem(FALLBACK_KEY,JSON.stringify(clean));return true;}catch{return false;}
    }
    function baseRecommendations(){
      try{return root.YKSStudyIntelligence&&typeof root.YKSStudyIntelligence.getRecommendations==="function"?root.YKSStudyIntelligence.getRecommendations():[];}catch{return [];}
    }
    function injectStyle(){
      if(doc.getElementById("yks-smart-repeat-v42-style"))return;
      const style=doc.createElement("style");style.id="yks-smart-repeat-v42-style";
      style.textContent=`
#intelRepeatCenter[data-repeat-v42="ready"]{overflow:visible}
.intel-repeat-summary{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin:0 0 14px}
.intel-repeat-stat{padding:10px 12px;border:1px solid var(--line);border-radius:14px;background:color-mix(in srgb,var(--card) 92%,var(--accent) 8%)}
.intel-repeat-stat b{display:block;font-size:20px;line-height:1}.intel-repeat-stat small{display:block;margin-top:5px;color:var(--label-3);font-size:11px;font-weight:750}
.intel-repeat-row{padding:13px 0;border-top:1px solid var(--line)}.intel-repeat-row:first-of-type{border-top:0}
.intel-repeat-top{display:grid;grid-template-columns:auto minmax(0,1fr) auto;gap:10px;align-items:start}
.intel-repeat-copy{min-width:0}.intel-repeat-evidence{display:flex;flex-wrap:wrap;gap:5px;margin-top:7px}
.intel-repeat-evidence span{padding:4px 7px;border-radius:999px;background:var(--soft);color:var(--label-2);font-size:10.5px;font-weight:750;line-height:1.25}
.intel-repeat-actions{display:flex;flex-wrap:wrap;gap:7px;margin:9px 0 0 38px}
.intel-repeat-actions button{min-height:36px;padding:7px 10px;border-radius:10px}
.intel-repeat-actions .is-done{border-color:color-mix(in srgb,var(--accent) 48%,var(--line));font-weight:850}
.intel-repeat-history{margin-top:12px;border-top:1px solid var(--line);padding-top:10px}
.intel-repeat-history summary{cursor:pointer;color:var(--label-2);font-size:12px;font-weight:800;list-style-position:inside}
.intel-repeat-history[open] summary{margin-bottom:5px}.intel-repeat-history .intel-repeat-row{opacity:.82}
.intel-repeat-until{margin-top:4px;color:var(--label-3);font-size:11px}
#intelRepeatCenter button:focus-visible,#intelRepeatCenter summary:focus-visible{outline:3px solid color-mix(in srgb,var(--accent) 38%,transparent);outline-offset:2px}
@media(max-width:720px){.intel-repeat-summary{grid-template-columns:repeat(3,minmax(0,1fr))}.intel-repeat-stat{padding:9px 8px}.intel-repeat-stat b{font-size:18px}.intel-repeat-top{grid-template-columns:auto minmax(0,1fr)}.intel-repeat-top>.intel-badge{grid-column:2;justify-self:start}.intel-repeat-actions{margin-left:38px}}
@media(max-width:390px){.intel-repeat-summary{grid-template-columns:1fr}.intel-repeat-actions{margin-left:0}.intel-repeat-top{grid-template-columns:1fr}.intel-repeat-top>.intel-rank{display:none}.intel-repeat-top>.intel-badge{grid-column:auto}}
@media(pointer:coarse){.intel-repeat-actions button{min-height:44px;padding:9px 12px}}
@media(prefers-reduced-motion:reduce){#intelRepeatCenter *,#intelRepeatCenter *::before,#intelRepeatCenter *::after{scroll-behavior:auto!important;transition:none!important;animation:none!important}}`;
      doc.head.appendChild(style);
    }
    function rowMarkup(row,index,mode){
      const action=row.action,until=action&&action.until;
      const controls=mode==="active"
        ?'<button class="btn ghost tiny is-done" type="button" data-repeat-v42-action="done" data-repeat-v42-key="'+safe(row.key)+'" data-repeat-v42-subject="'+safe(row.subject)+'" data-repeat-v42-topic="'+safe(row.topic)+'">Tamamladım</button><button class="btn ghost tiny" type="button" data-repeat-v42-action="defer" data-repeat-v42-key="'+safe(row.key)+'" data-repeat-v42-subject="'+safe(row.subject)+'" data-repeat-v42-topic="'+safe(row.topic)+'">3 gün ertele</button>'
        :'<button class="btn ghost tiny" type="button" data-repeat-v42-action="undo" data-repeat-v42-key="'+safe(row.key)+'">Geri al</button>';
      const evidence=(row.reasons||[]).map(reason=>'<span>'+safe(reason)+'</span>').join("");
      const untilText=mode==="deferred"&&until?'<div class="intel-repeat-until">'+safe(until)+' tarihine kadar ertelendi.</div>':mode==="completed"&&until?'<div class="intel-repeat-until">Tamamlandı · '+safe(until)+' tarihine kadar yeniden öne çıkarılmaz; yeni yanlış olursa hemen geri gelir.</div>':"";
      return '<div class="intel-repeat-row" data-repeat-v42-row="'+safe(row.key)+'"><div class="intel-repeat-top"><span class="intel-rank">'+(index+1)+'</span><div class="intel-repeat-copy"><div class="intel-title">'+safe(row.subject+' · '+row.topic)+'</div><div class="intel-repeat-evidence">'+evidence+'</div>'+untilText+'</div><span class="intel-badge '+safe(row.severity)+'">'+safe(row.label)+'</span></div><div class="intel-repeat-actions">'+controls+'</div></div>';
    }
    function syncCommandCenter(top){
      const box=doc.getElementById("intelCommandCenter");if(!box)return;
      const metrics=[...box.querySelectorAll(".intel-metric")],target=metrics.find(item=>item.querySelector("small")?.textContent?.trim()==="En kritik tekrar");
      const value=target&&target.querySelector("b");if(value)value.textContent=top?top.subject+" · "+top.topic:"Belirgin sinyal yok";
      const note=box.querySelector(".intel-note");
      if(note){
        if(top){note.hidden=false;note.innerHTML="<strong>"+safe(top.label)+":</strong> "+safe((top.reasons||[]).join(" · "));}
        else note.hidden=true;
      }
    }
    function render(){
      const base=root.YKSStudyIntelligence;
      if(!base||typeof base.getRecommendations!=="function"){
        if(attempts++<20)root.setTimeout(render,80);
        return false;
      }
      let box=doc.getElementById("intelRepeatCenter");
      if(!box&&typeof base.render==="function"){try{base.render();}catch{}box=doc.getElementById("intelRepeatCenter");}
      if(!box)return false;
      injectStyle();
      const state=currentState(),day=currentDay(),actions=actionsFromState(state),center=buildRepeatCenter(baseRecommendations(),state,day,actions);
      lastSnapshot=center;
      const heading=doc.querySelector('h2[data-intel-for="intelRepeatCenter"]');if(heading)heading.textContent="Akıllı Tekrar Merkezi 2.0";
      const active=center.active.slice(0,8),deferred=center.deferred.slice(0,6),completed=center.completed.slice(0,6);
      const activeHtml=active.length?active.map((row,index)=>rowMarkup(row,index,"active")).join(""):'<div class="empty">Şu an bekleyen güçlü tekrar sinyali yok. Ertelediğin veya tamamladığın öneriler aşağıdaki geçmişte tutulur.</div>';
      const history=(deferred.length||completed.length)?'<details class="intel-repeat-history"><summary>Ertelenen '+center.stats.deferred+' · tamamlanan '+center.stats.completed+'</summary>'+(deferred.length?'<div class="intel-note"><strong>Ertelenenler</strong> · Süresi dolunca tekrar aktif listeye gelir.</div>'+deferred.map((row,index)=>rowMarkup(row,index,"deferred")).join(""):"")+(completed.length?'<div class="intel-note"><strong>Tamamlananlar</strong> · Yeni bir yanlış kaydı oluşursa bekleme süresi iptal edilir.</div>'+completed.map((row,index)=>rowMarkup(row,index,"completed")).join(""):"")+'</details>':"";
      box.dataset.repeatV42="ready";
      box.innerHTML='<div class="intel-head"><div><h3>Kanıta göre sıralanmış tekrarlar</h3><p>Hata sıklığı, son çalışma, güven, deneme yanlışı ve konu sağlığını birlikte değerlendirir.</p></div><span class="intel-badge soon">v4.2</span></div><div class="intel-repeat-summary"><div class="intel-repeat-stat"><b>'+center.stats.active+'</b><small>Bekleyen</small></div><div class="intel-repeat-stat"><b>'+center.stats.deferred+'</b><small>Ertelenen</small></div><div class="intel-repeat-stat"><b>'+center.stats.completed+'</b><small>Tamamlanan</small></div></div>'+activeHtml+history+'<div class="intel-note"><strong>Programına dokunmaz.</strong> Tamamla/ertele yalnız tekrar önerisini yönetir; Program’a otomatik ders veya görev eklemez, silmez ya da düzenlemez.</div><div class="intel-actions"><button class="btn ghost tiny" type="button" data-repeat-v42-action="topics">Konuları aç</button></div>';
      box.onclick=event=>{
        const button=event.target instanceof root.Element?event.target.closest("[data-repeat-v42-action]"):null;
        if(!button||!box.contains(button))return;
        const action=button.dataset.repeatV42Action;
        if(action==="topics"){try{root.go&&root.go("topics");}catch{}return;}
        const key=button.dataset.repeatV42Key;if(!key)return;
        const next=Object.assign({},actionsFromState(currentState()));
        if(action==="undo")delete next[key];
        else{
          const at=currentDay(),status=action==="done"?"done":"deferred",days=status==="done"?7:3;
          next[key]={status,at,until:addDays(at,days),subject:text(button.dataset.repeatV42Subject).slice(0,80),topic:text(button.dataset.repeatV42Topic).slice(0,120)};
        }
        const ok=persistActions(next);
        try{if(typeof root.toast==="function")root.toast(ok?(action==="done"?"Tekrar tamamlandı olarak işaretlendi":action==="defer"?"Tekrar 3 gün ertelendi":"Tekrar önerisi yeniden aktifleştirildi"):"Tekrar durumu kaydedilemedi");}catch{}
        try{root.dispatchEvent(new root.CustomEvent("yks:repeat-v42-action",{detail:{key,action,at:Date.now()}}));}catch{}
        render();
      };
      syncCommandCenter(center.active[0]||null);
      doc.documentElement.dataset.repeatCenterV42="ready";
      return true;
    }
    function schedule(){
      if(pending)return;pending=true;
      const run=()=>{pending=false;render();};
      if(typeof root.requestAnimationFrame==="function")root.requestAnimationFrame(run);else root.setTimeout(run,0);
    }
    function wrap(name){
      try{
        const original=root[name];if(typeof original!=="function"||original.__repeatV42Wrapped)return;
        const wrapped=function(){const result=original.apply(this,arguments);schedule();return result;};
        wrapped.__repeatV42Wrapped=true;root[name]=wrapped;
      }catch{}
    }
    root.__YKS_SMART_REPEAT_V42__=true;
    root.YKSRepeatCenterV42=Object.assign(root.YKSRepeatCenterV42||{},{render,schedule,getSnapshot:()=>lastSnapshot,selfTest});
    wrap("save");wrap("go");
    root.addEventListener("storage",event=>{if(!event.key||event.key==="yks"||event.key===FALLBACK_KEY)schedule();});
    root.addEventListener("yks:data-primary-ready",schedule);root.addEventListener("yks:navigation-after",schedule);
    doc.addEventListener("visibilitychange",()=>{if(!doc.hidden)schedule();});
    root.setTimeout(schedule,70);root.setTimeout(schedule,470);
    return true;
  }

  return {version:VERSION,stateKey:STATE_KEY,fallbackKey:FALLBACK_KEY,topicKey,addDays,normalizeActions,latestGeneralExam,buildRepeatCenter,snapshotSchedule,selfTest,install};
});