# YKS Defterim · Google Play hazırlığı

Bu dal, mevcut Vite + TypeScript uygulamasını **Capacitor 8** ile Android App Bundle (`.aab`) olarak paketlemek için hazırlanmıştır.

## Uygulama kimliği

- Uygulama adı: **YKS Defterim**
- Android applicationId: **`com.furkansel.yksdefterim`**
- Web kaynak klasörü: `dist`
- Minimum Android SDK: **24**
- Compile SDK: **36**
- Target SDK: **36**
- Veri şeması: **21** (değiştirilmez)
- Program davranışı: **manuel** (otomatik plan üreticisi eklenmez)

> `applicationId`, Play Console'da ilk uygulama oluşturulup paket yüklendikten sonra kalıcı kimlik olarak düşünülmelidir. İlk gerçek Play yüklemesinden önce son kez kontrol edilmelidir.

## Neden Capacitor?

GitHub Pages proje sitesi `/YKS-DEFTER-M-/` altında çalıştığı için Trusted Web Activity'nin kök alan adı Digital Asset Links dosyasını (`/.well-known/assetlinks.json`) bu repo üzerinden güvenilir biçimde yönetemiyoruz. Capacitor, mevcut uygulamayı yerel Android paketine alır ve bu kök alan adı bağımlılığını ortadan kaldırır.

## CI ile AAB üretimi

`.github/workflows/build-android.yml` aşağıdaki hattı çalıştırır:

1. Node 22 + Java 21 ortamını kurar.
2. Mevcut `npm run release:check` kalite kapısını çalıştırır.
3. Capacitor 8.5.0 paketlerini geçici olarak kurar; root `package-lock.json` değiştirilmez.
4. `npx cap add android` ve `npx cap sync android` ile Android projesini üretir.
5. `scripts/prepare-android-release.mjs` ile SDK 36, sürüm adı ve `versionCode` sözleşmesini doğrular.
6. `./gradlew bundleRelease` ile AAB üretir.
7. AAB ve `yks-release-metadata.json` dosyasını GitHub Actions artefaktı olarak yükler.

### Android versionCode

Varsayılan kod `version.json` üzerinden türetilir:

`major * 1,000,000 + minor * 10,000 + patch * 100 + revision`

Örnek: `4.4.0-r1` → `4040001`.

Gerekirse CI'da `ANDROID_VERSION_CODE` ile daha yüksek bir kod verilebilir. Play'e yüklenen her yeni sürümde kod önceki yüklemeden büyük olmak zorundadır.

## İmzalı Play yüklemesi

Play'e gönderilecek release AAB için bir **upload key** gerekir. Workflow şu GitHub Actions secret'larını destekler:

- `ANDROID_KEYSTORE_BASE64`
- `ANDROID_KEYSTORE_PASSWORD`
- `ANDROID_KEY_ALIAS`
- `ANDROID_KEY_PASSWORD`

Secret'lar yoksa workflow paketleme doğrulaması için imzasız release AAB üretir. Secret'lar eksiksizse upload key ile imzalı AAB üretir. Keystore dosyası repoya **asla commit edilmemelidir**.

Google Play tarafında **Play App Signing** etkinleştirilir; upload key yalnız geliştiricinin yükleme kimliğidir, dağıtım anahtarı Google Play tarafından korunur.

## Gizlilik ve veri silme

- Gizlilik politikası: `/privacy.html`
- Veri silme açıklaması: `/data-deletion.html`
- Uygulama içi bağlantılar: **Daha → Veri → Gizlilik ve cihaz verileri**
- Güncel sürüm kullanıcı hesabı oluşturmaz.
- Çalışma verileri localStorage + IndexedDB/Dexie üzerinde yerel tutulur.
- `Cihaz verilerini sil` iki aşamalı onayla localStorage, IndexedDB ve YKS cache'lerini temizler.
- Eski işlevsiz `Google ile giriş / Bulut senkronu` kutusu çalışma zamanında kaldırılır.

## Play Console kontrol listesi

1. Google Play Console geliştirici hesabında yeni uygulama oluştur.
2. Varsayılan dil: **Türkçe (tr-TR)**.
3. Uygulama adı: **YKS Defterim**.
4. Uygulama türü: Uygulama; fiyatlandırma kararı geliştiriciye aittir.
5. Store listing metinlerini `play-store/listing-tr.md` dosyasından gir.
6. 512×512 uygulama simgesi, 1024×500 özellik grafiği ve telefon/tablet ekran görüntülerini yükle.
7. Gizlilik politikası URL'sini canlı `privacy.html` adresine bağla.
8. App access: hesap/giriş zorunlu değildir.
9. Ads: uygulamaya reklam SDK'sı eklenmediği sürece **Hayır**.
10. Content rating anketini gerçek içerik davranışına göre doldur.
11. Target audience: YKS hazırlık kitlesine göre gerçek yaş gruplarını seç; çocuklara özel tasarım iddiası ekleme.
12. Data Safety formunu `play-store/data-safety-tr.md` ve son binary davranışına göre doldur.
13. App content / News / Health / Financial gibi özel beyanlarda yalnız gerçekten ilgili olanları seç.
14. AAB'yi önce **Internal testing** veya gerekiyorsa **Closed testing** kanalına yükle.
15. Pre-launch report sonuçlarını incele; kritik crash/ANR varsa production'a geçme.
16. Production release oluştur ve incelemeye gönder.

## Play'e gitmeden önce son teknik kapı

- `npm run release:check` yeşil.
- Android workflow yeşil.
- `targetSdkVersion=36` ve `compileSdkVersion=36` doğrulandı.
- AAB oluştu.
- İmzalı yayın yapılacaksa dört signing secret eksiksiz.
- Telefon + tablet üzerinde açılış, veri kaydı, yedek, silme, odak, Program, Deneme ve Öğrenme Laboratuvarı smoke testi yapıldı.
- Gizlilik sayfası canlı URL'de açılıyor.
- Play Store ekran görüntüleri ve özellik grafiği hazır.

## Bu repo neyi otomatik yapmaz?

Play Console hesabı oluşturma, geliştirici kimlik doğrulaması, ödeme/profil işlemleri ve production'a son gönderim Google Play Console hesabı üzerinden yapılır. Repo yalnız güvenli, tekrarlanabilir Android paketleme ve doğrulama hattını hazırlar.
