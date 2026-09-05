import { useState } from 'react'
import { expect, it } from 'vitest'
import { render, renderHook } from 'vitest-browser-react'
import { useArrayFindIndex } from './useArrayFindIndex'

it('useArrayFindIndex is defined', () => {
  expect(useArrayFindIndex).toBeDefined()
})

function ArrayFindIndexDemo() {
  const [list, setList] = useState([0, 2, 4, 6, 8])
  const index = useArrayFindIndex(list, i => i % 2 === 0)

  return (
    <div>
      <span>{index}</span>
      <button onClick={() => setList(current => [1, ...current.slice(1)])}>Make first odd</button>
    </div>
  )
}

it('useArrayFindIndex recomputes when the state array changes (component)', async () => {
  const screen = await render(<ArrayFindIndexDemo />)

  await expect.element(screen.getByText('0')).toBeVisible()

  await screen.getByRole('button', { name: 'Make first odd' }).click()
  await expect.element(screen.getByText('1')).toBeVisible()
})

it('useArrayFindIndex works with a plain array (renderHook)', async () => {
  const { result } = await renderHook(() => useArrayFindIndex([1, 3, 4, 6, 8], i => i % 2 === 0))
  expect(result.current).toBe(2)
})

it('useArrayFindIndex returns the first index passing the test as the state array updates (renderHook)', async () => {
  const { result, act } = await renderHook(() => {
    const [list, setList] = useState<number[]>([0, 2, 4, 6, 8])
    return { index: useArrayFindIndex(list, i => i % 2 === 0), setList }
  })

  expect(result.current.index).toBe(0)

  // upstream: item1.value = 1
  await act(() => result.current.setList([1, 2, 4, 6, 8]))
  expect(result.current.index).toBe(1)

  // upstream: item2.value = 3
  await act(() => result.current.setList([1, 3, 4, 6, 8]))
  expect(result.current.index).toBe(2)

  // upstream: item3.value = 5
  await act(() => result.current.setList([1, 3, 5, 6, 8]))
  expect(result.current.index).toBe(3)

  // upstream: item4.value = 7
  await act(() => result.current.setList([1, 3, 5, 7, 8]))
  expect(result.current.index).toBe(4)

  // upstream: item5.value = 9
  await act(() => result.current.setList([1, 3, 5, 7, 9]))
  expect(result.current.index).toBe(-1)
})

it('useArrayFindIndex recomputes when the state array is prepended (renderHook)', async () => {
  const { result, act } = await renderHook(() => {
    const [list, setList] = useState<number[]>([0, 2, 4, 6, 8])
    return { index: useArrayFindIndex(list, i => i % 2 === 0), setList }
  })

  expect(result.current.index).toBe(0)

  // upstream: list.value.unshift(-1)
  await act(() => result.current.setList(current => [-1, ...current]))
  expect(result.current.index).toBe(1)
})
