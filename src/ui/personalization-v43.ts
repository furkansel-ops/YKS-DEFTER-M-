import "./personalization-v43.css";

export const V43_EXAM_TYPES=["TYT","AYT","YDT"] as const;
export type V43ExamType=typeof V43_EXAM_TYPES[number];
export const V43_HOME_CARDS=["quote","actions","todayHub","todayPlan","alerts"] as const;
export type V43HomeCard=typeof V43_HOME_CARDS[number];

export interface PersonalizationV43State{
  examScope:Record<V43ExamType,boolean>;
  homeCards:Record<V43HomeCard,boolean>;
  updatedAt:number;
}

export interface PersonalizationV43Api{
  examTypes():V43ExamType[];
  prefs():PersonalizationV43State;
  apply():void;
}

declare global{
  interface Window{
    __YKS_PERSONALIZATION_V43__?:PersonalizationV43Api;
    setExamTab?:(type:V43ExamType)=>unknown;
    setV315DashType?:(type:V43ExamType|"BRANS")=>unknown;
    setDenemeType?:(type:V43ExamType|"BRANS")=>unknown;
    v320SetExam?:(type:V43ExamType)=>unknown;
  }
}

const DEFAULT_STATE:PersonalizationV43State={
  examScope:{TYT:true,AYT:true,YDT:true},
  homeCards:{quote:true,actions:true,todayHub:true,todayPlan:true,alerts:true},
  updatedAt:0
};

const HOME_TARGETS:Record<V43HomeCard,string[]>={
  quote:["#sozBox"],
  actions:["#home .home-actions"],
  todayHub:["#todayHub"],
  todayPlan:["#todayPlanTitle","#todayPlan"],
  alerts:["#morningBox","#dgBanner","#restBanner","#backupBanner"]
};

const EXAM_TARGETS:Record<V43ExamType,string[]>={
  TYT:["#segTYT","#v315tTYT","#dSegTYT","#v320ExamTYT",'button[onclick="startSim(165)"]'],
  AYT:["#segAYT","#v315tAYT","#dSegAYT","#v320ExamAYT",'button[onclick="startSim(180)"]'],
  YDT:["#segYDT","#v315tYDT","#dSegYDT","#v320ExamYDT",'button[onclick="startSim(80)"]']
};

const EXAM_GROUPS:Array<{ids:Record<V43ExamType,string>;activate:(type:V43ExamType)=>void}>=[
  {ids:{TYT:"segTYT",AYT:"segAYT",YDT:"segYDT"},activate:type=>{window.setExamTab?.(type);}},
  {ids:{TYT:"v315tTYT",AYT:"v315tAYT",YDT:"v315tYDT"},activate:type=>{window.setV315DashType?.(type);}},
  {ids:{TYT:"dSegTYT",AYT:"dSegAYT",YDT:"dSegYDT"},activate:type=>{window.setDenemeType?.(type);}},
  {ids:{TYT:"v320ExamTYT",AYT:"v320ExamAYT",YDT:"v320ExamYDT"},activate:type=>{window.v320SetExam?.(type);}}
];

function isRecord(value:unknown):value is Record<string,unknown>{
  return Boolean(value)&&typeof value==="object"&&!Array.isArray(value);
}

function cloneState(state:PersonalizationV43State):PersonalizationV43State{
  return {
    examScope:{...state.examScope},
    homeCards:{...state.homeCards},
    updatedAt:state.updatedAt
  };
}

export function normalizePersonalizationV43(value:unknown):PersonalizationV43State{
  const next=cloneState(DEFAULT_STATE);
  if(!isRecord(value))return next;
  const examScope=isRecord(value.examScope)?value.examScope:null;
  if(examScope)V43_EXAM_TYPES.forEach(type=>{
    if(typeof examScope[type]==="boolean")next.examScope[type]=Boolean(examScope[type]);
  });
  if(!V43_EXAM_TYPES.some(type=>next.examScope[type]))next.examScope.TYT=true;
  const homeCards=isRecord(value.homeCards)?value.homeCards:null;
  if(homeCards)V43_HOME_CARDS.forEach(key=>{
    if(typeof homeCards[key]==="boolean")next.homeCards[key]=Boolean(homeCards[key]);
  });
  const updatedAt=Number(value.updatedAt??0);
  next.updatedAt=Number.isFinite(updatedAt)&&updatedAt>0?Math.floor(updatedAt):0;
  return next;
}

