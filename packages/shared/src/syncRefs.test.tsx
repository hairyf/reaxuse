import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import { render, renderHook } from 'vitest-browser-react'
import { syncRefs } from './syncRefs'

describe('syncRefs', () => {
  it('should be defined', () => {
    expect(syncRefs).toBeDefined()
  })

  it('should work with array', async () => {
    const source = { current: 'foo' }
    const target1 = { current: 'bar' }
    const target2 = { current: 'bar2' }

    const { result, rerender } = await renderHook(() => syncRefs(source, [target1, target2]))

    // upstream: immediate sync on setup (default `immediate: true`) — here the
    // initial sync runs in the mount effect, i.e. once the hook has rendered
    expect(target1.current).toBe('foo')
    expect(target2.current).toBe('foo')

    // upstream: `source.value = 'bar'` fires the watcher synchronously — in
    // React the mutation is adopted on the following render
    source.current = 'bar'
    await rerender()

    expect(target1.current).toBe('bar')
    expect(target2.current).toBe('bar')

    result.current() // stop

    source.current = 'bar2'
    await rerender()

    expect(target1.current).toBe('bar')
    expect(target2.current).toBe('bar')
  })

  it('should work with non-array', async () => {
    const source = { current: 'foo' }
    const target = { current: 'bar' }

    const { result, rerender } = await renderHook(() => syncRefs(source, target))

    expect(target.current).toBe('foo')

    source.current = 'bar'
    await rerender()

    expect(target.current).toBe('bar')

    result.current()

    source.current = 'bar2'
    await rerender()

    expect(target.current).toBe('bar')
  })

  it('does not sync on mount when immediate is false', async () => {
    const source = { current: 'foo' }
    const target = { current: 'bar' }

    await renderHook(() => syncRefs(source, target, { immediate: false }))

    expect(target.current).toBe('bar')
  })

  it('accepts a getter as the source', async () => {
    let value = 'foo'
    const source = () => value
    const target = { current: 'bar' }

    const { rerender } = await renderHook(() => syncRefs(source, target))

    expect(target.current).toBe('foo')

    value = 'foo2'
    await rerender()

    expect(target.current).toBe('foo2')
  })

  it('does not clobber targets when an unrelated re-render happens', async () => {
    const source = { current: 'foo' }
    const target = { current: 'foo' }

    const { rerender } = await renderHook(() => syncRefs(source, target))

    target.current = 'custom'
    await rerender()

    // the source did not change — the target keeps its own value
    expect(target.current).toBe('custom')
  })
})

describe('syncRefs (component)', () => {
  function SyncRefsDemo() {
    const [source, setSource] = useState('')
    const [target1, setTarget1] = useState('')
    const [target2, setTarget2] = useState('')

    // ref-like bridges onto the state — the syncRefs effect writes a
    // target's `.current`, which lands in state and re-renders the input
    const sourceRef = {
      get current() {
        return source
      },
      set current(value: string) {
        setSource(value)
      },
    }
    const target1Ref = {
      get current() {
        return target1
      },
      set current(value: string) {
        setTarget1(value)
      },
    }
    const target2Ref = {
      get current() {
        return target2
      },
      set current(value: string) {
        setTarget2(value)
      },
    }

    syncRefs(sourceRef, [target1Ref, target2Ref])

    return (
      <div>
        <input
          value={source}
          type="text"
          placeholder="Source"
          onChange={e => setSource(e.target.value)}
        />
        <input
          value={target1}
          type="text"
          placeholder="Target1"
          onChange={e => setTarget1(e.target.value)}
        />
        <input
          value={target2}
          type="text"
          placeholder="Target2"
          onChange={e => setTarget2(e.target.value)}
        />
      </div>
    )
  }

  it('syncs the source input to the target inputs', async () => {
    const screen = await render(<SyncRefsDemo />)
    const sourceInput = screen.getByPlaceholder('Source')
    const target1 = screen.getByPlaceholder('Target1')
    const target2 = screen.getByPlaceholder('Target2')

    await sourceInput.fill('hello')

    // changes propagate to both targets
    await expect.element(target1).toHaveValue('hello')
    await expect.element(target2).toHaveValue('hello')

    // one-way: editing a target does not propagate back to the source
    await target1.fill('custom')

    await expect.element(sourceInput).toHaveValue('hello')
    await expect.element(target2).toHaveValue('hello')

    // a further source edit overwrites the previously edited target
    await sourceInput.fill('world')

    await expect.element(target1).toHaveValue('world')
    await expect.element(target2).toHaveValue('world')
  })
})
