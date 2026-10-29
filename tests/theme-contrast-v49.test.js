const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
const read=p=>fs.readFileSync(path.join(root,p),"utf8");

const palette=read("src/ui/theme-choices-v45.css");
const contrast=read("src/ui/theme-contrast-v49.css");
const themes=["night","vivid"];
const nameToRgb=hex=>{
  const value=hex.replace("#","");
  const normalized=value.length===3?value.split("").map(x=>x+x).join(""):value;
  assert.match(normalized,/^[0-9a-f]{6}$/i);
  return [0,2,4].map(i=>parseInt(normalized.slice(i,i+2),16)/255);
};
function luminance(hex){
  const [r,g,b]=nameToRgb(hex).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);
  return .2126*r+.7152*g+.0722*b;
}
function ratio(fg,bg){
  const a=luminance(fg),b=luminance(bg);
  return (Math.max(a,b)+.05)/(Math.min(a,b)+.05);
}
function themeVars(theme){
  const variables={};
  const combined=palette+"\n"+contrast;
  const re=new RegExp(':root\\[data-theme="'+theme+'"\\]\\s*\\{([^}]*)\\}',"g");
  for(const found of combined.matchAll(re))
    for(const [,key,value] of found[1].matchAll(/(--yks-theme-[a-z-]+)\s*:\s*(#[a-fA-F0-9]{3,8})/g))
      variables[key]=value;
  return variables;
}
test("v49 every alternate palette has readable text, muted descriptions and accent buttons",()=>{
  for(const theme of themes){
    const p=themeVars(theme),ink=p["--yks-theme-ink"],surface=p["--yks-theme-surface"],
      muted=p["--yks-theme-muted"],soft=p["--yks-theme-soft"],
      accent=p["--yks-theme-accent"],on=p["--yks-theme-on"],deep=p["--yks-theme-deep"];
    for(const [label,fg,bg] of [["heading",ink,surface],["description",muted,soft],
      ["accent text",accent,soft],["primary button",on,accent],["dark hero","#fff",deep]]){
      assert.ok(ratio(fg,bg)>=4.5,theme+" "+label+" is low contrast: "+ratio(fg,bg).toFixed(2));
    }
  }
});

test("v49 eski koyu ilerleme kartı kuralları kalktı; Bugün listeleri kimlik içeren :is() kullanmaz",()=>{
  // v66 ilerleme kartını düzleştirir; :is() içindeki tek bir kimlik listedeki her öğeyi
  // kimlik önceliğine taşıyıp yeni düzenin renklerini eziyordu.
  for(const src of [contrast,palette]){
    assert.doesNotMatch(src,/\.today-fresh-progress/);
    for(const found of src.matchAll(/#todayFreshStart[^{]*:is\(([^)]*)\)\s*\{/g))
      assert.doesNotMatch(found[1],/#[A-Za-z]/,"kimlikli :is(): "+found[1].slice(0,80));
  }
  assert.match(contrast,/\.today-fresh-exam small,\.today-fresh-quote-text/);
  assert.match(contrast,/\.today-fresh-insights-actions button,\.today-fresh-insight-detail/);
});

test("v49 is CSS-only, scoped away from the default Blue theme and loads after the prior palette",()=>{
  const main=read("src/main.ts");
  assert.ok(main.indexOf('import "./ui/theme-choices-v45.css"')>0);
  assert.ok(main.indexOf('import "./ui/theme-contrast-v49.css"')>main.indexOf('import "./ui/theme-choices-v45.css"'));
  assert.ok(contrast.includes(':root[data-visual-system="refined-blue"][data-theme]:not([data-theme="refined-blue"])'));
  assert.match(contrast,/#appearancePreferences/);
  assert.match(contrast,/#home #todayFreshStart/);
  assert.match(contrast,/\.today-fresh-subject-metric/);
  assert.match(contrast,/\.today-fresh-insight-reason/);
  assert.match(contrast,/\.today-daily-progress/);
  assert.doesNotMatch(contrast,/!important.*color:|fetch\(|localStorage|setDoc\(|save\(/);
  assert.doesNotMatch(main,/import .*theme-contrast-v49\.ts/);
});
