---
category: '@Math'
---

# useAverage

Get the average of an array reactively

## Usage

```tsx
import { useAverage } from '@reause/math'

const array = [1, 2, 3]
const averageValue = useAverage(array) // 2
```

```tsx
import { useAverage } from '@reause/math'

const averageValue = useAverage(1, 3) // 2
```

## Argument Forms

Arguments are plain read-only numbers (upstream takes `MaybeRefOrGetter<number>[]`). The
single-array form accepts a `readonly number[]`:

```tsx
useAverage([1, 2, 3]) // array
useAverage(1, 2, 3) // variadic
useAverage([1, 2, 3] as const) // readonly array
```

Re-render with new values — e.g. from `useState` — and the hook recomputes.
