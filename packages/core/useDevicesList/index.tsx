import type { ConfigurableNavigator } from '../useUserMedia'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { usePermission } from '../usePermission'
import { useSupported } from '../useSupported'

export interface UseDevicesListOptions extends ConfigurableNavigator {
  /**
   * Request for permissions immediately if it's not granted,
   * otherwise label and deviceIds could be empty
   *
   * @default false
   */
  requestPermissions?: boolean
  /**
   * Request for types of media permissions
   *
   * @default { audio: true, video: true }
   */
  constraints?: MediaStreamConstraints
}

export interface UseDevicesListReturn {
  /**
   * All devices
   */
  devices: MediaDeviceInfo[]
  videoInputs: MediaDeviceInfo[]
  audioInputs: MediaDeviceInfo[]
  audioOutputs: MediaDeviceInfo[]
  isSupported: boolean
  permissionGranted: boolean
  ensurePermissions: () => Promise<boolean>
  /**
   * Register a callback fired after every successful device enumeration
   * (`devices` update) — `useListener` protocol `(fn) => { off }`.
   */
  onUpdated: (fn: (devices: MediaDeviceInfo[]) => void) => { off: () => void }
}

/**
 * React port of VueUse's `useDevicesList`.
 *
 * Map from @vueuse/core `useDevicesList`
 * (`source/vueuse/packages/core/useDevicesList/`). Reactive
 * [enumerateDevices](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/enumerateDevices)
 * listing available input/output devices.
 *
 * `devices` is plain state populated from
 * `navigator.mediaDevices.enumerateDevices()` in a mount effect and refreshed
 * on every `devicechange` event. `videoInputs` / `audioInputs` /
 * `audioOutputs` are derived filters over `devices`, and `ensurePermissions()`
 * requests media permissions on demand (so `device.label` and `deviceId`
 * become non-empty) — `permissionGranted` reflects the outcome.
 *
 * React divergences:
 * - the Vue `devices`/`permissionGranted` shallow refs become plain state;
 *   `videoInputs`/`audioInputs`/`audioOutputs` are `useMemo` filters instead
 *   of `computed`s;
 * - `isSupported` comes from `useSupported` (resolves after mount, stays
 *   `false` on the server) and gates a mount effect that registers the
 *   `devicechange` listener, runs the initial enumeration and optionally
 *   requests permissions (upstream: `if (isSupported.value)` setup block +
 *   `useEventListener`);
 * - upstream's `onUpdated` option becomes an `onUpdated` registration
 *   function in the return (`(fn) => { off }`, `useListener` protocol),
 *   invoked after every successful enumeration;
 * - upstream calls `usePermission` lazily inside `ensurePermissions`; React
 *   hooks can't be called on demand, so the permission query is hoisted to
 *   the hook top and `ensurePermissions` re-queries through its stable
 *   `query` handle (upstream re-created the hook per call, re-querying the
 *   same status);
 * - the transient `getUserMedia` stream that triggers the permission prompt
 *   is held in a ref (upstream: closure variable) and stopped after the next
 *   enumeration.
 *
 * @example
 * const { devices, videoInputs: cameras, audioInputs: microphones, audioOutputs: speakers } = useDevicesList()
 */
