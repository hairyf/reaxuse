---
category: Array
---

# useArraySome

Reactive `Array.some`

## Usage

```tsx
import { useArraySome } from '@reaxuse/shared'
import { useState } from 'react'

const [list, setList] = useState([0, 2, 4, 6, 8])
const result = useArraySome(list, i => i > 10)
// result: false

setList([...list, 11])
// result: true on the next render
```

`list` holds plain values only: pass a plain array (e.g. from `useState`), not an array of refs and not a getter — upstream's ref-element and reactive-array inputs have no React equivalent here. Pass a new array to recompute on the next render.
