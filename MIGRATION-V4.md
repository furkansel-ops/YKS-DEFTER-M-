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

## Sıradaki adım 2

Mevcut arayüzü görünüş ve davranışı değiştirmeden TypeScript modüllerine taşımaya başlamak.

Bu adıma kullanıcı onayı alınmadan geçilmez.
