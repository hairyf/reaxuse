import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { renderHook } from 'vitest-browser-react'
import { useWindowScroll } from '../useWindowScroll'

function makeBodyScrollable() {
  document.body.style.height = '3000px'
  document.body.style.width = '3000px'
}

/**
 * Deterministic window-scroll harness.
 *
 * The hook is driven by native `scroll` events, so really scrolling the window
 * races the assertions: chromium delivers the native event on a later frame,
 * which re-measures against the already-updated position and wipes
 * `directions` right before an immediate assertion, and the `idle` reset then
 * runs on a real timer that can fire mid-test. Here `window.scrollTo` is
 * replaced by a stubbed position that dispatches the `scroll` event
 * synchronously, and the tests fake timers so the `idle` reset only happens
 * when they advance the clock.
 */
function installScrollStub() {
  let left = 0
  let top = 0

  const scrollTo = vi.spyOn(window, 'scrollTo')
  scrollTo.mockImplementation((first: ScrollToOptions | number, second?: number) => {
    if (typeof first === 'object') {
      left = first.left ?? left
      top = first.top ?? top
    }
    else {
      left = first
      top = second ?? top
    }
    window.dispatchEvent(new Event('scroll'))
  })

  const documentElement = document.documentElement
  const leftDescriptor = Object.getOwnPropertyDescriptor(documentElement, 'scrollLeft')
  const topDescriptor = Object.getOwnPropertyDescriptor(documentElement, 'scrollTop')
  Object.defineProperty(documentElement, 'scrollLeft', { configurable: true, get: () => left })
  Object.defineProperty(documentElement, 'scrollTop', { configurable: true, get: () => top })

  return {
    restore() {
      scrollTo.mockRestore()
      if (leftDescriptor)
        Object.defineProperty(documentElement, 'scrollLeft', leftDescriptor)
      else
        delete (documentElement as unknown as { scrollLeft?: number }).scrollLeft
      if (topDescriptor)
        Object.defineProperty(documentElement, 'scrollTop', topDescriptor)
      else
        delete (documentElement as unknown as { scrollTop?: number }).scrollTop
    },
  }
}

