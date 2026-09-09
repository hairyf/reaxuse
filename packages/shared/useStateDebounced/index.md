---
category: Reactivity
---

# useStateDebounced

Debounce execution of a state value

## Usage

```tsx
import { useStateDebounced } from '@reaxuse/shared'

const [input, setInput, debounced] = useStateDebounced('foo', 1000)

setInput('bar')
console.log(debounced) // 'foo' — flips to 'bar' once the debounce elapses
```
