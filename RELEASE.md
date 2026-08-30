# YKS Defterim v4.2.0

## KARARLI · 30 Ağustos 2026

YKS Defterim v4.2.0; global arama, açıklanabilir tekrar zekâsı, Hata Defteri bağlantıları, Deneme Analizi 3.0, İlerleme 3.0, Öğrenme Laboratuvarı akışı, veri kurtarma 2.0 ve final kalite kapısını tek kararlı sürümde birleştirir.

### Sürüm kimliği

- Uygulama sürümü: **4.2.0**
- Build: **4.2.0-r1**
- Kanal: **stable**
- Veri şeması: **21**
- PWA cache: **yks-core-v4.2.0-r1**
- Legacy uyumluluk çekirdeği: **app.js 4.1.0-r20**

Büyük legacy `app.js` çekirdeği veri ve regresyon güvenliği için bilerek yeniden numaralandırılmadı. Gerçek kararlı sürüm kimliği TypeScript release katmanında merkezileştirilir; görünür sürüm, PWA build karşılaştırması, üretim doğrulaması ve tarayıcı self-test'i v4.2.0 kimliğini kullanır.

### v4.2.0 ile tamamlananlar

- **Global arama:** konu, deneme, hata kaydı ve Öğrenme Laboratuvarı içeriğine hızlı erişim; arama yalnız yönlendirir.
- **Akıllı Tekrar Merkezi 2.0:** hata sıklığı, gecikme, güven, deneme kanıtı ve konu sağlığı ile açıklanabilir sıralama; tamamla/ertele durumu kalıcıdır.
- **Hata Defteri bağlantıları:** hata → konu → Laboratuvar geçişleri ve tarih bazlı tekrar eden hata çizgisi.
- **Deneme Analizi 3.0:** son 5/10 seri, ortalama, aralık, standart sapma, ders değişimi ve yanlış yoğunluğu.
- **İlerleme 3.0:** 7/30 günlük süreklilik karşılaştırmaları, ders çalışma süresi ↔ net bağlamı ve günlük konu sağlığı snapshotları.
- **Öğrenme Laboratuvarı 2.0 akışı:** `Kaldığın yer`, `Favoriler`, son 12 benzersiz içerik ve Atlas organlarından gerçek AYT konu rehberlerine geçiş.
- **Veri güvenliği ve kurtarma 2.0:** yedek önizleme/fark özeti, Kurtarma Merkezi ve başarısız geri yüklemede otomatik rollback denemesi.
- **Final kalite kapısı:** v4.2 sürüm kimliği merkezileştirildi, PWA cache döndürüldü ve release doğrulamaları v4.2'ye kilitlendi.

### Değişmez ürün sözleşmeleri

- **Program tamamen manuel kalır.** Analiz, tekrar sistemi veya öneri katmanı Program'a otomatik görev eklemez, silmez veya düzenlemez.
- Veri şeması **21** olarak korunur; geriye dönük veri uyumluluğu devam eder.
- Dexie ana kayıt + localStorage güvenli ayna + Firebase senkron hattı korunur.
- Biyoloji Atlası **9 organ / 52 seçilebilir YKS yapısı** sözleşmesini korur.
- Kulak Atlas organ listesinden kaldırılmıştır; işitme/denge normal müfredat içeriğinde kalır.
- Ağır 3B anatomi/Three.js paketleri başlangıç çekirdeğine alınmaz; kullanıcı Atlas/organ görünümünü açınca lazy-load edilir.
- Günün Sözü görünür sistemi YKS/çalışma motivasyonu ile seçili teknik direktör sözlerini kullanır.

### Final doğrulama sonucu

Final release kapısında aşağıdaki kontroller başarıyla tamamlandı:

- Node 22 ana çalışma kapısı
- Node 24 uyumluluk kapısı
- TypeScript strict typecheck
- **235 / 235 otomatik regresyon testi**
- Production Vite build
- Üretim paket bütünlüğü doğrulaması
- 27 anatomi varlığının sabit sürüm + SHA-256 doğrulaması
- Atlas 9 organ / 52 yapı ve 3B lazy-load regresyonları
- Programın manuel kalma regresyonu
- Büyük veri DOM sınırları ve İlerleme snapshot sınırları
- Dexie write-through, localStorage güvenli ayna ve Firebase payload/download yolu
- Yedek bütünlüğü, önizleme ve otomatik rollback regresyonları
- PWA/offline çekirdek, eski başlangıç yolu kurtarma ve cache soy temizliği
- Tablet/PC/mobil dokunma ve responsive cila regresyonları
- GitHub Pages production build
- GitHub Pages deploy
- Canlı sürüm doğrulaması

### Kararlı sürüm kontrolü

```bash
npm ci
npm run release:check
```

Tarayıcı içi uçtan uca release kontrolü için uygulamayı `?selftest=v4` sorgusuyla açın. Başarılı sonuç sayfanın `data-v4-release="ready"` durumunda ve gizli `v4ReleaseResult` öğesinde `YKS_V4_RELEASE_OK` olarak görünür.

Tarayıcı release kapısı bootstrap sürüm/build kimliğini, release overlay'i, TypeScript servislerini, yedi ekranı, Dexie ana kaydını, güvenli yedek/kurtarma köprüsünü, Firebase veri yolunu ve PWA build'ini birlikte doğrular.

---

**v4.2.0 kararlı sürümü, yol haritasındaki 8 aşamanın tamamlanmasıyla kapatılmıştır.**
