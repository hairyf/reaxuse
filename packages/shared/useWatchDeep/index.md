---
category: Watch
---

# useWatchDeep

Shorthand for watching a value with `{ deep: true }` — invokes the callback only when the value differs **deeply** from the previous one

## Usage

```tsx
import { useWatchDeep } from '@reaxuse/shared'

const [obj, setObj] = useState({ foo: { bar: { deep: 5 } } })

useWatchDeep(obj, (updated) => {
  console.log(updated)
})

// replaces a nested value — the callback fires
setObj({ foo: { bar: { deep: 10 } } })

// deep-equal reassignment — the callback stays silent
setObj({ foo: { bar: { deep: 10 } } })

// array sources and `immediate` work like `useWatch`
useWatchDeep([count, obj], (value, oldValue) => {
  console.log(value, oldValue)
})
```
