---
category: State
---

# useSessionStorage

Reactive [SessionStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/sessionStorage).

## Usage

Please refer to `useStorage`.

```tsx
import { useSessionStorage } from '@reaxuse/core'

const [state, setState] = useSessionStorage('my-store', { hello: 'hi', greeting: 'Hello' })
const [flag, setFlag] = useSessionStorage('my-flag', true)

setState(null) // delete data from storage
```
