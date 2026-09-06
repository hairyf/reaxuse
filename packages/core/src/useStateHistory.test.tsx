import { useState } from 'react'
import { expect, it } from 'vitest'
import { render, renderHook } from 'vitest-browser-react'
import { useStateHistory } from './useStateHistory'

function HistoryDemo() {
  const [count, setCount] = useState(0)
  const [history, undo, redo, { canUndo, canRedo, setSource }] = useStateHistory(count, setCount, { capacity: 10 })

  return (
    <div>
      <span>
        {'Count is '}
        {count}
      </span>
      <button onClick={() => setSource(count + 1)}>Increment</button>
      <button onClick={() => setSource(count - 1)}>Decrement</button>
      <button disabled={!canUndo} onClick={() => undo()}>Undo</button>
      <button disabled={!canRedo} onClick={() => redo()}>Redo</button>
      <p>
        {'History records: '}
        {history.length}
      </p>
      <p>
        {'Newest: '}
        {history[0].snapshot}
      </p>
    </div>
  )
}

it('useStateHistory should record every change', async () => {
  // mirrors upstream `should record` — upstream covers `flush: 'sync'` and
  // `flush: 'pre'`; React commits through a single effect timing
  const { result, act } = await renderHook(() => {
    const [v, setV] = useState(0)
    const [history, undo, redo, controls] = useStateHistory(v, setV)
    return { history, undo, redo, controls, v, setV }
  })

  expect(result.current.history.length).toBe(1)
  expect(result.current.history[0].snapshot).toBe(0)

  await act(() => result.current.setV(2))

  expect(result.current.history.length).toBe(2)
  expect(result.current.history[0].snapshot).toBe(2)
  expect(result.current.history[1].snapshot).toBe(0)
})

it('useStateHistory auto-batches same-tick updates into a single commit', async () => {
  // mirrors upstream `pre: auto batching` — same-tick writes render once and
  // collapse into a single commit carrying the final value
  const { result, act } = await renderHook(() => {
    const [v, setV] = useState(0)
    const [history, undo, redo, controls] = useStateHistory(v, setV)
    return { history, undo, redo, controls, v, setV }
  })

  expect(result.current.history.length).toBe(1)
  expect(result.current.history[0].snapshot).toBe(0)

  await act(() => result.current.setV(1))

  expect(result.current.history.length).toBe(2)

  await act(() => {
    result.current.setV(v => v + 1)
    result.current.setV(v => v + 1)
  })

  expect(result.current.history.length).toBe(3)
  expect(result.current.history[0].snapshot).toBe(3)
  expect(result.current.history[1].snapshot).toBe(1)
})

it('useStateHistory should be able to undo and redo', async () => {
  const { result, act } = await renderHook(() => {
    const [v, setV] = useState(0)
    const [history, undo, redo, controls] = useStateHistory(v, setV)
    return { history, undo, redo, controls, v, setV }
  })

  expect(result.current.controls.canUndo).toBe(false)
  expect(result.current.controls.canRedo).toBe(false)

  await act(() => result.current.setV(2))
  await act(() => result.current.setV(3))
  await act(() => result.current.setV(4))

  expect(result.current.controls.canUndo).toBe(true)
  expect(result.current.controls.canRedo).toBe(false)

  expect(result.current.v).toBe(4)
  expect(result.current.history.length).toBe(4)
  expect(result.current.controls.last.snapshot).toBe(4)

  await act(() => result.current.undo())

  expect(result.current.controls.canUndo).toBe(true)
  expect(result.current.controls.canRedo).toBe(true)

  expect(result.current.v).toBe(3)
  expect(result.current.controls.last.snapshot).toBe(3)

  await act(() => result.current.undo())
  expect(result.current.v).toBe(2)
  expect(result.current.controls.last.snapshot).toBe(2)

  await act(() => result.current.redo())
  expect(result.current.v).toBe(3)
  expect(result.current.controls.last.snapshot).toBe(3)

  await act(() => result.current.redo())
  expect(result.current.v).toBe(4)
  expect(result.current.controls.last.snapshot).toBe(4)

  expect(result.current.controls.canUndo).toBe(true)
  expect(result.current.controls.canRedo).toBe(false)

  // redoing past the newest record is a no-op
  await act(() => result.current.redo())
  expect(result.current.v).toBe(4)
  expect(result.current.controls.last.snapshot).toBe(4)

  await act(() => result.current.controls.clear())

  expect(result.current.controls.canUndo).toBe(false)
  expect(result.current.controls.canRedo).toBe(false)
})

