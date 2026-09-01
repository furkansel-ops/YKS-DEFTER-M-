import {access,readFile,writeFile} from "node:fs/promises";
import {resolve} from "node:path";

const root=resolve(import.meta.dirname,"..");
const androidRoot=resolve(root,"android");
const variablesPath=resolve(androidRoot,"variables.gradle");
const appGradlePath=resolve(androidRoot,"app/build.gradle");
const version=JSON.parse(await readFile(resolve(root,"version.json"),"utf8"));

await access(variablesPath);
await access(appGradlePath);

const variables=await readFile(variablesPath,"utf8");
const requireSdk=(name,value)=>{
  const pattern=new RegExp(`${name}\\s*=\\s*${value}\\b`);
  if(!pattern.test(variables))throw new Error(`Android release guard: ${name}=${value} bulunamadı`);
};
requireSdk("minSdkVersion",24);
requireSdk("compileSdkVersion",36);
requireSdk("targetSdkVersion",36);

const parts=String(version.version||"").split(".").map(Number);
if(parts.length!==3||parts.some(part=>!Number.isInteger(part)||part<0))throw new Error("Android release guard: version.json semver geçersiz");
const revision=Number(String(version.build||"").match(/-r(\d+)$/)?.[1]||1);
const derivedCode=parts[0]*1_000_000+parts[1]*10_000+parts[2]*100+revision;
const versionCode=Number(process.env.ANDROID_VERSION_CODE||derivedCode);
if(!Number.isInteger(versionCode)||versionCode<1||versionCode>2_100_000_000)throw new Error("Android release guard: versionCode geçersiz");

let appGradle=await readFile(appGradlePath,"utf8");
if(!/versionCode\s+\d+/.test(appGradle)||!/versionName\s+["'][^"']+["']/.test(appGradle))throw new Error("Android release guard: generated build.gradle sürüm alanları bulunamadı");
appGradle=appGradle.replace(/versionCode\s+\d+/,`versionCode ${versionCode}`);
appGradle=appGradle.replace(/versionName\s+["'][^"']+["']/,`versionName "${version.version}"`);

const signingValues={
  path:process.env.ANDROID_KEYSTORE_PATH,
  storePassword:process.env.ANDROID_KEYSTORE_PASSWORD,
  alias:process.env.ANDROID_KEY_ALIAS,
  keyPassword:process.env.ANDROID_KEY_PASSWORD
};
const signingRequested=Object.values(signingValues).some(Boolean);
const signingReady=Object.values(signingValues).every(Boolean);
if(signingRequested&&!signingReady)throw new Error("Android release guard: imzalama değişkenlerinden biri eksik");
if(signingReady){
  await access(signingValues.path);
  for(const pattern of [
    /releaseSigningReady/,
    /storeFile\s+file\(releaseKeystorePath\)/,
    /signingConfig\s*=\s*signingConfigs\.release/
  ])if(!pattern.test(appGradle))throw new Error("Android release guard: env tabanlı signing sözleşmesi bulunamadı");
}

await writeFile(appGradlePath,appGradle);
await writeFile(resolve(androidRoot,"yks-release-metadata.json"),JSON.stringify({
  appId:"com.furkansel.yksdefterim",
  versionName:version.version,
  versionCode,
  targetSdk:36,
  compileSdk:36,
  minSdk:24,
  signed:signingReady,
  build:version.build
},null,2)+"\n");

console.log(`Android release hazır: ${version.version} (${versionCode}), API 36, ${signingReady?"imzalı":"imzasız doğrulama"}`);
