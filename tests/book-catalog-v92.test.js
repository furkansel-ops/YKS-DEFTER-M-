"use strict";
const test=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path"),vm=require("node:vm"),{spawnSync}=require("node:child_process");
const {pathToFileURL}=require("node:url");
const root=path.resolve(__dirname,"..");
const read=p=>fs.readFileSync(path.join(root,p),"utf8");
const url=p=>pathToFileURL(path.join(root,p)).href;
function run(lines,marker){
  const result=spawnSync(process.execPath,["--experimental-strip-types","--input-type=module","-e",lines.join("\n")],{cwd:root,encoding:"utf8",timeout:20000});
  assert.equal(result.status,0,result.stdout+"\n"+result.stderr);
  assert.match(result.stdout,new RegExp(marker));
}
const CARD=(id,name,img,pub)=>`<div class="Ks_UrunSatir"   itemscope itemprop="itemListElement" id="${id}"><div itemprop="item"><div itemscope><meta itemprop="name" content="${name}" /><meta itemprop="image" content="${img}" /></div></div><span class="yynImg"><div ><a title="${pub}" href="#">x</a></div></span></div>`;

test("v92 script: liste sayfası ayrıştırılır, kapak yalnız Kitapseç CDN, ders/sınav/tür adından",()=>{
  run([
    'import assert from "node:assert/strict";',
    `import {parseListing,classify,pageUrl} from "${url("scripts/build-book-catalog.mjs")}";`,
    `const html=${JSON.stringify(CARD(311595,"2027 TYT Matematik Soru Bankası Üç Dört Beş Yayınları","https://cdn.kitapsec.com/image/urun/2026/07/23/1784790696.jpg","Üç Dört Beş Yayınları")+CARD(1,"Kötü &amp; Kapak AYT Fizik","https://evil.example/x.jpg","Limit Yayınları")+'<div class="Ks_UrunSatir" id="2"></div>')};`,
    'const items=parseListing(html);assert.equal(items.length,2,"adı olmayan atlanır");',
    'assert.deepEqual(items[0],{id:311595,n:"2027 TYT Matematik Soru Bankası Üç Dört Beş Yayınları",p:"Üç Dört Beş Yayınları",c:"2026/07/23/1784790696.jpg",e:"TYT",s:"Matematik",k:"Soru Bankası"});',
    'assert.equal(items[1].c,"","başka alan adından kapak alınmaz");assert.equal(items[1].n,"Kötü & Kapak AYT Fizik");',
    'assert.equal(classify("2026 AYT Edebiyat El Kitabı Limit Yayınları").s,"Edebiyat","Limit yayınevi Matematik sanılmaz");',
    'assert.equal(classify("TYT Branş Deneme Seti (Türkçe+Matematik)").s,"Deneme");assert.equal(classify("Fonksiyonlar Apotemi").s,"Matematik");',
    'assert.equal(classify("TYT AYT Geometri").e,"TYT-AYT");',
    'assert.equal(pageUrl(3),"https://www.kitapsec.com/Products/YKS-Kitaplari/3-6-0a0-0-0-0-0-0.xhtml");',
    'console.log("OK parse");'
  ],"OK parse");
});

