# useCounter

> Basic counter with utility functions.

Port of VueUse's [`useCounter`](https://vueuse.org/core/useCounter/) to React.

## Usage

```tsx
import { useCounter } from '@reaxuse/shared'

function Example() {
  const { count, inc, dec, set, reset } = useCounter({ min: 0 })
  return (
    <div>
      <span>{count}</span>
      <button onClick={inc}>+</button>
      <button onClick={dec}>-</button>
    </div>
  )
}
```

## Type

```ts
interface UseCounterOptions {
  min?: number
  max?: number
}

function useCounter(initialValue = 0, options?: UseCounterOptions): {
  count: number
  inc: (delta?: number) => void
  dec: (delta?: number) => void
  set: (value: number) => void
  reset: (value?: number) => void
}
```

- `min`/`max` clamp the count; options are kept in a ref so the handlers stay
  referentially stable.

## React Notes

- The returned object is recreated each render; destructure the fields you use
  to avoid unnecessary re-renders.
