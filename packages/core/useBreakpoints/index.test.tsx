import { describe, expect, it, vi } from 'vitest'
import { renderHook } from 'vitest-browser-react'
import { breakpointsBootstrapV5, useBreakpoints } from '../useBreakpoints'

type ChangeListener = (event: MediaQueryListEvent) => void

/**
 * Deterministic `window.matchMedia` stub: a fake MediaQueryList with a
 * `matches` flag, a change-listener registry and a dispatchable change
 * event — mirroring the real `addEventListener('change', ...)` semantics
 * the underlying `useMediaQuery` relies on.
 */
function stubMatchMedia(initialMatches: boolean) {
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

  const spy = vi.spyOn(window, 'matchMedia').mockImplementation((_queryString: string) => {
    return query as unknown as MediaQueryList
  })

  return {
    dispatchChange: (matches: boolean) => {
      query.matches = matches
      listeners.forEach(listener => listener({ matches } as MediaQueryListEvent))
    },
    restore: () => spy.mockRestore(),
  }
}

describe('useBreakpoints', () => {
  it('should be defined', () => {
    expect(useBreakpoints).toBeDefined()
  })

  it('should support ssr breakpoints', async () => {
    const { result } = await renderHook(() =>
      useBreakpoints(breakpointsBootstrapV5, { window: null as unknown as undefined, ssrWidth: 768 }),
    )
    const breakpoints = result.current

    expect(breakpoints.current()).toStrictEqual(['xs', 'sm', 'md'])
    expect(breakpoints.active()).toBe('md')
    expect(breakpoints.isGreater('md')).toBe(false)
    expect(breakpoints.isGreaterOrEqual('md')).toBe(true)
    expect(breakpoints.isSmaller('md')).toBe(false)
    expect(breakpoints.isSmallerOrEqual('md')).toBe(true)
    expect(breakpoints.isInBetween('md', 'lg')).toBe(true)
    expect(breakpoints.isInBetween('sm', 'md')).toBe(false)
    expect(breakpoints.md).toBe(true)
    expect(breakpoints.lg).toBe(false)
    expect(breakpoints.sm).toBe(true)
  })

  it('should support max-width strategy', async () => {
    const { result } = await renderHook(() =>
      useBreakpoints({
        xl: 1399,
        lg: 1199,
        md: 991,
        sm: 767,
        xs: 575,
      }, { strategy: 'max-width', window: null as unknown as undefined, ssrWidth: 768 }),
    )
    const breakpoints = result.current

    expect(breakpoints.current()).toStrictEqual(['md', 'lg', 'xl'])
    expect(breakpoints.active()).toBe('md')
    expect(breakpoints.isGreater('md')).toBe(false)
    expect(breakpoints.isGreaterOrEqual('sm')).toBe(true)
    expect(breakpoints.isSmaller('md')).toBe(true)
    expect(breakpoints.isSmallerOrEqual('sm')).toBe(false)
    expect(breakpoints.isInBetween('md', 'lg')).toBe(false)
    expect(breakpoints.isInBetween('sm', 'md')).toBe(true)
    expect(breakpoints.md).toBe(true)
    expect(breakpoints.lg).toBe(true)
    expect(breakpoints.sm).toBe(false)
  })

  // The upstream test suite also covers `provideSSRWidth` (a Vue
  // provide/inject global SSR width store). React has no injection context,
  // so `ssrWidth` is passed per-hook via the options object — that path is
  // covered by the two scenarios above.
  it('should react to media query changes', async () => {
    const stub = stubMatchMedia(false)
    const { result, act } = await renderHook(() => useBreakpoints({ sm: 640, md: 768 }))

    expect(result.current.sm).toBe(false)
    expect(result.current.current()).toStrictEqual([])
    expect(result.current.active()).toBe('')

    await act(() => {
      stub.dispatchChange(true)
    })
    await expect.poll(() => result.current.sm).toBe(true)
    expect(result.current.md).toBe(true)
    expect(result.current.current()).toStrictEqual(['sm', 'md'])
    expect(result.current.active()).toBe('md')

    stub.restore()
  })
})