function readStoredState():PersonalizationV43State{
  try{
    const state=window.YKSLegacyState?.readState?.();
    if(!state||!isRecord(state.studyPrefs))return cloneState(DEFAULT_STATE);
    return normalizePersonalizationV43(state.studyPrefs.personalizationV43);
  }catch{return cloneState(DEFAULT_STATE);}
}

function persistState(next:PersonalizationV43State):boolean{
  try{
    const state=window.YKSLegacyState?.readState?.();
    if(!state)return false;
    if(!isRecord(state.studyPrefs))state.studyPrefs={autoPlan:false};
    state.studyPrefs.personalizationV43=cloneState(next);
    window.YKSLegacyState?.save?.();
    return true;
  }catch{return false;}
}

function setHidden(selector:string,hidden:boolean,attribute:string):void{
  document.querySelectorAll<HTMLElement>(selector).forEach(node=>{
    node.toggleAttribute(attribute,hidden);
    if(hidden)node.setAttribute("aria-hidden","true");
    else node.removeAttribute("aria-hidden");
  });
}

function applyHomeCards(prefs:PersonalizationV43State):void{
  V43_HOME_CARDS.forEach(key=>HOME_TARGETS[key].forEach(selector=>setHidden(selector,!prefs.homeCards[key],"data-v43-personal-hidden")));
}

function firstActiveExam(prefs:PersonalizationV43State):V43ExamType{
  return V43_EXAM_TYPES.find(type=>prefs.examScope[type])??"TYT";
}

function ensureVisibleExamSelections(prefs:PersonalizationV43State):void{
  const fallback=firstActiveExam(prefs);
  EXAM_GROUPS.forEach(group=>{
    const hiddenActive=V43_EXAM_TYPES.find(type=>{
      if(prefs.examScope[type])return false;
      const node=document.getElementById(group.ids[type]);
      return node instanceof HTMLElement&&node.classList.contains("on");
    });
    if(hiddenActive)group.activate(fallback);
  });
}

function applyExamScope(prefs:PersonalizationV43State):void{
  V43_EXAM_TYPES.forEach(type=>EXAM_TARGETS[type].forEach(selector=>setHidden(selector,!prefs.examScope[type],"data-v43-scope-hidden")));
  ensureVisibleExamSelections(prefs);
  document.documentElement.dataset.v43ExamScope=V43_EXAM_TYPES.filter(type=>prefs.examScope[type]).join("-").toLowerCase();
}

function element<K extends keyof HTMLElementTagNameMap>(tag:K,className="",text=""):HTMLElementTagNameMap[K]{
  const node=document.createElement(tag);
  if(className)node.className=className;
  if(text)node.textContent=text;
  return node;
}

function makeChoice(labelText:string,detail:string,checked:boolean,onChange:(checked:boolean)=>void):HTMLLabelElement{
  const label=element("label","v43-personal-choice");
  const input=document.createElement("input");
  input.type="checkbox";
  input.checked=checked;
  input.addEventListener("change",()=>onChange(input.checked));
  const copy=element("span","v43-personal-choice-copy");
  copy.append(element("strong","",labelText),element("small","",detail));
  label.append(input,copy);
  return label;
}

