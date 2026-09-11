---
category: '@Math'
---

# useAbs

Reactive `Math.abs`

## Usage

```tsx
import { useAbs } from '@reause/math'

const result = useAbs(-23) // 23
```

`value` is a plain read-only `number` (upstream takes `MaybeRefOrGetter<number>`). Re-render with a
new value — e.g. from `useState` — and the hook recomputes:

```tsx
import { useAbs } from '@reause/math'
import { useState } from 'react'

const [value, setValue] = useState(-23)
const result = useAbs(value) // 23

setValue(23) // triggers a re-render
```

## Type Declarations

```ts
/**
 * React port of VueUse's `useAbs`.
 *
 * Map from @vueuse/math `useAbs`
 * (`source/vueuse/packages/math/useAbs/`). Reactive `Math.abs`.
 *
 * Adjustment for React: upstream wraps the computation in `computed(() => ...)`
 * and returns a `ComputedRef<number>`; the reause version is a pure derived
 * hook — the plain `number` argument is read at render time and `Math.abs` is
 * applied directly, with no effects and no `.value` wrapper (SSR-safe).
 *
 * React divergence: `value` is a plain read-only `number`, not upstream's
 * `MaybeRefOrGetter<number>`. The caller re-renders with a new value (e.g. from
 * `useState`) and the hook recomputes.
 *
 * @see https://vueuse.org/math/useAbs/
 *
 * @__NO_SIDE_EFFECTS__
 *
 * @example
 * const result = useAbs(-23) // 23
 *
 * @param value - The number to compute the absolute value of.
 * @returns The absolute value of the value.
 */
export declare function useAbs(value: number): number
```
