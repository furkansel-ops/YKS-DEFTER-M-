import {spawn} from "node:child_process";
import {readFile,writeFile,mkdir} from "node:fs/promises";
import {dirname,resolve} from "node:path";
import {VERIFIED_CHANNELS} from "./teachers-v2-sources.mjs";

const ROOT=resolve(process.cwd());
const OUTPUT=resolve(ROOT,"public/teachers-v2-feed.json");
const CURATED_CATALOG=resolve(ROOT,"modules/teachers-curated-v3.js");
const MAX_VIDEOS=15;
const MAX_PLAYLISTS=12;
const SEARCH_BATCH=24;
const SEARCH_POOL_LIMIT=96;
const CONCURRENCY=4;
const CHANNEL_OVERRIDES=VERIFIED_CHANNELS;

function norm(value){return String(value||"").toLocaleLowerCase("tr-TR").normalize("NFKD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9ığüşöç]+/gi," ").trim();}
async function loadCatalog(){
  const source=await readFile(CURATED_CATALOG,"utf8"),start=source.indexOf("const CURATED_YKS_TEACHERS=["),end=source.indexOf(";\n  try{",start);
  if(start<0||end<0)throw new Error("Küratörlü Hocalar kataloğu bulunamadı");
  const block=source.slice(start,end),regex=/\{a:\"([^\"]+)\",d:\[([^\]]*)\]\s*,?\s*l:/g,catalog=[];let match;
  while((match=regex.exec(block))){const name=match[1].trim(),subjects=[...match[2].matchAll(/\"([^\"]+)\"/g)].map(x=>x[1]).filter(Boolean);if(!name||!subjects.length)continue;catalog.push({name,subjects,subject:subjects.length===1?subjects[0]:"YKS",...(CHANNEL_OVERRIDES[name]||{})});}
  if(!catalog.length)throw new Error("TEACHERS kataloğu ayrıştırılamadı");console.log(`[teachers-v2] küratörlü katalog: ${catalog.length} hoca`);return catalog;
}
function teacherTokens(name){return norm(name).split(/\s+/).filter(x=>x.length>1&&!new Set(["hoca","matematik","akademi"]).has(x));}
function scoreEntry(entry,teacher){
  const channelId=String(entry.channel_id||entry.uploader_id||""),channelName=norm(entry.channel||entry.uploader||""),title=norm(entry.title||""),hay=norm([entry.channel,entry.uploader,entry.title,channelId].filter(Boolean).join(" "));let score=0;
  if(teacher.channelId&&channelId===teacher.channelId)score+=120;if(teacher.channelName&&channelName===norm(teacher.channelName))score+=80;
  for(const token of teacherTokens(teacher.name)){if(title.includes(token))score+=6;else if(hay.includes(token))score+=3;}
  const full=norm(teacher.name);if(full&&title.includes(full))score+=24;else if(full&&hay.includes(full))score+=12;
  for(const subject of teacher.subjects||[]){const clean=norm(String(subject).replace(/\(ayt\)/ig,""));if(clean&&title.includes(clean))score+=3;}
  for(const term of teacher.focusTerms||[]){if(title.includes(norm(term)))score+=8;}
  if(/yks|tyt|ayt|ydt/.test(title))score+=2;if(/kamp|soru|deneme|tekrar|seri/.test(title))score+=2;return score;
}
function videoUrl(id,url){if(typeof url==="string"&&/^https:\/\/(www\.)?youtube\.com\//.test(url))return url;return id?`https://www.youtube.com/watch?v=${encodeURIComponent(id)}`:"";}
function thumbFor(id,entry){if(id)return `https://i.ytimg.com/vi/${encodeURIComponent(id)}/hqdefault.jpg`;if(typeof entry.thumbnail==="string")return entry.thumbnail;const thumbs=Array.isArray(entry.thumbnails)?entry.thumbnails:[];return thumbs.length?String(thumbs[thumbs.length-1]?.url||""):"";}
function ytdlp(target,{limit=24,timeout=40000}={}){
  return new Promise((resolvePromise,rejectPromise)=>{const args=["-m","yt_dlp","--flat-playlist","--dump-single-json","--no-warnings","--ignore-errors","--socket-timeout","10","--retries","1","--extractor-retries","1","--playlist-end",String(limit),target];const child=spawn("python3",args,{cwd:ROOT,stdio:["ignore","pipe","pipe"]});let out="",err="",settled=false;const fail=error=>{if(settled)return;settled=true;rejectPromise(error);};const timer=setTimeout(()=>{child.kill("SIGKILL");fail(new Error(`yt-dlp timeout: ${target}`));},timeout);child.stdout.on("data",chunk=>{out+=String(chunk);});child.stderr.on("data",chunk=>{err+=String(chunk);});child.on("error",error=>{clearTimeout(timer);fail(error);});child.on("close",code=>{clearTimeout(timer);if(settled)return;if(code!==0&&!out.trim()){fail(new Error(err.trim()||`yt-dlp exit ${code}`));return;}try{settled=true;resolvePromise(JSON.parse(out));}catch(error){fail(new Error(`yt-dlp JSON okunamadı: ${error instanceof Error?error.message:String(error)}`));}});});
}
async function searchTeacher(teacher){
  if((teacher.channelId||teacher.channelHandle)&&!teacher.searchOnly){const channelUrl=teacher.channelId?`https://www.youtube.com/channel/${teacher.channelId}`:`https://www.youtube.com/${teacher.channelHandle}`;const direct=await ytdlp(`${channelUrl}/videos`,{limit:24,timeout:40000});const entries=Array.isArray(direct?.entries)?direct.entries.filter(Boolean):[];if(entries.length){console.log(`[teachers-v2] ${teacher.name}: doğrulanmış kanal · ${entries.length} video`);return entries;}}
  const base=teacher.queryHint||teacher.name,focus=teacher.subject||"YKS";
  const queries=[`${base} ${focus} TYT`,`${base} ${focus} AYT`,`${base} ${focus} kamp`,`${base} ${focus} soru çözümü`,`${base} ${focus} deneme`,`${base} YKS`];
  const out=[],seen=new Set(),errors=[];
  for(const query of [...new Set(queries)]){
    try{const result=await ytdlp(`ytsearch${SEARCH_BATCH}:${query}`,{limit:SEARCH_BATCH,timeout:40000});for(const entry of Array.isArray(result?.entries)?result.entries:[]){if(!entry)continue;const key=String(entry.id||entry.url||"");if(!key||seen.has(key))continue;seen.add(key);out.push(entry);if(out.length>=SEARCH_POOL_LIMIT)break;}if(out.length>=SEARCH_POOL_LIMIT)break;}
    catch(error){errors.push(`${query}: ${error instanceof Error?error.message:String(error)}`);}
  }
  if(!out.length)throw new Error(errors.join(" | ")||"arama sonucu yok");console.log(`[teachers-v2] ${teacher.name}: ${out.length} odaklı arama sonucu`);return out;
}
function normalizeVideos(entries,teacher){
  const rows=(Array.isArray(entries)?entries:[]).filter(Boolean).map((entry,index)=>({entry,index,score:scoreEntry(entry,teacher)}));const pinned=Boolean((teacher.channelId||teacher.channelHandle)&&!teacher.searchOnly);let selected;
  if(pinned){selected=rows.filter(row=>!teacher.channelId||String(row.entry.channel_id||row.entry.uploader_id||"")===teacher.channelId);if(selected.length<MAX_VIDEOS)selected=rows;}
  else{selected=rows.filter(row=>row.score>=4);if(selected.length<MAX_VIDEOS)selected=rows.filter(row=>row.score>0);selected.sort((a,b)=>b.score-a.score||a.index-b.index);}
  const seen=new Set();return selected.map(({entry})=>{const id=String(entry.id||"");if(!id||seen.has(id))return null;seen.add(id);const rawChannel=String(entry.channel||entry.uploader||"");const resolvedId=teacher.channelId||String(entry.channel_id||entry.uploader_id||"");const channelUrl=resolvedId?`https://www.youtube.com/channel/${resolvedId}`:(teacher.channelHandle?`https://www.youtube.com/${teacher.channelHandle}`:String(entry.channel_url||entry.uploader_url||""));return {id,title:String(entry.title||"YouTube videosu"),url:videoUrl(id,entry.webpage_url||entry.url),thumbnail:thumbFor(id,entry),channel:pinned?(teacher.channelName||rawChannel||teacher.name):(rawChannel||teacher.channelName||teacher.name),channelId:resolvedId,channelUrl,duration:Number.isFinite(entry.duration)?Number(entry.duration):null,timestamp:Number.isFinite(entry.timestamp)?Number(entry.timestamp):null};}).filter(Boolean).slice(0,MAX_VIDEOS);
}
function normalizePlaylists(entries){const seen=new Set();return (Array.isArray(entries)?entries:[]).map(entry=>{if(!entry)return null;const id=String(entry.id||""),title=String(entry.title||"").trim();if(!id||!title||seen.has(id))return null;seen.add(id);const raw=String(entry.webpage_url||entry.url||"");return {id,title,url:raw.startsWith("http")?raw:`https://www.youtube.com/playlist?list=${encodeURIComponent(id)}`};}).filter(Boolean).slice(0,MAX_PLAYLISTS);}
async function readPrevious(){try{const parsed=JSON.parse(await readFile(OUTPUT,"utf8"));return parsed&&typeof parsed==="object"?parsed:{version:2,teachers:{}};}catch{return {version:2,teachers:{}};}}
async function refreshOne(teacher,previous){
  try{const entries=await searchTeacher(teacher),videos=normalizeVideos(entries,teacher);if(!videos.length)throw new Error("arama sonuçları video kimliği içermedi");const pinned=Boolean((teacher.channelId||teacher.channelHandle)&&!teacher.searchOnly);const channelUrl=teacher.channelId?`https://www.youtube.com/channel/${teacher.channelId}`:(teacher.channelHandle?`https://www.youtube.com/${teacher.channelHandle}`:videos[0]?.channelUrl||"");let playlists=[];if(pinned&&channelUrl){try{const pdata=await ytdlp(`${channelUrl}/playlists`,{limit:MAX_PLAYLISTS,timeout:35000});playlists=normalizePlaylists(pdata?.entries);}catch{}}
    return {name:teacher.name,subject:teacher.subject,subjects:teacher.subjects,channelName:teacher.channelName||videos[0].channel||teacher.name,channelId:teacher.channelId||videos[0]?.channelId||"",channelHandle:teacher.channelHandle||"",channelUrl,searchOnly:!!teacher.searchOnly,queryHint:teacher.queryHint||"",focusTerms:Array.isArray(teacher.focusTerms)?teacher.focusTerms:[],refreshedAt:new Date().toISOString(),videoCount:videos.length,playlistCount:playlists.length,videos,playlists};
  }catch(error){const old=previous?.teachers?.[teacher.name];if(old&&Array.isArray(old.videos)&&old.videos.length){console.warn(`[teachers-v2] ${teacher.name}: eski veri korundu (${error instanceof Error?error.message:String(error)})`);return {...old,searchOnly:!!teacher.searchOnly,queryHint:teacher.queryHint||old.queryHint||"",focusTerms:Array.isArray(teacher.focusTerms)?teacher.focusTerms:(old.focusTerms||[])};}console.warn(`[teachers-v2] ${teacher.name}: veri alınamadı (${error instanceof Error?error.message:String(error)})`);return {name:teacher.name,subject:teacher.subject,subjects:teacher.subjects,channelName:teacher.channelName||"",channelId:teacher.channelId||"",channelHandle:teacher.channelHandle||"",channelUrl:teacher.channelId?`https://www.youtube.com/channel/${teacher.channelId}`:(teacher.channelHandle?`https://www.youtube.com/${teacher.channelHandle}`:""),searchOnly:!!teacher.searchOnly,queryHint:teacher.queryHint||"",focusTerms:Array.isArray(teacher.focusTerms)?teacher.focusTerms:[],refreshedAt:null,videoCount:0,playlistCount:0,videos:[],playlists:[]};}
}
async function runPool(items,worker,limit){const results=new Array(items.length);let next=0;async function run(){while(next<items.length){const index=next++;results[index]=await worker(items[index],index);}}await Promise.all(Array.from({length:Math.min(limit,items.length)},()=>run()));return results;}

const CATALOG=await loadCatalog(),previous=await readPrevious(),rows=await runPool(CATALOG,teacher=>refreshOne(teacher,previous),CONCURRENCY),teachers={};for(const row of rows)if(row?.name)teachers[row.name]=row;
const success=Object.values(teachers).filter(item=>Array.isArray(item.videos)&&item.videos.length).length,fullPreview=Object.values(teachers).filter(item=>Array.isArray(item.videos)&&item.videos.length>=MAX_VIDEOS).length;
const feed={version:6,generatedAt:new Date().toISOString(),source:"github-pages-focused-yks-refresh",teacherCount:CATALOG.length,successCount:success,fullPreviewCount:fullPreview,teachers};
await mkdir(dirname(OUTPUT),{recursive:true});await writeFile(OUTPUT,`${JSON.stringify(feed,null,2)}\n`,"utf8");console.log(`[teachers-v2] medya akışı hazır: ${success}/${CATALOG.length} hoca · ${fullPreview}/${CATALOG.length} hocada ${MAX_VIDEOS} video`);
