import { useState } from 'react'
import { expect, it } from 'vitest'
import { render, renderHook } from 'vitest-browser-react'
import { useArrayFindLast } from '../useArrayFindLast'

function FindLastDemo() {
  const [list, setList] = useState([1, 2, 3])
  const positive = useArrayFindLast(list, val => val > 0)

  return (
    <div>
      <span>
        {'last positive: '}
        {positive ?? 'none'}
      </span>
      <button onClick={() => setList([1, 2, -3])}>negate item3</button>
      <button onClick={() => setList([1, -2, -3])}>negate item2</button>
      <button onClick={() => setList([-1, -2, -3])}>negate item1</button>
    </div>
  )
}

it('useArrayFindLast is defined', () => {
  expect(useArrayFindLast).toBeDefined()
})

it('useArrayFindLast finds the last positive element (component)', async () => {
  const screen = await render(<FindLastDemo />)

  await expect.element(screen.getByText('last positive: 3')).toBeVisible()

  await screen.getByRole('button', { name: 'negate item3' }).click()
  await expect.element(screen.getByText('last positive: 2')).toBeVisible()

  await screen.getByRole('button', { name: 'negate item2' }).click()
  await expect.element(screen.getByText('last positive: 1')).toBeVisible()

  await screen.getByRole('button', { name: 'negate item1' }).click()
  await expect.element(screen.getByText('last positive: none')).toBeVisible()
})

it('useArrayFindLast works with a plain array (renderHook)', async () => {
  const { result } = await renderHook(() => useArrayFindLast([1, 2, 3], val => val > 0))

  expect(result.current).toBe(3)
})

it('useArrayFindLast works with a state array (renderHook)', async () => {
  const { result, act } = await renderHook(() => {
    const [list, setList] = useState([-1, -2])
    const positive = useArrayFindLast(list, val => val > 0)
    return { positive, push: (value: number) => setList(current => [...current, value]) }
  })

  expect(result.current.positive).toBe(undefined)

  await act(() => result.current.push(10))
  expect(result.current.positive).toBe(10)

  await act(() => result.current.push(5))
  expect(result.current.positive).toBe(5)
})
