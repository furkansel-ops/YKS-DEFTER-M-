# YKS Defterim

YKS çalışma planı, konu takibi, deneme analizi, odak sayacı, yanlış soru arşivi ve video rehberini tek yerde tutan yerel uygulama.

## Başlatma

Windows'ta `YKS-Baslat.cmd` dosyasına çift tıkla. Bu başlatıcı Windows'un kendi PowerShell bileşenini kullanır; ayrıca Python kurulması gerekmez. Edge veya Chrome gereklidir.

Eski `YKS.pyw` başlatıcısı da Python 3 kurulu bilgisayarlarda kullanılabilir. Kayıtların aynı kalması için uygulama her zaman `http://localhost:8777/` adresini kullanır. Bu port başka bir uygulama tarafından kullanılıyorsa YKS Defterim veri güvenliği amacıyla açılmaz.

## Veri güvenliği

- Ana veriler yalnız bu tarayıcı profilinde saklanır.
- Düzenli olarak **Daha → Veri → JSON yedek al** seçeneğini kullan.
- Otomatik yerel yedekler fotoğrafları içermez ve tarayıcı verileri silinirse onlar da silinir.
- JSON yedeğine YouTube API anahtarı eklenmez.
- Başka cihaza geçerken JSON yedeğini dışa aktar ve yeni cihazda içe aktar.

## YouTube oynatma listeleri

Hoca, konu ve oynatma listesi araması kişisel kullanım için gömülü YouTube API anahtarıyla doğrudan çalışır. Ayrıca **Daha → Kaynak → Videolar ve hocalar → Anahtarsız oynatma listesi** alanına bildiğin bir YouTube liste bağlantısını yapıştırarak kotadan bağımsız biçimde izleyebilir ve haftalık programa ekleyebilirsin. Uygulama klasörünü paylaşman durumunda gömülü anahtarın da paylaşılacağını unutma.

## Test

PowerShell'de proje klasöründen `powershell -ExecutionPolicy Bypass -File .\test-yks.ps1` çalıştır. Denetim; yinelenen HTML kimlikleri/fonksiyonları, eksik öğe bağlantıları, açık API anahtarı, manifest ve gerekli dosyaları kontrol eder.

## Sınırlar

Puan ve sıralama ekranları resmî ÖSYM sonucu değildir. SAY ve EA sıralama aralıkları geçmiş yıllardan yön göstergesi üretir. SÖZ ve DİL için güvenilir tablo bulunmadığından uygulama uydurma sıralama göstermez. 2027 YKS tarihi ÖSYM açıklanana kadar tahminîdir.
