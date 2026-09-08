---
category: Component
---

# useTemplateRefsList

Shorthand for binding refs to elements rendered inside a list — React port of VueUse's [`useTemplateRefsList`](https://vueuse.org/core/useTemplateRefsList/).

**Mapping:** VueUse returns a single readonly `Ref` of an array-with-`set` bound as `:ref="refs.set"` inside `v-for` — `set` pushes the element and the array is reset before every re-render via `onBeforeUpdate`. React binds ref callbacks instead, so the port returns a tuple `[refs, setAt]`: `refs` is a stable array whose identity never changes across re-renders (a ref-like container, not state — mutating it does not schedule a re-render, read the slots after the commit), and `setAt(index, value)` writes one slot, accepting `T | null` because React calls ref callbacks with `null` when an element unmounts. The attached method and the returned setter are the same function (`refs.setAt === setAt`). Upstream's `Ref<Readonly<...>>` immutability does not apply since React consumers hold the array identity directly.

## Usage

```tsx
import { useTemplateRefsList } from '@reaxuse/core'

function List({ items }: { items: string[] }) {
  const [refs, setAt] = useTemplateRefsList<HTMLLIElement>()

  return (
    <ul>
      {items.map((item, index) => (
        <li key={item} ref={el => setAt(index, el)}>
          {item}
        </li>
      ))}
    </ul>
  )
}
```

Read the collected elements after the commit — `refs.length`, `refs[0]`, ... An element that unmounts leaves a `null` slot; reset manually with `refs.length = 0` if the list changed wholesale.

<DemoContainer name="UseTemplateRefsList" />

## Type Declarations

```ts
export type TemplateRefsList<T> = T[] & { setAt: (index: number, value: T | null) => void }

export function useTemplateRefsList<T = Element>(): [TemplateRefsList<T>, (index: number, value: T | null) => void]
```

## Source

- VueUse upstream mapping — `source/vueuse/packages/core/useTemplateRefsList/`:
  [`index.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useTemplateRefsList/index.ts) (implementation),
  [`index.browser.test.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useTemplateRefsList/index.browser.test.ts) (mirrored in `useTemplateRefsList.test.tsx`),
  [`demo.vue`](https://github.com/vueuse/vueuse/blob/main/packages/core/useTemplateRefsList/demo.vue) (ported to `demo.tsx` below)
- reaxuse: [`packages/core/src/useTemplateRefsList.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/core/src/useTemplateRefsList.ts), docs + demo co-located in `packages/core/useTemplateRefsList/`

<Contributors name="useTemplateRefsList" />
