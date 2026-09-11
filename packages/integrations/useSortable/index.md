---
category: '@Integrations'
---

# useSortable

Wrapper for [`sortablejs`](https://github.com/SortableJS/Sortable).

For more information on what options can be passed, see [`Sortable.options`](https://github.com/SortableJS/Sortable#options) in the `Sortable` documentation.

::: warning
Currently, `useSortable` only implements drag-and-drop sorting for a single list.
:::

## Install

```bash
npm i sortablejs@^1
```

## Usage

### Use template ref

```tsx
import { useSortable } from '@reause/integrations'
import { useRef, useState } from 'react'

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

### Use specifies the selector to operate on

```tsx
const { option } = useSortable(el, list, {
  handle: '.handle',
  // or option set
  // animation
})

// You can use the option method to set and get the option of Sortable
option('animation', 150)
// option('animation') // 150
```

### Use a selector to get the root element

```tsx
const { start, stop } = useSortable('#my-list', list, {
  onUpdate: newList => setList(newList),
})
```

### Watch Element Changes

With `watchElement: true` the instance is destroyed and re-created whenever the resolved element
changes; with the default `watchElement: false` the instance follows the element that was resolved on
mount, and `start()` re-queries the target.

```tsx
const el = useRef<HTMLDivElement>(null)
const { start } = useSortable(el, list, { watchElement: true })
```

### Custom Update Handler

If you want to handle the `onUpdate` yourself, you can pass in `onUpdate` parameters, and we also exposed a function to move the item position.

```tsx
useSortable(el, list, {
  onUpdate: (newList, event) => {
    // do something
    setList(newList)
  },
})
```

### Return Values

| Property | Description                                                      |
| -------- | ---------------------------------------------------------------- |
| `start`  | Initialize the Sortable instance (called automatically on mount) |
| `stop`   | Destroy the Sortable instance                                    |
| `option` | Get or set Sortable options at runtime                           |

```tsx
const { start, stop, option } = useSortable(el, list)

// Stop sorting
stop()

// Start sorting again
start()

// Get/set options
option('animation', 200) // set
const animation = option('animation') // get
```

### Helper Functions

The following helper functions are also exported:

| Function                                   | Description                                                                 |
| ------------------------------------------ | --------------------------------------------------------------------------- |
| `moveArrayElement(list, from, to, event?)` | Move an element in an array from one index to another (returns a new array) |
| `insertNodeAt(parent, element, index)`     | Insert a DOM node at a specific index                                       |
| `removeNode(node)`                         | Remove a DOM node from its parent                                           |
