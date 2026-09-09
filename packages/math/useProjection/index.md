---
category: '@Math'
---

# useProjection

Reactive numeric projection from one domain to another

## Usage

```tsx
import { useProjection } from '@reaxuse/math'
import { useState } from 'react'

const [input, setInput] = useState(0)
const projected = useProjection(input, [0, 10], [0, 100])

setInput(5) // projected === 50 on the next render
setInput(10) // projected === 100 on the next render
```

`input` is a plain read-only `number` (upstream takes `MaybeRefOrGetter<number>`); re-render with a
new value and the hook recomputes.

`fromDomain` and `toDomain` stay `RefOrValue<readonly [number, number]>` — a plain tuple or a React
ref — because their value _is_ a 2-element array, which would be ambiguous with a React state tuple:

```tsx
import { useProjection } from '@reaxuse/math'
import { useRef } from 'react'

const from = useRef<readonly [number, number]>([0, 10])
const projected = useProjection(5, from, [0, 100])
```
