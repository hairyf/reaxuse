---
category: Time
utils: formatTimeAgo
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

## Non-Reactivity Usage

In case you don't need the reactivity, you can use the `formatTimeAgo` function to get the formatted string instead of a controllable state.

```tsx
import { formatTimeAgo } from '@reaxuse/core'

const timeAgo = formatTimeAgo(new Date(2021, 0, 1)) // string
```
