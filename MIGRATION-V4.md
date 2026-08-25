# YKS Defterim v4 Geçiş Planı

Bu dal, çalışan v3 uygulamasını bozmadan yeni altyapıya kademeli geçiş için kullanılır.

## Tamamlanan adım 14 — İlerleme analizi

- Dönem, net, ders, konu, tekrar ve çalışma ritmi hesapları tür güvenli `progress-analysis-service` içinde birleştirildi.
- Boş veya sınırlı veride kesin güçlü/zayıf ders yorumu yapılmıyor; yorumlar kayıt kanıtlarını gösteriyor.
- İlk görünüm altı temel alana indirildi, önceki ayrıntılı göstergeler veri kaybı olmadan açılır bölüme taşındı.

## Tamamlanan adım 1 — Vite + Vanilla TypeScript

- Vite geliştirme ve üretim derleme düzeni kuruldu.
- TypeScript `strict` ve ek güvenlik kontrolleriyle etkinleştirildi.
- `src/main.ts` geçiş başlangıç noktası eklendi.
- Mevcut JavaScript çalışma zamanı korunarak üretim paketine kopyalanıyor.
- GitHub Pages için göreli `base` yolu kullanılıyor.
- Mevcut Node regresyon testleri yeni `npm` komutlarına bağlandı.

Komutlar:

```bash
npm install
npm run dev
npm run typecheck
npm test
npm run build
npm run check
```

## Tamamlanan adım 2 — TypeScript arayüz köprüsü

- Ana ekran kimlikleri ve Daha alt panelleri sabit TypeScript türlerine taşındı.
- `go(...)` ve `setMoreTab(...)` çağrıları doğrulanan TypeScript yöneticilerinden geçiyor.
- Mevcut render işlevleri uyumluluk köprüsüyle korunuyor; görünüş ve kullanıcı verisi değişmedi.
- Ekran ve sekme bütünlüğü açılışta otomatik doğrulanıyor.
- Arayüz geçişleri izlenebilir özel olaylar yayımlıyor.
- Üretim paketinin TypeScript ve eski çalışma zamanı dosyalarını birlikte içerdiği otomatik denetleniyor.

## Tamamlanan adım 3 — TypeScript veri sözleşmesi

- Şema 21 ana kayıt sözleşmesi TypeScript tipleriyle belgelendi.
- Konular, denemeler, odak oturumları, soru bankası, öğrenme kartları ve laboratuvar kayıtları tür güvenli hale getirildi.
- Kullanılan yerel kayıt anahtarları tek bir sabit listede toplandı.
- JSON okuma/yazma, boyut sınırı ve gelecek şema koruması tek bir veri katmanında toplandı.
- `window.__YKS_DATA__` uyumluluk köprüsü eklendi; mevcut `localStorage` kayıt biçimi ve kullanıcı verisi değiştirilmedi.
- Dexie veya IndexedDB henüz etkinleştirilmedi.

## Tamamlanan adım 4 — Dexie ve otomatik IndexedDB taşıması

- Dexie 4 ve `yks-defterim-v4` IndexedDB veritabanı eklendi.
- Şema 21 ana JSON kaydı uygulama açılışında otomatik olarak IndexedDB'ye kopyalanıyor.
- Taşıma işlemi atomik transaction içinde yapılıyor ve yazılan JSON/hash tekrar okunarak doğrulanıyor.
- Aynı veri yeniden yazılmıyor; `localStorage` değişmişse IndexedDB kopyası güvenle yenileniyor.
- Bozuk JSON veya daha yeni şemadaki kayıt IndexedDB'nin üzerine yazılmıyor.
- Eski `localStorage` verisi silinmiyor ve uygulamanın çalışan kayıt yolu bu adımda değiştirilmedi.

## Tamamlanan adım 5 — Dexie ana kayıt ve güvenli yerel ayna

- Dexie kalıcı ana kayıt haline getirildi; `localStorage` senkron uyumluluk aynası olarak korunuyor.
- Mevcut `save()` akışı write-through köprüsüyle sıralı olarak Dexie'ye yazılıyor.
- Dexie ve yerel ayna farklıysa hash ve güvenilir zaman damgasıyla daha yeni kayıt seçiliyor.
- İzlenmeyen eski `localStorage` değişikliklerinde veri kaybını önlemek için yerel kayıt öncelikli kabul ediliyor.
- IndexedDB açılamazsa uygulama `localStorage` aynasından çalışmayı sürdürüyor.
- Dexie kaydı daha yeniyse doğrulanıp çalışan `S` durumuna ve yerel aynaya uygulanıyor.
- Firebase'den gelen doğrudan kayıtlar da Dexie write-through kuyruğuna bağlandı.

## Tamamlanan adım 6 — Firebase ve Dexie ana kayıt bağlantısı

- Firebase yüklemesi bekleyen Dexie write-through kuyruğunu tamamladıktan sonra ana kaydı okuyor.
- Buluta giden JSON doğrudan Dexie veri katmanında oluşturuluyor.
- Yerel kronometre çalışma durumu ve YouTube anahtarı bulut verisinden ayrıştırılmaya devam ediyor.
- Buluttan gelen kayıt önce Dexie'ye atomik ve doğrulanmış biçimde yazılıyor, ardından çalışan uygulama durumuna uygulanıyor.
- IndexedDB kullanılamazsa bulut yüklemesi güvenli `localStorage` aynasına geri düşüyor.
- Mevcut Firestore revision, transaction, parça ve hash çakışma korumaları korunuyor.

