import type { ConfigurableWindow } from '@reaxuse/shared'
import { useEffect, useState } from 'react'

export interface UseDeviceOrientationOptions extends ConfigurableWindow {}

export interface UseDeviceOrientationReturn {
  /**
   * Whether the device orientation is given as absolute (relative to the
   * Earth's coordinate system) or as relative to the device.
   */
  isAbsolute: boolean | null
  /**
   * The rotation of the device around the z axis (0–360 degrees).
   */
  alpha: number | null
  /**
   * The rotation of the device around the x axis (−180–180 degrees).
   */
  beta: number | null
  /**
   * The rotation of the device around the y axis (−90–90 degrees).
   */
  gamma: number | null
}

/**
 * React port of VueUse's `useDeviceOrientation`.
 *
 * Map from @vueuse/core `useDeviceOrientation`
 * (`source/vueuse/packages/core/useDeviceOrientation/`). Reactive
 * [DeviceOrientationEvent](https://developer.mozilla.org/en-US/docs/Web/API/DeviceOrientationEvent) —
 * information about the physical orientation of the device.
 *
 * Adjustment for React:
 * - the Vue (shallow) refs returned by upstream become plain values read off
 *   the result object (no `.value`): `isAbsolute` / `alpha` / `beta` /
 *   `gamma` hold `boolean | null` / `number | null` states, all starting
 *   `null` until the first `deviceorientation` event;
 * - upstream attaches its listener at setup time (behind `useSupported`);
 *   here a single mount effect resolves the window (SSR-safe — nothing
 *   touches `window` during render), registers the passive
 *   `deviceorientation` listener and removes it on unmount;
 * - upstream also reports `isSupported` through its `Supportable` mixin; this
 *   port returns the four orientation states only, since a passive
 *   `deviceorientation` listener is inert on browsers without the API and
 *   needs no capability probe.
 *
 * @example
 * const { isAbsolute, alpha, beta, gamma } = useDeviceOrientation()
 *
 * @__NO_SIDE_EFFECTS__
 */
export function useDeviceOrientation(options: UseDeviceOrientationOptions = {}): UseDeviceOrientationReturn {
  const { window: customWindow } = options

  const [isAbsolute, setIsAbsolute] = useState<boolean | null>(null)
  const [alpha, setAlpha] = useState<number | null>(null)
  const [beta, setBeta] = useState<number | null>(null)
  const [gamma, setGamma] = useState<number | null>(null)

  // Attach the passive `deviceorientation` listener in a mount effect
  // (SSR-safe): re-registers when a custom `window` option changes and
  // removes the listener on unmount (upstream: `useEventListener` inside
  // `useSupported`).
  useEffect(() => {
    const win = customWindow ?? (typeof window === 'undefined' ? undefined : window)
    if (!win)
      return

    const handleOrientation = (event: DeviceOrientationEvent) => {
      setIsAbsolute(event.absolute)
      setAlpha(event.alpha)
      setBeta(event.beta)
      setGamma(event.gamma)
    }

    win.addEventListener('deviceorientation', handleOrientation, { passive: true })

    return () => {
      win.removeEventListener('deviceorientation', handleOrientation)
    }
  }, [customWindow])

  return {
    isAbsolute,
    alpha,
    beta,
    gamma,
  }
}
