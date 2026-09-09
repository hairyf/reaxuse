---
category: '@Electron'
---

# useIpcRendererOn

Use [ipcRenderer.on](https://www.electronjs.org/docs/api/ipc-renderer#ipcrendereronchannel-listener) with ease and [ipcRenderer.removeListener](https://www.electronjs.org/docs/api/ipc-renderer#ipcrendererremovelistenerchannel-listener) automatically on unmounted — React port of VueUse's [`useIpcRendererOn`](https://vueuse.org/electron/useIpcRendererOn/).

## Usage

```tsx
import { useIpcRendererOn } from '@reaxuse/electron'

// enable nodeIntegration if you don't provide ipcRenderer explicitly
// see: https://www.electronjs.org/docs/api/webview-tag#nodeintegration
// remove listener automatically on unmounted
useIpcRendererOn('custom-event', (event, ...args) => {
  console.log(args)
})
```

### With Custom IpcRenderer

```tsx
import { useIpcRendererOn } from '@reaxuse/electron'
import { ipcRenderer } from 'electron'

useIpcRendererOn(ipcRenderer, 'custom-event', (event, ...args) => {
  console.log(args)
})
```

## React Deviations from Upstream

- **The actual `listener` you pass is registered** (no wrapper), so `ipcRenderer.removeListener(channel, listener)` on unmount matches by identity.
- **`listener` is an effect dependency**: a new listener identity re-registers (remove + add). Stabilise it with `useCallback`, or use the `useListener` protocol where it fits. `channel` changes likewise re-register.
- **Returns the `ipcRenderer` instance** (upstream parity — chainable), not a tuple: this is a subscription, not state.
- **Missing instance throws synchronously at render** (`please provide IpcRenderer module or enable nodeIntegration`) — resolution happens in the hook body, not inside an effect.

## Type Declarations

```ts
export function useIpcRendererOn(ipcRenderer: IpcRenderer, channel: string, listener: IpcRendererListener): IpcRenderer

export function useIpcRendererOn(channel: string, listener: IpcRendererListener): IpcRenderer
```

## Source

- VueUse upstream mapping — `source/vueuse/packages/electron/useIpcRendererOn/`:
  [`index.ts`](https://github.com/vueuse/vueuse/blob/main/packages/electron/useIpcRendererOn/index.ts) (implementation),
  [`index.md`](https://github.com/vueuse/vueuse/blob/main/packages/electron/useIpcRendererOn/index.md) (docs).
- reaxuse: [`packages/electron/src/useIpcRendererOn.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/electron/src/useIpcRendererOn.ts), docs + demo co-located in `packages/electron/useIpcRendererOn/`:
  [`demo.tsx`](https://github.com/hairyf/reaxuse/blob/main/packages/electron/useIpcRendererOn/demo.tsx) (runnable demo).

<Contributors name="useIpcRendererOn" />
