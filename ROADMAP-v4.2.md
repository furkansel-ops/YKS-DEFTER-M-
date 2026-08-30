# YKS Defterim v4.2.0 Yol Haritası

v4.2.0'ın amacı mevcut güçlü altyapıyı daha akıllı, daha güvenli ve daha hızlı günlük YKS kullanımına dönüştürmektir.

## Değişmez kurallar

- Program tamamen manuel kalır. Hiçbir analiz, öneri veya tekrar sistemi Program'a otomatik görev ekleyemez, silemez veya düzenleyemez.
- Şema 21 verileri geriye dönük uyumlu tutulur; veri kaybı yaratacak migrasyon yapılmaz.
- Dexie ana kayıt + güvenli localStorage aynası + Firebase senkronu korunur.
- PWA çevrimdışı kullanım ve tablet/PC desteği release kapısı olmaya devam eder.
- Biyoloji Atlası 9 organ / 52 yapı sözleşmesini korur; mevcut 3B etkileşimler geriye dönük bozulmaz.

## Aşama 1 — Hızlı erişim ve global arama ✅

**Durum:** Tamamlandı.

- Uygulama genelinde konu, deneme, hata kaydı ve Öğrenme Laboratuvarı içeriğini tek aramada bulabilen hızlı arama.
- Klavye ile açılabilen komut/arama paneli; tablette dokunmatik kullanım için büyük hedefler.
- Son kullanılan ekranlar ve sık kullanılan içerikler için hızlı dönüş kısayolları.
- Arama yalnız yönlendirir; hiçbir veriyi kendiliğinden değiştirmez.

## Aşama 2 — Akıllı Tekrar Merkezi 2.0 ✅

**Durum:** Tamamlandı.

- Tekrar önerileri hata sıklığı, son çalışma tarihi, güven seviyesi, deneme yanlışları ve konu sağlık durumu ile yeniden sıralanır.
- Her öneride açıklanabilir neden gösterilir: “3 farklı günde yanlış”, “14 gündür tekrar edilmedi”, “son denemede yanlış” gibi.
- Kullanıcı öneriyi `Tamamladım` veya `3 gün ertele` ile yönetebilir; yeni yanlış kanıtı gelirse tamamlanan öneri yeniden aktifleşebilir.
- Tamamlanan/ertelenen durumları uygulama verisinde saklanır; Dexie/localStorage/Firebase veri hattıyla birlikte korunur.
- Program'a otomatik ekleme kesinlikle yoktur.

## Aşama 3 — Hata Defteri ↔ Konular ↔ Laboratuvar bağlantısı ✅

**Durum:** Tamamlandı.

- Hata kaydından ilgili Konu sayfasına ve varsa Laboratuvar konu rehberine tek dokunuşla geçiş.
- Aynı konudaki tekrar eden yanlışların tarih bazlı zaman çizgisi.
- Hata Defteri 3.0 düzeltme notlarının konu detayında salt okunur özeti.
- Denemeden Hata Defteri'ne aktarılan aynı kayıt zaman çizgisinde iki kez sayılmaz.

## Aşama 4 — Deneme Analizi 3.0 ✅

**Durum:** Tamamlandı.

- Aynı türde son 5 / 10 denemeyi seçilebilir seri olarak karşılaştırma.
- Toplam nette ortalama, aralık, seri değişimi ve standart sapma ile istikrar görünümü.
- Ders bazlı son net, seri değişimi ve dalgalanma görünümü.
- Denemeye bağlanmış yanlışların konu bazlı yoğunluk haritası.
- “Net arttı ama aynı hata devam ediyor” gibi açıklanabilir sinyaller yalnız kayıtlı veriden üretilir.
- Gelecek net veya sınav sonucu için tahmin/garanti üretilmez ve Program'a otomatik görev eklenmez.

## Aşama 5 — İlerleme 3.0 ✅

**Durum:** Tamamlandı.

