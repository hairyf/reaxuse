---
category: Utilities
---

# useCycleList

Cycle through a list of items

## Usage

```ts
import { useCycleList } from '@reaxuse/core'

const { state, next, prev, go } = useCycleList([
  'Dog',
  'Cat',
  'Lizard',
  'Shark',
  'Whale',
  'Dolphin',
  'Octopus',
  'Seal',
])

console.log(state) // 'Dog'

prev()

console.log(state) // 'Seal'

go(3)

console.log(state) // 'Shark'
```

## Source Forms

`list` is a read-only value source and takes a plain `T[]` (upstream:
`MaybeRefOrGetter<T[]>`). Resolve a React ref or state value at the call site:

```tsx
const [list, setList] = useState(['Dog', 'Cat'])

const { state, next } = useCycleList(list) // a new array is picked up on re-render
const { state: refState } = useCycleList(listRef.current) // resolve a React ref yourself
```
