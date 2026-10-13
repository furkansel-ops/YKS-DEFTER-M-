const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const source = fs.readFileSync(path.resolve(__dirname, "../modules/focus-notifications.js"), "utf8");
const scope = "https://example.test/YKS-DEFTER-M-/";
const key = "yks-focus-notification-link-v1";
const epoch = Date.UTC(2026, 9, 8, 12);
const clone = value => value === undefined ? undefined : JSON.parse(JSON.stringify(value));
const settle = async () => { for (let index = 0; index < 8; index++) await new Promise(resolve => setImmediate(resolve)); };
function timer(overrides = {}) {
  return { version: 1, id: "a", mode: "pomo", state: "paused", isWork: true, total: 1500, left: 1380,
    endAt: 0, startedAt: epoch - 120000, credited: 1, subject: "Matematik", topic: "", task: "", savedAt: epoch, ...overrides };
}

function harness({ meta = { id: "a", mode: "pomo", revision: 1, credited: 1 }, snapshot = timer(), revision = 2, onRequest, echo = false, native = false, initial = {} } = {}) {
  const local = new Map(), requests = [], workerRequests = [], histories = [], listeners = {}, nativeEvents = {}, intervals = new Map(), timeouts = new Map();
  const nativeCapabilities = { permission: "granted", liveUpdatesSupported: true, promotionAllowed: true, promoted: false, ...native };
  const metaKey = native ? "yks-focus-native-link-v1" : key;
  let permissionRequests = 0, removedListeners = 0;
  const record = { revision, snapshot: clone(snapshot) };
  let now = epoch, handle = 0, minutes = 0;
  if (meta) local.set(metaKey, JSON.stringify(meta));
  const status = { textContent: "" };
  class Clock extends Date { static now() { return now; } }
  class MessageChannel {
    constructor() {
      let closed = false;
      this.port1 = { close() { closed = true; }, onmessage: null };
      this.port2 = { postMessage: value => { if (!closed) this.port1.onmessage?.({ data: value }); } };
    }
  }
  async function handleRequest(data, isNative = false) {
        requests.push(clone(data));
        let result;
        if (onRequest) result = await onRequest(clone(data), record);
        if (!result) {
          if (data.operation === "read") result = { ok: true, ...clone(record) };
          else if (data.expectedRevision !== record.revision) result = { ok: false, error: "revision_conflict", ...clone(record) };
          else { record.revision++; record.snapshot = data.operation === "clear" ? null : clone(data.snapshot); result = { ok: true, ...clone(record) }; }
        }
        if (isNative) result.capabilities = clone(nativeCapabilities);
        if (echo && data.operation !== "read" && result.ok) {
          const message = { type: "YKS_FOCUS_STATE", ...clone(result), requestId: data.requestId };
          if (isNative) nativeEvents.stateChanged?.(message);
          else workerListeners.message?.({ source: { scriptURL: scope + "sw.js" }, data: message });
        }
        return result;
  }
  const registration = { active: {
    scriptURL: scope + "sw.js",
    postMessage(data, ports) {
      workerRequests.push(clone(data));
      Promise.resolve().then(async () => ports[0].postMessage(await handleRequest(data)));
    }
  } };
  const plugin = {
    async request(data) { return handleRequest(data, true); },
    async requestPermission() { permissionRequests++; nativeCapabilities.permission = native.permissionResult || "granted"; return clone(nativeCapabilities); },
    async addListener(name, callback) {
      nativeEvents[name] = callback;
      if (name === "open" && native.coldOpen) callback({ type: "YKS_FOCUS_OPEN" });
      return { async remove() { removedListeners++; delete nativeEvents[name]; } };
    }
  };
  const workerListeners = {};
  const state = {
    URL, Date: Clock, MessageChannel, Notification: { permission: "granted" },
    location: { href: scope, origin: new URL(scope).origin },
    crypto: { randomUUID: () => "new-session" },
    navigator: { serviceWorker: {
      async getRegistration() { return registration; }, ready: Promise.resolve(registration),
      addEventListener(name, callback) { workerListeners[name] = callback; }
    } },
    document: { baseURI: scope, readyState: "complete", hidden: false,
      querySelector() { return null; }, getElementById() { return status; },
      addEventListener(name, callback) { listeners[name] = callback; }
    },
    localStorage: { getItem: name => local.get(name) ?? null, setItem: (name, value) => local.set(name, String(value)), removeItem: name => local.delete(name) },
    setTimeout(callback) { const id = ++handle; timeouts.set(id, callback); return id; },
    clearTimeout(id) { timeouts.delete(id); },
    setInterval(callback) { const id = ++handle; intervals.set(id, callback); return id; },
    clearInterval(id) { intervals.delete(id); },
    addEventListener(name, callback) { listeners[name] = callback; },
    pomoTimer: 1, swTimer: null, pomoState: "running", pomoIsWork: true, pomoTotal: 1500, pomoLeft: 1380,
    pomoEndAt: epoch + 1380000, pomoStartedAt: epoch - 120000, pomoCredited: 1, pomoSubject: "Matematik", pomoTask: "", pomoTopic: "",
    S: { focus: { mode: "pomo", sw: { run: false, acc: 0, start: 0, cr: 0 } } },
    notifCfg: () => ({ on: true, pomo: true }),
    sw() { return state.S.focus.sw; },
    swElapsed() { const watch = state.sw(); return watch.acc + (watch.run ? now - watch.start : 0); },
    swCreditElapsed(elapsed) { const watch = state.sw(), total = Math.floor(elapsed / 60000); if (total > watch.cr) { minutes += total - watch.cr; watch.cr = total; } },
    swHistoryAdd(...args) { histories.push(args); },
    creditMinutes() {
      if (!state.pomoIsWork || !state.pomoStartedAt || state.pomoState === "paused") return;
      const total = Math.min(Math.floor((now - state.pomoStartedAt) / 60000), Math.round(state.pomoTotal / 60));
      if (total > state.pomoCredited) { minutes += total - state.pomoCredited; state.pomoCredited = total; }
    },
    save() {}, renderPomo() {}, renderSw() {}, renderSwHistory() {}, stopNoise() {}, releaseWake() {}, requestWake() {},
    startPomo() { state.pomoState = "running"; state.pomoEndAt = now + state.pomoLeft * 1000; },
    pausePomo() { state.pomoState = "paused"; state.pomoLeft = Math.max(0, (state.pomoEndAt - now) / 1000); },
    resetPomo() { state.pomoState = "idle"; state.pomoCredited = 0; state.pomoLeft = state.pomoTotal; },
    finishPhase() { state.pomoState = "idle"; }, skipPhase() {},
    swStart() { state.sw().run = true; state.sw().start = now; },
    swPause() { const elapsed = state.swElapsed(); state.sw().acc = elapsed; state.sw().run = false; state.sw().start = 0; },
    swReset() { Object.assign(state.sw(), { run: false, start: 0, acc: 0, cr: 0 }); },
    swSwitchSubject(subject) {
      const watch = state.sw();
      if (watch.run && subject !== state.pomoSubject) {
        const elapsed = state.swElapsed(); state.swCreditElapsed(elapsed);
        state.swHistoryAdd(now - watch.start, state.pomoSubject, watch.start, now);
        watch.acc = elapsed; watch.start = now;
      }
      state.pomoSubject = subject;
    },
    setPomoSubject(subject) { if (state.S.focus.mode === "sw" && state.sw().run) return state.swSwitchSubject(subject); state.pomoSubject = subject; },
    setPomoTask(value) { state.pomoTask = value; }, setPomoTopic(value) { state.pomoTopic = value; },
    pomoTick() { state.creditMinutes(); }, swTick() { state.swCreditElapsed(state.swElapsed()); },
    YKSStability: { clearRuntime() { local.delete("yks_focus_runtime_v1"); }, persistRuntime() {} },
    ...initial
  };
  if (native) {
    state.Capacitor = { isNativePlatform: () => true, getPlatform: () => "android", Plugins: native.available === false || native.registerOnly ? {} : { FocusNotifications: plugin } };
    if (native.registerOnly) state.Capacitor.registerPlugin = name => { assert.equal(name, "FocusNotifications"); return plugin; };
    if (!Object.hasOwn(initial, "Notification")) state.Notification = undefined;
    if (native.noServiceWorker) state.navigator = {};
  }
  const context = vm.createContext(state); state.window = context;
  vm.runInContext(source, context);
  return {
    state, local, record, requests, workerRequests, histories, intervals, status, listeners, nativeCapabilities, metaKey,
    get minutes() { return minutes; },
    get permissionRequests() { return permissionRequests; },
    get removedListeners() { return removedListeners; },
    installNative() { state.Capacitor.Plugins.FocusNotifications = plugin; },
    advance(ms) { now += ms; },
    async restore(callback = () => {}) { await state.YKSFocusNotifications.restore(callback); await settle(); },
    async message(value, scriptURL = scope + "sw.js") { workerListeners.message?.({ source: { scriptURL }, data: value }); await settle(); },
    async nativeMessage(name, value) { nativeEvents[name]?.(value); await settle(); }
  };
}

