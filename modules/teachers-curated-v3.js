/* YKS Defterim · Küratörlü Hocalar v3
   Yerleşik hoca kataloğu ayrı tutulur; app.js veri/Program mantığına dokunmaz. */
(function(){
  const CURATED_YKS_TEACHERS=[
  /* Matematik · TYT / AYT */
  {a:"MatMan",d:["Matematik","Matematik (AYT)"],l:"baslangic",n:"Temelden başlayıp düzenli ilerlemek isteyenler için sade anlatım ve kamp akışı.",t:["konu","kamp","soru"]},
  {a:"Bıyıklı Matematik",d:["Matematik","Matematik (AYT)","Geometri","Geometri (AYT)"],l:"baslangic",n:"TYT-AYT kamp, konu anlatımı ve soru çözümünü tek kanalda takip etmek isteyenler için.",t:["konu","kamp","soru"]},
  {a:"Rehber Matematik",d:["Matematik","Matematik (AYT)","Geometri","Geometri (AYT)"],l:"orta",n:"TYT-AYT matematikte kamp, konu ve bol soru çözümü; düzenli seri takip etmek için güçlü seçenek.",t:["konu","kamp","soru"]},
  {a:"Eyüp B.",d:["Matematik","Matematik (AYT)","Geometri","Geometri (AYT)"],l:"ileri",n:"İspat ve mantık odaklı matematik-geometri; özellikle AYT ve seçici sorular için güçlü.",t:["konu","soru","deneme"]},
  {a:"Mert Hoca",d:["Matematik","Matematik (AYT)","Geometri","Geometri (AYT)"],l:"orta",n:"TYT-AYT kamp düzeni, soru çözümü ve geometri serileriyle geniş arşiv.",t:["konu","kamp","soru"]},
  {a:"Matematiğin Güler Yüzü",d:["Matematik","Matematik (AYT)"],l:"hepsi",n:"Geniş TYT-AYT arşivi; konu öğrenme, tekrar ve soru çözümünü birlikte yürütmek için.",t:["konu","soru","kamp"]},
  {a:"İlyas Güneş",d:["Matematik","Matematik (AYT)"],l:"orta",n:"Dinamik anlatım ve soru çözümü; temeli olan öğrencinin hız kazanmasına uygun.",t:["konu","soru"]},
  {a:"SML Hoca",d:["Matematik","Matematik (AYT)"],l:"ileri",n:"Zor ve farklı soru tipleri; yüksek net hedefleyenler için soru çözüm ağırlıklı.",t:["soru","deneme"]},
  {a:"Moz Akademi",d:["Matematik","Matematik (AYT)"],l:"ileri",n:"Konu yerine soru üzerinden öğrenmeyi seven ve temeli olan öğrenciler için.",t:["soru","deneme"]},
  {a:"Barış Çelenk",d:["Matematik","Matematik (AYT)"],l:"ileri",n:"Özgün ve seçici matematik soruları; ileri seviye pratik için.",t:["soru","deneme"]},

  /* Geometri */
  {a:"Kenan Kara",d:["Geometri","Geometri (AYT)"],l:"hepsi",n:"TYT-AYT geometriyi baştan sona kamp ve konu serileriyle takip etmek isteyenler için ana kaynaklardan biri.",t:["konu","kamp","soru"]},
  {a:"Merkeze Teğet Geometri",d:["Geometri","Geometri (AYT)"],l:"ileri",n:"Geometride seçici soru ve ileri seviye çözüm görmek isteyenler için.",t:["soru","kamp"]},
  {a:"Nurtaç Hoca",d:["Geometri","Geometri (AYT)"],l:"orta",n:"Geometri konu anlatımı ve soru çözümünü dengeli götüren alternatif.",t:["konu","soru"]},

  /* Türkçe / Edebiyat */
  {a:"Rüştü Hoca",d:["Türkçe","Edebiyat"],l:"orta",n:"TYT Türkçe, paragraf ve dil bilgisi; ayrıca YKS tekrar içerikleri için güçlü seçenek.",t:["konu","kamp","soru"]},
  {a:"Türkçenin Matematiği",d:["Türkçe"],l:"orta",n:"Paragraf ve dil bilgisinde teknik, kısa ve uygulanabilir anlatım isteyenler için.",t:["konu","soru","kamp"]},
  {a:"Deniz Hoca",d:["Edebiyat"],l:"orta",n:"AYT edebiyat konu anlatımı, tekrar ve soru çözümü için düzenli arşiv.",t:["konu","soru","kamp"]},

  /* Fizik · TYT / AYT */
  {a:"Özcan Aykın",d:["Fizik","Fizik (AYT)"],l:"hepsi",n:"TYT ve AYT fizik kampları; deney, görsel ve mantık üzerinden kapsamlı anlatım.",t:["konu","kamp","soru"]},
  {a:"VIP Fizik",d:["Fizik","Fizik (AYT)"],l:"baslangic",n:"Tane tane konu anlatımı; TYT-AYT kamp serileriyle temelden ilerlemek için.",t:["konu","kamp","soru"]},
  {a:"Umut Öncül",d:["Fizik","Fizik (AYT)"],l:"orta",n:"Kavramsal fizik, TYT-AYT kamp ve soru çözümü; neden-sonuç mantığını kurmak isteyenlere.",t:["konu","kamp","soru"]},
  {a:"Ertan Sinan Şahin",d:["Fizik","Fizik (AYT)"],l:"ileri",n:"YKS fizik yorum gücü, seçici soru ve tekrar programlarıyla ileri hedefler için.",t:["konu","soru","deneme"]},
  {a:"Fizikle Barış",d:["Fizik","Fizik (AYT)"],l:"orta",n:"TYT-AYT konu, kamp ve soru çözümü; farklı anlatım görmek isteyenler için geniş arşiv.",t:["konu","kamp","soru"]},
  {a:"Altuğ Güneş",d:["Fizik","Fizik (AYT)"],l:"orta",n:"Anlaşılır TYT-AYT fizik anlatımı ve soru çözümü.",t:["konu","soru","kamp"]},
  {a:"Fizikfinito",d:["Fizik","Fizik (AYT)"],l:"orta",n:"Soru çözümü ve tekrar ağırlıklı fizik çalışmak isteyenler için.",t:["soru","deneme"]},
  {a:"Fizik Evim",d:["Fizik","Fizik (AYT)"],l:"baslangic",n:"Temel fizik konularını daha sakin tempoda öğrenmek isteyenler için.",t:["konu","soru"]},

  /* Kimya · TYT / AYT — 10 doğrulanmış kaynak */
  {a:"Ferrum",d:["Kimya","Kimya (AYT)"],l:"hepsi",n:"Kısa ve net anlatım; TYT ve AYT kamp, konu, soru ve deneme serileri.",t:["konu","kamp","soru"]},
  {a:"Kimya Adası",d:["Kimya","Kimya (AYT)"],l:"baslangic",n:"Sınıf ortamı hissi veren akılda kalıcı anlatım; TYT-AYT temel kurmak için.",t:["konu","kamp","soru"]},
  {a:"Meschemy Kimya",d:["Kimya","Kimya (AYT)"],l:"baslangic",n:"Kafayı karıştırmadan temel-orta seviye kimya; TYT-AYT kamp ve soru çözümü.",t:["konu","kamp","soru"]},
  {a:"Paraksilen Kimya",d:["Kimya","Kimya (AYT)"],l:"orta",n:"TYT-AYT konu anlatımı, PDF destekli kamp ve farklı soru çözüm yaklaşımları.",t:["konu","kamp","soru"]},
  {a:"Kimya Dersleri · Sinan İhtiyaroğlu",d:["Kimya","Kimya (AYT)"],l:"hepsi",n:"29 günlük TYT ve 45 günlük AYT gibi planlı kamp serileri; tam konu ve soru akışı.",t:["konu","kamp","soru"]},
  {a:"Semih Balmuk Kimya",d:["Kimya","Kimya (AYT)"],l:"orta",n:"Güncel müfredat, kazanım odaklı konu ve bol soru çözümü; TYT-AYT tekrarları güçlü.",t:["konu","soru","deneme"]},
  {a:"Levent Özdede ile Kimya",d:["Kimya","Kimya (AYT)"],l:"orta",n:"TYT-AYT kimyada özgün anlatım, kamp ve deneme çözümleri.",t:["konu","kamp","soru"]},
  {a:"Görkem Şahin · Benim Hocam",d:["Kimya","Kimya (AYT)"],l:"hepsi",n:"Benim Hocam kanalındaki güncel TYT ve AYT Kimya ders serileri; kapsamlı anlatım isteyenlere.",t:["konu","kamp","soru"]},

  /* Biyoloji · TYT / AYT */
  {a:"Biosem",d:["Biyoloji","Biyoloji (AYT)"],l:"hepsi",n:"TYT-AYT biyolojiyi mantık odaklı kamp, konu ve soru bankası çözümüyle takip etmek için.",t:["konu","kamp","soru"]},
  {a:"Dr. Biyoloji",d:["Biyoloji","Biyoloji (AYT)"],l:"ileri",n:"Detaylı ve kavramsal anlatım; TYT-AYT kamp ve seçici biyoloji soruları.",t:["konu","kamp","soru"]},
  {a:"Selin Hoca",d:["Biyoloji","Biyoloji (AYT)"],l:"hepsi",n:"TYT-AYT kamp, FULLNET, deneme ve soru çözümü; düzenli seri isteyenlere.",t:["konu","kamp","deneme"]},
  {a:"Senin Biyolojin",d:["Biyoloji","Biyoloji (AYT)"],l:"orta",n:"TYT-AYT konu notları, soru çözümü, podcast ve tekrar içerikleriyle geniş arşiv.",t:["konu","soru","kamp"]},
  {a:"Betül Biyoloji",d:["Biyoloji","Biyoloji (AYT)"],l:"baslangic",n:"Tane tane biyoloji anlatımı; TYT-AYT temel kurma ve soru çözümü için.",t:["konu","soru","kamp"]},
  {a:"Cici Biyoloji",d:["Biyoloji","Biyoloji (AYT)"],l:"orta",n:"Konu özeti, tekrar ve YKS biyoloji pratikleri için kısa alternatif kaynak.",t:["konu","soru"]},

  /* Tarih / Coğrafya */
  {a:"Yavuz Tuna Coğrafya",d:["Coğrafya","Coğrafya (AYT)"],l:"hepsi",n:"TYT-AYT coğrafyada ayrıntılı konu, kamp ve soru çözüm listeleri.",t:["konu","kamp","soru"]},
  {a:"Coğrafyanın Kodları",d:["Coğrafya","Coğrafya (AYT)"],l:"baslangic",n:"Kodlama ve çağrışımlarla TYT-AYT coğrafya tekrarını hızlandırmak isteyenler için.",t:["konu","kamp"]},
  {a:"KR Akademi",d:["Tarih","Tarih (AYT)","Coğrafya","Coğrafya (AYT)"],l:"orta",n:"Sosyal derslerde YKS konu anlatımı, kamp ve tekrar videoları.",t:["konu","kamp","soru"]},

  /* Genel YKS platformları — branşlarda ek alternatif */
  {a:"Hocalara Geldik",d:["Türkçe","Matematik","Matematik (AYT)","Geometri","Geometri (AYT)","Fizik","Fizik (AYT)","Kimya","Kimya (AYT)","Biyoloji","Biyoloji (AYT)","Tarih","Tarih (AYT)","Coğrafya","Coğrafya (AYT)","Felsefe","Din Kültürü","Edebiyat"],l:"hepsi",n:"Birçok YKS dersinde konu anlatımı, soru çözümü, kamp ve tekrar arşivi bulunan genel platform.",t:["konu","kamp","soru"]},
  {a:"Tonguç Akademi",d:["Türkçe","Matematik","Matematik (AYT)","Geometri","Geometri (AYT)","Fizik","Fizik (AYT)","Kimya","Kimya (AYT)","Biyoloji","Biyoloji (AYT)","Tarih","Tarih (AYT)","Coğrafya","Coğrafya (AYT)","Felsefe","Din Kültürü","Edebiyat"],l:"baslangic",n:"Geniş YKS arşivi; temel konu, kamp, hızlı tekrar ve soru çözümü için genel alternatif.",t:["konu","kamp","soru"]}
];
  try{
    if(typeof TEACHERS!=="undefined"&&Array.isArray(TEACHERS)){
      TEACHERS.splice(0,TEACHERS.length,...CURATED_YKS_TEACHERS);
    }
    if(typeof TEACH_SUBJECTS!=="undefined"&&Array.isArray(TEACH_SUBJECTS)){
      const subjects=[...new Set(CURATED_YKS_TEACHERS.flatMap(t=>Array.isArray(t.d)?t.d:[]))].sort((a,b)=>a.localeCompare(b,"tr"));
      TEACH_SUBJECTS.splice(0,TEACH_SUBJECTS.length,...subjects);
    }
    window.__YKS_CURATED_TEACHERS__=CURATED_YKS_TEACHERS.map(t=>({a:t.a,d:[...(t.d||[])],l:t.l,n:t.n,t:[...(t.t||[])]}));
    document.documentElement.dataset.teachersCatalog="curated-v3";
  }catch(error){
    try{console.error("[teachers-curated]",error);}catch(_){ }
  }
})();
