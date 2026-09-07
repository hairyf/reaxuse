import { describe, expect, expectTypeOf, it } from 'vitest'
import { renderHook } from 'vitest-browser-react'
import { useCloned } from './useCloned'

describe('useCloned', () => {
  it('works with simple objects', async () => {
    const data = { test: 'test' }

    const { result, act } = await renderHook(() => useCloned(data))

    expect(result.current.cloned).toEqual(data)

    result.current.cloned.test = 'failed'

    await act(() => {
      result.current.sync()
    })

    expect(result.current.cloned).toEqual(data)
  })

  it('works with refs', async () => {
    const data = { current: { test: 'test' } }

    const { result, rerender } = await renderHook(() => useCloned(data))

    data.current.test = 'success'
    await rerender()

    expect(result.current.cloned).toEqual(data.current)
  })

  it('works with getter function', async () => {
    const data = { current: { test: 'test' } }

    const { result, rerender } = await renderHook(() => useCloned(() => data.current))

    data.current.test = 'success'
    await rerender()

    expect(result.current.cloned).toEqual(data.current)
  })

  it('works with refs and manual sync', async () => {
    const data = { current: { test: 'test' } }

    const { result, act } = await renderHook(() => useCloned(data, { manual: true }))

    data.current.test = 'success'

    expect(result.current.cloned).not.toEqual(data.current)

    await act(() => {
      result.current.sync()
    })

    expect(result.current.cloned).toEqual(data.current)
  })

  it('works with custom clone function', async () => {
    const data: { current: Record<string, any> } = { current: { test: 'test' } }

    const { result, rerender } = await renderHook(() => useCloned(data, {
      clone: source => ({ ...source, proxyTest: true }),
    }))

    data.current.test = 'partial'
    await rerender()

    expect(result.current.cloned.test).toBe('partial')
    expect(result.current.cloned.proxyTest).toBe(true)
  })

  it('infers source type in custom clone function', async () => {
    const data = { current: { test: 'test' } }

    await renderHook(() => useCloned(data, {
      clone: (source) => {
        expectTypeOf(source).toEqualTypeOf<{ test: string }>()
        return source
      },
    }))
  })

  it('works with watch options', async () => {
    const data = { current: { test: 'test' } }

    const { result, rerender } = await renderHook(() => useCloned(data, { immediate: false, deep: false }))

    // test immediate: false
    expect(result.current.cloned).toEqual({})

    data.current.test = 'not valid'
    await rerender()

    // test deep: false
    expect(result.current.cloned).toEqual({})

    data.current = { test: 'valid' }
    await rerender()

    expect(result.current.cloned).toEqual(data.current)
  })

  it('works with use isModified', async () => {
    const data = { current: { test: 'test' } }

    const { result, rerender, act } = await renderHook(() => useCloned(data))

    expect(result.current.isModified).toEqual(false)

    result.current.cloned.test = 'vitest'
    await rerender()

    expect(result.current.isModified).toEqual(true)

    await act(() => {
      result.current.sync()
    })

    expect(result.current.isModified).toEqual(false)
  })
})
