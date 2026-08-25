import {installLegacyUiBridge} from "./ui/legacy-bridge";
import {installLegacyDataBridge} from "./data/legacy-data-bridge";
import {installScreenRuntime} from "./ui/screen-runtime";
import {installLegacyServiceBridge} from "./services/legacy-service-bridge";
import {installLegacyDomainBridge} from "./domain/legacy-domain-bridge";
import {installReleaseCandidate} from "./release/release-candidate";

type BootstrapState={
  version:"4.0.0-rc.1";
  stack:"vite-typescript";
  legacyRuntime:true;
  uiBridge:true;
  dataBridge:true;
  screenRuntime:true;
  commonServices:true;
  domainServices:true;
  releaseCandidate:true;
  startedAt:number;
};

declare global{
  interface Window{
    __YKS_V4_BOOTSTRAP__?:BootstrapState;
  }
}

const bootstrap:BootstrapState={
  version:"4.0.0-rc.1",
  stack:"vite-typescript",
  legacyRuntime:true,
  uiBridge:true,
  dataBridge:true,
  screenRuntime:true,
  commonServices:true,
  domainServices:true,
  releaseCandidate:true,
  startedAt:Date.now()
};

const services=installLegacyServiceBridge();
const data=installLegacyDataBridge();
const domain=installLegacyDomainBridge();
const screens=installScreenRuntime();
const ui=installLegacyUiBridge(screens);
const release=installReleaseCandidate();
window.__YKS_V4_BOOTSTRAP__=bootstrap;
document.documentElement.dataset.v4Runtime="ready";
document.documentElement.dataset.v4UiErrors=String(ui.validate().length);
document.documentElement.dataset.v4DataErrors=String(data.validate().length);
document.documentElement.dataset.v4ScreenErrors=String(screens.validate().length);
document.documentElement.dataset.v4ServiceErrors=String(services.validate().length);
document.documentElement.dataset.v4DomainErrors=String(domain.validate().length);
document.documentElement.dataset.v4ReleaseVersion=release.version;
window.dispatchEvent(new CustomEvent<BootstrapState>("yks:v4-bootstrap",{detail:bootstrap}));

export {};
