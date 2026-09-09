---
category: Array
---

# useArrayIncludes

Reactive `Array.includes`

## Usage

```tsx
import { useArrayIncludes } from '@reaxuse/shared'

const list = [{ current: 0 }, { current: 2 }, { current: 4 }]
const includes = useArrayIncludes(list, 2) // true

list[0].current = 1 // includes === false on the next render

const objects = [{ id: 1 }, { id: 2 }]
useArrayIncludes(objects, 2, 'id') // true — compare by key
useArrayIncludes(objects, { id: 2 }, (element, value) => element.id === value.id) // true — comparator function
useArrayIncludes(objects, { id: 1 }, { fromIndex: 1, comparator: (element, value) => element.id === value.id }) // false
```
