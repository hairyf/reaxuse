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
const sum = useArrayReduce(list, (prev, item) => prev + item, 0) // 10

setList([...list, 5]) // sum === 15 on the next render
```
