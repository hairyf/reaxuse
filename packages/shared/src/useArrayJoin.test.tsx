import { useState } from 'react'
import { expect, it } from 'vitest'
import { render, renderHook } from 'vitest-browser-react'
import { useArrayJoin } from './useArrayJoin'

it('useArrayJoin is defined', () => {
  expect(useArrayJoin).toBeDefined()
})

function ArrayJoinDemo() {
  const [list, setList] = useState(['foo', 0, { prop: 'val' }])
  const joined = useArrayJoin(list, '--')

  return (
    <div>
      <span>{joined}</span>
      <button onClick={() => setList([...list, 'bar'])}>Add item</button>
    </div>
  )
}

it('useArrayJoin joins a state array with a custom separator (component)', async () => {
  const screen = await render(<ArrayJoinDemo />)

  await expect.element(screen.getByText('foo--0--[object Object]')).toBeVisible()

  await screen.getByRole('button', { name: 'Add item' }).click()
  await expect.element(screen.getByText('foo--0--[object Object]--bar')).toBeVisible()
})

it('useArrayJoin joins a plain array with the default separator (renderHook)', async () => {
  const { result } = await renderHook(() => useArrayJoin(['foo', 0, { prop: 'val' }]))
  expect(result.current).toBe('foo,0,[object Object]')
})

it('useArrayJoin recomputes when the state array changes (renderHook)', async () => {
  const { result, act } = await renderHook(() => {
    const [list, setList] = useState<any[]>(['string', 0, { prop: 'val' }, false, [1], [[2]], null, undefined, []])
    return { joined: useArrayJoin(list), setList }
  })

  expect(result.current.joined).toBe('string,0,[object Object],false,1,2,,,')

  // upstream: list.value.push(true)
  await act(() => result.current.setList(current => [...current, true]))
  expect(result.current.joined).toBe('string,0,[object Object],false,1,2,,,,true')

  // upstream: list.value = [...]
  await act(() => result.current.setList([null, 'string', undefined, 0, [], [1], [[2]], { prop: 'val' }]))
  expect(result.current.joined).toBe(',string,,0,,1,2,[object Object]')
})

it('useArrayJoin recomputes when the separator state changes (renderHook)', async () => {
  const { result, act } = await renderHook(() => {
    const [separator, setSeparator] = useState<string | undefined>(undefined)
    const list = ['string', 0, { prop: 'val' }, [1], [[2]], null, undefined, []]
    return { joined: useArrayJoin(list, separator), setSeparator }
  })

  expect(result.current.joined).toBe('string,0,[object Object],1,2,,,')

  await act(() => result.current.setSeparator(''))
  expect(result.current.joined).toBe('string0[object Object]12')

  await act(() => result.current.setSeparator('-'))
  expect(result.current.joined).toBe('string-0-[object Object]-1-2---')
})
