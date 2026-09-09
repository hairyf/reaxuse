---
category: '@Math'
---

# useRound

Reactive `Math.round`

## Usage

```tsx
import { useRound } from '@reaxuse/math'

const value = { current: 20.49 }
const result = useRound(value) // 20

value.current = -20.51 // result === -21 on the next render
```

## Value Forms

`value` accepts a React `State<number>` and every form is resolved through `toValue`:

```tsx
import { useRound } from '@reaxuse/math'

useRound(20.49) // plain number
useRound(() => 20.49) // getter
useRound({ current: 20.49 }) // React ref (`{ current }`)
useRound([20.49, setValue]) // state tuple
useRound({ value: 20.49, onChange: setValue }) // value/onChange pair
```

The `[value, setter]` tuple and `{ value, onChange }` pair are the React state protocol and have no
upstream equivalent (upstream takes `MaybeRefOrGetter<number>` — `number | Ref<number> | (() => number)`).
