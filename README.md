# YKS Defterim v1.7.0 — Kararlı altyapı

Bu paket GitHub Pages için hazırlanmıştır.

## GitHub'a yükleme
Repo kökünde en az şu üç dosyayı birlikte güncelle:
- `index.html`
- `sw.js`
- `version.json`

Manifest ve ikonlar pakette tam takım olarak bulunur. Tüm paketi repo köküne yüklemek de uygundur.

## Firebase güvenlik kuralı — bir kez yapılacak
`firestore.rules` GitHub'a koyulsa bile Firebase'e otomatik uygulanmaz.
Firebase Console → Firestore Database → Rules bölümüne gir, `firestore.rules` içeriğini yapıştır ve **Publish** yap.

Bu kural her kullanıcının yalnız kendi UID alanına erişmesini sağlar ve bulut meta/chunk belgelerinde beklenmeyen alan ve aşırı boyutlu veri yazılmasını engeller.

## Sürüm / güncelleme
Uygulama sürümü: `v1.7.0`
Veri şeması: `18`
`version.json` cache dışından kontrol edilir. Gelecekte yeni sürüm yüklendiğinde uygulama güncelleme kartını gösterebilir.

## Tanı
Normal kullanımda gerekmez:
- `?selftest=1` → genel dahili test
- `?selftest=infra` → altyapı testi

## Geri dönüş
Ayrı `YKS-DEFTERIM-ROLLBACK-v1.0.0.zip` paketi, altyapı güçlendirmesinden önceki çalışan 400 sözlü sürümdür.
