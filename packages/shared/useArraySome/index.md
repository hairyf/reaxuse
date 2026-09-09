---
category: Array
---

# useArraySome

Reactive `Array.some`

## Usage

```tsx
import { useArraySome } from '@reaxuse/shared'
import { useState } from 'react'

const [list, setList] = useState([0, 2, 4, 6, 8])
const result = useArraySome(list, i => i > 10)
// result: false

setList([...list, 11])
// result: true on the next render
```
