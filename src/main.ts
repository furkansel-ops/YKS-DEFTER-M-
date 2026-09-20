import {installLegacyUiBridge} from "./ui/legacy-bridge";
import {installLegacyDataBridge} from "./data/legacy-data-bridge";
import {installScreenRuntime} from "./ui/screen-runtime";
import {installLegacyServiceBridge} from "./services/legacy-service-bridge";
import {installLegacyDomainBridge} from "./domain/legacy-domain-bridge";
import {installReleaseRuntime} from "./release/release";
import {installReleaseOverlay} from "./release/release-overlay";
import {LEGACY_CORE_BUILD,RELEASE_BUILD,RELEASE_CHANNEL,RELEASE_VERSION} from "./release/version";
import {installLegacyBackupBridge} from "./data/legacy-backup-bridge";
import {installLegacyProgressAnalysisBridge} from "./domain/legacy-progress-analysis-bridge";
import {installLegacyExamAnalysisBridge} from "./domain/legacy-exam-analysis-bridge";
import {installPwaRuntime} from "./pwa/pwa-runtime";
import {installScienceCards} from "./ui/science-cards";
import {installBiologyAtlas} from "./ui/biology-atlas-bridge";
import {installChemistryVisualsBridgeV44} from "./ui/chemistry-visuals-bridge";
import {installLabInteractionsBridgeV44} from "./ui/lab-interactions-bridge-v44";
import {installRecoveryCenter} from "./ui/recovery-center";
import {installV43SafeRuntime} from "./ui/v43-safe-runtime";
import {installPlayStoreShell} from "./ui/play-store-shell";
import {installParagraphProblemTracker} from "./ui/paragraph-problem-tracker";
import {installTeachersV2} from "./ui/teachers-v2";
import "./ui/single-theme-runtime.css";
import "./ui/visual-stability-hotfix.css";
import "./ui/recent-feature-stability.css";
import "./ui/topics-toolbar-hotfix.css";

type BootstrapState={
  version:typeof RELEASE_VERSION;
  build:typeof RELEASE_BUILD;
  legacyCore:typeof LEGACY_CORE_BUILD;
  channel:typeof RELEASE_CHANNEL;
  stack:"vite-typescript";
  legacyRuntime:true;
  uiBridge:true;
  dataBridge:true;
  screenRuntime:true;
  commonServices:true;
  domainServices:true;
  stableRelease:true;
  backupBridge:true;
  recoveryCenter:true;
  progressAnalysis:true;
  examAnalysis:true;
  pwaRuntime:true;
  startedAt:number;
};

declare global{
  interface Window{
    __YKS_V4_BOOTSTRAP__?:BootstrapState;
  }
}

const bootstrap:BootstrapState={
  version:RELEASE_VERSION,
  build:RELEASE_BUILD,
  legacyCore:LEGACY_CORE_BUILD,
  channel:RELEASE_CHANNEL,
  stack:"vite-typescript",
  legacyRuntime:true,
  uiBridge:true,
  dataBridge:true,
  screenRuntime:true,
  commonServices:true,
  domainServices:true,
  stableRelease:true,
  backupBridge:true,
  recoveryCenter:true,
  progressAnalysis:true,
  examAnalysis:true,
  pwaRuntime:true,
  startedAt:Date.now()
};

let optionalFeatureErrors=0;
function installOptional<T>(name:string,installer:()=>T,fallback:T):T{
  try{return installer();}
  catch(error){
    optionalFeatureErrors++;
    document.documentElement.dataset.v4OptionalErrors=String(optionalFeatureErrors);
    console.error(`İsteğe bağlı özellik başlatılamadı: ${name}`,error);
    return fallback;
  }
}
document.documentElement.dataset.v4OptionalErrors="0";

/* Tek temanın renk tokenları ana CSS ile birlikte yüklenir. Koruma/migrasyon kodu ayrı
   chunk kalır; böylece görünüm hemen graphite olurken başlangıç JS bütçesi korunur. */
