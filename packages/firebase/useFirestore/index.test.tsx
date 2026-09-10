import type { DocumentData, DocumentReference, Firestore, Query, Unsubscribe } from 'firebase/firestore'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render, renderHook } from 'vitest-browser-react'
import { useFirestore } from '../useFirestore'

// `useFirestore` loads `firebase/firestore` through a guarded **dynamic**
// import (it must not throw at import time when `firebase` is missing), so the
// runtime module is mocked here: `onSnapshot`/`doc`/`collection` are replaced
// and no Firebase SDK code ever runs. Only the types are borrowed from the
// real typings.
const { onSnapshotMock, docMock, collectionMock, unsubscribeMock } = vi.hoisted(() => ({
  onSnapshotMock: vi.fn(),
  docMock: vi.fn(),
  collectionMock: vi.fn(),
  unsubscribeMock: vi.fn(),
}))

vi.mock('firebase/firestore', () => ({
  onSnapshot: onSnapshotMock,
  doc: docMock,
  collection: collectionMock,
}))

const dummyFirestore = {} as Firestore

/** mirror upstream's mock snapshot: `data()` returns the ref itself, or `null` for `users/invalid` */
function getMockSnapFromRef(docRef: any) {
  return {
    id: `${docRef.path}-id`,
    data: () => docRef.path === 'users/invalid' ? null : docRef,
  }
}

/** mirror upstream's `getData` (`id` is attached non-writable) */
function getData(docRef: any) {
  const data = docRef.data()
  if (data) {
    Object.defineProperty(data, 'id', {
      value: docRef.id.toString(),
      writable: false,
    })
  }
  return data
}

function fakeCollection(path: string): Query<DocumentData> {
  return collectionMock(dummyFirestore, path) as Query<DocumentData>
}

function fakeDoc(path: string): DocumentReference<DocumentData> {
  return docMock(dummyFirestore, path) as DocumentReference<DocumentData>
}

type Act = (callback: () => void | Promise<void>) => Promise<void>

/**
 * The guarded dynamic import of `firebase/firestore` resolves asynchronously —
 * settle it inside `act` so the subscription establishes (and the mock fires
 * its callback) before asserting on subscribed data.
 */
async function settleSubscription(act: Act) {
  await act(async () => {
    await vi.dynamicImportSettled()
  })
}

function Todos({ queryRef }: { queryRef: Query<{ id: string, path?: string }> }) {
  const todos = useFirestore(queryRef, [{ id: 'loading' }])
  // `id` is attached non-enumerable (upstream parity), so read it by property
  // access instead of relying on JSON.stringify to see it
  return <pre data-testid="todos">{JSON.stringify(todos.map(todo => ({ id: todo.id, path: todo.path ?? '—' })))}</pre>
}

