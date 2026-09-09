---
category: '@Math'
alias: or
related: logicAnd, logicNot
---

# logicOr

`OR` conditions for refs

## Usage

```tsx
import { logicOr } from '@reaxuse/math'

const a = { current: true }
const b = { current: false }

const either = logicOr(a, b) // true

a.current = false
// useLogicOr() again — both args are falsy now
logicOr(a, b) // false
```

## Argument Forms

Every argument accepts a React `State<any>` and is resolved through `toValue`:

```tsx
import { logicOr } from '@reaxuse/math'

logicOr(true, false) // plain values
logicOr(() => true, { current: false }) // getter and React ref
logicOr([a, setA], { value: b, onChange: setB }) // state forms
```

The `[value, setter]` tuple and `{ value, onChange }` pair are the React state protocol and have no
upstream equivalent (upstream takes `MaybeRefOrGetter`).
