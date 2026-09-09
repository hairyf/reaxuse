---
category: Array
---

# useArrayUnique

Reactive `Array.unique`

## Usage

```tsx
import { useArrayUnique } from '@reaxuse/shared'
import { useState } from 'react'

const [list, setList] = useState([0, 2, 2, 4, 4, 4])
const result = useArrayUnique(list)
// result: [0, 2, 4]

setList([0, 2, 4, 6, 6])
// result: [0, 2, 4, 6] on the next render
```
