# YKS Defterim v3.1.13

Bu paket doğrudan statik hosting için hazırlanmıştır. ZIP'i açtıktan sonra bu klasörün **içindeki dosyaları** GitHub deposunun kök dizinine yükleyin. GitHub Pages, Cloudflare Pages veya benzeri bir statik sunucuda çalışır.

## Bu sürümde gelenler

- v3.1.11 Sağlam Temel: CSS/JS modülerleştirme, çevrimdışı göstergesi, zamanlayıcı kurtarma, checksum'lı otomatik yedek, bölüm bazlı hata kurtarma, klavye iyileştirmeleri, çakışma birleştirme ve güvenlik temizliği.
- v3.1.12 Akıllı Konu Koçu: günlük üç konu önerisi, risk nedenleri, çalışma süresi, doğrudan başlatma ve plana ekleme.
- v3.1.13 Öğrenme Araçları: kişisel tekrar kartları, aralıklı tekrar, 50+ formüllük aranabilir/favorilenebilir banka ve 30 günlük tekrar analizi.

## Yayına alma

1. ZIP'i açın.
2. `index.html`, `app.js`, `app.css`, `modules/`, ikonlar ve diğer dosyaları depo köküne yükleyin.
3. GitHub'da **Settings → Pages** bölümünden ana dalın kök dizinini yayınlayın.
4. Firebase kullanılıyorsa yayın alan adını Firebase Authentication içindeki yetkili alan adlarına ekleyin.

Kullanıcı verileri şema 20'ye otomatik taşınır. Yine de güncellemeden önce uygulamanın Veri/Yedek bölümünden bir JSON yedeği almak iyi bir güvenlik adımıdır.

YouTube API anahtarı pakete gömülü değildir. Arama özelliği için kullanıcı kendi anahtarını cihazında girebilir; bu anahtar JSON yedeğine ve bulut senkronuna dahil edilmez.

