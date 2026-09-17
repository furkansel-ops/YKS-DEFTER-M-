type ExamKind="TYT"|"AYT"|"YDT";
type LegacySubject={name:string;topics:string[]};
type LegacyCurriculum=Record<ExamKind,LegacySubject[]>;
type TopicCardInfo={card:HTMLElement;exam:ExamKind;subject:string;displaySubject:string;done:number;total:number;pct:number;shown:number;group:string};

declare const CURRICULUM:LegacyCurriculum;
declare const ALL_SUBJECTS:Array<{exam:ExamKind;name:string;topics:string[]}>;
declare const SUBJ_NAMES:string[];

type LegacyWindow=Window&{
  renderSubjects?:()=>void;
  renderReviewQueue?:()=>void;
};

const EXAMS:ExamKind[]=["TYT","AYT","YDT"];

/* Mevcut anahtarlar korunur. Böylece eski konu ilerlemesi silinmez; eksik başlıklar
   yalnız eklenir ve yeni arayüzde daha düzgün adlarla gösterilir. */
export const CURRICULUM_V46:LegacyCurriculum={
  TYT:[
    {name:"Türkçe",topics:["Sözcükte Anlam","Cümlede Anlam","Paragraf","Ses Bilgisi","Yazım Kuralları","Noktalama","Sözcükte Yapı","Sözcük Türleri","Tamlamalar","Fiiller","Fiilimsi","Ek Fiil","Cümlenin Ögeleri","Cümle Türleri","Anlatım Bozukluğu","Sözel Mantık"]},
    {name:"Matematik",topics:["Temel Kavramlar","Sayı Basamakları","Sayılar","Bölme-Bölünebilme","EBOB-EKOK","Rasyonel Sayılar","Ondalıklı Sayılar","Basit Eşitsizlik","Mutlak Değer","Üslü Sayılar","Köklü Sayılar","Çarpanlara Ayırma","Oran-Orantı","Denklem Çözme","Problemler","Kümeler","Mantık","Fonksiyonlar","Polinomlar","İkinci Dereceden Denklemler","Permütasyon-Kombinasyon","Binom","Olasılık","Veri ve İstatistik"]},
    {name:"Geometri",topics:["Temel Kavramlar","Doğruda Açılar","Üçgenler","Çokgenler","Dörtgenler","Çember-Daire","Analitik Geometri","Katı Cisimler"]},
    {name:"Fizik",topics:["Fizik Bilimine Giriş","Madde ve Özellikleri","Hareket ve Kuvvet","İş-Güç-Enerji","Isı-Sıcaklık-Genleşme","Basınç","Kaldırma Kuvveti","Elektrostatik","Elektrik ve Manyetizma","Optik","Dalgalar","Basit Makineler"]},
    {name:"Kimya",topics:["Kimya Bilimi","Atom ve Yapısı","Periyodik Sistem","Kimyasal Türler Arası Etkileşim","Maddenin Halleri","Kimyanın Temel Kanunları","Mol Kavramı","Kimyasal Hesaplamalar","Kimyasal Tepkimeler","Karışımlar","Asit-Baz-Tuz","Kimya Her Yerde"]},
    {name:"Biyoloji",topics:["Canlıların Ortak Özellikleri","Canlıların Temel Bileşenleri","Hücre","Madde Geçişleri","Canlıların Sınıflandırılması","Hücre Bölünmeleri","Üreme","Kalıtım","Ekosistem Ekolojisi","Çevre Sorunları"]},
    {name:"Tarih",topics:["Tarih ve Zaman","İlk Uygarlıklar","İlk ve Orta Çağlarda Türk Dünyası","İslam Medeniyetinin Doğuşu","Türk-İslam Devletleri","Yerleşme ve Devletleşme Sürecinde Selçuklu Türkiyesi","Osmanlı Kuruluş","Osmanlı Yükselme","Osmanlı Değişim Çağı","Avrupa ve Osmanlı","XX. Yüzyıl Başlarında Osmanlı","Milli Mücadele","Atatürkçülük ve Türk İnkılabı"]},
    {name:"Coğrafya",topics:["Doğa ve İnsan","Dünyanın Şekli ve Hareketleri","Coğrafi Konum","Harita Bilgisi","Atmosfer ve İklim","Basınç ve Rüzgârlar","Nem ve Yağış","İç Kuvvetler","Dış Kuvvetler","Su-Toprak-Bitkiler","Nüfus","Göç","Yerleşme","Türkiye'nin Yer Şekilleri","Ekonomik Faaliyetler","Bölgeler","Doğal Afetler"]},
    {name:"Felsefe",topics:["Felsefeye Giriş","Bilgi Felsefesi","Varlık Felsefesi","Ahlak Felsefesi","Sanat Felsefesi","Din Felsefesi","Siyaset Felsefesi"]},
    {name:"Din Kültürü",topics:["Bilgi ve İnanç","İslam ve İbadet","Ahlak ve Değerler","Allah-İnsan İlişkisi","Hz. Muhammed","Vahiy ve Akıl","Din-Kültür-Medeniyet","Güncel Dinî Meseleler","Dinler Tarihi"]}
  ],
  AYT:[
    {name:"Matematik (AYT)",topics:["Fonksiyonlar","Polinomlar","İkinci Dereceden Denklemler","Karmaşık Sayılar","Eşitsizlikler","Parabol","Permütasyon-Kombinasyon","Binom","Olasılık","Trigonometri","Logaritma","Diziler","Limit","Türev","İntegral"]},
    {name:"Geometri (AYT)",topics:["Üçgenler","Çokgenler","Dörtgenler","Çember-Daire","Analitik-Doğru","Analitik-Çember","Katı Cisimler","Dönüşümler"]},
    {name:"Fizik (AYT)",topics:["Vektörler","Kuvvet-Denge","Tork","Basit Makineler","Newton Yasaları","İş-Güç-Enerji","İtme-Momentum","Elektrik-Manyetizma","Elektrik Alan ve Potansiyel","Sığa","Manyetizma ve Elektromanyetik İndüksiyon","Alternatif Akım ve Transformatörler","Çembersel Hareket","Kütle Çekim ve Kepler Yasaları","Basit Harmonik Hareket","Dalga Mekaniği","Atom Fiziği ve Radyoaktivite","Modern Fizik","Modern Fiziğin Teknolojideki Uygulamaları"]},
    {name:"Kimya (AYT)",topics:["Modern Atom Teorisi","Gazlar","Sıvı Çözeltiler","Kimyasal Tepkimelerde Enerji","Kimyasal Tepkimelerde Hız","Kimyasal Denge","Asit-Baz Dengesi","Çözünürlük Dengesi","Elektrokimya","Karbon Kimyasına Giriş","Organik Kimya","Enerji Kaynakları ve Bilimsel Gelişmeler"]},
    {name:"Biyoloji (AYT)",topics:["Sinir Sistemi","Endokrin Sistem","Duyu Organları","Destek-Hareket","Sindirim","Dolaşım-Bağışıklık","Solunum","Boşaltım","Üreme","Genetik","Genden Proteine","Genetik Mühendisliği ve Biyoteknoloji","Canlılarda Enerji Dönüşümleri","Bitki Biyolojisi","Ekosistem","Komünite","Popülasyon"]},
    {name:"Edebiyat",topics:["Güzel Sanatlar ve Edebiyat","Metinlerin Sınıflandırılması","Şiir Bilgisi","Söz Sanatları","İslamiyet Öncesi ve Geçiş Dönemi","Halk Edebiyatı","Divan Edebiyatı","Tanzimat","Servet-i Fünun","Fecr-i Âti","Milli Edebiyat","Cumhuriyet Dönemi","Roman-Hikaye","Tiyatro","Edebi Akımlar","Dünya Edebiyatı"]},
    {name:"Tarih (AYT)",topics:["Beylikten Devlete Osmanlı","Dünya Gücü Osmanlı","Osmanlı Duraklama","Osmanlı Gerileme","Osmanlı Dağılma","Değişim Çağında Avrupa ve Osmanlı","Uluslararası İlişkilerde Denge Stratejisi","XX. Yüzyıl Başlarında Osmanlı","İnkılap Tarihi","Kurtuluş Savaşı","Atatürk İlkeleri","Çağdaş Türk-Dünya Tarihi"]},
    {name:"Coğrafya (AYT)",topics:["Ekosistem","Nüfus Politikaları","Şehirleşme","Ekonomik Faaliyetler","Türkiye Ekonomisi","Bölgeler","Ulaşım","Jeopolitik Konum","Ülkeler ve Bölgeler","Çevre ve Toplum","Küresel Ortam"]},
    {name:"Tarih-2",topics:["İlk Çağ Uygarlıkları","Türklerin İlk Dönemleri","İslam Tarihi","Türk-İslam Devletleri","Osmanlı Siyasi Tarihi","Osmanlı Kültür ve Medeniyeti","XX. Yüzyıl Türk ve Dünya Tarihi","Milli Mücadele","Atatürkçülük","Soğuk Savaş Sonrası"]},
    {name:"Coğrafya-2",topics:["Doğal Sistemler","Beşerî Sistemler","Ekonomik Faaliyetler","Türkiye Coğrafyası","Küresel Ticaret","Bölgeler ve Ülkeler","Çevre ve Toplum"]},
    {name:"Felsefe Grubu",topics:["Felsefeye Giriş","Bilgi Felsefesi","Varlık Felsefesi","Ahlak Felsefesi","Din Felsefesi","Siyaset Felsefesi","Sanat Felsefesi","Psikoloji","Sosyoloji","Mantık"]},
    {name:"Din Kültürü (AYT)",topics:["Kur'an ve Yorumu","İslam ve Bilim","İslam Düşüncesinde Yorumlar","Din-Kültür-Medeniyet","Yaşayan Dinler"]}
  ],
  YDT:[
    {name:"Yabancı Dil",topics:["Kelime Bilgisi","Dil Bilgisi","Cloze Test","Cümle Tamamlama","Çeviri","İngilizce → Türkçe Çeviri","Türkçe → İngilizce Çeviri","Paragraf","Paragraf Tamamlama","Anlamca Yakın Cümle","Diyalog Tamamlama","Duruma Uygun İfade","Anlatım Bütünlüğü","Anlatım Bütünlüğünü Bozan Cümle"]}
  ]
};

