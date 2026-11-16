const test=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.resolve(__dirname,"..");
const read=p=>fs.readFileSync(path.join(root,p),"utf8");
const app=read("app.js");
const fn=name=>app.match(new RegExp(`function ${name}\\([^)]*\\)\\{[\\s\\S]*?\\n\\}`))[0];

function load(){
  const ctx={Math,JSON,String};vm.createContext(ctx);
  vm.runInContext([fn("simClock"),fn("simView"),fn("simJump"),fn("simSpent"),fn("simShort"),"function simFocusMin(run,now)"+app.match(/function simFocusMin\(run,now\)(\{[^\n]*\})/)[1]].join("\n"),ctx);
  return ctx;
}

test("v130 deneme modu: ekranda o anki bölümün kendi süresi; sonraki bölüme geçince sıfırdan başlar",()=>{
  const t=load(),min=60e3,t0=1e12;
  const run={min:165,total:165*60,start:t0,plan:[["Türkçe",40],["Sosyal Bilimler",25],["Temel Matematik",60],["Fen Bilimleri",40]],sec:0,secStart:t0,splits:[],warned:{}};
  let v=t.simView(run,t0+30*min);
  assert.deepEqual([v.left,v.sec.name,v.sec.left,v.sec.last],[135*60,"Türkçe",10*60,false]);
  // Türkçe 30 dakikada biter: Sosyal kendi 25 dakikasıyla başlar, Türkçe'nin kalan 10 dakikası taşınmaz
  assert.equal(t.simJump(run,run.sec+1,t0+30*min),true);
  v=t.simView(run,t0+31*min);
  assert.deepEqual([v.sec.i,v.sec.name,v.sec.elapsed,v.sec.left],[1,"Sosyal Bilimler",60,24*60]);
  assert.deepEqual(JSON.parse(JSON.stringify(run.splits)),[{name:"Türkçe",sec:30*60,plan:40}]);
  // Plan aşılınca eksi değil "fazla" olarak okunur
  v=t.simView(run,t0+60*min);assert.equal(v.sec.left,-5*60);
  t.simJump(run,run.sec+1,t0+60*min);t.simJump(run,run.sec+1,t0+120*min);
  assert.equal(t.simView(run,t0+121*min).sec.last,true);
  assert.equal(t.simJump(run,run.sec+1,t0+125*min),false,"son bölümden sonra ilerlemez");
  assert.equal(t.simView(run,t0+200*min).left,0);
  assert.equal(t.simClock(3725),"1:02:05");assert.equal(t.simClock(65),"01:05");
});

test("v130 odak süresi: geçen dakika; süre bitip açık unutulursa en fazla 15 dk fazlası",()=>{
  const t=load(),min=60e3,run={total:80*60,start:0};
  assert.equal(t.simFocusMin(run,42*min),42);
  assert.equal(t.simFocusMin(run,300*min),95);
  assert.equal(t.simView({total:600,start:0,plan:null},120e3).sec,null,"özel sürede bölüm yok");
});

test("v130 bağlantı: Odak'ta Deneme modu kartı, ekran bölüm düğmesi, süre Odak'a yazılır, yenilemede sürer",()=>{
  const html=read("index.html");
  assert.match(html,/<h2>Deneme modu<\/h2>/);assert.doesNotMatch(html,/Sınav simülasyonu/);
  assert.match(html,/<div class="simsec" id="simSec" hidden><\/div>/);
  assert.match(app,/onclick="simGoto\('\+i\+'\)"/);assert.doesNotMatch(app,/simNext|Sonraki bölüm ›/);
  assert.match(app,/S\.pomoMin\[day\]=prevTotal\+m;\n  S\.pomoSubj\[day\]\["Deneme"\]=prevSubject\+m;/);
  assert.match(app,/if\(!save\(\)\)\{ S\.pomoMin\[day\]=prevTotal;/,"kayıt başarısızsa geri alınır");
  assert.match(app,/if\(m>=1&&!confirm\("Deneme modu kapatılsın mı\?/);
  assert.match(app,/localStorage\.setItem\(SIM_KEY,JSON\.stringify\(simRun\)\)/);assert.match(app,/setTimeout\(simResume,1500\);/);
  assert.doesNotMatch(app,/simCurrentSection|simLeft|Simülasyonu başlat/);
});

test("v133 bölüm kutuları: her zaman ilk bölümden başlar, istenen bölüme geçilir, dönülen bölümün süresi üstüne eklenir",()=>{
  const t=load(),min=60e3,t0=1e12;
  const run={min:165,total:165*60,start:t0,plan:[["Türkçe",40],["Sosyal Bilimler",25],["Temel Matematik",60],["Fen Bilimleri",40]],sec:0,secStart:t0,splits:[],warned:{}};
  assert.equal(t.simView(run,t0).sec.name,"Türkçe");
  assert.equal(t.simJump(run,2,t0+30*min),true,"Türkçe'den Matematik'e atlanır");
  assert.equal(t.simJump(run,2,t0+31*min),false,"açık bölüme tekrar basmak bir şey yapmaz");
  t.simJump(run,0,t0+50*min);
  const v=t.simView(run,t0+55*min);
  assert.deepEqual([v.sec.name,v.sec.elapsed,v.sec.left],["Türkçe",35*60,5*60],"Türkçe 30 + 5 dk");
  assert.deepEqual(Array.from(t.simSpent(run,t0+55*min)),[35*60,0,20*60,0]);
  assert.deepEqual(["Türkçe","Sosyal Bilimler","Temel Matematik","Fen Bilimleri","Edebiyat-Sosyal"].map(t.simShort),["Türkçe","Sosyal","Matematik","Fen","Edebiyat-Sosyal"]);
  assert.match(app,/sec:0,secStart:now,splits:\[\]/,"yeni deneme hep ilk bölümden (TYT'de Türkçe) başlar");
});
