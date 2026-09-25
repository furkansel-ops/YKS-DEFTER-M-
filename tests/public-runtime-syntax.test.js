const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const {spawnSync}=require("node:child_process");

const publicDir=path.resolve(__dirname,"../public");
const runtimeFiles=fs.readdirSync(publicDir,{withFileTypes:true})
  .filter(entry=>entry.isFile()&&entry.name.endsWith(".js"))
  .map(entry=>entry.name).sort();

// Vite copies these files without parsing them. Check module syntax without
// evaluating browser globals or resolving remote Firebase imports.
for(const file of runtimeFiles){
  test(`public/${file} tarayıcı modülü olarak ayrıştırılır`,()=>{
    const result=spawnSync(process.execPath,["--check","--input-type=module"],{
      input:fs.readFileSync(path.join(publicDir,file),"utf8"),
      encoding:"utf8",windowsHide:true
    });
    assert.equal(result.status,0,`${file}: ${result.error?.message||result.stderr||result.stdout}`);
  });
}
