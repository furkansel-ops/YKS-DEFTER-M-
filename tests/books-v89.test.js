"use strict";
const test=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path"),{spawnSync}=require("node:child_process");
const {pathToFileURL}=require("node:url");
const root=path.resolve(__dirname,"..");
const read=p=>fs.readFileSync(path.join(root,p),"utf8");
const url=p=>pathToFileURL(path.join(root,p)).href;
function run(lines,marker){
  const result=spawnSync(process.execPath,["--experimental-strip-types","--input-type=module","-e",lines.join("\n")],{cwd:root,encoding:"utf8",timeout:20000});
  assert.equal(result.status,0,result.stdout+"\n"+result.stderr);
  assert.match(result.stdout,new RegExp(marker));
}

test("v89 katalog araması: kelime başı eşleşir, Türkçe harfler doğru, ders sayıları filtreden önce",()=>{
  run([
    'import assert from "node:assert/strict";',
    `import {searchCatalog,catalog,PUBLISHERS} from "${url("src/domain/book-catalog.ts")}";`,
    'assert.equal(PUBLISHERS.length,36);assert.equal(new Set(catalog().map(x=>x.key)).size,catalog().length,"anahtarlar tekil");',
    'let r=searchCatalog("345 tyt mat");assert.ok(r.items.length>0);assert.ok(r.items.every(x=>x.pub==="345"&&x.exam==="TYT"&&x.subject==="Matematik"));',
    'r=searchCatalog("özdebir kimya");assert.ok(r.items.length>0&&r.items.every(x=>x.pub==="Özdebir"));',
    'r=searchCatalog("İLİM");assert.equal(r.total,0,"olmayan kitap uydurulmaz");',
    'const all=searchCatalog("limit"),fiz=searchCatalog("limit","Fizik");',
    'assert.equal(fiz.bySubject.Fizik,all.bySubject.Fizik);assert.ok(fiz.items.every(x=>x.subject==="Fizik"));',
    'assert.ok(!searchCatalog("tyt edebiyat").total,"Edebiyat yalnız AYT");',
    'console.log("OK search");'
  ],"OK search");
});

test("v89 kitap oluşturma doğrular; ilerleme soru sayısını verir, sınırları aşmaz, eski kayıt değişmez",()=>{
  run([
    'import assert from "node:assert/strict";',
    `import {createBook,advanceBook,bookStats,bookFinishDays} from "${url("src/domain/book-catalog.ts")}";`,
    'assert.throws(()=>createBook({name:"",subject:"Matematik",total:10,perTest:12,done:0},1),/adını/);',
    'assert.throws(()=>createBook({name:"A",subject:"Matematik",total:0,perTest:12,done:0},1),/test sayısını/);',
    'assert.throws(()=>createBook({name:"A",subject:"Matematik",total:10,perTest:"x",done:0},1),/soru sayısını/);',
    'const b=createBook({name:"  345 TYT Matematik Soru Bankası ",subject:"Matematik",total:40,perTest:13,done:50,pub:"345"},7);',
    'assert.equal(b.name,"345 TYT Matematik Soru Bankası");assert.equal(b.done,40,"bitirilen test toplamı aşamaz");',
    'const c=createBook({name:"K",subject:"Fizik",total:10,perTest:12,done:2},8);',
    'let r=advanceBook(c,1,"2026-11-07");assert.equal(r.questions,12);assert.equal(r.book.done,3);assert.equal(c.done,2,"eski nesne değişmez");',
    'r=advanceBook(r.book,100,"2026-11-07");assert.equal(r.book.done,10);assert.equal(r.questions,7*12);',
    'assert.equal(advanceBook(r.book,1,"2026-11-07").questions,0,"bitmiş kitapta ilerleme yok");',
    'r=advanceBook(r.book,-1,"2026-11-07");assert.equal(r.questions,-12,"geri alma soruyu da geri alır");',
    'const legacy={id:1,name:"Eski",subject:"Matematik",total:40,done:17,log:[],topic:""};',
    'assert.equal(advanceBook(legacy,1,"2026-11-07").questions,0,"soru/test bilinmeyen eski kitap soru eklemez");',
    'assert.deepEqual(bookStats([b,c,legacy]),{books:3,finished:1,questions:40*13+2*12});',
    'const shift=(d,n)=>{const x=new Date(d+"T12:00:00");x.setDate(x.getDate()+n);return x.toISOString().slice(0,10)};',
    'assert.equal(bookFinishDays({...c,log:[{d:"2026-11-01",n:7}]},"2026-11-07",shift),Math.ceil(8/(7/14)));',
    'assert.equal(bookFinishDays(c,"2026-11-07",shift),null);',
    'console.log("OK books");'
  ],"OK books");
});

