import {spawn} from "node:child_process";
import {readFile,writeFile,mkdir} from "node:fs/promises";
import {dirname,resolve} from "node:path";

const ROOT=resolve(process.cwd());
const FEED_PATH=resolve(ROOT,"public/teachers-v2-feed.json");
const PREVIEW_VIDEOS=12;
const PREVIEW_PLAYLISTS=8;
const SEARCH_LIMIT=240;
const SEARCH_PER_QUERY=50;
const CONCURRENCY=4;
const GENERIC=new Set(["hoca","hocasi","akademi","matematik","geometri","fizik","kimya","biyoloji","turkce","edebiyat","tarih","cografya","felsefe","yks","tyt","ayt","ydt"]);

function norm(value){
  return String(value||"")
    .toLocaleLowerCase("tr-TR").normalize("NFKD").replace(/[\u0300-\u036f]/g,"")
    .replace(/ı/g,"i").replace(/ğ/g,"g").replace(/ü/g,"u").replace(/ş/g,"s").replace(/ö/g,"o").replace(/ç/g,"c")
    .replace(/[^a-z0-9]+/g," ").replace(/\s+/g," ").trim();
}

function specificTokens(name){
  return norm(name).split(" ").filter(token=>token.length>=3&&!GENERIC.has(token));
}

function channelMatchesTeacher(channelName,teacherName){
  const channel=norm(channelName),teacher=norm(teacherName);
  if(!channel||!teacher)return false;
  if(channel.includes(teacher)||teacher.includes(channel))return true;
  const tokens=specificTokens(teacherName);
  return tokens.length>0&&tokens.every(token=>channel.includes(token));
}

function ytdlp(target,{limit=0,timeout=120000}={}){
  return new Promise((resolvePromise,rejectPromise)=>{
    const args=["-m","yt_dlp","--flat-playlist","--dump-single-json","--no-warnings","--ignore-errors","--socket-timeout","15","--retries","1","--extractor-retries","1"];
    if(Number.isFinite(limit)&&limit>0)args.push("--playlist-end",String(limit));
    args.push(target);
    const child=spawn("python3",args,{cwd:ROOT,stdio:["ignore","pipe","pipe"]});
    let out="",err="",settled=false;
    const fail=error=>{if(settled)return;settled=true;rejectPromise(error);};
    const timer=setTimeout(()=>{child.kill("SIGKILL");fail(new Error(`yt-dlp timeout: ${target}`));},timeout);
    child.stdout.on("data",chunk=>{out+=String(chunk);});
    child.stderr.on("data",chunk=>{err+=String(chunk);});
    child.on("error",error=>{clearTimeout(timer);fail(error);});
    child.on("close",code=>{
      clearTimeout(timer);if(settled)return;
      if(code!==0&&!out.trim()){fail(new Error(err.trim()||`yt-dlp exit ${code}`));return;}
      try{settled=true;resolvePromise(JSON.parse(out));}
      catch(error){fail(new Error(`yt-dlp JSON okunamadı: ${error instanceof Error?error.message:String(error)}`));}
    });
  });
}

function normalizeVideo(entry,teacher,channelId="",channelName=""){
  const id=String(entry?.id||"").trim();
  if(!id)return null;
  return {
    id,
    title:String(entry?.title||"YouTube videosu"),
    url:`https://www.youtube.com/watch?v=${encodeURIComponent(id)}`,
    thumbnail:`https://i.ytimg.com/vi/${encodeURIComponent(id)}/hqdefault.jpg`,
    channel:channelName||String(entry?.channel||entry?.uploader||teacher.name||""),
    channelId:channelId||String(entry?.channel_id||entry?.uploader_id||""),
    channelUrl:channelId?`https://www.youtube.com/channel/${channelId}`:String(entry?.channel_url||entry?.uploader_url||""),
    duration:Number.isFinite(entry?.duration)?Number(entry.duration):null,
    timestamp:Number.isFinite(entry?.timestamp)?Number(entry.timestamp):null
  };
}

function dedupeVideos(entries,teacher,channelId="",channelName=""){
  const seen=new Set(),videos=[];
  for(const entry of Array.isArray(entries)?entries:[]){
    const video=normalizeVideo(entry,teacher,channelId,channelName);
    if(!video||seen.has(video.id))continue;
    seen.add(video.id);videos.push(video);
  }
  return videos;
}

function normalizePlaylists(entries){
  const seen=new Set(),rows=[];
  for(const entry of Array.isArray(entries)?entries:[]){
    const id=String(entry?.id||"").trim(),title=String(entry?.title||"").trim();
    if(!id||!title||seen.has(id))continue;
    seen.add(id);
    const raw=String(entry?.webpage_url||entry?.url||"");
    rows.push({id,title,url:raw.startsWith("http")?raw:`https://www.youtube.com/playlist?list=${encodeURIComponent(id)}`});
  }
  return rows;
}

function relevance(entry,teacher){
  const title=norm(entry?.title||""),channel=norm(entry?.channel||entry?.uploader||"");
  const whole=norm(teacher.name),hay=`${title} ${channel}`;
  if(whole&&hay.includes(whole))return 100;
  const tokens=specificTokens(teacher.name);
  if(tokens.length&&tokens.every(token=>hay.includes(token)))return 80;
  if(tokens.length&&tokens.some(token=>title.includes(token)))return 50;
  return 0;
}

