import { expect, it } from 'vitest'
import { render, renderHook } from 'vitest-browser-react'
import { useUnmount } from '../useUnmount'

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

it('useUnmount updates the callback on re-render', async () => {
  const calls: string[] = []

  const { rerender, unmount } = await renderHook((initialProps = 0) => {
    useUnmount(() => calls.push(`unmounted-${initialProps}`))
  })

  await rerender(1)
  await rerender(2)

  await unmount()
  expect(calls).toEqual(['unmounted-2'])
})
