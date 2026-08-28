# YKS Defterim v4.1.0

Bu kararlı sürüm, çalışan v3 arayüzünü değiştirmeden Vite + TypeScript + Dexie altyapısına yapılan kademeli geçişin sonucudur.

## Biyoloji Atlası tek sahne 3B güncellemesi · önbellek r31

- 24 konuda 109 ayrı odak çizimi, numaralı öğrenme durakları, konum ve görsel okuma rehberi. Genel bağlantı şeması ayrıntılı anlatımda; sınamada ipuçları gizli.
- 9 organ üzerinde dönen kameraya bağlı toplam 52 YKS işareti; içeride 52 seçilebilir, hacimli öğretici 3B yapı.
- Kulak, 3B organ listesinden ve ona ait model/şema/etkileşim katmanlarından kaldırılmıştır; Duyu organları konu anlatımındaki işitme ve denge bilgileri müfredat içeriği olarak korunur.
- “3B içini aç” aynı sahnede kaynak kabuğun ön/arka yarılarını ayırır; ortada ayrıca hazırlanmış öğretici iç parçalar görünür. Kalp boşluklarında duvar kalınlığı ve kapaklar; beyinde ön/orta/arka bölümler. Büyütmeler ölçekli değildir.
- Mevcut kaynak 3B modeller, eski laboratuvar araçları ve şema 21 kayıtları korunur; yeni görünümler kullanıcı verisi yazmaz.
- Yapı seçimi, aç/kapat, etiket ve büyütme aynı canvas/model üzerinde çalışır; indirmeyi tekrar başlatmaz. Konu/organ/sekme değişiminde eski yükleme iptal edilir. WebGL yoksa açıkça adlandırılmış 2B şema yedeği kullanılabilir.
- Geometri, kesme düzlemleri, paylaşılan kaynak temizliği, 52 seçim, 109 çizim, kapalı görünüm anatomisi, yükleme yarışları ve eski laboratuvar regresyonları otomatik test kapsamındadır.

## Kararlı sürüm kontrolü

```bash
npm install
npm run release:check
```

Tarayıcı içi uçtan uca kontrol için uygulamayı `?selftest=v4` sorgusuyla açın. Sonuç, sayfanın `data-v4-release` niteliğinde ve gizli `v4ReleaseResult` öğesinde `YKS_V4_RELEASE_OK` olarak görünür.

Kontrol edilen akışlar:

- v4 bootstrap ve bütün TypeScript köprüleri
- yedi ana ekranın açılması ve başlangıç ekranına geri dönülmesi
- mevcut şema 21 kaydının Dexie write-through yazımı
- IndexedDB kaydının yeniden okunması ve hash bilgisinin varlığı
- Firebase için hazırlanan bulut JSON'unda yerel kronometre ve YouTube anahtarının ayrıştırılması
- buluttan indirme yolunun aynı kayıtla Dexie-first uygulanması
- Firestore transaction, revision, conflict ve hash korumalarının üretim paketinde bulunması
- eski v3 release self-test katmanının v4 ile birlikte geçmesi
- PWA önbelleğinin `v4.1.0-r20` yapı anahtarıyla atomik yenilenmesi, Vite paketlerinin çevrimdışı saklanması ve eski modüllerin sürümlü URL'lerle aşılması
- Öğrenme Laboratuvarı için içerik araması, konu favorileri, favori filtresi ve konu bazlı kendini kontrol listeleri
- Konular ekranı için sınav bazlı tamamlanma yüzdesi, görünür konu hedefleri ve önümüzdeki 7 günlük tekrar planı
- İlerleme ekranının tek bakışta özet, kanıta dayalı ders durumu ve sade ayrıntı düzenine geçirilmesi
- Deneme ekranına dönem karşılaştırması, yanlış yoğunluğu ve kanıta dayalı ders analizi eklenmesi
- Tablet ve PC ekranlarında ortak genişlik, dengeli Konular kartları, taşma koruması ve geniş dokunma hedefleri
- Tablet/PC kurulum kartı, Android için ana ekrana ekleme yönlendirmesi ve kayıtları yazdıktan sonra etkinleşen yapı numaralı güncelleme akışı

GitHub Pages yayını, derleme kontrollerinden sonra canlı dosya doğrulamasını da otomatik çalıştırır.