---
category: '@Math'
---

# useProjection

Reactive numeric projection from one domain to another

## Usage

```tsx
import { useProjection } from '@reaxuse/math'

const input = { current: 0 }
const projected = useProjection(input, [0, 10], [0, 100])

input.current = 5 // projected === 50 on the next render
input.current = 10 // projected === 100 on the next render
```
