const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const {stripTypeScriptTypes}=require("node:module");
const load=(file)=>stripTypeScriptTypes(fs.readFileSync(path.resolve(__dirname,"../src/ui/"+file),"utf8"),{mode:"strip"}).replace(/^import .+;\r?\n/gm,"").replace(/^export /gm,"");
const {refinedProgramTasks}=vm.runInNewContext(load("refined-program.ts")+"\n({refinedProgramTasks})",{Date});
const {createMascotConversation,mascotConversationContext}=vm.runInNewContext(load("mascot-conversation.ts")+"\n({createMascotConversation,mascotConversationContext})",{refinedProgramTasks,Date});
const now=new Date(2026,9,2,14,30); // Friday in the user's local calendar, not a UTC midnight.
const row=(day,text)=>Array.from({length:7},(_,i)=>i===day?text:"");
const fixture=()=>({name:"Deniz",weeks:{"2026-09-28":{r:[row(4,"TYT Türkçe · Paragraf · 20 soru")],s:[row(4,"AYT Edebiyat · Şiir · 10 soru"),row(4,"TYT Fizik · Hareket · 15 soru")],dn:{"r-0-4":true}}},rowLabels:{r:["Rutin"],s:["Çalışma"]},solved:{"2026-10-02":20},pomoMin:{"2026-10-02":35}});
const context=(state=fixture(),time=now)=>mascotConversationContext(state,time,"Bilge");

test("chat reads the actual local calendar day and leaves frozen legacy state unchanged",()=>{
  const state=fixture(),before=JSON.stringify(state);Object.freeze(state.weeks["2026-09-28"].dn);Object.freeze(state.weeks["2026-09-28"].s[0]);Object.freeze(state);
  const c=context(state);assert.equal(c.date,"2026-10-02");assert.equal(c.tasks.length,3);assert.equal(c.tasks[0].done,true);assert.equal(c.questions,20);assert.equal(c.minutes,35);assert.equal(c.name,"Deniz");
  const chat=createMascotConversation();for(const msg of ["bugünkü programım","ne çalışayım","bitirdim","matematik zor","süre yetişmiyor"])chat.reply(msg,c);
  assert.equal(JSON.stringify(state),before);
});

test("study suggestions use remaining real tasks and never default to unplanned mathematics",()=>{
  const chat=createMascotConversation(),c=context();const first=chat.reply("",c,"study"),second=chat.reply("",c,"study");
  assert.match(first,/Edebiyat/);assert.match(second,/Fizik/);assert.doesNotMatch(first+second,/Paragraf|matematik/i);
  c.tasks[1].done=true;assert.match(chat.reply("",c,"study"),/Fizik/);
});

test("program summaries report actual counts and completed tasks disappear from the pending list",()=>{
  const chat=createMascotConversation(),c=context(),reply=chat.reply("bugünkü programım",c);
  assert.match(reply,/Edebiyat/);assert.match(reply,/Fizik/);assert.doesNotMatch(reply,/Paragraf/);assert.match(reply,/1\/3|1 tamamlanan|2 çalışma/);
  c.tasks.forEach(task=>task.done=true);assert.match(chat.reply("",c,"today"),/tamam|bekleyen iş kalmamış/);assert.doesNotMatch(chat.reply("",c,"study"),/henüz tamamlanmamış/);
});

test("empty or invalid state asks for a choice without inventing a program",()=>{
  for(const state of [undefined,null,{weeks:{},solved:{"2026-10-02":-1},pomoMin:{"2026-10-02":"oops"}}]){
    const c=mascotConversationContext(state,now,"Bilge"),chat=createMascotConversation();assert.equal(c.tasks.length,0);assert.equal(c.questions,0);assert.equal(c.minutes,0);
    assert.match(chat.reply("",c,"study"),/kayıtlı|boş|henüz plan/);assert.match(chat.reply("evet",c),/Hangi ders/);
  }
});

test("tomorrow resolves across Sunday and Monday without reading the wrong week",()=>{
  const state={weeks:{"2026-09-28":{s:[row(6,"Pazar tekrarı")]},"2026-10-05":{s:[row(0,"Pazartesi Fizik")]}},rowLabels:{}};
  const c=context(state,new Date(2026,9,4,23,59));assert.equal(c.tasks[0].text,"Pazar tekrarı");assert.equal(c.tomorrow[0].text,"Pazartesi Fizik");
  const reply=createMascotConversation().reply("yarın programım",c);assert.match(reply,/Yarın/);assert.match(reply,/Pazartesi Fizik/);assert.doesNotMatch(reply,/Pazar tekrarı/);
});

