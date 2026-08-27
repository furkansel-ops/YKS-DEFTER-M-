interface BiologyAtlasApi {mount(panel: HTMLElement | null): boolean; suspend(): void;}
declare global {interface Window {YKSBiologyAtlas?: BiologyAtlasApi;}}

/** Keep the heavy atlas/Three.js chunks outside the normal application boot. */
export function installBiologyAtlas(): BiologyAtlasApi {
  if (window.YKSBiologyAtlas) return window.YKSBiologyAtlas;
  let module: BiologyAtlasApi | null = null, pending: Promise<void> | null = null;
  let current: HTMLElement | null = null, failedPanel: HTMLElement | null = null, wanted = false;
  const api: BiologyAtlasApi = {
    mount(panel) {
      if (!panel) return false;
      current = panel; wanted = true;
      if (module) return module.mount(panel);
      // The legacy lab observes DOM mutations. Do not turn an import failure
      // into an endless re-render/retry loop; only the retry button resets it.
      if (failedPanel === panel) return true;
      if (!pending) {
        panel.innerHTML = '<p role="status">Biyoloji Atlası hazırlanıyor…</p>';
        pending = import("./biology-atlas.ts").then(({createBiologyAtlas}) => {
          module = createBiologyAtlas(); if (wanted && current?.isConnected) module.mount(current);
        }).catch(() => {
          if (wanted && current) {
            failedPanel = current;
            current.innerHTML = '<p role="status">Atlas yüklenemedi. Bağlantını kontrol edip yeniden deneyebilirsin.</p><button type="button">Yeniden dene</button>';
            current.querySelector("button")?.addEventListener("click", () => {failedPanel=null;api.mount(current);}, {once:true});
          }
        }).finally(() => {pending=null;});
      }
      return true;
    },
    suspend() {wanted=false; module?.suspend();}
  };
  window.YKSBiologyAtlas = api; return api;
}
