(function(){
  "use strict";
  const READY_FLAG="__YKS_MOTIVATION_QUOTES_READY__";
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
    "Bir yanlışın nedenini bulmak, on yeni soru çözmek kadar değerli olabilir.",
    "Sınava kalan günleri saymak yerine, o günlerin içini doldur.",
    "Konu çalışmak öğrenmektir; soru çözmek öğrendiğini sınamaktır.",
    "Tekrar etmediğin bilgi unutulur; tekrar ettiğin bilgi sınavda hız kazandırır.",
    "Bugün zorlandığın soru tipi, yarın en güçlü olduğun soru tipi olabilir.",
    "Her deneme, gerçek sınavdan önce yapılmış ücretsiz bir provadır.",
    "Netini yükselten şey yalnızca daha çok soru değil, daha doğru analizdir.",
    "Sınav gününde güven, bugün tuttuğun çalışma sözlerinden gelir.",
    "Bir konuyu yarım bilmek yerine, bir konuyu tam öğren.",
    "Yanlış sayın seni geriye çekmez; aynı yanlışı öğrenmeden bırakmak çeker.",
    "Bugün çözemediğin soru, yarın çözeceğin sorunun öğretmenidir.",
    "Süre tutarak çalışmak, sınav anındaki paniği azaltır.",
    "Bir denemeyi bitirmek yetmez; denemeyi incelemek net kazandırır.",
    "Her gün küçük bir konu kapatmak, ay sonunda büyük fark oluşturur.",
    "Sınavda bildiğini gösterebilmek için bugün süre altında pratik yap.",
    "Eksik konu görmek kötü haber değil, ne çalışacağını bilmek demektir.",
    "Net hedefi koy; sonra onu soru, tekrar ve deneme ile parçalarına ayır.",
    "Bugünün 30 kaliteli sorusu, rastgele çözülen 100 sorudan daha değerlidir.",
    "Paragrafta hız, her gün düzenli paragraf çözerek oluşur.",
    "Problemlerde gelişim, çözümü okumaktan çok çözümü kurmaya çalışınca gelir.",
    "Fen neti, ayrıntıyı ezberlemekten önce temel mantığı kurmakla yükselir.",
    "Matematikte yapamadığın sorular, çalışma listenin en değerli kısmıdır.",
    "Bir konu bittiğinde hemen soru çöz; bilgi sıcakken bağlantıları güçlendir.",
    "Tekrar günü ertelemek, unutmayı hızlandırır; kısa tekrar bile fark yaratır.",
    "Sınavda zor soru herkes için zordur; farkı sakin kalan öğrenci yaratır.",
    "Bir soruda takılı kalmak yerine zamanı yönetmek de sınav becerisidir.",
    "Denemede süre yetmiyorsa çözüm daha hızlı okumak değil, daha çok süreli pratik olabilir.",
    "Her hafta net grafiğine bak; hislerine değil verine göre çalış.",
    "Sınav hazırlığında istikrar, bir günlük aşırı çalışmadan daha güçlüdür.",
    "Bugün programın yüzde yüz gitmeyebilir; önemli olan tamamen bırakmamaktır.",
    "Bir ders kötü gidiyorsa onu yok sayma; küçük parçalarla geri dön.",
    "Çalışma masasındaki odak, sınav salonundaki sakinliğin provasıdır.",
    "Soru kökünü doğru okumak bazen bilgiden daha fazla net kurtarır.",
    "İşaretlediğin her yanlış konu, sonraki tekrarının adresidir.",
    "Sınavda başarı, bildiklerini doğru sürede doğru soruya uygulayabilmektir.",
    "Deneme netin düştüyse önce sebebi bul; sonra çalışma planını düzelt.",
    "Aynı yanlış ikinci kez oluyorsa konu değil, hata alışkanlığı çalışılmalıdır.",
    "Bir konuyu anlatabiliyorsan büyük ölçüde öğrenmişsindir; anlatamıyorsan tekrar et.",
    "Her çalışma oturumuna tek net hedefle başla: konu, soru veya tekrar.",
    "Sınav hazırlığında boş geçen bir gün felaket değildir; iki boş günü alışkanlık yapma.",
    "Yüksek net, yüzlerce küçük doğru kararın toplamıdır.",
    "Bir denemeden sonra en önemli soru şudur: Bu yanlış neden oldu?",
    "Yanlış defterin, sınavdan önce bakacağın kişisel soru bankandır.",
    "Süre baskısını yenmenin yolu süre baskısı altında kontrollü pratik yapmaktır.",
    "Bugün bir konuyu gerçekten öğrenmek, yarın yeniden baştan çalışmaktan zaman kazandırır.",
    "Sınavda kolay soruyu kaçırmamak, zor soruyu çözmek kadar değerlidir.",
    "Netini artırmak istiyorsan önce en sık yaptığın hata türünü azalt.",
    "Konu eksiği kapanmadan deneme sayısını artırmak her zaman çözüm değildir.",
    "Deneme analizi yapmadığın her sınav, yarım bırakılmış çalışmadır.",
    "Sınava hazırlanırken hızdan önce doğruluk, doğruluktan sonra hız gelir.",
    "Bir sorunun çözümünü görmek başka, aynı yöntemi kendin kurabilmek başkadır.",
    "Çalışırken telefonu değil süreyi kontrol et; odak nete dönüşür.",
    "Bugün tekrar ettiğin formül, sınavda düşünme süresini kısaltır.",
    "Bir konuya geri dönmek gerilemek değil, temeli güçlendirmektir.",
    "Sınav günü yeni bir şey öğrenmeye değil, öğrendiklerini kullanmaya gideceksin.",
    "Her denemede tek bir beceriyi özellikle geliştir: süre, dikkat veya strateji.",
    "Dikkat hatalarının da konu yanlışları kadar kaydını tut.",
    "Bir net artışının arkasında çoğu zaman birkaç tekrar ve onlarca analiz edilmiş soru vardır.",
    "Sınavda panik başladığında soruya değil nefesine ve sıradaki adıma dön.",
    "Zor deneme kötü deneme değildir; seni gerçek sınava daha dayanıklı hazırlar.",
    "Kolay denemede yüksek net, zor denemede doğru analiz kadar değerli değildir.",
    "Bugünkü küçük tekrar, haftalar sonra sıfırdan öğrenme yükünü azaltır.",
    "Konu listesi uzunsa korkma; bugün yalnızca bir sonraki kutuyu kapat.",
    "Sınav hazırlığında başarı ölçüsü yalnız saat değil, öğrenilmiş konu ve düzeltilmiş hatadır.",
    "Her çalışma gününün sonunda ne öğrendiğini bir cümleyle söyleyebilmelisin.",
    "Denemede boş bıraktığın sorular da yanlışlar kadar analiz edilmeyi hak eder.",
    "Net hedefin varsa ders bazında hangi netin nereden geleceğini de bil.",
    "Sınav stratejisi, hangi soruyu çözeceğini bilmek kadar hangi soruyu geçeceğini bilmektir.",
    "Bir soruyu üç farklı yoldan çözebiliyorsan o konu sende güçlenmiştir.",
    "Kısa ama tam odaklı çalışma, uzun ama bölünmüş çalışmadan daha verimlidir.",
    "Sınava kadar her hafta bir önceki haftadan tek bir şeyi daha iyi yap.",
    "Bugün deneme kötü geçtiyse yarınki çalışmanın konusu daha net belli demektir.",
    "Soru sayısını değil, gerçekten öğrendiğin soru sayısını önemse.",
    "Bir yanlışın çözümünü ezberleme; yanlış düşünce adımını bul.",
    "Sınav anında zaman kazanmak için işlem düzenini bugün oturt.",
    "Paragrafta yanlışın varsa yalnız cevaba değil, yanlış okuduğun ifadeye dön.",
    "Matematikte işlem hatası tekrar ediyorsa çözüm daha dikkatli ol demek değil, kontrol rutini kurmaktır.",
    "Fen sorularında bilgi kadar seçenek eleme becerisini de geliştir.",
    "Deneme çözmek performansı ölçer; konu çalışmak performansı yükseltir.",
    "Sınavda net kaybettiren küçük alışkanlıkları bugün fark etmek büyük kazançtır.",
    "Her gün aynı saatte kısa bir tekrar yapmak bilgiyi daha kalıcı hale getirir.",
    "Bir konudan kaç soru kaçırdığını bilirsen ne kadar tekrar gerektiğini daha iyi anlarsın.",
    "Sınava hazırlıkta motivasyon beklemek yerine masaya oturmak çoğu zaman motivasyonu getirir.",
    "Bugün yalnızca ilk 25 dakikayı başlat; devamı çoğu zaman gelir.",
    "Bir denemede tüm sorularla savaşma; puanı en verimli şekilde topla.",
    "Sınavda bildiğin soruyu dikkatsizlikten kaçırmamak da çalışmanın parçasıdır.",
    "Netlerin dalgalanıyorsa tek denemeye değil son beş denemenin ortalamasına bak.",
    "Kötü geçen bir çalışma oturumu, hiç başlamamaktan daha değerlidir.",
    "Bir konu bitti diye bırakma; birkaç gün sonra tekrar sorusuyla gerçekten bitir.",
    "Sınav sabahı güven istiyorsan bugünden deneme rutinine sadık kal.",
    "Her yanlışın yanına bir cümlelik neden yaz; aynı hatayı yakalamak kolaylaşır.",
    "Soru çözümünde hız, gereksiz adımları azaltınca gelir.",
    "Çalışma planı seni sıkıştırmak için değil, neye başlayacağını düşündürmemek için vardır.",
    "Sınava hazırlık uzun bir süreçtir; bugünkü görevin bugünün çalışmasını tamamlamaktır.",
    "Deneme sonrası moralini değil, verini masaya koy.",
    "Bir dersin neti düşükse o derse daha fazla suçlama değil, daha iyi yöntem gerekir.",
    "Sınavda zorlandığında ilk hedef bütün testi çözmek değil, sıradaki doğruyu bulmaktır.",
    "Konu tekrarını soru ile bitir; hatırladığını sanmakla hatırlamak aynı şey değildir.",
    "Bugün öğrendiğin bilgiye bir hafta sonra tekrar dokun; kalıcılık orada oluşur.",
    "Denemede yaptığın her dikkat hatası için küçük bir kontrol kuralı oluştur.",
    "Sınavda süre kazanmanın en güvenli yolu çok kez gerçek süreyle prova yapmaktır.",
    "Bir soru seni uzun süre tutuyorsa geçmek başarısızlık değil, sınav yönetimidir.",
    "Net artışı bazen yeni konu öğrenmekten değil, eski yanlışları kapatmaktan gelir.",
    "Bugün eksiklerini görmek moral bozmak için değil, yarının çalışmasını seçmek içindir.",
    "Sınavda sağlam temel, zor soruda bile nereden başlayacağını gösterir.",
    "Her denemede aynı sırayla çözmek zorunda değilsin; sana en iyi çalışan sırayı bul.",
    "Sınav hazırlığında en değerli kaynak, kendi yanlışlarının düzenli kaydıdır.",
    "Bir gün çok çalışmak değil, haftalar boyunca tekrar masaya oturmak net yükseltir.",
    "Soru çözerken çözümü erken açma; biraz daha düşünmek öğrenmeyi güçlendirir.",
    "Sınavda yüksek net için yalnız bilgi değil, dikkat ve süre yönetimi de çalışılır.",
    "Bugünkü deneme, gerçek sınavdaki bir hatayı şimdiden yakalama fırsatıdır.",
    "Çözemediğin sorular moral kaynağı değil, çalışma kaynağıdır.",
    "Her konuya eşit süre verme; net kaybettiren konuya daha fazla dön.",
    "Sınav yaklaştıkça yeni kaynak peşinde koşmak yerine yanlışlarına ve tekrarlarına dön.",
    "Konu bilgisini nete çevirmek için soru çözmeden olmaz.",
    "Bir denemede süre yetişmediyse hangi bölümde zaman kaybettiğini dakika dakika incele.",
    "Bugünün çalışması mükemmel olmak zorunda değil; tamamlanmış olmak zorunda.",
    "Sınavda sakin kalmak da çalışılan bir beceridir; denemelerde bunu prova et.",
    "Her net artışı önce görünmeyen küçük gelişmeler olarak başlar.",
    "Sınav hazırlığında rakibin başkaları değil, dünkü eksiklerin olsun.",
    "Bugün bir yanlışını kalıcı olarak düzeltirsen sınava bir adım daha hazır girersin.",
    "YKS günü sürpriz olmasın; süreyi, molasız oturmayı ve test sırasını denemelerde prova et.",
    "Bir konu yüzde yüz bitmeden ilerleyemem diye bekleme; öğren, soru çöz, tekrar dön.",
    "Sınavda en güçlü silahın, daha önce benzer hataları fark etmiş olmaktır.",
    "Düşük netten korkma; nedenini bilmediğin düşük netten kork.",
    "Her gün biraz paragraf, biraz problem ve hedef ders çalışmak birikerek hız oluşturur.",
    "Sınavda puan, bugün çözdüğün doğru soruların ve düzelttiğin yanlışların toplamından doğar.",
    "Bugün başla, bugün bitirebildiğini bitir, yarın kaldığın yerden devam et."
  ];

  let current=-1;
  const recent=[];
  function rand(max){
    if(max<=1)return 0;
    try{if(typeof sozRand==="function")return sozRand(max);}catch(e){}
    return Math.floor(Math.random()*max);
  }
  function pick(){
    let candidates=[];
    for(let i=0;i<EXAM_QUOTES.length;i++)if(i!==current&&!recent.includes(i))candidates.push(i);
    if(!candidates.length)for(let i=0;i<EXAM_QUOTES.length;i++)if(i!==current)candidates.push(i);
    current=candidates[rand(candidates.length)]??0;
    recent.push(current);
    if(recent.length>6)recent.shift();
    return current;
  }
  function text(){if(current<0||current>=EXAM_QUOTES.length)pick();return EXAM_QUOTES[current]||"";}

  function boot(){
    if(typeof el!=="function"||typeof esc!=="function"||typeof S==="undefined"){
      setTimeout(boot,50);return;
    }
    window[READY_FLAG]={version:"2.0.0",poolSize:EXAM_QUOTES.length,scope:"YKS-only",authors:false};
    gununSozu=function(){return text();};
    yeniSoz=function(){pick();renderSoz();return true;};
    renderSoz=function(){
      const w=el("sozBox");if(!w)return false;
      if(S.sozKapali){w.style.display="none";return true;}
      w.style.display="flex";
      w.innerHTML='<span class="szwrap"><span class="szlabel">Günün sözü <span class="szcat">YKS</span></span><span class="sz">“'+esc(text())+'”</span></span><button class="szr" type="button" onclick="yeniSoz()" title="Başka bir YKS sözü" aria-label="Başka bir YKS sözü">↻</button>';
      return true;
    };
    pick();
    try{renderSoz();}catch(e){try{infraError("exam-quotes-render",e);}catch(_){}}
  }

  boot();
})();
