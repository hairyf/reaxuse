# Mapping Issue Template — VueUse → reaxuse

One issue per upstream function. The single source of truth is the
[`source/vueuse`](https://github.com/hairyf/reaxuse/tree/main/source/vueuse) submodule (upstream VueUse, pinned commit).

Each issue tracks the 1:1 React port of one VueUse function:
implementation, test, docs, demo, and API-parity review.

## Title

```
Mapping | `<fnName>` | <short description>
```

The package is carried by the `@reaxuse/<pkg>` label, not the title.

Examples:

- `Mapping | \`useNow\` | Reactive current Date instance`
- `Mapping | \`useToggle\` | A boolean switcher with utility functions`

> The label/package name always follows the **upstream** package of the function.
> If the reaxuse implementation lives in a different package, that deviation is
> flagged in the body (see [ported hooks](#ported-hooks)).

## Labels

Every mapping issue carries exactly two labels, plus optional extras:

| Label                         | Rule                                                  |
| ----------------------------- | ----------------------------------------------------- |
| `@reaxuse/<pkg>`              | upstream package of the function (always)             |
| `size:<XS\|S\|M\|L\|XL\|XXL>` | from upstream `index.ts` LOC — see [Size](#size-rule) |
| `good first issue`            | optional — add for `size:S` or below                  |

No new labels are required; `@reaxuse/*` and `size:*` already exist in the repo.

## Body

````markdown
## Target

- **VueUse**: `useNow` — package `@vueuse/core` — [docs](https://vueuse.org/core/useNow/) — source `source/vueuse/packages/core/useNow`
- **reaxuse**: `packages/core/src/useNow.ts`, exported from `@reaxuse/core`
- **Status**: ☐ todo · ☐ in progress · ☐ done

## Upstream API

<!-- extracted from upstream index.ts + index.md frontmatter -->

- **Options**: `{ interval?: number, controls?: boolean }`
- **Returns**: `Date` — or `{ now, pause, resume }` when `controls: true`
- **Variants**: component `UseNow` / directive `v-*` (only if present upstream)

## Mapping files

<!-- the exact upstream files this port is mapped FROM (resolved per function) -->

Map from (`source/vueuse/packages/core/useNow/`):

- `index.ts` — main implementation (21 LOC)
- `index.browser.test.ts` — upstream tests to mirror
- `component.ts` / `directive.ts` / `demo.vue` — only when present

Map to (reaxuse):

- `packages/core/src/useNow.ts` — implementation
- `packages/core/src/useNow.test.tsx` — mirrored tests (vitest-browser-react)
- `packages/core/useNow/index.md` + `packages/core/useNow/demo.tsx` — docs page + demo (co-located per function, mirroring upstream)

## Expected implementation

<!-- COMPLETED DYNAMICALLY during mapping (not generated): the full
     side-by-side implementation. The VueUse side below is prefilled from
     upstream docs; the reaxuse side must be written by the mapper — it
     generally mirrors the VueUse shape 1:1, but React differences
     (state/effect/refs, SSR, options handling) are expected and should be
     reflected here. -->

```tsx
// vueuse — @vueuse/core
import { useNow } from '@vueuse/core'

const now = useNow()

// reaxuse — @reaxuse/core
import { useNow } from '@reaxuse/core'

const now = useNow()
// ...
```
````

> **This section is completed dynamically during mapping** — it is not
> auto-generated. The VueUse side is prefilled from upstream docs; the
> reaxuse side is written by the mapper (it generally matches the VueUse
> shape, with React differences documented inline).

General conventions to apply (from `packages/guide/architecture.md` § Mapping decisions):

```tsx
// vueuse                    // reaxuse (expected)
// watch()         →  useWatch()          // or useEffect when no reactive deps
// computed()      →  useMemo()
// ref()           →  useState()
// watchEffect()   →  useEffect()
// composable teardown → effect cleanup on unmount
```

## Mapping notes

<!-- React-flavored mapping decisions for THIS function only -->

- deviations from upstream API, SSR / browser-only concerns
- external dependencies (e.g. axios, firebase, drauu) and how to keep them optional
- package-placement deviations (upstream pkg → different reaxuse pkg)

## Acceptance criteria

- [ ] implementation `packages/<pkg>/src/<fn>.ts` + re-export from `packages/<pkg>/src/index.ts`
- [ ] test `packages/<pkg>/src/<fn>.test.tsx` (vitest-browser-react), mirroring the upstream test files
- [ ] docs page `packages/<pkg>/<fn>/index.md` + co-located demo `packages/<pkg>/<fn>/demo.tsx`
- [ ] docs page references the upstream mapping files (source + tests)
- [ ] `npm run update` — refresh `meta/functions.md`, `packages/functions.md`, `packages/metadata/src/functions.ts`

## Size estimate

- upstream `index.ts` LOC: `21` → **`size:S`**
- factors: browser-only APIs · external deps · component/directive variants

## Ported hooks

Already-ported functions still get an issue, kept open as a **review/completion
tracker** — tick the acceptance items that exist and list the remaining gaps
honestly instead of pre-marking done. Example:

- `useNow` is implemented (`packages/core/src/useNow.ts`) with test, docs and
  demo — but only supports `useNow(interval)`. Upstream also has the `controls`
  mode and returns a `Date`; those are open checklist items.
- `useToggle` / `useCounter` upstream live in `@vueuse/shared` and are
  implemented in `@reaxuse/shared` — package placement matches upstream.

## Size rule

Measured on `source/vueuse/packages/<pkg>/<fn>/index.ts`, reusing the existing
`size:*` label ranges:

| size       | upstream `index.ts` LOC |
| ---------- | ----------------------- |
| `size:XS`  | 0–9                     |
| `size:S`   | 10–29                   |
| `size:M`   | 30–99                   |
| `size:L`   | 100–499                 |
| `size:XL`  | 500–999                 |
| `size:XXL` | 1000+                   |

Special case: `source/vueuse/packages/shared/utils` (internal utility folder,
no per-function docs) → **one** issue covering the whole group, `size:XXL`.

## Creation

Issues are created with the GitHub CLI against `hairyf/reaxuse`:

```bash
gh issue create \
  --title 'Mapping | `useNow` | Reactive current Date instance' \
  --label "@reaxuse/core,size:S" \
  --body-file <rendered-body.md>
```

A generator script (`scripts/create-mapping-issues.ts`) scans the submodule,
resolves the mapping files, computes LOC/size/labels, renders this template per
function, and creates the issues (dry-run mode first).
