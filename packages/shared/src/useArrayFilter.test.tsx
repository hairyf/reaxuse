import { useState } from 'react'
import { expect, it } from 'vitest'
import { render, renderHook } from 'vitest-browser-react'
import { useArrayFilter } from './useArrayFilter'

it('should be defined', () => {
  expect(useArrayFilter).toBeDefined()
})

it('should work with array of refs', async () => {
  const list = [{ current: 0 }, { current: 2 }, { current: 4 }, { current: 6 }, { current: 8 }]
  const { result, rerender } = await renderHook(() => useArrayFilter(list, i => i % 2 === 0))

  expect(result.current).toStrictEqual([0, 2, 4, 6, 8])

  list[1].current = 1
  await rerender()
  expect(result.current).toStrictEqual([0, 4, 6, 8])
})

function ArrayFilterDemo() {
  const [list, setList] = useState([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
  const evens = useArrayFilter(list, i => i % 2 === 0)

  return (
    <div>
      <span>{JSON.stringify(evens)}</span>
      <button onClick={() => setList(list.slice(1))}>shift</button>
    </div>
  )
}

it('should work with reactive array', async () => {
  const screen = await render(<ArrayFilterDemo />)

  await expect.element(screen.getByText('[0,2,4,6,8]')).toBeVisible()

  await screen.getByRole('button', { name: 'shift' }).click()
  await expect.element(screen.getByText('[2,4,6,8]')).toBeVisible()
})

it('refilters when state updates (renderHook)', async () => {
  const { result, act } = await renderHook(() => {
    const [list, setList] = useState([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
    const evens = useArrayFilter(list, i => i % 2 === 0)
    return { evens, shift: () => setList(list.slice(1)) }
  })

  expect(result.current.evens).toStrictEqual([0, 2, 4, 6, 8])

  await act(() => result.current.shift())
  expect(result.current.evens).toStrictEqual([2, 4, 6, 8])
})

it('should allow values other than boolean in fn', async () => {
  const { result } = await renderHook(() => useArrayFilter([0, 1, 2, 3, 4, 5, 6, 7, 8, 9], i => i % 2))
  expect(result.current).toStrictEqual([1, 3, 5, 7, 9])
})