## Tamamlanan adım 7 — TypeScript ekran modülleri

- Bugün, Program, Konular, Denemeler, İlerleme, Odak ve Daha ekranlarının açılış/yenileme sırası ayrı TypeScript modüllerine taşındı.
- Ekran seçimi, sekme durumu, geniş Program görünümü ve ekran başlığı TypeScript yöneticisinden çalışıyor.
- Program ve Denemeler ekranlarının ağır ikincil çizimleri mevcut gecikmeli çalışma düzenini koruyor.
- Eski çizim işlevleri güvenli uyumluluk katmanı olarak tutuldu; bir TypeScript ekranı hata verirse eski ekran yolu devreye giriyor.
- Bulut veya IndexedDB kaydı uygulandığında aktif ekran TypeScript çalışma zamanı üzerinden yeniden çiziliyor.
- HTML, CSS, kullanıcı arayüzü ve veri şeması değiştirilmedi.

## Tamamlanan adım 8 — Ortak TypeScript servisleri

- Tarih anahtarı, tarih doğrulama, gün ekleme, haftanın pazartesini bulma ve gün farkı hesapları saf TypeScript tarih servisine taşındı.
- Deneme neti, iki ondalık yuvarlama ve kayıt toplamları saf TypeScript sayı servisine taşındı.
- Çalışma süresi, güvenli HTML metni ve sabit renk tonu üretimi saf TypeScript biçimlendirme servisine taşındı.
- Mevcut JavaScript ekranlarının kullandığı 15 global yardımcı TypeScript servislerine bağlandı.
- Eski yardımcılar açılış güvenlik yolu olarak korundu; kullanıcı arayüzü ve veri şeması değiştirilmedi.
- Saf servisler eski sonuçlarla eşdeğerlik testlerine bağlandı.

## Tamamlanan adım 9 — Tür güvenli alan servisleri

- Konu anahtarı, konu durumu, güven seviyesi, ders ilerlemesi ve genel konu yüzdesi TypeScript konu servisine taşındı.
- Aralıklı tekrar kuyruğu oluşturma ve tekrar tamamlama işlemleri aynı alan servisinde toplandı.
- Toplam soru, toplam odak dakikası, tamamlanan konu/tekrar ve günlük odak oturumları TypeScript çalışma servisine taşındı.
- Güncelleme işlemleri mevcut `save()` zincirini kullanarak Dexie ana kayda ve güvenli yerel aynaya yazılmaya devam ediyor.
- Eski JavaScript çağrıları 15 tür güvenli alan yardımcısına bağlandı; geçersiz eski çağrılar için uyumluluk geri dönüşü korundu.
- Veri şeması ve kullanıcı arayüzü değiştirilmedi.

## Tamamlanan adım 10 — v4 sürüm adayı

- Paket sürümü `4.0.0-rc.1` olarak hazırlandı.
- Tarayıcı içi kontrol; bootstrap, bütün TypeScript köprüleri ve yedi ana ekran geçişini doğruluyor.
- Mevcut şema 21 kaydı Dexie'ye yazılıp tekrar okunuyor; IndexedDB kaydı ve hash bilgisi denetleniyor.
- Firebase yükleme verisi ve Dexie-first indirme yolu mevcut kaydın güvenli kopyasıyla sınanıyor.
- Firestore transaction, revision, conflict, parça ve hash korumalarının üretim paketinde kaldığı doğrulanıyor.
- Eski v3 release self-test katmanı yeni v4 kontrolleriyle birleştirildi.
- Tek komutluk `release:check` doğrulaması ve sürüm adayı raporu eklendi.

## Tamamlanan adım 11 — altyapı sağlamlaştırma

- Dexie kayıt yakalamasında doğrulanmamış eşitleme damgası güncellemesi engellendi.
- Hata ve değişmeyen kayıt yolları regresyon testlerine bağlandı.
- GitHub Actions sürümleri güncellendi; bağımsız CI, zaman aşımı ve canlı Pages doğrulaması eklendi.
- Eski dinamik Pages yayını başarısız olursa Vite yayınının devam etmesi engellendi.

## Tamamlanan adım 12 — v4 kararlı sürüm

- Paket ve çalışma zamanı sürümü `4.0.0` olarak sabitlendi.
- Geçici sürüm adayı API adları kararlı sürüm adlarıyla değiştirildi.
- Kararlı kanal işareti bootstrap, üretim paketi ve canlı yayın kontrollerine eklendi.
- Uygulama sürümü `4.0.0`; 13. aşama güvenli yedekleme paketi için PWA önbelleği ve eski modül URL'leri `4.0.0-r13` yapı kimliğiyle yenilendi.
- Veri şeması 21 ve kullanıcı verileri değişmeden korundu.

## Sıradaki işlem

Kullanıcı onayıyla v4 sonrası özellik geliştirme aşamasına geçmek.
