---
category: '@Electron'
---

# useZoomLevel

Reactive [WebFrame](https://www.electronjs.org/docs/api/web-frame#webframe) zoom level

## Usage

```tsx
import { useZoomLevel } from '@reaxuse/electron'

// enable nodeIntegration if you don't provide webFrame explicitly
// see: https://www.electronjs.org/docs/api/webview-tag#nodeintegration
// tuple result will return
const [level, setLevel] = useZoomLevel()
console.log(level) // print current zoom level
setLevel(2) // change current zoom level
```

Set initial zoom level immediately

```tsx
import { useZoomLevel } from '@reaxuse/electron'

const [level] = useZoomLevel(2)
```

Pass a ref and the level will be updated when the source ref changes

```tsx
import { useZoomLevel } from '@reaxuse/electron'
import { useRef } from 'react'

const level = useRef(1)

useZoomLevel(level) // zoom level will match with the ref

level.current = 2 // zoom level will change
```

## Notes

- Upstream has no range guard for zoom levels, so neither has this port — `0` is a valid level, and `useZoomLevel(webFrame, 0)` does not throw (unlike `useZoomFactor`).
- Without an explicit `webFrame` and without `nodeIntegration`, the hook throws `provide WebFrame module or enable nodeIntegration` (same as upstream).
- `electron` is imported as a type only, so the hook can be used (and tested) in a plain browser as long as a `webFrame` stub is passed.
