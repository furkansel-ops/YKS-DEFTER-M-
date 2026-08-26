/* Kişisel Hata Defteri — tek kullanıcı */
(function(){
  const TYPES=["Bilgi eksiği","Dikkat","İşlem","Yorum","Süre"];
  function esc(v){return String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
  function state(){
    if(typeof S!=="object"||!S)return [];
    if(!Array.isArray(S.errorJournal))S.errorJournal=[];
    return S.errorJournal;
  }
  function persist(){try{if(typeof saveSoon==="function")saveSoon(80);else if(typeof save==="function")save();}catch(e){}}
  function field(id){return document.getElementById(id);}
  function norm(v){return String(v||"").trim();}
  window.errorJournalAdd=function(){
    const subject=norm(field("errorJournalSubject")?.value),topic=norm(field("errorJournalTopic")?.value),type=norm(field("errorJournalType")?.value)||TYPES[0],note=norm(field("errorJournalNote")?.value);
    if(!subject||!topic){try{toast("Ders ve konu gerekli");}catch(e){}return;}
    const item={id:"err_"+Date.now().toString(36)+Math.random().toString(36).slice(2,7),subject,topic,type:TYPES.includes(type)?type:TYPES[0],note,createdAt:Date.now(),resolved:false,review:!!field("errorJournalReview")?.checked};
    state().unshift(item);
    if(item.review){
      try{
        if(!Array.isArray(S.manualReviews))S.manualReviews=[];
        S.manualReviews.unshift({id:"rev_"+item.id,subject:item.subject,topic:item.topic,source:"Hata Defteri",createdAt:item.createdAt});
      }catch(e){}
    }
    persist();
    ["errorJournalSubject","errorJournalTopic","errorJournalNote"].forEach(id=>{const x=field(id);if(x)x.value="";}); const r=field("errorJournalReview");if(r)r.checked=false;
    window.errorJournalRender();
    try{toast("Hata Defteri'ne eklendi");}catch(e){}
  };
  window.errorJournalToggle=function(id){const x=state().find(v=>v&&v.id===id);if(!x)return;x.resolved=!x.resolved;x.resolvedAt=x.resolved?Date.now():0;persist();window.errorJournalRender();};
  window.errorJournalDelete=function(id){const list=state(),i=list.findIndex(v=>v&&v.id===id);if(i<0)return;if(!confirm("Bu hata kaydını silmek istiyor musun?"))return;list.splice(i,1);persist();window.errorJournalRender();};
  window.errorJournalRender=function(){
    const root=field("errorJournalList"),kpis=field("errorJournalKpis");if(!root||!kpis)return;
    const list=state(),q=norm(field("errorJournalSearch")?.value).toLocaleLowerCase("tr-TR"),filter=field("errorJournalFilter")?.value||"all";
    const visible=list.filter(x=>x&&(!q||[x.subject,x.topic,x.type,x.note].join(" ").toLocaleLowerCase("tr-TR").includes(q))&&(filter==="all"||x.type===filter));
    const open=list.filter(x=>x&&!x.resolved).length; const top=TYPES.map(t=>[t,list.filter(x=>x&&x.type===t).length]).sort((a,b)=>b[1]-a[1])[0];
    kpis.innerHTML='<div class="error-journal-kpi"><b>'+list.length+'</b><span>toplam kayıt</span></div><div class="error-journal-kpi"><b>'+open+'</b><span>aktif hata</span></div><div class="error-journal-kpi"><b>'+esc(top&&top[1]?top[0]:"—")+'</b><span>en sık neden</span></div>';
    if(!visible.length){root.innerHTML='<div class="card empty">Henüz eşleşen hata kaydı yok.</div>';return;}
    root.innerHTML=visible.map(x=>'<article class="card error-journal-item '+(x.resolved?'is-resolved':'')+'"><div class="error-journal-item-head"><div><span class="error-journal-type">'+esc(x.type)+'</span><h3>'+esc(x.subject)+' · '+esc(x.topic)+'</h3></div><button class="btn ghost tiny" type="button" onclick="errorJournalToggle(\''+esc(x.id)+'\')">'+(x.resolved?'Geri aç':'Çözüldü')+'</button></div>'+(x.note?'<p>'+esc(x.note)+'</p>':'')+'<div class="error-journal-meta"><span>'+new Date(x.createdAt).toLocaleDateString('tr-TR')+'</span>'+(x.review?'<span>Tekrara eklendi</span>':'')+'<button type="button" onclick="errorJournalDelete(\''+esc(x.id)+'\')">Sil</button></div></article>').join('');
  };
  document.addEventListener('DOMContentLoaded',()=>window.errorJournalRender());
  document.addEventListener('yks:navigation-after',e=>{if(e&&e.detail&&e.detail.screen==='deneme')window.errorJournalRender();});
})();
