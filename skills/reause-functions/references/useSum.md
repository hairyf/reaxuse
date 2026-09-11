---
category: '@Math'
---

# useSum

Get the sum of an array reactively

## Usage

```tsx
import { useSum } from '@reause/math'

const array = [1, 2, 3, 4]
const sum = useSum(array) // 10
```

```tsx
import { useSum } from '@reause/math'
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

## Type Declarations

```ts
/**
 * React port of VueUse's `useSum`.
 *
 * Map from @vueuse/math `useSum`
 * (`source/vueuse/packages/math/useSum/`). Reactively get the sum of values.
 *
 * Adjustment for React: upstream wraps the computation in `computed(() => ...)`
 * and returns a `ComputedRef<number>`; the reause version is a pure derived
 * hook — the plain numbers (variadic arguments or a single `readonly number[]`)
 * are read at render time and the sum is returned directly as a `number`, with
 * no `.value` wrapper (SSR-safe).
 *
 * React divergence: arguments are plain read-only numbers, not upstream's
 * `MaybeRefOrGetter<number>[]`. In particular, the getter form (`() => number`)
 * is NOT accepted — getters as data sources are rejected repo-wide (issue #462)
 * — so the upstream getter test is intentionally not ported. The caller
 * re-renders with new values (e.g. from `useState`) and the hook recomputes.
 *
 * @see https://vueuse.org/math/useSum/
 *
 * @__NO_SIDE_EFFECTS__
 *
 * @example
 * const array = [1, 2, 3, 4]
 * const sum = useSum(array) // 10
 *
 * const [a, setA] = useState(1)
 * const [b, setB] = useState(3)
 * const sum2 = useSum(a, b, 2) // 6
 *
 * @param array - An array of numbers.
 * @returns The sum of the given numbers (`0` when called with no arguments).
 */
export declare function useSum(array: readonly number[]): number
export declare function useSum(...args: number[]): number
```
