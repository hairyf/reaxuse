---
category: Utilities
---

# useCached

Cache a value with a custom comparator — React port of VueUse's [`useCached`](https://vueuse.org/core/useCached/).

**Mapping:** upstream wraps a `Ref` with a `watch` that copies the source into the cache only when the
comparator reports the change as significant. React derives the cache from the props at render — the
hook takes a plain value and returns the cached value directly (no ref, no tuple). The comparator
signature is `(newSourceValue, cachedValue) => boolean`; when it returns `true` the cache is kept
as-is, when it returns `false` the cache is updated to the new source value.

## Usage

```tsx
import { useCached } from '@reaxuse/core'
import { useState } from 'react'

interface Data {
  value: number
  extra: number
}

const [source, setSource] = useState<Data>({ value: 42, extra: 0 })
const cached = useCached(source, (newSourceValue, cachedValue) => newSourceValue.value === cachedValue.value)

setSource({ value: 42, extra: 1 })
console.log(cached) // { value: 42, extra: 0 } — only `value` is significant

setSource({ value: 43, extra: 1 })
console.log(cached) // { value: 43, extra: 1 } — significant change, cache follows
```

By default — with no comparator — the cache only moves when the source reference itself changes
(`===`). The source also accepts a ref-like `{ current }` object (a React ref), resolved via
`toValue`, matching the other core hooks.

<DemoContainer name="UseCached" />

## Type Declarations

```ts
export type UseCachedComparator<T> = (newSourceValue: T, cachedValue: T) => boolean

export function useCached<T>(
  source: RefOrValue<T>,
  comparator?: UseCachedComparator<T>,
): T
```

## Source

- VueUse upstream mapping — `source/vueuse/packages/core/useCached/`:
  [`index.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useCached/index.ts) (implementation),
  [`index.browser.test.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useCached/index.browser.test.ts) (mirrored in `useCached.test.tsx`),
  [`demo.vue`](https://github.com/vueuse/vueuse/blob/main/packages/core/useCached/demo.vue) (ported to `demo.tsx` below)
- reaxuse: [`packages/core/src/useCached.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/core/src/useCached.ts), docs + demo co-located in `packages/core/useCached/`

<Contributors name="useCached" />
