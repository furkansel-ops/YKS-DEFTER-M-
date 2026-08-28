from pathlib import Path
import re
import subprocess


def read(path: str) -> str:
    return Path(path).read_text(encoding="utf-8")


def write(path: str, text: str) -> None:
    Path(path).write_text(text, encoding="utf-8")


def replace_once(path: str, old: str, new: str) -> None:
    text = read(path)
    count = text.count(old)
    if count != 1:
        raise SystemExit(f"{path}: expected 1 occurrence, found {count}: {old[:100]!r}")
    write(path, text.replace(old, new, 1))


# 1) Biology Atlas 2.0: YKS priority layer. The 3D loader itself is untouched.
path = "src/data/biology-organs.ts"
text = read(path)
marker = "\nexport function organGuide(id:string):OrganGuide|undefined {"
focus = r'''
export interface OrganExamFocus {summary:string;route:string;mustKnow:readonly string[];}
export const ORGAN_EXAM_FOCUS:Readonly<Record<OrganId,OrganExamFocus>>={
  heart:{summary:"Kan yönü, karıncık duvar farkı ve kapakların konumunu birlikte bil.",route:"Odacık → kapak → çıkan damar → küçük/büyük dolaşım",mustKnow:["right-ventricle","left-ventricle","tricuspid","mitral","aorta","pulmonary-artery"]},
  brain:{summary:"Beyin bölümlerini görevleriyle eşleştir; özellikle hipotalamus ve omurilik soğanını ayır.",route:"Büyük beyin → ara beyin → beyin sapı → beyincik",mustKnow:["cerebrum","hypothalamus","medulla","cerebellum"]},
  lungs:{summary:"Hava iletim yolu ile gerçek gaz değişim yüzeyini kesin ayır.",route:"Soluk borusu → bronş → bronşçuk → alveol · ventilasyon için diyafram",mustKnow:["bronchus","bronchiole","alveolus","diaphragm"]},
  liver:{summary:"Karaciğerin metabolik görevleri, çift kan girişi ve safra yolunu birlikte öğren.",route:"Bağırsak kanı → kapı toplardamarı → hepatosit · safra → kanal → bağırsak",mustKnow:["hepatocyte","portal-vein","gallbladder","bile-duct"]},
  kidneys:{summary:"Süzülmenin nerede başladığını ve oluşan idrarın çıkış yolunu birbirinden ayır.",route:"Glomerulus → nefron tüpleri → toplama → havuzcuk → üreter",mustKnow:["glomerulus","cortex","medulla","pelvis","ureter"]},
  eyeball:{summary:"Işığı kıran yapılar ile uyarıyı oluşturan retina ve siniri ayrı görevlerle öğren.",route:"Kornea → göz bebeği → mercek → retina → görme siniri",mustKnow:["cornea","lens","retina","blind-spot","optic-nerve"]},
  intestine:{summary:"Villus–mikrovillus ayrımı ile kan ve lenfe geçen besin yollarını netleştir.",route:"Lümen → villus epiteli → kan kılcalı / lenf kılcalı",mustKnow:["small-intestine","villus","blood-capillary","lymph-capillary"]},
  pancreas:{summary:"Pankreasın dış salgı ve iç salgı görevlerini aynı organ içinde ama farklı yollarla düşün.",route:"Asinüs → kanal → bağırsak · alfa/beta hücresi → kan",mustKnow:["acini","duct","alpha-cells","beta-cells"]},
  skin:{summary:"Epidermis–dermis farkı, reseptörler ve sıcaklık düzenleme yapılarını katmanla ilişkilendir.",route:"Epidermis → dermis → deri altı · reseptör/bez/kıl kökü",mustKnow:["epidermis","dermis","sweat-gland","receptor"]}
};
export function organExamFocus(id:string):OrganExamFocus|undefined {
  return Object.prototype.hasOwnProperty.call(ORGAN_EXAM_FOCUS,id)?ORGAN_EXAM_FOCUS[id as OrganId]:undefined;
}
'''
if "ORGAN_EXAM_FOCUS" not in text:
    if marker not in text:
        raise SystemExit("biology-organs focus marker missing")
    write(path, text.replace(marker, "\n" + focus + marker, 1))

