(function(){
  "use strict";
  const SYMBOLS="H He Li Be B C N O F Ne Na Mg Al Si P S Cl Ar K Ca Sc Ti V Cr Mn Fe Co Ni Cu Zn Ga Ge As Se Br Kr Rb Sr Y Zr Nb Mo Tc Ru Rh Pd Ag Cd In Sn Sb Te I Xe Cs Ba La Ce Pr Nd Pm Sm Eu Gd Tb Dy Ho Er Tm Yb Lu Hf Ta W Re Os Ir Pt Au Hg Tl Pb Bi Po At Rn Fr Ra Ac Th Pa U Np Pu Am Cm Bk Cf Es Fm Md No Lr Rf Db Sg Bh Hs Mt Ds Rg Cn Nh Fl Mc Lv Ts Og".split(" ");
  const NAMES="Hidrojen|Helyum|Lityum|Berilyum|Bor|Karbon|Azot|Oksijen|Flor|Neon|Sodyum|Magnezyum|Alüminyum|Silisyum|Fosfor|Kükürt|Klor|Argon|Potasyum|Kalsiyum|Skandiyum|Titanyum|Vanadyum|Krom|Manganez|Demir|Kobalt|Nikel|Bakır|Çinko|Galyum|Germanyum|Arsenik|Selenyum|Brom|Kripton|Rubidyum|Stronsiyum|İtriyum|Zirkonyum|Niyobyum|Molibden|Teknesyum|Rutenyum|Rodyum|Paladyum|Gümüş|Kadmiyum|İndiyum|Kalay|Antimon|Tellür|İyot|Ksenon|Sezyum|Baryum|Lantan|Seryum|Praseodim|Neodimyum|Prometyum|Samaryum|Evropiyum|Gadolinyum|Terbiyum|Disprozyum|Holmiyum|Erbiyum|Tulyum|İterbiyum|Lütesyum|Hafniyum|Tantal|Tungsten|Renyum|Osmiyum|İridyum|Platin|Altın|Cıva|Talyum|Kurşun|Bizmut|Polonyum|Astatin|Radon|Fransiyum|Radyum|Aktinyum|Toryum|Protaktinyum|Uranyum|Neptünyum|Plütonyum|Amerikyum|Küriyum|Berkelyum|Kaliforniyum|Einsteinyum|Fermiyum|Mendelevyum|Nobelyum|Lavrensiyum|Rutherfordiyum|Dubniyum|Seaborgiyum|Bohriyum|Hassiyum|Meitneryum|Darmstadtiyum|Röntgenyum|Kopernikyum|Nihonyum|Flerovyum|Moskovyum|Livermoryum|Tennessin|Oganesson".split("|");
  const SETS={
    noble:new Set([2,10,18,36,54,86,118]),halogen:new Set([9,17,35,53,85,117]),alkali:new Set([3,11,19,37,55,87]),
    alkaline:new Set([4,12,20,38,56,88]),metalloid:new Set([5,14,32,33,51,52,84]),nonmetal:new Set([1,6,7,8,15,16,34])
  };
  const period=n=>n<=2?1:n<=10?2:n<=18?3:n<=36?4:n<=54?5:n<=86?6:7;
  function typeOf(n){
    if(SETS.noble.has(n))return "Soy gaz";if(SETS.halogen.has(n))return "Halojen";if(SETS.alkali.has(n))return "Alkali metal";if(SETS.alkaline.has(n))return "Toprak alkali metal";
    if(n>=57&&n<=71)return "Lantanit";if(n>=89&&n<=103)return "Aktinit";if(SETS.metalloid.has(n))return "Yarı metal";if(SETS.nonmetal.has(n))return "Ametal";
    if((n>=21&&n<=30)||(n>=39&&n<=48)||(n>=72&&n<=80)||(n>=104&&n<=112))return "Geçiş metali";return "Metal";
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

  let tab="paragraph",elementQuery="",timelineQuery="",selectedElement=26,readStart=0,timerHandle=null;
  let courseExam="TYT",courseSubject=-1,courseTopic=-1,courseQuery="";
  const html=value=>typeof esc==="function"?esc(value):String(value||"").replace(/[&<>"']/g,s=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[s]));
  function curriculumSnapshot(){const source=typeof CURRICULUM!=="undefined"&&CURRICULUM&&typeof CURRICULUM==="object"?CURRICULUM:{};return ["TYT","AYT","YDT"].reduce((out,exam)=>{out[exam]=(Array.isArray(source[exam])?source[exam]:[]).map(subject=>({name:String(subject.name||"Ders"),topics:Array.isArray(subject.topics)?subject.topics.map(String):[]}));return out;},{});}
  function renderCourses(){
    const home=document.getElementById("v320CourseHome"),topicsView=document.getElementById("v320CourseTopics"),grid=document.getElementById("v320SubjectGrid");if(!home||!topicsView||!grid)return false;
    const curriculum=curriculumSnapshot(),subjects=curriculum[courseExam]||[];
    ["TYT","AYT","YDT"].forEach(exam=>document.getElementById("v320Exam"+exam)?.classList.toggle("on",courseExam===exam));
    const title=document.getElementById("v320CourseTitle"),meta=document.getElementById("v320CourseMeta"),topicCount=subjects.reduce((sum,x)=>sum+x.topics.length,0);
    if(title)title.textContent=courseExam+" dersleri";if(meta)meta.textContent=subjects.length+" ders · "+topicCount+" konu";
    const subject=subjects[courseSubject],inside=!!subject;home.hidden=inside;topicsView.hidden=!inside;
    grid.innerHTML=subjects.map((x,index)=>'<button class="v320-subject-card" type="button" onclick="v320OpenSubject('+index+')"><span>'+html(courseExam)+'</span><b>'+html(x.name)+'</b><small>'+x.topics.length+' konu</small><i>›</i></button>').join("");
    if(!inside)return true;
    const subjectTitle=document.getElementById("v320SubjectTitle"),subjectMeta=document.getElementById("v320SubjectMeta"),topicGrid=document.getElementById("v320TopicGrid"),selection=document.getElementById("v320TopicSelection");
    if(subjectTitle)subjectTitle.textContent=subject.name;if(subjectMeta)subjectMeta.textContent=courseExam+" · "+subject.topics.length+" konu";
    const q=courseQuery.toLocaleLowerCase("tr"),filtered=subject.topics.map((name,index)=>({name,index})).filter(x=>!q||x.name.toLocaleLowerCase("tr").includes(q));
    if(topicGrid)topicGrid.innerHTML=filtered.length?filtered.map(x=>'<button class="v320-topic-card '+(courseTopic===x.index?'on':'')+'" type="button" onclick="v320SelectTopic('+x.index+')"><span>'+(x.index+1)+'</span><b>'+html(x.name)+'</b></button>').join(""):'<div class="empty">Aramana uyan konu bulunamadı.</div>';
    const selected=subject.topics[courseTopic];if(selection){selection.hidden=!selected;selection.innerHTML=selected?'<small>'+html(courseExam+' · '+subject.name)+'</small><b>'+html(selected)+'</b><p>Bu konu için laboratuvar bölümü hazır. Konu içeriğini sonraki adımda buraya ekleyebiliriz.</p>':"";}
    return true;
  }
  function state(){if(!S.lab||typeof S.lab!=="object")S.lab={};if(!Array.isArray(S.lab.paragraphLog))S.lab.paragraphLog=[];if(!Array.isArray(S.lab.elementFav))S.lab.elementFav=[];if(!Array.isArray(S.lab.timelineFav))S.lab.timelineFav=[];return S.lab;}
  function wordCount(text){return (String(text||"").trim().match(/[\p{L}\p{N}]+(?:['’-][\p{L}\p{N}]+)*/gu)||[]).length;}
  function setTab(next){tab=["paragraph","periodic","timeline"].includes(next)?next:"paragraph";["Paragraph","Periodic","Timeline"].forEach(name=>{document.getElementById("v320Tab"+name)?.classList.toggle("on",tab===name.toLowerCase());document.getElementById("v320Panel"+name).hidden=tab!==name.toLowerCase();});render();}
  function renderSummary(){const root=document.getElementById("v320LabSummary");if(!root)return;const log=state().paragraphLog,avg=log.length?Math.round(log.reduce((a,x)=>a+x.wpm,0)/log.length):0;root.innerHTML='<span><b>'+log.length+'</b> paragraf</span><span><b>'+avg+'</b> ort. kelime/dk</span><span><b>'+state().timelineFav.length+'</b> tarih favorisi</span>';}
  function paragraphStats(){const text=document.getElementById("v320ParagraphText")?.value||"",words=wordCount(text),elapsed=readStart?Math.max(0,Math.floor((Date.now()-readStart)/1000)):0,wpm=elapsed?Math.round(words/(elapsed/60)):0;return {words,elapsed,wpm};}
  function renderParagraphStats(){const root=document.getElementById("v320ParagraphStats");if(!root)return;const s=paragraphStats(),min=Math.floor(s.elapsed/60),sec=s.elapsed%60;root.innerHTML=[[s.words,"kelime"],[min+":"+String(sec).padStart(2,"0"),"süre"],[s.wpm||"—","kelime/dk"],[s.words?Math.max(1,Math.round(s.words/200)):"—","tahmini dk"]].map(x=>'<div><b>'+x[0]+'</b><small>'+x[1]+'</small></div>').join("");}
  function renderParagraphHistory(){const root=document.getElementById("v320ParagraphHistory");if(!root)return;const list=state().paragraphLog.slice().sort((a,b)=>b.at-a.at).slice(0,12);if(!list.length){root.innerHTML='<div class="empty">İlk paragraf çalışmanı tamamladığında hız ve anlama geçmişin burada oluşacak.</div>';return;}const avg=Math.round(list.reduce((a,x)=>a+x.wpm,0)/list.length),score=(list.reduce((a,x)=>a+x.score,0)/list.length).toFixed(1);root.innerHTML='<div class="v313-analysis-grid"><div><small>Son çalışmalar</small><b>'+list.length+'</b></div><div><small>Ortalama hız</small><b>'+avg+'</b></div><div><small>Anlama</small><b>'+score+'/5</b></div></div>'+list.map(x=>'<div class="v320-history-row"><div><b>'+html(x.title)+'</b><small>'+new Date(x.at).toLocaleDateString("tr-TR")+' · '+x.words+' kelime · '+x.seconds+' sn</small></div><span>'+x.wpm+' k/dk · '+x.score+'/5</span></div>').join("");}
  function renderElements(){const grid=document.getElementById("v320ElementGrid"),detail=document.getElementById("v320ElementDetail");if(!grid||!detail)return;const fav=new Set(state().elementFav),only=document.getElementById("v320ElementFavOnly")?.checked,q=elementQuery.toLocaleLowerCase("tr");const list=ELEMENTS.filter(x=>(!only||fav.has(x.n))&&(!q||String(x.n)===q||x.symbol.toLocaleLowerCase("tr").includes(q)||x.name.toLocaleLowerCase("tr").includes(q)||x.type.toLocaleLowerCase("tr").includes(q)));grid.innerHTML=list.length?list.map(x=>'<button class="v320-element '+(fav.has(x.n)?'fav ':'')+(selectedElement===x.n?'active':'')+'" type="button" onclick="v320SelectElement('+x.n+')"><small>'+x.n+'</small><b>'+x.symbol+'</b><span>'+html(x.name)+'</span></button>').join(""):'<div class="empty">Eşleşen element yok.</div>';const x=ELEMENTS[selectedElement-1]||ELEMENTS[0];detail.innerHTML='<div class="v320-element-symbol">'+x.symbol+'</div><h3>'+html(x.name)+'</h3><div class="dayrow"><span class="k">Atom numarası</span><span class="v">'+x.n+'</span></div><div class="dayrow"><span class="k">Periyot</span><span class="v">'+x.period+'</span></div><div class="dayrow"><span class="k">Sınıf</span><span class="v">'+html(x.type)+'</span></div><p class="hint">Periyot, katman sayısıyla; ana grup elementlerinde grup, değerlik elektronlarıyla ilişkilidir. İyon yükü ve tepkime eğilimi için elementin grubunu konu notlarınla birlikte değerlendir.</p><div class="rowtools"><button class="btn ghost small" type="button" onclick="v320ToggleElement('+x.n+')">'+(fav.has(x.n)?'★ Favoriden çıkar':'☆ Favoriye ekle')+'</button></div>';}
  function renderTimeline(){const root=document.getElementById("v320Timeline");if(!root)return;const fav=new Set(state().timelineFav),only=document.getElementById("v320TimelineFavOnly")?.checked,era=document.getElementById("v320TimelineEra")?.value||"Tümü",q=timelineQuery.toLocaleLowerCase("tr");const list=TIMELINE.filter(x=>(!only||fav.has(x.id))&&(era==="Tümü"||x.era===era)&&(!q||(x.year+" "+x.title+" "+x.detail+" "+x.era).toLocaleLowerCase("tr").includes(q)));root.innerHTML=list.length?list.map(x=>'<article class="v320-event"><div class="v320-event-head"><div><span class="v320-event-year">'+html(x.year)+' · '+html(x.era)+'</span><b>'+html(x.title)+'</b></div><button type="button" aria-label="Favori" onclick="v320ToggleTimeline(\''+x.id+'\')">'+(fav.has(x.id)?'★':'☆')+'</button></div><p>'+html(x.detail)+'</p></article>').join(""):'<div class="empty">Bu filtrede olay bulunamadı.</div>';}
  function render(){renderCourses();renderSummary();renderParagraphStats();renderParagraphHistory();if(tab==="periodic")renderElements();if(tab==="timeline")renderTimeline();return true;}

  window.v320SetExam=exam=>{courseExam=["TYT","AYT","YDT"].includes(exam)?exam:"TYT";courseSubject=-1;courseTopic=-1;courseQuery="";const search=document.getElementById("v320TopicSearch");if(search)search.value="";renderCourses();};
  window.v320OpenSubject=index=>{const subjects=curriculumSnapshot()[courseExam]||[];courseSubject=Math.max(0,Math.min(subjects.length-1,Number(index)||0));courseTopic=-1;courseQuery="";const search=document.getElementById("v320TopicSearch");if(search)search.value="";renderCourses();};
  window.v320BackSubjects=()=>{courseSubject=-1;courseTopic=-1;courseQuery="";renderCourses();};
  window.v320SearchTopics=value=>{courseQuery=String(value||"").trim();courseTopic=-1;renderCourses();};
  window.v320SelectTopic=index=>{const subject=(curriculumSnapshot()[courseExam]||[])[courseSubject];if(!subject)return false;courseTopic=Math.max(0,Math.min(subject.topics.length-1,Number(index)||0));renderCourses();return true;};
  window.v320SetTab=setTab;window.v320ParagraphPreview=renderParagraphStats;
  window.v320StartParagraph=()=>{const s=paragraphStats();if(s.words<40){toast("En az 40 kelimelik bir metin ekle");return false;}readStart=Date.now();clearInterval(timerHandle);timerHandle=setInterval(renderParagraphStats,1000);const start=document.getElementById("v320ParagraphStart"),finish=document.getElementById("v320ParagraphFinish");if(start)start.disabled=true;if(finish)finish.disabled=false;renderParagraphStats();return true;};
  window.v320FinishParagraph=()=>{if(!readStart){toast("Önce okumayı başlat");return false;}const s=paragraphStats(),score=Math.max(1,Math.min(5,Number(document.getElementById("v320ParagraphScore")?.value)||3)),title=(document.getElementById("v320ParagraphTitle")?.value||"Paragraf çalışması").trim()||"Paragraf çalışması";state().paragraphLog.push({id:Date.now(),at:Date.now(),words:s.words,seconds:Math.max(1,s.elapsed),wpm:Math.max(1,s.wpm),score,title:title.slice(0,100)});save();readStart=0;clearInterval(timerHandle);timerHandle=null;const start=document.getElementById("v320ParagraphStart"),finish=document.getElementById("v320ParagraphFinish");if(start)start.disabled=false;if(finish)finish.disabled=true;render();toast("Paragraf çalışması kaydedildi ✓");return true;};
  window.v320ResetParagraph=()=>{readStart=0;clearInterval(timerHandle);timerHandle=null;const text=document.getElementById("v320ParagraphText"),title=document.getElementById("v320ParagraphTitle"),start=document.getElementById("v320ParagraphStart"),finish=document.getElementById("v320ParagraphFinish");if(text)text.value="";if(title)title.value="";if(start)start.disabled=false;if(finish)finish.disabled=true;renderParagraphStats();};
  window.v320FilterElements=value=>{elementQuery=String(value||"").trim();renderElements();};window.v320RenderElements=renderElements;window.v320SelectElement=n=>{selectedElement=Math.max(1,Math.min(118,Number(n)||1));renderElements();};window.v320ToggleElement=n=>{const a=state().elementFav,i=a.indexOf(n);if(i>=0)a.splice(i,1);else a.push(n);save();render();};
  window.v320FilterTimeline=value=>{timelineQuery=String(value||"").trim();renderTimeline();};window.v320RenderTimeline=renderTimeline;window.v320ToggleTimeline=id=>{const a=state().timelineFav,i=a.indexOf(id);if(i>=0)a.splice(i,1);else a.push(id);save();render();};window.v320RenderLearningLab=render;
  const previous=window.renderSubjects;if(typeof previous==="function")window.renderSubjects=function(){const result=previous.apply(this,arguments);window.YKSSafeRender?.("learning-lab",render,"v320LearningLab");return result;};
  const start=()=>window.YKSSafeRender?window.YKSSafeRender("learning-lab",render,"v320LearningLab"):render();if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",()=>setTimeout(start,320),{once:true});else setTimeout(start,320);
  window.YKSLearningLab={elements:ELEMENTS,timeline:TIMELINE,wordCount,curriculum:curriculumSnapshot};
})();
