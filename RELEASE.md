# YKS Defterim v4.3.0

## KARARLI · 30 Ağustos 2026

YKS Defterim v4.3.0; mevcut güçlü çalışma araçlarını daha sade bir akışta birleştirir. Bugün 2.0, Analiz Merkezi, Hata → Öğren → Tekrar döngüsü, Öğrenme Laboratuvarı 3.0 / 3B Quiz, yeni Merkez navigasyonu, kişiselleştirilebilir görünüm, legacy ekran adaptörleri ve güvenli odak başlangıcı bu sürümde tamamlanmıştır.

### Sürüm kimliği

- Uygulama sürümü: **4.3.0**
- Build: **4.3.0-r1**
- Kanal: **stable**
- Veri şeması: **21**
- PWA cache: **yks-core-v4.3.0-r1**
- Legacy uyumluluk çekirdeği: **app.js 4.1.0-r20**

Büyük legacy `app.js` çekirdeği veri ve regresyon güvenliği için bilerek yeniden numaralandırılmadı. Gerçek ürün sürümü TypeScript release katmanında merkezileştirilir. v4.2 isimli uyumluluk modülleri de dosya adları ve query sürümleri korunarak v4.3 altında çalışmaya devam eder.

### v4.3.0 ile tamamlananlar

- **Bugün 2.0:** günlük özet → kontrol merkezi → manuel Program akışı sadeleştirildi; ikincil içerikler açılır alanlara taşındı.
- **Analiz Merkezi:** 7/30 günlük çalışma, TYT/AYT/YDT net eğilimi, ders çalışma ↔ deneme sonucu ve kritik yanlış sinyalleri tek üst görünümde birleştirildi.
- **Hata → Öğren → Tekrar:** Hata Defteri, Konular, Öğrenme Laboratuvarı ve tekrar kayıtları tek açıklanabilir öğrenme döngüsüne bağlandı.
- **Öğrenme Laboratuvarı 3.0 / Quiz:** 9 organ / 52 yapı üzerinde etiketsiz 3B sınama, anlık doğru/yanlış ve oturum içi skor eklendi; ağır Three.js/Atlas paketi lazy-load kalır.
- **Navigasyon / Merkez:** `Daha` ekranı `Öğrenme`, `Analiz`, `Ayarlar`, `Veri & Sistem` olarak sadeleştirildi; mevcut legacy yönlendirme sözleşmeleri korundu.
- **Kişiselleştirme:** TYT / AYT / YDT görünürlük kapsamı ve Bugün ekranındaki ikincil kartlar kullanıcı tercihine göre yönetilebilir hale getirildi; kayıtlar silinmez.
- **Legacy modülerleştirme:** yedi ana ekranın eski çizim çağrıları tipli TypeScript adapter/registry sınırına taşındı; büyük `app.js` riskli toplu yeniden yazıma sokulmadı.
- **Odak oturumu hazırlama:** yeni Sayaç veya Kronometre oturumunda ilk `Başlat`, `Oturumu hazırla` alanını öne getirir. Kullanıcı bir derse gerçekten dokunmadan çalışma başlamaz; duraklat → devam ve mola akışları gereksiz seçim istemez.
- **Final kalite kapısı:** v4.3 ürün katmanları runtime self-test, production paket doğrulaması ve GitHub Pages canlı doğrulamasıyla release zincirine bağlandı.

### Değişmez ürün sözleşmeleri

- **Program tamamen manuel kalır.** Analiz, tekrar sistemi veya öneri katmanı Program'a otomatik görev eklemez, silmez veya düzenlemez.
- Veri şeması **21** olarak korunur; geriye dönük veri uyumluluğu devam eder.
- Dexie ana kayıt + localStorage güvenli ayna + Firebase senkron hattı korunur.
- PWA/offline ve tablet/PC desteği korunur.
- Biyoloji Atlası **9 organ / 52 seçilebilir YKS yapısı** sözleşmesini korur.
- Kulak Atlas organ listesinde değildir; işitme/denge normal müfredat içeriğinde kalır.
- Ağır 3B anatomi/Three.js paketleri başlangıç çekirdeğine alınmaz; kullanıcı Atlas/organ görünümünü açınca lazy-load edilir.

### Final doğrulama sonucu

v4.3 final adayında ve son odak rötuşunda aşağıdaki kontroller başarıyla tamamlandı:

- Node 22 ana çalışma kapısı
- Node 24 uyumluluk kapısı
- TypeScript strict typecheck
- **268 / 268 otomatik regresyon testi**
- Production Vite build
- Üretim paket bütünlüğü doğrulaması
- 27 anatomi varlığının sabit sürüm + SHA-256 doğrulaması
- Atlas 9 organ / 52 yapı ve 3B lazy-load regresyonları
- Programın manuel kalma regresyonu
- Dexie write-through, localStorage güvenli ayna ve Firebase payload/download yolu
- Yedek bütünlüğü, önizleme ve otomatik rollback regresyonları
- PWA/offline çekirdek, eski başlangıç yolu kurtarma ve cache soy temizliği
- Tablet/PC dokunma ve responsive cila regresyonları
- Sayaç/Kronometre `Oturumu hazırla` başlangıç kapısı regresyonları
- GitHub Pages production build, deploy ve canlı sürüm doğrulaması

### Kararlı sürüm kontrolü

```bash
npm ci
npm run release:check
```

Tarayıcı içi uçtan uca release kontrolü için uygulamayı `?selftest=v4` sorgusuyla açın. Başarılı sonuç sayfanın `data-v4-release="ready"` durumunda ve gizli `v4ReleaseResult` öğesinde `YKS_V4_RELEASE_OK` olarak görünür.

Tarayıcı release kapısı bootstrap sürüm/build kimliğini, v4.3 ürün katmanlarını, TypeScript servislerini, yedi ekranı, Dexie ana kaydını, güvenli yedek/kurtarma köprüsünü, Firebase veri yolunu ve PWA build'ini birlikte doğrular.

---

**v4.3.0 kararlı sürümü, 8/8 yol haritası ve son odak oturumu rötuşuyla yayınlanmaya hazırdır.**
