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

## Tamamlanan adım 3 — TypeScript veri sözleşmesi

- Şema 21 ana kayıt sözleşmesi TypeScript tipleriyle belgelendi.
- Konular, denemeler, odak oturumları, soru bankası, öğrenme kartları ve laboratuvar kayıtları tür güvenli hale getirildi.
- Kullanılan yerel kayıt anahtarları tek bir sabit listede toplandı.
- JSON okuma/yazma, boyut sınırı ve gelecek şema koruması tek bir veri katmanında toplandı.
- `window.__YKS_DATA__` uyumluluk köprüsü eklendi; mevcut `localStorage` kayıt biçimi ve kullanıcı verisi değiştirilmedi.
- Dexie veya IndexedDB henüz etkinleştirilmedi.

## Sıradaki adım 4

Mevcut `localStorage` verisini Dexie/IndexedDB'ye tek seferlik ve otomatik olarak taşımak.

Bu adıma kullanıcı onayı alınmadan geçilmez.
