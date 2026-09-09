---
category: Array
---

# useArrayJoin

Reactive `Array.join`

## Usage

```tsx
import { useArrayJoin } from '@reaxuse/shared'
import { useState } from 'react'

const [list, setList] = useState(['foo', 0, { prop: 'val' }])

const result = useArrayJoin(list, '--') // 'foo--0--[object Object]'

setList([...list, 'bar']) // result === 'foo--0--[object Object]--bar' on the next render
```
