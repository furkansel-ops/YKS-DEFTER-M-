const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");

const root=path.resolve(__dirname,"..");
const read=file=>fs.readFileSync(path.join(root,file),"utf8");

test("Android belgeleri 4.4.0 kimliğini ve GitHub APK dağıtım kararını doğru anlatır",()=>{
  const prep=read("PLAY-STORE.md"),release=read("RELEASE.md"),github=read("GITHUB-APK-TESTING.md");
  for(const text of [prep,release,github]){
    assert.match(text,/4\.4\.0/);
    assert.match(text,/4040002/);
    assert.match(text,/com\.furkansel\.yksdefterim/);
  }
  assert.match(prep,/Dağıtım kararı/);
  assert.match(prep,/Google Play'e yükleme\/yayın yapılmayacaktır/);
  assert.match(release,/GitHub pre-release/);
  assert.match(release,/Bu paket Play Store yayını değildir/);
  assert.match(github,/bir yıl boyunca/i);
  assert.match(github,/aynı güvenli imzalama anahtarıyla/);
  assert.match(github,/Actions artefaktı geçicidir/);
  assert.match(prep,/ANDROID_KEYSTORE_BASE64/);
  assert.match(prep,/ANDROID_KEYSTORE_PASSWORD/);
  assert.match(prep,/ANDROID_KEY_ALIAS/);
  assert.match(prep,/ANDROID_KEY_PASSWORD/);
  assert.match(prep,/512 × 512/);
  assert.match(prep,/1024 × 500/);
  assert.match(prep,/Açık onay olmadan `main` birleştirilmez/);
  assert.match(release,/tarihsel r1 yerel doğrulaması/i);
  assert.match(release,/4\.4\.0-r2 \/ 4040002\*\* imzalı AAB/);
});

test("Gizlilik politikası yerel veriyi ve kullanıcı başlatmalı ağ erişimlerini açıklar",()=>{
  const privacy=read("privacy.html");
  assert.match(privacy,/IndexedDB\/Dexie/);
  assert.match(privacy,/kullanıcı hesabı oluşturmaz/);
  assert.match(privacy,/Wikipedia\/Wikimedia/);
  assert.match(privacy,/YouTube Data API/);
  assert.match(privacy,/MEB, OGM, ÖSYM/);
  assert.match(privacy,/dışa aktardığı JSON\/yedek dosyası/);
  assert.match(privacy,/Markdown özeti/);
  assert.match(privacy,/Anki uyumlu metin/);
  assert.match(privacy,/PNG/);
  assert.match(privacy,/Cihaz verilerini sil/i);
  assert.match(privacy,/Google Cloud Firestore/);
  assert.match(privacy,/Bulut kopyasını sil/);
  assert.doesNotMatch(privacy,/Firebase/i);
  assert.doesNotMatch(privacy,/hiçbir veri (?:toplanmaz|paylaşılmaz)/i);
});

test("Data Safety çalışma kağıdı kesin cevap yerine signed AAB doğrulaması ister",()=>{
  const safety=read("play-store/data-safety-tr.md");
  for(const marker of [
    "tr.wikipedia.org",
    "www.googleapis.com",
    "www.youtube-nocookie.com",
    "signed AAB",
    "merged manifest",
    "on-device processing",
    "hesap oluşturmaz"
  ])assert.ok(safety.includes(marker),marker);
  assert.match(safety,/doğrudan kopyalanacak kesin cevap değildir/);
  assert.match(safety,/hiç veri toplanmıyor\/paylaşılmıyor/);
  assert.doesNotMatch(safety,/Önerilen Play Console cevap yönü/);
});

test("Veri silme sayfası uygulama deposu ile dışa aktarılan dosyayı ayırır",()=>{
  const deletion=read("data-deletion.html");
  assert.match(deletion,/İki ayrı kalıcı silme onayını/);
  assert.match(deletion,/IndexedDB\/Dexie/);
  assert.match(deletion,/Depolamayı temizle/);
  assert.match(deletion,/otomatik olarak silmez/);
  assert.match(deletion,/Markdown/);
  assert.match(deletion,/Anki uyumlu/);
  assert.match(deletion,/Bulut kopyasını sil/);
  assert.match(deletion,/Google hesabını kapatmaz/i);
});

test("Türkçe mağaza metinleri Play karakter sınırları içinde ve temkinlidir",()=>{
  const listing=read("play-store/listing-tr.md"),notes=read("play-store/release-notes-tr.txt").trim();
  const short=listing.match(/## Kısa açıklama\s+([^\r\n]+)/)?.[1]||"";
  const full=listing.match(/## Tam açıklama\s+([\s\S]*?)\s+## Play Console metadata notları/)?.[1].trim()||"";
  assert.ok(short.length>0&&short.length<=80,`kısa açıklama: ${short.length}`);
  assert.ok(full.length>0&&full.length<=4000,`tam açıklama: ${full.length}`);
  assert.ok(notes.length>0&&notes.length<=500,`sürüm notu: ${notes.length}`);
  assert.match(listing,/bağımsız bir eğitim aracıdır/);
  assert.match(listing,/internet gerekir/);
  assert.match(listing,/Henüz kullanıcıdan gereken/);
  assert.doesNotMatch(`${short}\n${full}\n${notes}`,/garantili başarı|ÖSYM onaylı|MEB onaylı|resmî uygulama/i);
});
