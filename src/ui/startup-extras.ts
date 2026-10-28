/** İsteğe bağlı başlangıç modülleri tek küçük köprüde izole edilir.
 * Birinin hata vermesi diğerinin yüklenmesini engellemez. */
document.documentElement.dataset.topSyncIndicator="loading";
document.documentElement.dataset.studyGamification="loading";

void import("./top-sync-indicator")
  .then(({installTopSyncIndicator})=>{
    try{
      const value=installTopSyncIndicator();
      document.documentElement.dataset.topSyncIndicator=value.installed?"ready":"deferred";
    }catch(error){
      document.documentElement.dataset.topSyncIndicator="deferred";
      console.error("Üst senkron göstergesi başlatılamadı",error);
    }
  })
  .catch(error=>{
    document.documentElement.dataset.topSyncIndicator="deferred";
    console.error("Üst senkron göstergesi yüklenemedi",error);
  });

void import("./study-gamification")
  .then(({installStudyGamification})=>{
    try{
      const value=installStudyGamification();
      document.documentElement.dataset.studyGamification=value.installed?"ready":"deferred";
    }catch(error){
      document.documentElement.dataset.studyGamification="deferred";
      console.error("Başarım sistemi başlatılamadı",error);
    }
  })
  .catch(error=>{
    document.documentElement.dataset.studyGamification="deferred";
    console.error("Başarım sistemi yüklenemedi",error);
  });

/* Karşılama ve hesap ekranı; yüklenemezse uygulama misafir gibi açılır. */
void import("./auth-welcome-v60")
  .then(({installAuthWelcomeV60})=>{
    try{
      const value=installAuthWelcomeV60();
      document.documentElement.dataset.authWelcome=value.installed?"ready":value.reason;
    }catch(error){
      document.documentElement.dataset.authWelcome="deferred";
      console.error("Karşılama ekranı başlatılamadı",error);
    }
  })
  .catch(error=>{
    document.documentElement.dataset.authWelcome="deferred";
    console.error("Karşılama ekranı yüklenemedi",error);
  });
export {};
