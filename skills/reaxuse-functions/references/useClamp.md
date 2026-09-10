---
category: '@Math'
---

# useClamp

Reactively clamp a value between two other values.

## Usage

```tsx
import { useClamp } from '@reaxuse/math'
import { useState } from 'react'

const [min, setMin] = useState(0)
const [max, setMax] = useState(10)
const [value, setValue] = useClamp(0, min, max)

setValue(15) // value is 10
setValue(-5) // value is 0
```

### Writable Ref

`value` seeds the hook's internal state; the returned setter clamps on write:

```tsx
import { useClamp } from '@reaxuse/math'

const [clamped, setClamped] = useClamp(0, 0, 10)

setClamped(15) // clamped is 10
setClamped(-5) // clamped is 0
```

### Reactive Bounds

`value`, `min` and `max` are plain read-only numbers (upstream takes
`MaybeRefOrGetter<number>`). Bounds are re-resolved on every render, so shrinking `max` re-clamps
the current value:

```tsx
import { useClamp } from '@reaxuse/math'
import { useState } from 'react'

const [max, setMax] = useState(10)
const [clamped] = useClamp(5, 0, max)

setMax(3) // clamped is 3 on the next render
```

## Type Declarations

```ts
/**
 * Reactively clamp a value between two other values.
 *
 * Map from @vueuse/math `useClamp`
 * (`source/vueuse/packages/math/useClamp/`). React port of VueUse's writable
 * `useClamp` — returns a `[value, setValue]` tuple whose setter clamps on
 * write. `value`, `min` and `max` are plain read-only numbers resolved on every
 * render: `value` seeds the hook's internal state (and re-syncs when it
 * changes), and bounds are re-resolved on every render and on every set, so
 * shrinking `max` / raising `min` re-clamps the current value automatically.
 *
 * React divergence: all three parameters are plain `number`, not upstream's
 * `MaybeRefOrGetter<number>`. The caller re-renders with new values (e.g. from
 * `useState`) instead of passing a ref/getter. Upstream's writable computed
 * also writes the clamped value back into its internal ref on every read, so an
 * out-of-bounds seed stays clamped even after the bounds loosen; here `value`
 * is a plain prop that re-seeds internal state when it changes and the raw seed
 * is re-clamped on every render, so loosening the bounds re-exposes the raw
 * seed until the next `setValue`.
 *
 * @__NO_SIDE_EFFECTS__
 *
 * @example
 * const [value, setValue] = useClamp(0, 0, 10)
 * setValue(15) // value is 10
 * setValue(-5) // value is 0
 *
 * @param value - The value to clamp.
 * @param min - The lower bound.
 * @param max - The upper bound.
 * @returns A `[value, setValue]` pair; `setValue` clamps into `[min, max]`.
 */
export declare function useClamp(
  value: number,
  min: number,
  max: number,
): [number, (value: number) => void]
```
