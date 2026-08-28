import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";

const organs=["heart","brain","lungs","liver","kidneys","eyeball","intestine","pancreas","skin"];
const required=["left-ventricle","mitral","hypothalamus","medulla","alveolus","diaphragm","hepatocyte","portal-vein","glomerulus","medulla","lens","retina","villus","lymph-capillary","alpha-cells","beta-cells","epidermis","sweat-gland"];

test("Biyoloji Atlası 2.0 her organ için YKS odak katmanı taşır",async()=>{
  const data=await readFile(new URL("../src/data/biology-organs.ts",import.meta.url),"utf8");
  const ui=await readFile(new URL("../src/ui/biology-atlas.ts",import.meta.url),"utf8");
  assert.match(data,/export const ORGAN_EXAM_FOCUS/);
  for(const id of organs)assert.match(data,new RegExp("\\n  "+id+":\\{summary:"),id);
  for(const id of required)assert.ok(data.includes('"'+id+'"'),id);
  assert.match(ui,/organExamFocus/);
  assert.match(ui,/YKS ÖNCELİKLİ/);
  assert.match(ui,/ÖNCE BUNLARI BİL/);
});