describe('useWindowScroll', () => {
  let scroll: ReturnType<typeof installScrollStub>

  beforeEach(() => {
    vi.useFakeTimers()
    scroll = installScrollStub()
  })

  afterEach(() => {
    scroll.restore()
    vi.useRealTimers()
    document.body.style.height = ''
    document.body.style.width = ''
  })

  it('should be defined', () => {
    expect(useWindowScroll).toBeDefined()
  })

  it('should have default x and y', async () => {
    const { result } = await renderHook(() => useWindowScroll())

    expect(result.current.x).toBe(0)
    expect(result.current.y).toBe(0)
  })

  it('should have right default values', async () => {
    const { result } = await renderHook(() => useWindowScroll())

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
  })

  it('should scroll to x and y with the setters', async () => {
    makeBodyScrollable()
    const { result, act } = await renderHook(() => useWindowScroll())

    await act(() => result.current.setY(100))
    expect(result.current.y).toBe(100)
    expect(result.current.x).toBe(0)

    await act(() => result.current.setX(120))
    expect(result.current.x).toBe(120)
    expect(result.current.y).toBe(100)
  })

  it('should expose a measure() that re-reads the current position', async () => {
    makeBodyScrollable()
    const { result, act } = await renderHook(() => useWindowScroll())

    await act(() => {
      window.scrollTo(0, 100)
    })
    expect(result.current.y).toBe(100)

    // move the position without dispatching a scroll event, then measure
    const documentElement = document.documentElement
    const descriptor = Object.getOwnPropertyDescriptor(documentElement, 'scrollTop')!
    Object.defineProperty(documentElement, 'scrollTop', { configurable: true, get: () => 300 })
    try {
      await act(() => {
        result.current.measure()
      })
      expect(result.current.y).toBe(300)
    }
    finally {
      Object.defineProperty(documentElement, 'scrollTop', descriptor)
    }
  })

  it('should set isScrolling while scrolling and reset after idle', async () => {
    makeBodyScrollable()
    const { result, act } = await renderHook(() => useWindowScroll({ idle: 80 }))

    await act(() => {
      window.dispatchEvent(new Event('scroll'))
    })
    expect(result.current.isScrolling).toBe(true)

    await act(() => {
      vi.advanceTimersByTime(80)
    })
    expect(result.current.isScrolling).toBe(false)
  })

  it('should track scroll directions and reset them on stop', async () => {
    makeBodyScrollable()
    const { result, act } = await renderHook(() => useWindowScroll({ idle: 50 }))

    await act(() => {
      window.scrollTo(0, 200)
    })
    expect(result.current.directions).toEqual({
      left: false,
      right: false,
      top: false,
      bottom: true,
    })

    await act(() => {
      window.scrollTo(0, 50)
    })
    expect(result.current.directions).toEqual({
      left: false,
      right: false,
      top: true,
      bottom: false,
    })

    await act(() => {
      window.scrollTo(150, 50)
    })
    expect(result.current.directions).toEqual({
      left: false,
      right: true,
      top: false,
      bottom: false,
    })

    // directions and isScrolling reset when scrolling ends
    await act(() => {
      vi.advanceTimersByTime(50)
    })
    expect(result.current.directions).toEqual({
      left: false,
      right: false,
      top: false,
      bottom: false,
    })
    expect(result.current.isScrolling).toBe(false)
  })

  it('should call onScroll on every scroll and onStop when scrolling ends', async () => {
    makeBodyScrollable()
    const onScroll = vi.fn()
    const onStop = vi.fn()
    const { act } = await renderHook(() => useWindowScroll({ onScroll, onStop, idle: 50 }))

    await act(() => {
      window.dispatchEvent(new Event('scroll'))
    })
    expect(onScroll).toHaveBeenCalledTimes(1)
    expect(onStop).not.toHaveBeenCalled()

    await act(() => {
      vi.advanceTimersByTime(50)
    })
    expect(onStop).toHaveBeenCalledTimes(1)
  })

  it('should throttle scroll handling with the throttle option', async () => {
    makeBodyScrollable()
    const { result, act } = await renderHook(() => useWindowScroll({ throttle: 100, idle: 50 }))

    // a burst of scroll events within the throttle window collapses into a
    // single trailing call (upstream `useThrottleFn(..., trailing: true,
    // leading: false)`): the trailing call fires once the window elapses
    await act(() => {
      window.dispatchEvent(new Event('scroll'))
      window.dispatchEvent(new Event('scroll'))
      window.dispatchEvent(new Event('scroll'))
    })

    await act(() => {
      vi.advanceTimersByTime(100)
    })
    expect(result.current.isScrolling).toBe(true)

    // scrolling ends after `throttle + idle` without events
    await act(() => {
      vi.advanceTimersByTime(150)
    })
    expect(result.current.isScrolling).toBe(false)
  })

  it('should listen on a custom window option', async () => {
    const listeners = new Map<string, EventListener>()
    const customWindow = {
      document: {
        documentElement: document.documentElement,
        body: document.body,
      },
      getComputedStyle: window.getComputedStyle.bind(window),
      addEventListener: (type: string, fn: EventListener) => listeners.set(type, fn),
      removeEventListener: (type: string) => listeners.delete(type),
      scrollTo: vi.fn(),
    } as unknown as Window

    const { result, act } = await renderHook(() => useWindowScroll({ window: customWindow, idle: 50 }))

    expect(listeners.has('scroll')).toBe(true)
    expect(listeners.has('scrollend')).toBe(true)
    expect(result.current.x).toBe(0)
    expect(result.current.y).toBe(0)

    // drive the custom window's scroll listener
    await act(() => {
      listeners.get('scroll')?.(new Event('scroll'))
    })
    expect(result.current.isScrolling).toBe(true)
  })

  it('should update arrivedState within the offset', async () => {
    makeBodyScrollable()
    const { result, act } = await renderHook(() => useWindowScroll({ idle: 50 }))

    // at the top edge (offset defaults to 0)
    expect(result.current.arrivedState.top).toBe(true)

    await act(() => {
      window.scrollTo(0, 200)
    })
    expect(result.current.arrivedState.top).toBe(false)
    expect(result.current.arrivedState.bottom).toBe(false)

    await act(() => {
      window.scrollTo(0, document.documentElement.scrollHeight)
    })
    expect(result.current.arrivedState.bottom).toBe(true)

    await act(() => {
      window.scrollTo(0, 200)
    })

    // a second hook with a custom top offset of 250px counts y=200 as arrived
    const { result: offsetResult } = await renderHook(() => useWindowScroll({ offset: { top: 250 } }))
    expect(offsetResult.current.arrivedState.top).toBe(true)
  })
})
