import "./recovery-center.css";
import type {BackupBridgeApi} from "../data/legacy-backup-bridge.ts";
import type {BackupPreviewResult} from "../data/backup-service.ts";
import type {LegacyDataBridgeApi} from "../data/legacy-data-bridge.ts";
import type {PrimaryInitResult} from "../data/primary-store.ts";

type LegacyRuntimeWindow=Window&{
  importData?:(input:HTMLInputElement)=>unknown;
  autoBackupRun?:(force?:boolean)=>unknown;
  applyTheme?:()=>unknown;
  renderAll?:()=>unknown;
  go?:(screen:string)=>unknown;
  toast?:(message:string)=>unknown;
  infraError?:(scope:string,error:unknown)=>unknown;
};

export interface RecoveryCenterApi{
  readonly version:"2.0.0";
  refresh():void;
  validate():string[];
}

function formatBytes(bytes:number):string{
  const safe=Math.max(0,Number(bytes)||0);
  if(safe<1024)return `${safe} B`;
  if(safe<1024*1024)return `${Math.round(safe/1024)} KB`;
  return `${(safe/(1024*1024)).toFixed(safe>=10*1024*1024?0:1)} MB`;
}

function formatDelta(value:number):string{
  const n=Number(value)||0;
  return n===0?"aynı":`${n>0?"+":""}${n}`;
}

function statusText(state:string):{label:string;level:"ok"|"warn"|"bad"}{
  if(["ready","synced","success","signedout"].includes(state))return {label:state==="signedout"?"Bulut kapalı · yerel kayıt güvende":"Hazır",level:"ok"};
  if(["syncing","initializing","pending","offline"].includes(state))return {label:state==="offline"?"Çevrimdışı · değişiklikler cihazda korunuyor":"İşlem sürüyor",level:"warn"};
  if(["error","failed","warning"].includes(state))return {label:"Kurtarma gerekebilir",level:"bad"};
  return {label:state||"Durum bekleniyor",level:"warn"};
}

function createElement<K extends keyof HTMLElementTagNameMap>(tag:K,className?:string,text?:string):HTMLElementTagNameMap[K]{
  const element=document.createElement(tag);
  if(className)element.className=className;
  if(text!==undefined)element.textContent=text;
  return element;
}

function addRow(parent:HTMLElement,label:string,value:string,level?:"ok"|"warn"|"bad"):void{
  const row=createElement("div","v42-recovery-row");
  const key=createElement("span","v42-recovery-key",label),val=createElement("span","v42-recovery-value",value);
  if(level)val.dataset.level=level;
  row.append(key,val);parent.append(row);
}

