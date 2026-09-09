---
category: Reactivity
---

# useStateManualReset

Create a state with manual reset functionality

## Usage

```tsx
import { useStateManualReset } from '@reaxuse/shared'

const [message, setMessage, resetMessage] = useStateManualReset('default message')

setMessage('message has set')

resetMessage()

console.log(message) // 'default message'
```

> [!NOTE]
> The default value can be a plain value, a ref-like object (`{ current }`) or a getter function
> (`MaybeRefOrGetter`). Like the upstream implementation, `reset` re-reads it on every call — a
> dynamic default always resets to the latest value.
