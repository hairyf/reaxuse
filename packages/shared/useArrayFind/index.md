---
category: Array
---

# useArrayFind

Reactive `Array.find`

## Usage

```tsx
import { useArrayFind } from '@reaxuse/shared'

const list = [{ current: 1 }, { current: -1 }, { current: 2 }]
const positive = useArrayFind(list, val => val > 0) // 1

list[0].current = 3 // positive === 3 on the next render
```
