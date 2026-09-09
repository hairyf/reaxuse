---
category: Watch
---

# useWhenever

Shorthand for watching value to be truthy

## Usage

```tsx
import { useWhenever } from '@reaxuse/shared'

// this
useWhenever(ready, () => console.log(state))

// is equivalent to (the initial mount run is skipped — a plain `useEffect`
// would fire on mount, so add `{ immediate: true }` to fire then too):
useEffect(() => {
  if (ready)
    console.log(state)
}, [ready])
```

With `{ immediate: true }` the callback also fires on mount when the value is already truthy:

```tsx
import { useWhenever } from '@reaxuse/shared'

// this
useWhenever(ready, () => console.log(state), { immediate: true })

// is equivalent to:
useEffect(() => {
  if (ready)
    console.log(state)
}, [ready])
```

### Callback Function

The callback will be called with `cb(value, oldValue)` — upstream's third
`onInvalidate` argument (Vue's effect invalidation registration) is not ported.

```tsx
import { useWhenever } from '@reaxuse/shared'

useWhenever(height, (current, lastHeight) => {
  if (current > lastHeight)
    console.log(`Increasing height by ${current - lastHeight}`)
})
```

### Options

Fire the callback on mount if the value is already truthy.

```tsx
import { useWhenever } from '@reaxuse/shared'

useWhenever(ready, () => console.log(state), { immediate: true })
```

Only trigger once when the condition is met — the watch stops after the first truthy fire.

```tsx
import { useWhenever } from '@reaxuse/shared'

useWhenever(ready, () => console.log(state), { once: true })
```
