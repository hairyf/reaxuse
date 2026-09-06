import type { ConfigurableWindow } from '@reaxuse/shared'
import { useEffect, useState } from 'react'

export type NetworkType = 'bluetooth' | 'cellular' | 'ethernet' | 'none' | 'wifi' | 'wimax' | 'other' | 'unknown'

export type NetworkEffectiveType = 'slow-2g' | '2g' | '3g' | '4g'

// `Navigator.connection` / `NetworkInformation` are not part of lib.dom, so we
// vendor a minimal interface here to avoid the dependency (same approach as
// `useScreenOrientation`'s vendored `ScreenOrientation`).
export interface NetworkInformation extends EventTarget {
  readonly downlink: number
  readonly downlinkMax: number
  readonly effectiveType: NetworkEffectiveType
  readonly rtt: number
  readonly saveData: boolean
  readonly type: NetworkType
}

export interface UseNetworkOptions extends ConfigurableWindow {}

export interface UseNetworkReturn {
  /**
   * Whether the Network Information API is available in the current window.
   */
  isSupported: boolean
  /**
   * If the user is currently connected.
   */
  isOnline: boolean
  /**
   * The time since the user was last connected.
   */
  offlineAt: number | undefined
  /**
   * The download speed in Mbps.
   */
  downlink: number | undefined
  /**
   * The max reachable download speed in Mbps.
   */
  downlinkMax: number | undefined
  /**
   * The detected effective speed type.
   */
  effectiveType: NetworkEffectiveType | undefined
  /**
   * If the user activated data saver mode.
   */
  saveData: boolean | undefined
  /**
   * The detected connection/network type.
   */
  type: NetworkType
}

type NavigatorWithConnection = Navigator & { connection?: NetworkInformation }

/**
 * React port of VueUse's `useNetwork`.
 *
 * Map from @vueuse/core `useNetwork`
 * (`source/vueuse/packages/core/useNetwork/`). Reactive Network status —
 * the Network Information API (`navigator.connection`) combined with the
 * window `online`/`offline` events.
 *
 * React divergences:
 * - the Vue `isOnline`/`offlineAt`/`downlink`/`downlinkMax`/`effectiveType`/
 *   `saveData`/`type` shallowRefs become plain state values in a single object
 *   return (upstream's `onlineAt`/`rtt` are dropped to keep the port aligned
 *   with the documented usage);
 * - `isSupported` (upstream `useSupported`) starts `false` and is resolved in
 *   the mount effect, so nothing touches `navigator` during render
 *   (SSR-safe);
 * - the window `online`/`offline` and `connection` `change` listeners
 *   (upstream `useEventListener`, passive) live in one self-contained
 *   `useEffect` and are removed on unmount;
 * - the initial network read happens in the same mount effect (upstream reads
 *   it during setup).
 *
 * @example
 * const { isOnline, offlineAt, downlink, downlinkMax, effectiveType, saveData, type } = useNetwork()
 */
export function useNetwork(options: UseNetworkOptions = {}): UseNetworkReturn {
  const [isSupported, setIsSupported] = useState(false)
  const [isOnline, setIsOnline] = useState(true)
  const [offlineAt, setOfflineAt] = useState<number>()
  const [downlink, setDownlink] = useState<number>()
  const [downlinkMax, setDownlinkMax] = useState<number>()
  const [effectiveType, setEffectiveType] = useState<NetworkEffectiveType>()
  const [saveData, setSaveData] = useState<boolean | undefined>(false)
  const [type, setType] = useState<NetworkType>('unknown')

  useEffect(() => {
    const win = options.window ?? (typeof window === 'undefined' ? undefined : window)
    if (!win || !win.navigator)
      return

    const nav = win.navigator
    const connection = 'connection' in nav ? (nav as NavigatorWithConnection).connection : undefined
    setIsSupported(Boolean(connection))

    const updateNetworkInformation = () => {
      setIsOnline(nav.onLine)
      setOfflineAt(nav.onLine ? undefined : Date.now())

      if (connection) {
        setDownlink(connection.downlink)
        setDownlinkMax(connection.downlinkMax)
        setEffectiveType(connection.effectiveType)
        setSaveData(connection.saveData)
        setType(connection.type)
      }
    }

    updateNetworkInformation()

    const goOffline = () => {
      setIsOnline(false)
      setOfflineAt(Date.now())
    }

    const goOnline = () => {
      setIsOnline(true)
    }

    win.addEventListener('offline', goOffline, { passive: true })
    win.addEventListener('online', goOnline, { passive: true })
    connection?.addEventListener('change', updateNetworkInformation, { passive: true })

    return () => {
      win.removeEventListener('offline', goOffline)
      win.removeEventListener('online', goOnline)
      connection?.removeEventListener('change', updateNetworkInformation)
    }
  }, [options.window])

  return {
    isSupported,
    isOnline,
    offlineAt,
    downlink,
    downlinkMax,
    effectiveType,
    saveData,
    type,
  }
}
