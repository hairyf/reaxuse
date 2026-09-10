---
category: '@Electron'
---

# useIpcRendererOn

Use [ipcRenderer.on](https://www.electronjs.org/docs/api/ipc-renderer#ipcrendereronchannel-listener) with ease and [ipcRenderer.removeListener](https://www.electronjs.org/docs/api/ipc-renderer#ipcrendererremovelistenerchannel-listener) automatically on unmounted.

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

## Type Declarations

```ts
/**
 * Listens to channel, when a new message arrives listener would be called with `listener(event, args...)`.
 * [`ipcRenderer.removeListener`](https://www.electronjs.org/docs/api/ipc-renderer#ipcrendererremovelistenerchannel-listener) automatically on unmounted.
 *
 * You need to provide `ipcRenderer` to this function.
 *
 * Map from @vueuse/electron `useIpcRendererOn`
 * (`source/vueuse/packages/electron/useIpcRendererOn/`).
 *
 * React deviations:
 * - upstream registers the listener at setup and removes it in
 *   `tryOnScopeDispose`; here a mount effect registers the **actual**
 *   `listener` you passed (no wrapper) and removes it by the same identity on
 *   unmount, so `removeListener(channel, listener)` always matches;
 * - because `listener` is an effect dependency, a new listener identity
 *   re-registers (remove + add). Stabilise it with `useCallback`, or use the
 *   `useListener` protocol where it fits;
 * - the instance is resolved at render, so a missing `ipcRenderer` throws
 *   synchronously instead of at effect time.
 *
 * @see https://www.electronjs.org/docs/api/ipc-renderer#ipcrendereronchannel-listener
 * @see https://vueuse.org/useIpcRendererOn
 *
 * @example
 * useIpcRendererOn('custom-event', (event, ...args) => {
 *   console.log(args)
 * })
 *
 * @__NO_SIDE_EFFECTS__
 */
export declare function useIpcRendererOn(
  ipcRenderer: IpcRenderer,
  channel: string,
  listener: IpcRendererListener,
): IpcRenderer
/**
 * Listens to channel, when a new message arrives listener would be called with `listener(event, args...)`.
 * [`ipcRenderer.removeListener`](https://www.electronjs.org/docs/api/ipc-renderer#ipcrendererremovelistenerchannel-listener) automatically on unmounted.
 *
 * `ipcRenderer` will be automatically gotten (`window.require('electron')`, i.e. `nodeIntegration`).
 *
 * Map from @vueuse/electron `useIpcRendererOn`
 * (`source/vueuse/packages/electron/useIpcRendererOn/`).
 *
 * @see https://www.electronjs.org/docs/api/ipc-renderer#ipcrendereronchannel-listener
 * @see https://vueuse.org/useIpcRendererOn
 *
 * @__NO_SIDE_EFFECTS__
 */
export declare function useIpcRendererOn(
  channel: string,
  listener: IpcRendererListener,
): IpcRenderer
```
