---
category: Browser
---

# useTextareaAutosize

Automatically update the height of a textarea depending on the content

## Usage

### Simple example

```tsx
import { useTextareaAutosize } from '@reaxuse/core'

const { textarea, input, setInput } = useTextareaAutosize()
// <textarea ref={textarea} value={input} onChange={e => setInput(e.target.value)} />
```

::: info

It's recommended to reset the scrollbar styles for the textarea element to avoid incorrect height values for large amounts of text.

```css
textarea {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

textarea::-webkit-scrollbar {
  display: none;
}
```

:::

### Controlled textarea

Keep the element and the content in your own component state and pass them through the options:

```tsx
import { useTextareaAutosize } from '@reaxuse/core'
import { useRef, useState } from 'react'

const textarea = useRef<HTMLTextAreaElement>(null)
const [input, setInput] = useState('')
const { triggerResize } = useTextareaAutosize({ element: textarea, input })
// <textarea ref={textarea} value={input} onChange={e => setInput(e.target.value)} />
```

### With `rows` attribute

If you need support for the rows attribute on a textarea element, then you should set the `styleProp` option to `minHeight`.

```tsx
const { textarea, input, setInput } = useTextareaAutosize({ styleProp: 'minHeight' })
// <textarea ref={textarea} value={input} onChange={e => setInput(e.target.value)} rows={3} />
```

### With `maxHeight`

Use the `maxHeight` option to cap the textarea height in pixels while keeping autosize behavior.

```tsx
const { textarea, input, setInput } = useTextareaAutosize({
  maxHeight: 180,
  styleProp: 'minHeight',
})
// <textarea ref={textarea} value={input} onChange={e => setInput(e.target.value)} rows={3} />
```
