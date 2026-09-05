---
category: Watch
---

# useWatch

Watches a source — a single value or an array of values — and invokes a callback with
`(value, oldValue)` whenever it changes — React port of VueUse's
[`watch`](https://vueuse.org/shared/watch/) (via hairylib's `useWatch`).

**Mapping:** Vue's reactive dependency tracking becomes a `useEffect` whose dependency list
is the source itself — `[source]` for a single value, the source's elements for an array
source. The previous value is tracked in a ref updated by the effect, and the callback never
fires on the first render unless `immediate: true`. This hook is the parent of all
`useWatch*` variants.

## Usage

```tsx
import { useWatch } from '@reaxuse/shared'

useWatch(count, (value, oldValue) => {
  console.log(value, oldValue)
})

// array source — fires when any element changes
useWatch([count, name], (value, oldValue) => {
  console.log(value, oldValue)
})
```

<DemoContainer name="UseWatch" />

## Type Declarations

```ts
export interface UseWatchCallback<T = any> {
  (value: T, oldValue: T): void
}

export interface UseWatchOptions {
  immediate?: boolean
}

export function useWatch<T extends any[]>(source: readonly [...T], callback: UseWatchCallback<[...T]>, options?: UseWatchOptions): void
export function useWatch<T>(source: T, callback: UseWatchCallback<T>, options?: UseWatchOptions): void
```

## Source

- VueUse: [`watch`](https://vueuse.org/shared/watch/)
- hairylib: [`use-watch.ts`](https://github.com/hairyf/hairylib/blob/main/packages/react/src/hooks/use-watch.ts)
- reaxuse: [`packages/shared/src/useWatch.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/shared/src/useWatch.ts)

<Contributors name="useWatch" />
