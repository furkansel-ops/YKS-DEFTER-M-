import {SCIENCE_CARDS, type ScienceSubject} from "../data/science-cards.ts";
import {
  SCIENCE_DEFAULT_FILTERS, EMPTY_SCIENCE_PROGRESS, filterScienceCards, normalizeScienceProgress,
  persistScienceAction, scienceTopics, scienceTotals, type ScienceFilters, type ScienceView, type ScienceAction
} from "../domain/science-card-service.ts";
import {scienceCardMarkup, scienceEscape} from "./science-card-markup.ts";
import "./science-cards.css";

interface ScienceCardsApi {mount(panel: HTMLElement | null): boolean; setSubject(subject: ScienceSubject): void;}
declare global {interface Window {YKSScienceCards?: ScienceCardsApi;}}

export function installScienceCards(): ScienceCardsApi {
  if (window.YKSScienceCards) return window.YKSScienceCards;
  let panel: HTMLElement | null = null, signature = "", practice = false;
  let filters: ScienceFilters = {...SCIENCE_DEFAULT_FILTERS};
  const revealed = new Set<string>(), hidden = new Set<string>(), bound = new WeakSet<HTMLElement>();
  const find = <T extends HTMLElement>(id: string) => panel?.querySelector<T>("#" + id) || null;
  function message(text: string) {
    const target = find("v4ScienceMessage");
    if (target && target.textContent !== text) target.textContent = text;
  }
  function progress() {return normalizeScienceProgress(window.YKSLegacyState?.readState?.()?.lab?.scienceCards);}
  function setSubject(subject: ScienceSubject) {
    filters = {...SCIENCE_DEFAULT_FILTERS, subject};
    revealed.clear(); hidden.clear(); render();
  }
  function render() {
    if (!panel) return;
    const saved = progress(), rows = filterScienceCards(filters, saved), totals = scienceTotals(filters.subject, saved);
    const next = JSON.stringify([filters, practice, [...revealed], [...hidden], saved]);
    if (signature === next) return;
    signature = next;
    for (const [id, value] of [
      ["v4ScienceSearch", filters.query], ["v4ScienceExam", filters.exam], ["v4ScienceView", filters.view]
    ] as const) {
      const control = find<HTMLInputElement | HTMLSelectElement>(id);
      if (control && control.value !== value) control.value = value;
    }
    const topic = find<HTMLSelectElement>("v4ScienceTopic");
    if (topic) {
      const options = '<option value="all">Bütün konular</option>' + scienceTopics(filters.subject, filters.exam).map(name =>
        '<option value="' + scienceEscape(name) + '">' + scienceEscape(name) + '</option>').join("");
      if (topic.dataset.options !== options) {topic.innerHTML = options; topic.dataset.options = options;}
      topic.value = filters.topic;
    }
    for (const [id, subject] of [["v4ScienceBiology", "Biyoloji"], ["v4SciencePhysics", "Fizik"]]) {
      const button = find<HTMLButtonElement>(id!);
      button?.setAttribute("aria-pressed", String(filters.subject === subject));
    }
    const mode = find<HTMLInputElement>("v4SciencePractice"); if (mode) mode.checked = practice;
    const stats = find("v4ScienceStats");
    if (stats) stats.innerHTML = [["Kart", totals.total], ["Biliyorum", totals.known], ["Tekrar et", totals.review], ["Favori", totals.favorites]]
      .map(([label, value]) => '<div><span>' + label + '</span><strong>' + value + '</strong></div>').join("");
    const count = find("v4ScienceResult"); if (count) count.textContent = rows.length + " / " + totals.total + " " + filters.subject.toLocaleLowerCase("tr-TR") + " kartı";
    const meter = find<HTMLProgressElement>("v4ScienceProgress");
    if (meter) {meter.max = totals.total; meter.value = totals.known; meter.setAttribute("aria-label", filters.subject + ": " + totals.known + " / " + totals.total + " kartı biliyorum");}
    const grid = find("v4ScienceCards"); if (!grid) return;
    const focused = document.activeElement instanceof HTMLButtonElement && grid.contains(document.activeElement) ? document.activeElement : null;
    const focusId = focused?.dataset.id, focusAction = focused?.dataset.action;
    const previousIndex = focused ? [...grid.querySelectorAll("[data-card]")].indexOf(focused.closest("[data-card]")!) : -1;
    grid.innerHTML = rows.length ? rows.map(card => scienceCardMarkup(card, saved[card.id] || EMPTY_SCIENCE_PROGRESS,
      practice ? !revealed.has(card.id) : hidden.has(card.id))).join("") :
      '<div class="science-empty"><strong>Bu filtrede kart yok.</strong><p>Aramayı veya seçtiğin filtreleri değiştirebilirsin.</p><button type="button" data-action="reset">Filtreleri temizle</button></div>';
    if (focusId && focusAction) {
      const same = grid.querySelector<HTMLButtonElement>('[data-id="' + focusId + '"][data-action="' + focusAction + '"]');
      const fallback = grid.querySelectorAll<HTMLElement>("[data-card]")[Math.max(0, Math.min(previousIndex, rows.length - 1))]?.querySelector<HTMLButtonElement>("button");
      (same || fallback || grid.querySelector<HTMLButtonElement>("button"))?.focus({preventScroll: true});
    }
  }
  function reset() {
    filters = {...SCIENCE_DEFAULT_FILTERS, subject: filters.subject};
    revealed.clear(); hidden.clear(); render(); message("Filtreler temizlendi; kayıtlı işaretlerin korundu.");
  }
  function onClick(event: Event) {
    const target = event.target instanceof Element ? event.target.closest<HTMLButtonElement>("button[data-action]") : null;
    if (!target || !panel?.contains(target)) return;
    const action = target.dataset.action, id = target.dataset.id;
    if (action === "subject") {setSubject(target.dataset.subject === "Fizik" ? "Fizik" : "Biyoloji"); return;}
    if (action === "reset") {reset(); return;}
    if (action === "cover") {revealed.clear(); hidden.clear(); practice = true; render(); message("Cevaplar gizlendi. Önce kendin hatırlamayı dene."); return;}
    if (!id || !SCIENCE_CARDS.some(card => card.id === id)) return;
    if (action === "reveal") {
      const list = practice ? revealed : hidden;
      if (list.has(id)) list.delete(id); else list.add(id);
      render(); return;
    }
    if (action !== "favorite" && action !== "review" && action !== "known") return;
    const adapter = window.YKSLegacyState;
    if (!adapter?.readState || !adapter.save) {message("Kayıt sistemi hazır değil; sayfayı yeniden açıp deneyebilirsin."); return;}
    const old = progress()[id] || EMPTY_SCIENCE_PROGRESS;
    const update: ScienceAction = action === "favorite" ? {kind: "favorite"} :
      {kind: "status" as const, status: old.status === action ? "new" as const : action};
    const ok = persistScienceAction({readState: adapter.readState, save: adapter.save}, id, update);
    render();
    message(ok ? "Kart işareti kaydedildi." : "Kaydedilemedi; önceki işaret korundu. Depolama alanını kontrol et.");
  }
  function onFilter(event: Event) {
    const target = event.target;
    if (!(target instanceof HTMLInputElement || target instanceof HTMLSelectElement)) return;
    if (target.id === "v4ScienceSearch") filters.query = target.value.slice(0, 160);
    else if (target.id === "v4ScienceExam") {
      filters.exam = target.value === "TYT" || target.value === "AYT" ? target.value : "all"; filters.topic = "all";
    } else if (target.id === "v4ScienceTopic") filters.topic = scienceTopics(filters.subject, filters.exam).includes(target.value) ? target.value : "all";
    else if (target.id === "v4ScienceView") filters.view = (["all", "favorites", "review", "known", "new"].includes(target.value) ? target.value : "all") as ScienceView;
    else if (target.id === "v4SciencePractice" && target instanceof HTMLInputElement) {practice = target.checked; revealed.clear(); hidden.clear();}
    else return;
    render();
  }
  function mount(target: HTMLElement | null): boolean {
    if (!target) return false;
    if (panel !== target || target.dataset.scienceVersion !== "1") {
      panel = target; signature = ""; target.dataset.scienceVersion = "1";
      target.innerHTML = '<header class="science-header"><div><span class="science-eyebrow">FEN TEKRAR ATÖLYESİ</span><h2>Biyoloji / Fizik kartları</h2><p>Kısa soruyla hatırla, cevabı kontrol et, tekrar edeceğin kartları ayır.</p></div>' +
        '<div class="science-subjects" role="group" aria-label="Bilim kartı dersi"><button type="button" id="v4ScienceBiology" data-action="subject" data-subject="Biyoloji">🧬 Biyoloji</button><button type="button" id="v4SciencePhysics" data-action="subject" data-subject="Fizik">⚡ Fizik</button></div></header>' +
        '<div id="v4ScienceStats" class="science-stats"></div><progress id="v4ScienceProgress"></progress>' +
        '<div class="science-filters"><label class="science-search">Kartlarda ara<input id="v4ScienceSearch" type="search" maxlength="160" placeholder="Kalp, kuvvet, DNA…" autocomplete="off"></label>' +
        '<label>Sınav<select id="v4ScienceExam"><option value="all">TYT + AYT</option><option>TYT</option><option>AYT</option></select></label>' +
        '<label>Konu<select id="v4ScienceTopic"></select></label><label>Göster<select id="v4ScienceView"><option value="all">Bütün kartlar</option><option value="favorites">Favoriler</option><option value="review">Tekrar edeceklerim</option><option value="known">Bildiklerim</option><option value="new">İşaretsiz</option></select></label></div>' +
        '<div class="science-tools"><label><input id="v4SciencePractice" type="checkbox"> Kendini sına</label><button type="button" data-action="cover">Cevapları gizle</button><button type="button" data-action="reset">Filtreleri temizle</button><span id="v4ScienceResult" role="status"></span></div>' +
        '<p id="v4ScienceMessage" class="science-message" role="status" aria-live="polite"></p><div id="v4ScienceCards" class="science-deck"></div>' +
        '<p class="science-footnote">Seçili TYT/AYT kavramları için 32 başlangıç kartı. “Biliyorum” kişisel işaretindir; Konular bölümündeki ilerlemeyi değiştirmez. Bu set konu anlatımının yerine geçmez.</p>';
      if (!bound.has(target)) {
        bound.add(target); target.addEventListener("click", onClick);
        target.addEventListener("input", event => {if ((event.target as HTMLElement)?.id === "v4ScienceSearch") onFilter(event);});
        target.addEventListener("change", event => {if ((event.target as HTMLElement)?.id !== "v4ScienceSearch") onFilter(event);});
      }
    }
    render(); return true;
  }
  const api = {mount, setSubject}; window.YKSScienceCards = api;
  window.addEventListener("yks:navigation-after", () => {if (panel && !panel.hidden) render();});
  window.addEventListener("yks:data-primary-ready", () => {if (panel) render();});
  window.addEventListener("focus", () => {if (panel && !panel.hidden) render();});
  return api;
}
