import type { UseParallaxReturn } from './useParallax'
import { afterEach, describe, expect, it } from 'vitest'
import { render, renderHook } from 'vitest-browser-react'
import { useParallax } from './useParallax'

/**
 * Track every element appended to the page so tests never leak DOM.
 */
const appendedElements: HTMLElement[] = []

/**
 * Create a real, visible target element. `position: fixed` makes its rect
 * viewport-relative and independent of the page layout, so `getClientRects`
 * always reports the same 200x200 box.
 */
function createTarget(): HTMLElement {
  const el = document.createElement('div')
  el.id = `parallax-target-${appendedElements.length}`
  el.style.position = 'fixed'
  el.style.left = '0px'
  el.style.top = '0px'
  el.style.width = '200px'
  el.style.height = '200px'
  document.body.appendChild(el)
  appendedElements.push(el)
  return el
}

function moveMouse(rect: DOMRect, x = 50, y = 50) {
  window.dispatchEvent(new MouseEvent('mousemove', {
    clientX: rect.left + x,
    clientY: rect.top + y,
    bubbles: true,
  }))
}

/**
 * Chromium exposes a real (environment-dependent) `screen.orientation`, so
 * shadow it with a deterministic own property. `afterEach` deletes the own
 * property again, which restores the browser's prototype accessor.
 */
function stubScreenOrientation(type: string, angle = 0) {
  Object.defineProperty(window.screen, 'orientation', {
    configurable: true,
    value: {
      type,
      angle,
      lock: () => Promise.resolve(),
      unlock: () => {},
    },
  })
}

afterEach(() => {
  delete (window.screen as { orientation?: unknown }).orientation
  appendedElements.splice(0).forEach(el => el.remove())
})

describe('useParallax', () => {
  it('returns 0 tilt/roll and mouse source before any sensor data', async () => {
    const { result } = await renderHook(() => useParallax(null))

    expect(result.current).toEqual({ tilt: 0, roll: 0, source: 'mouse' })
  })

  it('updates tilt/roll from the mouse position relative to the target element', async () => {
    const el = createTarget()
    const { result, act } = await renderHook(() => useParallax(el))

    // 150px into a 200px box → tilt = (150 - 100) / 200 = 0.25,
    // roll = -(150 - 100) / 200 = -0.25
    await act(() => {
      moveMouse(el.getBoundingClientRect(), 150, 150)
    })

    await expect.poll(() => result.current.tilt).toBeCloseTo(0.25, 5)
    expect(result.current.roll).toBeCloseTo(-0.25, 5)
    expect(result.current.source).toBe('mouse')
  })

  it('keeps the last in-element values while the cursor is outside the element', async () => {
    const el = createTarget()
    const { result, act } = await renderHook(() => useParallax(el))

    await act(() => {
      moveMouse(el.getBoundingClientRect(), 150, 150)
    })
    await expect.poll(() => result.current.tilt).toBeCloseTo(0.25, 5)

    // outside the box (negative coordinates) — values must not change
    await act(() => {
      moveMouse(el.getBoundingClientRect(), -50, -50)
    })
    expect(result.current.tilt).toBeCloseTo(0.25, 5)
    expect(result.current.roll).toBeCloseTo(-0.25, 5)
  })

  it('applies the mouse adjust callbacks', async () => {
    const el = createTarget()
    const { result, act } = await renderHook(() => useParallax(el, {
      mouseTiltAdjust: i => i * 2,
      mouseRollAdjust: i => i * 3,
    }))

    await act(() => {
      moveMouse(el.getBoundingClientRect(), 150, 150)
    })

    // tilt = 0.25 * 2 = 0.5, roll = -0.25 * 3 = -0.75
    await expect.poll(() => result.current.tilt).toBeCloseTo(0.5, 5)
    expect(result.current.roll).toBeCloseTo(-0.75, 5)
  })

  it('falls back to device orientation values when alpha/gamma become non-zero', async () => {
    stubScreenOrientation('portrait-primary', 0)
    const { result, act } = await renderHook(() => useParallax(null))

    // supported but zero alpha/gamma → stays mouse
    await act(() => {
      window.dispatchEvent(new DeviceOrientationEvent('deviceorientation', { alpha: 0, beta: 0, gamma: 0 }))
    })
    await expect.poll(() => result.current.source).toBe('mouse')

    await act(() => {
      window.dispatchEvent(new DeviceOrientationEvent('deviceorientation', { alpha: 45, beta: 10, gamma: 20 }))
    })
    await expect.poll(() => result.current.source).toBe('deviceOrientation')
    // portrait-primary: roll = -beta / 90, tilt = gamma / 90
    expect(result.current.roll).toBeCloseTo(-10 / 90, 5)
    expect(result.current.tilt).toBeCloseTo(20 / 90, 5)
  })

  it('resolves a ref-like target at bind time, after it is populated', async () => {
    const el = createTarget()
    const targetRef: { current: HTMLElement | null } = { current: null }
    const { result, act, rerender } = await renderHook<{ current: HTMLElement | null }, UseParallaxReturn>(
      props => useParallax(props),
      { initialProps: targetRef },
    )

    // same object identity with `current` still null — nothing is bound yet
    await act(() => {
      moveMouse(el.getBoundingClientRect(), 150, 150)
    })
    expect(result.current.tilt).toBe(0)

    // populate `current` (simulating React attaching the element), then a
    // re-render re-resolves and binds
    targetRef.current = el
    await rerender(targetRef)

    await act(() => {
      moveMouse(el.getBoundingClientRect(), 150, 150)
    })
    await expect.poll(() => result.current.tilt).toBeCloseTo(0.25, 5)
    expect(result.current.roll).toBeCloseTo(-0.25, 5)
  })

  it('stays SSR-safe during render before the mount effect', async () => {
    const snapshots: Array<{ tilt: number, roll: number, source: 'deviceOrientation' | 'mouse' }> = []

    function Probe() {
      const parallax = useParallax(null)
      snapshots.push({ tilt: parallax.tilt, roll: parallax.roll, source: parallax.source })
      return <div>{parallax.tilt}</div>
    }

    await render(<Probe />)

    expect(snapshots[0]).toEqual({ tilt: 0, roll: 0, source: 'mouse' })
  })

  it('removes its listeners on unmount', async () => {
    const el = createTarget()
    const { result, act, unmount } = await renderHook(() => useParallax(el))

    await act(() => {
      moveMouse(el.getBoundingClientRect(), 150, 150)
    })
    await expect.poll(() => result.current.tilt).toBeCloseTo(0.25, 5)

    const before = { tilt: result.current.tilt, roll: result.current.roll }
    await unmount()

    // listeners are gone — a mousemove at a different position is ignored
    moveMouse(el.getBoundingClientRect(), 50, 50)

    expect(result.current.tilt).toBe(before.tilt)
    expect(result.current.roll).toBe(before.roll)
  })
})
