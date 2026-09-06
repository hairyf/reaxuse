import { describe, expect, it, vi } from 'vitest'
import { renderHook } from 'vitest-browser-react'
import { useMediaQuery } from './useMediaQuery'

type ChangeListener = (event: MediaQueryListEvent) => void

/**
 * Deterministic `window.matchMedia` stub: a fake MediaQueryList with a
 * `matches` flag, a change-listener registry and a dispatchable change
 * event — mirroring the real `addEventListener('change', ...)` semantics
 * the hook relies on.
 */
function stubMatchMedia(initialMatches: boolean) {
  const queries: string[] = []
  const listeners = new Set<ChangeListener>()
  const query = {
    matches: initialMatches,
    addEventListener: (type: string, listener: ChangeListener) => {
      if (type === 'change')
        listeners.add(listener)
    },
    removeEventListener: (type: string, listener: ChangeListener) => {
      listeners.delete(listener)
    },
  }

  const spy = vi.spyOn(window, 'matchMedia').mockImplementation((queryString: string) => {
    queries.push(queryString)
    return query as unknown as MediaQueryList
  })

  return {
    queries,
    listenerCount: () => listeners.size,
    dispatchChange: (matches: boolean) => {
      query.matches = matches
      listeners.forEach(listener => listener({ matches } as MediaQueryListEvent))
    },
    restore: () => spy.mockRestore(),
  }
}

describe('useMediaQuery', () => {
  it('should be defined', () => {
    expect(useMediaQuery).toBeDefined()
  })

  it('should be false without window', async () => {
    const { result } = await renderHook(() => useMediaQuery('(min-width: 0px)', { window: null as unknown as undefined }))
    expect(result.current).toBe(false)
  })

  // The upstream test suite also covers `provideSSRWidth` (a Vue
  // provide/inject global SSR width store). React has no injection context, so
  // `ssrWidth` is passed per-hook via the options object — that path is
  // covered by the scenario below.
  it('should support ssr media queries', async () => {
    const query = { current: '(min-width: 500px)' }
    const { result, rerender } = await renderHook(
      (props?: { query: { current: string }, ssrWidth: number }) =>
        useMediaQuery(props!.query, { window: null as unknown as undefined, ssrWidth: props!.ssrWidth }),
      { initialProps: { query, ssrWidth: 500 } },
    )
    expect(result.current).toBe(true)

    query.current = '(min-width: 501px)'
    await rerender({ query, ssrWidth: 500 })
    expect(result.current).toBe(false)

    query.current = '(min-width: 500px) and (max-width: 37rem)'
    await rerender({ query, ssrWidth: 500 })
    expect(result.current).toBe(true)

    query.current = '(max-width: 31rem)'
    await rerender({ query, ssrWidth: 500 })
    expect(result.current).toBe(false)

    query.current = '(max-width: 31rem), (min-width: 400px)'
    await rerender({ query, ssrWidth: 500 })
    expect(result.current).toBe(true)

    query.current = '(max-width: 31rem), not all and (min-width: 400px)'
    await rerender({ query, ssrWidth: 500 })
    expect(result.current).toBe(false)

    query.current = 'not all (min-width: 400px) and (max-width: 600px)'
    await rerender({ query, ssrWidth: 500 })
    expect(result.current).toBe(false)

    query.current = 'not all (max-width: 100px) and (min-width: 1000px)'
    await rerender({ query, ssrWidth: 500 })
    expect(result.current).toBe(true)
  })

  it('should re-resolve a getter query on re-render', async () => {
    let current = '(min-width: 500px)'
    const getQuery = () => current
    const { result, rerender } = await renderHook(
      (props?: { query: () => string }) =>
        useMediaQuery(props!.query, { window: null as unknown as undefined, ssrWidth: 500 }),
      { initialProps: { query: getQuery } },
    )
    expect(result.current).toBe(true)

    current = '(min-width: 501px)'
    await rerender({ query: getQuery })
    expect(result.current).toBe(false)
  })

  it('should reflect a matching media query as true', async () => {
    const stub = stubMatchMedia(true)
    const { result } = await renderHook(() => useMediaQuery('(min-width: 1024px)'))

    expect(result.current).toBe(true)
    expect(stub.queries).toEqual(['(min-width: 1024px)'])
    stub.restore()
  })

  it('should default to false when the query does not match', async () => {
    const stub = stubMatchMedia(false)
    const { result } = await renderHook(() => useMediaQuery('(min-width: 1024px)'))

    expect(result.current).toBe(false)
    expect(stub.queries).toEqual(['(min-width: 1024px)'])
    stub.restore()
  })

  it('should flip on the media query change event', async () => {
    const stub = stubMatchMedia(false)
    const { result, act } = await renderHook(() => useMediaQuery('(min-width: 1024px)'))

    expect(result.current).toBe(false)

    await act(() => {
      stub.dispatchChange(true)
    })
    await expect.poll(() => result.current).toBe(true)

    await act(() => {
      stub.dispatchChange(false)
    })
    await expect.poll(() => result.current).toBe(false)

    stub.restore()
  })

  it('should remove its change listener on unmount', async () => {
    const stub = stubMatchMedia(false)
    const { result, unmount } = await renderHook(() => useMediaQuery('(min-width: 1024px)'))

    expect(result.current).toBe(false)

    unmount()
    expect(stub.listenerCount()).toBe(0)

    stub.dispatchChange(true)
    expect(result.current).toBe(false)

    stub.restore()
  })

  it('should support a custom window option', async () => {
    const queries: string[] = []
    const listeners: ChangeListener[] = []
    let matches = false
    const fakeWindow = {
      matchMedia: (queryString: string) => {
        queries.push(queryString)
        return {
          matches,
          addEventListener: (type: string, listener: ChangeListener) => {
            if (type === 'change')
              listeners.push(listener)
          },
          removeEventListener: () => {},
        } as unknown as MediaQueryList
      },
    } as unknown as Window

    const { result, act } = await renderHook(() => useMediaQuery('(min-width: 1024px)', { window: fakeWindow }))

    expect(result.current).toBe(false)
    expect(queries).toEqual(['(min-width: 1024px)'])

    await act(() => {
      matches = true
      listeners.forEach(listener => listener({ matches } as MediaQueryListEvent))
    })
    await expect.poll(() => result.current).toBe(true)
  })

  it('should re-bind the media query when the query string changes', async () => {
    const stub = stubMatchMedia(true)
    const query = { current: '(min-width: 1024px)' }
    const { result, rerender } = await renderHook(
      (props?: { query: { current: string } }) => useMediaQuery(props!.query),
      { initialProps: { query } },
    )

    expect(result.current).toBe(true)
    expect(stub.queries).toEqual(['(min-width: 1024px)'])

    query.current = '(min-width: 768px)'
    await rerender({ query })
    expect(result.current).toBe(true)
    expect(stub.queries).toEqual(['(min-width: 1024px)', '(min-width: 768px)'])

    stub.restore()
  })
})
