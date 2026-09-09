import { useEffect, useState } from 'react'

// TypeScript dropped the inline types for these types in 5.2
// We vendor them here to avoid the dependency

export type OrientationType = 'portrait-primary' | 'portrait-secondary' | 'landscape-primary' | 'landscape-secondary'
export type OrientationLockType = 'any' | 'natural' | 'landscape' | 'portrait' | 'portrait-primary' | 'portrait-secondary' | 'landscape-primary' | 'landscape-secondary'

export interface ScreenOrientation extends EventTarget {
  lock: (orientation: OrientationLockType) => Promise<void>
  unlock: () => void
  readonly type: OrientationType
  readonly angle: number
  addEventListener: (type: 'change', listener: (this: this, ev: Event) => any, useCapture?: boolean) => void
}

/**
 * Specify a custom `window` instance, e.g. working with iframes or in
 * testing environments.
 */
export interface UseScreenOrientationOptions {
  window?: Window
}

export interface UseScreenOrientationReturn {
  /**
   * Whether the Screen Orientation API is available in the current window.
   */
  isSupported: boolean
  /**
   * The current orientation type. `undefined` during SSR and before the
   * mount effect has read `screen.orientation`.
   */
  orientation: OrientationType | undefined
  /**
   * The current orientation angle in degrees, `0` when unknown.
   */
  angle: number
  /**
   * Lock the screen orientation. Returns the underlying promise from
   * `screen.orientation.lock` (rejections propagate unchanged), or rejects
   * with `'Not supported'` when the API is unavailable.
   */
  lockOrientation: (type: OrientationLockType) => Promise<void>
  /**
   * Unlock the screen orientation. No-op when the API is unavailable.
   */
  unlockOrientation: () => void
}

function resolveScreenOrientation(customWindow?: Window): { win: Window, screenOrientation: ScreenOrientation } | undefined {
  const win = customWindow ?? (typeof window === 'undefined' ? undefined : window)
  if (!win || !('screen' in win) || !('orientation' in win.screen))
    return undefined

  // cast through `unknown`: lib.dom dropped `lock`/`unlock` from
  // `ScreenOrientation` (see the vendored types above), so a direct cast
  // does not sufficiently overlap
  return { win, screenOrientation: win.screen.orientation as unknown as ScreenOrientation }
}

/**
 * React port of VueUse's `useScreenOrientation`.
 *
 * Map from @vueuse/core `useScreenOrientation`
 * (`source/vueuse/packages/core/useScreenOrientation/`). Reactive Screen
 * Orientation API — the current orientation type and angle, plus
 * lock/unlock controls.
 *
 * React divergences:
 * - the Vue `orientation`/`angle` shallowRefs become plain state values;
 * - `isSupported` (upstream `useSupported`) starts `false` and is computed in
 *   the mount effect, so nothing touches `screen` during render (SSR-safe);
 * - the initial `screen.orientation` read happens in the same mount effect
 *   (upstream reads it during setup);
 * - the window `orientationchange` listener (upstream `useEventListener`,
 *   passive) lives in a self-contained `useEffect` and is removed on unmount;
 * - `lockOrientation`/`unlockOrientation` resolve `screen.orientation` fresh
 *   on each call instead of capturing it once during setup.
 *
 * @example
 * const { isSupported, orientation, angle, lockOrientation, unlockOrientation } = useScreenOrientation()
 *
 * lockOrientation('portrait-primary')
 */
export function useScreenOrientation(options: UseScreenOrientationOptions = {}): UseScreenOrientationReturn {
  const [isSupported, setIsSupported] = useState(false)
  const [orientation, setOrientation] = useState<OrientationType>()
  const [angle, setAngle] = useState(0)

  useEffect(() => {
    const resolved = resolveScreenOrientation(options.window)
    if (!resolved) {
      setIsSupported(false)
      return
    }

    const { win, screenOrientation } = resolved
    setIsSupported(true)
    setOrientation(screenOrientation.type)
    setAngle(screenOrientation.angle || 0)

    const onOrientationChange = () => {
      setOrientation(screenOrientation.type)
      setAngle(screenOrientation.angle)
    }
    win.addEventListener('orientationchange', onOrientationChange, { passive: true })

    return () => {
      win.removeEventListener('orientationchange', onOrientationChange)
    }
  }, [options.window])

  const lockOrientation = (type: OrientationLockType) => {
    const resolved = resolveScreenOrientation(options.window)
    if (resolved && typeof resolved.screenOrientation.lock === 'function')
      return resolved.screenOrientation.lock(type)

    return Promise.reject(new Error('Not supported'))
  }

  const unlockOrientation = () => {
    const resolved = resolveScreenOrientation(options.window)
    if (resolved && typeof resolved.screenOrientation.unlock === 'function')
      resolved.screenOrientation.unlock()
  }

  return {
    isSupported,
    orientation,
    angle,
    lockOrientation,
    unlockOrientation,
  }
}
