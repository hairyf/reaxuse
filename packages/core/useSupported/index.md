---
category: Utilities
---

# useSupported

SSR compatibility `isSupported`

## Usage

```tsx
import { useSupported } from '@reause/core'

const isSupported = useSupported(() => navigator && 'getBattery' in navigator)

if (isSupported) {
  // Battery Status API is available
}
```
