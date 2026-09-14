import {spawn} from "node:child_process";
import {readFile,writeFile,mkdir} from "node:fs/promises";
import {dirname,resolve} from "node:path";

const ROOT=resolve(process.cwd());
const OUTPUT=resolve(ROOT,"public/teachers-v2-feed.json");
const MAX_VIDEOS=8;
const MAX_PLAYLISTS=6;
const CONCURRENCY=3;

const CATALOG=[
  ["Şenol Hoca","Matematik"],
  ["MatMan","Matematik"],
  ["Matematik Kafası","Matematik"],
  ["İlyas Güneş","Matematik"],
  ["Matematiğin Güler Yüzü","Matematik"],
  ["Rehber Matematik","Matematik"],
  ["3 Dakikada Matematik","Matematik"],
  ["Eyüp B.","Matematik"],
  ["Mert Hoca","Matematik"],
  ["SML Hoca","Matematik"],
  ["Barış Çelenk","Matematik"],
  ["Bıyıklı Matematik","Matematik"],
  ["Merkeze Teğet Geometri","Geometri"],
  ["Yavuz Tuna Coğrafya","Coğrafya"],
  ["Coğrafyanın Kodları","Coğrafya"],
  ["Felsefe Hocası","Felsefe"],
  ["KR Akademi","YKS"],
  ["Hocalara Geldik","YKS"],
  ["Ferhat Yıldız","Matematik"],
  ["Moz Akademi","YKS"],
  ["Nurtaç Hoca","Türkçe"],
  ["Deniz Hoca","Türkçe"],
  ["Türkçenin Matematiği","Türkçe"],
  ["Altuğ Güneş","Fizik"],
  ["Fizikfinito","Fizik"],
  ["Fizik Evim","Fizik"],
  ["Tonguç Akademi","YKS"],
  ["Kimya Sarmal","Kimya"]
].map(([name,subject])=>({name,subject}));

function norm(value){
  return String(value||"")
    .toLocaleLowerCase("tr-TR")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g,"")
    .replace(/[^a-z0-9ığüşöç]+/gi," ")
    .trim();
}

function teacherTokens(name){
  return norm(name).split(/\s+/).filter(x=>x.length>1&&!new Set(["hoca","matematik","akademi"]).has(x));
}

function scoreEntry(entry,teacher){
  const tokens=teacherTokens(teacher.name);
  const hay=norm([entry.channel,entry.uploader,entry.title,entry.channel_id,entry.uploader_id].filter(Boolean).join(" "));
  let score=0;
  for(const token of tokens){
    if(hay.includes(token))score+=4;
  }
  const full=norm(teacher.name);
  if(full&&hay.includes(full))score+=12;
  const subject=norm(teacher.subject);
  if(subject&&hay.includes(subject))score+=1;
  if(/yks|tyt|ayt/.test(hay))score+=1;
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
      "--socket-timeout","10",
      "--retries","1",
      "--extractor-retries","1",
      "--playlist-end",String(limit),
      target
    ];
    const child=spawn("python3",args,{cwd:ROOT,stdio:["ignore","pipe","pipe"]});
    let out="",err="";
    const timer=setTimeout(()=>{
      child.kill("SIGKILL");
      rejectPromise(new Error(`yt-dlp timeout: ${target}`));
    },timeout);
    child.stdout.on("data",chunk=>{out+=String(chunk);});
    child.stderr.on("data",chunk=>{err+=String(chunk);});
    child.on("error",error=>{clearTimeout(timer);rejectPromise(error);});
    child.on("close",code=>{
      clearTimeout(timer);
      if(code!==0&&!out.trim()){
        rejectPromise(new Error(err.trim()||`yt-dlp exit ${code}`));
        return;
      }
      try{resolvePromise(JSON.parse(out));}
      catch(error){rejectPromise(new Error(`yt-dlp JSON okunamadı: ${error instanceof Error?error.message:String(error)}`));}
    });
  });
}

