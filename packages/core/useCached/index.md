---
category: Utilities
---

# useCached

Cache a value with a custom comparator

## Usage

```tsx
import { useCached } from '@reaxuse/core'
import { useState } from 'react'

interface Data {
  value: number
  extra: number
}

const [source, setSource] = useState<Data>({ value: 42, extra: 0 })
const cached = useCached(source, (newSourceValue, cachedValue) => newSourceValue.value === cachedValue.value)

setSource({ value: 42, extra: 1 })
console.log(cached) // { value: 42, extra: 0 } — only `value` is significant

setSource({ value: 43, extra: 1 })
console.log(cached) // { value: 43, extra: 1 } — significant change, cache follows
```
