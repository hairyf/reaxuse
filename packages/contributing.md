# Contributing

Thanks for being interested in contributing to this project! reaxuse is an
experimental **1:1 React port of [VueUse](https://vueuse.org)**: the upstream
repo is pinned as a git submodule at `source/vueuse` and is the single source
of truth for every mapping.

## Development

### Setup

Clone this repo to your local machine and install the dependencies.

```bash
git clone --recurse-submodules https://github.com/hairyf/reaxuse.git
cd reaxuse
npm install
```

> **Windows note:** if you cloned without `--recurse-submodules`, run
> `git submodule update --init --recursive` to fetch `source/vueuse`.

We use VitePress for rapid development and documenting. You can start it locally by

```bash
npm run docs
```

### Testing

```bash
pnpm test:unit # to run unit tests
```

Hook tests run in a real browser via `vitest-browser-react`. You need to
install the Playwright browsers once:

```bash
npx playwright install --with-deps
```

and then run

```bash
pnpm test:browser
```

## Contributing

### Existing functions

Feel free to enhance the existing functions. Please try not to introduce breaking changes.

### New functions

There are some notes for adding new functions (ported from VueUse):

- Before you start working, it's better to open a [mapping issue](https://github.com/hairyf/reaxuse/blob/main/docs/mapping-issue-template.md) to discuss first.
- The implementation should be placed under `packages/<pkg>/<fn>` as a folder and exposed in the package barrel `packages/<pkg>/index.ts`.
- In the `core` package, try not to introduce 3rd-party dependencies as this package is aimed to be as lightweight as possible.
- If you'd like to introduce 3rd-party dependencies, please contribute to `@reaxuse/integrations` or create a new add-on.
- When writing documentation for your function, mirror the upstream `index.md` structure (React differences only in JSDoc).

> Please note you don't need to update the packages' `index.ts` by hand — the
> metadata registry is refreshed by `npm run update`.

### New add-ons

New add-ons are greatly welcome!

- Create a new folder under `packages/`, name it as your add-on name.
- Add add-on details in `meta/packages.ts`.
- Create `README.md` under that folder.
- Add functions as you would do to the core package.
- Commit and submit as a PR.

## Project Structure

### Monorepo

We use monorepo for multiple packages

```
packages
  shared/         - shared utils across packages
  core/           - the core package
  integrations/   - 3rd-party integrations
  math/           - math utils
  [...addons]/    - add-ons named
```

### Function Folder

A function folder typically contains these 4 files:

```bash
index.tsx         # function source code itself (React hook)
demo.tsx          # documentation demo
index.test.tsx    # vitest browser testing
index.md          # documentation
```

for `index.tsx` you should export the hook with names.

```tsx
// DO
export function useMyFunction() { /* ... */ }

// DON'T
export default useMyFunction
```

for `index.md` the first sentence will be displayed as the short intro in the
function list, so try to keep it brief and clear.

```markdown
# useMyFunction

This will be the intro. The detail descriptions...
```

Read more about the [guidelines](/guidelines).

## Mapping a VueUse function

Follow the [mapping issue template](https://github.com/hairyf/reaxuse/blob/main/docs/mapping-issue-template.md) workflow:

1. Locate the upstream implementation under `source/vueuse/packages/<pkg>/<fn>`.
2. Create `packages/<pkg>/<fn>/index.tsx` with the React port:
   - `ref()` / `reactive()` → `useState()`
   - `watch()` / `watchEffect()` → `useEffect()`
   - `computed()` → `useMemo()` / `useCallback()`
   - composable teardown → effect cleanup on unmount
3. Export it from `packages/<pkg>/index.ts`.
4. Add a test in `packages/<pkg>/<fn>/index.test.tsx` using `vitest-browser-react`, mirroring the upstream test files.
5. Run `npm run update` to refresh `meta/functions.md`, `packages/functions.md` and `packages/metadata/src/functions.ts`.
6. Add a docs page `packages/<pkg>/<fn>/index.md` + a co-located demo `packages/<pkg>/<fn>/demo.tsx`.

## Code Style

Don't worry about the code style as long as you install the dev dependencies.
Git hooks will format and fix them for you on committing (eslint via
`@antfu/eslint-config`, the same config VueUse uses).

## Commit conventions

Follow [Conventional Commits](https://www.conventionalcommits.org/), e.g.
`feat(core): port useMouse`, `fix(shared): …`, `docs: …`.

## PR checklist

- [ ] `npm run typecheck` passes
- [ ] `npm run test` passes
- [ ] `npm run lint` passes
- [ ] `meta/functions.md` regenerated via `npm run update` when mapping new hooks
