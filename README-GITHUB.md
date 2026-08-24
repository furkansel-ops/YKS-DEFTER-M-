# YKS Defterim v3.2.2

Bu paket doğrudan statik hosting için hazırlanmıştır. ZIP'i açtıktan sonra bu klasörün **içindeki dosyaları** GitHub deposunun kök dizinine yükleyin. GitHub Pages, Cloudflare Pages veya benzeri bir statik sunucuda çalışır.

## Bu sürümde gelenler

- v3.1.11 Sağlam Temel: CSS/JS modülerleştirme, çevrimdışı göstergesi, zamanlayıcı kurtarma, checksum'lı otomatik yedek, bölüm bazlı hata kurtarma, klavye iyileştirmeleri, çakışma birleştirme ve güvenlik temizliği.
- v3.1.12 Akıllı Konu Koçu: günlük üç konu önerisi, risk nedenleri, çalışma süresi, doğrudan başlatma ve plana ekleme.
- v3.1.13 Öğrenme Araçları: kişisel tekrar kartları, aralıklı tekrar, 50+ formüllük aranabilir/favorilenebilir banka ve 30 günlük tekrar analizi.
- v3.2.0 Öğrenme Laboratuvarı: paragraf hız/anlama çalışması, 118 elementlik etkileşimli periyodik tablo ve favorilenebilir YKS tarih kronolojisi. YDT kelime defteri özellikle eklenmemiştir.
- v3.2.1 Hedef ve Puan Merkezi: TYT/alan netleri, yaklaşık puan ve sıra, regresyon eğilimi, hedef bölüm mesafesi, ders hareketi ve kişisel yayınevi zorluğu tek görünümde.
- v3.2.2 Dışa Aktarma: yazdırılabilir PDF raporu, ICS takvim, Anki TXT, Obsidian Markdown ve PNG başarı kartı.
- 1000 sözlük havuz korunarak İngilizce olan 920 söz Türkçeleştirildi.

## Yayına alma

1. ZIP'i açın.
2. `index.html`, `app.js`, `app.css`, `modules/`, ikonlar ve diğer dosyaları depo köküne yükleyin.
3. GitHub'da **Settings → Pages** bölümünden ana dalın kök dizinini yayınlayın.
4. Firebase kullanılıyorsa yayın alan adını Firebase Authentication içindeki yetkili alan adlarına ekleyin.

Kullanıcı verileri şema 21'e otomatik taşınır. Yeni `lab` alanı yoksa paragraf geçmişi ve favoriler güvenli boş değerlerle oluşturulur. Yine de güncellemeden önce uygulamanın Veri/Yedek bölümünden bir JSON yedeği almak iyi bir güvenlik adımıdır.

YouTube API anahtarı pakete gömülü değildir. Arama özelliği için kullanıcı kendi anahtarını cihazında girebilir; bu anahtar JSON yedeğine ve bulut senkronuna dahil edilmez.
