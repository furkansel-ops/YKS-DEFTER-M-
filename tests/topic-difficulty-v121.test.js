const test=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path");

const app=fs.readFileSync(path.resolve(__dirname,"..","app.js"),"utf8");

test("v121 zorluk: yalnız 1-3 saklanır, aynı seçime basmak etiketi kaldırır",()=>{
  const DIFF_LABEL=["","Kolay","Orta","Zor"];
  const src=app.match(/function setTopicDiff\(key,d\)\{[^\n]+/)[0];
  const S={topics:{a:{st:2,conf:3,ts:null,rev:[]}}},calls=[];
  const setTopicDiff=new Function("S","save","renderSubjects","renderTopicDetail","v26TopicOpen","DIFF_LABEL",src+";return setTopicDiff;")(S,()=>calls.push("save"),()=>calls.push("list"),()=>calls.push("detail"),{key:"a"},DIFF_LABEL);
  assert.equal(setTopicDiff("a",3),true);assert.equal(S.topics.a.df,3);assert.equal(S.topics.a.st,2,"diğer alanlar korunur");
  assert.deepEqual(calls,["save","list","detail"]);
  assert.equal(setTopicDiff("a",3),true);assert.equal("df" in S.topics.a,false,"ikinci basış kaldırır");
  assert.equal(setTopicDiff("a",5),false);assert.equal(setTopicDiff("a","2"),false);
  assert.equal(setTopicDiff("yeni",1),true);assert.equal(S.topics.yeni.df,1);
});

test("v121 bağlantı: içe aktarım doğrular; detay ve konu satırı etiketi gösterir",()=>{
  assert.match(app,/if\(!\[1,2,3\]\.includes\(t\.df\)\)delete t\.df;/);
  assert.match(app,/aria-pressed="'\+\(t\.df===d\)\+'" onclick="setTopicDiff\(/);
  assert.match(app,/\(t\.df\?' · <span class="topic-diff d'\+t\.df\+'">'\+DIFF_LABEL\[t\.df\]\+'<\/span>':''\)/);
  assert.match(app,/'\+REVIEW_GAPS\.join\('–'\)\+' tekrar · '/,"detay başlığı ayarlanan aralıkları yazar");
  assert.doesNotMatch(app,/v4TopicGoalDate|v26StartTopic/,"konu detayında bitiş hedefi ve kronometre düğmesi yok");
});
