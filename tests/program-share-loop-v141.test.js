const test=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path");
const src=fs.readFileSync(path.join(__dirname,"..","public/student-program-share-v2.js"),"utf8");
const pick=re=>{const m=src.match(re);assert.ok(m,String(re));return m[0];};
const hash=new Function(pick(/function payloadHash[\s\S]*?\n}\n/)+pick(/function canonical[\s\S]*?\n}\n/)+pick(/function stableProgramHash[\s\S]*?\n}\n/)+"return stableProgramHash;")();

test("v141 program karşılaştırması anahtar sırasından bağımsız: Firestore'un sıraladığı kopya yerel programla aynı sayılır",()=>{
  const local={version:3,rows:{r:2,s:4},rowLabels:{r:["A",""],s:["","","",""]},weeks:[{week:"2026-11-16",data:{r:{"0":["Mat","","","","","",""]},s:{},done:[true,false,false,false,false,false,false],dn:{"r-0-1":true,"r-0-0":true},mv:{}}}],syncedAt:111};
  // Firestore'dan dönen biçim: her haritanın anahtarları alfabetik, syncedAt farklı.
  const remote={rowLabels:{r:["A",""],s:["","","",""]},rows:{r:2,s:4},syncedAt:999,version:3,weeks:[{data:{dn:{"r-0-0":true,"r-0-1":true},done:[true,false,false,false,false,false,false],mv:{},r:{"0":["Mat","","","","","",""]},s:{}},week:"2026-11-16"}]};
  assert.equal(hash(remote),hash(local),"aynı program aynı özet; kendi yazması yeniden yazdırmaz");
  assert.notEqual(hash({...remote,weeks:[]}),hash(local),"gerçek değişiklik yine fark edilir");
  assert.notEqual(hash({...local,rowLabels:{r:["B",""],s:["","","",""]}}),hash(local));
  assert.equal(hash(null),"");
});

test("v141 düzeltilmiş dosya yeni sürüm etiketiyle yüklenir (tarayıcı eski dosyayı önbellekten kullanmaz)",()=>{
  assert.match(fs.readFileSync(path.join(__dirname,"..","src/ui/student-account-loader.ts"),"utf8"),/student-program-share-v2\.js\?v=3\.6\.4-safe/);
  assert.match(src,/window\.YKSStudentProgramShareV2=\{version:"3\.6\.4"/);
});
