# YKS Defterim v4 Geçiş Planı

Bu dal, çalışan v3 uygulamasını bozmadan yeni altyapıya kademeli geçiş için kullanılır.

## Tamamlanan adım 1 — Vite + Vanilla TypeScript

- Vite geliştirme ve üretim derleme düzeni kuruldu.
- TypeScript `strict` ve ek güvenlik kontrolleriyle etkinleştirildi.
- `src/main.ts` geçiş başlangıç noktası eklendi.
- Mevcut JavaScript çalışma zamanı korunarak üretim paketine kopyalanıyor.
- GitHub Pages için göreli `base` yolu kullanılıyor.
- Mevcut Node regresyon testleri yeni `npm` komutlarına bağlandı.

Komutlar:

```bash
npm install
npm run dev
npm run typecheck
npm test
npm run build
npm run check
```

## Tamamlanan adım 2 — TypeScript arayüz köprüsü

- Ana ekran kimlikleri ve Daha alt panelleri sabit TypeScript türlerine taşındı.
- `go(...)` ve `setMoreTab(...)` çağrıları doğrulanan TypeScript yöneticilerinden geçiyor.
- Mevcut render işlevleri uyumluluk köprüsüyle korunuyor; görünüş ve kullanıcı verisi değişmedi.
- Ekran ve sekme bütünlüğü açılışta otomatik doğrulanıyor.
- Arayüz geçişleri izlenebilir özel olaylar yayımlıyor.
- Üretim paketinin TypeScript ve eski çalışma zamanı dosyalarını birlikte içerdiği otomatik denetleniyor.

## Sıradaki adım 3

Veri işlemlerini TypeScript veri katmanında toplamak ve mevcut kayıt sözleşmesini tiplerle güvenceye almak.

Bu adıma kullanıcı onayı alınmadan geçilmez.
