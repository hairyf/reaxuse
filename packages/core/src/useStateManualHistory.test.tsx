import { useState } from 'react'
import { expect, it } from 'vitest'
import { render, renderHook } from 'vitest-browser-react'
import { useStateManualHistory } from './useStateManualHistory'

function ManualHistoryDemo() {
  const [count, setCount] = useState(0)
  const [history, commit, { setSource, undo, redo, canUndo, canRedo }] = useStateManualHistory(count, setCount)

  return (
    <div>
      <span>
        {'Count is '}
        {count}
      </span>
      <button onClick={() => setSource(count + 1)}>Increment</button>
      <button onClick={() => commit()}>Commit</button>
      <button disabled={!canUndo} onClick={() => undo()}>Undo</button>
      <button disabled={!canRedo} onClick={() => redo()}>Redo</button>
      <p>
        {'History records: '}
        {history.length}
      </p>
    </div>
  )
}

it('useStateManualHistory should record', async () => {
  const { result, act } = await renderHook(() => {
    const [v, setV] = useState(0)
    const [history, commit, controls] = useStateManualHistory(v, setV)
    return { history, commit, controls, v }
  })

  expect(result.current.history.length).toBe(1)
  expect(result.current.history[0].snapshot).toBe(0)

  await act(() => {
    result.current.controls.setSource(2)
    result.current.commit()
  })

  expect(result.current.history.length).toBe(2)
  expect(result.current.history[0].snapshot).toBe(2)
  expect(result.current.history[1].snapshot).toBe(0)
})

it('useStateManualHistory should be able to undo and redo', async () => {
  const { result, act } = await renderHook(() => {
    const [v, setV] = useState(0)
    const [history, commit, controls] = useStateManualHistory(v, setV)
    return { history, commit, controls, v }
  })

  expect(result.current.controls.canUndo).toBe(false)
  expect(result.current.controls.canRedo).toBe(false)

  await act(() => {
    result.current.controls.setSource(2)
    result.current.commit()
  })
  await act(() => {
    result.current.controls.setSource(3)
    result.current.commit()
  })
  await act(() => {
    result.current.controls.setSource(4)
    result.current.commit()
  })

  expect(result.current.controls.canUndo).toBe(true)
  expect(result.current.controls.canRedo).toBe(false)

  expect(result.current.v).toBe(4)
  expect(result.current.history.length).toBe(4)
  expect(result.current.controls.last.snapshot).toBe(4)

  await act(() => result.current.controls.undo())

  expect(result.current.controls.canUndo).toBe(true)
  expect(result.current.controls.canRedo).toBe(true)

  expect(result.current.v).toBe(3)
  expect(result.current.controls.last.snapshot).toBe(3)

  await act(() => result.current.controls.undo())
  expect(result.current.v).toBe(2)
  expect(result.current.controls.last.snapshot).toBe(2)

  await act(() => result.current.controls.redo())
  expect(result.current.v).toBe(3)
  expect(result.current.controls.last.snapshot).toBe(3)

  await act(() => result.current.controls.redo())
  expect(result.current.v).toBe(4)
  expect(result.current.controls.last.snapshot).toBe(4)

  expect(result.current.controls.canUndo).toBe(true)
  expect(result.current.controls.canRedo).toBe(false)

  // redo with an empty redoStack is a no-op
  await act(() => result.current.controls.redo())
  expect(result.current.v).toBe(4)
  expect(result.current.controls.last.snapshot).toBe(4)

  await act(() => result.current.controls.clear())
  expect(result.current.controls.canUndo).toBe(false)
  expect(result.current.controls.canRedo).toBe(false)
})

it('useStateManualHistory object with clone', async () => {
  const { result, act } = await renderHook(() => {
    const [v, setV] = useState({ foo: 'bar' })
    const [history, commit, controls] = useStateManualHistory(v, setV, { clone: true })
    return { history, commit, controls, v }
  })

  expect(result.current.history.length).toBe(1)
  expect(result.current.history[0].snapshot.foo).toBe('bar')

  await act(() => {
    // upstream mutates the ref in place (`v.value.foo = 'foo'`); React state
    // is normally replaced, but the physical mutation exercises the same
    // clone-on-snapshot path
    result.current.v.foo = 'foo'
    result.current.commit()
  })

  expect(result.current.history.length).toBe(2)
  expect(result.current.history[0].snapshot.foo).toBe('foo')

  // different references
  expect(result.current.history[1].snapshot.foo).toBe('bar')
  expect(result.current.history[0].snapshot).not.toBe(result.current.history[1].snapshot)

  await act(() => result.current.controls.undo())

  // history references should not be equal to the source
  expect(result.current.history[0].snapshot).not.toBe(result.current.v)
})

it('useStateManualHistory object with clone function', async () => {
  const { result, act } = await renderHook(() => {
    const [v, setV] = useState({ foo: 'bar' })
    const [history, commit, controls] = useStateManualHistory(v, setV, { clone: x => JSON.parse(JSON.stringify(x)) })
    return { history, commit, controls, v }
  })

  expect(result.current.history.length).toBe(1)
  expect(result.current.history[0].snapshot.foo).toBe('bar')

  await act(() => {
    result.current.v.foo = 'foo'
    result.current.commit()
  })

  expect(result.current.history.length).toBe(2)
  expect(result.current.history[0].snapshot.foo).toBe('foo')

  // different references
  expect(result.current.history[1].snapshot.foo).toBe('bar')
  expect(result.current.history[0].snapshot).not.toBe(result.current.history[1].snapshot)

  await act(() => result.current.controls.undo())

  // history references should not be equal to the source
  expect(result.current.history[0].snapshot).not.toBe(result.current.v)
})

