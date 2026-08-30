/* YKS Defterim — Kişisel İlerleme v2 */
(function(){
  "use strict";
  if(window.__YKS_PROGRESS_V2__)return;
  window.__YKS_PROGRESS_V2__=true;
  const $=id=>document.getElementById(id);
  const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const pad=n=>String(n).padStart(2,"0");
  function keyOfDate(d){return d.getFullYear()+"-"+pad(d.getMonth()+1)+"-"+pad(d.getDate());}
  function parseDateKey(k){const m=/^(\d{4})-(\d{2})-(\d{2})$/.exec(String(k||""));return m?new Date(+m[1],+m[2]-1,+m[3],12):null;}
  function addKey(k,n){try{if(typeof addDaysKey==="function")return addDaysKey(k,n);}catch(e){}const d=parseDateKey(k)||new Date();d.setDate(d.getDate()+n);return keyOfDate(d);}
  function today(){try{return typeof todayKey==="function"?todayKey():keyOfDate(new Date());}catch(e){return keyOfDate(new Date());}}
  function fmtMin(v){v=Math.max(0,Math.round(+v||0));if(v<60)return v+" dk";const h=Math.floor(v/60),m=v%60;return h+" sa"+(m?" "+m+" dk":"");}
  function rangeAgg(days,offset){
    const end=addKey(today(),-offset),start=addKey(end,-days+1);let min=0,q=0,active=0;
    for(let k=start;;k=addKey(k,1)){
      const m=+(S&&S.pomoMin&&S.pomoMin[k]||0),x=+(S&&S.solved&&S.solved[k]||0);min+=m;q+=x;if(m>0||x>0)active++;
      if(k===end)break;
    }
    return {days,min,q,active,start,end};
  }
  function delta(cur,prev,unit){
    cur=+cur||0;prev=+prev||0;
    if(!prev)return cur>0?"yeni dönem":"değişim yok";
    const pct=Math.round((cur-prev)/Math.abs(prev)*100),sign=pct>0?"+":"";
    return sign+pct+"%"+(unit?" "+unit:"");
  }
  function netOf(s){const n=Number(s&&s.net);if(Number.isFinite(n))return n;const d=Number(s&&s.d)||0,y=Number(s&&s.y)||0;return d-y/4;}
  function examDate(d){return String(d&&d.date||"");}
  function examsBetween(start,end){return (Array.isArray(S&&S.denemeler)?S.denemeler:[]).filter(d=>d&&d.type!=="BRANS"&&examDate(d)>=start&&examDate(d)<=end);}
  function subjectAverages(list){
    const map=new Map();
    list.forEach(d=>(Array.isArray(d.subjectResults)?d.subjectResults:[]).forEach(s=>{const name=String(s&&s.name||"").trim();if(!name)return;const z=map.get(name)||{sum:0,n:0};z.sum+=netOf(s);z.n++;map.set(name,z);}));
    return new Map([...map].map(([k,v])=>[k,v.n?v.sum/v.n:0]));
  }
  function bestImprovingSubject(){
    const t=today(),curStart=addKey(t,-29),prevEnd=addKey(curStart,-1),prevStart=addKey(prevEnd,-29),a=subjectAverages(examsBetween(curStart,t)),b=subjectAverages(examsBetween(prevStart,prevEnd));
    let best=null;
    a.forEach((avg,name)=>{if(!b.has(name))return;const diff=avg-b.get(name);if(!best||diff>best.diff)best={name,diff,now:avg,before:b.get(name)};});
    return best;
  }
  function topErrorTopic(){
    const map=new Map(),journal=Array.isArray(S&&S.errorJournal)?S.errorJournal:[];
    journal.filter(x=>x&&!x.resolved).forEach(x=>{const subject=String(x.subject||"").trim(),topic=String(x.topic||"").trim();if(!subject||!topic)return;const key=subject+"|"+topic,z=map.get(key)||{subject,topic,count:0,entries:0};z.count+=Math.max(1,+x.count||1);z.entries++;map.set(key,z);});
    if(!map.size){
      const cutoff=addKey(today(),-89);(Array.isArray(S&&S.wrongLog)?S.wrongLog:[]).filter(x=>x&&String(x.date||"")>=cutoff).forEach(x=>{const subject=String(x.subject||"").trim(),topic=String(x.topic||"").trim();if(!subject||!topic)return;const key=subject+"|"+topic,z=map.get(key)||{subject,topic,count:0,entries:0};z.count+=Math.max(1,+x.n||1);z.entries++;map.set(key,z);});
    }
    return [...map.values()].sort((a,b)=>b.count-a.count||b.entries-a.entries)[0]||null;
  }
  function studyBefore(date,days=7){let sum=0;for(let i=0;i<days;i++){const k=addKey(date,-i);sum+=+(S&&S.pomoMin&&S.pomoMin[k]||0);}return sum;}
  function pearson(pairs){
    if(pairs.length<3)return null;const xs=pairs.map(x=>x.x),ys=pairs.map(x=>x.y),xm=xs.reduce((a,b)=>a+b,0)/xs.length,ym=ys.reduce((a,b)=>a+b,0)/ys.length;let num=0,dx=0,dy=0;
    for(let i=0;i<pairs.length;i++){const a=xs[i]-xm,b=ys[i]-ym;num+=a*b;dx+=a*a;dy+=b*b;}
    if(!dx||!dy)return null;return num/Math.sqrt(dx*dy);
  }
  function studyNetRelation(){
    const cutoff=addKey(today(),-119),list=(Array.isArray(S&&S.denemeler)?S.denemeler:[]).filter(d=>d&&d.type!=="BRANS"&&examDate(d)>=cutoff&&Number.isFinite(+d.totalNet)).sort((a,b)=>examDate(a).localeCompare(examDate(b))).slice(-10);
    const pairs=list.map(d=>({x:studyBefore(examDate(d),7),y:+d.totalNet})).filter(x=>x.x>0&&Number.isFinite(x.y)),r=pearson(pairs);
    if(r==null)return {count:pairs.length,r:null,label:pairs.length<3?"En az 3 deneme + çalışma kaydı gerekli":"Veri çeşitliliği yetersiz"};
    const label=r>=.45?"Çalışma arttıkça net belirgin yükseliyor":r>=.2?"Çalışma ve net aynı yönde":r<=-.45?"Daha çok süre şu an nete yansımıyor":r<=-.2?"Zayıf ters yönlü ilişki":"Belirgin ilişki henüz yok";
    return {count:pairs.length,r,label};
  }
  function trendClass(text){return /^\+/.test(text)?"up":/^-/.test(text)?"down":"flat";}
  function ensurePanel(){
    const progress=$("progress");if(!progress)return null;let box=$("personalProgressV2");if(box)return box;
    box=document.createElement("section");box.id="personalProgressV2";box.className="personal-progress-v2";box.setAttribute("aria-label","Kişisel gelişim özeti");
    const stats=progress.querySelector(".progress-stats");if(stats)stats.insertAdjacentElement("afterend",box);else progress.prepend(box);return box;
  }
  function render(){
    const box=ensurePanel();if(!box||typeof S!=="object"||!S)return false;
    const d7=rangeAgg(7,0),p7=rangeAgg(7,7),d30=rangeAgg(30,0),p30=rangeAgg(30,30),best=bestImprovingSubject(),err=topErrorTopic(),rel=studyNetRelation();
    const d7m=delta(d7.min,p7.min),d7q=delta(d7.q,p7.q),d30m=delta(d30.min,p30.min),d30q=delta(d30.q,p30.q);
    box.innerHTML='<div class="ppv2-head"><div><span>Kişisel gelişim özeti</span><b>Son dönem sinyalleri</b></div><small>Programına müdahale etmez</small></div><div class="ppv2-grid">'+
      '<article><span>Son 7 gün</span><b>'+fmtMin(d7.min)+' · '+d7.q+' soru</b><small class="'+trendClass(d7m)+'">Çalışma '+esc(d7m)+' · Soru '+esc(d7q)+'</small><em>'+d7.active+'/7 aktif gün</em></article>'+
      '<article><span>Son 30 gün</span><b>'+fmtMin(d30.min)+' · '+d30.q+' soru</b><small class="'+trendClass(d30m)+'">Çalışma '+esc(d30m)+' · Soru '+esc(d30q)+'</small><em>'+d30.active+'/30 aktif gün</em></article>'+
      '<article><span>En çok gelişen ders</span><b>'+(best?esc(best.name):'—')+'</b><small class="'+(best&&best.diff>0?'up':best&&best.diff<0?'down':'flat')+'">'+(best?(best.diff>0?'+':'')+best.diff.toFixed(2)+' net ortalaması':'İki dönemlik ders verisi gerekli')+'</small><em>Son 30 gün ↔ önceki 30 gün</em></article>'+
      '<article><span>En sık açık hata konusu</span><b>'+(err?esc(err.subject+' · '+err.topic):'—')+'</b><small>'+(err?err.count+' hata kaydı':'Aktif hata kaydı yok')+'</small><em>Hata Defteri + yanlış kayıtları</em></article>'+
      '<article class="wide"><span>Çalışma süresi ↔ deneme neti</span><b>'+esc(rel.label)+'</b><small>'+(rel.r==null?'Korelasyon için veri birikiyor':'İlişki katsayısı '+rel.r.toFixed(2))+'</small><em>Son '+rel.count+' genel deneme · her deneme öncesi 7 günlük çalışma</em></article>'+
      '</div>';return true;
  }
  function injectStyle(){if($("personalProgressV2Style"))return;const s=document.createElement("style");s.id="personalProgressV2Style";s.textContent='.personal-progress-v2{margin:14px 0 18px}.ppv2-head{display:flex;align-items:flex-end;justify-content:space-between;gap:12px;margin-bottom:10px}.ppv2-head span,.ppv2-head b{display:block}.ppv2-head span{font-size:11px;color:var(--label-3);font-weight:800;text-transform:uppercase;letter-spacing:.04em}.ppv2-head b{font-size:17px;margin-top:2px}.ppv2-head small{font-size:10px;color:var(--label-3)}.ppv2-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.ppv2-grid article{padding:13px;border:.5px solid var(--glass-line);background:var(--glass);border-radius:16px;min-width:0}.ppv2-grid article.wide{grid-column:1/-1}.ppv2-grid span,.ppv2-grid b,.ppv2-grid small,.ppv2-grid em{display:block}.ppv2-grid span{font-size:10px;color:var(--label-3);font-weight:800;text-transform:uppercase}.ppv2-grid b{font-size:15px;margin:5px 0;overflow-wrap:anywhere}.ppv2-grid small{font-size:11px;color:var(--label-2)}.ppv2-grid small.up{color:var(--success,#2e9d5b)}.ppv2-grid small.down{color:var(--danger,#c44)}.ppv2-grid em{font-style:normal;font-size:10px;color:var(--label-3);margin-top:5px}@media(max-width:650px){.ppv2-grid{grid-template-columns:1fr}.ppv2-grid article.wide{grid-column:auto}.ppv2-head{align-items:flex-start;flex-direction:column}}';document.head.appendChild(s);}
  function patch(){const original=window.renderProgress;if(typeof original!=="function"||original.__progressV2)return;const fn=function(){const out=original.apply(this,arguments);setTimeout(render,0);return out;};fn.__progressV2=true;window.renderProgress=fn;}
  function start(){injectStyle();patch();if($("progress")&&$("progress").classList.contains("active"))render();setTimeout(()=>{patch();if($("progress")&&$("progress").classList.contains("active"))render();},180);}
  document.addEventListener("yks:navigation-after",e=>{if(e&&e.detail&&e.detail.screen==="progress")setTimeout(render,0);});
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start,{once:true});else start();
  window.YKSProgressV2={version:"2.0.0",render,rangeAgg,bestImprovingSubject,topErrorTopic,studyNetRelation};
})();

(function(){
  "use strict";
  function loadProgressV42(){
    if(window.__YKS_PROGRESS_V42__||document.querySelector('script[data-yks-progress-v42]'))return;
    const s=document.createElement("script");s.src="./modules/progress-v42.js?v=4.2.0-r1";s.async=false;s.setAttribute("data-yks-progress-v42","1");
    s.onerror=()=>{try{if(typeof infraError==="function")infraError("progress-v42-load",new Error("İlerleme 3.0 yüklenemedi"));}catch(e){}};document.head.appendChild(s);
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",loadProgressV42,{once:true});else loadProgressV42();
})();