document.documentElement.setAttribute("data-theme","graphite");
document.documentElement.style.colorScheme="dark";
document.documentElement.dataset.themeMode="single";
document.documentElement.dataset.themeName="yks-defterim";
document.documentElement.dataset.themeControl="single";
document.documentElement.dataset.signatureTheme="loading";
void import("./ui/single-theme-runtime")
  .then(({installSingleThemeRuntime})=>{
    const signatureTheme=installOptional(
      "single-theme",
      ()=>installSingleThemeRuntime(),
      {installed:false,theme:"graphite",destroy:()=>{}}
    );
    document.documentElement.dataset.signatureTheme=signatureTheme.installed?"ready":"deferred";
  })
  .catch(error=>{
    document.documentElement.dataset.signatureTheme="deferred";
    console.error("Tek tema koruma katmanı yüklenemedi",error);
  });

function loadTeacherVideosRuntime():void{
  if(document.querySelector('script[data-yks-teacher-videos="true"]'))return;
  const script=document.createElement("script");
  script.src=new URL("./teacher-videos.js?v=4.4.0-r2-hotfix4",document.baseURI).href;
  script.async=true;
  script.dataset.yksTeacherVideos="true";
  document.documentElement.dataset.teacherVideosRuntime="loading";
  script.addEventListener("load",()=>{
    document.documentElement.dataset.teacherVideosRuntime=
      document.documentElement.dataset.teacherVideos==="ready"?"ready":"loaded";
  },{once:true});
  script.addEventListener("error",()=>{
    document.documentElement.dataset.teacherVideosRuntime="deferred";
    console.error("Hoca videoları çalışma zamanı yüklenemedi");
  },{once:true});
  document.head.appendChild(script);
}

function loadTeachersV2Media():void{
  if(document.documentElement.dataset.teachersV2Media==="ready"||document.documentElement.dataset.teachersV2Media==="loading")return;
  document.documentElement.dataset.teachersV2Media="loading";
  /* Kendi eklenen hocaların hızlı erişim katmanı ağır medya arşivinden bağımsız
     başlatılır. Böylece Ferrum gibi özel hocalarda ilk anlamlı içerik arşiv
     taramasını beklemeden görünür. */
  void import("./ui/teachers-v2-custom-fast").catch(error=>{
    document.documentElement.dataset.teachersV2CustomFast="deferred";
    console.error("Hocalar v2 özel hoca hızlı erişimi yüklenemedi",error);
  });
  void import("./ui/teachers-v2-media")
    .then(()=>{
      return import("./ui/teachers-v2-library").catch(error=>{
        document.documentElement.dataset.teachersV2Library="deferred";
        console.error("Hocalar v2 kişisel video kütüphanesi yüklenemedi",error);
      });
    })
    .catch(error=>{
      document.documentElement.dataset.teachersV2Media="deferred";
      console.error("Hocalar v2 medya katmanı yüklenemedi",error);
    });
}

/* Çekirdek açılış zinciri yalnız kararlı altyapı modüllerinden oluşur.
   Ürün katmanları ve yardımcı arayüzler fail-open sınırlarında tutulur: tek bir yeni
   özellik hata verirse uygulamanın geri kalanı açılmaya devam eder. */
document.documentElement.dataset.onboardingProfileRuntime="loading";
void import("./ui/onboarding-profile-v45")
  .then(({installOnboardingProfileV45})=>{
    const profile=installOptional("onboarding-profile",()=>installOnboardingProfileV45(),{installed:false,examDate:"2027-06-19"});
    document.documentElement.dataset.onboardingProfileRuntime=profile.installed?"ready":"deferred";
  })
  .catch(error=>{
    document.documentElement.dataset.onboardingProfileRuntime="deferred";
    console.error("Onboarding profil katmanı yüklenemedi",error);
  });
const services=installLegacyServiceBridge();
const data=installLegacyDataBridge();
installScienceCards();
installBiologyAtlas();
installChemistryVisualsBridgeV44();
installLabInteractionsBridgeV44();
const backup=installLegacyBackupBridge(data,RELEASE_VERSION);
const recovery=installRecoveryCenter(data,backup);
const domain=installLegacyDomainBridge();
const progressAnalysis=installLegacyProgressAnalysisBridge();
const examAnalysis=installLegacyExamAnalysisBridge();
const pwa=installPwaRuntime(RELEASE_BUILD);
/* Koç/öğrenci hesap köprüsü artık Daha ekranının açılmasına bağlı değil. Ana bootstrap
   sırasında ayrı chunk olarak yüklenir; böylece başlangıç JS bütçesi korunur. */
