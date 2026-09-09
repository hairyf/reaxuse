import type { ConfigurableNavigator } from '../useUserMedia'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useSupported } from '../useSupported'

/**
 * Options for `useDisplayMedia`.
 */
export interface UseDisplayMediaOptions extends ConfigurableNavigator {
  /**
   * If the stream is enabled. With an initial `true` the stream is acquired
   * automatically once mounted (and supported).
   * @default false
   */
  enabled?: boolean
  /**
   * If the stream video media constraints
   */
  video?: boolean | MediaTrackConstraints | undefined
  /**
   * If the stream audio media constraints
   */
  audio?: boolean | MediaTrackConstraints | undefined
}

/**
 * Return type of `useDisplayMedia`.
 */
export interface UseDisplayMediaReturn {
  isSupported: boolean
  stream: MediaStream | undefined
  start: () => Promise<MediaStream | undefined>
  stop: () => void
  enabled: boolean
}

/**
 * React port of VueUse's `useDisplayMedia`.
 *
 * Map from @vueuse/core `useDisplayMedia`
 * (`source/vueuse/packages/core/useDisplayMedia/`). Reactive
 * [`mediaDevices.getDisplayMedia`](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getDisplayMedia)
 * streaming.
 *
 * Adjustment for React:
 * - the Vue `stream`/`isSupported` refs become plain state values read off
 *   the result object (no `.value`); `enabled` is derived from the stream's
 *   presence (upstream keeps a writable ref whose watcher drives the stream);
 * - `start`/`stop` are stable callbacks reading the latest state and options
 *   through refs; the `enabled` option acquires the stream automatically
 *   once mounted (and supported), mirroring upstream's
 *   `watch(enabled, ..., { immediate: true })`;
 * - upstream's per-track `useEventListener(t, 'ended', stop)` becomes one
 *   effect keyed on the stream binding an `ended` listener to every track,
 *   removed when the stream changes or the hook unmounts;
 * - concurrent `start()` calls share one pending acquisition (React effects
 *   can re-run; upstream's watcher fires once);
 * - `tryOnScopeDispose(stop)` becomes an unmount cleanup.
 *
 * @see https://vueuse.org/useDisplayMedia
 *
 * @__NO_SIDE_EFFECTS__
 *
 * @example
 * const { stream, start } = useDisplayMedia()
 * start()
 * // preview on a video element
 * videoEl.srcObject = stream
 */
export function useDisplayMedia(options: UseDisplayMediaOptions = {}): UseDisplayMediaReturn {
  const [stream, setStream] = useState<MediaStream | undefined>(undefined)
  const isSupported = useSupported(() => {
    const nav = options.navigator ?? (typeof navigator === 'undefined' ? undefined : navigator)
    return Boolean(nav?.mediaDevices?.getDisplayMedia)
  })
  const enabled = stream !== undefined

  // Latest-value refs keeping the stable callbacks fresh without changing
  // their identities across renders.
  const optionsRef = useRef(options)
  optionsRef.current = options
  const isSupportedRef = useRef(false)
  isSupportedRef.current = isSupported
  const streamRef = useRef<MediaStream | undefined>(undefined)
  const pendingRef = useRef<Promise<MediaStream | undefined> | undefined>(undefined)

  const updateStream = useCallback((value: MediaStream | undefined) => {
    streamRef.current = value
    setStream(value)
  }, [])

  const resolveNavigator = useCallback((): Navigator | undefined => {
    return optionsRef.current.navigator ?? (typeof navigator === 'undefined' ? undefined : navigator)
  }, [])

  const start = useCallback((): Promise<MediaStream | undefined> => {
    // Already streaming: mirror upstream and hand back the live stream.
    if (streamRef.current)
      return Promise.resolve(streamRef.current)
    // Share a single acquisition while one is pending.
    if (pendingRef.current)
      return pendingRef.current
    if (!isSupportedRef.current)
      return Promise.resolve(undefined)
    const nav = resolveNavigator()
    if (!nav?.mediaDevices?.getDisplayMedia)
      return Promise.resolve(undefined)
    const acquisition = nav.mediaDevices.getDisplayMedia({
      audio: optionsRef.current.audio,
      video: optionsRef.current.video,
    }).then((mediaStream) => {
      updateStream(mediaStream)
      return mediaStream
    })
    pendingRef.current = acquisition
    const settle = () => {
      pendingRef.current = undefined
    }
    acquisition.then(settle, settle)
    return acquisition
  }, [resolveNavigator, updateStream])

  const stop = useCallback((): void => {
    streamRef.current?.getTracks().forEach(track => track.stop())
    updateStream(undefined)
  }, [updateStream])

  // Mirror of upstream's `watch(enabled, ..., { immediate: true })`: with the
  // `enabled` option the stream is acquired automatically once mounted (and
  // supported). `enabled` is derived from the stream, so there is no reverse
  // direction to watch — stopping always clears the stream.
  useEffect(() => {
    if (optionsRef.current.enabled)
      void start()
  }, [isSupported, start])

  // Mirror of upstream's per-track `useEventListener(t, 'ended', stop)`: when
  // a track ends natively (e.g. the user stops sharing from the browser UI),
  // stop the whole stream.
  useEffect(() => {
    if (!stream)
      return
    const tracks = stream.getTracks()
    const handleEnded = () => stop()
    tracks.forEach(track => track.addEventListener('ended', handleEnded, { passive: true }))
    return () => {
      tracks.forEach(track => track.removeEventListener('ended', handleEnded))
    }
  }, [stream, stop])

  // Mirror of upstream's `tryOnScopeDispose(stop)`.
  useEffect(() => {
    return () => {
      stop()
    }
  }, [stop])

  return {
    isSupported,
    stream,
    start,
    stop,
    enabled,
  }
}
