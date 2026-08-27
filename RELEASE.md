# YKS Defterim v4.1.0

Bu kararlı sürüm, çalışan v3 arayüzünü değiştirmeden Vite + TypeScript + Dexie altyapısına yapılan kademeli geçişin sonucudur.

## Biyoloji Atlası ayrıntı güncellemesi · önbellek r30

- Alan → konu → adım/ayrıntı/sınama akışı; 24 ayrıntılı rehber ve görsel odak kontrolleri.
- 9 organ üzerinde 52 etiketli öğretici yapı; kalp ve beyin için açılabilir şematik iç görünüm.
- Kaynak 3B modeller, eski laboratuvar araçları ve şema 21 kayıtları korunur; yeni görünümler kullanıcı verisi yazmaz.
- Kesite geçişte model iptali, gecikmiş sonuçların temizlenmesi, çevrimdışı/resimli görünüm ve klavye kontrolleri test edilir.

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
