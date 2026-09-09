---
category: Browser
related:
  - useClipboard
---

# useClipboardItems

Reactive [Clipboard API](https://developer.mozilla.org/en-US/docs/Web/API/Clipboard_API)

## Usage

```tsx
import { useClipboardItems } from '@reaxuse/core'

const source = [
  new ClipboardItem({
    'text/plain': new Blob(['plain text'], { type: 'text/plain' }),
  }),
]

const { content, copy, copied, isSupported } = useClipboardItems({ source })
```
