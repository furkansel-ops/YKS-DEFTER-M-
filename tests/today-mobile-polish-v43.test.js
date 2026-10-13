const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
const read=file=>fs.readFileSync(path.join(root,file),"utf8");
const home=()=>read("index.html").split('id="todayFreshStart"')[1]?.split("<!-- Bugün v33")[0]||"";

test("v43: secondary sections are accessible collapsed summaries, not removed content",()=>{
  const html=home();
  for(const [id,heading,body] of [
    ["todayFreshSubjects","today-fresh-subjects-heading","todayFreshSubjectsRows"],
    ["todayFreshInsights","today-fresh-insights-heading","todayFreshDueList"],
    ["todayFreshActivity","today-fresh-activity-heading","todayFreshWeekBars"]
  ]){
    const start=html.indexOf('<details id="'+id+'"');
    assert.ok(start>=0, id+" should be an accessible details");
    const tail=html.slice(start),end=tail.indexOf("</details>");
    assert.ok(end>0,id+" should close");
    const fragment=tail.slice(0,end);
    assert.match(fragment,new RegExp('<summary class="'+heading+'">'));
    assert.ok(fragment.includes('id="'+body+'"'),id+" preserves the existing data target");
    assert.ok(fragment.indexOf("</summary>")<fragment.indexOf('id="'+body+'"'),
      "chart/list is inside expanded content, not clickable summary");
    assert.equal(fragment.match(/<summary\b/g)?.length,1);
    assert.equal(fragment.match(/<button[^>]*id="todayFreshInsightsAll"/g)?.length||0,
      id==="todayFreshInsights"?1:0);
  }
  assert.equal((html.match(/id="todayFreshInsightsAll"/g)||[]).length,1);
  const insight=html.slice(html.indexOf('<details id="todayFreshInsights"'),
    html.indexOf('</details>',html.indexOf('<details id="todayFreshInsights"')));
  const firstEnd=insight.indexOf("</summary>");
  assert.ok(insight.indexOf('id="todayFreshDueCount"')<firstEnd);
  assert.ok(insight.indexOf('id="todayFreshGapCount"')<firstEnd);
  assert.ok(insight.indexOf('id="todayFreshInsightsAll"')>firstEnd,
    "navigation button must stay outside native summary");
  for(const id of ["todayFreshWorkCenter","todayFreshFocusOpen","todayFreshNextStart",
    "todayFreshNextDone","todayFreshTaskList","todayFreshReviews","todayFreshReview",
    "todayFreshReflectionSave","todayFreshStatFocus","todayFreshStatQuestions"]){
    assert.ok(html.includes('id="'+id+'"'),id+" remains functional");
  }
  assert.ok(html.indexOf('id="todayFreshWorkCenter"')<html.indexOf('id="todayFreshSubjects"'),
    "work area stays visible before collapsible stats");
});

test("v43: no new runtime or storage owner; compact mobile CSS is scoped and bundled",()=>{
  const css=read("src/ui/today-mobile-polish-v43.css");
  const main=read("src/main.ts");
  const currentHtml=read("index.html");
  assert.match(main,/import "\.\/ui\/today-mobile-polish-v43\.css"/);
  assert.match(css,/@media\(max-width:600px\)/);
  assert.match(css,/@media\(max-width:380px\)/);
  assert.match(css,/\.today-fresh-stats\{grid-template-columns:repeat\(4,minmax\(0,1fr\)\)/);
  assert.match(css,/\.today-fresh-task-list\{grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
  assert.match(css,/\.today-fresh-fold>summary:focus-visible/);
  assert.match(css,/prefers-reduced-motion:reduce/);
  assert.match(css,/\.today-fresh-progress\{order:-1/);
  assert.match(css,/\.today-fresh-insights\{order:4/);
  assert.match(css,/\.today-fresh-subjects\{order:5/);
  assert.doesNotMatch(css,/display:none.*today-fresh-insights|overflow-y:auto|position:fixed|!important/);
  for(const selector of css.match(/[^\n{}]+\{/g)||[]){
    if(/@media|@supports|@container|\/\*/.test(selector))continue;
    assert.ok(selector.includes("#todayFreshStart")||selector.includes(":root"),
      "all new layout rules remain scoped to Today: "+selector);
  }
  assert.ok(Buffer.byteLength(currentHtml,"utf8")<=180000,
    "index.html must remain inside hard source budget");
  assert.equal((home().match(/<details id="todayFreshReview"/g)||[]).length,1,
    "original day-review save and coach sync remain intact");
});
