import { before, beforeEach, after, test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { initializeTestEnvironment, assertFails, assertSucceeds } from '@firebase/rules-unit-testing';
import { initializeApp, deleteApp } from 'firebase/app';
import { getAuth, connectAuthEmulator, createUserWithEmailAndPassword, signInWithEmailAndPassword,
  sendEmailVerification, applyActionCode, reload, getIdTokenResult } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator, doc, getDoc, setDoc, deleteDoc, writeBatch,
  runTransaction, serverTimestamp, Timestamp, setLogLevel } from 'firebase/firestore';

// This suite never targets production. Auth tokens are issued by the Auth
// emulator (including its real email-verification flow), not mocked claims.
const projectId = 'demo-yks-sync';
const authHost = process.env.FIREBASE_AUTH_EMULATOR_HOST;
const firestoreHost = process.env.FIRESTORE_EMULATOR_HOST;
assert.ok(authHost?.startsWith('127.0.0.1:'), 'Local Auth emulator required');
assert.ok(firestoreHost?.startsWith('127.0.0.1:'), 'Local Firestore emulator required');
const apps = [];
let environment, owner, secondDevice, stranger, unverified, anonymous;
setLogLevel('silent');

function device(name) {
  const app = initializeApp({ projectId, apiKey: 'emulator-only-key', authDomain: `${projectId}.firebaseapp.com` }, name);
  apps.push(app);
  const auth = getAuth(app);
  connectAuthEmulator(auth, `http://${authHost}`, { disableWarnings: true });
  const db = getFirestore(app);
  const [host, port] = firestoreHost.split(':');
  connectFirestoreEmulator(db, host, Number(port));
  return { app, auth, db };
}

async function account(name, verify) {
  const client = device(name);
  const email = `${name}@example.test`, password = 'Emulator-only-439!';
  const credential = await createUserWithEmailAndPassword(client.auth, email, password);
  if (verify) {
    await sendEmailVerification(credential.user);
    const response = await fetch(`http://${authHost}/emulator/v1/projects/${projectId}/oobCodes`);
    assert.equal(response.status, 200);
    const code = (await response.json()).oobCodes.find(item => item.email === email && item.requestType === 'VERIFY_EMAIL');
    assert.ok(code?.oobCode);
    await applyActionCode(client.auth, code.oobCode);
    await reload(credential.user);
  }
  const token = await getIdTokenResult(credential.user, true);
  assert.equal(token.claims.email_verified, verify);
  return Object.assign(client, { uid: credential.user.uid, email, password });
}

const metaRef = (db, uid = owner.uid) => doc(db, 'users', uid, 'sync', 'meta');
const chunkRef = (db, revision, index = 0, uid = owner.uid) =>
  doc(db, 'users', uid, 'chunks', `${String(revision).padStart(10, '0')}_${String(index).padStart(4, '0')}`);
const meta = (revision, overrides = {}) => ({ format: 4, revision, count: 1, hash: '0123456789abcdef',
  clientId: 'emulator-device', appVersion: '4.4.0', schemaVersion: 21, updatedAt: serverTimestamp(), ...overrides });
const chunk = (revision, overrides = {}) => ({ format: 4, revision, index: 0, data: '{"study":[]}', ...overrides });
const tombstone = revision => meta(revision, { count: 0, hash: '', deleted: true,
  cleanupPending: true, deletedAt: serverTimestamp() });

async function upload(client, revision, { metaChanges = {}, chunkChanges = {}, uid = owner.uid } = {}) {
  return runTransaction(client.db, async tx => {
    await tx.get(metaRef(client.db, uid));
    tx.set(chunkRef(client.db, revision, 0, uid), chunk(revision, chunkChanges));
    tx.set(metaRef(client.db, uid), meta(revision, metaChanges));
  });
}

before(async () => {
  environment = await initializeTestEnvironment({ projectId,
    firestore: { rules: await readFile(new URL('../../firestore.rules', import.meta.url), 'utf8') } });
  owner = await account('verified-owner', true);
  stranger = await account('verified-stranger', true);
  unverified = await account('unverified-user', false);
  anonymous = device('anonymous');
  secondDevice = device('owner-second-device');
  const login = await signInWithEmailAndPassword(secondDevice.auth, owner.email, owner.password);
  assert.equal(login.user.uid, owner.uid);
});
beforeEach(async () => { await environment.clearFirestore(); });
after(async () => { await Promise.all(apps.map(deleteApp)); await environment?.cleanup(); });

test('anonymous, other-account and unverified tokens cannot read or write private sync data', async () => {
  await assertSucceeds(upload(owner, 1));
  for (const client of [anonymous, stranger, unverified]) {
    await assertFails(getDoc(metaRef(client.db)));
    await assertFails(getDoc(chunkRef(client.db, 1)));
    await assertFails(setDoc(metaRef(client.db), meta(2)));
    await assertFails(deleteDoc(chunkRef(client.db, 1)));
  }
  await assertFails(upload(unverified, 1, { uid: unverified.uid }));
  await assertFails(setDoc(doc(owner.db, 'users', owner.uid, 'private', 'other'), { allowed: true }));
  await assertFails(setDoc(doc(owner.db, 'outside', 'anything'), { allowed: true }));
});

test('two real authenticated devices exchange atomic snapshots under the same UID', async () => {
  await assertSucceeds(upload(owner, 1));
  assert.equal((await getDoc(metaRef(secondDevice.db))).data().revision, 1);
  assert.equal((await getDoc(chunkRef(secondDevice.db, 1))).data().data, '{"study":[]}');
  await assertSucceeds(upload(secondDevice, 2, { chunkChanges: { data: '{"study":["math"]}' } }));
  assert.equal((await getDoc(metaRef(owner.db))).data().revision, 2);
  assert.equal((await getDoc(chunkRef(owner.db, 2))).data().data, '{"study":["math"]}');
});

