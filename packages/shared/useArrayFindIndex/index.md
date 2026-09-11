---
category: Array
---

# useArrayFindIndex

Reactive `Array.findIndex`

## Usage

### Use with array of multiple refs

```tsx
import { useArrayFindIndex } from '@reause/shared'
import { useState } from 'react'

const [item1, setItem1] = useState(0)
const [item2, setItem2] = useState(2)
const [item3, setItem3] = useState(4)
const [item4, setItem4] = useState(6)
const [item5, setItem5] = useState(8)
const list = [item1, item2, item3, item4, item5]
const result = useArrayFindIndex(list, i => i % 2 === 0) // 0

setItem1(1)
// result: 1 on the next render
```

### Use with reactive array

```tsx
import { useArrayFindIndex } from '@reause/shared'
import { useState } from 'react'

const [list, setList] = useState([0, 2, 4, 6, 8])
const result = useArrayFindIndex(list, i => i % 2 === 0) // 0

setList([-1, ...list])
// result: 1 on the next render
```