describe('useFirestore', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    unsubscribeMock.mockReset()
    onSnapshotMock.mockImplementation((
      docRef: any,
      callbackFn: (payload: any) => void,
      errorHandler: (err: Error) => void,
    ): Unsubscribe | undefined => {
      if (docRef.path === 'users/error') {
        errorHandler(new Error('not found'))
        return
      }
      callbackFn({
        ...getMockSnapFromRef(docRef),
        docs: [getMockSnapFromRef(docRef)],
      })
      return unsubscribeMock
    })
    docMock.mockImplementation((_: Firestore, path: string) => {
      if (path.includes('//'))
        throw new Error('Invalid segment')
      return { path }
    })
    collectionMock.mockImplementation((_: Firestore, path: string) => {
      if (path.includes('//'))
        throw new Error('Invalid segment')
      return { path }
    })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('starts with the initial value, then streams query documents', async () => {
    const queryRef = fakeCollection('users')
    const { result, act } = await renderHook(() => useFirestore(queryRef))

    // before the first snapshot arrives, `data` is the initial value
    expect(result.current).toBeUndefined()

    await settleSubscription(act)

    expect(onSnapshotMock).toHaveBeenCalledTimes(1)
    expect(result.current).toEqual([getData(getMockSnapFromRef(queryRef))])
  })

  it('streams a single document with the `id` attached', async () => {
    const docRef = fakeDoc('users/userId')
    const { result, act } = await renderHook(() => useFirestore(docRef))

    await settleSubscription(act)

    expect(result.current).toEqual(getData(getMockSnapFromRef(docRef)))
    // `id` is attached non-enumerable (upstream parity) — readable, not JSON-visible
    expect((result.current as { id?: string }).id).toBe('users/userId-id')
  })

  it('resolves a deleted document to null', async () => {
    // `users/invalid` is the mock's deleted-document case: `data()` is `null`
    const docRef = fakeDoc('users/invalid')
    const { result, act } = await renderHook(() => useFirestore(docRef))

    await settleSubscription(act)

    expect(result.current).toBeNull()
  })

  it('returns the initial value when the reference is falsy (no subscription)', async () => {
    const { result } = await renderHook(() => useFirestore(false, [{ id: 'default' }]))

    expect(result.current).toEqual([{ id: 'default' }])
    expect(onSnapshotMock).not.toHaveBeenCalled()
  })

  it('resets to the initial value when the reference becomes falsy and re-subscribes when it becomes truthy', async () => {
    const queryRef = fakeCollection('users/userId/posts')
    const { result, rerender, act } = await renderHook(
      ({ ref }: { ref: Query<DocumentData> | false } = { ref: false }) => useFirestore(ref, [{ id: 'default' }]),
      { initialProps: { ref: false } },
    )

    expect(result.current).toEqual([{ id: 'default' }])

    await rerender({ ref: queryRef })
    await settleSubscription(act)
    expect(result.current).toEqual([getData(getMockSnapFromRef(queryRef))])

    await rerender({ ref: false })
    expect(unsubscribeMock).toHaveBeenCalledTimes(1)
    expect(result.current).toEqual([{ id: 'default' }])
  })

  it('re-subscribes when the reference changes and unsubscribes the previous listener', async () => {
    const first = fakeCollection('posts')
    const second = fakeCollection('todos')
    const { result, rerender, act } = await renderHook(
      ({ ref }: { ref: Query<DocumentData> } = { ref: first }) => useFirestore(ref),
      { initialProps: { ref: first } },
    )

    await settleSubscription(act)
    expect(onSnapshotMock).toHaveBeenCalledTimes(1)
    expect(result.current).toEqual([getData(getMockSnapFromRef(first))])

    await rerender({ ref: second })
    await settleSubscription(act)

    expect(onSnapshotMock).toHaveBeenCalledTimes(2)
    expect(onSnapshotMock.mock.calls[1][0]).toBe(second)
    expect(unsubscribeMock).toHaveBeenCalledTimes(1)
    expect(result.current).toEqual([getData(getMockSnapFromRef(second))])

    await rerender({ ref: second })
    expect(onSnapshotMock).toHaveBeenCalledTimes(2)
  })

  it('routes subscription errors to a custom errorHandler', async () => {
    const errorHandler = vi.fn<(err: Error) => void>()
    const docRef = fakeDoc('users/error')
    const { act } = await renderHook(() => useFirestore(docRef, undefined, { errorHandler }))

    await settleSubscription(act)

    expect(errorHandler).toHaveBeenCalledTimes(1)
    expect(errorHandler).toHaveBeenCalledWith(new Error('not found'))
  })

  it('logs through console.error by default', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    try {
      const docRef = fakeDoc('users/error')
      const { act } = await renderHook(() => useFirestore(docRef))

      await settleSubscription(act)

      expect(consoleError).toHaveBeenCalledWith(new Error('not found'))
    }
    finally {
      consoleError.mockRestore()
    }
  })

  it('uses the latest errorHandler without re-subscribing', async () => {
    const first = vi.fn<(err: Error) => void>()
    const second = vi.fn<(err: Error) => void>()
    const docRef = fakeDoc('users/error')

    const { rerender, act } = await renderHook(
      ({ errorHandler }: { errorHandler: (err: Error) => void } = { errorHandler: first }) => useFirestore(docRef, undefined, { errorHandler }),
      { initialProps: { errorHandler: first } },
    )

    await settleSubscription(act)
    expect(onSnapshotMock).toHaveBeenCalledTimes(1)
    expect(first).toHaveBeenCalledTimes(1)

    await rerender({ errorHandler: second })
    expect(onSnapshotMock).toHaveBeenCalledTimes(1)
    expect(second).not.toHaveBeenCalled()

    // the stored error callback reads the latest handler from a ref
    const errorCallback = onSnapshotMock.mock.calls[0][2] as (err: Error) => void
    errorCallback(new Error('later'))
    expect(second).toHaveBeenCalledWith(new Error('later'))
  })

  it('unsubscribes on unmount by default (autoDispose: true)', async () => {
    // hoisted out of the render callback: a fresh reference identity per render
    // would re-subscribe (the effect is keyed on `maybeDocRef`)
    const queryRef = fakeCollection('users')
    const { unmount, act } = await renderHook(() => useFirestore(queryRef))

    await settleSubscription(act)
    expect(unsubscribeMock).not.toHaveBeenCalled()

    await unmount()
    expect(unsubscribeMock).toHaveBeenCalledTimes(1)
  })

  it('keeps the subscription when autoDispose is false (upstream parity, leaks)', async () => {
    const queryRef = fakeCollection('users')
    const { unmount, act } = await renderHook(() => useFirestore(queryRef, undefined, { autoDispose: false }))

    await settleSubscription(act)

    await unmount()
    expect(unsubscribeMock).not.toHaveBeenCalled()
  })

  it('delays the unsubscribe by autoDispose ms after unmount', async () => {
    const queryRef = fakeCollection('users')
    const { unmount, act } = await renderHook(() => useFirestore(queryRef, undefined, { autoDispose: 20 }))

    await settleSubscription(act)
    expect(onSnapshotMock).toHaveBeenCalledTimes(1)

    await unmount()
    expect(unsubscribeMock).not.toHaveBeenCalled()

    await new Promise(resolve => setTimeout(resolve, 80))
    expect(unsubscribeMock).toHaveBeenCalledTimes(1)
  })

  it('drives a component from the initial value to streamed query data', async () => {
    const queryRef = fakeCollection('todos')
    const screen = await render(<Todos queryRef={queryRef} />)

    const el = screen.getByTestId('todos')
    // the mock snapshot data is the ref itself (`{ path: 'todos' }`) with the
    // non-writable `id` attached — polled, so the dynamic import settling is
    // transparent to the component; the matcher compares the full text
    // (`toHaveTextContent` is an exact match), and the initial-value render is
    // covered by the renderHook tests
    await expect.element(el).toHaveTextContent('[{"id":"todos-id","path":"todos"}]')
  })
})
