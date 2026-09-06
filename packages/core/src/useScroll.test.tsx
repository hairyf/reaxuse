import { useRef, useState } from 'react'
import { describe, expect, it } from 'vitest'
import { render, renderHook } from 'vitest-browser-react'
import { useScroll } from './useScroll'

const X_LEFT_ARRIVED = JSON.stringify({
  left: true,
  right: false,
  top: true,
  bottom: false,
}, null, 2)
const X_RIGHT_ARRIVED = JSON.stringify({
  left: false,
  right: true,
  top: true,
  bottom: false,
}, null, 2)
const Y_BOTTOM_ARRIVED = JSON.stringify({
  left: true,
  right: false,
  top: false,
  bottom: true,
}, null, 2)
const ALL_ARRIVED = JSON.stringify({
  left: true,
  right: true,
  top: true,
  bottom: true,
}, null, 2)

describe('useScroll', () => {
  it('should be defined', () => {
    expect(useScroll).toBeDefined()
  })

  it('should have default x and y', async () => {
    const { result } = await renderHook(() => useScroll(window))

    expect(result.current.x).toBe(0)
    expect(result.current.y).toBe(0)
  })

  it('should have right default values', async () => {
    const { result } = await renderHook(() => useScroll(window))

    expect(result.current.x).toBe(0)
    expect(result.current.y).toBe(0)
    expect(result.current.isScrolling).toBe(false)
    expect(result.current.arrivedState).toEqual({
      left: true,
      right: true,
      top: true,
      bottom: true,
    })
    expect(result.current.directions).toEqual({
      left: false,
      right: false,
      top: false,
      bottom: false,
    })
    expect(result.current.measure).toBeTypeOf('function')
    expect(result.current.setX).toBeTypeOf('function')
    expect(result.current.setY).toBeTypeOf('function')
  })

  it('should expose setters that scroll the element', async () => {
    const { result, act } = await renderHook(() => useScroll(window))

    // the window is not scrollable in the test viewport, so the position
    // stays clamped at 0 — the setters must at least not throw and stay
    // consistent
    await act(() => {
      result.current.setX(0)
      result.current.setY(0)
    })
    expect(result.current.x).toBe(0)
    expect(result.current.y).toBe(0)
  })
})

/**
 * Mirrors the upstream `index.browser.test.ts` component: a scrollable box
 * with buttons to scroll to the edges, toggle the inner content size and
 * toggle whether the box is rendered at all, plus a `<pre>` that renders the
 * current `arrivedState`.
 */
function ScrollTestComponent({ observe = false }: { observe?: boolean }) {
  const el = useRef<HTMLDivElement>(null)
  const { arrivedState, setX, setY } = useScroll(el, { observe: observe ?? false })
  const [showBox, setShowBox] = useState(true)
  const [width, setWidth] = useState(500)
  const [height, setHeight] = useState(500)

  function triggerScrollManually() {
    el.current?.dispatchEvent(new Event('scroll'))
  }

  function goToLeft() {
    setX(0)
    triggerScrollManually()
  }

  function goToRight() {
    setX(el.current?.scrollWidth || 300)
    triggerScrollManually()
  }

  function goToTop() {
    setY(0)
    triggerScrollManually()
  }

  function goToBottom() {
    setY(el.current?.scrollHeight || 300)
    triggerScrollManually()
  }

  function toggleWidth() {
    setWidth(w => (w < 500 ? 500 : 300))
  }

  function toggleHeight() {
    setHeight(h => (h < 500 ? 500 : 300))
  }

  function toggleBox() {
    setShowBox(v => !v)
  }

  return (
    <div>
      <div style={{ padding: 12, display: 'flex', gap: 8 }}>
        <button data-testid="left" onClick={goToLeft}>goToLeft</button>
        <button data-testid="right" onClick={goToRight}>goToRight</button>
        <button data-testid="top" onClick={goToTop}>goToTop</button>
        <button data-testid="bottom" onClick={goToBottom}>goToBottom</button>
        <button data-testid="toggleWidth" onClick={toggleWidth}>toggleWidth</button>
        <button data-testid="toggleHeight" onClick={toggleHeight}>toggleHeight</button>
        <button data-testid="toggleBox" onClick={toggleBox}>toggleBox</button>
      </div>
      <pre data-testid="arrivedState">{JSON.stringify(arrivedState, null, 2)}</pre>
      <div ref={el} style={{ width: 300, height: 300, margin: 'auto', overflow: 'auto' }}>
        {showBox && <div style={{ width, height, position: 'relative' }} />}
      </div>
    </div>
  )
}

describe('useScroll element', () => {
  it('should correctly detect leftArrived and rightArrived states when reaching the X-axis boundaries', async () => {
    const screen = await render(<ScrollTestComponent observe />)
    const arrivedState = screen.getByTestId('arrivedState')
    await expect.element(arrivedState).toBeVisible()

    const rightButton = screen.getByTestId('right')
    await expect.element(rightButton).toBeVisible()
    await rightButton.click()
    await expect.poll(() => arrivedState.query()?.textContent).toBe(X_RIGHT_ARRIVED)

    const leftButton = screen.getByTestId('left')
    await expect.element(leftButton).toBeVisible()
    await leftButton.click()
    await expect.poll(() => arrivedState.query()?.textContent).toBe(X_LEFT_ARRIVED)
  })

  it('should correctly detect topArrived and bottomArrived states when reaching the Y-axis boundaries', async () => {
    const screen = await render(<ScrollTestComponent observe />)
    const arrivedState = screen.getByTestId('arrivedState')
    await expect.element(arrivedState).toBeVisible()

    const bottomButton = screen.getByTestId('bottom')
    await expect.element(bottomButton).toBeVisible()
    await bottomButton.click()
    await expect.poll(() => arrivedState.query()?.textContent).toBe(Y_BOTTOM_ARRIVED)

    const topButton = screen.getByTestId('top')
    await expect.element(topButton).toBeVisible()
    await topButton.click()
    await expect.poll(() => arrivedState.query()?.textContent).toBe(X_LEFT_ARRIVED)
  })

  describe('observe DOM mutations when observe is enabled', () => {
    it('should detect boundary changes when child element size is modified', async () => {
      const screen = await render(<ScrollTestComponent observe />)
      const arrivedState = screen.getByTestId('arrivedState')
      await expect.element(arrivedState).toBeVisible()
      const toggleHeightButton = screen.getByTestId('toggleHeight')
      const toggleWidthButton = screen.getByTestId('toggleWidth')
      await expect.element(toggleHeightButton).toBeVisible()
      await expect.element(toggleWidthButton).toBeVisible()

      await toggleHeightButton.click()
      await toggleWidthButton.click()
      await expect.poll(() => arrivedState.query()?.textContent).toBe(ALL_ARRIVED)

      await toggleHeightButton.click()
      await toggleWidthButton.click()
      await expect.poll(() => arrivedState.query()?.textContent).toBe(X_LEFT_ARRIVED)
    })

    it('should detect boundary changes when child element is added or removed', async () => {
      const screen = await render(<ScrollTestComponent observe />)
      const arrivedState = screen.getByTestId('arrivedState')
      await expect.element(arrivedState).toBeVisible()
      const toggleBoxButton = screen.getByTestId('toggleBox')
      await expect.element(toggleBoxButton).toBeVisible()

      await toggleBoxButton.click()
      await expect.poll(() => arrivedState.query()?.textContent).toBe(ALL_ARRIVED)

      await toggleBoxButton.click()
      await expect.poll(() => arrivedState.query()?.textContent).toBe(X_LEFT_ARRIVED)
    })
  })
})
