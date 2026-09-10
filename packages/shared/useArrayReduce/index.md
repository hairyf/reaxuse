---
category: Array
---

# useArrayReduce

Reactive `Array.reduce`

## Usage

```tsx
import { useArrayReduce } from '@reaxuse/shared'
import { useState } from 'react'

const [list, setList] = useState([1, 2, 3, 4])
const sum = useArrayReduce(list, (prev, item) => prev + item) // 10

setList([...list, 5]) // sum === 15 on the next render
```

### Use with initialValue

```tsx
import { useArrayReduce } from '@reaxuse/shared'
import { useState } from 'react'

const [list, setList] = useState([{ num: 1 }, { num: 2 }])
const sum = useArrayReduce(list, (sum, val) => sum + val.num, 0) // 3

setList([...list, { num: 3 }]) // sum === 6 on the next render
```

`list` holds plain values only: pass a plain array (e.g. from `useState`), not an array of refs and not a getter — upstream's ref-element list input has no React equivalent here. Pass a new array to recompute on the next render.
