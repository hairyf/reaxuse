---
category: Array
---

# useArrayDifference

Reactive get array difference of two arrays.

By default, it returns the difference of the first array from the second array, so call `A \ B`, [Relative Complement](<https://en.wikipedia.org/wiki/Complement_(set_theory)>) of B in A.

You can pass the `symmetric` option to get the [Symmetric difference](https://en.wikipedia.org/wiki/Symmetric_difference) of two arrays `A △ B`.

## Usage

### Use with reactive array

```tsx
import { useArrayDifference } from '@reause/shared'
import { useState } from 'react'

const [list1, setList1] = useState([0, 1, 2, 3, 4, 5])
const [list2, setList2] = useState([4, 5, 6])
const result = useArrayDifference(list1, list2)
// result: [0, 1, 2, 3]

setList2([0, 1, 2])
// result: [3, 4, 5] on the next render
```

### Use with reactive array and use function comparison

```tsx
import { useArrayDifference } from '@reause/shared'
import { useState } from 'react'

const [list1, setList1] = useState([{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }])
const [list2, setList2] = useState([{ id: 4 }, { id: 5 }, { id: 6 }])

const result = useArrayDifference(list1, list2, (value, othVal) => value.id === othVal.id)
// result: [{ id: 1 }, { id: 2 }, { id: 3 }]
```

### Symmetric Difference

This hook also supports [Symmetric difference](https://en.wikipedia.org/wiki/Symmetric_difference) by passing the `symmetric` option.

```tsx {10}
import { useArrayDifference } from '@reause/shared'
import { useState } from 'react'

const [list1, setList1] = useState([{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }])
const [list2, setList2] = useState([{ id: 4 }, { id: 5 }, { id: 6 }])

const result = useArrayDifference(
  list1,
  list2,
  (value, othVal) => value.id === othVal.id,
  { symmetric: true }
)
// result: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 6 }]
```
