import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { renderHook } from 'vitest-browser-react'
import { useElementHover } from './useElementHover'

describe('useElementHover', () => {
  it('should be defined', () => {
    expect(useElementHover).toBeDefined()
  })

  it('should initialize with false by default', async () => {
    const el = document.createElement('button')
    const { result } = await renderHook(() => useElementHover(el))
    expect(result.current).toBe(false)
  })

  it('should be SSR-safe: stays false while no target element is resolved', async () => {
    const el = document.createElement('button')
    const { result, act } = await renderHook(() => useElementHover({ current: null }))
    expect(result.current).toBe(false)

    // no listeners are attached while there is no target, so events on other
    // elements or the document never flip the state
    await act(() => {
      el.dispatchEvent(new MouseEvent('mouseenter'))
      document.dispatchEvent(new MouseEvent('mouseenter'))
    })
    expect(result.current).toBe(false)
  })

  it('should accept an element as target', async () => {
    const el = document.createElement('button')
    const { result, act } = await renderHook(() => useElementHover(el))

    await act(() => {
      el.dispatchEvent(new MouseEvent('mouseenter'))
    })
    expect(result.current).toBe(true)

    await act(() => {
      el.dispatchEvent(new MouseEvent('mouseleave'))
    })
    expect(result.current).toBe(false)
  })

  it('should accept a ref-like target', async () => {
    const el = document.createElement('button')
    const target = { current: el }
    const { result, act } = await renderHook(() => useElementHover(target))

    await act(() => {
      el.dispatchEvent(new MouseEvent('mouseenter'))
    })
    expect(result.current).toBe(true)
  })

  it('should toggle hover state on mouseenter / mouseleave', async () => {
    const el = document.createElement('button')
    const { result, act } = await renderHook(() => useElementHover(el))
    expect(result.current).toBe(false)

    await act(() => {
      el.dispatchEvent(new MouseEvent('mouseenter'))
    })
    expect(result.current).toBe(true)

    await act(() => {
      el.dispatchEvent(new MouseEvent('mouseleave'))
    })
    expect(result.current).toBe(false)
  })

  it('should reset the hover state when the element is removed with triggerOnRemoval', async () => {
    const el = document.createElement('button')
    document.body.appendChild(el)
    const { result, act } = await renderHook(() => useElementHover(el, { triggerOnRemoval: true }))

    await act(() => {
      el.dispatchEvent(new MouseEvent('mouseenter'))
    })
    expect(result.current).toBe(true)

    await act(async () => {
      el.remove()
    })
    expect(result.current).toBe(false)
  })

  describe('delay', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('should delay entering with delayEnter', async () => {
      const el = document.createElement('button')
      const { result, act } = await renderHook(() => useElementHover(el, { delayEnter: 100 }))

      await act(() => {
        el.dispatchEvent(new MouseEvent('mouseenter'))
      })
      expect(result.current).toBe(false)

      await act(() => {
        vi.advanceTimersByTime(99)
      })
      expect(result.current).toBe(false)

      await act(() => {
        vi.advanceTimersByTime(1)
      })
      expect(result.current).toBe(true)
    })

    it('should delay leaving with delayLeave', async () => {
      const el = document.createElement('button')
      const { result, act } = await renderHook(() => useElementHover(el, { delayLeave: 100 }))

      await act(() => {
        el.dispatchEvent(new MouseEvent('mouseenter'))
      })
      expect(result.current).toBe(true)

      await act(() => {
        el.dispatchEvent(new MouseEvent('mouseleave'))
      })
      expect(result.current).toBe(true)

      await act(() => {
        vi.advanceTimersByTime(100)
      })
      expect(result.current).toBe(false)
    })

    it('should cancel a pending timer on a new event', async () => {
      const el = document.createElement('button')
      const { result, act } = await renderHook(() => useElementHover(el, { delayEnter: 100, delayLeave: 100 }))

      await act(() => {
        el.dispatchEvent(new MouseEvent('mouseenter'))
      })

      // leave before the enter delay elapses: the pending timer is cancelled
      await act(() => {
        el.dispatchEvent(new MouseEvent('mouseleave'))
      })
      await act(() => {
        vi.advanceTimersByTime(200)
      })
      expect(result.current).toBe(false)
    })
  })
})
