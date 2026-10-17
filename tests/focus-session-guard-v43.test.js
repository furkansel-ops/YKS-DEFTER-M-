const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");

const guard=()=>fs.readFileSync(path.join(root,"src/ui/focus-session-guard-v43.ts"),"utf8");
const css=()=>fs.readFileSync(path.join(root,"src/ui/focus-session-guard-v43.css"),"utf8");

test("Sayaç ve Kronometre hazırlık ekranı durur ancak ders seçimi zorunlu değildir",()=>{
  const source=guard(),html=fs.readFileSync(path.join(root,"index.html"),"utf8");
  assert.match(html,/v29-session-setup/);assert.match(html,/Oturumu hazırla/);assert.match(html,/id="pomoSubjPick"/);
  assert.match(source,/togglePomo/);assert.match(source,/swToggle/);assert.match(source,/setPomoSubject/);
  assert.match(source,/data-run/);assert.match(source,/!=="idle"/);assert.match(source,/data-phase/);assert.match(source,/!=="work"/);
  assert.match(source,/Genel Çalışma/);assert.doesNotMatch(source,/requestPreparation/);
});

test("ders seçmeden Başlat doğrudan çalışır ve süre Genel Çalışma olarak etiketlenir",()=>{
  const source=guard();
  assert.match(source,/const GENERAL_SUBJECT="Genel Çalışma"/);
  assert.match(source,/if\(!subjectConfirmed\)\{/);
  assert.match(source,/originalSetSubject\?\.\(GENERAL_SUBJECT\)/);
  assert.match(source,/legacy\("setPomoTask"\)\?\.\(""\)/);
  assert.match(source,/return original\(\.\.\.args\)/);
  assert.match(source,/subjectConfirmed=!!chosen&&chosen!==GENERAL_SUBJECT/);
});

test("duraklatılmış oturum, mola ve önceden hazırlanmış görev başlangıçları gereksiz seçim kapısına takılmaz",()=>{
  const source=guard();
  assert.match(source,/if\(\(card\.getAttribute\("data-run"\)\|\|"idle"\)!=="idle"\)return false/);
  assert.match(source,/mode==="pomo".*data-phase.*!=="work"/s);
  assert.doesNotMatch(source,/\.swStart\s*=/);assert.doesNotMatch(source,/\.startPomo\s*=/);
});

test("odak başlangıç kapısı veri ve Program mantığına yazmaz; güvenli v4.3 runtime tarafından yüklenir",()=>{
  const source=guard(),entry=fs.readFileSync(path.join(root,"src/main.ts"),"utf8"),safe=fs.readFileSync(path.join(root,"src/ui/v43-safe-runtime.ts"),"utf8"),release=fs.readFileSync(path.join(root,"src/release/release.ts"),"utf8"),style=css();
  assert.doesNotMatch(source,/\bsave\s*\(/);assert.doesNotMatch(source,/localStorage\.(?:setItem|removeItem|clear)/);assert.doesNotMatch(source,/__YKS_DATA__|\.weeks\[|\.rows\[/);
  assert.match(source,/__YKS_FOCUS_SESSION_GUARD_V43__/);
  assert.match(entry,/installV43SafeRuntime/);assert.doesNotMatch(entry,/from "\.\/ui\/focus-session-guard-v43"/);
  assert.match(safe,/import\("\.\/focus-session-guard-v43"\)/);assert.match(safe,/v43FocusSessionGuardErrors/);
  assert.match(release,/v43-focus-session-guard/);
  assert.match(style,/@media \(pointer:coarse\)/);assert.match(style,/@media \(prefers-reduced-motion:reduce\)/);
});
