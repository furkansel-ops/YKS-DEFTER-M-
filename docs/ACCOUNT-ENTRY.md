# Hesapla kullanım ve kaydetmeden deneme

Bu değişiklik giriş/kayıt/şifre sıfırlama/e-posta doğrulama ekranlarını uygulama açılışına taşır. Var olan Firebase Authentication hesabı ve Firestore eşitlemesi kullanılır; ayrı bir hesap sistemi veya sahte oturum eklenmez.

- **Hesap:** E-posta doğrulaması ve cihazın hesap bağı kontrol edilir. Veri hazırlığı tamamlanınca uygulama açılır. SDK'nın kalıcı oturumu çevrimdışı açılışı destekler; yeniden şifre sorulmaz.
- **Kaydetmeden dene:** Boş ve yalnız bellekte çalışan bir oturumdur. Eski localStorage/Dexie kayıtları okunmaz veya değiştirilmez. Yenileme/kapatma çalışmayı bırakır. Hesaba geçişte demo içeriği aktarılmaz.
- **Kayıt/yerel yedek/bulut:** Doğrulanmış hesabı gerektirir. Hesap sahipliği ilk kayıt oturumunda, bulut bağlantısından bağımsız olarak bağlanır. Hesap değiştirme yanlışlıkla eski veriyi başka UID'ye gönderemez.
- **Şifreler:** Yalnız Firebase işlemine verilir; durum olaylarına, uygulama kayıtlarına veya yedeklere yazılmaz. Formlar işlem ve ekran değişiminde temizlenir. Sıfırlama sonucu hesabın varlığını açıklamaz.
- **Hata:** Oturum ve veri hazırlığı birbirinden ayrıdır. Ağ/eşitleme hatası başarılı giriş sayılmaz. Doğru hesaba zaten giriş yapılmışsa bir eşitleme hatası çevrimdışı çalışmayı engellemez.

## Başlangıç ve güvenlik sınırları

`public/session-mode.js`, diğer uygulama kodlarından önce parser-blocking yüklenir. Kilitli aşamada YKS çalışma anahtarlarının yazıları bekletilir; Firebase SDK deposu değiştirilmez. Legacy scriptler yalnız bu koruma kurulduysa parser sırasıyla yüklenir. Dosya eksikse ana uygulama çalışmaz, yeniden deneme ekranı gösterilir. Üretim doğrulaması korumayı ve hesap ekranının çevrimdışı module-preload parçalarını kontrol eder.

Dexie erişimi `SessionDataTarget` üzerinden sağlanır. Denemede gerçek veritabanı açılmaz. Çıkış ve hızlı yeniden girişler revision ile izlenir; eski oturuma ait bekleyen işlemler kalıcı kayda yazılamaz. Bu, işletim sistemi düzeyinde şifreli bir kasa değildir; cihaz kilidi kullanılması gerekir.

## Kontroller

- `npm test`: Hesap köprüsü, parola/UID koruması, kilitli/geçici depolama, işlem yarışları ve mevcut uygulama testleri.
- `npm run release:check`: Üretim web paketi, varlıklar ve boyut sınırları.
- `npm run build:desktop` ardından `node_modules/electron/dist/electron.exe desktop/smoke.cjs`: Gerçek Chromium'da hesap formları, 360px görünüm, geçici kayıt, eski depoların korunması, yeniden açılış, eksik koruma dosyası, masaüstü sandbox/PDF/dosya sınırları. Yalnız ayrı ve geçici test profili kullanılır.
- `tests/firebase-emulator` paketi: Yerel sahte projede gerçek Firebase Auth/Firestore SDK ve sunucu veri kuralları; canlı hesaplara dokunmaz.

Firebase akışları: [e-posta/şifre girişi](https://firebase.google.com/docs/auth/web/password-auth), [e-posta doğrulama ve şifre sıfırlama](https://firebase.google.com/docs/auth/web/manage-users).

9 Eylül 2026 doğrulaması: Node 22 ve Node 24'te **450/450** birim testi; web `release:check`; gerçek yerel Firebase emülatörlerinde **7/7** test; Android `bundleRelease`, `lintRelease`, `testReleaseUnitTest` başarılı. Android doğrulama paketi imzasızdır ve yeni dağıtım sürümü değildir. Windows testinde üç ayrı süreç aşaması ile dört yalıtılmış hesap-arayüzü hata senaryosu başarılıdır. Fiziksel Android cihazında canlı e-posta teslimi ve bu yeni ekranla Windows–telefon uçtan uca testi henüz yapılmadı.

## Yayın sınırı

10 Eylül 2026'da kullanıcı web, APK ve Windows test sürümünün yayımlanmasını onayladı. Yeni adayın kimliği **4.4.0-r4 / 4040004** olarak artırıldı; yayın tamamlanmış sayılması için bu commitin kalite kapıları, imzalı APK ve yeniden üretilen Windows paketleri doğrulanmalıdır. Bu belge tek başına yayın sonucu değildir. Fiziksel cihazlarda aynı hesapla son kontrol ayrıca gereklidir. Main'e birleştirme yapılmaz; yayındaki r3 dosyalarının üzerine yazılmaz.
