# License scope and third-party materials

**Status: proposed for review; not yet effective on `main`.**

## First-party source

The proposed license for original YKS Defterim application code and documentation authored for this repository is the GNU Affero General Public License, version 3 only (AGPL-3.0-only). The canonical license text is in `LICENSE`.

This scope statement does not override a separate copyright notice, license file, dependency license, or third-party asset notice. It does not grant rights in third-party work that YKS Defterim does not own.

## Anatomy assets are excluded

The 3D anatomy models and WebP organ images described in [THIRD_PARTY_ANATOMY.md](THIRD_PARTY_ANATOMY.md), including files listed in `scripts/anatomy-assets.json`, are **not licensed to downstream users by this project's AGPL grant**. The repository's notice records permission for their use and publication in the YKS Defterim project, but expressly says this is not a general license for third parties to reuse those assets. Attribution is not a substitute for permission.

The build script therefore does not download missing upstream anatomy assets by default. A fork or downstream deployer must either obtain independent permission or provide a separately authorized local asset directory with `--source`. The `--allow-upstream-assets` option is reserved for a maintainer who already has explicit permission to use and publish the assets in the canonical YKS Defterim project. The canonical repository's own deployment workflow uses that option; forks do not.

Without those assets, the first-party 2D SVG anatomy diagrams remain available; the optional 3D models and upstream images are omitted. If the build directory contains only some of the 27 files, the release check fails rather than packaging a partial asset set.

## Upstream-derived code and data

The anatomy notes identify `thebuggeddev/anatomy` and `app/lib/anatomy-data.ts` as an upstream reference for marker positions and the surface-linked marker approach. The scope of any protectable upstream-derived code or data must not be inferred from attribution alone. The maintainer should review the provenance of `src/data/biology-organ-landmarks.ts` before claiming that any upstream-derived portions are covered by AGPL-3.0-only. This draft intentionally does not claim to relicense third-party material.

## Other dependencies

Dependencies such as Three.js, Dexie, Capacitor, Vite, fonts, images, and other third-party resources retain their own applicable licenses and notices. A project-level AGPL notice does not replace those terms.

## Review checklist before merging

- [ ] Confirm the intended AGPL-3.0-only scope for original source and documentation.
- [ ] Review `src/data/biology-organ-landmarks.ts` provenance and any other upstream-derived expression/data.
- [ ] Confirm all bundled fonts, icons, media, dependencies, and source assets have appropriate notices and terms.
- [ ] Confirm the canonical deployment is the only automated workflow opting in to the separately permitted upstream anatomy downloads.
- [ ] Wait for CI on this proposal and review its behavior before merging.

This file is a project-maintenance note, not legal advice. If license scope or authorship is uncertain, do not merge the licensing change until it has been reviewed.
