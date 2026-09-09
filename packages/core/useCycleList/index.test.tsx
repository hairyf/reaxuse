import type { Dispatch, SetStateAction } from 'react'
import type { UseCycleListReturn } from '../useCycleList'
import { describe, expect, expectTypeOf, it } from 'vitest'
import { renderHook } from 'vitest-browser-react'
import { useCycleList } from '../useCycleList'

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

  it('should work with a plain list and every control', async () => {
    const list = ['foo', 'bar', 'fooBar']

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

  describe('when list empty', () => {
    it('returns the correctly data', async () => {
      const { result, act } = await renderHook(() => useCycleList<string>([]))

      await act(() => result.current.setIndex(2))

      expect(result.current.state).toBeUndefined()
      expect(result.current.index).toBe(0)
    })
  })

  it('types: object return with every writable member paired with a setter', async () => {
    const { result } = await renderHook(() => useCycleList(['foo', 'bar']))

    // rule 5: two writable values (`state`, `index`) → object return with a
    // `Dispatch<SetStateAction<...>>` setter for each
    expectTypeOf(result.current).toEqualTypeOf<UseCycleListReturn<string>>()
    expectTypeOf(result.current.state).toEqualTypeOf<string>()
    expectTypeOf(result.current.setState).toEqualTypeOf<Dispatch<SetStateAction<string>>>()
    expectTypeOf(result.current.index).toEqualTypeOf<number>()
    expectTypeOf(result.current.setIndex).toEqualTypeOf<Dispatch<SetStateAction<number>>>()
    expectTypeOf(result.current.next).toEqualTypeOf<(n?: number) => string>()
    expectTypeOf(result.current.prev).toEqualTypeOf<(n?: number) => string>()
    expectTypeOf(result.current.go).toEqualTypeOf<(i: number) => string>()
  })
})
