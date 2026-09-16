const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');

test('koç program paylaşımı Programım yapısını tam taşır',()=>{
  const src=read('public/coach-program-share-v2.js');
  for(const token of ['rowLabels','rows','weeks','done','dn','mv'])assert.ok(src.includes(token),token);
  assert.match(src,/version:PROGRAM_VERSION,rows,rowLabels:labels,weeks/);
  assert.match(src,/MAX_PROGRAM_WEEKS=80/);
  assert.doesNotMatch(src,/Date\.now\(\)-14\*DAY/);
  assert.doesNotMatch(src,/slice\(-10\)/);
});

test('program paylaşımı veri değişikliklerini ve eski paylaşım yazımını toparlar',()=>{
  const src=read('public/coach-program-share-v2.js');
  assert.match(src,/yks:data-changed/);
  assert.match(src,/onSnapshot\(ref/);
  assert.match(src,/Number\(remote\?\.version\|\|0\)!==PROGRAM_VERSION/);
  assert.match(src,/setDoc\(doc\(rt\.db,"coachingShares",rt\.user\.uid\),\{program:programPayload\(s\),updatedAt:serverTimestamp\(\)\},\{merge:true\}\)/);
});

test('loader program paylaşımını auth başlamadan önce yükler',()=>{
  const loader=read('src/ui/coach-account-loader.ts');
  const program=loader.indexOf('coach-program-share-v2.js?v=2.0.0');
  const auth=loader.indexOf('auth-session-runtime.js?v=1.6.0');
  assert.ok(program>=0);
  assert.ok(auth>program);
});

test('program paylaşımı ham kullanıcı sync verisini koça açmaz',()=>{
  const src=read('public/coach-program-share-v2.js');
  assert.doesNotMatch(src,/users.*sync/);
  assert.match(src,/coachingShares/);
});
