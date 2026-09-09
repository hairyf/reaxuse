---
category: Component
---

# useRefsList

Shorthand for binding refs to elements rendered inside a list

## Usage

```tsx
import { useRefsList } from '@reaxuse/core'

function List({ items }: { items: string[] }) {
  const [refs, setAt] = useRefsList<HTMLLIElement>()

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
