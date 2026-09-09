---
category: Utilities
---

# isDefined

Non-nullish checking type guard for ref-like objects

## Usage

```tsx
import { isDefined } from '@reaxuse/shared'
import { useRef } from 'react'

const example = useRef(Math.random() ? 'example' : undefined) // RefObject<string | undefined>

if (isDefined(example))
  example.current // string — narrowed by the type guard
```
