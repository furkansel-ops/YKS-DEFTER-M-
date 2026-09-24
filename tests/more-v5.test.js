const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
const read=f=>fs.readFileSync(path.join(root,f),"utf8");

test("Merkez V5 ana yüzey ve bütün fiziksel alt panelleri kapsar",()=>{
  const source=read("src/ui/more-v5.ts"),html=read("index.html");
  for(const id of ["v30MoreHome","mrp_lab","mrp_kay","mrp_tak","mrp_roz","mrp_veri","mrp_ayar","v30AboutPanel"])assert.match(html,new RegExp('id="'+id+'"'));
  for(const id of ["mrp_lab","mrp_kay","mrp_tak","mrp_roz","mrp_veri","mrp_ayar","v30AboutPanel"])assert.match(source,new RegExp(id));
  assert.match(source,/label\.textContent="Merkez"/);
});
test("Merkez V5 legacy araç fonksiyonlarını veya veriyi override etmez",()=>{
  const source=read("src/ui/more-v5.ts");
  assert.doesNotMatch(source,/v30Action\s*=|setMoreTab\s*=|addBook\s*=|resetAll\s*=/);
  assert.doesNotMatch(source,/localStorage\.(?:setItem|removeItem|clear)|indexedDB\.open|new\s+Dexie|setDoc|updateDoc/);
});
test("Merkez V5 navigation lazy chunk içinden yüklenir",()=>{
  const nav=read("src/ui/navigation-v43.ts");
  assert.match(nav,/import \{installMoreV5\} from "\.\/more-v5"/);
  assert.match(nav,/installMoreV5\(\)/);
});
test("Merkez V5 mobil ve reduced-motion desteği içerir",()=>{
  const css=read("src/ui/more-v5.css");
  assert.match(css,/@media\(max-width:760px\)/);
  assert.match(css,/prefers-reduced-motion:reduce/);
});
