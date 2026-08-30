/* YKS Defterim · v4.2 Aşama 3 · Hata Defteri ↔ Konular ↔ Öğrenme Laboratuvarı
   Salt-okunur bağlantı katmanı: Program verisini değiştirmez. */
(function(root,factory){
  const api=factory();
  if(typeof module!=="undefined"&&module.exports)module.exports=api;
  root.YKSErrorTopicLabV42=api;
  if(root&&root.document)api.install(root);
})(typeof globalThis!=="undefined"?globalThis:this,function(){
  "use strict";
  const VERSION="1.0.0",FIX_NOTE_KEY="yks_error_fix_notes_v3";
  const KIND_LABEL={bilmiyordum:"Bilgi eksiği",dikkat:"Dikkat",sure:"Süre",islem:"İşlem",yorum:"Yorum"};
  const text=value=>String(value==null?"":value).trim();
  const norm=value=>text(value).toLocaleLowerCase("tr-TR").replace(/\s+/g," ");
  const iso=value=>/^\d{4}-\d{2}-\d{2}$/.test(text(value))?text(value):"";
  const topicKey=(subject,topic)=>norm(subject)+"|"+norm(topic);
  function dateKeyFromMs(value){const n=Number(value);return Number.isFinite(n)&&n>0?new Date(n).toISOString().slice(0,10):"";}
  function sameTopic(row,subject,topic){return !!row&&norm(row.subject)===norm(subject)&&norm(row.topic)===norm(topic);}
  function buildTopicBridge(state,fixNotes,subject,topic){
    const source=state&&typeof state==="object"?state:{},wrongLog=Array.isArray(source.wrongLog)?source.wrongLog:[],journal=Array.isArray(source.errorJournal)?source.errorJournal:[];
    const wrongRows=wrongLog.filter(row=>sameTopic(row,subject,topic)),journalRows=journal.filter(row=>sameTopic(row,subject,topic));
    const wrongIds=new Set(wrongRows.map(row=>row&&row.id!=null?String(row.id):"").filter(Boolean)),events=[];
    for(const row of wrongRows){
      const date=iso(row.date);if(!date)continue;
      events.push({date,count:Math.max(1,Number(row.n)||1),label:KIND_LABEL[text(row.kind)]||"Yanlış kaydı",source:"Deneme / yanlış kaydı",resolved:false});
    }
    for(const row of journalRows){
      const ref=text(row.sourceRef),linked=ref.startsWith("wrong:")&&wrongIds.has(ref.slice(6));if(linked)continue;
      const date=iso(row.date)||dateKeyFromMs(row.createdAt);if(!date)continue;
      events.push({date,count:Math.max(1,Number(row.count)||1),label:text(row.type)||"Hata Defteri",source:text(row.source)||"Hata Defteri",resolved:!!row.resolved});
    }
    const grouped=new Map();
    for(const event of events){
      let row=grouped.get(event.date);if(!row){row={date:event.date,count:0,labels:[],sources:[],open:0};grouped.set(event.date,row);}
      row.count+=event.count;if(event.label&&!row.labels.includes(event.label))row.labels.push(event.label);if(event.source&&!row.sources.includes(event.source))row.sources.push(event.source);if(!event.resolved)row.open+=event.count;
    }
    const timeline=[...grouped.values()].sort((a,b)=>b.date.localeCompare(a.date));
    const notes=fixNotes&&typeof fixNotes==="object"&&!Array.isArray(fixNotes)?fixNotes:{};
    const fixNote=text(notes[topicKey(subject,topic)]).slice(0,900);
    const journalNotes=[];
    for(const row of journalRows.slice().sort((a,b)=>(Number(b.createdAt)||0)-(Number(a.createdAt)||0))){const note=text(row.note);if(note&&!journalNotes.includes(note))journalNotes.push(note.slice(0,400));if(journalNotes.length>=3)break;}
    return {subject:text(subject),topic:text(topic),wrongTotal:wrongRows.reduce((sum,row)=>sum+Math.max(1,Number(row&&row.n)||1),0),journalCount:journalRows.length,openJournal:journalRows.filter(row=>row&&!row.resolved).length,differentDays:timeline.length,timeline,fixNote,journalNotes,hasEvidence:!!(timeline.length||fixNote||journalNotes.length)};
  }
  function normalizeSubject(value){return norm(value).replace(/\s*\((?:ayt|tyt|ydt)\)\s*$/i,"").replace(/^temel\s+/,"");}
  function resolveCatalogItem(catalogs,subject,topic,examHint){
    const exams=["TYT","AYT","YDT"],all=[];
    for(const exam of exams){for(const item of (catalogs&&Array.isArray(catalogs[exam])?catalogs[exam]:[]))if(item)all.push(item);}
    const t=norm(topic),s=norm(subject),hint=exams.includes(text(examHint).toUpperCase())?text(examHint).toUpperCase():"";
    let rows=all.filter(item=>(!hint||item.exam===hint)&&norm(item.subject)===s&&norm(item.topic)===t);if(rows.length===1)return rows[0];
    rows=all.filter(item=>(!hint||item.exam===hint)&&normalizeSubject(item.subject)===normalizeSubject(subject)&&norm(item.topic)===t);if(rows.length===1)return rows[0];
    rows=all.filter(item=>(!hint||item.exam===hint)&&norm(item.topic)===t);return rows.length===1?rows[0]:null;
  }
  function selfTest(){
    const state={wrongLog:[{id:4,subject:"Fizik",topic:"Optik",n:2,date:"2026-08-20",kind:"dikkat"},{id:5,subject:"Fizik",topic:"Optik",n:1,date:"2026-08-27",kind:"bilmiyordum"}],errorJournal:[{id:"e1",subject:"Fizik",topic:"Optik",count:2,createdAt:Date.UTC(2026,7,20),sourceRef:"wrong:4",note:"Aynayı önce çiz.",resolved:false},{id:"e2",subject:"Fizik",topic:"Optik",count:1,createdAt:Date.UTC(2026,7,29),source:"Manuel",note:"İşaret kuralını kontrol et.",resolved:false}]};
    const bridge=buildTopicBridge(state,{"fizik|optik":"Işınları eksene göre çiz."},"Fizik","Optik"),catalogs={TYT:[{exam:"TYT",subject:"Fizik",topic:"Optik",subjectIndex:3,topicIndex:9}],AYT:[],YDT:[]},hit=resolveCatalogItem(catalogs,"Fizik","Optik","");
    return {ok:bridge.wrongTotal===3&&bridge.differentDays===3&&bridge.timeline.length===3&&bridge.fixNote.includes("Işınları")&&bridge.journalNotes.length===2&&hit&&hit.exam==="TYT",bridge,hit};
  }

  function install(root){
    if(root.__YKS_ERROR_TOPIC_LAB_V42__)return true;
    const doc=root.document;if(!doc)return false;
    let currentTopic=null,intelObserver=null,intelRetries=0;
    const safe=value=>typeof root.esc==="function"?root.esc(text(value)):text(value).replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
    function state(){if(root.S&&typeof root.S==="object")return root.S;try{return JSON.parse(root.localStorage?.getItem("yks")||"{}")||{};}catch{return {};}}
    function fixNotes(){try{const value=JSON.parse(root.localStorage?.getItem(FIX_NOTE_KEY)||"{}");return value&&typeof value==="object"&&!Array.isArray(value)?value:{};}catch{return {};}}
    function catalogs(){const out={TYT:[],AYT:[],YDT:[]};for(const exam of Object.keys(out)){try{out[exam]=root.YKSLearningLab?.topicCatalog?.(exam)||[];}catch{out[exam]=[];}}return out;}
    function examHintFor(subject,topic,journalItem){
      const st=state(),id=journalItem&&journalItem.denemeId;if(id!=null){const exam=(Array.isArray(st.denemeler)?st.denemeler:[]).find(row=>row&&row.id===id);if(exam&&["TYT","AYT","YDT"].includes(exam.type))return exam.type;}
      const related=(Array.isArray(st.wrongLog)?st.wrongLog:[]).filter(row=>sameTopic(row,subject,topic)&&row.deneme!=null).sort((a,b)=>String(b.date||"").localeCompare(String(a.date||"")))[0];
      if(related){const exam=(Array.isArray(st.denemeler)?st.denemeler:[]).find(row=>row&&row.id===related.deneme);if(exam&&["TYT","AYT","YDT"].includes(exam.type))return exam.type;}
      return "";
    }
    function resolveMeta(subject,topic,examHint){
      const hit=resolveCatalogItem(catalogs(),subject,topic,examHint);if(hit)return hit;
      try{
        if(typeof root.topicKeyOf==="function"){
          const key=root.topicKeyOf(subject,topic);if(key){const parts=String(key).split("|");return {exam:parts[0]||"",subject:parts[1]||subject,topic:parts.slice(2).join("|")||topic,subjectIndex:null,topicIndex:null};}
        }
      }catch{}
      return null;
    }
    function toast(message){try{if(typeof root.toast==="function")root.toast(message);}catch{}}
    function openTopic(subject,topic,examHint){
      const hit=resolveMeta(subject,topic,examHint);if(!hit){toast("Bu hata için eşleşen müfredat konusu bulunamadı");return false;}
      try{root.go?.("topics");root.setTimeout(()=>{try{root.openTopicDetail?.(hit.exam,hit.subject,hit.topic);}catch{}},70);return true;}catch{return false;}
    }
    function openMoreLab(after){
      try{if(typeof root.v30OpenMore==="function")root.v30OpenMore("lab");else{root.go?.("more");root.setMoreTab?.("lab");}}catch{root.go?.("more");}
      root.setTimeout(()=>{try{after?.();}catch(error){try{root.infraError?.("error-topic-lab-v42-nav",error);}catch{}}},120);
    }
    function openLab(subject,topic,examHint){
      const hit=resolveMeta(subject,topic,examHint);if(!hit||!Number.isInteger(Number(hit.subjectIndex))||!Number.isInteger(Number(hit.topicIndex))){toast("Bu konu için Laboratuvar rehberi bulunamadı");return false;}
      openMoreLab(()=>{root.v320SetExam?.(hit.exam||"TYT");root.setTimeout(()=>root.v4OpenLabTopic?.(Number(hit.subjectIndex),Number(hit.topicIndex)),40);});return true;
    }
    function latestJournalEntry(subject,topic){return (Array.isArray(state().errorJournal)?state().errorJournal:[]).filter(row=>sameTopic(row,subject,topic)).sort((a,b)=>(Number(b.createdAt)||0)-(Number(a.createdAt)||0))[0]||null;}
    function openJournal(subject,topic){
      const item=latestJournalEntry(subject,topic);try{root.closeTopicDetail?.();}catch{}
      if(item&&typeof root.errorJournalOpen==="function"){root.errorJournalOpen(item.id);return true;}
      try{root.go?.("deneme");root.setAnaTab?.("verim");root.setTimeout(()=>{const box=doc.getElementById("intelErrorJournal3");box?.scrollIntoView?.({behavior:"smooth",block:"center"});},100);return true;}catch{return false;}
    }
    function formatDate(value){const key=iso(value);if(!key)return value;try{return new Date(key+"T12:00:00").toLocaleDateString("tr-TR",{day:"numeric",month:"short",year:"numeric"});}catch{return key;}}
    function injectStyle(){
      if(doc.getElementById("v42ErrorTopicLabStyle"))return;
      const style=doc.createElement("style");style.id="v42ErrorTopicLabStyle";style.textContent=`
.v42-error-links{display:flex;flex-wrap:wrap;gap:6px;margin-top:7px}.v42-error-link{min-height:30px;padding:5px 8px;border:1px solid var(--line);border-radius:9px;background:var(--card);color:var(--accent);font:800 10px/1.2 inherit;cursor:pointer}
.error-journal-meta .v42-error-link{margin-left:0}.v42-topic-error-bridge{margin-top:14px;padding:14px;border:1px solid color-mix(in srgb,var(--accent) 18%,var(--line));border-radius:18px;background:color-mix(in srgb,var(--card) 95%,var(--accent) 5%)}
.v42-topic-error-head{display:flex;align-items:flex-start;justify-content:space-between;gap:10px}.v42-topic-error-head small,.v42-topic-error-head b{display:block}.v42-topic-error-head small{color:var(--accent);font-size:9px;font-weight:900;letter-spacing:.06em;text-transform:uppercase}.v42-topic-error-head b{margin-top:3px;font-size:14px}.v42-topic-error-stats{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:7px;margin-top:10px}.v42-topic-error-stat{padding:9px;border-radius:11px;background:var(--fill);text-align:center}.v42-topic-error-stat b{display:block;font-size:17px}.v42-topic-error-stat span{display:block;margin-top:2px;color:var(--label-3);font-size:9px}
.v42-error-timeline{display:grid;gap:7px;margin-top:11px}.v42-error-day{display:grid;grid-template-columns:88px minmax(0,1fr) auto;gap:8px;align-items:center;padding:8px 9px;border:1px solid var(--line);border-radius:11px;background:var(--card)}.v42-error-day time{font-size:10px;font-weight:850}.v42-error-day span{min-width:0;color:var(--label-2);font-size:10px;line-height:1.35}.v42-error-day b{font-size:10px;white-space:nowrap}
.v42-fix-readonly{margin-top:10px;padding:10px 11px;border-left:3px solid var(--accent);border-radius:10px;background:var(--fill)}.v42-fix-readonly small{display:block;color:var(--label-3);font-size:9px;font-weight:850;text-transform:uppercase;letter-spacing:.05em}.v42-fix-readonly p{margin:4px 0 0;color:var(--label-1);font-size:11px;line-height:1.5;white-space:pre-wrap}.v42-journal-note-list{display:grid;gap:5px;margin-top:8px}.v42-journal-note-list p{margin:0;padding:7px 9px;border-radius:9px;background:var(--card);color:var(--label-2);font-size:10px;line-height:1.4}
.v42-topic-error-actions{display:flex;flex-wrap:wrap;gap:7px;margin-top:11px}.v42-topic-error-actions button{min-height:36px}.v42-error-link:focus-visible,.v42-topic-error-actions button:focus-visible{outline:3px solid color-mix(in srgb,var(--accent) 36%,transparent);outline-offset:2px}
@media(max-width:620px){.v42-topic-error-stats{grid-template-columns:1fr 1fr 1fr}.v42-error-day{grid-template-columns:1fr auto}.v42-error-day span{grid-column:1/-1;grid-row:2}.v42-topic-error-actions{display:grid;grid-template-columns:1fr 1fr}.v42-topic-error-actions button{width:100%}}
@media(max-width:390px){.v42-topic-error-stats{grid-template-columns:1fr}.v42-topic-error-actions{grid-template-columns:1fr}.v42-error-day{grid-template-columns:1fr}}
@media(pointer:coarse){.v42-error-link{min-height:40px;padding:8px 10px}.v42-topic-error-actions button{min-height:44px}}
@media(prefers-reduced-motion:reduce){.v42-topic-error-bridge *,.v42-error-links *{scroll-behavior:auto!important;transition:none!important;animation:none!important}}`;
      doc.head.appendChild(style);
    }
    function decorateJournalCards(){
      const st=state();for(const card of doc.querySelectorAll(".error-journal-item[data-error-id]")){
        if(card.dataset.v42Bridge==="1")continue;const item=(Array.isArray(st.errorJournal)?st.errorJournal:[]).find(row=>row&&String(row.id)===String(card.dataset.errorId));if(!item)continue;
        card.dataset.v42Bridge="1";const meta=card.querySelector(".error-journal-meta");if(!meta)continue;const topicButton=meta.querySelector(".ej-topic-link");if(topicButton)topicButton.textContent="Konu detayı";
        const hit=resolveMeta(item.subject,item.topic,examHintFor(item.subject,item.topic,item));if(!hit||!Number.isInteger(Number(hit.subjectIndex))||!Number.isInteger(Number(hit.topicIndex)))continue;
        const button=doc.createElement("button");button.type="button";button.className="v42-error-link";button.textContent="Laboratuvar rehberi";button.onclick=()=>openLab(item.subject,item.topic,hit.exam);meta.insertBefore(button,meta.lastElementChild||null);
      }
    }
    function splitTitle(value){const parts=text(value).split(" · ");if(parts.length<2)return null;return {subject:parts.shift(),topic:parts.join(" · ")};}
    function decorateIntelRows(){
      const box=doc.getElementById("intelErrorJournal3");if(!box)return false;
      for(const row of box.querySelectorAll(".intel-row")){
        if(row.dataset.v42Bridge==="1")continue;const title=row.querySelector(".intel-title"),pair=splitTitle(title?.textContent);if(!pair)continue;row.dataset.v42Bridge="1";
        const copy=title.parentElement;if(!copy)continue;const actions=doc.createElement("div");actions.className="v42-error-links";
        const topicButton=doc.createElement("button");topicButton.type="button";topicButton.className="v42-error-link";topicButton.textContent="Konu detayı";topicButton.onclick=()=>openTopic(pair.subject,pair.topic,examHintFor(pair.subject,pair.topic,null));actions.appendChild(topicButton);
        const hit=resolveMeta(pair.subject,pair.topic,examHintFor(pair.subject,pair.topic,null));if(hit&&Number.isInteger(Number(hit.subjectIndex))&&Number.isInteger(Number(hit.topicIndex))){const labButton=doc.createElement("button");labButton.type="button";labButton.className="v42-error-link";labButton.textContent="Laboratuvar rehberi";labButton.onclick=()=>openLab(pair.subject,pair.topic,hit.exam);actions.appendChild(labButton);}
        copy.appendChild(actions);
      }
      return true;
    }
    function bindIntelObserver(){
      const box=doc.getElementById("intelErrorJournal3");if(!box){if(intelRetries++<20)root.setTimeout(bindIntelObserver,120);return false;}
      decorateIntelRows();if(intelObserver)return true;intelObserver=new root.MutationObserver(()=>decorateIntelRows());intelObserver.observe(box,{childList:true,subtree:true});return true;
    }
    function injectTopicBridge(meta){
      const host=doc.getElementById("v26TopicDetail");if(!host||!meta)return false;host.querySelector("#v42TopicErrorBridge")?.remove();
      const bridge=buildTopicBridge(state(),fixNotes(),meta.subject,meta.topic);if(!bridge.hasEvidence)return false;
      const lab=resolveMeta(meta.subject,meta.topic,meta.exam),timeline=bridge.timeline.slice(0,7).map(day=>'<div class="v42-error-day"><time>'+safe(formatDate(day.date))+'</time><span>'+safe(day.labels.join(" · ")||"Hata kaydı")+'</span><b>'+day.count+' yanlış</b></div>').join("");
      const fix=bridge.fixNote?'<div class="v42-fix-readonly" aria-label="Salt okunur hata düzeltme notu"><small>Düzeltme notu · salt okunur</small><p>'+safe(bridge.fixNote)+'</p></div>':"";
      const journalNotes=bridge.journalNotes.length?'<div class="v42-journal-note-list">'+bridge.journalNotes.map(note=>'<p>'+safe(note)+'</p>').join("")+'</div>':"";
      const section=doc.createElement("section");section.id="v42TopicErrorBridge";section.className="v42-topic-error-bridge";section.innerHTML='<div class="v42-topic-error-head"><div><small>Hata Defteri bağlantısı</small><b>'+safe(meta.subject+' · '+meta.topic)+'</b></div><span class="intel-badge '+(bridge.differentDays>=3?'must':bridge.differentDays>=2?'priority':'soon')+'">'+bridge.differentDays+' gün</span></div><div class="v42-topic-error-stats"><div class="v42-topic-error-stat"><b>'+bridge.wrongTotal+'</b><span>yanlış kaydı</span></div><div class="v42-topic-error-stat"><b>'+bridge.openJournal+'</b><span>açık Hata Defteri</span></div><div class="v42-topic-error-stat"><b>'+bridge.differentDays+'</b><span>farklı gün</span></div></div>'+(timeline?'<div class="v42-error-timeline">'+timeline+'</div>':'')+fix+journalNotes+'<div class="v42-topic-error-actions"><button class="btn ghost tiny" type="button" data-v42-topic-action="journal">Hata Defteri’ni aç</button>'+(lab&&Number.isInteger(Number(lab.subjectIndex))&&Number.isInteger(Number(lab.topicIndex))?'<button class="btn ghost tiny" type="button" data-v42-topic-action="lab">Laboratuvar rehberi</button>':'')+'</div>';
      section.querySelector('[data-v42-topic-action="journal"]')?.addEventListener("click",()=>openJournal(meta.subject,meta.topic));section.querySelector('[data-v42-topic-action="lab"]')?.addEventListener("click",()=>openLab(meta.subject,meta.topic,meta.exam));host.appendChild(section);return true;
    }
    function wrap(name,after){
      const original=root[name];if(typeof original!=="function"||original.__errorTopicLabV42)return false;
      const wrapped=function(){const args=[...arguments],result=original.apply(this,args);try{after(args,result);}catch(error){try{root.infraError?.("error-topic-lab-v42:"+name,error);}catch{}}return result;};wrapped.__errorTopicLabV42=true;wrapped.__original=original;root[name]=wrapped;return true;
    }
    function patch(){
      wrap("errorJournalRender",()=>root.setTimeout(decorateJournalCards,0));
      wrap("openTopicDetail",args=>{currentTopic={exam:text(args[0]),subject:text(args[1]),topic:text(args[2])};root.setTimeout(()=>injectTopicBridge(currentTopic),0);});
      wrap("renderTopicDetail",()=>{if(currentTopic)root.setTimeout(()=>injectTopicBridge(currentTopic),0);});
      wrap("closeTopicDetail",()=>{currentTopic=null;});
      decorateJournalCards();bindIntelObserver();
    }
    injectStyle();patch();root.setTimeout(patch,180);root.setTimeout(patch,520);
    doc.addEventListener("yks:navigation-after",()=>{root.setTimeout(()=>{decorateJournalCards();decorateIntelRows();},0);});
    root.__YKS_ERROR_TOPIC_LAB_V42__=true;
    root.YKSErrorTopicLabV42=Object.assign(root.YKSErrorTopicLabV42||{},{version:VERSION,render:()=>{decorateJournalCards();decorateIntelRows();if(currentTopic)injectTopicBridge(currentTopic);},openTopic,openLab,openJournal,selfTest});
    return true;
  }
  return {version:VERSION,fixNoteKey:FIX_NOTE_KEY,topicKey,buildTopicBridge,resolveCatalogItem,selfTest,install};
});