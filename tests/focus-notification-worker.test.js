const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const source = fs.readFileSync(path.resolve(__dirname, "../modules/focus-notification-worker.js"), "utf8");
const scope = "https://example.test/YKS-DEFTER-M-/";
const epoch = Date.UTC(2026, 9, 8, 12);
const clone = value => value === undefined ? undefined : JSON.parse(JSON.stringify(value));

// Transactions are serialized across connections, and write data only on commit.
// This models the IDB CAS boundary, including worker restarts and abort rollback.
function indexedDB({ failWrites = false, initial } = {}) {
  let stored = clone(initial), pending = Promise.resolve(), created = false;
  const db = {
    objectStoreNames: { contains: () => created },
    createObjectStore() { created = true; }, close() {},
    transaction(name, mode) {
      assert.equal(name, "state");
      const operations = [], tx = { error: null }, before = pending;
      let finish, aborted = false;
      pending = new Promise(resolve => { finish = resolve; });
      const store = {
        get(key) { assert.equal(key, "current"); const request = {}; operations.push({ type: "get", request }); return request; },
        put(value, key) { assert.equal(key, "current"); assert.equal(mode, "readwrite"); const request = {}; operations.push({ type: "put", request, value: clone(value) }); return request; }
      };
      tx.objectStore = () => store;
      tx.abort = () => { aborted = true; };
      before.then(() => setImmediate(() => {
        let next = clone(stored);
        while (operations.length && !aborted) {
          const operation = operations.shift();
          if (operation.type === "get") operation.request.result = clone(next);
          else if (failWrites) { aborted = true; break; }
          else next = operation.value;
          operation.request.onsuccess?.();
        }
        if (aborted) tx.onabort?.();
        else { stored = next; tx.oncomplete?.(); }
        finish();
      }));
      return tx;
    }
  };
  return {
    value: () => clone(stored),
    open(name, version) {
      assert.equal(name, "yks-focus-notifications-v1"); assert.equal(version, 1);
      const request = { result: db };
      setImmediate(() => { if (!created) request.onupgradeneeded?.(); request.onsuccess?.(); });
      return request;
    }
  };
}

function harness({ storage = indexedDB(), clients = [], failNotify = false, notifications = [] } = {}) {
  let now = epoch;
  const notices = [], messages = [], opened = [], events = [];
  class Clock extends Date { static now() { return now; } }
  const worker = {
    indexedDB: storage,
    registration: {
      scope,
      async showNotification(title, options) {
        events.push("notification");
        if (failNotify) throw new Error("Permission denied");
        notices.push(clone({ title, ...options }));
      },
      async getNotifications(options) { assert.ok(["yks-focus-timer", "yks-focus-running"].includes(options.tag)); return notifications.filter(value => value.tag === options.tag); }
    },
    clients: {
      async matchAll() { return clients; },
      async openWindow(url) { opened.push(url); }
    }
  };
  const context = vm.createContext({ self: worker, URL, Date: Clock });
  vm.runInContext(source, context);
  const api = worker.YKSFocusNotificationsWorker;
  return {
    storage, api, notices, messages, opened, events, worker,
    advance(ms) { now += ms; },
    snapshot(overrides = {}) {
      return { version: 1, id: "session-a", state: "running", isWork: true, total: 1500, left: 1500,
        endAt: now + 1500000, startedAt: now, credited: 0, subject: "Matematik", topic: "Özel not", task: "task-1", savedAt: now, ...overrides };
    },
    async request(data, origin = {}) {
      let pending, response;
      const owned = api.handleMessage({
        data: { type: "YKS_FOCUS_REQUEST", ...data },
        source: { type: "window", url: scope + "?test=1", ...origin.source }, origin: origin.origin || new URL(scope).origin,
        ports: [{ postMessage(value) { response = clone(value); } }], waitUntil(value) { pending = value; }
      });
      assert.equal(owned, true); await pending; return response;
    },
    async click(action, notice = notices.at(-1)) {
      let pending;
      const owned = api.handleClick({ notification: { tag: notice.tag, data: notice.data }, action, waitUntil(value) { pending = value; } });
      assert.equal(owned, true); await pending;
    }
  };
}

test("read initializes without writing, notifying, or changing revisions", async () => {
  const app = harness();
  assert.deepEqual(await app.request({ operation: "read" }), { ok: true, revision: 0, snapshot: null });
  assert.equal(app.storage.value(), undefined); assert.equal(app.notices.length, 0);
});

