# YKS Defterim v4.4.0 · Play Store yayın adayı

## Kimlik

- Uygulama sürümü: **4.4.0**
- Build: **4.4.0-r1**
- Android `versionCode`: **4040001**
- Android paket adı: **`com.furkansel.yksdefterim`**
- Kanal: **stable adayı / Internal Testing öncesi**
- Veri şeması: **21**
- Tarih: **31 Ağustos 2026**

Bu dal, v4.4.0 web uygulamasını Capacitor tabanlı Android App Bundle olarak paketlemeye hazırlar. `main` dalına birleştirme ve Play Console'a yükleme ayrı, açık onay gerektirir.

## v4.4.0 ürün kapsamı

- Manuel YKS çalışma programı, konu takibi, deneme analizi ve odak araçları korunur.
- Öğrenme Laboratuvarı; 9 organ / 52 yapılık Biyoloji Atlası, AYT görsel konu haritaları, 16 fizik kartına bağlı etkileşimli deneyler, kimya molekül/bağ görselleri, periyodik tablo karşılaştırması ve kronoloji akışı içerir.
- Büyük 3B anatomi motoru ve laboratuvar katmanları ihtiyaç halinde yüklenir; ana açılış paketine alınmaz.
- Program tamamen manuel kalır. Öğrenme ve analiz katmanları Program'a görev eklemez, silmez veya düzenlemez.
- Veri şeması 21 ve mevcut yerel veri/yedek uyumluluğu korunur.

## Play Store hazırlığı

- Android kimliği ve sürüm sözleşmesi sabitlenmiştir.
- Web/PWA üretim varlıkları Capacitor Android projesine senkronlanır.
- Adaptive icon, splash, tema, SDK seviyeleri, ağ güvenliği ve ekran yönü Android yayın kontrolüne alınmıştır.
- Gizlilik politikası ile cihaz verilerini silme sayfası üretim paketine dahil edilir ve uygulama içinden açılır.
- Kullanıcı hesabı ve aktif bulut senkronu bu Android yayın kapsamının parçası değildir.
- Kullanıcı isteğiyle Wikipedia/Wikimedia, YouTube/Google ve resmî MEB/OGM/ÖSYM içeriklerine ağ erişimi olabilir; Data Safety beyanı signed AAB üzerinde yeniden doğrulanır.
- Upload key ve parolalar repo dışında tutulur; yerel doğrulama geçici ortam değişkenleriyle, CI imzalama ise yalnız korumalı GitHub Environment secret'larıyla çalışır.

## Doğrulama kapısı

Yayın adayı ancak aşağıdakilerin aynı commit üzerinde başarılı olmasıyla Internal Testing paketi sayılır:

```text
npm ci
npm run release:check
npm run android:sync
Android lint/test
bundleRelease
AAB imza doğrulaması
```

Node 22 ana doğrulaması ve Node 24 uyumluluk doğrulaması ayrı ayrı yeşil olmalıdır. Test sayısı veya paket boyutu, o commitin CI çıktısından alınmadan bu belgeye kesin sonuç olarak yazılmaz.

## Yerel doğrulama · 31 Ağustos 2026

Bu çalışma alanında, kaynak tabanı `3c618eb45a75fe120eed45335cc8b9e208fe2d45` üzerinden hazırlanan yayın adayı için:

- Node 22 ve Node 24 `release:check` kapıları geçti; her iki çalışmada **325/325** test başarılı oldu.
- Capacitor web varlığı eşitlemesi geçti.
- Android `lintRelease` ve `testReleaseUnitTest` görevleri geçti.
- Repo dışında oluşturulan upload key ile `bundleRelease` geçti.
- `bundletool 1.18.3`, AAB manifest sözleşmesini doğruladı; JAR imzası upload sertifikasıyla eşleşti.
- Yerel Internal Testing dosyası `YKS-Defterim-4.4.0-4040001.aab`, **29.950.020 byte** ve SHA-256 değeri `18d6257347d68aae4745db70b5df3fcc1ea449c5f7448c5c804b430690c4927f` olarak üretildi.

Bu sonuç yerel doğrulamadır; GitHub Actions signed workflow'u ve Play Console yüklemesi henüz çalıştırılmamıştır.

## Bilinen yayın öncesi işler

- Upload key repo dışında oluşturuldu; parola yöneticisi/çevrimdışı yedek ve hesap sahibine güvenli teslim doğrulanmalı, ardından dört GitHub Environment secret'ı eklenmeli
- Yerel signed AAB doğrulandı; GitHub Actions signed workflow'u ayrıca çalıştırılmalı ve indirilen artefakt checksum'u doğrulanmalı
- Fiziksel telefon ve mümkünse tablet üzerinde smoke test
- Signed AAB ağ trafiğinin izlenmesi ve Data Safety formunun buna göre tamamlanması
- Gizlilik/deletion sayfaları, `main` dağıtılmadığı için beklenen canlı HTTPS adreslerinde şu anda 404 dönüyor; Play Console'a girilmeden önce yayınlanıp doğrulanmalı
- 512 × 512 store icon, 1024 × 500 feature graphic ve gerçek cihaz ekran görüntüleri
- Nihai geliştirici/yayıncı adı, destek e-postası, içerik derecelendirme ve target audience kararları
- Internal Testing yüklemesi ve Play pre-launch report incelemesi

Bu işler tamamlanmadan “Play Store'da yayınlandı” veya “production hazır” ifadesi kullanılmamalıdır.

Tarayıcı self-test'i: `?selftest=v4`
