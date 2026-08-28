const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');

test('Günün sözü yalnız motivasyon havuzundan seçim yapar',()=>{
  const source=fs.readFileSync(path.join(root,'modules/motivation-quotes-v1.js'),'utf8');
  const box={style:{},innerHTML:''};
  const context={
    window:{},
    SOZLER:[
      {q:'Çok çalışmanın yerini hiçbir şey tutamaz.',a:'Thomas Edison',c:'Bilim'},
      {q:'Aşk ve evlilik üzerine rastgele bir söz.',a:'Test Kişisi',c:'Düşünce'},
      {q:'Çok çalış ama bu eski rastgele havuzdan.',a:'Rastgele Yazar',c:'İnsan Sözü'}
    ],
    sozRand:()=>0,
    sozRecentAuthors:[],
    sozCurrentIndex:-1,
    sozAuthorKey:x=>String((x&&x.a)||'').toLocaleLowerCase('tr-TR'),
    sozRememberIndex(){},
    sozRandomIndex(){return -1;},sozSetRandom(){return -1;},sozIndex(){return -1;},
    gununSozu(){return '';},yeniSoz(){return false;},aktifSozIndex(){return -1;},renderSoz(){return false;},
    el:id=>id==='sozBox'?box:null,
    S:{sozKapali:false},
    esc:x=>String(x),
    infraError(){},
    setTimeout(fn){fn();return 1;},
    console
  };
  context.window.window=context.window;
  vm.createContext(context);
  vm.runInContext(source,context,{filename:'motivation-quotes-v1.js'});
  assert.equal(context.window.__YKS_MOTIVATION_QUOTES_READY__.poolSize,1);
  assert.equal(context.sozCurrentIndex,0);
  assert.equal(context.gununSozu(),'Çok çalışmanın yerini hiçbir şey tutamaz.');
  assert.match(box.innerHTML,/Motivasyon/);
  assert.doesNotMatch(box.innerHTML,/Aşk|İnsan Sözü/);
});

test('motivasyon filtresi alakasız konu kümelerini açıkça dışlar',()=>{
  const source=fs.readFileSync(path.join(root,'modules/motivation-quotes-v1.js'),'utf8');
  assert.match(source,/preferredCategories/);
  assert.match(source,/İnsan Sözü|preferredCategories\.has\(category\)/);
  assert.match(source,/aşk\|evlilik/);
  assert.match(source,/içki\|alkol/);
  assert.match(source,/siyaset\|hükümet/);
  assert.match(source,/Motivasyon/);
});