import {sheetHtml,sheetItems,type SheetRow} from "../domain/review-sheet.ts";

/* v125 · Hata Defteri › "Föy yazdır": süzülmüş çözülmemiş yanlışları yazdırılabilir föy yapar.
   Önce yeni sekmede açar (föy orada kalır); açılır pencere engelliyse (uygulama kabuğu, gömülü tarayıcı)
   görünmez bir çerçeveden doğrudan yazdırır. exam-hub-v73 düğmesi window.YKSReviewSheet.open(rows, başlık) çağırır. */
type Loose=Record<string,any>;
const L=window as unknown as Loose;

function html(rows:SheetRow[],heading="Tekrar föyü"):string{
  let wrongLog:unknown=[];try{wrongLog=L.YKSLegacyState?.readState?.()?.wrongLog??[];}catch{}
  const items=sheetItems(rows,wrongLog);
  return items.length?sheetHtml(items,heading,new Date().toLocaleDateString("tr-TR",{day:"numeric",month:"long",year:"numeric"})):"";
}
/* Fotoğraflar yüklenince yazdırma penceresi açılır. */
function whenLoaded(win:Window,doc:Document,run:()=>void):void{
  if(doc.readyState==="complete")setTimeout(run,250);else win.addEventListener("load",()=>setTimeout(run,250));
}
function printInFrame(content:string):void{
  const frame=document.createElement("iframe");
  frame.setAttribute("aria-hidden","true");frame.tabIndex=-1;
  frame.style.cssText="position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden";
  document.body.appendChild(frame);
  const win=frame.contentWindow,doc=frame.contentDocument;if(!win||!doc){frame.remove();return;}
  doc.open();doc.write(content);doc.close();
  whenLoaded(win,doc,()=>{try{win.focus();win.print();}catch{}setTimeout(()=>frame.remove(),60000);});
}

function open(rows:SheetRow[],heading="Tekrar föyü"):boolean{
  const content=html(rows,heading);
  if(!content){try{L.toast?.("Föye girecek çözülmemiş yanlış yok");}catch{}return false;}
  const win=window.open("","_blank");
  if(!win){printInFrame(content);return true;}
  win.document.open();win.document.write(content);win.document.close();
  whenLoaded(win,win.document,()=>{try{win.focus();win.print();}catch{}});
  return true;
}

export function installReviewSheetV125():void{L.YKSReviewSheet={open,html};}
