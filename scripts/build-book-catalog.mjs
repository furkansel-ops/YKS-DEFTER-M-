#!/usr/bin/env node
/* v92 · Kitap kataloğu: Kitapseç'in YKS kitapları listesinden ad, yayınevi ve kapak adresi toplanır.
   robots.txt "Allow: /" (2026-11-08 kontrol edildi). Nazik: 2 sn arayla tek istek, kendini tanıtan UA, bot korumasına
   dokunulmaz; hata/engel görülürse durur. Çıktı: public/book-catalog-v92.json (uygulama Kitap Ekle açılınca yükler).
   Kullanım: node scripts/build-book-catalog.mjs [--pages N] [--out yol] */
import {readFileSync,writeFileSync} from "node:fs";
import {fileURLToPath} from "node:url";

export const SOURCE="https://www.kitapsec.com/Products/YKS-Kitaplari/";
const UA="YKS-Defterim-katalog/1.0 (+https://furkansel-ops.github.io/YKS-DEFTER-M-/)";
const COVER_RE=/^https:\/\/cdn\.kitapsec\.com\/image\/urun\/[A-Za-z0-9/_.-]+\.(?:jpe?g|png|webp|gif)$/i;
/* v94: [ders, ders adının kendisi, yalnız ders adı yoksa bakılan konu adları]. Önce ders adı aranır ("AYT Biyoloji Sistemler"
   Biyolojidir); konu adı ancak hiçbir ders adı yoksa sayılır ("AYT Limit Soru Bankası" Matematiktir). */
const SUBJECTS=[
  ["Geometri",/geometri|geometry/,/dörtgen|üçgen|çember|katı cisim|doğrunun analitiği|doğrunun analitik|analitik geometri/],
  ["Matematik",/matemati/,/problem|fonksiyon|türev|integral|logaritma|trigonometri|limit|süreklilik|diziler|polinom|denklem|eşitsizlik|parabol|karmaşık sayı|sayılar|temel kavram|nicelikler|çarpanlara ayırma|özdeşlik|permütasyon|olasılık|sayma|\bgrafik/],
  ["Türkçe",/türkçe|paragraf|dil bilgisi/,/atasöz|deyim|cümlede anlam|sözcükte|kelimede|ses bilgisi|yazım|noktalama|anlam bilgisi|cümle bilgisi/],
  ["Fizik",/fizik/,/elektrik|manyetizma/],
  ["Kimya",/kimya/,/organik/],
  ["Biyoloji",/biyoloji/,/biyo|sistemler/],
  ["Edebiyat",/edebiyat/,/roman özet|eser|sanatçı|yazar tür/],
  ["Tarih",/tarih/,/inkılap/],
  ["Coğrafya",/coğrafya/,/harita/],
  ["Felsefe",/felsefe|mantık|psikoloji|sosyoloji/,/^$/],
  ["Din",/din kültürü/,/^$/],
  ["Sosyal",/sosyal/,/^$/],
  ["Fen",/fen bilim/,/^$/],
  ["Yabancı Dil",/ingilizce|arapça|almanca|\bydt\b|\byds\b|yks ?-?dil|ykdil/,/grammar|grammer|reading|vocabulary|skills|strategies/]
];
const KINDS=[["Deneme",/deneme/],["Soru Bankası",/soru bankası|soru kitabı/],["Konu Anlatım",/konu anlatım|ders notu|konu özet/],["Yaprak Test",/yaprak test|fasikül/],["Çıkmış Sorular",/çıkmış/],["Cep Kitabı",/cep /]];

