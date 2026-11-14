/* v125 · Yazdırılabilir tekrar föyü: çözülmemiş yanlışlar, soru fotoğrafları ve çözüm alanıyla tek HTML belge. Saf. */
export type SheetRow={key:string;kind:string;id:unknown;subject:string;topic:string;n:number;date:string;exam:string;reason:string;note:string;question?:string;resolved:boolean};
export type SheetItem={title:string;meta:string;note:string;photos:string[]};
export const SHEET_LIMIT=40;

const esc=(v:unknown)=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]!));
/* Yalnız uygulamanın kendi kaydettiği görüntüler (data:image) föye girer. */
const isImage=(v:unknown):v is string=>typeof v==="string"&&/^data:image\/(png|jpe?g|webp|gif);base64,[A-Za-z0-9+/=]+$/.test(v);

/** Çözülmemiş satırlardan föy maddeleri; fotoğraflar wrongLog'dan (id ile) gelir. */
export function sheetItems(rows:SheetRow[],wrongLog:unknown,limit=SHEET_LIMIT):SheetItem[]{
  const imgs=new Map<string,string[]>();
  for(const w of Array.isArray(wrongLog)?wrongLog:[]){
    if(!w||typeof w!=="object")continue;const x=w as Record<string,unknown>;
    const list=Array.isArray(x.questionImgs)?x.questionImgs:(x.questionImg?[x.questionImg]:[]);
    imgs.set(String(x.id),list.filter(isImage));
  }
  return rows.filter(r=>!r.resolved).slice(0,limit).map(r=>({
    title:(r.subject||"Ders")+" · "+(r.topic||"Konu"),
    meta:[r.n>1?r.n+" yanlış":"",r.exam,r.question?"Soru "+r.question:"",r.reason,/^\d{4}-\d{2}-\d{2}$/.test(r.date)?r.date.split("-").reverse().join("."):""].filter(Boolean).join(" · "),
    note:r.note,
    photos:r.kind==="wrong"?imgs.get(String(r.id))??[]:[]
  }));
}

export function sheetHtml(items:SheetItem[],heading:string,dateText:string):string{
  const body=items.map((it,i)=>`<section class="q"><h2>${i+1}. ${esc(it.title)}</h2>${it.meta?`<p class="meta">${esc(it.meta)}</p>`:""}${it.note?`<p class="note">Notum: ${esc(it.note)}</p>`:""}${it.photos.map(src=>`<img src="${src}" alt="${esc(it.title)} sorusu">`).join("")}<div class="lines" aria-hidden="true"><span>Çözümüm</span></div></section>`).join("");
  return `<!doctype html><html lang="tr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(heading)}</title><style>
@page{size:A4;margin:14mm}
body{font:14px/1.45 system-ui,-apple-system,"Segoe UI",sans-serif;color:#111;background:#fff;margin:0 auto;max-width:180mm;padding:12px}
header{display:flex;justify-content:space-between;align-items:baseline;border-bottom:2px solid #111;padding-bottom:6px;margin-bottom:12px}
header h1{font-size:20px;margin:0}header span{font-size:12px;color:#555}
.q{break-inside:avoid;page-break-inside:avoid;border:1px solid #bbb;border-radius:8px;padding:10px 12px;margin:0 0 10px}
.q h2{font-size:15px;margin:0 0 2px}.meta{margin:0 0 4px;color:#555;font-size:12px}.note{margin:4px 0;font-size:13px}
.q img{display:block;max-width:100%;max-height:95mm;object-fit:contain;margin:6px 0;border:1px solid #ddd}
.lines{margin-top:6px;height:28mm;background:repeating-linear-gradient(#fff 0 6.5mm,#ccc 6.5mm calc(6.5mm + 1px));border-top:1px solid #ccc}
.lines span{font-size:11px;color:#777;background:#fff;padding-right:4px}
.empty{color:#555}
</style></head><body><header><h1>${esc(heading)}</h1><span>${esc(dateText)} · ${items.length} soru</span></header>${body||`<p class="empty">Föye girecek çözülmemiş yanlış yok.</p>`}</body></html>`;
}
