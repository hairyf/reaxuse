import { useReducer, useRef, useState } from 'react'
import { expect, it } from 'vitest'
import { render, renderHook } from 'vitest-browser-react'
import { useArrayFind } from './useArrayFind'

function FindDemo() {
  const item1 = useRef(1)
  const item2 = useRef(2)
  const item3 = useRef(3)
  const [, rerender] = useReducer(count => count + 1, 0)
  const positive = useArrayFind([item1, item2, item3], val => val > 0)

  return (
    <div>
      <span>
        {'first positive: '}
        {positive ?? 'none'}
      </span>
      <button
        onClick={() => {
          item1.current = -1
          rerender()
        }}
      >
        negate item1
      </button>
      <button
        onClick={() => {
          item2.current = -1
          rerender()
        }}
      >
        negate item2
      </button>
      <button
        onClick={() => {
          item3.current = -1
          rerender()
        }}
      >
        negate item3
      </button>
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

it('useArrayFind finds the first positive element (renderHook)', async () => {
  const item1 = { current: 1 }
  const item2 = { current: 2 }
  const item3 = { current: 3 }
  const { result, rerender } = await renderHook(() => useArrayFind([item1, item2, item3], val => val > 0))

  expect(result.current).toBe(1)

  // mutating a ref element only shows up on the next render
  item1.current = -1
  await rerender()
  expect(result.current).toBe(2)

  item2.current = -1
  await rerender()
  expect(result.current).toBe(3)

  item3.current = -1
  await rerender()
  expect(result.current).toBe(undefined)
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
