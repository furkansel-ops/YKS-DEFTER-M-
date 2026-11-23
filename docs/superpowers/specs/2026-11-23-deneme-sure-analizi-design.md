# Deneme süre analizi — tasarım (onaylandı 2026-11-23)

## Amaç
Net kaybının bir kısmı konudan değil süreden gelir. Öğrenciye yeni veri girdirmeden, mevcut deneme verisinden
(ders ders boş sayısı, "Süre yetmedi" işaretli yanlışlar, girilmişse toplam süre) süre kaybını ders ders göstermek.

## Yaklaşımlar
1. **Mevcut veriden kart (seçilen):** ekstra yük yok, geçmiş denemelerle hemen çalışır.
2. Ders ders dakika girişi: daha net ama öğrencinin saati ders ders tutması gerekir; tutmazsa analiz boş kalır. Sonraya.

## Kararlar
- Deneme › Analiz'de "Net nereden gidiyor"un altında **Süre** kartı; Gidişat'ta seçilen pencerenin denemeleri.
- Ders satırı: deneme başına ortalama boş, o dersin `kind:"sure"` yanlış sayısı (alt derslerle eşleşir: Fen ← Fizik/Kimya/Biyoloji),
  4+ denemede ilk yarı/ikinci yarı boş ortalaması farkı ≥ 1 ise ▲ artıyor / ▼ azalıyor.
- Öne çıkan ders: `ort. boş + süre yanlışı / deneme sayısı` en yüksek olan (> 0 ise).
- Toplam süre: girilmiş (`dur > 0`) denemelerin ortalaması / resmi süre (TYT 165, AYT 180, YDT 180); yoksa ipucu.
- Branş denemesinde ve hiç boş/süre/süre-yanlışı yoksa kart çıkmaz.
- Hedef dışı: ders ders dakika girişi, koç paneli, "Ne yapmalı"ya yeni öneri.
- Sürüm: öğrenci v152.
