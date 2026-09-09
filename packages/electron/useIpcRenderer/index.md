---
category: '@Electron'
---

# useIpcRenderer

Provides [ipcRenderer](https://www.electronjs.org/docs/api/ipc-renderer) and all of its APIs

## Usage

```tsx
import { useIpcRenderer } from '@reaxuse/electron'

// enable nodeIntegration if you don't provide ipcRenderer explicitly
// see: https://www.electronjs.org/docs/api/webview-tag#nodeintegration
const ipcRenderer = useIpcRenderer()

// Promise result (upstream returned a ShallowRef)
const result = await ipcRenderer.invoke<string>('custom-channel', 'some data')

// listeners registered through `on` are removed automatically on unmount
ipcRenderer.on('custom-event', (event, ...args) => {
  console.log(args)
})
```

### Available Methods

| Method                                     | Description                                          |
| ------------------------------------------ | ---------------------------------------------------- |
| `on(channel, listener)`                    | Listen to channel. Auto-removes listener on unmount. |
| `once(channel, listener)`                  | Listen to channel once                               |
| `removeListener(channel, listener)`        | Remove specific listener                             |
| `removeAllListeners(channel)`              | Remove all listeners for channel                     |
| `send(channel, ...args)`                   | Send async message to main process                   |
| `invoke(channel, ...args)`                 | Send message and get the response as `Promise<T>`    |
| `sendSync(channel, ...args)`               | Send sync message and get the response as `T`        |
| `postMessage(channel, message, transfer?)` | Send message with transferable objects               |
| `sendTo(webContentsId, channel, ...args)`  | Send to specific webContents                         |
| `sendToHost(channel, ...args)`             | Send to webview host                                 |

### With Custom IpcRenderer

If `nodeIntegration` is disabled, you can pass the `ipcRenderer` instance explicitly:

```tsx
import { useIpcRenderer } from '@reaxuse/electron'
import { ipcRenderer } from 'electron'

const ipc = useIpcRenderer(ipcRenderer)
```

## React Deviations from Upstream

- **`on` no longer delegates to the `useIpcRendererOn` composable.** Upstream calls it inside the method; hooks cannot be called from callbacks. `on` registers the listener with `ipcRenderer.on` immediately and tracks the `{ channel, listener }` pair, and the hook's mount-effect cleanup removes every tracked listener on unmount — the same auto-cleanup guarantee upstream gets from its effect scope.
- **`invoke` returns `Promise<T>`** instead of a `ShallowRef<T | null>`: `ipcRenderer.invoke(channel, ...args)` is passed through as-is, including its rejections. Use `useIpcRendererInvoke` for declarative async state.
- **`sendSync` returns the raw value `T`** instead of a `ShallowRef<T | null>`.
- **Stabilise listeners you pass to `on`** (`useCallback`). The cleanup is identity-based, and a new listener identity registered on a later render is only removed by the next unmount, exactly like `ipcRenderer.on` itself.
- **Missing instance throws synchronously at render** (`provide IpcRenderer module or enable nodeIntegration`) — resolution happens in the hook body, not inside an effect.
