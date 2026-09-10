---
category: Array
---

# useArrayJoin

`Array.join`

## Usage

```tsx
import { useArrayJoin } from '@reaxuse/shared'
import { useState } from 'react'

const [list, setList] = useState(['foo', 0, { prop: 'val' }])

const result = useArrayJoin(list, '--') // 'foo--0--[object Object]'

setList([...list, 'bar']) // result === 'foo--0--[object Object]--bar' on the next render
```

`list` holds plain values only: the elements are joined with
`Array.prototype.join` (no per-element unwrap — a function element would be
stringified to its source instead of invoked). Pass the array directly (e.g.
from `useState`); the result recomputes on the render that passes a new array.
