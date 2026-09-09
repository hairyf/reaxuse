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