it('useStateHistory object with clone', async () => {
  // mirrors upstream `object with deep` — deep watching does not apply to
  // React; the clone-on-snapshot path is exercised via a physical mutation
  // plus a manual commit (a mutated state does not re-render on its own)
  const { result, act } = await renderHook(() => {
    const [v, setV] = useState({ foo: 'bar' })
    const [history, undo, redo, controls] = useStateHistory(v, setV, { clone: true })
    return { history, undo, redo, controls, v }
  })

  expect(result.current.history.length).toBe(1)
  expect(result.current.history[0].snapshot.foo).toBe('bar')

  await act(() => {
    result.current.v.foo = 'foo'
    result.current.controls.commit()
  })

  expect(result.current.history.length).toBe(2)
  expect(result.current.history[0].snapshot.foo).toBe('foo')

  // different references
  expect(result.current.history[1].snapshot.foo).toBe('bar')
  expect(result.current.history[0].snapshot).not.toBe(result.current.history[1].snapshot)

  await act(() => result.current.undo())

  // history references should not be equal to the source
  expect(result.current.v.foo).toBe('bar')
  expect(result.current.history[0].snapshot).not.toBe(result.current.v)
})

it('useStateHistory dump + parse', async () => {
  const { result, act } = await renderHook(() => {
    const [v, setV] = useState({ a: 'bar' })
    const [history, undo, redo, controls] = useStateHistory(v, setV, {
      dump: value => JSON.stringify(value),
      parse: value => JSON.parse(value) as { a: string },
    })
    return { history, undo, redo, controls, v }
  })

  expect(result.current.history.length).toBe(1)
  expect(result.current.history[0].snapshot).toBe('{"a":"bar"}')

  await act(() => result.current.controls.setSource({ a: 'foo' }))

  expect(result.current.history.length).toBe(2)
  expect(result.current.history[0].snapshot).toBe('{"a":"foo"}')
  expect(result.current.history[1].snapshot).toBe('{"a":"bar"}')

  await act(() => result.current.undo())

  expect(result.current.v.a).toBe('bar')
})

it('useStateHistory commit() records the current value and swallows the pending effect', async () => {
  const dumps: number[] = []
  const { result, act } = await renderHook(() => {
    const [v, setV] = useState(0)
    const [history, undo, redo, controls] = useStateHistory(v, setV, {
      dump: (value) => {
        dumps.push(value)
        return value
      },
    })
    return { history, undo, redo, controls, v, setV }
  })

  expect(result.current.history.length).toBe(1)
  expect(result.current.history[0].snapshot).toBe(0)

  // mirrors upstream `commit` — a manual commit on an unchanged value
  // duplicates the current record
  await act(() => result.current.controls.commit())

  expect(result.current.history.length).toBe(2)
  expect(result.current.history[0].snapshot).toBe(0)
  expect(result.current.history[1].snapshot).toBe(0)

  // mirrors upstream `pre: commit`: undo, replace the value and commit in the
  // same tick — the manual commit wins and the effect run carrying the same
  // value must not record it again
  await act(() => result.current.undo())
  expect(result.current.history.length).toBe(1)

  await act(() => {
    result.current.controls.setSource(2)
    result.current.controls.commit()
  })

  expect(result.current.v).toBe(2)
  expect(result.current.history.length).toBe(2)
  expect(result.current.history[0].snapshot).toBe(2)
  expect(result.current.history[1].snapshot).toBe(0)
  // initial record + the duplicated manual commit record + the final commit
  expect(dumps).toEqual([0, 0, 2])
})

it('useStateHistory without batch records one commit per change', async () => {
  const { result, act } = await renderHook(() => {
    const [v, setV] = useState({ foo: 1, bar: 'one' })
    const [history, undo, redo, controls] = useStateHistory(v, setV, { clone: true })
    return { history, undo, redo, controls, v }
  })

  expect(result.current.history.length).toBe(1)
  expect(result.current.history[0].snapshot).toEqual({ foo: 1, bar: 'one' })

  await act(() => result.current.controls.setSource({ ...result.current.v, foo: 2 }))
  await act(() => result.current.controls.setSource({ ...result.current.v, bar: 'two' }))

  expect(result.current.history.length).toBe(3)
  expect(result.current.history[0].snapshot).toEqual({ foo: 2, bar: 'two' })
  expect(result.current.history[1].snapshot).toEqual({ foo: 2, bar: 'one' })
  expect(result.current.history[2].snapshot).toEqual({ foo: 1, bar: 'one' })
})

