---
category: '@Electron'
---

# useIpcRendererInvoke

Reactive [ipcRenderer.invoke API](https://www.electronjs.org/docs/api/ipc-renderer#ipcrendererinvokechannel-args) result — React port of VueUse's [`useIpcRendererInvoke`](https://vueuse.org/electron/useIpcRendererInvoke/).

Upstream returns a `ShallowRef<T | null>`; a React hook cannot return a ref, so this port returns the plain value `T | null` (same non-tuple precedent as `useQRCode`'s plain `string`). The initial value is `null` until the promise settles.

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

<DemoContainer name="UseIpcRendererInvoke" />

## Type Declarations

```ts
export function useIpcRendererInvoke<T>(ipcRenderer: IpcRenderer, channel: string, ...args: any[]): T | null

export function useIpcRendererInvoke<T>(channel: string, ...args: any[]): T | null
```

## Source

- VueUse upstream mapping — `source/vueuse/packages/electron/useIpcRendererInvoke/`:
  [`index.ts`](https://github.com/vueuse/vueuse/blob/main/packages/electron/useIpcRendererInvoke/index.ts) (implementation),
  [`index.md`](https://github.com/vueuse/vueuse/blob/main/packages/electron/useIpcRendererInvoke/index.md) (docs).
- reaxuse: [`packages/electron/src/useIpcRendererInvoke.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/electron/src/useIpcRendererInvoke.ts), docs + demo co-located in `packages/electron/useIpcRendererInvoke/`

<Contributors name="useIpcRendererInvoke" />
