/* v57 — midnight day boundary for the original stopwatch.
 * No alternate timer engine or separate store; existing S.focus.sw persists day.
 * Local calendar dates (not UTC) own daily totals and the running display.
 */
(()=>{
  "use strict";
  if(window.__YKS_SW_DAILY_V57__)return;
  if(typeof sw!=="function"||typeof swElapsedAt!=="function"||typeof todayKey!=="function")return;
  window.__YKS_SW_DAILY_V57__=true;
  let rolling=false,midnightTimer=null;
  const localDateKey=timestamp=>keyOf(new Date(timestamp));
  const nextDay=day=>addDaysKey(day,1);
  const midnight=day=>new Date(day+"T00:00:00").getTime();
  function inferDay(w,nowKey){
    if(typeof w.day==="string"&&validDateKey(w.day))return w.day;
    if(w.run&&Number(w.start)>0)return localDateKey(w.start);
    if(Number(w.acc)>0){
      const keys=Object.keys(S.swHistory||{}).filter(validDateKey).sort();
      const recent=keys[keys.length-1];
      if(recent&&recent<=nowKey)return recent;
    }
    return nowKey;
  }
  function creditCompletedDay(w,day,elapsed){
    if(typeof isCoach==="function"&&isCoach())return;
    const minutes=Math.floor(Math.max(0,elapsed)/60000);
    const missing=Math.max(0,minutes-Math.max(0,Number(w.cr)||0));
    if(!missing)return;
    S.pomoMin[day]=(S.pomoMin[day]||0)+missing;
    if(!S.pomoSubj[day])S.pomoSubj[day]={};
    const name=pomoSubject||SUBJ_NAMES[0]||"Ders";
    S.pomoSubj[day][name]=(S.pomoSubj[day][name]||0)+missing;
    w.cr=minutes;
  }
  function saveDaySession(day,elapsed,start,end){
    const minutes=Math.floor(Math.max(0,elapsed)/60000);
    if(!minutes)return;
    if(!S.sessions||typeof S.sessions!=="object")S.sessions={};
    if(!Array.isArray(S.sessions[day]))S.sessions[day]=[];
    S.sessions[day].push({t:Math.max(midnight(day),end-elapsed,start||0),
      end,m:minutes,subj:pomoSubject||SUBJ_NAMES[0]||"Ders",
      task:"",type:"work",done:true,source:"sw"});
    if(S.sessions[day].length>40)S.sessions[day]=S.sessions[day].slice(-40);
  }
  function ensureDay(at=Date.now()){
    if(rolling)return false;
    const w=sw(),nowKey=localDateKey(at);
    const oldKey=inferDay(w,nowKey);
    if(!w.day)w.day=oldKey;
    if(oldKey===nowKey)return false;
    // A user changing the device date backwards should not delete work.
    if(oldKey>nowKey){w.day=nowKey;save();return false;}
    rolling=true;
    try{
      let day=oldKey,splitCount=0;
      while(day<nowKey&&splitCount++<370){
        const following=nextDay(day),end=midnight(following);
        if(!Number.isFinite(end)||end<=0)break;
        const elapsed=swElapsedAt(w,end);
        creditCompletedDay(w,day,elapsed);
        if(w.run){
          const start=Math.max(0,Number(w.start)||0);
          if(start>0&&start<end){
            // End one millisecond before midnight so the old calendar day
            // owns the history entry. Work duration is still exact.
            swHistoryAdd(end-start,pomoSubject||SUBJ_NAMES[0],start,end-1);
          }
        }
        saveDaySession(day,elapsed,Number(w.start)||0,end);
        w.acc=0;w.cr=0;w.start=w.run?end:0;w.day=following;
        S.focus.swLaps=[];
        day=following;
      }
      save();
    }finally{rolling=false;}
    try{
      renderSw();renderSwHistory();renderSessions();renderTimeDist();
    }catch(error){console.error("Yeni gün kronometresi yenilenemedi",error);}
    return true;
  }
  window.yksStopwatchEnsureDay=ensureDay;
  // The original tick may have been registered before this file loaded.
  // swElapsed is therefore the mandatory gate before minute crediting.
  const originalElapsed=swElapsed;
  swElapsed=function(){ensureDay();return originalElapsed.apply(this,arguments);};
  for(const name of ["swStart","swPause","swReset","swLap","swSwitchSubject"]){
    const original=window[name];
    if(typeof original!=="function")continue;
    window[name]=function(){ensureDay();return original.apply(this,arguments);};
  }
  function scheduleMidnight(){
    clearTimeout(midnightTimer);
    const now=new Date(),tomorrow=new Date(now);
    tomorrow.setHours(24,0,0,0);
    const wait=Math.max(10,Math.min(86400000,tomorrow.getTime()-now.getTime()+30));
    midnightTimer=setTimeout(()=>{ensureDay();scheduleMidnight();},wait);
  }
  const resume=()=>{ensureDay();scheduleMidnight();};
  document.addEventListener("visibilitychange",()=>{if(!document.hidden)resume();});
  window.addEventListener("focus",resume);
  window.addEventListener("pageshow",resume);
  resume();
})();
