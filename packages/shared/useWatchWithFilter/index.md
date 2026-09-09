---
category: Watch
---

# useWatchWithFilter

`watch` with additional EventFilter control

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

The filter factories are exported alongside the hook — `debounceFilter(ms)`
and `throttleFilter(ms)` — mirroring upstream's filter semantics:

```tsx
import { debounceFilter, throttleFilter, useWatchWithFilter } from '@reaxuse/shared'

// Debounce: bursts of changes collapse into one call 100ms after the last change,
// forced by maxWait when changes never settle
useWatchWithFilter(input, callback, { eventFilter: debounceFilter(100, { maxWait: 500 }) })

// Throttle: at most one call per 100ms window (leading + trailing edges by default)
useWatchWithFilter(scrollY, callback, { eventFilter: throttleFilter(100) })
```

The `debounceFilter(ms, options)` factory returns a `CancelableEventFilter` carrying `cancel()` / `flush()` /
`isPending` — the hook calls `cancel()` when the watcher is stopped or the component
unmounts, so a pending debounced call never fires afterwards.

`ms` defaults to `200` — upstream requires the delay explicitly. It accepts a
plain number or a React ref, re-read on every
call. The filter instance is captured once on mount — like upstream, where watch
options are evaluated once during setup — so an inline `debounceFilter(300)` is
safe; pass a React ref when the delay must change over
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
- **`once` is not ported:** upstream's `watch` `once` option stops the watcher
  after the first callback — house `useWatch` has no `once`, and the stop
  function returned by this hook covers the same need.
- **`onTrack` / `onTrigger` are not ported:** Vue watch lifecycle callbacks
  (`WatchOnTrack` / `WatchOnTrigger`) have no React equivalent.
- **Promise plumbing:** the house `EventFilter` contract returns `void`, so
  upstream's `rejectOnCancel` has no observable effect and filters carry no promise
  settlement.
- **`throttleFilter` object options form is not ported:** upstream accepts
  `throttleFilter(options)`; the house port takes positional
  `throttleFilter(ms, trailing, leading)` like `useThrottleFn`.
