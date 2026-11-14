const test=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path");

const read=p=>fs.readFileSync(path.resolve(__dirname,"..",p),"utf8");
const app=read("app.js");

test("v126 harita: her konu durum renginde bir kare, kaçışlı metin, sayaç",()=>{
  const src=app.match(/function coverageMapHtml\(exam\)\{[\s\S]*?\n\}\n/)[0];
  const esc=v=>String(v).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const topics={"TYT|Fizik|Kuvvet":{st:3},"TYT|Fizik|Optik":{st:1}};
  const CURRICULUM={TYT:[{name:"Fizik",topics:["Kuvvet","Optik","<Isı>"]}],AYT:[]};
  const coverageMapHtml=new Function("CURRICULUM","ST_LABEL","tget","tkey","esc","v26Arg",src+"return coverageMapHtml;")(
    CURRICULUM,["Başlanmadı","İşledim","Soru çözdüm","Pekiştirdim"],k=>topics[k]||{st:0},(e,s,t)=>e+"|"+s+"|"+t,esc,v=>String(v).replace(/'/g,"\\'"));
  const html=coverageMapHtml("TYT");
  assert.equal((html.match(/<button type="button" class="cov-sq s/g)||[]).length,3);
  assert.match(html,/<small>1\/3<\/small>/);
  assert.match(html,/class="cov-sq s3" title="Kuvvet · Pekiştirdim"/);
  assert.match(html,/class="cov-sq s1"[^>]*aria-label="Fizik · Optik · İşledim"/);
  assert.match(html,/aria-label="Fizik · &lt;Isı&gt; · Başlanmadı"/);
  assert.match(html,/onclick="openTopicDetail\('TYT','Fizik','Kuvvet'\)"/);
  assert.match(coverageMapHtml("AYT"),/Bu sınav türünde konu yok/);
});

test("v126 bağlantı: konu listesiyle birlikte çizilir; stil tema değişkenleriyle",()=>{
  assert.match(app,/v26RenderOverview\(ctx\);v26RenderAttention\(ctx\);renderCoverageMap\(\);/);
  assert.match(app,/w\.id="v126CoverageMap";h\.parentNode\.insertBefore\(title,h\)/);
  const css=read("app.css").match(/\/\* v126[\s\S]*?\/\* v122/)[0];
  assert.doesNotMatch(css,/#[0-9a-f]{3,8}\b|rgb\(/i);
  assert.match(css,/\.cov-sq\{[^}]*width:22px;height:22px/);
});
