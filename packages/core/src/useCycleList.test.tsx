import { describe, expect, it } from 'vitest'
import { renderHook } from 'vitest-browser-react'
import { useCycleList } from './useCycleList'

describe('useCycleList', () => {
  it('should work with array', async () => {
    const { result, act } = await renderHook(() => useCycleList(['foo', 'bar', 'fooBar']))

    expect(result.current.state).toBe('foo')
    expect(result.current.index).toBe(0)

    await act(() => result.current.next())

    expect(result.current.state).toBe('bar')
    expect(result.current.index).toBe(1)

    await act(() => result.current.prev())

    expect(result.current.state).toBe('foo')
    expect(result.current.index).toBe(0)

    await act(() => result.current.setIndex(2))

    expect(result.current.state).toBe('fooBar')
    expect(result.current.index).toBe(2)

    await act(() => result.current.setState('foo'))

    expect(result.current.state).toBe('foo')
    expect(result.current.index).toBe(0)
  })

  it('should work with ref', async () => {
    const list = { current: ['foo', 'bar', 'fooBar'] }

    const { result, act } = await renderHook(() => useCycleList(list))

    expect(result.current.state).toBe('foo')
    expect(result.current.index).toBe(0)

    await act(() => result.current.next())

    expect(result.current.state).toBe('bar')
    expect(result.current.index).toBe(1)

    await act(() => result.current.prev())

    expect(result.current.state).toBe('foo')
    expect(result.current.index).toBe(0)

    await act(() => result.current.setIndex(2))

    expect(result.current.state).toBe('fooBar')
    expect(result.current.index).toBe(2)

    await act(() => result.current.setState('foo'))

    expect(result.current.state).toBe('foo')
    expect(result.current.index).toBe(0)

    await act(() => result.current.go(1))

    expect(result.current.state).toBe('bar')
    expect(result.current.index).toBe(1)

    await act(() => result.current.go(-1))

    expect(result.current.state).toBe('fooBar')
    expect(result.current.index).toBe(2)
  })

  it('should work with a plain list', async () => {
    const { result, act } = await renderHook(() => useCycleList(['foo', 'bar', 'fooBar']))

    expect(result.current.state).toBe('foo')
    expect(result.current.index).toBe(0)

    await act(() => result.current.next())

    expect(result.current.state).toBe('bar')
    expect(result.current.index).toBe(1)

    await act(() => result.current.prev())

    expect(result.current.state).toBe('foo')
    expect(result.current.index).toBe(0)
  })

  describe('when list empty', () => {
    it('returns the correctly data', async () => {
      const list = { current: ['foo', 'bar', 'fooBar'] }

      const { result, act } = await renderHook(() => useCycleList(list))

      list.current = []
      await act(() => result.current.setIndex(2))

      expect(result.current.state).toBeUndefined()
      expect(result.current.index).toBe(0)
    })
  })
})