test('metadata retains strict field, type and size bounds; legacy writes are rejected', async () => {
  const invalid = [
    { format: 3 }, { format: '4' }, { revision: 0 }, { revision: 1.5 },
    { count: -1 }, { count: 33 }, { count: 0.5 }, { hash: 3 }, { hash: 'h'.repeat(65) },
    { clientId: 'c'.repeat(81) }, { appVersion: 'v'.repeat(33) },
    { schemaVersion: 0 }, { schemaVersion: 101 }, { schemaVersion: '21' },
    { updatedAt: 'today' }, { updatedAt: Timestamp.fromMillis(0) }, { unexpected: true },
    { deleted: false }, { cleanupPending: false }, { deleted: true, cleanupPending: true, deletedAt: serverTimestamp() }
  ];
  for (const change of invalid) await assertFails(setDoc(metaRef(owner.db), meta(1, change)));
  const missing = meta(1); delete missing.clientId;
  await assertFails(setDoc(metaRef(owner.db), missing));
  await assertSucceeds(upload(owner, 1));
  await assertFails(setDoc(metaRef(owner.db), meta(1, { hash: 'changed-without-revision' })));
  await assertFails(setDoc(metaRef(owner.db), meta(0)));
  await assertFails(deleteDoc(metaRef(owner.db)));
});

test('chunk writes are bounded and must agree with a new atomic metadata revision', async () => {
  await assertFails(setDoc(chunkRef(owner.db, 1), chunk(1)));
  const invalid = [{ format: 3 }, { data: 'x'.repeat(280001) }, { data: 1 }, { index: -1 },
    { index: 32 }, { index: 1 }, { index: 0.5 }, { revision: 2 }, { unexpected: true }];
  for (const change of invalid) await assertFails(upload(owner, 1, { chunkChanges: change }));
  await assertSucceeds(upload(owner, 1, { chunkChanges: { data: 'x'.repeat(280000) } }));
  await assertFails(setDoc(chunkRef(owner.db, 1), chunk(1, { data: 'silent overwrite' })));
  await assertFails(setDoc(chunkRef(owner.db, 2), chunk(2)));
  await assertFails(deleteDoc(chunkRef(owner.db, 1)));
});

test('old format-3 snapshots remain readable, migrate to v4, and old revisions can be cleaned', async () => {
  await environment.withSecurityRulesDisabled(async context => {
    const db = context.firestore();
    await setDoc(metaRef(db), { ...meta(1), format: 3, updatedAt: Timestamp.fromMillis(1) });
    const legacy = chunk(1); delete legacy.format;
    await setDoc(chunkRef(db, 1), legacy);
  });
  assert.equal((await getDoc(metaRef(owner.db))).data().format, 3);
  assert.equal((await getDoc(chunkRef(owner.db, 1))).data().revision, 1);
  await assertFails(deleteDoc(chunkRef(owner.db, 1)));
  await assertSucceeds(upload(owner, 2));
  await assertSucceeds(upload(owner, 3));
  await assertSucceeds(upload(owner, 4));
  await assertSucceeds(deleteDoc(chunkRef(owner.db, 1)));
  await assertFails(deleteDoc(chunkRef(owner.db, 2)));
  await assertFails(deleteDoc(chunkRef(owner.db, 4)));
});

test('tombstones reject stale writes, allow chunk cleanup and only a narrow same-revision completion', async () => {
  await assertSucceeds(upload(owner, 1));
  await assertSucceeds(setDoc(metaRef(owner.db), tombstone(2)));
  await assertFails(upload(secondDevice, 1));
  await assertFails(upload(secondDevice, 3)); // Cleanup must finish before reseeding.
  await assertFails(setDoc(metaRef(owner.db), meta(3, { format: 3 })));
  await assertFails(setDoc(metaRef(owner.db), { cleanupPending: false, hash: 'tampered', updatedAt: serverTimestamp() }, { merge: true }));
  await assertFails(setDoc(metaRef(owner.db), { cleanupPending: false, clientId: 'tampered', updatedAt: serverTimestamp() }, { merge: true }));
  await assertSucceeds(deleteDoc(chunkRef(owner.db, 1)));
  await assertSucceeds(setDoc(metaRef(owner.db), { cleanupPending: false, updatedAt: serverTimestamp() }, { merge: true }));
  const deleted = (await getDoc(metaRef(owner.db))).data();
  assert.equal(deleted.deleted, true); assert.equal(deleted.revision, 2); assert.equal(deleted.count, 0);
  await assertFails(setDoc(metaRef(owner.db), { cleanupPending: true, updatedAt: serverTimestamp() }, { merge: true }));
  await assertFails(deleteDoc(metaRef(owner.db)));
  await assertSucceeds(upload(secondDevice, 3));
  assert.equal((await getDoc(metaRef(owner.db))).data().deleted, undefined);
});

test('the maximum 32-chunk transaction stays within Firestore rules access limits', async () => {
  const batch = writeBatch(owner.db);
  for (let index = 0; index < 32; index++) batch.set(chunkRef(owner.db, 1, index), chunk(1, { index }));
  batch.set(metaRef(owner.db), meta(1, { count: 32 }));
  await assertSucceeds(batch.commit());
  assert.equal((await getDoc(metaRef(secondDevice.db))).data().count, 32);
  assert.equal((await getDoc(chunkRef(secondDevice.db, 1, 31))).data().index, 31);
});
