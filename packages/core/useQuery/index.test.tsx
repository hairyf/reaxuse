import { beforeEach, describe, expect, expectTypeOf, it, vi } from 'vitest'
import { renderHook } from 'vitest-browser-react'
import { useQuery } from '../useQuery'

/**
 * Replace the current URL with `search` (e.g. `'?page=2'`, or `''` to drop
 * the query) without adding a history entry. `history.replaceState` does not
 * fire `popstate`, so a change made this way only becomes visible to the hook
 * together with the explicit event dispatched by `dispatchPopState`.
 */
function setUrlSearch(search: string) {
  const url = new URL(window.location.href)
  url.search = search
  window.history.replaceState(null, '', url.href)
}

/**
 * Replace the current URL with the given query entries (encoded properly)
 * without adding a history entry.
 */
function setUrlQuery(entries: Record<string, string | string[]>) {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(entries)) {
    if (Array.isArray(value))
      value.forEach(item => params.append(key, item))
    else
      params.set(key, value)
  }
  setUrlSearch(params.toString())
}

/**
 * Dispatch a real `popstate` like the browser does for a back/forward
 * traversal. Dispatching synchronously keeps the assertions deterministic.
 */
function dispatchPopState() {
  window.dispatchEvent(new PopStateEvent('popstate'))
}

