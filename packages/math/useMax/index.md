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
