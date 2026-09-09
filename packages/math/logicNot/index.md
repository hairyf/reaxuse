---
category: '@Math'
---

# logicNot

`NOT` condition for values

## Usage

```tsx
import { logicNot } from '@reaxuse/math'

const notTrue = logicNot(true) // false — re-evaluated on every call
const notZero = logicNot(0) // true
```

The argument is a plain read-only value (upstream takes `MaybeRefOrGetter<any>`). The result is
re-evaluated on every call — there is no reactivity, so re-renders drive re-evaluation.
