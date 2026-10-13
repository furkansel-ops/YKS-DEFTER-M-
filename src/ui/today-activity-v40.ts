/* Bugün v40: weekly focus rhythm + recent completed study sessions.
   All values come from the read-only legacy activity snapshot. */
type TodayActivityDayV40={date:string;min:number};
type TodayActivitySessionV40={date:string;at:number;min:number;subj:string;topic:string;kind:string};
type TodayActivityV40={today:string;days:TodayActivityDayV40[];sessions:TodayActivitySessionV40[]};
type TodayActivityWindowV40=Window&{
  yksTodayActivitySnapshot?:()=>TodayActivityV40;
  go?:(screen:string)=>unknown;
};
const DAY_NAMES_V40=["Pzt","Sal","Çar","Per","Cum","Cmt","Paz"];

export function installTodayActivityV40():{installed:boolean}{
  const root=document.getElementById("todayFreshActivity");
  const bars=document.getElementById("todayFreshWeekBars");
  const total=document.getElementById("todayFreshWeekTotal");
  const count=document.getElementById("todayFreshWeekDays");
  const recent=document.getElementById("todayFreshRecentList");
  const hint=document.getElementById("todayFreshActivityHint");
  const focus=document.getElementById("todayFreshRecentFocus");
  if(!root||!bars||!total||!count||!recent||!hint||!focus)return{installed:false};
  if(root.dataset.activityReady==="true")return{installed:true};

  const labelMinutes=(raw:number)=>{
    const min=Math.max(0,Math.round(Number(raw)||0)),h=Math.floor(min/60),m=min%60;
    return h?(m?h+" sa "+m+" dk":h+" sa"):min+" dk";
  };
  const node=(tag:string,className:string,content?:string)=>{
    const element=document.createElement(tag);
    element.className=className;
    if(content!==undefined)element.textContent=content;
    return element;
  };
  const set=(el:Element,value:string)=>{
    if(el.textContent!==value)el.textContent=value;
  };
  const shortDate=(date:string)=>{
    const d=new Date(date+"T12:00:00");
    return Number.isNaN(d.getTime())?date:new Intl.DateTimeFormat("tr-TR",{
      day:"numeric",month:"short"
    }).format(d);
  };
  let weekSignature="",recentSignature="";
  const sync=()=>{
    const read=(window as TodayActivityWindowV40).yksTodayActivitySnapshot;
    if(typeof read!=="function"){
      set(hint,"Çalışma verileri hazırlanıyor…");
      return;
    }
    let snapshot:TodayActivityV40;
    try{snapshot=read();}catch(error){
      console.error("Haftalık çalışma verileri alınamadı",error);
      set(hint,"Çalışma bilgileri şu an görüntülenemiyor.");
      return;
    }
    if(!Array.isArray(snapshot.days)||!Array.isArray(snapshot.sessions))return;
    const days=snapshot.days.slice(0,7);
    if(days.length!==7)return;
    const accumulated=days.reduce((n,d)=>n+Math.max(0,Number(d.min)||0),0);
    const active=days.filter(d=>Number(d.min)>0).length;
    set(total,labelMinutes(accumulated));
    set(count,active+" / 7 aktif gün");
    set(hint,accumulated>0
      ?"Sadece kaydedilmiş odak süreleri gösterilir."
      :"Bu hafta henüz kayıtlı odak süresi yok.");
    const max=Math.max(1,...days.map(d=>Math.max(0,Number(d.min)||0)));
    const signature=days.map(d=>d.date+":"+d.min).join("|")+"@"+snapshot.today;
    if(signature!==weekSignature){
      weekSignature=signature;
      const rendered=days.map((day,i)=>{
        const min=Math.max(0,Number(day.min)||0),isToday=day.date===snapshot.today;
        const isFuture=day.date>snapshot.today;
        const cell=node("div","today-fresh-week-day"+(isToday?" is-today":"")+
          (isFuture?" is-future":""));
        cell.setAttribute("aria-label",shortDate(day.date)+": "+
          (isFuture?"henüz gelmedi":labelMinutes(min)+" odak"));
        const track=node("div","today-fresh-week-track");
        const fill=node("div","today-fresh-week-fill");
        fill.style.height=min>0?Math.max(7,Math.round(min/max*100))+"%":"0%";
        track.append(fill);
        const title=node("span","today-fresh-week-label",DAY_NAMES_V40[i]||"—");
        const value=node("small","today-fresh-week-value",isFuture?"—":min>0?labelMinutes(min):"0");
        cell.append(track,title,value);
        return cell;
      });
      bars.replaceChildren(...rendered);
    }
    const entries=snapshot.sessions.slice(0,3);
    const sessionSignature=entries.map(x=>[x.date,x.at,x.min,x.subj,x.topic].join("~")).join("|");
    if(sessionSignature!==recentSignature||recent.dataset.rendered!=="true"){
      recentSignature=sessionSignature;
      recent.dataset.rendered="true";
      const items=entries.map(entry=>{
        const item=node("div","today-fresh-recent-item");
        const details=node("div","today-fresh-recent-detail");
        const title=node("strong","today-fresh-recent-subject",entry.subj||"Ders");
        const sub=node("small","today-fresh-recent-topic",entry.topic||"Odak çalışması");
        details.append(title,sub);
        const right=node("div","today-fresh-recent-meta");
        const when=new Date(entry.at);
        const time=Number.isNaN(when.getTime())?"—":new Intl.DateTimeFormat("tr-TR",{
          hour:"2-digit",minute:"2-digit"
        }).format(when);
        right.append(node("strong","today-fresh-recent-duration",labelMinutes(entry.min)),
          node("small","today-fresh-recent-when",shortDate(entry.date)+" · "+time));
        item.append(details,right);
        return item;
      });
      if(!items.length)items.push(node("p","today-fresh-recent-empty",
        "Son 14 günde ayrıntılı çalışma kaydı bulunmuyor."));
      recent.replaceChildren(...items);
    }
  };
  focus.addEventListener("click",()=>{
    const fn=(window as TodayActivityWindowV40).go;
    if(typeof fn==="function")fn("pomo");
  });
  window.addEventListener("yks:data-changed",sync);
  window.addEventListener("load",sync);
  document.addEventListener("visibilitychange",()=>{
    if(document.visibilityState==="visible")sync();
  });
  document.addEventListener("yks:navigation-after",sync);
  sync();
  root.dataset.activityReady="true";
  return{installed:true};
}
