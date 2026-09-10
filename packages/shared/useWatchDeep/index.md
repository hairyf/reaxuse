---
category: Watch
---

# useWatchDeep

Shorthand for watching a value with `{ deep: true }` — invokes the callback only when the value differs **deeply** from the previous one

## Usage

```tsx
import { useWatchDeep } from '@reaxuse/shared'
import { useState } from 'react'

const [obj, setObj] = useState({ foo: { bar: { deep: 5 } } })
const [count, setCount] = useState(0)

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

## Helpers

`deepEqual` and `deepClone` are exported from `@reaxuse/shared` and also used
by core hooks that need deep change detection (e.g. `useCloned`):

```tsx
import { deepClone, deepEqual } from '@reaxuse/shared'

deepEqual({ foo: 1 }, { foo: 1 }) // true
deepEqual(deepClone({ foo: { bar: 1 } }), { foo: { bar: 1 } }) // true
```
