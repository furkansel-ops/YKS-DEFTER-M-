# YKS Defterim v4.3.0 Yol Haritası

v4.3.0'ın ana hedefi yeni özellik yığmak değil; mevcut güçlü modülleri daha sade, daha hızlı ve tek bir çalışma akışı gibi hissettiren bir ürüne dönüştürmektir.

## Değişmez kurallar

- Program tamamen manuel kalır; hiçbir analiz veya öneri Program'a otomatik görev eklemez, silmez veya düzenlemez.
- Veri şeması 21 ve geriye dönük veri uyumluluğu korunur.
- Dexie ana kayıt + localStorage güvenli ayna + Firebase senkron hattı korunur.
- v4.2.0 kararlı sürümü `main` üzerinde bozulmadan kalır; v4.3 geliştirmeleri `v4.3-dev` dalında ilerler.
- PWA/offline, tablet/PC desteği ve Biyoloji Atlası 9 organ / 52 yapı sözleşmesi release kapısı olmaya devam eder.

## Aşama 1 — Bugün 2.0 ✅

**Durum:** Tamamlandı.

- Ana ekranın çalışan legacy ID ve fonksiyonları korunarak yeni TypeScript görünüm katmanı eklendi.
- İlk bakış akışı sadeleştirildi: YKS sayacı/özet → Bugün kontrol merkezi → Bugünün manuel programı.
- Tekrarlanan günlük soru/odak üst istatistikleri gizlendi; streak görünümü korunarak daha kompakt hale getirildi.
- Bugün kontrol merkezindeki ayrıntılı tekrar, ders dağılımı, odak zaman çizgisi ve gün sonu alanları `Günün detaylarını göster` altında toplandı.
- Akıllı analizler, hızlı girişler, haftalık hedef ve diğer ikincil araçlar `Diğer araçları aç` altında toplandı; hiçbir içerik silinmedi.
- Tablet/dar ekran ve azaltılmış hareket erişilebilirlik durumları korundu.
- Ana ekran katmanı hiçbir çalışma verisi yazmaz ve Program mantığını değiştirmez.
- Aşama 1 için 3 yeni regresyon testi eklendi.
- Node 22/24, TypeScript strict, **238/238 test** ve production build başarıyla geçti.

## Aşama 2 — Analiz Merkezi ✅

**Durum:** Tamamlandı.

- Mevcut İlerleme 3.0 ve Deneme Analizi 3.0 API'leri kopyalanmadan tek üst seviye `Analiz Merkezi` yüzeyinde birleştirildi.
- İlerleme ekranının üstüne 7 günlük ve 30 günlük çalışma özeti eklendi; odak süresi, soru sayısı, aktif gün, seri ve tekrar durumu önceki eşit dönemle birlikte gösteriliyor.
- TYT / AYT / YDT için mevcut kayıtlardan son 10 denemelik net eğilimi; son net, ortalama, dönem farkı ve oynaklık bağlamı tek görünümde sunuluyor.
- Ders bazında son 30 günlük çalışma süresi ve soru miktarı aynı dönemin deneme başarı yüzdesi / dönem değişimi ile birlikte gösteriliyor.
- Denemeye bağlanmış yanlışlardan en kritik 3 konu sinyali oluşturuluyor; deneme bağlantısı yoksa mevcut `dikkat isteyen ders` kanıtı yedek sinyal olarak kullanılıyor.
- `Kanıt özeti` yalnız kayıtlı İlerleme ve Deneme analizlerinin açıklanabilir metinlerini birleştiriyor; tahmin, garanti veya gelecek net üretmiyor.
- Analiz Merkezi salt okunurdur; Program, Dexie, localStorage, Firebase veya çalışma kayıtlarına yazmaz.
- Yeni yüzey mevcut İlerleme 3.0'ı kaldırmaz; onun üzerinde bir üst özet olarak çalışır.
- Tablet/dar ekran, coarse-pointer ve azaltılmış hareket erişilebilirliği eklendi.
- Aşama 2 için 3 yeni regresyon testi eklendi.
- Node 22/24, TypeScript strict, **241/241 test** ve production Vite build başarıyla geçti.

