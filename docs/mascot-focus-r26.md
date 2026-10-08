# r26 — Hareketli maskotlar ve web uygulamasında odak bildirimi

## Maskotlar

On karakterin hareket sırası, ritmi ve ağırlığı farklıdır. Bakışlar, ayaklar,
kulaklar, kuyruklar ve kanatlar bağımsız hareket eder. Kutlamada sıçrama öncesi
hazırlık, havada dönüş, yumuşak iniş ve konfeti vardır. Dokunmak sessiz bir
hareket başlatır; sohbet veya baloncuk açmaz. Sürükleme dokunma sayılmaz.

WebGL sahnesi ilk JavaScript paketinin dışında kalır; 30 FPS sınırı,
gizli sayfa/odak/modal duraklatmaları, azaltılmış hareket ve görsel yedek korunur.

## Bildirimden odak kontrolü

Hedef ana ekrana eklenmiş Chrome web uygulamasıdır; APK kurulumu gerekmez.
Odak ekranındaki **Bildirimden kontrol et** düğmesi mevcut izin akışını kullanır.
Pomodoro ve kronometre çalışınca aynı etiketli bir bildirim oluşturulur.
**Duraklat / Devam et** işlemleri service worker tarafından IndexedDB'ye
kaydedilir. Açık pencere olmasa da düğmeler durumu değiştirebilir.
**Odağı aç** mevcut uygulamayı yeniden yüklemeden öne getirir.

Çalışan Pomodoro bildirimi bir bitiş saati, çalışan kronometre başlangıç saati
gösterir. Duraklatılmış bildirimde kalan/geçen süre gösterilir. Ekran kapalıyken
saniye saniye yenilenen bir sistem sayacı veya kesin zamanda alarm iddiası yoktur.
Chrome sayfayı dondurabilir; service worker sürekli çalışan bir zamanlayıcı değildir.
Sunucu push hizmeti, ücretli API, sahte ses çalar veya arka planı zorla açık tutan
mekanizma eklenmemiştir.

HONOR Magic Capsule için web uygulamalarına açık doğrulanmış bir entegrasyon
kullanılmıyor. Normal bildirim ve düğmeler destekleyen tarayıcıda çalışır;
fiziksel MagicPad 2 görünümü cihaz üzerinde ayrıca kontrol edilmelidir.

## Veri ve yarış koşulları

- Çalışma verisi şeması 21 olarak kalır. Bildirim durumu ayrı
  `yks-focus-notifications-v1` IndexedDB veritabanında tutulur.
- Her oturumun kimliği ve her değişikliğin artan revizyonu vardır. Eski
  bildirimin düğmesi yeni oturumu değiştiremez. Güncelliğini yitirmiş sayfa
  yazısı kalıcı yeni durumu ezmez.
- Sayfa açılırken ve görünür olduğunda kalıcı durum alınır. Duraklama aralığı
  çalışma süresine eklenmez; kredilendirilmiş dakika tekrar yazılmaz.
- Timer türü değişince diğer çalışan sayaç duraklatılır.
- Bildirimden kontrol çalışmasa da normal uygulama sayacı kullanılabilir.
- Cihaz verilerini silme işlemi bildirim durumunun veritabanını da siler.

## Dosya sınırları

`mascot-models.ts`, `mascot-motion.ts`, `mascot-scene.ts` ve maskot CSS'i görsel
değişiklikleri içerir. `modules/focus-notifications.js` mevcut sayaçlarla sayfa
bağlantısını, `modules/focus-notification-worker.js` kalıcı bildirim işlemlerini
yönetir. `modules/stability.js` açılış kurtarmasını bu bağlantıyla sıralar.
`app.js` bildirim teslim sonucunu bekler; `public/settings-profile-runtime.js`
izin yardımını ve gerçek teslim sonucunu gösterir. `sw.js` yeni dosyaları
çevrimdışı pakete alır; genel bildirim tıklaması açık sayfayı yenilemez.

## Platform kaynakları

- [Web bildirimleri ve kalıcı bildirimler](https://developer.mozilla.org/en-US/docs/Web/API/Notifications_API)
- [Bildirim düğmeleri](https://developer.mozilla.org/en-US/docs/Web/API/Notification/actions)
- [Chrome sayfa yaşam döngüsü](https://developer.chrome.com/docs/web-platform/page-lifecycle-api)
- [HONOR Magic Capsule](https://www.honor.com/ae-en/support/content/en-us15885805/)

Tarayıcı senaryolarında gerçek Edge service worker/IndexedDB kullanılır.
Otomatik `notificationclick` olayları gerçek işletim sistemi çekmecesine
fiziksel dokunma veya fiziksel HONOR cihaz testi yerine geçmez.

## Doğrulama

- `npm run release:check`: 794 test, TypeScript, üretim paketi, çevrimdışı
  önbellek ve sürüm kontrolleri geçti. Ana paket 259997 bayt; mevcut bütçe korundu.
- Maskot: 28 gerçek Edge kontrolü; on karakter, görev kutlamaları, odak ve
  azaltılmış hareket, WebGL yedeği, 360/390/412/1440 px görünüm.
- Bildirim: 14 gerçek Edge kontrolü; gerçek bildirim API'si, sayfa kapalıyken
  duraklat/devam et ve yeniden açılış, duraklama dakikalarının hariç tutulması,
  eski bildirim, ayar kapatma, izin reddi, 360/390/412/1024 px görünüm.
- r25'in özel 24 saat süre ayarı, derslere dakika dağıtımı, kronometrede ders
  değiştirme/mola işaretleme ve hızlı açılış akışları korunur.
- Cihaz verileri silinirken sayaç durdurulur; gecikmiş geri yükleme, sayfadan
  ayrılma veya yeniden başlat düğmesi eski odak kaydını oluşturamaz.
