# Architecture Mapping — VueUse → reaxuse

A 1:1 mapping of the [VueUse](https://github.com/vueuse/vueuse) monorepo architecture to reaxuse.
The official VueUse repository is referenced as a git submodule at [`source/vueuse`](../source/vueuse)
and serves as the single source of truth for every mapping decision.

**Status legend**

| Mark | Meaning |
|---|---|
| ✅ | mirrored / done |
| 🚧 | partial — skeleton or examples only |
| ⏳ | TODO — not started |

## 1. Packages

VueUse's npm packages live in `packages/*`; reaxuse mirrors the same layout with React-flavored APIs.

| VueUse package | reaxuse package | status |
|---|---|---|
| `@vueuse/shared` | [`@reaxuse/shared`](../packages/shared) | 🚧 skeleton |
| `@vueuse/core` | [`@reaxuse/core`](../packages/core) | 🚧 3 example hooks |
| `@vueuse/integrations` | [`@reaxuse/integrations`](../packages/integrations) | 🚧 skeleton |
| `@vueuse/math` | [`@reaxuse/math`](../packages/math) | 🚧 skeleton |
| `@vueuse/metadata` | [`@reaxuse/metadata`](../packages/metadata) | 🚧 skeleton |
| `@vueuse/components` | — | ⏳ TODO |
| `@vueuse/router` | — | ⏳ TODO |
| `@vueuse/rxjs` | — | ⏳ TODO |
| `@vueuse/electron` | — | ⏳ TODO |
| `@vueuse/firebase` | — | ⏳ TODO |
| `@vueuse/nuxt` | — | ⏳ TODO |
| `@vueuse/skills` | — | ⏳ TODO (see §8) |

Each reaxuse package exposes `src/index.ts` via `exports` and declares `react >= 18` as a
peer dependency (see [`packages/core/package.json`](../packages/core/package.json)).

## 2. CI — `.github/`

VueUse's CI lives in `.github/workflows`; reaxuse has **no GitHub workflows yet** — all ⏳ TODO.

| VueUse file | purpose | reaxuse |
|---|---|---|
| `.github/workflows/ci.yml` | lint + test matrix (Node `22.x`, `lts/*`) on `push`/`pull_request` to `main`/`next`, plus `merge_group` | ⏳ |
| `.github/workflows/publish.yml` | publish npm on merge of `release/*` PRs (release cut via `bumpp --pr`) | ⏳ |
| `.github/workflows/autofix.yml` | auto-fix bot for PRs | ⏳ |
| `.github/workflows/export-size_yml` | export-size CI report | ⏳ |
| `.github/ISSUE_TEMPLATE/bug_report.yml` | bug report form | ⏳ |
| `.github/ISSUE_TEMPLATE/feature_request.yml` | feature request form | ⏳ |
| `.github/ISSUE_TEMPLATE/config.yml` | issue template routing | ⏳ |
| `.github/PULL_REQUEST_TEMPLATE.md` | PR template | ⏳ |
| `.github/FUNDING.yml` | sponsor buttons | ⏳ |
| `.github/stale.yml` | stale issue/PR bot | ⏳ |
| `.github/agentscan.yml` | agent scan config | ⏳ |

## 3. Scripts — `scripts/`

VueUse's repo automation scripts (run with `tsx`); reaxuse has none — all ⏳ TODO.

| VueUse script | purpose |
|---|---|
| `scripts/clean.ts` | clean build artifacts |
| `scripts/update.ts` | regenerate function metadata from packages |
| `scripts/publish.ts` | publish packages to npm (used by `publish:ci`) |
| `scripts/changelog.ts` | changelog generation |
| `scripts/export-size.ts` | bundle-size report (`nr size`) |
| `scripts/backport.ts` | backport commits to older branches |
| `scripts/redirects.ts` | docs redirects (`build:redirects`) |
| `scripts/utils.ts` | shared helpers |
| `scripts/tsconfig.json` | tsconfig for scripts |

Root `package.json` scripts to mirror:

| VueUse (`nr …`) | reaxuse (npm) | status |
|---|---|---|
| `typecheck` (`vue-tsc --noEmit`) | `typecheck` (`tsc --noEmit`) | ✅ |
| `lint` (`eslint --cache .`) | — | ⏳ |
| `build` / `build:packages` (`turbo run build`) | `build` (stub, fails) | 🚧 |
| `test` / `test:unit` / `test:all` (vitest projects) | `test` (stub, fails) | 🚧 |
| `dev` / `docs` / `docs:build` (vitepress) | — | ⏳ |
| `update` / `update:full` / `update:skills` | — | ⏳ |
| `release` (`bumpp --pr`) / `publish:ci` | — | ⏳ |
| `clean` | — | ⏳ |
| `size` (export-size) | — | ⏳ |
| `backport` | — | ⏳ |

## 4. Docs site — `packages/*` (VitePress)

VueUse's documentation site is a VitePress app inside `packages/` (`.vitepress/`, `guide/`,
`public/`, per-function `index.md`, plus `functions.md`, `add-ons.md`, `ecosystem.md`,
`guidelines.md`, `team.md`, `export-size.md`, `contributors.ts`/`.json`, `why-no-translations.md`).

