---
category: Component
---

# useMounted

Mounted state in ref

## Usage

```tsx
import { useMounted } from '@reaxuse/core'

const isMounted = useMounted() // boolean
// starts `false`, flips to `true` in a mount effect — stays `false` during SSR/hydration
```
