# YKS Defterim v4.0.0

Bu kararlı sürüm, çalışan v3 arayüzünü değiştirmeden Vite + TypeScript + Dexie altyapısına yapılan kademeli geçişin sonucudur.

## Kararlı sürüm kontrolü

```bash
npm install
npm run release:check
```

Tarayıcı içi uçtan uca kontrol için uygulamayı `?selftest=v4` sorgusuyla açın. Sonuç, sayfanın `data-v4-release` niteliğinde ve gizli `v4ReleaseResult` öğesinde `YKS_V4_RELEASE_OK` olarak görünür.

Kontrol edilen akışlar:

- v4 bootstrap ve bütün TypeScript köprüleri
- yedi ana ekranın açılması ve başlangıç ekranına geri dönülmesi
- mevcut şema 21 kaydının Dexie write-through yazımı
- IndexedDB kaydının yeniden okunması ve hash bilgisinin varlığı
- Firebase için hazırlanan bulut JSON'unda yerel kronometre ve YouTube anahtarının ayrıştırılması
- buluttan indirme yolunun aynı kayıtla Dexie-first uygulanması
- Firestore transaction, revision, conflict ve hash korumalarının üretim paketinde bulunması
- eski v3 release self-test katmanının v4 ile birlikte geçmesi
- PWA önbelleğinin `v4.0.0-r13` yapı anahtarıyla yenilenmesi ve eski modüllerin sürümlü URL'lerle aşılması

GitHub Pages yayını, derleme kontrollerinden sonra canlı dosya doğrulamasını da otomatik çalıştırır.
