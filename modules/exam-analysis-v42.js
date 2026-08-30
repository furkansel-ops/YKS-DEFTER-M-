/* YKS Defterim · v4.2 Aşama 4 · Deneme Analizi 3.0
   Salt-okunur analiz katmanı: kayıtlı deneme/yanlış verisini açıklar, tahmin üretmez ve Program verisini değiştirmez. */
(function(root,factory){
  const api=factory();
  if(typeof module!=="undefined"&&module.exports)module.exports=api;
  root.YKSExamAnalysisV42=api;
  if(root&&root.document)api.install(root);
})(typeof globalThis!=="undefined"?globalThis:this,function(){
  "use strict";
  const VERSION="3.0.0",TYPE_KEY="yks_exam_analysis_type_v42",WINDOW_KEY="yks_exam_analysis_window_v42";
  const num=(value,fallback=0)=>Number.isFinite(Number(value))?Number(value):fallback;
  const text=value=>String(value==null?"":value).trim();
  const norm=value=>text(value).toLocaleLowerCase("tr-TR").replace(/\s+/g," ");
  const validType=value=>["TYT","AYT","YDT"].includes(text(value).toUpperCase())?text(value).toUpperCase():"";
  const topicKey=(subject,topic)=>norm(subject)+"|"+norm(topic);
  function stddev(values){if(!values.length)return 0;const avg=values.reduce((a,b)=>a+b,0)/values.length;return Math.sqrt(values.reduce((sum,value)=>sum+(value-avg)*(value-avg),0)/values.length);}
  function average(values){return values.length?values.reduce((a,b)=>a+b,0)/values.length:0;}
  function round(value,digits=2){const p=10**digits;return Math.round(num(value)*p)/p;}
  function sortedGeneralExams(state){return (Array.isArray(state&&state.denemeler)?state.denemeler:[]).filter(row=>row&&row.type!=="BRANS"&&validType(row.type)&&Number.isFinite(Number(row.totalNet))).slice().sort((a,b)=>String(a.date||"").localeCompare(String(b.date||""))||num(a.id)-num(b.id));}
  function examTypes(state){const exams=sortedGeneralExams(state),out=[];for(const row of exams){const type=validType(row.type);if(type&&!out.includes(type))out.push(type);}return out;}
  function resolveType(state,hint){const exams=sortedGeneralExams(state),types=examTypes(state),wanted=validType(hint);if(wanted&&types.includes(wanted))return wanted;return exams.length?validType(exams[exams.length-1].type):"";}
  function subjectSeries(windowRows){
    const map=new Map();
    windowRows.forEach((exam,index)=>{
      for(const result of (Array.isArray(exam.subjectResults)?exam.subjectResults:[])){
        const name=text(result&&result.name);if(!name||!Number.isFinite(Number(result.net)))continue;
        let row=map.get(name);if(!row){row={name,values:[],points:[]};map.set(name,row);}
        row.values.push(num(result.net));row.points.push({examId:exam.id,date:text(exam.date),index,net:num(result.net),wrong:Math.max(0,num(result.y)),blank:Math.max(0,num(result.b)),cap:Math.max(0,num(result.cap))});
      }
    });
    return [...map.values()].map(row=>{
      const first=row.points[0],last=row.points[row.points.length-1],volatility=stddev(row.values),range=row.values.length?Math.max(...row.values)-Math.min(...row.values):0;
      return {name:row.name,count:row.values.length,latest:last?last.net:null,avg:round(average(row.values)),delta:first&&last&&row.values.length>1?round(last.net-first.net):null,volatility:round(volatility),range:round(range),wrong:last?last.wrong:0,blank:last?last.blank:0,cap:last?last.cap:0,points:row.points,stability:row.values.length<3?"Kısa seri":volatility<=1.5?"Dengeli":volatility<=3.5?"Orta dalgalı":"Dalgalı"};
    }).sort((a,b)=>b.volatility-a.volatility||Math.abs(num(b.delta))-Math.abs(num(a.delta))||a.name.localeCompare(b.name,"tr"));
  }
  function wrongDensity(state,windowRows){
    const ids=new Set(windowRows.map(row=>String(row.id))),examById=new Map(windowRows.map(row=>[String(row.id),row])),map=new Map();
    for(const wrong of (Array.isArray(state&&state.wrongLog)?state.wrongLog:[])){
      const id=wrong&&wrong.deneme!=null?String(wrong.deneme):"";if(!id||!ids.has(id))continue;
      const subject=text(wrong.subject),topic=text(wrong.topic);if(!subject||!topic)continue;
      const key=topicKey(subject,topic),count=Math.max(1,num(wrong.n,1));let row=map.get(key);
      if(!row){row={key,subject,topic,count:0,examIds:new Set(),dates:[],kinds:{}};map.set(key,row);}
      row.count+=count;row.examIds.add(id);const exam=examById.get(id),date=text(wrong.date)||text(exam&&exam.date);if(date)row.dates.push(date);const kind=text(wrong.kind)||"belirsiz";row.kinds[kind]=(row.kinds[kind]||0)+count;
    }
    const latest=windowRows[windowRows.length-1],latestId=latest?String(latest.id):"";
    return [...map.values()].map(row=>({key:row.key,subject:row.subject,topic:row.topic,count:row.count,examCount:row.examIds.size,examRate:windowRows.length?Math.round(row.examIds.size/windowRows.length*100):0,latestDate:row.dates.sort().at(-1)||"",inLatest:latestId?row.examIds.has(latestId):false,kinds:row.kinds})).sort((a,b)=>b.examCount-a.examCount||b.count-a.count||b.latestDate.localeCompare(a.latestDate));
  }
  function buildSignals(analysis){
    if(!analysis||!analysis.hasData)return [];
    const out=[],gain=analysis.netChange;
    if(analysis.window.length>=3&&gain!=null&&gain>1){
      for(const row of analysis.density.filter(item=>item.examCount>=2&&item.inLatest).slice(0,4))out.push({kind:"persistent-error",severity:row.examCount>=3?"priority":"soon",title:"Net arttı ama aynı hata devam ediyor",detail:`${analysis.type} serisinde net ${gain>0?"+":""}${round(gain)} değişti; ${row.subject} · ${row.topic} ${row.examCount}/${analysis.window.length} denemede yanlış olarak işaretlendi.`,subject:row.subject,topic:row.topic});
    }
    const volatile=analysis.subjects.find(row=>row.count>=3&&row.volatility>3.5);if(volatile)out.push({kind:"subject-volatility",severity:"priority",title:"Ders bazında dalgalanma yüksek",detail:`${volatile.name}: son ${volatile.count} ölçümde standart sapma ${round(volatile.volatility)} net, aralık ${round(volatile.range)} net.`,subject:volatile.name,topic:""});
    const dense=analysis.density[0];if(dense&&dense.examCount>=3)out.push({kind:"topic-density",severity:dense.examRate>=60?"priority":"soon",title:"Yanlışlar aynı konuda yoğunlaşıyor",detail:`${dense.subject} · ${dense.topic}: seçili seride ${dense.count} yanlış, ${dense.examCount} farklı deneme (${dense.examRate}%).`,subject:dense.subject,topic:dense.topic});
    if(analysis.window.length>=5&&analysis.volatility<=2.5)out.push({kind:"stable-series",severity:"good",title:"Net serisi dengeli",detail:`Son ${analysis.window.length} ${analysis.type} denemesinde standart sapma ${round(analysis.volatility)} net. Bu yalnız mevcut serinin istikrarını anlatır; gelecek deneme için tahmin değildir.`});
    return out.slice(0,6);
  }
  function buildExamAnalysis(state,typeHint,windowSize=5){
    const all=sortedGeneralExams(state),types=examTypes(state),type=resolveType(state,typeHint);if(!type)return {hasData:false,types,all};
    const same=all.filter(row=>validType(row.type)===type),size=Number(windowSize)===10?10:5,window=same.slice(-size),latest=same.at(-1)||null,previous=same.length>1?same.at(-2):null,nets=window.map(row=>num(row.totalNet));
    const first=window[0]||null,avg=average(nets),volatility=stddev(nets),netChange=first&&latest&&window.length>1?num(latest.totalNet)-num(first.totalNet):null,previousDelta=previous&&latest?num(latest.totalNet)-num(previous.totalNet):null;
    const density=wrongDensity(state,window),subjects=subjectSeries(window),analysis={hasData:true,types,type,size,all,same,window,latest,previous,avg:round(avg),volatility:round(volatility),netChange:netChange==null?null:round(netChange),previousDelta:previousDelta==null?null:round(previousDelta),min:nets.length?Math.min(...nets):0,max:nets.length?Math.max(...nets):0,subjects,density};
    analysis.signals=buildSignals(analysis);return analysis;
  }
  function snapshotSchedule(state){return JSON.stringify({weeks:state&&state.weeks||{},rows:state&&state.rows||{},rowLabels:state&&state.rowLabels||{}});}
  function selfTest(){
    const exams=[];for(let i=1;i<=10;i++)exams.push({id:i,type:"TYT",date:`2026-08-${String(i+10).padStart(2,"0")}`,totalNet:60+i*2,subjectResults:[{name:"Temel Matematik",net:15+[1,4,0,5,2,7,1,8,3,9][i-1],y:8,b:8,cap:40},{name:"Türkçe",net:25+i*.3,y:5,b:5,cap:40}]});
    const state={weeks:{w:1},rows:{r:2},rowLabels:{r:["09:00"]},denemeler:exams,wrongLog:[{deneme:7,subject:"Matematik",topic:"Problemler",n:2,date:"2026-08-17"},{deneme:9,subject:"Matematik",topic:"Problemler",n:1,date:"2026-08-19"},{deneme:10,subject:"Matematik",topic:"Problemler",n:2,date:"2026-08-20"}]},before=snapshotSchedule(state),a5=buildExamAnalysis(state,"TYT",5),a10=buildExamAnalysis(state,"TYT",10),after=snapshotSchedule(state);
    return {ok:a5.window.length===5&&a10.window.length===10&&a5.density[0].examCount===3&&a5.signals.some(x=>x.kind==="persistent-error")&&a10.subjects.some(x=>x.name==="Temel Matematik"&&x.volatility>0)&&before===after,programUntouched:before===after,a5,a10};
  }

  function install(root){
    if(root.__YKS_EXAM_ANALYSIS_V42__)return true;const doc=root.document;if(!doc)return false;
    let observer=null,pending=false,rendering=false,retries=0;
    const safe=value=>typeof root.esc==="function"?root.esc(text(value)):text(value).replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
    const state=()=>{try{return root.S&&typeof root.S==="object"?root.S:{};}catch{try{return JSON.parse(root.localStorage?.getItem("yks")||"{}")||{};}catch{return {};}}};
    const readPref=(key,fallback)=>{try{return root.localStorage?.getItem(key)||fallback;}catch{return fallback;}};
    const writePref=(key,value)=>{try{root.localStorage?.setItem(key,String(value));}catch{}};
    const sign=value=>value==null?"—":(num(value)>0?"+":"")+round(value);
    const stability=value=>value<=2.5?"Dengeli":value<=5?"Orta dalgalı":"Dalgalı";
    function injectStyle(){if(doc.getElementById("v42ExamAnalysisStyle"))return;const style=doc.createElement("style");style.id="v42ExamAnalysisStyle";style.textContent=`
#intelExamAnalysis2[data-exam-v42="ready"]{overflow:visible}.v42-exam3-shell{display:grid;gap:14px}.v42-exam3-toolbar{display:flex;align-items:flex-start;justify-content:space-between;gap:12px}.v42-exam3-toolbar h3{margin:0;font-size:17px}.v42-exam3-toolbar p{margin:4px 0 0;color:var(--label-2);font-size:11px;line-height:1.45}.v42-exam3-controls{display:flex;flex-wrap:wrap;justify-content:flex-end;gap:6px}.v42-exam3-controls button{min-height:34px;padding:6px 10px;border:1px solid var(--line);border-radius:10px;background:var(--card);color:var(--label-2);font:800 10px/1 inherit;cursor:pointer}.v42-exam3-controls button.on{border-color:color-mix(in srgb,var(--accent) 45%,var(--line));background:var(--accent-soft);color:var(--accent)}
.v42-exam3-kpis{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px}.v42-exam3-kpi{padding:11px;border:1px solid var(--line);border-radius:14px;background:var(--fill)}.v42-exam3-kpi small,.v42-exam3-kpi b,.v42-exam3-kpi span{display:block}.v42-exam3-kpi small{color:var(--label-3);font-size:9px;font-weight:850;text-transform:uppercase;letter-spacing:.04em}.v42-exam3-kpi b{margin-top:4px;font-size:19px}.v42-exam3-kpi span{margin-top:3px;color:var(--label-2);font-size:9.5px}
.v42-exam3-section{display:grid;gap:8px}.v42-exam3-section-head{display:flex;align-items:end;justify-content:space-between;gap:10px}.v42-exam3-section-head b{font-size:12px}.v42-exam3-section-head span{color:var(--label-3);font-size:9.5px}.v42-exam3-subjects{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:7px}.v42-exam3-subject{display:grid;grid-template-columns:minmax(0,1fr) repeat(3,auto);gap:8px;align-items:center;padding:9px 10px;border:1px solid var(--line);border-radius:12px;background:var(--card)}.v42-exam3-subject>div{min-width:0}.v42-exam3-subject strong,.v42-exam3-subject small{display:block}.v42-exam3-subject strong{font-size:10.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.v42-exam3-subject small{margin-top:2px;color:var(--label-3);font-size:8.5px}.v42-exam3-subject b{font-size:10px;white-space:nowrap}.v42-exam3-subject .volatile{color:var(--orange,#c27800)}
.v42-exam3-density{display:grid;gap:6px}.v42-exam3-density-row{display:grid;grid-template-columns:minmax(150px,1fr) minmax(90px,1.2fr) auto;gap:9px;align-items:center;padding:8px 9px;border:1px solid var(--line);border-radius:11px;background:var(--card)}.v42-exam3-density-copy{min-width:0}.v42-exam3-density-copy b,.v42-exam3-density-copy small{display:block}.v42-exam3-density-copy b{font-size:10.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.v42-exam3-density-copy small{margin-top:2px;color:var(--label-3);font-size:8.5px}.v42-exam3-bar{height:7px;border-radius:99px;background:var(--fill);overflow:hidden}.v42-exam3-bar i{display:block;height:100%;border-radius:inherit;background:var(--accent)}.v42-exam3-density-row>span{font-size:9.5px;font-weight:850;white-space:nowrap}
.v42-exam3-signals{display:grid;gap:7px}.v42-exam3-signal{padding:10px 11px;border:1px solid var(--line);border-radius:12px;background:var(--fill)}.v42-exam3-signal strong{display:block;font-size:10.5px}.v42-exam3-signal p{margin:4px 0 0;color:var(--label-2);font-size:10px;line-height:1.45}.v42-exam3-signal.priority{border-color:color-mix(in srgb,var(--orange,#c27800) 35%,var(--line))}.v42-exam3-signal.good{border-color:color-mix(in srgb,var(--green,#178548) 30%,var(--line))}.v42-exam3-note{padding:10px 11px;border-radius:11px;background:var(--fill);color:var(--label-2);font-size:10px;line-height:1.45}.v42-exam3-note strong{color:var(--label-1)}
.v42-exam3-controls button:focus-visible,.v42-exam3-density-row:focus-visible{outline:3px solid color-mix(in srgb,var(--accent) 36%,transparent);outline-offset:2px}@media(max-width:760px){.v42-exam3-toolbar{display:grid}.v42-exam3-controls{justify-content:flex-start}.v42-exam3-kpis{grid-template-columns:repeat(2,minmax(0,1fr))}.v42-exam3-subjects{grid-template-columns:1fr}}@media(max-width:480px){.v42-exam3-kpis{grid-template-columns:1fr 1fr}.v42-exam3-density-row{grid-template-columns:minmax(0,1fr) auto}.v42-exam3-bar{grid-column:1/-1;grid-row:2}.v42-exam3-subject{grid-template-columns:minmax(0,1fr) auto}.v42-exam3-subject b:nth-of-type(n+2){display:none}}@media(pointer:coarse){.v42-exam3-controls button{min-height:44px;padding:9px 12px}}@media(prefers-reduced-motion:reduce){#intelExamAnalysis2 *{scroll-behavior:auto!important;transition:none!important;animation:none!important}}`;
      doc.head.appendChild(style);
    }
    function render(){
      const box=doc.getElementById("intelExamAnalysis2");if(!box){if(retries++<30)root.setTimeout(render,100);return false;}if(rendering)return false;rendering=true;
      try{
        injectStyle();const s=state(),types=examTypes(s),storedType=readPref(TYPE_KEY,""),storedWindow=Number(readPref(WINDOW_KEY,"5"))===10?10:5,a=buildExamAnalysis(s,storedType,storedWindow),heading=doc.querySelector('h2[data-intel-for="intelExamAnalysis2"]');if(heading)heading.textContent="Deneme Analizi 3.0";
        if(!a.hasData){box.dataset.examV42="ready";box.innerHTML='<div class="empty">En az bir genel deneme kaydı geldiğinde Deneme Analizi 3.0 burada açılır.</div>';return true;}
        if(storedType!==a.type)writePref(TYPE_KEY,a.type);
        const typeButtons=a.types.map(type=>`<button type="button" data-exam-v42-type="${safe(type)}" class="${type===a.type?'on':''}" aria-pressed="${type===a.type?'true':'false'}">${safe(type)}</button>`).join("");
        const windowButtons=[5,10].map(size=>`<button type="button" data-exam-v42-window="${size}" class="${size===a.size?'on':''}" aria-pressed="${size===a.size?'true':'false'}">Son ${size}</button>`).join("");
        const subjects=a.subjects.slice(0,12).map(row=>`<div class="v42-exam3-subject"><div><strong>${safe(row.name)}</strong><small>${row.count} ölçüm · ${safe(row.stability)}</small></div><b>${row.latest==null?'—':safe(round(row.latest))}</b><b>${row.delta==null?'—':safe(sign(row.delta))}</b><b class="${row.volatility>3.5?'volatile':''}">σ ${safe(row.volatility)}</b></div>`).join("")||'<div class="empty">Ders bazlı net verisi henüz yok.</div>';
        const maxDensity=Math.max(1,...a.density.map(row=>row.count));const density=a.density.slice(0,7).map(row=>`<div class="v42-exam3-density-row" role="button" tabindex="0" data-exam-v42-topic="${safe(row.key)}" data-subject="${safe(row.subject)}" data-topic="${safe(row.topic)}"><div class="v42-exam3-density-copy"><b>${safe(row.subject+' · '+row.topic)}</b><small>${row.examCount}/${a.window.length} deneme · ${row.examRate}%</small></div><span class="v42-exam3-bar"><i style="width:${Math.max(6,Math.round(row.count/maxDensity*100))}%"></i></span><span>${row.count} yanlış</span></div>`).join("")||'<div class="empty">Bu seride denemeye bağlanmış konu yanlışı yok.</div>';
        const signals=a.signals.map(signal=>`<div class="v42-exam3-signal ${safe(signal.severity||'soon')}"><strong>${safe(signal.title)}</strong><p>${safe(signal.detail)}</p></div>`).join("")||'<div class="v42-exam3-note">Şu an ayrıca öne çıkarılacak güçlü bir sinyal yok. Veri arttıkça yalnız kanıtlanabilen örüntüler burada görünür.</div>';
        box.dataset.examV42="ready";box.innerHTML=`<div class="v42-exam3-shell"><div class="v42-exam3-toolbar"><div><h3>${safe(a.type)} · kanıta dayalı seri analizi</h3><p>Aynı deneme türündeki son ${a.window.length} kaydı; toplam net, ders dalgalanması ve denemeye bağlı yanlışlarla birlikte okur.</p></div><div class="v42-exam3-controls" aria-label="Deneme analizi filtreleri">${typeButtons}${windowButtons}</div></div><div class="v42-exam3-kpis"><div class="v42-exam3-kpi"><small>Son net</small><b>${safe(round(a.latest.totalNet))}</b><span>${safe(a.latest.date||'Tarih yok')}</span></div><div class="v42-exam3-kpi"><small>Son ${a.window.length} ortalama</small><b>${safe(a.avg)}</b><span>${safe(a.min)}–${safe(a.max)} net aralığı</span></div><div class="v42-exam3-kpi"><small>Seri değişimi</small><b>${safe(sign(a.netChange))}</b><span>İlk → son kayıt</span></div><div class="v42-exam3-kpi"><small>Kararlılık</small><b style="font-size:15px">${safe(stability(a.volatility))}</b><span>σ ${safe(a.volatility)} net</span></div></div><section class="v42-exam3-section"><div class="v42-exam3-section-head"><b>Ders bazlı istikrar</b><span>son net · seri değişimi · standart sapma</span></div><div class="v42-exam3-subjects">${subjects}</div></section><section class="v42-exam3-section"><div class="v42-exam3-section-head"><b>Yanlış konu yoğunluğu</b><span>yalnız denemeye bağlanmış yanlışlar</span></div><div class="v42-exam3-density">${density}</div></section><section class="v42-exam3-section"><div class="v42-exam3-section-head"><b>Açıklanabilir sinyaller</b><span>tahmin değil, kayıt kanıtı</span></div><div class="v42-exam3-signals">${signals}</div></section><div class="v42-exam3-note"><strong>Nasıl okunmalı?</strong> Bu analiz yalnız kayıtlı doğru/yanlış/boş, net ve konu yanlışı verisine dayanır. Gelecek neti veya sınav sonucunu tahmin etmez; Program’a otomatik görev eklemez ya da mevcut Programı değiştirmez.</div></div>`;
        box.querySelectorAll("[data-exam-v42-type]").forEach(button=>button.addEventListener("click",()=>{writePref(TYPE_KEY,button.dataset.examV42Type||"");schedule(true);}));box.querySelectorAll("[data-exam-v42-window]").forEach(button=>button.addEventListener("click",()=>{writePref(WINDOW_KEY,button.dataset.examV42Window||"5");schedule(true);}));
        box.querySelectorAll("[data-exam-v42-topic]").forEach(row=>{const open=()=>{const subject=row.dataset.subject||"",topic=row.dataset.topic||"";if(root.YKSErrorTopicLabV42&&typeof root.YKSErrorTopicLabV42.openTopic==="function")root.YKSErrorTopicLabV42.openTopic(subject,topic,a.type);else{try{root.go?.("topics");}catch{}}};row.addEventListener("click",open);row.addEventListener("keydown",event=>{if(event.key==="Enter"||event.key===" "){event.preventDefault();open();}});});
        doc.documentElement.dataset.examAnalysisV42="ready";return true;
      }finally{rendering=false;}
    }
    function schedule(force){if(pending&&!force)return;pending=true;const run=()=>{pending=false;const box=doc.getElementById("intelExamAnalysis2");if(!force&&box&&box.dataset.examV42==="ready"&&box.querySelector(".v42-exam3-shell"))return;render();};if(typeof root.requestAnimationFrame==="function")root.requestAnimationFrame(run);else root.setTimeout(run,0);}
    function bindObserver(){const box=doc.getElementById("intelExamAnalysis2");if(!box){if(retries++<30)root.setTimeout(bindObserver,120);return false;}if(observer)return true;observer=new root.MutationObserver(()=>{if(rendering)return;if(!box.querySelector(".v42-exam3-shell"))schedule(true);});observer.observe(box,{childList:true,subtree:true});schedule(true);return true;}
    root.__YKS_EXAM_ANALYSIS_V42__=true;root.YKSExamAnalysisV42=Object.assign(root.YKSExamAnalysisV42||{},{version:VERSION,render:()=>schedule(true),selfTest,getAnalysis:(type,size)=>buildExamAnalysis(state(),type,size)});
    doc.addEventListener("yks:navigation-after",event=>{if(!event.detail||event.detail.screen==="deneme")schedule(true);});root.addEventListener("storage",event=>{if(!event.key||event.key==="yks")schedule(true);});
    if(doc.readyState==="loading")doc.addEventListener("DOMContentLoaded",()=>{bindObserver();root.setTimeout(bindObserver,300);},{once:true});else{bindObserver();root.setTimeout(bindObserver,300);}return true;
  }
  return {version:VERSION,typeKey:TYPE_KEY,windowKey:WINDOW_KEY,stddev,examTypes,resolveType,subjectSeries,wrongDensity,buildSignals,buildExamAnalysis,snapshotSchedule,selfTest,install};
});