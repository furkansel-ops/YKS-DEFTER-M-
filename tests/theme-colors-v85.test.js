const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");

const root=path.resolve(__dirname,"..");
const read=file=>fs.readFileSync(path.join(root,file),"utf8");
const css=read("src/ui/design-trio-v66.css"),legacy=read("src/ui/theme-choices-v45.css");
const block=(source,selector)=>{const at=source.indexOf(selector);return source.slice(at,source.indexOf("}",at));};
const token=(source,selector,name)=>(block(source,selector).match(new RegExp(name+":([^;]+);"))||[])[1];
const lum=hex=>{const v=hex.replace("#","").match(/../g).map(x=>parseInt(x,16)/255).map(c=>c<=.03928?c/12.92:((c+.055)/1.055)**2.4);return .2126*v[0]+.7152*v[1]+.0722*v[2];};
const ratio=(a,b)=>{const x=lum(a),y=lum(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);};

test("v85 Gece bir ton açık; iki tema katmanı aynı paleti kullanır",()=>{
  const night=':root[data-theme="night"]{';
  assert.equal(token(css,night,"--d-bg"),"#192134");assert.equal(token(css,night,"--d-surface"),"#222c46");
  assert.ok(lum("#192134")>lum("#0a0f1c")*2,"eski simsiyah zeminden belirgin açık");
  for(const [d,y] of [["--d-bg","--yks-theme-bg"],["--d-surface","--yks-theme-surface"],["--d-soft","--yks-theme-soft"],["--d-ink","--yks-theme-ink"],["--d-muted","--yks-theme-muted"],["--d-line","--yks-theme-line"],["--d-accent","--yks-theme-accent"],["--d-on-accent","--yks-theme-on"]])
    assert.equal(token(legacy,night,y),token(css,night,d),y);
  assert.ok(ratio(token(css,night,"--d-muted"),token(css,night,"--d-surface"))>=4.5,"soluk yazı kartta okunur");
  assert.ok(ratio(token(css,night,"--d-on-accent"),token(css,night,"--d-accent"))>=4.5,"vurgu üstündeki yazı okunur");
  assert.ok(ratio(token(css,night,"--d-on-accent"),token(css,night,"--d-ok"))>=4.5,"tamamlandı işareti okunur");
});

test("v85 Canlı daha doygun; vurgu üstünde beyaz yazı okunur",()=>{
  const vivid=':root[data-theme="vivid"]{';
  assert.equal(token(css,vivid,"--d-bg"),"#fff0e4");assert.equal(token(css,vivid,"--d-accent"),"#6a2cff");
  assert.match(token(css,vivid,"--d-hero"),/#6a2cff 0%,#c13bf0 52%,#ff6a48 100%/);
  for(const [d,y] of [["--d-bg","--yks-theme-bg"],["--d-soft","--yks-theme-soft"],["--d-ink","--yks-theme-ink"],["--d-muted","--yks-theme-muted"],["--d-line","--yks-theme-line"],["--d-accent","--yks-theme-accent"]])
    assert.equal(token(legacy,vivid,y),token(css,vivid,d),y);
  assert.ok(ratio("#ffffff",token(css,vivid,"--d-accent"))>=4.5);
  assert.ok(ratio(token(css,vivid,"--d-muted"),token(css,vivid,"--d-bg"))>=4.5);
  assert.equal(token(css,':root[data-visual-system="refined-blue"]{',"--d-bg"),"#f5f7fb","Sade Mavi değişmez");
});

test("v85 gün sonu notu Gece ve Canlı'da temanın renklerini alır; Sade Mavi'ye dokunmaz",()=>{
  const scope=':root:is([data-theme="night"],[data-theme="vivid"]) #mainWrap #home #todayFreshStart';
  assert.ok(css.includes(scope+' #todayFreshReflectionInput{background:var(--d-soft)!important;color:var(--d-ink);border-color:var(--d-line)}'));
  assert.ok(css.includes(scope+' #todayFreshReflectionInput::placeholder{color:var(--d-muted);opacity:1}'));
  assert.ok(css.includes(scope+' :is(.today-fresh-review-label,.today-fresh-review-title strong){color:var(--d-ink)}'));
  assert.ok(css.includes(scope+' .today-fresh-review-body{border-top-color:var(--d-line)}'));
  assert.ok(css.includes(':root[data-theme="night"] #mainWrap #topics :is(.topic-filter.on,.topic-filter.on b,#revCount){color:var(--d-on-accent)}'));
});

test("v85 açılış ekranı ve tarayıcı çubuğu yeni zemin rengiyle açılır",()=>{
  const html=read("index.html"),app=read("app.js");
  assert.match(html,/html\[data-boot-theme="night"\] #yksBootShell \.yks-boot-card\{background:#222c46;border-color:#3a4769/);
  assert.match(html,/html\[data-boot-theme="vivid"\],html\[data-boot-theme="vivid"\] #yksBootShell\{background:#fff0e4\}/);
  assert.match(html,/h==="night"\?"#192134":"#fff0e4"/);
  assert.match(app,/const YKS_THEME_META=\{"refined-blue":"#f1ecfb",night:"#192134",vivid:"#fff0e4"\};/,"v99: açık tema Glassy zemini");
});
