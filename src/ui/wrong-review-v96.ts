import "./books-v89.css";
import "./wrong-review-v96.css";
import {answerRep,readRep,LEARNED_AFTER} from "../domain/wrong-review.ts";
import {errorRows,toggleError} from "./exam-hub-v73";

/* v96 · Yanlış soru tekrarı: Hatalar sekmesindeki "Tekrar çöz" penceresi. Sırası gelen fotoğraflı, çözülmemiş
   yanlışlar kart kart sorulur; öğrenci yalnız "doğru"/"yanlış" der. Üst üste 3. doğruda yanlış "çözüldü" olur.
   Pencere kabuğu Kitaplarım'ın bk-* stillerini kullanır. */
type Loose=Record<string,any>;
type LegacyWindow=Window&Record<string,any>&{YKSLegacyState?:{readState?:()=>Loose;save?:()=>unknown}};
const L=window as unknown as LegacyWindow;
const PHOTO=/^data:image\//;
let installed=false,dialog:HTMLDialogElement|null=null,queue:string[]=[],pos=0,okCount=0,missCount=0,learnedCount=0;

const esc=(v:unknown)=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]!));
function state():Loose{try{return L.YKSLegacyState?.readState?.()??{};}catch{return {};}}
function save():void{try{L.YKSLegacyState?.save?.();}catch(error){console.error("v96 tekrar kaydet",error);}}
function toast(text:string):void{try{(L.toast as ((t:string)=>void)|undefined)?.(text);}catch{}}
function today():string{const d=new Date();return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");}
function wrong(id:string|undefined):Loose|undefined{const list=state().wrongLog;return id&&Array.isArray(list)?list.find((w:Loose)=>String(w?.id)===id):undefined;}

function summary():string{
  if(!queue.length)return `<p class="bk-empty">Bugün sırası gelen fotoğraflı yanlış yok.</p><button type="button" class="bk-btn is-primary bk-wide" data-act="close">Kapat</button>`;
  return `<div class="wr-done"><b>Bugünlük bitti 🎉</b><p>${okCount} doğru · ${missCount} yanlış${learnedCount?` · ${learnedCount} soru öğrenildi`:""}</p><small>Yanlış çözdüklerin yarın, doğru çözdüklerin birkaç gün sonra yine gelir.</small></div><button type="button" class="bk-btn is-primary bk-wide" data-act="close">Kapat</button>`;
}
function card(id:string,w:Loose):string{
  const row=errorRows().find(r=>r.key==="w"+id),subject=String(w.subject||""),rep=readRep(w.rep);
  const photos=(Array.isArray(w.questionImgs)?w.questionImgs:[]).filter((p:unknown)=>typeof p==="string"&&PHOTO.test(p)) as string[];
  const meta=[row?.exam,row?.question?"Soru "+row.question:"",row?.reason].filter(Boolean).join(" · ");
  return `<p class="wr-step">${pos+1} / ${queue.length}</p><div class="bk-body"><b>${esc(subject)} · ${esc(w.topic)}</b>${meta?`<small>${esc(meta)}</small>`:""}</div>`+
    `<div class="wr-photos">${photos.map((p,i)=>`<img src="${esc(p)}" alt="${esc(subject)} yanlış soru ${i+1}">`).join("")}</div>`+
    (w.note?`<details class="wr-note"><summary>Notunu göster</summary><p>${esc(w.note)}</p></details>`:"")+
    `<p class="bk-hint">Soruyu yeniden çöz, sonra cevabını kontrol et.</p>`+
    `<div class="wr-answer"><button type="button" class="bk-btn wr-ok" data-act="ok">✓ Bu sefer doğru</button><button type="button" class="bk-btn wr-miss" data-act="miss">✗ Yine yanlış</button></div>`+
    `<small>${rep?.ok?`Üst üste ${rep.ok} doğru · `:""}${LEARNED_AFTER} kez üst üste doğru çözünce öğrenildi olur.</small>`;
}
function render():void{
  const main=dialog?.querySelector<HTMLElement>(".bk-main");if(!main)return;
  while(pos<queue.length&&!wrong(queue[pos]))pos++; // başka yerde silinen kayıt atlanır
  const id=queue[pos],w=wrong(id);
  main.innerHTML=id&&w?card(id,w):summary();
  main.scrollTop=0;
}
function answer(correct:boolean):void{
  const id=queue[pos],w=wrong(id);if(!id||!w)return;
  const {rep,learned}=answerRep(w.rep,correct,today());
  w.rep=rep;save();
  if(correct)okCount++;else missCount++;
  if(learned&&errorRows().find(r=>r.key==="w"+id)?.resolved===false){learnedCount++;toggleError("w"+id);toast("Öğrenildi 🎉 Hata Defteri'nde çözüldü oldu");}
  window.dispatchEvent(new CustomEvent("yks:data-changed",{detail:{source:"wrong-review"}}));
  pos++;render();
}
function ensureDialog():HTMLDialogElement{
  if(dialog)return dialog;
  dialog=document.createElement("dialog");dialog.className="bk-dialog wr-dialog";dialog.setAttribute("aria-labelledby","wr96Title");
  dialog.innerHTML=`<div class="bk-shell"><header class="bk-head"><span class="bk-ic" aria-hidden="true">📷</span><h2 id="wr96Title">Tekrar çöz</h2><button type="button" class="bk-x" data-act="close" aria-label="Kapat">×</button></header><div class="bk-main"></div></div>`;
  dialog.addEventListener("click",event=>{
    if(event.target===dialog){dialog?.close();return;}
    const act=(event.target as HTMLElement).closest<HTMLElement>("[data-act]")?.dataset.act;
    if(act==="close")dialog?.close();else if(act==="ok")answer(true);else if(act==="miss")answer(false);
  });
  document.body.appendChild(dialog);return dialog;
}
export function openWrongReview():void{
  queue=errorRows().filter(r=>r.kind==="wrong"&&r.due&&!r.resolved).reverse().map(r=>String(r.id)); // en eski yanlış önce
  pos=okCount=missCount=learnedCount=0;
  const dlg=ensureDialog();render();
  try{if(!dlg.open)dlg.showModal();}catch{dlg.setAttribute("open","");}
}
export function installWrongReviewV96():void{
  if(installed)return;installed=true;
  (L as Loose).YKSWrongReview={open:openWrongReview};
}
