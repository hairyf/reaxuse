import { afterEach, describe, expect, it } from 'vitest'
import { render, renderHook } from 'vitest-browser-react'
import UseMouseDemo from '../useMouse/demo'
import { useMouse } from './useMouse'

function createMouseEvent(type: string, init: MouseEventInit = {}) {
  return new MouseEvent(type, { bubbles: true, cancelable: true, ...init })
}

function createTouchEvent(type: string, x: number, y: number, target: EventTarget) {
  return new TouchEvent(type, {
    touches: [new Touch({ identifier: 0, target, pageX: x, pageY: y, clientX: x, clientY: y })],
    bubbles: true,
    cancelable: true,
  })
}

// restore the mocked scroll coordinates after each test
const savedScroll: Array<{ x: number, y: number }> = []

afterEach(() => {
  for (const entry of savedScroll.splice(0)) {
    Object.defineProperty(window, 'scrollX', { value: entry.x, configurable: true, writable: true })
    Object.defineProperty(window, 'scrollY', { value: entry.y, configurable: true, writable: true })
  }
})

function mockScrollPosition(x: number, y: number) {
  savedScroll.push({ x: window.scrollX, y: window.scrollY })
  Object.defineProperty(window, 'scrollX', { value: x, configurable: true, writable: true })
  Object.defineProperty(window, 'scrollY', { value: y, configurable: true, writable: true })
}

