---
category: Reactivity
---

# computedAsync

Computed for async functions — React port of VueUse's [`computedAsync`](https://vueuse.org/computedAsync/).

**Mapping:** VueUse's `computedAsync` wraps an async function in a Vue `computed`: it re-evaluates automatically whenever the reactive dependencies read inside the callback change, tracks in-flight state on an `evaluating` ref, and lets superseded runs be cancelled through the `onCancel` callback handed to the evaluation callback. React has no reactive dependency graph, so the port keeps the name and callback shape but drives re-evaluation with an explicit `deps` array (`useEffect` semantics; `[]` = evaluate once on mount) and replaces the `evaluating` ref with an `onEvaluating(value)` callback (`true` when an evaluation starts, `false` when it settles — resolved, rejected, or discarded). It returns the plain resolved value `T` starting at `toValue(initialState)` (repo convention §2B — pure-derived value, not a ref). Stale out-of-order resolutions are discarded via an internal evaluation counter (upstream parity): only the latest evaluation may update the state, and registered `onCancel` callbacks fire when the deps change mid-flight or on unmount. On rejection the current state is kept and `onError` receives the error (default `globalThis.reportError`, upstream parity). Upstream's `shallow`/`flush` options and the `Ref<boolean>`-as-`evaluating` overload have no React equivalent and are not ported; the `asyncComputed` alias is intentionally not ported (upstream-only, deprecated there).

## Usage

```tsx
import { computedAsync } from '@reaxuse/core'
import { useState } from 'react'

function PackageSearch() {
  const [term, setTerm] = useState('@reaxuse/core')
  const [evaluating, setEvaluating] = useState(false)

  const downloads = computedAsync(
    async (onCancel) => {
      const controller = new AbortController()
      // a newer evaluation (or unmount) aborts this one
      onCancel(() => controller.abort())

      const response = await fetch(
        `https://api.npmjs.org/downloads/point/last-week/${term}`,
        { signal: controller.signal },
      )
      return response.ok
        ? (await response.json() as { downloads: number }).downloads
        : '—'
    },
    '—', // initial state
    { deps: [term], onEvaluating: setEvaluating },
  )

  return (
    <div>
      <input value={term} onChange={event => setTerm(event.target.value)} />
      <div>{evaluating ? 'looking up…' : ''}</div>
      <div>{downloads}</div>
    </div>
  )
}
```

Behavior notes:

- re-evaluation is keyed by `deps` (default `[]` = once on mount); `lazy: true` skips the mount evaluation so only `deps` changes trigger it;
- sync (non-Promise) return values update the state synchronously within the effect;
- results of superseded evaluations never land in the state, even when their promises resolve late;
- rejected evaluations keep the current state; pass `onError` to handle (or silence, e.g. `AbortError` from cancelled runs) the failure.

<DemoContainer name="ComputedAsync" />

## Type Declarations

```ts
export type AsyncComputedOnCancel = (cancelCallback: Fn) => void

export interface AsyncComputedOptions {
  /**
   * React dependency array driving re-evaluation (replaces upstream's
   * automatic reactive-dep tracking). Defaults to `[]` = evaluate once on mount.
   */
  deps?: unknown[]
  /** Called with `true` when an evaluation starts, `false` when it settles. Replaces upstream's `evaluating` ref. */
  onEvaluating?: (value: boolean) => void
  /** When true, skip the initial mount evaluation; evaluate only when `deps` change. */
  lazy?: boolean
  /** Called when the evaluation callback rejects; the current state is kept. */
  onError?: (error: unknown) => void
}

export function computedAsync<T>(
  evaluationCallback: (onCancel: AsyncComputedOnCancel) => T | Promise<T>,
  initialState: RefOrValue<T>,
  options?: AsyncComputedOptions,
): T
```

## Source

- VueUse upstream mapping — `source/vueuse/packages/core/computedAsync/`:
  [`index.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/computedAsync/index.ts) (implementation),
  [`index.browser.test.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/computedAsync/index.browser.test.ts) (mirrored in `computedAsync.test.tsx`),
  [`demo.vue`](https://github.com/vueuse/vueuse/blob/main/packages/core/computedAsync/demo.vue) (ported to `demo.tsx` below)
- reaxuse: [`packages/core/src/computedAsync.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/core/src/computedAsync.ts), docs + demo co-located in `packages/core/computedAsync/`

<Contributors name="computedAsync" />
