import { useState } from 'react'
import { expect, it } from 'vitest'
import { render, renderHook } from 'vitest-browser-react'
import { useArrayIncludes } from './useArrayIncludes'

function IncludesDemo() {
  const [list, setList] = useState([0, 2, 4, 6])
  const includes = useArrayIncludes(list, 8)

  return (
    <div>
      <span>
        {'includes 8: '}
        {includes ? 'yes' : 'no'}
      </span>
      <button onClick={() => setList(current => [...current, 8])}>push 8</button>
      <button onClick={() => setList(current => current.slice(0, -1))}>pop</button>
    </div>
  )
}

it('useArrayIncludes is defined', () => {
  expect(useArrayIncludes).toBeDefined()
})

it('useArrayIncludes tracks state updates (component)', async () => {
  const screen = await render(<IncludesDemo />)

  await expect.element(screen.getByText('includes 8: no')).toBeVisible()

  await screen.getByRole('button', { name: 'push 8' }).click()
  await expect.element(screen.getByText('includes 8: yes')).toBeVisible()

  await screen.getByRole('button', { name: 'pop' }).click()
  await expect.element(screen.getByText('includes 8: no')).toBeVisible()
})

it('useArrayIncludes works with a state array (renderHook)', async () => {
  const { result, act } = await renderHook(() => {
    const [list, setList] = useState([0, 2, 4, 6])
    const includes = useArrayIncludes(list, 8)
    return {
      includes,
      push: () => setList(current => [...current, 8]),
      pop: () => setList(current => current.slice(0, -1)),
    }
  })

  expect(result.current.includes).toBe(false)

  await act(() => result.current.push())
  expect(result.current.includes).toBe(true)

  await act(() => result.current.pop())
  expect(result.current.includes).toBe(false)
})

it('useArrayIncludes unwraps ref-like elements and value (renderHook)', async () => {
  const item1 = { current: 0 }
  const item2 = { current: 2 }
  const search = { current: 2 }
  const { result, rerender } = await renderHook(() => useArrayIncludes([item1, item2], search))

  expect(result.current).toBe(true)

  search.current = 8
  await rerender()
  expect(result.current).toBe(false)

  search.current = 0
  await rerender()
  expect(result.current).toBe(true)
})

it('useArrayIncludes works with a key comparator (renderHook)', async () => {
  const { result, act } = await renderHook(() => {
    const [list, setList] = useState([{ id: 1 }, { id: 2 }, { id: 3 }])
    const includes = useArrayIncludes(list, 3, 'id')
    return { includes, pop: () => setList(current => current.slice(0, -1)) }
  })

  expect(result.current.includes).toBe(true)

  await act(() => result.current.pop())
  expect(result.current.includes).toBe(false)
})

it('useArrayIncludes works with a comparator function (renderHook)', async () => {
  const { result, act } = await renderHook(() => {
    const [list, setList] = useState([{ id: 1 }, { id: 2 }, { id: 3 }])
    const includes = useArrayIncludes(list, { id: 3 }, (element, value) => element.id === value.id)
    return { includes, pop: () => setList(current => current.slice(0, -1)) }
  })

  expect(result.current.includes).toBe(true)

  await act(() => result.current.pop())
  expect(result.current.includes).toBe(false)
})

it('useArrayIncludes works with fromIndex options (renderHook)', async () => {
  const { result } = await renderHook(() => useArrayIncludes(
    [{ id: 1 }, { id: 2 }, { id: 3 }],
    { id: 1 },
    { fromIndex: 1, comparator: (element, value) => element.id === value.id },
  ))

  expect(result.current).toBe(false)
})
