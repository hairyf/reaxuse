---
category: Watch
---

# useWatchArray

Watches an array value and reports which items were added and removed since the previous list

## Usage

```tsx
import { useWatchArray } from '@reaxuse/shared'

useWatchArray(list, (newList, oldList, added, removed) => {
  console.log(`added: ${added}`, `removed: ${removed}`)
})

// fire once on mount with the current list
useWatchArray(list, (newList, oldList, added, removed) => {
  console.log(newList, oldList, added, removed)
}, { immediate: true })
```

The list is tracked by reference identity — mutate it in place (`push`,
`splice`, etc.) and no callback fires. Produce a new array instead
(`setList([...list, item])`). Upstream's `{ deep: true }` option has no React
equivalent and is not ported.
