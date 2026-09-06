---
category: Sensors
---

# useUserMedia

Reactive [`mediaDevices.getUserMedia`](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia) streaming — React port of VueUse's [`useUserMedia`](https://vueuse.org/core/useUserMedia/).

**Mapping:** upstream keeps the stream in a `shallowRef` with `start`/`stop`/`restart`
controls and an `enabled` flag whose watcher auto-starts and auto-stops the stream →
`useState` + `useEffect`: `stream`/`enabled`/`isSupported` become plain state, the
controls are stable callbacks reading the latest values through refs, and the
scope-dispose stop becomes an unmount cleanup. The supported check runs in a mount
effect (SSR-safe `false` until then); a changed `constraints` option recreates the
stream while streaming when `autoSwitch` is on — React hands the hook new option
objects where upstream deep-watches a reactive ref, so the comparison is structural.

## Usage

```tsx
import { useUserMedia } from '@reaxuse/core'

const { stream, start } = useUserMedia()
start()

const videoRef = useRef<HTMLVideoElement>(null)
useEffect(() => {
  // preview on a video element
  videoRef.current.srcObject = stream ?? null
}, [stream])
```

<DemoContainer name="UseUserMedia" />

## Type Declarations

```ts
export interface ConfigurableNavigator {
  navigator?: Navigator
}

export interface UseUserMediaOptions extends ConfigurableNavigator {
  enabled?: boolean
  autoSwitch?: boolean
  constraints?: MediaStreamConstraints
}

export interface UseUserMediaReturn {
  isSupported: boolean
  stream: MediaStream | undefined
  start: () => Promise<MediaStream | undefined>
  stop: () => void
  restart: () => Promise<MediaStream | undefined>
  constraints: MediaStreamConstraints | undefined
  enabled: boolean
  autoSwitch: boolean
}

export function useUserMedia(options?: UseUserMediaOptions): UseUserMediaReturn
```

## Source

- VueUse upstream mapping — `source/vueuse/packages/core/useUserMedia/`:
  [`index.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useUserMedia/index.ts) (implementation),
  [`demo.vue`](https://github.com/vueuse/vueuse/blob/main/packages/core/useUserMedia/demo.vue) (ported to `demo.tsx` below; the upstream camera-picker demo section is omitted because the device-list hook is not ported yet)
- reaxuse: [`packages/core/src/useUserMedia.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/core/src/useUserMedia.ts), docs + demo co-located in `packages/core/useUserMedia/`
- Upstream ships no test file — the vitest-browser-react suite is written fresh in `packages/core/src/useUserMedia.test.tsx`

<Contributors name="useUserMedia" />
