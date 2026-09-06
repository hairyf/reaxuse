---
category: Browser
---

# useTextareaAutosize

Automatically update the height of a textarea depending on the content — React port of VueUse's
[`useTextareaAutosize`](https://vueuse.org/core/useTextareaAutosize/).

**Mapping:** upstream returns `{ textarea, input, triggerResize }` Vue refs → React returns a
bindable `textarea` `RefObject` (or pass your own via the `element` option), the content as a
plain `input` string + `setInput` setter (or a controlled value via the `input` option), and
`triggerResize`. The resize runs in an effect after each content change (upstream:
`watch` + `nextTick`), a self-contained `ResizeObserver` re-measures when the element's width
changes (upstream: `useResizeObserver`) and is disconnected on unmount, and upstream's `watch`
sources become a `watch?: unknown[]` values array.

> [!TIP]
> You may not need this function anymore. Textarea autosizing can now be achieved natively with CSS, see [`field-sizing: content`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/field-sizing) for more information.

## Usage

### Simple example

```tsx
import { useTextareaAutosize } from '@reaxuse/core'

const { textarea, input, setInput } = useTextareaAutosize()
// <textarea ref={textarea} value={input} onChange={e => setInput(e.target.value)} />
```

<DemoContainer name="UseTextareaAutosize" />

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

## Type Declarations

```ts
export interface UseTextareaAutosizeOptions {
  window?: Window
  element?: RefObject<HTMLTextAreaElement | null>
  input?: string
  maxHeight?: number
  watch?: unknown[]
  onResize?: () => void
  styleTarget?: RefObject<HTMLElement | null>
  styleProp?: 'height' | 'minHeight'
}

export interface UseTextareaAutosizeReturn {
  textarea: RefObject<HTMLTextAreaElement | null>
  input: string
  setInput: Dispatch<SetStateAction<string>>
  triggerResize: () => void
}

export function useTextareaAutosize(options?: UseTextareaAutosizeOptions): UseTextareaAutosizeReturn
```

## Source

- VueUse upstream mapping — `source/vueuse/packages/core/useTextareaAutosize/`:
  [`index.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useTextareaAutosize/index.ts) (implementation),
  [`index.test.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useTextareaAutosize/index.test.ts) (mirrored in `packages/core/src/useTextareaAutosize.test.tsx`),
  [`demo.vue`](https://github.com/vueuse/vueuse/blob/main/packages/core/useTextareaAutosize/demo.vue) (ported to `demo.tsx` below)
- reaxuse: [`packages/core/src/useTextareaAutosize.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/core/src/useTextareaAutosize.ts), docs + demo co-located in `packages/core/useTextareaAutosize/`

<Contributors name="useTextareaAutosize" />
