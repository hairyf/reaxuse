---
category: Watch
---

# useWatchDeep

Shorthand for watching a value with `{ deep: true }` — invokes the callback only when the
value differs **deeply** from the previous one — React port of VueUse's
[`watchDeep`](https://vueuse.org/shared/watchDeep/).

**Mapping:** Vue's deep watcher traverses reactive proxies and fires on in-place mutation
of any nested property. React state is immutable — a nested change always arrives as a new
top-level value — so `useWatchDeep` builds on `useWatch` and deep-compares the newly
rendered value against the previous one, firing only when they differ deeply. Divergences
from Vue: in-place mutation of a value that is never replaced cannot be observed (replace
the state instead), and reassigning the state to a deep-equal value stays silent (Vue's
ref-based watch fires on every reassignment, deeply equal or not). Single values and array
sources are supported, and `immediate` behaves like `useWatch`.

## Usage

```tsx
import { useWatchDeep } from '@reaxuse/shared'

const [obj, setObj] = useState({ foo: { bar: { deep: 5 } } })

useWatchDeep(obj, (updated) => {
  console.log(updated)
})

// replaces a nested value — the callback fires
setObj({ foo: { bar: { deep: 10 } } })

// deep-equal reassignment — the callback stays silent
setObj({ foo: { bar: { deep: 10 } } })

// array sources and `immediate` work like `useWatch`
useWatchDeep([count, obj], (value, oldValue) => {
  console.log(value, oldValue)
})
```

<DemoContainer name="UseWatchDeep" />

## Type Declarations

```ts
export function useWatchDeep<T extends any[]>(source: readonly [...T], callback: UseWatchCallback<[...T]>, options?: UseWatchOptions): void
export function useWatchDeep<T>(source: T, callback: UseWatchCallback<T>, options?: UseWatchOptions): void

// reused from useWatch
export interface UseWatchCallback<T = any> {
  (value: T, oldValue: T): void
}

export interface UseWatchOptions {
  /**
   * Fire the callback once on mount with the current value.
   * @default false
   */
  immediate?: boolean
}
```

## Source

- VueUse: [`packages/shared/watchDeep/index.ts`](https://github.com/vueuse/vueuse/blob/main/packages/shared/watchDeep/index.ts)
- VueUse tests: [`packages/shared/watchDeep/index.test.ts`](https://github.com/vueuse/vueuse/blob/main/packages/shared/watchDeep/index.test.ts)
- reaxuse: [`packages/shared/src/useWatchDeep.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/shared/src/useWatchDeep.ts)

<Contributors name="useWatchDeep" />
