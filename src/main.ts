import {installLegacyUiBridge} from "./ui/legacy-bridge";

type BootstrapState={
  version:"4.0.0-alpha.2";
  stack:"vite-typescript";
  legacyRuntime:true;
  uiBridge:true;
  startedAt:number;
};

declare global{
  interface Window{
    __YKS_V4_BOOTSTRAP__?:BootstrapState;
  }
}

const bootstrap:BootstrapState={
  version:"4.0.0-alpha.2",
  stack:"vite-typescript",
  legacyRuntime:true,
  uiBridge:true,
  startedAt:Date.now()
};

const ui=installLegacyUiBridge();
window.__YKS_V4_BOOTSTRAP__=bootstrap;
document.documentElement.dataset.v4Runtime="ready";
document.documentElement.dataset.v4UiErrors=String(ui.validate().length);
window.dispatchEvent(new CustomEvent<BootstrapState>("yks:v4-bootstrap",{detail:bootstrap}));

export {};
