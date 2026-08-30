# YKS Defterim v4.1.0

## FINAL · 30 Ağustos 2026

YKS Defterim v4.1.0; çalışma zekâsı, 3B Biyoloji Atlası, deneme/hata analizi, PWA, Dexie veri katmanı ve tüm ana ekranların tablet/PC/mobil cilasını bir araya getiren kararlı sürümdür.

### Final sürüm özeti

- Bugün, Program, Konular, Deneme, İlerleme, Odak, Daha ve Öğrenme Laboratuvarı ekranları ortak premium tasarım diline getirildi.
- Günün Sözü sistemi yalnız YKS/çalışma motivasyonu ve seçili teknik direktör sözlerini gösterir.
- Akıllı Tekrar Merkezi, Hata Defteri 3.0 ve Deneme Analizi 2.0 güçlendirildi.
- Program sistemi manuel kalır; çalışma zekâsı programa otomatik görev eklemez veya mevcut görevleri değiştirmez.
- Biyoloji Atlası 2.0 toplam 9 organ ve 52 seçilebilir YKS yapısıyla çalışır. Kulak Atlas organ listesinden kaldırılmıştır; işitme/denge müfredat içeriği normal konu anlatımında korunur.
- 3B Atlas ağır Three.js parçalarını normal uygulama açılışından ayrı yükler; WebGL/yükleme hatalarında kontrollü geri dönüş sağlar.
- Dexie ana kayıt + localStorage güvenli ayna uzlaştırması, Firebase bulut JSON yolu ve yedek içe/dışa aktarma korumaları korunur.
- Çok sık art arda çalışan eski `save()` çağrıları artık Dexie yazma kuyruğunu gereksiz büyütmez; son değişiklik kaybolmadan yazmalar birleştirilir.
- Dexie başlatmasındaki beklenmedik hata kontrollü `warning` durumuna düşer; kontrolsüz promise reddi bırakılmaz.
- PWA çevrimdışı durum kontrolündeki timeout ve MessageChannel kaynakları temizlenir; eski/yavaş async sonuç yeni UI durumunun üzerine yazamaz.
- PWA cache çizgisi final UI turunda `r39` seviyesine ulaştı; üretim paketi ve canlı Pages doğrulaması CI tarafından kontrol edilir.
- Node 22 ana çalışma tabanı ve Node 24 uyumluluk kapısı korunur.
- TypeScript strict, `noUncheckedIndexedAccess`, `noFallthroughCasesInSwitch`, kaynak boyut bütçeleri ve salt-okunur CI korumaları aktiftir.
- Final runtime hardening için ayrı regresyon testleri eklendi.

### Son doğrulama

Final runtime sağlamlaştırmasından sonraki son commit zinciri Node 22/24 üzerinde typecheck, tüm otomatik testler, üretim build'i, GitHub Pages build/deploy ve canlı sürüm doğrulamasından başarıyla geçti.

Veri şeması: **21** (değişmedi)  
Uygulama sürümü: **4.1.0**  
Kanal: **stable**

---

Bu kararlı sürüm, çalışan v3 arayüzünü değiştirmeden Vite + TypeScript + Dexie altyapısına yapılan kademeli geçişin sonucudur.

## Çalışma zekâsı ve Atlas 2.0 güncellemesi

- Biyoloji Atlası 2.0: 9 organ için YKS odak cümlesi, öğrenme rotası ve “YKS öncelikli” yapı işaretleri. Mevcut 3B/2B model sistemi korunur.
- Akıllı Tekrar Merkezi: yanlış, tekrar gecikmesi, güven ve konu durumunu birlikte değerlendirir; yalnız “tekrar etmen gerekiyor” uyarısı verir, programa otomatik görev eklemez.
- Hata Defteri 3.0: farklı günlerde tekrar eden hata kalıpları, hata nedeni dağılımı ve kullanıcıya ait düzeltme notları.
- Deneme Analizi 2.0: aynı deneme türünde önceki sonuç, son 5 ortalaması, dalgalanma, ders bazlı artış/düşüş ve deneme bağlantılı hata sayısı.
- Bugün ekranındaki Çalışma Komuta Merkezi tek bakışta soru, odak, kritik tekrar ve son denemeyi gösterir; “Gizle” düğmesiyle tamamen kapatılabilir.
- Konular ekranı “Öğreniliyor / Pekiştiriliyor / Hazır / Tekrar gerekli” sağlık özetini gösterir; bu etiketler de programı değiştirmez.
- Kullanılmayan özellik temizliği güvenli tutulur: yalnız gerçekten referanssız/geçici yükseltme parçaları kaldırılır; halen kullanılan veya regresyon testlerinin koruduğu eski modüller sırf adları eski diye silinmez ve kayıtlı kullanıcı verisine dokunulmaz.
- Hız ve güvenilirlik cilasında çalışma zekâsı yeniden çizimleri aynı animasyon karesinde birleştirilir; ek analiz katmanı sürekli timer döngüsü kurmaz. Çekirdek salt-okunur çalışır ve program alanlarını değiştirmediğini doğrulayan otomatik test, hata/deneme analiz testleri ve Atlas odak sözleşmesi release kontrolüne eklenmiştir.

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
