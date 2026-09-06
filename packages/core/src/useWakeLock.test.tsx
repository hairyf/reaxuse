import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { renderHook } from 'vitest-browser-react'
import { useWakeLock } from './useWakeLock'

class MockWakeLockSentinel extends EventTarget {
  released = false
  type: WakeLockType = 'screen'

  release() {
    this.released = true
    return Promise.resolve()
  }
}

class MockDocument extends EventTarget {
  visibilityState: DocumentVisibilityState = 'hidden'
}

function defineWakeLockAPI() {
  const sentinel = new MockWakeLockSentinel()
  Object.defineProperty(navigator, 'wakeLock', {
    value: { request: async () => sentinel },
    configurable: true,
  })
  return sentinel
}

describe('useWakeLock', () => {
  // The stub shadows the (prototype) `navigator.wakeLock` with an own
  // property; restore the original own descriptor (or delete it) after each
  // test so no fake wake lock leaks into other tests.
  let originalWakeLock: PropertyDescriptor | undefined

  beforeEach(() => {
    originalWakeLock = Object.getOwnPropertyDescriptor(navigator, 'wakeLock')
  })

  afterEach(() => {
    if (originalWakeLock)
      Object.defineProperty(navigator, 'wakeLock', originalWakeLock)
    else
      delete (navigator as { wakeLock?: unknown }).wakeLock
  })

  it('isSupported is true when the Wake Lock API is stubbed', async () => {
    defineWakeLockAPI()

    const { result } = await renderHook(() => useWakeLock())

    await expect.poll(() => result.current.isSupported).toBe(true)
  })

  it('isSupported is false when the navigator has no wakeLock', async () => {
    const { result } = await renderHook(() => useWakeLock({ navigator: {} as Navigator }))

    await expect.poll(() => result.current.isSupported).toBe(false)
  })

  it('request acquires a sentinel, sets its type and activates', async () => {
    const sentinel = defineWakeLockAPI()

    const { result, act } = await renderHook(() => useWakeLock())

    expect(result.current.sentinel).toBeNull()

    await act(async () => {
      await result.current.request('screen')
    })

    expect(result.current.sentinel).toBe(sentinel)
    expect(result.current.sentinel?.type).toBe('screen')
    expect(result.current.isActive).toBe(true)
  })

  it('stays inactive when not supported', async () => {
    const { result, act } = await renderHook(() => useWakeLock({ navigator: {} as Navigator }))

    await act(async () => {
      await result.current.request('screen')
    })

    expect(result.current.sentinel).toBeNull()
    expect(result.current.isActive).toBe(false)

    await act(async () => {
      await result.current.release()
    })

    expect(result.current.isActive).toBe(false)
  })

  it('isActive flips via forceRequest and release when supported', async () => {
    defineWakeLockAPI()

    const { result, act } = await renderHook(() => useWakeLock())

    expect(result.current.isActive).toBe(false)

    await act(async () => {
      await result.current.forceRequest('screen')
    })
    expect(result.current.isActive).toBe(true)

    await act(async () => {
      await result.current.release()
    })
    expect(result.current.isActive).toBe(false)
  })

  it('stays active when visibilitychange fires while the document is visible', async () => {
    defineWakeLockAPI()

    const { result, act } = await renderHook(() => useWakeLock())

    await act(async () => {
      await result.current.request('screen')
    })
    expect(result.current.isActive).toBe(true)

    await act(() => {
      document.dispatchEvent(new Event('visibilitychange'))
    })

    expect(result.current.isActive).toBe(true)
  })

  it('delays requesting until the document becomes visible', async () => {
    defineWakeLockAPI()
    const mockDocument = new MockDocument()

    const { result, act } = await renderHook(() => useWakeLock({ document: mockDocument as unknown as Document }))

    await act(async () => {
      await result.current.request('screen')
    })
    expect(result.current.isActive).toBe(false)
    expect(result.current.sentinel).toBeNull()

    await act(() => {
      mockDocument.visibilityState = 'visible'
      mockDocument.dispatchEvent(new Event('visibilitychange'))
    })

    await expect.poll(() => result.current.isActive).toBe(true)
    expect(result.current.sentinel).not.toBeNull()
  })

  it('cancels a queued request when released before the document becomes visible', async () => {
    defineWakeLockAPI()
    const mockDocument = new MockDocument()

    const { result, act } = await renderHook(() => useWakeLock({ document: mockDocument as unknown as Document }))

    await act(async () => {
      await result.current.request('screen')
    })
    expect(result.current.isActive).toBe(false)

    await act(async () => {
      await result.current.release()
    })
    expect(result.current.isActive).toBe(false)

    await act(() => {
      mockDocument.visibilityState = 'visible'
      mockDocument.dispatchEvent(new Event('visibilitychange'))
    })

    expect(result.current.isActive).toBe(false)
    expect(result.current.sentinel).toBeNull()
  })

  it('becomes inactive when the wake lock is released externally, then re-requests', async () => {
    const sentinel = defineWakeLockAPI()
    const mockDocument = new MockDocument()
    mockDocument.visibilityState = 'visible'

    const { result, act } = await renderHook(() => useWakeLock({ document: mockDocument as unknown as Document }))

    await act(async () => {
      await result.current.request('screen')
    })
    expect(result.current.isActive).toBe(true)

    await act(() => {
      mockDocument.visibilityState = 'hidden'
      mockDocument.dispatchEvent(new Event('visibilitychange'))
      sentinel.dispatchEvent(new Event('release'))
    })

    await expect.poll(() => result.current.isActive).toBe(false)

    await act(async () => {
      mockDocument.visibilityState = 'visible'
      mockDocument.dispatchEvent(new Event('visibilitychange'))
      await result.current.request('screen')
    })

    await expect.poll(() => result.current.isActive).toBe(true)
  })

  it('releases the wake lock when the component unmounts', async () => {
    const sentinel = defineWakeLockAPI()

    const { result, act, unmount } = await renderHook(() => useWakeLock())

    await act(async () => {
      await result.current.request('screen')
    })
    expect(result.current.sentinel).toBe(sentinel)

    unmount()

    expect(sentinel.released).toBe(true)
  })

  it('handles the wake lock lifecycle with a custom navigator option', async () => {
    const sentinel = new MockWakeLockSentinel()
    const mockNavigator = {
      wakeLock: { request: async () => sentinel },
    } as Navigator

    const { result, act } = await renderHook(() => useWakeLock({ navigator: mockNavigator }))

    expect(result.current.isSupported).toBe(true)
    expect(result.current.sentinel).toBeNull()

    await act(async () => {
      await result.current.request('screen')
    })

    expect(result.current.sentinel).toBe(sentinel)
    expect(sentinel.released).toBe(false)

    await act(async () => {
      await result.current.release()
    })

    expect(result.current.sentinel).toBeNull()
  })

  it('propagates request rejection and leaves the sentinel unset', async () => {
    Object.defineProperty(navigator, 'wakeLock', {
      value: {
        request: async () => {
          throw new DOMException('denied', 'NotAllowedError')
        },
      },
      configurable: true,
    })

    const { result } = await renderHook(() => useWakeLock())

    // The rejection path updates no state, so no `act` is needed.
    await expect(result.current.request('screen')).rejects.toMatchObject({ name: 'NotAllowedError' })

    expect(result.current.sentinel).toBeNull()
    expect(result.current.isActive).toBe(false)
  })
})
