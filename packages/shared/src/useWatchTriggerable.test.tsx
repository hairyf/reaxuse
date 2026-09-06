import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import { render, renderHook } from 'vitest-browser-react'
import { useWatchTriggerable } from './useWatchTriggerable'

interface WatchCall {
  value: number
  oldValue: number | undefined
}

describe('useWatchTriggerable', () => {
  it('fires the callback when the caller updates their own state', async () => {
    // mirrors upstream `should work`: the callback runs once the change is
    // committed (React's equivalent of upstream's nextTick)
    const calls: WatchCall[] = []
    let setValue: (value: number) => void = () => {}

    const { act } = await renderHook(() => {
      const [value, update] = useState(0)
      setValue = update
      useWatchTriggerable(value, (next, prev) => calls.push({ value: next, oldValue: prev }))
    })

    expect(calls).toEqual([])

    await act(() => setValue(1))
    expect(calls).toEqual([{ value: 1, oldValue: 0 }])
  })

  it('re-fires the callback manually via trigger with the current value', async () => {
    const calls: WatchCall[] = []
    let setValue: (value: number) => void = () => {}

    const { result, act } = await renderHook(() => {
      const [value, update] = useState(0)
      setValue = update
      return useWatchTriggerable(value, (next, prev) => calls.push({ value: next, oldValue: prev }))
    })

    await act(() => setValue(1))
    expect(calls).toEqual([{ value: 1, oldValue: 0 }])

    // trigger is executed immediately — no source change, no commit needed —
    // and the old value is unknown (undefined) as upstream
    await act(() => {
      result.current.trigger()
    })
    expect(calls).toEqual([
      { value: 1, oldValue: 0 },
      { value: 1, oldValue: undefined },
    ])
  })

  it('suppresses the callback for updates made inside ignoreUpdates', async () => {
    const calls: WatchCall[] = []
    let setValue: (value: number) => void = () => {}

    const { result, act } = await renderHook(() => {
      const [value, update] = useState(0)
      setValue = update
      return useWatchTriggerable(value, (next, prev) => calls.push({ value: next, oldValue: prev }))
    })

    await act(() => {
      result.current.ignoreUpdates(() => setValue(1))
    })
    expect(calls).toEqual([])
  })

  it('fires normally again on a change after an ignored one', async () => {
    const calls: WatchCall[] = []
    let setValue: (value: number) => void = () => {}

    const { result, act } = await renderHook(() => {
      const [value, update] = useState(0)
      setValue = update
      return useWatchTriggerable(value, (next, prev) => calls.push({ value: next, oldValue: prev }))
    })

    await act(() => {
      result.current.ignoreUpdates(() => setValue(1))
    })
    expect(calls).toEqual([])

    // the ignore is one-shot — the next genuine change fires again, carrying
    // the value the ignored change left behind as the old value
    await act(() => setValue(2))
    expect(calls).toEqual([{ value: 2, oldValue: 1 }])
  })

  it('disarms the ignore barrier when a commit carries no source change', async () => {
    const calls: number[] = []
    let setValue: (value: number) => void = () => {}
    let setUnrelated: (value: number) => void = () => {}

    const { result, act } = await renderHook(() => {
      const [value, update] = useState(0)
      const [, updateUnrelated] = useState(0)
      setValue = update
      setUnrelated = updateUnrelated
      return useWatchTriggerable(value, next => calls.push(next))
    })

    // an updater that changes nothing observable (an unrelated state) still
    // commits — the barrier is disarmed so it cannot swallow a later change
    await act(() => {
      result.current.ignoreUpdates(() => setUnrelated(1))
    })
    expect(calls).toEqual([])

    await act(() => setValue(1))
    expect(calls).toEqual([1])
  })

  it('cleans up the previous side effect before each new invocation', async () => {
    // mirrors upstream `should work` onCleanup semantics: the cleanup
    // registered with the previous value runs before the next invocation —
    // watch-fired or manual
    const calls: WatchCall[] = []
    const cleanups: number[] = []
    let setValue: (value: number) => void = () => {}

    const { result, act } = await renderHook(() => {
      const [value, update] = useState(0)
      setValue = update
      return useWatchTriggerable(value, (next, prev, onCleanup) => {
        onCleanup(() => cleanups.push(next))
        calls.push({ value: next, oldValue: prev })
      })
    })

    await act(() => setValue(1))
    expect(calls).toEqual([{ value: 1, oldValue: 0 }])
    expect(cleanups).toEqual([])

    await act(() => setValue(2))
    expect(calls).toEqual([
      { value: 1, oldValue: 0 },
      { value: 2, oldValue: 1 },
    ])
    expect(cleanups).toEqual([1])

    // trigger is executed immediately — the pending cleanup (value 2) runs first
    await act(() => {
      result.current.trigger()
    })
    expect(calls).toEqual([
      { value: 1, oldValue: 0 },
      { value: 2, oldValue: 1 },
      { value: 2, oldValue: undefined },
    ])
    expect(cleanups).toEqual([1, 2])
  })

  it('supports array sources (renderHook)', async () => {
    // mirrors upstream `source array`: trigger first, then a batched change
    const calls: Array<{ value: readonly [number, string], oldValue: readonly [number, string] | undefined }> = []
    let setCount: (value: number) => void = () => {}
    let setName: (value: string) => void = () => {}

    const { result, act } = await renderHook(() => {
      const [count, updateCount] = useState(0)
      const [name, updateName] = useState('a')
      setCount = updateCount
      setName = updateName
      return useWatchTriggerable([count, name] as const, (value, oldValue) => calls.push({ value, oldValue }))
    })

    await act(() => {
      result.current.trigger()
    })
    expect(calls).toEqual([{ value: [0, 'a'], oldValue: undefined }])

    // changes made in one batch collapse into a single committed call
    await act(() => {
      setCount(1)
      setName('b')
    })
    expect(calls).toEqual([
      { value: [0, 'a'], oldValue: undefined },
      { value: [1, 'b'], oldValue: [0, 'a'] },
    ])
  })

  it('returns the callback result from trigger so async work can be awaited', async () => {
    // mirrors upstream `trigger should await`
    const effects: number[] = []

    const { result, act } = await renderHook(() => {
      const [value] = useState(1)
      return useWatchTriggerable(value, async (next) => {
        await new Promise(resolve => setTimeout(resolve, 10))
        effects.push(next)
        return next
      })
    })

    await act(async () => {
      const returned = await result.current.trigger()
      expect(returned).toBe(1)
    })
    expect(effects).toEqual([1])
  })

  it('fires on mount with immediate: true and keeps trigger working', async () => {
    const calls: WatchCall[] = []
    let setValue: (value: number) => void = () => {}

    const { result, act } = await renderHook(() => {
      const [value, update] = useState(7)
      setValue = update
      return useWatchTriggerable(value, (next, prev) => calls.push({ value: next, oldValue: prev }), { immediate: true })
    })

    expect(calls).toEqual([{ value: 7, oldValue: undefined }])

    await act(() => setValue(8))
    expect(calls).toEqual([
      { value: 7, oldValue: undefined },
      { value: 8, oldValue: 7 },
    ])

    await act(() => {
      result.current.trigger()
    })
    expect(calls).toEqual([
      { value: 7, oldValue: undefined },
      { value: 8, oldValue: 7 },
      { value: 8, oldValue: undefined },
    ])
  })
})

