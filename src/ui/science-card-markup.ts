import type {ScienceCard} from "../data/science-cards.ts";
import type {ScienceCardProgress} from "../data/contracts.ts";

export function scienceEscape(value: string): string {
  return value.replace(/[&<>"']/g, char => ({"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"}[char] || char));
}

export function scienceCardMarkup(card: ScienceCard, saved: Readonly<ScienceCardProgress>, concealed: boolean): string {
  const e = scienceEscape, id = e(card.id);
  const status = saved.status === "known" ? "Biliyorum" : saved.status === "review" ? "Tekrar et" : "İşaretsiz";
  return '<article class="science-card" data-card="' + id + '" data-status="' + saved.status + '">' +
    '<div class="science-card-top"><span class="science-icon" aria-hidden="true">' + e(card.icon) + '</span>' +
    '<div class="science-card-meta"><span>' + card.exams.join(" / ") + ' · ' + e(card.topic) + '</span><h3>' + e(card.title) + '</h3></div>' +
    '<button class="science-favorite" type="button" data-action="favorite" data-id="' + id + '" aria-label="' + e(card.title) + ' favorisi" aria-pressed="' + saved.favorite + '">' + (saved.favorite ? "★" : "☆") + '</button></div>' +
    '<span class="science-status">' + status + '</span><p class="science-question">' + e(card.question) + '</p>' +
    '<button class="science-reveal" type="button" data-action="reveal" data-id="' + id + '" aria-expanded="' + !concealed + '" aria-controls="science-answer-' + id + '">' + (concealed ? "Cevabı aç" : "Cevabı gizle") + '</button>' +
    '<div class="science-answer" id="science-answer-' + id + '"' + (concealed ? " hidden" : "") + '>' +
    (concealed ? "" : '<p>' + e(card.answer) + '</p><div class="science-cue">' + e(card.cue) + '</div>' +
      '<div class="science-hint"><b>Sık hata</b><p>' + e(card.mistake) + '</p></div><div class="science-hint"><b>YKS taktiği</b><p>' + e(card.tip) + '</p></div>') +
    '</div><div class="science-grade" role="group" aria-label="' + e(card.title) + ' çalışma durumu">' +
    '<button type="button" data-action="review" data-id="' + id + '" aria-pressed="' + (saved.status === "review") + '"' + (concealed ? ' disabled title="Önce cevabı aç"' : "") + '>↻ Tekrar et</button>' +
    '<button type="button" data-action="known" data-id="' + id + '" aria-pressed="' + (saved.status === "known") + '"' + (concealed ? ' disabled title="Önce cevabı aç"' : "") + '>✓ Biliyorum</button></div></article>';
}
