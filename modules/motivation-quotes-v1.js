(function(){
  "use strict";
  const READY_FLAG="__YKS_MOTIVATION_QUOTES_READY__";
  const STYLE_HREF="./modules/motivation-quotes-v2.css?v=4.1.0-r1";

  const EXAM_QUOTES=[
    "Bugün çözdüğün her soru, sınav günündeki hızına yatırımdır.",
    "Bir denemedeki düşük net, eksik konuyu gösteren bir rapordur; sonuç değil.",
    "Yanlış yaptığın soruyu öğrenmeden geçme; net artışı çoğu zaman orada başlar.",
    "Sınavda hız, bugün yaptığın düzenli soru çözümünün sonucudur.",
    "Bir konu zor geliyorsa kaçma; netini artıracak yer büyük ihtimalle orasıdır.",
    "Her tekrar, sınav gününde hatırlama süreni biraz daha kısaltır.",
    "Denemede yaptığın hata bugün düzeltilirse sınavda puana dönüşür.",
    "Net artışı tek günde değil, her gün yapılan doğru çalışmayla gelir.",
    "Bugünkü hedefin bütün YKS'yi bitirmek değil; sıradaki konuyu sağlamlaştırmaktır.",
    "Soru çözerken yaptığın her analiz, bir sonraki soruda sana süre kazandırır.",
    "Deneme sonucu moral notu değil, çalışma yönünü gösteren veridir.",
    "Sınava kalan günleri saymak yerine, o günlerin içini doldur.",
    "Konu çalışmak öğrenmektir; soru çözmek öğrendiğini sınamaktır.",
    "Tekrar etmediğin bilgi unutulur; tekrar ettiğin bilgi sınavda hız kazandırır.",
    "Her deneme, gerçek sınavdan önce yapılmış ücretsiz bir provadır.",
    "Netini yükselten şey yalnızca daha çok soru değil, daha doğru analizdir.",
    "Bir konuyu yarım bilmek yerine, bir konuyu tam öğren.",
    "Yanlış sayın seni geriye çekmez; aynı yanlışı öğrenmeden bırakmak çeker.",
    "Süre tutarak çalışmak, sınav anındaki paniği azaltır.",
    "Bir denemeyi bitirmek yetmez; denemeyi incelemek net kazandırır.",
    "Her gün küçük bir konu kapatmak, ay sonunda büyük fark oluşturur.",
    "Eksik konu görmek kötü haber değil, ne çalışacağını bilmek demektir.",
    "Net hedefini soru, tekrar ve denemelere böl; büyük hedef böyle yönetilir.",
    "Bugünün 30 kaliteli sorusu, rastgele çözülen 100 sorudan daha değerlidir.",
    "Paragrafta hız, her gün düzenli paragraf çözerek oluşur.",
    "Problemlerde gelişim, çözümü okumaktan çok çözümü kurmaya çalışınca gelir.",
    "Matematikte yapamadığın sorular, çalışma listenin en değerli kısmıdır.",
    "Bir konu bittiğinde hemen soru çöz; bilgi sıcakken bağlantıları güçlendir.",
    "Sınavda zor soru herkes için zordur; farkı sakin kalan öğrenci yaratır.",
    "Bir soruda takılı kalmak yerine zamanı yönetmek de sınav becerisidir.",
    "Her hafta net grafiğine bak; hislerine değil verine göre çalış.",
    "Sınav hazırlığında istikrar, bir günlük aşırı çalışmadan daha güçlüdür.",
    "Bugün programın yüzde yüz gitmeyebilir; önemli olan tamamen bırakmamaktır.",
    "Çalışma masasındaki odak, sınav salonundaki sakinliğin provasıdır.",
    "Soru kökünü doğru okumak bazen bilgiden daha fazla net kurtarır.",
    "İşaretlediğin her yanlış konu, sonraki tekrarının adresidir.",
    "Sınavda başarı, bildiklerini doğru sürede doğru soruya uygulayabilmektir.",
    "Deneme netin düştüyse önce sebebi bul; sonra çalışma yöntemini düzelt.",
    "Aynı yanlış ikinci kez oluyorsa hata alışkanlığını da çalış.",
    "Her çalışma oturumuna tek net hedefle başla: konu, soru veya tekrar.",
    "Yüksek net, yüzlerce küçük doğru kararın toplamıdır.",
    "Bir denemeden sonra en önemli soru şudur: Bu yanlış neden oldu?",
    "Yanlış defterin, sınavdan önce bakacağın kişisel soru bankandır.",
    "Süre baskısını yenmenin yolu süre baskısı altında kontrollü pratik yapmaktır.",
    "Sınavda kolay soruyu kaçırmamak, zor soruyu çözmek kadar değerlidir.",
    "Netini artırmak istiyorsan önce en sık yaptığın hata türünü azalt.",
    "Deneme analizi yapmadığın her sınav, yarım bırakılmış çalışmadır.",
    "Sınava hazırlanırken hızdan önce doğruluk, doğruluktan sonra hız gelir.",
    "Çalışırken telefonu değil süreyi kontrol et; odak nete dönüşür.",
    "Bugün tekrar ettiğin formül, sınavda düşünme süresini kısaltır.",
    "Bir konuya geri dönmek gerilemek değil, temeli güçlendirmektir.",
    "Sınav günü yeni bir şey öğrenmeye değil, öğrendiklerini kullanmaya gideceksin.",
    "Dikkat hatalarının da konu yanlışları kadar kaydını tut.",
    "Zor deneme kötü deneme değildir; seni gerçek sınava daha dayanıklı hazırlar.",
    "Kısa ama tam odaklı çalışma, uzun ama bölünmüş çalışmadan daha verimlidir.",
    "Soru sayısını değil, gerçekten öğrendiğin soru sayısını önemse.",
    "Bir yanlışın çözümünü ezberleme; yanlış düşünce adımını bul.",
    "Fen sorularında bilgi kadar seçenek eleme becerisini de geliştir.",
    "Deneme çözmek performansı ölçer; konu çalışmak performansı yükseltir.",
    "Sınava hazırlıkta motivasyon beklemek yerine masaya otur; motivasyon çoğu zaman sonra gelir.",
    "Bugün yalnızca ilk 25 dakikayı başlat; devamı çoğu zaman gelir.",
    "Sınav sabahı güven istiyorsan bugünden deneme rutinine sadık kal.",
    "Her yanlışın yanına bir cümlelik neden yaz; aynı hatayı yakalamak kolaylaşır.",
    "Sınava hazırlık uzun bir süreçtir; bugünkü görevin bugünün çalışmasını tamamlamaktır.",
    "Deneme sonrası moralini değil, verini masaya koy.",
    "Konu tekrarını soru ile bitir; hatırladığını sanmakla hatırlamak aynı şey değildir.",
    "Bir soru seni uzun süre tutuyorsa geçmek başarısızlık değil, sınav yönetimidir.",
    "Net artışı bazen yeni konu öğrenmekten değil, eski yanlışları kapatmaktan gelir.",
    "Sınav hazırlığında en değerli kaynak, kendi yanlışlarının düzenli kaydıdır.",
    "Bir gün çok çalışmak değil, haftalar boyunca tekrar masaya oturmak net yükseltir.",
    "Sınavda yüksek net için yalnız bilgi değil, dikkat ve süre yönetimi de çalışılır.",
    "Çözemediğin sorular moral kaynağı değil, çalışma kaynağıdır.",
    "Her konuya eşit süre verme; net kaybettiren konuya daha fazla dön.",
    "Bugünün çalışması mükemmel olmak zorunda değil; tamamlanmış olmak zorunda.",
    "Sınavda sakin kalmak da çalışılan bir beceridir; denemelerde bunu prova et.",
    "Düşük netten korkma; nedenini bilmediğin düşük netten kork.",
    "YKS günü sürpriz olmasın; süreyi ve test sırasını denemelerde prova et.",
    "Bugün bir yanlışını kalıcı olarak düzeltirsen sınava bir adım daha hazır girersin."
  ];

  const COACH_QUOTES=[
    {q:"Hayal etmeden hiçbir şey olmaz.",a:"Fatih Terim"},
    {q:"Sabredeceğiz ve çok çalışacağız. Yapacak başka bir şey yok.",a:"Fatih Terim"},
    {q:"Bu çocuklara, gençlere güveniyorum.",a:"Şenol Güneş"},
    {q:"Bir kez pes edersen, ikinci kez de pes edersin.",a:"Sir Alex Ferguson"},
    {q:"Çok çalışmak da bir yetenektir.",a:"Sir Alex Ferguson"},
    {q:"Şüphe edenlerden inananlara dönüşmeliyiz.",a:"Jürgen Klopp"},
    {q:"Birlikte büyük şeyler başarabileceğimize inanmanızı istiyorum.",a:"Jürgen Klopp"},
    {q:"Olumlu olun ve oyunu yaşamaya bakın.",a:"Jürgen Klopp"},
    {q:"Yapabileceğine inanmıyorsan zaten hiç şansın yoktur.",a:"Arsène Wenger"},
    {q:"Başarı, her gün aynı ciddiyetle çalışmayı gerektirir.",a:"Arsène Wenger"}
  ];

  let current={type:"exam",index:-1};
  const recentExam=[],recentCoach=[];

  function ensureStyles(){
    if(typeof document==="undefined"||!document.head||typeof document.createElement!=="function")return false;
    if(typeof document.querySelector==="function"&&document.querySelector('link[data-yks-motivation-quotes-style]'))return true;
    const link=document.createElement("link");
    link.rel="stylesheet";link.href=STYLE_HREF;link.setAttribute("data-yks-motivation-quotes-style","1");
    document.head.appendChild(link);return true;
  }
  function rand(max){
    if(max<=1)return 0;
    try{if(typeof sozRand==="function")return sozRand(max);}catch(e){}
    return Math.floor(Math.random()*max);
  }
  function pickIndex(list,recent){
    const candidates=[];
    for(let i=0;i<list.length;i++)if(!recent.includes(i))candidates.push(i);
    const i=(candidates.length?candidates:list)[rand(candidates.length||list.length)]??0;
    recent.push(i);if(recent.length>5)recent.shift();return i;
  }
  function pick(){
    const coach=rand(100)<35;
    current=coach
      ?{type:"coach",index:pickIndex(COACH_QUOTES,recentCoach)}
      :{type:"exam",index:pickIndex(EXAM_QUOTES,recentExam)};
    return current;
  }
  function item(){
    if(current.index<0)pick();
    if(current.type==="coach")return {q:COACH_QUOTES[current.index]?.q||"",a:COACH_QUOTES[current.index]?.a||"",type:"coach"};
    return {q:EXAM_QUOTES[current.index]||"",a:"",type:"exam"};
  }

  function boot(){
    if(typeof el!=="function"||typeof esc!=="function"||typeof S==="undefined"){
      setTimeout(boot,50);return;
    }
    ensureStyles();
    window[READY_FLAG]={version:"2.2.0",examPool:EXAM_QUOTES.length,coachPool:COACH_QUOTES.length,scope:"YKS+coaches",style:"v2"};
    gununSozu=function(){return item().q;};
    yeniSoz=function(){pick();renderSoz();return true;};
    renderSoz=function(){
      const w=el("sozBox");if(!w)return false;
      if(S.sozKapali){w.style.display="none";return true;}
      const x=item(),cat=x.type==="coach"?"Teknik Direktör":"YKS";
      w.style.display="flex";
      if(w.dataset)w.dataset.quoteType=x.type;
      if(typeof w.setAttribute==="function"){
        w.setAttribute("role","group");
        w.setAttribute("aria-label",x.type==="coach"?"Teknik direktör motivasyon sözü":"YKS çalışma motivasyon sözü");
      }
      w.innerHTML='<span class="szwrap" aria-live="polite" aria-atomic="true"><span class="szlabel">Günün sözü <span class="szcat">'+cat+'</span></span><span class="sz">“'+esc(x.q)+'”</span>'+(x.a?'<span class="sza">— '+esc(x.a)+'</span>':'')+'</span><button class="szr" type="button" onclick="yeniSoz()" title="Başka bir motivasyon sözü" aria-label="Başka bir motivasyon sözü">↻</button>';
      return true;
    };
    pick();
    try{renderSoz();}catch(e){try{infraError("exam-coach-quotes-render",e);}catch(_){}}
  }

  ensureStyles();
  boot();
})();
