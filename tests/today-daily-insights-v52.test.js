const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");
const {stripTypeScriptTypes}=require("node:module");
const root=path.resolve(__dirname,"..");
const read=p=>fs.readFileSync(path.join(root,p),"utf8");

function setup(){
  class Fake{
    constructor(tag="div"){
      this.tag=tag;this.className="";this.dataset={};this.attrs={};
      this.listeners={};this.textContent="";this.children=[];this.open=false;
      this.replaceCount=0;this.scrollCount=0;
      this.style={setProperty(){}};
      this.classList={contains:()=>true};
    }
    append(...nodes){this.children.push(...nodes)}
    replaceChildren(...nodes){this.children=[...nodes];this.replaceCount++}
    addEventListener(evt,fn){(this.listeners[evt]??=[]).push(fn)}
    fire(evt){for(const fn of this.listeners[evt]||[])fn()}
    setAttribute(k,v){this.attrs[k]=String(v)}
    scrollIntoView(){this.scrollCount++}
  }
  const details=new Fake("details");
  const insightsCard=new Fake("details");
  const content=new Fake(),headline=new Fake(),home=new Fake();
  const map=new Map([["todayFreshDailyProgress",details],["todayDailyProgressContent",content],
    ["todayDailyProgressHeadline",headline],["todayFreshInsights",insightsCard],["home",home]]);
  const listeners={};
  const document={getElementById:id=>map.get(id)||null,createElement:tag=>new Fake(tag),
    visibilityState:"visible",addEventListener:(n,fn)=>{(listeners[n]??=[]).push(fn)}};
  const daily={date:"2026-10-14",focusMin:120,focusGoal:180,questions:25,questionGoal:50,
    tasks:4,done:2,subjects:[{name:"Matematik",min:120}],unassignedMin:0,
    hasMismatch:false,latest:null};
  const analysis={date:"2026-10-14",dueCount:2,overdueCount:1,
    due:[{key:"t",exam:"TYT",subj:"Matematik",topic:"Problemler",gi:0,gap:3,late:2}],
    tracker:{total:4,open:2,working:1,verified:1,rows:[
      {exam:"TYT",subj:"Matematik",topic:"Problemler",state:"working",wrong:5},
      {exam:"TYT",subj:"Fizik",topic:"Hareket",state:"verified",wrong:1}
    ]}};
  let reads=0,focusReads=0,navigation=[],opened=null;
  const window={yksTodayDailyProgressSnapshot:()=>{focusReads++;return daily},
    yksTodayInsightsSnapshot:()=>{reads++;return analysis},
    yksTodayInsightsOpenTopic:(...args)=>{opened=args;return true},
    go:name=>navigation.push(name),addEventListener:(n,fn)=>{(listeners[n]??=[]).push(fn)}};
  const script=stripTypeScriptTypes(read("src/ui/today-daily-progress-v48.ts")
      .replace('import "./today-daily-progress-v48.css";',""))
    .replace(/export function /g,"function ");
  const ctx=vm.createContext({window,document,console,Math,Number,String,JSON});
  vm.runInContext(script+"\nthis.install=installTodayDailyProgressV48;",ctx);
  return {ctx,details,insightsCard,content,headline,listeners,window,daily,analysis,
    get reads(){return reads},get focusReads(){return focusReads},
    get navigation(){return navigation},get opened(){return opened}};
}
function walk(node){return[node,...(node?.children||[]).flatMap(walk)]}
function byClass(node,name){return walk(node).find(x=>x.className===name)}
function allClass(node,name){return walk(node).filter(x=>x.className===name)}
test("v52 avoids 90-day analysis while summary remains closed; no new focus/review writer",()=>{
  const h=setup();
  assert.equal(h.ctx.install().installed,true);
  assert.equal(h.reads,0,"closed daily card must not invoke 90-day analysis");
  assert.equal(h.content.replaceCount,0);
  assert.match(h.headline.textContent,/2\/4 görev/);
  h.details.open=true;h.details.fire("toggle");
  assert.equal(h.reads,1);
  assert.equal(h.content.children.length,2);
  assert.equal(allClass(h.content,"today-daily-insight-stat").length,3);
  const code=read("src/ui/today-daily-progress-v48.ts");
  assert.doesNotMatch(code,/setDoc\(|updateDoc\(|localStorage|save\(|S\.pomoMin|S\.wrongLog|S\.topics|setInterval/);
  assert.equal(h.ctx.install().installed,true);
  assert.equal(h.listeners["yks:data-changed"].length,1);
});
test("v52 shows due/overdue, open+working gaps and verified evidence without made-up completion",()=>{
  const h=setup();h.details.open=true;h.ctx.install();
  const stats=allClass(h.content,"today-daily-insight-stat");
  const numbers=stats.map(x=>x.children[1].textContent);
  assert.deepEqual(numbers,["2","3","1"]);
  assert.match(stats[0].children[2].textContent,/1 gecikmiş/);
  assert.match(stats[1].children[2].textContent,/1 üzerinde çalışılıyor/);
  const box=byClass(h.content,"today-daily-insights");
  const text=walk(box).map(x=>x.textContent||"").join(" ");
  assert.match(text,/Sıradaki tekrar: Matematik · Problemler · 3\. gün · 2 gün gecikmiş/);
  assert.match(text,/Takip edilen eksik: Matematik · Problemler · 5 kayıtlı yanlış/);
  assert.match(text,/kesin ustalık anlamına gelmez/);
  assert.equal(h.daily.focusMin,120);
});
test("v52 action opens the existing reviews card, and existing topic API without fake completion",()=>{
  const h=setup();h.details.open=true;h.ctx.install();
  const actions=byClass(h.content,"today-daily-insight-actions");
  assert.equal(actions.children.length,2);
  actions.children[0].fire("click");
  assert.equal(h.insightsCard.open,true);
  assert.equal(h.insightsCard.scrollCount,1);
  actions.children[1].fire("click");
  assert.deepEqual(h.opened,["TYT","Matematik","Problemler"]);
  assert.deepEqual(h.navigation,[]);
  assert.equal(h.analysis.dueCount,2,"no review marked done through summary shortcut");
});
test("v52 updates on real data changes, does not rerender identical payload or alter 120min study",()=>{
  const h=setup();h.details.open=true;h.ctx.install();
  const rendered=h.content.replaceCount;
  h.listeners["yks:data-changed"][0]();
  assert.equal(h.content.replaceCount,rendered);
  h.analysis.dueCount=1;
  h.analysis.overdueCount=0;
  h.analysis.tracker.open=0;
  h.analysis.tracker.verified=3;
  h.listeners["yks:data-changed"][0]();
  assert.equal(h.content.replaceCount,rendered+1);
  assert.deepEqual(allClass(h.content,"today-daily-insight-stat").map(x=>x.children[1].textContent),["1","1","3"]);
  assert.equal(h.daily.focusMin,120);
  h.details.open=false;
  const reads=h.reads;
  h.analysis.dueCount=0;h.listeners["yks:data-changed"][0]();
  assert.equal(h.reads,reads,"closed summary skips expensive gap snapshot");
  assert.equal(h.content.replaceCount,rendered+1);
});
test("v52 missing source is explicitly unknown rather than falsely stating zero gaps; styles adapt to mobile",()=>{
  const h=setup();delete h.window.yksTodayInsightsSnapshot;
  h.details.open=true;h.ctx.install();
  assert.equal(allClass(h.content,"today-daily-insight-stat").length,0);
  assert.match(walk(h.content).map(x=>x.textContent).join(" "),/verileri henüz hazır değil/);
  const actions=byClass(h.content,"today-daily-insight-actions");
  assert.equal(actions.children.length,1);
  actions.children[0].fire("click");
  assert.equal(h.insightsCard.open,true);
  const css=read("src/ui/today-daily-progress-v48.css");
  assert.match(css,/\.today-daily-insights\{/);
  assert.match(css,/@media\(max-width:350px\)/);
  assert.match(css,/var\(--rb-ink/);
  assert.doesNotMatch(css,/\.today-daily-insights[^{]*\{[^}]*color:#[a-zA-Z0-9]+/);
});
