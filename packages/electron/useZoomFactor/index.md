---
category: '@Electron'
---

# useZoomFactor

Reactive [WebFrame](https://www.electronjs.org/docs/api/web-frame#webframe) zoom factor — React port of VueUse's [`useZoomFactor`](https://vueuse.org/electron/useZoomFactor/).

**Mapping:** upstream returns a writable Vue `Ref<number>` whose setter writes to `webFrame.setZoomFactor` → this port returns the React tuple `[factor, setFactor]`. `setFactor(value)` validates the value, calls `webFrame.setZoomFactor(value)` and updates the returned factor. Passing a factor (a plain number or a React ref) applies it on mount and re-applies it whenever the external value changes; the last value written to `webFrame` is tracked internally, so a redundant render never re-writes the same factor.

## Usage

```tsx
import { useZoomFactor } from '@reaxuse/electron'

// enable nodeIntegration if you don't provide webFrame explicitly
// see: https://www.electronjs.org/docs/api/webview-tag#nodeintegration
// tuple result will return
const [factor, setFactor] = useZoomFactor()
console.log(factor) // print current zoom factor
setFactor(2) // change current zoom factor
```

Set initial zoom factor immediately

```tsx
import { useZoomFactor } from '@reaxuse/electron'

const [factor] = useZoomFactor(2)
```

Pass a ref and the factor will be updated when the source ref changes

```tsx
import { useZoomFactor } from '@reaxuse/electron'
import { useRef } from 'react'

const factor = useRef(1)

useZoomFactor(factor) // zoom factor will match with the ref

factor.current = 2 // zoom factor will change
```

## API

```ts
export type ZoomFactorSetter = (value: number) => void

export function useZoomFactor(factor?: RefOrValue<number>): [number, ZoomFactorSetter]
export function useZoomFactor(webFrame: WebFrame, factor?: RefOrValue<number>): [number, ZoomFactorSetter]
```

| Parameter  | Type                 | Description                                                                                                |
| ---------- | -------------------- | ---------------------------------------------------------------------------------------------------------- |
| `webFrame` | `WebFrame`           | Optional Electron `WebFrame` instance. When omitted it is resolved from `window.require('electron')`.      |
| `factor`   | `RefOrValue<number>` | Optional initial factor — a plain number or a React ref. When omitted, `webFrame.getZoomFactor()` is read. |

Returns the tuple `[factor, setFactor]`: the current factor and the setter that writes it to `webFrame`.

## Notes

- The upstream `0` guard is kept verbatim: `useZoomFactor(webFrame, 0)` and `setFactor(0)` both throw `the factor must be greater than 0.0.`
- Without an explicit `webFrame` and without `nodeIntegration`, the hook throws `provide WebFrame module or enable nodeIntegration` (same as upstream).
- `electron` is imported as a type only, so the hook can be used (and tested) in a plain browser as long as a `webFrame` stub is passed.

## Source

- VueUse upstream mapping — `source/vueuse/packages/electron/useZoomFactor/`:
  [`index.ts`](https://github.com/vueuse/vueuse/blob/main/packages/electron/useZoomFactor/index.ts) (implementation),
  [`index.md`](https://github.com/vueuse/vueuse/blob/main/packages/electron/useZoomFactor/index.md) (docs)
- reaxuse: [`packages/electron/src/useZoomFactor.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/electron/src/useZoomFactor.ts), docs + demo co-located in `packages/electron/useZoomFactor/` ([`demo.tsx`](./demo.tsx), a demo-only `webFrame` stub — a browser page has no Electron runtime)

<Contributors name="useZoomFactor" />
