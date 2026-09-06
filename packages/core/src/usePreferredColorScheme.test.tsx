import { expect, it, vi } from 'vitest'
import { renderHook } from 'vitest-browser-react'
import { usePreferredColorScheme } from './usePreferredColorScheme'

type ChangeListener = (event: MediaQueryListEvent) => void

const LIGHT_QUERY = '(prefers-color-scheme: light)'
const DARK_QUERY = '(prefers-color-scheme: dark)'

/**
 * Deterministic `window.matchMedia` stub: one fake MediaQueryList per
 * query string, each with a `matches` flag, a change-listener registry and
 * a dispatchable change event — mirroring the real
 * `addEventListener('change', ...)` semantics the hook relies on.
 */
function stubMatchMedia(initialMatches: Record<string, boolean> = {}) {
  const queries: string[] = []
  const fakes = new Map<string, { matches: boolean, listeners: Set<ChangeListener> }>()

  const getFake = (queryString: string) => {
    let fake = fakes.get(queryString)
    if (!fake) {
      fake = { matches: initialMatches[queryString] ?? false, listeners: new Set() }
      fakes.set(queryString, fake)
    }
    return fake
  }

  const spy = vi.spyOn(window, 'matchMedia').mockImplementation((queryString: string) => {
    queries.push(queryString)
    const fake = getFake(queryString)
    return {
      matches: fake.matches,
      addEventListener: (type: string, listener: ChangeListener) => {
        if (type === 'change')
          fake.listeners.add(listener)
      },
      removeEventListener: (type: string, listener: ChangeListener) => {
        fake.listeners.delete(listener)
      },
    } as unknown as MediaQueryList
  })

  return {
    queries,
    listenerCount: (queryString: string) => fakes.get(queryString)?.listeners.size ?? 0,
    dispatchChange: (queryString: string, matches: boolean) => {
      const fake = getFake(queryString)
      fake.matches = matches
      fake.listeners.forEach(listener => listener({ matches } as MediaQueryListEvent))
    },
    restore: () => spy.mockRestore(),
  }
}

it('usePreferredColorScheme reflects a matching dark query as "dark"', async () => {
  const stub = stubMatchMedia({ [DARK_QUERY]: true })
  const { result } = await renderHook(() => usePreferredColorScheme())

  expect(result.current).toBe('dark')
  expect(stub.queries).toEqual([LIGHT_QUERY, DARK_QUERY])
  stub.restore()
})

it('usePreferredColorScheme reflects a matching light query as "light"', async () => {
  const stub = stubMatchMedia({ [LIGHT_QUERY]: true })
  const { result } = await renderHook(() => usePreferredColorScheme())

  expect(result.current).toBe('light')
  expect(stub.queries).toEqual([LIGHT_QUERY, DARK_QUERY])
  stub.restore()
})

it('usePreferredColorScheme defaults to "no-preference" when no query matches', async () => {
  const stub = stubMatchMedia()
  const { result } = await renderHook(() => usePreferredColorScheme())

  expect(result.current).toBe('no-preference')
  stub.restore()
})

it('usePreferredColorScheme prefers "dark" when both queries match', async () => {
  const stub = stubMatchMedia({ [LIGHT_QUERY]: true, [DARK_QUERY]: true })
  const { result } = await renderHook(() => usePreferredColorScheme())

  expect(result.current).toBe('dark')
  stub.restore()
})

it('usePreferredColorScheme flips on the media query change events', async () => {
  const stub = stubMatchMedia()
  const { result, act } = await renderHook(() => usePreferredColorScheme())

  expect(result.current).toBe('no-preference')

  await act(() => {
    stub.dispatchChange(DARK_QUERY, true)
  })
  await expect.poll(() => result.current).toBe('dark')

  await act(() => {
    stub.dispatchChange(DARK_QUERY, false)
  })
  await expect.poll(() => result.current).toBe('no-preference')

  await act(() => {
    stub.dispatchChange(LIGHT_QUERY, true)
  })
  await expect.poll(() => result.current).toBe('light')

  await act(() => {
    // dark re-takes priority while light is still on
    stub.dispatchChange(DARK_QUERY, true)
  })
  await expect.poll(() => result.current).toBe('dark')

  await act(() => {
    stub.dispatchChange(DARK_QUERY, false)
  })
  await expect.poll(() => result.current).toBe('light')

  await act(() => {
    stub.dispatchChange(LIGHT_QUERY, false)
  })
  await expect.poll(() => result.current).toBe('no-preference')

  stub.restore()
})

it('usePreferredColorScheme removes all of its change listeners on unmount', async () => {
  const stub = stubMatchMedia()
  const { result, unmount } = await renderHook(() => usePreferredColorScheme())

  expect(result.current).toBe('no-preference')

  unmount()
  expect(stub.listenerCount(LIGHT_QUERY)).toBe(0)
  expect(stub.listenerCount(DARK_QUERY)).toBe(0)

  stub.dispatchChange(DARK_QUERY, true)
  stub.dispatchChange(LIGHT_QUERY, true)
  expect(result.current).toBe('no-preference')

  stub.restore()
})

it('usePreferredColorScheme falls back to "no-preference" when matchMedia is not a function', async () => {
  const brokenWindow = { matchMedia: 'not a function' } as unknown as Window

  const { result } = await renderHook(() => usePreferredColorScheme({ window: brokenWindow }))

  expect(result.current).toBe('no-preference')
})

it('usePreferredColorScheme supports a custom window option', async () => {
  const queries: string[] = []
  const listeners = new Map<string, ChangeListener[]>()
  const matchesMap = new Map<string, boolean>()
  const fakeWindow = {
    matchMedia: (queryString: string) => {
      queries.push(queryString)
      if (!listeners.has(queryString)) {
        listeners.set(queryString, [])
        matchesMap.set(queryString, false)
      }
      return {
        get matches() {
          return matchesMap.get(queryString)
        },
        addEventListener: (type: string, listener: ChangeListener) => {
          if (type === 'change')
            listeners.get(queryString)!.push(listener)
        },
        removeEventListener: () => {},
      } as unknown as MediaQueryList
    },
  } as unknown as Window

  const { result, act, unmount } = await renderHook(() => usePreferredColorScheme({ window: fakeWindow }))

  expect(result.current).toBe('no-preference')
  expect(queries).toEqual([LIGHT_QUERY, DARK_QUERY])

  await act(() => {
    matchesMap.set(DARK_QUERY, true)
    listeners.get(DARK_QUERY)!.forEach(listener => listener({ matches: true } as MediaQueryListEvent))
  })
  await expect.poll(() => result.current).toBe('dark')

  unmount()
})
