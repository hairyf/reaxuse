import type { Mock } from 'vitest'
import type { UseMemoizeCache } from './useMemoize'
import { useState } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, renderHook } from 'vitest-browser-react'
import { useMemoize } from './useMemoize'

describe('useMemoize', () => {
  const resolver = vi.fn()

  beforeEach(() => {
    resolver.mockReset()
    resolver.mockImplementation((arg1: number) => `result-${arg1}`)
  })

  it('should be defined', () => {
    expect(useMemoize).toBeDefined()
  })

  describe('get', () => {
    it('should load and cache data on get', async () => {
      const { result } = await renderHook(() => useMemoize(resolver))

      expect(result.current(1)).toBe('result-1')
      expect(resolver).toHaveBeenCalledTimes(1)
      expect(resolver).toHaveBeenCalledWith(1)

      resolver.mockClear()
      expect(result.current(1)).toBe('result-1')
      expect(resolver).not.toHaveBeenCalled()
    })

    it('should load and cache data with different keys', async () => {
      const { result } = await renderHook(() => useMemoize(resolver))

      expect(result.current(1)).toBe('result-1')
      expect(result.current(2)).toBe('result-2')

      expect(resolver).toHaveBeenCalledTimes(2)
      expect(resolver).toHaveBeenNthCalledWith(1, 1)
      expect(resolver).toHaveBeenNthCalledWith(2, 2)

      resolver.mockClear()
      expect(result.current(1)).toBe('result-1')
      expect(result.current(2)).toBe('result-2')
      expect(resolver).not.toHaveBeenCalled()
    })

    it('should cache without arguments', async () => {
      const _resolver = vi.fn(() => 'result')
      const { result } = await renderHook(() => useMemoize(_resolver))

      expect(result.current()).toBe('result')
      expect(result.current()).toBe('result')
      expect(_resolver).toHaveBeenCalledTimes(1)
    })

    it('should cache with multiple arguments', async () => {
      const _resolver = vi.fn((arg1: number, arg2: number) => `result-${arg1}-${arg2}`)
      const { result } = await renderHook(() => useMemoize(_resolver))

      expect(result.current(1, 1)).toBe('result-1-1')
      expect(result.current(1, 2)).toBe('result-1-2')
      expect(_resolver).toHaveBeenCalledTimes(2)
      expect(_resolver).toHaveBeenNthCalledWith(1, 1, 1)
      expect(_resolver).toHaveBeenNthCalledWith(2, 1, 2)

      _resolver.mockClear()
      expect(result.current(1, 1)).toBe('result-1-1')
      expect(result.current(1, 2)).toBe('result-1-2')
      expect(_resolver).not.toHaveBeenCalled()
    })
  })

  describe('load', () => {
    it('should always call resolver on load', async () => {
      const { result } = await renderHook(() => useMemoize(resolver))

      expect(result.current(1)).toBe('result-1')
      expect(result.current.load(1)).toBe('result-1')
      expect(resolver).toHaveBeenCalledTimes(2)
      expect(resolver).toHaveBeenNthCalledWith(1, 1)
      expect(resolver).toHaveBeenNthCalledWith(2, 1)

      resolver.mockClear()
      expect(result.current(1)).toBe('result-1')
      expect(resolver).not.toHaveBeenCalled()
    })

    // upstream wraps `memo(1)` in a `computed` and asserts the load updates
    // it reactively — React has no reactivity, so the equivalent is a
    // component reading the memoized value and re-rendering after `load`
    it('should update previous get results after load', async () => {
      function LoadDemo() {
        const [tick, setTick] = useState(0)
        const memo = useMemoize(resolver)
        return (
          <div>
            <p>
              value-
              {memo(1)}
            </p>
            <button
              onClick={() => {
                memo.load(1)
                setTick(tick + 1)
              }}
            >
              Load
            </button>
          </div>
        )
      }

      const screen = await render(<LoadDemo />)
      await expect.element(screen.getByText('value-result-1')).toBeVisible()
      expect(resolver).toHaveBeenCalledTimes(1)

      resolver.mockReset()
      resolver.mockImplementation((arg1: number) => `new-result-${arg1}`)

      // still served from cache until load() runs
      await expect.element(screen.getByText('value-result-1')).toBeVisible()
      expect(resolver).not.toHaveBeenCalled()

      await screen.getByRole('button', { name: 'Load' }).click()
      expect(resolver).toHaveBeenCalledTimes(1)

      // the re-render picks up the freshly loaded value
      await expect.element(screen.getByText('value-new-result-1')).toBeVisible()
    })
  })

  describe('delete', () => {
    it('should delete key from cache', async () => {
      const { result } = await renderHook(() => useMemoize(resolver))

      expect(result.current(1)).toBe('result-1')
      expect(result.current(2)).toBe('result-2')
      expect(resolver).toHaveBeenCalledTimes(2)

      resolver.mockClear()
      result.current.delete(1)

      expect(result.current(1)).toBe('result-1')
      expect(resolver).toHaveBeenCalledTimes(1)
      expect(resolver).toHaveBeenNthCalledWith(1, 1)

      resolver.mockClear()
      expect(result.current(2)).toBe('result-2')
      expect(resolver).not.toHaveBeenCalled()
    })
  })

  describe('clear', () => {
    it('should clear all keys from cache', async () => {
      const { result } = await renderHook(() => useMemoize(resolver))

      expect(result.current(1)).toBe('result-1')
      expect(result.current(2)).toBe('result-2')
      expect(resolver).toHaveBeenCalledTimes(2)

      resolver.mockClear()
      result.current.clear()

      expect(result.current(1)).toBe('result-1')
      expect(result.current(2)).toBe('result-2')
      expect(resolver).toHaveBeenCalledTimes(2)
      expect(resolver).toHaveBeenNthCalledWith(1, 1)
      expect(resolver).toHaveBeenNthCalledWith(2, 2)
    })
  })

  describe('options', () => {
    describe('getKey', () => {
      it('should use custom key', async () => {
        const getKey = vi.fn((arg1: number) => arg1 % 2) as any
        const { result } = await renderHook(() => useMemoize(resolver, { getKey }))

        expect(result.current(1)).toBe('result-1')
        expect(result.current(2)).toBe('result-2')
        expect(resolver).toHaveBeenCalledTimes(2)
        expect(resolver).toHaveBeenNthCalledWith(1, 1)
        expect(resolver).toHaveBeenNthCalledWith(2, 2)

        resolver.mockClear()
        expect(result.current(3)).toBe('result-1')
        expect(result.current('4')).toBe('result-2')
        expect(resolver).not.toHaveBeenCalled()
      })
    })

    describe('cache', () => {
      let cache: UseMemoizeCache<string, string>
      const serializedKey = JSON.stringify([1])

      beforeEach(() => {
        cache = {
          get: vi.fn(key => key),
          set: vi.fn(),
          has: vi.fn(() => true),
          delete: vi.fn(),
          clear: vi.fn(),
        }
      })

      it('should use given cache on get', async () => {
        const { result } = await renderHook(() => useMemoize(resolver, { cache }))

        expect(result.current(1)).toBe(serializedKey)
        expect(cache.get).toHaveBeenCalledTimes(1)
        expect(cache.get).toHaveBeenCalledWith(serializedKey)
        expect(cache.has).toHaveBeenCalledTimes(1)
        expect(cache.has).toHaveBeenCalledWith(serializedKey)

        expect(cache.set).not.toHaveBeenCalled()
      })

      it('should use given cache on get without cache', async () => {
        const { result } = await renderHook(() => useMemoize(resolver, { cache }))
        ;(cache.has as Mock).mockReturnValue(false)

        expect(result.current(1)).toBe(serializedKey)
        expect(cache.has).toHaveBeenCalledTimes(1)
        expect(cache.has).toHaveBeenCalledWith(serializedKey)
        expect(cache.set).toHaveBeenCalledTimes(1)
        expect(cache.set).toHaveBeenCalledWith(serializedKey, 'result-1')
        expect(cache.get).toHaveBeenCalledTimes(1)
        expect(cache.get).toHaveBeenCalledWith(serializedKey)
      })

      it('should use given cache on load', async () => {
        const { result } = await renderHook(() => useMemoize(resolver, { cache }))

        expect(result.current.load(1)).toBe(serializedKey)
        expect(cache.set).toHaveBeenCalledTimes(1)
        expect(cache.set).toHaveBeenCalledWith(serializedKey, 'result-1')
        expect(cache.get).toHaveBeenCalledTimes(1)
        expect(cache.get).toHaveBeenCalledWith(serializedKey)
      })

      it('should use given cache on delete', async () => {
        const { result } = await renderHook(() => useMemoize(resolver, { cache }))

        result.current.delete(1)
        expect(cache.delete).toHaveBeenCalledTimes(1)
        expect(cache.delete).toHaveBeenCalledWith(serializedKey)
      })

      it('should use given cache on clear', async () => {
        const { result } = await renderHook(() => useMemoize(resolver, { cache }))

        result.current.clear()
        expect(cache.clear).toHaveBeenCalledTimes(1)
      })
    })
  })
})
