---
category: Reactivity
---

# useAsync

Derived value for async functions

## Usage

```tsx
import { useAsync } from '@reause/core'
import { useState } from 'react'

const [name, setName] = useState('jack')

const userInfo = useAsync(
  async () => {
    return await mockLookUp(name)
  },
  null, // initial state
  { deps: [name] },
)
```

### Evaluation State

Use the `onEvaluating` callback to track if the async function is currently evaluating.

```tsx
import { useAsync } from '@reause/core'
import { useState } from 'react'

const [evaluating, setEvaluating] = useState(false)

const userInfo = useAsync(
  async () => { /* your logic */ },
  null,
  { onEvaluating: setEvaluating },
)
```

### onCancel

When the derived value's dependencies change before the previous async function resolves, you may want to cancel the previous one. Here is an example showing how to incorporate with the fetch API.

```tsx
import { useAsync } from '@reause/core'
import { useState } from 'react'

const [packageName, setPackageName] = useState('@reause/core')

const downloads = useAsync(async (onCancel) => {
  const abortController = new AbortController()

  onCancel(() => abortController.abort())

  return await fetch(
    `https://api.npmjs.org/downloads/point/last-week/${packageName}`,
    { signal: abortController.signal },
  )
    .then(response => response.ok ? response.json() : { downloads: '—' })
    .then(result => result.downloads)
}, 0, { deps: [packageName] })
```

### Lazy

By default, `useAsync` will start resolving immediately on creation. Specify `skipInitial: true` to skip the initial evaluation and start resolving only when `deps` change.

```tsx
import { useAsync } from '@reause/core'
import { useState } from 'react'

const [evaluating, setEvaluating] = useState(false)

const userInfo = useAsync(
  async () => { /* your logic */ },
  null,
  { skipInitial: true, onEvaluating: setEvaluating },
)
```

### Error Handling

Use the `onError` callback to handle errors from the async function.

```tsx
import { useAsync } from '@reause/core'
import { useState } from 'react'

const [name, setName] = useState('jack')

const userInfo = useAsync(
  async () => {
    return await mockLookUp(name)
  },
  null,
  {
    deps: [name],
    onError(e) {
      console.error('Failed to fetch user info', e)
    },
  },
)
```

### Shallow Ref

By default, upstream uses `shallowRef` internally. React state is always a fresh object, so the shallow-ref caveat does not apply.

## Caveats

- Just like an effect keyed by `deps`, `useAsync` re-evaluates when the dependencies in the `deps` array change. Note however that only dependencies listed in `deps` are considered for this. In other words: **Values that are accessed asynchronously inside the callback will not trigger re-evaluation of the derived value.**
- Re-evaluation of the derived value is triggered whenever the `deps` change, regardless of whether its result is currently being used.

## Type Declarations

```ts
/**
 * Upstream re-exports `Fn` from `@vueuse/shared` types; `@reause/shared`
 * does not export it, so it is declared locally here (same pattern as
 * `packages/shared/useIntervalFn/index.tsx`).
 */
type Fn = () => void
/**
 * Handle overlapping async evaluations.
 *
 * @param cancelCallback The provided callback is invoked when a re-evaluation of the computed value is triggered before the previous one finished
 */
