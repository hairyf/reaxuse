import { describe, expect, it, vi } from 'vitest'
import { render, renderHook } from 'vitest-browser-react'
import { createGlobalState } from '../createGlobalState'

describe('createGlobalState', () => {
  it('is defined', () => {
    expect(createGlobalState).toBeTypeOf('function')
  })

  it('shares one module-wide state and updates every consumer', async () => {
    const useGlobalState = createGlobalState(() => 0)

    function Consumer({ label }: { label: string }) {
      const [count, setCount] = useGlobalState()

      return (
        <div>
          <span>{`${label}: ${count}`}</span>
          <button onClick={() => setCount(prev => prev + 1)}>{`inc-${label}`}</button>
        </div>
      )
    }

    const screen = await render(
      <div>
        <Consumer label="a" />
        <Consumer label="b" />
      </div>,
    )

    await expect.element(screen.getByText('a: 0')).toBeVisible()
    await expect.element(screen.getByText('b: 0')).toBeVisible()

    // a write from the first consumer is observed by the second one
    await screen.getByRole('button', { name: 'inc-a' }).click()
    await expect.element(screen.getByText('a: 1')).toBeVisible()
    await expect.element(screen.getByText('b: 1')).toBeVisible()

    // ...and the other way round
    await screen.getByRole('button', { name: 'inc-b' }).click()
    await expect.element(screen.getByText('a: 2')).toBeVisible()
    await expect.element(screen.getByText('b: 2')).toBeVisible()
  })

  it('keeps the state after unmount (upstream: should work after dispose)', async () => {
    const useGlobalState = createGlobalState(() => 1)

    function Counter() {
      const [count, setCount] = useGlobalState()

      return <button onClick={() => setCount(prev => prev + 1)}>{`count: ${count}`}</button>
    }

    const first = await render(<Counter />)
    await first.getByRole('button', { name: 'count: 1' }).click()
    await expect.element(first.getByRole('button', { name: 'count: 2' })).toBeVisible()

    // the store outlives the component — nothing is reset or disposed
    await first.unmount()

    const second = await render(<Counter />)
    await expect.element(second.getByRole('button', { name: 'count: 2' })).toBeVisible()

    await second.getByRole('button', { name: 'count: 2' }).click()
    await expect.element(second.getByRole('button', { name: 'count: 3' })).toBeVisible()
  })

  it('survives unmount and remount for a hook consumer', async () => {
    const useGlobalState = createGlobalState(() => 'initial')

    const first = await renderHook(() => useGlobalState())
    expect(first.result.current[0]).toBe('initial')

    await first.act(() => first.result.current[1]('updated'))
    expect(first.result.current[0]).toBe('updated')

    await first.unmount()

    const second = await renderHook(() => useGlobalState())
    expect(second.result.current[0]).toBe('updated')
  })

  it('supports the plain value and the functional updater form', async () => {
    const useGlobalState = createGlobalState(() => ({ count: 0 }))
    const { result, act } = await renderHook(() => useGlobalState())

    await act(() => result.current[1]({ count: 5 }))
    expect(result.current[0]).toEqual({ count: 5 })

    await act(() => result.current[1](prev => ({ count: prev.count * 2 })))
    expect(result.current[0]).toEqual({ count: 10 })
  })

  it('runs the factory exactly once, with the first call args', async () => {
    const factory = vi.fn((start: number) => start)
    const useGlobalState = createGlobalState(factory)

    const first = await renderHook(() => useGlobalState(10))
    const second = await renderHook(() => useGlobalState(99))

    expect(factory).toHaveBeenCalledTimes(1)
    expect(factory).toHaveBeenCalledWith(10)

    expect(first.result.current[0]).toBe(10)
    // the second consumer ignores its own args and shares the first state
    expect(second.result.current[0]).toBe(10)
  })

  it('runs a factory resolving to undefined exactly once', async () => {
    const factory = vi.fn(() => undefined)
    const useGlobalState = createGlobalState<undefined | string>(factory)

    const first = await renderHook(() => useGlobalState())
    const second = await renderHook(() => useGlobalState())

    // the `initialized` flag, not `state ??=`, guarantees a single run even
    // when the factory yields `undefined`
    expect(factory).toHaveBeenCalledTimes(1)
    expect(first.result.current[0]).toBeUndefined()
    expect(second.result.current[0]).toBeUndefined()

    // the store is writable afterwards
    await first.act(() => first.result.current[1]('now-defined'))
    expect(second.result.current[0]).toBe('now-defined')
  })

  it('returns a stable setter across renders', async () => {
    const useGlobalState = createGlobalState(() => 0)
    const { result, act, rerender } = await renderHook(() => useGlobalState())

    const setState = result.current[1]
    await act(() => result.current[1](1))
    await rerender()

    expect(result.current[0]).toBe(1)
    expect(result.current[1]).toBe(setState)
  })
})
