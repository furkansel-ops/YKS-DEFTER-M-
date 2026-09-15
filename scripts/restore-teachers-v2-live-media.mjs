import {mkdir,rm,writeFile} from "node:fs/promises";
import {dirname,resolve} from "node:path";

const ROOT=resolve(process.cwd());
const PUBLIC=resolve(ROOT,"public");
const FEED_PATH=resolve(PUBLIC,"teachers-v2-feed.json");
const ARCHIVE_ROOT=resolve(PUBLIC,"teachers-v2");
const TIMEOUT_MS=9000;
const CONCURRENCY=8;

function defaultBase(){
  const repository=String(process.env.GITHUB_REPOSITORY||"furkansel-ops/YKS-DEFTER-M-");
  const [owner,repo]=repository.split("/");
  if(!owner||!repo)throw new Error("GitHub repository bilgisi çözülemedi");
  return `https://${owner}.github.io/${repo}/`;
}

const BASE=new URL(process.env.YKS_TEACHERS_MEDIA_BASE||defaultBase());

function safeRelative(value){
  const clean=String(value||"").replace(/^\/+/,"");
  if(!/^teachers-v2\/[a-z0-9-]+\/(?:index|p\d+)\.json$/i.test(clean))throw new Error(`Güvensiz Hocalar medya yolu: ${clean}`);
  if(clean.includes(".."))throw new Error(`Geçersiz Hocalar medya yolu: ${clean}`);
  return clean;
}

async function fetchText(relative){
  const controller=new AbortController();
  const timer=setTimeout(()=>controller.abort(),TIMEOUT_MS);
  try{
    const response=await fetch(new URL(relative,BASE),{signal:controller.signal,cache:"no-store"});
    if(!response.ok)throw new Error(`${relative}: HTTP ${response.status}`);
    return await response.text();
  }finally{clearTimeout(timer);}
}

async function fetchJson(relative){
  const text=await fetchText(relative);
  const parsed=JSON.parse(text);
  if(!parsed||typeof parsed!=="object")throw new Error(`${relative}: geçersiz JSON`);
  return {text,parsed};
}

async function runPool(items,worker,limit){
  const results=new Array(items.length);let next=0;
  async function run(){while(next<items.length){const i=next++;results[i]=await worker(items[i],i);}}
  await Promise.all(Array.from({length:Math.min(limit,items.length)},()=>run()));
  return results;
}

async function restoreArchive(indexPath){
  const safeIndex=safeRelative(indexPath);
  const {text:indexText,parsed:index}=await fetchJson(safeIndex);
  const pages=Array.isArray(index.pages)?index.pages.map(safeRelative):[];
  const downloaded=await runPool(pages,async page=>({page,text:await fetchText(page)}),CONCURRENCY);
  for(const item of downloaded){
    const file=resolve(PUBLIC,item.page);
    await mkdir(dirname(file),{recursive:true});
    await writeFile(file,item.text,"utf8");
  }
  const file=resolve(PUBLIC,safeIndex);
  await mkdir(dirname(file),{recursive:true});
  await writeFile(file,indexText,"utf8");
  return pages.length;
}

const {text:feedText,parsed:feed}=await fetchJson("teachers-v2-feed.json");
if(!feed.teachers||typeof feed.teachers!=="object")throw new Error("Canlı Hocalar feed'i geçersiz");

/* Canlı feed doğrulandıktan sonra eski yerel arşivi temizle. Ağ hatasında script
   bu noktaya gelemez; checkout içindeki güvenli dosyalar yerinde kalır. */
await rm(ARCHIVE_ROOT,{recursive:true,force:true});
await mkdir(dirname(FEED_PATH),{recursive:true});
await writeFile(FEED_PATH,feedText,"utf8");

const archives=[];
for(const row of Object.values(feed.teachers)){
  const indexPath=row&&typeof row==="object"?row.archiveIndex:"";
  if(typeof indexPath==="string"&&indexPath)archives.push(indexPath);
}

let restored=0,pages=0,failed=0;
await runPool([...new Set(archives)],async indexPath=>{
  try{pages+=await restoreArchive(indexPath);restored++;}
  catch(error){failed++;console.warn(`[teachers-v2-restore] ${indexPath}: ${error instanceof Error?error.message:String(error)}`);}
},Math.min(4,CONCURRENCY));

console.log(`[teachers-v2-restore] canlı medya korundu · ${Object.keys(feed.teachers).length} hoca · ${restored} arşiv · ${pages} sayfa · ${failed} eksik`);
