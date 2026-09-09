---
category: '@RxJS'
---

# useWatchExtractedObservable

Watch the values of an RxJS [`Observable`](https://rxjs.dev/guide/observable) extracted from a source value

## Install

```bash
npm i rxjs
```

## Usage

```tsx
import type { Observable } from 'rxjs'
import { useWatchExtractedObservable } from '@reaxuse/rxjs'
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

or passing a ref-like object to it, the subscription follows the source's changes.

```tsx
import type { Observable } from 'rxjs'
import { useWatchExtractedObservable } from '@reaxuse/rxjs'
import { useRef, useState } from 'react'

const player = useRef<Player | null>(null)
const [progress, setProgress] = useState(0)

// nothing is subscribed until `player.current` becomes non-nullish
useWatchExtractedObservable(player, p => p.progress$, setProgress)
```

A `null` / `undefined` resolved value subscribes to nothing and drops any previous subscription. Register per-run cleanup callbacks through
the extractor's second argument; they run before the next subscription is created and on unmount / `stop()`.

```tsx
useWatchExtractedObservable(player, (p, onCleanup) => {
  const socket = p.openSocket()
  onCleanup(() => socket.close())
  return socket.messages$
}, setProgress)
```

## Source Forms

`value` is a read-only value source and takes a plain `Value | null | undefined` (upstream:
`T | WatchSource<T>`). Resolve a React ref or state value at the call site; the effect re-runs when
the value's identity changes or when `deps` change:

```tsx
const [player, setPlayer] = useState<AudioPlayer | null>(null)

useWatchExtractedObservable(player, p => p.progress$, cb)
useWatchExtractedObservable(playerRef.current, p => p.progress$, cb) // resolve a ref yourself
```

## Subscription Options

| Option       | Type                     | Description                                                 |
| ------------ | ------------------------ | ----------------------------------------------------------- |
| `onError`    | `(err: unknown) => void` | Called when the extracted `Observable` errors               |
| `onComplete` | `() => void`             | Called when the extracted `Observable` completes            |
| `deps`       | `unknown[]`              | Extra effect dependencies; replaces Vue's reactive tracking |

## Return Value

The hook returns `{ stop }` — upstream's `WatchHandle`. `stop` is a stable, idempotent callback: it runs the pending `onCleanup` callbacks,
unsubscribes the active subscription, and permanently detaches the hook (later source / `deps` changes no longer subscribe).