describe('useWatchTriggerable (component)', () => {
  function UseWatchTriggerableDemo() {
    const [count, setCount] = useState(0)
    const [log, setLog] = useState<string[]>([])

    const { trigger, ignoreUpdates } = useWatchTriggerable(count, (value) => {
      setLog(logs => [...logs, `changed:${value}`])
    })

    return (
      <div>
        <p>
          Count:
          {' '}
          {count}
        </p>
        <p>
          Log:
          {' '}
          {log.join(',')}
        </p>
        <button onClick={() => setCount(count + 1)}>update</button>
        <button onClick={() => ignoreUpdates(() => setCount(0))}>reset-ignored</button>
        <button onClick={() => trigger()}>manual-trigger</button>
      </div>
    )
  }

  it('supports manual triggering and ignoring updates in a component', async () => {
    const screen = await render(<UseWatchTriggerableDemo />)
    const update = screen.getByRole('button', { name: 'update' })

    // a normal change fires the callback
    await update.click()
    await expect.element(screen.getByText('Log: changed:1')).toBeVisible()

    // an ignored change does not
    await screen.getByRole('button', { name: 'reset-ignored' }).click()
    await expect.element(screen.getByText('Count: 0')).toBeVisible()
    await expect.element(screen.getByText('Log: changed:1')).toBeVisible()

    // trigger re-fires manually with the current value (0 after the reset)
    await screen.getByRole('button', { name: 'manual-trigger' }).click()
    await expect.element(screen.getByText('Log: changed:1,changed:0')).toBeVisible()

    // a change after an ignored one fires normally again
    await update.click()
    await expect.element(screen.getByText('Log: changed:1,changed:0,changed:1')).toBeVisible()
  })
})
