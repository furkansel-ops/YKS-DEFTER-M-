# YKS Defterim v4.3.0 Yol Haritası

v4.3.0'ın ana hedefi yeni özellik yığmak değil; mevcut güçlü modülleri daha sade, daha hızlı ve tek bir çalışma akışı gibi hissettiren bir ürüne dönüştürmektir.

## Değişmez kurallar

- Program tamamen manuel kalır; hiçbir analiz veya öneri Program'a otomatik görev eklemez, silmez veya düzenlemez.
- Veri şeması 21 ve geriye dönük veri uyumluluğu korunur.
- Dexie ana kayıt + localStorage güvenli ayna + Firebase senkron hattı korunur.
- v4.3 geliştirmeleri release kapısından geçmeden kararlı yayına alınmaz.
- PWA/offline, tablet/PC desteği ve Biyoloji Atlası 9 organ / 52 yapı sözleşmesi release kapısıdır.

## Aşama 1 — Bugün 2.0 ✅

**Durum:** Tamamlandı.

- Ana ekran bilgi hiyerarşisi sadeleştirildi; sayaç/özet → Bugün kontrol merkezi → manuel program akışı öne çıkarıldı.
- Ayrıntılar ve ikincil araçlar açılır alanlara taşındı; çalışan legacy sözleşmeler korunuyor.
- Tablet/dar ekran ve azaltılmış hareket erişilebilirliği korundu.
- Katman çalışma verisine veya Program mantığına yazmıyor.
- Node 22/24, TypeScript strict, **238/238 test** ve production build geçti.

## Aşama 2 — Analiz Merkezi ✅

**Durum:** Tamamlandı.

- İlerleme 3.0 ve Deneme Analizi 3.0 tek üst seviye Analiz Merkezi görünümünde birleştirildi.
- 7/30 günlük çalışma, TYT/AYT/YDT net eğilimi, ders çalışma ↔ deneme başarısı ve kritik yanlış konu sinyalleri eklendi.
- Kanıt özeti yalnız kayıtlı veriyi kullanıyor; tahmin veya garanti üretmiyor.
- Analiz Merkezi salt okunur; Program ve veri katmanına yazmıyor.
- Node 22/24, TypeScript strict, **241/241 test** ve production build geçti.

## Aşama 3 — Hata → Öğren → Tekrar döngüsü ✅

**Durum:** Tamamlandı.

- `wrongLog`, `errorJournal` ve `manualReviews` kayıtları şema değiştirilmeden tek öğrenme döngüsünde birleştirildi.
- Deneme ekranına `Hata → Öğren → Tekrar → Kontrol` akışı eklendi.
- `Yeniden geldi`, `Tekrar ediyor`, `Tekrar bekliyor` gibi durumlar yalnız kayıtlı kanıttan üretiliyor.
- Hata Defteri, Konular, Öğrenme Laboratuvarı ve tekrar listesi birbirine bağlandı.
- Program'a veya çalışma verisine otomatik yazılmıyor.
- Node 22/24, TypeScript strict, **245/245 test** ve production build geçti.

## Aşama 4 — Öğrenme Laboratuvarı 3.0 / Quiz ✅

**Durum:** Tamamlandı.

- Biyoloji Atlası'na `Öğren` ve `Sınama` modları eklendi.
- 3B yapı sınaması en fazla 6 benzersiz yapı ile çalışıyor; YKS öncelikli yapılar öne alınıyor.
- Sınama sırasında cevap isimleri gizleniyor, dokunulabilir nötr hedefler korunuyor.
- Anlık doğru/yanlış, tur skoru ve sonuç yüzdesi yalnız oturum içinde tutuluyor.
- 9 organ / 52 yapı ve 3B lazy-load sözleşmesi korunuyor.
- Node 22/24, TypeScript strict, **249/249 test** ve production build geçti.

## Aşama 5 — Navigasyon + Daha temizliği ✅

**Durum:** Tamamlandı.

- Alt navigasyondaki `Daha`, çalışma anında `Merkez` olarak sadeleştirildi; yeni ana sekme eklenmedi.
- Merkez `Öğrenme`, `Analiz`, `Ayarlar`, `Veri & Sistem` kategorilerine ayrıldı.
- Mevcut `v30Action()` / `setMoreTab()` alt sayfaları korunuyor; eski kartlar silinmeden ana görünüm sadeleştirildi.
- Analiz Merkezi mevcut İlerleme ekranına yönleniyor; kopya ekran oluşturulmadı.
- Yeni navigasyon katmanı Program veya veri kayıtlarına yazmıyor.
- Node 22/24, TypeScript strict, **253/253 test** ve production build geçti.

## Aşama 6 — Kişiselleştirilebilir görünüm ✅

**Durum:** Tamamlandı.

- Merkez → Ayarlar içine Kişiselleştirme paneli eklendi.
- TYT / AYT / YDT görünürlük kapsamı ayrı ayrı yönetilebiliyor; en az bir sınav türü açık kalıyor.
- Kapsam Konular, Deneme, Laboratuvar, Odak ve Analiz Merkezi görünümünde birlikte uygulanıyor; kayıtlar silinmiyor.
- Bugün ekranındaki beş ikincil alan ayrı ayrı gösterilip gizlenebiliyor.
- Tercihler mevcut `studyPrefs.personalizationV43` + save zincirinde tutuluyor; şema 21 korunuyor.
- Node 22/24, TypeScript strict, **257/257 test** ve production build geçti.

