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

## Aşama 2 — Analiz Merkezi

**Durum:** Sıradaki.

- Mevcut İlerleme 3.0 ve Deneme Analizi 3.0 verilerini tek üst seviye analiz yüzeyinde birleştirme.
- 7/30 günlük çalışma özeti, net eğilimi, ders çalışma süresi ↔ net bağlamı ve kritik konu sinyalleri.
- Yeni analiz yüzeyi salt okunur kalır; Program ve çalışma kayıtlarını değiştirmez.

## Aşama 3 — Hata → Öğren → Tekrar döngüsü

- Deneme yanlışı, Hata Defteri, Konular, Laboratuvar ve Tekrar Merkezi arasında tek akış.
- Aynı yanlışın tekrar edip etmediğini kayıtlı veriden izleme.

## Aşama 4 — Öğrenme Laboratuvarı 3.0 / Quiz

- Atlas yapılarında öğren modu, etiketsiz sınama ve yapı seçme soruları.
- Mevcut 9 organ / 52 yapı ve lazy-load sözleşmesi korunur.

## Aşama 5 — Navigasyon + Daha temizliği

- Öğrenme, Analiz, Ayarlar ve Veri & Sistem alanlarını daha açık bilgi mimarisine ayırma.

## Aşama 6 — Kişiselleştirilebilir görünüm

- Ana ekran kartlarını göster/gizle ve sınav kapsamını kişisel kullanıma göre sadeleştirme.

## Aşama 7 — Legacy kod modülerleştirme

- Büyük `app.js` çekirdeğini bir kerede yeniden yazmadan ekran bazlı TypeScript modüllerine kademeli çıkarma.
- Her taşıma mevcut regresyon kapısından geçer.

## Aşama 8 — v4.3.0 final kalite kapısı

- Node 22/24, strict TypeScript, tüm regresyonlar, production build, PWA/offline, veri kurtarma, Firebase/Dexie, tablet/PC ve canlı Pages doğrulaması.

## Uygulama sırası

1. Bugün 2.0 ✅
2. Analiz Merkezi
3. Hata → Öğren → Tekrar
4. Laboratuvar 3.0 / Quiz
5. Navigasyon + Daha temizliği
6. Kişiselleştirilebilir görünüm
7. Legacy modülerleştirme
8. Final kalite kapısı

**Durum: 1/8 tamamlandı.**
