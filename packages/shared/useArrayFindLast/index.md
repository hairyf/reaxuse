---
category: Array
---

# useArrayFindLast

Reactive `Array.findLast`

## Usage

```tsx
import { useArrayFindLast } from '@reaxuse/shared'

const list = [{ current: 1 }, { current: -1 }, { current: 2 }]
const positive = useArrayFindLast(list, val => val > 0) // 2

list[2].current = -2 // positive === 1 on the next render
```
