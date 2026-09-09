import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import { render, renderHook } from 'vitest-browser-react'
import { syncRef } from '../syncRef'

describe('syncRef', () => {
  it('should be defined', () => {
    expect(syncRef).toBeDefined()
  })

  it('should work', async () => {
    const a = { current: 'foo' }
    const b = { current: 'bar' }

    const { result, rerender } = await renderHook(() => syncRef(a, b))

    // upstream: immediate sync on setup (default `immediate: true`) — here the
    // initial sync runs in the mount effect, i.e. once the hook has rendered
    expect(b.current).toBe('foo')

    // upstream: `a.value = 'bar'` fires the watcher synchronously — in React
    // the mutation is adopted on the following render
    a.current = 'bar'
    await rerender()

    expect(a.current).toBe('bar')
    expect(b.current).toBe('bar')

    b.current = 'foo'
    await rerender()

    expect(a.current).toBe('foo')
    expect(b.current).toBe('foo')

    result.current() // stop

    a.current = 'bar2'
    await rerender()

    expect(a.current).toBe('bar2')
    expect(b.current).toBe('foo')
  })

  it('works with rtl direction', async () => {
    const left = { current: 'left' }
    const right = { current: 'right' }

    const { rerender } = await renderHook(() => syncRef(left, right, { direction: 'rtl' }))

    expect(left.current).toBe('right')
    expect(right.current).toBe('right')

    // rtl: changing left does not propagate back to right
    left.current = 'bar'
    await rerender()

    expect(left.current).toBe('bar')
    expect(right.current).toBe('right')

    right.current = 'foobar'
    await rerender()

    expect(left.current).toBe('foobar')
    expect(right.current).toBe('foobar')
  })

  it('works with ltr direction', async () => {
    const left = { current: 'left' }
    const right = { current: 'right' }

    const { rerender } = await renderHook(() => syncRef(left, right, { direction: 'ltr' }))

    expect(left.current).toBe('left')
    expect(right.current).toBe('left')

    // ltr: changing right does not propagate back to left
    right.current = 'bar'
    await rerender()

    expect(left.current).toBe('left')
    expect(right.current).toBe('bar')

    left.current = 'foobar'
    await rerender()

    expect(left.current).toBe('foobar')
    expect(right.current).toBe('foobar')
  })

  it('works with mutual convertors', async () => {
    const left = { current: 10 }
    const right = { current: 2 }

    const { rerender } = await renderHook(() => syncRef(left, right, {
      transform: {
        ltr: left => left * 2,
        rtl: right => Math.floor(right / 3),
      },
    }))

    // check immediately sync
    expect(right.current).toBe(20)
    expect(left.current).toBe(6)

    left.current = 30
    await rerender()
    expect(right.current).toBe(60)
    expect(left.current).toBe(30)

    right.current = 10
    await rerender()
    expect(right.current).toBe(10)
    expect(left.current).toBe(3)
  })

  it('works with only rtl convertor', async () => {
    const left = { current: 10 }
    const right = { current: 2 }

    const { rerender } = await renderHook(() => syncRef(left, right, {
      direction: 'rtl',
      transform: {
        rtl: right => Math.round(right / 2),
      },
    }))

    // check immediately sync
    expect(right.current).toBe(2)
    expect(left.current).toBe(1)

    left.current = 10
    await rerender()
    expect(right.current).toBe(2)
    expect(left.current).toBe(10)

    right.current = 10
    await rerender()
    expect(right.current).toBe(10)
    expect(left.current).toBe(5)
  })

  it('does not sync on mount when immediate is false', async () => {
    const a = { current: 'foo' }
    const b = { current: 'bar' }

    const { rerender } = await renderHook(() => syncRef(a, b, { immediate: false }))

    expect(a.current).toBe('foo')
    expect(b.current).toBe('bar')

    a.current = 'baz'
    await rerender()

    expect(a.current).toBe('baz')
    expect(b.current).toBe('baz')
  })
})

describe('syncRef (component)', () => {
  function SyncRefDemo() {
    const [a, setA] = useState('')
    const [b, setB] = useState('')

    // ref-like bridges onto the state — the syncRef effect writes a side's
    // `.current`, which lands in state and re-renders the inputs
    const aRef = {
      get current() {
        return a
      },
      set current(value: string) {
        setA(value)
      },
    }
    const bRef = {
      get current() {
        return b
      },
      set current(value: string) {
        setB(value)
      },
    }

    syncRef(aRef, bRef)

    return (
      <div>
        <input value={a} type="text" placeholder="A" onChange={e => setA(e.target.value)} />
        <input value={b} type="text" placeholder="B" onChange={e => setB(e.target.value)} />
      </div>
    )
  }

  it('syncs both inputs two-way', async () => {
    const screen = await render(<SyncRefDemo />)
    const inputA = screen.getByPlaceholder('A')
    const inputB = screen.getByPlaceholder('B')

    // typing in A propagates to B
    await inputA.fill('hello')
    await expect.element(inputA).toHaveValue('hello')
    await expect.element(inputB).toHaveValue('hello')

    // typing in B propagates back to A (two-way)
    await inputB.fill('world')
    await expect.element(inputB).toHaveValue('world')
    await expect.element(inputA).toHaveValue('world')
  })
})
