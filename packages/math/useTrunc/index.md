---
category: '@Math'
---

# useTrunc

Reactive `Math.trunc`

## Usage

```tsx
import { useTrunc } from '@reaxuse/math'

const value = { current: 0.95 }
const result1 = useTrunc(value) // 0

value.current = -2.34
const result2 = useTrunc(value) // -2
```

## Value Forms

`value` accepts a React `State<number>` and every form is resolved through `toValue`:

```tsx
import { useTrunc } from '@reaxuse/math'

useTrunc(0.95) // plain number
useTrunc(() => 0.95) // getter
useTrunc({ current: 0.95 }) // React ref (`{ current }`)
useTrunc([0.95, setValue]) // state tuple
useTrunc({ value: 0.95, onChange: setValue }) // value/onChange pair
```

The `[value, setter]` tuple and `{ value, onChange }` pair are the React state protocol and have no
upstream equivalent (upstream takes `MaybeRefOrGetter<number>` — `number | Ref<number> | (() => number)`).
