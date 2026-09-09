import { useState } from 'react'
import { expect, it } from 'vitest'
import { render, renderHook } from 'vitest-browser-react'
import { useArraySome } from '../useArraySome'

function ArraySomeDemo() {
  const [list, setList] = useState([0, 2, 4, 6, 8])
  const result = useArraySome(list, i => i > 10)

  return (
    <div>
      <span>
        {'Some > 10: '}
        {String(result)}
      </span>
      <button onClick={() => setList([...list, 11])}>Add 11</button>
    </div>
  )
}

it('useArraySome is defined', () => {
  expect(useArraySome).toBeTypeOf('function')
})

it('useArraySome recomputes when the array state changes (component)', async () => {
  const screen = await render(<ArraySomeDemo />)

  await expect.element(screen.getByText('Some > 10: false')).toBeVisible()

  await screen.getByRole('button', { name: 'Add 11' }).click()

  await expect.element(screen.getByText('Some > 10: true')).toBeVisible()
})

it('useArraySome works with plain state arrays', async () => {
  const { result, act } = await renderHook(() => {
    const [list, setList] = useState([0, 2, 4, 6, 8])
    return { some: useArraySome(list, i => i > 10), setList }
  })

  expect(result.current.some).toBe(false)

  await act(() => result.current.setList([0, 2, 4, 6, 8, 11]))

  expect(result.current.some).toBe(true)
})

it('useArraySome works with a plain array', async () => {
  const { result } = await renderHook(() => useArraySome([0, 2, 4], i => i > 10))

  expect(result.current).toBe(false)

  const { result: hit } = await renderHook(() => useArraySome([0, 2, 11], i => i > 10))

  expect(hit.current).toBe(true)
})

it('useArraySome returns false for an empty array', async () => {
  const { result } = await renderHook(() => useArraySome([] as number[], i => i > 10))

  expect(result.current).toBe(false)
})
