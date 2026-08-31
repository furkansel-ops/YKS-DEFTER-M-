# Google Play Data Safety çalışma kağıdı

Bu dosya Play Console formunu doldururken kullanılacak **teknik çalışma kağıdıdır**. Son beyan, yüklenen AAB'nin gerçek ağ davranışı ve Play Console'un o tarihteki soru metinleriyle karşılaştırılmalıdır.

## Mevcut kod tabanında doğrulananlar

- Kullanıcı hesabı oluşturma / Firebase Auth entegrasyonu yok.
- Reklam SDK'sı yok.
- Analytics SDK'sı yok.
- Çalışma kayıtlarının ana deposu cihazdaki localStorage + IndexedDB/Dexie.
- Program, deneme, odak ve konu kayıtlarını YKS Defterim adına işletilen bir sunucuya gönderen aktif bir backend entegrasyonu bulunmadı.
- Öğrenme Laboratuvarı, kullanıcı bir element için medya istediğinde Türkçe Wikipedia API'sine `credentials: "omit"` ile bir istek yapabilir. Bu istek çalışma/deneme verisini içermez.
- Harici web içeriği açıldığında üçüncü taraf hizmet kendi ağ/gizlilik davranışına sahip olabilir.

## Önerilen Play Console cevap yönü

### Veri toplama

**Kullanıcının YKS çalışma verileri:** geliştirici tarafından sunucuya toplanmıyor.

Aşağıdaki kategoriler için mevcut kodda uygulama geliştiricisine iletim tespit edilmedi:

- İsim
- E-posta adresi
- Kullanıcı kimliği
- Telefon numarası
- Adres
- Finansal bilgiler
- Sağlık bilgileri
- Kişiler
- Mesajlar
- Fotoğraf/video yüklemeleri (kullanıcının yerel çalışma içeriği cihaz içinde kalır)
- Uygulama içi çalışma kayıtları / sınav sonuçları geliştirici backend'ine aktarım

### Veri paylaşımı

YKS Defterim'in kendi çalışma verilerini reklamcı, veri aracısı veya başka bir ticari üçüncü tarafla paylaşan kod tespit edilmedi.

### Harici içerik isteği

Periyodik tablo medya görünümünde Wikipedia/Wikimedia ağına, seçilen element başlığını içeren bir API isteği yapılabilir. İstek `credentials: "omit"` kullanır ve YKS çalışma kayıtlarını taşımaz. Buna rağmen standart internet bağlantısı sırasında IP adresi gibi ağ metadatası karşı hizmet tarafından teknik olarak görülebilir. Play Console'un güncel Data Safety tanımlarına göre bu durum son AAB trafik testinde yeniden değerlendirilmelidir.

## Güvenlik uygulamaları

- Uygulama hesap oluşturmadığı için kullanıcı hesabı silme akışı yoktur.
- Kullanıcı cihaz verilerini uygulama içinden silebilir.
- Gizlilik politikası uygulama içinden erişilebilir.
- Keystore/release signing bilgileri uygulama koduna veya repoya yazılmaz.

## Yayın öncesi zorunlu tekrar kontrolü

Play'e yüklemeden hemen önce:

1. Release AAB'yi test cihazında kur.
2. Android Studio Network Inspector / uygun ağ gözlem aracıyla açılış ve ana özellikleri dolaş.
3. Hangi alan adlarına istek çıktığını kaydet.
4. Yeni bir SDK, crash reporter, analytics, reklam, push veya backend eklenmişse bu çalışma kağıdını güncelle.
5. Play Console Data Safety formunu yalnız bu son gözleme göre gönder.

Bu dosya politika garantisi değildir; yanlış veya eksik Data Safety beyanını önlemek için repo içi kontrol listesidir.
