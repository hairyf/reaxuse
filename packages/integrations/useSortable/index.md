---
category: '@Integrations'
---

# useSortable

Wrapper for [`sortablejs`](https://github.com/SortableJS/Sortable)

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