it('useStateHistory batch records a single commit and cancel leaves the value unrecorded', async () => {
  const dumps: Array<{ foo: number, bar: string }> = []
  const { result, act } = await renderHook(() => {
    const [v, setV] = useState({ foo: 1, bar: 'one' })
    const [history, undo, redo, controls] = useStateHistory(v, setV, {
      clone: true,
      dump: (value) => {
        dumps.push(value)
        return value
      },
    })
    return { history, undo, redo, controls, v }
  })

  expect(result.current.history.length).toBe(1)
  expect(result.current.history[0].snapshot).toEqual({ foo: 1, bar: 'one' })
  expect(dumps).toEqual([{ foo: 1, bar: 'one' }])

  await act(() => {
    result.current.controls.batch(() => {
      result.current.controls.setSource({ foo: 2, bar: 'one' })
      result.current.controls.setSource({ foo: 2, bar: 'two' })
    })
  })

  expect(result.current.history.length).toBe(2)
  expect(result.current.history[0].snapshot).toEqual({ foo: 2, bar: 'two' })
  expect(result.current.history[1].snapshot).toEqual({ foo: 1, bar: 'one' })
  expect(dumps).toEqual([{ foo: 1, bar: 'one' }, { foo: 2, bar: 'two' }])

  await act(() => {
    result.current.controls.batch((cancel) => {
      result.current.controls.setSource({ foo: 3, bar: 'three' })
      cancel()
    })
  })

  expect(result.current.v).toEqual({ foo: 3, bar: 'three' })
  expect(result.current.history.length).toBe(2)
  expect(dumps).toEqual([{ foo: 1, bar: 'one' }, { foo: 2, bar: 'two' }])

  // the next change records normally
  await act(() => result.current.controls.setSource({ foo: 4, bar: 'four' }))

  expect(result.current.history.length).toBe(3)
  expect(result.current.history[0].snapshot).toEqual({ foo: 4, bar: 'four' })
})

it('useStateHistory pause and resume', async () => {
  const dumps: number[] = []
  const { result, act } = await renderHook(() => {
    const [v, setV] = useState(1)
    const [history, undo, redo, controls] = useStateHistory(v, setV, {
      dump: (value) => {
        dumps.push(value)
        return value
      },
    })
    return { history, undo, redo, controls, v, setV }
  })

  expect(result.current.history.length).toBe(1)
  expect(result.current.history[0].snapshot).toBe(1)
  expect(result.current.controls.isTracking).toBe(true)

  await act(() => result.current.controls.pause())
  expect(result.current.controls.isTracking).toBe(false)

  // changes made while paused are not recorded
  await act(() => result.current.setV(2))

  expect(result.current.history.length).toBe(1)
  expect(result.current.controls.last.snapshot).toBe(1)

  await act(() => result.current.controls.resume())

  expect(result.current.controls.isTracking).toBe(true)
  expect(result.current.history.length).toBe(1)

  await act(() => result.current.setV(3))

  expect(result.current.history.length).toBe(2)
  expect(result.current.history[0].snapshot).toBe(3)
  expect(result.current.controls.last.snapshot).toBe(3)

  await act(() => result.current.controls.pause())
  await act(() => result.current.setV(4))
  await act(() => result.current.controls.resume(true))

  // resume(true) commits the current value immediately
  expect(result.current.v).toBe(4)
  expect(result.current.history.length).toBe(3)
  expect(result.current.controls.last.snapshot).toBe(4)
  expect(dumps).toEqual([1, 3, 4])
})

it('useStateHistory reset', async () => {
  const { result, act } = await renderHook(() => {
    const [v, setV] = useState(0)
    const [history, undo, redo, controls] = useStateHistory(v, setV)
    return { history, undo, redo, controls, v, setV }
  })

  expect(result.current.history.length).toBe(1)
  expect(result.current.history[0].snapshot).toBe(0)

  await act(() => result.current.setV(1))

  expect(result.current.history.length).toBe(2)

  await act(() => result.current.controls.pause())

  await act(() => result.current.setV(2))

  expect(result.current.history.length).toBe(2)
  expect(result.current.history[0].snapshot).toBe(1)
  expect(result.current.history[1].snapshot).toBe(0)

  await act(() => result.current.controls.reset())

  // v value needs to be the last history point, but history is unchanged
  expect(result.current.v).toBe(1)

  expect(result.current.history.length).toBe(2)
  expect(result.current.history[0].snapshot).toBe(1)
  expect(result.current.history[1].snapshot).toBe(0)

  // calling reset twice is a no-op
  await act(() => result.current.controls.reset())

  expect(result.current.v).toBe(1)
  expect(result.current.history.length).toBe(2)

  // same test, but with a non empty redoStack
  await act(() => {
    result.current.controls.setSource(3)
    result.current.controls.commit()
  })

  await act(() => result.current.undo())

  expect(result.current.v).toBe(1)

  await act(() => result.current.setV(2))

  await act(() => result.current.controls.reset())

  expect(result.current.v).toBe(1)

  expect(result.current.controls.undoStack.length).toBe(1)
  expect(result.current.controls.undoStack[0].snapshot).toBe(0)

  expect(result.current.controls.redoStack.length).toBe(1)
  expect(result.current.controls.redoStack[0].snapshot).toBe(3)
})

