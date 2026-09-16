import{collection,doc,getDoc,getDocs,query,where,setDoc,serverTimestamp}from"https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";

const LINK_COLLECTION="coachingLinks";
const SHARE_COLLECTION="coachingShares";
const PROFILE_COLLECTION="accountProfiles";
const ACTION_COLLECTION="coachingActions";
const tabs=[
  ["summary","Özet"],
  ["program","Program"],
  ["exams","Deneme"],
  ["progress","İlerleme"],
  ["topics","Konular"],
  ["errors","Hata Defteri"]
];
const runtime={ctx:null,profile:null,students:[],selected:0,tab:"summary"};
const text=(value,max=220)=>String(value??"").trim().slice(0,max);
const esc=value=>String(value??"").replace(/[&<>"']/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[char]));
const today=()=>new Date().toISOString().slice(0,10);
const num=value=>Number(value||0)||0;
const toast=message=>{try{window.toast?.(message)}catch{console.info(message)}};

function styles(){
  if(document.getElementById("coachDashboardV2Styles"))return;
  const style=document.createElement("style");
  style.id="coachDashboardV2Styles";
  style.textContent=`
  .cd2-wrap{display:grid;gap:12px}.cd2-hero{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;padding:18px;border:1px solid var(--line,#2d3442);border-radius:18px;background:var(--surface,#151a24)}
  .cd2-hero h2{margin:3px 0 5px;font-size:24px}.cd2-kicker{font-size:10px;font-weight:850;letter-spacing:.08em;text-transform:uppercase;color:var(--accent,#7cacff)}.cd2-muted{color:var(--label-2,#a8b1c1);font-size:12px;line-height:1.5}
  .cd2-tabs{display:flex;gap:7px;overflow:auto;padding:2px 0 4px;scrollbar-width:thin}.cd2-tab{white-space:nowrap;min-height:38px;padding:8px 13px;border:1px solid var(--line,#2d3442);border-radius:11px;background:var(--surface,#151a24);color:var(--label-2,#a8b1c1);font:800 12px system-ui;cursor:pointer}.cd2-tab.on{border-color:color-mix(in srgb,var(--accent,#76a9ff) 50%,var(--line,#2d3442));background:var(--accent-soft,rgba(94,145,255,.13));color:var(--accent,#8fbaff)}
  .cd2-metrics{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px}.cd2-metric{min-height:92px;padding:14px;border:1px solid var(--line,#2d3442);border-radius:16px;background:var(--surface,#151a24)}.cd2-metric span{display:block;color:var(--label-2,#a8b1c1);font-size:11px;font-weight:700}.cd2-metric b{display:block;margin-top:8px;font-size:25px;line-height:1}.cd2-metric small{display:block;margin-top:7px;color:var(--label-3,#7f8999);font-size:10.5px}
  .cd2-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.cd2-card{padding:16px;border:1px solid var(--line,#2d3442);border-radius:16px;background:var(--surface,#151a24)}.cd2-card h3{margin:0 0 11px;font-size:15px}.cd2-row{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;padding:9px 0;border-bottom:1px solid var(--line,#2d3442);font-size:12px}.cd2-row:last-child{border-bottom:0}.cd2-row span{min-width:0;color:var(--label-2,#a8b1c1)}.cd2-row b{text-align:right}.cd2-empty{padding:15px;border:1px dashed var(--line,#2d3442);border-radius:13px;color:var(--label-2,#a8b1c1);font-size:12px}
  .cd2-alert{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:11px 12px;border-radius:12px;background:var(--fill,rgba(255,255,255,.04));margin:7px 0}.cd2-alert strong{font-size:12px}.cd2-alert small{display:block;margin-top:3px;color:var(--label-3,#7f8999);font-size:10.5px}.cd2-badge{flex:none;padding:5px 8px;border-radius:999px;background:var(--accent-soft,rgba(94,145,255,.13));color:var(--accent,#8fbaff);font:850 10px system-ui}
  .cd2-form{display:grid;gap:8px}.cd2-form input,.cd2-form select,.cd2-form textarea{box-sizing:border-box;width:100%;padding:9px 10px;border:1px solid var(--line,#2d3442);border-radius:10px;background:var(--fill,rgba(255,255,255,.035));color:inherit}.cd2-form textarea{min-height:82px;resize:vertical}.cd2-form button{min-height:38px;border:0;border-radius:10px;background:var(--accent,#5d8df5);color:#fff;font-weight:800;cursor:pointer}.cd2-form button:disabled{opacity:.55}.cd2-section-title{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:10px}.cd2-section-title h3{margin:0}
  .cd2-table{display:grid;gap:6px}.cd2-item{padding:11px 12px;border:1px solid var(--line,#2d3442);border-radius:12px;background:var(--fill,rgba(255,255,255,.025))}.cd2-item b{display:block;font-size:12px}.cd2-item small{display:block;margin-top:4px;color:var(--label-3,#7f8999);font-size:10.5px}.cd2-target{margin-top:5px;color:var(--label-2,#a8b1c1);font-size:11px}
  @media(max-width:900px){.cd2-metrics{grid-template-columns:repeat(2,minmax(0,1fr))}.cd2-grid{grid-template-columns:1fr}}@media(max-width:560px){.cd2-hero{display:block}.cd2-metrics{grid-template-columns:1fr 1fr}.cd2-metric b{font-size:21px}}
  `;
  document.head.append(style);
}

async function loadStudents(ctx){
  const snap=await getDocs(query(collection(ctx.db,LINK_COLLECTION),where("coachUid","==",ctx.user.uid)));
  const links=snap.docs.map(item=>({id:item.id,...item.data()})).filter(item=>item.active===true);
  return Promise.all(links.map(async link=>{
    const[shareSnap,profileSnap]=await Promise.all([
      getDoc(doc(ctx.db,SHARE_COLLECTION,link.studentUid)),
      getDoc(doc(ctx.db,PROFILE_COLLECTION,link.studentUid))
    ]);
    return{link,share:shareSnap.exists()?shareSnap.data():null,profile:profileSnap.exists()?profileSnap.data():null};
  }));
}

function programItems(share){
  const result=[];
  for(const week of share?.program?.weeks||[]){
    const rows=[...(week?.data?.r||[]),...(week?.data?.s||[])];
    for(const row of rows){
      for(const value of row||[]){
        const task=text(value,220);
        if(task)result.push({week:text(week.week,10),task});
      }
    }
  }
  return result.slice(-40).reverse();
}

function examInfo(share){
  const exams=Array.isArray(share?.exams)?share.exams:[];
  const latest=exams.at(-1)||null;
  const previous=exams.at(-2)||null;
  const delta=latest&&previous?num(latest.totalNet)-num(previous.totalNet):null;
  return{exams,latest,previous,delta};
}

function topErrors(share){
  const map=new Map();
  for(const item of share?.errorJournal||[]){
    const subject=text(item.subject,60)||"Ders";
    const topic=text(item.topic,100)||"Konu";
    const key=subject+"|"+topic;
    const current=map.get(key)||{subject,topic,count:0};
    current.count+=Math.max(1,num(item.n));
    map.set(key,current);
  }
  return [...map.values()].sort((a,b)=>b.count-a.count).slice(0,8);
}

function topicStats(share){
  const items=share?.topics?.items||[];
  const overdue=items.filter(item=>item.deadline&&item.deadline<today()&&num(item.st)<3);
  const active=items.filter(item=>num(item.st)>0&&num(item.st)<3);
  const complete=items.filter(item=>num(item.st)>=3);
  return{items,overdue,active,complete};
}

function studentName(data){return text(data?.share?.profile?.name||data?.profile?.displayName,80)||"Öğrenci"}
function track(data){return text(data?.share?.profile?.track,12)||"YKS"}

async function sendAction(studentUid,type,payload,button){
  if(!runtime.ctx?.db||!runtime.ctx?.user)return;
  if(button)button.disabled=true;
  try{
    await setDoc(doc(collection(runtime.ctx.db,ACTION_COLLECTION)),{
      studentUid,
      coachUid:runtime.ctx.user.uid,
      type,
      payload,
      status:"pending",
      createdAt:serverTimestamp(),
      updatedAt:serverTimestamp()
    });
    toast("Koç görevi gönderildi ✓");
  }finally{if(button)button.disabled=false}
}

function metric(label,value,note){return`<div class="cd2-metric"><span>${esc(label)}</span><b>${esc(value)}</b><small>${esc(note)}</small></div>`}
function rows(items,render){return items.length?items.map(render).join(""):'<div class="cd2-empty">Henüz veri yok.</div>'}

function renderSummary(host,data){
  const share=data.share;
  if(!share){host.innerHTML='<div class="cd2-empty">Öğrencinin paylaşımı henüz oluşmadı. Öğrenci uygulamayı açtığında koç görünümü otomatik hazırlanacak.</div>';return}
  const exams=examInfo(share);
  const topics=topicStats(share);
  const errors=topErrors(share);
  const program=programItems(share).slice(0,5);
  const latestNet=exams.latest?`${num(exams.latest.totalNet).toFixed(1)} net`:"—";
  const delta=exams.delta==null?"İlk deneme":`${exams.delta>=0?"+":""}${exams.delta.toFixed(1)} net değişim`;
  host.innerHTML=`
    <div class="cd2-metrics">
      ${metric("7 gün çalışma",`${(num(share.progress?.minutes7)/60).toFixed(1)} sa`,"Toplam odak süresi")}
      ${metric("7 gün soru",String(num(share.progress?.questions7)),"Son 7 gün")}
      ${metric("Son deneme",latestNet,delta)}
      ${metric("Geciken konu",String(topics.overdue.length),`${topics.active.length} aktif konu`)}
    </div>
    <div class="cd2-grid">
      <section class="cd2-card"><h3>⚠️ Dikkat edilmesi gerekenler</h3>
        ${topics.overdue.length?`<div class="cd2-alert"><div><strong>Geciken konular</strong><small>${esc(topics.overdue.slice(0,3).map(x=>x.topic).join(" · "))}</small></div><span class="cd2-badge">${topics.overdue.length}</span></div>`:""}
        ${errors.length?`<div class="cd2-alert"><div><strong>En çok hata yapılan konu</strong><small>${esc(errors[0].subject)} · ${esc(errors[0].topic)}</small></div><span class="cd2-badge">${errors[0].count}</span></div>`:""}
        ${exams.delta!=null&&exams.delta<0?`<div class="cd2-alert"><div><strong>Son denemede net düşüşü</strong><small>${esc(exams.latest?.name||"Son deneme")}</small></div><span class="cd2-badge">${exams.delta.toFixed(1)}</span></div>`:""}
        ${!topics.overdue.length&&!errors.length&&!(exams.delta!=null&&exams.delta<0)?'<div class="cd2-empty">Şu anda öne çıkan kritik uyarı yok.</div>':""}
      </section>
      <section class="cd2-card"><h3>🗓️ Programdan son görevler</h3>${rows(program,item=>`<div class="cd2-row"><span>${esc(item.task)}</span><b>${esc(item.week)}</b></div>`)}</section>
      <section class="cd2-card"><h3>📊 Son denemeler</h3>${rows((exams.exams||[]).slice(-4).reverse(),item=>`<div class="cd2-row"><span>${esc(item.date)} · ${esc(item.name||item.type||"Deneme")}</span><b>${num(item.totalNet).toFixed(1)} net</b></div>`)}</section>
      <section class="cd2-card"><h3>🧭 Hızlı işlemler</h3>
        <form class="cd2-form" data-quick="program_task"><input name="text" maxlength="220" required placeholder="Programa görev ekle"><input name="date" type="date" value="${today()}"><button type="submit">Görevi gönder</button></form>
        <form class="cd2-form" data-quick="coach_note" style="margin-top:12px"><textarea name="text" maxlength="500" required placeholder="Koç notu"></textarea><button type="submit">Not gönder</button></form>
      </section>
    </div>`;
  host.querySelectorAll("[data-quick]").forEach(form=>form.onsubmit=async event=>{
    event.preventDefault();
    const fd=new FormData(form),payload={};
    for(const[key,value]of fd.entries())payload[key]=text(value,key==="text"?500:220);
    const button=form.querySelector("button");
    try{await sendAction(data.link.studentUid,form.dataset.quick,payload,button);form.reset()}catch(error){alert("Gönderilemedi: "+text(error?.message,120))}
  });
}

function renderProgram(host,data){
  const items=programItems(data.share);
  host.innerHTML=`<section class="cd2-card"><div class="cd2-section-title"><h3>Program</h3><span class="cd2-muted">Son kayıtlar</span></div><div class="cd2-table">${rows(items.slice(0,30),item=>`<div class="cd2-item"><b>${esc(item.task)}</b><small>Hafta · ${esc(item.week)}</small></div>`)}</div></section>`;
}

function renderExams(host,data){
  const info=examInfo(data.share);
  host.innerHTML=`<div class="cd2-grid"><section class="cd2-card"><h3>Deneme geçmişi</h3>${rows(info.exams.slice().reverse(),item=>`<div class="cd2-row"><span>${esc(item.date)} · ${esc(item.name||item.type||"Deneme")}</span><b>${num(item.totalNet).toFixed(1)} net</b></div>`)}</section><section class="cd2-card"><h3>Deneme sonrası görev</h3><form class="cd2-form" data-post-exam><input name="text" maxlength="220" required placeholder="Deneme sonrası görev"><input name="date" type="date" value="${today()}"><button type="submit">Gönder</button></form></section></div>`;
  const form=host.querySelector("[data-post-exam]");
  form.onsubmit=async event=>{event.preventDefault();const fd=new FormData(form);const button=form.querySelector("button");try{await sendAction(data.link.studentUid,"post_exam_task",{text:text(fd.get("text"),220),date:text(fd.get("date"),10)},button);form.reset()}catch(error){alert("Gönderilemedi: "+text(error?.message,120))}};
}

function renderProgress(host,data){
  const share=data.share||{};
  const topics=topicStats(share);
  host.innerHTML=`<div class="cd2-metrics">${metric("7 gün çalışma",`${(num(share.progress?.minutes7)/60).toFixed(1)} sa`,"Odak süresi")}${metric("7 gün soru",String(num(share.progress?.questions7)),"Çözülen soru")}${metric("Tamamlanan konu",String(topics.complete.length),"Konu ilerlemesi")}${metric("Paragraf / Problem",String(share.paragraphProblem?.entries?.length||0),"Paylaşılan kayıt")}</div><section class="cd2-card"><h3>Hedefler</h3><div class="cd2-row"><span>TYT hedef net</span><b>${num(share.profile?.targetNetTYT)}</b></div><div class="cd2-row"><span>AYT hedef net</span><b>${num(share.profile?.targetNetAYT)}</b></div><div class="cd2-row"><span>Hedef üniversite</span><b>${esc(share.profile?.targetUniversity||"—")}</b></div><div class="cd2-row"><span>Hedef bölüm</span><b>${esc(share.profile?.targetDepartment||"—")}</b></div></section>`;
}

function renderTopics(host,data){
  const stats=topicStats(data.share);
  const ordered=[...stats.overdue,...stats.active.filter(x=>!stats.overdue.includes(x)),...stats.complete].slice(0,80);
  const options=(stats.items||[]).map(item=>`<option value="${esc(item.key)}">${esc(item.exam)} · ${esc(item.subject)} · ${esc(item.topic)}</option>`).join("");
  host.innerHTML=`<div class="cd2-grid"><section class="cd2-card"><h3>Konu durumu</h3>${rows(ordered,item=>`<div class="cd2-item"><b>${esc(item.exam)} · ${esc(item.subject)} · ${esc(item.topic)}</b><small>${num(item.st)>=3?"Tamamlandı":num(item.st)>0?"Çalışılıyor":"Başlanmadı"}${item.deadline?` · Hedef ${esc(item.deadline)}`:""}</small></div>`)}</section><section class="cd2-card"><h3>Konu bitiş hedefi gönder</h3><form class="cd2-form" data-topic-deadline><select name="key" required><option value="">Konu seç</option>${options}</select><input name="date" type="date" value="${today()}"><button type="submit">Hedef gönder</button></form></section></div>`;
  const form=host.querySelector("[data-topic-deadline]");
  form.onsubmit=async event=>{event.preventDefault();const fd=new FormData(form);const button=form.querySelector("button");try{await sendAction(data.link.studentUid,"topic_deadline",{key:text(fd.get("key"),220),date:text(fd.get("date"),10)},button)}catch(error){alert("Gönderilemedi: "+text(error?.message,120))}};
}

function renderErrors(host,data){
  const errors=topErrors(data.share);
  const raw=(data.share?.errorJournal||[]).slice(-30).reverse();
  host.innerHTML=`<div class="cd2-grid"><section class="cd2-card"><h3>En çok hata yapılan konular</h3>${rows(errors,item=>`<div class="cd2-row"><span>${esc(item.subject)} · ${esc(item.topic)}</span><b>${item.count}</b></div>`)}</section><section class="cd2-card"><h3>Son hata kayıtları</h3>${rows(raw,item=>`<div class="cd2-row"><span>${esc(item.date)} · ${esc(item.subject)} · ${esc(item.topic)}</span><b>${Math.max(1,num(item.n))}</b></div>`)}</section></div>`;
}

function renderDetail(){
  const dashboard=document.getElementById("yksCoachDashboard");
  const detail=dashboard?.querySelector("[data-detail]");
  const data=runtime.students[runtime.selected];
  if(!detail)return;
  if(!data){detail.innerHTML='<div class="cd2-empty">Henüz öğrenci yok. Öğrencinin Koç Kodum alanındaki kodunu girerek ekleyebilirsin.</div>';return}
  const share=data.share;
  const header=`<div class="cd2-hero"><div><div class="cd2-kicker">Seçili öğrenci</div><h2>${esc(studentName(data))}</h2><div class="cd2-muted">${esc(track(data))}${share?.profile?.targetUniversity?` · ${esc(share.profile.targetUniversity)}`:""}${share?.profile?.targetDepartment?` · ${esc(share.profile.targetDepartment)}`:""}</div></div><div class="cd2-muted">Son paylaşım: ${share?.updatedAt?.toDate?esc(share.updatedAt.toDate().toLocaleString("tr-TR")):"—"}</div></div>`;
  const nav=`<nav class="cd2-tabs" aria-label="Öğrenci detayları">${tabs.map(([id,label])=>`<button type="button" class="cd2-tab ${runtime.tab===id?"on":""}" data-tab="${id}">${label}</button>`).join("")}</nav>`;
  detail.innerHTML=`<div class="cd2-wrap">${header}${nav}<div data-cd2-body></div></div>`;
  detail.querySelectorAll("[data-tab]").forEach(button=>button.onclick=()=>{runtime.tab=button.dataset.tab;renderDetail()});
  const body=detail.querySelector("[data-cd2-body]");
  if(runtime.tab==="program")renderProgram(body,data);
  else if(runtime.tab==="exams")renderExams(body,data);
  else if(runtime.tab==="progress")renderProgress(body,data);
  else if(runtime.tab==="topics")renderTopics(body,data);
  else if(runtime.tab==="errors")renderErrors(body,data);
  else renderSummary(body,data);
}

function renderStudentList(){
  const dashboard=document.getElementById("yksCoachDashboard");
  const list=dashboard?.querySelector("[data-list]");
  if(!list)return;
  if(!runtime.students.length){list.innerHTML='<div class="ca-muted">Henüz öğrenci yok.</div>';return}
  list.innerHTML=runtime.students.map((data,index)=>`<button type="button" class="ca-student ${runtime.selected===index?"on":""}" data-cd2-student="${index}"><b>${esc(studentName(data))}</b><div class="ca-muted">${esc(track(data))}</div></button>`).join("");
  list.querySelectorAll("[data-cd2-student]").forEach(button=>button.onclick=()=>{runtime.selected=Number(button.dataset.cd2Student)||0;runtime.tab="summary";renderStudentList();renderDetail()});
}

async function refresh(){
  if(!runtime.ctx)return;
  const previousUid=runtime.students[runtime.selected]?.link?.studentUid||"";
  runtime.students=await loadStudents(runtime.ctx);
  const nextIndex=runtime.students.findIndex(item=>item.link.studentUid===previousUid);
  runtime.selected=nextIndex>=0?nextIndex:0;
  renderStudentList();
  renderDetail();
}

function takeover(ctx,result){
  if(result?.role!=="coach")return false;
  styles();
  runtime.ctx=ctx;runtime.profile=result.profile;runtime.tab="summary";
  const dashboard=document.getElementById("yksCoachDashboard");
  if(!dashboard)return false;
  dashboard.dataset.coachDashboard="v2";
  const refreshButton=dashboard.querySelector("[data-refresh]");
  if(refreshButton)refreshButton.onclick=()=>void refresh();
  void refresh();
  return true;
}

function install(){
  const auth=window.YKSAccountAuth;
  if(!auth||auth.__coachDashboardV2)return false;
  auth.__coachDashboardV2=true;
  const originalSignedIn=auth.onSignedIn?.bind(auth);
  auth.onSignedIn=async ctx=>{
    const result=originalSignedIn?await originalSignedIn(ctx):null;
    if(result?.role==="coach"){
      takeover(ctx,result);
      setTimeout(()=>takeover(ctx,result),0);
    }
    return result;
  };
  document.documentElement.dataset.coachDashboardV2="ready";
  window.dispatchEvent(new CustomEvent("yks:coach-dashboard-v2-ready",{detail:{version:"2.0.0"}}));
  return true;
}

install();