## Aşama 3 — Hata → Öğren → Tekrar döngüsü ✅

**Durum:** Tamamlandı.

- Mevcut `wrongLog`, `errorJournal` ve `manualReviews` kayıtları şema değiştirilmeden tek salt-okunur öğrenme döngüsü analizinde birleştirildi.
- Deneme ekranında Hata Defteri'nin hemen altında yeni `Öğrenme Döngüsü` merkezi eklendi.
- Her konu `Hata → Öğren → Tekrar → Kontrol` adımlarıyla tek kartta gösteriliyor.
- Konular `Yeniden geldi`, `Tekrar ediyor`, `Tekrar bekliyor`, `Açık hata`, `Şimdilik temiz` ve `Deftere bağlanmadı` durumlarına yalnız kayıtlı kanıttan ayrılıyor.
- Bir hata çözüldü olarak işaretlendikten sonra daha ileri tarihli yeni yanlış kaydı oluşursa konu otomatik olarak `Yeniden geldi` sinyali veriyor.
- Farklı günlerde yinelenen ve hâlâ açık olan hatalar `Tekrar ediyor` olarak önceliklendiriliyor.
- Kartlardan mevcut Hata Defteri kaydına, müfredat konusuna, Öğrenme Laboratuvarı rehberine ve tekrar listesine doğrudan geçiş eklendi.
- Yeni merkez Program, konu durumu veya çalışma kayıtlarına otomatik yazmaz; mevcut manuel Program sözleşmesi korunur.
- Veri şeması 21 korunur; eski Hata Defteri ve yanlış kayıtları yeni alan gerektirmeden analiz edilir.
- Tablet/dar ekran, coarse-pointer, klavye odağı ve azaltılmış hareket erişilebilirliği eklendi.
- Aşama 3 için 4 yeni regresyon testi eklendi.
- Kod değişiklikleri Node 22/24, TypeScript strict, **245/245 test** ve production Vite build kapısından geçti.

## Aşama 4 — Öğrenme Laboratuvarı 3.0 / Quiz ✅

**Durum:** Tamamlandı.

- Biyoloji Atlası'na `Öğren` ve `Sınama` modlarını yöneten yeni TypeScript quiz katmanı eklendi.
- 3B yapı sınaması her turda en fazla 6 benzersiz yapı seçiyor; YKS öncelikli yapılar tur sıralamasında öne alınıyor.
- Sınama başlarken 3B model görünümü ve iç kesit hazırlanıyor; mevcut model indirme/lazy-load hattı değiştirilmeden kullanılıyor.
- Sınama sırasında yapı isimleri, numaralar, alt yapı listesi ve cevap açıklaması gizleniyor; model üzerinde yalnız dokunulabilir `?` hedefleri kalıyor.
- 3B etiket noktası, iç 3B parçaya dokunma ve mevcut yapı seçim olayları aynı doğru/yanlış değerlendirmesine bağlandı.
- Her seçimden sonra anında `Doğru / Yanlış`, seçilen yapı, doğru yapı ve tur skoru gösteriliyor; tur sonunda doğru yüzdesi veriliyor.
- Ekran okuyucunun cevabı model noktasının `aria-label` veya `title` alanından öğrenmemesi için sınama sırasında nötr `Yanıt noktası` etiketi kullanılıyor; Öğren moduna dönünce özgün erişilebilir etiket geri geliyor.
- Sınamadan çıkışta aynı organ açıksa kullanıcının önceki etiket ve iç-kesit görünümü geri yükleniyor.
- Quiz sonucu kalıcı çalışma verisine yazılmıyor; Program, konu durumu, Dexie, localStorage ve Firebase kayıtları değiştirilmiyor.
- Veri şeması 21, mevcut 9 organ / 52 yapı sözleşmesi ve 3B lazy-load yapısı korunuyor.
- Tablet/dar ekran, coarse-pointer, klavye odağı ve azaltılmış hareket erişilebilirliği korundu.
- Aşama 4 için 4 yeni regresyon testi eklendi.
- Node 22/24, TypeScript strict, **249/249 test** ve production Vite build kapısından geçti.

