---
category: Array
---

# useArrayDifference

Reactive `Array.difference`

## Usage

```tsx
import { useArrayDifference } from '@reaxuse/shared'

const list = [1, 2, 3, 4, 5]
const otherList = [4, 5, 6]

const diff = useArrayDifference(list, otherList) // [1, 2, 3]

// diff by key
useArrayDifference(people, otherPeople, 'id')

// diff by compare fn, symmetric difference
useArrayDifference(people, otherPeople, (a, b) => a.id === b.id, { symmetric: true })
```
