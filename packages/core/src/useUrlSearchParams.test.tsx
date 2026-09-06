import type { UrlParams } from './useUrlSearchParams'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { renderHook } from 'vitest-browser-react'
import { useUrlSearchParams } from './useUrlSearchParams'

describe('useUrlSearchParams', () => {
  beforeEach(() => {
    // real chromium location/history in vitest browser mode — reset to a
    // clean URL (no search, no hash) so tests never interfere
    window.history.replaceState(null, '', window.location.pathname)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns the React tuple [params, setParams]', async () => {
    const { result } = await renderHook(() => useUrlSearchParams('history'))

    expect(result.current).toHaveLength(2)
    expect(result.current[0]).toEqual({})
    expect(typeof result.current[1]).toBe('function')
  })

  describe('history mode', () => {
    it('reads the initial params from the current URL', async () => {
      window.history.replaceState(null, '', '/?foo=bar')

      const { result } = await renderHook(() => useUrlSearchParams('history'))

      await expect.poll(() => result.current[0].foo).toBe('bar')
    })

    it('writes setParams back to the URL and re-renders', async () => {
      const { result, act } = await renderHook(() => useUrlSearchParams('history'))
      expect(result.current[0].foo).toBeUndefined()

      await act(() => {
        result.current[1]({ ...result.current[0], foo: 'bar' })
      })
      expect(window.location.search).toBe('?foo=bar')
      expect(result.current[0].foo).toBe('bar')

      await act(() => {
        result.current[1]({ ...result.current[0], vueuse: 'awesome' })
      })
      expect(window.location.search).toBe('?foo=bar&vueuse=awesome')
      expect(result.current[0].vueuse).toBe('awesome')
    })

    it('accepts an updater function form', async () => {
      const { result, act } = await renderHook(() => useUrlSearchParams('history'))

      await act(() => {
        result.current[1](prev => ({ ...prev, foo: 'bar' }))
      })
      expect(window.location.search).toBe('?foo=bar')

      // consecutive updater calls in one tick compose on the latest record
      await act(() => {
        result.current[1](prev => ({ ...prev, a: '1' }))
        result.current[1](prev => ({ ...prev, b: '2' }))
      })
      expect(window.location.search).toBe('?foo=bar&a=1&b=2')
    })

    it('uses replaceState by default', async () => {
      const pushStateSpy = vi.spyOn(window.history, 'pushState')
      const replaceStateSpy = vi.spyOn(window.history, 'replaceState')

      const { result, act } = await renderHook(() => useUrlSearchParams('history'))

      await act(() => {
        result.current[1]({ ...result.current[0], foo: 'bar' })
      })
      expect(replaceStateSpy).toHaveBeenCalledTimes(1)
      expect(replaceStateSpy).toHaveBeenCalledWith(window.history.state, document.title, '/?foo=bar')
      expect(pushStateSpy).not.toHaveBeenCalled()
    })

    it('pushes a history entry per mutation with writeMode push and syncs popstate without writing', async () => {
      const pushStateSpy = vi.spyOn(window.history, 'pushState')

      const { result, act } = await renderHook(() =>
        useUrlSearchParams('history', { writeMode: 'push' }),
      )

      await act(() => {
        result.current[1]({ ...result.current[0], foo: 'first' })
      })
      await act(() => {
        result.current[1]({ ...result.current[0], bar: 'second' })
      })
      expect(pushStateSpy).toHaveBeenCalledTimes(2)
      expect(pushStateSpy).toHaveBeenNthCalledWith(1, window.history.state, document.title, '/?foo=first')
      expect(pushStateSpy).toHaveBeenNthCalledWith(2, window.history.state, document.title, '/?foo=first&bar=second')
      expect(window.location.search).toBe('?foo=first&bar=second')

      // external back-navigation: state mirrors the URL, no history write
      window.history.replaceState(null, '', '/?foo=first')
      await act(() => {
        window.dispatchEvent(new PopStateEvent('popstate'))
      })
      expect(result.current[0].foo).toBe('first')
      expect(result.current[0].bar).toBeUndefined()
      expect(pushStateSpy).toHaveBeenCalledTimes(2)
    })

    it('syncs state on popstate for external navigation', async () => {
      const { result, act } = await renderHook(() => useUrlSearchParams('history'))
      expect(result.current[0].foo).toBeUndefined()

      window.history.pushState(null, '', '/?foo=bar')
      await act(() => {
        window.dispatchEvent(new PopStateEvent('popstate'))
      })
      expect(result.current[0].foo).toBe('bar')
      expect(window.location.search).toBe('?foo=bar')

      // repeated keys become arrays
      window.history.pushState(null, '', '/?foo=bar1&foo=bar2')
      await act(() => {
        window.dispatchEvent(new PopStateEvent('popstate'))
      })
      expect(result.current[0].foo).toEqual(['bar1', 'bar2'])

      // single empty values stay empty strings
      window.history.pushState(null, '', '/?foo=')
      await act(() => {
        window.dispatchEvent(new PopStateEvent('popstate'))
      })
      expect(result.current[0].foo).toBe('')

      // the sync itself never writes a new history entry
      const lengthBefore = window.history.length
      window.history.pushState(null, '', '/?foo=bar')
      await act(() => {
        window.dispatchEvent(new PopStateEvent('popstate'))
      })
      expect(window.history.length).toBe(lengthBefore + 1)
    })

    it('writes array values as repeated keys', async () => {
      const { result, act } = await renderHook(() => useUrlSearchParams('history'))

      await act(() => {
        result.current[1]({ ...result.current[0], foo: ['bar1', 'bar2'] })
      })
      expect(window.location.search).toBe('?foo=bar1&foo=bar2')
      expect(result.current[0].foo).toEqual(['bar1', 'bar2'])
    })

    it('removes params from the URL by omitting the key', async () => {
      window.history.replaceState(null, '', '/?foo=bar')
      const { result, act } = await renderHook(() => useUrlSearchParams('history'))
      await expect.poll(() => result.current[0].foo).toBe('bar')

      await act(() => {
        result.current[1]((prev) => {
          const next = { ...prev }
          delete next.foo
          return next
        })
      })
      expect(window.location.search).toBe('')
      expect(result.current[0].foo).toBeUndefined()
    })

    it('uses initialValue when the URL has no params and writes it back', async () => {
      const { result } = await renderHook(() =>
        useUrlSearchParams('history', { initialValue: { foo: 'bar' } }),
      )

      await expect.poll(() => result.current[0].foo).toBe('bar')
      await expect.poll(() => window.location.search).toBe('?foo=bar')
    })

    it('prefers URL params over initialValue', async () => {
      window.history.replaceState(null, '', '/?baz=qux')

      const { result } = await renderHook(() =>
        useUrlSearchParams<UrlParams>('history', { initialValue: { foo: 'bar' } }),
      )

      await expect.poll(() => result.current[0].baz).toBe('qux')
      expect(result.current[0].foo).toBeUndefined()
      expect(window.location.search).toBe('?baz=qux')
    })

    it('keeps nullish/falsy values in state but strips them from the URL', async () => {
      const { result, act } = await renderHook(() =>
        useUrlSearchParams<{ foo: string | null, bar: string | boolean }>('history', {
          removeNullishValues: true,
          removeFalsyValues: true,
          initialValue: { foo: 'bar', bar: 'foo' },
        }),
      )

      await act(() => {
        result.current[1]({ ...result.current[0], foo: null, bar: false })
      })
      expect(result.current[0]).toEqual({ foo: null, bar: false })
      expect(window.location.search).toBe('')
    })

    it('supports a custom stringify function', async () => {
      const { result, act } = await renderHook(() =>
        useUrlSearchParams('history', {
          stringify: params => params.toString().replace(/=(&|$)/g, '$1'),
        }),
      )

      await act(() => {
        result.current[1]({ ...result.current[0], foo: '', bar: '' })
      })
      expect(window.location.search).toBe('?foo&bar')
    })

    it('stops syncing external navigations with write false', async () => {
      const { result, act } = await renderHook(() =>
        useUrlSearchParams('history', { write: false }),
      )

      window.history.pushState(null, '', '/?foo=bar')
      await act(() => {
        window.dispatchEvent(new PopStateEvent('popstate'))
      })
      expect(result.current[0].foo).toBeUndefined()
      expect(window.location.search).toBe('?foo=bar')

      // state mutations still write back (upstream parity: the watcher is
      // not gated by `write`) — and since the external `foo` never entered
      // the state, the URL is rebuilt from state alone
      await act(() => {
        result.current[1]({ ...result.current[0], bar: 'baz' })
      })
      expect(window.location.search).toBe('?bar=baz')
    })

    it('returns initialValue without a window and never touches the URL', async () => {
      const { result } = await renderHook(() =>
        useUrlSearchParams('history', {
          initialValue: { foo: 'bar' },
          window: null as unknown as Window,
        }),
      )

      expect(result.current[0].foo).toBe('bar')
      expect(window.location.search).toBe('')
    })

    it('supports a generic params type', async () => {
      interface CustomUrlParams extends Record<string, any> {
        customFoo: number | undefined
      }

      const { result, act } = await renderHook(() =>
        useUrlSearchParams<CustomUrlParams>('history'),
      )

      await act(() => {
        result.current[1]({ ...result.current[0], customFoo: 42 })
      })
      expect(result.current[0].customFoo).toBe(42)
      expect(window.location.search).toBe('?customFoo=42')
    })

    it('removes its listeners on unmount', async () => {
      const { result, unmount } = await renderHook(() => useUrlSearchParams('history'))
      expect(result.current[0]).toEqual({})

      unmount()

      expect(() => {
        window.history.pushState(null, '', '/?after=unmount')
        window.dispatchEvent(new PopStateEvent('popstate'))
      }).not.toThrow()
      expect(result.current[0]).toEqual({})
      expect(window.location.search).toBe('?after=unmount')
    })
  })

  describe('hash mode', () => {
    it('reads params from the query inside the hash', async () => {
      window.history.replaceState(null, '', '/#/test/?foo=bar')

      const { result } = await renderHook(() => useUrlSearchParams('hash'))

      await expect.poll(() => result.current[0].foo).toBe('bar')
      expect(window.location.search).toBe('')
    })

    it('writes setParams back into the hash query', async () => {
      window.history.replaceState(null, '', '/#/test/?foo=bar')

      const { result, act } = await renderHook(() => useUrlSearchParams('hash'))
      await expect.poll(() => result.current[0].foo).toBe('bar')

      await act(() => {
        result.current[1]({ ...result.current[0], biz: 'biz' })
      })
      expect(window.location.hash).toBe('#/test/?foo=bar&biz=biz')
    })

    it('syncs state on hashchange for external navigation', async () => {
      const { result, act } = await renderHook(() => useUrlSearchParams('hash'))
      expect(result.current[0].foo).toBeUndefined()

      window.history.replaceState(null, '', '/#/test/?foo=bar')
      await act(() => {
        window.dispatchEvent(new HashChangeEvent('hashchange'))
      })
      expect(result.current[0].foo).toBe('bar')
    })

    it('handles a hash without params', async () => {
      window.history.replaceState(null, '', '/#/test/')

      const { result } = await renderHook(() => useUrlSearchParams('hash'))

      expect(result.current[0]).toEqual({})
    })
  })

  describe('hash-params mode', () => {
    it('reads params from the hash itself', async () => {
      window.history.replaceState(null, '', '/#foo=bar')

      const { result } = await renderHook(() => useUrlSearchParams('hash-params'))

      await expect.poll(() => result.current[0].foo).toBe('bar')
    })

    it('writes setParams back into the hash and preserves the search', async () => {
      window.history.replaceState(null, '', '/?q=1#foo=bar')

      const { result, act } = await renderHook(() => useUrlSearchParams('hash-params'))
      await expect.poll(() => result.current[0].foo).toBe('bar')

      await act(() => {
        result.current[1]({ ...result.current[0], biz: 'biz' })
      })
      expect(window.location.search).toBe('?q=1')
      expect(window.location.hash).toBe('#foo=bar&biz=biz')
    })

    it('syncs state on hashchange for external navigation', async () => {
      const { result, act } = await renderHook(() => useUrlSearchParams('hash-params'))

      window.history.replaceState(null, '', '/#foo=bar1&foo=bar2')
      await act(() => {
        window.dispatchEvent(new HashChangeEvent('hashchange'))
      })
      expect(result.current[0].foo).toEqual(['bar1', 'bar2'])
    })
  })
})