export type UseAsyncOnCancel = (cancelCallback: Fn) => void
export interface UseAsyncOptions {
  /**
   * React dependency array driving re-evaluation (replaces upstream's
   * automatic reactive-dep tracking). Defaults to `[]` = evaluate once on
   * mount.
   */
  deps?: unknown[]
  /** Called with `true` when an evaluation starts, `false` when it settles. Replaces upstream's `evaluating` ref. */
  onEvaluating?: (value: boolean) => void
  /**
   * When true, skip the initial mount evaluation; evaluate only when `deps`
   * change. With the default `[]` deps the hook then never evaluates.
   *
   * This is the reause replacement for upstream's `lazy`. Upstream's `lazy`
   * starts evaluation on the first access to the returned computed; React has
   * no first-access hook, so that semantic has no equivalent here.
   *
   * @default false
   */
  skipInitial?: boolean
  /**
   * @deprecated Use `skipInitial` instead. Kept as an alias with identical
   * behavior (skip the mount evaluation); it does NOT carry upstream's
   * "evaluate on the first access" semantics. `skipInitial` wins when both
   * are passed.
   */
  lazy?: boolean
  /** Called when the evaluation callback rejects; the current state is kept. */
  onError?: (error: unknown) => void
}
/**
 * Create an asynchronous computed dependency — React port of VueUse's
 * `computedAsync`, renamed `useAsync` for the React port.
 *
 * Map from @vueuse/core `computedAsync`
 * (`source/vueuse/packages/core/computedAsync/`), renamed `useAsync` for the
 * React port: re-evaluates an async
 * function when its inputs change, exposes the in-flight state, supports
 * cancellation through the `onCancel` callback handed to
 * `evaluationCallback`, and protects against stale out-of-order resolutions
 * — only the latest evaluation may update the state.
 *
 * React adaptation:
 *
 * - returns the plain resolved value `T` (repo convention §2B — pure-derived
 *   value, not a ref/tuple), starting at `initialState` and managed through
 *   shared `useControllableState`; controlled state receives async results via
 *   its tuple setter or `{ value, onChange }` callback;
 * - upstream tracks reactive dependencies automatically; React has no
 *   reactive graph, so re-evaluation is driven by the explicit
 *   `options.deps` array, compared with `useEffect` semantics (default `[]`
 *   = evaluate once on mount);
 * - `initialState` is optional; omitting it yields `T | undefined` (upstream
 *   overload parity);
 * - upstream's `evaluating` ref becomes the `onEvaluating(value)` callback:
 *   `true` when an evaluation starts, `false` when it settles — resolved,
 *   rejected, or discarded by a newer evaluation or by unmount. An
 *   evaluation reports `false` at most once (a superseded evaluation
 *   settles at invalidation time, not when its abandoned promise later
 *   resolves), and it is never called after unmount;
 * - `onCancel(cb)` registers cleanup callbacks; all registered callbacks
 *   are invoked — and the registry cleared — when the deps change
 *   mid-flight or on unmount (upstream parity). They are not invoked once
 *   the evaluation has finished (upstream's `hasFinished` flag);
 * - stale protection: a monotonically increasing evaluation id discards
 *   results of evaluations superseded by a newer one (or by an unmount),
 *   mirroring upstream's `counter` guard;
 * - on rejection the current state is kept and `options.onError` receives
 *   the error (default: `globalThis.reportError`, upstream parity). Like
 *   upstream, rejections of superseded/cancelled evaluations also reach
 *   `onError` — pass a custom `onError` if cancelled runs must stay silent;
 * - sync (non-Promise) return values from `evaluationCallback` update the
 *   state synchronously within the effect;
 * - `skipInitial: true` (alias: the deprecated `lazy`) skips the mount
 *   evaluation, so evaluation happens only when `deps` change and with the
 *   default `[]` deps it never runs. Upstream's `lazy` instead starts on the
 *   first read of the returned computed, which has no React equivalent; the
 *   deprecated `lazy` alias keeps the name but not that semantic;
 * - upstream's `flush` option (`ConfigurableFlushSync`, default `'sync'`) has
 *   no mapping: re-evaluation is driven by `deps` and runs in a React effect
 *   (post-commit), the closest analogue of upstream's sync flush;
 * - upstream's `shallow` option (React state is never deep-wrapped) and the
 *   `Ref<boolean>`-as-`evaluating` overload are not portable and are
 *   collapsed into `options` only.
 *
 * The upstream `asyncComputed` deprecated alias is intentionally not ported
 * (upstream-only; use `useAsync`).
 *
 * @__NO_SIDE_EFFECTS__
 * @example
 * const downloads = useAsync(
 *   async (onCancel) => {
 *     const controller = new AbortController()
 *     onCancel(() => controller.abort())
 *     const response = await fetch(url, { signal: controller.signal })
 *     return response.ok ? (await response.json() as { downloads: number }).downloads : 0
 *   },
 *   0,
 *   { deps: [packageName] },
 * )
 *
 * @see https://vueuse.org/computedAsync/
 */
export declare function useAsync<T>(
  evaluationCallback: (onCancel: UseAsyncOnCancel) => T | Promise<T>,
  initialState: State<T>,
  options?: UseAsyncOptions,
): T
export declare function useAsync<T>(
  evaluationCallback: (onCancel: UseAsyncOnCancel) => T | Promise<T>,
  initialState?: undefined,
  options?: UseAsyncOptions,
): T | undefined
```
