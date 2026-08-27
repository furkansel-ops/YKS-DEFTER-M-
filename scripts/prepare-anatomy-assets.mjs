import {readFile, mkdir, writeFile, rename, copyFile} from "node:fs/promises";
import {createHash} from "node:crypto";
import {resolve, dirname} from "node:path";
import {fileURLToPath} from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const manifest = JSON.parse(await readFile(resolve(root, "scripts/anatomy-assets.json"), "utf8"));
const sourceIndex = process.argv.indexOf("--source");
const localSource = sourceIndex >= 0 ? process.argv[sourceIndex + 1] : null;
if (sourceIndex >= 0 && !localSource) throw new Error("--source için kaynak public klasörü gerekli");
if (!/^[a-f0-9]{40}$/.test(manifest.commit)) throw new Error("Geçersiz anatomi kaynak sürümü");
const digest = bytes => createHash("sha256").update(bytes).digest("hex");
const valid = (bytes, entry) => bytes.length === entry.bytes && digest(bytes) === entry.sha256;

async function prepare(entry) {
  if (!/^(models|images|thumbs)\/[a-z]+\.(glb|webp)$/.test(entry.target) ||
      !/^(models\/[a-z]+\.glb|anatomy\/[a-z]+\/(organ|thumb)\.webp)$/.test(entry.source)) throw new Error("Geçersiz varlık yolu");
  const target = resolve(root, "public/anatomy", entry.target);
  try {if (valid(await readFile(target), entry)) return;} catch {}
  let bytes;
  if (localSource) bytes = await readFile(resolve(localSource, entry.source));
  else {
    const url = `https://raw.githubusercontent.com/thebuggeddev/anatomy/${manifest.commit}/public/${entry.source}`;
    const response = await fetch(url, {signal: AbortSignal.timeout(45000)});
    if (!response.ok) throw new Error(`Anatomi varlığı indirilemedi: ${entry.target} (${response.status})`);
    bytes = Buffer.from(await response.arrayBuffer());
  }
  if (!valid(bytes, entry)) throw new Error(`Anatomi dosyası doğrulanamadı: ${entry.target}`);
  await mkdir(dirname(target), {recursive: true});
  const temporary = target + ".partial";
  await writeFile(temporary, bytes);
  await rename(temporary, target);
}

// Only the release build downloads the pinned assets. The app loads one model
// on explicit demand; none of these 30 MB enter the mandatory PWA core cache.
let index = 0;
await Promise.all(Array.from({length: 3}, async () => {
  while (index < manifest.files.length) await prepare(manifest.files[index++]);
}));
await copyFile(resolve(root, "THIRD_PARTY_ANATOMY.md"), resolve(root, "public/anatomy/ATTRIBUTION.md"));
console.log(`Anatomi varlıkları doğrulandı: ${manifest.files.length} dosya, sabit sürüm + SHA-256`);
