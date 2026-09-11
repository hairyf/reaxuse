---
category: '@Math'
---

# useMax

Reactive `Math.max`

## Usage

```tsx
import { useMax } from '@reause/math'

const array = [1, 2, 3, 4]
const max = useMax(array) // 4
```

```tsx
import { useMax } from '@reause/math'

const max = useMax(1, 3, 2) // 3
```

## Argument Forms

Arguments are plain read-only numbers (upstream takes `MaybeRefOrGetter<number>[]`). The
single-array form accepts a `readonly number[]`:

```tsx
useMax([1, 2, 3]) // array
useMax(1, 2, 3) // variadic
useMax([1, 2, 3] as const) // readonly array
```

Re-render with new values — e.g. from `useState` — and the hook recomputes.
