---
category: Reactivity
---

# useStateDebounced

Debounce updates of a state value. The `value` input uses `State<T>` and may be a plain value, lazy initializer, state tuple, or controllable object.

## Usage

```tsx
import { useStateDebounced } from '@reaxuse/shared'

const [input, setInput, debounced] = useStateDebounced('foo', 1000)

setInput('bar')
console.log(debounced) // 'foo' — flips to 'bar' once the debounce elapses
```

Use an existing state tuple when the source is owned by the parent component:

```tsx
const state = useState('foo')
const [input, setInput, debounced] = useStateDebounced(state, 1000)
```

For controlled state, updates are sent to `onChange` and the debounced value follows the controlled value after the delay:

```tsx
const [input, setInput, debounced] = useStateDebounced(
  { value, onChange: setValue },
  300,
)
```
