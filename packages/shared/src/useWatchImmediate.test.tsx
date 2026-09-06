import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { render, renderHook } from 'vitest-browser-react'
import { useWatchImmediate } from './useWatchImmediate'

describe('useWatchImmediate', () => {
  it('should watch twice, once for immediate and one for value change', async () => {
    let currentRun = 1
    const spy = vi.fn((valUpdate: string) => {
      if (currentRun === 1)
        expect(valUpdate).toEqual('vue-use')

      if (currentRun >= 2)
        expect(valUpdate).toEqual('VueUse')

      currentRun++
    })
    let setValue: (value: string) => void = () => {}

    const { act } = await renderHook(() => {
      const [value, update] = useState('vue-use')
      setValue = update
      useWatchImmediate(value, spy)
    })

    await act(() => setValue('VueUse'))
    expect(spy).toBeCalledTimes(2)
  })

  it('fires on mount with the current value and (value, oldValue) on change (component)', async () => {
    const calls: Array<{ value: number, oldValue: number | undefined }> = []

    function ImmediateDemo() {
      const [count, setCount] = useState(7)
      useWatchImmediate(count, (value, oldValue) => calls.push({ value, oldValue }))
      return <button onClick={() => setCount(count + 1)}>increment</button>
    }

    const screen = await render(<ImmediateDemo />)
    expect(calls).toEqual([{ value: 7, oldValue: undefined }])

    await screen.getByRole('button', { name: 'increment' }).click()
    expect(calls).toEqual([{ value: 7, oldValue: undefined }, { value: 8, oldValue: 7 }])
  })

  it('supports array sources and fires immediately with the current tuple', async () => {
    const calls: Array<{ value: [number, string], oldValue: [number, string] | undefined }> = []
    let bump: () => void = () => {}

    const { act } = await renderHook(() => {
      const [count, setCount] = useState(0)
      const [name] = useState('a')
      bump = () => setCount(count + 1)
      useWatchImmediate([count, name] as const, (value, oldValue) => calls.push({ value, oldValue }))
    })

    expect(calls).toEqual([{ value: [0, 'a'], oldValue: undefined }])

    await act(() => bump())
    expect(calls).toEqual([
      { value: [0, 'a'], oldValue: undefined },
      { value: [1, 'a'], oldValue: [0, 'a'] },
    ])
  })

  it('fires exactly once on mount — unrelated re-renders do not re-fire', async () => {
    const calls: Array<{ value: string, unrelated: number }> = []

    function UnrelatedDemo() {
      const [value] = useState('vue-use')
      const [unrelated, setUnrelated] = useState(0)
      useWatchImmediate(value, updated => calls.push({ value: updated, unrelated }))
      return <button onClick={() => setUnrelated(unrelated + 1)}>bump-unrelated</button>
    }

    const screen = await render(<UnrelatedDemo />)
    expect(calls).toEqual([{ value: 'vue-use', unrelated: 0 }])

    await screen.getByRole('button', { name: 'bump-unrelated' }).click()
    expect(calls).toEqual([{ value: 'vue-use', unrelated: 0 }])
  })
})
