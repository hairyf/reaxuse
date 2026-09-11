---
category: Utilities
---

# usePrevious

Holds the previous value of a source

## Usage

```tsx
import { usePrevious } from '@reause/core'

const previous = usePrevious(counter) // `undefined` until the first change
// after each change, `previous` is the value the source had before it
```
