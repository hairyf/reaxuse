---
category: Utilities
---

# useCached

Cache a value with a custom comparator

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
(`===`). The source also accepts a ref-like `{ current }` object (a React ref), resolved through
`isRefLike`: only real ref-like sources are unwrapped, so a plain data object that carries a `value`
key (like `Data` above) is cached as-is instead of being read as a Vue-style ref.

## Comparator timing

The comparator runs only when the resolved source value actually changes (`Object.is`), mirroring
upstream's `watch(() => refValue.value, ...)`. The initial mount seeds the cache from the source
without calling the comparator, and an unrelated re-render — including React StrictMode's double
mount render — does not call it either.

## Upstream options not ported

Upstream `useCached` accepts an optional third argument
(`UseCachedOptions<D> extends ConfigurableDeepRefs<D>, WatchOptions`). reaxuse does not port it:

- `deepRefs` (shallow vs deep ref) — the port always stores and returns the plain value as-is, so
  there is no shallow/deep distinction to configure.
- `WatchOptions` (`flush`, `immediate`, `deep`, `once`) — they configure the Vue `watch` that React
  has no equivalent for. The comparator timing above replaces them.
