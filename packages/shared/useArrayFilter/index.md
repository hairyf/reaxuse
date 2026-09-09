---
category: Array
---

# useArrayFilter

Reactive `Array.filter`

## Usage

```tsx
import { useArrayFilter } from '@reaxuse/shared'
import { useState } from 'react'

const [list, setList] = useState([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
const evens = useArrayFilter(list, i => i % 2 === 0) // [0, 2, 4, 6, 8]

setList(list.slice(1)) // evens === [2, 4, 6, 8] on the next render
```
