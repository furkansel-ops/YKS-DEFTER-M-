# YKS Defterim güvenilirlik denetimi · 25 Eylül 2026

18 Eylül'de başlayan denetim, GitHub güncellemelerinin ardından 25 Eylül'de `63ef0819cd0088d4ba118a5e9dfcffc5806597e5` tabanı üzerinde sürdürüldü. Uygulama 4.4.0 / build 4.4.0-r2, veri şeması 21. İnceleme ana öğrenci uygulamasının veri katmanı, Firebase senkronizasyonu, koç komutları, hesap modülleri, PWA önbelleği ve Android/CI yayın sözleşmelerini kapsar.

## Düzeltilen davranışlar

| Alan | Hata ve düzeltme |
| --- | --- |
| Koç paylaşımı uyumluluğu | Güncel tabanın program v3 satır haritaları ve `setDoc` yazım akışı korunur. Her paylaşım güncel yerel programı taşır; birleştirme yazımı başarısızsa güncel şemayla belgeyi yeniden kuran mevcut davranış sürer. |
| Koç görev tarihi | Tarih metni, sayısal hafta uzaklığı bekleyen `addToDay` işlevine aktarılıyordu. Geçmiş/gelecek hafta ve yerel gün doğru hesaplanır; olmayan takvim günleri reddedilir. |
| Oturum değişimi | Geciken profil ve paylaşım sonuçlarının yeni hesabın durumunu değiştirmesi engellenir. |
| Bulut yükleme | Snapshot hazırlanırken ikinci yükleme başlamaz. Yükleme sırasında yapılan yeni yerel değişikliklerin dirty işareti erken temizlenmez; sıradaki yükleme bekletilir. Yüklemenin kullanıcı/oturum kimliği sabitlenir; eski yükleme yeni hesabın verisini veya kilidini değiştirmez. Çakışma birleştirmesinde arada değişen yerel snapshot yeniden okunur. |
| Şema koruması | Daha yeni şemaya sahip IndexedDB veya yerel kopya, eski uygulamanın uzlaştırma/kaydetme/buluta okuma/dış veri uygulama yollarında ezilmez. |
| Yedek doğrulama | İlgisiz JSON, hatalı şema türü ve desteklenmeyen yedek biçimi kontrollü reddedilir. Tanınan eski yedekler ve bilinmeyen uygulama alanları korunur. |
| Geri yükleme | Dış veri çalışma zamanına uygulanamazsa veya normalize edilmiş ikinci yazım başarısızsa önceki IndexedDB ve yerel kopyalar geri yüklenir; kurtarma başarısızlığı başarı diye gösterilmez. |
| Hesap yükleme hatası | Ayarlar modülünün erken ve bağımsız yüklenmesi korunur. Yükleyiciye ait `__YKS_ACCOUNT_LOADER_READY__`, köprünün paylaşılan hazır olma işareti yüzünden hesap sarmalayıcılarının atlanmasını önler. Başarısız hesap modülü zinciri kullanıcıya kurtarma düğmesi sunar. Düğme yerel kayıt ve bekleyen veri yazımlarını tamamladıktan sonra sayfayı yeniler; modül bağımlılıkları ve hesap kancaları temiz bir sayfada yeniden kurulur. |
| Ayarlar betiği sözdizimi | `settings-profile-runtime.js` içindeki CSS ve HTML şablonlarının açılış/kapanış işaretlerinden önce kalan dört ters eğik çizgi betiğin ayrıştırılmasını engelliyordu. Bu karakterler kaldırılır; tasarım ve içerik korunur. Altı üst düzey public JavaScript dosyasının modül sözdizimi çalıştırılmadan denetlenir. |
| PWA güncelleme | Eksik dosya/HTTP hatası/varlık yazım hatası çalışan önbelleği silmez. Çekirdek varlıklar `Cache.addAll` ile birlikte doğrulanır; yeni HTML varlıklarından sonra kaydedilir. Bağlı script/link adresleri ve sorgu parametreleri önbelleğe dahil edilir. |
| İlk çevrimdışı açılış | İlk sayfa açılışında worker kontrolü başlamadan yüklenen başlangıç modülleri de build'in `offline-startup-assets.json` listesiyle hazırlanır. Liste ilgili hash'li HTML girişine bağlıdır; eksik/yanlış liste eski kabuğu değiştirmez. Hesap yükleyicisinin istediği `settings-profile-runtime.js?v=2.6.0` adresi de aynı sorgu parametresiyle çekirdek önbelleğe eklenir; ilk çevrimdışı Ayarlar açılışındaki eksik önbellek girdisi giderilir. Atlas/3B ve etkileşimle açılan bilim araçları bu başlangıç listesine alınmaz. Yeni başlangıç modülü eklenirse `OFFLINE_STARTUP_MODULES` listesi güncellenmelidir. |
| Android yayın hattı | Capacitor doğrulaması kurulu 8.5.2 sürümüyle eşleştirildi; AAB sürüm kodu ve dosya adı yayın meta verisinden türetilir. İmzalı yayın korumaları korunur. |
| Derleme ve bakım | Windows CRLF kaynakları Firebase dönüşümünden önce normalize edilir. CI'da yinelenen altyapı/tür/test kontrolleri kaldırılır; aynı doğrulama kapıları bir kez çalışır. |
| Başlangıç paketi | Kurtarma merkezinin statik stilleri JavaScript içinden CSS dosyasına taşınır. Veri/kurtarma kodu aynı anda hazır kalırken ana JavaScript küçülür; 260.000 bayt sınırı korunur. |
| Gerçek sürüm denetimi | Classic açılışın eski sürüm etiketini sonradan yazması düzeltilir. Tarayıcı self-test'i güncel sürüm, build, legacy çekirdek ve PWA sözleşmelerini kontrol eder; kaldırılmış eski banner'a bağımlı kalmaz. |
| Eski script yükleyicisi | Hatalı kapanış etiketi üreten `document.write` sonraki kararlılık script'ini yutuyordu. Katalog doğrudan, sıralı bir HTML script etiketiyle yüklenir; odak kurtarma ve güvenli çizim işlevleri tekrar çalışır. |
| Stil bağımlılıkları | Yerel CSS `@import` adreslerindeki sorgu ekleri Vite'ın dosyaları içeri almasını engelliyor ve `/assets/` altında 404 üretiyordu. Sorgusuz kaynak importları tek hash'li üretim CSS'sine derlenir; kalan yerel CSS importlarının dosya hedefleri üretim doğrulamasında denetlenir. |
| Sistem Sağlığı | Eski söz arşivindeki tekrarlar güncel motivasyon ekranını hatalı gösteriyordu. Tanılama artık kullanılan yedek söz havuzunu ve gösterilen sözü denetler; anonim sözlere izin verir, boş/yinelenen/bozuk havuzları reddeder. Söz içerikleri korunur. |

