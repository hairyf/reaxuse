---
category: '@Electron'
---

# useIpcRendererInvoke

Reactive [ipcRenderer.invoke API](https://www.electronjs.org/docs/api/ipc-renderer#ipcrendererinvokechannel-args) result

## Usage

```tsx
import { useIpcRendererInvoke } from '@reaxuse/electron'

// enable nodeIntegration if you don't provide ipcRenderer explicitly
// see: https://www.electronjs.org/docs/api/webview-tag#nodeintegration
const result = useIpcRendererInvoke<string>('custom-channel', 'some data')
```

### With Custom IpcRenderer

If `nodeIntegration` is disabled, pass the `ipcRenderer` instance explicitly:

```tsx
import { useIpcRendererInvoke } from '@reaxuse/electron'
import { ipcRenderer } from 'electron'

const result = useIpcRendererInvoke<string>(ipcRenderer, 'custom-channel', 'some data')
```

## React Deviations from Upstream

- **Returns `T | null`, not a `ShallowRef<T | null>`.** Read it like any other hook value; a new invoke re-renders with the new response.
- **The invoke runs in an effect**, so changing `channel` or `args` re-invokes (upstream runs once per setup).
- **Unmount-safe**: a promise that settles after unmount does not update state.
- **No `.catch`** — upstream leaves rejections unhandled and so does this port. If you need error handling, use the explicit-instance form with your own `ipcRenderer` wrapper, or `useIpcRenderer().invoke`, which returns the raw `Promise<T>` you can `await` in a `try`/`catch`.
- **Missing instance throws synchronously at render** (`please provide IpcRenderer module or enable nodeIntegration`) — resolution happens in the hook body, not inside an effect.
