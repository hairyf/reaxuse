---
category: Browser
---

# useClipboard

Reactive [Clipboard API](https://developer.mozilla.org/en-US/docs/Web/API/Clipboard_API)

## Usage

```tsx
import { useClipboard } from '@reaxuse/core'

const { text, copy, copied, isSupported } = useClipboard({ source: 'Hello' })

copy('Hello') // writes to the clipboard; `copied` auto-resets after 1.5s
```

Pass React state directly — the hook always reads the latest value, so reactive sources need no wrapper:

```tsx
const [source, setSource] = useState('Hello')
const { text, copy, copied } = useClipboard({ source })

setSource('World')
copy() // copies 'World'
```
