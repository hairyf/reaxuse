import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { renderHook } from 'vitest-browser-react'
import { useWindowScroll } from './useWindowScroll'

function makeBodyScrollable() {
  document.body.style.height = '3000px'
  document.body.style.width = '3000px'
}

describe('useWindowScroll', () => {
  beforeEach(() => {
    document.body.style.height = ''
    document.body.style.width = ''
    window.scrollTo(0, 0)
  })

  afterEach(() => {
    document.body.style.height = ''
    document.body.style.width = ''
    window.scrollTo(0, 0)
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
    await expect.poll(() => result.current.y).toBe(100)
    expect(result.current.x).toBe(0)

    await act(() => result.current.setX(120))
    await expect.poll(() => result.current.x).toBe(120)
    expect(result.current.y).toBe(100)
  })

  it('should place the window at the initial x and y on mount', async () => {
    makeBodyScrollable()
    const { result } = await renderHook(() => useWindowScroll({ x: 30, y: 60 }))

    await expect.poll(() => result.current.x).toBe(30)
    await expect.poll(() => result.current.y).toBe(60)
  })

  it('should set isScrolling while scrolling and reset after idle', async () => {
    makeBodyScrollable()
    const { result, act } = await renderHook(() => useWindowScroll({ idle: 80 }))

    // keep the position unchanged so no native scroll/scrollend events
    // interfere — the reset below comes from the idle timeout alone
    await act(() => {
      window.dispatchEvent(new Event('scroll'))
    })
    expect(result.current.isScrolling).toBe(true)

    await expect.poll(() => result.current.isScrolling).toBe(false)
  })

  it('should track scroll directions and reset them on stop', async () => {
    makeBodyScrollable()
    const { result, act } = await renderHook(() => useWindowScroll({ idle: 50 }))

    await act(() => {
      window.scrollTo(0, 200)
      window.dispatchEvent(new Event('scroll'))
    })
    expect(result.current.directions).toEqual({
      left: false,
      right: false,
      top: false,
      bottom: true,
    })

    await act(() => {
      window.scrollTo(0, 50)
      window.dispatchEvent(new Event('scroll'))
    })
    expect(result.current.directions).toEqual({
      left: false,
      right: false,
      top: true,
      bottom: false,
    })

    await act(() => {
      window.scrollTo(150, 50)
      window.dispatchEvent(new Event('scroll'))
    })
    expect(result.current.directions).toEqual({
      left: false,
      right: true,
      top: false,
      bottom: false,
    })

    // directions and isScrolling reset when scrolling ends
    await expect.poll(() => result.current.directions).toEqual({
      left: false,
      right: false,
      top: false,
      bottom: false,
    })
    await expect.poll(() => result.current.isScrolling).toBe(false)
  })

  it('should update arrivedState within the offset', async () => {
    makeBodyScrollable()
    const { result, act } = await renderHook(() => useWindowScroll({ idle: 50 }))

    // at the top edge, within the default offset of 30px
    expect(result.current.arrivedState.top).toBe(true)

    await act(() => {
      window.scrollTo(0, 200)
      window.dispatchEvent(new Event('scroll'))
    })
    expect(result.current.arrivedState.top).toBe(false)
    expect(result.current.arrivedState.bottom).toBe(false)

    await act(() => {
      window.scrollTo(0, document.documentElement.scrollHeight)
      window.dispatchEvent(new Event('scroll'))
    })
    expect(result.current.arrivedState.bottom).toBe(true)

    await act(() => {
      window.scrollTo(0, 200)
      window.dispatchEvent(new Event('scroll'))
    })

    // a second hook with a custom top offset of 250px counts y=200 as arrived
    const { result: offsetResult } = await renderHook(() => useWindowScroll({ offset: { top: 250 } }))
    expect(offsetResult.current.arrivedState.top).toBe(true)
  })
})
