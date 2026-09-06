---
category: Watch
---

# useWatchPausable

Pausable watch — pause and resume a watched value's updates — React port of
VueUse's [`watchPausable`](https://vueuse.org/shared/watchPausable/).

**Mapping:** upstream wraps `watchWithFilter` with `pausableFilter`. This port
keeps those semantics on house primitives: `useWatch` tracks the source across
renders (the effect dependency list replaces Vue's reactive dependency tracking)
and the callback is skipped while the watcher is paused or stopped. Changes made
while paused are dropped — upstream's `pausableFilter` defers nothing, so
`resume()` only re-activates the watcher and never replays or fires by itself;
the first change after resuming fires with the last committed value as
`oldValue`. The source is the caller's own state value and the return is the
upstream `WatchPausableReturn` control object, following the watch-wrapper
convention of issue #263.

## Usage

Watch your own state value; the returned controls carry extra `pause()` and
`resume()` functions to control the callback.

```tsx
import { useWatchPausable } from '@reaxuse/shared'
import { useState } from 'react'

const [value, setValue] = useState('foo')
const { pause, resume } = useWatchPausable(
  value,
  v => console.log(`Changed to ${v}!`),
)

setValue('bar') // logs: Changed to bar!

pause()

setValue('foobar') // (nothing logged — the change is dropped while paused)

resume()

setValue('hello') // logs: Changed to hello!
```

Start paused and fire once on mount with `initialState` / `immediate`:

```tsx
import { useWatchPausable } from '@reaxuse/shared'
import { useState } from 'react'

const [value, setValue] = useState('foo')
const { isActive } = useWatchPausable(
  value,
  v => console.log(`Changed to ${v}!`),
  { initialState: 'paused' },
)
```

### Options

| Option         | Type                   | Default    | Description                                            |
| -------------- | ---------------------- | ---------- | ------------------------------------------------------ |
| `initialState` | `'active' \| 'paused'` | `'active'` | The initial state of the watcher                       |
| `immediate`    | `boolean`              | `false`    | Fire the callback once on mount with the current value |

<DemoContainer name="UseWatchPausable" />

## Type Declarations

```ts
export interface UseWatchPausableOptions {
  initialState?: 'active' | 'paused'
  immediate?: boolean
}

export interface UseWatchPausableReturn {
  pause: () => void
  resume: () => void
  isActive: boolean
  stop: () => void
}

export function useWatchPausable<T>(source: T, callback: UseWatchCallback<T>, options?: UseWatchPausableOptions): UseWatchPausableReturn
```

## Source

- VueUse: [`packages/shared/watchPausable`](https://github.com/vueuse/vueuse/tree/main/packages/shared/watchPausable) — source [`index.ts`](https://github.com/vueuse/vueuse/blob/main/packages/shared/watchPausable/index.ts), tests [`index.test.ts`](https://github.com/vueuse/vueuse/blob/main/packages/shared/watchPausable/index.test.ts) mirrored in [`packages/shared/src/useWatchPausable.test.tsx`](https://github.com/hairyf/reaxuse/blob/main/packages/shared/src/useWatchPausable.test.tsx)
- reaxuse: [`packages/shared/src/useWatchPausable.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/shared/src/useWatchPausable.ts)

<Contributors name="useWatchPausable" />
