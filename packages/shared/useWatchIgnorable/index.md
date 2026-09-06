---
category: Watch
---

# useWatchIgnorable

Extended watch that returns `ignoreUpdates(updater)` / `ignorePrevAsyncUpdates()` / `stop`
to ignore particular updates to the source — React port of VueUse's
[`watchIgnorable`](https://vueuse.org/shared/watchIgnorable/).

**Mapping:** the API follows the maintainer-directed adjustment of issue #263 — the
source is the caller's own state value (house `useWatch` source convention) and the
return is the upstream `WatchIgnorableReturn` object shape. Upstream counts every source
modification with a hidden `flush: 'sync'` shadow watcher and skips a trigger only when
every counted change came from `ignoreUpdates`; React offers no way to observe — let
alone intercept — the caller's `setSource` (changes only become visible at the next
commit, where automatic batching has already collapsed consecutive updates into a single
render), so the port approximates the counters with a one-shot "ignore barrier":
`ignoreUpdates(updater)` snapshots the latest observed value, runs `updater`
synchronously and arms the barrier; the next change the watch observes is skipped and
the flag is consumed either way, so later genuine changes fire again.
`ignorePrevAsyncUpdates()` arms the same barrier for the changes queued before the call.

React-batching deviations: changes made inside `ignoreUpdates` and further changes made
afterwards in the same synchronous batch collapse into one render, which the barrier
skips as a whole (upstream would fire the trigger with the latest value) — let the
updater's batch commit before making changes that must fire. The `flush` and
`eventFilter` options are not ported (the callback fires in the effect after commit,
upstream `flush: 'pre'` timing), and where upstream's `flush: 'sync'` makes
`ignorePrevAsyncUpdates` a no-op, here it always applies.

## Usage

```tsx
import { useWatchIgnorable } from '@reaxuse/shared'

const [source, setSource] = useState('foo')

const { stop, ignoreUpdates } = useWatchIgnorable(
  source,
  v => console.log(`Changed to ${v}!`),
)

setSource('bar') // logs: Changed to bar!

ignoreUpdates(() => {
  setSource('foobar')
}) // (nothing logged)

setSource('hello') // logs: Changed to hello!

ignoreUpdates(() => {
  setSource('ignored')
})
setSource('logged') // logs: Changed to logged!
```

`ignorePrevAsyncUpdates()` ignores the changes made since the last time the callback
fired — as long as no other changes follow:

```tsx
const { ignorePrevAsyncUpdates } = useWatchIgnorable(
  source,
  v => console.log(`Changed to ${v}!`),
)

setSource('good')
setSource('by')
ignorePrevAsyncUpdates() // (nothing logged for 'by')

setSource('prev')
ignorePrevAsyncUpdates()
setSource('after') // logs: Changed to after!
```

<DemoContainer name="UseWatchIgnorable" />

## Type Declarations

```ts
export type IgnoredUpdater = (updater: () => void) => void

export type IgnoredPrevAsyncUpdates = () => void

export interface UseWatchIgnorableOptions {
  immediate?: boolean
}

export interface UseWatchIgnorableReturn {
  ignoreUpdates: IgnoredUpdater
  ignorePrevAsyncUpdates: IgnoredPrevAsyncUpdates
  stop: () => void
}

export function useWatchIgnorable<T extends any[]>(source: readonly [...T], callback: UseWatchCallback<[...T]>, options?: UseWatchIgnorableOptions): UseWatchIgnorableReturn
export function useWatchIgnorable<T>(source: T, callback: UseWatchCallback<T>, options?: UseWatchIgnorableOptions): UseWatchIgnorableReturn
```

## Source

- VueUse: [`watchIgnorable`](https://vueuse.org/shared/watchIgnorable/)
- VueUse source: [`packages/shared/watchIgnorable/index.ts`](https://github.com/vueuse/vueuse/blob/main/packages/shared/watchIgnorable/index.ts)
- VueUse tests: [`packages/shared/watchIgnorable/index.test.ts`](https://github.com/vueuse/vueuse/blob/main/packages/shared/watchIgnorable/index.test.ts)
- reaxuse: [`packages/shared/src/useWatchIgnorable.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/shared/src/useWatchIgnorable.ts)

<Contributors name="useWatchIgnorable" />
