---
category: State
---

# useStorage

Reactive [LocalStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)/[SessionStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/sessionStorage)

## Usage

```tsx
import { useStorage } from '@reaxuse/core'

const [state, setState] = useStorage('my-store', { hello: 'hi', greeting: 'Hello' })
const [flag, setFlag] = useStorage('my-flag', true)
const [id, setId] = useStorage('my-id', 'some-string-id', sessionStorage)

setState(null) // delete data from storage
```
