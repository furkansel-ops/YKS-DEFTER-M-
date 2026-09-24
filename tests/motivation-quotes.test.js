const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');

function runWithRandom(random){
  const source=fs.readFileSync(path.join(root,'modules/motivation-quotes-v1.js'),'utf8');
  const box={style:{},innerHTML:'',dataset:{},attrs:{},setAttribute(name,value){this.attrs[name]=String(value);}};
  const context={
    window:{},S:{sozKapali:false},el:id=>id==='sozBox'?box:null,esc:x=>String(x),
    sozRand:random,gununSozu(){return '';},yeniSoz(){return false;},renderSoz(){return false;},
    infraError(){},setTimeout(fn){fn();return 1;},Math,console
  };
  vm.createContext(context);vm.runInContext(source,context,{filename:'motivation-quotes-v1.js'});
  return {context,box,source};
}

test('Günün sözü yalnızca YKS, teknik direktör ve futbolcu havuzlarıyla sınırlıdır',()=>{
  let n=0;const {context,box}=runWithRandom(max=>(n++*37)%max);
  const meta=context.window.__YKS_MOTIVATION_QUOTES_READY__;
  assert.equal(meta.scope,'YKS+football');assert.equal(meta.style,'v2');assert.equal(meta.version,'2.3.0');
  assert.ok(meta.examPool>=70);assert.ok(meta.coachPool>=10);assert.ok(meta.playerPool>=8);

  const allowedCoaches=/Fatih Terim|Şenol Güneş|Sir Alex Ferguson|Jürgen Klopp|Arsène Wenger|Pep Guardiola|Carlo Ancelotti/;
  const allowedPlayers=/Lionel Messi|Cristiano Ronaldo|Luka Modrić|Andrés Iniesta|Mohamed Salah|Ferran Torres/;
  const forbiddenNames=/Einstein|Edison|Sokrates|Nietzsche|Michael Jordan|Kobe Bryant|İnsan Sözü/i;
  const forbiddenTopics=/(^|[^a-zçğıöşü])aşk([^a-zçğıöşü]|$)|(^|[^a-zçğıöşü])içki([^a-zçğıöşü]|$)|(^|[^a-zçğıöşü])siyaset([^a-zçğıöşü]|$)/i;

  let sawExam=false,sawCoach=false,sawPlayer=false;
  for(let i=0;i<500;i++){
    context.yeniSoz();const text=context.gununSozu();
    assert.match(box.innerHTML,/aria-live="polite"/);assert.equal(box.attrs.role,'group');

    if(/szcat">Teknik Direktör/.test(box.innerHTML)){
      sawCoach=true;assert.equal(box.dataset.quoteType,'coach');
      assert.equal(box.attrs['aria-label'],'Teknik direktör motivasyon sözü');
      assert.match(box.innerHTML,allowedCoaches);assert.match(box.innerHTML,/class="sza"/);
    }else if(/szcat">Futbolcu/.test(box.innerHTML)){
      sawPlayer=true;assert.equal(box.dataset.quoteType,'player');
      assert.equal(box.attrs['aria-label'],'Futbolcu motivasyon sözü');
      assert.match(box.innerHTML,allowedPlayers);assert.match(box.innerHTML,/class="sza"/);
    }else{
      sawExam=true;assert.equal(box.dataset.quoteType,'exam');
      assert.equal(box.attrs['aria-label'],'YKS çalışma motivasyon sözü');
      assert.match(box.innerHTML,/szcat">YKS/);assert.doesNotMatch(box.innerHTML,/class="sza"/);
    }

    assert.ok(text.length>=20);
    assert.doesNotMatch(box.innerHTML,forbiddenNames);
    assert.doesNotMatch(text,forbiddenTopics);
  }
  assert.equal(sawExam,true);assert.equal(sawCoach,true);assert.equal(sawPlayer,true);
});

test('futbol havuzu yalnızca teknik direktörler ve futbolculardan oluşur',()=>{
  const source=fs.readFileSync(path.join(root,'modules/motivation-quotes-v1.js'),'utf8');
  assert.match(source,/const EXAM_QUOTES=/);assert.match(source,/const COACH_QUOTES=/);assert.match(source,/const PLAYER_QUOTES=/);
  assert.match(source,/Pep Guardiola/);assert.match(source,/Carlo Ancelotti/);
  assert.match(source,/Lionel Messi/);assert.match(source,/Cristiano Ronaldo/);assert.match(source,/Luka Modrić/);
  assert.match(source,/Andrés Iniesta/);assert.match(source,/Mohamed Salah/);
  assert.doesNotMatch(source,/Thomas Edison|Albert Einstein|Marcus Aurelius|Michael Jordan|Kobe Bryant|İnsan Sözü/);
});

test('motivasyon kartı kategori, mobil ve erişilebilirlik durumlarını kapsar',()=>{
  const css=fs.readFileSync(path.join(root,'modules/motivation-quotes-v2.css'),'utf8');
  const stability=fs.readFileSync(path.join(root,'modules/stability.js'),'utf8');
  assert.match(css,/data-quote-type="coach"/);assert.match(css,/data-quote-type="player"/);assert.match(css,/focus-visible/);
  assert.match(css,/@media \(max-width:759px\)/);assert.match(css,/prefers-reduced-motion/);
  assert.match(stability,/motivation-quotes-v1\.js\?v=4\.1\.0-r3/);
});
