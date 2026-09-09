import { describe, expect, it, vi } from 'vitest'
import { renderHook } from 'vitest-browser-react'
import { useControllableState } from '../useControllableState'

describe('useControllableState', () => {
  it('supports toValue sources and passive local state', async () => {
    const source = { current: 1 }
    const { result, act } = await renderHook(() => useControllableState(source, { passive: true }))
    expect(result.current[0]).toBe(1)
    await act(async () => result.current[1](value => value + 1))
    expect(result.current[0]).toBe(2)
    expect(source.current).toBe(1)
  })

  it('writes through tuple state', async () => {
    const setState = vi.fn()
    const { result, act } = await renderHook(() => useControllableState([1, setState] as const))
    await act(async () => result.current[1](2))
    expect(setState).toHaveBeenCalledWith(2)
    expect(result.current[0]).toBe(1)
  })

  it('writes through value/onChange state', async () => {
    const onChange = vi.fn()
    const state = { value: 'a', onChange }
    const { result, act } = await renderHook(() => useControllableState(state))
    await act(async () => result.current[1]('b'))
    expect(onChange).toHaveBeenCalledWith('b')
  })

  it('uses defaultValue and lazy getters', async () => {
    const { result } = await renderHook(() => useControllableState(() => 'computed', { defaultValue: 'fallback' }))
    expect(result.current[0]).toBe('computed')
  })

  it('honors shouldUpdate as a commit predicate', async () => {
    const shouldUpdate = (prev: number, next: number) => next > prev
    const { result, act } = await renderHook(() => useControllableState(1, { passive: true, shouldUpdate }))
    await act(async () => result.current[1](0))
    expect(result.current[0]).toBe(1)
    await act(async () => result.current[1](2))
    expect(result.current[0]).toBe(2)
  })
})
