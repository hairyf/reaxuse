---
category: Array
---

# useArrayReduce

Reactive `Array.reduce`.

## Usage

```tsx
import { useArrayReduce } from '@reaxuse/shared'

const sum = useArrayReduce([1, 2, 3], (sum, val) => sum + val) // 6
```

### Use with reactive array

```tsx
import { useArrayReduce } from '@reaxuse/shared'
import { useState } from 'react'

const [list, setList] = useState([1, 2])
const sum = useArrayReduce(list, (sum, val) => sum + val) // 3

setList([...list, 3])
// sum: 6 on the next render
```

### Use with initialValue

```tsx
import { useArrayReduce } from '@reaxuse/shared'
import { useState } from 'react'

const [list, setList] = useState([{ num: 1 }, { num: 2 }])
const sum = useArrayReduce(list, (sum, val) => sum + val.num, 0) // 3

setList([...list, { num: 3 }])
// sum: 6 on the next render
```

`list` holds plain values only: pass a plain array (e.g. from `useState`), not an array of refs and not a getter — upstream's ref-element list input has no React equivalent here. Pass a new array to recompute on the next render.
