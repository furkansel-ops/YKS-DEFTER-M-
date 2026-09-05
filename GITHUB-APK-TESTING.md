# YKS Defterim · GitHub APK arkadaş testi

Bu projenin seçilen Android dağıtım yöntemi Google Play değildir. Test sürümleri, doğrudan telefona kurulabilen imzalı APK olarak GitHub Releases üzerinden paylaşılır. Yayınlar test amaçlı **pre-release** olarak işaretlenir.

İlk test paketi **YKS Defterim 4.4.0-r2**, Android `versionCode` **4040002** ve dosya adı **`YKS-Defterim-4.4.0-4040002.apk`** olarak yayımlanır.

## İlk kurulum

1. Yalnız `furkansel-ops/YKS-DEFTER-M-` deposundaki resmî GitHub Release sayfasından `.apk` dosyasını indirin.
2. İndirme tamamlandıktan sonra Android'in bu kaynak için “bilinmeyen uygulama yükleme” iznini geçici olarak açın.
3. APK'yı kurun; kurulumdan sonra bu izni yeniden kapatın.
4. Uygulama adı **YKS Defterim**, paket kimliği **`com.furkansel.yksdefterim`** olmalıdır.

Android 7.0 / API 24 ve üzeri desteklenir. APK Play Store dışından geldiği için Android veya Play Protect ek bir uyarı gösterebilir. Dosya adı ile Release sayfasındaki SHA-256 özeti eşleşmiyorsa kuruluma devam edilmez.

## Bir yıl boyunca güncelleme kuralı

- Bütün APK'lar aynı güvenli imzalama anahtarıyla üretilir. Anahtar kaybolursa mevcut kurulumların üzerine veri korunarak güncelleme yapılamaz.
- Her yeni sürümde `versionCode` artırılır. Örneğin `4.4.0-r3` için `4040003` kullanılır.
- Yeni APK eskisinin üzerine kurulduğunda uygulama verileri korunur; yine de güncellemeden önce **Daha → Veri → Yedek al** önerilir.
- Test kullanıcıları uygulamayı kaldırırsa cihazdaki yerel veriler de silinebilir. Dışa aktarılan yedek dosyası ayrıca saklanmalıdır.
- APK yalnız GitHub Releases üzerinden paylaşılır; sohbet uygulamalarında yeniden paketlenmiş kopya dolaştırılmaz.

## Yayın üretimi

GitHub Actions içindeki **Android APK/AAB · GitHub Arkadaş Testi** çalışması elle başlatılır. İmzalı iş yalnız korumalı yayın dalında ve mevcut `google-play-internal` ortam onayından sonra çalışır. Bu tarihsel ortam adı yalnız güvenli imzalama kasasıdır; iş akışı Play Store'a dosya göndermez.

Kalite kapısı şunları uygular:

```text
npm ci
npm run release:check
npm run android:sync
Android lint ve unit test
assembleRelease ve bundleRelease
APK/AAB paket kimliği, sürüm ve imza doğrulaması
SHA-256 üretimi
```

GitHub Release'e kullanıcılar için yalnız APK, APK checksum'u ve release metadata dosyası eklenir. AAB teknik arşivdir ve telefona doğrudan kurulmaz. Actions artefaktı geçicidir; bir yıl boyunca paylaşılacak kalıcı indirme noktası GitHub Release varlıklarıdır.

## Gizli anahtar güvenliği

`.jks`, parolalar, base64 anahtar içeriği ve `key.properties` repoya veya Release dosyalarına eklenmez. Mevcut korumalı GitHub Environment içinde yalnız şu secret adları kullanılır:

- `ANDROID_KEYSTORE_BASE64`
- `ANDROID_KEYSTORE_PASSWORD`
- `ANDROID_KEY_ALIAS`
- `ANDROID_KEY_PASSWORD`

İmzalama anahtarı ve parolalar, Windows hesabına bağlı kopyadan ayrı olarak parola yöneticisinde ve çevrimdışı bir yedekte saklanmalıdır.

## Test geri bildirimi

Hata bildiriminde sürüm/build, telefon modeli, Android sürümü, sorunun görüldüğü ekran ve mümkünse tekrar adımları paylaşılır. Gerçek kişisel çalışma verileri veya yedek dosyaları herkese açık issue'lara eklenmez.
