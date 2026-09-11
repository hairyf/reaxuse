---
category: '@Electron'
---

# useIpcRenderer

Provides [ipcRenderer](https://www.electronjs.org/docs/api/ipc-renderer) and all of its APIs.

## Usage

```tsx
import { useIpcRenderer } from '@reause/electron'

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
import { useIpcRenderer } from '@reause/electron'
import { ipcRenderer } from 'electron'

const ipc = useIpcRenderer(ipcRenderer)
```
