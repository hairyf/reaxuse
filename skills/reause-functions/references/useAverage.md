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

## Type Declarations

```ts
/**
 * React port of VueUse's `useAverage`.
 *
 * Map from @vueuse/math `useAverage`
 * (`source/vueuse/packages/math/useAverage/`). Reactively get the average of values.
 *
 * Adjustment for React: upstream wraps the computation in `computed(() => ...)`
 * and returns a `ComputedRef<number>`; the reause version is a pure derived
 * hook — the plain numbers (variadic arguments or a single `readonly number[]`)
 * are read at render time and the average is returned directly as a `number`,
 * with no `.value` wrapper (SSR-safe).
 *
 * React divergence: arguments are plain read-only numbers, not upstream's
 * `MaybeRefOrGetter<number>[]`. The caller re-renders with new values (e.g. from
 * `useState`) and the hook recomputes.
 *
 * @see https://vueuse.org/math/useAverage/
 *
 * @__NO_SIDE_EFFECTS__
 *
 * @example
 * const array = [1, 2, 3, 4]
 * const average = useAverage(array) // 2.5
 *
 * const average2 = useAverage(1, 3, 2) // 2
 *
 * @param array - An array of numbers.
 * @returns The average of the given numbers (`0` when called with no arguments).
 */
export declare function useAverage(array: readonly number[]): number
export declare function useAverage(...args: number[]): number
```
