import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { render, renderHook } from 'vitest-browser-react'
import { useWatchOnce } from './useWatchOnce'

describe('useWatchOnce', () => {
  it('should work', async () => {
    // mirrored from upstream `watchOnce`: the callback fires exactly once on
    // the first change and is never invoked afterwards
    const spy = vi.fn()
    let setValue: (value: number) => void = () => {}

    const { act } = await renderHook(() => {
      const [value, update] = useState(0)
      setValue = update
      useWatchOnce(value, spy)
    })

    expect(spy).not.toBeCalled()

    await act(() => setValue(1))
    expect(spy).toBeCalledTimes(1)
    expect(spy).toHaveBeenCalledWith(1, 0)

    await act(() => setValue(2))
    expect(spy).toBeCalledTimes(1)
  })

  it('never fires again after the once call, over multiple further changes (renderHook)', async () => {
    const calls: Array<{ value: number, oldValue: number | undefined }> = []
    let setValue: (value: number) => void = () => {}

    const { act } = await renderHook(() => {
      const [value, update] = useState(0)
      setValue = update
      useWatchOnce(value, (next, prev) => calls.push({ value: next, oldValue: prev }))
    })

    await act(() => setValue(1))
    await act(() => setValue(2))
    await act(() => setValue(3))

    expect(calls).toEqual([{ value: 1, oldValue: 0 }])
  })

  it('counts the immediate call toward the once (renderHook)', async () => {
    const calls: Array<{ value: number, oldValue: number | undefined }> = []
    let setValue: (value: number) => void = () => {}

    const { act } = await renderHook(() => {
      const [value, update] = useState(7)
      setValue = update
      useWatchOnce(value, (next, prev) => calls.push({ value: next, oldValue: prev }), { immediate: true })
    })

    expect(calls).toEqual([{ value: 7, oldValue: undefined }])

    await act(() => setValue(8))
    expect(calls).toEqual([{ value: 7, oldValue: undefined }])
  })

  it('supports array sources and stops after the first element change (component)', async () => {
    const calls: Array<{ value: [number, string], oldValue: [number, string] | undefined }> = []

    function ArrayOnceDemo() {
      const [count, setCount] = useState(0)
      const [name, setName] = useState('a')
      useWatchOnce([count, name] as const, (value, oldValue) => calls.push({ value, oldValue }))
      return (
        <div>
          <button onClick={() => setCount(count + 1)}>bump-count</button>
          <button onClick={() => setName(`${name}!`)}>bump-name</button>
        </div>
      )
    }

    const screen = await render(<ArrayOnceDemo />)

    await screen.getByRole('button', { name: 'bump-count' }).click()
    expect(calls).toEqual([{ value: [1, 'a'], oldValue: [0, 'a'] }])

    // the watcher already fired once — a later change to another element is ignored
    await screen.getByRole('button', { name: 'bump-name' }).click()
    expect(calls).toEqual([{ value: [1, 'a'], oldValue: [0, 'a'] }])
  })
})
