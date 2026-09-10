---
category: Reactivity
---

# useAsync

Derived value for async functions

## Usage

```tsx
import { useAsync } from '@reaxuse/core'
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
import { useAsync } from '@reaxuse/core'
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
import { useAsync } from '@reaxuse/core'
import { useState } from 'react'

const [packageName, setPackageName] = useState('@reaxuse/core')

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
import { useAsync } from '@reaxuse/core'
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
import { useAsync } from '@reaxuse/core'
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