test("all quick actions and short reply pools rotate without consecutive repeats after multiple cycles",()=>{
  for(const action of ["talk","today","motivate","study","break"]){
    const chat=createMascotConversation(),c=context(),replies=Array.from({length:25},()=>chat.reply("",c,action));
    assert.ok(new Set(replies.slice(0,4)).size>=4,action);for(let i=1;i<replies.length;i++)assert.notEqual(replies[i],replies[i-1],`${action} reply ${i}`);
  }
  for(const msg of ["teşekkürler","aynı cevap","hayır","bilmecem var"]){
    const chat=createMascotConversation(),c=context();let previous="";for(let i=0;i<20;i++){const reply=chat.reply(msg,c);assert.notEqual(reply,previous,msg);previous=reply;}
  }
});

test("Turkish and unaccented topic follow-ups keep the subject and address the actual difficulty",()=>{
  for(const phrase of ["paragraf çok zor","PARAGRAF COK ZOR"]){const chat=createMascotConversation(),c=context();assert.match(chat.reply(phrase,c),/Paragraf/);assert.match(chat.reply("süre yetişmiyor",c),/Paragraf/);}
  const chat=createMascotConversation(),c=context();assert.match(chat.reply("matematik",c),/Matematik/);assert.match(chat.reply("türev",c),/Türev/);assert.match(chat.reply("konuyu anlamıyorum",c),/Türev/);
  assert.match(chat.reply("fizik",c),/Fizik/);assert.doesNotMatch(chat.reply("zor",c),/Türev/);
});

test("custom saved topics participate in follow-up memory",()=>{
  const chat=createMascotConversation(),c=context();assert.match(chat.reply("edebiyat",c),/Edebiyat/);assert.match(chat.reply("şiir",c),/Şiir/);assert.match(chat.reply("işlem",c),/Şiir/);
});

test("fatigue wins over subject keywords and plain acknowledgements follow the previous question",()=>{
  const chat=createMascotConversation(),c=context();assert.match(chat.reply("matematikten çok yoruldum",c),/ara|mola|dinlen|nefes/);
  chat.reply("matematik",c);assert.match(chat.reply("evet",c),/Matematik.*konu/);
  chat.reply("paragraf zor",c);assert.match(chat.reply("tamam",c),/Paragraf.*en zor/);
  chat.reply("",c,"today");assert.match(chat.reply("olur",c),/Edebiyat|Fizik/);
});

test("new calendar days discard stale topic context",()=>{
  const chat=createMascotConversation(),c=context();chat.reply("paragraf zor",c);const tomorrow={...c,date:"2026-10-03",tasks:[]};
  assert.doesNotMatch(chat.reply("süre yetişmiyor",tomorrow),/Paragraf/);
});

test("common Turkish suffixes and acknowledgements follow topics without getting stuck in one answer",()=>{
  for(const phrase of ["matematikte zorlanıyorum","matematiği anlamıyorum","fizikte zorlanıyorum"]){const chat=createMascotConversation();assert.match(chat.reply(phrase,context()),/Matematik|Fizik/);}
  const chat=createMascotConversation(),c=context();chat.reply("fizik",c);assert.match(chat.reply("hareket zor",c),/hareket/i);assert.match(chat.reply("süre",c),/hareket/i);
  chat.reply("paragraf zor",c);const replies=Array.from({length:12},()=>chat.reply("evet",c));for(let i=1;i<replies.length;i++)assert.notEqual(replies[i],replies[i-1]);assert.equal(new Set(replies.slice(0,4)).size,4);
  chat.reply("hep aynı cevap",c);assert.doesNotMatch(chat.reply("süre",c),/Paragraf/);
});

test("saying a task is finished never marks it complete or claims a successful save",()=>{
  const state=fixture(),before=JSON.stringify(state),chat=createMascotConversation(),c=context(state),reply=chat.reply("bitirdim",c);
  assert.match(reply,/Programım/);assert.equal(JSON.stringify(state),before);assert.equal(c.tasks[1].done,false);assert.doesNotMatch(reply,/görevini kaydettim|işaretledim|tamamlandı olarak/);
});

test("resource links are not recited and unknown messages do not claim to solve arbitrary questions",()=>{
  const state=fixture();state.weeks["2026-09-28"].s[0][4]+=" — https://example.com/video";const c=context(state),chat=createMascotConversation();assert.doesNotMatch(chat.reply("",c,"study"),/https/);
  assert.match(chat.reply("sen kimsin",c),/Bilge/);assert.match(chat.reply("robot musun",c),/bağlı değilim/);
  const replies=Array.from({length:6},()=>chat.reply("xxx belirsiz bir şey",c));assert.equal(new Set(replies).size,6);
});
