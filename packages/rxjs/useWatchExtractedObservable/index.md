---
category: '@RxJS'
---

# useWatchExtractedObservable

Watch the values of an RxJS [`Observable`](https://rxjs.dev/guide/observable) as extracted from one or more hooks.

Automatically unsubscribe on observable change, and automatically unsubscribe from it when the component is unmounted.

## Usage

```tsx
import type { Observable } from 'rxjs'
import { useWatchExtractedObservable } from '@reause/rxjs'
import { useState } from 'react'
import { Subject } from 'rxjs'

interface Player {
  progress$: Observable<number>
}

export function PlayerProgress() {
  const [player] = useState<Player>(() => ({ progress$: new Subject<number>() }))
  const [progress, setProgress] = useState(0)

  const { stop } = useWatchExtractedObservable(player, p => p.progress$, setProgress)

  return (
    <div>
      <p>{progress}</p>
      <button onClick={() => stop()}>Stop watching</button>
    </div>
  )
}
```

If you want to add custom error handling to an `Observable` that might error, you can supply an optional `onError` configuration. Without this, RxJS will treat any error in the supplied `Observable` as an "unhandled error" and it will be thrown in a new call stack and reported to `window.onerror` (or `process.on('error')` if you happen to be in Node).

You can also supply an optional `onComplete` configuration if you need to attach special behavior when the watched observable completes.

```tsx
useWatchExtractedObservable(player, p => p.progress$, setProgress, {
  onError: (err: unknown) => {
    console.error(err)
  },
  onComplete: () => {
    setProgress(100) // or 0, or whatever
  },
})
```

## Subscription Options

| Option       | Type                     | Description                          |
| ------------ | ------------------------ | ------------------------------------ |
| `onError`    | `(err: unknown) => void` | Error handler for Observable errors  |
| `onComplete` | `() => void`             | Called when the Observable completes |

## Return Value

Returns a `WatchHandle` that can be used to stop watching:

```tsx
const { stop } = useWatchExtractedObservable(player, p => p.progress$, setProgress)

// Later, stop watching
stop()
```
