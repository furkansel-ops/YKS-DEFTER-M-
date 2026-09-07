# Telefon, Windows ve web eşitlemesi

Android APK ve Windows kurulum dosyası GitHub üzerinden dağıtılır; Google Play yayını yoktur. Veriler önce cihazda saklanır. Giriş zorunlu değildir. Bulut eşitleme için Firebase projesi `yks-uygulamam` kullanılır.

## Aynı deftere bağlan

1. Önce mevcut cihazda **Merkez → Veri → Yedek al** ile bir yedek sakla.
2. Daha önce Google ile eşitlediysen, bu değişiklikleri içeren güncel web sürümünde aynı Google hesabıyla giriş yap. **Uygulamalar için şifre ekle** bölümünde YKS Defterim'e özel yeni bir şifre belirle. Bu işlem mevcut Firebase hesabına bir giriş yöntemi bağlar; yeni bir defter veya farklı hesap oluşturmaz. Google şifreni bu alana yazma.
3. Android ve Windows'ta **Merkez → Veri** bölümünden aynı e-posta ve uygulama şifresiyle giriş yap.
4. Daha önce bulut hesabı kullanmadıysan **Yeni hesap oluştur** seçeneğini kullan. E-postadaki bağlantıyı aç ve **Doğruladım, kontrol et** düğmesine bas. Doğrulamadan çalışma verileri eşitlenmez.
5. Her iki cihazda **Senkronize** durumunu bekle. İnternet kesilirse değişiklikler cihazda bekler ve bağlantı geldiğinde yeniden denenir.

Web hesabına şifre eklemek için bu sürümün web derlemesinin yayımlanmış olması gerekir. Eski Pages sürümünde ilgili bölüm yoksa yeni hesap açarak geçiş yapma; güncel web yayımını bekle.

## Veriler nasıl korunur?

- İlk başarılı eşitlemeden sonra cihaz aynı kullanıcı kimliğine bağlanır. Yanlış hesaba otomatik veri aktarılmaz. Farklı hesabı kullanmak için önce yedek alıp cihaz verilerini silmek gerekir.
- İndirme veya disk yazımı sırasında gelen yeni yerel düzenleme eski bulut görüntüsüyle ezilmez. Yeniden okunur ve ortak tabana göre birleştirilir.
- Farklı kayıtlar birleştirilir. Aynı alan iki cihazda da değiştirilirse yerel değer önceliklidir; her çakışma için iki farklı değerin tamamının korunacağı garanti edilmez. Güncel bir yedek tut.
- YouTube API anahtarı ve çalışan odak sayacı cihazda kalır; buluta veya başka cihaza taşınmaz.
- Çıkış yapmak yerel çalışma kayıtlarını silmez. Ortak bilgisayarda hesabından çıktıktan sonra **Cihaz verilerini sil** işlemini de kullan.
- **Bulut kopyasını sil** diğer cihazların eski kopyayı sessizce yeniden yüklemesini durdurur. Yerel kayıtları ve Firebase giriş hesabını silmez. **Cihaz verilerini sil** yalnız o cihazı temizler.
- Uygulama şifreleri çalışma kayıtlarına, yedeklere veya repoya yazılmaz. Kalıcı oturum Firebase SDK tarafından cihazın uygulama depolamasında yönetilir. Bulut hizmeti uçtan uca şifreli kasa olarak sunulmaz.

## Yönetici kapısı

- Firebase Authentication'da Google ile birlikte Email/Password sağlayıcısı açık olmalıdır. Email link (passwordless) kullanılmaz.
- Firestore kuralları `firestore.rules` dosyasına uygun yayımlanmalıdır; oturumsuz ve farklı kullanıcıların erişimi reddedilmelidir. Kuralların dosyada bulunması sunucuda etkin olduklarını kanıtlamaz.
- Firebase public web API key bir yönetici anahtarı değildir. Admin SDK/service-account anahtarı, parola veya signing keystore istemci paketine eklenmez.
- Hesap sahibi onayı olmadan ödeme planı, IAM erişimi veya ek servis açılmaz.

## Yayından önce gerçek cihaz testi

İki ayrı kurulumda aynı test hesabını kullan. Bir cihazda benzersiz bir not ekle, diğerinde geldiğini doğrula; ardından yönü tersine çevir. İnterneti kapatıp farklı kayıtlar ekle, yeniden bağla, iki kaydın korunduğunu doğrula. Uygulamaları tamamen kapatıp açınca veriler ve oturum korunmalı. Bu test geçmeden yalnız derleme/birim testine dayanarak canlı eşitleme doğrulandı denmez.
