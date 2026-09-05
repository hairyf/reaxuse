import { useState } from 'react'
import { expect, it } from 'vitest'
import { render, renderHook } from 'vitest-browser-react'
import { useArrayMap } from './useArrayMap'

it('should be defined', () => {
  expect(useArrayMap).toBeDefined()
})

it('should work with array of refs', async () => {
  const list = [{ current: 0 }, { current: 2 }, { current: 4 }, { current: 6 }, { current: 8 }]
  const { result, rerender } = await renderHook(() => useArrayMap(list, i => i * 2))

  expect(result.current).toStrictEqual([0, 4, 8, 12, 16])

  list[0].current = 1
  await rerender()
  expect(result.current).toStrictEqual([2, 4, 8, 12, 16])
})

function ArrayMapDemo() {
  const [list, setList] = useState([0, 1, 2, 3, 4])
  const result = useArrayMap(list, i => i * 2)

  return (
    <div>
      <span>{JSON.stringify(result)}</span>
      <button onClick={() => setList(list.slice(0, -1))}>pop</button>
    </div>
  )
}

it('should work with reactive array', async () => {
  const screen = await render(<ArrayMapDemo />)

  await expect.element(screen.getByText('[0,2,4,6,8]')).toBeVisible()

  await screen.getByRole('button', { name: 'pop' }).click()
  await expect.element(screen.getByText('[0,2,4,6]')).toBeVisible()
})

it('should match the return type of mapper function', async () => {
  const { result: strings } = await renderHook(() => useArrayMap([0, 1, 2, 3], i => i.toString()))
  strings.current.forEach(i => expect(i).toBeTypeOf('string'))

  const { result: objects } = await renderHook(() => useArrayMap([0, 1, 2, 3], i => ({ value: i })))
  objects.current.forEach((item, idx) => {
    expect(item).toBeTypeOf('object')
    expect(item).toHaveProperty('value', idx)
  })
})
