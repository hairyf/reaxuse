---
category: Reactivity
---

# useStateAutoReset

A state which will be reset to the default value after some time

## Usage

```tsx
import { useStateAutoReset } from '@reaxuse/shared'

const [message, setMessage] = useStateAutoReset('default message', 1000)

function setMessage() {
  // here the value will change to 'message has set' but after 1000ms, it will change to 'default message'
  setMessage('message has set')
}
```
