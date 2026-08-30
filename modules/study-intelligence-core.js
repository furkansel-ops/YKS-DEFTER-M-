(function(root,factory){
  const api=factory();
  if(typeof module!=="undefined"&&module.exports)module.exports=api;
  root.YKSStudyIntelCore=api;
})(typeof globalThis!=="undefined"?globalThis:this,function(){
  "use strict";
  const KINDS={bilmiyordum:"Bilgi eksiği",dikkat:"Dikkat",sure:"Süre",islem:"İşlem",yorum:"Yorum"};
  const num=(v,d=0)=>Number.isFinite(Number(v))?Number(v):d;
  const iso=d=>/^\d{4}-\d{2}-\d{2}$/.test(String(d||""))?String(d):"";
  function dayNumber(key){const d=iso(key);if(!d)return null;const [y,m,day]=d.split("-").map(Number);return Date.UTC(y,m-1,day)/86400000;}
  function daysAgo(key,today){const a=dayNumber(key),b=dayNumber(today);return a==null||b==null?null:Math.max(0,b-a);}
  function escText(v){return String(v==null?"":v).trim();}
  function topicKey(subject,topic){return escText(subject).toLocaleLowerCase("tr-TR")+"|"+escText(topic).toLocaleLowerCase("tr-TR");}

  function wrongGroups(state){
    const map=new Map();
    for(const w of (state&&state.wrongLog)||[]){
      const subject=escText(w.subject),topic=escText(w.topic);if(!subject||!topic)continue;
      const key=topicKey(subject,topic),n=Math.max(1,num(w.n,1)),date=iso(w.date),kind=escText(w.kind)||"belirsiz";
      let g=map.get(key);
      if(!g){g={key,subject,topic,total:0,entries:0,days:new Set(),last:"",kinds:{},examMarked:0,examDays:new Set(),lastExam:""};map.set(key,g);}
      g.total+=n;g.entries++;
      if(date){g.days.add(date);if(date>g.last)g.last=date;}
      g.kinds[kind]=(g.kinds[kind]||0)+n;
      if(w.deneme!=null){
        g.examMarked+=n;
        if(date){g.examDays.add(date);if(date>g.lastExam)g.lastExam=date;}
      }
    }
    return [...map.values()].map(g=>({...g,days:[...g.days],examDays:[...g.examDays]}));
  }

  function causeSummary(state){
    const counts={};let total=0;
    for(const w of (state&&state.wrongLog)||[]){const n=Math.max(1,num(w.n,1)),kind=escText(w.kind)||"belirsiz";counts[kind]=(counts[kind]||0)+n;total+=n;}
    return Object.entries(counts).map(([kind,count])=>({kind,label:KINDS[kind]||"Belirtilmedi",count,pct:total?Math.round(count/total*100):0})).sort((a,b)=>b.count-a.count);
  }

  function errorInsights(state,today){
    const groups=wrongGroups(state).map(g=>{
      const age=daysAgo(g.last,today),repeatDays=g.days.length;
      let score=g.total*3+repeatDays*10+(g.examMarked?8:0);
      if(age!=null&&age<=14)score+=12;
      if(repeatDays>=3)score+=12;
      return {...g,age,repeatDays,score};
    }).sort((a,b)=>b.score-a.score||b.total-a.total);
    const repeated=groups.filter(x=>x.repeatDays>=2);
    return {groups,repeated,causes:causeSummary(state),critical:groups.filter(x=>x.score>=45),total:groups.reduce((a,x)=>a+x.total,0)};
  }

  function stddev(values){if(!values.length)return 0;const av=values.reduce((a,b)=>a+b,0)/values.length;return Math.sqrt(values.reduce((a,b)=>a+(b-av)*(b-av),0)/values.length);}
  function examInsights(state){
    const exams=((state&&state.denemeler)||[]).filter(d=>d&&d.type!=="BRANS"&&Number.isFinite(Number(d.totalNet))).slice().sort((a,b)=>String(a.date||"").localeCompare(String(b.date||""))||num(a.id)-num(b.id));
    if(!exams.length)return {hasData:false,exams:[]};
    const latest=exams[exams.length-1],same=exams.filter(d=>d.type===latest.type),window=same.slice(-5),prev=same.length>1?same[same.length-2]:null,nets=window.map(d=>num(d.totalNet));
    const avg=nets.reduce((a,b)=>a+b,0)/nets.length,delta=prev?num(latest.totalNet)-num(prev.totalNet):null,volatility=stddev(nets);
    const prevMap=new Map(((prev&&prev.subjectResults)||[]).map(r=>[escText(r.name),r]));
    const subjectChanges=((latest.subjectResults)||[]).map(r=>{const p=prevMap.get(escText(r.name)),cur=num(r.net),before=p?num(p.net):null;return {name:escText(r.name),net:cur,previous:before,delta:before==null?null:cur-before,wrong:num(r.y),blank:num(r.b),cap:num(r.cap)};});
    const losses=subjectChanges.slice().sort((a,b)=>{const ap=a.cap>0?a.net/a.cap:1,bp=b.cap>0?b.net/b.cap:1;return ap-bp||(b.wrong+b.blank)-(a.wrong+a.blank);});
    const gains=subjectChanges.filter(x=>x.delta!=null).slice().sort((a,b)=>b.delta-a.delta);
    return {hasData:true,exams,latest,previous:prev,type:latest.type,window,avg,delta,volatility,subjectChanges,weakest:losses[0]||null,bestGain:gains[0]||null,biggestDrop:gains.length?gains[gains.length-1]:null};
  }

  function repeatRecommendations(state,signals,today){
    const errors=errorInsights(state,today),wrongMap=new Map(errors.groups.map(x=>[x.key,x]));
    const rows=[];
    for(const s of signals||[]){
      const subject=escText(s.subject||s.subj),topic=escText(s.topic);if(!subject||!topic)continue;
      const w=wrongMap.get(topicKey(subject,topic)),st=num(s.st),conf=num(s.conf),risk=num(s.riskScore||s.score),dueLate=Math.max(0,num(s.dueLate)),studyAge=s.studyLast?daysAgo(s.studyLast,today):null,lastWrongAge=w&&w.last?daysAgo(w.last,today):null;
      let score=risk;
      const reasons=[],factors=[];
      const add=(points,label,kind)=>{const p=Math.max(0,Math.round(points));if(!label)return;if(p)score+=p;reasons.push(label);factors.push({kind,label,points:p});};

      if(w){
        const wrongPoints=Math.min(36,w.total*3)+Math.min(22,w.repeatDays*6);
        add(wrongPoints,w.total+" yanlış"+(w.repeatDays>1?" · "+w.repeatDays+" farklı gün":""),"wrong");
        if(w.examMarked){
          const recentExam=lastWrongAge!=null&&lastWrongAge<=14;
          add(Math.min(26,8+w.examMarked*4+(recentExam?6:0)),w.examMarked+" deneme bağlantılı yanlış"+(recentExam&&lastWrongAge!=null?" · sonuncusu "+lastWrongAge+" gün önce":""),"exam");
        }
      }
      if(dueLate>0)add(Math.min(30,12+dueLate*1.25),dueLate+" gün gecikmiş tekrar","due");
      if(st>0&&st<3)add(st===1?18:14,st===1?"konu hâlâ öğrenme aşamasında":"konu henüz tam pekişmedi","stage");
      if(conf>0&&conf<=2)add(conf===1?24:19,"güven "+conf+"/5","confidence");
      if(st>0&&studyAge!=null&&studyAge>=14){
        const agePoints=studyAge>=30?20:studyAge>=21?14:8;
        add(agePoints,"son çalışma "+studyAge+" gün önce","recency");
      }
      for(const reason of s.reasons||[]){
        const text=escText(reason);if(text&&!reasons.includes(text)){reasons.push(text);factors.push({kind:"signal",label:text,points:0});}
      }
      if(!reasons.length&&risk>=25){reasons.push("konu risk puanı yükseldi");factors.push({kind:"risk",label:"konu risk puanı yükseldi",points:Math.round(risk)});}
      if(score>=25)rows.push({exam:escText(s.exam),subject,topic,score:Math.round(score),baseRisk:Math.round(risk),reasons:reasons.slice(0,6),factors:factors.slice().sort((a,b)=>b.points-a.points),st,conf,dueLate,studyAge,lastWrongAge,wrong:w||null});
    }

    if(!rows.length){
      for(const w of errors.groups){
        if(w.score<25)continue;
        const lastWrongAge=w.last?daysAgo(w.last,today):null,reasons=[w.total+" yanlış"+(w.repeatDays>1?" · "+w.repeatDays+" farklı gün":"")],factors=[{kind:"wrong",label:reasons[0],points:Math.round(w.score)}];
        if(w.examMarked){const text=w.examMarked+" deneme bağlantılı yanlış";reasons.push(text);factors.push({kind:"exam",label:text,points:Math.min(24,8+w.examMarked*4)});}
        rows.push({exam:"",subject:w.subject,topic:w.topic,score:Math.round(w.score),baseRisk:0,reasons,factors,st:0,conf:0,dueLate:0,studyAge:null,lastWrongAge,wrong:w});
      }
    }

    const dedup=new Map();
    for(const r of rows){const key=topicKey(r.subject,r.topic),old=dedup.get(key);if(!old||r.score>old.score)dedup.set(key,r);}
    return [...dedup.values()]
      .sort((a,b)=>b.score-a.score||num(b.wrong&&b.wrong.examMarked)-num(a.wrong&&a.wrong.examMarked)||num(b.wrong&&b.wrong.repeatDays)-num(a.wrong&&a.wrong.repeatDays)||b.dueLate-a.dueLate||a.topic.localeCompare(b.topic,"tr-TR"))
      .map(r=>({...r,severity:r.score>=75?"must":r.score>=50?"priority":"soon",label:r.score>=75?"TEKRAR ETMEN ŞART":r.score>=50?"ÖNCELİKLİ TEKRAR":"YAKINDA TEKRAR",why:r.reasons.slice(0,3)}));
  }

  function topicHealth(signals,today){
    const out={notStarted:0,learning:0,consolidating:0,ready:0,repeat:0,total:0,rows:[]};
    for(const s of signals||[]){
      const st=num(s.st),risk=num(s.riskScore||s.score),late=num(s.dueLate),conf=num(s.conf),studyAge=s.studyLast?daysAgo(s.studyLast,today):null;let status="notStarted";
      if(st===0)status="notStarted";else if(late>0||risk>=45||(st===3&&conf>0&&conf<=2)||(st===3&&studyAge!=null&&studyAge>=30))status="repeat";else if(st===1)status="learning";else if(st===2)status="consolidating";else status="ready";
      out[status]++;out.total++;out.rows.push({...s,status});
    }
    return out;
  }

  function commandCenter(state,today,repeats,exam){
    const solved=num(state&&state.solved&&state.solved[today]),minutes=num(state&&state.pomoMin&&state.pomoMin[today]);
    const top=repeats&&repeats[0]||null;
    return {solved,minutes,topRepeat:top,latestExam:exam&&exam.hasData?exam.latest:null,examDelta:exam&&exam.hasData?exam.delta:null};
  }

  function snapshotSchedule(state){return JSON.stringify({weeks:state&&state.weeks||{},rows:state&&state.rows||{},rowLabels:state&&state.rowLabels||{}});}

  function selfTest(){
    const today="2026-08-28",state={wrongLog:[{subject:"Matematik",topic:"Problemler",n:4,date:"2026-08-25",kind:"dikkat"},{subject:"Matematik",topic:"Problemler",n:3,date:"2026-08-15",kind:"bilmiyordum",deneme:1}],denemeler:[{id:1,type:"TYT",date:"2026-08-20",totalNet:70,subjectResults:[{name:"Temel Matematik",net:20,y:8,b:12,cap:40}]},{id:2,type:"TYT",date:"2026-08-27",totalNet:76,subjectResults:[{name:"Temel Matematik",net:24,y:6,b:10,cap:40}]}],solved:{[today]:80},pomoMin:{[today]:150},weeks:{a:1},rows:{r:[]},rowLabels:{r:[]}};
    const sig=[{exam:"TYT",subject:"Matematik",topic:"Problemler",st:2,conf:2,riskScore:42,dueLate:3,studyLast:"2026-08-10"}],before=snapshotSchedule(state),rep=repeatRecommendations(state,sig,today),err=errorInsights(state,today),ex=examInsights(state),health=topicHealth(sig,today),cmd=commandCenter(state,today,rep,ex),after=snapshotSchedule(state);
    return {ok:rep[0]&&rep[0].severity==="must"&&rep[0].reasons.some(x=>/deneme bağlantılı/.test(x))&&err.repeated.length===1&&ex.delta===6&&health.repeat===1&&cmd.solved===80&&before===after,checks:{repeat:!!rep[0],explainable:!!(rep[0]&&rep[0].factors&&rep[0].factors.length),readOnly:before===after,exam:ex.delta===6,error:err.repeated.length===1,topic:health.repeat===1}};
  }

  return {version:"3.1.0",repeatVersion:"2.0.0",KINDS,daysAgo,topicKey,wrongGroups,errorInsights,examInsights,repeatRecommendations,topicHealth,commandCenter,snapshotSchedule,selfTest};
});
