import type {AtlasTopic, AtlasScene} from "../data/biology-atlas.ts";

export const atlasEscape = (value: unknown): string => String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]!));
type Point = readonly [number, number];
const SCENE_POINTS: Partial<Record<AtlasScene, readonly Point[]>> = {
  neuron:[[78,205],[195,205],[360,205],[510,205]],
  muscle:[[200,125],[370,260],[85,290],[465,75]],
  dna:[[120,105],[120,285],[295,205],[470,205]],
  chloroplast:[[100,72],[215,210],[415,210],[475,345]],
  mitochondria:[[82,90],[240,300],[365,245],[485,150]],
  nephron:[[110,105],[265,110],[310,305],[490,245],[470,65]],
  alveoli:[[85,340],[110,90],[285,190],[475,260]],
  plant:[[290,350],[290,230],[420,155],[290,65],[115,140]],
  transport:[[290,355],[235,220],[430,130],[345,225],[450,350]],
  flower:[[90,90],[285,80],[255,270],[410,270],[360,365]],
  population:[[82,72],[95,355],[265,210],[385,195],[480,85]],
  circulation:[[110,285],[125,85],[425,85],[490,280],[295,350]],
  protein:[[85,175],[240,175],[395,175],[515,285]],
  digestion:[[95,70],[120,210],[285,305],[475,165],[490,340]]
};
export function atlasPoints(topic: AtlasTopic): readonly Point[] {
  if (SCENE_POINTS[topic.scene]) return SCENE_POINTS[topic.scene]!;
  return topic.steps.length === 4 ? [[100,95],[475,95],[475,310],[100,310]] : [[90,85],[300,85],[510,85],[465,315],[155,315]];
}
const path = (d: string, color = "var(--atlas-teal)", width = 5, extra = "") => `<path d="${d}" fill="none" stroke="${color}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round" ${extra}/>`;
const ellipse = (cx: number, cy: number, rx: number, ry: number, fill = "var(--atlas-soft)") => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}" stroke="var(--atlas-teal)" stroke-width="3"/>`;
const text = (x: number, y: number, label: string) => `<text x="${x}" y="${y}" text-anchor="middle" class="atlas-svg-caption">${atlasEscape(label)}</text>`;

