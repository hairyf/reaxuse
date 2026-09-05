---
category: State
---

# useLastChanged

Records the timestamp of the last change — React port of VueUse's [`useLastChanged`](https://vueuse.org/shared/useLastChanged/).

**Mapping:** upstream watches a `WatchSource` and stores the timestamp in a readonly
`ShallowRef<number | null>`; React has no reactive watch, so the hook takes the current
value directly (re-evaluated on every render), records `Date.now()` in a post-commit
`useEffect` when it differs (via `Object.is`) from the previous render, and returns a
plain `number | null` (no `.value`). The updated timestamp becomes visible on the render
following the change (upstream records on the watch flush), so upstream's watch options
have no React equivalent: `flush: 'sync'` cannot be reproduced (effects always run after
commit) and `immediate: true` is redundant with `initialValue`.

## Usage

```tsx
import { useLastChanged } from '@reaxuse/shared'
import { useState } from 'react'

const [a, setA] = useState(0)
const lastChanged = useLastChanged(a)
// note: lastChanged is a plain number (or null), not a ref (no `.value`)

setA(1)

console.log(lastChanged) // 1704709379457
```

Like upstream, the change is not recorded synchronously: it lands in a post-commit
effect, so the new timestamp shows up on the render after the change.

Seed the returned value before any change is recorded with `initialValue`
(upstream: `initialValue`):

```tsx
const lastChanged = useLastChanged(input, { initialValue: Date.now() - 1000 * 60 * 5 })
```

<DemoContainer name="UseLastChanged" />

## Type Declarations

```ts
export interface UseLastChangedOptions<InitialValue extends number | null | undefined = undefined> {
  /**
   * Value returned before any change has been recorded
   *
   * @default null
   */
  initialValue?: InitialValue
}

export type UseLastChangedReturn = number | null

export function useLastChanged<T>(value: T, options?: UseLastChangedOptions<undefined>): UseLastChangedReturn
export function useLastChanged<T>(value: T, options: UseLastChangedOptions<number>): number
```

## Source

- VueUse: [`packages/shared/useLastChanged`](https://github.com/vueuse/vueuse/tree/main/packages/shared/useLastChanged) — source [`index.ts`](https://github.com/vueuse/vueuse/blob/main/packages/shared/useLastChanged/index.ts), demo [`demo.vue`](https://github.com/vueuse/vueuse/blob/main/packages/shared/useLastChanged/demo.vue)
- reaxuse: [`packages/shared/src/useLastChanged.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/shared/src/useLastChanged.ts)

<Contributors name="useLastChanged" />
