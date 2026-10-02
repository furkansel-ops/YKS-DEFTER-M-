import {refinedProgramTasks} from "./refined-program";

export type ConversationAction="talk"|"today"|"motivate"|"study"|"break";
export type ConversationTask={id:string;text:string;done:boolean};
export type ConversationContext={date:string;name:string;mascotName:string;tasks:ConversationTask[];tomorrow:ConversationTask[];questions:number;minutes:number;focusing:boolean};
const object=(value:unknown):Record<string,unknown>=>value&&typeof value==="object"?value as Record<string,unknown>:{};
const clean=(value:unknown,max=120)=>typeof value==="string"?value.replace(/\s+—\s+https?:\/\/\S+\s*$/i,"").replace(/\s+/g," ").trim().slice(0,max):"";
const key=(date:Date)=>`${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`;
const normalize=(value:string)=>value.toLocaleLowerCase("tr-TR").replace(/[çğıöşü]/g,char=>({ç:"c",ğ:"g",ı:"i",ö:"o",ş:"s",ü:"u"}[char]!));

/** Only reads saved cells for the actual calendar day, regardless of the week shown in Programım. */
export function mascotConversationContext(state:unknown,now:Date,mascotName:string,focusing=false):ConversationContext{
  const source=object(state),date=key(now),tomorrow=new Date(now);tomorrow.setDate(tomorrow.getDate()+1);
  const tasks=(day:Date)=>{const monday=new Date(day);monday.setDate(monday.getDate()-(monday.getDay()+6)%7);return refinedProgramTasks(source,key(monday),(day.getDay()+6)%7).map(task=>({id:task.id,text:clean(task.text),done:task.done}));};
  const count=(map:unknown)=>{const n=Number(object(map)[date]);return Number.isFinite(n)&&n>=0?Math.floor(n):0;};
  return {date,name:clean(source.name,35),mascotName,tasks:tasks(now),tomorrow:tasks(tomorrow),questions:count(source.solved),minutes:count(source.pomoMin),focusing};
}

const SUBJECTS:[string,RegExp][]=[
  ["Matematik",/\b(matemati[kg]\w*|mat|problem\w*)\b/],["Geometri",/\b(geometri\w*|geo|ucgen\w*)\b/],
  ["Türkçe",/\b(turkce\w*|paragraf\w*|yazim\w*|dil bilgisi)\b/],["Fizik",/\bfizik\w*\b/],
  ["Kimya",/\bkimya\w*\b/],["Biyoloji",/\bbiyoloji\w*\b/],["Tarih",/\btarih\w*\b/],
  ["Coğrafya",/\bcografya\w*\b/],["Edebiyat",/\bedebiyat\w*\b/],["İngilizce",/\b(ingilizce\w*|ydt)\b/],
  ["Felsefe",/\bfelsefe\w*\b/],["Din Kültürü",/\bdin\b/]
];
const TOPICS:[string,RegExp][]=[
  ["Paragraf",/\bparagraf\w*\b/],["Yazım Kuralları",/\byazim\w*\b/],
  ["Problemler",/\bproblem\w*\b/],["Üçgenler",/\bucgen\w*\b/],
  ["Türev",/\bturev\w*\b/],["İntegral",/\bintegral\w*\b/]
];

