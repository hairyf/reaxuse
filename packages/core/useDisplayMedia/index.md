---
category: Sensors
---

# useDisplayMedia

Reactive [`mediaDevices.getDisplayMedia`](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getDisplayMedia) streaming — React port of VueUse's [`useDisplayMedia`](https://vueuse.org/core/useDisplayMedia/).

**Mapping:** upstream keeps the stream in a `shallowRef` with `start`/`stop` controls and a writable `enabled` flag whose watcher auto-starts and auto-stops the stream →
`useState` + `useEffect`: `stream`/`isSupported` become plain state (`enabled` is derived from the stream's presence), the controls are stable callbacks reading the latest
values through refs, upstream's per-track `ended` listeners become one effect keyed on the stream, the `enabled` option acquires the stream automatically once mounted
(and supported), and the scope-dispose stop becomes an unmount cleanup. `isSupported` comes from `useSupported` (resolves after mount, SSR-safe `false` until then).

## Usage

```tsx
import { useDisplayMedia } from '@reaxuse/core'

const { stream, start } = useDisplayMedia()
start()

const videoRef = useRef<HTMLVideoElement>(null)
useEffect(() => {
  // preview on a video element
  videoRef.current.srcObject = stream ?? null
}, [stream])
```

<DemoContainer name="UseDisplayMedia" />

## Type Declarations

```ts
export interface ConfigurableNavigator {
  navigator?: Navigator
}

export interface UseDisplayMediaOptions extends ConfigurableNavigator {
  enabled?: boolean
  video?: boolean | MediaTrackConstraints | undefined
  audio?: boolean | MediaTrackConstraints | undefined
}

export interface UseDisplayMediaReturn {
  isSupported: boolean
  stream: MediaStream | undefined
  start: () => Promise<MediaStream | undefined>
  stop: () => void
  enabled: boolean
}

export function useDisplayMedia(options?: UseDisplayMediaOptions): UseDisplayMediaReturn
```

## Source

- VueUse upstream mapping — `source/vueuse/packages/core/useDisplayMedia/`:
  [`index.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useDisplayMedia/index.ts) (implementation),
  [`demo.vue`](https://github.com/vueuse/vueuse/blob/main/packages/core/useDisplayMedia/demo.vue) (ported to `demo.tsx` below)
- reaxuse: [`packages/core/src/useDisplayMedia.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/core/src/useDisplayMedia.ts), docs + demo co-located in `packages/core/useDisplayMedia/`
- Upstream ships no test file — the vitest-browser-react suite is written fresh in `packages/core/src/useDisplayMedia.test.tsx`

<Contributors name="useDisplayMedia" />
