# YKS Defterim v4.3.1

## KARARLI · 31 Ağustos 2026

v4.3.1 yeni özellik yığmak yerine canlı v4.3.0'ın gerçek kullanım güvenliğini, tablet/PC ergonomisini, hata kurtarmasını, veri/offline stres kapısını ve production performans bütçelerini güçlendirir.

### Sürüm kimliği

- Uygulama sürümü: **4.3.1**
- Build: **4.3.1-r1**
- Kanal: **stable**
- Veri şeması: **21**
- PWA cache: **yks-core-v4.3.1-r1**
- Legacy uyumluluk çekirdeği: **app.js 4.1.0-r20**
- v4.2 uyumluluk modülleri: **4.2.0-r1 sözleşmesi korunur**

### v4.3.1 ile tamamlananlar

- **Fail-open runtime kurtarma:** tarayıcı seviyesinde `error` ve `unhandledrejection` güvenlik ağı eklendi. Bir cila/özellik katmanı hata verse bile ana giriş ve veri çekirdeği çalışmaya devam eder.
- **Kullanıcı dostu hata bildirimi:** teknik stack yerine kapatılabilir küçük bir bildirim ve kullanıcının seçebileceği güvenli yenileme düğmesi gösterilir.
- **Storage tanısı:** localStorage ve IndexedDB kullanılabilirliği salt tanı amaçlı ölçülür; ana veri katmanının fallback kararına müdahale edilmez.
- **Tablet/PC cila:** yatay taşma sınırları, `min-width:0`, safe-area, en az 44 px dokunma hedefi ve azaltılmış hareket desteği güçlendirildi.
- **Veri stres kapısı:** Dexie arızasında localStorage fallback, commit sonrası readback/hash doğrulaması, Firebase/yedek dış veri doğrulama sırası ve save fırtınası kuyruklama sözleşmeleri regresyonlarla kilitlendi.
- **PWA/offline stres kapısı:** atomik çekirdek cache, yarım yeni cache temizliği, eski cache soyu, `version.json` no-store ve büyük anatomi varlıklarının yalnız istek üzerine cachelenmesi doğrulandı.
- **Ekran geçişi güvenliği:** yalnız aktif ekran çizilir; ağır ikincil işler paint/idle sonrasına ertelenir ve deferred hatalar çekirdeğe yayılmaz.
- **Production performans bütçesi:** ana giriş JavaScript paketi 260 kB tavanıyla, runtime-resilience lazy chunk ise 12 kB tavanıyla CI'da korunur. Three.js/WebGL kodunun başlangıç paketine sızması reddedilir.
- **Odak başlangıç akışı korunur:** Sayaç/Kronometre `Başlat → Oturumu hazırla → ders seç → Başlat` sözleşmesini sürdürür.

### Değişmez ürün sözleşmeleri

- **Program tamamen manuel kalır.** Analiz veya öneri katmanı Program'a otomatik görev eklemez, silmez veya düzenlemez.
- Veri şeması **21** ve geriye dönük uyumluluk korunur.
- Dexie ana kayıt + localStorage güvenli ayna + Firebase senkron hattı korunur.
- Biyoloji Atlası **9 organ / 52 yapı** ve 27 sabit SHA-256 anatomy varlığı sözleşmesini korur.
- Kulak Atlas organ listesine geri eklenmez.
- Ağır 3B anatomi/Three.js başlangıç paketine alınmaz ve lazy-load kalır.
- v4.3 ürün modülleri çekirdek bootstrap sonrasında ayrı dynamic import + hata sınırlarında çalışır.

### Final aday doğrulaması

Release kimliği yükseltilmeden önceki v4.3.1 kalite turunda:

- Node 22 ✅
- Node 24 ✅
- TypeScript strict ✅
- **292 / 292 regresyon testi ✅**
- Production Vite build: **102 modül ✅**
- Ana JS: **223.201 bayt** / 260.000 bayt bütçe ✅
- `runtime-resilience-v431` JS: **2.488 bayt** / 12.000 bayt bütçe ✅
- 27 anatomy varlığı sabit sürüm + SHA-256 ✅
- Production package + izole v4.3 runtime ✅

Bilinen `biology-atlas-model` >500 kB Vite uyarısı beklenen lazy-load model chunk'ıdır ve başlangıç performans regresyonu değildir.

### Kararlı sürüm kontrolü

```bash
npm ci
npm run release:check
```

Tarayıcı içi uçtan uca release kontrolü için uygulamayı `?selftest=v4` sorgusuyla açın. Başarılı sonuç release self-test çıktısında `YKS_V4_RELEASE_OK` olarak görünür.

Merge sonrasında Pages workflow'u production paketi dağıtır, canlı release kimliğini doğrular ve kaynak kod + production çıktısını **YKS-Defterim-v4.3.1-backup.zip** olarak 30 günlük artefakt halinde üretir.

---

**v4.3.1, final CI + canlı Pages doğrulaması tamamlandığında kararlı yayın olarak kapanacaktır.**
