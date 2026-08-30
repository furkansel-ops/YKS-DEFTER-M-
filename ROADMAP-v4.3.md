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

## Aşama 6 — Kişiselleştirilebilir görünüm

**Durum:** Sıradaki.

- Ana ekran kartlarını göster/gizle ve sınav kapsamını kişisel kullanıma göre sadeleştirme.

## Aşama 7 — Legacy kod modülerleştirme

- Büyük `app.js` çekirdeğini bir kerede yeniden yazmadan ekran bazlı TypeScript modüllerine kademeli çıkarma.
- Her taşıma mevcut regresyon kapısından geçer.

## Aşama 8 — v4.3.0 final kalite kapısı

- Node 22/24, strict TypeScript, tüm regresyonlar, production build, PWA/offline, veri kurtarma, Firebase/Dexie, tablet/PC ve canlı Pages doğrulaması.

## Uygulama sırası

1. Bugün 2.0 ✅
2. Analiz Merkezi ✅
3. Hata → Öğren → Tekrar ✅
4. Laboratuvar 3.0 / Quiz ✅
5. Navigasyon + Daha temizliği ✅
6. Kişiselleştirilebilir görünüm
7. Legacy modülerleştirme
8. Final kalite kapısı

**Durum: 5/8 tamamlandı.**
