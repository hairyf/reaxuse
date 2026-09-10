---
category: '@RxJS'
---

# useSubscription

Use an RxJS [`Subscription`](https://rxjs.dev/guide/subscription) without worrying about unsubscribing from it or creating memory leaks.

## Install

```bash
npm i rxjs
```

## Usage

```tsx
import { useSubscription } from '@reaxuse/rxjs'
import { useState } from 'react'
import { interval } from 'rxjs'

export function Counter() {
  const [count, setCount] = useState(0)

  // useSubscription calls the unsubscribe method before unmounting the component
  useSubscription(
    interval(1000)
      .subscribe(() => {
        setCount(c => c + 1)
      }),
  )

  return (
    <p>
      Counter:
      {count}
    </p>
  )
}
```

The subscription is torn down in the effect cleanup when the component unmounts, so the call site never needs its own `unsubscribe`. Like `useObservable`, the `subscription` argument is not an effect dependency: a new identity on a later render does not re-subscribe. Create the subscription once — with `useState`'s lazy initializer, `useRef`, or a module-scope value — when the component re-renders.
