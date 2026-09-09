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
