---
category: '@Math'
---

# useClamp

Reactively clamp a value between two other values — React port of VueUse's
[`useClamp`](https://vueuse.org/math/useClamp/).

**Mapping:** `Ref<number>` / `ComputedRef<number>` → `[value, setValue]` tuple.
`value`, `min` and `max` accept plain numbers or React refs, resolved on every
render. `setValue` clamps into `[min, max]` on
write, mirroring upstream's writable computed; ref-like value inputs are
written back to when clamped (upstream's writable `computed` branch).

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

### Writable Value

When you pass a plain number or a React ref, the returned
setter clamps on write and keeps the source in sync:

```tsx
import { useClamp } from '@reaxuse/math'

const number = { current: 0 }
const [clamped, setClamped] = useClamp(number, 0, 10)

setClamped(15) // clamped is 10, number.current is 10
setClamped(-5) // clamped is 0, number.current is 0
```

### Reactive Bounds

All arguments (value, min, max) can be plain numbers or React refs. Bounds are
re-resolved on every render, so shrinking `max` re-clamps the current value:

```tsx
import { useClamp } from '@reaxuse/math'

const value = { current: 5 }
const min = { current: 0 }
const max = { current: 10 }

const [clamped] = useClamp(value, min, max)

max.current = 3 // clamped is 3 on the next render
```

<DemoContainer name="UseClamp" />

## Type Declarations

```ts
export function useClamp(
  value: RefOrValue<number>,
  min: RefOrValue<number>,
  max: RefOrValue<number>,
): [number, (value: number) => void]
```

## Source

- VueUse upstream mapping — `source/vueuse/packages/math/useClamp/`:
  [`index.ts`](https://github.com/vueuse/vueuse/blob/main/packages/math/useClamp/index.ts) (implementation),
  [`index.test.ts`](https://github.com/vueuse/vueuse/blob/main/packages/math/useClamp/index.test.ts) (mirrored in `useClamp.test.tsx`),
  [`demo.vue`](https://github.com/vueuse/vueuse/blob/main/packages/math/useClamp/demo.vue) (ported to `demo.tsx` below)
- reaxuse: [`packages/math/src/useClamp.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/math/src/useClamp.ts), docs + demo co-located in `packages/math/useClamp/`

<Contributors name="useClamp" />