const TOPIC_LABELS:Record<string,string>={
  "Bölme-Bölünebilme":"Bölme ve Bölünebilme","EBOB-EKOK":"EBOB – EKOK","Çember-Daire":"Çember ve Daire",
  "İş-Güç-Enerji":"İş, Güç ve Enerji","Isı-Sıcaklık-Genleşme":"Isı, Sıcaklık ve Genleşme","Asit-Baz-Tuz":"Asit, Baz ve Tuz",
  "Analitik-Doğru":"Analitik Geometri – Doğru","Analitik-Çember":"Analitik Geometri – Çember","Kuvvet-Denge":"Kuvvet ve Denge",
  "İtme-Momentum":"İtme ve Momentum","Elektrik-Manyetizma":"Elektrik ve Manyetizma","Destek-Hareket":"Destek ve Hareket",
  "Dolaşım-Bağışıklık":"Dolaşım ve Bağışıklık","Roman-Hikaye":"Roman ve Hikâye","Su-Toprak-Bitkiler":"Su, Toprak ve Bitkiler"
};

function unique(values:string[]):string[]{return [...new Set(values)];}
function cleanSubject(name:string):string{return name.replace(/\s*\(AYT\)$/," ").trim();}
function displayTopic(name:string):string{return TOPIC_LABELS[name]||name;}

