/* The lab owns routing; load these tools only when the reading tab opens. */
(() => {
  "use strict";
  const base = new URL("speed-reading/", document.currentScript?.src || new URL("modules/speed-reading-learn-v1.js", document.baseURI));
  let pending = null;
  function stylesheet() {
    const existing = document.getElementById("speedReadingStyles");
    if (existing?.sheet) return Promise.resolve();
    return new Promise((resolve, reject) => {
      const link = existing || document.createElement("link");
      link.id = "speedReadingStyles"; link.rel = "stylesheet"; link.href = new URL("speed-reading.css", base).href;
      link.onload = () => resolve();
      link.onerror = () => {link.remove(); reject(new Error("Okuma stilleri yüklenemedi."));};
      if (!existing) document.head.appendChild(link);
    });
  }
  window.srInitLearn = function () {
    const root = document.getElementById("speedReadingLearn");
    if (!root) return Promise.resolve();
    if (window.YKSSpeedReading) {window.YKSSpeedReading.mount(root); return Promise.resolve(window.YKSSpeedReading);}
    if (pending) return pending;
    root.innerHTML = '<p role="status">Okuma alanı hazırlanıyor…</p>';
    pending = Promise.all([stylesheet(), import(new URL("runtime.mjs", base).href)]).then(([, module]) => {
      window.YKSSpeedReading = module.createReadingRuntime(); window.YKSSpeedReading.mount(root); return window.YKSSpeedReading;
    }).catch(() => {
      root.innerHTML = '<p role="alert">Okuma alanı yüklenemedi. Bağlantını kontrol edip yeniden deneyebilirsin.</p><button type="button" id="srLoadRetry">Yeniden dene</button>';
      root.querySelector("#srLoadRetry")?.addEventListener("click", () => window.srInitLearn()); pending = null;
    });
    return pending;
  };
})();
