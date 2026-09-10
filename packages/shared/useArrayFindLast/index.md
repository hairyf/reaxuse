---
category: Array
---

# useArrayFindLast

`Array.findLast`

## Usage

```tsx
import { useArrayFindLast } from '@reaxuse/shared'
import { useState } from 'react'

const [list, setList] = useState([1, -1, 2])
const positive = useArrayFindLast(list, val => val > 0) // 2

setList([1, -1, -2]) // positive === 1 on the next render
```

`list` is a plain read-only array: pass the array directly (e.g. from
`useState`), or `ref.current` if you keep it in a ref. The result recomputes on
the render that passes a new array.

### Use with a state array

```tsx
import { useArrayFindLast } from '@reaxuse/shared'
import { useState } from 'react'

const [list, setList] = useState([-1, -2])
const positive = useArrayFindLast(list, val => val > 0) // undefined

setList([...list, 10]) // positive === 10 on the next render
setList([...list, 5]) // positive === 5 on the next render
```
