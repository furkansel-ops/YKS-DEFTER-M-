# YKS Defterim v4.0.0

Bu paket doğrudan statik hosting için hazırlanmıştır. ZIP'i açtıktan sonra bu klasörün **içindeki dosyaları** GitHub deposunun kök dizinine yükleyin. GitHub Pages, Cloudflare Pages veya benzeri bir statik sunucuda çalışır.

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

1. ZIP'i açın.
2. `index.html`, `app.js`, `app.css`, `modules/`, ikonlar ve diğer dosyaları depo köküne yükleyin.
3. GitHub'da **Settings → Pages** bölümünden ana dalın kök dizinini yayınlayın.
4. Firebase kullanılıyorsa yayın alan adını Firebase Authentication içindeki yetkili alan adlarına ekleyin.

Kullanıcı verileri şema 21'e otomatik taşınır. Yeni `lab` alanı yoksa paragraf geçmişi ve favoriler güvenli boş değerlerle oluşturulur. Yine de güncellemeden önce uygulamanın Veri/Yedek bölümünden bir JSON yedeği almak iyi bir güvenlik adımıdır.

YouTube API anahtarı pakete gömülü değildir. Arama özelliği için kullanıcı kendi anahtarını cihazında girebilir; bu anahtar JSON yedeğine ve bulut senkronuna dahil edilmez.
