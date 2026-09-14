import {spawn} from "node:child_process";
import {readFile,writeFile} from "node:fs/promises";
import {resolve} from "node:path";

const ROOT=resolve(process.cwd());
const FEED_PATH=resolve(ROOT,"public/teachers-v2-feed.json");
const FERRUM={
  name:"Ferrum",
  subject:"Kimya",
  subjects:["Kimya"],
  channelId:"UC0yco2kB3xW3WI__8E8HaKw",
  channelName:"Ferrum"
};

function ytdlp(target,{limit=8,timeout=32000}={}){
  return new Promise((resolvePromise,rejectPromise)=>{
    const args=[
      "-m","yt_dlp","--flat-playlist","--dump-single-json","--no-warnings","--ignore-errors",
      "--socket-timeout","10","--retries","1","--extractor-retries","1","--playlist-end",String(limit),target
    ];
    const child=spawn("python3",args,{cwd:ROOT,stdio:["ignore","pipe","pipe"]});
    let out="",err="",settled=false;
    const fail=error=>{if(settled)return;settled=true;rejectPromise(error);};
    const timer=setTimeout(()=>{child.kill("SIGKILL");fail(new Error(`yt-dlp timeout: ${target}`));},timeout);
    child.stdout.on("data",chunk=>{out+=String(chunk);});
    child.stderr.on("data",chunk=>{err+=String(chunk);});
    child.on("error",error=>{clearTimeout(timer);fail(error);});
    child.on("close",code=>{
      clearTimeout(timer);
      if(settled)return;
      if(code!==0&&!out.trim()){fail(new Error(err.trim()||`yt-dlp exit ${code}`));return;}
      try{settled=true;resolvePromise(JSON.parse(out));}
      catch(error){fail(new Error(`yt-dlp JSON okunamadı: ${error instanceof Error?error.message:String(error)}`));}
    });
  });
}

function normalizeVideos(entries){
  const seen=new Set();
  return (Array.isArray(entries)?entries:[]).map(entry=>{
    if(!entry)return null;
    const id=String(entry.id||"");
    if(!id||seen.has(id))return null;
    seen.add(id);
    return {
      id,
      title:String(entry.title||"YouTube videosu"),
      url:`https://www.youtube.com/watch?v=${encodeURIComponent(id)}`,
      thumbnail:`https://i.ytimg.com/vi/${encodeURIComponent(id)}/hqdefault.jpg`,
      channel:FERRUM.channelName,
      channelId:FERRUM.channelId,
      channelUrl:`https://www.youtube.com/channel/${FERRUM.channelId}`,
      duration:Number.isFinite(entry.duration)?Number(entry.duration):null,
      timestamp:Number.isFinite(entry.timestamp)?Number(entry.timestamp):null
    };
  }).filter(Boolean).slice(0,8);
}

const feed=JSON.parse(await readFile(FEED_PATH,"utf8"));
if(!feed||typeof feed!=="object"||!feed.teachers||typeof feed.teachers!=="object")throw new Error("Hocalar v2 akışı geçersiz");

let videos=[];
try{
  const data=await ytdlp(`https://www.youtube.com/channel/${FERRUM.channelId}/videos`);
  videos=normalizeVideos(data?.entries);
}catch(error){
  const old=feed.teachers[FERRUM.name];
  if(old&&Array.isArray(old.videos))videos=old.videos.slice(0,8);
  console.warn(`[teachers-v2] Ferrum hızlı önizlemesi alınamadı; kanal eşleşmesi yine korunacak (${error instanceof Error?error.message:String(error)})`);
}

feed.teachers[FERRUM.name]={
  ...(feed.teachers[FERRUM.name]||{}),
  ...FERRUM,
  channelUrl:`https://www.youtube.com/channel/${FERRUM.channelId}`,
  channelSource:"verified",
  searchOnly:false,
  refreshedAt:new Date().toISOString(),
  videos,
  playlists:Array.isArray(feed.teachers[FERRUM.name]?.playlists)?feed.teachers[FERRUM.name].playlists:[]
};
feed.teacherCount=Object.keys(feed.teachers).length;
feed.successCount=Object.values(feed.teachers).filter(row=>Array.isArray(row?.videos)&&row.videos.length>0).length;
await writeFile(FEED_PATH,`${JSON.stringify(feed,null,2)}\n`,"utf8");
console.log(`[teachers-v2] Ferrum doğrulanmış kanalla eklendi · ${videos.length} hızlı video · toplam ${feed.teacherCount} hoca`);
