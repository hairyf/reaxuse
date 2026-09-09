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
