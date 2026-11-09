import "./books-v89.css";
import {searchCatalog,catalog,parseRealCatalog,isCoverUrl,createBook,advanceBook,bookStats,bookFinishDays,bookQuestions,bookTaskEnd,initials,BOOK_SUBJECTS,type BookRecord,type CatalogItem} from "../domain/book-catalog.ts";

/* v89 · Kitaplarım: Merkez'den açılan pencere. Kitap listesi, ilerleme ve "Kitap Ekle" araması.
   Veri eski S.books dizisinde kalır; "+1 test" o testin sorularını bugünün soru sayısına (S.solved) ekler. */

type Loose=Record<string,any>;
type LegacyWindow=Window&Record<string,any>&{YKSLegacyState?:{readState?:()=>Loose;save?:()=>unknown}};
const L=window as unknown as LegacyWindow;
let installed=false,view:"list"|"search"|"form"="list",query="",subject="",draft:CatalogItem|null=null,dialog:HTMLDialogElement|null=null;
/* v92: gerçek katalog Kitap Ekle ilk açılınca bir kez yüklenir; yüklenemezse yayınevi birleşimleri kullanılır. */
let real:CatalogItem[]|null=null,realState:"idle"|"loading"|"ready"|"failed"="idle";
const CATALOG_URL="./book-catalog-v92.json";
function source():readonly CatalogItem[]{return real?.length?real:catalog();}
function loadReal():void{
  if(realState!=="idle")return;realState="loading";
  fetch(CATALOG_URL,{cache:"no-cache"}).then(r=>{if(!r.ok)throw new Error("HTTP "+r.status);return r.json();})
    .then(json=>{real=parseRealCatalog(json);realState=real.length?"ready":"failed";})
    .catch(error=>{console.warn("v92 kitap kataloğu yüklenemedi",error);realState="failed";})
    .finally(()=>{if(view==="search")render();});
}
function pubLabel(pub:string):string{return !pub?"":/yay[ıi]n|akademi|kitap|yayıncılık/i.test(pub)?pub:pub+" Yayınları";}