test("running countdown read follows deadline and remains running when elapsed", async () => {
  const app = harness();
  const saved = await app.request({ operation: "sync", expectedRevision: 0, snapshot: app.snapshot(), enabled: true });
  assert.equal(saved.revision, 1); app.advance(61000);
  const read = await app.request({ operation: "read" });
  assert.equal(read.snapshot.left, 1439); assert.equal(read.revision, 1);
  assert.equal(app.storage.value().snapshot.left, 1500);
  app.advance(1500000);
  const expired = await app.request({ operation: "read" });
  assert.equal(expired.snapshot.left, 0); assert.equal(expired.snapshot.state, "running"); assert.equal(expired.revision, 1);
});

test("notification uses absolute deadline, silent replacement, scoped assets and limited data", async () => {
  const app = harness();
  await app.request({ operation: "sync", expectedRevision: 0, snapshot: app.snapshot(), enabled: true });
  const notice = app.notices[0];
  assert.equal(notice.title, "Odak sürüyor"); assert.match(notice.body, /Matematik · Bitiş: \d{2}:\d{2}/);
  assert.doesNotMatch(notice.body, /Özel not|task-1|kalan/i);
  assert.deepEqual(notice.data, { type: "yks-focus", id: "session-a", revision: 1 });
  assert.equal(notice.silent, true); assert.equal(notice.renotify, false); assert.equal(notice.requireInteraction, true);
  assert.equal(notice.icon, scope + "icon-192.png"); assert.equal(notice.actions.length, 2);
  assert.equal(notice.actions[0].action, "focus-pause");
});

test("worker restart can pause and resume with no open app while excluding paused time", async () => {
  const storage = indexedDB(), first = harness({ storage });
  await first.request({ operation: "sync", expectedRevision: 0, snapshot: first.snapshot({ credited: 1 }), enabled: true });
  const restarted = harness({ storage }); restarted.advance(120000);
  await restarted.click("focus-pause", first.notices[0]);
  const paused = storage.value();
  assert.equal(paused.revision, 2); assert.equal(paused.snapshot.state, "paused"); assert.equal(paused.snapshot.left, 1380);
  assert.equal(paused.snapshot.credited, 1); assert.equal(paused.snapshot.endAt, 0);
  assert.equal(restarted.notices[0].title, "Odak duraklatıldı"); assert.match(restarted.notices[0].body, /23 dk 00 sn/);
  restarted.advance(600000);
  await restarted.click("focus-resume");
  const resumed = storage.value();
  assert.equal(resumed.revision, 3); assert.equal(resumed.snapshot.state, "running"); assert.equal(resumed.snapshot.left, 1380);
  assert.equal(resumed.snapshot.startedAt, epoch + 600000); assert.equal(resumed.snapshot.credited, 1);
  assert.equal(resumed.snapshot.endAt, epoch + 2100000); assert.equal(restarted.opened.length, 0);
});

test("stale revisions and older session actions cannot affect the current timer", async () => {
  const app = harness();
  await app.request({ operation: "sync", expectedRevision: 0, snapshot: app.snapshot(), enabled: true });
  const old = app.notices[0]; await app.click("focus-pause", old);
  await app.click("focus-pause", old); assert.equal(app.storage.value().revision, 2);
  const next = app.snapshot({ id: "session-b" });
  await app.request({ operation: "sync", expectedRevision: 2, snapshot: next, enabled: true });
  await app.click("focus-resume", { tag: old.tag, data: { ...old.data, revision: 3 } });
  assert.equal(app.storage.value().revision, 3); assert.equal(app.storage.value().snapshot.id, "session-b");
});

test("two worker connections compare revisions atomically and only one writer wins", async () => {
  const storage = indexedDB(), one = harness({ storage }), two = harness({ storage });
  const results = await Promise.all([
    one.request({ operation: "sync", expectedRevision: 0, snapshot: one.snapshot({ id: "one" }), enabled: false }),
    two.request({ operation: "sync", expectedRevision: 0, snapshot: two.snapshot({ id: "two" }), enabled: false })
  ]);
  assert.equal(results.filter(result => result.ok).length, 1);
  const conflict = results.find(result => !result.ok);
  assert.equal(conflict.error, "revision_conflict"); assert.equal(conflict.revision, 1);
  assert.equal(conflict.snapshot.id, storage.value().snapshot.id);
});

test("clear preserves monotonic revision and closes only its own timer notification", async () => {
  const closed = [], notifications = [
    { tag: "yks-focus-timer", data: { type: "yks-focus" }, close: () => closed.push("timer") },
    { tag: "yks-focus-timer", data: { type: "other" }, close: () => closed.push("other") },
    { tag: "lesson", data: { type: "yks-focus" }, close: () => closed.push("lesson") }
  ];
  const app = harness({ notifications });
  await app.request({ operation: "sync", expectedRevision: 0, snapshot: app.snapshot(), enabled: true });
  const result = await app.request({ operation: "clear", expectedRevision: 1 });
  assert.deepEqual(result, { ok: true, revision: 2, snapshot: null }); assert.deepEqual(closed, ["timer"]);
  const late = await app.request({ operation: "sync", expectedRevision: 1, snapshot: app.snapshot(), enabled: true });
  assert.equal(late.error, "revision_conflict"); assert.equal(late.snapshot, null);
});

