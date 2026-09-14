import {spawn} from "node:child_process";
import {readFile,writeFile,mkdir} from "node:fs/promises";
import {dirname,resolve} from "node:path";

const ROOT=resolve(process.cwd());
const OUTPUT=resolve(ROOT,"public/teachers-v2-feed.json");
const ARCHIVE_DIR=resolve(ROOT,"public/teachers-v2");
const APP_JS=resolve(ROOT,"app.js");
const PREVIEW_VIDEOS=12;
const PREVIEW_PLAYLISTS=8;
const CHANNEL_ARCHIVE_LIMIT=600;
const SEARCH_BATCH=30;
const SEARCH_ARCHIVE_LIMIT=120;
const MAX_PLAYLISTS=40;
const CONCURRENCY=5;

/* Kanal kimliği net olan hocaları arama sıralamasına bırakmıyoruz.
   Arama tabanlı hocalarda ise yeterince güçlü bir kanal eşleşmesi bulunursa
   aynı geniş kanal arşivi otomatik olarak devreye girer. */
const CHANNEL_OVERRIDES={
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
  "Yavuz Tuna Coğrafya":{channelId:"UCai5DYClxEjy-VH-eqz4MIA",channelName:"YAVUZ TUNA COĞRAFYA"},
  "Coğrafyanın Kodları":{channelId:"UCIvX31CHx2RsFQM46qbjuJA",channelName:"Coğrafyanın Kodları"},
  "KR Akademi":{channelId:"UC1NYzm_kEss5qScWlf-TtwA",channelName:"KR Akademi"},
  "Hocalara Geldik":{channelId:"UCBcM2J8SHyq8GUSvrhWnwTg",channelName:"Hocalara Geldik"},
  "Nurtaç Hoca":{channelId:"UCNgmALbCj_-cQpxiIpTqOSQ",channelName:"Nurtaç Hoca"},
  "Deniz Hoca":{channelId:"UC_ke4VQZo9TewOf-p-LSx_Q",channelName:"Deniz Hoca"},
  "Türkçenin Matematiği":{channelId:"UCCAmWzulVvB1DjnR5IQCTUQ",channelName:"Türkçenin Matematiği"},
  "Altuğ Güneş":{channelId:"UCx4651yGDx7DR6KiyxG_CUA",channelName:"Altuğ Güneş FİZİK"},
  "Fizikfinito":{channelId:"UC-zDbhn0rWs2EywjGQMrK7A",channelName:"Fizikfinito"},
  "Fizik Evim":{channelId:"UCkRD9iVmodQfET17HeqxUrg",channelName:"FİZİK EVİM"},
  "Tonguç Akademi":{channelId:"UCm3vDH7Uvz_qwql5Qih4yGw",channelName:"tonguç AKADEMİ"},

  "Matematik Kafası":{searchOnly:true},
  "3 Dakikada Matematik":{searchOnly:true},
  "Felsefe Hocası":{searchOnly:true},
  "Ferhat Yıldız":{searchOnly:true,queryHint:"YDT İngilizce"},
  "Kimya Sarmal":{searchOnly:true}
};

function norm(value){
  return String(value||"")
    .toLocaleLowerCase("tr-TR")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g,"")
    .replace(/[^a-z0-9ığüşöç]+/gi," ")
    .trim();
}

function slugFor(value){
  const base=norm(value)
    .replace(/ı/g,"i").replace(/ğ/g,"g").replace(/ü/g,"u").replace(/ş/g,"s").replace(/ö/g,"o").replace(/ç/g,"c")
    .replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"")||"hoca";
  let h=2166136261;
  for(const ch of String(value||"")){h^=ch.charCodeAt(0);h=Math.imul(h,16777619);}
  return `${base}-${(h>>>0).toString(36).slice(0,6)}`;
}