test("worker-restored paused countdown excludes paused time and credits elapsed minutes once", async () => {
  const app = harness(); let fallback = 0;
  app.advance(600000); await app.restore(() => fallback++);
  assert.equal(fallback, 0); assert.equal(app.state.pomoState, "paused"); assert.equal(app.state.pomoLeft, 1380);
  assert.equal(app.state.pomoCredited, 2); assert.equal(app.minutes, 1);
  assert.equal(app.intervals.size, 0);
  await app.state.YKSFocusNotifications.refresh(); await settle();
  assert.equal(app.minutes, 1); assert.equal(app.state.pomoLeft, 1380);
});

test("persisted worker timer restores when local notification metadata is missing", async () => {
  const app = harness({ meta: null, initial: { pomoState: "idle" } }); let fallback = 0;
  await app.restore(() => fallback++);
  assert.equal(fallback, 0); assert.equal(app.state.pomoState, "paused");
  assert.equal(app.record.snapshot.id, "a"); assert.equal(app.record.snapshot.left, 1380);
});

test("clear tombstone newer than local metadata prevents resurrection of a stopped timer", async () => {
  const app = harness({ snapshot: null }); let fallback = 0;
  await app.restore(() => fallback++);
  assert.equal(fallback, 0); assert.equal(app.state.pomoState, "idle"); assert.equal(app.record.snapshot, null);
});