function normalizeVideos(entries,teacher){
  const rows=(Array.isArray(entries)?entries:[])
    .filter(Boolean)
    .map(entry=>({entry,score:scoreEntry(entry,teacher)}))
    .sort((a,b)=>b.score-a.score);
  const best=rows[0]?.entry||null;
  const bestChannel=String(best?.channel_id||best?.uploader_id||"");
  const bestName=String(best?.channel||best?.uploader||"");
  let selected=rows.filter(row=>{
    const entry=row.entry;
    if(bestChannel&&String(entry.channel_id||entry.uploader_id||"")===bestChannel)return true;
    if(bestName&&norm(entry.channel||entry.uploader||"")===norm(bestName))return true;
    return row.score>=4;
  });
  if(selected.length<3)selected=rows;
  const seen=new Set();
  return selected.map(({entry})=>{
    const id=String(entry.id||"");
    if(!id||seen.has(id))return null;
    seen.add(id);
    return {
      id,
      title:String(entry.title||"YouTube videosu"),
      url:videoUrl(id,entry.webpage_url||entry.url),
      thumbnail:thumbFor(id,entry),
      channel:String(entry.channel||entry.uploader||bestName||teacher.name),
      channelId:String(entry.channel_id||entry.uploader_id||bestChannel||""),
      channelUrl:String(entry.channel_url||entry.uploader_url||best?.channel_url||best?.uploader_url||""),
      duration:Number.isFinite(entry.duration)?Number(entry.duration):null,
      timestamp:Number.isFinite(entry.timestamp)?Number(entry.timestamp):null
    };
  }).filter(Boolean).slice(0,MAX_VIDEOS);
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
    return parsed&&typeof parsed==="object"?parsed:{version:2,teachers:{}};
  }catch{return {version:2,teachers:{}};}
}

async function refreshOne(teacher,previous){
  try{
    const searchQuery=`ytsearchdate12:${teacher.name} ${teacher.subject} YKS`;
    const search=await ytdlp(searchQuery,{limit:12,timeout:32000});
    const videos=normalizeVideos(search?.entries,teacher);
    if(!videos.length)throw new Error("video bulunamadı");
    const first=videos[0];
    const channelUrl=String(first.channelUrl||"").replace(/\/$/,"");
    let playlists=[];
    if(channelUrl){
      try{
        const pdata=await ytdlp(`${channelUrl}/playlists`,{limit:MAX_PLAYLISTS,timeout:26000});
        playlists=normalizePlaylists(pdata?.entries);
      }catch{}
    }
    return {
      name:teacher.name,
      subject:teacher.subject,
      channelName:first.channel||teacher.name,
      channelId:first.channelId||"",
      channelUrl:channelUrl||"",
      refreshedAt:new Date().toISOString(),
      videos,
      playlists
    };
  }catch(error){
    const old=previous?.teachers?.[teacher.name];
    if(old&&Array.isArray(old.videos)&&old.videos.length){
      console.warn(`[teachers-v2] ${teacher.name}: eski veri korundu (${error instanceof Error?error.message:String(error)})`);
      return old;
    }
    console.warn(`[teachers-v2] ${teacher.name}: veri alınamadı (${error instanceof Error?error.message:String(error)})`);
    return {
      name:teacher.name,
      subject:teacher.subject,
      channelName:"",
      channelId:"",
      channelUrl:"",
      refreshedAt:null,
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

const previous=await readPrevious();
const rows=await runPool(CATALOG,teacher=>refreshOne(teacher,previous),CONCURRENCY);
const teachers={};
for(const row of rows){
  if(row?.name)teachers[row.name]=row;
}
const success=Object.values(teachers).filter(item=>Array.isArray(item.videos)&&item.videos.length).length;
const feed={
  version:2,
  generatedAt:new Date().toISOString(),
  source:"github-pages-build",
  teacherCount:CATALOG.length,
  successCount:success,
  teachers
};
await mkdir(dirname(OUTPUT),{recursive:true});
await writeFile(OUTPUT,`${JSON.stringify(feed,null,2)}\n`,"utf8");
console.log(`[teachers-v2] medya akışı hazır: ${success}/${CATALOG.length} hoca`);
