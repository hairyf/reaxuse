import { useState } from 'react'
import { expect, it } from 'vitest'
import { render, renderHook } from 'vitest-browser-react'
import { useUnmount } from './useUnmount'

it('useUnmount runs the callback exactly once on unmount', async () => {
  const calls: string[] = []

  function UseUnmountDemo() {
    useUnmount(() => calls.push('unmounted'))
    return <span>mounted</span>
  }

  const screen = await render(<UseUnmountDemo />)
  expect(calls).toEqual([])

  await screen.unmount()
  expect(calls).toEqual(['unmounted'])
})

it('useUnmount invokes the latest callback from the most recent render', async () => {
  const calls: string[] = []

  function UseUnmountDemo() {
    const [count, setCount] = useState(0)
    useUnmount(() => calls.push(`unmounted-${count}`))
    return <button onClick={() => setCount(count + 1)}>bump</button>
  }

  const screen = await render(<UseUnmountDemo />)
  await screen.getByRole('button', { name: 'bump' }).click()
  await screen.getByRole('button', { name: 'bump' }).click()

  // Two re-renders happened; only the callback from the final render runs.
  await screen.unmount()
  expect(calls).toEqual(['unmounted-2'])
})

it('useUnmount updates the callback on re-render (renderHook)', async () => {
  const calls: string[] = []

  const { rerender, unmount } = await renderHook((initialProps = 0) => {
    useUnmount(() => calls.push(`unmounted-${initialProps}`))
  })

  await rerender(1)
  await rerender(2)

  await unmount()
  expect(calls).toEqual(['unmounted-2'])
})
