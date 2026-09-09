---
category: Reactivity
---

# useStateAutoReset

A controllable state which resets to its default value after some time. The first argument accepts a plain value, lazy getter, ref-like object, state tuple, or controlled `{ value, onChange }` pair.

## Usage

```tsx
import { useStateAutoReset } from '@reaxuse/shared'

const [message, setMessage] = useStateAutoReset('default message', 1000)

function setMessage() {
  // here the value will change to 'message has set' but after 1000ms, it will change to 'default message'
  setMessage('message has set')
}
```
