---
category: State
---

# useLocalStorage

Reactive [LocalStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)

## Usage

Please refer to `useStorage`.

```tsx
import { useLocalStorage } from '@reaxuse/core'

const [state, setState] = useLocalStorage('my-store', { hello: 'hi', greeting: 'Hello' })
const [flag, setFlag] = useLocalStorage('my-flag', true)

setState(null) // delete data from storage
```
