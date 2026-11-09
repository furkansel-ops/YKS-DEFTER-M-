/* v89 · Kitaplarım: yayınevi kataloğu, arama ve kitap ilerlemesi. DOM'a dokunmaz.
   Katalog gerçek tek tek kitap değil, yayınevi + sınav + ders + tür birleşimidir; test sayısını öğrenci girer.
   Kayıtlar eski S.books yapısını korur: {id,name,subject,total,done,log,topic} + v89 alanları. */

export const PUBLISHERS=["3D","345","Acil","Ankara","Antrenman","Apotemi","Aydın","Benim Hocam","Bilgi Sarmal","Çap","Delta","Eis","Endemik","Esen","Fen Bilimleri","Final","Hız ve Renk","Hocalara Geldik","Kafa Dengi","Karekök","Krallar Karması","Limit","Marsis","Miray","Nitelik","Okyanus","Orijinal","Özdebir","Palme","Paraf","Rasyonel","Sonuç","Supara","Tonguç","Yayın Denizi","Zafer"] as const;
/* Ders adı, uygulamanın konu listesindeki adla aynıdır (konuya bağlama bu adla yapılır). */
export const BOOK_SUBJECTS:Record<string,{color:string;exams:readonly ("TYT"|"AYT")[]}>={
  "Matematik":{color:"#2f6fe4",exams:["TYT","AYT"]},"Geometri":{color:"#3a8f8a",exams:["TYT","AYT"]},
  "Türkçe":{color:"#c0532f",exams:["TYT"]},"Fizik":{color:"#7b4fd1",exams:["TYT","AYT"]},
  "Kimya":{color:"#c2368a",exams:["TYT","AYT"]},"Biyoloji":{color:"#2f9a55",exams:["TYT","AYT"]},
  "Edebiyat":{color:"#a8662a",exams:["AYT"]},"Tarih":{color:"#8a5a3a",exams:["TYT","AYT"]},
  "Coğrafya":{color:"#2a7aa8",exams:["TYT","AYT"]},"Deneme":{color:"#5a6478",exams:["TYT","AYT"]}
};
export const BOOK_TYPES=["Soru Bankası","Fasikül Set","Branş Denemesi","Konu Anlatımlı"] as const;
const DENEME_TYPES=["Branş Deneme Seti","Genel Deneme Seti"] as const;

export type CatalogItem={key:string;name:string;pub:string;subject:string;exam:string;kind:string;color:string;cover?:string;terms?:string;tests?:number;perTest?:number};
/* Öğrencinin yazdığı kısa adlar: Kitapseç "Üç Dört Beş" yazar, öğrenci "345" arar. */
const SEARCH_ALIASES:readonly [RegExp,string][]=[[/üç\s*dört\s*beş|ucdortbes/i,"345"],[/prf\s*paraf/i,"paraf"]];
function aliases(text:string):string{return SEARCH_ALIASES.filter(([re])=>re.test(text)).map(([,alias])=>alias).join(" ");}
/* v92: gerçek katalog (scripts/build-book-catalog.mjs → public/book-catalog-v92.json). Kapak yalnız Kitapseç CDN adresi. */
export const COVER_URL_RE=/^https:\/\/cdn\.kitapsec\.com\/image\/urun\/[A-Za-z0-9/_.-]+\.(?:jpe?g|png|webp|gif)$/i;
export function isCoverUrl(value:unknown):value is string{return typeof value==="string"&&value.length<=200&&COVER_URL_RE.test(value);}
type RawCatalog={cdn?:unknown;items?:unknown};
type RawItem={id?:unknown;n?:unknown;p?:unknown;c?:unknown;s?:unknown;e?:unknown;k?:unknown;t?:unknown;q?:unknown};
const whole=(value:unknown,max:number):number|undefined=>{const n=Number(value);return Number.isInteger(n)&&n>=1&&n<=max?n:undefined;};
/** Dışarıdan gelen JSON güvenilmez: her alan sınırlanır, kapak adresi doğrulanır. */
export function parseRealCatalog(raw:unknown):CatalogItem[]{
  const data=(raw&&typeof raw==="object"?raw:{}) as RawCatalog,cdn=String(data.cdn??"");
  if(!Array.isArray(data.items))return [];
  const out:CatalogItem[]=[];
  for(const it of data.items as RawItem[]){
    const id=Number(it?.id),name=String(it?.n??"").trim().slice(0,160);if(!Number.isInteger(id)||id<=0||!name)continue;
    const subject=String(it?.s??"").slice(0,30)||"Diğer",cover=it?.c?cdn+String(it.c):"";
    out.push({key:"ks"+id,name,pub:String(it?.p??"").slice(0,60),subject,exam:String(it?.e??"").slice(0,8),kind:String(it?.k??"").slice(0,30),
      color:BOOK_SUBJECTS[subject]?.color??"#5a6478",...(isCoverUrl(cover)?{cover}:{}),terms:[String(it?.p??""),aliases(name+" "+String(it?.p??""))].join(" ").trim(),
      ...(whole(it?.t,2000)?{tests:whole(it?.t,2000)}:{}),...(whole(it?.q,400)?{perTest:whole(it?.q,400)}:{})});
  }
  return out;
}
export type BookLog={d:string;n:number};
export type BookRecord={id:number;name:string;subject:string;total:number;done:number;log:BookLog[];topic:string;
  pub?:string;exam?:string;kind?:string;perTest?:number;createdAt?:number;
  /** Öğrencinin çektiği kapak: 240 px JPEG data URL. */
  cover?:string;
  /** v92: katalogdan seçilen kitabın Kitapseç kapak adresi. */
  coverUrl?:string};

