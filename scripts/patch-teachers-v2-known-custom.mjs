import {readFile,writeFile} from "node:fs/promises";
import {resolve} from "node:path";

const ROOT=resolve(process.cwd());
const FEED_PATH=resolve(ROOT,"public/teachers-v2-feed.json");
const APP_JS=resolve(ROOT,"app.js");
const RSS_TIMEOUT_MS=7000;
const CONCURRENCY=8;
const MAX_PREVIEW_VIDEOS=15;

/* Normal kod push'unda ağır yt-dlp araması çalıştırılmıyor. Kanal kimliği kesin
   olan hocaların son videoları YouTube'un hafif Atom/RSS akışından alınır.
   Böylece yeni bir uygulama deploy'u Hocalar bölümünü tekrar boşaltmaz. */
const KNOWN_CHANNELS={
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
  "Ferrum":{channelId:"UC0yco2kB3xW3WI__8E8HaKw",channelName:"Ferrum",subject:"Kimya",subjects:["Kimya"]}
};

function decodeXml(value=""){
  return String(value)
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g,"$1")
    .replace(/&#(\d+);/g,(_,n)=>String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi,(_,n)=>String.fromCodePoint(Number.parseInt(n,16)))
    .replace(/&quot;/g,'"').replace(/&apos;/g,"'")
    .replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&amp;/g,"&")
    .replace(/\s+/g," ").trim();
}

function parseCatalog(source){
  const start=source.indexOf("const TEACHERS=[");
  const end=source.indexOf("const TEACH_SUBJECTS",start);
  if(start<0||end<0)return new Map();
  const block=source.slice(start,end),rows=new Map();
  const regex=/\{a:\"([^\"]+)\",d:\[([^\]]*)\]\s*,?\s*l:/g;
  let match;
  while((match=regex.exec(block))){
    const name=match[1].trim();
    const subjects=[...match[2].matchAll(/\"([^\"]+)\"/g)].map(x=>x[1]).filter(Boolean);
    if(name&&subjects.length)rows.set(name,{subject:subjects.length===1?subjects[0]:"YKS",subjects});
  }
  return rows;
}

function parseRss(xml,teacher){
  const out=[],seen=new Set();
  for(const match of String(xml||"").matchAll(/<entry>([\s\S]*?)<\/entry>/g)){
    const entry=match[1];
    const id=decodeXml(entry.match(/<yt:videoId>([^<]+)<\/yt:videoId>/)?.[1]||"");
    const title=decodeXml(entry.match(/<title>([\s\S]*?)<\/title>/)?.[1]||"YouTube videosu");
    const published=decodeXml(entry.match(/<published>([^<]+)<\/published>/)?.[1]||"");
    if(!id||seen.has(id))continue;
    seen.add(id);
    out.push({
      id,
      title,
      url:`https://www.youtube.com/watch?v=${encodeURIComponent(id)}`,
      thumbnail:`https://i.ytimg.com/vi/${encodeURIComponent(id)}/hqdefault.jpg`,
      channel:teacher.channelName,
      channelId:teacher.channelId,
      channelUrl:`https://www.youtube.com/channel/${teacher.channelId}`,
      duration:null,
      timestamp:published?Math.floor(new Date(published).getTime()/1000):null
    });
    if(out.length>=MAX_PREVIEW_VIDEOS)break;
  }
  return out;
}

async function fetchChannelPreview(teacher){
  const controller=new AbortController();
  const timer=setTimeout(()=>controller.abort(),RSS_TIMEOUT_MS);
  try{
    const url=`https://www.youtube.com/feeds/videos.xml?channel_id=${encodeURIComponent(teacher.channelId)}`;
    const response=await fetch(url,{signal:controller.signal,headers:{accept:"application/atom+xml,application/xml,text/xml;q=0.9,*/*;q=0.1"}});
    if(!response.ok)throw new Error(`RSS HTTP ${response.status}`);
    const videos=parseRss(await response.text(),teacher);
    if(!videos.length)throw new Error("RSS video içermedi");
    return videos;
  }finally{clearTimeout(timer);}
}

async function runPool(items,worker,limit){
  const results=new Array(items.length);let next=0;
  async function run(){while(next<items.length){const i=next++;results[i]=await worker(items[i],i);}}
  await Promise.all(Array.from({length:Math.min(limit,items.length)},()=>run()));
  return results;
}

const feed=JSON.parse(await readFile(FEED_PATH,"utf8"));
if(!feed||typeof feed!=="object"||!feed.teachers||typeof feed.teachers!=="object")throw new Error("Hocalar v2 akışı geçersiz");
const catalog=parseCatalog(await readFile(APP_JS,"utf8"));
const entries=Object.entries(KNOWN_CHANNELS);
const now=new Date().toISOString();
let freshCount=0,fallbackCount=0;

const rows=await runPool(entries,async([name,known])=>{
  const old=feed.teachers[name]&&typeof feed.teachers[name]==="object"?feed.teachers[name]:{};
  const meta=catalog.get(name)||{};
  const teacher={name,...known};
  let videos=Array.isArray(old.videos)?old.videos.slice(0,MAX_PREVIEW_VIDEOS):[];
  let refreshedAt=old.refreshedAt||null;
  try{
    videos=await fetchChannelPreview(teacher);
    refreshedAt=now;freshCount++;
    console.log(`[teachers-v2-fast] ${name}: RSS · ${videos.length} son video`);
  }catch(error){
    fallbackCount++;
    console.warn(`[teachers-v2-fast] ${name}: RSS alınamadı; mevcut veri korundu (${error instanceof Error?error.message:String(error)})`);
  }
  const subjects=Array.isArray(known.subjects)?known.subjects:(Array.isArray(meta.subjects)?meta.subjects:(Array.isArray(old.subjects)?old.subjects:[]));
  const subject=known.subject||meta.subject||old.subject||(subjects.length===1?subjects[0]:"YKS");
  return [name,{
    ...old,
    name,
    subject,
    subjects,
    channelName:known.channelName,
    channelId:known.channelId,
    channelUrl:`https://www.youtube.com/channel/${known.channelId}`,
    channelSource:"verified",
    searchOnly:false,
    refreshedAt,
    videoCount:Math.max(Number(old.videoCount||0),videos.length),
    videos,
    playlists:Array.isArray(old.playlists)?old.playlists:[]
  }];
},CONCURRENCY);

for(const [name,row] of rows)feed.teachers[name]=row;
feed.version=Math.max(2,Number(feed.version||0));
feed.generatedAt=now;
feed.source="github-pages-fast-rss";
feed.teacherCount=Object.keys(feed.teachers).length;
feed.successCount=Object.values(feed.teachers).filter(row=>Array.isArray(row?.videos)&&row.videos.length>0).length;
await writeFile(FEED_PATH,`${JSON.stringify(feed,null,2)}\n`,"utf8");
console.log(`[teachers-v2-fast] hızlı akış hazır · ${freshCount} RSS güncel · ${fallbackCount} korundu · ${feed.successCount}/${feed.teacherCount} videolu hoca`);
