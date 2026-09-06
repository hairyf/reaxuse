import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { renderHook } from 'vitest-browser-react'
import { useScrollLock } from './useScrollLock'

describe('useScrollLock', () => {
  let targetEl: HTMLElement

  beforeEach(() => {
    targetEl = document.createElement('div')
    document.body.appendChild(targetEl)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should lock the scroll', async () => {
    const { result, act } = await renderHook(() => useScrollLock(targetEl))

    expect(result.current[0]).toBe(false)
    expect(targetEl.style.overflow).toBe('')

    await act(() => {
      result.current[1](true)
    })
    expect(targetEl.style.overflow).toBe('hidden')
    expect(result.current[0]).toBe(true)

    await act(() => {
      result.current[1](false)
    })
    expect(targetEl.style.overflow).toBe('')
    expect(result.current[0]).toBe(false)
  })

  it('should cache the initial overflow setting', async () => {
    targetEl.style.overflow = 'auto'

    const { result, act } = await renderHook(() => useScrollLock(targetEl))

    await act(() => {
      result.current[1](true)
    })
    expect(targetEl.style.overflow).toBe('hidden')

    await act(() => {
      result.current[1](false)
    })
    expect(targetEl.style.overflow).toBe('auto')
  })

  it('locks on mount with initialState = true', async () => {
    const { result, act } = await renderHook(() => useScrollLock(targetEl, true))

    expect(result.current[0]).toBe(true)
    expect(targetEl.style.overflow).toBe('hidden')

    await act(() => {
      result.current[1](false)
    })
    expect(targetEl.style.overflow).toBe('')
    expect(result.current[0]).toBe(false)
  })

  it('adopts an element that is already hidden as locked', async () => {
    // external CSS (or another hook instance) locked the element before mount
    targetEl.style.overflow = 'hidden'

    const { result, act } = await renderHook(() => useScrollLock(targetEl))

    expect(result.current[0]).toBe(true)
    expect(targetEl.style.overflow).toBe('hidden')

    await act(() => {
      result.current[1](false)
    })
    // mirrors upstream: `initialOverflow` was never captured past the
    // already-hidden short-circuit, so unlock restores the empty default
    expect(targetEl.style.overflow).toBe('')
  })

  it('automatically unlocks on component unmount', async () => {
    const { result, act, unmount } = await renderHook(() => useScrollLock(targetEl))

    await act(() => {
      result.current[1](true)
    })
    expect(targetEl.style.overflow).toBe('hidden')

    await unmount()
    expect(targetEl.style.overflow).toBe('')
  })

  it('handles touchmove event on IOS devices', async () => {
    vi.spyOn(window.navigator, 'userAgent', 'get').mockReturnValue(
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
    )
    const addEventListener = vi.spyOn(targetEl, 'addEventListener')
    const removeEventListener = vi.spyOn(targetEl, 'removeEventListener')

    const { result, act } = await renderHook(() => useScrollLock(targetEl))

    expect(addEventListener).toHaveBeenCalledTimes(0)

    await act(() => {
      result.current[1](true)
    })
    expect(addEventListener).toHaveBeenCalledTimes(1)
    expect(addEventListener.mock.calls[0]?.[0]).toBe('touchmove')
    expect(removeEventListener).toHaveBeenCalledTimes(0)

    await act(() => {
      result.current[1](false)
    })
    expect(removeEventListener).toHaveBeenCalledTimes(1)
  })

  it('multiple instances point at the same element, will share the same initialOverflow', async () => {
    const one = await renderHook(() => useScrollLock(targetEl))
    const two = await renderHook(() => useScrollLock(targetEl))

    await one.act(() => {
      one.result.current[1](true)
    })
    await two.act(() => {
      two.result.current[1](true)
    })
    expect(targetEl.style.overflow).toBe('hidden')

    await two.act(() => {
      two.result.current[1](false)
    })
    expect(targetEl.style.overflow).toBe('')
    // mirrors upstream: the first instance still reports locked while the
    // shared initial overflow has been restored by the second unlock
    expect(one.result.current[0]).toBe(true)
  })

  it('accepts a ref-like { current } source', async () => {
    const refLike: { current: HTMLElement | null } = { current: targetEl }

    const { result, act } = await renderHook(() => useScrollLock(refLike))

    await act(() => {
      result.current[1](true)
    })
    expect(targetEl.style.overflow).toBe('hidden')

    await act(() => {
      result.current[1](false)
    })
    expect(targetEl.style.overflow).toBe('')
  })

  it('accepts a getter source', async () => {
    const { result, act } = await renderHook(() => useScrollLock(() => targetEl))

    await act(() => {
      result.current[1](true)
    })
    expect(targetEl.style.overflow).toBe('hidden')

    await act(() => {
      result.current[1](false)
    })
    expect(targetEl.style.overflow).toBe('')
  })

  it('re-syncs the lock when the element changes', async () => {
    const elA = document.createElement('div')
    const elB = document.createElement('div')
    document.body.appendChild(elA)
    document.body.appendChild(elB)

    const { result, act, rerender } = await renderHook(
      (props?: { target?: HTMLElement }) => useScrollLock(props?.target),
      { initialProps: { target: elA } },
    )

    await act(() => {
      result.current[1](true)
    })
    expect(elA.style.overflow).toBe('hidden')

    rerender({ target: elB })
    await expect.poll(() => elB.style.overflow).toBe('hidden')
    expect(result.current[0]).toBe(true)
    // mirrors upstream: the previous element is not restored on swap
    expect(elA.style.overflow).toBe('hidden')

    await act(() => {
      result.current[1](false)
    })
    expect(elB.style.overflow).toBe('')
    expect(result.current[0]).toBe(false)
  })

  it('locks the document element for Window and Document targets', async () => {
    const initialOverflow = document.documentElement.style.overflow

    try {
      const win = await renderHook(() => useScrollLock(window))

      await win.act(() => {
        win.result.current[1](true)
      })
      expect(document.documentElement.style.overflow).toBe('hidden')

      await win.act(() => {
        win.result.current[1](false)
      })
      expect(document.documentElement.style.overflow).toBe(initialOverflow)

      const doc = await renderHook(() => useScrollLock(document))

      await doc.act(() => {
        doc.result.current[1](true)
      })
      expect(document.documentElement.style.overflow).toBe('hidden')

      await doc.act(() => {
        doc.result.current[1](false)
      })
      expect(document.documentElement.style.overflow).toBe(initialOverflow)
    }
    finally {
      document.documentElement.style.overflow = initialOverflow
    }
  })
})