test("storage error while publishing never clears the still-working local timer", async () => {
  const app = harness({ meta: null, snapshot: null, revision: 0, onRequest: data => data.operation === "sync"
    ? { ok: false, revision: 0, snapshot: null, error: "storage_unavailable" } : undefined });
  await app.restore();
  assert.equal(app.state.pomoState, "running"); assert.equal(app.state.pomoLeft, 1380);
  assert.match(app.status.textContent, /storage|kay|bildirim|bağlantı/i);
});

test("revision conflict applies the authoritative paused timer instead of overwriting it", async () => {
  let conflict = true;
  const app = harness({ onRequest: (data, record) => {
    if (data.operation === "sync" && conflict) {
      conflict = false; record.revision += 2; record.snapshot = timer({ left: 1200, credited: 2 });
      return { ok: false, error: "revision_conflict", ...clone(record) };
    }
  } });
  await app.restore();
  assert.equal(app.state.pomoState, "paused"); assert.equal(app.state.pomoLeft, 1200); assert.equal(app.record.snapshot.left, 1200);
});

test("stopwatch recovery credits only the missing delta and does not duplicate paused history", async () => {
  const app = harness({ meta: { id: "a", mode: "sw", revision: 1, credited: 1, historyElapsed: 60000 },
    snapshot: timer({ mode: "sw", total: 43200, left: 0, elapsed: 120000, credited: 1 }),
    initial: { pomoState: "idle", S: { focus: { mode: "sw", sw: { run: true, acc: 60000, start: epoch - 60000, cr: 1 } } } } });
  app.advance(600000); await app.restore();
  assert.equal(app.state.sw().run, false); assert.equal(app.state.sw().acc, 120000); assert.equal(app.minutes, 1);
  assert.equal(app.histories.length, 1); assert.equal(app.histories[0][0], 60000);
  await app.state.YKSFocusNotifications.refresh(); await settle();
  assert.equal(app.histories.length, 1); assert.equal(app.minutes, 1);
});

test("restoring another mode leaves exactly one active clock", async () => {
  const app = harness({ snapshot: timer({ mode: "sw", state: "running", elapsed: 120000, total: 43200, left: 0 }) });
  await app.restore();
  assert.equal(app.state.sw().run, true); assert.notEqual(app.state.pomoState, "running"); assert.equal(app.intervals.size, 1);
});

