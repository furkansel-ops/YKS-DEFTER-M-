const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');

function runWithRandom(random){
  const source=fs.readFileSync(path.join(root,'modules/motivation-quotes-v1.js'),'utf8');
  const box={style:{},innerHTML:''};
  const context={
    window:{},S:{sozKapali:false},el:id=>id==='sozBox'?box:null,esc:x=>String(x),
    sozRand:random,gununSozu(){return '';},yeniSoz(){return false;},renderSoz(){return false;},
    infraError(){},setTimeout(fn){fn();return 1;},Math,console
  };
  vm.createContext(context);vm.runInContext(source,context,{filename:'motivation-quotes-v1.js'});
  return {context,box,source};
}

test('Günün sözü YKS ve teknik direktör havuzlarıyla sınırlıdır',()=>{
  let n=0;const {context,box}=runWithRandom(max=>(n++*37)%max);
  const meta=context.window.__YKS_MOTIVATION_QUOTES_READY__;
  assert.equal(meta.scope,'YKS+coaches');assert.ok(meta.examPool>=70);assert.ok(meta.coachPool>=10);
  const allowedCoaches=/Fatih Terim|Şenol Güneş|Sir Alex Ferguson|Jürgen Klopp|Arsène Wenger/;
  const forbiddenNames=/Einstein|Edison|Sokrates|Nietzsche|İnsan Sözü/i;
  const forbiddenTopics=/(^|[^a-zçğıöşü])aşk([^a-zçğıöşü]|$)|(^|[^a-zçğıöşü])içki([^a-zçğıöşü]|$)|(^|[^a-zçğıöşü])siyaset([^a-zçğıöşü]|$)/i;
  let sawExam=false,sawCoach=false;
  for(let i=0;i<300;i++){
    context.yeniSoz();const text=context.gununSozu();
    if(/szcat">Teknik Direktör/.test(box.innerHTML)){
      sawCoach=true;assert.match(box.innerHTML,allowedCoaches);assert.match(box.innerHTML,/class="sza"/);
    }else{
      sawExam=true;assert.match(box.innerHTML,/szcat">YKS/);assert.doesNotMatch(box.innerHTML,/class="sza"/);
    }
    assert.ok(text.length>=20);assert.doesNotMatch(box.innerHTML,forbiddenNames);assert.doesNotMatch(text,forbiddenTopics);
  }
  assert.equal(sawExam,true);assert.equal(sawCoach,true);
});

test('teknik direktör havuzu sadece seçilmiş teknik direktörleri içerir',()=>{
  const source=fs.readFileSync(path.join(root,'modules/motivation-quotes-v1.js'),'utf8');
  assert.match(source,/const EXAM_QUOTES=/);assert.match(source,/const COACH_QUOTES=/);
  assert.match(source,/Fatih Terim/);assert.match(source,/Şenol Güneş/);assert.match(source,/Sir Alex Ferguson/);
  assert.match(source,/Jürgen Klopp/);assert.match(source,/Arsène Wenger/);
  assert.doesNotMatch(source,/Thomas Edison|Albert Einstein|Marcus Aurelius|İnsan Sözü/);
});
