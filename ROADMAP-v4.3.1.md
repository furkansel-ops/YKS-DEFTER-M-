# YKS Defterim v4.3.1 — Gerçek Kullanım Cilası

v4.3.1 yeni özellik yığmak yerine canlı v4.3.0'ın gerçek kullanım güvenliğini, tablet/PC ergonomisini ve hata kurtarmasını güçlendirir.

## Değişmez sözleşmeler

- `main` canlı sürüm, geliştirme tamamlanana ve kalite kapısı yeşil olana kadar değiştirilmez.
- Program tamamen manuel kalır.
- Veri şeması 21 korunur.
- Dexie ana kayıt + localStorage güvenli ayna + Firebase senkron hattı korunur.
- v4.3 ürün modülleri çekirdek bootstrap'tan ayrı lazy/fail-open kalır.
- Biyoloji Atlası 9 organ / 52 yapı ve 27 sabit anatomy varlığı korunur.

## Aşama 1 — Açılış ve hata kurtarma 🟡

- Tarayıcı seviyesinde `error` ve `unhandledrejection` güvenlik ağı eklendi.
- Son 10 runtime problemi yalnız bellekte tutulur; çalışma verisine yazılmaz.
- Hata durumunda teknik stack yerine küçük, kapatılabilir ve yenileme seçenekli kullanıcı bildirimi gösterilir.
- localStorage / IndexedDB kullanılabilirliği salt tanı amaçlı kontrol edilir.
- Çevrimiçi/çevrimdışı durum runtime dataset'ine yansıtılır; mevcut offline sistemi değiştirilmez.
- Katman `v43-safe-runtime` üzerinden dynamic import ile yüklenir; ana bootstrap'a statik bağımlılık eklenmez.

## Aşama 2 — Tablet / PC görsel ve dokunmatik cila 🟡

- Yatay taşmayı engelleyen güvenlik sınırları eklendi.
- Grid/card/screen alanlarında `min-width: 0` koruması eklendi.
- Dokunmatik cihazlarda temel kontrol hedefleri en az 44 px olacak şekilde güvenceye alındı.
- Safe-area ve azaltılmış hareket (`prefers-reduced-motion`) desteği güçlendirildi.

## Aşama 3 — Veri / offline stres kapısı ⬜

- Dexie, localStorage güvenli ayna, Firebase payload ve backup/recovery regresyonları yeniden streslenecek.
- Offline → online ve eski PWA cache → yeni cache geçişleri kontrol edilecek.
- Veri kaybı yaratabilecek doğrudan yazma yolları taranacak.

## Aşama 4 — Performans ve ekran geçişleri ⬜

- Başlangıç bundle ve lazy chunk sınırları ölçülecek.
- Ekran geçişleri ve ağır 3B yükleme sınırları kontrol edilecek.
- Tablet/PC için gereksiz yeniden çizim ve bloklayan iş tespit edilirse azaltılacak.

## Aşama 5 — Final v4.3.1 kalite kapısı ⬜

- Node 22 + Node 24
- TypeScript strict
- Tüm regresyon testleri
- Production Vite build
- Release / Pages doğrulaması
- Canlı yayın sonrası kontrol
- Güncel kaynak + production ZIP yedeği

**Durum:** Aşama 1–2 ilk uygulama turunda; CI doğrulaması bekleniyor. `main` değiştirilmedi.
