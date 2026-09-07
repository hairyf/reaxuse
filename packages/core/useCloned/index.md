---
category: Utilities
---

# useCloned

Reactive clone of a value. By default, it use `JSON.parse(JSON.stringify())` to do the clone — React
port of VueUse's [`useCloned`](https://vueuse.org/core/useCloned/).

**Mapping:** upstream returns `{ cloned, isModified, sync }` where `cloned` is a writable Vue `Ref`.
Here `cloned` becomes a plain React state value holding a deep copy of the source — edit it in place
and the modification is picked up on the next render (`isModified` flips to `true`), `sync()` re-clones
from the source and resets `isModified`. The source watcher becomes an effect comparing the resolved
source against the last synced value on every render (`deep` option).

## Usage

```tsx
import { useCloned } from '@reaxuse/core'

const original = { key: 'value' }

const { cloned } = useCloned(original)

cloned.key = 'some new value' // next render flips isModified to true

console.log(cloned.key) // 'some new value'
```

`cloned` is an editable copy — changes to it do not touch the source, and changes to the source (a new
value, a ref-like `{ current }` update or a getter) re-sync the clone on the next render.

## Manual cloning

```tsx
import { useCloned } from '@reaxuse/core'

const original = { current: { key: 'value' } }

const { cloned, sync } = useCloned(original, { manual: true })

original.current.key = 'manual'

console.log(cloned.key) // 'value'

sync()

console.log(cloned.key) // 'manual'
```

## Custom Clone Function

Using [`klona`](https://www.npmjs.com/package/klona) for example:

```tsx
import { useCloned } from '@reaxuse/core'
import { klona } from 'klona'

const original = { key: 'value' }

const { cloned, isModified, sync } = useCloned(original, { clone: klona })
```

<DemoContainer name="UseCloned" />

## Type Declarations

```ts
export interface UseClonedOptions<T = any> {
  clone?: (source: T) => T
  manual?: boolean
  deep?: boolean
  immediate?: boolean
}

export interface UseClonedReturn<T> {
  cloned: T
  isModified: boolean
  sync: () => void
}

export type CloneFn<F, T = F> = (x: F) => T

export function cloneFnJSON<T>(source: T): T

export function useCloned<T>(
  source: MaybeRefOrGetter<T>,
  options?: UseClonedOptions<T>,
): UseClonedReturn<T>
```

## Source

- VueUse upstream mapping — `source/vueuse/packages/core/useCloned/`:
  [`index.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useCloned/index.ts) (implementation),
  [`index.browser.test.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useCloned/index.browser.test.ts) (mirrored in `useCloned.test.tsx`),
  [`demo.vue`](https://github.com/vueuse/vueuse/blob/main/packages/core/useCloned/demo.vue) (ported to `demo.tsx` below)
- reaxuse: [`packages/core/src/useCloned.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/core/src/useCloned.ts), docs + demo co-located in `packages/core/useCloned/`

<Contributors name="useCloned" />
