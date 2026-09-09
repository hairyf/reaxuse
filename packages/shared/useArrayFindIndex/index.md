---
category: Array
---

# useArrayFindIndex

Reactive `Array.findIndex`

## Usage

```tsx
import { useArrayFindIndex } from '@reaxuse/shared'
import { useState } from 'react'

const [list, setList] = useState([0, 2, 4, 6, 8])

const result = useArrayFindIndex(list, i => i % 2 === 0) // 0

setList([1, 3, 5, 7, 9]) // result === -1 on the next render
```