export function useDevicesList(options: UseDevicesListOptions = {}): UseDevicesListReturn {
  const {
    requestPermissions = false,
    constraints = { audio: true, video: true },
  } = options

  const [devices, setDevices] = useState<MediaDeviceInfo[]>([])
  const [permissionGranted, setPermissionGranted] = useState(false)

  const isSupported = useSupported(() => {
    const nav = options.navigator ?? (typeof navigator === 'undefined' ? undefined : navigator)
    return Boolean(nav?.mediaDevices?.enumerateDevices)
  })

  // Hoisted upstream's lazy `usePermission` inside `ensurePermissions` — the
  // stable `query` handle re-queries on demand.
  const { query } = usePermission(constraints.video ? 'camera' : 'microphone', { controls: true })

  // Latest-value refs keep the stable callbacks fresh without re-creating
  // their identities across renders.
  const isSupportedRef = useRef(false)
  isSupportedRef.current = isSupported
  const permissionGrantedRef = useRef(false)
  const constraintsRef = useRef(constraints)
  constraintsRef.current = constraints
  const navigatorRef = useRef<Navigator | undefined>(
    options.navigator ?? (typeof navigator === 'undefined' ? undefined : navigator),
  )
  navigatorRef.current = options.navigator ?? (typeof navigator === 'undefined' ? undefined : navigator)
  // The transient stream acquired to trigger the permission prompt (upstream:
  // closure variable — a ref survives React renders and stays stop-able).
  const streamRef = useRef<MediaStream | null>(null)

  // `onUpdated` — upstream's option callback becomes a `useListener`-style
  // registration function fired after every successful enumeration.
  const updatedFns = useRef(new Set<(devices: MediaDeviceInfo[]) => void>())

  const onUpdated = useCallback((fn: (devices: MediaDeviceInfo[]) => void) => {
    updatedFns.current.add(fn)
    return {
      off: () => {
        updatedFns.current.delete(fn)
      },
    }
  }, [])

  const updateTrigger = useCallback((nextDevices: MediaDeviceInfo[]) => {
    Array.from(updatedFns.current).forEach(fn => fn(nextDevices))
  }, [])

  // Unmount cleanup of the event subscriptions (upstream `tryOnScopeDispose`).
  useEffect(() => {
    return () => {
      updatedFns.current.clear()
    }
  }, [])

  const update = useCallback(async () => {
    if (!isSupportedRef.current)
      return

    const nav = navigatorRef.current
    if (!nav?.mediaDevices)
      return

    const nextDevices = await nav.mediaDevices.enumerateDevices()
    setDevices(nextDevices)
    updateTrigger(nextDevices)

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
  }, [updateTrigger])

  const ensurePermissions = useCallback(async (): Promise<boolean> => {
    const currentConstraints = constraintsRef.current

    if (!isSupportedRef.current)
      return false
    if (permissionGrantedRef.current)
      return true

    const status = await query()
    if (status?.state !== 'granted') {
      let granted = true
      try {
        const nav = navigatorRef.current
        const allDevices = await nav!.mediaDevices.enumerateDevices()
        const hasCamera = allDevices.some(device => device.kind === 'videoinput')
        const hasMicrophone = allDevices.some(device => device.kind === 'audioinput' || device.kind === 'audiooutput')
        streamRef.current = await nav!.mediaDevices.getUserMedia({
          video: hasCamera ? currentConstraints.video : false,
          audio: hasMicrophone ? currentConstraints.audio : false,
        })
      }
      catch {
        streamRef.current = null
        granted = false
      }
      void update()
      permissionGrantedRef.current = granted
      setPermissionGranted(granted)
    }
    else {
      permissionGrantedRef.current = true
      setPermissionGranted(true)
    }

    return permissionGrantedRef.current
  }, [query, update])

  // Initial enumeration + `devicechange` listener + optional permission
  // request, once supported (upstream: `if (isSupported.value)` setup block +
  // `useEventListener(navigator.mediaDevices, 'devicechange', update)`).
  useEffect(() => {
    if (!isSupported)
      return

    const mediaDevices = navigatorRef.current?.mediaDevices
    if (!mediaDevices)
      return

    const onDeviceChange = () => {
      void update()
    }
    mediaDevices.addEventListener('devicechange', onDeviceChange, { passive: true })
    void update()
    if (requestPermissions)
      void ensurePermissions()

    return () => {
      mediaDevices.removeEventListener('devicechange', onDeviceChange)
    }
  }, [isSupported, requestPermissions, update, ensurePermissions])

  const videoInputs = useMemo(() => devices.filter(device => device.kind === 'videoinput'), [devices])
  const audioInputs = useMemo(() => devices.filter(device => device.kind === 'audioinput'), [devices])
  const audioOutputs = useMemo(() => devices.filter(device => device.kind === 'audiooutput'), [devices])

  return {
    devices,
    videoInputs,
    audioInputs,
    audioOutputs,
    isSupported,
    permissionGranted,
    ensurePermissions,
    onUpdated,
  }
}