## Doğrulama

Davranış testleri program v3 haritaları ve güncel yerel programın paylaşılması, hafta/tarih hesabı, geç oturum sonuçları, üretim Firebase dönüşümündeki yükleme yarışları, şema/yedek/geri alma, hesap kurtarma ve service worker önbelleğini kapsar. Public betiklerin sözdizimi ayrıca denetlenir. Otomatik testlerde kalıcı öğrenci verileri yerine bellek hedefleri kullanılır; tarayıcı testi izole bir profil için hazırlanmıştır.

```sh
npm ci
npm run release:check
```

25 Eylül çalışma ağacında doğrulanan sonuçlar:

| Kontrol | Sonuç |
| --- | --- |
| Node 22 testleri | 558/558 geçti. |
| Node 24 testleri | 558/558 geçti. |
| Node 24 `npm run release:check` | Geçti. |
| Ana JavaScript paketi | `256686` bayt; `260000` bayt sınırının altında. |
| Bağımlılık denetimi | Üretim bağımlılıklarında bildirim yok; geliştirme zincirinde üç orta seviye bildirim var. |
| Gerçek tarayıcı testi | 29 sürüm ve 9 altyapı kontrolü, 8 çevrimiçi/çevrimdışı ekran, Ayarlar, kayıt korunması ve başarısız worker güncellemesi doğrulandı. 390 px görünümde yatay taşma ve yakalanmamış JavaScript hatası yok. |
| Android CI | PR iş akışında Android lint/unit ile ayrıca çalışır; sonuç ilgili commitin GitHub Actions kaydından okunmalıdır. |

Tarayıcı testi gerçek öğrenci hesabı kullanmadan, izole profil ve sentetik veriyle çalıştırıldı. Firebase uzak modüllerine ağ erişimi ortamda kapalıydı; oturum/bulut senaryoları davranış testlerinde sahte hedeflerle doğrulandı.

Bu sonuçlar yerel çalışma ağacına aittir. Android lint/unit testi PR iş akışındadır; güncel commit üzerindeki CI sonucu ayrıca doğrulanmalıdır. İmzalı AAB üretimi, Play Console yüklemesi ve canlı Firebase kural dağıtımı bu denetimin parçası değildir.

## Sonraki aşamada ele alınacaklar

- Koç komutunun yerelde uygulanıp sunucu onayının yazılamaması yeniden uygulamaya yol açabilir. `save() === false` sonucu da tüm komutlarda denetlenmiyor. Kalıcı action kimliğiyle tekrar uygulamayı önleyen bir komut günlüğü gerekir.
- Çoklu sekmelerde eşzamanlı yazımlar için atomik sürüm karşılaştırması bulunmuyor. Dış veri uygulanırken başka bir yerel kayıt gelmesi ayrıca bütünleşik işlem tasarımı gerektirir. Bu değişiklikler çoklu sekme atomikliği iddia etmez.
- Depolama tamamen erişilemezse geri alma garanti edilemez; hata ve `rolledBack` sonucu doğru bildirilir. Doğrudan repository yazımı ve kullanılmayan eski migration API'si coordinator korumalarının dışında kalır.
- Güncel `npm audit` çıktısındaki üç orta seviye bildirim yalnız geliştirme bağımlılıklarında, aynı `@capacitor/cli → xcode → uuid` zincirindedir. `npm audit --omit=dev` üretim bağımlılıklarında bildirim bulmadı. İncelenen xcode çağrılarının UUID v4 kullandığı doğrulandı; bildirimlerin giderilmesi için uyumlu upstream güncellemesi takip edilmelidir.

`RELEASE.md` içindeki 31 Ağustos yerel AAB sonuçları tarihsel bir yayına aittir; bu denetimin güncel Android çıktısı olarak kullanılmamalıdır.
