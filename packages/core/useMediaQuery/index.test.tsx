import { renderToString } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import { renderHook } from 'vitest-browser-react'
import { useMediaQuery } from '../useMediaQuery'

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
    const { result, rerender } = await renderHook(
      (props: { query: string, ssrWidth: number }) =>
        useMediaQuery(props.query, { window: null as unknown as undefined, ssrWidth: props.ssrWidth }),
      { initialProps: { query: '(min-width: 500px)', ssrWidth: 500 } },
    )
    expect(result.current).toBe(true)

    await rerender({ query: '(min-width: 501px)', ssrWidth: 500 })
    expect(result.current).toBe(false)

    await rerender({ query: '(min-width: 500px) and (max-width: 37rem)', ssrWidth: 500 })
    expect(result.current).toBe(true)

    await rerender({ query: '(max-width: 31rem)', ssrWidth: 500 })
    expect(result.current).toBe(false)

    await rerender({ query: '(max-width: 31rem), (min-width: 400px)', ssrWidth: 500 })
    expect(result.current).toBe(true)

    await rerender({ query: '(max-width: 31rem), not all and (min-width: 400px)', ssrWidth: 500 })
    expect(result.current).toBe(false)

    await rerender({ query: 'not all (min-width: 400px) and (max-width: 600px)', ssrWidth: 500 })
    expect(result.current).toBe(false)

    await rerender({ query: 'not all (max-width: 100px) and (min-width: 1000px)', ssrWidth: 500 })
    expect(result.current).toBe(true)
  })

  it('should render the ssrWidth match on the server without reading window.matchMedia', async () => {
    const matchMediaSpy = vi.spyOn(window, 'matchMedia')

    function SSRMediaQuery() {
      const isLarge = useMediaQuery('(min-width: 1024px)', { ssrWidth: 768 })
      const isMedium = useMediaQuery('(min-width: 500px)', { ssrWidth: 768 })
      return <div>{`large:${isLarge} medium:${isMedium}`}</div>
    }

    const html = await renderToString(<SSRMediaQuery />)

    // 768 < 1024 → false, 768 >= 500 → true, resolved during render (no effects)
    expect(html).toContain('large:false medium:true')
    expect(matchMediaSpy).not.toHaveBeenCalled()

    matchMediaSpy.mockRestore()
  })

  it('should render the ssrWidth match before matchMedia syncs, then let matchMedia win', async () => {
    const stub = stubMatchMedia(true)
    const renderValues: boolean[] = []

    function useProbe() {
      const matches = useMediaQuery('(min-width: 1024px)', { ssrWidth: 768 })
      renderValues.push(matches)
      return matches
    }

    const { result } = await renderHook(() => useProbe())

    // first render (SSR / before hydration) uses ssrWidth: 768 < 1024 → false
    expect(renderValues[0]).toBe(false)
    // the mount effect then syncs the real matchMedia result
    expect(result.current).toBe(true)
    expect(stub.queries).toEqual(['(min-width: 1024px)'])

    stub.restore()
  })

  it('should let a non-matching matchMedia override a matching ssrWidth', async () => {
    const stub = stubMatchMedia(false)
    const { result } = await renderHook(() =>
      useMediaQuery('(min-width: 500px)', { ssrWidth: 500 }))

    // ssrWidth alone would match (500 >= 500), but the client matchMedia wins
    expect(result.current).toBe(false)
    expect(stub.queries).toEqual(['(min-width: 500px)'])

    stub.restore()
  })

  it('should re-resolve a plain query string on re-render', async () => {
    const { result, rerender } = await renderHook(
      (props: { query: string }) =>
        useMediaQuery(props.query, { window: null as unknown as undefined, ssrWidth: 500 }),
      { initialProps: { query: '(min-width: 500px)' } },
    )
    expect(result.current).toBe(true)

    await rerender({ query: '(min-width: 501px)' })
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
    const { result, rerender } = await renderHook(
      (props: { query: string }) => useMediaQuery(props.query),
      { initialProps: { query: '(min-width: 1024px)' } },
    )

    expect(result.current).toBe(true)
    expect(stub.queries).toEqual(['(min-width: 1024px)'])

    await rerender({ query: '(min-width: 768px)' })
    expect(result.current).toBe(true)
    expect(stub.queries).toEqual(['(min-width: 1024px)', '(min-width: 768px)'])

    stub.restore()
  })
})
