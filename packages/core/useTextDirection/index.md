---
category: Browser
---

# useTextDirection

Reactive [dir](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/dir) of the element's text

## Usage

```tsx
import { useTextDirection } from '@reause/core'

const [dir, setDir] = useTextDirection() // ['ltr' | 'rtl' | 'auto', setter]
// <html dir="rtl"> → dir === 'rtl'
setDir('ltr') // writes dir="ltr" back to <html>
```

## Options

By default it targets the `<html>` tag. Pass a `selector` to target another element:

```tsx
const [mode, setMode] = useTextDirection({ selector: 'body' })
```

With `observe: true` the hook watches `document.querySelector(selector)` with a MutationObserver and
follows external `dir` changes:

```tsx
const [dir, setDir] = useTextDirection({ observe: true })
```