async function loadCatalog(){
  const source=await readFile(APP_JS,"utf8");
  const start=source.indexOf("const TEACHERS=[");
  const end=source.indexOf("const TEACH_SUBJECTS",start);
  if(start<0||end<0)throw new Error("app.js içindeki TEACHERS kataloğu bulunamadı");
  const block=source.slice(start,end);
  const regex=/\{a:\"([^\"]+)\",d:\[([^\]]*)\]\s*,?\s*l:/g;
  const catalog=[];
  let match;
  while((match=regex.exec(block))){
    const name=match[1].trim();
    const subjects=[...match[2].matchAll(/\"([^\"]+)\"/g)].map(x=>x[1]).filter(Boolean);
    if(!name||!subjects.length)continue;
    const override=CHANNEL_OVERRIDES[name]||{};
    catalog.push({
      name,
      subjects,
      subject:subjects.length===1?subjects[0]:"YKS",
      archiveFile:`teachers-v2/${slugFor(name)}.json`,
      ...override
    });
  }
  if(!catalog.length)throw new Error("TEACHERS kataloğu ayrıştırılamadı");
  console.log(`[teachers-v2] app.js ile senkron katalog: ${catalog.length} hoca`);
  return catalog;
}

function teacherTokens(name){
  return norm(name).split(/\s+/).filter(x=>x.length>1&&!new Set(["hoca","matematik","akademi"]).has(x));
}

function scoreEntry(entry,teacher){
  const channelId=String(entry.channel_id||entry.uploader_id||"");
  const channelName=norm(entry.channel||entry.uploader||"");
  const title=norm(entry.title||"");
  const hay=norm([entry.channel,entry.uploader,entry.title,channelId].filter(Boolean).join(" "));
  let score=0;
  if(teacher.channelId&&channelId===teacher.channelId)score+=120;
  if(teacher.channelName&&channelName===norm(teacher.channelName))score+=80;
  for(const token of teacherTokens(teacher.name)){
    if(title.includes(token))score+=6;
    else if(hay.includes(token))score+=3;
  }
  const full=norm(teacher.name);
  if(full&&title.includes(full))score+=24;
  else if(full&&hay.includes(full))score+=12;
  for(const subject of teacher.subjects||[]){
    if(title.includes(norm(subject)))score+=2;
  }
  if(/yks|tyt|ayt|ydt/.test(title))score+=2;
  return score;
}

function videoUrl(id,url){
  if(typeof url==="string"&&/^https:\/\/(www\.)?youtube\.com\//.test(url))return url;
  return id?`https://www.youtube.com/watch?v=${encodeURIComponent(id)}`:"";
}

function thumbFor(id,entry){
  if(id)return `https://i.ytimg.com/vi/${encodeURIComponent(id)}/hqdefault.jpg`;
  if(typeof entry.thumbnail==="string")return entry.thumbnail;
  const thumbs=Array.isArray(entry.thumbnails)?entry.thumbnails:[];
  return thumbs.length?String(thumbs[thumbs.length-1]?.url||""):"";
}

function ytdlp(target,{limit=12,timeout=30000}={}){
  return new Promise((resolvePromise,rejectPromise)=>{
    const args=[
      "-m","yt_dlp",
      "--flat-playlist",
      "--dump-single-json",
      "--no-warnings",
      "--ignore-errors",
      "--socket-timeout","12",
      "--retries","1",
      "--extractor-retries","1"
    ];
    if(Number.isFinite(limit)&&limit>0)args.push("--playlist-end",String(limit));
    args.push(target);
    const child=spawn("python3",args,{cwd:ROOT,stdio:["ignore","pipe","pipe"]});
    let out="",err="";
    let settled=false;
    const finishReject=error=>{
      if(settled)return;
      settled=true;
      rejectPromise(error);
    };
    const timer=setTimeout(()=>{
      child.kill("SIGKILL");
      finishReject(new Error(`yt-dlp timeout: ${target}`));
    },timeout);
    child.stdout.on("data",chunk=>{out+=String(chunk);});
    child.stderr.on("data",chunk=>{err+=String(chunk);});
    child.on("error",error=>{clearTimeout(timer);finishReject(error);});
    child.on("close",code=>{
      clearTimeout(timer);
      if(settled)return;
      if(code!==0&&!out.trim()){
        finishReject(new Error(err.trim()||`yt-dlp exit ${code}`));
        return;
      }
      try{
        settled=true;
        resolvePromise(JSON.parse(out));
      }catch(error){
        finishReject(new Error(`yt-dlp JSON okunamadı: ${error instanceof Error?error.message:String(error)}`));
      }
    });
  });
}

async function searchBatch(query){
  const result=await ytdlp(`ytsearch${SEARCH_BATCH}:${query}`,{limit:SEARCH_BATCH,timeout:38000});
  return Array.isArray(result?.entries)?result.entries.filter(Boolean):[];
}

async function discoverTeacher(teacher){
  if(teacher.channelId&&!teacher.searchOnly){
    const channelUrl=`https://www.youtube.com/channel/${teacher.channelId}`;
    const direct=await ytdlp(`${channelUrl}/videos`,{limit:CHANNEL_ARCHIVE_LIMIT,timeout:60000});
    const entries=Array.isArray(direct?.entries)?direct.entries.filter(Boolean):[];
    if(entries.length){
      console.log(`[teachers-v2] ${teacher.name}: doğrulanmış kanal · ${entries.length} video`);
      return {entries,channelId:teacher.channelId,channelName:teacher.channelName||teacher.name,channelSource:"override",archiveComplete:entries.length<CHANNEL_ARCHIVE_LIMIT};
    }
  }

  const focus=teacher.queryHint||teacher.subject;
  const queries=[
    `${teacher.name} ${focus} YKS`,
    `${teacher.name} TYT`,
    `${teacher.name} AYT`,
    `${teacher.name} deneme`,
    `${teacher.name} ${focus}`,
    teacher.name
  ];
  const merged=[];
  const seen=new Set();
  const errors=[];
  for(const query of [...new Set(queries)]){
    try{
      const rows=await searchBatch(query);
      for(const entry of rows){
        const key=String(entry.id||entry.url||"");
        if(!key||seen.has(key))continue;
        seen.add(key);merged.push(entry);
      }
      if(merged.length>=SEARCH_ARCHIVE_LIMIT)break;
    }catch(error){errors.push(`${query}: ${error instanceof Error?error.message:String(error)}`);}
  }
  if(!merged.length)throw new Error(errors.join(" | ")||"arama sonucu yok");

  const inferred=inferChannel(merged,teacher);
  if(inferred){
    try{
      const channelUrl=`https://www.youtube.com/channel/${inferred.channelId}`;
      const direct=await ytdlp(`${channelUrl}/videos`,{limit:CHANNEL_ARCHIVE_LIMIT,timeout:60000});
      const entries=Array.isArray(direct?.entries)?direct.entries.filter(Boolean):[];
      if(entries.length){
        console.log(`[teachers-v2] ${teacher.name}: kanal otomatik eşleşti (${inferred.channelName}) · ${entries.length} video`);
        return {entries,channelId:inferred.channelId,channelName:inferred.channelName,channelSource:"inferred",archiveComplete:entries.length<CHANNEL_ARCHIVE_LIMIT};
      }
    }catch{}
  }

  console.log(`[teachers-v2] ${teacher.name}: geniş arama arşivi · ${merged.length} video`);
  return {entries:merged.slice(0,SEARCH_ARCHIVE_LIMIT),channelId:"",channelName:"",channelSource:"search",archiveComplete:false};
}

function inferChannel(entries,teacher){
  const groups=new Map();
  for(const entry of entries||[]){
    const id=String(entry.channel_id||entry.uploader_id||"");
    if(!/^UC[\w-]{8,}$/.test(id))continue;
    const score=scoreEntry(entry,teacher);
    const current=groups.get(id)||{channelId:id,channelName:String(entry.channel||entry.uploader||""),count:0,score:0,best:0};
    current.count++;current.score+=score;current.best=Math.max(current.best,score);
    if(!current.channelName)current.channelName=String(entry.channel||entry.uploader||"");
    groups.set(id,current);
  }
  const rows=[...groups.values()].sort((a,b)=>(b.best+b.score+b.count*2)-(a.best+a.score+a.count*2));
  const best=rows[0];
  if(!best)return null;
  const full=norm(teacher.name),channelNorm=norm(best.channelName);
  const exactish=full&&channelNorm&&(channelNorm.includes(full)||full.includes(channelNorm));
  if(best.count>=2&&(best.best>=12||exactish))return best;
  return null;
}

function normalizeVideos(entries,teacher,channelId="",channelName=""){
  const pinned=Boolean(channelId);
  const rows=(Array.isArray(entries)?entries:[]).filter(Boolean).map((entry,index)=>({entry,index,score:scoreEntry(entry,teacher)}));
  let selected;
  if(pinned){
    const exact=rows.filter(row=>{
      const id=String(row.entry.channel_id||row.entry.uploader_id||"");
      return !id||id===channelId;
    });
    selected=exact.length?exact:rows;
    selected.sort((a,b)=>a.index-b.index);
  }else{
    selected=rows.filter(row=>row.score>=4).sort((a,b)=>b.score-a.score||a.index-b.index);
    if(selected.length<3)selected=rows.sort((a,b)=>b.score-a.score||a.index-b.index);
  }
  const seen=new Set();
  return selected.map(({entry})=>{
    const id=String(entry.id||"");
    if(!id||seen.has(id))return null;
    seen.add(id);
    const rawChannel=String(entry.channel||entry.uploader||"");
    return {
      id,
      title:String(entry.title||"YouTube videosu"),
      url:videoUrl(id,entry.webpage_url||entry.url),
      thumbnail:thumbFor(id,entry),
      channel:channelName||rawChannel||teacher.name,
      channelId:channelId||String(entry.channel_id||entry.uploader_id||""),
      channelUrl:channelId?`https://www.youtube.com/channel/${channelId}`:String(entry.channel_url||entry.uploader_url||""),
      duration:Number.isFinite(entry.duration)?Number(entry.duration):null,
      timestamp:Number.isFinite(entry.timestamp)?Number(entry.timestamp):null
    };
  }).filter(Boolean);
}

function normalizePlaylists(entries){
  const seen=new Set();
  return (Array.isArray(entries)?entries:[]).map(entry=>{
    if(!entry)return null;
    const id=String(entry.id||"");
    const title=String(entry.title||"").trim();
    if(!id||!title||seen.has(id))return null;
    seen.add(id);
    const raw=String(entry.webpage_url||entry.url||"");
    const url=raw.startsWith("http")?raw:`https://www.youtube.com/playlist?list=${encodeURIComponent(id)}`;
    return {id,title,url};
  }).filter(Boolean).slice(0,MAX_PLAYLISTS);
}

async function readPrevious(){
  try{
    const raw=await readFile(OUTPUT,"utf8");
    const parsed=JSON.parse(raw);
    return parsed&&typeof parsed==="object"?parsed:{version:3,teachers:{}};
  }catch{return {version:3,teachers:{}};}
}

async function refreshOne(teacher,previous){
  try{
    const discovery=await discoverTeacher(teacher);
    const videos=normalizeVideos(discovery.entries,teacher,discovery.channelId,discovery.channelName);
    if(!videos.length)throw new Error("arama sonuçları video kimliği içermedi");

    const channelUrl=discovery.channelId?`https://www.youtube.com/channel/${discovery.channelId}`:"";
    let playlists=[];
    if(channelUrl){
      try{
        const pdata=await ytdlp(`${channelUrl}/playlists`,{limit:MAX_PLAYLISTS,timeout:36000});
        playlists=normalizePlaylists(pdata?.entries);
      }catch{}
    }

    const row={
      version:3,
      name:teacher.name,
      subject:teacher.subject,
      subjects:teacher.subjects,
      channelName:discovery.channelName||videos[0]?.channel||"",
      channelId:discovery.channelId||"",
      channelUrl,
      channelSource:discovery.channelSource,
      searchOnly:!discovery.channelId,
      refreshedAt:new Date().toISOString(),
      archiveFile:teacher.archiveFile,
      archiveComplete:Boolean(discovery.archiveComplete),
      videoCount:videos.length,
      playlistCount:playlists.length,
      videos,
      playlists
    };
    return row;
  }catch(error){
    const old=previous?.teachers?.[teacher.name];
    if(old&&Array.isArray(old.videos)&&old.videos.length){
      console.warn(`[teachers-v2] ${teacher.name}: eski önizleme korundu (${error instanceof Error?error.message:String(error)})`);
      return {
        version:3,
        ...old,
        name:teacher.name,
        subject:teacher.subject,
        subjects:teacher.subjects,
        archiveFile:teacher.archiveFile,
        archiveComplete:false,
        videoCount:Number(old.videoCount||old.videos.length||0),
        playlistCount:Number(old.playlistCount||old.playlists?.length||0),
        videos:Array.isArray(old.videos)?old.videos:[],
        playlists:Array.isArray(old.playlists)?old.playlists:[]
      };
    }
    console.warn(`[teachers-v2] ${teacher.name}: veri alınamadı (${error instanceof Error?error.message:String(error)})`);
    return {
      version:3,
      name:teacher.name,
      subject:teacher.subject,
      subjects:teacher.subjects,
      channelName:"",
      channelId:"",
      channelUrl:"",
      channelSource:"none",
      searchOnly:true,
      refreshedAt:null,
      archiveFile:teacher.archiveFile,
      archiveComplete:false,
      videoCount:0,
      playlistCount:0,
      videos:[],
      playlists:[]
    };
  }
}

async function runPool(items,worker,limit){
  const results=new Array(items.length);
  let next=0;
  async function run(){
    while(next<items.length){
      const index=next++;
      results[index]=await worker(items[index],index);
    }
  }
  await Promise.all(Array.from({length:Math.min(limit,items.length)},()=>run()));
  return results;
}

const CATALOG=await loadCatalog();
const previous=await readPrevious();
const rows=await runPool(CATALOG,teacher=>refreshOne(teacher,previous),CONCURRENCY);
await mkdir(dirname(OUTPUT),{recursive:true});
await mkdir(ARCHIVE_DIR,{recursive:true});

const teachers={};
for(const row of rows){
  if(!row?.name)continue;
  const archivePath=resolve(ROOT,"public",row.archiveFile);
  await mkdir(dirname(archivePath),{recursive:true});
  await writeFile(archivePath,`${JSON.stringify(row,null,2)}\n`,"utf8");
  teachers[row.name]={
    name:row.name,
    subject:row.subject,
    subjects:row.subjects,
    channelName:row.channelName,
    channelId:row.channelId,
    channelUrl:row.channelUrl,
    channelSource:row.channelSource,
    searchOnly:row.searchOnly,
    refreshedAt:row.refreshedAt,
    archiveFile:row.archiveFile,
    archiveComplete:row.archiveComplete,
    videoCount:row.videoCount,
    playlistCount:row.playlistCount,
    videos:row.videos.slice(0,PREVIEW_VIDEOS),
    playlists:row.playlists.slice(0,PREVIEW_PLAYLISTS)
  };
}
const success=Object.values(teachers).filter(item=>Array.isArray(item.videos)&&item.videos.length).length;
const totalVideos=rows.reduce((sum,row)=>sum+Number(row?.videoCount||0),0);
const totalPlaylists=rows.reduce((sum,row)=>sum+Number(row?.playlistCount||0),0);
const feed={
  version:3,
  generatedAt:new Date().toISOString(),
  source:"github-pages-build",
  teacherCount:CATALOG.length,
  successCount:success,
  totalVideos,
  totalPlaylists,
  teachers
};
await writeFile(OUTPUT,`${JSON.stringify(feed,null,2)}\n`,"utf8");
console.log(`[teachers-v2] geniş medya arşivi hazır: ${success}/${CATALOG.length} hoca · ${totalVideos} video · ${totalPlaylists} oynatma listesi`);