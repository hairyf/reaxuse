---
category: Browser
---

# useMediaControls

Reactive media controls for both `audio` and `video` elements — React port of VueUse's [`useMediaControls`](https://vueuse.org/core/useMediaControls/).

**Mapping:** upstream's `shallowRef` returns become plain state values (`currentTime`, `duration`, `playing`, `volume`, `muted`, `rate`, `tracks`, `selectedTrack`, `buffered`, ...) returned from a single object. Mocked listeners attach in a `useEffect` to the resolved media element (a plain element, a ref-like `{ current }` object such as `useRef<HTMLVideoElement>(null)` — populated after mount and bound in the effect), and re-bind with cleanup when the target changes or the hook unmounts. The `src` and `tracks` options are injected into the element as `<source>` / `<track>` children (upstream `watchEffect`s). Where upstream exposes writable refs (`playing.value = true`, `volume.value = 0.5`, `currentTime.value = 60`, `rate.value = 2`, `muted.value = true`), React exposes control methods instead: `play` / `pause` / `toggle`, `seek`, `setVolume`, `setRate`, `mute` / `unmute` / `toggleMute` — each writing through to the element. `enableTrack` / `disableTrack` / `togglePictureInPicture` and the `onSourceError` / `onPlaybackError` hooks are ported as-is. SSR-safe: nothing touches the element or `document` during render.

## Usage

```tsx
import { useMediaControls } from '@reaxuse/core'
import { useEffect, useRef } from 'react'

const video = useRef<HTMLVideoElement>(null)
const { playing, currentTime, duration, volume, setVolume, toggle, seek } = useMediaControls(video, {
  src: 'video.mp4',
})

// Change initial media properties
useEffect(() => {
  setVolume(0.5)
  seek(60)
}, [])

// <video ref={video} onClick={() => toggle()} />
// <span>{formatDuration(currentTime)} / {formatDuration(duration)}</span>
```

### Providing Captions, Subtitles, etc...

You can provide captions, subtitles, etc in the `tracks` options of the
`useMediaControls` function. The function will return an array of tracks
along with two functions for controlling them, `enableTrack`, `disableTrack`, and `selectedTrack`.
Using these you can manage the currently selected track. `selectedTrack` will
be `-1` if there is no selected track.

```tsx
import { useMediaControls } from '@reaxuse/core'
import { useRef } from 'react'

const video = useRef<HTMLVideoElement>(null)
const {
  tracks,
  enableTrack,
} = useMediaControls(video, {
  src: 'video.mp4',
  tracks: [
    {
      default: true,
      src: './subtitles.vtt',
      kind: 'subtitles',
      label: 'English',
      srcLang: 'en',
    },
  ],
})
```

// <video ref={video} />
// {tracks.map(track => (
// <button type="button" key={track.id} onClick={() => enableTrack(track)}>
// {track.label}
// </button>
// ))}

````

## Playback Controls

Upstream's writable refs (`playing`, `currentTime`, `volume`, `rate`, `muted`)
are control methods here (see the Mapping note above). They all resolve the
current target element at call time (upstream `usingElRef`) and are
referentially stable:

```tsx
const {
  play, // () => void        — start playback
  pause, // () => void        — pause playback
  toggle, // () => void        — play / pause toggle
  seek, // (time: number) => void — jump to `time` seconds
  setVolume, // (volume: number) => void — 0..1
  setRate, // (rate: number) => void   — e.g. 0.5 / 1 / 2
  mute, // () => void
  unmute, // () => void
  toggleMute, // () => void
} = useMediaControls(videoRef)
````

<DemoContainer name="UseMediaControls" />

## Type Declarations

```ts
export interface UseMediaSource {
  src: string
  type?: string
  media?: string
}

export interface UseMediaTextTrackSource {
  default?: boolean
  kind: TextTrackKind
  label: string
  src: string
  srcLang: string
}

export type UseMediaControlsTarget = RefOrValue<HTMLMediaElement | null | undefined>

export interface UseMediaControlsOptions {
  document?: Document
  src?: RefOrValue<string | UseMediaSource | UseMediaSource[]>
  tracks?: RefOrValue<UseMediaTextTrackSource[]>
}

export interface UseMediaTextTrack {
  id: number
  label: string
  language: string
  mode: TextTrackMode
  kind: TextTrackKind
  inBandMetadataTrackDispatchType: string
  cues: TextTrackCueList | null
  activeCues: TextTrackCueList | null
}

export interface UseMediaControlsReturn {
  currentTime: number
  duration: number
  waiting: boolean
  seeking: boolean
  ended: boolean
  stalled: boolean
  buffered: [number, number][]
  playing: boolean
  rate: number
  volume: number
  muted: boolean
  tracks: UseMediaTextTrack[]
  selectedTrack: number
  supportsPictureInPicture: boolean
  isPictureInPicture: boolean
  onSourceError: EventHookOn<Event>
  onPlaybackError: EventHookOn<Event>
  play: () => void
  pause: () => void
  toggle: () => void
  seek: (time: number) => void
  setVolume: (volume: number) => void
  mute: () => void
  unmute: () => void
  toggleMute: () => void
  setRate: (rate: number) => void
  enableTrack: (track: number | UseMediaTextTrack, disableTracks?: boolean) => void
  disableTrack: (track?: number | UseMediaTextTrack) => void
  togglePictureInPicture: () => Promise<PictureInPictureWindow | void>
}

export function useMediaControls(
  target: UseMediaControlsTarget,
  options?: UseMediaControlsOptions,
): UseMediaControlsReturn
```

## Source

- VueUse upstream mapping — `source/vueuse/packages/core/useMediaControls/`:
  [`index.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useMediaControls/index.ts) (implementation),
  [`demo.vue`](https://github.com/vueuse/vueuse/blob/main/packages/core/useMediaControls/demo.vue) (ported to `demo.tsx` below);
  upstream ships no tests, so `packages/core/src/useMediaControls.test.tsx`
  covers the object-mirror contract: initial state, the media events
  (`timeupdate` / `durationchange` / `volumechange` / `ratechange` / `play` /
  `pause` / `seeking` / `seeked` / `waiting` / `loadeddata` / `ended` /
  `stalled` / `progress`), the control methods, `src` / `tracks` injection,
  listener cleanup on unmount and target change, and SSR safety
- reaxuse: [`packages/core/src/useMediaControls.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/core/src/useMediaControls.ts), docs + demo co-located in `packages/core/useMediaControls/`

<Contributors name="useMediaControls" />