## Aşama 7 — Legacy kod modülerleştirme ✅

**Durum:** Tamamlandı.

- Büyük `app.js` çekirdeği riskli toplu yeniden yazıma sokulmadı.
- Yedi ana ekranın legacy çizim çağrıları `src/ui/screens/legacy-adapters.ts` içindeki tipli adaptör sınırına taşındı.
- Ekran kayıtları `src/ui/screens/registry.ts` altında tek registry/Map içinde toplandı.
- Program ve Deneme çizim sıraları ile ertelenmiş performans işleri korundu.
- Modern Deneme, Öğrenme Döngüsü, Analiz Merkezi ve İlerleme katmanları legacy adaptörün dışında tutuldu.
- Adaptör/registry katmanı Program, Dexie, localStorage, Firebase veya çalışma verisine yazmıyor.
- Son doğrulamada Node 22/24, TypeScript strict, **261/261 test**, anatomy asset doğrulaması ve production build geçti.

## Aşama 8 — v4.3.0 final kalite kapısı ✅

**Durum:** Tamamlandı.

- Kararlı release runtime'a v4.3'ün yedi ana katmanı için gerçek çalışma zamanı kontrolleri eklendi: `Bugün 2.0`, `Analiz Merkezi`, `Öğrenme Döngüsü`, `Lab Quiz`, `Navigasyon/Merkez`, `Kişiselleştirme` ve `Odak oturum hazırlama kapısı`.
- Yedi v4.3 özellik modülü ana bootstrap'tan ayrıldı; çekirdek/veri/Firebase açılışından sonra ayrı `dynamic import()` + hata sınırlarında fail-open yükleniyor.
- Analiz Merkezi ve Öğrenme Döngüsü ekran modüllerinden statik olarak çıkarıldı; başlangıç paketine geri çekilmeleri regresyon testiyle engelleniyor.
- Her katman hem kurulum durumunu hem kendi `validate()` hata sayısını final self-test içinde doğruluyor.
- Production bundle doğrulayıcısı yedi v4.3 modülünün gerçekten ayrı lazy JavaScript chunk olarak üretildiğini denetliyor.
- Ürün release kimliği **4.3.0 / 4.3.0-r1 / şema 21** olarak merkezileştirildi; PWA cache **yks-core-v4.3.0-r1** oldu ve v4.2 cache soy temizliğine eklendi.
- Canlı GitHub Pages doğrulayıcısı ürün release kimliğini doğrudan `version.json` üzerinden kontrol ediyor; yanlış release, kaynak TypeScript yayını, bozuk UTF-8 ve yanlış service-worker cache kimliği reddediliyor.
- Yeni Sayaç veya Kronometre oturumunda ilk `Başlat` süreyi doğrudan çalıştırmıyor; `Oturumu hazırla` alanını öne getiriyor ve ders seçimini zorunlu kılıyor.
- Önceki/default ders sessizce kabul edilmiyor; kullanıcı bir derse dokunduktan sonra ikinci `Başlat` çalışma oturumunu başlatıyor.
- Duraklatılmış oturuma devam, Sayaç mola fazı ve Program/Konu üzerinden zaten ders bilgisiyle hazırlanan doğrudan başlangıçlar gereksiz seçim kapısına takılmıyor.
- Minimal modda yeni oturum başlatılmak istenirse Minimal görünüm kapanıyor ve `Oturumu hazırla` kartı görünür hale geliyor.
- Odak başlangıç kapısı Program'a, Dexie'ye, localStorage'a veya Firebase'e doğrudan yazmıyor; mevcut oturum kayıt sözleşmesini kullanıyor.
- Node 22 ana kalite kapısı ✅
- Node 24 uyumluluk kapısı ✅
- TypeScript strict ✅
- **278/278 regresyon testi ✅**
- 27 anatomy varlığı sabit sürüm + SHA-256 ile doğrulandı ✅
- Production Vite build: **100 modül başarıyla derlendi ✅**
- Üretim paket doğrulaması, release kimliği ve yedi lazy v4.3 chunk kapısı ✅
- Deploy workflow'u kaynak + production çıktısını tek `YKS-Defterim-v4.3.0-backup.zip` yedeği olarak üretir.
- Mevcut büyük Biyoloji Atlası model chunk uyarısı (>500 kB) bilinen lazy-load varlığıdır; başlangıç paketine dahil değildir ve final-gate hatası değildir.
- Merge sonrası Pages workflow'u production deploy ile birlikte canlı v4.3 release doğrulamasını zorunlu çalıştırır.

## Uygulama sırası

1. Bugün 2.0 ✅
2. Analiz Merkezi ✅
3. Hata → Öğren → Tekrar ✅
4. Laboratuvar 3.0 / Quiz ✅
5. Navigasyon + Daha temizliği ✅
6. Kişiselleştirilebilir görünüm ✅
7. Legacy modülerleştirme ✅
8. Final kalite kapısı ✅

**Durum: 8/8 tamamlandı. v4.3.0 final kalite kapısı yeşil; yayın paketi merge/deploy ve canlı doğrulama için hazırdır.**
