interface BiologyAtlasApi {mount(panel: HTMLElement | null): boolean; suspend(): void;}
declare global {interface Window {YKSBiologyAtlas?: BiologyAtlasApi;}}

/** Keep the heavy atlas/Three.js chunks outside the normal application boot. */
export function installBiologyAtlas(): BiologyAtlasApi {
  if (window.YKSBiologyAtlas) return window.YKSBiologyAtlas;
  let module: BiologyAtlasApi | null = null, pending: Promise<void> | null = null;
  let current: HTMLElement | null = null, failedPanel: HTMLElement | null = null, wanted = false;
  const enhance = (target: HTMLElement) => {
    // v4.4 teaching additions are optional and fail-open: an enhancer error must
    // never block the Atlas, login/bootstrap or the underlying 3B viewer.
    void import("./biology-yks-question-v44.ts").then(({installBiologyYksQuestionFocus}) => {
      if (wanted && current === target && target.isConnected) installBiologyYksQuestionFocus(target);
    }).catch(() => {});
  };
  const api: BiologyAtlasApi = {
    mount(panel) {
      if (!panel) return false;
      current = panel; wanted = true;
      if (module) {const mounted=module.mount(panel);if(mounted)enhance(panel);return mounted;}
      // The legacy lab observes DOM mutations. Do not turn an import failure
      // into an endless re-render/retry loop; only the retry button resets it.
      if (failedPanel === panel) return true;
      if (!pending) {
        panel.innerHTML = '<p role="status">Biyoloji Atlası hazırlanıyor…</p>';
        pending = import("./biology-atlas.ts").then(({createBiologyAtlas}) => {
          module = createBiologyAtlas();
          if (wanted && current?.isConnected) {const target=current;if(module.mount(target))enhance(target);}
        }).catch(() => {
          if (wanted && current) {
            failedPanel = current;
            current.innerHTML = '<p role="status">Atlas yüklenemedi. Bağlantını kontrol et. Yeni bir sürüm yayımlandıysa sayfayı yenile.</p><button type="button" data-atlas-retry>Yeniden dene</button> <button type="button" data-atlas-reload>Sayfayı yenile</button>';
            current.querySelector("[data-atlas-retry]")?.addEventListener("click", () => {failedPanel=null;api.mount(current);}, {once:true});
            current.querySelector("[data-atlas-reload]")?.addEventListener("click", () => window.location.reload(), {once:true});
          }
        }).finally(() => {pending=null;});
      }
      return true;
    },
    suspend() {wanted=false; module?.suspend();}
  };
  window.YKSBiologyAtlas = api; return api;
}
