---
category: '@Math'
related: logicAnd, logicNot
---

# logicOr

`OR` conditions for values

## Usage

```tsx
import { logicOr } from '@reause/math'

const either = logicOr(true, false) // true

// call it again after the values change
logicOr(false, 0, '') // false
```

Arguments are plain read-only values (upstream takes `MaybeRefOrGetter<any>[]`). The result is
re-evaluated on every call — there is no reactivity, so re-renders drive re-evaluation.
