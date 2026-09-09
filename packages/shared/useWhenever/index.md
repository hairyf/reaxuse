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

// is equivalent to:
useEffect(() => {
  if (ready)
    console.log(state)
}, [ready])
```

### Callback Function

The callback will be called with `cb(value, oldValue)`.

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