## Aşama 5 — Navigasyon + Daha temizliği ✅

**Durum:** Tamamlandı.

- Alt navigasyondaki `Daha` çalışma anında `Merkez` olarak sadeleştirildi; yeni bir ana sekme eklenmedi ve mevcut ekran sayısı büyütülmedi.
- Merkez ilk görünümü dört açık kategoriye ayrıldı: `Öğrenme`, `Analiz`, `Ayarlar`, `Veri & Sistem`.
- Öğrenme altında Laboratuvar, kaynak/video, taktik ve yanlış soru arşivi; Analiz altında Analiz Merkezi, çalışma özeti ve raporlar; Ayarlar altında uygulama tercihleri ve hakkında; Veri & Sistem altında senkron, sistem durumu, JSON yedek ve değişiklik günlüğü toplandı.
- Mevcut `v30Action()` / `setMoreTab()` sözleşmeleri değiştirilmedi; eski araç kartları silinmek yerine yalnız ana Merkez görünümünde gizlendi ve mevcut alt sayfalar aynen kullanılmaya devam ediyor.
- `Analiz Merkezi` yeni bir ekran kopyalamak yerine mevcut `İlerleme` ekranına yönleniyor.
- Var olan sık kullanılanlar alanı `v30QuickGrid` Merkez içinde korunarak yeniden konumlandırıldı.
- Alt sayfalardaki geri dönüş metinleri `‹ Merkez` olarak güncellendi; Merkez aktifken üst başlık da aynı adı kullanıyor.
- Yeni navigasyon katmanı salt görünüm/yönlendirme katmanıdır; Program'a, Dexie'ye, localStorage'a, Firebase'e veya çalışma kayıtlarına yazmaz.
- Veri şeması 21 ve mevcut geriye dönük arayüz davranışları korunur.
- PC/tablet, dar ekran, coarse-pointer ve azaltılmış hareket durumları için responsive/erişilebilir davranış eklendi.
- Aşama 5 için 4 yeni regresyon testi eklendi.
- İlk CI denemesinde yalnız yeni testteki fazla dar metin eşleşmesi yakalandı; uygulama koduna dokunmadan test gerçek sözleşmeyi kontrol edecek şekilde düzeltildi.
- Son doğrulamada Node 22/24, TypeScript strict, **253/253 test** ve production Vite build başarıyla geçti.

## Aşama 6 — Kişiselleştirilebilir görünüm ✅

**Durum:** Tamamlandı.

- Merkez → Ayarlar içine yeni `Kişiselleştirme` paneli eklendi; varsayılan ayarlar mevcut v4.3 görünümünü aynen koruyor.
- Kullanıcı TYT / AYT / YDT kapsamını ayrı ayrı açıp kapatabiliyor; en az bir sınav türünün açık kalması zorunlu tutuluyor.
- Sınav kapsamı yalnız görünümü sadeleştiriyor; kapatılan türün eski konu, deneme, yanlış, tekrar veya çalışma kayıtları silinmiyor.
- Seçilen kapsam Konular, Deneme analiz filtresi, Deneme giriş türü, Öğrenme Laboratuvarı, Odak sınav simülasyonları ve v4.3 Analiz Merkezi üzerinde birlikte uygulanıyor.
- Görünmez hale getirilen bir sınav türü o anda aktifse arayüz ilk açık sınav türüne güvenli biçimde geçiriliyor; BRANŞ denemeleri bu kapsamdan etkilenmiyor.
- Bugün ekranı için beş görünürlük seçeneği eklendi: Günün sözü, hızlı işlemler, Bugün kontrol merkezi, Bugünün programı ve uyarılar.
- YKS sayacı ve temel günlük özet kişiselleştirme dışında bırakılarak ana ekranın çekirdek işlevi her zaman görünür tutuldu.
- `Varsayılana dön` ile tüm sınav türleri ve Bugün kartları tek işlemde yeniden açılıyor.
- Tercihler ayrı bir tarayıcı anahtarına yazılmak yerine mevcut `studyPrefs.personalizationV43` alanında tutuluyor ve mevcut `YKSLegacyState.save()` zincirinden geçiyor; böylece şema 21 korunurken Dexie/localStorage/Firebase/yedek hattıyla birlikte taşınıyor.
- Yeni katman Program satırlarını, konu durumunu veya deneme kayıtlarını otomatik değiştirmiyor.
- Analiz Merkezi kişiselleştirme olayını dinleyerek görünür TYT/AYT/YDT sekmelerini anında yeniden oluşturuyor.
- Tablet/dar ekran, coarse-pointer, klavye odağı, canlı durum metni ve azaltılmış hareket erişilebilirliği eklendi.
- Aşama 6 için 4 yeni regresyon testi eklendi.
- İlk strict TypeScript turunda `unknown` tercih kayıtlarının indekslenmesi yakalandı; kayıtlar açıkça daraltılarak tip güvenli hale getirildi.
- Son doğrulamada Node 22/24, TypeScript strict, **257/257 test** ve production Vite build başarıyla geçti.

