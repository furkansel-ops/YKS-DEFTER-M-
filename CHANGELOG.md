# YKS Defterim — Altyapı sürüm zinciri

- **v1.0.0 — Başlangıç noktası:** 400 sözlü, çalışan GitHub/Firebase/PWA sürümünün güvenli kopyası.
- **v1.1.0 — Veri güvenliği:** veri şeması 18, bozuk localStorage kurtarma, son sağlam kopya, yedek şema bilgisi, gelecekteki şemaya yanlışlıkla yazmayı engelleme.
- **v1.2.0 — Senkronizasyon:** cihaz kimliği, bulut revizyonu, Firestore transaction ile atomik yazma, çevrimdışı kirli durum, eşzamanlı değişiklikte çakışma yedeği; kronometre durumu cihazda kalır.
- **v1.3.0 — Firebase güvenliği:** UID izolasyonuna ek olarak meta/chunk alan ve boyut doğrulaması için `firestore.rules`.
- **v1.4.0 — PWA güncelleme:** `version.json` ile cache'den bağımsız sürüm kontrolü, ağ-öncelikli gezinme ve kontrollü güncelleme.
- **v1.5.0 — Hata dayanıklılığı:** render bölümleri birbirinden izole, global hata günlüğü, açılış hatasında veri kaybetmeden güvenli uyarı.
- **v1.6.0 — Test altyapısı:** dahili altyapı self-testleri ve `?selftest=infra` tanısı.
- **v1.7.0 — Kararlı paket:** sürüm standardı, rollback paketi, test raporu ve GitHub'a hazır dosyalar.
