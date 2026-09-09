---
category: Sensors
---

# useStartTyping

Fires when users start typing on non-editable elements. Useful for auto-focusing an input field when the user starts typing anywhere on the page.

## Usage

```tsx
import { useStartTyping } from '@reaxuse/core'
import { useRef } from 'react'

const input = useRef<HTMLInputElement>(null)

useStartTyping(() => {
  if (input.current !== document.activeElement)
    input.current?.focus()
})

// <input ref={input} type="text" placeholder="Start typing to focus">
```

The hook returns a cleanup function that removes the `keydown` listener —
the listener is also removed automatically on unmount.

```tsx
const stop = useStartTyping(handleKey)

// later
stop()
```

## Custom Valid Key

```ts
import { useStartTyping } from '@reaxuse/core'

useStartTyping(handleKey, {
  // only allow numbers
  isTypedCharValid: e => /^\d$/.test(e.key),
})
```

## Custom Editable Element

```ts
import { isFocusedElementEditable as defaultEditable, useStartTyping } from '@reaxuse/core'

useStartTyping(handleKey, {
  isFocusedElementEditable: () => {
    const { activeElement } = document

    // Exclude elements with id 'targetInput'
    if (activeElement?.id === 'targetInput')
      return true

    return defaultEditable()
  },
})
```

## How It Works

The callback only fires when:

- No editable element (`<input>`, `<textarea>`, or `contenteditable`) is focused
- The pressed key is alphanumeric (A-Z, 0-9)
- No modifier keys (Ctrl, Alt, Meta) are held

This allows users to start typing anywhere on the page without accidentally triggering the callback when using keyboard shortcuts or interacting with form fields.

Both `isFocusedElementEditable` and `isTypedCharValid` are also exported as utility functions, so you can reuse them when writing custom options.
