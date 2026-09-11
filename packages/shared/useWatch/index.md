---
category: Watch
---

# useWatch

Watches a source — a single value or an array of values — and invokes a callback with `(value, oldValue)` whenever it changes

## Usage

```tsx
import { useWatch } from '@reause/shared'

useWatch(count, (value, oldValue) => {
  console.log(value, oldValue)
})

// array source — fires when any element changes
useWatch([count, name], (value, oldValue) => {
  console.log(value, oldValue)
})
```

## Options

| Name        | Type      | Default | Description                                            |
| ----------- | --------- | ------- | ------------------------------------------------------ |
| `immediate` | `boolean` | `false` | Fire the callback once on mount with the current value |

With `immediate: true` the callback fires on mount with `(value, undefined)`,
then with `(value, oldValue)` on every subsequent change:

```tsx
useWatch(count, (value, oldValue) => {
  console.log(value, oldValue) // (0, undefined) on mount, then (1, 0), ...
}, { immediate: true })
```
