const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");
const {stripTypeScriptTypes}=require("node:module");
const root=path.resolve(__dirname,"..");
const read=file=>fs.readFileSync(path.join(root,file),"utf8");
const config=read("vite.config.mts");
const source=config.slice(config.indexOf("const OFFLINE_STARTUP_MODULES="),config.indexOf("export default defineConfig"));
const {modules,plugin}=vm.runInNewContext(stripTypeScriptTypes(source)+"\n({modules:OFFLINE_STARTUP_MODULES,plugin:prepareOfflineStartupAssets()})");

function fixture(){
  const bundle={};
  modules.forEach((module,index)=>{
    const name=index?path.basename(module,".ts"):"index",fileName=`assets/${name}-hash.js`,css=`assets/${name}-hash.css`;
    bundle[fileName]={type:"chunk",fileName,isEntry:index===0,modules:{[`C:/project/${module}`]:{}},imports:["assets/shared-hash.js"],dynamicImports:["assets/physics-optional.js"],viteMetadata:{importedCss:new Set([css])}};
    bundle[css]={type:"asset",fileName:css,source:"CSS"};
  });
  bundle["assets/shared-hash.js"]={type:"chunk",fileName:"assets/shared-hash.js",modules:{},imports:["assets/deep-hash.js"],viteMetadata:{importedCss:new Set(["assets/shared-hash.css"])}};
  bundle["assets/deep-hash.js"]={type:"chunk",fileName:"assets/deep-hash.js",modules:{},imports:[]};
  bundle["assets/shared-hash.css"]={type:"asset",fileName:"assets/shared-hash.css",source:"CSS"};
  bundle["assets/physics-optional.js"]={type:"chunk",fileName:"assets/physics-optional.js",modules:{"C:/project/src/ui/physics-lab-v44.ts":{}},imports:[]};
  return bundle;
}
function generate(bundle){
  let emitted;
  plugin.generateBundle.handler.call({emitFile:asset=>emitted=asset},{},bundle);
  assert.equal(emitted.fileName,"offline-startup-assets.json");return JSON.parse(emitted.source);
}

test("manifest contains startup modules and recursive static JS/CSS while optional labs stay lazy",()=>{
  const manifest=generate(fixture());
  assert.equal(manifest.version,1);assert.equal(manifest.entry,"./assets/index-hash.js");
  for(const module of modules){
    const name=module==="src/main.ts"?"index":path.basename(module,".ts");
    assert.ok(manifest.assets.includes(`./assets/${name}-hash.js`),module);
    assert.ok(manifest.assets.includes(`./assets/${name}-hash.css`),module);
  }
  for(const asset of ["shared-hash.js","deep-hash.js","shared-hash.css"])assert.ok(manifest.assets.includes("./assets/"+asset));
  assert.ok(!manifest.assets.includes("./assets/physics-optional.js"));
  assert.equal(manifest.assets.length,new Set(manifest.assets).size);
});

test("allowlist covers the application's boot-time dynamic imports",()=>{
  const expected=new Set(["src/main.ts"]);
  for(const file of ["src/main.ts","src/ui/v43-safe-runtime.ts","src/ui/play-store-shell.ts"]){
    for(const match of read(file).matchAll(/import\("([^"]+)"\)/g)){
      expected.add(path.posix.normalize(path.posix.join(path.posix.dirname(file),match[1]))+".ts");
    }
  }
  assert.deepEqual(new Set(Array.from(modules)),expected);
});

test("build fails if a startup module or its static dependency is missing",()=>{
  const missingModule=fixture();delete missingModule["assets/onboarding-profile-v45-hash.js"];
  assert.throws(()=>generate(missingModule),/başlangıç modülü/);
  const missingDependency=fixture();delete missingDependency["assets/deep-hash.js"];
  assert.throws(()=>generate(missingDependency),/başlangıç dosyası/);
});
