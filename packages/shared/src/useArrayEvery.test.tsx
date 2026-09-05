import { useReducer, useRef, useState } from 'react'
import { expect, it } from 'vitest'
import { render, renderHook } from 'vitest-browser-react'
import { useArrayEvery } from './useArrayEvery'

function EveryDemo() {
  const item1 = useRef(0)
  const item2 = useRef(2)
  const item3 = useRef(4)
  const item4 = useRef(6)
  const item5 = useRef(8)
  const [, rerender] = useReducer(count => count + 1, 0)
  const allEven = useArrayEvery([item1, item2, item3, item4, item5], i => i % 2 === 0)

  return (
    <div>
      <span>
        {'all even: '}
        {allEven ? 'true' : 'false'}
      </span>
      <button
        onClick={() => {
          item1.current = 1
          rerender()
        }}
      >
        make item1 odd
      </button>
      <button
        onClick={() => {
          item1.current = 0
          rerender()
        }}
      >
        make item1 even
      </button>
    </div>
  )
}

it('useArrayEvery is defined', () => {
  expect(useArrayEvery).toBeDefined()
})

it('useArrayEvery works with an array of refs (component)', async () => {
  const screen = await render(<EveryDemo />)

  await expect.element(screen.getByText('all even: true')).toBeVisible()

  await screen.getByRole('button', { name: 'make item1 odd' }).click()
  await expect.element(screen.getByText('all even: false')).toBeVisible()

  await screen.getByRole('button', { name: 'make item1 even' }).click()
  await expect.element(screen.getByText('all even: true')).toBeVisible()
})

it('useArrayEvery works with an array of refs (renderHook)', async () => {
  const item1 = { current: 0 }
  const item2 = { current: 2 }
  const { result, rerender } = await renderHook(() => useArrayEvery([item1, item2], i => i % 2 === 0))

  expect(result.current).toBe(true)

  // mutating a ref element only shows up on the next render
  item1.current = 1
  await rerender()
  expect(result.current).toBe(false)

  item1.current = 0
  await rerender()
  expect(result.current).toBe(true)
})

it('useArrayEvery works with a state array (renderHook)', async () => {
  const { result, act } = await renderHook(() => {
    const [list, setList] = useState([0, 2, 4, 6, 8])
    const allEven = useArrayEvery(list, i => i % 2 === 0)
    return { allEven, push: (value: number) => setList(current => [...current, value]) }
  })

  expect(result.current.allEven).toBe(true)

  await act(() => result.current.push(9))
  expect(result.current.allEven).toBe(false)
})
