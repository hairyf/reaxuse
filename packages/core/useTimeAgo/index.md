---
category: Time
---

# useTimeAgo

Reactive time ago

## Usage

```tsx
import { useTimeAgo } from '@reaxuse/core'

const timeAgo = useTimeAgo(new Date(2021, 0, 1)) // string, auto-updates over time

// also accepts timestamps and date strings
const fromNumber = useTimeAgo(1633036800000)
const fromString = useTimeAgo('2024-01-01T00:00:00.000Z')

// show the full date when the diff exceeds `max` (unit name or milliseconds)
const cutoff = useTimeAgo(new Date(2021, 0, 1), { max: 'day' })
```
