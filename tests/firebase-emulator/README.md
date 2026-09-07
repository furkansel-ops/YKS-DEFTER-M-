# Yerel hesap ve Firestore güvenlik testi

Bu yalıtılmış paket ana uygulamaya test/CLI bağımlılığı eklemez. Node 22/24 ve Java 21 gerektirir.

```sh
cd tests/firebase-emulator
npm ci --ignore-scripts --no-audit --no-fund
npm test
```

Yalnız `127.0.0.1` üzerindeki Auth/Firestore emülatörlerini ve `demo-yks-sync` sahte projesini kullanır; üretim hesabına giriş, servis hesabı veya Firebase gizli anahtarı gerekmez. Gerçek Auth emülatöründe test hesabı oluşturur, emülatörün doğrulama e-postası kodunu uygular ve aynı kullanıcıyı ikinci cihaz oturumunda açar. Böylece Firestore kuralları gerçek doğrulanmış/doğrulanmamış Auth belirteçleriyle çalıştırılır.

Testler yetkisiz kullanıcı, başka hesap, doğrulanmamış e-posta, alan/boyut sınırları, eski v3 kaydını okuma ve yükseltme, atomik v4 yükleme, 32 parçalı işlem, silme işareti, eski istemci engeli, temizleme ve yeniden eşitlemeyi kapsar. Canlı kuralların yayımlandığını veya fiziksel Android/Windows cihazında uçtan uca çalışmayı kanıtlamaz.
