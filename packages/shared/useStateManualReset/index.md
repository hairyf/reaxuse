---
category: Reactivity
---

# useStateManualReset

A state with manual reset functionality.

## Usage

```tsx
import { useStateManualReset } from '@reaxuse/shared'

const [message, setMessage, resetMessage] = useStateManualReset('default message')

setMessage('message has set')

resetMessage()

console.log(message) // 'default message'
```

> [!NOTE]
> The input accepts `State<T>`: a plain value, ref-like object, getter, state tuple, or controlled
> `{ value, onChange }` object. `reset` re-reads the input on every call, so dynamic values reset to
> the latest source value.
