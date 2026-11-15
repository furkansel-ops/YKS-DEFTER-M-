# Deneme › Analiz raporu (v128) · tasarım

## Amaç
Deneme ve İlerleme uygulamanın en güçlü yanı olsun. İlk adım: Deneme › Analiz sekmesi
tek bakışta üç soruyu cevaplasın: **Gidişat nasıl? Net nereden gidiyor? Ne yapmalıyım?**
Bugün bu bilgiler 5 alt sekme ve 3 karta dağınık; hepsine bakılmadığı için iyi hesaplar görünmüyor.

## Yaklaşımlar
- **A · Tek sayfa analiz raporu (seçildi).** Var olan hesapları tek akışta toplar; yeni olan yalnız
  "net nereden gidiyor" (kayıp neti yanlış/boş diye ayırma + yanlış nedenleri) ve öneri kuralları.
- B · Her deneme için karne: paylaşmaya iyi ama genel gidişatı göstermez. A'nın parçalarıyla sonra eklenebilir.
- C · Kartları tek tek cilalamak: dağınıklık kalır.

## Tasarım
Analiz sekmesi yukarıdan aşağı (dönem seçimi Son 5 / Son 10 / Tümü, bugünkü gibi):

1. **Gidişat** — son net, dönem ortalaması, yön (deneme başına ± net), hedef varsa kalan net ve
   "bu hızla yaklaşık N deneme sonra" (yükselmiyorsa tahmin yazılmaz).
2. **Net nereden gidiyor** — ders ders kayıp net, en çok kaybettiren üstte:
   kayıp = soru sayısı − net = 1,25 × yanlış + boş (dönem ortalaması).
   Tek çubukta yanlıştan / boştan kayıp; altında o dersin en çok yanlış çıkan konusu.
   Kartın altında yanlış nedenleri payı: Bilgi eksiği · Dikkat · Süre · Belirtilmemiş (dönemdeki denemelerin `wrongLog` kayıtları).
3. **Ne yapmalı** — en fazla 3 öneri, her biri "Plana ekle" (`addToToday`) ile:
   - dönemde ≥2 yanlış çıkan en sık konu → "Ders · Konu tekrarı";
   - boşu ortalama ≥3 ve isabeti (doğru / (doğru+yanlış)) ≥%80 olan ders → "boş bırakma, işaretlediğinin %X'i doğru";
   - nedenlerin ≥%40'ı dikkat ya da süre → ona göre tek cümlelik öneri (plan düğmesi yok);
   - yer kalırsa `marginalGain()` ilk sırası → "1 saatin en çok X'te net getirir".
4. İki deneme karşılaştırma kartı (bugünkü haliyle).
5. "Daha fazla analiz" katlanır bölümü olduğu gibi kalır (eski grafikler kaybolmaz).

Kalkan: Analiz sekmesindeki "Dersler", "En güçlü / Odaklan" ve "Kısa değerlendirme" kartları (içerikleri 1–3'e girer).

## Yapım
- Hesaplar saf fonksiyon: `src/domain/exam-report.ts` (kayıp net, neden payları, öneriler, hedef tahmini) + node testi.
- `src/ui/exam-hub-v73.ts` › `renderAnaliz` bu fonksiyonları kullanır; stil `exam-hub-v73.css`, tema değişkenleriyle.
- Veri yapısı değişmez, yeni giriş alanı yok.

## Kapsam dışı
İlerleme sayfası (sonraki adım, aynı mantıkla), Özet/Hatalar/Geçmiş sekmeleri, eski detay kartları, koç paneli.
