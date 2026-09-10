---
category: Watch
---

# useWatchOnce

Shorthand for watching value with `{ once: true }`

## Usage

Similar to `useWatch`, but the callback triggers only once — further changes
are ignored. The underlying effect stays alive; only the wrapped callback
stops firing, so the source keeps being tracked without re-invoking it.

```tsx
import { useWatchOnce } from '@reaxuse/shared'

useWatchOnce(source, () => {
  // triggers only once
  console.log('source changed!')
})
```

- `immediate: true` — fire the callback once on mount with the current value;
  the mount call counts as the single fire.
- The return value is `{ stop }` — call `stop()` to ignore further source
  changes before the callback has fired (a no-op afterwards). The full
  `WatchHandle` is otherwise not ported; watching ends when the component
  unmounts.
