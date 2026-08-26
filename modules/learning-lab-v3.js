/* YKS Defterim — Öğrenme Laboratuvarı v3 | ana araçlar + periyodik tablo + kronoloji timeline */
(function(){
  "use strict";
  if(window.__YKS_LEARNING_LAB_V3__)return;
  window.__YKS_LEARNING_LAB_V3__=true;

  const $=id=>document.getElementById(id);
  const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])||c);
  const GROUPS={1:[1,3,11,19,37,55,87],2:[4,12,20,38,56,88],3:[21,39,57,89],4:[22,40,72,104],5:[23,41,73,105],6:[24,42,74,106],7:[25,43,75,107],8:[26,44,76,108],9:[27,45,77,109],10:[28,46,78,110],11:[29,47,79,111],12:[30,48,80,112],13:[5,13,31,49,81,113],14:[6,14,32,50,82,114],15:[7,15,33,51,83,115],16:[8,16,34,52,84,116],17:[9,17,35,53,85,117],18:[2,10,18,36,54,86,118]};
  const YKS_FOCUS=new Set([1,2,3,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,24,25,26,27,28,29,30,35,36,47,53,54,56,74,78,79,80,82,92]);
  const TYPES=["Tümü","Alkali metal","Toprak alkali metal","Geçiş metali","Metal","Yarı metal","Ametal","Halojen","Soy gaz","Lantanit","Aktinit"];
  const TIMELINE_ERAS=["İlk Çağ","Türk-İslam","Osmanlı","Milli Mücadele","Cumhuriyet","Dünya"];
  let active="periodic",science="Biyoloji",periodicType="Tümü",periodicYksOnly=false,observer=null,periodicObserver=null,queued=false;

  function groupOf(z){for(const [g,list] of Object.entries(GROUPS))if(list.includes(z))return g;return (z>=58&&z<=71)?"Lantanit":(z>=90&&z<=103)?"Aktinit":"—";}
  function blockOf(z){const g=groupOf(z);if(g==="Lantanit"||g==="Aktinit")return "f";const n=Number(g);return n<=2?"s":n>=13?"p":"d";}
  function elementData(z){return window.YKSLearningLab?.elements?.[Number(z)-1]||null;}
  function selectedElement(){const z=Number(document.querySelector('#v320ElementGrid .v320-element.active small')?.textContent)||26;return elementData(z);}
  function valenceHint(x){const g=groupOf(x.n);if(g==="Lantanit"||g==="Aktinit"||Number(g)>=3&&Number(g)<=12)return "Geçiş/iç geçiş: tek bir değerlik kuralına zorlamadan elektron dizilimine bak.";if(x.n===2)return "He: ilk katman 2 elektronla doludur.";const n=Number(g);const val=n<=2?n:n-10;return "Ana grup için hızlı ipucu: yaklaşık "+val+" değerlik elektronu düşün.";}
  function ionHint(x){const g=Number(groupOf(x.n));if(x.type==="Soy gaz")return "Kararlı katman nedeniyle iyon oluşturma eğilimi düşüktür.";if(g===1)return "Sık görülen iyon eğilimi: +1.";if(g===2)return "Sık görülen iyon eğilimi: +2.";if(g===17)return "Sık görülen iyon eğilimi: −1.";if(g===16&&x.type==="Ametal")return "Ametal üyelerde −2 iyonu sık görülür.";if(g===15&&x.type==="Ametal")return "Ametal üyelerde −3 iyonu görülebilir; bağ sorusunda ortaklaşmayı da kontrol et.";if(x.type==="Geçiş metali")return "Birden fazla yükseltgenme basamağı görülebilir; sabit yük varsayma.";return "İyon yükünü sınıf + grup + elektron dizilimiyle birlikte değerlendir.";}
  function trapHint(x){const map={"Alkali metal":"Aşağı indikçe metalik karakter ve genel tepkime eğilimi artar; atom yarıçapı da büyür.","Toprak alkali metal":"Alkali metallerle aynı grup değildir; iki değerlik elektronu vurgusunu koru.","Geçiş metali":"4s ve 3d elektronlarını iyonlaşmada ezbere aynı sırayla çıkarma.","Metal":"Metalik karakteri yalnız iletkenlikle değil periyodik konumla da yorumla.","Yarı metal":"Metal/ametal diye zorla ikiye ayırma; yarı iletkenlik tipik ipucudur.","Ametal":"Elektronegatiflik ve elektron alma eğilimi genellikle sağa-yukarı yönünde güçlenir.","Halojen":"Grup 17'yi soy gaz sanma; bir elektron alarak kararlı düzene yaklaşma eğilimi belirgindir.","Soy gaz":"Elektronegatiflik karşılaştırmalarında soy gazlar çoğu temel YKS sorusunda kapsam dışında tutulur.","Lantanit":"Tablonun altında çizilse de 6. periyodun devamıdır.","Aktinit":"Tablonun altında çizilse de 7. periyodun devamıdır; çoğu radyoaktiftir."};return map[x.type]||"Genel eğilimleri istisna bilgisiyle karıştırmadan önce elementin grup ve periyodunu belirle.";}

  function injectStyle(){
    if($("v4LearningLabV3Style"))return;
    const s=document.createElement("style");s.id="v4LearningLabV3Style";s.textContent=`
      #v320LearningLab .v4lab-main-tabs{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:7px}
      #v320LearningLab .v4lab-main-tabs button{min-height:42px;padding:9px 11px;border-radius:11px;white-space:normal}
      #v320PanelScience{padding-top:2px}
      .v4-science-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin:4px 0 12px}.v4-science-head small,.v4-science-head b,.v4-science-head p{display:block}.v4-science-head small{font-size:10px;text-transform:uppercase;letter-spacing:.06em;color:var(--label-3);font-weight:800}.v4-science-head b{font-size:18px;margin-top:3px}.v4-science-head p{font-size:11px;color:var(--label-2);margin:4px 0 0;line-height:1.45}
      .v4-science-switch{display:flex;gap:6px;flex-wrap:wrap}.v4-science-switch button{border:.5px solid var(--glass-line);background:var(--fill);color:var(--label-2);border-radius:999px;padding:7px 11px;font-size:10px;font-weight:800}.v4-science-switch button.on{background:var(--accent);color:#fff;border-color:transparent}
      .v4-science-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}.v4-science-card{display:flex;gap:10px;padding:11px;border:.5px solid var(--glass-line);border-radius:15px;background:var(--glass)}.v4-science-card>i{font-style:normal;font-size:28px;line-height:1}.v4-science-card b{display:block;font-size:13px}.v4-science-card p{font-size:10.5px;line-height:1.45;color:var(--label-1);margin:4px 0}.v4-science-card small,.v4-science-card em{display:block;font-size:9.5px;line-height:1.4;color:var(--label-2);font-style:normal;margin-top:4px}.v4-science-card strong{color:var(--label-1)}.v4-science-empty{padding:18px;border:.5px dashed var(--glass-line);border-radius:14px;color:var(--label-3);font-size:11px;text-align:center}
      .v4-periodic-study{display:grid;gap:10px;margin:0 0 12px}.v4-periodic-trends{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:7px}.v4-trend-card{padding:10px;border:.5px solid var(--glass-line);border-radius:13px;background:var(--glass);min-height:82px}.v4-trend-card i{font-style:normal;font-size:22px;display:block}.v4-trend-card b{font-size:11px;display:block;margin-top:4px}.v4-trend-card span{font-size:9.5px;color:var(--label-2);line-height:1.35;display:block;margin-top:3px}
      .v4-periodic-filterbar{display:flex;gap:7px;align-items:center;flex-wrap:wrap;padding:9px;border:.5px solid var(--glass-line);border-radius:13px;background:var(--fill)}.v4-periodic-filterbar label{display:flex;align-items:center;gap:6px;font-size:10px;font-weight:800;color:var(--label-2)}.v4-periodic-filterbar select,.v4-periodic-filterbar button{min-height:34px;border:.5px solid var(--glass-line);background:var(--glass);color:var(--label-1);border-radius:10px;padding:6px 9px;font-size:10px}.v4-periodic-filterbar button.on{background:var(--accent);color:#fff;border-color:transparent}.v4-periodic-filter-meta{margin-left:auto;font-size:9.5px;color:var(--label-3)}
      .v4-element-legend{display:flex;flex-wrap:wrap;gap:5px}.v4-element-legend button{border:.5px solid var(--glass-line);background:var(--glass);color:var(--label-2);border-radius:999px;padding:5px 8px;font-size:9px}.v4-element-legend button.on{background:var(--label-1);color:var(--bg);border-color:transparent}
      .v4-yks-trend-panel{display:grid;grid-template-columns:1.1fr 1fr;gap:9px;padding:11px;border:.5px solid var(--glass-line);border-radius:14px;background:var(--glass)}.v4-yks-trend-panel>div{display:grid;gap:4px}.v4-yks-trend-panel b{font-size:11px}.v4-yks-trend-panel span{font-size:9.5px;line-height:1.4;color:var(--label-2)}
      .v4-element-yks-detail{margin-top:10px;padding:11px;border:.5px solid var(--glass-line);border-radius:14px;background:var(--fill)}.v4-element-yks-detail>div:first-child{display:flex;justify-content:space-between;align-items:center;gap:8px}.v4-element-yks-detail small{font-size:9px;text-transform:uppercase;letter-spacing:.05em;color:var(--label-3);font-weight:800}.v4-element-yks-detail b{font-size:12px}.v4-element-yks-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:7px;margin-top:8px}.v4-element-yks-grid article{padding:8px;border-radius:10px;background:var(--glass)}.v4-element-yks-grid article b{font-size:9.5px;display:block}.v4-element-yks-grid article p{font-size:9.5px;line-height:1.4;color:var(--label-2);margin:3px 0 0}
      .v4-timeline-upgrade{margin:4px 0 14px;padding:14px;border:.5px solid var(--glass-line);border-radius:17px;background:linear-gradient(145deg,var(--glass),color-mix(in srgb,var(--accent) 5%,var(--glass)))}.v4-timeline-head{display:flex;align-items:flex-start;justify-content:space-between;gap:14px}.v4-timeline-head small,.v4-timeline-head b,.v4-timeline-head p{display:block}.v4-timeline-head small{font-size:9px;font-weight:850;letter-spacing:.06em;text-transform:uppercase;color:var(--accent)}.v4-timeline-head b{font-size:18px;margin-top:3px}.v4-timeline-head p{max-width:650px;margin:4px 0 0;font-size:11px;line-height:1.45;color:var(--label-2)}.v4-timeline-reset{flex:none;border:.5px solid var(--glass-line);border-radius:10px;background:var(--fill);color:var(--label-2);padding:7px 10px;font-size:10px;font-weight:800;cursor:pointer}
      .v4-timeline-overview{position:relative;display:flex;gap:7px;overflow-x:auto;scrollbar-width:none;margin-top:13px;padding:8px 2px}.v4-timeline-overview::-webkit-scrollbar{display:none}.v4-timeline-overview:before{content:"";position:absolute;left:10px;right:10px;top:50%;height:2px;background:var(--sep);transform:translateY(-50%)}.v4-timeline-overview button{position:relative;z-index:1;flex:1 0 112px;min-height:47px;border:.5px solid var(--glass-line);border-radius:12px;background:var(--bg);color:var(--label-2);padding:7px 9px;text-align:left;cursor:pointer}.v4-timeline-overview button.on{border-color:var(--accent);background:var(--accent-soft);color:var(--accent)}.v4-timeline-overview button b,.v4-timeline-overview button span{display:block}.v4-timeline-overview button b{font-size:10.5px}.v4-timeline-overview button span{font-size:8.5px;margin-top:2px;color:var(--label-3)}.v4-timeline-overview button.on span{color:inherit}
      .v4-timeline-stats{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:7px;margin-top:10px}.v4-timeline-stats>div{padding:9px;border-radius:11px;background:var(--fill)}.v4-timeline-stats small,.v4-timeline-stats b{display:block}.v4-timeline-stats small{font-size:8.5px;color:var(--label-3)}.v4-timeline-stats b{margin-top:2px;font-size:11px;overflow-wrap:anywhere}
      #v320Timeline.v4-history-timeline{position:relative;display:grid;grid-template-columns:minmax(0,1fr) 46px minmax(0,1fr);gap:10px 0;padding:7px 0 2px}#v320Timeline.v4-history-timeline:before{content:"";position:absolute;left:50%;top:20px;bottom:10px;width:2px;border-radius:99px;background:linear-gradient(180deg,var(--accent),color-mix(in srgb,var(--accent) 28%,var(--sep)),var(--sep));transform:translateX(-50%)}
      #v320Timeline .v4-timeline-era{position:relative;z-index:2;grid-column:1/-1;display:flex;justify-content:center;margin:8px 0 2px}#v320Timeline .v4-timeline-era span{padding:6px 10px;border:.5px solid color-mix(in srgb,var(--accent) 35%,var(--glass-line));border-radius:999px;background:var(--bg);color:var(--accent);font-size:9px;font-weight:850;letter-spacing:.04em;text-transform:uppercase}
      #v320Timeline.v4-history-timeline .v320-event{position:relative;margin:0;min-width:0;border:.5px solid var(--glass-line);box-shadow:0 8px 24px rgba(0,0,0,.035)}#v320Timeline.v4-history-timeline .v320-event:before{display:none}#v320Timeline.v4-history-timeline .v320-event:after{content:"";position:absolute;top:25px;height:1px;background:color-mix(in srgb,var(--accent) 48%,var(--sep))}#v320Timeline .v4-side-left{grid-column:1;margin-right:14px!important}#v320Timeline .v4-side-right{grid-column:3;margin-left:14px!important}#v320Timeline .v4-side-left:after{right:-30px;width:30px}#v320Timeline .v4-side-right:after{left:-30px;width:30px}
      #v320Timeline .v4-timeline-node{position:absolute;z-index:3;top:18px;width:14px;height:14px;border:3px solid var(--bg);border-radius:50%;background:var(--accent);box-shadow:0 0 0 1px color-mix(in srgb,var(--accent) 55%,transparent)}#v320Timeline .v4-side-left .v4-timeline-node{right:-44px}#v320Timeline .v4-side-right .v4-timeline-node{left:-44px}#v320Timeline .v4-timeline-order{display:inline-grid;place-items:center;min-width:22px;height:22px;margin-right:7px;padding:0 5px;border-radius:7px;background:var(--fill);color:var(--label-3);font-size:8.5px;font-weight:850}#v320Timeline .v320-event-head>div{min-width:0}#v320Timeline .v320-event-head>div:first-child{flex:1}#v320Timeline .v320-event-head b{display:block;margin-top:3px;line-height:1.35}#v320Timeline .v320-event-year{display:inline-block;padding:3px 6px;border-radius:7px;background:var(--accent-soft);color:var(--accent)}#v320Timeline .v4-timeline-result:before{content:"Sonuç / etkisi";display:block;margin-bottom:3px;color:var(--label-3);font-size:8px;font-weight:850;letter-spacing:.04em;text-transform:uppercase}#v320Timeline .empty{grid-column:1/-1}
      @media(max-width:980px){.v4-periodic-trends{grid-template-columns:repeat(3,minmax(0,1fr))}}
      @media(max-width:760px){#v320LearningLab .v4lab-main-tabs,.v4-science-grid,.v4-yks-trend-panel,.v4-element-yks-grid{grid-template-columns:1fr}.v4-science-head,.v4-timeline-head{flex-direction:column}.v4-periodic-trends{grid-template-columns:repeat(2,minmax(0,1fr))}.v4-periodic-filter-meta{width:100%;margin-left:0}.v4-timeline-reset{width:100%}#v320Timeline.v4-history-timeline{grid-template-columns:26px minmax(0,1fr);gap:8px 0}#v320Timeline.v4-history-timeline:before{left:10px;transform:none}#v320Timeline .v4-timeline-era{grid-column:1/-1;justify-content:flex-start}#v320Timeline .v4-side-left,#v320Timeline .v4-side-right{grid-column:2;margin:0!important}#v320Timeline .v4-side-left:after,#v320Timeline .v4-side-right:after{left:-16px;right:auto;width:16px}#v320Timeline .v4-side-left .v4-timeline-node,#v320Timeline .v4-side-right .v4-timeline-node{left:-23px;right:auto}.v4-timeline-stats{grid-template-columns:repeat(3,minmax(0,1fr))}}
      @media(max-width:430px){.v4-timeline-upgrade{padding:11px}.v4-timeline-stats{grid-template-columns:1fr}.v4-timeline-overview button{flex-basis:104px}}
    `;document.head.appendChild(s);
  }

  function scienceRows(){const dives=window.YKSLearningLabV2?.deepDives||{};return Array.isArray(dives[science])?dives[science]:[];}
  function renderScience(){const root=$("v4ScienceCards");if(!root)return;$("v4ScienceBiology")?.classList.toggle("on",science==="Biyoloji");$("v4SciencePhysics")?.classList.toggle("on",science==="Fizik");const rows=scienceRows();root.innerHTML=rows.length?'<div class="v4-science-grid">'+rows.map(x=>'<article class="v4-science-card"><i>'+esc(x[0])+'</i><div><b>'+esc(x[1])+'</b><p>'+esc(x[2])+'</p><small><strong>Sık hata:</strong> '+esc(x[3])+'</small><em><strong>YKS taktiği:</strong> '+esc(x[4])+'</em></div></article>').join("")+'</div>':'<div class="v4-science-empty">Bilim kartları hazırlanıyor.</div>';}

  function renderPeriodicStudy(){
    const root=$("v4PeriodicStudy");if(!root)return;
    root.innerHTML='<div class="v4-periodic-trends">'+[
      ["↙","Atom çapı","Sola ve aşağı genel olarak artar."],["↗","İyonlaşma enerjisi","Sağa ve yukarı genel olarak artar."],["↗","Elektronegatiflik","Sağa ve yukarı artar; soy gazları temel karşılaştırmada dışarıda düşün."],["↙","Metalik karakter","Sola ve aşağı artar."],["↗","Ametalik karakter","Sağa ve yukarı artar."]
    ].map(x=>'<article class="v4-trend-card"><i>'+x[0]+'</i><b>'+x[1]+'</b><span>'+x[2]+'</span></article>').join('')+'</div><div class="v4-periodic-filterbar"><label>Element türü <select id="v4PeriodicType" onchange="v4PeriodicSetType(this.value)">'+TYPES.map(x=>'<option '+(periodicType===x?'selected':'')+'>'+esc(x)+'</option>').join('')+'</select></label><button id="v4PeriodicYksOnly" class="'+(periodicYksOnly?'on':'')+'" type="button" onclick="v4PeriodicToggleYks()">🎯 YKS Odak</button><button id="v4PeriodicFavProxy" type="button" onclick="v4PeriodicToggleFavorites()">☆ Favoriler</button><button type="button" onclick="v4PeriodicReset()">↺ Sıfırla</button><span id="v4PeriodicFilterMeta" class="v4-periodic-filter-meta"></span></div><div class="v4-element-legend">'+TYPES.slice(1).map(x=>'<button class="'+(periodicType===x?'on':'')+'" type="button" onclick="v4PeriodicSetType(\''+x.replace(/'/g,"\\'")+'\')">'+esc(x)+'</button>').join('')+'</div><div class="v4-yks-trend-panel"><div><b>YKS trend paneli</b><span>İzoelektronik türlerde proton sayısı arttıkça yarıçap küçülür.</span><span>Katyon, nötr atomundan genellikle daha küçük; anyon daha büyüktür.</span></div><div><b>Sık karıştırılan istisna</b><span>1. iyonlaşma enerjisinde Be→B ve N→O geçişleri genel sağa-artış eğilimine istisna oluşturabilir.</span><span>Önce genel yönü kur, sonra elektron dizilimi istisnasını kontrol et.</span></div></div>';
    syncFavoriteProxy();
  }

  function syncFavoriteProxy(){const source=$("v320ElementFavOnly"),proxy=$("v4PeriodicFavProxy");if(!proxy)return;const on=!!source?.checked;proxy.classList.toggle("on",on);proxy.textContent=on?"★ Favoriler açık":"☆ Favoriler";}
  function applyPeriodicFilters(){
    const grid=$("v320ElementGrid");if(!grid)return;
    let visible=0,total=0;grid.querySelectorAll('.v320-element').forEach(btn=>{const z=Number(btn.querySelector('small')?.textContent),x=elementData(z);if(!x)return;total++;const show=(periodicType==="Tümü"||x.type===periodicType)&&(!periodicYksOnly||YKS_FOCUS.has(z));btn.hidden=!show;if(show)visible++;});
    const meta=$("v4PeriodicFilterMeta");if(meta)meta.textContent=visible+" / "+total+" element"+(periodicYksOnly?" · YKS odak":"")+(periodicType!=="Tümü"?" · "+periodicType:"");
    syncFavoriteProxy();enhancePeriodicDetail();
  }
  function enhancePeriodicDetail(){
    const detail=$("v320ElementDetail"),x=selectedElement();if(!detail||!x)return;
    let box=$("v4ElementYksDetail");if(box?.dataset.z===String(x.n))return;if(box)box.remove();
    box=document.createElement('section');box.id='v4ElementYksDetail';box.className='v4-element-yks-detail';box.dataset.z=String(x.n);
    const g=groupOf(x.n),block=blockOf(x.n);
    box.innerHTML='<div><div><small>YKS hızlı okuma</small><b>'+esc(x.name)+' · '+esc(g)+'. grup / '+esc(x.period)+'. periyot / '+esc(block)+' blok</b></div><span>🎯</span></div><div class="v4-element-yks-grid"><article><b>Değerlik ipucu</b><p>'+esc(valenceHint(x))+'</p></article><article><b>İyon / yük ipucu</b><p>'+esc(ionHint(x))+'</p></article><article><b>Karıştırma</b><p>'+esc(trapHint(x))+'</p></article><article><b>Trend kullanımı</b><p>Aynı periyotta sağa giderken yarıçap küçülme; iyonlaşma ve elektronegatiflik artma eğilimindedir. Aynı grupta aşağı inerken yarıçap ve metalik karakter artar.</p></article></div>';
    detail.appendChild(box);
  }
  function ensurePeriodicStudy(){
    const panel=$("v320PanelPeriodic");if(!panel)return;
    let root=$("v4PeriodicStudy");if(!root){root=document.createElement('section');root.id='v4PeriodicStudy';root.className='v4-periodic-study';const guide=$("v4PeriodicGuide");if(guide?.nextSibling)guide.parentNode.insertBefore(root,guide.nextSibling);else panel.prepend(root);renderPeriodicStudy();}
    const grid=$("v320ElementGrid");if(grid&&(!periodicObserver||periodicObserver.__grid!==grid)){periodicObserver?.disconnect?.();periodicObserver=new MutationObserver(()=>requestAnimationFrame(applyPeriodicFilters));periodicObserver.__grid=grid;periodicObserver.observe(grid,{childList:true});}
    applyPeriodicFilters();
  }

  function timelineRows(){const rows=window.YKSLearningLab?.timeline;return Array.isArray(rows)?rows:[];}
  function currentTimelineEra(){return $("v320TimelineEra")?.value||"Tümü";}
  function renderTimelineOverview(){
    const root=$("v4TimelineOverview");if(!root)return;
    const rows=timelineRows(),current=currentTimelineEra(),markup=['<button class="'+(current==="Tümü"?'on':'')+'" type="button" aria-pressed="'+(current==="Tümü")+'" onclick="v4TimelineChooseEra(\'Tümü\')"><b>Tüm dönemler</b><span>'+rows.length+' olay</span></button>'].concat(TIMELINE_ERAS.map(era=>{const count=rows.filter(x=>x.era===era).length;return '<button class="'+(current===era?'on':'')+'" type="button" aria-pressed="'+(current===era)+'" onclick="v4TimelineChooseEra(\''+era+'\')"><b>'+esc(era)+'</b><span>'+count+' olay</span></button>';})).join('');
    if(root.dataset.markup!==markup){root.dataset.markup=markup;root.innerHTML=markup;}
  }
  function ensureTimelineExperience(){
    const panel=$("v320PanelTimeline");if(!panel)return false;
    let box=$("v4TimelineUpgrade");if(!box){box=document.createElement("section");box.id="v4TimelineUpgrade";panel.prepend(box);}
    if(box.dataset.timelineVersion!=="3"){
      box.dataset.timelineVersion="3";box.className="v4-timeline-upgrade";
      box.innerHTML='<div class="v4-timeline-head"><div><small>Kronoloji timeline</small><b>Tarihi bir yol gibi gör</b><p>Dönemler arasında ilerle; olayları tarihten sonuca uzanan tek bir çizgide takip et.</p></div><button class="v4-timeline-reset" type="button" onclick="v4TimelineReset()">↺ Tümünü göster</button></div><div class="v4-timeline-overview" id="v4TimelineOverview" role="navigation" aria-label="Tarih dönemleri"></div><div class="v4-timeline-stats"><div><small>Görünen olay</small><b id="v4TimelineVisible">—</b></div><div><small>Zaman aralığı</small><b id="v4TimelineRange">—</b></div><div><small>Favori</small><b id="v4TimelineFavoriteCount">—</b></div></div>';
    }
    renderTimelineOverview();return true;
  }
  function timelineEventByTitle(title){return timelineRows().find(x=>x.title===title)||null;}
  function decorateTimeline(){
    const root=$("v320Timeline");if(!root||!ensureTimelineExperience())return false;
    const events=[...root.querySelectorAll(".v320-event")],signature=[currentTimelineEra(),$("v327TimelineSort")?.value||"old",$("v327TimelinePractice")?.checked?"practice":"study",...events.map(event=>event.textContent||"")].join("|");
    const expectedGroups=events.reduce((count,event,index,list)=>{const era=timelineEventByTitle(event.querySelector(".v320-event-head b")?.textContent||"")?.era||"Dönem",previous=index?(timelineEventByTitle(list[index-1].querySelector(".v320-event-head b")?.textContent||"")?.era||"Dönem"):"";return count+(era!==previous?1:0);},0);
    if(root.dataset.timelineSignature===signature&&root.classList.contains("v4-history-timeline")&&root.querySelectorAll(".v4-timeline-node").length===events.length&&root.querySelectorAll(".v4-timeline-era").length===expectedGroups)return true;
    root.querySelectorAll(".v4-timeline-era").forEach(node=>node.remove());
    let previousEra="";events.forEach((event,index)=>{
      event.classList.remove("v4-side-left","v4-side-right");event.querySelectorAll(".v4-timeline-node,.v4-timeline-order").forEach(node=>node.remove());
      const title=event.querySelector(".v320-event-head b")?.textContent||"",row=timelineEventByTitle(title),era=row?.era||"Dönem";
      if(era!==previousEra){const divider=document.createElement("div");divider.className="v4-timeline-era";divider.setAttribute("role","heading");divider.setAttribute("aria-level","3");divider.innerHTML='<span>'+esc(era)+'</span>';event.before(divider);previousEra=era;}
      event.classList.add(index%2?"v4-side-right":"v4-side-left");event.dataset.era=era;event.setAttribute("role","listitem");
      const node=document.createElement("i");node.className="v4-timeline-node";node.setAttribute("aria-hidden","true");event.appendChild(node);
      const head=event.querySelector(".v320-event-head>div");if(head){const order=document.createElement("span");order.className="v4-timeline-order";order.textContent=String(index+1).padStart(2,"0");order.title="Görünen kronolojide "+(index+1)+". olay";head.prepend(order);}
      const detail=event.querySelector(":scope>p");if(detail)detail.classList.add("v4-timeline-result");
      const favorite=event.querySelector(".v320-event-head>button");if(favorite)favorite.setAttribute("aria-label",title+" favorisi");
    });
    root.classList.add("v4-history-timeline");root.setAttribute("role","list");root.setAttribute("aria-label","Filtrelenmiş tarih kronolojisi");root.dataset.timelineSignature=signature;
    const visible=$("v4TimelineVisible"),range=$("v4TimelineRange"),favorite=$("v4TimelineFavoriteCount"),rows=events.map(event=>timelineEventByTitle(event.querySelector(".v320-event-head b")?.textContent||"")).filter(Boolean);
    if(visible)visible.textContent=events.length+" / "+timelineRows().length;
    if(range)range.textContent=rows.length?(rows[0].year+" → "+rows[rows.length-1].year):"Olay yok";
    if(favorite)favorite.textContent=events.filter(event=>event.querySelector('[aria-pressed="true"]')).length+" görünür favori";
    renderTimelineOverview();return true;
  }
  function wrapTimelineRendering(){
    ["v320FilterTimeline","v320RenderTimeline","v320ToggleTimeline","v327ToggleTimelinePractice","v327RevealTimeline","v327HideTimeline","v327ResetTimelineFilters"].forEach(name=>{const original=window[name];if(typeof original!=="function"||original.__v4TimelineWrapped)return;const wrapped=function(){const result=original.apply(this,arguments);requestAnimationFrame(()=>{ensureTimelineExperience();decorateTimeline();});return result;};wrapped.__v4TimelineWrapped=true;window[name]=wrapped;});
  }

  function wrapPeriodicReset(){
    if(window.__YKS_V3_PERIODIC_RESET_WRAPPED__)return;const original=window.v327ResetElementFilters;if(typeof original!=="function")return;window.__YKS_V3_PERIODIC_RESET_WRAPPED__=true;window.v327ResetElementFilters=function(){periodicType="Tümü";periodicYksOnly=false;const result=original.apply(this,arguments);renderPeriodicStudy();setTimeout(applyPeriodicFilters,0);return result;};
  }

  function setTab(next){
    active=["periodic","timeline","science"].includes(next)?next:"periodic";
    [["Periodic","periodic"],["Timeline","timeline"],["Science","science"]].forEach(([name,key])=>{$("v320Tab"+name)?.classList.toggle("on",active===key);const panel=$("v320Panel"+name);if(panel)panel.hidden=active!==key;});
    if(active==="periodic"){try{window.v320RenderElements?.();}catch(e){}setTimeout(()=>{try{window.YKSLearningLabV2?.enhanceElement?.();}catch(e){}ensurePeriodicStudy();},0);}
    if(active==="timeline"){ensureTimelineExperience();try{window.v320RenderTimeline?.();}catch(e){}requestAnimationFrame(decorateTimeline);}
    if(active==="science")renderScience();return true;
  }

  function ensureStructure(){
    injectStyle();const lab=$("v320LearningLab"),toolbox=lab?.querySelector?.(".v320-toolbox");if(!lab||!toolbox)return false;
    $("v320TabParagraph")?.remove();$("v320PanelParagraph")?.remove();$("v4TurkishUpgrade")?.remove();
    const tabs=toolbox.querySelector(".v320-tabs");if(tabs&&!$("v320TabScience")){tabs.className="seg v320-tabs v4lab-main-tabs";tabs.setAttribute("role","tablist");tabs.setAttribute("aria-label","Öğrenme laboratuvarı araçları");tabs.innerHTML='<button id="v320TabPeriodic" type="button" onclick="v320SetTab(\'periodic\')">Periyodik Tablo</button><button id="v320TabTimeline" type="button" onclick="v320SetTab(\'timeline\')">Kronoloji</button><button id="v320TabScience" type="button" onclick="v320SetTab(\'science\')">Bilim Kartları</button>';}
    if(!$("v320PanelScience")){const panel=document.createElement("div");panel.id="v320PanelScience";panel.hidden=true;panel.innerHTML='<div class="v4-science-head"><div><small>Hızlı fen tekrarı</small><b>Biyoloji / Fizik kartları</b><p>Temel yapı, sık hata ve YKS taktiğini aynı kartta gör.</p></div><div class="v4-science-switch" role="tablist" aria-label="Bilim kartı dersi"><button id="v4ScienceBiology" class="on" type="button" onclick="v4SetScienceSubject(\'Biyoloji\')">Biyoloji</button><button id="v4SciencePhysics" type="button" onclick="v4SetScienceSubject(\'Fizik\')">Fizik</button></div></div><div id="v4ScienceCards"></div>';toolbox.appendChild(panel);}
    wrapPeriodicReset();wrapTimelineRendering();window.v320SetTab=setTab;if(active==="periodic")ensurePeriodicStudy();else if(active==="timeline"){ensureTimelineExperience();decorateTimeline();}else if(active==="science")renderScience();return true;
  }

  function schedule(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;ensureStructure();});}
  function start(){let tries=0;const timer=setInterval(()=>{tries++;if($("v320LearningLab")&&window.YKSLearningLabV2&&window.YKSLearningLab){clearInterval(timer);ensureStructure();setTab(active);observer=new MutationObserver(schedule);observer.observe($("v320LearningLab"),{childList:true,subtree:true});}else if(tries>60)clearInterval(timer);},120);}

  window.v4SetScienceSubject=value=>{science=value==="Fizik"?"Fizik":"Biyoloji";renderScience();};
  window.v4PeriodicSetType=value=>{periodicType=TYPES.includes(value)?value:"Tümü";renderPeriodicStudy();applyPeriodicFilters();};
  window.v4PeriodicToggleYks=()=>{periodicYksOnly=!periodicYksOnly;renderPeriodicStudy();applyPeriodicFilters();};
  window.v4PeriodicToggleFavorites=()=>{const source=$("v320ElementFavOnly");if(!source)return false;source.checked=!source.checked;try{window.v320RenderElements?.();}catch(e){}setTimeout(applyPeriodicFilters,0);return true;};
  window.v4PeriodicReset=()=>{try{window.v327ResetElementFilters?.();}catch(e){periodicType="Tümü";periodicYksOnly=false;renderPeriodicStudy();setTimeout(applyPeriodicFilters,0);}return true;};
  window.v4TimelineChooseEra=value=>{const select=$("v320TimelineEra");if(!select)return false;select.value=TIMELINE_ERAS.includes(value)?value:"Tümü";try{window.v320RenderTimeline?.();}catch(e){}requestAnimationFrame(()=>{renderTimelineOverview();decorateTimeline();});return true;};
  window.v4TimelineReset=()=>{try{window.v327ResetTimelineFilters?.();}catch(e){const select=$("v320TimelineEra");if(select)select.value="Tümü";try{window.v320RenderTimeline?.();}catch(_){}}requestAnimationFrame(()=>{renderTimelineOverview();decorateTimeline();});return true;};
  document.addEventListener("yks:navigation-after",()=>setTimeout(ensureStructure,70));
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start,{once:true});else start();
  window.YKSLearningLabV3={version:"3.2.0",setTab,renderScience,ensureStructure,applyPeriodicFilters,enhancePeriodicDetail,ensureTimelineExperience,decorateTimeline,yksFocus:YKS_FOCUS};
})();
