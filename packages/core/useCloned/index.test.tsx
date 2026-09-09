import { useState } from 'react'
import { describe, expect, expectTypeOf, it } from 'vitest'
import { renderHook } from 'vitest-browser-react'
import { useCloned } from '../useCloned'

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
    const data = { value: { test: 'test' } }

    const { result, rerender } = await renderHook(() => useCloned(() => data.value))

    data.value.test = 'success'
    await rerender()

    expect(result.current.cloned).toEqual(data.value)
  })

  it('works with a state tuple source', async () => {
    const { result, rerender, act } = await renderHook(() => {
      const [value, setValue] = useState({ test: 'test' })
      return { ...useCloned([value, setValue]), setValue }
    })

    expect(result.current.cloned).toEqual({ test: 'test' })

    await act(() => {
      result.current.setValue({ test: 'success' })
    })
    await rerender()

    expect(result.current.cloned).toEqual({ test: 'success' })
  })

  it('works with a value/onChange source', async () => {
    const { result, rerender, act } = await renderHook(() => {
      const [value, setValue] = useState({ test: 'test' })
      return { ...useCloned({ value, onChange: setValue }), setValue }
    })

    expect(result.current.cloned).toEqual({ test: 'test' })

    await act(() => {
      result.current.setValue({ test: 'success' })
    })
    await rerender()

    expect(result.current.cloned).toEqual({ test: 'success' })
  })

  it('treats tuple and value/onChange sources as reactive when immediate is false', async () => {
    const tuple = await renderHook(() => {
      const [value, setValue] = useState({ test: 'test' })
      return { ...useCloned([value, setValue], { immediate: false }), setValue }
    })

    // the initial sync is skipped, exactly as for ref-like sources
    expect(tuple.result.current.cloned).toEqual({})

    await tuple.act(() => {
      tuple.result.current.setValue({ test: 'tuple' })
    })
    await tuple.rerender()

    expect(tuple.result.current.cloned).toEqual({ test: 'tuple' })

    const pair = await renderHook(() => {
      const [value, setValue] = useState({ test: 'test' })
      return { ...useCloned({ value, onChange: setValue }, { immediate: false }), setValue }
    })

    expect(pair.result.current.cloned).toEqual({})

    await pair.act(() => {
      pair.result.current.setValue({ test: 'pair' })
    })
    await pair.rerender()

    expect(pair.result.current.cloned).toEqual({ test: 'pair' })
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