/* v93: kitap setleri, paketler ve hediyeli birleşimler katalogda yok; yalnız tek kitap (kapağı tek kitabın). */
const SET_RE=/\bset(i|leri)?\b|paket|kampanya|kombin|hediye|farklı yayın|\d+\s*[`']?\s*l[ıiuü]\s*set|ikili set|üçlü set/;
export const isSetName=name=>SET_RE.test(String(name).toLocaleLowerCase("tr-TR"));
const decode=s=>s.replace(/&amp;/g,"&").replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/\s+/g," ").trim();
/* v94: ders, yayınevi adı çıkarılmış başlıktan bulunur ("Rehber Matematik" yayınevi bir Geometri kitabını Matematik yapmasın).
   "Türkçenin/Paragrafın Matematiği" Türkçedir; Matematik ile Geometri birlikteyse Matematik; birden çok derse giren deneme
   ile dersi olmayan tıpkı basım / çıkmış soru / deneme kitapları "Deneme" (tüm dersler) bölümündedir. */
function subject(low){
  const text=/türkçe|paragraf/.test(low)?low.replace(/matematiği/g,""):low;
  let hits=SUBJECTS.filter(([,name])=>name.test(text)).map(([subject])=>subject);
  if(!hits.length)hits=SUBJECTS.filter(([,,topic])=>topic.test(text)).map(([subject])=>subject);
  if(hits.includes("Matematik")&&hits.includes("Geometri"))hits=hits.filter(h=>h!=="Geometri");
  if(/deneme/.test(text)&&hits.length>1)return "Deneme";
  return hits[0]??(/deneme|tıpkı basım|çıkmış/.test(text)?"Deneme":/tüm dersler|eşit ağırlık|sayısal|sözel|kamp|garanti konular|son d+ soru/.test(text)?"Tüm Dersler":"");
}
function withoutPublisher(low,pub){
  const p=String(pub||"").toLocaleLowerCase("tr-TR").trim(),short=p.replace(/\s+(yayınları|yayınevi|yayıncılık|yayın)$/,"");
  return [p,short].filter(x=>x.length>=3).reduce((text,x)=>text.split(x).join(" "),low);
}
export function classify(name,pub=""){
  const low=name.toLocaleLowerCase("tr-TR"),tyt=/\btyt\b/i.test(name),ayt=/\bayt\b/i.test(name);
  return {e:tyt&&ayt?"TYT-AYT":tyt?"TYT":ayt?"AYT":/\bydt\b/i.test(name)?"YDT":"",
    s:subject(withoutPublisher(low,pub)),k:KINDS.find(([,re])=>re.test(low))?.[0]??""};
}
/* v95: kitap adında yazan sayılar ("16x12" = 16 test × 12 soru, "10'lu Deneme", "40 Deneme"). Yalnız açıkça yazılan alınır;
   tahmin yapılmaz. t: toplam test, q: testteki soru (biliniyorsa). */
export function countsFromTitle(name){
  const low=String(name).toLocaleLowerCase("tr-TR"),ok=(n,max)=>Number.isInteger(n)&&n>=1&&n<=max;
  const nxm=low.match(/\b(\d{1,3})\s*[x×]\s*(\d{1,3})\b/);
  if(nxm){const t=Number(nxm[1]),q=Number(nxm[2]);if(ok(t,200)&&ok(q,200))return {t,q};}
  const plus=low.match(/\b(\d{1,3})\s*\+\s*(\d{1,3})\s*deneme/);
  if(plus){const t=Number(plus[1])+Number(plus[2]);if(ok(t,200))return {t};}
  const li=low.match(/\b(\d{1,3})\s*[`']?\s*l[ıiuü](?![a-zçğıöşü])[^0-9]{0,25}?deneme/);
  if(li&&ok(Number(li[1]),200))return {t:Number(li[1])};
  const n=low.match(/\b(\d{1,3})\s*(?:adet\s*)?(?:farklı\s*)?(?:branş\s*)?deneme(?:si|leri)?\b/);
  if(n&&ok(Number(n[1]),200))return {t:Number(n[1])};
  return {};
}
/** Bir liste sayfasından kitaplar. Kapak yalnız cdn.kitapsec.com/image/urun/ ise alınır. */
export function parseListing(html){
  const out=[];
  for(const block of html.split('class="Ks_UrunSatir"').slice(1)){
    const id=block.match(/^[^>]*\bid="(\d{1,9})"/)?.[1],name=block.match(/<meta itemprop="name" content="([^"]{3,200})"/)?.[1];
    if(!id||!name)continue;
    const img=block.match(/<meta itemprop="image" content="([^"]+)"/)?.[1]??"",pub=block.match(/class="yynImg"><div ?><a title="([^"]{2,80})"/)?.[1]??"";
    const n=decode(name);
    out.push({id:Number(id),n,p:decode(pub),c:COVER_RE.test(img)?img.replace("https://cdn.kitapsec.com/image/urun/",""):"",...classify(n,decode(pub)),...countsFromTitle(n)});
  }
  return out;
}
export const pageUrl=page=>`${SOURCE}${page}-6-0a0-0-0-0-0-0.xhtml`;
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function fetchPage(page){
  const res=await fetch(pageUrl(page),{headers:{"User-Agent":UA,"Accept":"text/html"}});
  if(!res.ok)throw new Error(`sayfa ${page}: HTTP ${res.status}`);
  return new TextDecoder("windows-1254").decode(await res.arrayBuffer());
}
/* v94: liste sayfasında kapağı görünmeyen kitaplar için kitabın kendi sayfasındaki ana resim (dtyResimlerIc) alınır.
   Sayfadaki "benzer ürünler" resimleri alınmaz. */
