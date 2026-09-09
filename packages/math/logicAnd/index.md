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
