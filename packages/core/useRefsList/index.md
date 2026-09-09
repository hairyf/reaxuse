---
category: Component
---

# useRefsList

Shorthand for binding refs to elements rendered inside a list

## Usage

```tsx
import { useRefsList } from '@reaxuse/core'

function List({ items }: { items: string[] }) {
  const refs = useRefsList<HTMLLIElement>()

  return (
    <ul>
      {items.map(item => (
        <li key={item} ref={el => refs.set(el)}>
          {item}
        </li>
      ))}
    </ul>
  )
}
```