function mergeCurriculum():boolean{
  if(typeof CURRICULUM==="undefined")return false;
  for(const exam of EXAMS){
    const old=new Map((CURRICULUM[exam]||[]).map(subject=>[subject.name,subject]));
    const next=CURRICULUM_V46[exam].map(subject=>{
      const previous=old.get(subject.name);
      const extras=(previous?.topics||[]).filter(topic=>!subject.topics.includes(topic));
      return {name:subject.name,topics:unique([...subject.topics,...extras])};
    });
    for(const subject of CURRICULUM[exam]||[]){if(!next.some(item=>item.name===subject.name))next.push({name:subject.name,topics:[...subject.topics]});}
    CURRICULUM[exam].splice(0,CURRICULUM[exam].length,...next);
  }
  if(typeof ALL_SUBJECTS!=="undefined"){
    ALL_SUBJECTS.splice(0,ALL_SUBJECTS.length);
    for(const exam of EXAMS)for(const subject of CURRICULUM[exam])ALL_SUBJECTS.push({exam,name:subject.name,topics:subject.topics});
  }
  if(typeof SUBJ_NAMES!=="undefined"){
    const names=unique(EXAMS.flatMap(exam=>CURRICULUM[exam].map(subject=>subject.name)));
    SUBJ_NAMES.splice(0,SUBJ_NAMES.length,...names);
  }
  document.documentElement.dataset.curriculumV46="ready";
  return true;
}

