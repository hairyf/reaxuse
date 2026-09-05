---
category: Watch
---

# useWatchWithFilter

`watch` with additional EventFilter control — React port of VueUse's
[`watchWithFilter`](https://vueuse.org/shared/watchWithFilter/).

**Mapping:** upstream builds `watch(source, createFilterWrapper(eventFilter, cb))` —
the event filter wraps the watch trigger. This port builds the same wrapper on the
house `useWatch` (the effect dependency list replaces Vue's reactive dependency
tracking): every source change hands the latest `(value, oldValue)` pair to the
captured filter, which decides whether and when the callback runs. It returns a
`stop` function (upstream's `WatchHandle`, reduced to the stop capability) — after
`stop()`, further source changes and pending filtered invocations no longer fire
the callback.

## Usage

Similar to `useWatch`, but with an `eventFilter` option that controls if events
should be received:

```tsx
import { useWatchWithFilter } from '@reaxuse/shared'

useWatchWithFilter(
  input,
  () => { console.log('changed!') },
)
```

### Options

| Option        | Type          | Default                  | Description                                                             |
| ------------- | ------------- | ------------------------ | ----------------------------------------------------------------------- |
| `eventFilter` | `EventFilter` | bypass (invoke directly) | Filter for if events should be received (captured on mount)             |
| `immediate`   | `boolean`     | `false`                  | Fire the callback once on mount with the current value (still filtered) |

### Event Filters

The filter factories are exported alongside the hook, mirroring upstream's
`debounceFilter` / `throttleFilter` semantics:

```tsx
import { debounceFilter, throttleFilter, useWatchWithFilter } from '@reaxuse/shared'

// Debounce: bursts of changes collapse into one call 100ms after the last change,
// forced by maxWait when changes never settle
useWatchWithFilter(input, callback, { eventFilter: debounceFilter(100, { maxWait: 500 }) })

// Throttle: at most one call per 100ms window (leading + trailing edges by default)
useWatchWithFilter(scrollY, callback, { eventFilter: throttleFilter(100) })
```

`debounceFilter` returns a `CancelableEventFilter` carrying `cancel()` / `flush()` /
`isPending` — the hook calls `cancel()` when the watcher is stopped or the component
unmounts, so a pending debounced call never fires afterwards.

`ms` accepts a plain number, a ref-like `{ current }` or a getter (re-read on every
call). The filter instance is captured once on mount — like upstream, where watch
options are evaluated once during setup — so an inline `debounceFilter(300)` is
safe; pass a getter (`debounceFilter(() => ms)`) when the delay must change over
time.

### Stopping the watcher

```tsx
import { debounceFilter, useWatchWithFilter } from '@reaxuse/shared'

const stop = useWatchWithFilter(source, callback, { eventFilter: debounceFilter(100) })

// further changes — and any pending filtered invocation — won't fire the callback
stop()
```

Fire the callback once on mount with the current value (still filtered):

```tsx
import { useWatchWithFilter } from '@reaxuse/shared'

useWatchWithFilter(input, () => console.log('changed!'), { immediate: true })
```

### Divergences from upstream

- **React batching:** source changes made in the same tick collapse into a single
  effect run, so the filter sees one trigger where Vue's watcher would fire per
  mutation. For a trailing filter the collapsed call is identical (the latest
  `(value, oldValue)` pair); a leading-edge filter fires at most once per tick.
- **`deep` is not ported:** React values are not deeply reactive — the source is
  tracked by reference across renders (the effect dependency list), so mutating an
  object in place is invisible and `deep: true` would have nothing to recurse into.
  Watch a derived primitive (or key) instead. The same applies to `flush`: React
  effects always run after the commit, there is no pre/post/sync choice.
- **Promise plumbing:** the house `EventFilter` contract returns `void`, so
  upstream's `rejectOnCancel` has no observable effect and filters carry no promise
  settlement.

<DemoContainer name="UseWatchWithFilter" />

## Type Declarations

```ts
export type EventFilter = (invoke: FunctionArgs) => void

export interface CancelableEventFilter extends EventFilter {
  cancel: () => void
  flush: () => void
  readonly isPending: boolean
}

export interface UseWatchWithFilterOptions {
  eventFilter?: EventFilter
  immediate?: boolean
}

export type UseWatchWithFilterReturn = () => void

export function useWatchWithFilter<T extends any[]>(source: readonly [...T], callback: UseWatchCallback<[...T]>, options?: UseWatchWithFilterOptions): UseWatchWithFilterReturn
export function useWatchWithFilter<T>(source: T, callback: UseWatchCallback<T>, options?: UseWatchWithFilterOptions): UseWatchWithFilterReturn

export function debounceFilter(ms?: MaybeRef<number> | (() => number), options?: DebounceFilterOptions): CancelableEventFilter
export function throttleFilter(ms?: MaybeRef<number> | (() => number), trailing?: boolean, leading?: boolean): EventFilter
```

## Source

- VueUse: [`packages/shared/watchWithFilter`](https://github.com/vueuse/vueuse/tree/main/packages/shared/watchWithFilter) — source [`index.ts`](https://github.com/vueuse/vueuse/blob/main/packages/shared/watchWithFilter/index.ts) (no upstream tests)
- reaxuse: [`packages/shared/src/useWatchWithFilter.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/shared/src/useWatchWithFilter.ts), tests in [`packages/shared/src/useWatchWithFilter.test.tsx`](https://github.com/hairyf/reaxuse/blob/main/packages/shared/src/useWatchWithFilter.test.tsx)

<Contributors name="useWatchWithFilter" />
