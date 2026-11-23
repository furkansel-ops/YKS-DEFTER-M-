const test=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const rt=fs.readFileSync(path.join(__dirname,"..","public/student-coaching-runtime.js"),"utf8");
const pick=re=>{const m=rt.match(re);assert.ok(m,String(re));return m[0];};
const lib=vm.runInNewContext([pick(/const text=.*?;\n/),pick(/const list=.*?;\n/),pick(/const finite=.*?;\n/),pick(/const EXAM_PLAN_TYPES=.*\n/),pick(/function examPlansShare\(s\)\{.*\n/),pick(/function examPlanFromCoach\(p,plans,now\)\{.*\n/)].join("")+"({examPlansShare,examPlanFromCoach})");

test("v139 deneme takvimi koça progress içinde gider (yeni üst alan yok, kural değişmez)",()=>{
  assert.match(rt,/dayReview:\{entries:dayReviews\},examPlans:examPlansShare\(s\),weeklyReviews:weeklyReviewsShare\(s\)\},paragraphProblem:/);
  const out=lib.examPlansShare({examPlans:[{id:3,date:"2026-11-22",name:"<b>Özdebir</b>",type:"AYT"},{id:4,date:"bozuk"},{id:5,date:"2026-11-29",type:"XX"}]});
  assert.equal(JSON.stringify(out),JSON.stringify([{id:3,date:"2026-11-22",name:"<b>Özdebir</b>",type:"AYT"},{id:5,date:"2026-11-29",name:"Deneme",type:"TYT"}]));
  assert.equal(lib.examPlansShare({}).length,0);
});

test("v139 koçun planladığı deneme doğrulanır; aynısı ikinci kez eklenmez",()=>{
  const now="2026-11-16";
  const plan=lib.examPlanFromCoach({date:"2026-11-22",type:"TYT",name:"  3D TYT-4 "},[],now);
  assert.equal(plan.date,"2026-11-22");assert.equal(plan.type,"TYT");assert.equal(plan.name,"3D TYT-4");assert.ok(Number.isInteger(plan.id));
  assert.equal(lib.examPlanFromCoach({date:"2026-11-22",type:"AYT"},[],now).name,"AYT denemesi","ad boşsa türden");
  assert.equal(lib.examPlanFromCoach({date:"2026-11-22",type:"TYT",name:"3d tyt-4"},[plan],now),null,"aynı gün aynı ad");
  assert.throws(()=>lib.examPlanFromCoach({date:"2026-11-15",type:"TYT"},[],now),/tarihi/,"geçmiş gün");
  assert.throws(()=>lib.examPlanFromCoach({date:"2026-02-30",type:"TYT"},[],now),/tarihi/,"olmayan gün");
  assert.throws(()=>lib.examPlanFromCoach({date:"2026-11-22",type:"__proto__"},[],now),/türü/);
  assert.throws(()=>lib.examPlanFromCoach({date:"2026-11-22",type:"TYT"},Array.from({length:60},(_,i)=>({id:i,date:"2026-12-01",name:"D"+i})),now),/dolu/);
});

test("v139 koç eylemi coach_note/exam_plan_add olarak uygulanır ve öğrenciye bildirilir",()=>{
  assert.match(rt,/a\.type==="coach_note"&&p\.operation==="exam_plan_add"\)\{/);
  assert.match(rt,/if\(save\(\)===false\)\{s\.examPlans=plans;throw new Error\("Deneme takvime kaydedilemedi"\)\}/);
  assert.match(rt,/"Koçun Deneme takvimine deneme ekledi 📅"/);
  assert.ok(rt.indexOf('p.operation==="exam_plan_add"')<rt.indexOf('}else if(a.type==="coach_note"){'),"genel not dalından önce");
});
