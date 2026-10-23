import {readFile, mkdir, writeFile, rename, copyFile} from "node:fs/promises";
import {createHash} from "node:crypto";
import {resolve, dirname} from "node:path";
import {fileURLToPath} from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const manifest = JSON.parse(await readFile(resolve(root, "scripts/anatomy-assets.json"), "utf8"));
const sourceIndex = process.argv.indexOf("--source");
const localSource = sourceIndex >= 0 ? process.argv[sourceIndex + 1] : null;
const allowUpstreamAssets = process.argv.includes("--allow-upstream-assets");
const skipped = [];
if (sourceIndex >= 0 && !localSource) throw new Error("--source için kaynak public klasörü gerekli");
if (!/^[a-f0-9]{40}$/.test(manifest.commit)) throw new Error("Geçersiz anatomi kaynak sürümü");
const digest = bytes => createHash("sha256").update(bytes).digest("hex");
const valid = (bytes, entry) => bytes.length === entry.bytes && digest(bytes) === entry.sha256;

async function prepare(entry) {
  if (!/^(models|images|thumbs)\/[a-z]+\.(glb|webp)$/.test(entry.target) ||
      !/^(models\/[a-z]+\.glb|anatomy\/[a-z]+\/(organ|thumb)\.webp)$/.test(entry.source)) throw new Error("Geçersiz varlık yolu");
  const target = resolve(root, "public/anatomy", entry.target);
  try {
    const existing = await readFile(target);
    if (valid(existing, entry)) return true;
    throw new Error("Mevcut anatomi dosyası boyut/SHA-256 doğrulamasını geçemedi: " + entry.target);
  } catch (error) {
    if (error?.code !== "ENOENT") throw error;
  }

  let bytes;
  if (localSource) {
    bytes = await readFile(resolve(localSource, entry.source));
  } else if (allowUpstreamAssets) {
    const url = `https://raw.githubusercontent.com/thebuggeddev/anatomy/${manifest.commit}/public/${entry.source}`;
    const response = await fetch(url, {signal: AbortSignal.timeout(45000)});
    if (!response.ok) throw new Error(`Anatomi varlığı indirilemedi: ${entry.target} (${response.status})`);
    bytes = Buffer.from(await response.arrayBuffer());
  } else {
    skipped.push(entry.target);
    return false;
  }

  if (!valid(bytes, entry)) throw new Error(`Anatomi dosyası doğrulanamadı: ${entry.target}`);
  await mkdir(dirname(target), {recursive: true});
  const temporary = target + ".partial";
  await writeFile(temporary, bytes);
  await rename(temporary, target);
  return true;
}

await mkdir(resolve(root, "public/anatomy"), {recursive: true});
let index = 0;
const results = new Array(manifest.files.length);
await Promise.all(Array.from({length: 3}, async () => {
  while (index < manifest.files.length) {
    const current = index++;
    results[current] = await prepare(manifest.files[current]);
  }
}));
await copyFile(resolve(root, "THIRD_PARTY_ANATOMY.md"), resolve(root, "public/anatomy/ATTRIBUTION.md"));

const presentCount = results.filter(Boolean).length;
if (skipped.length) {
  console.warn(`[anatomy-assets] ${skipped.length}/${manifest.files.length} third-party files were not downloaded. This is intentional for builds without independent asset rights. Use --source with an authorized local asset directory, or --allow-upstream-assets only for the canonical YKS Defterim publication covered by existing permission.`);
} else if (presentCount === manifest.files.length) {
  console.log(`Anatomi varlıkları doğrulandı: ${manifest.files.length} dosya, sabit sürüm + SHA-256`);
}
