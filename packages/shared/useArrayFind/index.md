---
category: Array
---

# useArrayFind

Reactive `Array.find`.

## Usage

```tsx
import { useArrayFind } from '@reaxuse/shared'

const list = [1, -1, 2]
const positive = useArrayFind(list, val => val > 0) // 1
```

### Use with reactive array

```tsx
import { useArrayFind } from '@reaxuse/shared'
import { useState } from 'react'

const [list, setList] = useState([-1, -2])
const positive = useArrayFind(list, val => val > 0) // undefined

setList([...list, 1])
// positive: 1 on the next render
```

`list` is a plain read-only array: pass the array directly (e.g. from
`useState`), or `ref.current` if you keep it in a ref. The result recomputes on
the render that passes a new array.
