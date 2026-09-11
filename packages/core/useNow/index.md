---
category: Animation
---

# useNow

Reactive current Date instance.

## Usage

```tsx
import { useNow } from '@reause/core'

const now = useNow()
```

```tsx
import { useNow } from '@reause/core'
// ---cut---
const { now, pause, resume } = useNow({ controls: true })
```
