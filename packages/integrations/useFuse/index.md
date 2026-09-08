---
category: '@Integrations'
---

# useFuse

Easily implement fuzzy search using a composable with [Fuse.js](https://github.com/krisk/fuse) — React
port of VueUse's [`useFuse`](https://vueuse.org/integrations/useFuse/).

From the Fuse.js website:

> What is fuzzy searching?
>
> Generally speaking, fuzzy searching (more formally known as approximate string matching) is the
> technique of finding strings that are approximately equal to a given pattern (rather than exactly).

**Mapping:** upstream returns `{ fuse: Ref<Fuse>, results: ComputedRef<FuseResult[]> }` and rebuilds the
index inside a `watch(() => toValue(options)?.fuseOptions, …, { deep: true })`, refreshing the collection in
a second deep `watch` over `data`. The React port returns a **plain object** — `fuse` is the live `Fuse`
instance (no `.value`) and `results` is a plain array recomputed during render. React has no deep watcher,
and comparing `fuseOptions` by value would require serializing them, which breaks function-valued options
(`sortFn`, `getFn`, `keys[].getFn`); instead the `Fuse` instance is memoized on the identity of the
resolved `data` array and of `fuseOptions`. `search`, `data` and `options` accept plain values or React
ref-like `{ current }` objects, resolved with `toValue` from `@reaxuse/shared`.

Because the index is memoized on identity, **pass a memoized `fuseOptions` object** (and a new `data`
array whenever the collection changes). A fresh object literal on every render is still correct — it just
rebuilds the index each render. Mutating the `data` array in place is not detected.

## Install Fuse.js as a peer dependency

### NPM

```bash
npm install fuse.js@^7
```

### Yarn

```bash
yarn add fuse.js
```

## Usage

```tsx
import { useFuse } from '@reaxuse/integrations'
import { useState } from 'react'

const data = [
  'John Smith',
  'John Doe',
  'Jane Doe',
  'Phillip Green',
  'Peter Brown',
]

const [input, setInput] = useState('Jhon D')

const { results } = useFuse(input, data)

/*
 * Results:
 *
 * { "item": "John Doe", "refIndex": 1 }
 * { "item": "John Smith", "refIndex": 0 }
 * { "item": "Jane Doe", "refIndex": 2 }
 *
 */
```

The inputs can also be ref-like objects (`{ current }`), which stay live across renders:

```tsx
const input = { current: 'Jhon D' }
const { results } = useFuse(input, data)
input.current = 'Peter'
// results is recomputed on the next render
```

Options are passed through `fuseOptions`, plus `resultLimit` and `matchAllWhenSearchEmpty`:

```tsx
import { useFuse } from '@reaxuse/integrations'
import { useMemo, useState } from 'react'

const [search, setSearch] = useState('')

// memoized so the Fuse index is not rebuilt on every render
const options = useMemo(() => ({
  fuseOptions: { keys: ['firstName', 'lastName'] },
  resultLimit: 10,
  matchAllWhenSearchEmpty: true,
}), [])

const { fuse, results } = useFuse(search, data, options)

fuse.search('john') // search the same index directly
```

<DemoContainer name="useFuse" />

## Type Declarations

```ts
export type FuseOptions<T> = IFuseOptions<T>

export interface UseFuseOptions<T> {
  fuseOptions?: FuseOptions<T>
  resultLimit?: number
  matchAllWhenSearchEmpty?: boolean
}

export interface UseFuseReturn<DataItem> {
  fuse: Fuse<DataItem>
  results: FuseResult<DataItem>[]
}

export function useFuse<DataItem>(
  search: RefOrValue<string>,
  data: RefOrValue<DataItem[]>,
  options?: RefOrValue<UseFuseOptions<DataItem>>,
): UseFuseReturn<DataItem>
```

## Source

- VueUse upstream mapping — `source/vueuse/packages/integrations/useFuse/`:
  [`index.ts`](https://github.com/vueuse/vueuse/blob/main/packages/integrations/useFuse/index.ts) (implementation),
  [`index.test.ts`](https://github.com/vueuse/vueuse/blob/main/packages/integrations/useFuse/index.test.ts) (mirrored in `useFuse.test.tsx`),
  [`demo.vue`](https://github.com/vueuse/vueuse/blob/main/packages/integrations/useFuse/demo.vue) (ported to `demo.tsx` below)
- reaxuse: [`packages/integrations/src/useFuse.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/integrations/src/useFuse.ts), docs + demo co-located in `packages/integrations/useFuse/`

<Contributors name="useFuse" />
