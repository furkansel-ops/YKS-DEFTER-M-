# YKS Defterim v4.4.0 · GitHub APK arkadaş testi

## Kimlik

- Uygulama sürümü: **4.4.0**
- Build: **4.4.0-r2**
- Android `versionCode`: **4040002**
- Android paket adı: **`com.furkansel.yksdefterim`**
- Kanal: **GitHub pre-release / arkadaş testi**
- Veri şeması: **21**
- Tarih: **31 Ağustos 2026**

Bu dal, v4.4.0 web uygulamasını Capacitor tabanlı, doğrudan kurulabilir imzalı Android APK olarak paketler. AAB teknik arşiv olarak ayrıca üretilir. Seçilen dağıtım kanalı Google Play değil, GitHub Releases üzerindeki arkadaş testidir.

## v4.4.0 ürün kapsamı

- Manuel YKS çalışma programı, konu takibi, deneme analizi ve odak araçları korunur.
- Öğrenme Laboratuvarı; 9 organ / 52 yapılık Biyoloji Atlası, AYT görsel konu haritaları, 16 fizik kartına bağlı etkileşimli deneyler, kimya molekül/bağ görselleri, periyodik tablo karşılaştırması ve kronoloji akışı içerir.
- Büyük 3B anatomi motoru ve laboratuvar katmanları ihtiyaç halinde yüklenir; ana açılış paketine alınmaz.
- Program tamamen manuel kalır. Öğrenme ve analiz katmanları Program'a görev eklemez, silmez veya düzenlemez.
- Veri şeması 21 ve mevcut yerel veri/yedek uyumluluğu korunur.

## Android ve GitHub test dağıtımı

- Android kimliği ve sürüm sözleşmesi sabitlenmiştir.
- Web/PWA üretim varlıkları Capacitor Android projesine senkronlanır.
- Adaptive icon, splash, tema, SDK seviyeleri, ağ güvenliği ve ekran yönü Android yayın kontrolüne alınmıştır.
- Gizlilik politikası ile cihaz verilerini silme sayfası üretim paketine dahil edilir ve uygulama içinden açılır.
- Kullanıcı hesabı ve aktif bulut senkronu bu Android yayın kapsamının parçası değildir.
- Kullanıcı isteğiyle Wikipedia/Wikimedia, YouTube/Google ve resmî MEB/OGM/ÖSYM içeriklerine ağ erişimi olabilir.
- İmzalama anahtarı ve parolalar repo dışında tutulur; CI imzalama yalnız korumalı, tarihsel adı `google-play-internal` olan GitHub Environment secret'larıyla çalışır. Bu ortam Play Store'a yükleme yapmaz.
- APK, SHA-256 özeti ve metadata GitHub Release'e eklenir. Arkadaşlara yalnız Release sayfasının bağlantısı verilir.

## Doğrulama kapısı

Yayın adayı ancak aşağıdakilerin aynı commit üzerinde başarılı olmasıyla arkadaş testi paketi sayılır:

```text
npm ci
npm run release:check
npm run android:sync
Android lint/test
assembleRelease
bundleRelease
APK/AAB imza ve kimlik doğrulaması
```

Node 22 ana doğrulaması ve Node 24 uyumluluk doğrulaması ayrı ayrı yeşil olmalıdır. Test sayısı veya paket boyutu, o commitin CI çıktısından alınmadan bu belgeye kesin sonuç olarak yazılmaz.

## Tarihsel r1 yerel doğrulaması · 31 Ağustos 2026

Aşağıdaki sonuçlar kaynak tabanı `3c618eb45a75fe120eed45335cc8b9e208fe2d45` üzerinden hazırlanmış önceki **4.4.0-r1 / 4040001** adayına aittir; mevcut r2 adayının üretildiğini veya doğrulandığını göstermez:

- Node 22 ve Node 24 `release:check` kapıları geçti; her iki çalışmada **325/325** test başarılı oldu.
- Capacitor web varlığı eşitlemesi geçti.
- Android `lintRelease` ve `testReleaseUnitTest` görevleri geçti.
- Repo dışında oluşturulan upload key ile `bundleRelease` geçti.
- `bundletool 1.18.3`, AAB manifest sözleşmesini doğruladı; JAR imzası upload sertifikasıyla eşleşti.
- Yerel Internal Testing dosyası `YKS-Defterim-4.4.0-4040001.aab`, **29.950.020 byte** ve SHA-256 değeri `18d6257347d68aae4745db70b5df3fcc1ea449c5f7448c5c804b430690c4927f` olarak üretildi.

Bu sonuç yalnız tarihsel r1 yerel doğrulamasıdır. **4.4.0-r2 / 4040002** imzalı AAB, daha sonra `888195906d3d5bb925d0a3d4dc60f9cf92a2680f` commitinde GitHub Actions ile üretilip doğrulanmıştır. Güncel GitHub APK dağıtımı ise APK üreten iş akışının kendi commitinde yeniden doğrulanmadan hazır sayılmaz.

## Arkadaş testi öncesi işler

- İmzalama anahtarının parola yöneticisi ve çevrimdışı yedeği doğrulanmalı
- GitHub Actions signed workflow'u çalıştırılmalı; indirilen APK checksum'u ve imzası doğrulanmalı
- APK, checksum ve metadata GitHub pre-release varlıklarına eklenmeli
- Fiziksel telefon ve mümkünse tablet üzerinde smoke test
- İlk kurulum, güncelleme, veri yedeği ve kaldırma davranışı gerçek cihazlarda kontrol edilmeli
- Testçilere yalnız resmî GitHub Release bağlantısı ve [GITHUB-APK-TESTING.md](GITHUB-APK-TESTING.md) gönderilmeli

Bu işler tamamlanmadan APK “arkadaş testi için hazır” sayılmamalıdır. Bu paket Play Store yayını değildir.

Tarayıcı self-test'i: `?selftest=v4`
