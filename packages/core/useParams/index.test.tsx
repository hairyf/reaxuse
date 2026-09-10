import { beforeEach, describe, expect, expectTypeOf, it, vi } from 'vitest'
import { renderHook } from 'vitest-browser-react'
import { useParams } from '../useParams'

/**
 * Replace the current URL with the given pathname/search/hash (e.g.
 * `'/users/42'`, or `'/'` to reset) without adding a history entry.
 * `history.replaceState` does not fire `popstate`, so a change made this way
 * only becomes visible to the hook together with the explicit event
 * dispatched by `dispatchPopState`.
 */
function setUrl(path: string, search = '', hash = '') {
  const url = new URL(window.location.href)
  url.pathname = path
  url.search = search
  url.hash = hash
  window.history.replaceState(null, '', url.href)
}

/**
 * Dispatch a real `popstate` like the browser does for a back/forward
 * traversal. Dispatching synchronously keeps the assertions deterministic.
 */
function dispatchPopState() {
  window.dispatchEvent(new PopStateEvent('popstate'))
}

describe('useParams', () => {
  beforeEach(() => {
    setUrl('/')
  })

  it('should export', () => {
    expect(useParams).toBeDefined()
  })

  it('should return current value', async () => {
    setUrl('/users/42')

    const { result } = await renderHook(() =>
      useParams('userId', '', { pattern: '/users/:userId' }),
    )

    expect(result.current[0]).toBe('42')
  })

  it('should return default value when no pattern is given', async () => {
    setUrl('/users/42')

    const { result } = await renderHook(() => useParams('userId', 'guest'))

    expect(result.current[0]).toBe('guest')
  })

  it('should return default value when the pattern does not match', async () => {
    setUrl('/other/42')

    const { result } = await renderHook(() =>
      useParams('userId', 'guest', { pattern: '/users/:userId' }),
    )

    expect(result.current[0]).toBe('guest')
  })

  it('should return default value when the param is missing', async () => {
    setUrl('/users')

    const { result } = await renderHook(() =>
      useParams('userId', 'guest', { pattern: '/users/:userId' }),
    )

    expect(result.current[0]).toBe('guest')
  })

  it('should return default value for an empty capture', async () => {
    setUrl('/users/')

    const { result } = await renderHook(() =>
      useParams('userId', 'guest', { pattern: '/users/:userId' }),
    )

    expect(result.current[0]).toBe('guest')
  })

  it('should return multiple repeated captures as an array', async () => {
    setUrl('/tags/a/b')

    const { result } = await renderHook(() =>
      useParams('tag', '', { pattern: '/tags/:tag/:tag' }),
    )

    expect(result.current[0]).toEqual(['a', 'b'])
  })

  it('should return transformed value', async () => {
    setUrl('/posts/7')

    const { result } = await renderHook(() =>
      useParams('page', '1', { pattern: '/posts/:page', transform: Number }),
    )

    expect(result.current[0]).toBe(7)
  })

  it('should handle transform get/set', async () => {
    setUrl(`/items/${encodeURIComponent('{"foo":"bar"}')}`)

    const { result, act } = await renderHook(() =>
      useParams('item', undefined, {
        pattern: '/items/:item',
        transform: {
          get: (value: string) => JSON.parse(value) as { foo: string },
          set: (value: { foo: string }) => JSON.stringify(value),
        },
      }),
    )

    expect(result.current[0]).toEqual({ foo: 'bar' })

    await act(() => {
      result.current[1]({ foo: 'baz' })
    })

    expect(decodeURIComponent(window.location.pathname)).toBe('/items/{"foo":"baz"}')
    expect(result.current[0]).toEqual({ foo: 'baz' })
  })

  it('should handle transform with only get', async () => {
    setUrl('/users/VUE3')

    const { result } = await renderHook(() =>
      useParams('name', undefined, {
        pattern: '/users/:name',
        transform: { get: (value: string) => value.toLowerCase() },
      }),
    )

    expect(result.current[0]).toBe('vue3')
  })

  it('should handle transform with only set', async () => {
    setUrl('/users/alice')

    const { result, act } = await renderHook(() =>
      useParams('userId', '', {
        pattern: '/users/:userId',
        transform: { set: (value: string) => value.toLowerCase() },
      }),
    )

    expect(result.current[0]).toBe('alice')

    await act(() => {
      result.current[1]('BOB')
    })

    expect(result.current[0]).toBe('bob')
    expect(window.location.pathname).toBe('/users/bob')
  })

  it('should re-evaluate the value immediately', async () => {
    setUrl('/users/alice')

    const { result, act } = await renderHook(() =>
      useParams('userId', 'guest', { pattern: '/users/:userId' }),
    )

    // the capture is present, so the URL value wins over the default
    expect(result.current[0]).toBe('alice')

    await act(() => {
      result.current[1]('bob')
    })

    expect(result.current[0]).toBe('bob')
  })

  it('should update the URL and the state', async () => {
    setUrl('/users/alice')

    const { result, act } = await renderHook(() =>
      useParams('userId', '', { pattern: '/users/:userId' }),
    )

    await act(() => {
      result.current[1]('bob')
    })

    expect(result.current[0]).toBe('bob')
    expect(window.location.pathname).toBe('/users/bob')
  })

  it('should remove the param when the value equals the default', async () => {
    setUrl('/users/alice')

    const { result, act } = await renderHook(() =>
      useParams('userId', 'guest', { pattern: '/users/:userId' }),
    )

    expect(result.current[0]).toBe('alice')

    await act(() => {
      result.current[1]('guest')
    })

    expect(result.current[0]).toBe('guest')
    expect(window.location.pathname).toBe('/users/')
  })

  it('should remove the param when the value is null', async () => {
    setUrl('/users/alice')

    const { result, act } = await renderHook(() =>
      useParams<string | null>('userId', null, { pattern: '/users/:userId' }),
    )

    expect(result.current[0]).toBe('alice')

    await act(() => {
      result.current[1](null)
    })

    expect(result.current[0]).toBeNull()
    expect(window.location.pathname).toBe('/users/')
  })

  it('should keep the search and the hash when writing', async () => {
    setUrl('/users/alice', 'lang=en', '#section')

    const { result, act } = await renderHook(() =>
      useParams('userId', '', { pattern: '/users/:userId' }),
    )

    await act(() => {
      result.current[1]('bob')
    })

    expect(window.location.pathname).toBe('/users/bob')
    expect(window.location.search).toBe('?lang=en')
    expect(window.location.hash).toBe('#section')
  })

  it('should change the value when the URL changes', async () => {
    setUrl('/users/alice')

    const { result, act } = await renderHook(() =>
      useParams('userId', 'guest', { pattern: '/users/:userId' }),
    )

    expect(result.current[0]).toBe('alice')

    await act(() => {
      setUrl('/users/bob')
      dispatchPopState()
    })

    expect(result.current[0]).toBe('bob')
  })

  it('should not throw when setValue is called without a pattern', async () => {
    const { result, act } = await renderHook(() => useParams('userId', 'guest'))

    await act(() => {
      result.current[1]('42')
    })

    expect(result.current[0]).toBe('guest')
    expect(window.location.pathname).toBe('/')
  })

  describe('mode', () => {
    it('defaults to replace and does not grow the history', async () => {
      const historyLength = window.history.length

      const { result, act } = await renderHook(() =>
        useParams('userId', '', { pattern: '/users/:userId' }),
      )

      await act(() => {
        result.current[1]('42')
      })

      expect(window.location.pathname).toBe('/users/42')
      expect(window.history.length).toBe(historyLength)
    })

    it('pushes a history entry with mode: push, and back restores the previous path', async () => {
      setUrl('/users/first')

      const { result, act } = await renderHook(() =>
        useParams('userId', '', { pattern: '/users/:userId', mode: 'push' }),
      )

      expect(result.current[0]).toBe('first')

      await act(() => {
        result.current[1]('second')
      })

      expect(window.location.pathname).toBe('/users/second')

      await act(async () => {
        window.history.back()
        // the traversal is asynchronous: `popstate` lands on a later task
        await new Promise(resolve => setTimeout(resolve, 50))
      })

      expect(window.location.pathname).toBe('/users/first')
      expect(result.current[0]).toBe('first')
    })
  })

  describe('reactivity', () => {
    it('removes its listeners on unmount', async () => {
      const addSpy = vi.spyOn(window, 'addEventListener')
      const removeSpy = vi.spyOn(window, 'removeEventListener')

      const { unmount } = await renderHook(() =>
        useParams('userId', '', { pattern: '/users/:userId' }),
      )

      const added = addSpy.mock.calls.filter(
        call => String(call[0]) === 'popstate' || String(call[0]) === 'hashchange',
      )
      expect(added.length).toBeGreaterThanOrEqual(2)

      unmount()

      const removed = removeSpy.mock.calls.filter(
        call => String(call[0]) === 'popstate' || String(call[0]) === 'hashchange',
      )
      // every listener the hook registered is detached again, by reference
      for (const registration of added)
        expect(removed).toContainEqual(registration)

      addSpy.mockRestore()
      removeSpy.mockRestore()
    })
  })

  it('types: returns the plain [value, setValue] tuple', async () => {
    const { result } = await renderHook(() => useParams('id'))

    expectTypeOf(result.current[0]).toEqualTypeOf<null | string | string[]>()
    expectTypeOf(result.current[1]).toEqualTypeOf<(value: null | string | string[]) => void>()
  })

  it('types: infers K from the transform', async () => {
    const { result } = await renderHook(() =>
      useParams('page', '1', { pattern: '/posts/:page', transform: Number }),
    )

    expectTypeOf(result.current[0]).toEqualTypeOf<number>()
    expectTypeOf(result.current[1]).toEqualTypeOf<(value: number) => void>()
  })
})