it('useStateHistory should respect shouldCommit option', async () => {
  const { result, act } = await renderHook(() => {
    const [v, setV] = useState(0)
    const [history, undo, redo, controls] = useStateHistory(v, setV, {
      shouldCommit: (oldValue: number, newValue: number) => newValue > 0,
    })
    return { history, undo, redo, controls, v, setV }
  })

  expect(result.current.history.length).toBe(1)
  expect(result.current.history[0].snapshot).toBe(0)

  await act(() => result.current.setV(-1))
  expect(result.current.history.length).toBe(1)

  await act(() => result.current.setV(2))
  expect(result.current.history.length).toBe(2)
  expect(result.current.history[0].snapshot).toBe(2)

  await act(() => result.current.setV(-3))
  expect(result.current.history.length).toBe(2)

  await act(() => result.current.setV(4))
  expect(result.current.history.length).toBe(3)
  expect(result.current.history[0].snapshot).toBe(4)
})

it('useStateHistory capacity limits the undo stack', async () => {
  const { result, act } = await renderHook(() => {
    const [v, setV] = useState(0)
    const [history, undo, redo, controls] = useStateHistory(v, setV, { capacity: 2 })
    return { history, undo, redo, controls, v, setV }
  })

  for (const value of [1, 2, 3]) {
    await act(() => result.current.controls.setSource(value))
  }

  // capacity 2 — the undo stack keeps the two newest records only
  expect(result.current.controls.undoStack.map(record => record.snapshot)).toEqual([2, 1])
  expect(result.current.history.length).toBe(3)
  expect(result.current.history[0].snapshot).toBe(3)

  await act(() => result.current.controls.clear())
  expect(result.current.controls.undoStack.length).toBe(0)
})

it('useStateHistory does not record on mount', async () => {
  const dumps: number[] = []
  await renderHook(() => {
    const [v, setV] = useState(0)
    const [history, undo, redo, controls] = useStateHistory(v, setV, {
      dump: (value) => {
        dumps.push(value)
        return value
      },
    })
    return { history, undo, redo, controls, v }
  })

  expect(dumps).toEqual([0])
})

it('useStateHistory stops recording after unmount (upstream: dispose)', async () => {
  const dumps: number[] = []
  const { result, act, unmount } = await renderHook(() => {
    const [v, setV] = useState(0)
    const [history, undo, redo, controls] = useStateHistory(v, setV, {
      dump: (value) => {
        dumps.push(value)
        return value
      },
    })
    return { history, undo, redo, controls, v, setV }
  })

  await act(() => result.current.setV(1))
  await act(() => result.current.setV(2))

  expect(result.current.history.map(record => record.snapshot)).toEqual([2, 1, 0])

  await unmount()

  // give any stray asynchronous commit a chance to fire — none must
  await new Promise(resolve => setTimeout(resolve, 50))

  expect(dumps).toEqual([0, 1, 2])
})

it('useStateHistory works in a component (record + undo + redo)', async () => {
  const screen = await render(<HistoryDemo />)

  await expect.element(screen.getByText('Count is 0')).toBeVisible()
  await expect.element(screen.getByText('History records: 1')).toBeVisible()

  await screen.getByRole('button', { name: 'Increment' }).click()
  await screen.getByRole('button', { name: 'Increment' }).click()
  await expect.element(screen.getByText('Count is 2')).toBeVisible()
  await expect.element(screen.getByText('History records: 3')).toBeVisible()
  await expect.element(screen.getByText('Newest: 2')).toBeVisible()

  await screen.getByRole('button', { name: 'Undo' }).click()
  await expect.element(screen.getByText('Count is 1')).toBeVisible()

  await screen.getByRole('button', { name: 'Redo' }).click()
  await expect.element(screen.getByText('Count is 2')).toBeVisible()
})
