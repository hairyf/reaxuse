---
category: Array
---

# useArrayJoin

Reactive `Array.join` — React port of VueUse's [`useArrayJoin`](https://vueuse.org/shared/useArrayJoin/).

**Mapping:** upstream wraps `toValue(list).map(i => toValue(i)).join(toValue(separator))` in `computed(...)` and accepts a `MaybeRefOrGetter`; React has no implicit reactivity, so `useArrayJoin` is a plain function that recomputes the join on each render — pass a state array (upstream: reactive array) and re-render with new state to see the updated result. The return is a plain string, no `.value`.

## Usage

```tsx
import { useArrayJoin } from '@reaxuse/shared'
import { useState } from 'react'

const [list, setList] = useState(['foo', 0, { prop: 'val' }])

const result = useArrayJoin(list, '--') // 'foo--0--[object Object]'

setList([...list, 'bar']) // result === 'foo--0--[object Object]--bar' on the next render
```

<DemoContainer name="UseArrayJoin" />

## Type Declarations

```ts
export type UseArrayJoinReturn = string
export function useArrayJoin(list: any[], separator?: string): UseArrayJoinReturn
```

## Source

- VueUse: [`packages/shared/useArrayJoin/index.ts`](https://github.com/vueuse/vueuse/blob/main/packages/shared/useArrayJoin/index.ts)
- VueUse tests: [`packages/shared/useArrayJoin/index.test.ts`](https://github.com/vueuse/vueuse/blob/main/packages/shared/useArrayJoin/index.test.ts)
- reaxuse: [`packages/shared/src/useArrayJoin.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/shared/src/useArrayJoin.ts)

<Contributors name="useArrayJoin" />
