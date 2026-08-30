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
import {installRecoveryCenter} from "./ui/recovery-center";
import {installV43SafeRuntime} from "./ui/v43-safe-runtime";

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

/* Çekirdek açılış zinciri yalnız kararlı altyapı modüllerinden oluşur.
   v4.3 ürün katmanları aşağıda, bootstrap tamamlandıktan sonra ayrı fail-open sınırlarında yüklenir. */
const services=installLegacyServiceBridge();
const data=installLegacyDataBridge();
installScienceCards();
installBiologyAtlas();
const backup=installLegacyBackupBridge(data,RELEASE_VERSION);
const recovery=installRecoveryCenter(data,backup);
const domain=installLegacyDomainBridge();
const progressAnalysis=installLegacyProgressAnalysisBridge();
const examAnalysis=installLegacyExamAnalysisBridge();
const pwa=installPwaRuntime(RELEASE_BUILD);
const screens=installScreenRuntime();
const ui=installLegacyUiBridge(screens);
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
window.dispatchEvent(new CustomEvent<BootstrapState>("yks:v4-bootstrap",{detail:bootstrap}));

const v43Runtime=installV43SafeRuntime();
document.documentElement.dataset.v43RuntimeHost=String(v43Runtime.installed);
const release=installReleaseRuntime();
document.documentElement.dataset.v4ReleaseVersion=release.version;

export {};
