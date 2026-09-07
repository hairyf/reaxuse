import { expect, it, vi } from 'vitest'
import { render, renderHook } from 'vitest-browser-react'
import { useFps } from './useFps'

it('useFps returns 0 on the initial render', async () => {
  const snapshots: number[] = []

  function Probe() {
    const fps = useFps()

    snapshots.push(fps)

    return <div>{fps}</div>
  }

  await render(<Probe />)

  // the initial state is 0 — no frame has been measured yet
  expect(snapshots[0]).toBe(0)
})

it('useFps updates to a measured framerate once frames elapse', async () => {
  const { result } = await renderHook(() => useFps())

  await vi.waitFor(() => {
    expect(result.current).toBeGreaterThan(0)
  })
})

it('useFps respects the every option', { retry: 3 }, async () => {
  const fast = await renderHook(() => useFps({ every: 2 }))
  const slow = await renderHook(() => useFps({ every: 20 }))

  // the every: 2 hook reports a rate after ~2 frames
  await vi.waitFor(() => {
    expect(fast.result.current).toBeGreaterThan(0)
  })

  // the every: 20 hook needs 10x more frames — still at 0 right after the
  // fast hook reports
  expect(slow.result.current).toBe(0)
})

it('useFps stays SSR-safe during render before the rAF loop starts', async () => {
  const snapshots: number[] = []

  function Probe() {
    const fps = useFps()

    snapshots.push(fps)

    return <div>{fps}</div>
  }

  await render(<Probe />)

  // during render (e.g. on the server) no timing is measured yet — the value
  // is only produced by the rAF loop running in the mount effect, so SSR
  // renders see the `0` default and never touch `performance` / `requestAnimationFrame`
  expect(snapshots[0]).toBe(0)
})
