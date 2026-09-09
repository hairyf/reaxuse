---
category: '@Math'
---

# useCeil

Reactive `Math.ceil`

## Usage

```tsx
import { useCeil } from '@reaxuse/math'

const value = { current: 0.95 }
const result1 = useCeil(value) // 1

value.current = -7.004
const result2 = useCeil(value) // -7
```

## Value Forms

`value` accepts a React `State<number>` and every form is resolved through `toValue`:

```tsx
import { useCeil } from '@reaxuse/math'

useCeil(0.95) // plain number
useCeil(() => 0.95) // getter
useCeil({ current: 0.95 }) // React ref (`{ current }`)
useCeil([0.95, setValue]) // state tuple
useCeil({ value: 0.95, onChange: setValue }) // value/onChange pair
```

The `[value, setter]` tuple and `{ value, onChange }` pair are the React state protocol and have no
upstream equivalent (upstream takes `MaybeRefOrGetter<number>` — `number | Ref<number> | (() => number)`).
