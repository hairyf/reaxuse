---
category: Watch
---

# useWatchTriggerable

Watch that can be triggered manually. The callback can be executed immediately
via `trigger`, and particular updates to the source can be ignored via
`ignoreUpdates` — React port of VueUse's
[`watchTriggerable`](https://vueuse.org/shared/useWatchTriggerable/).

**Mapping:** upstream builds on `watchIgnorable` — a hidden `flush: 'sync'`
shadow watcher counts every source modification (`syncCounter`),
`ignoreUpdates` accumulates the changes to skip (`ignoreCounter`), and a
trigger is skipped only when every counted change came from `ignoreUpdates`;
`trigger` calls the callback with the current value wrapped in `ignoreUpdates`
so the manual invocation does not disturb that accounting. React sees the
caller's changes only at commit, so this port composes the same behavior from
house primitives: `useWatch` tracks the caller's own state value across
renders, a one-shot ignore barrier approximates the counters (`ignoreUpdates`
arms it, the next observed change is skipped, and a commit without a source
change disarms it), and `trigger` invokes the callback synchronously with the
current value (old value `undefined`) without arming the barrier. The callback
also receives `onCleanup` — the previously registered cleanup runs before
every new invocation, watch-fired or manual. Per the maintainer-directed
binding (issue #263) the source is the caller's own state value and the return
is the upstream `WatchTriggerableReturn` object shape — the hook holds no
state of its own and does not return an array tuple.

## Usage

```tsx
import { useWatchTriggerable } from '@reaxuse/shared'

const { trigger, ignoreUpdates } = useWatchTriggerable(
  source,
  () => { console.log('changed!') },
)

setSource('next') // fires the callback
ignoreUpdates(() => setSource('reset')) // does not fire the callback
trigger() // fires the callback manually with the current value
```

### Ignoring particular updates

```tsx
import { useWatchTriggerable } from '@reaxuse/shared'

const { ignoreUpdates } = useWatchTriggerable(source, () => {
  console.log('changed!')
})

ignoreUpdates(() => {
  setSource(0) // does not fire the callback
})
```

### Trigger manually

```tsx
import { useWatchTriggerable } from '@reaxuse/shared'

const { trigger } = useWatchTriggerable(source, () => {
  console.log('changed!')
})

// fires the callback with the current value — synchronously at the call
// site, without waiting for React to commit
trigger()
```

Fire the callback once on mount with the current value:

```tsx
import { useWatchTriggerable } from '@reaxuse/shared'

useWatchTriggerable(source, () => console.log('changed!'), { immediate: true })
```

<DemoContainer name="UseWatchTriggerable" />

## Type Declarations

```ts
export type OnCleanup = (cleanupFn: () => void) => void

export type IgnoredUpdater = (updater: () => void) => void

export interface UseWatchTriggerableCallback<V = any, OV = any, R = void> {
  (value: V, oldValue: OV, onCleanup: OnCleanup): R
}

export interface UseWatchTriggerableReturn<R = void> {
  /** Execute the callback immediately with the current source value */
  trigger: () => R
  /** Run updater, ignoring the watch for the source changes it makes */
  ignoreUpdates: IgnoredUpdater
  /** Ignore the source changes made since the last callback fire */
  ignorePrevAsyncUpdates: () => void
  /** Stop watching — further source changes will not fire the callback */
  stop: () => void
}

export interface UseWatchTriggerableOptions {
  /** Fire the callback once on mount with the current value */
  immediate?: boolean
}

export function useWatchTriggerable<T extends any[], R>(source: readonly [...T], callback: UseWatchTriggerableCallback<[...T], [...T] | undefined, R>, options?: UseWatchTriggerableOptions): UseWatchTriggerableReturn<R>
export function useWatchTriggerable<T, R>(source: T, callback: UseWatchTriggerableCallback<T, T | undefined, R>, options?: UseWatchTriggerableOptions): UseWatchTriggerableReturn<R>
```

## Source

- VueUse: [`packages/shared/watchTriggerable`](https://github.com/vueuse/vueuse/tree/main/packages/shared/watchTriggerable) — source [`index.ts`](https://github.com/vueuse/vueuse/blob/main/packages/shared/watchTriggerable/index.ts), tests [`index.test.ts`](https://github.com/vueuse/vueuse/blob/main/packages/shared/watchTriggerable/index.test.ts) mirrored in [`packages/shared/src/useWatchTriggerable.test.tsx`](https://github.com/hairyf/reaxuse/blob/main/packages/shared/src/useWatchTriggerable.test.tsx)
- reaxuse: [`packages/shared/src/useWatchTriggerable.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/shared/src/useWatchTriggerable.ts)

<Contributors name="useWatchTriggerable" />
