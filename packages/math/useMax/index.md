---
category: '@Math'
---

# useMax

Reactive `Math.max`

## Usage

```tsx
import { useMax } from '@reaxuse/math'

const array = [1, 2, 3, 4]
const max = useMax(array) // 4
```

```tsx
import { useMax } from '@reaxuse/math'

const [a, setA] = useState(1)
const [b, setB] = useState(3)

const max = useMax(a, b, 2) // 3
```

## Argument Forms

Every argument accepts a React `State<number>`. The single-array form accepts an
array of `State<number>` elements or a plain `number[]` (so a plain
`useState<number[]>()` tuple works). Every form is resolved through `toValue`:

```tsx
import { useMax } from '@reaxuse/math'

useMax([1, 2, 3]) // array of plain numbers
useMax(1, 2, 3) // variadic plain numbers
useMax([1, { current: 2 }, () => 3]) // array mixing values, refs and getters
useMax([array, setArray]) // state tuple (array form)
useMax({ value: array, onChange: setArray }) // value/onChange pair (array form)
useMax([a, setA], { value: b, onChange: setB }) // variadic state forms
```

The `[value, setter]` tuple and `{ value, onChange }` pair are the React state protocol and have no
upstream equivalent (upstream takes `MaybeRefOrGetter`).

> **Caveat:** `toValue` resolves any 2-element array whose second element is a function as the
> `[value, setter]` tuple form. So `useMax([1, () => 2])` compares only the first element (`1`); pass
> the elements as separate arguments — `useMax(1, () => 2)` — to compare both (`2`).
