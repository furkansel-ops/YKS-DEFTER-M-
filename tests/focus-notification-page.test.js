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

function harness({ meta = { id: "a", mode: "pomo", revision: 1, credited: 1 }, snapshot = timer(), revision = 2, onRequest, echo = false, initial = {} } = {}) {
  const local = new Map(), requests = [], histories = [], listeners = {}, intervals = new Map(), timeouts = new Map();
  const record = { revision, snapshot: clone(snapshot) };
  let now = epoch, handle = 0, minutes = 0;
  if (meta) local.set(key, JSON.stringify(meta));
  const status = { textContent: "" };
  class Clock extends Date { static now() { return now; } }
  class MessageChannel {
    constructor() {
      let closed = false;
      this.port1 = { close() { closed = true; }, onmessage: null };
      this.port2 = { postMessage: value => { if (!closed) this.port1.onmessage?.({ data: value }); } };
    }
  }
  const registration = { active: {
    scriptURL: scope + "sw.js",
    postMessage(data, ports) {
      requests.push(clone(data));
      Promise.resolve().then(async () => {
        let result;
        if (onRequest) result = await onRequest(clone(data), record);
        if (!result) {
          if (data.operation === "read") result = { ok: true, ...clone(record) };
          else if (data.expectedRevision !== record.revision) result = { ok: false, error: "revision_conflict", ...clone(record) };
          else { record.revision++; record.snapshot = data.operation === "clear" ? null : clone(data.snapshot); result = { ok: true, ...clone(record) }; }
        }
        if (echo && data.operation !== "read" && result.ok) workerListeners.message?.({ source: { scriptURL: scope + "sw.js" }, data: { type: "YKS_FOCUS_STATE", ...clone(result), requestId: data.requestId } });
        ports[0].postMessage(result);
      });
    }
  } };
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
      if (!state.pomoIsWork || !state.pomoStartedAt) return;
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
    pomoTick() { state.creditMinutes(); }, swTick() { state.swCreditElapsed(state.swElapsed()); },
    YKSStability: { clearRuntime() { local.delete("yks_focus_runtime_v1"); }, persistRuntime() {} },
    ...initial
  };
  const context = vm.createContext(state); state.window = context;
  vm.runInContext(source, context);
  return {
    state, local, record, requests, histories, intervals, status, listeners,
    get minutes() { return minutes; },
    advance(ms) { now += ms; },
    async restore(callback = () => {}) { await state.YKSFocusNotifications.restore(callback); await settle(); },
    async message(value, scriptURL = scope + "sw.js") { workerListeners.message({ source: { scriptURL }, data: value }); await settle(); }
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
