---
category: Watch
---

# useWatchIgnorable

Extended watch that lets you ignore particular updates to the source — React port of
VueUse's [`watchIgnorable`](https://vueuse.org/shared/watchIgnorable/).

**Mapping:** upstream watches an external Vue ref and returns `ignoreUpdates(updater)` /
`ignorePrevAsyncUpdates()` / `stop`; in React the hook must be able to count every change
made to the source, so it owns the state instead and returns
`[value, setValue, controls]` (like `useStateWithControl`). Every change made through the
returned `setValue` is counted — the equivalent of upstream's hidden `flush: 'sync'`
shadow watcher — and `ignoreUpdates(updater)` marks the `setValue` calls inside `updater`
as ignored: as long as no other changes follow, the callback is skipped for that batch,
while changes made outside the updater still fire with the latest value. The callback
fires in the effect after commit (upstream `flush: 'pre'` timing); the `flush` and
`eventFilter` options are not ported, and where upstream's `flush: 'sync'` makes
`ignorePrevAsyncUpdates` a no-op, here it always applies.

## Usage

```tsx
import { useWatchIgnorable } from '@reaxuse/shared'

const [value, setValue, { ignoreUpdates }] = useWatchIgnorable(
  'foo',
  v => console.log(`Changed to ${v}!`),
)

setValue('bar') // logs: Changed to bar!

ignoreUpdates(() => {
  setValue('foobar')
}) // (nothing logged)

setValue('hello') // logs: Changed to hello!

ignoreUpdates(() => {
  setValue('ignored')
})
setValue('logged') // logs: Changed to logged!
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

export function useWatchIgnorable<T>(initialValue: T, callback: UseWatchCallback<T>, options?: UseWatchIgnorableOptions): [T, Dispatch<SetStateAction<T>>, UseWatchIgnorableReturn]
```

## Source

- VueUse: [`watchIgnorable`](https://vueuse.org/shared/watchIgnorable/)
- VueUse source: [`packages/shared/watchIgnorable/index.ts`](https://github.com/vueuse/vueuse/blob/main/packages/shared/watchIgnorable/index.ts)
- VueUse tests: [`packages/shared/watchIgnorable/index.test.ts`](https://github.com/vueuse/vueuse/blob/main/packages/shared/watchIgnorable/index.test.ts)
- reaxuse: [`packages/shared/src/useWatchIgnorable.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/shared/src/useWatchIgnorable.ts)

<Contributors name="useWatchIgnorable" />
