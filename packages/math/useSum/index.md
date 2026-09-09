---
category: '@Math'
---

# useSum

Get the sum of an array reactively

## Usage

```tsx
import { useSum } from '@reaxuse/math'

const array = [1, 2, 3, 4]
const sum = useSum(array) // 10
```

```tsx
import { useSum } from '@reaxuse/math'

const [a, setA] = useState(1)
const [b, setB] = useState(3)

const sum = useSum(a, b, 2) // 6
```
