import { useState } from 'react'
import { expect, it } from 'vitest'
import { render, renderHook } from 'vitest-browser-react'
import { useArrayEvery } from './index'

function EveryDemo() {
  const [list, setList] = useState([0, 2, 4, 6, 8])
  const allEven = useArrayEvery(list, i => i % 2 === 0)

  return (
    <div>
      <span>
        {'all even: '}
        {allEven ? 'true' : 'false'}
      </span>
      <button onClick={() => setList([1, 2, 4, 6, 8])}>make item1 odd</button>
      <button onClick={() => setList([0, 2, 4, 6, 8])}>make item1 even</button>
    </div>
  )
}

it('useArrayEvery is defined', () => {
  expect(useArrayEvery).toBeDefined()
})

it('useArrayEvery recomputes when the state array changes (component)', async () => {
  const screen = await render(<EveryDemo />)

  await expect.element(screen.getByText('all even: true')).toBeVisible()

  await screen.getByRole('button', { name: 'make item1 odd' }).click()
  await expect.element(screen.getByText('all even: false')).toBeVisible()

  await screen.getByRole('button', { name: 'make item1 even' }).click()
  await expect.element(screen.getByText('all even: true')).toBeVisible()
})

it('useArrayEvery works with a plain array (renderHook)', async () => {
  const { result } = await renderHook(() => useArrayEvery([0, 2, 4], i => i % 2 === 0))

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
