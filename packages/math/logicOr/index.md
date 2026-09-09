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
