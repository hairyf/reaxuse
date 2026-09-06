import type { Dispatch, SetStateAction } from 'react'
import type { IgnoredPrevAsyncUpdates, IgnoredUpdater } from './useWatchIgnorable'
import { useState } from 'react'
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
  let ignoreUpdates: IgnoredUpdater = () => {}

  const { act } = await renderHook(() => {
    const [value, update] = useState(0)
    setValue = update
    ignoreUpdates = useWatchIgnorable(value, (next, prev) => calls.push({ value: next, oldValue: prev })).ignoreUpdates
  })

  expect(calls).toEqual([])

  await act(() => setValue(1))
  expect(calls).toEqual([{ value: 1, oldValue: 0 }])

  await act(() => ignoreUpdates(() => {
    setValue(2)
    setValue(3)
  }))
  expect(calls).toEqual([{ value: 1, oldValue: 0 }])

  // a change made after the updater (in its own committed batch) still fires
  // with the latest value
  await act(() => ignoreUpdates(() => setValue(4)))
  await act(() => setValue(5))
  expect(calls).toEqual([
    { value: 1, oldValue: 0 },
    { value: 5, oldValue: 4 },
  ])
})

it('useWatchIgnorable collapses same-batch changes into the barrier (React batching deviation)', async () => {
  const calls: WatchCall[] = []
  let setValue: Dispatch<SetStateAction<number>> = () => {}
  let ignoreUpdates: IgnoredUpdater = () => {}

  const { act } = await renderHook(() => {
    const [value, update] = useState(0)
    setValue = update
    ignoreUpdates = useWatchIgnorable(value, (next, prev) => calls.push({ value: next, oldValue: prev })).ignoreUpdates
  })

  await act(() => setValue(1))
  expect(calls).toEqual([{ value: 1, oldValue: 0 }])

  // upstream would fire with 5 here; React batches both setStates into a
  // single render and the barrier skips the whole batch
  await act(() => {
    ignoreUpdates(() => setValue(4))
    setValue(5)
  })
  expect(calls).toEqual([{ value: 1, oldValue: 0 }])
})

it('useWatchIgnorable ignores prev async updates (renderHook)', async () => {
  const calls: WatchCall[] = []
  let setValue: Dispatch<SetStateAction<number>> = () => {}
  let ignorePrevAsyncUpdates: IgnoredPrevAsyncUpdates = () => {}

  const { act } = await renderHook(() => {
    const [value, update] = useState(0)
    setValue = update
    ignorePrevAsyncUpdates = useWatchIgnorable(value, (next, prev) => calls.push({ value: next, oldValue: prev })).ignorePrevAsyncUpdates
  })

  await act(() => setValue(1))
  expect(calls).toEqual([{ value: 1, oldValue: 0 }])

  await act(() => {
    setValue(2)
    setValue(3)
    ignorePrevAsyncUpdates()
  })
  expect(calls).toEqual([{ value: 1, oldValue: 0 }])

  // changes queued before the call are ignored, changes after it still fire
  await act(() => {
    setValue(4)
    ignorePrevAsyncUpdates()
  })
  await act(() => setValue(5))
  expect(calls).toEqual([
    { value: 1, oldValue: 0 },
    { value: 5, oldValue: 4 },
  ])
})

it('useWatchIgnorable ignores updates step-by-step (upstream flush:sync test adapted)', async () => {
  const calls: WatchCall[] = []
  let setValue: Dispatch<SetStateAction<number>> = () => {}
  let ignoreUpdates: IgnoredUpdater = () => {}
  let ignorePrevAsyncUpdates: IgnoredPrevAsyncUpdates = () => {}

  const { act } = await renderHook(() => {
    const [value, update] = useState(0)
    setValue = update
    const controls = useWatchIgnorable(value, (next, prev) => calls.push({ value: next, oldValue: prev }))
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
    const [value, update] = useState(0)
    setValue = update
    stop = useWatchIgnorable(value, callback).stop
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
    const [value, update] = useState(7)
    setValue = update
    useWatchIgnorable(value, (next, prev) => calls.push({ value: next, oldValue: prev }), { immediate: true })
  })

  expect(calls).toEqual([{ value: 7, oldValue: undefined }])

  await act(() => setValue(8))
  expect(calls).toEqual([{ value: 7, oldValue: undefined }, { value: 8, oldValue: 7 }])
})

it('useWatchIgnorable ignores button-driven ignored updates (component)', async () => {
  const calls: number[] = []

  function IgnorableDemo() {
    const [source, setSource] = useState(0)
    const { ignoreUpdates } = useWatchIgnorable(source, next => calls.push(next))
    return (
      <div>
        <span>{source}</span>
        <button onClick={() => setSource(v => v + 1)}>update</button>
        <button onClick={() => ignoreUpdates(() => setSource(v => v + 1))}>ignored-update</button>
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
