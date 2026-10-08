# Koç görevleri: XP güvenliği ve eşitleme

Bu belge yalnız taslak geliştirme dallarının mimarisini anlatır. **Canlı Firebase projesine hiçbir değişiklik uygulanmadı.**

## Yetki ve ödül düzeni

- `coachChallenges`: görev oluşturma yalnız etkin bağa sahip koçta; ölçülebilir ilerleme/teslim öğrencide, manuel onay koçta.
- Ödüllü görev kimliği `studentUid_YYYY-MM-DD_slot` biçimindedir; yuvalar `0`, `1`, `2`. Böylece **öğrenci başına haftada en fazla 3 ödüllü görev** belgesi olur; yeniden aynı belgeye yazmak güvenlik kuralları tarafından reddedilir.
- Ödülsüz görevin kimliğinde koç kimliği ve rastgele `free-...` bölümü bulunur. Ödülsüz görev XP oluşturmaz.
- `coachXpReceipts`: yalnız ayrıcalıklı sunucu fonksiyonu yazar; normal koç veya öğrenci hiçbir kayıt oluşturamaz, güncelleyemez ya da silemez.
- `issueCoachChallengeXp`: uygun durum değişiminde, ödül miktarını zorluktan türetip Firestore işlemindeki `create` ile tek makbuz oluşturur. Yenilenen/tekrarlanan olaylar yeniden ödül vermez.
- Öğrenci uygulaması koç XP'sini artık görev durumundan değil, doğrulanmış sunucu makbuzlarından alır. Daha sonra gelen makbuzlar çevrimdışı/veri eşitlemeden sonra da işlenir.
- Haftalık toplam XP üst sınırı 150 olarak hesaplanır.

## Test

`node --test tests/coach-receipts.test.js` saf makbuz kuralı ve tekillik testidir.

`security-tests/coach-rules.test.mjs` yalnız yerel Firebase Emulator üzerinde rol, etkin öğrenci-koç bağlantısı, görev atama, üç yuva, yasak XP düzenlemesi, koç onayı, sunucu makbuzu ve öğrenci/koç okuma sınırlarını denetler. GitHub'da `Coach challenge rules emulator` iş akışı bunları çalıştırır. `demo-coach-security` **demo proje kimliğidir**; canlı Firebase projesine bağlanılmaz.

Öğrenci uygulamasının Node 22/24, web derleme ve Android API 36 kontrolleri; Koç Paneli'nin Node 22/24 testleri ayrıca doğrulanmalıdır.

## Yayın öncesi eksikler ve sınırlar

1. Fonksiyonun gerçek proje üzerinde kullanılması, Cloud Functions dağıtımı ve ilgili Firebase faturalandırma koşulları henüz doğrulanmadı. Otomatik koç XP'si için **hem Firestore kuralları/indeksler hem bu fonksiyon** birlikte yayımlanmalıdır.
2. İstemcide kaydedilen çalışma süresi ve soru sayıları gerçek çalışmanın değiştirilemez kanıtı değildir. Makbuz, ödülün kaynağını ve tekilliğini güvenceye alır; çalışmanın gerçekte yapıldığını kriptografik olarak kanıtlamaz. Bu seviyede bir güvence istenirse sunucu tarafında doğrulanabilir etkinlik kaydı ayrıca tasarlanmalıdır.
3. Gerçek öğrenci ve koç hesaplarıyla uçtan uca test ve Android/iPad kullanıcı kabulü yapılmadı.
4. Eski kullanıcı verileri yedeklenip değerlendirilmeden `main` birleştirmesi veya Firebase dağıtımı yapılmamalıdır.
5. Uygulama kapalıyken Web Push bildirimleri bu güvenlik aşamasının parçası değildir.

**Yayın yalnız kullanıcının ayrı açık onayıyla yapılacaktır.**
