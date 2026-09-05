# Architecture Mapping — VueUse → reaxuse

A 1:1 mapping of the [VueUse](https://github.com/vueuse/vueuse) monorepo architecture to reaxuse.
The official VueUse repository is referenced as a git submodule at [`source/vueuse`](https://github.com/hairyf/reaxuse/tree/main/source/vueuse)
and serves as the single source of truth for every mapping decision.

**Status legend**

| Mark | Meaning |
|---|---|
| ✅ | mirrored / implemented |
| ⏳ | deferred (explicitly out of scope for now — see [Scope decisions](#scope-decisions)) |
| — | not applicable to reaxuse (VueUse-specific) |

## 1. Packages

VueUse's npm packages live in `packages/*`; reaxuse mirrors the same layout with React-flavored APIs.

| VueUse package | reaxuse package | status |
|---|---|---|
| `@vueuse/shared` | [`@reaxuse/shared`](https://github.com/hairyf/reaxuse/tree/main/packages/shared) | ✅ |
| `@vueuse/core` | [`@reaxuse/core`](https://github.com/hairyf/reaxuse/tree/main/packages/core) | ✅ (3 example hooks) |
| `@vueuse/integrations` | [`@reaxuse/integrations`](https://github.com/hairyf/reaxuse/tree/main/packages/integrations) | ✅ |
| `@vueuse/math` | [`@reaxuse/math`](https://github.com/hairyf/reaxuse/tree/main/packages/math) | ✅ |
| `@vueuse/metadata` | [`@reaxuse/metadata`](https://github.com/hairyf/reaxuse/tree/main/packages/metadata) | ✅ |
| `@vueuse/components` | — | ⏳ deferred |
| `@vueuse/router` | — | ⏳ deferred |
| `@vueuse/rxjs` | — | ⏳ deferred |
| `@vueuse/electron` | — | ⏳ deferred |
| `@vueuse/firebase` | — | ⏳ deferred |
| `@vueuse/nuxt` | — | ⏳ deferred |
| `@vueuse/skills` | — | ⏳ deferred |

Each reaxuse package exposes `src/index.ts` via `exports`, declares `react >= 18` as a peer
dependency, and bundles with tsdown (`"build": "tsdown"` + per-package `tsdown.config.ts`,
see [`packages/core/package.json`](https://github.com/hairyf/reaxuse/blob/main/packages/core/package.json)).

## 2. CI — `.github/`

All of VueUse's CI surface is mirrored in [`../.github`](https://github.com/hairyf/reaxuse/tree/main/.github).

| VueUse file | purpose | reaxuse |
|---|---|---|
| `.github/workflows/ci.yml` | lint + typecheck, test matrix (Node `22.x`, `lts/*`) with Playwright chromium, build — on `push`/`pull_request` to `main`, plus `merge_group` | ✅ |
| `.github/workflows/publish.yml` | publish npm on merge of `release/*` PRs (release cut via `bumpp --pr`) | ✅ |
| `.github/workflows/autofix.yml` | auto-fix bot (autofix.ci) for PRs | ✅ |
| `.github/workflows/export-size.yml` | export-size CI report via `antfu/export-size-action` | ✅ |
| `.github/ISSUE_TEMPLATE/bug_report.yml` | bug report form | ✅ |
| `.github/ISSUE_TEMPLATE/feature_request.yml` | feature request form | ✅ |
| `.github/ISSUE_TEMPLATE/config.yml` | issue template routing | ✅ |
| `.github/PULL_REQUEST_TEMPLATE.md` | PR template | ✅ |
| `.github/FUNDING.yml` | sponsor buttons | ✅ |
| `.github/stale.yml` | stale issue/PR bot | ✅ |
| `.github/agentscan.yml` | GitHub agent scan config | ✅ |

## 3. Scripts — `scripts/`

VueUse's repo automation scripts (run with `tsx`) are all mirrored and working.

| VueUse script | reaxuse | status |
|---|---|---|
| `scripts/clean.ts` | same — removes `dist`/`coverage`/`.turbo` | ✅ |
| `scripts/update.ts` | same — regenerates `meta/functions.md` from package sources | ✅ |
| `scripts/publish.ts` | same — publishes `@reaxuse/*` to npm (`publish:ci`) | ✅ |
| `scripts/changelog.ts` | same — per-function changelog from git history | ✅ |
| `scripts/export-size.ts` | same — gzip size report of built bundles (`size`) | ✅ |
| `scripts/backport.ts` | same — cherry-pick commits to older branches | ✅ |
| `scripts/redirects.ts` | same — Netlify `_redirects` for docs | ✅ |
| `scripts/utils.ts` | same — shared helpers | ✅ |
| `scripts/tsconfig.json` | same | ✅ |

Root `package.json` scripts mirror VueUse's (`typecheck`, `lint`, `build`, `test`, `dev`/`docs`,
`update`, `clean`, `size`, `release`, `publish:ci`, `backport`, `changelog`, `up`).

## 4. Docs site — VitePress + React

VueUse's docs site is a VitePress app inside `packages/`. reaxuse hosts it at
[`docs/`](https://github.com/hairyf/reaxuse/tree/main/docs) with **React demos** mounted via a Vue `DemoContainer` wrapper.

| VueUse docs artifact | reaxuse | status |
|---|---|---|
| VitePress config (`.vitepress/`) | [`docs/.vitepress/config.ts`](https://github.com/hairyf/reaxuse/blob/main/docs/.vitepress/config.ts) | ✅ |
| theme + React support (`.vitepress/theme/`) | `DemoContainer.vue` mounts React demos via `createRoot` | ✅ |
| home page (`packages/index.md`) | [`docs/index.md`](https://github.com/hairyf/reaxuse/blob/main/docs/index.md) (VitePress home layout) | ✅ |
| guide pages (`packages/guide/`) | [`docs/guide/`](https://github.com/hairyf/reaxuse/tree/main/docs/guide/) | ✅ |
| per-function pages | [`docs/core/useToggle.md`](https://github.com/hairyf/reaxuse/blob/main/docs/core/useToggle.md) etc. | ✅ |
| public assets (`packages/public/`) | [`docs/public/`](https://github.com/hairyf/reaxuse/tree/main/docs/public/) | ✅ |
| live demos (Vue SFC) | [`docs/demos/`](https://github.com/hairyf/reaxuse/tree/main/docs/demos/) (React, statically lazy-loaded) | ✅ |
| `functions.md` | [`docs/functions.md`](https://github.com/hairyf/reaxuse/blob/main/docs/functions.md) | ✅ |
| `add-ons.md` / `ecosystem.md` / `team.md` / `guidelines.md` / `export-size.md` / `contributors.ts` | — content pages, added when the site matures | — |
| deploy (`netlify.toml`) | [`netlify.toml`](https://github.com/hairyf/reaxuse/tree/main/netlify.toml) | ✅ |

## 5. Tests — vitest + vitest-browser-react

VueUse's vitest projects (`unit`, `server`, `exports`, `browser`) are mirrored; browser tests use
**vitest-browser-react** (not React Testing Library), running in a real chromium via the Playwright
provider.

| VueUse | reaxuse | status |
|---|---|---|
| `test/exports.test.ts` | same — asserts public exports of every package | ✅ |
| `test/package-json-export.test.ts` | same — asserts `package.json` export maps | ✅ |
| per-function browser tests | `packages/core/src/*.test.tsx` via `vitest-browser-react` | ✅ |
| vitest projects (`unit` browser / `exports` node) | [`vitest.config.ts`](https://github.com/hairyf/reaxuse/blob/main/vitest.config.ts) | ✅ |
| coverage (`test:cov`) | `test:coverage` script | ✅ |

## 6. Playgrounds — `playgrounds/`

| VueUse | reaxuse |
|---|---|
| `playgrounds/vite` (Vite demo playground) | ✅ [`playgrounds/vite`](https://github.com/hairyf/reaxuse/tree/main/playgrounds/vite) |
| `playgrounds/nuxt` | ⏳ deferred with `@reaxuse/nuxt` |

## 7. Patches — `patches/`

| VueUse | reaxuse |
|---|---|
| `patches/google-font-installer@1.2.0.patch` (pnpm patch for the docs font installer) | — not needed (npm workspaces, no font installer) |

## 8. Skills — `skills/`

| VueUse | reaxuse |
|---|---|
| `skills/vueuse-functions` (AI skill that generates functions) | ⏳ deferred with the AI mapping scope |

## 9. Meta — `meta/`

| VueUse | purpose | reaxuse |
|---|---|---|
| `meta/packages.ts` | package definitions | ✅ [`meta/packages.ts`](https://github.com/hairyf/reaxuse/blob/main/meta/packages.ts), re-exported by `@reaxuse/metadata` |
| `meta/ecosystem-functions.ts` | ecosystem functions registry | — not applicable yet |
| `meta/versions.ts` | version info | — not applicable yet |
| — | function mapping table | ✅ [`meta/functions.md`](https://github.com/hairyf/reaxuse/blob/main/meta/functions.md), auto-generated by `npm run update` |

## 10. Root tooling & config files

| VueUse | purpose | reaxuse |
|---|---|---|
| `package.json` + `pnpm-workspace.yaml` + `pnpm-lock.yaml` | monorepo (pnpm) | `package.json` + `package-lock.json` (npm workspaces — [decision](#mapping-decisions)) ✅ |
| `tsconfig.json` | TS config | ✅ |
| `turbo.json` | task orchestration | ✅ |
| `tsdown.config.ts` | package bundling | ✅ (root helper + per-package configs) |
| `vitest.config.ts` | test config | ✅ |
| `eslint.config.js` | linting (flat config) | ✅ |
| `taze.config.ts` | dependency updates | ✅ |
| `netlify.toml` | docs site deploy | ✅ |
| `.editorconfig` | editor style | ✅ |
| `.gitignore` / `.gitattributes` | git hygiene | ✅ |
| `.vscode/` | editor workspace settings | ✅ |
| `unocss.config.ts` | docs styling | — default VitePress theme instead ([decision](#mapping-decisions)) |

## 11. Community & legal

| VueUse | reaxuse |
|---|---|
| `README.md` | ✅ (English) |
| `LICENSE` (MIT) | ✅ (MIT) |
| `CONTRIBUTING.md` | ✅ |
| `CODE_OF_CONDUCT.md` | ✅ |

## Mapping decisions

- **Runtime API mapping (conceptual):** Vue's `ref()`/`reactive()` → React `useState()`; `watch()`/`watchEffect()` → `useEffect()`; `computed()` → `useMemo()`/`useCallback()`; composable teardown → effect cleanup on unmount.
- **Single source of truth:** `source/vueuse` submodule pins the upstream reference; every ported function is checked against it.
- **Docs metadata driven:** function lists are generated from `@reaxuse/metadata` + `meta/packages.ts` (`npm run update`), not hand-maintained — same pipeline as VueUse's `meta/packages.ts`.
- **Test framework:** vitest-browser-react (browser mode) instead of React Testing Library — real-browser hook tests, mirroring VueUse's vitest browser project.
- **Docs + React:** VitePress (Vue-based) with React demos mounted client-side via a `DemoContainer` Vue component; docs styling uses the default theme (no unocss).
- **Package manager:** npm workspaces instead of pnpm (equivalent monorepo layout; scripts are npm-based).
- **Sub-package mirroring deferred:** `components` / `router` / `rxjs` / `electron` / `firebase` / `nuxt` / `skills` are intentionally not created yet (out of scope) — the map above keeps them visible.

## Scope decisions

Explicitly out of scope for now (per project owner), documented here so the map is unambiguous:

1. **Large-scale AI mapping** of all ~200 `@vueuse/core` functions — hook mapping continues incrementally.
2. **`router` / `rxjs` / `electron` / `nuxt` / `firebase` (and `components` / `skills`) sub-packages** — will be created when their mapping begins.
3. **Publishing to npm (`@reaxuse/*`)** — the `publish.yml` workflow and `publish:ci` script exist and are ready, but no releases are cut yet.
