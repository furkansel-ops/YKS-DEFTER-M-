(function(root,factory){
  const api=factory();
  if(typeof module==="object"&&module.exports)module.exports=api;
  if(root)root.YKSCore=api;
})(typeof window!=="undefined"?window:null,function(){
  "use strict";

  const clone=value=>value===undefined?undefined:JSON.parse(JSON.stringify(value));
  const isObject=value=>!!value&&typeof value==="object"&&!Array.isArray(value);
  const sameValue=(a,b)=>{
    if(a===b)return true;
    try{return JSON.stringify(a)===JSON.stringify(b);}catch(e){return false;}
  };
  const stamp=value=>Math.max(0,Number(value?.updatedAt||value?.at||value?.end||value?.t||0)||0);
  const recordKey=(value,path="")=>{
    if(!value||typeof value!=="object"||Array.isArray(value))return "";
    if(value.id!==undefined&&value.id!==null)return "id:"+String(value.id);
    if(value.key!==undefined&&value.key!==null)return "key:"+String(value.key);
    if(path==="contracts"&&value.wk)return "contract:"+String(value.wk);
    if(value.day&&value.subj)return "session:"+[value.day,value.t,value.subj,value.topic,value.m].join("|");
    if(value.t!==undefined&&value.t!==null)return "time:"+[value.t,value.subj,value.topic,value.type,value.m].join("|");
    return "";
  };
  const stableKey=(value,index)=>{
    const key=recordKey(value);
    if(key)return key;
    return "value:"+JSON.stringify(value)+":"+index;
  };

  const setArrayPath=path=>/(^|\.)(badges|favTeachers|formulaFav|elementFav|timelineFav|topicFav|rev)$/.test(path)||path==="morning.done"||path==="teachers[].d";
  const multisetArrayPath=path=>path==="books[].log";
  function mergeSetArray3(base,remote,local){
    const values=new Map(),keys=value=>JSON.stringify(value);
    for(const value of [...base,...remote,...local])values.set(keys(value),clone(value));
    const has=(list,key)=>list.some(value=>keys(value)===key),out=[];
    for(const [key,value] of values){
      const b=has(base,key),r=has(remote,key),l=has(local,key);
      if((b&&r&&l)||(!b&&(r||l)))out.push(value);
    }
    return out;
  }
  function mergeMultisetArray3(base,remote,local){
    const key=value=>JSON.stringify(value),counts=list=>{
      const map=new Map();for(const value of list){const k=key(value),row=map.get(k)||{value:clone(value),count:0};row.count++;map.set(k,row);}return map;
    };
    const bm=counts(base),rm=counts(remote),lm=counts(local),order=[];
    for(const list of [remote,local,base])for(const value of list){const k=key(value);if(!order.includes(k))order.push(k);}
    const out=[];
    for(const k of order){
      const b=bm.get(k)?.count||0,r=rm.get(k)?.count||0,l=lm.get(k)?.count||0;
      const count=r===l?r:r===b?l:l===b?r:Math.max(0,r+l-b);
      const value=(lm.get(k)||rm.get(k)||bm.get(k)).value;
      for(let i=0;i<count;i++)out.push(clone(value));
    }
    return out;
  }
  function mergeRecordArray3(base,remote,local,path){
    const maps=[base,remote,local].map(list=>new Map(list.map(value=>[recordKey(value,path),value])));
    const order=[];
    for(const list of [remote,local,base])for(const value of list){const key=recordKey(value,path);if(key&&!order.includes(key))order.push(key);}
    const out=[];
    for(const key of order){
      const value=mergeValue3(maps[0].get(key),maps[1].get(key),maps[2].get(key),path+"[]");
      if(value!==undefined)out.push(value);
    }
    return out;
  }
  function mergeArray3(base,remote,local,path){
    if(setArrayPath(path))return mergeSetArray3(base,remote,local);
    if(multisetArrayPath(path))return mergeMultisetArray3(base,remote,local);
    const all=[...base,...remote,...local],keyed=all.length>0&&all.every(value=>!!recordKey(value,path));
    if(keyed)return mergeRecordArray3(base,remote,local,path);
    const out=[],length=Math.max(base.length,remote.length,local.length);
    for(let i=0;i<length;i++){
      const value=mergeValue3(base[i],remote[i],local[i],path+"[]");
      if(value!==undefined)out.push(value);
    }
    return out;
  }
  function mergeValue3(base,remote,local,path=""){
    if(sameValue(remote,local))return clone(remote);
    if(sameValue(remote,base))return clone(local);
    if(sameValue(local,base))return clone(remote);
    /* Bir taraf tabandaki değeri açıkça kaldırmışsa, diğer taraftaki eski veya
       eşzamanlı düzenleme kaydı yeniden diriltmesin. Çakışma yedeği üst katmanda
       tutulduğu için kullanıcı gerekirse silinen sürüme geri dönebilir. */
    if(remote===undefined||local===undefined)return undefined;
    if(Array.isArray(remote)&&Array.isArray(local))return mergeArray3(Array.isArray(base)?base:[],remote,local,path);
    if(isObject(remote)&&isObject(local)){
      /* Sabah kontrol listesi yalnız kendi gününe aittir. İki cihaz farklı
         günlerdeyse en yeni günün nesnesini bütün olarak seç; eski günün
         tamamlamalarını yeni güne taşımak yanlış işaretler üretir. */
      if(path==="morning"&&remote.day!==local.day){
        const rd=String(remote.day||""),ld=String(local.day||"");
        return clone(rd>ld?remote:local);
      }
      const b=isObject(base)?base:{},out={};
      for(const key of new Set([...Object.keys(b),...Object.keys(remote),...Object.keys(local)])){
        const value=mergeValue3(b[key],remote[key],local[key],path?path+"."+key:key);
        if(value!==undefined)out[key]=value;
      }
      if(path==="books[]"&&Number.isFinite(out.done)&&Number.isFinite(out.total))out.done=Math.max(0,Math.min(Number(out.total),Number(out.done)));
      return out;
    }
    /* Kaynak ilerlemesi artı/eksi düğmeleriyle delta olarak değişir. Aynı
       tabandan iki cihazın yaptığı değişiklikleri topla; birini ezme. */
    if(path==="books[].done"&&[base,remote,local].every(Number.isFinite))return Math.max(0,Number(remote)+Number(local)-Number(base));
    /* Aynı alan iki cihazda da değiştiyse, çakışmayı çözmekte olan cihazın
       bekleyen yerel düzeltmesi son yazma olarak kabul edilir. */
    return clone(local);
  }

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

  function mergeStates(remote,local,schemaVersion,base){
    const r=isObject(remote)?remote:{},l=isObject(local)?local:{};
    if(isObject(base)){
      const out=mergeValue3(base,r,l)||{};
      out.v=Math.max(Number(schemaVersion)||0,Number(base.v)||0,Number(r.v)||0,Number(l.v)||0);
      return out;
    }
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

  return {mergeStates,mergeArray,mergeTopics,mergeWeeks,srsNext,addDays};
});
