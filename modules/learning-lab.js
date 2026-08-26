(function(){
  "use strict";

  const LAB_STYLE_HREF="./modules/learning-lab-v2.css?v=4.0.0-r1";
  const REMOVED_PARAGRAPH_API_MARKER="v320StartParagraph";
  const SYMBOLS="H He Li Be B C N O F Ne Na Mg Al Si P S Cl Ar K Ca Sc Ti V Cr Mn Fe Co Ni Cu Zn Ga Ge As Se Br Kr Rb Sr Y Zr Nb Mo Tc Ru Rh Pd Ag Cd In Sn Sb Te I Xe Cs Ba La Ce Pr Nd Pm Sm Eu Gd Tb Dy Ho Er Tm Yb Lu Hf Ta W Re Os Ir Pt Au Hg Tl Pb Bi Po At Rn Fr Ra Ac Th Pa U Np Pu Am Cm Bk Cf Es Fm Md No Lr Rf Db Sg Bh Hs Mt Ds Rg Cn Nh Fl Mc Lv Ts Og".split(" ");
  const NAMES="Hidrojen|Helyum|Lityum|Berilyum|Bor|Karbon|Azot|Oksijen|Flor|Neon|Sodyum|Magnezyum|Alüminyum|Silisyum|Fosfor|Kükürt|Klor|Argon|Potasyum|Kalsiyum|Skandiyum|Titanyum|Vanadyum|Krom|Manganez|Demir|Kobalt|Nikel|Bakır|Çinko|Galyum|Germanyum|Arsenik|Selenyum|Brom|Kripton|Rubidyum|Stronsiyum|İtriyum|Zirkonyum|Niyobyum|Molibden|Teknesyum|Rutenyum|Rodyum|Paladyum|Gümüş|Kadmiyum|İndiyum|Kalay|Antimon|Tellür|İyot|Ksenon|Sezyum|Baryum|Lantan|Seryum|Praseodim|Neodimyum|Prometyum|Samaryum|Evropiyum|Gadolinyum|Terbiyum|Disprozyum|Holmiyum|Erbiyum|Tulyum|İterbiyum|Lütesyum|Hafniyum|Tantal|Tungsten|Renyum|Osmiyum|İridyum|Platin|Altın|Cıva|Talyum|Kurşun|Bizmut|Polonyum|Astatin|Radon|Fransiyum|Radyum|Aktinyum|Toryum|Protaktinyum|Uranyum|Neptünyum|Plütonyum|Amerikyum|Küriyum|Berkelyum|Kaliforniyum|Einsteinyum|Fermiyum|Mendelevyum|Nobelyum|Lavrensiyum|Rutherfordiyum|Dubniyum|Seaborgiyum|Bohriyum|Hassiyum|Meitneryum|Darmstadtiyum|Röntgenyum|Kopernikyum|Nihonyum|Flerovyum|Moskovyum|Livermoryum|Tennessin|Oganesson".split("|");
  const SETS={
    noble:new Set([2,10,18,36,54,86,118]),
    halogen:new Set([9,17,35,53,85,117]),
    alkali:new Set([3,11,19,37,55,87]),
    alkaline:new Set([4,12,20,38,56,88]),
    metalloid:new Set([5,14,32,33,51,52,84]),
    nonmetal:new Set([1,6,7,8,15,16,34])
  };
  const period=n=>n<=2?1:n<=10?2:n<=18?3:n<=36?4:n<=54?5:n<=86?6:7;
  function typeOf(n){
    if(SETS.noble.has(n))return "Soy gaz";
    if(SETS.halogen.has(n))return "Halojen";
    if(SETS.alkali.has(n))return "Alkali metal";
    if(SETS.alkaline.has(n))return "Toprak alkali metal";
    if(n>=57&&n<=71)return "Lantanit";
    if(n>=89&&n<=103)return "Aktinit";
    if(SETS.metalloid.has(n))return "Yarı metal";
    if(SETS.nonmetal.has(n))return "Ametal";
    if((n>=21&&n<=30)||(n>=39&&n<=48)||(n>=72&&n<=80)||(n>=104&&n<=112))return "Geçiş metali";
    return "Metal";
  }
  const ELEMENTS=SYMBOLS.map((symbol,index)=>({n:index+1,symbol,name:NAMES[index],period:period(index+1),type:typeOf(index+1)}));

  const TIMELINE=[
    ["MÖ 3200","Yazının icadı","Sümerlerde çivi yazısının kullanılmasıyla tarih çağları başladı.","İlk Çağ"],
    ["MÖ 209","Asya Hun Devleti","Mete Han döneminde Türk siyasi birliği güçlendi.","İlk Çağ"],
    ["375","Kavimler Göçü","Avrupa'nın siyasi ve toplumsal yapısını değiştiren büyük göç hareketi.","İlk Çağ"],
    ["552","Göktürk Devleti","Türk adını devlet adı olarak kullanan ilk Türk devleti kuruldu.","İlk Çağ"],
    ["751","Talas Savaşı","Türklerle Arapların yakınlaşması ve kâğıdın batıya yayılması hızlandı.","Türk-İslam"],
    ["840","Karahanlılar","İslamiyet'i resmî din olarak benimseyen ilk Türk devleti.","Türk-İslam"],
    ["1040","Dandanakan Savaşı","Büyük Selçuklu Devleti bağımsızlığını kesinleştirdi.","Türk-İslam"],
    ["1071","Malazgirt Savaşı","Anadolu'nun Türkleşme süreci hızlandı.","Türk-İslam"],
    ["1176","Miryokefalon Savaşı","Anadolu'nun Türk yurdu olduğu büyük ölçüde kesinleşti.","Türk-İslam"],
    ["1299","Osmanlı Devleti'nin kuruluşu","Osmanlı Beyliği bağımsız bir siyasi güç hâline geldi.","Osmanlı"],
    ["1453","İstanbul'un fethi","Bizans sona erdi; Osmanlı dünya gücü olma yolunda ilerledi.","Osmanlı"],
    ["1514","Çaldıran Savaşı","Osmanlı, Safeviler karşısında üstünlük sağladı.","Osmanlı"],
    ["1517","Mısır Seferi","Memlük Devleti sona erdi; kutsal şehirlerin yönetimi Osmanlı'ya geçti.","Osmanlı"],
    ["1526","Mohaç Meydan Muharebesi","Macar Krallığı kısa sürede yenildi.","Osmanlı"],
    ["1538","Preveze Deniz Zaferi","Akdeniz'de Osmanlı üstünlüğü güçlendi.","Osmanlı"],
    ["1606","Zitvatorok Antlaşması","Osmanlı'nın Avusturya üzerindeki siyasi üstünlüğü zayıfladı.","Osmanlı"],
    ["1699","Karlofça Antlaşması","Osmanlı ilk kez büyük ölçekte toprak kaybetti.","Osmanlı"],
    ["1718","Pasarofça ve Lale Devri","Batı'yı örnek alan yenileşme hareketleri hızlandı.","Osmanlı"],
    ["1774","Küçük Kaynarca Antlaşması","Kırım bağımsız oldu; Rusya önemli ayrıcalıklar kazandı.","Osmanlı"],
    ["1789","Fransız İhtilali","Milliyetçilik ve eşitlik düşünceleri dünyaya yayıldı.","Dünya"],
    ["1804","Sırp İsyanı","Osmanlı'daki ilk milliyetçi isyan başladı.","Osmanlı"],
    ["1826","Vaka-i Hayriye","Yeniçeri Ocağı kaldırıldı.","Osmanlı"],
    ["1839","Tanzimat Fermanı","Can, mal ve namus güvenliği konusunda hukuki güvenceler ilan edildi.","Osmanlı"],
    ["1856","Islahat Fermanı","Gayrimüslimlere yeni haklar tanındı.","Osmanlı"],
    ["1876","I. Meşrutiyet","Kanun-ı Esasi ilan edildi ve Meclis açıldı.","Osmanlı"],
    ["1908","II. Meşrutiyet","Meclis yeniden açıldı ve anayasal yönetime dönüldü.","Osmanlı"],
    ["1911","Trablusgarp Savaşı","Osmanlı Kuzey Afrika'daki son toprağını kaybetti.","Osmanlı"],
    ["1912–1913","Balkan Savaşları","Osmanlı'nın Balkanlardaki hâkimiyeti büyük ölçüde sona erdi.","Osmanlı"],
    ["1914–1918","I. Dünya Savaşı","İttifak ve İtilaf devletleri arasında küresel savaş yaşandı.","Dünya"],
    ["19 Mayıs 1919","Mustafa Kemal Samsun'da","Milli Mücadele'nin fiilî başlangıcı kabul edilir.","Milli Mücadele"],
    ["23 Temmuz 1919","Erzurum Kongresi","Vatanın bölünmezliği ve millî irade vurgulandı.","Milli Mücadele"],
    ["4 Eylül 1919","Sivas Kongresi","Millî cemiyetler Anadolu ve Rumeli Müdafaa-i Hukuk çatısında birleşti.","Milli Mücadele"],
    ["23 Nisan 1920","TBMM açıldı","Egemenliğin millete ait olduğu yeni yönetim merkezi kuruldu.","Milli Mücadele"],
    ["1921","Sakarya Meydan Muharebesi","Yunan ilerleyişi durduruldu; savunmadan taarruza geçiş başladı.","Milli Mücadele"],
    ["26 Ağustos 1922","Büyük Taarruz","İşgal kuvvetlerinin Anadolu'dan çıkarılması sağlandı.","Milli Mücadele"],
    ["24 Temmuz 1923","Lozan Barış Antlaşması","Yeni Türk devletinin bağımsızlığı uluslararası alanda tanındı.","Cumhuriyet"],
    ["29 Ekim 1923","Cumhuriyet ilanı","Devletin yönetim biçimi cumhuriyet oldu.","Cumhuriyet"],
    ["3 Mart 1924","Halifeliğin kaldırılması","Laikleşme ve millî egemenlik yolunda önemli adım atıldı.","Cumhuriyet"],
    ["1928","Harf İnkılabı","Latin esaslı Türk alfabesi kabul edildi.","Cumhuriyet"],
    ["1934","Kadınlara milletvekili seçme ve seçilme hakkı","Türk kadınları siyasi temsil hakkını kazandı.","Cumhuriyet"],
    ["1939–1945","II. Dünya Savaşı","Mihver ve Müttefik devletler arasında küresel savaş yaşandı.","Dünya"],
    ["1945","Birleşmiş Milletler","Uluslararası barış ve güvenlik amacıyla kuruldu.","Dünya"],
    ["1952","Türkiye NATO'da","Türkiye Kuzey Atlantik İttifakı'na katıldı.","Cumhuriyet"],
    ["1961","Yeni anayasa","1961 Anayasası halkoyuyla kabul edildi.","Cumhuriyet"],
    ["1989","Berlin Duvarı'nın yıkılması","Soğuk Savaş'ın sona erme süreci hızlandı.","Dünya"],
    ["1991","SSCB'nin dağılması","Soğuk Savaş dönemi sona erdi ve yeni devletler ortaya çıktı.","Dünya"]
  ].map((x,i)=>({id:"t"+i,year:x[0],title:x[1],detail:x[2],era:x[3]}));

  let tab="periodic";
  let scienceSubject="biology";
  let elementQuery="";
  let timelineQuery="";
  let selectedElement=26;
  let timelinePractice=false;
  const timelineRevealed=new Set();
  let courseExam="TYT",courseSubject=-1,courseTopic=-1,courseQuery="",globalCourseQuery="";

  const html=value=>typeof esc==="function"?esc(value):String(value||"").replace(/[&<>"']/g,s=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[s]));
  function toastSafe(message){try{if(typeof toast==="function")toast(message);}catch(e){}}
  function saveSafe(){try{if(typeof save==="function")save();}catch(e){}}

  function ensureLabStyles(){
    if(document.getElementById("v4LearningLabV2Css"))return;
    const link=document.createElement("link");
    link.id="v4LearningLabV2Css";
    link.rel="stylesheet";
    link.href=LAB_STYLE_HREF;
    document.head.appendChild(link);
  }

  function ensureToolboxStructure(){
    ensureLabStyles();
    const lab=document.getElementById("v320LearningLab");
    const toolbox=lab?.querySelector?.(".v320-toolbox");
    if(!toolbox)return false;

    document.getElementById("v320TabParagraph")?.remove();
    document.getElementById("v320PanelParagraph")?.remove();

    const tabs=toolbox.querySelector(".v320-tabs");
    if(tabs&&!document.getElementById("v320TabScience")){
      tabs.classList.remove("tri");
      tabs.classList.add("v4-lab-main-tabs");
      tabs.innerHTML='<button id="v320TabPeriodic" type="button" onclick="v320SetTab(\'periodic\')">Periyodik Tablo</button><button id="v320TabTimeline" type="button" onclick="v320SetTab(\'timeline\')">Kronoloji</button><button id="v320TabScience" type="button" onclick="v320SetTab(\'science\')">Bilim Kartları</button>';
    }

    if(!document.getElementById("v320PanelScience")){
      const panel=document.createElement("div");
      panel.id="v320PanelScience";
      panel.hidden=true;
      panel.innerHTML='<div class="v327-tool-intro"><div><span>Hızlı fen tekrarı</span><b>Biyoloji ve fizik için YKS odaklı kart alanı</b></div><small>Sistemler, formüller, sık hatalar ve kritik bilgiler tek yerde.</small></div><div class="v4-science-switch" role="tablist" aria-label="Bilim kartı dersi"><button id="v4ScienceBiology" class="on" type="button" onclick="v4SetScienceSubject(\'biology\')">Biyoloji</button><button id="v4SciencePhysics" type="button" onclick="v4SetScienceSubject(\'physics\')">Fizik</button></div><div id="v4ScienceCards" class="v4-science-placeholder"></div>';
      toolbox.appendChild(panel);
    }
    return true;
  }

  function curriculumSnapshot(){
    const source=typeof CURRICULUM!=="undefined"&&CURRICULUM&&typeof CURRICULUM==="object"?CURRICULUM:{};
    return ["TYT","AYT","YDT"].reduce((out,exam)=>{
      out[exam]=(Array.isArray(source[exam])?source[exam]:[]).map(subject=>({name:String(subject.name||"Ders"),topics:Array.isArray(subject.topics)?subject.topics.map(String):[]}));
      return out;
    },{});
  }
  function topicKey(exam,subject,topic){return [exam,subject,topic].map(x=>String(x||"").trim()).join("|");}
  function topicCatalog(exam){
    const subjects=curriculumSnapshot()[exam]||[];
    return subjects.flatMap((subject,subjectIndex)=>subject.topics.map((topic,topicIndex)=>{
      const guide=window.YKSTopicGuides?.guideFor?.(exam,subject.name,topic),parts=[exam,subject.name,topic];
      if(guide)parts.push(...guide.important,...guide.attention,...guide.mistakes,...guide.study,...(guide.checklist||[]));
      return {exam,subject:subject.name,subjectIndex,topic,topicIndex,key:topicKey(exam,subject.name,topic),searchText:parts.join(" ").toLocaleLowerCase("tr")};
    }));
  }
  function searchTopics(options={}){
    const exam=["TYT","AYT","YDT"].includes(options.exam)?options.exam:"TYT",query=String(options.query||"").trim().toLocaleLowerCase("tr"),favorites=options.favorites instanceof Set?options.favorites:new Set(options.favorites||[]);
    return topicCatalog(exam).filter(item=>(!options.onlyFavorites||favorites.has(item.key))&&(!query||item.searchText.includes(query)));
  }
  function favoriteButton(item){
    const active=new Set(state().topicFav).has(item.key);
    return '<button class="v4-topic-fav" type="button" aria-label="'+html(item.topic+(active?' konusunu favoriden çıkar':' konusunu favoriye ekle'))+'" aria-pressed="'+active+'" onclick="v4ToggleTopicFavorite('+item.subjectIndex+','+item.topicIndex+',event)">'+(active?'★':'☆')+'</button>';
  }
  function topicResultCard(item){return '<article class="v4-topic-result"><button type="button" onclick="v4OpenLabTopic('+item.subjectIndex+','+item.topicIndex+')"><small>'+html(item.exam+' · '+item.subject)+'</small><b>'+html(item.topic)+'</b><span>Dikkat noktaları ve önemli bilgiler ›</span></button>'+favoriteButton(item)+'</article>';}
  function renderTopicGuide(subject,topic){
    const api=window.YKSTopicGuides,guide=api?.guideFor?.(courseExam,subject.name,topic);
    if(!guide)return '<p>Konu rehberi yüklenemedi. Sayfayı yenileyip yeniden dene.</p>';
    const block=(icon,title,items)=>'<section class="v326-guide-block"><div class="v326-guide-title"><span aria-hidden="true">'+icon+'</span><h3>'+html(title)+'</h3></div><ul>'+items.map(item=>'<li>'+html(item)+'</li>').join("")+'</ul></section>';
    const key=topicKey(courseExam,subject.name,topic),favorite=new Set(state().topicFav).has(key);
    return '<header class="v326-guide-head"><div><small>'+html(guide.exam+' · '+guide.subject)+'</small><h2>'+html(guide.topic)+'</h2><p>Bu konu için hızlı çalışma rehberi</p></div><div class="v4-guide-actions"><span class="v326-guide-badge">Konuya özel</span><button type="button" aria-pressed="'+favorite+'" onclick="v4ToggleTopicFavorite('+courseSubject+','+courseTopic+',event)">'+(favorite?'★ Favoride':'☆ Favoriye ekle')+'</button></div></header><div class="v326-guide-grid">'+block('!','Dikkat et',guide.attention)+block('◆','Önemli bilgiler',guide.important)+block('×','Sık yapılan hatalar',guide.mistakes)+block('→','Nasıl çalışmalı?',guide.study)+block('✓','Kendini kontrol et',guide.checklist||[])+'</div><section class="v326-guide-sources"><div><b>Resmî çalışma kaynakları</b><small>MEB ve ÖSYM bağlantıları yeni sekmede açılır.</small></div><div class="v326-source-links">'+guide.sources.map(source=>'<a href="'+html(source.url)+'" target="_blank" rel="noopener noreferrer">'+html(source.label)+' <span aria-hidden="true">↗</span></a>').join("")+'</div></section><p class="v326-guide-note">'+html(guide.note)+'</p>';
  }
  function renderCourses(){
    const home=document.getElementById("v320CourseHome"),topicsView=document.getElementById("v320CourseTopics"),grid=document.getElementById("v320SubjectGrid");
    if(!home||!topicsView||!grid)return false;
    const curriculum=curriculumSnapshot(),subjects=curriculum[courseExam]||[];
    ["TYT","AYT","YDT"].forEach(exam=>document.getElementById("v320Exam"+exam)?.classList.toggle("on",courseExam===exam));
    const title=document.getElementById("v320CourseTitle"),meta=document.getElementById("v320CourseMeta"),topicCount=subjects.reduce((sum,x)=>sum+x.topics.length,0);
    const favoriteSet=new Set(state().topicFav),examFavorites=topicCatalog(courseExam).filter(item=>favoriteSet.has(item.key)).length;
    if(title)title.textContent=courseExam+" dersleri";
    if(meta)meta.textContent=subjects.length+" ders · "+topicCount+" konu · "+examFavorites+" favori";
    const subject=subjects[courseSubject],inside=!!subject;
    home.hidden=inside;topicsView.hidden=!inside;
    const globalOnly=!!document.getElementById("v4LabFavOnly")?.checked,globalResults=searchTopics({exam:courseExam,query:globalCourseQuery,onlyFavorites:globalOnly,favorites:favoriteSet}),resultsRoot=document.getElementById("v4LabSearchResults"),resultMeta=document.getElementById("v4LabResultMeta"),searching=!!globalCourseQuery||globalOnly;
    grid.hidden=searching;
    if(resultsRoot){resultsRoot.hidden=!searching;resultsRoot.innerHTML=searching?(globalResults.length?globalResults.map(topicResultCard).join(""):'<div class="empty">Aramana veya favori filtresine uyan konu bulunamadı.</div>'):"";}
    if(resultMeta)resultMeta.textContent=searching?globalResults.length+" konu bulundu":"Ders seçebilir veya bütün konularda arama yapabilirsin.";
    grid.innerHTML=subjects.map((x,index)=>{const favCount=x.topics.filter(topic=>favoriteSet.has(topicKey(courseExam,x.name,topic))).length;return '<button class="v320-subject-card" type="button" onclick="v320OpenSubject('+index+')"><span>'+html(courseExam)+'</span><b>'+html(x.name)+'</b><small>'+x.topics.length+' konu'+(favCount?' · '+favCount+' favori':'')+'</small><i>›</i></button>';}).join("");
    if(!inside)return true;
    const subjectTitle=document.getElementById("v320SubjectTitle"),subjectMeta=document.getElementById("v320SubjectMeta"),topicGrid=document.getElementById("v320TopicGrid"),selection=document.getElementById("v320TopicSelection");
    if(subjectTitle)subjectTitle.textContent=subject.name;
    if(subjectMeta)subjectMeta.textContent=courseExam+" · "+subject.topics.length+" konu";
    const only=!!document.getElementById("v4LabSubjectFavOnly")?.checked,filtered=searchTopics({exam:courseExam,query:courseQuery,onlyFavorites:only,favorites:favoriteSet}).filter(item=>item.subjectIndex===courseSubject);
    if(topicGrid)topicGrid.innerHTML=filtered.length?filtered.map(item=>'<article class="v4-topic-row '+(courseTopic===item.topicIndex?'on':'')+'"><button class="v320-topic-card" type="button" onclick="v320SelectTopic('+item.topicIndex+')"><span>'+(item.topicIndex+1)+'</span><b>'+html(item.topic)+'</b></button>'+favoriteButton(item)+'</article>').join(""):'<div class="empty">Aramana veya favori filtresine uyan konu bulunamadı.</div>';
    const selected=subject.topics[courseTopic];
    if(selection){selection.hidden=!selected;selection.innerHTML=selected?renderTopicGuide(subject,selected):"";}
    return true;
  }

  function state(){
    if(!S.lab||typeof S.lab!=="object")S.lab={};
    if(!Array.isArray(S.lab.paragraphLog))S.lab.paragraphLog=[];
    if(!Array.isArray(S.lab.elementFav))S.lab.elementFav=[];
    if(!Array.isArray(S.lab.timelineFav))S.lab.timelineFav=[];
    if(!Array.isArray(S.lab.topicFav))S.lab.topicFav=[];
    return S.lab;
  }
  function wordCount(text){return (String(text||"").trim().match(/[\p{L}\p{N}]+(?:['’-][\p{L}\p{N}]+)*/gu)||[]).length;}
  function paragraphSummary(log){
    const list=(Array.isArray(log)?log:[]).filter(x=>Number(x?.wpm)>0),count=list.length,avgWpm=count?Math.round(list.reduce((sum,x)=>sum+Number(x.wpm||0),0)/count):0,bestWpm=count?Math.max(...list.map(x=>Number(x.wpm||0))):0,avgScore=count?Number((list.reduce((sum,x)=>sum+Number(x.score||0),0)/count).toFixed(1)):0;
    return {count,avgWpm,bestWpm,avgScore};
  }
  function setTab(next){
    ensureToolboxStructure();
    tab=["periodic","timeline","science"].includes(next)?next:"periodic";
    [["Periodic","periodic"],["Timeline","timeline"],["Science","science"]].forEach(([name,key])=>{
      document.getElementById("v320Tab"+name)?.classList.toggle("on",tab===key);
      const panel=document.getElementById("v320Panel"+name);if(panel)panel.hidden=tab!==key;
    });
    render();
  }
  function renderSummary(){
    const root=document.getElementById("v320LabSummary");if(!root)return;
    const lab=state();
    root.innerHTML='<span><b>'+lab.topicFav.length+'</b> konu favorisi</span><span><b>'+lab.elementFav.length+'</b> element favorisi</span><span><b>'+lab.timelineFav.length+'</b> tarih favorisi</span><span><b>2</b> bilim alanı</span>';
  }

  function elementGroup(type){if(["Alkali metal","Toprak alkali metal","Geçiş metali","Metal"].includes(type))return "Metaller";if(["Ametal","Halojen","Soy gaz"].includes(type))return "Ametaller";if(["Lantanit","Aktinit"].includes(type))return "İç geçiş";return type;}
  function filterElements(options={}){
    const q=String(options.query||"").toLocaleLowerCase("tr"),periodFilter=String(options.period||"Tümü"),group=String(options.group||"Tümü"),fav=options.favorites instanceof Set?options.favorites:new Set(options.favorites||[]);
    return ELEMENTS.filter(x=>(!options.onlyFavorites||fav.has(x.n))&&(periodFilter==="Tümü"||String(x.period)===periodFilter)&&(group==="Tümü"||elementGroup(x.type)===group)&&(!q||String(x.n)===q||x.symbol.toLocaleLowerCase("tr").includes(q)||x.name.toLocaleLowerCase("tr").includes(q)||x.type.toLocaleLowerCase("tr").includes(q)));
  }
  function elementStudyHint(x){
    const tips={"Soy gaz":"Değerlik katmanı dolu olduğundan tepkime eğilimleri düşüktür; kararlılık yorumlarında elektron dizilimini kontrol et.","Halojen":"Elektron alma eğilimleri yüksektir; grup içinde atom yarıçapı ve etkinlik değişimini birlikte düşün.","Alkali metal":"Bir değerlik elektronu taşırlar ve genellikle +1 iyon oluştururlar; suyla tepkime eğilimi grupta aşağı indikçe artar.","Toprak alkali metal":"İki değerlik elektronu taşırlar ve genellikle +2 iyon oluştururlar; alkali metallerle aynı grup sanma.","Geçiş metali":"Değişken yükseltgenme basamakları ve renkli bileşikler görülebilir; elektron diziliminde 4s–3d sırasına dikkat et.","Yarı metal":"Metal ve ametal arasında özellik gösterebilir; yarı iletkenlik sorularında bu sınıfı hatırla.","Ametal":"Elektron alma veya ortaklaşma eğilimleri belirgindir; bağ türü yorumunda karşı elementin sınıfını da kontrol et.","Lantanit":"6. periyodun iç geçiş elementleridir; tabloda ayrı gösterilseler de periyodik sistemin parçasıdır.","Aktinit":"7. periyodun iç geçiş elementleridir ve çoğu radyoaktiftir.","Metal":"Elektron verme, iletkenlik ve metalik bağ özelliklerini periyodik konumla birlikte yorumla."};
    return tips[x.type]||tips.Metal;
  }
  function renderElements(){
    const grid=document.getElementById("v320ElementGrid"),detail=document.getElementById("v320ElementDetail");if(!grid||!detail)return;
    const fav=new Set(state().elementFav),periodFilter=document.getElementById("v327ElementPeriod")?.value||"Tümü",group=document.getElementById("v327ElementGroup")?.value||"Tümü",only=!!document.getElementById("v320ElementFavOnly")?.checked,list=filterElements({query:elementQuery,period:periodFilter,group,onlyFavorites:only,favorites:fav}),meta=document.getElementById("v327ElementResultMeta");
    if(meta)meta.textContent=list.length+" element gösteriliyor"+(only?" · favoriler":"");
    grid.innerHTML=list.length?list.map(x=>'<button class="v320-element type-'+html(elementGroup(x.type).toLocaleLowerCase("tr").replace(/[^a-zçğıöşü]+/g,"-"))+' '+(fav.has(x.n)?'fav ':'')+(selectedElement===x.n?'active':'')+'" type="button" onclick="v320SelectElement('+x.n+')" aria-label="'+html(x.name+', atom numarası '+x.n)+'"><small>'+x.n+'</small><b>'+x.symbol+'</b><span>'+html(x.name)+'</span></button>').join(""):'<div class="empty">Bu filtrelere uyan element yok.</div>';
    const x=ELEMENTS[selectedElement-1]||ELEMENTS[0];
    detail.innerHTML='<div class="v327-element-head"><div class="v320-element-symbol">'+x.symbol+'</div><span>'+html(elementGroup(x.type))+'</span></div><h3>'+html(x.name)+'</h3><div class="dayrow"><span class="k">Atom numarası</span><span class="v">'+x.n+'</span></div><div class="dayrow"><span class="k">Periyot</span><span class="v">'+x.period+'</span></div><div class="dayrow"><span class="k">Sınıf</span><span class="v">'+html(x.type)+'</span></div><div class="v327-study-note"><b>YKS notu</b><p>'+html(elementStudyHint(x))+'</p></div><div class="rowtools"><button class="btn ghost small" type="button" aria-pressed="'+fav.has(x.n)+'" onclick="v320ToggleElement('+x.n+')">'+(fav.has(x.n)?'★ Favoriden çıkar':'☆ Favoriye ekle')+'</button></div>';
  }

  function filterTimeline(options={}){
    const q=String(options.query||"").toLocaleLowerCase("tr"),era=String(options.era||"Tümü"),fav=options.favorites instanceof Set?options.favorites:new Set(options.favorites||[]),list=TIMELINE.filter(x=>(!options.onlyFavorites||fav.has(x.id))&&(era==="Tümü"||x.era===era)&&(!q||(x.year+" "+x.title+" "+x.detail+" "+x.era).toLocaleLowerCase("tr").includes(q)));
    return options.sort==="new"?list.reverse():list;
  }
  function renderTimeline(){
    const root=document.getElementById("v320Timeline");if(!root)return;
    const fav=new Set(state().timelineFav),only=!!document.getElementById("v320TimelineFavOnly")?.checked,era=document.getElementById("v320TimelineEra")?.value||"Tümü",sort=document.getElementById("v327TimelineSort")?.value||"old",list=filterTimeline({query:timelineQuery,era,sort,onlyFavorites:only,favorites:fav}),meta=document.getElementById("v327TimelineResultMeta");
    if(meta)meta.textContent=list.length+" olay gösteriliyor"+(timelinePractice?" · hızlı tekrar açık":"");
    root.classList.toggle("practice",timelinePractice);
    root.innerHTML=list.length?list.map(x=>{const concealed=timelinePractice&&!timelineRevealed.has(x.id);return '<article class="v320-event '+(concealed?'concealed':'')+'"><div class="v320-event-head"><div><span class="v320-event-year">'+(concealed?html(x.era+' · tarihi hatırla'):html(x.year+' · '+x.era))+'</span><b>'+html(x.title)+'</b></div><button type="button" aria-label="Favori" aria-pressed="'+fav.has(x.id)+'" onclick="v320ToggleTimeline(\''+x.id+'\')">'+(fav.has(x.id)?'★':'☆')+'</button></div>'+(concealed?'<button class="v327-reveal" type="button" onclick="v327RevealTimeline(\''+x.id+'\')">Tarihi ve sonucu göster</button>':'<p>'+html(x.detail)+'</p>'+(timelinePractice?'<button class="v327-hide" type="button" onclick="v327HideTimeline(\''+x.id+'\')">Tekrar gizle</button>':''))+'</article>';}).join(""):'<div class="empty">Bu filtrede olay bulunamadı.</div>';
  }

  function renderScienceSkeleton(){
    const root=document.getElementById("v4ScienceCards");if(!root)return;
    document.getElementById("v4ScienceBiology")?.classList.toggle("on",scienceSubject==="biology");
    document.getElementById("v4SciencePhysics")?.classList.toggle("on",scienceSubject==="physics");
    const biology=scienceSubject==="biology";
    root.innerHTML='<div class="v4-science-ready"><span>'+(biology?'Biyoloji':'Fizik')+'</span><h3>'+(biology?'Sistemler ve temel süreçler':'Formüller, şemalar ve kritik yorumlar')+'</h3><p>'+(biology?'Sindirim, dolaşım, solunum, boşaltım, sinir, endokrin, destek-hareket ve üreme kartları için alan hazır.':'Kuvvet-hareket, enerji, elektrik, manyetizma, basınç, dalgalar, optik, atışlar ve tork kartları için alan hazır.')+'</p><div class="v4-science-ready-grid"><span>YKS notu</span><span>Sık hata</span><span>Özet bilgi</span><span>Görsel şema</span></div></div>';
  }

  function render(){
    ensureToolboxStructure();
    renderCourses();
    renderSummary();
    [["Periodic","periodic"],["Timeline","timeline"],["Science","science"]].forEach(([name,key])=>{
      document.getElementById("v320Tab"+name)?.classList.toggle("on",tab===key);
      const panel=document.getElementById("v320Panel"+name);if(panel)panel.hidden=tab!==key;
    });
    if(tab==="periodic")renderElements();
    if(tab==="timeline")renderTimeline();
    if(tab==="science")renderScienceSkeleton();
    return true;
  }

  window.v320SetExam=exam=>{courseExam=["TYT","AYT","YDT"].includes(exam)?exam:"TYT";courseSubject=-1;courseTopic=-1;courseQuery="";globalCourseQuery="";const search=document.getElementById("v320TopicSearch"),globalSearch=document.getElementById("v4LabSearch"),globalOnly=document.getElementById("v4LabFavOnly"),subjectOnly=document.getElementById("v4LabSubjectFavOnly");if(search)search.value="";if(globalSearch){globalSearch.value="";globalSearch.placeholder="Bütün "+courseExam+" konularında ara";}if(globalOnly)globalOnly.checked=false;if(subjectOnly)subjectOnly.checked=false;renderCourses();};
  window.v320OpenSubject=index=>{const subjects=curriculumSnapshot()[courseExam]||[];courseSubject=Math.max(0,Math.min(subjects.length-1,Number(index)||0));courseTopic=-1;courseQuery="";const search=document.getElementById("v320TopicSearch");if(search)search.value="";renderCourses();};
  window.v320BackSubjects=()=>{courseSubject=-1;courseTopic=-1;courseQuery="";renderCourses();};
  window.v320SearchTopics=value=>{courseQuery=String(value||"").trim();courseTopic=-1;renderCourses();};
  window.v320SelectTopic=index=>{const subject=(curriculumSnapshot()[courseExam]||[])[courseSubject];if(!subject)return false;courseTopic=Math.max(0,Math.min(subject.topics.length-1,Number(index)||0));renderCourses();return true;};
  window.v4SearchLabTopics=value=>{globalCourseQuery=String(value||"").trim();renderCourses();};
  window.v4RenderLabTopics=renderCourses;
  window.v4OpenLabTopic=(subjectIndex,topicIndex)=>{const subjects=curriculumSnapshot()[courseExam]||[],subject=subjects[Number(subjectIndex)];if(!subject||!subject.topics[Number(topicIndex)])return false;courseSubject=Number(subjectIndex);courseTopic=Number(topicIndex);courseQuery="";renderCourses();document.getElementById("v320TopicSelection")?.scrollIntoView?.({behavior:"smooth",block:"start"});return true;};
  window.v4ToggleTopicFavorite=(subjectIndex,topicIndex,event)=>{event?.stopPropagation?.();const subject=(curriculumSnapshot()[courseExam]||[])[Number(subjectIndex)],topic=subject?.topics?.[Number(topicIndex)];if(!subject||!topic)return false;const key=topicKey(courseExam,subject.name,topic),favorites=state().topicFav,index=favorites.indexOf(key);if(index>=0)favorites.splice(index,1);else favorites.push(key);saveSafe();render();toastSafe(index>=0?"Konu favoriden çıkarıldı":"Konu favorilere eklendi ★");return true;};

  window.v320SetTab=setTab;
  window.v4SetScienceSubject=subject=>{scienceSubject=subject==="physics"?"physics":"biology";renderScienceSkeleton();};
  window.v320FilterElements=value=>{elementQuery=String(value||"").trim();renderElements();};
  window.v320RenderElements=renderElements;
  window.v320SelectElement=n=>{selectedElement=Math.max(1,Math.min(118,Number(n)||1));renderElements();};
  window.v320ToggleElement=n=>{const a=state().elementFav,i=a.indexOf(n);if(i>=0)a.splice(i,1);else a.push(n);saveSafe();render();};
  window.v327ResetElementFilters=()=>{elementQuery="";const search=document.getElementById("v320ElementSearch"),periodFilter=document.getElementById("v327ElementPeriod"),group=document.getElementById("v327ElementGroup"),only=document.getElementById("v320ElementFavOnly");if(search)search.value="";if(periodFilter)periodFilter.value="Tümü";if(group)group.value="Tümü";if(only)only.checked=false;renderElements();};
  window.v320FilterTimeline=value=>{timelineQuery=String(value||"").trim();timelineRevealed.clear();renderTimeline();};
  window.v320RenderTimeline=renderTimeline;
  window.v320ToggleTimeline=id=>{const a=state().timelineFav,i=a.indexOf(id);if(i>=0)a.splice(i,1);else a.push(id);saveSafe();render();};
  window.v327ToggleTimelinePractice=checked=>{timelinePractice=!!checked;timelineRevealed.clear();renderTimeline();};
  window.v327RevealTimeline=id=>{timelineRevealed.add(String(id));renderTimeline();};
  window.v327HideTimeline=id=>{timelineRevealed.delete(String(id));renderTimeline();};
  window.v327ResetTimelineFilters=()=>{timelineQuery="";timelinePractice=false;timelineRevealed.clear();const search=document.getElementById("v320TimelineSearch"),era=document.getElementById("v320TimelineEra"),sort=document.getElementById("v327TimelineSort"),practice=document.getElementById("v327TimelinePractice"),only=document.getElementById("v320TimelineFavOnly");if(search)search.value="";if(era)era.value="Tümü";if(sort)sort.value="old";if(practice)practice.checked=false;if(only)only.checked=false;renderTimeline();};
  window.v320RenderLearningLab=render;

  const previous=window.renderSubjects;
  if(typeof previous==="function")window.renderSubjects=function(){const result=previous.apply(this,arguments);window.YKSSafeRender?.("learning-lab",render,"v320LearningLab");return result;};
  const start=()=>window.YKSSafeRender?window.YKSSafeRender("learning-lab",render,"v320LearningLab"):render();
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",()=>setTimeout(start,320),{once:true});else setTimeout(start,320);

  window.YKSLearningLab={
    elements:ELEMENTS,
    timeline:TIMELINE,
    wordCount,
    paragraphSummary,
    removedParagraphApi:REMOVED_PARAGRAPH_API_MARKER,
    filterElements,
    filterTimeline,
    curriculum:curriculumSnapshot,
    topicKey,
    topicCatalog,
    searchTopics,
    topicGuide:(exam,subject,topic)=>window.YKSTopicGuides?.guideFor?.(exam,subject,topic),
    activeTools:["periodic","timeline","science"]
  };
})();
