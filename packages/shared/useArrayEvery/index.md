---
category: Array
---

# useArrayEvery

Reactive `Array.every`

## Usage

### Use with array of multiple refs

```tsx
import { useArrayEvery } from '@reaxuse/shared'
import { useState } from 'react'

const [item1, setItem1] = useState(0)
const [item2, setItem2] = useState(2)
const [item3, setItem3] = useState(4)
const [item4, setItem4] = useState(6)
const [item5, setItem5] = useState(8)
const list = [item1, item2, item3, item4, item5]
const result = useArrayEvery(list, i => i % 2 === 0) // true

setItem1(1)
// result: false on the next render
```

### Use with reactive array

```tsx
import { useArrayEvery } from '@reaxuse/shared'
import { useState } from 'react'

const [list, setList] = useState([0, 2, 4, 6, 8])
const result = useArrayEvery(list, i => i % 2 === 0) // true

setList([...list, 9])
// result: false on the next render
```

`list` is a plain read-only array: pass the array directly (e.g. from
`useState`), or `ref.current` if you keep it in a ref. The result recomputes on
the render that passes a new array.
