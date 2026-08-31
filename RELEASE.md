# YKS Defterim v4.3.0

## KARARLI · 31 Ağustos 2026

YKS Defterim v4.3.0; mevcut çalışma akışını yeni özellik yığınına dönüştürmeden sadeleştirir, yedi v4.3 ürün katmanını güvenli ve isteğe bağlı yüklenen modüllere ayırır ve final kalite kapısını PWA, veri güvenliği, tablet/PC ve production doğrulamalarıyla güçlendirir.

### Sürüm kimliği

- Uygulama sürümü: **4.3.0**
- Build: **4.3.0-r1**
- Kanal: **stable**
- Veri şeması: **21**
- PWA cache: **yks-core-v4.3.0-r1**
- Legacy uyumluluk çekirdeği: **app.js 4.1.0-r20**
- v4.2 uyumluluk modülleri: **4.2.0-r1 sözleşmesi korunur**

Büyük legacy `app.js` çekirdeği veri ve regresyon güvenliği için bilerek yeniden numaralandırılmadı. Gerçek kararlı sürüm kimliği TypeScript release katmanında merkezileştirilir. v4.3 ürün modülleri çekirdek açılış, veri katmanı ve Firebase girişinden sonra ayrı `dynamic import()` ve hata sınırlarında yüklenir; tek bir özellik hatası ana uygulamanın açılışını bloke edemez.

### v4.3.0 ile tamamlananlar

- **Bugün 2.0:** ana ekranın bilgi hiyerarşisi sadeleştirildi; manuel program ve günlük çalışma akışı öne çıkarıldı.
- **Analiz Merkezi:** 7/30 günlük çalışma, TYT/AYT/YDT net eğilimi, çalışma ↔ deneme bağlamı ve kritik yanlış sinyalleri tek görünümde birleştirildi.
- **Hata → Öğren → Tekrar:** Hata Defteri, Konular, Öğrenme Laboratuvarı ve manuel tekrar kayıtları kanıta dayalı tek akışta bağlandı.
- **Öğrenme Laboratuvarı 3.0 / Quiz:** 3B yapılarda YKS öncelikli, oturum içi ve veri yazmayan sınama modu eklendi.
- **Merkez navigasyonu:** Daha ekranı Öğrenme, Analiz, Ayarlar ve Veri & Sistem gruplarıyla sadeleştirildi.
- **Kişiselleştirilebilir görünüm:** TYT/AYT/YDT kapsamı ve Bugün kartlarının görünürlüğü kayıt silmeden yönetilebilir hale getirildi.
- **Legacy modülerleştirme:** yedi ana ekranın legacy çizim çağrıları tipli adaptör ve registry sınırına taşındı.
- **Güvenli v4.3 bootstrap:** `today-v43`, `analysis-center-v43`, `learning-cycle-v43`, `lab-quiz-v43`, `navigation-v43`, `personalization-v43` ve `focus-session-guard-v43` ayrı lazy chunk olarak paketlenir.
- **Odak oturum hazırlama kapısı:** yeni Sayaç/Kronometre oturumu ders seçmeden başlamaz; duraklatılmış veya önceden hazırlanmış oturumlar gereksiz seçim kapısına takılmaz.
- **Release/PWA sertleştirmesi:** ürün sürümü, build, service worker cache ve production/canlı doğrulayıcılar aynı `4.3.0-r1` kimliğine bağlandı; eski v4.2 cache soy temizliğine dahil edildi.

### Değişmez ürün sözleşmeleri

- **Program tamamen manuel kalır.** Analiz, tekrar sistemi veya öneri katmanı Program'a otomatik görev eklemez, silmez veya düzenlemez.
- Veri şeması **21** olarak korunur; geriye dönük veri uyumluluğu devam eder.
- Dexie ana kayıt + localStorage güvenli ayna + Firebase senkron hattı korunur.
- Biyoloji Atlası **9 organ / 52 seçilebilir YKS yapısı** sözleşmesini korur.
- Kulak Atlas organ listesinden çıkarılmış durumda kalır; işitme/denge normal müfredat içeriğinde bulunur.
- Ağır 3B anatomi/Three.js paketi başlangıç çekirdeğine alınmaz; ayrı lazy model chunk olarak kalır.
- v4.2 uyumluluk modülleri eski URL/sürüm sözleşmeleriyle korunur; v4.3 üst release katmanı bunları kırmadan çalıştırır.

### Final doğrulama sonucu

Final release kapısında aşağıdaki kontroller başarıyla tamamlandı:

- Node 22 ana çalışma kapısı ✅
- Node 24 uyumluluk kapısı ✅
- TypeScript strict typecheck ✅
- **278 / 278 otomatik regresyon testi ✅**
- Production Vite build: **100 modül başarıyla derlendi ✅**
- Yedi v4.3 ürün katmanının ayrı lazy JavaScript chunk olması ✅
- Production paket bütünlüğü ve release kimliği doğrulaması ✅
- 27 anatomi varlığının sabit sürüm + SHA-256 doğrulaması ✅
- Atlas 9 organ / 52 yapı ve 3B lazy-load regresyonları ✅
- Programın manuel kalma regresyonu ✅
- Dexie write-through, localStorage güvenli ayna ve Firebase payload/download yolu ✅
- Yedek bütünlüğü, önizleme ve otomatik rollback regresyonları ✅
- PWA/offline çekirdek, eski başlangıç yolu kurtarma ve cache soy temizliği ✅
- Tablet/PC dokunma, erişilebilirlik ve azaltılmış hareket regresyonları ✅
- GitHub Pages workflow'u merge sonrası production deploy ve canlı release doğrulamasını zorunlu çalıştırır.
- Deploy build'i ayrıca kaynak kod + production çıktısını tek **YKS-Defterim-v4.3.0-backup.zip** yedeği olarak artefaktlar.

Bilinen `biology-atlas-model` chunk'ının 500 kB üzerindeki Vite uyarısı beklenen durumdur; model başlangıç paketinden ayrıdır ve yalnız kullanıcı 3B Atlası açtığında yüklenir.

### Kararlı sürüm kontrolü

```bash
npm ci
npm run release:check
```

Tarayıcı içi uçtan uca release kontrolü için uygulamayı `?selftest=v4` sorgusuyla açın. Başarılı sonuç sayfanın `data-v4-release="ready"` durumunda ve gizli `v4ReleaseResult` öğesinde `YKS_V4_RELEASE_OK` olarak görünür.

Tarayıcı release kapısı bootstrap sürüm/build kimliğini, güvenli v4.3 runtime'ı, release overlay'i, TypeScript servislerini, yedi ekranı, Dexie ana kaydını, güvenli yedek/kurtarma köprüsünü, Firebase veri yolunu ve PWA build'ini birlikte doğrular.

---

**v4.3.0, yol haritasındaki 8 aşamanın tamamlanması ve final kalite kapısının tamamen yeşil geçmesiyle kararlı yayın için hazırdır.**
