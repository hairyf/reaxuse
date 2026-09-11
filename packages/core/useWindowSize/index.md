---
category: Elements
---

# useWindowSize

Reactive window size

## Usage

```tsx
import { useWindowSize } from '@reause/core'

const { width, height } = useWindowSize() // plain numbers, re-render on resize
// SSR renders the Infinity defaults; after mount it tracks the real window size
```
