---
category: '@Electron'
---

# resolveIpcRenderer / resolveWebFrame

Internal helpers shared by the `@reaxuse/electron` hooks. They are not part of the
package's public API — `packages/electron/src/index.ts` does not export them — but
every module under `packages/electron/src/` has a page on this site, so they are
documented here.

`resolveIpcRenderer(ipcRenderer?, message?)` returns the `IpcRenderer` instance the
caller passed, or `window.require('electron').ipcRenderer` when `nodeIntegration` is
enabled. `resolveWebFrame(webFrame?, message?)` does the same for `WebFrame`. Both
throw an `Error` carrying `message` when neither source is available; the defaults are
`provide IpcRenderer module or enable nodeIntegration` and
`provide WebFrame module or enable nodeIntegration`.

```ts
import { resolveIpcRenderer, resolveWebFrame } from '../src/_resolve'

const ipcRenderer = resolveIpcRenderer(props.ipcRenderer)
const webFrame = resolveWebFrame(props.webFrame)
```
