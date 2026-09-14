const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
const vite=()=>fs.readFileSync(path.join(root,"vite.config.mts"),"utf8");

test("Firebase senkronu yeni yüklemelerde daha az ve güvenli boyutta parça üretir",()=>{
  const source=vite();
  assert.match(source,/splitUtf8\(str,max=640000\)/);
  assert.match(source,/size>720000/);
  assert.match(source,/parts\.length>12/);
});

test("Firebase uzaktaki durumu bütün eski chunks koleksiyonunu taramadan okur",()=>{
  const source=vite();
  assert.match(source,/yalnız aktif revizyonu okuma/);
  assert.match(source,/ids\.slice\(i,i\+8\)\.map\(id=>getDoc\(chunkRef\(user\.uid,id\)\)\)/);
  assert.match(source,/docs\.some\(d=>!d\.exists\(\)\)/);
});

test("Firebase geçici hatalarda sıkı yeniden deneme döngüsüne girmez",()=>{
  const source=vite();
  assert.match(source,/syncRetryCount=0/);
  assert.match(source,/Math\.min\(60000,1200\*Math\.pow\(2,/);
  assert.match(source,/Yeniden deneniyor…/);
  assert.doesNotMatch(source,/timer=setTimeout\(upload,120\);\}\}'/);
});

test("Firebase oturum kaynaklı senkron hatasında kimlik jetonunu bir kez tazelemeyi dener",()=>{
  const source=vite();
  assert.match(source,/refreshCloudAuth/);
  assert.match(source,/permission-denied/);
  assert.match(source,/unauthenticated/);
  assert.match(source,/user\.getIdToken\(true\)/);
});
