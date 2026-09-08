---
category: '@RxJS'
---

# toObserver

Sugar function to convert a write sink into an RxJS [Observer](https://rxjs.dev/guide/observer) — React port of VueUse's [`toObserver`](https://vueuse.org/rxjs/toObserver/).

**Mapping:** upstream (`source/vueuse/packages/rxjs/toObserver/index.ts`, 11 LOC) is
`toObserver<T>(value: Ref<T>): NextObserver<T>` and returns `{ next: val => { value.value = val } }`.
Upstream ships **no test file** — the reaxuse test suite is authored here. The reaxuse signature is
`toObserver<T>(target: ObserverTarget<T>): NextObserver<T>` where
`ObserverTarget<T> = { current: T } | ((value: T) => void)`.

**Adjustment for React:** a `useRef` write never schedules a re-render, so a 1:1 mirror accepting only
a Vue-style `Ref` would silently pin consumers to non-rendering state. The port therefore accepts
**either** a ref-like object (`{ current }` — `useRef`'s return value or a `RefObject<T>`), written
through `.current`, **or** a setter function (`(value: T) => void` — the second tuple member of
`useState`, or a `useReducer` dispatch), called directly. Pass a `useState` setter when the UI must
update on each emission; pass a `useRef` when the latest value only needs to be read later. Plain
values are deliberately rejected — the target is a write sink, so writing to a value is meaningless
(`toObserver` never accepts a `RefOrValue`). Everything else keeps the upstream semantics exactly:
the returned observer has **only** `next` (no `error`/`complete`), the write happens synchronously on
each emission, and `toObserver` itself has no side effects.

## Usage

```tsx
import { toObserver } from '@reaxuse/rxjs'
import { useState } from 'react'
import { interval } from 'rxjs'
import { take } from 'rxjs/operators'

// a `useState` setter — the component re-renders on every emission
const [count, setCount] = useState(0)

interval(1000)
  .pipe(take(5))
  .subscribe(toObserver(setCount))
```

Passing a ref-like object writes `.current` without re-rendering:

```tsx
import { toObserver } from '@reaxuse/rxjs'
import { useRef } from 'react'
import { interval } from 'rxjs'
import { take } from 'rxjs/operators'

const count = useRef(0)

interval(1000)
  .pipe(take(5))
  .subscribe(toObserver(count))

count.current // latest emission
```

Equivalent to `.subscribe(val => setCount(val))`.
