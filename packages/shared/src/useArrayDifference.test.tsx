import { useState } from 'react'
import { expect, it } from 'vitest'
import { render, renderHook } from 'vitest-browser-react'
import { useArrayDifference } from './useArrayDifference'

function ArrayDifferenceDemo() {
  const [list, setList] = useState([1, 2, 3, 4, 5])
  const [values, setValues] = useState([4, 5, 6])
  const diff = useArrayDifference(list, values)

  return (
    <div>
      <span>
        {'diff: '}
        {JSON.stringify(diff)}
      </span>
      <button onClick={() => setValues([1, 2, 3])}>values to 1, 2, 3</button>
      <button onClick={() => setList([1, 2, 3])}>list to 1, 2, 3</button>
    </div>
  )
}

it('useArrayDifference is defined', () => {
  expect(useArrayDifference).toBeTypeOf('function')
})

it('useArrayDifference recomputes when the array state changes (component)', async () => {
  const screen = await render(<ArrayDifferenceDemo />)

  await expect.element(screen.getByText('diff: [1,2,3]')).toBeVisible()

  await screen.getByRole('button', { name: 'values to 1, 2, 3' }).click()
  await expect.element(screen.getByText('diff: [4,5]')).toBeVisible()

  await screen.getByRole('button', { name: 'list to 1, 2, 3' }).click()
  await expect.element(screen.getByText('diff: []')).toBeVisible()
})

it('useArrayDifference returns the difference of two arrays (renderHook)', async () => {
  const { result, act } = await renderHook(() => {
    const [list, setList] = useState([1, 2, 3, 4, 5])
    const [values, setValues] = useState([4, 5, 6])
    return { diff: useArrayDifference(list, values), setList, setValues }
  })

  expect(result.current.diff).toEqual([1, 2, 3])

  await act(() => result.current.setValues([1, 2, 3]))
  expect(result.current.diff).toEqual([4, 5])

  await act(() => result.current.setList([1, 2, 3]))
  expect(result.current.diff).toEqual([])
})

it('useArrayDifference accepts a compare function (renderHook)', async () => {
  const { result, act } = await renderHook(() => {
    const [list, setList] = useState([{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }])
    const [values, setValues] = useState([{ id: 4 }, { id: 5 }])
    return {
      diff: useArrayDifference(list, values, (value, othVal) => value.id === othVal.id),
      setList,
      setValues,
    }
  })

  expect(result.current.diff).toEqual([{ id: 1 }, { id: 2 }, { id: 3 }])

  await act(() => result.current.setValues([{ id: 1 }, { id: 2 }, { id: 3 }]))
  expect(result.current.diff).toEqual([{ id: 4 }, { id: 5 }])

  await act(() => result.current.setList([{ id: 1 }, { id: 2 }, { id: 3 }]))
  expect(result.current.diff).toEqual([])
})

it('useArrayDifference accepts a key (renderHook)', async () => {
  const { result, act } = await renderHook(() => {
    const [list, setList] = useState([{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }])
    const [values, setValues] = useState([{ id: 3 }, { id: 4 }, { id: 5 }])
    return { diff: useArrayDifference(list, values, 'id'), setList, setValues }
  })

  expect(result.current.diff).toEqual([{ id: 1 }, { id: 2 }])

  await act(() => result.current.setValues([{ id: 1 }, { id: 2 }]))
  expect(result.current.diff).toEqual([{ id: 3 }, { id: 4 }, { id: 5 }])

  await act(() => result.current.setList([{ id: 1 }, { id: 2 }]))
  expect(result.current.diff).toEqual([])
})

it('useArrayDifference supports the symmetric option with a key (renderHook)', async () => {
  const { result, act } = await renderHook(() => {
    const [list, setList] = useState([{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }])
    const [values, setValues] = useState([{ id: 3 }, { id: 4 }, { id: 5 }, { id: 6 }])
    return { diff: useArrayDifference(list, values, 'id', { symmetric: true }), setList, setValues }
  })

  expect(result.current.diff).toEqual([{ id: 1 }, { id: 2 }, { id: 6 }])

  await act(() => result.current.setValues([{ id: 1 }, { id: 2 }]))
  expect(result.current.diff).toEqual([{ id: 3 }, { id: 4 }, { id: 5 }])

  await act(() => result.current.setList([{ id: 1 }, { id: 2 }]))
  expect(result.current.diff).toEqual([])
})

it('useArrayDifference supports the symmetric option with a compare function (renderHook)', async () => {
  const { result, act } = await renderHook(() => {
    const [list, setList] = useState([{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }])
    const [values, setValues] = useState([{ id: 3 }, { id: 4 }, { id: 5 }, { id: 6 }])
    return {
      diff: useArrayDifference(list, values, (x, y) => x.id === y.id, { symmetric: true }),
      setList,
      setValues,
    }
  })

  expect(result.current.diff).toEqual([{ id: 1 }, { id: 2 }, { id: 6 }])

  await act(() => result.current.setValues([{ id: 6 }, { id: 7 }]))
  expect(result.current.diff).toEqual([{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }, { id: 6 }, { id: 7 }])

  await act(() => result.current.setList([{ id: 6 }, { id: 7 }]))
  expect(result.current.diff).toEqual([])
})

it('useArrayDifference unwraps ref-like elements and recomputes on re-render (renderHook)', async () => {
  const item1 = { current: 1 }
  const item2 = { current: 2 }

  const { result, rerender } = await renderHook(() => useArrayDifference([item1, item2], [{ current: 2 }, { current: 3 }]))

  expect(result.current).toEqual([1])

  item1.current = 2

  await rerender()

  expect(result.current).toEqual([])
})
