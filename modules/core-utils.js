(function(root,factory){
  const api=factory();
  if(typeof module==="object"&&module.exports)module.exports=api;
  if(root)root.YKSCore=api;
})(typeof window!=="undefined"?window:null,function(){
  "use strict";

  const clone=value=>value===undefined?undefined:JSON.parse(JSON.stringify(value));
  const isObject=value=>!!value&&typeof value==="object"&&!Array.isArray(value);
  const stamp=value=>Math.max(0,Number(value?.updatedAt||value?.at||value?.end||value?.t||0)||0);
  const stableKey=(value,index)=>{
    if(value&&value.id!==undefined&&value.id!==null)return "id:"+String(value.id);
    if(value&&value.key)return "key:"+String(value.key);
    if(value&&value.day&&value.subj)return "session:"+[value.day,value.t,value.subj,value.topic,value.m].join("|");
    return "value:"+JSON.stringify(value)+":"+index;
  };

  function mergeArray(remote,local){
    const map=new Map();
    (Array.isArray(remote)?remote:[]).forEach((value,index)=>map.set(stableKey(value,index),clone(value)));
    (Array.isArray(local)?local:[]).forEach((value,index)=>{
      const key=stableKey(value,index),old=map.get(key);
      if(!old||stamp(value)>=stamp(old))map.set(key,clone(value));
    });
    return [...map.values()];
  }

  function mergeNumberMap(remote,local){
    const out=Object.assign({},isObject(remote)?remote:{});
    Object.entries(isObject(local)?local:{}).forEach(([key,value])=>{
      out[key]=Math.max(Number(out[key])||0,Number(value)||0);
    });
    return out;
  }

  function mergeNestedNumberMap(remote,local){
    const out=clone(isObject(remote)?remote:{});
    Object.entries(isObject(local)?local:{}).forEach(([day,row])=>{
      out[day]=mergeNumberMap(out[day],row);
    });
    return out;
  }

  function mergeRecordMap(remote,local){
    const out=clone(isObject(remote)?remote:{});
    Object.entries(isObject(local)?local:{}).forEach(([key,value])=>{
      const old=out[key];
      if(old===undefined||stamp(value)>=stamp(old))out[key]=clone(value);
    });
    return out;
  }

  function mergeTopics(remote,local){
    const out=clone(isObject(remote)?remote:{});
    Object.entries(isObject(local)?local:{}).forEach(([key,value])=>{
      if(!isObject(value)){if(out[key]===undefined)out[key]=clone(value);return;}
      const old=isObject(out[key])?out[key]:{};
      const newer=stamp(value)>=stamp(old)?value:old;
      out[key]=Object.assign({},clone(old),clone(newer),{
        st:Math.max(Number(old.st)||0,Number(value.st)||0),
        conf:Math.max(Number(old.conf)||0,Number(value.conf)||0),
        rev:[...new Set([...(Array.isArray(old.rev)?old.rev:[]),...(Array.isArray(value.rev)?value.rev:[])])].sort(),
        revDone:Object.assign({},isObject(old.revDone)?old.revDone:{},isObject(value.revDone)?value.revDone:{})
      });
      if(old.ts&&value.ts)out[key].ts=old.ts>value.ts?old.ts:value.ts;
      if(old.dl&&!value.dl)out[key].dl=old.dl;
    });
    return out;
  }

  function mergeWeeks(remote,local){
    const out=clone(isObject(remote)?remote:{});
    Object.entries(isObject(local)?local:{}).forEach(([weekKey,week])=>{
      if(!isObject(week)){if(out[weekKey]===undefined)out[weekKey]=clone(week);return;}
      const base=isObject(out[weekKey])?out[weekKey]:{};
      ["r","s"].forEach(block=>{
        const rr=Array.isArray(base[block])?base[block]:[],ll=Array.isArray(week[block])?week[block]:[];
        const rows=Math.max(rr.length,ll.length),merged=[];
        for(let i=0;i<rows;i++){
          const a=Array.isArray(rr[i])?rr[i]:[],b=Array.isArray(ll[i])?ll[i]:[],row=[];
          for(let d=0;d<7;d++)row[d]=String(b[d]||"").trim()?b[d]:(a[d]||"");
          merged.push(row);
        }
        base[block]=merged;
      });
      base.done=Array.from({length:7},(_,i)=>!!(base.done?.[i]||week.done?.[i]));
      base.dn=Object.assign({},isObject(base.dn)?base.dn:{},isObject(week.dn)?week.dn:{});
      base.mv=Object.assign({},isObject(base.mv)?base.mv:{},isObject(week.mv)?week.mv:{});
      out[weekKey]=base;
    });
    return out;
  }

  function mergeLearning(remote,local){
    const r=isObject(remote)?remote:{},l=isObject(local)?local:{};
    return {
      cards:mergeArray(r.cards,l.cards),
      formulaFav:[...new Set([...(Array.isArray(r.formulaFav)?r.formulaFav:[]),...(Array.isArray(l.formulaFav)?l.formulaFav:[])])],
      reviewLog:mergeArray(r.reviewLog,l.reviewLog).sort((a,b)=>stamp(a)-stamp(b)).slice(-2000)
    };
  }

  function mergeScienceCards(remote,local){
    const clean=value=>{
      const out={};
      if(!isObject(value))return out;
      const time=n=>typeof n==="number"&&Number.isSafeInteger(n)&&n>0&&n<Number.MAX_SAFE_INTEGER?n:0;
      for(const [id,row] of Object.entries(value).slice(0,512)){
        if(!/^(bio|phy)-[a-z0-9-]{1,60}$/.test(id)||!isObject(row))continue;
        const validStatus=["new","review","known"].includes(row.status);
        out[id]={status:validStatus?row.status:"new",statusAt:validStatus?time(row.statusAt):0,
          favorite:row.favorite===true,favoriteAt:typeof row.favorite==="boolean"?time(row.favoriteAt):0};
      }
      return out;
    };
    const r=clean(remote),l=clean(local),out={};
    for(const id of new Set([...Object.keys(r),...Object.keys(l)])){
      if(!r[id]||!l[id]){out[id]=r[id]||l[id];continue;}
      const status=l[id].statusAt>=r[id].statusAt?l[id]:r[id];
      const favorite=l[id].favoriteAt>=r[id].favoriteAt?l[id]:r[id];
      out[id]={status:status.status,statusAt:status.statusAt,favorite:favorite.favorite,favoriteAt:favorite.favoriteAt};
    }
    return out;
  }

  function mergeLab(remote,local){
    const r=isObject(remote)?remote:{},l=isObject(local)?local:{};
    return {
      paragraphLog:mergeArray(r.paragraphLog,l.paragraphLog).sort((a,b)=>stamp(a)-stamp(b)).slice(-500),
      elementFav:[...new Set([...(Array.isArray(r.elementFav)?r.elementFav:[]),...(Array.isArray(l.elementFav)?l.elementFav:[])])],
      timelineFav:[...new Set([...(Array.isArray(r.timelineFav)?r.timelineFav:[]),...(Array.isArray(l.timelineFav)?l.timelineFav:[])])],
      topicFav:[...new Set([...(Array.isArray(r.topicFav)?r.topicFav:[]),...(Array.isArray(l.topicFav)?l.topicFav:[])])],
      scienceCards:mergeScienceCards(r.scienceCards,l.scienceCards)
    };
  }

  function mergeGamificationTasks(remote,local){
    const r=isObject(remote)?remote:{},l=isObject(local)?local:{};
    const joinPeriods=kind=>{
      const out=Object.assign({},clone(isObject(r[kind])?r[kind]:{}));
      for(const [period,tasks] of Object.entries(isObject(l[kind])?l[kind]:{})){
        if(!Array.isArray(tasks)){continue;}
        if(!Array.isArray(out[period])){out[period]=clone(tasks);continue;}
        // Aynı dönem içindeki yenileme, kaynak görev kimliğini değiştirmez.
        const changed=Array.isArray(l.rerolledDays)&&l.rerolledDays.includes(period);
        const otherChanged=Array.isArray(r.rerolledDays)&&r.rerolledDays.includes(period);
        if(changed&&!otherChanged)out[period]=clone(tasks);
      }
      return out;
    };
    const claims={};
    for(const source of [r.claims,l.claims]){
      if(!isObject(source))continue;
      for(const [id,claim] of Object.entries(source)){
        if(!isObject(claim)||!Number.isSafeInteger(claim.at)||claim.at<=0)continue;
        if(!claims[id]||claim.at<claims[id].at)claims[id]=clone(claim);
      }
    }
    const schedule=new Map();
    for(const row of [...(Array.isArray(r.difficultySchedule)?r.difficultySchedule:[]),
      ...(Array.isArray(l.difficultySchedule)?l.difficultySchedule:[])]){
      if(!isObject(row)||typeof row.from!=="string")continue;
      schedule.set(row.from,clone(row));
    }
    return {
      daily:joinPeriods("daily"),weekly:joinPeriods("weekly"),claims,
      difficultySchedule:[...schedule.values()].sort((a,b)=>a.from.localeCompare(b.from)),
      rerolledDays:[...new Set([...(Array.isArray(r.rerolledDays)?r.rerolledDays:[]),
        ...(Array.isArray(l.rerolledDays)?l.rerolledDays:[])])].sort()
    };
  }

  /* İki cihazın kazanılmış rozet, hedef ve dinlenme planları birleştirilir.
     Farklı etkinleşme kimlikleri birbirine karıştırılmaz: ilk etkinleştirme korunur. */
  function mergeGamification(remote,local){
    if(!isObject(remote))return isObject(local)?clone(local):undefined;
    if(!isObject(local))return clone(remote);
    const a=Number(remote.activatedAt),b=Number(local.activatedAt);
    if(!Number.isSafeInteger(a)||a<=0)return clone(local);
    if(!Number.isSafeInteger(b)||b<=0)return clone(remote);
    if(a!==b)return clone(a<b?remote:local);
    const goals=new Map();
    for(const row of [...(Array.isArray(remote.goals)?remote.goals:[]),
                      ...(Array.isArray(local.goals)?local.goals:[])]){
      if(!isObject(row)||typeof row.from!=="string"||!Number.isInteger(row.minutes)||!Number.isInteger(row.questions))continue;
      const old=goals.get(row.from);
      if(!old||Number(row.updatedAt||0)>=Number(old.updatedAt||0))goals.set(row.from,clone(row));
    }
    const earned={};
    for(const source of [remote.earned,local.earned]){
      if(!isObject(source))continue;
      for(const [id,value] of Object.entries(source)){
        if(!isObject(value)||!Number.isFinite(value.at)||value.at<=0)continue;
        if(!earned[id]||value.at<earned[id].at)earned[id]=clone(value);
      }
    }
    const rests=new Set([...(Array.isArray(remote.restDays)?remote.restDays:[]),
                         ...(Array.isArray(local.restDays)?local.restDays:[])].filter(x=>typeof x==="string"&&/^\d{4}-\d{2}-\d{2}$/.test(x)));
    return Object.assign({},clone(remote),clone(local),{
      activatedAt:a,activationDay:remote.activationDay,
      baselineMinutes:remote.baselineMinutes,baselineQuestions:remote.baselineQuestions,
      goals:[...goals.values()].sort((x,y)=>x.from.localeCompare(y.from)),
      earned,restDays:[...rests].sort(),tasks:mergeGamificationTasks(remote.tasks,local.tasks)
    });
  }

  function mergeStates(remote,local,schemaVersion){
    const r=isObject(remote)?remote:{},l=isObject(local)?local:{};
    const out=Object.assign({},clone(r),clone(l));
    ["solved","pomoMin","pauses"].forEach(key=>out[key]=mergeNumberMap(r[key],l[key]));
    ["solvedTopic","pomoSubj"].forEach(key=>out[key]=mergeNestedNumberMap(r[key],l[key]));
    ["journal","dayReview","watched","topicRes","chCache","badgeAt"].forEach(key=>out[key]=mergeRecordMap(r[key],l[key]));
    out.topics=mergeTopics(r.topics,l.topics);
    out.weeks=mergeWeeks(r.weeks,l.weeks);
    out.sessions={};
    for(const day of new Set([...Object.keys(isObject(r.sessions)?r.sessions:{}),...Object.keys(isObject(l.sessions)?l.sessions:{})])){
      out.sessions[day]=mergeArray(r.sessions?.[day],l.sessions?.[day]).slice(-40);
    }
    out.swHistory={};
    for(const day of new Set([...Object.keys(isObject(r.swHistory)?r.swHistory:{}),...Object.keys(isObject(l.swHistory)?l.swHistory:{})])){
      out.swHistory[day]=mergeArray(r.swHistory?.[day],l.swHistory?.[day]).slice(-40);
    }
    ["denemeler","wrongLog","books","qbank","coachNotes","contracts","log","targets","templates","examTasks","calib","teachers"].forEach(key=>{
      out[key]=mergeArray(r[key],l[key]);
    });
    out.badges=[...new Set([...(Array.isArray(r.badges)?r.badges:[]),...(Array.isArray(l.badges)?l.badges:[])])];
    out.favTeachers=[...new Set([...(Array.isArray(r.favTeachers)?r.favTeachers:[]),...(Array.isArray(l.favTeachers)?l.favTeachers:[])])];
    out.learning=mergeLearning(r.learning,l.learning);
    out.lab=mergeLab(r.lab,l.lab);
    out.gamification=mergeGamification(r.gamification,l.gamification);
    out.v=Math.max(Number(schemaVersion)||0,Number(r.v)||0,Number(l.v)||0);
    return out;
  }

  function addDays(iso,days){
    const d=new Date(String(iso)+"T12:00:00");
    d.setDate(d.getDate()+Number(days||0));
    return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");
  }

  function srsNext(card,grade,today){
    const next=Object.assign({interval:0,ease:2.5,reps:0,lapses:0},clone(card)||{});
    const g=Math.max(0,Math.min(3,Math.floor(Number(grade)||0)));
    let interval=Math.max(0,Math.floor(Number(next.interval)||0)),ease=Math.max(1.3,Math.min(3.2,Number(next.ease)||2.5));
    if(g===0){interval=1;ease=Math.max(1.3,ease-.2);next.reps=0;next.lapses=(next.lapses|0)+1;}
    else if(g===1){interval=Math.max(1,Math.round(Math.max(1,interval)*1.2));ease=Math.max(1.3,ease-.15);next.reps=(next.reps|0)+1;}
    else if(g===2){interval=(next.reps|0)===0?1:(next.reps|0)===1?3:Math.max(2,Math.round(Math.max(1,interval)*ease));next.reps=(next.reps|0)+1;}
    else{interval=(next.reps|0)===0?4:Math.max(4,Math.round(Math.max(1,interval)*ease*1.3));ease=Math.min(3.2,ease+.15);next.reps=(next.reps|0)+1;}
    next.interval=Math.min(3650,interval);next.ease=Number(ease.toFixed(2));next.due=addDays(today,next.interval);next.updatedAt=Date.now();
    return next;
  }

  function plannedMinutes(text){
    const raw=String(text||"").toLocaleLowerCase("tr-TR");
    let total=0,match;
    const hours=/(\d+(?:[.,]\d+)?)\s*(?:saat|sa)\b/g;
    while((match=hours.exec(raw)))total+=Math.round(Number(String(match[1]).replace(",", "."))*60);
    const minutes=/(\d+)\s*(?:dk|dakika)\b/g;
    while((match=minutes.exec(raw)))total+=Math.max(0,Number(match[1])||0);
    return Math.max(0,Math.min(1440,Math.round(total)));
  }

  function focusPlanAllocation(tasks,selectedTaskId,totalMinutes,fallbackSubject){
    const total=Math.max(0,Math.floor(Number(totalMinutes)||0)),fallback=String(fallbackSubject||"Ders").trim()||"Ders";
    if(!total)return [];
    const list=(Array.isArray(tasks)?tasks:[]).map(task=>({
      id:String(task?.id??task?.cid??""),
      text:String(task?.text??task?.txt??""),
      subject:String(task?.subject??task?.subj??task?.label??task?.lbl??"").trim(),
      done:task?.done===true
    }));
    let start=list.findIndex(task=>task.id===String(selectedTaskId||""));
    if(start<0){
      const key=value=>String(value||"").toLocaleLowerCase("tr-TR").normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/^(tyt|ayt|ydt)\s+/i,"").trim();
      const wanted=key(fallback);
      start=list.findIndex(task=>!task.done&&key(task.subject)===wanted);
    }
    if(start<0)return[{subject:fallback,minutes:total,taskId:""}];
    const usable=list.slice(start).filter((task,index)=>index===0||!task.done);
    const out=[];let remaining=total,lastSubject=fallback;
    for(let index=0;index<usable.length&&remaining>0;index++){
      const task=usable[index],subject=task.subject||lastSubject||fallback,planned=plannedMinutes(task.text);
      lastSubject=subject;
      if(!planned){
        const previous=out[out.length-1];
        if(previous&&previous.subject===subject)previous.minutes+=remaining;
        else out.push({subject,minutes:remaining,taskId:task.id});
        remaining=0;break;
      }
      const take=Math.min(remaining,planned),previous=out[out.length-1];
      if(previous&&previous.subject===subject)previous.minutes+=take;
      else out.push({subject,minutes:take,taskId:task.id});
      remaining-=take;
    }
    if(remaining>0){
      const subject=lastSubject||fallback,previous=out[out.length-1];
      if(previous&&previous.subject===subject)previous.minutes+=remaining;
      else out.push({subject,minutes:remaining,taskId:""});
    }
    return out.filter(row=>row.minutes>0);
  }

  function monthSubjectTotals(pomoSubj,monthKey){
    const prefix=/^\d{4}-\d{2}$/.test(String(monthKey||""))?String(monthKey):new Date().toISOString().slice(0,7),map={};
    Object.entries(isObject(pomoSubj)?pomoSubj:{}).forEach(([day,row])=>{
      if(!day.startsWith(prefix+"-")||!isObject(row))return;
      Object.entries(row).forEach(([subject,value])=>{
        const name=String(subject||"Ders").trim()||"Ders",minutes=Math.max(0,Number(value)||0);
        if(minutes)map[name]=(map[name]||0)+minutes;
      });
    });
    return Object.entries(map).map(([subject,minutes])=>({subject,minutes:Math.round(minutes)})).sort((a,b)=>b.minutes-a.minutes||a.subject.localeCompare(b.subject,"tr"));
  }

  return {mergeStates,mergeArray,mergeTopics,mergeWeeks,srsNext,addDays,plannedMinutes,focusPlanAllocation,monthSubjectTotals};
});
