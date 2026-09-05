import type { Dispatch, SetStateAction } from 'react'
import { expect, it, vi } from 'vitest'
import { render, renderHook } from 'vitest-browser-react'
import { useWatchIgnorable } from './useWatchIgnorable'

interface WatchCall {
  value: number
  oldValue: number | undefined
}

it('useWatchIgnorable is exported (mirrors upstream `export module`)', () => {
  expect(useWatchIgnorable).toBeDefined()
})

it('useWatchIgnorable ignores updates made inside ignoreUpdates (renderHook)', async () => {
  const calls: WatchCall[] = []
  let setValue: Dispatch<SetStateAction<number>> = () => {}
  let ignoreUpdates: (updater: () => void) => void = () => {}

  const { act } = await renderHook(() => {
    const [, update, controls] = useWatchIgnorable(0, (next, prev) => calls.push({ value: next, oldValue: prev }))
    setValue = update
    ignoreUpdates = controls.ignoreUpdates
  })

  expect(calls).toEqual([])

  await act(() => setValue(1))
  expect(calls).toEqual([{ value: 1, oldValue: 0 }])

  await act(() => ignoreUpdates(() => {
    setValue(2)
    setValue(3)
  }))
  expect(calls).toEqual([{ value: 1, oldValue: 0 }])

  // changes made outside the updater in the same batch still fire with the
  // latest value
  await act(() => {
    ignoreUpdates(() => setValue(4))
    setValue(5)
  })
  expect(calls).toEqual([
    { value: 1, oldValue: 0 },
    { value: 5, oldValue: 3 },
  ])
})

it('useWatchIgnorable ignores prev async updates (renderHook)', async () => {
  const calls: WatchCall[] = []
  let setValue: Dispatch<SetStateAction<number>> = () => {}
  let ignorePrevAsyncUpdates: () => void = () => {}

  const { act } = await renderHook(() => {
    const [, update, controls] = useWatchIgnorable(0, (next, prev) => calls.push({ value: next, oldValue: prev }))
    setValue = update
    ignorePrevAsyncUpdates = controls.ignorePrevAsyncUpdates
  })

  await act(() => setValue(1))
  expect(calls).toEqual([{ value: 1, oldValue: 0 }])

  await act(() => {
    setValue(2)
    setValue(3)
    ignorePrevAsyncUpdates()
  })
  expect(calls).toEqual([{ value: 1, oldValue: 0 }])

  await act(() => {
    setValue(4)
    ignorePrevAsyncUpdates()
    setValue(5)
  })
  expect(calls).toEqual([
    { value: 1, oldValue: 0 },
    { value: 5, oldValue: 3 },
  ])
})

it('useWatchIgnorable ignores updates step-by-step (upstream flush:sync test adapted)', async () => {
  const calls: WatchCall[] = []
  let setValue: Dispatch<SetStateAction<number>> = () => {}
  let ignoreUpdates: (updater: () => void) => void = () => {}
  let ignorePrevAsyncUpdates: () => void = () => {}

  const { act } = await renderHook(() => {
    const [, update, controls] = useWatchIgnorable(0, (next, prev) => calls.push({ value: next, oldValue: prev }))
    setValue = update
    ignoreUpdates = controls.ignoreUpdates
    ignorePrevAsyncUpdates = controls.ignorePrevAsyncUpdates
  })

  await act(() => setValue(1))
  expect(calls).toEqual([{ value: 1, oldValue: 0 }])

  await act(() => ignoreUpdates(() => {
    setValue(2)
    setValue(3)
  }))
  expect(calls).toEqual([{ value: 1, oldValue: 0 }])

  await act(() => ignoreUpdates(() => setValue(4)))
  expect(calls).toEqual([{ value: 1, oldValue: 0 }])

  await act(() => setValue(5))
  expect(calls).toEqual([{ value: 1, oldValue: 0 }, { value: 5, oldValue: 4 }])

  await act(() => ignorePrevAsyncUpdates())
  expect(calls).toEqual([{ value: 1, oldValue: 0 }, { value: 5, oldValue: 4 }])
})

it('useWatchIgnorable stops watching after stop is called (renderHook)', async () => {
  const callback = vi.fn()
  let setValue: Dispatch<SetStateAction<number>> = () => {}
  let stop: () => void = () => {}

  const { act } = await renderHook(() => {
    const [, update, controls] = useWatchIgnorable(0, callback)
    setValue = update
    stop = controls.stop
  })

  await act(() => setValue(1))
  expect(callback).toHaveBeenCalledTimes(1)
  expect(callback).toHaveBeenCalledWith(1, 0)

  await act(() => stop())

  await act(() => setValue(2))
  expect(callback).toHaveBeenCalledTimes(1)
})

it('useWatchIgnorable fires on mount with immediate: true (renderHook)', async () => {
  const calls: WatchCall[] = []
  let setValue: Dispatch<SetStateAction<number>> = () => {}

  const { act } = await renderHook(() => {
    const [, update] = useWatchIgnorable(7, (next, prev) => calls.push({ value: next, oldValue: prev }), { immediate: true })
    setValue = update
  })

  expect(calls).toEqual([{ value: 7, oldValue: undefined }])

  await act(() => setValue(8))
  expect(calls).toEqual([{ value: 7, oldValue: undefined }, { value: 8, oldValue: 7 }])
})

it('useWatchIgnorable ignores button-driven ignored updates (component)', async () => {
  const calls: number[] = []

  function IgnorableDemo() {
    const [value, setValue, { ignoreUpdates }] = useWatchIgnorable(0, next => calls.push(next))
    return (
      <div>
        <span>{value}</span>
        <button onClick={() => setValue(v => v + 1)}>update</button>
        <button onClick={() => ignoreUpdates(() => setValue(v => v + 1))}>ignored-update</button>
      </div>
    )
  }

  const screen = await render(<IgnorableDemo />)
  expect(calls).toEqual([])

  await screen.getByRole('button', { name: 'update' }).click()
  expect(calls).toEqual([1])

  await screen.getByRole('button', { name: 'ignored-update' }).click()
  expect(calls).toEqual([1])

  await screen.getByRole('button', { name: 'update' }).click()
  expect(calls).toEqual([1, 3])
})
