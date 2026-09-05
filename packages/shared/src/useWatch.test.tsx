import { useState } from 'react'
import { expect, it } from 'vitest'
import { render, renderHook } from 'vitest-browser-react'
import { useWatch } from './useWatch'

interface WatchCall {
  value: number
  oldValue: number | undefined
}

function WatchDemo({ onWatch }: { onWatch: (call: WatchCall) => void }) {
  const [count, setCount] = useState(0)
  useWatch(count, (value, oldValue) => onWatch({ value, oldValue }))
  return <button onClick={() => setCount(count + 1)}>increment</button>
}

it('useWatch does not fire on mount and fires with (value, oldValue) on change (component)', async () => {
  const calls: WatchCall[] = []
  const screen = await render(<WatchDemo onWatch={call => calls.push(call)} />)

  expect(calls).toEqual([])

  await screen.getByRole('button', { name: 'increment' }).click()
  expect(calls).toEqual([{ value: 1, oldValue: 0 }])

  await screen.getByRole('button', { name: 'increment' }).click()
  expect(calls).toEqual([{ value: 1, oldValue: 0 }, { value: 2, oldValue: 1 }])
})

it('useWatch fires on mount with immediate: true (component)', async () => {
  const calls: WatchCall[] = []

  function ImmediateDemo() {
    const [count, setCount] = useState(7)
    useWatch(count, (value, oldValue) => calls.push({ value, oldValue }), { immediate: true })
    return <button onClick={() => setCount(count + 1)}>increment</button>
  }

  const screen = await render(<ImmediateDemo />)
  expect(calls).toEqual([{ value: 7, oldValue: undefined }])

  await screen.getByRole('button', { name: 'increment' }).click()
  expect(calls).toEqual([{ value: 7, oldValue: undefined }, { value: 8, oldValue: 7 }])
})

it('useWatch supports array sources and only fires when an element changes (component)', async () => {
  const calls: Array<{ value: [number, string], oldValue: [number, string] | undefined }> = []

  function ArrayWatchDemo() {
    const [count, setCount] = useState(0)
    const [name, setName] = useState('a')
    const [unrelated, setUnrelated] = useState(0)
    useWatch([count, name] as const, (value, oldValue) => calls.push({ value, oldValue }))
    return (
      <div>
        <button onClick={() => setCount(count + 1)}>bump-count</button>
        <button onClick={() => setName(`${name}!`)}>bump-name</button>
        <button onClick={() => setUnrelated(unrelated + 1)}>bump-unrelated</button>
      </div>
    )
  }

  const screen = await render(<ArrayWatchDemo />)
  expect(calls).toEqual([])

  await screen.getByRole('button', { name: 'bump-count' }).click()
  expect(calls).toEqual([{ value: [1, 'a'], oldValue: [0, 'a'] }])

  await screen.getByRole('button', { name: 'bump-name' }).click()
  expect(calls).toEqual([
    { value: [1, 'a'], oldValue: [0, 'a'] },
    { value: [1, 'a!'], oldValue: [1, 'a'] },
  ])

  // An unrelated state change must not re-fire the watch.
  await screen.getByRole('button', { name: 'bump-unrelated' }).click()
  expect(calls).toEqual([
    { value: [1, 'a'], oldValue: [0, 'a'] },
    { value: [1, 'a!'], oldValue: [1, 'a'] },
  ])
})

it('useWatch does not fire on mount and fires on change (renderHook)', async () => {
  const calls: WatchCall[] = []
  let setValue: (value: number) => void = () => {}

  const { act } = await renderHook(() => {
    const [value, update] = useState(0)
    setValue = update
    useWatch(value, (next, prev) => calls.push({ value: next, oldValue: prev }))
  })

  expect(calls).toEqual([])

  await act(() => setValue(5))
  expect(calls).toEqual([{ value: 5, oldValue: 0 }])

  await act(() => setValue(9))
  expect(calls).toEqual([{ value: 5, oldValue: 0 }, { value: 9, oldValue: 5 }])
})

it('useWatch stops watching after unmount (renderHook)', async () => {
  const calls: WatchCall[] = []
  let setValue: (value: number) => void = () => {}

  const { act, unmount } = await renderHook(() => {
    const [value, update] = useState(0)
    setValue = update
    useWatch(value, (next, prev) => calls.push({ value: next, oldValue: prev }))
  })

  await act(() => setValue(1))
  expect(calls).toEqual([{ value: 1, oldValue: 0 }])

  await unmount()

  await act(() => setValue(2))
  expect(calls).toEqual([{ value: 1, oldValue: 0 }])
})
