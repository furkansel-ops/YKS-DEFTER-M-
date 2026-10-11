# Android odak bildirimi: cihazda deneme

Hedef cihaz HONOR MagicPad 2, Android 16, MagicOS 10.0. Chrome'dan ana ekrana
eklenen PWA ile Android APK farklı uygulama ortamlarıdır. Aşağıdaki yerel
bildirim kontrolleri APK içindir; web sürümünün çalışan bildirim yolu korunur.

## Beklenen davranış

- Bildirimde süreyi Android'in kendi sayacı gösterir. Duraklat / Devam et
  eylemi bir Android `BroadcastReceiver` üzerinden işlenir; Activity açmaz.
  Bildirim gövdesine dokunmak ise uygulamanın Odak ekranını açar.
- Android 16'da uygun devam eden bildirim için Live Update talep edilir.
  Destek, sistem izni ve bildirimin gerçekten terfi ettirilmesi ayrı ayrı
  değerlendirilir. MagicOS kapsülü göstermezse normal bildirim kullanılabilir.
  Duraklatılmış veya süresi dolmuş oturum normal bildirim olarak gösterilir.
- Bildirim izni kullanıcının düğmeye basmasıyla istenir. İzin verilmemesi
  uygulamadaki sayacı kullanmayı engellemez.
- Durum kalıcı olarak saklanır; eski bir bildirimin eylemi yeni oturumu
  değiştirmemelidir. Uygulama yeniden açılınca aynı oturumla uzlaşmalıdır.
- Kullanıcı bildirimi kaldırırsa sıradan ekran yenilemeleri bildirimi sürekli
  yeniden oluşturmamalıdır. Yeni bir oturum ayrıca bildirim oluşturabilir.
  Kullanıcının uygulamadan bildirim kontrolünü yeniden etkinleştirmesi de
  görünürlüğü geri getirebilir.

Live Update isteği kapsülün göründüğünün kanıtı değildir. Bildirim perdesinin
açık kalması ve MagicOS kapsül görünümü fiziksel HONOR cihazında doğrulanmalıdır.
Android uyumlu emülatör kontrolü de bu cihaz denemesinin yerini tutmaz.

## Deneme paketini al

1. İlgili PR'ın **Android AAB · Google Play Internal Testing** workflow'unda
   web kontrolleri ve **API 36 · Android lint ve unit test** işinin başarılı
   tamamlanmasını bekle.
2. Workflow çalıştırmasının Artifacts bölümünden
   `yks-defterim-native-review-<PR numarası>` paketini indir. GitHub oturumu
   gerekebilir.
3. Paketteki `review-metadata.json` ile incelenen kaynak commit'ini ve test
   edilen checkout'u doğrula. APK özeti `.sha256` dosyasındadır; imza doğrulama
   çıktısı ve APK kimlik bilgileri de pakete eklenir.
4. `YKS-Defterim-native-review.apk` dosyasını tablete aktar ve kur. Bu paket
   Android debug anahtarıyla imzalı cihaz denemesidir; Play yayını değildir.
   Web sitesi bu işlemle yayımlanmaz. İmzalı AAB'nin korumalı manuel kapısı ayrıdır.

Deneme APK'sı `com.furkansel.yksdefterim` paket kimliğini kullanır. Aynı kimlikle
farklı anahtarla imzalanmış bir APK zaten kuruluysa Android bunun üstüne kuruluma
izin vermez. Verileri yedeklemeden mevcut uygulamayı kaldırma. CI çalıştırmaları
arasındaki debug anahtarı da değişebilir; bu paket güncelleme dağıtım kanalı değildir.

## PWA verilerini koru

Chrome/PWA depolaması ile APK'nın WebView depolaması paylaşılmaz. Eski kayıtların
APK'da kendiliğinden görünmesi beklenmez.

1. PWA'da **Daha → Veri** bölümünden JSON yedeği dışa aktar; dosyanın indirildiğini
   doğrula. Çalışan odak oturumunu normal şekilde tamamla veya durdur.
2. APK'yı açıp aynı Veri bölümünden JSON dosyasını içe aktar. Geri yükleme ön
   izlemesinde çalışma günlerini ve deneme sayısını kontrol et.
3. Program, denemeler ve varsa soru fotoğraflarından örnekleri açarak aktarımı
   doğrula. PWA'yı veya verilerini bu doğrulama için kaldırmak gerekmez.
4. Aşağıdaki testlerde süreyi yalnız APK'dan başlat. PWA'da ayrıca başlatılan
   oturum ayrı bir Chrome bildirimi üretir ve APK'yla ortak bir sayaç değildir.

## Fiziksel cihaz kontrol listesi

Her denemede APK kaynak commit'ini, Android/MagicOS sürümünü ve görülen sonucu
kaydet. Henüz yapılmayan adımları geçti olarak işaretleme.

