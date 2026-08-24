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

## Tamamlanan adım 4 — Dexie ve otomatik IndexedDB taşıması

- Dexie 4 ve `yks-defterim-v4` IndexedDB veritabanı eklendi.
- Şema 21 ana JSON kaydı uygulama açılışında otomatik olarak IndexedDB'ye kopyalanıyor.
- Taşıma işlemi atomik transaction içinde yapılıyor ve yazılan JSON/hash tekrar okunarak doğrulanıyor.
- Aynı veri yeniden yazılmıyor; `localStorage` değişmişse IndexedDB kopyası güvenle yenileniyor.
- Bozuk JSON veya daha yeni şemadaki kayıt IndexedDB'nin üzerine yazılmıyor.
- Eski `localStorage` verisi silinmiyor ve uygulamanın çalışan kayıt yolu bu adımda değiştirilmedi.

## Tamamlanan adım 5 — Dexie ana kayıt ve güvenli yerel ayna

- Dexie kalıcı ana kayıt haline getirildi; `localStorage` senkron uyumluluk aynası olarak korunuyor.
- Mevcut `save()` akışı write-through köprüsüyle sıralı olarak Dexie'ye yazılıyor.
- Dexie ve yerel ayna farklıysa hash ve güvenilir zaman damgasıyla daha yeni kayıt seçiliyor.
- İzlenmeyen eski `localStorage` değişikliklerinde veri kaybını önlemek için yerel kayıt öncelikli kabul ediliyor.
- IndexedDB açılamazsa uygulama `localStorage` aynasından çalışmayı sürdürüyor.
- Dexie kaydı daha yeniyse doğrulanıp çalışan `S` durumuna ve yerel aynaya uygulanıyor.
- Firebase'den gelen doğrudan kayıtlar da Dexie write-through kuyruğuna bağlandı.

## Sıradaki adım 6

Firebase senkronizasyonunu doğrudan Dexie veri katmanına bağlamak ve cihazlar arası eşitlemede Dexie'yi kaynak yapmak.

Bu adıma kullanıcı onayı alınmadan geçilmez.
