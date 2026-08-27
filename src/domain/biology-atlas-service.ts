import {ATLAS_TOPICS, ATLAS_ORGANS, type AtlasGroup, type AtlasTopic} from "../data/biology-atlas.ts";

export const atlasText = (value: string) => value.toLocaleLowerCase("tr-TR").normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/ı/g, "i");
export function filterAtlas(query = "", group: AtlasGroup | "all" = "all"): readonly AtlasTopic[] {
  const words = atlasText(query.slice(0, 160)).trim().split(/\s+/).filter(Boolean);
  return ATLAS_TOPICS.filter(topic => (group === "all" || topic.group === group) && words.every(word =>
    atlasText([topic.title, topic.group, topic.intro, ...topic.steps.flat()].join(" ")).includes(word)));
}
export const getAtlasTopic = (id: string) => ATLAS_TOPICS.find(topic => topic.id === id);
export const getAtlasOrgan = (id: string) => ATLAS_ORGANS.find(organ => organ.id === id);
export const atlasStep = (topic: AtlasTopic, step: number) => Number.isInteger(step) && step >= 0 && step < topic.steps.length ? step : 0;
export function answerAtlas(topic: AtlasTopic, picked: number) {
  if (!Number.isInteger(picked) || picked < 0 || picked >= topic.steps.length) return null;
  return {correct: picked === topic.quiz.answer, picked, answer: topic.quiz.answer, explanation: topic.quiz.why};
}
export function atlasAsset(path: string): string {
  // A relative path is intentional: GitHub Pages lives below /YKS-DEFTER-M-/.
  if (!/^(models|images|thumbs)\/[a-z]+\.(glb|webp)$/.test(path)) throw new Error("Geçersiz anatomi varlığı");
  return "./anatomy/" + path;
}

/** Cancels both fetches and late UI results when a specimen/tab changes. */
export class AtlasRequestGate {
  private revision = 0;
  private controller: AbortController | null = null;
  start() {
    this.cancel();
    const revision = this.revision;
    const controller = new AbortController(); this.controller = controller;
    return {signal: controller.signal, current: () => revision === this.revision && !controller.signal.aborted};
  }
  cancel() {this.revision++; this.controller?.abort(); this.controller = null;}
}
