import { expect, it } from 'vitest'
import { render, renderHook } from 'vitest-browser-react'
import { useCounter } from './useCounter'

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

it('useCounter respects min/max bounds', async () => {
  const { result, act } = await renderHook(() => useCounter(10, { min: 0, max: 10 }))

  await act(() => result.current.inc())
  expect(result.current.count).toBe(10)

  await act(() => result.current.dec(20))
  expect(result.current.count).toBe(0)

  await act(() => result.current.reset())
  expect(result.current.count).toBe(10)
})