test("disabled notifications still persist, and permission failure is distinct from failed storage", async () => {
  const app = harness({ failNotify: true });
  let result = await app.request({ operation: "sync", expectedRevision: 0, snapshot: app.snapshot(), enabled: false });
  assert.equal(result.ok, true); assert.equal(result.notificationError, undefined); assert.equal(app.notices.length, 0);
  result = await app.request({ operation: "sync", expectedRevision: 1, snapshot: app.snapshot(), enabled: true });
  assert.equal(result.ok, true); assert.equal(result.revision, 2); assert.equal(result.notificationError, "notification_unavailable");
});

test("missing persistence and aborted writes never claim success or show a timer", async () => {
  for (const storage of [null, indexedDB({ failWrites: true })]) {
    const app = harness({ storage });
    const result = await app.request({ operation: "sync", expectedRevision: 0, snapshot: app.snapshot(), enabled: true });
    assert.equal(result.ok, false); assert.equal(result.error, "storage_unavailable"); assert.equal(app.notices.length, 0);
    if (storage) assert.equal(storage.value(), undefined);
  }
});

test("malformed snapshots and foreign client origins or sibling paths are rejected", async () => {
  const app = harness();
  for (const overrides of [{ total: 86401 }, { left: 1501 }, { id: "bad\nid" }, { state: "idle" }, { credited: -1 }, { savedAt: NaN }, { isWork: "true" }, { mode: "sw", elapsed: -1 }]) {
    const result = await app.request({ operation: "sync", expectedRevision: 0, snapshot: app.snapshot(overrides), enabled: true });
    assert.equal(result.ok, false); assert.equal(result.error, "invalid_snapshot");
  }
  for (const origin of [
    { source: { url: "https://foreign.test/YKS-DEFTER-M-/" } },
    { source: { url: "https://example.test/YKS-DEFTER-M-/../another-app/" } },
    { source: { url: "https://example.test/YKS-DEFTER-M-other/" } },
    { source: { type: "serviceworker" } }, { origin: "https://foreign.test" }
  ]) assert.equal((await app.request({ operation: "read" }, origin)).error, "invalid_client");
  assert.equal(app.storage.value(), undefined); assert.equal(app.notices.length, 0);
});

test("notification controls persist and replace notification before broadcasting to scoped windows", async () => {
  const order = [];
  const app = harness({ clients: [
    { url: scope, postMessage(value) { assert.equal(app.storage.value().revision, value.revision); order.push(clone(value)); } },
    { url: "https://example.test/another-app/", postMessage() { throw new Error("Must not contact another app"); } }
  ] });
  app.worker.registration.showNotification = async () => { order.push("shown"); };
  await app.request({ operation: "sync", expectedRevision: 0, snapshot: app.snapshot(), enabled: true });
  assert.equal(order[0], "shown"); assert.equal(order[1].type, "YKS_FOCUS_STATE"); assert.equal(order[1].revision, 1);
});

test("request identity marks only mutation broadcasts and is never persisted or added to notification actions", async () => {
  const messages = [];
  const app = harness({ clients: [{ url: scope, postMessage(value) { messages.push(clone(value)); } }] });
  const result = await app.request({ operation: "sync", expectedRevision: 0, snapshot: app.snapshot(), enabled: true, requestId: "page-one:1" });
  assert.equal(result.requestId, undefined); assert.equal(messages[0].requestId, "page-one:1");
  assert.deepEqual(Object.keys(app.storage.value()).sort(), ["revision", "snapshot"]);
  assert.equal(app.storage.value().snapshot.requestId, undefined); assert.equal(app.notices[0].data.requestId, undefined);
  await app.click("focus-pause");
  assert.equal(messages[1].requestId, undefined);
  await app.request({ operation: "clear", expectedRevision: 2, requestId: "page-one:2" });
  assert.equal(messages[2].requestId, "page-one:2"); assert.equal(messages[2].snapshot, null);
  const bad = await app.request({ operation: "clear", expectedRevision: 3, requestId: "x".repeat(161) });
  assert.equal(bad.ok, false); assert.equal(bad.error, "invalid_request"); assert.equal(app.storage.value().revision, 3);
});

test("expired countdown actions open app for completion without inventing study credits", async () => {
  const app = harness();
  await app.request({ operation: "sync", expectedRevision: 0, snapshot: app.snapshot({ credited: 5 }), enabled: true });
  app.advance(1501000); await app.click("focus-pause");
  assert.equal(app.storage.value().revision, 1); assert.equal(app.storage.value().snapshot.credited, 5);
  assert.deepEqual(app.opened, [scope + "?focus=1"]);
});

