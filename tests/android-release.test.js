const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");

const root=path.resolve(__dirname,"..");
const read=file=>fs.readFileSync(path.join(root,file),"utf8");

test("Android yayın kimliği, SDK ve sürümü sabittir",()=>{
  const app=read("android/app/build.gradle"),vars=read("android/variables.gradle"),config=read("capacitor.config.ts");
  assert.match(config,/appId:\s*"com\.furkansel\.yksdefterim"/);
  assert.match(config,/appName:\s*"YKS Defterim"/);
  assert.match(app,/namespace\s*=\s*"com\.furkansel\.yksdefterim"/);
  assert.match(app,/applicationId\s+"com\.furkansel\.yksdefterim"/);
  assert.match(app,/versionName\s+"4\.4\.0"/);
  assert.match(app,/versionCode\s+4040002/);
  assert.match(vars,/minSdkVersion\s*=\s*24/);
  assert.match(vars,/compileSdkVersion\s*=\s*36/);
  assert.match(vars,/targetSdkVersion\s*=\s*36/);
});

test("Manifest ağ, yedek, orientation ve deep-link sınırlarını korur",()=>{
  const manifest=read("android/app/src/main/AndroidManifest.xml"),network=read("android/app/src/main/res/xml/network_security_config.xml"),paths=read("android/app/src/main/res/xml/file_paths.xml");
  assert.match(manifest,/android:usesCleartextTraffic="false"/);
  assert.match(manifest,/android:allowBackup="false"/);
  assert.match(manifest,/android:networkSecurityConfig="@xml\/network_security_config"/);
  assert.doesNotMatch(manifest,/android:screenOrientation=/);
  assert.doesNotMatch(manifest,/android\.intent\.category\.BROWSABLE|android\.intent\.action\.VIEW/);
  assert.match(network,/cleartextTrafficPermitted="false"/);
  assert.doesNotMatch(paths,/<external-path/);
  assert.ok(read("app.js").includes('if(!/^https:\\/\\//i.test(u))return false;'));
});

test("Özel adaptive icon, legacy fallback, monochrome ve Android 12 splash kaynakları bağlıdır",()=>{
  const manifest=read("android/app/src/main/AndroidManifest.xml"),icon=read("android/app/src/main/res/mipmap-anydpi-v26/ic_launcher.xml"),round=read("android/app/src/main/res/mipmap-anydpi-v26/ic_launcher_round.xml"),legacy=read("android/app/src/main/res/mipmap-anydpi/ic_launcher.xml"),themed=read("android/app/src/main/res/mipmap-anydpi-v33/ic_launcher.xml"),foreground=read("android/app/src/main/res/drawable/yks_launcher_foreground.xml"),monochrome=read("android/app/src/main/res/drawable/yks_launcher_monochrome.xml"),splash=read("android/app/src/main/res/drawable/yks_splash_icon.xml"),styles=read("android/app/src/main/res/values/styles.xml");
  assert.match(manifest,/android:icon="@mipmap\/ic_launcher"/);
  assert.match(manifest,/android:roundIcon="@mipmap\/ic_launcher_round"/);
  for(const adaptive of [icon,round]){
    assert.match(adaptive,/@color\/launcher_background/);
    assert.match(adaptive,/@drawable\/yks_launcher_foreground/);
    assert.match(adaptive,/@drawable\/yks_launcher_monochrome/);
  }
  assert.match(legacy,/pathData/);
  assert.match(themed,/<monochrome/);
  for(const safeVector of [legacy,foreground,monochrome,splash]){
    assert.match(safeVector,/android:translateX="-2"/);
    assert.match(safeVector,/android:translateY="-2"/);
  }
  assert.match(styles,/windowSplashScreenAnimatedIcon/);
  assert.match(styles,/windowSplashScreenIconBackgroundColor/);
  assert.match(styles,/postSplashScreenTheme/);
});

test("Upload key signing sözleşmesi idempotent ve secret dışı kalır",()=>{
  const gradle=read("android/app/build.gradle"),guard=read("scripts/prepare-android-release.mjs"),ignore=read(".gitignore");
  assert.match(gradle,/releaseSigningReady/);
  assert.match(gradle,/signingConfig\s*=\s*signingConfigs\.release/);
  assert.doesNotMatch(guard,/appGradle\.replace\(\/buildTypes/);
  for(const name of ["ANDROID_KEYSTORE_PATH","ANDROID_KEYSTORE_PASSWORD","ANDROID_KEY_ALIAS","ANDROID_KEY_PASSWORD"])assert.ok(guard.includes(name),name);
  assert.match(ignore,/\*\.jks/);
  assert.match(ignore,/\*\.b64/);
});

test("Web ve Android üretim hedefleri Firebase ve source map sınırında ayrılır",()=>{
  const pkg=JSON.parse(read("package.json")),vite=read("vite.config.mts"),verifyDist=read("scripts/verify-dist.mjs"),verifyRelease=read("scripts/verify-release.mjs"),workflow=read(".github/workflows/build-android.yml");
  assert.match(pkg.scripts["build:assets"],/vite build --mode web/);
  assert.match(pkg.scripts["build:assets"],/verify-dist\.mjs web/);
  assert.match(pkg.scripts["build:android"],/vite build --mode android/);
  assert.match(pkg.scripts["build:android"],/verify-dist\.mjs android/);
  assert.equal(pkg.scripts["android:sync"],"npm run build:android && cap sync android");
  assert.match(vite,/mode==="android"/);
  assert.match(vite,/buildStart/);
  assert.match(vite,/minify:true/);
  assert.match(vite,/sourcemap:false/);
  assert.match(vite,/isolate-cloud-shell-by-build-target/);
  for(const verifier of [verifyDist,verifyRelease]){
    assert.match(verifier,/distTextFiles/);
    assert.ok(verifier.includes("www\\.gstatic\\.com\\/firebasejs"));
    assert.ok(verifier.includes("AIza[0-9A-Za-z_-]{30,}"));
    assert.match(verifier,/firebase-sync-runtime\.js/);
    assert.ok(verifier.includes('target==="android"')||verifier.includes('target==="web"'));
  }
  assert.equal((workflow.match(/npm run android:sync/g)||[]).length,2);
  assert.doesNotMatch(workflow,/npm run build:assets/);
});
