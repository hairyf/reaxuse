---
category: '@Math'
---

# useMath

Reactive `Math` methods

## Usage

```tsx
import { useMath } from '@reaxuse/math'
import { useState } from 'react'

const [base, setBase] = useState(2)
const [exponent, setExponent] = useState(3)
const result = useMath('pow', base, exponent) // 8

const [num, setNum] = useState(2)
const root = useMath('sqrt', num) // 1.4142135623730951

setNum(4) // triggers a re-render
// root === 2
```

Plain values and React refs are both accepted:

```tsx
import { useMath } from '@reaxuse/math'

const power = useMath('pow', 2, 3) // 8

const base = { current: 2 }
const exponent = { current: 3 }
const refPower = useMath('pow', base, exponent) // 8

const rounded = useMath('round', { current: 2.5 }) // 3
```
