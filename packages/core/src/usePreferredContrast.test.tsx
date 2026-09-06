import type { ContrastType } from './usePreferredContrast'
import { expect, it, vi } from 'vitest'
import { renderHook } from 'vitest-browser-react'
import { usePreferredContrast } from './usePreferredContrast'

type ChangeListener = (event: MediaQueryListEvent) => void

const QUERY_MORE = '(prefers-contrast: more)'
const QUERY_LESS = '(prefers-contrast: less)'
const QUERY_CUSTOM = '(prefers-contrast: custom)'
const ALL_QUERIES = [QUERY_MORE, QUERY_LESS, QUERY_CUSTOM]

/**
 * Deterministic `window.matchMedia` stub: one fake MediaQueryList per query
 * string, each with a `matches` flag, a change-listener registry and a
 * dispatchable change event — mirroring the real
 * `addEventListener('change', ...)` semantics the hook relies on.
 */
function stubMatchMedia(initialMatches: Record<string, boolean> = {}) {
  const queries: string[] = []
  const state = new Map<string, { matches: boolean, listeners: Set<ChangeListener> }>()

  const spy = vi.spyOn(window, 'matchMedia').mockImplementation((queryString: string) => {
    queries.push(queryString)
    const entry = {
      matches: initialMatches[queryString] ?? false,
      listeners: new Set<ChangeListener>(),
    }
    state.set(queryString, entry)
    return {
      get matches() {
        return entry.matches
      },
      addEventListener: (type: string, listener: ChangeListener) => {
        if (type === 'change')
          entry.listeners.add(listener)
      },
      removeEventListener: (type: string, listener: ChangeListener) => {
        entry.listeners.delete(listener)
      },
    } as unknown as MediaQueryList
  })

  return {
    queries,
    listenerCount: () => {
      let count = 0
      state.forEach(entry => count += entry.listeners.size)
      return count
    },
    dispatchChange: (queryString: string, matches: boolean) => {
      const entry = state.get(queryString)
      if (!entry)
        throw new Error(`no stubbed MediaQueryList for query: ${queryString}`)
      entry.matches = matches
      entry.listeners.forEach(listener => listener({ matches } as MediaQueryListEvent))
    },
    restore: () => spy.mockRestore(),
  }
}

const initialCases: Array<{ matches: Record<string, boolean>, expected: ContrastType }> = [
  { matches: { [QUERY_MORE]: true }, expected: 'more' },
  { matches: { [QUERY_LESS]: true }, expected: 'less' },
  { matches: { [QUERY_CUSTOM]: true }, expected: 'custom' },
  { matches: {}, expected: 'no-preference' },
]

it.each(initialCases)('usePreferredContrast resolves "$expected" from its initial media query state', async ({ matches, expected }) => {
  const stub = stubMatchMedia(matches)
  const { result } = await renderHook(() => usePreferredContrast())

  expect(result.current).toBe(expected)
  expect(stub.queries).toEqual(ALL_QUERIES)
  stub.restore()
})

it('usePreferredContrast flips on the media query change events', async () => {
  const stub = stubMatchMedia()
  const { result, act } = await renderHook(() => usePreferredContrast())

  expect(result.current).toBe('no-preference')

  await act(() => {
    stub.dispatchChange(QUERY_MORE, true)
  })
  await expect.poll(() => result.current).toBe('more')

  await act(() => {
    stub.dispatchChange(QUERY_MORE, false)
    stub.dispatchChange(QUERY_LESS, true)
  })
  await expect.poll(() => result.current).toBe('less')

  await act(() => {
    stub.dispatchChange(QUERY_LESS, false)
    stub.dispatchChange(QUERY_CUSTOM, true)
  })
  await expect.poll(() => result.current).toBe('custom')

  await act(() => {
    stub.dispatchChange(QUERY_CUSTOM, false)
  })
  await expect.poll(() => result.current).toBe('no-preference')

  stub.restore()
})

it('usePreferredContrast prefers "more" when several queries match', async () => {
  const stub = stubMatchMedia()
  const { result, act } = await renderHook(() => usePreferredContrast())

  expect(result.current).toBe('no-preference')

  await act(() => {
    stub.dispatchChange(QUERY_LESS, true)
    stub.dispatchChange(QUERY_CUSTOM, true)
  })
  await expect.poll(() => result.current).toBe('less')

  await act(() => {
    stub.dispatchChange(QUERY_MORE, true)
  })
  await expect.poll(() => result.current).toBe('more')

  await act(() => {
    stub.dispatchChange(QUERY_MORE, false)
  })
  await expect.poll(() => result.current).toBe('less')

  stub.restore()
})

it('usePreferredContrast removes all of its change listeners on unmount', async () => {
  const stub = stubMatchMedia()
  const { result, unmount } = await renderHook(() => usePreferredContrast())

  expect(result.current).toBe('no-preference')
  expect(stub.listenerCount()).toBe(3)

  unmount()
  expect(stub.listenerCount()).toBe(0)

  stub.dispatchChange(QUERY_MORE, true)
  stub.dispatchChange(QUERY_LESS, true)
  stub.dispatchChange(QUERY_CUSTOM, true)
  expect(result.current).toBe('no-preference')

  stub.restore()
})

it('usePreferredContrast falls back to "no-preference" when matchMedia is unavailable', async () => {
  const fakeWindow = {} as unknown as Window
  const { result } = await renderHook(() => usePreferredContrast({ window: fakeWindow }))

  expect(result.current).toBe('no-preference')
})

it('usePreferredContrast supports a custom window option', async () => {
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

  const { result, act } = await renderHook(() => usePreferredContrast({ window: fakeWindow }))

  expect(result.current).toBe('no-preference')
  expect(queries).toEqual(ALL_QUERIES)

  await act(() => {
    matches = true
    listeners.forEach(listener => listener({ matches } as MediaQueryListEvent))
  })
  await expect.poll(() => result.current).toBe('more')
})
