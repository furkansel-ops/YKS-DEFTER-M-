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

function installStyle():void{
  if(document.getElementById("v42RecoveryStyle"))return;
  const style=document.createElement("style");style.id="v42RecoveryStyle";
  style.textContent=`
  #v42RecoveryCenter{margin-top:16px;border:1px solid color-mix(in srgb,var(--border,#d9dee8) 82%,transparent);border-radius:22px;padding:18px;background:color-mix(in srgb,var(--card,#fff) 96%,var(--accent,#5b73e8) 4%);box-shadow:0 12px 34px rgba(31,42,68,.08)}
  #v42RecoveryCenter .v42-recovery-head{display:flex;justify-content:space-between;gap:16px;align-items:flex-start;margin-bottom:12px}
  #v42RecoveryCenter .v42-recovery-head span{display:block;font-size:11px;font-weight:800;letter-spacing:.09em;color:var(--label-3,#737b8c);margin-bottom:5px}
  #v42RecoveryCenter .v42-recovery-head b{font-size:18px;line-height:1.2}
  #v42RecoveryCenter .v42-recovery-head small{max-width:310px;text-align:right;color:var(--label-3,#737b8c);line-height:1.35}
  #v42RecoveryCenter .v42-recovery-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}
  #v42RecoveryCenter .v42-recovery-row{min-width:0;padding:12px;border-radius:16px;background:color-mix(in srgb,var(--card,#fff) 91%,var(--bg,#eef1f6) 9%);border:1px solid color-mix(in srgb,var(--border,#d9dee8) 72%,transparent)}
  #v42RecoveryCenter .v42-recovery-key{display:block;font-size:11px;color:var(--label-3,#737b8c);margin-bottom:5px}
  #v42RecoveryCenter .v42-recovery-value{display:block;font-weight:750;line-height:1.28;overflow-wrap:anywhere}
  #v42RecoveryCenter .v42-recovery-value[data-level="ok"]{color:var(--success,#23865a)}
  #v42RecoveryCenter .v42-recovery-value[data-level="warn"]{color:var(--warning,#a76b00)}
  #v42RecoveryCenter .v42-recovery-value[data-level="bad"]{color:var(--danger,#c43d4d)}
  #v42RecoveryCenter .v42-recovery-note{margin:12px 0 0;font-size:12.5px;line-height:1.45;color:var(--label-3,#737b8c)}
  .v42-recovery-backdrop{position:fixed;inset:0;z-index:99998;background:rgba(15,20,32,.56);display:grid;place-items:center;padding:18px;backdrop-filter:blur(5px)}
  .v42-recovery-dialog{width:min(620px,100%);max-height:min(86vh,760px);overflow:auto;border-radius:26px;background:var(--card,#fff);color:var(--text,#1f2735);border:1px solid color-mix(in srgb,var(--border,#d9dee8) 85%,transparent);box-shadow:0 28px 90px rgba(12,18,30,.28);padding:22px}
  .v42-recovery-dialog .v42-dialog-kicker{font-size:11px;font-weight:850;letter-spacing:.09em;color:var(--accent,#5268d8);margin-bottom:6px}
  .v42-recovery-dialog h2{font-size:23px;margin:0 0 7px}
  .v42-recovery-dialog .v42-dialog-lead{margin:0 0 16px;color:var(--label-3,#737b8c);line-height:1.45}
  .v42-recovery-dialog .v42-preview-box{border:1px solid color-mix(in srgb,var(--border,#d9dee8) 82%,transparent);border-radius:18px;padding:13px;margin-top:10px}
  .v42-recovery-dialog .v42-preview-box h3{font-size:13px;margin:0 0 9px}
  .v42-recovery-dialog .v42-preview-row{display:flex;justify-content:space-between;gap:16px;padding:7px 0;border-bottom:1px solid color-mix(in srgb,var(--border,#d9dee8) 58%,transparent)}
  .v42-recovery-dialog .v42-preview-row:last-child{border-bottom:0}
  .v42-recovery-dialog .v42-preview-row span:first-child{color:var(--label-3,#737b8c)}
  .v42-recovery-dialog .v42-preview-row b{text-align:right;overflow-wrap:anywhere}
  .v42-recovery-dialog .v42-preview-deltas{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;margin-top:10px}
  .v42-recovery-dialog .v42-preview-delta{padding:10px;border-radius:14px;background:color-mix(in srgb,var(--bg,#eef1f6) 72%,transparent);text-align:center}
  .v42-recovery-dialog .v42-preview-delta span{display:block;font-size:10px;color:var(--label-3,#737b8c);margin-bottom:3px}
  .v42-recovery-dialog .v42-preview-delta b{font-size:15px}
  .v42-recovery-dialog .v42-rollback-note{margin:12px 0 0;padding:11px 12px;border-radius:15px;background:color-mix(in srgb,var(--success,#23865a) 9%,transparent);color:color-mix(in srgb,var(--success,#23865a) 78%,var(--text,#1f2735));font-size:12.5px;line-height:1.45}
  .v42-recovery-dialog .v42-dialog-actions{display:flex;justify-content:flex-end;gap:9px;margin-top:18px}
  .v42-recovery-dialog .v42-dialog-actions button{min-height:44px;border-radius:14px;padding:0 16px;font-weight:750;cursor:pointer}
  .v42-recovery-dialog .v42-cancel{border:1px solid var(--border,#d9dee8);background:transparent;color:inherit}
  .v42-recovery-dialog .v42-confirm{border:0;background:var(--accent,#5268d8);color:white}
  .v42-recovery-dialog button:focus-visible{outline:3px solid color-mix(in srgb,var(--accent,#5268d8) 45%,transparent);outline-offset:2px}
  @media(max-width:759px){#v42RecoveryCenter .v42-recovery-head{display:block}#v42RecoveryCenter .v42-recovery-head small{display:block;text-align:left;margin-top:7px}#v42RecoveryCenter .v42-recovery-grid{grid-template-columns:1fr}.v42-recovery-dialog{padding:18px;border-radius:22px}.v42-recovery-dialog .v42-preview-deltas{grid-template-columns:repeat(2,minmax(0,1fr))}.v42-recovery-dialog .v42-dialog-actions{display:grid;grid-template-columns:1fr}.v42-recovery-dialog .v42-confirm{order:-1}}
  @media(pointer:coarse){.v42-recovery-dialog .v42-dialog-actions button{min-height:48px}}
  @media(prefers-reduced-motion:reduce){.v42-recovery-backdrop{backdrop-filter:none}}
  `;
  document.head.append(style);
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
    installStyle();refresh();
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
