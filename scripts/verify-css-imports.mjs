import {readFile,readdir,stat} from "node:fs/promises";
import {isAbsolute,join,relative,resolve,sep} from "node:path";
import {fileURLToPath,pathToFileURL} from "node:url";

export async function verifyLocalCssImports(directory){
  const root=resolve(directory),rootURL=pathToFileURL(root+sep),files=[];
  async function collect(folder){
    for(const entry of await readdir(folder,{withFileTypes:true})){
      const path=join(folder,entry.name);
      if(entry.isDirectory())await collect(path);
      else if(entry.isFile()&&entry.name.endsWith(".css"))files.push(path);
    }
  }
  await collect(root);
  let imports=0;
  for(const file of files){
    const css=(await readFile(file,"utf8")).replace(/\/\*[\s\S]*?\*\//g,"");
    const pattern=/@import\s+(?:url\(\s*(?:"([^"]+)"|'([^']+)'|([^\s)]+))\s*\)|"([^"]+)"|'([^']+)')/gi;
    for(const match of css.matchAll(pattern)){
      const href=match.slice(1).find(Boolean);
      if(!href||/^(?:[a-z][a-z\d+.-]*:|\/\/|#)/i.test(href))continue;
      const url=href.startsWith("/")?new URL(`.${href}`,rootURL):new URL(href,pathToFileURL(file));
      const target=fileURLToPath(url),targetRelative=relative(root,target);
      if(targetRelative===".."||targetRelative.startsWith(`..${sep}`)||isAbsolute(targetRelative))throw new Error(`CSS import çıktı klasörü dışında: ${relative(root,file)} → ${href}`);
      let exists=false;
      try{exists=(await stat(target)).isFile();}catch{}
      if(!exists)throw new Error(`CSS import dosyası bulunamadı: ${relative(root,file)} → ${href}`);
      imports++;
    }
  }
  return {stylesheets:files.length,imports};
}
