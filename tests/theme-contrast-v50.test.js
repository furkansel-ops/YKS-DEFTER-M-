const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
const read=p=>fs.readFileSync(path.join(root,p),"utf8");
const base=read("src/ui/theme-choices-v45.css");
const prior=read("src/ui/theme-contrast-v49.css");
const next=read("src/ui/theme-contrast-v50.css");
const main=read("src/main.ts");

function channel(c){
  c=parseInt(c,16)/255;
  return c<=0.04045?c/12.92:((c+0.055)/1.055)**2.4;
}
function luminance(hex){
  const a=hex.replace("#",""),s=a.length===3?a.split("").map(x=>x+x).join(""):a;
  return channel(s.slice(0,2))*.2126+channel(s.slice(2,4))*.7152+channel(s.slice(4,6))*.0722;
}
function contrast(fg,bg){
  const x=luminance(fg),y=luminance(bg);
  return (Math.max(x,y)+0.05)/(Math.min(x,y)+0.05);
}
function palette(name){
  const colors={};
  const re=new RegExp(':root\\[data-theme="'+name+'"\\]\\s*\\{([^}]*)\\}',"g");
  for(const match of (base+"\n"+prior).matchAll(re)){
    for(const m of match[1].matchAll(/(--yks-theme-[a-z-]+)\s*:\s*(#[a-f0-9]{3,6})/gi))
      colors[m[1]]=m[2];
  }
  return colors;
}
test("v50 both alternate palettes (Gece, Canlı) retain high readability across surfaces and action fills",()=>{
  for(const name of ["night","vivid"]){
    const p=palette(name),fg=p["--yks-theme-ink"],secondary=p["--yks-theme-muted"],
      bg=p["--yks-theme-surface"],soft=p["--yks-theme-soft"],accent=p["--yks-theme-accent"];
    for(const [label,a,b] of [
      ["primary text/surface",fg,bg],
      ["body text/soft tile",fg,soft],
      ["support text/surface",secondary,bg],
      ["support text/soft tile",secondary,soft],
      ["button label/accent",p["--yks-theme-on"],accent],
      ["accent navigation label/soft",accent,soft]
    ])assert.ok(contrast(a,b)>=4.5,name+" "+label+" contrast "+contrast(a,b).toFixed(2));
  }
});
test("v50 is a CSS-only polish, imported after prior contrast with no impact to default Mavi theme",()=>{
  assert.match(main,/import "\.\/ui\/theme-contrast-v49\.css";\s*import "\.\/ui\/theme-contrast-v50\.css";/);
  assert.ok(next.includes(':root[data-visual-system="refined-blue"][data-theme]:not([data-theme="refined-blue"])'));
  assert.doesNotMatch(next,/:root\[data-theme="refined-blue"\]\s*\{/);
  assert.doesNotMatch(next,/localStorage|firebase|fetch\(|save\(|setDoc\(|updateDoc\(|setInterval|position:\s*fixed/i);
  assert.doesNotMatch(next,/display:\s*none\s*!important|visibility:\s*hidden/i);
});
test("v50 restores readable text in navigation, forms, Today and secondary screens",()=>{
  assert.match(next,/\.tabbar \.tab:not\(\.active\)/);
  assert.match(next,/\.tabbar \.tab\.active/);
  assert.match(next,/:is\(input,textarea\)::placeholder\s*\{\s*color:var\(--yks-theme-muted\);opacity:1;/);
  assert.match(next,/\.seg button\.on,\.btn\.primary,\.btn\.green,\.yms-actions \.primary/);
  assert.match(next,/\.yms-detail-heading p/);
  assert.match(next,/#topics \.v26-topic-tools/);
  assert.match(next,/#deneme \.v315-dashboard/);
  assert.match(next,/#pomo \.focuscard/);
  assert.match(next,/\.today-fresh-insight-header h3/);
  assert.match(next,/\.today-history-heading h3/);
  assert.match(next,/\.today-daily-metric-top strong/);
  assert.match(next,/\.v33-home-countdown/);
  assert.match(next,/\.v33-home-progress/);
  assert.match(next,/\.v33-progress-copy p/);
  assert.match(next,/\.today-summary>small/);
  assert.match(next,/background:var\(--yks-theme-hero\)/);
  assert.match(next,/-webkit-text-fill-color:var\(--yks-theme-accent\)/);
});