path = "src/ui/biology-atlas.ts"
text = read(path)
if "organExamFocus" not in text.splitlines()[1]:
    replace_once(path, 'import {organGuide} from "../data/biology-organs.ts";', 'import {organExamFocus,organGuide} from "../data/biology-organs.ts";')
text = read(path)
if "BİYOLOJİ ATLASI 2.0" not in text:
    old = re.search(r"  function organHeader\(\) \{.*?\n  \}\n  function structureInfo\(\) \{", text, re.S)
    if not old:
        raise SystemExit("organHeader block missing")
    new = r'''  function organHeader() {
    const organ=getAtlasOrgan(organId)!,guide=organGuide(organId)!,focus=organExamFocus(organId)!;
    const labels=guide.structures.filter(part=>focus.mustKnow.includes(part.id)).map(part=>`<span class="atlas-yks-chip">${esc(part.label)}</span>`).join("");
    return `<header class="atlas-lesson-head"><div><span class="atlas-kicker">BİYOLOJİ ATLASI 2.0 · YKS ÖNCELİKLİ 3B</span><h3>${esc(organ.name)}</h3><p>${esc(guide.overview)}</p></div><button type="button" data-atlas-action="topic" data-id="${organ.topic}">Konu anlatımına git ↗</button></header>`+
      `<div class="atlas-yks-focus"><div class="atlas-yks-card"><strong>YKS ODAK</strong><span>${esc(focus.summary)}</span><div class="atlas-yks-list">${labels}</div></div><div class="atlas-yks-card"><strong>ÖĞRENME ROTASI</strong><span>${esc(focus.route)}</span></div></div>`+
      `<div class="atlas-organ-tabs" role="group" aria-label="Organ görünümü"><button type="button" data-atlas-action="organ-view" data-id="model" aria-pressed="${organView==="model"}">Etiketli 3B model</button><button type="button" id="atlasModelOpen" class="atlas-cutaway-button" data-atlas-action="cutaway" aria-pressed="${organView==="model"&&organOpen}">${organView==="model"&&organOpen?"3B iç yapıyı kapat":"3B içini aç · Daha detay"}</button><button type="button" class="atlas-fallback-tab" data-atlas-action="organ-view" data-id="anatomy" aria-pressed="${organView==="anatomy"}">Şema yedeği · 2B</button></div>`;
  }
  function structureInfo() {'''
    text = text[:old.start()] + new + text[old.end():]

    old2 = re.search(r"  function structureInfo\(\) \{.*?\n  \}\n  function syncModelSelection\(\)", text, re.S)
    if not old2:
        raise SystemExit("structureInfo block missing")
    new2 = r'''  function structureInfo() {
    const guide=organGuide(organId)!,focus=organExamFocus(organId)!,part=guide.structures.find(item=>item.id===structureId);
    const priority=part&&focus.mustKnow.includes(part.id)?`<span class="atlas-yks-priority">YKS ÖNCELİKLİ</span>`:"";
    return part?`<span class="atlas-kicker">${guide.structures.indexOf(part)+1} / ${guide.structures.length} · SEÇİLEN 3B YAPI</span>${priority}<h4>${esc(part.label)}</h4><p class="atlas-structure-summary">${esc(part.summary)}</p><p>${esc(part.detail)}</p><div class="atlas-trap"><b>AYT'de karıştırma</b><p>${esc(part.exam)}</p></div>`:`<span class="atlas-kicker">ÖNCE BUNLARI BİL</span><h4>YKS öncelikli yapıları model üzerinde bul</h4><p>${esc(focus.summary)}</p><p>${esc(focus.route)}</p><div class="atlas-trap"><b>İpucu</b><p>Turuncu YKS işaretli yapı düğmelerinden başlayıp sonra diğer yapılara geçebilirsin.</p></div>`;
  }
  function syncModelSelection()'''
    text = text[:old2.start()] + new2 + text[old2.end():]

    old3 = re.search(r"  function structureButtons\(\) \{.*?\n  \}\n  function renderAnatomy", text, re.S)
    if not old3:
        raise SystemExit("structureButtons block missing")
    new3 = r'''  function structureButtons() {
    const guide=organGuide(organId)!,focus=organExamFocus(organId)!;
    return `<div class="atlas-structure-list" role="group" aria-label="Organ yapıları">${guide.structures.map((part,i)=>`<button type="button" class="${focus.mustKnow.includes(part.id)?"is-must-know":""}" data-atlas-structure="${part.id}" aria-pressed="${structureId===part.id&&organView==="anatomy"}"><span>${i+1}</span>${esc(part.label)}</button>`).join("")}</div>`;
  }
  function renderAnatomy'''
    text = text[:old3.start()] + new3 + text[old3.end():]
    write(path, text)

