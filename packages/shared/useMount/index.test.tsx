import { useState } from 'react'
import { expect, it } from 'vitest'
import { render, renderHook } from 'vitest-browser-react'
import { useMount } from '../useMount'

it('useMount runs the callback once after mount', async () => {
  const calls: string[] = []
  function Demo() {
    useMount(() => calls.push('mounted'))
    return <span>ready</span>
  }

  const screen = await render(<Demo />)
  expect(calls).toEqual(['mounted'])
  await screen.unmount()
  expect(calls).toEqual(['mounted'])
})

it('useMount does not rerun the callback on re-render', async () => {
  const calls: number[] = []
  const { rerender, unmount } = await renderHook(() => {
    const [, setCount] = useState(0)
    useMount(() => calls.push(1))
    return setCount
  })

  expect(calls).toEqual([1])
  await rerender()
  expect(calls).toEqual([1])
  await unmount()
})
