---
category: State
---

# useCounter

A basic counter with `inc` / `dec` / `set` / `reset` and optional `min` / `max` bounds —
React port of VueUse's [`useCounter`](https://vueuse.org/shared/useCounter/).

**Mapping:** `ref(initialValue)` → `useState`; mutation functions become stable `useCallback`s;
options are kept in refs so callbacks stay stable.

## Usage

```tsx
import { useCounter } from '@reaxuse/core'

const { count, inc, dec, set, reset } = useCounter(0, { min: 0, max: 10 })

inc()    // +1
inc(5)   // +5
dec()    // -1
set(3)   // = 3 (clamped to [min, max])
reset()  // back to initialValue
```

<DemoContainer name="UseCounter" />

## Type Declarations

```ts
export interface UseCounterOptions {
  min?: number
  max?: number
}

export interface UseCounterReturn {
  count: number
  inc: (delta?: number) => void
  dec: (delta?: number) => void
  set: (value: number) => void
  reset: () => void
}

export function useCounter(
  initialValue?: number,
  options?: UseCounterOptions,
): UseCounterReturn
```

## Source

- VueUse: [`packages/shared/useCounter`](https://github.com/vueuse/vueuse/tree/main/packages/shared/useCounter)
- reaxuse: [`packages/core/src/useCounter.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/core/src/useCounter.ts)