test("same-origin worker outside this app cannot send timer state changes", async () => {
  const app = harness(); await app.restore();
  await app.message({ type: "YKS_FOCUS_STATE", revision: 999, snapshot: null }, "https://example.test/other-app/sw.js");
  assert.equal(app.state.pomoState, "paused"); assert.equal(JSON.parse(app.local.get(key)).id, "a");
});

test("running stopwatch reconciliation does not mark elapsed time as already recorded history", async () => {
  const app = harness({ meta: { id: "a", mode: "sw", revision: 1, credited: 0, historyElapsed: 0 },
    snapshot: timer({ mode: "sw", state: "running", total: 43200, left: 0, elapsed: 120000, credited: 0 }),
    initial: { pomoState: "idle", S: { focus: { mode: "sw", sw: { run: true, acc: 0, start: epoch - 120000, cr: 0 } } } } });
  await app.restore(); assert.equal(app.histories.length, 0);
  app.advance(60000);
  await app.message({ type: "YKS_FOCUS_STATE", revision: app.record.revision + 1,
    snapshot: timer({ mode: "sw", total: 43200, left: 0, elapsed: 180000, credited: 2, savedAt: epoch + 60000 }) });
  assert.equal(app.histories.length, 1); assert.equal(app.histories[0][0], 180000);
  assert.equal(app.histories[0][3], epoch + 60000);
});

test("new stopwatch identity retains its recorded history boundary across later reads", async () => {
  const app = harness({ meta: { id: "old", mode: "sw", revision: 1, historyElapsed: 900000 },
    snapshot: timer({ id: "new", mode: "sw", total: 43200, left: 0, elapsed: 120000, credited: 0 }),
    initial: { pomoState: "idle", S: { focus: { mode: "sw", sw: { run: false, acc: 900000, start: 0, cr: 15 } } } } });
  await app.restore();
  assert.equal(app.histories.length, 1); assert.equal(app.histories[0][0], 120000);
  assert.equal(JSON.parse(app.local.get(key)).historyElapsed, 120000);
  await app.state.YKSFocusNotifications.refresh(); await settle();
  assert.equal(app.histories.length, 1);
});

test("late acknowledgement and its worker echo cannot restore an old identity over reset and restart", async () => {
  let release, held = false;
  const app = harness({ echo: true, onRequest: (data, record) => {
    if (data.operation !== "sync" || held) return;
    held = true;
    return new Promise(resolve => { release = () => {
      record.revision++; record.snapshot = clone(data.snapshot);
      resolve({ ok: true, ...clone(record) });
    }; });
  } });
  await app.restore(); assert.equal(typeof release, "function");
  app.state.resetPomo(); app.state.startPomo();
  const currentId = JSON.parse(app.local.get(key)).id;
  assert.equal(currentId, "new-session");
  release(); await settle();
  assert.equal(app.state.pomoState, "running"); assert.equal(app.state.pomoLeft, 1500);
  assert.equal(JSON.parse(app.local.get(key)).id, currentId); assert.equal(app.record.snapshot.id, currentId);
});

test("foreground reconciliation waits for an in-flight local action before reading worker state", async () => {
  let hold = false, release;
  const app = harness({ echo: true, onRequest: (data, record) => {
    if (!hold || data.operation !== "sync") return;
    hold = false;
    return new Promise(resolve => { release = () => {
      record.revision++; record.snapshot = clone(data.snapshot);
      resolve({ ok: true, ...clone(record) });
    }; });
  } });
  await app.restore(); hold = true;
  app.state.startPomo(); await settle();
  assert.equal(typeof release, "function");
  const refreshed = app.state.YKSFocusNotifications.refresh(); await settle();
  release(); await refreshed; await settle();
  assert.equal(app.state.pomoState, "running"); assert.equal(app.record.snapshot.state, "running");
});

