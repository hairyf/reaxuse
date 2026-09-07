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

<DemoContainer name="UseStartTyping" />

## Type Declarations

```ts
export function isFocusedElementEditable(): boolean

export function isTypedCharValid({
  keyCode,
  metaKey,
  ctrlKey,
  altKey,
}: KeyboardEvent): boolean

export interface UseStartTypingOptions {
  document?: Document
  isTypedCharValid?: (event: KeyboardEvent) => boolean
  isFocusedElementEditable?: () => boolean
}

export function useStartTyping(
  callback: (event: KeyboardEvent) => void,
  options: UseStartTypingOptions = {},
): () => void
```

## Source

- VueUse upstream mapping — `source/vueuse/packages/core/onStartTyping/`:
  [`index.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/onStartTyping/index.ts) (implementation),
  [`index.browser.test.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/onStartTyping/index.browser.test.ts) (mirrored in `packages/core/src/useStartTyping.test.tsx`),
  [`demo.vue`](https://github.com/vueuse/vueuse/blob/main/packages/core/onStartTyping/demo.vue) (ported to `packages/core/useStartTyping/demo.tsx` below)
- reaxuse: [`packages/core/src/useStartTyping.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/core/src/useStartTyping.ts), docs + demo co-located in `packages/core/useStartTyping/`

<Contributors name="useStartTyping" />
