const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");
const {pathToFileURL}=require("node:url");
const root=path.resolve(__dirname,"..");

const dateUrl=pathToFileURL(path.join(root,"src/services/date-service.ts")).href;
const numberUrl=pathToFileURL(path.join(root,"src/services/number-service.ts")).href;
const formatUrl=pathToFileURL(path.join(root,"src/services/format-service.ts")).href;

test("TypeScript tarih servisi takvim sınırlarını doğru işler",async()=>{
  const dates=await import(dateUrl);
  assert.equal(dates.dateKey(new Date(2026,7,25,23,30)),"2026-08-25");
  assert.equal(dates.isValidDateKey("2028-02-29"),true);assert.equal(dates.isValidDateKey("2027-02-29"),false);assert.equal(dates.isValidDateKey("1999-12-31"),false);
  assert.equal(dates.addDaysToKey("2026-12-31",1),"2027-01-01");assert.equal(dates.addDaysToKey("2028-03-01",-1),"2028-02-29");
  assert.equal(dates.dateKey(dates.mondayFor(new Date(2026,7,30,18,45))),"2026-08-24");
  assert.equal(dates.daysBetweenKeys("2026-08-24","2026-09-02"),9);
  assert.equal(dates.daysUntilKey("2026-08-30",new Date(2026,7,25,22,15)),5);
});

test("TypeScript sayı ve biçimlendirme servisleri beklenen sonuçları üretir",async()=>{
  const numbers=await import(numberUrl),format=await import(formatUrl);
  assert.equal(numbers.examNet(30,4),29);assert.equal(numbers.examNet(17,3),16.25);assert.equal(numbers.round2(12.345),12.35);
  assert.equal(numbers.sumNumericValues({a:10,b:"2.5",c:null,d:"bozuk"}),12.5);
  assert.equal(format.formatHoursMinutes(5),"5 dk");assert.equal(format.formatHoursMinutes(125),"2 sa 5 dk");
  assert.equal(format.escapeHtml('<b title="x">Furkan & YKS</b>'),"&lt;b title=&quot;x&quot;&gt;Furkan &amp; YKS&lt;/b&gt;");
  assert.equal(format.stableHue("Matematik"),format.stableHue("Matematik"));assert.ok(format.stableHue("Matematik")>=0&&format.stableHue("Matematik")<360);
});

test("TypeScript servisleri eski JavaScript yardımcılarıyla aynı sonucu verir",async()=>{
  const app=fs.readFileSync(path.join(root,"app.js"),"utf8"),match=app.match(/function keyOf\(d\)[\s\S]*?function hueOf\(str\)\{[^\n]+\}/),diff=app.match(/function diffKeys\(a,b\)\{[^\n]+\}/);assert.ok(match);assert.ok(diff);
  const context={Date,Math,Object,String,Number,RegExp};vm.runInNewContext(`${match[0]};${diff[0]};this.legacy={keyOf,validDateKey,parseKey,addDaysKey,dowOf,mondayOf,net,r2,daysUntil,fmtHM,sumVals,esc,hueOf,diffKeys};`,context);
  const legacy=context.legacy,dates=await import(dateUrl),numbers=await import(numberUrl),format=await import(formatUrl),samples=[new Date(2026,0,1),new Date(2028,1,29),new Date(2030,11,31)];
  for(const date of samples){assert.equal(dates.dateKey(date),legacy.keyOf(date));assert.equal(dates.mondayFirstDayIndex(date),legacy.dowOf(date));assert.equal(dates.dateKey(dates.mondayFor(date)),legacy.keyOf(legacy.mondayOf(date)));}
  for(const key of ["2026-01-01","2028-02-29","2100-12-31","2027-02-29"]){assert.equal(dates.isValidDateKey(key),legacy.validDateKey(key));assert.equal(dates.addDaysToKey(key,7),legacy.addDaysKey(key,7));}
  for(const [correct,wrong] of [[40,4],[17,3],[0,0]])assert.equal(numbers.examNet(correct,wrong),legacy.net(correct,wrong));
  for(const value of [0,1.234,99.999,-3.456])assert.equal(numbers.round2(value),legacy.r2(value));
  for(const minutes of [0,5,60,125,1440])assert.equal(format.formatHoursMinutes(minutes),legacy.fmtHM(minutes));
  for(const value of [null,"Furkan & YKS",'<b title="x">'])assert.equal(format.escapeHtml(value),legacy.esc(value));
  assert.equal(numbers.sumNumericValues({a:2,b:"3",c:null}),legacy.sumVals({a:2,b:"3",c:null}));assert.equal(format.stableHue("Matematik"),legacy.hueOf("Matematik"));
  assert.equal(dates.daysBetweenKeys("2026-08-20","2026-08-25"),legacy.diffKeys("2026-08-20","2026-08-25"));
});
