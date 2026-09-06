import { expect, it } from 'vitest'
import { render, renderHook } from 'vitest-browser-react'
import { useSupported } from './useSupported'

it('useSupported returns true when the callback reports support', async () => {
  const { result } = await renderHook(() => useSupported(() => true))

  expect(result.current).toBe(true)
})

it('useSupported returns false when the callback reports no support', async () => {
  const { result } = await renderHook(() => useSupported(() => false))

  expect(result.current).toBe(false)
})

it('useSupported coerces truthy callback results to a boolean', async () => {
  const { result } = await renderHook(() => useSupported(() => 'body' in document))

  expect(result.current).toBe(true)
})

it('useSupported is false during render and evaluates the callback once after mount', async () => {
  const values: boolean[] = []
  let calls = 0

  function Probe() {
    const isSupported = useSupported(() => {
      calls += 1
      return true
    })

    values.push(isSupported)

    return <div>{isSupported ? 'supported' : 'unsupported'}</div>
  }

  const screen = await render(<Probe />)

  // render-time value is `false` (SSR/hydration safe)
  expect(values[0]).toBe(false)
  // the mount effect evaluates the callback and re-renders
  await expect.element(screen.getByText('supported')).toBeVisible()
  expect(values[values.length - 1]).toBe(true)
  expect(calls).toBe(1)

  // no reactive re-evaluation on re-render (documented React divergence)
  await screen.rerender(<Probe />)
  expect(calls).toBe(1)
})
