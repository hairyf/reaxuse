---
category: Browser
---

# useCssVar

Manipulate CSS variables

## Usage

```tsx
import { useCssVar } from '@reaxuse/core'
import { useRef } from 'react'

const el = useRef<HTMLDivElement>(null)
const [color1, setColor1] = useCssVar('--color', el)
// force a re-render (e.g. with your own state) once `el` is populated

const [key] = useState('--color')
const [colorVal, setColorVal] = useCssVar(key, el)

const [color2, setColor2] = useCssVar('--color', el, { initialValue: '#eee' })
setColor2(null) // removes the --color property from the element
```

## Options

### initialValue

- Type: `string`
- Default: `undefined`

Initial value, also the SSR default — no `document` access happens during render.

### observe

- Type: `boolean`
- Default: `false`

Track external changes to the variable with a `MutationObserver` (upstream composes `useMutationObserver` with `{ attributeFilter: ['style', 'class'] }`). The observer only updates the returned state, since the DOM already holds the change. It is created from the configured `window`; when that window has no `MutationObserver`, observation is skipped silently.

### window

- Type: `Window`
- Default: the global `window` (`undefined` on the server)

The window object used to read the computed style and to construct the `MutationObserver`, e.g. to work with iframes or in tests.
