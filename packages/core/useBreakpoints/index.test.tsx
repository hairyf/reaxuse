import type { ReactNode } from 'react'
import { renderToString } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import { renderHook } from 'vitest-browser-react'
import { breakpointsBootstrapV5, useBreakpoints } from '../useBreakpoints'
import { SSRWidthProvider } from '../useSSRWidth'

/** Wrapper handing every rendered hook a global SSR width of `768px`. */
function providerWrapper({ children }: { children: ReactNode }) {
  return <SSRWidthProvider width={768}>{children}</SSRWidthProvider>
}

type ChangeListener = (event: MediaQueryListEvent) => void

interface FakeMediaQueryList {
  media: string
  matches: boolean
  addEventListener: (type: string, listener: ChangeListener) => void
  removeEventListener: (type: string, listener: ChangeListener) => void
}

/**
 * Evaluate a `(min|max)-width` query against a simulated viewport width.
 * `useBreakpoints` relies on the ±0.1px delta queries to separate strict from
 * inclusive comparisons, so the boundaries are exact.
 */
function matchesWidth(queryString: string, width: number): boolean {
  const min = queryString.match(/\(min-width:\s*(-?[\d.]+)px\)/)
  const max = queryString.match(/\(max-width:\s*(-?[\d.]+)px\)/)

  if (min && width < Number.parseFloat(min[1]))
    return false
  if (max && width > Number.parseFloat(max[1]))
    return false
  return true
}

/**
 * Deterministic `window.matchMedia` stub: one fake MediaQueryList **per query
 * string**, so distinct queries match independently — a 700px viewport
 * matches `(min-width: 640px)` while `(min-width: 768px)` stays false. Each
 * fake list carries its own change-listener registry and only the lists whose
 * `matches` flag actually flips dispatch a change event.
 */