- Son 7 gün / önceki 7 gün ve son 30 gün / önceki 30 gün çalışma sürekliliği; aktif gün, çalışma süresi ve soru farkları birlikte gösterilir.
- Ders bazlı son 30 günlük çalışma süresi ile aynı dönemin deneme net ortalaması birlikte karşılaştırılır.
- Öğreniliyor / pekiştiriliyor / hazır / tekrar gerekli konu dağılımı günlük sağlık snapshotlarıyla zaman içinde izlenir; v4.2 öncesi geçmiş uydurulmaz.
- Konu sağlık snapshotları en fazla 120 gün tutulur; ekranda en fazla 8 ders ve 14 sağlık günü çizilerek DOM yükü sınırlandırılır.
- İlerleme analizi Program verisini değiştirmez.

## Aşama 6 — Öğrenme Laboratuvarı 2.0 kullanım akışı ✅

**Durum:** Tamamlandı.

- Laboratuvar ana yüzeyine `Kaldığın yer` ve `Favoriler` hızlı erişim alanı eklendi.
- Son açılan konu, organ, Bilim Kartı, element ve kronoloji kaydı `S.lab.flowV42` altında tutulur; son 12 benzersiz içerik korunur.
- Atlas'ın 9 organı gerçek AYT Biyoloji konu rehberlerine bağlandı.
- 3B anatomi modelleri PWA çekirdek kurulumuna alınmadı; yalnız kullanıcı Atlas/organ görünümünü açtığında lazy-load ile yüklenir. 9 organ / 52 yapı sözleşmesi değişmedi.
- İlerleme 3.0'ın çalışma zamanı loader bağlantısı tamamlandı.
- Laboratuvar akışı Program verisini değiştirmez.

## Aşama 7 — Veri güvenliği ve kurtarma 2.0 ✅

**Durum:** Tamamlandı.

- Yedek içe aktarmadan önce kayıt tarihi, uygulama sürümü, şema, dosya boyutu ve bütünlük durumu erişilebilir önizleme penceresinde gösterilir.
- Yedekteki çalışma günü, deneme, konu ve kart sayıları mevcut ana kayıtla karşılaştırılır.
- Geri yükleme yarıda kalıp ana kayıt değişmişse bridge önceki kaydı otomatik geri almaya çalışır.
- Veri & Sistem ekranına `Kurtarma Merkezi` eklendi; Dexie/localStorage uzlaştırması ve Firebase/bulut bekleyen değişiklik durumu görünür.
- Başarılı yedek geri yüklemesi bulut kaydını kirli işaretler.
- Write-tail/dirty son-yazı koruması ve rollback regresyon testleri korunur.

## Aşama 8 — v4.2.0 final kalite kapısı ✅

**Durum:** Tamamlandı — v4.2.0 kararlı sürüm kapatıldı.

- Kararlı sürüm kimliği `4.2.0`, build `4.2.0-r1`, veri şeması `21` olarak merkezileştirildi.
- Büyük legacy `app.js` veri/regresyon güvenliği için `4.1.0-r20` uyumluluk çekirdeği olarak bilinçli biçimde korundu; TypeScript release katmanı gerçek v4.2 kimliğini, güncelleme karşılaştırmasını ve tarayıcı self-test kapısını yönetir.
- PWA cache çizgisi `yks-core-v4.2.0-r1` seviyesine taşındı; eski `r20…r40` cache ailesi kontrollü temizleme soyunda tutulur.
- Node 22 ana kapısı ve Node 24 uyumluluk kapısı başarıyla geçti.
- TypeScript strict kontrolü ve **235/235 regresyon testi** başarıyla geçti.
- Production build, üretim paket bütünlüğü, 27 sabit SHA-256 anatomi varlığı, Atlas lazy-load sınırı ve kaynak bütçeleri doğrulandı.
- Programın manuel kalması, Atlas 9 organ / 52 yapı sözleşmesi, 3B model lazy-load, Dexie/localStorage/Firebase hattı, yedek rollback ve büyük veri DOM sınırları regresyonlarla korundu.
- GitHub Pages build, deploy ve canlı sürüm doğrulaması başarıyla geçti.

## Uygulama sırası

1. Global arama ✅
2. Akıllı Tekrar Merkezi 2.0 ✅
3. Hata Defteri bağlantıları ✅
4. Deneme Analizi 3.0 ✅
5. İlerleme 3.0 ✅
6. Öğrenme Laboratuvarı kullanım akışı ✅
7. Veri güvenliği 2.0 ✅
8. Final kalite taraması ✅

**v4.2.0 yol haritasındaki 8 aşamanın tamamı kapatıldı.**
