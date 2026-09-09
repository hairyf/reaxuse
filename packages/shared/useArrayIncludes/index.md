---
category: Array
---

# useArrayIncludes

Reactive `Array.includes`

## Usage

```tsx
import { useArrayIncludes } from '@reaxuse/shared'
import { useState } from 'react'

const [list, setList] = useState([0, 2, 4])
const includes = useArrayIncludes(list, 2) // true

setList([0, 1, 4]) // includes === false on the next render

const objects = [{ id: 1 }, { id: 2 }]
useArrayIncludes(objects, 2, 'id') // true — compare by key
useArrayIncludes(objects, { id: 2 }, (element, value) => element.id === value.id) // true — comparator function
useArrayIncludes(objects, { id: 1 }, { fromIndex: 1, comparator: (element, value) => element.id === value.id }) // false
```

The `list` and `value` arguments are plain read-only values: pass the array/value
directly (e.g. from `useState`), or `ref.current` if you keep them in a ref. The
result recomputes on the render that passes a new value.
