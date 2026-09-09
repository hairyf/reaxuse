import { useState } from 'react'
import { expect, it } from 'vitest'
import { render, renderHook } from 'vitest-browser-react'
import { useArrayReduce } from '../useArrayReduce'

function ReduceDemo() {
  const [list, setList] = useState([1, 2, 3])
  const sum = useArrayReduce(list, (a, b) => a + b)

  return (
    <div>
      <span>
        {'sum: '}
        {sum}
      </span>
      <button onClick={() => setList(current => [4, ...current.slice(1)])}>bump item1</button>
      <button onClick={() => setList(current => [current[0], 3, ...current.slice(2)])}>bump item2</button>
    </div>
  )
}

it('useArrayReduce is defined', () => {
  expect(useArrayReduce).toBeDefined()
})

it('useArrayReduce calculates the array sum (component)', async () => {
  const screen = await render(<ReduceDemo />)

  await expect.element(screen.getByText('sum: 6')).toBeVisible()

  await screen.getByRole('button', { name: 'bump item1' }).click()
  await expect.element(screen.getByText('sum: 9')).toBeVisible()

  await screen.getByRole('button', { name: 'bump item2' }).click()
  await expect.element(screen.getByText('sum: 10')).toBeVisible()
})

it('useArrayReduce calculates the array sum (renderHook)', async () => {
  const { result } = await renderHook(() => useArrayReduce([1, 2, 3], (a, b) => a + b))

  expect(result.current).toBe(6)
})

it('useArrayReduce works with a state array (renderHook)', async () => {
  const { result, act } = await renderHook(() => {
    const [list, setList] = useState([1, 2])
    const sum = useArrayReduce(list, (a, b) => a + b)
    return { sum, push: () => setList(current => [...current, 3]) }
  })

  expect(result.current.sum).toBe(3)

  await act(() => result.current.push())
  expect(result.current.sum).toBe(6)
})

it('useArrayReduce works with initialValue (renderHook)', async () => {
  const { result, act } = await renderHook(() => {
    const [list, setList] = useState([{ num: 1 }, { num: 2 }])
    const total = useArrayReduce(list, (sum, val) => sum + val.num, 0)
    return { total, push: () => setList(current => [...current, { num: 3 }]) }
  })

  expect(result.current.total).toBe(3)

  await act(() => result.current.push())
  expect(result.current.total).toBe(6)
})

it('useArrayReduce works with initialValue being a function (renderHook)', async () => {
  const { result, act } = await renderHook(() => {
    const [list, setList] = useState([{ num: 1 }, { num: 2 }])
    const collected = useArrayReduce(list, (prev, val) => {
      prev.push(val.num)
      return prev
    }, (() => []) as unknown as number[])
    return { collected, push: () => setList(current => [...current, { num: 3 }]) }
  })

  expect(result.current.collected).toEqual([1, 2])

  await act(() => result.current.push())
  expect(result.current.collected).toEqual([1, 2, 3])
})
