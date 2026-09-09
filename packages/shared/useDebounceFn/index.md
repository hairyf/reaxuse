---
category: Utilities
---

# useDebounceFn

Debounce execution of a function

## Usage

```tsx
import { useDebounceFn } from '@reaxuse/shared'

const debouncedFn = useDebounceFn(() => {
  // ...
}, 1000)

debouncedFn()
debouncedFn.cancel()
debouncedFn.flush()
```
