/* Bugün v39 / Gün sonu: lightweight editor bridge, never a second storage owner.
   Existing setTodayMood/saveTodayReflection remain the only persistence actions. */
export function installTodayReviewV39():{installed:boolean}{
  const root=document.getElementById("todayFreshReview");
  const input=document.getElementById("todayFreshReflectionInput") as HTMLTextAreaElement|null;
  const saveButton=document.getElementById("todayFreshReflectionSave") as HTMLButtonElement|null;
  const state=document.getElementById("todayFreshReviewStatus");
  const counter=document.getElementById("todayFreshReflectionCounter");
  const legacyInput=document.getElementById("todayReflectionInput") as HTMLTextAreaElement|null;
  const legacyStatus=document.getElementById("todayCloseSaved");
  const legacySave=document.querySelector<HTMLButtonElement>(
    '#todayClose .today-note-row button[onclick*="saveTodayReflection"]'
  );
  const moods=["good","mid","hard"] as const;
  const sources=moods.map(mood=>document.getElementById(
    mood==="good"?"todayMoodGood":mood==="mid"?"todayMoodMid":"todayMoodHard"
  ) as HTMLButtonElement|null);
  const buttons=moods.map(mood=>root?.querySelector<HTMLButtonElement>(
    '[data-review-mood="'+mood+'"]'
  )||null);
  if(!root||!input||!saveButton||!state||!counter||!legacyInput||!legacyStatus||
     !legacySave||sources.some(node=>!node)||buttons.some(node=>!node))return{installed:false};
  if(root.dataset.reviewReady==="true")return{installed:true};

  let noteDirty=false;
  const sync=()=>{
    // Never erase an unfinished visible draft when the legacy renderer refreshes.
    if(!noteDirty&&document.activeElement!==input&&input.value!==legacyInput.value){
      input.value=legacyInput.value;
    }
    for(let i=0;i<moods.length;i++){
      const selected=Boolean(sources[i]?.classList.contains("on"));
      buttons[i]?.classList.toggle("is-selected",selected);
      buttons[i]?.setAttribute("aria-pressed",String(selected));
    }
    const moodDirty=(legacyStatus.textContent||"").trim()==="Kaydetmeye hazır";
    const dirty=noteDirty||moodDirty;
    const statusText=dirty?"Kaydedilmemiş değişiklik":legacyStatus.dataset.saved==="true"
      ?"Kaydedildi":"Henüz kaydedilmedi";
    if(state.textContent!==statusText)state.textContent=statusText;
    counter.textContent=input.value.length+" / 3000 karakter";
  };

  buttons.forEach((button,index)=>{
    button?.addEventListener("click",()=>{
      // Legacy action only edits draft mood; it does not save or sync to coach.
      sources[index]?.click();
      sync();
    });
  });
  input.addEventListener("input",()=>{
    noteDirty=input.value!==legacyInput.value;
    sync();
  });
  saveButton.addEventListener("click",()=>{
    // Copy the visible draft only on explicit save. Legacy handles cloud sync.
    legacyInput.value=input.value.slice(0,3000);
    legacySave.click();
    noteDirty=false;
    sync();
  });

  sync();
  if(typeof MutationObserver!=="undefined"){
    const observer=new MutationObserver(sync);
    observer.observe(legacyStatus,{childList:true,characterData:true,subtree:true,
      attributes:true,attributeFilter:["data-saved"]});
    for(const source of sources)if(source)observer.observe(source,{
      attributes:true,attributeFilter:["class"]
    });
  }
  document.addEventListener("visibilitychange",()=>{
    if(document.visibilityState==="visible")sync();
  });
  document.addEventListener("yks:navigation-after",sync);
  window.addEventListener("yks:data-changed",sync);
  root.dataset.reviewReady="true";
  return{installed:true};
}
