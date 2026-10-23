# Contributing to YKS Defterim

Thank you for considering a contribution.

YKS Defterim is used as a study tool, so reliability, privacy, and predictable behavior matter more than large or flashy changes. Small, well-tested pull requests are preferred.

## Before you start

1. Search existing issues and pull requests.
2. For a bug fix, describe how the problem can be reproduced.
3. For a larger feature or refactor, open an issue first and describe the proposed approach.
4. Keep unrelated changes in separate pull requests.

## Development setup

Requirements:

- Node.js >= 22 and < 25
- npm >= 10 and < 12

Setup:

```bash
git clone https://github.com/furkansel-ops/YKS-DEFTER-M-.git
cd YKS-DEFTER-M-
npm ci
npm run dev
```

## Branches

Use a short descriptive branch name, for example:

```text
fix/program-sync
fix/mobile-navigation
docs/setup-guide
test/backup-regression
feat/topic-filter
```

## Required checks

Before opening a pull request, run:

```bash
npm run check
```

If the change affects release behavior, also run:

```bash
npm run release:check
```

If Android behavior is affected, run the relevant Android verification commands documented in `RELEASE.md`.

## Pull request expectations

A useful pull request should explain:

- What changed
- Why the change is needed
- How it was tested
- Whether user data, synchronization, storage, or authentication are affected
- Screenshots for visible UI changes when useful

Prefer focused PRs. Avoid mixing formatting, refactoring, dependency updates, and feature work unless they are directly related.

## Tests

Bug fixes should include a regression test when practical.

New behavior should be covered by tests at the lowest useful level. Do not remove or weaken tests only to make a change pass.

## Data-sensitive areas

Be especially careful when changing:

- Local storage or Dexie persistence
- Backups and imports
- Firebase synchronization
- Firestore security rules
- Authentication
- Service worker / offline caching
- Program and schedule data

Existing user data must not be silently deleted or reshaped without a migration path.

## Security and secrets

Never commit:

- API keys intended to remain secret
- Service-account credentials
- Signing keys
- Passwords
- Private user data
- Production secrets

See [SECURITY.md](SECURITY.md) for vulnerability reporting guidance.

## AI-assisted contributions

AI tools may be used as development aids, but contributors remain responsible for every submitted line.

Please do not submit unreviewed bulk-generated code or low-value mass changes. Verify the behavior, run the tests, and be prepared to explain the implementation during review.

## Documentation changes

Documentation-only contributions are welcome when they improve accuracy, setup instructions, accessibility, or maintainability.

## Review process

Maintainers may request changes before merging. Please keep discussion technical and focused on the project. A pull request may be closed if it is unsafe, out of scope, untested, or duplicates existing work.
