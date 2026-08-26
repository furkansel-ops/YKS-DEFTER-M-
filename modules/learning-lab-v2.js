/* YKS Defterim — Öğrenme Laboratuvarı v2 | Türkçe + periyodik + kronoloji + ders atlası */
(function(){
  "use strict";
  if(window.__YKS_LEARNING_LAB_V2__)return;
  window.__YKS_LEARNING_LAB_V2__=true;
  const $=id=>document.getElementById(id);
  const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])||c);
  const tr=v=>String(v||"").toLocaleLowerCase("tr-TR");

  const WORDS=[
    ["yadsımak","İnkâr etmek, kabul etmemek","Gerçeği yadsımak sorunu ortadan kaldırmaz."],
    ["kanıksamak","Sık tekrarlandığı için alışıp olağan karşılamak","Gürültüyü zamanla kanıksamıştı."],
    ["sitem","Bir kimseye kırgınlığı incitmeden bildirme","Beni hiç aramadın, diye sitem etti."],
    ["yakınma","Bir durumdan şikâyet etme","Yazar, şehir hayatının hızından yakınıyor."],
    ["hayıflanmak","Kaçırılan fırsat veya geçmiş durum için üzülmek","Daha önce başlamadığına hayıflandı."],
    ["pişmanlık","Yapılan bir davranıştan dolayı üzüntü duyma","Keşke böyle söylemeseydim, sözü pişmanlık bildirir."],
    ["öz eleştiri","Kişinin kendi davranışını eleştirmesi","Planımı iyi yapamadım, sözü öz eleştiridir."],
    ["öngörü","Gelecekte olabilecek durumu önceden kestirme","Uzmanların öngörüsü gerçekleşti."],
    ["varsayım","Gerçekliği kesin olmayan bir durumu geçici olarak doğru kabul etme","Diyelim ki sınav ertelendi..."],
    ["çıkarım","Verilen bilgilerden yeni bir sonuca ulaşma","Metinden yazarın değişime açık olduğu çıkarılabilir."],
    ["saptama","Bir durumun varlığını belirleyip ortaya koyma","Kent nüfusunun arttığı saptanmıştır."],
    ["değerlendirme","Bir varlık veya durum hakkında ölçütlü yargıya varma","Romanın dili oldukça yalındır."],
    ["eleştiri","Bir şeyin olumlu ya da olumsuz yönlerini değerlendirme","Şairin son kitabı önceki kadar güçlü değil."],
    ["aşamalı durum","Bir niteliğin zaman içinde artması ya da azalması","Hava gittikçe soğuyor."],
    ["olasılık","Bir olayın gerçekleşebilme ihtimali","Akşama yağmur yağabilir."],
    ["kesinlik","Şüphe bırakmayan yargı","Bu eser onun en güçlü romanıdır."],
    ["koşul","Bir durumun gerçekleşmesini başka bir duruma bağlama","Çalışırsan başarırsın."],
    ["amaç","Bir eylemin hangi hedefle yapıldığını bildirme","Kitap almak için mağazaya gitti."],
    ["gerekçe","Bir yargının nedenini açıklama","Yollar kapalı olduğu için gelemedi."],
    ["öneri","Bir sorunu çözmek için yol gösterme","Her gün kısa tekrarlar yapmalısın."],
    ["uyarı","Olumsuz sonuçtan korunmak için dikkat çekme","Soruyu okumadan işaretleme."],
    ["ön yargı","Yeterli bilgi edinmeden peşinen hüküm verme","Bu kitabı zaten beğenmem."],
    ["tasarı","Gelecekte yapılması düşünülen plan","Yazın bir gezi düzenlemeyi düşünüyor."],
    ["beklenti","Gerçekleşmesi umulan durum","Bu yıl satışların artacağını umuyor."],
    ["benzetme","Bir varlığı ortak özellik bakımından başka varlığa benzetme","Deniz ayna gibi sakindi."],
    ["kişileştirme","İnsan dışı varlıklara insana özgü özellik verme","Rüzgâr pencerede ağlıyordu."],
    ["somutlama","Soyut kavramı somut bir anlatımla görünür kılma","Umudun kapısını aralamak."],
    ["soyutlama","Somut ayrıntılardan genel ve soyut bir kavrama ulaşma","Tek tek olaylardan adalet düşüncesine varma."],
    ["öznel","Kişiden kişiye değişebilen yargı","Bu şiir çok etkileyici."],
    ["nesnel","Kanıtlanabilir, kişisel beğeniden bağımsız yargı","Kitap 240 sayfadır."],
    ["dolaylı anlatım","Birinin sözünü anlamını koruyarak aktarma","Öğretmen sınavın kolay olacağını söyledi."],
    ["doğrudan anlatım","Birinin sözünü değiştirmeden aktarma","Öğretmen, “Sınav kolay olacak.” dedi."],
    ["örtülü anlam","Cümlede doğrudan söylenmeyen fakat çıkarılabilen ek anlam","Ali de geldi. → Başkaları da geldi."],
    ["tutarlılık","Düşüncelerin kendi içinde çelişmemesi","Paragraftaki yargılar aynı düşünce çizgisini sürdürür."],
    ["özgünlük","Başkasına benzemeyen, kendine özgü olma","Sanatçının özgün bir anlatımı vardır."],
    ["yalınlık","Süsten ve gereksiz ayrıntıdan uzak olma","Kısa ve açık cümleler yalın anlatım sağlar."],
    ["duruluk","Gereksiz sözcük bulunmaması","Aynı anlamı veren sözcükleri yığmamak duruluğu artırır."],
    ["akıcılık","Okurken takılmayı azaltan rahat söyleyiş","Akıcı metin kolay ilerler fakat bu, basit olduğu anlamına gelmez."],
    ["yoğunluk","Az sözle çok anlam taşıma","Şiirde anlam yoğunluğu sık görülür."],
    ["evrensellik","Farklı dönem ve toplumlara seslenebilme","İnsanlığın ortak sorunlarını işleyen eser evrensel olabilir."],
    ["yerellik","Belirli bir yöre veya çevreye özgü özellik taşıma","Yerel söyleyişler metnin yöresel havasını güçlendirir."],
    ["açıklık","Anlatımın kolay ve tek anlamlı anlaşılması","Belirsiz gönderimler açıklığı bozar."],
    ["doğallık","Yapmacıktan uzak, içten anlatım","Zorlanmış söz oyunları doğallığı azaltabilir."],
    ["içtenlik","Duygu ve düşüncelerin samimi biçimde verilmesi","Okurla konuşuyormuş gibi sıcak bir anlatım içtenlik oluşturur."],
    ["özdeşleşmek","Kendini başka kişi ya da durumla bir tutmak","Okur kahramanla özdeşleşebilir."],
    ["irdelemek","Bir konuyu ayrıntılı biçimde incelemek","Yazar modern yaşamı farklı yönleriyle irdeliyor."],
    ["pekiştirmek","Bir düşünce veya bilgiyi daha güçlü hâle getirmek","Örnekler ana düşünceyi pekiştirir."],
    ["vurgulamak","Bir düşünceyi özellikle öne çıkarmak","Yazar eğitimin önemini vurguluyor."],
    ["sezdirme","Bir düşünceyi açıkça söylemeden hissettirme","Öyküde yaklaşan ayrılık sezdiriliyor."],
    ["çağrışım","Bir sözün başka düşünce ve görüntüleri zihinde uyandırması","Şiirsel dil çağrışım gücü taşır."],
    ["bağdaştırma","Sözcükleri anlam ilişkisi kurarak bir araya getirme","Alışılmamış bağdaştırmalar şiirde dikkat çeker."],
    ["öykünmek","Birini örnek alıp ona benzemeye çalışmak","Genç şair ustasına öykünmüş."],
    ["öykülemek","Olayları kişi, yer ve zaman içinde anlatmak","Hareket bildiren fiiller öyküleyici anlatımı güçlendirir."],
    ["betimlemek","Varlıkların özelliklerini okuyucunun zihninde canlandırmak","Renk ve biçim ayrıntıları betimlemeyi güçlendirir."],
    ["tanık göstermek","Görüşü desteklemek için güvenilir kişinin sözünden yararlanmak","Uzman görüşüne yer vermek tanık göstermedir."],
    ["örneklemek","Soyut düşünceyi somut örneklerle açıklamak","Mesela, örneğin gibi geçişler ipucu olabilir."],
    ["karşılaştırmak","İki varlık veya durumu ortak ölçütle kıyaslamak","Daha, en, göre sözcükleri sık ipucu verir."],
    ["tanımlamak","Bir kavramın ne olduğunu ayırt edici özellikleriyle açıklamak","“Nedir?” sorusuna cevap verir."],
    ["açıklamak","Bir düşünceyi anlaşılır kılmak için bilgi ve gerekçe sunmak","Amaç bilgi vermek ve öğretmektir."],
    ["savunmak","Bir görüşün doğruluğunu gerekçelerle ileri sürmek","Karşı görüşe cevap verilmesi tartışmacı tonu güçlendirir."]
  ];

  const PARAGRAPH_TIPS=[
    ["Ana düşünce","Paragrafın tamamını kapsayan en genel yargıyı ara.","İlk/son cümleye körü körüne bağlanma; bütün seçenekleri metnin tamamına uygula."],
    ["Yardımcı düşünce","Seçeneğin metinde karşılığını tek tek bul.","Doğru görünen fakat metinde olmayan genel bilgiyi işaretleme."],
    ["Çıkarım","Metinde söylenenden bir adım ileri git ama yeni bilgi ekleme.","“Olabilir” ile “kesindir” arasındaki kesinlik farkını koru."],
    ["Değinilmemiştir / çıkarılamaz","Önce dört seçeneğin metindeki kanıtını bul; kanıtsız kalan cevaptır.","Olumsuz soru kökünü gözden kaçırma."],
    ["Başlık","Ana düşünceyi en az sözcükle kapsayan seçeneği seç.","Paragrafın yalnız bir ayrıntısını anlatan başlığı ele."],
    ["Paragrafın konusu","“Bu parçada neden söz ediliyor?” sorusuna kısa isim tamlamasıyla cevap ver.","Konu ile ana düşünceyi karıştırma; konu yargı değil alandır."],
    ["Cümle sıralama","Zamir, bağlaç, zaman ve önceki cümleye gönderme yapan sözcükleri zincirle.","“Bu, böyle, oysa, çünkü, ayrıca” gibi bağlayıcıları başlangıç cümlesi sanma."],
    ["Cümle yerleştirme","Eklenecek cümledeki anahtar sözcüğün önce nerede tanıtıldığını ve sonra nasıl sürdürüldüğünü kontrol et.","Sadece konu benzerliğine değil bağın iki yönüne de bak."],
    ["Akışı bozan cümle","Her cümleyi önceki ve sonrakiyle aynı alt başlıkta sınamaya çalış.","Ana konu aynı olsa bile bakış açısı değişen cümle akışı bozabilir."],
    ["Paragrafı ikiye bölme","Yeni özne, yeni alt konu, zaman/mekân değişimi veya “öte yandan” dönüşünü ara.","Cümle sayısını eşit bölmeye çalışma."],
    ["Paragraf tamamlama","Son cümlenin yönüne bak: sonuç mu, örnek mi, karşıtlık mı bekliyor?","Seçeneğin yalnız önceki cümleye değil bütün paragrafın tonuna uymasını kontrol et."],
    ["Anlatım biçimi","Olay akışı varsa öyküleme; görüntü/özellik baskınsa betimleme; bilgi veriyorsa açıklama; karşı görüşle mücadele ediyorsa tartışma.","Tek bir betimleyici sözcük gördün diye tüm paragrafı betimleme sayma."],
    ["Düşünceyi geliştirme","Tanım, örnek, karşılaştırma, sayısal veri ve tanık gösterme işaretlerini tek tek ara.","Bir paragrafta birden fazla yöntem bulunabileceğini unutma."],
    ["Soru çözme sırası","Önce soru kökünü oku, ne aradığını belirle; sonra paragrafı amaçlı oku.","Uzun paragraf = zor soru değildir; seçenekleri metin kanıtıyla ele."],
    ["Süre yönetimi","Takıldığın soruda iki seçeneğe düştüysen metindeki anahtar cümleyi yeniden oku; tüm paragrafı baştan tekrar tekrar okuma.","Bir sorunun bütün testin ritmini bozmasına izin verme."],
    ["Seçenek eleme","Kesinlik, kapsam ve duygu tonu farklarını karşılaştır.","“Her zaman, yalnızca, kesinlikle” gibi aşırı ifadeler metinde desteklenmiyorsa şüphelen."],
    ["Yazarın tutumu","Nesnel/eleştirel/övgücü/kaygılı ton için sıfat ve yüklemlere bak.","Konuyu sevip sevmemene göre değil metnin diline göre karar ver."],
    ["Paragrafta hız","Her sözcüğü iç sesle tek tek okumak yerine anlam bloklarını görmeye çalış.","Hız uğruna bağlaçları atlama; anlam yönünü çoğu zaman onlar değiştirir."]
  ];

  const ERA_CARDS=[
    ["İlk Türkler","MÖ 209 → 552 → 630 → 682 → 744","Mete Han → I. Göktürk → Çin egemenliği → II. Göktürk → Uygur","Devlet kurma, kut, ikili teşkilat ve göçebe kültür sorularında sıra mantığını koru."],
    ["Türk-İslam","751 → 840 → 1040 → 1071 → 1176","Talas → Karahanlı → Dandanakan → Malazgirt → Miryokefalon","Talas kültürel yakınlaşma; Dandanakan devlet; Malazgirt kapı; Miryokefalon yurt."],
    ["Osmanlı yükseliş","1299 → 1402 → 1453 → 1514 → 1517 → 1526 → 1538","Kuruluş → Ankara → İstanbul → Çaldıran → Mısır → Mohaç → Preveze","Siyasi, doğu, güney, Avrupa ve deniz üstünlüğünü ayrı eksenlerde düşün."],
    ["Osmanlı değişim","1606 → 1699 → 1718 → 1774 → 1826 → 1839 → 1856 → 1876","Zitvatorok → Karlofça → Lale → Küçük Kaynarca → Vaka-i Hayriye → Tanzimat → Islahat → Meşrutiyet","Antlaşmaların sonucunu “üstünlük / toprak / ayrıcalık / yönetim” başlıklarına ayır."],
    ["Milli Mücadele","19 Mayıs → Amasya → Erzurum → Sivas → 23 Nisan → İnönü → Sakarya → Büyük Taarruz → Mudanya → Lozan","Başlangıç → gerekçe/yöntem → bölgeselden ulusala → birlik → meclis → savaşlar → diplomasi","Kongrelerde kararların kapsamına; savaşlarda askeri sonuç ile siyasi sonuca ayrı bak."],
    ["Cumhuriyet","1923 → 1924 → 1925 → 1926 → 1928 → 1930 → 1934","Cumhuriyet → Halifelik → Tekke/Zaviye → Medeni Kanun → Harf → belediye hakkı → milletvekili hakkı","İnkılapları hukuk, eğitim-kültür, siyaset ve toplumsal alan olarak sınıflandır."],
    ["Dünya tarihi","1789 → 1914–18 → 1929 → 1939–45 → 1945 → 1989 → 1991","Fransız İhtilali → I. Dünya → Buhran → II. Dünya → BM → Berlin Duvarı → SSCB","Milliyetçilik, savaş, ekonomik kriz ve Soğuk Savaş sonuçlarını birbirine karıştırma."]
  ];

  const DEEP_DIVES={
    "Biyoloji":[
      ["❤️","Kalp","Sağ taraf oksijence fakir kanı akciğere; sol taraf oksijence zengin kanı vücuda yollar.","Atardamar/toplardamarı oksijen miktarıyla değil kanın kalbe göre yönüyle tanımla.","Kapakçık → tek yön; karıncık duvarı → basınç; sol karıncık → en kalın duvar."],
      ["🫘","Böbrek / Nefron","Süzülme glomerulusta, geri emilim ve salgılama tübüllerde; idrar toplama kanallarında son hâline yaklaşır.","Süzülme ile geri emilimi aynı olay sanma; büyük proteinler normalde süzüntüye geçmez.","ADH → su geri emilimi; aldosteron → Na⁺ geri emilimi; nefron bölümlerini işlemle eşleştir."],
      ["🫁","Akciğer","Gaz değişimi alveol-kılcal yüzeyinde difüzyonla olur; geniş yüzey ve ince zar verimi artırır.","Solunum organı ile hücresel solunumu karıştırma.","Basınç-hacim ilişkisi: diyafram kasılır → göğüs hacmi artar → basınç düşer → hava içeri."],
      ["🧪","Karaciğer","Safra üretir, glikojen depolar, detoksifikasyonda görev alır, amonyağın üreye çevrilmesinde rol oynar.","Safrayı üreten karaciğer, depolayan safra kesesidir; safra enzim değildir.","Karaciğeri sindirim, boşaltım ve metabolizma sorularında ortak merkez gibi düşün."],
      ["🩸","Dalak","Bağışıklık ve kan hücrelerinin işlenmesi/depolanmasıyla ilişkilidir; yaşlı alyuvarların uzaklaştırılmasına katkı sağlar.","Dalağı temel sindirim organı veya hormon bezi gibi düşünme.","Soruda bağışıklık + kan hücreleri birlikte geçiyorsa dalağı seçeneklerde kontrol et."],
      ["🧠","Sinir sistemi","Nöronda impuls yönü genellikle dendrit → hücre gövdesi → akson; sinapsta kimyasal aktarım tek yönlüdür.","İmpuls şiddeti artınca genlik artmaz; frekans değişebilir.","Merkezi/çevresel ve somatik/otonom ayrımını aynı şemada kur."],
      ["🧬","DNA–RNA–Protein","DNA bilgiyi saklar; transkripsiyon RNA'yı, translasyon proteini oluşturur.","Replikasyon, transkripsiyon ve translasyonun yerini ve ürününü karıştırma.","Kod–kodon–antikodon üçlüsünü tablo yap; mutasyonun her zaman fenotipe yansımayacağını unutma."],
      ["🌿","Fotosentez–Solunum","Fotosentez enerji depolar; hücresel solunum ATP üretiminde organik molekülleri kullanır.","Bitkiler yalnız fotosentez yapmaz; gece-gündüz solunum sürer.","Madde ve enerji oklarını ayrı çiz: O₂/CO₂ ile ATP'nin rolü aynı şey değildir."]
    ],
    "Fizik":[
      ["↔️","Hareket","Konum, alınan yol, yer değiştirme, sürat ve hız kavramlarını ayrı tut.","Grafikte eğim/alanın hangi büyüklüğü verdiğini eksenlerden belirle.","x–t eğim=hız; v–t eğim=ivme, alan=yer değiştirme."],
      ["🧲","Kuvvet–Newton","Net kuvvet ivmeyi belirler; etki-tepki kuvvetleri farklı cisimlere etkir.","Denge varsa kuvvet yok değil, net kuvvet sıfırdır.","Serbest cisim diyagramını çizmeden işleme başlama."],
      ["⚡","Elektrik","Akım yük akışı, gerilim enerji farkı, direnç akıma karşı koymadır.","Seri devrede akım; paralelde gerilim ortaklığını karıştırma.","Önce devreyi eşdeğer dirence indir, sonra güç/enerjiye geç."],
      ["🔦","Optik","Yansıma ve kırılmada normal doğrusunu çiz; mercek/ayna işaretlerini sistematik kullan.","Şeklin ölçeğine güvenip açı tahmini yapma.","Görüntü türünü ezber yerine ışın çizimiyle doğrula."],
      ["🌊","Dalgalar","Hız ortamla, frekans kaynakla ilişkilidir; v=fλ.","Ortam değişince frekansın değiştiğini sanma.","Dalga sorusunda önce değişmeyen büyüklüğü bul."],
      ["🔥","Isı–Sıcaklık","Sıcaklık taneciklerin ortalama kinetik enerjisiyle; ısı enerji aktarımıyla ilgilidir.","Isı ve sıcaklığı aynı birim/aynı kavram gibi kullanma.","Q=m·c·ΔT ve hâl değişiminde Q=m·L ayrımını yap."],
      ["🪁","Basınç–Kaldırma","Basınç kuvvet/alan; sıvı basıncı derinlik ve yoğunlukla; kaldırma yer değiştiren sıvıyla ilişkilidir.","Kabın şekli sıvı basıncını doğrudan belirlemez.","Önce kuvvetleri çiz; yüzme-batma için yoğunluk karşılaştır." ]
    ],
    "Kimya":[
      ["⚛️","Atom–Periyodik","Periyot katman sayısı, ana grup değerlik elektronları ve periyodik eğilimleri birlikte oku.","Atom/iyon yarıçapında elektron sayısı değişimini atlama.","Aynı periyotta sağa: yarıçap genel olarak azalır, iyonlaşma/elektronegatiflik artar."],
      ["🔗","Kimyasal bağ","Metal-ametal → iyonik; ametal-ametal → kovalent genel kuraldır; molekül geometrisi polarlığı etkiler.","Bağ polaritesi ile molekül polarlığını aynı sanma.","Önce Lewis, sonra geometri, sonra polarite."],
      ["🧮","Mol","Mol tanecik sayısı ile makroskobik kütle arasında köprüdür.","Mol, gram ve tanecik sayısını birimsiz birbirine eşitleme.","n=m/M; gazlarda verilen koşula göre hacim bağıntısını seç."],
      ["🧪","Asit–Baz","pH/pOH logaritmik ölçektir; güçlü-zayıf ile derişik-seyreltik farklı kavramlardır.","Güçlü asit her zaman daha derişik demek değildir.","Önce türü ve derişimi, sonra iyonlaşma derecesini düşün."],
      ["⚖️","Denge","Denge dinamiktir; ileri ve geri hızlar eşittir, derişimler zorunlu olarak eşit değildir.","Katalizör denge sabitini değiştirmez.","Le Châtelier'de sisteme yapılan etkiyi azaltacak yönü ara."],
      ["🔥","Tepkime hızı","Sıcaklık, derişim, yüzey alanı ve katalizör etkin çarpışma sayısını etkiler.","Hız artışı ile ürün miktarını/dengenin yönünü karıştırma.","Grafikte eğim hızı temsil eder; zamanla eğimin nasıl değiştiğine bak." ]
    ],
    "Matematik":[
      ["🧩","Problemler","Bilinmeyeni tanımla, birimleri eşitle, ilişkiyi denklemleştir.","Metindeki her sayıyı kullanmak zorunda değilsin.","Soruyu denklem kurmadan önce bir cümleyle “neyi arıyorum?” diye özetle."],
      ["ƒ","Fonksiyon","Tanım kümesi → görüntü → bileşke/ters sırasıyla ilerle.","Ters fonksiyon için birebirlik koşulunu unutma.","Grafik sorusunda x ve y rollerini sözlü olarak ifade et."],
      ["△","Trigonometri","Birim çember işaretlerini ve özel açıları temel al.","Özdeşlikleri amaçsızca açıp işlemi büyütme.","Hedef ifadeye göre sin²+cos²=1, tan=sin/cos gibi köprü seç."],
      ["📈","Türev","Türev yerel değişim hızı ve teğet eğimidir.","Türev sıfır olan her nokta maksimum/minimum olmayabilir.","İşaret tablosu kur; artan-azalanı grafikle ilişkilendir."],
      ["∫","İntegral","Belirsiz integral ters türev; belirli integral işaretli alan fikridir.","Geometrik alan ile belirli integral negatif bölgelerde aynı değildir.","Önce sınırları ve işareti çizimde kontrol et."],
      ["🎲","Olasılık","Örnek uzayı doğru kur, olayları say, koşullu bilgiyi ayrı değerlendir.","Bağımsız ve ayrık olayları karıştırma.","Gerekirse ağaç şemasıyla olasılık çarpım/toplam kuralını görünür yap." ]
    ],
    "Türkçe":[
      ["🧠","Sözcükte anlam","Sözcüğü cümleden koparmadan bağlamdaki anlamıyla değerlendir.","Yakın anlam = her cümlede birbirinin yerine geçer sanma.","Altı çizili sözcüğün yerine seçenekleri tek tek koy."],
      ["📚","Paragraf","Ana düşünceyi bütün paragrafta; ayrıntıyı yardımcı düşüncede ara.","Kendi yorumunu metne ekleme.","Soru kökü → metin → kanıt → seçenek sırasını koru."],
      ["✍️","Dil bilgisi","Kuralı sözcüğün/cümlenin görevine uygula.","Ekin biçimine bakıp işlevini kontrol etmemek.","Önce yüklem veya kökü bul, sonra ek/görev analizi yap." ]
    ],
    "Tarih":[
      ["⏳","Kronoloji","Olayları tarih ezberinden çok neden → olay → sonuç zinciriyle bağla.","Benzer isimli antlaşma ve savaşları dönemden koparma.","Her olayın yanına bir “önce” ve bir “sonra” olayı yaz."],
      ["🏛️","İnkılaplar","İnkılabın hangi ihtiyacı çözdüğünü ve hangi ilkeyle ilişkili olduğunu düşün.","Aynı inkılabı yalnız tek ilkeye zorla bağlama.","Siyasi, hukuk, eğitim-kültür, toplumsal, ekonomi diye sınıflandır."],
      ["🗺️","Milli Mücadele","Kongre → meclis → cephe → antlaşma sırasını koru.","Askerî sonuçla diplomatik sonucu karıştırma.","Doğu/Güney/Batı cephelerini karşı taraf ve antlaşmayla eşleştir." ]
    ],
    "Coğrafya":[
      ["🗺️","Harita yorumlama","Konum, yükselti, eğim, yön ve ölçek bilgisini birlikte oku.","Türkiye'ye özgü bilgiyle dünya geneli kuralını karıştırma.","Soruda önce “dağılış mı neden mi sonuç mu?” diye sınıflandır."],
      ["🌦️","İklim","Sıcaklık, basınç, rüzgâr ve nemi neden-sonuç zinciriyle bağla.","Hava durumu ile iklimi aynı zaman ölçeğinde düşünme.","Grafikte önce yarımküreyi, sonra sıcaklık/yağış rejimini belirle."],
      ["👥","Nüfus","Doğal ve beşerî faktörleri ayrı değerlendir.","Nüfus miktarıyla nüfus yoğunluğunu karıştırma.","Haritada yoğunluk gördüğünde yer şekli, iklim, sanayi ve ulaşımı sırayla kontrol et." ]
    ]
  };

  const GROUPS={1:[1,3,11,19,37,55,87],2:[4,12,20,38,56,88],3:[21,39,57,89],4:[22,40,72,104],5:[23,41,73,105],6:[24,42,74,106],7:[25,43,75,107],8:[26,44,76,108],9:[27,45,77,109],10:[28,46,78,110],11:[29,47,79,111],12:[30,48,80,112],13:[5,13,31,49,81,113],14:[6,14,32,50,82,114],15:[7,15,33,51,83,115],16:[8,16,34,52,84,116],17:[9,17,35,53,85,117],18:[2,10,18,36,54,86,118]};
  const GAS=new Set([1,2,7,8,9,10,17,18,36,54,86]);
  const LIQUID=new Set([35,80]);
  const SYNTH=new Set(Array.from({length:25},(_,i)=>i+94).concat([43,61,85,87,93]));
  const USES={1:"Yakıt hücreleri, amonyak üretimi ve enerji araştırmaları",2:"Balonlar, kriyojenik sistemler ve koruyucu atmosfer",3:"Lityum-iyon piller",5:"Isıya dayanıklı cam ve yarı iletken teknolojileri",6:"Organik yaşamın temel elementi; grafit, elmas ve yakıtlar",7:"Gübre üretimi ve inert atmosfer",8:"Solunum, tıp ve metalürji",9:"Florür bileşikleri ve kimya sanayisi",10:"Aydınlatma tüpleri",11:"Tuz bileşikleri ve kimya endüstrisi",12:"Hafif alaşımlar, biyolojik sistemler",13:"Hafif metal; ulaşım, ambalaj",14:"Yarı iletkenler ve cam",15:"Gübre, biyolojik moleküller",16:"Sülfürik asit, gübre ve kimya sanayisi",17:"Dezenfeksiyon ve PVC üretimi",18:"Koruyucu atmosfer ve aydınlatma",19:"Gübreler; biyolojik sinir-kas işlevleri",20:"Kireçtaşı, çimento, kemik ve diş yapısı",22:"Hafif ve dayanıklı alaşımlar",24:"Paslanmaz çelik",25:"Çelik alaşımları ve piller",26:"Çelik, yapı ve biyolojik hemoglobin",27:"Süperalaşımlar ve bazı pil kimyaları",28:"Paslanmaz çelik ve piller",29:"Elektrik iletimi ve tesisat",30:"Galvanizleme, alaşımlar",33:"Yarı iletken ve özel alaşım uygulamaları; toksiktir",34:"Cam, elektronik ve biyolojik iz element",35:"Alev geciktiriciler ve kimya endüstrisi",47:"Elektronik, takı ve fotoğrafçılık",50:"Lehim ve kaplamalar",53:"Tıp, dezenfeksiyon ve tiroit biyolojisi",54:"Aydınlatma ve özel lambalar",56:"Tıbbi görüntüleme bileşikleri ve sondaj sıvıları",74:"Yüksek sıcaklık alaşımları ve kesici uçlar",78:"Katalizör, laboratuvar ve takı",79:"Elektronik ve takı",80:"Ölçüm cihazları tarihsel kullanım; toksikliği nedeniyle kullanım kısıtlı",82:"Aküler ve radyasyon zırhlama",92:"Nükleer yakıt",94:"Nükleer araştırmalar ve radyoizotop kaynakları"};

  function groupOf(z){for(const [g,list] of Object.entries(GROUPS))if(list.includes(z))return g;return (z>=58&&z<=71)?"Lantanit":(z>=90&&z<=103)?"Aktinit":"—";}
  function blockOf(z){const group=groupOf(z);if(group==="Lantanit"||group==="Aktinit")return "f";const g=Number(group);return g<=2?"s":g>=13?"p":"d";}
  function stateOf(z){if(SYNTH.has(z)&&z>=94)return "Sentetik / radyoaktif";if(GAS.has(z))return "Gaz";if(LIQUID.has(z))return "Sıvı";return "Katı";}
  function elementUse(x){return USES[x.n]||((x.n>=93)?"Başlıca bilimsel araştırma ve nükleer fizik çalışmaları":"Alaşım, kimya, malzeme veya araştırma uygulamaları");}
  function wikiTitle(x){const aliases={13:"Alüminyum",16:"Kükürt",26:"Demir",29:"Bakır",47:"Gümüş",50:"Kalay",53:"İyot",74:"Tungsten",79:"Altın",80:"Cıva",82:"Kurşun",92:"Uranyum"};return aliases[x.n]||x.name;}
  const mediaCache=new Map();
  async function fetchElementMedia(x){
    if(mediaCache.has(x.n))return mediaCache.get(x.n);
    const url="https://tr.wikipedia.org/w/api.php?action=query&format=json&origin=*&redirects=1&prop=pageimages%7Cextracts&piprop=thumbnail&pithumbsize=760&exintro=1&explaintext=1&titles="+encodeURIComponent(wikiTitle(x));
    const promise=fetch(url,{mode:"cors",credentials:"omit"}).then(r=>{if(!r.ok)throw new Error("wiki "+r.status);return r.json();}).then(data=>{
      const page=Object.values(data?.query?.pages||{})[0]||{};return {img:page?.thumbnail?.source||"",extract:String(page?.extract||"").slice(0,420)};
    }).catch(()=>({img:"",extract:""}));
    mediaCache.set(x.n,promise);return promise;
  }

  let wordQuery="",tipQuery="",atlasExam="TYT",atlasSubject="",atlasQuery="";
  function wordRows(){const q=tr(wordQuery);return WORDS.filter(x=>!q||tr(x.join(" ")).includes(q));}
  function tipRows(){const q=tr(tipQuery);return PARAGRAPH_TIPS.filter(x=>!q||tr(x.join(" ")).includes(q));}
  function renderTurkish(){
    const w=$("v4TurkishWords"),p=$("v4ParagraphTips");if(!w||!p)return;
    const words=wordRows(),tips=tipRows();
    w.innerHTML='<div class="v4lab-toolbar"><input value="'+esc(wordQuery)+'" oninput="v4LabWordSearch(this.value)" placeholder="Sözcük / anlam ara"><span>'+words.length+' sözcük</span></div><div class="v4lab-word-list">'+words.map(x=>'<article><b>'+esc(x[0])+'</b><p>'+esc(x[1])+'</p><small>'+esc(x[2])+'</small></article>').join('')+'</div>';
    p.innerHTML='<div class="v4lab-toolbar"><input value="'+esc(tipQuery)+'" oninput="v4LabParagraphSearch(this.value)" placeholder="Soru tipi ara"><span>'+tips.length+' taktik</span></div><div class="v4lab-tip-list">'+tips.map(x=>'<article><b>'+esc(x[0])+'</b><p>'+esc(x[1])+'</p><small><strong>Tuzak:</strong> '+esc(x[2])+'</small></article>').join('')+'</div>';
  }
  function ensureTurkish(){
    const panel=$("v320PanelParagraph");if(!panel||$("v4TurkishUpgrade"))return;
    const box=document.createElement("section");box.id="v4TurkishUpgrade";box.className="v4lab-upgrade";
    box.innerHTML='<div class="v4lab-title"><div><small>Türkçe hızlı çalışma alanı</small><h3>Sınav dili + paragraf taktikleri</h3><p>“En çok çıkan” için resmî bir ÖSYM sıralaması yayımlanmadığından liste, YKS soru dilinde sık karşılaşılan yüksek getirili sözcük ve kavramlardan oluşturuldu.</p></div></div><div class="v4lab-dual"><section><h4>📖 Sık karşılaşılan sözcükler</h4><div id="v4TurkishWords"></div></section><section><h4>🧠 Paragraf soru tipi taktikleri</h4><div id="v4ParagraphTips"></div></section></div><div class="v4lab-divider"><span>Mevcut paragraf hız/anlama çalışman aşağıda devam ediyor</span></div>';
    panel.prepend(box);renderTurkish();
  }

  function selectedElement(){const z=Number(document.querySelector('#v320ElementGrid .v320-element.active small')?.textContent)||26;return window.YKSLearningLab?.elements?.[z-1]||null;}
  async function enhanceElement(){
    const detail=$("v320ElementDetail"),x=selectedElement();if(!detail||!x)return;
    let box=$("v4ElementReality");if(box&&box.dataset.z===String(x.n))return;
    box=document.createElement("div");box.id="v4ElementReality";box.className="v4-element-reality";box.dataset.z=String(x.n);
    box.innerHTML='<div class="v4-element-photo loading"><span>Gerçek yaşam görseli yükleniyor…</span></div><div class="v4-element-facts"><div><small>Grup</small><b>'+esc(groupOf(x.n))+'</b></div><div><small>Blok</small><b>'+blockOf(x.n)+'</b></div><div><small>25 °C</small><b>'+esc(stateOf(x.n))+'</b></div><div><small>Günlük kullanım</small><b>'+esc(elementUse(x))+'</b></div></div><div class="v4-element-trends"><b>Periyodik eğilim pusulası</b><span>Atom yarıçapı ↙ artar</span><span>İyonlaşma enerjisi ↗ artar</span><span>Elektronegatiflik ↗ artar</span><span>Metalik karakter ↙ artar</span></div>';
    detail.appendChild(box);
    const media=await fetchElementMedia(x);if(box.dataset.z!==String(x.n)||!box.isConnected)return;
    const photo=box.querySelector('.v4-element-photo');if(media.img){photo.classList.remove('loading');photo.innerHTML='<img src="'+esc(media.img)+'" alt="'+esc(x.name)+' gerçek yaşam / örnek görseli" loading="lazy" referrerpolicy="no-referrer"><small>Kaynak: Türkçe Vikipedi / Wikimedia</small>';}else{photo.classList.remove('loading');photo.innerHTML='<div class="v4-element-photo-fallback"><b>'+esc(x.symbol)+'</b><span>Bu element için uygun örnek görseli çevrimiçi kaynaktan alınamadı.</span></div>';}
    if(media.extract){const p=document.createElement('p');p.className='v4-element-extract';p.textContent=media.extract;box.appendChild(p);}
  }
  function ensurePeriodicGuide(){
    const panel=$("v320PanelPeriodic");if(!panel||$("v4PeriodicGuide"))return;
    const box=document.createElement('section');box.id='v4PeriodicGuide';box.className='v4-periodic-guide';
    box.innerHTML='<div><b>Periyodik tablo nasıl okunur?</b><span><strong>Periyot:</strong> katman sayısını düşündürür.</span><span><strong>Ana grup:</strong> değerlik elektronları ve benzer kimyasal özellikler için ipucudur.</span></div><div class="v4-periodic-arrows"><span>↙ Atom yarıçapı / metalik karakter</span><span>↗ İyonlaşma enerjisi / elektronegatiflik</span></div>';
    panel.prepend(box);
  }

  function renderChronology(){const root=$("v4ChronologyMap");if(!root)return;root.innerHTML=ERA_CARDS.map(x=>'<article><div><small>'+esc(x[0])+'</small><b>'+esc(x[1])+'</b></div><p>'+esc(x[2])+'</p><span>'+esc(x[3])+'</span></article>').join('');}
  function ensureTimelineUpgrade(){
    const panel=$("v320PanelTimeline");if(!panel||$("v4TimelineUpgrade"))return;
    const box=document.createElement('section');box.id='v4TimelineUpgrade';box.className='v4lab-upgrade';box.innerHTML='<div class="v4lab-title"><div><small>Tarih kronolojisi v2</small><h3>Dönüm noktalarını zincirle</h3><p>Tarihleri tek başına ezberlemek yerine olayları “önce → olay → sonuç” ilişkisiyle tut.</p></div></div><div id="v4ChronologyMap" class="v4-chrono-map"></div><div class="v4-history-rule"><b>Hızlı soru taktiği</b><span>Antlaşma sorusunda: <strong>kimle + hangi savaş sonrası + ne kaybedildi/kazanıldı?</strong></span><span>Kongre sorusunda: <strong>toplanış biçimi + kararların kapsamı</strong></span><span>İnkılap sorusunda: <strong>alan + amaç + ilgili ilke</strong></span></div>';
    panel.prepend(box);renderChronology();
  }

  function curriculum(){try{return window.YKSLearningLab?.curriculum?.()||{};}catch(e){return {};}}
  function normalizeSubject(name){return String(name||'').replace(/ \(AYT\)$/,'').replace(/-2$/,'').trim();}
  function subjectPool(){const c=curriculum(),out=[];["TYT","AYT"].forEach(exam=>(c[exam]||[]).forEach(s=>{if(!out.some(x=>x.exam===exam&&x.name===s.name))out.push({exam,name:s.name,topics:s.topics||[]});}));return out;}
  function currentSubject(){const pool=subjectPool(),same=pool.filter(x=>x.exam===atlasExam);if(!atlasSubject||!same.some(x=>x.name===atlasSubject))atlasSubject=same[0]?.name||'';return same.find(x=>x.name===atlasSubject)||same[0]||null;}
  function guideText(v){if(Array.isArray(v))return v.filter(Boolean).slice(0,2).join(' ');return String(v||'');}
  function renderAtlas(){
    const root=$("v4LessonAtlas");if(!root)return;const pool=subjectPool(),subjects=pool.filter(x=>x.exam===atlasExam),sub=currentSubject();
    const q=tr(atlasQuery),topics=(sub?.topics||[]).filter(t=>!q||tr(t).includes(q)||tr(normalizeSubject(sub?.name)).includes(q));const deep=DEEP_DIVES[normalizeSubject(sub?.name)]||[];
    root.innerHTML='<div class="v4-atlas-head"><div><small>Ders ders · konu konu</small><h3>YKS Ders Atlası</h3><p>Müfredattaki konuların taktikleri + seçili derslerde hızlı görsel/kavram kartları.</p></div><div class="seg"><button class="'+(atlasExam==='TYT'?'on':'')+'" onclick="v4AtlasExam(\'TYT\')">TYT</button><button class="'+(atlasExam==='AYT'?'on':'')+'" onclick="v4AtlasExam(\'AYT\')">AYT</button></div></div><div class="v4-atlas-subjects">'+subjects.map(s=>'<button class="'+(s.name===sub?.name?'on':'')+'" onclick="v4AtlasSubject(\''+String(s.name).replace(/\\/g,'\\\\').replace(/'/g,"\\'")+'\')">'+esc(s.name)+'</button>').join('')+'</div><div class="v4lab-toolbar"><input value="'+esc(atlasQuery)+'" oninput="v4AtlasSearch(this.value)" placeholder="Bu derste konu ara"><span>'+topics.length+' konu</span></div>'+(deep.length?'<div class="v4-deep-title"><b>'+esc(normalizeSubject(sub?.name))+' hızlı kartları</b><span>Sınavda karıştırılan yerleri öne çıkarır</span></div><div class="v4-deep-grid">'+deep.map(x=>'<article><i>'+x[0]+'</i><div><b>'+esc(x[1])+'</b><p>'+esc(x[2])+'</p><small><strong>Karıştırma:</strong> '+esc(x[3])+'</small><em><strong>Taktik:</strong> '+esc(x[4])+'</em></div></article>').join('')+'</div>':'')+'<div class="v4-topic-tactics">'+topics.map(topic=>{let g=null;try{g=window.YKSTopicGuides?.guideFor?.(atlasExam,sub.name,topic);}catch(e){}const important=guideText(g?.important),attention=guideText(g?.attention),mistake=guideText(g?.mistakes),study=guideText(g?.study);return '<article><div class="v4-topic-title"><small>'+esc(atlasExam+' · '+sub.name)+'</small><b>'+esc(topic)+'</b></div><p><strong>Bil:</strong> '+esc(important||topic+' için temel tanım ve ilişkileri netleştir.')+'</p><p><strong>Dikkat:</strong> '+esc(attention||'Benzer kavramları karşılaştır.')+'</p><p><strong>Sık hata:</strong> '+esc(mistake||'Soru kökündeki koşulu atlamak.')+'</p><p><strong>Çalış:</strong> '+esc(study||'Kısa özet + karma soru + yanlış tekrar döngüsü uygula.')+'</p></article>';}).join('')+'</div>';
  }
  function ensureAtlas(){const lab=$("v320LearningLab");if(!lab||$("v4LessonAtlas"))return;const box=document.createElement('section');box.id='v4LessonAtlas';box.className='v4-lesson-atlas';lab.appendChild(box);renderAtlas();}

  function injectStyle(){if($("v4LearningLabV2Style"))return;const s=document.createElement('style');s.id='v4LearningLabV2Style';s.textContent=`
    .v4lab-upgrade,.v4-lesson-atlas{margin:14px 0 18px}.v4lab-title,.v4-atlas-head{display:flex;justify-content:space-between;gap:16px;align-items:flex-start;margin-bottom:12px}.v4lab-title small,.v4-atlas-head small{font-size:10px;text-transform:uppercase;letter-spacing:.06em;color:var(--label-3);font-weight:800}.v4lab-title h3,.v4-atlas-head h3{margin:3px 0 4px;font-size:19px}.v4lab-title p,.v4-atlas-head p{margin:0;color:var(--label-2);font-size:12px;max-width:720px}.v4lab-dual{display:grid;grid-template-columns:1fr 1fr;gap:12px}.v4lab-dual>section{min-width:0;border:.5px solid var(--glass-line);border-radius:16px;background:var(--glass);padding:12px}.v4lab-dual h4{margin:0 0 9px;font-size:14px}.v4lab-toolbar{display:flex;gap:8px;align-items:center;margin-bottom:9px}.v4lab-toolbar input{flex:1;min-width:0}.v4lab-toolbar span{font-size:10px;color:var(--label-3);white-space:nowrap}.v4lab-word-list,.v4lab-tip-list{display:grid;gap:7px;max-height:430px;overflow:auto;padding-right:3px}.v4lab-word-list article,.v4lab-tip-list article{border:.5px solid var(--glass-line);border-radius:12px;padding:9px;background:var(--fill)}.v4lab-word-list b,.v4lab-tip-list b{font-size:13px}.v4lab-word-list p,.v4lab-tip-list p{margin:3px 0;font-size:11px;color:var(--label-1);line-height:1.45}.v4lab-word-list small,.v4lab-tip-list small{display:block;color:var(--label-3);font-size:10px;line-height:1.4}.v4lab-divider{display:flex;align-items:center;gap:8px;color:var(--label-3);font-size:10px;margin:14px 0 6px}.v4lab-divider:before,.v4lab-divider:after{content:"";height:1px;background:var(--glass-line);flex:1}.v4-periodic-guide{display:grid;grid-template-columns:1.3fr 1fr;gap:10px;border:.5px solid var(--glass-line);background:var(--glass);border-radius:16px;padding:12px;margin:0 0 12px}.v4-periodic-guide b,.v4-periodic-guide span{display:block}.v4-periodic-guide span{font-size:11px;color:var(--label-2);margin-top:4px}.v4-periodic-arrows{display:grid;gap:6px;align-content:center}.v4-periodic-arrows span{background:var(--fill);padding:7px 9px;border-radius:9px}.v4-element-reality{margin-top:12px;border-top:.5px solid var(--glass-line);padding-top:12px}.v4-element-photo{min-height:160px;border-radius:14px;overflow:hidden;background:var(--fill);display:grid;place-items:center;position:relative}.v4-element-photo img{width:100%;height:210px;object-fit:cover;display:block}.v4-element-photo>small{position:absolute;right:7px;bottom:7px;background:rgba(0,0,0,.58);color:#fff;padding:3px 6px;border-radius:6px;font-size:9px}.v4-element-photo.loading span{font-size:11px;color:var(--label-3)}.v4-element-photo-fallback{display:grid;gap:8px;text-align:center;padding:22px}.v4-element-photo-fallback b{font-size:52px}.v4-element-photo-fallback span{font-size:11px;color:var(--label-2)}.v4-element-facts{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:7px;margin-top:9px}.v4-element-facts>div{background:var(--fill);border-radius:10px;padding:8px}.v4-element-facts small,.v4-element-facts b{display:block}.v4-element-facts small{color:var(--label-3);font-size:9px}.v4-element-facts b{font-size:11px;margin-top:2px;overflow-wrap:anywhere}.v4-element-trends{display:grid;grid-template-columns:1fr 1fr;gap:5px;margin-top:9px}.v4-element-trends b{grid-column:1/-1;font-size:11px}.v4-element-trends span{font-size:10px;padding:6px;background:var(--glass);border-radius:8px}.v4-element-extract{font-size:10px;line-height:1.45;color:var(--label-2);margin:9px 0 0}.v4-chrono-map{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}.v4-chrono-map article{border:.5px solid var(--glass-line);border-radius:14px;padding:11px;background:var(--glass)}.v4-chrono-map small,.v4-chrono-map b,.v4-chrono-map p,.v4-chrono-map span{display:block}.v4-chrono-map small{font-size:9px;color:var(--label-3);text-transform:uppercase;font-weight:800}.v4-chrono-map b{font-size:12px;margin-top:3px}.v4-chrono-map p{font-size:11px;margin:6px 0;color:var(--label-1)}.v4-chrono-map span{font-size:10px;color:var(--label-2);line-height:1.4}.v4-history-rule{margin-top:9px;padding:10px;border-radius:12px;background:var(--fill);display:grid;gap:5px}.v4-history-rule b{font-size:11px}.v4-history-rule span{font-size:10px;color:var(--label-2)}.v4-lesson-atlas{border-top:.5px solid var(--glass-line);padding-top:18px}.v4-atlas-head .seg{min-width:150px}.v4-atlas-subjects{display:flex;gap:6px;overflow:auto;padding-bottom:7px;margin-bottom:8px}.v4-atlas-subjects button{border:.5px solid var(--glass-line);background:var(--fill);color:var(--label-2);border-radius:999px;padding:7px 10px;white-space:nowrap;font-size:10px;font-weight:700}.v4-atlas-subjects button.on{background:var(--accent);color:#fff;border-color:transparent}.v4-deep-title{display:flex;justify-content:space-between;align-items:center;margin:12px 0 8px}.v4-deep-title b{font-size:13px}.v4-deep-title span{font-size:9px;color:var(--label-3)}.v4-deep-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin-bottom:13px}.v4-deep-grid article{display:flex;gap:9px;padding:10px;border:.5px solid var(--glass-line);border-radius:14px;background:var(--glass)}.v4-deep-grid i{font-style:normal;font-size:26px;line-height:1}.v4-deep-grid b{font-size:12px}.v4-deep-grid p{font-size:10px;margin:3px 0;color:var(--label-1);line-height:1.4}.v4-deep-grid small,.v4-deep-grid em{display:block;font-size:9px;color:var(--label-2);line-height:1.4;font-style:normal;margin-top:3px}.v4-topic-tactics{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}.v4-topic-tactics article{border:.5px solid var(--glass-line);border-radius:14px;padding:10px;background:var(--fill)}.v4-topic-title small,.v4-topic-title b{display:block}.v4-topic-title small{font-size:9px;color:var(--label-3)}.v4-topic-title b{font-size:13px;margin-top:2px}.v4-topic-tactics p{font-size:10px;line-height:1.45;color:var(--label-2);margin:6px 0 0}.v4-topic-tactics strong{color:var(--label-1)}
    @media(max-width:760px){.v4lab-dual,.v4-periodic-guide,.v4-chrono-map,.v4-deep-grid,.v4-topic-tactics{grid-template-columns:1fr}.v4-element-trends{grid-template-columns:1fr}.v4-atlas-head,.v4lab-title{flex-direction:column}.v4-element-photo img{height:180px}}
  `;document.head.appendChild(s);}

  function ensureAll(){ensureTurkish();ensurePeriodicGuide();ensureTimelineUpgrade();ensureAtlas();enhanceElement();}
  let observer=null,queued=false;
  function schedule(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;ensureAll();});}
  function start(){injectStyle();let tries=0;const timer=setInterval(()=>{tries++;if($("v320LearningLab")){clearInterval(timer);ensureAll();observer=new MutationObserver(schedule);observer.observe($("v320LearningLab"),{childList:true,subtree:true});}else if(tries>40)clearInterval(timer);},120);}

  window.v4LabWordSearch=v=>{wordQuery=String(v||'');renderTurkish();};
  window.v4LabParagraphSearch=v=>{tipQuery=String(v||'');renderTurkish();};
  window.v4AtlasExam=v=>{atlasExam=v==='AYT'?'AYT':'TYT';atlasSubject='';atlasQuery='';renderAtlas();};
  window.v4AtlasSubject=v=>{atlasSubject=String(v||'');atlasQuery='';renderAtlas();};
  window.v4AtlasSearch=v=>{atlasQuery=String(v||'');renderAtlas();};
  document.addEventListener('yks:navigation-after',()=>setTimeout(ensureAll,60));
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
  window.YKSLearningLabV2={version:'2.0.0',words:WORDS,paragraphTips:PARAGRAPH_TIPS,deepDives:DEEP_DIVES,renderTurkish,renderAtlas,enhanceElement};
})();
