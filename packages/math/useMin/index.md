---
category: '@Math'
---

# useMin

Reactive `Math.min`

## Usage

```tsx
import { useMin } from '@reaxuse/math'

const array = [1, 2, 3, 4]
const min = useMin(array) // 1
```

```tsx
import { useMin } from '@reaxuse/math'

const min = useMin(1, 3, 2) // 1
```

## Argument Forms

Arguments are plain read-only numbers (upstream takes `MaybeRefOrGetter<number>[]`). The
single-array form accepts a `readonly number[]`:

```tsx
useMin([1, 2, 3]) // array
useMin(1, 2, 3) // variadic
useMin([1, 2, 3] as const) // readonly array
```

Re-render with new values — e.g. from `useState` — and the hook recomputes.
