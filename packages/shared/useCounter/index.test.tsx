import { expect, it, vi } from 'vitest'
import { render, renderHook } from 'vitest-browser-react'
import { useCounter } from '../useCounter'

function CounterDemo() {
  const { count, inc, dec } = useCounter(5)
  return (
    <div>
      <span>
        {'Count is '}
        {count}
      </span>
      <button onClick={() => inc()}>Increment</button>
      <button onClick={() => dec()}>Decrement</button>
    </div>
  )
}

it('useCounter increments and decrements (component)', async () => {
  const screen = await render(<CounterDemo />)

  await expect.element(screen.getByText('Count is 5')).toBeVisible()

  await screen.getByRole('button', { name: 'Increment' }).click()
  await expect.element(screen.getByText('Count is 6')).toBeVisible()

  await screen.getByRole('button', { name: 'Decrement' }).click()
  await expect.element(screen.getByText('Count is 5')).toBeVisible()
})

it('useCounter supports controlled State tuples', async () => {
  const setter = vi.fn()
  const { result, act } = await renderHook(() => useCounter([5, setter]))

  await act(() => result.current.inc(2))
  expect(setter).toHaveBeenCalledWith(7)
  expect(result.current.count).toBe(5)
})

it('useCounter respects min/max bounds', async () => {
  const { result, act } = await renderHook(() => useCounter(10, { min: 0, max: 10 }))

  await act(() => result.current.inc())
  expect(result.current.count).toBe(10)

  await act(() => result.current.dec(20))
  expect(result.current.count).toBe(0)

  await act(() => result.current.reset())
  expect(result.current.count).toBe(10)
})

it('useCounter get() returns the current value', async () => {
  const { result, act } = await renderHook(() => useCounter(5))

  expect(result.current.get()).toBe(5)

  await act(() => result.current.inc())
  expect(result.current.get()).toBe(6)
})

it('useCounter set() clamps to the bounds', async () => {
  const { result, act } = await renderHook(() => useCounter(5, { min: 0, max: 10 }))

  await act(() => result.current.set(20))
  expect(result.current.count).toBe(10)

  await act(() => result.current.set(-5))
  expect(result.current.count).toBe(0)

  await act(() => result.current.set(7))
  expect(result.current.count).toBe(7)
})

it('useCounter inc/dec clamp on both sides', async () => {
  // a controlled tuple can start out of range — inc must still respect the
  // min bound and dec the max bound (upstream clamps both sides)
  const { result: belowMin, act: actBelow } = await renderHook(() => {
    const setter = vi.fn()
    return { counter: useCounter([0, setter], { min: 5, max: 10 }), setter }
  })

  await actBelow(() => belowMin.current.counter.inc())
  expect(belowMin.current.setter).toHaveBeenLastCalledWith(5)

  const { result: aboveMax, act: actAbove } = await renderHook(() => {
    const setter = vi.fn()
    return { counter: useCounter([12, setter], { min: 0, max: 5 }), setter }
  })

  await actAbove(() => aboveMax.current.counter.dec())
  expect(aboveMax.current.setter).toHaveBeenLastCalledWith(5)
})

it('useCounter reset(val) rebases the initial value and returns it', async () => {
  const { result, act } = await renderHook(() => useCounter(5, { min: 0, max: 10 }))

  // reset(val) returns the (clamped) new count and rebases future resets
  let returned = -1
  await act(() => {
    returned = result.current.reset(3)
  })
  expect(returned).toBe(3)
  expect(result.current.count).toBe(3)

  await act(() => result.current.set(9))
  expect(result.current.count).toBe(9)

  // a plain reset() now restores the rebased value
  await act(() => result.current.reset())
  expect(result.current.count).toBe(3)
})
