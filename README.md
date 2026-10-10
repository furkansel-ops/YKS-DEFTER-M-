# YKS Defterim

**YKS Defterim** is an independently developed study-planning and progress-tracking app for students preparing for Türkiye's university entrance exams (YKS). It brings daily study plans, focus sessions, mock-exam review and topic progress into one place.

**Canlı uygulama / Live app:** https://furkansel-ops.github.io/YKS-DEFTER-M-/

## Ne yapar?

- **Günlük ve haftalık program:** TYT/AYT/YDT çalışmalarını ve tamamlanan görevleri takip etme.
- **Odak ve Pomodoro:** Çalışma süresini kaydetme, ders bazlı ilerlemeyi görüntüleme.
- **Deneme analizi:** Netleri, doğru/yanlış/boş sayılarını ve gelişimi takip etme.
- **Hata defteri:** Yanlış yapılan soruları ve çalışma notlarını düzenleme.
- **Konu takibi:** Ders ve konu bazında ilerlemeyi izleme.
- **Öğrenme Laboratuvarı:** Paragraf, fen ve diğer YKS odaklı etkileşimli öğrenme araçları.
- **İsteğe bağlı koç bağlantısı (web/PWA):** Öğrencinin belirlediği bilgileri koçuyla paylaşabilmesi ve takip edebilmesi.

> Uygulama bağımsız bir projedir; ÖSYM veya MEB'in resmî uygulaması değildir.

## Our mission

YKS preparation involves multiple subjects, practice exams, study schedules and frequent progress reviews. YKS Defterim aims to reduce that fragmentation, helping learners understand **what to study next, how they spent their time and where they need more practice**.

The current product is a web/PWA application, with an Android/Capacitor project in the repository. This README does not imply that an Android app is currently published in an app store.

### Planned AI direction (not yet released)

We are exploring Claude-powered features such as:

1. Study-plan suggestions grounded in the student's selected goals and available time.
2. Topic-specific revision recommendations based on mock-exam mistakes.
3. Clear weekly study summaries for students and, where they opt in, their coaches.

These are **proposed integrations**, not claims of existing Claude API functionality. Any AI integration should be designed around user consent, privacy and cost controls.

## Teknoloji / Tech stack

- **Web:** Vite, TypeScript, JavaScript
- **Local data:** Dexie / IndexedDB
- **Optional web account and sync:** Firebase
- **Android project:** Capacitor
- **Hosting:** GitHub Pages via GitHub Actions

## Yerel geliştirme / Local development

Requires Node.js 22+ and npm 10+ (see `package.json`).

```bash
npm ci
npm run dev
```

Tests and build:

```bash
npm test
npm run build
```

Some learning-laboratory assets are prepared during the build and may require an internet connection.

## Dokümantasyon / Documentation

- [Ayrıntılı teknik ve sürüm notları](README-GITHUB.md)
- [Güvenilirlik denetimi](RELIABILITY_AUDIT.md)
- [Android / Play Store hazırlığı](PLAY-STORE.md)
- [Gizlilik politikası](privacy.html)

## Project status

**Active development.** The public web app can be explored at the live URL above. Features and interfaces evolve over time; the current app is the source of truth for released functionality.

This is an independently developed education technology project. We welcome constructive feedback and focus on building a useful, reliable product for YKS learners.
