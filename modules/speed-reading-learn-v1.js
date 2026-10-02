(()=>{
"use strict";
const LESSONS=[
 {id:"groups",n:"01",title:"Kelime grupları",sub:"Tek tek kelime yerine anlam kümelerini gör.",demo:["Sınava hazırlanan öğrenci","zamanını doğru kullandığında","daha sakin ilerler."],tip:"Gözünü her kelimede durdurmak yerine 2–4 kelimelik anlam bloklarına yönelt."},
 {id:"returns",n:"02",title:"Geri dönüşleri azalt",sub:"Aynı satırı gereksiz yere yeniden okumayı fark et.",demo:["Bir cümleyi ilk geçişte","ana fikri yakalamaya odaklanarak","sona kadar takip et."],tip:"Anlam tamamen kopmadıkça gözünü önceki kelimelere geri götürme."},
 {id:"focus",n:"03",title:"Odak noktalarını genişlet",sub:"Bir bakışta daha geniş bir alanı algılamayı çalış.",demo:["merkezdeki","kelime grubunu","tek bakışta gör"],tip:"Başını oynatmadan ortadaki gruba bak; yanındaki kelimeleri de fark etmeye çalış."},
 {id:"voice",n:"04",title:"İç seslendirmeyi yönet",sub:"Her kelimeyi zihinde tek tek söyleme alışkanlığını azalt.",demo:["Anlamı yakala","ritmi koru","gereksiz durma"],tip:"Amaç iç sesi zorla susturmak değil; okuma ritmini anlamın önüne geçirmemek."}
];
const KEY="yks-speed-reading-learn-v1";
function state(){try{return JSON.parse(localStorage.getItem(KEY)||'{"done":[]}')}catch{return{done:[]}}}
function save(s){localStorage.setItem(KEY,JSON.stringify(s))}
function root(){return document.getElementById("speedReadingLearn")}
function render(){
 const el=root(); if(!el)return; const s=state();
 el.innerHTML='<div class="sr-head"><div><span>HIZLI OKUMA · ÖĞREN</span><h3>Önce tekniği öğren, sonra hızlan.</h3><p>Hedef yalnızca daha hızlı okumak değil; hız artarken anlamayı korumak.</p></div><div class="sr-progress"><b>'+s.done.length+'/4</b><small>temel ders</small></div></div><div class="sr-lessons">'+LESSONS.map((x,i)=>'<button class="sr-lesson '+(s.done.includes(x.id)?'done':'')+'" data-sr="'+x.id+'"><i>'+x.n+'</i><span><b>'+x.title+'</b><small>'+x.sub+'</small></span><em>'+(s.done.includes(x.id)?'✓':'›')+'</em></button>').join("")+'</div><div id="srLessonStage" class="sr-stage"><p>Bir ders seç. Her ders yaklaşık 2 dakika sürer.</p></div>';
 el.querySelectorAll("[data-sr]").forEach(b=>b.addEventListener("click",()=>open(b.dataset.sr)));
}
function open(id){
 const x=LESSONS.find(v=>v.id===id),stage=document.getElementById("srLessonStage"); if(!x||!stage)return;
 stage.innerHTML='<div class="sr-stage-top"><span>DERS '+x.n+'</span><b>'+x.title+'</b></div><p>'+x.sub+'</p><div class="sr-demo">'+x.demo.map(v=>'<span>'+v+'</span>').join("")+'</div><div class="sr-tip"><b>Uygula</b><p>'+x.tip+'</p></div><button class="btn green small" id="srComplete">Dersi tamamladım</button>';
 document.getElementById("srComplete").onclick=()=>{const s=state();if(!s.done.includes(id))s.done.push(id);save(s);render();};
 stage.scrollIntoView({behavior:"smooth",block:"nearest"});
}
function injectStyle(){
 if(document.getElementById("srStyle"))return; const st=document.createElement("style");st.id="srStyle";st.textContent=`
#speedReadingLearn{margin-top:10px}.sr-head{display:flex;justify-content:space-between;gap:18px;align-items:flex-start;padding:18px;border:1px solid var(--glass-line);border-radius:18px;background:var(--glass)}.sr-head span,.sr-stage-top span{font-size:9px;font-weight:850;letter-spacing:.08em;color:var(--accent)}.sr-head h3{margin:5px 0 6px;font-size:19px}.sr-head p,.sr-stage>p,.sr-tip p{margin:0;color:var(--label-2);font-size:11px;line-height:1.55}.sr-progress{min-width:70px;text-align:center;padding:10px;border-radius:14px;background:var(--accent-soft)}.sr-progress b,.sr-progress small{display:block}.sr-progress b{font-size:20px}.sr-progress small{font-size:9px;color:var(--label-3)}.sr-lessons{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px;margin:10px 0}.sr-lesson{display:grid;grid-template-columns:36px 1fr 22px;align-items:center;gap:10px;width:100%;padding:13px;border:1px solid var(--glass-line);border-radius:15px;background:var(--glass);color:var(--label);text-align:left;cursor:pointer}.sr-lesson i{display:grid;place-items:center;width:34px;height:34px;border-radius:11px;background:var(--fill);font-size:10px;font-style:normal;font-weight:800}.sr-lesson b,.sr-lesson small{display:block}.sr-lesson b{font-size:12px}.sr-lesson small{margin-top:3px;color:var(--label-3);font-size:9px;line-height:1.35}.sr-lesson em{font-style:normal;color:var(--label-3)}.sr-lesson.done{border-color:color-mix(in srgb,var(--accent) 35%,var(--glass-line))}.sr-lesson.done em{color:var(--accent)}.sr-stage{padding:16px;border:1px solid var(--glass-line);border-radius:17px;background:var(--glass)}.sr-stage-top b{display:block;margin-top:4px;font-size:16px}.sr-demo{display:flex;flex-wrap:wrap;justify-content:center;gap:10px;margin:18px 0;padding:22px 12px;border-radius:15px;background:var(--fill)}.sr-demo span{padding:7px 10px;border-radius:9px;background:var(--glass);font-size:13px;font-weight:750}.sr-tip{margin:0 0 13px;padding:12px;border-left:3px solid var(--accent);border-radius:10px;background:var(--accent-soft)}.sr-tip b{font-size:10px;color:var(--accent)}@media(max-width:620px){.sr-lessons{grid-template-columns:1fr}.sr-head{align-items:center}.sr-head h3{font-size:16px}.sr-demo{gap:6px}.sr-demo span{font-size:11px}}
`;document.head.appendChild(st);
}

function hookTabs(){
 const legacy=window.v320SetTab;
 window.v320SetTab=function(tab){
   const speed=document.getElementById("v320PanelSpeed"),speedBtn=document.getElementById("v320TabSpeed");
   if(tab==="speed"){
     ["v320PanelParagraph","v320PanelPeriodic","v320PanelTimeline"].forEach(id=>{const n=document.getElementById(id);if(n)n.hidden=true});
     ["v320TabParagraph","v320TabPeriodic","v320TabTimeline"].forEach(id=>document.getElementById(id)?.classList.remove("on"));
     if(speed)speed.hidden=false;if(speedBtn)speedBtn.classList.add("on");window.srInitLearn?.();return;
   }
   if(speed)speed.hidden=true;if(speedBtn)speedBtn.classList.remove("on");
   if(typeof legacy==="function")return legacy(tab);
 };
}
window.srInitLearn=()=>{injectStyle();render()};
document.addEventListener("DOMContentLoaded",()=>{injectStyle();render();hookTabs()});
})();