# YKS Defterim 4.4.0-r4 · Hesaplı kullanım ve kaydetmeden deneme

Bu sürüm GitHub üzerinden arkadaş testi içindir; Play Store yayını değildir. Android sürüm adı **4.4.0**, sürüm kodu **4040004** ve veri şeması **21** olarak korunur. Kaynak değişiklikler geliştirme dalındadır; main'e birleştirme içermez.

## Yenilikler

- Uygulama açılışında giriş, hesap oluşturma, şifre sıfırlama ve e-posta doğrulama ekranları bulunur. Mevcut Firebase hesapları kullanılır.
- Çalışmayı kaydetmek, yedek almak ve telefon–Windows–web arasında eşitlemek için doğrulanmış hesap gerekir. Kalıcı oturumu olan kullanıcıdan her açılışta yeniden şifre istenmez; hesaba ait cihaz kayıtları çevrimdışı kullanılabilir.
- **Kaydetmeden dene** hesabı olmayanların uygulamayı kullanmasını sağlar. Deneme boş ve geçicidir: yenileme veya kapatma ile biter, hesaba aktarılmaz ve eski cihaz kayıtlarını değiştirmez.
- Eski cihaz verileri ve hesap bağı korunur. Yanlış hesaba giriş eski çalışma kayıtlarının başka hesaba gönderilmesine izin vermez.

## Kurulum ve mevcut Google hesabı

Android'de **YKS-Defterim-4.4.0-4040004.apk** dosyasını resmî GitHub Release sayfasından indirin. Güncellemede eski uygulamayı kaldırmadan APK'yı üzerine kurun; önce mevcut hesabınızla bir yedek almanız önerilir. Dosyanın SHA-256 özetini Release dosyalarıyla karşılaştırın.

Mevcut hesabınız Google ile açıldıysa önce web sürümünde aynı Google hesabına girin. **Daha → Veri** bölümünden uygulamalar için şifre ekleyin; telefon ve Windows'ta aynı e-posta ile bu şifreyi kullanın. Ayrı bir hesap oluşturmayın. Yeni e-posta/şifre hesabı açtıysanız gelen doğrulama bağlantısını tamamlayın.

Windows kurulum dosyasında ticari kod imzalama sertifikası yoktur; Windows **SmartScreen / tanınmayan uygulama** uyarısı gösterebilir. Yalnız resmî GitHub Release dosyasını ve paylaşılan SHA-256 özetini kullanın.

## Test sınırı

Otomatik kontroller gerçek telefon testi yerine geçmez. Fiziksel Android cihazında yeni kurulum/güncelleme, e-posta teslimi, şifre sıfırlama ve Windows–telefon arasında aynı hesapla uçtan uca eşitleme kontrolü henüz tamamlanmadı. Testçiler sürüm, cihaz/işletim sistemi ve tekrar adımlarını bildirmeli; kişisel kayıtlarını herkese açık hata bildirimlerine eklememelidir.

Bu not, dosyalar henüz üretilmeden bir yayın başarısı iddiasında bulunmaz. İndirilebilir paketlerin ve web yayınının durumu ilgili GitHub Actions çalışması ve Release sayfasından doğrulanır.