let catalogCache:CatalogItem[]|null=null;
export function catalog():CatalogItem[]{
  if(catalogCache)return catalogCache;
  const out:CatalogItem[]=[];
  for(const pub of PUBLISHERS)for(const [subject,{color,exams}] of Object.entries(BOOK_SUBJECTS))for(const exam of exams){
    for(const kind of subject==="Deneme"?DENEME_TYPES:BOOK_TYPES){
      const name=[pub,exam,subject==="Deneme"?"":subject,kind].filter(Boolean).join(" ");
      out.push({key:pub+"|"+exam+"|"+subject+"|"+kind,name,pub,subject,exam,kind,color});
    }
  }
  return catalogCache=out;
}
export function words(value:string):string[]{
  return value.toLocaleLowerCase("tr-TR").replace(/[^a-zçğıöşü0-9 ]/gu," ").split(/\s+/).filter(Boolean);
}
/** Her aranan kelime, adın bir kelimesinin başıyla eşleşmeli ("345 tyt mat"). Ders sayıları filtre öncesi verilir. */
export function searchCatalog(query:string,subject="",limit=60,source:readonly CatalogItem[]=catalog()):{items:CatalogItem[];total:number;bySubject:Record<string,number>}{
  const q=words(query),bySubject:Record<string,number>={},hits:CatalogItem[]=[];
  for(const item of source){
    const w=words(item.terms?item.name+" "+item.terms:item.name);
    if(!q.every(part=>w.some(x=>x.startsWith(part))))continue;
    bySubject[item.subject]=(bySubject[item.subject]??0)+1;
    if(!subject||item.subject===subject)hits.push(item);
  }
  return {items:hits.slice(0,limit),total:hits.length,bySubject};
}
function count(value:unknown,max:number):number{const n=Math.floor(Number(value));return Number.isFinite(n)?Math.max(0,Math.min(max,n)):0;}
/** Kitap ekleme girdisi doğrulanır; geçersizse açıklayıcı hata atar. */
export function createBook(input:{name:string;subject:string;total:unknown;perTest:unknown;done:unknown;pub?:string;exam?:string;kind?:string;coverUrl?:unknown},now:number):BookRecord{
  const name=String(input.name??"").trim().slice(0,120),total=count(input.total,2000),perTest=count(input.perTest,400);
  if(!name)throw new Error("Kitap adını yaz.");
  if(total<1)throw new Error("Toplam test sayısını yaz.");
  if(perTest<1)throw new Error("Testteki soru sayısını yaz.");
  return {id:now,name,subject:String(input.subject||"Matematik").slice(0,40),total,done:Math.min(total,count(input.done,2000)),log:[],topic:"",
    pub:input.pub?String(input.pub).slice(0,40):"",exam:input.exam?String(input.exam).slice(0,8):"",kind:input.kind?String(input.kind).slice(0,40):"",perTest,createdAt:now,...(isCoverUrl(input.coverUrl)?{coverUrl:input.coverUrl}:{})};
}
/** n test ilerletir (negatif geri alır); kaç sorunun değiştiğini döner. Kitap yeni nesne olarak döner. */
export function advanceBook(book:BookRecord,n:number,day:string):{book:BookRecord;questions:number}{
  const done=Math.max(0,Math.min(book.total,book.done+Math.trunc(n))),delta=done-book.done;
  if(!delta)return {book,questions:0};
  const log=[...(book.log??[]),{d:day,n:delta}].slice(-400);
  return {book:{...book,done,log},questions:delta*(book.perTest??0)};
}
/** Koçun kitap görevi ("📚 Ad · 18–20. testler · 39 soru") hangi teste kadar; bu kitabın görevi değilse null. */
export function bookTaskEnd(text:string,name:string):number|null{
  const head="📚 "+name.trim().slice(0,120)+" · ",i=text.indexOf(head);if(i<0)return null;
  const m=/^(?:\d+[–-])?(\d+)\. test/.exec(text.slice(i+head.length));
  return m?Number(m[1]):null;
}
export function bookQuestions(book:BookRecord):number{return book.done*(book.perTest??0);}
export function bookStats(books:readonly BookRecord[]):{books:number;finished:number;questions:number}{
  return {books:books.length,finished:books.filter(b=>b.total>0&&b.done>=b.total).length,questions:books.reduce((s,b)=>s+bookQuestions(b),0)};
}
/** Son 14 günün hızıyla tahmini bitiş; ilerleme yoksa null. */
export function bookFinishDays(book:BookRecord,today:string,shift:(day:string,n:number)=>string):number|null{
  const cut=shift(today,-14),sum=(book.log??[]).filter(l=>l.d>=cut&&l.d<=today).reduce((s,l)=>s+l.n,0);
  const left=book.total-book.done;if(left<=0)return 0;if(sum<=0)return null;
  return Math.ceil(left/(sum/14));
}
/* Tek kelimelik yayınevi ("345", "3D", "Limit") ilk 3 harfiyle, çok kelimelik baş harfleriyle yazılır. */
export function initials(pub:string):string{
  const parts=pub.trim().split(/\s+/).filter(Boolean);
  return (parts.length===1?parts[0]!.slice(0,3):parts.map(w=>w[0]).join("").slice(0,3)).toLocaleUpperCase("tr-TR")||"?";
}
