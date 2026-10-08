# Gerçek Firebase XP doğrulaması ve Web Push dağıtım kontrolü

**Proje:** `yks-uygulamam` · **fonksiyon bölgesi:** `europe-west1`.

Bu belge yayın komutu uygulandığı anlamına gelmez. GitHub PR #167 **taslak** ve değişiklikler Firebase'e dağıtılmamıştır.

## 1. XP fonksiyonunun gerçek ortamda kontrolü (salt okunur)

Projenin yetkili sahibi, Firebase/Google Cloud girişine sahip bir terminalde:

```bash
firebase projects:list
firebase functions:list --project yks-uygulamam
gcloud functions describe issueCoachChallengeXp --gen2 --region europe-west1 --project yks-uygulamam
firebase functions:log --only issueCoachChallengeXp --project yks-uygulamam
```

**Başarı kanıtı:** `issueCoachChallengeXp` için başarılı deploy durumu ve aynı projede doğru `coachChallenges/{challengeId}` tetikleyicisi bulunmalı. Bir test öğrencisi ve test koçu ile ödüllü görev atanıp (1) ölçülebilir görev tamamlanmalı veya manuel görev onaylanmalı, (2) ilgili `coachXpReceipts/{studentUid}_{weekStart}_{slot}` belgesinin **bir kez** oluştuğu görülmeli, (3) aynı olay tekrar işlense de XP artmamalı, (4) öğrenci panelinde XP ve koç panelinde durum eşleşmeli. Gerçek kullanıcının verisini test için değiştirmeyin.

Eğer `functions:list` içinde fonksiyon bulunmuyorsa **gerçek Firebase doğrulaması başarısız / mümkün değil** olarak raporlanmalı; Emulator testlerinin geçmesi üretimde deploy edilmiş olduğunu göstermez.

Yalnız ayrı ve bilinçli bir dağıtım onayıyla deploy seçenekleri:
```bash
firebase deploy --only firestore:rules,firestore:indexes --project yks-uygulamam
firebase deploy --only functions:coach-rewards --project yks-uygulamam
```
Bu komutlar **canlı altyapıyı değiştirir**; test ve geri dönüş planı olmadan çalıştırılmamalıdır.

## 2. Akıllı bildirimler ve Web Push

Mevcut `sw.js` ve kronometre bildirimleri korunur. `smart-push-worker.js` yalnız `yks-smart-v1` verilerini işler; dış bağlantı yönlendirmesi reddedilir.

- Kullanıcı önce uygulama içinden hatırlatmayı açar, ardından ayrı butonla cihaz bildirim izni verir.
- Push abonelikleri `users/{uid}/pushDevices/{deviceId}` altında yalnız o kullanıcı tarafından okunur/yazılır.
- Fonksiyonlar `onCoachChallengePush` (atanan/onaylanan koç görevi) ve `sendSmartDailyReminders` (yerel saat 18.00 ve 20.00, sessiz saatler 22.00–08.00, 6 saatten eski veri uyarı üretmez).
- Bildirim içeriği kilit ekranı gizliliği için geneldir; özel ders/kullanıcı bilgisi taşımaz.
- Kullanıcı oturumdan çıktığında ve aboneliği kapattığında abonelikten çıkılması ve kayıt silinmesi amaçlanır.
- `publicConfig/push` belgesindeki yalnız **herkese açık VAPID anahtarı** okunabilir; özel anahtar asla Firestore veya istemci dosyalarında saklanmaz.

Cloud Secret Manager'da **ayrı yayın onayı sonrası** `YKS_WEBPUSH_PRIVATE_KEY`, `YKS_WEBPUSH_PUBLIC_KEY`, `YKS_WEBPUSH_SUBJECT` kurulmalı; `publicConfig/push` belgesine `vapidPublicKey` yazılmalı. `web-push` tabanlı kod otomatik Secret Manager kurulumu veya gerçek cihazda teslim garantisi vermez.

Saatlik Cloud Scheduler işlevi için Firebase Functions v2 ve Blaze plan/Cloud Scheduler uygunluğu kontrol edilmelidir. İstemci veri kayıtları ölçümleri kriptografik olarak kanıtlamaz; eski günlerin yanlış hatırlatılmaması için veri yaşı sınırlanmıştır. Çok cihaz, offline, iPad ana ekran ve Chrome PWA bildirimleri ayrıca gerçek cihazlarda test edilmelidir.

## 3. Yayın engelleri

1. Gerçek projede **yetkili fonksiyon listeleme, log ve örnek receipt doğrulaması** yok.
2. VAPID anahtarları, izinler ve güvenli gerçek cihaz Push aboneliği oluşturulmadı.
3. Yeni sunucu fonksiyonları Firestore Emulator ve web/Android CI dışında gerçek Google Cloud üzerinde çalıştırılmadı.
4. Yeni Functions için bağımlılık kurulumunu ve kurulum maliyetini staging ortamında doğrulamak gerekli.
5. Canlı öğrenci uygulaması ve Koç Paneli ayrı yayın iznine kadar aynı kalmalı.
