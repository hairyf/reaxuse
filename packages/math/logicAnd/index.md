---
category: '@Math'
---

# logicAnd

`AND` condition for values and refs

## Usage

```tsx
import { logicAnd } from '@reaxuse/math'

const a = { current: true }
const b = { current: false }

const both = logicAnd(a, b) // false
const all = logicAnd(true, false, 1) // false
```

## Argument Forms

Every argument accepts a React `State<any>` and is resolved through `toValue`:

```tsx
import { logicAnd } from '@reaxuse/math'

logicAnd(true, 1) // plain values
logicAnd(() => true, { current: 1 }) // getter and React ref
logicAnd([a, setA], { value: b, onChange: setB }) // state forms
```

The `[value, setter]` tuple and `{ value, onChange }` pair are the React state protocol and have no
upstream equivalent (upstream takes `MaybeRefOrGetter`).
