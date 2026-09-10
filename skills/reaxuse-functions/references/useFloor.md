---
category: '@Math'
---

# useFloor

Reactive `Math.floor`

## Usage

```tsx
import { useFloor } from '@reaxuse/math'

const result = useFloor(45.95) // 45
```

`value` is a plain read-only `number` (upstream takes `MaybeRefOrGetter<number>`). Re-render with a
new value — e.g. from `useState` — and the hook recomputes:

```tsx
import { useFloor } from '@reaxuse/math'
import { useState } from 'react'

const [value, setValue] = useState(45.95)
const result = useFloor(value) // 45

setValue(-45.05) // triggers a re-render
```

## Type Declarations

```ts
/**
 * React port of VueUse's `useFloor`.
 *
 * Map from @vueuse/math `useFloor`
 * (`source/vueuse/packages/math/useFloor/`). Reactive `Math.floor`.
 *
 * Adjustment for React: upstream wraps the computation in `computed(() => ...)`
 * and returns a `ComputedRef<number>`; the reaxuse version is a pure derived
 * hook — the plain `number` argument is read at render time and `Math.floor` is
 * applied directly, with no effects and no `.value` wrapper (SSR-safe).
 *
 * React divergence: `value` is a plain read-only `number`, not upstream's
 * `MaybeRefOrGetter<number>`. The caller re-renders with a new value (e.g. from
 * `useState`) and the hook recomputes.
 *
 * @see https://vueuse.org/math/useFloor/
 *
 * @__NO_SIDE_EFFECTS__
 *
 * @example
 * const result = useFloor(45.95) // 45
 *
 * @param value - The number to floor.
 * @returns The floor of the value.
 */
export declare function useFloor(value: number): number
```
