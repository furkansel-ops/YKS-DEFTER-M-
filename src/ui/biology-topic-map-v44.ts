import type {AtlasTopic} from "../data/biology-atlas.ts";
import {buildAtlasTopicMap} from "../domain/biology-topic-map-service.ts";
import {atlasEscape as esc} from "./biology-atlas-diagrams.ts";
import "./biology-topic-map-v44.css";

export function atlasTopicMapV44(topic:AtlasTopic,currentStep:number):string {
  const plan=buildAtlasTopicMap(topic);
  const nodes=plan.nodes.map(node=>`<button type="button" class="atlas-topic-map-v44__node" data-atlas-step="${node.id}" aria-pressed="${node.id===currentStep}" ${node.id===currentStep?'aria-current="step"':""}><span class="atlas-topic-map-v44__number">${node.id+1}</span><span><b>${esc(node.label)}</b><small>${esc(node.detail)}</small></span></button>`).join("");
  const edges=plan.edges.map(edge=>`<span class="atlas-topic-map-v44__edge" data-explicit="${edge.explicit}"><b>${edge.from+1} → ${edge.to+1}</b><span>${esc(edge.label)}</span></span>`).join("");
  return `<section class="atlas-topic-map-v44" aria-label="${esc(plan.title)} görsel kavram haritası"><header><div><span class="atlas-kicker">AYT GÖRSEL KONU HARİTASI · v4.4</span><h4>Kavramları tek bakışta bağla</h4></div><p>Bir kutuya dokununca aynı konu durağı açılır. Oklar kavram ilişkisini gösterir; her zaman zaman sırası anlamına gelmez.</p></header><div class="atlas-topic-map-v44__nodes">${nodes}</div><div class="atlas-topic-map-v44__relations" aria-label="Kavram bağlantıları">${edges}</div><div class="atlas-topic-map-v44__footer"><article><span>YKS ANA FİKİR</span><p>${esc(plan.anchor)}</p></article><article><span>KARIŞTIRMA NOKTASI</span><p>${esc(plan.trap)}</p></article></div></section>`;
}