test("v89 Kitaplarım Merkez'den açılır, +1 test sorularını bugüne yazar",()=>{
  const nav=read("src/ui/navigation-v43.ts"),shell=read("src/ui/refined-shell.ts"),ui=read("src/ui/books-v89.ts");
  assert.match(nav,/\{action:"books",label:"Kitaplarım"/);
  assert.match(nav,/else if\(action==="books"\)\(window as Window&\{YKSBooks\?:\{open:\(\)=>void\}\}\)\.YKSBooks\?\.open\(\)/);
  assert.match(shell,/try\{installBooksV89\(\);\}catch/);
  assert.match(ui,/s\.solved\[day\]=Math\.max\(0,\(Number\(s\.solved\[day\]\)\|\|0\)\+questions\)/);
  assert.match(ui,/Önceden bitirdiğin testler bugünün sorularına eklenmez/);
});

test("v89 kapak kısaltması: tek kelimelik yayınevi kısalmaz",()=>{
  run([
    'import assert from "node:assert/strict";',
    `import {initials} from "${url("src/domain/book-catalog.ts")}";`,
    'assert.equal(initials("345"),"345");assert.equal(initials("3D"),"3D");assert.equal(initials("Limit"),"LİM");',
    'assert.equal(initials("Bilgi Sarmal"),"BS");assert.equal(initials("Hız ve Renk"),"HVR");assert.equal(initials(""),"?");',
    'console.log("OK initials");'
  ],"OK initials");
});

test("v89 pencere id'leri eski Kaynaklar formuyla çakışmaz",()=>{
  const ui=read("src/ui/books-v89.ts"),html=read("index.html");
  const mine=[...ui.matchAll(/id="([^"$]+)"/g)].map(m=>m[1]);
  assert.ok(mine.length>=8);
  for(const id of mine)assert.ok(!html.includes(`id="${id}"`),id+" index.html'de zaten var");
});

test("v89 kapak fotoğrafı: kapağa dokununca seçilir, küçük JPEG olarak saklanır, başka veri reddedilir",()=>{
  const ui=read("src/ui/books-v89.ts");
  assert.match(ui,/if\(act==="cover"\)\{pickCover\(id\);return;\}/);
  assert.match(ui,/const COVER_PX=240,COVER_MAX=80000;/);
  assert.match(ui,/value\.startsWith\("data:image\/jpeg;base64,"\)&&value\.length<=COVER_MAX/,"yalnız küçük JPEG kabul edilir");
  assert.match(ui,/if\(isCover\(image\)\)return/,"geçersiz kapak yerine çizilmiş kapak görünür");
  assert.match(ui,/L\.compressImage/,"HEIC dahil mevcut sıkıştırma kullanılır");
});

test("v89/v91 kitaplar koça progress.books içinde gider: küçük kapakla, sınırlı, geçersiz kayıt düşer",()=>{
  const rt=read("public/student-coaching-runtime.js"),vm=require("node:vm");
  const pick=re=>{const m=rt.match(re);assert.ok(m,String(re));return m[0];};
  const src=[pick(/const text=.*?;\n/),pick(/const list=.*?;\n/),pick(/const finite=.*?;\n/),pick(/const BOOK_COVER_MAX=.*\n/),pick(/const BOOK_COVER_URL_RE=.*\n/),pick(/function booksShare\(s\)\{.*\n/)].join("")+"booksShare";
  const booksShare=vm.runInNewContext(src);
  const out=booksShare({books:[
    {id:7,name:"345 TYT Matematik Soru Bankası",subject:"Matematik",pub:"345",exam:"TYT",kind:"Soru Bankası",total:40,done:99,perTest:13,cover:"data:image/jpeg;base64,AAAA",log:[{d:"2026-11-07",n:1},{d:"2026-11-02",n:2},{d:"bozuk",n:1}]},
    {id:8,name:"",total:10},{id:9,name:"Sıfır testli",total:0},{name:"Eski kaynak",subject:"Fizik",total:20,done:3,log:[]}
  ]});
  assert.equal(out.length,1,"adı, id'si ya da testi olmayan düşer");
  assert.deepEqual(JSON.parse(JSON.stringify(out[0])),{id:"7",name:"345 TYT Matematik Soru Bankası",subject:"Matematik",pub:"345",exam:"TYT",kind:"Soru Bankası",total:40,done:40,perTest:13,last:"2026-11-07",cover:"data:image/jpeg;base64,AAAA"});
  assert.equal(booksShare({books:Array.from({length:80},(_,i)=>({id:i+1,name:"K"+i,total:5}))}).length,60);
  assert.match(rt,/books:booksShare\(s\),dayReview:\{entries:dayReviews\}/,"progress içinde, yeni üst alan yok (Firestore kuralı değişmez)");
});

test("v91 koça giden kapak: yalnız geçerli küçük JPEG, toplam 240 KB bütçe",()=>{
  const rt=read("public/student-coaching-runtime.js"),vm=require("node:vm");
  const pick=re=>{const m=rt.match(re);assert.ok(m,String(re));return m[0];};
  const booksShare=vm.runInNewContext([pick(/const text=.*?;\n/),pick(/const list=.*?;\n/),pick(/const finite=.*?;\n/),pick(/const BOOK_COVER_MAX=.*\n/),pick(/const BOOK_COVER_URL_RE=.*\n/),pick(/function booksShare\(s\)\{.*\n/)].join("")+"booksShare");
  const jpeg=n=>"data:image/jpeg;base64,"+"A".repeat(n);
  const one=cover=>booksShare({books:[{id:1,name:"K",total:5,cover}]})[0].cover;
  assert.equal(one(jpeg(100)),jpeg(100));
  assert.equal(one(jpeg(13000)),undefined,"12 KB üstü gitmez");
  assert.equal(one("data:image/png;base64,AAAA"),undefined,"yalnız JPEG");
  assert.equal(one('data:image/jpeg;base64,AA"><script>'),undefined,"base64 dışı karakter reddedilir");
  assert.equal(one(42),undefined);
  const many=booksShare({books:Array.from({length:30},(_,i)=>({id:i+1,name:"K"+i,total:5,cover:jpeg(11000)}))});
  const sent=many.filter(b=>b.cover).length;
  assert.equal(sent,Math.floor(240000/(11000+23)),"bütçe dolunca kalanlar kapaksız gider");
  assert.ok(many.slice(sent).every(b=>!("cover" in b)),"Firestore undefined almaz: alan hiç eklenmez");
});

test("v91 kitap eklerken kapak çekilebilir; kapak işlenemezse kitap yine eklenir",()=>{
  const ui=read("src/ui/books-v89.ts");
  assert.match(ui,/<input id="bk89Cover" name="cover" type="file" accept="image\/\*" capture="environment">/);
  assert.match(ui,/if\(file instanceof File&&file\.size>0\)/);
  assert.match(ui,/try\{book\.cover=await coverFromFile\(file\);\}catch\{toast\("Kapak işlenemedi · kitap kapaksız eklendi"\);\}/);
  assert.match(ui,/dialog\.addEventListener\("submit",event=>\{void onSubmit\(event\);\}\)/);
});
