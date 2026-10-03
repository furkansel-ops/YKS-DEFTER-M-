export const LESSONS = [
  {
    id: "groups", number: "01", title: "Kelime grupları", subtitle: "Kelimelerin arasındaki bağı gör.", minutes: "2–3 dakika",
    explanation: "Bir cümlede anlam çoğu zaman tek bir kelimede değil, yan yana duran kelimelerin ilişkisindedir. Aşağıdaki cümleyi önce tek kelimelerle, ardından 2–4 kelimelik bloklarla oku. Her bloğu küçük bir düşünce olarak ele al; bütün satırı tek bakışta okumaya çalışma.",
    instructions: "İki görünümü karşılaştır. Sonra grupları sırayla takip et ve metne bakmadan ana fikri seç. Cümleyi bir kez de kendi hızında oku; hangi ayrımın anlamı daha iyi taşıdığına dikkat et.",
    groups: ["Düzenli kısa tekrarlar", "bilgiyi canlı tutabilir;", "tek bir uzun çalışma", "her öğrenci için", "aynı etkiyi sağlamayabilir."],
    question: "Bu cümlenin ana fikri hangisi?", options: ["Yalnız uzun çalışmalar işe yarar.", "Kısa ve düzenli tekrarlar yararlı olabilir.", "Tekrar yapmadan bilgiler kalıcı olur."], answer: 1,
    reflection: "Kendi kitabından iki cümle seç. Anlamı bölmeden 2–4 kelimelik kümelere ayır ve yaklaşık bir dakika oku. Uzun veya yeni bir sözcükte yavaşlamak normaldir."
  },
  {
    id: "returns", number: "02", title: "Geri dönüşleri fark et", subtitle: "Gereksiz tekrarı, gerekli kontrolden ayır.", minutes: "2–3 dakika",
    explanation: "Bazı cümleleri anlamak için yeniden okumak gerekir. Buradaki amaç bunu yasaklamak değil, anladığın satıra alışkanlıkla dönüp dönmediğini fark etmek. İlk geçişte ‘Yazar ne söylüyor?’ sorusuna odaklan. Anlam koparsa yeniden bakmak doğru bir tercihtir.",
    instructions: "Metni satır satır aç. Önceki satır gizlendiğinde ana fikri aklında tut. Gerekirse ‘Önceki satıra bak’ düğmesini kullan; dönüş sayısı yalnızca farkındalık içindir, ceza değildir.",
    groups: ["Bir okul, öğrencilerin dinlenmesi için bahçesine küçük bir okuma köşesi kurdu.", "Öğrenciler önce köşenin yalnız kitap okumak için kullanılacağını düşündü.", "Oysa öğretmenler sessizce düşünmenin de bu alanın amacı olduğunu anlattı.", "Böylece köşe, üretken olmak zorunda kalmadan mola verilebilen bir yer oldu."],
    question: "Okuma köşesinin asıl işlevi nedir?", options: ["Daha fazla ödev yaptırmak.", "Yalnız kitap sayısını artırmak.", "Okumaya ve sessizce dinlenmeye alan açmak."], answer: 2,
    reflection: "Bir sonraki paragrafta geri döndüğünde nedenini adlandır: ‘Dikkatim dağıldı’ mı, ‘Yeni bir kavram vardı’ mı? Bir dakika boyunca yalnız fark etmeyi dene. Gerekli geri dönüşleri ortadan kaldırmaya çalışma."
  },
  {
    id: "focus", number: "03", title: "Odak alanını genişlet", subtitle: "Merkezde kal, çevredeki kelimeleri fark et.", minutes: "2–3 dakika",
    explanation: "Kısa kelime gruplarıyla merkez ve çevre farkındalığını çalışabilirsin. Bu alıştırma bütün sayfayı tek bakışta okuma vaadi taşımaz. Rahat bir mesafede dur, ortadaki sözcüğe bakarken yanındaki sözcükleri de fark etmeye çalış. Zorlanırsan gösterimi yeniden aç.",
    instructions: "‘Kelimeleri göster’ düğmesine bas. Ortadaki sözcüğe bak; sol ve sağ sözcüğü fark et. Üç kısa turdan sonra son gördüğün sağ sözcüğü seç. Acele etmek yerine net algılamayı önemse.",
    rounds: [["sakin", "bir", "sabah"], ["küçük", "bir", "adım"], ["yeni", "bir", "başlangıç"]],
    question: "Son turda merkezin sağında hangi kelime vardı?", options: ["başlangıç", "yeni", "adım"], answer: 0,
    reflection: "Kısa bir satırda iki veya üç doğal durak seç. Bir dakika boyunca bu durakları izle. Boynunu ve gözlerini zorlamadan çalış; daha geniş alanda bulanıklık oluyorsa kelime grubunu küçült."
  },
  {
    id: "voice", number: "04", title: "İç seslendirmeyi yönet", subtitle: "İç sesi susturmak yerine akıcı bir ritim kur.", minutes: "2–3 dakika",
    explanation: "Okurken kelimeleri içinden duymak olağandır ve anlamaya yardımcı olabilir. Amaç iç sesi tamamen susturmak değildir. Bildiğin bir metinde gereksiz duraklamaları azaltmayı dene; zor bir kavramda ise düşünmeye zaman ayır. Ses, ritim ve anlama aynı kişide bile metne göre değişir.",
    instructions: "Aşağıdaki kısa metni rahat bir ritimle takip et. Her grupta anlamı alıp sıradakine geç. Sonunda ana fikri seç; anlamadıysan daha yavaş tekrarla. Hızlı görünmek için kelime atlama.",
    groups: ["Yeni bir alışkanlık", "küçük adımlarla gelişir.", "Her gün ayırdığın", "kısa bir çalışma zamanı", "başlamayı kolaylaştırır.", "Asıl değer", "tek seferde çalışmakta değil,", "sürdürülebilir bir ritimdedir."],
    question: "Metin hangi yaklaşımı öneriyor?", options: ["İç sesi tamamen susturmayı.", "Sürdürülebilir küçük adımlarla ilerlemeyi.", "Anlamasan da hızlanmayı."], answer: 1,
    reflection: "Bir dakika boyunca rahat bir metin oku; sonra ana fikri tek cümleyle anlat. Bunu yapamıyorsan ritmi düşür. Egzersizlerde başlangıç için 150 veya 200 kelime/dakikayı deneyebilir, gerektiğinde kendi hızına dönebilirsin."
  }
];

