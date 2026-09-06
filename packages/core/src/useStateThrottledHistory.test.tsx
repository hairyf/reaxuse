import { useState } from 'react'
import { expect, it } from 'vitest'
import { render, renderHook } from 'vitest-browser-react'
import { useStateThrottledHistory } from './useStateThrottledHistory'

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

function ThrottledHistoryDemo() {
  const [count, setCount] = useState(0)
  const [history, undo, redo, { canUndo, canRedo }] = useStateThrottledHistory(count, setCount, { throttle: 500 })

  return (
    <div>
      <span>
        {'Count is '}
        {count}
      </span>
      <button onClick={() => setCount(count + 1)}>Increment</button>
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

it('useStateThrottledHistory should take the first snapshot right after the change and the second after the given time', async () => {
  // mirrors upstream `take first snapshot right after data was changed and
  // second after given time` (throttle: 10, here 100 with real timers)
  const { result, act } = await renderHook(() => {
    const [v, setV] = useState(0)
    const [history, undo, redo, controls] = useStateThrottledHistory(v, setV, { throttle: 100 })
    return { history, undo, redo, controls, v, setV }
  })

  expect(result.current.history.length).toBe(1)
  expect(result.current.history[0].snapshot).toBe(0)

  // the first change after a quiet window commits immediately (leading edge)
  await act(() => result.current.setV(100))

  expect(result.current.history.length).toBe(2)
  expect(result.current.history[0].snapshot).toBe(100)

  // a burst inside the window collapses into a single trailing commit
  await act(() => {
    result.current.setV(200)
    result.current.setV(300)
    result.current.setV(400)
  })

  await expect.poll(() => result.current.history.length).toBe(3)
  expect(result.current.history.map(record => record.snapshot)).toEqual([400, 100, 0])
})

it('useStateThrottledHistory collapses rapid setSource calls into a single trailing commit', async () => {
  const dumps: number[] = []
  const { result, act } = await renderHook(() => {
    const [v, setV] = useState(0)
    const [history, undo, redo, controls] = useStateThrottledHistory(v, setV, {
      throttle: 100,
      dump: (value) => {
        dumps.push(value)
        return value
      },
    })
    return { history, undo, redo, controls, v, setV }
  })

  await act(() => {
    result.current.controls.setSource(1)
    result.current.controls.setSource(2)
    result.current.controls.setSource(3)
  })

  await expect.poll(() => result.current.history.map(record => record.snapshot)).toEqual([3, 0])
  expect(dumps).toEqual([0, 3])
})

it('useStateThrottledHistory should be able to undo and redo across throttle boundaries', async () => {
  const dumps: number[] = []
  const { result, act } = await renderHook(() => {
    const [v, setV] = useState(0)
    const [history, undo, redo, controls] = useStateThrottledHistory(v, setV, {
      throttle: 300,
      dump: (value) => {
        dumps.push(value)
        return value
      },
    })
    return { history, undo, redo, controls, v, setV }
  })

  await act(() => result.current.setV(1))
  expect(result.current.history.map(record => record.snapshot)).toEqual([1, 0])

  await wait(350)

  await act(() => result.current.setV(2))
  expect(result.current.history.map(record => record.snapshot)).toEqual([2, 1, 0])

  // a change inside the window schedules a trailing commit
  await act(() => result.current.setV(3))

  // undoing during the window restores the previous record and supersedes the
  // pending trailing commit — no duplicate record lands when the window ends
  await act(() => result.current.undo())

  expect(result.current.v).toBe(1)
  expect(result.current.history.map(record => record.snapshot)).toEqual([1, 0])
  expect(result.current.controls.canUndo).toBe(true)
  expect(result.current.controls.canRedo).toBe(true)

  await wait(400)

  expect(result.current.history.map(record => record.snapshot)).toEqual([1, 0])
  expect(dumps).toEqual([0, 1, 2])

  await act(() => result.current.redo())

  expect(result.current.v).toBe(2)
  expect(result.current.history.map(record => record.snapshot)).toEqual([2, 1, 0])
  expect(result.current.controls.canRedo).toBe(false)

  await wait(350)

  await act(() => result.current.setV(4))

  expect(result.current.v).toBe(4)
  expect(result.current.history.map(record => record.snapshot)).toEqual([4, 2, 1, 0])
  expect(dumps).toEqual([0, 1, 2, 4])
})

it('useStateThrottledHistory commit() forces a record and swallows the pending effect', async () => {
  const dumps: number[] = []
  const { result, act } = await renderHook(() => {
    const [v, setV] = useState(0)
    const [history, undo, redo, controls] = useStateThrottledHistory(v, setV, {
      throttle: 300,
      dump: (value) => {
        dumps.push(value)
        return value
      },
    })
    return { history, undo, redo, controls, v, setV }
  })

  await act(() => {
    result.current.controls.setSource(5)
    result.current.controls.commit()
  })

  expect(result.current.history.map(record => record.snapshot)).toEqual([5, 0])

  await wait(400)

  // the effect carrying the already-committed value must not record again
  expect(result.current.history.map(record => record.snapshot)).toEqual([5, 0])
  expect(dumps).toEqual([0, 5])

  await act(() => result.current.setV(7))

  expect(result.current.history.map(record => record.snapshot)).toEqual([7, 5, 0])
  expect(dumps).toEqual([0, 5, 7])
})

it('useStateThrottledHistory pause and resume', async () => {
  const dumps: number[] = []
  const { result, act } = await renderHook(() => {
    const [v, setV] = useState(0)
    const [history, undo, redo, controls] = useStateThrottledHistory(v, setV, {
      throttle: 100,
      dump: (value) => {
        dumps.push(value)
        return value
      },
    })
    return { history, undo, redo, controls, v, setV }
  })

  expect(result.current.controls.canUndo).toBeTypeOf('boolean')
  expect(result.current.controls.canRedo).toBeTypeOf('boolean')
  expect(result.current.controls.isTracking).toBeTypeOf('boolean')
  expect(result.current.controls.canUndo).toBe(false)
  expect(result.current.controls.canRedo).toBe(false)
  expect(result.current.controls.isTracking).toBe(true)

  await act(() => result.current.controls.pause())
  expect(result.current.controls.isTracking).toBe(false)

  // changes made while paused are not recorded
  await act(() => result.current.setV(1))
  await wait(150)

  expect(result.current.history.length).toBe(1)
  expect(dumps).toEqual([0])

  await act(() => result.current.controls.resume())
  expect(result.current.controls.isTracking).toBe(true)
  expect(result.current.history.length).toBe(1)

  await act(() => result.current.setV(2))

  expect(result.current.history.map(record => record.snapshot)).toEqual([2, 0])

  await act(() => result.current.controls.pause())
  await act(() => result.current.setV(3))
  await act(() => result.current.controls.resume(true))

  // resume(true) commits the current value immediately
  expect(result.current.v).toBe(3)
  expect(result.current.history.map(record => record.snapshot)).toEqual([3, 2, 0])
  expect(dumps).toEqual([0, 2, 3])
})

it('useStateThrottledHistory clear cancels the pending trailing commit', async () => {
  const dumps: number[] = []
  const { result, act } = await renderHook(() => {
    const [v, setV] = useState(0)
    const [history, undo, redo, controls] = useStateThrottledHistory(v, setV, {
      throttle: 300,
      dump: (value) => {
        dumps.push(value)
        return value
      },
    })
    return { history, undo, redo, controls, v, setV }
  })

  await act(() => result.current.setV(1))
  expect(result.current.history.length).toBe(2)

  await act(() => result.current.setV(2))
  await act(() => result.current.controls.clear())

  expect(result.current.controls.canUndo).toBe(false)
  expect(result.current.controls.canRedo).toBe(false)
  expect(result.current.history.length).toBe(1)

  await wait(400)

  expect(result.current.history.length).toBe(1)
  expect(dumps).toEqual([0, 1])
})

it('useStateThrottledHistory does not record on mount', async () => {
  const dumps: number[] = []
  const { result } = await renderHook(() => {
    const [v, setV] = useState(0)
    const [history, undo, redo, controls] = useStateThrottledHistory(v, setV, {
      throttle: 100,
      dump: (value) => {
        dumps.push(value)
        return value
      },
    })
    return { history, undo, redo, controls, v, setV }
  })

  await wait(150)

  expect(result.current.history.length).toBe(1)
  expect(dumps).toEqual([0])
})

it('useStateThrottledHistory cancels the pending trailing commit on unmount', async () => {
  const dumps: number[] = []
  const { result, act, unmount } = await renderHook(() => {
    const [v, setV] = useState(0)
    const [history, undo, redo, controls] = useStateThrottledHistory(v, setV, {
      throttle: 300,
      dump: (value) => {
        dumps.push(value)
        return value
      },
    })
    return { history, undo, redo, controls, v, setV }
  })

  await act(() => result.current.setV(1))
  expect(dumps).toEqual([0, 1])

  await act(() => result.current.setV(2))
  await unmount()

  await wait(400)

  expect(dumps).toEqual([0, 1])
})

it('useStateThrottledHistory object with clone', async () => {
  const { result, act } = await renderHook(() => {
    const [v, setV] = useState({ foo: 'bar' })
    const [history, undo, redo, controls] = useStateThrottledHistory(v, setV, { throttle: 0, clone: true })
    return { history, undo, redo, controls, v }
  })

  expect(result.current.history.length).toBe(1)
  expect(result.current.history[0].snapshot.foo).toBe('bar')

  await act(() => {
    // upstream mutates the ref in place (`v.value.foo = 'foo'`); React state
    // is normally replaced, but the physical mutation exercises the same
    // clone-on-snapshot path
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

it('useStateThrottledHistory dump + parse', async () => {
  const { result, act } = await renderHook(() => {
    const [v, setV] = useState({ a: 'bar' })
    const [history, undo, redo, controls] = useStateThrottledHistory(v, setV, {
      throttle: 0,
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

it('useStateThrottledHistory capacity limits the undo stack', async () => {
  const { result, act } = await renderHook(() => {
    const [v, setV] = useState(0)
    const [history, undo, redo, controls] = useStateThrottledHistory(v, setV, { throttle: 0, capacity: 2 })
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

it('useStateThrottledHistory reset supersedes the pending trailing commit', async () => {
  const dumps: number[] = []
  const { result, act } = await renderHook(() => {
    const [v, setV] = useState(0)
    const [history, undo, redo, controls] = useStateThrottledHistory(v, setV, {
      throttle: 300,
      dump: (value) => {
        dumps.push(value)
        return value
      },
    })
    return { history, undo, redo, controls, v, setV }
  })

  await act(() => result.current.setV(1))
  expect(result.current.history.map(record => record.snapshot)).toEqual([1, 0])

  await wait(350)

  await act(() => result.current.setV(2))
  expect(result.current.history.map(record => record.snapshot)).toEqual([2, 1, 0])

  // a change inside the window schedules a trailing commit
  await act(() => result.current.setV(3))

  await act(() => result.current.controls.reset())

  // v value needs to be the last history point, but history is unchanged
  expect(result.current.v).toBe(2)
  expect(result.current.history.map(record => record.snapshot)).toEqual([2, 1, 0])

  await wait(400)

  expect(result.current.history.map(record => record.snapshot)).toEqual([2, 1, 0])
  expect(dumps).toEqual([0, 1, 2])
})

it('useStateThrottledHistory batch records a single commit and cancel leaves the value unrecorded', async () => {
  const dumps: number[] = []
  const { result, act } = await renderHook(() => {
    const [v, setV] = useState(0)
    const [history, undo, redo, controls] = useStateThrottledHistory(v, setV, {
      throttle: 300,
      dump: (value) => {
        dumps.push(value)
        return value
      },
    })
    return { history, undo, redo, controls, v, setV }
  })

  await act(() => {
    result.current.controls.batch(() => {
      result.current.controls.setSource(1)
      result.current.controls.setSource(2)
      result.current.controls.setSource(3)
    })
  })

  expect(result.current.history.map(record => record.snapshot)).toEqual([3, 0])
  expect(dumps).toEqual([0, 3])

  await wait(400)

  // the effect carrying the batch-committed value must not record again
  expect(result.current.history.map(record => record.snapshot)).toEqual([3, 0])

  await act(() => {
    result.current.controls.batch((cancel) => {
      result.current.controls.setSource(4)
      cancel()
    })
  })

  expect(result.current.v).toBe(4)
  expect(result.current.history.map(record => record.snapshot)).toEqual([3, 0])

  await wait(400)

  expect(result.current.history.map(record => record.snapshot)).toEqual([3, 0])
  expect(dumps).toEqual([0, 3])

  await act(() => result.current.controls.setSource(5))

  expect(result.current.history.map(record => record.snapshot)).toEqual([5, 3, 0])
  expect(dumps).toEqual([0, 3, 5])
})

it('useStateThrottledHistory works in a component (leading + trailing burst + undo)', async () => {
  const screen = await render(<ThrottledHistoryDemo />)

  await expect.element(screen.getByText('Count is 0')).toBeVisible()
  await expect.element(screen.getByText('History records: 1')).toBeVisible()

  // first click commits immediately on the leading edge
  await screen.getByRole('button', { name: 'Increment' }).click()
  await expect.element(screen.getByText('Count is 1')).toBeVisible()
  await expect.element(screen.getByText('History records: 2')).toBeVisible()

  // the burst collapses into a single trailing commit with the latest value
  await screen.getByRole('button', { name: 'Increment' }).click()
  await screen.getByRole('button', { name: 'Increment' }).click()
  await expect.element(screen.getByText('Count is 3')).toBeVisible()
  await expect.element(screen.getByText('History records: 3')).toBeVisible()
  await expect.element(screen.getByText('Newest: 3')).toBeVisible()

  await screen.getByRole('button', { name: 'Undo' }).click()
  await expect.element(screen.getByText('Count is 1')).toBeVisible()

  await screen.getByRole('button', { name: 'Redo' }).click()
  await expect.element(screen.getByText('Count is 3')).toBeVisible()
})
