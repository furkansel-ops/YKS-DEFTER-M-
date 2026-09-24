const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");

const root=path.resolve(__dirname,"..");
const read=file=>fs.readFileSync(path.join(root,file),"utf8");

test("V5 ana ekranlarının tamamı mobil ve azaltılmış hareket desteğini korur",()=>{
  const cssFiles=[
    "src/ui/today-v43.css",
    "src/ui/program-v5.css",
    "src/ui/program-builder-v5.css",
    "src/ui/focus-v5.css",
    "src/ui/progress-v5.css",
    "src/ui/notes-v5.css",
    "src/ui/settings-v5.css"
  ];
  for(const file of cssFiles){
    const css=read(file);
    assert.match(css,/@media\s*\(max-width:/,file+" mobile");
    assert.match(css,/prefers-reduced-motion:reduce/,file+" reduced motion");
  }
  assert.match(read("src/ui/program-builder-v5.css"),/safe-area-inset-bottom/);
  assert.match(read("src/ui/notes-v5.css"),/safe-area-inset-bottom/);
});

test("V5 kullanıcıya görünen ana navigasyon adları tek sözlükte buluşur",()=>{
  const program=read("src/ui/program-v5.ts");
  const focus=read("src/ui/focus-v5.ts");
  const progress=read("src/ui/progress-v5.ts");
  const nav=read("src/ui/navigation-v43.ts");
  assert.match(program,/label\.textContent="Programım"/);
  assert.match(focus,/label\.textContent="Çalış"/);
  assert.match(progress,/label\.textContent="İstatistik"/);
  assert.match(nav,/label\.textContent="Merkez"/);
});

test("Programım → koç paylaşımı veri hattı redesign sonrasında aynı sözleşmede kalır",()=>{
  const app=read("app.js");
  const builder=read("src/ui/program-builder-v5.ts");
  const share=read("public/student-program-share-v2.js");

  assert.match(builder,/\(window as HostWindow\)\.save\?\.\(\)/);
  assert.doesNotMatch(builder,/setDoc|coachingShares|firebase|firestore/i);

  assert.match(app,/new CustomEvent\("yks:data-changed"/);
  assert.match(app,/detail:\{source:"save"/);

  assert.match(share,/window\.addEventListener\("yks:data-changed",changed\)/);
  assert.match(share,/Object\.keys\(s\?\.weeks\|\|\{\}\)/);
  assert.match(share,/setDoc\(doc\(rt\.db,"coachingShares",rt\.user\.uid\)/);
  assert.match(share,/const PROGRAM_VERSION=3/);
});

test("V5 salt okunur sunum katmanları kalıcı veri katmanına doğrudan yazmaz",()=>{
  for(const file of [
    "src/ui/program-v5.ts",
    "src/ui/focus-v5.ts",
    "src/ui/progress-v5.ts",
    "src/ui/notes-v5.ts",
    "src/ui/settings-v5.ts"
  ]){
    const source=read(file);
    assert.doesNotMatch(source,/localStorage\.(?:setItem|removeItem|clear)/,file);
    assert.doesNotMatch(source,/indexedDB\.open|new\s+Dexie|setDoc|updateDoc/,file);
  }
});
