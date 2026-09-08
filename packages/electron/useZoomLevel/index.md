---
category: '@Electron'
---

# useZoomLevel

Reactive [WebFrame](https://www.electronjs.org/docs/api/web-frame#webframe) zoom level — React port of VueUse's [`useZoomLevel`](https://vueuse.org/electron/useZoomLevel/).

**Mapping:** upstream returns a writable Vue `Ref<number>` whose setter writes to `webFrame.setZoomLevel` → this port returns the React tuple `[level, setLevel]`. `setLevel(value)` calls `webFrame.setZoomLevel(value)` and updates the returned level. Passing a level (a plain number or a React ref) applies it on mount and re-applies it whenever the external value changes; the last value written to `webFrame` is tracked internally, so a redundant render never re-writes the same level.

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

## API

```ts
export type ZoomLevelSetter = (value: number) => void

export function useZoomLevel(level?: RefOrValue<number>): [number, ZoomLevelSetter]
export function useZoomLevel(webFrame: WebFrame, level?: RefOrValue<number>): [number, ZoomLevelSetter]
```

| Parameter  | Type                 | Description                                                                                              |
| ---------- | -------------------- | -------------------------------------------------------------------------------------------------------- |
| `webFrame` | `WebFrame`           | Optional Electron `WebFrame` instance. When omitted it is resolved from `window.require('electron')`.    |
| `level`    | `RefOrValue<number>` | Optional initial level — a plain number or a React ref. When omitted, `webFrame.getZoomLevel()` is read. |

Returns the tuple `[level, setLevel]`: the current level and the setter that writes it to `webFrame`.

## Notes

- Upstream has no range guard for zoom levels, so neither has this port — `0` is a valid level, and `useZoomLevel(webFrame, 0)` does not throw (unlike `useZoomFactor`).
- Without an explicit `webFrame` and without `nodeIntegration`, the hook throws `provide WebFrame module or enable nodeIntegration` (same as upstream).
- `electron` is imported as a type only, so the hook can be used (and tested) in a plain browser as long as a `webFrame` stub is passed.

## Source

- VueUse upstream mapping — `source/vueuse/packages/electron/useZoomLevel/`:
  [`index.ts`](https://github.com/vueuse/vueuse/blob/main/packages/electron/useZoomLevel/index.ts) (implementation),
  [`index.md`](https://github.com/vueuse/vueuse/blob/main/packages/electron/useZoomLevel/index.md) (docs)
- reaxuse: [`packages/electron/src/useZoomLevel.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/electron/src/useZoomLevel.ts), docs + demo co-located in `packages/electron/useZoomLevel/` ([`demo.tsx`](./demo.tsx), a demo-only `webFrame` stub — a browser page has no Electron runtime)

<Contributors name="useZoomLevel" />