test("stopwatch subject switch updates background identity and history before remote pause", async () => {
  const app = harness({ meta: { id: "a", mode: "sw", revision: 1, credited: 0, historyElapsed: 0 },
    snapshot: timer({ mode: "sw", state: "running", total: 86400, left: 0, elapsed: 0, credited: 0 }),
    initial: { pomoState: "idle", S: { focus: { mode: "sw", sw: { run: true, acc: 0, start: epoch, cr: 0 } } } } });
  await app.restore(); app.advance(180000);
  app.state.swSwitchSubject("Fizik"); await settle();
  assert.equal(app.record.snapshot.subject, "Fizik"); assert.equal(app.record.snapshot.credited, 3);
  assert.equal(app.histories.length, 1); assert.equal(app.histories[0][0], 180000); assert.equal(app.histories[0][1], "Matematik");
  assert.equal(JSON.parse(app.local.get(key)).historyElapsed, 180000);
  app.advance(60000);
  await app.message({ type: "YKS_FOCUS_STATE", revision: app.record.revision + 1,
    snapshot: timer({ mode: "sw", subject: "Fizik", total: 86400, left: 0, elapsed: 240000, credited: 3, savedAt: epoch + 240000 }) });
  assert.equal(app.histories.length, 2); assert.equal(app.histories[1][0], 60000); assert.equal(app.histories[1][1], "Fizik");
  assert.equal(app.minutes, 4); assert.equal(app.state.pomoSubject, "Fizik");
});

test("failed startup reconciliation cannot restore an old timer over a new local stopwatch", async () => {
  let release, held = false, fallback = 0;
  const app = harness({ initial: { pomoState: "idle", pomoStartedAt: 0, pomoEndAt: 0 }, onRequest: data => {
    if (data.operation === "sync") return { ok: false, error: "storage_unavailable" };
    if (data.operation !== "read" || held) return;
    held = true;
    return new Promise(resolve => { release = () => resolve({ ok: false, error: "storage_unavailable" }); });
  } });
  const restoring = app.state.YKSFocusNotifications.restore(() => { fallback++; app.state.pomoState = "running"; });
  await settle(); app.state.swStart();
  release(); await restoring; await settle();
  assert.equal(fallback, 0);
  assert.equal(app.state.pomoState, "idle"); assert.equal(app.state.sw().run, true);
  assert.equal(app.intervals.size, 1);
});

test("focus preference remains independent of reminder opt-in while respecting permission and its own toggle", async () => {
  for (const [config, permission, expected] of [
    [{ on: false, pomo: true }, "granted", true],
    [{ on: true, pomo: false }, "granted", false],
    [{ on: false, pomo: true }, "denied", false]
  ]) {
    const app = harness({ initial: { notifCfg: () => config, Notification: { permission } } });
    await app.restore();
    assert.equal(app.requests.find(request => request.operation === "sync").enabled, expected);
  }
});

test("shutdown zeroes clocks before lifecycle persistence and ignores a late restoration response", async () => {
  let release, held = false, fallback = 0;
  const deleted = [];
  const app = harness({ initial: { indexedDB: { deleteDatabase(name) {
    deleted.push(name); const request = {};
    Promise.resolve().then(() => request.onsuccess?.()); return request;
  } } }, onRequest: (data, record) => {
    if (data.operation !== "read" || held) return;
    held = true;
    const original = clone(record);
    return new Promise(resolve => { release = () => resolve({ ok: true, ...original }); });
  } });
  const restoring = app.state.YKSFocusNotifications.restore(() => fallback++);
  await settle();
  app.local.set("yks_focus_runtime_v1", "old timer");
  await app.state.YKSFocusNotifications.shutdown();
  assert.equal(app.local.has("yks_focus_runtime_v1"), false);
  assert.deepEqual(deleted, ["yks-focus-notifications-v1"]);
  assert.equal(app.record.snapshot, null);
  release(); await restoring; await settle();
  app.state.startPomo(); app.state.swStart();
  assert.equal(fallback, 0); assert.equal(app.intervals.size, 0);
  assert.equal(app.state.pomoState, "idle"); assert.equal(app.state.pomoStartedAt, 0); assert.equal(app.state.pomoEndAt, 0);
  assert.deepEqual(clone(app.state.sw()), { run: false, start: 0, acc: 0, cr: 0 });
  app.local.clear();
  // Exercise the actual legacy persistence callback used by its pagehide listener.
  const stability = fs.readFileSync(path.resolve(__dirname, "../modules/stability.js"), "utf8");
  const persistence = stability.slice(stability.indexOf("function runtimeSnapshot()"), stability.indexOf("function clearRuntime()"));
  app.state.APP_VERSION = "4.1.0";
  vm.runInContext('const RUNTIME_KEY="yks_focus_runtime_v1";let lastRuntimeWrite=0;' + persistence + 'window.persistAfterDelete=persistRuntime;', app.state);
  app.state.persistAfterDelete(true);
  app.listeners.pagehide(); app.state.YKSFocusNotifications.checkpoint();
  await app.state.YKSFocusNotifications.refresh();
  assert.equal(app.local.size, 0, "late lifecycle callbacks cannot recreate deleted focus metadata");
});