function previewDialog(preview:Extract<BackupPreviewResult,{ok:true}>):Promise<boolean>{
  return new Promise(resolve=>{
    const backdrop=createElement("div","v42-recovery-backdrop");
    const dialog=createElement("div","v42-recovery-dialog");dialog.setAttribute("role","dialog");dialog.setAttribute("aria-modal","true");dialog.setAttribute("aria-labelledby","v42RecoveryDialogTitle");
    dialog.append(createElement("div","v42-dialog-kicker","GÜVENLİ GERİ YÜKLEME"));
    const title=createElement("h2","","Yedek önizlemesi");title.id="v42RecoveryDialogTitle";dialog.append(title);
    dialog.append(createElement("p","v42-dialog-lead","Dosya uygulanmadan önce bütünlük, şema ve mevcut kayıtla farklar kontrol edildi."));

    const info=createElement("section","v42-preview-box");info.append(createElement("h3","","Yedek bilgisi"));
    const date=preview.summary.exportedAt?new Date(preview.summary.exportedAt).toLocaleString("tr-TR"):"Eski biçim";
    const infoRows:[string,string][]=[
      ["Kayıt tarihi",date],
      ["Uygulama / şema",`${preview.summary.appVersion} · şema ${preview.summary.schema}`],
      ["Dosya boyutu",formatBytes(preview.summary.bytes)],
      ["Bütünlük",preview.summary.integrity==="verified"?"Doğrulandı ✓":"Eski biçim · temel kontrol"]
    ];
    for(const [label,value] of infoRows){const row=createElement("div","v42-preview-row");row.append(createElement("span","",label),createElement("b","",value));info.append(row);}dialog.append(info);

    const content=createElement("section","v42-preview-box");content.append(createElement("h3","","Yedekteki içerik"));
    const row=createElement("div","v42-preview-row");row.append(createElement("span","","Özet"),createElement("b","",`${preview.summary.days} çalışma günü · ${preview.summary.exams} deneme · ${preview.summary.topics} konu · ${preview.summary.cards} kart`));content.append(row);dialog.append(content);

    const comparison=createElement("section","v42-preview-box");comparison.append(createElement("h3","","Mevcut kayıtla fark"));
    if(preview.comparison.status==="unavailable"){
      comparison.append(createElement("p","v42-dialog-lead","Mevcut kayıt özeti okunamadı. Yedek doğrulandı; geri yükleme öncesi mevcut durum yine güvenlik kopyasına alınacak."));
    }else if(preview.comparison.sameState){
      comparison.append(createElement("p","v42-dialog-lead","Bu yedek mevcut ana kayıtla aynı görünüyor. Veri sayılarında değişiklik yok."));
    }else{
      const deltas=createElement("div","v42-preview-deltas");
      const metrics:[string,number][]=[["Çalışma günü",preview.comparison.delta.days],["Deneme",preview.comparison.delta.exams],["Konu",preview.comparison.delta.topics],["Kart",preview.comparison.delta.cards]];
      for(const [label,value] of metrics){const cell=createElement("div","v42-preview-delta");cell.append(createElement("span","",label),createElement("b","",formatDelta(value)));deltas.append(cell);}comparison.append(deltas);
    }
    dialog.append(comparison);
    dialog.append(createElement("p","v42-rollback-note","Geri yüklemeden hemen önce mevcut ana kayıt yakalanır. İşlem yarıda kalırsa veri katmanı önceki kaydı otomatik geri almaya çalışır."));

    const actions=createElement("div","v42-dialog-actions"),cancel=createElement("button","v42-cancel","İptal"),confirm=createElement("button","v42-confirm","Doğrulandı, geri yükle");
    cancel.type="button";confirm.type="button";actions.append(cancel,confirm);dialog.append(actions);backdrop.append(dialog);document.body.append(backdrop);
    const close=(value:boolean)=>{document.removeEventListener("keydown",onKey);backdrop.remove();resolve(value);};
    const onKey=(event:KeyboardEvent)=>{if(event.key==="Escape"){event.preventDefault();close(false);}};
    cancel.addEventListener("click",()=>close(false));confirm.addEventListener("click",()=>close(true));backdrop.addEventListener("click",event=>{if(event.target===backdrop)close(false);});document.addEventListener("keydown",onKey);cancel.focus();
  });
}

