# Refined startup and speed reading — 4.4.0-r21

The app opens behind an inline loading guard. The guard is removed only after the
current visual shell, Program DOM, essential screen modules and refined stylesheet
are ready. Slow downloads offer retry; failures never reveal the old screen.
Retry reloads the page without deleting study data.

## File boundaries

- `index.html`: early loading/error/retry view, fixed visual identity, appearance
  controls and the lab reading host.
- `src/main.ts`, `src/ui/refined-shell.ts`: readiness handoff and isolation of
  optional mascot initialization failures.
- `app.js`, `app.css`, `src/ui/refined-blue.css`: retire old palettes/preferences;
  keep the existing study runtime and its data contracts.
- `public/settings-profile-runtime.js`, `src/ui/personalization-v43.ts`: preserve
  font sizing, mascot and study preferences with no legacy theme picker.
- `modules/learning-lab-v3.js`: one tab owner for reading and existing lab tools;
  leaving reading suspends its activity.
- `modules/speed-reading-learn-v1.js`: small compatibility loader.
- `modules/speed-reading/`: reading content, calculation/storage model, interface
  and scoped responsive styles, loaded on demand.
- `sw.js`: r21 cache, guarded-shell validation and offline reading dependencies.
  A failed installation keeps the last working installation. An active r21 worker
  rejects unguarded HTML from network/cache instead of exposing an old layout.
  Activation ends after claiming clients: awaiting navigation from activation can
  deadlock the first install and discard unsaved form input. Updates no longer
  force open tabs to navigate.
- `scripts/verify-dist.mjs`: production checks for the boot contract and all
  reading files; release identity remains separate from the legacy data schema.

## Data and measurement

Reading progress is local to the browser/device. It uses its own storage key and
migrates completed lessons from `yks-speed-reading-learn-v1`. It does not edit the
Program, exam results, error journal, or Firebase payload. Storage errors preserve
the current session in memory and are shown to the student.

Reading time and question time are separate. Pausing or leaving the lab excludes
inactive time. Comprehension is evaluated alongside speed; records require at
least 75% comprehension. Sub-five-second tests are retained in history but excluded
from averages and records. These are product measurement rules, not clinical or
scientific performance thresholds. Reusing familiar texts can affect results.
History is bounded to the latest 1,000 sessions; the interface states that its
records are calculated from retained sessions.

The four sections are Learn, Exercise, Test and Progress. The separately requested
future YKS Paragraph mode is not mixed into the current reading measurement; the
existing Paragraph/Problem tracker remains available.

## Verification

`npm run release:check` passed 665 tests, TypeScript, infrastructure and production
checks. The entry bundle is 259,677 bytes. Isolated Edge runs passed 44 checks:
18 startup/reading/mobile, 5 real PWA/offline and 21 existing mascot/Program flows.
Mobile widths use browser emulation (360, 390 and 412 pixels); no physical Android
device or signed Play Store package was used for these browser checks.

Unit coverage includes boot failure/slow/ready transitions, old theme compatibility,
lab panel exclusivity, storage migration and malformed input, timers, scoring,
calendar windows, comprehension-qualified records and SW installation/cache safety.
The production entry retains the existing 260,000-byte JavaScript budget. Browser
checks use isolated local data and cover refresh, slow/failed imports, mobile layout,
learning persistence, measured tests and offline loading. No real account is used.

An already-installed older worker cannot be rewritten while its device is offline.
The guarded behavior applies after the updated worker has successfully installed;
the next online update migrates its app caches without deleting study data.
