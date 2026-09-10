---
category: '@Electron'
---

# useZoomFactor

Reactive [WebFrame](https://www.electronjs.org/docs/api/web-frame#webframe) zoom factor.

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

Pass a state value and the factor will be updated when the source value changes

```tsx
import { useZoomFactor } from '@reaxuse/electron'
import { useState } from 'react'

const [factor, setFactor] = useState(1)

useZoomFactor(factor) // zoom factor will match with the state

setFactor(2) // zoom factor will change
```