function backdrop(scene: AtlasScene): string {
  switch (scene) {
    case "neuron": return path("M162 201L103 158L75 104M106 158L61 165M162 208L105 250L58 280M104 250L91 305M167 193L160 113L132 83M160 130L196 90") + ellipse(190,205,52,58) + ellipse(190,205,18,20,"var(--atlas-gold-soft)") + path("M240 205H458M458 205L508 148L539 140M458 205L518 205L544 180M458 205L513 267L543 288") + [270,316,362,408].map(x=>`<rect x="${x}" y="186" width="34" height="38" rx="14" fill="var(--atlas-gold-soft)" stroke="var(--atlas-gold)" stroke-width="2"/>`).join("");
    case "muscle": return path("M85 85V325M515 85V325","var(--atlas-ink)",8) + [120,170,230,280].map(y=>path(`M90 ${y}H285M315 ${y}H510`,"var(--atlas-coral)",7)).join("") + [145,255].map(y=>path(`M230 ${y}H390`,"var(--atlas-teal)",13)+[250,280,310,340,370].map(x=>path(`M${x} ${y}l-9 -13M${x} ${y}l9 13`,"var(--atlas-teal)",3)).join("")).join("") + text(300,375,"Kayan filament modeli · ölçekli değildir");
    case "dna": return [0,335].map((dx,index)=>`<g transform="translate(${dx} 0)">${path("M90 50C175 100 70 150 155 205S70 310 155 365",index?"var(--atlas-gold)":"var(--atlas-teal)",7)}${path("M155 50C70 100 175 150 90 205S175 310 90 365","var(--atlas-coral)",7)}${Array.from({length:12},(_,i)=>path(`M95 ${65+i*25}L150 ${80+i*25}`,"var(--atlas-line)",3)).join("")}</g>`).join("") + text(295,350,"Eski zincir + yeni zincir");
    case "chloroplast": return ellipse(305,210,225,125) + ellipse(305,210,212,112,"none") + [160,230].map(x=>[165,183,201,219,237].map(y=>`<rect x="${x}" y="${y}" width="58" height="13" rx="6" fill="var(--atlas-teal)" opacity=".5"/>`).join("")).join("") + path("M70 40L95 45L79 70L111 62","var(--atlas-gold)",7) + path("M388 157C458 157 465 260 390 265C336 268 330 192 356 176","var(--atlas-coral)",5) + text(395,305,"Karbon bağlama");
    case "mitochondria": return ellipse(340,230,205,118) + path("M195 242C158 146 234 134 242 176S235 265 268 264S265 137 304 151S298 275 336 276S334 155 370 166S372 279 405 277S409 168 445 180S478 275 452 299","var(--atlas-coral)",8) + text(90,45,"Sitoplazma") + text(345,380,"Mitokondri");
    case "nephron": return ellipse(110,110,57,51) + path("M75 109c20 -50 71 -38 67 2s-77 35-65-1s49-33 52-3s-41 27-40 0","var(--atlas-coral)",6) + path("M164 120C195 65 213 158 244 117S289 119 284 173V289Q308 374 333 289V151C374 94 409 183 441 133H493V355","var(--atlas-gold)",11) + path("M473 95H548V330","var(--atlas-coral)",4) + text(360,395,"Tüp sıvısının yolu");
    case "alveoli": return path("M110 42V118Q150 165 220 165","var(--atlas-gold)",13) + [ [270,140],[330,155],[340,215],[280,245],[235,200] ].map(([x,y])=>ellipse(x!,y!,43,43,"var(--atlas-coral-soft)")).join("") + path("M209 87C425 62 451 315 245 315","var(--atlas-teal)",12) + path("M53 358Q95 312 157 350","var(--atlas-coral)",8) + text(452,340,"Kan / gaz alışverişi");
    case "plant": case "transport": return path("M290 75V326M290 326L249 374M290 332L320 386M287 340L210 351M290 342L360 365","var(--atlas-teal)",9) + path("M290 180Q336 95 449 98Q435 198 297 187Z","var(--atlas-teal)",4) + path("M290 238Q220 135 133 156Q154 245 287 251Z","var(--atlas-teal)",4) + path("M295 182L417 126M284 239L170 181","var(--atlas-teal)",3) + (scene==="transport"?path("M268 313V127","var(--atlas-blue)",7)+path("M313 147V322","var(--atlas-coral)",7):"") + text(460,392,scene==="transport"?"Kaynak → havuz":"Kök · gövde · yaprak");
    case "flower": return path("M285 95V190C220 225 216 335 315 338S414 230 320 190V95","var(--atlas-teal)",6) + ellipse(302,78,35,14,"var(--atlas-coral-soft)") + ellipse(294,270,43,52,"var(--atlas-gold-soft)") + path("M110 103Q165 48 259 75","var(--atlas-gold)",4,'stroke-dasharray="7 7"') + path("M291 99V239","var(--atlas-coral)",4) + text(130,165,"Polen tüpünün yolu");
    case "population": return path("M75 55V335H555","var(--atlas-ink)",3) + path("M85 330C197 329 206 313 257 235S339 95 526 96","var(--atlas-teal)",6) + path("M85 330C270 331 285 200 324 48","var(--atlas-coral)",4,'stroke-dasharray="8 6"') + path("M78 96H542","var(--atlas-gold)",2,'stroke-dasharray="7 6"') + text(320,397,"Zaman →") + text(126,30,"Birey sayısı") + text(540,80,"K");
    case "circulation": return ellipse(299,203,73,79,"var(--atlas-coral-soft)") + path("M299 131V278","var(--atlas-line)",3) + text(299,209,"KALP") + text(280,35,"AKCİĞER DEVRESİ") + text(295,409,"VÜCUT DEVRESİ") + path("M195 426H215","var(--atlas-blue)",4) + text(264,431,"O₂ fakir") + path("M333 426H353","var(--atlas-coral)",4) + text(402,431,"O₂ zengin");
    case "digestion": return path("M117 85V161C155 137 186 182 170 220S120 247 126 203","var(--atlas-coral)",9) + path("M224 286C340 221 384 342 224 332S389 266 337 361S191 348 226 285","var(--atlas-gold)",9) + path("M196 363V262Q205 243 225 252H384V362","var(--atlas-teal)",12) + text(360,405,"Besin yolu ve yardımcı salgılar");
    case "protein": return path("M65 115Q91 131 112 113M65 135Q91 151 112 133M65 155Q91 171 112 153","var(--atlas-teal)",5) + path("M180 192Q227 164 276 190T365 190","var(--atlas-coral)",5) + ellipse(394,195,48,35,"var(--atlas-gold-soft)") + [0,1,2,3,4,5].map(i=>`<circle cx="${422+i*16}" cy="${205+i*13}" r="9" fill="var(--atlas-coral)"/>`).join("") + text(293,360,"Bilgi akışı · ökaryot hücre");
    case "biotech": return ellipse(300,202,64,64) + path("M350 160A65 65 0 0 1 350 245","var(--atlas-coral)",12) + text(300,209,"DNA");
    case "atp": return ellipse(300,200,75,75,"var(--atlas-gold-soft)") + text(300,191,"ATP") + text(300,220,"⇄ ADP + Pi");
    case "fermentation": return text(300,175,"PİRÜVAT") + text(300,210,"İki alternatif yol");
    case "chemo": return text(300,180,"Kimyasal enerji") + text(300,214,"→ organik madde");
    case "reproduction": return [0,1,2,3,4,5,6,7].map(i=>`<circle cx="${275+Math.cos(i)*26}" cy="${220+Math.sin(i)*26}" r="15" fill="var(--atlas-coral-soft)" stroke="var(--atlas-coral)"/>`).join("") + text(300,270,"Bölünme → farklılaşma");
    case "senses": return ellipse(300,208,65,48) + text(300,202,"RESEPTÖR") + text(300,226,"→ sinirsel bilgi");
    case "immunity": return text(300,197,"SAVUNMA") + text(300,224,"Doğuştan + özgül");
    case "feedback": return text(300,190,"DENGE") + text(300,222,"Negatif geri bildirim");
    case "community": return text(300,190,"TÜR A ↔ TÜR B") + text(300,225,"+ yarar · − zarar · 0 etkisiz");
    case "environment": return text(300,190,"AZOT DÖNGÜSÜ") + text(300,224,"Madde geri döner");
  }
}

