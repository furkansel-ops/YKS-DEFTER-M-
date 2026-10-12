/* Manuel tam medya yenileme: 2026-10-07 · YKS 2027 video + playlist arşivi */
/* Hocalar v2 için tek doğrulama kaynağı.
   Yerleşik katalogda görünen her isim burada gerçek bir YouTube kanalına
   bağlanır. channelId biliniyorsa doğrudan, yalnız handle biliniyorsa hafif
   kanal sayfasından kimlik çözülerek RSS / playlist akışı hazırlanır. */
export const VERIFIED_CHANNELS={
  "MatMan":{channelId:"UCi3OrIf5uqtIdR7tX9ZZyVA",channelName:"MatMan · Emre Sulukan"},
  "Barış Çelenk":{channelId:"UCpogE5vw7rLYOuzYoDk1Ang",channelName:"Barış Çelenk ve Soruları"},
  "Merkeze Teğet Geometri":{channelId:"UCGlM-klG4Q70q9WkXX9cTWA",channelName:"Merkeze Teğet"},
  "Moz Akademi":{channelId:"UCSqWGILaJ5qZ_D9149h6RJg",channelName:"Moz Akademi"},
  "İlyas Güneş":{channelId:"UCRTxepZJj8vWniao-0Tkp4g",channelName:"İlyas Güneş"},
  "Matematiğin Güler Yüzü":{channelId:"UCdj-EiG6PCWM7ZqR5PzNOOw",channelName:"Matematiğin Güler Yüzü"},
  "Rehber Matematik":{channelId:"UCzxj9SKkLuDhdxSDXxcmwqQ",channelName:"Rehber Matematik"},
  "Eyüp B.":{channelId:"UCbv-0vMCnLqwlZXUWoI4a5w",channelName:"Eyüp B. Matematik Geometri"},
  "Mert Hoca":{channelId:"UCzMVi_CPx_XB9uhMl4uWR9g",channelName:"Mert Hoca"},
  "SML Hoca":{channelId:"UCSiatSbaEJZpI_tkQXwRbcw",channelName:"SML Matematik"},
  "Bıyıklı Matematik":{channelId:"UCxHSLxJcuZ8SpF5zgJeQ8Cg",channelName:"Bıyıklı Matematik"},
  "Kenan Kara":{channelId:"UC1X0FciySnrdUZld0O_tDXw",channelName:"Kenan Kara ile Geometri",channelHandle:"@KenanKaraileGeometri"},
  "Nurtaç Hoca":{channelId:"UCNgmALbCj_-cQpxiIpTqOSQ",channelName:"Nurtaç Hoca"},

  "Rüştü Hoca":{channelId:"UCyohoF5P2JFvc3KLLZRwDug",channelName:"Rüştü Hoca ile Türkçe",channelHandle:"@rustuhocaileturkce"},
  "Türkçenin Matematiği":{channelId:"UCCAmWzulVvB1DjnR5IQCTUQ",channelName:"Türkçenin Matematiği"},
  "Kadir Gümüş":{channelHandle:"@BenimHocam",channelName:"Benim Hocam",searchOnly:true,queryHint:"Kadir Gümüş YKS TYT Türkçe AYT Edebiyat",focusTerms:["kadir gümüş","kadir gümus"]},
  "Aker Kartal":{channelId:"UCWbEUy429vt1bWl7OgjTcDQ",channelHandle:"@akerkartal",channelName:"Aker Kartal"},
  "Deniz Hoca":{channelId:"UC_ke4VQZo9TewOf-p-LSx_Q",channelName:"Deniz Hoca"},

  "Özcan Aykın":{channelId:"UC_IRxSYYyDa4Li9lxAM4xbQ",channelName:"Özcan Aykın FİZİK"},
  "VIP Fizik":{channelHandle:"@vipfizik",channelName:"VIP FİZİK"},
  "Umut Öncül":{channelHandle:"@umutonculakademi",channelName:"Umut Öncül Akademi"},
  "Ertan Sinan Şahin":{channelId:"UCbIOzYvwXdvFGxt70WD2Y2A",channelHandle:"@ertansinansahin",channelName:"Ertan Sinan Şahin"},
  "Fizikle Barış":{channelId:"UCooJ3GA5zLWnrV-qWupXakg",channelHandle:"@fiziklebaris",channelName:"Fizikle Barış"},
  "Altuğ Güneş":{channelId:"UCx4651yGDx7DR6KiyxG_CUA",channelName:"Altuğ Güneş FİZİK"},
  "Fizikfinito":{channelId:"UC-zDbhn0rWs2EywjGQMrK7A",channelName:"Fizikfinito"},
  "Fizik Evim":{channelId:"UCkRD9iVmodQfET17HeqxUrg",channelName:"FİZİK EVİM"},

  "Ferrum":{channelId:"UC0yco2kB3xW3WI__8E8HaKw",channelName:"Ferrum"},
  "Kimya Adası":{channelHandle:"@kimyaadasi",channelName:"Kimya Adası"},
  "Meschemy Kimya":{channelHandle:"@meschemykimya",channelName:"Meschemy Kimya"},
  "Paraksilen Kimya":{channelHandle:"@paraksilen",channelName:"Paraksilen Kimya"},
  "Kimya Dersleri · Sinan İhtiyaroğlu":{channelHandle:"@kimyadersleri",channelName:"Kimya Dersleri - Sinan İHTİYAROĞLU"},
  "Semih Balmuk Kimya":{channelId:"UCoholQ9DKzOGYK7y9rYgrmA",channelHandle:"@SemihBalmukKimya",channelName:"Semih Balmuk Kimya"},
  "Levent Özdede ile Kimya":{channelHandle:"@leventozdede",channelName:"Levent Özdede ile Kimya"},
  "Görkem Şahin · Benim Hocam":{channelHandle:"@benimhocam",channelName:"Benim Hocam",searchOnly:true,queryHint:"Görkem Şahin Kimya",focusTerms:["kimya","görkem","gorkem"]},

  "Biosem":{channelHandle:"@biosem",channelName:"Biosem Biyoloji"},
  "Dr. Biyoloji":{channelId:"UCY7Nh-CV3qqaWTxldlG4RCA",channelHandle:"@barishocabiyoloji",channelName:"Dr. Biyoloji"},
  "Selin Hoca":{channelId:"UCl50Dhk1O-5YZYwHrWmuLtw",channelHandle:"@selinhoca",channelName:"Selin Hoca Biyoloji"},
  "Senin Biyolojin":{channelHandle:"@seninbiyolojin",channelName:"Senin Biyolojin"},
  "Betül Biyoloji":{channelHandle:"@betulbiyoloji",channelName:"BETÜL BİYOLOJİ"},
  "Cici Biyoloji":{channelHandle:"@CiciBiyoloji",channelName:"Cici Biyoloji"},

  "Yavuz Tuna Coğrafya":{channelId:"UCai5DYClxEjy-VH-eqz4MIA",channelName:"YAVUZ TUNA COĞRAFYA"},
  "Coğrafyanın Kodları":{channelId:"UCIvX31CHx2RsFQM46qbjuJA",channelName:"Coğrafyanın Kodları"},
  "KR Akademi":{channelId:"UC1NYzm_kEss5qScWlf-TtwA",channelName:"KR Akademi"},

  "Hocalara Geldik":{channelId:"UCBcM2J8SHyq8GUSvrhWnwTg",channelName:"Hocalara Geldik"},
  "Tonguç Akademi":{channelId:"UCm3vDH7Uvz_qwql5Qih4yGw",channelName:"tonguç AKADEMİ"}
};

