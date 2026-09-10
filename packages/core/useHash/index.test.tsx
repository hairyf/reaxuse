import type { UseHashReturn } from '../useHash'
import { beforeEach, describe, expect, expectTypeOf, it, vi } from 'vitest'
import { renderHook } from 'vitest-browser-react'
import { useHash } from '../useHash'

/**
 * Replace the current URL with `hash` (e.g. `'#header'`, or `''` to drop the
 * fragment) without adding a history entry. `history.replaceState` does not
 * fire `hashchange`, so a change made this way only becomes visible to the
 * hook together with the explicit event dispatched by `dispatchHashChange`.
 */
function setUrlHash(hash: string) {
  const url = new URL(window.location.href)
  url.hash = hash
  window.history.replaceState(null, '', url.href)
}

/**
 * Dispatch a real `hashchange` like the browser does for a manual hash edit.
 * Dispatching synchronously keeps the assertions deterministic.
 */
function dispatchHashChange() {
  window.dispatchEvent(new HashChangeEvent('hashchange'))
}

describe('useHash', () => {
  beforeEach(() => {
    setUrlHash('')
  })

  it('should export', () => {
    expect(useHash).toBeDefined()
  })

  it('should return current value', async () => {
    setUrlHash('#header')

    const { result } = await renderHook(() => useHash())

    expect(result.current[0]).toBe('#header')
  })

  it('should re-evaluate the value immediately', async () => {
    setUrlHash('#header')

    const { result, act } = await renderHook(() => useHash())

    await act(() => {
      result.current[1]('footer')
    })

    expect(result.current[0]).toBe('#footer')
  })

  it('should update the location', async () => {
    setUrlHash('#foo')

    const { result, act } = await renderHook(() => useHash())

    await act(() => {
      result.current[1]('footer')
    })

    expect(result.current[0]).toBe('#footer')
    expect(window.location.hash).toBe('#footer')
  })

  it('should return default value', async () => {
    const { result } = await renderHook(() => useHash('baz'))

    expect(result.current[0]).toBe('baz')
    expect(window.location.hash).toBe('')
  })

  it('should change the value when the location changes', async () => {
    const { result, act } = await renderHook(() => useHash('baz'))

    expect(result.current[0]).toBe('baz')

    await act(() => {
      setUrlHash('#foo')
      dispatchHashChange()
    })

    expect(result.current[0]).toBe('#foo')
  })

  it('should fall back to the default value when the location hash is cleared', async () => {
    setUrlHash('#foo')

    const { result, act } = await renderHook(() => useHash('baz'))

    expect(result.current[0]).toBe('#foo')

    await act(() => {
      setUrlHash('')
      dispatchHashChange()
    })

    expect(result.current[0]).toBe('baz')
  })

  it('should trigger effects only once', async () => {
    const onUpdate = vi.fn()

    const { result, act } = await renderHook(() => {
      const [hash, setHash] = useHash('baz')
      onUpdate(hash)
      return [hash, setHash] as UseHashReturn
    })

    const rendersAtMount = onUpdate.mock.calls.length

    await act(() => {
      result.current[1]('foo')
    })

    expect(result.current[0]).toBe('#foo')
    expect(window.location.hash).toBe('#foo')
    // one write commits exactly one update: `replaceState` does not fire
    // `hashchange`, so the write never bounces through an extra event-driven
    // commit (upstream: the value settles once instead of re-triggering the
    // route watcher)
    expect(onUpdate.mock.calls.length).toBe(rendersAtMount + 1)
    expect(onUpdate).toHaveBeenLastCalledWith('#foo')

    // writing the same value again is a no-op — no extra render, no extra
    // history entry
    const rendersAfterWrite = onUpdate.mock.calls.length
    await act(() => {
      result.current[1]('foo')
    })
    expect(onUpdate.mock.calls.length).toBe(rendersAfterWrite)
  })

  it('re-render with a new defaultValue updates the exposed value while the hash is empty', async () => {
    const { result, rerender } = await renderHook(
      (props?: { defaultValue?: string }) => useHash(props?.defaultValue),
      { initialProps: { defaultValue: 'foo' } },
    )

    expect(result.current[0]).toBe('foo')

    await rerender({ defaultValue: 'bar' })

    expect(result.current[0]).toBe('bar')
    expect(window.location.hash).toBe('')
  })

  describe('hash normalisation', () => {
    it('setHash without a leading # writes a #-prefixed hash', async () => {
      const { result, act } = await renderHook(() => useHash())

      await act(() => {
        result.current[1]('foobar')
      })

      expect(result.current[0]).toBe('#foobar')
      expect(window.location.hash).toBe('#foobar')
    })

    it('setHash with a leading # does not double the prefix', async () => {
      const { result, act } = await renderHook(() => useHash())

      await act(() => {
        result.current[1]('#foobar')
      })

      expect(result.current[0]).toBe('#foobar')
      expect(window.location.hash).toBe('#foobar')
    })

    it('setHash with an empty string clears the hash and falls back to the default', async () => {
      setUrlHash('#foo')

      const { result, act } = await renderHook(() => useHash('baz'))

      expect(result.current[0]).toBe('#foo')

      await act(() => {
        result.current[1]('')
      })

      expect(result.current[0]).toBe('baz')
      expect(window.location.hash).toBe('')
    })

    it('setHash with a bare # clears the hash as well', async () => {
      setUrlHash('#foo')

      const { result, act } = await renderHook(() => useHash())

      await act(() => {
        result.current[1]('#')
      })

      expect(result.current[0]).toBe('')
      expect(window.location.hash).toBe('')
    })

    it('exposes an empty string when the hash is empty and no default is given', async () => {
      const { result } = await renderHook(() => useHash())

      expect(result.current[0]).toBe('')
    })

    it('keeps the rest of the URL untouched', async () => {
      const { result, act } = await renderHook(() => useHash())

      const { pathname, search } = window.location

      await act(() => {
        result.current[1]('foo')
      })

      expect(window.location.pathname).toBe(pathname)
      expect(window.location.search).toBe(search)
    })
  })

  describe('mode', () => {
    it('defaults to replace and does not grow the history', async () => {
      const historyLength = window.history.length

      const { result, act } = await renderHook(() => useHash())

      await act(() => {
        result.current[1]('foo')
      })

      expect(window.location.hash).toBe('#foo')
      expect(window.history.length).toBe(historyLength)
    })

    it('pushes a history entry with mode: push, and back restores the previous hash', async () => {
      setUrlHash('#first')

      const { result, act } = await renderHook(() => useHash(undefined, { mode: 'push' }))

      expect(result.current[0]).toBe('#first')

      await act(() => {
        result.current[1]('second')
      })

      expect(window.location.hash).toBe('#second')

      await act(async () => {
        window.history.back()
        // the traversal is asynchronous: `popstate` lands on a later task
        await new Promise(resolve => setTimeout(resolve, 50))
      })

      expect(window.location.hash).toBe('#first')
      expect(result.current[0]).toBe('#first')
    })
  })

  describe('reactivity', () => {
    it('reacts to the real asynchronous hashchange event', async () => {
      const { result, act } = await renderHook(() => useHash())

      await act(async () => {
        // a direct `location.hash` assignment fires a real `hashchange`
        window.location.hash = '#async'
        await new Promise(resolve => setTimeout(resolve, 50))
      })

      expect(result.current[0]).toBe('#async')
    })

    it('removes its listeners on unmount', async () => {
      const addSpy = vi.spyOn(window, 'addEventListener')
      const removeSpy = vi.spyOn(window, 'removeEventListener')

      const { unmount } = await renderHook(() => useHash())

      const added = addSpy.mock.calls.filter(
        call => String(call[0]) === 'hashchange' || String(call[0]) === 'popstate',
      )
      expect(added.length).toBeGreaterThanOrEqual(2)

      unmount()

      const removed = removeSpy.mock.calls.filter(
        call => String(call[0]) === 'hashchange' || String(call[0]) === 'popstate',
      )
      // every listener the hook registered is detached again, by reference
      for (const registration of added)
        expect(removed).toContainEqual(registration)

      addSpy.mockRestore()
      removeSpy.mockRestore()
    })
  })

  it('types: returns a writable [hash, setHash] tuple', async () => {
    const { result } = await renderHook(() => useHash())

    expectTypeOf(result.current).toEqualTypeOf<UseHashReturn>()
    expectTypeOf(result.current[0]).toEqualTypeOf<string>()
    expectTypeOf(result.current[1]).toEqualTypeOf<(value: string) => void>()
  })
})
