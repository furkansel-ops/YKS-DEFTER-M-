const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");
const {stripTypeScriptTypes}=require("node:module");
const root=path.resolve(__dirname,"..");
const read=p=>fs.readFileSync(path.join(root,p),"utf8");

test("v41 uses one responsive optional section inside clean Today",()=>{
  const html=read("index.html"),top=read("src/ui/today-top-v33.ts");
  const module=read("src/ui/today-subjects-v41.ts"),vite=read("vite.config.mts");
  assert.match(top,/import\("\.\/today-subjects-v41"\)/);
  assert.match(vite,/"src\/ui\/today-subjects-v41\.ts"/);
  assert.doesNotMatch(module,/localStorage|setDoc\(|updateDoc\(|save\(|fetch\(|S\.pomo|innerHTML/);
  for(const id of ["todayFreshSubjects","todayFreshSubjectsBar","todayFreshSubjectsRows",
    "todayFreshSubjectsSummary","todayFreshSubjectsNote","todayFreshStatFocus",
    "todayFreshStatFocusSub","todayFreshStatQuestions","todayFreshStatQuestionsSub",
    "todayFreshStatSubjectCount","todayFreshStatSubjectCountSub"]){
    assert.equal((html.match(new RegExp('id="'+id+'"',"g"))||[]).length,1,id);
  }
  const visible=html.slice(html.indexOf('id="todayFreshStart"'),html.indexOf('<!-- Bugün v33'));
  assert.ok(visible.indexOf('id="todayFreshWorkCenter"')<visible.indexOf('id="todayFreshSubjects"'));
  assert.ok(visible.indexOf('id="todayFreshSubjects"')<visible.indexOf('id="todayFreshActivity"'));
  assert.ok(visible.indexOf('id="todayFreshActivity"')<visible.indexOf('id="todayFreshReview"'));
  assert.match(html,/#home #todayFreshStart \.today-fresh-subjects-layout/);
  assert.match(html,/@media\(max-width:600px\)/);
  assert.match(html,/\.today-fresh-subject-metrics\{grid-template-columns:repeat\(3,minmax\(0,1fr\)\)/);
});

test("v41 snapshot uses existing S and never changes records",()=>{
  const app=read("app.js");
  const from=app.indexOf("window.yksTodaySubjectSnapshot=function()");
  const until=app.indexOf("function v25StartTask()",from);
  assert.ok(from>0&&until>from);
  const code=app.slice(from,until);
  assert.doesNotMatch(code,/save\(|setDoc\(|updateDoc\(|localStorage|S\.[a-zA-Z0-9_]+\s*=/);
  const key="2026-10-14";
  const S={
    pomoMin:{[key]:150},solved:{[key]:83},target:100,
    focus:{goalMin:180},pomoSubj:{[key]:{"Matematik":60,"Fizik":40,"Kimya":0}}
  };
  const before=JSON.stringify(S),window={};
  vm.runInNewContext(code,{window,S,todayKey:()=>key,Math,Number,Object,String}, {filename:"subject-snapshot.js"});
  let result=window.yksTodaySubjectSnapshot();
  assert.equal(result.date,key);
  assert.equal(result.focusMin,150);
  assert.equal(result.solved,83);
  assert.equal(result.subjects.length,2);
  assert.equal(result.subjects[0].name,"Matematik");
  assert.equal(result.labeledMin,100);
  assert.equal(result.unassignedMin,50);
  assert.equal(result.basisMin,150);
  assert.equal(result.hasMismatch,false);
  assert.equal(result.focusGoal,180);
  assert.equal(result.questionGoal,100);
  assert.equal(JSON.stringify(S),before,"source must remain untouched");
  S.pomoMin[key]=50;
  result=window.yksTodaySubjectSnapshot();
  assert.equal(result.hasMismatch,true);
  assert.equal(result.unassignedMin,0);
  assert.equal(result.basisMin,100);
  S.pomoSubj[key]={};S.pomoMin[key]=0;
  result=window.yksTodaySubjectSnapshot();
  assert.equal(result.subjects.length,0);
  assert.equal(result.basisMin,0);
});

test("v41 renders true shares, handles empty data and updates after save",()=>{
  class Fake{
    constructor(name=""){this.name=name;this.className="";this.textContent="";
      this.dataset={};this.style={};this.children=[];this.attributes={};}
    append(...children){this.children.push(...children)}
    replaceChildren(...children){this.children=[...children]}
    setAttribute(name,value){this.attributes[name]=String(value)}
  }
  const ids=["todayFreshSubjects","todayFreshSubjectsBar","todayFreshSubjectsRows",
    "todayFreshSubjectsSummary","todayFreshSubjectsNote","todayFreshStatFocus",
    "todayFreshStatFocusSub","todayFreshStatQuestions","todayFreshStatQuestionsSub",
    "todayFreshStatSubjectCount","todayFreshStatSubjectCountSub"];
  const nodes=new Map(ids.map(id=>[id,new Fake(id)]));
  const callbacks={};
  let data={
    date:"2026-10-14",focusMin:0,solved:0,focusGoal:120,questionGoal:100,
    subjects:[],labeledMin:0,unassignedMin:0,basisMin:0,hasMismatch:false
  };
  const window={
    yksTodaySubjectSnapshot:()=>data,
    addEventListener:(name,fn)=>(callbacks[name]??=[]).push(fn)
  };
  const document={
    getElementById:id=>nodes.get(id)||null,
    createElement:tag=>new Fake(tag),
    addEventListener:(name,fn)=>(callbacks[name]??=[]).push(fn),
    visibilityState:"visible"
  };
  const code=stripTypeScriptTypes(read("src/ui/today-subjects-v41.ts"))
    .replace("export function installTodaySubjectsV41","function installTodaySubjectsV41");
  const ctx=vm.createContext({window,document,console});
  vm.runInContext(code+"\nthis.install=installTodaySubjectsV41;",ctx);
  assert.equal(ctx.install().installed,true);
  assert.equal(nodes.get("todayFreshSubjectsBar").children.length,0);
  assert.equal(nodes.get("todayFreshSubjectsRows").children.length,1);
  assert.equal(nodes.get("todayFreshStatQuestions").textContent,"0");
  data={date:"2026-10-14",focusMin:150,solved:80,focusGoal:180,questionGoal:100,
    subjects:[{name:"Matematik",min:60},{name:"Fizik",min:40}],
    labeledMin:100,unassignedMin:50,basisMin:150,hasMismatch:false};
  callbacks["yks:data-changed"][0]();
  assert.equal(nodes.get("todayFreshStatFocus").textContent,"2 sa 30 dk");
  assert.equal(nodes.get("todayFreshStatFocusSub").textContent,"%83 odak hedefi");
  assert.equal(nodes.get("todayFreshStatQuestions").textContent,"80");
  assert.equal(nodes.get("todayFreshStatQuestionsSub").textContent,"%80 soru hedefi");
  assert.equal(nodes.get("todayFreshStatSubjectCount").textContent,"2");
  assert.equal(nodes.get("todayFreshSubjectsBar").children.length,3,"include unassigned time");
  assert.equal(nodes.get("todayFreshSubjectsBar").children[0].style.width,"40.000%");
  assert.equal(nodes.get("todayFreshSubjectsRows").children[2].children[1].textContent,"Ders belirtilmedi");
  assert.equal(nodes.get("todayFreshSubjectsRows").children[2].children[2].textContent,"50 dk");
  assert.equal(nodes.get("todayFreshSubjectsNote").textContent.includes("50 dk"),true);
  assert.equal(ctx.install().installed,true);
  assert.equal(callbacks["yks:data-changed"].length,1);
});
