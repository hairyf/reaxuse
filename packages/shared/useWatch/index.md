---
category: Watch
---

# useWatch

Watch for changes in reactive source — React port of VueUse's [`watch`](https://vueuse.org/shared/watch/).

**Mapping:** Vue's reactive `watch` → a `useEffect` keyed on the source; old-value tracking (VueUse's `usePrevious` equivalent) is inlined with a `useRef` so the callback receives `(newValue, oldValue)`.

## Usage

```tsx
import { useWatch } from '@reaxuse/shared'
import { useState } from 'react'

const [count, setCount] = useState(0)

useWatch(count, (value, oldValue) => {
  console.log(`count changed: ${oldValue} → ${value}`)
})
```

The callback does **not** fire on the first render — only when the source changes. Pass `{ immediate: true }` to also fire it once right away (with `oldValue` being `undefined`).

```tsx
useWatch(count, (value, oldValue) => {
  console.log(`count changed: ${oldValue} → ${value}`)
}, { immediate: true })
```

Array sources are watched element-wise — the callback fires when any element changes:

```tsx
useWatch([a, b], ([a, b], [oldA, oldB]) => {
  console.log('a or b changed')
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

- VueUse: [`packages/shared/watch`](https://github.com/vueuse/vueuse/tree/main/packages/shared/watch)
- reaxuse: [`packages/shared/src/useWatch.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/shared/src/useWatch.ts)

<Contributors name="useWatch" />
