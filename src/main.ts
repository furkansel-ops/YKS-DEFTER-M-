import {installLegacyUiBridge} from "./ui/legacy-bridge";
import {installLegacyDataBridge} from "./data/legacy-data-bridge";
import {installScreenRuntime} from "./ui/screen-runtime";
import {installLegacyServiceBridge} from "./services/legacy-service-bridge";
import {installLegacyDomainBridge} from "./domain/legacy-domain-bridge";
import {installReleaseRuntime} from "./release/release";
import {installLegacyBackupBridge} from "./data/legacy-backup-bridge";
import {installLegacyProgressAnalysisBridge} from "./domain/legacy-progress-analysis-bridge";
import {installLegacyExamAnalysisBridge} from "./domain/legacy-exam-analysis-bridge";
import {installPwaRuntime} from "./pwa/pwa-runtime";
import {installScienceCards} from "./ui/science-cards";
import {installBiologyAtlas} from "./ui/biology-atlas-bridge";
import {installGlobalSearch} from "./ui/global-search";
import {installRepeatCenterV42} from "./ui/repeat-center-bridge";

type BootstrapState={
  version:"4.1.0";
  channel:"stable";
  stack:"vite-typescript";
  legacyRuntime:true;
  uiBridge:true;
  dataBridge:true;
  screenRuntime:true;
  commonServices:true;
  domainServices:true;
  stableRelease:true;
  backupBridge:true;
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
  version:"4.1.0",
  channel:"stable",
  stack:"vite-typescript",
  legacyRuntime:true,
  uiBridge:true,
  dataBridge:true,
  screenRuntime:true,
  commonServices:true,
  domainServices:true,
  stableRelease:true,
  backupBridge:true,
  progressAnalysis:true,
  examAnalysis:true,
  pwaRuntime:true,
  startedAt:Date.now()
};

const services=installLegacyServiceBridge();
const data=installLegacyDataBridge();
installScienceCards();
installBiologyAtlas();
installLegacyBackupBridge(data,bootstrap.version);
const domain=installLegacyDomainBridge();
const progressAnalysis=installLegacyProgressAnalysisBridge();
const examAnalysis=installLegacyExamAnalysisBridge();
const pwa=installPwaRuntime("4.1.0-r20");
const screens=installScreenRuntime();
const ui=installLegacyUiBridge(screens);
const globalSearch=installGlobalSearch();
installRepeatCenterV42();
const release=installReleaseRuntime();
window.__YKS_V4_BOOTSTRAP__=bootstrap;
document.documentElement.dataset.v4Runtime="ready";
document.documentElement.dataset.v4UiErrors=String(ui.validate().length);
document.documentElement.dataset.v4DataErrors=String(data.validate().length);
document.documentElement.dataset.v4ScreenErrors=String(screens.validate().length);
document.documentElement.dataset.v4ServiceErrors=String(services.validate().length);
document.documentElement.dataset.v4DomainErrors=String(domain.validate().length);
document.documentElement.dataset.v4ProgressAnalysisErrors=String(progressAnalysis.validate().length);
document.documentElement.dataset.v4ExamAnalysisErrors=String(examAnalysis.validate().length);
document.documentElement.dataset.v4PwaBuild=pwa.build;
document.documentElement.dataset.v4ReleaseVersion=release.version;
document.documentElement.dataset.v42GlobalSearchVersion=globalSearch.version;
document.documentElement.dataset.v42RepeatCenter="loading";
window.dispatchEvent(new CustomEvent<BootstrapState>("yks:v4-bootstrap",{detail:bootstrap}));

export {};
