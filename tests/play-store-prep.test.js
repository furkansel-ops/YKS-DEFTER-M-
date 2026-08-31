const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");

const root=path.resolve(__dirname,"..");
const read=file=>fs.readFileSync(path.join(root,file),"utf8");

test("Play Store hazırlığı sabit Android kimliği ve API 36 sözleşmesini korur",()=>{
  const config=read("capacitor.config.ts");
  const guard=read("scripts/prepare-android-release.mjs");
  const version=JSON.parse(read("version.json"));
  assert.match(config,/appId:\s*"com\.furkansel\.yksdefterim"/);
  assert.match(config,/appName:\s*"YKS Defterim"/);
  assert.match(config,/webDir:\s*"dist"/);
  assert.match(guard,/minSdkVersion",24/);
  assert.match(guard,/compileSdkVersion",36/);
  assert.match(guard,/targetSdkVersion",36/);
  assert.match(guard,/ANDROID_VERSION_CODE/);
  assert.match(guard,/ANDROID_KEYSTORE_PATH/);
  assert.match(guard,/ANDROID_KEYSTORE_PASSWORD/);
  assert.match(guard,/ANDROID_KEY_ALIAS/);
  assert.match(guard,/ANDROID_KEY_PASSWORD/);
  assert.equal(version.schema,21);
});

test("Android CI release kontrolünden sonra Capacitor 8.5.0 ile AAB üretir",()=>{
  const workflow=read(".github/workflows/build-android.yml");
  assert.match(workflow,/CAPACITOR_VERSION:\s*"8\.5\.0"/);
  assert.match(workflow,/android-actions\/setup-android@v4/);
  assert.match(workflow,/platforms;android-36/);
  assert.match(workflow,/build-tools;36\.0\.0/);
  assert.match(workflow,/npm run release:check/);
  assert.match(workflow,/npx cap add android/);
  assert.match(workflow,/npx cap sync android/);
  assert.match(workflow,/bundleRelease/);
  assert.match(workflow,/actions\/upload-artifact@v7/);
  assert.match(workflow,/app-release\.aab/);
});

test("Gizlilik ve gerçek cihaz veri silme akışı üretim paketine bağlıdır",()=>{
  const shell=read("src/ui/play-store-shell.ts");
  const main=read("src/main.ts");
  const copy=read("scripts/copy-legacy-assets.mjs");
  const privacy=read("privacy.html");
  const deletion=read("data-deletion.html");
  assert.match(shell,/Dexie\.delete\(YKS_DATABASE_NAME\)/);
  assert.match(shell,/localStorage\.clear\(\)/);
  assert.match(shell,/sessionStorage\.clear\(\)/);
  assert.match(shell,/cloudSyncBox/);
  assert.match(shell,/privacy\.html/);
  assert.match(shell,/data-deletion\.html/);
  assert.match(main,/installPlayStoreShell/);
  assert.match(copy,/"privacy\.html"/);
  assert.match(copy,/"data-deletion\.html"/);
  assert.match(privacy,/kullanıcı hesabı oluşturmaz/);
  assert.doesNotMatch(privacy,/Firebase/i);
  assert.match(deletion,/IndexedDB/);
});

test("Play Store hazırlık katmanı Program veya YKS çalışma verisi üretmez",()=>{
  const source=[
    read("capacitor.config.ts"),
    read("scripts/prepare-android-release.mjs"),
    read("src/ui/play-store-shell.ts"),
    read(".github/workflows/build-android.yml")
  ].join("\n");
  assert.doesNotMatch(source,/weeklyPlan|addToDay|addToToday|program\.(?:push|splice)|wrongLog|studyPrefs\s*=|new\s+Firebase|initializeApp/i);
});
