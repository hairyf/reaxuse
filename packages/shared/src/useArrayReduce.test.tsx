import { useReducer, useRef, useState } from 'react'
import { expect, it } from 'vitest'
import { render, renderHook } from 'vitest-browser-react'
import { useArrayReduce } from './useArrayReduce'

function ReduceDemo() {
  const item1 = useRef(1)
  const item2 = useRef(2)
  const [, rerender] = useReducer(count => count + 1, 0)
  const sum = useArrayReduce([item1, item2, 3], (a, b) => a + b)

  return (
    <div>
      <span>
        {'sum: '}
        {sum}
      </span>
      <button
        onClick={() => {
          item1.current = 4
          rerender()
        }}
      >
        bump item1
      </button>
      <button
        onClick={() => {
          item2.current = 3
          rerender()
        }}
      >
        bump item2
      </button>
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
  const item1 = { current: 1 }
  const item2 = { current: 2 }
  const { result, rerender } = await renderHook(() => useArrayReduce([item1, item2, 3], (a, b) => a + b))

  expect(result.current).toBe(6)

  // mutating a ref element only shows up on the next render
  item1.current = 4
  await rerender()
  expect(result.current).toBe(9)

  item2.current = 3
  await rerender()
  expect(result.current).toBe(10)
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
