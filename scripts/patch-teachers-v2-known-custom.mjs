import {readFile,writeFile} from "node:fs/promises";
import {resolve} from "node:path";
import {CURATED_VIDEOS,VERIFIED_CHANNELS,channelUrl as sourceChannelUrl} from "./teachers-v2-sources.mjs";

const ROOT=resolve(process.cwd());
const FEED_PATH=resolve(ROOT,"public/teachers-v2-feed.json");
const CURATED_CATALOG=resolve(ROOT,"modules/teachers-curated-v3.js");
const RSS_TIMEOUT_MS=7000;
const PLAYLIST_TIMEOUT_MS=8500;
const CONCURRENCY=8;
const MAX_PREVIEW_VIDEOS=15;
const MAX_PLAYLISTS=16;
const KNOWN_CHANNELS=VERIFIED_CHANNELS;

function decodeXml(value=""){
  return String(value)
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g,"$1")
    .replace(/&#(\d+);/g,(_,n)=>String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi,(_,n)=>String.fromCodePoint(Number.parseInt(n,16)))
    .replace(/&quot;/g,'"').replace(/&apos;/g,"'")
    .replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&amp;/g,"&")
    .replace(/\s+/g," ").trim();
}
function decodeJs(value=""){
  try{return JSON.parse(`"${String(value).replace(/"/g,'\\"')}"`);}catch{}
  return String(value).replace(/\\u0026/g,"&").replace(/\\u003d/g,"=").replace(/\\\//g,"/").replace(/\\n/g," ").replace(/\\"/g,'"').trim();
}
function norm(value=""){
  return String(value).toLocaleLowerCase("tr-TR").normalize("NFKD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9ığüşöç]+/gi," ").trim();
}
function parseCatalog(source){
  const start=source.indexOf("const CURATED_YKS_TEACHERS=[");
  const end=source.indexOf(";\n  try{",start);
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
function parseChannelId(html){
  const text=String(html||"");
  const patterns=[
    /"channelId":"(UC[\w-]{20,})"/,
    /<meta\s+itemprop="channelId"\s+content="(UC[\w-]{20,})"/i,
    /youtube\.com\/channel\/(UC[\w-]{20,})/i,
    /"browseId":"(UC[\w-]{20,})"/
  ];
  for(const pattern of patterns){const hit=text.match(pattern)?.[1];if(hit)return hit;}
  return "";
}
async function fetchText(url,timeoutMs,accept="text/html"){
  const controller=new AbortController();
  const timer=setTimeout(()=>controller.abort(),timeoutMs);
  try{
    const response=await fetch(url,{signal:controller.signal,headers:{accept,"accept-language":"tr-TR,tr;q=0.9,en;q=0.5","user-agent":"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/140 Safari/537.36"}});
    if(!response.ok)throw new Error(`HTTP ${response.status}`);
    return await response.text();
  }finally{clearTimeout(timer);}
}
async function resolveChannel(name,known){
  if(known.channelId)return {...known};
  if(!known.channelHandle)throw new Error(`${name}: doğrulanmış kanal kimliği yok`);
  const page=`https://www.youtube.com/${known.channelHandle}`;
  const html=await fetchText(page,RSS_TIMEOUT_MS,"text/html,application/xhtml+xml");
  const channelId=parseChannelId(html);
  if(!channelId)throw new Error(`${name}: ${known.channelHandle} kanal kimliği çözülemedi`);
  return {...known,channelId};
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
    out.push({id,title,url:`https://www.youtube.com/watch?v=${encodeURIComponent(id)}`,thumbnail:`https://i.ytimg.com/vi/${encodeURIComponent(id)}/hqdefault.jpg`,channel:teacher.channelName,channelId:teacher.channelId,channelUrl:`https://www.youtube.com/channel/${teacher.channelId}`,duration:null,timestamp:published?Math.floor(new Date(published).getTime()/1000):null});
  }
  const focus=(teacher.focusTerms||[]).map(norm).filter(Boolean);
  if(!focus.length)return out.slice(0,MAX_PREVIEW_VIDEOS);
  return out.filter(video=>focus.some(term=>norm(video.title).includes(term))).slice(0,MAX_PREVIEW_VIDEOS);
}
function curatedVideos(name,teacher){
  return (CURATED_VIDEOS[name]||[]).map(video=>({id:String(video.id||""),title:String(video.title||"YouTube videosu"),url:`https://www.youtube.com/watch?v=${encodeURIComponent(video.id||"")}`,thumbnail:`https://i.ytimg.com/vi/${encodeURIComponent(video.id||"")}/hqdefault.jpg`,channel:teacher.channelName,channelId:teacher.channelId||"",channelUrl:teacher.channelId?`https://www.youtube.com/channel/${teacher.channelId}`:sourceChannelUrl(teacher),duration:null,timestamp:null,curated:true})).filter(video=>video.id);
}
function mergeVideos(...groups){
  const out=[],seen=new Set();
  for(const group of groups)for(const video of group||[]){if(!video?.id||seen.has(video.id))continue;seen.add(video.id);out.push(video);if(out.length>=MAX_PREVIEW_VIDEOS)break;}
  return out.slice(0,MAX_PREVIEW_VIDEOS);
}
async function fetchChannelPreview(teacher){
  if(!teacher.channelId||teacher.searchOnly)return [];
  const url=`https://www.youtube.com/feeds/videos.xml?channel_id=${encodeURIComponent(teacher.channelId)}`;
  const xml=await fetchText(url,RSS_TIMEOUT_MS,"application/atom+xml,application/xml,text/xml;q=0.9,*/*;q=0.1");
  const videos=parseRss(xml,teacher);
  if(!videos.length)throw new Error("RSS video içermedi");
  return videos;
}
function nearestPlaylistTitle(html,index){
  const left=html.slice(Math.max(0,index-1000),index),right=html.slice(index,Math.min(html.length,index+1300));
  const re=/"title":\{"runs":\[\{"text":"((?:\\.|[^"\\])+)"/g;
  const after=re.exec(right)?.[1];if(after)return decodeJs(after);
  const hits=[...left.matchAll(re)];return hits.length?decodeJs(hits[hits.length-1][1]):"";
}
function playlistScore(title,teacher){
  const text=norm(title);let score=0;
  if(/\btyt\b/.test(text))score+=9;if(/\bayt\b/.test(text))score+=9;if(/\byks\b/.test(text))score+=5;
  if(/kamp|seri|soru|cozum|çözüm|deneme|tekrar|konu/.test(text))score+=5;
  const focus=[...(teacher.focusTerms||[]),...(teacher.subjects||[])].map(x=>norm(String(x).replace(/\(ayt\)/ig,""))).filter(x=>x.length>2&&x!=="yks");
  if(focus.some(term=>text.includes(term)))score+=10;
  return score;
}
function parsePlaylists(html,teacher){
  const out=[],seen=new Set(),text=String(html||"");
  for(const match of text.matchAll(/"playlistId":"([A-Za-z0-9_-]{10,})"/g)){
    const id=match[1];if(seen.has(id))continue;
    const title=nearestPlaylistTitle(text,match.index||0);if(!title||/mix|uploads/i.test(title))continue;
    seen.add(id);out.push({id,title,url:`https://www.youtube.com/playlist?list=${encodeURIComponent(id)}`,score:playlistScore(title,teacher)});
  }
  out.sort((a,b)=>b.score-a.score||a.title.localeCompare(b.title,"tr"));
  const relevant=out.filter(x=>x.score>0),fallback=out.filter(x=>x.score<=0);
  return [...relevant,...fallback].slice(0,MAX_PLAYLISTS).map(({score,...row})=>row);
}
async function fetchChannelPlaylists(teacher){
  if(teacher.searchOnly)return [];
  const base=teacher.channelHandle?`https://www.youtube.com/${teacher.channelHandle}`:`https://www.youtube.com/channel/${teacher.channelId}`;
  if(!base)return [];
  const html=await fetchText(`${base}/playlists`,PLAYLIST_TIMEOUT_MS,"text/html,application/xhtml+xml");
  return parsePlaylists(html,teacher);
}
async function runPool(items,worker,limit){
  const results=new Array(items.length);let next=0;
  async function run(){while(next<items.length){const i=next++;results[i]=await worker(items[i],i);}}
  await Promise.all(Array.from({length:Math.min(limit,items.length)},()=>run()));return results;
}

const feed=JSON.parse(await readFile(FEED_PATH,"utf8"));
if(!feed||typeof feed!=="object"||!feed.teachers||typeof feed.teachers!=="object")throw new Error("Hocalar v2 akışı geçersiz");
const catalog=parseCatalog(await readFile(CURATED_CATALOG,"utf8"));
const catalogNames=[...catalog.keys()];
const missing=catalogNames.filter(name=>!KNOWN_CHANNELS[name]);
if(missing.length)throw new Error(`Doğrulanmış kanal kaynağı olmayan yerleşik hocalar: ${missing.join(", ")}`);
const entries=catalogNames.map(name=>[name,KNOWN_CHANNELS[name]]);
const now=new Date().toISOString();
let freshCount=0,fallbackCount=0,playlistCount=0,resolvedCount=0;

const rows=await runPool(entries,async([name,known])=>{
  const old=feed.teachers[name]&&typeof feed.teachers[name]==="object"?feed.teachers[name]:{};
  const meta=catalog.get(name)||{};
  let teacher={name,...known};let resolveError="";
  try{teacher={name,...await resolveChannel(name,known)};if(!known.channelId)resolvedCount++;}
  catch(error){resolveError=error instanceof Error?error.message:String(error);}
  const seed=curatedVideos(name,teacher);
  let rss=[],refreshedAt=old.refreshedAt||null;
  if(!teacher.searchOnly){
    try{rss=await fetchChannelPreview(teacher);if(rss.length||seed.length){refreshedAt=now;freshCount++;}}
    catch(error){fallbackCount++;console.warn(`[teachers-v2-fast] ${name}: RSS alınamadı; tam yenileme/eski veri korunuyor (${error instanceof Error?error.message:String(error)})`);}
  }else if(seed.length||Array.isArray(old.videos)&&old.videos.length){freshCount++;refreshedAt=old.refreshedAt||now;}
  const videos=mergeVideos(seed,Array.isArray(old.videos)?old.videos:[],rss);
  let playlists=Array.isArray(old.playlists)?old.playlists:[];
  if(!teacher.searchOnly){
    try{const freshPlaylists=await fetchChannelPlaylists(teacher);if(freshPlaylists.length){playlists=freshPlaylists;playlistCount+=freshPlaylists.length;}}
    catch(error){console.warn(`[teachers-v2-fast] ${name}: playlist alınamadı; tam yenilemede bulunan seri listesi korunuyor (${error instanceof Error?error.message:String(error)})`);}
  }
  const subjects=Array.isArray(meta.subjects)?meta.subjects:(Array.isArray(old.subjects)?old.subjects:[]);
  const subject=meta.subject||old.subject||(subjects.length===1?subjects[0]:"YKS");
  const url=teacher.channelId?`https://www.youtube.com/channel/${teacher.channelId}`:sourceChannelUrl(teacher);
  console.log(`[teachers-v2-fast] ${name}: ${videos.length} ilgili video · ${playlists.length} kamp/seri${teacher.searchOnly?" · odaklı arama":""}${teacher.channelId?" · kanal doğrulandı":""}${resolveError?` · ${resolveError}`:""}`);
  return [name,{...old,name,subject,subjects,channelName:teacher.channelName||name,channelId:teacher.channelId||old.channelId||"",channelUrl:url||old.channelUrl||"",channelHandle:teacher.channelHandle||old.channelHandle||"",channelSource:teacher.searchOnly?"verified-shared-search":(teacher.channelId?"verified":"verified-handle"),searchOnly:!!teacher.searchOnly,queryHint:teacher.queryHint||old.queryHint||"",focusTerms:Array.isArray(teacher.focusTerms)?teacher.focusTerms:(Array.isArray(old.focusTerms)?old.focusTerms:[]),refreshedAt,videoCount:Math.max(Number(old.videoCount||0),videos.length),playlistCount:Math.max(Number(old.playlistCount||0),playlists.length),videos,playlists}];
},CONCURRENCY);

const nextTeachers={};for(const [name,row] of rows)nextTeachers[name]=row;
feed.teachers=nextTeachers;feed.version=Math.max(6,Number(feed.version||0));feed.generatedAt=now;feed.source="github-pages-curated-yks-rss-deep-preserve";feed.teacherCount=Object.keys(feed.teachers).length;feed.successCount=Object.values(feed.teachers).filter(row=>Array.isArray(row?.videos)&&row.videos.length>0).length;feed.playlistTeacherCount=Object.values(feed.teachers).filter(row=>Array.isArray(row?.playlists)&&row.playlists.length>0).length;
await writeFile(FEED_PATH,`${JSON.stringify(feed,null,2)}\n`,"utf8");
console.log(`[teachers-v2-fast] küratörlü akış hazır · ${freshCount} güncel · ${resolvedCount} handle çözüldü · ${feed.successCount}/${feed.teacherCount} videolu · ${feed.playlistTeacherCount}/${feed.teacherCount} playlistli · ${playlistCount} yeni seri · ${fallbackCount} RSS fallback`);