describe('useMouse', () => {
  it('returns the default state before any event', async () => {
    const { result } = await renderHook(() => useMouse())

    expect(result.current).toEqual({ x: 0, y: 0, sourceType: null })
  })

  it('updates x / y / sourceType on window mousemove', async () => {
    const { result, act } = await renderHook(() => useMouse())

    await act(() => {
      window.dispatchEvent(createMouseEvent('mousemove', { clientX: 120, clientY: 80 }))
    })

    expect(result.current.x).toBe(120)
    expect(result.current.y).toBe(80)
    expect(result.current.sourceType).toBe('mouse')
  })

  it('tracks the cursor while dragging via dragover', async () => {
    const { result, act } = await renderHook(() => useMouse())

    await act(() => {
      window.dispatchEvent(createMouseEvent('dragover', { clientX: 40, clientY: 60 }))
    })

    expect(result.current.x).toBe(40)
    expect(result.current.y).toBe(60)
    expect(result.current.sourceType).toBe('mouse')
  })

  it('supports the client / screen / movement coord types', async () => {
    const client = await renderHook(() => useMouse({ type: 'client' }))
    await client.act(() => {
      window.dispatchEvent(createMouseEvent('mousemove', { clientX: 11, clientY: 22 }))
    })
    expect(client.result.current.x).toBe(11)
    expect(client.result.current.y).toBe(22)
    await client.unmount()

    const screen = await renderHook(() => useMouse({ type: 'screen' }))
    await screen.act(() => {
      window.dispatchEvent(createMouseEvent('mousemove', { screenX: 7, screenY: 9 }))
    })
    expect(screen.result.current.x).toBe(7)
    expect(screen.result.current.y).toBe(9)
    await screen.unmount()

    const movement = await renderHook(() => useMouse({ type: 'movement' }))
    await movement.act(() => {
      window.dispatchEvent(createMouseEvent('mousemove', { movementX: 3, movementY: 5 }))
    })
    expect(movement.result.current.x).toBe(3)
    expect(movement.result.current.y).toBe(5)
  })

  it('supports a custom extractor function', async () => {
    const { result, act } = await renderHook(() => useMouse({
      // transform the client coordinates — proves the extractor decides the value
      type: event => (event instanceof MouseEvent
        ? [event.clientX * 2, event.clientY * 2]
        : null),
    }))

    await act(() => {
      window.dispatchEvent(createMouseEvent('mousemove', { clientX: 13, clientY: 37 }))
    })

    expect(result.current.x).toBe(26)
    expect(result.current.y).toBe(74)
    expect(result.current.sourceType).toBe('mouse')
  })

  it('updates from touchmove with sourceType touch', async () => {
    const { result, act } = await renderHook(() => useMouse())

    await act(() => {
      window.dispatchEvent(createTouchEvent('touchmove', 90, 70, window))
    })

    expect(result.current.x).toBe(90)
    expect(result.current.y).toBe(70)
    expect(result.current.sourceType).toBe('touch')
  })

  it('ignores touch events when touch is false', async () => {
    const { result, act } = await renderHook(() => useMouse({ touch: false }))

    await act(() => {
      window.dispatchEvent(createTouchEvent('touchmove', 90, 70, window))
    })

    expect(result.current.x).toBe(0)
    expect(result.current.y).toBe(0)
    expect(result.current.sourceType).toBe(null)
  })

  it('resets to the initial value on touchend with resetOnTouchEnds', async () => {
    const { result, act } = await renderHook(() => useMouse({
      resetOnTouchEnds: true,
      initialValue: { x: 3, y: 4 },
    }))

    await act(() => {
      window.dispatchEvent(createTouchEvent('touchmove', 90, 70, window))
    })
    expect(result.current.x).toBe(90)
    expect(result.current.y).toBe(70)

    await act(() => {
      window.dispatchEvent(createTouchEvent('touchend', 0, 0, window))
    })

    expect(result.current.x).toBe(3)
    expect(result.current.y).toBe(4)
    expect(result.current.sourceType).toBe('touch')
  })

  it('uses initialValue as the initial state', async () => {
    const { result } = await renderHook(() => useMouse({ initialValue: { x: 11, y: 22 } }))

    expect(result.current.x).toBe(11)
    expect(result.current.y).toBe(22)
    expect(result.current.sourceType).toBe(null)
  })

  it('compensates page coordinates on window scroll', async () => {
    const { result, act } = await renderHook(() => useMouse())

    await act(() => {
      window.dispatchEvent(createMouseEvent('mousemove', { clientX: 100, clientY: 50 }))
    })
    expect(result.current.x).toBe(100)
    expect(result.current.y).toBe(50)

    mockScrollPosition(30, 20)
    await act(() => {
      window.dispatchEvent(new Event('scroll'))
    })

    expect(result.current.x).toBe(130)
    expect(result.current.y).toBe(70)
    expect(result.current.sourceType).toBe('mouse')
  })

  it('attaches its listeners to a custom target element', async () => {
    const element = document.createElement('div')
    document.body.appendChild(element)

    const { result, act, unmount } = await renderHook(() => useMouse({ target: element }))

    await act(() => {
      element.dispatchEvent(createMouseEvent('mousemove', { clientX: 55, clientY: 66 }))
    })
    expect(result.current.x).toBe(55)
    expect(result.current.y).toBe(66)

    unmount()
    element.remove()
  })

  it('resolves a ref-like target at bind time, after it is populated', async () => {
    const element = document.createElement('div')
    document.body.appendChild(element)
    const targetRef: { current: EventTarget | null } = { current: null }

    const { result, act, rerender, unmount } = await renderHook(
      (props?: { current: EventTarget | null }) => useMouse({ target: props }),
      { initialProps: targetRef },
    )

    // same object identity with `current` still null — nothing is bound yet
    await act(() => {
      element.dispatchEvent(createMouseEvent('mousemove', { clientX: 1, clientY: 2 }))
    })
    expect(result.current.x).toBe(0)

    // populate `current` (simulating React attaching the element), then a
    // re-render re-resolves and binds
    targetRef.current = element
    await rerender(targetRef)
    await act(() => {
      element.dispatchEvent(createMouseEvent('mousemove', { clientX: 33, clientY: 44 }))
    })
    expect(result.current.x).toBe(33)
    expect(result.current.y).toBe(44)

    unmount()
    element.remove()
  })

  it('re-binds the listeners when the resolved target changes', async () => {
    const first = document.createElement('div')
    const second = document.createElement('div')
    document.body.append(first, second)

    const { result, act, rerender, unmount } = await renderHook(
      (props?: { target?: EventTarget }) => useMouse(props),
      { initialProps: { target: first } },
    )

    await act(() => {
      first.dispatchEvent(createMouseEvent('mousemove', { clientX: 1, clientY: 2 }))
    })
    expect(result.current.x).toBe(1)

    await rerender({ target: second })

    await act(() => {
      first.dispatchEvent(createMouseEvent('mousemove', { clientX: 33, clientY: 34 }))
    })
    expect(result.current.x).toBe(1)

    await act(() => {
      second.dispatchEvent(createMouseEvent('mousemove', { clientX: 8, clientY: 9 }))
    })
    expect(result.current.x).toBe(8)
    expect(result.current.y).toBe(9)

    unmount()
    first.remove()
    second.remove()
  })

  it('removes its listeners on unmount', async () => {
    const { result, act, unmount } = await renderHook(() => useMouse())
    unmount()

    await act(() => {
      window.dispatchEvent(createMouseEvent('mousemove', { clientX: 999, clientY: 999 }))
    })

    expect(result.current.x).toBe(0)
    expect(result.current.y).toBe(0)
    expect(result.current.sourceType).toBe(null)
  })

  it('renders the defaults during the first render (SSR safety, no window access)', async () => {
    // dispatch a move before mounting — a window-reading render would pick it up
    window.dispatchEvent(createMouseEvent('mousemove', { clientX: 500, clientY: 600 }))

    let firstRender: { x: number, y: number, sourceType: 'mouse' | 'touch' | null } | undefined

    function Probe() {
      const mouse = useMouse()
      firstRender ??= mouse
      return <div>{mouse.x}</div>
    }

    await render(<Probe />)

    expect(firstRender).toEqual({ x: 0, y: 0, sourceType: null })
  })

  it('mirrors the upstream demo test — the demo renders', async () => {
    const screen = await render(<UseMouseDemo />)

    await expect.element(screen.baseElement).toBeInTheDocument()
  })
})