test("open reuses the scoped window without reloading it and leaves unrelated notifications alone", async () => {
  const actions = [];
  const app = harness({ clients: [
    { url: "https://example.test/other/", focus() { throw new Error("Wrong app"); } },
    { url: scope, postMessage(value) { actions.push(value.type); }, focus() { actions.push("focus"); }, navigate() { throw new Error("Must not reload unsaved work"); } }
  ] });
  await app.request({ operation: "sync", expectedRevision: 0, snapshot: app.snapshot(), enabled: true });
  actions.length = 0; await app.click("");
  assert.deepEqual(actions, ["YKS_FOCUS_OPEN", "focus"]); assert.equal(app.opened.length, 0);
  assert.equal(app.api.handleClick({ notification: { tag: "lesson", data: { type: "yks-focus" } } }), false);
  assert.equal(app.api.handleMessage({ data: { type: "OTHER" } }), false);
});

test("stopwatch accumulates elapsed time and pauses/resumes after worker restart without counting pause", async () => {
  const storage = indexedDB(), app = harness({ storage });
  const snapshot = app.snapshot({ mode: "sw", elapsed: 60000, credited: 1, startedAt: epoch - 60000 });
  await app.request({ operation: "sync", expectedRevision: 0, snapshot, enabled: true });
  assert.equal(app.notices[0].title, "Kronometre sürüyor"); assert.match(app.notices[0].body, /Başlangıç: \d{2}:\d{2}/);
  const restarted = harness({ storage }); restarted.advance(30000);
  let read = await restarted.request({ operation: "read" });
  assert.equal(read.snapshot.elapsed, 90000); assert.equal(read.snapshot.savedAt, epoch + 30000); assert.equal(read.revision, 1);
  assert.equal(storage.value().snapshot.elapsed, 60000);
  await restarted.click("focus-pause", app.notices[0]);
  assert.equal(storage.value().snapshot.elapsed, 90000); assert.equal(storage.value().revision, 2);
  assert.match(restarted.notices[0].body, /Geçen süre: 1 dk 30 sn/);
  restarted.advance(600000);
  const pausedRead = await restarted.request({ operation: "read" });
  assert.equal(pausedRead.snapshot.savedAt, epoch + 30000, "paused history keeps its actual pause timestamp");
  assert.equal(pausedRead.snapshot.elapsed, 90000);
  await restarted.click("focus-resume"); restarted.advance(15000);
  read = await restarted.request({ operation: "read" });
  assert.equal(read.snapshot.elapsed, 105000); assert.equal(read.snapshot.startedAt, epoch - 60000);
  assert.equal(read.snapshot.credited, 1); assert.equal(read.snapshot.total, 86400); assert.equal(read.snapshot.endAt, 0);
  assert.equal(read.revision, 3);
});

test("bad stored state cannot be silently overwritten", async () => {
  const storage = indexedDB({ initial: { revision: -1, snapshot: null } }), app = harness({ storage });
  const read = await app.request({ operation: "read" });
  assert.equal(read.ok, false); assert.equal(read.error, "invalid_stored_state");
  assert.deepEqual(storage.value(), { revision: -1, snapshot: null });
});

test("24-hour custom timers and long stopwatches retain the existing supported durations", async () => {
  const app = harness();
  const day = 86400000;
  let result = await app.request({ operation: "sync", expectedRevision: 0,
    snapshot: app.snapshot({ total: 86400, left: 86400, endAt: epoch + day }), enabled: true });
  assert.equal(result.ok, true); assert.equal(result.snapshot.total, 86400);
  app.advance(13 * 3600000);
  await app.click("focus-pause");
  assert.equal(app.storage.value().snapshot.left, 11 * 3600);
  result = await app.request({ operation: "sync", expectedRevision: 2,
    snapshot: app.snapshot({ id: "long-watch", mode: "sw", elapsed: 2 * day, credited: 2880 }), enabled: true });
  assert.equal(result.ok, true); assert.equal(result.snapshot.elapsed, 2 * day);
  app.advance(10 * day);
  const limited = await app.request({ operation: "read" });
  assert.equal(limited.snapshot.elapsed, 7 * day);
});

test("replacement removes only the preceding release's focus notification", async () => {
  const closed = [], app = harness({ notifications: [
    { tag: "yks-focus-running", data: { kind: "focus" }, close() { closed.push("old-focus"); } },
    { tag: "yks-focus-running", data: { kind: "lesson" }, close() { closed.push("lesson"); } },
    { tag: "other", data: { kind: "focus" }, close() { closed.push("other"); } }
  ] });
  await app.request({ operation: "sync", expectedRevision: 0, snapshot: app.snapshot(), enabled: true });
  assert.deepEqual(closed, ["old-focus"]); assert.equal(app.notices.length, 1);
});
