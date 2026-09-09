---
category: '@Math'
---

# useSum

Get the sum of an array reactively

## Usage

```tsx
import { useSum } from '@reaxuse/math'

const array = [1, 2, 3, 4]
const sum = useSum(array) // 10
```

```tsx
import { useSum } from '@reaxuse/math'

const [a, setA] = useState(1)
const [b, setB] = useState(3)

const sum = useSum(a, b, 2) // 6
```

## Argument Forms

Every argument accepts a React `State<number>`. The single-array form accepts an
array of `State<number>` elements or a plain `number[]` (so a plain
`useState<number[]>()` tuple works). Every form is resolved through `toValue`:

```tsx
import { useSum } from '@reaxuse/math'

useSum([1, 2, 3]) // array of plain numbers
useSum(1, 2, 3) // variadic plain numbers
useSum([1, { current: 2 }, () => 3]) // array mixing values, refs and getters
useSum([array, setArray]) // state tuple (array form)
useSum({ value: array, onChange: setArray }) // value/onChange pair (array form)
useSum([a, setA], { value: b, onChange: setB }) // variadic state forms
```

The `[value, setter]` tuple and `{ value, onChange }` pair are the React state protocol and have no
upstream equivalent (upstream takes `MaybeRefOrGetter`).

> **Caveat:** `toValue` resolves any 2-element array whose second element is a function as the
> `[value, setter]` tuple form. So `useSum([1, () => 2])` sums only the first element (`1`); pass the
> elements as separate arguments — `useSum(1, () => 2)` — to sum both (`3`).
