---
category: Browser
---

# useEyeDropper

Reactive [EyeDropper API](https://developer.mozilla.org/en-US/docs/Web/API/EyeDropper_API) — React port of VueUse's [`useEyeDropper`](https://vueuse.org/core/useEyeDropper/). The [EyeDropper API](https://developer.mozilla.org/en-US/docs/Web/API/EyeDropper_API) provides a mechanism for creating an eyedropper tool that lets the user sample colors from their screen.

**Mapping:** upstream returns an object of shallow refs (`isSupported`, `sRGBHex`) plus the `open` control function → a plain object of plain values held in `useState`s. `open` instantiates `window.EyeDropper`, resolves with `{ sRGBHex }` and updates the `sRGBHex` state; `isSupported` (upstream `useSupported`) is resolved in a mount effect, so SSR renders the defaults and `open()` resolves `undefined` when the API is unavailable.

## Usage

```tsx
import { useEyeDropper } from '@reaxuse/core'

const { isSupported, open, sRGBHex } = useEyeDropper()
```

<DemoContainer name="UseEyeDropper" />

## Type Declarations

```ts
export interface EyeDropperOpenOptions {
  signal?: AbortSignal
}

export interface EyeDropper {
  // eslint-disable-next-line ts/no-misused-new
  new(): EyeDropper
  open: (options?: EyeDropperOpenOptions) => Promise<{ sRGBHex: string }>
  [Symbol.toStringTag]: 'EyeDropper'
}

export interface UseEyeDropperOptions {
  initialValue?: string
}

export interface UseEyeDropperReturn {
  isSupported: boolean
  sRGBHex: string
  open: (openOptions?: EyeDropperOpenOptions) => Promise<{ sRGBHex: string } | undefined>
}

export function useEyeDropper(options?: UseEyeDropperOptions): UseEyeDropperReturn
```

## Source

- VueUse upstream mapping — `source/vueuse/packages/core/useEyeDropper/`:
  [`index.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useEyeDropper/index.ts) (implementation),
  [`demo.vue`](https://github.com/vueuse/vueuse/blob/main/packages/core/useEyeDropper/demo.vue) (ported to `demo.tsx` below)
- reaxuse: [`packages/core/src/useEyeDropper.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/core/src/useEyeDropper.ts), docs + demo co-located in `packages/core/useEyeDropper/`

<Contributors name="useEyeDropper" />