function cardExam(card:HTMLElement):ExamKind|null{
  const id=card.querySelector<HTMLElement>(":scope>.topics")?.id||"";
  const match=id.match(/^tp(TYT|AYT|YDT)/);
  return (match?.[1] as ExamKind|undefined)||null;
}
function subjectName(card:HTMLElement):string{
  const node=card.querySelector<HTMLElement>(".subj-head .nm");
  if(!node)return "Ders";
  const copy=node.cloneNode(true) as HTMLElement;
  copy.querySelectorAll("small,.subj-sub").forEach(child=>child.remove());
  return (copy.textContent||"Ders").trim();
}
function progress(card:HTMLElement):{done:number;total:number;pct:number}{
  const text=card.querySelector<HTMLElement>(".subj-head .pct")?.textContent||"";
  const ratio=text.match(/(\d+)\s*\/\s*(\d+)/),percent=text.match(/%(\d+)/);
  return {done:ratio?Number(ratio[1]):0,total:ratio?Number(ratio[2]):0,pct:percent?Number(percent[1]):0};
}
function subjectGroup(exam:ExamKind,name:string):string{
  if(exam==="YDT")return "Dil";
  if(exam==="TYT"){
    if(["Türkçe","Matematik","Geometri"].includes(name))return "Temel";
    if(["Fizik","Kimya","Biyoloji"].includes(name))return "Fen";
    return "Sosyal";
  }
  if(["Matematik (AYT)","Geometri (AYT)","Fizik (AYT)","Kimya (AYT)","Biyoloji (AYT)"].includes(name))return "Sayısal";
  return "Edebiyat – Sosyal";
}
function cardInfo(card:HTMLElement):TopicCardInfo|null{
  const exam=cardExam(card);if(!exam)return null;
  const subject=subjectName(card),p=progress(card),shown=card.querySelectorAll(":scope>.topics>.topic").length;
  return {card,exam,subject,displaySubject:cleanSubject(subject),...p,shown,group:subjectGroup(exam,subject)};
}
function currentExam(section:HTMLElement):ExamKind{
  for(const exam of EXAMS)if(section.querySelector<HTMLButtonElement>(`#seg${exam}`)?.classList.contains("on"))return exam;
  return "TYT";
}
function examSummary(exam:ExamKind):{subjects:number;topics:number}{
  const subjects=typeof CURRICULUM!=="undefined"?(CURRICULUM[exam]||[]):CURRICULUM_V46[exam];
  return {subjects:subjects.length,topics:subjects.reduce((sum,subject)=>sum+subject.topics.length,0)};
}
function topicControls(row:HTMLElement):void{
  row.classList.add("v46-topic-row");
  const title=row.querySelector<HTMLElement>(".topic-name-btn");
  if(title){
    const first=[...title.childNodes].find(node=>node.nodeType===Node.TEXT_NODE);
    if(first&&first.textContent)first.textContent=displayTopic(first.textContent.trim())+" ";
  }
  const pills=[...row.querySelectorAll<HTMLButtonElement>(".pill")];
  ["İşledim","Soru çözdüm","Pekişti"].forEach((label,index)=>{if(pills[index])pills[index].textContent=label;});
  const open=row.querySelector<HTMLButtonElement>(".topic-open");if(open){open.textContent="Detay";open.setAttribute("aria-label","Konu detayını aç");}
  const resource=row.querySelector<HTMLButtonElement>(".tres");if(resource&&resource.textContent?.trim()==="＋")resource.textContent="Kaynak";
}