describe('useQuery', () => {
  beforeEach(() => {
    setUrlSearch('')
  })

  it('should export', () => {
    expect(useQuery).toBeDefined()
  })

  it('should return current value', async () => {
    setUrlQuery({ search: 'vue3' })

    const { result } = await renderHook(() => useQuery('search'))

    expect(result.current[0]).toBe('vue3')
  })

  it('should return default value', async () => {
    const { result } = await renderHook(() => useQuery('page', '1'))

    expect(result.current[0]).toBe('1')
    expect(window.location.search).toBe('')
  })

  it('should return undefined when the key is absent and no default is given', async () => {
    const { result } = await renderHook(() => useQuery('lang'))

    expect(result.current[0]).toBeUndefined()
  })

  it('should return multiple values as an array', async () => {
    setUrlQuery({ tag: ['a', 'b'] })

    const { result } = await renderHook(() => useQuery('tag'))

    expect(result.current[0]).toEqual(['a', 'b'])
  })

  it('should return transformed value', async () => {
    setUrlQuery({ page: '1', perPage: '15' })

    const { result } = await renderHook(() =>
      useQuery('page', '1', { transform: Number }),
    )
    const perPage = await renderHook(() =>
      useQuery('perPage', '15', { transform: Number }),
    )

    expect(result.current[0]).toBe(1)
    expect(perPage.result.current[0]).toBe(15)
  })

  it('should handle transform get/set', async () => {
    setUrlQuery({ serialized: '{"foo":"bar"}' })

    const { result, act } = await renderHook(() =>
      useQuery('serialized', undefined, {
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

    expect(new URLSearchParams(window.location.search).get('serialized')).toBe('{"foo":"baz"}')
    expect(result.current[0]).toEqual({ foo: 'baz' })
  })

  it('should handle transform with only get', async () => {
    setUrlQuery({ search: 'VUE3' })

    const { result } = await renderHook(() =>
      useQuery('search', undefined, {
        transform: { get: (value: string) => value.toLowerCase() },
      }),
    )

    expect(result.current[0]).toBe('vue3')
    expect(new URLSearchParams(window.location.search).get('search')).toBe('VUE3')
  })

  it('should handle transform with only set', async () => {
    const { result, act } = await renderHook(() =>
      useQuery('search', undefined, {
        transform: { set: (value: string) => value.toLowerCase() },
      }),
    )

    expect(result.current[0]).toBeUndefined()

    await act(() => {
      result.current[1]('VUE3')
    })

    expect(result.current[0]).toBe('vue3')
    expect(new URLSearchParams(window.location.search).get('search')).toBe('vue3')
  })

  it('should re-evaluate the value immediately', async () => {
    setUrlQuery({ search: 'vue3' })

    const { result, act } = await renderHook(() => useQuery('code', 'foo'))

    // `code` is absent from the URL, so the default is exposed while the
    // `search` key keeps its URL value
    expect(result.current[0]).toBe('foo')

    await act(() => {
      result.current[1]('bar')
    })

    expect(result.current[0]).toBe('bar')
  })

  it('should update the URL and the state', async () => {
    const { result, act } = await renderHook(() => useQuery('code'))

    await act(() => {
      result.current[1]('bar')
    })

    expect(result.current[0]).toBe('bar')
    expect(window.location.search).toBe('?code=bar')
  })

  it('should remove the key when the value equals the default', async () => {
    setUrlQuery({ page: '2' })

    const { result, act } = await renderHook(() => useQuery('page', '1'))

    expect(result.current[0]).toBe('2')

    await act(() => {
      result.current[1]('1')
    })

    expect(result.current[0]).toBe('1')
    expect(window.location.search).toBe('')
  })

  it('should keep the other search params and the hash', async () => {
    setUrlQuery({ lang: 'en' })
    const url = new URL(window.location.href)
    url.hash = '#section'
    window.history.replaceState(null, '', url.href)

    const { result, act } = await renderHook(() => useQuery('lang', 'en'))

    await act(() => {
      result.current[1]('pt-BR')
    })

    expect(new URLSearchParams(window.location.search).get('lang')).toBe('pt-BR')
    expect(window.location.hash).toBe('#section')
  })

  it('should keep the other query params when writing one key', async () => {
    setUrlQuery({ lang: 'en' })

    const { result, act } = await renderHook(() => useQuery('code', 'foo'))

    await act(() => {
      result.current[1]('bar')
    })

    expect(window.location.search).toBe('?lang=en&code=bar')
    expect(result.current[0]).toBe('bar')
  })

  it('should change the value when the URL changes', async () => {
    const { result, act } = await renderHook(() => useQuery('page', '1'))

    expect(result.current[0]).toBe('1')

    await act(() => {
      setUrlQuery({ page: '2' })
      dispatchPopState()
    })

    expect(result.current[0]).toBe('2')
  })

  it('should write an array value back as repeated keys', async () => {
    const { result, act } = await renderHook(() => useQuery('tag', []))

    await act(() => {
      result.current[1](['a', 'b'])
    })

    expect(window.location.search).toBe('?tag=a&tag=b')
    expect(result.current[0]).toEqual(['a', 'b'])
  })

  describe('mode', () => {
    it('defaults to replace and does not grow the history', async () => {
      const historyLength = window.history.length

      const { result, act } = await renderHook(() => useQuery('page'))

      await act(() => {
        result.current[1]('2')
      })

      expect(window.location.search).toBe('?page=2')
      expect(window.history.length).toBe(historyLength)
    })

    it('pushes a history entry with mode: push, and back restores the previous query', async () => {
      setUrlQuery({ page: 'first' })

      const { result, act } = await renderHook(() => useQuery('page', undefined, { mode: 'push' }))

      expect(result.current[0]).toBe('first')

      await act(() => {
        result.current[1]('second')
      })

      expect(window.location.search).toBe('?page=second')

      await act(async () => {
        window.history.back()
        // the traversal is asynchronous: `popstate` lands on a later task
        await new Promise(resolve => setTimeout(resolve, 50))
      })

      expect(window.location.search).toBe('?page=first')
      expect(result.current[0]).toBe('first')
    })
  })

  describe('reactivity', () => {
    it('removes its listeners on unmount', async () => {
      const addSpy = vi.spyOn(window, 'addEventListener')
      const removeSpy = vi.spyOn(window, 'removeEventListener')

      const { unmount } = await renderHook(() => useQuery('page'))

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
    const { result } = await renderHook(() => useQuery('search'))

    expectTypeOf(result.current[0]).toEqualTypeOf<undefined | null | string | string[]>()
    expectTypeOf(result.current[1]).toEqualTypeOf<(value: undefined | null | string | string[]) => void>()
  })

  it('types: infers K from the transform', async () => {
    const { result } = await renderHook(() =>
      useQuery('page', '1', { transform: Number }),
    )

    expectTypeOf(result.current[0]).toEqualTypeOf<number>()
    expectTypeOf(result.current[1]).toEqualTypeOf<(value: number) => void>()
  })
})
