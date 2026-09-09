---
category: '@Math'
---

# useSum

Get the sum of an array reactively

## Usage

```tsx
import { useSum } from '@reaxuse/math'

const array = [1, 2, 3, 4]
const sum = useSum(array) // 10
```

```tsx
import { useSum } from '@reaxuse/math'
import { useState } from 'react'

const [a, setA] = useState(1)
const [b, setB] = useState(3)

const sum = useSum(a, b, 2) // 6
```

## Argument Forms

Arguments are plain read-only numbers (upstream takes `MaybeRefOrGetter<number>[]`). The
single-array form accepts a `readonly number[]`:

```tsx
useSum([1, 2, 3]) // array
useSum(1, 2, 3) // variadic
useSum([1, 2, 3] as const) // readonly array
```

Re-render with new values — e.g. from `useState` — and the hook recomputes.
