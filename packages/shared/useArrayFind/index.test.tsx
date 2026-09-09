import { useState } from 'react'
import { expect, it } from 'vitest'
import { render, renderHook } from 'vitest-browser-react'
import { useArrayFind } from '../useArrayFind'

function FindDemo() {
  const [list, setList] = useState([1, 2, 3])
  const positive = useArrayFind(list, val => val > 0)

  return (
    <div>
      <span>
        {'first positive: '}
        {positive ?? 'none'}
      </span>
      <button onClick={() => setList([-1, 2, 3])}>negate item1</button>
      <button onClick={() => setList([-1, -2, 3])}>negate item2</button>
      <button onClick={() => setList([-1, -2, -3])}>negate item3</button>
    </div>
  )
}

it('useArrayFind is defined', () => {
  expect(useArrayFind).toBeDefined()
})

it('useArrayFind finds the first positive element (component)', async () => {
  const screen = await render(<FindDemo />)

  await expect.element(screen.getByText('first positive: 1')).toBeVisible()

  await screen.getByRole('button', { name: 'negate item1' }).click()
  await expect.element(screen.getByText('first positive: 2')).toBeVisible()

  await screen.getByRole('button', { name: 'negate item2' }).click()
  await expect.element(screen.getByText('first positive: 3')).toBeVisible()

  await screen.getByRole('button', { name: 'negate item3' }).click()
  await expect.element(screen.getByText('first positive: none')).toBeVisible()
})

it('useArrayFind works with a plain array (renderHook)', async () => {
  const { result } = await renderHook(() => useArrayFind([1, 2, 3], val => val > 0))

  expect(result.current).toBe(1)
})

it('useArrayFind works with a state array (renderHook)', async () => {
  const { result, act } = await renderHook(() => {
    const [list, setList] = useState([-1, -2])
    const positive = useArrayFind(list, val => val > 0)
    return { positive, push: () => setList(current => [...current, 1]) }
  })

  expect(result.current.positive).toBe(undefined)

  await act(() => result.current.push())
  expect(result.current.positive).toBe(1)
})