test("v92 uygulama kataloğu: güvenilmeyen JSON süzülür, arama gerçek kitaplarda, kapak adresi kitaba kaydolur",()=>{
  run([
    'import assert from "node:assert/strict";',
    `import {parseRealCatalog,searchCatalog,createBook,isCoverUrl} from "${url("src/domain/book-catalog.ts")}";`,
    'const cat=parseRealCatalog({cdn:"https://cdn.kitapsec.com/image/urun/",items:[',
    '  {id:311595,n:"2027 TYT Matematik Soru Bankası Üç Dört Beş Yayınları",p:"Üç Dört Beş Yayınları",c:"2026/07/23/1.jpg",s:"Matematik",e:"TYT",k:"Soru Bankası"},',
    '  {id:7,n:"AYT Felsefe Soru Bankası",p:"Limit Yayınları",c:"../../x.jpg?y",s:"Felsefe",e:"AYT",k:""},{id:"x",n:"bozuk"},{id:8,n:""}]});',
    'assert.equal(cat.length,2);assert.equal(cat[0].cover,"https://cdn.kitapsec.com/image/urun/2026/07/23/1.jpg");',
    'assert.equal("cover" in cat[1],false,"geçersiz kapak yolu düşer");',
    'assert.deepEqual(parseRealCatalog(null),[]);assert.deepEqual(parseRealCatalog({items:"x"}),[]);',
    'const r=searchCatalog("üç dört tyt mat","",60,cat);assert.equal(r.items.length,1);assert.equal(r.bySubject.Matematik,1);',
    'assert.equal(searchCatalog("felsefe","",60,cat).items[0].subject,"Felsefe");',
    'assert.equal(searchCatalog("345 tyt mat","",60,cat).items.length,1,"345 = Üç Dört Beş");assert.equal(searchCatalog("limit felsefe","",60,cat).items.length,1,"yayınevi alanında da aranır");',
    'const b=createBook({name:"K",subject:"Matematik",total:10,perTest:12,done:0,coverUrl:cat[0].cover},1);assert.equal(b.coverUrl,cat[0].cover);',
    'assert.equal("coverUrl" in createBook({name:"K",subject:"Matematik",total:10,perTest:12,done:0,coverUrl:"javascript:alert(1)"},1),false);',
    'assert.equal(isCoverUrl("https://cdn.kitapsec.com/image/urun/a/b.webp"),true);assert.equal(isCoverUrl("https://cdn.kitapsec.com.evil.io/image/urun/a.jpg"),false);',
    'console.log("OK catalog");'
  ],"OK catalog");
});

test("v92 koça kapak adresi gider (yalnız Kitapseç CDN), ekran kataloğu yükler ve açılmayan kapağı kaldırır",()=>{
  const rt=read("public/student-coaching-runtime.js"),ui=read("src/ui/books-v89.ts");
  const pick=re=>{const m=rt.match(re);assert.ok(m,String(re));return m[0];};
  const booksShare=vm.runInNewContext([pick(/const text=.*?;\n/),pick(/const list=.*?;\n/),pick(/const finite=.*?;\n/),pick(/const BOOK_COVER_MAX=.*\n/),pick(/const BOOK_COVER_URL_RE=.*\n/),pick(/function booksShare\(s\)\{.*\n/)].join("")+"booksShare");
  const one=coverUrl=>booksShare({books:[{id:1,name:"K",total:5,coverUrl}]})[0];
  assert.equal(one("https://cdn.kitapsec.com/image/urun/2026/07/23/1.jpg").coverUrl,"https://cdn.kitapsec.com/image/urun/2026/07/23/1.jpg");
  assert.equal("coverUrl" in one("https://evil.example/1.jpg"),false);
  assert.equal("coverUrl" in one(undefined),false);
  assert.match(ui,/const CATALOG_URL="\.\/book-catalog-v92\.json";/);
  assert.match(ui,/referrerpolicy="no-referrer"/);
  assert.match(ui,/img\.classList\.contains\("bk-remote"\)\)\{img\.closest\("\.bk-cover"\)\?\.classList\.remove\("has-remote"\);img\.remove\(\);\}/);
  assert.match(ui,/coverUrl:draft\?\.cover/);
});

test("v92 yayınevi etiketi: adında Yayınları olan iki kez yazılmaz",()=>{
  const ui=read("src/ui/books-v89.ts");
  assert.match(ui,/const meta=\[pubLabel\(b\.pub\|\|""\),b\.kind\|\|""\]/);
  const pubLabel=vm.runInNewContext(ui.match(/function pubLabel\(pub:string\):string\{(.*)\}/)[0].replace("(pub:string):string","(pub)")+";pubLabel");
  assert.equal(pubLabel("Üç Dört Beş Yayınları"),"Üç Dört Beş Yayınları");assert.equal(pubLabel("345"),"345 Yayınları");
  assert.equal(pubLabel("KR Akademi"),"KR Akademi");assert.equal(pubLabel(""),"");
});

