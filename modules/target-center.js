(function(){
  "use strict";
  const html=value=>typeof esc==="function"?esc(value):String(value||"").replace(/[&<>"']/g,s=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[s]));
  const rankText=value=>typeof fmtRank==="function"?fmtRank(value):(Number(value)||0).toLocaleString("tr-TR");
  function subjectMomentum(){
    const rows={};S.denemeler.filter(x=>x.type==="TYT"||x.type==="AYT"||x.type==="YDT").slice().sort((a,b)=>a.date.localeCompare(b.date)||a.id-b.id).forEach(exam=>(exam.subjectResults||[]).forEach(x=>(rows[x.name]||(rows[x.name]=[])).push(Number(x.net)||0)));
    return Object.entries(rows).map(([name,list])=>{const cur=list.slice(-3),prev=list.slice(-6,-3),avg=a=>a.length?a.reduce((s,x)=>s+x,0)/a.length:0;return {name,count:list.length,current:avg(cur),change:prev.length?avg(cur)-avg(prev):(list.length>1?list.at(-1)-list[0]:0)};}).filter(x=>x.count>=2).sort((a,b)=>b.change-a.change);
  }
  function snapshot(){
    const scores=typeof estScores==="function"?estScores():{},score=Number(scores.alan??scores.tyt)||0,rank=score&&typeof rankEstimate==="function"?rankEstimate(score):null,model=typeof v24Model==="function"?v24Model("TYT",10):null,publishers=typeof publisherStats==="function"?publisherStats("TYT"):[],subjects=subjectMomentum(),targetList=Array.isArray(S.targets)?S.targets.slice().sort((a,b)=>a.sira-b.sira):[];
    let nearest=null;if(rank&&targetList.length)nearest=targetList.slice().sort((a,b)=>Math.abs(a.sira-rank.mid)-Math.abs(b.sira-rank.mid))[0];
    return {scores,score,rank,model,publishers,subjects,targetList,nearest};
  }
  function render(){
    const kpis=document.getElementById("v321TargetKpis");if(!kpis)return false;const d=snapshot(),s=d.scores;
    kpis.innerHTML=[
      [s.tytNet??"—","TYT net · son 3"],
      [(S.puanTuru==="DIL"?s.ydtNet:s.aytNet)??"—",(S.puanTuru==="DIL"?"YDT":"AYT")+" alan neti"],
      [d.score?Math.round(d.score):"—",S.puanTuru+" tahmini puan"],
      [d.rank?rankText(d.rank.mid):"—","orta sıralama senaryosu"]
    ].map(x=>'<div><b>'+x[0]+'</b><small>'+html(x[1])+'</small></div>').join("");
    const trend=document.getElementById("v321TrendInsight"),target=document.getElementById("v321TargetInsight"),publisher=document.getElementById("v321PublisherInsight"),subject=document.getElementById("v321SubjectInsight");
    if(trend){const slope=d.model?d.model.slopeWeek:0;trend.innerHTML='<div class="v321-insight-title">TYT net eğilimi</div><div class="v321-insight-big">'+(d.model?(slope>=0?'+':'')+slope.toFixed(2)+' net / hafta':'Yeterli veri yok')+'</div><div class="v321-insight-sub">'+(d.model?(slope>.5?'Yükseliş düzenli görünüyor. Aynı çalışma dağılımını koru.':slope<-.5?'Son denemelerde düşüş var. Ders dağılımı ve yanlış nedenlerini kontrol et.':'Netler yatay ilerliyor; en yüksek getirili iki konuya odaklan.'):'En az iki TYT denemesiyle regresyon eğilimi oluşur.')+'</div>';}
    if(target){let big="Hedef eklenmedi",sub="Hedef bölüm ve taban sıralamasını aşağıdaki alandan ekleyebilirsin.";if(d.nearest&&d.rank){const gap=d.rank.mid-d.nearest.sira;big=html(d.nearest.ad);sub=(d.nearest.uni?html(d.nearest.uni)+" · ":"")+rankText(d.nearest.sira)+" taban sıra · "+(gap<=0?"orta senaryoda hedef aralığındasın":rankText(gap)+" sıra kapatılmalı");}target.innerHTML='<div class="v321-insight-title">En yakın bölüm hedefi</div><div class="v321-insight-big">'+big+'</div><div class="v321-insight-sub">'+sub+'</div>';}
    if(publisher){const enough=d.publishers.filter(x=>x.n>=2),hard=enough.slice().sort((a,b)=>a.avg-b.avg)[0];publisher.innerHTML='<div class="v321-insight-title">Yayınevi kalibrasyonu</div><div class="v321-insight-big">'+(hard?html(hard.pub):"Yeterli veri yok")+'</div><div class="v321-insight-sub">'+(hard?hard.n+' TYT denemesinde ortalama '+hard.avg+' net; kişisel verinde en zorlayıcı görünen yayın.':'Aynı yayınevinden en az iki TYT denemesi girince kişisel zorluk etkisi çıkar.')+'</div>';}
    if(subject){const best=d.subjects[0],weak=d.subjects.at(-1);subject.innerHTML='<div class="v321-insight-title">Ders hareketi</div><div class="v321-insight-big">'+(best?html(best.name)+' '+(best.change>=0?'+':'')+best.change.toFixed(2):"Yeterli veri yok")+'</div><div class="v321-insight-sub">'+(best?(weak&&weak.change<-.25?'En çok gerileyen: '+html(weak.name)+' '+weak.change.toFixed(2)+' net.':'Belirgin gerileyen ders görünmüyor.'):'Ders bazlı karşılaştırma için aynı türde birkaç deneme gerekir.')+'</div>';}
    return true;
  }
  window.v321TargetSnapshot=snapshot;window.v321RenderTargetCenter=render;
  const oldScore=window.renderScore;if(typeof oldScore==="function")window.renderScore=function(){const result=oldScore.apply(this,arguments);window.YKSSafeRender?.("target-center",render,"v321TargetKpis");return result;};
  const start=()=>window.YKSSafeRender?window.YKSSafeRender("target-center",render,"v321TargetKpis"):render();if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",()=>setTimeout(start,380),{once:true});else setTimeout(start,380);
})();
