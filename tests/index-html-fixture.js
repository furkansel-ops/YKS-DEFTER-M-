// Test yardımcısı (kendi başına test değildir): Bugün açılış stilleri index.html bütçesi için
// src/ui/today-fresh-start-v35.css dosyasına taşındı. Bu yardımcı, eski satır içi biçimdeymiş gibi
// index.html döndürür; böylece stil kurallarını arayan testler değişmeden çalışır.
const fs=require("node:fs");
const path=require("node:path");

const root=path.resolve(__dirname,"..");
const LINK='<link rel="stylesheet" id="todayFreshStartStyles" href="./src/ui/today-fresh-start-v35.css">';

function indexWithStartupCss(){
  const html=fs.readFileSync(path.join(root,"index.html"),"utf8");
  if(!html.includes(LINK))throw new Error("Bugün açılış stili bağlantısı index.html içinde yok");
  const css=fs.readFileSync(path.join(root,"src/ui/today-fresh-start-v35.css"),"utf8");
  return html.replace(LINK,'<style id="todayFreshStartStyles">\n'+css+"</style>");
}
module.exports={indexWithStartupCss,TODAY_STARTUP_CSS_LINK:LINK};
