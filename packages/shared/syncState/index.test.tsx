import type { SyncStateOptions, SyncStateTransform } from '../syncState'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { render, renderHook } from 'vitest-browser-react'
import { syncState } from '../syncState'

// type-level helpers (upstream imports these from @type-challenges/utils,
// which reaxuse does not depend on)
type Equal<X, Y> = (<T>() => T extends X ? 1 : 2) extends (<T>() => T extends Y ? 1 : 2) ? true : false
type Expect<T extends true> = T

describe('syncState', () => {
  it('should be defined', () => {
    expect(syncState).toBeDefined()
  })

  it('should work', async () => {
    const a = { current: 'foo' }
    const b = { current: 'bar' }

    const { result, rerender } = await renderHook(() => syncState(a, b))

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

    const { rerender } = await renderHook(() => syncState(left, right, { direction: 'rtl' }))

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

    const { rerender } = await renderHook(() => syncState(left, right, { direction: 'ltr' }))

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

    const { rerender } = await renderHook(() => syncState(left, right, {
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

    const { rerender } = await renderHook(() => syncState(left, right, {
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

    const { rerender } = await renderHook(() => syncState(a, b, { immediate: false }))

    expect(a.current).toBe('foo')
    expect(b.current).toBe('bar')

    a.current = 'baz'
    await rerender()

    expect(a.current).toBe('baz')
    expect(b.current).toBe('baz')
  })

  it('syncs a [value, setter] tuple side two-way', async () => {
    const left = { current: 'left' }
    const { result, rerender } = await renderHook(() => {
      const [right, setRight] = useState('right')
      const stop = syncState(left, [right, setRight])
      return { right, setRight, stop }
    })

    // immediate sync: left → tuple side (through the setter)
    await vi.waitFor(() => {
      expect(result.current.right).toBe('left')
    })
    expect(left.current).toBe('left')

    // external left change propagates into the tuple side
    left.current = 'from-left'
    await rerender()
    await vi.waitFor(() => {
      expect(result.current.right).toBe('from-left')
    })

    // setter-driven change propagates back into the ref-like left side
    result.current.setRight('from-right')
    await rerender()
    expect(left.current).toBe('from-right')

    // stop tears the sync down
    result.current.stop()
    left.current = 'stopped'
    await rerender()
    expect(result.current.right).toBe('from-right')
  })

  it('syncs a { value, onChange } pair and propagates value changes back', async () => {
    const left = { current: 'left' }
    const onChange = vi.fn()
    const { result, rerender } = await renderHook(
      ({ value }: { value: string } = { value: 'right' }) => {
        const stop = syncState(left, { value, onChange })
        return { stop }
      },
      { initialProps: { value: 'right' } },
    )

    // immediate sync publishes through onChange
    await vi.waitFor(() => {
      expect(onChange).toHaveBeenCalledWith('left')
    })
    expect(left.current).toBe('left')

    // a left-side change publishes through onChange
    left.current = 'from-left'
    await rerender({ value: 'right' })
    await vi.waitFor(() => {
      expect(onChange).toHaveBeenLastCalledWith('from-left')
    })
    expect(left.current).toBe('from-left')

    // a changed `value` prop propagates back to the left side
    await rerender({ value: 'from-pair' })
    expect(left.current).toBe('from-pair')

    // stop tears the sync down — no further onChange calls
    result.current.stop()
    const callsAfterStop = onChange.mock.calls.length
    left.current = 'stopped'
    await rerender({ value: 'from-pair' })
    expect(onChange).toHaveBeenCalledTimes(callsAfterStop)
  })

  it('treats a plain-value side as read-only', async () => {
    const plain = 'static'
    const target = { current: 'target' }
    const { rerender } = await renderHook(() => syncState(plain, target))

    // immediate sync: plain → target
    expect(target.current).toBe('static')

    // the plain side has no write path — a target change never writes back
    target.current = 'changed'
    await rerender()
    expect(target.current).toBe('changed')

    // and a later re-render does not clobber the target with the stale plain
    // value (the read-only side is not recorded as written)
    await rerender()
    expect(target.current).toBe('changed')
  })

  it('should type check the transform contract', () => {
    /* eslint-disable ts/no-unused-expressions */
    // upstream makes `transform` required when L and R are unrelated; the
    // reaxuse port intentionally keeps it unconditionally `Partial` (a missing
    // convertor falls back to identity) — assert that looser contract here
    type L = number
    type R = string

    'test' as any as Expect<Equal<SyncStateTransform<L, R>, {
      ltr: (left: L) => R
      rtl: (right: R) => L
    }>>

    'test' as any as Expect<Equal<SyncStateOptions<L, R>['transform'], Partial<SyncStateTransform<L, R>> | undefined>>

    // a fully-specified transform is assignable
    const full: SyncStateOptions<L, R> = {
      transform: {
        ltr: left => String(left * 2),
        rtl: right => right.length,
      },
    }
    full satisfies SyncStateOptions<L, R>

    // a Partial transform (one convertor missing) is assignable too
    const partial: SyncStateOptions<L, R> = {
      transform: {
        rtl: right => right.length,
      },
    }
    partial satisfies SyncStateOptions<L, R>
    /* eslint-enable ts/no-unused-expressions */
  })
})

describe('syncState (component)', () => {
  function SyncStateDemo() {
    const [a, setA] = useState('')
    const [b, setB] = useState('')

    // ref-like bridges onto the state — the syncState effect writes a side's
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

    syncState(aRef, bRef)

    return (
      <div>
        <input value={a} type="text" placeholder="A" onChange={e => setA(e.target.value)} />
        <input value={b} type="text" placeholder="B" onChange={e => setB(e.target.value)} />
      </div>
    )
  }

  it('syncs both inputs two-way', async () => {
    const screen = await render(<SyncStateDemo />)
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
