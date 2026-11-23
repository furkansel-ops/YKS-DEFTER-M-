# Haftalık Değerlendirme Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Öğrenci Pazar 18:00 – Pazartesi 23:59 arası Bugün ekranında 3 soruluk haftalık değerlendirme yazar; koç panelindeki "Geçen hafta" kartında görünür.

**Architecture:** Saf hesap `src/domain/weekly-review.ts` (pencere, temizleme, budama) + Bugün kartı `src/ui/weekly-review-v151.ts` (YKSLegacyState üzerinden `S.weeklyReviews`'a yazar; `save()` zaten `yks:data-changed` atıp paylaşımı tetikler). Paylaşım `public/student-coaching-runtime.js` içindeki `sharePayload` → `progress.weeklyReviews`. Koç tarafı `KOÇ PANEL/coach-weekly-v74.js` satırın altına değerlendirme bloğu ekler.

**Tech Stack:** Vite + TS (öğrenci), klasik JS + jsdom testleri (koç), node:test.

**Spec:** `docs/superpowers/specs/2026-11-23-haftalik-degerlendirme-design.md`

## Global Constraints
- Firestore kuralı değişmez; veri yalnız `coachingShares.progress.weeklyReviews` üzerinden gider.
- Cevap başına en fazla 300 karakter; son 8 hafta tutulur; "geç" kaydı `skipped:true` ve paylaşılmaz.
- Hafta anahtarı = değerlendirilen haftanın Pazartesi'si `YYYY-MM-DD` (yerel saat).
- Koç panelinde öğrenci metni `escHtml` (v74'te `esc`) ile yazılır; CSS'te ham renk yok (`--k-*`).
- Sürümler: öğrenci v151, koç v82. `student-coaching-runtime.js` 1.2.39 → 1.2.40 (iç `version` ve testlerdeki sabitler dahil); koç `coach-weekly-v74.js/.css` `?v=` 1.0.0 → 1.1.0.
- Commit/push yalnız kullanıcı onayıyla, iş bitince (adım adım commit yok). Her görevden sonra ilgili repoda `npm test`.

## Review Focus
1. Saat sınırı: Pazar 17:59 kart yok, 18:00 var (bu haftanın Pzt'si), Pazartesi 23:59 var (geçen haftanın Pzt'si), Salı yok — Task 1 testi.
2. Öğrencinin `<script>`/`<b>` yazması: koç kartında kaçışlı görünür — Task 4 testi.
3. Yalnız boşluk yazılan cevaplar boş sayılır; hepsi boşken Gönder çalışmaz — Task 1 (`cleanReview` null) + Task 2 testi.
4. "Bu hafta geç" seçilen hafta koça gitmez ama kart bir daha çıkmaz — Task 1 + Task 3 testi.
5. Eski paylaşımda `weeklyReviews` yok / bozuk: koç kartı "Değerlendirme yazılmadı" der, çökmez — Task 4 testi.

---

### Task 1: Saf hesap (`weekly-review.ts`)

**Files:**
- Create: `src/domain/weekly-review.ts`
- Modify: `src/data/contracts.ts` (state tipine `weeklyReviews?:Record<string,WeeklyReview>`)
- Test: `tests/weekly-review-v151.test.js` (v120 testindeki gibi `spawnSync` + `--experimental-strip-types`)

**Interfaces:**
- Produces:
  - `type WeeklyReview={good:string;hard:string;focus:string;at:number;skipped?:true}`
  - `reviewWeekFor(now:Date):string|null`
  - `cleanReview(input:{good?:unknown;hard?:unknown;focus?:unknown},at:number):WeeklyReview|null`
  - `withReview(map:unknown,week:string,review:WeeklyReview):Record<string,WeeklyReview>` (eklenmiş + en yeni 8 hafta)
  - `REVIEW_MAX=300`

- [ ] **Step 1: Failing test** — `v151 hafta penceresi, temizleme ve 8 hafta budama`:
  - `reviewWeekFor(new Date(2026,10,29,17,59))===null`; `(2026,10,29,18,0)==="2026-11-23"`; `(2026,10,30,23,59)==="2026-11-23"`; `(2026,11,1,9,0)===null`; yıl geçişi `(2027,0,3,20,0)==="2026-12-28"`.
  - `cleanReview({good:"  iyi ",hard:"",focus:"x".repeat(400)},5)` → `{good:"iyi",hard:"",focus:"x"*300,at:5}`; `cleanReview({good:"   ",hard:null},1)===null`.
  - `withReview` 9 haftalık haritaya eklenince en eski düşer, 8 anahtar kalır; bozuk girdi (`null`, dizi) boş harita sayılır.
- [ ] **Step 2:** `node --test tests/weekly-review-v151.test.js` → FAIL (modül yok).
- [ ] **Step 3:** Fonksiyonları yaz; Pazar = `getDay()===0` ve `getHours()>=18` → o günden 6 gün geri; Pazartesi (`getDay()===1`) → 7 gün geri; tarih anahtarı yerel tarih.
- [ ] **Step 4:** Test PASS; `npm test` yeşil.

### Task 2: Bugün kartı (`weekly-review-v151.ts`)

**Files:**
- Create: `src/ui/weekly-review-v151.ts`, `src/ui/weekly-review-v151.css`
- Modify: `src/ui/refined-shell.ts` (`installWeeklyReviewV151()` diğer `install…` çağrılarının yanında, try/catch ile)
- Test: `tests/weekly-review-v151.test.js` (kaynak doğrulamaları)

**Interfaces:**
- Consumes: Task 1 (`reviewWeekFor`, `cleanReview`, `withReview`, `REVIEW_MAX`).
- Produces: `installWeeklyReviewV151():void`; kart kökü `#weeklyReviewV151`, Bugün'de `section.today-fresh-tasks`'ın hemen önüne eklenir.

- [ ] **Step 1: Failing test** — `v151 kart Bugün'e girer, yalnız pencere açıkken ve o hafta cevaplanmamışken görünür`: kaynakta `reviewWeekFor(new Date())`, `.today-fresh-tasks` önüne ekleme, üç `textarea` `maxlength="300"`, başlıklar "Ne iyi gitti?" / "Ne zorladı?" / "Gelecek hafta odak?", düğmeler "Gönder" ve "Bu hafta geç", Gönder `disabled` iken hepsi boş, kaydetmenin `YKSLegacyState.save` ile yapıldığı ve `skipped:true` yazıldığı; `refined-shell.ts` içinde `installWeeklyReviewV151`.
- [ ] **Step 2:** Test FAIL.
- [ ] **Step 3:** Modülü yaz: `state()`/`save()` exam-calendar-v120 desenindeki gibi `window.YKSLegacyState`; gönderince `S.weeklyReviews=withReview(...)`, kartı kaldır, `toast("Değerlendirmen koçuna gönderildi ✓")`; geçince `{good:"",hard:"",focus:"",at,skipped:true}`. `visibilitychange` (görünür olunca) yeniden değerlendir. Stil mevcut Bugün kartlarıyla uyumlu, tema değişkenleri.
- [ ] **Step 4:** Test PASS; `npm test` ve `npm run build` yeşil.

### Task 3: Koça paylaşım

**Files:**
- Modify: `public/student-coaching-runtime.js` (`weeklyReviewsShare(s)` + `sharePayload` içinde `progress.weeklyReviews`), `src/ui/student-account-loader.ts` (`?v=1.2.40`), 1.2.39'u sabitleyen testler.
- Test: `tests/student-coaching.test.js`

**Interfaces:**
- Produces: `progress.weeklyReviews: Array<{week:string;good:string;hard:string;focus:string;at:number}>` — tarihe göre artan, en fazla 8, `skipped` olanlar ve geçersiz anahtarlar yok, metinler 300'e kırpılmış.

- [ ] **Step 1: Failing test** — `v151 haftalık değerlendirme paylaşıma gider; geçilen hafta gitmez`: kaynakta `weeklyReviews:weeklyReviewsShare(s)` progress içinde; fonksiyonda `skipped` elemesi, `slice(-8)`, `text(…,300)`.
- [ ] **Step 2:** FAIL. **Step 3:** Uygula, sürümü 1.2.40'a çek (iç `version` + yükleyici + test sabitleri). **Step 4:** `npm test` yeşil.

### Task 4: Koç "Geçen hafta" kartı

**Files:**
- Modify: `KOÇ PANEL/coach-weekly-v74.js` (`reviewFor(share,weekStart)` + `weeklyHtml` her satırın altına blok), `KOÇ PANEL/coach-weekly-v74.css`, `KOÇ PANEL/index.html` (`?v=1.1.0`)
- Test: `KOÇ PANEL/tests/coach-weekly-v74.test.js`

**Interfaces:**
- Consumes: Task 3'ün `progress.weeklyReviews` biçimi.
- Produces: `reviewFor(share,weekStart):{good,hard,focus}|null`; `weeklyRows` öğelerine `review` alanı; HTML `<div class="coach-v82-review">` (dl: "İyi gitti", "Zorladı", "Odak"; boş cevap satırı gösterilmez) ya da `<p class="coach-v82-review is-empty">Değerlendirme yazılmadı</p>`.

- [ ] **Step 1: Failing test** — `v82 geçen haftanın değerlendirmesi satırın altında, kaçışlı; yoksa "yazılmadı"`: `weeklyHtml` çıktısında `&lt;script&gt;`, üç etiket; `weeklyReviews` yok/bozuk (`"x"`, `[null]`) iken "Değerlendirme yazılmadı"; başka haftanın değerlendirmesi gösterilmez; CSS'te ham renk yok ve `?v=1.1.0`.
- [ ] **Step 2:** FAIL. **Step 3:** Uygula (satır `<button>` olarak kalır, blok onun kardeşi). **Step 4:** Koçta `npm test` yeşil.

### Task 5: Önizleme doğrulaması
- [ ] Öğrenci önizlemesinde (`ogrenci-preview`, Firebase kapalı) saati taklit etmeden `reviewWeekFor` penceresi dışındaysak kartı geçici olarak JS ile göster ve ekran görüntüsü al; gönder/geç akışı yerel kayda yazıyor mu kontrol et.
- [ ] Koç önizlemesinde (`koc-preview`, test koçu) "Geçen hafta" kartının değerlendirmeli ve değerlendirmesiz halini ekran görüntüsüyle göster (veri yalnız sayfada örnek olarak, buluta yazmadan).
- [ ] Kullanıcıdan onay al; onaylanırsa iki repoya ayrı commit (`feat(v151 Haftalık değerlendirme): …`, `feat(v82 Haftalık değerlendirme): …`), fetch+rebase, push, canlı kontrol.
