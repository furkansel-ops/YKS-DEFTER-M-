const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
const read=p=>fs.readFileSync(path.join(root,p),"utf8");

/* v46 tema kartı dokunma işleyicisi, tek tema (Defter) kararıyla kaldırıldı.
   Görünüm kategorisi açılınca mevcut applyTheme Defter'i yeniden uygular. */
test("ayarlar runtime'ında tema kartı/radyo işleyicisi kalmaz, Görünüm Defter'i yeniden uygular",()=>{
  const source=read("public/settings-profile-runtime.js");
  assert.doesNotMatch(source,/applyThemeChoice|input\[name="yksTheme"\]|\.yks-theme-choice/);
  assert.match(source,/if\(category==="appearance"\)try\{window\.applyTheme\?\.\(\);\}/);
  assert.match(source,/Tek tema \(Defter\)/);
});

test("tema görünümü ayrı runtime'dadır; ana paket büyümez",()=>{
  const css=read("src/ui/theme-choices-v45.css");
  const main=read("src/main.ts");
  assert.doesNotMatch(main,/theme-card-interaction-v46/);
  assert.match(css,/--yks-theme-hero/);
  assert.match(css,/\.navbar,\.tabbar/);
  assert.match(css,/#home #todayFreshStart/);
  assert.equal(fs.existsSync(path.join(root,"src/ui/theme-card-interaction-v46.ts")),false);
});
