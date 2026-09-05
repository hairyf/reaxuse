import { expect, it } from 'vitest'
import { render, renderHook } from 'vitest-browser-react'
import { useMount } from './useMount'

it('useMount is false on the first render and true after mount (component)', async () => {
  let firstRenderValue: boolean | undefined
  function Tracker() {
    const mounted = useMount()
    firstRenderValue ??= mounted
    return <span>{String(mounted)}</span>
  }

  const screen = await render(<Tracker />)

  // The value observed during the first render, before the mount effect ran.
  expect(firstRenderValue).toBe(false)
  // After the mount effect flushes, the flag is `true`.
  await expect.element(screen.getByText('true')).toBeVisible()
})

it('useMount returns true after mount (renderHook)', async () => {
  const { result } = await renderHook(() => useMount())

  expect(result.current).toBe(true)
})

it('useMount unmount does not throw and value stays true', async () => {
  const { result, unmount } = await renderHook(() => useMount())

  expect(result.current).toBe(true)

  await unmount()
  expect(result.current).toBe(true)
})