test("Android restores and controls focus through the injected plugin without WebView notification or service worker support", async () => {
  for (const registerOnly of [false, true]) {
    const app = harness({ native: { noServiceWorker: true, registerOnly } });
    await app.restore();
    assert.equal(app.state.YKSFocusNotifications.native, true);
    assert.equal(app.state.pomoState, "paused");
    app.state.startPomo(); await settle();
    assert.equal(app.record.snapshot.state, "running");
    assert.equal(app.requests.at(-1).enabled, true);
    assert.equal(app.workerRequests.length, 0);
    assert.equal(app.permissionRequests, 0, "startup cannot show a permission prompt");
  }
});

test("missing native plugin leaves local timer usable and never falls back to web delivery; later readiness can recover", async () => {
  const app = harness({ native: { available: false } }); let restored = 0;
  await app.restore(() => restored++);
  assert.equal(restored, 1); assert.equal(app.state.pomoState, "running");
  assert.equal(app.requests.length, 0); assert.equal(app.workerRequests.length, 0);
  assert.match(app.status.textContent, /APK/);
  app.installNative(); await app.state.YKSFocusNotifications.refresh(); await settle();
  assert.equal(app.state.pomoState, "paused"); assert.equal(app.requests[0].operation, "read");
  assert.equal(app.workerRequests.length, 0);
});

test("only explicit native enable asks for permission and reveals a dismissed notification", async () => {
  const config = { on: false, pomo: true };
  const app = harness({ native: { permission: "prompt" }, initial: { notifCfg: () => config, askNotif() { throw new Error("must not ask WebView permission"); } } });
  await app.restore();
  assert.equal(app.permissionRequests, 0); assert.equal(app.requests.at(-1).enabled, false);
  assert.equal(app.requests.some(request => request.reveal), false);
  assert.equal(await app.state.YKSFocusNotifications.enable(), "granted");
  assert.equal(app.permissionRequests, 1); assert.equal(app.requests.at(-1).reveal, true);
  assert.equal(app.requests.at(-1).enabled, true); assert.equal(config.on, false);
  app.state.startPomo(); await settle();
  assert.equal(app.requests.at(-1).reveal, false);
  await app.state.YKSFocusNotifications.refresh(); await settle();
  assert.equal(app.requests.at(-1).reveal, false);
});

test("denied Android permission preserves the timer and does not enable or reveal its notification", async () => {
  const config = { pomo: false };
  const app = harness({ native: { permission: "denied", permissionResult: "denied" }, initial: { notifCfg: () => config } });
  await app.restore(); await app.state.YKSFocusNotifications.enable();
  assert.equal(app.state.pomoState, "paused"); assert.equal(config.pomo, false);
  assert.equal(app.requests.at(-1).enabled, false); assert.equal(app.requests.at(-1).reveal, false);
  assert.match(app.status.textContent, /Android Ayarları/);
  assert.equal(app.workerRequests.length, 0);
});

test("native live-update help distinguishes actual promotion from a request or unsupported system", async () => {
  for (const [capabilities, text] of [
    [{ promoted: true }, /Canlı bildirim etkin/],
    [{ promoted: false }, /sistem değerlendirir/],
    [{ promotionAllowed: false }, /izni kapalı/],
    [{ liveUpdatesSupported: false }, /desteklemiyor/]
  ]) {
    const app = harness({ native: capabilities }); await app.restore();
    assert.match(app.state.YKSFocusNotifications.statusText(), text);
  }
});

test("retained native body-open waits for persisted mode and native controls do not navigate the app", async () => {
  const pages = [], modes = [];
  const app = harness({ native: { coldOpen: true }, meta: null,
    snapshot: timer({ mode: "sw", elapsed: 60000, credited: 1 }),
    initial: { pomoState: "idle", go: page => pages.push(page), setFocusMode: mode => modes.push(mode) } });
  await app.restore();
  assert.deepEqual(pages, ["pomo"]); assert.equal(modes.at(-1), "sw");
  await app.nativeMessage("stateChanged", { type: "YKS_FOCUS_STATE", revision: app.record.revision + 1,
    snapshot: timer({ mode: "sw", state: "running", elapsed: 60000, credited: 1 }) });
  assert.equal(app.state.sw().run, true); assert.deepEqual(pages, ["pomo"]);
  await app.message({ type: "YKS_FOCUS_OPEN" });
  assert.deepEqual(pages, ["pomo"], "native shell does not listen to service-worker messages");
});