function buildShell(section:HTMLElement):{
  hub:HTMLElement;examSwitch:HTMLElement;subjectList:HTMLElement;detail:HTMLElement;detailTitle:HTMLElement;detailMeta:HTMLElement;overview:HTMLElement
}{
  const hub=document.createElement("div");hub.className="v46-topics-hub";hub.id="v46TopicsHub";
  hub.innerHTML=`
    <section class="v46-topic-hero">
      <div><span class="v46-kicker">KONU HARİTASI</span><h1>TYT, AYT ve YDT konularını tek yerden yönet</h1><p>Dersi seç, konuları geniş alanda gör ve ilerlemeni doğrudan güncelle.</p></div>
      <div class="v46-hero-progress" id="v46TopicOverview"><strong>0%</strong><span>seçili sınav ilerlemesi</span></div>
    </section>
    <div class="v46-exam-switch" id="v46ExamSwitch" role="tablist" aria-label="Sınav seçimi"></div>
    <div class="v46-toolbar-slot" id="v46ToolbarSlot"></div>
    <section class="v46-topic-workspace">
      <aside class="v46-subject-panel"><div class="v46-panel-head"><div><small>DERSLER</small><b id="v46SubjectCount">Ders seç</b></div><span id="v46ShownCount"></span></div><div class="v46-subject-list" id="v46SubjectList"></div></aside>
      <main class="v46-detail-panel"><div class="v46-detail-head"><div><small id="v46DetailExam">TYT</small><h2 id="v46DetailTitle">Ders seç</h2><p id="v46DetailMeta">Konu listesi burada açılacak.</p></div><div class="v46-detail-progress"><strong id="v46DetailPct">0%</strong><span>tamamlandı</span></div></div><div class="v46-detail-topics" id="v46DetailTopics"></div></main>
    </section>
    <details class="v46-analysis" id="v46TopicAnalysis"><summary><span><small>PLAN VE ANALİZ</small><b>Hedefler, tekrarlar ve dikkat isteyen konular</b></span><i>›</i></summary><div class="v46-analysis-grid" id="v46AnalysisGrid"></div></details>`;
  section.prepend(hub);
  const tools=section.querySelector<HTMLElement>(".v26-topic-tools");if(tools)hub.querySelector("#v46ToolbarSlot")?.appendChild(tools);
  const analysis=hub.querySelector<HTMLElement>("#v46AnalysisGrid");
  for(const id of ["v26TopicOverview","v4TopicGoals","v26TopicAttention"]){const card=section.querySelector<HTMLElement>(`#${id}`);if(card)analysis?.appendChild(card);}
  const legacySeg=[...section.querySelectorAll<HTMLElement>(":scope>.seg")].find(seg=>seg.querySelector("#segTYT"));legacySeg?.classList.add("v46-legacy-exam-seg");
  section.classList.add("v46-topics-ready");
  return {
    hub,examSwitch:hub.querySelector("#v46ExamSwitch") as HTMLElement,subjectList:hub.querySelector("#v46SubjectList") as HTMLElement,
    detail:hub.querySelector("#v46DetailTopics") as HTMLElement,detailTitle:hub.querySelector("#v46DetailTitle") as HTMLElement,
    detailMeta:hub.querySelector("#v46DetailMeta") as HTMLElement,overview:hub.querySelector("#v46TopicOverview") as HTMLElement
  };
}

