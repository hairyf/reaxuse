import { describe, expect, it, vi } from 'vitest'
import { renderHook } from 'vitest-browser-react'
import { useBrowserLocation } from './useBrowserLocation'

function createMockWindow(initialHref = 'http://localhost/') {
  const url = new URL(initialHref)

  const location = {
    hash: url.hash,
    host: url.host,
    hostname: url.hostname,
    href: url.href,
    pathname: url.pathname,
    port: url.port,
    protocol: url.protocol,
    search: url.search,
    origin: url.origin,
  }

  return {
    location,
    history: { state: null, length: 1 },
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }
}

describe('useBrowserLocation', () => {
  it('should read initial location values', async () => {
    const mockWindow = createMockWindow('http://localhost/path?q=1#anchor')
    const { result } = await renderHook(() => useBrowserLocation({ window: mockWindow as unknown as Window }))

    expect(result.current.href).toBe('http://localhost/path?q=1#anchor')
    expect(result.current.pathname).toBe('/path')
    expect(result.current.search).toBe('?q=1')
    expect(result.current.hash).toBe('#anchor')
    expect(result.current.origin).toBe('http://localhost')
    expect(result.current.trigger).toBe('load')
  })

  it('should not revert a URL change made via history.replaceState', async () => {
    const mockWindow = createMockWindow('http://localhost/initial')

    const { result } = await renderHook(() => useBrowserLocation({ window: mockWindow as unknown as Window }))

    // Simulate history.replaceState: URL changes without triggering popstate event
    mockWindow.location.href = 'http://localhost/replaced'
    mockWindow.location.pathname = '/replaced'

    // React has no Vue scheduler flush — the initial snapshot is read once and
    // never written back, so the replaced URL is left untouched
    expect(mockWindow.location.href).toBe('http://localhost/replaced')
    expect(mockWindow.location.pathname).toBe('/replaced')
    expect(result.current.href).toBe('http://localhost/initial')
  })

  it('should not write any location property during plain initialization', async () => {
    const written: string[] = []
    const mockWindow = createMockWindow('http://localhost/')

    mockWindow.location = new Proxy(mockWindow.location, {
      set(target, key, value) {
        written.push(String(key))
        ;(target as any)[key] = value
        return true
      },
    })

    await renderHook(() => useBrowserLocation({ window: mockWindow as unknown as Window }))

    expect(written).toEqual([])
  })

  it('should update the returned location on popstate and hashchange events', async () => {
    const mockWindow = createMockWindow('http://localhost/')
    const { result, act } = await renderHook(() => useBrowserLocation({ window: mockWindow as unknown as Window }))

    const hashchangeListener = vi.mocked(mockWindow.addEventListener).mock.calls.find(args => args[0] === 'hashchange')?.[1]
    const popstateListener = vi.mocked(mockWindow.addEventListener).mock.calls.find(args => args[0] === 'popstate')?.[1]

    expect(hashchangeListener).toBeTypeOf('function')
    expect(popstateListener).toBeTypeOf('function')

    mockWindow.location.href = 'http://localhost/path?q=1#anchor'
    mockWindow.location.pathname = '/path'
    mockWindow.location.search = '?q=1'
    mockWindow.location.hash = '#anchor'

    await act(() => {
      ;(hashchangeListener as () => void)()
    })
    expect(result.current.trigger).toBe('hashchange')
    expect(result.current.hash).toBe('#anchor')

    await act(() => {
      ;(popstateListener as () => void)()
    })
    expect(result.current.trigger).toBe('popstate')
    expect(result.current.href).toBe('http://localhost/path?q=1#anchor')
    expect(result.current.search).toBe('?q=1')
  })

  it('should write assigned writable fields through to window.location', async () => {
    const mockWindow = createMockWindow('http://localhost/')
    const { result } = await renderHook(() => useBrowserLocation({ window: mockWindow as unknown as Window }))

    result.current.hash = '#top'
    expect(mockWindow.location.hash).toBe('#top')

    result.current.pathname = '/new-path'
    expect(mockWindow.location.pathname).toBe('/new-path')

    // assigning the current value is a no-op
    result.current.href = 'http://localhost/'
    expect(mockWindow.location.href).toBe('http://localhost/')
  })

  it('should remove its listeners on unmount', async () => {
    const mockWindow = createMockWindow('http://localhost/')
    const { unmount } = await renderHook(() => useBrowserLocation({ window: mockWindow as unknown as Window }))

    unmount()

    expect(mockWindow.removeEventListener).toHaveBeenCalledWith('popstate', expect.any(Function))
    expect(mockWindow.removeEventListener).toHaveBeenCalledWith('hashchange', expect.any(Function))
  })
})