## Aşama 7 — Legacy kod modülerleştirme ✅

**Durum:** Tamamlandı.

- Büyük `app.js` çekirdeği tek seferde yeniden yazılmadı; riskli veri normalizasyonu ve kurtarma çekirdeği mevcut uyumluluk katmanında bırakıldı.
- Yedi ana ekranın legacy çizim çağrıları `src/ui/screens/legacy-adapters.ts` içindeki tipli adaptör sınırına taşındı.
- `home`, `program`, `topics`, `deneme`, `progress`, `pomo` ve `more` ekran modülleri artık doğrudan legacy fonksiyon çağrıları taşımıyor; yalnız kendi adaptörünü çalıştırıyor.
- Program ekranının görünür takvim yolu, `program-procrast` ve `program-secondary` ertelenmiş çizim sırası aynen korundu.
- Deneme ekranının `deneme-secondary` idle işi, isteğe bağlı eski çizimleri ve hedef/net kazancı sırası korunarak adaptöre alındı.
- Deneme Dashboard + Öğrenme Döngüsü ve İlerleme Analiz Merkezi + modern dashboard katmanları legacy adaptörün dışında bırakıldı; böylece yeni TypeScript yüzeyleri eski çekirdeğe tekrar bağlanmadı.
- Yedi ekranın kaydı yeni `src/ui/screens/registry.ts` içinde tek tipli registry/Map altında toplandı; `screen-runtime.ts` artık ekran modüllerini tek tek import etmiyor.
- Screen runtime hata koruması, `afterPaint`, `idle`, aktif ekran yenilemesi ve legacy fallback davranışı korunuyor.
- Yeni adaptör/registry katmanı Program, Dexie, localStorage, Firebase veya çalışma verisine yazmıyor.
- Aşama 7 için 4 yeni regresyon testi eklendi; mevcut ekran runtime testleri yeni mimari sözleşmeye göre güçlendirildi.
- İlk CI turunda eski paket testi `program-secondary` anahtarını eski dosya konumunda aradığı için 260/261 kaldı; uygulama davranışı bozulmadan uyumluluk sözleşmesi görünür tutuldu.
- Son doğrulamada Node 22/24, TypeScript strict, **261/261 test**, anatomy asset doğrulaması ve production Vite build başarıyla geçti.

## Aşama 8 — v4.3.0 final kalite kapısı

**Durum:** Sıradaki.

- Node 22/24, strict TypeScript, tüm regresyonlar, production build, PWA/offline, veri kurtarma, Firebase/Dexie, tablet/PC ve canlı Pages doğrulaması.

## Uygulama sırası

1. Bugün 2.0 ✅
2. Analiz Merkezi ✅
3. Hata → Öğren → Tekrar ✅
4. Laboratuvar 3.0 / Quiz ✅
5. Navigasyon + Daha temizliği ✅
6. Kişiselleştirilebilir görünüm ✅
7. Legacy modülerleştirme ✅
8. Final kalite kapısı

**Durum: 7/8 tamamlandı.**