test("v93 kitap setleri ve paketler katalogdan çıkar, tek kitaplar kalır",()=>{
  run([
    'import assert from "node:assert/strict";',
    `import {isSetName} from "${url("scripts/build-book-catalog.mjs")}";`,
    'for(const n of ["12.Sınıf Matematik Seti Sonuç Yayınları","2027 YKS TYT AYT Kimya Soru Bankası 2 li Set Üç Dört Beş Yayınları","Paragraf + Dil Bilgisi PARLA Soru Bankası 3 lü Set","2027 TYT 10lu Deneme Paketi Karakutu","AYT Deneme Sınavı Seti - Defter Hediyeli","TYT 10 Farklı Yayın 10 Farklı Deneme + Son 1 Yıl Çıkmış Sorular Hediye Altın Karma","Süper İkili Set Anahtar","AYT Matematik Video Anlatımlı Fasikül Seti Çap"])assert.equal(isSetName(n),true,n);',
    'for(const n of ["2027 TYT Matematik Soru Bankası Üç Dört Beş Yayınları","AYT Matematik 7+2 Deneme Sınavı Sonuç Yayınları","2026 AYT Matematik 10 lu Simülasyon Denemeleri 3D Yayınları","Setenay TYT Türkçe"])assert.equal(isSetName(n),false,n);',
    'console.log("OK sets");'
  ],"OK sets");
});
test("v93 üretilmiş katalogda set yok",()=>{
  const items=JSON.parse(read("public/book-catalog-v92.json")).items,low=s=>s.toLocaleLowerCase("tr-TR");
  assert.ok(items.length>3000);
  assert.deepEqual(items.filter(x=>/\bset(i|leri)?\b|paket|hediye/.test(low(x.n))).map(x=>x.n),[]);
});

test("v94 ders tespiti: yayınevi adı sayılmaz, önce ders adı sonra konu adı, karma kitaplar doğru bölümde",()=>{
  run([
    'import assert from "node:assert/strict";',
    `import {classify,productCover} from "${url("scripts/build-book-catalog.mjs")}";`,
    'const s=(n,p="")=>classify(n,p).s;',
    'assert.equal(s("0`dan Geometri Rehber Matematik","Rehber Matematik"),"Geometri","yayınevindeki Matematik sayılmaz");',
    'assert.equal(s("AYT Edebiyat Soru Bankası Paragrafın Şifresi Yayınları","Paragrafın Şifresi Yayınları"),"Edebiyat");',
    'assert.equal(s("TYT Paragrafın Matematiği Eko Soru Bankası"),"Türkçe","Paragrafın Matematiği Türkçedir");',
    'assert.equal(s("AYT Matematik Geometri Sondaj Kamp Soru Bankası"),"Matematik");',
    'assert.equal(s("AYT Biyoloji Sistemler Konu Özetli Soru Bankası"),"Biyoloji","ders adı konudan önce gelir");',
    'assert.equal(s("AYT Limit Soru Bankası Endemik Yayınları","Endemik Yayınları"),"Matematik");',
    'assert.equal(s("2026 AYT Edebiyat El Kitabı Limit Yayınları","Limit Yayınları"),"Edebiyat","Limit yayınevi Matematik sanılmaz");',
    'assert.equal(s("Paragrafik Tonguç Akademi"),"Türkçe");assert.equal(s("TYT Türkçe İnfografik Soru Bankası"),"Türkçe");',
    'assert.equal(s("YDT Adım Adım Soru Bankası"),"Yabancı Dil");assert.equal(s("2019 TYT Tıpkı Basım Çap Yayınları","Çap Yayınları"),"Deneme");',
    'assert.equal(s("TYT Tüm Dersler Soru Bankası Limit Yayınları","Limit Yayınları"),"Tüm Dersler");',
    'assert.equal(s("Lise Yanlış Defterim Takdir Yayınları"),"","YKS dışı ürün Diğer kalır");',
    'const page=`<div class="dtyResimlerIc" id="dtyResimlerIc"><a class="lightbox" href="https://cdn.kitapsec.com/image/urun/2026/03/10/1773144341.gif">x</a></div><div itemscope><meta itemprop="image" content="https://cdn.kitapsec.com/image/urun/2026/09/24/benzer.jpg" /></div>`;',
    'assert.equal(productCover(page),"2026/03/10/1773144341.gif","kitabın kendi resmi, GIF dahil");',
    'assert.equal(productCover(`<meta itemprop="image" content="https://cdn.kitapsec.com/image/urun/benzer.jpg" />`),"","benzer ürün resmi alınmaz");',
    'console.log("OK v94");'
  ],"OK v94");
});
test("v94 GIF kapak öğrencide, koça gönderimde ve koçta kabul edilir",()=>{
  run([
    'import assert from "node:assert/strict";',
    `import {isCoverUrl} from "${url("src/domain/book-catalog.ts")}";`,
    'assert.equal(isCoverUrl("https://cdn.kitapsec.com/image/urun/2026/03/10/1773144341.gif"),true);',
    'console.log("OK gif");'
  ],"OK gif");
  assert.match(read("public/student-coaching-runtime.js"),/const BOOK_COVER_URL_RE=.*webp\|gif\)\$\/i;/);
});

