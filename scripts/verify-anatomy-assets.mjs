import {readFile} from "node:fs/promises";
import {createHash} from "node:crypto";
import {resolve} from "node:path";

export function inspectAnatomyGlb(bytes) {
  if(bytes.length<20||bytes.toString("ascii",0,4)!=="glTF"||bytes.readUInt32LE(4)!==2||bytes.readUInt32LE(8)!==bytes.length)throw new Error("Geçersiz GLB başlığı");
  const length=bytes.readUInt32LE(12);
  if(bytes.readUInt32LE(16)!==0x4e4f534a||length<2||20+length>bytes.length)throw new Error("Geçersiz GLB JSON bölümü");
  const data=JSON.parse(bytes.toString("utf8",20,20+length).trim());
  if(data.asset?.version!=="2.0"||!data.scenes?.length||!data.meshes?.length)throw new Error("GLB sahnesi eksik");
  if([...(data.buffers||[]),...(data.images||[])].some(item=>item.uri))throw new Error("GLB harici varlık içeriyor");
  const supported=["EXT_meshopt_compression","EXT_texture_webp","KHR_mesh_quantization"];
  if((data.extensionsRequired||[]).some(name=>!supported.includes(name)))throw new Error("Desteklenmeyen GLB uzantısı");
  return data;
}

export async function verifyAnatomyAssets(directory, manifest) {
  if(manifest.files.length!==27)throw new Error("Anatomi varlık sayısı değişti");
  for(const entry of manifest.files){
    if(!/^(models|images|thumbs)\/[a-z]+\.(glb|webp)$/.test(entry.target))throw new Error("Geçersiz anatomi yolu");
    const bytes=await readFile(resolve(directory,entry.target));
    if(bytes.length!==entry.bytes||createHash("sha256").update(bytes).digest("hex")!==entry.sha256)throw new Error("Anatomi varlığı bozuk: "+entry.target);
    if(entry.target.endsWith(".glb"))inspectAnatomyGlb(bytes);
    else if(bytes.toString("ascii",0,4)!=="RIFF"||bytes.toString("ascii",8,12)!=="WEBP")throw new Error("Geçersiz WebP: "+entry.target);
  }
  const attribution=await readFile(resolve(directory,"ATTRIBUTION.md"),"utf8");
  if(!attribution.includes(manifest.commit))throw new Error("Anatomi kaynak bildirimi eksik");
}
