import { expect, it, vi } from 'vitest'
import { renderHook } from 'vitest-browser-react'
import { usePreferredDark } from './usePreferredDark'

type ChangeListener = (event: MediaQueryListEvent) => void

const QUERY = '(prefers-color-scheme: dark)'

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

it('usePreferredDark reflects a matching media query as true', async () => {
  const stub = stubMatchMedia(true)
  const { result } = await renderHook(() => usePreferredDark())

  expect(result.current).toBe(true)
  expect(stub.queries).toEqual([QUERY])
  stub.restore()
})

it('usePreferredDark defaults to false when the query does not match', async () => {
  const stub = stubMatchMedia(false)
  const { result } = await renderHook(() => usePreferredDark())

  expect(result.current).toBe(false)
  expect(stub.queries).toEqual([QUERY])
  stub.restore()
})

it('usePreferredDark flips on the media query change event', async () => {
  const stub = stubMatchMedia(false)
  const { result, act } = await renderHook(() => usePreferredDark())

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

it('usePreferredDark removes its change listener on unmount', async () => {
  const stub = stubMatchMedia(false)
  const { result, unmount } = await renderHook(() => usePreferredDark())

  expect(result.current).toBe(false)

  unmount()
  expect(stub.listenerCount()).toBe(0)

  stub.dispatchChange(true)
  expect(result.current).toBe(false)

  stub.restore()
})

it('usePreferredDark supports a custom window option', async () => {
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

  const { result, act } = await renderHook(() => usePreferredDark({ window: fakeWindow }))

  expect(result.current).toBe(false)
  expect(queries).toEqual([QUERY])

  await act(() => {
    matches = true
    listeners.forEach(listener => listener({ matches } as MediaQueryListEvent))
  })
  await expect.poll(() => result.current).toBe(true)
})
