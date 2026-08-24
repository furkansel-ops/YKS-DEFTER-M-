import {installLegacyUiBridge} from "./ui/legacy-bridge";
import {installLegacyDataBridge} from "./data/legacy-data-bridge";
import {installScreenRuntime} from "./ui/screen-runtime";

type BootstrapState={
  version:"4.0.0-alpha.7";
  stack:"vite-typescript";
  legacyRuntime:true;
  uiBridge:true;
  dataBridge:true;
  screenRuntime:true;
  startedAt:number;
};

declare global{
  interface Window{
    __YKS_V4_BOOTSTRAP__?:BootstrapState;
  }
}

const bootstrap:BootstrapState={
  version:"4.0.0-alpha.7",
  stack:"vite-typescript",
  legacyRuntime:true,
  uiBridge:true,
  dataBridge:true,
  screenRuntime:true,
  startedAt:Date.now()
};

const data=installLegacyDataBridge();
const screens=installScreenRuntime();
const ui=installLegacyUiBridge(screens);
window.__YKS_V4_BOOTSTRAP__=bootstrap;
document.documentElement.dataset.v4Runtime="ready";
document.documentElement.dataset.v4UiErrors=String(ui.validate().length);
document.documentElement.dataset.v4DataErrors=String(data.validate().length);
document.documentElement.dataset.v4ScreenErrors=String(screens.validate().length);
window.dispatchEvent(new CustomEvent<BootstrapState>("yks:v4-bootstrap",{detail:bootstrap}));

export {};