test("native own echoes and older revisions cannot undo reset and restart", async () => {
  let release, held = false;
  const app = harness({ native: {}, echo: true, onRequest: (data, record) => {
    if (data.operation !== "sync" || held) return;
    held = true;
    return new Promise(resolve => { release = () => { record.revision++; record.snapshot = clone(data.snapshot); resolve({ ok: true, ...clone(record) }); }; });
  } });
  await app.restore(); app.state.resetPomo(); app.state.startPomo();
  const id = JSON.parse(app.local.get(app.metaKey)).id;
  release(); await settle();
  await app.nativeMessage("stateChanged", { type: "YKS_FOCUS_STATE", revision: 1, snapshot: timer({ id: "old" }) });
  assert.equal(app.record.snapshot.id, id); assert.equal(JSON.parse(app.local.get(app.metaKey)).id, id);
  assert.equal(app.state.pomoState, "running"); assert.equal(app.state.pomoLeft, 1500);
});

test("native state event arriving during read wins over the older read response", async () => {
  let hold = false, release;
  const app = harness({ native: {}, onRequest: (data, record) => {
    if (data.operation !== "read" || !hold) return;
    hold = false; const old = clone(record);
    return new Promise(resolve => { release = () => resolve({ ok: true, ...old }); });
  } });
  await app.restore(); hold = true;
  const pending = app.state.YKSFocusNotifications.refresh(); await settle();
  app.record.revision++; app.record.snapshot = timer({ left: 1111 });
  await app.nativeMessage("stateChanged", { type: "YKS_FOCUS_STATE", ...clone(app.record) });
  release(); await pending; await settle();
  assert.equal(app.state.pomoLeft, 1111); assert.equal(JSON.parse(app.local.get(app.metaKey)).revision, app.record.revision);
});

test("native shutdown clears persistent timer and removes both listeners before ignoring late events", async () => {
  const app = harness({ native: {} }); await app.restore();
  await app.state.YKSFocusNotifications.shutdown();
  assert.equal(app.record.snapshot, null); assert.equal(app.requests.at(-1).operation, "clear");
  assert.equal(app.requests.at(-1).enabled, false); assert.equal(app.removedListeners, 2);
  await app.nativeMessage("stateChanged", { type: "YKS_FOCUS_STATE", revision: 999, snapshot: timer() });
  app.state.startPomo(); assert.equal(app.state.pomoState, "idle");
  assert.equal(app.intervals.size, 0); assert.equal(app.workerRequests.length, 0);
});

test("native shutdown reports failed persistence cleanup instead of claiming data was deleted", async () => {
  const app = harness({ native: {}, onRequest: data => data.operation === "clear" ? { ok: false, error: "storage_unavailable" } : undefined });
  await app.restore();
  await assert.rejects(app.state.YKSFocusNotifications.shutdown(), /silinemedi/);
  assert.notEqual(app.record.snapshot, null); assert.equal(app.removedListeners, 2);
});

test("upgrading an older WebView separates web revisions and restores its existing timer into the new native store", async () => {
  const app = harness({ native: {}, meta: null, snapshot: null, revision: 0,
    initial: { pomoState: "idle", localStorage: {
      getItem: name => name === key ? JSON.stringify({ id: "old-web-timer", mode: "pomo", revision: 80 }) : null,
      setItem() {}, removeItem() {}
    } } });
  let fallback = 0;
  await app.restore(() => { fallback++; app.state.pomoState = "paused"; app.state.pomoLeft = 1234; });
  assert.equal(fallback, 1); assert.equal(app.record.snapshot.left, 1234);
  assert.equal(app.record.snapshot.state, "paused"); assert.equal(app.record.revision, 1);
  assert.equal(app.requests.find(request => request.operation === "sync").expectedRevision, 0);
  assert.equal(app.workerRequests.length, 0);
});
