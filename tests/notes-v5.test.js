const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");

const root=path.resolve(__dirname,"..");
const read=file=>fs.readFileSync(path.join(root,file),"utf8");

test("Günün Notu V5 eski kayıt sözleşmesini yeni kart ve panelde korur",()=>{
  const source=read("src/ui/notes-v5.ts");
  const html=read("index.html");
  for(const id of ["fh_gunluk","fb_gunluk","journalInput"])assert.match(html,new RegExp('id="'+id+'"'));
  assert.match(html,/onclick="saveJournal\(\)"/);
  assert.match(html,/onclick="shareCard\(\)"/);
  assert.match(source,/data-v5-notes-card|v5NotesCard/);
  assert.match(source,/data-v5-notes-overlay|v5NotesOverlay/);
  assert.match(source,/GÜNÜN NOTU/);
  assert.match(source,/Son notların/);
});

test("Günün Notu V5 geçmişi yalnız okur, kayıt sistemini yeniden yazmaz",()=>{
  const source=read("src/ui/notes-v5.ts");
  assert.match(source,/YKSLegacyState\?\.readState/);
  assert.match(source,/journalEntries/);
  assert.doesNotMatch(source,/YKSLegacyState\?\.save|YKSLegacyState\.save/);
  assert.doesNotMatch(source,/localStorage\.(?:setItem|removeItem|clear)/);
  assert.doesNotMatch(source,/indexedDB\.open/);
  assert.doesNotMatch(source,/new\s+Dexie/);
  assert.doesNotMatch(source,/\.journal\s*\[/);
  assert.doesNotMatch(source,/setDoc|updateDoc|coachingShares/);
});

test("Ana Sayfa Notlarım hızlı eylemi Günün Notu panelini doğrudan açar",()=>{
  const today=read("src/ui/today-v43.ts");
  assert.match(today,/yks:open-notes/);
  assert.match(today,/import\("\.\/notes-v5"\)/);
  assert.match(today,/installNotesV5/);
  assert.match(today,/\.catch\(\(\)=>\{\}\)/);
});

test("Günün Notu V5 mobil sheet ve erişilebilir dialog sözleşmesini içerir",()=>{
  const source=read("src/ui/notes-v5.ts");
  const css=read("src/ui/notes-v5.css");
  assert.match(source,/role","dialog/);
  assert.match(source,/aria-modal/);
  assert.match(source,/Escape/);
  assert.match(css,/\.v5-notes-card/);
  assert.match(css,/\.v5-notes-sheet/);
  assert.match(css,/@media\(max-width:760px\)/);
  assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
});
