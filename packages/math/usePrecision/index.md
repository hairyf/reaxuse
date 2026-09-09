---
category: '@Math'
---

# usePrecision

Reactively set the precision of a number

## Usage

```tsx
import { usePrecision } from '@reaxuse/math'

const value = { current: 3.1415 }
const result = usePrecision(value, 2) // 3.14

const ceilResult = usePrecision(value, 2, {
  math: 'ceil'
}) // 3.15

const floorResult = usePrecision(value, 3, {
  math: 'floor'
}) // 3.141
```

## Value Forms

`value` accepts a React `State<number>` (resolved through `toValue`); `digits` and `options` stay
`RefOrValue` (plain value or React ref) because they are formatting knobs, not the hook's data input.

```tsx
import { usePrecision } from '@reaxuse/math'

usePrecision(3.1415, 2) // plain number
usePrecision(() => 3.1415, 2) // getter
usePrecision({ current: 3.1415 }, 2) // React ref
usePrecision([value, setValue], 2) // state tuple
usePrecision({ value, onChange: setValue }, 2) // value/onChange pair
```

The `[value, setter]` tuple and `{ value, onChange }` pair are the React state protocol and have no
upstream equivalent (upstream takes `MaybeRefOrGetter`).
