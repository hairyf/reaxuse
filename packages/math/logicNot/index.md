---
category: '@Math'
---

# logicNot

`NOT` condition for values and refs

## Usage

```tsx
import { logicNot } from '@reaxuse/math'

const a = { current: true }

const notA = logicNot(a) // false — re-evaluated on every call
const notZero = logicNot(0) // true
```

## Value Forms

`v` accepts a React `State<any>` and every form is resolved through `toValue`:

```tsx
import { logicNot } from '@reaxuse/math'

logicNot(true) // plain value
logicNot(() => true) // getter
logicNot({ current: true }) // React ref
logicNot([a, setA]) // state tuple
logicNot({ value: a, onChange: setA }) // value/onChange pair
```

The `[value, setter]` tuple and `{ value, onChange }` pair are the React state protocol and have no
upstream equivalent (upstream takes `MaybeRefOrGetter`).