function wrappedLabel(label: string): string[] {
  const words = label.split(" "), rows: string[] = []; let row = "";
  for (const word of words) {if (row && (row+" "+word).length > 23) {rows.push(row);row=word;} else row += (row?" ":"")+word;}
  if (row) rows.push(row); return rows;
}
export function atlasDiagram(topic: AtlasTopic, selected = 0, quiz = false, answer: number | null = null): string {
  const points = atlasPoints(topic), marker = "atlas-arrow-" + topic.id;
  const links = ["muscle","neuron","dna","nephron","alveoli","plant","transport","flower","population","protein","chloroplast","mitochondria","digestion"].includes(topic.scene) ? [] : topic.links;
  const edges = links.map(([from,to,label]) => {
    const [x1,y1] = points[from]!, [x2,y2] = points[to]!;
    const distance = Math.hypot(x2-x1,y2-y1), dx=(x2-x1)/distance,dy=(y2-y1)/distance;
    const color=topic.scene==="circulation"?([1,2].includes(from)?"var(--atlas-coral)":"var(--atlas-blue)"):"var(--atlas-line)";
    return path(`M${x1+dx*31} ${y1+dy*31}L${x2-dx*34} ${y2-dy*34}`,color,3,`marker-end="url(#${marker})"`) + (label && !quiz?text((x1+x2)/2,(y1+y2)/2-10,label):"");
  }).join("");
  const nodes = topic.steps.map(([label],i)=>{
    const [x,y]=points[i]!; const state=answer===i?"answer":!quiz&&selected===i?"selected":"";
    return `<g class="atlas-pin ${state}" role="button" tabindex="0" data-atlas-step="${i}" aria-label="${quiz?"Nokta "+(i+1):atlasEscape(label)}" aria-pressed="${!quiz&&selected===i}"><title>${quiz?"Nokta "+(i+1):atlasEscape(label)}</title><circle cx="${x}" cy="${y}" r="28" fill="transparent"/><circle class="atlas-pin-disc" cx="${x}" cy="${y}" r="18"/><text class="atlas-pin-number" x="${x}" y="${y+5}" text-anchor="middle">${i+1}</text>${!quiz?wrappedLabel(label).map((line,n)=>`<text class="atlas-pin-label" x="${x}" y="${y+38+n*17}" text-anchor="middle">${atlasEscape(line)}</text>`).join(""):""}</g>`;
  }).join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 440" class="atlas-diagram" role="group" aria-label="${atlasEscape(topic.title)} etkileşimli şeması"><defs><marker id="${marker}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10Z" fill="context-stroke"/></marker></defs><g aria-hidden="true">${backdrop(topic.scene)}${edges}</g>${nodes}</svg>`;
}