/* Kanalın son 15 videosu ilgili dersi kaçırsa bile kullanıcı boş ekran görmesin.
   Bunlar doğrudan doğrulanmış YKS videolarıdır; RSS ile gelen güncel videoların
   önüne değil, aynı öğretmenin alakalı içerik havuzuna eklenir. */
export const CURATED_VIDEOS={
  "Rehber Matematik":[
    {id:"zspU5vVjpLs",title:"2027 TYT Matematik Kampı Başlıyor | 49 Günde Bitiriyoruz"},
    {id:"f6P_SLrivps",title:"Temel Kavramlar 1 | 49 Günde TYT Matematik Kampı 1. Gün | 2027"},
    {id:"taQxSST2haM",title:"TYT Matematik Son Genel Tekrar | 2026"}
  ],
  "Bıyıklı Matematik":[
    {id:"DV0tZzKFbw0",title:"55 Günde TYT Matematik Kampı | 2. Gün | Temel Kavramlar | 2027"},
    {id:"qNT_JmKKO8s",title:"55 Günde TYT Matematik Kampı | 10. Gün | Bölme-Bölünebilme | 2027"}
  ],
  "Ferrum":[
    {id:"Uzz4Z_iV4cA",title:"2027 TYT Kimya Kampı | 0. Gün | Kamp Yol Haritası"}
  ],
  "Kenan Kara":[
    {id:"VNh6--9IxEg",title:"Doğruda Açı | 2026 TYT-AYT Geometri Kampı | 1. Gün"}
  ],
  "VIP Fizik":[
    {id:"2qtDQBP7Avs",title:"50 Günde TYT Fizik Kampı Başlıyor | 2026-2027"}
  ],
  "Umut Öncül":[
    {id:"RCgz3a8EcaU",title:"Sıfırmatik TYT Fizik Kampı | 1. Gün"}
  ],
  "Kimya Dersleri · Sinan İhtiyaroğlu":[
    {id:"oWKF7P48rJk",title:"29 Günde TYT Kimya Kampı 2026 | Mol Hesaplamaları"},
    {id:"Ds0h6r6mSeQ",title:"2026 - 45 Günde AYT Kimya Kampı Başlıyor"},
    {id:"0SlAfAee4tI",title:"Gazlar | 45 Günde AYT Kimya Kampı 2026"}
  ],
  "Görkem Şahin · Benim Hocam":[
    {id:"ayDKtjR1Rm8",title:"TYT Kimya - Kimya Bilimine Giriş - Görkem Şahin"},
    {id:"M9cgj6B6wJs",title:"AYT Kimya Genel Tekrar Kampı - Görkem Şahin - 2026"},
    {id:"Sxi_dmFEF2o",title:"AYT Kimya - Karbon Kimyasına Giriş - Görkem Şahin - 2026"}
  ],
  "Kadir Gümüş":[
    {id:"fEBFK8h7aZM",title:"TYT Türkçe · Fiiller · Kadir Gümüş · 2026"},
    {id:"eWk7Y_QzrpE",title:"TYT Türkçe · Yeni Nesil Yorum · Kadir Gümüş · 2026"},
    {id:"fdNysxbXZQU",title:"AYT Edebiyat · Genel Tekrar · Kadir Gümüş · 2026"}
  ],
  "Senin Biyolojin":[
    {id:"zcY_LKermpU",title:"2026 TYT Biyoloji Müfredatı ve Çalışma Rotası"},
    {id:"KsbNxWm-No8",title:"2026 TYT Biyoloji Soru / Tekrar İçeriği"}
  ]
};