/** Session-only conversation memory. No writes to study records, storage, network or task completion. */
export function createMascotConversation(seed="book"){
  let date="",subject="",topic="",lastIntent="",studyIndex=0;
  let awaiting:""|"subject"|"topic"|"difficulty"|"start"|"rest"|"mood"="";
  const cursors=new Map<string,number>(),recent:string[]=[];
  const offset=Array.from(seed).reduce((n,char)=>n+char.charCodeAt(0),0);
  function pick(group:string,options:string[]):string{
    const start=cursors.get(group)??offset%options.length;
    const avoid=recent.slice(-Math.min(6,options.length-1));let index=start%options.length;
    for(let i=0;i<options.length;i++){index=(start+i)%options.length;if(!avoid.includes(options[index]!))break;}
    const reply=options[index]!;cursors.set(group,index+1);recent.push(reply);if(recent.length>6)recent.shift();return reply;
  }
  function prepare(context:ConversationContext){if(date!==context.date){date=context.date;subject="";topic="";awaiting="";lastIntent="";studyIndex=0;}}
  const pending=(context:ConversationContext)=>context.tasks.filter(task=>!task.done);
  const progress=(context:ConversationContext)=>`${context.tasks.filter(task=>task.done).length}/${context.tasks.length} görev tamamlandı`;
  function taskReply(context:ConversationContext,summary=false,tomorrow=false):string{
    const tasks=tomorrow?context.tomorrow:context.tasks,remaining=tasks.filter(task=>!task.done),day=tomorrow?"Yarın":"Bugün";
    if(!tasks.length){awaiting="subject";return pick("empty",[
      `${day} için kayıtlı bir görevin görünmüyor. Hangi derse zaman ayırmak istersin?`,
      `${day} programın boş. Tek bir küçük hedef seçebiliriz; aklında hangi ders var?`,
      `${day} için henüz plan eklememişsin. Bir ders ve konu söyle, başlangıcı birlikte küçültelim.`,
      `${day} kayıtlı çalışma yok. Programım’dan bir hedef ekleyebilirsin. Önce hangi dersi seçelim?`
    ]);}
    if(!remaining.length){awaiting="";return pick("all-done",[
      `${day} kayıtlı ${tasks.length} görevin de tamamlanmış. Emeğine sağlık! Şimdi dinlenmeye yer açabilirsin.`,
      `${day} programında bekleyen iş kalmamış; ${tasks.length}/${tasks.length} tamam. İstersen kısa bir tekrar, istersen mola.`,
      `${day} bütün görevler işaretli. Biraz nefes al; yeni hedef eklemek zorunda değilsin.`,
      `${day} planı tamam: ${tasks.length} görev. Çalışmandan aklında kalan bir şeyi söylemek ister misin?`
    ]);}
    if(summary){awaiting="start";const list=remaining.slice(0,3).map(task=>`• ${task.text}`).join("\n"),extra=remaining.length>3?`\nVe ${remaining.length-3} görev daha.`:"";return pick("summary",[
      `${day} ${tasks.length-remaining.length}/${tasks.length} görevin tamam. Kalanlar:\n${list}${extra}\nHangisiyle başlayalım?`,
      `${day} için ${remaining.length} çalışma bekliyor:\n${list}${extra}\nBirini seçersen küçük bir başlangıç belirleyelim.`,
      `${day} planına baktım: ${tasks.length-remaining.length} tamamlanan, ${remaining.length} kalan görev.\n${list}${extra}`,
      `${day} sırada bunlar var:\n${list}${extra}\n${tasks.length-remaining.length}/${tasks.length} tamamlanmış. Önce hangisini ele alalım?`
    ]);}
    const matches=subject?remaining.filter(task=>normalize(task.text).includes(normalize(subject))||(subject==="Türkçe"&&/paragraf|yazim/.test(normalize(task.text)))||(subject==="Matematik"&&/problem/.test(normalize(task.text)))):[];
    const pool=matches.length?matches:remaining,task=pool[studyIndex++%pool.length]!;
    awaiting="start";
    return pick("study",[
      `Kalan programından “${task.text}” ile başlayabilirsin. İlk 10 dakikayı açılış gibi düşün; sonra nasıl gittiğine bakarız.`,
      `Programında “${task.text}” bekliyor. Önce malzemeyi açıp ilk soruya bakalım; bütün çalışmayı bir anda düşünmene gerek yok.`,
      `Bir seçenek: “${task.text}”. Kısa bir blok ayırıp takıldığın ilk noktayı not et.`,
      `Bugünkü sıradan “${task.text}” uygun bir başlangıç. İstersen önce 5 dakikalık konu hatırlatma yap.`,
      `“${task.text}” henüz tamamlanmamış. Bu işin en küçük parçasını seçip başlayalım mı?`,
      `Şu görevle ilerleyebiliriz: “${task.text}”. Hedefimiz ilk adımı atmak; hızını sonra ayarlarsın.`
    ]);
  }
  function difficulty():string{
    awaiting="difficulty";const label=topic||subject||"bu konu";
    return pick("difficulty",[
      `${label} için nerede takılıyorsun: konuyu hatırlamada, soruya başlamada, yoksa süre yetiştirmede mi?`,
      `${label} çalışmasını küçültelim. Bir örneği çözümlü incele, sonra benzer bir soruyu dene. En zor gelen adım hangisi?`,
      `${label} için önce tek bir soruya bakalım. Yanlışında konu eksiği mi, işlem mi, dikkat mi ağır basıyor?`,
      `${label} zor gelmiş olabilir. Son takıldığın soruda hangi noktada durduğunu anlatır mısın?`,
      `${label} için önce bildiğin bir örnekle ısınabilirsin. Takıldığın kısmı söyle; süre mi, konu mu?`,
      `${label} çalışırken bütün konuyu aynı anda bitirmeye çalışma. Bir alt başlık seçelim. Hangisi seni durduruyor?`
    ]);
  }
  function reply(value:string,context:ConversationContext,action?:ConversationAction):string{
    prepare(context);const q=normalize(value.trim().slice(0,180)),previousIntent=lastIntent;
    const foundSubject=SUBJECTS.find(([,pattern])=>pattern.test(q)),foundTopic=TOPICS.find(([,pattern])=>pattern.test(q));
    if(foundSubject){if(subject!==foundSubject[0])topic="";subject=foundSubject[0];}
    if(foundTopic)topic=foundTopic[0];
    // Custom topics in the saved plan participate in follow-ups too.
    let planTopic=false;
    for(const task of context.tasks){const candidate=task.text.split(" · ")[1];if(candidate&&candidate.length>=3&&!/\d+\s*(soru|dk)/.test(candidate)&&q.includes(normalize(candidate))){topic=candidate;planTopic=true;const plannedSubject=SUBJECTS.find(([,pattern])=>pattern.test(normalize(task.text.split(" · ")[0]||"")));if(plannedSubject)subject=plannedSubject[0];}}
    const fatigue=/yorul|yorgun|sikil|bunald|calisasim|istemiyorum|isteksiz|uyku|enerjim yok|odaklanam/.test(q);
    if(action==="break"||(!action&&/\b(mola|dinlen\w*)\b/.test(q)&&!fatigue)){
      lastIntent="break";awaiting="";return pick("break",[
        "Mola iyi gelir. Biraz ekrandan uzaklaş, su iç; dönünce kaldığın tek bir işe bakarız.",
        "Kısa bir ara verelim. Omuzlarını gevşetip biraz hareket edebilirsin. Çalışma burada bekliyor.",
        "Şimdi birkaç dakika nefeslen. Molayı da planın bir parçası sayabilirsin.",
        "Dinlenmeye yer var. İstersen pencereye bak, biraz yürü; geri geldiğinde küçük bir adımla devam ederiz.",
        "Tamam, ara zamanı. Molada yeni bir hedef düşünmek zorunda değilsin.",
        "Biraz ekranı bırakıp rahatlayabilirsin. Döndüğünde “ne çalışayım” yaz; kalan programına bakalım."
      ]);
    }
    if(!action&&fatigue){lastIntent="tired";awaiting="rest";return pick("tired",[
      "Yorulduysan önce ara verelim. Sonra istersen tek bir soruyla dönersin; bugün yükü küçültmek de bir seçim.",
      "Enerjin azalmış gibi. Birkaç dakika dinlenip ardından 5 dakikalık hafif bir tekrar deneyebilirsin.",
      "Şu an büyük bir hedefe gerek yok. Su içip biraz uzaklaş; dönünce en küçük parçayı seçeriz.",
      "Zor bir an olabilir. Kendine yüklenmeden kısa bir mola ver; devam etmeye hazır olduğunda buradayım.",
      "Bugün yavaş ilerlemek sorun değil. Mola mı daha iyi gelir, yoksa kolay bir soruyla ısınmak mı?",
      "Önce nefes alalım. Bütün programı düşünmek yerine dinlendikten sonra tek bir işi ele alabiliriz."
    ]);}
    if(action==="today"||(!action&&/\b(program\w*|plan\w*|kalan|bugun ne|yarin ne)\b/.test(q))){lastIntent="today";return taskReply(context,true,!action&&/\byarin\b/.test(q));}
    if(action==="study"||(!action&&/ne calis|nereden basla|neyle basla|hangisiyle basla|siradaki|ne yapayim/.test(q))){lastIntent="study";return taskReply(context);}
    if(action==="motivate"||(!action&&/motivasyon|motive|cesaret|yapamiyorum|basaram|moralim bozuk/.test(q))){lastIntent="motivate";awaiting="start";const detail=context.tasks.length?`Bugün ${progress(context)}. `:context.questions?`Bugün ${context.questions} soru kaydetmişsin. `:context.minutes?`Bugün ${context.minutes} dakika odak süren kayıtlı. `:"";return pick("motivate",[
      `${detail}Her gün aynı tempoda olmak zorunda değilsin. Sadece sıradaki küçük adımı seçelim.`,
      `${detail}Zorlandığın bir gün bütün emeğini silmez. Bugün yapabileceğin kadarına bakalım.`,
      `${detail}Bir konuyu hemen anlayamamak, öğrenemeyeceğin anlamına gelmez. Bir örnek daha denemek yeterli bir başlangıç.`,
      `${detail}Kendi hızına göre ilerleyebilirsin. Şimdi tek bir soruya odaklanmak nasıl olur?`,
      `${detail}Büyük hedef bazen göz korkutur. Onu bugünkü küçük bir parçaya bölelim.`,
      `${detail}Dünkü çalışmanı geçmişte bırakmadın; üzerine ekliyorsun. Bugün küçük de olsa bir adım seçebilirsin.`,
      `${detail}Mükemmel bir çalışma günü beklemeyelim. Hazır olduğunda kısa bir blokla başlayabilirsin.`,
      `${detail}Her yanlış, tekrar bakabileceğin bir nokta gösterir. Bugün birini anlamak bile ilerleme.`
    ]);}
    if(!action&&/bitird|tamamlad|\bbitti\b/.test(q)){lastIntent="done";awaiting="";const remaining=pending(context);return pick("done",[
      `Emeğine sağlık! ${context.tasks.length?`Kayıtlı programında ${remaining.length} görev bekliyor. `:""}Bitirdiğin işi Programım’da işaretleyebilirsin; ardından mola mı, sıradaki iş mi?`,
      `Güzel bir adım. ${context.tasks.length?`Programın şu an ${progress(context)}. `:""}Henüz işaretlemediysen Programım’dan tamamlayabilirsin. Şimdi biraz nefes almak ister misin?`,
      "Bitirdiğine sevindim! Programım’da tamamlandı olarak işaretle; ardından birlikte kutlayalım. Nasıl geçti?",
      "Çalışma tamam, emeğine sağlık. Programım’daki kutuyu işaretlemeyi unutma. En çok hangi kısmı oturdu?"
    ]);}
    if(!action&&/tekrar ediy|hep ayni|ayni sey|ayni cevap|baska (bir sey|cevap)|farkli cevap/.test(q)&&!foundSubject){lastIntent="repeat";awaiting="mood";subject="";topic="";return pick("repeat",[
      "Haklısın, başka bir yerden bakalım. Bugün aklında kalan tek bir soru ya da olay var mı?",
      "Konuyu değiştirebiliriz. Çalışma dışından da konuşabiliriz; gününün iyi geçen kısmı neydi?",
      "Başka bir başlangıç deneyelim: şu an seni en çok ne meşgul ediyor?",
      "Farklı bir şey konuşalım. Bugün öğrendiğin ilginç bir şey oldu mu?"
    ]);}
    if(!action&&/\b(kimsin|adin ne|nesin|robot musun|yapay zeka)\b/.test(q)){lastIntent="identity";awaiting="";return `Ben ${context.mascotName}, uygulamadaki çalışma arkadaşın. Kayıtlı programına bakıp küçük başlangıçlar önerebilirim. Serbest soruları çözen bir yapay zekâ servisine bağlı değilim; daha çok çalışma ve mola konusunda eşlik ediyorum.`;}
    if(!action&&/\b(tesekkur\w*|sag ?ol\w*|eyvallah)\b/.test(q)){lastIntent="thanks";awaiting="";return pick("thanks",["Rica ederim! Buradayım, kendi hızında devam edebilirsin.","Ne demek 🙂 Küçük adımlarına eşlik etmek güzel.","Her zaman. Şimdi biraz dinlenmek de, devam etmek de sana kalmış.","Sevindim. İhtiyacın olduğunda tekrar seslen."]);}
    if(!action&&/\b(evet|olur|tamam|hadi|baslayalim|hazirim)\b/.test(q)&&q.length<35){
      if(awaiting==="rest")return reply("",context,"break");
      if(awaiting==="subject"){lastIntent="follow-up";return pick("choose-subject",["Hangi dersle başlayalım? Dersin adını yazman yeterli; sonra konuyu seçeriz.","Hangi dersi seçiyorsun? Bir isim yaz, oradan ilerleyelim.","Hangi ders aklında? Bugün tek bir başlıkla başlayabiliriz.","Hangi derse bakalım? Seçimini söyle; başlangıcı küçültelim."]);}
      if(awaiting==="topic"){lastIntent="follow-up";return pick("choose-topic",[`${subject} için hangi konudasın? Konunun adını yazabilirsin.`,`${subject} için hangi konuyu seçelim? En son açtığın başlık neydi?`,`${subject} içinde bir konu belirleyelim. Adını yazar mısın?`,`${subject} için hangi konuya bakmak istersin? Bir başlık yeterli.`]);}
      if(awaiting==="difficulty"){lastIntent="follow-up";return pick("choose-difficulty",[`${topic||subject} için en zor kısmı söyle: konu bilgisi, soruya başlamak, işlem ya da süre?`,`${topic||subject} içinde en zor gelen adım ne? Bir örnekle anlatabilirsin.`,`${topic||subject} için en zor noktayı seçelim. Bilgi mi, süre mi daha çok durduruyor?`,`${topic||subject} çalışırken en zor kısım hangisi? Takıldığın adımı yazman yeterli.`]);}
      if(awaiting==="start"){lastIntent="study";return taskReply(context);}
    }
    if(!action&&/^(hayir|yok|istemem|olmaz|baska)([.! ]|$)/.test(q)){lastIntent="decline";awaiting="mood";return pick("decline",["Tamam, bunu geçelim. Şu an konuşmak mı, dinlenmek mi daha iyi gelir?","Olur, başka bir yol seçebiliriz. Nasıl bir çalışma sana daha hafif gelir?","Israr etmeyelim. Aklındaki seçeneği söyle, oradan devam edelim.","Peki. Kendi hızını sen belirle; şimdi neye ihtiyacın var?"]);}
    if(!action&&awaiting==="difficulty"&&!foundSubject){lastIntent="difficulty-detail";const label=topic||subject||"bu konu";
      if(/sure|zaman|yetis|yavas/.test(q)){awaiting="start";return pick("time",[`${label} için önce süre tutmadan birkaç soruda yöntemi netleştir. Sonra aynı türden kısa bir setle zamanı gözlemle.`,`${label} çalışmasında hızdan önce adımları oturtalım. Çözümde en çok hangi adım zaman alıyor?`,`${label} için küçük bir set seçip soru başına geçen süreyi not edebilirsin. Nerede yavaşladığını görmek başlangıç sağlar.`]);}
      if(/konu|bilgi|anlam|bilm/.test(q)){awaiting="start";return pick("knowledge",[`${label} için tek bir alt başlığa dönelim. Kısa özeti okuyup bir çözümlü örneği nedenleriyle incele; ardından benzer bir soruyu dene.`,`${label} bilgisini tazelemek için bildiğin ve bilmediğin iki noktayı ayır. Önce bilmediğin küçük parçaya bakalım.`,`${label} için bir sayfalık kısa özet ve bir örnek iyi bir başlangıç olabilir. Hangi kuralı hatırlamakta zorlanıyorsun?`]);}
      if(/islem|dikkat|basla/.test(q)){awaiting="start";return pick("steps",[`${label} sorusunda verilenleri ve isteneni ayrı yaz. Sonra tek bir adım ilerle; işlemi en sonda kontrol et.`,`${label} için işlemleri satır satır yazmayı deneyebilirsin. Son yanlışında ilk ayrıldığın adım hangisiydi?`,`${label} çalışırken önce soru kökünü kendi cümlenle söyle. İstenen şeyi netleştirmek ilk adımı kolaylaştırabilir.`]);}
    }
    if(!action&&(foundSubject||foundTopic||planTopic||(/zor|takil|olmuyor/.test(q)&&(subject||topic)))){
      if(awaiting==="topic"&&!foundSubject&&!foundTopic&&!planTopic){const candidate=clean(value,70).replace(/\s+(?:(?:çok|cok|biraz)\s+)?(?:zor(?:\s+geldi)?|anlamıyorum|anlamiyorum|takıldım|takildim)$/i,"").trim();if(candidate&&candidate!==clean(value,70))topic=candidate;}
      lastIntent="subject";if(foundTopic||planTopic||/zor|takil|olmuyor|anlam/.test(q))return difficulty();
      awaiting="topic";return pick("subject",[`${subject} üzerine konuşalım. Hangi konudasın?`,`${subject} için tek bir başlık seçelim. Konunun adını yazar mısın?`,`${subject} çalışmasını küçük bir parçaya bölebiliriz. En son hangi konuyu açtın?`,`${subject} tamam. Konu tekrarı mı yapıyorsun, soru mu çözüyorsun? Hangi başlık?`]);
    }
    if(!action&&/\b(iyiyim|guzel|iyi gidiyor|harika|super|mutlu)\b/.test(q)){lastIntent="good";awaiting="start";return pick("good",["Buna sevindim 🙂 Bugün iyi giden bir şeyi anlatmak ister misin?","Güzel! Bu enerjiyi küçük bir çalışmaya mı ayıralım, biraz sohbet mi edelim?","İyi gidiyorsa kendi ritmini koruyabilirsin. Bugünün en güzel kısmı neydi?","Sevindim. Çalışmandan aklında kalan bir şey var mı?"]);}
    if(action==="talk"||/\b(selam\w*|merhaba|slm|naber|nasilsin|sa|gunaydin|iyi aksamlar)\b/.test(q)){
      lastIntent="talk";awaiting="mood";return pick("talk",[
        "Selam 🙂 Bugün nasıl gidiyor? Derslerden de, gününden de konuşabiliriz.",
        "Buradayım. Bugün seni sevindiren ya da zorlayan bir şey oldu mu?",
        "Biraz soluklanıp konuşalım. Şu an aklında ne var?",
        "Merhaba! Bugünün temposu nasıl; sakin mi, yoğun mu?",
        "Seni dinliyorum. Çalışma nasıl geçti, yoksa henüz başlamadın mı?",
        "Selam! Bugün neye ihtiyacın var: biraz sohbet, küçük bir hedef, yoksa mola?"
      ]);
    }
    if(!action&&awaiting==="topic"&&q.length>=3&&q.length<70){topic=clean(value,70);lastIntent="subject";return difficulty();}
    lastIntent="unknown";awaiting="";const anchor=topic||subject;
    return pick("unknown",[
      `${anchor?`${anchor} hakkında biraz`:"Biraz"} daha açar mısın? Nasıl hissettiğini ya da takıldığın noktayı anlatabilirsin.`,
      "Bu mesajı tam anlayamadım. Çalışma, program veya mola hakkında bir şeyse biraz daha ayrıntı verebilir misin?",
      `${previousIntent==="break"?"Moladan döndüysen hoş geldin. ":""}Sana eşlik edebilirim; şimdi neyle uğraşıyorsun?`,
      "Bir örnekle anlatırsan seni daha iyi takip edebilirim. Bugün aklındaki şey ne?",
      "Buradayım. İstersen “bugünkü programım” veya “ne çalışayım” yazıp kayıtlı işlerine birlikte bakalım.",
      "Tam olarak neyi kastettiğini yakalayamadım. Konuyu ya da bugünkü durumunu biraz anlatır mısın?"
    ]);
  }
  return {
    reply,
    greeting(context:ConversationContext){prepare(context);const address=context.name?` ${context.name}`:"",detail=context.tasks.length?pending(context).length?` ${progress(context)}; kalanlara birlikte bakabiliriz.`:" Bugünkü kayıtlı görevlerin tamam. Emeğine sağlık!":" İstersen biraz konuşalım, istersen küçük bir çalışma hedefi seçelim.";return `Selam${address}, ben ${context.mascotName}.${detail}`;}
  };
}