const esc=(v:unknown)=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]!));
function state():Loose{try{return L.YKSLegacyState?.readState?.()??{};}catch{return {};}}
function save():void{try{L.YKSLegacyState?.save?.();}catch(error){console.error("v89 kitap kaydet",error);}}
function toast(text:string):void{try{(L.toast as ((t:string)=>void)|undefined)?.(text);}catch{}}
function today():string{const d=new Date();return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");}
function shift(day:string,n:number):string{const d=new Date(Number(day.slice(0,4)),Number(day.slice(5,7))-1,Number(day.slice(8)),12);d.setDate(d.getDate()+n);return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");}
function books():BookRecord[]{const s=state();if(!Array.isArray(s.books))s.books=[];return s.books as BookRecord[];}
function color(subjectName:string):string{return BOOK_SUBJECTS[subjectName]?.color??"#5a6478";}
/* Öncelik: öğrencinin çektiği kapak → katalog kapağı → kısaltmalı kapak. Katalog kapağı açılmazsa resim kaldırılır, kısaltma görünür. */
function cover(pub:string,subjectName:string,exam:string,image="",url=""):string{
  if(isCover(image))return `<span class="bk-cover has-img" aria-hidden="true"><img src="${esc(image)}" alt=""></span>`;
  const remote=isCoverUrl(url)?`<img class="bk-remote" src="${esc(url)}" alt="" loading="lazy" decoding="async" referrerpolicy="no-referrer">`:"";
  return `<span class="bk-cover${remote?" has-remote":""}" style="--bk:${esc(color(subjectName))}" aria-hidden="true"><b>${esc(initials(pub||"?"))}</b><small>${esc(exam||subjectName.slice(0,3))}</small>${remote}</span>`;
}
const COVER_PX=240,COVER_MAX=80000;
function isCover(value:unknown):value is string{return typeof value==="string"&&value.startsWith("data:image/jpeg;base64,")&&value.length<=COVER_MAX;}
/* Kapak, uygulamanın kendi fotoğraf sıkıştırmasından (HEIC dahil) geçer, sonra 240 px JPEG'e küçültülür. */
async function coverFromFile(file:File):Promise<string>{
  const big=await (L.compressImage as (f:File)=>Promise<string>)(file);
  const img=new Image();await new Promise<void>((ok,fail)=>{img.onload=()=>ok();img.onerror=()=>fail(new Error("Fotoğraf açılamadı"));img.src=big;});
  const scale=Math.min(1,COVER_PX/Math.max(img.naturalWidth,img.naturalHeight)),canvas=document.createElement("canvas");
  canvas.width=Math.max(1,Math.round(img.naturalWidth*scale));canvas.height=Math.max(1,Math.round(img.naturalHeight*scale));
  canvas.getContext("2d")?.drawImage(img,0,0,canvas.width,canvas.height);
  const out=canvas.toDataURL("image/jpeg",0.72);
  if(!isCover(out))throw new Error("Kapak fotoğrafı işlenemedi");
  return out;
}
function pickCover(id:number):void{
  if(typeof L.compressImage!=="function"){toast("Fotoğraf eklenemiyor");return;}
  const input=document.createElement("input");input.type="file";input.accept="image/*";input.setAttribute("capture","environment");
  input.onchange=async()=>{
    const file=input.files?.[0];if(!file)return;
    try{const image=await coverFromFile(file);update(id,b=>({...b,cover:image}));changed(0);render();toast("Kapak eklendi ✓");}
    catch(error){toast(error instanceof Error?error.message:"Kapak eklenemedi");}
  };
  input.click();
}
function changed(questions:number):void{
  save();
  if(questions)try{(L.renderAll as (()=>void)|undefined)?.();}catch(error){console.error("v89 renderAll",error);}
  window.dispatchEvent(new CustomEvent("yks:data-changed",{detail:{source:"books-v89"}}));
}

/* v95: paylaşılan sayılar. Seçilen katalog kitabının sayılarını daha önce bir öğrenci girdiyse forma gelir
   (öğrenci değiştirmediyse); öğrenci eklediğinde kitabın sayıları henüz yoksa paylaşılır. Oturum yoksa hiçbir şey olmaz. */
type BookCountsApi={get:(id:string)=>Promise<{tests:number;perTest:number}|null>;propose:(id:string,tests:number,perTest:number)=>Promise<boolean>};
function countsApi():BookCountsApi|null{const api=(L.YKSAccountAuth as {bookCounts?:BookCountsApi}|undefined)?.bookCounts;return api&&typeof api.get==="function"?api:null;}
async function applySharedCounts(item:CatalogItem):Promise<void>{
  const api=countsApi();if(!api||!item.key.startsWith("ks"))return;
  const shared=await api.get(item.key);if(!shared||view!=="form"||draft!==item||!dialog)return;
  const total=dialog.querySelector<HTMLInputElement>("#bk89Total"),per=dialog.querySelector<HTMLInputElement>("#bk89Per"),hint=dialog.querySelector<HTMLElement>("#bk89Shared");
  if(!total||!per)return;
  const untouched=(input:HTMLInputElement)=>input.value===input.defaultValue;
  if(untouched(total))total.value=String(shared.tests);
  if(untouched(per))per.value=String(shared.perTest);
  if(hint){hint.hidden=false;hint.textContent=`Bu kitabı ekleyen bir öğrenci ${shared.tests} test, testte ${shared.perTest} soru girmiş. Kitabındakiyle aynı mı, kontrol et.`;}
}
function listView():string{
  const list=books(),st=bookStats(list),day=today();
  const rows=list.map(b=>{
    const pct=b.total?Math.round(b.done/b.total*100):0,finish=bookFinishDays(b,day,shift);
    const note=b.done>=b.total?"Bitti 🎉":finish==null?"Son 14 günde ilerleme yok":"~"+finish+" günde biter";
    const meta=[pubLabel(b.pub||""),b.kind||""].filter(Boolean).join(" · ");
    const per=b.perTest?`${b.done} / ${b.total} test · ${bookQuestions(b).toLocaleString("tr-TR")} soru`:`${b.done} / ${b.total}`;
    return `<article class="bk-item" data-id="${b.id}"><button type="button" class="bk-cover-btn" data-act="cover" aria-label="${esc(b.name)} için ${b.cover?"kapak fotoğrafını değiştir":"kapak fotoğrafı ekle"}">${cover(b.pub||b.name,b.subject,b.exam||"",b.cover,b.coverUrl)}<span class="bk-cover-tip">${b.cover?"Değiştir":"📷 Kapak"}</span></button>
      <div class="bk-body"><div class="bk-row"><b>${esc(b.name)}</b><span class="bk-tag">${esc(b.subject)}</span></div>
      ${meta?`<small>${esc(meta)}</small>`:""}
      <span class="bk-bar" role="progressbar" aria-label="${esc(b.name)} ilerlemesi" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${pct}"><i style="width:${pct}%"></i></span>
      <div class="bk-row"><small>${esc(per)} · %${pct}</small><small>${esc(note)}</small></div>
      <div class="bk-actions">${b.done<b.total?`<button type="button" class="bk-btn is-primary" data-act="plus" data-n="1">+1 test</button><button type="button" class="bk-btn" data-act="plus" data-n="5">+5</button>`:""}
      <button type="button" class="bk-btn" data-act="plus" data-n="-1" aria-label="Bir test geri al">−1</button>
      ${b.perTest?"":`<button type="button" class="bk-btn" data-act="per">Testteki soru sayısını gir</button>`}
      <button type="button" class="bk-btn is-danger" data-act="del">Sil</button></div></div></article>`;
  }).join("");
  return `<div class="bk-stats"><div><b>${st.books}</b><small>kitap</small></div><div><b>${st.finished}</b><small>bitti</small></div><div><b>${st.questions.toLocaleString("tr-TR")}</b><small>soru</small></div></div>
    <button type="button" class="bk-btn is-primary bk-wide" data-act="open-search">+ Kitap ekle</button>
    ${rows||`<p class="bk-empty">Henüz kitap yok. Çözdüğün soru bankalarını ve denemeleri ekle; her bitirdiğin test bugünün sorularına eklenir.</p>`}`;
}
function searchView():string{
  if(realState==="idle")loadReal();
  const r=searchCatalog(query,subject,60,source()),all=Object.values(r.bySubject).reduce((a,b)=>a+b,0);
  const subjects=[...new Set([...Object.keys(r.bySubject).sort((a,b)=>(r.bySubject[b]??0)-(r.bySubject[a]??0)),...(subject?[subject]:[])])];
  const chips=["",...subjects].map(s=>`<button type="button" class="bk-chip${s===subject?" is-on":""}" data-act="subject" data-subject="${esc(s)}" aria-pressed="${s===subject}">${esc(s||"Tümü")}<small>${s?r.bySubject[s]??0:all}</small></button>`).join("");
  const items=r.items.map((it,i)=>`<div class="bk-item is-result">${cover(it.pub,it.subject,it.exam,"",it.cover)}<div class="bk-body"><b>${esc(it.name)}</b><small>${esc(pubLabel(it.pub))}</small><div class="bk-tags"><span class="bk-tag">${esc(it.subject)}</span>${it.kind?`<span class="bk-tag">${esc(it.kind)}</span>`:""}</div></div><button type="button" class="bk-btn is-primary" data-act="pick" data-i="${i}">Seç</button></div>`).join("");
  return `<button type="button" class="bk-btn bk-back" data-act="back">‹ Kitaplarım</button>
    <label class="bk-label" for="bk89Query">Kitap ara · ${realState==="loading"?"katalog yükleniyor…":realState==="ready"?source().length.toLocaleString("tr-TR")+" kitap":"yayınevi, sınav, ders"}</label>
    <div class="bk-search"><input id="bk89Query" type="search" placeholder="ör. 345 tyt matematik" autocomplete="off" value="${esc(query)}"><button type="button" class="bk-btn" data-act="manual">+ Kendim yazayım</button></div>
    <div class="bk-chips">${chips}</div>
    <p class="bk-count" aria-live="polite">${r.total} kitap${r.total>r.items.length?" · ilk "+r.items.length+" gösteriliyor":""}</p>
    <div class="bk-results">${items||`<p class="bk-empty">Bulunamadı. "Kendim yazayım" ile ekleyebilirsin.</p>`}</div>`;
}
function formView():string{
  const d=draft!,deneme=d.subject==="Deneme";
  const subjects=[...new Set([...Object.keys(BOOK_SUBJECTS),d.subject].filter(Boolean))].map(s=>`<option${s===d.subject?" selected":""}>${esc(s)}</option>`).join("");
  return `<button type="button" class="bk-btn bk-back" data-act="back-search">‹ Listeye dön</button>
    <form class="bk-form" data-form="add">
      <label class="bk-label" for="bk89Name">Kitap adı</label><input id="bk89Name" name="name" required maxlength="120" value="${esc(d.name)}">
      <div class="bk-grid"><div><label class="bk-label" for="bk89Subject">Ders</label><select id="bk89Subject" name="subject">${subjects}</select></div>
      <div><label class="bk-label" for="bk89Pub">Yayınevi</label><input id="bk89Pub" name="pub" maxlength="40" value="${esc(d.pub)}"></div></div>
      <div class="bk-grid"><div><label class="bk-label" for="bk89Total">Toplam test</label><input id="bk89Total" name="total" type="number" inputmode="numeric" min="1" max="2000" required value="${d.tests??""}"></div>
      <div><label class="bk-label" for="bk89Per">Testteki soru</label><input id="bk89Per" name="perTest" type="number" inputmode="numeric" min="1" max="400" required value="${d.perTest??(deneme?(d.exam==="AYT"?80:120):"")}"></div></div>
      <label class="bk-label" for="bk89Done">Şu ana kadar bitirdiğin test</label><input id="bk89Done" name="done" type="number" inputmode="numeric" min="0" max="2000" value="0">
      <label class="bk-label" for="bk89Cover">📷 Kapak fotoğrafı <small>isteğe bağlı</small></label><input id="bk89Cover" name="cover" type="file" accept="image/*" capture="environment">
      <p class="bk-hint bk-shared" id="bk89Shared" role="status" hidden></p>
      <p class="bk-hint">Test sayılarını kitabın içindekiler sayfasından yaz. Önceden bitirdiğin testler bugünün sorularına eklenmez.</p>
      <button type="submit" class="bk-btn is-primary bk-wide">Kitaplarıma ekle</button>
    </form>`;
}
function render():void{
  if(!dialog)return;
  const body=dialog.querySelector<HTMLElement>(".bk-main");if(!body)return;
  body.innerHTML=view==="list"?listView():view==="search"?searchView():formView();
  if(view==="search"){const input=body.querySelector<HTMLInputElement>("#bk89Query");input?.focus();input?.setSelectionRange(query.length,query.length);}
  if(view==="form")body.querySelector<HTMLInputElement>(draft?.name?"#bk89Total":"#bk89Name")?.focus();
}
function update(id:number,fn:(b:BookRecord)=>BookRecord|null):void{
  const s=state(),list=books(),i=list.findIndex(b=>Number(b.id)===id);if(i<0)return;
  const next=fn(list[i]!);s.books=next?list.map((b,j)=>j===i?next:b):list.filter((_,j)=>j!==i);
}
/* v98: koçun bu kitaptan verdiği program görevi, istenen son teste ulaşılınca kendiliğinden işaretlenir. */
function completeBookTasks(book:BookRecord):number{
  const weeks=state().weeks,setDone=L.programSetCellDone as ((wk:string,cid:string,done:boolean)=>boolean)|undefined;
  if(!weeks||typeof weeks!=="object"||typeof setDone!=="function")return 0;
  let n=0;
  for(const [wk,w] of Object.entries(weeks as Record<string,Loose>))for(const blk of ["r","s"]){
    (Array.isArray(w?.[blk])?w[blk] as unknown[][]:[]).forEach((row,i)=>(Array.isArray(row)?row:[]).forEach((txt,d)=>{
      const cid=blk+"-"+i+"-"+d,end=bookTaskEnd(String(txt??""),book.name);
      if(end!=null&&book.done>=end&&!w.dn?.[cid]&&setDone(wk,cid,true))n++;
    }));
  }
  if(n)try{(L.renderAll as (()=>void)|undefined)?.();}catch(error){console.error("v98 renderAll",error);}
  return n;
}
function onClick(event:Event):void{
  const target=event.target instanceof Element?event.target.closest<HTMLElement>("[data-act]"):null;if(!target)return;
  const act=target.dataset.act,id=Number(target.closest<HTMLElement>("[data-id]")?.dataset.id);
  if(act==="close"){dialog?.close();return;}
  if(act==="open-search"){view="search";render();return;}
  if(act==="back"){view="list";render();return;}
  if(act==="back-search"){view="search";render();return;}
  if(act==="subject"){subject=target.dataset.subject??"";render();return;}
  if(act==="pick"){draft=searchCatalog(query,subject,60,source()).items[Number(target.dataset.i)]??null;if(draft){view="form";render();void applySharedCounts(draft);}return;}
  if(act==="manual"){draft={key:"",name:query.trim(),pub:"",subject:subject||"Matematik",exam:"",kind:"",color:""};view="form";render();return;}
  if(act==="plus"){
    let questions=0,finished=false,moved:BookRecord|null=null;const day=today(),n=Number(target.dataset.n);
    update(id,b=>{const r=advanceBook(b,n,day);questions=r.questions;finished=r.book.done>=r.book.total&&b.done<b.total;if(r.book!==b)moved=r.book;return r.book;});
    if(questions){const s=state();if(!s.solved||typeof s.solved!=="object")s.solved={};s.solved[day]=Math.max(0,(Number(s.solved[day])||0)+questions);}
    changed(questions);
    const tasks=moved&&n>0?completeBookTasks(moved):0;render();
    const extra=tasks?" · koçun görevi tamamlandı ✓":"";
    if(finished)toast("🎉 Kitap bitti!"+extra);else if(questions)toast((questions>0?"+":"")+questions+" soru bugüne eklendi"+extra);else if(tasks)toast("Koçun kitap görevi tamamlandı ✓");
    return;
  }
  if(act==="per"){
    const raw=prompt("Bu kitabın bir testinde kaç soru var?");if(raw==null)return;
    const n=Math.floor(Number(raw));if(!(n>=1&&n<=400)){toast("1 ile 400 arasında bir sayı yaz");return;}
    update(id,b=>({...b,perTest:n}));changed(0);render();return;
  }
  if(act==="cover"){pickCover(id);return;}
  if(act==="del"){
    const b=books().find(x=>Number(x.id)===id);if(!b||!confirm(`"${b.name}" silinsin mi? Çözdüğün sorular günlük kayıtlarında kalır.`))return;
    update(id,()=>null);changed(0);render();toast("Kitap silindi");
  }
}
async function onSubmit(event:Event):Promise<void>{
  const form=event.target as HTMLFormElement;if(form.dataset.form!=="add")return;event.preventDefault();
  const fields=new FormData(form),file=fields.get("cover");fields.delete("cover");
  const data=Object.fromEntries(fields) as Record<string,string>,submit=form.querySelector<HTMLButtonElement>("[type=submit]");
  try{
    const picked=draft;
    const book=createBook({name:data.name??"",subject:data.subject??"",pub:data.pub,total:data.total,perTest:data.perTest,done:data.done,exam:draft?.exam,kind:draft?.kind,coverUrl:draft?.cover},Date.now());
    // v91: kapak isteğe bağlı; işlenemezse kitap yine eklenir, kapağa sonra dokunup eklenebilir.
    if(file instanceof File&&file.size>0){
      if(submit){submit.disabled=true;submit.textContent="Kapak hazırlanıyor…";}
      try{book.cover=await coverFromFile(file);}catch{toast("Kapak işlenemedi · kitap kapaksız eklendi");}
    }
    const s=state();s.books=[...books(),book];changed(0);
    if(picked?.key.startsWith("ks")&&book.perTest)void countsApi()?.propose(picked.key,book.total,book.perTest);
    view="list";query="";subject="";draft=null;render();toast("Kitap eklendi ✓");
  }catch(error){toast(error instanceof Error?error.message:"Kitap eklenemedi");}
  finally{if(submit?.isConnected){submit.disabled=false;submit.textContent="Kitaplarıma ekle";}}
}
function onInput(event:Event):void{
  const input=event.target as HTMLInputElement;if(input.id!=="bk89Query")return;
  query=input.value;render();
}
function ensureDialog():HTMLDialogElement{
  if(dialog)return dialog;
  dialog=document.createElement("dialog");dialog.className="bk-dialog";dialog.setAttribute("aria-labelledby","bk89Title");
  dialog.innerHTML=`<div class="bk-shell"><header class="bk-head"><span class="bk-ic" aria-hidden="true">📚</span><h2 id="bk89Title">Kitaplarım</h2><button type="button" class="bk-x" data-act="close" aria-label="Kapat">×</button></header><div class="bk-main"></div></div>`;
  dialog.addEventListener("click",event=>{if(event.target===dialog)dialog?.close();else onClick(event);});
  dialog.addEventListener("error",event=>{const img=event.target;if(img instanceof HTMLImageElement&&img.classList.contains("bk-remote")){img.closest(".bk-cover")?.classList.remove("has-remote");img.remove();}},true);
  dialog.addEventListener("submit",event=>{void onSubmit(event);});dialog.addEventListener("input",onInput);
  document.body.appendChild(dialog);return dialog;
}
export function openBooks():void{
  const dlg=ensureDialog();view="list";render();
  try{if(!dlg.open)dlg.showModal();}catch{dlg.setAttribute("open","");}
}
export function installBooksV89():void{
  if(installed)return;installed=true;
  (L as Loose).YKSBooks={open:openBooks};
}
