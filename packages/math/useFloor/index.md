---
category: '@Math'
---

# useFloor

Reactive `Math.floor`

## Usage

```tsx
import { useFloor } from '@reaxuse/math'

const value = { current: 45.95 }
const result = useFloor(value) // 45

value.current = -45.05 // result === -46 on the next render
```

## Value Forms

`value` accepts a React `State<number>` and every form is resolved through `toValue`:

```tsx
import { useFloor } from '@reaxuse/math'

useFloor(45.95) // plain number
useFloor(() => 45.95) // getter
useFloor({ current: 45.95 }) // React ref (`{ current }`)
useFloor([45.95, setValue]) // state tuple
useFloor({ value: 45.95, onChange: setValue }) // value/onChange pair
```

The `[value, setter]` tuple and `{ value, onChange }` pair are the React state protocol and have no
upstream equivalent (upstream takes `MaybeRefOrGetter<number>` — `number | Ref<number> | (() => number)`).
