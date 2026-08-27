# YKS Defterim v4.1.0

Kaynak proje Vite ile derlenir; statik hosting'e yayımlanacak klasör `dist/` klasörüdür. Kaynak `index.html` dosyasını doğrudan yayımlamayın. Mevcut GitHub Actions iş akışı testleri, derlemeyi ve GitHub Pages dağıtımını yürütür.

## Biyoloji Atlası

Öğrenme Laboratuvarı → Hazır laboratuvar araçları → Biyoloji Atlası:

- 10 insan sistemleri konusu; genden proteine, enerji dönüşümleri, bitkiler ve ekolojiyle toplam 24 etkileşimli Türkçe şema.
- Her konu için yapı–işlev açıklamaları, AYT karışıklık notu ve şema üstünden bir kısa alıştırma.
- Kalp, beyin, akciğer, karaciğer, böbrek, göz, bağırsak, pankreas ve deri için 9 isteğe bağlı 3B model. Döndürme, yakınlaştırma, görünümü sıfırlama ve tel kafes kontrolleri.
- 3B desteği/yüklemesi başarısızsa organ resmi ve konu şeması kullanılabilir. Tel kafes bir anatomik katman veya kesit görünümü değildir.
- Atlas mevcut bilim kartı, favori, konu, deneme ve bulut kayıtlarını değiştirmez; veri şeması 21 olarak kalır.

Şemalar özgün ve öğretici özetlerdir; tam ders anlatımı veya tıbbi/anatomik referans değildir. Konu başlıkları OGM AYT materyaliyle eşleştirilmiştir. Modellerin kaynak/kullanım notu: [THIRD_PARTY_ANATOMY.md](THIRD_PARTY_ANATOMY.md).

### Geliştirme ve doğrulama

Node.js 22.18+ önerilir:

```sh
npm ci
node scripts/prepare-anatomy-assets.mjs
npm run dev
npm run release:check
```

`build` modeli kendisi hazırlar: 27 varlık, `scripts/anatomy-assets.json` içindeki sabit upstream commit'ten indirilir, boyut ve SHA-256 doğrulanır. Üretilen `public/anatomy/` Git'e eklenmez; Vite bu dosyaları `dist/anatomy/` altına kopyalar. İnternet gerektirmeyen hazırlık için upstream projenin `public` klasörünü `node scripts/prepare-anatomy-assets.mjs --source /tam/yol/anatomy/public` ile verebilirsiniz. Geçersiz/eksik kaynak dosyası dağıtımı durdurur.

Atlas ve Three.js ayrı paketlerdir; normal uygulama açılışında yüklenmez. GLB'ler yaklaşık 2–5,8 MB; toplam yaklaşık 30 MB'dır. PWA kurulumu bütün modelleri indirmez. Çevrimdışı kullanım için ilgili atlas bölümü/model daha önce açılmış ve cihaz önbelleğinde kalmış olmalıdır. Sekme değişimi yüklemeyi/görüntüleyiciyi kapatır; görünmeyen sahne sürekli çizilmez.

## Bu sürümde gelenler

- v3.1.11 Sağlam Temel: CSS/JS modülerleştirme, çevrimdışı göstergesi, zamanlayıcı kurtarma, checksum'lı otomatik yedek, bölüm bazlı hata kurtarma, klavye iyileştirmeleri, çakışma birleştirme ve güvenlik temizliği.
- v3.2.0 Öğrenme Laboratuvarı: paragraf hız/anlama çalışması, 118 elementlik etkileşimli periyodik tablo ve favorilenebilir YKS tarih kronolojisi. YDT kelime defteri özellikle eklenmemiştir.
- v3.2.1 Hedef ve Puan Merkezi: TYT/alan netleri, yaklaşık puan ve sıra, regresyon eğilimi, hedef bölüm mesafesi, ders hareketi ve kişisel yayınevi zorluğu tek görünümde.
- v3.2.2 Dışa Aktarma: yazdırılabilir PDF raporu, ICS takvim, Anki TXT, Obsidian Markdown ve PNG çalışma kartı.
- v3.2.3 Sade Arayüz: ana sayfadaki ödül/XP alanları, rozet görünümü ve Odak Bahçesi kaldırıldı; karne ve yararlı çalışma geçmişi “Çalışma özeti” altında korundu.
- v3.2.4 Daha Sade Konular ve Odak: Akıllı Konu Koçu, Öğrenme Araçları ve ayrı Kronometre geçmişi görünümü kaldırıldı. Kronometrenin kendisi, odak kayıtları ve temel analizler korunur.
- v3.2.5 Laboratuvar Düzeni: Öğrenme Laboratuvarı Konular ekranından Daha bölümüne taşındı; TYT, AYT ve YDT önce derslere, ardından o dersin konularına ayrıldı. Mevcut laboratuvar araçları korunarak sade bir açılır alan altında toplandı.
- v3.2.6 Konu Rehberleri: 240 TYT, AYT ve YDT konu başlığının tamamına konuya özel önemli bilgiler, dikkat noktaları, sık hatalar ve ders türüne uygun çalışma adımları eklendi. MEB, OGM Materyal ve ÖSYM resmî kaynak bağlantıları doğrudan konu görünümüne yerleştirildi.
- v4.0.0: Vite + TypeScript + Dexie altyapısı, güvenli localStorage aynası, Firebase senkron köprüsü, kararlı sürüm testleri ve canlı GitHub Pages doğrulaması tamamlandı.
- v3.2.7 Laboratuvar Araçları: Paragraf aracına kişisel rekor, gelişmiş özet ve güvenli geçmiş yönetimi; periyodik tabloya periyot/sınıf filtreleri ve YKS notları; tarih kronolojisine ters sıralama ve cevabı gizleyen hızlı tekrar modu eklendi.
- 1000 sözlük havuz korunarak İngilizce olan 920 söz Türkçeleştirildi.

## Yayına alma

1. Kaynak dosyalarını `main` dalına gönderin.
2. GitHub'da **Settings → Pages → Source: GitHub Actions** seçili olmalıdır.
3. `Vite uygulamasını GitHub Pages'e dağıt` iş akışının tamamlanmasını bekleyin. Başka bir statik sunucu kullanılıyorsa `npm run release:check` sonrası yalnız `dist/` içeriğini yayımlayın.
4. Firebase kullanılıyorsa yayın alan adını Firebase Authentication içindeki yetkili alan adlarına ekleyin.

Kullanıcı verileri şema 21'e otomatik taşınır. Yeni `lab` alanı yoksa paragraf geçmişi ve favoriler güvenli boş değerlerle oluşturulur. Yine de güncellemeden önce uygulamanın Veri/Yedek bölümünden bir JSON yedeği almak iyi bir güvenlik adımıdır.

YouTube API anahtarı pakete gömülü değildir. Arama özelliği için kullanıcı kendi anahtarını cihazında girebilir; bu anahtar JSON yedeğine ve bulut senkronuna dahil edilmez.
