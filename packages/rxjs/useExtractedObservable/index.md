---
category: '@RxJS'
---

# useExtractedObservable

Use an RxJS [`Observable`](https://rxjs.dev/guide/observable) as extracted from one or more hooks, return the latest emitted value, and automatically unsubscribe from it when the component is unmounted.

Automatically unsubscribe on observable change, and automatically unsubscribe from it when the component is unmounted.

The source is a plain value, so the extractor re-runs when its identity changes; `deps` covers a source that is mutated in place.

## Install

```bash
npm i rxjs
```

## Usage

```tsx
import { useExtractedObservable } from '@reaxuse/rxjs'
import { useState } from 'react'
import { interval } from 'rxjs'
import { mapTo, scan, startWith } from 'rxjs/operators'

export function Counter() {
  const [start, setStart] = useState(0)

  const count = useExtractedObservable(start, start => interval(1000).pipe(
    mapTo(1),
    startWith(start),
    scan((total, next) => next + total),
  ))

  return (
    <div>
      <p>
        Counter:
        {count}
      </p>
      <button onClick={() => setStart(0)}>Restart from 0</button>
    </div>
  )
}
```

The subscription is created in an effect: it is unsubscribed whenever the source value changes, and on unmount. Upstream's `watch` options have no React equivalent — the extractor always runs on mount (upstream's `immediate: true` default), and a source object mutated in place is re-extracted by listing the mutation inputs in `deps`:

```tsx
import { useExtractedObservable } from '@reaxuse/rxjs'
import { useState } from 'react'
import { of } from 'rxjs'

const [filters, setFilters] = useState({ status: 'open', limit: 10 })

const label = useExtractedObservable(
  filters,
  filters => of(`${filters.status}: ${filters.limit}`),
  { deps: [filters.status, filters.limit] },
)
```

If you want to add custom error handling to an `Observable` that might error, you can supply an optional `onError` configuration. Without this, RxJS will treat any error in the supplied `Observable` as an "unhandled error" and it will be thrown in a new call stack and reported to `window.onerror` (or `process.on('error')` if you happen to be in Node).

```tsx
import { useExtractedObservable } from '@reaxuse/rxjs'
import { useState } from 'react'
import { interval } from 'rxjs'
import { mapTo, scan, startWith, tap } from 'rxjs/operators'

const [start, setStart] = useState(0)

const count = useExtractedObservable(
  start,
  (start) => {
    return interval(1000).pipe(
      mapTo(1),
      startWith(start),
      scan((total, next) => next + total),
      tap((n) => {
        if (n === 10)
          throw new Error('oops')
      }),
    )
  },
  {
    onError: (err: unknown) => {
      console.log(err) // Error: oops
    },
  },
)
```

You can also supply an optional `onComplete` configuration if you need to attach special behavior when the watched observable completes.

```tsx
import { useExtractedObservable } from '@reaxuse/rxjs'
import { useState } from 'react'
import { interval } from 'rxjs'
import { mapTo, scan, startWith, takeWhile } from 'rxjs/operators'

const [start, setStart] = useState(0)

const count = useExtractedObservable(
  start,
  (start) => {
    return interval(1000).pipe(
      mapTo(1),
      startWith(start),
      scan((total, next) => next + total),
      takeWhile(num => num < 10),
    )
  },
  {
    initialValue: 0,
    onComplete: () => {
      console.log('Done!')
    },
  },
)
```

## Options

| Option         | Type                     | Description                              |
| -------------- | ------------------------ | ---------------------------------------- |
| `initialValue` | `T`                      | Value to use before the Observable emits |
| `onError`      | `(err: unknown) => void` | Error handler for Observable errors      |
| `onComplete`   | `() => void`             | Called when the Observable completes     |
| `deps`         | `unknown[]`              | Extra dependencies that re-extract       |

## Return Value

Returns the latest value emitted by the extracted Observable — a plain value instead of upstream's readonly `ShallowRef`:

```tsx
const count = useExtractedObservable(start, start => interval(1000).pipe(
  startWith(start),
  scan((total, next) => next + total),
))

// `undefined` until the first emission, unless `initialValue` was provided
console.log(count)
```
