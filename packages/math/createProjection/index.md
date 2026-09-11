---
category: '@Math'
related: useProjection, createGenericProjection
---

# createProjection

Reactive numeric projection from one domain to another.

## Usage

```tsx
import { createProjection } from '@reause/math'
import { useState } from 'react'

const useProjector = createProjection([0, 10], [0, 100])
const [input, setInput] = useState(0)
const projected = useProjector(input) // 0

setInput(5) // projected === 50 on the next render
setInput(10) // projected === 100 on the next render
```