# 2–6) Load the read-only study intelligence UI.
path = "index.html"
text = read(path)
if "study-intelligence-v5.css" not in text:
    if "</head>" not in text:
        raise SystemExit("index head missing")
    text = text.replace("</head>", '  <link rel="stylesheet" href="./modules/study-intelligence-v5.css?v=4.1.0-r1">\n</head>', 1)
anchor = '  <script vite-ignore src="./modules/release-selftest.js?v=4.1.0-r20"></script>'
if "study-intelligence-core.js" not in text:
    if anchor not in text:
        raise SystemExit("release-selftest script anchor missing")
    insertion = '  <script vite-ignore src="./modules/study-intelligence-core.js?v=4.1.0-r1"></script>\n  <script vite-ignore src="./modules/study-intelligence-v5.js?v=4.1.0-r1"></script>\n'
    text = text.replace(anchor, insertion + anchor, 1)
write(path, text)

# Atlas button badge selector.
path = "modules/study-intelligence-v5.css"
text = read(path).replace(".atlas-structure-button.is-must-know::after", ".atlas-structure-list button.is-must-know::after")
write(path, text)

# 7) Remove only proven-unreferenced duplicate legacy modules.
candidates = ["modules/learning-lab-v2.js", "modules/learning-lab-v3.js", "modules/progress-v2.js"]
tracked = [Path(x) for x in subprocess.check_output(["git", "ls-files"], text=True).splitlines()]
for candidate in candidates:
    candidate_path = Path(candidate)
    if not candidate_path.exists():
        continue
    needle = candidate_path.name
    refs = []
    for other in tracked:
        if str(other) == candidate or not other.exists():
            continue
        try:
            source = other.read_text(encoding="utf-8")
        except Exception:
            continue
        if needle in source:
            refs.append(str(other))
    if not refs:
        candidate_path.unlink()

# 8) Release notes describe the reliability contract and ordered upgrades.
path = "RELEASE.md"
text = read(path)
heading = "## Biyoloji Atlası tek sahne 3B güncellemesi · önbellek r31\n"
section = """## Çalışma zekâsı ve Atlas 2.0 güncellemesi

- Biyoloji Atlası 2.0: 9 organ için YKS odak cümlesi, öğrenme rotası ve “YKS öncelikli” yapı işaretleri. Mevcut 3B/2B model sistemi korunur.
- Akıllı Tekrar Merkezi: yanlış, tekrar gecikmesi, güven ve konu durumunu birlikte değerlendirir; yalnız “tekrar etmen gerekiyor” uyarısı verir, programa otomatik görev eklemez.
- Hata Defteri 3.0: farklı günlerde tekrar eden hata kalıpları, hata nedeni dağılımı ve kullanıcıya ait düzeltme notları.
- Deneme Analizi 2.0: aynı deneme türünde önceki sonuç, son 5 ortalaması, dalgalanma, ders bazlı artış/düşüş ve deneme bağlantılı hata sayısı.
- Bugün ekranındaki Çalışma Komuta Merkezi tek bakışta soru, odak, kritik tekrar ve son denemeyi gösterir; “Gizle” düğmesiyle tamamen kapatılabilir.
- Konular ekranı “Öğreniliyor / Pekiştiriliyor / Hazır / Tekrar gerekli” sağlık özetini gösterir; bu etiketler de programı değiştirmez.
- Kullanılmayan özellik temizliği yalnız hiçbir yerden referans edilmeyen eski kopya modülleri hedefler; kayıtlı kullanıcı verisine dokunmaz.
- Yeni çalışma zekâsı çekirdeği salt-okunur çalışır; program alanlarını değiştirmediğini doğrulayan otomatik test, hata/deneme analiz testleri ve Atlas odak sözleşmesi release kontrolüne eklenmiştir.

"""
if "## Çalışma zekâsı ve Atlas 2.0 güncellemesi" not in text:
    if heading not in text:
        raise SystemExit("release heading missing")
    text = text.replace(heading, section + heading, 1)
write(path, text)

print("Ordered study suite patches applied")
