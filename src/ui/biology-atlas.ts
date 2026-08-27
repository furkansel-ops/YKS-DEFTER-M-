import {ATLAS_GROUPS, ATLAS_ORGANS, ATLAS_TOPICS, ATLAS_SOURCE, type AtlasGroup, type AtlasTopic} from "../data/biology-atlas.ts";
import {answerAtlas, atlasAsset, atlasStep, atlasText, AtlasRequestGate, filterAtlas, getAtlasOrgan, getAtlasTopic} from "../domain/biology-atlas-service.ts";
import {atlasDiagram, atlasEscape as esc} from "./biology-atlas-diagrams.ts";
import type {AtlasModelControls} from "./biology-atlas-model.ts";
import "./biology-atlas.css";

export function createBiologyAtlas() {
  let panel: HTMLElement | null=null, topicId="sinir", organId="heart", mode: "topic"|"model"="topic";
  let query="",group: AtlasGroup|"all"="all",step=0,practice=false,picked:number|null=null;
  let model: AtlasModelControls|null=null, modelTimer:ReturnType<typeof setTimeout>|undefined, autoRotate=false,wireframe=false;
  let loadingModel=false;
  const gate=new AtlasRequestGate(), bound=new WeakSet<HTMLElement>();
  const find=<T extends HTMLElement>(id:string)=>panel?.querySelector<T>("#"+id)||null;
  const topic=()=>getAtlasTopic(topicId)!;
  function stopModel() {gate.cancel();clearTimeout(modelTimer);model?.dispose();model=null;loadingModel=false;autoRotate=false;wireframe=false;}
  function renderList() {
    const rows=mode==="topic"?filterAtlas(query,group):ATLAS_ORGANS.filter(item=>atlasText(item.name+" "+item.detail).includes(atlasText(query)));
    const list=find("atlasIndex");if(!list)return;
    list.innerHTML=rows.length?rows.map(row=>{
      if("scene" in row)return `<button type="button" data-atlas-action="topic" data-id="${row.id}" aria-pressed="${mode==="topic"&&topicId===row.id}"><span>${esc(row.group)}</span><b>${esc(row.title)}</b></button>`;
      return `<button type="button" class="atlas-organ-item" data-atlas-action="organ" data-id="${row.id}" aria-pressed="${mode==="model"&&organId===row.id}"><img src="${atlasAsset("thumbs/"+row.id+".webp")}" width="44" height="44" alt="" loading="lazy"><span><b>${esc(row.name)}</b><small>3B · ${row.megabytes} MB</small></span></button>`;
    }).join(""):'<p class="atlas-empty">Eşleşen başlık yok. Aramayı veya grubu değiştirebilirsin.</p>';
    const count=find("atlasCount");if(count)count.textContent=rows.length+(mode==="topic"?" görsel konu":" organ");
    const filter=find("atlasGroupLabel");if(filter)filter.hidden=mode!=="topic";
    for(const value of ["topic","model"]){find("atlasMode-"+value)?.setAttribute("aria-pressed",String(mode===value));}
  }
  function lessonMarkup(t:AtlasTopic) {
    const result=picked===null?null:answerAtlas(t,picked);
    const node=t.steps[step]!;
    return `<header class="atlas-lesson-head"><div><span class="atlas-kicker">${esc(t.group)}</span><h3>${esc(t.title)}</h3><p>${esc(t.intro)}</p></div><button type="button" data-atlas-action="practice" aria-pressed="${practice}">${practice?"Öğrenmeye dön":"Kendini sına"}</button></header>`+
      `<div class="atlas-workbench"><figure class="atlas-figure">${atlasDiagram(t,step,practice,result?.answer??null)}<figcaption>Öğretici şema · Ölçekli anatomik çizim değildir. Numaralara dokun veya aşağıdaki düğmeleri kullan.</figcaption></figure>`+
      `<aside class="atlas-explanation" aria-live="polite">${practice?`<span class="atlas-kicker">Görsel soru</span><h4>${esc(t.quiz.prompt)}</h4><p>Şemadaki numaralardan uygun olanı seç.</p>${result?`<div class="atlas-feedback ${result.correct?"is-correct":"is-wrong"}" role="status"><b>${result.correct?"Doğru ✓":"Birlikte düzeltelim"}</b><p>Doğru nokta: ${result.answer+1} · ${esc(t.steps[result.answer]![0])}</p><p>${esc(result.explanation)}</p></div><button type="button" data-atlas-action="retry-quiz">Yeniden dene</button>`:""}`:
      `<span class="atlas-kicker">${step+1} / ${t.steps.length} · Yapı ve işlev</span><h4>${esc(node[0])}</h4><p>${esc(node[1])}</p><div class="atlas-step-nav"><button type="button" data-atlas-action="previous" ${step===0?"disabled":""}>← Önceki</button><button type="button" data-atlas-action="next" ${step===t.steps.length-1?"disabled":""}>Sonraki →</button></div>`}</aside></div>`+
      `<div class="atlas-step-list" role="group" aria-label="${practice?"Yanıt noktaları":"Şema adımları"}">${t.steps.map(([label],i)=>`<button type="button" data-atlas-step="${i}" aria-pressed="${practice?picked===i:step===i}"><span>${i+1}</span>${practice?"Nokta "+(i+1):esc(label)}</button>`).join("")}</div>`+
      `${!practice||result?`<div class="atlas-trap"><b>AYT'de karıştırma</b><p>${esc(t.trap)}</p></div>`:""}`+
      (t.models.length?`<div class="atlas-related"><span>Bu konuyla ilgili 3B organlar</span>${t.models.map(id=>`<button type="button" data-atlas-action="organ" data-id="${id}">${esc(getAtlasOrgan(id)!.name)} ↗</button>`).join("")}</div>`:"");
  }
  function renderLesson(focus?:string) {
    stopModel();const main=find("atlasContent");if(!main)return;
    main.innerHTML=lessonMarkup(topic());
    if(focus)main.querySelector<HTMLElement>(focus)?.focus({preventScroll:true});
  }
  function modelMessage(message:string,state:"loading"|"ready"|"error"|"idle") {
    const status=find("atlasModelStatus");if(status)status.textContent=message;
    const stage=find("atlasModelStage");if(stage)stage.dataset.state=state;
    for(const button of panel?.querySelectorAll<HTMLButtonElement>("[data-model-control]")||[]){button.disabled=state!=="ready";if(state!=="ready"&&button.hasAttribute("aria-pressed"))button.setAttribute("aria-pressed","false");}
    const retry=find("atlasModelRetry");if(retry)retry.hidden=state==="ready"||state==="loading";
    find("atlasModelCanvas")?.setAttribute("aria-busy",String(state==="loading"));
  }
  async function startModel() {
    const container=find("atlasModelCanvas"),organ=getAtlasOrgan(organId);if(!container||!organ)return;
    stopModel();const request=gate.start();loadingModel=true;
    modelMessage("3B model hazırlanıyor…", "loading");
    modelTimer=setTimeout(()=>{if(request.current()){stopModel();modelMessage("Model zamanında yüklenemedi. Resimle devam edebilir veya yeniden deneyebilirsin.","error");}},45000);
    try {
      const {loadAtlasModel}=await import("./biology-atlas-model.ts");
      if(!request.current())return;
      const next=await loadAtlasModel(container,organ.id,request.signal,percent=>{if(request.current())modelMessage(percent?`Model yükleniyor · %${percent}`:"Model hazırlanıyor…","loading");});
      if(!request.current()){next.dispose();return;}
      model=next;loadingModel=false;clearTimeout(modelTimer);modelMessage("Model hazır · Sürükle: döndür · İki parmak / tekerlek: yakınlaştır", "ready");
    }catch(error){
      if(!request.current())return;loadingModel=false;clearTimeout(modelTimer);
      modelMessage(error instanceof Error?error.message:"3B görünüm açılamadı; resimli görünüm hazır.","error");
    }
  }
  function renderModel() {
    stopModel();const organ=getAtlasOrgan(organId)!,main=find("atlasContent");if(!main)return;
    main.innerHTML=`<header class="atlas-lesson-head"><div><span class="atlas-kicker">3B organ koleksiyonu</span><h3>${esc(organ.name)}</h3><p>${esc(organ.detail)}</p></div><button type="button" data-atlas-action="topic" data-id="${organ.topic}">İlgili şemayı aç ↗</button></header>`+
      `<div class="atlas-model-stage" id="atlasModelStage" data-state="idle"><div class="atlas-model-fallback"><img src="${atlasAsset("images/"+organ.id+".webp")}" alt="${esc(organ.name)} temsili organ resmi"><span>Resimli görünüm</span></div><div id="atlasModelCanvas" class="atlas-model-canvas"></div></div>`+
      `<p id="atlasModelStatus" class="atlas-model-status" role="status" aria-live="polite"></p><div class="atlas-model-tools"><button type="button" id="atlasModelRetry" data-atlas-action="load-model">3B modeli yeniden aç</button><button type="button" data-model-control data-atlas-action="zoom-in" disabled>＋ Yakınlaştır</button><button type="button" data-model-control data-atlas-action="zoom-out" disabled>− Uzaklaştır</button><button type="button" data-model-control data-atlas-action="model-reset" disabled>Görünümü sıfırla</button><button type="button" data-model-control data-atlas-action="rotate" aria-pressed="false" disabled>Otomatik döndür</button><button type="button" data-model-control data-atlas-action="wire" aria-pressed="false" disabled>Tel kafes</button></div>`+
      `<p class="atlas-model-note">3B model dış biçimi incelemek içindir; iç yapılar için ilgili şemayı kullan. Tel kafes, doku katmanlarını ayırmaz. Modeller yalnız açıldığında indirilir; yaklaşık ${organ.megabytes} MB. WebGL desteği yoksa resimli görünüm kullanılabilir.</p>`;
    void startModel();
  }
  function clearFilters() {
    query="";group="all";const search=find<HTMLInputElement>("atlasSearch"),select=find<HTMLSelectElement>("atlasGroup");if(search)search.value="";if(select)select.value="all";
  }
  function focusContent() {find("atlasContent")?.focus({preventScroll:true});}
  function chooseTopic(id:string) {
    if(!getAtlasTopic(id))return;if(mode!=="topic")clearFilters();mode="topic";topicId=id;step=0;practice=false;picked=null;
    renderList();renderLesson();focusContent();
  }
  function chooseOrgan(id:string) {
    if(!getAtlasOrgan(id))return;if(mode!=="model")clearFilters();mode="model";organId=id;renderList();renderModel();focusContent();
  }
  function chooseStep(value:number) {
    const t=topic();if(!Number.isInteger(value)||value<0||value>=t.steps.length)return;
    if(practice){if(picked!==null)return;picked=value;}else step=atlasStep(t,value);
    renderLesson(`.atlas-step-list [data-atlas-step="${value}"]`);
  }
  function onClick(event:Event) {
    const element=event.target instanceof Element?event.target.closest<HTMLElement>("[data-atlas-action],[data-atlas-step]"):null;
    if(!element||!panel?.contains(element))return;
    if(element.dataset.atlasStep!==undefined){chooseStep(Number(element.dataset.atlasStep));return;}
    const action=element.dataset.atlasAction,id=element.dataset.id||"";
    if(action==="topic"){chooseTopic(id);return;}
    if(action==="organ"){chooseOrgan(id);return;}
    if(action==="mode") {
      clearFilters();
      if(id==="model")chooseOrgan(organId);else chooseTopic(topicId);return;
    }
    if(action==="practice"){practice=!practice;picked=null;renderLesson('[data-atlas-action="practice"]');return;}
    if(action==="retry-quiz"){picked=null;renderLesson('.atlas-step-list [data-atlas-step="0"]');return;}
    if(action==="next"||action==="previous"){step=Math.max(0,Math.min(topic().steps.length-1,step+(action==="next"?1:-1)));renderLesson(`.atlas-step-list [data-atlas-step="${step}"]`);return;}
    if(action==="load-model"){void startModel();return;}
    if(action==="zoom-in")model?.zoom(-1);
    if(action==="zoom-out")model?.zoom(1);
    if(action==="model-reset")model?.reset();
    if(action==="rotate"&&model){autoRotate=!autoRotate;model.rotate(autoRotate);element.setAttribute("aria-pressed",String(autoRotate));}
    if(action==="wire"&&model){wireframe=!wireframe;model.wireframe(wireframe);element.setAttribute("aria-pressed",String(wireframe));}
  }
  function mount(target:HTMLElement|null) {
    if(!target)return false;
    if(panel===target&&target.dataset.atlasVersion==="1")return true;
    stopModel();panel=target;target.dataset.atlasVersion="1";
    target.innerHTML=`<header class="atlas-header"><div><span class="atlas-kicker">GÖREREK ÖĞREN · BAĞLANTI KUR</span><h2>Biyoloji Atlası</h2><p>${ATLAS_TOPICS.length} etkileşimli konu · 9 organ modeli · Türkçe yapı–işlev anlatımı</p></div><div class="atlas-mode-switch" role="group" aria-label="Atlas görünümü"><button type="button" id="atlasMode-topic" data-atlas-action="mode" data-id="topic">Konu atlası</button><button type="button" id="atlasMode-model" data-atlas-action="mode" data-id="model">3B organlar</button></div></header>`+
      `<div class="atlas-layout"><aside class="atlas-sidebar"><label>Atlas içinde ara<input id="atlasSearch" type="search" placeholder="Nefron, DNA, fotosentez…" maxlength="160" autocomplete="off"></label><label id="atlasGroupLabel">Konu grubu<select id="atlasGroup"><option value="all">Bütün konular</option>${ATLAS_GROUPS.map(name=>`<option>${esc(name)}</option>`).join("")}</select></label><p id="atlasCount" role="status"></p><nav id="atlasIndex" aria-label="Biyoloji atlası konuları"></nav></aside><section id="atlasContent" class="atlas-content" aria-label="Seçilen biyoloji konusu" tabindex="-1"></section></div>`+
      `<footer class="atlas-footer"><p>Özet görsel öğrenme atlası; tam konu anlatımının veya güncel sınav kapsamının yerine geçmez. Buradaki sorular deneme, konu tamamlama ve bilim kartı kayıtlarını değiştirmez.</p><a href="${ATLAS_SOURCE}" target="_blank" rel="noopener noreferrer">MEB / OGM AYT konu başlıkları ↗</a><a href="./anatomy/ATTRIBUTION.md" target="_blank" rel="noopener noreferrer">3B modellerin kaynağı ve kullanım notu ↗</a></footer>`;
    if(!bound.has(target)) {
      bound.add(target);target.addEventListener("click",onClick);
      target.addEventListener("keydown",event=>{if((event.key==="Enter"||event.key===" ")&&event.target instanceof SVGElement&&event.target.matches("[data-atlas-step]")){event.preventDefault();chooseStep(Number(event.target.getAttribute("data-atlas-step")));}});
      target.addEventListener("input",event=>{if(event.target instanceof HTMLInputElement&&event.target.id==="atlasSearch"){query=event.target.value.slice(0,160);renderList();}});
      target.addEventListener("change",event=>{if(event.target instanceof HTMLSelectElement&&event.target.id==="atlasGroup"){group=ATLAS_GROUPS.includes(event.target.value as AtlasGroup)?event.target.value as AtlasGroup:"all";renderList();}});
      target.addEventListener("atlas:model-error",event=>{stopModel();modelMessage(String((event as CustomEvent).detail),"error");});
    }
    renderList();if(mode==="topic")renderLesson();else renderModel();return true;
  }
  function suspend() {
    if(model||loadingModel){stopModel();modelMessage("3B görünüm duraklatıldı. Yeniden açarak devam edebilirsin.","idle");}
  }
  const checkNavigation=()=>{if(panel&&!panel.getClientRects().length)suspend();};
  window.addEventListener("yks:navigation-after",checkNavigation);document.addEventListener("yks:navigation-after",checkNavigation);
  // Merely scrolling the viewer offscreen pauses its renderer, not its data.
  // Switching a lab/application tab explicitly cancels a pending download.
  return {mount,suspend};
}
