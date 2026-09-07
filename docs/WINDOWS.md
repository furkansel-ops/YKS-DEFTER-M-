# YKS Defterim — Windows arkadaş testi

Windows sürümü, GitHub üzerinden indirilen x64 `.exe` kurulum dosyasıdır. Microsoft Store veya Google Play yayını yapmaz. Electron 44.2.0 ve electron-builder 26.16.0 sürümleri kilitlenmiştir. Windows 10/11 x64 hedeflenir; ARM64 için ayrı paket henüz hazırlanmaz.

## Kullanım

1. GitHub sürümüne eklenmiş `YKS-Defterim-4.4.0-Windows-x64-Setup.exe` dosyasını indir. Actions artefaktı bir ZIP içindeyse önce ZIP'i aç.
2. Kurulum yalnızca mevcut Windows kullanıcısına yapılır. Yönetici yetkisi istemez. Masaüstü ve Başlat menüsüne YKS Defterim kısayolu ekler.
3. Mevcut tarayıcı/PWA kayıtların kurulumda kendiliğinden taşınmaz. Eski uygulamadan JSON yedeği alıp Windows uygulamasının veri bölümünden içe aktar veya iki cihazda aynı eşitleme hesabını kullan.
4. Hesapla eşitleme isteğe bağlıdır. İnternet yokken yerel kayıtlarla çalışılır; Firebase hizmeti ve sağlayıcı kurulumu tamamlanmışsa bağlantı geri geldiğinde eşitleme sürer. Android ve Windows aynı hesaba bağlanmalıdır. Google web hesabının parola ile bağlanması ayrı bir bulut hesabı oluşturmadan yapılmalıdır; ilgili kurulum notlarına bak.
5. Güncelleme için yeni kurulum dosyasını mevcut uygulamayı kapattıktan sonra çalıştır. Otomatik güncelleme veya arka planda yeni program indirme bulunmaz.

Windows kod imzalama sertifikası henüz yapılandırılmadı. Bu nedenle test kurulum dosyası “tanınmayan uygulama/yayıncı” uyarısı gösterebilir. Güvenlik korumalarını genel olarak kapatma. Kaynak GitHub deposunu ve yayımlanan SHA-256 değerini doğrulamadan dosyayı çalıştırma. Örnek doğrulama:

```powershell
Get-FileHash -Algorithm SHA256 -LiteralPath '.\YKS-Defterim-4.4.0-Windows-x64-Setup.exe'
Get-AuthenticodeSignature -LiteralPath '.\YKS-Defterim-4.4.0-Windows-x64-Setup.exe'
```

`NotSigned`, test paketinin Authenticode ile imzalanmadığını belirtir; SHA-256 tek başına yayıncı kimliğini kanıtlamaz. Beklenen SHA-256, aynı GitHub sürümündeki `SHA256SUMS.txt` dosyasıyla eşleşmelidir.

## Kayıtlar ve güvenlik sınırları

- Sabit uygulama adresi `app://yks/index.html`, yerel veri klasörü `%APPDATA%\YKS Defterim`, kalıcı oturum `persist:yks-main` olarak korunur. Kurulum sürümü değişince yeni bir veri alanı oluşturulmaz.
- Kaldırma işlemi yerel çalışma verilerini otomatik silmez. Silmek istediğinde önce uygulamanın iki aşamalı **Cihaz verilerini sil** kontrolünü kullan. Bulut kopyası ayrı bir işlemdir.
- Tarayıcı, Windows ve Android farklı cihaz depolarıdır. Bir cihazda çıkış yapmak diğer cihazın yerel kayıtlarını silmez. İlk eşitleme öncesinde JSON yedeği almak önerilir.
- Ekran kodu Node.js, dosya sistemi, terminal veya genel amaçlı IPC erişimi almaz. Kamera, mikrofon, konum ve cihaz izinleri kapalıdır.
- Dış HTTPS bağlantısı ancak kullanıcı onayından sonra varsayılan tarayıcıda açılır. Uygulama içindeki Google OAuth pencereleri desteklenmez.
- JSON/CSV/metin/takvim/görsel dışa aktarmaları görünür bir “Kaydet” penceresi kullanır. PDF raporu ayrı, yalıtılmış bir rapor penceresinde Windows yazdır/PDF kaydet akışını kullanır.
- İçerik güvenliği eski uygulamanın satır içi kontrollerini korur; `unsafe-eval`, Node entegrasyonu, keyfî uzak betikler, sertifika doğrulamasını kapatma veya güvenlik kum havuzunu devre dışı bırakma içermez.
- Firebase için yalnızca gerekli istemci bağlantıları açılmıştır. Sunucu yetkileri Firestore kurallarıyla ayrıca uygulanmalıdır; masaüstü paketleme bu kuralları dağıtmaz.

## Geliştirme ve paketleme

```powershell
npm ci --no-audit --no-fund
npm run release:check
npm run desktop:verify
npm run desktop:pack
```

Paketleme `build:desktop` ile taze uygulama dosyalarını üretir, `desktop/electron-builder.yml` ile NSIS kurulum dosyasını oluşturur ve `scripts/verify-desktop.mjs` ile arşiv içeriğini, sürümü, temel güvenlik seçeneklerini ve Windows imza durumunu kontrol eder. `desktop-release/` içindeki kurulum dosyası, SHA-256 listesi ve `windows-release-metadata.json` dağıtım çıktılarıdır. Bu dizin repoya commit edilmez.

`.github/workflows/build-windows.yml` PR veya elle çalıştırmayla üretir. Yalnızca okuma izni kullanır; gizli anahtar istemez, Release oluşturmaz veya kendiliğinden yayınlamaz. Windows imzalama sertifikası sonradan eklenirse PFX/parola repoya yazılmamalı ve sertifikanın hedefi/onayı ayrıca belirlenmelidir.

## Teslim öncesi gerçek cihaz testi

- Temiz Windows hesabında kurulum, açılış ve yeniden açılışta veri korunması.
- 1366×768 ve dar pencere boyutlarında tüm ana sekmeler, kaydırma, klavye ve yakınlaştırma.
- JSON dışa aktarma/içe aktarma, takvim/Anki/Markdown çıktıları, çalışma kartı ve PDF raporu.
- Aynı hesapla Android ↔ Windows iki yönlü eşitleme; çevrimdışı değişiklik; bağlantı geri gelince birleşim; çıkış/başka hesap koruması.
- Güncelleme kurulumundan sonra kayıtlar ve kaldırımdan sonra kayıtların silinmediğinin doğrulanması.

Üretilmiş paket ve otomatik testlerin geçmesi, yukarıdaki fiziksel cihaz testlerinin yapıldığı anlamına gelmez. Firebase sağlayıcısı ve Firestore kuralları yetkili hesap üzerinden etkinleştirilmeden canlı eşitleme tamamlandı diye işaretlenmemelidir.
