# Akşam özeti (v153) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Akşam bildirimi görev sayısını söylesin; "Günü kapat" kartında bitmemiş bütün görevleri tek dokunuşla yarına taşıyan düğme olsun.

**Architecture:** Hepsi `app.js` (klasik betik, globaller). Tek görev taşıma `movePlanCellTomorrow` içindeki hücre taşıma kısmı `planMoveCellCore(c)`'ye çıkarılır; tek görev ve toplu taşıma onu kullanır. Düğme `v25RenderClose` içinde bir kez oluşturulur ve her çizimde gösterilir/gizlenir.

**Tech Stack:** Vanilla JS (app.js), node:test kaynak testleri.

**Spec:** `docs/superpowers/specs/2026-11-24-aksam-ozeti-design.md`

## Global Constraints
- Metin: `Bugün 3/5 görev · 85 soru · 2 sa 10 dk. 2 görev kaldı.` / `Bugün 5/5 görev ✓ · 85 soru · 2 sa 10 dk. Yarının planına bakabilirsin.`; plan boşsa eski metin. Süre `fmtHM`.
- Düğme: `Kalan N görevi yarına taşı`, saat ≥18 ve bitmemiş görev >0 iken görünür. Sonuç: tek `pushUndo("N görev yarına taşındı",…)`, toast `N görev yarına taşındı ✓`.
- `app.js?v=4.1.0-r28` etiketi değişmez (v143 emsali: sw `networkFirstStatic` taze dosyayı alır).
- Yerel önizleme gerçek hesaba yazmaz (localhost'ta Firebase kapalı).

## Review Focus
- Pazar akşamı toplu taşıma → hedefler sonraki haftanın Pazartesisi; yedek iki haftayı da kapsamalı, Geri al ikisini de eski haline getirmeli.
- Yarın aynı satırlar doluysa → görev boş satıra ya da yeni satıra gider, mevcut yarın görevi ezilmez (core aynı kalır).
- Çift dokunuş → ikinci basış hiçbir şey taşımaz (ilk basıştan sonra bitmemiş görev kalmaz; düğme gizlenir).
- Bitmiş görevler ve "gün tamam" işareti → taşınmaz, olduğu yerde kalır.
- 18:00 öncesi → düğme görünmez.

---

### Task 1: Bildirim metni

**Files:** Modify `app.js` (`eveningText`, ~7620). Test: `tests/evening-summary-v153.test.js` (yeni).

- [ ] Test: kaynakta `eveningText` gövdesi `v25PlanToday()` kullanıyor; `"Bugün "+p.done+"/"+p.filled+" görev"`, `" görev kaldı."`, `" görev ✓ · "` ve eski `"Bugünü işaretlemedin. "` dalı var.
- [ ] Çalıştır, düşmeli.
- [ ] `eveningText()`: `p=v25PlanToday()`; `p.filled` 0 ise eski gövde; değilse yukarıdaki iki metin (soru `S.solved[k]||0`, süre `fmtHM(S.pomoMin[k]||0)`).
- [ ] Test geçmeli.

### Task 2: Toplu taşıma ve düğme

**Files:** Modify `app.js` (`movePlanCellTomorrow` ~10823, `v25RenderClose` ~11329). Modify `app.css` (`#home .today-carry`). Test: aynı dosya.

**Interfaces:** Produces `planMoveCellCore(c):void` (c = `planCellData` sonucu; hedef hücreye yazar, kaynağı boşaltır, `mv` işaretini koyar; save/undo/toast yok), `moveUnfinishedTomorrow():number` (taşınan sayı).

- [ ] Test (kaynak): `movePlanCellTomorrow` gövdesi `planMoveCellCore(c)` çağırıyor; `moveUnfinishedTomorrow` `v25PlanToday().items.filter(x=>!x.done)` alır, tek `planWeekBackup([p.wk,…])` ile bugünün ve yarının haftasını yedekler, döngüde `planMoveCellTomorrow` çağırmaz, `pushUndo(n+" görev yarına taşındı"`; `v25RenderClose` içinde `todayCarryBtn`, `h>=18&&left>0`, `"Kalan "+left+" görevi yarına taşı"`.
- [ ] Çalıştır, düşmeli.
- [ ] Uygula; kilit: `planMoveLocks` içinde `"all|"+todayKey()` 900 ms.
- [ ] `npm test` tamamı geçmeli.

### Task 3: Önizlemede doğrulama

- [ ] `npm run build`, `ogrenci-preview`. Konsolda örnek plan (bugün 5 görev, 3 bitmiş) kur, saati 21:00 yap (Date sahtesi), `eveningText()` metnine bak, düğmeye bas: 2 görev yarında, bugün 3 bitmiş görev duruyor; Geri al → eski hali. Pazar senaryosu: hedef sonraki hafta. Ekran görüntüsü, örnek veri temizlenir.
