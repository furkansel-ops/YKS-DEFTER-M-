import {organExamFocus, organGuide, type OrganStructure} from "../data/biology-organs.ts";

export interface BiologyYksQuestionFocus {
  organId: string;
  structureId: string;
  label: string;
  priority: "high" | "support";
  core: string;
  questionAngle: string;
  mechanism: string;
  distinction: string;
  route: string;
  disclaimer: string;
}

function questionAngle(part: OrganStructure): string {
  const relation = part.internal ? "görev–konum–işleyiş" : "görev–bağlantı–yön";
  return `${part.label} için ${relation} ilişkisini birlikte kur; benzer yapıların görev ve konum farkını seçeneklerde ayırt etmeye hazır ol.`;
}

/**
 * Read-only YKS study focus generated only from the Atlas' curated structure data.
 * It does not claim a structure appeared in a past exam and never writes study data.
 */
export function buildBiologyYksQuestionFocus(organId: string, structureId: string): BiologyYksQuestionFocus | null {
  const guide = organGuide(organId);
  const focus = organExamFocus(organId);
  if (!guide || !focus) return null;
  const part = guide.structures.find(item => item.id === structureId);
  if (!part) return null;
  return {
    organId,
    structureId,
    label: part.label,
    priority: focus.mustKnow.includes(part.id) ? "high" : "support",
    core: part.summary,
    questionAngle: questionAngle(part),
    mechanism: part.detail,
    distinction: part.exam,
    route: focus.route,
    disclaimer: "Kazanım odaklı çalışma kartıdır; çıkmış soru veya gelecek sınav sorusu iddiası içermez."
  };
}
