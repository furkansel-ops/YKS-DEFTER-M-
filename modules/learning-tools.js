(function(){
  "use strict";
  const FORMULAS=[
    {id:"m-square-plus",c:"Matematik",t:"İki terimin karesi",f:"(a+b)² = a² + 2ab + b²",n:"Eksi için orta terimin işareti değişir."},
    {id:"m-diff-square",c:"Matematik",t:"İki kare farkı",f:"a² − b² = (a−b)(a+b)",n:"Çarpanlara ayırmanın temel özdeşliği."},
    {id:"m-quadratic",c:"Matematik",t:"İkinci derece kökleri",f:"x = (−b ± √Δ) / 2a",n:"Δ = b² − 4ac."},
    {id:"m-root-sum",c:"Matematik",t:"Kökler toplamı ve çarpımı",f:"x₁+x₂ = −b/a; x₁x₂ = c/a",n:"ax²+bx+c=0 için."},
    {id:"m-arith-n",c:"Matematik",t:"Aritmetik dizi",f:"aₙ = a₁ + (n−1)d",n:"d ortak farktır."},
    {id:"m-arith-s",c:"Matematik",t:"Aritmetik dizi toplamı",f:"Sₙ = n(a₁+aₙ)/2",n:"İlk n terimin toplamı."},
    {id:"m-geo-n",c:"Matematik",t:"Geometrik dizi",f:"aₙ = a₁·rⁿ⁻¹",n:"r ortak çarpandır."},
    {id:"m-geo-s",c:"Matematik",t:"Geometrik dizi toplamı",f:"Sₙ = a₁(1−rⁿ)/(1−r)",n:"r ≠ 1 için."},
    {id:"m-log-product",c:"Matematik",t:"Logaritma çarpım",f:"logₐ(xy) = logₐx + logₐy",n:"x,y > 0."},
    {id:"m-log-change",c:"Matematik",t:"Taban değiştirme",f:"logₐb = log꜀b / log꜀a",n:"Uygun herhangi bir c tabanı kullanılabilir."},
    {id:"m-der-power",c:"Matematik",t:"Kuvvetin türevi",f:"(xⁿ)′ = n·xⁿ⁻¹",n:"Temel türev kuralı."},
    {id:"m-der-product",c:"Matematik",t:"Çarpımın türevi",f:"(fg)′ = f′g + fg′",n:"İki fonksiyonun çarpımı."},
    {id:"m-der-quotient",c:"Matematik",t:"Bölümün türevi",f:"(f/g)′ = (f′g−fg′)/g²",n:"g ≠ 0."},
    {id:"m-integral-power",c:"Matematik",t:"Kuvvet integrali",f:"∫xⁿdx = xⁿ⁺¹/(n+1) + C",n:"n ≠ −1."},
    {id:"m-trig-main",c:"Matematik",t:"Temel trigonometrik özdeşlik",f:"sin²x + cos²x = 1",n:"Tüm x değerleri için."},
    {id:"m-trig-double",c:"Matematik",t:"İki kat açı",f:"sin2x = 2sinx·cosx",n:"cos2x için birden çok eşdeğer biçim vardır."},
    {id:"m-binomial",c:"Matematik",t:"Binom terimi",f:"Tₖ₊₁ = C(n,k)·aⁿ⁻ᵏ·bᵏ",n:"(a+b)ⁿ açılımında."},
    {id:"m-prob",c:"Matematik",t:"Olasılık",f:"P(A) = istenen durum / tüm durum",n:"Eş olasılıklı sonlu uzay için."},
    {id:"g-triangle",c:"Geometri",t:"Üçgen alanı",f:"A = taban·yükseklik / 2",n:"Herhangi bir kenar taban seçilebilir."},
    {id:"g-heron",c:"Geometri",t:"Heron formülü",f:"A = √[s(s−a)(s−b)(s−c)]",n:"s = (a+b+c)/2."},
    {id:"g-sine-area",c:"Geometri",t:"Sinüslü alan",f:"A = ab·sinC / 2",n:"İki kenar ve aradaki açı."},
    {id:"g-sine-law",c:"Geometri",t:"Sinüs teoremi",f:"a/sinA = b/sinB = c/sinC = 2R",n:"R çevrel çember yarıçapı."},
    {id:"g-cos-law",c:"Geometri",t:"Kosinüs teoremi",f:"a² = b²+c²−2bc·cosA",n:"Pisagor'un genellemesidir."},
    {id:"g-circle",c:"Geometri",t:"Çember ve daire",f:"Çevre = 2πr · Alan = πr²",n:"r yarıçaptır."},
    {id:"g-sector",c:"Geometri",t:"Daire dilimi alanı",f:"A = (α/360°)·πr²",n:"α merkez açıdır."},
    {id:"g-distance",c:"Geometri",t:"İki nokta arası uzaklık",f:"d = √[(x₂−x₁)²+(y₂−y₁)²]",n:"Analitik düzlemde."},
    {id:"g-midpoint",c:"Geometri",t:"Orta nokta",f:"M = ((x₁+x₂)/2, (y₁+y₂)/2)",n:"Doğru parçasının orta noktası."},
    {id:"g-slope",c:"Geometri",t:"Doğrunun eğimi",f:"m = (y₂−y₁)/(x₂−x₁)",n:"Düşey doğruda tanımsızdır."},
    {id:"p-speed",c:"Fizik",t:"Ortalama sürat",f:"sürat = toplam yol / toplam zaman",n:"Yol skaler büyüklüktür."},
    {id:"p-acc",c:"Fizik",t:"İvme",f:"a = Δv / Δt",n:"Hızın zamana göre değişimi."},
    {id:"p-newton",c:"Fizik",t:"Newton'un ikinci yasası",f:"Fₙₑₜ = m·a",n:"Net kuvvet kullanılır."},
    {id:"p-momentum",c:"Fizik",t:"Momentum",f:"p = m·v",n:"Vektörel büyüklüktür."},
    {id:"p-impulse",c:"Fizik",t:"İtme",f:"I = F·Δt = Δp",n:"Kuvvet-zaman alanı momentum değişimidir."},
    {id:"p-work",c:"Fizik",t:"İş",f:"W = F·x·cosθ",n:"θ kuvvet ile yer değiştirme arasındaki açı."},
    {id:"p-power",c:"Fizik",t:"Güç",f:"P = W/t",n:"Birim watt."},
    {id:"p-kinetic",c:"Fizik",t:"Kinetik enerji",f:"Eₖ = ½mv²",n:"Hareket enerjisi."},
    {id:"p-potential",c:"Fizik",t:"Çekim potansiyel enerjisi",f:"Eₚ = mgh",n:"Yer yüzeyine yakın yükseklikler için."},
    {id:"p-hooke",c:"Fizik",t:"Yay kuvveti",f:"F = −k·x",n:"Eksi işareti kuvvetin ters yönünü gösterir."},
    {id:"p-pressure",c:"Fizik",t:"Basınç",f:"P = F/A",n:"Dik kuvvetin yüzey alanına oranı."},
    {id:"p-density",c:"Fizik",t:"Özkütle",f:"ρ = m/V",n:"Kütlenin hacme oranı."},
    {id:"p-heat",c:"Fizik",t:"Isı",f:"Q = m·c·ΔT",n:"Hâl değişimi yokken."},
    {id:"p-coulomb",c:"Fizik",t:"Coulomb kuvveti",f:"F = k|q₁q₂|/r²",n:"Noktasal yükler için."},
    {id:"p-ohm",c:"Fizik",t:"Ohm yasası",f:"V = I·R",n:"Gerilim, akım ve direnç ilişkisi."},
    {id:"p-electric-power",c:"Fizik",t:"Elektriksel güç",f:"P = V·I = I²R = V²/R",n:"Devre elemanında harcanan güç."},
    {id:"p-wave",c:"Fizik",t:"Dalga hızı",f:"v = f·λ",n:"f frekans, λ dalga boyu."},
    {id:"c-mole",c:"Kimya",t:"Mol-kütle ilişkisi",f:"n = m/M",n:"M mol kütlesidir."},
    {id:"c-molarity",c:"Kimya",t:"Molarite",f:"M = n / V(L)",n:"Çözünen molü / çözelti hacmi."},
    {id:"c-ideal-gas",c:"Kimya",t:"İdeal gaz",f:"P·V = n·R·T",n:"T kelvin cinsinden alınır."},
    {id:"c-ph",c:"Kimya",t:"pH",f:"pH = −log[H⁺]",n:"25 °C sulu çözelti yaklaşımı."},
    {id:"c-poh",c:"Kimya",t:"pH-pOH ilişkisi",f:"pH + pOH = 14",n:"25 °C için."},
    {id:"c-dilution",c:"Kimya",t:"Seyreltme",f:"M₁V₁ = M₂V₂",n:"Çözünen molü sabitken."},
    {id:"c-yield",c:"Kimya",t:"Yüzde verim",f:"% verim = gerçek ürün / teorik ürün × 100",n:"Gerçekleşen ürün miktarını karşılaştırır."}
  ];
  let tab="cards",currentCardId=0,answerOpen=false,formulaCategory="Tümü",formulaQuery="";
  const escapeHtml=value=>typeof esc==="function"?esc(value):String(value||"").replace(/[&<>"']/g,s=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[s]));
  function learning(){
    if(!S.learning||typeof S.learning!=="object")S.learning={};
    if(!Array.isArray(S.learning.cards))S.learning.cards=[];
    if(!Array.isArray(S.learning.formulaFav))S.learning.formulaFav=[];
    if(!Array.isArray(S.learning.reviewLog))S.learning.reviewLog=[];
    return S.learning;
  }
  function dueCards(){return learning().cards.filter(x=>(x.due||todayKey())<=todayKey()).sort((a,b)=>(a.due||"").localeCompare(b.due||"")||(a.updatedAt||0)-(b.updatedAt||0));}
  function activeCard(){const due=dueCards();let card=learning().cards.find(x=>x.id===currentCardId&&x.due<=todayKey());if(!card)card=due[0]||null;if(card)currentCardId=card.id;return card;}
  function renderStats(){
    const l=learning(),due=dueCards(),cut=Date.now()-30*86400000,recent=l.reviewLog.filter(x=>x.at>=cut),ok=recent.filter(x=>x.grade>=2).length;
    const set=(id,value)=>{const node=document.getElementById(id);if(node)node.textContent=value;};
    set("v313DueCount",due.length);set("v313CardCount",l.cards.length);set("v313Success",recent.length?Math.round(ok/recent.length*100)+"%":"—");
  }
  function renderTabs(){
    ["cards","formulas","analysis"].forEach(name=>{
      document.getElementById("v313Tab"+name)?.classList.toggle("on",tab===name);
      const panel=document.getElementById("v313Panel"+name);if(panel)panel.hidden=tab!==name;
    });
  }
  function renderCards(){
    const box=document.getElementById("v313CardReview");if(!box)return;const card=activeCard(),due=dueCards();
    if(!card){box.innerHTML='<div class="empty">Bugün bekleyen kart yok. Yeni kart ekleyebilir veya formül bankasına geçebilirsin.</div>';renderCardList();return;}
    box.innerHTML='<div class="v313-card-subject">'+escapeHtml(card.subject||"Genel")+' · '+due.length+' kart bekliyor</div><div class="v313-card-question">'+escapeHtml(card.q)+'</div>'+(answerOpen?'<div class="v313-card-answer">'+escapeHtml(card.a)+'</div><div class="v313-grade-row"><button type="button" onclick="v313Grade(0)">Tekrar</button><button type="button" onclick="v313Grade(1)">Zor</button><button type="button" onclick="v313Grade(2)">İyi</button><button type="button" onclick="v313Grade(3)">Kolay</button></div>':'<button class="btn green small" type="button" onclick="v313ShowAnswer()">Cevabı göster</button>');
    renderCardList();
  }
  function renderCardList(){
    const box=document.getElementById("v313CardList");if(!box)return;const cards=learning().cards.slice().sort((a,b)=>(a.due||"").localeCompare(b.due||"")).slice(0,30);
    if(!cards.length){box.innerHTML="";return;}
    box.innerHTML='<details><summary>Tüm kartlar · '+learning().cards.length+'</summary><div class="v313-list">'+cards.map(x=>'<div><span><b>'+escapeHtml(x.subject||"Genel")+'</b>'+escapeHtml(x.q)+'</span><small>'+escapeHtml(x.due||todayKey())+'</small><button type="button" aria-label="Kartı sil" onclick="v313DeleteCard('+x.id+')">×</button></div>').join("")+'</div></details>';
  }
  function renderFormulas(){
    const box=document.getElementById("v313FormulaList");if(!box)return;const fav=new Set(learning().formulaFav),q=formulaQuery.toLocaleLowerCase("tr");
    const list=FORMULAS.filter(x=>(formulaCategory==="Tümü"||x.c===formulaCategory)&&(!q||(x.t+" "+x.f+" "+x.n).toLocaleLowerCase("tr").includes(q))).sort((a,b)=>(fav.has(b.id)?1:0)-(fav.has(a.id)?1:0)||a.t.localeCompare(b.t,"tr"));
    box.innerHTML=list.length?list.map(x=>'<article class="v313-formula '+(fav.has(x.id)?'fav':'')+'"><button type="button" class="v313-star" aria-label="Favori" onclick="v313ToggleFormula(\''+x.id+'\')">'+(fav.has(x.id)?'★':'☆')+'</button><small>'+escapeHtml(x.c)+'</small><b>'+escapeHtml(x.t)+'</b><div>'+escapeHtml(x.f)+'</div><p>'+escapeHtml(x.n)+'</p></article>').join(""):'<div class="empty">Aramana uyan formül bulunamadı.</div>';
    ["Tümü","Matematik","Geometri","Fizik","Kimya"].forEach(name=>document.getElementById("v313Cat"+name)?.classList.toggle("on",formulaCategory===name));
  }
  function renderAnalysis(){
    const box=document.getElementById("v313Analysis");if(!box)return;const log=learning().reviewLog,cut=Date.now()-30*86400000,recent=log.filter(x=>x.at>=cut),by={};
    recent.forEach(x=>{const row=by[x.subject]||(by[x.subject]={n:0,ok:0});row.n++;if(x.grade>=2)row.ok++;});
    const rows=Object.keys(by).map(subject=>({subject,n:by[subject].n,rate:Math.round(by[subject].ok/by[subject].n*100)})).sort((a,b)=>a.rate-b.rate||b.n-a.n);
    const risk=typeof v2RiskList==="function"?v2RiskList(3):[];
    box.innerHTML='<div class="v313-analysis-grid"><div><small>Son 30 gün tekrar</small><b>'+recent.length+'</b></div><div><small>Bugün bekleyen</small><b>'+dueCards().length+'</b></div><div><small>Favori formül</small><b>'+learning().formulaFav.length+'</b></div></div>'+(rows.length?'<h3>Kart başarısı</h3>'+rows.map(x=>'<div class="dayrow"><span class="k">'+escapeHtml(x.subject)+' · '+x.n+' tekrar</span><span class="v">%'+x.rate+'</span></div>').join(""):'<div class="empty">Kart tekrar ettikçe ders bazlı başarı oranı burada oluşacak.</div>')+(risk.length?'<h3>Konu verisiyle birleşen öneri</h3><p class="hint">Kart çalışmasına ek olarak önce <b>'+escapeHtml(risk[0].subj+' · '+risk[0].topic)+'</b> konusunu ele al. Risk nedeni: '+escapeHtml((risk[0].reasons||[]).join(" · "))+'.</p>':"");
  }
  function render(){renderStats();renderTabs();renderCards();renderFormulas();renderAnalysis();return true;}

  window.v313SetTab=name=>{tab=["cards","formulas","analysis"].includes(name)?name:"cards";render();};
  window.v313ShowAnswer=()=>{answerOpen=true;renderCards();};
  window.v313Grade=grade=>{
    const card=activeCard();if(!card)return false;const next=window.YKSCore.srsNext(card,grade,todayKey());Object.assign(card,next);
    learning().reviewLog.push({id:Date.now()+Math.floor(Math.random()*1000),cardId:card.id,at:Date.now(),grade:Number(grade)||0,subject:card.subject||"Genel"});
    learning().reviewLog=learning().reviewLog.slice(-2000);currentCardId=0;answerOpen=false;save();render();return true;
  };
  window.v313AddCard=()=>{
    const subject=(document.getElementById("v313CardSubject")?.value||"Genel").trim()||"Genel",q=(document.getElementById("v313CardQ")?.value||"").trim(),a=(document.getElementById("v313CardA")?.value||"").trim();
    if(!q||!a){toast("Kart için soru ve cevap yaz");return false;}
    learning().cards.push({id:Date.now()+Math.floor(Math.random()*1000),subject:subject.slice(0,60),q:q.slice(0,500),a:a.slice(0,1200),due:todayKey(),interval:0,ease:2.5,reps:0,lapses:0,createdAt:Date.now(),updatedAt:Date.now()});
    document.getElementById("v313CardQ").value="";document.getElementById("v313CardA").value="";save();render();toast("Tekrar kartı eklendi");return true;
  };
  window.v313DeleteCard=id=>{const index=learning().cards.findIndex(x=>x.id===id);if(index<0)return false;const old=learning().cards[index];if(!confirm("Bu tekrar kartı silinsin mi?"))return false;learning().cards.splice(index,1);if(typeof logAdd==="function")logAdd("sil","Tekrar kartı silindi: "+old.q.slice(0,60),null);save();currentCardId=0;render();return true;};
  window.v313FormulaSearch=value=>{formulaQuery=String(value||"").trim();renderFormulas();};
  window.v313FormulaCategory=name=>{formulaCategory=name;renderFormulas();};
  window.v313ToggleFormula=id=>{const fav=learning().formulaFav,index=fav.indexOf(id);if(index>=0)fav.splice(index,1);else fav.push(id);save();renderStats();renderFormulas();renderAnalysis();};
  window.v313RenderLearning=render;
  const oldRender=window.renderSubjects;if(typeof oldRender==="function")window.renderSubjects=function(){const result=oldRender.apply(this,arguments);window.YKSSafeRender?.("learning-tools",render,"v313Learning");return result;};
  const start=()=>window.YKSSafeRender?window.YKSSafeRender("learning-tools",render,"v313Learning"):render();
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",()=>setTimeout(start,280),{once:true});else setTimeout(start,280);
})();
