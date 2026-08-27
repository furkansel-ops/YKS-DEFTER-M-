from pathlib import Path


def replace_once(path: str, old: str, new: str) -> None:
    p = Path(path)
    text = p.read_text(encoding="utf-8")
    count = text.count(old)
    if count != 1:
        raise SystemExit(f"{path}: beklenen parça {count} kez bulundu: {old[:70]!r}")
    p.write_text(text.replace(old, new), encoding="utf-8")


path = "tests/biology-atlas.test.js"
replace_once(path,
    'test("Atlas 24 benzersiz konu, 5 grup ve izinli 9 organla tutarlı bağlantılar içerir",async()=>{',
    'test("Atlas 24 benzersiz konu, 5 grup ve izinli 10 organla tutarlı bağlantılar içerir",async()=>{')
replace_once(path,
    'assert.equal(topics.length,24);assert.equal(organs.length,9);assert.equal(groups.length,5);',
    'assert.equal(topics.length,24);assert.equal(organs.length,10);assert.equal(groups.length,5);')
replace_once(path,
    'assert.equal(new Set(organs.map(t=>t.id)).size,9);',
    'assert.equal(new Set(organs.map(t=>t.id)).size,10);')
replace_once(path,
    '    const entry=manifest.files.find(f=>f.target===`models/${organ.id}.glb`);\n    assert.equal(organ.megabytes,(entry.bytes/1e6).toFixed(1).replace(".",","));',
    '    const entry=manifest.files.find(f=>f.target===`models/${organ.id}.glb`);\n    if(organ.id==="ear"){assert.equal(entry,undefined);assert.equal(organ.megabytes,"0,0");continue;}\n    assert.ok(entry,organ.id);assert.equal(organ.megabytes,(entry.bytes/1e6).toFixed(1).replace(".",","));')
replace_once(path,
    'test("9 organın 52 yapısı benzersiz, konumlu ve ayrıntılıdır; beyin sınıflaması açık ayrılır",async()=>{',
    'test("10 organın 60 yapısı benzersiz, konumlu ve ayrıntılıdır; beyin sınıflaması açık ayrılır",async()=>{')
replace_once(path, '  assert.equal(total,52);assert.match(organGuide("brain").connection,', '  assert.equal(total,60);assert.match(organGuide("brain").connection,')
replace_once(path,
    'assert.equal(hidden,["heart","brain"].includes(id)?parts.filter(p=>p.internal).length:0,id);',
    'assert.equal(hidden,["heart","brain","ear"].includes(id)?parts.filter(p=>p.internal).length:0,id);')
replace_once(path,
    'test("Dokuz organın 52 yapısı 3B seçime bağlanır; seçim başına model indirilmez",async()=>{',
    'test("On organın 60 yapısı 3B seçime bağlanır; seçim başına model yükleyicisi yeniden çağrılmaz",async()=>{')
replace_once(path,
    '  assert.equal(downloads,9);h.click("organ-view","model");assert.equal(downloads,9);h.click("organ-view","anatomy");assert.equal(disposed,9);',
    '  assert.equal(downloads,10);h.click("organ-view","model");assert.equal(downloads,10);h.click("organ-view","anatomy");assert.equal(disposed,10);')

# Bu özellik hash'li Vite parçalarıyla dağıtılıyor; PWA çekirdek revizyonunu
# değiştirmek gereksiz ve mevcut kararlı sürüm sözleşmesini bozuyor.
replace_once("sw.js", 'const CACHE="yks-core-v4.1.0-r32";', 'const CACHE="yks-core-v4.1.0-r31";')
replace_once("scripts/verify-dist.mjs", 'yks-core-v4.1.0-r32', 'yks-core-v4.1.0-r31')

print("Kulak atlası test sözleşmeleri güncellendi; PWA cache revizyonu korundu.")