function createSettingsPanel(getPrefs:()=>PersonalizationV43State,commit:(next:PersonalizationV43State,message:string)=>void):HTMLElement|null{
  const settings=document.getElementById("mrp_ayar");
  if(!(settings instanceof HTMLElement))return null;
  const existing=document.getElementById("v43Personalization");
  if(existing instanceof HTMLElement)return existing;

  const panel=element("section","card v43-personalization");
  panel.id="v43Personalization";
  panel.dataset.v43Personalization="ready";
  const head=element("div","v43-personal-head");
  const headCopy=element("div");
  headCopy.append(element("p","eyebrow","Kişiselleştirme"),element("h2","","Görünümü bana göre sadeleştir"),element("p","hint","Bunlar yalnız görünümü değiştirir; kayıtlı konu, deneme ve Program verileri silinmez."));
  const reset=element("button","btn ghost tiny","Varsayılana dön");
  reset.type="button";
  head.append(headCopy,reset);
  const status=element("p","v43-personal-status");
  status.setAttribute("role","status");
  status.setAttribute("aria-live","polite");
  const body=element("div","v43-personal-body");
  panel.append(head,body,status);

  const render=()=>{
    const prefs=getPrefs();
    body.replaceChildren();

    const examField=element("fieldset","v43-personal-group");
    const examLegend=element("legend","","Sınav kapsamı");
    examField.appendChild(examLegend);
    examField.appendChild(element("p","hint","Kullanmadığın sınav türlerini gizle. En az bir sınav türü açık kalır."));
    const examGrid=element("div","v43-personal-grid exam-grid");
    V43_EXAM_TYPES.forEach(type=>examGrid.appendChild(makeChoice(type,`${type} konu, deneme ve Laboratuvar kısayollarını göster`,prefs.examScope[type],checked=>{
      const next=cloneState(getPrefs());
      if(!checked&&V43_EXAM_TYPES.filter(item=>next.examScope[item]).length===1){
        status.textContent="En az bir sınav türü açık kalmalı.";
        render();
        return;
      }
      next.examScope[type]=checked;
      next.updatedAt=Date.now();
      commit(next,`${type} görünümü ${checked?"açıldı":"gizlendi"}.`);
      render();
    })));
    examField.appendChild(examGrid);

    const homeField=element("fieldset","v43-personal-group");
    homeField.appendChild(element("legend","","Bugün ekranı kartları"));
    homeField.appendChild(element("p","hint","Sayaç ve temel günlük özet her zaman görünür; aşağıdaki yardımcı alanları sen seçersin."));
    const homeGrid=element("div","v43-personal-grid");
    const labels:Record<V43HomeCard,[string,string]>={
      quote:["Günün sözü","Motivasyon kartını göster"],
      actions:["Hızlı işlemler","Günün özeti ve Gün ekranı düğmelerini göster"],
      todayHub:["Bugün kontrol merkezi","Soru, odak, Program ve tekrar özetini göster"],
      todayPlan:["Bugünün programı","Manuel günlük plan kartını ana ekranda göster"],
      alerts:["Uyarılar","Dinlenme, günlük durum ve yedek uyarılarını göster"]
    };
    V43_HOME_CARDS.forEach(key=>homeGrid.appendChild(makeChoice(labels[key][0],labels[key][1],prefs.homeCards[key],checked=>{
      const next=cloneState(getPrefs());
      next.homeCards[key]=checked;
      next.updatedAt=Date.now();
      commit(next,`${labels[key][0]} ${checked?"gösterilecek":"gizlenecek"}.`);
      render();
    })));
    homeField.appendChild(homeGrid);
    body.append(examField,homeField);
  };

  reset.addEventListener("click",()=>{
    const next=cloneState(DEFAULT_STATE);
    next.updatedAt=Date.now();
    commit(next,"Kişiselleştirme varsayılan görünüme döndü.");
    render();
  });

  const subhead=settings.querySelector(":scope > .v30-subhead");
  if(subhead)subhead.insertAdjacentElement("afterend",panel);else settings.prepend(panel);
  render();
  return panel;
}

export function installPersonalizationV43():{installed:boolean;validate:()=>string[]}{
  let current=readStoredState();
  let panel:HTMLElement|null=null;
  let applying=false;

  const apply=()=>{
    if(applying)return;
    applying=true;
    try{
      applyHomeCards(current);
      applyExamScope(current);
      window.dispatchEvent(new CustomEvent("yks:v43-personalization",{detail:cloneState(current)}));
    }finally{applying=false;}
  };

  const commit=(next:PersonalizationV43State,message:string)=>{
    current=normalizePersonalizationV43(next);
    const saved=persistState(current);
    apply();
    const status=panel?.querySelector<HTMLElement>(".v43-personal-status");
    if(status)status.textContent=saved?message:"Görünüm uygulandı ancak ayar kaydı doğrulanamadı.";
  };

  const api:PersonalizationV43Api={
    examTypes:()=>V43_EXAM_TYPES.filter(type=>current.examScope[type]),
    prefs:()=>cloneState(current),
    apply:()=>{current=readStoredState();apply();}
  };
  window.__YKS_PERSONALIZATION_V43__=api;
  panel=createSettingsPanel(()=>current,commit);
  apply();

  const refreshFromPrimary=()=>{current=readStoredState();apply();};
  window.addEventListener("yks:data-primary-ready",refreshFromPrimary);
  window.addEventListener("storage",event=>{if(event.key==="yks")refreshFromPrimary();});
  document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="visible")refreshFromPrimary();});

  return {
    installed:Boolean(panel),
    validate:()=>{
      const errors:string[]=[];
      if(!panel)errors.push("personalization settings panel missing");
      if(!window.__YKS_PERSONALIZATION_V43__)errors.push("personalization api missing");
      if(!V43_EXAM_TYPES.some(type=>current.examScope[type]))errors.push("personalization exam scope empty");
      if(document.querySelectorAll("#v43Personalization .v43-personal-choice").length!==8)errors.push("personalization choices incomplete");
      return errors;
    }
  };
}
