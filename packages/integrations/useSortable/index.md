---
category: '@Integrations'
---

# useSortable

Wrapper for [`sortablejs`](https://github.com/SortableJS/Sortable) — React port of VueUse's
[`useSortable`](https://vueuse.org/integrations/useSortable/). Drag the items to reorder the list.

**Mapping:** upstream mutates the caller's array in place (and defers the splice with `nextTick` when
the list is a ref), which cannot work in React — an in-place mutation does not re-render. The reaxuse
`moveArrayElement(list, from, to, e)` is **pure**: it returns a NEW reordered array and never mutates
the input, and the hook hands that array to `options.onUpdate`. The rest of the contract follows
upstream: `start()` / `stop()` / `option()` are returned as a method bag (not a tuple), `watchElement`
re-initializes when the resolved element identity changes, and the target accepts an element, a React
ref object (`{ current }`) or a selector string. `start` / `stop` / `option` are stable callbacks.

**DOM ownership caveat:** sortablejs manipulates DOM nodes directly. The component must therefore be a
controlled list that re-renders from `onUpdate` — store the new array in state (stable `key`s
recommended). When no `onUpdate` is passed, sortablejs still moves the DOM nodes while the array stays
as-is, so React and the DOM desync.

## Install

```bash
npm i sortablejs@^1
```

## Usage

```tsx
import { useSortable } from '@reaxuse/integrations'
import { useState } from 'react'

function Component() {
  const [list, setList] = useState(['a', 'b', 'c'])
  const el = useRef<HTMLDivElement>(null)

  const { start, stop, option } = useSortable(el, list, {
    // the reordered array is handed back instead of mutating `list`
    onUpdate: newList => setList(newList),
  })

  return (
    <div ref={el}>
      {list.map(item => (
        <div key={item}>{item}</div>
      ))}
    </div>
  )
}
```

### Options

Pass any [sortablejs option](https://github.com/SortableJS/Sortable#options) directly, plus the reaxuse
extras `watchElement`, `document` and `onUpdate`:

```tsx
const { option } = useSortable(el, list, {
  animation: 150,
  handle: '.handle',
  onUpdate: newList => setList(newList),
})

// read / write options on the live instance
option('disabled') // false
option('disabled', true)
```

### Selector string

```tsx
const { start, stop } = useSortable('#my-list', list, {
  onUpdate: newList => setList(newList),
})
```

### Conditional rendering

With `watchElement: true` the instance is destroyed and re-created whenever the resolved element
changes; with the default `watchElement: false` the instance follows the element that was resolved on
mount, and `start()` re-queries the target.

```tsx
const el = useRef<HTMLDivElement>(null)
const { start } = useSortable(el, list, { watchElement: true })
```

### Helpers

```ts
// pure: returns a NEW array, never mutates `list`
const next = moveArrayElement(list, 0, 2)
// DOM helpers used by the fixup above
insertNodeAt(parentElement, element, index)
removeNode(node)
```

## Type Declarations

```ts
export interface UseSortableReturn {
  start: () => void
  stop: () => void
  option: (<K extends keyof Sortable.Options>(name: K, value: Sortable.Options[K]) => void)
    & (<K extends keyof Sortable.Options>(name: K) => Sortable.Options[K])
}

export interface UseSortableOptions<T = unknown> extends Omit<Sortable.Options, 'onUpdate'> {
  watchElement?: boolean
  document?: Document
  onUpdate?: (newList: T[], event: Sortable.SortableEvent | null) => void
}

export function useSortable<T>(
  el: SortableTarget | string,
  list: T[],
  options?: UseSortableOptions<T>,
): UseSortableReturn

export function insertNodeAt(parentElement: Element, element: Element, index: number): void
export function removeNode(node: Node): void
export function moveArrayElement<T>(list: T[], from: number, to: number, e?: Sortable.SortableEvent | null): T[]
```

## Source

- VueUse upstream mapping — `source/vueuse/packages/integrations/useSortable/`:
  [`index.ts`](https://github.com/vueuse/vueuse/blob/main/packages/integrations/useSortable/index.ts) (implementation),
  [`index.browser.test.ts`](https://github.com/vueuse/vueuse/blob/main/packages/integrations/useSortable/index.browser.test.ts) (mirrored in `useSortable.test.tsx`),
  [`demo.vue`](https://github.com/vueuse/vueuse/blob/main/packages/integrations/useSortable/demo.vue) (ported to `demo.tsx` below)
- reaxuse: [`packages/integrations/src/useSortable.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/integrations/src/useSortable.ts), docs + demo co-located in `packages/integrations/useSortable/`

<Contributors name="useSortable" />
