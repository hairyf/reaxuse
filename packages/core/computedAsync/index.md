---
category: Reactivity
---

# computedAsync

Computed for async functions

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

`initialState` accepts any shared `State<T>`: a plain value, ref-like value, state tuple, or `{ value, onChange }` object. With a tuple or object, resolved values are published through the supplied setter/callback while the hook remains controlled by the current `value`.

```tsx
const [value, setValue] = useState('—')
const downloads = computedAsync(fetchDownloads, [value, setValue])
```

Behavior notes:

- re-evaluation is keyed by `deps` (default `[]` = once on mount); `lazy: true` skips the mount evaluation so only `deps` changes trigger it;
- sync (non-Promise) return values update the state synchronously within the effect;
- results of superseded evaluations never land in the state, even when their promises resolve late;
- rejected evaluations keep the current state; pass `onError` to handle (or silence, e.g. `AbortError` from cancelled runs) the failure.
