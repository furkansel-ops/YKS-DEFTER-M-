(function(){
  "use strict";
  const escText=value=>typeof esc==="function"?esc(value):String(value||"").replace(/[&<>"']/g,s=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[s]));
  const arg=value=>String(value||"").replace(/\\/g,"\\\\").replace(/'/g,"\\'").replace(/[\r\n]/g," ");

  function coachRows(){
    const risk=typeof v2RiskList==="function"?v2RiskList(60):[],seen=new Set(),rows=[];
    const push=(x,kind,label,minutes)=>{
      if(!x||!x.key||seen.has(x.key)||rows.length>=5)return;
      seen.add(x.key);rows.push(Object.assign({},x,{kind,label,minutes}));
    };
    (typeof reviewQueue==="function"?reviewQueue():[]).slice(0,3).forEach(r=>{
      const match=risk.find(x=>x.key===r.key)||r;
      push(match,"review",r.late>0?"Geciken tekrarı kapat":"Bugünkü tekrarı yap",20);
    });
    risk.filter(x=>x.wrong>0).forEach(x=>push(x,"repair","Kısa tekrar + 20 telafi sorusu",x.score>=65?45:30));
    risk.forEach(x=>push(x,"study",x.score>=55?"Konu anlatımı + soru":"Kısa konu çalışması",x.score>=55?45:30));
    if(rows.length<3&&typeof stalestTopic==="function"){
      const x=stalestTopic();if(x)push(Object.assign({score:12,reasons:["uzun süredir çalışılmadı"],wrong:0,review:false},x),"study","Konuya ilk adımı at",25);
    }
    return rows.slice(0,3);
  }

  function strongestWeakest(){
    const all=[];
    (typeof ALL_SUBJECTS!=="undefined"?ALL_SUBJECTS:[]).forEach(subject=>subject.topics.forEach(topic=>{
      const key=tkey(subject.exam,subject.name,topic),state=tget(key);
      all.push({exam:subject.exam,subj:subject.name,topic,key,score:(state.st||0)*22+(state.conf||0)*7+(state.rev||[]).length*9,state});
    }));
    const touched=all.filter(x=>x.state.st||x.state.conf||(x.state.rev||[]).length);
    touched.sort((a,b)=>b.score-a.score||a.topic.localeCompare(b.topic,"tr"));
    const strong=touched[0]||null,risk=coachRows()[0]||null;
    return {strong,risk,tracked:touched.length,total:all.length};
  }

  function renderCoach(){
    const root=document.getElementById("v312Coach");if(!root)return false;
    const rows=coachRows(),summary=strongestWeakest();
    const metrics=document.getElementById("v312CoachMetrics");
    if(metrics)metrics.innerHTML=[
      [rows.length,"bugünkü öneri"],
      [typeof reviewQueue==="function"?reviewQueue().length:0,"bekleyen tekrar"],
      [summary.tracked+" / "+summary.total,"izlenen konu"]
    ].map(x=>'<div><b>'+x[0]+'</b><span>'+x[1]+'</span></div>').join("");
    if(!rows.length){root.innerHTML='<div class="empty">Konu durumlarını, yanlışlarını ve odak oturumlarını işaretledikçe günlük çalışma önerilerin burada oluşacak.</div>';return true;}
    root.innerHTML=rows.map((x,index)=>{
      const risk=x.score>=55?"Yüksek":x.score>=30?"Orta":"Başlangıç";
      const reason=(x.reasons||[]).join(" · ")||"sıradaki uygun konu";
      return '<article class="v312-coach-row"><span class="v312-rank">'+(index+1)+'</span><div class="v312-coach-main"><div class="v312-coach-title">'+escText(x.subj+' · '+x.topic)+'</div><div class="v312-coach-meta">'+escText(x.label)+' · '+x.minutes+' dk</div><div class="v312-coach-reason">'+escText(reason)+'</div></div><span class="risk-badge '+(x.score>=55?'risk-high':x.score>=30?'risk-mid':'risk-low')+'">'+risk+'</span><div class="v312-actions"><button class="btn green tiny" type="button" onclick="v312Start(\''+arg(x.exam)+'\',\''+arg(x.subj)+'\',\''+arg(x.topic)+'\')">Başlat</button><button class="btn ghost tiny" type="button" onclick="v312Plan(\''+arg(x.subj)+'\',\''+arg(x.topic)+'\',\''+arg(x.label)+'\')">Plana ekle</button><button class="btn ghost tiny" type="button" onclick="openTopicDetail(\''+arg(x.exam)+'\',\''+arg(x.subj)+'\',\''+arg(x.topic)+'\')">Detay</button></div></article>';
    }).join("");
    const insight=document.getElementById("v312CoachInsight");
    if(insight){
      const strong=summary.strong?summary.strong.subj+" · "+summary.strong.topic:"Henüz belirgin değil";
      const weak=summary.risk?summary.risk.subj+" · "+summary.risk.topic:"Belirgin risk yok";
      insight.innerHTML='<div><small>En güçlü görünen</small><b>'+escText(strong)+'</b></div><div><small>Önce ele alınacak</small><b>'+escText(weak)+'</b></div>';
    }
    return true;
  }

  window.v312Plan=function(subject,topic,label){return addToToday(subject+" · "+topic+" · "+label);};
  window.v312Start=function(exam,subject,topic){return v26StartTopic(exam,subject,topic);};
  window.v312PlanAll=function(){let added=0;coachRows().forEach(x=>{if(addToToday(x.subj+" · "+x.topic+" · "+x.label))added++;});if(added>1)toast(added+" öneri bugünün planına eklendi");return added;};
  window.v312RenderCoach=renderCoach;

  const oldRender=window.renderSubjects;
  if(typeof oldRender==="function")window.renderSubjects=function(){const result=oldRender.apply(this,arguments);window.YKSSafeRender?.("topic-coach",renderCoach,"v312Coach");return result;};
  const start=()=>window.YKSSafeRender?window.YKSSafeRender("topic-coach",renderCoach,"v312Coach"):renderCoach();
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",()=>setTimeout(start,240),{once:true});else setTimeout(start,240);
})();