export function installRecoveryCenter(data:LegacyDataBridgeApi,backup:BackupBridgeApi):RecoveryCenterApi{
  const runtime=window as LegacyRuntimeWindow,legacyImport=runtime.importData?.bind(runtime);
  let latestPrimary:PrimaryInitResult|null=null;

  function ensureCenter():HTMLElement|null{
    const parent=document.getElementById("mrp_veri"),anchor=document.getElementById("v30DataTop");if(!parent||!anchor)return null;
    let center=document.getElementById("v42RecoveryCenter");if(center)return center;
    center=createElement("section");center.id="v42RecoveryCenter";center.setAttribute("aria-label","Veri kurtarma merkezi");
    anchor.insertAdjacentElement("afterend",center);return center;
  }

  function refresh():void{
    const center=ensureCenter();if(!center)return;
    const htmlState=document.documentElement.dataset.v4Data||"initializing",primary=document.documentElement.dataset.v4Primary||latestPrimary?.primary||"none",reconcile=document.documentElement.dataset.v4Reconcile||latestPrimary?.status||"initializing";
    const dataStatus=statusText(htmlState);
    center.replaceChildren();
    const head=createElement("div","v42-recovery-head"),titleWrap=createElement("div");titleWrap.append(createElement("span","","KURTARMA MERKEZİ"),createElement("b","","Verinin güvenli dönüş noktaları"));
    head.append(titleWrap,createElement("small","","Dexie ana kayıt, güvenli yerel ayna ve kullanıcı denetimindeki JSON yedeği birlikte korunur."));center.append(head);
    const grid=createElement("div","v42-recovery-grid");
    addRow(grid,"Ana kayıt",primary==="dexie"?"Dexie + yerel ayna":primary==="localStorage"?"Yerel ayna ile devam":"Kayıt bekleniyor",dataStatus.level);
    addRow(grid,"Uzlaştırma",reconcile.replaceAll("-"," "),dataStatus.level);
    addRow(grid,"Hesap / bulut","Kullanılmıyor","ok");
    center.append(grid);
    const note=latestPrimary?.message||(htmlState==="warning"?"Veri katmanı uyarı verdi. Yerel kayıt silinmeden önce JSON yedeği almak en güvenli adımdır.":"Ana kayıt doğrulanıyor; geri yükleme işlemleri önce mevcut durumu korur.");
    center.append(createElement("p","v42-recovery-note",note));
  }

  async function handleImport(input:HTMLInputElement):Promise<void>{
    const file=input.files?.[0];if(!file)return;
    try{
      if(file.size>25*1024*1024)throw new Error("Yedek dosyası çok büyük (en fazla 25 MB)");
      const text=typeof file.text==="function"?await file.text():await new Promise<string>((resolve,reject)=>{const reader=new FileReader();reader.onerror=()=>reject(reader.error||new Error("Dosya okunamadı"));reader.onload=()=>resolve(String(reader.result||""));reader.readAsText(file);});
      const preview=backup.preview(text);
      if(!preview.ok)throw new Error(preview.message);
      const approved=await previewDialog(preview);if(!approved)return;
      try{runtime.autoBackupRun?.(true);}catch(error){runtime.infraError?.("backup-auto-safety",error);}
      const restored=await backup.restore(text);
      if(!restored.ok)throw new Error(restored.message);
      try{runtime.applyTheme?.();runtime.renderAll?.();runtime.go?.("home");}catch(error){runtime.infraError?.("backup-post-restore",error);}
      runtime.toast?.("Yedek güvenle geri yüklendi ✓");
      window.dispatchEvent(new CustomEvent("yks:backup-restored",{detail:{summary:restored.summary}}));refresh();
    }catch(error){
      runtime.infraError?.("backup-import-v42",error);
      runtime.toast?.(error instanceof Error?error.message:"Yedek geri yüklenemedi");
    }finally{input.value="";}
  }

  function bind():void{
    refresh();
    runtime.importData=input=>{void handleImport(input);};
    void data.ready.then(result=>{latestPrimary=result;refresh();}).catch(error=>{runtime.infraError?.("recovery-center-data-ready",error);refresh();});
    window.addEventListener("yks:data-primary-ready",event=>{latestPrimary=(event as CustomEvent<PrimaryInitResult>).detail;refresh();});
    window.addEventListener("online",refresh);window.addEventListener("offline",refresh);window.addEventListener("storage",refresh);
  }

  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",bind,{once:true});else bind();
  const api:RecoveryCenterApi={version:"2.0.0",refresh,validate:()=>{
    const errors:string[]=[];
    if(typeof backup.preview!=="function")errors.push("Yedek fark önizlemesi bağlı değil");
    if(typeof backup.restore!=="function")errors.push("Geri yükleme köprüsü bağlı değil");
    if(typeof data.primaryJSON!=="function")errors.push("Ana kayıt okuyucusu bağlı değil");
    if(!legacyImport&&typeof runtime.importData!=="function")errors.push("Dosya içe aktarma akışı bağlı değil");
    return errors;
  }};
  document.documentElement.dataset.v4Recovery="ready";document.documentElement.dataset.v4RecoveryVersion=api.version;
  return api;
}