reaxuse hosts its docs site at [`docs/`](../docs) — see [`docs/index.md`](index.md).

| VueUse docs artifact | reaxuse | status |
|---|---|---|
| VitePress config (`.vitepress/`) | `docs/.vitepress/` | ⏳ |
| guide pages (`packages/guide/`) | `docs/guide/` | ⏳ |
| home page (`packages/index.md`) | `docs/index.md` | 🚧 stub |
| function pages (`packages/core/*/index.md`) | per-hook pages driven by `@reaxuse/metadata` | ⏳ |
| public assets (`packages/public/`) | `docs/public/` (currently `assets/`) | 🚧 |
| `functions.md` / `add-ons.md` / `ecosystem.md` / `team.md` / `export-size.md` / `guidelines.md` | — | ⏳ |

## 5. Tests — `test/`

| VueUse | purpose | reaxuse |
|---|---|---|
| `test/exports.test.ts` | assert public exports of every package | ⏳ |
| `test/package-json-export.test.ts` | assert `package.json` export maps | ⏳ |
| `test/__snapshots__/` | snapshot outputs | ⏳ |
| per-package unit tests (vitest projects: `unit`, `server`, `exports`, `browser chromium/firefox/webkit`) | — | ⏳ |

Planned reaxuse test stack: **vitest + React Testing Library** (jsdom), mirroring VueUse's
vitest project layout where applicable.

## 6. Playgrounds — `playgrounds/`

| VueUse | reaxuse |
|---|---|
| `playgrounds/vite` (Vite demo playground) | ⏳ TODO |
| `playgrounds/nuxt` (Nuxt integration playground) | ⏳ TODO |

## 7. Patches — `patches/`

| VueUse | reaxuse |
|---|---|
| `patches/google-font-installer@1.2.0.patch` (pnpm patch for the font installer used by docs) | ⏳ TODO |

## 8. Skills — `skills/`

VueUse ships `skills/vueuse-functions` — an AI coding skill that generates new functions.
reaxuse will eventually ship a React-flavored `skills/reaxuse-functions` (and its `@vueuse/skills`
equivalent as `@reaxuse/skills`). ⏳ TODO.

## 9. Meta — `meta/`

| VueUse | purpose | reaxuse |
|---|---|---|
| `meta/packages.ts` | package definitions (metadata source) | `@reaxuse/metadata` (🚧) |
| `meta/ecosystem-functions.ts` | ecosystem functions registry | ⏳ |
| `meta/versions.ts` | version info | ⏳ |
| — | manual tracking (current) | [`meta/functions.md`](../meta/functions.md) (🚧 hand-maintained until `@reaxuse/metadata` lands) |

## 10. Root tooling & config files

| VueUse | purpose | reaxuse |
|---|---|---|
| `package.json` + `pnpm-workspace.yaml` + `pnpm-lock.yaml` | monorepo (pnpm) | `package.json` + `package-lock.json` (npm workspaces) ✅ |
| `tsconfig.json` | TS config | `tsconfig.json` ✅ |
| `turbo.json` | task orchestration | ⏳ |
| `tsdown.config.ts` | package bundling | ⏳ |
| `vitest.config.ts` | test config | ⏳ |
| `eslint.config.js` | linting | ⏳ |
| `unocss.config.ts` | docs styling | ⏳ |
| `taze.config.ts` | dependency updates | ⏳ |
| `netlify.toml` | docs site deploy | ⏳ |
| `.editorconfig` | editor style | ⏳ |
| `.gitignore` / `.gitattributes` | git hygiene | ✅ |
| `.vscode/` | editor workspace settings | ⏳ |

## 11. Community & legal

| VueUse | reaxuse |
|---|---|
| `README.md` | `README.md` ✅ (English) |
| `LICENSE` (MIT) | `LICENSE` ✅ (MIT) |
| `CONTRIBUTING.md` | ⏳ TODO |
| `CODE_OF_CONDUCT.md` | ⏳ TODO |

## Mapping decisions

- **Runtime API mapping (conceptual):** Vue's `ref()`/`reactive()` → React `useState()`; `watch()`/`watchEffect()` → `useEffect()`; `computed()` → `useMemo()`/`useCallback()`; composable teardown → effect cleanup on unmount.
- **Single source of truth:** `source/vueuse` submodule pins the upstream reference; every ported function is checked against it.
- **Docs metadata driven:** function lists on the docs site must be generated from `@reaxuse/metadata`, not hand-maintained (same as VueUse's `meta/packages.ts` pipeline).
