const test=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const read=p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8");
const src=read("src/ui/auth-welcome-v60.ts");

// Küçük sahte DOM: textContent atamak çocukları siler (tarayıcıdaki gibi).
function el(tag){
  const node={tagName:tag,children:[],listeners:{},text:"",
    set textContent(v){this.text=String(v);this.children=[]},
    get textContent(){return this.text+this.children.map(c=>c.textContent).join("")},
    appendChild(c){this.children.push(c);return c},
    addEventListener(type,fn){this.listeners[type]=fn},
    click(){this.listeners.click?.()},
    querySelector(){return this.children.find(c=>c.tagName==="button"&&/yw-reload/.test(c.className))||null}};
  return node;
}
function helper(){
  const start=src.indexOf("export const NO_AUTH_SERVICE"),end=src.indexOf("/* Karşılama ve açılış ekranının ortak Google girişi");
  const code=src.slice(start,end).replace(/export /g,"").replace("(node:Element|null,text:string):void","(node,text)");
  let reloads=0;
  const ctx=vm.createContext({document:{createElement:el},window:{location:{reload:()=>{reloads++}}}});
  vm.runInContext(code+";this.out={NO_AUTH_SERVICE,showAuthError}",ctx);
  return{...ctx.out,node:el("p"),reloads:()=>reloads};
}

test("v149 hesap servisi açılamazsa hata kutusunda 'Sayfayı yenile' düğmesi çıkar; diğer hatalarda çıkmaz",()=>{
  const {NO_AUTH_SERVICE,showAuthError,node,reloads}=helper();
  showAuthError(node,"E-posta veya şifre hatalı.");
  assert.equal(node.querySelector("button"),null);
  showAuthError(node,NO_AUTH_SERVICE);
  const button=node.querySelector("button.yw-reload");
  assert.equal(button.textContent,"Sayfayı yenile");assert.equal(button.type,"button");
  assert.match(node.textContent,/^Hesap servisi açılamadı\. Sayfayı yenilemek genelde düzeltir\./);
  button.click();assert.equal(reloads(),1);
  showAuthError(node,"");assert.equal(node.querySelector("button"),null,"temizleyince düğme kalkar");
});

test("v149 giriş, kayıt, tekrar gönder, Google ve açılış ekranı aynı yolu kullanır",()=>{
  const launch=read("src/ui/launch-screen-v63.ts");
  assert.match(src,/if\(!api\)throw Object\.assign\(new Error\("Hesap servisi yok"\),\{code:"yks\/no-auth-service"\}\);/);
  assert.match(src,/"yks\/no-auth-service":NO_AUTH_SERVICE,/);
  assert.match(src,/const setError=\(scope:string,message:string\)=>showAuthError\(/);
  assert.equal((src.match(/setError\("(email|sent)",NO_AUTH_SERVICE\)/g)||[]).length,2);
  assert.doesNotMatch(src,/Hesap servisine ulaşılamadı/);
  assert.match(src,/installLaunchScreenV63\(\{[^}]*showAuthError,/);
  assert.match(launch,/const showError=\(text:string\)=>deps\.showAuthError\(root\.querySelector\("\[data-error\]"\),text\);/);
  assert.match(read("src/ui/auth-welcome-v60.css"),/\.yw-reload\{[^}]*background:#B42318;color:#fff/);
});
