const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");

const root=path.resolve(__dirname,"..");
const read=file=>fs.readFileSync(path.join(root,file),"utf8");

test("Play Store belgeleri 4.4.0 Android kimliği ve yayın sınırını doğru anlatır",()=>{
  const prep=read("PLAY-STORE.md"),release=read("RELEASE.md");
  for(const text of [prep,release]){
    assert.match(text,/4\.4\.0/);
    assert.match(text,/4040001/);
    assert.match(text,/com\.furkansel\.yksdefterim/);
    assert.match(text,/Internal Testing/i);
  }
  assert.match(prep,/ANDROID_KEYSTORE_BASE64/);
  assert.match(prep,/ANDROID_KEYSTORE_PASSWORD/);
  assert.match(prep,/ANDROID_KEY_ALIAS/);
  assert.match(prep,/ANDROID_KEY_PASSWORD/);
  assert.match(prep,/512 × 512/);
  assert.match(prep,/1024 × 500/);
  assert.match(prep,/Açık onay olmadan `main` birleştirilmez/);
  assert.match(release,/tamamlanmadan “Play Store'da yayınlandı”/);
});

test("Gizlilik politikası yerel, web bulut ve kullanıcı başlatmalı ağ erişimlerini açıklar",()=>{
  const privacy=read("privacy.html");
  assert.match(privacy,/IndexedDB\/Dexie/);
  assert.match(privacy,/Android native paketinde/);
  assert.match(privacy,/Web\/PWA sürümünde/);
  assert.match(privacy,/Firebase Authentication/);
  assert.match(privacy,/Cloud Firestore/);
  assert.match(privacy,/koç.*ham.*snapshot/is);
  assert.match(privacy,/Wikipedia\/Wikimedia/);
  assert.match(privacy,/YouTube Data API/);
  assert.match(privacy,/MEB, OGM, ÖSYM/);
  assert.match(privacy,/JSON yedeği/);
  assert.match(privacy,/Markdown özeti/);
  assert.match(privacy,/Anki uyumlu metin/);
  assert.match(privacy,/PNG/);
  assert.match(privacy,/Cihaz verilerini sil/i);
  assert.match(privacy,/bulut kopyasını.*otomatik olarak kaldırmaz/is);
  assert.doesNotMatch(privacy,/Bu sürüm kullanıcı hesabı oluşturmaz/);
  assert.doesNotMatch(privacy,/hiçbir veri (?:toplanmaz|paylaşılmaz)/i);
});

test("Data Safety çalışma kağıdı Android native ve web bulut davranışını ayırır",()=>{
  const safety=read("play-store/data-safety-tr.md");
  for(const marker of[
    "tr.wikipedia.org",
    "www.googleapis.com",
    "www.youtube-nocookie.com",
    "signed AAB",
    "merged manifest",
    "on-device processing",
    "Android native paket",
    "Web/PWA",
    "Firebase Authentication"
  ])assert.ok(safety.includes(marker),marker);
  assert.match(safety,/doğrudan kopyalanacak kesin cevap değildir/);
  assert.match(safety,/hiç veri toplanmıyor\/paylaşılmıyor/);
  assert.match(safety,/native shell.*cloud-sync.*etkinleştirmez/is);
  assert.doesNotMatch(safety,/Firebase çalışma zamanı: Android yayın paketinde yok/);
  assert.doesNotMatch(safety,/Önerilen Play Console cevap yönü/);
});

test("Veri silme sayfası yerel veri, bulut veri ve dışa aktarılan dosyayı ayırır",()=>{
  const deletion=read("data-deletion.html");
  assert.match(deletion,/İki ayrı kalıcı silme onayını/);
  assert.match(deletion,/IndexedDB\/Dexie/);
  assert.match(deletion,/Depolamayı temizle/);
  assert.match(deletion,/otomatik olarak silmez/);
  assert.match(deletion,/Markdown/);
  assert.match(deletion,/Anki uyumlu/);
  assert.match(deletion,/Web\/PWA bulut verileri ve hesap/);
  assert.match(deletion,/Firebase Authentication/);
  assert.match(deletion,/Cihaz verilerini sil.*bulut.*otomatik/is);
  assert.doesNotMatch(deletion,/Bu sürüm kullanıcı hesabı oluşturmadığı/);
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
