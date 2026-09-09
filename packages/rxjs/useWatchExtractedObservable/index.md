---
category: '@RxJS'
---

# useWatchExtractedObservable

Watch the values of an RxJS [`Observable`](https://rxjs.dev/guide/observable) extracted from a source value — React port of VueUse's
[`watchExtractedObservable`](https://vueuse.org/rxjs/watchExtractedObservable/). Whenever the resolved source value changes, the previous
subscription is unsubscribed and `extractor` derives a new `Observable`, whose emissions are forwarded to `callback`.

**Mapping:** upstream watches a Vue `WatchSource` (`MultiWatchSources` / `WatchSource<T>` / reactive object) and returns a `WatchHandle`
function; the React port accepts a plain value or a ref-like `{ current }` object (`RefOrValue`, resolved with `toValue`) and returns
`{ stop }`. Vue's reactive tracking is replaced by `options.deps` plus the resolved value's identity, so an object mutated **in place** does
not re-extract — pass a new identity or list the mutation inputs in `deps`. The extractor signature is `(value, onCleanup)` instead of
upstream's `(value, oldValue, onCleanup)`: React keeps no previous-value tracking, so `oldValue` is dropped. `onError` / `onComplete` keep
upstream's `subscriptionOptions` semantics.

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

## Subscription Options

| Option       | Type                     | Description                                                 |
| ------------ | ------------------------ | ----------------------------------------------------------- |
| `onError`    | `(err: unknown) => void` | Called when the extracted `Observable` errors               |
| `onComplete` | `() => void`             | Called when the extracted `Observable` completes            |
| `deps`       | `unknown[]`              | Extra effect dependencies; replaces Vue's reactive tracking |

## Return Value

The hook returns `{ stop }` — upstream's `WatchHandle`. `stop` is a stable, idempotent callback: it runs the pending `onCleanup` callbacks,
unsubscribes the active subscription, and permanently detaches the hook (later source / `deps` changes no longer subscribe).

## Type Declarations

```ts
export type OnCleanup = (cleanupFn: () => void) => void

export type WatchExtractedObservableExtractor<Value, E> = (
  value: NonNullable<Value>,
  onCleanup: OnCleanup,
) => Observable<E>

export interface UseWatchExtractedObservableOptions {
  deps?: unknown[]
  onError?: (err: unknown) => void
  onComplete?: () => void
}

export interface UseWatchExtractedObservableReturn {
  stop: () => void
}

export function useWatchExtractedObservable<Value, E>(
  value: RefOrValue<Value | null | undefined>,
  extractor: WatchExtractedObservableExtractor<Value, E>,
  callback: (snapshot: E) => void,
  options?: UseWatchExtractedObservableOptions,
): UseWatchExtractedObservableReturn
```

## Source

- VueUse upstream mapping — `source/vueuse/packages/rxjs/watchExtractedObservable/`:
  [`index.ts`](https://github.com/vueuse/vueuse/blob/main/packages/rxjs/watchExtractedObservable/index.ts) (implementation),
  [`index.test.ts`](https://github.com/vueuse/vueuse/blob/main/packages/rxjs/watchExtractedObservable/index.test.ts) (mirrored in `useWatchExtractedObservable.test.tsx`),
  [`demo.vue`](https://github.com/vueuse/vueuse/blob/main/packages/rxjs/watchExtractedObservable/demo.vue) (ported to `demo.tsx`)
- reaxuse: [`packages/rxjs/src/useWatchExtractedObservable.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/rxjs/src/useWatchExtractedObservable.ts) · tests [`packages/rxjs/src/useWatchExtractedObservable.test.tsx`](https://github.com/hairyf/reaxuse/blob/main/packages/rxjs/src/useWatchExtractedObservable.test.tsx) · demo [`packages/rxjs/useWatchExtractedObservable/demo.tsx`](https://github.com/hairyf/reaxuse/blob/main/packages/rxjs/useWatchExtractedObservable/demo.tsx)

<Contributors name="useWatchExtractedObservable" />
