(function(){
  "use strict";
  const READY_FLAG="__YKS_MOTIVATION_QUOTES_READY__";
  const STYLE_HREF="./modules/motivation-quotes-v2.css?v=4.1.0-r2";

  const COACH_QUOTES=[
    {q:"Hayal etmeden hiçbir şey olmaz.",a:"Fatih Terim"},
    {q:"Sabredeceğiz ve çok çalışacağız. Yapacak başka bir şey yok.",a:"Fatih Terim"},
    {q:"Bu çocuklara, gençlere güveniyorum.",a:"Şenol Güneş"},
    {q:"Bir kez pes edersen, ikinci kez de pes edersin.",a:"Sir Alex Ferguson"},
    {q:"Çok çalışmak da bir yetenektir.",a:"Sir Alex Ferguson"},
    {q:"Şüphe edenlerden inananlara dönüşmeliyiz.",a:"Jürgen Klopp"},
    {q:"Birlikte büyük şeyler başarabileceğimize inanmanızı istiyorum.",a:"Jürgen Klopp"},
    {q:"Olumlu olun ve oyunu yaşamaya bakın.",a:"Jürgen Klopp"},
    {q:"Yapabileceğine inanmıyorsan zaten hiç şansın yoktur.",a:"Arsène Wenger"},
    {q:"Başarı, her gün aynı ciddiyetle çalışmayı gerektirir.",a:"Arsène Wenger"},
    {q:"Bu seviyeye ulaşmak için çok çalışmalısın.",a:"Pep Guardiola"},
    {q:"Tarihin neredeyse imkânsız dediği şeyi denemek zorundayız.",a:"Carlo Ancelotti"}
  ];

  const PLAYER_QUOTES=[
    {q:"Hayalin için çok çalışmalısın.",a:"Lionel Messi"},
    {q:"Başarı için fedakârlık etmeli, çok çalışmalı ve biraz da şanslı olmalısın.",a:"Lionel Messi"},
    {q:"Fedakârlık olmadan hiçbir şey başaramazsın.",a:"Cristiano Ronaldo"},
    {q:"Her zaman gelişmek ve en üst seviyede olmak istiyorum.",a:"Cristiano Ronaldo"},
    {q:"Bulunduğum yere gelmek için gerçekten çok çalıştım.",a:"Luka Modrić"},
    {q:"Ne kadar zor olsa da burada başarılı olmak istediğimi hep biliyordum.",a:"Andrés Iniesta"},
    {q:"Her gün işe gelip kendimi zorlamak beni harekete geçiriyor.",a:"Mohamed Salah"},
    {q:"Bütün sezon boyunca çok çalışmalısın.",a:"Ferran Torres"}
  ];

  let current={type:"coach",index:-1};
  const recentCoach=[],recentPlayer=[];

  function ensureStyles(){
    if(typeof document==="undefined"||!document.head||typeof document.createElement!=="function")return false;
    if(typeof document.querySelector==="function"&&document.querySelector('link[data-yks-motivation-quotes-style]'))return true;
    const link=document.createElement("link");
    link.rel="stylesheet";link.href=STYLE_HREF;link.setAttribute("data-yks-motivation-quotes-style","1");
    document.head.appendChild(link);return true;
  }
  function rand(max){
    if(max<=1)return 0;
    try{if(typeof sozRand==="function")return sozRand(max);}catch(e){}
    return Math.floor(Math.random()*max);
  }
  function pickIndex(list,recent){
    const candidates=[];
    for(let i=0;i<list.length;i++)if(!recent.includes(i))candidates.push(i);
    const i=(candidates.length?candidates:list)[rand(candidates.length||list.length)]??0;
    recent.push(i);if(recent.length>5)recent.shift();return i;
  }
  function pick(){
    const roll=rand(100);
    if(roll<50)current={type:"coach",index:pickIndex(COACH_QUOTES,recentCoach)};
    else current={type:"player",index:pickIndex(PLAYER_QUOTES,recentPlayer)};
    return current;
  }
  function item(){
    if(current.index<0)pick();
    if(current.type==="coach")return {q:COACH_QUOTES[current.index]?.q||"",a:COACH_QUOTES[current.index]?.a||"",type:"coach"};
    return {q:PLAYER_QUOTES[current.index]?.q||"",a:PLAYER_QUOTES[current.index]?.a||"",type:"player"};
  }

  function boot(){
    if(typeof el!=="function"||typeof esc!=="function"||typeof S==="undefined"){
      setTimeout(boot,50);return;
    }
    ensureStyles();
    window[READY_FLAG]={version:"2.4.0",coachPool:COACH_QUOTES.length,playerPool:PLAYER_QUOTES.length,scope:"football-only",style:"v2"};
    gununSozu=function(){return item().q;};
    yeniSoz=function(){pick();renderSoz();return true;};
    renderSoz=function(){
      const w=el("sozBox");if(!w)return false;
      if(S.sozKapali){w.style.display="none";return true;}
      const x=item(),cat=x.type==="coach"?"Teknik Direktör":"Futbolcu";
      w.style.display="flex";
      if(w.dataset)w.dataset.quoteType=x.type;
      if(typeof w.setAttribute==="function"){
        const aria=x.type==="coach"
          ?"Teknik direktör motivasyon sözü"
          :"Futbolcu motivasyon sözü";
        w.setAttribute("role","group");
        w.setAttribute("aria-label",aria);
      }
      w.innerHTML='<span class="szwrap" aria-live="polite" aria-atomic="true"><span class="szlabel">Günün sözü <span class="szcat">'+cat+'</span></span><span class="sz">“'+esc(x.q)+'”</span>'+(x.a?'<span class="sza">— '+esc(x.a)+'</span>':'')+'</span><button class="szr" type="button" onclick="yeniSoz()" title="Başka bir motivasyon sözü" aria-label="Başka bir motivasyon sözü">↻</button>';
      return true;
    };
    pick();
    try{renderSoz();}catch(e){try{infraError("football-quotes-render",e);}catch(_){}}
  }

  ensureStyles();
  boot();
})();
