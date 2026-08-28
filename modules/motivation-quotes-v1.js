(function(){
  "use strict";
  const READY_FLAG="__YKS_MOTIVATION_QUOTES_READY__";
  const MAX_RETRIES=40;
  let retries=0;

  function boot(){
    if(typeof SOZLER==="undefined"||!Array.isArray(SOZLER)||typeof sozRand!=="function"){
      if(retries++<MAX_RETRIES)setTimeout(boot,50);
      return;
    }

    const positive=/(çalış|başar|pes|yapabil|inan|cesaret|zorl|güçlük|karar|harekete|azm|sabır|sabrede|devam|iler|öğren|eğitim|alışkan|mükemmel|hazırl|fırsat|denem|hata|uyum|vazgeç|emek|terdir|hedef|başla|uygula|eylem|şans|hayal|gelecek|disiplin|yenilgi|ayağa|sorumluluk|gayret|ısrar|ısrardır|gücüm|yılm|zirve)/i;
    const blocked=/(aşk|evlilik|kadın|erkek|içki|alkol|sigara|ölüm|öldür|din\b|tanrı|allah|dua|cennet|cehennem|siyaset|hükümet|parti\b|vergi|servet|kedi|köpek|yemek|puro|seks|seviş|bekaret|silah|savaşmak|savaş\b)/i;
    const preferredCategories=new Set(["Teknik Direktör","Spor","Tarih","Bilim","Yenilik","Düşünce"]);

    let pool=[];
    for(let i=0;i<SOZLER.length;i++){
      const x=SOZLER[i]||{},text=String(x.q||""),category=String(x.c||"");
      if(!preferredCategories.has(category))continue;
      if(!positive.test(text)||blocked.test(text))continue;
      pool.push(i);
    }

    /* Ana havuz beklenmedik biçimde küçülürse yine yalnızca elle seçilmiş ilk kategorilerden kal. */
    if(pool.length<30){
      pool=[];
      for(let i=0;i<SOZLER.length;i++){
        const x=SOZLER[i]||{},text=String(x.q||""),category=String(x.c||"");
        if(preferredCategories.has(category)&&!blocked.test(text))pool.push(i);
      }
    }

    const poolSet=new Set(pool);
    window[READY_FLAG]={version:"1.0.0",poolSize:pool.length,totalSource:SOZLER.length};

    sozRandomIndex=function(exclude=-1,blockedAuthors=sozRecentAuthors){
      if(!pool.length)return -1;
      if(pool.length===1)return pool[0];
      const blockedAuthorsSet=new Set((blockedAuthors||[]).map(x=>String(x||"").toLocaleLowerCase("tr-TR")).filter(Boolean));
      let candidates=pool.filter(i=>i!==exclude&&!blockedAuthorsSet.has(sozAuthorKey(SOZLER[i])));
      if(!candidates.length){
        const hist=Array.from(blockedAuthors||[]);
        while(hist.length&&!candidates.length){
          hist.shift();
          const relaxed=new Set(hist.map(x=>String(x||"").toLocaleLowerCase("tr-TR")));
          candidates=pool.filter(i=>i!==exclude&&!relaxed.has(sozAuthorKey(SOZLER[i])));
        }
      }
      if(!candidates.length)candidates=pool.filter(i=>i!==exclude);
      return candidates.length?candidates[sozRand(candidates.length)]:pool[0];
    };

    sozSetRandom=function(exclude=sozCurrentIndex){
      const i=sozRandomIndex(exclude,sozRecentAuthors);
      if(i>=0){sozCurrentIndex=i;sozRememberIndex(i)}
      return i;
    };

    sozIndex=function(){
      if(!poolSet.has(sozCurrentIndex)){
        sozRecentAuthors=[];
        sozSetRandom(-1);
      }
      return sozCurrentIndex;
    };

    gununSozu=function(){const i=sozIndex();return i>=0?SOZLER[i].q:"";};
    yeniSoz=function(){sozSetRandom(sozIndex());renderSoz();return true;};
    aktifSozIndex=function(){return sozIndex();};

    renderSoz=function(){
      const w=el("sozBox");if(!w)return false;
      if(S.sozKapali){w.style.display="none";return true;}
      const i=aktifSozIndex(),soz=SOZLER[i];if(!soz)return false;
      w.style.display="flex";
      w.innerHTML='<span class="szwrap"><span class="szlabel">Günün sözü <span class="szcat">Motivasyon</span></span><span class="sz">“'+esc(soz.q)+'”</span><span class="sza">— '+esc(soz.a||"")+'</span></span><button class="szr" type="button" onclick="yeniSoz()" title="Başka bir motivasyon sözü" aria-label="Başka bir motivasyon sözü">↻</button>';
      return true;
    };

    sozRecentAuthors=[];
    sozCurrentIndex=-1;
    sozSetRandom(-1);
    try{renderSoz();}catch(e){try{infraError("motivation-quotes-render",e);}catch(_){}}
  }

  boot();
})();
