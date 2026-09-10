---
category: Array
---

# useArrayEvery

Returns **true** if every element passes the predicate.

## Usage

```tsx
import { useArrayEvery } from '@reaxuse/shared'
import { useState } from 'react'

const [list, setList] = useState([0, 2, 4])
const allEven = useArrayEvery(list, val => val % 2 === 0) // true

setList([0, 2, 5]) // allEven === false on the next render
```

`list` is a plain read-only array: pass the array directly (e.g. from
`useState`), or `ref.current` if you keep it in a ref. The result recomputes on
the render that passes a new array.
