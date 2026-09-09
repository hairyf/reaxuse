---
category: Browser
related:
  - useClipboard
---

# useClipboardItems

Reactive [Clipboard API](https://developer.mozilla.org/en-US/docs/Web/API/Clipboard_API). Provides the ability to respond to clipboard commands (cut, copy, and paste) as well as to asynchronously read from and write to the system clipboard. Access to the contents of the clipboard is gated behind the [Permissions API](https://developer.mozilla.org/en-US/docs/Web/API/Permissions_API). Without user permission, reading or altering the clipboard contents is not permitted.

## Difference from `useClipboard`

`useClipboard` is a "text-only" function, while `useClipboardItems` is a [ClipboardItem](https://developer.mozilla.org/en-US/docs/Web/API/ClipboardItem) based function. You can use `useClipboardItems` to copy any content supported by [ClipboardItem](https://developer.mozilla.org/en-US/docs/Web/API/ClipboardItem).

## Usage

```tsx
import { useClipboardItems } from '@reaxuse/core'

const source = [
  new ClipboardItem({
    'text/plain': new Blob(['plain text'], { type: 'text/plain' }),
  }),
]

const { content, copy, copied, isSupported } = useClipboardItems({ source })

// by default, `copied` will be reset to `false` in 1.5s
// (configure it with the `copiedDuring` option, in milliseconds)
copy(source)
```

## React divergences

- `copy()`'s argument is named `content`, not upstream's `text` (upstream declares `copy: Optional extends true ? (content?: ClipboardItems) => Promise<void> : (text: ClipboardItems) => Promise<void>`). Same type and semantics — kept because it matches the returned `content` value and avoids confusion with `useClipboard`'s text-only `text`.
- Upstream binds the `copy` / `cut` listeners once at setup (when `read` is enabled and the Clipboard API is supported). Reaxuse binds them in an effect keyed on `read` and `isSupported`, so toggling `read` after mount adds or removes the listeners — strictly more reactive than upstream's freeze-in.
- `content` and `copied` are plain state values (no `.value`), and `isSupported` is a plain boolean resolved in a mount effect: it is `false` during the first render and on the server, then flips to `true` after mount when the resolved navigator exposes the Clipboard API.
