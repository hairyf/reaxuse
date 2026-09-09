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
