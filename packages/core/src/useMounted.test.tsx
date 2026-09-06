import { expect, it } from 'vitest'
import { render, renderHook } from 'vitest-browser-react'
import { useMounted } from './useMounted'

it('useMounted returns true after mount', async () => {
  const { result } = await renderHook(() => useMounted())

  expect(result.current).toBe(true)
})

it('useMounted is false during render and flips to true after mount', async () => {
  const values: boolean[] = []

  function Probe() {
    const isMounted = useMounted()

    values.push(isMounted)

    return <div>{isMounted ? 'mounted' : 'unmounted'}</div>
  }

  const screen = await render(<Probe />)

  // render-time value is `false` (SSR/hydration safe)
  expect(values[0]).toBe(false)
  // the mount effect flips the state and re-renders
  await expect.element(screen.getByText('mounted')).toBeVisible()
  expect(values[values.length - 1]).toBe(true)
})
