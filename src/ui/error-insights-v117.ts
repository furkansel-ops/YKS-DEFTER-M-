import "./error-insights-v117.css";
import {NO_REASON,reasonStats,topicHeat,type InsightRow} from "../domain/error-insights.ts";

/* v117 · Hata analizi kartı: Deneme › Hatalar sekmesinde yanlış nedeni dağılımı ve konu ısı haritası.
   exam-hub-v73 kartı window.YKSErrorInsights.html(rows) ile ister; derse basınca oradaki ders süzgeci seçilir. */
const MIN_ROWS=3; // birkaç kayıttan önce dağılım yanıltıcı olur
const esc=(v:unknown)=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]!));

export function errorInsightsHtml(rows:InsightRow[]):string{
  if(!Array.isArray(rows)||rows.length<MIN_ROWS)return "";
  const reasons=reasonStats(rows),heat=topicHeat(rows),total=reasons.reduce((sum,r)=>sum+r.n,0);
  let html=`<div class="card ei-card"><div class="eh-card-head"><b>Hata analizi</b><small>${total} yanlış</small></div>`;
  if(reasons.some(r=>r.label!==NO_REASON))html+=`<div class="ei-reasons" role="list" aria-label="Yanlış nedenleri">${reasons.map(r=>
    `<div class="ei-reason" role="listitem"><small>${esc(r.label)}</small><i class="eh-bar"><i style="width:${r.pct}%"></i></i><b>${r.n} · %${r.pct}</b></div>`).join("")}</div>`;
  else html+=`<p class="hint">Hata eklerken sebep seçersen burada en sık yanlış nedenin görünür.</p>`;
  if(heat.length)html+=`<div class="eh-card-head ei-sub"><b>Konu ısı haritası</b><small>koyu = daha çok yanlış</small></div><div class="ei-heat">${heat.map(s=>
    `<div class="ei-row"><button type="button" class="ei-subject" data-act="heat" data-subject="${esc(s.subject)}" title="Bu dersin kayıtlarını göster">${esc(s.subject)} <small>${s.total}</small></button><div class="ei-cells">${s.topics.map(t=>
      `<span class="ei-cell" data-level="${t.level}"${t.open?"":' title="Çözüldü"'}>${esc(t.topic)} <b>${t.n}</b>${t.open?"":" ✓"}</span>`).join("")}${s.more?`<span class="ei-more">+${s.more} konu</span>`:""}</div></div>`).join("")}</div>`;
  return html+"</div>";
}

export function installErrorInsightsV117():void{
  (window as unknown as Record<string,unknown>).YKSErrorInsights={html:errorInsightsHtml};
}
