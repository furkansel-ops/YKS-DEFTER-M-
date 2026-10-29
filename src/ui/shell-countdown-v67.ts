/* v67 · Bilgisayarda (≥1280px) yan menünün altındaki YKS geri sayımı.
 * Bugün ekranının hesapladığı #todayFreshDays/#todayFreshExamDate metnini okur;
 * kendi tarih hesabı ya da kaydı yoktur. Görünürlük CSS'tedir (responsive-v67.css). */
export function installShellCountdownV67():{installed:boolean}{
  if(document.querySelector(".rb-side-count"))return {installed:true};
  const days=document.getElementById("todayFreshDays"),date=document.getElementById("todayFreshExamDate");
  if(!days)return {installed:false};
  const card=document.createElement("aside");
  card.className="rb-side-count";
  card.setAttribute("aria-label","YKS geri sayımı");
  const label=document.createElement("small"),value=document.createElement("b"),when=document.createElement("small");
  label.textContent="YKS'ye kalan";
  card.append(label,value,when);
  const sync=()=>{
    const count=(days.textContent||"").trim();
    card.hidden=!/\d/.test(count);
    value.textContent=count+" gün";
    when.textContent=(date?.textContent||"").trim();
  };
  sync();
  document.body.append(card);
  const observer=new MutationObserver(sync);
  for(const node of [days,date])if(node)observer.observe(node,{childList:true,characterData:true,subtree:true});
  return {installed:true};
}