export function installTopicsHubV46():{installed:boolean;destroy:()=>void}{
  const section=document.getElementById("topics"),legacyList=document.getElementById("subjectList");
  if(!(section instanceof HTMLElement)||!(legacyList instanceof HTMLElement))return {installed:false,destroy:()=>{}};
  if(section.querySelector("#v46TopicsHub"))return {installed:true,destroy:()=>{}};

  mergeCurriculum();
  const legacy=window as unknown as LegacyWindow;
  legacy.renderSubjects?.();legacy.renderReviewQueue?.();

  const ui=buildShell(section);
  let exam=currentExam(section),selectedSubject="",scheduled=false,destroyed=false;

  const examButtons=()=>{
    ui.examSwitch.innerHTML="";
    const descriptions:Record<ExamKind,string>={TYT:"Temel yeterlilik",AYT:"Alan yeterlilik",YDT:"Yabancı dil"};
    for(const value of EXAMS){
      const stat=examSummary(value),button=document.createElement("button");
      button.type="button";button.className="v46-exam-card";button.dataset.exam=value;button.setAttribute("role","tab");
      button.innerHTML=`<span>${value}</span><b>${descriptions[value]}</b><small>${stat.subjects} ders · ${stat.topics} konu</small><i>›</i>`;
      button.addEventListener("click",()=>{
        if(exam===value)return;exam=value;selectedSubject="";
        section.querySelector<HTMLButtonElement>(`#seg${value}`)?.click();
        window.requestAnimationFrame(render);
      });
      ui.examSwitch.appendChild(button);
    }
  };

  const allCards=():TopicCardInfo[]=>[...legacyList.querySelectorAll<HTMLElement>(":scope>.subj")].map(cardInfo).filter((item):item is TopicCardInfo=>!!item);

  const renderDetail=(item:TopicCardInfo|null):void=>{
    const examLabel=ui.hub.querySelector<HTMLElement>("#v46DetailExam"),pct=ui.hub.querySelector<HTMLElement>("#v46DetailPct");
    if(!item){ui.detailTitle.textContent="Bu görünümde ders bulunamadı";ui.detailMeta.textContent="Arama veya filtreyi temizleyip tekrar dene.";ui.detail.innerHTML='<div class="v46-empty">Gösterilecek konu yok.</div>';if(pct)pct.textContent="0%";return;}
    if(examLabel)examLabel.textContent=`${item.exam} · ${item.group}`;
    ui.detailTitle.textContent=item.displaySubject;
    ui.detailMeta.textContent=`${item.shown} konu gösteriliyor · ${item.done}/${item.total} tamamlandı`;
    if(pct)pct.textContent=`${item.pct}%`;
    ui.detail.innerHTML="";
    const rows=[...item.card.querySelectorAll<HTMLElement>(":scope>.topics>.topic")];
    rows.forEach((row,index)=>{
      const clone=row.cloneNode(true) as HTMLElement;topicControls(clone);clone.dataset.topicIndex=String(index+1);ui.detail.appendChild(clone);
    });
    if(!rows.length)ui.detail.innerHTML='<div class="v46-empty">Bu ders için mevcut filtrede konu bulunamadı.</div>';
  };

  const render=():void=>{
    if(destroyed)return;
    examButtons();
    ui.examSwitch.querySelectorAll<HTMLButtonElement>(".v46-exam-card").forEach(button=>{const on=button.dataset.exam===exam;button.classList.toggle("on",on);button.setAttribute("aria-selected",String(on));});
    const cards=allCards().filter(item=>item.exam===exam);
    if(!cards.some(item=>item.subject===selectedSubject))selectedSubject=cards[0]?.subject||"";
    const done=cards.reduce((sum,item)=>sum+item.done,0),total=cards.reduce((sum,item)=>sum+item.total,0),pct=total?Math.round(done/total*100):0;
    ui.overview.querySelector("strong")!.textContent=`${pct}%`;
    const count=ui.hub.querySelector<HTMLElement>("#v46SubjectCount"),shown=ui.hub.querySelector<HTMLElement>("#v46ShownCount");
    if(count)count.textContent=`${cards.length} ders`;
    if(shown)shown.textContent=`${cards.reduce((sum,item)=>sum+item.shown,0)} konu`;
    ui.subjectList.innerHTML="";
    let previousGroup="";
    for(const item of cards){
      if(item.group!==previousGroup){const group=document.createElement("div");group.className="v46-subject-group";group.textContent=item.group;ui.subjectList.appendChild(group);previousGroup=item.group;}
      const button=document.createElement("button");button.type="button";button.className="v46-subject-card";button.classList.toggle("on",item.subject===selectedSubject);
      button.innerHTML=`<span class="v46-subject-icon">${item.displaySubject.slice(0,1).toLocaleUpperCase("tr")}</span><span class="v46-subject-main"><b></b><small>${item.shown} konu · ${item.done}/${item.total} bitti</small><em><i style="width:${item.pct}%"></i></em></span><strong>${item.pct}%</strong>`;
      const name=button.querySelector<HTMLElement>(".v46-subject-main>b");if(name)name.textContent=item.displaySubject;
      button.addEventListener("click",()=>{selectedSubject=item.subject;render();ui.hub.querySelector(".v46-detail-panel")?.scrollIntoView({block:"nearest",behavior:"smooth"});});
      ui.subjectList.appendChild(button);
    }
    const active=cards.find(item=>item.subject===selectedSubject)||cards[0]||null;renderDetail(active);
    const searchInfo=section.querySelector<HTMLElement>("#searchInfo");if(searchInfo)searchInfo.textContent=cards.length?`${exam}: ${cards.reduce((sum,item)=>sum+item.shown,0)} konu gösteriliyor`: `${exam}: eşleşen konu yok`;
    document.documentElement.dataset.topicsHubV46="ready";
  };
  const schedule=()=>{if(scheduled||destroyed)return;scheduled=true;window.requestAnimationFrame(()=>{scheduled=false;render();});};

  examButtons();render();
  const observer=new MutationObserver(records=>{if(records.some(record=>record.type==="childList"))schedule();});
  observer.observe(legacyList,{childList:true});
  for(const value of EXAMS)section.querySelector(`#seg${value}`)?.addEventListener("click",()=>{exam=value;selectedSubject="";schedule();});
  window.addEventListener("yks:data-changed",schedule);

  return {installed:true,destroy:()=>{destroyed=true;observer.disconnect();window.removeEventListener("yks:data-changed",schedule);}};
}
