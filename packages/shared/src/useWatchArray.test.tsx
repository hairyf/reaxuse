import type { Dispatch, SetStateAction } from 'react'
import { useState } from 'react'
import { expect, it } from 'vitest'
import { render, renderHook } from 'vitest-browser-react'
import { useWatchArray } from './useWatchArray'

interface ArrayWatchCall {
  newList: number[]
  oldList: number[] | undefined
  added: number[]
  removed: number[] | undefined
}

async function renderListWatch(calls: ArrayWatchCall[]) {
  let setList: Dispatch<SetStateAction<number[]>> = () => {}
  const { act } = await renderHook(() => {
    const [list, update] = useState([1, 2, 3])
    setList = update
    useWatchArray(list, (newList, oldList, added, removed) =>
      calls.push({ newList, oldList, added, removed }))
  })
  return { act, setList }
}

it('useWatchArray reports added and removed items when two lists are different (renderHook)', async () => {
  const calls: ArrayWatchCall[] = []
  const { act, setList } = await renderListWatch(calls)

  expect(calls).toEqual([])

  await act(() => setList([1, 1, 4]))
  expect(calls).toEqual([
    { newList: [1, 1, 4], oldList: [1, 2, 3], added: [1, 4], removed: [2, 3] },
  ])
})

it('useWatchArray works when two lists are identical (renderHook)', async () => {
  const calls: ArrayWatchCall[] = []
  const { act, setList } = await renderListWatch(calls)

  await act(() => setList([1, 2, 3]))
  expect(calls).toEqual([
    { newList: [1, 2, 3], oldList: [1, 2, 3], added: [], removed: [] },
  ])
})

it('useWatchArray works with list push (renderHook)', async () => {
  const calls: ArrayWatchCall[] = []
  const { act, setList } = await renderListWatch(calls)

  await act(() => setList(prev => [...prev, 4]))
  expect(calls).toEqual([
    { newList: [1, 2, 3, 4], oldList: [1, 2, 3], added: [4], removed: [] },
  ])
})

it('useWatchArray works with list splice (renderHook)', async () => {
  const calls: ArrayWatchCall[] = []
  const { act, setList } = await renderListWatch(calls)

  await act(() => setList((prev) => {
    const next = [...prev]
    next.splice(1, 1, 5, 6, 7)
    return next
  }))
  expect(calls).toEqual([
    { newList: [1, 5, 6, 7, 3], oldList: [1, 2, 3], added: [5, 6, 7], removed: [2] },
  ])
})

it('useWatchArray fires on mount with immediate: true (renderHook)', async () => {
  const calls: ArrayWatchCall[] = []
  let setList: Dispatch<SetStateAction<number[]>> = () => {}

  const { act } = await renderHook(() => {
    const [list, update] = useState([1, 2, 3])
    setList = update
    useWatchArray(list, (newList, oldList, added, removed) =>
      calls.push({ newList, oldList, added, removed }), { immediate: true })
  })

  expect(calls).toEqual([
    { newList: [1, 2, 3], oldList: [], added: [1, 2, 3], removed: [] },
  ])

  await act(() => setList(prev => [...prev, 4]))
  expect(calls).toEqual([
    { newList: [1, 2, 3], oldList: [], added: [1, 2, 3], removed: [] },
    { newList: [1, 2, 3, 4], oldList: [1, 2, 3], added: [4], removed: [] },
  ])
})

it('useWatchArray re-fires on list changes and ignores unrelated state (component)', async () => {
  const calls: ArrayWatchCall[] = []

  function ArrayWatchDemo({ onWatch }: { onWatch: (call: ArrayWatchCall) => void }) {
    const [list, setList] = useState([1, 2, 3])
    const [unrelated, setUnrelated] = useState(0)
    useWatchArray(list, (newList, oldList, added, removed) =>
      onWatch({ newList, oldList, added, removed }))
    return (
      <div>
        <button onClick={() => setList(prev => [...prev, prev.length + 1])}>push</button>
        <button onClick={() => setUnrelated(unrelated + 1)}>bump-unrelated</button>
      </div>
    )
  }

  const screen = await render(<ArrayWatchDemo onWatch={call => calls.push(call)} />)
  expect(calls).toEqual([])

  await screen.getByRole('button', { name: 'push' }).click()
  expect(calls).toEqual([
    { newList: [1, 2, 3, 4], oldList: [1, 2, 3], added: [4], removed: [] },
  ])

  await screen.getByRole('button', { name: 'push' }).click()
  expect(calls).toEqual([
    { newList: [1, 2, 3, 4], oldList: [1, 2, 3], added: [4], removed: [] },
    { newList: [1, 2, 3, 4, 5], oldList: [1, 2, 3, 4], added: [5], removed: [] },
  ])

  // An unrelated state change must not re-fire the watch.
  await screen.getByRole('button', { name: 'bump-unrelated' }).click()
  expect(calls).toEqual([
    { newList: [1, 2, 3, 4], oldList: [1, 2, 3], added: [4], removed: [] },
    { newList: [1, 2, 3, 4, 5], oldList: [1, 2, 3, 4], added: [5], removed: [] },
  ])
})
