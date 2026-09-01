# Google Play Data Safety · teknik çalışma kağıdı

> Bu dosya Play Console'a doğrudan kopyalanacak kesin cevap değildir. Google'ın soru metinleri ve tanımları değişebilir; son cevap yalnız yüklenmek üzere imzalanmış AAB, bağımlılık/izin envanteri ve gerçek ağ gözlemiyle verilmelidir.

Google'ın resmî açıklamasına göre cihaz içinde kalan veri Data Safety kapsamında “toplanan” veri değildir. Buna karşılık cihaz dışına iletilen kullanıcı verisi, yalnız geçici işleniyor olsa bile form değerlendirmesine girebilir. Kullanıcının açıkça başlattığı ve makul biçimde beklediği üçüncü taraf aktarımı bazı “paylaşım” beyanlarından istisna olabilir; bu ayrım otomatik varsayılmamalıdır.

- [Google Play Data Safety formu yönergesi](https://support.google.com/googleplay/android-developer/answer/10787469)
- [Google Play User Data politikası](https://support.google.com/googleplay/android-developer/answer/10144311)
- [Google Play hesap silme gereksinimi](https://support.google.com/googleplay/android-developer/answer/13327111)

## 1. Son kaynak denetiminde görülen yerel veriler

Uygulama aşağıdaki içerikleri işlevlerini sağlamak için cihaz içinde işleyebilir:

- İsteğe bağlı profil/görünen ad ve uygulama tercihleri
- Program, konu ilerlemesi, deneme sonuçları, yanlış/hata kayıtları
- Odak oturumları, soru/çalışma kayıtları ve kişisel notlar
- Hedefler, favoriler ve Öğrenme Laboratuvarı ilerlemesi
- Kullanıcının eklediği kaynak adları, bağlantılar ve oynatma listesi kimlikleri
- Kullanıcı eklerse kişisel YouTube Data API anahtarı
- Yerel JSON yedekleri, kurtarma kayıtları ve uygulama cache'leri
- Kullanıcının açıkça başlattığı Markdown, ICS, Anki uyumlu metin, PNG çalışma kartı ve rapor dışa aktarımları/paylaşımları

Ana depolar IndexedDB/Dexie ve uygulama local storage alanıdır. Kaynak denetiminde bu çalışma kayıtlarını YKS Defterim geliştiricisinin işlettiği bir backend'e gönderen aktif bir hesap, auth veya bulut senkronu bulunmaması hedeflenir. Bu cümle, üçüncü taraf ağ isteklerinin olmadığı anlamına gelmez ve son AAB üzerinde doğrulanmalıdır.

## 2. Cihaz dışına çıkabilen kullanıcı başlatmalı istekler

### Wikipedia / Wikimedia

Kullanıcı periyodik tabloda element medyasını açtığında uygulama `tr.wikipedia.org` API'sine seçilen element başlığını gönderebilir. Dönen görsel ayrı bir Wikimedia alanından yüklenebilir. İstek çalışma planı veya deneme kayıtlarını bilinçli olarak eklemez; standart ağ bağlantısı nedeniyle IP adresi, user-agent ve benzeri bağlantı metadatası karşı hizmetçe görülebilir.

### YouTube / Google

- Kullanıcı video aramasını açarsa YouTube arama sayfası açılabilir.
- Kullanıcı kendi YouTube Data API anahtarını kaydedip uygulama içi arama kullanırsa anahtar; öğretmen, ders, konu veya kanal arama terimleriyle birlikte `www.googleapis.com/youtube/v3` adresine gönderilir.
- Kullanıcı bir video/oynatma listesi oynatırsa `www.youtube-nocookie.com` gömülü oynatıcısı yüklenir; YouTube'a geçiş yaparsa açık web sayfası açılır.
- Arama/oynatma sırasında Google/YouTube bağlantı metadatası ve hizmet koşullarında açıklanan diğer verileri işleyebilir. “Privacy-enhanced” alan adı tüm ağ/veri işleme riskini ortadan kaldırdığı şeklinde sunulmamalıdır.

Bu akışlar nedeniyle “uygulama hiçbir veriyi cihaz dışına iletmez” veya inceleme yapmadan “hiç veri toplanmıyor/paylaşılmıyor” cevabı verilmemelidir. Play Console'da özellikle **App activity / in-app search history**, **Web browsing**, **Device or other identifiers** ve kullanıcı tarafından sağlanan diğer veri türlerinin güncel tanımları kontrol edilmelidir. Hangi kutuların gerektiği; isteklerin kullanıcı tarafından başlatılması, açık web mi kontrol edilen WebView mı olduğu, üçüncü tarafın rolü ve veriyi nasıl sakladığına göre hesap sahibi tarafından belirlenir.

### Harici kaynak bağlantıları

MEB, OGM, ÖSYM, YouTube, GitHub destek sayfası veya kullanıcının kendi eklediği `https://` bağlantısı cihazın tarayıcısı/uygun uygulamasıyla açılabilir. Kullanıcı açık webde gezinirken hedef hizmet kendi gizlilik koşullarına tabidir. Uygulama, kişisel çalışma kayıtlarını bu bağlantıların URL'sine bilinçli olarak eklememelidir; son paket bu açıdan test edilir.

## 3. SDK ve first-party backend envanteri

Kaynak denetiminin doğrulaması gereken mevcut hedef durum:

- Reklam SDK'sı: yok
- Analytics SDK'sı: yok
- Crash reporting SDK'sı: yok
- Push/mesajlaşma SDK'sı: yok
- Kullanıcı hesabı / authentication: yok
- Geliştiriciye ait çalışma verisi backend'i: yok
- Firebase çalışma zamanı: Android yayın paketinde yok

Bu liste `npm` bağımlılık ağacı, Android Gradle bağımlılık raporu, merged manifest ve signed AAB içeriğiyle tekrar kontrol edilmeden Play Console cevabı sayılmaz.

## 4. Form için karar notları

### Veri toplama ve paylaşım

- Yalnız cihaz içinde işlenen çalışma verileri Play'in “on-device processing” istisnası kapsamında olabilir.
- Wikipedia ve YouTube akışları kullanıcı başlatmalı olsa da cihaz dışına veri aktarır. Aktarımın Data Safety kategorileri, amaçları, ephemeral processing ve sharing istisnaları son form tanımına göre tek tek değerlendirilmelidir.
- YKS Defterim geliştiricisinin veriyi almaması, üçüncü taraf SDK/API aktarımını otomatik olarak form dışı bırakmaz.
- Dışa aktarılan yedeği kullanıcının kendi seçtiği depolama/uygulamaya kaydetmesi ayrıca değerlendirilir; uygulama yedeği sonradan okumuyor veya geliştiriciye göndermiyorsa Google'ın kullanıcı kontrollü aktarım açıklaması dikkate alınır.

### Şifreleme ve silme

- “Aktarım sırasında şifrelenir” cevabı yalnız tüm cihaz dışı isteklerin HTTPS olduğu, cleartext trafiğin kapalı bulunduğu ve ağ testinde HTTP görülmediği doğrulanırsa seçilmelidir.
- Uygulama hesap oluşturmaz. Play Console'daki account creation sorusuna bu gerçek davranışa göre cevap verilir; çevrimiçi hesap silme URL'si varmış gibi beyan verilmez.
- Kullanıcı **Daha → Veri → Cihaz verilerini sil** ile uygulama içi yerel verileri silebilir. Android Ayarları'ndan uygulama depolamasını temizleme ve uygulamayı kaldırma da cihaz içi depoyu etkiler.
- Uygulama dışına aktarılmış JSON/yedek, Markdown, ICS, Anki uyumlu metin, PNG çalışma kartı ve rapor dosyaları otomatik silinmez. Kullanıcının seçtiği dosya/paylaşım hedefi ile Wikipedia, YouTube veya açılan diğer hizmetlerdeki verilerin saklama/silme politikası ilgili üçüncü tarafa aittir.

## 5. Signed AAB üzerinde zorunlu manuel doğrulama

1. Internal Testing için üretilecek signed AAB'yi temiz bir test cihazına kurun.
2. Android Studio Network Inspector, güvenilir bir proxy veya cihaz ağ günlüğüyle önce temiz açılışı gözlemleyin.
3. Hesap/auth, reklam, analytics, crash veya beklenmeyen telemetri alan adı olmadığını doğrulayın.
4. Program, Deneme, Odak, yedekleme ve silme akışlarını çalıştırın; çalışma kayıtlarının cihaz dışına çıkmadığını gözlemleyin.
5. Periyodik tablo element medyasını açın; Wikipedia/Wikimedia isteklerini kaydedin.
6. YouTube araması, kullanıcı API anahtarlı Data API araması, video ve oynatma listesi embed akışlarını ayrı ayrı test edin.
7. MEB/OGM/ÖSYM ve kullanıcı ekli dış bağlantıların uygulama içi WebView mı, sistem tarayıcısı mı açtığını kaydedin.
8. Merged manifestteki izinleri ve Android Studio App Inspection/Play SDK Index uyarılarını inceleyin.
9. Her alan adı için gönderilen parametreleri, header/cookie davranışını, veri kategorisini, amacı, saklamayı ve sağlayıcı rolünü bir tabloya kaydedin.
10. Privacy policy ile Data Safety formunu aynı signed commit/binary davranışına göre güncelleyin.

İlk gözlemde özellikle şu alan adları aranmalıdır: `tr.wikipedia.org`, Wikimedia görsel alanları, `www.googleapis.com`, `www.youtube-nocookie.com`, `www.youtube.com`, MEB/OGM/ÖSYM alanları ve kullanıcının açtığı özel bağlantılar. Beklenmeyen `firebase`, reklam, analytics veya crash alan adları bir yayın engelidir.

## 6. Hesap sahibinin tamamlayacağı maddeler

- Play Console'un o gün gösterdiği veri türleri/amaçları ve istisna metinleri
- YouTube ve Wikimedia'nın güncel hizmet/gizlilik koşullarına göre üçüncü taraf rolü
- Nihai yayıncı/geliştirici adı ve gizlilik iletişim kanalı
- Son ağ gözlem kaydı ve Data Safety beyanının gönderimi
- Yeni bir SDK veya özellik eklenirse formun yeniden değerlendirilmesi

Bu çalışma kağıdı hukuki görüş veya Google Play onayı garantisi değildir.
