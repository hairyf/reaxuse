import type { DatabaseReference, DataSnapshot, Unsubscribe } from 'firebase/database'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, renderHook } from 'vitest-browser-react'
import { useRTDB } from '../useRTDB'

// Mock the runtime module (not the types): `useRTDB` only imports `onValue`
// from `firebase/database`, so no network/database is ever touched.
const { onValueMock } = vi.hoisted(() => ({ onValueMock: vi.fn() }))

vi.mock('firebase/database', () => ({ onValue: onValueMock }))

type SnapshotCallback = (snapshot: DataSnapshot) => void
type ErrorCallback = (err: Error) => void

// fake `DatabaseReference` built at the test boundary only (a real app passes
// `ref(getDatabase(app), 'todos')`); the implementation itself has no cast.
function fakeRef(path: string): DatabaseReference {
  return { path } as any
}

function fakeSnapshot(value: unknown): DataSnapshot {
  return { val: () => value } as any
}

function snapshotCallback(call: number): SnapshotCallback {
  return onValueMock.mock.calls[call][1] as SnapshotCallback
}

function errorCallback(call: number): ErrorCallback {
  return onValueMock.mock.calls[call][2] as ErrorCallback
}

function TodosDemo({ docRef }: { docRef: DatabaseReference }) {
  const [todos, setTodos] = useRTDB<Record<string, string>>(docRef)
  return (
    <div>
      <span data-testid="todos">{todos ? Object.keys(todos).join(',') : 'none'}</span>
      <button onClick={() => setTodos({ local: 'yes' })}>set local</button>
    </div>
  )
}

describe('useRTDB', () => {
  beforeEach(() => {
    onValueMock.mockReset()
  })

  it('starts with undefined data and subscribes once', async () => {
    onValueMock.mockReturnValue(vi.fn<() => void>())

    const { result } = await renderHook(() => useRTDB<Record<string, string>>(fakeRef('todos')))

    expect(result.current[0]).toBeUndefined()
    expect(onValueMock).toHaveBeenCalledTimes(1)
    expect(onValueMock.mock.calls[0][0]).toMatchObject({ path: 'todos' })
  })

  it('updates data with snapshot.val() and re-renders', async () => {
    onValueMock.mockReturnValue(vi.fn<() => void>())

    const docRef = fakeRef('todos')
    const { result, act } = await renderHook(() => useRTDB<Record<string, { title: string }>>(docRef))

    expect(result.current[0]).toBeUndefined()

    await act(() => {
      snapshotCallback(0)(fakeSnapshot({ a: { title: 'first' } }))
    })
    expect(result.current[0]).toEqual({ a: { title: 'first' } })

    await act(() => {
      snapshotCallback(0)(fakeSnapshot({ a: { title: 'first' }, b: { title: 'second' } }))
    })
    expect(result.current[0]).toEqual({ a: { title: 'first' }, b: { title: 'second' } })
  })

  it('invokes a custom errorHandler from the error callback', async () => {
    onValueMock.mockReturnValue(vi.fn<() => void>())

    const errorHandler = vi.fn<(err: Error) => void>()
    await renderHook(() => useRTDB(fakeRef('todos'), { errorHandler }))

    const err = new Error('permission denied')
    errorCallback(0)(err)

    expect(errorHandler).toHaveBeenCalledTimes(1)
    expect(errorHandler).toHaveBeenCalledWith(err)
  })

  it('logs through console.error by default', async () => {
    onValueMock.mockReturnValue(vi.fn<() => void>())

    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    try {
      await renderHook(() => useRTDB(fakeRef('todos')))

      const err = new Error('database offline')
      errorCallback(0)(err)

      expect(consoleError).toHaveBeenCalledWith(err)
    }
    finally {
      consoleError.mockRestore()
    }
  })

  it('unsubscribes on unmount by default', async () => {
    const off = vi.fn<Unsubscribe>()
    onValueMock.mockReturnValue(off)

    const { unmount } = await renderHook(() => useRTDB(fakeRef('todos')))

    expect(off).not.toHaveBeenCalled()
    await unmount()
    expect(off).toHaveBeenCalledTimes(1)
  })

  it('keeps the subscription when autoDispose is false (upstream parity, leaks)', async () => {
    const off = vi.fn<Unsubscribe>()
    onValueMock.mockReturnValue(off)

    const { unmount } = await renderHook(() => useRTDB(fakeRef('todos'), { autoDispose: false }))

    await unmount()
    expect(off).not.toHaveBeenCalled()
  })

  it('re-subscribes when docRef changes and unsubscribes the previous listener', async () => {
    const firstOff = vi.fn<Unsubscribe>()
    const secondOff = vi.fn<Unsubscribe>()
    onValueMock.mockReturnValueOnce(firstOff).mockReturnValueOnce(secondOff)

    const firstRef = fakeRef('todos/first')
    const secondRef = fakeRef('todos/second')

    const { rerender } = await renderHook(
      ({ docRef }: { docRef: DatabaseReference } = { docRef: firstRef }) => useRTDB<Record<string, string>>(docRef),
      { initialProps: { docRef: firstRef } },
    )

    expect(onValueMock).toHaveBeenCalledTimes(1)

    await rerender({ docRef: secondRef })

    expect(onValueMock).toHaveBeenCalledTimes(2)
    expect(onValueMock.mock.calls[1][0]).toBe(secondRef)
    expect(firstOff).toHaveBeenCalledTimes(1)
    expect(secondOff).not.toHaveBeenCalled()

    await rerender({ docRef: secondRef })
    expect(onValueMock).toHaveBeenCalledTimes(2)
  })

  it('uses the latest errorHandler without re-subscribing', async () => {
    onValueMock.mockReturnValue(vi.fn<() => void>())

    const first = vi.fn<(err: Error) => void>()
    const second = vi.fn<(err: Error) => void>()
    const docRef = fakeRef('todos')

    const { rerender } = await renderHook(
      ({ errorHandler }: { errorHandler: (err: Error) => void } = { errorHandler: first }) => useRTDB(docRef, { errorHandler }),
      { initialProps: { errorHandler: first } },
    )

    expect(onValueMock).toHaveBeenCalledTimes(1)

    await rerender({ errorHandler: second })
    expect(onValueMock).toHaveBeenCalledTimes(1)

    const err = new Error('offline')
    errorCallback(0)(err)

    expect(first).not.toHaveBeenCalled()
    expect(second).toHaveBeenCalledWith(err)
  })

  it('setData updates local state only — it never writes to the database', async () => {
    onValueMock.mockReturnValue(vi.fn<() => void>())

    const screen = await render(<TodosDemo docRef={fakeRef('todos')} />)

    const el = screen.getByTestId('todos')
    await expect.element(el).toBeVisible()
    expect((await el.element()).textContent).toBe('none')

    await screen.getByRole('button', { name: 'set local' }).click()
    await expect.poll(() => el.element().textContent).toBe('local')

    // still a single subscription: `setData` is local, upstream's ref is local
    expect(onValueMock).toHaveBeenCalledTimes(1)
  })
})
