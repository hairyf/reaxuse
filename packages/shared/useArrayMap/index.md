---
category: Array
---

# useArrayMap

Reactive `Array.map`

## Usage

```tsx
import { useArrayMap } from '@reaxuse/shared'
import { useState } from 'react'

const [list, setList] = useState([0, 1, 2, 3, 4])
const result = useArrayMap(list, i => i * 2) // [0, 2, 4, 6, 8]

setList(list.slice(0, -1)) // result: [0, 2, 4, 6] on the next render
```

`list` is a plain read-only array: pass the array directly (e.g. from
`useState`), or `ref.current` if you keep it in a ref. The result recomputes on
the render that passes a new array.
