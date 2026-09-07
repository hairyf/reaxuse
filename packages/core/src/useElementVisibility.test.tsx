import type { UseIntersectionObserverOptions } from './useIntersectionObserver'
import { beforeEach, describe, expect, expectTypeOf, it, vi } from 'vitest'
import { renderHook } from 'vitest-browser-react'
import { useElementVisibility } from './useElementVisibility'
import { useIntersectionObserver } from './useIntersectionObserver'

// Mirror upstream's index.browser.test.ts: the underlying observer is mocked
// so the callback wiring and option passthrough can be asserted
// deterministically. `isSupported` reflects the resolved `window` option so the
// scroll/resize fallback path (a window without `IntersectionObserver`) can be
// exercised through the same mock.
vi.mock('./useIntersectionObserver', () => ({
  useIntersectionObserver: vi.fn(
    (_target: unknown, _callback?: IntersectionObserverCallback, options?: UseIntersectionObserverOptions) => ({
      isSupported: !options?.window || 'IntersectionObserver' in options.window,
      stop: vi.fn(),
    }),
  ),
}))

describe('useElementVisibility', () => {
  let el: HTMLDivElement

  beforeEach(() => {
    el = document.createElement('div')
    window.scrollTo(0, 0)
    vi.mocked(useIntersectionObserver).mockClear()
  })

  it('returns a plain boolean', () => {
    expectTypeOf(useElementVisibility).returns.toBeBoolean()
  })

  it('should work when el is not an element', async () => {
    const { result } = await renderHook(() => useElementVisibility(null))
    expect(result.current).toBe(false)
  })

  it('should work when window is undefined', async () => {
    const { result } = await renderHook(() => useElementVisibility(el, { window: null as unknown as undefined }))
    expect(result.current).toBe(false)
  })

  it('should work when threshold is undefined', async () => {
    const { result } = await renderHook(() => useElementVisibility(el, { threshold: null as unknown as undefined }))
    expect(result.current).toBe(false)
  })

  it('should allow set initial value', async () => {
    const { result } = await renderHook(() => useElementVisibility(el, { initialValue: true }))
    expect(result.current).toBe(true)
  })

  describe('when internally using useIntersectionObserver', () => {
    it('should call useIntersectionObserver internally', async () => {
      await renderHook(() => useElementVisibility(el))
      expect(vi.mocked(useIntersectionObserver)).toHaveBeenCalledTimes(1)
    })

    it('passes the given element to useIntersectionObserver', async () => {
      await renderHook(() => useElementVisibility(el))
      expect(vi.mocked(useIntersectionObserver).mock.lastCall?.[0]).toBe(el)
    })

    it('passes a callback to useIntersectionObserver that sets visibility based on isIntersecting', async () => {
      const { result, act } = await renderHook(() => useElementVisibility(el))
      const callback = vi.mocked(useIntersectionObserver).mock.lastCall?.[1]

      expect(result.current).toBe(false)

      await act(() => {
        callback?.([{ isIntersecting: false, time: 1 } as IntersectionObserverEntry], {} as IntersectionObserver)
      })
      expect(result.current).toBe(false)

      await act(() => {
        callback?.([{ isIntersecting: true, time: 1 } as IntersectionObserverEntry], {} as IntersectionObserver)
      })
      expect(result.current).toBe(true)

      await act(() => {
        callback?.([{ isIntersecting: false, time: 1 } as IntersectionObserverEntry], {} as IntersectionObserver)
      })
      expect(result.current).toBe(false)
    })

    it('uses the latest version of isIntersecting when multiple intersection entries are given', async () => {
      const { result, act } = await renderHook(() => useElementVisibility(el))
      const callback = vi.mocked(useIntersectionObserver).mock.lastCall?.[1]

      await act(() => {
        callback?.(
          [
            { isIntersecting: false, time: 1 },
            { isIntersecting: false, time: 2 },
            { isIntersecting: true, time: 3 },
          ] as IntersectionObserverEntry[],
          {} as IntersectionObserver,
        )
      })
      await expect.poll(() => result.current).toBe(true)

      await act(() => {
        callback?.(
          [
            { isIntersecting: true, time: 1 },
            { isIntersecting: false, time: 3 },
            { isIntersecting: true, time: 2 },
          ] as IntersectionObserverEntry[],
          {} as IntersectionObserver,
        )
      })
      await expect.poll(() => result.current).toBe(false)
    })

    it('passes the given window to useIntersectionObserver', async () => {
      const mockWindow = {} as Window

      await renderHook(() => useElementVisibility(el, { window: mockWindow }))
      expect(vi.mocked(useIntersectionObserver).mock.lastCall?.[2]?.window).toBe(mockWindow)
    })

    it('uses the given scrollTarget as the root element in useIntersectionObserver', async () => {
      const mockScrollTarget = document.createElement('div')

      await renderHook(() => useElementVisibility(el, { scrollTarget: mockScrollTarget }))
      expect(vi.mocked(useIntersectionObserver).mock.lastCall?.[2]?.root).toBe(mockScrollTarget)
    })

    it('returns a plain boolean, not the upstream controls object', async () => {
      const { result } = await renderHook(() => useElementVisibility(el))
      expect(result.current).toBeTypeOf('boolean')
      expect(result.current).not.toHaveProperty('isVisible')
      expect(result.current).not.toHaveProperty('stop')
    })

    it('stops the observer after the first visibility change when once is true', async () => {
      const { result, act } = await renderHook(() => useElementVisibility(el, { once: true }))
      const callback = vi.mocked(useIntersectionObserver).mock.lastCall?.[1]
      const stopMock = (vi.mocked(useIntersectionObserver).mock.results.at(-1)?.value as { stop: () => void } | undefined)?.stop

      await act(() => {
        callback?.([{ isIntersecting: true, time: 1 } as IntersectionObserverEntry], {} as IntersectionObserver)
      })
      expect(result.current).toBe(true)
      expect(stopMock).toHaveBeenCalled()
    })
  })

  describe('falls back to scroll/resize tracking without IntersectionObserver', () => {
    it('tracks visibility with bounding-box math on a window without IntersectionObserver', async () => {
      const listeners: Record<string, (() => void) | undefined> = {}
      const fakeWindow = {
        innerWidth: 800,
        innerHeight: 600,
        addEventListener: (type: string, listener: () => void) => {
          listeners[type] = listener
        },
        removeEventListener: (type: string) => {
          delete listeners[type]
        },
      } as unknown as Window

      const target = document.createElement('div')
      document.body.append(target)
      target.style.position = 'fixed'
      target.style.width = '100px'
      target.style.height = '100px'
      target.getBoundingClientRect = () => ({ top: 0, left: 0, right: 100, bottom: 100, width: 100, height: 100, x: 0, y: 0, toJSON: () => ({}) }) as DOMRect

      const { result, act, unmount } = await renderHook(() =>
        useElementVisibility({ current: target }, { window: fakeWindow }),
      )

      // inside the (fake) viewport right away
      await expect.poll(() => result.current).toBe(true)

      // simulate scrolling the target out of the viewport
      target.getBoundingClientRect = () => ({ top: 1000, left: 0, right: 100, bottom: 1100, width: 100, height: 100, x: 0, y: 0, toJSON: () => ({}) }) as DOMRect
      await act(() => {
        listeners.scroll?.()
      })
      await expect.poll(() => result.current).toBe(false)

      // scrolling it back in flips it again
      target.getBoundingClientRect = () => ({ top: 0, left: 0, right: 100, bottom: 100, width: 100, height: 100, x: 0, y: 0, toJSON: () => ({}) }) as DOMRect
      await act(() => {
        listeners.scroll?.()
      })
      await expect.poll(() => result.current).toBe(true)

      await unmount()
      expect(listeners.scroll).toBeUndefined()
      expect(listeners.resize).toBeUndefined()
      target.remove()
    })
  })
})
