---
category: Watch
---

# useWatchAtMost

Like `useWatch`, but the callback fires at most `count` times

## Usage

Similar to `useWatch` with an extra option `count` which sets the number of
times the callback is triggered. After the count is reached, further changes
are ignored.

```tsx
import { useWatchAtMost } from '@reaxuse/shared'
import { useState } from 'react'

const [num, setNum] = useState(0)

const { count, stop, pause, resume } = useWatchAtMost(
  num,
  () => { console.log('trigger!') }, // triggered at most 3 times
  {
    count: 3, // the number of times triggered
  },
)
```

- `count` — the number of times the callback has fired so far (React state, so reads re-render).
- `stop()` — stop watching before the limit is reached.
- `pause()` / `resume()` — suspend and restore firing; changes made while paused neither fire the callback nor count towards the limit.
- `immediate: true` — fire the callback once on mount with the current value; the mount call counts towards the limit.
- Upstream's other `WatchWithFilterOptions` members (`deep`, `flush`, `onTrack`, `onTrigger`) are not accepted — they are not expressible in React (no reactive graph, no configurable commit), and passing them fails type checking.
