---
category: '@Math'
---

# useAverage

Get the average of an array reactively

## Usage

```tsx
import { useAverage } from '@reaxuse/math'

const array = [1, 2, 3]
const averageValue = useAverage(array) // 2
```

```tsx
import { useAverage } from '@reaxuse/math'

const [a, setA] = useState(1)
const [b, setB] = useState(3)

const averageValue = useAverage(a, b) // 2
```

## Argument Forms

Every argument accepts a React `State<number>`. The single-array form accepts an
array of `State<number>` elements or a plain `number[]` (so a plain
`useState<number[]>()` tuple works). Every form is resolved through `toValue`:

```tsx
import { useAverage } from '@reaxuse/math'

useAverage([1, 2, 3]) // array of plain numbers
useAverage(1, 2, 3) // variadic plain numbers
useAverage([1, { current: 2 }, () => 3]) // array mixing values, refs and getters
useAverage([array, setArray]) // state tuple (array form)
useAverage({ value: array, onChange: setArray }) // value/onChange pair (array form)
useAverage([a, setA], { value: b, onChange: setB }) // variadic state forms
```

The `[value, setter]` tuple and `{ value, onChange }` pair are the React state protocol and have no
upstream equivalent (upstream takes `MaybeRefOrGetter`).

> **Caveat:** `toValue` resolves any 2-element array whose second element is a function as the
> `[value, setter]` tuple form. So `useAverage([1, () => 2])` averages only the first element (`1`);
> pass the elements as separate arguments — `useAverage(1, () => 2)` — to average both (`1.5`).
