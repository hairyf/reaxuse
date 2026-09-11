---
category: '@Math'
related: logicNot, logicOr
---

# logicAnd

`AND` condition for values

## Usage

```tsx
import { logicAnd } from '@reause/math'

const both = logicAnd(true, false) // false
const all = logicAnd(true, false, 1) // false
const every = logicAnd(true, 1, 'foo') // true
```

Arguments are plain read-only values (upstream takes `MaybeRefOrGetter<any>[]`). The result is
re-evaluated on every call — there is no reactivity, so re-renders drive re-evaluation.
