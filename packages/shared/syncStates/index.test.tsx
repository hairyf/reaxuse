import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { render, renderHook } from 'vitest-browser-react'
import { syncStates } from '../syncStates'

describe('syncStates', () => {
  it('should be defined', () => {
    expect(syncStates).toBeDefined()
  })

  it('should work with array', async () => {
    const target1 = { current: 'bar' }
    const target2 = { current: 'bar2' }

    const { result, act } = await renderHook(() => {
      const [source, setSource] = useState('foo')
      return { stop: syncStates(source, [target1, target2]), setSource }
    })

    // upstream: immediate sync on setup (default `immediate: true`) — here the
    // initial sync runs in the mount effect, i.e. once the hook has rendered
    expect(target1.current).toBe('foo')
    expect(target2.current).toBe('foo')

    // upstream: `source.value = 'bar'` fires the watcher synchronously — in
    // React the new plain value is adopted on the following render
    await act(() => result.current.setSource('bar'))

    expect(target1.current).toBe('bar')
    expect(target2.current).toBe('bar')

    result.current.stop()

    await act(() => result.current.setSource('bar2'))

    expect(target1.current).toBe('bar')
    expect(target2.current).toBe('bar')
  })

  it('should work with non-array', async () => {
    const target = { current: 'bar' }

    const { result, act } = await renderHook(() => {
      const [source, setSource] = useState('foo')
      return { stop: syncStates(source, target), setSource }
    })

    expect(target.current).toBe('foo')

    await act(() => result.current.setSource('bar'))

    expect(target.current).toBe('bar')

    result.current.stop()

    await act(() => result.current.setSource('bar2'))

    expect(target.current).toBe('bar')
  })

  it('does not sync on mount when immediate is false', async () => {
    const target = { current: 'bar' }

    await renderHook(() => syncStates('foo', target, { immediate: false }))

    expect(target.current).toBe('bar')
  })

  it('syncs a later change when immediate is false', async () => {
    const target = { current: 'bar' }

    const { result, act } = await renderHook(() => {
      const [source, setSource] = useState('foo')
      return { stop: syncStates(source, target, { immediate: false }), setSource }
    })

    // nothing on mount
    expect(target.current).toBe('bar')

    // a later source change syncs post-commit
    await act(() => result.current.setSource('baz'))
    expect(target.current).toBe('baz')
  })

  it('returns a stable stop across renders', async () => {
    const target = { current: 'bar' }

    const { result, rerender } = await renderHook(() => syncStates('foo', target))

    const stop = result.current
    await rerender()

    expect(result.current).toBe(stop)
  })

  it('does not clobber targets when an unrelated re-render happens', async () => {
    const target = { current: 'foo' }

    const { rerender } = await renderHook(() => syncStates('foo', target))

    target.current = 'custom'
    await rerender()

    // the source did not change — the target keeps its own value
    expect(target.current).toBe('custom')
  })

  it('accepts ref.current as the source value', async () => {
    const source = { current: 'foo' }
    const target = { current: 'bar' }

    const { result, act } = await renderHook(() => {
      const [, setVersion] = useState(0)
      syncStates(source.current, target)
      return { bump: () => setVersion(version => version + 1) }
    })

    expect(target.current).toBe('foo')

    source.current = 'bar'
    await act(() => result.current.bump())

    expect(target.current).toBe('bar')
  })

  it('syncs a [value, setter] tuple target through its setter', async () => {
    const { result, act } = await renderHook(() => {
      const [source, setSource] = useState('foo')
      const [target, setTarget] = useState('bar')
      const stop = syncStates(source, [target, setTarget])
      return { target, setSource, stop }
    })

    // immediate sync writes through the tuple setter
    await vi.waitFor(() => {
      expect(result.current.target).toBe('foo')
    })

    // a source change propagates through the setter
    await act(() => result.current.setSource('next'))
    await vi.waitFor(() => {
      expect(result.current.target).toBe('next')
    })

    // stop tears the sync down
    result.current.stop()
    await act(() => result.current.setSource('stopped'))
    expect(result.current.target).toBe('next')
  })
})

describe('syncStates (component)', () => {
  function SyncStatesDemo() {
    const [source, setSource] = useState('')
    const [target1, setTarget1] = useState('')
    const [target2, setTarget2] = useState('')

    // ref-like bridges onto the target state — the syncStates effect writes a
    // target's `.current`, which lands in state and re-renders the input
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

    syncStates(source, [target1Ref, target2Ref])

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
    const screen = await render(<SyncStatesDemo />)
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