// Original practice passages. Question answers depend only on the text; no outside knowledge is required.
export const PASSAGES = [
  {
    id: "library", title: "Bir kütüphanenin değişen sesi", topic: "Toplum ve mekân",
    text: "Mahalle kütüphanesi yenileneceği zaman ilk öneri daha fazla raf eklemek oldu. Görevliler ise karar vermeden önce ziyaretçileri dinlemeyi seçti. Öğrenciler sessiz masalar, küçük çocuklarıyla gelenler birlikte okuyabilecekleri bir köşe, yaşlı ziyaretçiler de rahat oturabilecekleri yerler istiyordu. Bu görüşmeler, tek bir düzenlemenin herkesin ihtiyacını karşılamayacağını gösterdi. Sonunda kütüphane farklı kullanım alanlarına ayrıldı. Sessiz bölüm korunurken girişe sohbet edilebilen küçük bir alan eklendi. Başlangıçta bazı ziyaretçiler bu değişikliğin kütüphaneyi gürültülü hâle getireceğinden kaygılandı. Ancak alanların açık biçimde ayrılması, kullanıcıların birbirini daha iyi anlamasını sağladı. Birkaç ay sonra kitap ödünç alma sayısı çok az değişmişti; buna karşılık ziyaretçilerin içeride geçirdiği süre artmıştı. Görevliler bu sonucu yalnız sayılarla değerlendirmedi. İnsanların oraya yeniden gelmek istemesini de önemli buldu. Yenilemenin asıl kazanımı daha çok kitap sergilemek değil, farklı insanların aynı yapıda kendilerine uygun bir yer bulabilmesiydi. Böylece mekânın başarısının yalnız kapasiteyle değil, kullanıcısıyla kurduğu ilişkiyle de ilgili olduğu anlaşıldı.",
    questions: [
      {prompt: "Yenileme öncesinde görevliler ne yaptı?", options: ["Kitapların tamamını değiştirdi.", "Ziyaretçilerin ihtiyaçlarını dinledi.", "Sessiz bölümü kapattı.", "Yalnız raf sayısını ölçtü."], answer: 1, explanation: "Karardan önce farklı ziyaretçilerin ihtiyaçları dinlendi.", type: "Ayrıntı"},
      {prompt: "Yenileme sonrasında belirgin olarak ne arttı?", options: ["Kitap ödünç alma sayısı.", "Rafların yüksekliği.", "İçeride geçirilen süre.", "Gürültü şikâyetleri."], answer: 2, explanation: "Metin, ödünç alma sayısı az değişirken içeride geçirilen sürenin arttığını söylüyor.", type: "Ayrıntı"},
      {prompt: "Parçanın ana düşüncesi hangisidir?", options: ["Her kütüphane tamamen sessiz olmalıdır.", "Başarı yalnız sayısal artışla ölçülür.", "Daha fazla raf her ihtiyacı karşılar.", "Bir mekânın değeri kullanıcı ihtiyaçlarıyla kurduğu ilişkide de görülür."], answer: 3, explanation: "Son cümle kapasitenin yanında kullanıcıyla kurulan ilişkiyi vurguluyor.", type: "Ana düşünce"},
      {prompt: "Başlangıçtaki kaygının azalmasını ne sağladı?", options: ["Farklı alanların açık biçimde ayrılması.", "Çocukların kütüphaneye alınmaması.", "Sohbet alanının kaldırılması.", "Ziyaret süresinin sınırlandırılması."], answer: 0, explanation: "Kullanım alanlarının ayrılması ziyaretçilerin birbirini daha iyi anlamasını sağladı.", type: "Neden-sonuç"}
    ]
  },
  {
    id: "garden", title: "Bahçedeki küçük notlar", topic: "Gözlem ve öğrenme",
    text: "Bir öğrenci grubu okul bahçesinde yetiştirdikleri bitkilerin neden farklı hızlarda büyüdüğünü merak etti. İlk tahminleri, büyük yapraklı bitkilerin her koşulda daha hızlı büyüyeceğiydi. Öğretmenleri bu tahmini hemen düzeltmek yerine gözlem defteri tutmalarını önerdi. Öğrenciler her hafta aynı gün bitkileri ölçtü; sulama miktarını ve saksıların bulunduğu yeri de kaydetti. Bir süre sonra pencereye yakın duran iki küçük bitkinin diğerlerinden daha hızlı geliştiğini fark ettiler. Yalnız yaprak büyüklüğüne bakarak karar vermenin yeterli olmadığını anladılar. Bunun üzerine yer ve su miktarını ayrı ayrı değiştiren yeni bir çalışma planladılar. İlk sonuçları kesin bir kural olarak sunmadılar; çünkü az sayıda bitki üzerinde çalışmışlardı. Yine de defterleri onlara önemli bir alışkanlık kazandırdı: Bekledikleri sonucu aramak yerine gördüklerini düzenli olarak yazmak. Dönem sonunda hazırladıkları sunumda en çok büyüyen bitkiyi değil, başlangıçtaki fikirlerinin nasıl değiştiğini anlattılar. Onlar için çalışmanın değeri doğru tahminde bulunmaktan çok, tahminlerini gözlemlerle yeniden değerlendirebilmekti.",
    questions: [
      {prompt: "Öğrencilerin ilk tahmini neydi?", options: ["Büyük yapraklı bitkiler her koşulda hızlı büyür.", "Pencere kenarında bitki yetişmez.", "Su miktarı hiç önemli değildir.", "Bütün bitkiler eşit hızla büyür."], answer: 0, explanation: "İlk tahmin yaprak büyüklüğü ile büyüme hızını ilişkilendiriyordu.", type: "Ayrıntı"},
      {prompt: "İlk sonuçlar neden kesin kural olarak sunulmadı?", options: ["Ölçümler hiç kaydedilmediği için.", "Öğretmen sonucu beğenmediği için.", "Çalışmada az sayıda bitki bulunduğu için.", "Dönem henüz başlamadığı için."], answer: 2, explanation: "Öğrenciler örnek sayısının az olduğunun farkındaydı.", type: "Neden-sonuç"},
      {prompt: "Çalışmanın asıl kazanımı hangisiydi?", options: ["İlk tahmini her durumda savunmak.", "Daha büyük saksılar almak.", "En hızlı büyüyen bitkiyi seçmek.", "Fikirleri düzenli gözlemlerle yeniden değerlendirmek."], answer: 3, explanation: "Parça, doğru tahminden çok gözleme açık olmayı öne çıkarıyor.", type: "Ana düşünce"},
      {prompt: "Yeni çalışma planında hangi yaklaşım benimsendi?", options: ["Ölçüm gününü sürekli değiştirmek.", "Yer ve su miktarını ayrı ayrı değiştirmek.", "Not tutmayı bırakmak.", "Yalnız yaprak saymak."], answer: 1, explanation: "Farklı etkenlerin etkisini görebilmek için yer ve su ayrı ayrı değiştirilecekti.", type: "Ayrıntı"}
    ]
  },
  {
    id: "map", title: "Haritanın göstermediği", topic: "Kent ve deneyim",
    text: "Bir şehir araştırmacısı aynı mahallenin iki haritasını hazırladı. İlk haritada yolların uzunluğu, duraklar ve binalar vardı. İkincisini ise mahallede yaşayanların anlattıklarından oluşturdu. Birinin kestirme saydığı dar sokak, bir başkası için karanlık olduğu için tercih edilmeyen bir yoldu. Haritada küçük görünen park, çocuklarıyla zaman geçiren aileler için mahallenin merkeziydi. Araştırmacı bu anlatıları teknik haritanın yerine koymadı; ikisini birlikte kullanmayı önerdi. Çünkü ölçüler fiziksel uzaklığı gösterirken insanların deneyimleri bir yerin nasıl algılandığını açıklıyordu. Belediyeye sunduğu raporda yalnız yeni yol açılmasını istemedi. Bazı sokakların aydınlatılmasını ve parktaki oturma alanlarının onarılmasını da önerdi. Bu öneriler büyük projeler kadar dikkat çekici değildi, fakat günlük yaşamda doğrudan karşılığı vardı. Araştırmacıya göre iyi bir plan, yalnız masada çizilen çizgilerden oluşamazdı. O çizgilerin üzerinde yürüyen insanların sesini de duymalıydı. Mahalle sakinleri raporu okuduklarında ilk kez kendi küçük deneyimlerinin kentle ilgili bir kararda yer bulduğunu hissetti.",
    questions: [
      {prompt: "İkinci harita hangi kaynaktan oluşturuldu?", options: ["Yalnız uydu görüntülerinden.", "Eski yol ölçümlerinden.", "Mahalle sakinlerinin anlatılarından.", "Başka şehirlerin planlarından."], answer: 2, explanation: "İkinci harita yaşayanların deneyimlerini içeriyordu.", type: "Ayrıntı"},
      {prompt: "Araştırmacı iki harita için ne önerdi?", options: ["Birlikte kullanılmalarını.", "Teknik haritanın silinmesini.", "Deneyim haritasının gizlenmesini.", "Yalnız en kısa yolların gösterilmesini."], answer: 0, explanation: "Anlatılar teknik ölçülerin yerini almak yerine onları tamamlıyordu.", type: "Ayrıntı"},
      {prompt: "Parçadan hangi sonuca ulaşılabilir?", options: ["Küçük iyileştirmeler günlük hayatı etkilemez.", "Herkes bir sokağı aynı biçimde algılar.", "Kent planlarında ölçülere hiç gerek yoktur.", "Planlama, fiziksel ölçülerle insan deneyimini birlikte değerlendirmelidir."], answer: 3, explanation: "Ana fikir, teknik bilgi ile günlük deneyimin beraber düşünülmesidir.", type: "Çıkarım"},
      {prompt: "Dar sokak örneği neyi gösterir?", options: ["Kestirme yollar her zaman güvenlidir.", "Aynı yol farklı kişilerce farklı değerlendirilebilir.", "Haritalarda dar yollar bulunmaz.", "Yolun uzunluğu deneyimle değişir."], answer: 1, explanation: "Bir kişinin kestirmesi başka birinin kaçındığı yol olabiliyordu.", type: "Örnek işlevi"}
    ]
  },
  {
    id: "repair", title: "Bir eşyaya ikinci bakış", topic: "Üretim ve alışkanlık",
    text: "Küçük bir tamir atölyesi, cumartesi günleri kapısını mahallenin gençlerine açmaya başladı. Amaç herkesi uzman bir tamirci yapmak değildi. Atölyenin sahibi, bozulan bir eşyanın hemen çöpe atılmadan önce incelenebileceğini göstermek istiyordu. İlk buluşmada çalışmayan bir masa lambası getirildi. Gençler sorunun büyük ve pahalı bir parçadan kaynaklandığını düşündü. Birlikte yapılan inceleme, gevşek bir bağlantının soruna yol açtığını ortaya çıkardı. Bu örnek her arızanın kolayca giderilebileceği anlamına gelmiyordu. Atölyede güvenlik gerektiren işlemler yalnız yetkili kişi tarafından yapılıyordu. Katılımcıların asıl görevi sorular sormak, parçaların işlevini anlamak ve süreci gözlemlemekti. Birkaç hafta sonra gençlerin anlattığı değişim, kaç eşya onardıklarından çok düşünme biçimleriyle ilgiliydi. Artık bir şey çalışmadığında önce nedenini merak ediyorlardı. Atölye sahibi bu merakı en önemli sonuç saydı. Çünkü bir nesnenin nasıl üretildiğini anlamak, hem emeğe verilen değeri artırıyor hem de yenisini alma kararını daha bilinçli hâle getiriyordu.",
    questions: [
      {prompt: "Atölyenin temel amacı neydi?", options: ["Herkesi uzman tamirci yapmak.", "Her arızanın kolay olduğunu kanıtlamak.", "Bütün yeni ürünleri gereksiz saymak.", "Eşyayı atmadan önce inceleme alışkanlığı kazandırmak."], answer: 3, explanation: "Amaç uzmanlık değil, nesnelere düşünerek yaklaşmaktı.", type: "Ana düşünce"},
      {prompt: "Masa lambasındaki sorun neydi?", options: ["Kırık bir gövde.", "Gevşek bir bağlantı.", "Eksik bir ana parça.", "Yanlış renk seçimi."], answer: 1, explanation: "İnceleme gevşek bağlantıyı ortaya çıkardı.", type: "Ayrıntı"},
      {prompt: "Katılımcılarda öne çıkan değişim hangisiydi?", options: ["Arızaların nedenini merak etmeleri.", "Her eşyayı tek başına onarmaları.", "Daha hızlı alışveriş yapmaları.", "Soru sormaktan vazgeçmeleri."], answer: 0, explanation: "Gençler bozulan şeyin nedenini sorgulamaya başladı.", type: "Ayrıntı"},
      {prompt: "Parça hangi yargıyı desteklemez?", options: ["Üretimi anlamak emeğe değer vermeyi destekleyebilir.", "Güvenlik gerektiren işlerde yetkili kişi gerekir.", "Her arıza gençler tarafından kolayca giderilebilir.", "Gözlem yapmak da öğrenmenin bir parçasıdır."], answer: 2, explanation: "Metin her arızanın kolayca giderilemeyeceğini açıkça belirtiyor.", type: "Çıkarılamayan yargı"}
    ]
  }
];
export const EXERCISES = [
  {id: "groups", title: "Kelime grupları", description: "Üç kelimelik grupları rahat bir ritimle takip et."},
  {id: "lines", title: "Satır takibi", description: "Vurgulanan satırı izle; anlam koparsa duraklat."},
  {id: "focus", title: "Odak noktası", description: "Merkez sözcüğe bakarken yan sözcükleri de fark et."},
  {id: "returns", title: "Tek geçiş", description: "Önceki grup gizlenirken ana fikri aklında tut."},
  {id: "paragraph", title: "Kısa paragraf", description: "Metni kendi hızında oku; bitince anlama sorusunu yanıtla."}
];
