import {SCIENCE_CARDS, type ScienceExam, type ScienceSubject} from "../data/science-cards.ts";
import type {ScienceCardProgress, ScienceCardStatus, YksStateCandidate} from "../data/contracts.ts";

export type ScienceProgress = Record<string, ScienceCardProgress>;
export type ScienceView = "all" | "favorites" | "review" | "known" | "new";
export interface ScienceFilters {
  subject: ScienceSubject;
  exam: ScienceExam | "all";
  topic: string;
  query: string;
  view: ScienceView;
}
export const SCIENCE_DEFAULT_FILTERS: ScienceFilters = {
  subject: "Biyoloji", exam: "all", topic: "all", query: "", view: "all"
};
export const EMPTY_SCIENCE_PROGRESS: Readonly<ScienceCardProgress> = Object.freeze({
  status: "new", statusAt: 0, favorite: false, favoriteAt: 0
});
const cardIds = new Set(SCIENCE_CARDS.map(card => card.id));
const validId = /^(bio|phy)-[a-z0-9-]{1,60}$/;
const stamp = (value: unknown): number =>
  typeof value === "number" && Number.isSafeInteger(value) && value > 0 && value < Number.MAX_SAFE_INTEGER ? value : 0;
export function isScienceStatus(value: unknown): value is ScienceCardStatus {
  return value === "new" || value === "review" || value === "known";
}
export function normalizeScienceProgress(value: unknown): ScienceProgress {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const result: ScienceProgress = {};
  for (const [id, item] of Object.entries(value).slice(0, 512)) {
    if (!validId.test(id) || !item || typeof item !== "object" || Array.isArray(item)) continue;
    const row = item as Record<string, unknown>;
    result[id] = {
      status: isScienceStatus(row.status) ? row.status : "new",
      statusAt: isScienceStatus(row.status) ? stamp(row.statusAt) : 0,
      favorite: row.favorite === true,
      favoriteAt: typeof row.favorite === "boolean" ? stamp(row.favoriteAt) : 0
    };
  }
  return result;
}
export function scienceSearchKey(value: string): string {
  return value.toLocaleLowerCase("tr-TR").normalize("NFKD").replace(/\p{M}/gu, "").replace(/ı/g, "i").trim();
}
export function scienceTopics(subject: ScienceSubject, exam: ScienceExam | "all" = "all"): string[] {
  return [...new Set(SCIENCE_CARDS.filter(card => card.subject === subject && (exam === "all" || card.exams.includes(exam))).map(card => card.topic))];
}
export function filterScienceCards(filters: ScienceFilters, progress: ScienceProgress) {
  const words = scienceSearchKey(filters.query.slice(0, 160)).split(/\s+/).filter(Boolean);
  return SCIENCE_CARDS.filter(card => {
    const saved = progress[card.id] || EMPTY_SCIENCE_PROGRESS;
    return card.subject === filters.subject &&
      (filters.exam === "all" || card.exams.includes(filters.exam)) &&
      (filters.topic === "all" || card.topic === filters.topic) &&
      (filters.view === "all" || (filters.view === "favorites" ? saved.favorite : saved.status === filters.view)) &&
      words.every(word => scienceSearchKey([card.title, card.topic, card.question, card.answer, card.cue, card.mistake, card.tip].join(" ")).includes(word));
  });
}
export function scienceTotals(subject: ScienceSubject, progress: ScienceProgress) {
  const rows = SCIENCE_CARDS.filter(card => card.subject === subject);
  return {
    total: rows.length,
    known: rows.filter(card => progress[card.id]?.status === "known").length,
    review: rows.filter(card => progress[card.id]?.status === "review").length,
    favorites: rows.filter(card => progress[card.id]?.favorite).length
  };
}
export type ScienceAction = {kind: "favorite"} | {kind: "status"; status: ScienceCardStatus};
export function updateScienceProgress(value: unknown, id: string, action: ScienceAction, now = Date.now()): ScienceProgress | null {
  if (!cardIds.has(id) || (action.kind !== "favorite" && (action.kind !== "status" || !isScienceStatus(action.status)))) return null;
  const progress = normalizeScienceProgress(value);
  const current = progress[id] || EMPTY_SCIENCE_PROGRESS;
  if (action.kind === "favorite") {
    progress[id] = {...current, favorite: !current.favorite, favoriteAt: Math.max(stamp(now), current.favoriteAt + 1)};
  } else {
    progress[id] = {...current, status: action.status, statusAt: Math.max(stamp(now), current.statusAt + 1)};
  }
  return progress;
}

export function persistScienceAction(adapter: {readState(): YksStateCandidate; save(): unknown}, id: string, action: ScienceAction): boolean {
  const state = adapter.readState();
  const oldLab = state.lab, previous = oldLab?.scienceCards;
  const next = updateScienceProgress(previous, id, action);
  if (!next) return false;
  state.lab = oldLab || {paragraphLog: [], elementFav: [], timelineFav: [], topicFav: []};
  state.lab.scienceCards = next;
  try {
    if (adapter.save() === false) throw new Error("Kayıt reddedildi");
    return true;
  } catch {
    if (!oldLab) delete state.lab;
    else if (previous === undefined) delete oldLab.scienceCards;
    else oldLab.scienceCards = previous;
    return false;
  }
}
