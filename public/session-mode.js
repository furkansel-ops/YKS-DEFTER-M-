/* Parser-blocking storage boundary. Keep this before every legacy/application script.
   Authentication may persist its SDK session; study work may persist only after the
   validated account callback opts in. Guest work lives in this page's memory only. */
(function(root){
  "use strict";
  if(root.__YKS_SESSION__)return;
  var nativeLocal=root.localStorage,nativeSession=root.sessionStorage;
  var NEXT_MODE_KEY="yks_session_next_mode_v1",ACCOUNT_KEY="yks_cloud_account";
  var mode="locked",accountUid="",lastError="",revision=0,resolveReady;
  var ready=new Promise(function(resolve){resolveReady=resolve;});
  var overlays=[];
  function isStudyKey(key){return key==="yks"||key.indexOf("yks_")===0||key.indexOf("__yks_")===0;}
  try{
    if(nativeSession.getItem(NEXT_MODE_KEY)==="guest")mode="guest";
    nativeSession.removeItem(NEXT_MODE_KEY);
  }catch(error){lastError="Oturum tercihi okunamadı. Tarayıcı depolama iznini kontrol et.";}

  function originalKeys(storage){
    var keys=[];
    for(var i=0;i<storage.length;i++){var key=storage.key(i);if(key!==null)keys.push(key);}
    return keys;
  }
  function facade(storage){
    var changes=new Map(),observed=new Map(),entry={storage:storage,changes:changes,observed:observed,enumerated:null};
    overlays.push(entry);
    function observe(key){
      if(mode==="locked"&&isStudyKey(key)&&key!==ACCOUNT_KEY&&!observed.has(key))observed.set(key,storage.getItem(key));
    }
    function getItem(key){
      key=String(key);
      observe(key);
      if(mode==="account"||!isStudyKey(key))return storage.getItem(key);
      if(changes.has(key))return changes.get(key);
      return mode==="guest"?null:storage.getItem(key);
    }
    function setItem(key,value){
      key=String(key);value=String(value);
      observe(key);
      if(mode==="account"||!isStudyKey(key))storage.setItem(key,value);
      else changes.set(key,value);
    }
    function removeItem(key){
      key=String(key);
      observe(key);
      if(mode==="account"||!isStudyKey(key))storage.removeItem(key);
      else changes.set(key,null);
    }
    function keys(){
      var original=originalKeys(storage);
      if(mode==="locked"&&entry.enumerated===null){
        entry.enumerated=original.filter(function(key){return isStudyKey(key)&&key!==ACCOUNT_KEY;}).sort();
        entry.enumerated.forEach(observe);
      }
      var visible=new Set(original.filter(function(key){return mode!=="guest"||!isStudyKey(key);}));
      if(mode!=="account")changes.forEach(function(value,key){if(value===null)visible.delete(key);else visible.add(key);});
      return Array.from(visible);
    }
    var methods={
      getItem:getItem,setItem:setItem,removeItem:removeItem,
      key:function(index){return keys()[Number(index)>>>0]??null;},
      clear:function(){
        if(mode==="account"){storage.clear();return;}
        /* Guest/locked clear must never sign out Firebase or erase another account. */
        keys().forEach(function(key){if(isStudyKey(key))changes.set(key,null);});
      }
    };
    return new Proxy(Object.create(null),{
      get:function(_target,key){
        if(key===Symbol.toStringTag)return "Storage";
        if(key==="length")return keys().length;
        if(Object.prototype.hasOwnProperty.call(methods,key))return methods[key];
        return typeof key==="string"?(getItem(key)??undefined):undefined;
      },
      set:function(_target,key,value){if(typeof key!=="string")return false;setItem(key,value);return true;},
      deleteProperty:function(_target,key){if(typeof key==="string")removeItem(key);return true;},
      ownKeys:keys,
      has:function(_target,key){return typeof key==="string"&&(key==="length"||Object.prototype.hasOwnProperty.call(methods,key)||getItem(key)!==null);},
      getOwnPropertyDescriptor:function(_target,key){
        if(typeof key==="string"&&getItem(key)!==null)return {configurable:true,enumerable:true,writable:true,value:getItem(key)};
      },
      defineProperty:function(_target,key,descriptor){
        if(typeof key!=="string"||!("value" in descriptor)||descriptor.configurable===false)return false;
        setItem(key,descriptor.value);return true;
      }
    });
  }
  var localFacade=facade(nativeLocal),sessionFacade=facade(nativeSession);
  Object.defineProperty(root,"localStorage",{configurable:false,enumerable:true,get:function(){return localFacade;}});
  Object.defineProperty(root,"sessionStorage",{configurable:false,enumerable:true,get:function(){return sessionFacade;}});

  function snapshot(){
    var existing=false;
    try{existing=!!nativeLocal.getItem("yks");}catch(error){}
    return {mode:mode,persistent:mode==="account",hasStoredStudyData:existing,error:lastError,revision:revision,canClearDeviceStudyStorage:mode!=="guest"&&!!accountUid};
  }
  function emit(){
    if(root.document&&root.document.documentElement)root.document.documentElement.dataset.sessionMode=mode;
    root.dispatchEvent(new CustomEvent("yks:session-mode",{detail:snapshot()}));
  }
  function lock(){
    if(mode==="guest")return;
    revision++;mode="locked";emit();
  }
  function enterGuest(){
    lock();
    try{nativeSession.setItem(NEXT_MODE_KEY,"guest");}
    catch(error){lastError="Kaydetmeden çalışma başlatılamadı. Tarayıcı depolama iznini kontrol et.";emit();throw new Error(lastError);}
    root.location.reload();
    return false;
  }
  function enterAccount(uid){
    if(typeof uid!=="string"||!uid.trim())throw new Error("Doğrulanmış hesap bulunamadı.");
    if(mode==="guest"||(accountUid&&accountUid!==uid)){
      /* The new page will re-check Firebase. Never migrate a guest's temporary S,
         storage overlay, or in-memory IndexedDB target into the saved notebook. */
      if(mode!=="guest")lock();
      try{nativeSession.removeItem(NEXT_MODE_KEY);}catch(error){}
      root.location.reload();
      return false;
    }
    var before=[],ownerMismatch=false,storageChanged=false;
    try{
      /* Account ownership is a local persistence boundary, not a side effect of
         successful cloud upload. Read the real storage, never a stale overlay. */
      var storedOwner=nativeLocal.getItem(ACCOUNT_KEY);
      if(storedOwner&&storedOwner!==uid){ownerMismatch=true;throw new Error("account mismatch");}
      /* Legacy S was loaded while the login screen was open. Another tab may
         have saved since then. Never replay that stale in-memory notebook or
         its startup writes over newer disk data; reopen from a fresh page. */
      overlays.forEach(function(entry){
        entry.observed.forEach(function(value,key){if(entry.storage.getItem(key)!==value)storageChanged=true;});
        if(entry.enumerated!==null){
          var current=originalKeys(entry.storage).filter(function(key){return isStudyKey(key)&&key!==ACCOUNT_KEY;}).sort();
          if(JSON.stringify(current)!==JSON.stringify(entry.enumerated))storageChanged=true;
        }
      });
      if(storageChanged)throw new Error("study storage changed while locked");
      before.push({storage:nativeLocal,key:ACCOUNT_KEY,value:storedOwner,next:uid,owner:true});
      overlays.forEach(function(entry){entry.changes.forEach(function(value,key){
        if(entry.storage===nativeLocal&&key===ACCOUNT_KEY)return;
        before.push({storage:entry.storage,key:key,value:entry.storage.getItem(key),next:value,owner:false});
      });});
      nativeLocal.setItem(ACCOUNT_KEY,uid);
      if(nativeLocal.getItem(ACCOUNT_KEY)!==uid)throw new Error("account ownership was not stored");
      overlays.forEach(function(entry){entry.changes.forEach(function(value,key){
        /* Startup code cannot replace/remove the canonical validated owner. */
        if(entry.storage===nativeLocal&&key===ACCOUNT_KEY)return;
        if(value===null)entry.storage.removeItem(key);else entry.storage.setItem(key,value);
      });});
      if(nativeLocal.getItem(ACCOUNT_KEY)!==uid)throw new Error("account ownership changed");
    }catch(error){
      var rollbackFailed=false;
      before.reverse().forEach(function(entry){try{
        /* Keep the UID claimed if any study value could not be restored. A
           partial rollback must not leave newly written content unowned. Never
           erase a different UID another tab has written in the meantime. */
        if(entry.owner&&(rollbackFailed||entry.storage.getItem(entry.key)!==entry.next))return;
        if(entry.value===null)entry.storage.removeItem(entry.key);else entry.storage.setItem(entry.key,entry.value);
        if(entry.storage.getItem(entry.key)!==entry.value)rollbackFailed=true;
      }catch(restoreError){rollbackFailed=true;}});
      lastError=ownerMismatch?"Bu cihazdaki kayıtlar başka hesaba bağlı. Kayıtların bağlı olduğu hesapla giriş yapmalısın.":storageChanged?"Kayıtlar diğer sekmede değişti. Güncel defteri açmak için sayfayı yenile; mevcut kayıtlarına dokunulmadı.":rollbackFailed?"Kayıt alanı işlemi tamamlanamadı. Güvenlik için kayıt ve eşitleme durduruldu; aynı hesapla yeniden dene.":"Hesabın açıldı ancak kayıt alanı kullanılamıyor. Cihazındaki eski kayıtlar korunuyor.";
      revision++;mode="locked";emit();throw new Error(lastError);
    }
    overlays.forEach(function(entry){entry.changes.clear();entry.observed.clear();entry.enumerated=null;});
    accountUid=uid;revision++;mode="account";lastError="";resolveReady(mode);emit();
    return true;
  }
  function clearDeviceStudyStorage(){
    /* Called only by the existing explicitly confirmed device-wipe flow, after
       Firebase sign-out. Ordinary clear/remove stay quarantined while locked. */
    if(mode==="guest"||!accountUid)throw new Error("Cihaz kayıtlarını silmek için önce bağlı hesabına giriş yapmalısın.");
    lock();
    overlays.forEach(function(entry){
      originalKeys(entry.storage).filter(isStudyKey).forEach(function(key){entry.storage.removeItem(key);});
      entry.changes.clear();entry.observed.clear();entry.enumerated=null;
    });
  }
  var api=Object.freeze({
    get mode(){return mode;},ready:ready,getState:snapshot,
    canPersist:function(){return mode==="account";},enterGuest:enterGuest,enterAccount:enterAccount,lock:lock,
    clearDeviceStudyStorage:clearDeviceStudyStorage
  });
  Object.defineProperty(root,"__YKS_SESSION__",{configurable:false,enumerable:false,writable:false,value:api});
  if(mode==="guest")resolveReady(mode);
  emit();
})(window);
