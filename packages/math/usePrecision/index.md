---
category: '@Math'
---

# usePrecision

Reactively set the precision of a number

## Usage

```tsx
import { usePrecision } from '@reaxuse/math'

const result = usePrecision(3.1415, 2) // 3.14

const ceilResult = usePrecision(3.1415, 2, {
  math: 'ceil'
}) // 3.15

const floorResult = usePrecision(3.1415, 3, {
  math: 'floor'
}) // 3.141
```

`value`, `digits` and `options` are plain read-only values (upstream takes
`MaybeRefOrGetter<...>`). Re-render with new values — e.g. from `useState` — and the hook recomputes.
