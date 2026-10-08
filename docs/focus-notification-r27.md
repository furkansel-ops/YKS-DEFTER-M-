# r27 — Android bildirim simgesi ve odak düğmeleri

HONOR MagicPad 2 / Chrome kullanıcısı bildirimde beyaz bir blok gördüğünü ve
Duraklat / Devam et'e bastığında Android bildirim perdesinin kapanıp tabletin
ana ekranının göründüğünü bildirdi. Uygulamanın Bugün ekranına yönlendirme
yaşanmadığı kullanıcıyla netleştirildi.

## Değişiklik

- `public/notification-badge.svg` bildirim için şeffaf zeminli, tek renk defter
  simgesidir. `notification-badge.png` bunun 96×96 RGBA çıktısıdır. Dolu mavi
  uygulama ikonu büyük `icon` olarak korunur; küçük `badge` için kullanılmaz.
- `app.js` ve `modules/focus-notification-worker.js` yeni rozeti kullanır.
  Rozet üretim doğrulamasına ve çevrimdışı önbelleğe dahildir.
- Bildirimde tek Duraklat veya Devam et düğmesi vardır. Bildirim gövdesine
  dokunmak Odak ekranını açar. Eski sürümden kalan `focus-open` işlemi desteklenir.
- Süresi dolmuş bir sayacın eski kontrol düğmesine basılması uygulamayı artık
  kendiliğinden açmaz. Bildirim sürenin dolduğunu gösterir; açmak kullanıcıya kalır.
- Çalışma verisi şeması, süre hesabı, duraklama ve kalıcı oturum yapısı değişmez.

## Platform sınırları

Bu değişiklik Android bildirim perdesini açık tutma iddiasında bulunmaz. Web
NotificationOptions içinde bunu sağlayan bir seçenek yoktur. Chromium'un
Android aksiyonlarını bir trampoline Activity üzerinden geçirmesi, uygulama
`focus` veya `openWindow` çağırmasa da görülen kapanmayla uyumludur; fiziksel
cihazdaki kesin neden ayrıca doğrulanmamıştır.

Tek düğme, eski Chrome sürümlerindeki birden fazla aksiyonun son düğmenin
işlemine dönüşmesi hatasına da maruz kalmaz. Bu hata kullanıcının cihazında
tespit edilmiş bir neden olarak sunulmaz.

Mevcut Chrome/PWA sürümünde HONOR Magic Capsule'ı talep edecek doğrulanmış bir
API yoktur. Android Live Updates yerel uygulama izinleri ve bildirim API'leri
gerektirir; ayrı Android entegrasyonu ve tam cihaz/OS desteği kontrolü olmadan
kapsül sözü verilemez. Yalnız APK paketlemek yeterlilik garantisi değildir.

## Doğrulama

- PNG'nin alfa kanalı, şeffaf kenarları ve defter çizgilerinin boşlukları piksel
  düzeyinde test edilir; opak kareye dönüşme regresyonu yakalanır.
- Gerçek worker işleyicisinin pause/resume işlemleri, süre dolmuş olsa da
  `clients.focus` veya `openWindow` çağırmaz; bildirim gövdesi açmayı sürdürür.
- Kalıcı kaydın, tek düğmenin ve rozet URL'sinin tarayıcı kontrolü fiziksel
  HONOR bildirim perdesi testi yerine geçmez.

## Kaynaklar

- [Chromium küçük ikonun alfa kanalını koruyarak beyaza boyar](https://chromium.googlesource.com/chromium/src/+/98bcd85e696b5a2b236e706204da0e9936d6e1b1/chrome/browser/notifications/android/java/src/org/chromium/chrome/browser/notifications/NotificationBuilderBase.java)
- [Chromium Android bildirim aksiyonlarının Activity üzerinden işlenmesi](https://chromium.googlesource.com/chromium/src/+/bc643fd28c45b5f93e38eb2bf2db1995a84d155f)
- [Chromium birden fazla aksiyonun çakışması düzeltmesi](https://chromium.googlesource.com/chromium/src/+/f2b852a4e5bb034646126abe8058e33143c15950)
- [Web bildirim seçenekleri](https://notifications.spec.whatwg.org/#dictdef-notificationoptions)
- [HONOR Magic Capsule](https://www.honor.com/global/support/content/en-us15873103/)
- [Android Live Updates](https://developer.android.com/develop/ui/views/notifications/live-update)
