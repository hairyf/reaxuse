# Architecture Mapping — VueUse → reaxuse

A 1:1 mapping of the [VueUse](https://github.com/vueuse/vueuse) monorepo architecture to reaxuse.
The official VueUse repository is referenced as a git submodule at [`source/vueuse`](https://github.com/hairyf/reaxuse/tree/main/source/vueuse)
and serves as the single source of truth for every mapping decision.

**Path consistency rule:** every VueUse file/folder has a reaxuse counterpart at
the **same relative path** (`packages/.vitepress/`, `packages/<pkg>/<fn>/`, `meta/`,
`scripts/`, `playgrounds/`, `skills/`, …). The only systematic deviation is the
package source layout: VueUse uses `packages/<pkg>/<fn>/index.ts` while reaxuse uses
`packages/<pkg>/src/<fn>.ts` (uniform across all packages, kept because the exported
API and docs paths are unaffected).

**Status legend**

| Mark | Meaning                                                                              |
| ---- | ------------------------------------------------------------------------------------ |
| ✅   | mirrored / implemented                                                               |
| ⏳   | deferred (explicitly out of scope for now — see [Scope decisions](#scope-decisions)) |
| —    | not applicable to reaxuse (VueUse-specific)                                          |

## 1. Packages — `packages/`

VueUse's npm packages live in `packages/*`; reaxuse mirrors the same layout with React-flavored APIs.

| VueUse package         | reaxuse package                                                                              | status                                                            |
| ---------------------- | -------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| `@vueuse/shared`       | [`@reaxuse/shared`](https://github.com/hairyf/reaxuse/tree/main/packages/shared)             | ✅ (incl. `useToggle`, `useCounter` — same placement as upstream) |
| `@vueuse/core`         | [`@reaxuse/core`](https://github.com/hairyf/reaxuse/tree/main/packages/core)                 | ✅ (incl. `useNow`)                                               |
| `@vueuse/integrations` | [`@reaxuse/integrations`](https://github.com/hairyf/reaxuse/tree/main/packages/integrations) | ✅                                                                |
| `@vueuse/math`         | [`@reaxuse/math`](https://github.com/hairyf/reaxuse/tree/main/packages/math)                 | ✅                                                                |
| `@vueuse/metadata`     | [`@reaxuse/metadata`](https://github.com/hairyf/reaxuse/tree/main/packages/metadata)         | ✅                                                                |
| `@vueuse/components`   | —                                                                                            | ⏳ deferred                                                       |
| `@vueuse/router`       | —                                                                                            | ⏳ deferred                                                       |
| `@vueuse/rxjs`         | —                                                                                            | ⏳ deferred                                                       |
| `@vueuse/electron`     | —                                                                                            | ⏳ deferred                                                       |
| `@vueuse/firebase`     | —                                                                                            | ⏳ deferred                                                       |
| `@vueuse/nuxt`         | —                                                                                            | ⏳ deferred                                                       |
| `@vueuse/skills`       | —                                                                                            | ⏳ deferred                                                       |

**Source layout** (uniform adaptation, documented once here):

| VueUse                                      | reaxuse                                                   |
| ------------------------------------------- | --------------------------------------------------------- |
| `packages/<pkg>/<fn>/index.ts`              | `packages/<pkg>/src/<fn>.ts`                              |
| `packages/<pkg>/<fn>/index.browser.test.ts` | `packages/<pkg>/src/<fn>.test.tsx` (vitest-browser-react) |
| `packages/<pkg>/index.ts`                   | `packages/<pkg>/src/index.ts` (re-exported via `exports`) |

Each reaxuse package declares `react >= 18` as a peer dependency and bundles with tsdown
(`"build": "tsdown"` + per-package `tsdown.config.ts`).

## 2. Function docs + demos — co-located per function

Mirrors upstream `packages/<pkg>/<fn>/{index.md,demo.vue}` exactly:

| VueUse                                             | reaxuse                                                                                                                   | status |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- | ------ |
| `packages/core/useNow/index.md` + `demo.vue`       | `packages/core/useNow/index.md` + [`demo.tsx`](https://github.com/hairyf/reaxuse/blob/main/packages/core/useNow/demo.tsx) | ✅     |
| `packages/shared/useToggle/index.md` + `demo.vue`  | `packages/shared/useToggle/index.md` + `demo.tsx`                                                                         | ✅     |
| `packages/shared/useCounter/index.md` + `demo.vue` | `packages/shared/useCounter/index.md` + `demo.tsx`                                                                        | ✅     |

## 3. Docs site — `packages/.vitepress/`

The VitePress docs root is **`packages/`** (same as VueUse), with the site config inside
[`packages/.vitepress/`](https://github.com/hairyf/reaxuse/tree/main/packages/.vitepress).

| VueUse                                                                                                    | reaxuse                                                                                                        | status |
| --------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- | ------ |
| `packages/.vitepress/config.ts`                                                                           | [`packages/.vitepress/config.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/.vitepress/config.ts)   | ✅     |
| `packages/.vitepress/shims.d.ts`                                                                          | [`packages/.vitepress/shims.d.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/.vitepress/shims.d.ts) | ✅     |
| `packages/.vitepress/sw.ts` (workbox SW)                                                                  | [`packages/.vitepress/sw.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/.vitepress/sw.ts)           | ✅     |
| `packages/.vitepress/transformHead.ts` (og meta)                                                          | inline `transformHead` in config.ts                                                                            | ✅     |
| `packages/.vitepress/twoslash.ts`                                                                         | — Vue/SFC-specific (no twoslash in React docs)                                                                 | —      |
| `packages/.vitepress/vite.config.ts`                                                                      | PWA plugin wired in `config.ts` `vite.plugins`                                                                 | ✅     |
| `packages/index.md` (home)                                                                                | [`packages/index.md`](https://github.com/hairyf/reaxuse/blob/main/packages/index.md)                           | ✅     |
| `packages/functions.md`                                                                                   | [`packages/functions.md`](https://github.com/hairyf/reaxuse/blob/main/packages/functions.md) (auto-generated)  | ✅     |
| `packages/guide/`                                                                                         | [`packages/guide/`](https://github.com/hairyf/reaxuse/tree/main/packages/guide)                                | ✅     |
| `packages/public/` (static assets)                                                                        | [`packages/public/`](https://github.com/hairyf/reaxuse/tree/main/packages/public)                              | ✅     |
| `add-ons.md` / `ecosystem.md` / `team.md` / `guidelines.md` / `export-size.md` / `why-no-translations.md` | — content pages, added when the site matures                                                                   | ⏳     |

### `packages/.vitepress/plugins/`

All four VitePress plugins are mirrored with identical virtual-module contracts:

| VueUse plugin                                       | reaxuse                                                                                                                                                                                           | status |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| `plugins/changelog.ts` (`/virtual-changelog`)       | [`packages/.vitepress/plugins/changelog.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/.vitepress/plugins/changelog.ts)                                                                | ✅     |
| `plugins/contributors.ts` (`/virtual-contributors`) | [`packages/.vitepress/plugins/contributors.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/.vitepress/plugins/contributors.ts)                                                          | ✅     |
| `plugins/pwa-virtual.ts` (`virtual:pwa`)            | [`packages/.vitepress/plugins/pwa-virtual.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/.vitepress/plugins/pwa-virtual.ts)                                                            | ✅     |
| `plugins/markdownTransform.ts`                      | [`packages/.vitepress/plugins/markdownTransform.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/.vitepress/plugins/markdownTransform.ts) (linkify only; Vue/twoslash injection omitted) | ✅     |

Data sources mirror upstream: changelog/contributors derive from `git log` of the
mapped files; `markdownTransform` links backticked function names from the
`@reaxuse/metadata` function registry; `pwa-virtual` feeds the route list to `sw.ts`.

### `packages/.vitepress/theme/`

| VueUse                                                                        | reaxuse                                                                                                                                  | status |
| ----------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| `theme/index.ts` (extends DefaultTheme)                                       | [`theme/index.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/.vitepress/theme/index.ts)                                       | ✅     |
| `theme/styles/{main,vars,overrides,utils,demo}.css`                           | same five files in [`theme/styles/`](https://github.com/hairyf/reaxuse/tree/main/packages/.vitepress/theme/styles)                       | ✅     |
| `theme/components/DemoContainer.vue`                                          | same — mounts React demos via `createRoot`                                                                                               | ✅     |
| `theme/components/Note.vue`                                                   | [`theme/components/Note.vue`](https://github.com/hairyf/reaxuse/blob/main/packages/.vitepress/theme/components/Note.vue)                 | ✅     |
| `theme/components/Contributors.vue`                                           | [`theme/components/Contributors.vue`](https://github.com/hairyf/reaxuse/blob/main/packages/.vitepress/theme/components/Contributors.vue) | ✅     |
| `theme/components/ReloadPrompt.vue`                                           | [`theme/components/ReloadPrompt.vue`](https://github.com/hairyf/reaxuse/blob/main/packages/.vitepress/theme/components/ReloadPrompt.vue) | ✅     |
| `theme/redirects.ts` (fn-name short links)                                    | — handled by VitePress `_redirects` (scripts/redirects.ts)                                                                               | —      |
| `theme/sponsors.data.ts`, `Home*`/`Team*`/`Changelog*`/`Function*` components | — VueUse-specific marketing/team surfaces                                                                                                | ⏳     |
| `theme/composables/{dark,versions}.ts`                                        | — default theme handles dark mode; version shown via `meta/versions.ts`                                                                  | —      |

## 4. Meta — `meta/`

| VueUse                                                  | purpose                              | reaxuse                                                                                                                                | status |
| ------------------------------------------------------- | ------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| `meta/packages.ts`                                      | package definitions                  | [`meta/packages.ts`](https://github.com/hairyf/reaxuse/blob/main/meta/packages.ts), re-exported by `@reaxuse/metadata`                 | ✅     |
| `meta/versions.ts`                                      | version info                         | [`meta/versions.ts`](https://github.com/hairyf/reaxuse/blob/main/meta/versions.ts)                                                     | ✅     |
| `meta/ecosystem-functions.ts`                           | ecosystem registry                   | — Vue-specific                                                                                                                         | —      |
| —                                                       | mapping status table (reaxuse extra) | [`meta/functions.md`](https://github.com/hairyf/reaxuse/blob/main/meta/functions.md), auto-generated                                   | ✅     |
| `packages/metadata/metadata.ts` (generated fn registry) | function registry                    | [`packages/metadata/src/functions.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/metadata/src/functions.ts), auto-generated | ✅     |

## 5. CI — `.github/`

All of VueUse's CI surface is mirrored in [`../.github`](https://github.com/hairyf/reaxuse/tree/main/.github).

| VueUse file                                  | purpose                                                                                                                                       | reaxuse |
| -------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| `.github/workflows/ci.yml`                   | lint + typecheck, test matrix (Node `22.x`, `lts/*`) with Playwright chromium, build — on `push`/`pull_request` to `main`, plus `merge_group` | ✅      |
| `.github/workflows/publish.yml`              | publish npm on merge of `release/*` PRs (release cut via `bumpp --pr`)                                                                        | ✅      |
| `.github/workflows/autofix.yml`              | auto-fix bot (autofix.ci) for PRs                                                                                                             | ✅      |
| `.github/workflows/export-size.yml`          | export-size CI report via `antfu/export-size-action`                                                                                          | ✅      |
| `.github/ISSUE_TEMPLATE/bug_report.yml`      | bug report form                                                                                                                               | ✅      |
| `.github/ISSUE_TEMPLATE/feature_request.yml` | feature request form                                                                                                                          | ✅      |
| `.github/ISSUE_TEMPLATE/config.yml`          | issue template routing                                                                                                                        | ✅      |
| `.github/PULL_REQUEST_TEMPLATE.md`           | PR template                                                                                                                                   | ✅      |
| `.github/FUNDING.yml`                        | sponsor buttons                                                                                                                               | ✅      |
| `.github/stale.yml`                          | stale issue/PR bot                                                                                                                            | ✅      |
| `.github/agentscan.yml`                      | GitHub agent scan config                                                                                                                      | ✅      |

## 6. Scripts — `scripts/`

VueUse's repo automation scripts (run with `tsx`) are all mirrored and working.

| VueUse script                                | reaxuse                                                                                               | status |
| -------------------------------------------- | ----------------------------------------------------------------------------------------------------- | ------ |
| `scripts/clean.ts`                           | same — removes `dist`/`coverage`/`.turbo`                                                             | ✅     |
| `scripts/update.ts`                          | same — regenerates `meta/functions.md`, `packages/functions.md`, `packages/metadata/src/functions.ts` | ✅     |
| `scripts/publish.ts`                         | same — publishes `@reaxuse/*` to npm (`publish:ci`)                                                   | ✅     |
| `scripts/changelog.ts`                       | same — per-function changelog from git history                                                        | ✅     |
| `scripts/export-size.ts`                     | same — gzip size report of built bundles (`size`)                                                     | ✅     |
| `scripts/backport.ts`                        | same — cherry-pick commits to older branches                                                          | ✅     |
| `scripts/redirects.ts`                       | same — Netlify `_redirects` for docs                                                                  | ✅     |
| `scripts/utils.ts` / `scripts/tsconfig.json` | same                                                                                                  | ✅     |

Root `package.json` scripts mirror VueUse's (`typecheck`, `lint`, `build`, `test`, `dev`/`docs`,
`update`, `clean`, `size`, `release`, `publish:ci`, `backport`, `changelog`, `up`); the docs
commands run VitePress with **`packages`** as the docs root.

## 7. Tests — vitest + vitest-browser-react

VueUse's vitest projects (`unit`, `server`, `exports`, `browser`) are mirrored; browser tests use
**vitest-browser-react** (not React Testing Library), running in a real chromium via the Playwright
provider.

| VueUse                                            | reaxuse                                                                            | status |
| ------------------------------------------------- | ---------------------------------------------------------------------------------- | ------ |
| `test/exports.test.ts`                            | same — asserts public exports of every package                                     | ✅     |
| `test/package-json-export.test.ts`                | same — asserts `package.json` export maps                                          | ✅     |
| per-function browser tests                        | `packages/*/src/*.test.tsx` via `vitest-browser-react`                             | ✅     |
| vitest projects (`unit` browser / `exports` node) | [`vitest.config.ts`](https://github.com/hairyf/reaxuse/blob/main/vitest.config.ts) | ✅     |
| coverage (`test:cov`)                             | `test:coverage` script                                                             | ✅     |

## 8. Playgrounds — `playgrounds/`

| VueUse                                    | reaxuse                                                                                                                                           |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `playgrounds/vite` (Vite demo playground) | ✅ [`playgrounds/vite`](https://github.com/hairyf/reaxuse/tree/main/playgrounds/vite) (React + Vite)                                              |
| `playgrounds/nuxt`                        | ✅ [`playgrounds/next`](https://github.com/hairyf/reaxuse/tree/main/playgrounds/next) (React + Next.js — the React analog of the Nuxt playground) |
| `playgrounds/build.sh`                    | ✅ [`playgrounds/build.sh`](https://github.com/hairyf/reaxuse/blob/main/playgrounds/build.sh) (npm-based)                                         |

## 9. Patches — `patches/`

| VueUse                                                                               | reaxuse                                          |
| ------------------------------------------------------------------------------------ | ------------------------------------------------ |
| `patches/google-font-installer@1.2.0.patch` (pnpm patch for the docs font installer) | — not needed (npm workspaces, no font installer) |

## 10. Skills — `skills/`

| VueUse                                                    | reaxuse                                                                                                                                                                                                                 | status                      |
| --------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------- |
| `skills/vueuse-functions/SKILL.md` + `references/<fn>.md` | [`skills/reaxuse-functions/SKILL.md`](https://github.com/hairyf/reaxuse/blob/main/skills/reaxuse-functions/SKILL.md) + [`references/`](https://github.com/hairyf/reaxuse/tree/main/skills/reaxuse-functions/references) | ✅ (hand-maintained subset) |
| `packages/skills/build.ts` (auto-generates the skill)     | — regenerator script                                                                                                                                                                                                    | ⏳ deferred                 |

## 11. Root tooling & config files

| VueUse                                                    | purpose                   | reaxuse                                                                                                       |
| --------------------------------------------------------- | ------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `package.json` + `pnpm-workspace.yaml` + `pnpm-lock.yaml` | monorepo (pnpm)           | `package.json` + `package-lock.json` (npm workspaces — [decision](#mapping-decisions)) ✅                     |
| `tsconfig.json`                                           | TS config                 | ✅                                                                                                            |
| `turbo.json`                                              | task orchestration        | ✅                                                                                                            |
| `tsdown.config.ts`                                        | package bundling          | ✅ (root helper + per-package configs)                                                                        |
| `vitest.config.ts`                                        | test config               | ✅                                                                                                            |
| `eslint.config.js`                                        | linting (flat config)     | ✅ — `@antfu/eslint-config` (same as VueUse)                                                                  |
| `taze.config.ts`                                          | dependency updates        | ✅                                                                                                            |
| `netlify.toml`                                            | docs site deploy          | ✅                                                                                                            |
| `.editorconfig`                                           | editor style              | ✅                                                                                                            |
| `.gitignore` / `.gitattributes`                           | git hygiene               | ✅                                                                                                            |
| `.vscode/`                                                | editor workspace settings | ✅ [`extensions.json`](https://github.com/hairyf/reaxuse/blob/main/.vscode/extensions.json) + `settings.json` |
| `unocss.config.ts`                                        | docs styling              | — default VitePress theme instead ([decision](#mapping-decisions))                                            |

## 12. Community & legal

| VueUse               | reaxuse      |
| -------------------- | ------------ |
| `README.md`          | ✅ (English) |
| `LICENSE` (MIT)      | ✅ (MIT)     |
| `CONTRIBUTING.md`    | ✅           |
| `CODE_OF_CONDUCT.md` | ✅           |

## Mapping decisions

- **Runtime API mapping (conceptual):** Vue's `ref()`/`reactive()` → React `useState()`; `watch()`/`watchEffect()` → `useEffect()`; `computed()` → `useMemo()`/`useCallback()`; composable teardown → effect cleanup on unmount.
- **Single source of truth:** `source/vueuse` submodule pins the upstream reference; every ported function is checked against it (placement too — `useToggle`/`useCounter` live in `@reaxuse/shared` because upstream has them in `@vueuse/shared`).
- **Docs metadata driven:** function lists/registry are generated by `npm run update` (mirroring VueUse's pipeline): `meta/functions.md` (mapping table), `packages/functions.md` (docs page), `packages/metadata/src/functions.ts` (registry).
- **Test framework:** vitest-browser-react (browser mode) instead of React Testing Library — real-browser hook tests, mirroring VueUse's vitest browser project.
- **Docs + React:** VitePress (Vue-based) with React demos mounted client-side via a `DemoContainer` Vue component; docs styling uses the default theme (no unocss).
- **Package manager:** npm workspaces instead of pnpm (equivalent monorepo layout; scripts are npm-based).
- **Linting:** `@antfu/eslint-config` (the exact config VueUse uses), with self-import guards scoped per package.
- **Source layout adaptation:** `packages/<pkg>/src/<fn>.ts` instead of `packages/<pkg>/<fn>/index.ts` — uniform across all packages; docs/demo/tests stay co-located per function at `packages/<pkg>/<fn>/`.
- **Sub-package mirroring deferred:** `components` / `router` / `rxjs` / `electron` / `firebase` / `nuxt` / `skills` are intentionally not created yet (out of scope) — the map above keeps them visible.

## Scope decisions

Explicitly out of scope for now (per project owner), documented here so the map is unambiguous:

1. **Large-scale AI mapping** of all ~200 `@vueuse/core` functions — hook mapping continues incrementally.
2. **`router` / `rxjs` / `electron` / `nuxt` / `firebase` (and `components` / `skills`) sub-packages** — will be created when their mapping begins.
3. **Publishing to npm (`@reaxuse/*`)** — the `publish.yml` workflow and `publish:ci` script exist and are ready, but no releases are cut yet.
