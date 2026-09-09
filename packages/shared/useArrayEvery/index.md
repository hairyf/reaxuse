---
category: Array
---

# useArrayEvery

Reactive `Array.every`

## Usage

```tsx
import { useArrayEvery } from '@reaxuse/shared'

const list = [{ current: 0 }, { current: 2 }, { current: 4 }]
const allEven = useArrayEvery(list, val => val % 2 === 0) // true

list[0].current = 1 // allEven === false on the next render
```