| Senaryo | Beklenen sonuç |
| --- | --- |
| İlk açılış / bildirim iznini reddet | İzin kendiliğinden açılmaz; izin reddedilse de uygulama içindeki odak sayacı çalışır. |
| Sistem ayarlarından izin ver, tekrar aç | Odak ekranı güncel izni algılar; sonraki oturum bildirimi görünür. |
| Pomodoro başlat, ana ekrana dön | Bildirimde kalan süre ilerler; küçük simge şeffaf zeminli görünür. |
| Perde açıkken Duraklat'a bas | Süre durur, düğme Devam et olur; Activity veya uygulama ana ekranı açılmaz. Perdenin açık kaldığını cihazda ayrıca kaydet. |
| 20 saniye bekle, Devam et'e bas | Süre kaldığı yerden devam eder; beklenen 20 saniye çalışılmış süreye eklenmez. |
| Kronometrede aynı akışı dene | Artan süre ve duraklama tutarlıdır; Pomodoro ile karışmaz. |
| Bildirim gövdesine dokun | APK doğrudan Odak ekranını açar. Başka ekran zorla açılmaz. |
| Uygulamayı arka plandayken süreçten çıkar, bildirim düğmesini kullan | Kayıt kaybolmaz; receiver durumu günceller. Tekrar açılışta süre ve durum bildirimle eşleşir, çalışma dakikası iki kez yazılmaz. |
| Uygulama kapalıyken bildirim gövdesine dokun | Soğuk açılış Odak ekranına gelir; bekleyen açma isteği bir kez tüketilir. |
| Sayacı sıfırla, yeni oturum başlat | Eski bildirimin gecikmiş eylemi yeni oturuma uygulanmaz; tek güncel bildirim kalır. |
| Bitiş zamanını arka planda geçir | Süre yeniden başlamaz; açılışta mevcut uygulamanın bitiş/kayıt akışı bir kez yürür. Arka plan bitiş bildiriminin zamanını ayrıca kaydet. |
| Bildirimi kaldır, uygulamaya dön, görünürlüğü birkaç kez değiştir | Aynı oturum bildirimi sürekli geri gelmez; uygulamadaki sayaç kullanılabilir. |
| Bildirim iznini çalışan oturum sırasında kapat | Hata uygulamayı durdurmaz; izin durumunu güncel olarak gösterir. |
| Live Update izni açık | Gerçek terfi/kapsül durumu gözlenir. Destek bilgisi tek başına başarılı kapsül testi sayılmaz. |
| Live Update izni kapalı veya kapsül gösterilmiyor | Normal bildirim ve düğmeleri çalışır; kapsül varmış gibi durum gösterilmez. |
| Uygulama içinden Cihaz verilerini sil | Sayaç, kalıcı yerel odak kaydı, bildirim ve varsa bitiş alarmı temizlenir; tekrar açılışta eski oturum dirilmez. Yalnız test verisiyle dene. |
| PWA'ya geri dön | Web sayaçları, izin akışı ve Duraklat / Devam et bildirimi önceki gibi çalışır. |

**Süreç kapatma ile zorla durdurma farklıdır.** Android Ayarlar'daki
**Zorla durdur**, Android'in uygulama bildirimlerini/alarmlarını engellemesine
yol açabilir; bu durumda arka planda çalışma sözü verilmez. Cihazı yeniden
başlattıktan sonra oturumu geri yüklemek için uygulamanın açılması gerekir;
açılışta çalışan bir sistem servisi eklenmez. Saat ayarı değiştirmek ve pil
tasarrufu ayrıca denenmelidir. Kesin
alarm izni istenmeyen bir çözümde Doze sırasında bitiş uyarısı tam saniyesinde
gelmeyebilir; bildirimin süre hesabı ile uyarının teslim zamanı farklıdır.

## Doğrulama kapsamı

- CI, web release kapısından sonra Android lint, yerel birim testleri ve
  `assembleDebug` çalıştırır; ayrıca uygulamanın gerçek Android test APK'sını
  `:app:assembleDebugAndroidTest` ile derler. İzole Android 16 / API 36
  emülatöründe altı instrumentation testini yürütür: gerçek bildirim eylemleri,
  silme, eski oturum ve paketlenmiş WebView/Capacitor köprüsü bu kapsamdadır.
  Açılış beklemesi 240 saniye, test komutu 10 dakika ile sınırlıdır. Başarısızlık
  halinde de çalışma zamanı raporları ve logcat saklanır; emülatör kapatılır.
  APK ZIP bütünlüğü, APK imzası, SDK/paket kimliği ve debug çeşidi doğrulanmadan
  artefakt yüklenmez.
- Web köprüsü testleri ve Android durum testleri; olay sırası, kalıcı kayıt,
  duraklama/devam ve geçersiz eski eylemler için otomatik kanıt sağlar.
- Bu belge bir test planıdır. Fiziksel HONOR perdesi, kapsül, kilit ekranı,
  pil tasarrufu ve süreç kapatma sonuçları cihaz denemesi yapılmadan doğrulanmış
  sayılmaz. İlgili PR'a gerçek sonuçlar ayrıca yazılmalıdır.

11 Ekim 2026 yerel doğrulamasında Android instrumentation testleri derlendi.
Yüklü API 37.1 imajıyla izole ve görünmez emülatör denendi; Windows sanallaştırma
desteği çalıştı ancak cihaz ADB'de çevrimiçi duruma geçmedi. Deneme emülatörü
kapatıldı. Altı testin API 36 CI sonucu ilgili PR'dan doğrulanmalıdır; gerçek
HONOR kontrol listesi ayrıca bekliyor. Derleme başarısı çalışma zamanı başarısı
olarak sayılmıyor.

## Platform kaynakları

- [Android Live Updates koşulları ve gerçek terfi kontrolü](https://developer.android.com/develop/ui/views/notifications/live-update)
- [Android 16 bildirim terfisi isteği](https://developer.android.com/reference/android/app/Notification.Builder#setRequestPromotedOngoing(boolean))
- [HONOR Magic Capsule desteği](https://www.honor.com/global/support/content/en-us15873103/)
- [Resmi emülatör komutları](https://developer.android.com/studio/run/emulator-commandline)
- [Android testlerini komut satırından çalıştırma](https://developer.android.com/studio/test/command-line)