test("v94 katalog her açılışta sunucuya sorulur (eski katalog önbellekte kalmaz)",()=>{
  assert.match(read("src/ui/books-v89.ts"),/fetch\(CATALOG_URL,\{cache:"no-cache"\}\)/);
});

test("v95 adından sayı: NxM, N'li, N+M ve N deneme; tahmin yok",()=>{
  run([
    'import assert from "node:assert/strict";',
    `import {countsFromTitle as c} from "${url("scripts/build-book-catalog.mjs")}";`,
    'assert.deepEqual(c("AYT Fizik 25x14 Branş Denemeleri"),{t:25,q:14});assert.deepEqual(c("TYT Fen 20 x 20 Up Deneme"),{t:20,q:20});',
    'assert.deepEqual(c("2027 TYT Matematik 10`lu Deneme"),{t:10});assert.deepEqual(c("TYT 3 lü Deneme"),{t:3});',
    'assert.deepEqual(c("AYT Matematik 7+2 Deneme Sınavı"),{t:9});assert.deepEqual(c("AYT Biyoloji 30 Deneme"),{t:30});',
    'assert.deepEqual(c("2027 TYT Matematik Soru Bankası"),{},"soru bankasında tahmin yok");assert.deepEqual(c("TYT Son 1001 Soru"),{});',
    'console.log("OK counts");'
  ],"OK counts");
});

test("v95 form katalog sayılarıyla dolar; paylaşılan sayı öğrenci değiştirmediyse gelir, eklerken paylaşılır",()=>{
  const ui=read("src/ui/books-v89.ts"),rt=read("public/student-coaching-runtime.js"),dom=read("src/domain/book-catalog.ts");
  assert.match(dom,/\.\.\.\(whole\(it\?\.t,2000\)\?\{tests:whole\(it\?\.t,2000\)\}:\{\}\)/);
  assert.match(ui,/value="\$\{d\.tests\?\?""\}"/);assert.match(ui,/value="\$\{d\.perTest\?\?\(deneme\?/);
  assert.match(ui,/const untouched=\(input:HTMLInputElement\)=>input\.value===input\.defaultValue;/,"öğrencinin yazdığının üstüne yazılmaz");
  assert.match(ui,/if\(picked\?\.key\.startsWith\("ks"\)&&book\.perTest\)void countsApi\(\)\?\.propose\(picked\.key,book\.total,book\.perTest\);/);
  assert.match(rt,/bookCounts:\{get:bookCountGet,propose:bookCountPropose\}/);
  assert.match(rt,/if\(\(await getDoc\(doc\(rt\.db,"bookCounts",bookId\)\)\)\.exists\(\)\)return false;/,"var olan sayının üstüne yazmaya çalışmaz");
  assert.ok(rt.includes("const BOOK_COUNT_ID=/^ks\\d{1,9}$/;"),"yalnız katalog kimliği (ks + sayı)");
});
