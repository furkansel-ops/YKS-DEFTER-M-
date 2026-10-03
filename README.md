# YKS Defterim

YKS Defterim is an open-source study companion for students preparing for Türkiye's YKS exam. The project focuses on practical planning, progress tracking, exam analysis, focus tools, and interactive learning utilities for TYT, AYT, and YDT.

The application runs on the web as a PWA and can also be packaged for Android with Capacitor.

## Highlights

- Manual weekly study planning
- TYT / AYT / YDT topic tracking
- Practice-exam analysis and progress views
- Focus and study-session tools
- Offline-friendly PWA behavior
- Local persistence with Dexie
- Optional Firebase synchronization bridge
- Interactive Learning Laboratory
- Biology Atlas with optional 3D anatomy models
- Physics simulations and chemistry visualizations
- Android packaging with Capacitor

For the detailed feature and release notes, see [README-GITHUB.md](README-GITHUB.md), [ROADMAP-v4.4.md](ROADMAP-v4.4.md), and [RELEASE.md](RELEASE.md).

## Tech stack

- JavaScript / TypeScript
- Vite
- Dexie
- Firebase
- Capacitor
- Three.js
- Node.js built-in test runner
- GitHub Actions / GitHub Pages

## Requirements

- Node.js >= 22 and < 25
- npm >= 10 and < 12

The repository includes an `.nvmrc` file for the expected Node.js version.

## Local development

```bash
git clone https://github.com/furkansel-ops/YKS-DEFTER-M-.git
cd YKS-DEFTER-M-
npm ci
npm run dev
```

Vite will print the local development address in the terminal.

## Verification

Run the standard project checks before opening a pull request:

```bash
npm run check
```

For release-level verification:

```bash
npm run release:check
```

Useful individual commands:

```bash
npm run typecheck
npm test
npm run build
npm run infra:check
```

## Android

The Android project is managed through Capacitor.

```bash
npm run android:sync
npm run android:verify
```

See [RELEASE.md](RELEASE.md) and [PLAY-STORE.md](PLAY-STORE.md) before preparing a store build.

## Repository layout

- `src/` — TypeScript application modules
- `modules/` — lazily loaded application modules
- `tests/` — automated tests
- `scripts/` — build, validation, and release tooling
- `android/` — Capacitor Android project
- `.github/workflows/` — CI, Pages deployment, and Android workflows
- `index.html`, `app.js`, `app.css` — legacy/application shell assets
- `firestore.rules` — Firestore security rules

## Contributing

Contributions are welcome. Please read [CONTRIBUTING.md](CONTRIBUTING.md) before opening an issue or pull request.

Good first contributions include:

- Reproducing and documenting bugs
- Adding or improving tests
- Fixing accessibility issues
- Improving documentation
- Small, well-scoped bug fixes
- Performance or reliability improvements with measurable impact

Please keep pull requests focused. Large refactors should be discussed in an issue first.

## Security

Do not publish credentials, private user data, or exploitable vulnerability details in a public issue. See [SECURITY.md](SECURITY.md).

## Privacy

YKS Defterim contains local study data and optional synchronization features. Changes that affect storage, backup, synchronization, authentication, or privacy should be treated as data-sensitive and tested carefully.

The project also includes dedicated privacy and data-deletion pages in the application.

## License

This project is licensed under the [MIT License](LICENSE).

## Maintainer

Maintained on GitHub by [@furkansel-ops](https://github.com/furkansel-ops).
