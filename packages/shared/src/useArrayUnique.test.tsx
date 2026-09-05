import { useState } from 'react'
import { expect, it } from 'vitest'
import { render, renderHook } from 'vitest-browser-react'
import { useArrayUnique } from './useArrayUnique'

function ArrayUniqueDemo() {
  const [list, setList] = useState([0, 2, 2, 4, 4, 4])
  const result = useArrayUnique(list)

  return (
    <div>
      <span>
        {'Unique: '}
        {`[${result.join(', ')}]`}
      </span>
      <button onClick={() => setList([0, 2, 4, 6, 6])}>Add 6, 6</button>
    </div>
  )
}

it('useArrayUnique is defined', () => {
  expect(useArrayUnique).toBeTypeOf('function')
})

it('useArrayUnique dedupes primitives via Set semantics', async () => {
  const { result } = await renderHook(() => useArrayUnique([0, 2, 2, 4, 4, 4]))

  expect(result.current).toEqual([0, 2, 4])
})

it('useArrayUnique recomputes when the array state changes (component)', async () => {
  const screen = await render(<ArrayUniqueDemo />)

  await expect.element(screen.getByText('Unique: [0, 2, 4]')).toBeVisible()

  await screen.getByRole('button', { name: 'Add 6, 6' }).click()

  await expect.element(screen.getByText('Unique: [0, 2, 4, 6]')).toBeVisible()
})

it('useArrayUnique recomputes when the array state changes (renderHook)', async () => {
  const { result, act } = await renderHook(() => {
    const [list, setList] = useState([1, 2, 2, 3])
    return { unique: useArrayUnique(list), setList }
  })

  expect(result.current.unique).toEqual([1, 2, 3])

  await act(() => result.current.setList([1, 2, 2, 3, 1]))

  expect(result.current.unique).toEqual([1, 2, 3])
})

it('useArrayUnique unwraps ref-like elements and recomputes on re-render', async () => {
  const item1 = { current: 0 }
  const item2 = { current: 1 }
  const item3 = { current: 1 }
  const item4 = { current: 2 }
  const item5 = { current: 3 }

  const { result, rerender } = await renderHook(() => useArrayUnique([item1, item2, item3, item4, item5]))

  expect(result.current).toEqual([0, 1, 2, 3])

  item5.current = 2

  await rerender()

  expect(result.current).toEqual([0, 1, 2])
})

it('useArrayUnique unwraps a ref-like list and recomputes on re-render', async () => {
  const list = { current: [1, 2, 2, 3] }

  const { result, rerender } = await renderHook(() => useArrayUnique(list))

  expect(result.current).toEqual([1, 2, 3])

  list.current = [1, 2, 2, 3, 1]

  await rerender()

  expect(result.current).toEqual([1, 2, 3])
})

it('useArrayUnique dedupes objects by reference identity without compareFn', async () => {
  const foo = { id: 1 }
  const bar = { id: 1 }

  const { result } = await renderHook(() => useArrayUnique([foo, bar, foo]))

  expect(result.current).toEqual([foo, bar])
})

it('useArrayUnique supports a custom compare function', async () => {
  const { result } = await renderHook(() => useArrayUnique(
    [
      { id: 1, name: 'foo' },
      { id: 2, name: 'bar' },
      { id: 1, name: 'baz' },
    ],
    (a, b) => a.id === b.id,
  ))

  expect(result.current).toEqual([
    { id: 1, name: 'foo' },
    { id: 2, name: 'bar' },
  ])
})

it('useArrayUnique returns an empty array for an empty input', async () => {
  const { result } = await renderHook(() => useArrayUnique([] as number[]))

  expect(result.current).toEqual([])
})
