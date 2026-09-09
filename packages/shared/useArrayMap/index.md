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

setList(list.slice(0, -1)) // result === [0, 2, 4, 6] on the next render
```
