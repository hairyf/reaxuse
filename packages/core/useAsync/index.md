---
category: Reactivity
---

# useAsync

Derived value for async functions

## Usage

```tsx
import { useAsync } from '@reaxuse/core'
import { useState } from 'react'

function PackageSearch() {
  const [term, setTerm] = useState('@reaxuse/core')
  const [evaluating, setEvaluating] = useState(false)

  const downloads = useAsync(
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

`initialState` accepts any shared `State<T>`: a plain value, ref-like value, state tuple, or `{ value, onChange }` object. With a tuple or object, resolved values are published through the supplied setter/callback while the hook remains controlled by the current `value`.

```tsx
const [value, setValue] = useState('—')
const downloads = useAsync(fetchDownloads, [value, setValue])
```

`initialState` is optional — omitting it starts at `undefined` and widens the return type to `T | undefined`, mirroring the upstream overloads.

```tsx
const downloads = useAsync(fetchDownloads) // string | undefined
```

## Options

| Option         | Type                       | Default       | Description                                                                                                             |
| -------------- | -------------------------- | ------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `deps`         | `unknown[]`                | `[]`          | Dependency array driving re-evaluation, compared with `useEffect` semantics (`[]` = evaluate once on mount)             |
| `skipInitial`  | `boolean`                  | `false`       | Skip the initial mount evaluation; evaluate only when `deps` change                                                     |
| `lazy`         | `boolean`                  | `false`       | **Deprecated** alias of `skipInitial` with identical behavior (`skipInitial` wins when both are passed)                 |
| `onEvaluating` | `(value: boolean) => void` | `noop`        | Called with `true` when an evaluation starts and `false` when it settles                                                |
| `onError`      | `(error: unknown) => void` | `reportError` | Called when the evaluation callback rejects; the current state is kept (default falls back to `globalThis.reportError`) |

## Behavior notes

- re-evaluation is keyed by `deps` (default `[]` = once on mount); `skipInitial: true` skips the mount evaluation so only `deps` changes trigger it;
- sync (non-Promise) return values update the state synchronously within the effect;
- results of superseded evaluations never land in the state, even when their promises resolve late;
- rejected evaluations keep the current state; pass `onError` to handle (or silence, e.g. `AbortError` from cancelled runs) the failure.

## React divergences

- **`skipInitial` replaces upstream `lazy`.** Upstream `lazy: true` starts evaluating on the _first access_ to the returned computed, so a lazy hook with no reactive dependencies still evaluates once when read. React has no first-access hook, so reaxuse renames the option to `skipInitial`: it skips the mount evaluation and evaluates only when `deps` change (with the default `[]` deps it never evaluates). The upstream `lazy` name is kept as a deprecated alias with the same `skipInitial` behavior — it does **not** carry the first-access semantics.
- **`flush` is not ported.** Upstream's `flush` option (`ConfigurableFlushSync`, default `'sync'`) controls upstream's `watchEffect` flush timing. Re-evaluation here is driven by `deps` inside a React effect (post-commit), which is the closest analogue of upstream's sync flush.
- **`evaluating` ref → `onEvaluating` callback.** Upstream accepts a `Ref<boolean>` (or an `options.evaluating` ref); React uses the `onEvaluating(value)` callback instead.
- **`shallow` is not ported.** React state is never deep-wrapped, so upstream's `shallow` option has no effect to configure.
- **`asyncComputed` alias is not ported.** Upstream re-exports the deprecated `asyncComputed = computedAsync` alias; use `useAsync` directly.
