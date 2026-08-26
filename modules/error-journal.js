/* Kişisel Hata Defteri v2 — tek kullanıcı, deneme + konu + tekrar entegrasyonu */
(function(){
  "use strict";
  if(window.__YKS_ERROR_JOURNAL_V2__)return;
  window.__YKS_ERROR_JOURNAL_V2__=true;

  const TYPES=["Bilgi eksiği","Dikkat","İşlem","Yorum","Süre"];
  const KIND_MAP={bilmiyordum:"Bilgi eksiği",dikkat:"Dikkat",sure:"Süre",islem:"İşlem",yorum:"Yorum"};
  const $=id=>document.getElementById(id);
  const norm=v=>String(v||"").trim();
  const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const jsArg=v=>String(v??"").replace(/\\/g,"\\\\").replace(/'/g,"\\'").replace(/\r?\n/g," ");
  const nowKey=()=>{try{return typeof todayKey==="function"?todayKey():new Date().toISOString().slice(0,10);}catch(e){return new Date().toISOString().slice(0,10);}};

  function journal(){
    if(typeof S!=="object"||!S)return [];
    if(!Array.isArray(S.errorJournal))S.errorJournal=[];
    return S.errorJournal;
  }
  function reviews(){
    if(typeof S!=="object"||!S)return [];
    if(!Array.isArray(S.manualReviews))S.manualReviews=[];
    return S.manualReviews;
  }
  function persist(delay=80){
    try{
      if(typeof perfInvalidateState==="function")perfInvalidateState();
      if(typeof saveSoon==="function")saveSoon(delay);else if(typeof save==="function")save();
    }catch(e){try{if(typeof infraError==="function")infraError("error-journal-save",e);}catch(_){} }
  }
  function toastSafe(msg){try{if(typeof toast==="function")toast(msg);}catch(e){} }
  function entryById(id){return journal().find(x=>x&&x.id===id)||null;}
  function reviewForJournal(id){return reviews().find(r=>r&&r.journalId===id)||reviews().find(r=>r&&r.id==="rev_"+id)||null;}
  function openReviews(){
    const byJournal=new Map(journal().filter(Boolean).map(x=>[x.id,x]));
    return reviews().filter(r=>{
      if(!r||r.completedAt)return false;
      const j=r.journalId?byJournal.get(r.journalId):null;
      return !j||!j.resolved;
    }).sort((a,b)=>(Number(a.createdAt)||0)-(Number(b.createdAt)||0));
  }
  function makeReview(item){
    if(!item||!item.review||item.resolved)return null;
    let r=reviewForJournal(item.id);
    if(r)return r;
    r={id:"rev_"+item.id,journalId:item.id,subject:item.subject,topic:item.topic,source:"Hata Defteri",createdAt:item.createdAt||Date.now(),due:nowKey(),completedAt:0,closedBy:""};
    reviews().unshift(r);return r;
  }
  function closeReviewFor(item,reason){
    const r=item&&reviewForJournal(item.id);if(!r||r.completedAt)return false;
    r.completedAt=Date.now();r.closedBy=reason||"journal-resolved";return true;
  }
  function reopenReviewFor(item){
    if(!item||!item.review||item.resolved)return false;
    let r=reviewForJournal(item.id);
    if(!r){makeReview(item);return true;}
    if(r.completedAt&&r.closedBy==="journal-resolved"){
      r.completedAt=0;r.closedBy="";r.createdAt=Date.now();r.due=nowKey();return true;
    }
    return false;
  }
  function normalizeLegacy(){
    let changed=false;
    journal().forEach(x=>{
      if(!x||typeof x!=="object")return;
      if(!x.id){x.id="err_"+(Number(x.createdAt)||Date.now()).toString(36)+Math.random().toString(36).slice(2,6);changed=true;}
      if(!TYPES.includes(x.type)){x.type=KIND_MAP[x.type]||"Bilgi eksiği";changed=true;}
      if(!Number.isFinite(+x.count)||+x.count<1){x.count=1;changed=true;}
      if(x.review&&!reviewForJournal(x.id)){makeReview(x);changed=true;}
    });
    reviews().forEach(r=>{
      if(!r||typeof r!=="object")return;
      if(!r.journalId&&String(r.id||"").startsWith("rev_err_")){r.journalId=String(r.id).slice(4);changed=true;}
      if(!r.source){r.source="Hata Defteri";changed=true;}
      if(!r.due){r.due=nowKey();changed=true;}
      if(!Number.isFinite(+r.completedAt)){r.completedAt=0;changed=true;}
    });
    if(changed)persist(160);
  }

  function addEntry(data,opts={}){
    const subject=norm(data&&data.subject),topic=norm(data&&data.topic);
    if(!subject||!topic)return null;
    const sourceRef=norm(data&&data.sourceRef);
    if(sourceRef){const old=journal().find(x=>x&&x.sourceRef===sourceRef);if(old)return old;}
    const type=TYPES.includes(data&&data.type)?data.type:(KIND_MAP[norm(data&&data.type)]||"Bilgi eksiği");
    const item={
      id:"err_"+Date.now().toString(36)+Math.random().toString(36).slice(2,7),subject,topic,type,
      note:norm(data&&data.note).slice(0,400),count:Math.max(1,parseInt(data&&data.count,10)||1),
      createdAt:Number(data&&data.createdAt)||Date.now(),resolved:false,resolvedAt:0,
      review:!!(data&&data.review),source:norm(data&&data.source)||"Manuel",sourceRef,
      denemeId:data&&data.denemeId!=null?data.denemeId:null
    };
    journal().unshift(item);if(item.review)makeReview(item);persist();
    if(opts.render!==false)renderAllJournal();
    return item;
  }

  window.errorJournalAdd=function(){
    const subject=norm($("errorJournalSubject")?.value),topic=norm($("errorJournalTopic")?.value),type=norm($("errorJournalType")?.value)||TYPES[0],note=norm($("errorJournalNote")?.value);
    if(!subject||!topic){toastSafe("Ders ve konu gerekli");return false;}
    addEntry({subject,topic,type,note,review:!!$("errorJournalReview")?.checked,source:"Manuel"});
    ["errorJournalSubject","errorJournalTopic","errorJournalNote"].forEach(id=>{const x=$(id);if(x)x.value="";});
    const r=$("errorJournalReview");if(r)r.checked=false;
    toastSafe("Hata Defteri'ne eklendi");return true;
  };

  window.errorJournalToggle=function(id){
    const x=entryById(id);if(!x)return false;
    x.resolved=!x.resolved;x.resolvedAt=x.resolved?Date.now():0;
    if(x.resolved)closeReviewFor(x,"journal-resolved");else reopenReviewFor(x);
    persist();renderAllJournal();toastSafe(x.resolved?"Hata çözüldü olarak işaretlendi":"Hata yeniden açıldı");return true;
  };
  window.errorJournalDelete=function(id){
    const list=journal(),i=list.findIndex(v=>v&&v.id===id);if(i<0)return false;
    if(typeof confirm==="function"&&!confirm("Bu hata kaydını silmek istiyor musun?"))return false;
    for(let j=reviews().length-1;j>=0;j--){const r=reviews()[j];if(r&&(r.journalId===id||r.id==="rev_"+id))reviews().splice(j,1);}
    list.splice(i,1);persist();renderAllJournal();return true;
  };
  window.errorJournalReviewDone=function(reviewId){
    const r=reviews().find(x=>x&&x.id===reviewId);if(!r)return false;
    r.completedAt=Date.now();r.closedBy="review-done";persist();renderIntegrations();toastSafe("Hata Defteri tekrarı tamamlandı");return true;
  };
  window.errorJournalOpen=function(id){
    try{if(typeof go==="function")go("deneme");}catch(e){}
    setTimeout(()=>{window.errorJournalRender();const node=document.querySelector('[data-error-id="'+String(id).replace(/"/g,'\\"')+'"]');if(node){node.scrollIntoView({behavior:"smooth",block:"center"});node.classList.add("is-highlighted");setTimeout(()=>node.classList.remove("is-highlighted"),1400);}},80);
  };
  window.errorJournalOpenTopic=function(id){
    const x=entryById(id);if(!x)return false;
    let key="";try{if(typeof topicKeyOf==="function")key=topicKeyOf(x.subject,x.topic)||"";}catch(e){}
    if(!key){toastSafe("Bu konu müfredatta eşleşmedi");return false;}
    const p=key.split("|"),exam=p[0]||"",subject=p[1]||x.subject,topic=p.slice(2).join("|")||x.topic;
    try{if(typeof go==="function")go("topics");setTimeout(()=>{if(typeof openTopicDetail==="function")openTopicDetail(exam,subject,topic);},70);return true;}catch(e){return false;}
  };

  function topicStats(list){
    const m=new Map();
    list.filter(Boolean).forEach(x=>{const k=(norm(x.subject)+"|"+norm(x.topic)).toLocaleLowerCase("tr-TR"),z=m.get(k)||{subject:x.subject,topic:x.topic,entries:0,count:0,open:0};z.entries++;z.count+=Math.max(1,+x.count||1);if(!x.resolved)z.open++;m.set(k,z);});
    return [...m.values()].sort((a,b)=>b.count-a.count||b.entries-a.entries);
  }
  window.errorJournalRender=function(){
    const root=$("errorJournalList"),kpis=$("errorJournalKpis");if(!root||!kpis)return false;
    normalizeLegacy();
    const list=journal(),q=norm($("errorJournalSearch")?.value).toLocaleLowerCase("tr-TR"),filter=$("errorJournalFilter")?.value||"all";
    const visible=list.filter(x=>x&&(!q||[x.subject,x.topic,x.type,x.note,x.source].join(" ").toLocaleLowerCase("tr-TR").includes(q))&&(filter==="all"||x.type===filter));
    const open=list.filter(x=>x&&!x.resolved).length,activeReviews=openReviews().length;
    const topType=TYPES.map(t=>[t,list.filter(x=>x&&x.type===t).reduce((n,x)=>n+Math.max(1,+x.count||1),0)]).sort((a,b)=>b[1]-a[1])[0];
    const topTopic=topicStats(list)[0];
    kpis.innerHTML='<div class="error-journal-kpi"><b>'+list.length+'</b><span>kayıt</span></div><div class="error-journal-kpi"><b>'+open+'</b><span>aktif hata</span></div><div class="error-journal-kpi"><b>'+activeReviews+'</b><span>bekleyen tekrar</span></div><div class="error-journal-kpi"><b>'+esc(topType&&topType[1]?topType[0]:"—")+'</b><span>en sık neden</span></div>'+(topTopic&&topTopic.count>1?'<div class="error-journal-kpi error-journal-kpi-wide"><b>'+esc(topTopic.subject+' · '+topTopic.topic)+'</b><span>'+topTopic.count+' hata ile en çok tekrarlanan konu</span></div>':'');
    if(!visible.length){root.innerHTML='<div class="card empty">Henüz eşleşen hata kaydı yok.</div>';return true;}
    const stats=new Map(topicStats(list).map(x=>[(norm(x.subject)+"|"+norm(x.topic)).toLocaleLowerCase("tr-TR"),x]));
    root.innerHTML=visible.map(x=>{
      const st=stats.get((norm(x.subject)+"|"+norm(x.topic)).toLocaleLowerCase("tr-TR")),repeat=st&&st.count>1?'<span class="error-journal-repeat">'+st.count+' kez</span>':'';
      const src=x.source&&x.source!=="Manuel"?'<span>'+esc(x.source)+'</span>':'';
      return '<article class="card error-journal-item '+(x.resolved?'is-resolved':'')+'" data-error-id="'+esc(x.id)+'"><div class="error-journal-item-head"><div><span class="error-journal-type">'+esc(x.type)+'</span>'+repeat+'<h3>'+esc(x.subject)+' · '+esc(x.topic)+'</h3></div><button class="btn ghost tiny" type="button" onclick="errorJournalToggle(\''+jsArg(x.id)+'\')">'+(x.resolved?'Geri aç':'Çözüldü')+'</button></div>'+(x.note?'<p>'+esc(x.note)+'</p>':'')+'<div class="error-journal-meta"><span>'+new Date(x.createdAt).toLocaleDateString('tr-TR')+'</span>'+(x.count>1?'<span>'+x.count+' yanlış</span>':'')+src+(x.review?'<span>'+(reviewForJournal(x.id)?.completedAt?'Tekrar tamamlandı':'Tekrara eklendi')+'</span>':'')+'<button type="button" class="ej-topic-link" onclick="errorJournalOpenTopic(\''+jsArg(x.id)+'\')">Konu</button><button type="button" onclick="errorJournalDelete(\''+jsArg(x.id)+'\')">Sil</button></div></article>';
    }).join('');return true;
  };

  function appendManualTopicReviews(){
    const root=$("reviewBox");if(!root)return;
    root.querySelector("#errorJournalReviewGroup")?.remove();
    const list=openReviews();if(!list.length)return;
    const count=$("revCount");if(count){const base=parseInt(count.textContent,10)||0;count.textContent=String(base+list.length);}
    const box=document.createElement("div");box.id="errorJournalReviewGroup";box.className="v4-review-group error-journal-review-group";
    box.innerHTML='<small>Hata Defteri tekrarları</small>'+list.slice(0,30).map(r=>'<div class="revrow"><div><div class="rt">'+esc(r.subject)+' · '+esc(r.topic)+'</div><div class="rm">Hata Defteri tekrarı · programı değiştirmez</div></div><div class="rev-actions"><button class="btn ghost tiny" onclick="errorJournalOpen(\''+jsArg(r.journalId||'')+'\')">Hata kaydı</button><button class="btn green tiny" onclick="errorJournalReviewDone(\''+jsArg(r.id)+'\')">Yaptım</button></div></div>').join('');
    root.appendChild(box);
  }
  function appendManualTodayReviews(){
    const root=$("todayReviews");if(!root)return;
    root.querySelector("#errorJournalTodayReviews")?.remove();
    const list=openReviews();if(!list.length)return;
    const box=document.createElement("div");box.id="errorJournalTodayReviews";box.className="error-journal-today-reviews";
    box.innerHTML=list.slice(0,3).map(r=>'<div class="today-review-row"><div class="today-review-main"><b>'+esc(r.subject)+' · '+esc(r.topic)+'</b><span>Hata Defteri tekrarı</span></div><button class="btn green tiny" onclick="errorJournalReviewDone(\''+jsArg(r.id)+'\')">Yaptım</button></div>').join('')+(list.length>3?'<div class="today-review-empty">+'+(list.length-3)+' Hata Defteri tekrarı daha</div>':'');
    root.appendChild(box);
  }
  function adjustTodaySummary(){
    const list=openReviews(),n=list.length;if(!n)return;
    const count=$("todayHubReview");if(count){const base=parseInt(count.textContent,10)||0;count.textContent=String(base+n);}
    const sub=$("todayHubReviewSub");if(sub)sub.textContent=n+" Hata Defteri tekrarı dahil";
    const remaining=$("todayRemaining");if(remaining){const html=remaining.innerHTML||"";if(!html.includes("hata tekrarı")){if(html.includes("Bugünkü kayıtlı hedeflerin tamamlandı"))remaining.innerHTML="Bugünü kapatmak için kalan: <b>"+n+" hata tekrarı</b>";else remaining.insertAdjacentHTML("beforeend"," · <b>"+n+" hata tekrarı</b>");}}
  }
  function renderIntegrations(){
    try{if(typeof renderReviewQueue==="function")renderReviewQueue();else appendManualTopicReviews();}catch(e){appendManualTopicReviews();}
    try{if(typeof renderV25Today==="function")renderV25Today();else{appendManualTodayReviews();adjustTodaySummary();}}catch(e){appendManualTodayReviews();adjustTodaySummary();}
  }
  function renderAllJournal(){window.errorJournalRender();renderIntegrations();}

  function wrap(name,after){
    const original=window[name];if(typeof original!=="function"||original.__errorJournalV2)return false;
    const fn=function(){const out=original.apply(this,arguments);try{after.apply(this,arguments);}catch(e){try{if(typeof infraError==="function")infraError("error-journal-wrap:"+name,e);}catch(_){} }return out;};
    fn.__errorJournalV2=true;fn.__original=original;window[name]=fn;return true;
  }
  function patchRenders(){
    wrap("renderReviewQueue",appendManualTopicReviews);
    wrap("v25RenderReviews",appendManualTodayReviews);
    wrap("v25RenderSummary",adjustTodaySummary);
    wrap("renderV25Today",()=>{appendManualTodayReviews();adjustTodaySummary();});
  }
  function patchDenemeAnalysis(){
    const original=window.anaAdd;if(typeof original!=="function"||original.__errorJournalV2)return;
    const fn=function(){
      const subject=norm($("anaSubject")?.value),topic=norm($("anaTopic")?.value),count=Math.max(1,parseInt($("anaCount")?.value,10)||1),kind=norm($("anaKind")?.value);
      const before=Array.isArray(S?.wrongLog)?S.wrongLog.length:0;
      const out=original.apply(this,arguments);
      const after=Array.isArray(S?.wrongLog)?S.wrongLog.length:0;
      if(subject&&topic&&after>before){
        const wrong=S.wrongLog[after-1]||{},sourceRef="wrong:"+String(wrong.id||Date.now());
        const denemeName=(()=>{try{const d=Array.isArray(S.denemeler)?S.denemeler.find(x=>x&&x.id===wrong.deneme):null;return norm(d&&d.name);}catch(e){return "";}})();
        addEntry({subject,topic,type:KIND_MAP[kind]||"Bilgi eksiği",count,review:true,source:denemeName?"Deneme · "+denemeName:"Deneme analizi",sourceRef,denemeId:wrong.deneme||null,note:count>1?count+" yanlış deneme analizinden aktarıldı":"Deneme analizinden aktarıldı"},{render:false});
        renderAllJournal();toastSafe("Yanlış Hata Defteri'ne ve tekrara eklendi");
      }
      return out;
    };
    fn.__errorJournalV2=true;fn.__original=original;window.anaAdd=fn;
  }
  function injectStyle(){
    if($("errorJournalV2Style"))return;
    const s=document.createElement("style");s.id="errorJournalV2Style";s.textContent='.error-journal-kpis{grid-template-columns:repeat(4,minmax(0,1fr))}.error-journal-kpi-wide{grid-column:1/-1;text-align:left}.error-journal-kpi-wide b{font-size:14px}.error-journal-repeat{display:inline-flex;margin-left:6px;padding:2px 6px;border-radius:999px;background:var(--fill);color:var(--label-2);font-size:10px;font-weight:800}.error-journal-item.is-highlighted{outline:2px solid var(--accent);outline-offset:2px}.error-journal-meta .ej-topic-link{margin-left:auto;color:var(--accent)}.error-journal-meta .ej-topic-link+button{margin-left:0}.error-journal-review-group{margin-top:12px;padding-top:8px;border-top:1px solid var(--glass-line)}@media(max-width:760px){.error-journal-kpis{grid-template-columns:repeat(2,minmax(0,1fr))}}';document.head.appendChild(s);
  }
  function start(){
    injectStyle();normalizeLegacy();patchDenemeAnalysis();patchRenders();window.errorJournalRender();setTimeout(()=>{patchDenemeAnalysis();patchRenders();renderAllJournal();},160);
  }
  document.addEventListener("yks:navigation-after",e=>{const screen=e&&e.detail&&e.detail.screen;if(screen==="deneme")window.errorJournalRender();if(screen==="topics")setTimeout(appendManualTopicReviews,0);if(screen==="home")setTimeout(()=>{appendManualTodayReviews();adjustTodaySummary();},0);});
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start,{once:true});else start();
  window.YKSErrorJournal={version:"2.0.0",add:addEntry,openReviews,render:renderAllJournal};
})();
