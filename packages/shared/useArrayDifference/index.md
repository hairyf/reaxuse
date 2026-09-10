---
category: Array
---

# useArrayDifference

Reactive get array difference of two arrays.

By default, it returns the difference of the first array from the second array, so call `A \ B`, [Relative Complement](<https://en.wikipedia.org/wiki/Complement_(set_theory)>) of B in A.

You can pass the `symmetric` option to get the [Symmetric difference](https://en.wikipedia.org/wiki/Symmetric_difference) of two arrays `A △ B`.

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
