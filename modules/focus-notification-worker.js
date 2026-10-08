/* Persistent focus controls. Imported by the existing service worker; no polling,
   scheduled alarms, network requests, or page-dependent background timers. */
(function (worker) {
  "use strict";
  const DB_NAME = "yks-focus-notifications-v1";
  const STORE = "state";
  const KEY = "current";
  const TAG = "yks-focus-timer";
  const MAX_SECONDS = 24 * 60 * 60;
  const MAX_ELAPSED = 7 * 24 * 60 * 60 * 1000;
  let queue = Promise.resolve();
  let opening;

  function failure(code) { const error = new Error(code); error.code = code; return error; }
  function root() { return new URL(worker.registration.scope); }
  function inScope(url) {
    try {
      const base = root(), candidate = new URL(url);
      return candidate.origin === base.origin && candidate.pathname.startsWith(base.pathname);
    } catch (_) { return false; }
  }
  function serialize(operation) {
    const pending = queue.then(operation);
    queue = pending.catch(() => {});
    return pending;
  }
  function text(value, length) {
    if (typeof value !== "string") throw failure("invalid_snapshot");
    return value.replace(/[\u0000-\u001f\u007f]/g, " ").trim().slice(0, length);
  }
  function number(value, min, max) {
    if (typeof value !== "number" || !Number.isFinite(value) || value < min || value > max) throw failure("invalid_snapshot");
    return value;
  }
  function canonical(value) {
    if (!value || typeof value !== "object" || value.version !== 1
      || typeof value.id !== "string" || !/^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/.test(value.id)
      || !["running", "paused"].includes(value.state) || typeof value.isWork !== "boolean"
      || (value.mode !== undefined && !["pomo", "sw"].includes(value.mode))) throw failure("invalid_snapshot");
    const mode = value.mode || "pomo";
    const snapshot = {
      version: 1, id: value.id, mode, state: value.state, isWork: value.isWork,
      total: Math.round(number(value.total, 1, MAX_SECONDS)),
      left: Math.round(number(value.left, 0, MAX_SECONDS)),
      endAt: number(value.endAt, 0, 8640000000000000),
      startedAt: number(value.startedAt, 0, 8640000000000000),
      credited: number(value.credited, 0, MAX_ELAPSED / 60000),
      subject: text(value.subject, 80), topic: text(value.topic, 100), task: text(value.task, 100),
      savedAt: number(value.savedAt, 0, 8640000000000000)
    };
    if (mode === "sw") {
      snapshot.elapsed = number(value.elapsed, 0, MAX_ELAPSED);
      snapshot.total = MAX_SECONDS; snapshot.left = 0; snapshot.endAt = 0;
    } else {
      if (snapshot.left > snapshot.total || snapshot.credited > snapshot.total / 60
        || (snapshot.state === "running" && snapshot.endAt === 0)) throw failure("invalid_snapshot");
      if (snapshot.state === "paused") snapshot.endAt = 0;
    }
    return snapshot;
  }
  function currentSnapshot(value, now) {
    if (value === null) return null;
    const snapshot = canonical(value);
    if (snapshot.mode === "sw") {
      if (snapshot.state === "running") {
        snapshot.elapsed = Math.min(MAX_ELAPSED, snapshot.elapsed + Math.max(0, now - snapshot.savedAt));
        snapshot.savedAt = now;
      }
    } else if (snapshot.state === "running") {
      snapshot.left = Math.max(0, Math.min(snapshot.total, Math.ceil((snapshot.endAt - now) / 1000)));
    }
    return snapshot;
  }
  function record(value) {
    if (value === undefined) return { revision: 0, snapshot: null };
    if (!value || !Number.isSafeInteger(value.revision) || value.revision < 0 || !("snapshot" in value)) throw failure("invalid_stored_state");
    return { revision: value.revision, snapshot: value.snapshot === null ? null : canonical(value.snapshot) };
  }
  function visibleRecord(value) { return { revision: value.revision, snapshot: currentSnapshot(value.snapshot, Date.now()) }; }
  function database() {
    if (!worker.indexedDB) return Promise.reject(failure("storage_unavailable"));
    if (opening) return opening;
    opening = new Promise((resolve, reject) => {
      let request, unavailable = false;
      try { request = worker.indexedDB.open(DB_NAME, 1); } catch (_) { reject(failure("storage_unavailable")); return; }
      request.onupgradeneeded = () => {
        if (!request.result.objectStoreNames.contains(STORE)) request.result.createObjectStore(STORE);
      };
      request.onerror = request.onblocked = () => { unavailable = true; reject(failure("storage_unavailable")); };
      request.onsuccess = () => {
        const db = request.result;
        if (unavailable) { db.close(); return; }
        db.onversionchange = () => { db.close(); opening = undefined; };
        db.onclose = () => { opening = undefined; };
        resolve(db);
      };
    }).catch(error => { opening = undefined; throw error; });
    return opening;
  }
  async function transaction(mutate) {
    const db = await database();
    return new Promise((resolve, reject) => {
      let tx, result, thrown;
      try {
        tx = db.transaction(STORE, mutate ? "readwrite" : "readonly");
        const store = tx.objectStore(STORE), get = store.get(KEY);
        get.onsuccess = () => {
          try {
            const previous = record(get.result);
            result = mutate ? mutate(previous) : previous;
            if (mutate && result !== previous) store.put(result, KEY);
          } catch (error) { thrown = error; tx.abort(); }
        };
        tx.oncomplete = () => resolve(result);
        tx.onerror = tx.onabort = () => reject(thrown || failure("storage_unavailable"));
      } catch (_) { reject(failure("storage_unavailable")); }
    });
  }
  function next(previous, snapshot) {
    if (previous.revision >= Number.MAX_SAFE_INTEGER) throw failure("revision_exhausted");
    return { revision: previous.revision + 1, snapshot };
  }
  async function closeTimer() {
    const notifications = await worker.registration.getNotifications({ tag: TAG });
    for (const notification of notifications) if (notification.tag === TAG && notification.data?.type === "yks-focus") notification.close();
  }
  async function closeLegacyTimer() {
    const notifications = await worker.registration.getNotifications({ tag: "yks-focus-running" });
    for (const notification of notifications) if (notification.tag === "yks-focus-running" && notification.data?.kind === "focus") notification.close();
  }
  function time(value) {
    return new Date(value).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
  }
  function duration(seconds) {
    const whole = Math.max(0, Math.ceil(seconds));
    return Math.floor(whole / 60) + " dk " + String(whole % 60).padStart(2, "0") + " sn";
  }
  async function notify(value, enabled) {
    try {
      // The preceding release used a different timer tag. Leave all unrelated
      // reminders alone while replacing that obsolete focus notification.
      await closeLegacyTimer().catch(() => {});
      if (!enabled || !value.snapshot) { await closeTimer(); return null; }
      const snapshot = currentSnapshot(value.snapshot, Date.now()), paused = snapshot.state === "paused";
      const stopwatch = snapshot.mode === "sw", subject = snapshot.subject || (snapshot.isWork ? "Odak oturumu" : "Mola");
      const title = stopwatch ? (paused ? "Kronometre duraklatıldı" : "Kronometre sürüyor")
        : (paused ? (snapshot.isWork ? "Odak duraklatıldı" : "Mola duraklatıldı") : (snapshot.isWork ? "Odak sürüyor" : "Mola sürüyor"));
      const detail = stopwatch ? (paused ? "Geçen süre: " + duration(snapshot.elapsed / 1000) : "Başlangıç: " + time(snapshot.startedAt))
        : (paused ? "Kalan: " + duration(snapshot.left) : "Bitiş: " + time(snapshot.endAt));
      const actions = (stopwatch || snapshot.left > 0) ? [
        { action: paused ? "focus-resume" : "focus-pause", title: paused ? "Devam et" : "Duraklat" },
        { action: "focus-open", title: "Uygulamayı aç" }
      ] : [{ action: "focus-open", title: "Uygulamayı aç" }];
      await worker.registration.showNotification(title, {
        body: subject + " · " + detail, tag: TAG, lang: "tr", dir: "ltr",
        icon: new URL("icon-192.png", root()).href, badge: new URL("icon-192.png", root()).href,
        requireInteraction: true, silent: true, renotify: false, actions,
        data: { type: "yks-focus", id: snapshot.id, revision: value.revision }
      });
      return null;
    } catch (_) { return "notification_unavailable"; }
  }
  async function clientsInScope() {
    return (await worker.clients.matchAll({ type: "window", includeUncontrolled: true })).filter(client => inScope(client.url));
  }
  async function broadcast(value, requestId) {
    try {
      const message = Object.assign({ type: "YKS_FOCUS_STATE" }, visibleRecord(value));
      if (typeof requestId === "string") message.requestId = requestId;
      for (const client of await clientsInScope()) { try { client.postMessage(message); } catch (_) {} }
    } catch (_) {}
  }
  async function openFocus() {
    const list = await clientsInScope();
    const client = list.find(item => item.focused) || list.find(item => item.visibilityState === "visible") || list[0];
    if (client) {
      client.postMessage({ type: "YKS_FOCUS_OPEN" });
      if (typeof client.focus === "function") await client.focus();
    } else if (worker.clients.openWindow) {
      const destination = root(); destination.searchParams.set("focus", "1");
      await worker.clients.openWindow(destination.href);
    }
  }
  async function request(data) {
    if (!["read", "sync", "clear"].includes(data.operation)) throw failure("invalid_operation");
    if (data.operation === "read") return Object.assign({ ok: true }, visibleRecord(await transaction()));
    if (!Number.isSafeInteger(data.expectedRevision) || data.expectedRevision < 0
      || (data.requestId !== undefined && (typeof data.requestId !== "string" || data.requestId.length > 160))
      || (data.operation === "sync" && typeof data.enabled !== "boolean")) throw failure("invalid_request");
    const snapshot = data.operation === "clear" ? null : canonical(data.snapshot);
    let conflict = false;
    const result = await transaction(previous => {
      if (previous.revision !== data.expectedRevision) { conflict = true; return previous; }
      return next(previous, snapshot);
    });
    if (conflict) return Object.assign({ ok: false, error: "revision_conflict" }, visibleRecord(result));
    const notificationError = await notify(result, data.enabled === true);
    await broadcast(result, data.requestId);
    return Object.assign({ ok: true }, visibleRecord(result), notificationError ? { notificationError } : {});
  }
  function handleMessage(event) {
    if (event.data?.type !== "YKS_FOCUS_REQUEST") return false;
    const port = event.ports?.[0];
    const pending = serialize(async () => {
      try {
        if (!port || event.source?.type !== "window" || !inScope(event.source.url)
          || (event.origin && event.origin !== root().origin)) throw failure("invalid_client");
        return await request(event.data);
      } catch (error) { return { ok: false, revision: 0, snapshot: null, error: error.code || "storage_unavailable" }; }
    }).then(result => { try { port?.postMessage(result); } catch (_) {} });
    event.waitUntil(pending);
    return true;
  }
  function handleClick(event) {
    const data = event.notification?.data;
    if (data?.type !== "yks-focus" || event.notification.tag !== TAG) return false;
    const pending = serialize(async () => {
      const action = event.action || "focus-open";
      if (action === "focus-open") { await openFocus(); return; }
      if (!["focus-pause", "focus-resume"].includes(action)) return;
      let changed = false, expired = false;
      const result = await transaction(previous => {
        if (!previous.snapshot || previous.snapshot.id !== data.id || previous.revision !== data.revision) return previous;
        const now = Date.now(), snapshot = currentSnapshot(previous.snapshot, now);
        if (snapshot.mode !== "sw" && snapshot.left <= 0) { expired = true; return previous; }
        if ((action === "focus-pause" && snapshot.state !== "running")
          || (action === "focus-resume" && snapshot.state !== "paused")) return previous;
        snapshot.state = action === "focus-pause" ? "paused" : "running";
        snapshot.savedAt = now;
        if (snapshot.mode !== "sw") {
          snapshot.endAt = snapshot.state === "running" ? now + snapshot.left * 1000 : 0;
          // A paused interval must never become credited focus time on reopening.
          snapshot.startedAt = now - (snapshot.total - snapshot.left) * 1000;
        }
        changed = true;
        return next(previous, snapshot);
      });
      if (changed) { await notify(result, true); await broadcast(result); }
      if (expired) await openFocus();
    }).catch(() => {});
    event.waitUntil(pending);
    return true;
  }
  worker.YKSFocusNotificationsWorker = Object.freeze({ handleMessage, handleClick });
})(self);
