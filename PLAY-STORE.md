# YKS Defterim · Google Play yayın hazırlığı

Bu belge, `codex/play-store-release-ready` dalındaki Android yayın adayının teknik ve Play Console kontrol listesidir. `main` dalına birleştirme, Play Console'a yükleme veya mağazada yayınlama bu belgenin parçası değildir.

## Sabit yayın kimliği

- Uygulama adı: **YKS Defterim**
- Android `applicationId`: **`com.furkansel.yksdefterim`**
- Sürüm adı: **`4.4.0`**
- Android `versionCode`: **`4040001`** (`4.4.0-r1`)
- Web kaynak klasörü: **`dist`**
- Minimum Android SDK: **24**
- Compile SDK / Target SDK: **36 / 36**
- Veri şeması: **21**
- Program davranışı: **manuel**

`applicationId`, ilk paket Play Console'a yüklendikten sonra uygulamanın kalıcı kimliğidir. `versionCode` ise her yeni Play yüklemesinde artırılmalıdır. Varsayılan türetme kuralı:

```text
major × 1.000.000 + minor × 10.000 + patch × 100 + revision
```

Örnek: `4.4.0-r1` → `4040001`.

## Android ve Capacitor sözleşmesi

Android projesi repoda sabitlenir; her CI çalışmasında geçici olarak yeniden oluşturulmaz. Yayın adayı aşağıdaki kontrolleri sağlamalıdır:

- Capacitor web varlıkları önce `npm run build:assets`, sonra `npx cap sync android` ile güncellenir.
- `applicationId`, sürüm, SDK seviyeleri ve release signing ayarları Gradle çıktısında doğrulanır.
- Uygulama etiketi **YKS Defterim** olarak görünür.
- Adaptive icon foreground/background katmanları ve splash kaynakları Android resource klasörlerinde bulunur.
- Açılış teması splash sonrasında uygulama temasıyla değiştirilir; açık/koyu sistem temasında okunabilirlik test edilir.
- Uygulama yönü kilitlenmez; telefon ve büyük ekranlarda hem dikey hem yatay kullanım smoke testinden geçirilir.
- Cleartext HTTP kapalı tutulur. Kullanıcının başlattığı Wikipedia, YouTube, MEB, OGM ve ÖSYM erişimleri HTTPS üzerinden çalışır.
- Gelen özel deep link özelliği yoktur. Manifestte `MAIN` / `LAUNCHER` dışında `VIEW` / `BROWSABLE` intent-filter ancak gerçek bir yönlendirme akışı ve doğrulanmış alan adı eklendiğinde tanımlanır.
- Gereksiz hassas Android izni eklenmez. Son AAB'nin merged manifest ve Play Console izin listesi elle kontrol edilir.

GitHub Pages'in proje yolu `/YKS-DEFTER-M-/` altında olduğu için bu paket TWA yerine Capacitor kullanır; kök alan adına Digital Asset Links yerleştirme zorunluluğu yoktur.

## Güvenli upload key hazırlığı

Upload key bir kez oluşturulur, parola yöneticisinde ve erişimi kısıtlı en az bir çevrimdışı yedekte saklanır. Keystore'u **repo dışında** bir klasörde oluşturun; parolaları komut satırı argümanına yazmayın:

Bu anahtar proje genelinde yalnız bir kez üretilir. Resmî upload key daha önce oluşturulduysa her klonda yeni anahtar üretmeyin; mevcut anahtarı yalnız güvenli bir kanaldan kullanın.

```text
keytool -genkeypair -v -keystore yks-defterim-upload.jks -storetype JKS -alias yks-defterim-upload -keyalg RSA -keysize 4096 -validity 10000
```

Komut parola ve sertifika bilgilerini etkileşimli ister. Gerçek kişi/kuruluş bilgilerini kullanın. Sonrasında:

1. Keystore dosyasının ve parolaların kurtarma kopyasını ayrı yerlerde saklayın.
2. Sertifika parmak izini kaydedin: `keytool -list -v -keystore yks-defterim-upload.jks -alias yks-defterim-upload`.
3. Keystore'u base64 metnine dönüştürün; base64 içeriğini de özel anahtar gibi koruyun.
4. `google-play-internal` adlı, yalnız korumalı yayın dallarına izin veren ve zorunlu onaylayıcısı bulunan GitHub Environment oluşturun. Aşağıdaki değerleri yalnız bu environment'ın secret'ları olarak ekleyin; repository secret kullanmayın:

   - `ANDROID_KEYSTORE_BASE64`
   - `ANDROID_KEYSTORE_PASSWORD`
   - `ANDROID_KEY_ALIAS`
   - `ANDROID_KEY_PASSWORD`

5. Play Console'da **Play App Signing** etkinleştirin. Bu dosya uygulama imzalama anahtarı değil, yalnız yükleme anahtarı olarak kullanılmalıdır.

`.jks`, `.keystore`, üretilen base64 dosyası, `key.properties` ve gerçek parolalar repoya, issue'ya, Actions loguna veya PR açıklamasına eklenmemelidir. Dört secret'tan biri eksikse signed yayın işi başarısız olmalı; yanlışlıkla “imzasız ama yüklenebilir” artefakt sunmamalıdır.

## GitHub Actions ile AAB

Android workflow'unun yayın işi şu sırayı izlemelidir:

