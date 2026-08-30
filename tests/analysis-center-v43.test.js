const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");

const root=path.resolve(__dirname,"..");
const read=file=>fs.readFileSync(path.join(root,file),"utf8");

test("v4.3 Analiz Merkezi 7 ve 30 günlük çalışma verisini mevcut analiz servislerinden birleştirir",()=>{
  const source=read("src/ui/analysis-center-v43.ts");
  assert.match(source,/__YKS_PROGRESS_ANALYSIS__/);
  assert.match(source,/__YKS_EXAM_ANALYSIS__/);
  assert.match(source,/progressApi\.analyze\(7\)/);
  assert.match(source,/progressApi\.analyze\(30\)/);
  assert.match(source,/GENERAL_EXAM_TYPES/);
  assert.match(source,/wrongTopics\.slice\(0,3\)/);
  assert.match(source,/analysis\.subjects\.slice\(0,6\)/);
  assert.match(source,/Çalışma süresi ↔ deneme başarısı/);
  assert.match(source,/yalnız kayıtlı veriden/);
});

test("v4.3 Analiz Merkezi salt okunur kalır ve Program ya da kayıt katmanını değiştirmez",()=>{
  const source=read("src/ui/analysis-center-v43.ts");
  assert.doesNotMatch(source,/localStorage/);
  assert.doesNotMatch(source,/indexedDB/);
  assert.doesNotMatch(source,/Firebase|firestore/i);
  assert.doesNotMatch(source,/YKSLegacyState/);
  assert.doesNotMatch(source,/\bsave\s*\(/);
  assert.doesNotMatch(source,/\baddToToday\s*\(/);
  assert.doesNotMatch(source,/\baddToDay\s*\(/);
  assert.doesNotMatch(source,/\.weeks\s*\[/);
  assert.doesNotMatch(source,/\.rows\s*\[/);
});

test("v4.3 Analiz Merkezi güvenli TypeScript runtime, İlerleme ekranı ve tablet erişilebilirliğiyle bağlıdır",()=>{
  const source=read("src/ui/analysis-center-v43.ts"),style=read("src/ui/analysis-center-v43.css"),main=read("src/main.ts"),safe=read("src/ui/v43-safe-runtime.ts"),progress=read("src/ui/screens/progress.ts");
  assert.match(source,/import "\.\/analysis-center-v43\.css"/);
  assert.match(source,/role","img"/);
  assert.match(source,/aria-pressed/);
  assert.match(main,/installV43SafeRuntime/);
  assert.doesNotMatch(main,/from "\.\/ui\/analysis-center-v43"/);
  assert.match(safe,/import\("\.\/analysis-center-v43"\)/);
  assert.match(safe,/installAnalysisCenterV43/);
  assert.match(safe,/v43AnalysisErrors/);
  assert.match(progress,/renderAnalysisCenterV43\(\)/);
  assert.match(style,/@media\(max-width:980px\)/);
  assert.match(style,/@media\(pointer:coarse\)/);
  assert.match(style,/@media\(prefers-reduced-motion:reduce\)/);
  assert.match(style,/min-height:44px/);
});
