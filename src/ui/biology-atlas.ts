import {ATLAS_GROUPS, ATLAS_ORGANS, ATLAS_TOPICS, ATLAS_SOURCE, type AtlasGroup} from "../data/biology-atlas.ts";
import {organGuide} from "../data/biology-organs.ts";
import {ORGAN_LANDMARKS} from "../data/biology-organ-landmarks.ts";
import {atlasAsset, atlasStep, atlasText, AtlasRequestGate, filterAtlas, getAtlasOrgan, getAtlasTopic} from "../domain/biology-atlas-service.ts";
import {atlasEscape as esc} from "./biology-atlas-diagrams.ts";
import {atlasOverview, atlasLesson, type LessonView} from "./biology-atlas-lessons.ts";
import {organDiagram} from "./biology-organ-diagrams.ts";
import type {AtlasModelControls} from "./biology-atlas-model.ts";
import "./biology-atlas.css";

export function createBiologyAtlas() {
  let panel: HTMLElement | null=null, topicId="sinir", organId="heart", mode: "topic"|"model"="topic";
  let query="",group: AtlasGroup|"all"="all",step=0,view:LessonView="steps",picked:number|null=null,overview=true;
  let labels=true,wide=false,organView:"model"|"anatomy"="model",organOpen=false,organLabels=true,structureId="";
  let model: AtlasModelControls|null=null, modelTimer:ReturnType<typeof setTimeout>|undefined, autoRotate=false,wireframe=false;
  let loadingModel=false;
  const gate=new AtlasRequestGate(), bound=new WeakSet<HTMLElement>();
  const find=<T extends HTMLElement>(id:string)=>panel?.querySelector<T>("#"+id)||null;
  const topic=()=>getAtlasTopic(topicId)!;
  function stopModel() {gate.cancel();clearTimeout(modelTimer);model?.dispose();model=null;loadingModel=false;autoRotate=false;wireframe=false;}
  function renderList() {
    const rows=mode==="topic"?filterAtlas(query,group):ATLAS_ORGANS.filter(item=>atlasText(item.name+" "+item.detail).includes(atlasText(query)));
    const list=find("atlasIndex");if(!list)return;
    list.innerHTML=mode==="topic"&&group==="all"&&!query?ATLAS_GROUPS.map((name,i)=>`<button type="button" data-atlas-action="group" data-id="${esc(name)}"><span>ALAN ${i+1} · ${ATLAS_TOPICS.filter(t=>t.group===name).length} konu</span><b>${esc(name)} →</b></button>`).join(""):rows.length?rows.map(row=>{
      if("scene" in row)return `<button type="button" data-atlas-action="topic" data-id="${row.id}" aria-pressed="${!overview&&mode==="topic"&&topicId===row.id}"><span>${esc(row.group)}</span><b>${esc(row.title)}</b></button>`;
      return `<button type="button" class="atlas-organ-item" data-atlas-action="organ" data-id="${row.id}" aria-pressed="${mode==="model"&&organId===row.id}"><img src="${atlasAsset("thumbs/"+row.id+".webp")}" width="44" height="44" alt="" loading="lazy"><span><b>${esc(row.name)}</b><small>3B + ${organGuide(row.id)!.structures.length} yapı</small></span></button>`;
    }).join(""):'<p class="atlas-empty">Eşleşen başlık yok. Aramayı veya grubu değiştirebilirsin.</p>';
    const count=find("atlasCount");if(count)count.textContent=rows.length+(mode==="topic"?" görsel konu":" organ");
    const filter=find("atlasGroupLabel");if(filter)filter.hidden=mode!=="topic";
    for(const value of ["topic","model"]){find("atlasMode-"+value)?.setAttribute("aria-pressed",String(mode===value));}
  }
  function renderLesson(focus?:string) {
    stopModel();const main=find("atlasContent");if(!main)return;
    if(panel)panel.dataset.atlasWide=String(!overview&&wide);
    main.innerHTML=overview?atlasOverview(group,query):atlasLesson(topic(),{step,view,picked,labels,wide});
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
      const next=await loadAtlasModel(container,organ.id,request.signal,percent=>{if(request.current())modelMessage(percent?`Model yükleniyor · %${percent}`:"Model hazırlanıyor…","loading");},{onSelect:id=>{if(request.current())chooseStructure(id);}});
      if(!request.current()){next.dispose();return;}
      model=next;loadingModel=false;clearTimeout(modelTimer);modelMessage("Etiketli 3B model hazır · Sürükle: döndür · Nokta veya iç parçaya dokun: yapıyı seç", "ready");syncModelSelection();
    }catch(error){
      if(!request.current())return;loadingModel=false;clearTimeout(modelTimer);
      modelMessage(error instanceof Error?error.message:"3B görünüm açılamadı; resimli görünüm hazır.","error");
    }
  }
  function renderModel() {
    stopModel();const organ=getAtlasOrgan(organId)!,main=find("atlasContent");if(!main)return;
    wide=false;if(panel)panel.dataset.atlasWide="false";
    main.innerHTML=organHeader()+`<div class="atlas-live-workbench"><div class="atlas-live-view"><div class="atlas-model-stage" id="atlasModelStage" data-state="idle"><div class="atlas-model-fallback"><img src="${atlasAsset("images/"+organ.id+".webp")}" alt="${esc(organ.name)} temsili organ resmi"><span>Resimli yedek görünüm</span></div><div id="atlasModelCanvas" class="atlas-model-canvas"></div><span id="atlas3DViewLabel" class="atlas-3d-view-label">3B dış yüzey</span></div>`+
      `<p id="atlasModelStatus" class="atlas-model-status" role="status" aria-live="polite"></p><div class="atlas-model-tools"><button type="button" id="atlasModelRetry" data-atlas-action="load-model">3B modeli yeniden aç</button><button type="button" data-model-control data-atlas-action="zoom-in" disabled>＋ Yakınlaştır</button><button type="button" data-model-control data-atlas-action="zoom-out" disabled>− Uzaklaştır</button><button type="button" data-model-control data-atlas-action="model-reset" disabled>Görünümü sıfırla</button><button type="button" data-model-control data-atlas-action="rotate" aria-pressed="false" disabled>Otomatik döndür</button><button type="button" data-model-control data-atlas-action="wire" aria-pressed="false" disabled>Tel kafes</button></div>`+
      `<div class="atlas-model-tools atlas-view-tools"><button type="button" id="atlasModelLabels" data-atlas-action="organ-labels" aria-pressed="${organLabels}">${organLabels?"Etiketleri gizle":"Etiketleri göster"}</button><button type="button" id="atlasModelWide" data-atlas-action="wide" aria-pressed="false">Görseli büyüt</button></div></div><aside id="atlasStructureInfo" class="atlas-organ-explanation" aria-live="polite">${structureInfo()}</aside></div>`+
      `<section class="atlas-structure-preview"><div><span class="atlas-kicker">MODELİN ÜZERİNDE VEYA BURADAN SEÇ</span><p>İç yapı seçimi organı aynı 3B sahnede açar. Seçtiğin parçayı döndürerek inceleyebilirsin.</p></div>${structureButtons()}</section>`+
      `<div class="atlas-connection"><span class="atlas-kicker">BAĞLANTIYI KUR</span><p>${esc(organGuide(organId)!.connection)}</p></div><p class="atlas-model-note">Kaynak organın dış kabuğu korunur; açıldığında iki yana ayrılıp küçültülür. Ortadaki renkli iç parçalar ayrıca oluşturulmuş, ölçekli olmayan öğretici 3B modellerdir; kaynak GLB'den çıkarılmış tıbbi anatomi değildir. “İç yapı / büyütme” işaretleri dışarıda yaklaşık konumu gösterir. WebGL yoksa “Şema yedeği · 2B” kullanılabilir. İlk açılış yaklaşık ${organ.megabytes} MB.</p>`;
    void startModel();
  }
  function organHeader() {
    const organ=getAtlasOrgan(organId)!,guide=organGuide(organId)!;
    return `<header class="atlas-lesson-head"><div><span class="atlas-kicker">TEK SAHNE · DIŞTAN İÇE 3B ÖĞRENME</span><h3>${esc(organ.name)}</h3><p>${esc(guide.overview)}</p></div><button type="button" data-atlas-action="topic" data-id="${organ.topic}">Konu anlatımına git ↗</button></header>`+
      `<div class="atlas-organ-tabs" role="group" aria-label="Organ görünümü"><button type="button" data-atlas-action="organ-view" data-id="model" aria-pressed="${organView==="model"}">Etiketli 3B model</button><button type="button" id="atlasModelOpen" class="atlas-cutaway-button" data-atlas-action="cutaway" aria-pressed="${organView==="model"&&organOpen}">${organView==="model"&&organOpen?"3B iç yapıyı kapat":"3B içini aç · Daha detay"}</button><button type="button" class="atlas-fallback-tab" data-atlas-action="organ-view" data-id="anatomy" aria-pressed="${organView==="anatomy"}">Şema yedeği · 2B</button></div>`;
  }
  function structureInfo() {
    const guide=organGuide(organId)!,part=guide.structures.find(item=>item.id===structureId);
    return part?`<span class="atlas-kicker">${guide.structures.indexOf(part)+1} / ${guide.structures.length} · SEÇİLEN 3B YAPI</span><h4>${esc(part.label)}</h4><p class="atlas-structure-summary">${esc(part.summary)}</p><p>${esc(part.detail)}</p><div class="atlas-trap"><b>AYT'de karıştırma</b><p>${esc(part.exam)}</p></div>`:`<span class="atlas-kicker">ORGANIN ÜZERİNDE KEŞFET</span><h4>3B noktaya dokun</h4><p>Etiketler döndürdüğün organa bağlıdır. Bir yapıyı seçince bilgisi burada açılır.</p><p>“3B içini aç” dış kabuğu ayırır ve içteki öğretici parçaları aynı sahnede gösterir.</p><div class="atlas-trap"><b>İpucu</b><p>Açılan renkli 3B parçanın kendisine de dokunabilirsin. Büyük görselde ayrıntıları daha rahat incele.</p></div>`;
  }
  function syncModelSelection() {
    model?.open?.(organOpen);model?.select?.(structureId);model?.labels?.(organLabels);autoRotate=false;
    const open=find("atlasModelOpen");if(open){open.textContent=organOpen?"3B iç yapıyı kapat":"3B içini aç · Daha detay";open.setAttribute("aria-pressed",String(organOpen));}
    const badge=find("atlas3DViewLabel");if(badge)badge.textContent=organOpen?"3B İÇ YAPI · DÖNDÜREREK İNCELE":organId==="ear"?"3B ANATOMİK KESİT · YKS ETİKETLERİ":"3B DIŞ YÜZEY · YKS ETİKETLERİ";
    const info=find("atlasStructureInfo");if(info)info.innerHTML=structureInfo();
    for(const button of panel?.querySelectorAll<HTMLElement>(".atlas-structure-list [data-atlas-structure]")||[])button.setAttribute("aria-pressed",String(button.dataset.atlasStructure===structureId));
    panel?.querySelector('[data-atlas-action="rotate"]')?.setAttribute("aria-pressed","false");
  }
  function structureButtons() {
    return `<div class="atlas-structure-list" role="group" aria-label="Organ yapıları">${organGuide(organId)!.structures.map((part,i)=>`<button type="button" data-atlas-structure="${part.id}" aria-pressed="${structureId===part.id&&organView==="anatomy"}"><span>${i+1}</span>${esc(part.label)}</button>`).join("")}</div>`;
  }
  function renderAnatomy(focus?:string,animate=false) {
    stopModel();const organ=getAtlasOrgan(organId)!,guide=organGuide(organId)!,main=find("atlasContent");if(!main)return;
    if(panel)panel.dataset.atlasWide=String(wide);
    const part=guide.structures.find(item=>item.id===structureId);
    main.innerHTML=organHeader()+`<div class="atlas-organ-workbench ${wide?"atlas-wide":""}"><figure class="atlas-figure atlas-organ-figure"><div class="atlas-figure-tools"><button type="button" data-atlas-action="organ-labels" aria-pressed="${organLabels}">${organLabels?"Etiketleri gizle":"Etiketleri göster"}</button><button type="button" data-atlas-action="wide" aria-pressed="${wide}">${wide?"Normal görünüm":"Görseli büyüt"}</button></div>${organDiagram(organ.id,structureId,organOpen,organLabels,animate)}<figcaption>${esc(guide.orientation)}</figcaption></figure>`+
      `<aside class="atlas-organ-explanation" aria-live="polite">${part?`<span class="atlas-kicker">${guide.structures.indexOf(part)+1} / ${guide.structures.length} · SEÇİLEN YAPI</span><h4>${esc(part.label)}</h4><p class="atlas-structure-summary">${esc(part.summary)}</p><p>${esc(part.detail)}</p><div class="atlas-trap"><b>AYT'de karıştırma</b><p>${esc(part.exam)}</p></div>`:`<span class="atlas-kicker">GÖRSEL ÜZERİNDE KEŞFET</span><h4>Bir yapıya dokun</h4><p>Organın üzerindeki etiketler veya alttaki numaralı düğmeler, yapının görevini ve önemli ayrımını burada açar.</p><p>İçteki bir yapıyı seçersen kesit kendiliğinden açılır.</p>`}</aside></div>`+
      structureButtons()+`<div class="atlas-connection"><span class="atlas-kicker">BAĞLANTIYI KUR</span><p>${esc(guide.connection)}</p></div><p class="atlas-model-note">Özgün, şematik öğrenme çizimi; ölçekli anatomik model veya kaynak 3B modelin gerçek kesiti değildir. Etiketler YKS/AYT konu odağıdır; çıkmış soru iddiası içermez.</p>`;
    if(focus)main.querySelector<HTMLElement>(focus)?.focus({preventScroll:true});
  }
  function chooseStructure(id:string) {
    const part=organGuide(organId)?.structures.find(item=>item.id===id);if(!part||mode!=="model")return;
    const animate=!organOpen&&part.internal;structureId=id;
    if(organView==="anatomy"){if(part.internal)organOpen=true;renderAnatomy(`.atlas-structure-list [data-atlas-structure="${id}"]`,animate);return;}
    if(part.internal||ORGAN_LANDMARKS[getAtlasOrgan(organId)!.id][id]!.kind!=="surface")organOpen=true;
    syncModelSelection();
  }
  function clearFilters() {
    query="";group="all";const search=find<HTMLInputElement>("atlasSearch"),select=find<HTMLSelectElement>("atlasGroup");if(search)search.value="";if(select)select.value="all";
  }
  function focusContent() {find("atlasContent")?.focus({preventScroll:true});}
  function chooseTopic(id:string) {
    const next=getAtlasTopic(id);if(!next)return;clearFilters();mode="topic";topicId=id;step=0;view="steps";picked=null;overview=false;wide=false;
    group=next.group;const select=find<HTMLSelectElement>("atlasGroup");if(select)select.value=group;
    renderList();renderLesson();focusContent();
  }
  function chooseOrgan(id:string,detail=false) {
    if(!getAtlasOrgan(id))return;if(mode!=="model")clearFilters();mode="model";organId=id;organView="model";organOpen=detail;structureId="";wide=false;
    renderList();renderModel();focusContent();
  }
  function chooseGroup(id:string) {
    clearFilters();group=ATLAS_GROUPS.includes(id as AtlasGroup)?id as AtlasGroup:"all";mode="topic";overview=true;
    const select=find<HTMLSelectElement>("atlasGroup");if(select)select.value=group;
    renderList();renderLesson();focusContent();
  }
  function chooseStep(value:number) {
    const t=topic();if(!Number.isInteger(value)||value<0||value>=t.steps.length)return;
    if(view==="quiz"){if(picked!==null)return;picked=value;}else step=atlasStep(t,value);
    renderLesson(`${view==="steps"?".atlas-stage-roadmap":".atlas-step-list"} [data-atlas-step="${value}"]`);
  }
  function onClick(event:Event) {
    const element=event.target instanceof Element?event.target.closest<HTMLElement>("[data-atlas-action],[data-atlas-step],[data-atlas-structure]"):null;
    if(!element||!panel?.contains(element))return;
    if(element.dataset.atlasStep!==undefined){chooseStep(Number(element.dataset.atlasStep));return;}
    if(element.dataset.atlasStructure!==undefined){chooseStructure(element.dataset.atlasStructure);return;}
    const action=element.dataset.atlasAction,id=element.dataset.id||"";
    if(action==="topic"){chooseTopic(id);return;}
    if(action==="organ"){chooseOrgan(id);return;}
    if(action==="organ-detail"){chooseOrgan(id,true);return;}
    if(action==="group"||action==="overview"){chooseGroup(action==="overview"?"all":id);return;}
    if(action==="mode") {
      clearFilters();
      if(id==="model")chooseOrgan(organId);else chooseGroup("all");return;
    }
    if(action==="lesson-view"&&(id==="steps"||id==="details")){view=id;picked=null;renderLesson(`[data-atlas-action="lesson-view"][data-id="${id}"]`);return;}
    if(action==="practice"){view=view==="quiz"?"steps":"quiz";picked=null;renderLesson('[data-atlas-action="practice"]');return;}
    if(action==="retry-quiz"){picked=null;renderLesson('.atlas-step-list [data-atlas-step="0"]');return;}
    if(action==="next"||action==="previous"){step=Math.max(0,Math.min(topic().steps.length-1,step+(action==="next"?1:-1)));const boundary=action==="next"?step===topic().steps.length-1:step===0;renderLesson(boundary?`[data-atlas-step="${step}"]`:`[data-atlas-action="${action}"]`);return;}
    if(action==="topic-labels"){labels=!labels;renderLesson('[data-atlas-action="topic-labels"]');return;}
    if(action==="wide"){wide=!wide;if(mode==="model"&&organView==="model"){if(panel)panel.dataset.atlasWide=String(wide);element.textContent=wide?"Normal görünüm":"Görseli büyüt";element.setAttribute("aria-pressed",String(wide));}else if(mode==="model")renderAnatomy('[data-atlas-action="wide"]');else renderLesson('[data-atlas-action="wide"]');return;}
    if(action==="organ-view"&&(id==="model"||id==="anatomy")){if(organView===id)return;organView=id;if(id==="model")renderModel();else renderAnatomy();focusContent();return;}
    if(action==="cutaway"){
      if(organView!=="model"){organView="model";organOpen=true;renderModel();}else{organOpen=!organOpen;syncModelSelection();}return;
    }
    if(action==="organ-labels"){organLabels=!organLabels;if(organView==="model"){model?.labels?.(organLabels);element.textContent=organLabels?"Etiketleri gizle":"Etiketleri göster";element.setAttribute("aria-pressed",String(organLabels));}else renderAnatomy('[data-atlas-action="organ-labels"]');return;}
    if(action==="load-model"){void startModel();return;}
    if(action==="zoom-in")model?.zoom(-1);
    if(action==="zoom-out")model?.zoom(1);
    if(action==="model-reset")model?.reset();
    if(action==="rotate"&&model){autoRotate=!autoRotate;model.rotate(autoRotate);element.setAttribute("aria-pressed",String(autoRotate));}
    if(action==="wire"&&model){wireframe=!wireframe;model.wireframe(wireframe);element.setAttribute("aria-pressed",String(wireframe));}
  }
  function mount(target:HTMLElement|null) {
    if(!target)return false;
    if(panel===target&&target.dataset.atlasVersion==="3")return true;
    stopModel();panel=target;target.dataset.atlasVersion="3";
    target.innerHTML=`<header class="atlas-header"><div><span class="atlas-kicker">GÖREREK ÖĞREN · BAĞLANTI KUR</span><h2>Biyoloji Atlası</h2><p>${ATLAS_TOPICS.length} ayrıntılı konu · ${ATLAS_ORGANS.length} organ · ${ATLAS_ORGANS.reduce((n,o)=>n+organGuide(o.id)!.structures.length,0)} etiketli yapı</p></div><div class="atlas-mode-switch" role="group" aria-label="Atlas görünümü"><button type="button" id="atlasMode-topic" data-atlas-action="mode" data-id="topic">Konu atlası</button><button type="button" id="atlasMode-model" data-atlas-action="mode" data-id="model">3B organlar</button></div></header>`+
      `<div class="atlas-layout"><aside class="atlas-sidebar"><label>Atlas içinde ara<input id="atlasSearch" type="search" placeholder="Nefron, DNA, fotosentez…" maxlength="160" autocomplete="off"></label><label id="atlasGroupLabel">Konu grubu<select id="atlasGroup"><option value="all">Bütün konular</option>${ATLAS_GROUPS.map(name=>`<option>${esc(name)}</option>`).join("")}</select></label><p id="atlasCount" role="status"></p><nav id="atlasIndex" aria-label="Biyoloji atlası konuları"></nav></aside><section id="atlasContent" class="atlas-content" aria-label="Seçilen biyoloji konusu" tabindex="-1"></section></div>`+
      `<footer class="atlas-footer"><p>Özet görsel öğrenme atlası; tam konu anlatımının veya güncel sınav kapsamının yerine geçmez. Buradaki sorular deneme, konu tamamlama ve bilim kartı kayıtlarını değiştirmez.</p><a href="${ATLAS_SOURCE}" target="_blank" rel="noopener noreferrer">MEB / OGM AYT konu başlıkları ↗</a><a href="./anatomy/ATTRIBUTION.md" target="_blank" rel="noopener noreferrer">3B modellerin kaynağı ve kullanım notu ↗</a></footer>`;
    if(!bound.has(target)) {
      bound.add(target);target.addEventListener("click",onClick);
      target.addEventListener("keydown",event=>{if((event.key==="Enter"||event.key===" ")&&event.target instanceof SVGElement){const target=event.target.closest("[data-atlas-step],[data-atlas-structure]");if(target){event.preventDefault();if(target.hasAttribute("data-atlas-structure"))chooseStructure(target.getAttribute("data-atlas-structure")!);else chooseStep(Number(target.getAttribute("data-atlas-step")));}}});
      target.addEventListener("input",event=>{if(event.target instanceof HTMLInputElement&&event.target.id==="atlasSearch"){query=event.target.value.slice(0,160);renderList();if(mode==="topic"&&overview)renderLesson();}});
      target.addEventListener("change",event=>{if(event.target instanceof HTMLSelectElement&&event.target.id==="atlasGroup")chooseGroup(event.target.value);});
      target.addEventListener("atlas:model-error",event=>{stopModel();modelMessage(String((event as CustomEvent).detail),"error");});
    }
    renderList();if(mode==="topic")renderLesson();else if(organView==="anatomy")renderAnatomy();else renderModel();return true;
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