async function searchTeacher(teacher){
  const subject=String((teacher.subjects||[])[0]||teacher.subject||"YKS");
  const queries=[`${teacher.name} ${subject} YKS`,`${teacher.name} TYT`,`${teacher.name} AYT`,`${teacher.name} deneme`,`${teacher.name} kamp`,teacher.name];
  const seen=new Set(),merged=[];
  for(const query of [...new Set(queries)]){
    try{
      const data=await ytdlp(`ytsearch${SEARCH_PER_QUERY}:${query}`,{limit:SEARCH_PER_QUERY,timeout:50000});
      for(const entry of Array.isArray(data?.entries)?data.entries:[]){
        const id=String(entry?.id||entry?.url||"");
        if(!id||seen.has(id)||relevance(entry,teacher)<50)continue;
        seen.add(id);merged.push(entry);
        if(merged.length>=SEARCH_LIMIT)break;
      }
    }catch{}
    if(merged.length>=SEARCH_LIMIT)break;
  }
  return dedupeVideos(merged,teacher).slice(0,SEARCH_LIMIT);
}

async function fullTrustedChannel(teacher){
  const channelId=String(teacher.channelId||"");
  if(!channelId)return null;
  const channelName=String(teacher.channelName||teacher.name||"");
  const url=`https://www.youtube.com/channel/${channelId}`;
  const [videoData,playlistData]=await Promise.all([
    ytdlp(`${url}/videos`,{limit:0,timeout:180000}),
    ytdlp(`${url}/playlists`,{limit:0,timeout:120000}).catch(()=>({entries:[]}))
  ]);
  const videos=dedupeVideos(videoData?.entries,teacher,channelId,channelName);
  if(!videos.length)return null;
  return {videos,playlists:normalizePlaylists(playlistData?.entries),channelId,channelName,channelUrl:url};
}

async function finalizeTeacher(manifest){
  const archivePath=resolve(ROOT,"public",String(manifest.archiveFile||""));
  let archive={...manifest,videos:Array.isArray(manifest.videos)?manifest.videos:[],playlists:Array.isArray(manifest.playlists)?manifest.playlists:[]};
  try{archive={...archive,...JSON.parse(await readFile(archivePath,"utf8"))};}catch{}

  const source=String(archive.channelSource||manifest.channelSource||"");
  const explicit=source==="override";
  const inferred=source==="inferred";
  const trusted=explicit||(inferred&&channelMatchesTeacher(archive.channelName,archive.name));

  if(trusted&&archive.channelId){
    try{
      const full=await fullTrustedChannel(archive);
      if(full){
        archive={...archive,...full,channelSource:explicit?"override":"inferred-verified",searchOnly:false,archiveComplete:true,refreshedAt:new Date().toISOString()};
        console.log(`[teachers-v2-final] ${archive.name}: güvenilir tam kanal · ${full.videos.length} video · ${full.playlists.length} playlist`);
      }
    }catch(error){console.warn(`[teachers-v2-final] ${archive.name}: tam kanal yenilenemedi (${error instanceof Error?error.message:String(error)})`);}
  }else{
    const videos=await searchTeacher(archive).catch(()=>[]);
    if(videos.length){
      archive={...archive,videos,playlists:[],channelId:"",channelUrl:"",channelSource:"search-verified",searchOnly:true,archiveComplete:false,refreshedAt:new Date().toISOString()};
      console.log(`[teachers-v2-final] ${archive.name}: öğretmen odaklı arama · ${videos.length} video`);
    }else{
      const safe=(Array.isArray(archive.videos)?archive.videos:[]).filter(video=>relevance(video,archive)>=50).slice(0,SEARCH_LIMIT);
      archive={...archive,videos:safe,playlists:[],channelId:"",channelUrl:"",channelSource:"search-verified",searchOnly:true,archiveComplete:false};
      console.warn(`[teachers-v2-final] ${archive.name}: yalnız güvenli eski sonuçlar · ${safe.length} video`);
    }
  }

  archive.videoCount=archive.videos.length;
  archive.playlistCount=archive.playlists.length;
  await mkdir(dirname(archivePath),{recursive:true});
  await writeFile(archivePath,`${JSON.stringify(archive,null,2)}\n`,"utf8");
  return archive;
}

async function pool(items,worker,limit){
  const out=new Array(items.length);let next=0;
  async function run(){while(next<items.length){const i=next++;out[i]=await worker(items[i],i);}}
  await Promise.all(Array.from({length:Math.min(limit,items.length)},()=>run()));
  return out;
}

const feed=JSON.parse(await readFile(FEED_PATH,"utf8"));
const manifests=Object.values(feed.teachers||{});
const rows=await pool(manifests,finalizeTeacher,CONCURRENCY);
const teachers={};
for(const row of rows){
  if(!row?.name)continue;
  teachers[row.name]={
    name:row.name,subject:row.subject,subjects:row.subjects,
    channelName:row.channelName,channelId:row.channelId,channelUrl:row.channelUrl,channelSource:row.channelSource,
    searchOnly:row.searchOnly,refreshedAt:row.refreshedAt,archiveFile:row.archiveFile,archiveComplete:row.archiveComplete,
    videoCount:row.videoCount,playlistCount:row.playlistCount,
    videos:row.videos.slice(0,PREVIEW_VIDEOS),playlists:row.playlists.slice(0,PREVIEW_PLAYLISTS)
  };
}
const success=Object.values(teachers).filter(row=>row.videoCount>0).length;
const totalVideos=Object.values(teachers).reduce((sum,row)=>sum+Number(row.videoCount||0),0);
const totalPlaylists=Object.values(teachers).reduce((sum,row)=>sum+Number(row.playlistCount||0),0);
const finalFeed={...feed,version:4,generatedAt:new Date().toISOString(),source:"github-pages-build-verified",successCount:success,totalVideos,totalPlaylists,teachers};
await writeFile(FEED_PATH,`${JSON.stringify(finalFeed,null,2)}\n`,"utf8");
console.log(`[teachers-v2-final] doğrulanmış arşiv hazır: ${success}/${manifests.length} hoca · ${totalVideos} video · ${totalPlaylists} playlist`);
