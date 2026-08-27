# Anatomi varlıklarının kaynağı

3B organ modelleri ve organ resimleri: Anatomy Atelier, thebuggeddev/anatomy.
Kaynak: https://github.com/thebuggeddev/anatomy
Sabit kaynak sürümü: 8c0e6f321a47f895ae58ce098028b92774733ee9

Proje sahibi, 27 Ağustos 2026 tarihinde bu kod ve modelleri YKS Defterim'de
kullanma ve yayımlama iznine sahip olduğunu beyan etti. Bu kayıt yeni bir
açık kaynak lisansı oluşturmaz ve üçüncü kişilere yeniden kullanım izni vermez.
Kaynak depoda incelenen sürümde genel bir LICENSE dosyası yoktur.

YKS Defterim'e tüm Next.js uygulaması taşınmamıştır. Organ varlıkları ayrı,
isteğe bağlı yüklenir. Türkçe eğitim şemaları, açıklamalar ve görüntüleyici
bağlantısı bu uygulama için hazırlanmıştır. Modeller tıbbi tanı veya eksiksiz
anatomik kesit yerine kullanılamaz. Yapı–işlev ilişkileri için eşlik eden
şemalar ve resmî ders kaynakları birlikte değerlendirilmelidir.

Kaynak projenin `app/lib/anatomy-data.ts` işaret konumları ve yüzeye bağlı
işaret yaklaşımı referans alınmıştır. YKS iç yapı/büyütme işaretleri ve
Three.js iç hacimleri bu uygulama için ayrıca hazırlanmıştır. Kaynak GLB
tek yüzey mesh'idir; ön/arka kabuklar görsel kesme düzlemleriyle ayrılır.
Görünen iç odacıklar, hücreler ve diğer parçalar kaynaktan çıkarılmış
gerçek doku değildir; ölçekli olmayan öğretici geometrilerdir.

Three.js ve Meshopt çözücüsünün kendi dağıtımlarındaki lisans bildirimleri
geçerlidir. Varlık sürümü, boyut ve özetleri scripts/anatomy-assets.json içindedir.

## Görüntüleyici bağımlılıklarının lisans bildirimi

Bu bölüm yalnız aşağıdaki yazılım bağımlılıkları içindir; organ varlıklarına
yeni bir lisans vermez.

The MIT License

Three.js — Copyright © 2010-2026 three.js authors

Meshoptimizer / MeshoptDecoder — Copyright (C) 2016-2026, by Arseny Kapoulkine (arseny.kapoulkine@gmail.com)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
