# YKS Defterim v4.4 — Öğrenme Laboratuvarı 4.0

Durum: **6/6 geliştirme aşaması tamamlandı · final kalite kapısı yeşil**

> Bu dal bir v4.4 geliştirme adayıdır. `main` ve canlı sürüm hâlâ **v4.3.1** kimliğini taşır. v4.4.0 sürüm yükseltmesi, merge, Pages dağıtımı ve canlı doğrulama yalnız açık bir yayın kararıyla yapılacaktır.

## Aşamalar

- [x] **1. Biyoloji — YKS soru odağı**  
  9 organın 52 yapısında, mevcut anatomi bilgisinden üretilen salt-okunur “YKS’de buradan ne sorulur?” odağı. Çıkmış soru iddiası üretmez; Atlas ile lazy/fail-open yüklenir.

- [x] **2. Biyoloji — İç / dış katman gezgini**  
  9 organ / 52 yapının dış yüzey ve iç yapı ayrımı mevcut cutaway motoruna bağlandı. Yeni model yüklemiyor, mevcut 3B sahneyi kullanıyor.

- [x] **3. Biyoloji — AYT görsel konu haritaları**  
  24 AYT Biyoloji konusunun adımları, bağlantıları, ana fikri ve karıştırma noktaları görsel kavram haritasına dönüştürüldü. Harita yalnız “Adım adım” görünümünde; quiz cevabı sızdırmıyor.

- [x] **4. Fizik — Etkileşimli simülasyonlar**  
  16 fizik kartının tamamı 8 deney masasına bağlandı: hareket/Newton, enerji/momentum, devreler, alanlar, optik, dalgalar, ısı-basınç-kaldırma ve fotoelektrik. Sürekli animasyon veya yeni ağır 3B bağımlılık yok; Fizik seçilince lazy açılıyor.

- [x] **5. Kimya — Molekül & bağ görselleri**  
  H₂O, CO₂, NH₃, CH₄, O₂, N₂, HCl, C₂H₄ ve NaCl için bağ düzeni, Lewis çiftleri, geometri, polarite ve YKS odağı eklendi. Periyodik Tablo içinde kullanıcı isteğiyle lazy/fail-open açılıyor.

- [x] **6. Kronoloji + Periyodik Tablo etkileşimi**  
  Periyodik tabloda iki elementi grup/periyot/blok üzerinden yan yana karşılaştırma; kronolojide önceki → seçili → sonraki olay zinciri eklendi. Legacy veriyi yalnız okuyor ve çalışma verisine yazmıyor.

## Final kalite kapısı

Final kapı commit'i: `e441b4e005f293f8f03b4a228b613be27ecdda62`

- **311 / 311 test geçti**, başarısız test yok.
- **Node 22** ana doğrulama: başarılı.
- **Node 24** uyumluluk doğrulaması: başarılı.
- `tsc --noEmit`: başarılı.
- Anatomi varlıkları: **27 dosya**, sabit sürüm + SHA-256 doğrulaması başarılı.
- Vite **8.2.2**, **123 modül** dönüştürüldü.
- Başlangıç JS: **227.80 kB** · gzip **76.38 kB**.
- v4.4 lazy parçaları:
  - Laboratuvar etkileşimleri: **7.00 kB** · gzip **3.08 kB**.
  - Kimya görselleri: **10.52 kB** · gzip **4.53 kB**.
  - Fizik laboratuvarı: **16.08 kB** · gzip **6.85 kB**.
- Biyoloji Atlası: **133.81 kB** · gzip **47.56 kB**, lazy.
- 3B Atlas model motoru: **701.77 kB** · gzip **182.46 kB**, lazy. Vite'ın >500 kB uyarısı bu bilinen, istek üzerine yüklenen 3B parçaya aittir ve final kapıyı başarısız kılmaz.

## Korunan sözleşmeler

- Veri şeması **21** olarak kaldı.
- **Program manuel** kaldı; v4.4 özellikleri otomatik Program üretmez veya Program verisini değiştirmez.
- v4.4 öğretici katmanları çalışma/Dexie/Firebase kayıtlarına doğrudan yazmaz.
- 9 organ / 52 yapı / 24 AYT Biyoloji konusu korunur.
- Büyük 3B varlıklar çekirdek PWA kurulumuna alınmaz; ihtiyaç halinde yüklenir.
- Kaldırılmış eski özellikler geri eklenmedi.

## Yayın durumu

- PR: **#9**
- Geliştirme dalı: `v4.4-dev`
- Base: `main`
- `main` ve canlı **v4.3.1** bu geliştirme sırasında değiştirilmedi.
- PR final aday olarak **draft** kalmalıdır.
- Gerçek v4.4.0 yayını için koordineli sürüm/build/PWA kimliği yükseltmesi, yeşil CI, merge, Pages deploy ve canlı Pages doğrulaması ayrıca yapılmalıdır.