export function productCover(html){
  const img=html.match(/id="dtyResimlerIc"[\s\S]{0,400}?href="(https:\/\/cdn\.kitapsec\.com\/image\/urun\/[^"]+)"/)?.[1]??"";
  return COVER_RE.test(img)?img.replace("https://cdn.kitapsec.com/image/urun/",""):"";
}
export async function fillCovers(items,{delayMs=2000,log=console.log}={}){
  let found=0;const missing=items.filter(item=>!item.c);
  for(const [i,item] of missing.entries()){
    try{
      const res=await fetch(`https://www.kitapsec.com/Products/x-${item.id}.html`,{headers:{"User-Agent":UA,"Accept":"text/html"}});
      if(!res.ok)throw new Error("HTTP "+res.status);
      const c=productCover(new TextDecoder("windows-1254").decode(await res.arrayBuffer()));
      if(c){item.c=c;found++;}
    }catch(error){log(`kitap ${item.id}: ${error.message}`);}
    if((i+1)%25===0)log(`${i+1}/${missing.length} · bulunan ${found}`);
    await sleep(delayMs);
  }
  log(`eksik ${missing.length}, bulunan ${found}`);
  return items;
}
export async function crawl({pages=200,delayMs=2000,log=console.log}={}){
  const byId=new Map();
  for(let page=1;page<=pages;page++){
    const items=parseListing(await fetchPage(page)),before=byId.size;
    items.filter(item=>!isSetName(item.n)).forEach(item=>byId.set(item.id,item));
    log(`sayfa ${page}: ${items.length} kitap, toplam ${byId.size}`);
    if(!items.length||byId.size===before)break; // son sayfa ya da tekrar eden sayfa
    await sleep(delayMs);
  }
  return [...byId.values()].sort((a,b)=>a.n.localeCompare(b.n,"tr"));
}
if(process.argv[1]===fileURLToPath(import.meta.url)){
  const arg=k=>{const i=process.argv.indexOf(k);return i>0?process.argv[i+1]:undefined};
  // --refilter: Kitapseç'e gitmeden mevcut kataloğa yeni filtreleri uygular.
  const out=arg("--out")||"public/book-catalog-v92.json";
  // --fill-covers: kapaksız kitapların kapağı kendi sayfalarından doldurulur (2 sn arayla).
  const base=process.argv.includes("--refilter")||process.argv.includes("--fill-covers");
  const loaded=base?JSON.parse(readFileSync(out,"utf8")).items.filter(item=>!isSetName(item.n)).map(({t,q,...item})=>({...item,...classify(item.n,item.p),...countsFromTitle(item.n)})):null;
  const items=loaded&&process.argv.includes("--fill-covers")?await fillCovers(loaded):loaded?loaded:await crawl({pages:Number(arg("--pages")||200)});
  if(items.length<50)throw new Error(`Yalnız ${items.length} kitap geldi; katalog yazılmadı.`);
  writeFileSync(out,JSON.stringify({version:1,source:"kitapsec.com",fetchedAt:new Date().toISOString().slice(0,10),cdn:"https://cdn.kitapsec.com/image/urun/",items}));
  console.log(`${items.length} kitap → ${out}`);
}
