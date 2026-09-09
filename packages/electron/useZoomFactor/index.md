---
category: '@Electron'
---

# useZoomFactor

Reactive [WebFrame](https://www.electronjs.org/docs/api/web-frame#webframe) zoom factor

## Usage

```tsx
import { useZoomFactor } from '@reaxuse/electron'

// enable nodeIntegration if you don't provide webFrame explicitly
// see: https://www.electronjs.org/docs/api/webview-tag#nodeintegration
// tuple result will return
const [factor, setFactor] = useZoomFactor()
console.log(factor) // print current zoom factor
setFactor(2) // change current zoom factor
```

Set initial zoom factor immediately

```tsx
import { useZoomFactor } from '@reaxuse/electron'

const [factor] = useZoomFactor(2)
```

Pass a ref and the factor will be updated when the source ref changes

```tsx
import { useZoomFactor } from '@reaxuse/electron'
import { useRef } from 'react'

const factor = useRef(1)

useZoomFactor(factor) // zoom factor will match with the ref

factor.current = 2 // zoom factor will change
```

## Notes

- The upstream `0` guard is kept verbatim: `useZoomFactor(webFrame, 0)` and `setFactor(0)` both throw `the factor must be greater than 0.0.`
- Without an explicit `webFrame` and without `nodeIntegration`, the hook throws `provide WebFrame module or enable nodeIntegration` (same as upstream).
- `electron` is imported as a type only, so the hook can be used (and tested) in a plain browser as long as a `webFrame` stub is passed.
