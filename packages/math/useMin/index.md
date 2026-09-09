---
category: '@Math'
---

# useMin

Reactive `Math.min`

## Usage

```tsx
import { useMin } from '@reaxuse/math'

const array = { current: [1, 2, 3, 4] }
const min = useMin(array) // 1
```

```tsx
import { useMin } from '@reaxuse/math'

const a = { current: 1 }
const b = { current: 3 }

const min = useMin(a, b, 2) // 1
```

## Argument Forms

Every argument accepts a React `State<number>`. The single-array form accepts an
array of `State<number>` elements or a plain `number[]` (so a plain
`useState<number[]>()` tuple works). Every form is resolved through `toValue`:

```tsx
import { useMin } from '@reaxuse/math'

useMin([1, 2, 3]) // array of plain numbers
useMin(1, 2, 3) // variadic plain numbers
useMin([1, { current: 2 }, () => 3]) // array mixing values, refs and getters
useMin([array, setArray]) // state tuple (array form)
useMin({ value: array, onChange: setArray }) // value/onChange pair (array form)
useMin([a, setA], { value: b, onChange: setB }) // variadic state forms
```

The `[value, setter]` tuple and `{ value, onChange }` pair are the React state protocol and have no
upstream equivalent (upstream takes `MaybeRefOrGetter`).

> **Caveat:** `toValue` resolves any 2-element array whose second element is a function as the
> `[value, setter]` tuple form. So `useMin([5, () => 1])` compares only the first element (`5`); pass
> the elements as separate arguments — `useMin(5, () => 1)` — to compare both (`1`).