document.documentElement.dataset.studentAccountBootstrap="loading";
void import("./ui/student-account-loader")
  .then(({installStudentAccountLoader})=>{
    installStudentAccountLoader();
    document.documentElement.dataset.studentAccountBootstrap="ready";
  })
  .catch(error=>{
    document.documentElement.dataset.studentAccountBootstrap="deferred";
    console.error("Öğrenci/koç hesap köprüsü başlatılamadı",error);
  });

/* P & P ekran kabuğunun navigasyon doğrulamasından önce kurulması gerekir; ancak
   kurulum hatası artık çekirdek açılışı durdurmaz. */
const paragraphProblem=installOptional(
  "paragraph-problem",
  ()=>installParagraphProblemTracker(),
  {installed:false,entries:0}
);
const screens=installScreenRuntime();
const ui=installLegacyUiBridge(screens);
const teachersV2=installOptional(
  "teachers-v2",
  ()=>installTeachersV2(),
  {installed:false,version:"deferred",refresh:()=>{},destroy:()=>{}}
);
window.__YKS_V4_BOOTSTRAP__=bootstrap;
installReleaseOverlay();
document.documentElement.dataset.v4Runtime="ready";
document.documentElement.dataset.v4UiErrors=String(ui.validate().length);
document.documentElement.dataset.v4DataErrors=String(data.validate().length);
document.documentElement.dataset.v4RecoveryErrors=String(recovery.validate().length);
document.documentElement.dataset.v4ScreenErrors=String(screens.validate().length);
document.documentElement.dataset.v4ServiceErrors=String(services.validate().length);
document.documentElement.dataset.v4DomainErrors=String(domain.validate().length);
document.documentElement.dataset.v4ProgressAnalysisErrors=String(progressAnalysis.validate().length);
document.documentElement.dataset.v4ExamAnalysisErrors=String(examAnalysis.validate().length);
document.documentElement.dataset.v4PwaBuild=pwa.build;
document.documentElement.dataset.paragraphProblemTracker=paragraphProblem.installed?"ready":"deferred";
document.documentElement.dataset.teachersV2Runtime=teachersV2.installed?teachersV2.version:"deferred";
window.dispatchEvent(new CustomEvent<BootstrapState>("yks:v4-bootstrap",{detail:bootstrap}));

/* V2 aktifse medya ve kişisel kütüphane katmanları ayrı chunklar olarak paint sonrasında
   yüklenir; ana başlangıç paketinin performans bütçesi korunur. V2 başlatılamazsa eski
   katman fail-open yedek olur. */
if(teachersV2.installed)window.setTimeout(loadTeachersV2Media,0);
else loadTeacherVideosRuntime();

const playStoreShell=installOptional(
  "play-store-shell",
  ()=>installPlayStoreShell(),
  {installed:false,legacyCloudRemoved:false}
);
document.documentElement.dataset.playStorePrivacy=playStoreShell.installed?"ready":"deferred";
document.documentElement.dataset.topSyncIndicator="loading";
void import("./ui/top-sync-indicator")
  .then(({installTopSyncIndicator})=>{
    const indicator=installOptional(
      "top-sync-indicator",
      ()=>installTopSyncIndicator(),
      {installed:false,state:"off" as const}
    );
    document.documentElement.dataset.topSyncIndicator=indicator.installed?"ready":"deferred";
  })
  .catch(error=>{
    document.documentElement.dataset.topSyncIndicator="deferred";
    console.error("Üst senkron durum göstergesi yüklenemedi",error);
  });
const v43Runtime=installV43SafeRuntime();
document.documentElement.dataset.v43RuntimeHost=String(v43Runtime.installed);
const release=installReleaseRuntime();
document.documentElement.dataset.v4ReleaseVersion=release.version;

export {};
