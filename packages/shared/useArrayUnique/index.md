---
category: Array
---

# useArrayUnique

Reactive `Array.unique`

## Usage

```tsx
import { useArrayUnique } from '@reaxuse/shared'
import { useState } from 'react'

const [list, setList] = useState([0, 2, 2, 4, 4, 4])
const result = useArrayUnique(list)
// result: [0, 2, 4]

setList([0, 2, 4, 6, 6])
// result: [0, 2, 4, 6] on the next render
```

### Use with custom function

```tsx
import { useArrayUnique } from '@reaxuse/shared'
import { useState } from 'react'

const [list, setList] = useState([
  { id: 1, name: 'foo' },
  { id: 2, name: 'bar' },
  { id: 1, name: 'baz' },
])

const result = useArrayUnique(list, (a, b) => a.id === b.id)
// result: [{ id: 1, name: 'foo' }, { id: 2, name: 'bar' }]

setList([...list, { id: 1, name: 'qux' }])
// result: [{ id: 1, name: 'foo' }, { id: 2, name: 'bar' }]
```

`list` holds plain values only: pass a plain array (e.g. from `useState`), not an array of refs and not a getter — upstream's ref-element and reactive-array inputs have no React equivalent here. Pass a new array to recompute on the next render.
