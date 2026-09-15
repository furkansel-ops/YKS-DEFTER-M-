import {spawn} from "node:child_process";
import {readFile,writeFile,mkdir} from "node:fs/promises";
import {dirname,resolve} from "node:path";
import {VERIFIED_CHANNELS} from "./teachers-v2-sources.mjs";

const ROOT=resolve(process.cwd());
const OUTPUT=resolve(ROOT,"public/teachers-v2-feed.json");
const CURATED_CATALOG=resolve(ROOT,"modules/teachers-curated-v3.js");
const MAX_VIDEOS=8;
const MAX_PLAYLISTS=6;
const CONCURRENCY=4;

/* Kanal kimliği net olan hocaları arama sıralamasına bırakmıyoruz.
   Bazı eski kaynak adları ise gerçek bir tek kanal değil; onlar searchOnly kalır. */
const CHANNEL_OVERRIDES=VERIFIED_CHANNELS;

function norm(value){
  return String(value||"")
    .toLocaleLowerCase("tr-TR")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g,"")
    .replace(/[^a-z0-9ığüşöç]+/gi," ")
    .trim();
}

async function loadCatalog(){
  const source=await readFile(CURATED_CATALOG,"utf8");
  const start=source.indexOf("const CURATED_YKS_TEACHERS=[");
  const end=source.indexOf(";\n  try{",start);
  if(start<0||end<0)throw new Error("Küratörlü Hocalar kataloğu bulunamadı");
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
      ...override
    });
  }
  if(!catalog.length)throw new Error("TEACHERS kataloğu ayrıştırılamadı");
  console.log(`[teachers-v2] küratörlü katalog: ${catalog.length} hoca`);
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
      "--socket-timeout","10",
      "--retries","1",
      "--extractor-retries","1",
      "--playlist-end",String(limit),
      target
    ];
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

async function searchTeacher(teacher){
  if((teacher.channelId||teacher.channelHandle)&&!teacher.searchOnly){
    const channelUrl=teacher.channelId?`https://www.youtube.com/channel/${teacher.channelId}`:`https://www.youtube.com/${teacher.channelHandle}`;
    const direct=await ytdlp(`${channelUrl}/videos`,{limit:12,timeout:32000});
    const entries=Array.isArray(direct?.entries)?direct.entries.filter(Boolean):[];
    if(entries.length){
      console.log(`[teachers-v2] ${teacher.name}: doğrulanmış kanal · ${entries.length} video`);
      return entries;
    }
  }

  const focus=teacher.queryHint||teacher.subject;
  const queries=[
    `${teacher.name} ${focus} YKS`,
    `${teacher.name} ${focus}`,
    `${teacher.name} YKS`,
    teacher.name
  ];
  const errors=[];
  for(const query of [...new Set(queries)]){
    try{
      const result=await ytdlp(`ytsearch12:${query}`,{limit:12,timeout:32000});
      const entries=Array.isArray(result?.entries)?result.entries.filter(Boolean):[];
      if(entries.length){
        console.log(`[teachers-v2] ${teacher.name}: ${entries.length} arama sonucu`);
        return entries;
      }
      errors.push(`${query}: 0 sonuç`);
    }catch(error){
      errors.push(`${query}: ${error instanceof Error?error.message:String(error)}`);
    }
  }
  throw new Error(errors.join(" | ")||"arama sonucu yok");
}

function normalizeVideos(entries,teacher){
  const rows=(Array.isArray(entries)?entries:[])
    .filter(Boolean)
    .map(entry=>({entry,score:scoreEntry(entry,teacher)}))
    .sort((a,b)=>b.score-a.score);
  const pinned=Boolean((teacher.channelId||teacher.channelHandle)&&!teacher.searchOnly);
  let selected=pinned
    ?rows.filter(row=>String(row.entry.channel_id||row.entry.uploader_id||"")===teacher.channelId)
    :rows.filter(row=>row.score>=4);
  if(!selected.length)selected=rows;
  if(!pinned&&selected.length<3)selected=rows;
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
      channel:pinned?(teacher.channelName||rawChannel||teacher.name):(rawChannel||teacher.name),
      channelId:pinned?(teacher.channelId||String(entry.channel_id||entry.uploader_id||"")):String(entry.channel_id||entry.uploader_id||""),
      channelUrl:pinned?(teacher.channelId?`https://www.youtube.com/channel/${teacher.channelId}`:`https://www.youtube.com/${teacher.channelHandle}`):String(entry.channel_url||entry.uploader_url||""),
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
    const entries=await searchTeacher(teacher);
    const videos=normalizeVideos(entries,teacher);
    if(!videos.length)throw new Error("arama sonuçları video kimliği içermedi");

    const pinned=Boolean((teacher.channelId||teacher.channelHandle)&&!teacher.searchOnly);
    const channelUrl=pinned?`https://www.youtube.com/channel/${teacher.channelId}`:"";
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
      subjects:teacher.subjects,
      channelName:pinned?(teacher.channelName||videos[0].channel||teacher.name):"",
      channelId:pinned?(teacher.channelId||videos[0]?.channelId||""):"",
      channelHandle:pinned?(teacher.channelHandle||""):"",
      channelUrl,
      searchOnly:!!teacher.searchOnly,
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
      subjects:teacher.subjects,
      channelName:"",
      channelId:"",
      channelUrl:"",
      searchOnly:!!teacher.searchOnly,
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

const CATALOG=await loadCatalog();
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
