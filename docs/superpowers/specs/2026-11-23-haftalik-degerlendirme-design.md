# Haftalık değerlendirme — tasarım (onaylandı 2026-11-23)

## Amaç
Koç şu an yalnız sayıları görüyor (dakika, soru, net, görev uyumu). Öğrencinin haftayı nasıl yaşadığını
("fizikte motivasyonum düştü") bilmiyor. Öğrenci her hafta sonunda üç kısa cevap yazar; koç yeni haftayı
planlarken "Geçen hafta" kartında görür.

## Hedefler / hedef dışı
- Hedef: 1 dakikada biten, isteğe bağlı değerlendirme; koç panelinde haftanın sayılarının yanında görünür.
- Hedef dışı: koçun cevaba yanıt yazması (mesajlar var), anlık bildirim, geçmiş değerlendirmeler sayfası.
- Anti-hedef: öğrenciyi her açılışta dürten, kapatılamayan bir kart; Firestore kural değişikliği.

## Yaklaşımlar
1. **Paylaşım belgesine eklemek (seçilen):** `coachingShares/{uid}.progress.weeklyReviews` — `progress` alanı
   kuralda serbest map; deneme planları (`progress.examPlans`) aynı yoldan gidiyor. Kural değişikliği yok.
2. Mesaj olarak göndermek: sohbette kaybolur, koç kartında yapılandırılmış göstermek zorlaşır.
3. Yeni koleksiyon: kural yazmak + elle `firebase deploy` gerekir; iki kişilik kullanımda gereksiz.

## Kararlar
- **Öğrenci, Bugün ekranı:** Pazar 18:00 – Pazartesi 23:59 arası kart. Üç alan (Ne iyi gitti? / Ne zorladı? /
  Gelecek hafta odak?), hepsi isteğe bağlı, en fazla 300 karakter. "Gönder" ve "Bu hafta geç".
  Gönderilen ya da geçilen haftada kart bir daha çıkmaz. En az bir alan dolu olmadan Gönder çalışmaz.
- **Hafta anahtarı:** değerlendirilen haftanın Pazartesi tarihi (YYYY-MM-DD). Pazar akşamı = bu hafta,
  Pazartesi = geçen hafta.
- **Kayıt:** öğrencinin yerel verisinde (`S.weeklyReviews`), son 8 hafta; "geç" kaydı `skipped:true`.
- **Paylaşım:** `progress.weeklyReviews` = son 8 haftanın gönderilenleri (geçilenler gitmez), metinler kırpılır.
- **Koç, "Geçen hafta" kartı (v74):** o haftanın değerlendirmesi varsa üç cevap, yoksa "Değerlendirme yazılmadı".
  Öğrenci metni `escHtml` ile yazılır.

## Kurucuya kalan
Kartın tam yerleşimi ve stili (mevcut Bugün kartlarıyla uyumlu), tema renkleri, test ayrıntıları.
