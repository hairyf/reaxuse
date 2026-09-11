---
category: '@Electron'
---

# useZoomLevel

Reactive [WebFrame](https://www.electronjs.org/docs/api/web-frame#webframe) zoom level.

## Usage

```tsx
import { useZoomLevel } from '@reause/electron'

// enable nodeIntegration if you don't provide webFrame explicitly
// see: https://www.electronjs.org/docs/api/webview-tag#nodeintegration
// tuple result will return
const [level, setLevel] = useZoomLevel()
console.log(level) // print current zoom level
setLevel(2) // change current zoom level
```

Set initial zoom level immediately

```tsx
import { useZoomLevel } from '@reause/electron'

const [level] = useZoomLevel(2)
```

Pass a state value and the level will be updated when the source value changes

```tsx
import { useZoomLevel } from '@reause/electron'
import { useState } from 'react'

const [level, setLevel] = useState(1)

useZoomLevel(level) // zoom level will match with the state

setLevel(2) // zoom level will change
```
