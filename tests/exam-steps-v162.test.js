const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");
const {stripTypeScriptTypes}=require("node:module");
const root=path.resolve(__dirname,"..");
const read=p=>fs.readFileSync(path.join(root,p),"utf8");
const source=read("src/ui/exam-steps-v162.ts");

function load(){
  const code=stripTypeScriptTypes(source,{mode:"strip"}).replace(/^import[^\n]*\n/gm,"").replace(/^export /gm,"");
  const context={window:{},document:{},console,setTimeout,Math,Number,String,Array,Object,Set};
  vm.createContext(context);
  vm.runInContext(`${code}\n;globalThis.__t={buildSteps,groupInputs,TYT_LESSONS,net};`,context);
  return context.__t;
}
const TYT_TABLE=[{name:"Türkçe",cap:40},{name:"Sosyal Bilimler",cap:20},{name:"Temel Matematik",cap:40},{name:"Fen Bilimleri",cap:20}];

test("v162 TYT dersleri istenen sırada ve doğru grup satırına bağlı",()=>{
  const {buildSteps}=load(),steps=buildSteps("TYT",TYT_TABLE);
  assert.deepEqual(Array.from(steps,s=>s.name),["Türkçe","Tarih","Coğrafya","Felsefe","Din Kültürü","Matematik","Geometri","Fizik","Kimya","Biyoloji"]);
  assert.deepEqual(Array.from(steps,s=>s.row),[0,1,1,1,1,2,2,3,3,3]);
  const caps=g=>steps.filter(s=>s.row===g).reduce((a,s)=>a+s.cap,0);
  assert.deepEqual([0,1,2,3].map(caps),[40,20,40,20],"ders soru sayıları grup toplamına eşit");
});

test("v162 AYT gizli alan satırlarını atlar; YDT ve Branş adımsız",()=>{
  const {buildSteps}=load();
  const steps=buildSteps("AYT",[{name:"Matematik",cap:40},{name:"Fizik",cap:14},{name:"Edebiyat",cap:24,hidden:true}]);
  assert.deepEqual(Array.from(steps,s=>[s.name,s.row,s.cap]),[["Matematik",0,40],["Fizik",1,14]]);
  assert.equal(buildSteps("YDT",[{name:"Yabancı Dil",cap:80}]).length,0);
  assert.equal(buildSteps("BRANS",[]).length,0);
});

test("v162 grup satırı: ders toplamları, boş = grup sorusu − D − Y, hiç girilmediyse boş",()=>{
  const {groupInputs,TYT_LESSONS}=load(),sosyal=TYT_LESSONS.filter(l=>l.group==="Sosyal Bilimler");
  assert.deepEqual({...groupInputs(sosyal,{},20)},{d:"",y:"",b:""});
  assert.deepEqual({...groupInputs(sosyal,{Tarih:{d:"4",y:"1"},Coğrafya:{d:"3",y:""},Felsefe:{d:"",y:""}},20)},{d:"7",y:"1",b:"12"});
  assert.deepEqual({...groupInputs(sosyal,{Tarih:{d:"15",y:"8"}},20)},{d:"15",y:"8",b:"0"},"taşma eski doğrulamaya bırakılır, boş eksiye düşmez");
});

test("v162 kurulum deneme ekranından sonra, kayıt eski addDeneme ile",()=>{
  const shell=read("src/ui/refined-shell.ts");
  assert.ok(shell.indexOf("installExamStepsV162()")>shell.indexOf("installExamHubV73()"));
  assert.match(source,/wrap\("addDeneme"/);
  assert.doesNotMatch(source,/denemeler\.push|subjectResults/,"kayıt biçimine dokunulmaz");
});
