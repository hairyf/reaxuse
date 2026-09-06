import { useCallback, useEffect, useRef, useState } from 'react'

type DescriptorNamePolyfill
  = | 'accelerometer'
    | 'accessibility-events'
    | 'ambient-light-sensor'
    | 'background-sync'
    | 'camera'
    | 'clipboard-read'
    | 'clipboard-write'
    | 'gyroscope'
    | 'magnetometer'
    | 'microphone'
    | 'notifications'
    | 'payment-handler'
    | 'persistent-storage'
    | 'push'
    | 'speaker'
    | 'local-fonts'

export type GeneralPermissionDescriptor
  = | PermissionDescriptor
    | { name: DescriptorNamePolyfill }

export interface UsePermissionOptions<Controls extends boolean = false> {
  /**
   * Expose more controls
   *
   * @default false
   */
  controls?: Controls
}

export type UsePermissionReturn = PermissionState

export interface UsePermissionReturnWithControls {
  state: UsePermissionReturn
  isSupported: boolean
  query: () => Promise<PermissionStatus | undefined>
}

/**
 * React port of VueUse's `usePermission`.
 *
 * Map from @vueuse/core `usePermission`
 * (`source/vueuse/packages/core/usePermission/`). Reactive
 * [Permissions API](https://developer.mozilla.org/en-US/docs/Web/API/Permissions_API)
 * state as a plain string — `'granted' | 'denied' | 'prompt'`.
 *
 * React divergences:
 * - the `ShallowRef<PermissionState | undefined>` return becomes a plain
 *   string state; it starts as `'prompt'` and stays there until the async
 *   query resolves (SSR-safe — nothing touches `navigator` during render),
 *   mirroring upstream's `permissionStatus?.state ?? 'prompt'` fallback;
 * - the query runs in a mount `useEffect` (upstream queries once during
 *   setup) and re-queries when the descriptor changes; the descriptor is
 *   serialized for change detection, so inline object literals are safe and
 *   descriptor objects don't need a stable identity;
 * - the `change` listener attaches to the resolved `PermissionStatus` and is
 *   removed on unmount and when the descriptor changes;
 * - with `controls: true`, `isSupported` resolves after mount instead of
 *   during setup, and `query()` re-queries instead of returning upstream's
 *   cached singleton result.
 *
 * @example
 * const microphoneAccess = usePermission('microphone')
 */
export function usePermission(
  permissionDesc: GeneralPermissionDescriptor | GeneralPermissionDescriptor['name'],
  options?: UsePermissionOptions<false>,
): UsePermissionReturn
export function usePermission(
  permissionDesc: GeneralPermissionDescriptor | GeneralPermissionDescriptor['name'],
  options: UsePermissionOptions<true>,
): UsePermissionReturnWithControls
export function usePermission(
  permissionDesc: GeneralPermissionDescriptor | GeneralPermissionDescriptor['name'],
  options: UsePermissionOptions<boolean> = {},
): UsePermissionReturn | UsePermissionReturnWithControls {
  const { controls = false } = options

  // The effect re-queries when the descriptor changes; serializing lets
  // callers pass inline object literals without re-querying every render.
  const descKey = JSON.stringify(
    typeof permissionDesc === 'string' ? { name: permissionDesc } : permissionDesc,
  )

  const [state, setState] = useState<PermissionState>('prompt')
  const [isSupported, setIsSupported] = useState(false)
  const statusRef = useRef<PermissionStatus | undefined>(undefined)
  const descKeyRef = useRef(descKey)

  const update = useCallback(() => {
    setState(statusRef.current?.state ?? 'prompt')
  }, [])

  const query = useCallback(async (): Promise<PermissionStatus | undefined> => {
    const permissions = typeof navigator === 'undefined' ? undefined : navigator.permissions
    setIsSupported(!!permissions)
    if (!permissions)
      return undefined

    const key = descKey
    let status: PermissionStatus | undefined
    try {
      status = await permissions.query(JSON.parse(key) as PermissionDescriptor)
    }
    catch {
      status = undefined
    }

    // a newer query (changed descriptor) supersedes this one
    if (descKeyRef.current !== key)
      return status

    if (statusRef.current !== status) {
      statusRef.current?.removeEventListener('change', update)
      status?.addEventListener('change', update)
      statusRef.current = status
    }
    update()
    return status
  }, [descKey, update])

  useEffect(() => {
    descKeyRef.current = descKey
  })

  useEffect(() => {
    void query()
    return () => {
      statusRef.current?.removeEventListener('change', update)
    }
  }, [query, update])

  if (controls)
    return { state, isSupported, query }
  return state
}