function stubMatchMedia(initialWidth: number) {
  const lists = new Map<string, { list: FakeMediaQueryList, listeners: Set<ChangeListener> }>()
  let width = initialWidth

  const spy = vi.spyOn(window, 'matchMedia').mockImplementation((queryString: string) => {
    let entry = lists.get(queryString)

    if (!entry) {
      const listeners = new Set<ChangeListener>()
      const list: FakeMediaQueryList = {
        media: queryString,
        matches: matchesWidth(queryString, width),
        addEventListener: (type, listener) => {
          if (type === 'change')
            listeners.add(listener)
        },
        removeEventListener: (_type, listener) => {
          listeners.delete(listener)
        },
      }
      entry = { list, listeners }
      lists.set(queryString, entry)
    }

    return entry.list as unknown as MediaQueryList
  })

  return {
    /** Simulate a viewport resize, dispatching only the queries that changed. */
    setWidth: (nextWidth: number) => {
      width = nextWidth
      lists.forEach(({ list, listeners }) => {
        const next = matchesWidth(list.media, width)
        if (next === list.matches)
          return

        list.matches = next
        listeners.forEach(listener => listener({ matches: next } as MediaQueryListEvent))
      })
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

  it('should consume the global SSR width provided by SSRWidthProvider', async () => {
    const { result } = await renderHook(
      () => useBreakpoints(breakpointsBootstrapV5, { window: null as unknown as undefined }),
      { wrapper: providerWrapper },
    )
    const breakpoints = result.current

    // no per-hook `ssrWidth`: the 768px global width drives every query
    expect(breakpoints.current()).toStrictEqual(['xs', 'sm', 'md'])
    expect(breakpoints.active()).toBe('md')
    expect(breakpoints.sm).toBe(true)
    expect(breakpoints.md).toBe(true)
    expect(breakpoints.lg).toBe(false)
    expect(breakpoints.isGreaterOrEqual('md')).toBe(true)
    expect(breakpoints.isGreater('md')).toBe(false)
    expect(breakpoints.isSmallerOrEqual('md')).toBe(true)
    expect(breakpoints.between('md', 'lg')).toBe(true)
  })

  it('should let the per-hook ssrWidth option win over the provided width', async () => {
    const { result } = await renderHook(
      () => useBreakpoints(breakpointsBootstrapV5, {
        window: null as unknown as undefined,
        ssrWidth: 1200,
      }),
      { wrapper: providerWrapper },
    )

    // the option (1200) takes precedence over the provider (768)
    expect(result.current.current()).toStrictEqual(['xs', 'sm', 'md', 'lg', 'xl'])
    expect(result.current.active()).toBe('xl')
    expect(result.current.xl).toBe(true)
  })

  it('should render the provided SSR width on the server', () => {
    function SSRBreakpoints() {
      const bps = useBreakpoints({ sm: 640, md: 768 }, { window: null as unknown as undefined })
      return <div>{`active:${bps.active()} md:${bps.md}`}</div>
    }

    const html = renderToString(
      <SSRWidthProvider width={700}>
        <SSRBreakpoints />
      </SSRWidthProvider>,
    )

    // 700 >= 640 → sm active, 700 < 768 → md false
    expect(html).toContain('active:sm md:false')
  })

  it('should keep the default behaviour and never throw without a provider', async () => {
    const { result } = await renderHook(() =>
      useBreakpoints(breakpointsBootstrapV5, { window: null as unknown as undefined }))

    // no provider, no `ssrWidth` option → the documented empty default
    expect(result.current.current()).toStrictEqual([])
    expect(result.current.active()).toBe('')
    expect(result.current.md).toBe(false)
    expect(result.current.isGreaterOrEqual('md')).toBe(false)
    expect(result.current.isInBetween('sm', 'md')).toBe(false)
  })

  // `ssrWidth` can also come from the global store: `SSRWidthProvider` above
  // the caller (upstream's `provideSSRWidth`). The provider-specific paths are
  // covered by the scenarios above.
  it('should react to media query changes', async () => {
    const stub = stubMatchMedia(0)
    try {
      const { result, act } = await renderHook(() => useBreakpoints({ sm: 640, md: 768 }))

      expect(result.current.sm).toBe(false)
      expect(result.current.current()).toStrictEqual([])
      expect(result.current.active()).toBe('')

      await act(() => {
        stub.setWidth(800)
      })
      await expect.poll(() => result.current.sm).toBe(true)
      expect(result.current.md).toBe(true)
      expect(result.current.current()).toStrictEqual(['sm', 'md'])
      expect(result.current.active()).toBe('md')
    }
    finally {
      stub.restore()
    }
  })

  it('should react to per-query matches independently', async () => {
    const stub = stubMatchMedia(500)
    try {
      const { result, act } = await renderHook(() => useBreakpoints({ sm: 640, md: 768 }))

      // 500px: below sm, so only the "smaller than" side matches
      expect(result.current.greaterOrEqual('sm')).toBe(false)
      expect(result.current.greater('sm')).toBe(false)
      expect(result.current.smallerOrEqual('sm')).toBe(true)
      expect(result.current.smaller('sm')).toBe(true)
      expect(result.current.greaterOrEqual('md')).toBe(false)
      expect(result.current.smallerOrEqual('md')).toBe(true)
      expect(result.current.between('sm', 'md')).toBe(false)

      // exactly 640px: `>= sm` and `<= sm` match, the strict `> sm`
      // (min-width 640.1) and `< sm` (max-width 639.9) do not
      await act(() => {
        stub.setWidth(640)
      })
      await expect.poll(() => result.current.greaterOrEqual('sm')).toBe(true)
      expect(result.current.greater('sm')).toBe(false)
      expect(result.current.smallerOrEqual('sm')).toBe(true)
      expect(result.current.smaller('sm')).toBe(false)
      // md keeps its own state: the sm queries flipped, the md ones did not
      expect(result.current.greaterOrEqual('md')).toBe(false)
      expect(result.current.greater('md')).toBe(false)
      expect(result.current.smallerOrEqual('md')).toBe(true)
      expect(result.current.smaller('md')).toBe(true)
      expect(result.current.between('sm', 'md')).toBe(true)
      expect(result.current.sm).toBe(true)
      expect(result.current.md).toBe(false)

      // exactly 768px: `> sm` (640.1) flips on while `> md` (768.1) stays off
      await act(() => {
        stub.setWidth(768)
      })
      await expect.poll(() => result.current.greater('sm')).toBe(true)
      expect(result.current.greaterOrEqual('sm')).toBe(true)
      expect(result.current.smallerOrEqual('sm')).toBe(false)
      expect(result.current.smaller('sm')).toBe(false)
      expect(result.current.greaterOrEqual('md')).toBe(true)
      expect(result.current.greater('md')).toBe(false)
      expect(result.current.smallerOrEqual('md')).toBe(true)
      expect(result.current.smaller('md')).toBe(false)
      expect(result.current.between('sm', 'md')).toBe(false)

      // 800px: every sm query matches, the md upper bounds stop matching
      await act(() => {
        stub.setWidth(800)
      })
      await expect.poll(() => result.current.greater('md')).toBe(true)
      expect(result.current.greaterOrEqual('sm')).toBe(true)
      expect(result.current.greater('sm')).toBe(true)
      expect(result.current.smallerOrEqual('sm')).toBe(false)
      expect(result.current.smaller('sm')).toBe(false)
      expect(result.current.greaterOrEqual('md')).toBe(true)
      expect(result.current.smallerOrEqual('md')).toBe(false)
      expect(result.current.smaller('md')).toBe(false)
      expect(result.current.between('sm', 'md')).toBe(false)
    }
    finally {
      stub.restore()
    }
  })
})
