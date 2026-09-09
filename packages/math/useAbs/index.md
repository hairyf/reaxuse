---
category: '@Math'
---

# useAbs

Reactive `Math.abs`

## Usage

```tsx
import { useAbs } from '@reaxuse/math'

const value = { current: -23 }
const result = useAbs(value) // 23

value.current = 23 // result === 23 on the next render
```

## Value Forms

`value` accepts a React `State<number>` and every form is resolved through `toValue`:

```tsx
import { useAbs } from '@reaxuse/math'

useAbs(-23) // plain number
useAbs(() => -23) // getter
useAbs({ current: -23 }) // React ref (`{ current }`)
useAbs([-23, setValue]) // state tuple
useAbs({ value: -23, onChange: setValue }) // value/onChange pair
```

The `[value, setter]` tuple and `{ value, onChange }` pair are the React state protocol and have no
upstream equivalent (upstream takes `MaybeRefOrGetter<number>` — `number | Ref<number> | (() => number)`).
