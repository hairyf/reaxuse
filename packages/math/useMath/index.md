---
category: '@Math'
---

# useMath

Reactive `Math` methods.

## Usage

```tsx
import { useMath } from '@reause/math'
import { useState } from 'react'

const [base, setBase] = useState(2)
const [exponent, setExponent] = useState(3)
const result = useMath('pow', base, exponent) // 8

const [num, setNum] = useState(2)
const root = useMath('sqrt', num) // 1.4142135623730951

setNum(4) // triggers a re-render
// root === 2
```

Arguments are plain read-only numbers (upstream takes `MaybeRefOrGetter`):

```tsx
import { useMath } from '@reause/math'

const power = useMath('pow', 2, 3) // 8
const root = useMath('sqrt', 4) // 2
const rounded = useMath('round', 2.5) // 3
```