/* Kanalı veya eğitmeni doğrulanmış gerçek YouTube oynatma listeleri.
   Çok hocalı Benim Hocam kanalında Kadir Gümüş yalnız bu listelerle sabitlenir.
   Playlist verisi eksikse uydurma video/süre sayısı gösterilmez. */
export const CURATED_PLAYLISTS={
  "Özcan Aykın":[
    {id:"PLhhV4F6NB0-uEPdZncMf_qb0tSKyBM-Lf",title:"2027 · 55 Günde TYT Fizik Kampı"},
    {id:"PLhhV4F6NB0-tU__PwCFhnaK-Gg_I3JG_4",title:"2027 · 88 Günde AYT Fizik Kampı"}
  ],
  "Biosem":[
    {id:"PLqLwBmByktJWbDXnjbl5CMRrm5nEwMFOg",title:"2027 · 39 Günde TYT Biyoloji Kampı"}
  ],
  "Kadir Gümüş":[
    {id:"PL5kIOunpmSBOJBHFmxRmCCG1BFofMPx2n",title:"Kadir Gümüş · TYT Dil Bilgisi Kampı (43 video)"},
    {id:"PL5kIOunpmSBPFrbXu7HKrE56gF8gXCw6j",title:"Kadir Gümüş · TYT Dil Bilgisi Hızlı Kamp (18 video)"},
    {id:"PL5kIOunpmSBNemRDf7vOikjWeKWS3kVux",title:"Kadir Gümüş · AYT Edebiyat Konu Anlatımı (2022)"}
  ],
  "Aker Kartal":[
    {id:"PL5w_hbb3voMkxc2sU0JxNY88-kZ8bVmxq",title:"Aker Kartal · TYT Türkçe"},
    {id:"PL5w_hbb3voMmqux0of19HHOOcQT4j_Wzg",title:"Aker Kartal · AYT Edebiyat"}
  ],
  "Deniz Hoca":[
    {id:"PL8_9wYRykg9LuJI1Dop6Tll0s8ifm5EEI",title:"Deniz Hoca · TYT Türkçe Kampı 2025"}
  ]
};

export function channelUrl(source={}){
  if(source.channelId)return `https://www.youtube.com/channel/${source.channelId}`;
  if(source.channelHandle)return `https://www.youtube.com/${source.channelHandle}`;
  return "";
}
