# Contributing to reaxuse

Thanks for taking the time to contribute! reaxuse is an experimental 1:1 React port of
[VueUse](https://github.com/vueuse/vueuse); the upstream repo is pinned as a git submodule at
`source/vueuse` and is the single source of truth for every mapping.

## Development setup

```bash
git clone --recurse-submodules https://github.com/hairyf/reaxuse.git
cd reaxuse
npm install
```

> **Windows note:** if you cloned without `--recurse-submodules`, run
> `git submodule update --init --recursive` to fetch `source/vueuse`.

## Commands

| Command                     | Description                                                          |
| --------------------------- | -------------------------------------------------------------------- |
| `npm run typecheck`         | TypeScript check (`tsc --noEmit`)                                    |
| `npm run test`              | vitest — hook tests run in a real browser via `vitest-browser-react` |
| `npm run lint` / `lint:fix` | eslint (flat config)                                                 |
| `npm run build`             | tsdown bundle of all packages (via turbo)                            |
| `npm run docs`              | VitePress dev server                                                 |
| `npm run update`            | regenerate `meta/functions.md` from package sources                  |

Before running browser tests locally, install the chromium binary once:

```bash
npx playwright install chromium
```

## Mapping a VueUse function

1. Locate the upstream implementation under `source/vueuse/packages/<pkg>/<fn>`.
2. Create `packages/<pkg>/src/<fn>.ts` with the React port:
   - `ref()` / `reactive()` → `useState()`
   - `watch()` / `watchEffect()` → `useEffect()`
   - `computed()` → `useMemo()` / `useCallback()`
   - composable teardown → effect cleanup on unmount
3. Export it from `packages/<pkg>/src/index.ts`.
4. Add a test in `packages/<pkg>/src/<fn>.test.tsx` using `vitest-browser-react`.
5. Run `npm run update` to refresh `meta/functions.md`.
6. Add a docs page under `docs/<pkg>/<fn>.md` (usage + `<DemoContainer name="…" />` demo).

## Commit conventions

Follow [Conventional Commits](https://www.conventionalcommits.org/), e.g.
`feat(core): port useMouse`, `fix(shared): …`, `docs: …`.

## PR checklist

- [ ] `npm run typecheck` passes
- [ ] `npm run test` passes
- [ ] `npm run lint` passes
- [ ] `meta/functions.md` regenerated via `npm run update` when mapping new hooks