it('useStateManualHistory dump + parse', async () => {
  const { result, act } = await renderHook(() => {
    const [v, setV] = useState({ a: 'bar' })
    const [history, commit, controls] = useStateManualHistory(v, setV, {
      dump: value => JSON.stringify(value),
      parse: value => JSON.parse(value) as { a: string },
    })
    return { history, commit, controls, v }
  })

  expect(result.current.history.length).toBe(1)
  expect(result.current.history[0].snapshot).toBe('{"a":"bar"}')

  await act(() => {
    result.current.controls.setSource({ a: 'foo' })
    result.current.commit()
  })

  expect(result.current.history.length).toBe(2)
  expect(result.current.history[0].snapshot).toBe('{"a":"foo"}')
  expect(result.current.history[1].snapshot).toBe('{"a":"bar"}')

  await act(() => result.current.controls.undo())

  expect(result.current.v.a).toBe('bar')
})

it('useStateManualHistory reset', async () => {
  const { result, act } = await renderHook(() => {
    const [v, setV] = useState(0)
    const [history, commit, controls] = useStateManualHistory(v, setV)
    return { history, commit, controls, v }
  })

  expect(result.current.history.length).toBe(1)
  expect(result.current.history[0].snapshot).toBe(0)

  await act(() => {
    result.current.controls.setSource(1)
    result.current.commit()
  })

  await act(() => result.current.controls.setSource(2))

  expect(result.current.history.length).toBe(2)
  expect(result.current.history[0].snapshot).toBe(1)
  expect(result.current.history[1].snapshot).toBe(0)

  await act(() => result.current.controls.reset())

  // v value needs to be the last history point, but history is unchanged
  expect(result.current.v).toBe(1)

  expect(result.current.history.length).toBe(2)
  expect(result.current.history[0].snapshot).toBe(1)
  expect(result.current.history[1].snapshot).toBe(0)

  await act(() => result.current.controls.reset())

  // calling reset twice is a no-op
  expect(result.current.v).toBe(1)

  expect(result.current.history.length).toBe(2)
  expect(result.current.history[1].snapshot).toBe(0)
  expect(result.current.history[0].snapshot).toBe(1)

  // same test, but with a non empty redoStack

  await act(() => {
    result.current.controls.setSource(3)
    result.current.commit()
  })

  await act(() => result.current.controls.undo())

  await act(() => result.current.controls.setSource(2))

  await act(() => result.current.controls.reset())

  expect(result.current.v).toBe(1)

  expect(result.current.controls.undoStack.length).toBe(1)
  expect(result.current.controls.undoStack[0].snapshot).toBe(0)

  expect(result.current.controls.redoStack.length).toBe(1)
  expect(result.current.controls.redoStack[0].snapshot).toBe(3)
})

it('useStateManualHistory capacity limits the undo stack', async () => {
  const { result, act } = await renderHook(() => {
    const [v, setV] = useState(0)
    const [history, commit, controls] = useStateManualHistory(v, setV, { capacity: 2 })
    return { history, commit, controls, v }
  })

  for (const value of [1, 2, 3]) {
    await act(() => {
      result.current.controls.setSource(value)
      result.current.commit()
    })
  }

  // capacity 2 — the undo stack keeps the two newest records only
  expect(result.current.controls.undoStack.map(record => record.snapshot)).toEqual([2, 1])
  expect(result.current.history.length).toBe(3)
  expect(result.current.history[0].snapshot).toBe(3)

  await act(() => result.current.controls.clear())
  expect(result.current.controls.undoStack.length).toBe(0)
})

it('useStateManualHistory records are plain objects (upstream: markRaw)', async () => {
  // upstream asserts `isReactive(record) === false`; records are plain objects
  // by construction in React — there is no reactive proxy to wrap them
  const { result, act } = await renderHook(() => {
    const [v, setV] = useState(0)
    const [history, commit, controls] = useStateManualHistory(v, setV)
    return { history, commit, controls }
  })

  await act(() => {
    result.current.controls.setSource(2)
    result.current.commit()
  })

  for (const record of result.current.history) {
    expect(record.constructor).toBe(Object)
    expect(Object.keys(record).sort()).toEqual(['snapshot', 'timestamp'])
  }
})

it('useStateManualHistory commits a value set with the user\'s own setState (cross render)', async () => {
  const { result, act } = await renderHook(() => {
    const [v, setV] = useState(0)
    const [history, commit, controls] = useStateManualHistory(v, setV)
    return { history, commit, controls, setV }
  })

  await act(() => result.current.setV(5))
  await act(() => result.current.commit())

  expect(result.current.history[0].snapshot).toBe(5)
  expect(result.current.history[1].snapshot).toBe(0)
})

it('useStateManualHistory works in a component (commit → undo → redo)', async () => {
  const screen = await render(<ManualHistoryDemo />)

  await expect.element(screen.getByText('Count is 0')).toBeVisible()
  await expect.element(screen.getByText('History records: 1')).toBeVisible()

  await screen.getByRole('button', { name: 'Increment' }).click()
  await expect.element(screen.getByText('Count is 1')).toBeVisible()
  // not committed yet — the history is unchanged
  await expect.element(screen.getByText('History records: 1')).toBeVisible()

  await screen.getByRole('button', { name: 'Commit' }).click()
  await expect.element(screen.getByText('History records: 2')).toBeVisible()

  await screen.getByRole('button', { name: 'Undo' }).click()
  await expect.element(screen.getByText('Count is 0')).toBeVisible()

  await screen.getByRole('button', { name: 'Redo' }).click()
  await expect.element(screen.getByText('Count is 1')).toBeVisible()
})
