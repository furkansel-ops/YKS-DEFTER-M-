# YKS Kariyer Sistemi — yayın öncesi kabul ve geri dönüş kapıları

Bu dosya yalnız PR #167 ve Koç Paneli PR #40 geliştirme dalları içindir.
**Tek başına GitHub CI başarısı, canlı ortamın çalıştığı veya mobil bildirimlerin teslim edildiği anlamına gelmez.**

## 1. Gerçek Firebase XP doğrulaması — BLOKER

Proje: `yks-uygulamam`, fonksiyon: `issueCoachChallengeXp`, bölge: `europe-west1`.
Fonksiyonun gerçek dağıtım durumunu görmeden `canlıda doğrulandı` denemez.

Yalnız **salt-okunur** kontroller:

```bash
firebase functions:list --project yks-uygulamam
firebase functions:log --only issueCoachChallengeXp --project yks-uygulamam
gcloud functions describe issueCoachChallengeXp --gen2 --region europe-west1 --project yks-uygulamam
```

Test hesabıyla yeni ödüllü görev: koç atar, öğrenci tamamlar, sunucu tek `coachXpReceipts`
belgesi üretir; aynı olay yeniden işlendiğinde ikinci makbuz ve XP oluşmaz.
Gerçek hesaplar ve gerçek öğrenci verileriyle sentetik test yapmayın.

## 2. Web Push ve Android/iPad — BLOKER

`Önce akıllı hatırlatmayı aç → Yerel bildirimi dene` ile izin ve görünümü test et.
Bu test **sunucu push'u değildir**. Web Push için ayrı buton ve Firebase VAPID gerekir.

- Android Chrome Ana Ekran PWA: ilk izin, uygulama ön planda, arka planda, ekran kilitli, offline ve tekrar online.
- iPadOS 16.4+ Ana Ekran'a eklenmiş Web App: izin mutlaka kullanıcının dokunuşunda, yerel test, uzaktan push, uygulama kapalı.
- Saat 22.00–08.00 sessiz saatlerde hiçbir hatırlatma teslim edilmemeli.
- Dinlenme gününde ve her iki kişisel hedef tamamlandığında yanlış seri uyarısı gitmemeli.
- Opt-out ve hesap değişiminde eski abonelik silinmeli; eski kullanıcıya bildirim gitmemeli.
- Web Push gönderimi için VAPID public/private anahtarları, Functions, Cloud Scheduler ve gerçek cihaz aboneliği gerekli. Gizli anahtarı GitHub'a veya Firestore'a koymayın.

## 3. Öğrenci–koç uçtan uca akış

Firebase Emulator ve fonksiyon-olay birim testleri, kullanıcı kabulünün yerini tutmaz.
Ayrı test öğrenci ve koç hesaplarıyla şu yol kanıtlanmalı:

1. Koç önce normal görev, ardından manuel ödev oluşturur.
2. Öğrenci uygulaması görevleri alır, soru+süre hedefi birlikte doğru ilerler.
3. Manuel ödev öğrencide `submitted` olur; yalnız koç `approved` yapabilir.
4. Server-side XP makbuzu öğrencinin görünümüne yalnız **bir kez** yansır.
5. Aynı haftada farklı koçlar toplam **3** ödüllü görev yuvasını aşamaz.
6. İptal edilen görev XP kazandırmaz. Başka hesap görevleri/makbuzları okuyamaz.
7. Çevrimdışı çalışma sonrası gerçek veriler eşitlendiğinde ilerleme ve rozetler kaybolmaz.

## 4. Android/iPad arayüz

320/360/390 px telefon genişliği ve iPad bölünmüş ekran genişliğinde sıfır yatay taşma:
çalışma takvimi yedi sütun, rekorlar, ders ustalığı, rozetler, koç görevleri,
bildirim düğmeleri, klavye/touch hedefleri ve ekran okuyucu etiketleri kontrol edilir.

CSS ve sözleşme otomatik testleri var; **gerçek cihaz görsel testi yok**.

## 5. Yayın kapısı ve geri dönüş

- Öğrenci PR #167 ve Koç Paneli PR #40 ikisi de taslak ve inceleme bekliyor.
- Canlı Firebase kuralları / indeksler / XP fonksiyonu / Push fonksiyonları birlikte planlanmalı.
- Kullanıcı verileri yedeklenip sürüm geri dönüşü tasarlanmalı.
- Yalnız açık **ayrı yayın onayı** alındıktan sonra merge ve Firebase dağıtımı yapılmalı.
- Fonksiyon, VAPID veya gerçek cihaz kanıtı eksikse **yayın engeli devam eder**.
