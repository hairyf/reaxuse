import type { Observable } from 'rxjs'
import { of, Subject } from 'rxjs'
import { describe, expect, expectTypeOf, it, vi } from 'vitest'
import { renderHook } from 'vitest-browser-react'
import { useFrom } from '../useFrom'

/** Wait for one macrotask so the RxJS scheduler (and React) can flush. */
function flush(): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, 10))
}

describe('useFrom', () => {
  it('should be defined', () => {
    expect(useFrom).toBeTypeOf('function')
  })

  it('plain value: subscribing receives the current value immediately (BehaviorSubject seed)', async () => {
    const { result } = await renderHook(() => useFrom(0))

    const received: number[] = []
    const subscription = result.current.subscribe(value => received.push(value))

    expect(received).toEqual([0])
    subscription.unsubscribe()
  })

  it('plain value: re-emits when the value changes across renders', async () => {
    const { act, result, rerender } = await renderHook(
      ({ value }: { value: number }) => useFrom(value),
      { initialProps: { value: 1 } },
    )

    const received: number[] = []
    result.current.subscribe(value => received.push(value))
    expect(received).toEqual([1])

    await act(() => rerender({ value: 2 }))
    expect(received).toEqual([1, 2])

    await act(() => rerender({ value: 3 }))
    expect(received).toEqual([1, 2, 3])
  })

  it('keeps a stable observable identity across renders', async () => {
    const { act, result, rerender } = await renderHook(
      ({ value }: { value: number }) => useFrom(value),
      { initialProps: { value: 0 } },
    )

    const first = result.current

    await act(() => rerender({ value: 1 }))
    expect(result.current).toBe(first)

    await act(() => rerender({ value: 2 }))
    expect(result.current).toBe(first)
  })

  it('observableInput: passes of(1, 2) through rxjs from()', async () => {
    const { result } = await renderHook(() => useFrom(of(1, 2)))

    const received: number[] = []
    result.current.subscribe(value => received.push(value))

    // `of` emits synchronously: 1, 2, then completes
    expect(received).toEqual([1, 2])
  })

  it('observable-like: passes a Subject through rxjs from()', async () => {
    const subject = new Subject<number>()

    const { result } = await renderHook(() => useFrom(subject))

    const received: number[] = []
    result.current.subscribe(value => received.push(value))

    subject.next(1)
    subject.next(2)

    expect(received).toEqual([1, 2])
  })

  it('promise-like: passes a Promise through rxjs from()', async () => {
    const { result } = await renderHook(() => useFrom(Promise.resolve(42)))

    const received: number[] = []
    result.current.subscribe(value => received.push(value))

    await flush()
    expect(received).toEqual([42])
  })

  it('unmount: completes the subject — no further emissions', async () => {
    const { act, result, rerender, unmount } = await renderHook(
      ({ value }: { value: number }) => useFrom(value),
      { initialProps: { value: 0 } },
    )

    const received: number[] = []
    const completed = vi.fn()
    const subscription = result.current.subscribe({
      next: value => received.push(value),
      complete: completed,
    })
    expect(received).toEqual([0])

    await act(() => rerender({ value: 1 }))
    expect(received).toEqual([0, 1])

    await unmount()

    expect(completed).toHaveBeenCalledTimes(1)
    expect(subscription.closed).toBe(true)
    expect(received).toEqual([0, 1])
  })

  it('type-level: returns an Observable<T>', async () => {
    const { result } = await renderHook(() => useFrom(0))

    expectTypeOf(result.current).toEqualTypeOf<Observable<number>>()
  })
})
