---
category: '@Math'
---

# useRound

Reactive `Math.round`

## Usage

```tsx
import { useRound } from '@reaxuse/math'

const result = useRound(20.49) // 20
```

`value` is a plain read-only `number` (upstream takes `MaybeRefOrGetter<number>`). Re-render with a
new value — e.g. from `useState` — and the hook recomputes:

```tsx
import { useRound } from '@reaxuse/math'
import { useState } from 'react'

const [value, setValue] = useState(20.49)
const result = useRound(value) // 20

setValue(-20.51) // triggers a re-render
```

## Type Declarations

```ts
/**
 * React port of VueUse's `useRound`.
 *
 * Map from @vueuse/math `useRound`
 * (`source/vueuse/packages/math/useRound/`). Reactive `Math.round`.
 *
 * Adjustment for React: upstream wraps the computation in `computed(() => ...)`
 * and returns a `ComputedRef<number>`; the reaxuse version is a pure derived
 * hook — the plain `number` argument is read at render time and `Math.round` is
 * applied directly, with no effects and no `.value` wrapper (SSR-safe).
 *
 * React divergence: `value` is a plain read-only `number`, not upstream's
 * `MaybeRefOrGetter<number>`. The caller re-renders with a new value (e.g. from
 * `useState`) and the hook recomputes.
 *
 * @see https://vueuse.org/math/useRound/
 *
 * @__NO_SIDE_EFFECTS__
 *
 * @example
 * const result = useRound(20.49) // 20
 *
 * @param value - The number to round.
 * @returns The value rounded to the nearest integer.
 */
export declare function useRound(value: number): number
```
