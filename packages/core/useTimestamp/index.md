---
category: Animation
---

# useTimestamp

Reactive current timestamp (`Date.now() + offset`), updating on every animation frame

## Usage

```tsx
import { useTimestamp } from '@reaxuse/core'

const timestamp = useTimestamp({ offset: 0 })
```

```tsx
import { useTimestamp } from '@reaxuse/core'
// ---cut---
const { timestamp, pause, resume } = useTimestamp({ controls: true })
```
