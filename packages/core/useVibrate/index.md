---
category: Browser
---

# useVibrate

Reactive [Vibration API](https://developer.mozilla.org/en-US/docs/Web/API/Vibration_API) — React port of VueUse's [`useVibrate`](https://vueuse.org/core/useVibrate/).

**Mapping:** the Vue `isSupported` ref becomes a plain boolean state resolved in a mount effect
(SSR-safe — the server renders `false` without touching `navigator`), and upstream's
`scheduler`-based `useIntervalFn` loop is ported inline: pass `interval` to re-trigger the pattern
every `interval` ms — the loop starts on `vibrate()` and is cancelled by `stop()` or unmount.

## Usage

```tsx
import { useVibrate } from '@reaxuse/core'

// This vibrates the device for 300 ms,
// then pauses for 100 ms before vibrating the device again for another 300 ms:
const { vibrate, stop, isSupported } = useVibrate({ pattern: [300, 100, 300] })

// Start the vibration, it stops automatically when the pattern is complete:
vibrate()

// But if you want to stop it, you can:
stop()
```

<DemoContainer name="UseVibrate" />

## Type Declarations

```ts
export interface UseVibrateOptions {
  pattern?: number | number[]
  interval?: number
  navigator?: Navigator
}

export interface UseVibrateReturn {
  isSupported: boolean
  pattern: number | number[]
  vibrate: (pattern?: number | number[]) => void
  stop: () => void
}

export function useVibrate(options?: UseVibrateOptions): UseVibrateReturn
```

## Source

- VueUse upstream mapping — `source/vueuse/packages/core/useVibrate/`:
  [`index.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useVibrate/index.ts) (implementation),
  [`index.test.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useVibrate/index.test.ts) (mirrored in `packages/core/src/useVibrate.test.tsx`),
  [`demo.vue`](https://github.com/vueuse/vueuse/blob/main/packages/core/useVibrate/demo.vue) (ported to `demo.tsx` below)
- reaxuse: [`packages/core/src/useVibrate.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/core/src/useVibrate.ts), docs + demo co-located in `packages/core/useVibrate/`

<Contributors name="useVibrate" />