1. Node 22 ve Java 21 ortamını kurar.
2. Kilit dosyasından `npm ci` çalıştırır.
3. `npm run release:check` kalite kapısını çalıştırır.
4. Web/PWA varlıklarını Android projesine senkronlar.
5. Android lint ve testlerini, ardından `bundleRelease` görevini çalıştırır.
6. Secret'ları yalnız geçici dosyalara açar ve işlem sonunda temizler.
7. İmzayı `jarsigner -verify` veya eşdeğer Gradle doğrulamasıyla kontrol eder.
8. `app-release.aab`, checksum ve sürüm metadata dosyasını Actions artefaktı olarak yükler.

Internal Testing'e yalnız **signed** workflow'un başarılı çıktısı yüklenir. Yerel debug veya doğrulama amaçlı imzasız bundle Play yükleme paketi olarak kullanılmaz.

## Gizlilik, ağ ve Data Safety

- Uygulama kullanıcı hesabı oluşturmaz; hesap silme şartı bu sürüm için uygulanabilir değildir.
- Çalışma kayıtları, tercihler ve kullanıcı tarafından girilen isteğe bağlı bilgiler uygulamanın yerel depolamasında tutulur.
- Uygulama içindeki **Daha → Veri → Cihaz verilerini sil** işlemi IndexedDB, yerel/session storage ve YKS cache'lerini iki aşamalı onayla temizler.
- Dışa aktarılmış JSON/yedek dosyaları uygulama depolamasının dışındadır ve kullanıcı tarafından ayrıca silinmelidir.
- Kullanıcının başlattığı bazı özellikler Wikipedia/Wikimedia API'sine, YouTube/Google API ve gömülü oynatıcısına veya MEB/OGM/ÖSYM sayfalarına ağ isteği yapabilir.
- Son beyan, kaynak kod varsayımıyla değil signed AAB üzerinde ağ gözlemi ve Play'in güncel tanımlarıyla doldurulur: `play-store/data-safety-tr.md`.
- Gizlilik politikası ve veri silme sayfası uygulama içinde erişilebilirdir; Play Console'a verilmeden önce herkese açık, HTTPS ve coğrafi kısıtsız URL'lerde açıldıkları doğrulanır.

Beklenen Pages adresleri (yayınlanmadan önce mutlaka açılıp kontrol edilir):

- `https://furkansel-ops.github.io/YKS-DEFTER-M-/privacy.html`
- `https://furkansel-ops.github.io/YKS-DEFTER-M-/data-deletion.html`

## Play Console ve mağaza içeriği

1. Uygulamayı varsayılan dil **Türkçe (tr-TR)** ve kategori **Eğitim** ile oluşturun.
2. Paket adını ilk yüklemeden önce son kez kontrol edin.
3. `play-store/listing-tr.md` içindeki metinleri girin.
4. Canlı gizlilik URL'sini ekleyin.
5. **App access:** giriş zorunlu değil.
6. **Ads:** son AAB'de reklam SDK'sı yoksa “Hayır”.
7. Data Safety ve data deletion sorularını son ağ/SDK denetimine göre yanıtlayın.
8. Content rating, target audience ve diğer App content beyanlarını geliştirici hesabındaki gerçek duruma göre tamamlayın.
9. Signed AAB'yi önce **Internal testing** kanalına yükleyin.
10. Pre-launch report, crash/ANR, izinler, cihaz uyumluluğu ve veri güvenliği uyarılarını çözmeden production'a geçmeyin.

## Mağaza varlığı açıkları

Repo aşağıdaki nihai mağaza varlıklarını henüz tek başına tamamlanmış saymaz:

- 512 × 512, şeffaflıksız Play Store uygulama simgesi
- 1024 × 500 feature graphic
- Güncel Android paketinden alınmış telefon ekran görüntüleri
- Desteklenecekse 7 inç / 10 inç tablet ekran görüntüleri
- Geliştirici/yayıncı görünen adı, doğrulanmış destek e-postası ve varsa web sitesi
- Gizlilik politikasında gösterilecek nihai geliştirici/yayıncı kimliği ve gizlilik iletişim kanalı

Ekran görüntülerinde gerçek uygulama arayüzü kullanılmalı; resmî kurum onayı, garanti edilen başarı veya uygulamada bulunmayan özellik izlenimi verilmemelidir.

## Internal Testing öncesi son kapı

- `npm ci` ve `npm run release:check` temiz checkout'ta yeşil.
- Node 22 ana hat ve Node 24 uyumluluk kontrolü yeşil.
- Android lint/test ve `bundleRelease` yeşil.
- AAB sürümü `4.4.0 (4040001)`, paket adı `com.furkansel.yksdefterim`.
- AAB upload key ile imzalı ve imza doğrulanmış.
- Telefon ve tablet üzerinde açılış, yön değişimi, geri tuşu, veri kaydetme, yedekleme, silme, Program, Deneme, Odak ve Öğrenme Laboratuvarı smoke testleri tamam.
- Wikipedia/YouTube ve resmî kaynak bağlantılarının çevrimiçi/çevrimdışı hata davranışı kontrol edilmiş.
- Privacy ve deletion URL'leri giriş istemeden açılıyor.
- Data Safety cevapları signed AAB ağ gözlemiyle eşleşiyor.
- Mağaza grafikleri ve ekran görüntüleri hazır.

## Kullanıcı / Play Console sahibinde kalanlar

Geliştirici hesabı kimlik doğrulaması, ödeme profili, nihai yayıncı ve iletişim bilgileri, upload key'in güvenli saklanması, GitHub secret'larının girilmesi, mağaza görsellerinin onayı, içerik derecelendirme/target audience cevapları, Data Safety formunun gönderimi ve Play Console'daki test/production işlemleri hesap sahibi tarafından tamamlanır. Açık onay olmadan `main` birleştirilmez ve hiçbir Play kanalına yükleme yapılmaz.
