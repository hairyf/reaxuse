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

## Type Declarations

```ts
/**
 * React port of VueUse's `useMax`.
 *
 * Map from @vueuse/math `useMax`
 * (`source/vueuse/packages/math/useMax/`). Reactively get maximum of values.
 *
 * Adjustment for React: upstream wraps the computation in `computed(() => ...)`
 * and returns a `ComputedRef<number>`; the reause version is a pure derived
 * hook — the plain numbers (variadic arguments or a single `readonly number[]`)
 * are read at render time and the maximum is returned directly as a `number`,
 * with no `.value` wrapper (SSR-safe).
 *
 * React divergence: arguments are plain read-only numbers, not upstream's
 * `MaybeRefOrGetter<number>[]`. The caller re-renders with new values (e.g. from
 * `useState`) and the hook recomputes.
 *
 * @see https://vueuse.org/math/useMax/
 *
 * @__NO_SIDE_EFFECTS__
 *
 * @example
 * const array = [1, 2, 3, 4]
 * const max = useMax(array) // 4
 *
 * const max2 = useMax(1, 3, 2) // 3
 *
 * @param array - An array of values.
 * @returns The maximum of the given values (`Number.NEGATIVE_INFINITY` when
 * called with no arguments).
 */
export declare function useMax(array: readonly number[]): number
export declare function useMax(...args: number[]): number
```
