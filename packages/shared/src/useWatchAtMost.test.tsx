import type { UseWatchAtMostReturn } from './useWatchAtMost'
import { useState } from 'react'
import { expect, it } from 'vitest'
import { render, renderHook } from 'vitest-browser-react'
import { useWatchAtMost } from './useWatchAtMost'

interface WatchCall {
  value: number
  oldValue: number | undefined
}

it('useWatchAtMost fires the callback at most `count` times and re-renders `count` (component)', async () => {
  const calls: WatchCall[] = []
  let latest: UseWatchAtMostReturn | undefined

  function AtMostDemo() {
    const [count, setCount] = useState(0)
    latest = useWatchAtMost(count, (value, oldValue) => calls.push({ value, oldValue }), { count: 2 })
    return <button onClick={() => setCount(count + 1)}>increment</button>
  }

  const screen = await render(<AtMostDemo />)
  expect(calls).toEqual([])
  expect(latest?.count).toBe(0)

  await screen.getByRole('button', { name: 'increment' }).click()
  expect(latest?.count).toBe(1)

  await screen.getByRole('button', { name: 'increment' }).click()
  await screen.getByRole('button', { name: 'increment' }).click()

  expect(calls).toEqual([
    { value: 1, oldValue: 0 },
    { value: 2, oldValue: 1 },
  ])
  expect(latest?.count).toBe(2)
})

it('useWatchAtMost ignores further source changes after the limit is reached (renderHook)', async () => {
  const calls: WatchCall[] = []
  let setValue: (value: number) => void = () => {}

  const { act } = await renderHook(() => {
    const [value, update] = useState(0)
    setValue = update
    useWatchAtMost(value, (next, prev) => calls.push({ value: next, oldValue: prev }), { count: 2 })
  })

  await act(() => setValue(1))
  await act(() => setValue(2))
  await act(() => setValue(3))
  await act(() => setValue(4))

  expect(calls).toEqual([
    { value: 1, oldValue: 0 },
    { value: 2, oldValue: 1 },
  ])
})

it('useWatchAtMost stops early when `stop` is called before the limit (renderHook)', async () => {
  const calls: WatchCall[] = []
  let setValue: (value: number) => void = () => {}
  let stop: () => void = () => {}

  const { act } = await renderHook(() => {
    const [value, update] = useState(0)
    setValue = update
    stop = useWatchAtMost(value, (next, prev) => calls.push({ value: next, oldValue: prev }), { count: 3 }).stop
  })

  await act(() => setValue(1))
  await act(() => stop())
  await act(() => setValue(2))

  expect(calls).toEqual([{ value: 1, oldValue: 0 }])
})

it('useWatchAtMost counts the `immediate` call toward the limit (renderHook)', async () => {
  const calls: WatchCall[] = []
  let setValue: (value: number) => void = () => {}

  const { act } = await renderHook(() => {
    const [value, update] = useState(7)
    setValue = update
    useWatchAtMost(value, (next, prev) => calls.push({ value: next, oldValue: prev }), { count: 1, immediate: true })
  })

  expect(calls).toEqual([{ value: 7, oldValue: undefined }])

  await act(() => setValue(8))
  expect(calls).toEqual([{ value: 7, oldValue: undefined }])
})

it('useWatchAtMost supports array sources (component)', async () => {
  const calls: Array<{ value: [number, string], oldValue: [number, string] | undefined }> = []

  function ArrayAtMostDemo() {
    const [count, setCount] = useState(0)
    const [name, setName] = useState('a')
    useWatchAtMost([count, name] as const, (value, oldValue) => calls.push({ value, oldValue }), { count: 1 })
    return (
      <div>
        <button onClick={() => setCount(count + 1)}>bump-count</button>
        <button onClick={() => setName(`${name}!`)}>bump-name</button>
      </div>
    )
  }

  const screen = await render(<ArrayAtMostDemo />)

  await screen.getByRole('button', { name: 'bump-count' }).click()
  expect(calls).toEqual([{ value: [1, 'a'], oldValue: [0, 'a'] }])

  // the limit was already reached — a later change to another element is ignored
  await screen.getByRole('button', { name: 'bump-name' }).click()
  expect(calls).toEqual([{ value: [1, 'a'], oldValue: [0, 'a'] }])
})
