# Akşam özeti (v153) · kısa tasarım

## Neden
Öğrenci akşam günü kapatırken bugün ne kadar iş bittiğini tek bakışta görsün ve yetişmeyen görevleri tek dokunuşla yarına atsın. Şu an taşıma tek tek yapılıyor, akşam bildirimi görev sayısını söylemiyor.

## Yaklaşımlar
- **A · Mevcut bildirimi ve "Günü kapat" kartını geliştir (seçilen).** Kurulum gerektirmez; taşıma düğmesi bildirim gelmese de kartta durur.
- B · Site kapalıyken de gelen bildirim (Cloud Functions + FCM). Ücretli Firebase planı ve her akşam tüm öğrenci verisini okuma gerektirir; iki kişilik kullanım için pahalı ve kota riski. Yapılmadı.

## Ne değişir (hepsi `app.js`, yeni dosya yok)
1. **Bildirim metni** (`eveningText`): görev varsa `Bugün 3/5 görev · 85 soru · 2 sa 10 dk. 2 görev kaldı.`; hepsi bittiyse `Bugün 5/5 görev ✓ · …`; plan boşsa bugünkü eski metin. Başlık "Günü kapat" kalır. Zamanlama, ayar, saat aynı.
2. **"Kalan N görevi yarına taşı" düğmesi** Bugün › "Bugünün Programı" listesinin altında (`#todayFreshTaskList` sonrası; uygulamada görüldü ki eski "Günü kapat" kartı `#todayClose` yeni Bugün ekranında gizli, düğme yalnız o liste yoksa oraya düşer): saat 18:00'den sonra ve bugün bitmemiş görev varsa görünür. Basınca bitmemiş bütün görevler (rutin + ders, koçtan gelenler dahil) yarına taşınır; tek yedek, tek "Geri al", tek bildirim yazısı ("2 görev yarına taşındı ✓").
3. Taşıma kuralı tek görev taşımayla aynı (`movePlanCellTomorrow`): yarın aynı satır doluysa boş satır bulunur, yoksa satır eklenir; Pazar ise sonraki haftanın Pazartesisine gider. Ortak kısım tek fonksiyona çıkarılır, tek görev taşıma da onu kullanır.

## Yapılmayanlar
- Site kapalıyken bildirim (B).
- Hangi görevlerin taşınacağını seçme ekranı: tek görev için mevcut uzun basma menüsü yeterli.
- Bildirime düğme ekleme ("Taşı"): tarayıcı desteği her cihazda yok; bildirime dokununca uygulama zaten açılır.

## Test
Domain kısmı `app.js` içinde olduğu için kaynak testleri + `runV25SelfTest` tarzı kontrol: metin üç hali, toplu taşımada tek geri al ve geri alınca eski hale dönme, Pazar → sonraki hafta.
