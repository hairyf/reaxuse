import type { Dispatch, SetStateAction } from 'react'
import type { UseWatchPausableReturn } from './useWatchPausable'
import { expect, it, vi } from 'vitest'
import { render, renderHook } from 'vitest-browser-react'
import { useWatchPausable } from './useWatchPausable'

interface WatchCall {
  value: number
  oldValue: number | undefined
}

const noopControls: UseWatchPausableReturn = {
  pause: () => {},
  resume: () => {},
  isActive: false,
  stop: () => {},
}

it('useWatchPausable is exported (mirrors upstream `export module`)', () => {
  expect(useWatchPausable).toBeDefined()
})

it('useWatchPausable pauses and resumes the callback (renderHook, upstream "should work")', async () => {
  const calls: WatchCall[] = []
  let setValue: Dispatch<SetStateAction<number>> = () => {}
  let controls: UseWatchPausableReturn = noopControls

  const { act } = await renderHook(() => {
    const [, update, watcher] = useWatchPausable(0, (next, prev) => calls.push({ value: next, oldValue: prev }))
    setValue = update
    controls = watcher
  })

  expect(calls).toEqual([])

  await act(() => setValue(1))
  expect(calls).toEqual([{ value: 1, oldValue: 0 }])
  expect(controls.isActive).toBeTruthy()

  await act(() => controls.pause())
  await act(() => setValue(2))
  expect(calls).toEqual([{ value: 1, oldValue: 0 }])
  expect(controls.isActive).toBeFalsy()

  await act(() => controls.resume())
  expect(calls).toEqual([{ value: 1, oldValue: 0 }])

  await act(() => setValue(3))
  expect(calls).toEqual([
    { value: 1, oldValue: 0 },
    { value: 3, oldValue: 2 },
  ])
  expect(controls.isActive).toBeTruthy()

  await act(() => controls.stop())
  await act(() => setValue(4))
  expect(calls).toEqual([
    { value: 1, oldValue: 0 },
    { value: 3, oldValue: 2 },
  ])
  expect(controls.isActive).toBeTruthy()
})

it('useWatchPausable starts paused with initialState "paused" (renderHook, upstream "initialState paused")', async () => {
  const calls: WatchCall[] = []
  let setValue: Dispatch<SetStateAction<number>> = () => {}
  let controls: UseWatchPausableReturn = noopControls

  const { act } = await renderHook(() => {
    const [, update, watcher] = useWatchPausable(
      0,
      (next, prev) => calls.push({ value: next, oldValue: prev }),
      { initialState: 'paused' },
    )
    setValue = update
    controls = watcher
  })

  expect(calls).toEqual([])
  expect(controls.isActive).toBeFalsy()

  await act(() => setValue(1))
  expect(calls).toEqual([])
  expect(controls.isActive).toBeFalsy()

  await act(() => controls.resume())
  expect(controls.isActive).toBeTruthy()
  expect(calls).toEqual([])

  await act(() => setValue(2))
  expect(calls).toEqual([{ value: 2, oldValue: 1 }])
  expect(controls.isActive).toBeTruthy()
})

it('useWatchPausable fires on mount with immediate: true', async () => {
  const calls: WatchCall[] = []
  let setValue: Dispatch<SetStateAction<number>> = () => {}

  const { act } = await renderHook(() => {
    const [, update] = useWatchPausable(7, (next, prev) => calls.push({ value: next, oldValue: prev }), { immediate: true })
    setValue = update
  })

  expect(calls).toEqual([{ value: 7, oldValue: undefined }])

  await act(() => setValue(8))
  expect(calls).toEqual([
    { value: 7, oldValue: undefined },
    { value: 8, oldValue: 7 },
  ])
})

it('useWatchPausable drops the immediate fire while paused (renderHook)', async () => {
  const calls: WatchCall[] = []
  let setValue: Dispatch<SetStateAction<number>> = () => {}
  let controls: UseWatchPausableReturn = noopControls

  const { act } = await renderHook(() => {
    const [, update, watcher] = useWatchPausable(
      7,
      (next, prev) => calls.push({ value: next, oldValue: prev }),
      { immediate: true, initialState: 'paused' },
    )
    setValue = update
    controls = watcher
  })

  expect(calls).toEqual([])
  expect(controls.isActive).toBeFalsy()

  await act(() => controls.resume())
  expect(calls).toEqual([])

  await act(() => setValue(8))
  expect(calls).toEqual([{ value: 8, oldValue: 7 }])
})

it('useWatchPausable pauses and resumes from buttons (component, mirrors demo.vue)', async () => {
  const calls: number[] = []

  function PausableDemo() {
    const [value, setValue, { pause, resume, isActive }] = useWatchPausable(0, next => calls.push(next))
    return (
      <div>
        <span>{value}</span>
        <button onClick={() => setValue(v => v + 1)}>update</button>
        <button disabled={!isActive} onClick={pause}>pause</button>
        <button disabled={isActive} onClick={resume}>resume</button>
      </div>
    )
  }

  const screen = await render(<PausableDemo />)
  expect(calls).toEqual([])

  await screen.getByRole('button', { name: 'update' }).click()
  expect(calls).toEqual([1])

  await screen.getByRole('button', { name: 'pause' }).click()
  await screen.getByRole('button', { name: 'update' }).click()
  expect(calls).toEqual([1])

  await screen.getByRole('button', { name: 'resume' }).click()
  await screen.getByRole('button', { name: 'update' }).click()
  expect(calls).toEqual([1, 3])
})

it('useWatchPausable keeps the latest callback without extra firings (renderHook)', async () => {
  const first = vi.fn()
  const latest = vi.fn()
  let current = first
  let setValue: Dispatch<SetStateAction<number>> = () => {}

  const { act } = await renderHook(() => {
    const [, update] = useWatchPausable(0, (...args: [number, number | undefined]) => current(...args))
    setValue = update
  })

  current = latest

  await act(() => setValue(1))
  expect(latest).toHaveBeenCalledTimes(1)
  expect(latest).toHaveBeenCalledWith(1, 0)
  expect(first).not.toHaveBeenCalled()
})
