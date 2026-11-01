import "./career-rank-v77.css";
import {computeExamRanks,rankSummary,type ExamRanks,type RankResult} from "../domain/exam-rank.ts";
import type {StudyGamificationSnapshot} from "../domain/study-gamification";
import {rankEmblemSvg,leagueColor} from "./rank-emblem.ts";

/* v77 · Kariyerim: deneme rankı kartı (TYT, alan AYT'si ya da YDT), sonraki lige kalan, rank geçmişi
   ve bugünün XP kırılımı. Veri yazmaz; deneme ekranına gitmek için yalnız go("deneme") çağrılır. */

type Loose=Record<string,unknown>;
const esc=(value:unknown)=>String(value??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]!));
const fmt=(n:number)=>String(Math.round(n*100)/100).replace(".",",");
function dayLabel(key:string):string{const [y,m,d]=key.split("-").map(Number);try{return new Date(y!,(m||1)-1,d||1).toLocaleDateString("tr-TR",{day:"numeric",month:"short"});}catch{return key;}}

function rankTile(rank:RankResult|null,label:string):string{
  if(!rank)return `<div class="rk-tile is-empty"><small>${esc(label)}</small><b>Henüz derecelendirilmedin</b><button type="button" data-rk-go-exam>İlk denemeni ekle ›</button></div>`;
  return `<div class="rk-tile" style="--rk:${leagueColor(rank.league)}">${rankEmblemSvg(rank.league,rank.tier,76)}<small>${esc(rank.label.toLocaleUpperCase("tr-TR"))}</small><b>${esc(rank.name)}</b><em>${fmt(rank.net)}${rank.max===80?" / 80":""} net · son ${rank.samples} deneme</em></div>`;
}
export function renderRankHero(state:Loose|null):HTMLElement{
  const ranks=computeExamRanks(state),card=document.createElement("section");
  card.className="rk-hero";card.setAttribute("aria-label","Deneme rankın");
  const second=ranks.track==="DIL"?rankTile(ranks.ydt,"YDT"):rankTile(ranks.ayt,ranks.ayt?.label||"AYT");
  const main=ranks.tyt;
  const next=main?(main.nextName?`<div class="rk-next"><span><b>${esc(main.nextName)}</b> ligine ${fmt(main.toNext)} net kaldı</span><span class="rk-track" role="progressbar" aria-label="Sonraki lige ilerleme" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round(main.progress*100)}"><i style="width:${Math.round(main.progress*100)}%"></i></span></div>`:`<div class="rk-next"><span>En üst ligdesin 👑</span></div>`):"";
  const history=ranks.history.slice(0,8).map(item=>{
    const mark=item.change==="first"?"ilk deneme":item.change==="league-up"?"▲ yeni lig":item.change==="up"?"▲":item.change==="down"?"▼":"—";
    return `<li><small>${esc(dayLabel(item.date))}</small><span class="rk-h-name">${rankEmblemSvg(item.league,item.tier,30)}${esc(item.name)}</span><em class="rk-h-${item.change}">${mark}</em></li>`;
  }).join("");
  card.innerHTML=`<div class="rk-head"><b>Deneme rankın</b><small>son 3 deneme ortalaması</small></div>
    <div class="rk-tiles">${rankTile(main,"TYT")}${second}</div>${next}
    ${history?`<details class="rk-history"><summary>Rank geçmişin <small>her denemeden sonra</small></summary><ul>${history}</ul></details>`:""}`;
  card.addEventListener("click",event=>{if((event.target as HTMLElement).closest("[data-rk-go-exam]"))(window as unknown as {go?:(s:string)=>void}).go?.("deneme");});
  return card;
}

export function renderTodayXp(snapshot:StudyGamificationSnapshot):HTMLElement{
  const x=snapshot.todayXp,card=document.createElement("section");card.className="rk-today";
  const row=(label:string,value:number,limit:string)=>value?`<li><span>${label}</span><small>${limit}</small><b>+${value}</b></li>`:"";
  const rows=[row("Odak",x.focus,"en fazla 120"),row("Soru",x.questions,"en fazla 80"),row("Günlük hedef tamam",x.goal,"günde 1 kez"),row("Paragraf & problem",x.pp,"en fazla 40"),row("Konu pekişti",x.topics,"günde 3 konu"),row("Tekrar tamamlandı",x.reviews,"günde 5"),row("Deneme ve yanlış analizi",x.exams,"günde 2 deneme"),row("Hata çözüldü",x.errors,"günde 5")].join("");
  card.innerHTML=`<div class="rk-head"><b>Bugün kazandığın XP</b><small>günlük sınırlarla</small></div>${rows?`<ul>${rows}<li class="rk-total"><span>Toplam</span><small></small><b>+${x.total}</b></li></ul>`:`<p class="rk-empty">Bugün henüz XP yok. Odaklan, soru çöz ya da bir konuyu pekiştir.</p>`}`;
  return card;
}

/** Bugün kısayolu ve koç için kısa özet. */
export function careerSummary(state:Loose|null,snapshot:StudyGamificationSnapshot|null):{level:number;xp:number;tyt:ReturnType<typeof rankSummary>;ayt:ReturnType<typeof rankSummary>;ydt:ReturnType<typeof rankSummary>}{
  const ranks:ExamRanks=computeExamRanks(state);
  return {level:snapshot?.activated?snapshot.level:0,xp:snapshot?.activated?snapshot.xp:0,tyt:rankSummary(ranks.tyt),ayt:rankSummary(ranks.ayt),ydt:rankSummary(ranks.ydt)};
}
