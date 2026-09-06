---
category: Sensors
---

# useDevicePixelRatio

Reactively track [`window.devicePixelRatio`](https://developer.mozilla.org/docs/Web/API/Window/devicePixelRatio) — React port of VueUse's [`useDevicePixelRatio`](https://vueuse.org/core/useDevicePixelRatio/).

> NOTE: there is no event listener for `window.devicePixelRatio` change. So this function uses [`Testing media queries programmatically (window.matchMedia)`](https://developer.mozilla.org/en-US/docs/Web/CSS/Media_Queries/Testing_media_queries) applying the same mechanism as described in [this example](https://developer.mozilla.org/en-US/docs/Web/API/Window/devicePixelRatio#monitoring_screen_resolution_or_zoom_level_changes).

**Mapping:** upstream's `shallowRef(1)` + `watchImmediate` over a `useMediaQuery('(resolution: N dppx)')` becomes a plain `{ pixelRatio }` number state synced in a mount `useEffect` that subscribes a `matchMedia` `change` listener and re-subscribes whenever the tracked ratio changes (so the query always targets the current resolution). SSR renders the `1` default without touching `window`. The component variant is not ported.

## Usage

```tsx
import { useDevicePixelRatio } from '@reaxuse/core'

const { pixelRatio } = useDevicePixelRatio()

console.log(pixelRatio)
```

<DemoContainer name="UseDevicePixelRatio" />

## Type Declarations

```ts
export interface UseDevicePixelRatioOptions extends ConfigurableWindow {}

export interface UseDevicePixelRatioReturn {
  pixelRatio: number
}

export function useDevicePixelRatio(options?: UseDevicePixelRatioOptions): UseDevicePixelRatioReturn
```

## Source

- VueUse upstream mapping — `source/vueuse/packages/core/useDevicePixelRatio/`:
  [`index.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useDevicePixelRatio/index.ts) (implementation),
  [`index.md`](https://github.com/vueuse/vueuse/blob/main/packages/core/useDevicePixelRatio/index.md) (docs),
  [`demo.vue`](https://github.com/vueuse/vueuse/blob/main/packages/core/useDevicePixelRatio/demo.vue) (ported to `demo.tsx` below)
- reaxuse: [`packages/core/src/useDevicePixelRatio.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/core/src/useDevicePixelRatio.ts), docs + demo co-located in `packages/core/useDevicePixelRatio/`

<Contributors name="useDevicePixelRatio" />
