type BootstrapState={
  version:"4.0.0-alpha.1";
  stack:"vite-typescript";
  legacyRuntime:true;
  startedAt:number;
};

declare global{
  interface Window{
    __YKS_V4_BOOTSTRAP__?:BootstrapState;
  }
}

const bootstrap:BootstrapState={
  version:"4.0.0-alpha.1",
  stack:"vite-typescript",
  legacyRuntime:true,
  startedAt:Date.now()
};

window.__YKS_V4_BOOTSTRAP__=bootstrap;
document.documentElement.dataset.v4Runtime="ready";
window.dispatchEvent(new CustomEvent<BootstrapState>("yks:v4-bootstrap",{detail:bootstrap}));

export {};
